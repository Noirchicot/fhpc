/* ══ LE PENDANT QUI SEUL PROUVE LE TRANSPORT ═══════════════════════════
   Lot 10-mcp-v0.

   `mcp-acceptance` prouve l'ADAPTATEUR : un message entre, un dispatch part.
   Elle ne prouve pas la LIGNE. Ici le serveur est lancé comme un **vrai
   processus enfant**, on lui parle en JSON-RPC sur son entrée standard et on
   lit sa sortie — le magicien elfe est construit de bout en bout à travers un
   tuyau, y compris les 3,1 Mo de couche SRD passés en une seule ligne.

   ⚠️ CE QUE CE FICHIER SEUL PEUT VOIR, et que l'autre ne verra jamais :
   · le cadrage — un message par ligne, aucun saut de ligne à l'intérieur ;
   · la PROPRETÉ DE `stdout` — pas un octet qui ne soit un message MCP. Le
     harnais analyse CHAQUE ligne : un `console.log` oublié devient du
     « junk », et le junk fait rougir ;
   · l'UTF-8 à travers les frontières de morceaux — une couche coupée en
     plein caractère accentué par le tampon du système changerait son
     empreinte SHA-256, et le personnage déclarerait une couche que la pile
     ne porte pas ;
   · l'ARRÊT — le serveur sort de lui-même quand son entrée se ferme.

   ⚠️ ET LE PIÈGE PAYÉ CETTE NUIT : une suite verte sur un artefact périmé ne
   prouve rien. Le premier test vérifie donc que le processus a RÉELLEMENT
   démarré, et qu'il a répondu, avant qu'on croie au silence des suivants. */

import test from "node:test";
import assert from "node:assert/strict";

import {
  FICHIER, HOMEBREW, SRD_FR, SERVER,
  documentVierge, fileText, readJson, requestMeta, spawnServer, toolFor
} from "./mcp-harness.mjs";

test("le serveur DÉMARRE POUR DE VRAI, et il le dit sur stderr — pas sur stdout", async (t) => {
  const server = spawnServer(t);
  const discover = await server.send("server/discover");

  assert.equal(discover.jsonrpc, "2.0");
  assert.equal(discover.result.resultType, "complete");
  assert.deepEqual(discover.result.supportedVersions, ["2026-07-28"]);
  assert.equal(discover.result._meta["io.modelcontextprotocol/serverInfo"].name, "fhpc",
    "le serveur s'identifie dans CHAQUE résultat — il n'y a plus de poignée de main pour le faire une fois");

  /* La bannière de démarrage part sur `stderr`, et le protocole ne la voit
     jamais. C'est le pendant exact de « stdout ne porte que du MCP ». */
  assert.match(server.stderr, /protocole MCP 2026-07-28/);
  assert.deepEqual(server.junk, [], "aucune ligne de stdout qui ne soit un message MCP");

  const { code } = await server.close();
  assert.equal(code, 0, "entrée fermée ⇒ le serveur sort de lui-même, sans qu'on ait à le tuer");
});

test("ACCEPTATION SUR LA LIGNE — le magicien elfe est construit à travers un vrai tuyau", async (t) => {
  const server = spawnServer(t);

  /* 3,1 Mo de couche SRD, en une seule ligne JSON-RPC. C'est le cas limite du
     cadrage : si le découpage par ligne ou le décodage UTF-8 avait le moindre
     défaut, l'empreinte ne tomberait pas juste et la suite s'arrêterait ici. */
  const srd = await server.ok("layers.register", { layer: fileText(SRD_FR), origin: SRD_FR });
  assert.equal(srd.id, "srd-5.2.1-fr");
  assert.equal(srd.records, 1369);
  assert.equal(srd.hash, FICHIER.build.layers[0].hash,
    "L'EMPREINTE A SURVÉCU AU TUYAU : c'est celle que le personnage d'exemple déclare déjà. " +
    "Un octet perdu au passage la ferait diverger sans rien casser d'autre.");

  await server.ok("layers.register", { layer: fileText(HOMEBREW), origin: HOMEBREW });
  const stack = await server.ok("layers.stack");
  assert.deepEqual(stack.map((layer) => layer.id), ["srd-5.2.1-fr", "exemple-homebrew-fr"]);

  let premier = { document: documentVierge(stack) };
  for (const choice of FICHIER.build.choices) {
    const args = Object.assign({}, premier, { path: choice.path });
    if (choice.ref !== undefined) args.ref = choice.ref; else args.value = choice.value;
    if (choice.label !== undefined) args.label = choice.label;
    await server.ok(toolFor(choice), args);
    premier = {};
  }
  for (const override of FICHIER.build.overrides) await server.ok("build.override", override);

  const out = await server.ok("build.rebuild", {});
  const got = out.resolved;
  const attendu = FICHIER.resolved;

  assert.deepEqual(got.abilities, attendu.abilities);
  assert.equal(got.proficiency, attendu.proficiency);
  assert.equal(got.ac, attendu.ac);
  assert.deepEqual(got.saves, attendu.saves);
  assert.deepEqual(got.speeds, attendu.speeds);
  assert.deepEqual(got.skills, attendu.skills, "les dix-huit compétences, entrée par entrée, après un aller-retour sur le tuyau");
  assert.equal(got.spellcasting.dc, 13);
  assert.deepEqual(got.spellcasting.spells.map((spell) => spell.id), attendu.spellcasting.spells.map((spell) => spell.id));
  assert.equal(got.vitals.hpMax, 9, "l'override du MJ a traversé le tuyau, et il passe toujours en dernier");
  assert.equal(got.gear.find((item) => item.id === "torch").quantity, 4);

  /* `underived` traverse le TUYAU aussi — c'est tout l'intérêt du M2.
     REWRITTEN 2026-08-08 (lot 13) — l'assertion demandait que `traits (espèce)`
     soit DANS la liste. Elle est devenue fausse quand l'architecte a régénéré
     les couches sur un `fh-srd` dont le lot 11 avait réparé l'extraction à deux
     colonnes : les traits sont dérivés, donc plus déclarés. On ne relâche pas
     la preuve pour autant — on la retourne. Elle dit maintenant les deux
     choses : le champ N'EST PLUS déclaré, ET les cinq traits sont réellement
     arrivés au bout du tuyau. Une preuve qui ne fait que compter (13 → 12)
     resterait verte sur une liste de douze champs faux. */
  /* REWRITTEN 2026-08-08 — révision du schéma (GAP-DERIVED) : `stats` est le
     treizième champ déclaré non dérivé. La preuve garde ses DEUX moitiés — le
     compte ET les noms — pour la raison écrite juste au-dessus : un compte seul
     resterait vert sur une liste de treize champs faux. */
  assert.equal(out.underived.length, 13);
  assert.equal(out.underived.some((entry) => entry.field === "stats"), true);
  assert.equal(out.underived.some((entry) => entry.field === "traits (espèce)"), false);
  /* ⛔ La clef de trait reste FRANÇAISE, et c'est l'arbitrage du lot 13 (voir
     `build-acceptance`) : « Vision dans le noir » est un TRAIT (la règle) et un
     SENS (le nombre) ; le sens porte l'adresse `darkvision`, le trait porte la
     clef du record. Les rapprocher demanderait de les apparier par leur nom
     affichable — ce que la loi §0.13 interdit. */
  assert.deepEqual(got.traits.map((trait) => trait.id),
    ["ascendance-feerique", "lignage-elfique", "sens-aiguises", "transe", "vision-dans-le-noir"],
    "LES CINQ TRAITS DE L'ELFE ONT TRAVERSÉ 3,1 Mo DE COUCHE ET UN TUYAU JSON-RPC");
  assert.match(got.traits.find((trait) => trait.id === "transe").text, /Repos long/,
    "et leur texte est celui du record, pas un résumé — le tuyau ne le tronque pas");
  assert.deepEqual(out.shadowed, [], "aucun recouvrement sur cette pile-ci ; le pendant délibéré est dans mcp-block");

  /* Le document ressort ENTIER par la resource, et il vaut celui de l'outil. */
  const lue = await server.send("resources/read", { uri: "fh-char:///open" });
  const parResource = JSON.parse(lue.result.contents[0].text);
  const parOutil = await server.ok("mcp.document");
  assert.deepEqual(parResource, parOutil);
  assert.equal(parResource.build.choices.length, 59);
  assert.equal(parResource.resolved.vitals.hpMax, 9);

  assert.deepEqual(server.junk, [], "aucune ligne de stdout qui ne soit un message MCP, sur tout l'échange");
  await server.close();
});

test("SUR LA LIGNE — un refus de règle revient en RÉSULTAT en échec, et le serveur SURVIT", async (t) => {
  const server = spawnServer(t);

  /* Aucun personnage ouvert : le bloc `build` refuse. Le refus doit arriver
     LISIBLE et NOMMÉ, pas tuer le processus (loi §0.5). */
  const refus = await server.call("build.rebuild", {});
  assert.equal(refus.isError, true, "un outil qui échoue est un résultat en échec");
  assert.equal(refus.structuredContent.error.kind, "BuildError",
    "le nom de la classe traverse : « BuildError » se lit comme le refus d'un bloc, pas comme un incident anonyme");
  assert.match(refus.content[0].text, /aucun personnage ouvert/);

  /* LE PENDANT, et c'est lui qui compte : le serveur répond encore APRÈS. */
  const encore = await server.send("tools/list");
  assert.equal(encore.result.tools.length, 10, "le serveur a survécu au refus");

  /* Un refus du bloc `layers` traverse aussi, sous SON nom. */
  const genre = await server.call("layers.query", { kind: "spel" });
  assert.equal(genre.isError, true);
  assert.equal(genre.structuredContent.error.kind, "LayerError",
    "⚠️ mesuré le 2026-08-08 : `LayerError` ne pose pas son `name`, on lit donc le nom de sa CLASSE");
  assert.match(genre.content[0].text, /genre inconnu/);

  await server.close();
});

test("SUR LA LIGNE — les erreurs de PROTOCOLE ne sont pas des erreurs d'outil", async (t) => {
  const server = spawnServer(t);

  /* Outil inconnu : `-32602`, comme la spécification 2026-07-28 le donne en
     exemple. Ce n'est PAS un résultat marqué en échec — le modèle ne peut pas
     se corriger d'un outil qui n'existe pas. */
  const inconnu = await server.send("tools/call", { name: "build.forge", arguments: {} });
  assert.equal(inconnu.result, undefined);
  assert.equal(inconnu.error.code, -32602);
  assert.match(inconnu.error.message, /Unknown tool: build\.forge/);

  const methode = await server.send("outils/liste");
  assert.equal(methode.error.code, -32601);

  /* La resource inconnue : `-32602` avec l'URI dans `data` — et surtout
     JAMAIS un `contents` vide, que la spécification déclare ambigu. */
  const resource = await server.send("resources/read", { uri: "file:///etc/passwd" });
  assert.equal(resource.error.code, -32602);
  assert.equal(resource.error.data.uri, "file:///etc/passwd");

  /* Un `_meta` absent : la requête est malformée sur un protocole sans
     session, et c'est `-32602`. */
  const sansMeta = await server.send("tools/list", {}, null);
  assert.equal(sansMeta.error.code, -32602);
  assert.match(sansMeta.error.message, /_meta/);

  /* Une version que ce serveur ne parle pas : `-32022`, et il NOMME ce qu'il
     sait parler — un client ne peut se rattraper que s'il le sait. */
  const version = await server.send("tools/list", {}, { "io.modelcontextprotocol/protocolVersion": "2025-11-25" });
  assert.equal(version.error.code, -32022);
  assert.deepEqual(version.error.data, { supported: ["2026-07-28"], requested: "2025-11-25" });

  /* La poignée de main héritée : refusée, mais l'erreur NOMME les versions
     parlées. Un client hérité n'a aucun mécanisme de rattrapage, et ce
     message est le seul diagnostic qu'il pourra montrer. */
  const legacy = await server.send("initialize");
  assert.equal(legacy.error.code, -32601);
  assert.match(legacy.error.message, /2026-07-28/);

  await server.close();
});

test("SUR LA LIGNE — le cadrage lui-même : JSON illisible, ligne vide, notification", async (t) => {
  const server = spawnServer(t);

  /* Une ligne illisible : `-32700`, et `id: null` — le seul cas où la
     spécification autorise une réponse non corrélée, parce que l'`id` n'a pas
     pu être lu. */
  const casse = await server.raw("{ceci n'est pas du JSON}\n", "@null");
  assert.equal(casse.error.code, -32700);
  assert.equal(casse.id, null);

  /* Des lignes vides ne sont pas des messages : elles ne produisent RIEN. Si
     elles produisaient une erreur, un client qui termine par « \n\n »
     recevrait une réponse qu'il ne saurait corréler à rien. */
  const apres = await server.raw(
    "\n\n" + JSON.stringify({
      jsonrpc: "2.0", id: 4242, method: "tools/list", params: { _meta: requestMeta() }
    }) + "\n", 4242);
  assert.equal(apres.result.tools.length, 10);

  /* Une NOTIFICATION (pas d'`id`) ne reçoit aucune réponse. On le prouve en
     envoyant la notification PUIS une requête, et en vérifiant que la seule
     ligne qui revient est celle de la requête. */
  const suite = await server.raw(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 1 } }) + "\n" +
    JSON.stringify({ jsonrpc: "2.0", id: 4243, method: "server/discover", params: { _meta: requestMeta() } }) + "\n",
    4243);
  assert.equal(suite.id, 4243);
  assert.deepEqual(server.junk, [],
    "rien n'a été écrit pour la notification — une ligne de plus serait apparue en junk");

  /* AUCUN message ne porte de saut de ligne littéral : c'est ce qui rend le
     cadrage utilisable. Les messages d'erreur du dépôt sont longs et
     multilignes ; `JSON.stringify` les échappe, et on le vérifie plutôt que
     de le croire. */
  const long = await server.call("build.rebuild", {});
  assert.ok(long.content[0].text.length > 80);
  assert.equal(JSON.stringify(long).includes("\n"), false,
    "le texte peut contenir des sauts de ligne, le MESSAGE SÉRIALISÉ jamais");

  await server.close();
});

test("le serveur ne lit ni n'écrit AUCUN fichier — le stockage appartient à l'appelant", async (t) => {
  /* La preuve n'est pas une inspection de code (le garde structurel s'en
     charge) mais une CONSÉQUENCE observable : deux processus successifs ne
     partagent rien. Le personnage construit dans le premier n'existe pas dans
     le second — il n'a été écrit nulle part. */
  const premier = spawnServer(t);
  /* La couche SRD, et pas la couche d'exemple : celle-ci DÉSACTIVE un record
     du SRD, donc elle ne se monte pas seule — mesuré en écrivant ce lot, et
     c'est le pli transactionnel du lot 7 qui parle. Une couche montée toute
     seule doit être une couche autonome. */
  await premier.ok("layers.register", { layer: fileText(SRD_FR), origin: SRD_FR });
  const pile = await premier.ok("layers.stack");
  assert.equal(pile.length, 1);
  await premier.close();

  const second = spawnServer(t);
  assert.deepEqual(await second.ok("layers.stack"), [], "un serveur neuf part d'une pile VIDE");
  const document = await second.send("resources/read", { uri: "fh-char:///open" });
  assert.equal(document.error.code, -32602);
  assert.match(document.error.message, /Aucun personnage ouvert/);
  await second.close();
});

test("le chemin du serveur est bien celui qu'on croit lancer", () => {
  /* ⚠️ Le piège d'hier, en une ligne : une suite qui lance un artefact
     périmé — ou pas d'artefact du tout — reste verte pour de mauvaises
     raisons. On vérifie que le fichier existe et qu'il est bien la racine de
     composition, pas seulement qu'un processus a démarré. */
  const source = readJson("package.json");
  assert.equal(source.type, "module");
  assert.match(SERVER, /bin\/fhpc-mcp\.mjs$/);
});
