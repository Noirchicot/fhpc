/* ══ LES GARDES DE LA FICHE À 360 — lot 77 ═══════════════════════════════

   ⭐ « Écris la CONDITION d'une décision comme un garde, pas comme un
   commentaire. » Deux nombres ont décidé la fiche à 360 px, et ils vivaient
   jusqu'ici dans un document :

     · **320 caractères** — la boîte du blurb est FIXE à 10 lignes (160 px).
       À 226 px de large en T2, une ligne porte 37 caractères (mesuré), donc
       ~370 avant débordement. ⚠️ La limite était posée à **340** ; passée sur
       les 24 fiches, elle s'est révélée verte ET inutile — trois blurbs
       remplissaient déjà les dix lignes. **Eric l'a descendue à 320 le
       2026-08-15** ; voir la doc de `LIMITE_BLURB`, plus bas.
       (`GABARIT-360-CLASS-SPECIES.md` §2.)
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
/* La SOURCE des comptes que la bande d'infos annonce (garde 6 bis). ⛔ Un
   nombre recopié d'un document n'est pas une donnée : ce qui peut être
   confronté au SRD l'est ici, et ce qui ne le peut pas se dit à voix haute
   dans la doc du garde plutôt que de passer pour vérifié. */
const SRD = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));

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
        stats: rec.changes["data[fiche_stats]"],
        /* ⚠️ LU TEL QUEL, `undefined` COMPRIS — l'ABSENCE est un état normal
           de la bande d'infos (garde 6), pas un trou à combler par `[]` :
           un repli à la liste vide effacerait ici la distinction même que le
           garde 6 existe pour tenir. */
        infos: rec.changes["data[fiche_infos]"]
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

/* ✅ 340 → 320, tranché par Eric le 2026-08-15 (lot 78).
   ⛔ LE MOTIF N'EST PAS LA PRUDENCE, C'EST UNE MESURE. Passé sur les 24
   fiches, ce garde était vert 24/24 — et il ne protégeait rien : mesurés
   dans la boîte RÉELLE de 226 px, druid (337), monk (333) et bard (332)
   remplissaient DÉJÀ les dix lignes, pendant que le plus long des vingt-
   quatre, le fighter (338), n'en prenait que neuf.
   **Le compte de caractères n'ordonne pas les hauteurs** : une césure
   malheureuse coûte une ligne entière. Un appareil dont la police résout un
   poil plus large faisait déborder trois fiches en silence, garde vert.

   📌 320 RESTE UN PROXY, et il s'assume comme tel — la vraie propriété est
   le nombre de LIGNES RENDUES, et c'est elle que le garde 4 mesure sur les
   traits (voir sa doc : là-bas, un plafond de caractères serait faux dans
   les deux sens). Ici, un blurb est UN paragraphe qui coule : le proxy tient,
   à condition de lui laisser de la marge. ⭐ Le jour où un blurb rougira à
   320 alors qu'il tenait en 9 lignes, ce sera au proxy de céder, pas au
   texte.

   ⚠️ LES QUATRE TEXTES ONT ÉTÉ RÉÉCRITS POUR CE NOMBRE, pas l'inverse :
   druid 337 → 303 · monk 333 → 299 · bard 332 → 317, et le **fighter
   338 → 298 sur décision d'Eric** — c'est son texte (`provenance: "eric"`),
   une seule subordonnée retirée, toutes ses autres images intactes. */
const LIMITE_BLURB = 320;
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

/* 🔴 LE GARDE SUIT LA BOÎTE, PAS LE TYPE DE TEXTE — lot 78.
   Depuis qu'Eric a donné la moitié basse d'une ESPÈCE à ses traits (croquis
   A), les douze blurbs d'espèce **n'occupent plus la boîte de 160 px**. Leur
   destination est le panneau `lore`, qui n'est pas construit et qui n'a
   aucune raison d'être une boîte fixe de dix lignes.

   ⛔ LES MESURER CONTRE 320 SERAIT MESURER LA MAUVAISE BOÎTE — la faute que
   ce fichier existe pour interdire, retournée contre lui-même. Les douze
   classes sont donc à 320 (le contenant réel, mesuré) ; les douze espèces
   gardent leur **borne d'avant, 340**, en attendant leur contenant.
   ⚠️ Ce n'est PAS un assouplissement : aucune espèce ne dépasse ce qu'elle
   respectait déjà. C'est une borne provisoire qui se dit provisoire, plutôt
   qu'un nombre juste appliqué au mauvais objet. */
const LIMITE_BLURB_ESPECE = 340;

test("garde 1 — aucun blurb de CLASSE ne dépasse 320 caractères (la boîte fixe)", () => {
  const fiches = les24Fiches();
  assert.equal(fiches.length, 24, "la couche fh-fiche-en doit porter 12 classes + 12 espèces");
  const classes = fiches.filter((f) => f.kind === "class");
  assert.equal(classes.length, 12);
  assert.deepEqual(blurbsTropLongs(classes), [],
    "⛔ NE RABOTE PAS LE TEXTE. C'est du contenu qu'Eric a validé : nomme la fiche " +
    "et son nombre, et remonte-le-lui (commande du lot 77, §3).");
});

test("garde 1 bis — les blurbs d'ESPÈCE tiennent leur borne provisoire, en attendant le panneau `lore`", () => {
  const especes = les24Fiches().filter((f) => f.kind === "species");
  assert.equal(especes.length, 12);
  assert.deepEqual(blurbsTropLongs(especes, LIMITE_BLURB_ESPECE), [],
    "leur contenant n'existe pas encore — mais rien ne doit s'allonger en attendant");
});

test("⚔️ ATTAQUE — un blurb d'UN caractère de trop est vu, et il est NOMMÉ", () => {
  const faux = [
    { kind: "class", who: "pile", blurb: { text: "x".repeat(LIMITE_BLURB) } },
    { kind: "class", who: "unDeTrop", blurb: { text: "x".repeat(LIMITE_BLURB + 1) } }
  ];
  /* ⛔ LE NOMBRE SE DÉDUIT DE LA LIMITE, IL NE SE RECOPIE PAS. Il était écrit
     « 341 » en dur : le jour où Eric a descendu la limite à 320, cette
     attaque rougissait pour une raison qui n'avait rien à voir avec ce
     qu'elle garde. Une constante recopiée à côté de sa source est la faute
     que ce dépôt paie en boucle. */
  assert.deepEqual(blurbsTropLongs(faux), [`class unDeTrop : ${LIMITE_BLURB + 1} caractères`],
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

/* ══ GARDE 4 — LA LISTE DE TRAITS D'UNE ESPÈCE (lot 78) ══════════════════
   ✅ Eric, 2026-08-15 : la moitié basse d'une ESPÈCE porte ses traits
   (croquis A), pas son blurb. Même boîte, même hauteur fixe : 10 lignes.

   🔴 ET CE GARDE COMPTE DES LIGNES, PAS DES CARACTÈRES — contrairement au
   garde 1. Ce n'est pas une incohérence, c'est la conséquence de ce que le
   lot 77 a mesuré : le compte de caractères N'ORDONNE PAS les hauteurs
   (le plus long des 24 blurbs tient en 9 lignes, trois plus courts en
   prennent 10). Pour le blurb, un proxi prudent suffit — c'est UN paragraphe
   qui coule. Pour les traits, chaque entrée casse SÉPARÉMENT : une entrée de
   38 caractères en coûte deux, une de 74 en coûte deux aussi. Un plafond de
   caractères y serait faux dans les deux sens.

   ⚠️ LE PIRE CAS EST L'ELFE, ET IL A ÉTÉ MAL COMPTÉ UNE FOIS. Une première
   cote annonçait 6 entrées au maximum : elle additionnait les traits SRD et
   oubliait les `fh_traits` que la couche FH AJOUTE — l'`Outlasting` du
   halfling, le `Splinter of Anon` de l'elfe, les deux de l'Humain. Le vrai
   maximum est **7** (elfe : 5 SRD + 1 FH + `Destiny`).
   📌 Troisième fois de la séance qu'un échantillon incomplet passe pour une
   mesure. C'est pour ça que ce garde lit la COUCHE et ne connaît aucun
   nombre d'entrées d'avance. */

const BOITE_PX = 226;   // la largeur de la boîte, §5 du gabarit
const LIGNES_MAX = 10;  // 160 px / 16 — la même que le blurb, par construction

/** Le nombre de lignes qu'une chaîne occupe dans une boîte, par coupe
 *  gourmande aux espaces — ce que fait un navigateur. ⛔ Pas une division de
 *  la largeur totale : un mot qui ne rentre pas passe à la ligne ENTIER, et
 *  c'est précisément ce que le compte de caractères ne sait pas voir. */
export function nbLignes(chaine, boite = BOITE_PX) {
  let lignes = 1, courante = "";
  for (const mot of chaine.split(" ")) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (largeurT2(essai, "normal") <= boite || !courante) courante = essai;
    else { lignes += 1; courante = mot; }
  }
  return lignes;
}

/** Les espèces dont la liste de traits déborde de la boîte, nommées avec
 *  leur compte — une fonction pure, comme `blurbsTropLongs`. */
export function traitsTropLongs(especes, max = LIGNES_MAX) {
  return especes
    .map((e) => ({ who: e.who, lignes: (e.traits || []).reduce((n, t) => n + nbLignes(`${t.name} — ${t.effect}`), 0) }))
    .filter((e) => e.lignes > max)
    .map((e) => `species ${e.who} : ${e.lignes} lignes`);
}

function les12Especes() {
  return Object.entries(fiche.records.species).map(([id, rec]) => ({
    who: id.split(":").pop(), traits: rec.changes["data[fiche_traits]"]
  }));
}

test("garde 4 — les douze espèces portent leurs traits, et aucune ne dépasse 10 lignes", () => {
  const especes = les12Especes();
  assert.equal(especes.length, 12);
  for (const e of especes) {
    assert.ok(Array.isArray(e.traits) && e.traits.length > 0, `${e.who} n'a pas de traits`);
    for (const t of e.traits) {
      assert.equal(typeof t.name, "string", `${e.who} : un trait sans nom`);
      assert.equal(typeof t.effect, "string", `${e.who} : ${t.name} sans effet`);
    }
  }
  assert.deepEqual(traitsTropLongs(especes), []);
});

test("garde 4 — le pire cas est l'ELFE, et il porte bien SEPT entrées", () => {
  /* La mesure qui a corrigé la cote : si un jour l'elfe en perd une ou qu'une
     autre espèce le dépasse, ce test le dit AVANT que la boîte déborde. */
  const especes = les12Especes();
  const max = especes.reduce((a, e) => (e.traits.length > a.traits.length ? e : a));
  assert.equal(max.traits.length, 7, "le maximum d'entrées");
  assert.equal(max.who, "elf");
  assert.ok(max.traits.some((t) => t.name === "Splinter of Anon"),
    "et c'est bien un `fh_trait` qui fait la septième — l'oubli qui avait faussé la première cote");
  assert.ok(especes.every((e) => e.traits.some((t) => t.name === "Destiny")),
    "chaque espèce porte sa ligne Destiny, comme le croquis A la dessine");
});

test("⚔️ ATTAQUE — garde 4 : une entrée de trop est vue, et le garde MORD sur les LIGNES", () => {
  const long = "Naturally Stealthy — you can hide behind any creature at least one size larger than you are";
  assert.equal(nbLignes(long) > 1, true, "mesure : cette entrée-là prend bien plus d'une ligne");
  const faux = [{ who: "test", traits: Array.from({ length: 6 }, () => ({ name: "Naturally Stealthy", effect: "you can hide behind any creature at least one size larger than you are" })) }];
  assert.equal(traitsTropLongs(faux).length, 1, "six entrées à deux lignes = 12 : le garde les refuse");
  const bon = [{ who: "test", traits: Array.from({ length: 7 }, () => ({ name: "Trance", effect: "long rest in 4 hours" })) }];
  assert.deepEqual(traitsTropLongs(bon), [], "sept entrées d'une ligne passent — c'est le cas réel de l'elfe");
});

/* ══ GARDE 5 — LA LARGEUR DES NOMS DU RAIL (lot 78) ══════════════════════
   🔴 LE GARDE QUI MANQUAIT, ET IL A COÛTÉ UN NOM TRONQUÉ. `Dragonborn` est
   sorti du rail pendant une journée, en silence : la largeur du rail ne
   vivait que dans un document, cotée sur `Barbarian` — la plus longue
   CLASSE. Les douze ESPÈCES n'avaient jamais été regardées.

   📏 LA LARGEUR DE TEXTE EST 74, ET ELLE SE DÉDUIT DE DEUX REMBOURRAGES QUI
   S'EMPILENT (`shell.css`) : 78 (rail) − 2×2 (`.catalogue-rail`) − 0
   (`.catalogue-rail-item`). ⚠️ Un relevé intermédiaire annonçait « 70 utiles »
   en mesurant la boîte de l'ITEM et non celle du TEXTE.
   ⭐ Le cran courant est en GRAS (`font-weight: 600`) : c'est lui qu'on
   mesure. Mesurer le normal rendrait le garde faux de 3 px, dans le sens qui
   ne se voit pas. */

const RAIL_TEXTE_PX = 74;

export function nomsDuRailTropLarges(noms, largeur = RAIL_TEXTE_PX) {
  return noms
    .map((n) => ({ n, px: largeurT2(n, "gras") }))
    .filter((x) => x.px > largeur)
    .map((x) => `${x.n} : ${x.px.toFixed(1)} px pour ${largeur}`);
}

test("garde 5 — aucun nom du rail ne déborde de sa colonne, à T2, en gras", () => {
  const noms = les24Fiches().map((f) => f.who[0].toUpperCase() + f.who.slice(1));
  assert.equal(noms.length, 24);
  assert.deepEqual(nomsDuRailTropLarges(noms), []);
});

test("garde 5 — `Dragonborn` est le pire cas, et la marge est MINCE (elle se dit)", () => {
  const px = largeurT2("Dragonborn", "gras");
  assert.ok(px > largeurT2("Halfling", "gras"), "mesure : c'est bien le plus large des 24");
  assert.ok(px <= RAIL_TEXTE_PX, `Dragonborn ${px.toFixed(1)} px doit tenir dans ${RAIL_TEXTE_PX}`);
  assert.ok(RAIL_TEXTE_PX - px < 5,
    "la marge est de quelques px, PAS confortable — si elle grandit, c'est que quelqu'un a bougé le rail sans le dire");
});

test("⚔️ ATTAQUE — garde 5 : le rail d'AVANT (62 px de texte) rougirait sur Dragonborn", () => {
  /* La configuration qui a réellement tronqué le nom : 4+4 de rembourrage
     empilés. Le garde doit la refuser — sinon il ne prouve rien. */
  assert.equal(nomsDuRailTropLarges(["Dragonborn"], 62).length, 1);
  assert.deepEqual(nomsDuRailTropLarges(["Halfling"], 62), [], "et il ne crie pas sur les noms qui tenaient déjà");
});

test("garde 5 — la feuille pose bien les deux rembourrages que le garde suppose", () => {
  /* ⛔ SANS CE TEST, LE GARDE 5 MESURE UNE COLONNE IMAGINAIRE. C'est la
     faute que le lot 77 a payée : un nombre juste, rapporté à une boîte que
     personne n'avait vérifiée. */
  /* ⚠️ CES TROIS ASSERTIONS ONT ÉTÉ REPOINTÉES LE 2026-08-15, ET LE GARDE A
     FAIT SON TRAVAIL EN ROUGISSANT. Eric : « dalles de classe trop près du
     bord », puis « juste un espace d'un caractère, le "a" ». Les crans
     commençaient à 2 px du bord de l'écran ; le rembourrage du rail passe
     donc de `--sp-2` à `--sp-8`.

     ⭐ ET LE NOMBRE DU GARDE, LUI, N'A PAS BOUGÉ : 74 px de texte. C'est
     `--rail-w` qui a absorbé les 12 px (78 → 90), pas la colonne de texte —
     sinon `Dragonborn` (70,4) se retronquait, ce que le garde 5 aurait
     attrapé une ligne plus haut. Les deux tests se tiennent l'un l'autre :
     celui-ci fige la BOÎTE, l'autre fige ce qu'on met dedans. */
  const css = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8");
  const jetons = fs.readFileSync(path.join(ROOT, "ui", "builder", "tokens.css"), "utf8");
  assert.match(jetons, /--rail-w:\s*90px/,
    "la colonne du rail : 90 px, dont 8 de rembourrage de chaque côté");
  assert.match(css, /\.catalogue-rail\s*\{[^}]*padding:\s*var\(--sp-8\);/,
    "la liste du rail : 8 px de rembourrage — l'espace d'un « a » demandé par Eric");
  assert.match(css, /\.catalogue-rail-item\s*\{[^}]*padding:\s*var\(--sp-8\)\s+0/,
    "et le cran lui-même : aucun rembourrage horizontal, sinon les 74 px fondent");
  assert.match(css, /\.catalogue-rail-item\s*\{[^}]*font-size:\s*var\(--t2\)/,
    "les noms sont à T2 — la décision d'Eric du 2026-08-15");
  /* L'arithmétique, écrite comme un garde et pas comme un commentaire. */
  assert.equal(90 - 8 - 8, RAIL_TEXTE_PX,
    "90 − 8 − 8 doit valoir la largeur de texte que le garde 5 mesure");
});

/* ══ GARDE 6 — LA BANDE D'INFOS COMPLÉMENTAIRES (lot 78b) ════════════════
   La bande vit sous le bloc haut, pleine largeur, et la feuille la cote :
   **40 px de haut**, **226 px de large** (242 de dalle − 2 × 8 de
   rembourrage), texte à T2. Soit **deux entrées d'une ligne**, étiquette en
   gras + valeur en normal — exactement la forme d'une ligne de stats.

   ── CE QUE CE GARDE TIENT, ET POURQUOI CHACUN ──────────────────────────
   1. **Une entrée tient dans 226 px.** Même faute que la colonne de stats,
      autre boîte : une entrée trop large déborde de la bande.
   2. **Deux entrées au maximum.** 40 px = deux lignes de 16 et leur air ; la
      troisième sort de la bande et pousse le blurb.
   3. **Une bande PRÉSENTE n'est jamais VIDE.** 🔴 C'est le garde qui compte
      le plus, et il ne protège pas du texte : il protège la GRILLE. Sept
      espèces sur douze n'offrent aucun lignage et n'ont donc PAS de bande —
      et c'est cette absence qui fait basculer la fiche sur l'autre gabarit
      (`data-infos="non"`, blurb centré). Une bande présente mais vide
      passerait le gabarit « oui » en réservant 40 px pour rien : un faux
      magasin, qui casse la mise en page sans rougir.
      ⭐ D'où la lecture BRUTE dans `les24Fiches` : `undefined` (pas de
      bande) et `[]` (bande vide) sont deux états DIFFÉRENTS, et le garde
      accepte le premier, refuse le second.

   ── LA GOUTTIÈRE EST MESURÉE, PAS DEVINÉE ──────────────────────────────
   ⛔ `largeurLigneStats` ne convient PAS ici, et l'écart va dans le mauvais
   sens. Elle modélise l'écart étiquette/valeur par une ESPACE (3,375 px à
   T2) parce que la colonne de stats colle ses deux boîtes ; la bande, elle,
   pose une vraie gouttière flex de `var(--sp-4)` = **4 px**. Réutiliser la
   ligne de stats sous-estimerait donc chaque entrée de 0,625 px — petit,
   mais du côté qui laisse passer. La gouttière est reprise du CSS, et le
   dernier test de ce garde vérifie qu'elle y est encore. */

const BANDE_PX = 226;          // 242 (--fiche-dalle-w) − 2 × 8 (padding)
const INFOS_MAX = 2;           // 40 px (--fiche-infos-h) / 16
const GOUTTIERE_INFOS = 4;     // `.fiche-info-row { gap: var(--sp-4) }`

/** Une entrée de la bande telle que la fiche la pose : l'étiquette en GRAS
 *  avec son deux-points, la gouttière de 4 px, puis la valeur en normal. */
export function largeurLigneInfos(label, value) {
  return largeurT2(`${label} :`, "gras") + GOUTTIERE_INFOS + largeurT2(value, "normal");
}

/** Les fiches dont la bande est fautive, NOMMÉES avec leur nombre — fonction
 *  pure, comme `blurbsTropLongs` et `traitsTropLongs` : les 24 fiches réelles
 *  et les attaques passent par le MÊME code. Une fiche SANS bande n'est pas
 *  fautive : c'est l'état de sept espèces sur douze. */
export function bandesFautives(fiches, largeur = BANDE_PX, max = INFOS_MAX) {
  const out = [];
  for (const f of fiches) {
    if (f.infos === undefined || f.infos === null) continue;   // pas de bande : normal
    if (!Array.isArray(f.infos) || f.infos.length === 0) {
      out.push(`${f.kind} ${f.who} : bande présente et VIDE`);
      continue;
    }
    if (f.infos.length > max) out.push(`${f.kind} ${f.who} : ${f.infos.length} entrées pour ${max}`);
    for (const ligne of f.infos) {
      if (!ligne || typeof ligne.label !== "string" || typeof ligne.value !== "string") {
        out.push(`${f.kind} ${f.who} : une entrée sans label ou sans value`);
        continue;
      }
      const w = largeurLigneInfos(ligne.label, ligne.value);
      if (w > largeur) {
        out.push(`${f.kind} ${f.who} — « ${ligne.label} : ${ligne.value} » = ${w.toFixed(1)} px pour ${largeur}`);
      }
    }
  }
  return out;
}

test("garde 6 — aucune bande d'infos ne déborde, n'excède 2 entrées, ni n'est vide", () => {
  assert.deepEqual(bandesFautives(les24Fiches()), [],
    "⛔ NE RABOTE PAS L'ÉTIQUETTE TOUT SEUL : la bande fait 226 px et deux lignes. " +
    "Nomme la fiche et son nombre, et remonte-le (commande du lot 77, §3).");
});

test("garde 6 — QUI porte une bande : les douze classes, et CINQ espèces sur douze", () => {
  /* 📌 Le partage lui-même est une décision, donc un garde. Les sept espèces
     sans lignage n'ont PAS de bande, et c'est leur absence qui centre leur
     moitié basse — l'inverse (une bande vide) passerait le garde du dessus
     ligne à ligne tout en cassant la grille. */
  const fiches = les24Fiches();
  const avec = fiches.filter((f) => f.infos !== undefined).map((f) => `${f.kind} ${f.who}`).sort();
  const sans = fiches.filter((f) => f.infos === undefined).map((f) => f.who).sort();
  assert.equal(avec.filter((x) => x.startsWith("class ")).length, 12,
    "les douze classes portent leur bande — le SRD leur donne toutes une sous-classe");
  assert.deepEqual(sans, ["araag", "dwarf", "elestu", "halfling", "human", "loroka", "orc"],
    "les sept espèces qui n'offrent AUCUN lignage, ni au SRD ni dans fh-species-en");
  assert.equal(avec.length, 17);
});

test("garde 6 bis — les comptes annoncés sont ceux de la DONNÉE, pas d'un document", () => {
  /* ⭐ « C'est le genre de nombre qu'on recopie de travers » — Eric. Ce qui
     est STRUCTURÉ dans le SRD est confronté ici :
       · elf et tiefling portent `data.lineages`, une vraie liste ;
       · les douze classes portent `data.subclass`, un objet UNIQUE, plus une
         aptitude de niveau 3 nommée « <Classe> Subclass ».
     ⚠️ CE QUI N'EST PAS MESURABLE ICI EST DIT, PAS SIMULÉ : les lignages du
     dragonborn (10), du goliath (6) et du gnome/Hoddon (2) ne sont PAS des
     données — ils vivent dans la PROSE d'un trait (la table « Draconic
     Ancestors », les six « (… Giant) », les deux « … Gnome. »). Les compter
     demanderait de lire de l'anglais à la regex, et un analyseur fragile qui
     verdit sur un SRD reformaté est pire qu'un compte à la main assumé.
     Ces trois-là ont été comptés à la main dans le texte du trait. */
  const infosDe = (kind, who) => les24Fiches().find((f) => f.kind === kind && f.who === who).infos;

  for (const who of ["elf", "tiefling"]) {
    const lineages = SRD.records.species[`srd:species:en:${who}`].data.lineages;
    assert.equal(infosDe("species", who)[0].value, `${lineages.length} types`,
      `${who} annonce un compte que la liste \`data.lineages\` du SRD ne porte pas`);
  }

  for (const [id, rec] of Object.entries(SRD.records.class)) {
    const who = id.split(":").pop();
    assert.equal(typeof rec.data.subclass, "object");
    assert.ok(!Array.isArray(rec.data.subclass) && typeof rec.data.subclass.name === "string",
      `${who} : le SRD porte UNE sous-classe nommée, pas une liste — c'est d'elle que vient « 1 type »`);
    const niveaux = rec.data.features.filter((f) => f.name.toLowerCase().endsWith(" subclass")).map((f) => f.level);
    assert.deepEqual(niveaux, [3],
      `${who} : « at level 3 » vient de l'aptitude « ${rec.data.name} Subclass », et d'elle seule`);
    assert.deepEqual(infosDe("class", who), [{ label: "Subclass", value: "1 type, at level 3" }],
      `${who} : la bande annonce ce que la donnée porte — une sous-classe, au niveau 3`);
  }
});

test("⚔️ ATTAQUE — garde 6 : les trois fautes sont vues, et NOMMÉES", () => {
  /* Chacune des trois propriétés a son attaque, et une fiche saine passe à
     côté de chacune — sinon le garde ne prouve rien. */
  const saine = { kind: "species", who: "ok", infos: [{ label: "Lineages", value: "10 types" }] };
  const absente = { kind: "species", who: "sansBande" };            // sept espèces réelles
  assert.deepEqual(bandesFautives([saine, absente]), [],
    "la plus large des bandes réelles passe, et l'ABSENCE de bande n'est pas une faute");

  const large = { kind: "class", who: "tropLarge", infos: [{ label: "Subclass", value: "Warrior of the Open Hand (level 3)" }] };
  assert.equal(largeurLigneInfos("Subclass", "Warrior of the Open Hand (level 3)") > BANDE_PX, true,
    "mesure : nommer la sous-classe du moine ET son niveau ne tient PAS dans la bande");
  assert.equal(bandesFautives([large]).length, 1, "et le garde la refuse");

  const trois = { kind: "class", who: "troisEntrees", infos: [
    { label: "Subclass", value: "1 type" }, { label: "Subclass", value: "1 type" }, { label: "Subclass", value: "1 type" }
  ] };
  assert.deepEqual(bandesFautives([trois]), ["class troisEntrees : 3 entrées pour 2"]);

  const vide = { kind: "species", who: "fauxMagasin", infos: [] };
  assert.deepEqual(bandesFautives([vide]), ["species fauxMagasin : bande présente et VIDE"],
    "⛔ la faute qui ne se voit pas à l'œil : elle passe le gabarit « oui » et réserve 40 px pour rien");
});

test("⚔️ ATTAQUE — garde 6 : la gouttière de 4 px n'est pas une espace de 3,375", () => {
  /* La sous-estimation que `largeurLigneStats` introduirait ici. Elle est
     petite ET du mauvais côté : le garde doit mesurer la vraie gouttière. */
  const espace = largeurLigneStats("Subclass", "1 type, at level 3");
  const gouttiere = largeurLigneInfos("Subclass", "1 type, at level 3");
  assert.ok(gouttiere > espace, "la gouttière flex coûte plus large que l'espace du modèle de stats");
  assert.ok(Math.abs((gouttiere - espace) - (GOUTTIERE_INFOS - METRIQUE.avances.normal[" "])) < 1e-9,
    "et l'écart est exactement celui des deux modèles — 4 px contre l'avance mesurée de l'espace");
});

test("garde 6 — la feuille pose bien la bande que le garde suppose", () => {
  /* ⛔ SANS CE TEST, LE GARDE 6 MESURE UNE BANDE IMAGINAIRE — la faute du
     lot 77, dont le garde 5 porte déjà la leçon : un nombre juste, rapporté
     à une boîte que personne n'avait vérifiée. Si Eric bouge une de ces
     cotes, ce test rougit, et c'est le comportement voulu : les nombres du
     garde ont bougé avec elle. */
  const css = fs.readFileSync(path.join(ROOT, "ui", "builder", "fiche.css"), "utf8");
  assert.match(css, /--fiche-dalle-w:\s*242px/, "la dalle : 242 px, dont 226 utiles");
  assert.match(css, /--fiche-infos-h:\s*40px/, "la bande : 40 px, soit deux lignes à T2");
  assert.match(css, /\.fiche-info-row\s*\{[^}]*gap:\s*var\(--sp-4\)/, "la gouttière étiquette/valeur : 4 px");
  assert.match(css, /\.fiche-info-row dt\s*\{[^}]*font-weight:\s*600/, "l'étiquette est en GRAS — le poids que le garde mesure");
});
