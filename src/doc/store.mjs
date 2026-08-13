/* ══ LE BLOC `doc` — LES PERSONNAGES AU REPOS ══════════════════════════
   Lot 14-bloc-doc. C'est le bloc qui rend vraie la thèse du produit : « le
   joueur peut se balader partout avec ses persos. » Sans lui, un personnage
   n'existe que le temps d'un processus.

   CE QUE LE BLOC POSSÈDE
   - ses VERBES : `open`, `save`, `list`, `import`, `export`, `duplicate`, et
     depuis le lot 47, `create` et `rename` — les deux portes que le kickoff
     n'ouvrait pas : composer un document `fh-char/1` neuf, et écrire son nom.
     Depuis le lot 48, `describe` : les champs d'identité que ni `create` ni
     `rename` ne portent (genre, alignement, nom de code de campagne), et sa
     liste blanche est LUE dans le schéma plutôt que recopiée ici.
   - son ÉTAT : les documents AU REPOS — mais il ne les tient pas en mémoire
     (voir plus bas) ; sa tranche privée est le registre de ce qu'il a
     réellement observé dans le magasin.
   - ses ÉVÉNEMENTS : `doc-opened`, `doc-saved`.

   ── D1 : IL POSSÈDE LE STOCKAGE, IL NE CODE PAS LE DISQUE ───────────────
   `src/doc/` n'importe JAMAIS `node:fs` et ne nomme aucun chemin. Le magasin
   arrive INJECTÉ (`createDoc({storage})`), exactement comme `layers` reçoit
   son bus, `build` son `dispatch` et son horloge. Trois raisons, et aucune
   n'est de l'abstraction pour l'abstraction :

     · c'est l'idiome mesuré de ce dépôt — aucun bloc ne touche le disque, et
       `bin/fhpc-mcp.mjs` est le seul fichier du chemin MCP qui le lise ;
     · le garde structurel reste UNIFORME : « zéro disque dans src/ » est une
       ligne qu'on peut attaquer, « zéro disque sauf ici » n'en est pas une ;
     · une suite éprouve le magasin entier SANS ÉCRIRE UN OCTET, ce que le
       veilleur d'arbre (`tests/tree-immuable.test.mjs`) rend obligatoire.

   L'implémentation système de fichiers est livrée, HORS du bloc :
   `src/storage/fs.mjs`.

   ── D2 : AUCUN CHEMIN EN DUR, JAMAIS ────────────────────────────────────
   Pas de `~/.fhpc`, pas de répertoire par défaut, pas de nom de fichier, pas
   d'extension. La racine vient de l'appelant, et le bloc ne la voit même pas.
   C'est la décision 3 d'Eric : *le personnage appartient au joueur, il héberge
   ses propres données.* Un bloc qui choisit où vivent les fichiers de
   quelqu'un a déjà décidé à sa place.

   ── LA CLEF EST L'IDENTITÉ, ET LES DEUX SONT VÉRIFIÉES L'UNE PAR L'AUTRE ─
   Le schéma dit de `id` : « l'unicité est garantie par le bloc `doc`, pas par
   le schéma ». Ce bloc la garantit de la seule façon qui ne demande aucun
   index : **la clef du magasin EST le `id` du document**. Deux documents de
   même id sont donc le même emplacement, et la question « lequel gagne ? »
   devient la question de la collision d'écriture — traitée, pas subie.
   L'accord clef ↔ contenu est vérifié AUX DEUX BOUTS : à l'écriture, et à la
   lecture (un magasin trafiqué à la main est nommé et refusé).

   ── LE BLOC NE TIENT AUCUN PERSONNAGE OUVERT ────────────────────────────
   `build` possède déjà « le personnage ouvert ». En tenir un second ici ferait
   deux propriétaires pour une seule chose, et la carte l'interdit (« toute
   feature écrit l'état d'UN seul bloc »). `open` LIT et REND ; ce que le bloc
   retient, c'est uniquement l'empreinte de ce qu'il a vu — le témoin qui rend
   la collision d'écriture détectable.

   ── HORS PÉRIMÈTRE, ET C'EST ÉCRIT POUR QUE PERSONNE NE L'INVENTE ───────
   Aucun réseau, aucune synchronisation : la baseline du voyage est le fichier
   (loi §0.6). Aucun instantané pris depuis `play` : cette décision est prise,
   elle appartient au M4, quand la vue de jeu existera. Aucun câblage MCP : le
   lot 10 s'est délibérément interdit `open`/`save` pour laisser cette tranche
   libre, et le branchement est un lot d'après (contracts/doc.md §« Comment le
   MCP s'y branchera »). */

import { randomUUID } from "node:crypto";

import { DocError } from "./errors.mjs";
import { compileSchema, deriveDraftSchema, describableFields, readFromSchema } from "./schema.mjs";
import { asBytes, digest, parseDocument, toBytes } from "./serialize.mjs";
import { platformNow } from "./clock.mjs";
import { charInvariantViolations } from "../schemas/invariants.mjs";

const STORAGE_METHODS = ["list", "read", "write"];

function fail(what) {
  throw new DocError(`fhpc/doc: ${what}`);
}

function short(hash) {
  return hash === null ? "aucune" : `${hash.slice(0, 12)}…`;
}

export function createDoc({ storage, schema, bus, now = platformNow } = {}) {
  if (!storage || typeof storage !== "object") {
    fail("createDoc needs a storage — le bloc possède le stockage mais ne code pas le disque (décision D1). " +
      `Le port attendu porte ${STORAGE_METHODS.join(", ")} ; une implémentation système de fichiers est ` +
      "livrée dans src/storage/fs.mjs.");
  }
  for (const method of STORAGE_METHODS) {
    if (typeof storage[method] !== "function") {
      fail(`createDoc : le magasin injecté n'a pas de \`${method}\` — le port de stockage est ` +
        `{${STORAGE_METHODS.join(", ")}}, et un port incomplet est un refus, pas un cas à contourner.`);
    }
  }
  if (!bus || typeof bus.emit !== "function") {
    fail("createDoc needs a bus — un document qui s'ouvre ou se sauvegarde sans l'annoncer est un changement " +
      "que personne ne peut suivre, et `doc-opened`/`doc-saved` sont le seul moyen pour les autres blocs de savoir.");
  }
  if (typeof now !== "function") fail("createDoc : `now` doit être une fonction rendant un horodatage ISO.");

  /* LA RÈGLE VIENT DU SCHÉMA, ET RIEN N'EN EST RECOPIÉ ICI (leçon n°3). Le
     schéma est injecté pour la même raison que le magasin : `src/doc/` ne lit
     pas le disque, et un fichier de schéma est un fichier. */
  if (!schema || typeof schema !== "object") {
    fail("createDoc needs a schema — le document `fh-char/1`, chargé par l'appelant. Le bloc VALIDE tout ce " +
      "qui entre (décision D3) et il ne recopie aucune règle : sa liste blanche est GÉNÉRÉE du schéma. " +
      "Sans schéma, il ne saurait pas ce qu'il accepte, et accepter sans savoir est exactement le contraire " +
      "de ce que ce bloc existe pour faire.");
  }
  /* LOT 47, §1b/§2c — LE VALIDATEUR ADMET LES DEUX FORMES, PAR UN SEUL
     SCHÉMA. `deriveDraftSchema` ne change qu'une chose : `resolved` sort de
     `required`. Tout le reste de `fh-char/1` — chaque `$defs`, chaque
     contrainte de champ — est INCHANGÉ. Un personnage COMPLET (qui porte
     `resolved`) est donc jugé exactement aussi strictement qu'avant : le
     mot « brouillon » ne relâche rien de ce que le schéma dit d'un champ
     PRÉSENT, il ne fait qu'admettre son ABSENCE. C'est pour ça qu'un seul
     validateur suffit aux deux formes (§2c), et pour ça que §1c est
     gratuit : dès que `rebuild` pose `resolved`, ce même validateur le
     juge déjà à la rigueur complète de `fh-char/1`, sans qu'un octet ne
     change ici. */
  const compiled = compileSchema(deriveDraftSchema(schema), "fh-char/1 (brouillon dérivé, §1b)");
  const SCHEMA_TAG = readFromSchema(schema, ["properties", "schema", "const"]);
  const ID_PATTERN = new RegExp(readFromSchema(schema, ["properties", "id", "pattern"]), "u");
  const FORBIDDEN_KEY = new RegExp(readFromSchema(schema, ["$defs", "safeKey", "not", "pattern"]), "u");
  /* LOT 48, §1b — LA LISTE BLANCHE DE `describe`, LUE UNE FOIS À LA
     CONSTRUCTION, JAMAIS RECOPIÉE. `describableFields` lit `properties` et
     `required` du schéma RACINE injecté — pas du brouillon dérivé, dont
     seul `required` change, jamais `properties` — et en tire les champs
     facultatifs et descriptifs. `create` s'en sert aussi (§1c) : les deux
     verbes qui écrivent hors des quatre champs D3 partagent la MÊME liste,
     jamais deux copies qui pourraient diverger. */
  const DESCRIBABLE_FIELDS = describableFields(schema);

  /* L'ÉTAT PRIVÉ, ET IL TIENT EN UNE LIGNE : ce que le bloc a réellement LU
     ou ÉCRIT, par id. Ce n'est pas un cache — rien n'est servi depuis lui — ;
     c'est le témoin qui permet de dire « ce document a changé sous toi »
     plutôt que d'écraser en silence. Il ne sort jamais d'ici. */
  const seen = new Map();

  function assertId(id, verb) {
    if (typeof id !== "string" || !ID_PATTERN.test(id)) {
      fail(`${verb} : « ${id === undefined ? "(absent)" : String(id)} » n'est pas un identifiant de document ` +
        `(forme ${ID_PATTERN.source}). La clef du magasin EST l'id du document : un id que le contrat refuse ` +
        "n'a pas d'emplacement.");
    }
    return id;
  }

  /* LOT 47, §2a — L'ID DE `create`, ET POURQUOI IL DIFFÈRE DE CELUI DE
     `duplicate`. `duplicate` copie un document que SON joueur a déjà nommé ;
     inventer l'id de la copie déciderait à sa place (loi §0.10), donc
     l'appelant nomme (`as`). `create` n'a RIEN à copier : il n'y a encore
     personne à qui laisser le choix, et un document neuf sans id n'a pas
     d'emplacement. Ce bloc le produit donc lui-même — un UUID v4, tiré du
     CSPRNG de la plate-forme (`node:crypto`, déjà présent pour `digest` dans
     `serialize.mjs` — aucune dépendance neuve). ⛔ Jamais `Math.random`,
     interdit dans tout `src/doc/` (contrats/doc.md, dépendances interdites) :
     un CSPRNG rend une collision non provoquée assez improbable pour ne
     jamais arriver en pratique, ce qu'un PRNG ordinaire ne garantit pas.
     `create` ne touche pas le magasin (§2a : « il ne dérive pas, il
     n'enregistre pas ») : l'unicité RÉELLE contre ce qui existe déjà est
     vérifiée plus tard, à `save`, par la garde de collision ordinaire
     (`expect: null` — réponse 2 du contrat) ; ce générateur n'a donc qu'à
     produire une forme que `ID_PATTERN` accepte, vérifié ci-dessous plutôt
     que supposé. */
  function freshId() {
    const id = randomUUID();
    if (!ID_PATTERN.test(id)) {
      fail(`create : l'identifiant généré « ${id} » ne respecte pas ${ID_PATTERN.source} — un UUID v4 devrait ` +
        "toujours passer ce motif ; si ce refus se déclenche, le motif de `id` a changé sous ce bloc.");
    }
    return id;
  }

  /** Ce que le magasin porte sous cette clef, ou `null`. */
  function stored(id, verb) {
    const raw = storage.read(id);
    if (raw === null || raw === undefined) return null;
    const bytes = asBytes(raw, `${verb} : l'entrée « ${id} » du magasin`);
    return { bytes, hash: digest(bytes), size: bytes.length };
  }

  function inventory() {
    const keys = storage.list();
    if (!Array.isArray(keys)) {
      fail("le magasin injecté rend autre chose qu'une liste de clefs — `list()` rend un tableau de chaînes.");
    }
    return keys.slice().sort();
  }

  function knownIds() {
    const keys = inventory();
    if (keys.length === 0) return "le magasin est vide";
    const head = keys.slice(0, 12).join(", ");
    return keys.length > 12 ? `${head}… (${keys.length} au total)` : head;
  }

  /** LE SEUL CHEMIN D'ADMISSION D'UN DOCUMENT. Rien n'entre dans le magasin,
   *  et rien n'en sort, sans passer par ici (décision D3). Un refus NOMME
   *  toutes ses raisons d'un coup : un document recopié à la main a rarement
   *  une seule faute, et les découvrir une par une coûte un aller-retour
   *  chacune. */
  function assertValid(document, origin) {
    if (document === null || typeof document !== "object" || Array.isArray(document)) {
      fail(`${origin} : un document \`${SCHEMA_TAG}\` est un objet.`);
    }
    if (document.schema !== SCHEMA_TAG) {
      fail(`${origin} : le document déclare \`schema\` = ${JSON.stringify(document.schema)} — ce bloc ` +
        `n'ouvre que des documents \`${SCHEMA_TAG}\`. Un schéma inconnu n'est pas un document à moitié ` +
        "compatible : c'est un document dont on ne sait rien.");
    }
    const violations = compiled.validate(document, "document")
      .concat(charInvariantViolations(document));
    if (violations.length > 0) {
      fail(`${origin} : le document ne valide pas contre \`${SCHEMA_TAG}\` — ${violations.length} refus :\n- ` +
        violations.join("\n- "));
    }
    return document;
  }

  /** Octets → document admis. */
  function admit(bytes, origin) {
    const parsed = parseDocument(bytes, FORBIDDEN_KEY, origin);
    assertValid(parsed.document, origin);
    return parsed;
  }

  /** L'accord clef ↔ contenu, vérifié aux deux bouts. */
  function assertSameId(id, document, origin) {
    if (document.id !== id) {
      fail(`${origin} : le magasin range ce document sous « ${id} » et le document se dit ` +
        `« ${document.id} ». La clef du magasin EST l'id du document : deux réponses à « qui es-tu ? » ` +
        "ne se départagent pas toutes seules.");
    }
  }

  /* ── LA COLLISION D'ÉCRITURE ────────────────────────────────────────
     LE DERNIER NE GAGNE PAS EN SILENCE. La leçon n°1 dit que le vide ne bat
     jamais le rempli SANS CHOIX EXPLICITE DE L'UTILISATEUR : ce qui suit est
     la forme de ce choix explicite, et c'est un témoin d'empreinte, pas un
     verrou (un verrou dans un magasin de fichiers ment dès qu'un processus
     meurt).

       · le bloc SAIT ce qu'il a lu ou écrit (`seen`) : la boucle ordinaire
         open → modifier → save ne demande donc rien de plus ;
       · quand il ne sait pas — le document a été posé là par quelqu'un
         d'autre, ou par une session précédente — il REFUSE, et il dit
         comment déclarer ce qu'on écrase : `{expect: "<empreinte>"}`, que
         `list()` donne ;
       · quand ce qu'il sait ne correspond plus, il REFUSE en montrant les
         deux empreintes : quelqu'un a écrit entre-temps. */
  function guardWrite(id, verb, expect) {
    const current = stored(id, verb);
    const found = current ? current.hash : null;
    const declared = expect !== undefined;
    if (declared && expect !== null && typeof expect !== "string") {
      fail(`${verb} : \`expect\` est une empreinte (chaîne) ou \`null\` pour « je crée », reçu ${typeof expect}.`);
    }
    const expected = declared ? expect : (seen.has(id) ? seen.get(id) : null);

    if (expected === found) return { found, replaced: found !== null };

    if (found === null) {
      fail(`${verb} : le magasin ne porte aucun « ${id} », alors que l'écriture en attendait un ` +
        `(empreinte ${short(expected)}). Il a été retiré depuis la lecture — relire la liste avant d'écrire ` +
        "plutôt que de recréer un document qu'on croyait modifier.");
    }
    if (expected === null) {
      fail(`${verb} : le magasin porte déjà « ${id} » (empreinte ${short(found)}) et ce bloc ne l'a pas lu. ` +
        "Écraser un document qu'on n'a pas lu, c'est laisser le vide battre le rempli sans choix explicite " +
        "(leçon n°1). Deux issues, toutes deux explicites : l'ouvrir d'abord (`open`), ou déclarer ce qu'on " +
        `écrase — \`{expect: "${found}"}\`, empreinte que \`list()\` rend.`);
    }
    fail(`${verb} : « ${id} » a changé dans le magasin depuis la dernière lecture (attendu ${
      short(expected)}, trouvé ${short(found)}). Deux écritures se croisent, et la dernière ne gagne pas en ` +
      "silence : relire, rejouer la modification sur ce qui est là, réécrire.");
  }

  function commit({ id, bytes, hash, reason, replaced, document }) {
    storage.write(id, bytes);
    seen.set(id, hash);
    bus.emit("doc-saved", { id, hash, size: bytes.length, reason, replaced });
    return { id, hash, size: bytes.length, replaced, document };
  }

  /* ── LES VERBES ───────────────────────────────────────────────────── */

  const verbs = {
    /** LOT 47, §2a — LE SEPTIÈME VERBE. Rend un document `fh-char/1` NEUF et
     *  VIDE — sans `resolved` (il ne dérive rien) et sans toucher au magasin
     *  (il n'enregistre rien : « créer et sauvegarder sont deux gestes »).
     *  Prêt pour `build.projectDecisions({query, choices: document.build.
     *  choices})`, qui n'a besoin ni de `resolved` ni d'une dérivation.
     *
     *  `{name, lang, units, layers}` — les quatre TOUS requis, aucun défaut
     *  deviné (décision D3) : une langue ou des unités implicites seraient
     *  une règle que ce bloc invente à la place du joueur. `layers` est le
     *  MANIFESTE des couches actives, déjà composé par l'appelant — même
     *  forme que `build.layers` ($defs/layerRef), même geste que
     *  `src/tools/exemple-fh-en.mjs` (`stack().filter(enabled).map(...)`) :
     *  ce bloc ne parle pas au bloc `layers` (dépendance interdite), il
     *  reçoit le résultat déjà composé. */
    create(payload) {
      const options = payload || {};
      const { name, lang, units, layers } = options;
      for (const [key, value] of [["name", name], ["lang", lang], ["units", units], ["layers", layers]]) {
        if (value === undefined) {
          fail(`create attend \`{name, lang, units, layers}\` — « ${key} » manque. Aucun défaut n'est deviné ` +
            "(décision D3) : un document neuf sans langue ou sans unités serait une règle inventée par ce " +
            "bloc à la place du joueur.");
        }
      }
      const at = now();
      const document = {
        schema: SCHEMA_TAG,
        id: freshId(),
        name,
        lang,
        units,
        created: at,
        modified: at,
        /* La forme exacte mesurée au §0.1 de la commande : un brouillon est
           `fh-char/1` moins `resolved`, et RIEN d'autre ne change à `build`. */
        build: { layers, choices: [], budgets: {}, overrides: [] }
      };
      /* LOT 48, §1c — LES CHAMPS DESCRIPTIFS DÈS LA NAISSANCE, TOUJOURS
         FACULTATIFS. Même liste blanche que `describe` (`DESCRIBABLE_FIELDS`,
         lue dans le schéma, pas recopiée) : un joueur qui crée son
         personnage peut donner son genre et son alignement dans le même
         écran que son nom. ⛔ Mais `create` ne les EXIGE JAMAIS — la boucle
         D3 ci-dessus, elle, jette sur les quatre champs qu'elle nomme, et
         SEULEMENT eux : « facultatif » n'est pas « deviné », c'est
         « absent » (commande §1c). Toute autre clef du payload — y compris
         un `id` forcé, voir le test dédié — reste ignorée, exactement comme
         avant ce lot : `create` n'a jamais refusé un payload trop généreux,
         il en garde seulement ce qu'il sait nommer. */
      for (const key of DESCRIBABLE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(options, key)) document[key] = options[key];
      }
      assertValid(document, "create");
      return structuredClone(document);
    },

    /** LOT 47, §2b/§1d — LE HUITIÈME VERBE : `document.name` s'écrit ICI.
     *  ⛔ PAS PAR `build.set` : `$defs/build.choices` est la grammaire d'un
     *  POINT DE DÉCISION (`src/build/paths.mjs`), et `name` n'en est pas un —
     *  rien ne le « consomme » jamais, et un `set({path:"name", …})` reste
     *  pour toujours dans `unconsumed` (mesuré §0.2 de la commande). `name`
     *  est une MÉTADONNÉE de document, comme `lang` et `units`, et le bloc
     *  `doc` possède les documents (§1d) — donc c'est ici, pas dans `build`.
     *
     *  Pure : ne touche ni le magasin ni `build.choices`. `document` peut
     *  être un brouillon ou un personnage complet (§2c, les deux valident) ;
     *  la sortie est validée comme toute admission (décision D3) — un nom
     *  vide ou de plus de 200 caractères est un refus NOMMÉ, jamais un
     *  silence qui laisserait passer une fiche sans nom. */
    rename(payload) {
      const options = payload || {};
      const { document, name } = options;
      if (document === null || typeof document !== "object" || Array.isArray(document)) {
        fail("rename attend `{document, name}` — un document `fh-char/1` (brouillon ou complet) et le nom à " +
          "écrire à sa racine.");
      }
      if (typeof name !== "string") {
        fail(`rename : \`name\` doit être une chaîne, reçu ${name === undefined ? "(absent)" : typeof name}.`);
      }
      const renamed = structuredClone(document);
      renamed.name = name;
      assertValid(renamed, "rename");
      return structuredClone(renamed);
    },

    /** LOT 48, §1b — LE NEUVIÈME VERBE : les champs d'IDENTITÉ que `create`
     *  et `rename` ne portent pas — genre, alignement, nom de code de
     *  campagne — et tout autre champ que le schéma déclarera demain
     *  facultatif et descriptif à la racine, SANS qu'une ligne d'ici ne
     *  bouge (voir `describableFields`, `src/doc/schema.mjs`).
     *
     *  ⛔ CE QUI RÉPOND À L'OBJECTION DU LOT 47 (`INVENTAIRE-LOT-47.md`,
     *  « le mot suggère une action plus large... invite à y accrocher autre
     *  chose plus tard ») : ce verbe est aussi large que le SCHÉMA le
     *  déclare, jamais un mot de plus. « Accrocher autre chose plus tard »
     *  n'est plus un geste de CODE — aucune ligne de `describe` ne nomme
     *  `gender`, `alignment` ou `campaign` — c'est un geste de SCHÉMA :
     *  une propriété racine facultative de type `string` ajoutée à
     *  `fh-char.schema.json` (relue, testée, ratifiée comme tout changement
     *  de contrat) devient aussitôt écrivable ; rien d'autre ne peut
     *  l'y faire entrer. `describe` ne PEUT PAS grossir en silence, ce
     *  qu'un verbe dont la liste est recopiée en dur ne peut pas garantir.
     *
     *  Payload `{document, ...champs}` : `champs` est un sous-ensemble de
     *  `DESCRIBABLE_FIELDS`. ⚔️ Toute clef HORS de cette liste est un refus
     *  NOMMÉ (voir plus bas) — la liste blanche mord dans les DEUX sens :
     *  elle ADMET ce que le schéma déclare, elle REFUSE le reste, jamais un
     *  strip silencieux. Un champ omis du payload n'est PAS effacé : ce
     *  verbe ÉCRIT ce qu'on lui donne, il ne réinitialise rien qu'on ne lui
     *  a pas demandé de toucher (même discipline que `save`/`import`,
     *  invariant 7).
     *
     *  Pure comme `rename` : ne touche ni le magasin ni `build.choices` —
     *  ces trois champs ne sont PAS des points de décision de `build`
     *  (§0.2 de la commande), donc ils ne créent jamais de choix et ne
     *  reviennent jamais dans `unconsumed`. `document` peut être un
     *  brouillon ou un personnage complet ; la sortie est validée comme
     *  toute admission (décision D3) — un champ trop long est un refus
     *  NOMMÉ, jamais un silence. */
    describe(payload) {
      const options = payload || {};
      const { document, ...fields } = options;
      if (document === null || typeof document !== "object" || Array.isArray(document)) {
        fail("describe attend `{document, ...}` — un document `fh-char/1` (brouillon ou complet) et les " +
          "champs descriptifs à écrire à sa racine.");
      }
      const unknown = Object.keys(fields).filter((key) => !DESCRIBABLE_FIELDS.includes(key));
      if (unknown.length > 0) {
        fail(`describe : ${unknown.map((key) => `« ${key} »`).join(", ")} — le schéma ne déclare ` +
          `${unknown.length > 1 ? "aucun de ces champs" : "pas ce champ"} facultatif et descriptif à la ` +
          "racine (§1b : la liste blanche mord dans les deux sens). Champs acceptés aujourd'hui : " +
          `${DESCRIBABLE_FIELDS.length > 0 ? DESCRIBABLE_FIELDS.join(", ") : "aucun"}.`);
      }
      const described = structuredClone(document);
      for (const key of DESCRIBABLE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) described[key] = fields[key];
      }
      assertValid(described, "describe");
      return structuredClone(described);
    },

    /** Lit un document du magasin et le rend. Ne garde rien d'autre que
     *  l'empreinte de ce qu'il a vu. */
    open(payload) {
      const { id } = payload || {};
      assertId(id, "open");
      const current = stored(id, "open");
      if (!current) {
        fail(`open : aucun document « ${id} » dans le magasin (${knownIds()}).`);
      }
      const { document } = admit(current.bytes, `open « ${id} »`);
      assertSameId(id, document, `open « ${id} »`);
      seen.set(id, current.hash);
      bus.emit("doc-opened", { id, hash: current.hash, size: current.size });
      return { id, document, hash: current.hash, size: current.size };
    },

    /** Écrit un document EN MÉMOIRE dans le magasin, en octets canoniques.
     *  Ne touche à rien du contenu — pas même `modified` : un bloc qui
     *  réécrit ce qu'on lui confie rend deux sauvegardes du même document
     *  différentes, et l'empreinte cesse d'être un témoin. */
    save(payload) {
      const options = payload || {};
      const document = options.document;
      assertValid(document, "save");
      const id = document.id;
      assertId(id, "save");
      const bytes = toBytes(document);
      const hash = digest(bytes);
      const { replaced } = guardWrite(id, "save", options.expect);
      return commit({ id, bytes, hash, reason: "save", replaced, document: structuredClone(document) });
    },

    /** L'inventaire du magasin. C'est le SEUL verbe qui ne jette pas sur un
     *  document illisible : une entrée cassée est RAPPORTÉE (`ok: false` et
     *  sa raison), jamais sautée. Un inventaire qui cache un fichier est pire
     *  qu'un inventaire qui montre un fichier cassé — et le refus, lui, reste
     *  entier à `open` et à `export`. */
    list() {
      return inventory().map((id) => {
        let current = null;
        try {
          current = stored(id, "list");
        } catch (error) {
          return { id, ok: false, hash: null, size: 0, reason: error.message };
        }
        if (!current) {
          return {
            id, ok: false, hash: null, size: 0,
            reason: `l'entrée « ${id} » est listée par le magasin et sa lecture ne rend rien.`
          };
        }
        try {
          const { document } = admit(current.bytes, `list « ${id} »`);
          assertSameId(id, document, `list « ${id} »`);
          /* La projection d'un CHOISISSEUR : de quoi reconnaître son
             personnage dans une liste, et rien de plus. Tout le reste est
             derrière `open` — projeter davantage serait fabriquer une seconde
             lecture du document, qui divergerait de la première.

             LOT 47, §2c — `draft` DISTINGUE les deux formes que ce bloc admet
             depuis ce lot : un brouillon n'a pas de `resolved`, donc pas de
             niveau à lire — `level: null` le dit plutôt que de faire planter
             `list` sur `undefined.identity` (le seul verbe qui NE JETTE
             JAMAIS, invariant 8). Un joueur qui voit sa liste doit distinguer
             un brouillon d'un personnage fini sans ouvrir chaque entrée. */
          const draft = document.resolved === undefined;
          return {
            id, ok: true, hash: current.hash, size: current.size,
            name: document.name,
            lang: document.lang,
            level: draft ? null : document.resolved.identity.level,
            draft,
            created: document.created,
            modified: document.modified
          };
        } catch (error) {
          return { id, ok: false, hash: current.hash, size: current.size, reason: error.message };
        }
      });
    },

    /** Fait ENTRER des octets étrangers. Ils sont validés, puis stockés TELS
     *  QUELS : c'est ce qui rend « exporté ailleurs, réimporté ici,
     *  byte-identique » vrai. `as` renomme — et le renommage réécrit alors le
     *  `id` DANS le document, parce qu'une clef et un contenu qui se
     *  contredisent sont un magasin qu'on ne peut plus relire. */
    import(payload) {
      const options = payload || {};
      if (options.bytes === undefined) {
        fail("import attend `{bytes}` — les octets du fichier de personnage. Le bloc ne lit pas le disque : " +
          "ouvrir un fichier appartient à qui le possède (décision D1).");
      }
      let { document, bytes, hash } = admit(options.bytes, "import");
      let renamed = false;
      let id = document.id;

      if (options.as !== undefined) {
        assertId(options.as, "import");
        if (options.as !== document.id) {
          document = structuredClone(document);
          document.id = options.as;
          assertValid(document, `import (renommé en « ${options.as} »)`);
          bytes = toBytes(document);
          hash = digest(bytes);
          renamed = true;
        }
        id = options.as;
      }
      assertSameId(id, document, "import");

      const { replaced } = guardWrite(id, "import", options.expect);
      const result = commit({ id, bytes, hash, reason: "import", replaced, document: structuredClone(document) });
      result.renamed = renamed;
      return result;
    },

    /** REND DES OCTETS, JAMAIS UN CHEMIN — et c'est la seule réponse cohérente
     *  avec D1 : le bloc ne connaît pas le disque, il ne peut donc pas nommer
     *  un endroit où il aurait écrit. Il ne nomme pas non plus de fichier :
     *  choisir un nom de fichier, c'est déjà décider à la place du joueur.
     *  Les octets rendus sont EXACTEMENT ceux du magasin — aucune
     *  re-sérialisation, sans quoi « byte-identique » serait un vœu. */
    export(payload) {
      const { id } = payload || {};
      assertId(id, "export");
      const current = stored(id, "export");
      if (!current) {
        fail(`export : aucun document « ${id} » dans le magasin (${knownIds()}).`);
      }
      const { document } = admit(current.bytes, `export « ${id} »`);
      assertSameId(id, document, `export « ${id} »`);
      return { id, bytes: Buffer.from(current.bytes), hash: current.hash, size: current.size };
    },

    /** Une COPIE, sous un id neuf que l'appelant nomme. Le bloc n'en fabrique
     *  aucun : un id est un nom, et ce lot n'invente ni nom ni valeur
     *  (loi §0.10). ⚠️ Question ouverte n°2 pour l'architecte. */
    duplicate(payload) {
      const options = payload || {};
      const { id, as } = options;
      assertId(id, "duplicate");
      if (as === undefined) {
        fail("duplicate attend `{id, as}` — l'id de la copie. Ce bloc ne fabrique aucun identifiant : un id " +
          "est un nom, il est porté par le document pour toujours, et l'inventer serait décider à la place " +
          "du joueur (loi §0.10).");
      }
      assertId(as, "duplicate");
      if (as === id) {
        fail(`duplicate : « ${as} » est déjà l'id de la source — une copie sous le même id n'est pas une ` +
          "copie, c'est une écriture, et l'écriture s'appelle `save`.");
      }
      const source = stored(id, "duplicate");
      if (!source) fail(`duplicate : aucun document « ${id} » dans le magasin (${knownIds()}).`);
      const { document } = admit(source.bytes, `duplicate « ${id} »`);
      assertSameId(id, document, `duplicate « ${id} »`);

      const at = now();
      const copy = structuredClone(document);
      copy.id = as;
      /* LES DEUX SEULS CHAMPS QUE `duplicate` ÉCRIT DANS LE DOCUMENT QU'IL
         COPIE (son `id` mis à part, posé juste au-dessus) — et ils se
         justifient l'un par l'autre : une copie est un document NEUF, et un
         document neuf qui prétend avoir été créé avant d'exister est un
         mensonge daté que plus rien ne corrigera. ⚠️ Depuis le lot 47,
         `duplicate` n'est plus le seul verbe qui écrit dans un document :
         `create` en compose un entier et `rename` y écrit `name` — chacun
         dans son périmètre propre, jamais mélangé (invariant 7 du contrat,
         relu). */
      copy.created = at;
      copy.modified = at;
      assertValid(copy, `duplicate → « ${as} »`);

      const taken = stored(as, "duplicate");
      if (taken) {
        fail(`duplicate : « ${as} » existe déjà dans le magasin (empreinte ${short(taken.hash)}). Une copie ` +
          "ne se pose pas SUR quelqu'un : choisir un autre id, ou écraser délibérément par `save`/`import` " +
          "avec `expect`.");
      }
      const bytes = toBytes(copy);
      const result = commit({
        id: as, bytes, hash: digest(bytes), reason: "duplicate", replaced: false, document: structuredClone(copy)
      });
      result.from = id;
      return result;
    }
  };

  return { name: "doc", verbs };
}
