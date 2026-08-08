/* ══ LE BLOC `build` — LES CHOIX, LES OVERRIDES, ET LA DÉRIVATION ══════
   Lot 9-bloc-build. Deuxième maillon du chemin critique du M2 :
   `layers` → `build` → MCP v0.

   CE QUE LE BLOC POSSÈDE
   - ses VERBES : `choose`, `set`, `override`, `rebuild`, `validate`.
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
   dériveur — garde structurel dans `tests/build-block.test.mjs`. */

import { BuildError } from "./errors.mjs";
import { derive, ABILITY_KEYS } from "./derive.mjs";
import { applyOverride, parseChoicePath, parseOverridePath } from "./paths.mjs";
import { diffResolved } from "./diff.mjs";
import { platformNow } from "./clock.mjs";
import { charInvariantViolations } from "../schemas/invariants.mjs";

const ABILITY_SET = new Set(ABILITY_KEYS);

function fail(what) {
  throw new BuildError(`fhpc/build: ${what}`);
}

function layerKey(layer) {
  return `${layer.id}@${layer.version}#${layer.hash}`;
}

export function createBuild({ bus, dispatch, now = platformNow } = {}) {
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
        previous: document.resolved
      });

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
        underived: outcome.underived,
        unconsumed: outcome.unconsumed,
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
      const violations = charInvariantViolations(document);
      const warnings = [];

      /* Chaque `ref` doit désigner un record que la pile porte. Un ref mort
         est la forme la plus discrète du « personnage construit avec une
         couche qui n'est plus là ». */
      for (const choice of document.build.choices) {
        if (!choice || !choice.ref) continue;
        let view = null;
        try { view = query({ kind: choice.ref.kind, id: choice.ref.id }); }
        catch (error) { violations.push(`choix « ${choice.path} » : ${error.message}`); continue; }
        if (!view) violations.push(`choix « ${choice.path} » : la pile ne porte aucun ${choice.ref.kind} « ${choice.ref.id} ».`);
      }

      let outcome = null;
      try {
        outcome = derive({
          query,
          stack: document.build.layers,
          choices: document.build.choices,
          at: now(),
          units: document.units,
          previous: document.resolved
        });
      } catch (error) {
        violations.push(error.message);
      }

      if (outcome) {
        /* Le COMPTE des compétences choisies. Une source qui déclare
           `{count: 2}` et n'en reçoit qu'une donne une fiche à qui il manque
           une maîtrise, et rien ne le crie. */
        for (const [root, declaration] of Object.entries(outcome.grants.declarations)) {
          if (!declaration || !Number.isInteger(declaration.count)) continue;
          const answers = outcome.grants.chosenBy[root] || [];
          if (answers.length !== declaration.count) {
            violations.push(`« ${root} » fait choisir ${declaration.count} compétence(s) et les choix en désignent ` +
              `${answers.length} (${answers.join(", ") || "aucune"}).`);
          }
        }

        /* Les augmentations d'arrière-plan ne se posent que sur les
           caractéristiques que l'arrière-plan nomme (contrat §3,
           `ability_keys`). */
        const backgroundChoice = document.build.choices.find((choice) => choice && choice.path === "background");
        if (backgroundChoice && backgroundChoice.ref) {
          const view = query({ kind: backgroundChoice.ref.kind, id: backgroundChoice.ref.id });
          const keys = view && view.record.data && view.record.data.ability_keys;
          if (Array.isArray(keys)) {
            /* ARBITRAGE DU 2026-08-08 : une clef de caractéristique hors des
               six canoniques est une faute de contenu, dans toutes les langues. */
            for (const key of keys) {
              if (!ABILITY_SET.has(key)) {
                violations.push(`l'arrière-plan « ${view.id} » porte \`ability_keys\` = ${JSON.stringify(key)}, ` +
                  `qui n'est pas une clef de caractéristique (${ABILITY_KEYS.join(", ")}).`);
              }
            }
            const allowed = new Set(keys);
            for (const choice of document.build.choices) {
              const match = choice && /^[a-z][a-zA-Z0-9]*\.boost\.([a-z]{3})$/.exec(choice.path || "");
              if (!match || !ABILITY_SET.has(match[1])) continue;
              if (!allowed.has(match[1])) {
                violations.push(`le choix « ${choice.path} » augmente une caractéristique que l'arrière-plan ` +
                  `« ${view.id} » ne nomme pas (il nomme : ${keys.join(", ")}).`);
              }
            }
          } else {
            warnings.push(`l'arrière-plan « ${backgroundChoice.ref.id} » ne porte pas \`ability_keys\` (contrat §3) : ` +
              "la légalité des augmentations n'a pas pu être vérifiée.");
          }
          const featId = view && view.record.data && view.record.data.feat_id;
          const featChoice = document.build.choices.find((choice) => choice && choice.path === "background.feat");
          if (typeof featId === "string" && featChoice && featChoice.ref && featChoice.ref.id !== featId) {
            violations.push(`le choix « background.feat » désigne « ${featChoice.ref.id} », alors que l'arrière-plan ` +
              `« ${view.id} » accorde « ${featId} ».`);
          }
        }

        for (const path of outcome.unconsumed) {
          warnings.push(`le choix « ${path} » n'a été consommé par aucune règle de la dérivation — ` +
            "il ne change rien à la fiche.");
        }
        for (const entry of outcome.underived) {
          warnings.push(`non dérivé — ${entry.field} : ${entry.reason}`);
        }
      }

      return { ok: violations.length === 0, violations, warnings };
    }
  };

  return { name: "build", verbs };
}
