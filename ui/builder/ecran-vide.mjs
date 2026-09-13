/* ══ LE MOT DE L'ÉCRAN QUI S'EST DESSINÉ VIDE — lot 201 ═════════════════════
   §5 du canon — LE REFUS QUI NOMME, appliqué à un cas que personne n'avait
   prévu : l'écran n'a PAS refusé de se dessiner (`ecran-mort.mjs` couvre ce
   refus-là, cause et sortie), il s'est dessiné, et il n'y avait RIEN dedans.

   📏 LE DÉFAUT, MESURÉ AU BANC LE 2026-09-13 (v624, Playwright, 512 × 764,
   le chemin d'Eric du même jour — *« next ne m'amène pas sur species ?
   pourquoi ? »*) : `Build a character` → le popup « SRD or Fate's Hand? »
   fermé d'un clic DEHORS (III.4, le geste légal d'alors — et le clic sur son
   propre bouton EN ÉTAIT UN, le popup ne prenant pas le pointeur) → `Done`
   sur Identity → `Next` → Species rend
   `<section class="decision-card"><section class="catalogue-step">` avec
   pour seul enfant le `?`. Belt en place, fond en place, carte sans un mot.
   AUCUNE erreur en console. La cause : `remettreAZero` vide `state.decisions`
   et seule la réponse au popup appelait `rebuild()` — sans réponse, pas de
   carnet, et `renderCatalogueCards` rend `null` sur zéro option, en silence.
   La cause est fermée par DEUX verrous dans `shell.mjs` et `popup.mjs`
   (`repartirAZero` dérive le personnage neuf lui-même ; la question exige
   une réponse). CE MODULE EST L'AUTRE MOITIÉ : la prochaine cause, celle
   qu'on ne connaît pas encore, ne pourra plus être MUETTE.

   ⭐ UN SEUL ÉCRIVAIN, AU POINT OÙ LA CARTE EST POSÉE. `shell.mjs` appelle
   `nommerLeVide` dans `poserLaSortie`, que traversent les deux rendus (l'actif
   par `refresh`, le passif par `rendreLEcranDe`). ⛔ Pas un `if` par écran :
   un écran ajouté demain est couvert sans qu'on y pense — c'est la leçon des
   organes que N écrans fabriquent (le livre manquait 5 fois sur 12).

   🔴 POURQUOI UN MODULE, ET PAS DIX LIGNES DANS `shell.mjs` : la même raison
   que `ecran-mort.mjs` — la coquille n'a aucun harnais de rendu
   (`tests/shell-wiring.test.mjs`, lot 50). Ici, un test FABRIQUE une carte
   vide dans le stub et LIT le mot rendu ; et une carte pleine, pour prouver
   qu'on n'écrit rien dessus. Le garde peut accuser.

   ⚠️ LES TEXTES SONT DES BROUILLONS, en anglais (arbitrage d'Eric, tête de
   `shell.mjs`), en attente de sa relecture. Ce qu'ils doivent PORTER ne
   changera pas : ce que la coquille SAIT (l'étape, le rang, le moteur, le
   document, la pile, la dérivation, le carnet) et la SORTIE (« press Menu »
   — le geste qui a ramené l'écran à Eric le 13/09).

   ⛔ CE MODULE NE RÉPARE RIEN, comme `ecran-mort.mjs` : il ne redérive pas,
   ne rassoit personne, n'ouvre aucun popup. Il écrit dans la carte ce qu'il
   sait, pour que le joueur ait un mot à donner et que le prochain lot ait
   une mesure au lieu d'une capture muette. */

/** CE QUI EST VISIBLE DANS UNE CARTE — du texte, ou une image.
 *  ⛔ Les BORNES sont exclues par leurs NŒUDS, pas par un nom de classe :
 *  le `?` et le livre sont posés par la coquille (`poserLesBornes`,
 *  shell.mjs) sur presque toutes les cartes, y compris une carte vide — c'est
 *  exactement ce que la capture du 13/09 montrait (*« seul le `?` au pied »*).
 *  La coquille SAIT lesquels sont des bornes (`BORNES`) ; ce module n'en
 *  recopie pas la liste, il reçoit les nœuds à ignorer.
 *  ⚠️ Un nœud `hidden` n'est pas visible : il ne compte pas. */
const CONTENU_SANS_TEXTE = new Set(["IMG", "CANVAS", "SVG", "VIDEO"]);

function visible(noeud, bornes) {
  if (!noeud || bornes.has(noeud)) return false;
  if (noeud.nodeType === 3) return String(noeud.textContent || "").trim() !== "";
  if (noeud.nodeType !== 1 || noeud.hidden === true) return false;
  if (CONTENU_SANS_TEXTE.has(String(noeud.tagName || "").toUpperCase())) return true;
  for (const enfant of noeud.childNodes || []) if (visible(enfant, bornes)) return true;
  return false;
}

/** Une carte est VIDE quand rien de visible n'y vit hors des bornes.
 *  @param {Element} contenu la carte rendue par l'étape
 *  @param {Iterable<Node>} [bornes] les nœuds à ignorer (le `?`, le livre) */
export function estVide(contenu, bornes = []) {
  if (!contenu) return true;
  const ignores = new Set(bornes);
  for (const enfant of contenu.childNodes || []) if (visible(enfant, ignores)) return false;
  return true;
}

/** LES LIGNES DU MOT — une par fait, parce que `paintPopup` et la carte font
 *  un paragraphe de chaque ligne et qu'un fait par ligne se recopie sans se
 *  tromper. La TÊTE dit que c'est une faute, pas un choix ; la SORTIE ferme.
 *  @param {object} faits ce que la coquille sait — voir `faitsDeLEcran` (shell.mjs)
 *  @returns {string[]} */
export function lignesDeLEcranVide(faits) {
  const f = faits || {};
  const pluriel = (n, mot) => `${n} ${mot}${n === 1 ? "" : "s"}`;
  const lignes = [
    "This screen came up empty. That is a fault of the builder, not a choice you made — here is what it knows.",
    `Where: step ${Number.isInteger(f.rang) ? f.rang : "?"} · ${f.etape || "unknown step"}, tier ${f.palier || 1}`
      + (f.item ? `, item ${f.item}` : "") + (f.lore ? ", lore open" : "") + ".",
    `Engine: ${f.moteur || "unknown"}.`,
    `Character: ${f.document ? "present" : "none"}.`
  ];
  if (f.document) {
    lignes.push(`Rules: ${f.pile || "an unnamed mix of layers"} (${pluriel(f.couches || 0, "layer")} declared).`);
    lignes.push(f.derivation ? `Sheet: cannot be derived — ${f.derivation}` : "Sheet: derived.");
    lignes.push(`Notebook: ${pluriel(f.plans || 0, "decision plan")}.`);
  }
  lignes.push("Press Menu to get back. If it happens again, these lines are what to report.");
  return lignes;
}

/** LE MOT EN UN SEUL TEXTE — pour qui le lit d'un bloc (un test, un rapport). */
export function motDeLEcranVide(faits) {
  return lignesDeLEcranVide(faits).join("\n");
}

/** ÉCRIT LE MOT DANS UNE CARTE VIDE, ET RIEN DANS UNE CARTE PLEINE.
 *  `p.placeholder` : la même classe que l'écran mort et « Loading the
 *  engine… » — une phrase de description, pas un organe neuf (⛔ pas de
 *  style en ligne, pas de règle CSS de plus). `data-ecran-vide` sur la carte
 *  dit au banc et aux gardes ce qui s'est passé, par la DONNÉE.
 *  @returns {boolean} `true` quand le mot a été écrit */
export function nommerLeVide(contenu, faits, { bornes = [] } = {}) {
  if (!contenu || typeof contenu.append !== "function") return false;
  if (!estVide(contenu, bornes)) return false;
  contenu.dataset.ecranVide = "true";
  for (const ligne of lignesDeLEcranVide(faits)) {
    const p = document.createElement("p");
    p.className = "placeholder";
    p.append(document.createTextNode(ligne));
    contenu.append(p);
  }
  return true;
}
