/* ══ UN DÉ EST UN DESSIN : IL NE PREND JAMAIS LE POINTEUR ════════════════
   Eric, 2026-09-13 : *« Le drag and drop multi directionnel de abilities, qui
   marchait très bien, ne marche plus du tout. »*

   📏 CE QUI SE PASSAIT, MESURÉ AU NAVIGATEUR — Chromium 512 × 900, Abilities →
   4D6 → Flash, glisser `podium:0` → `str`, et la suite d'événements EST la
   preuve :
     pointerdown:fh-cd-static-snap → pointermove → **dragstart** →
     **pointercancel** → drag × 11 → dragend
   Le décor du dé en mode image est un `<img>` (`mountSnapshot`), et un `<img>`
   est NATIVEMENT déplaçable dans un navigateur. Au deuxième pixel, le
   navigateur ouvrait SON glisser d'image, annulait le pointeur, et notre geste
   se fermait proprement sans rien à déposer.

   ⚠️ ET ÇA NE SE VOIT QUE LÀ OÙ LA 3D FONCTIONNE. `dice3d.css` ne montre
   l'image que sous `.is-webgl` ; sans WebGL c'est le repli (un `<span>`, rien
   de déplaçable) qui est sous le doigt, et tout marche. Mesuré aux deux bancs :
   sans WebGL le score se pose, AVEC WebGL rien ne se pose. C'est pourquoi ce
   défaut vit sur la machine d'Eric et sur aucun banc headless ordinaire — et
   pourquoi il est ANTÉRIEUR aux lots 199-202 (mesuré en v622, v623, v626).

   🔴 CE QUE CE GARDE TIENT, ET POURQUOI IL NE LIT PAS UNE LIGNE DE CSS AU
   HASARD. Il part de la DONNÉE — l'hôte que `createDieHost` construit VRAIMENT
   et ce que `dice3d.mjs` insère dedans — puis il vérifie que la feuille de FHPC
   couvre cet objet-là. Renommer la classe du moteur ne fait pas passer le garde
   à côté : il lit le nom sur l'objet, il ne le connaît pas d'avance.

   ⭐ ET LA RÈGLE SE POSE UNE FOIS. `pointer-events` est HÉRITÉE : une seule
   déclaration sur l'hôte couvre le canvas, l'image instantanée, le repli,
   l'incrustation du chiffre et les deux moitiés d'un d100. Le garde refuse donc
   AUSSI qu'un descendant la reprenne — c'est la seule façon qu'une règle unique
   reste unique. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { createTestDocument } from "./dom-stub.mjs";
globalThis.document = createTestDocument();

const { createDieHost } = await import("../ui/builder/dice3d.mjs");

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => readFileSync(join(RACINE, p), "utf8");
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ");

/* ── LA DONNÉE ① : l'hôte que le moteur construit, et ce qu'il met dedans ──
   ⛔ AUCUNE LISTE ÉCRITE À LA MAIN. On appelle le constructeur et on lit le
   nœud : c'est la seule façon qu'un enfant ajouté demain entre tout seul dans
   le garde (la loi « une liste par nom est incomplète par construction »). */
function hoteDeDe() {
  return createDieHost({ sides: 6, result: 6, sizePx: 52, index: 0, animate: false, snapshot: true });
}

function classesDe(noeud) {
  return String(noeud.className || "").split(/\s+/).filter(Boolean);
}

function descendants(noeud) {
  const out = [];
  for (const enfant of noeud.childNodes || []) {
    if (enfant.nodeType !== 1) continue;
    out.push(enfant);
    out.push(...descendants(enfant));
  }
  return out;
}

/* ── LA DONNÉE ② : ce que `mountSnapshot` insère, LU DANS LE MODULE ──────
   Le chemin image ne se construit qu'au navigateur (il lui faut un canvas),
   donc on ne peut pas le faire tourner ici. On lit la classe qu'il pose, dans
   la ligne qui la pose — c'est la source, pas une note recopiée. */
function classeDeLInstantane() {
  const source = lire("ui/builder/dice3d.mjs");
  const trouve = /image\s*\.\s*className\s*=\s*"([^"]+)"/.exec(source);
  assert.ok(trouve, "sonde : `mountSnapshot` pose toujours une classe sur son image");
  return trouve[1];
}

/* ── LE LECTEUR DE FEUILLE — les blocs qui parlent de `pointer-events` ──── */
function declarationsDePointeur(cssText) {
  const texte = sansCommentaires(cssText);
  const blocs = [];
  for (const m of texte.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selecteur = m[1].trim();
    for (const d of m[2].matchAll(/pointer-events\s*:\s*([a-z-]+)/g)) {
      blocs.push({ selecteur, valeur: d[1] });
    }
  }
  return blocs;
}

test("🔴 UN DÉ SE DÉCLARE IMAGE — c'est la donnée d'où la règle se déduit", () => {
  const hote = hoteDeDe();
  assert.equal(hote.getAttribute("role"), "img",
    "le moteur dit lui-même que son hôte est une image ; c'est ce qui fait d'elle un décor");
  assert.ok(classesDe(hote).length > 0, "…et il lui donne une classe, celle que la feuille vise");
});

test("⚔️ LA PRÉMISSE DU GARDE EST VRAIE : le moteur met bien une IMAGE dans le dé", () => {
  /* ⛔ UN GARDE QUI NE PEUT JAMAIS ACCUSER EST LE PIRE. Si `mountSnapshot`
     cessait un jour de poser un `<img>`, la raison d'être de la règle changerait
     — et ce test doit le dire, pas la couvrir en silence. */
  const source = lire("ui/builder/dice3d.mjs");
  assert.match(source, /createElement\("img"\)/,
    "le chemin image crée un `<img>` — c'est lui qui ouvre le glisser natif du navigateur");
  assert.ok(classeDeLInstantane().length > 0, "et il le nomme");
});

test("🔴 LA RÈGLE EXISTE, UNE SEULE FOIS, SUR L'HÔTE — et elle est dans la feuille de FHPC", () => {
  const hote = hoteDeDe();
  const shell = declarationsDePointeur(lire("ui/builder/shell.css"));
  const surLHote = shell.filter((b) => classesDe(hote).some((c) => b.selecteur === `.${c}`));
  assert.equal(surLHote.length, 1,
    `une seule déclaration de pointeur sur l'hôte du dé — trouvé : ${surLHote.map((b) => b.selecteur).join(", ") || "aucune"}`);
  assert.equal(surLHote[0].valeur, "none",
    "et elle rend le dé transparent au pointeur : un décor ne prend pas le geste de ce qui le porte");
});

test("⚔️ ATTAQUE — LE GARDE MORD : sans la règle, il rougit", () => {
  const hote = hoteDeDe();
  const mutante = lire("ui/builder/shell.css")
    .replace(/\.fh-cd-static-die\s*\{\s*pointer-events\s*:\s*none;?\s*\}/g, "");
  const surLHote = declarationsDePointeur(mutante)
    .filter((b) => classesDe(hote).some((c) => b.selecteur === `.${c}`));
  assert.equal(surLHote.length, 0,
    "⚔️ la mutation retire bien la règle — sinon ce test se protégerait lui-même");
});

test("⛔ AUCUN DESCENDANT NE REPREND LE POINTEUR — sinon la règle unique ne l'est plus", () => {
  /* `pointer-events` est héritée : l'hôte suffit, À CONDITION que rien
     au-dessous ne la redéclare. Les descendants sont ceux que le constructeur
     a VRAIMENT posés, plus l'image du chemin instantané. */
  const hote = hoteDeDe();
  const noms = new Set([...descendants(hote).flatMap(classesDe), classeDeLInstantane()]);
  assert.ok(noms.size >= 3, `sonde : le dé a bien des enfants nommés (${[...noms].join(", ")})`);

  const partout = [
    ...declarationsDePointeur(lire("ui/builder/shell.css")),
    ...declarationsDePointeur(lire("ui/builder/dice3d.css"))
  ];
  const fautifs = partout.filter((b) => [...noms].some((n) => b.selecteur.includes(`.${n}`)));
  assert.deepEqual(fautifs, [],
    "un descendant du dé qui redéclare `pointer-events` reprendrait le geste à l'hôte, et la règle cesserait d'être unique");
});

test("⛔ ET LA FEUILLE DU MOTEUR RESTE UNE COPIE : la règle de FHPC ne s'y est pas glissée", () => {
  /* `dice3d.css` est portée à l'octet depuis `fh-phb` — un défaut s'y corrige
     EN AMONT puis se recopie. La loi posée ici est une loi de FHPC sur un objet
     du moteur : elle vit dans la feuille de FHPC, jamais dans la sienne. */
  assert.deepEqual(declarationsDePointeur(lire("ui/builder/dice3d.css")), [],
    "aucune règle de pointeur dans la feuille recopiée");
});
