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
   Chacune est nommée dans INVENTAIRE-LOT-C.md. */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROLL_SOURCES, SEALABLE_SOURCES, ROLL_VERDICTS, rollSource, sealLabel, outcomeFor, createLexicon } from "../src/play/lexicon.mjs";
import { createDiceKit } from "../src/play/dice.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const lexiconSource = fs.readFileSync(path.join(here, "..", "src", "play", "lexicon.mjs"), "utf8");

let counter = 0;
const kit = createDiceKit({ rollDie: () => 1, uuid: () => "vocab-" + (++counter) });
const { rollBadges, ROLL_BADGE_RULES, rollRuling, rollVocabulary } = createLexicon({ entryBonusDice: kit.entryBonusDice });
const rollVerdictText = (entry) => { const r = rollRuling(entry); return r.verdict || r.title; };
const rollDetailText = (entry) => rollRuling(entry).display.join(" · ");

/* ── §1 Jetons de source ─────────────────────────────────────────────── */

test("les sept sources de UI-ROLL-VOCABULARY §1 sont déclarées, une fois, dans une table", () => {
  const EXPECTED_SOURCES = {
    destiny: { label: "Destiny", tone: "destiny", mark: "glyph" },
    guidance: { label: "Guidance", tone: "guidance", mark: "glyph" },
    bardic: { label: "Bardic", tone: "bardic", mark: "glyph" },
    tactical: { label: "Tactical", tone: "tactical", mark: "glyph" },
    "other-1": { label: "Bonus I", tone: "bonus", mark: "I" },
    "other-2": { label: "Bonus II", tone: "bonus", mark: "II" },
    "other-3": { label: "Bonus III", tone: "bonus", mark: "III" }
  };
  assert.deepEqual(Object.keys(ROLL_SOURCES), Object.keys(EXPECTED_SOURCES));

  Object.entries(EXPECTED_SOURCES).forEach(([key, want]) => {
    const token = ROLL_SOURCES[key];
    assert.equal(token.label, want.label, key + " carries its ratified name");
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
  assert.equal(rollSource("nonsense").label, "Other", "et elle porte quand même un nom");
  assert.equal(rollSource("").key, "", "l'absence de source est un cas nommé, pas un trou");
});

test("la carte des sceaux est la table lue à voix haute, pas une seconde liste tenue à la main", () => {
  assert.deepEqual(SEALABLE_SOURCES, ["guidance", "bardic", "tactical", "other-1", "other-2", "other-3"],
    "every source but Destiny can seal a bonus die — Destiny comes from the pool, it is not a sticker");
  SEALABLE_SOURCES.forEach((key) => assert.ok(ROLL_SOURCES[key], key + " is a declared source"));
  assert.equal(sealLabel("tactical"), "Tactical", "a sealed die takes its name from the table");
  assert.equal(sealLabel("other-3"), "Bonus III", "a bonus die takes its name from the table");
  assert.equal(sealLabel("nonsense"), "Bonus", "et un sceau inconnu retombe sur un nom, jamais sur du vide");
});

/* ── §3 Les badges sont dérivés, pas émis ────────────────────────────── */

const loudEntry = {
  kind: "d20", name: "Arcana", ability: "INT", baseBonus: 3, natural: 20, natChoice: "chaos",
  d20s: [20], kept: 20, total: 31, dc: 15, exhaustion: 2, adjusted: true, awakening: true,
  chaosRoll: [4, 5], chaosRow: "The Weave shudders", d20Forced: true, bonusDice: [],
  destinyPointChange: { reason: "Awakening", after: 0 },
  destiny: { sides: 8, result: 8, criticalSuccess: true, pointsBefore: 6, pointsAfter: 5, arcaneChoice: "chaos", chaos: { overreach: 3, dc: 14 } }
};

test("treize règles déclarées, cinq familles visuelles, des ids uniques", () => {
  // The count is the point: it is what used to be thirteen separate
  // badges.push() calls inside the render path.
  assert.equal(ROLL_BADGE_RULES.length, 13, "thirteen declared rules, one per badge");
  assert.deepEqual([...new Set(ROLL_BADGE_RULES.map((rule) => rule.k))].sort(),
    ["adjusted", "chaos", "destiny", "manual", "n20"], "the five visual families of §3");
  assert.equal(new Set(ROLL_BADGE_RULES.map((rule) => rule.id)).size, 13, "rule ids are unique");
  ROLL_BADGE_RULES.forEach((rule) => {
    assert.equal(typeof rule.when, "function", rule.id + " declares its condition");
    assert.equal(typeof rule.text, "function", rule.id + " declares its text");
  });
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
  assert.deepEqual(loud.badges.map((b) => b.id), [
    "natural-20", "fate-refused", "chaos-roll", "chaos-row", "exhaustion", "destiny-spend",
    "arcane-fate-refused", "overreach", "destiny-points", "awakening", "manual", "adjusted"
  ], "every rule that applies fires, in the declared reading order");
  /* REWRITTEN 2026-08-06 (lot R34-R39) — the badge followed its verdict. L17
     renamed the n20 badge « CRITICAL 20 » in the same ratification that renamed
     the verdict (L4); leaving the badge behind was exactly the drift that made
     the T7/T8 dedup stop firing. The outcome is NOT renamed. */
  assert.equal(loud.badges.find((b) => b.id === "natural-20").t, "CRITICAL 20");
  assert.equal(loud.badges.find((b) => b.id === "chaos-roll").t, "Chaos 2d6 = 9");
  assert.equal(loud.badges.find((b) => b.id === "exhaustion").t, "Exhaustion 2 · −2");
  /* REWRITTEN 2026-08-06 (lot R34-R39) — L23 : the destiny badge's HEAD takes
     the ∞ family. The tail — the points and where they leave you — is untouched. */
  assert.equal(loud.badges.find((b) => b.id === "destiny-spend").t, "∞ critical · -1 pt → 5");
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
  assert.equal(ROLL_VERDICTS.length, 8, "eight verdicts, in ruling order");
  ROLL_VERDICTS.forEach((rule) => {
    assert.ok(rule.outcome, rule.id + " declares the machine-facing outcome");
    assert.ok(rule.verdict, rule.id + " declares what the Ruling says out loud");
  });
  /* These exact strings are what outcomeTone, feedTone and intentOutcome match
     on. Changing one silently repaints every result in the Stream and the
     shared tray, and other players' docks read them off the wire. */
  assert.equal(outcomeFor(loudEntry), "Critical success", "the outcome string is unchanged by this lot");
  assert.equal(outcomeFor({ natural: 20, dc: "", bonusDice: [] }), "Natural 20");
  assert.equal(outcomeFor({ natural: 1, natChoice: "accept", dc: "", bonusDice: [] }), "Critical failure · Fate accepted");
  assert.equal(outcomeFor({ natural: 11, total: 13, dc: 15, bonusDice: [] }), "Failure");
  assert.equal(outcomeFor({ natural: 11, total: 18, dc: 15, bonusDice: [] }), "Success");
  assert.equal(outcomeFor({ natural: 11, total: 18, dc: "", bonusDice: [] }), "", "nothing decided, nothing claimed");
});

test("les quatre renommages ratifiés, du côté PARLÉ seulement", () => {
  /* Phase 5 (lexique ratifié Eric, 2026-08-05, complété 2026-08-06). Les
     outcomes ci-dessus restent identiques au bit près. */
  const verdictById = {};
  ROLL_VERDICTS.forEach((rule) => { verdictById[rule.id] = rule.verdict; });
  assert.equal(verdictById["natural-20"], "CRITICAL 20", "Natural 20 speaks as CRITICAL 20");
  assert.equal(verdictById["natural-1-accepted"], "FUMBLE 1", "an accepted natural 1 speaks as FUMBLE 1");
  assert.equal(verdictById["arcane-critical-success"], "∞ CRITICAL", "the Arcane critical success speaks as ∞ CRITICAL");
  assert.equal(verdictById["arcane-critical-failure"], "∞ FUMBLE", "the Arcane critical failure speaks as ∞ FUMBLE");
  assert.equal(verdictById["natural-1-open"], "FUMBLE 1 · CHOOSE", "the undecided 1 says the family and that it is undecided (L6)");
  /* REWRITTEN (lot C, portage v2) : l'assertion v1 sur l'invite de prise en
     main (« FUMBLE 1 · do you accept your fate ? ») grepait le HTML de
     fh-player-sheet.js. Surface → fh-phb. Le LEXÈME qu'elle vérifiait passe
     bien par la constante, ce que la ligne ci-dessus tient. */
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
     grepait le rendu du plateau et companion-dock.css. Surface → fh-phb. Le
     `verdict` qui sert d'étalon à cette égalité est produit ici. */
});
