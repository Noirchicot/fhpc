/* ══ LOT 183 — L'ÉCRAN MORT NOMME SA CAUSE ════════════════════════════════

   📏 LE DÉFAUT, MESURÉ EN LIGNE LE 2026-09-09 (Eric, sur le site déployé) :
   v606 fait passer la pile de 7 à 9 couches. Un personnage gardé la veille
   déclare donc 7 couches et ne correspond plus à aucun des deux jeux de
   règles. Le Menu le DIT (*« This character's layer stack doesn't match
   either ruleset — flip Fate's Hand to realign it »*) ; les six écrans qui
   lisent la fiche dérivée rendaient *« This screen reads your character
   sheet, and it cannot be derived yet. »* — **ni cause, ni sortie**. Le
   remède existait (un clic sur l'interrupteur `Fate's Hand`) et rien, sur
   l'écran mort, ne le nommait.

   ⭐ CE QUE CE FICHIER GARDE, ET QU'AUCUN AUTRE NE POUVAIT VOIR : la phrase
   est choisie par une CONDITION, et `shell.mjs` n'a aucun harnais de rendu
   (`tests/shell-wiring.test.mjs`, lot 50) — tant que le choix vivait dans la
   coquille, la seule preuve possible était un garde d'octets, qui aurait dit
   « le mot existe » sans jamais dire « le bon mot sort pour ce
   personnage-là ». Le choix vit maintenant dans `ui/builder/ecran-mort.mjs` :
   ce fichier FABRIQUE le document fautif et LIT la phrase rendue.

   ⚠️ LES PHRASES SONT DES BROUILLONS EN ATTENTE D'ERIC. Ce garde ne teste
   donc PAS leur libellé mot pour mot — il teste ce qu'elles doivent PORTER :
   la cause, et un geste qui existe. Un test qui figerait la ponctuation
   rougirait à la première relecture d'Eric, ce qui apprendrait à le
   desserrer. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
import { createTestDocument } from "./dom-stub.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/* `universe-step.mjs` (atteint par `ecran-mort.mjs` pour `currentStack`) lit
   `document` au montage — même préparation que `tests/universe-step.test.mjs`. */
globalThis.document = createTestDocument();

const { motDeLEcranMort, MOT_PILE_INCONNUE, MOT_SANS_CLASSE, MOT_SANS_RAISON, MOT_CRAN_NON_MONTE, MOT_SANS_NIVEAU }
  = await import("../ui/builder/ecran-mort.mjs");
/* 🌱 LOT 198 — un document neuf porte son niveau de naissance (`composer`) ;
   les sondes d'ici le portent aussi, lu à la constante. Les six scores se
   lisent au moteur, jamais recopiés. */
const { CHOIX_DE_NAISSANCE } = await import("../src/doc/index.mjs");
const { ABILITY_KEYS } = await import("../src/build/index.mjs");
const { STEPS, cransAlignes } = await import("../ui/builder/etapes.mjs");
const { SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, currentStack }
  = await import("../ui/builder/universe-step.mjs");
/* LOT 191 — les couches de Lore se LISENT dans la table, jamais recopiées. */
const { INTERRUPTEURS } = await import("../ui/builder/layers-ecran.mjs");

const FT_LB = { distance: "ft", weight: "lb" };
const manifestFor = (ids) => ids.map((id) => ({ id, version: "0.0.0", hash: "x".repeat(64), name: id }));

function docAvec({ layers = [], choices = [], naissance = true } = {}) {
  return {
    schema: "fh-char/1", id: "ecran-mort-test", name: "Sonde", lang: "en", units: FT_LB,
    created: "2026-09-09T00:00:00Z", modified: "2026-09-09T00:00:00Z",
    build: { layers: manifestFor(layers), choices: [...(naissance ? CHOIX_DE_NAISSANCE : []), ...choices], budgets: {}, overrides: [] }
  };
}
const SIX_SCORES = ABILITY_KEYS.map((clef) => ({ path: `abilities.${clef}`, value: 10 }));

const PILE_COMPLETE = [SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS];
const CHOIX_CLASSE = { path: "class", ref: { kind: "class", id: "srd:wizard" }, label: "Class" };

/* ══ 1 — LE PERSONNAGE D'HIER, CELUI QU'ERIC A MESURÉ ══════════════════════
   ⭐ LA PILE FAUTIVE N'EST PAS ÉCRITE À LA MAIN : on RETIRE les deux
   dernières couches de la pile réelle. Une liste de sept identifiants
   recopiée ici serait devenue fausse au prochain lot qui monte une couche —
   c'est exactement la faute du lot 77, où une pile recopiée a fait accuser le
   personnage d'exemple. */
/* ⭐ LOT 188 — LA PILE D'HIER EST CELLE DE v606, PAS « MOINS DEUX AU HASARD ».
   Les deux couches arrivées entre v599 et v606 sont `fh-soulforging-en` (lot
   179) et `fh-gems-en` (lot 181). Ce personnage-là restait innommable APRÈS le
   lot 188 parce que les gemmes manquantes coupaient le CATALOGUE en deux (les
   espèces sans les gemmes).
   ⚖️ LOT 191 — LE CATALOGUE N'A PLUS QU'UNE COUCHE (Eric, 09/09 : *« Il n'y a
   pas d'Araag dans SRD si le bouton Lore n'est pas poussé »* — `fh-species-en`
   est du Lore). La pile de v606 est donc devenue NOMMABLE : Soulforging
   éteint, catalogue absent — deux états que `compositionFh` déclare légitimes
   depuis le lot 188 (« le catalogue entier ou absent »). Ce qui reste
   innommable, c'est un INTERRUPTEUR COUPÉ EN DEUX ; et le cas d'hier qui le
   montre le mieux est Lore : les trois espèces montées SANS la fiche et le
   lore qui les habillent (`fh-fiche-en`, `fh-lore-en`) — exactement l'ancien
   `slice(0, -2)`, redevenu innommable pour la bonne raison. Le témoin inverse
   (Lore ENTIER éteint) est plus bas, dans ce même test. */
const LORE = INTERRUPTEURS.find((sw) => sw.id === "lore").couches;
const PILE_D_HIER = PILE_COMPLETE.filter((id) => !["fh-fiche-en", "fh-lore-en"].includes(id));

test("🔴 UNE PILE QUI NE CORRESPOND À AUCUN JEU DE RÈGLES EST NOMMÉE — avec sa sortie", () => {
  assert.equal(PILE_D_HIER.length, PILE_COMPLETE.length - 2,
    "témoin de portée : la pile d'hier doit être la pile réelle moins ses deux dernières couches");
  assert.ok(PILE_D_HIER.includes("fh-species-en") && LORE.length === 3,
    "témoin : Lore = 3 couches, et la pile d'hier en garde UNE — c'est ça, un interrupteur coupé en deux");
  /* ⚖️ LOT 191 — et la pile de v606 (sans Soulforging ni gemmes) est NOMMABLE :
     une pile qu'on accusait pour une raison qui n'existe plus. */
  const v606 = PILE_COMPLETE.filter((id) => !["fh-soulforging-en", "fh-gems-en"].includes(id));
  assert.notEqual(motDeLEcranMort(docAvec({ layers: v606, choices: [CHOIX_CLASSE] })), MOT_PILE_INCONNUE,
    "Soulforging éteint + catalogue absent : deux états légitimes, pas une pile inconnue");
  const mot = motDeLEcranMort(docAvec({ layers: PILE_D_HIER, choices: [CHOIX_CLASSE] }));

  assert.notEqual(mot, MOT_SANS_RAISON,
    "⛔ c'est LE défaut du lot 183 : l'écran rendait la phrase muette sur ce personnage-là");
  assert.equal(mot, MOT_PILE_INCONNUE);
  /* LA CAUSE — dans les mots du Menu, pour que les deux écrans disent la
     même chose du même personnage. */
  assert.match(mot, /doesn't match either ruleset/,
    "la CAUSE doit être nommée, et dans les mots que le Menu emploie déjà");
  /* LA SORTIE — le geste ET l'endroit. Le Menu peut se contenter du geste :
     l'interrupteur est sous les yeux du joueur. Ici il est ailleurs. */
  assert.match(mot, /Fate's Hand/, "la SORTIE doit nommer l'interrupteur qui réaligne");
  assert.match(mot, /Menu/, "…et OÙ il se trouve : le joueur n'est pas sur l'écran qui le porte");
  /* ⚔️ LOT 188 — ET UN INTERRUPTEUR ENTIER ÉTEINT N'EST PLUS ACCUSÉ : la pile
     moins les TROIS couches de Lore (lot 191 : les espèces en font partie) est
     « Lore off », un choix fait depuis `Layers`. L'envoyer flipper Fate's Hand
     défaire ce choix serait le défaut symétrique de celui que ce fichier a fermé. */
  const loreEteint = motDeLEcranMort(docAvec({ layers: PILE_COMPLETE.filter((id) => !LORE.includes(id)), choices: [CHOIX_CLASSE] }));
  assert.notEqual(loreEteint, MOT_PILE_INCONNUE, "⛔ « Lore off » est légitime — `compositionFh`, layers-ecran.mjs");
});

/* ══ 2 — LE MOT DU 2026-08-20 N'A PAS BOUGÉ ════════════════════════════════
   Il nommait déjà la cause et le geste ; le lot l'étend, il ne le refait pas. */

test("le personnage sans classe garde EXACTEMENT le mot qu'il avait", () => {
  /* 🌱 LOT 198 — le personnage de ce mot est celui du 2026-08-20 : ses SCORES
     sont posés, et il retire sa classe (`I changed my mind` sur Class). Un
     personnage neuf, lui, n'a ni classe ni scores, et son mot nomme les deux
     (`tests/naitre-derivable.test.mjs`, C1). */
  const mot = motDeLEcranMort(docAvec({ layers: PILE_COMPLETE, choices: SIX_SCORES }));
  assert.equal(mot, MOT_SANS_CLASSE);
  assert.match(mot, /no sheet without a class/, "la cause");
  assert.match(mot, /Choose one on Class/, "le geste, et l'écran où il se fait");
});

/* ══ 3 — ⚔️ LE RELEVÉ QUI ACCUSE EST SOUPÇONNÉ LE PREMIER ══════════════════
   🔴 `currentStack` rend `null` sur une pile VIDE aussi (`universe-step`,
   test A2 : « aucune couche déclarée »). Or une pile vide n'empêche RIEN :
   `rebuild` l'adopte alors depuis la pile montée, sans un mot (block.mjs,
   « un document dont `build.layers` est VIDE n'a jamais été construit »).
   Envoyer ce joueur-là basculer `Fate's Hand` serait lui faire faire un geste
   qui ne change pas son problème — un écran qui ment poliment. */

test("⚔️ UNE PILE VIDE N'EST PAS ACCUSÉE — elle n'empêche rien, `rebuild` l'adopte", () => {
  const vide = docAvec({ layers: [], choices: SIX_SCORES });
  assert.equal(currentStack(vide), null,
    "témoin : la lecture partagée rend bien `null` ici — c'est CE piège qu'on désamorce");
  assert.equal(motDeLEcranMort(vide), MOT_SANS_CLASSE,
    "⛔ accuser la pile ici enverrait le joueur basculer un interrupteur pour rien");
});

/* ══ 4 — CE QUI RESTE MUET EST NOMMÉ COMME MUET ════════════════════════════
   🌱 LOT 198 — DEUX CAUSES ONT REÇU LEUR MOT : les scores manquants (le
   personnage neuf, sur l'écran même qui les pose — Abilities) et le niveau
   absent (un fichier d'avant le lot). Ce qui reste muet : un choix qui pointe
   un record qu'aucune couche montée ne porte, un refus d'invariant du moteur.
   Aucune n'est produite par un geste du builder ; toutes sont atteignables par
   `Open`.
   ⭐ CE TEST NE LES RÉPARE PAS, IL LES REND TROUVABLES : tant qu'il est vert,
   il reste un chemin par lequel un joueur lit une impasse sans sortie. Le
   jour où l'une reçoit son mot d'Eric, c'est ici qu'on vient le brancher. */

test("⏳ LA PHRASE MUETTE SURVIT, ET ELLE EST DÉCLARÉE MUETTE — les causes restantes attendent un mot d'Eric", () => {
  const complet = docAvec({ layers: PILE_COMPLETE, choices: [CHOIX_CLASSE, ...SIX_SCORES] });
  assert.equal(motDeLEcranMort(complet), MOT_SANS_RAISON,
    "niveau, classe et scores posés : ce qui empêche encore de dériver n'a pas de mot");
  assert.doesNotMatch(MOT_SANS_RAISON, /Menu|Class|switch/,
    "elle ne prétend PAS donner une sortie — c'est ce qui la rend repérable");
  /* ⚔️ et les deux causes qui viennent de recevoir leur mot ne tombent PLUS ici */
  assert.notEqual(motDeLEcranMort(docAvec({ layers: PILE_COMPLETE, choices: [CHOIX_CLASSE] })), MOT_SANS_RAISON,
    "⛔ sans scores, c'était le défaut de v621 : la phrase muette sur Abilities");
  assert.equal(motDeLEcranMort(docAvec({ layers: PILE_COMPLETE, choices: [CHOIX_CLASSE, ...SIX_SCORES], naissance: false })), MOT_SANS_NIVEAU,
    "sans niveau : un fichier d'avant le lot, nommé avec sa sortie");
});

/* ══ 4 bis — LOT 186 : LE CRAN QUE LA PILE NE MONTE PLUS ═══════════════════
   📏 LE CHEMIN, MESURÉ LE 2026-09-09 : en vue double, le panneau PASSIF peut
   être Destiny pendant que l'ACTIF est le Menu — c'est-à-dire pendant qu'on
   éteint Fate's Hand. La pile perd `fh.destiny`, le catalogue des arcanes
   passe de 22 records à 0 (relevé sur les couches du dépôt), et l'écran
   continuait d'afficher le R : *« Twenty-two cards watch over Nymedes »*, avec
   un bouton `Draw` qui ne fait RIEN (`drawArcana([])` rend `null`).
   ⭐ C'est la même maladie que le §1, un cran plus haut : un refus qui ne dit
   ni sa cause ni sa sortie. */

test("🔴 LOT 186 — UN CRAN NON MONTÉ EST NOMMÉ, avec sa cause ET sa sortie", () => {
  /* ⛔ LE TÉMOIN D'ABORD : il doit exister un cran que la pile SRD ne monte
     pas, sinon cette phrase garderait une porte que personne ne peut franchir. */
  const absents = cransAlignes([]).map((cran, index) => (cran ? null : STEPS[index].id)).filter(Boolean);
  assert.notDeepEqual(absents, [],
    "aucun cran n'est conditionnel — la phrase de refus n'aurait plus de cas");
  /* ⚖️ LOT 189 — ET LE MÊME MOT COUVRE SKILLS SANS UN CAS PARTICULIER : le
     cran a rejoint la loi de Destiny (`exige: "fh.skills"`), et rien ici n'a
     eu à changer pour lui — c'est ce que ce témoin grave. */
  assert.deepEqual(absents, ["destiny", "skills"],
    "en pile SRD, les crans non montés sont Destiny et Skills — Eric, 09/09");

  assert.match(MOT_CRAN_NON_MONTE, /ruleset/, "la CAUSE : c'est le jeu de règles qui a changé");
  assert.match(MOT_CRAN_NON_MONTE, /Fate's Hand/, "la SORTIE nomme l'interrupteur qui le ramène");
  assert.match(MOT_CRAN_NON_MONTE, /Menu/, "…et OÙ il se trouve — le joueur n'est pas sur cet écran-là");
  /* ⚖️ ET LA MOITIÉ QU'ON OUBLIE : le joueur a le droit de NE PAS revenir en
     arrière. Une phrase qui ne dirait que « rallume » ferait croire qu'il est
     coincé, alors que son personnage est complet sans ce cran. */
  assert.match(MOT_CRAN_NON_MONTE, /nothing you chose has been erased/,
    "rien n'est perdu, et ça se DIT — c'est mesuré : passer à SRD n'efface aucun choix");
  /* ⛔ ELLE NE NOMME AUCUNE ÉTAPE : un cran absent n'a plus de mot résolu sur
     la ceinture, et en écrire un rouvrirait la seconde voix que le lot ferme. */
  const enDur = [...new Set(STEPS.flatMap((step) =>
    [step.label, ...(step.motSi || []).map((v) => v.mot)]))]
    .filter((mot) => mot !== "Menu" && MOT_CRAN_NON_MONTE.includes(mot));
  assert.deepEqual(enDur, [],
    "la phrase cite un libellé d'étape — elle deviendrait une seconde voix pour le mot d'un cran");
});

/* ══ 5 — LA COQUILLE N'A PLUS DE SECONDE VOIX ══════════════════════════════
   🔴 GARDE D'OCTETS, ET C'EST ASSUMÉ : `shell.mjs` ne se monte pas sous Node.
   Ce qu'il vérifie n'est pas la phrase — c'est qu'il n'y en a plus DEUX. Une
   phrase laissée en littéral dans la coquille redeviendrait le second
   écrivain que ce lot supprime, et elle gagnerait, puisque c'est elle qui est
   posée dans le DOM. */

test("🔴 `shell.mjs` ne fabrique plus la phrase — il la DEMANDE", () => {
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
  assert.match(shell, /motDeLEcranMort\(state\.document\)/,
    "la coquille doit poser la phrase du module, sur le document vivant");
  /* ⚖️ LOT 186 — MÊME LOI POUR LE CRAN NON MONTÉ : la coquille DEMANDE la
     phrase, elle ne la fabrique pas, et elle la pose sur la condition qui la
     justifie — l'absence de cran à l'index où le joueur se tient. */
  assert.match(shell, /!cransAlignes\(drapeauxMontes\(\)\)\[state\.step\][\s\S]{0,200}?MOT_CRAN_NON_MONTE/,
    "un cran que la pile ne monte pas doit rendre le refus qui NOMME, pas son écran vide");
  assert.ok(!shell.includes("it cannot be derived yet"),
    "⛔ la phrase muette ne doit plus exister en littéral dans la coquille : deux écrivains, et c'est celui-là qui gagne");
  assert.ok(!shell.includes("no sheet without a class"),
    "⛔ idem pour le mot du 2026-08-20 — il vit dans `ecran-mort.mjs`, une seule fois");
});
