/* ══ LE LEXIQUE RATIFIÉ — LES MOTS QU'ERIC A CHOISIS ═══════════════════════
   🔴 CE GARDE NAÎT D'UN SILENCE. Le 2026-08-21, quatre libellés ratifiés ont
   été renommés (« Arcane Critical Success » → « Arcane Critical », « … Failure »
   → « Arcane Fumble ») et **la suite entière est restée verte**. Un mot que le
   joueur lit, choisi par Eric, peut donc changer sans qu'une ligne ne bronche.

   ⛔ CE QUI REND CE SILENCE COÛTEUX, ET C'EST MESURÉ. Ces mots vivent sur
   QUATRE surfaces qui ne se parlent pas : le moteur (ici), la fiche du
   companion, le livre publié, et le manuscrit du vault. Deux jours de mesures
   croisées entre trois fils ont montré qu'elles divergent **en silence** — le
   Hoddon portait trois noms, quatre outils en portaient deux, et le mécanisme
   du Tilt s'appelle « Synergy » dans le livre. Un renommage non gardé est le
   premier pas de la prochaine divergence.

   ⚠️ CE QUE CE GARDE NE FAIT PAS : il ne compare RIEN au vault. Le manuscrit
   n'est pas dans ce dépôt, et une suite qui lirait l'arbre de travail d'un
   voisin rougit pour des raisons qui ne la regardent pas (leçon du 2026-08-20,
   deux fois). Il fige ce que le MOTEUR dit ; l'accord avec le livre se mesure
   à la main, et se rejoue. */
import test from "node:test";
import assert from "node:assert/strict";
import { FH_EN } from "../src/modules/fh/labels.mjs";

/** Les mots ratifiés, avec la date et la raison. Un renommage est une ÉDITION
 *  de cette table — jamais une découverte au navigateur. */
const RATIFIÉS = [
  /* L88, Eric 2026-08-06 — le registre COURT, celui de la fiche. */
  ["fh.crit20", "Crit 20", "L88 · registre court"],
  ["fh.fumble1", "Natural 1", "Eric 2026-08-21"],
  ["fh.critInf", "∞ critical", "L88 · registre court"],
  ["fh.fumbleInf", "∞ fumble", "L88 · registre court"],
  /* Le registre LONG du même lexique. */
  ["fh.CRIT20", "CRITICAL 20", "L88 · registre long"],
  ["fh.FUMBLE1", "NATURAL 1", "Eric 2026-08-21"],
  /* Eric, 2026-08-21 — les deux mots du domaine arcanique, raccourcis et
     rendus symétriques. C'est le renommage que rien n'avait vu passer. */
  ["fh.outcome.arcane-critical-success", "Arcane Critical", "Eric 2026-08-21"],
  ["fh.outcome.arcane-critical-failure", "Arcane Fumble", "Eric 2026-08-21"]
];

/** Le badge de la ligne de jet — le SEUL endroit où le joueur lit le mot de la
 *  mécanique du lot 21. Eric l'a renommé le 2026-08-21 : *« Edge c'est beaucoup
 *  mieux que tilt »*. ⛔ La clef reste `badge.tilt` : une adresse ne change pas
 *  quand le mot change. */
const BADGE_EDGE = [
  [{ tilts: 1, outcome: "plus-two" }, "1 Edge · +2"],
  [{ tilts: 2, outcome: "advantage" }, "2 Edges · Advantage"],
  [{ tilts: 0, disadvantage: true, outcome: "disadvantage" }, "0 Edges · disadvantage · Disadvantage"],
  [{ tilts: 1, disadvantage: true, outcome: "normal" }, "1 Edge · disadvantage · cancelled"]
];

test("🔴 les mots ratifiés sont ceux qu'Eric a choisis, à la lettre", () => {
  for (const [clef, mot, quand] of RATIFIÉS) {
    assert.equal(FH_EN[clef], mot,
      `« ${clef} » devrait dire « ${mot} » (${quand}). Un mot ratifié se change ICI d'abord, ` +
      "et le changement se répercute au livre — sinon la fiche et le livre se séparent.");
  }
});

test("🔴 le badge dit « Edge » — le mot du livre, pas celui du code", () => {
  /* Le renommage du 2026-08-21 est passé sur SEPT chaînes de ce dépôt (le badge
     et six refus) et sur 38 occurrences du livre. Ce garde tient la seule que le
     joueur lit sur sa ligne de jet.
     ⭐ Pourquoi le mot est meilleur, et c'est l'argument d'Eric : *« you gain an
     edge »* s'enseigne tout seul ; *tilt* devait être appris avant de vouloir
     dire quelque chose. */
  for (const [donnees, attendu] of BADGE_EDGE) {
    assert.equal(FH_EN["badge.tilt"](donnees), attendu);
  }
  assert.doesNotMatch(FH_EN["badge.tilt"]({ tilts: 2, outcome: "advantage" }), /Tilt/,
    "le mot « Tilt » ne doit plus atteindre le joueur — il n'est plus dans aucun chapitre");
});

test("⚔️ ATTAQUE — un mot ratifié renommé en douce est VU", () => {
  /* Le garde ne vaut que s'il mord, et celui-ci existe précisément parce que
     la faute est passée une fois. On rejoue le renommage du 21/08 sur une
     copie, et le MÊME contrôle doit le nommer. */
  const falsifié = { ...FH_EN, "fh.outcome.arcane-critical-failure": "Arcane Critical Failure" };
  const fautes = RATIFIÉS.filter(([clef, mot]) => falsifié[clef] !== mot).map(([clef]) => clef);
  assert.deepEqual(fautes, ["fh.outcome.arcane-critical-failure"],
    "l'attaque doit être vue par le MÊME contrôle que celui qui garde les vrais libellés");
});

test("⭐ le lexique est BI-REGISTRE — et le long DÉPLIE, il ne capitalise pas", () => {
  /* Eric, 2026-08-21 : les formes courtes sont celles de la fiche, où la place
     manque ; les formes en mots sont celles du livre. Ce n'est PAS une
     divergence à réduire — c'est une paire à tenir.

     🔴 ET LA PREMIÈRE RÉDACTION DE CE TEST S'EST TROMPÉE DE RELATION. Elle
     posait « le long est le court en capitales ». Vrai trois fois sur quatre,
     et faux sur celle qui compte : `Crit 20` → **CRITICAL 20**, pas « CRIT 20 ».
     ⭐ Le registre long ne capitalise pas, il **déplie l'abréviation** — et
     c'est exactement la ligne `Crit 20 → Critical 20` de la table d'Eric. La
     seule des quatre où le mot change vraiment.
     ⛔ D'où des paires ÉCRITES, pas dérivées : une règle mécanique aurait
     effacé la seule irrégularité qui portait une décision. */
  const PAIRES = [
    ["fh.crit20", "Crit 20", "fh.CRIT20", "CRITICAL 20"],
    ["fh.fumble1", "Natural 1", "fh.FUMBLE1", "NATURAL 1"],
    ["fh.critInf", "∞ critical", "fh.CRITINF", "∞ CRITICAL"],
    ["fh.fumbleInf", "∞ fumble", "fh.FUMBLEINF", "∞ FUMBLE"]
  ];
  for (const [kc, court, kl, long] of PAIRES) {
    assert.equal(FH_EN[kc], court, `${kc} : le registre court`);
    assert.equal(FH_EN[kl], long, `${kl} : le registre long`);
  }
  const déplié = PAIRES.filter(([, c, , l]) => l !== c.toUpperCase()).map(([k]) => k);
  assert.deepEqual(déplié, ["fh.crit20"],
    "témoin : UNE seule paire déplie son abréviation — si une seconde apparaît, " +
    "le lexique a changé de nature et la table d'Eric doit être relue");
});

/* ══ LA QUESTION OUVERTE, ÉCRITE PLUTÔT QUE MASQUÉE ═══════════════════════ */

test("✅ RÉGLÉ — le 1 nu dit « Natural 1 », le mot du SRD", () => {
  /* 🔴 TRANCHÉ PAR ERIC LE 2026-08-21, et ce n'est pas une asymétrie : c'est la
     règle du SRD appliquée jusqu'au bout. **On nomme ce qu'on a changé.**

       un 20 naturel          dépense un point de Destinée    → CRITICAL 20  (FH)
       un 1 nu                ne décide rien, `intent: null`  → NATURAL 1    (SRD)
       un critique arcanique  n'existe qu'en Fate's Hand      → Arcane Fumble (FH)

     Mesuré dans les 2 651 records du SRD 5.2.1 : `Critical Hit` est une entrée de
     glossaire, `Natural 20` / `Natural 1` / `Fumble` n'y sont nulle part. Le
     système de base nomme le haut et ne nomme pas le bas ; Fate's Hand nomme ce
     qu'il touche. ⛔ « Fumble » ne disparaît donc pas — il reste sur l'arcanique,
     qui est à Eric de bout en bout. */
  assert.equal(FH_EN["fh.fumble1"], "Natural 1");
  assert.equal(FH_EN["fh.FUMBLE1"], "NATURAL 1");
  assert.equal(FH_EN["verdict.natural-1-accepted"], "NATURAL 1");
  assert.equal(FH_EN["fh.outcome.arcane-critical-failure"], "Arcane Fumble",
    "témoin : le mot « Fumble » survit là où Fate's Hand a vraiment changé la règle");
});
