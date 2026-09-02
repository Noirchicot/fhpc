/* ══ LE GARDE DU PARTAGE D'ÉCRAN — lot 133, 2026-09-02 ═════════════════════

   📐 Eric : *« Concept. Builder plein écran sur mobile. […] Etc… »* · *« Donc
   largeur plutôt basée sur la largeur, et un plancher à la hauteur ; si ça
   passe pas on saute un cran en dessous. »* · *« 7 crans »*.

   🔴 CE QUE CE FICHIER GARDE — l'INVARIANT, jamais la table récitée :

     1. la LARGEUR pose le barreau, et rien d'autre à ce stade ;
     2. la HAUTEUR ne fait que DESCENDRE — le panneau ne dépasse jamais la
        place, et un saut de cran RÉTRÉCIT toujours ;
     3. les sept noms n'existent qu'à UN endroit du dépôt ;
     4. le panneau nu est un plancher partout SAUF sur les crans en plein
        écran, où vit le cran réduit (`360 / 375`, le quotient).

   ⛔ IL NE RÉCITE PAS `BARREAUX`. Un garde qui recopierait la table ne
   garderait que lui-même : il passerait au vert le jour où quelqu'un change
   les deux au même endroit. Il relit donc la table et vérifie ce qu'elle
   PRODUIT — et les clauses ⚔️ prouvent qu'elle pourrait échouer.

   ⚠️ AUCUN DOM RÉEL : `echelle.mjs` ne lit que `getComputedStyle`. On lui
   donne des jetons en mémoire ; la géométrie se regarde au navigateur. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

/* ── LE DÉCOR ────────────────────────────────────────────────────────────
   Les cotes du dépôt servent de décor, jamais d'attente : les clauses qui
   comptent les BOUGENT et regardent (leçon du décor à « 520px »). */
const PANNEAU = 375;
const HAUTEUR = 560;
const JETONS = { "--panneau-l": String(PANNEAU), "--panneau-h": String(HAUTEUR),
                 "--sp-8": "8", "--colonnes": "1" };

function faireRacine(jetons = JETONS) {
  const style = new Map(Object.entries(jetons));
  return { dataset: {}, style: { setProperty() {} }, __jetons: style };
}
globalThis.getComputedStyle = (n) => ({ getPropertyValue: (nom) => (n.__jetons.get(nom) ?? "") });
const racine = faireRacine();

const { BARREAUX, barreauPour, barreauVoisin, tailleDuBarreau, cranAuto, laPlaceDuDouble } =
  await import("../ui/builder/echelle.mjs");

/** La largeur et la hauteur PEINTES du panneau, en pixels d'écran. */
const panneauPeint = (l, h, r = racine) => {
  const f = cranAuto(l, h, r);
  return { f, l: PANNEAU * f, h: HAUTEUR * f };
};

/** Un balayage large : toutes les formes que ce lot a mesurées, plus des
 *  fenêtres quelconques — dont les DEUX bords de chaque seuil, là où une
 *  règle de palier se trompe. */
function balayage() {
  const cas = [[360, 800], [375, 812], [414, 896], [700, 900],
               [768, 1024], [1024, 1366], [1180, 820], [1366, 1024],
               [1440, 900], [1680, 1050], [1920, 1080], [2560, 1440],
               [3440, 1440], [3840, 2160]];
  for (const b of BARREAUX) {
    if (b.depuis === null) continue;
    for (const l of [b.depuis - 1, b.depuis, b.depuis + 1]) {
      for (const h of [700, 820, 900, 1024, 1080, 1440]) cas.push([l, h]);
    }
  }
  return cas;
}

/* ══ 1 — LA HAUTEUR NE DÉBORDE JAMAIS ════════════════════════════════════ */

test("🔴 le panneau ne dépasse JAMAIS la place disponible, dans les deux sens", () => {
  /* Eric : *« un plancher à la hauteur ; si ça passe pas on saute un cran en
     dessous »*. Ce que le joueur doit constater est plus simple que le
     mécanisme : ça rentre. */
  const dernier = BARREAUX[BARREAUX.length - 1];
  const residus = [];
  for (const [l, h] of balayage()) {
    const p = panneauPeint(l, h);
    assert.ok(p.l <= l + 1e-9, `à ${l} × ${h} le panneau fait ${p.l.toFixed(1)} de large`);
    /* ⚠️ LE SEUL RÉSIDU CONNU, ET IL EST NOMMÉ PLUTÔT QUE MASQUÉ : quand même
       le DERNIER cran ne tient pas en hauteur, la descente n'a plus rien sous
       elle et le panneau déborde. Eric : *« si même le dernier ne passe pas,
       signale-le »* — ⛔ pas d'un huitième cran inventé ici. */
    if (p.h > h + 1e-9) {
      residus.push(`${l} × ${h}`);
      assert.ok(tailleDuBarreau(dernier, PANNEAU, l) * (HAUTEUR / PANNEAU) > h + 1e-9,
        `à ${l} × ${h} le panneau déborde alors que le DERNIER cran, lui, tiendrait — la descente a raté, et c'est un défaut`);
    }
  }
  assert.ok(residus.length > 0,
    "⚔️ le balayage doit CONTENIR le cas résiduel — sinon cette clause ne prouve rien et il repasserait inaperçu");
});

test("⚔️ ATTAQUE — l'iPad Air couché DÉBORDERAIT sans le saut de cran, et c'est le seul cas de la table", () => {
  /* 📏 LE RED PROOF DU LOT, mesuré : 1180 × 820 tombe sur le cran du demi.
     `1180 / 2 = 590` de large, donc `590 × 560/375 = 881` de haut pour 820
     disponibles — il déborde de 61. Le saut le fait retomber au cran suivant
     et il rend 393 × 587.
     ⛔ SI CETTE CLAUSE DEVIENT VERTE SANS LE SAUT, le mécanisme est mort et
     la table seule le cachait. */
  const pose = barreauPour(1180, PANNEAU);
  const sansSaut = tailleDuBarreau(pose, PANNEAU, 1180);
  assert.ok(sansSaut * (HAUTEUR / PANNEAU) > 820 + 1e-9,
    `le barreau posé par la largeur demande ${(sansSaut * HAUTEUR / PANNEAU).toFixed(0)} de haut — il doit DÉBORDER 820, sinon la clause ne prouve rien`);

  const p = panneauPeint(1180, 820);
  assert.ok(p.l < sansSaut - 1e-9,
    `le saut doit RÉTRÉCIR : ${p.l.toFixed(0)} contre ${sansSaut.toFixed(0)}`);
  assert.ok(p.h <= 820 + 1e-9, `et tenir après : ${p.h.toFixed(0)} pour 820`);
  assert.equal(Math.round(p.l), 393, "393 de large — la mesure d'Eric, refaite");
  assert.equal(Math.round(p.h), 587, "587 de haut, soit 72 % de l'écran");
});

test("⚔️ ATTAQUE — le saut ne se déclenche PAS quand la hauteur porte le cran", () => {
  /* Un saut qui se déclencherait partout rendrait la clause d'au-dessus
     verte pour la mauvaise raison. Sur l'iPad Pro couché, le demi tient
     PILE — 1020 pour 1024 — et il ne doit pas sauter. */
  const p = panneauPeint(1366, 1024);
  assert.equal(Math.round(p.l), 683, "1366 / 2 = 683 : le demi, intact");
  assert.equal(Math.round(p.h), 1020, "1020 pour 1024 disponibles — ça tient, donc on ne saute pas");
});

/* ══ 2 — LA LARGEUR POSE LE BARREAU ══════════════════════════════════════ */

test("🔴 la largeur seule choisit le barreau — la hauteur n'entre pas dans ce choix", () => {
  for (const [l] of balayage()) {
    const a = barreauPour(l, PANNEAU);
    for (const h of [400, 900, 4000]) assert.equal(barreauPour(l, PANNEAU), a,
      `à ${l} de large le barreau ne doit pas dépendre d'une hauteur de ${h}`);
  }
});

test("🔴 un écran plus large ne pose jamais un barreau plus généreux", () => {
  /* La table est une ÉCHELLE : les diviseurs ne peuvent que croître quand
     l'écran grandit. Une inversion ferait grossir le builder d'un cran à
     l'autre, et le saut de hauteur se mettrait à remonter. */
  let precedent = 0;
  for (const b of BARREAUX) {
    assert.ok(b.part >= precedent, `${b.nom} rompt l'ordre des parts`);
    precedent = b.part;
  }
});

/* ══ 3 — LE PLANCHER, ET LE CRAN RÉDUIT ══════════════════════════════════ */

test("🔴 un partage ne rend jamais moins que le panneau nu — sauf en plein écran", () => {
  /* ⭐ Sous le dessin, un builder n'est pas « plus petit », il est COUPÉ. Le
     plancher est donc le panneau LU DANS LES JETONS, jamais un 375 recopié. */
  for (const b of BARREAUX) {
    if (b.part === 1) continue;
    for (const l of [b.depuis, b.depuis + 400, 4000]) {
      assert.ok(tailleDuBarreau(b, PANNEAU, l) >= PANNEAU - 1e-9,
        `${b.nom} rend moins que le panneau à ${l} de large`);
    }
  }
});

test("⚔️ ATTAQUE — le plancher SUIT le jeton, il n'est pas figé à 375", () => {
  const large = faireRacine({ ...JETONS, "--panneau-l": "800" });
  const f = cranAuto(1920, 3000, large);
  assert.ok(800 * f >= 800 - 1e-9,
    "un panneau de 800 doit imposer un plancher de 800 — sinon la cote est recopiée quelque part");
});

test("🔴 LE PREMIER CRAN est le seul endroit où l'échelle passe sous 1, et 0,96 est un QUOTIENT", () => {
  /* Eric, 31/08 : *« si tu réduis de 4 % la taille sur mini mobile c'est ok,
     donc ce palier s'appelle le réduit »*. ⛔ Le 96 % ne s'écrit pas : il vaut
     `360 / 375`, et il doit tomber tout seul du partage plein écran. */
  assert.equal(cranAuto(360, 800, racine), 360 / PANNEAU, "le quotient, exactement");
  for (const [l, h] of balayage()) {
    if (l >= PANNEAU) assert.ok(cranAuto(l, h, racine) >= 1 - 1e-9,
      `à ${l} × ${h} l'échelle descend sous 1 alors que la fenêtre porte le dessin`);
  }
});

test("⚔️ ATTAQUE — le premier cran bouge avec le jeton, ce n'est pas la bande « sous 375 »", () => {
  const large = faireRacine({ ...JETONS, "--panneau-l": "800" });
  assert.ok(cranAuto(700, 4000, large) < 1,
    "avec un panneau de 800, une fenêtre de 700 est sous le dessin — la frontière est le DESSIN, pas un nombre");
});

/* ══ 4 — LE VERBE, ET LE SENS DU SAUT ════════════════════════════════════ */

test("🪜 `barreauVoisin` compte en TAILLE RENDUE — `-1` rétrécit, `+1` agrandit", () => {
  /* ⛔ LA FAUTE QUE CE LOT A FAILLI ÉCRIRE : compter en indice au lieu de
     compter en taille inverse le saut, et l'iPad Air couché se mettrait à
     GROSSIR au lieu de descendre. Le lot 134 appellera ce verbe. */
  const large = 2000;
  for (const b of BARREAUX) {
    const dessous = barreauVoisin(b, -1);
    if (dessous) assert.ok(tailleDuBarreau(dessous, PANNEAU, large) <= tailleDuBarreau(b, PANNEAU, large) + 1e-9,
      `« un cran en dessous » de ${b.nom} doit rendre moins, pas plus`);
    const dessus = barreauVoisin(b, 1);
    if (dessus) assert.ok(tailleDuBarreau(dessus, PANNEAU, large) >= tailleDuBarreau(b, PANNEAU, large) - 1e-9,
      `« un cran au-dessus » de ${b.nom} doit rendre plus, pas moins`);
  }
  assert.equal(barreauVoisin(BARREAUX[BARREAUX.length - 1], -1), null, "sous le dernier, il n'y a rien");
  assert.equal(barreauVoisin(BARREAUX[0], 1), null, "au-dessus du premier non plus");
});

/* ══ 5 — LE MODE WIDGET SUR TOUT LE BUREAU ═══════════════════════════════ */

test("🔴 aucune largeur de bureau ne rend un panneau plein cadre", () => {
  /* Eric : *« Tout passe en mode widget pour desktops. »* Le panneau laisse
     donc toujours du décor à côté de lui dès qu'on quitte le plein écran. */
  for (const [l, h] of balayage()) {
    if (barreauPour(l, PANNEAU).part === 1) continue;
    const p = panneauPeint(l, h);
    assert.ok(p.l < l - 1e-9, `à ${l} × ${h} le panneau prend toute la largeur — ce n'est plus un widget`);
  }
});

/* ══ 6 — LA VUE DOUBLE N'EST PAS TOUCHÉE ═════════════════════════════════ */

test("🚪 la porte du double affichage lit la règle sacrée, que ce lot n'a pas amendée", () => {
  /* ⛔ La vue double appartient au lot 120. Ce lot ne la construit pas et ne
     doit pas la fermer : à deux colonnes, l'échelle reste continue. */
  assert.equal(laPlaceDuDouble(1366, 1024, racine), true, "un iPad Pro couché porte deux panneaux");
  assert.equal(laPlaceDuDouble(1180, 820, racine), true, "un iPad Air couché aussi");
  assert.equal(laPlaceDuDouble(375, 812, racine), false, "un téléphone, non");
});

test("⭐ deux panneaux au demi font exactement la largeur de l'écran", () => {
  /* C'est l'identité qui réconcilie les deux phrases d'Eric — *« 1/2 »* et
     *« proposition de passage en affichage double d'office »* sont la même
     idée par les deux bouts. Elle n'est vraie que parce que le partage se
     calcule sur la fenêtre COURANTE. */
  const tablette = BARREAUX.find((b) => b.part === 2);
  for (const l of [768, 1024, 1180, 1366]) {
    assert.equal(tailleDuBarreau(tablette, PANNEAU, l) * 2, l,
      `à ${l} de large, deux panneaux au demi doivent faire ${l}`);
  }
});

/* ══ 7 — UNE SEULE DÉCLARATION DES NOMS ══════════════════════════════════ */

test("🔴 les noms des crans n'existent QU'À UN ENDROIT du dépôt", () => {
  /* ⛔ Un renommage doit être UNE édition. Le lot 134 les lira dans
     `BARREAUX` ; un libellé, un test ou un commentaire qui les recopie
     survivrait au renommage et mentirait. */
  const fichiers = [];
  const marcher = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) marcher(p);
      else if (/\.(mjs|js|css|html)$/.test(e.name)) fichiers.push(p);
    }
  };
  marcher(UI);
  marcher(path.join(ROOT, "tests"));

  for (const b of BARREAUX) {
    const motif = new RegExp(`["'\`]${b.nom}["'\`]`, "g");
    const ou = [];
    for (const f of fichiers) {
      const n = (stripComments(fs.readFileSync(f, "utf8")).match(motif) || []).length;
      if (n) ou.push(`${path.relative(ROOT, f)} (${n})`);
    }
    assert.deepEqual(ou, ["ui/builder/echelle.mjs (1)"],
      `« ${b.nom} » doit être écrit UNE fois, dans la table des barreaux — trouvé : ${ou.join(", ") || "nulle part"}`);
  }
});

/* ══ 8 — LES DEUX BORNES DU CRAN DES TABLETTES, RATIFIÉES LE 02/09 ═══════ */

test("🔴 le seuil d'un cran est assez haut pour que sa part soit une VRAIE part", () => {
  /* ⭐ L'INVARIANT QUI EXPLIQUE LE SEUIL D'ENTRÉE, et qui rend inutile tout
     jugement sur les appareils : à l'entrée de son cran, le partage doit déjà
     rendre AU MOINS le dessin. Un cran dont l'entrée serait plus basse
     rendrait une part rabotée par le plancher — le joueur y verrait le même
     panneau qu'au cran d'en dessous, pour un écran plus grand.
     📏 Mesuré : 768/2 = 384 · 1440/3 = 480 · 1680/4 = 420 · 2200/5 = 440 ·
     3000/6 = 500. Le plancher n'est donc JAMAIS atteint à une entrée : il est
     une défense, pas un mécanisme. */
  for (const b of BARREAUX) {
    if (b.part === 1) continue;
    assert.ok(b.depuis / b.part >= PANNEAU,
      `${b.nom} entre à ${b.depuis} : sa part y rend ${(b.depuis / b.part).toFixed(0)}, sous le dessin`);
  }
});

test("⚔️ ATTAQUE — l'iPad mini debout NE PASSE PAS le demi, et c'est ça qui l'exclut", () => {
  /* Eric, 02/09 : *« probablement un iPad mini va préférer un affichage
     mobile »* · *« du classique au Pro 13 pouces, le 1/2 passera »*.
     ⭐ La règle ne l'exclut pas par jugement. 744 de large au demi rend 372 —
     SOUS le dessin. L'iPad classique juste au-dessus fait 768 et rend 384.
     ⛔ Si cette clause devenait verte, le seuil serait devenu arbitraire. */
  const demi = BARREAUX.find((b) => b.part === 2);
  assert.ok(744 / demi.part < PANNEAU,
    "744 au demi doit tomber SOUS le dessin — sinon le seuil n'a plus de raison mesurée");
  assert.ok(768 / demi.part >= PANNEAU, "et 768 doit passer");
  assert.equal(barreauPour(744, PANNEAU).part, 1, "l'appareil de 744 reste en plein écran");
  assert.equal(barreauPour(768, PANNEAU), demi, "celui de 768 prend le demi");
});

test("🔴 le cran du demi couvre TOUTES les tablettes couchées — la hauteur coupe la famille, jamais la largeur", () => {
  /* ⭐ LE RÉSULTAT MESURÉ DU 02/09 : couchée, la gamme se coupe en deux, et
     c'est le SAUT DE CRAN qui la coupe — pas un seuil. Les 4:3 tiennent le
     demi ; les allongés (1,43 à 1,52) sautent. ⛔ Un seuil sous la plus large
     des tablettes (l'iPad Pro 13, 1376) la couperait par la largeur, ce qui
     mettrait deux mécanismes sur le même travail. */
  const demi = BARREAUX.find((b) => b.part === 2);
  for (const [l, h] of [[1024, 768], [1133, 744], [1180, 820], [1194, 834], [1366, 1024], [1376, 1032]]) {
    assert.equal(barreauPour(l, PANNEAU), demi,
      `une tablette de ${l} de large doit être POSÉE sur le demi — le saut décide ensuite`);
  }
  /* Et le saut fait bien la coupure, dans les deux sens. */
  const rendu = (l, h) => Math.round(panneauPeint(l, h).l);
  for (const [l, h] of [[1024, 768], [1366, 1024], [1376, 1032]])
    assert.equal(rendu(l, h), Math.round(l / 2), `le 4:3 de ${l} tient le demi`);
  for (const [l, h] of [[1133, 744], [1180, 820], [1194, 834]])
    assert.ok(rendu(l, h) < l / 2 - 1, `l'allongé de ${l} doit sauter un cran`);
});

test("⚔️ ATTAQUE — les 4:3 tiennent le demi à 0,4 % près, et c'est `--panneau-h` qui le décide", () => {
  /* 🔴 UNE COTE PORTEUSE QUE PERSONNE NE VERRAIT BOUGER : un écran 4:3 couché
     porte le demi si et seulement si `(L/2) × (H_panneau/L_panneau) ≤ 0,75 L`,
     soit `H_panneau ≤ 1,5 × L_panneau` — 562,5 pour un panneau de 375. Le
     dépôt est à 560 : il reste **2,5 blg de marge**, mesurés 3 à 5 px à
     l'écran. ⚠️ Monter `--panneau-h` de 3 blg ferait sauter d'un cran TOUTE la
     famille 4:3 d'un coup, sans qu'aucune autre clause ne bronche. */
  assert.ok(HAUTEUR <= 1.5 * PANNEAU,
    "le dépôt doit être du bon côté de la frontière, sinon la mesure ci-dessus est périmée");
  const juste = faireRacine({ ...JETONS, "--panneau-h": String(1.5 * PANNEAU + 1) });
  for (const [l, h] of [[1024, 768], [1366, 1024], [1376, 1032]]) {
    const f = cranAuto(l, h, juste);
    assert.ok(PANNEAU * f < l / 2 - 1,
      `avec un panneau de ${1.5 * PANNEAU + 1} de haut, le 4:3 de ${l} DOIT perdre le demi — sinon la frontière est ailleurs`);
  }
});
