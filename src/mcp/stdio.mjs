/* ══ LE TRANSPORT stdio — UN MESSAGE JSON-RPC PAR LIGNE ════════════════
   Lot 10-mcp-v0. Écrit à la main (décision D1) contre la révision
   **2026-07-28**, lue le **2026-08-08**.

   Les règles du cadrage, telles que la spécification les pose :
   · le serveur lit ses messages sur `stdin` et écrit les siens sur `stdout` ;
   · un message par ligne, en UTF-8, **sans saut de ligne à l'intérieur** ;
   · le serveur **NE DOIT RIEN** écrire sur `stdout` qui ne soit un message
     MCP — un `console.log` de débogage y casse le flux du client ;
   · `stderr` est libre pour la journalisation, et le client ne doit pas en
     déduire qu'il y a eu une erreur ;
   · le serveur **DEVRAIT** s'arrêter dès que son entrée standard est fermée :
     c'est le seul signal d'arrêt portable.

   ── LES FLUX SONT INJECTÉS, PAS PRIS ───────────────────────────────────
   Ce fichier ne nomme jamais `process`. Il reçoit `{input, output, log}`, ce
   qui a deux effets : la racine de composition (`bin/fhpc-mcp.mjs`) reste le
   seul endroit du dépôt qui connaisse le processus, et une suite peut faire
   tourner le transport ENTIER en mémoire sur deux `PassThrough`. Le garde
   structurel interdit `process` ici, et il est attaqué. */

import { CODES, McpError } from "./errors.mjs";
import { encodeLine, errorResponse, parseLine } from "./protocol.mjs";

/**
 * Fait tourner la boucle stdio d'un adaptateur MCP.
 *
 * @param {object} options
 * @param {import("node:stream").Readable} options.input  les messages entrants.
 * @param {import("node:stream").Writable} options.output les messages sortants — RIEN d'autre.
 * @param {import("node:stream").Writable} [options.log]  la journalisation, jamais lue par le protocole.
 * @param {{handle: Function}} options.mcp                l'adaptateur.
 * @param {Function} [options.onClose]                    appelé quand l'entrée se ferme.
 */
export function serveStdio({ input, output, log, mcp, onClose }) {
  if (!input || typeof input.on !== "function") {
    throw new McpError(CODES.internalError, "serveStdio needs an input stream.");
  }
  if (!output || typeof output.write !== "function") {
    throw new McpError(CODES.internalError, "serveStdio needs an output stream.");
  }
  if (!mcp || typeof mcp.handle !== "function") {
    throw new McpError(CODES.internalError, "serveStdio needs an mcp adapter with a `handle`.");
  }

  function note(line) {
    if (log && typeof log.write === "function") log.write(`${line}\n`);
  }

  function send(message) {
    if (message === null) return;
    let encoded;
    try {
      encoded = encodeLine(message);
    } catch (error) {
      /* Un message qu'on ne sait pas sérialiser ne part pas à moitié : il
         devient une erreur de protocole, sérialisable elle. Écrire du JSON
         tronqué sur `stdout` désynchroniserait le client pour toujours. */
      note(`fhpc/mcp: réponse non sérialisable — ${error.message}`);
      encoded = encodeLine(errorResponse(
        message && message.id !== undefined ? message.id : null,
        CODES.internalError,
        `réponse non sérialisable — ${error.message}`
      ));
    }
    output.write(encoded);
  }

  function receive(line) {
    /* Une ligne vide n'est pas un message : deux `\n` de suite, ou un `\r\n`
       traité ailleurs, ne doivent pas produire une erreur de protocole pour
       un message que personne n'a envoyé. */
    const text = line.trim();
    if (text.length === 0) return;
    let message;
    try {
      message = parseLine(text);
    } catch (error) {
      /* Le seul cas où la spécification autorise une réponse sans `id`
         corrélé : l'`id` n'a pas pu être lu. */
      send(errorResponse(null, error.code || CODES.parseError, error.message));
      return;
    }
    send(mcp.handle(message));
  }

  /* Le découpage par ligne, à la main. `setEncoding` fait le décodage UTF-8 à
     travers les frontières de morceaux — un caractère à quatre octets coupé
     en deux par le tampon du système ne doit pas devenir deux caractères de
     remplacement, ce qui changerait l'empreinte d'une couche transportée en
     texte. */
  let pending = "";
  input.setEncoding("utf8");
  input.on("data", (chunk) => {
    pending += chunk;
    let cut = pending.indexOf("\n");
    while (cut >= 0) {
      const line = pending.slice(0, cut);
      pending = pending.slice(cut + 1);
      receive(line);
      cut = pending.indexOf("\n");
    }
  });

  input.on("end", () => {
    /* Une dernière ligne sans saut final est un message complet : le client a
       fermé le flux, pas tronqué son message. */
    if (pending.length > 0) {
      const last = pending;
      pending = "";
      receive(last);
    }
    note("fhpc/mcp: entrée fermée, arrêt.");
    if (typeof onClose === "function") onClose();
  });

  input.on("error", (error) => {
    note(`fhpc/mcp: erreur de flux d'entrée — ${error.message}`);
    if (typeof onClose === "function") onClose();
  });

  return { send };
}
