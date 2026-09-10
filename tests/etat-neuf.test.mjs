/* ══ 🌱 LOT 197 — UN ÉCRAN VIERGE, À LA RACINE, ET LE GARDE QUI LE COMPTE ═══

   ⚖️ Eric, 2026-09-10, à « pourquoi `Build a character` ne rend pas un écran
   vierge ? » : *« Quand je fais reset ou Build a character, je veux TOUT À LA
   RACINE R ET RIEN DE DÉJÀ CONSTRUIT ! Pourquoi tu ne l'as pas fait ? »*

   📏 LA MESURE QUI A FAIT NAÎTRE CE FICHIER : sur `main` (v620), `state`
   portait **41 champs** et le chemin de `Build a character` en remettait
   **18** ; **23 survivaient**, dont quatorze qui appartenaient en propre à
   l'écran du personnage précédent.

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER, ET CE N'EST PAS « qu'un champ soit
   oublié » : c'est que la LISTE PAR NOM revienne. Une liste par nom ne dit
   jamais qu'elle est incomplète — chaque champ ajouté à `state` depuis le lot
   193 était oublié PAR DÉFAUT, en silence, et c'est ce défaut-là qui se
   reproduit tout seul. Le garde ne compte donc pas une liste : il énumère les
   clefs RÉELLES de l'objet (`Object.keys(etatNeuf())`) et exige que chacune,
   hors des survivants NOMMÉS, ait repris sa valeur d'état neuf.
   ⇒ Un champ ajouté demain à `etatNeuf()` entre dans ce garde tout seul.

   ⛔ SA LIMITE, ET IL LA DIT : il juge l'organe, pas la page. Que la coquille
   l'APPELLE se mesure sur les octets (partie D, et `premier-pas.test.mjs` E3) ;
   que l'écran soit réellement vierge se REGARDE au navigateur.

   ⚔️ ÉPROUVÉ ROUGE AVANT D'ÊTRE VERT — la mutation est écrite dans le message
   de commit du lot : un `champBidon` ajouté à `etatNeuf()` avec l'ANCIENNE
   remise à zéro (la liste de quinze champs, recopiée) fait rougir A2 en le
   nommant. La partie C rejoue cette même faute en permanence, sur une remise à
   zéro par nom fabriquée ici. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

import { etatNeuf, remettreAZero, CHAMPS_QUI_SURVIVENT } from "../ui/builder/etat-neuf.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));

/** UN ÉTAT SALE — chaque champ porte une valeur qui ne peut pas être la
 *  sienne à l'état neuf. ⛔ Pas « une valeur différente » choisie à la main
 *  champ par champ : une SENTINELLE unique, pour que le témoin ne dépende
 *  jamais du champ qu'il salit. */
const SENTINELLE = { sale: "le personnage d'avant" };
function etatSale() {
  const etat = etatNeuf();
  for (const clef of Object.keys(etat)) etat[clef] = SENTINELLE;
  return etat;
}

/* ══ A — LE GARDE QUI COMPTE : LES CLEFS RÉELLES, JAMAIS UNE LISTE ═════════ */

test("A1 — 📏 LA MESURE DU LOT, GRAVÉE : 41 champs, 10 survivent, 31 tombent", () => {
  /* ⚠️ Ce n'est pas un garde de régression sur un chiffre — c'est le RELEVÉ
     daté qui rend la phrase du corpus vérifiable. Si un champ s'ajoute, ce
     test se met à jour AVEC son commentaire ; il ne se supprime pas. */
  const clefs = Object.keys(etatNeuf());
  assert.equal(clefs.length, 41, "📏 mesuré le 2026-09-10 sur v620 — 41 champs déclarés");
  assert.equal(Object.keys(CHAMPS_QUI_SURVIVENT).length, 10,
    "la liste des survivants est COURTE, et c'est ce qui la rend relisable");
  assert.equal(clefs.filter((c) => !(c in CHAMPS_QUI_SURVIVENT)).length, 31,
    "⛔ 18 sur 41 avant ce lot — l'inversion est ce chiffre-là");
});

test("A2 — ⚔️ TOUT CHAMP HORS DES SURVIVANTS REPREND SA VALEUR D'ÉTAT NEUF", () => {
  /* 🔴 LE GARDE DU LOT. Il énumère la DONNÉE : un champ ajouté à `etatNeuf()`
     est mesuré ici sans que personne ait à y penser. */
  const neuf = etatNeuf();
  const etat = etatSale();
  remettreAZero(etat);
  const restes = Object.keys(neuf)
    .filter((clef) => !(clef in CHAMPS_QUI_SURVIVENT))
    .filter((clef) => {
      try { assert.deepEqual(etat[clef], neuf[clef]); return false; } catch { return true; }
    });
  assert.deepEqual(restes, [],
    "⛔ CES CHAMPS ONT SURVÉCU À LA REMISE À ZÉRO. Un champ neuf est remis à zéro " +
    "PAR DÉFAUT depuis le lot 197 : s'il doit survivre, il s'inscrit dans " +
    "`CHAMPS_QUI_SURVIVENT` (etat-neuf.mjs) avec son argument — ⛔ jamais en " +
    "rallongeant une liste de champs quelque part.");
});

test("A3 — 🔴 ET LES SURVIVANTS SURVIVENT VRAIMENT — sinon le garde serait un balai", () => {
  /* ⚠️ Un garde qui ne peut jamais accuser est le pire ; celui qui accuse TOUT
     l'est autant. Sans ce témoin, un `remettreAZero` qui écraserait l'objet
     entier passerait A2 en jetant le moteur et le magasin avec. */
  const etat = etatSale();
  remettreAZero(etat);
  for (const clef of Object.keys(CHAMPS_QUI_SURVIVENT)) {
    assert.equal(etat[clef], SENTINELLE, `« ${clef} » est infrastructure : il ne devait PAS tomber`);
  }
});

test("A4 — ⚖️ CHAQUE SURVIVANT PORTE SON ARGUMENT, ET IL EXISTE DANS L'ÉTAT NEUF", () => {
  /* Une liste d'exceptions PAR NOM ne dit pas qu'elle est incomplète — celle-ci
     est courte exprès, et chaque nom se défend par écrit à côté de lui. Un nom
     qui ne correspond à aucun champ serait une exception qui protège du vide. */
  const neuf = etatNeuf();
  for (const [clef, raison] of Object.entries(CHAMPS_QUI_SURVIVENT)) {
    assert.ok(clef in neuf, `« ${clef} » survit à un champ que \`etatNeuf()\` ne déclare pas`);
    assert.equal(typeof raison, "string");
    assert.ok(raison.length > 20, `« ${clef} » survit sans argument écrit`);
  }
});

test("A5 — ⚔️ UN CHAMP POSÉ À LA VOLÉE, QUE LA DÉCLARATION NE CONNAÎT PAS, EST SUPPRIMÉ", () => {
  /* La seule porte que `etatNeuf()` ne surveille pas : `state.bidule = …` écrit
     quelque part dans la coquille. Personne ne l'a déclaré comme
     infrastructure, donc il appartient au personnage d'avant. */
  const etat = etatNeuf();
  etat.champPoseALaVolee = "l'écran d'avant";
  remettreAZero(etat);
  assert.equal("champPoseALaVolee" in etat, false,
    "un champ qu'aucune déclaration ne porte rouvrirait le trou par la seule porte non surveillée");
});

test("A6 — ⚠️ UN CHAMP EFFACÉ AILLEURS SE REPOSE — une absence n'est jamais une réponse", () => {
  const etat = etatNeuf();
  delete etat.destinySeq2;
  delete etat.palier;
  remettreAZero(etat);
  assert.equal(etat.destinySeq2, "melange");
  assert.equal(etat.palier, 1);
});

/* ══ B — CE QU'ERIC A DEMANDÉ, MOT POUR MOT ════════════════════════════════ */

test("B1 — ⚖️ « TOUT À LA RACINE R ET RIEN DE DÉJÀ CONSTRUIT » — les six lectures", () => {
  const etat = etatSale();
  remettreAZero(etat);
  assert.equal(etat.step, 0, "le Menu — « tout à la racine »");
  assert.equal(etat.palier, 1, "le rang R de l'écran, jamais un B ou un SB ouvert");
  assert.equal(etat.stepSecond, 0, "le panneau PASSIF revient au Menu, lui aussi");
  assert.equal(etat.popup, null, "aucune boîte du personnage d'avant devant l'écran neuf");
  assert.equal(etat.menuBranche, "display", "la branche du Menu revient à la première");
  assert.equal(etat.destinySeq2, "melange", "la cérémonie repart de son premier temps");
});

test("B2 — 🔴 « RIEN DE DÉJÀ CONSTRUIT » : la fiche DÉRIVÉE du personnage d'avant tombe", () => {
  /* ⛔ Les quatre champs de `rebuild()` survivaient tous les quatre avant ce
     lot. Un écran qui lit `resolved` aurait dessiné la fiche de l'ancien
     personnage sur le nouveau, tant qu'aucun `rebuild()` n'était retombé — et
     `Build a character` en repousse un exprès jusqu'au choix du jeu. */
  const etat = etatSale();
  remettreAZero(etat);
  assert.deepEqual(etat.decisions, [], "le carnet du dernier rebuild");
  assert.equal(etat.resolved, null, "la fiche dérivée");
  assert.equal(etat.report, null, "le rapport entier du dernier rebuild");
  assert.deepEqual(etat.violations, [], "les refus du dernier validate");
  assert.equal(etat.derivationImpossible, null, "et le refus de `derive`, qui parlait de l'autre personnage");
});

test("B3 — 🔴 LES ÉCRANS DÉPLIÉS SE REPLIENT — méthode, bilan, panneau, item ouvert", () => {
  const etat = etatSale();
  remettreAZero(etat);
  assert.equal(etat.abilityMethod, null, "aucune méthode d'abilities déjà choisie");
  assert.equal(etat.abilityBilan, false, "ni le bilan des six scores de l'autre personnage");
  assert.equal(etat.inheritanceOpen, null, "le panneau d'Inheritance est refermé");
  assert.equal(etat.parcoursItem, null, "aucune dalle d'item ouverte");
  assert.equal(etat.parcoursRefus, null, "et aucun reproche hérité d'un `Done` d'avant");
});

test("B4 — 🌱 CE QUE LE LOT 193 REMETTAIT DÉJÀ CONTINUE DE TOMBER — rien n'est relâché", () => {
  /* ⚠️ L'inversion ne doit RIEN perdre de la liste qu'elle remplace : les
     quinze champs du 193 sont mesurés ici un par un, avec leurs valeurs. */
  const etat = etatSale();
  remettreAZero(etat);
  assert.equal(etat.cursor, 0);
  assert.equal(etat.lore, null);
  assert.equal(etat.destinyPhase, "porte");
  assert.equal(etat.destinyMode, "draw");
  assert.equal(etat.destinyDraw, null);
  assert.equal(etat.destinyFace, "down");
  assert.equal(etat.destinyDezoom, false);
  assert.deepEqual(etat.destinyTaps, []);
  assert.equal(etat.destinyRang, null);
  assert.equal(etat.abilityRoll, null);
  assert.equal(etat.abilityRevele, 0);
  assert.deepEqual(etat.fieldErrors, {});
  assert.equal(etat.pendingStack, null);
  assert.equal(etat.memoireIgnoree, null, "posé à la main par DEUX appelants avant ce lot");
  assert.equal(etat.ouvertureRefusee, null, "le second des deux");
});

test("B5 — ⛔ LE DOCUMENT N'EST PAS TOUCHÉ : l'appelant le pose, l'organe ne le nulle jamais", () => {
  const etat = etatNeuf();
  etat.document = { schema: "fh-char/1", name: "Ilyra" };
  remettreAZero(etat);
  assert.equal(etat.document.name, "Ilyra",
    "⛔ nuller le document effacerait le personnage que l'appelant vient de poser");
});

/* ══ C — ⚔️ LE TÉMOIN QUI ACCUSE : LA LISTE PAR NOM, REJOUÉE ═══════════════ */

test("C1 — ⚔️ LA REMISE À ZÉRO D'AVANT (une liste de quinze noms) FAIT ROUGIR A2", () => {
  /* 🔴 SANS CE TÉMOIN, A2 NE PROUVERAIT RIEN : un garde qui ne peut jamais
     accuser est le pire. On rejoue ici la faute EXACTE du 10/09 — la liste de
     quinze champs écrite à la main — et on vérifie que la mesure de A2 la
     nomme, champ par champ. C'est aussi ce qui se passerait si quelqu'un
     re-rallongeait une liste dans six mois. */
  const parNom = (etat) => {
    etat.step = 0; etat.palier = 1; etat.cursor = 0; etat.lore = null;
    etat.destinyPhase = "porte"; etat.destinyMode = "draw"; etat.destinyDraw = null;
    etat.destinyFace = "down"; etat.destinyDezoom = false; etat.destinyTaps = [];
    etat.destinyRang = null; etat.abilityRoll = null; etat.abilityRevele = 0;
    etat.fieldErrors = {}; etat.pendingStack = null;
  };
  const neuf = etatNeuf();
  const etat = etatSale();
  parNom(etat);
  const restes = Object.keys(neuf)
    .filter((clef) => !(clef in CHAMPS_QUI_SURVIVENT))
    .filter((clef) => {
      try { assert.deepEqual(etat[clef], neuf[clef]); return false; } catch { return true; }
    });
  assert.deepEqual(restes.sort(), [
    "abilityBilan", "abilityMethod", "decisions", "derivationImpossible", "destinySeq2",
    "inheritanceOpen", "memoireIgnoree", "menuBranche", "ouvertureRefusee", "parcoursItem",
    "parcoursRefus", "popup", "report", "resolved", "stepSecond", "violations"
  ], "⛔ la liste par nom laisse SEIZE champs debout — quatorze dans l'organe, deux que ses appelants posaient à la main");
});

test("C2 — ⚔️ ET UN CHAMP BIDON AJOUTÉ À L'ÉTAT NEUF EST VU PAR LA MÊME MESURE", () => {
  /* La mutation du mandat, jouée sur un état neuf FABRIQUÉ : un champ que la
     déclaration porte et que la remise à zéro par nom ignore. ⛔ C'est
     exactement ce qui a coûté quatorze champs, et le garde le nomme. */
  const neufAvecBidon = { ...etatNeuf(), champBidon: "état neuf" };
  const etat = { ...neufAvecBidon, champBidon: "l'écran d'avant", step: 5 };
  /* une remise à zéro « par nom » qui ne connaît que `step` */
  etat.step = 0;
  const restes = Object.keys(neufAvecBidon)
    .filter((clef) => !(clef in CHAMPS_QUI_SURVIVENT))
    .filter((clef) => {
      try { assert.deepEqual(etat[clef], neufAvecBidon[clef]); return false; } catch { return true; }
    });
  assert.deepEqual(restes, ["champBidon"], "le champ ajouté sans être remis à zéro est NOMMÉ");
  /* …et l'inversion, elle, n'a rien eu à apprendre. */
  const inverse = { ...neufAvecBidon, champBidon: "l'écran d'avant" };
  for (const clef of Object.keys(inverse)) {
    if (clef in CHAMPS_QUI_SURVIVENT) continue;
    inverse[clef] = neufAvecBidon[clef];
  }
  assert.equal(inverse.champBidon, "état neuf",
    "⛔ c'est TOUT l'intérêt de l'inversion : le champ neuf est remis à zéro sans que personne y pense");
});

/* ══ D — LE CÂBLAGE DE LA COQUILLE, SUR LES OCTETS ═════════════════════════ */

test("D1 — 🔌 `shell.mjs` DÉCLARE `state` PAR L'ORGANE et remet à zéro PAR L'ORGANE", () => {
  /* ⚠️ Sur les octets, parce que personne n'importe `shell.mjs` (SOCLE, garde
     F de `tests/socle.test.mjs`). ⛔ Ce n'est pas le garde du lot — c'est le
     fil qui relie le garde du lot à la page. */
  assert.match(shell, /import \{ etatNeuf, remettreAZero \} from "\.\/etat-neuf\.mjs\?v=\d+";/);
  assert.match(shell, /^const state = etatNeuf\(\);$/m,
    "⛔ un second littéral d'état dans la coquille serait une seconde déclaration");
  assert.match(shell, /function remettreLEcranAZero\(\) \{\s*annulerDestiny\(\);\s*remettreAZero\(state\);\s*\}/,
    "l'organe de la coquille DÉLÈGUE — il ne réécrit pas l'ordre");
});

test("D2 — ⚔️ AUCUNE LISTE DE CHAMPS NE REVIENT DANS UN CHEMIN DE REMISE À ZÉRO", () => {
  /* 🔴 LE DÉFAUT QUE CE LOT FERME EST UNE FORME, PAS UN CHAMP : c'est donc la
     forme qu'on surveille ICI, et seulement dans les trois chemins concernés.
     ⛔ Ailleurs, `state.x = …` est le travail normal de la coquille. */
  const organe = shell.match(/function remettreLEcranAZero\(\) \{([\s\S]*?)\n\}/);
  assert.ok(organe, "l'organe existe");
  assert.deepEqual([...organe[1].matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()), [],
    "⛔ la liste par nom est de retour dans `remettreLEcranAZero`");

  const pose = shell.match(/function poserLeDocumentOuvert\(document\) \{([\s\S]*?)\n\}/);
  assert.ok(pose, "l'organe des deux portes existe");
  assert.match(pose[1], /remettreLEcranAZero\(\);/, "il réemploie l'organe");
  assert.deepEqual([...pose[1].matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()),
    ["state.document ="],
    "⛔ il ne pose QUE le document — les deux nulls qu'il écrivait à la main sont dans l'organe");

  const neuf = shell.slice(shell.indexOf("repartirAZero: () => {"), shell.indexOf("demanderLeJeu: () => {"));
  assert.ok(neuf.length > 0 && neuf.length < 1200, "garde-fou de portée");
  assert.deepEqual([...neuf.matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()),
    ["state.document ="],
    "⛔ « repartir à zéro » est un document NEUF plus l'organe, jamais des champs vidés un par un");
});

test("D3 — ⭐ ET LA REMISE À ZÉRO PASSE AVANT LE PREMIER RENDU D'UN PERSONNAGE OUVERT", () => {
  /* 📏 Mesuré le 10/09 : `poserLeDocumentOuvert` peignait le document NEUF dans
     l'écran de l'ANCIEN avant de remettre quoi que ce soit à zéro. Sur la
     branche qui recharge, personne ne le voyait ; sur celle qui ne recharge pas
     (magasin refusé), c'était l'écran que le joueur gardait. */
  const pose = shell.match(/function poserLeDocumentOuvert\(document\) \{([\s\S]*?)\n\}/)[1];
  const rangReset = pose.indexOf("remettreLEcranAZero();");
  const rangRendu = pose.indexOf("refresh();");
  assert.ok(rangReset >= 0 && rangRendu >= 0);
  assert.ok(rangReset < rangRendu,
    "⛔ rendre avant de remettre à zéro peint le personnage neuf dans l'écran d'avant");
  assert.equal(pose.split("remettreLEcranAZero();").length - 1, 1,
    "une seule fois, pour les DEUX branches — ⛔ pas une par sortie");
});

/* ══ E — `Forget` : L'AUTRE MOITIÉ DE LA PHRASE D'ERIC ═════════════════════ */

test("E1 — ⚖️ « RESET OU BUILD A CHARACTER » : `Forget` RECHARGE, donc il est propre par construction", () => {
  /* ⭐ Eric a nommé DEUX gestes ; il fallait savoir s'ils se valent. `Forget`
     oublie puis RECHARGE la page : aucun champ de `state` ne lui survit, et
     c'est pour ça qu'il n'a jamais eu besoin d'une liste. ⛔ Il n'a donc rien
     à emprunter à l'organe — mais un jour où quelqu'un retirerait le
     rechargement, ce garde dirait ce qui se perd. */
  const geste = shell.slice(shell.indexOf('action.kind === "oublierPersonnage"'),
    shell.indexOf('action.kind === "vueBascule"'));
  assert.match(geste, /oublierPersonnage\(\);/, "il oublie…");
  assert.match(geste, /window\.location\.reload\(\);/, "…puis il RECHARGE — c'est la moitié qui rend l'écran vierge");
  assert.deepEqual([...geste.matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()), [],
    "⛔ il ne remet aucun champ à la main, et il n'a pas à le faire : la page redémarre");
});
