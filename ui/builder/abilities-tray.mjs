/* ══ LE PLATEAU DE DÉS D'ABILITIES — croquis B d'Eric, 2026-08-15 ═══════
   La dalle MAJEURE de l'écran Abilities : trois dés 3D, quatre boutons et les
   dix résultats numérotés dont quatre barrés.

   ⌨️ LE TITRE ET LES QUATRE LIBELLÉS SONT D'ERIC (2026-08-15, après avoir vu
   l'écran sur son iPhone SE) : titre **`Roll Options`, centré**, et les
   boutons **centrés** — `3d6` · `10x3D6` · `Flash` · `Reset`.
   ⚠️ Sa liste est POSTÉRIEURE aux précédentes (`CLEAR` du croquis B, puis
   `roll 3d6`/`roll 10 x 3d6`/`flash roll`/`reset`) : c'est elle qui vaut.
   📌 Il écrit `3d6` en minuscule et `10x3D6` en majuscule ; on recopie ses
   chaînes telles quelles plutôt que d'uniformiser — un libellé est à lui.

   ══ 📏 LA LARGEUR, ET LES DEUX FAUTES DE MESURE QU'ELLE A COÛTÉES ═══════

   ⛔ **LA LARGEUR UTILE N'EST PAS 312, ELLE EST 294.** Mesurée dans la page,
   pas déduite du gabarit : `.tray` fait 310 de large à 360 de fenêtre, moins
   son rembourrage de 8×2 → **294**.

   ⛔ **ET UN BOUTON COÛTE SA BORDURE** : 1 px de chaque côté, soit +8 px sur
   les quatre. Oubliés dans le premier calcul.

   Les deux ensemble ont produit un débordement VISIBLE sur l'iPhone SE
   d'Eric — `Reset` coupé au bord droit :

     anciens libellés · T3 : 216,4 (texte) + 64 (rembourrage) + 12 (gouttières)
                             + 8 (bordures) = 300,4  sur 294  →  ❌ déborde de 6,4
     libellés d'Eric  · T3 : 146   + 64 + 12 + 8      = 230    sur 294  →  ✅ 64 de reste

   📌 LA FORME DE LA FAUTE, ET C'EST LA TROISIÈME DE LA SÉANCE : avoir pris le
   nombre THÉORIQUE du gabarit (312) pour la mesure, et oublié un terme
   (les bordures). Le gabarit dit lui-même que ses largeurs sont mesurées « au
   measureText, jamais estimées » — mais la boîte qui les reçoit, elle, n'avait
   jamais été mesurée.
   ⭐ Le remède tenu ici : les 64 px de reste laissent les boutons CENTRÉS à
   leur largeur naturelle, sans jamais s'étirer ni se comprimre.

   ⚠️ CORRECTION D'UNE MESURE FAUSSE, plus tôt le même jour. Cet en-tête
   annonçait `roll 10 x 3d6` à **93 px en T2** et concluait « T3 ne passe dans
   AUCUNE combinaison », en assumant un écart au gabarit. Repris au
   `measureText` : T2 → 69,6 · T3 → 79,3 · T4 → 88,8. **Le 93 correspond à du
   16 px** — la mesure avait été prise au mauvais barreau, et une exception
   documentée et argumentée s'est construite dessus.

   ⭐ Les 44 px de cible tactile restent intacts en hauteur.

   ══ CE QUI A DÉCIDÉ DE LA FORME ════════════════════════════════════════

   🔴 LE JOUEUR VOIT LE PROCESS — Eric, 2026-08-15 : *« il doit voir le
   process, je veux qu'il voie »*. Le plateau tire les jets un par un et les
   révèle à mesure ; la règle du lot ne se prononce qu'au dernier.

   ⚠️ **LA MOITIÉ DE CET EN-TÊTE A ÉTÉ RÉÉCRITE LE 2026-08-16 (lot 80, §3).**
   Il décrivait la RELANCE : « si aucun des dix n'atteint 15, il le DIT,
   balaie, et recommence », et il mesurait sa fréquence — `P(3d6 ≥ 15) =
   20/216`, donc un lot de dix échouait avec `0,907¹⁰ ≈ 38 %`, soit ~25 s de
   théâtre à jeter par échec à la cadence de 2 500 ms. **C'est cette mesure
   qui a tué la règle** : Eric l'a remplacée par deux planchers (un 14
   garanti en haut, un 8 dû en bas) qui ne relancent JAMAIS.
   ⛔ Il ne reste donc plus rien à annoncer en cours de salve : la mention de
   relance, son nœud et ses deux écrivains sont partis avec la règle. Ce qui
   SURVIT intact, c'est le motif — le joueur regarde tomber.

   ⛔ ON N'UTILISE TOUJOURS PAS `rollTen` : elle tire tous les jets D'UN
   COUP, et c'est l'objection d'Eric : *« ça remet en question le hasard,
   même s'il existe et que la temporalité est différée »*. `rollAbilityBatch`
   ne sert qu'au `FLASH`, là où personne ne regarde tomber.

   ══ ⭐ UN SEUL PLATEAU, DEUX MÉCANIQUES (lot 80, §4.2) ═══════════════════

   Le plateau ne connaît plus « dix jets de trois dés » : il reçoit une
   MÉCANIQUE (`ROLLING_METHODS`, dice.mjs) et lui demande combien de dés,
   combien de jets, comment jeter et comment clore. `FH 3D6` et `4D6` sont
   deux entrées de ce tableau, pas deux organes.
   🔴 CE QUE ÇA REMPLACE : `4d6` avait son propre rendu (`renderRollBatch`,
   des pastilles sans dés 3D) parce que le plateau ne savait faire que du
   3d6×10. Deux formes du même geste — la faute que le §1 du mandat nomme
   (`renderChoixGlisses` vs `renderSlotQcm`) et qui se payait déjà ici.

   ⭐ ET IL A RAISON, PAS SUR LES PROBABILITÉS MAIS SUR LA CONFIANCE. Un
   résultat tiré d'avance et un tiré en direct ont la même distribution ; le
   joueur ne peut pas les distinguer. Mais un dé qui roule doit DÉCIDER, pas
   rejouer une décision déjà prise — sinon l'animation est une
   reconstitution.

   🔴 CHAQUE JET EST DONC TIRÉ À L'INSTANT OÙ SES DÉS QUITTENT LA MAIN
   (`mecanique.jeter`, juste avant `poserLesDes`). Rien n'est décidé d'avance.
   ⛔ Et la règle tient : elle porte sur le LOT (quels jets sont gardés, quels
   planchers s'appliquent), jamais sur le moment où les jets naissent. C'est
   pour ça que `finir` ne peut se prononcer qu'au dernier — et jamais au fil
   de l'eau.

   🔴 LE PLATEAU NE PASSE JAMAIS PAR `refresh()`. Un redessin remplace tout
   le contenu de la scène (`swapContent`) : les trois canvas WebGL mourraient
   à chaque jet, en pleine animation. La séquence de révélation écrit donc
   dans des nœuds qui existent déjà — c'est la troisième règle du socle, la
   même que celle qui interdit au scrollspy de redessiner.

   🔴 LES BOUTONS SONT SUR LEUR PROPRE RANGÉE (Eric, choix A du 2026-08-15).
   Mesuré : la colonne `ROLL`/`ROLL 10` fait 80 px et `CLEAR` 70, sur 312
   utiles à 360 — les encadrer laisserait 146 px aux dés, soit des dés de
   46 px. Aucune taille acceptable ne tient tant qu'ils bordent le plateau.

   ⭐ `settleSizePx` EST CE QUI REND `ROLL 10` POSSIBLE : à la pose, chaque dé
   se fige en image et LIBÈRE son contexte WebGL. Le navigateur en plafonne
   ~16 ; sans ça, dix jets de trois dés épuisent la réserve et le plateau
   cesse de rendre SANS erreur. Vérifié au banc : après trente dés, zéro
   contexte vivant. */

import { mount, createDieHost, rollDurationMs } from "./dice3d.mjs?v=583";
import { mecaniqueDeJet, rollAbilityBatch } from "./dice.mjs?v=583";
import { swapContent } from "./socle.mjs?v=583";

/* Les réglages d'Eric, mesurés sur son iPhone SE le 2026-08-15.
   ⛔ Pas de valeur en dur ailleurs : c'est ici ou nulle part. */
export const REGLAGES = {
  /* ⚖️ `tailleBureau` (82) A ÉTÉ RETIRÉE avec le seuil qui la choisissait —
     30/08 au soir. UNE cote de dé, désormais, et c'est l'échelle qui la
     fait grandir. Voir `tailleDeDe` plus bas pour la raison complète. */
  /* 📐 56, PLUS 72 — Eric, 2026-09-05 : *« réduis la taille des dés pour gagner de
     l'espace »*. Le tapis vert qui les porte (ratio réel 3,14) ne peut pas tenir
     16 blg de bord dans les deux sens à 72 ; à 56, trois dés et leurs 16 font
     200 de large, et le tapis 276 × 88 les loge avec 16 au-dessus et en dessous. */
  taille: 56,
  /* 🔴 QUATRE DÉS NE TIENNENT PAS À LA COTE DE TROIS, et c'est de
     l'arithmétique, pas un goût — même famille que l'écart de 4 des îlots FS.
     La largeur utile du plateau est **294** (mesurée en tête de ce fichier,
     jamais le 312 théorique du gabarit) : quatre dés de 72 plus trois écarts
     de 4 demandent **300**. Il déborderait de 6 px sur l'iPhone SE d'Eric —
     exactement la faute que `Reset` coupé au bord droit a déjà coûtée.
     ⭐ (294 − 3×4) ÷ 4 = 70,5 → **70**,  */
  taille4: 56,
  /* 16, plus 4 — *« espacés de 16 blg les uns des autres »* (Eric, 05/09). */
  ecart: 16,
  pauseMs: 2500,   // « pause 2500 bien » — il a essayé 2000 et a préféré plus lent
  /* ⚡ FLASH ROLL — Eric, 2026-08-15 : « on voit le résultat et c'est tout,
     on ne voit pas le process et les erreurs ».
     ⚠️ CORRECTION D'UNE SUR-LECTURE DE L'ARCHITECTE : j'avais lu « flash »
     comme « vite mais visible », et argumenté que cacher les jets
     contredirait son « je veux qu'il voie ». Faux — les deux coexistent : il
     VEUT voir, et il veut AUSSI pouvoir ne pas voir. Ce sont deux modes, pas
     deux principes qui s'excluent. Le joueur choisit s'il regarde. */
};

function tailleDeDe(nbDes) {
  /* 🧊 LE TROISIÈME SEUIL DE LARGEUR EST MORT — 2026-08-30 au soir.
     Il valait `matchMedia("(min-width: 768px)")` et choisissait une COTE de dé
     (72 au doigt, 82 au bureau). C'est le jumeau EXACT du `@media (min-width:
     768px)` de shell.css, supprimé le matin même pour la raison d'Eric : une
     cote conditionnée à la largeur CHANGE UN RAPPORT, et la loi du zoom
     l'interdit. Celui-ci a survécu parce qu'il vivait en JS, où les gardes des
     seuils ne balayaient pas — c'est réparé aussi (garde 5 / 5 bis).
     ⛔ Et il mentait doublement sous zoom : `matchMedia` interroge la fenêtre
     BRUTE, jamais la fenêtre en blg. À 1024 au cran 2 il annonçait « bureau »
     pour une fenêtre effective de 512.
     ⭐ Rien n'est perdu : 72 blg au cran 2 rendent 144 pixels, bien au-delà
     des 82 que le bureau obtenait. Le dé grandit par l'ÉCHELLE désormais. */
  return nbDes > 3 ? REGLAGES.taille4 : REGLAGES.taille;
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (children) for (const child of children) node.append(child);
  return node;
}
const texte = (s) => document.createTextNode(s);

/** Les trois dés d'un jet, posés dans l'hôte.
 *  `anime: false` → ils prennent la POSE du résultat sans tomber. C'est ce
 *  qui fait qu'un redessin (après une assignation) ne rejoue pas dix
 *  animations : seul un vrai `ROLL` anime. */
function poserLesDes(hote, des, anime) {
  const taille = tailleDeDe(des.length);
  /* ⛔ PAS DE `replaceChildren` ICI — un garde du socle l'a attrapé, et il a
     raison : `swapContent` est le SEUL endroit du dépôt qui remplace le
     contenu d'un nœud (une brique, un écrivain, un garde). Le plateau n'a
     aucune raison d'être une exception : la brique fait exactement ce qu'il
     faut, et il hérite de son comportement au lieu d'en réinventer un. */
  swapContent(hote, des.map((valeur, i) => createDieHost({
    sides: 6, result: valeur, sizePx: taille, index: i,
    animate: anime, settleSizePx: taille
  })));
  mount(hote);
}

/** Une case de résultat, dans la rangée des dix. Elle existe DÈS LE DÉPART,
 *  vide : c'est ce qui permet à la révélation d'écrire dedans sans
 *  reconstruire la rangée (et donc sans toucher aux canvas voisins). */
/* 🔴 REDESSINÉE LE 2026-09-05 SUR LA DICTÉE D'ERIC : *« texte blanc dans carrés
   rouges — roll 1 (en T1) … roll 10 »*, puis *« c'est un trait qui délimite une
   zone »*. Vide, la case est un carré au TRAIT rouge, sans fond, qui dit `roll N`.
   Pleine, elle porte un petit dé (instantané, sans WebGL) et le détail du jet.
   📏 `roll 10` mesure 27,6 en T1 Inter — il tient sur UNE ligne dans un carré
   de 30 (mesuré au `measureText` de la page, pas estimé). */
function caseDeResultat(numero) {
  const box = el("li", "tray-case");
  box.dataset.numero = String(numero);
  box.dataset.etat = "vide";
  box.append(etiquetteDeCase(numero));
  return box;
}
/** L'ÉTIQUETTE d'une case vide — `roll N` dans son carré au trait. ⛔ Elle n'est
 *  jamais CACHÉE sous le dé : la case ÉCHANGE son contenu (étiquette ↔ dé), parce
 *  que la feuille n'a droit à aucun `display: none` (défaut n° 3) et qu'un nœud
 *  qu'on garde « au cas où » est un nœud qu'on finit par oublier. */
function etiquetteDeCase(numero) {
  return el("span", "tray-case-num", [texte(`roll ${numero}`)]);
}

/** LE DÉ-SOCLE — un instantané du moteur (`result: 6`, la pose honnête) avec le
 *  score écrit PAR-DESSUS. Levé d'`abilities-step.mjs` le 05/09 : le plateau en
 *  a besoin pour ses dix résultats, le podium pour ses six gardés — une brique,
 *  un écrivain. ⛔ Le moteur refuse d'écrire 15 sur un d6 et il a raison : c'est
 *  l'écran qui écrit le score, l'incrustation du moteur se tait (`.valeur`).
 *  `material` dit la COULEUR du socle : `white` gardé, `slate` écarté, `azure`
 *  monté à 14 ; le plancher bas (orange) se teinte en feuille — `dice3d.mjs`
 *  est une copie verbatim de `fh-phb`, on n'y ajoute pas un matériau ici. */
export function poserUnDe(hote, valeur, taille, index, material = "ivory") {
  const porte = el("span", "porte-de");
  porte.append(createDieHost({
    sides: 6, result: 6, sizePx: taille, index, animate: false, snapshot: true, material
  }));
  porte.append(el("b", "valeur", [texte(String(valeur))]));
  hote.append(porte);
  mount(porte);
}

/** L'ÉTAT D'UN JET POUR L'ŒIL — Eric, 05/09 : *« les 4 non sélectionnés passent
 *  en gris, les sélectionnés restent en blanc. Le plus bas de la sélection passe
 *  en orange et devient un 8. Si absence de 14, le plus haut est remplacé par un
 *  14 et le dé est bleu. »* Tant que le lot n'est pas clos, `kept` n'existe pas
 *  et le jet est simplement blanc. */
function etatDuJet(jet) {
  if (jet.ajuste === "bas") return "bas";
  if (jet.ajuste === "haut") return "haut";
  if (jet.kept === false) return "ecarte";
  return "garde";
}
/* 🎨 `ash`, PAS `slate`, POUR L'ÉCARTÉ — Eric, 05/09 au soir, devant la capture :
   *« dé trop noir ici »*. `slate` (`#4a4f55`) est un anthracite ; le gris qu'il
   demande depuis le matin (*« les 4 non sélectionnés passent en gris »*) est le
   clair du moteur, `ash` (`#c9cdd2`). Son chiffre redevient sombre (`num`
   `#3a3f45`) : l'encre blanche n'est plus forcée sur lui (shell.css). */
/** ⌨️ LES DEUX LIBELLÉS COMMUNS AUX DEUX MÉCANIQUES — d'Eric, recopiés tels quels
 *  (le premier bouton, lui, vient de la mécanique : `3d6` ou `4d6`).
 *  ⭐ EXPORTÉS PARCE QUE L'AIGUILLEUR LES NOMME (`abilities-step.mjs`, 06/09 :
 *  *« l'aiguilleur doit expliquer ce que font ces trois boutons »*). Deux
 *  écrivains pour un même mot, c'est exactement la faute que `TAILLE_DE_RESULTAT`
 *  a coûtée le 05/09 — un libellé changé d'un côté, une phrase qui ment de l'autre. */
export const LIBELLES = { flash: "Flash", reset: "Reset" };

const MATERIAU_PAR_ETAT = { garde: "white", ecarte: "ash", haut: "azure", bas: "white" };
/* 📏 26 : dix dés de 26 et neuf écarts de 2 font 278 sur les ~327 utiles du tapis
   bleu (351 moins ses deux bouts arrondis). Le détail `6+6+6` mesure 31,8 en T1 :
   c'est LUI qui fixe la colonne à 32, pas le dé.
   🔴 ET `--tray-de-resultat` (tokens.css) DIT LE MÊME 26 : le logement suit le dé.
   Le 05/09 au matin, « un peu plus gros » avait été écrit 30 là-bas seulement — le
   dé est resté à 26 ici, quatre pixels de vide autour, personne ne l'a vu. Le
   « 25 % plus grands » du soir ne passe par aucun des deux : c'est le `scale(.8)`
   du moteur, repris dans shell.css (`.tray-case-de .porte-de`). */
const TAILLE_DE_RESULTAT = 26;

/**
 * Le plateau entier. Rend un nœud, et ne connaît ni la coquille ni les
 * verbes du moteur (loi des lots 39/42).
 *
 * @param {object} o
 * @param {object} [o.mecanique]     l'entrée de `ROLLING_METHODS` à servir — combien de dés,
 *        combien de jets, comment jeter, comment clore. ⛔ Le plateau ne branche sur AUCUN id :
 *        tout ce qui sépare `FH 3D6` de `4D6` vit dans cet objet (lot 80, §4.2).
 * @param {object|null} o.lot        le lot déjà tiré, ou `null` si rien ne l'est
 * @param {number} o.revele          combien de jets sont déjà découverts
 * @param {(n:number)=>void} o.onRevele  appelé quand la séquence avance
 * @param {(lot:object)=>void} o.onNouveauLot  ⚠️ LE PLATEAU PRODUIT SON LOT
 *        LUI-MÊME et le REMONTE — il ne le demande pas. Sans ça, le premier
 *        `ROLL` passerait par le shell, déclencherait un redessin, et le
 *        joueur devrait presser deux fois pour voir une animation. Le shell
 *        se contente de le RANGER dans `state`, SANS redessiner.
 * @param {()=>void} o.onClear       remet les tirages à zéro
 */
/* ══ 🔴 LE PLATEAU RENDU EN TROIS SURFACES — Eric, 2026-09-05 ═══════════════
   Sa dictée découpe l'écran en dalles : les COMMANDES (« Roll Options » et ses
   boutons) dans la première, les DÉS 3D sur un tapis vert dans la deuxième, les
   RÉSULTATS sur un tapis bleu dans la troisième. Le plateau reste UN module —
   une séquence, un lot, une règle — mais il rend trois nœuds au lieu d'une
   dalle, et c'est l'écran qui les pose chacun dans sa cellule.
   ⛔ Ce n'est pas trois plateaux : la séquence écrit dans les trois surfaces
   depuis la même fermeture, exactement comme avant dans la même dalle.
   ⛔ `10x3D6` EST PARTI (*« exit 10x3d6 »*) : un jet par pression, ou `Flash`.
   Le même plateau sert 4D6, donc `6x4D6` part avec lui — un seul organe. */
export function renderTray({ mecanique, lot: lotInitial, revele = 0, onRevele, onNouveauLot, onClear }) {
  /* ⛔ JAMAIS `undefined` ICI : `mecaniqueDeJet` retombe sur la première
     entrée plutôt que de laisser un appelant lire `.jets` sur du vide. */
  const meca = mecanique && mecanique.jets ? mecanique : mecaniqueDeJet(mecanique && mecanique.id);
  /* ⛔ PLUS `dalle-intermediaire` — Eric, 05/09 : *« on ne voit pas les contours
     des boîtes qui composent la dalle »*. Le plateau est une BOÎTE dans la
     première dalle, pas une dalle : ni verre, ni liseré. */
  const dalle = el("section", "tray");
  /* La feuille a besoin de savoir combien de dés elle héberge : quatre dés ne
     tiennent pas à la cote de trois (voir `REGLAGES.taille4`). */
  dalle.dataset.des = String(meca.des);
  /* ⛔ PAS DE STYLE EN LIGNE ICI — l'écart des dés vit dans `shell.css`
     (`--tray-ecart`). Le DOM des tests (`tests/dom-stub.mjs`) n'a pas de
     `.style` : un `setProperty` posé AU RENDU faisait tomber seize tests
     d'un coup, pour du décor. Le décor va dans la feuille, toujours.
     📌 `REGLAGES.ecart` reste la valeur d'Eric et reste ici : c'est le
     fichier qui la porte, et la feuille la recopie sous son nom. */

  /* ── Le titre, centré (Eric, 2026-08-15, vu sur son iPhone SE) ─────── */
  dalle.append(el("h3", "tray-titre", [texte("Roll Options")]));

  /* ── La rangée des boutons, SEULE sur sa ligne (choix A d'Eric) ──────
     ⌨️ LES DEUX PREMIERS LIBELLÉS VIENNENT DE LA MÉCANIQUE (`3d6`/`10x3D6`,
     `4d6`/`6x4D6`) ; `Flash` et `Reset` sont les mêmes partout. La casse est
     celle d'Eric, recopiée telle quelle — il écrit le premier en minuscule et
     le second en majuscule, et un libellé est à lui. */
  const barre = el("div", "tray-boutons");
  const bouton = (libelle, classe, onClick) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = `tray-bouton ${classe}`;
    b.textContent = libelle;
    b.addEventListener("click", onClick);
    return b;
  };
  let lot = lotInitial;
  const total = meca.jets;
  const reste = total - revele;

  const roll = bouton(meca.boutonUn, "tray-roll", () => sequence(1));
  const flash = bouton(LIBELLES.flash, "tray-flash", () => flashRoll());
  const reset = bouton(LIBELLES.reset, "tray-reset", () => { annule = true; onClear(); });
  /* 🎬 UN LOT COMPLET (scène 2) : il n'y a plus rien à tirer. `3d6` et `Flash`
     s'éteignent ; `Reset` reste armé — Eric, 05/09 : *« le bouton reset, lui
     aussi, ramène à la scène 1 »*. Éteint, un bouton reste lisible (§6). */
  if (lotInitial) { roll.disabled = true; flash.disabled = true; }
  barre.append(roll, flash, reset);
  dalle.append(barre);

  /* ⛔ LA MENTION DE RELANCE A DISPARU AVEC LA RELANCE (lot 80, §3).
     Elle disait « None of the ten reached 15 — the whole set is discarded ».
     Plus aucun lot n'est jeté : il n'y a plus rien à annoncer, et un nœud
     vide gardé « au cas où » coûterait sa hauteur sur tous les jets. */

  /* ── Le plateau : les dés, au centre ───────────────────────────────── */
  const hote = el("div", "tray-des");
  hote.dataset.des = String(meca.des);

  /* ── Les cases, créées vides et remplies par la révélation ─────────── */
  const rangee = el("ol", "tray-cases");
  rangee.dataset.cases = String(total);
  const cases = Array.from({ length: total }, (_, i) => {
    const c = caseDeResultat(i + 1);
    rangee.append(c);
    return c;
  });

  /* ── ⭐ UN LOT RANGÉ DANS `state` EST TOUJOURS FINI ────────────────────
     `revele` ne décrit qu'une salve EN COURS — jamais ce qu'on affiche. Un
     lot qui arrive par les props a fini de tomber (le plateau ne le remonte
     qu'au dernier jet, ou d'un coup au flash), donc **il se peint entier**,
     ses gardés compris. Peindre `revele` cases était la quatrième tentative
     de branchement : au premier redessin — une assignation, un tour de
     molette — la moitié des jets disparaissait.

     ⭐ ET LES DÉS REPRENNENT LA POSE DU DERNIER JET. `animate: false` est
     fait pour ça, mot pour mot : *« le dé prend la POSE du résultat, sans
     tomber »*. Un redessin ne rejoue donc AUCUNE animation.

     ⚠️ CETTE LIGNE AVAIT ÉTÉ RETIRÉE SOUS UNE FAUSSE RÈGLE. « Les dés ne
     naissent que d'un GESTE, jamais au rendu » venait d'un `TypeError` de
     `createDieHost` sous le DOM de test — lequel n'avait pas de `.style`,
     alors que le moteur y pose la taille CALCULÉE de chaque dé. Une limite
     du stub habillée en principe. */
  if (lot) {
    peinsLeLot(cases, lot);
    const dernier = lot.rolls[lot.rolls.length - 1];
    /* ⛔ `standardArrayBatch` porte des jets SANS dés (`dice: []`) : il n'a
       rien à poser, et le plateau ne le sert pas de toute façon. */
    if (dernier && dernier.dice && dernier.dice.length) poserLesDes(hote, dernier.dice, false);
  }

  /* ══ LA SÉQUENCE — elle écrit à la main, elle ne redessine JAMAIS ════
     Un `refresh()` ici tuerait les canvas en plein vol. On touche des nœuds
     qui existent déjà, exactement comme le scrollspy touche un attribut. */
  let enCours = false;
  let annule = false;

  /** Le lot courant en cours de révélation. */
  let tentative = lot ? [...lot.rolls] : null;

  async function sequence(combien) {
    if (enCours) return;
    enCours = true; annule = false;
    roll.disabled = flash.disabled = true;
    let faits = 0;
    while (faits < combien && !annule) {
      /* Une salve qui repart d'un lot COMPLET recommence à zéro : on ne
         complète jamais un lot fini, on en tire un neuf. */
      if (!tentative || tentative.length >= total) {
        tentative = []; videLesCases(cases); revele = 0;
      }
      /* 🔴 LE TIRAGE SE FAIT ICI, une ligne avant l'animation — pas tous les
         jets plus tôt. C'est la réponse à l'objection d'Eric sur le hasard
         différé : les dés décident en tombant. */
      const jet = meca.jeter(Math.random);
      tentative.push(jet);
      poserLesDes(hote, jet.dice, true);
      revele += 1; faits += 1;
      ecrisCase(cases[revele - 1], jet);
      await attendre(REGLAGES.pauseMs);
      if (annule) break;
      if (revele < total) continue;

      /* ── LE DERNIER EST TOMBÉ : la règle du LOT se prononce ─────────
         ⛔ Elle porte sur le lot, jamais sur un jet — c'est pour ça qu'on ne
         peut la lire qu'ici, et jamais au fil de l'eau. `finir` marque les
         gardés ET pose les planchers ; les cases se REPEIGNENT donc en
         entier, parce que deux totaux viennent de changer sous les yeux du
         joueur, et qu'il doit voir lesquels. */
      lot = { rolls: meca.finir(tentative), rerollCount: 0, method: meca.id };
      peinsLeLot(cases, lot);
      onNouveauLot(lot);
      onRevele(total);
      break;
    }
    enCours = false;
    if (roll.isConnected) roll.disabled = flash.disabled = false;
  }

  /* ⚡ LE FLASH — aucun dé ne roule, aucun jet ne se regarde tomber.
     Eric, 2026-08-15 : « on voit le résultat et c'est tout ». Le lot arrive
     fait (`rollAbilityBatch`, la MÊME définition de « un lot » que la
     séquence déroule au ralenti), les cases se remplissent d'un coup, et les
     dés prennent la POSE du dernier jet sans tomber. */
  function flashRoll() {
    if (enCours) return;
    lot = rollAbilityBatch(meca.id, Math.random);
    tentative = [...lot.rolls];
    revele = total;
    videLesCases(cases);
    peinsLeLot(cases, lot);
    const dernier = lot.rolls[lot.rolls.length - 1];
    if (dernier && dernier.dice && dernier.dice.length) poserLesDes(hote, dernier.dice, false);
    onNouveauLot(lot);
    onRevele(total);
  }

  function attendre(ms) {
    return new Promise((ok) => {
      const t = setTimeout(ok, ms);
      /* CLEAR « même en plein milieu » (Eric) : le minuteur doit être
         ANNULABLE, sinon la salve continue après la remise à zéro. */
      minuteurs.push(() => { clearTimeout(t); ok(); });
    });
  }
  const minuteurs = [];
  dalle.addEventListener("tray:stop", () => { annule = true; minuteurs.forEach((f) => f()); });

  /* ⭐ TROIS SURFACES, UNE FERMETURE. `commandes` est la boîte « Roll Options »
     (le `.tray` d'avant, sans les dés ni les cases), `des` l'hôte des dés 3D,
     `cases` la rangée des résultats. L'écran les pose ; la séquence les écrit. */
  return { commandes: dalle, des: hote, cases: rangee };
}

/** Remet les cases à vide — un lot balayé disparaît de l'écran, il ne se
 *  garde nulle part (Eric, 2026-08-13 : aucun historique). */
function videLesCases(cases) {
  for (const c of cases) {
    c.dataset.etat = "vide";
    delete c.dataset.garde;
    delete c.dataset.ajuste;
    swapContent(c, [etiquetteDeCase(Number(c.dataset.numero))]);
    c.removeAttribute("title");
  }
}

/** LE LOT ENTIER, PEINT D'UN COUP — totaux, gardés, planchers.
 *
 *  🔴 POURQUOI LES TOTAUX SE REPEIGNENT, ET PAS SEULEMENT LES GARDÉS : la
 *  règle du lot 80 CHANGE deux totaux (le meilleur monte à 14 s'il n'y est
 *  pas, le pire descend à 8). Une case écrite au fil de l'eau porte le total
 *  BRUT ; si on ne repassait que `data-garde`, l'écran montrerait un 12 là où
 *  le vivier propose un 8 — deux nombres pour un dé, la contradiction exacte
 *  que le lot 46 a corrigée ailleurs.
 *
 *  ⛔ ET LE JET AJUSTÉ SE DIT : `data-ajuste` porte lequel des deux planchers
 *  l'a touché, et l'infobulle garde la somme réelle des dés. Un 14 posé sur un
 *  « 4+4+4 » muet serait un total menteur. */
function peinsLeLot(cases, lot) {
  lot.rolls.forEach((jet, i) => {
    if (!cases[i]) return;
    ecrisCase(cases[i], jet);
    cases[i].dataset.garde = String(jet.kept);
  });
}

/** Écrit UNE case : son total, sa provenance, et l'ajustement s'il y en a un.
 *
 *  🔴 ELLE NE DÉCIDE PAS DES GARDÉS, ET C'EST UNE CORRECTION DÉJÀ PAYÉE. La
 *  version d'avant prenait un `lot` et un `revele` pour repeindre les retenus
 *  quand la dernière case tombait — mais ses TROIS appelants lui passaient
 *  `lot: null`, et elle lisait `lot.rolls.length` à la ligne suivante.
 *  **`TypeError` sur le premier dé, dans les trois modes.** Le module n'avait
 *  jamais tourné : rien ne l'appelait, donc rien ne l'a dit.
 *
 *  📌 La forme de la faute : une fonction qui fait DEUX choses (écrire une
 *  case · trancher sur le lot entier) n'a pas de signature honnête — l'une des
 *  deux finit appelée avec les paramètres de l'autre. Une brique, un écrivain. */
function ecrisCase(box, jet) {
  const etat = etatDuJet(jet);
  box.dataset.etat = etat;
  if (jet.ajuste) box.dataset.ajuste = jet.ajuste;
  else delete box.dataset.ajuste;
  /* 🎲 LE DÉ-SOCLE ET LE DÉTAIL — *« une image de d6 avec le total marqué sur
     son sommet, en dessous le détail du jet 4+2+1 »* (Eric, 05/09). Le socle se
     REPEINT à chaque écriture parce que sa couleur dit l'état, et l'état change
     au dixième jet. Sur un jet remplacé par un plancher, le détail est BARRÉ
     (feuille, `data-ajuste`) : les dés sont tombés ainsi, le total dit autre chose. */
  const logement = el("span", "tray-case-de");
  poserUnDe(logement, jet.total, TAILLE_DE_RESULTAT, Number(box.dataset.numero) - 1, MATERIAU_PAR_ETAT[etat]);
  if (Array.isArray(jet.dice) && jet.dice.length) {
    logement.append(el("span", "tray-case-detail", [texte(jet.dice.join("+"))]));
  }
  swapContent(box, [logement]);
  /* L'infobulle dit les dés ET, si le plancher a mordu, ce que le jet valait
     avant lui. C'est le seul endroit où les deux nombres se lisent ensemble. */
  const des = jet.dice.join(" + ");
  box.title = jet.ajuste ? `${des} = ${jet.brut} → ${jet.total}` : des;
}

export const ROLL_DURATION_MS = rollDurationMs;
