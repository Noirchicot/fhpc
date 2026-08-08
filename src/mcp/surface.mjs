/* ══ LE BLOC `mcp` — L'ADAPTATEUR, ET RIEN QUE L'ADAPTATEUR ════════════
   Lot 10-mcp-v0. Troisième maillon du chemin critique du M2 :
   `layers` → `build` → **MCP v0**.

   ── CE QU'IL FAIT, EN UNE PHRASE ───────────────────────────────────────
   Un message MCP entre, un `dispatch("bloc.verbe", …)` part, un résultat MCP
   sort. **Zéro logique de règles** : pas un calcul, pas une valeur par
   défaut, pas une correspondance de vocabulaire.

   ── CE QU'IL N'IMPORTE JAMAIS (décision D3) ────────────────────────────
   Ni `src/build/`, ni `src/layers/`, ni `src/play/`, ni `src/modules/`. Le
   `dispatch` du noyau est son SEUL chemin vers le domaine, et c'est ce qui
   rend « adaptateur pur » vérifiable au lieu de promis — garde structurel
   dans `tests/mcp-block.test.mjs`, attaqué.
   Conséquence directe : aucun `instanceof BuildError` n'est possible ici. Le
   nom de classe d'une erreur est la seule frontière qui traverse sans
   dépendance (`errors.mjs`, `errorKind`).

   ── PAS DE VERBES, ET C'EST LA CARTE QUI LE DIT ────────────────────────
   `ARCHITECTURE.md` donne à ce bloc « adaptateur : doc/build/play en
   tools+resources », **aucun verbe**, **aucun événement**, **aucun état**. Il
   ne s'enregistre donc pas sur le registre du noyau : `defineBlock` exige des
   verbes, et en fabriquer pour avoir une entrée dans une table serait
   fabriquer un point d'entrée que personne n'appelle (loi §0.6). L'instance
   rend `{name, handle}` — un message entre par `handle`, point. ⚠ question 3.

   ── LE DOCUMENT OUVERT : UN MIROIR, PAS UNE POSSESSION (décision D2) ────
   **Aucun accès disque ici**, et ça n'a pas bougé. L'adaptateur garde en
   mémoire le DERNIER document que le domaine lui a rendu. Il ne l'écrit
   jamais, ne le dérive jamais, ne fonde aucune règle dessus.

   ⚠️ **AMENDÉ LE 2026-08-08 — le câblage MCP → `doc`.** Le lot 10 écrivait
   « le bloc `doc` n'existe pas au M2, et ce lot ne le préempte pas » : c'était
   juste, et le lot 14 a depuis livré le bloc. Deux choses changent, une seule
   est structurelle :

   1. Le miroir a un TROISIÈME usage — il est REMIS TEL QUEL à `doc.save`
      quand l'appelant n'a pas passé de document. Il ne gagne aucune autorité
      pour autant : rien n'en est dérivé, et le bloc `doc` valide tout ce qui
      entre, d'où qu'il vienne. La raison est mesurée, elle est dans
      `tools.mjs` en face de `doc.save` : 18 634 caractères de JSON à
      retranscrire, sinon, par un modèle de langue.
   2. `open` se remplit désormais aussi depuis `doc.open`, par le même chemin
      générique que `build` — un verbe qui rend `{document}` alimente le
      miroir, sans que l'adaptateur sache lequel.

   Ce qui NE change pas : `src/mcp/` ne nomme ni `node:fs`, ni un chemin, ni
   un nom de fichier. Le magasin est monté par la racine de composition et
   atteint par `dispatch`, comme tout le reste. Le garde structurel de
   `tests/mcp-block.test.mjs` le vérifie, et il interdit aussi l'import direct
   de `src/doc/`.

   ── UN CATALOGUE QUI DIT LA VÉRITÉ (`blocks`) ──────────────────────────
   Un serveur monté SANS magasin ne peut pas enregistrer. Deux réponses
   possibles, et une seule est honnête : publier quand même `doc.save` et
   refuser à l'appel, ou ne pas le publier. La première promet une porte qui
   n'ouvre sur rien — et une IA qui lit un catalogue le lit comme un contrat.
   L'adaptateur reçoit donc de la racine de composition la liste des blocs
   RÉELLEMENT montés, et ne publie que les outils qu'elle couvre. C'est le
   pendant, côté surface, de la loi §0.6 : pas de porte morte derrière un
   interrupteur.

   ⚠️ MCP 2026-07-28 EST STATELESS et demande que l'état traversant plusieurs
   requêtes soit porté par l'appelant. La décision D2 a été prise avant la
   lecture de cette révision. Les deux cohabitent ici sans qu'aucune ne soit
   maquillée : chaque outil de `build` accepte `document` en argument — c'est
   la forme des verbes du lot 9, recopiée — donc un client qui le passe à
   chaque appel est strictement conforme, et un client qui l'omet retombe sur
   le document ouvert. Le point est porté à l'architecte (question 1). */

import {
  META, PROTOCOL_VERSION, SUPPORTED_VERSIONS,
  assertRequest, errorResponse, isNotification, readMeta, resultResponse
} from "./protocol.mjs";
import { CODES, McpError, errorKind } from "./errors.mjs";
import { TOOLS, TOOLS_BY_NAME, publishedTools } from "./tools.mjs";

/** L'URI de la resource : le personnage ouvert.
 *
 *  Schéma propre, conforme à RFC 3986 (`ALPHA *( ALPHA / DIGIT / "+" / "-" /
 *  "." )`), et il porte le nom du format qu'il sert. La spécification demande
 *  de préférer un schéma dédié à `https://` dès que le client ne peut pas
 *  aller chercher la ressource lui-même — c'est exactement le cas : ce
 *  document ne vit nulle part ailleurs qu'en mémoire. ⚠ question 2. */
export const CHARACTER_URI = "fh-char:///open";

const CHARACTER_RESOURCE = {
  uri: CHARACTER_URI,
  name: "personnage-ouvert",
  title: "Le personnage ouvert",
  description:
    "Le document fh-char/1 que le serveur tient en mémoire : ses deux étages, `build` (couches, choix, " +
    "overrides) et `resolved` (la fiche jouable). Rien n'est écrit sur disque — c'est à l'appelant de " +
    "l'enregistrer.",
  mimeType: "application/json"
};

/** Les instructions du serveur — écrites en fonction de CE QU'IL SAIT FAIRE.
 *  Un texte figé annoncerait un magasin à un serveur qui n'en a pas, ou le
 *  tairait à celui qui en a un : dans les deux cas l'appelant travaillerait
 *  sur une description fausse de son outil. */
function instructionsFor(mounted) {
  const persiste = mounted.has("doc");
  return [
    "FHPC construit un personnage D&D 5.2 SRD par couches de règles empilables.",
    persiste
      ? "Ce serveur a un magasin local : doc.list, doc.open et doc.save y lisent et y écrivent des personnages. Rien d'autre n'écrit sur disque, et le personnage ouvert ne survit pas à l'arrêt du processus tant qu'il n'est pas enregistré."
      : "Ce serveur n'a PAS de magasin : il ne lit ni n'écrit aucun fichier, c'est toi qui possèdes le stockage, et rien ne survit à l'arrêt du processus.",
    "",
    "Le chemin : 1. layers.register (le TEXTE du fichier de couche SRD, puis les couches du dessus, dans l'ordre) ;",
    "2. layers.stack pour recopier {id, version, hash} dans build.layers[] d'un document fh-char/1 neuf ;",
    "3. layers.query pour connaître les identifiants à choisir ; 4. build.choose / build.set pour chaque décision,",
    "build.override pour la parole du MJ ; 5. build.rebuild pour dériver la fiche ;",
    persiste
      ? "6. doc.save pour l'enregistrer — sans argument, il enregistre le personnage que tu viens de dériver, et tu n'as donc jamais à recopier le document toi-même."
      : "6. mcp.document pour récupérer le document et l'enregistrer toi-même.",
    "",
    "Lis toujours `underived` et `shadowed` que rend build.rebuild : ils nomment ce que la pile n'a PAS su",
    "nourrir et ce qu'une couche haute a recouvert. Rien n'est deviné ici — un champ absent est un champ déclaré."
  ].join("\n");
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Un résultat d'outil. `isError` est TOUJOURS écrit, jamais laissé à
 *  deviner : « absent » et « false » se ressemblent trop pour qu'un lecteur
 *  distrait les distingue. */
function toolResult(text, structured, isError) {
  const result = { content: [{ type: "text", text }], isError: Boolean(isError) };
  if (structured !== undefined) result.structuredContent = structured;
  return result;
}

export function createMcp({ dispatch, serverInfo, blocks } = {}) {
  if (typeof dispatch !== "function") {
    throw new McpError(CODES.internalError,
      "createMcp needs a dispatch — l'adaptateur n'atteint le domaine que par le noyau. Un import direct de " +
      "`src/build/` ou `src/layers/` ferait de l'adaptateur un morceau du domaine, et il n'y aurait plus " +
      "rien à vérifier (décision D3).");
  }
  const info = serverInfo && typeof serverInfo === "object"
    ? { name: String(serverInfo.name), version: String(serverInfo.version) }
    : null;
  if (!info) {
    throw new McpError(CODES.internalError,
      "createMcp needs a serverInfo {name, version} — la spécification demande au serveur de s'identifier " +
      "dans chaque résultat, et un serveur anonyme n'est diagnosticable par personne.");
  }

  /* ── LES BLOCS MONTÉS, ET DONC LE CATALOGUE ────────────────────────────
     La racine de composition est le SEUL endroit du dépôt qui sache ce qui
     est monté ; elle le dit ici. Un défaut permissif (« si tu ne dis rien, je
     publie tout ») rendrait le catalogue faux dans le cas exact qu'on veut
     éviter, donc il n'y en a pas. */
  if (!Array.isArray(blocks) || blocks.length === 0
      || blocks.some((name) => typeof name !== "string" || name.length === 0)) {
    throw new McpError(CODES.internalError,
      "createMcp needs a blocks: [\"layers\", \"build\", …] — la liste des blocs que la racine de composition a " +
      "réellement montés. L'adaptateur ne publie que les outils qu'elle couvre : un catalogue qui annonce un " +
      "outil dont le bloc n'est pas monté promet une porte qui n'ouvre sur rien, et une IA lit un catalogue " +
      "comme un contrat.");
  }
  const mounted = new Set(blocks);

  /** Le bloc qu'un outil atteint — la partie avant le point de sa route.
   *  `mcp.document` n'a pas de route : il est toujours servi, puisque c'est
   *  l'adaptateur lui-même qui le rend. */
  function blockOf(tool) {
    return tool.route === null ? null : tool.route.slice(0, tool.route.indexOf("."));
  }

  const catalog = TOOLS.filter((tool) => {
    const block = blockOf(tool);
    return block === null || mounted.has(block);
  });
  const byName = new Map(catalog.map((tool) => [tool.name, tool]));

  /* LE MIROIR. Ce n'est pas la tranche d'état d'un bloc : personne ne le lit
     à travers un verbe, rien n'en est dérivé, et il ne fait autorité sur
     rien. C'est la dernière photo que le domaine a rendue. */
  let open = null;

  /* ── LES OUTILS ─────────────────────────────────────────────────────── */

  /** Les clefs qu'un outil accepte, tirées de SON schéma — jamais d'une
   *  deuxième liste. Une clef inconnue est un REFUS, pas un argument ignoré
   *  en silence : `build.choose({pathh: …})` accepté rendrait un succès sur
   *  une décision qui n'a pas été posée (loi §0.5, même discipline que les
   *  listes fermées de `layers/document.mjs`). */
  function assertKnownArguments(tool, args) {
    const allowed = new Set(Object.keys(tool.inputSchema.properties || {}));
    const unknown = Object.keys(args).filter((key) => !allowed.has(key));
    if (unknown.length > 0) {
      throw new McpError(CODES.invalidParams,
        `L'outil « ${tool.name} » ne connaît pas l'argument ${unknown.map((key) => `« ${key} »`).join(", ")} ` +
        `(attendus : ${[...allowed].join(", ") || "aucun"}). Aucun argument n'est ignoré en silence.`);
    }
  }

  function callTool(params) {
    const name = params.name;
    if (typeof name !== "string") {
      throw new McpError(CODES.invalidParams, "`params.name` manque ou n'est pas une chaîne.");
    }
    const tool = byName.get(name);
    if (!tool) {
      /* DEUX REFUS, ET PAS UN SEUL : « cet outil n'existe nulle part » et
         « il existe mais son bloc n'est pas monté ici » appellent des gestes
         différents chez l'appelant. Les confondre sous « Unknown tool »
         enverrait une IA chercher une faute de frappe là où il n'y en a pas —
         un diagnostic faux coûte plus cher qu'un diagnostic absent. */
      const known = TOOLS_BY_NAME.get(name);
      if (known) {
        throw new McpError(CODES.invalidParams,
          `L'outil « ${name} » existe, mais le bloc « ${blockOf(known)} » n'est pas monté sur ce serveur — ` +
          `il porte ${[...mounted].join(", ")}. Ce n'est pas une faute de frappe : ce serveur a été lancé sans ` +
          "cette capacité, et c'est à qui l'a lancé de la lui donner.");
      }
      throw new McpError(CODES.invalidParams,
        `Unknown tool: ${name} — les outils de ce serveur sont ${catalog.map((item) => item.name).join(", ")}.`);
    }
    let args = params.arguments === undefined ? {} : params.arguments;
    if (!isPlainObject(args)) {
      throw new McpError(CODES.invalidParams, "`params.arguments` doit être un objet.");
    }
    assertKnownArguments(tool, args);

    /* LE MIROIR REMIS AU DOMAINE — le seul endroit où il ressort d'ici, et il
       ressort TEL QUEL. `currentDocument()` jette en nommant quoi faire s'il
       n'y a rien d'ouvert : « enregistre » sans personnage est un refus, pas
       un fichier vide. */
    if (tool.fromOpenDocument && args.document === undefined) {
      args = Object.assign({}, args, { document: currentDocument() });
    }

    let out;
    try {
      /* ⚠️ LE CŒUR DE L'ADAPTATEUR TIENT EN UNE LIGNE, et c'est le but.
         `mcp.document` est le seul outil sans route : aucun bloc ne possède
         le stockage au M2, donc personne d'autre ne peut rendre ce
         document (D2). */
      out = tool.route === null ? currentDocument() : dispatch(tool.route, tool.payload(args));
    } catch (error) {
      if (error instanceof McpError) throw error;
      /* ── LE REFUS ARRIVE À L'IA, NOMMÉ (loi §0.5) ──────────────────────
         Un refus de règle n'est ni un plantage du serveur ni un succès vide :
         c'est un RÉSULTAT marqué en échec, que le modèle peut lire et
         corriger. Le nom de classe voyage avec, pour que « BuildError :
         niveau absent » se lise comme le refus d'un bloc et pas comme un
         incident anonyme. */
      const kind = errorKind(error);
      const message = error && typeof error.message === "string" ? error.message : String(error);
      return toolResult(`${kind} — ${message}`, { error: { kind, message } }, true);
    }

    /* LE MIROIR SE MET À JOUR AUX DEUX BOUTS, et il le faut : un verbe qui
       ADOPTE un document (`validate({document})`) change le personnage ouvert
       du bloc `build` sans rien rendre. Ne suivre que les résultats laisserait
       le miroir en retard sur ce que le domaine tient réellement. */
    if (args.document !== undefined) open = args.document;
    if (isPlainObject(out) && out.document !== undefined) open = out.document;

    /* Le document ne repart JAMAIS dans un résultat d'outil : il est à la
       resource et à `mcp.document`, à un seul endroit. Ce n'est pas un
       élagage silencieux — les deux adresses sont dans la description de
       chaque outil et dans le contrat. */
    const published = isPlainObject(out) && out.document !== undefined
      ? Object.fromEntries(Object.entries(out).filter(([key]) => key !== "document"))
      : out;

    return toolResult(tool.render(published, args), published, false);
  }

  function currentDocument() {
    if (open === null) {
      throw new McpError(CODES.invalidParams,
        "Aucun personnage ouvert. Passe `document` à build.choose, build.set, build.override, build.rebuild " +
        "ou build.validate — le serveur ne lit aucun fichier, c'est l'appelant qui possède le stockage.");
    }
    return open;
  }

  /* ── LES RESOURCES ──────────────────────────────────────────────────── */

  function readResource(params) {
    const uri = params.uri;
    if (uri !== CHARACTER_URI) {
      throw new McpError(CODES.invalidParams,
        `Resource not found — ce serveur n'expose que « ${CHARACTER_URI} ».`,
        { uri: typeof uri === "string" ? uri : null });
    }
    if (open === null) {
      /* ⚠️ JAMAIS UN `contents` VIDE. La spécification l'interdit
         explicitement (« An empty array is ambiguous ») et la loi §0.5 le
         refusait déjà : une liste vide ressemble à une réponse. */
      throw new McpError(CODES.invalidParams,
        "Aucun personnage ouvert : la resource existe, son contenu n'existe pas encore. " +
        "Passe `document` à un outil de build, ou construis-en un.",
        { uri: CHARACTER_URI });
    }
    return {
      contents: [{ uri: CHARACTER_URI, mimeType: CHARACTER_RESOURCE.mimeType, text: JSON.stringify(open, null, 2) }]
    };
  }

  /* ── LES MÉTHODES ───────────────────────────────────────────────────── */

  const METHODS = {
    /* La spécification 2026-07-28 : « Servers MUST implement it. » */
    "server/discover"() {
      return {
        supportedVersions: SUPPORTED_VERSIONS.slice(),
        capabilities: { tools: {}, resources: {} },
        instructions: instructionsFor(mounted)
      };
    },
    "tools/list"() {
      return { tools: publishedTools(catalog) };
    },
    "tools/call"(params) {
      return callTool(params);
    },
    "resources/list"() {
      return { resources: [CHARACTER_RESOURCE] };
    },
    "resources/read"(params) {
      return readResource(params);
    },
    /* ── LA POIGNÉE DE MAIN QUI N'EXISTE PLUS ─────────────────────────────
       `initialize` est la méthode d'ouverture des révisions ≤ 2025-11-25.
       Ce serveur ne les parle pas. La spécification demande alors de NOMMER
       les versions supportées dans l'erreur : un client hérité n'a aucun
       mécanisme de rattrapage, et ce message est le seul diagnostic qu'il
       pourra montrer à son utilisateur. */
    initialize() {
      throw new McpError(CODES.methodNotFound,
        `Ce serveur ne parle que MCP ${SUPPORTED_VERSIONS.join(", ")}, qui n'a plus de poignée de main ` +
        "`initialize` : la version du protocole et les capacités du client voyagent dans " +
        `\`params._meta["${META.protocolVersion}"]\` de chaque requête. Appelle \`server/discover\`.`);
    }
  };

  /** Un message MCP entre, une réponse sort — ou `null` pour une
   *  notification, à laquelle il ne DOIT rien être répondu. */
  function handle(message) {
    if (!isPlainObject(message)) {
      return errorResponse(null, CODES.invalidRequest, "un message MCP est un objet JSON-RPC.");
    }
    if (isNotification(message)) return null;

    const id = typeof message.id === "string" || typeof message.id === "number" ? message.id : null;
    try {
      assertRequest(message);
      const params = message.params === undefined ? {} : message.params;
      /* La version et les capacités sont vérifiées AVANT la méthode : sur un
         protocole sans session, c'est le seul endroit où elles peuvent
         l'être, et une méthode servie sous une version inconnue serait servie
         sous des règles inconnues. */
      readMeta(params);
      const method = METHODS[message.method];
      if (typeof method !== "function" || !Object.hasOwn(METHODS, message.method)) {
        throw new McpError(CODES.methodNotFound,
          `Méthode inconnue « ${message.method} » — ce serveur répond à ${Object.keys(METHODS).join(", ")}.`);
      }
      return resultResponse(id, method(params), info);
    } catch (error) {
      if (error instanceof McpError) {
        return errorResponse(id, error.code, error.message, error.data);
      }
      /* Tout le reste est un défaut du serveur, et il se dit. Il ne peut pas
         s'agir d'un refus de règle : ceux-là sont attrapés dans `callTool` et
         repartent en résultat marqué en échec. */
      const kind = errorKind(error);
      return errorResponse(id, CODES.internalError,
        `${kind} — ${error && error.message ? error.message : String(error)}`);
    }
  }

  return { name: "mcp", handle };
}

export { PROTOCOL_VERSION };
