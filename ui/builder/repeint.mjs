/* ══ 🖐️ LE REPEINT QUI NE CASSE RIEN — lot 361 (ARCHI 35, 29/09) ═══════════════════════════════════════

   `refresh()` repeint en REMPLAÇANT les nœuds (`swapContent`). Deux choses du joueur ne survivaient pas à ce
   remplacement, et ce lot les a mesurées toutes les deux, à la souris comme au doigt (v912, 29/09).

   1 · LE GESTE EN COURS. Un champ de texte s'enregistre quand il perd le focus (`change`, `blur`) — et c'est un
       APPUI ailleurs qui le lui prend. Son enregistrement repeignait donc l'écran AU MILIEU de cet appui, entre
       le `mousedown` et le `mouseup` : l'élément pressé était remplacé, et le geste perdu.
       📏 Name actif, clic sur Done → `mousedown` → `change` → repeint → `mouseup` sur le NOUVEAU Done → aucun
       `click` : Done ne fait rien. Au doigt (iPad), tap sur l'onglet Species → `mousedown` synthétisé →
       `change` → repeint → aucun `click`. Et le jeton d'Identity s'armait sur un nœud détaché (`glisser.mjs`).
       ⭐ LA LOI : un repeint demandé pendant un appui ATTEND LA FIN DE SON CLIC. L'état est écrit tout de suite ;
       seul l'échange des nœuds attend.

   2 · LE TEXTE EN COURS. Au doigt, un glisser ne prend pas le focus : le champ reste actif, et la pose repeint
       l'écran sans qu'aucun `change` ne soit parti.
       📏 « Glisse » tapé dans Name, Woman glissé sur Gender : posé — mais le champ revient à l'ancien nom. Le
       texte mourait avec son nœud.
       ⭐ LA LOI : un repeint ne tue pas un texte non enregistré. Il fait d'abord enregistrer le champ actif par
       SON chemin — on lui retire le focus, et il s'écrit (`change`, `blur`), comme sous un doigt qui s'en va ;
       un champ qui n'écrit nulle part (la monnaie qu'on ajoute, la recherche) retrouve son texte, repeint.

   ⛔ RIEN ICI N'EST UN DÉLAI : la fin d'un clic est un ÉVÉNEMENT — le relâché, puis la fin de la tâche qui
   livre `mouseup` et `click` ensemble. Et rien n'est deviné : un champ se retrouve par son `id` ou son nom
   (`aria-label`), jamais par sa position ; deux homonymes, et on ne rend rien. */

/* l'appui en cours : de `pointerdown`/`mousedown` à son relâché */
let pression = false;
/* le repeint retenu pendant l'appui — rejoué à la fin du clic — ou `null` */
let retenu = null;
/* les demandes de repeint, comptées : c'est ce qui dit si l'enregistrement d'un champ a déjà repeint */
let demandes = 0;
const ecoutes = new WeakSet();

/* ⭐ Les champs où l'on TAPE un texte — ⛔ pas une case, pas un sélecteur : eux s'écrivent au choix, pas au départ
   du focus. */
const TYPES_DE_TEXTE = new Set(["text", "search", "email", "tel", "url", "password", "number"]);

function estUnChampDeTexte(n) {
  if (!n || typeof n.tagName !== "string") return false;
  const tag = n.tagName.toLowerCase();
  if (tag === "textarea") return true;
  return tag === "input" && TYPES_DE_TEXTE.has(String(n.type || "text").toLowerCase());
}

/* ⭐ L'ÉCOUTE SE POSE AU PREMIER REPEINT — le démarrage en fait un avant tout appui —, une fois par document,
   en CAPTURE : elle entend l'appui avant qu'un écouteur de l'écran ne l'arrête. */
function ecouter(doc) {
  if (!doc || typeof doc.addEventListener !== "function" || ecoutes.has(doc)) return;
  ecoutes.add(doc);
  const debut = (e) => {
    /* ⛔ un sélecteur ouvre sa liste hors de la page, qui n'en reçoit pas toujours le relâché */
    const t = e && e.target;
    if (t && typeof t.closest === "function" && t.closest("select")) return;
    pression = true;
  };
  const fin = () => {
    if (!pression) return;
    pression = false;
    /* ⭐ APRÈS la tâche du relâché : `mouseup` et `click` y sont livrés ensemble — le repeint passe après le clic */
    setTimeout(relacher, 0);
  };
  for (const t of ["pointerdown", "mousedown"]) doc.addEventListener(t, debut, true);
  for (const t of ["pointerup", "pointercancel", "mouseup", "touchend", "touchcancel"]) doc.addEventListener(t, fin, true);
  /* un relâché manqué (hors de la fenêtre) : un pointeur qui bouge sans bouton n'appuie plus */
  doc.addEventListener("pointermove", (e) => { if (pression && e && e.buttons === 0) fin(); }, true);
  const vue = doc.defaultView;
  if (vue && typeof vue.addEventListener === "function") vue.addEventListener("blur", fin);
}

function relacher() {
  if (pression || !retenu) return;
  const repeindre = retenu;
  retenu = null;
  repeindre();
}

const RIEN = () => {};

/** À la PREMIÈRE ligne de `refresh()`. Rend `null` quand ce repeint ne doit pas se faire maintenant : un appui
 *  est en cours (le repeint est RETENU, et rejoué à la fin du clic), ou le champ actif vient de s'enregistrer en
 *  repeignant lui-même. Sinon, rend la fonction à appeler à la DERNIÈRE ligne : elle rend au champ repeint le
 *  texte qu'il n'avait nulle part où écrire. */
export function avantLeRepeint(repeindre, doc = globalThis.document) {
  ecouter(doc);
  demandes += 1;
  if (pression) { retenu = repeindre; return null; }
  retenu = null;
  const champ = doc ? doc.activeElement : null;
  if (!estUnChampDeTexte(champ)) return RIEN;
  const identite = identiteDuChamp(champ);
  const texte = champ.value;
  const avant = demandes;
  if (typeof champ.blur === "function") champ.blur();
  /* ⭐ son enregistrement a déjà repeint — avec le texte : ce repeint-ci n'a plus rien à faire */
  if (demandes !== avant) return null;
  return () => rendreLeTexte(doc, identite, texte);
}

/** Ce qu'est un champ, d'un repeint à l'autre : son `id`, sinon son nom (`aria-label`). ⛔ Jamais sa place. */
function identiteDuChamp(champ) {
  if (champ.id) return { id: champ.id };
  const nom = typeof champ.getAttribute === "function" ? champ.getAttribute("aria-label") : null;
  return nom ? { nom } : null;
}

function rendreLeTexte(doc, identite, texte) {
  if (!identite || !doc || typeof doc.querySelectorAll !== "function") return;
  const memes = [...doc.querySelectorAll("input"), ...doc.querySelectorAll("textarea")].filter((n) => estUnChampDeTexte(n)
    && (identite.id ? n.id === identite.id : n.getAttribute("aria-label") === identite.nom));
  if (memes.length !== 1) return;
  const champ = memes[0];
  if (champ.disabled || champ.value === texte) return;
  champ.value = texte;
  /* ⭐ un champ qui suit la frappe (la recherche) relit son texte, comme si on venait de le taper */
  if (typeof champ.dispatchEvent === "function" && typeof Event === "function") {
    champ.dispatchEvent(new Event("input", { bubbles: true }));
  }
}
