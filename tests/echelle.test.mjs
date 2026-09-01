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
                 /* Le PANNEAU — les deux cotes du 31/08. Décor, jamais attente :
                    les tests qui comptent les BOUGENT et regardent.
                    🔴 NUES ET À JOUR, ET C'EST UN DÉFAUT DÉJÀ PAYÉ : ce décor a
                    porté « 520px » quelques heures après que le dépôt soit passé
                    à 560. Les clauses passaient quand même — une clause
                    ANTÉRIEURE remettait 560 dans cette racine partagée. Un garde
                    dont le vert dépend de l'ORDRE des tests ne garde rien. */
                 "--panneau-l": "375", "--panneau-h": "560" };

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
const { cranAuto, grandeurDe, appliquerEchelle } = await import("../ui/builder/echelle.mjs");

/* ══ 1 — LA GRANDEUR SE LIT EN BLG, PAS EN PIXELS D'ÉCRAN ═════════════ */

test("🔴 la grandeur se calcule sur la fenêtre DIVISÉE par l'échelle", () => {
  /* ⛔ LE DÉFAUT QUE CE LOT A TROUVÉ AU BANC, ET IL ÉTAIT MUET. Sous `zoom`,
     un `@media` ne se réévalue pas : à 1024 au cran 1,5 la fenêtre effective
     vaut 683 blg — sous le seuil étroit — et l'ancien drapeau annonçait
     toujours « wide ». À 1920 au cran 5, `min-width: 1140px` matchait encore
     et le rail rendait 600 pixels réels. */
  /* RÉÉCRIT AU LOT 118 : cette clause forçait un cran à la main (1,5) pour
     prouver la division. Les crans manuels sont partis ; la preuve se fait
     avec la fenêtre elle-même, et elle dit plus : depuis le 31/08 la grandeur
     se lit sur le PANNEAU (375 blg), pas sur la fenêtre divisée — une fenêtre
     de 1920 au facteur 1,93 reste « etroite », parce que c'est la place du
     dessin qui décide, et le dessin fait toujours 375. */
  window.innerWidth = 1920;
  window.innerHeight = 1080;
  const r = appliquerEchelle(window, racine);
  assert.ok(r.cran > 1.9 && r.cran < 2, `1080 / 560 = 1,93 attendu, rendu ${r.cran}`);
  assert.equal(racine.dataset.grandeur, "etroite",
    "1920 de large et pourtant étroite : la grandeur mesure le panneau, jamais l'écran");
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

test("🔴 et il suit AUSSI --panneau-h — en paysage c'est la HAUTEUR qui décide", () => {
  /* 📏 LE DÉFAUT QUE CETTE CLAUSE GARDE, mesuré le 31/08 sur l'iPad d'Eric
     couché (1366 × 1024) : sur la seule largeur, l'échelle rendait 3,64 —
     panneau de 1365 px de large et 281 blg de haut pour 560 nécessaires. La
     carte se serait coupée : le défaut qu'on venait de fermer, rouvert par
     l'autre bout. */
  const avant = cranAuto(1600, 1600, racine);
  racine.__jetons.set("--panneau-h", "1200px");
  const apres = cranAuto(1600, 1600, racine);
  racine.__jetons.set("--panneau-h", "560px");
  assert.ok(apres < avant, "une hauteur exigée plus grande doit faire baisser l'échelle");

  const arrondi = (x) => Math.round(x * 100) / 100;
  assert.equal(arrondi(cranAuto(1366, 1024, racine)), 1.83,
    "iPad COUCHÉ : la largeur en offrirait 3,64, la hauteur n'en porte que 1,83");
  assert.equal(arrondi(cranAuto(1024, 1366, racine)), 2.44,
    "le même iPad DEBOUT : 2,44 — tourner l'appareil change l'échelle, et c'est la hauteur qui le dit");
});

test("🔴 L'ÉCHELLE EST CONTINUE — jamais arrondie à un cran du tableau", () => {
  /* ⛔ LA RÈGLE SACRÉE D'ERIC (31/08) : « ce n'est pas 5 changements de
     tailles, c'est un redimensionnement qui suit la fenêtre dans toutes
     situations. Le builder garde toujours son ratio. » Une échelle posée sur
     le cran le plus proche ferait perdre au panneau les quelques pour cent qui
     le séparent du bord — donc du ratio à l'écran. */
  const f = cranAuto(1000, 900, racine);
  /* Les cinq crans d'hier, gardés ici comme TÉMOIN — le tableau lui-même est
     parti avec la rampe du Menu (lot 118). */
  assert.ok(![1, 1.25, 1.5, 2, 3].includes(f), `${f} ne doit PAS être un des cinq crans d'hier — l'échelle est continue`);
  assert.equal(Math.round(f * 1000) / 1000, Math.round(900 / 560 * 1000) / 1000,
    "elle vaut exactement le plus contraignant des deux rapports, sans arrondi");
});

test("🔴 elle descend SOUS 1 plutôt que de couper — le plancher est renversé", () => {
  /* ⛔ CE QUI EST RENVERSÉ, et c'est mieux : « le plancher c'est la taille 360 »
     (30/08) faisait perdre 15 blg à la carte sur un téléphone de 360 — mesuré,
     et Eric l'avait accepté. Avec une échelle continue rien n'est retiré : tout
     est 4 % plus petit et la proportion tient. */
  const f = cranAuto(360, 640, racine);
  assert.ok(f < 1 && f > 0.9, `à 360 × 640 l'échelle vaut ${f} — sous 1, et c'est voulu`);
  assert.equal(Math.round(f * 100) / 100, 0.96);
});

test("l'échelle suit la fenêtre dans les deux sens, sans jamais rien couper", () => {
  for (const [l, h] of [[360, 640], [375, 812], [768, 1024], [1024, 1366],
                        [1366, 1024], [1440, 900], [1920, 1080], [3840, 2160]]) {
    const f = cranAuto(l, h, racine);
    assert.ok(f * 375 <= l + 1e-9 && f * 560 <= h + 1e-9,
      `à ${l} × ${h} l'échelle ${f} donne ${f * 375} × ${f * 560} blg — ça ne rentre pas`);
    assert.ok(f * 375 >= l - 1e-9 || f * 560 >= h - 1e-9,
      `à ${l} × ${h} l'échelle ${f} laisse de la place des DEUX côtés : elle est trop petite`);
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

/* ══ 3 bis — LES CRANS MANUELS SONT PARTIS, ET LEURS CLEFS AVEC EUX ══════
   Eric, 2026-09-02 : « si l'auto fait bien son travail, effectivement les
   boutons sont obsolètes ». Ce qui reste à garder : qu'aucune clef d'une
   version antérieure ne fige plus l'échelle, et que le module n'offre plus de
   cran à la main — sinon un écran futur le rebrancherait sans le savoir. */

test("⚖️ un cran enregistré par une version antérieure est IGNORÉ ET EFFACÉ (lot 118)", () => {
  window.innerWidth = 1920;
  window.innerHeight = 1080;
  magasin.set("fhpc.echelle.cran.2", "1");
  magasin.set("fhpc.echelle.cran", "1");
  const r = appliquerEchelle(window, racine);
  assert.equal(r.cran, cranAuto(1920, 1080, racine), "l'échelle est celle de la fenêtre, jamais celle d'une clef");
  assert.equal(magasin.has("fhpc.echelle.cran.2"), false, "la clef 2 est effacée au passage");
  assert.equal(magasin.has("fhpc.echelle.cran"), false, "et la clef v1 aussi");
});

test("⚔️ ATTAQUE — la clause d'au-dessus DISTINGUE : ×1 n'est pas l'automatique de cette fenêtre", () => {
  assert.notEqual(cranAuto(1920, 1080, racine), 1,
    "si l'auto valait 1 ici, un module qui relirait la clef passerait au vert par hasard");
});

test("⛔ echelle.mjs n'offre plus AUCUN cran à la main", async () => {
  const mod = await import("../ui/builder/echelle.mjs");
  for (const nom of ["CRANS", "setCran", "cranChoisi", "cranTient"]) {
    assert.equal(nom in mod, false, `${nom} est parti avec la rampe du Menu — le rebrancher serait rouvrir un réglage qui ment`);
  }
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
  assert.doesNotThrow(() => appliquerEchelle(window, racine), "effacer les clefs mortes ne jette pas non plus");
  window.localStorage = vrai;
});

