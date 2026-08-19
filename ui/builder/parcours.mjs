/* ══ LE PARCOURS D'UNE ÉTAPE — guide, items, bilan ══════════════════════════
   📐 Spec d'Eric, 2026-08-19, et c'est le même parcours pour Species, Class et
   Inheritance (*« Inheritance va se construire comme skills et species »*) :

     ① CATALOGUE  — le guide général en tête du menu latéral, puis la liste.
     ② GUIDE      — après `Choose` : le texte, puis un item par choix à faire.
     ③ ITEM       — une seule chose à valider. `Back` ne valide pas, `Done` si.
     ④ BILAN      — après le `Done` du guide : ce qui est acquis, et `Next`.

   ⛔ CE FICHIER NE REND RIEN. Il répond à deux questions — « où en est-on ? »
   et « quels sont les items ? » — et les trois écrans qui l'appellent
   s'occupent du dessin. Écrire la réponse dans chaque écran, c'est trois
   réponses qui divergeront à la première espèce sans lignage.

   ⭐ IL NE CONNAÎT AUCUN NOM D'ÉTAPE. Tout passe par `racine` (« species »,
   « class », « background ») : le jour où Inheritance arrive, il n'y a rien à
   ajouter ici. */

/** Les quatre états, nommés une fois. */
export const ETAT = Object.freeze({
  catalogue: "catalogue",
  guide: "guide",
  bilan: "bilan"
});

function chemins(document) {
  const build = document && document.build;
  return build && Array.isArray(build.confirmed) ? build.confirmed : [];
}

/** Ce chemin porte-t-il la signature du joueur ?
 *  ⚠️ LU DANS LE DOCUMENT, JAMAIS DÉDUIT DU CARNET. Un item dont la valeur est
 *  posée mais que le joueur a quitté par `Back` n'est PAS confirmé — c'est
 *  toute la règle du 19/08, et la déduire depuis `answered` la détruirait. */
export function estConfirme(document, chemin) {
  return chemins(document).includes(chemin);
}

function planAt(decisions, chemin) {
  const liste = Array.isArray(decisions) ? decisions : [];
  return liste.find((entry) => entry && entry.path === chemin) || null;
}

/** LES ITEMS D'UNE ÉTAPE — un par choix à faire, dans l'ordre du carnet.
 *
 *  ⭐ UN ITEM PAR CHOIX, ET PAS UN PAR CATÉGORIE. Eric : *« pour elfe tu auras
 *  un choix keen senses à faire en plus »* — l'Elfe en porte donc DEUX, son
 *  lignage et sa bourse captive, chacun avec son voyant.
 *
 *  ⚠️ ON PREND LES GROUPES, PAS LEURS CRÉNEAUX. `species.skills` est un item ;
 *  `species.skills[0]` est une case DANS cet item. Les compter tous les deux
 *  ferait deux voyants pour une seule décision.
 *
 *  ⛔ LA RACINE ELLE-MÊME N'EST PAS UN ITEM. `species` est le choix de
 *  l'espèce, déjà fait quand on arrive au guide : le lister, ce serait
 *  demander au joueur de re-valider ce qui l'a amené ici. */
export function itemsDeLEtape({ decisions, document, racine }) {
  const liste = Array.isArray(decisions) ? decisions : [];
  const prefixe = `${racine}.`;
  return liste
    .filter((plan) => plan && typeof plan.path === "string")
    .filter((plan) => plan.path.startsWith(prefixe))
    /* ⚠️ UN SEUL SEGMENT SOUS LA RACINE, et c'est une correction mesurée dans
       la page : l'Elfe affichait QUATRE items — `lineage`, `skillBudget`, puis
       `Survival` et `Vigilance`. Les deux derniers sont les compétences DANS
       la bourse (`species.skillBudget.survival`), pas des décisions à part.
       Un item est une DÉCISION ; ce qui vit dessous en est le contenu. */
    .filter((plan) => !plan.path.slice(prefixe.length).includes("."))
    .filter((plan) => !/\[\d+\]$/.test(plan.path))
    .map((plan) => ({
      path: plan.path,
      /* RÉPONDU ≠ CONFIRMÉ. Le premier vient du carnet, le second du geste du
         joueur. Les deux sont rendus, parce que l'écran a besoin des deux :
         `Done` refuse tant que tout n'est pas répondu, le voyant s'allume sur
         la confirmation. */
      repondu: Number.isInteger(plan.answered) && Number.isInteger(plan.expected)
        ? plan.answered >= plan.expected
        : false,
      confirme: estConfirme(document, plan.path),
      verrou: plan.lock || null
    }));
}

/** OÙ EN EST-ON ? Trois états qui se DÉDUISENT, et un seul fait en mémoire.
 *
 *  ⭐ LE BILAN N'EST PAS « TOUT EST RÉPONDU » : c'est « le joueur a cliqué le
 *  `Done` du guide ». Un personnage entièrement rempli mais jamais confirmé
 *  reste au guide — Eric l'a posé explicitement, et c'est ce que la signature
 *  sur la racine encode.
 *
 *  ⭐ ET L'INHERITANCE N'A PAS BESOIN D'UN CAS PARTICULIER — Eric, 2026-08-19 :
 *  *« Inheritance c'est pareil que species après choose »*. Elle n'a pas de
 *  catalogue parce qu'elle ne se choisit pas : le moteur résout tout seul le
 *  record unique de son genre (`resolvedRef`, contrat §1a — *« livrée, non
 *  choisie »*). Son plan arrive donc DÉJÀ rempli, et cette fonction la pose au
 *  GUIDE du premier coup. Rien à ajouter ici : c'est la conséquence du même
 *  test, pas une exception. */
export function etatDeLEtape({ decisions, document, racine }) {
  const racinePlan = planAt(decisions, racine);
  const choisi = racinePlan && Array.isArray(racinePlan.selected) && racinePlan.selected.length > 0;
  if (!choisi) return ETAT.catalogue;
  if (estConfirme(document, racine)) return ETAT.bilan;
  return ETAT.guide;
}

/** Le `Done` du guide peut-il partir ? Et sinon, QUOI dire au joueur.
 *
 *  ⛔ IL N'EST JAMAIS GRISÉ (Eric : *« done lance un message et ne valide pas
 *  si tout n'est pas coché »*). Un bouton mort ne dit pas ce qui manque ; un
 *  bouton qui répond, si. */
export function refusDuDone({ decisions, document, racine }) {
  const items = itemsDeLEtape({ decisions, document, racine });
  const manquants = items.filter((item) => !item.confirme);
  if (manquants.length === 0) return null;
  return { manquants: manquants.map((item) => item.path) };
}
