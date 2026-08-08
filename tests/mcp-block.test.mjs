/* Lot 10 — L'ADAPTATEUR DERRIÈRE LE NOYAU, ET SES LOIS DE FRONTIÈRE.

   ⚠️ LES GARDES SONT ÉCRITS POUR ÊTRE ATTAQUÉS. Le 2026-08-08, `play-block` a
   montré qu'un garde vert depuis trois lots pouvait ne rien garder : il
   comptait des fichiers, et pointé ailleurs il comptait toujours. Ici comme
   aux lots 7 et 9, l'inspection est une FONCTION PURE (`inspect`) et son
   périmètre une autre (`perimeterGaps`) ; les deux tournent sur le vrai
   `src/mcp/` ET sur des sources fabriquées qui les violent, une violation à
   la fois. L'arpenteur est RÉCURSIF : `src/mcp/sous/` n'est pas une porte de
   sortie.

   Le périmètre est une LISTE DE NOMS, pas un compte. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import { createLayers } from "../src/layers/index.mjs";
import { createBuild } from "../src/build/index.mjs";
import { createMcp, TOOLS, PROTOCOL_VERSION, META, CODES } from "../src/mcp/index.mjs";
import { loadSources, findForbidden, stripComments, HOUSE_MECHANICS } from "./source-scan.mjs";
import { makeBus } from "./build-harness.mjs";
import {
  FICHIER, HOMEBREW, SRD_FR,
  documentVierge, fileText, makeClient, requestMeta, toolFor
} from "./mcp-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const mcpDir = path.join(here, "..", "src", "mcp");
const sources = () => loadSources([mcpDir], mcpDir);

/* ── GARDE 1 : LES DÉPENDANCES INTERDITES ───────────────────────────── */

const FORBIDDEN = [
  /* LE DOMAINE. C'est L'INTERDIT CENTRAL de ce lot (décision D3) : un
     adaptateur qui importe le bloc qu'il adapte n'est plus un adaptateur, et
     « zéro logique de règles » redevient une promesse. Le `dispatch` du noyau
     est le seul chemin. */
  [/\.\.\/build\//, "un import de src/build/"],
  [/\.\.\/layers\//, "un import de src/layers/"],
  [/\.\.\/play\//, "un import de src/play/"],
  [/\.\.\/modules\//, "un import de src/modules/"],
  [/\.\.\/schemas\//, "un import de src/schemas/"],
  [/\.\.\/tools\//, "un import de src/tools/"],
  /* LE DISQUE. « Le personnage appartient au joueur » : c'est l'appelant qui
     possède le stockage, et le bloc `doc` n'existe pas au M2. Fabriquer ici
     un `open`/`save` préempterait sa tranche (décision D2, loi §0.6). */
  [/node:fs\b/, "node:fs"],
  [/node:path\b/, "node:path"],
  [/\breadFileSync\b/, "readFileSync"],
  [/\bwriteFileSync\b/, "writeFileSync"],
  [/\bhomedir\b/, "homedir"],
  /* LE PROCESSUS. Les flux sont INJECTÉS. La racine de composition
     (`bin/fhpc-mcp.mjs`) est le seul endroit qui connaisse `process` — c'est
     ce qui permet de faire tourner le transport entier en mémoire. */
  [/\bprocess\s*\./, "process"],
  [/node:child_process\b/, "node:child_process"],
  [/\bspawn\s*\(/, "spawn("],
  /* LE RÉSEAU. Le transport de ce lot est stdio, et rien d'autre. Un `fetch`
     ici serait un serveur mondial à maintenir (loi §0.9). */
  [/\bfetch\s*\(/, "fetch("],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\bsetInterval\b/, "setInterval"],
  /* LE DOM. Comme aux blocs `layers` et `build`, le mot `document` n'est PAS
     interdit : c'est le mot du domaine ici (un `fh-char/1` est un document).
     Le DOM est interdit par ses formes atteignables. */
  [/\bwindow\b/, "window"],
  [/globalThis\s*\.\s*document\b/, "globalThis.document"],
  [/\bdocument\s*\.\s*(getElementById|querySelector|createElement|body|head|write)\b/, "le document du DOM"],
  [/querySelector/, "querySelector"],
  [/\binnerHTML\b/, "innerHTML"],
  [/\blocalStorage\b/, "localStorage"],
  /* L'adaptateur ne décide de rien : ni d'un hasard, ni d'une heure. */
  [/Math\.random/, "Math.random"],
  [/\bnew Date\b|\bDate\.now\b/, "l'horloge de plate-forme"],
  /* AUCUNE COUCHE, AUCUNE LANGUE EN DUR. */
  [/srd-5\.2\.1/, "l'id d'une couche en dur"],
  [/["'](fr|en)["']/, "une langue en dur"]
];

/* ⚠️ `setTimeout` n'est PAS dans la liste, et c'est un choix, pas un oubli :
   `stdio.mjs` n'en emploie aucun aujourd'hui, mais un minuteur y serait un
   outil de transport légitime (temporisation d'écriture), pas une mécanique
   de règle. L'interdire ici sans besoin serait un garde qui garde une porte
   qu'on n'a pas de raison de fermer. Le vrai interdit est au-dessus : aucune
   décision de DOMAINE ne se prend dans ce répertoire. */

function inspect(list) {
  return findForbidden(list, FORBIDDEN)
    .concat(findForbidden(list, HOUSE_MECHANICS))
    .map(({ name, label }) => `src/mcp/${name} : « ${label} »`);
}

/* ── GARDE 2 : LE PÉRIMÈTRE, PAR SES NOMS ───────────────────────────── */

const MUST_INSPECT = ["errors.mjs", "index.mjs", "protocol.mjs", "stdio.mjs", "surface.mjs", "tools.mjs"];
function perimeterGaps(list) {
  const seen = new Set(list.map((source) => source.name));
  return MUST_INSPECT.filter((name) => !seen.has(name));
}

/* ── GARDE 3 : « PAR LA SURFACE MCP SEULE » EST VÉRIFIÉ, PAS PROMIS ───
   Le test d'acceptation de ce lot affirme qu'aucune de ses lignes n'atteint
   le domaine autrement que par un message MCP. Sans ce garde-ci, ce serait
   une promesse de commentaire — et ce dépôt a déjà mesuré (lot 9, garde de
   dérive schéma↔code) qu'une promesse en commentaire n'est pas une garantie. */

const BYPASS = [
  [/\bdispatch\s*\(/, "un appel direct au noyau"],
  [/\.verbs\b/, "un accès direct aux verbes d'un bloc"],
  [/\bderive\s*\(/, "un appel direct au dériveur"],
  [/\.\.\/src\/(build|layers|play|modules)\/(?!index\.mjs)/, "un import d'un rouage interne d'un bloc"]
];

const PROVEN_BY_MCP_ONLY = ["mcp-acceptance.test.mjs", "mcp-harness.mjs"];
function bypasses(list) {
  return findForbidden(list, BYPASS).map(({ name, label }) => `tests/${name} : « ${label} »`);
}
function suiteSources() {
  return PROVEN_BY_MCP_ONLY.map((name) => {
    const raw = fs.readFileSync(path.join(here, name), "utf8");
    return { name, raw, text: stripComments(raw) };
  });
}

/* ── UNE SURFACE LOCALE, SANS LE REGISTRE DU NOYAU ──────────────────────
   Le registre est un singleton et `defineBlock` jette sur un double
   enregistrement : bonne loi pour une application, ingérable pour une suite.
   On câble donc des INSTANCES et un `dispatch` local — c'est le même chemin
   qu'en production, avec un aiguillage différent (même partage qu'au
   `build-harness` du lot 9). */
function localSurface({ layers: files = [SRD_FR, HOMEBREW], extra } = {}) {
  const bus = makeBus();
  const layers = createLayers({ bus });
  const routes = [];
  /* ⚠️ CE `dispatch` IMITE LE NOYAU JUSQUE DANS SES REFUS, et pas seulement
     dans ses succès. Trouvé en attaquant l'arbre le 2026-08-08 : une première
     version se contentait de `build.verbs[verb](payload)`, donc un verbe
     inexistant y donnait un `TypeError` au lieu du « unknown verb » du
     registre — et le garde de route restait VERT sur une route cassée. Un
     harnais qui n'imite pas les refus de ce qu'il remplace ne remplace rien. */
  const dispatch = (route, payload) => {
    routes.push(route);
    const [block, verb] = route.split(".");
    const target = block === "layers" ? layers.verbs : block === "build" ? build.verbs : null;
    if (!target) throw new Error(`fhpc/kernel: unknown block "${block}"`);
    if (typeof target[verb] !== "function") {
      throw new Error(`fhpc/kernel: unknown verb "${verb}" on block "${block}"`);
    }
    return target[verb](payload);
  };
  let tick = 0;
  const build = createBuild({ bus, dispatch, now: () => `2026-08-08T15:00:${String(tick++).padStart(2, "0")}Z` });
  for (const file of files) layers.verbs.register({ bytes: fileText(file), origin: file });
  if (extra) {
    layers.verbs.register({ bytes: JSON.stringify(extra, null, 2) + "\n", origin: "couche du scénario" });
  }
  const mcp = createMcp({ dispatch, serverInfo: { name: "fhpc", version: "0.0.0-test" } });
  return { mcp, client: makeClient(mcp), routes, bus };
}

/* ── LA SURFACE ─────────────────────────────────────────────────────── */

test("l'instance ne rend que {name, handle} — l'adaptateur n'a aucune poignée d'état", () => {
  const { mcp } = localSurface({ layers: [] });
  assert.deepEqual(Object.keys(mcp).sort(), ["handle", "name"]);
  assert.equal(mcp.name, "mcp");
});

test("createMcp refuse de se construire sans dispatch et sans serverInfo", () => {
  assert.throws(() => createMcp({}), /needs a dispatch/);
  assert.throws(() => createMcp({ dispatch() {} }), /needs a serverInfo/);
  /* Et le refus est une erreur de PROTOCOLE nommée, pas un `Error` nu : un
     serveur mal câblé doit se distinguer d'un serveur qui refuse une règle. */
  assert.throws(() => createMcp({}), (error) => {
    assert.equal(error.name, "McpError");
    assert.equal(error.code, CODES.internalError);
    return true;
  });
});

test("l'adaptateur n'atteint le domaine QUE par dispatch — et seulement par les routes de son catalogue", () => {
  const { client, routes } = localSurface();
  routes.length = 0;
  client.ok("layers.stack");
  client.ok("layers.query", { kind: "species", id: "srd:species:fr:elfe" });
  client.ok("build.validate", { document: documentVierge(client.ok("layers.stack")) });
  assert.deepEqual([...new Set(routes)].sort(), ["layers.query", "layers.stack", "build.validate"].sort(),
    "aucune route qui ne soit celle de l'outil appelé");
});

test("CHAQUE ROUTE DU CATALOGUE EXISTE VRAIMENT — le garde de dérive catalogue ↔ blocs", () => {
  /* Deux copies d'une règle divergent toujours, sauf si quelque chose les
     compare. Le catalogue recopie les noms de verbes des blocs `layers` et
     `build` ; ce test EST le comparateur. Un verbe renommé ou supprimé chez
     eux fait rougir ici, au lieu de rendre un refus en production.

     ⚠️ ON COMPARE LES NOMS, ON N'INTERROGE PAS UN COMPORTEMENT. Une première
     version appelait chaque outil à vide et cherchait « unknown verb » dans
     le refus : attaquée le 2026-08-08 sur une route délibérément cassée
     (`build.reforge`), elle est restée VERTE — le harnais ne rendait pas
     l'erreur du registre, et un test qui interroge un comportement hérite de
     tous les défauts de ce qui le simule. La liste des verbes, elle, ne
     simule rien. */
  const bus = makeBus();
  const verbsOf = {
    layers: new Set(Object.keys(createLayers({ bus }).verbs)),
    build: new Set(Object.keys(createBuild({ bus, dispatch: () => {} }).verbs))
  };
  const attendues = [];
  for (const tool of TOOLS) {
    if (tool.route === null) continue;
    const [block, verb] = tool.route.split(".");
    assert.ok(verbsOf[block], `l'outil « ${tool.name} » route vers un bloc inconnu « ${block} »`);
    assert.equal(verbsOf[block].has(verb), true,
      `la route « ${tool.route} » de l'outil « ${tool.name} » ne mène à aucun verbe du bloc ${block} ` +
      `(verbes réels : ${[...verbsOf[block]].sort().join(", ")})`);
    attendues.push(tool.route);
  }
  assert.deepEqual(attendues, [
    "layers.register", "layers.stack", "layers.query",
    "build.choose", "build.set", "build.override", "build.rebuild", "build.validate"
  ], "et la liste des routes est exacte : un outil de plus ou de moins se voit");

  /* LE PENDANT : la liste des verbes n'est pas complaisante. Un verbe qui
     n'existe pas est bien absent d'elle. */
  assert.equal(verbsOf.build.has("reforge"), false);
  assert.equal(verbsOf.layers.has("mount"), false);
});

test("LE NOM D'UN OUTIL EST SA ROUTE — aucun deuxième vocabulaire à tenir à jour", () => {
  for (const tool of TOOLS) {
    if (tool.route === null) {
      assert.equal(tool.name, "mcp.document",
        "le seul outil sans route porte le nom du bloc qui le fabrique, jamais celui d'un bloc à venir");
      assert.doesNotMatch(tool.name, /^doc\./, "et il ne préempte pas la tranche du bloc `doc` (décision D2)");
      continue;
    }
    assert.equal(tool.name, tool.route, "le nom publié EST la route dispatchée");
  }
});

test("le catalogue est conforme à la spécification : noms, schémas, listes fermées", () => {
  /* ⚠️ `allowUnionTypes` : `ajv` en mode strict refuse `"type": ["string",
     "number", …]`, que JSON Schema 2020-12 autorise et que MCP exige de
     supporter. C'est une opinion d'ajv, pas une règle du dialecte, et
     `build.set` en a un besoin RÉEL : son `value` est « un scalaire, jamais
     une structure », ce qui est exactement une union de types primitifs.
     Le relâchement est nommé plutôt que subi. */
  const ajv = new Ajv2020({ strict: true, allErrors: true, allowUnionTypes: true });
  const seen = new Set();
  for (const tool of TOOLS) {
    /* « uppercase and lowercase ASCII letters, digits, underscore, hyphen and
       dot », 1 à 128 caractères, uniques dans un serveur. */
    assert.match(tool.name, /^[A-Za-z0-9_.-]{1,128}$/, `nom d'outil hors charte : ${tool.name}`);
    assert.equal(seen.has(tool.name), false, `deux outils nommés « ${tool.name} »`);
    seen.add(tool.name);

    assert.equal(typeof tool.description, "string");
    assert.ok(tool.description.length > 40, `« ${tool.name} » doit dire ce qu'il fait à une IA qui ne lit que ça`);
    /* « MUST be a valid JSON Schema object (not null) ». `ajv` est une
       dépendance de DÉV : le schéma n'est pas validé à l'exécution, il l'est
       ici. */
    assert.equal(tool.inputSchema.type, "object");
    assert.doesNotThrow(() => ajv.compile(tool.inputSchema), `inputSchema invalide pour ${tool.name}`);
    /* LISTE FERMÉE, et elle est TENUE À L'EXÉCUTION (test suivant) : un
       schéma qui promet `additionalProperties: false` sans que rien ne le
       fasse respecter est une promesse de plus. */
    assert.equal(tool.inputSchema.additionalProperties, false,
      `« ${tool.name} » doit fermer sa liste d'arguments`);
  }
});

test("UN ARGUMENT INCONNU EST UN REFUS, jamais un argument ignoré en silence", () => {
  const { client } = localSurface({ layers: [] });
  const faute = client.request("tools/call", { name: "build.choose", arguments: { pathh: "species", ref: { kind: "a", id: "b" } } });
  assert.equal(faute.error.code, CODES.invalidParams);
  assert.match(faute.error.message, /« pathh »/, "et la faute est NOMMÉE, pas seulement refusée");
  /* Sans ce refus, `build.choose({pathh})` rendrait un succès sur une
     décision qui n'a pas été posée — la forme la plus discrète du repli
     silencieux (loi §0.5). */
  assert.match(faute.error.message, /path, ref, label, document/, "et les arguments attendus sont dits");
});

test("TOUT RÉSULTAT PORTE SON resultType ET L'IDENTITÉ DU SERVEUR", () => {
  /* Sur un protocole sans session, c'est la seule façon pour un client de
     savoir à qui il parle : il n'y a plus de poignée de main pour le dire une
     fois. Un oubli sur une méthode et pas sur une autre est exactement ce
     qu'une source unique (`resultResponse`) empêche — et ce test le vérifie
     sur TOUTES les méthodes, pas sur une. */
  const { client } = localSurface({ layers: [] });
  const methodes = [
    ["server/discover", {}],
    ["tools/list", {}],
    ["resources/list", {}],
    ["tools/call", { name: "layers.stack", arguments: {} }]
  ];
  for (const [method, params] of methodes) {
    const response = client.request(method, params);
    assert.equal(response.jsonrpc, "2.0");
    assert.equal(response.result.resultType, "complete", `${method} doit porter son resultType`);
    assert.deepEqual(response.result._meta[META.serverInfo], { name: "fhpc", version: "0.0.0-test" },
      `${method} doit dire qui répond`);
  }
});

test("une NOTIFICATION ne reçoit RIEN — la spécification l'interdit mot pour mot", () => {
  const { mcp } = localSurface({ layers: [] });
  assert.equal(mcp.handle({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 1 } }), null);
  assert.equal(mcp.handle({ jsonrpc: "2.0", method: "notifications/inconnue" }), null,
    "même une notification inconnue reste silencieuse : répondre casserait la corrélation d'id du client");
  /* Le pendant : la MÊME méthode avec un `id` est une requête, et elle répond. */
  const reponse = mcp.handle({
    jsonrpc: "2.0", id: 1, method: "notifications/cancelled", params: { _meta: requestMeta() }
  });
  assert.equal(reponse.error.code, CODES.methodNotFound);
});

test("les champs `_meta` de protocole sont exigés SUR CHAQUE REQUÊTE, séparément", () => {
  const { mcp } = localSurface({ layers: [] });
  const ask = (meta) => mcp.handle({ jsonrpc: "2.0", id: 1, method: "tools/list", params: meta === null ? {} : { _meta: meta } });

  assert.match(ask(null).error.message, /_meta` manque/);
  assert.match(ask({ [META.clientCapabilities]: {} }).error.message, /protocolVersion.*manque/s,
    "la version manquante est nommée pour elle-même");
  assert.match(ask({ [META.protocolVersion]: PROTOCOL_VERSION }).error.message, /clientCapabilities.*manque/s,
    "les capacités manquantes aussi — un message qui dit « _meta invalide » oblige à deviner laquelle");
  assert.equal(ask(requestMeta()).result.tools.length, 9);

  /* ⚠️ LE PIÈGE DE LA VERSION : ce n'est pas parce que la révision courante
     est la seule supportée que le refus se prouve tout seul. On l'éprouve sur
     une révision RÉELLE et antérieure, pas sur une chaîne inventée. */
  const vieille = ask(Object.assign(requestMeta(), { [META.protocolVersion]: "2025-11-25" }));
  assert.equal(vieille.error.code, CODES.unsupportedProtocolVersion);
  assert.deepEqual(vieille.error.data, { supported: [PROTOCOL_VERSION], requested: "2025-11-25" });
});

/* ── ⚠️ `shadowed` TRAVERSE, ET LA PRIVATION EST DÉLIBÉRÉE ──────────── */

test("`shadowed` TRAVERSE JUSQU'À L'IA — sur un recouvrement VOULU, pas sur une pénurie de circonstance", () => {
  /* ⚠️ LA LEÇON DU LOT 9, APPLIQUÉE ICI. Sur la pile d'acceptation (SRD +
     couche d'exemple), `shadowed` est VIDE : rien n'y recouvre rien. Prouver
     que « shadowed traverse » sur cette pile-là ne prouverait donc rien du
     tout — la liste vide traverserait aussi bien si le champ était avalé.
     On fabrique donc un recouvrement DÉLIBÉRÉ : une couche de scénario qui
     repose, par un `add`, un record que le SRD porte déjà. Le recouvrement
     devient lisible, et il ne peut pas disparaître sans qu'on le voie. */
  const RECOUVERT = "srd:spell:fr:lumiere";
  const scenario = {
    schema: "fh-layer/1",
    id: "scenario-recouvrement",
    version: "1.0.0",
    name: "Couche de scenario — recouvrement delibere",
    lang: "fr",
    flags: [],
    attribution: { license: "CC0-1.0" },
    records: {
      spell: {
        [RECOUVERT]: {
          op: "add",
          name: "Lumiere (version de table)",
          slug: "lumiere",
          data: JSON.parse(JSON.stringify(
            /* On recopie le record du SRD tel quel : le but est de prouver le
               RECOUVREMENT, pas d'amputer le sort — un sort amputé ferait
               échouer la dérivation pour une autre raison, et le test
               prouverait autre chose que ce qu'il annonce. */
            { level: 0 }))
        }
      }
    }
  };

  const { client } = localSurface({ extra: scenario });
  const stack = client.ok("layers.stack");
  assert.deepEqual(stack.map((layer) => layer.id),
    ["srd-5.2.1-fr", "exemple-homebrew-fr", "scenario-recouvrement"]);

  let premier = { document: documentVierge(stack) };
  for (const choice of FICHIER.build.choices) {
    const args = Object.assign({}, premier, { path: choice.path });
    if (choice.ref !== undefined) args.ref = choice.ref; else args.value = choice.value;
    client.ok(toolFor(choice), args);
    premier = {};
  }
  const result = client.call("build.rebuild", {});
  const shadowed = result.structuredContent.shadowed;

  assert.deepEqual(shadowed, [
    { kind: "spell", id: RECOUVERT, by: "scenario-recouvrement", over: "srd-5.2.1-fr" }
  ], "le recouvrement arrive ENTIER : ce qui a été recouvert, par qui, et par-dessus qui");
  assert.match(result.content[0].text, /RECORDS RECOUVERTS \(1\)/);
  assert.match(result.content[0].text, new RegExp(`${RECOUVERT}`),
    "et le texte le NOMME — un client qui ne lit que le contenu textuel doit le voir aussi");

  /* LE PENDANT SUR LA MÊME SURFACE : sans la couche de scénario, la liste est
     vide. C'est ce qui prouve que le recouvrement vient bien de la privation
     délibérée, et pas d'un artefact de la pile. */
  const sans = localSurface().client;
  let debut = { document: documentVierge(sans.ok("layers.stack")) };
  for (const choice of FICHIER.build.choices) {
    const args = Object.assign({}, debut, { path: choice.path });
    if (choice.ref !== undefined) args.ref = choice.ref; else args.value = choice.value;
    sans.ok(toolFor(choice), args);
    debut = {};
  }
  assert.deepEqual(sans.ok("build.rebuild", {}).shadowed, []);
});

/* ── LES GARDES, ET LEURS ATTAQUES ──────────────────────────────────── */

test("ZÉRO DOMAINE, ZÉRO DISQUE, ZÉRO PROCESSUS, ZÉRO RÉSEAU dans src/mcp/", () => {
  assert.deepEqual(inspect(sources()), []);
});

test("ATTAQUE DU GARDE — chacun des interdits, violé une fois, est vu et NOMMÉ", () => {
  const violations = [
    ["domaine.mjs", 'import { createBuild } from "../build/index.mjs";'],
    ["pile.mjs", 'import { createLayers } from "../layers/index.mjs";'],
    ["moteur.mjs", 'import { createPlay } from "../play/session.mjs";'],
    ["schema.mjs", 'import { charInvariantViolations } from "../schemas/invariants.mjs";'],
    ["disque.mjs", 'import { readFileSync } from "node:fs";'],
    ["ecriture.mjs", "writeFileSync(cible, JSON.stringify(open));"],
    ["processus.mjs", "const flux = process.stdin;"],
    ["enfant.mjs", 'import { spawn } from "node:child_process";'],
    ["reseau.mjs", "await fetch('https://exemple');"],
    ["dom.mjs", "const el = document.getElementById('x');"],
    ["fenetre.mjs", "const w = window.innerWidth;"],
    ["hasard.mjs", "const r = Math.random();"],
    ["horloge.mjs", "const at = Date.now();"],
    ["langue.mjs", 'const langs = ["fr", "en"];'],
    ["couche.mjs", 'const base = "srd-5.2.1-fr";'],
    /* §0.12 : un personnage SRD pur traverse la surface de bout en bout. Une
       mécanique de couche nommée ici serait une couche tissée dans le chemin
       commun — et elle passerait par un LITTÉRAL, que le dépouilleur garde. */
    ["maison.mjs", 'const outil = "destiny";']
  ];
  for (const [name, source] of violations) {
    const found = inspect([{ name, text: source }]);
    assert.ok(found.length > 0, `« ${source} » aurait dû être vu dans ${name}`);
    assert.match(found[0], new RegExp(name.replace(".", "\\.")), "et la violation nomme son fichier");
  }
  /* ET LE PENDANT : le vocabulaire légitime passe entier. « document » est le
     mot du DOMAINE ici, et `stdin`/`stdout` sont les mots du transport tant
     qu'ils arrivent par injection. */
  assert.deepEqual(inspect([{
    name: "sain.mjs",
    text: 'const build = open.document; input.setEncoding("utf8"); output.write(line);'
  }]), []);
});

test("⚠️ MESURE — le garde §0.12 PARTAGÉ ne voit pas les formes camelCase, et c'est écrit ici", () => {
  /* TROUVÉ EN ATTAQUANT CE GARDE, le 2026-08-08. `HOUSE_MECHANICS`
     (tests/source-scan.mjs) cherche `\b destiny \b` : dans `spendDestiny`,
     il n'y a AUCUNE frontière de mot avant le « D », donc rien n'est vu.
     Toutes les formes composées passent — et ce sont précisément celles que
     le code emploie (`spendDestinyDie`, `setDestinyPoints`, `addPendingFate`,
     `createChaos`).

     C'EST LA PARENTE EXACTE du défaut corrigé le même jour sur `arcane?` :
     « un garde de vocabulaire se teste sur les FORMES QUE LE CODE EMPLOIE,
     pas sur le mot du cahier des charges. » La leçon avait été écrite ; la
     liste, elle, n'avait été durcie que sur un mot.

     CE LOT NE TOUCHE PAS AU GARDE D'UN AUTRE LOT. Il MESURE le trou, pour
     qu'il ne puisse pas disparaître ni s'élargir en silence, et il le porte à
     l'architecte (QUESTIONS-ARCHITECTE.md, question 5). Mesuré aussi, et
     c'est ce qui rend la question actionnable : durcir la liste aujourd'hui
     ne rendrait AUCUNE suite rouge — les seules occurrences camelCase du
     dépôt sont dans `src/modules/fh/`, qui a le droit de nommer FH.

     ⚠️ Le jour où la liste est durcie, ce test devient FAUX : il faudra le
     réécrire à la nouvelle vérité et le marquer `REWRITTEN` sur sa propre
     ligne. C'est voulu — un trou qu'on bouche doit faire rougir la mesure qui
     le décrivait. */
  const voit = (mot) => HOUSE_MECHANICS.some(([pattern]) => pattern.test(mot));
  assert.equal(voit("destiny"), true, "la forme nue est bien vue");
  assert.equal(voit("Destiny"), true);
  for (const compose of ["spendDestiny", "setDestinyPoints", "resolveArcana", "settleAwakening", "onOverreach", "addPendingFate"]) {
    assert.equal(voit(compose), false, `TROU MESURÉ : « ${compose} » traverse le garde §0.12 sans le faire ciller`);
  }
});

test("ATTAQUE DU PÉRIMÈTRE — le garde refuse d'être pointé sur le vide ou sur un répertoire amputé", () => {
  assert.deepEqual(perimeterGaps(sources()), [], "le vrai répertoire est complet");
  assert.deepEqual(perimeterGaps([]), MUST_INSPECT, "un périmètre vide n'est jamais une réussite");
  assert.deepEqual(
    perimeterGaps(sources().filter((source) => source.name !== "surface.mjs")),
    ["surface.mjs"],
    "et un seul fichier soustrait se voit, nommément"
  );
  /* L'autre bout : un fichier NEUF dans `src/mcp/` tombe sous la loi sans
     qu'on ait rien à déclarer. La liste prouve qu'on regarde au bon endroit ;
     elle ne borne pas ce qui est inspecté. */
  const withNew = sources().concat({ name: "neuf.mjs", text: 'import fs from "node:fs";' });
  assert.deepEqual(perimeterGaps(withNew), []);
  assert.equal(inspect(withNew).length, 1, "et il est jugé comme les autres");
  /* ⚠️ L'ARPENTEUR MARCHE L'ARBRE. Le garde du lot 7 est resté vert parce
     qu'il comptait des fichiers ; celui du lot 9 mord jusque dans un
     sous-répertoire. On le VÉRIFIE ici sur un vrai sous-répertoire, créé et
     retiré, plutôt que de croire `loadSources`. */
  const sous = path.join(mcpDir, "sous");
  const piege = path.join(sous, "porte-de-sortie.mjs");
  fs.mkdirSync(sous, { recursive: true });
  try {
    fs.writeFileSync(piege, 'import { createBuild } from "../../build/index.mjs";\n', "utf8");
    const found = inspect(sources());
    assert.equal(found.length, 1, "un sous-répertoire n'est PAS une porte de sortie hors de la loi");
    assert.match(found[0], /sous\/porte-de-sortie\.mjs/);
  } finally {
    fs.rmSync(sous, { recursive: true, force: true });
  }
  assert.deepEqual(inspect(sources()), [], "et l'arbre est restauré");
});

test("« PAR LA SURFACE MCP SEULE » EST VÉRIFIÉ : la suite d'acceptation n'atteint jamais le noyau", () => {
  assert.deepEqual(bypasses(suiteSources()), []);
  /* Le périmètre de CE garde-là est lui aussi une liste de noms, et les deux
     fichiers existent réellement. */
  assert.deepEqual(suiteSources().map((source) => source.name), PROVEN_BY_MCP_ONLY);
});

test("ATTAQUE DU GARDE DE SURFACE — chaque contournement, écrit une fois, est vu et NOMMÉ", () => {
  const contournements = [
    ["faux-noyau.mjs", 'const out = dispatch("build.rebuild", {});'],
    ["faux-verbes.mjs", "const out = build.verbs.rebuild({});"],
    ["faux-derive.mjs", "const out = derive({ query, stack, choices });"],
    ["faux-import.mjs", 'import { createBuild } from "../src/build/block.mjs";']
  ];
  for (const [name, source] of contournements) {
    const found = bypasses([{ name, text: source }]);
    assert.ok(found.length > 0, `« ${source} » aurait dû être vu dans ${name}`);
    assert.match(found[0], new RegExp(name.replace(".", "\\.")));
  }
  /* LE PENDANT : ce que la suite d'acceptation fait RÉELLEMENT passe entier —
     sinon le garde ne serait qu'un refus universel, et il rougirait déjà. */
  assert.deepEqual(bypasses([{
    name: "sain.mjs",
    text: 'import { connectMcp } from "../src/mcp/index.mjs";\nclient.ok("build.rebuild", {});'
  }]), []);
  /* Et l'import d'un `index.mjs` reste autorisé : monter les blocs est le
     travail d'une racine de composition, pas un contournement. */
  assert.deepEqual(bypasses([{
    name: "racine.mjs", text: 'import { registerBuild } from "../src/build/index.mjs";'
  }]), []);
});
