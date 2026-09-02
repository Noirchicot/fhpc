/* ══ LA CÉRÉMONIE DU TIRAGE — lot 109, croquis « B.1 » d'Eric (2026-08-30) ══
   Trois séquences en **FS** — plein écran, ni belt ni menu (CADRES §2) — puis
   le fondu vers l'écran final. C'est le seul endroit du builder où le décor
   prend toute la place : Eric le dessine en fond noir, et le belt ne revient
   qu'à la quatrième séquence.

     ① le texte s'écrit CARACTÈRE PAR CARACTÈRE, blanc sur noir, puis
        **s'estompe** ; la petite ligne apparaît et disparaît avec lui.
     ② les dos de cartes **se mélangent**, se rassemblent en un paquet, il
        n'en reste qu'un — qui grossit de 50 % à 100 %.
     ③ le dos seul, zoom max, **aucun texte**. Un tap le retourne ; la carte
        reste retournée trois secondes, puis dézoome.
     ④ fondu vers le fond classique — c'est `renderDestinyFinal`, pas ici.

   🔴 CE MODULE NE DÉCIDE D'AUCUNE DURÉE DE PHASE. Il dessine l'état qu'on lui
   donne ; les minuteurs qui font AVANCER les phases vivent dans la coquille
   (`shell.mjs`), seule capable de les annuler quand le joueur part. Un
   minuteur d'écran qui survit à son écran est la fuite classique du builder.
   ⭐ Le seul minuteur d'ici est la FRAPPE — purement visuelle, et gardée par
   `isConnected` : dès que son nœud quitte le document, elle s'arrête.

   ⚠️ `prefers-reduced-motion` N'EST PAS UNE OPTION DE CONFORT ICI : toute
   cette séquence est du mouvement. Sous cette préférence, la frappe s'affiche
   d'un coup et les cartes ne voyagent pas — la cérémonie garde son rythme,
   elle perd son agitation. */

import { ARCANA_BACK_SRC, arcanaImageSrc } from "./destiny-step.mjs?v=439";

/* ⭐ LES MOTS SONT D'ERIC (candidat A, retenu le 2026-08-30), et il a tranché
   la ponctuation : **pas de point final**. Ils vivent ICI, à un seul endroit —
   un texte de cérémonie recopié dans un test diverge au premier réglage. */
export const CEREMONIE_TEXTE = "The deck already knows your name";
export const CEREMONIE_LIGNE = "Tap the card back to uncover your destiny";

/** Les durées, en millisecondes — lues par la coquille pour ses minuteurs.
 *  📏 Elles viennent du croquis : « 3 secondes » sous la séquence 1, « 3
 *  secondes mélange · 2 secondes grossissement » sous la 2, « reste retournée
 *  3 secondes » sur la 3. */
/* ⏱️ LA DURÉE DE LA SÉQUENCE 1 SE CALCULE, ELLE NE SE FIXE PAS — et c'est une
   mesure qui l'a exigé (banc, 30/08) : à 85 ms le caractère, les 31 signes du
   texte prenaient 2,6 s des 3 s de la séquence, et le mélange emportait la
   phrase avant qu'on ait pu la lire. Une durée écrite en dur ment dès que le
   texte change d'un mot.
   ⭐ Le calcul rend au joueur le temps qu'Eric voulait : la frappe, PUIS une
   seconde pour lire — et le total reste ses « 3 secondes ». */
const FRAPPE_MS = 65;
const LECTURE_MS = 950;

export const DUREES = Object.freeze({
  frappe: FRAPPE_MS,
  seq1: FRAPPE_MS * CEREMONIE_TEXTE.length + LECTURE_MS,
  melange: 3000,
  grossit: 2000,
  retournee: 3000,
  dezoom: 700,
  /* La fenêtre des trois taps. Eric, 2026-08-30 : *« succession rapide de 3 =
     résolution immédiate »* — trois taps DANS cette fenêtre, sinon le compte
     repart. Un tap isolé « au mauvais moment ne change rien ». */
  tripleTap: 900
});

export const CEREMONIE_PHASES = ["seq1", "seq2", "seq3"];

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** La frame suivante — ou tout de suite, si l'hôte n'en a pas.
 *  ⚠️ `requestAnimationFrame` N'EXISTE PAS PARTOUT : le banc de tests monte un
 *  DOM minimal, et le module plantait à son seul appel. Un écran qui exige une
 *  API d'animation pour se CONSTRUIRE est un écran qu'on ne peut plus tester —
 *  ici, sans frame, l'état d'arrivée est simplement posé sans transition. */
function prochaineFrame(fn) {
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(fn);
  else fn();
}

function mouvementReduit() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** ① LA FRAPPE — un caractère à la fois, puis l'estompe.
 *  ⚠️ Le minuteur se garde LUI-MÊME : `node.isConnected` retombe à faux dès
 *  que la coquille remplace la scène, et la frappe s'arrête d'elle-même. Rien
 *  à annuler de l'extérieur, donc rien à oublier d'annuler. */
function renderSeq1() {
  const scene = el("div", "ceremonie-scene");
  const gros = el("p", "ceremonie-texte");
  const ligne = el("p", "ceremonie-ligne", [text(CEREMONIE_LIGNE)]);
  scene.append(gros, ligne);

  if (mouvementReduit()) {
    gros.textContent = CEREMONIE_TEXTE;
    gros.dataset.frappe = "finie";
    return scene;
  }

  gros.dataset.frappe = "encours";
  let i = 0;
  const tic = setInterval(() => {
    if (!gros.isConnected) { clearInterval(tic); return; }
    gros.textContent = CEREMONIE_TEXTE.slice(0, ++i);
    if (i >= CEREMONIE_TEXTE.length) {
      clearInterval(tic);
      gros.dataset.frappe = "finie";
      /* l'estompe : Eric, 2026-08-30 — *« A s'estompe »*, puis les cartes se
         mélangent. La classe part une frame plus tard pour que la transition
         ait un état de départ à quitter. */
      prochaineFrame(() => { scene.dataset.estompe = "oui"; });
    }
  }, DUREES.frappe);
  return scene;
}

/** ② LE MÉLANGE — un seul dos, cloné.
 *  ⭐ CE QUI FAIT L'ILLUSION N'EST PAS L'IMAGE, C'EST LE DÉCALAGE : douze
 *  copies du même dos, dispersées par des transformations de départ, qui
 *  reviennent au centre en cascade. Eric l'a demandé ainsi (*« anime depuis le
 *  dos de carte »*) : aucune planche d'animation à fournir, aucune frame à
 *  charger, et le jour où le dos change, le mélange change avec lui.
 *  ⛔ Les positions de départ sont TIRÉES À CHAQUE MONTAGE — un mélange qui
 *  retombe deux fois sur la même figure n'est plus un mélange. */
const DOS_CLONES = 12;

/** Une permutation de 1..n — Fisher-Yates, la même que le reste du builder.
 *  ⭐ C'est elle qui rend le mélange non répétitif : les douze départs et les
 *  douze retards sont écrits dans la feuille, mais l'ATTRIBUTION change à
 *  chaque montage. Douze positions × douze cascades = cent quarante-quatre
 *  figures, sans un pixel de décor dans ce fichier. */
function permutation(n) {
  const rangs = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = rangs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rangs[i], rangs[j]] = [rangs[j], rangs[i]];
  }
  return rangs;
}

function renderSeq2(etape) {
  const scene = el("div", "ceremonie-scene");
  const pile = el("div", "ceremonie-pile");
  pile.dataset.etape = etape; // "melange" | "grossit"
  const reduit = mouvementReduit();
  const departs = permutation(DOS_CLONES);
  const cascades = permutation(DOS_CLONES);

  for (let i = 0; i < DOS_CLONES; i++) {
    const img = document.createElement("img");
    img.className = "ceremonie-dos";
    img.src = ARCANA_BACK_SRC;
    img.alt = "";
    img.decoding = "async";
    /* ⛔ DEUX CHIFFRES, PAS UN STYLE : garde 7 (aucun style en ligne dans
       `ui/`) — le décor vit dans la feuille, le script ne fait que désigner
       lequel. */
    if (!reduit) {
      img.dataset.part = String(departs[i]);
      img.dataset.cascade = String(cascades[i]);
    }
    pile.append(img);
  }
  scene.append(pile);

  /* une frame plus tard : toutes les cartes rentrent. La cascade vient du
     `data-cascade` de chacune, pas d'un minuteur par carte. */
  if (!reduit) prochaineFrame(() => { pile.dataset.rassemble = "oui"; });
  else pile.dataset.rassemble = "oui";
  return scene;
}

/** ③ LE DOS SEUL, ET LE TAP QUI LE RETOURNE.
 *  ⚠️ C'EST UN `<button>`, pas une image qui écoute le clic : le geste doit
 *  exister au clavier et s'annoncer à l'oreille. C'est la règle déjà posée au
 *  lot 61 pour l'ancien écran, et elle ne change pas parce que la scène a
 *  grandi. */
function renderSeq3(ctx, act) {
  const scene = el("div", "ceremonie-scene");
  const retournee = ctx.face === "up";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ceremonie-flip";
  btn.dataset.face = "down";
  btn.dataset.etat = ctx.dezoom ? "dezoom" : "zoom";
  btn.setAttribute("aria-label", retournee ? "Your card" : "Turn the card over");
  btn.disabled = retournee;

  const dos = document.createElement("img");
  dos.className = "ceremonie-flip-face ceremonie-flip-dos";
  dos.src = ARCANA_BACK_SRC;
  dos.alt = "";

  const face = document.createElement("img");
  face.className = "ceremonie-flip-face ceremonie-flip-carte";
  face.alt = "";
  if (ctx.drawnId) face.src = arcanaImageSrc(ctx.drawnId);

  btn.append(dos, face);
  /* ⭐ LE RETOURNEMENT DOIT S'ANIMER, DONC IL PART DE `down` : le nœud est
     neuf à chaque rendu, et poser `up` tout de suite ferait un basculement
     instantané — la carte serait déjà tournée avant qu'on ait vu tourner. */
  if (retournee) {
    if (mouvementReduit()) btn.dataset.face = "up";
    else prochaineFrame(() => { btn.dataset.face = "up"; });
  }
  if (!retournee) btn.addEventListener("click", () => act({ kind: "destinyFlip" }));
  scene.append(btn);
  return scene;
}

/**
 * L'écran plein de la cérémonie — un seul nœud, posé par la coquille.
 *
 * @param {object} ctx
 * @param {"seq1"|"seq2"|"seq3"} ctx.phase
 * @param {"melange"|"grossit"} [ctx.etape]  la sous-étape de la séquence 2
 * @param {string} [ctx.drawnId]             la carte tirée, pas encore actée
 * @param {"down"|"up"} [ctx.face]
 * @param {boolean} [ctx.dezoom]             la carte est retournée et repart à 50 %
 * @param {Function} onAction
 */
export function renderCeremonie(ctx, onAction) {
  const act = onAction || (() => {});
  const fs = el("div", "ceremonie");
  fs.dataset.ecran = "FS";       // CADRES §2 : plein écran, ni belt ni menu
  fs.dataset.seq = ctx.phase;

  if (ctx.phase === "seq1") fs.append(renderSeq1());
  else if (ctx.phase === "seq2") fs.append(renderSeq2(ctx.etape || "melange"));
  else fs.append(renderSeq3(ctx, act));

  /* 🔴 LES TROIS TAPS SONT LA SEULE SORTIE, ET C'EST VOULU. Eric, 2026-08-30 :
     *« un petit tap ou clic au mauvais moment ne change rien »* · *« succession
     rapide de 3 = résolution immédiate »*. Pas de bouton `Skip` : la cérémonie
     ne s'interrompt pas par distraction, seulement par insistance.
     ⚠️ L'écouteur est posé sur le PLEIN ÉCRAN, donc il compte aussi les taps
     qui tombent sur la carte de la séquence 3 — c'est ce qu'Eric décrit : le
     tap qui retourne compte comme un tap.
     ⛔ Et il ne bloque pas le geste du dessous (pas de `stopPropagation`) : le
     tap qui retourne la carte doit continuer de la retourner. */
  fs.addEventListener("pointerdown", () => act({ kind: "destinyTap" }));
  return fs;
}
