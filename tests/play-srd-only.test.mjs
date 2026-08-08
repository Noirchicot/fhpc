/* ══ LES TESTS D'ACCEPTATION DU LOT 5 ════════════════════════════════
   C'est cette suite qui dit si le lot a réussi. Elle est neuve, et elle n'a
   pas d'ancêtre v1 pour une raison qui EST le lot : en v1 il n'existait aucun
   moteur SRD à faire tourner seul. Le moteur v1 ÉTAIT Fate's Hand.

   Trois jets de bout en bout, sans une seule couche montée, plus le garde
   structurel qui empêche la coupe de se refermer en douce.

   « S'ils passent, la séparation est réelle ; si l'un d'eux ne peut pas être
   écrit, elle est décorative — et le lot le dit platement plutôt que de la
   maquiller. » (KICKOFF §L5) */

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeHarness } from "./play-harness.mjs";
import { loadSources, findForbidden, HOUSE_MECHANICS, LAYER_NAMES } from "./source-scan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

/* Un personnage SRD PUR : aucune couche montée. C'est le sujet de toute cette
   suite, et `layers: []` est ce qui le rend littéral. */
function srdOnly() {
  const h = makeHarness({ layers: [] });
  h.verbs.open({
    character: { name: "Aldra", pb: 2, abilities: { STR: 16, DEX: 14, CON: 12, INT: 10, WIS: 12, CHA: 8 }, savingProficiencies: ["STR"] },
    campaign: "SRD 5.2.1", pseudo: "Aldra"
  });
  return h;
}

/* ══ TEST D'ACCEPTATION n°1 ═══════════════════════════════════════════
   « Un personnage SRD pur, aucune couche FH chargée, lance un jet de
   compétence de bout en bout et obtient son résultat. » */

test("ACCEPTATION 1 — un personnage SRD pur lance une compétence de bout en bout", () => {
  const h = srdOnly();

  /* Ce que « aucune couche chargée » veut dire, littéralement : les verbes de
     la maison N'EXISTENT PAS. Pas « ne font rien » — n'existent pas. C'est la
     loi §0.6 (pas de code mort derrière un interrupteur) rendue vérifiable. */
  /* REWRITTEN 2026-08-08 (lot 16) — `recoverDestiny` entre dans la liste le
     jour où il entre dans la couche. Un verbe neuf qui n'est pas dans ce
     tableau est un verbe dont personne ne vérifie qu'il DISPARAÎT avec sa
     couche — et la liste, ici, est la seule chose qui le vérifie. */
  ["spendDestiny", "stageDestinyDie", "adjustDestinyDie", "setDestinyField", "recoverDestiny",
    "settleAwakening", "resolveNatOne", "resolveArcaneOne", "armPending", "resolvePending",
    "addPending", "dropPending", "renamePending"].forEach((verb) => {
    assert.equal(h.verbs[verb], undefined, "le verbe « " + verb + " » n'existe pas sans sa couche");
  });
  assert.deepEqual(h.play.flags, [], "et aucun drapeau de capacité n'est levé");
  assert.equal(h.state.destiny, undefined, "aucune tranche de couche n'a été semée");

  // Le jet lui-même : Discrétion +5 contre un DD 15, d20 = 14.
  h.queueRolls(14);
  h.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5, dc: 15 });
  h.verbs.roll();

  const entry = h.state.history[0];
  assert.equal(entry.rollType, "check", "c'est un jet de compétence, et il le dit");
  assert.equal(entry.kept, 14, "le d20 est tombé");
  assert.equal(entry.total, 19, "14 + 5");
  assert.equal(entry.outcome, "Success", "19 franchit le DD 15");
  assert.equal(h.derive.ruling(entry).verdict, "SUCCESS", "et le Ruling le dit avec le mot du paquet SRD");

  // Il atteint la table, une fois, en révision 0 — les deux points de règlement tiennent.
  assert.equal(h.settledEvents().length, 1, "le jet a été annoncé une fois");
  assert.equal(h.settledEvents()[0].rev, 0);
  assert.equal(h.settledEvents()[0].roll.schema, "fh-roll/1");
  assert.equal(h.settledEvents()[0].intent.outcome, "success", "et la couche sémantique est intacte");
  assert.equal(h.settledEvents()[0].intent.kind, "check");

  // Et un échec est un échec — pas une question posée au joueur.
  h.queueRolls(3);
  h.verbs.prepare({ name: "Arcana", ability: "INT", bonus: 0, dc: 15 });
  h.verbs.roll();
  assert.equal(h.state.history[0].outcome, "Failure");
  assert.equal(h.t.rollTransactionActive(), false, "rien ne bloque : le SRD ne pose aucune question sur un échec");
  assert.equal(h.queueEmpty(), 0);
});

/* ══ TEST D'ACCEPTATION n°2 ═══════════════════════════════════════════
   « Une attaque enchaîne toucher puis dégâts comme deux phases d'un même jet,
   sans qu'aucune ligne du chemin commun ne cite Destinée, Chaos ni
   Overreach. » (exigence A) */

test("ACCEPTATION 2 — une attaque enchaîne toucher puis dégâts, deux phases d'un même jet", () => {
  const h = srdOnly();
  const longsword = {
    name: "Longsword", ability: "STR", bonus: 6, rollType: "attack", ac: 15,
    damage: { dice: [{ count: 1, sides: 8 }], bonus: 4, type: "slashing" }
  };

  h.queueRolls(12, 5); // d20 = 12 → 18 touche ; d8 de dégâts = 5
  h.verbs.prepare(longsword);
  h.verbs.roll();

  const hit = h.state.history[0];
  assert.equal(h.state.history.length, 1, "UNE entrée de flux, pas deux : les dégâts sont la seconde PHASE du même jet");
  assert.equal(hit.rollType, "attack");
  assert.equal(hit.total, 18, "12 + 6, contre la CA");
  assert.equal(hit.outcome, "Success", "18 touche une CA 15");
  assert.equal(hit.damageDice.length, 1, "un d8 de dégâts");
  assert.equal(hit.damageTotal, 9, "5 + 4 — le bonus de dégâts n'est pas le bonus de toucher");
  assert.equal(hit.damageCritical, false);
  // Les deux phases sont sur le même plateau, dans l'ordre où elles ont eu lieu.
  const roles = h.derive.trayDice(hit).map((die) => die.dieRole || die.kind);
  assert.ok(roles.indexOf("base") < roles.indexOf("damage"), "toucher d'abord, dégâts ensuite");
  assert.equal(h.queueEmpty(), 0);

  // ── Un coup critique double les DÉS, jamais le bonus (SRD p.179) ──
  h.queueRolls(20, 6, 7);
  h.verbs.prepare(longsword);
  h.verbs.roll();
  const crit = h.state.history[0];
  assert.equal(crit.outcome, "Critical hit", "un 20 naturel sur une ATTAQUE est un coup critique — c'est une règle SRD");
  assert.equal(crit.damageCritical, true);
  assert.equal(crit.damageDice.length, 2, "« Roll all of the attack's damage dice twice »");
  assert.equal(crit.damageTotal, 17, "6 + 7 + 4 : les dés doublent, le bonus non");
  assert.equal(h.queueEmpty(), 0);

  // ── Un coup manqué ne lance pas de dégâts ──
  h.queueRolls(2);
  h.verbs.prepare(longsword);
  h.verbs.roll();
  const miss = h.state.history[0];
  assert.equal(miss.outcome, "Failure");
  assert.equal(miss.damageDice, undefined, "un coup qui n'atteint pas la CA ne roule aucun dé de dégâts");
  assert.equal(h.queueEmpty(), 0);

  // ── Et un sort : souvent aucun jet du lanceur, mais une sauvegarde ──
  h.queueRolls(4, 5, 6);
  h.verbs.prepare({
    name: "Burning Hands", rollType: "spell", resolution: "save", level: 1, slotLevel: 1,
    saveAbility: "DEX", saveDc: 13, damage: { dice: [{ count: 3, sides: 6 }], bonus: 0, type: "fire" }
  });
  h.verbs.roll();
  const spell = h.state.history[0];
  assert.equal(spell.rollType, "spell");
  assert.equal(spell.kept, null, "le lanceur ne lance rien : c'est la CIBLE qui sauvegarde");
  assert.equal(spell.damageDice.length, 3, "3d6");
  assert.equal(spell.damageTotal, 15);
  assert.ok(h.state.events.some((event) => /SLOT SPENT · level 1/.test(event.text)), "et l'emplacement consommé est annoncé");
  assert.equal(h.queueEmpty(), 0);
});

/* ══ TEST D'ACCEPTATION n°3 — LE PLUS DUR, ET LE PLUS IMPORTANT ═══════
   « Un personnage SRD pur dépense son Point d'inspiration héroïque pour
   RELANCER un dé déjà lancé, et le verdict du jet est recalculé. »

   Fate's Hand a RETIRÉ cette mécanique ; le SRD la garde. C'est le seul test
   qui prouve la séparation DANS LE SENS DIFFICILE — une mécanique SRD que le
   système maison n'utilise pas. Si elle ne marche pas avec FH débrayé, la
   thèse en couches ne tient pas. */

test("ACCEPTATION 3 — l'Inspiration héroïque relance un dé tombé, et le verdict est recalculé", () => {
  const h = srdOnly();
  h.verbs.open({
    character: { name: "Aldra", pb: 2 }, campaign: "SRD 5.2.1", pseudo: "Aldra",
    /* SRD 5.2, `srd:glossary:en:heroic-inspiration`, p.183 : « expend it to
       reroll any die immediately after rolling it, and you must use the new
       roll ». Une ressource comptée ordinaire — c'est le point. */
    poolResources: [{ id: "heroic", label: "Heroic", short: "Heroic", kind: "count", sides: 4, count: 1, tint: "ash" }]
  });

  h.queueRolls(3);
  h.verbs.prepare({ name: "Athletics", ability: "STR", bonus: 4, dc: 15 });
  h.verbs.roll();

  const entry = h.state.history[0];
  assert.equal(entry.total, 7, "3 + 4");
  assert.equal(entry.outcome, "Failure", "7 rate le DD 15");
  assert.equal(h.settledEvents().length, 1, "la table a vu l'échec");

  // On dépense le Point, et on relance LE D20 — un dé déjà tombé.
  h.queueRolls(18);
  const done = h.verbs.rerollDie({ entryId: entry.id, dieKey: "d20", poolResourceId: "heroic", source: "heroic-inspiration" });
  assert.equal(done, true);

  assert.equal(h.state.history.length, 1, "la relance RÉÉCRIT l'entrée — elle n'en ouvre pas une seconde");
  assert.equal(entry.kept, 18, "« you must use the new roll »");
  assert.equal(entry.natural, 18);
  assert.equal(entry.total, 22, "18 + 4");
  assert.equal(entry.outcome, "Success", "LE VERDICT EST RECALCULÉ — c'est tout le test");
  assert.equal(h.derive.ruling(entry).verdict, "SUCCESS");
  assert.equal(h.t.poolList().find((res) => res.id === "heroic").count, 0, "et le Point est dépensé");

  // La table entend le nouveau verdict, en révision 1 du MÊME jet.
  const settled = h.settledEvents().filter((event) => event.rollId === entry.id);
  assert.deepEqual(settled.map((event) => event.rev), [0, 1], "une révision du même jet, pas un second jet");
  assert.equal(settled[1].roll.total, 22);
  assert.equal(settled[1].intent.outcome, "success");
  // La relance laisse sa trace : une dépense invisible serait une dépense perdue.
  assert.equal(entry.rerolls.length, 1);
  assert.deepEqual(entry.rerolls[0].before, 3);
  assert.deepEqual(entry.rerolls[0].after, 18);
  assert.ok(h.derive.badges(entry).some((badge) => badge.id === "rerolled"), "et un badge la porte sur la ligne du jet");
  assert.equal(h.queueEmpty(), 0);
});

test("ACCEPTATION 3 bis — « n'importe quel dé » veut dire n'importe quel dé", () => {
  /* C'est la propriété qui SÉPARE ce verbe des deux autres (D.1) : Bardic vise
     le total, Guidance vise le d20, l'Inspiration héroïque vise LE DÉ QU'ON
     VIENT DE LANCER, quel qu'il soit — y compris un dé de dégâts. */
  const h = srdOnly();
  h.queueRolls(15, 1); // touche, puis un d8 de dégâts humiliant
  h.verbs.prepare({
    name: "Longsword", ability: "STR", bonus: 6, rollType: "attack", ac: 15,
    damage: { dice: [{ count: 1, sides: 8 }], bonus: 4, type: "slashing" }
  });
  h.verbs.roll();
  const entry = h.state.history[0];
  assert.equal(entry.damageTotal, 5, "1 + 4");

  h.queueRolls(8);
  assert.equal(h.verbs.rerollDie({ entryId: entry.id, dieKey: "damage:0" }), true);
  assert.equal(entry.damageDice[0].result, 8, "un dé de DÉGÂTS se relance aussi");
  assert.equal(entry.damageTotal, 12, "8 + 4");
  assert.equal(entry.total, 21, "et le jet de toucher, lui, n'a pas bougé");

  // Un dé qui n'appartient pas à ce jet est un refus NOMMÉ, jamais un silence.
  assert.equal(h.verbs.rerollDie({ entryId: entry.id, dieKey: "damage:9" }), false);
  assert.match(h.state.message, /not part of this roll/);
  assert.equal(h.queueEmpty(), 0);
});

/* ══ D.1 — TROIS FENÊTRES, TROIS CIBLES, TROIS PORTES ════════════════ */

test("D.1 — un dé de correction se dépense APRÈS un échec, et pas sur un succès", () => {
  /* « Un moteur qui les traite pareil laissera passer un Bardic sur un
     succès. » C'est exactement ce que le moteur porté faisait : `stageBonusDie`
     n'avait aucune garde de fenêtre. */
  const h = srdOnly();
  h.queueRolls(18);
  h.verbs.prepare({ name: "Persuasion", ability: "CHA", bonus: 4, dc: 15 });
  h.verbs.roll();
  assert.equal(h.state.history[0].outcome, "Success");
  assert.equal(h.verbs.addDie({ source: "bardic" }), false, "un Bardic sur un succès est REFUSÉ");
  assert.match(h.state.message, /failed D20 Test/, "et le refus dit pourquoi");

  // Sur un échec, il passe — et il vise le TOTAL.
  h.queueRolls(4);
  h.verbs.prepare({ name: "Persuasion", ability: "CHA", bonus: 4, dc: 15 });
  h.verbs.roll();
  const failed = h.state.history[0];
  assert.equal(failed.outcome, "Failure");
  assert.equal(h.verbs.addDie({ source: "bardic" }), true);
  h.queueRolls(6);
  h.verbs.roll();
  assert.equal(failed.total, 14, "4 + 4 + 6 — le dé s'ajoute au total");
  assert.equal(failed.kept, 4, "et il ne relance JAMAIS le d20 : ce n'est pas la même porte");
  assert.equal(h.queueEmpty(), 0);
});

test("D.1 — un bonus de montage se déclare AVANT le jet, jamais après", () => {
  const h = srdOnly();
  h.verbs.prepare({ name: "Insight", ability: "WIS", bonus: 3, dc: 14 });
  assert.equal(h.verbs.mountDie({ source: "guidance", sides: 4 }), true, "Guidance se monte sur une console préparée");
  h.queueRolls(9, 3);
  h.verbs.roll();
  const entry = h.state.history[0];
  assert.equal(entry.total, 15, "9 + 3 + 3");
  assert.equal(entry.bonusDice[0].sourceIcon, "guidance");

  // Le jet est tombé : la fenêtre de montage est fermée, et le refus le dit.
  assert.equal(h.verbs.mountDie({ source: "guidance", sides: 4 }), false);
  assert.match(h.state.message, /before the roll/);
  // L'avantage est un montage lui aussi : décidé avant que les dés partent.
  h.verbs.prepare({ name: "Perception", ability: "WIS", bonus: 3 });
  assert.equal(h.verbs.mountDie({ mode: "advantage" }), true);
  h.queueRolls(5, 16);
  h.verbs.roll();
  assert.equal(h.state.history[0].kept, 16, "l'avantage garde le meilleur, et se résout seul");
  assert.equal(h.queueEmpty(), 0);
});

/* ══ D.4 — LE REMBOURSEMENT CONDITIONNEL ═════════════════════════════ */

test("D.4 — Tactical Mind n'est pas dépensé si le test échoue quand même", () => {
  /* VÉRIFIÉ dans le moteur porté : ce chemin n'existait pas. `recreditPoolDie`
     ne rendait une ressource que si son dé n'avait pas de résultat. Juste pour
     Bardic (« expended when it's rolled »), faux pour Tactical Mind. */
  const h = srdOnly();
  h.verbs.open({
    character: { name: "Aldra", pb: 2 }, campaign: "SRD", pseudo: "Aldra",
    poolResources: [{ id: "second-wind", label: "Tactical", kind: "count", sides: 10, count: 2, tint: "crimson", correction: "tactical" }]
  });

  // Le test échoue, on dépense — et il échoue QUAND MÊME.
  h.queueRolls(2);
  h.verbs.prepare({ name: "Athletics", ability: "STR", bonus: 3, dc: 20 });
  h.verbs.roll();
  const entry = h.state.history[0];
  assert.equal(entry.outcome, "Failure");
  h.verbs.spendPoolResource({ id: "second-wind" });
  assert.equal(h.t.poolResourceById("second-wind").count, 1, "l'usage est décrémenté au moment où le dé est stagé");
  h.queueRolls(4);
  h.verbs.roll();
  assert.equal(entry.total, 9, "2 + 3 + 4");
  assert.equal(entry.outcome, "Failure", "9 rate toujours le DD 20");
  assert.equal(h.t.poolResourceById("second-wind").count, 2,
    "REGRESSION D.4 : « If the check still fails, this use of Second Wind isn't expended »");
  assert.ok(h.state.events.some((event) => /not expended/.test(event.text)), "et le remboursement le DIT — jamais en silence");

  // Et quand il réussit, l'usage est bien parti.
  h.queueRolls(9);
  h.verbs.prepare({ name: "Athletics", ability: "STR", bonus: 3, dc: 14 });
  h.verbs.roll();
  const second = h.state.history[0];
  assert.equal(second.outcome, "Failure", "12 rate le DD 14");
  h.verbs.spendPoolResource({ id: "second-wind" });
  h.queueRolls(5);
  h.verbs.roll();
  assert.equal(second.total, 17, "9 + 3 + 5");
  assert.equal(second.outcome, "Success");
  assert.equal(h.t.poolResourceById("second-wind").count, 1, "réussi, l'usage est dépensé pour de bon");
  assert.equal(h.queueEmpty(), 0);
});

/* ══ D.5 — LE DON D'UN DÉ, AUX DEUX BOUTS, SANS LE TRANSPORT ═════════ */

test("D.5 — le donneur décrémente sa ressource, le receveur reçoit un dé QUI PORTE SA PROVENANCE", () => {
  const giver = makeHarness({ layers: [] });
  giver.verbs.open({
    character: { name: "Lyra" }, campaign: "SRD", pseudo: "Lyra",
    poolResources: [{ id: "bardic-uses", label: "Bardic", kind: "count", sides: 6, count: 3, tint: "violet", correction: "bardic" }]
  });

  const gift = giver.verbs.giveDie({ source: "bardic", poolResourceId: "bardic-uses", to: "Aldra", timing: "advance" });
  assert.equal(gift.schema, "fh-die-gift/1");
  assert.equal(gift.from, "Lyra", "le don sait de qui il vient");
  assert.equal(gift.to, "Aldra");
  assert.equal(gift.timing, "advance");   // REWRITTEN 2026-08-08 : `ahead` → `advance`, aligné sur le contrat
  assert.equal(giver.t.poolResourceById("bardic-uses").count, 2, "le DONNEUR décrémente SA ressource, et personne d'autre");
  assert.ok(giver.emitted.some((event) => event.type === "die-given"), "et il émet un événement — le transport est du bloc `table`");

  /* LE LOT 5 CONSTRUIT LES DEUX BOUTS, PAS LE TRANSPORT : ici le dé se pose
     directement, et un test suffit à le prouver. */
  const receiver = makeHarness({ layers: [] });
  receiver.verbs.open({ character: { name: "Aldra" }, campaign: "SRD", pseudo: "Aldra" });
  const received = receiver.verbs.receiveDie(gift);

  assert.equal(received.label, "Bardic");
  assert.equal(received.sides, 6);
  assert.equal(received.count, 1, "un dé reçu est une ressource comptée ORDINAIRE");
  assert.equal(received.correction, "bardic", "qui sait ce qu'elle est");
  /* ⚠️ La forme de provenance. `resolved.resources[]` de `fh-char/1` n'a pas
     ce champ et son `additionalProperties` est `false` : cette forme est
     LIVRÉE À L'ARCHITECTE, pas écrite dans le schéma par ce lot (loi §0.10). */
  assert.deepEqual(Object.keys(received.origin).sort(), ["expiresAt", "from", "givenAt", "source", "timing"]);
  assert.equal(received.origin.from, "Lyra", "et elle porte qui l'a donné");
  assert.equal(received.origin.source, "bardic", "quelle source");
  assert.equal(received.origin.timing, "advance", "et quelle fenêtre de validité");   // REWRITTEN 2026-08-08

  // Un dé reçu se dépense exactement comme un dé qu'on possédait déjà.
  receiver.queueRolls(5);
  receiver.verbs.prepare({ name: "Deception", ability: "CHA", bonus: 2, dc: 15 });
  receiver.verbs.roll();
  const entry = receiver.state.history[0];
  assert.equal(entry.outcome, "Failure");
  receiver.verbs.spendPoolResource({ id: received.id });
  receiver.queueRolls(6);
  receiver.verbs.roll();
  assert.equal(entry.total, 13, "5 + 2 + 6 — le dé donné se comporte comme n'importe quel dé de correction");
  assert.equal(receiver.queueEmpty(), 0);
  assert.equal(giver.queueEmpty(), 0);
});

test("D.5 — « à l'avance » et « en réaction » sont DEUX portes, pas une", () => {
  /* Un dé donné à l'avance est une ressource qui ATTEND sur la fiche du
     receveur ; un dé donné en réaction arrive PENDANT une transaction ouverte.
     Les confondre est le même genre d'erreur qu'en D.1. */
  const h = srdOnly();

  // À l'avance : le dé attend, rien n'est stagé.
  const advance = h.verbs.receiveDie({
    schema: "fh-die-gift/1", from: "Lyra", to: "Aldra", timing: "advance", givenAt: "2026-08-08T00:00:00.000Z",
    die: { source: "bardic", sides: 6, label: "Bardic", tint: "violet", kind: "die", count: 1, correction: "bardic" }
  });
  assert.equal(h.t.poolResourceById(advance.id).count, 1, "il attend sur la fiche");
  assert.equal(h.t.stagedList().length, 0, "et rien n'est posé dans une main qui n'existe pas encore");

  // En réaction, sur un jet OUVERT : il se pose tout de suite.
  h.queueRolls(6);
  h.verbs.prepare({ name: "Survival", ability: "WIS", bonus: 1, dc: 18 });
  h.verbs.roll();
  assert.equal(h.t.rollOpen(), true);
  const reaction = h.verbs.receiveDie({
    schema: "fh-die-gift/1", from: "Lyra", to: "Aldra", timing: "reaction", givenAt: "2026-08-08T00:00:00.000Z",
    die: { source: "bardic", sides: 6, label: "Bardic", tint: "violet", kind: "die", count: 1, correction: "bardic" }
  });
  assert.equal(h.t.stagedList().length, 1, "un dé donné en réaction se pose dans la transaction ouverte");
  assert.equal(h.t.poolResourceById(reaction.id).count, 0, "et il est déjà dépensé, comme tout dé stagé");
  assert.equal(h.queueEmpty(), 0);
});

/* ══ EXIGENCE A — LES RÉGLAGES SONT FERMÉS PAR TYPE ══════════════════ */

test("A — `configure` refuse un réglage qui n'appartient pas au type courant", () => {
  /* Le verbe livré par le lot 3 faisait `Object.assign(state.rollConfig, p)` :
     c'était la forme « compétence » prise pour la règle générale. Il laissait
     écrire `ac` sur une compétence sans que rien ne bronche. */
  const h = srdOnly();
  h.verbs.prepare({ name: "Stealth", ability: "DEX", bonus: 5, dc: 15 });
  h.verbs.configure({ dc: 18 });
  assert.equal(h.state.rollConfig.dc, "18", "un réglage du type passe");
  assert.throws(() => h.verbs.configure({ ac: 14 }), /not a setting of a check roll/,
    "une CA n'a aucun sens sur une compétence, et le moteur le dit au lieu de l'avaler");
  assert.throws(() => h.verbs.configure({ slotLevel: 3 }), /not a setting of a check roll/);
  assert.throws(() => h.verbs.configure({ nonsense: 1 }), /not a setting of a check roll/);

  h.verbs.prepare({ name: "Longsword", ability: "STR", bonus: 6, rollType: "attack", ac: 15 });
  h.verbs.configure({ ac: 17 });
  assert.equal(h.state.rollConfig.ac, "17", "la même clef est légale sur le type qui la déclare");
  assert.throws(() => h.verbs.configure({ dc: 12 }), /not a setting of a attack roll/,
    "et le DD, lui, ne l'est plus : la liste est fermée PAR TYPE, jamais globalement");

  // Une valeur hostile atterrit sur une valeur légale ou jette — jamais telle quelle.
  assert.throws(() => h.verbs.configure({ ability: "QQQ" }), /is not an ability/);
  assert.equal(h.queueEmpty(), 0);
});

/* ══ LE GARDE STRUCTUREL — ce qui empêche la coupe de se refermer ════ */

/* REWRITTEN 2026-08-08 (RELECTEUR Adverserial) — les deux gardes ci-dessous
   étaient CREUX, et verts. Ils lisaient `src/play/` à plat (un sous-répertoire
   sortait du périmètre), leur vocabulaire ne couvrait pas `arcana` —
   l'identifiant que le code emploie réellement — et le second cherchait encore
   `layers/fh`, chemin mort depuis le déplacement des modules dans
   `src/modules/fh/`. Mesure de l'attaque : 170/170 verts avec un
   `src/play/utils.mjs` qui importait la couche et manipulait `arcana`.
   L'arpenteur, le dépouilleur et les deux vocabulaires vivent maintenant dans
   tests/source-scan.mjs, et sont eux-mêmes attaqués par
   tests/guards-adversarial.test.mjs. */
const playSources = () => loadSources([path.join(here, "..", "src", "play")], path.join(here, ".."));

test("§0.12 — aucun fichier de src/play/ ne cite une mécanique Fate's Hand", () => {
  /* Le garde qui manquait au lot 3. Il est structurel exprès : c'est la seule
     forme qui survit au prochain qui éditera ces fichiers sans avoir lu le
     kickoff. Les commentaires sont retirés d'abord — ils NOMMENT ce qui est
     parti, et un garde qui les lit interdirait d'expliquer la frontière qu'il
     défend. */
  const sources = playSources();
  assert.ok(sources.some((s) => s.name === "src/play/session.mjs"),
    "le moteur lui-même est dans le périmètre — si les fichiers ont bougé, ce garde bouge avec eux, il ne les perd pas");
  const hits = findForbidden(sources, HOUSE_MECHANICS);
  assert.deepEqual(hits, [],
    "le SRD est la base, FH est une couche par-dessus (loi §0.12) — " +
    hits.map((hit) => `${hit.name} cite « ${hit.label} » (${hit.match})`).join(" ; "));
});

test("§L5.3 — les modules s'inscrivent, ils ne sont pas appelés", () => {
  /* « Pas de `if (fh) … else …` semé dans le code : c'est la forme dégradée de
     la même erreur. » Le garde le vérifie sur les octets : aucun fichier du
     moteur ne nomme une couche, ni par son nom, ni par son drapeau, ni par le
     chemin de son module. */
  const hits = findForbidden(playSources(), LAYER_NAMES);
  assert.deepEqual(hits, [],
    "le chemin commun ne doit connaître que des MOMENTS — " +
    hits.map((hit) => `${hit.name} nomme la couche (${hit.label} : ${hit.match})`).join(" ; "));
});

test("les deux moteurs tournent côte à côte, et ne se parlent pas", () => {
  /* La preuve que la coupe est une coupe PAR CAPACITÉ et pas par pureté : la
     même instance de code sert les deux, et ce qui les distingue est ce qui a
     été monté. */
  const srd = makeHarness({ layers: [] });
  const fh = makeHarness();
  srd.verbs.open({ character: { name: "Aldra", pb: 2 }, pseudo: "Aldra" });
  fh.verbs.open({ character: { name: "Nodren", pb: 2 }, pseudo: "Nodren" });

  assert.deepEqual(srd.play.flags, []);
  /* REWRITTEN 2026-08-09 (lot 21) — `fh.tilt` entre dans la liste le jour où
     le Tilt entre dans la couche. L'assertion n'est pas relâchée : elle reste
     une égalité EXACTE, et c'est elle qui force chaque capacité neuve à se
     déclarer ici plutôt que d'arriver en passager clandestin. Le Tilt est bien
     une CAPACITÉ et pas une valeur de règle — il allume un module, il ne
     remplace aucun nombre (ça, c'est `rules`, deux lignes plus bas). */
  assert.deepEqual(fh.play.flags, ["fh.arcana", "fh.chaos", "fh.destiny", "fh.exhaustion", "fh.overreach", "fh.tilt"],
    "la couche LÈVE ses drapeaux de capacité, et le document saura lesquels ont servi");
  assert.ok(fh.state.destiny, "elle sème sa tranche");
  assert.equal(srd.state.destiny, undefined, "et l'autre moteur ne sait même pas que la tranche existe");

  /* ⚠️ La seule VALEUR DE RÈGLE que la couche remplace, et elle est mesurable :
     le SRD réduit un test de d20 de 2 fois le niveau d'Épuisement (p.181), la
     maison joue à −1. La CONDITION reste celle du SRD des deux côtés. */
  assert.equal(srd.derive.rules().exhaustionPerLevel, 2, "SRD 5.2.1, glossaire « Exhaustion », p.181");
  assert.equal(fh.derive.rules().exhaustionPerLevel, 1, "Fate's Hand joue la même condition avec son chiffre");

  srd.verbs.setExhaustion({ level: 2, reason: "Test", silent: true });
  srd.queueRolls(15);
  srd.verbs.quickRoll({ name: "Arcana", ability: "INT", bonus: 5 });
  assert.equal(srd.state.history[0].total, 16, "15 + 5 − 4 : deux niveaux valent −4 en SRD pur");
  assert.equal(srd.queueEmpty(), 0);
  assert.equal(fh.queueEmpty(), 0);
});

/* ══ D.2 — CE QUI NE TOMBE SURTOUT PAS ═══════════════════════════════ */

test("D.2 — la transaction de jet reste ROUVRABLE, et sans la couche aussi", () => {
  /* « Un jet réglé n'est pas figé : il doit pouvoir recevoir un dé et CHANGER
     DE VERDICT. C'est précisément ce que la phrase d'Eric demande de garder. »
     Le mécanisme n'a pas été touché par la coupe — ce test le vérifie là où
     personne ne l'avait encore vérifié : sur le moteur SRD nu. */
  const h = srdOnly();
  h.queueRolls(7);
  h.verbs.prepare({ name: "Investigation", ability: "INT", bonus: 3, dc: 15 });
  h.verbs.roll();

  const entry = h.state.history[0];
  assert.equal(entry.total, 10);
  assert.equal(entry.outcome, "Failure", "le jet est RÉGLÉ, et il a échoué");
  assert.equal(h.settledEvents().length, 1, "la table l'a entendu");
  assert.equal(h.t.rollOpen(), true, "et il reste OUVERT derrière l'unique ROLL");
  assert.equal(h.t.rollTransactionActive(), false, "sans rien bloquer");

  // Un dé arrive après coup. Le d20 ne bouge pas ; le verdict, si.
  h.verbs.stageDie({ sides: 6, label: "Bardic", sourceIcon: "bardic" });
  assert.equal(h.t.stagedList().length, 1, "un dé choisi après le jet est stagé, pas lancé sur place");
  assert.match(h.state.trayResultText, /1 new die/, "et il est annoncé");
  h.queueRolls(6);
  h.verbs.roll();

  assert.equal(h.state.history.length, 1, "toujours UNE entrée : le jet est rouvert, pas refait");
  assert.equal(entry.kept, 7, "appliquer un modificateur ne relance JAMAIS le d20");
  assert.equal(entry.total, 16, "7 + 3 + 6");
  assert.equal(entry.outcome, "Success", "ET LE VERDICT A CHANGÉ — c'est ce que D.2 demande de garder");
  assert.equal(entry.adjusted, true, "l'entrée porte la marque de son ajustement");
  assert.ok(h.derive.badges(entry).some((badge) => badge.id === "adjusted"), "et un badge la dit à la table");

  const settled = h.settledEvents().filter((event) => event.rollId === entry.id);
  assert.deepEqual(settled.map((event) => event.rev), [0, 1], "deux révisions du MÊME jet, pas deux jets");
  assert.equal(settled[1].roll.outcome, "Success");
  // Et la boucle est répétable : un second modificateur peut encore arriver.
  h.verbs.stageDie({ sides: 4, label: "Bonus II", sourceIcon: "other-2" });
  h.queueRolls(2);
  h.verbs.roll();
  assert.equal(entry.total, 18, "la boucle rouvre autant de fois qu'il le faut");
  assert.equal(h.queueEmpty(), 0);
});

/* REWRITTEN 2026-08-08 (architecte) — le titre disait « et bute sur le schéma »,
   et ce n'est plus vrai : le contrat a accueilli la provenance. Le RELECTEUR
   Adverserial a montré que les deux bouts ne parlaient pas la même langue, et
   l'écart est réconcilié — `timing` des deux côtés, `advance` au lieu de
   `ahead`, `givenAt` entré au contrat. La conformité est désormais prouvée par
   tests/frontiere-doc-moteur.test.mjs, qui compile une sortie de `snapshot()`
   contre `fh-char/1`. Assertions réécrites à la nouvelle vérité, pas relâchées. */
test("D.5 — la provenance survit à un aller-retour DANS `play`, et passe le schéma", () => {
  /* Le bloc rend au document ce qui lui appartient (`snapshot`) et le reprend
     (`open`). La provenance traverse ce trajet-là : elle est normalisée dans
     les deux sens, et rien ne l'élague en route. */
  const h = srdOnly();
  const received = h.verbs.receiveDie({
    schema: "fh-die-gift/1", from: "Lyra", to: "Aldra", timing: "advance", givenAt: "2026-08-08T00:00:00.000Z",
    die: { source: "bardic", sides: 6, label: "Bardic", tint: "violet", kind: "die", count: 1, correction: "bardic" }
  });
  const kept = h.verbs.snapshot();
  const carried = kept.poolResources.find((res) => res.id === received.id);
  assert.ok(carried, "la ressource fait partie de ce que la séance rend au document");
  assert.equal(carried.origin.from, "Lyra");

  // Et elle revient telle quelle à l'ouverture suivante.
  const next = makeHarness({ layers: [] });
  next.verbs.open({ character: { name: "Aldra" }, pseudo: "Aldra", poolResources: kept.poolResources });
  const reopened = next.t.poolList()[0];
  assert.deepEqual(reopened.origin, {
    from: "Lyra", source: "bardic", timing: "advance",
    givenAt: carried.origin.givenAt, expiresAt: null
  }, "qui l'a donné, quelle source, quelle fenêtre — rien n'est tombé en route");
});

test("un dé stagé qu'on retire emporte SA ligne, et le chemin commun n'en connaît pas le nom", () => {
  /* La v1 écrivait `dropEventsTagged("staged-destiny")` dans le chemin commun :
     le moteur connaissait le nom d'une étiquette posée par une mécanique
     maison. L'étiquette voyage désormais SUR le dé — donc n'importe quelle
     couche peut en poser une, et le moteur n'en sait rien. */
  const h = srdOnly();
  h.queueRolls(4);
  h.verbs.prepare({ name: "Athletics", ability: "STR", bonus: 2, dc: 18 });
  h.verbs.roll();
  const before = h.state.events.length;
  h.verbs.stageDie({ sides: 6, label: "Bardic", sourceIcon: "bardic" });
  h.t.stagedList()[0].tag = "waiting";
  h.t.recordEvent({ text: "a die waits", kind: "info", tag: "waiting" });
  assert.equal(h.state.events.length, before + 1);
  h.verbs.selectDie({ stagedId: h.t.stagedList()[0].id });
  h.verbs.dropDie();
  assert.equal(h.t.stagedList().length, 0, "le dé est retiré");
  assert.equal(h.state.events.length, before, "et sa ligne part avec lui — pas un mensonge laissé à l'écran");
  assert.equal(h.queueEmpty(), 0);
});
