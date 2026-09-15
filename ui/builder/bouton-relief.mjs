/* ══ LA GÉOMÉTRIE DU BOUTON À RELIEF — lot 209, 2026-09-15 ════════════════
   ⛔ RIEN N'APPELLE CE MODULE AUJOURD'HUI, ET C'EST DÉLIBÉRÉ. Le dessin
   d'Eric est arrivé ; son INTÉGRATION ne l'est pas — elle demande deux
   arbitrages qui lui appartiennent (voir plus bas). Poser la géométrie sans
   la distribuer est exactement ce qu'on peut faire sans lui : c'est le
   précédent de `--bouton-moyen`, cote arrêtée et portée par aucun bouton.
   ⭐ Aucun pixel ne bouge tant que personne n'appelle `svg()`.

   🔴 POURQUOI UN GÉNÉRATEUR ET PAS LES DEUX FICHIERS LIVRÉS. La recette
   l'interdit deux fois : « ne pas agrandir un SVG de 77 pour obtenir celui de
   105 », « aucune multiplication des anciens sommets par W/77 » — étirer
   épaissirait les coupes et les biseaux. Or le site pose `min-width`, pas
   `width` : un bouton grandit avec son mot. Relevé le 15/09 dans les neuf
   modules : HUIT libellés dépassent même la place utile de 105 —
   `Turn tutorials off`, `Build a character`, `My characters`, `Open a file…`,
   `I understand`, `Expert view`, `Export JSON`, `Export HTML`. Deux largeurs
   figées ne peuvent donc pas habiller ce site ; il faut recalculer.

   ⭐ L'ÉPREUVE VIT DANS `tests/bouton-geometrie.test.mjs` : ce module doit
   reproduire les deux fichiers d'origine À L'OCTET PRÈS (3 542 et 3 574 o),
   rangés en témoins sous `tests/fixtures/`. S'il s'en écarte d'un millième,
   c'est LUI qui est faux — les témoins font foi.

   ⚠️ CE QUI RESTE À TRANCHER PAR ERIC, et que ce module ne préjuge pas :
     · le SVG doit être INLINÉ pour que son état soit pilotable — or l'habit
       actuel vit dans `::before` / `::after`, et un pseudo-élément ne peut
       pas porter de balisage. Il n'existe pas non plus de helper `bouton()`
       partagé : neuf copies locales, signatures divergentes ;
     · `--bouton-coupe` passerait de 10 à 8 et `--bouton-biseau-epaisseur` de
       1,5 à 2 — deux COTES, et NORMES `bouton-pans-coupes-nus` écrit que la
       coupe reste 10.
   ⭐ Une bonne nouvelle, elle : ce dessin ne porte AUCUN `filter`. Le piège du
   `clip-path` qui rogne l'ombre (mesuré, luminance 255) ne s'applique plus —
   le bouton lui-même peut porter une découpe, ce qui rend un troisième
   calque disponible là où il n'y en avait que deux. */

export const C = 8;        // coupe, horizontale et verticale
export const H = 44;       // hauteur extérieure — la boîte et la cible tactile
export const HAUT = 40;    // hauteur du DESSUS : le talon occupe les 4 derniers
export const B = 2;        // biseau, perpendiculaire au bord
export const TALON = 4;    // talon au repos
export const COURSE = 2;   // descente du dessus à l'appui

const R2 = Math.SQRT2 - 1; // 0.4142135623730951 — conservé avant arrondi

/* Les huit sommets, pour un retrait parallèle `i` et un déplacement `y`.
   ⛔ `k` n'est pas `c + i` : sur une diagonale, un retrait parallèle décale le
   sommet de i × (√2 − 1) — c'est ce qui garde l'épaisseur constante dans les
   coins, là où une bordure la perdrait. */
export function P(W, i, y = 0) {
  const k = C + i * R2;
  return [
    [k,       i + y],
    [W - k,   i + y],
    [W - i,   k + y],
    [W - i,   HAUT - k + y],
    [W - k,   HAUT - i + y],
    [k,       HAUT - i + y],
    [i,       HAUT - k + y],
    [i,       k + y]
  ];
}

const n = (v) => +v.toFixed(3);                       // millième, zéros retirés
const pts = (a) => a.map((p) => n(p[0]) + "," + n(p[1])).join(" ");
const milieu = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/* Le chemin du liseré CSS : deux contours, règle evenodd — un anneau. */
export function anneau(W, iExt = 2, iInt = 3.4) {
  const c = (a) => "M" + a.map((p) => n(p[0]) + "," + n(p[1])).join("L") + "Z";
  return c(P(W, iExt)) + " " + c(P(W, iInt));
}

/* Les seize couleurs des facettes — stop 0 au bord extérieur, stop 1 au bord
   intérieur. ⭐ Les mêmes de jour comme de nuit : ce sont des arêtes de
   lumière, pas des teintes de thème. */
const FACETTES = [
  ["#c0b6a4", "#746d61"], ["#9c9383", "#5b554b"], ["#36332d", "#625d53"], ["#282620", "#484238"],
  ["#25231e", "#474137"], ["#363128", "#62594a"], ["#8c826f", "#4c473d"], ["#b8ae9b", "#70695d"]
];

export function svg(W) {
  const O = P(W, 0), I = P(W, B), Bas = P(W, 0, TALON);
  const d = [];

  for (let j = 0; j < 8; j++) {
    const a = milieu(O[j], O[(j + 1) % 8]);
    const b = milieu(I[j], I[(j + 1) % 8]);
    d.push(`    <linearGradient id="f${j}" gradientUnits="userSpaceOnUse" x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}">
      <stop stop-color="${FACETTES[j][0]}"/><stop offset="1" stop-color="${FACETTES[j][1]}"/>
    </linearGradient>`);
  }
  d.push(`    <linearGradient id="face" x2="0" y2="1">
      <stop stop-color="#554f46"/><stop offset=".35" stop-color="#454037"/><stop offset="1" stop-color="#35312b"/>
    </linearGradient>`);
  d.push(`    <linearGradient id="side" gradientUnits="userSpaceOnUse" x1="0" y1="${HAUT - C}" x2="0" y2="${H}">
      <stop stop-color="#36332d"/><stop offset="1" stop-color="#1d1b18"/>
    </linearGradient>`);

  /* le dessus : l'octogone plein SOUS les facettes (il bouche les jonctions
     que l'anticrénelage laisserait ouvertes), les huit facettes, puis la face */
  const cap = [`      <polygon points="${pts(O)}" fill="#454037"/>`];
  for (let j = 0; j < 8; j++) {
    cap.push(`      <polygon points="${pts([O[j], O[(j + 1) % 8], I[(j + 1) % 8], I[j]])}" fill="url(#f${j})"/>`);
  }
  cap.push(`      <polygon points="${pts(I)}" fill="url(#face)"/>`);

  /* les flancs de j=2 à 6 : les deux verticaux ont une projection nulle, les
     deux coins bas et la façade montrent le talon */
  const flancs = (dep) => {
    const T = P(W, 0, dep);
    const ch = [];
    for (let j = 2; j <= 6; j++) {
      const q = [T[j], T[(j + 1) % 8], Bas[(j + 1) % 8], Bas[j]];
      ch.push("M" + q.map((p) => n(p[0]) + "," + n(p[1])).join(" L") + "Z");
    }
    return ch.join(" ");
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="fh-relief" data-state="repos">
  <style>svg.fh-relief>.fh-pressed{display:none}svg.fh-relief[data-state="presse"]>.fh-rest{display:none}svg.fh-relief[data-state="presse"]>.fh-pressed{display:inline}</style>
  <defs>
${d.join("\n")}
    <g id="cap">
${cap.join("\n")}
    </g>
  </defs>
  <polygon points="${pts(Bas)}" fill="#161512"/>
  <g class="fh-rest">
    <path d="${flancs(0)}" fill="url(#side)"/>
    <use href="#cap" y="0"/>
  </g>
  <g class="fh-pressed">
    <path d="${flancs(COURSE)}" fill="url(#side)"/>
    <use href="#cap" y="${COURSE}"/>
  </g>
</svg>
`;
}

/* ══ LA VOIE SANS BALISAGE : `border-image`, le 9-zones ════════════════════
   🔴 LE PROBLÈME QU'ELLE RÉSOUT. Le dessin est livré en deux largeurs et la
   recette interdit de l'étirer ; or huit libellés du site dépassent 105, et
   les largeurs sont CONTINUES — elles suivent le mot, qui peut venir d'une
   donnée. Une image par largeur ne tient donc pas, et inliner un SVG
   demanderait de toucher les neuf fabriques : hors du lot 209.

   ⭐ `border-image` coupe l'image en NEUF zones : les quatre coins sont posés
   SANS DÉFORMATION, les quatre bords ne s'étirent que dans leur propre
   direction, et `fill` peint le centre. Une seule tuile sert donc toutes les
   largeurs, en CSS pur.

   📐 ET C'EST GÉOMÉTRIQUEMENT SAIN, parce que chaque bord est uniforme DANS
   LA DIRECTION OÙ IL S'ÉTIRE : le bord haut va de y=0 à y=2 (dégradé
   vertical, constant en x) · le bord droit de x=W à x=W−2 (horizontal,
   constant en y) · la face est verticale et constante en x. L'étirement ne
   peut rien déformer de visible. ⛔ Ce serait faux pour un dégradé oblique.

   📏 LE BAS VAUT 12, PAS 8, et c'est la seule cote qui ne se devine pas :
   le coin bas doit contenir la coupe DU DESSUS (qui finit à `HAUT`) ET le
   talon (qui court jusqu'à `H`) — soit `H − (HAUT − C)` = 44 − 32 = 12.

   ⚠️ NON MESURÉ AU NAVIGATEUR, et deux inconnues restent : la rastérisation
   d'un SVG sous `border-image-slice` (des coins flous en Retina si la
   découpe se fait à la taille intrinsèque), et `border-image` sur un
   pseudo-élément en `inset: 0`. ⛔ Tant que ce n'est pas mesuré, rien de
   ceci n'est branché dans `shell.css` — la règle de preuve du lot interdit
   d'affirmer un rendu qu'on n'a pas regardé. */

/* La tuile est la plus étroite largeur qui laisse un centre : 2×C de coins,
   plus 8. ⛔ Ne pas descendre sous 2×C + 1, les slices se recouvriraient. */
export const LARGEUR_TUILE = 2 * C + 8;

/* Les quatre découpes, en pixels de l'image source. */
export const SLICE = { haut: C, droite: C, bas: H - (HAUT - C), gauche: C };

/* Le SVG encodé pour un `url()` de feuille de style. ⛔ Pas de base64 : un
   SVG en clair reste lisible dans la feuille et compresse mieux. */
export function dataURI(W = LARGEUR_TUILE) {
  return "data:image/svg+xml," + encodeURIComponent(svg(W))
    .replace(/'/g, "%27").replace(/"/g, "%22");
}

/* Les déclarations `border-image`, prêtes à poser sur un pseudo-élément. */
export function borderImage(W = LARGEUR_TUILE) {
  const s = SLICE;
  return [
    `border-image-source: url("${dataURI(W)}")`,
    `border-image-slice: ${s.haut} ${s.droite} ${s.bas} ${s.gauche} fill`,
    `border-image-width: ${s.haut}px ${s.droite}px ${s.bas}px ${s.gauche}px`,
    "border-style: solid",
    "border-color: transparent"
  ];
}
