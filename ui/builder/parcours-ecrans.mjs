/* ══ LES QUATRE ÉCRANS DU PARCOURS ══════════════════════════════════════════
   📐 Spec d'Eric, 2026-08-19 — vault `FH-WEB/FHPC/FHPCv2 parcours d'etape.md`.
   Le même parcours pour Species, Class et Inheritance.

     ① CATALOGUE  — le guide général en tête du rail, puis les fiches.  (F2)
     ② GUIDE      — le texte, puis un item par choix, chacun un voyant. (FF2)
     ③ ITEM       — une seule chose à valider.                          (FF2)
     ④ BILAN      — ce qui est acquis, et l'invitation à continuer.     (FF2)

   ⛔ CE FICHIER NE DÉCIDE RIEN. L'état vient de `parcours.mjs`, le contenu d'un
   item vient de l'écran qui le possède (Species sait dessiner un lignage, pas
   ce fichier-ci). Ici on ne fait que la CHARPENTE commune — celle qui devra
   être identique aux trois étapes, sinon elles divergeront.

   ⛔ AUCUN `innerHTML` (deux gardes du dépôt le refusent), et aucun nom
   d'étape en dur : tout passe par `racine`. */

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function bouton(libelle, className, onClick) {
  const b = el("button", className, [text(libelle)]);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

/** Le filet qui saigne — même organe que le chapeau de chapitre (F3/FF3). */
function saignee() {
  const filet = el("hr", "saignee");
  filet.setAttribute("aria-hidden", "true");
  return filet;
}

/* ══ ① LE GUIDE GÉNÉRAL — en tête du rail ═══════════════════════════════════
   Eric : *« Tout en haut du menu latéral de species il doit y avoir une carte
   guide, voile 100 %. […] Guide général : juste une carte, rien dessus, on
   scrolle on trouve la race qui va bien et choose. »*

   ⭐ VOILE 100 %, ET C'EST DÉLIBÉRÉ : les dalles du builder sont à 80 %. Une
   page de prose posée sur le dégradé du fond se lit mal — c'est la même raison
   qui a rendu la page de lore opaque.
   ⭐ C'EST UN F1, PAS UN F2 — correction d'Eric, 2026-08-19 : *« le guide
   général des espèces doit être F1 »*. Il vit DANS la colonne des douze
   fiches, il défile avec elles : porter une autre hauteur qu'elles ferait de
   lui une intruse dans une file. Sa hauteur est donc celle d'une fiche
   (`--fiche-h`, 440 px), imposée comme la leur.
   ⚠️ ET IL NE S'AIMANTE TOUJOURS PAS : il n'a pas de `data-snap`, parce que
   l'index d'un cran de rail et celui d'une fiche sont le même entier — une
   carte de plus dans ce compte ferait choisir la mauvaise espèce. Il se lit,
   il se dépasse. C'est la seule chose qui le distingue encore d'une fiche. */
export function renderGuideGeneral({ titre, texte }) {
  const carte = el("section", "guide-general dalle-majeure");
  carte.dataset.objet = "carte";
  if (titre) carte.append(el("h2", "guide-titre", [text(titre)]));
  for (const para of String(texte || "").split(/\n{2,}/)) {
    const ligne = para.trim();
    if (ligne.length > 0) carte.append(el("p", "guide-mot", [text(ligne)]));
  }
  return carte;
}

/* ══ ② LE GUIDE SPÉCIFIQUE — le moyeu ═══════════════════════════════════════
   Eric : *« C'est une dalle FF2 guide qui explique les choix à faire pour
   cette species. Sous le texte une liste. Chaque item contient un bouton lien
   vers un FF2 et un voyant qui s'allume quand le choix est fait. Certains items
   ne nécessitent pas un choix : ils sont listés aussi et illuminés de base. »*

   ⛔ LE `Done` N'EST JAMAIS GRISÉ. *« done lance un message et ne valide pas si
   tout n'est pas coché »* — un bouton mort ne dit pas ce qui manque ; un bouton
   qui répond, si. Le refus s'affiche SOUS la liste, et il NOMME les items.

   ⚠️ LE VOYANT LIT LA SIGNATURE, PAS LE REMPLISSAGE. Un item dont la valeur est
   posée mais que le joueur a quitté par `Back` reste ÉTEINT. C'est la règle du
   19/08, et la seule raison d'être de `build.confirmed`. */
export function renderGuideSpecifique({ racine, titre, texte, items, labelOf, refus, onAction }) {
  const act = onAction || (() => {});
  const page = el("section", "parcours-guide dalle-majeure");
  page.dataset.objet = "dalle";
  page.dataset.racine = racine;

  if (titre) page.append(el("h2", "guide-titre", [text(titre)]));
  for (const para of String(texte || "").split(/\n{2,}/)) {
    const ligne = para.trim();
    if (ligne.length > 0) page.append(el("p", "guide-mot", [text(ligne)]));
  }

  page.append(saignee());

  const liste = el("ul", "parcours-items");
  for (const item of items || []) {
    const ligne = el("li", "parcours-item");
    ligne.dataset.item = item.path;
    ligne.dataset.allume = String(Boolean(item.confirme));

    /* LE VOYANT D'ABORD, LE MOT ENSUITE — on lit l'état avant le nom, comme sur
       une liste de courses cochée. Il est décoratif : l'état est déjà porté par
       `aria-*` sur le bouton, et un lecteur d'écran n'a pas à entendre « point,
       Lineage ». */
    const voyant = el("span", "parcours-voyant", []);
    voyant.setAttribute("aria-hidden", "true");
    ligne.append(voyant);

    /* ⭐ UN ITEM SANS CHOIX N'EST PAS UN BOUTON. Eric veut ces lignes
       « listées aussi et illuminées de base » : il n'y a rien à ouvrir, donc
       rien à cliquer. Un bouton qui ne mène nulle part se paie en confiance. */
    if (item.sansChoix) {
      ligne.append(el("span", "parcours-item-mot", [text(labelOf ? labelOf(item) : item.path)]));
      /* 🔴 PLUS D'ALLUMAGE D'OFFICE — Eric, 2026-08-19 : *« granted
         automatically est une autre ligne, GRISÉE tant qu'on n'a pas choisi le
         lignage ; ensuite le voyant devient vert »*. Une ligne sans choix n'est
         pas forcément acquise : elle peut DÉPENDRE d'un autre item, et c'est
         ce cas-là qui commande. Forcer le vert ici écrasait la dépendance —
         mesuré : la ligne s'allumait avant que le lignage soit posé. */
      ligne.dataset.sansChoix = "true";
    } else {
      const porte = bouton(labelOf ? labelOf(item) : item.path, "parcours-item-porte",
        () => act({ kind: "parcoursItem", racine, path: item.path }));
      porte.setAttribute("aria-describedby", "");
      /* L'état PRONONCÉ, pas seulement peint — un voyant vert ne s'entend pas. */
      porte.setAttribute("aria-label",
        `${labelOf ? labelOf(item) : item.path} — ${item.confirme ? "done" : "not done yet"}`);
      ligne.append(porte);
    }
    liste.append(ligne);
  }
  page.append(liste);

  /* LE REFUS, sous la liste, NOMMÉ. Il n'apparaît qu'après un `Done` refusé :
     annoncer d'avance ce qui manque ferait de la liste un reproche. */
  if (refus) {
    page.append(el("p", "parcours-refus", [text(refus)]));
  }

  const pied = el("div", "parcours-pied");
  pied.append(bouton("I changed my mind", "parcours-annuler",
    () => act({ kind: "parcoursCancel", racine })));
  pied.append(bouton("Done", "parcours-done",
    () => act({ kind: "parcoursDone", racine })));
  page.append(pied);
  return page;
}

/* ══ ③ LA DALLE D'ITEM ══════════════════════════════════════════════════════
   Eric : *« Dalle item c'est du FF2. Il n'y a qu'un élément à valider. Un back
   ou un done en bas de la dalle. »* Et la règle qui commande tout :
   *« Si je fais back sur un item, ça ne valide pas l'item, une ligne de texte
   peut prévenir le joueur. Il faut faire done pour valider un item. »*

   ⭐ LE CORPS VIENT DE L'ÉCRAN QUI POSSÈDE L'ITEM. Ce fichier ne sait pas ce
   qu'est un lignage ; il sait qu'un item a un titre, un corps, et deux portes.

   ⚠️ LA LIGNE D'AVERTISSEMENT EST TOUJOURS LÀ, pas seulement quand on hésite :
   le joueur doit savoir AVANT de cliquer `Back` que ça ne validera rien. */
export function renderItem({ racine, item, titre, corps, onAction }) {
  const act = onAction || (() => {});
  const page = el("section", "parcours-item-dalle dalle-majeure");
  page.dataset.objet = "dalle";
  page.dataset.item = item && item.path;

  if (titre) page.append(el("h2", "guide-titre", [text(titre)]));
  if (corps) page.append(corps);

  page.append(saignee());
  page.append(el("p", "parcours-avertit", [text(
    "Leaving this open marks nothing — only Done records the choice."
  )]));

  /* ⛔ CET ÉCRAN N'ÉCRIT AUCUN BOUTON, ET C'EST UN GARDE QUI ME L'A APPRIS :
     *« UN SEUL retour dans tout ui/, et c'est la coquille qui le pose »* (garde
     17, I.5 + lot 79 §4.1 bis). Un premier jet dessinait sa propre paire ici —
     deux chemins de retour, exactement ce que la loi interdit.

     ⭐ IL DÉCLARE UN HÔTE, et la coquille y dépose SA paire (`poserLaSortie`,
     `[data-sortie-ici]`) : le même mécanisme que le collecteur d'Abilities.
     `BACK` referme l'item sans rien valider, `DONE` le signe — les deux gestes
     vivent dans `pressBack`/`pressDone`, là où l'emboîtement est déjà écrit. */
  const hote = el("div", "parcours-pied");
  hote.dataset.sortieIci = "";
  page.append(hote);
  void act;
  return page;
}

/* ══ ④ LE BILAN ═════════════════════════════════════════════════════════════
   Eric : *« carte de bilan species FF2, plus de menu de species, liste de tout
   ce qui est validé, explique au joueur qu'il peut aller à la suite, bouton
   next. Explique qu'il peut tout remettre en question : I changed my mind. »*

   ⛔ PLUS AUCUN ACCÈS AU MENU DES ESPÈCES — c'est le format FF qui le dit, et
   c'est la seule chose que cet écran a besoin de savoir à ce sujet. */
export function renderBilan({ racine, titre, lignes, onAction }) {
  const act = onAction || (() => {});
  const page = el("section", "parcours-bilan dalle-majeure");
  page.dataset.objet = "dalle";
  page.dataset.racine = racine;

  if (titre) page.append(el("h2", "guide-titre", [text(titre)]));

  const liste = el("dl", "parcours-acquis");
  for (const [mot, valeur] of lignes || []) {
    liste.append(el("dt", null, [text(mot)]));
    liste.append(el("dd", null, [text(valeur)]));
  }
  page.append(liste);

  page.append(saignee());
  page.append(el("p", "guide-mot", [text(
    "This step is settled. Move on when you are ready — or reopen it and start over."
  )]));

  const pied = el("div", "parcours-pied");
  pied.append(bouton("I changed my mind", "parcours-annuler",
    () => act({ kind: "parcoursCancel", racine })));
  pied.append(bouton("Next", "parcours-next", () => act({ kind: "parcoursNext", racine })));
  page.append(pied);
  return page;
}
