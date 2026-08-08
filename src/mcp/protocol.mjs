/* ══ JSON-RPC 2.0 + MCP 2026-07-28, ÉCRIT À LA MAIN ════════════════════
   Lot 10-mcp-v0. Aucune I/O ici : ce fichier lit une ligne et fabrique une
   réponse, rien d'autre. Le transport est dans `stdio.mjs`, la surface dans
   `surface.mjs`.

   ── POURQUOI PAS LE SDK (décision D1 de l'architecte) ──────────────────
   `@modelcontextprotocol/sdk` est une dépendance de RUNTIME, et la loi §0.11
   est absolue : zéro build, zéro framework, zéro dépendance runtime. Le
   protocole est du texte : un objet JSON par ligne. On l'écrit.

   ── ⚠️ LA SPÉCIFICATION VISÉE, ET LA DATE OÙ ELLE A ÉTÉ LUE ────────────
   Révision **2026-07-28**, vérifiée sur modelcontextprotocol.io le
   **2026-08-08**. Elle N'EST PAS celle que la plupart des textes décrivent, et
   la différence n'est pas un détail :

   · **il n'y a plus de poignée de main `initialize`, ni de session de
     protocole.** Le protocole est STATELESS : chaque requête porte elle-même
     sa version et les capacités de son client, dans `params._meta`.
   · **tout `result` porte un `resultType`.** Absent, un client d'une révision
     antérieure le lit comme `"complete"` ; ici on l'écrit toujours.
   · **`server/discover` remplace la découverte**, et un serveur DOIT
     l'implémenter.
   · **le code d'une resource absente est `-32602`**, plus `-32002` (réservé,
     interdit d'émission par cette révision).
   · **`-32022` (`UnsupportedProtocolVersionError`)** est le seul code de la
     plage réservée que ce serveur émet.

   Écrire ce fichier de mémoire aurait produit une poignée de main qui
   n'existe plus. C'est la règle de la §3 du lot, et elle a déjà été payée
   ailleurs sur ce chantier. */

import { CODES, McpError } from "./errors.mjs";

/** La révision du protocole que ce serveur parle. */
export const PROTOCOL_VERSION = "2026-07-28";

/** Les révisions supportées, telles qu'un `-32022` les annonce. Une seule :
 *  ce serveur n'implémente pas la poignée de main héritée (voir `surface.mjs`,
 *  méthode `initialize`). */
export const SUPPORTED_VERSIONS = [PROTOCOL_VERSION];

/** Les clefs réservées de `_meta`, à la lettre. Elles sont ici en toutes
 *  lettres parce que ce sont des clefs de PROTOCOLE : les recopier ailleurs
 *  serait la deuxième copie qui divergera. */
export const META = {
  protocolVersion: "io.modelcontextprotocol/protocolVersion",
  clientInfo: "io.modelcontextprotocol/clientInfo",
  clientCapabilities: "io.modelcontextprotocol/clientCapabilities",
  serverInfo: "io.modelcontextprotocol/serverInfo"
};

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Une ligne → un message. Jette `McpError(-32700)` sur du JSON illisible.
 *
 *  ⚠️ Le message n'a pas d'`id` utilisable à ce stade : c'est le seul cas où
 *  la spécification autorise une réponse d'erreur sans `id` corrélé
 *  (« except in error cases where the ID could not be read »). */
export function parseLine(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    throw new McpError(CODES.parseError, `JSON illisible sur la ligne — ${error.message}`);
  }
  if (!isPlainObject(message)) {
    throw new McpError(CODES.invalidRequest,
      "un message MCP est un objet JSON-RPC ; un tableau (lot) ou un scalaire n'en est pas un.");
  }
  return message;
}

/** Le message est-il une NOTIFICATION ? (pas d'`id` ⇒ aucune réponse.)
 *  La spécification est mot pour mot : « The receiver MUST NOT send a
 *  response. » Un serveur bavard sur une notification casse la corrélation
 *  d'`id` du client. */
export function isNotification(message) {
  return typeof message.method === "string" && message.id === undefined;
}

/** Vérifie l'enveloppe d'une REQUÊTE. Jette en nommant ce qui manque. */
export function assertRequest(message) {
  if (message.jsonrpc !== "2.0") {
    throw new McpError(CODES.invalidRequest,
      `\`jsonrpc\` vaut ${JSON.stringify(message.jsonrpc)} — JSON-RPC 2.0 exige exactement "2.0".`);
  }
  if (typeof message.method !== "string" || message.method.length === 0) {
    throw new McpError(CODES.invalidRequest, "`method` manque ou n'est pas une chaîne.");
  }
  if (message.id === null) {
    throw new McpError(CODES.invalidRequest,
      "`id` vaut null — MCP l'interdit explicitement, à la différence de JSON-RPC nu.");
  }
  if (typeof message.id !== "string" && typeof message.id !== "number") {
    throw new McpError(CODES.invalidRequest,
      `\`id\` doit être une chaîne ou un nombre (reçu ${typeof message.id}).`);
  }
  if (message.params !== undefined && !isPlainObject(message.params)) {
    throw new McpError(CODES.invalidParams, "`params` doit être un objet.");
  }
  return message;
}

/** Lit et VALIDE les champs de protocole par requête.
 *
 *  ⚠️ C'est ici que le stateless se paye et se tient : il n'y a aucune
 *  poignée de main où vérifier la version une fois pour toutes, donc on la
 *  vérifie à CHAQUE requête. Un champ requis absent est un `-32602`, une
 *  version non supportée un `-32022` qui NOMME ce qu'on sait parler. */
export function readMeta(params) {
  const meta = params && isPlainObject(params._meta) ? params._meta : null;
  if (!meta) {
    throw new McpError(CODES.invalidParams,
      `\`params._meta\` manque — MCP ${PROTOCOL_VERSION} est stateless : chaque requête porte sa version ` +
      `de protocole (${META.protocolVersion}) et les capacités de son client (${META.clientCapabilities}).`);
  }
  const version = meta[META.protocolVersion];
  if (typeof version !== "string") {
    throw new McpError(CODES.invalidParams,
      `\`_meta["${META.protocolVersion}"]\` manque ou n'est pas une chaîne — il est REQUIS sur chaque requête.`);
  }
  const capabilities = meta[META.clientCapabilities];
  if (!isPlainObject(capabilities)) {
    throw new McpError(CODES.invalidParams,
      `\`_meta["${META.clientCapabilities}"]\` manque ou n'est pas un objet — il est REQUIS sur chaque ` +
      "requête. Un objet vide `{}` est une déclaration valide : « je n'offre aucune capacité ».");
  }
  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new McpError(CODES.unsupportedProtocolVersion,
      `Unsupported protocol version — ce serveur parle ${SUPPORTED_VERSIONS.join(", ")}.`,
      { supported: SUPPORTED_VERSIONS.slice(), requested: version });
  }
  const clientInfo = isPlainObject(meta[META.clientInfo]) ? meta[META.clientInfo] : null;
  return { version, capabilities, clientInfo };
}

/** Une réponse de RÉSULTAT. `resultType` et `serverInfo` sont posés ici, à un
 *  seul endroit : les oublier sur une méthode et pas sur une autre est le
 *  genre d'écart qu'aucun test ne rattrape s'il n'a qu'une source. */
export function resultResponse(id, payload, serverInfo) {
  const result = Object.assign({ resultType: "complete" }, payload);
  if (serverInfo) {
    result._meta = Object.assign({}, result._meta, { [META.serverInfo]: serverInfo });
  }
  return { jsonrpc: "2.0", id, result };
}

/** Une réponse d'ERREUR DE PROTOCOLE. */
export function errorResponse(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id: id === undefined ? null : id, error };
}

/** Sérialise un message pour la ligne.
 *
 *  ⚠️ « Messages are delimited by newlines, and MUST NOT contain embedded
 *  newlines. » `JSON.stringify` sans indentation ne produit aucun saut de
 *  ligne littéral — les sauts DANS les chaînes sont échappés en `\n`, donc un
 *  message d'erreur multiligne voyage sans casser le cadrage. La vérification
 *  est faite quand même, et elle JETTE : un cadrage cassé désynchronise le
 *  client sur tous les messages suivants, et il n'y a pas de resynchronisation
 *  possible. */
export function encodeLine(message) {
  const text = JSON.stringify(message);
  if (text === undefined) {
    throw new McpError(CODES.internalError, "message non sérialisable en JSON.");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new McpError(CODES.internalError,
      "message contenant un saut de ligne littéral — le cadrage stdio serait cassé pour tout ce qui suit.");
  }
  return text + "\n";
}
