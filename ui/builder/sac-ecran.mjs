/* ══ L'ÉCRAN SB3.1 — LE SAC ═══════════════════════════════════════════════════
   Lot 214. Quatre rangées de trois jetons par SECTION, une roue pour passer de
   l'une à l'autre, et la rangée d'échange de R autour du collecteur.

   🔴 TOUTE LA GÉOMÉTRIE VIENT DE `sac-disposition.mjs`, ET CE FICHIER EST GÉNÉRÉ
   (`Plan-backpack/backpack_gen.py` → `backpack_cotes.json` → la déclaration).
   Ce module PEINT, il ne décide d'aucune cote : il lit la table, pose chaque
   organe à son `x`/`y` du plan. ⛔ Aucun nombre ne s'écrit ici. Un nombre qui
   manque à la table se demande à la table — il ne se retape pas.

   🔴 LES POSITIONS SORTENT DANS UNE FEUILLE CONSTRUITE, PAS EN STYLE EN LIGNE :
   le garde 7 des jetons interdit `.style` dans tout `ui/`. Une valeur qui vient
   de la DONNÉE ne peut pas vivre dans `shell.css` (elle y serait recopiée) —
   elle sort donc dans une feuille que ce module écrit depuis la table, une règle
   par organe. `shell.css` ne porte que l'HABIT : la forme, l'encre, les états.

   ⭐ ET LE JETON N'EST PAS DESSINÉ ICI : il vient de `jeton-objet.mjs`, l'organe
   que l'écran R porte aussi. Deux copies divergeraient à la première marque
   ajoutée — c'est la doctrine payée trois fois (l'interrupteur du menu, les
   chevrons de Destiny, ce jeton).

   ⏳ CE QUE CE PREMIER JET NE FAIT PAS ENCORE, et le dit : le glisser d'une
   section à l'autre, les popups de `Sort` et de `Sections`, la molette du tuner.
   La table les porte, l'écran les POSE — les gestes viendront sur ce socle. */

import { DALLE, MARGE, TOUCH, JETON, ROUE, COLONNES, ORGANES } from "./sac-disposition.mjs?v=692";
import { corpsDuJeton, motDuJeton } from "./jeton-objet.mjs?v=692";
/* ⭐ LE GLISSER EST CELUI DE R, PAS UN SECOND — `armerJeton` et `fantome` vivent
   dans `glisser.mjs` depuis le carnet, et R les emploie tels quels. ⛔ Sans eux le
   collecteur du sac ne pouvait rien recevoir, donc `Send` et `Drop` n'agissaient
   sur rien : trois organes posés sur l'écran et morts. C'est précisément ce
   qu'Eric a refusé le 18/09 en regardant l'écran en ligne. */
import { armerJeton, fantome } from "./glisser.mjs?v=692";
/* 🔴 LE TROISIÈME PIÈGE DU `zoom`, ET C'EST UN GARDE QUI ME L'A APPRIS : un
   `getBoundingClientRect()` rend des pixels PEINTS (blg × le cran), pendant que
   `offsetWidth` et la mise en page restent en blg. ⛔ Mélanger les deux familles
   donne un résultat juste au cran 1 et faux partout ailleurs — le défaut le plus
   silencieux des trois. ⭐ Le facteur se LIT sur la racine d'échelle, par l'organe
   qui le sait (`facteurZoomCourant`) : ⛔ pas un second calcul à moi. */
import { facteurZoomCourant } from "./echelle.mjs?v=692";

/** La clef DOM de chaque organe de la table. ⛔ Elle ne se devine pas du nom :
 *  une clef est un contrat entre la table, la feuille et le garde. */
export const CLEF_DE = Object.freeze({
  "ROUE": "roue", "TUNER G": "tuner-g", "TUNER D": "tuner-d",
  "CRAN 1": "cran-1", "CRAN 2": "cran-2", "CRAN 3": "cran-3", "CRAN 4": "cran-4", "CRAN 5": "cran-5",
  "TRIER": "trier", "TASSER": "sections",
  "POIDS TOTAL": "poids-total", "POIDS DETAIL": "poids-detail",
  "EFFACER": "effacer", "EDITER": "editer",
  "COLLECTEUR": "collecteur", "TALLY": "tally", "PARTY TALLY": "party-tally", "PURSE": "purse",
  "SEND VERS": "send-vers", "GEAR": "gear", "SEND": "send", "WARES": "wares",
  "RANGEE": "rangee", "livre": "livre", "?": "guide"
});
/* les douze cases prennent leur clef de leur nom : CASE 2.3 → case-2-3 */
const clefDeCase = (nom) => nom.toLowerCase().replace(/\s/g, "-").replace(".", "-");

/* 🔴 LA TAILLE DE LA GRILLE SE COMPTE DANS LA TABLE, ⛔ ELLE NE S'ÉCRIT PAS ICI.
   Je bouclais sur `r < 4` et `c < 3` : deux nombres retapés, dans le seul fichier
   du lot qui a le droit de n'en porter aucun. Le jour où le plan rend sa cinquième
   rangée — elle a été retirée pour le collecteur, elle peut revenir — la boucle
   aurait menti sans que rien ne rougisse.
   ⭐ ET LA GRILLE EST AUSSI LA TAILLE D'UNE PAGE : *« ça va dans la page suivante…
   voire ça crée une page supplémentaire si besoin »* (Eric, 18/09). Le document
   compte des PLACES ; c'est cette cote qui les découpe en pages. `equipment-step`
   l'importe plutôt que d'en tenir une seconde copie. */
const CASE_RE = /^CASE (\d+)\.(\d+)$/;
const cases = ORGANES.map((o) => CASE_RE.exec(o.nom)).filter(Boolean);
export const RANGS_GRILLE = cases.reduce((m, c) => Math.max(m, Number(c[1])), 0);
export const COLS_GRILLE = cases.reduce((m, c) => Math.max(m, Number(c[2])), 0);
/* ⛔ `CASES_DU_SAC`, ET SURTOUT PAS `CASES_PAR_PAGE` : ce nom-là est INTERDIT dans
   `ui/` — c'était l'ancien nom local de la page de listes, et un garde veille à ce
   qu'il ne revienne pas (« deux noms pour un nombre, c'est déjà une recopie »). La
   norme du produit est `LISTE_PAR_PAGE` = 15, au socle.
   ⭐ ET LE SAC A LE DROIT DE FAIRE AUTREMENT, comme Wares : sa grille vaut 12 parce
   que le COLLECTEUR lui a pris une rangée — *« il nous manque un collecteur, il faut
   faire sauter une rangée »* (Eric, 18/09). C'est une DÉROGATION avec une cause
   visible à l'écran, exactement ce que le garde autorise : *« si cet écran a une
   RAISON de faire autrement, il passe SON nombre »*. ⛔ Et il ne l'écrit pas : il le
   COMPTE dans son plan. */
export const CASES_DU_SAC = RANGS_GRILLE * COLS_GRILLE;

const px = (v) => `${Math.round(v * 100) / 100}px`;
/* 🔴 UN ORGANE NICHÉ SE POSE PAR RAPPORT À SON HÔTE, PAS À LA DALLE — faute vue
   au banc, premier rendu : les cinq crans portaient les `x` de la TABLE (32, 93,
   154…) alors qu'ils vivent DANS la roue, elle-même posée à 32. Ils partaient
   donc 32 trop à droite et se tronquaient en « P… ».
   ⭐ La table dit `dans: "ROUE"` : l'écart se calcule, il ne se retape pas. */
const NICHES = new Set(["CRAN 1", "CRAN 2", "CRAN 3", "CRAN 4", "CRAN 5"]);
const hote = (o) => (NICHES.has(o.nom) ? ORGANES.find((p) => p.nom === o.dans) : null);
const pose = (o) => {
  const h = hote(o);
  const dx = h ? (h.cible ? h.cible.x : h.x) : 0;
  const dy = h ? (h.cible ? h.cible.y : h.y) : 0;
  const c = o.cible;
  /* 🔴 LES QUATRE BORDS SE DÉDUISENT DES ÉCARTS RÉELS, ⛔ PLUS D'UNE SYMÉTRIE.
     J'écrivais `(c.l - o.l) / 2` de chaque côté — ce qui suppose le dessin CENTRÉ
     dans sa cible. C'était vrai tant qu'aucune cible n'était rabattue.
     ⚖️ Depuis le 18/09 une cible ne sort plus de la dalle (mesure au téléphone : les
     tuners débordaient de 13, il ne restait que 31 de touchable sous le plancher
     sacré de 44). Les deux tuners ont donc un dessin DÉCENTRÉ dans leur cible — et
     la formule symétrique aurait peint leur chevron 13 blg à côté de sa place.
     ⭐ Écrite ainsi, elle rend exactement les mêmes nombres qu'avant pour toute
     cible centrée : c'est une généralisation, pas un changement de loi. */
  return c
    ? `left:${px(c.x - dx)};top:${px(c.y - dy)};width:${px(c.l)};height:${px(c.h)};` +
      `border-width:${px(o.y - c.y)} ${px((c.x + c.l) - (o.x + o.l))} ` +
      `${px((c.y + c.h) - (o.y + o.h))} ${px(o.x - c.x)}`
    : `left:${px(o.x - dx)};top:${px(o.y - dy)};width:${px(o.l)};height:${px(o.h)}`;
};

/** La feuille qui pose chaque organe à sa place du plan. Exportée pour le garde,
 *  qui la relit contre la table.
 *  · un organe SANS cible reçoit sa boîte telle quelle — on le lit, on ne le tape
 *    pas, et le plancher `--touch` ne s'y applique pas ;
 *  · un organe À CIBLE reçoit la boîte de sa CIBLE, et son dessin en creux : les
 *    bords transparents portent l'écart cible − dessin (NORMES §0). */
export function feuilleDesCotesSac() {
  const regles = [];
  for (const o of ORGANES) {
    if (o.creation === false) continue;          /* ⛔ les lunes : cotées, pas posées */
    const id = CLEF_DE[o.nom] || (o.nom.startsWith("CASE ") ? clefDeCase(o.nom) : null);
    if (!id) continue;
    /* ⛔ LES ENFANTS DE LA RANGÉE NE SE POSENT PAS : c'est la grille partagée des
       rangées de contrôles qui les range (cinq listes de `shell.css` la disent
       ensemble). Leur `x` au plan dit où ils TOMBENT, il ne les y met pas. */
    if (o.sorte === "porte" || o.sorte === "rond") continue;
    /* ⛔ SÉLECTEUR DESCENDANT, JAMAIS `>` : un enfant direct enferme une cote dans
       une STRUCTURE, et la structure bouge dès qu'un organe se loge dans un groupe. */
    regles.push(`.sac [data-organe="${id}"]{${pose(o)}}`);
  }
  /* ⚖️ LA RÈGLE D'ERIC (18/09) : *« il faut que le T0 des petites tuiles
     remplissent idem que le T1 de la grande tuile »*. La marge intérieure vaut
     7,5 % de la largeur DU CRAN — 5 sur le dominant, 4 sur un secondaire.
     🔴 ET ELLE NE PEUT PAS S'ÉCRIRE `padding-inline: 7.5%` — faute vue au banc :
     un pourcentage de `padding` se résout sur la largeur du CONTENANT, pas sur
     celle de l'élément. 7,5 % de la roue (311) faisait 23,3 de chaque côté, et
     il ne restait que 20 pour le mot : tous les crans affichaient « P… ».
     ⭐ Le pourcentage reste donc dans la TABLE, où il est vrai, et la feuille en
     DÉDUIT deux nombres — qui ne sont pas retapés : ils se recalculent si une
     cote bouge. */
  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    if (!id || !id.startsWith("cran-")) continue;
    regles.push(`.sac [data-organe="${id}"]{padding-inline:${px(o.l * ROUE.margePct)}}`);
  }
  return regles.join("\n");
}

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}
function bouton(classe, mot, note, surClic) {
  const b = el("button", classe, mot);
  b.type = "button";
  if (note) b.setAttribute("aria-label", note);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

/* ══ LES ORGANES ═══════════════════════════════════════════════════════════ */

/** La roue des sections — le tambour d'Équipement à UN étage, sans perspective.
 *  ⚖️ Eric, 18/09 : *« le tambour est mal fait… l'idée est de faire un tambour à un
 *  étage, zoom + halo idem belt sur l'élément actif, les autres en plus petit,
 *  2 de chaque côté »*. ⭐ Le cran sous le viseur NOMME l'écran — NORMES §1
 *  quinquies, *« le tambour désigne »* — donc ⛔ aucun titre n'est dû. */
function roue(options) {
  const r = el("div", "sac-roue");
  r.dataset.organe = "roue";
  /* ⛔ `tablist` SEULEMENT AU REPOS : en édition la roue porte un champ de saisie et
     un `+`, qui ne sont pas des onglets. Un rôle qui ment sur ce qu'il contient est
     pire qu'aucun rôle — un lecteur d'écran annoncerait « onglet 3 sur 5 » devant
     une zone de texte. */
  r.setAttribute("role", options.edition === true ? "group" : "tablist");
  r.setAttribute("aria-label", "Sections");
  const sections = options.sections || [];
  const n = sections.length;
  const actif = Math.max(0, options.section | 0);
  /* ⚖️ CINQ PLACES, PAS CINQ CRANS — deux avant, le dominant, deux après. La table
     ne connaît que des PLACES ; c'est la roue qui décide combien elle en remplit.
     🔴 ET EN DESSOUS DE CINQ SECTIONS, ELLE N'EN REMPLIT PAS CINQ : avec le modulo,
     une seule section s'affichait cinq fois, et un sac neuf — qui n'en a AUCUNE —
     montrait cinq crans nus. ⛔ Une roue qui tourne sur elle-même ment sur ce
     qu'elle contient. Vu dans l'application, pas au banc.

     🔴 MAIS LE SEUIL ÉTAIT `> 5`, ET IL FAUT `>= 5` — vu au banc le 18/09, avec
     CINQ sections : la roue refusait de boucler et n'en montrait que trois, le
     dominant collé à gauche au lieu d'être sous le viseur. ⭐ Le critère n'est pas
     « plus que les places », c'est *« assez pour remplir les places SANS répéter »* :
     à n = 5, cinq places portent cinq sections différentes — il n'y a pas de
     mensonge. À n = 4, une section paraîtrait deux fois, et là il y en aurait un.
     ⚖️ Et le défilement doit boucler : Eric, 18/09, *« un belt infini déroulant pour
     naviguer dans les sous-sections »*.

     ══ LE MODE ÉDITION ══════════════════════════════════════════════════════
     ⚖️ Eric, 18/09 : *« le bouton pack devient sections, et la roue passe en mode
     édition »* · *« tap pour modifier, chevrons pour défiler »* · *« le bouton +
     crée, le bouton − supprime »* · *« possibilité de supprimer une section si elle
     est vide »*.
     ⭐ TROIS DIFFÉRENCES, ET PAS UNE DE PLUS : ① le cran dominant devient un CHAMP —
     on tape dedans, c'est le renommage sur place ; ② une place de plus au bout de la
     liste porte le `+` ; ③ la roue NE BOUCLE PLUS. Le ruban infini est bon pour
     naviguer, mauvais pour éditer : en édition on regarde une LISTE, et une liste a
     un début et une fin — sans quoi le `+` du bout ne serait jamais au bout.
     ⛔ Le `−` ne vit PAS sur la roue : il prend la place du `Sort`, qui n'a rien à
     faire pendant qu'on édite. Un cran qui porte à la fois un nom, un champ et une
     croix ne se lit plus. */
  const edition = options.edition === true;
  /* ⚖️ UNE ROUE INFINIE — Eric, 2026-09-19 : *« ça doit être une roue infinie ; le halo
     et le zoom restent au centre, et les boîtes défilent dans le halo »* · *« il doit
     toujours y avoir 2 sections à gauche et 2 à droite »*.
     ⭐ L'ANNEAU PORTE `n` CRANS AU REPOS ET `n + 1` EN ÉDITION — le `+` est un cran de
     plus SUR l'anneau, pas une butée à son bout. ⛔ C'est ce qui rend les deux
     compatibles : un ruban infini n'a pas de bout où poser quoi que ce soit.
     ⭐ ET LE VISEUR NE BOUGE JAMAIS : le halo et le zoom vivent à la place du MILIEU,
     ce sont les noms qui défilent dessous. Les deux voisins de chaque côté sont donc
     toujours là — c'est la conséquence de l'anneau, pas une règle de plus.
     ⛔ ON NE BOUCLE PAS SOUS CINQ CRANS : une section paraîtrait deux fois, et une
     roue qui se répète ment sur ce qu'elle contient. Avec les six du socle et le
     party inventory, le cas ne se présente plus — mais un banc peut l'appeler. */
  /* ⚖️ LES DEUX `+` OCCUPENT LES DEUX BOUTS DE LA ROUE — croquis d'Eric, 19/09 :
     `Backpack + section` au bout gauche, `Outside backpack + section` au bout droit,
     son `+` doré. ⭐ CE SONT DES PLACES FIXES, PAS DES CRANS DE L'ANNEAU : elles ne
     défilent pas. ⛔ Conséquence assumée et visible sur son croquis : en édition on ne
     voit plus que TROIS sections, une de chaque côté du viseur.
     🔴 ET C'EST L'INVERSE DE CE QUE J'AVAIS FAIT HIER — j'avais mis un `+` unique SUR
     l'anneau, pour qu'un ruban infini garde un endroit où créer. Eric le sort de
     l'anneau : un bouton qui défile est un bouton qu'on doit chercher. */
  const bouts = edition ? 1 : 0;
  const fenetre = 5 - 2 * bouts;                 /* 5 au repos, 3 en édition */
  for (let i = 0; i < 5; i += 1) {
    const dom = i === 2;
    if (edition && (i === 0 || i === 4)) {
      const dehors = i === 4;
      const p = el("button", "sac-cran", "+");
      p.type = "button";
      p.dataset.organe = `cran-${i + 1}`;
      p.dataset.dominant = "non";
      p.dataset.role = "ajouter";
      if (dehors) p.dataset.lieu = "dehors";
      p.setAttribute("aria-label", dehors ? "New section outside the backpack" : "New backpack section");
      p.addEventListener("click", () => options.surAjouter && options.surAjouter(dehors ? "dehors" : "sac"));
      r.append(p);
      continue;
    }
    const brut = actif - Math.floor(fenetre / 2) + (i - bouts);
    const idx = n >= fenetre
      ? ((brut % n) + n) % n
      : (brut >= 0 && brut < n ? brut : -1);
    if (idx < 0) continue;                       /* cette place reste vide */
    /* ⭐ LE CRAN DOMINANT EN ÉDITION EST UN CHAMP — *« tap pour modifier »*. Il garde
       la boîte du cran (la feuille lui donne le même habit) ; ce qui change est
       qu'on peut écrire dedans. ⛔ On n'écrit au document QU'À LA VALIDATION : un
       verbe par frappe redessinerait l'écran sous les doigts du joueur. */
    /* ⛔ UNE SECTION FIGÉE NE DEVIENT PAS UN CHAMP — le party inventory est là
       *« d'entrée de jeu »* (Eric, 19/09) : on ne rebaptise pas une place qu'on n'a
       pas faite, et son nom dit à qui elle est. ⭐ Elle garde tout le reste : la
       grille, les places, le rangement, le glisser. */
    /* ⚖️ ET LE CHAMP N'APPARAÎT PLUS TOUT SEUL — Eric, 19/09 a donné au renommage sa
       propre poignée (`/`). ⛔ Avant, entrer en édition ouvrait un champ sur la boîte
       regardée : on ne pouvait plus la lire sans être en train de la modifier. */
    if (edition && dom && options.renommage === true && sections[idx].renommable !== false) {
      const champ = el("input", "sac-cran sac-cran-champ");
      champ.type = "text";
      champ.value = sections[idx].nom;
      champ.maxLength = 22;                      /* la cote du cran sur deux étages */
      champ.dataset.organe = `cran-${i + 1}`;
      champ.dataset.dominant = "oui";
      champ.setAttribute("aria-label", "Section name");
      const valider = () => {
        if (champ.value.trim() === sections[idx].nom) return;
        if (options.surRenommer) options.surRenommer(idx, champ.value);
      };
      champ.addEventListener("keydown", (ev) => {
        if (ev && ev.key === "Enter") { ev.preventDefault(); valider(); }
        /* ⛔ Échap REND LE NOM D'AVANT, il n'écrit rien : une frappe abandonnée ne
           doit pas laisser de trace au document. */
        if (ev && ev.key === "Escape") { champ.value = sections[idx].nom; champ.blur(); }
      });
      champ.addEventListener("blur", valider);
      r.append(champ);
      continue;
    }
    const c = el("button", "sac-cran", sections[idx].nom);
    c.type = "button";
    c.dataset.organe = `cran-${i + 1}`;
    c.dataset.dominant = dom ? "oui" : "non";
    /* ⚖️ LE LISERÉ DIT LE LIEU — Eric, 19/09 : *« liseré doré = hors backpack, liseré
       blanc = dans backpack »*. ⛔ L'attribut ne se pose que pour l'AILLEURS : le
       blanc est le défaut de la maison, et un défaut qu'on réécrit cesse d'en être un. */
    /* ⚖️ TROIS LISERÉS, TROIS GENRES — croquis du 19/09 : blanc = une section du sac,
       BLEU = le party inventory, DORÉ = hors du sac. ⛔ Le blanc est le défaut de la
       maison : il ne se déclare pas, et c'est le signe que le défaut était le bon. */
    if (sections[idx].dehors === true) c.dataset.lieu = "dehors";
    else if (sections[idx].party === true) c.dataset.lieu = "party";
    c.setAttribute("role", "tab");
    c.setAttribute("aria-selected", String(dom));
    if (!dom && options.surSection) c.addEventListener("click", () => options.surSection(idx));
    r.append(c);
  }
  return r;
}

/* ══ LE DÉFILEMENT PAR LA MARGE — Eric, 18/09 ══════════════════════════════
   ⚖️ *« le drag dans la marge fait défiler latéralement les sections en maintenant
   le fantôme, ce qui permet de le déplacer d'une section à l'autre »*.

   ⭐ ET CE GESTE SURVIT AU REPEINT, CE QUI N'ALLAIT PAS DE SOI : tourner une section
   reconstruit toute la grille, donc le jeton qu'on tient QUITTE le DOM en plein
   geste. C'est exactement la panne du lot 205 — *« il reste bloqué là où tu le
   vois »* —, et `glisser.mjs` l'a réglée pour de bon : les écouteurs vivent sur
   `document`, le fantôme sur `document.body`, et la visée passe par
   `elementFromPoint`, donc elle rencontre les cases NEUVES. Le geste ne tient à
   aucun nœud de l'écran. ⛔ Sans cette propriété, ce défilement serait impossible.

   ⭐ ET LE MINUTEUR SE TIENT AU MODULE, PAS DANS UNE FERMETURE — la même loi que le
   `gesteVivant` de `glisser.mjs` : *« ce qui est partagé se tient au module »*.
   🔴 En fermeture il aurait FUI : chaque cran repeint l'écran, donc crée un nouvel
   objet d'écran, pendant que l'ancien minuteur continue de tourner. La roue serait
   partie toute seule et ne se serait plus arrêtée. */
let defilementVivant = null;

/** ⏱️ LA CADENCE DE REPRISE. ⛔ Aucune donnée ne la dicte, et je ne prétends pas le
 *  contraire : elle doit être plus longue qu'un coup d'œil sur le nom qui arrive, et
 *  plus courte que l'impatience. ⭐ Le PREMIER cran, lui, part tout de suite — sinon
 *  la marge semble morte. ⏳ Un mot d'Eric et elle bouge. */
const REPRISE_MS = 450;

/** Le sens du défilement pour une abscisse d'écran : `-1` à gauche de la grille,
 *  `+1` à sa droite, `0` dessus.
 *  ⛔ LA MARGE NE S'INVENTE PAS : c'est tout ce qui est HORS de la largeur de la
 *  grille, et cette largeur vient du plan (`COLONNES`, `JETON`). Un pour-cent écrit
 *  ici serait un nombre de plus à tenir d'accord avec la table. */
function margeDuGlisser(x) {
  const dalle = document.querySelector(".sac");
  if (!dalle || typeof dalle.getBoundingClientRect !== "function") return 0;
  /* ⛔ ON NE LIT DU RECTANGLE QUE SON BORD GAUCHE, et c'est volontaire : `x` vient
     de `clientX`, donc du MÊME repère peint. ⭐ La conversion blg → peint passe par
     le facteur de la racine d'échelle, jamais par une largeur qu'on diviserait soi-
     même — deux lecteurs du zoom finiraient par ne plus dire la même chose. */
  const gauche = dalle.getBoundingClientRect().left;
  const k = facteurZoomCourant(document);
  if (!k) return 0;
  if (x < gauche + COLONNES[0] * k) return -1;
  if (x > gauche + (COLONNES[COLONNES.length - 1] + JETON.l) * k) return 1;
  return 0;
}

/** Arrête le défilement. ⭐ Appelée au dépôt ET au lâcher — un geste qui se termine
 *  n'importe comment doit rendre la roue immobile. */
export function arreteLeDefilement() {
  if (defilementVivant && defilementVivant.minuteur) clearInterval(defilementVivant.minuteur);
  defilementVivant = null;
}

/** Le pointeur a bougé pendant un glisser : entre-t-il, sort-il, ou reste-t-il dans
 *  la même marge ? ⛔ On ne relance rien tant que le sens ne change pas. */
function regardeLaMarge(x, options) {
  const sens = margeDuGlisser(x);
  if (defilementVivant && defilementVivant.sens === sens) return;
  arreteLeDefilement();
  if (sens === 0 || !options.surTourner) return;
  options.surTourner(sens);                    /* le premier cran, tout de suite */
  defilementVivant = { sens, minuteur: setInterval(() => options.surTourner(sens), REPRISE_MS) };
}

/** Le glisser d'un jeton du sac — le même partout : la marge défile, le dépôt pose.
 *  ⭐ Écrit UNE fois et donné aux deux organes qui glissent (une case, le
 *  collecteur) : deux copies divergeraient au premier réglage. */
function glisserDuSac(noeud, index, options, surDepot) {
  armerJeton(noeud, {
    onTap: () => options.surJeton && options.surJeton(index),
    onLever: (x, y) => fantome.lever(noeud, x, y),
    onBouger: (x, y) => { fantome.suivre(x, y); regardeLaMarge(x, options); },
    onPoser: () => { fantome.ranger(); arreteLeDefilement(); },
    onDepot: (creneau) => { arreteLeDefilement(); surDepot(creneau); }
  });
}

/* ══ LE BALAYAGE DE LA GRILLE — Eric, 18/09 au soir ════════════════════════
   ⚖️ *« reste le balayage, qui est accessible »* — dit APRÈS avoir tranché que les
   tuners sont une affaire de souris. ⭐ La molette tourne la page à la souris ; le
   balayage la tourne au doigt, et c'est LUI le geste que tout le monde peut faire.
   ⛔ UN GESTE QUI PART D'UN JETON EST UN GLISSER, PAS UN BALAYAGE — c'est la seule
   règle qui les sépare, et elle se lit sur le nœud (`data-glissable`, la marque que
   `armerJeton` pose). Sans elle, prendre un objet pour le déplacer tournerait la
   page sous lui. ⭐ Et c'est la convention du téléphone : on glisse une icône, on
   balaie la page. */

/** ⛔ LE SEUIL NE S'INVENTE PAS : un mouvement plus court qu'une CIBLE TACTILE n'est
 *  pas un balayage, c'est un tap qui a tremblé. `TOUCH` est déjà ce plancher-là. */
const SEUIL_BALAYAGE = TOUCH;

/** ⭐ DEUX SURFACES, DEUX SUJETS, LE MÊME GESTE. Sur la GRILLE il tourne la PAGE ; sur
 *  la ROUE il tourne la SECTION — Eric, 19/09 : *« les sections de sacs, le swipe doit
 *  fonctionner »*. ⛔ Écrit UNE fois : deux copies divergeraient au premier réglage. */
function balayage(noeud, { surface, actif, agit }) {
  let depart = null;
  const oublie = () => { depart = null; };
  noeud.addEventListener("pointerdown", (ev) => {
    oublie();
    if (!actif()) return;
    const cible = ev && ev.target;
    if (!cible || typeof cible.closest !== "function") return;
    if (cible.closest('[data-glissable="true"]')) return;   /* c'est un glisser */
    if (!cible.closest(surface)) return;
    depart = { x: ev.clientX, y: ev.clientY };
  });
  noeud.addEventListener("pointercancel", oublie);
  noeud.addEventListener("pointerup", (ev) => {
    if (!depart) return;
    const dx = ev.clientX - depart.x;
    const dy = ev.clientY - depart.y;
    oublie();
    /* ⛔ ET IL DOIT ÊTRE FRANCHEMENT HORIZONTAL : sur un écran qui défile, un geste
       ambigu appartient au défilement, jamais à nous. */
    if (Math.abs(dx) < SEUIL_BALAYAGE || Math.abs(dx) <= Math.abs(dy)) return;
    /* ⭐ vers la GAUCHE = la SUITE, la convention du téléphone : on pousse ce qu'on
       regarde hors de l'écran pour faire venir la suite. */
    agit(dx < 0 ? 1 : -1);
  });
}

/** Un tuner — chevron au repos, flèche circulaire au survol *(la feuille le peint)*,
 *  et la molette le fait tourner. ⚖️ Eric, 18/09 : *« le chevron devient un bouton
 *  tuner avec une flèche circulaire »* · *« hover avec souris le déclenche »*.
 *  ⛔ LA MOLETTE S'AJOUTE, elle ne remplace rien : le tuner se TAPE toujours. */
function tuner(sens, options) {
  const b = bouton("sac-tuner", "", sens < 0 ? "Previous section" : "Next section",
    () => options.surTourner && options.surTourner(sens));
  b.dataset.organe = sens < 0 ? "tuner-g" : "tuner-d";
  b.dataset.sens = sens < 0 ? "gauche" : "droite";
  /* ⛔ `passive: false` — sans lui le navigateur refuse le `preventDefault`, et la
     page défilerait DERRIÈRE la roue pendant qu'on la tourne. */
  b.addEventListener("wheel", (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surTourner) options.surTourner((ev && ev.deltaY < 0) ? -1 : 1);
  }, { passive: false });
  return b;
}

/** Une case de la grille — vide elle attend, occupée elle porte le jeton.
 *  ⭐ LE CORPS DU JETON VIENT DE SON ORGANE (`jeton-objet.mjs`), celui de R. */
function case_(id, objet, options) {
  const c = el("div", "sac-case");
  c.dataset.organe = id;
  /* ⚖️ LA MOLETTE SUR LA GRILLE TOURNE LA PAGE — Eric, 18/09 : *« plus de place, ça
     va dans la page suivante… voire ça crée une page supplémentaire si besoin »*,
     donc une section a des pages et il faut pouvoir les atteindre.
     ⭐ C'EST L'IDIOME DU TUNER, celui qu'Eric a demandé pour la roue : *« utiliser le
     scroll de la souris peut aider le défilement »*. La roue tourne les SECTIONS, la
     grille tourne les PAGES — deux surfaces, deux sujets, le même geste.
     ⏳ ET LE GESTE TACTILE N'EST PAS TRANCHÉ : à la souris on y est, au doigt il
     manque un balayage. ⛔ Je ne l'invente pas — question posée à Eric. */
  c.addEventListener("wheel", (ev) => {
    if (!options.pages || options.pages < 2) return;
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surPage) options.surPage((ev && ev.deltaY < 0) ? -1 : 1);
  }, { passive: false });
  if (!objet) {
    c.dataset.creneau = id;
    c.dataset.vise = "false";
    c.setAttribute("aria-label", "Empty");
    return c;
  }
  c.dataset.occupe = "oui";
  c.append(...corpsDuJeton(objet));
  c.setAttribute("aria-label", motDuJeton(objet));
  /* ⛔ `armerJeton` NE VOIT PAS LE CLIC DROIT (il ne s'arme que sur le bouton 0) :
     le `contextmenu` se pose donc à côté, sur le même nœud — comme sur R. */
  const ouvrirLaFiche = (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surJeton) options.surJeton(objet.index);
  };
  c.addEventListener("contextmenu", ouvrirLaFiche);
  /* ⚖️ VERROUILLÉ, IL NE SE LÈVE PAS — Eric, 18/09 : *« l'item reste collé à son
     collecteur, ne bouge pas »*. ⛔ Le glisser n'est pas ARMÉ : pas de fantôme, pas
     de cible qui s'allume, rien qui promette un dépôt qui sera refusé.
     ⭐ MAIS IL S'OUVRE TOUJOURS : c'est dans sa fiche qu'on le déverrouille, sans
     quoi le verrou serait une impasse. */
  if (objet.locked === true) {
    c.dataset.verrouille = "oui";
    c.addEventListener("click", ouvrirLaFiche);
  } else {
    glisserDuSac(c, objet.index, options, (creneau) => {
      if (creneau === "collecteur") { if (options.surCollecte) options.surCollecte(objet.index); }
      else if (options.surPlacer) options.surPlacer(objet.index, creneau);
    });
  }
  return c;
}

/** Le collecteur d'envoi — UN jeton (loi du 29/08), et il ne retient qu'UN objet :
 *  Eric, 16/09 — *« un item dans le collecteur, pas 2 ; si on veut plus c'est un
 *  Tally »*. Plein, il cesse d'être une cible : un second dépôt ne fait rien.
 *  ⭐ IL PORTE LA CLASSE DE R (`gear-collecteur`), pas une copie de son habit : le
 *  creux, le relief, le liseré d'info quand il retient — tout vient de là.
 *  ⏳ DETTE DE NOM, ET ELLE EST NOMMÉE : `gear-collecteur` dit encore l'écran qui
 *  l'a porté le premier. Le jour où Wares le prendra — il est au programme — il
 *  descendra dans un organe au nom neutre, comme l'interrupteur et le jeton. */
function collecteur(options, retenu) {
  const c = el("div", "gear-collecteur");
  c.dataset.organe = "collecteur";
  if (!retenu) { c.dataset.creneau = "collecteur"; c.dataset.vise = "false"; }
  c.dataset.compte = String(retenu ? 1 : 0);
  if (!retenu) {
    c.append(el("span", "gear-nom", "Send collector"));
    c.setAttribute("aria-label", "Send collector — empty");
    return c;
  }
  /* ⚖️ PLEIN, IL PORTE L'OBJET LUI-MÊME — Eric, 16/09 au soir : *« lorsqu'un token va
     dans le collecteur, il ne doit pas rester à sa place initiale »*. ⛔ MAIS PAS SA
     BANDE : *« il n'y a pas de token dans le collecteur, juste le nom »*. */
  c.dataset.occupe = "oui";
  const objet = el("span", "jeton-nom", retenu.nom);
  if (retenu.qte > 1) objet.append(" ", el("span", "gear-qte", `×${retenu.qte}`));
  c.append(objet);
  c.setAttribute("aria-label", `Send collector — ${retenu.nom}`);
  /* ⚖️ ET IL EN RESSORT PAR LE MÊME GESTE QU'IL Y EST ENTRÉ — Eric, 16/09 au soir :
     *« un token dans le collecteur doit pouvoir en ressortir »*. ⛔ Un dépôt sur le
     collecteur lui-même ne fait rien : il est déjà là. */
  const ouvrirLaFiche = (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surJeton) options.surJeton(retenu.index);
  };
  c.addEventListener("contextmenu", ouvrirLaFiche);
  glisserDuSac(c, retenu.index, options, (creneau) => {
    if (creneau === "collecteur") return;       /* il est déjà là */
    if (options.surPlacer) options.surPlacer(retenu.index, creneau);
  });
  return c;
}

/* ══ L'ÉCRAN ══════════════════════════════════════════════════════════════ */

/** @param {object} options
 *   · `sections` : `[{ nom, fige?, renommable?, dehors? }]` — celles que le joueur a
 *     créées, plus celles qui sont là d'entrée de jeu (`fige` : pas supprimable ·
 *     `renommable: false` : pas renommable · `dehors` : liseré doré, hors du sac) ;
 *   · `section`  : l'index de celle qu'on regarde ;
 *   · `edition`  : la roue est-elle en mode édition (le bouton `sections`) ;
 *   · `renommage`: le champ est-il ouvert sur la boîte regardée (la poignée `/`) ;
 *   · `objets`   : les douze places, `null` pour une case vide ;
 *   · `poids`    : `{ gear, backpack, encombrement }`, déjà mis en mots ;
 *   · `compteurs`: `{ tally, "party-tally" }` — ce que chaque parchemin porte ;
 *   · `page` / `pages` : la fraction déjà en mots, et le NOMBRE de pages — la
 *     molette ET le balayage ne tournent que s'il y en a plus d'une ;
 *   · les gestes : `surTourner`, `surSection`, `surJeton`, `surTrier`,
 *     `surSections`, `surAjouter`, `surRenommer`, `surSupprimer`, `surEditer`, `surPage`,
 *     `surCollecte`, `surPlacer`, `surDrop`, `surDestination`, `surPorte`.
 *  @returns {{noeud: HTMLElement}} */
export function construireLeSac(options = {}) {
  /* 🔴 `dalle-simple` — LE VOILE D'UN RANG B, ET J'AVAIS PRIS CELUI DE R. Eric,
     18/09, en regardant l'écran en ligne : *« la dalle de fond 35 % de voile
     pfffff »*.
     ⛔ CE QUE J'AVAIS LU, ET POURQUOI C'ÉTAIT FAUX : `cadre-voile-du-fond` (26/08)
     écrit *« la DALLE = 50 % »* — j'ai lu le mot « dalle » sans regarder DE QUELLE
     dalle il parle. Les 50 % sont ceux de la dalle d'un écran de PARCOURS ; le sac
     est un rang B, posé DANS la dalle de R, donc il relève de la ligne du dessous :
     **35 %, le voile des blocs intérieurs**.
     ⭐ ET LE TÉMOIN EST DANS LE DÉPÔT : `.parcours-guide` — « la dalle du rang B
     qui rend Species, Inheritance et Class » (`tests/dalle-du-rang.test.mjs`) —
     porte `dalle-simple`. Une dalle ne peint pas sa matière : elle porte la classe
     qui la lui donne, et le rang décide de la classe.
     ⚠️ J'avais d'abord peint un `--surface` OPAQUE, puis copié `dalle-intermediaire`
     « parce que R l'a ». Les deux fautes sont la même : copier un voisin au lieu de
     lire la loi de son propre rang. */
  const noeud = el("section", "sac dalle-simple");
  noeud.dataset.ecran = "SB3.1";
  /* ⭐ LE MODE VIT SUR LA DALLE, PAS DANS CINQ ORGANES : un seul attribut, et la
     roue, les deux outils et les tuners s'y accordent par la feuille. Un état
     recopié sur chaque organe diverge au premier ajout. */
  const edition = options.edition === true;
  noeud.dataset.mode = edition ? "edition" : "repos";

  const feuille = el("style");
  feuille.dataset.fhpc = "sac";
  feuille.textContent = feuilleDesCotesSac();
  noeud.append(feuille);

  /* ⭐ LES DEUX BALAYAGES ÉCOUTENT SUR LA DALLE, PAS SUR CHAQUE ORGANE : douze
     écouteurs pour un seul geste, c'est douze occasions d'en oublier un. La
     délégation lit la cible, et c'est ELLE qui dit de quel sujet il s'agit. */
  balayage(noeud, { surface: ".sac-case",
    actif: () => options.pages > 1,
    agit: (sens) => options.surPage && options.surPage(sens) });
  balayage(noeud, { surface: ".sac-roue",
    actif: () => (options.sections || []).length > 1,
    agit: (sens) => options.surTourner && options.surTourner(sens) });

  /* ⛔ LES TUNERS SONT POSÉS SUR LA DALLE, pas dans la roue : la table les
     déclare `dans: "ROUE"` pour dire qu'ils LUI APPARTIENNENT — un voyant dans
     un bouton, la seule inclusion admise — mais au DOM ils sont frères d'elle,
     sinon leur cible déborderait de sa boîte. */
  const r = roue(options);
  noeud.append(r, tuner(-1, options), tuner(1, options));

  /* ⭐ LA BOÎTE SOUS LE VISEUR — celle dont parlent les deux poignées. ⛔ `undefined`
     quand le viseur est sur le `+` : la liste des sections ne le porte pas, et c'est
     par cette forme-là que les poignées savent se taire, pas par un test de plus. */
  const sectionsVues = options.sections || [];
  /* ⛔ ET ON NE BORNE PAS L'INDEX : borné, le viseur posé sur le `+` retombait sur la
     DERNIÈRE section, et les deux poignées paraissaient en proposant de renommer une
     boîte qu'on ne regardait pas. ⭐ Hors liste = `undefined`, et les poignées se
     taisent par la forme des données, pas par un test de plus. */
  const figee = sectionsVues[Math.max(0, options.section | 0)];

  /* ⚖️ LES DEUX POIGNÉES DU MODE ÉDITION — Eric, 2026-09-19 : *« dans le mode edit
     mettre un x (carré 40 × 40 à gauche, À CHEVAL) et un / (carré 40 × 40 à droite)
     de la boîte sélectionnée : on peut l'éditer ou l'effacer. Le swipe et les
     chevrons permettent de naviguer. »*
     ⭐ À CHEVAL, ET C'EST LE MOT QUI COMPTE : elles sont centrées sur les deux arêtes
     du cran dominant, donc à moitié dessus. Elles disent ainsi de QUELLE boîte elles
     parlent — posées à côté, elles auraient pu désigner la voisine.
     ⛔ ELLES NE SONT PAS DES ORGANES DE LA ROUE : la roue défile, elles non. Elles
     restent accrochées au VISEUR, qui ne bouge jamais.
     ⛔ ET ELLES NE PARAISSENT PAS SUR LE `+` : il n'y a rien à renommer ni à effacer
     dans une place qui n'existe pas encore. ⭐ Rien à écrire pour ça — la liste des
     sections ne porte pas le `+`, donc `figee` est absente quand le viseur est
     dessus. Un cas qui se règle par la forme des données ne se règle pas deux fois. */
  if (edition && figee) {
    const effacer = bouton("sac-poignee", "×", "Delete this section",
      () => options.surSupprimer && options.surSupprimer());
    effacer.dataset.organe = "effacer";
    if (figee.fige === true) effacer.disabled = true;
    const editer = bouton("sac-poignee", "/", "Rename this section",
      () => options.surEditer && options.surEditer());
    editer.dataset.organe = "editer";
    if (figee.renommable === false) editer.disabled = true;
    noeud.append(effacer, editer);
  }

  /* ⚖️ LES DEUX OUTILS — Eric, 18/09 : *« un petit bouton 40 × 40 à droite du titre
     de section qui ressemble à un cadrillage ; un autre à gauche qui fait un
     rangement local »*.
     ⭐ ET LE GAUCHE CHANGE DE MÉTIER EN ÉDITION : trier une section pendant qu'on
     édite la LISTE des sections n'a pas de sens, et sa place est la seule libre.
     Il devient le `−` — *« le bouton − supprime »*. Le droit, lui, ne bouge pas :
     c'est l'interrupteur du mode, et un interrupteur qui se déplace n'en est plus
     un. Il s'allume (`data-on`), comme les bascules de X1. */
  /* ⚖️ DES MOTS, PLUS DES GLYPHES — Eric, 19/09 : *« le bouton d'édition est trop
     grossier ; je préfère un carré vert simple : edit / sections. Et un autre bouton
     classique vert : Sort. »*
     ⛔ LES DEUX GLYPHES SONT MORTS AVEC EUX : un cadrillage et une flèche de tri ne
     disaient pas assez ce qu'ils font. ⭐ Et les deux boutons reprennent `gear-porte`,
     la famille des boutons à verbe — ⛔ pas une troisième famille à habiller. Le
     liseré dit le verbe (§6), et Eric les veut VERTS : on agit. */
  /* ⛔ `Sort` RESTE `Sort`, DANS LES DEUX MODES — Eric, 19/09, a sorti la suppression
     de cette place en lui donnant la sienne : *« un x (carré 40 × 40 à gauche, à
     cheval) et un / (carré 40 × 40 à droite) de la boîte sélectionnée »*.
     ⭐ Un outil qui change de métier selon le mode est un outil qu'on relit à chaque
     fois. Celui-ci ne change plus. */
  const trier = bouton("bouton gear-porte sac-outil", "Sort", "Sort this section",
    () => options.surTrier && options.surTrier());
  trier.dataset.organe = "trier";
  trier.dataset.porte = "trier";
  /* ⭐ LE CARRÉ PORTE SON MOT SUR DEUX ÉTAGES — c'est ce qu'Eric a dessiné : `edit`
     au-dessus de `sections`. ⛔ Le retour à la ligne n'est PAS dans le texte : deux
     nœuds, sinon un `\n` se retrouverait dans l'`aria-label`. */
  /* ⚖️ *« carré vert = bouton classique »* — Eric, 19/09, en tranchant sa propre
     phrase de la veille. ⭐ Les deux outils sont donc du MÊME gabarit, le PETIT, et
     le mot « carré » désignait le vert, pas la forme.
     📏 ET C'EST LA MESURE QUI A RENDU CE MOT NÉCESSAIRE : mis à 44 de large, ce
     bouton rendait quand même 77 — la famille impose `min-width: var(--bouton-petit)`
     sous un sélecteur à (0,3,1), et il SORTAIT de la dalle. Le plan lui donne
     maintenant ses 77, et la rangée s'est redisposée autour. */
  const sections = bouton("bouton gear-porte sac-outil", "",
    edition ? "Done editing sections" : "Edit sections",
    () => options.surSections && options.surSections());
  sections.append(el("span", "sac-outil-etage", edition ? "done" : "edit"),
                  el("span", "sac-outil-etage", "sections"));
  sections.dataset.organe = "sections";
  sections.dataset.porte = "sections";
  sections.dataset.on = edition ? "true" : "false";
  sections.setAttribute("aria-pressed", edition ? "true" : "false");
  noeud.append(trier, sections);

  /* ⚖️ QUATRE LIGNES DE POIDS — LA SOURCE DU CHAPITRE (16/09) : *« l'encart passe
     donc de trois à quatre lignes, sur R et sur B1 »* — SELF · BACKPACK · TOTAL ·
     OTHER. Eric, 18/09, nomme les trois premières *« Gear / Backpack / Encumbrance
     = (Gear + Backpack) »*, puis tranche la quatrième : *« other storage ne rentre
     pas dans encumbrance »*. ⭐ C'est parce qu'il NE COMPTE PAS qu'il doit se lire :
     sans sa ligne, un objet rangé à la remise disparaît de l'écran sans qu'un mot
     dise où il est passé.
     ⛔ CE SONT DES VOYANTS : on les lit, on ne les tape pas. */
  const p = options.poids || {};
  const total = el("p", "sac-poids", p.encombrement || "");
  total.dataset.organe = "poids-total";
  /* ⭐ LE DÉTAIL EST UNE LIGNE À TROIS PARTS, et chacune se centre dans la sienne :
     Eric écrit *« Gear xxxx  Backpack xxxx  other xxxx (centrés) »*. ⛔ Trois nœuds,
     pas une chaîne avec des espaces — des espaces ne se centrent pas. */
  const detail = el("p", "sac-poids");
  detail.dataset.organe = "poids-detail";
  /* ⚖️ CHAQUE PART SUR DEUX LIGNES — croquis d'Eric, 19/09 : *« GEAR : X / 5 ITEMS »*,
     *« BACKPACK X / 22 ITEMS »*, *« OTHER X / 7 ITEMS »*. ⭐ Le compte d'objets quitte
     le bout de la ligne pour rejoindre le poids qu'il accompagne : chaque part dit
     désormais SON poids et SON compte, au lieu d'un seul compte pour tout le sac.
     ⛔ Deux nœuds par part, pas un `\n` : un saut de ligne dans le texte finirait
     dans l'`aria-label`. */
  for (const part of [p.gear, p.backpack, p.autre]) {
    const n = el("span", "sac-poids-part");
    n.append(el("span", "sac-poids-mesure", (part && part.poids) || ""),
             el("span", "sac-poids-compte", (part && part.compte) || ""));
    detail.append(n);
  }
  noeud.append(total, detail);

  /* ⚖️ LE COMPTE ET LA PAGE ENCADRENT CE DÉTAIL — Eric, 19/09 : *« si tu mets les
     pages et le nombre d'items au même niveau que la deuxième ligne de
     l'encumbrance »*. ⭐ Trois mesures du même sac, sur une seule ligne, lues d'un
     regard — au lieu d'une rangée de plus sous la grille. ⛔ Deux voyants, pas deux
     contrôles : on ne tourne pas la page en tapant la fraction (le balayage et la
     molette le font). */
  /* ⛔ NI COMPTE GLOBAL NI COMPTEUR DE PAGES — Eric, 19/09 : *« j'ai mis le nombre
     d'items sous les Gear, Back, Other »* · *« inutile de compter les pages »*.
     ⭐ Le compte du sac EST « Backpack 22 items » : un chiffre écrit deux fois diverge
     au premier réglage. Ce que la source du chapitre demandait (*« le compte total à
     gauche »*) est donc tenu, et mieux — trois comptes au lieu d'un.
     ⭐ ET LES PAGES EXISTENT TOUJOURS : la grille déborde, le balayage et la molette la
     tournent. C'est le COMPTEUR qui s'en va, pas la pagination. */

  /* ⭐ UN OBJET RETENU A QUITTÉ SA CASE, et on le retire ICI plutôt que de demander
     à la case de se taire — Eric, 16/09 : *« il doit quitter l'emplacement et rester
     dans le collecteur »*. La place redevient vide, donc une CIBLE, sans qu'aucune
     règle d'affichage ait à connaître la collecte. */
  const objets = options.objets || [];
  const retenu = objets.find((o) => o && o.index === options.retenu) || null;
  for (let r = 0; r < RANGS_GRILLE; r += 1) {
    for (let c = 0; c < COLS_GRILLE; c += 1) {
      const o = objets[r * COLS_GRILLE + c] || null;
      noeud.append(case_(`case-${r + 1}-${c + 1}`, o && o === retenu ? null : o, options));
    }
  }

  noeud.append(collecteur(options, retenu));

  /* 🔴 LES TROIS ORGANES D'ÉCHANGE SONT DES IMAGES, ET J'AVAIS LIVRÉ TROIS
     RECTANGLES NUS — Eric, 18/09, en regardant l'écran en ligne : *« les images de
     la bourse, des Tally »*.
     ⭐ ELLES EXISTENT DÉJÀ, ET DEPUIS LE 16/09 : `--icone-bourse`,
     `--icone-parchemin` et `--icone-parchemin-party` sont trois `.webp` du dépôt,
     qu'Eric a lui-même déposées. ⛔ On ne les redessine pas, et on ne recopie pas
     leur habit : les trois boutons REPRENNENT `gear-bouton`, la classe de R, qui
     porte déjà l'image, l'opacité du tally vide (`--organe-eteint`) et l'encre
     fixe des astres. Une seconde famille (`.sac-echange`) était un habit recopié
     — et deux habits divergent au premier réglage.
     ⭐ C'est la quatrième fois que la doctrine d'organe s'applique dans ce lot,
     après l'interrupteur, les chevrons de Destiny et le jeton.
     📌 `data-compte` porte l'état du parchemin : à `"0"` il s'efface (Eric, 16/09 :
     le tally vide ne s'entoure pas, il RECULE). */
  const compteurs = options.compteurs || {};
  for (const [id, mot] of [["party-tally", "Party Tally"], ["tally", "Tally"], ["purse", "Purse"]]) {
    const b = bouton("gear-bouton", "", mot, () => options.surPorte && options.surPorte(id));
    b.dataset.organe = id;
    if (id !== "purse") b.dataset.compte = String(compteurs[id] || 0);
    noeud.append(b);
  }
  /* ⛔ ET PAS DE BOUTON `party inventory` DANS CETTE RANGÉE — Eric l'a demandé le
     19/09 puis retiré dans la même heure : *« stop pour party inventory le bouton ;
     pour la SECTION faut le faire »*. ⭐ Et c'est cohérent avec sa propre définition —
     *« imagine le party inventory comme un autre backpack »* : on y entre par un CRAN
     de la roue, comme dans n'importe quelle autre section. Deux portes pour un seul
     lieu, c'est une porte de trop. */

  /* ⛔ PAS DE BOUTON `Drop` — Eric, 2026-09-19 : *« le bouton drop est inutile »*.
     ⚠️ ET LA SOURCE DU CHAPITRE LE PORTE, je le signale plutôt que de le taire : elle
     range `DROP` parmi les organes de B1 et le définit — *« sort l'objet du conteneur,
     sur place »*. ⭐ Mais l'écran a changé depuis : le `Send to` porte `Gear` parmi ses
     destinations, donc sortir un objet du sac se fait DÉJÀ, par le même geste que tout
     le reste. Un second bouton pour un verbe que le dropdown tient est un bouton de
     trop. ⏳ L'artefact est à mettre à jour. */

  const envoi = el("div", "sac-destination");
  envoi.dataset.organe = "send-vers";
  const s = el("select", "pipeline-dropdown");
  s.setAttribute("aria-label", "Send to");
  for (const d of options.destinations || []) {
    const opt = el("option", null, d.mot);
    opt.value = d.valeur;
    if (!d.actif) opt.disabled = true;
    if (d.valeur === options.destination) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => options.surDestination && options.surDestination(s.value));
  envoi.append(s);
  noeud.append(envoi);

  /* ⚖️ LA BARRE DU BAS EST CELLE DE R, ORGANE COMPRIS — Eric, 18/09 : *« et ici on
     veut le livre et le ? »*, puis *« ce sont des petits boutons »*.
     ⛔ ET ELLE CORRIGE UNE NON-CONFORMITÉ DE MON PREMIER JET : mes portes faisaient
     105 × 40 (le gabarit MOYEN) quand celles de R font **77 × 44**, le PETIT. Trois
     portes du même chapitre, au même endroit, ne peuvent pas avoir deux tailles :
     un joueur qui passe de R au sac verrait la rangée bouger sous lui.
     ⭐ ELLES REPRENNENT `gear-porte`, LA CLASSE DE R — pas une copie de son habit :
     la même, donc les mêmes cotes et les mêmes teintes par construction. Le liseré
     dit le verbe (§6) : bleu on navigue, vert on agit — `Send` est le seul à porter
     une conséquence, et c'est la règle d'Eric du 16/09.
     ⏳ DETTE DE NOM, ET ELLE EST NOMMÉE : `gear-porte` dit encore l'écran qui l'a
     portée la première. Le jour où Wares la prendra — il est au programme — elle
     descendra dans un organe au nom neutre, comme l'interrupteur et le jeton. */
  /* ⭐ LA RANGÉE DU BAS EST UN ORGANE, comme sur R : elle porte `data-rangee`, et
     c'est LUI qui donne au livre et au `?` leur habit — il est déclaré pour un
     enfant direct d'une rangée. ⛔ Les poser à même la dalle les laissait nus :
     un disque blanc au lieu d'un livre.

     🔴 ET AUCUN DE SES ENFANTS NE PORTE `data-organe` — C'EST LA FAUTE QU'ERIC A
     VUE, ET ELLE ÉTAIT DÉJÀ ÉCRITE DANS `shell.css`. Eric, 18/09 : *« le livre et
     le ? qui sont mal centrés »*.
     ⛔ CE QUI SE PASSAIT : `.sac [data-organe]` pose `position: absolute`, j'avais
     donc écrit `.sac-rangee [data-organe] { position: static }` pour rendre les
     cinq boutons à la grille. Les deux bornes en font partie — et `shell.css:7017`
     dit en toutes lettres pourquoi c'est mortel : *« `relative`, JAMAIS `static` —
     et ça a coûté une livraison. Ces deux bornes portent leur cercle en `::before`
     ABSOLU. Passées en `static`, elles cessent d'être son bloc conteneur : le
     cercle va s'ancrer sur l'ancêtre positionné le plus proche et se dessine À CÔTÉ
     du glyphe. »*
     📏 MESURÉ AU NAVIGATEUR AVANT DE CORRIGER : le `::before` du livre rendait
     `left: 11px` dans une rangée de 367 — soit son cercle collé au bord GAUCHE de
     la rangée — et celui du `?` `left: 334px`, collé au bord DROIT. Les deux
     cercles étaient à ~300 blg de leur glyphe.
     ⛔ ET POURQUOI MA VÉRIFICATION D'HIER NE L'A PAS VU : j'ai mesuré les BOÎTES
     (44 × 44, colonnes 44 / 279 / 44) et conclu « identique à R ». Les boîtes
     étaient identiques ; c'est le DESSIN qui s'était décroché. La même feuille le
     dit, deux lignes plus bas : *« une mesure de POSITION ne voit pas un dessin qui
     se décroche »*.
     ⭐ LA PARADE EST DE TUER LA CAUSE, PAS DE POSER UNE EXCEPTION : R ne marque
     AUCUN enfant de sa rangée avec `data-organe` — ses portes portent `data-porte`,
     ses bornes ne portent rien. Le sac fait pareil, et la règle `.sac-rangee
     [data-organe]` disparaît de `shell.css` avec sa raison d'être. */
  const rangee = el("div", "sac-rangee");
  rangee.dataset.organe = "rangee";
  rangee.dataset.rangee = "sac";
  noeud.append(rangee);
  /* le livre — la classe de R, et sa cible FH WEB est une décision d'Eric : sans
     `livreDe`, il est GRISÉ, jamais muet (NORMES, « chaque conversion demande une
     CIBLE »). C'est exactement ce que fait `gear-ecran.mjs`. */
  const livre = bouton("fiche-livre", undefined, "Rules");
  if (options.livreDe && options.livreDe.href) {
    livre.addEventListener("click", () => { window.open(options.livreDe.href, "_blank", "noopener"); });
  } else {
    livre.disabled = true;
  }
  rangee.append(livre);
  /* 🔴 LES TROIS PORTES VIVENT DANS UN GROUPE, ET CE N'EST PAS UN ENVELOPPEUR DE
     CONFORT — la faute est déjà écrite dans R : la grille du pied a TROIS colonnes
     (borne | 1fr | borne), et c'est `.rangee-majeurs` qui occupe celle du milieu.
     ⛔ Sans lui, la première porte prend tout le `1fr` et les suivantes passent à
     la ligne : Eric l'avait vu sur deux appareils le 16/09. Je l'ai refait ici. */
  const majeurs = el("div", "rangee-majeurs");
  rangee.append(majeurs);
  for (const [id, mot] of [["gear", "Gear"], ["send", "Send"], ["wares", "Wares"]]) {
    const note = id === "send" ? "Send — clears the collector and sends" : mot;
    const b = bouton("bouton gear-porte", mot, note, () => options.surPorte && options.surPorte(id));
    b.dataset.porte = id;
    majeurs.append(b);
  }
  /* ⛔ LE `?` NE S'ÉCRIT PAS ICI, ET C'EST L'ARTEFACT DU CHAPITRE QUI LE DIT :
     *« `.tuto-point`, posé par la coquille, pas par l'écran — rien à écrire ici »*.
     ⭐ La coquille en pose UN par étape (`GUIDES.equipment` existe), le place dans
     la DERNIÈRE rangée (`poserLesBornes`) et lui donne son `data-vu` — l'attribut
     qui décide du parchemin plein ou du cercle creux (§7, 26/08). Le mien n'en
     avait pas : il rendait un cercle nu, et il aurait fait DOUBLON en production.
     ⛔ C'est aussi ce que fait R, qui ne pose que son livre.
     ⚠️ Conséquence assumée : au banc la rangée n'a pas de `?`, parce que le banc
     n'a pas de coquille. Un banc qui en fabriquerait un mentirait dans l'autre
     sens — il montrerait un organe que l'écran ne porte pas. */
  return { noeud };
}
