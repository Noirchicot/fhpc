/* ══ LES TRAITS D'UNE ESPÈCE — UNE SEULE LECTURE, UNE SEULE PRÉSÉANCE ═══
 *
 *  Lot 147, 2026-09-03. Premier morceau de la ROUTE D.
 *
 *  ── POURQUOI CE FICHIER EXISTE ────────────────────────────────────────
 *
 *  Eric, 2026-09-03 : « FH en français un jour OUI ! », puis « maintenant ».
 *  La route D rend à une couche `srfh+` les règles Fate's Hand aujourd'hui
 *  écrites DANS des records `srd:` — ⛔ ce que le contrat des trois étages
 *  interdit (`ui/builder/SOCLE.md`). Pour qu'un trait `srfh+` puisse
 *  SUPPLANTER son homologue SRD au lieu de le réécrire sur place, il faut une
 *  préséance. Ce fichier est cette préséance, et il n'est QUE ça.
 *
 *  ── CE QUI MANQUAIT, MESURÉ LE 03/09 ──────────────────────────────────
 *
 *  Le canal FH existait déjà (`data[fh_traits]`, un champ de schéma, donc
 *  insensible à la langue) et trois sites le lisaient. ⚠️ Mais il savait
 *  AJOUTER un trait, pas en SUPPLANTER un : trois `[...fh, ...base]` écrits à
 *  la main, qui auraient rendu DEUX entrées de même id le jour où `srfh+`
 *  porterait un homologue. C'est le trou, et il n'est nulle part ailleurs.
 *
 *  ── ⛔ CE QUE CE FICHIER NE FAIT PAS, ET C'EST DÉLIBÉRÉ ────────────────
 *
 *  Il ne touche PAS à la politique de fusion. Cinq sites lisent les traits
 *  d'une espèce, et ils ne lisent pas la même chose :
 *
 *      src/build/derive.mjs           `data.traits` SEUL
 *      ui/builder/species-step.mjs    `data.traits` SEUL   (la carte, ~669)
 *      src/modules/fh/skill-pool.mjs  les deux
 *      src/modules/fh/destiny-stat.mjs  les deux
 *      ui/builder/species-step.mjs    les deux             (la fiche, `traitsDe`)
 *
 *  ⚠️ Conséquence mesurée : les trois traits FH (`splinter-of-anon`,
 *  `outlasting`, `twice-born`) N'ARRIVENT JAMAIS dans `resolved.traits[]` —
 *  leur effet s'applique, le trait n'apparaît pas sur la fiche. C'est un vrai
 *  défaut, il est NOMMÉ, et il attend une décision d'Eric (« Splinter of Anon
 *  doit-il figurer dans les traits de la fiche ? »). ⛔ Le corriger ici ferait
 *  porter à un lot d'architecture une correction de contenu visible : les deux
 *  se perdraient. Les deux sites qui lisent `data.traits` seul continuent donc
 *  de le lire seul.
 *
 *  ── L'ORDRE, ET POURQUOI IL NE BOUGE PAS ──────────────────────────────
 *
 *  Les trois sites qui fusionnaient le faisaient dans DEUX ordres contraires
 *  (`[...fh, ...base]` deux fois, `[...base, ...fh]` une fois). ⭐ Mesuré : ZÉRO
 *  collision d'id entre les deux tableaux (3 entrées FH en tout), donc l'ordre
 *  n'a jamais changé un seul `find(id)` — il ne jouait que sur l'AFFICHAGE.
 *  Un seul des trois affiche : `traitsDe`, en `base` d'abord. C'est donc cet
 *  ordre-là qui est retenu, et **rien ne bouge à l'écran**.
 */

/** Les traits d'un record d'espèce, fusionnés et ordonnés, la PRÉSÉANCE
 *  appliquée : à identité égale, le trait du canal FH supplante celui du SRD
 *  **en gardant la place de celui-ci**.
 *
 *  Garder la place n'est pas un détail de confort : c'est ce qui fait qu'une
 *  couche `srfh+` peut remplacer le texte d'un trait SRD sans que la fiche du
 *  joueur se réordonne sous ses yeux.
 *
 *  ⛔ Cette fonction ne juge pas, ne complète pas, n'invente pas : un trait
 *  sans `name` sort de la liste, et c'est le seul refus qu'elle porte.
 */
export function traitsDeLEspece(record) {
  const data = (record && record.data) || {};
  const base = Array.isArray(data.traits) ? data.traits : [];
  const fh = Array.isArray(data.fh_traits) ? data.fh_traits : [];

  /* Ce que le canal FH apporte, indexé par identité. */
  const parId = new Map();
  for (const trait of fh) if (trait && typeof trait.id === "string") parId.set(trait.id, trait);

  const sortie = [];
  const pris = new Set();
  for (const trait of base) {
    if (!trait) continue;
    const remplacant = typeof trait.id === "string" ? parId.get(trait.id) : undefined;
    if (remplacant) { sortie.push(remplacant); pris.add(trait.id); }   // ⭐ la place du SRD est gardée
    else sortie.push(trait);
  }
  /* Ce que FH AJOUTE — c'est le cas de tous les traits FH aujourd'hui, et ce
     sera le cas résiduel quand la route D sera faite. */
  for (const trait of fh) if (trait && !pris.has(trait.id)) sortie.push(trait);

  return sortie.filter((trait) => trait && typeof trait.name === "string");
}
