/* ══ LES TESTS D'ACCEPTATION DU LOT 16 ═══════════════════════════════
   Deux écarts entre les règles de Destinée d'Eric et le moteur, mesurés le
   2026-08-08 en confrontant le chapitre 3 au code — ni le code seul ni les
   règles seules ne les auraient montrés.

     A. LE SCORE NE PLAFONNAIT RIEN. `state.destiny.score` existait, un Arcane
        majeur le montait, et `setDestinyPoints` ne le consultait JAMAIS.
     B. LA VIBRATION AVAIT ÉTÉ PERDUE AU PORTAGE. Zéro occurrence dans `src/`,
        alors que le dock v1 la portait pour les 22 Arcanes majeurs.

   Les règles qui font foi ici sont celles qu'Eric a tranchées phrase par
   phrase le 2026-08-08 (logbook « FHV2 - Couche FH », chapitre 3), adossées à
   `D&D 5+ Fate's Hand Mechanic.md` §2 et §3 et à `The Major Arcana.md`.

   ⚠️ CE QUE CETTE SUITE PROTÈGE AUSSI, ET QUI EST UNE ERREUR DÉJÀ COMMISE :
   Éveil ≠ Vibration. Un critique arcanique ne déclenche PAS d'Éveil, et le
   moteur avait raison. Le dernier test de ce fichier est là pour que personne
   ne « répare » ça. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHarness, fhCharacter } from "./play-harness.mjs";

/* Un personnage dont l'Arcane est connu, et dont le choix porte un TEXTE
   PIÈGE. Aucun test ne demande ce texte : il est là pour qu'on puisse exiger
   qu'il ne ressorte NULLE PART. Si un jour le moteur se met à lire le contenu
   d'une carte, c'est cette chaîne qui le dira.

   REWRITTEN 2026-08-09 (lot 21) — LE PIÈGE A CHANGÉ DE PLACE PARCE QUE LA
   CARTE A CHANGÉ DE PLACE. Il vivait sur `destinyBuild.arcana.vibration`, un
   objet-carte recopié dans la fiche : un chemin v1 que le schéma `fh-char/1`
   ne connaît pas. En v2 le personnage ne PORTE pas sa carte, il la NOMME par
   un `ref` — le seul mot du document qui pourrait fuir est le `label` du
   choix, et c'est donc là que le piège se pose désormais. L'assertion n'est
   pas relâchée : elle vise le même fait — aucun mot de carte ne traverse le
   moteur — sur le seul endroit du document v2 où un mot existe encore. */
const PROBE_VIBRATION = "PROBE — Silent Image, and no engine should ever read this";
/* ⚠️ CES DEUX-LÀ S'APPLIQUENT APRÈS `reset()`, JAMAIS AVANT — `reset()`
   RESÈME `state.character` avec sa propre fiche, et un Arcane posé avant lui
   est un Arcane écrasé. Mesuré ici même : les deux premières versions de ce
   fichier étaient VERTES en testant l'Arcane du harnais au lieu du leur, donc
   le texte piège ci-dessus n'avait jamais approché le moteur. */
const withArcana = (h) => {
  h.state.character = fhCharacter({ name: "Probe", arcana: "fh:arcana:en:the-hermit", label: PROBE_VIBRATION });
  assert.equal(h.t.arcanaKnown(), true, "le document v2 nomme bien une carte par le chemin ratifié");
  return h;
};
const withoutArcana = (h) => {
  h.state.character = fhCharacter({ name: "Probe", arcana: null });
  assert.equal(h.t.arcanaKnown(), false, "la fiche du harnais porte un Arcane : le retirer est le sujet du test");
  return h;
};
const eventText = (h) => h.state.events.map((event) => event.text).join(" ⏎ ");

/* ══════════════════════════════════════════════════════════════════════
   A — LE SCORE PLAFONNE LA RÉCUPÉRATION, ET RIEN D'AUTRE
   ══════════════════════════════════════════════════════════════════════ */

test("le repos long rend UN point — le seul nombre que la règle écrite chiffre", () => {
  /* ⚠️ AJOUTÉ LE 2026-08-08 (RELECTEUR Adverserial, seconde passe). Le test
     d'acceptation A cite §2 (« Long rest: regain +1 Destiny Point ») dans son
     message, mais il mesure une récupération QUI EST DÉJÀ BORNÉE PAR LE SCORE :
     à 3 points sous un Score 4, +1 et +2 donnent tous deux 4, et la ligne
     « 1 Destiny Point not recovered » est la même dans les deux cas. Mesuré :
     `LONG_REST_RECOVERY = 2` laissait les 409 tests VERTS. Le +1 était donc
     une intention, pas une garantie.

     Il se pince ici, SOUS le plafond, là où le nombre est seul à décider. */
  const h = makeHarness();
  h.reset(3, [h.die("d4", 4, false)]);
  h.state.destiny.score = 8;

  assert.equal(h.verbs.recoverDestiny(), 4, "§2 : un repos long rend UN point, et un seul");
  assert.equal(h.state.destiny.points, 4);
  assert.equal(/RECOVERY CAPPED/.test(eventText(h)), false,
    "sous le Score, rien n'est plafonné : c'est le +1 qu'on mesure, pas la borne");

  /* Et ce qu'une couche ACCORDE en plus arrive par le paramètre — le moteur ne
     le devine pas (Humain : 2/jour). Les deux chemins sont donc distingués. */
  assert.equal(h.verbs.recoverDestiny({ amount: 2 }), 6, "3 + 1 + 2 : le nombre accordé passe par l'argument");
  assert.equal(h.queueEmpty(), 0);
});

test("ACCEPTATION A — Score 4, 3 points, repos long : il monte à 4, pas à 5", () => {
  const h = makeHarness();
  /* Le d4 est DÉPENSÉ : le total pair rendra le plus bas manquant, et ça permet
     de vérifier que le plafond n'a pas mangé la récupération de dé au passage. */
  h.reset(3, [h.die("rest-d4", 4, false), h.die("rest-d6", 6, true)]);
  h.state.destiny.score = 4;

  assert.equal(h.verbs.recoverDestiny(), 4, "§2 : « Long rest: regain +1 Destiny Point »");
  assert.equal(h.state.destiny.points, 4);
  assert.equal(h.state.destiny.dice.find((die) => die.id === "rest-d4").available, true,
    "4 est pair : le dé le plus bas manquant revient");
  assert.match(eventText(h), /Gained 1 Destiny Point/);

  /* LE PLAFOND MORD, et il le DIT. Un repos long qui ne rend rien serait sinon
     indiscernable d'un repos qu'on a oublié de demander. */
  const capped = h.verbs.recoverDestiny();
  assert.equal(capped, 4, "un second repos ne franchit pas le Score");
  assert.match(eventText(h), /RECOVERY CAPPED · Destiny Score 4 · 1 Destiny Point not recovered · Current 4/);

  /* ET LE CAS D'ERIC, MOT POUR MOT : « il monte à 4, PAS à 5 ». Il faut une
     récupération de 2 pour que 5 soit seulement atteignable — c'est le trait
     Twice-Born de l'Humain (2 points par jour), dont le nombre descend de la
     couche et n'est pas deviné par le moteur. */
  const human = makeHarness();
  human.reset(3, [human.die("h-d4", 4, true)]);
  human.state.destiny.score = 4;
  assert.equal(human.verbs.recoverDestiny({ amount: 2 }), 4, "3 + 2 = 5, borné à 4 par le Score");
  assert.match(eventText(human), /RECOVERY CAPPED · Destiny Score 4 · 1 Destiny Point not recovered/);
  assert.equal(h.queueEmpty(), 0);
  assert.equal(human.queueEmpty(), 0);
});

test("ACCEPTATION A — un Arcane mineur de valeur 10 passe le plafond, et l'excédent RESTE", () => {
  /* §2 : « The exceptions — Arcana cards and Natural 1s — grant temporary
     points that may push you above your Score. » Et Eric : « ce qui dépasse le
     Score reste jusqu'à ce qu'on le dépense ». */
  const h = makeHarness();
  h.reset(3, [h.die("arc-d6", 6, true)]);
  h.state.destiny.score = 4;
  h.state.destiny.awakeningOwed = 1;

  h.verbs.settleAwakening({ card: { id: "seven-of-cups", arcana: "minor", points: 10, brick: true } });
  assert.equal(h.state.destiny.points, 13, "3 + 10 : la pioche ne connaît pas de plafond");
  assert.equal(h.state.destiny.score, 4, "et un MINEUR ne monte pas le Score — seul un majeur le fait");

  /* Une récupération, au-dessus du Score, ne rend rien — et ne fait surtout pas
     REDESCENDRE. « Le Score plafonne la récupération », il ne rabote pas ce qui
     est déjà là. */
  assert.equal(h.verbs.recoverDestiny(), 13, "au-dessus du Score, il n'y a plus rien à récupérer");
  assert.equal(h.state.destiny.points, 13, "et surtout : le plafond ne reprend pas l'excédent");

  // L'excédent ne s'évapore pas : il se DÉPENSE.
  h.queueRolls(5);
  const spent = h.t.spendDestinyDie("arc-d6", true);
  assert.equal(spent.result, 5);
  assert.equal(h.state.destiny.points, 8, "13 − 5 : c'est la dépense qui le fait redescendre, et elle seule");
  assert.equal(h.queueEmpty(), 0);
});

test("ACCEPTATION A — un 1 naturel accepté (+1) passe au-dessus du Score", () => {
  const h = makeHarness();
  h.reset(4, [h.die("nat-d6", 6, true)]);
  withArcana(h);
  h.state.destiny.score = 4;

  h.queueRolls(1);
  h.verbs.prepare({ name: "Athletics", ability: "STR", bonus: 2, dc: 15 });
  h.verbs.roll();
  const entry = h.state.history[0];
  assert.equal(h.state.trayPrompt.type, "nat1", "un 1 naturel pose une question avant de décider");

  h.verbs.resolveNatOne({ entryId: entry.id, choice: "accept" });
  assert.equal(h.state.destiny.points, 5, "§2 : un 1 naturel accepté rend un point TEMPORAIRE, qui dépasse le Score 4");
  assert.equal(h.queueEmpty(), 0);
});

test("ACCEPTATION A — le +1 de l'« Accept » sur un dé de Destinée passe lui aussi", () => {
  /* §3.4, tranché par Eric le 2026-08-08 : ce +1 est TEMPORAIRE. C'est la
     troisième source nommée, et celle qui manquait au chapitre. */
  const h = makeHarness();
  h.reset(4, [h.die("one-d8", 8, true)]);
  withArcana(h);
  h.state.destiny.score = 4;

  h.queueRolls(1);
  const spent = h.t.spendDestinyDie("one-d8", true);
  assert.equal(spent.criticalFailure, true);
  assert.equal(h.state.destiny.points, 5, "le +1 est accordé à l'instant où le 1 tombe, au-dessus du Score");
  assert.equal(h.queueEmpty(), 0);
});

test("ATTAQUE — une HAUSSE qui ne déclare pas d'où elle vient est refusée en la nommant", () => {
  /* Le garde de l'écart A. Sans lui, le prochain chemin de gain choisirait un
     camp EN SILENCE — ce qui est exactement l'état d'avant ce lot, où toute
     hausse échappait au Score. Violé une fois, et l'arbre est restauré après. */
  const h = makeHarness();
  h.reset(3);
  h.state.destiny.score = 4;

  assert.throws(
    () => h.t.setDestinyPoints(10, "smuggled", true, true),
    /must declare where it comes from/,
    "une hausse sans nature doit ROUGIR, et nommer les trois natures possibles"
  );
  assert.throws(() => h.t.setDestinyPoints(10, "smuggled", true, true, "borrowed"), /borrowed/,
    "et une nature inventée est citée telle qu'elle a été écrite");
  assert.equal(h.state.destiny.points, 3, "l'arbre est restauré : le refus n'a rien bougé");

  // Une BAISSE, elle, n'a pas de nature — dépenser n'est jamais plafonné.
  assert.equal(h.t.setDestinyPoints(1, "spent", true, true), null);
  assert.equal(h.state.destiny.points, 1, "descendre ne demande aucune déclaration");
  // Et une hausse déclarée passe, dans les deux natures légales.
  h.t.setDestinyPoints(4, "rest", true, true, h.fh.GAIN_RECOVERED);
  assert.equal(h.state.destiny.points, 4);
  h.t.setDestinyPoints(9, "card", true, true, h.fh.GAIN_TEMPORARY);
  assert.equal(h.state.destiny.points, 9, "un temporaire n'est borné par rien");
  assert.equal(h.queueEmpty(), 0);
});

test("une récupération d'un nombre illégal JETTE plutôt que de retomber sur 1", () => {
  /* Un repos silencieux qui rend le mauvais nombre de points est pire qu'un
     refus bruyant : personne ne le voit passer, et le Score qui le borne rend
     l'erreur presque invisible. */
  const h = makeHarness();
  h.reset(3);
  [-1, 1.5, "deux", NaN].forEach((amount) => {
    assert.throws(() => h.verbs.recoverDestiny({ amount }),
      /whole, non-negative number of Points/, "récupération illégale : " + String(amount));
  });
  assert.equal(h.state.destiny.points, 3, "et rien n'a bougé");
  assert.equal(h.queueEmpty(), 0);
});

/* ══════════════════════════════════════════════════════════════════════
   B — LA VIBRATION
   ══════════════════════════════════════════════════════════════════════ */

test("ACCEPTATION B — le maximum d'un d8 signale une Vibration de niveau 3, sans nommer aucun sort", () => {
  const h = makeHarness();
  h.reset(6, [h.die("vib-d8", 8, true)]);
  withArcana(h);

  h.queueRolls(8);
  const spent = h.t.spendDestinyDie("vib-d8", true);
  assert.equal(spent.criticalSuccess, true, "le maximum d'un dé de Destinée est un critique arcanique");
  assert.deepEqual(spent.vibration, { sides: 8, level: 3 }, "`The Major Arcana` : d8 → niveau 3");
  assert.deepEqual(Object.keys(spent.vibration).sort(), ["level", "sides"],
    "le moteur porte la MÉCANIQUE : une taille de dé et un niveau, jamais un effet");

  // La ligne annoncée l'OFFRE — la Vibration est optionnelle (« an optional temporary effect »).
  const specs = h.t.destinyEventSpecs(spent, "vib-entry");
  assert.match(specs[0].text, /VIBRATION · d8 · spell level 3 · optional/);

  /* LA PREUVE QUE LE CONTENU N'ENTRE PAS : la carte du personnage porte un
     texte piège, et il ne doit ressortir nulle part — ni dans la ligne, ni
     dans le relevé, ni dans le badge. */
  const surfaces = JSON.stringify(spent) + specs.map((spec) => spec.text).join(" ");
  assert.equal(surfaces.includes("Silent Image"), false, "aucun sort n'est nommé par le moteur");
  assert.equal(surfaces.includes("PROBE"), false, "et rien du texte de la carte n'a été lu");
  assert.equal(h.queueEmpty(), 0);
});

test("ACCEPTATION B — la table entière : d4→1, d6→2, d8→3, d10→4, d12→5", () => {
  /* Le même maximum sur un d12 donne une Vibration de niveau 5 — c'est la
     seconde moitié du test d'acceptation, et les cinq lignes tiennent ensemble
     ou aucune ne tient. */
  [[4, 1], [6, 2], [8, 3], [10, 4], [12, 5]].forEach(([sides, level]) => {
    const h = makeHarness();
    h.reset(6, [h.die("d" + sides, sides, true)]);
    withArcana(h);
    h.queueRolls(sides);
    const spent = h.t.spendDestinyDie("d" + sides, true);
    assert.deepEqual(spent.vibration, { sides, level }, "d" + sides + " → niveau de sort " + level);
    assert.equal(spent.cost, 1, "et le critique arcanique ne coûte toujours qu'un point (§1)");
    assert.equal(h.queueEmpty(), 0);
  });
});

test("ATTAQUE — un dé hors de la table JETTE plutôt que d'inventer un niveau", () => {
  /* La table s'arrête au d12. Choisir un niveau pour un dé que les règles
     n'ont jamais dimensionné serait inventer une règle — et §6 du lot dit
     exactement le contraire. */
  const h = makeHarness();
  h.reset(6, [h.die("rogue-d20", 20, true)]);
  withArcana(h);
  h.queueRolls(20);
  assert.throws(() => h.t.spendDestinyDie("rogue-d20", true),
    /no Vibration spell level is written for a d20/,
    "un dé hors table doit rougir en se nommant");
  assert.equal(h.queueEmpty(), 0);

  /* ⚠️ AJOUTÉ LE 2026-08-08 (RELECTEUR Adverserial, seconde passe). L'ancienne
     version de ce test s'arrêtait au `throws` — et le refus MANGEAIT LE DÉ.
     `spendDestinyDie` posait `die.available = false` AVANT de calculer la
     Vibration : le refus partait, le dé restait dépensé, aucun point n'était
     retiré et aucune ligne n'était annoncée. Un joueur perdait un dé de
     Destinée sur une erreur du moteur, sans rien pour le lui dire.

     La doctrine est écrite deux fois dans ce fichier même — « l'arbre est
     restauré : le refus n'a rien bougé », « et rien n'a bougé ». Elle vaut ici
     aussi, et c'est ce qui est vérifié maintenant. */
  assert.equal(h.state.destiny.dice.find((die) => die.id === "rogue-d20").available, true,
    "un refus ne DÉPENSE pas le dé qu'il refuse de résoudre");
  assert.equal(h.state.destiny.points, 6, "…ne retire aucun point…");
  assert.deepEqual(h.state.events, [], "…et n'annonce rien : il n'y a rien à annoncer");

  /* LE TÉMOIN : le refus n'a pas non plus rendu le moteur inutilisable. Le
     même dé, rendu légal, se dépense normalement — sans quoi « l'arbre est
     restauré » ne voudrait rien dire. */
  h.state.destiny.dice = [h.die("bon-d12", 12, true)];
  h.queueRolls(12);
  const spent = h.t.spendDestinyDie("bon-d12", true);
  assert.deepEqual(spent.vibration, { sides: 12, level: 5 });
  assert.equal(h.queueEmpty(), 0);
});

test("sans Arcane connu il n'y a aucune Vibration — et le critique arcanique a lieu quand même", () => {
  /* « an effect listed on YOUR Arcana » : sans carte, il n'y a pas d'effet
     listé. Ce n'est pas un repli silencieux, c'est la condition de la règle —
     et surtout, ça ne change RIEN au reste du critique. */
  const h = makeHarness();
  h.reset(6, [h.die("bare-d10", 10, true)]);
  withoutArcana(h);
  h.queueRolls(10);
  const spent = h.t.spendDestinyDie("bare-d10", true);
  assert.equal(spent.criticalSuccess, true, "le critique arcanique, lui, ne dépend d'aucune carte");
  assert.equal(spent.vibration, null, "mais aucun effet n'est listé, donc rien n'est signalé");
  assert.equal(h.state.destiny.points, 5, "et il coûte son point, comme toujours");
  const specs = h.t.destinyEventSpecs(spent, "bare-entry");
  assert.equal(/VIBRATION/.test(specs[0].text), false, "la ligne ne promet pas un effet qui n'existe pas");
  assert.equal(h.queueEmpty(), 0);
});

test("la Vibration traverse un jet complet et atteint la ligne du flux", () => {
  /* Le chemin réel : une console qui porte un dé de Destinée, ROLL, et le
     badge dérivé de l'entrée. Une mécanique qui ne marche que par un appel
     interne est une mécanique à moitié portée — c'est ce qui est arrivé à la
     Vibration entre la v1 et la v2. */
  const h = makeHarness();
  h.reset(6, [h.die("roll-d12", 12, true)]);
  withArcana(h);
  h.queueRolls(12, 14);
  h.state.rollConfig = Object.assign(
    h.t.rollInput("Arcana", "INT", 2, { mode: "flat" }),
    { destinyDieId: "roll-d12", destinyConfirmed: true }
  );
  h.t.runConfiguredRoll();

  const entry = h.state.history[0];
  assert.deepEqual(entry.destiny.vibration, { sides: 12, level: 5 }, "d12 → niveau 5, sur l'entrée elle-même");
  assert.match(h.state.events.map((event) => event.text).join(" "), /VIBRATION · d12 · spell level 5/);
  const badge = h.derive.badges(entry).find((item) => item.id === "vibration");
  assert.equal(badge.t, "Vibration · d12 · spell level 5", "et la table la lit sur la ligne du jet");
  assert.equal(badge.spoiler, true);
  assert.equal(h.queueEmpty(), 0);
});

test("RÉGRESSION — un critique arcanique n'est PAS un Éveil, et le moteur avait raison", () => {
  /* L'erreur commise puis retirée le 2026-08-08. Les deux mécaniques n'ont ni
     le même déclencheur ni le même effet :

       · Éveil     — Points à 0 APRÈS UN 20 NATUREL AU D20 → pioche dans les 78
       · Vibration — un critique arcanique → l'effet listé sur TON Arcane

     Ce test existe pour que personne ne « répare » ce qui n'est pas cassé. */
  const h = makeHarness();
  h.reset(1, [h.die("last-d6", 6, true)]);
  withArcana(h);

  h.queueRolls(6);
  const spent = h.t.spendDestinyDie("last-d6", true);
  assert.equal(h.state.destiny.points, 0, "le critique arcanique coûte son point et vide la réserve");
  assert.deepEqual(spent.vibration, { sides: 6, level: 2 }, "il donne une Vibration");
  assert.equal(h.state.destiny.awakeningOwed, 0, "ET AUCUN ÉVEIL N'EST DÛ — le déclencheur de l'Éveil est un 20 NATUREL");

  // Le vrai déclencheur, lui, marche toujours : 20 naturel qui amène à 0.
  const awake = makeHarness();
  awake.reset(1);
  const events = awake.t.naturalDestiny({ id: "nat20", natural: 20 });
  assert.equal(awake.state.destiny.awakeningOwed, 1, "20 naturel à 1 point : l'Éveil, lui, est bien dû");
  assert.equal(events[0].kind, "awakening");
  assert.equal(h.queueEmpty(), 0);
});

/* ══ LA RÉSERVE VA DU d4 AU d12 — RÈGLE D'ERIC, 2026-08-08 ═══════════════
   Réponse à la question que le RELECTEUR Adverserial avait laissée ouverte
   plutôt que de l'inventer : « pour FH tu bornes du d4 au d12 ».

   Ce test existe parce que le verbe manuel était la SEULE porte par laquelle
   un dé hors table entrait dans une réserve — la lecture d'un personnage
   ramenait déjà tout dé étranger dans la séquence. */

test("ATTAQUE — le verbe manuel REFUSE un dé hors de la séquence, et ne touche à rien", () => {
  const h = makeHarness();
  h.reset(6);
  const avant = h.state.destiny.dice.map((die) => die.sides + ":" + die.available).join(",");

  for (const sides of [20, 3, 100, 0]) {
    assert.throws(() => h.t.adjustDestinyDie(sides, 1),
      /a Destiny die is a d4/,
      `un d${sides} doit être refusé en nommant les dés admis`);
  }

  /* ⚠️ LE REFUS N'A RIEN BOUGÉ — la même doctrine que le refus du d20 plus
     haut, et la raison pour laquelle ce test ne s'arrête pas au `throws`. */
  assert.equal(h.state.destiny.dice.map((die) => die.sides + ":" + die.available).join(","), avant,
    "un refus ne laisse aucun dé derrière lui");
});

test("LE PENDANT — les cinq dés de la table passent, eux", () => {
  const h = makeHarness();
  h.reset(6);
  /* Sans ce test, le précédent passerait sur un verbe qui refuse TOUT. */
  for (const sides of [4, 6, 8, 10, 12]) {
    assert.doesNotThrow(() => h.t.adjustDestinyDie(sides, 1), `le d${sides} est un dé de Destinée légitime`);
  }
  assert.equal(h.queueEmpty(), 0);
});

/* ══════════════════════════════════════════════════════════════════════
   LOT 21 — LA VIBRATION LISAIT UN CHEMIN MORT
   ══════════════════════════════════════════════════════════════════════
   Les tests ci-dessus existaient déjà et ils étaient VERTS. Ils testaient
   pourtant une mécanique qui ne s'est jamais déclenchée sur un document réel :
   le harnais posait `character.destinyBuild.arcana`, `arcanaKnown()` lisait
   `character.destinyBuild.arcana`, et les deux côtés de l'assertion
   recopiaient le même chemin v1. ZÉRO occurrence de `destinyBuild` dans
   `schemas/fh-char.schema.json`, ZÉRO dans `examples/*.json`.

   Ce qui suit se refuse cette facilité : les documents sont construits par
   `fhCharacter()`, qui n'écrit QUE le chemin ratifié du 2026-08-08. */

test("ACCEPTATION A — un document v2 qui NOMME sa carte signale une Vibration", () => {
  const h = makeHarness();
  h.reset(6, [h.die("acc-d10", 10, true)]);
  /* Le document est écrit ici, à la main et en entier, plutôt que par le
     constructeur du harnais : c'est le point du test, et un lecteur doit voir
     la forme exacte sans aller la chercher ailleurs. */
  h.state.character = {
    schema: "fh-char/1", id: "test:char:acc", name: "Acc", lang: "en",
    pb: 2, abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }, savingProficiencies: [],
    build: {
      external: [], layers: [], budgets: [], overrides: [],
      choices: [{ path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-hermit" }, label: "The Hermit" }]
    }
  };
  assert.equal(JSON.stringify(h.state.character).includes("destinyBuild"), false,
    "le document ne porte AUCUN champ v1 — sinon ce test s'auto-satisferait comme les précédents");

  h.queueRolls(10);
  const spent = h.t.spendDestinyDie("acc-d10", true);
  assert.equal(spent.criticalSuccess, true);
  assert.deepEqual(spent.vibration, { sides: 10, level: 4 }, "d10 → niveau 4, lu depuis `build.choices[]`");
  assert.equal(h.queueEmpty(), 0);
});

test("ACCEPTATION A — le MÊME personnage sans ce choix n'en signale aucune, et son critique a lieu", () => {
  const h = makeHarness();
  h.reset(6, [h.die("acc-d10", 10, true)]);
  // Le même document, à un choix près. C'est la seule variable.
  h.state.character = fhCharacter({ name: "Acc", arcana: null });
  assert.deepEqual(h.state.character.build.choices, [], "aucune carte nommée");

  h.queueRolls(10);
  const spent = h.t.spendDestinyDie("acc-d10", true);
  assert.equal(spent.criticalSuccess, true, "le critique arcanique a lieu quand même");
  assert.equal(spent.vibration, null, "mais rien n'est signalé : aucun effet n'est listé");
  assert.equal(spent.cost, 1, "et il coûte son point, exactement comme avec une carte");
  assert.equal(h.state.destiny.points, 5);
  assert.equal(h.queueEmpty(), 0);
});

test("ATTAQUE — le chemin v1 ne réveille plus rien, et le chemin v2 est le seul qui compte", () => {
  /* LE TEST QUI AURAIT DÛ EXISTER. Un document qui porte l'ANCIEN champ et
     rien d'autre doit être MUET : s'il déclenchait encore, le chemin v1
     survivrait en repli (loi §0.6) et la panne pourrait revenir par la porte
     de derrière. */
  const h = makeHarness();
  h.reset(6, [h.die("v1-d6", 6, true)]);
  h.state.character = Object.assign(fhCharacter({ name: "Legacy", arcana: null }), {
    destinyBuild: { arcana: { numeral: "IX", name: "The Hermit" } }
  });
  h.queueRolls(6);
  assert.equal(h.t.spendDestinyDie("v1-d6", true).vibration, null,
    "`destinyBuild.arcana` ne fait plus rien — le chemin v1 est SUPPRIMÉ, pas gardé en secours");

  /* Et l'inverse, dans le même souffle : le chemin v2 seul suffit. */
  const v2 = makeHarness();
  v2.reset(6, [v2.die("v2-d6", 6, true)]);
  v2.state.character = fhCharacter({ name: "Modern", arcana: "fh:arcana:en:the-hermit" });
  v2.queueRolls(6);
  assert.deepEqual(v2.t.spendDestinyDie("v2-d6", true).vibration, { sides: 6, level: 2 });
  assert.equal(h.queueEmpty(), 0);
  assert.equal(v2.queueEmpty(), 0);
});

test("ATTAQUE — on ne peut pas rendre la Vibration muette en tendant le mauvais objet", () => {
  /* §0.5. La panne a duré parce qu'un lecteur qui ne trouvait pas son chemin
     répondait « non » au lieu de dire qu'il ne comprenait pas ce qu'on lui
     tendait. Chacune des formes ci-dessous JETTE désormais, et le message
     NOMME ce qui manque. */
  const bad = (character, motif, why) => {
    const h = makeHarness();
    h.reset(6, [h.die("x-d6", 6, true)]);
    h.state.character = character;
    h.queueRolls(6);
    assert.throws(() => h.t.spendDestinyDie("x-d6", true), motif, why);
  };

  // 1. La tranche `resolved` tendue à la place du document — le piège le plus probable.
  bad({ abilities: {}, proficiency: 2, saves: {}, stats: [] },
    /is not an fh-char\/1/,
    "un objet sans `build.choices` n'est pas un personnage muet, c'est le mauvais objet");
  // 2. Une fiche v1 entière.
  bad({ name: "Old", destinyBuild: { arcana: { name: "The Hermit" } }, build: {} },
    /is not an fh-char\/1/,
    "`build: {}` sans `choices` : le schéma rend `choices` obligatoire");
  // 3. Un choix qui écrit un scalaire là où le contrat veut un `ref`.
  bad(fhCharacter({ name: "Scalar", choices: [{ path: "fh.destiny.arcana", value: "The Hermit" }] }),
    /carries a value, not a `ref`/,
    "une carte est un record de la pile, pas une chaîne recopiée dans la fiche");
  // 4. Un `ref` vers un record d'un autre genre.
  const wrongKind = fhCharacter({ name: "Wrong", arcana: null });
  wrongKind.build.choices.push({ path: "fh.destiny.arcana", ref: { kind: "species", id: "srd:species:en:elf" } });
  bad(wrongKind, /designates a "species" record/, "seul le genre `arcana` porte une carte");

  /* ET LE CAS LÉGITIME, dans le même test : aucun personnage chargé du tout.
     Une séance ouverte sur un plateau libre n'est pas une fiche cassée. */
  const bare = makeHarness();
  bare.reset(6, [bare.die("bare-d6", 6, true)]);
  bare.state.character = null;
  bare.queueRolls(6);
  assert.equal(bare.t.spendDestinyDie("bare-d6", true).vibration, null,
    "pas de personnage, pas de carte — et surtout pas de refus bruyant");
  assert.equal(bare.queueEmpty(), 0);
});
