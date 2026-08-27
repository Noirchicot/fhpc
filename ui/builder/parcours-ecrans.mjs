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
/** Un libellé de porte peut être une chaîne OU `{mot, sous}` — ceci en rend
 *  toujours une phrase.
 *  ⭐ Elle existe parce que DEUX endroits consomment le même libellé : la porte,
 *  qui peut l'afficher sur deux lignes, et le refus (« Not yet: … ») qui les
 *  énumère dans une phrase. ⛔ Sans elle, le refus aurait affiché
 *  « [object Object] » — et il ne l'aurait dit qu'au joueur. */
export function motDe(libelle) {
  if (libelle && typeof libelle === "object") {
    /* « High Elf Lineage », pas « High Elf (lineage) » — Eric, 27/08, en
       dictant le bilan : « si on met tout en mode texte : "High Elf
       Lineage" ». Le sous-titre se capitalise et suit le mot, sans habit. */
    const sous = libelle.sous ? String(libelle.sous) : "";
    return sous ? `${libelle.mot} ${sous[0].toUpperCase()}${sous.slice(1)}` : String(libelle.mot);
  }
  return String(libelle);
}

export function renderGuideSpecifique({ racine, titre, texte, items, labelOf, bilanLabel, resumeDe, refus, acheve, conclu, livreDe, onAction }) {
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
  /* 🔴 LA BANDE D'AIGUILLEUR SE POSE EN BAS — Eric, 2026-08-26 : *« c'est trop
     gros ton aiguilleur, et on le met en bas »* · *« juste au-dessus des
     boutons, on se garde 2/3 lignes en T1 »* · *« mais la présentation me
     plaît »*.

     ⭐ ELLE NE VOYAGE PAS PAR GOÛT : en tête, elle repoussait LA LISTE — le
     joueur lisait une consigne avant de voir ce qu'elle commande. Juste
     au-dessus des boutons, elle est lue **au moment où l'on cherche la
     sortie**, c'est-à-dire quand la question « et maintenant ? » se pose.
     ⚠️ Le cadre bleu reste : c'est la seule chose qu'Eric a explicitement
     gardée. Ce qui change est sa PLACE et sa TAILLE (T1, deux ou trois lignes),
     pas son habit.
     📌 Elle est CONSTRUITE ici, à côté du texte dont elle sort, et POSÉE plus
     bas : séparer les deux évite d'avoir à retrouver `texte` en fin de
     fonction, là où plus rien ne dit d'où il vient. */
  /* 🔴 ET C'EST ELLE QUI DIT « THIS STEP IS SETTLED » — Eric, 2026-08-27 : *« le
     texte vert dégage du coup, l'aiguilleur s'en charge »* · *« c'est lui qui va
     dire this step is settled »*.

     ⭐ ET C'EST COHÉRENT AVEC CE QU'EST UN AIGUILLEUR : il dit *où l'on en est
     et ce qui vient*. Tant qu'il reste à faire, il l'annonce ; quand tout est
     fait, il dit que c'est fait. **Une seule voix pour un seul rôle**, au lieu
     d'un mot en haut et d'un autre, vert, en bas.
     ⛔ CE QUE ÇA RETIRE AU PASSAGE : `.parcours-conclu` posait sa propre saignée
     et son propre paragraphe — deux blocs de plus dans un écran qu'on venait de
     resserrer au pixel. Et son VERT disait « réglé » à un endroit où les voyants
     le disaient déjà. */
  const motGuide = acheve
    ? (conclu
        ? "This step is settled. Change your mind if you want to start it over."
        : "This step is settled. Move on when you are ready — or change your mind and start it over.")
    : String(texte || "");
  const bandeAiguilleur = motGuide.split(/\n{2,}/)
    .map((para) => para.trim())
    .filter((ligne) => ligne.length > 0)
    .map((ligne) => el("p", "guide-mot", [text(ligne)]));

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

    /* 🔴 UNE ÉTAPE VALIDÉE N'A PLUS DE PORTES — Eric, 2026-08-26 : *« quand t'as
       appuyé sur Done, les boutons Lineage et Skill budget disparaissent ; déjà
       c'est un gain de place énorme. Ils reviennent si je fais I changed my
       mind »* — et il a précisé qu'il parlait bien du `Done` DU PIED, celui qui
       devient `Next`, pas de ceux qui vivent DANS Lineage et Skill budget.

       ⛔ ET CE N'EST PAS QU'UN GAIN DE PLACE : ça répare un CHEVAUCHEMENT
       mesuré sur Elf validé. Chaque item écrit son résumé sous son bouton ;
       une fois les trois réglés, les résumés s'allongent et passent PAR-DESSUS
       les boutons restés en place — on lisait « Elven Lineage » à travers
       `Skill budget`, et « …Vigilance skill » superposé à « Size ».

       ⭐ LA RAISON DE FOND EST CELLE DES TROIS VERBES *(NORMES §6)* : une porte
       sert à ALLER RÉGLER quelque chose. Quand tout est réglé, elle n'ouvre plus
       sur une décision — elle ouvre sur un écran qui n'a plus rien à demander.
       Le nom suffit alors à porter le résumé, exactement comme pour un item
       `sansChoix`, qui n'a jamais eu de porte.
       ⚠️ ET ELLES REVIENNENT SEULES : `I changed my mind` défait la validation,
       donc `acheve` retombe et les portes se reconstruisent. Rien à câbler pour
       le retour — c'est la même expression qui décide dans les deux sens. */
    if (item.sansChoix || acheve) {
      /* ⛔ `motDe`, PAS le libellé brut — depuis le 27/08 un `labelOf` peut
         rendre un OBJET {mot, sous} (la résolution d'une porte). Cette
         branche le passait tel quel à text() : « [object Object] » à
         l'écran, en production, vu par Eric sur son iPhone. La branche
         PORTE le dépliait déjà ; celle-ci l'avait raté — un libellé qui
         change de forme doit être déplié PARTOUT où il s'affiche. */
      const motBilan = bilanLabel ? bilanLabel(item) : null;
      tete.append(el("span", "parcours-item-mot", [text(motBilan || motDe(labelOf ? labelOf(item) : item.path))]));
      ligne.dataset.sansChoix = "true";
    } else {
      /* 🔴 UNE PORTE PEUT PORTER DEUX LIGNES — Eric, 2026-08-27 : *« Lineage
         devient High Elf en T2, avec italique T1 en dessous "lineage" »*.
         ⭐ `labelOf` rend soit une CHAÎNE (la question : « Lineage »), soit un
         couple `{mot, sous}` (la réponse et sa question : « High Elf » /
         *lineage*). L'écran ne DÉCIDE pas laquelle : c'est l'appelant qui sait
         si le choix est posé, et il le dit par la forme de ce qu'il rend.
         ⚠️ ⛔ ET L'ÉTIQUETTE ACCESSIBLE RESTE UNE PHRASE : un lecteur d'écran
         doit entendre « High Elf — lineage — done », pas deux nœuds côte à côte
         dont l'ordre ne dit rien. C'est `motDe()` qui l'aplatit. */
      /* 🔴 LA RÉPONSE NE PARAÎT QUE SI L'ITEM EST CONFIRMÉ — défaut mesuré le
         2026-08-27, sur la capture : les portes annonçaient « High Elf » et
         « spent » pendant que **les voyants à leur gauche étaient vides**. Deux
         signaux contradictoires sur la même ligne.

         ⛔ LA CAUSE ÉTAIT UNE CONFUSION DE NOTIONS : l'appelant sait ce qui est
         POSÉ (`answered >= expected`), le voyant dit ce qui est CONFIRMÉ (passé
         par son `Done`). Ce ne sont pas les mêmes états — on peut poser un
         lignage sans valider son écran.
         ⭐ CHACUN SON RÔLE : l'appelant sait QUELLE est la réponse, cet écran
         sait SI elle compte. On aplatit tant qu'elle ne compte pas — la porte
         redit alors sa question, ce qu'elle a toujours fait. */
      const libelleBrut = labelOf ? labelOf(item) : item.path;
      const libelle = item.confirme ? libelleBrut : motDe(libelleBrut).replace(/\s*\([^)]*\)$/, "");
      const porte = bouton("", "parcours-item-porte",
        () => act({ kind: "parcoursItem", racine, path: item.path }));
      if (libelle && typeof libelle === "object") {
        porte.append(el("span", "parcours-item-mot-fort", [text(libelle.mot)]));
        porte.append(el("span", "parcours-item-sous", [text(libelle.sous)]));
      } else {
        porte.append(text(String(libelle)));
      }
      porte.setAttribute("aria-label",
        `${motDe(libelle)} — ${item.confirme ? "done" : "not done yet"}`);
      tete.append(porte);
    }
    ligne.append(tete);

    /* 🔴 SOIT LA PORTE, SOIT LE RÉSUMÉ — JAMAIS LES DEUX. Eric, 2026-08-26 :
       *« avant le dernier Done, pas de texte : tout est derrière les
       boutons »*, en miroir de *« quand t'as appuyé sur Done, les boutons
       disparaissent »*.

       ⭐ C'EST LA RÈGLE QUI EXPLIQUE LE CHEVAUCHEMENT, et pas seulement qui le
       répare : l'écran montrait les DEUX à la fois, donc chaque résumé
       s'allongeait sous un bouton resté en place et finissait par passer
       par-dessus le suivant. Ce n'était pas un défaut de marge — c'était deux
       présentations du même contenu superposées.
       ⭐⭐ Et elle se dit en une phrase : **une porte dit qu'il reste à faire,
       un résumé dit ce qui est fait.** Les deux ne peuvent pas être vrais du
       même item au même instant.

       ⚠️ ⛔ SAUF POUR UN ITEM SANS PORTE, et c'est le seul cas que la règle ne
       couvre pas d'elle-même : `Granted automatically` n'a rien à ouvrir — son
       contenu n'existe QUE dans ce résumé. Le cacher avant validation le
       rendrait **inatteignable**, pas discret. Il garde donc le sien.
       ⏳ Ce qui laisse une question ouverte pour Eric : ce bloc-là porte 369 px
       de contenu dans 78 px de fenêtre (mesuré sur Elf). Le cacher n'est pas la
       réponse ; lui donner une porte, peut-être. */
    const resume = resumeDe ? resumeDe(item) : null;
    if (resume && (acheve || item.sansChoix)) ligne.append(el("div", "parcours-resume", [resume]));
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
  /* La bande d'aiguilleur entre ICI — voir sa note en tête de fonction : après
     la liste, juste avant le pied. */
  for (const mot of bandeAiguilleur) page.append(mot);

  const pied = el("div", "parcours-pied");
  /* 🔴 LE LIVRE TIENT LA GAUCHE DE LA RANGÉE — Eric, 2026-08-27 : *« une fois
     cela fait, tu dois mettre le bouton livre en bas à gauche dans les
     boutons »*.
     ⭐ C'EST LA PAIRE RATIFIÉE LE 26/08, appliquée à ce pied-ci : le livre à
     gauche, le `?` à droite, les boutons centrés entre eux. Identity l'a depuis
     le lot 33 ; cet écran la reçoit à son tour, par le même dessin.
     ⚖️ ET IL N'OUVRE ENCORE RIEN, ce qui est une exception ARGUMENTÉE et non un
     oubli : Eric l'a nommée le 26/08 — *« le livre n'est pas toujours câblé, il
     le sera »* — et le dépôt la pratique déjà dans `catalogue.mjs`, où le livre
     naît `disabled` et se rallume quand sa fiche a de quoi le nourrir.
     ⛔ `disabled`, PAS un bouton muet : un livre qui répond au doigt sans rien
     ouvrir apprend au joueur à ne plus le regarder — c'est exactement ce que la
     norme du `?` interdit, et la raison pour laquelle cette exception est bornée
     à la construction. */
  const livre = el("button", "fiche-livre parcours-livre");
  livre.type = "button";
  /* 🔴 ET IL EST CÂBLÉ — Eric, 2026-08-27 : *« tu peux le câbler directement,
     une fois posé »*. Il ouvre le LORE de ce qu'on regarde, exactement comme le
     livre du catalogue ouvre celui d'une fiche.
     ⚠️ ⛔ MAIS IL RESTE `disabled` QUAND IL N'Y A RIEN À OUVRIR, et ce n'est pas
     une précaution de style : un livre qui répond au doigt sans rien montrer
     apprend au joueur à ne plus le regarder — c'est le défaut que la norme du
     `?` interdit en toutes lettres. **Un organe muet doit avoir l'air muet.**
     ⭐ L'appelant décide : il donne `{titre, texte}`, ou il ne donne rien. Cet
     écran ne va pas chercher le lore — il ne sait même pas ce qu'il montre. */
  livre.setAttribute("aria-label", "Lore");
  if (livreDe && livreDe.texte) {
    livre.addEventListener("click", () => act({
      kind: "popup", titre: livreDe.titre || "Lore", texte: livreDe.texte
    }));
  } else {
    livre.disabled = true;
  }
  pied.append(livre);
  pied.append(bouton("I changed my mind", "parcours-annuler",
    () => act({ kind: "parcoursCancel", racine })));
  /* ⛔ PLUS DE BLOC DE CONCLUSION SÉPARÉ — son texte est passé dans la bande
     d'aiguilleur (voir sa note plus haut). `conclusion()` reste écrite : elle
     sert encore au bilan d'Identity, qui n'a pas d'aiguilleur. */
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
export function renderItem({ racine, item, titre, corps, livreDe, aiguilleur, onAction }) {
  const act = onAction || (() => {});
  const page = el("section", "parcours-item-dalle dalle-intermediaire");
  page.dataset.objet = "dalle";
  page.dataset.item = item && item.path;

  if (titre) page.append(el("h2", "guide-titre", [text(titre)]));
  if (corps) page.append(corps);

  /* ⛔ la saignée d'avant-pied a DÉGAGÉ — Eric, 27/08 : « l'aiguilleur à la
     même distance que dans le niveau B », et le B n'a pas de trait là. Le
     trait + ses marges rendaient 17 px là où le gabarit en veut 12. */
  /* 🔵 L'AVERTISSEMENT EST DEVENU LA BANDE D'AIGUILLEUR — Eric, 2026-08-27 :
     « remplacée par les 3 lignes d'aiguilleur au-dessus des boutons ». Même
     organe que le rang B (`guide-mot`), même place (sous la fenêtre, avant
     le pied), et il garde le mot qui prévient : la règle d'Eric du gabarit
     FF2 — « une ligne de texte peut prévenir le joueur » — vit désormais
     dans l'aiguilleur, pas dans un organe à part. */
  /* le mot peut être PRÉCISÉ par l'écran — Eric, 27/08 : « l'aiguilleur
     peut préciser cela » (le geste tap-info du lignage). Le mot de
     prévention reste le socle commun. */
  page.append(el("p", "guide-mot", [text(
    aiguilleur || "Leaving this open marks nothing — only Done records the choice."
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
  /* 📖 LE LIVRE, À GAUCHE DE LA RANGÉE — Eric, 2026-08-27 : « il manque le
     livre dans les boutons ». Le nœud est posé ICI, la coquille le range
     (`poserLaSortie` prepend `:scope > .livre-de-sortie`) — le même détour
     que partout : l'écran ne fabrique jamais la rangée (garde 17). */
  const livre = el("button", "fiche-livre livre-de-sortie");
  livre.type = "button";
  livre.setAttribute("aria-label", "Lore");
  if (livreDe && livreDe.texte) {
    livre.addEventListener("click", () => act({ kind: "popup", titre: livreDe.titre || "Lore", texte: livreDe.texte }));
  } else {
    livre.disabled = true;
  }
  hote.append(livre);
  page.append(hote);
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
