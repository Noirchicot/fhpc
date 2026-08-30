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
                 "--fiche-dalle-w": "242px", "--sp-4": "4px",
                 /* Le PANNEAU — les trois cotes d'Eric du 31/08. Décor, jamais
                    attente : les tests qui comptent les BOUGENT et regardent. */
                 "--panneau-l": "375px", "--panneau-min": "360px", "--panneau-h": "520px" };

function poserDecor(racine) {
  globalThis.getComputedStyle = (noeud) => ({
    getPropertyValue: (nom) => (noeud.__jetons.get(nom) ?? "")
  });
  const magasin = new Map();
  globalThis.window = {
    innerWidth: 1024,
    /* ⚠️ LA HAUTEUR ENTRE DANS LE CALCUL DEPUIS LE 31/08 — sans elle, un iPad
       couché recevrait un cran que sa hauteur ne porte pas. Un stub qui ne la
       porterait pas rendrait `NaN`, et le garde ne verrait rien. */
    innerHeight: 1366,
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

test("🔴 le cran auto suit les JETONS — bouger --panneau-l change le résultat", () => {
  /* ⛔ LE PIÈGE NOMMÉ PAR `fiche.css` LE 16/08 : *« une somme ne se fige pas,
     elle se déduit »*. Les trois cotes du panneau sont DONNÉES par Eric, donc
     elles bougeront ; recopiées dans le JS elles seraient fausses au réglage
     suivant, en silence. */
  const avant = cranAuto(1600, 1600, racine);
  racine.__jetons.set("--panneau-l", "800px");   // le panneau veut soudain bien plus
  const apres = cranAuto(1600, 1600, racine);
  racine.__jetons.set("--panneau-l", "375px");
  assert.ok(apres < avant,
    "un panneau plus large doit faire BAISSER le cran — sinon la cote est figée quelque part");
});

test("🔴 et il suit AUSSI --panneau-h — la hauteur est une vraie contrainte", () => {
  /* 📏 LE DÉFAUT QUE CETTE CLAUSE GARDE, mesuré le 31/08 sur l'iPad d'Eric
     couché (1366 × 1024) : sur la seule largeur, l'auto rendait ×3 — panneau
     de 1125 px de large et **341 blg de haut** pour 520 nécessaires. La carte
     se serait coupée. C'est le défaut qu'on venait de fermer, rouvert par
     l'autre bout. */
  const avant = cranAuto(1600, 1600, racine);
  racine.__jetons.set("--panneau-h", "1200px");  // il faut soudain bien plus de hauteur
  const apres = cranAuto(1600, 1600, racine);
  racine.__jetons.set("--panneau-h", "520px");
  assert.ok(apres < avant, "une hauteur exigée plus grande doit retirer des crans");
  assert.equal(cranAuto(1366, 1024, racine), 1.5,
    "l'iPad COUCHÉ reçoit 1,5 : la largeur en offrirait 3, la hauteur n'en porte que 1,97");
  assert.equal(cranAuto(1024, 1366, racine), 2,
    "le même iPad DEBOUT reçoit 2 — tourner l'appareil change le cran, et c'est la hauteur qui le dit");
});

test("le cran auto reste au plancher tant que l'écran n'offre pas le panneau", () => {
  /* Le téléphone est DÉJÀ dessiné pour cette taille : il n'a rien à agrandir,
     et c'est ce qui garantit zéro régression là où Eric teste.
     🔴 LA BORNE A CHANGÉ AVEC LE PANNEAU, ET C'EST LE TEST QUI ÉTAIT PÉRIMÉ :
     l'ancienne facture était la colonne de contenu (657 blg), la nouvelle est
     le panneau (375). Un 720 offrait donc le plancher hier et offre ×1,5
     aujourd'hui — ce n'est pas un défaut, c'est la nouvelle cote. Le premier
     cran au-dessus de 1 demande 1,25 × 375 = 469 blg : c'est LÀ qu'est la
     frontière, et elle se calcule ici plutôt que de se recopier. */
  const frontiere = 1.25 * 375;
  for (const largeur of [360, 375, 390, 430, Math.floor(frontiere) - 1]) {
    assert.equal(cranAuto(largeur, 1366, racine), 1,
      `à ${largeur} px, l'auto doit rester au plancher — le panneau y tient déjà tout juste`);
  }
  assert.equal(cranAuto(Math.ceil(frontiere), 1366, racine), 1.25,
    "et juste au-dessus de la frontière, il monte d'un cran — sinon la borne est ailleurs qu'annoncé");
});

test("et il monte quand la place existe, sans jamais dépasser le dernier cran", () => {
  assert.ok(cranAuto(375 * 2, 520 * 2, racine) >= 1.5,
    "le double du panneau, dans les DEUX sens, mérite mieux que le plancher");
  assert.equal(cranAuto(99999, 99999, racine), CRANS[CRANS.length - 1],
    "un écran immense reçoit le plafond, jamais une valeur hors tableau");
  for (const l of [360, 480, 1024, 1920, 3840]) {
    assert.ok(CRANS.includes(cranAuto(l, l, racine)), `le cran rendu doit toujours être UN DES CRANS (${l} px)`);
  }
});

test("un cran automatique tient toujours la promesse qu'il fait", () => {
  /* ⭐ LE VRAI CONTRAT : le cran choisi automatiquement ne demande jamais plus
     de place que l'écran n'en a — dans les deux sens. */
  for (const [l, h] of [[360, 640], [375, 812], [768, 1024], [1024, 1366],
                        [1366, 1024], [1440, 900], [1920, 1080], [3840, 2160]]) {
    const c = cranAuto(l, h, racine);
    assert.ok(c === CRANS[0] || (c * 375 <= l && c * 520 <= h),
      `à ${l} × ${h} le cran ${c} demande ${c * 375} × ${c * 520} blg — il n'y en a pas tant`);
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
  magasin.set("fhpc.echelle.cran.2", "0.5");
  assert.equal(cranChoisi(), null, "0,5 n'est pas un cran : on retombe sur l'automatique");
  magasin.set("fhpc.echelle.cran.2", "n'importe quoi");
  assert.equal(cranChoisi(), null);
  magasin.delete("fhpc.echelle.cran.2");
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

test("🔴 cranTient dit non quand le cran ne porterait plus le panneau", () => {
  assert.equal(cranTient(1, 375, 812, racine), true, "un iPhone porte le panneau au cran 1");
  assert.equal(cranTient(2, 375, 812, racine), false, "375 / 2 = 188 blg : le panneau n'y est plus");
  assert.equal(cranTient(2, 1024, 1366, racine), true, "1024 × 1366 au cran 2 : 512 × 683, le panneau tient");
  assert.equal(cranTient(3, 1366, 1024, racine), false,
    "1366 / 3 = 455 de large, ça irait — mais 1024 / 3 = 341 de haut pour 520 : NON");
});

test("cranTient suit les COTES DÉCLARÉES, il ne les recopie pas", () => {
  const avantL = cranTient(2, 800, 1400, racine);
  racine.__jetons.set("--panneau-l", "600px");
  const apresL = cranTient(2, 800, 1400, racine);
  racine.__jetons.set("--panneau-l", "375px");
  assert.ok(avantL && !apresL, "élargir le panneau doit retirer des crans — sinon la cote est figée");

  const avantH = cranTient(2, 800, 1400, racine);
  racine.__jetons.set("--panneau-h", "900px");
  const apresH = cranTient(2, 800, 1400, racine);
  racine.__jetons.set("--panneau-h", "520px");
  assert.ok(avantH && !apresH, "et la HAUTEUR aussi — c'est elle qui décide en paysage");
});

test("l'automatique ne propose JAMAIS un cran qui ne tient pas", () => {
  /* ⚠️ À PARTIR DE 360, ET C'EST LE CONTRAT, PAS UNE FAIBLESSE DU TEST.
     Eric, 2026-08-31 : *« c'est du 375×520, il y a une marge c'est joli. Pour
     du 360×520, il n'y a pas de marge c'est moins joli, mais ça fonctionne. En
     dessous achète un téléphone qui tient la route ou va sur ton ordi. »*
     Une fenêtre de 320 blg est HORS CONTRAT : l'auto y rend le cran 1 parce
     qu'il n'a rien de plus petit, pas parce qu'il se trompe — et `cranTient`
     ne prétend pas le contraire. */
  assert.equal(cranAuto(320, 640, racine), CRANS[0],
    "sous le plancher servi, l'auto rend la base — il n'a rien de plus petit à offrir");
  assert.equal(cranTient(CRANS[0], 320, 640, racine), false,
    "et il ne PRÉTEND pas que ça tient : 320 est hors contrat, le menu le dira");
  for (const [l, h] of [[360, 640], [375, 812], [390, 844], [480, 800], [768, 1024],
                        [834, 1112], [1024, 1366], [1366, 1024], [1280, 800],
                        [1440, 900], [1920, 1080], [2560, 1440], [3840, 2160]]) {
    const c = cranAuto(l, h, racine);
    assert.ok(cranTient(c, l, h, racine) || c === CRANS[0],
      `à ${l} × ${h} l'auto a choisi le cran ${c}, qui ne porte pas le panneau`);
  }
});

test("⚖️ la clef v1 est ignorée ET effacée — le cran piégé du 30/08 ne survit pas", () => {
  /* L'iPad d'Eric portait `fhpc.echelle.cran = "1"`, enregistré sous
     l'étiquette trompeuse de la première heure. Personne ne doit avoir à
     rouvrir un menu pour s'en défaire : la simple LECTURE du cran purge la
     clef morte, et le choix revient à l'automatique tout seul. */
  magasin.set("fhpc.echelle.cran", "1");
  assert.equal(cranChoisi(), null, "le « Standard » piégé ne compte pas comme un choix");
  assert.equal(magasin.has("fhpc.echelle.cran"), false, "et la clef morte est effacée au passage");
  /* Un choix fait APRÈS la correction, sous la clef 2, reste souverain. */
  setCran(2);
  assert.equal(cranChoisi(), 2, "la clef 2 porte les vrais choix");
  setCran(null);
});
