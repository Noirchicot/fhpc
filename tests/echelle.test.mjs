/* ══ LE GARDE DE L'ÉCHELLE — 2026-08-30 ═══════════════════════════════

   📐 Eric : *« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT NULLE
   PART. »* Le mécanisme tient en une déclaration CSS ; ce fichier garde les
   trois décisions qui l'entourent, celles qu'une relecture ne rattrape pas :

     1. la GRANDEUR se calcule sur la fenêtre DIVISÉE par l'échelle — c'est
        le défaut que ce lot a découvert au banc, et le seul qui soit
        invisible : un seuil lu sur la fenêtre brute est juste au cran 1 et
        faux à tous les autres ;
     2. la largeur voulue est LUE DANS LES JETONS, jamais recopiée — une
        somme figée dans le JS serait fausse au prochain réglage d'Eric sans
        qu'aucun test ne bronche (le piège « une somme ne se fige pas, elle
        se déduit ») ;
     3. `appliquerEchelle` n'écrit que DEUX attributs sur `<html>`, et aucun
        nœud — la règle du socle, celle qui fait que changer de taille ne
        perd pas le défilement.

   ⚠️ AUCUN DOM RÉEL, AUCUN PAQUET : `echelle.mjs` ne touche que
   `getComputedStyle`, `localStorage` et `documentElement`. On lui donne les
   trois, en mémoire, et on regarde ce qu'il en fait. La géométrie, elle, se
   regarde au navigateur — ce fichier garde le RAISONNEMENT. */

import test from "node:test";
import assert from "node:assert/strict";

/* ── LE DÉCOR MINIMAL ────────────────────────────────────────────────── */

/** Une racine de faux document : elle porte des jetons et reçoit des
 *  attributs, c'est tout ce que le module lui demande. */
function faireRacine(jetons) {
  const style = new Map(Object.entries(jetons));
  return {
    dataset: {},
    style: { setProperty(nom, valeur) { style.set(nom, valeur); } },
    __jetons: style
  };
}

/** Les cotes RÉELLES du dépôt au moment où ce test est écrit — elles servent
 *  de décor, jamais d'attente : le test qui compte lit celles du fichier. */
const JETONS = { "--measure": "625px", "--rail-w": "90px", "--sp-16": "16px",
                 "--fiche-dalle-w": "242px", "--sp-4": "4px" };

function poserDecor(racine) {
  globalThis.getComputedStyle = (noeud) => ({
    getPropertyValue: (nom) => (noeud.__jetons.get(nom) ?? "")
  });
  const magasin = new Map();
  globalThis.window = {
    innerWidth: 1024,
    localStorage: {
      getItem: (k) => (magasin.has(k) ? magasin.get(k) : null),
      setItem: (k, v) => magasin.set(k, v),
      removeItem: (k) => magasin.delete(k)
    }
  };
  globalThis.document = { documentElement: racine };
  return magasin;
}

const racine = faireRacine(JETONS);
const magasin = poserDecor(racine);
const { CRANS, cranAuto, cranTient, grandeurDe, appliquerEchelle, setCran, cranChoisi } =
  await import("../ui/builder/echelle.mjs");

/* ══ 1 — LA GRANDEUR SE LIT EN BLG, PAS EN PIXELS D'ÉCRAN ═════════════ */

test("🔴 la grandeur se calcule sur la fenêtre DIVISÉE par l'échelle", () => {
  /* ⛔ LE DÉFAUT QUE CE LOT A TROUVÉ AU BANC, ET IL ÉTAIT MUET. Sous `zoom`,
     un `@media` ne se réévalue pas : à 1024 au cran 1,5 la fenêtre effective
     vaut 683 blg — sous le seuil étroit — et l'ancien drapeau annonçait
     toujours « wide ». À 1920 au cran 5, `min-width: 1140px` matchait encore
     et le rail rendait 600 pixels réels. */
  setCran(1.5);
  window.innerWidth = 1024;
  const r = appliquerEchelle(window, racine);
  assert.equal(r.cran, 1.5);
  assert.equal(racine.dataset.grandeur, "etroite",
    "1024 / 1,5 = 683 blg, donc sous le seuil étroit — c'est la PLACE qui décide, pas la taille de l'écran");
  setCran(null);
});

test("⚔️ ATTAQUE — lire la fenêtre BRUTE donnerait une autre réponse, et c'est là tout le lot", () => {
  /* Si ce test tombe un jour parce que les deux réponses coïncident, c'est
     que le décor a été choisi trop mollement : il doit rester un cas où le
     défaut se voit. */
  assert.notEqual(grandeurDe(1024), grandeurDe(1024 / 1.5),
    "le décor du test doit distinguer les deux lectures — sinon il ne prouve rien");
  assert.equal(grandeurDe(1024), "moyenne");
  assert.equal(grandeurDe(1024 / 1.5), "etroite");
});

test("les trois grandeurs découpent bien la droite, aux bornes comprises", () => {
  assert.equal(grandeurDe(359), "etroite");
  assert.equal(grandeurDe(719), "etroite");
  assert.equal(grandeurDe(720), "moyenne", "la borne appartient à la grandeur du dessus");
  assert.equal(grandeurDe(1139), "moyenne");
  assert.equal(grandeurDe(1140), "large");
  assert.equal(grandeurDe(3840), "large");
});

/* ══ 2 — LA LARGEUR VOULUE EST LUE, PAS RECOPIÉE ══════════════════════ */

test("🔴 le cran auto suit les JETONS — bouger --measure change le résultat", () => {
  /* ⛔ LE PIÈGE NOMMÉ PAR `fiche.css` LE 16/08 : *« une somme ne se fige pas,
     elle se déduit »*. `--measure` a déjà bougé une fois (migration ch → px,
     29/08) et `--rail-w` deux fois (84 → 78 → 90). Une somme recopiée dans le
     JS serait fausse au réglage suivant, en silence. */
  window.innerWidth = 1600;
  const avant = cranAuto(1600, racine);
  racine.__jetons.set("--measure", "1200px"); // le dessin veut soudain bien plus
  const apres = cranAuto(1600, racine);
  racine.__jetons.set("--measure", "625px");
  assert.ok(apres < avant,
    "un dessin plus large doit faire BAISSER le cran automatique — sinon la somme est figée quelque part");
});

test("le cran auto reste au plancher tant que la fenêtre n'offre pas la place", () => {
  /* Le téléphone et la colonne de VTT sont DÉJÀ dessinés pour cette taille :
     ils n'ont rien à agrandir, et c'est ce qui garantit zéro régression
     visuelle là où Eric teste. */
  for (const largeur of [360, 390, 480, 600, 720]) {
    assert.equal(cranAuto(largeur, racine), 1,
      `à ${largeur} px, l'auto doit rester au plancher — le dessin y tient déjà tout juste`);
  }
});

test("et il monte quand la place existe, sans jamais dépasser le dernier cran", () => {
  const voulue = 625 + 2 * 16; // 657 — la COLONNE, recalculée ici, jamais lue du module
  assert.ok(cranAuto(voulue * 2, racine) >= 1.5, "le double de la largeur voulue mérite mieux que le plancher");
  assert.equal(cranAuto(99999, racine), CRANS[CRANS.length - 1],
    "un écran immense reçoit le plafond, jamais une valeur hors tableau");
  for (const largeur of [360, 480, 1024, 1920, 3840]) {
    assert.ok(CRANS.includes(cranAuto(largeur, racine)),
      `le cran rendu doit toujours être UN DES CRANS (${largeur} px)`);
  }
});

test("un cran automatique tient toujours la promesse qu'il fait", () => {
  /* ⭐ LE VRAI CONTRAT : le cran choisi automatiquement ne doit jamais
     demander plus de place que la fenêtre n'en a. C'est ce qui remplace la
     bascule que ce lot n'a pas construite. */
  /* ⚖️ 657 depuis la recalibration du 30/08 au soir : la facture de l'auto
     est la colonne de contenu, plus l'écran F idéal — voir echelle.mjs. */
  const voulue = 625 + 2 * 16;
  for (const largeur of [360, 480, 768, 1024, 1440, 1920, 2560, 3840]) {
    const c = cranAuto(largeur, racine);
    assert.ok(c === CRANS[0] || c * voulue <= largeur,
      `à ${largeur} px le cran ${c} demande ${c * voulue} blg de place — il n'y en a pas tant`);
  }
});

/* ══ 3 — DEUX ATTRIBUTS, AUCUN NŒUD ═══════════════════════════════════ */

test("appliquerEchelle n'écrit QUE --echelle et data-grandeur", () => {
  /* ⛔ SOCLE.md, « le cadre » : on écrit des attributs sur des nœuds qui ne
     meurent pas, jamais du DOM. C'est ce qui fait qu'un changement de taille
     ne perd pas le défilement — le navigateur remet en page tout seul. */
  const r2 = faireRacine(JETONS);
  window.innerWidth = 1920;
  appliquerEchelle(window, r2);
  assert.deepEqual([...r2.__jetons.keys()].filter((k) => !(k in JETONS)), ["--echelle"],
    "une seule propriété posée, et c'est l'échelle");
  assert.deepEqual(Object.keys(r2.dataset), ["grandeur"], "un seul attribut de données");
});

test("le choix du joueur bat l'automatique, et « Auto » rend la main", () => {
  window.innerWidth = 1920;
  const auto = appliquerEchelle(window, racine);
  assert.equal(auto.auto, true, "sans choix enregistré, on est en automatique");

  setCran(CRANS[CRANS.length - 1]);
  const choisi = appliquerEchelle(window, racine);
  assert.equal(choisi.auto, false);
  assert.equal(choisi.cran, CRANS[CRANS.length - 1], "le cran du joueur est appliqué tel quel");

  setCran(null);
  assert.equal(cranChoisi(), null, "« Auto » efface le choix au lieu d'enregistrer une valeur");
  assert.equal(appliquerEchelle(window, racine).auto, true);
});

test("un cran hors tableau enregistré à la main est IGNORÉ, pas appliqué", () => {
  /* Une valeur écrite dans `localStorage` vient du dehors — une session
     ancienne, une console ouverte, un cran retiré du tableau depuis. Elle ne
     doit jamais devenir l'échelle de la page. */
  magasin.set("fhpc.echelle.cran", "0.5");
  assert.equal(cranChoisi(), null, "0,5 n'est pas un cran : on retombe sur l'automatique");
  magasin.set("fhpc.echelle.cran", "n'importe quoi");
  assert.equal(cranChoisi(), null);
  magasin.delete("fhpc.echelle.cran");
});

test("localStorage qui JETTE ne fait pas tomber le builder", () => {
  /* Navigation privée, quota, iframe cloisonnée — même loi que
     `tutoriel.mjs` : une préférence d'affichage n'est jamais une raison de
     faire tomber la page. */
  const vrai = window.localStorage;
  window.localStorage = {
    getItem() { throw new Error("bloqué"); },
    setItem() { throw new Error("bloqué"); },
    removeItem() { throw new Error("bloqué"); }
  };
  assert.equal(cranChoisi(), null, "on retombe sur l'automatique");
  assert.doesNotThrow(() => setCran(2), "et écrire ne jette pas");
  assert.doesNotThrow(() => appliquerEchelle(window, racine));
  window.localStorage = vrai;
});

/* ══ 4 — LE CRAN À LA MAIN EST BORNÉ, ET IL N'EST PAS CLAMPÉ ══════════ */

test("🔴 cranTient dit non quand le cran ne laisserait plus de quoi dessiner", () => {
  /* Le plancher vaut rail 90 + fiche 242 + 2 × 4 = 340 blg. Un cran qui
     ramène la fenêtre sous ce chiffre coupe la colonne de stats. */
  const plancher = 90 + 242 + 2 * 4;
  assert.equal(cranTient(1, 360, racine), true, "à 360 le cran de base tient — c'est la base du dessin");
  assert.equal(cranTient(2, 360, racine), false, "360 / 2 = 180 blg : la fiche ne rentre plus");
  assert.equal(cranTient(3, 1920, racine), true, "1920 / 3 = 640 blg, au-dessus du plancher");
  assert.equal(cranTient(3, 900, racine), false, `900 / 3 = 300 blg, sous ${plancher}`);
});

test("cranTient suit le PLANCHER déclaré, il ne le recopie pas", () => {
  const avant = cranTient(2, 800, racine);
  racine.__jetons.set("--fiche-dalle-w", "600px"); // une fiche soudain bien plus large
  const apres = cranTient(2, 800, racine);
  racine.__jetons.set("--fiche-dalle-w", "242px");
  assert.ok(avant && !apres, "élargir le plancher doit retirer des crans — sinon la somme est figée dans le JS");
});

test("l'automatique ne propose JAMAIS un cran qui ne tient pas", () => {
  /* ⭐ C'est la promesse qui remplace la bascule non construite : aucune
     combinaison écran × auto ne peut produire un écran coupé.
     ⚠️ À PARTIR DE 360, ET C'EST LE CONTRAT, PAS UNE FAIBLESSE DU TEST. Eric :
     *« le plancher c'est la taille 360 sur laquelle on travaille »*. Une
     fenêtre de 320 blg ne tient pas le dessin et ne l'a jamais tenu — l'auto y
     rend le cran 1 parce qu'il n'existe rien de plus petit, pas parce qu'il se
     trompe. Descendre sous 360 est hors contrat, et le rester est une décision
     d'Eric, pas un oubli. */
  assert.equal(cranAuto(320, racine), CRANS[0],
    "sous le plancher servi, l'auto rend la base — il n'a rien de plus petit à offrir");
  assert.equal(cranTient(CRANS[0], 320, racine), false,
    "et il ne PRÉTEND pas que ça tient : 320 est hors contrat, le menu le dira");
  for (const largeur of [360, 390, 480, 600, 768, 834, 1024, 1280, 1440, 1920, 2560, 3840]) {
    const c = cranAuto(largeur, racine);
    assert.ok(cranTient(c, largeur, racine),
      `à ${largeur} px l'auto a choisi le cran ${c}, qui ne laisse pas la place de dessiner`);
  }
});
