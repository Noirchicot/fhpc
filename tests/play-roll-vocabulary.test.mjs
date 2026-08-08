/* Suite portée de fh-phb `tests/roll-vocabulary.test.js` (332 l., main).

   Le vocabulaire de jet tenu sous trois angles, exactement comme en v1 :
     1. la table des sources est la SEULE déclaration d'une source, et aucune
        source ne se distingue par la couleur seule ;
     2. les badges sont DÉRIVÉS d'une table de conditions, pas poussés aux
        sites de rendu ;
     3. le Ruling est un verdict plus le compte de ce qu'il a coûté, dérivé de
        l'entrée comme les badges.

   Ce qui n'est PAS venu : tout ce qui juge du DESSIN — les glyphes SVG
   (SOURCE_GLYPHS, bonusSourceMark, sourceToneClass), `visualDie`, les
   assertions sur companion-dock.css, les renommages de classes de dés, et le
   clignotement infini du dé de Destinée en attente. Ce sont des surfaces ; le
   bloc `play` n'en produit aucune et elles restent vérifiées dans fh-phb.
   Chacune est nommée dans INVENTAIRE-LOT-C.md.

   ── REWRITTEN 2026-08-08 (lot 5) ─────────────────────────────────────
   La suite montait un lexique unique. Il en existe désormais DEUX MOITIÉS :
   celle du SRD, déclarée dans `src/play/lexicon.mjs`, et celle de la couche,
   déclarée dans `src/modules/fh/lexicon.mjs` et INSÉRÉE PAR PRIORITÉ. La suite
   monte donc l'assemblage — c'est ce que voit un joueur Fate's Hand — et
   vérifie en plus, à la fin, ce que voit un joueur SRD pur : une table plus
   courte, et pas un mot de la maison dedans.

   Deuxième réécriture, orthogonale : une règle ne porte plus ses MOTS
   (loi §0.13). Elle porte un `id`, et un PAQUET de libellés porte les mots. Ce
   que la suite vérifiait sur des chaînes, elle le vérifie donc là où les
   chaînes vivent maintenant. Les `outcome`, eux, n'ont pas bougé d'un bit —
   ce sont eux que des programmes lisent. */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLexicon, SRD_VERDICTS, srdBadgeRules, SEALABLE_SOURCES, CORRECTION_DICE } from "../src/play/lexicon.mjs";
import { createLabels, EN_SRD } from "../src/play/labels.mjs";
import { createDiceKit } from "../src/play/dice.mjs";
import { createFhLayer } from "../src/modules/fh/index.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const lexiconSource = fs.readFileSync(path.join(here, "..", "src", "play", "lexicon.mjs"), "utf8");

let counter = 0;
const fh = createFhLayer({});
const labels = createLabels(EN_SRD, fh.labels);
const srdOnlyLabels = createLabels(EN_SRD);
const kit = createDiceKit({ rollDie: () => 1, uuid: () => "vocab-" + (++counter), labels, modules: [fh] });
const lexicon = createLexicon({ entryBonusDice: kit.entryBonusDice, labels, modules: [fh] });
const srdOnly = createLexicon({
  entryBonusDice: createDiceKit({ rollDie: () => 1, uuid: () => "srd-" + (++counter), labels: srdOnlyLabels }).entryBonusDice,
  labels: srdOnlyLabels, modules: []
});
const { ROLL_SOURCES, ROLL_VERDICTS, ROLL_BADGE_RULES, rollSource, sealLabel, outcomeFor, rollBadges, rollRuling, rollVocabulary } = lexicon;
const rollVerdictText = (entry) => { const r = rollRuling(entry); return r.verdict || r.title; };
const rollDetailText = (entry) => rollRuling(entry).display.join(" · ");

/* ── §1 Jetons de source ─────────────────────────────────────────────── */

test("les sept sources de UI-ROLL-VOCABULARY §1 sont déclarées, une fois, dans une table", () => {
  const EXPECTED_SOURCES = {
    guidance: { label: "Guidance", tone: "guidance", mark: "glyph" },
    bardic: { label: "Bardic", tone: "bardic", mark: "glyph" },
    tactical: { label: "Tactical", tone: "tactical", mark: "glyph" },
    "other-1": { label: "Bonus I", tone: "bonus", mark: "I" },
    "other-2": { label: "Bonus II", tone: "bonus", mark: "II" },
    "other-3": { label: "Bonus III", tone: "bonus", mark: "III" },
    /* REWRITTEN (lot 5) — `destiny` OUVRAIT cette table en v1. Il la ferme
       maintenant, et l'ordre porte du sens : les six sources SRD sont
       déclarées par le moteur, la septième descend de la couche. Retirez la
       couche et il en reste six. */
    destiny: { label: "Destiny", tone: "destiny", mark: "glyph" }
  };
  assert.deepEqual(Object.keys(ROLL_SOURCES), Object.keys(EXPECTED_SOURCES));
  assert.deepEqual(Object.keys(srdOnly.ROLL_SOURCES), Object.keys(EXPECTED_SOURCES).filter((key) => key !== "destiny"),
    "un moteur SRD nu ne déclare pas la source d'une mécanique qu'il n'a pas");

  Object.entries(EXPECTED_SOURCES).forEach(([key, want]) => {
    const token = ROLL_SOURCES[key];
    /* REWRITTEN (lot 5, §0.13) — le jeton portait `label: "Guidance"`. Il porte
       désormais `labelId`, et le MOT vient du paquet. C'est ce qui « ouvre
       l'option » multilingue : la table de sources est la même dans toutes les
       langues, seul le paquet change. */
    assert.equal(lexicon.sourceLabel(key), want.label, key + " carries its ratified name");
    assert.equal(token.tone, want.tone, key + " carries its tone");
    /* The rule that outlives every other one here: THE GLYPH CARRIES THE
       IDENTITY. A token with a tone and no mark would be a source told apart by
       colour alone, which at 12px is not tellable apart at all. */
    assert.ok(token.glyph || token.letter, key + " carries a mark, never a colour alone");
    if (want.mark !== "glyph") assert.equal(token.letter, want.mark, key + " uses its Roman numeral");
  });

  // Five distinct silhouettes: a source that borrowed another's glyph would be
  // indistinguishable the moment the room got dark.
  const glyphNames = Object.values(ROLL_SOURCES).filter((s) => s.glyph).map((s) => s.glyph);
  assert.equal(new Set(glyphNames).size, glyphNames.length, "no two sources share a glyph");
  const letters = Object.values(ROLL_SOURCES).filter((s) => s.letter).map((s) => s.letter);
  assert.deepEqual(letters, ["I", "II", "III"], "the bonus dice use I · II · III and nothing else");

  /* REWRITTEN (lot C, portage v2) : les assertions v1 sur le DESSIN des glyphes
     (poids de trait ≥3 sur une grille de 24, lemniscate en un seul sous-chemin
     qui se referme, boucles en sens opposés) portaient sur SOURCE_GLYPHS, une
     table de SVG. Le bloc `play` ne dessine rien : elle reste dans fh-phb, avec
     ses assertions intactes. Ce que le moteur garantit — chaque source porte
     une marque, jamais une couleur seule — est vérifié juste au-dessus. */
});

test("une source inconnue retombe sur le ton bonus gris plutôt que sur rien", () => {
  assert.equal(rollSource("nonsense").tone, "bonus");
  assert.equal(lexicon.sourceLabel("nonsense"), "Other", "et elle porte quand même un nom");
  assert.equal(rollSource("").key, "", "l'absence de source est un cas nommé, pas un trou");
});

test("D.3 — la carte des sceaux tombe de six à deux, et ce n'est pas du ménage", () => {
  /* REWRITTEN 2026-08-08 (lot 5, D.3). L'assertion v1 disait « toute source
     sauf Destiny peut sceller un dé bonus ». Sous la définition tranchée par
     Eric le 2026-08-08, un SCEAU déclare qu'un dé EST un dé de correction :
     un dé qu'on dépense APRÈS COUP sur un jet déjà connu comme raté, adossé à
     une ressource comptée. Seuls `bardic` (Barde) et `tactical` (Guerrier
     niv. 2, Tactical Mind) répondent à cette définition, et les deux sont
     dans `fh-srd/exports/srd/en/class.json`.
     Ce qui est parti : `guidance` — le sort se lance AVANT le jet, c'est un
     bonus de montage, il a sa propre porte (D.1) ; et `other-1/2/3` — de
     l'habillage d'affichage, pas de la mécanique. Supprimés, pas désactivés
     (loi §0.6). */
  assert.deepEqual(SEALABLE_SOURCES, ["bardic", "tactical"],
    "a seal declares a correction die — and there are exactly two in the SRD");
  SEALABLE_SOURCES.forEach((key) => assert.ok(ROLL_SOURCES[key], key + " is a declared source"));
  assert.equal(SEALABLE_SOURCES.indexOf("destiny"), -1,
    "Destiny comes from the pool, it is not a sticker — and it does not exist at all without its layer");
  /* Les jetons de source, eux, RESTENT : un dé bonus anonyme doit encore
     pouvoir être nommé sur le plateau. C'est le SCELLAGE qui a été coupé, pas
     la capacité de nommer un dé. */
  assert.equal(sealLabel("tactical"), "Tactical", "a sealed die takes its name from the table");
  assert.equal(sealLabel("other-3"), "Bonus III", "a bonus die still takes its name from the table");
  assert.equal(sealLabel("nonsense"), "Bonus", "et un sceau inconnu retombe sur un nom, jamais sur du vide");
});

test("D.1 — les deux dés de correction déclarent leur fenêtre et leur remboursement", () => {
  /* La table qui remplace « six sources scellables » : ce que chacune est
     réellement, lu dans la source SRD. Bardic « is expended when it's rolled ».
     Tactical Mind : « If the check still fails, this use of Second Wind isn't
     expended » — d'où le seul `refundIfStillFails` du moteur (D.4). */
  assert.deepEqual(Object.keys(CORRECTION_DICE).sort(), ["bardic", "tactical"],
    "la table des dés de correction est la lecture à voix haute de SEALABLE_SOURCES");
  assert.equal(CORRECTION_DICE.bardic.refundIfStillFails, false,
    "« A Bardic Inspiration die is expended when it's rolled » — sans condition");
  assert.equal(CORRECTION_DICE.tactical.refundIfStillFails, true,
    "« If the check still fails, this use of Second Wind isn't expended » (D.4)");
  assert.deepEqual(CORRECTION_DICE.tactical.appliesTo, ["check"],
    "Tactical Mind corrige un test de caractéristique, pas une attaque ni un sort");
  assert.equal(CORRECTION_DICE.tactical.sides, 10, "1d10, comme la source le dit");
  assert.equal(CORRECTION_DICE.bardic.sides, 6, "et le dé de Barde part à d6");
});

/* ── §3 Les badges sont dérivés, pas émis ────────────────────────────── */

const loudEntry = {
  kind: "d20", name: "Arcana", ability: "INT", baseBonus: 3, natural: 20, natChoice: "chaos",
  d20s: [20], kept: 20, total: 31, dc: 15, exhaustion: 2, adjusted: true, awakening: true,
  chaosRoll: [4, 5], chaosRow: "The Weave shudders", d20Forced: true, bonusDice: [],
  destinyPointChange: { reason: "Awakening", after: 0 },
  /* REWRITTEN 2026-08-08 (lot 16) — l'entrée porte désormais sa Vibration : la
     quinzième règle ne tirerait sur AUCUNE entrée de cette suite sans elle, et
     une règle qu'aucun cas ne déclenche est une règle que le compte protège
     sans que personne ne l'ait vue s'allumer. */
  destiny: { sides: 8, result: 8, criticalSuccess: true, vibration: { sides: 8, level: 3 }, pointsBefore: 6, pointsAfter: 5, arcaneChoice: "chaos", chaos: { overreach: 3, dc: 14 } }
};

test("seize règles déclarées, cinq familles visuelles, des ids uniques", () => {
  /* REWRITTEN 2026-08-08 (lot 5) — treize règles en v1, quatorze ici, et le
     compte reste le point : c'est ce qui était treize `badges.push()` séparés
     dans le chemin de rendu. La quatorzième est `rerolled` : le SRD garde le
     Point d'inspiration héroïque que Fate's Hand a retiré, et une relance qui
     ne laisse aucune trace dans le flux est une dépense invisible.
     Le partage compte autant que le total : CINQ règles sont SRD, NEUF
     descendent de la couche. */
  /* REWRITTEN 2026-08-08 (lot 16) — quinze. La quinzième est `vibration`,
     retrouvée : le dock v1 portait les 22 Vibrations et la couche v2 n'en avait
     AUCUNE trace. Le partage bouge d'un cran du côté de la couche — CINQ règles
     SRD, DIX de la couche — et c'est le bon côté : une Vibration n'existe pas
     sans Arcane, donc pas sans Fate's Hand. */
  /* REWRITTEN 2026-08-10 (lot 21) — seize. La seizième est `tilt` : la seule
     façon dont Fate's Hand penche un jet depuis la ratification du 2026-08-09.
     Elle DEVAIT laisser une trace — un « +2 » ou un avantage sans badge est un
     jet dont la table ne peut pas relire la raison, et c'est précisément ce
     que cette collection existe pour empêcher. Le partage bouge encore d'un
     cran : CINQ règles SRD, ONZE de la couche. */
  assert.equal(ROLL_BADGE_RULES.length, 16, "sixteen declared rules, one per badge");
  assert.equal(srdOnly.ROLL_BADGE_RULES.length, 5, "cinq d'entre elles seulement appartiennent au jeu de base");
  assert.equal(srdBadgeRules({ entryBonusDice: kit.entryBonusDice }).length, 5);
  assert.deepEqual([...new Set(ROLL_BADGE_RULES.map((rule) => rule.k))].sort(),
    ["adjusted", "chaos", "destiny", "manual", "n20"], "the five visual families of §3");
  assert.equal(new Set(ROLL_BADGE_RULES.map((rule) => rule.id)).size, 16, "rule ids are unique");
  ROLL_BADGE_RULES.forEach((rule) => {
    assert.equal(typeof rule.when, "function", rule.id + " declares its condition");
    /* REWRITTEN (lot 5, §0.13) — la règle déclarait `text`, une fonction qui
       rendait de l'anglais. Elle déclare maintenant `data`, qui rend les FAITS ;
       le paquet rend les mots. Une règle qui porterait encore un mot serait un
       mot que personne ne peut traduire. */
    assert.equal(typeof rule.data, "function", rule.id + " declares its facts");
    assert.equal(typeof rule.text, "undefined", rule.id + " ne porte plus de texte : le moteur nomme des ids");
    assert.equal(typeof rule.priority, "number", rule.id + " declares its reading order");
  });
  const priorities = ROLL_BADGE_RULES.map((rule) => rule.priority);
  assert.deepEqual(priorities, priorities.slice().sort((a, b) => a - b), "la table est lue dans l'ordre de priorité");
  assert.equal(new Set(priorities).size, priorities.length, "et deux règles ne peuvent pas se disputer la même place");
});

test("le chemin de rendu ne peut plus inventer un badge", () => {
  /* This is the actual defect being fixed: with pushes scattered through
     rendering, nothing made the Tray and the Stream agree about the same roll —
     and since the Dice Tray became the shared surface, a disagreement is
     something the whole table sees.
     REWRITTEN (lot C, portage v2) : la v1 grepait fh-player-sheet.js ; ici la
     déclaration vit dans lexicon.mjs et c'est LUI qu'on grepe. La garde est la
     même, sur le fichier qui porte désormais la règle. */
  assert.equal((lexiconSource.match(/badges\.push\(\{/g) || []).length, 1,
    "exactly one push survives — the one inside rollBadges that walks the rule table");
  assert.match(lexiconSource, /ROLL_BADGE_RULES\.forEach\(\(rule\) => \{[\s\S]*?badges\.push\(/,
    "and that push is the table walk, not a render site");
});

test("une entrée, tout à la fois : les treize tirent ensemble et dans l'ordre déclaré", () => {
  const loud = rollVocabulary(loudEntry);
  /* REWRITTEN 2026-08-08 (lot 16) — `vibration` s'insère entre la dépense de
     Destinée (70) et le refus arcanique (80), et l'ordre est ce qui se lit :
     ce que le dé a coûté, puis ce qu'il OFFRE. */
  assert.deepEqual(loud.badges.map((b) => b.id), [
    "natural-20", "fate-refused", "chaos-roll", "chaos-row", "exhaustion", "destiny-spend",
    "vibration", "arcane-fate-refused", "overreach", "destiny-points", "awakening", "manual", "adjusted"
  ], "every rule that applies fires, in the declared reading order");
  /* REWRITTEN 2026-08-06 (lot R34-R39) — the badge followed its verdict. L17
     renamed the n20 badge « CRITICAL 20 » in the same ratification that renamed
     the verdict (L4); leaving the badge behind was exactly the drift that made
     the T7/T8 dedup stop firing. The outcome is NOT renamed.
     REWRITTEN 2026-08-08 (lot 5) — ce renommage est devenu ce qu'il a toujours
     été : un MOT. Le SRD dit « NATURAL 20 » du même badge, sous le même id ;
     c'est le paquet de la couche qui le dit « CRITICAL 20 » à une table
     Fate's Hand. La règle, elle, n'a pas bougé. */
  assert.equal(loud.badges.find((b) => b.id === "natural-20").t, "CRITICAL 20");
  assert.equal(srdOnly.rollBadges({ natural: 20, bonusDice: [] })[0].t, "NATURAL 20",
    "et le même badge, sans la couche, dit ce que le SRD en dit");
  assert.equal(loud.badges.find((b) => b.id === "chaos-roll").t, "Chaos 2d6 = 9");
  assert.equal(loud.badges.find((b) => b.id === "exhaustion").t, "Exhaustion 2 · −2");
  /* REWRITTEN 2026-08-06 (lot R34-R39) — L23 : the destiny badge's HEAD takes
     the ∞ family. The tail — the points and where they leave you — is untouched. */
  assert.equal(loud.badges.find((b) => b.id === "destiny-spend").t, "∞ critical · -1 pt → 5");
  /* Le badge dit le NIVEAU et rien d'autre : nommer un sort ici ferait entrer
     le contenu des 22 cartes dans le paquet de libellés du moteur. */
  assert.equal(loud.badges.find((b) => b.id === "vibration").t, "Vibration · d8 · spell level 3");
  assert.equal(loud.badges.find((b) => b.id === "overreach").t, "Overreach 3 · save DC 14");
});

test("le drapeau spoiler voyage SUR le badge", () => {
  /* So a surface hiding an unrevealed result never needs its own copy of which
     families are spoilers. */
  const spoilerById = Object.fromEntries(rollBadges(loudEntry).map((b) => [b.id, b.spoiler]));
  assert.equal(spoilerById["natural-20"], true, "a natural 20 is a spoiler while the dice are still in the air");
  assert.equal(spoilerById["destiny-spend"], true, "what Destiny gave is a spoiler");
  assert.equal(spoilerById["manual"], false, "MANUAL describes construction, not outcome — never a spoiler");
  assert.equal(spoilerById["adjusted"], false, "adjusted describes construction, not outcome");
});

test("un jet tranquille ne produit aucun badge plutôt qu'un badge par défaut", () => {
  assert.deepEqual(rollBadges({ kind: "d20", name: "Stealth", baseBonus: 2, natural: 11, kept: 11, total: 13, dc: "", bonusDice: [] }), [],
    "an ordinary roll carries no badges");
  assert.deepEqual(rollBadges(null), [], "no entry, no badges — never a crash at a render site");
  // Derivation is a pure reading of the entry: two surfaces asking the same
  // question get the same answer, which is the whole point of the lot.
  assert.deepEqual(rollBadges(loudEntry), rollBadges(loudEntry), "the same entry always derives the same badges");
});

/* ── §5 Le Ruling ────────────────────────────────────────────────────── */

test("une table de verdicts nourrit deux lectures, et les chaînes machine ne bougent pas", () => {
  /* REWRITTEN 2026-08-08 (lot 5) — huit verdicts en v1, ONZE ici, dont SIX
     appartiennent au SRD. Les deux nouveaux du jeu de base sont le coup
     critique et l'échec critique d'une ATTAQUE : le SRD ne donne d'effet à un
     20 ou un 1 naturel que là (`srd:glossary:en:critical-hit`, p.179), et le
     moteur porte désormais le type de jet qui permet de le savoir. */
  assert.equal(ROLL_VERDICTS.length, 11, "eleven verdicts, in ruling order");
  assert.equal(srdOnly.ROLL_VERDICTS.length, 6, "six d'entre eux appartiennent au jeu de base");
  assert.equal(SRD_VERDICTS.length, 6);
  ROLL_VERDICTS.forEach((rule) => {
    assert.ok(rule.outcome, rule.id + " declares the machine-facing outcome");
    /* REWRITTEN (lot 5, §0.13) — la règle déclarait `verdict`, le mot dit à
       voix haute. `FATE REFUSED` était même écrit en dur au milieu de verdicts
       qui passaient déjà par une table de libellés. Le mot vit maintenant dans
       le paquet, et la règle ne porte plus qu'un id. */
    assert.equal(typeof rule.verdict, "undefined", rule.id + " ne porte plus son mot");
    assert.ok(labels.has("verdict." + rule.id), rule.id + " a bien un mot dans le paquet");
    assert.equal(typeof rule.priority, "number", rule.id + " declares its judgement order");
  });
  const priorities = ROLL_VERDICTS.map((rule) => rule.priority);
  assert.deepEqual(priorities, priorities.slice().sort((a, b) => a - b), "l'ordre de jugement est déclaré, pas accidentel");
  assert.equal(new Set(priorities).size, priorities.length, "et il ne dépend pas de l'ordre de montage des couches");

  /* These exact strings are what outcomeTone, feedTone and intentOutcome match
     on. Changing one silently repaints every result in the Stream and the
     shared tray, and other players' docks read them off the wire. */
  assert.equal(outcomeFor(loudEntry), "Critical success", "the outcome string is unchanged by this lot");
  assert.equal(outcomeFor({ natural: 20, dc: "", bonusDice: [] }), "Natural 20");
  assert.equal(outcomeFor({ natural: 1, natChoice: "accept", dc: "", bonusDice: [] }), "Critical failure · Fate accepted");
  assert.equal(outcomeFor({ natural: 11, total: 13, dc: 15, bonusDice: [] }), "Failure");
  assert.equal(outcomeFor({ natural: 11, total: 18, dc: 15, bonusDice: [] }), "Success");
  assert.equal(outcomeFor({ natural: 11, total: 18, dc: "", bonusDice: [] }), "", "nothing decided, nothing claimed");
  // Les deux verdicts SRD neufs ne se déclenchent QUE sur une attaque.
  assert.equal(outcomeFor({ rollType: "attack", natural: 20, ac: "", bonusDice: [] }), "Critical hit");
  assert.equal(outcomeFor({ rollType: "attack", natural: 1, ac: "", bonusDice: [] }), "Critical miss");
  assert.equal(srdOnly.outcomeFor({ rollType: "check", natural: 1, dc: "", bonusDice: [] }), "Natural 1",
    "sur un test ordinaire, un 1 est RAPPORTÉ et ne décide rien — c'est ce qui le laisse SRD");
});

test("les quatre renommages ratifiés, du côté PARLÉ seulement", () => {
  /* Phase 5 (lexique ratifié Eric, 2026-08-05, complété 2026-08-06). Les
     outcomes ci-dessus restent identiques au bit près.
     REWRITTEN (lot 5, §0.13) — les quatre mots ne sont plus lus sur la règle
     mais sur le PAQUET. C'est exactement ce que « renommer ce que lit un
     humain, geler ce que lit un programme » voulait dire : le renommage est
     devenu une édition de données. */
  assert.equal(labels("verdict.natural-20"), "CRITICAL 20", "Natural 20 speaks as CRITICAL 20");
  assert.equal(labels("verdict.natural-1-accepted"), "FUMBLE 1", "an accepted natural 1 speaks as FUMBLE 1");
  assert.equal(labels("verdict.arcane-critical-success"), "∞ CRITICAL", "the Arcane critical success speaks as ∞ CRITICAL");
  assert.equal(labels("verdict.arcane-critical-failure"), "∞ FUMBLE", "the Arcane critical failure speaks as ∞ FUMBLE");
  assert.equal(labels("verdict.natural-1-open"), "FUMBLE 1 · CHOOSE", "the undecided 1 says the family and that it is undecided (L6)");
  assert.equal(labels("verdict.fate-refused"), "FATE REFUSED", "et FATE REFUSED, qui était le seul écrit en dur, passe par la table comme les autres");
  // Le paquet SRD, lui, ne connaît aucun de ces cinq-là : ils descendent avec la couche.
  ["arcane-critical-success", "arcane-critical-failure", "fate-refused", "natural-1-accepted", "natural-1-open"]
    .forEach((id) => assert.equal(srdOnlyLabels.has("verdict." + id), false, id + " est un mot de la couche, pas du SRD"));
  // Un id sans mot JETTE, plutôt que de peindre « verdict.natural-20 » à la table (loi §0.5).
  assert.throws(() => srdOnlyLabels("verdict.fate-refused"), /no label for/);
});

test("l'exemple de la spec : un verdict, puis le compte de ce qu'il a coûté", () => {
  const spent = {
    kind: "destiny", name: "Destiny d8", total: 8, dc: "",
    destiny: { sides: 8, result: 8, criticalSuccess: true, pointsBefore: 6, pointsAfter: 5 }
  };
  const ruling = rollRuling(spent);
  assert.equal(ruling.verdict, "∞ CRITICAL", "the verdict is the engine's decision, said out loud");
  assert.ok(ruling.account.includes("Lost 1 Destiny Point"), "the account states what it cost, in points");
  assert.ok(ruling.account.includes("Current 5"), "and where it leaves you");
  assert.ok(ruling.account.includes("Destiny d8 8"), "and what was rolled");
  // Never flavour: every line of the account is a fact with a number in it.
  ruling.account.forEach((line) => assert.match(line, /\d/, "an account line is a record, never prose: " + line));

  // A verdict moves the roll's identity into the account, so nothing is lost and
  // nothing is said twice.
  assert.equal(rollVerdictText(spent), "∞ CRITICAL", "the heading is the verdict when there is one");
  assert.equal(ruling.account[0], "Destiny d8 8", "and the identity leads the account");

  const undecided = { kind: "d20", name: "Stealth", baseBonus: 2, natural: 11, kept: 11, total: 13, dc: "", bonusDice: [] };
  assert.equal(rollRuling(undecided).verdict, "", "an undecided roll gets no verdict rather than a guessed one");
  assert.equal(rollVerdictText(undecided), "Stealth 13", "the heading falls back to the roll's identity");
  assert.ok(!rollDetailText(undecided).startsWith("Stealth 13"), "which is then not repeated in the account");

  // A DC the player was rolling against belongs in the account either way.
  assert.ok(rollRuling({ kind: "d20", name: "Arcana", baseBonus: 3, natural: 11, kept: 11, total: 14, dc: 15, bonusDice: [] })
    .account.indexOf("DC 15") >= 0, "the account states what was being beaten");
  /* Le même compte, pour une attaque : le seuil n'est plus un DD mais une CA,
     et le Ruling le dit avec le bon mot (exigence A). */
  assert.ok(rollRuling({ kind: "d20", rollType: "attack", name: "Longsword", baseBonus: 5, natural: 11, kept: 11, total: 16, ac: 14, bonusDice: [] })
    .account.indexOf("AC 14") >= 0, "une attaque se lit contre une CA, pas contre un DD");

  // Derived, never written at render time.
  assert.deepEqual(rollRuling(spent), rollRuling(spent), "the same entry always derives the same Ruling");
  /* REWRITTEN 2026-08-06 (lot R34-R39) — the ruling gained `verdictId`, the
     token the dedup compares instead of texts (L87). The empty ruling must
     carry the empty token too, or a surface reading it has to know that the
     field is sometimes absent. */
  assert.deepEqual(rollRuling(null), { verdict: "", verdictId: "", title: "Roll", account: [], display: [] }, "no entry, no ruling — and no crash");
});

test("T1 : `display` laisse l'énumération des dés au `account`", () => {
  /* Lot texte T1 (Eric, 2026-08-04): the on-screen account drops the per-die
     enumeration — the dice speak for themselves — and keeps the title-fallback,
     the Destiny cost and the DC. `account` stays the full record, for the
     Stream and the hover title. */
  const shown = rollRuling({ kind: "d20", name: "Arcana", baseBonus: 3, natural: 11, kept: 11, total: 14, dc: 15, bonusDice: [] });
  assert.ok(shown.display.indexOf("DC 15") >= 0, "display keeps the DC");
  assert.ok(!shown.display.some((line) => /^d20/.test(line)), "and drops the dice enumeration");
  assert.ok(shown.account.some((line) => /^d20/.test(line)), "which the full account still records");
  /* REWRITTEN (lot C, portage v2) : l'assertion v1 sur `isRuling` — le style
     oxblood gagné par ÉGALITÉ avec le verdict dérivé, jamais par un drapeau —
     grepait le rendu du plateau et companion-dock.css. Surface → reste dans
     fh-phb. Le `verdict` qui sert d'étalon à cette égalité est produit ici. */
});

test("§0.12 — un moteur SRD nu ne dit PAS un mot de la maison", () => {
  /* Le test de la coupe, sur le vocabulaire. Sans couche montée, aucune règle
     de verdict et aucun badge ne cite une mécanique Fate's Hand, et le total
     d'un jet n'additionne rien qu'un joueur SRD ne pourrait nommer. */
  const HOUSE = /destiny|chaos|overreach|arcane|awakening|fate/i;
  srdOnly.ROLL_VERDICTS.forEach((rule) => {
    assert.equal(HOUSE.test(rule.id), false, "le verdict " + rule.id + " ne cite aucune mécanique maison");
    assert.equal(HOUSE.test(rule.outcome), false, "et sa chaîne machine non plus : " + rule.outcome);
  });
  srdOnly.ROLL_BADGE_RULES.forEach((rule) => {
    assert.equal(HOUSE.test(rule.id), false, "le badge " + rule.id + " ne cite aucune mécanique maison");
  });
  // Et un total SRD ignore ce qu'il ne connaît pas, sans planter dessus.
  const withHouseFields = { kind: "d20", name: "Arcana", baseBonus: 3, kept: 12, custom: 0, bonusDice: [], plusTwo: true, destiny: { result: 6 } };
  assert.equal(srdOnly.entryTotal(withHouseFields), 15, "un moteur SRD n'additionne ni un +2 maison ni un dé de Destinée");
  assert.equal(lexicon.entryTotal(withHouseFields), 23, "la couche montée, les deux entrent — et par sa contribution, pas par un `if`");
});
