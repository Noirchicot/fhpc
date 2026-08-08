/* L'erreur de PROTOCOLE, nommée — et elle n'est pas l'erreur d'un outil.

   Le protocole MCP sépare deux échecs qui n'ont rien à voir (spécification
   2026-07-28, « Tools › Error Handling ») :

   - une **erreur de protocole** : la requête elle-même ne tient pas debout
     (JSON illisible, méthode inconnue, outil inconnu, `_meta` incomplet). Elle
     part en réponse JSON-RPC `error`, avec un code. Le modèle ne peut
     généralement rien en faire.
   - une **erreur d'outil** : l'outil a été appelé correctement et la règle a
     refusé. Elle part en RÉSULTAT marqué `isError: true`, et le modèle peut
     s'en servir pour se corriger.

   `McpError` porte la PREMIÈRE. La seconde n'est pas une exception du tout :
   c'est un résultat, fabriqué dans `surface.mjs`. Confondre les deux serait
   soit tuer le serveur sur un refus de règle, soit rendre un succès vide sur
   une requête malformée — les deux formes de repli silencieux que la loi §0.5
   interdit. */

export class McpError extends Error {
  constructor(code, message, data) {
    super(message);
    this.name = "McpError";
    this.code = code;
    if (data !== undefined) this.data = data;
  }
}

/* ── LES CODES ──────────────────────────────────────────────────────────
   Les cinq premiers sont ceux de JSON-RPC 2.0. Le sixième est alloué par la
   spécification MCP 2026-07-28 dans sa plage réservée `-32020`…`-32099`.

   ⚠️ La spécification INTERDIT d'inventer un code dans `-32020`…`-32099`
   (« Implementations MUST NOT emit any code from this sub-range that is not
   defined by this specification ») et DÉCONSEILLE `-32000`…`-32019`, hérité.
   Ce bloc n'en alloue donc aucun : tout ce qui n'est pas ci-dessous voyage
   dans un résultat en échec, là où le modèle peut le lire. */
export const CODES = {
  /** JSON illisible sur la ligne. */
  parseError: -32700,
  /** L'objet reçu n'est pas une requête JSON-RPC 2.0. */
  invalidRequest: -32600,
  /** Méthode MCP inconnue de ce serveur. */
  methodNotFound: -32601,
  /** Paramètres invalides — c'est aussi le code d'un OUTIL INCONNU et d'une
   *  RESOURCE INCONNUE (spécification 2026-07-28, `tools`/`resources`). */
  invalidParams: -32602,
  /** Défaut du serveur. */
  internalError: -32603,
  /** `UnsupportedProtocolVersionError`, alloué par MCP 2026-07-28. */
  unsupportedProtocolVersion: -32022
};

/** Le nom de la classe d'une erreur, tel qu'il doit ARRIVER À L'IA.
 *
 *  ⚠️ On lit `constructor.name` et pas `name` : mesuré le 2026-08-08,
 *  `BuildError` pose bien `this.name = "BuildError"` alors que `LayerError`
 *  ne pose rien et se présente donc comme un `Error` nu. Les deux doivent
 *  arriver NOMMÉES à l'autre bout — « niveau absent » doit se lire comme un
 *  refus du bloc `build`, pas comme un incident anonyme.
 *
 *  Aucun `instanceof` n'est possible ici, et c'est voulu : `src/mcp/`
 *  n'importe ni `src/build/` ni `src/layers/` (décision D3). Le nom de classe
 *  est la seule frontière qui traverse sans dépendance — et elle tient parce
 *  que ce dépôt n'a aucune étape de compilation (loi §0.11) qui pourrait la
 *  renommer. */
export function errorKind(error) {
  if (!error || typeof error !== "object") return "Error";
  const fromClass = error.constructor && typeof error.constructor.name === "string"
    ? error.constructor.name
    : "";
  if (fromClass) return fromClass;
  return typeof error.name === "string" && error.name ? error.name : "Error";
}
