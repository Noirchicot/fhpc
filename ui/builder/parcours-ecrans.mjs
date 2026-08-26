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

/* LA CONCLUSION D'UNE ÉTAPE — le filet, puis la phrase, EN VERT.
   Eric, 2026-08-19 : *« mets un petit séparateur au-dessus de : This step is
   settled… (et écris-le en vert) »*, puis *« non, le séparateur NORMAL »*.

   ⭐ C'EST DONC LA SAIGNÉE, PAS LE FILET PÂLE DES TITRES D'ITEMS. Les deux
   existent et disent deux choses : le filet pâle sépare deux LIGNES d'une même
   liste, la saignée sépare deux PARTIES de l'écran. Ce qui vient après n'est
   plus la liste — c'est le verdict sur la liste.

   ⭐ ET LE VERT EST UNE INFORMATION, pas une décoration : c'est la couleur des
   voyants d'items (`--positive`). La phrase dit ce que les voyants disent, en
   toutes lettres — même encre, même sens.

   ⚠️ DEUX PHRASES, PARCE QU'IL Y A DEUX SITUATIONS. Celle d'Eric invite à
   avancer (*« Move on when you are ready »*) et suppose un `Next` sous elle.
   Sur un écran où l'on REVIENT, ce bouton n'existe plus : garder l'invitation
   promettrait une porte absente. On garde donc sa phrase là où elle est vraie,
   et on n'en garde que la moitié qui reste vraie ailleurs.

   🔴 ET CHAQUE MOITIÉ NOMME SON BOUTON, MOT POUR MOT. *« Reopen it »* ne
   désignait rien : aucune porte de cet écran ne s'appelle « Reopen ». La
   phrase et le pied disent maintenant la MÊME chose avec les MÊMES mots —
   « move on » sous `Next`, « change your mind » sous `I changed my mind` —
   parce qu'une consigne qui rebaptise le bouton qu'elle désigne fait chercher
   un troisième bouton. */
function conclusion(peutAvancer) {
  const phrase = peutAvancer
    ? "This step is settled. Move on when you are ready — or change your mind and start it over."
    : "This step is settled. Change your mind if you want to start it over.";
  return [saignee(), el("p", "parcours-conclu", [text(phrase)])];
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
  const carte = el("section", "guide-general dalle-intermediaire");
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
export function renderGuideSpecifique({ racine, titre, texte, items, labelOf, resumeDe, refus, acheve, conclu, onAction }) {
  const act = onAction || (() => {});
  /* 🔴 VOILE 50 % — Eric, 2026-08-26, en montrant cet écran servi : *« tu mets
     la dalle de ça à 50 % »*. ⛔ Pas 35 : il a désigné l'objet et donné le
     nombre dans la même phrase.
     ⭐ C'EST LE MÊME VOILE QUE LA FICHE D'ESPÈCE, et ce n'est pas un hasard :
     les deux sont ce que le joueur LIT longuement. Le 50 est donc le barreau
     de la dalle qu'on lit, pas un barreau vide — NORMES §4 écrivait
     *« 50 % → aucun organe aujourd'hui »*, c'est faux et ça se corrige là.
     🔴 ET C'EST LE CADRE SOUS ELLE QUI REND CE VOILE VISIBLE : tant que
     `.decision-card` peignait, ce 50 % se posait sur de l'opaque et ne montrait
     rien. Les deux changements ne valent QUE l'un avec l'autre. */
  const page = el("section", "parcours-guide dalle-intermediaire");
  page.dataset.objet = "dalle";
  page.dataset.racine = racine;

  if (titre) page.append(el("h2", "guide-titre", [text(titre)]));
  for (const para of String(texte || "").split(/\n{2,}/)) {
    const ligne = para.trim();
    if (ligne.length > 0) page.append(el("p", "guide-mot", [text(ligne)]));
  }

  page.append(saignee());

  /* ══ LA LISTE — Eric, 2026-08-19 ═══════════════════════════════════════
     *« sous lineages (qui est un BOUTON) tu fais apparaître le bilan du
     lineage — le bouton et son voyant sont CENTRÉS, le texte de bilan est en
     dessous et n'est PAS centré. »*

     ⭐ ET LES DEUX ALIGNEMENTS DISENT DEUX CHOSES. Le bouton est un GESTE : on
     le vise, il se centre comme tout ce qui s'actionne ici. Le bilan est de la
     PROSE : elle se lit de gauche à droite, et la centrer casserait le bord
     que l'œil suit. Le même bloc porte donc les deux, et c'est voulu.

     ⛔ « Granted automatically » N'EST PAS UN BOUTON — il n'ouvre rien. Ce qui
     ne dépend ni du lignage ni de la bourse est là DÈS LE DÉBUT ; le reste
     s'écrit quand son choix est signé. */
  const liste = el("ul", "parcours-items");
  for (const item of items || []) {
    const ligne = el("li", "parcours-item");
    ligne.dataset.item = item.path;
    ligne.dataset.allume = String(Boolean(item.confirme));

    const tete = el("div", "parcours-item-tete");
    const voyant = el("span", "parcours-voyant", []);
    voyant.setAttribute("aria-hidden", "true");
    tete.append(voyant);

    if (item.sansChoix) {
      tete.append(el("span", "parcours-item-mot", [text(labelOf ? labelOf(item) : item.path)]));
      ligne.dataset.sansChoix = "true";
    } else {
      const porte = bouton(labelOf ? labelOf(item) : item.path, "parcours-item-porte",
        () => act({ kind: "parcoursItem", racine, path: item.path }));
      porte.setAttribute("aria-label",
        `${labelOf ? labelOf(item) : item.path} — ${item.confirme ? "done" : "not done yet"}`);
      tete.append(porte);
    }
    ligne.append(tete);

    /* LE BILAN DE LA LIGNE, sous son bouton, aligné à gauche. */
    const resume = resumeDe ? resumeDe(item) : null;
    if (resume) ligne.append(el("div", "parcours-resume", [resume]));
    liste.append(ligne);
  }
  page.append(liste);

  if (refus) page.append(el("p", "parcours-refus", [text(refus)]));

  /* ⭐ B0 EST SON PROPRE BILAN — Eric, 2026-08-19 : *« la fenêtre photographiée
     n'a plus de raison d'être »*. L'écran de résumé séparé disparaît : chaque
     ligne porte déjà le sien, et un second écran qui redirait la même chose
     ferait lire deux fois le même texte pour avancer d'un cran. */
  /* ══ LE PIED A TROIS ÉTATS, ET C'EST ERIC QUI LES A DÉCOUPÉS ══════════
     🔴 2026-08-19 : *« il y a une double validation inutile […] par contre
     plus de done ni de next si on revient sur la fiche »*.

       ① IL RESTE À FAIRE   → `Done`, qui REFUSE et nomme ce qui manque.
       ② TOUT EST SIGNÉ     → `Next` a REMPLACÉ `Done` — un clic, pas deux.
       ③ ON EST REVENU ICI  → ni l'un ni l'autre : il n'y a rien à valider.

     ⭐ `Done` NE VALIDE PLUS RIEN, ET C'EST LE POINT. Chaque item porte déjà
     la signature de son propre `Done` ; celui du guide ne faisait que les
     recompter. Il ne lui reste que son seul travail utile : répondre « pas
     encore, il manque ceci » à qui ne sait pas ce qu'il lui reste. Dès que la
     réponse serait « oui », ce n'est plus lui qu'on affiche.

     ⛔ LE `Done` RESTE DONC NON GRISÉ (*« done lance un message et ne valide
     pas si tout n'est pas coché »*) — un bouton mort ne dit pas ce qui manque.

     ⚠️ ET `I changed my mind` NE DISPARAÎT JAMAIS : c'est la seule porte qui
     reste ouverte dans les trois états, celle qui défait. */
  const pied = el("div", "parcours-pied");
  pied.append(bouton("I changed my mind", "parcours-annuler",
    () => act({ kind: "parcoursCancel", racine })));
  if (acheve) page.append(...conclusion(!conclu));
  /* 🔴 TOUJOURS UN SECOND BOUTON À CÔTÉ DE `I changed my mind` — Eric,
     2026-08-26 : *« la bonne chose à faire, toujours un Next à côté de I
     changed my mind »*, capture d'Identity à l'appui, où les deux se font face.

     ⛔ CE QUI MANQUAIT ÉTAIT UN QUATRIÈME ÉTAT, ET IL NE SE VOYAIT PAS. Le code
     traitait `acheve && !conclu` (→ Next) et `!acheve` (→ Done) ; le cas
     `acheve && conclu` — l'étape réglée ET déjà conclue, celui où le joueur
     REVIENT sur un chapitre fini — ne tombait dans aucune branche. Sa rangée ne
     portait donc qu'un seul bouton : celui qui DÉFAIT. La seule porte offerte à
     qui relit une étape achevée était de la démolir.
     ⚠️ Un `else if` sans `else` ne prévient jamais qu'il ne couvre pas tout —
     il rend simplement moins que prévu, et se tait.

     ⭐ LA RÈGLE TIENT MAINTENANT EN UNE PHRASE, ET C'EST CE QUI LA REND SÛRE :
     réglée → on avance (`Next`) ; pas réglée → on règle (`Done`). Deux
     branches, aucun trou possible, et jamais `I changed my mind` tout seul. */
  if (acheve) {
    pied.append(bouton("Next", "parcours-next", () => act({ kind: "parcoursNext", racine })));
  } else {
    pied.append(bouton("Done", "parcours-done", () => act({ kind: "parcoursDone", racine })));
  }
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
  const page = el("section", "parcours-item-dalle dalle-intermediaire");
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
  const page = el("section", "parcours-bilan dalle-intermediaire");
  page.dataset.objet = "dalle";
  page.dataset.racine = racine;

  if (titre) page.append(el("h2", "guide-titre", [text(titre)]));

  const liste = el("dl", "parcours-acquis");
  for (const [mot, valeur] of lignes || []) {
    liste.append(el("dt", null, [text(mot)]));
    liste.append(el("dd", null, [text(valeur)]));
  }
  page.append(liste);

  /* ⚠️ LA MÊME CONCLUSION QUE LE GUIDE, PAR LE MÊME ORGANE. Elle était écrite
     deux fois, à deux endroits — deux copies d'une phrase divergent à la
     première retouche, et celle-ci vient d'en recevoir une (le vert).
     ⭐ ET ELLE INVITE TOUJOURS À AVANCER ICI : Identity n'a pas de parcours,
     sa signature naît de son `Done`, donc cet écran ne s'affiche QUE juste
     après la signature — jamais dans l'état « on est revenu ». */
  page.append(...conclusion(true));

  const pied = el("div", "parcours-pied");
  pied.append(bouton("I changed my mind", "parcours-annuler",
    () => act({ kind: "parcoursCancel", racine })));
  pied.append(bouton("Next", "parcours-next", () => act({ kind: "parcoursNext", racine })));
  page.append(pied);
  return page;
}
