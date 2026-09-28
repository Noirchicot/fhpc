/* ══ ⚙️ L'ENGRENAGE DU BELT — et la molette des autres chevrons — lot 343, 2026-09-28 ════════════════
   ⚖️ Eric, 28/09 : la notice `Gpt in FH/Astrolabe-30px/NOTICE-CLAUDE.md` et son prototype validé
   (`engrenage-40px-source.html`) — *« Cette version remplace l'ancien astrolabe : utilise désormais
   l'engrenage gris métallique de 40 px, avec deux flèches bleues épaisses qui dépassent légèrement.
   Intègre-le au survol des deux chevrons du bandeau supérieur du builder, sans déplacer les éléments »* ·
   *« remplace l'ancien tuner par ceci ; vérifie bien qu'ils sont bien placés, ce n'était pas le cas avant »*.

   ⭐ LE SENS, TEL QU'ERIC L'A VALIDÉ — ⛔ ne pas inverser :
     · ROULER VERS LE HAUT = DROITE : la flèche qui monte puis vire à droite s'illumine, la roue tourne
       dans le sens HORAIRE, les tuiles se déplacent VISIBLEMENT vers la droite ;
     · ROULER VERS LE BAS = GAUCHE : la flèche qui descend puis vire à gauche s'illumine, rotation
       ANTIHORAIRE, les tuiles vers la gauche.
     La bonne flèche s'illumine dès le PREMIER événement de molette, même en bout de liste ; l'autre
     s'atténue. Les flèches restent fixes : seule la roue dentée tourne.
   ⭐ « Droite » est le MOUVEMENT VISIBLE du contenu : les tuiles du belt partent vers la droite quand le
     ruban défile vers la gauche (`decalerLeBelt(-1)`, `scrollLeft` qui diminue).

   ⛔ PÉRIMÈTRE : l'engrenage vit sur les DEUX chevrons du belt, et nulle part ailleurs (la notice : *« Les
   chevrons des catégories et des listes d'objets ne sont pas concernés »*). Les autres chevrons perdent
   l'astrolabe du lot 330 mais gardent leur molette (`armerLaMolette`, sans cadran).
   ⛔ MODULE FEUILLE : aucun import, aucune cote de mise en page, aucune couleur écrite ici — les encres
   vivent dans les jetons (`--engrenage-*`, tokens.css, jour ET nuit), la place dans `shell.css`. */

/* ── LA NORMALISATION DU PROJET (celle du lot 330) — ⭐ la notice : « Utiliser la normalisation du projet si
   elle existe déjà, sans inverser une deuxième fois le signe ». */
/** Un pas de molette des chevrons ordinaires : ~100 par cran dans Chrome et Safari (mesuré au lot 330 :
 *  50 en faisait DEUX). */
export const SEUIL_PAS = 100;
/** Un `wheel` en pixels, quel que soit son `deltaMode` (0 : pixels · 1 : lignes · 2 : pages). */
export function deltaEnPixels(ev) {
  const dy = Number(ev && ev.deltaY) || 0;
  const mode = Number(ev && ev.deltaMode) || 0;
  return mode === 1 ? dy * (SEUIL_PAS / 3) : mode === 2 ? dy * 400 : dy;
}

/* ══ LA MOLETTE D'UN CHEVRON ORDINAIRE — sans cadran ═══════════════════════════════════════════════
   Ce que le lot 330 faisait, moins l'astrolabe : la molette, captée sur ce chevron SEULEMENT, fait avancer
   la navigation qu'il commande déjà. Bas = suivant (contenu vers la gauche), haut = précédent (vers la
   droite) — le même sens visible que l'engrenage. Ctrl + molette (le zoom) n'est jamais intercepté. */
const restes = new Map();
/** Combien de pas cet événement déclenche (±n), en tenant le reste de la paire. */
export function pasDeLaMolette(groupe, ev) {
  const total = (restes.get(groupe) || 0) + deltaEnPixels(ev);
  const pas = Math.trunc(total / SEUIL_PAS);
  restes.set(groupe, total - pas * SEUIL_PAS);
  return pas;
}
/** @param {{ groupe: string, avancer: (sens: number) => (boolean|void) }} o */
export function armerLaMolette(chevron, { groupe, avancer } = {}) {
  if (!chevron || !groupe || typeof avancer !== "function") return chevron;
  chevron.addEventListener("wheel", (ev) => {
    if (!ev || ev.ctrlKey) return;
    if (typeof ev.preventDefault === "function") ev.preventDefault();
    /* ⭐ un cran traité ici ne l'est pas deux fois (la molette de quantité écoute tout son tambour) */
    if (typeof ev.stopPropagation === "function") ev.stopPropagation();
    const pas = pasDeLaMolette(groupe, ev);
    if (!pas) return;
    const sens = pas > 0 ? 1 : -1;
    for (let i = 0; i < Math.abs(pas); i++) {
      if (avancer(sens) === false) { restes.set(groupe, 0); break; }
    }
  }, { passive: false });
  return chevron;
}

/* ══ L'ENGRENAGE ══════════════════════════════════════════════════════════════════════════════════ */
/** Le seuil du prototype : un pas à 28 unités normalisées, l'accumulateur remis à zéro à un changement de
 *  sens ou après 160 ms d'interruption — et après chaque pas (un cran de souris = un pas). */
export const SEUIL_ENGRENAGE = 28;
export const PAUSE_ENGRENAGE_MS = 160;
/** La flèche du geste reste allumée 800 ms après le dernier événement (le prototype). */
export const LUEUR_ENGRENAGE_MS = 800;
/** La roue avance de 30° par pas, en 240 ms (le prototype). */
export const DEGRES_PAR_PAS = 30;
export const DUREE_ROTATION_MS = 240;

/** Les douze dents du prototype, en points SVG sur une roue de 40 : chaque dent passe par (−15°, r 16),
 *  (−9°, 20), (0°, 20), (9°, 20), (15°, 16). ⭐ Calculées une fois, écrites en ATTRIBUT (⛔ jamais un style
 *  en ligne — garde 7 de `ui-jetons`). */
export const POINTS_DES_DENTS = (() => {
  const p = [];
  for (let t = 0; t < 12; t++) {
    for (const [ecart, rayon] of [[-15, 16], [-9, 20], [0, 20], [9, 20], [15, 16]]) {
      const a = (t * 30 + ecart) * Math.PI / 180;
      p.push(`${(20 + rayon * Math.cos(a)).toFixed(3)},${(20 + rayon * Math.sin(a)).toFixed(3)}`);
    }
  }
  return p.join(" ");
})();

/* Les deux flèches — les tracés Lucide `corner-up-right` et `corner-down-left` (viewBox 24), embarqués :
   la notice demande de les « embarquer de façon autonome » plutôt que de charger la bibliothèque. */
const FLECHES = {
  droite: ["m15 14 5-5-5-5", "M4 20v-7a4 4 0 0 1 4-4h12"],
  gauche: ["M20 4v7a4 4 0 0 1-4 4H4", "m9 10-5 5 5 5"]
};
const NS = "http://www.w3.org/2000/svg";
let numero = 0;
function svg(doc, nom, attrs = {}, enfants = []) {
  const n = doc.createElementNS(NS, nom);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  for (const e of enfants) n.append(e);
  return n;
}

/** La roue et ses flèches, prêtes à poser dans un chevron. Décoratives pour les lecteurs d'écran : le
 *  chevron porte déjà son nom. */
export function construireLEngrenage(doc = typeof document !== "undefined" ? document : null) {
  if (!doc) return null;
  const s = doc.createElement("span");
  s.className = "engrenage";
  s.setAttribute("aria-hidden", "true");
  if (typeof doc.createElementNS !== "function") return s;
  const id = `engrenage-degrade-${++numero}`;
  /* le dégradé du prototype : `linear-gradient(140deg, clair, sombre)` — son axe, en coordonnées de la boîte */
  const degrade = svg(doc, "linearGradient", { id, x1: "0.179", y1: "0.117", x2: "0.821", y2: "0.883" }, [
    svg(doc, "stop", { offset: "0", class: "engrenage-clair" }),
    svg(doc, "stop", { offset: "1", class: "engrenage-sombre" })
  ]);
  const rotor = svg(doc, "g", { class: "engrenage-rotor", transform: "rotate(0 20 20)" }, [
    svg(doc, "polygon", { class: "engrenage-dents", points: POINTS_DES_DENTS, fill: `url(#${id})` })
  ]);
  const roue = svg(doc, "svg", { class: "engrenage-roue", viewBox: "0 0 40 40", focusable: "false" }, [
    svg(doc, "defs", {}, [degrade]),
    rotor,
    /* le moyeu est FIXE — hors du rotor : seule la roue dentée tourne */
    svg(doc, "circle", { class: "engrenage-moyeu", cx: 20, cy: 20, r: 4 })
  ]);
  s.append(roue);
  for (const [cote, traces] of Object.entries(FLECHES)) {
    s.append(svg(doc, "svg", { class: `engrenage-fleche ${cote}`, viewBox: "0 0 24 24", focusable: "false" },
      traces.map((d) => svg(doc, "path", { d }))));
  }
  return s;
}

/* L'état de la paire du belt — ⭐ AU MODULE : le belt se repeint, la roue garde son angle */
let angleDuBelt = 0;
let lueur = null;
/** L'angle cumulé de la roue du belt (le témoin des bancs). */
export function angleDeLEngrenage() { return angleDuBelt; }

function chevronsDuBelt(doc) {
  return doc && typeof doc.querySelectorAll === "function" ? [...doc.querySelectorAll("[data-engrenage]")] : [];
}
/** ILLUMINER — dès le premier événement, même en bout de liste : la flèche du geste s'allume, l'autre
 *  s'atténue (la feuille), sur les DEUX chevrons. */
function illuminer(doc, cote) {
  const tous = chevronsDuBelt(doc);
  for (const c of tous) c.dataset.direction = cote;
  if (lueur) clearTimeout(lueur);
  lueur = setTimeout(() => { for (const c of chevronsDuBelt(doc)) delete c.dataset.direction; lueur = null; }, LUEUR_ENGRENAGE_MS);
}
/** Tourner la roue des deux chevrons, de `depuis` à `angle` — par l'ATTRIBUT SVG, animé 240 ms sauf pour qui
 *  a demandé moins de mouvement. */
function tourner(doc, depuis, angle) {
  const calme = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const c of chevronsDuBelt(doc)) {
    const rotor = typeof c.querySelector === "function" ? c.querySelector(".engrenage-rotor") : null;
    if (!rotor) continue;
    rotor.setAttribute("transform", `rotate(${angle} 20 20)`);
    if (!calme && typeof rotor.animate === "function") {
      rotor.animate([{ transform: `rotate(${depuis}deg)` }, { transform: `rotate(${angle}deg)` }],
        { duration: DUREE_ROTATION_MS, easing: "cubic-bezier(.2,.65,.25,1)" });
    }
  }
}

/** ARMER un chevron du belt. `avancer(sens)` est la navigation qu'il commande déjà : +1 fait défiler le
 *  ruban vers la gauche (tuiles vers la GAUCHE), −1 vers la droite (tuiles vers la DROITE) ; elle rend
 *  `false` quand le pas est refusé (une borne, un pas encore en vol), et la roue ne tourne pas.
 *  @param {HTMLElement} chevron
 *  @param {{ avancer: (sens: number) => (boolean|void) }} o */
export function armerEngrenage(chevron, { avancer } = {}) {
  if (!chevron || typeof avancer !== "function") return chevron;
  chevron.dataset.engrenage = "oui";
  const roue = construireLEngrenage(chevron.ownerDocument || undefined);
  if (roue) {
    const rotor = typeof roue.querySelector === "function" ? roue.querySelector(".engrenage-rotor") : null;
    if (rotor) rotor.setAttribute("transform", `rotate(${angleDuBelt} 20 20)`);
    chevron.append(roue);
  }
  let cumul = 0, dernier = 0;
  chevron.addEventListener("wheel", (ev) => {
    if (!ev || ev.ctrlKey || !ev.deltaY) return;
    if (typeof ev.preventDefault === "function") ev.preventDefault();
    if (typeof ev.stopPropagation === "function") ev.stopPropagation();
    const doc = chevron.ownerDocument || (typeof document !== "undefined" ? document : null);
    const delta = deltaEnPixels(ev);
    /* ⭐ haut (deltaY < 0) = DROITE, bas = GAUCHE — la notice, mot pour mot */
    const direction = -Math.sign(delta);
    illuminer(doc, direction > 0 ? "droite" : "gauche");
    const maintenant = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (maintenant - dernier > PAUSE_ENGRENAGE_MS || Math.sign(delta) !== Math.sign(cumul)) cumul = 0;
    dernier = maintenant;
    cumul += delta;
    if (Math.abs(cumul) < SEUIL_ENGRENAGE) return;
    const sens = Math.sign(cumul);        // +1 : le ruban vers la gauche (bas) · −1 : vers la droite (haut)
    cumul = 0;
    if (avancer(sens) === false) return;  // une borne, ou le pas d'avant encore en vol : la roue ne tourne pas
    const depuis = angleDuBelt;
    angleDuBelt += -sens * DEGRES_PAR_PAS; // haut : +30° (horaire) · bas : −30° (antihoraire)
    tourner(doc, depuis, angleDuBelt);
  }, { passive: false });
  return chevron;
}
