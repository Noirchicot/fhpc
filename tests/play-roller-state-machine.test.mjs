/* Suite portée de fh-phb `tests/roller-state-machine.test.js` (502 l., main).

   PORTÉE, PAS RÉÉCRITE. Chaque assertion qui portait sur l'ÉTAT du moteur est
   ici telle quelle. Les assertions qui portaient sur du HTML (renderStageZone,
   renderConsole, renderJudgmentFrame, renderEventContent, visualDie,
   diceTrayInner, renderDestiny) ne sont pas venues : elles jugent des surfaces
   qui restent dans fh-phb, et le bloc `play` n'en produit aucune. Chacune est
   nommée dans INVENTAIRE-LOT-C.md avec ce qui la remplace ou ce qui la garde.

   Discipline §0.7 : toute assertion dont la vérité a changé porte `REWRITTEN`
   SUR SA PROPRE LIGNE, avec la raison. Jamais relâchée, jamais supprimée.

   Les commentaires v1 qui expliquent POURQUOI une assertion existe sont
   conservés : ils sont la moitié de la valeur du fichier. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHarness } from "./play-harness.mjs";

function natOne(id = "nat-one") {
  return {
    id, kind: "d20", name: "Arcana", ability: "INT", baseBonus: 3, d20Mode: "flat",
    d20s: [1], kept: 1, natural: 1, plusTwo: false, custom: 0, guidance: null, bardic: null,
    destiny: null, dc: "", note: "", createdAt: new Date().toISOString(),
    total: 4, outcome: "Natural 1 · choose fate", natChoice: null
  };
}

/* Un jet ne finit plus sur un bouton : il atterrit dans le flux et reste
   ouvert. Le clore veut dire répondre à ce qui bloque encore, puis nettoyer. */
function settle(h) {
  assert.equal(h.t.rollTransactionActive(), false, "nothing may still be blocking when a roll is settled");
  if (h.t.rollOpen()) h.t.clearDiceTray(true);
}
const latest = (h) => h.state.events[0] || null;

test("un dé dépensé disparaît ; perdre des points ne récupère jamais celui qu'on vient de dépenser", () => {
  const h = makeHarness();
  h.reset(3, [h.die("spent", 4, true), h.die("missing", 6, false)]);
  h.queueRolls(4);
  const spent = h.t.spendDestinyDie("spent", true);
  assert.equal(spent.criticalSuccess, true);
  assert.equal(h.state.destiny.points, 2);
  assert.equal(h.state.destiny.dice.find((item) => item.id === "spent").available, false, "the rolled Destiny die disappears from the full pool");
  assert.equal(spent.recovered, null, "spending down to an even score cannot recover a die");
  const specs = h.t.destinyEventSpecs(spent, "entry");
  assert.equal(specs.length, 1, "all ordinary implications of one Destiny die share one popup");
  // REWRITTEN 2026-08-06 (lot R34-R39) — L74, cascade of the ratified ∞ family.
  assert.match(specs[0].text, /∞ CRITICAL.*Lost 1 Destiny Point.*Current 2/);
  assert.equal(h.queueEmpty(), 0);
});

test("gagner des points jusqu'à un seuil pair peut récupérer exactement le plus petit dé manquant", () => {
  const h = makeHarness();
  h.reset(3, [h.die("fumble", 6, true), h.die("missing-d4", 4, false), h.die("missing-d8", 8, false)]);
  h.queueRolls(1);
  const spent = h.t.spendDestinyDie("fumble", true);
  const specs = h.t.destinyEventSpecs(spent, "entry");
  assert.equal(spent.criticalFailure, true);
  assert.equal(h.state.destiny.points, 4);
  assert.equal(spent.recovered.id, "missing-d4");
  assert.equal(specs.length, 1);
  /* REWRITTEN (dock v6): a 1 on a Destiny die is now an offer, not a verdict, so
     the line announces the roll only — the point it moved may still be undone by
     refusing, and a line must not claim what may be undone. */
  // REWRITTEN 2026-08-06 (lot R34-R39) — L74, same cascade on the failure side.
  assert.match(specs[0].text, /^∞ FUMBLE · Destiny d6 rolled 1$/);
  const offer = h.t.arcaneDecision(spent, "entry");
  assert.equal(offer.type, "arcane1", "and the failure raises a decision instead");
  assert.equal(offer.sides, 6);
  assert.equal(h.queueEmpty(), 0);
});

test("le Chaos reste une implication majeure distincte ; les points s'arrêtent à zéro et le manque devient Overreach", () => {
  const h = makeHarness();
  h.reset(3, [h.die("chaos-d8", 8, true)]);
  h.queueRolls(5);
  const spent = h.t.spendDestinyDie("chaos-d8", true);
  h.state.rollSequence = { entry: { ability: "WIS" } };
  const specs = h.t.destinyEventSpecs(spent, "entry");
  assert.equal(specs.length, 2);
  assert.equal(h.state.destiny.points, 0, "Destiny Points never fall below zero");
  assert.equal(h.state.destiny.overreach, 2, "the 2 points it could not pay become Overreach");
  assert.match(specs[0].text, /Lost 3 Destiny Points.*Current 0/);
  assert.match(specs[1].text, /CHAOS RISK.*Overreach 2.*WIS save DC 12/);
  assert.equal(h.queueEmpty(), 0);
});

test("20 naturel et Éveil consolident leurs implications en un seul événement", () => {
  const h = makeHarness();
  h.reset(1);
  const entry = { id: "awakening", natural: 20 };
  const events = h.t.naturalDestiny(entry);
  assert.equal(events.length, 1);
  assert.equal(events[0].kind, "awakening");
  assert.match(events[0].text, /ARCANE AWAKENING.*Lost 1 Destiny Point.*Current 0/);
});

test("annoncer ne bloque jamais : les lignes atterrissent ensemble, la plus récente d'abord", () => {
  const h = makeHarness();
  h.reset();
  h.state.rollSequence = { phase: "destiny-events" };
  // REWRITTEN (dock v6): the Continue/Finish button is gone with the whole popup
  // queue. Announcements stack as lines, newest first, and none of them blocks.
  h.t.announceEvents([{ text: "Destiny summary · Lost 3 Destiny Points", kind: "destiny" }, { text: "CHAOS RISK · pending", kind: "chaos" }], "");
  assert.equal(h.state.events.length, 2, "both announcements land at once — the second does not wait for the first");
  assert.equal(latest(h).text, "CHAOS RISK · pending", "newest first");
  /* REWRITTEN (lot C, portage v2) : les trois assertions v1 qui suivaient
     interrogeaient renderStageZone() — pas de bouton, pas de ligne empilée,
     pas de zone d'événements dans le roller. Elles jugent une SURFACE, et le
     bloc `play` n'en produit aucune ; elles restent dans fh-phb. Ce qu'elles
     protégeaient côté moteur est ci-dessous, intact. */
  assert.equal(h.t.rollTransactionActive(), false, "announcing never holds the dock");
});

test("la Destinée roule d'abord, mais ses conséquences ne gardent plus le d20 : une seule passe", () => {
  const h = makeHarness();
  h.reset(5, [h.die("first", 4, true)]);
  h.queueRolls(3, 15, 2, 5);
  h.state.rollConfig = Object.assign(
    h.t.rollInput("Hunting", "WIS", 8, { mode: "flat", dc: 18 }),
    { guidance: true, bardic: true, bardicSides: 6, destinyDieId: "first", destinyConfirmed: true }
  );
  h.t.runConfiguredRoll();
  assert.equal(h.state.history.length, 1, "REWRITTEN (dock v6): no click stands between Destiny and the d20 any more");
  assert.ok(h.state.events.some((event) => /Destiny d4 rolled 3.*Lost 3 Destiny Points/.test(event.text)), "the Destiny summary is still announced, as a line");
  const entry = h.state.history[0];
  assert.deepEqual(Array.from(entry.d20s), [15]);
  assert.equal(entry.guidance.result, 2);
  assert.equal(entry.bardic.result, 5);
  /* REWRITTEN (fourth fitting, 2026-08-04): strict construction order, left
     to right — the Destiny die takes its chronological place at the END of
     the hand instead of jumping to the head. */
  assert.equal(h.state.trayResults[h.state.trayResults.length - 1].label, "Destiny", "Destiny sits at its construction-order place, last staged");
  // REWRITTEN (dock v5): the result popup is gone and so is APPLY. A landed roll
  // stays OPEN behind the one permanent ROLL, and it no longer locks the dock.
  assert.equal(h.t.rollOpen(), true, "it stays open, with every source of a new die still reachable");
  assert.equal(h.t.rollTransactionActive(), false, "only a question that must be answered locks the dock now");
  /* REWRITTEN (lot C, portage v2) : les six assertions v1 sur le bouton ROLL,
     la disparition d'APPLY et la place des badges au-dessus de la fenêtre de
     jugement interrogeaient renderConsole()/renderStageZone()/diceTrayInner().
     Surfaces → restent dans fh-phb. */
  // Le règlement, lui, est observable ici : il est passé sur le bus.
  assert.equal(h.settledEvents().length, 1, "le jet réglé a été annoncé une fois, et une seule");
  assert.equal(h.settledEvents()[0].roll.schema, "fh-roll/1");
  h.t.clearDiceTray(true);
  assert.equal(h.state.events.length, 0, "CLEAR TRAY takes the running commentary with the hand");
  assert.equal(h.queueEmpty(), 0);
});

test("avantage et désavantage se résolvent seuls ; l'A/D est le seul mode qui demande", () => {
  const h = makeHarness();
  // Advantage and disadvantage are committed to BEFORE the dice leave the hand,
  // so they resolve themselves. Offering a choice on top of them was the old bug.
  h.reset(); h.queueRolls(4, 18);
  h.state.rollConfig = h.t.rollInput("Vigilance", "WIS", 3, { mode: "advantage" });
  h.t.runConfiguredRoll();
  assert.equal(h.state.trayPrompt, null, "advantage never stops to ask");
  let entry = h.state.history[0];
  assert.equal(entry.kept, 18, "advantage keeps the higher die");
  assert.equal(entry.d20Choice, 1);
  settle(h);

  h.reset(); h.queueRolls(4, 18);
  h.state.rollConfig = h.t.rollInput("Vigilance", "WIS", 3, { mode: "disadvantage" });
  h.t.runConfiguredRoll();
  assert.equal(h.state.trayPrompt, null, "disadvantage never stops to ask");
  entry = h.state.history[0];
  assert.equal(entry.kept, 4, "disadvantage keeps the lower die");
  assert.equal(entry.d20Mode, "disadvantage");
  settle(h);

  // A/D is the one mode that rolls two and lets the player pick afterwards.
  h.reset(); h.queueRolls(4, 18);
  h.state.rollConfig = h.t.rollInput("Vigilance", "WIS", 3, { mode: "choice" });
  h.t.runConfiguredRoll();
  assert.equal(h.state.history.length, 0, "A/D waits");
  assert.equal(h.state.trayPrompt.type, "die-choice");
  h.t.resolveDieChoice(0);
  entry = h.state.history[0];
  assert.equal(entry.kept, 4, "A/D may deliberately take the lower result");
  assert.equal(entry.d20Mode, "choice");
  settle(h);

  h.reset(); h.queueRolls(10, 2, 7);
  h.state.rollConfig = h.t.rollInput("Tactics", "INT", 4, { mode: "flat" });
  h.state.rollConfig.bonusDice = [{ id: "superiority", label: "Superiority", sides: 8, advantageMode: "advantage", forcedResult: null }];
  h.t.runConfiguredRoll();
  assert.equal(h.state.trayPrompt, null, "a bonus die on advantage resolves itself too");
  entry = h.state.history[0];
  assert.equal(entry.bonusDice[0].result, 7);
  assert.deepEqual(Array.from(entry.bonusDice[0].rolls), [2, 7]);
  assert.equal(entry.total, 21);
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("l'A/D sur un dé de Destinée est le cas Arcane Majeur pour lequel il existe", () => {
  const h = makeHarness();
  h.reset(5, [h.die("destiny-choice", 4, true)]);
  h.queueRolls(2, 4, 12);
  h.state.rollConfig = Object.assign(h.t.rollInput("Hunting", "WIS", 3, { mode: "flat" }), { destinyDieId: "destiny-choice", destinyConfirmed: true, destinyMode: "choice" });
  h.t.runConfiguredRoll();
  assert.equal(h.state.trayPrompt.target, "destiny", "Destiny resolves its choice before any d20 exists");
  h.t.resolveDieChoice(0);
  assert.equal(latest(h).kind, "destiny", "REWRITTEN (dock v6): the Destiny summary is announced, not queued");
  const entry = h.state.history[0];
  assert.equal(entry.destiny.result, 2);
  assert.deepEqual(Array.from(entry.destiny.rolls), [2, 4]);
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("un résultat forcé (Portent) ne consomme aucun hasard et reste marqué MANUAL", () => {
  const h = makeHarness();
  h.reset();
  h.state.rollConfig = h.t.rollInput("Arcana", "INT", 5, { mode: "flat" });
  h.state.rollConfig.d20ForcedResult = 17;
  h.state.rollConfig.bonusDice = [{ id: "forced-d8", label: "Superiority", sides: 8, advantageMode: "flat", forcedResult: 6 }];
  h.t.runConfiguredRoll();
  let entry = h.state.history[0];
  assert.equal(entry.kept, 17);
  assert.equal(entry.d20Forced, true);
  assert.equal(entry.bonusDice[0].result, 6);
  assert.equal(entry.bonusDice[0].forced, true);
  assert.equal(entry.total, 28);
  settle(h);

  h.reset();
  h.state.rollConfig = h.t.rollInput("Arcana", "INT", 0, { mode: "flat" });
  h.state.rollConfig.d20ForcedResult = 10;
  h.state.rollConfig.bonusDice = [4, 6, 8, 10].map((sides, index) => ({ id: "cap-" + index, label: "Bonus " + index, sides, advantageMode: "flat", forcedResult: 1 }));
  h.t.runConfiguredRoll();
  entry = h.state.history[0];
  assert.equal(entry.bonusDice.length, 3, "structured checks enforce the three-bonus-die cap in the engine as well as the UI");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("un échec au DD ne bloque plus : le jet reste ouvert et la boucle de dés stagés est répétable", () => {
  const h = makeHarness();
  // REWRITTEN (tranche 2): a failure no longer opens a one-shot rescue popup.
  // The roll simply stays open, and any number of modifiers may be staged in turn.
  h.reset(); h.queueRolls(5);
  h.state.rollConfig = h.t.rollInput("Arcana", "INT", 3, { mode: "flat", dc: 20 });
  h.t.runConfiguredRoll();
  const entry = h.state.history[0];
  const locked = Array.from(entry.d20s);
  assert.equal(h.state.trayPrompt, null, "a failed DC no longer stops the table with a rescue popup");
  assert.equal(h.t.rollOpen(), true, "the failed roll waits with every die source still live");
  h.t.stageBonusDie(6, "Bardic", "bardic");
  assert.equal(h.t.stagedList().length, 1, "a die chosen after the roll is staged, not rolled on the spot");
  /* REWRITTEN (round 7c): the button is now only the die — its composition line
     moved off to the tray, next to the dice it describes. The original point is
     unchanged and still worth guarding: a staged die is announced SOMEWHERE, and
     never by renaming the button. */
  assert.match(h.state.trayResultText, /1 new die/, "a staged die is announced in the tray, not on the button's face");
  h.queueRolls(6);
  h.t.rollStagedDice();
  assert.deepEqual(Array.from(entry.d20s), locked, "applying a modifier never rerolls the d20");
  assert.equal(entry.bardic.result, 6);
  assert.equal(entry.total, 14);
  assert.equal(h.t.rollTransactionActive(), false, "REWRITTEN (dock v6): a plain bonus die never blocks — there is no popup left to be null");
  assert.equal(h.t.rollOpen(), true, "the cycle reopens — a second modifier may still be added");
  h.t.stageBonusDie(4, "Guidance", "guidance");
  h.queueRolls(3);
  h.t.rollStagedDice();
  assert.equal(entry.guidance.result, 3, "the loop really is repeatable");
  assert.equal(entry.total, 17);
  /* Le même jet s'est réglé trois fois — trois révisions, pas trois jets. La
     signature est ce qui décide, exactement comme en v1. */
  const settled = h.settledEvents().filter((event) => event.rollId === entry.id);
  assert.deepEqual(settled.map((event) => event.rev), [0, 1, 2], "chaque accrétion de dé est une révision du MÊME jet");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("accepter ou défier un 1 naturel groupe les implications et préserve le dé d'origine", () => {
  const h = makeHarness();
  h.reset(3, [h.die("missing-d4", 4, false)]);
  let entry = natOne("accept");
  h.state.history = [entry];
  h.state.rollSequence = { phase: "nat1", entryId: entry.id };
  h.t.resolveNatOne(entry.id, "accept");
  // REWRITTEN (tranche 2 · dock v6): the trailing result popup is gone, so the
  // Fate summary stands alone — now as one line rather than one popup.
  assert.equal(h.state.events.length, 1, "one line for the whole Fate summary, and no result line after it");
  assert.match(latest(h).text, /FATE ACCEPTED.*Gained 1 Destiny Point.*Current 4.*Gained a Destiny d4/);
  settle(h);

  // REWRITTEN (tranche 3): defying a natural 1 no longer rolls Chaos on the spot.
  h.reset(4);
  entry = natOne("defy");
  h.state.history = [entry];
  h.state.rollSequence = { phase: "nat1", entryId: entry.id };
  h.t.resolveNatOne(entry.id, "chaos");
  assert.equal(entry.d20s[0], 1);
  assert.equal(entry.kept, 20);
  assert.equal(entry.transformed, true);
  assert.equal(h.state.destiny.points, 0);
  assert.equal(entry.chaosRoll, undefined, "the 2d6 are deferred, not rolled while the table waits");
  // REWRITTEN (dock v6): both lines land together instead of one popup at a time.
  assert.equal(h.state.events.length, 2, "Fate defied, then the pending-Chaos notice");
  assert.match(h.state.events[1].text, /FATE DEFIED.*Destiny becomes 0/);
  assert.equal(latest(h).kind, "chaos");
  assert.match(latest(h).text, /CHAOS IS PENDING.*1 fatigue point per round/);
  settle(h);
  assert.equal(h.t.pendingFate().length, 1, "the Chaos roll is carried, not lost");
  assert.equal(h.t.rollTransactionActive(), false, "a pending Chaos never blocks the next roll");
  /* REWRITTEN (lot C, portage v2) : les deux assertions v1 qui suivaient
     lisaient renderStageZone() (le badge rouge) et renderDestiny() (l'Arcane
     Majeur gardé sur la ligne de Destinée). Surfaces → restent dans fh-phb.
     La DETTE, elle, est vérifiée ci-dessus et ci-dessous. */
  h.t.armPendingFate(h.t.pendingFate()[0].id);
  assert.equal(h.state.trayResults.length, 2, "resolving arms 2d6 in the tray");
  assert.equal(h.state.trayResults[0].special, "chaos", "the Chaos dice carry their own red material");
  assert.equal(h.state.trayResults[0].result, null, "they wait on ROLL — arming never rolls for the player");
  h.queueRolls(2, 5);
  h.t.rollPendingFate();
  assert.deepEqual(Array.from(entry.chaosRoll), [2, 5], "the deferred 2d6 land back on the entry that defied fate");
  assert.equal(h.t.pendingFate().length, 0, "resolving clears the marker");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("un dé de Destinée ajouté à un jet posé est stagé, et son Overreach est porté, pas lancé", () => {
  const h = makeHarness();
  // REWRITTEN (tranche 2/3): a Destiny die added to a landed roll is staged first,
  // and the Overreach save it triggers is now carried instead of rolled at once.
  h.reset(2, [h.die("rescue-d8", 8, true)]);
  const entry = {
    id: "rescue-entry", kind: "d20", name: "Arcana", ability: "INT", baseBonus: 3, d20Mode: "flat",
    d20s: [5], kept: 5, natural: 5, plusTwo: false, custom: 0, guidance: null, bardic: null,
    destiny: null, dc: "20", note: "", createdAt: new Date().toISOString(), total: 8, outcome: "Failure"
  };
  h.state.history = [entry];
  h.state.rollSequence = { phase: "open", entryId: entry.id, staged: [] };
  h.t.stageDestinyDie("rescue-d8");
  assert.equal(h.t.stagedList().length, 1, "the pool die is staged by the click, not spent by it");
  assert.equal(h.state.destiny.dice[0].available, true, "staging never spends the die");
  h.queueRolls(5);
  h.t.rollStagedDice();
  assert.deepEqual(Array.from(entry.d20s), [5]);
  assert.equal(entry.destiny.result, 5);
  // REWRITTEN (dock v6): two lines, not two popups — the staging notice is dropped
  // the moment the die it described is spent, so only the outcomes remain.
  assert.equal(h.state.events.length, 2, "the spend summary and the Overreach notice — no result line after them");
  assert.match(h.state.events[1].text, /Destiny d8 rolled 5.*Current 0/);
  assert.equal(h.state.destiny.overreach, 3);
  assert.match(latest(h).text, /INT save DC 13/);
  settle(h);
  assert.equal(h.t.pendingFate().length, 1, "the Overreach save is carried, not rolled mid-turn");
  assert.equal(h.t.pendingFate()[0].dc, 13, "the DC stays 10 + Overreach");
  assert.equal(h.t.pendingFate()[0].kind, "overreach", "Chaos and Overreach stay two separate mechanics");

  // The badge strip is always offered, and what it carries outlives CLEAR TRAY.
  h.t.addPendingFate({ kind: "note", label: "Concentration" });
  assert.equal(h.t.pendingFate().length, 2);
  h.t.clearDiceTray(true);
  assert.equal(h.t.pendingFate().length, 2, "CLEAR TRAY empties the tray, never a debt or a pinned reminder");
  assert.equal(h.derive.pendingLabel(h.t.pendingFate().find((item) => item.kind === "note")), "Concentration", "a pinned badge reads its own name");
  h.t.dropPendingFate(h.t.pendingFate().find((item) => item.kind === "note").id);
  assert.equal(h.t.pendingFate().length, 1, "cancelling a badge takes only that one");

  // The Overreach envelope resolves as a save in the tray, not as 2d6 on the Chaos table.
  h.state.character = { destinyBuild: { arcana: { name: "The Hermit" } }, build: {}, abilities: { STR: 10, DEX: 10, CON: 10, INT: 16, WIS: 10, CHA: 10 }, savingProficiencies: ["INT"], pb: 3 };
  h.t.armPendingFate(h.t.pendingFate()[0].id);
  assert.equal(h.state.trayResults.length, 1, "an Overreach arms a single d20 save");
  assert.equal(h.state.trayResults[0].sides, 20);
  assert.equal(h.state.trayResults[0].special, undefined, "and it is a plain save die, not a Chaos die");
  h.queueRolls(11);
  h.t.rollPendingFate();
  assert.equal(h.state.history[0].total, 17, "the save adds the character's own INT save bonus");
  assert.equal(h.state.history[0].outcome, "Success", "17 clears DC 13");
  assert.equal(h.t.pendingFate().length, 0, "and the marker is cleared");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("ajouter de la Destinée depuis l'historique ne relance jamais le d20 stocké", () => {
  const h = makeHarness();
  h.reset(4, [h.die("history-d4", 4, true)]);
  const entry = {
    id: "history-entry", kind: "d20", name: "Hunting", ability: "WIS", baseBonus: 4, d20Mode: "flat",
    d20s: [10], kept: 10, natural: 10, plusTwo: false, custom: 0, guidance: null, bardic: null,
    destiny: null, dc: "", note: "", createdAt: new Date().toISOString(), total: 14, outcome: ""
  };
  h.state.history = [entry];
  h.state.rollConfig = Object.assign(h.t.rollInput("Hunting", "WIS", 4, { mode: "flat" }), { editingId: entry.id, destinyDieId: "history-d4", destinyConfirmed: true });
  h.queueRolls(4);
  h.t.runConfiguredRoll();
  assert.match(latest(h).text, /∞ CRITICAL/); // REWRITTEN 2026-08-06 — L74
  assert.deepEqual(Array.from(entry.d20s), [10]);
  assert.equal(entry.destiny.result, 4);
  assert.equal(h.state.destiny.points, 3);
  assert.equal(h.state.destiny.dice[0].available, false);
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("une transaction de Destinée sérialisée reprend exactement une fois après rechargement", () => {
  const h = makeHarness();
  // REWRITTEN (dock v6): there is no queue to serialize, so what has to survive a
  // refresh is the spent die itself — the sequence no longer waits on a click.
  h.reset(5, [h.die("resume", 4, true)]);
  h.queueRolls(2, 12);
  h.state.rollConfig = Object.assign(h.t.rollInput("Hunting", "WIS", 4, { mode: "flat" }), { destinyDieId: "resume", destinyConfirmed: true });
  h.t.runConfiguredRoll();
  const pending = JSON.parse(JSON.stringify({ rollSequence: h.state.rollSequence, queueDone: h.state.queueDone, destiny: h.state.destiny, history: h.state.history, events: h.state.events }));
  Object.assign(h.state, pending);
  assert.equal(h.state.history.length, 1);
  assert.deepEqual(Array.from(h.state.history[0].d20s), [12]);
  assert.equal(h.state.destiny.dice.find((item) => item.id === "resume").available, false, "refresh cannot spend the same Destiny die twice");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("un sceau renomme le dé à chaque fois, y compris au retour vers un bonus nu", () => {
  const h = makeHarness();
  assert.equal(h.derive.sealLabel("bardic"), "Bardic");
  assert.equal(h.derive.sealLabel("other-1"), "Bonus I");
  assert.equal(h.derive.sealLabel("other-3"), "Bonus III");
  h.reset();
  h.state.rollSequence = { phase: "open", entryId: "x", staged: [{ id: "s1", kind: "bonus", label: "Bonus I", sides: 6, sourceIcon: "other-1" }] };
  h.state.history = [{ id: "x", kind: "d20", name: "Arcana", baseBonus: 0, d20s: [10], kept: 10, natural: 10, bonusDice: [], total: 10, createdAt: new Date().toISOString() }];
  h.state.diePrompt = { stagedId: "s1" };
  h.t.sealStagedDie("bardic");
  assert.equal(h.t.stagedList()[0].label, "Bardic");
  h.t.sealStagedDie("other-1");
  assert.equal(h.t.stagedList()[0].label, "Bonus I", "the label follows the seal back, instead of staying Bardic");

  /* R6 (2026-08-05): SEAL and COLOUR are ONE row of robes. Les assertions v1
     qui suivaient lisaient renderEventContent() — quelle pastille est allumée,
     quel titre au survol, une seule robe portée à la fois. Surface → reste dans
     fh-phb. L'ÉTAT que ces pastilles peignent est vérifié ici. */
  h.t.sealStagedDie("bardic");
  h.t.mutateStagedDie({ colour: "crimson" });
  assert.equal(h.t.stagedList()[0].sourceIcon, "bardic", "recolouring by hand keeps the seal — Bardic + crimson is a legal robe");
  assert.equal(h.t.stagedList()[0].colour, "crimson");
  h.t.sealStagedDie("bardic");
  assert.equal(h.t.stagedList()[0].colour, "", "choosing a seal robe dresses the whole die: the manual colour is cleared");
  h.t.clearDiceTray(true);
});

test("un dé de Destinée se prend et se repose comme un blanc ; rien n'est dépensé avant ROLL", () => {
  const h = makeHarness();
  h.reset(6, [h.die("pool-d6", 6, true)]);
  h.t.stageDestinyFromPool("pool-d6");
  assert.equal(h.state.trayPrompt, null, "no popup stands between the pool and the tray any more");
  assert.equal(h.state.destiny.dice[0].available, true, "the click spends nothing");
  assert.equal(h.state.destinyStaged.dieId, "pool-d6", "with nothing prepared it waits in the free tray");
  assert.match(latest(h).text, /Destiny d6 waits in the tray/, "a line says so");
  /* REWRITTEN (lot C, portage v2) : l'assertion v1 « et il clignote là jusqu'à
     ROLL » lisait trayDiceForDisplay(), une vue d'affichage du dock. Ce que le
     moteur garantit — le dé ATTEND, non dépensé, adressable — est ci-dessus et
     ci-dessous. Le clignotement reste vérifié dans fh-phb. */
  h.state.diePrompt = { poolId: "pool-d6" };
  assert.equal(h.t.findStagedDie(h.state.diePrompt).scope, "pool-destiny", "and a right click reaches it");
  h.t.dropStagedDie();
  assert.equal(h.state.destinyStaged, null, "cancelling takes the die back");
  assert.equal(h.state.events.length, 0, "and takes its line with it");
  // ROLL is what spends it.
  h.t.stageDestinyFromPool("pool-d6");
  h.queueRolls(4);
  h.t.rollTrayDice();
  assert.equal(h.state.destiny.dice[0].available, false, "ROLL spends the die");
  assert.equal(h.state.history[0].destiny.result, 4);
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("un échec critique arcanique est une offre : accepter laisse le +1 point debout", () => {
  const h = makeHarness();
  h.reset(3, [h.die("arc-d8", 8, true)]);
  h.queueRolls(1);
  h.state.rollConfig = Object.assign(h.t.rollInput("Arcana", "INT", 2, { mode: "flat" }), { destinyDieId: "arc-d8", destinyConfirmed: true });
  h.t.runConfiguredRoll();
  assert.equal(h.state.trayPrompt.type, "arcane1", "a 1 on a Destiny die now asks before it decides");
  assert.equal(h.t.rollTransactionActive(), true, "and it holds the roll while it asks");
  assert.equal(h.state.history.length, 0, "the d20 waits behind the question");
  assert.equal(h.settledEvents().length, 0, "et rien n'est réglé tant que la question est ouverte");
  /* REWRITTEN (lot C, portage v2) : l'assertion v1 « les deux réponses sont
     dans la fenêtre » lisait renderJudgmentFrame(). Surface → fh-phb. Le
     PROMPT qui la peint est vérifié ci-dessus. */
  h.queueRolls(12);
  h.t.resolveArcaneOne(h.state.trayPrompt.entryId, "accept");
  const entry = h.state.history[0];
  assert.equal(entry.destiny.criticalFailure, true, "accepting leaves the failure standing");
  assert.equal(h.state.destiny.points, 4, "and keeps the point it granted");
  assert.equal(entry.total, 1 + 12 + 2, "the 1 still counts as 1");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("refuser coûte ce que coûte défier un 1 naturel, et le 1 se lit comme la face maximale", () => {
  const h = makeHarness();
  h.reset(3, [h.die("arc-d8b", 8, true)]);
  h.queueRolls(1);
  h.state.rollConfig = Object.assign(h.t.rollInput("Arcana", "INT", 2, { mode: "flat" }), { destinyDieId: "arc-d8b", destinyConfirmed: true });
  h.t.runConfiguredRoll();
  h.queueRolls(12);
  h.t.resolveArcaneOne(h.state.trayPrompt.entryId, "chaos");
  const entry = h.state.history[0];
  assert.equal(entry.destiny.result, 8, "the 1 becomes the die's highest face");
  assert.equal(entry.destiny.criticalSuccess, true, "which makes it an Arcane Critical Success");
  assert.equal(h.state.destiny.points, 0, "paid for with every Destiny Point");
  assert.equal(h.t.pendingFate()[0].kind, "chaos", "and a 2d6 on the Chaos table, deferred like any other");
  assert.equal(entry.total, 8 + 12 + 2, "the total is recomputed from the face it now reads");
  assert.equal(entry.outcome, "Critical success");
  assert.equal(h.t.rollTransactionActive(), false, "answering releases the dock");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("un Portent posé sur un dé tombé réécrit l'entrée, il n'en duplique pas une seconde", () => {
  const h = makeHarness();
  h.reset(); h.queueRolls(9);
  h.state.rollConfig = h.t.rollInput("Arcana", "INT", 5, { mode: "flat", dc: 20 });
  h.t.runConfiguredRoll();
  const entry = h.state.history[0];
  const historyLength = h.state.history.length;
  assert.equal(entry.total, 14);
  assert.equal(entry.outcome, "Failure");
  const fallen = h.state.trayResults.find((item) => item.landedKey === "d20");
  assert.ok(fallen && fallen.result === 9, "the fallen d20 carries the key its menu answers to");
  /* REWRITTEN (lot C, portage v2) : l'assertion v1 « et la clef atteint le DOM »
     lisait visualDie(). Surface → fh-phb ; la CLEF, elle, est vérifiée ici et
     c'est elle qui porte tout le mécanisme. */
  h.state.diePrompt = { landedKey: "d20", entryId: entry.id };
  const landedTarget = h.t.findStagedDie(h.state.diePrompt);
  assert.equal(landedTarget.scope, "landed");
  /* REWRITTEN (lot C, portage v2) : les quatre assertions v1 sur le menu d'un
     dé tombé (Portent oui ; sceau, A/D et retrait non) lisaient
     renderEventContent(). Surface → fh-phb. Les DEUX INTERDITS que le moteur
     porte lui-même sont réaffirmés ci-dessous, sur l'état. */
  assert.equal(h.t.dropStagedDie(), undefined);
  assert.match(h.state.message, /stays in its roll/, "un dé tombé ne peut pas être retiré de son jet");
  h.t.retuneLandedDie(h.state.diePrompt, { forcedResult: 18 });
  assert.equal(h.state.history.length, historyLength, "replacing a result never opens a second stream line");
  assert.equal(entry.kept, 18);
  assert.equal(entry.natural, 18);
  assert.equal(entry.d20Forced, true, "and it is marked MANUAL");
  assert.equal(entry.total, 23);
  assert.equal(entry.outcome, "Success", "the outcome is recomputed against the DC");
  h.t.retuneLandedDie(h.state.diePrompt, { forcedResult: null });
  assert.equal(entry.kept, 9, "— as it fell — hands the roll back to the dice that rolled it");
  assert.equal(entry.d20Forced, false);
  assert.equal(entry.total, 14);
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("les tables de Chaos sont des données, et le moteur lit la ligne exacte", () => {
  const h = makeHarness();
  /* REWRITTEN (lot C, portage v2) : la v1 lisait la VRAIE table générée
     (chaos-tables.js) et assertait que la ligne 12 de STR contient « fatal ».
     Ce contenu est l'IP Fate's Hand d'Eric et n'entre pas dans ce dépôt public
     à ce stade (KICKOFF §0.8 et §3) : les tables sont désormais INJECTÉES, et
     la suite tourne sur une table-fixture neutre. Ce qui est vérifié reste la
     MÉCANIQUE de lecture — bornes, plafond, dégradation — c'est-à-dire tout ce
     que le moteur possède. Le contenu, lui, reste vérifié dans fh-phb. */
  assert.equal(h.derive.chaosRow("INT", 1).length > 0, true, "row 1 exists");
  assert.equal(h.derive.chaosRow("STR", 12), "STR fixture row 12", "row 12 is the last one");
  assert.equal(h.derive.chaosRow("STR", 99), h.derive.chaosRow("STR", 12), "the table stops at 12 and the dice do not");
  assert.equal(h.derive.chaosRow("STR", 0), h.derive.chaosRow("STR", 1), "and it starts at 1");
  assert.equal(h.derive.chaosRow("XXX", 5), "", "an unknown ability degrades to nothing rather than throwing");
  assert.match(h.derive.chaosVerdict("XXX", 5), /read the XXX Chaos table/, "et le dit — jamais un repli muet");
  assert.match(h.derive.chaosVerdict("STR", 99), /table stops at 12/, "un total au-delà du plafond le dit aussi");

  // Sans table du tout, le moteur renvoie au chapitre plutôt que de planter.
  const bare = makeHarness({ chaosTables: null });
  assert.equal(bare.derive.chaosRow("STR", 5), "");
  assert.match(bare.derive.chaosVerdict("STR", 5), /read the STR Chaos table/);
});

test("un niveau d'Épuisement est un −1 plat qui voyage sur chaque test de d20", () => {
  const h = makeHarness();
  h.reset();
  h.t.setExhaustion(2, "Test");
  assert.equal(h.t.exhaustionLevel(), 2);
  h.queueRolls(15);
  h.t.quickRoll("Arcana", "INT", 5);
  const entry = h.state.history[0];
  assert.equal(entry.exhaustion, 2, "the level is stamped on the entry as it rolls");
  assert.equal(entry.total, 15 + 5 - 2, "and comes straight off the total");
  const token = h.state.trayResults.find((item) => item.kind === "modifier" && item.label === "Exhaustion");
  assert.ok(token, "a token sits beside the dice, like the FH +2 token");
  assert.equal(token.result, -2, "carrying the malus itself");
  assert.equal(token.tone, "exhaustion", "in its own colour");
  /* REWRITTEN (lot C, portage v2) : l'assertion v1 « et il se lit comme un
     moins, pas un tiret égaré » lisait visualDie() — c'est du glyphe. Le SIGNE,
     lui, est vérifié juste au-dessus (result === -2). */
  // Changing the level afterwards must not rewrite a roll already in the stream.
  h.t.setExhaustion(5, "Test");
  assert.equal(entry.total, 18, "a roll already filed keeps the level it rolled under");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("un niveau par repos court, une fois par repos long", () => {
  const h = makeHarness();
  h.reset();
  h.t.setExhaustion(3, "Test");
  h.t.setVitals({ shortRestUsed: false });
  h.state.vitals.shortRestUsed = true;
  assert.equal(h.t.exhaustionLevel(), 3, "a spent short rest cannot clear a level");
  h.t.setVitals({ shortRestUsed: false });
  h.t.setExhaustion(h.t.exhaustionLevel() - 1, "Short rest");
  assert.equal(h.t.exhaustionLevel(), 2, "a fresh one can");
});

test("refuser le destin va droit aux 2d6 — aucune sauvegarde d'Overreach sur ce chemin", () => {
  const h = makeHarness();
  h.reset(4);
  const entry = natOne("refuse-chaos");
  entry.ability = "INT";
  h.state.history = [entry];
  h.state.rollSequence = { phase: "nat1", entryId: entry.id };
  h.t.resolveNatOne(entry.id, "chaos");
  settle(h);
  assert.equal(h.t.pendingFate()[0].ability, "INT", "the marker remembers which table to read");
  h.t.armPendingFate(h.t.pendingFate()[0].id);
  assert.equal(h.state.trayResults.length, 2, "2d6, not a save");
  h.queueRolls(4, 5);
  h.t.rollPendingFate();
  const chaosEntry = h.state.history[0];
  assert.equal(chaosEntry.total, 9);
  assert.equal(chaosEntry.chaosRow, h.derive.chaosRow("INT", 9), "the row is quoted onto the entry");
  assert.match(latest(h).text, /CHAOS RESOLVED · 2d6 = 4 \+ 5 = 9/, "and announced with the row");
  assert.ok(latest(h).text.indexOf(h.derive.chaosRow("INT", 9)) > 0, "the line carries the row text itself, not a link");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("tenir la Trame coûte un niveau d'Épuisement ; l'échouer coûte à la table", () => {
  const h = makeHarness();
  h.reset(2, [h.die("hold-d8", 8, true)]);
  h.state.character = { destinyBuild: { arcana: { name: "The Hermit" } }, build: {}, abilities: { STR: 10, DEX: 10, CON: 10, INT: 16, WIS: 10, CHA: 10 }, savingProficiencies: ["INT"], pb: 3 };
  h.t.addPendingFate({ kind: "overreach", entryId: "x", ability: "INT", dc: 13, overreach: 3 });
  h.t.armPendingFate(h.t.pendingFate()[0].id);
  h.queueRolls(11);
  h.t.rollPendingFate();
  assert.equal(h.state.history[0].outcome, "Success", "17 clears DC 13");
  assert.equal(h.t.exhaustionLevel(), 1, "a successful Overreach save costs one level of Exhaustion");
  assert.match(latest(h).text, /EXHAUSTION 1/);
  settle(h);
  assert.equal(h.queueEmpty(), 0);

  // Failing it rolls 1d6 + Overreach on the table, with a red token for the Overreach.
  h.reset(2);
  h.state.character = { destinyBuild: { arcana: { name: "The Hermit" } }, build: {}, abilities: { STR: 10, DEX: 10, CON: 10, INT: 16, WIS: 10, CHA: 10 }, savingProficiencies: ["INT"], pb: 3 };
  h.t.addPendingFate({ kind: "overreach", entryId: "y", ability: "INT", dc: 18, overreach: 8 });
  h.t.armPendingFate(h.t.pendingFate()[0].id);
  h.queueRolls(2, 5);
  h.t.rollPendingFate();
  assert.equal(h.state.history[1].outcome, "Failure", "7 misses DC 18");
  assert.equal(h.t.exhaustionLevel(), 0, "a failed save costs no Exhaustion — it costs the table");
  const breakEntry = h.state.history[0];
  assert.equal(breakEntry.dice[0].result, 5, "the d6");
  assert.equal(breakEntry.flatBonus, 8, "plus the Overreach");
  assert.equal(breakEntry.total, 13, "read as 13");
  assert.equal(breakEntry.chaosRow, h.derive.chaosRow("INT", 13), "which reads row 12, the table's last");
  const redToken = h.state.trayResults.find((item) => item.kind === "modifier");
  assert.ok(redToken && redToken.tone === "overreach", "the Overreach sits beside the die as a red token");
  assert.equal(redToken.result, 8);
  assert.match(latest(h).text, /CHAOS · d6 5 \+ Overreach 8 = 13/);
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});

test("M1 : une robe scellée est dépensée sur UN jet ; ROLL sans rien de stagé répète le test nu", () => {
  const h = makeHarness();
  /* M1 (décision Eric 2026-08-06): a seal robe is spent on ONE jet only. ROLL on
     an open roll with nothing staged repeats the CHECK — it does not re-inherit
     the last jet's bonus dice, or the three slots would fill one selection at a
     time and never come back (the white picker ended permanently greyed). */
  h.reset(); h.queueRolls(12, 4);
  h.state.rollConfig = h.t.rollInput("Performance", "CHA", 2, { mode: "flat" });
  h.state.rollConfig.bonusDice = [{ id: "m1-bardic", label: "Bardic", sides: 6, sourceIcon: "bardic", advantageMode: "flat", forcedResult: null }];
  h.t.runConfiguredRoll();
  const entry = h.state.history[0];
  assert.equal(entry.bardic.result, 4, "jet 1 carries its Bardic die");
  assert.equal(h.t.rollOpen(), true, "and stays open behind ROLL");
  h.queueRolls(9);
  h.t.rollStagedDice(); // nothing staged → repeat the check
  const repeated = h.state.history[0];
  assert.notEqual(repeated.id, entry.id, "ROLL with nothing staged rolls a fresh entry");
  assert.equal(repeated.bonusDice.length, 0, "the next jet starts with the bare d20 — last jet's boons are not carried");
  assert.equal(repeated.bardic, null, "no Bardic ghost re-added from the entry's flags");
  assert.equal(h.state.rollConfig.bardic, false, "the config's bardic flag is cleared with the die");
  // The robe really is available again: seal a new die Bardic on the next jet.
  h.t.stageBonusDie(6, "", "");
  h.state.diePrompt = { stagedId: h.t.stagedList()[0].id };
  h.t.sealStagedDie("bardic");
  assert.equal(h.t.stagedList()[0].sourceIcon, "bardic", "the Bardic robe is back and takes the new die");
  assert.equal(h.t.stagedList()[0].label, "Bardic", "and renames it, as a seal always does");
  settle(h);
  assert.equal(h.queueEmpty(), 0);
});
