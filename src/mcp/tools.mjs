import { renderBuildViolation } from "../labels.mjs";

/* ══ LE CATALOGUE D'OUTILS — ET RIEN QUE LE CATALOGUE ══════════════════
   Lot 10-mcp-v0.

   ── LE NOM D'UN OUTIL EST SA ROUTE ─────────────────────────────────────
   `build.choose` l'outil appelle `dispatch("build.choose", …)`. Ce n'est pas
   de la paresse, c'est le seul choix de nommage qui n'INVENTE RIEN (loi
   §0.10) : le kickoff, `ARCHITECTURE.md` et les deux contrats de bloc
   nomment déjà ces verbes, et un deuxième vocabulaire (`mount_layer`,
   `pick`, `apply`…) serait une table de correspondance à tenir à jour, donc
   une table qui divergera. La spécification MCP autorise le point dans un nom
   d'outil et en donne l'exemple (`admin.tools.list`).

   Une SEULE exception, et elle porte le nom du bloc qui la fabrique :
   `mcp.document`. Elle ne correspond à aucun verbe parce qu'elle rend le
   document que l'ADAPTATEUR tient en mémoire, ce qu'aucun bloc ne peut faire à
   sa place. Le préfixe `mcp.` dit exactement ça, et le lot 10 avait raison de
   le choisir : il ne se confond pas avec les verbes du bloc `doc`, arrivés
   depuis et routés ici sous leurs propres noms.

   ⚠️ **CE QUI A CHANGÉ LE 2026-08-08** (câblage MCP → `doc`, architecte). Le
   lot 10 écrivait « aucun bloc ne possède le stockage au M2 » : c'était vrai
   ce jour-là et ça ne l'est plus depuis le lot 14. Un serveur monté avec un
   magasin porte donc `doc.open`, `doc.save` et `doc.list` EN PLUS — et un
   serveur monté sans magasin ne les porte pas du tout. Le catalogue dit la
   vérité sur ce que le serveur sait faire, il ne promet jamais une porte qui
   n'ouvre sur rien.

   ── CE QUI N'EST PAS EXPOSÉ, ET POURQUOI ───────────────────────────────
   `layers.enable`, `layers.disable`, `layers.flags`, `layers.ruleValues` :
   aucun besoin formulé au M2 (loi §0.6 — on ne construit pas la porte d'une
   pièce que personne n'a demandée). Elles s'ajouteront le jour où une couche
   FH se monte et se démonte pour de vrai. Même raison pour `doc.import`,
   `doc.export` et `doc.duplicate` — voir la note devant les outils `doc`.

   ── PAS D'`outputSchema` ───────────────────────────────────────────────
   La spécification le permet et exige alors que le `structuredContent` s'y
   conforme. Le décrire ici serait une DEUXIÈME copie de la forme que les
   blocs `build` et `layers` rendent déjà — et ce dépôt a mesuré deux fois que
   deux copies d'une règle divergent, sauf si quelque chose les compare. Rien
   ne les comparerait. On s'en passe, et on le dit (⚠ question 4). */

/* Le document `fh-char/1` en argument : la MOITIÉ STATELESS de la surface.

   Les verbes de `build` prennent tous `{document?}` — le premier appel qui en
   porte un l'adopte, les suivants s'en passent. On recopie cette forme telle
   quelle, et elle a une deuxième vertu que le lot 9 ne pouvait pas connaître :
   MCP 2026-07-28 est STATELESS et demande que l'état traversant plusieurs
   requêtes soit porté par l'appelant. Un client qui passe `document` à chaque
   appel est donc strictement conforme ; un client qui l'omet retombe sur le
   document ouvert de la décision D2. ⚠ Voir question 1. */
const DOCUMENT_ARG = {
  type: "object",
  description:
    "Le document fh-char/1 complet sur lequel travailler. Facultatif : le serveur garde ouvert le dernier " +
    "document qu'il a rendu. Le passer à chaque appel rend l'échange sans état, ce que le protocole préfère ; " +
    "l'omettre reprend le personnage ouvert. Aucun outil n'écrit de fichier de lui-même : seul doc.save le fait, " +
    "et seulement quand on l'appelle."
};

function textOf(lines) {
  return lines.filter((line) => typeof line === "string" && line.length > 0).join("\n");
}

function count(list) {
  return Array.isArray(list) ? list.length : 0;
}

function names(list, pick) {
  if (!Array.isArray(list) || list.length === 0) return "aucun";
  return list.map(pick).join(", ");
}

/** Le rendu d'un `{path, replaced, kind}` — commun à `choose`, `set` et
 *  `override`, dont c'est exactement la même forme de réponse. */
function placed(entry, verb) {
  if (!entry) return `${verb} : rien à rapporter.`;
  return `${verb} « ${entry.path} » — ${entry.replaced ? "décision REMPLACÉE" : "décision posée"} (${entry.kind}).`;
}

/** Le pendant de `placed` pour `clear` : `removed` remplace `replaced`, et un
 *  chemin absent n'est pas une faute — juste un geste qui n'avait rien à faire. */
function cleared(entry) {
  if (!entry) return "Clear : rien à rapporter.";
  const collection = entry.kind === "choice" ? "build.choices" : "build.overrides";
  return entry.removed
    ? `Retiré « ${entry.path} » de ${collection}.`
    : `Rien à retirer : « ${entry.path} » n'était pas dans ${collection}.`;
}

export const TOOLS = [
  {
    name: "layers.register",
    title: "Monter une couche de règles",
    description:
      "Monte une couche fh-layer/1 au-dessus de la pile, depuis le TEXTE de son fichier. La pile est ordonnée : " +
      "SRD dessous, puis les couches montées ensuite. Rend l'identifiant, la version et l'empreinte SHA-256 — " +
      "c'est cette empreinte que build.layers[] du personnage transporte. " +
      "⚠️ L'empreinte est celle des octets fournis : passe le contenu du fichier au caractère près, " +
      "sinon le personnage déclarera une couche que la pile ne porte pas.",
    inputSchema: {
      type: "object",
      properties: {
        layer: { type: "string", description: "Le contenu textuel du fichier de couche fh-layer/1 (JSON UTF-8), tel quel." },
        origin: { type: "string", description: "Un libellé pour les messages d'erreur : en général le nom du fichier." }
      },
      required: ["layer"],
      additionalProperties: false
    },
    route: "layers.register",
    payload(args) {
      const request = { bytes: args.layer };
      if (args.origin !== undefined) request.origin = args.origin;
      return request;
    },
    render(out) {
      return textOf([
        `Couche montée : ${out.id} v${out.version} (${out.lang}) — ${out.records} records.`,
        `Empreinte SHA-256 : ${out.hash}`,
        `Nom : ${out.name}`
      ]);
    }
  },

  {
    name: "layers.stack",
    title: "Lister la pile de couches",
    description:
      "Rend le manifeste de la pile montée, dans l'ordre. Chaque entrée porte {id, version, hash, name, lang, " +
      "enabled, flags, records}. Les trois premiers champs sont exactement ce que build.layers[] d'un personnage " +
      "fh-char/1 exige : recopie-les pour construire un document neuf.",
    inputSchema: { type: "object", additionalProperties: false },
    route: "layers.stack",
    payload() { return undefined; },
    render(out) {
      if (count(out) === 0) return "La pile est vide — aucune couche n'est montée.";
      return textOf([
        `${out.length} couche(s) montée(s), de la base au sommet :`,
        ...out.map((layer, index) =>
          `  ${index + 1}. ${layer.id} v${layer.version} — ${layer.records} records, ` +
          `${layer.enabled ? "active" : "ÉTEINTE"}${count(layer.flags) ? `, drapeaux : ${layer.flags.join(", ")}` : ""}`)
      ]);
    }
  },

  {
    name: "layers.query",
    title: "Lire le contenu des couches",
    description:
      "Le SEUL chemin de lecture du contenu des couches, et donc le seul moyen de connaître les identifiants à " +
      "poser dans un choix. Avec `id` : la vue pliée de ce record, ou null. Sans `id` : TOUTES les vues du genre — " +
      "attention, un genre entier peut peser plusieurs mégaoctets (le genre des sorts du SRD porte 339 records). " +
      "Un genre hors de l'énumération est un refus, jamais une liste vide. LA RÉCIPROQUE COMPTE AUTANT : un " +
      "genre LÉGAL que la pile montée ne porte pas rend une liste VIDE, jamais un refus — ne conclus donc pas " +
      "d'une liste vide que le genre n'existe pas, ni que le serveur est en faute.",
    inputSchema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          description:
            "Le genre de record, tel que l'énumération fermée de `fh-layer/1` le déclare. La liste n'est PAS " +
            "recopiée ici : elle l'était, et elle avait déjà dérivé d'un genre. Un genre inconnu est refusé " +
            "en le NOMMANT, et le refus énumère les genres légaux — c'est là qu'il faut lire la liste vraie."
        },
        id: { type: "string", description: "L'identifiant du record (par exemple srd:species:fr:elfe). Omis, tout le genre est rendu." }
      },
      required: ["kind"],
      additionalProperties: false
    },
    route: "layers.query",
    payload(args) {
      const request = { kind: args.kind };
      if (args.id !== undefined) request.id = args.id;
      return request;
    },
    render(out, args) {
      if (out === null) return `Aucun ${args.kind} « ${args.id} » dans la pile.`;
      if (Array.isArray(out)) {
        return textOf([
          `${out.length} record(s) de genre ${args.kind} :`,
          ...out.map((view) => `  ${view.id} — ${view.record.name}`)
        ]);
      }
      return textOf([
        `${out.kind} « ${out.id} » — ${out.record.name}`,
        `Posé par la couche « ${out.provenance.from} »` +
          (count(out.provenance.patchedBy) ? `, patché par ${names(out.provenance.patchedBy, (p) => p.by)}` : "")
      ]);
    }
  },

  {
    name: "build.choose",
    title: "Poser un RECORD sur un point de décision",
    description:
      "Pose un record de couche (espèce, classe, arrière-plan, don, sort, objet…) sur un point de décision. " +
      "Une décision remplace la précédente sur le même chemin. Pour poser un SCALAIRE (un score, un nombre, " +
      "un mot-clef), c'est build.set : les deux verbes sont les deux moitiés de la règle « ref OU value, " +
      "jamais les deux » du schéma fh-char/1.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Le point de décision, par exemple species, class, background.feat, class.skills[0]." },
        ref: {
          type: "object",
          description: "Le record désigné.",
          properties: {
            kind: { type: "string", description: "Le genre du record (species, class, spell…)." },
            id: { type: "string", description: "L'identifiant du record, tel que layers.query le rend." }
          },
          required: ["kind", "id"],
          additionalProperties: false
        },
        label: { type: "string", description: "Un libellé d'affichage, facultatif. Il ne change rien à la dérivation." },
        document: DOCUMENT_ARG
      },
      required: ["path", "ref"],
      additionalProperties: false
    },
    route: "build.choose",
    payload(args) {
      const request = { path: args.path, ref: args.ref };
      if (args.label !== undefined) request.label = args.label;
      if (args.document !== undefined) request.document = args.document;
      return request;
    },
    render(out) { return placed(out.choice, "Choix"); }
  },

  {
    name: "build.set",
    title: "Poser un SCALAIRE sur un point de décision",
    description:
      "Pose une valeur scalaire (nombre, chaîne, booléen, null) sur un point de décision — un score de " +
      "caractéristique, un lignage, une quantité. Une structure serait une règle déguisée : elle est refusée. " +
      "Pour désigner un record de couche, c'est build.choose.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Le point de décision, par exemple abilities.int, species.lineage, gear[0].quantity." },
        value: {
          type: ["string", "number", "boolean", "null"],
          description: "La valeur posée. Scalaire uniquement — jamais un objet ni un tableau."
        },
        label: { type: "string", description: "Un libellé d'affichage, facultatif." },
        document: DOCUMENT_ARG
      },
      required: ["path", "value"],
      additionalProperties: false
    },
    route: "build.set",
    payload(args) {
      const request = { path: args.path, value: args.value };
      if (args.label !== undefined) request.label = args.label;
      if (args.document !== undefined) request.document = args.document;
      return request;
    },
    render(out) { return placed(out.choice, "Valeur"); }
  },

  {
    name: "build.override",
    title: "Écarter la règle sur une case de la fiche",
    description:
      "Pose un override : une valeur qui écrase ce que la dérivation a produit, appliquée EN DERNIER et " +
      "survivant à toute reconstruction. Le chemin est toujours enraciné dans `resolved` et désigne un élément " +
      "de collection par son IDENTITÉ, jamais par un index. Un override ne CRÉE rien : viser une case que la " +
      "dérivation n'a pas produite est un refus, pas une création silencieuse.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "La cible dans la fiche, par exemple resolved.vitals.hpMax ou resolved.gear[torche].quantity." },
        value: { description: "La valeur qui remplace celle de la dérivation. Toute valeur JSON." },
        by: {
          type: "string",
          enum: ["player", "gm"],
          description: "Qui a écarté la règle. On sait toujours de qui vient l'écart, sinon il n'est plus affichable."
        },
        note: { type: "string", description: "La raison de l'écart, facultative mais recommandée." },
        document: DOCUMENT_ARG
      },
      required: ["path", "value", "by"],
      additionalProperties: false
    },
    route: "build.override",
    payload(args) {
      const request = { path: args.path, value: args.value, by: args.by };
      if (args.note !== undefined) request.note = args.note;
      if (args.document !== undefined) request.document = args.document;
      return request;
    },
    render(out) { return placed(out.override, "Override"); }
  },

  {
    name: "build.clear",
    title: "Retirer une décision ou un override",
    description:
      "Retire une entrée de build.choices (kind: \"choice\") ou de build.overrides (kind: \"override\"), " +
      "jamais des deux à l'aveugle : le geste nomme sa cible. Un chemin absent n'est pas un refus — l'outil " +
      "réussit et rend `removed: false`. C'est le seul verbe qui ENLÈVE une décision plutôt que de la remplacer : " +
      "sans lui, une décision posée ou un override levé par erreur était définitif.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Le chemin à retirer — un chemin de choix si kind vaut \"choice\", un chemin d'override sinon."
        },
        kind: {
          type: "string",
          enum: ["choice", "override"],
          description: "La collection visée : build.choices ou build.overrides."
        },
        document: DOCUMENT_ARG
      },
      required: ["path", "kind"],
      additionalProperties: false
    },
    route: "build.clear",
    payload(args) {
      const request = { path: args.path, kind: args.kind };
      if (args.document !== undefined) request.document = args.document;
      return request;
    },
    render(out) { return cleared(out.cleared); }
  },

  {
    name: "build.rebuild",
    title: "Dériver la fiche jouable",
    description:
      "LE SEUL chemin d'écriture de `resolved`. Plie la pile et les choix, applique les overrides en dernier, " +
      "écrit la fiche jouable et la date de modification. " +
      "Lis `decisions` pour connaître les choix encore attendus, les options identifiables et les verrous " +
      "structurés ; ce carnet se recalcule après chaque choose, set ou clear suivi d'un rebuild. " +
      "⚠️ Lis `underived` : il nomme, avec sa raison, tout ce que la pile n'a PAS su nourrir — ces champs ne " +
      "sont pas sur la fiche, et rien ne les devine. Lis aussi `shadowed` : les records qu'une couche haute a " +
      "recouverts. Les avaler serait jouer une fiche dont on ignore les trous.",
    inputSchema: {
      type: "object",
      properties: { document: DOCUMENT_ARG },
      additionalProperties: false
    },
    route: "build.rebuild",
    payload(args) {
      return args.document !== undefined ? { document: args.document } : {};
    },
    render(out) {
      const decisions = Array.isArray(out.decisions) ? out.decisions : [];
      const underived = Array.isArray(out.underived) ? out.underived : [];
      const shadowed = Array.isArray(out.shadowed) ? out.shadowed : [];
      const unconsumed = Array.isArray(out.unconsumed) ? out.unconsumed : [];
      const warnings = Array.isArray(out.warnings) ? out.warnings : [];
      const applied = Array.isArray(out.overridesApplied) ? out.overridesApplied : [];
      const diff = Array.isArray(out.diff) ? out.diff : [];
      return textOf([
        "Fiche reconstruite.",
        `Overrides appliqués (${applied.length}) : ${names(applied, (entry) => entry.path)}.`,
        `Champs changés depuis la dernière fiche (${diff.length}).`,
        "",
        `DÉCISIONS (${decisions.length}) — projection des choix réels de la pile :`,
        ...(decisions.length === 0
          ? ["  aucune."]
          : decisions.map((entry) => `  · ${entry.path} : ${entry.status}, ${entry.answered}/${entry.expected}` +
            `${entry.remaining ? `, reste ${entry.remaining}` : ""}${entry.lock ? `, verrou ${entry.lock.key}` : ""}`)),
        "",
        `NON DÉRIVÉ (${underived.length}) — ce que la pile n'a pas su nourrir, et qui n'est donc PAS sur la fiche :`,
        ...(underived.length === 0
          ? ["  aucun."]
          : underived.map((entry) => `  · ${entry.field} : ${entry.reason}`)),
        "",
        `RECORDS RECOUVERTS (${shadowed.length}) — une couche haute a remplacé un record d'une couche basse :`,
        ...(shadowed.length === 0
          ? ["  aucun."]
          : shadowed.map((entry) => `  · ${entry.kind} « ${entry.id} » : « ${entry.by} » recouvre « ${entry.over} »`)),
        "",
        `CHOIX NON CONSOMMÉS (${unconsumed.length}) — posés, mais aucune règle ne les lit : ${
          unconsumed.length === 0 ? "aucun" : unconsumed.join(", ")}.`,
        ...(warnings.length === 0 ? [] : [`AVERTISSEMENTS (${warnings.length}) :`, ...warnings.map((line) => `  · ${line}`)])
      ]);
    }
  },

  {
    name: "build.validate",
    title: "Dire ce qui cloche, sans rien écrire",
    description:
      "Vérifie le personnage ouvert sans toucher à `resolved` : invariants du document, refs morts, comptes de " +
      "compétences accordées, légalité des augmentations d'arrière-plan. Un refus est un RÉSULTAT ici : " +
      "l'outil réussit et rend `ok: false` avec la liste des violations.",
    inputSchema: {
      type: "object",
      properties: { document: DOCUMENT_ARG },
      additionalProperties: false
    },
    route: "build.validate",
    payload(args) {
      return args.document !== undefined ? { document: args.document } : {};
    },
    render(out) {
      const violations = Array.isArray(out.violations) ? out.violations : [];
      const warnings = Array.isArray(out.warnings) ? out.warnings : [];
      return textOf([
        out.ok ? "Aucune violation." : `${violations.length} VIOLATION(S) :`,
        ...violations.map((violation) => `  · ${renderBuildViolation(violation)}`),
        warnings.length === 0 ? "Aucun avertissement." : `AVERTISSEMENTS (${warnings.length}) :`,
        ...warnings.map((line) => `  · ${line}`)
      ]);
    }
  },

  /* ══ LES TROIS VERBES DE `doc` — LE CÂBLAGE DU 2026-08-08 ══════════════
     Le lot 10 s'était délibérément interdit `open`/`save` : le bloc `doc`
     n'existait pas, et fabriquer ici sa tranche l'aurait préemptée (D2). Il
     existe depuis le lot 14. Ces trois outils ne fabriquent donc plus rien —
     ils ROUTENT vers des verbes déjà écrits, testés et contractés, comme les
     sept autres. `src/mcp/` ne gagne pas une ligne de disque : c'est la
     racine de composition qui monte le magasin.

     ── POURQUOI TROIS, ET PAS SIX ─────────────────────────────────────────
     Le bloc porte aussi `import`, `export` et `duplicate`. Ils ne sont pas
     exposés : aucun besoin formulé (loi §0.6, la même raison qui laisse
     `layers.enable` de côté). `export` porte en plus une décision non prise —
     il rend des OCTETS, et un octet ne traverse pas JSON-RPC sans un encodage
     qu'il faudrait choisir (base64 ? texte ?). La choisir sans besoin serait
     inventer (loi §0.10). Elle se prendra le jour où quelqu'un veut le
     byte-identique de bout en bout. */

  {
    name: "doc.open",
    title: "Ouvrir un personnage du magasin",
    description:
      "Lit un personnage du magasin local et le rend ouvert : il devient le document courant du serveur, " +
      "lisible par la resource fh-char:///open et par mcp.document. C'est aussi ce qui autorise un doc.save " +
      "ultérieur sur ce même id — le bloc refuse d'écraser un document qu'il n'a pas lu.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "L'identifiant du personnage, tel que doc.list le rend." }
      },
      required: ["id"],
      additionalProperties: false
    },
    route: "doc.open",
    payload(args) { return { id: args.id }; },
    render(out) {
      return textOf([
        `Personnage « ${out.id} » ouvert — ${out.size} octets, empreinte ${out.hash}.`,
        "Son contenu est à la resource fh-char:///open et à l'outil mcp.document."
      ]);
    }
  },

  {
    name: "doc.save",
    title: "Enregistrer le personnage dans le magasin",
    description:
      "Écrit le personnage dans le magasin local, sous son propre id. Sans argument, enregistre le personnage " +
      "OUVERT — celui que build vient de dériver. " +
      "⚠️ Le bloc REFUSE d'écraser un document qu'il n'a pas lu, et refuse aussi si le fichier a changé depuis : " +
      "dans les deux cas il nomme l'empreinte trouvée, à repasser dans `expect` pour écraser délibérément. " +
      "Ce n'est pas un obstacle, c'est ce qui empêche deux sessions de s'effacer l'une l'autre en silence.",
    inputSchema: {
      type: "object",
      properties: {
        document: DOCUMENT_ARG,
        expect: {
          type: ["string", "null"],
          description:
            "L'empreinte qu'on croit écraser (doc.list la rend), ou null pour « je crée ce document ». " +
            "Omise, le bloc se fie à ce qu'il a lui-même lu ou écrit."
        }
      },
      additionalProperties: false
    },
    route: "doc.save",
    /* ⚠️ LE SEUL OUTIL QUI PREND LE MIROIR EN ENTRÉE, et il faut le justifier
       parce que le miroir « ne fait autorité sur rien » (D2).

       La mesure qui tranche : le personnage d'exemple du dépôt pèse **18 634
       caractères**. Exiger que l'appelant repasse le document pour
       l'enregistrer, c'est le faire RETRANSCRIRE 18 634 caractères de JSON par
       un modèle de langue, entre `build.rebuild` et `doc.save`, alors que les
       deux bouts de la chaîne l'ont déjà exact. Un caractère faux et le
       document est corrompu — et il serait corrompu SILENCIEUSEMENT, puisqu'il
       resterait valide au schéma.

       Le miroir ne gagne aucune autorité pour autant : il n'est ni dérivé ni
       consulté par une règle : il est REMIS TEL QUEL au bloc qui, lui, valide
       tout ce qui entre. Et l'appelant garde la main — passer `document`
       explicitement reste conforme au protocole stateless. */
    fromOpenDocument: true,
    payload(args) {
      const request = { document: args.document };
      if (args.expect !== undefined) request.expect = args.expect;
      return request;
    },
    render(out) {
      return textOf([
        `Personnage « ${out.id} » enregistré — ${out.size} octets, empreinte ${out.hash}.`,
        out.replaced ? "Un document du même id a été REMPLACÉ." : "C'est une création : le magasin ne portait pas cet id."
      ]);
    }
  },

  {
    name: "doc.list",
    title: "Lister les personnages du magasin",
    description:
      "L'inventaire du magasin local : id, nom, langue, niveau, dates et empreinte. " +
      "⚠️ Une entrée illisible est RAPPORTÉE avec `ok: false` et sa raison, jamais sautée — un inventaire qui " +
      "cache un fichier cassé est pire qu'un inventaire qui le montre.",
    inputSchema: { type: "object", additionalProperties: false },
    route: "doc.list",
    payload() { return undefined; },
    render(out) {
      if (count(out) === 0) return "Le magasin est vide.";
      const broken = out.filter((entry) => !entry.ok);
      return textOf([
        `${out.length} personnage(s) dans le magasin :`,
        ...out.map((entry) => entry.ok
          ? `  · ${entry.id} — ${entry.name}, niveau ${entry.level} (${entry.lang}) — empreinte ${entry.hash}`
          : `  · ${entry.id} — ⚠️ ILLISIBLE : ${entry.reason}`),
        ...(broken.length === 0 ? [] : ["", `${broken.length} entrée(s) illisible(s) ci-dessus : elles existent, elles ne s'ouvriront pas.`])
      ]);
    }
  },

  {
    name: "mcp.document",
    title: "Rendre le document du personnage ouvert",
    description:
      "Rend le document fh-char/1 complet que le serveur tient ouvert, en JSON. C'est le même contenu que la " +
      "resource fh-char:///open. " +
      "⚠️ Ce que le serveur tient est EN MÉMOIRE et ne survit pas à son arrêt. Si l'outil doc.save est présent " +
      "dans ce catalogue, le serveur a un magasin local et peut enregistrer pour toi ; s'il est absent, il n'en " +
      "a pas, et c'est à toi de conserver ce JSON. Dans les deux cas le personnage appartient au joueur.",
    inputSchema: { type: "object", additionalProperties: false },
    /* Le seul outil sans route : aucun bloc ne possède le stockage au M2, donc
       personne d'autre que l'adaptateur ne peut rendre ce document (D2). */
    route: null,
    payload() { return undefined; },
    /* Le texte EST le JSON, indenté. « Rendre son JSON en texte » était la
       commande ; un résumé à sa place obligerait l'appelant à lire la resource
       pour obtenir ce que l'outil prétend rendre. */
    render(out) { return JSON.stringify(out, null, 2); }
  }
];

/** L'index par nom. Une `Map` plutôt qu'un objet : `map.get("__proto__")` ne
 *  rend jamais le prototype, et un nom d'outil vient de l'extérieur. */
export const TOOLS_BY_NAME = new Map(TOOLS.map((tool) => [tool.name, tool]));

/** La forme qu'un `tools/list` publie : les champs du protocole, et eux
 *  seuls. `route`, `payload`, `render` et `fromOpenDocument` sont de la
 *  cuisine interne.
 *
 *  ⚠️ Le catalogue est un ARGUMENT depuis le câblage `doc` : ce que le serveur
 *  publie dépend des blocs que sa racine de composition a montés, et cette
 *  fonction ne décide pas à sa place. Par défaut, tous les outils — c'est le
 *  cas des lecteurs qui veulent l'inventaire du dépôt, pas celui d'un serveur
 *  en train de répondre. */
export function publishedTools(tools = TOOLS) {
  return tools.map((tool) => ({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema
  }));
}
