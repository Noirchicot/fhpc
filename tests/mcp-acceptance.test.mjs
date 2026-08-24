/* ══ LE TEST D'ACCEPTATION DU LOT 10 ═══════════════════════════════════

   « Le magicien elfe niveau 1 de `examples/personnage-srd-fr-niveau1.fh-char.json`
     est construit de bout en bout À TRAVERS LA SURFACE MCP SEULE, et son
     `resolved` est celui du fichier. »

   ── EN QUOI C'EST LE MIROIR DE `build-acceptance`, UN CRAN PLUS LOIN ────
   Le lot 9 a prouvé la dérivation **depuis l'intérieur** : une suite qui
   appelle `dispatch`. Celle-ci la prouve **depuis l'extérieur** — aucune
   ligne de ce fichier ni de son harnais n'appelle le noyau. Tout passe par
   `tools/call`, comme le ferait l'IA d'un joueur.

   ⚠️ CE N'EST PAS UNE PROMESSE DE COMMENTAIRE : un garde de
   `tests/mcp-block.test.mjs` lit la source de ce fichier et rougit s'il y
   trouve un appel au noyau. Il est attaqué dans les deux sens.

   Sur la VRAIE MATIÈRE : la couche SRD FR (1 309 records, 3,1 Mo) et la
   couche d'exemple du lot 2, montées par l'outil `layers.register`, en
   passant le TEXTE des fichiers — le serveur ne lit aucun disque. */

import test from "node:test";
import assert from "node:assert/strict";

import {
  FICHIER, HOMEBREW, SRD_FR,
  documentVierge, fileText, makeClient, openSurface, toolFor
} from "./mcp-harness.mjs";

const client = makeClient(openSurface());

/* La construction complète, faite UNE FOIS : monter 3,1 Mo de couche et
   plier 1 309 records à chaque test coûterait quelques secondes pour rien.
   Le résultat est partagé ; aucun test ne le mute. */
let built = null;
function construire() {
  if (built) return built;

  /* 1. LA PILE, montée par la surface, depuis le TEXTE des fichiers. */
  const srd = client.ok("layers.register", { layer: fileText(SRD_FR), origin: SRD_FR });
  const homebrew = client.ok("layers.register", { layer: fileText(HOMEBREW), origin: HOMEBREW });

  /* 2. LE MANIFESTE, relu par la surface : c'est lui qui remplit
        `build.layers[]`. Le document ne devine jamais la pile sur laquelle il
        est construit. */
  const stack = client.ok("layers.stack");

  /* 3. LES DÉCISIONS, une par appel d'outil. Le document n'est passé qu'au
        PREMIER appel : les suivants reprennent le personnage ouvert. */
  let premier = { document: documentVierge(stack) };
  for (const choice of FICHIER.build.choices) {
    const args = Object.assign({}, premier, { path: choice.path });
    if (choice.ref !== undefined) args.ref = choice.ref; else args.value = choice.value;
    if (choice.label !== undefined) args.label = choice.label;
    client.ok(toolFor(choice), args);
    premier = {};
  }
  for (const override of FICHIER.build.overrides) {
    client.ok("build.override", override);
  }

  /* 4. LA DÉRIVATION. */
  const rebuilt = client.call("build.rebuild", {});
  built = { srd, homebrew, stack, rebuilt, resolved: rebuilt.structuredContent.resolved };
  return built;
}

test("la surface se présente : discover, tools/list, resources/list", () => {
  const discover = client.request("server/discover").result;
  assert.equal(discover.resultType, "complete", "tout résultat porte son resultType (MCP 2026-07-28)");
  assert.deepEqual(discover.supportedVersions, ["2026-07-28"]);
  assert.deepEqual(discover.capabilities, { tools: {}, resources: {} });

  const tools = client.request("tools/list").result.tools.map((tool) => tool.name);
  assert.deepEqual(tools, [
    "layers.register", "layers.stack", "layers.query",
    "build.choose", "build.set", "build.override", "build.clear", "build.rebuild", "build.validate",
    "mcp.document"
  ], "les six verbes de `build`, deux de `layers` plus la lecture de contenu, et le document");

  const resources = client.request("resources/list").result.resources;
  assert.equal(resources.length, 1);
  assert.equal(resources[0].uri, "fh-char:///open");
  assert.equal(resources[0].mimeType, "application/json");
});

test("la pile est montée PAR LA SURFACE, depuis le texte des fichiers", () => {
  const { srd, homebrew, stack } = construire();
  assert.equal(srd.id, "srd-5.2.1-fr");
  assert.match(srd.hash, /^[0-9a-f]{64}$/, "l'empreinte est celle des octets transmis");
  assert.equal(srd.records, 1367, "mesuré : la couche SRD FR seule — les 2 734 comptent les deux langues");
  assert.equal(homebrew.records > 0, true);
  assert.deepEqual(stack.map((layer) => layer.id), ["srd-5.2.1-fr", "exemple-homebrew-fr"]);
  assert.equal(stack.every((layer) => layer.enabled), true);
});

test("ACCEPTATION — le magicien elfe niveau 1 est construit par la SURFACE MCP SEULE", () => {
  const got = construire().resolved;
  const attendu = FICHIER.resolved;

  /* L'invariant qui rend « resolved est périmé » discernable de « resolved
     est à jour ». Il traverse la surface intact. */
  assert.deepEqual(
    got.derivation.stack.map((layer) => layer.id),
    ["srd-5.2.1-fr", "exemple-homebrew-fr"]
  );

  assert.equal(got.identity.level, attendu.identity.level);
  assert.deepEqual(got.identity.classes, attendu.identity.classes);
  assert.equal(got.identity.background, attendu.identity.background);
  assert.deepEqual(got.abilities, attendu.abilities);
  assert.equal(got.abilities.con.score, 14, "le boost +1 d'arrière-plan a traversé la surface");
  assert.equal(got.abilities.int.score, 17, "le boost +2 d'arrière-plan a traversé la surface");
  assert.equal(got.proficiency, attendu.proficiency);
  assert.equal(got.ac, attendu.ac);
  assert.deepEqual(got.speeds, attendu.speeds);
  assert.deepEqual(got.saves, attendu.saves);
  assert.deepEqual(got.currency, attendu.currency);
  assert.deepEqual(got.craft, attendu.craft);
  /* Les SENS, tels que le lot 8 les livre : l'identifiant vient du record
     (`darkvision`), pas le slug français du fichier — un id est une ancre
     d'override, pas un mot. La perception passive n'y est pas, et elle est
     déclarée non dérivée (test suivant). */
  assert.deepEqual(got.senses, [{ id: "darkvision", name: "Vision dans le noir", value: 18, unit: "m" }]);

  /* REWRITTEN 2026-08-08 (lot 13) — LES TRAITS AUSSI, maintenant qu'ils sont
     dérivés. Ils n'étaient pas assertés ici tant qu'ils étaient refusés : seule
     leur ligne dans `underived` l'était. La liste est exacte, et « Vision dans
     le noir » y figure EN PLUS du sens du même nom — un trait qui accorde un
     sens paraît des deux côtés de la fiche, et le moteur ne les rapproche pas
     (il faudrait comparer des noms affichables, loi §0.13). */
  assert.deepEqual(got.traits.map((trait) => trait.id),
    ["ascendance-feerique", "lignage-elfique", "sens-aiguises", "transe", "vision-dans-le-noir"]);
  assert.deepEqual([...new Set(got.traits.map((trait) => trait.source))], ["Elfe"],
    "`source` est le nom du record d'espèce, recopié — les traits de classe et de don, eux, sont déclarés non dérivés");

  /* LES DIX-HUIT COMPÉTENCES NOMMÉMENT, entrées comprises — un compte reste
     vert si la pile en rend dix-huit mauvaises. */
  assert.deepEqual(got.skills, attendu.skills);
  assert.equal(got.skills.length, 18);

  /* LES OVERRIDES, POSÉS PAR L'OUTIL `build.override`, ONT MORDU. La
     dérivation seule donne 8 points de vie et 2 torches (mesuré par le lot 9,
     `build-acceptance`) ; le fichier en porte 9 et 4, et c'est la parole du
     MJ. Les retrouver ici prouve que l'ordre « overrides en dernier » a
     traversé la surface. */
  assert.equal(got.vitals.hpMax, 9);
  assert.equal(got.vitals.hpMax, attendu.vitals.hpMax);
  assert.equal(got.gear.find((item) => item.id === "torche").quantity, 4);
  assert.deepEqual(construire().rebuilt.structuredContent.overridesApplied.map((entry) => entry.path),
    ["resolved.vitals.hpMax", "resolved.gear[torche].quantity"]);

  /* L'INCANTATION, jusqu'aux huit sorts et à leur ordre. */
  assert.equal(got.spellcasting.ability, "int");
  assert.equal(got.spellcasting.dc, 13);
  assert.equal(got.spellcasting.attackBonus, 5);
  assert.deepEqual(got.spellcasting.slots, attendu.spellcasting.slots);
  assert.deepEqual(got.spellcasting.spells.map((spell) => spell.id),
    attendu.spellcasting.spells.map((spell) => spell.id));

  /* LE SAC : identités, quantités et port du fichier. Le poids et la note
     d'objet ne sont pas dérivés — facultatifs au schéma, et DÉCLARÉS
     (voir le test `underived` plus bas). */
  const nu = (item) => ({ id: item.id, name: item.name, quantity: item.quantity, equipped: item.equipped });
  assert.deepEqual(got.gear, attendu.gear.map(nu));

  /* LES OUTILS : la note du fichier est une phrase d'interface, pas une
     dérivation (mesure du lot 9, reprise ici sans être rouverte). */
  assert.deepEqual(got.tools, attendu.tools.map(({ note, ...reste }) => reste));
});

test("⚠️ `underived` TRAVERSE JUSQU'À L'IA — dans le structuredContent ET dans le texte", () => {
  const result = construire().rebuilt;
  const underived = result.structuredContent.underived;

  /* La liste EXACTE, pas un « contient ». Si un champ devient dérivable, ce
     test doit rougir pour qu'on retire sa ligne — exactement comme il doit
     l'ajouter quand un champ cesse de l'être.
     REWRITTEN 2026-08-08 (lot 13) — et c'est arrivé, sur le même champ, dans
     les deux sens : `traits (espèce)` était entré à la fusion du lot 8 (refus
     mesuré, préalable nommé), il en sort ici, le lot 11 ayant réparé
     l'extraction à deux colonnes dans `fh-srd`. La liste du bloc `build` et
     celle qui traverse jusqu'à l'IA sont la MÊME : elles bougent ensemble. */
  /* REWRITTEN 2026-08-08 — révision du schéma (GAP-DERIVED, architecte).
     `resolved.stats` rejoint la liste : une statistique dérivée de couche vient
     d'un module moteur activé par un drapeau, et aucun module n'en publie au M2.
     L'assertion n'est pas relâchée — elle reste une LISTE EXACTE, et c'est elle
     qui a rougi la première quand le champ est apparu. */
  assert.deepEqual(underived.map((entry) => entry.field), [
    "actions",
    "craft",
    "gear[].weight",
    "identity.species (lignage)",
    "languages",
    "notes",
    "resources",
    "senses[perception-passive]",
    "spellcasting.spells[].castType",
    "spellcasting.spells[].concentration",
    "spellcasting.spells[].damage",
    "stats",
    "traits (classe, don, arrière-plan)"
  ]);
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. Chaque
     entrée porte son propre `toString` non énumérable (lié à sa table
     d'origine, générique ou FH) depuis sa construction : `${entry}` suffit,
     exactement ce que `src/mcp/tools.mjs` fait pour composer son texte —
     ce test vérifie donc la MÊME chaîne que le client MCP reçoit. */
  for (const entry of underived) {
    assert.ok(String(entry).length > 40, `« ${entry.field} » doit dire POURQUOI, pas seulement QUOI`);
  }

  /* ⚠️ ET DANS LE TEXTE. Tout l'intérêt du M2 est qu'une machine sache ce qui
     n'a PAS pu être dérivé. Un client qui ne lit que le `content` textuel —
     et beaucoup n'en lisent pas d'autre — doit le voir aussi. Les avaler ici
     serait le repli silencieux que ce chantier combat. */
  const texte = result.content[0].text;
  assert.equal(result.content[0].type, "text");
  /* REWRITTEN 2026-08-08 — révision du schéma (GAP-DERIVED) : `stats` est le
     treizième champ non dérivé. Le compte est réécrit à la nouvelle vérité, pas
     relâché en `/NON DÉRIVÉ \(\d+\)/` — un compte flou ne verrait plus rien. */
  assert.match(texte, /NON DÉRIVÉ \(13\)/);
  for (const entry of underived) {
    assert.ok(texte.includes(entry.field), `le texte doit NOMMER « ${entry.field} »`);
    assert.ok(texte.includes(String(entry)), `le texte doit porter la RAISON de « ${entry.field} »`);
  }
  assert.match(texte, /RECORDS RECOUVERTS \(\d+\)/, "et `shadowed` a sa ligne, même vide");
  assert.match(texte, /CHOIX NON CONSOMMÉS \(5\)/,
    "lignage, don d'arrière-plan, mode de caractéristiques, don homebrew, langue");

  assert.equal(result.isError, false, "un rebuild qui réussit n'est pas un échec, et il le dit");
});

test("LOT 28 — `decisions` traverse MCP avec ses chemins, compteurs et statuts", () => {
  const result = construire().rebuilt;
  const decisions = result.structuredContent.decisions;
  assert.equal(Array.isArray(decisions), true);
  const skills = decisions.find((entry) => entry.path === "class.skills");
  assert.deepEqual({ status: skills.status, expected: skills.expected, answered: skills.answered, remaining: skills.remaining },
    { status: "answered", expected: 2, answered: 2, remaining: 0 });
  assert.deepEqual(skills.options,
    ["arcanes", "histoire", "intuition", "investigation", "medecine", "nature", "religion"]);
  /* LOT 72 — le carnet gagne les sorts : 13 + 2 groupes + 7 étapes = 22.
     LOT 74 — puis les six scores de base (borne de création 3–18) : 28.
     2026-08-18 — puis le lignage de l'Elfe : 29. Le document le POSAIT
     déjà (`species.lineage = "haut-elfe"`) sans qu'aucun plan le juge. */
  assert.match(result.content[0].text, /DÉCISIONS \(29\)/,
    "l'IA n'a pas à deviner qu'un septième carnet existe dans structuredContent");
  assert.match(result.content[0].text, /class\.skills : answered, 2\/2/);
  assert.match(result.content[0].text, /class\.cantrips : answered, 3\/3/,
    "les plans de sorts traversent MCP comme les autres");
  assert.match(result.content[0].text, /abilities\.str : answered, 1\/1/,
    "la borne de création traverse MCP comme les autres plans (lot 74)");
});

test("`build.validate` ne trouve rien à redire — et un refus reste un RÉSULTAT", () => {
  construire();
  const result = client.call("build.validate", {});
  assert.equal(result.isError, false, "`validate` qui refuse n'est pas un outil en échec : il RÉPOND");
  assert.equal(result.structuredContent.ok, true);
  assert.deepEqual(result.structuredContent.violations, []);
  const inertes = result.structuredContent.warnings.filter((line) => line.includes("n'a été consommé"));
  assert.equal(inertes.length, 5);
});

test("le document sort par `mcp.document` ET par la resource — le même, au caractère près", () => {
  construire();

  const outil = client.call("mcp.document", {});
  assert.equal(outil.isError, false);
  const parOutil = outil.structuredContent;
  assert.equal(parOutil.schema, "fh-char/1");
  assert.equal(parOutil.id, FICHIER.id);
  assert.equal(parOutil.build.choices.length, FICHIER.build.choices.length,
    "les 59 décisions du fichier, posées une à une par la surface");
  assert.equal(parOutil.build.overrides.length, 2);
  /* « Rendre son JSON en texte » était la commande : le contenu textuel EST
     le document, pas un résumé de document. */
  assert.deepEqual(JSON.parse(outil.content[0].text), parOutil);

  const lue = client.request("resources/read", { uri: "fh-char:///open" }).result;
  assert.equal(lue.contents.length, 1);
  assert.equal(lue.contents[0].uri, "fh-char:///open");
  assert.equal(lue.contents[0].mimeType, "application/json");
  assert.deepEqual(JSON.parse(lue.contents[0].text), parOutil,
    "la resource et l'outil servent le même document — deux portes, une pièce");
});

test("AUCUN OUTIL NE REND LE DOCUMENT DANS SON RÉSULTAT — il est à la resource, à un seul endroit", () => {
  const { rebuilt } = construire();
  assert.equal(rebuilt.structuredContent.document, undefined,
    "`rebuild` rend `resolved`, `decisions`, `underived`, `shadowed`… mais le document a une adresse, et une seule");
  const choix = client.call("build.choose",
    { path: "species", ref: { kind: "species", id: "srd:species:fr:elfe" }, label: "Elfe" });
  assert.equal(choix.structuredContent.document, undefined);
  assert.deepEqual(Object.keys(choix.structuredContent), ["choice"]);
  assert.equal(choix.structuredContent.choice.replaced, true, "la même décision, reposée, REMPLACE");
});

test("le personnage se relit et se reconstruit sans jamais repasser le document", () => {
  construire();
  /* Une SECONDE reconstruction, sans argument : le personnage est ouvert, et
     les overrides ne s'effacent pas. */
  const encore = client.ok("build.rebuild", {});
  assert.equal(encore.resolved.vitals.hpMax, 9);
  assert.equal(encore.resolved.gear.find((item) => item.id === "torche").quantity, 4);
});

test("`build.clear` lève l'override du MJ SUR LA LIGNE — la fiche revient aux règles", () => {
  construire();
  const clear = client.call("build.clear", { path: "resolved.gear[torche].quantity", kind: "override" });
  assert.equal(clear.isError, false);
  assert.deepEqual(Object.keys(clear.structuredContent), ["cleared"],
    "comme les cinq autres verbes, aucun outil ne rend le document dans son résultat");
  assert.deepEqual(clear.structuredContent.cleared,
    { path: "resolved.gear[torche].quantity", kind: "override", removed: true });

  const encore = client.ok("build.rebuild", {});
  assert.equal(encore.resolved.gear.find((item) => item.id === "torche").quantity, 2,
    "l'override levé, la quantité redevient celle que les règles ont produite");
});
