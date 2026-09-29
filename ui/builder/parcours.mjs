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

/** Ce plan porte-t-il, SOUS lui, un plan que le joueur doit encore répondre ?
 *  ⛔ « Sous lui » se lit sur le CHEMIN (`background.originFeat[0].cantrips`
 *  vit sous `background.originFeat[0]`), et « à répondre » sur la PROVENANCE —
 *  jamais sur un nom d'étape ni sur un compte. Un plan requis qui n'en porte
 *  aucun reste ce qu'il est depuis le lot 190 : un acquis, pas une porte. */
export function porteUneDecisionOuverte(liste, chemin) {
  const prefixe = `${chemin}.`;
  return liste.some((autre) => autre && typeof autre.path === "string"
    && autre.path.startsWith(prefixe)
    && !(autre.provenance && autre.provenance.mode === "required"));
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
    .filter((plan) => !plan.path.slice(prefixe.length).replace(/\[\d+\]$/, "").includes("."))
    /* 🚪 UN FAIT DU RECORD N'EST PAS UNE PORTE — Eric, 2026-09-09 (lot 190),
       sur l'arrière-plan SRD : *« Pour le feat : Savage Attacker (c'est
       granted) pas de bouton. Les compétences idem, les skills sont granted,
       y'a pas de choix. Idem que pour les lineages. »*
       ⭐ Le carnet publie un plan pour ce que le record IMPOSE (`feat_id`,
       `tool_id` : `provenance.mode === "required"`, `decisions.mjs`) — pour
       l'ANNONCER, pas pour le faire choisir. Le lot 187 le listait quand même,
       et son `Done` ne faisait qu'en prendre acte : une porte qui s'ouvre sur
       rien à décider, et une signature à poser pour rien. Un plan requis n'est
       pas une décision : il se montre comme un acquis (`lignesEnPlus`, la
       ligne « gagné d'office » des lignages), il ne se signe pas.
       📏 Mesuré sur les couches du dépôt : seuls les arrière-plans SRD publient
       un plan requis ; l'Inheritance de Fate's Hand n'en a aucun, ses trois
       items ne bougent pas (`tests/background-step.test.mjs` le tient).
       ⛔ La règle est GÉNÉRALE (NORMES §6 pré quinquies) : elle vit ici, pas
       dans l'écran qui l'a rencontrée le premier. */
    /* ⚠️ …SAUF S'IL PORTE, EN DESSOUS, UNE DÉCISION QUI RESTE À PRENDRE —
       lot 194. Eric, 2026-09-10, sur l'Acolyte du fil SRD : *« Magic Initiate
       nécessite un bouton, ça doit être configuré. »*
       📏 CE QUE ÇA RÉPARE : l'arrière-plan IMPOSE son don (`feat_id`), donc le
       plan est `required`, donc pas d'item — la règle de la ligne du dessus, et
       elle est juste tant que le don n'a rien à régler. Magic Initiate en a :
       le carnet publie ses tours mineurs et son sort de niveau 1 SOUS lui, et
       personne n'ouvrait la porte qui y mène. Le don s'affichait « gagné
       d'office » et le joueur ne pouvait pas choisir ses sorts.
       ⭐ LE CRITÈRE EST LA DONNÉE, PAS LE NOM : « ce plan porte-t-il, plus bas,
       un plan que le joueur doit encore répondre ? ». ⛔ Un sous-plan lui-même
       `required` ne compte pas — la liste de sorts d'un « Magic Initiate
       (Cleric) » est fixée par l'arrière-plan, elle n'ouvre aucune porte. Un
       outil imposé, un don sans branches : rien en dessous, donc pas de porte,
       exactement comme au lot 190. */
    .filter((plan) => !(plan.provenance && plan.provenance.mode === "required")
      || porteUneDecisionOuverte(liste, plan.path))
    /* ⚠️ UN CRÉNEAU NE S'EFFACE QUE S'IL A UN GROUPE. `species.skills[0]` vit
       sous `species.skills`, qui est l'item — le compter aussi ferait deux
       voyants pour une décision. Mais `background.originFeat[0]` n'a AUCUN
       groupe : c'est lui, l'item. Un filtre qui écartait tous les `[n]` faisait
       disparaître le don d'origine de l'Inheritance — trouvé en la branchant. */
    .filter((plan) => {
      const groupe = plan.path.replace(/\[\d+\]$/, "");
      return groupe === plan.path || !liste.some((autre) => autre && autre.path === groupe);
    })
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
export function refusDuDone({ decisions, document, racine, violations }) {
  const items = itemsDeLEtape({ decisions, document, racine });
  const manquants = items.filter((item) => !item.confirme);
  const nonResolus = refsMortsDeLEtape({ violations, racine });
  if (manquants.length === 0 && nonResolus.length === 0) return null;
  return { manquants: manquants.map((item) => item.path), nonResolus };
}

/** LES CHOIX DE L'ÉTAPE QUE LA PILE NE RÉSOUT PAS — lot 191.
 *
 *  📏 LE DÉFAUT, VU EN LIGNE LE 2026-09-09 (v614) : un Araag (espèce Fate's
 *  Hand), Fate's Hand éteint depuis `Layers` — l'écran Species disait
 *  *« This step is settled »* sous un id nu. Rien n'était réglé : le choix
 *  pointe vers un record que cette pile ne porte pas.
 *
 *  ⭐ ON LIT `validate()`, ON NE RE-JUGE PAS : le moteur NOMME déjà chaque
 *  ref mort (`choice.ref-missing`, `block.mjs`), avec son chemin, son genre
 *  et son id. Ce lecteur ne fait que retenir ceux qui vivent sous la racine —
 *  la racine elle-même (`species`) et tout ce qui est dessous
 *  (`background.originFeat[0]`, `background.languages[1]`). Une seconde
 *  lecture de la pile ici serait le deuxième écrivain que la maison interdit.
 *
 *  ⛔ ET UN CHOIX NON RÉSOLU N'EST PAS UN ITEM : il n'a ni porte ni voyant —
 *  le joueur n'a rien à y régler tant que la couche est éteinte. Il retient
 *  le `Done` (l'étape n'est pas réglée) et il se NOMME dans la bande. Rien
 *  n'est effacé : tout revient quand la couche se rallume (Eric, 09/09 :
 *  *« que le personnage ne se dissocie pas, pas trop grave »*). */
export function refsMortsDeLEtape({ violations, racine }) {
  const liste = Array.isArray(violations) ? violations : [];
  return liste
    .filter((v) => v && v.key === "choice.ref-missing" && typeof v.path === "string")
    .filter((v) => v.path === racine || v.path.startsWith(`${racine}.`) || v.path.startsWith(`${racine}[`))
    .map((v) => ({ path: v.path, kind: v.params && v.params.kind, id: v.params && v.params.id }));
}

/** LES REFUS QUI TIENNENT SANS FICHE — lot 359.
 *
 *  📏 LE DÉFAUT, RELEVÉ AU LOT 351 ET REPRODUIT EN NODE : un joueur neuf choisit
 *  l'Araag, puis éteint Fate's Hand AVANT d'avoir une classe. Sans classe,
 *  `rebuild` JETTE (« dérivation impossible », `derive.mjs`) et la coquille posait
 *  `violations = []` — ce silence se lisait « rien à redire » : Species disait
 *  *« This step is settled »* et la ceinture signait vert un choix mort. Or le
 *  joueur choisit l'espèce AVANT la classe : tout perso neuf traverse cet état.
 *
 *  ⭐ `validate()` NE JETTE PAS : il attrape lui-même l'échec (`derive.threw`) et
 *  nomme quand même ce qui ne dépend que des CHOIX et de la pile — les refs morts
 *  (`choice.ref-missing`), les verrous du carnet. Ce qu'il ne faut pas lire sans
 *  dérivation, c'est ce qui juge la FICHE : `document.resolved` est alors la
 *  tranche d'une classe abandonnée (la raison du silence d'avant).
 *
 *  ⚖️ LE TRI SE FONDE SUR LA DONNÉE — LE CHEMIN DU REFUS (ARCHI 35, 29/09) :
 *  posé sur un choix, il est gardé ; posé sur `resolved…` (la fiche), il est
 *  écarté ; sans chemin (`derive.threw`, un invariant global), il est écarté parce
 *  qu'il n'a PAS de chemin — ⛔ jamais parce que son code est nommé ici : aucune
 *  liste de codes, un refus d'un code inconnu suit la même loi.
 *  ⛔ AUCUNE RÈGLE DE JEU NE BOUGE : sans classe, la fiche reste une « dérivation
 *  impossible » ; ce qui change, c'est ce que les étapes DISENT pendant la création.
 *  @param {Array<{key: string, path?: string}>} violations le rapport de `validate()`
 *  @returns {Array} les refus posés sur un choix, dans l'ordre reçu */
export function refusSansFiche(violations) {
  return (Array.isArray(violations) ? violations : [])
    .filter((v) => v && typeof v.path === "string" && v.path !== "" && !/^resolved(?:[.[]|$)/.test(v.path));
}

/** L'ÉTAPE EST-ELLE COMPLÈTE ? Tous ses items signés, et elle est commencée.
 *
 *  🔴 2026-08-19 — CE JUGE NAÎT D'UNE DOUBLE VALIDATION QU'ERIC A VUE :
 *  *« il y a une double validation inutile […] on peut recouvrir ou remplacer
 *  le bouton done par next »*. Chaque item est DÉJÀ signé par son propre
 *  `Done` ; redemander un `Done` d'étape pour dire « oui, vraiment » ne
 *  vérifiait rien que les items n'aient déjà vérifié — ça coûtait un clic pour
 *  répéter une réponse.
 *
 *  ⚠️ ACHEVÉE ≠ CONCLUE, et le guide a besoin DES DEUX. Achevée = « il ne
 *  reste rien à faire » (ici). Conclue = « le joueur est reparti par `Next` »
 *  (`estConfirme` sur la racine). C'est leur écart qui distingue l'écran qu'on
 *  vient de finir — il offre `Next` — de celui sur lequel on REVIENT, qui
 *  n'offre plus rien à valider : *« plus de done ni de next si on revient sur
 *  la fiche »*.
 *
 *  ⛔ ET IL EXIGE QUE L'ÉTAPE SOIT COMMENCÉE. Sans ce garde, un chapitre dont
 *  le carnet n'a pas encore livré les plans n'a aucun item, donc aucun manque,
 *  donc « complet » — et le belt s'allumerait en vert sur du vide. */
export function etapeAchevee({ decisions, document, racine, violations }) {
  if (etatDeLEtape({ decisions, document, racine }) === ETAT.catalogue) return false;
  /* ⛔ LOT 191 — « settled » ne se dit pas d'un choix non résolu : les refs
     morts de `validate()` retiennent le `Done`, donc l'étape n'est pas
     achevée. Même juge que le pied, une seule réponse. */
  return refusDuDone({ decisions, document, racine, violations }) === null;
}
