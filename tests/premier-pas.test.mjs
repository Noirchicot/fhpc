/* ══ LOT 193 — LE PREMIER PAS : « Build a character » CRÉE un personnage ════

   ⚖️ Eric, 10/09, gravé avec ses deux questions dans `ARCHITECTURE.md`
   (§ « LE PREMIER PAS ») : *« j'arrive dans le menu, je tape Build a
   character, je suis débutant. Il me faut un perso SRD mais je n'ai même pas
   regardé les menus du dessous. Un popup doit me dire, avant même d'arriver à
   l'étape 1, tout de suite : tu veux SRD ou FH ? — et faire le réglage pour
   moi. Le perso du navigateur est sauvegardé automatiquement et dégage du
   navigateur ; tous les choix des étapes sont réinitialisés. »*

   🔴 CE QUE CE FICHIER GARDE, ET SUR QUOI :
     A. la SÉQUENCE pure (`creerUnPersonnage`) — sauvegarder, PUIS repartir,
        PUIS demander ; un Save refusé n'efface rien ; pas de personnage, pas
        de Save. C'est l'ordre qui est la règle, et il se mesure ici.
     B. le POPUP pur (`popupDuJeu`) — DEUX voies, leurs mots, ce que chacune
        règle. ⛔ Jamais trois.
     C. le NOM d'un personnage sans nom — un seul mot pour la même absence,
        celui de la naissance et celui que le Menu affiche.
     D. ⚔️ LE MANIFESTE, CONFRONTÉ À CELUI QUE `rebuild` ADOPTE sur la VRAIE
        pile : deux écrivains de la même forme, et c'est ici qu'un troisième
        champ de `$defs/layerRef` se ferait voir.
     E. les OCTETS de la coquille — elle câble la séquence, le même organe que
        `Save`, et la voie qui règle le maître puis ouvre l'étape 1.
     F. `composer` (src/doc/writers.mjs) — l'écrivain qui fait NAÎTRE le
        document, le même que `doc.create`, appelable sans magasin.

   ⚠️ ON TESTE LA FONCTION, PAS LA PAGE : la géométrie se regarde au
   navigateur, ce fichier garde le RAISONNEMENT et le CÂBLAGE. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { acceptanceDocument, makeHarness, manifestOf, readJson } from "./build-harness.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

globalThis.document = createTestDocument();

const { renderUniverseStep, creerUnPersonnage, popupDuJeu, NOM_DU_PERSONNAGE_NEUF }
  = await import("../ui/builder/universe-step.mjs");
const { manifesteDeLaPile } = await import("../ui/builder/layers-ecran.mjs");
const { createDocWriters, CHOIX_DE_NAISSANCE } = await import("../src/doc/writers.mjs");

/** Le journal des gestes — c'est l'ORDRE qu'on mesure, pas seulement le fait
 *  que chacun ait eu lieu. Un jeu de gestes qui s'exécutent tous dans le
 *  mauvais ordre passerait un test qui compte, et perdrait le personnage. */
function journal(saveRend) {
  const vus = [];
  return {
    vus,
    gestes: {
      sauvegarder: () => { vus.push("sauvegarder"); return saveRend; },
      repartirAZero: () => { vus.push("repartirAZero"); },
      demanderLeJeu: () => { vus.push("demanderLeJeu"); }
    }
  };
}

/* ══ A — LA SÉQUENCE PURE ══════════════════════════════════════════════════ */

test("A1 — 🔴 un personnage présent : Save UNE fois, PUIS le document neuf, PUIS le popup", async () => {
  const j = journal(true);
  const ne = await creerUnPersonnage({ personnage: true, ...j.gestes });
  assert.equal(ne, true, "le personnage neuf est né");
  assert.deepEqual(j.vus, ["sauvegarder", "repartirAZero", "demanderLeJeu"],
    "⛔ inverser Save et reset sauvegarderait le personnage vide qu'on vient de fabriquer");
});

test("A2 — ⚔️ SAVE REFUSÉ : rien ne bouge — ni reset, ni question (la règle du 192)", async () => {
  /* ⚖️ Eric, 10/09 : *« téléchargement bloqué = pas de reset »*. Le refus est
     déjà dit par la porte (`porteEnPanne`) ; ce que ce garde tient, c'est que
     le personnage du joueur est TOUJOURS LÀ. */
  const j = journal(false);
  const ne = await creerUnPersonnage({ personnage: true, ...j.gestes });
  assert.equal(ne, false);
  assert.deepEqual(j.vus, ["sauvegarder"], "le document n'est pas remplacé et la question n'est pas posée");
});

test("A3 — ⚔️ UN SAVE QUI REND AUTRE CHOSE QUE `true` EST UN REFUS", async () => {
  /* Une absence n'est jamais une réponse : `undefined` (une porte qui se tait)
     n'autorise pas plus l'effacement qu'un `false` franc. */
  for (const rendu of [undefined, null, 0, "", "true", 1]) {
    const j = journal(rendu);
    assert.equal(await creerUnPersonnage({ personnage: true, ...j.gestes }), false, `rendu ${JSON.stringify(rendu)}`);
    assert.deepEqual(j.vus, ["sauvegarder"]);
  }
  /* ⚔️ LOT 195 — ET UNE PROMESSE NON TENUE EST UN REFUS. La séquence attend
     désormais (le magasin range en différé) : un `await` oublié ferait de
     TOUTE promesse — y compris `Promise.resolve(false)` — un accord, et le
     personnage du joueur serait effacé sur un objet toujours vrai. */
  for (const rendu of [false, undefined, null]) {
    const j = journal(rendu);
    const gestes = { ...j.gestes, sauvegarder: async () => { j.vus.push("sauvegarder"); return rendu; } };
    assert.equal(await creerUnPersonnage({ personnage: true, ...gestes }), false, `promesse de ${JSON.stringify(rendu)}`);
    assert.deepEqual(j.vus, ["sauvegarder"], "⛔ une promesse n'est pas un accord");
  }
});

test("A4 — 🔴 SANS PERSONNAGE : `sauvegarder` n'est JAMAIS appelé, et la question se pose quand même", async () => {
  const j = journal(true);
  assert.equal(await creerUnPersonnage({ personnage: false, ...j.gestes }), true);
  assert.deepEqual(j.vus, ["repartirAZero", "demanderLeJeu"],
    "écrire un fichier de rien serait un téléchargement que personne n'a demandé");
});

/* ══ B — LE POPUP : DEUX VOIES ═════════════════════════════════════════════ */

test("B1 — ⚖️ DEUX VOIES, PAS TROIS — la réponse d'Eric à sa propre question", () => {
  const popup = popupDuJeu(() => {});
  assert.equal(popup.actions.length, 2, "⛔ « combien de voies au popup ? → deux : SRD · Fate's Hand »");
  assert.deepEqual(popup.actions.map((a) => a.mot), ["SRD", "Fate's Hand"]);
});

test("B2 — 🔴 CHAQUE VOIE RÈGLE LE MAÎTRE, et elle le nomme dans le vocabulaire déjà en place", () => {
  /* `"srd"` / `"srdfh"` sont les deux noms de `currentStack` et de
     `requestLayerStack` — ⛔ pas un mot neuf pour la même chose. */
  const regles = [];
  const popup = popupDuJeu((pile) => regles.push(pile));
  for (const voie of popup.actions) voie.faire();
  assert.deepEqual(regles, ["srd", "srdfh"]);
});

test("B3 — 🗣️ UN MOT PAR VOIE, et une phrase d'entrée qui dit ce que la question décide", () => {
  const popup = popupDuJeu(() => {});
  const lignes = popup.texte.split("\n");
  assert.equal(lignes.length, 3, "une phrase d'entrée, puis un mot par voie — jamais un choix nu");
  assert.match(lignes[0], /Which rules/, "⛔ un tableau sans phrase d'entrée est un dump");
  assert.match(lignes[1], /^SRD — the core rules, playable anywhere\.$/);
  assert.match(lignes[2], /^Fate's Hand — the world of Nymedes and its rules\.$/);
  assert.match(lignes[0], /from Layers\./, "…et il dit où le réglage vit ensuite");
  /* ⚖️ LE LEXIQUE DU 10/09 : ⛔ ni « couche », ni « homebrew », ni « layer » dans
     un mot de joueur. ⚠️ `Layers` avec sa majuscule est le NOM D'UN ÉCRAN, pas
     un mot de règle : on le RETIRE avant de mesurer, sinon le garde
     accuserait la phrase qui dit où aller. */
  const sansLeLieu = popup.texte.split("Layers").join("");
  assert.doesNotMatch(sansLeLieu, /\b(layer|layers|couche|couches|homebrew)\b/i);
});

test("B4 — ⛔ LE POPUP NE SIGNALE RIEN : rôle `guide`, jamais le rouge du gendarme", () => {
  /* Les deux voies sont PAIRES — aucune ne défait rien. `confirm.mjs` peint sa
     confirmation en `--critical` parce qu'elle protège une destruction ;
     l'employer ici aurait peint « Fate's Hand » en rouge. */
  const popup = popupDuJeu(() => {});
  assert.equal(popup.role, "guide");
  assert.match(popup.titre, /SRD or Fate's Hand\?/);
  for (const voie of popup.actions) assert.equal(voie.defait, undefined, "aucune voie ne DÉFAIT");
});

/* ══ C — LE NOM D'UN PERSONNAGE SANS NOM ═══════════════════════════════════ */

test("C1 — 🔴 UN SEUL MOT POUR LA MÊME ABSENCE : le Menu affiche celui de la naissance", () => {
  /* `fh-char/1` exige `name.minLength: 1` — un personnage neuf ne peut pas
     naître sans nom. Deux mots (celui du document, celui de l'écran) auraient
     divergé au premier réglage d'Eric. */
  const doc = {
    schema: "fh-char/1", id: "premier-pas", name: "   ", lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-10T00:00:00Z", modified: "2026-09-10T00:00:00Z",
    build: { layers: [], choices: [], budgets: {}, overrides: [] }
  };
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  assert.equal(node.querySelectorAll(".tdc-nom")[0].textContent, NOM_DU_PERSONNAGE_NEUF);
  assert.equal(NOM_DU_PERSONNAGE_NEUF.length > 0, true, "le schéma refuse une chaîne vide");
  /* ⚖️ ET LE MOT EST CELUI D'ERIC — 2026-09-10, en entier : *« "Name
     character" »*. ⛔ Il est écrit ICI, une fois, parce qu'une cote DONNÉE ne
     se laisse pas remplacer par un défaut déduit : `Unnamed character` était
     le mien, faute de son mot, et rien n'aurait rougi s'il revenait.
     ⭐ Le changement de mot est aussi un changement de VOIX : l'ancien
     DÉCRIVAIT un état, celui-ci DEMANDE un geste. */
  assert.equal(NOM_DU_PERSONNAGE_NEUF, "Name character",
    "le mot d'Eric, 10/09 — un défaut déduit ne le remplace pas en silence");
});

/* ══ D — ⚔️ LE MANIFESTE, CONFRONTÉ À CELUI QUE `rebuild` ADOPTE ═══════════ */

test("D1 — ⚔️ le manifeste du navigateur est CELUI que `rebuild` écrit, sur la vraie pile", () => {
  /* 🔴 POURQUOI DEUX ÉCRIVAINS EXISTENT : `rebuild` n'adopte la pile QUE quand
     il réussit à dériver, et un personnage NEUF ne dérive pas (pas de classe).
     Le navigateur doit donc savoir DÉCLARER la pile lui-même. Ce garde est ce
     qui empêche les deux de diverger — le bloc `build` compare
     `id@version#hash` et JETTE au moindre écart. */
  const h = makeHarness();                     // la pile du harnais : SRD fr + la couche d'exemple
  const doc = acceptanceDocument(h.layers);
  doc.build.layers = [];                       // « jamais construit » : `rebuild` adopte
  const out = h.verbs.rebuild({ document: doc });
  assert.deepEqual(manifesteDeLaPile(h.layers.verbs.stack()), out.document.build.layers,
    "⛔ un champ de plus dans `$defs/layerRef` se voit ICI, pas dans la fiche d'un joueur");
  assert.deepEqual(manifesteDeLaPile(h.layers.verbs.stack()), manifestOf(h.layers),
    "…et c'est aussi la forme du générateur d'exemple");
});

test("D2 — ⚔️ une couche ÉTEINTE n'entre pas au manifeste, et `name` n'est posé que s'il existe", () => {
  const pile = [
    { id: "a", version: "1.0.0", hash: "a".repeat(64), name: "A", enabled: true },
    { id: "b", version: "2.0.0", hash: "b".repeat(64), name: "B", enabled: false },
    { id: "c", version: "3.0.0", hash: "c".repeat(64), enabled: true }
  ];
  assert.deepEqual(manifesteDeLaPile(pile), [
    { id: "a", version: "1.0.0", hash: "a".repeat(64), name: "A" },
    { id: "c", version: "3.0.0", hash: "c".repeat(64) }
  ]);
  assert.equal("name" in manifesteDeLaPile(pile)[1], false, "⛔ jamais une clef posée à vide");
  assert.deepEqual(manifesteDeLaPile(null), [], "une pile absente n'est pas une pile inventée");
});

/* ══ E — LES OCTETS DE LA COQUILLE ═════════════════════════════════════════ */

const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));

test("E1 — 🔌 `construireLePersonnage` passe par la SÉQUENCE pure, et par le MÊME organe que `Save`", () => {
  assert.match(shell, /action\.kind === "construireLePersonnage"[\s\S]{0,900}creerUnPersonnage\(\{/,
    "le verbe du Menu appelle la séquence gardée, il ne réécrit pas l'ordre");
  assert.match(shell, /sauvegarder: \(\) => exporterJson\(\{ quoi: "Build a character" \}\)/,
    "⛔ jamais un second chemin d'écriture : `exporterJson` rend true/false depuis le 192 — et son refus NOMME la porte poussée");
  assert.match(shell, /function exporterJson\(\{ version, quoi = "Export JSON" \} = \{\}\)/,
    "…par défaut, `Save` et Review disent exactement ce qu'ils disaient");
  assert.doesNotMatch(shell, /porteEnPanne\("Export JSON"/,
    "⛔ le nom de la porte ne s'écrit plus en dur dans le corps : il vient de l'appelant");
  assert.match(shell, /repartirAZero: \(\) => \{\s*state\.document = personnageNeuf\(precedent\);/,
    "« repartir à zéro » est un document NEUF, pas des champs vidés un par un");
  assert.match(shell, /demanderLeJeu: \(\) => \{\s*state\.popup = popupDuJeu\(/,
    "…et la question est celle de l'écran, pas une boîte écrite dans la coquille");
  /* ⛔ JAMAIS LE `confirm()` DU NAVIGATEUR. ⚠️ Et le garde mesure la FORME
     D'EMPLOI, pas le mot : `state.docWriters.confirm({…})` est le verbe du bloc
     `doc`, il porte le même mot et n'a rien à voir. Le `confirm(` du navigateur
     est celui que RIEN ne précède. */
  assert.doesNotMatch(shell, /(?<![.\w$])confirm\s*\(/, "⛔ jamais le `confirm()` du navigateur");
  assert.match(shell, /state\.docWriters\.confirm\(/, "témoin : le verbe homonyme du bloc `doc` est bien là, et il ne rougit pas");
});

test("E2 — 🔌 la voie choisie RÈGLE LE MAÎTRE, DÉCLARE la pile, puis ouvre l'étape 1 — dans cet ordre", () => {
  assert.match(shell, /action\.kind === "choisirLeJeu"\) \{\s*applyLayerStack\(action\.value\);\s*declarerLaPileMontee\(\);\s*goToStep\(1\);/,
    "⛔ déclarer avant de monter déclarerait la pile d'avant");
  assert.match(shell, /function declarerLaPileMontee\(\) \{\s*if \(state\.document\.build\.layers\.length > 0\) return;/,
    "on ne redéclare pas ce que `rebuild` a déjà adopté");
});

test("E3 — 🔴 UN SEUL ÉCRIVAIN REMET L'ÉCRAN À ZÉRO — et depuis le 197, il ne l'ÉNUMÈRE plus", () => {
  /* Un organe que N écrans fabriquent est un organe qu'on oublie : la liste
     était écrite dans `ouvrirUnFichier`, et sa propre tête disait déjà le
     piège (« raterait le onzième qu'on ajoutera demain, EN SILENCE »).

     🌱 LOT 197 — ET LE ONZIÈME ÉTAIT DÉJÀ ARRIVÉ QUATORZE FOIS. 📏 Mesuré le
     10/09 sur v620 : `state` portait 41 champs, ce chemin en remettait 18, et
     23 survivaient. ⛔ CE GARDE NE SE DESSERRE PAS — il change d'objet, parce
     que son objet d'avant est devenu le défaut : exiger que la LISTE soit ici
     obligeait à écrire une liste. Il exige maintenant qu'AUCUNE liste ne vive
     dans aucun des trois chemins, et que tous les trois passent par
     `remettreAZero` (`etat-neuf.mjs`), dont le contenu est mesuré sur la
     donnée par `tests/etat-neuf.test.mjs`. */
  const corps = shell.match(/function remettreLEcranAZero\(\) \{([\s\S]*?)\n\}/);
  assert.ok(corps, "la fonction existe");
  assert.match(corps[1], /remettreAZero\(state\);/,
    "elle DÉLÈGUE à la source de l'état neuf — ⛔ elle ne réécrit pas l'ordre");
  assert.deepEqual([...corps[1].matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()), [],
    "⛔ un seul `state.x = …` ici et la liste par nom est de retour, avec son défaut");

  /* ⭐ LOT 195 — L'ORGANE A GAGNÉ UN ÉTAGE, ET LE GARDE AVEC LUI. Le magasin
     avait besoin, MOT POUR MOT, de ce que `ouvrirUnFichier` faisait après avoir
     lu un fichier : `poserLeDocumentOuvert` est né de là. ⛔ Les DEUX portes
     (le fichier du disque, l'entrée du magasin) passent par cet organe, et
     AUCUNE ne pose de champ à la main. */
  const ouvrir = shell.slice(shell.indexOf('action.kind === "ouvrirUnFichier"'), shell.indexOf('action.kind === "oublierPersonnage"'));
  assert.match(ouvrir, /poserLeDocumentOuvert\(issue\.document\);/, "l'ouverture d'un fichier RÉEMPLOIE l'organe");
  const entree = shell.slice(shell.indexOf('action.kind === "ouvrirUneEntree"'), shell.indexOf('action.kind === "choisirLaDestination"'));
  assert.match(entree, /poserLeDocumentOuvert\(issue\.document\);/,
    "rouvrir une sauvegarde du magasin est le MÊME atterrissage — ⛔ pas un second chemin");
  const pose = shell.match(/function poserLeDocumentOuvert\(document\) \{([\s\S]*?)\n\}/);
  assert.ok(pose, "l'organe existe");
  assert.match(pose[1], /remettreLEcranAZero\(\);/, "et c'est LUI qui réemploie l'organe");
  /* ⚠️ LES DEUX PORTES ÉCRIVENT ENCORE UN CHAMP, ET UN SEUL : le refus de
     LECTURE (`ouvertureRefusee`), posé quand le fichier ou l'entrée ne se lit
     PAS — c'est-à-dire quand `poserLeDocumentOuvert` n'est jamais atteint. Ce
     n'est pas une moitié de remise à zéro, c'est le mot du refus. ⛔ Tout
     autre champ ici serait le second écrivain de retour. */
  for (const [ou, texte] of [["ouvrirUnFichier", ouvrir], ["ouvrirUneEntree", entree]]) {
    const poses = [...new Set([...texte.matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()))];
    assert.deepEqual(poses, ["state.ouvertureRefusee ="],
      `\`${ou}\` ne pose que le refus de LECTURE — le reste appartient à l'organe`);
  }
  assert.match(shell, /repartirAZero: \(\) => \{[\s\S]{0,600}remettreLEcranAZero\(\);/, "…et le personnage neuf aussi");
});

test("E4 — ⛔ LE MOTEUR PAS CHARGÉ EST UNE PORTE EN PANNE, comme pour `Save` — jamais un bouton muet", () => {
  assert.match(shell, /if \(!state\.engine \|\| !state\.docWriters\) \{\s*porteEnPanne\("Build a character"/);
  /* ⏳ LOT 195 — LA SÉQUENCE ATTEND, donc c'est la PROMESSE qui porte le refus.
     ⛔ Rien n'est relâché : le mot est le même, la porte est la même, et un
     `composer` qui jette se dit toujours au lieu de casser la page. */
  assert.match(shell, /\}\)\.then\(\(\) => refresh\(\),[\s\S]{0,400}\(cause\) => porteEnPanne\("Build a character", cause\.message\)\);/,
    "un refus de `composer` se DIT, il ne casse pas la page en silence");
});

test("E5 — 🔴 LE DOCUMENT NEUF NAÎT DE L'ÉCRIVAIN DU BLOC `doc`, et il hérite langue et unités", () => {
  assert.match(shell, /state\.docWriters\.composer\(\{/, "⛔ pas un objet littéral écrit dans la coquille");
  assert.match(shell, /lang: precedent\.lang,\s*units: precedent\.units,/,
    "aucun défaut deviné (décision D3) : `en`/pieds posés d'office trahiraient un joueur en `fr`/mètres");
  assert.match(shell, /at: platformNow\(\)/, "l'horloge du bloc `doc`, pas une seconde écrite ici");
});

/* ══ F — `composer` : L'ÉCRIVAIN QUI FAIT NAÎTRE UN DOCUMENT ═══════════════ */

const schema = readJson("schemas/fh-char.schema.json");
const writers = createDocWriters({ schema });
const NEUF = {
  name: "Sonde", lang: "en", units: { distance: "ft", weight: "lb" },
  layers: [{ id: "srd-5.2.1-en", version: "1.0.0", hash: "f".repeat(64) }],
  id: "premier-pas-neuf", at: "2026-09-10T02:24:10Z"
};

test("F1 — 🔴 un document NEUF est `fh-char/1` moins `resolved`, LE NIVEAU DE NAISSANCE pour seul choix, la pile DÉCLARÉE", () => {
  const doc = writers.composer({ ...NEUF });
  assert.equal(doc.schema, "fh-char/1");
  assert.equal("resolved" in doc, false, "un brouillon ne dérive rien");
  /* 🌱 LOT 198 — RÉÉCRIT À LA NOUVELLE VÉRITÉ, PAS RELÂCHÉ : ce garde disait
     « ZÉRO choix ». Mesuré sur v621, un personnage né ainsi ne dérivait JAMAIS
     (`derive` exige `level`, et aucun écran ne l'écrit). Un personnage naît
     au niveau 1 — un fait du produit, écrit par `composer`, une fois. Ce que
     le garde tient n'a pas molli : rien d'AUTRE que la naissance n'est posé,
     et la naissance se lit à la constante, jamais recopiée. */
  assert.deepEqual(doc.build.choices, [...CHOIX_DE_NAISSANCE].map((c) => ({ ...c })),
    "le seul choix d'un document neuf est son niveau de naissance (lot 198)");
  assert.equal(doc.build.choices.length, 1, "et rien d'autre : « à zéro à la création » — Eric, 10/09");
  assert.deepEqual(doc.build.budgets, {});
  assert.deepEqual(doc.build.overrides, []);
  assert.deepEqual(doc.build.layers, NEUF.layers, "il part avec la pile choisie DÉCLARÉE");
  assert.equal(doc.created, NEUF.at);
  assert.equal(doc.modified, NEUF.at);
});

test("F2 — ⚔️ AUCUN DÉFAUT DEVINÉ (décision D3) : chacun des six champs manquants est NOMMÉ", () => {
  for (const clef of ["name", "lang", "units", "layers", "id", "at"]) {
    const payload = { ...NEUF };
    delete payload[clef];
    assert.throws(() => writers.composer(payload), (e) => e.message.includes(`« ${clef} »`), `« ${clef} » manque`);
  }
});

test("F3 — 🔴 LE NAVIGATEUR ET LE BLOC ÉCRIVENT LE MÊME DOCUMENT — `create` est `composer`", () => {
  /* ⛔ `store.mjs` n'écrit plus la forme d'un document neuf : il appelle
     `composer` avec l'id et l'heure qu'il possède. Deux écrivains auraient
     divergé au premier champ ajouté au schéma, et celui du navigateur en
     silence puisque `create` seul avait des tests. */
  const store = stripComments(fs.readFileSync(path.join(ROOT, "src", "doc", "store.mjs"), "utf8"));
  assert.match(store, /return composer\(\{ \.\.\.options, id: freshId\(\), at: now\(\) \}, "create"\)/);
  assert.doesNotMatch(store, /schema: SCHEMA_TAG,\s*id: freshId/, "la forme n'est plus écrite deux fois");
});

test("F4 — 🔴 LES CHAMPS DESCRIPTIFS SONT ACCEPTÉS DÈS LA NAISSANCE, JAMAIS EXIGÉS (lot 48, §1c)", () => {
  const nu = writers.composer({ ...NEUF });
  assert.equal("gender" in nu, false);
  const decrit = writers.composer({ ...NEUF, gender: "she/her", alignment: "Chaotic Good", inconnu: "avalé" });
  assert.equal(decrit.gender, "she/her");
  assert.equal(decrit.alignment, "Chaotic Good");
  assert.equal("inconnu" in decrit, false, "ce qu'il ne sait pas nommer, il ne le garde pas");
});

test("F5 — ⚔️ UN DOCUMENT QUI NE VALIDE PAS EST REFUSÉ, avec le verbe qui parle", () => {
  assert.throws(() => writers.composer({ ...NEUF, name: "" }, "create"),
    (e) => /^fhpc\/doc: create : le document ne valide pas/.test(e.message));
  assert.throws(() => writers.composer({ ...NEUF, id: "pas d'espace ici" }),
    (e) => /composer : le document ne valide pas/.test(e.message));
});
