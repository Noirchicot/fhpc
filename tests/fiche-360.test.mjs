/* ══ LES GARDES DE LA FICHE À 360 — lot 77 ═══════════════════════════════

   ⭐ « Écris la CONDITION d'une décision comme un garde, pas comme un
   commentaire. » Deux nombres ont décidé la fiche à 360 px, et ils vivaient
   jusqu'ici dans un document :

     · **340 caractères** — la boîte du blurb est FIXE à 10 lignes (160 px).
       À 226 px de large en T2, une ligne porte ~36 caractères, donc ~365
       avant débordement ; la limite est posée à 340 pour encaisser un mot
       qui casse mal. (`GABARIT-360-CLASS-SPECIES.md` §2.)
     · **118 px** — la colonne de stats de la fiche (242 − 8 rembourrage −
       100 image − 8 écart − 8 rembourrage). Une ligne plus large déborde
       sur l'image. (§5 du gabarit, corrigé au croquis D.)

   Ces deux-là ne sont pas des conseils : ils n'avaient JAMAIS été passés sur
   les 24 fiches — le gabarit ne connaissait que le Wizard et le Fighter, et
   il le dit lui-même (*« Prestidigitation et Weapons : Simple sont les pires
   cas DU WIZARD ; un autre écran peut porter pire »*). Ce fichier est ce
   passage-là.

   ── COMMENT ON MESURE UNE LARGEUR SANS NAVIGATEUR ────────────────────────
   🔴 Node n'a pas de `measureText`, et une largeur ESTIMÉE n'est pas une
   mesure (la faute nommée deux fois le 15 août : « likely fine » débordait
   de 4 px). Le garde ne devine donc rien : il additionne des **avances par
   caractère MESURÉES au canvas du navigateur**, dans la police et la taille
   réelles du builder, et rangées dans `tests/fixtures/avances-t2.json`.

   La fidélité du modèle a elle-même été mesurée, sur les 130 lignes des 24
   fiches, contre la mise en page RÉELLE du navigateur (`getBoundingClientRect`
   sur le balisage de la fiche) :
     · sous-estimation maximale : **0,09 px** ;
     · surestimation maximale : 2,04 px (le crénage de « . » + espace).
   Le modèle ne ment donc jamais en faveur du texte de plus de 0,1 px — un
   garde qui sur-estime refuse trop tôt, il ne laisse pas passer trop tard.
   ⚠️ La table est liée à la police résolue sur le Mac d'Eric ; la refaire
   passe par `.banc/mesure.html`, jamais à la main.

   ── LE TROISIÈME GARDE, ET IL VIENT DU DÉFAUT QUE CE LOT A TROUVÉ ────────
   Les deux couches de texte existaient depuis des jours et n'étaient montées
   NULLE PART. Il y a DEUX piles — celle du navigateur (`ui/builder/engine.mjs`)
   et celle du générateur d'exemple (`src/tools/exemple-fh-en.mjs`, dont tous
   les tests d'écran descendent. Une seule des deux mise à jour, et l'écran
   et les tests divergent en silence. Le garde 3 rend ce silence impossible. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LAYER_FILES } from "../ui/builder/engine.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");

const fiche = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "fh-fiche-en.layer.json"), "utf8"));
const METRIQUE = JSON.parse(fs.readFileSync(path.join(HERE, "fixtures", "avances-t2.json"), "utf8"));

/** Les 24 fiches, à plat : `{kind, id, who, blurb, stats}`. Lues dans la
 *  COUCHE et pas dans une liste écrite ici — une fiche ajoutée demain entre
 *  sous les gardes sans qu'on y pense. */
export function les24Fiches() {
  const out = [];
  for (const kind of ["class", "species"])
    for (const [id, rec] of Object.entries(fiche.records[kind] || {}))
      out.push({
        kind, id, who: id.split(":").pop(),
        blurb: rec.changes["data.blurb"],
        stats: rec.changes["data[fiche_stats]"]
      });
  return out;
}

/** La largeur d'une chaîne, en px, dans un des deux poids de T2. Un
 *  caractère absent de la table est un ÉCHEC, jamais un zéro : compter 0 px
 *  pour un glyphe inconnu est exactement la mesure fausse et silencieuse que
 *  ce garde existe pour interdire. */
export function largeurT2(chaine, poids) {
  const table = METRIQUE.avances[poids];
  let total = 0;
  for (const ch of chaine) {
    const avance = table[ch];
    assert.ok(typeof avance === "number",
      `avances-t2.json ne connaît pas « ${ch} » (${ch.codePointAt(0)}) en ${poids} — ` +
      "remesure la table au banc (.banc/mesure.html) plutôt que de deviner sa largeur.");
    total += avance;
  }
  return total;
}

/** Une ligne de stats telle que la fiche la pose : l'étiquette en GRAS avec
 *  son deux-points, puis la valeur en normal. Le gras coûte 4 px et c'est
 *  lui qui a écarté la première disposition du gabarit — le mesurer en
 *  normal rendrait le garde faux dans le sens qui ne se voit pas. */
export function largeurLigneStats(label, value) {
  return largeurT2(`${label} :`, "gras") + largeurT2(` ${value}`, "normal");
}

const LIMITE_BLURB = 340;
const LIMITE_LIGNE = 118;

/* ══ GARDE 1 — LES 24 BLURBS ═════════════════════════════════════════════
   Le verdict est une FONCTION PURE, comme `nearestIndex` au socle : les 24
   fiches réelles et les attaques synthétiques passent par le MÊME code, donc
   une attaque n'a qu'à écrire une fiche, jamais à réimplémenter le garde. */

/** Les fiches dont le blurb déborde de la boîte de 10 lignes, nommées. */
export function blurbsTropLongs(fiches, limite = LIMITE_BLURB) {
  return fiches
    .filter((f) => f.blurb.text.length > limite)
    .map((f) => `${f.kind} ${f.who} : ${f.blurb.text.length} caractères`);
}

test("garde 1 — aucun des 24 blurbs ne dépasse 340 caractères", () => {
  const fiches = les24Fiches();
  assert.equal(fiches.length, 24, "la couche fh-fiche-en doit porter 12 classes + 12 espèces");
  assert.deepEqual(blurbsTropLongs(fiches), [],
    "⛔ NE RABOTE PAS LE TEXTE. C'est du contenu qu'Eric a validé : nomme la fiche " +
    "et son nombre, et remonte-le-lui (commande du lot 77, §3).");
});

test("⚔️ ATTAQUE — un blurb d'UN caractère de trop est vu, et il est NOMMÉ", () => {
  const faux = [
    { kind: "class", who: "pile", blurb: { text: "x".repeat(LIMITE_BLURB) } },
    { kind: "class", who: "unDeTrop", blurb: { text: "x".repeat(LIMITE_BLURB + 1) } }
  ];
  assert.deepEqual(blurbsTropLongs(faux), ["class unDeTrop : 341 caractères"],
    "le garde doit nommer la fiche fautive — et laisser passer celle qui tombe pile sur la limite");
});

/* ══ GARDE 2 — LES 130 LIGNES DE STATS ═══════════════════════════════════ */

test("garde 2 — aucune ligne de stats des 24 fiches ne dépasse 118 px à T2", () => {
  const trop = [];
  let lignes = 0;
  for (const f of les24Fiches())
    for (const s of f.stats) {
      lignes += 1;
      const w = largeurLigneStats(s.label, s.value);
      if (w > LIMITE_LIGNE) trop.push(`${f.kind} ${f.who} — « ${s.label} : ${s.value} » = ${w.toFixed(1)} px`);
    }
  assert.ok(lignes >= 100, `les 24 fiches doivent porter leurs lignes de stats (vu : ${lignes})`);
  assert.deepEqual(trop, [],
    "⛔ NE RACCOURCIS PAS L'ÉTIQUETTE TOUT SEUL : la colonne fait 118 px, une ligne plus " +
    "large passe sur l'image. Nomme la fiche et son nombre (commande du lot 77, §3).");
});

test("garde 2 — la mesure reproduit les repères du gabarit", () => {
  /* Les deux nombres que `GABARIT-360-CLASS-SPECIES.md` a mesurés au
     navigateur. On ne vérifie pas l'égalité — la police résolue diffère d'un
     navigateur à l'autre, et le gabarit rend ~3 % plus large — mais l'ORDRE
     et l'ordre de grandeur : le gras coûte bien quelques px, et
     `Weapons : Simple` reste sous la colonne. */
  const gras = largeurLigneStats("Weapons", "Simple");
  const toutNormal = largeurT2("Weapons : Simple", "normal");
  assert.ok(gras > toutNormal, "l'étiquette en gras doit coûter plus large que la même ligne en normal");
  assert.ok(gras > 95 && gras < LIMITE_LIGNE, `Weapons : Simple mesure ${gras.toFixed(1)} px — hors de l'ordre de grandeur du gabarit (105 px)`);
});

test("garde 2 — le garde MORD : une ligne trop large est nommée, pas arrondie", () => {
  const w = largeurLigneStats("Weapon Proficiencies", "Simple and Martial");
  assert.ok(w > LIMITE_LIGNE,
    `une étiquette non abrégée doit dépasser les 118 px (mesuré : ${w.toFixed(1)} px) — ` +
    "sinon le garde ne garde rien");
});

test("garde 2 — un glyphe absent de la table JETTE au lieu de compter zéro", () => {
  assert.throws(() => largeurT2("葉", "normal"), /ne connaît pas/);
});

/* ══ GARDE 3 — LES DEUX PILES, MÊME LISTE, MÊME ORDRE ════════════════════ */

test("garde 3 — la pile du navigateur et celle du générateur sont la MÊME", () => {
  const navigateur = LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, ""));
  const generateur = PILE.map((f) => f.replace(/^layers\//, "").replace(/\.layer\.json$/, ""));
  assert.deepEqual(navigateur, generateur,
    "⛔ LES DEUX PILES ONT DIVERGÉ. `ui/builder/engine.mjs` monte ce que la PAGE voit, " +
    "`src/tools/exemple-fh-en.mjs` ce que les TESTS voient : une couche montée d'un seul " +
    "côté rend l'écran et sa suite de tests d'accord sur un personnage qui n'existe pas.");
});

test("garde 3 — les deux couches de texte du lot 77 sont bien montées", () => {
  for (const couche of ["fh-fiche-en", "fh-lore-en"])
    assert.ok(LAYER_FILES.includes(`${couche}.layer.json`),
      `${couche} n'est montée nulle part — les 24 fiches existent mais personne ne les voit`);
});

/* ══ LA PROVENANCE — elle dit ce qu'on a le droit de diffuser ════════════ */

test("les 24 blurbs portent une provenance connue, et celle d'Eric est intacte", () => {
  const connues = new Set(["eric", "fh-original"]);
  const eric = [];
  for (const f of les24Fiches()) {
    assert.ok(connues.has(f.blurb.provenance),
      `${f.who} porte une provenance inconnue « ${f.blurb.provenance} » — ` +
      "elle dit ce qu'on a le droit de diffuser (loi §0.8), elle ne s'invente pas");
    if (f.blurb.provenance === "eric") eric.push(f.who);
  }
  assert.deepEqual(eric.sort(), ["fighter", "wizard"],
    "les deux textes de la main d'Eric sont le wizard et le fighter — " +
    "ni écrasés, ni étendus à des textes qu'il n'a pas écrits");
});
