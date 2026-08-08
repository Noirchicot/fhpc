/* Harnais du bloc `mcp` (lot 10).

   ⚠️ CE FICHIER NE CONTIENT AUCUN APPEL À `dispatch`, ET C'EST VÉRIFIÉ.
   Un garde de `tests/mcp-block.test.mjs` lit la source de ce fichier ET celle
   de `tests/mcp-acceptance.test.mjs` et exige qu'aucune ligne n'y appelle le
   noyau. Sans lui, « le personnage est construit par la surface MCP seule »
   serait une promesse de commentaire — et ce dépôt a déjà mesuré qu'une
   promesse en commentaire n'est pas une garantie.

   Deux clients, et il en faut deux :
   · `makeClient` parle à un adaptateur EN MÉMOIRE. Il prouve l'adaptateur.
   · `spawnServer` lance le serveur comme un VRAI PROCESSUS ENFANT et lui
     parle en JSON-RPC sur son entrée standard. Lui seul prouve la LIGNE :
     le cadrage, l'encodage, la propreté de `stdout`, l'arrêt. Un test en
     processus ne prouve que la moitié du chemin. */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { registerLayers } from "../src/layers/index.mjs";
import { registerBuild } from "../src/build/index.mjs";
import { registerDoc } from "../src/doc/index.mjs";
import { connectMcp, META, PROTOCOL_VERSION } from "../src/mcp/index.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SRD_FR = "layers/srd-5.2.1-fr.layer.json";
export const HOMEBREW = "examples/layer-homebrew-fr.fh-layer.json";
export const EXAMPLE_CHAR = "examples/personnage-srd-fr-niveau1.fh-char.json";
export const SERVER = join(ROOT, "bin", "fhpc-mcp.mjs");

export function fileText(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}
export function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

/** Les champs `_meta` que MCP 2026-07-28 exige sur CHAQUE requête. Il n'y a
 *  plus de poignée de main où les poser une fois pour toutes. */
export function requestMeta(overrides = {}) {
  return Object.assign({
    [META.protocolVersion]: PROTOCOL_VERSION,
    [META.clientInfo]: { name: "tests/mcp-harness", version: "1.0.0" },
    [META.clientCapabilities]: {}
  }, overrides);
}

/* ══ LE CLIENT EN MÉMOIRE ══════════════════════════════════════════════ */

/** Monte les blocs du domaine sur le noyau et rend un adaptateur câblé
 *  dessus. C'est ce que fait `bin/fhpc-mcp.mjs`, sans le processus.
 *
 *  ⚠️ `defineBlock` jette sur un double enregistrement (c'est une bonne loi
 *  pour une application) : une seule `openSurface` par fichier de suite.
 *
 *  `storage` monte le bloc `doc` — exactement comme `--store` côté binaire.
 *  Omis, le serveur n'a pas de magasin et ne publie pas les outils `doc.*` :
 *  les deux montages sont donc éprouvés par les suites, pas seulement celui
 *  qui a un magasin. */
export function openSurface({ now, storage } = {}) {
  registerLayers();
  let tick = 0;
  registerBuild({ now: now || (() => `2026-08-08T14:00:${String(tick++).padStart(2, "0")}Z`) });
  const blocks = ["layers", "build"];
  if (storage) {
    registerDoc({ storage, schema: readJson("schemas/fh-char.schema.json") });
    blocks.push("doc");
  }
  return connectMcp({ serverInfo: { name: "fhpc", version: "0.1.0" }, blocks });
}

export function makeClient(mcp) {
  let id = 0;
  const sent = [];

  /** Une requête JSON-RPC brute — c'est le seul geste de ce client. */
  function request(method, params = {}, meta) {
    const message = {
      jsonrpc: "2.0",
      id: (id += 1),
      method,
      params: Object.assign({}, params, { _meta: meta === null ? undefined : requestMeta(meta) })
    };
    if (meta === null) delete message.params._meta;
    sent.push(message);
    return mcp.handle(message);
  }

  /** Un appel d'outil. Jette si le PROTOCOLE a refusé — un refus de protocole
   *  dans une suite d'acceptation est un défaut de la suite, pas un résultat
   *  à inspecter. */
  function call(name, args = {}) {
    const response = request("tools/call", { name, arguments: args });
    if (response.error) {
      throw new Error(`erreur de PROTOCOLE sur « ${name} » : ${response.error.code} ${response.error.message}`);
    }
    return response.result;
  }

  /** Un appel d'outil qui DOIT réussir. Rend directement le
   *  `structuredContent` — c'est là que vit la matière. */
  function ok(name, args = {}) {
    const result = call(name, args);
    if (result.isError) {
      throw new Error(`l'outil « ${name} » a refusé : ${result.content[0].text}`);
    }
    return result.structuredContent;
  }

  return { request, call, ok, sent, get count() { return id; } };
}

/* ══ LE CLIENT DE TRANSPORT — UN VRAI PROCESSUS ENFANT ═════════════════ */

/**
 * Lance `bin/fhpc-mcp.mjs` et parle JSON-RPC sur son entrée standard.
 *
 * ⚠️ CHAQUE LIGNE DE `stdout` EST ANALYSÉE. Une ligne qui n'est pas du JSON
 * fait échouer la lecture au lieu d'être ignorée : « le serveur NE DOIT RIEN
 * écrire sur `stdout` qui ne soit un message MCP », et un `console.log` oublié
 * est exactement la faute que ce client doit voir.
 *
 * ⚠️ PASSE-LUI LE CONTEXTE DU TEST (`t`). Sans lui, une assertion qui échoue
 * saute par-dessus le `close()` et laisse un processus enfant vivant : le
 * lanceur de tests attend alors une poignée qui ne se fermera jamais, et une
 * suite ROUGE devient une suite QUI PEND. Mesuré le 2026-08-08 en écrivant ce
 * lot, sur un `layers.register` qui refusait à raison. Un test qui pend est
 * pire qu'un test rouge : il ne dit même pas ce qui ne va pas.
 *
 * @param {import("node:test").TestContext} [t] le contexte du test, pour le nettoyage.
 */
export function spawnServer(t, argv = [SERVER]) {
  const child = spawn(process.execPath, argv, { stdio: ["pipe", "pipe", "pipe"] });
  const pending = new Map();
  const stderr = [];
  const junk = [];
  let pendingText = "";
  let id = 0;
  let exit = null;

  const exited = new Promise((resolve) => {
    child.on("close", (code, signal) => { exit = { code, signal }; resolve(exit); });
  });

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    pendingText += chunk;
    let cut = pendingText.indexOf("\n");
    while (cut >= 0) {
      const line = pendingText.slice(0, cut);
      pendingText = pendingText.slice(cut + 1);
      if (line.trim().length > 0) receive(line);
      cut = pendingText.indexOf("\n");
    }
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => stderr.push(chunk));

  function receive(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch (error) {
      junk.push(line);
      return;
    }
    const key = message.id === null || message.id === undefined ? "@null" : message.id;
    const seat = pending.get(key);
    if (seat) {
      pending.delete(key);
      seat(message);
    } else {
      junk.push(line);
    }
  }

  function send(method, params = {}, meta) {
    const key = (id += 1);
    const message = {
      jsonrpc: "2.0",
      id: key,
      method,
      params: Object.assign({}, params, { _meta: requestMeta(meta) })
    };
    if (meta === null) delete message.params._meta;
    const answer = new Promise((resolve) => pending.set(key, resolve));
    child.stdin.write(JSON.stringify(message) + "\n");
    return answer;
  }

  /** Écrit une ligne BRUTE — pour éprouver le cadrage lui-même. `key` dit
   *  sous quel `id` attendre la réponse (`"@null"` pour une erreur d'analyse,
   *  qui ne peut pas corréler). */
  function raw(line, key) {
    const answer = new Promise((resolve) => pending.set(key, resolve));
    child.stdin.write(line);
    return answer;
  }

  async function call(name, args = {}) {
    const response = await send("tools/call", { name, arguments: args });
    if (response.error) {
      throw new Error(`erreur de PROTOCOLE sur « ${name} » : ${response.error.code} ${response.error.message}`);
    }
    return response.result;
  }

  async function ok(name, args = {}) {
    const result = await call(name, args);
    if (result.isError) throw new Error(`l'outil « ${name} » a refusé : ${result.content[0].text}`);
    return result.structuredContent;
  }

  /** Ferme l'entrée standard et attend que le serveur sorte de lui-même —
   *  c'est le signal d'arrêt que la spécification appelle le seul portable.
   *  Le `SIGKILL` de secours n'est pas là pour le cas normal : il est là pour
   *  qu'un serveur qui refuserait de sortir donne une suite ROUGE (le code de
   *  sortie ne sera pas 0) plutôt qu'une suite qui pend. */
  function close({ grace = 5000 } = {}) {
    if (exit) return exited;
    child.stdin.end();
    const hammer = setTimeout(() => child.kill("SIGKILL"), grace);
    if (typeof hammer.unref === "function") hammer.unref();
    return exited.then((done) => { clearTimeout(hammer); return done; });
  }

  if (t && typeof t.after === "function") t.after(() => close());

  return {
    child, send, raw, call, ok, close, exited,
    get junk() { return junk.slice(); },
    get stderr() { return stderr.join(""); },
    get exit() { return exit; }
  };
}

/* ══ LE PERSONNAGE D'ACCEPTATION ═══════════════════════════════════════
   Les mêmes décisions que celles du lot 9, rejouées par la surface MCP. Le
   fichier d'exemple fait foi : ses `build.choices` sont repris mot pour mot,
   et rien n'est ajouté ici. */

export const FICHIER = readJson(EXAMPLE_CHAR);

/** Un document NEUF : la pile telle que la surface vient de la manifester, et
 *  rien d'autre. Pas de `resolved` recopié — il se confondrait avec un
 *  résultat. */
export function documentVierge(stack) {
  return {
    schema: "fh-char/1",
    id: FICHIER.id,
    name: FICHIER.name,
    lang: FICHIER.lang,
    units: FICHIER.units,
    created: FICHIER.created,
    modified: FICHIER.modified,
    build: {
      layers: stack.map((layer) => ({ id: layer.id, version: layer.version, hash: layer.hash, name: layer.name })),
      choices: [],
      budgets: {},
      overrides: []
    }
  };
}

/** L'outil qui pose une décision : `choose` pour un record, `set` pour un
 *  scalaire. Les deux moitiés de « `ref` OU `value` », côté MCP. */
export function toolFor(choice) {
  return choice.ref !== undefined ? "build.choose" : "build.set";
}
