/* ══ L'ASTROLABE — la molette de la souris sur les chevrons horizontaux — lot 330, 2026-09-27 ══════
   ⚖️ Eric, 27/09 : la notice `Gpt in FH/Astrolabe-30px/NOTICE-CLAUDE.md` (vault, avec son gabarit
   `astrolabe-30px.svg` et son blueprint), puis, en conversation : *« À appliquer sur tous les chevrons
   horizontaux (plutôt 20 blg de diamètre que 30) »* · *« C'est pour les desktop et souris, donc me
   casse pas les couilles avec la zone tactile »* · *« ça se déclenche sur un hover de souris »*.

   ⭐ CE QUE FAIT L'ORGANE :
     · au SURVOL SOURIS d'un chevron, un petit cadran (20 blg) se pose à la place de son dessin —
       la feuille (`shell.css`, `[data-astrolabe]`) le montre, ⛔ rien ne bouge dans la mise en page ;
     · la MOLETTE, captée sur ce chevron SEULEMENT, fait avancer la navigation QUE CE CHEVRON
       COMMANDE DÉJÀ (celle de son clic) — ⛔ aucun second carrousel ;
     · molette vers le bas (`deltaY > 0`) = aiguille HORAIRE = tuiles vers la GAUCHE = « suivant » ;
       vers le haut = antihoraire = « précédent ». Le même sens sur les deux chevrons d'une paire ;
     · SEULE L'AIGUILLE TOURNE (30° par pas, angle CUMULÉ — jamais de retour de 360 à 0) ; la souris,
       la flèche ↕ et les graduations restent fixes ;
     · une borne atteinte (le pas refusé) ne fait PAS tourner l'aiguille ;
     · Ctrl + molette (le zoom) n'est jamais intercepté ; hors du chevron, la page défile comme avant.

   ⛔ MODULE FEUILLE : aucun import, aucune cote de mise en page, aucune couleur écrite ici — le
   dessin lit ses encres dans les jetons (`--astrolabe-*`, tokens.css, jour ET nuit). */

/** Un pas de molette : à partir de combien de pixels normalisés on avance d'une tuile. ⭐ Une molette
 *  physique donne ~100 par cran dans Chrome et Safari (un pas — mesuré, 50 en faisait DEUX) ; un trackpad donne une pluie de petits deltas, qu'on AGRÈGE
 *  jusqu'au seuil — jamais un passage par événement. */
export const SEUIL_PAS = 100;
/** L'aiguille avance de 30° par pas — une graduation (douze sur le cadran). */
export const DEGRES_PAR_PAS = 30;

/* l'angle cumulé de chaque paire de chevrons, et ce qui reste à agréger — ⭐ au MODULE, pas au nœud :
   un écran qui se repeint recrée ses chevrons, l'aiguille garde sa place */
const angles = new Map();
const restes = new Map();

/** L'angle cumulé d'une paire. */
export function angleDe(groupe) { return angles.get(groupe) || 0; }

/** Un `wheel` en pixels, quel que soit son `deltaMode` (0 : pixels · 1 : lignes · 2 : pages). */
export function deltaEnPixels(ev) {
  const dy = Number(ev && ev.deltaY) || 0;
  const mode = Number(ev && ev.deltaMode) || 0;
  /* Firefox parle en LIGNES, trois par cran : 100/3 par ligne pour qu'un cran fasse un pas partout */
  return mode === 1 ? dy * (SEUIL_PAS / 3) : mode === 2 ? dy * 400 : dy;
}

/** Combien de pas cet événement déclenche (±n, souvent 0 pour un trackpad qui agrège), en tenant
 *  le reste de la paire. Pur, hormis le reste qu'il met à jour. */
export function pasDeLaMolette(groupe, ev) {
  const total = (restes.get(groupe) || 0) + deltaEnPixels(ev);
  const pas = Math.trunc(total / SEUIL_PAS);
  restes.set(groupe, total - pas * SEUIL_PAS);
  return pas;
}

/* ── LE DESSIN — le gabarit `astrolabe-30px.svg` (viewBox 30), simplifié pour 20 blg : les douze
   graduations restent (elles disent « un cadran »), l'aiguille est le triangle du gabarit, la souris et
   ↕ gardent leur tracé ; le cercle intérieur part (illisible à 20). Les classes portent les encres. */
const NS = "http://www.w3.org/2000/svg";
function graduations() {
  const t = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const c = Math.cos(a), s = Math.sin(a);
    t.push(`M${(15 + 10.5 * c).toFixed(2)} ${(15 + 10.5 * s).toFixed(2)} L${(15 + 12 * c).toFixed(2)} ${(15 + 12 * s).toFixed(2)}`);
  }
  return t.join(" ");
}
/* ⛔ PAS D'`innerHTML` (garde A ter : zéro dans tout ui/) — le dessin est une TABLE d'éléments. */
const DESSIN = [
  ["circle", { class: "astrolabe-face", cx: 15, cy: 15, r: 14.25, "stroke-width": 1.5 }],
  ["path", { class: "astrolabe-trait", d: graduations(), "stroke-width": 1, fill: "none" }],
  ["g", { class: "astrolabe-rotor" }, [["path", { class: "astrolabe-aiguille", d: "M15 3 L17 7.5 L13 7.5 Z" }]]],
  ["g", { class: "astrolabe-indice", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    ["rect", { x: 9, y: 9.5, width: 7.5, height: 11.5, rx: 3.5, "stroke-width": 1.3 }],
    ["path", { d: "M12.75 11.5 V14.2", "stroke-width": 1.5 }],
    ["path", { d: "M20 10.5 V19.5 M18.3 12.2 L20 10.5 L21.7 12.2 M18.3 17.8 L20 19.5 L21.7 17.8", "stroke-width": 1.2 }],
  ]],
];
function tracer(doc, [nom, attrs, enfants = []]) {
  const n = doc.createElementNS(NS, nom);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  for (const e of enfants) n.append(tracer(doc, e));
  return n;
}

/** Le cadran, prêt à poser : un `<span class="astrolabe">` qui porte son SVG. Décoratif pour les
 *  lecteurs d'écran — le chevron porte déjà son nom. */
export function construireLAstrolabe(groupe, doc = typeof document !== "undefined" ? document : null) {
  if (!doc) return null;
  const s = doc.createElement("span");
  s.className = "astrolabe";
  s.dataset.groupe = groupe;
  s.setAttribute("aria-hidden", "true");
  if (typeof doc.createElementNS === "function") {
    const svg = doc.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 30 30");
    svg.setAttribute("focusable", "false");
    for (const e of DESSIN) svg.append(tracer(doc, e));
    s.append(svg);
  }
  poserLAiguille(s, angleDe(groupe));
  return s;
}

/** Pose l'aiguille à `angle` — par l'ATTRIBUT SVG (⛔ jamais un style en ligne, garde 7 de
 *  `ui-jetons`). Depuis `depuis`, la rotation s'anime (`animate`, 200 ms), sauf pour qui a demandé
 *  moins de mouvement. */
function poserLAiguille(astrolabe, angle, depuis = null) {
  const rotor = astrolabe && typeof astrolabe.querySelector === "function" ? astrolabe.querySelector(".astrolabe-rotor") : null;
  if (!rotor || typeof rotor.setAttribute !== "function") return;
  rotor.setAttribute("transform", `rotate(${angle} 15 15)`);
  const calme = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (depuis !== null && !calme && typeof rotor.animate === "function") {
    rotor.animate([{ transform: `rotate(${depuis}deg)` }, { transform: `rotate(${angle}deg)` }],
      { duration: 200, easing: "ease-out" });
  }
}

/** ARMER un chevron. `avancer(sens)` est la navigation que le chevron commande déjà (±1) ; elle rend
 *  `false` si le pas est refusé (une borne), et alors l'aiguille ne bouge pas.
 *  @param {HTMLElement} chevron
 *  @param {{ groupe: string, avancer: (sens: number) => (boolean|void) }} o */
export function armerAstrolabe(chevron, { groupe, avancer } = {}) {
  if (!chevron || !groupe || typeof avancer !== "function") return chevron;
  chevron.dataset.astrolabe = groupe;
  const cadran = construireLAstrolabe(groupe);
  if (cadran) chevron.append(cadran);
  chevron.addEventListener("wheel", (ev) => {
    if (!ev || ev.ctrlKey) return;                 /* ⛔ le zoom n'est jamais intercepté */
    if (typeof ev.preventDefault === "function") ev.preventDefault();
    /* ⭐ un cran traité ici ne l'est pas deux fois : la molette de quantité (X1/X2) écoute tout
       son tambour, et son chevron est DEDANS */
    if (typeof ev.stopPropagation === "function") ev.stopPropagation();
    const pas = pasDeLaMolette(groupe, ev);
    if (!pas) return;
    const sens = pas > 0 ? 1 : -1;
    for (let i = 0; i < Math.abs(pas); i++) {
      if (avancer(sens) === false) { restes.set(groupe, 0); break; }
      const depuis = angleDe(groupe);
      const angle = depuis + sens * DEGRES_PAR_PAS;
      angles.set(groupe, angle);
      /* ⭐ les DEUX chevrons de la paire montrent la même aiguille */
      const racine = chevron.ownerDocument || (typeof document !== "undefined" ? document : null);
      const tous = racine && typeof racine.querySelectorAll === "function"
        ? [...racine.querySelectorAll(`.astrolabe[data-groupe="${groupe}"]`)] : [];
      for (const a of (tous.length ? tous : [cadran])) poserLAiguille(a, angle, depuis);
    }
  }, { passive: false });
  return chevron;
}
