/* ══ UN DÉ REND SON CONTEXTE WebGL — lot 362, 2026-09-29 ═══════════════════

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER, MESURÉ AU BANC (v912, Chromium
   1280 × 800, une sonde posée sur `getContext`) : un parcours Abilities — deux
   jets 4D6, `Flash`, `Cancel`, un jet quitté en plein vol, puis FH 3D6, un jet,
   `Flash`, une assignation — ouvrait **33** contextes WebGL, en laissait **16**
   vivants hors de la page, et le navigateur en ÉVINÇAIT **6** (« Too many
   active WebGL contexts. Oldest context will be lost », six fois en console).
   Trois fuites, toutes du même genre — un contexte ouvert que personne ne rend :
   · un dé posé SANS animation (`Flash`, et chaque rendu d'un lot déjà tiré,
     même en scène 2, où l'écran n'affiche pas ces dés) gardait le sien ;
   · un dé animé retiré en plein vol aussi : le moteur ne fige que les dés
     encore dans la page.

   ⭐ CE QU'IL TIENT : ouvrir puis quitter l'écran des dés N fois — jets animés,
   `Flash`, redessins de la scène 2, `Cancel`, un jet quitté en plein vol —
   laisse au plus **K = 1** contexte vivant, et ce n'est pas celui d'un dé :
   c'est le générateur partagé du moteur (`pickerGenerator`), UN canvas hors
   page qui dessine TOUTES les images de dés (résultats, podium, dés figés).
   Pendant un jet, chaque dé qui roule a le sien — c'est le rendu qu'Eric a
   validé — et il le rend en se figeant, ou en partant.

   ⚠️ CE QU'IL NE VOIT PAS, ET IL LE DIT : ni GPU ni ramasse-miettes ici. Un
   contexte « vivant » est un contexte qu'aucun propriétaire n'a RENDU — c'est
   exactement la faute, et c'est plus sévère que le navigateur, qui finit par
   ramasser un canvas perdu. Le plafond réel (16 sous Chromium) et l'éviction se
   mesurent au banc ; ce garde tient la discipline, pas le plafond.

   ⛔ LE DOM DE TEST NE SAIT PAS MONTER UN DÉ, ET ON NE LE LUI APPREND PAS POUR
   TOUT LE DÉPÔT. Le moteur demande `classList`, `:not([data-mounted])` et
   `insertBefore` ; un stub qui les offrirait à toutes les suites réveillerait le
   moteur dans des tests qui n'ont pas de `window`. Ces trois gestes sont donc
   posés ICI, dans ce seul fichier — le lanceur isole chaque fichier dans son
   processus —, avec un faux WebGL qui tient le registre. */

import test, { mock } from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
globalThis.document = createTestDocument();

const { renderAbilitiesStep, emptyAbilityAssign } = await import("../ui/builder/abilities-step.mjs");
const { swapContent } = await import("../ui/builder/socle.mjs");
const { createDieHost, mount, rendreLeContexte } = await import("../ui/builder/dice3d.mjs");
const { exempleFhEn } = await import("../src/tools/exemple-fh-en.mjs");
const fixture = exempleFhEn();

/* ── LE FAUX WebGL : un contexte par canvas, et le registre de tous ────────
   Même contrat que le navigateur sur les trois points que le moteur emploie :
   `getContext("webgl")` rend TOUJOURS le même contexte pour un canvas ;
   `WEBGL_lose_context` le perd ; un contexte perdu ne rend plus l'extension. */
const registre = [];
function fauxContexte(canvas) {
  const entree = { canvas, perdu: false };
  const perte = { loseContext() { entree.perdu = true; } };
  const propres = {
    isContextLost: () => entree.perdu,
    getExtension: (nom) => (entree.perdu || nom !== "WEBGL_lose_context" ? null : perte)
  };
  entree.gl = new Proxy(propres, {
    get(cible, cle) {
      if (cle in cible) return cible[cle];
      if (typeof cle === "string" && /^[A-Z0-9_]+$/.test(cle)) return 1;
      return () => ({});
    }
  });
  registre.push(entree);
  return entree.gl;
}
const creerNoeud = document.createElement.bind(document);
document.createElement = (balise) => {
  const noeud = creerNoeud(balise);
  if (String(balise).toLowerCase() === "canvas") {
    let gl = null;
    noeud.getContext = (type) => (type === "webgl" ? (gl ||= fauxContexte(noeud)) : null);
    noeud.toDataURL = () => "data:image/png;base64,ZMOp";
  }
  return noeud;
};

/* ── LES TROIS GESTES DU DOM QUE LE MOTEUR EMPLOIE, ICI SEULEMENT ────────── */
const proto = Object.getPrototypeOf(creerNoeud("div"));
Object.defineProperty(proto, "classList", {
  configurable: true,
  get() {
    const noeud = this;
    const lire = () => String(noeud.className || "").split(/\s+/).filter(Boolean);
    return {
      add: (...noms) => { noeud.className = [...new Set([...lire(), ...noms])].join(" "); },
      remove: (...noms) => { noeud.className = lire().filter((n) => !noms.includes(n)).join(" "); },
      contains: (nom) => lire().includes(nom)
    };
  }
});
const chercher = proto.querySelectorAll;
proto.querySelectorAll = function (selecteur) {
  const sauf = /^(.*):not\(\[([\w-]+)\]\)$/.exec(selecteur);
  if (!sauf) return chercher.call(this, selecteur);
  return chercher.call(this, sauf[1]).filter((n) => !n.hasAttribute(sauf[2]));
};
proto.insertBefore = function (noeud, repere) {
  noeud.parentNode = this;
  noeud._retire = false;
  const i = this.childNodes.indexOf(repere);
  this.childNodes.splice(i < 0 ? this.childNodes.length : i, 0, noeud);
  return noeud;
};

/* ── LE NAVIGATEUR : une fenêtre sans son, et des images qu'on joue à la main ──
   ⚠️ Posée APRÈS les imports : aucun module ne lit `window` au chargement ici,
   et la poser plus tôt ferait croire à des modules qu'ils sont dans une page. */
globalThis.window = {
  matchMedia: () => ({ matches: false }),
  devicePixelRatio: 1,
  setTimeout: (...args) => setTimeout(...args)
};
const images = [];
globalThis.requestAnimationFrame = (fn) => { images.push(fn); return images.length; };
let horloge = 0;
function jouerLesImages() {
  for (let i = 0; i < 90 && images.length; i += 1) {
    horloge += 16;
    for (const fn of images.splice(0)) fn(horloge);
  }
}
const vider = () => new Promise((ok) => setImmediate(ok));

const vivants = () => registre.filter((e) => !e.perdu);
/* Un contexte « de dé » est celui d'un canvas porté par un hôte de dé ; le
   générateur partagé du moteur, lui, n'a pas de parent (il ne va jamais dans la page). */
const estUnDe = (e) => {
  let n = e.canvas.parentNode;
  while (n) { if (String(n.className || "").split(/\s+/).includes("fh-cd-static-die")) return true; n = n.parentNode; }
  return false;
};

/* ── L'ÉCRAN DES DÉS, tel que la coquille le peint ──────────────────────────
   Les trois verbes du plateau suivent `applyDecisionAction` (shell.mjs) :
   `abilityLot` range le lot ET redessine (scène 2), `abilityRevele` ne fait que
   ranger, `abilityClear` vide et redessine (scène 1). */
function ecran(methode) {
  const scene = document.createElement("div");
  const etat = { rollBatch: null, revele: 0 };
  function peindre() {
    swapContent(scene, [renderAbilitiesStep({
      document: fixture.document, resolved: fixture.report.resolved,
      rollBatch: etat.rollBatch, revele: etat.revele, method: methode, palier: 2
    }, act)]);
  }
  function act(action) {
    if (action.kind === "abilityLot") { etat.rollBatch = { ...action.lot, assign: emptyAbilityAssign() }; peindre(); }
    else if (action.kind === "abilityRevele") etat.revele = action.valeur;
    else if (action.kind === "abilityClear") { etat.rollBatch = null; etat.revele = 0; peindre(); }
  }
  peindre();
  return {
    peindre,
    effacer: () => act({ kind: "abilityClear" }),
    quitter: () => swapContent(scene, []),
    bouton: (classe) => scene.querySelector(`.${classe}`),
    desSurLeTapis: () => scene.querySelectorAll(".tray-des .fh-cd-static-die").length
  };
}

test("⛔ OUVRIR PUIS QUITTER L'ÉCRAN DES DÉS N FOIS LAISSE AU PLUS K = 1 CONTEXTE VIVANT — et jamais celui d'un dé", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const N = 4;
    for (let i = 0; i < N; i += 1) {
      const e = ecran(i % 2 ? "4d6" : "fh3d6");
      const nombreDeDes = i % 2 ? 4 : 3;

      /* ① un jet ANIMÉ — et le TÉMOIN : le registre voit bien les contextes des dés
         qui roulent. Un compteur qui ne verrait rien ferait passer ce garde à vide. */
      e.bouton("tray-roll").click();
      assert.equal(e.desSurLeTapis(), nombreDeDes, "témoin : le jet a posé ses dés sur le tapis");
      assert.equal(vivants().filter(estUnDe).length, nombreDeDes,
        "témoin : chaque dé qui roule tient UN contexte vivant — le registre les voit");
      jouerLesImages();
      mock.timers.tick(2600); await vider();
      assert.equal(vivants().filter(estUnDe).length, 0, "un dé qui se fige DANS la page rend son contexte");

      /* ② `Flash` : la pose sans animation, puis le redessin de la scène 2 (le lot rangé). */
      e.bouton("tray-flash").click();
      await vider();
      /* ③ deux redessins de la scène 2 — ce que fait chaque assignation. */
      e.peindre();
      e.peindre();
      assert.equal(vivants().filter(estUnDe).length, 0,
        "⛔ un dé posé SANS animation n'ouvre aucun contexte — il passe par le chemin image");

      /* ④ `Cancel`, puis un jet QUITTÉ EN PLEIN VOL — à deux instants, parce que
         l'ORDRE des minuteurs est la moitié de la promesse. À 100 ms, tous les dés
         roulent. À 1 100 ms, le moteur a déjà figé le premier (960 + 120) mais pas
         les suivants (+ 42 ms par rang) : ceux-là ne peuvent être rendus que par le
         plateau, et seulement si son minuteur passe APRÈS celui du moteur. Un
         minuteur trop tôt passerait pendant que les dés sont encore dans la page,
         ne rendrait rien, et ne repasserait jamais. */
      e.effacer();
      e.bouton("tray-roll").click();
      assert.equal(vivants().filter(estUnDe).length, nombreDeDes, "témoin : les dés roulent quand on quitte l'écran");
      mock.timers.tick(i % 2 ? 1100 : 100);
      e.quitter();
      mock.timers.tick(3000); await vider();
      assert.equal(vivants().filter(estUnDe).length, 0,
        "⛔ un dé retiré en plein vol rend son contexte à la fin du jet — son propriétaire, le plateau, le rend");
    }
    const restent = vivants();
    assert.ok(registre.length > 1, "témoin : le parcours a bien ouvert des contextes");
    assert.ok(restent.length <= 1, `K = 1 : ${restent.length} contextes vivants après ${N} ouvertures de l'écran des dés`);
    assert.deepEqual(restent.map(estUnDe), restent.length ? [false] : [],
      "le seul contexte qui reste est le générateur partagé des images — jamais un dé");
  } finally {
    mock.timers.reset();
  }
});

test("⛔ `rendreLeContexte` NE REND QUE LE CONTEXTE D'UN DÉ VIVANT, et n'en ouvre jamais un", () => {
  const zone = document.createElement("div");

  /* Un dé-IMAGE n'a jamais eu de contexte : lui en demander un pour le rendre en
     OUVRIRAIT un — le défaut exact que le chemin image existe pour éviter. */
  const image = createDieHost({ sides: 6, result: 3, sizePx: 56, animate: false, snapshot: true });
  zone.append(image);
  mount(zone);
  const avant = registre.length;
  assert.equal(rendreLeContexte(image), false, "un dé-image n'a rien à rendre");
  assert.equal(registre.length, avant, "⛔ et le lui demander n'ouvre AUCUN contexte");

  /* Un dé VIVANT (posé sans animation, hors du plateau) tient le sien : on le rend. */
  const vivant = createDieHost({ sides: 6, result: 3, sizePx: 56, animate: false });
  zone.append(vivant);
  mount(zone);
  const sien = registre.find((e) => e.canvas === vivant.querySelector("canvas"));
  assert.ok(sien && !sien.perdu, "témoin : le dé vivant tient un contexte");
  assert.equal(rendreLeContexte(vivant), true, "le contexte d'un dé vivant se rend");
  assert.equal(sien.perdu, true, "…et il est bien perdu");
  assert.equal(rendreLeContexte(vivant), false, "un contexte déjà rendu ne se rend pas deux fois");
  assert.equal(rendreLeContexte(null), false, "sans hôte, rien");
});
