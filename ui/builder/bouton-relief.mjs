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
   `width` : un bouton grandit avec son mot quand son conteneur le permet.

   📏 MESURÉ LE 16/09 AU NAVIGATEUR, dans le builder servi, sous `.app` — donc
   sous `zoom: var(--echelle)`, échelle 1,3653, hauteur 44 partout. Témoins de
   contrôle d'abord, pour que la méthode se prouve elle-même : `Export HTML`
   dans un `.parcours-pied` rend **77,00** (le plancher tient, le mot déborde)
   et `Inheritance.bouton-moyen` rend **105,00** (le gabarit large tient).
   Puis les largeurs réelles hors gabarit :

       .review-porte       Expert view  105,85 · Export JSON 113,69
                           Export HTML  115,46
       .tuto-pied button   I understand 128,64 · Turn tutorials off 159,44

   ⭐ CINQ LARGEURS DISTINCTES ET NON RONDES, dont aucune n'est 77 ni 105 —
   `Expert view` rate même le gabarit large de 0,85. Deux SVG figés ne peuvent
   donc pas habiller ce site ; il faut recalculer.

   ⛔ ET CE QUE J'AVAIS ÉCRIT AVANT ÉTAIT FAUX, sur le même argument. J'avais
   listé « huit libellés », dont `Build a character` et `My characters` : ce
   sont des largeurs de TEXTE, relevées sans regarder quel organe les porte.
   Mesuré : ces deux-là sont des `.tdc-majeur` / `.tdc-liste`, **351 blg,
   pleine largeur, SANS octogone** — ils ne sont pas de la famille. La
   conclusion tenait, ses chiffres non. Un relevé qui ne dit pas quel organe
   porte le mot est du DÉCLARÉ pris pour du RENDU.

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
export const B = 2;        // biseau, perpendiculaire au bord
export const TALON = 4;    // talon au repos
export const COURSE = 2;   // descente du dessus à l'appui

/* 🔴 LA HAUTEUR EST UN PARAMÈTRE DEPUIS LE 16/09, ET C'EST TOUT L'ENJEU.
   Eric a séparé les deux cotes du bouton : le DESSIN fait 40, la CIBLE reste
   44 (`bouton-hauteur`, NORMES §6). Or les deux SVG d'origine sont dessinés à
   44 — ils sont la seule référence qui prouve que cette géométrie est juste.
   ⛔ LES AJUSTER À 40 AURAIT FAIT PASSER LE GARDE ET DÉTRUIT LA PREUVE : une
   référence qu'on retouche pour verdir un test n'est plus une référence.
   ⭐ D'où la forme : `H` reste **44 par défaut** — les témoins se reproduisent
   à l'octet, le critère d'épreuve est intact — et la PRODUCTION appelle
   `svg(W, 40)`. Un seul générateur, deux hauteurs, une seule preuve. */
export const H = 44;       // hauteur PAR DÉFAUT — celle des deux témoins d'origine
export const HAUT = H - TALON;  // 40 — le dessus ; le talon occupe le reste

/* La hauteur de DESSIN posée par la norme du 16/09. ⛔ Ce n'est pas `H` : la
   cible reste 44, c'est le dessin qui se retire de 2 en haut et 2 en bas. */
export const H_DESSIN = 40;

const R2 = Math.SQRT2 - 1; // 0.4142135623730951 — conservé avant arrondi

/* Les huit sommets, pour un retrait parallèle `i` et un déplacement `y`.
   ⛔ `k` n'est pas `c + i` : sur une diagonale, un retrait parallèle décale le
   sommet de i × (√2 − 1) — c'est ce qui garde l'épaisseur constante dans les
   coins, là où une bordure la perdrait. */
export function P(W, i, y = 0, haut = HAUT) {
  const k = C + i * R2;
  return [
    [k,       i + y],
    [W - k,   i + y],
    [W - i,   k + y],
    [W - i,   haut - k + y],
    [W - k,   haut - i + y],
    [k,       haut - i + y],
    [i,       haut - k + y],
    [i,       k + y]
  ];
}

const n = (v) => +v.toFixed(3);                       // millième, zéros retirés
const pts = (a) => a.map((p) => n(p[0]) + "," + n(p[1])).join(" ");
const milieu = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/* Le chemin du liseré en `path()` : deux contours, règle evenodd — un anneau.
   ⚠️ Il demande la largeur RENDUE, donc un calcul par bouton. Préférer
   `anneauCSS()` ci-dessous, qui n'en a pas besoin. */
export function anneau(W, iExt = 2, iInt = 3.4) {
  const c = (a) => "M" + a.map((p) => n(p[0]) + "," + n(p[1])).join("L") + "Z";
  return c(P(W, iExt)) + " " + c(P(W, iInt));
}

/* ══ LE LISERÉ SANS JAVASCRIPT — la forme à employer ══════════════════════
   🔴 JE PARTAIS ÉCRIRE QUE C'ÉTAIT IMPOSSIBLE. Le liseré est un ANNEAU : deux
   contours et une règle de remplissage. `clip-path: path()` sait le faire mais
   veut une chaîne figée — donc une valeur par largeur, donc du JS posé bouton
   par bouton, donc le lot de la fabrique. C'est ce que j'allais rapporter.

   ⭐ C'EST FAUX, ET LA MESURE L'A DIT. Un `polygon(evenodd, …)` UNIQUE qui fait
   le tour extérieur puis revient par l'intérieur creuse le trou tout seul —
   `evenodd` compte les croisements, il n'a pas besoin de deux chemins séparés.
   Et surtout : **tous les sommets s'écrivent en `calc(100% − Npx)`**, donc
   aucun ne dépend de la largeur rendue. Une seule règle sert toutes les cotes.
   📏 Éprouvé au navigateur sur les six boutons du pied : les anneaux posés en
   JS retirés, le rendu est identique.
   ⭐ Conséquence de périmètre : le lot 209 livre le design ENTIER sans écrire
   une ligne de balisage ni de JS.

   ⛔ LE SENS DU SECOND CONTOUR COMPTE. Il est parcouru à l'envers : c'est ce
   qui garantit le trou quel que soit le moteur, `evenodd` ou `nonzero`. */
export function anneauCSS(haut = H_DESSIN - TALON, iExt = 2, iInt = 3.4) {
  const contour = (i, sens) => {
    const k = n(C + i * R2), bas = n(haut - k), I = n(i), J = n(haut - i);
    const p = [
      [`${k}px`, `${I}px`], [`calc(100% - ${k}px)`, `${I}px`],
      [`calc(100% - ${I}px)`, `${k}px`], [`calc(100% - ${I}px)`, `${bas}px`],
      [`calc(100% - ${k}px)`, `${J}px`], [`${k}px`, `${J}px`],
      [`${I}px`, `${bas}px`], [`${I}px`, `${k}px`]
    ];
    return (sens < 0 ? p.slice().reverse() : p).map((a) => a[0] + " " + a[1]).join(", ");
  };
  return `polygon(evenodd, ${contour(iExt, 1)}, ${contour(iInt, -1)})`;
}

/* Les seize couleurs des facettes — stop 0 au bord extérieur, stop 1 au bord
   intérieur. ⭐ Les mêmes de jour comme de nuit : ce sont des arêtes de
   lumière, pas des teintes de thème. */
const FACETTES = [
  ["#c0b6a4", "#746d61"], ["#9c9383", "#5b554b"], ["#36332d", "#625d53"], ["#282620", "#484238"],
  ["#25231e", "#474137"], ["#363128", "#62594a"], ["#8c826f", "#4c473d"], ["#b8ae9b", "#70695d"]
];

export function svg(W, hTotal = H) {
  /* le dessus prend ce que le talon laisse : la boîte MOINS le talon. */
  const haut = hTotal - TALON;
  const O = P(W, 0, 0, haut), I = P(W, B, 0, haut), Bas = P(W, 0, TALON, haut);
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
  d.push(`    <linearGradient id="side" gradientUnits="userSpaceOnUse" x1="0" y1="${haut - C}" x2="0" y2="${hTotal}">
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
    const T = P(W, 0, dep, haut);
    const ch = [];
    for (let j = 2; j <= 6; j++) {
      const q = [T[j], T[(j + 1) % 8], Bas[(j + 1) % 8], Bas[j]];
      ch.push("M" + q.map((p) => n(p[0]) + "," + n(p[1])).join(" L") + "Z");
    }
    return ch.join(" ");
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${hTotal}" viewBox="0 0 ${W} ${hTotal}" class="fh-relief" data-state="repos">
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
   recette interdit de l'étirer ; or cinq largeurs mesurées du site tombent
   entre 105,85 et 159,44, et elles suivent le mot — qui peut venir d'une
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

   ✅ MESURÉ AU NAVIGATEUR LE 16/09, avec CETTE tuile — pas un témoin. La
   tuile a été reconstruite dans la page servie et contrôlée par sa longueur
   (3 534 o à 24, 3 542 à 77, 3 574 à 105 : les trois concordent), puis posée
   en `border-image` sous `.app` :
     · `border-image-slice` relu : `8 8 12 fill` — le navigateur normalise
       `8 8 12 8` en `8 8 12`, la gauche reprenant la droite ;
     · trois largeurs à la fois — 78,60 · 109,82 · 147,10 blg — hauteur 44
       partout, la MÊME tuile, sans déformation visible des coupes ;
     · à ×4, les coins restent FRANCS : le SVG est rastérisé à la taille
       rendue, pas à ses 24 px intrinsèques. L'inquiétude ne se matérialise pas.

   🔴 ET UNE LIMITE QUE LA MESURE A RÉVÉLÉE, elle n'était dans aucune note.
   En `border-image`, le document ne peut pas toucher le DOM interne du SVG :
   `data-state` est donc INACCESSIBLE, et seul le groupe `fh-rest` s'affiche.
     · le groupe `fh-pressed` est du POIDS MORT dans la tuile — 228 octets
       sur 3 534, transportés à chaque chargement pour rien ;
     · l'état pressé demandera une SECONDE tuile (le `cap` à y=2) et une
       permutation de `border-image-source`, pas une translation.
   ⭐ Ce n'est pas bloquant aujourd'hui : relevé le 15/09, la feuille ne porte
   AUCUN `:active` — l'état pressé n'est câblé nulle part. Mais qui le câblera
   doit savoir que la voie coûte une seconde image, et non un réglage.

   ⛔ RIEN N'EST ENCORE BRANCHÉ DANS `shell.css` : ce qui est prouvé, c'est que
   la voie TIENT. Poser l'habit sur les huit familles est le geste suivant, et
   il demande les deux arbitrages d'Eric encore ouverts (les trois candidates,
   le duplicata de l'Équipement). */

/* La tuile est la plus étroite largeur qui laisse un centre : 2×C de coins,
   plus 8. ⛔ Ne pas descendre sous 2×C + 1, les slices se recouvriraient. */
export const LARGEUR_TUILE = 2 * C + 8;

/* Les quatre découpes, en pixels de l'image source. */
/* ⭐ ET LE BAS NE DÉPEND PAS DE LA HAUTEUR — il vaut `TALON + C`, jamais `H`.
   `H − (HAUT − C)` se simplifie en `H − (H − TALON) + C` = `TALON + C` : la
   hauteur s'annule. Vérifié aux deux cotes : 12 à H = 44 comme à H = 40.
   ➡️ Une seule tuile, un seul jeu de slices, que le bouton fasse 44 ou 40. */
export const SLICE = { haut: C, droite: C, bas: TALON + C, gauche: C };

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
