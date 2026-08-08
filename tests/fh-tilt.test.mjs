/* ══ LE TILT — LES TESTS D'ACCEPTATION DU LOT 21 ══════════════════════
   La règle d'Eric, ratifiée le 2026-08-08 (logbook « FHV2 - Couche FH »,
   section « ⭐ Le mécanisme s'appelle Tilt »). Elle remplace TOUS les malus
   chiffrés situationnels du système par une table à cinq lignes :

     | Tilts       | Désavantage présent ? | Résultat                     |
     | 0           | non                   | jet normal                   |
     | 1           | non                   | +2                           |
     | 2 ou plus   | non                   | Avantage                     |
     | 0           | oui                   | Désavantage                  |
     | 1 ou plus   | oui                   | jet normal — tout s'annule   |

   Cette suite est en DEUX MOITIÉS, et il faut les deux :

     · les cinq lignes, chacune sous son propre nom, sur un personnage dont la
       couche Fate's Hand est montée — jusqu'au total du jet, pas seulement
       jusqu'à la table ;
     · SON PENDANT, qui prouve la séparation : la couche débrayée, un
       personnage SRD pur traverse un jet de bout en bout, le réglage n'existe
       pas, et aucune ligne de `src/play/` ne cite le Tilt.

   ⚠️ CE QUE CETTE SUITE NE TESTE PAS, ET C'EST DÉLIBÉRÉ :
     · l'ÉPUISEMENT reste un modificateur chiffré (−1 par degré sous FH,
       tranché par Eric le 2026-08-08 puis reconfirmé le 2026-08-09). Il ne
       devient PAS un Tilt, il est déjà juste, et `play-srd-only` le tient ;
     · les −2 des Tables de Fatalité sont des séquelles sur une
       caractéristique, pas des modificateurs de jet. Ils restent tels quels ;
     · aucune SYNERGIE n'est modélisée. « 1 = +2 · 2 = avantage », et c'est
       décidé à la table : le moteur reçoit un compte, il ne le calcule pas. */

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeHarness, fhCharacter } from "./play-harness.mjs";
import { resolveTilt, TILT_BONUS } from "../src/modules/fh/tilt.mjs";
import { loadSources, findForbidden, HOUSE_MECHANICS } from "./source-scan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

/* Une console de jet ordinaire sur un personnage Fate's Hand. Aucun dé de
   Destinée n'est monté : le Tilt doit tenir sur un jet parfaitement banal,
   sinon il ne tiendrait que là où une autre mécanique le porte. */
function fh() {
  const h = makeHarness();
  h.reset();
  h.state.character = fhCharacter({ name: "Nodren" });
  return h;
}

function rollWith(h, settings, ...dice) {
  h.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5, dc: 15 });
  h.verbs.configure(settings);
  h.queueRolls(...dice);
  h.verbs.roll();
  assert.equal(h.queueEmpty(), 0, "le jet a consommé exactement les dés annoncés");
  return h.state.history[0];
}

/* ══════════════════════════════════════════════════════════════════════
   LA TABLE, PURE — cinq lignes, cinq assertions nommées
   ══════════════════════════════════════════════════════════════════════ */

test("TABLE 1 — 0 Tilt, aucun désavantage : jet normal", () => {
  /* REWRITTEN 2026-08-09 — le retour porte désormais `advantage`, l'entrée
     ajoutée quand le mode SRD est entré dans la table (décision d'Eric du
     2026-08-09). Les cinq lignes elles-mêmes n'ont pas bougé d'un chiffre. */
  assert.deepEqual(resolveTilt({ tilts: 0, disadvantage: false }),
    { tilts: 0, disadvantage: false, advantage: false, outcome: "normal", mode: "flat", bonus: 0 });
});

test("TABLE 2 — 1 Tilt, aucun désavantage : +2", () => {
  /* REWRITTEN 2026-08-09 — le retour porte désormais `advantage`, l'entrée
     ajoutée quand le mode SRD est entré dans la table (décision d'Eric du
     2026-08-09). Les cinq lignes elles-mêmes n'ont pas bougé d'un chiffre. */
  assert.deepEqual(resolveTilt({ tilts: 1, disadvantage: false }),
    { tilts: 1, disadvantage: false, advantage: false, outcome: "plus-two", mode: "flat", bonus: 2 });
  assert.equal(TILT_BONUS, 2, "un Tilt seul vaut +2 — pas +1 par Tilt");
});

test("TABLE 3 — 2 Tilts ou plus, aucun désavantage : Avantage", () => {
  /* REWRITTEN 2026-08-09 — le retour porte désormais `advantage`, l'entrée
     ajoutée quand le mode SRD est entré dans la table (décision d'Eric du
     2026-08-09). Les cinq lignes elles-mêmes n'ont pas bougé d'un chiffre. */
  assert.deepEqual(resolveTilt({ tilts: 2, disadvantage: false }),
    { tilts: 2, disadvantage: false, advantage: false, outcome: "advantage", mode: "advantage", bonus: 0 });
  /* « 2 ou plus » est un SEUIL, pas un palier d'échelle : rien ne vient
     après, et trois Tilts ne valent pas plus que deux. C'est la moitié de la
     raison d'Eric — « ça évite aux humains des calculs trop compliqués ». */
  [3, 7, 40].forEach((tilts) => {
    const answer = resolveTilt({ tilts, disadvantage: false });
    assert.equal(answer.outcome, "advantage", tilts + " Tilts : toujours un Avantage, jamais davantage");
    assert.equal(answer.bonus, 0, "et l'Avantage ne s'accompagne d'aucun +2 en prime");
  });
});

test("TABLE 4 — 0 Tilt, un désavantage présent : Désavantage", () => {
  /* REWRITTEN 2026-08-09 — le retour porte désormais `advantage`, l'entrée
     ajoutée quand le mode SRD est entré dans la table (décision d'Eric du
     2026-08-09). Les cinq lignes elles-mêmes n'ont pas bougé d'un chiffre. */
  assert.deepEqual(resolveTilt({ tilts: 0, disadvantage: true }),
    { tilts: 0, disadvantage: true, advantage: false, outcome: "disadvantage", mode: "disadvantage", bonus: 0 });
});

test("TABLE 5 — 1 Tilt ou plus contre un désavantage : tout s'annule", () => {
  /* REWRITTEN 2026-08-09 — le retour porte désormais `advantage`, l'entrée
     ajoutée quand le mode SRD est entré dans la table (décision d'Eric du
     2026-08-09). Les cinq lignes elles-mêmes n'ont pas bougé d'un chiffre. */
  assert.deepEqual(resolveTilt({ tilts: 1, disadvantage: true }),
    { tilts: 1, disadvantage: true, advantage: false, outcome: "normal", mode: "flat", bonus: 0 });
  /* ⚠️ LA LIGNE QUI SE DEVINE MAL, et c'est pour ça qu'elle est testée à part.
     Rien ne s'ADDITIONNE : deux Tilts contre un désavantage ne laissent PAS
     un Tilt net (+2), et cinq n'y laissent pas un Avantage. Le désavantage
     change de LIGNE, il ne se soustrait pas du compte. */
  [2, 5, 99].forEach((tilts) => {
    assert.equal(resolveTilt({ tilts, disadvantage: true }).outcome, "normal",
      tilts + " Tilts contre un désavantage : tout s'annule, il n'en reste rien");
    assert.equal(resolveTilt({ tilts, disadvantage: true }).bonus, 0,
      "et surtout pas un +2 résiduel — ce serait une soustraction déguisée");
  });
});

/* ══════════════════════════════════════════════════════════════════════
   ACCEPTATION B — les cinq lignes sur un personnage à couche montée
   ══════════════════════════════════════════════════════════════════════
   Jusqu'au TOTAL du jet. Une table de correspondance qui rend le bon
   identifiant sans que le d20 change de forme serait une table décorative —
   c'est exactement la panne dont ce lot est né. */

test("ACCEPTATION B 1 — 0 Tilt : le jet part à plat, et rien ne le signale", () => {
  const h = fh();
  const entry = rollWith(h, { tilts: 0, tiltDisadvantage: false }, 10);
  assert.equal(entry.d20s.length, 1, "un seul d20 lancé");
  assert.equal(entry.total, 15, "10 + 5, sans un point de plus");
  assert.equal(entry.tilt, undefined, "aucun Tilt déclaré : l'entrée n'en porte aucune trace");
  assert.equal(h.derive.badges(entry).some((badge) => badge.id === "tilt"), false);
});

test("ACCEPTATION B 2 — 1 Tilt : +2, et le total le montre", () => {
  const h = fh();
  const entry = rollWith(h, { tilts: 1, tiltDisadvantage: false }, 10);
  assert.equal(entry.d20s.length, 1, "un +2 ne lance pas de second dé");
  assert.equal(entry.total, 17, "10 + 5 + 2 — LE POINT DU TEST : le +2 atteint le total");
  assert.deepEqual(entry.tilt, { tilts: 1, disadvantage: false, outcome: "plus-two" });
  assert.equal(h.derive.badges(entry).find((badge) => badge.id === "tilt").t, "1 Tilt · +2",
    "et la table relit POURQUOI ce jet a gagné deux points");
});

test("ACCEPTATION B 3 — 2 Tilts : Avantage, produit et non réimplémenté", () => {
  const h = fh();
  const entry = rollWith(h, { tilts: 2, tiltDisadvantage: false }, 7, 13);
  assert.equal(entry.d20Mode, "advantage", "le Tilt a produit le mode du moteur SRD");
  assert.deepEqual(entry.d20s, [7, 13], "deux d20 lancés — par `makeDiePlan`, pas par la couche");
  assert.equal(entry.kept, 13, "et c'est le SRD qui garde le plus haut : rien n'est réécrit ici");
  assert.equal(entry.total, 18, "13 + 5, sans +2 en prime");
  assert.equal(entry.plusTwo, undefined, "un Avantage n'est pas un Avantage ET un bonus");
  assert.equal(h.derive.badges(entry).find((badge) => badge.id === "tilt").t, "2 Tilts · Advantage");
});

test("ACCEPTATION B 4 — un désavantage sans Tilt : Désavantage", () => {
  const h = fh();
  const entry = rollWith(h, { tilts: 0, tiltDisadvantage: true }, 7, 13);
  assert.equal(entry.d20Mode, "disadvantage");
  assert.equal(entry.kept, 7, "le plus bas des deux");
  assert.equal(entry.total, 12, "7 + 5");
  assert.equal(h.derive.badges(entry).find((badge) => badge.id === "tilt").t,
    "0 Tilts · disadvantage · Disadvantage");
});

test("ACCEPTATION B 5 — un Tilt contre un désavantage : tout s'annule, jusqu'au d20", () => {
  const h = fh();
  const entry = rollWith(h, { tilts: 1, tiltDisadvantage: true }, 10);
  assert.equal(entry.d20Mode, "flat", "l'annulation est complète : un seul dé est lancé");
  assert.equal(entry.d20s.length, 1);
  assert.equal(entry.total, 15, "10 + 5 — ni +2 résiduel, ni avantage résiduel");
  assert.deepEqual(entry.tilt, { tilts: 1, disadvantage: true, outcome: "normal" },
    "mais l'annulation LAISSE UNE TRACE : « rien ne s'est passé » et « personne n'a rien déclaré » " +
    "ne sont pas le même fait à la table");
  assert.equal(h.derive.badges(entry).find((badge) => badge.id === "tilt").t, "1 Tilt · disadvantage · cancelled");
});

/* ══════════════════════════════════════════════════════════════════════
   LE PENDANT NÉGATIF — la couche débrayée, le SRD passe et ne sait rien
   ══════════════════════════════════════════════════════════════════════ */

test("PENDANT — un personnage SRD pur traverse un jet entier, et le Tilt n'existe pas pour lui", () => {
  const srd = makeHarness({ layers: [] });
  srd.verbs.open({
    character: { name: "Aldra", pb: 2, abilities: { STR: 16, DEX: 14, CON: 12, INT: 10, WIS: 12, CHA: 8 }, savingProficiencies: [] },
    pseudo: "Aldra"
  });

  /* §0.6 — pas de code mort derrière un interrupteur. Le réglage n'est pas
     « ignoré » : il N'EXISTE PAS, et `configure` le dit en nommant ce que ce
     type de jet accepte. */
  srd.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5, dc: 15 });
  assert.throws(() => srd.verbs.configure({ tilts: 2 }),
    /"tilts" is not a setting of a check roll/,
    "sans la couche, le Tilt n'est pas un réglage silencieusement avalé — il n'est pas un réglage");
  assert.throws(() => srd.verbs.configure({ tiltDisadvantage: true }),
    /"tiltDisadvantage" is not a setting of a check roll/);
  assert.equal(srd.state.rollConfig.tilts, undefined, "et la console n'en porte aucune trace par défaut");

  // Et le jet, lui, se déroule entièrement.
  srd.queueRolls(14);
  srd.verbs.roll();
  const entry = srd.state.history[0];
  assert.equal(entry.total, 19, "14 + 5");
  assert.equal(entry.outcome, "Success");
  assert.equal(entry.tilt, undefined);
  assert.equal(srd.derive.badges(entry).some((badge) => badge.id === "tilt"), false,
    "et aucun badge de la maison n'existe dans le paquet du SRD nu");
  assert.equal(srd.queueEmpty(), 0);
});

test("PENDANT — aucune ligne de src/play/ ne cite le Tilt (§0.12)", () => {
  /* Le garde structurel, sur le mot neuf. Il est posé le jour même où la
     mécanique entre, plutôt qu'après coup comme pour la Vibration : celle-là
     avait pu se perdre au portage sans qu'un test bronche, parce qu'aucune
     liste ne gardait son nom. */
  const sources = loadSources([path.join(here, "..", "src", "play")], path.join(here, ".."));
  assert.ok(sources.some((source) => source.name === "src/play/session.mjs"),
    "le moteur lui-même est dans le périmètre — si les fichiers bougent, le garde bouge avec eux");
  const hits = findForbidden(sources, [[/\btilt/i, "Tilt"]]);
  assert.deepEqual(hits, [],
    "le Tilt est Fate's Hand, pas SRD — " + hits.map((hit) => hit.name + " (" + hit.match + ")").join(" ; "));
  /* ET LE GARDE EST BIEN BRANCHÉ SUR LA LISTE COMMUNE, pas seulement sur le
     motif recopié ici : sans cette ligne, `HOUSE_MECHANICS` pourrait perdre
     le mot sans que rien ne le dise. */
  assert.ok(HOUSE_MECHANICS.some(([, label]) => label === "Tilt"),
    "`Tilt` est dans le vocabulaire interdit commun, celui que tous les blocs appliquent");
});

/* ══════════════════════════════════════════════════════════════════════
   LES ATTAQUES — un garde qui n'a pas été violé une fois ne vaut rien
   ══════════════════════════════════════════════════════════════════════ */

test("ATTAQUE — un Tilt négatif JETTE, et le refus dit où le malus se donne", () => {
  /* ⭐ IL N'EXISTE PAS DE TILT NÉGATIF. Un −1 ici n'est pas une valeur à
     ramener dans la plage : c'est quelqu'un qui croit qu'un malus se donne au
     lanceur. Un refus qui se contenterait de dire « hors bornes » n'apprendrait
     pas la règle, et le suivant l'écrirait pareil. */
  [-1, -2, -99].forEach((tilts) => {
    assert.throws(() => resolveTilt({ tilts, disadvantage: false }),
      /there is no negative Tilt/, "un Tilt négatif : " + tilts);
  });
  assert.throws(() => resolveTilt({ tilts: -1, disadvantage: false }),
    /Tilt on the DC — that is, \+2 to the DC/,
    "et le message enseigne la contrepartie : un malus est un Tilt donné à l'AUTRE côté");

  // Le même refus par la porte publique, pas seulement sur la fonction pure.
  const h = fh();
  h.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5 });
  assert.throws(() => h.verbs.configure({ tilts: -1 }), /there is no negative Tilt/,
    "et la console refuse aussi — sinon la règle ne tiendrait qu'à l'intérieur du module");
  assert.equal(h.state.rollConfig.tilts, 0, "l'arbre est intact : le refus n'a rien posé");
});

test("ATTAQUE — un compte que le moteur ne sait pas lire est un refus, jamais un zéro", () => {
  /* §0.5. Un jet qui devait pencher et qui part à plat ne se remarque qu'une
     fois le dé tombé — c'est trop tard, et c'est invisible. */
  [1.5, NaN, Infinity, "2", null, undefined, {}].forEach((tilts) => {
    assert.throws(() => resolveTilt({ tilts, disadvantage: false }),
      /a Tilt count must be a whole number/, "compte illisible : " + JSON.stringify(tilts));
  });
  /* Et la seconde colonne est une PRÉSENCE, pas une quantité : il n'y a pas
     de « deux désavantages » à peser contre le compte de Tilts. */
  ["yes", 1, 0, null, undefined].forEach((disadvantage) => {
    assert.throws(() => resolveTilt({ tilts: 1, disadvantage }),
      /resolved against the PRESENCE of a disadvantage/, "présence illisible : " + JSON.stringify(disadvantage));
  });
  assert.throws(() => resolveTilt(), /a Tilt count must be a whole number/,
    "et appeler la table sans rien lui donner est un refus, pas un jet normal");
});

test("LA COMPOSITION AVEC LE SRD — une seule table, plus deux systèmes", () => {
  /* REWRITTEN 2026-08-09 — ce test attaquait un REFUS, et le refus n'existe
     plus : Eric a tranché la composition le 2026-08-09.
       A + T = A · A + A = A · A + D = Flat · D + (2T = A) = Flat · D + T = Flat
     La règle qui produit ces cinq lignes sans en inventer une sixième : un
     AVANTAGE vaut le seuil déjà atteint (« 2 tilts = avantage = on peut pas
     faire mieux »), un DÉSAVANTAGE bascule sur la deuxième colonne. L'ancienne
     assertion exigeait un `throw` — elle est réécrite à la nouvelle vérité,
     jamais relâchée : elle vérifie maintenant le RÉSULTAT de la composition,
     ce qui est plus fort que vérifier un refus. */
  const h = fh();
  h.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5, mode: "disadvantage" });
  h.verbs.configure({ tilts: 2 });
  h.queueRolls(7);
  h.verbs.roll();
  assert.equal(h.state.history[0].kept, 7, "D + (2T = A) : tout s'annule, un seul d20 et il est gardé");
  assert.equal(h.state.history[0].d20Mode, "flat", "le Désavantage a été REDRESSÉ, pas laissé en place");
  assert.equal(h.queueEmpty(), 0, "un jet à plat ne consomme qu'un dé");

  /* ⭐ LE PLAFOND, et c'est la conséquence qu'Eric a énoncée lui-même : sur un
     jet déjà en Avantage, un Tilt ne rapporte RIEN de plus — pas de +2 par
     dessus. « On peut pas faire mieux / seuls les dés peuvent donner des bonus
     supplémentaires. » */
  const cap = resolveTilt({ tilts: 1, disadvantage: false, advantage: true });
  assert.equal(cap.outcome, "advantage", "A + T = A");
  assert.equal(cap.bonus, 0, "et le +2 du Tilt NE s'ajoute PAS à un Avantage — c'est le plafond");

  /* Le cas qu'Eric n'a pas énoncé, et qui tombe juste sans qu'on l'invente. */
  assert.equal(resolveTilt({ tilts: 1, disadvantage: true, advantage: true }).outcome, "normal",
    "A + D + T = Flat, par la même règle et sans une ligne de plus");

  /* ET LE MÊME SENS PASSE, parce qu'il n'y a rien à trancher : l'Avantage ne
     s'empile pas sur l'Avantage en 5e, et deux sources qui disent la même
     chose ne sont pas un conflit. */
  const same = fh();
  same.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5, mode: "advantage" });
  same.verbs.configure({ tilts: 2 });
  same.queueRolls(7, 13);
  same.verbs.roll();
  assert.equal(same.state.history[0].kept, 13, "deux fois « avantage » restent un avantage");
  assert.equal(same.queueEmpty(), 0);
});

test("ATTAQUE — un Tilt déclaré APRÈS coup ne penche pas un d20 déjà tombé", () => {
  /* Un ajustement travaille sur une entrée réglée. Le Tilt se déclare avant le
     jet ou il ne se déclare pas : le rappliquer ici le compterait deux fois,
     et pencher rétroactivement un dé tombé n'est une règle nulle part. */
  const h = fh();
  const entry = rollWith(h, { tilts: 1, tiltDisadvantage: false }, 10);
  assert.equal(entry.total, 17);

  /* La transaction du premier jet est refermée d'abord : rouvrir une ligne du
     flux pendant qu'un jet est encore ouvert relance les dés stagés, ce qui
     n'est pas ce qu'on mesure ici. */
  h.verbs.clearTray({});
  h.verbs.editEntry({ entryId: entry.id });
  assert.equal(h.state.rollConfig.tilts, 1, "la console rouverte RESTITUE le Tilt du jet");
  assert.equal(h.state.rollConfig.tiltDisadvantage, false);
  h.verbs.configure({ tilts: 2 });
  h.verbs.roll();
  assert.equal(h.state.history[0].kept, 10, "le d20 n'a pas été relancé");
  assert.deepEqual(h.state.history[0].tilt, { tilts: 1, disadvantage: false, outcome: "plus-two" },
    "et le Tilt d'origine est celui qui compte encore");
  assert.equal(h.state.history[0].total, 17, "le total n'a pas gagné un second +2");
  assert.equal(h.queueEmpty(), 0);
});

/* ══════════════════════════════════════════════════════════════════════
   LE +2 DE LA COUCHE — TROUVÉ EN ATTAQUANT MES PROPRES GARDES
   ══════════════════════════════════════════════════════════════════════
   Ces deux tests n'étaient PAS prévus par la commande du lot. Ils existent
   parce qu'une mutation a laissé la suite verte : retirer
   `if (cfg.plusTwo) entry.plusTwo = true;` du gestionnaire ne faisait rougir
   personne, puisque tous les tests du Tilt passent par la branche qui pose
   `entry.plusTwo` de son côté. Le +2 MANUEL — celui qui existait AVANT ce lot
   et qui n'arrivait jamais — restait donc sans témoin, exactement comme la
   Vibration l'était.

   Un garde qui n'a pas été violé une fois ne vaut pas ce qu'il coûte ; celui-ci
   n'existait pas du tout, et c'est l'attaque qui l'a dit. */

test("le +2 de la couche, déclaré À LA MAIN, atteint le total du jet", () => {
  /* ⚠️ MESURÉ AVANT CORRECTION : `cfg.plusTwo` était réglable, il peignait un
     jeton « FH bonus » dans le plateau EN ATTENTE, et il ne montait jamais sur
     l'entrée — `fhTotal` lit `entry.plusTwo`, qui restait `undefined`. Le
     joueur voyait donc son +2 avant le jet, et pas après. */
  const h = fh();
  const entry = rollWith(h, { plusTwo: true }, 10);
  assert.equal(entry.plusTwo, true, "la couche écrit SA clef sur l'entrée — le chemin commun ne sait pas ce qu'est un +2 maison");
  assert.equal(entry.total, 17, "10 + 5 + 2 : le jeton du plateau et le total disent enfin la même chose");
  assert.equal(entry.tilt, undefined, "et ce +2-là n'est pas un Tilt : personne n'en a déclaré");
  assert.ok(h.derive.ruling(entry).account.includes("FH +2"),
    "il se relit dans le compte du Ruling, sous le nom que le paquet lui donne");
});

test("`prepare` honore les réglages des modules montés, comme `configure`", () => {
  /* Le contrat annonce `prepare({name, ability, bonus, mode?, dc?, note?,
     plusTwo?})` depuis le lot 5. Mesuré : `rollInput` ne recopiait que les
     clefs de la liste fermée DU TYPE, donc tout réglage de module posé à
     l'ouverture de la console était perdu SANS UN MOT — le repli silencieux
     que §0.5 interdit, dans le verbe qui ouvre chaque jet. */
  const h = fh();
  h.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5, plusTwo: true, tilts: 2 });
  assert.equal(h.state.rollConfig.plusTwo, true, "le réglage de couche entre par `prepare`");
  assert.equal(h.state.rollConfig.tilts, 2);
  h.queueRolls(7, 13);
  h.verbs.roll();
  assert.equal(h.state.history[0].kept, 13, "et il agit : deux Tilts ont bien produit l'Avantage");
  assert.equal(h.queueEmpty(), 0);

  /* ET LA LISTE RESTE FERMÉE : `prepare` n'est pas devenu une porte ouverte.
     Une clef qu'aucun type ni aucun module ne déclare est simplement ignorée
     à l'ouverture (elle n'a jamais été lue), mais `configure` la refuse — et
     c'est `configure` qui porte le refus depuis l'exigence A du lot 5. */
  const srd = makeHarness({ layers: [] });
  srd.verbs.open({ character: { name: "Aldra", pb: 2 } });
  srd.verbs.prepare({ name: "X", ability: "DEX", bonus: 0, plusTwo: true });
  assert.equal(srd.state.rollConfig.plusTwo, undefined,
    "sans module monté, la liste fermée est celle du type seul — le réglage n'existe pas");
});

test("RÉGRESSION — l'Épuisement N'EST PAS un Tilt, et il garde son chiffre", () => {
  /* Tranché par Eric le 2026-08-08 : « il ne convertit PAS l'Épuisement en
     Tilt — c'est un modificateur appliqué au jet, pas un +2 au DC », et il a
     reconfirmé −1 le 2026-08-09. Ce test est là pour que « il n'y a plus de
     −2 » ne serve pas un jour à « corriger » un chiffre qui est juste. */
  const h = fh();
  assert.equal(h.derive.rules().exhaustionPerLevel, 1, "Fate's Hand : −1 par degré, et c'est un NOMBRE");

  h.verbs.setExhaustion({ level: 2, reason: "Test", silent: true });
  const entry = rollWith(h, { tilts: 1, tiltDisadvantage: false }, 10);
  assert.equal(entry.exhaustionPenalty, -2, "deux degrés valent −2 sous FH, et ils s'appliquent AU JET");
  assert.equal(entry.total, 15, "10 + 5 + 2 (Tilt) − 2 (Épuisement) : les deux coexistent sans se convertir");
  assert.deepEqual(entry.tilt, { tilts: 1, disadvantage: false, outcome: "plus-two" },
    "le Tilt n'a pas absorbé l'Épuisement, et l'Épuisement n'a pas mangé le Tilt");
});
