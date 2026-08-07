/* Suite portée de fh-phb `tests/dice-pool-resources.test.js` (250 l., main),
   moitié MOTEUR.

   Phase 4 : la réserve COMPTÉE. « Dice Pool ≠ Dice Selector » — une réserve de
   ressources de jeu comptées, notée comme l'inspiration. Ce que cette suite
   épingle, et qui appartient entièrement au bloc `play` :
     - dépenser un DÉ UNIQUE stage un dé teinté/scellé et vide la pastille ;
     - dépenser un COMPTEUR stage le dé de sa nature (Tactical → le sceau
       cramoisi, la robe même qu'un dé scellé à la main porte) et décrémente ;
     - une dépense est ANNULABLE : chaque chemin de reprise re-crédite ;
     - ROLL rend la dépense définitive — un dé de réserve lancé ne revient pas.

   Ce qui n'est PAS venu : la persistance (`persistPlayState`/`loadPlayState`/
   `storageKey` — `play` ne persiste rien, le document s'en charge), la carte
   d'identité d'une ressource et la bande repliée en +N (`renderPoolCard`,
   `renderPoolStrip`, les champs de saisie) — des surfaces, restées dans
   fh-phb. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHarness } from "./play-harness.mjs";

const bardic = { id: "res-Bardic", label: "Bardic", kind: "die", sides: 8, tint: "violet", count: 1 };
const tactical = { id: "res-Tactical", label: "Tactical", kind: "count", sides: 10, tint: "crimson", count: 2 };

function pooled(resources) {
  const h = makeHarness();
  h.reset(5, [h.die("gold-d4", 4, true)]);
  h.state.campaign = "FH1";
  h.state.pseudo = "Harness";
  h.state.poolResources = h.t.normalizePoolResources(resources);
  return h;
}

test("le modèle : un dé unique est un compte de 1, un compteur garde son N", () => {
  const h = pooled([bardic, tactical]);
  assert.equal(h.t.poolList().length, 2);
  assert.deepEqual(h.t.poolList().map((r) => r.count), [1, 2]);
  assert.equal(h.t.poolList()[1].tint, "crimson");
  /* REWRITTEN (lot C, portage v2) : les quatre assertions v1 sur la
     persistance — la réserve sauvegardée avec le reste de l'état local, un
     rechargement qui la restaure, et une clef par campagne ET par personnage —
     portaient sur `persistPlayState`/`loadPlayState`/`storageKey`. Le bloc
     `play` ne persiste RIEN (règle de persistance n°4) : ce que la séance rend
     au document passe par `snapshot`, et c'est lui qui est vérifié ci-dessous.
     La clef de stockage devra être re-tenue par le bloc `doc`. */
  const kept = h.play.verbs.snapshot();
  assert.deepEqual(kept.poolResources.map((r) => r.label), ["Bardic", "Tactical"], "la réserve fait partie de ce que la séance rend");
});

test("dépenser un dé unique AU REPOS : il attend dans la main libre, teinté et nommé", () => {
  const h = pooled([bardic]);
  h.t.spendPoolResource("res-Bardic");
  assert.equal(h.state.traySelection.length, 1, "the die waits in the free hand");
  const freeDie = h.state.traySelection[0];
  assert.equal(freeDie.sides, 8);
  assert.equal(freeDie.colour, "violet", "the Bardic seal's tint dresses the staged die");
  assert.equal(freeDie.label, "Bardic", "the hand names the die, not a bare d8");
  assert.equal(freeDie.poolResourceId, "res-Bardic");
  assert.equal(h.t.poolList()[0].count, 0, "the resource is spent the moment it is staged");
  assert.equal(h.derive.visiblePoolResources().length, 0, "…so its pastille disappears from the band");
  /* REWRITTEN (lot C, portage v2) : deux assertions v1 sont parties avec leur
     surface — `state.builderOpen` (dépenser au repos invoque l'assemblage) et
     `renderPoolStrip() === ""` (une réserve vidée ne rend aucune bande). Le
     premier est de l'ouverture d'overlay, le second du HTML ; l'ÉTAT que les
     deux peignaient — la ressource à zéro, la pastille invisible — est tenu
     par les deux lignes juste au-dessus. */

  // ── Cancelling before ROLL re-credits (white picker's take-back) ──
  h.t.removeTrayDie(0);
  assert.equal(h.t.poolList()[0].count, 1, "taking the die back re-credits the resource");
  assert.equal(h.derive.visiblePoolResources().length, 1, "…and the pastille returns");

  // ── Cancelling via CLEAR TRAY re-credits too ──
  h.t.spendPoolResource("res-Bardic");
  assert.equal(h.t.poolList()[0].count, 0);
  h.t.clearDiceTray(true);
  assert.equal(h.t.poolList()[0].count, 1, "CLEAR TRAY hands every waiting pool die back");

  // ── ROLL makes it final ──
  h.t.spendPoolResource("res-Bardic");
  h.queueRolls(5);
  h.t.rollTrayDice();
  assert.equal(h.state.history.length, 1);
  assert.equal(h.state.history[0].dice.length, 1);
  assert.equal(h.state.history[0].dice[0].result, 5);
  assert.equal(h.state.traySelection.some((d) => d.poolResourceId), false, "the kept hand sheds its pool dice — one use is one use");
  h.t.prunePoolResources();
  assert.equal(h.t.poolList().length, 0, "rolled and unreferenced, the spent resource is pruned for good");
  assert.equal(h.queueEmpty(), 0);
});

test("un compteur pendant un jet OUVERT : le sceau Tactical, reproduit", () => {
  const h = pooled([tactical]);
  h.queueRolls(10);
  h.t.quickRoll("Tactics", "INT", 4, "");
  assert.equal(h.t.rollOpen(), true, "the check landed and stays open");
  h.t.spendPoolResource("res-Tactical");
  assert.equal(h.t.poolList()[0].count, 1, "×2 → ×1 on the spot");
  const staged = h.t.stagedList();
  assert.equal(staged.length, 1);
  assert.equal(staged[0].sides, 10);
  assert.equal(staged[0].sourceIcon, "tactical", "crimson stages the tactical seal — the warrior's die, as a hand-sealed one would");
  assert.equal(staged[0].poolResourceId, "res-Tactical");
  h.queueRolls(7);
  h.t.rollStagedDice();
  const entry = h.t.openEntry();
  assert.equal(h.derive.trayDice(entry).filter((d) => d.dieRole === "bonus").length, 1, "ROLL folds the pool die into the same entry");
  assert.equal(entry.bonusDice[0].result, 7);
  assert.equal(entry.bonusDice[0].sourceIcon, "tactical");
  assert.equal(h.t.poolList()[0].count, 1, "the decrement stands — nothing double-charges at ROLL");
  assert.equal(h.derive.visiblePoolResources().length, 1, "×1 remains on the band");

  // ── Cancelling a staged spend mid-roll re-credits (die menu's Remove) ──
  h.t.spendPoolResource("res-Tactical");
  assert.equal(h.t.poolList()[0].count, 0);
  h.state.diePrompt = { stagedId: h.t.stagedList()[0].id };
  h.t.dropStagedDie();
  assert.equal(h.t.poolList()[0].count, 1, "Remove this die gives the use back");

  // …and the white picker's right click (unstageDie) does the same.
  h.t.spendPoolResource("res-Tactical");
  assert.equal(h.t.poolList()[0].count, 0);
  assert.equal(h.t.unstageDie(10), true);
  assert.equal(h.t.poolList()[0].count, 1, "the picker's take-back re-credits too");
  h.t.clearDiceTray(true);
  assert.equal(h.queueEmpty(), 0);
});

test("une ressource vidée survit tant qu'un de ses dés attend, et pas une seconde de plus", () => {
  const h = pooled([bardic]);
  h.t.spendPoolResource("res-Bardic");
  assert.equal(h.t.poolList()[0].count, 0);
  h.t.prunePoolResources();
  assert.equal(h.t.poolList().length, 1, "elle reste, invisible : un dé à elle attend dans la main");
  h.t.removeTrayDie(0);
  assert.equal(h.t.poolList()[0].count, 1, "reprise → re-créditée");
  h.t.prunePoolResources();
  assert.equal(h.t.poolList().length, 1, "et elle reste, visible cette fois");
});
