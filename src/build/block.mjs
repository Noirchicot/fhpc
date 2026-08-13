/* ══ LE BLOC `build` — LES CHOIX, LES OVERRIDES, ET LA DÉRIVATION ══════
   Lot 9-bloc-build. Deuxième maillon du chemin critique du M2 :
   `layers` → `build` → MCP v0.

   CE QUE LE BLOC POSSÈDE
   - ses VERBES : `choose`, `set`, `override`, `clear`, `rebuild`, `validate`.
   - son ÉTAT : la tranche `build` du personnage OUVERT, et lui seul écrit
     `resolved`.
   - son ÉVÉNEMENT : `char-rebuilt`, avec son diff.

   ── `choose` ET `set` SONT LE MÊME GESTE, COUPÉ OÙ LE SCHÉMA LE COUPE ───
   `$defs/build.choices` exige « `ref` (un record de couche) OU `value` (un
   scalaire), jamais les deux, jamais aucun ». Les deux verbes sont donc les
   deux moitiés de cette règle : `choose` pose un RECORD, `set` pose un
   SCALAIRE. Un seul verbe à deux formes aurait rendu « jamais les deux »
   vérifiable seulement à l'exécution ; deux verbes le rendent vrai par
   construction. ⚠️ Choix de forme de ce lot, à ratifier (question 4).

   ── LE PERSONNAGE OUVERT ────────────────────────────────────────────────
   Au M2 le bloc `doc` n'existe pas : personne ne possède le stockage. Le bloc
   reçoit donc un document EN MÉMOIRE (`{document}`) et le garde ouvert ; les
   appels suivants s'en passent. Il n'y a pas de verbe `open` — le kickoff
   n'en donne pas, et en fabriquer un préempterait la tranche du bloc `doc`
   (loi §0.6). Tout ce qui entre et tout ce qui sort est CLONÉ : l'appelant ne
   tient jamais l'objet du bloc, et le bloc ne tient jamais le sien.

   ── LE BLOC NE LIT PAS `src/layers/` ────────────────────────────────────
   `dispatch("layers.query", …)` est son SEUL chemin de lecture du contenu, et
   `dispatch("layers.stack")` son seul moyen de savoir sur quoi il plie. Un
   import direct ferait de la pile une dépendance de compilation du
   dériveur — garde structurel dans `tests/build-block.test.mjs`.

   ⚠️ REWRITTEN 2026-08-08 (lot 19) — UNE TROISIÈME ROUTE, ET UNE SEULE :
   `dispatch("layers.flags")`. Une statistique dérivée est produite par un
   module activé par un DRAPEAU DE COUCHE (décision Q4) ; sans lire les
   drapeaux, le bloc ne peut pas savoir quel module la pile réclame, et il
   n'aurait le choix qu'entre tout allumer (loi §0.12 rompue) ou tout
   éteindre. Le verbe existe depuis le lot B et il est au contrat `layers` ;
   ce qui change, c'est que le bloc `build` s'en sert. */

import { BuildError } from "./errors.mjs";
import { derive, ABILITY_KEYS } from "./derive.mjs";
import { applyOverride, parseChoicePath, parseOverridePath } from "./paths.mjs";
import { diffResolved } from "./diff.mjs";
import { platformNow } from "./clock.mjs";
import { buildViolation, buildViolationList, statSumViolations } from "./validate.mjs";
import { charInvariantViolations } from "../schemas/invariants.mjs";
import { renderBuildViolation } from "../labels.mjs";
import { projectDecisions } from "./decisions.mjs";

const ABILITY_SET = new Set(ABILITY_KEYS);

function fail(what) {
  throw new BuildError(`fhpc/build: ${what}`);
}

function layerKey(layer) {
  return `${layer.id}@${layer.version}#${layer.hash}`;
}

/* ── LES MODULES DE STATISTIQUE, INJECTÉS ────────────────────────────
   Même partage qu'au bloc `play` avec ses couches (loi §0.12) : AUCUN module
   n'est monté par défaut. `createBuild()` sans `modules` est le pli SRD nu, et
   `resolved.stats` y est vide — un personnage SRD pur le traverse de bout en
   bout sans qu'une seule ligne du bloc cite une mécanique maison. Monter un
   module est un geste explicite de l'appelant :

     import { createFhDestinyStat } from "../modules/fh/destiny-stat.mjs";
     createBuild({ bus, dispatch, modules: [createFhDestinyStat()] });

   Le bloc ne les appelle pas non plus lui-même : il les passe au pli, qui
   n'active que ceux dont le drapeau est levé par la pile montée. */
export function createBuild({ bus, dispatch, now = platformNow, modules = [] } = {}) {
  if (!bus || typeof bus.emit !== "function" || typeof bus.on !== "function") {
    fail("createBuild needs a bus — une fiche qui change sans l'annoncer est un changement que personne ne peut " +
      "suivre, et `char-rebuilt` est le seul moyen pour les autres blocs de savoir.");
  }
  if (typeof dispatch !== "function") {
    fail("createBuild needs a dispatch — le bloc lit le contenu des couches par `layers.query` et rien d'autre. " +
      "Un import direct de `src/layers/` ferait de la pile une dépendance de compilation du dériveur.");
  }

  /* L'état privé. Aucune de ces variables ne sort d'ici autrement que par un
     clone rendu par un verbe. */
  let open = null;
  let lastShadowed = null;

  /* Le `shadowed` d'une pile n'appartient pas à ce bloc : il est RAPPORTÉ par
     `layers-changed` (arbitrage n°2 de contracts/layers.md), et l'architecte a
     posé sur ce lot l'obligation de le remonter dans `rebuild` plutôt que de
     l'avaler. On s'abonne, on ne va pas le chercher. */
  bus.on("layers-changed", (event) => {
    lastShadowed = Array.isArray(event.shadowed) ? event.shadowed.slice() : [];
  });

  const query = (payload) => dispatch("layers.query", payload);

  function adopt(document, verb) {
    if (!document || typeof document !== "object") {
      fail(`${verb} : \`document\` n'est pas un objet — le bloc reçoit et rend des documents en mémoire.`);
    }
    const copy = structuredClone(document);
    const build = copy.build;
    if (!build || typeof build !== "object") {
      fail(`${verb} : le document n'a pas d'étage \`build\` — un document fh-char/1 porte toujours ses deux étages.`);
    }
    for (const field of ["layers", "choices", "overrides"]) {
      if (!Array.isArray(build[field])) {
        fail(`${verb} : \`build.${field}\` n'est pas une liste — le schéma fh-char/1 l'exige.`);
      }
    }
    return copy;
  }

  function current(payload, verb) {
    const options = payload || {};
    if (options.document !== undefined) open = adopt(options.document, verb);
    if (!open) {
      fail(`${verb} : aucun personnage ouvert. Passe \`{document}\` — au M2 le bloc \`doc\` n'existe pas, ` +
        "et lire un fichier appartient à qui possède le stockage.");
    }
    return open;
  }

  /* Une décision REMPLACE la précédente sur le même chemin. Empiler serait
     fabriquer l'ambiguïté que `charInvariantViolations` refuse déjà.
     Le chemin est vérifié À L'ENTRÉE : un chemin mal formé accepté ici
     ressortirait à la reconstruction, loin du geste qui l'a écrit. */
  function place(list, entry, label, check) {
    check(entry.path);
    const index = list.findIndex((item) => item && item.path === entry.path);
    if (index < 0) list.push(entry);
    else list[index] = entry;
    return { path: entry.path, replaced: index >= 0, kind: label };
  }

  /* Le contraire de `place` : retire au lieu de poser. Même garde À L'ENTRÉE
     — un chemin mal formé jette ici, jamais à la reconstruction — et même
     forme de rapport : `place` NOMME s'il a remplacé ou posé (`replaced`),
     `clear` NOMME s'il a trouvé quelque chose à retirer (`removed`). Un
     chemin absent n'est pas une faute (le lot 26 l'a tranché) : une
     interface qui nettoie plusieurs chemins d'un coup, ou un MJ qui relève
     un override déjà relevé, n'a rien à se faire reprocher. */
  function unplace(list, path, label, check) {
    check(path);
    const index = list.findIndex((item) => item && item.path === path);
    if (index >= 0) list.splice(index, 1);
    return { path, removed: index >= 0, kind: label };
  }

  const verbs = {
    /** Pose un RECORD sur un point de décision. */
    choose(payload) {
      const options = payload || {};
      const document = current(options, "choose");
      const { path, ref, label } = options;
      if (!ref || typeof ref !== "object" || typeof ref.kind !== "string" || typeof ref.id !== "string") {
        fail("choose attend `{path, ref:{kind, id}}` — pour un scalaire, c'est `set`. " +
          "Les deux verbes sont les deux moitiés de « `ref` OU `value`, jamais les deux ».");
      }
      if (options.value !== undefined) {
        fail("choose a reçu `value` en plus de `ref` — le schéma en exige exactement un.");
      }
      const entry = { path, ref: { kind: ref.kind, id: ref.id } };
      if (typeof label === "string") entry.label = label;
      const placed = place(document.build.choices, entry, "ref", parseChoicePath);
      return { document: structuredClone(document), choice: placed };
    },

    /** Pose un SCALAIRE sur un point de décision. */
    set(payload) {
      const options = payload || {};
      const document = current(options, "set");
      const { path, value, label } = options;
      if (value === undefined) {
        fail("set attend `{path, value}` — pour un record, c'est `choose`. Un choix vide est un rejet, " +
          "pas un défaut silencieux.");
      }
      if (options.ref !== undefined) fail("set a reçu `ref` en plus de `value` — le schéma en exige exactement un.");
      if (value !== null && typeof value === "object") {
        fail("set n'accepte qu'un scalaire — « une structure serait une règle déguisée » ($defs/build.choices).");
      }
      const entry = { path, value };
      if (typeof label === "string") entry.label = label;
      const placed = place(document.build.choices, entry, "value", parseChoicePath);
      return { document: structuredClone(document), choice: placed };
    },

    /** La parole du MJ. Appliqué EN DERNIER, il survit à toute reconstruction. */
    override(payload) {
      const options = payload || {};
      const document = current(options, "override");
      const { path, value, note, by } = options;
      if (value === undefined) fail("override attend `{path, value, by}` — un override sans valeur ne dit rien.");
      if (by !== "player" && by !== "gm") {
        fail(`override attend \`by\` valant "player" ou "gm" (reçu ${JSON.stringify(by)}) — on sait toujours ` +
          "qui a écarté la règle, sinon l'écart règles↔décision n'est plus affichable.");
      }
      const entry = { path, value, by };
      if (typeof note === "string") entry.note = note;
      const placed = place(document.build.overrides, entry, "override", parseOverridePath);
      return { document: structuredClone(document), override: placed };
    },

    /** Retire une décision. Le sixième verbe : sans lui, une décision posée
     *  ou un override levé par erreur ne pouvait plus être ENLEVÉ, seulement
     *  remplacé — un joueur ne pouvait pas changer d'avis. `kind` NOMME sa
     *  cible : jamais les deux collections à l'aveugle. */
    clear(payload) {
      const options = payload || {};
      const document = current(options, "clear");
      const { path, kind } = options;
      if (kind !== "choice" && kind !== "override") {
        fail(`clear attend \`{path, kind}\` avec \`kind\` valant "choice" ou "override" (reçu ${JSON.stringify(kind)}) — ` +
          "le geste doit nommer sa cible, jamais retirer d'une collection à l'aveugle.");
      }
      const list = kind === "choice" ? document.build.choices : document.build.overrides;
      const check = kind === "choice" ? parseChoicePath : parseOverridePath;
      const cleared = unplace(list, path, kind, check);
      return { document: structuredClone(document), cleared };
    },

    /** LE SEUL CHEMIN D'ÉCRITURE DE `resolved`. */
    rebuild(payload) {
      const options = payload || {};
      const document = current(options, "rebuild");
      const at = now();
      const warnings = [];

      /* La pile MONTÉE, telle que le bloc `layers` la manifeste. Seules les
         couches actives comptent : une couche éteinte ne nourrit rien. */
      const mounted = dispatch("layers.stack")
        .filter((layer) => layer.enabled)
        .map((layer) => {
          const ref = { id: layer.id, version: layer.version, hash: layer.hash };
          if (typeof layer.name === "string") ref.name = layer.name;
          return ref;
        });

      /* ⚠️ UNE RECONSTRUCTION NE MODIFIE JAMAIS `build` — sauf ici, et une
         seule fois : un document dont `build.layers` est VIDE n'a jamais été
         construit, et adopter la pile montée n'écrase aucune décision. Dès
         qu'il y a une pile déclarée, elle fait FOI et un écart JETTE : « la
         couche a changé sous le personnage » ($defs/layerRef). */
      if (document.build.layers.length === 0) {
        if (mounted.length === 0) {
          fail("rebuild : aucune couche montée et aucune couche déclarée — il n'y a rien à plier.");
        }
        document.build.layers = structuredClone(mounted);
      } else {
        const declared = document.build.layers.map(layerKey).join(" | ");
        const active = mounted.map(layerKey).join(" | ");
        if (declared !== active) {
          fail("rebuild : la pile montée ne correspond pas à `build.layers`. " +
            `Le personnage déclare « ${declared} », la pile active porte « ${active} ». ` +
            "Une couche a changé, disparu ou été montée dans un autre ordre sous le personnage : " +
            "c'est une dégradation à afficher, pas une dérivation à tenter.");
        }
      }

      if (lastShadowed === null) {
        warnings.push("aucun `layers-changed` n'a été reçu depuis la construction du bloc : les recouvrements de " +
          "records (`shadowed`) de la pile actuelle ne sont pas connus de ce rebuild.");
      }

      const outcome = derive({
        query,
        stack: document.build.layers,
        choices: document.build.choices,
        at,
        units: document.units,
        previous: document.resolved,
        flags: dispatch("layers.flags"),
        modules
      });

      /* ⚠️ LE GARDE DE LA SOMME MORD AVANT LES OVERRIDES. Un module qui
         publierait un `value` que son propre détail contredit écrirait un
         chiffre faux qui a l'air juste, et le schéma ne sait pas additionner
         ($defs/resolved.stats[].value). Le refus est donc bruyant, ICI, à
         l'endroit exact où le Score vient d'être fabriqué. Après les
         overrides, ce n'est plus le même sujet : la parole du MJ bat le JSON,
         et c'est `validate` qui la NOMME sans la jeter. */
      const sums = statSumViolations(outcome.resolved);
      if (sums.length > 0) {
        fail(`rebuild : une statistique dérivée ne vaut pas la somme de son détail :\n- ${sums.map(renderBuildViolation).join("\n- ")}`);
      }

      /* LES OVERRIDES EN DERNIER. C'est l'invariant n°2 de l'architecture, et
         c'est le seul endroit du dépôt où il est tenu. */
      const resolved = outcome.resolved;
      const applied = [];
      for (const override of document.build.overrides) {
        if (!override || typeof override !== "object") fail("build.overrides contient une entrée qui n'est pas un override.");
        applied.push(applyOverride(resolved, override.path, structuredClone(override.value)));
      }

      const before = document.resolved && typeof document.resolved === "object" ? document.resolved : {};

      /* UNE PREMIÈRE CONSTRUCTION PART EN PLEINE FORME ; UNE RECONSTRUCTION NE
         SOIGNE PERSONNE. `hpCurrent` est de l'état de jeu : la dérivation le
         REPREND de la tranche précédente quand elle existe. Quand elle n'existe
         pas, il suit `hpMax` — et il doit le suivre APRÈS les overrides, sinon
         un MJ qui accorde un point de vie de plus créerait un personnage neuf
         déjà blessé d'un point. */
      if (before.vitals === undefined && resolved.vitals && Number.isInteger(resolved.vitals.hpMax)) {
        resolved.vitals.hpCurrent = resolved.vitals.hpMax;
      }

      const diff = diffResolved(before, resolved);
      document.resolved = resolved;
      document.modified = at;

      /* L'invariant `resolved.derivation.stack === build.layers` est tenu par
         construction — et vérifié quand même : il a mordu tout seul sur
         l'architecte, et un invariant qu'on croit tenu est un invariant qu'on
         ne teste plus. */
      const violations = charInvariantViolations(document);
      if (violations.length > 0) {
        fail(`rebuild a produit un document qui viole ses propres invariants :\n- ${violations.join("\n- ")}`);
      }

      const result = {
        document: structuredClone(document),
        resolved: structuredClone(resolved),
        decisions: projectDecisions({ query, choices: document.build.choices }),
        underived: outcome.underived,
        unconsumed: outcome.unconsumed,
        /* LOT 34 — ce qu'un module a jugé illégal SANS jeter (canal générique
           `outcome.violations`, lot 27) : `{key, params, path}`, jamais une
           phrase. Vide quand aucun module n'en a rendu. */
        moduleViolations: Array.isArray(outcome.violations) ? outcome.violations : [],
        overridesApplied: applied,
        shadowed: lastShadowed === null ? [] : lastShadowed.slice(),
        warnings,
        diff
      };
      bus.emit("char-rebuilt", {
        id: document.id,
        at,
        diff,
        underived: result.underived,
        unconsumed: result.unconsumed,
        shadowed: result.shadowed,
        stack: structuredClone(document.build.layers)
      });
      return result;
    },

    /** Dit ce qui cloche SANS rien écrire. Un refus est un résultat. */
    validate(payload) {
      const options = payload || {};
      const document = current(options, "validate");
      const reported = buildViolationList();
      reported.addMany(charInvariantViolations(document).map((message) =>
        buildViolation("document.invariant-violated", { message })));
      const warnings = [];

      /* L'INVARIANT QUE LE SCHÉMA ÉCRIT SANS SAVOIR L'EXÉCUTER (lot 19).
         `$defs/resolved.stats[].value` dit « `value` est la somme des
         `breakdown[].value` » puis reconnaît que JSON Schema ne sait pas
         additionner, et met l'invariant à la charge de ce verbe. Il est jugé
         ici sur la tranche que le personnage JOUE — overrides compris : un MJ
         qui écrase un total sans poser le terme qui le justifie l'apprend,
         plutôt que de le découvrir à la table. */
      reported.addMany(statSumViolations(document.resolved));

      /* Chaque `ref` doit désigner un record que la pile porte. Un ref mort
         est la forme la plus discrète du « personnage construit avec une
         couche qui n'est plus là ». */
      for (const choice of document.build.choices) {
        if (!choice || !choice.ref) continue;
        let view = null;
        try { view = query({ kind: choice.ref.kind, id: choice.ref.id }); }
        catch (error) {
          reported.add(buildViolation("choice.query-threw", { path: choice.path, message: error.message }, choice.path));
          continue;
        }
        if (!view) {
          reported.add(buildViolation("choice.ref-missing", {
            path: choice.path, kind: choice.ref.kind, id: choice.ref.id
          }, choice.path));
        }
      }

      /* LOT 37 — LES VERROUS DU CARNET DE DÉCISIONS, ENFIN LUS ICI. `rebuild`
         projette déjà ce carnet (`decisions: projectDecisions(...)`, plus
         haut) ; ce verbe-ci ne le lisait pas — un plan en faute (le budget
         captif d'espèce dépassé, une option hors catalogue, un palier
         illisible) restait invisible à la sortie de création, alors que
         `decisions.mjs` le NOMME depuis le lot 27/34. Un plan simplement
         INCOMPLET (`answered < expected`, sans verrou) N'A PAS de `.lock` —
         `finish()` ne le pose que sur un plan ou une étape en FAUTE (contrat
         §2b de la commande `37-pool-garde`) : un personnage encore en cours
         de répartition reste donc valide, exactement comme avant ce lot.

         LOT 43, §3e-bis — DÉDUPLIQUÉ PAR EMPREINTE. `multiPlan` (`class.skills`,
         `species.skills`) publie le MÊME défaut sur deux chemins quand un
         candidat devient illégal : le plan du GROUPE porte un verrou qui NOMME
         le créneau fautif (pour que le groupe entier se montre `locked`, pas
         `pending` — la suite l'exige), et ce créneau porte le SIEN, construit
         séparément mais identique {clef, chemin, params}. Un choix devenu
         illégal doit produire UN refus, pas deux : l'empreinte (clef + chemin +
         params sérialisés) est comparée AVANT `add`, et un doublon exact est
         sauté — jamais un doublon qui ne se ressemble qu'à moitié, qui resterait
         deux refus distincts pour deux fautes distinctes. */
      const seenLocks = new Set();
      for (const entry of projectDecisions({ query, choices: document.build.choices })) {
        if (!entry || !entry.lock) continue;
        const fingerprint = `${entry.lock.key}\u0000${entry.lock.path || ""}\u0000${JSON.stringify(entry.lock.params)}`;
        if (seenLocks.has(fingerprint)) continue;
        seenLocks.add(fingerprint);
        reported.add(entry.lock);
      }

      let outcome = null;
      try {
        outcome = derive({
          query,
          stack: document.build.layers,
          choices: document.build.choices,
          at: now(),
          units: document.units,
          previous: document.resolved,
          flags: dispatch("layers.flags"),
          modules
        });
      } catch (error) {
        reported.add(buildViolation("derive.threw", { message: error.message }));
      }

      if (outcome) {
        /* Le COMPTE des compétences choisies. Une source qui déclare
           `{count: 2}` et n'en reçoit qu'une donne une fiche à qui il manque
           une maîtrise, et rien ne le crie. */
        for (const [root, declaration] of Object.entries(outcome.grants.declarations)) {
          if (!declaration || !Number.isInteger(declaration.count)) continue;
          const answers = outcome.grants.chosenBy[root] || [];
          if (answers.length !== declaration.count) {
            reported.add(buildViolation("skill-grant.count-mismatch", {
              root, declared: declaration.count, actual: answers.length, answers: answers.join(", ") || "aucune"
            }, root));
          }
        }

        /* LOT 52, DETTE B (commande §2, mesuré par l'architecte) — LA MOITIÉ
           « CHOIX DU JOUEUR » DE CE BLOC A DISPARU D'ICI, PAS DU CHANTIER.
           Mesuré sur le fichier enfin lisible au grep (§0 de la commande) :
           ce bloc recalculait `background.boost-disallowed` INDÉPENDAMMENT
           de `decisions.mjs::backgroundBoostPlan`, qui produit déjà EXACTEMENT
           le même refus (même clef, mêmes params) pour tout document où un
           `background` explicitement choisi porte `ability_keys` — et cette
           production-là est déjà lue et ajoutée à `reported` plus haut (la
           boucle `projectDecisions`, quelques lignes au-dessus). Mesuré sur
           le vrai pli, sans FH : un Magicien SRD choisissant l'arrière-plan
           Sage puis boostant `str` (hors `con, int, wis`) rendait bien DEUX
           violations `background.boost-disallowed` — un doublon EXACT, clef
           et params identiques, jamais dédupliqué (le dédoublonnement par
           empreinte, plus haut, ne porte QUE sur les verrous DE
           `projectDecisions` entre eux ; il ne voit jamais ce second calcul,
           qui les rejoignait par un `reported.add` séparé). `decisions.mjs`
           gère aussi le cas `ability_keys` ABSENT (repli sur les six clefs
           canoniques, contrat §1c, lot 43) — que cette copie ignorait
           entièrement, sans même un refus : elle se contentait d'avertir.
           `decisions.mjs` est donc la source UNIQUE désormais.

           `background.ability-key-invalid`, lui, RESTE : ce n'est pas un
           choix du joueur, c'est une faute de CONTENU (le record lui-même
           nomme une clef hors des six canoniques), et `decisions.mjs` n'a
           aucun équivalent — retirer ce garde rendrait un contenu cassé
           muet. */
        const backgroundChoice = document.build.choices.find((choice) => choice && choice.path === "background");
        if (backgroundChoice && backgroundChoice.ref) {
          const view = query({ kind: backgroundChoice.ref.kind, id: backgroundChoice.ref.id });
          const keys = view && view.record.data && view.record.data.ability_keys;
          if (Array.isArray(keys)) {
            /* ARBITRAGE DU 2026-08-08 : une clef de caractéristique hors des
               six canoniques est une faute de contenu, dans toutes les langues. */
            for (const key of keys) {
              if (!ABILITY_SET.has(key)) {
                reported.add(buildViolation("background.ability-key-invalid", {
                  backgroundId: view.id, key: JSON.stringify(key), abilityKeys: ABILITY_KEYS.join(", ")
                }));
              }
            }
          } else {
            warnings.push(`l'arrière-plan « ${backgroundChoice.ref.id} » ne porte pas \`ability_keys\` (contrat §3) : ` +
              "la légalité des augmentations n'a pas pu être vérifiée.");
          }
          /* LOT 43, §1b/§3d — RETIRÉ : `background.feat` et son refus
             `background.feat-mismatch`. Un `feat_id` imposé n'est plus jugé
             ici contre un chemin de choix que personne ne consommait — voir
             `decisions.mjs` (`backgroundFeatPlan`), qui traite `feat_id` sur
             le patron déjà en place pour `tool_id` (`backgroundToolPlan`) :
             une valeur du RECORD, jamais un choix à comparer. */
        }

        for (const path of outcome.unconsumed) {
          warnings.push(`le choix « ${path} » n'a été consommé par aucune règle de la dérivation — ` +
            "il ne change rien à la fiche.");
        }
        /* LOT 41 — `entry.reason` n'existe plus (`{field, key, params}`). Ce
           fichier est `src/build/` : il ne peut PAS savoir si l'entrée vient
           de `derive.mjs` (paquet générique) ou d'un module FH (paquet FH),
           et §0.12 lui interdit d'importer le second pour trancher. C'est
           exactement ce que le `toString` non énumérable (lot 27, repris ici)
           existe pour résoudre : CHAQUE entrée porte déjà le rendu qui va
           avec sa propre source, liée au moment où elle a été construite —
           la coercition de chaîne `${entry}` suffit, sans jamais nommer
           quel paquet a parlé. */
        for (const entry of outcome.underived) {
          warnings.push(`non dérivé — ${entry.field} : ${entry}`);
        }
        /* LOT 34 — CE QU'UN MODULE A JUGÉ ILLÉGAL SANS JETER (canal générique
           `outcome.violations`). Déjà `{key, params, path?}` : `reported` les
           accepte tel quel. */
        if (Array.isArray(outcome.violations)) reported.addMany(outcome.violations);
      }

      const violations = reported.values();
      return { ok: violations.length === 0, violations, warnings };
    }
  };

  return { name: "build", verbs };
}
