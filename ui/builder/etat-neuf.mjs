/* ══ 🌱 L'ÉTAT NEUF — UN SEUL ENDROIT DIT CE QU'EST UN ÉCRAN VIERGE ════════
   Lot 197. ⚖️ Eric, 2026-09-10, à « pourquoi `Build a character` ne rend pas
   un écran vierge ? » : *« Quand je fais reset ou Build a character, je veux
   TOUT À LA RACINE R ET RIEN DE DÉJÀ CONSTRUIT ! Pourquoi tu ne l'as pas
   fait ? »*

   📏 LA MESURE QUI A FAIT NAÎTRE CE FICHIER, ET ELLE EST LA RAISON DE SA
   FORME. Le 10/09, sur `main` (v620), `state` portait **41 champs** et le
   chemin de `Build a character` en remettait **18** ; **23 survivaient**, dont
   quatorze qui appartenaient en propre à l'écran du personnage précédent — la
   fiche dérivée (`resolved`, `decisions`, `report`, `violations`), la branche
   de Menu ouverte, la méthode d'abilities déjà choisie, le panneau
   d'Inheritance déplié, la sous-étape de la cérémonie de Destiny…

   🔴 LA CAUSE N'ÉTAIT PAS UN CHAMP OUBLIÉ, C'ÉTAIT LA FORME DE LA LISTE.
   `remettreLEcranAZero` était une **liste de champs écrite à la main**, et une
   liste PAR NOM ne dit jamais qu'elle est incomplète : chaque champ ajouté à
   `state` depuis était oublié **par défaut, en silence**. Sa propre tête
   annonçait le piège depuis le lot 193 (*« raterait le onzième qu'on ajoutera
   demain »*) — et le onzième était déjà arrivé quatorze fois.

   ⛔ ON NE RALLONGE DONC PAS LA LISTE, ON L'INVERSE. Rallonger aurait laissé
   le défaut intact : le champ ajouté demain serait oublié pareil. Ici,
   `etatNeuf()` est la SOURCE — la déclaration de `state` elle-même — et
   `remettreAZero()` **reconstruit** depuis elle en ne gardant QUE ce que
   `CHAMPS_QUI_SURVIVENT` nomme. ⇒ **un champ neuf est remis à zéro par
   défaut** ; seul un champ délibérément inscrit dans la courte liste survit.

   ⭐ POURQUOI CE FICHIER EXISTE PLUTÔT QU'UNE FONCTION DANS `shell.mjs` :
   personne n'importe `shell.mjs` (SOCLE, garde F de `tests/socle.test.mjs`) —
   tous ses gardes le lisent EN OCTETS. Un garde qui recopierait les 41 noms
   serait exactement la liste par nom qu'on retire. Ici les clefs se comptent
   sur la DONNÉE : `Object.keys(etatNeuf())`. Voir `tests/etat-neuf.test.mjs`.

   ⛔ ZÉRO IMPORT, ET C'EST VOULU : cet organe ne connaît ni le DOM, ni le
   moteur, ni un écran. Il ne décrit qu'une forme. */

/** L'ÉTAT NEUF — la déclaration de `state`, et la seule.
 *  ⛔ Elle RE-CRÉE à chaque appel (objets et tableaux compris) : rendre un
 *  littéral partagé ferait de `fieldErrors` ou `destinyTaps` une valeur que
 *  deux personnages successifs se passeraient de la main à la main. */
export function etatNeuf() {
  return {
    step: 0,
    /* ══ LE DOUBLE AFFICHAGE (lot 120) — deux crans, jamais deux `state` ══════
       Eric, 2026-09-02 : deux panneaux côte à côte, *« si je clique sur le belt,
       c'est l'élément actif qui bouge »*.

       🔴 `state.step` RESTE LE CRAN DE L'ACTIF, et c'est ce qui rend le lot
       petit : les quarante lectures du fichier (`STEPS[state.step]`,
       `catalogueCourant`, `pressDone`…) parlent toutes du panneau qu'on
       commande, comme avant. Le second cran est un champ de plus, pas un second
       état — dupliquer `state` aurait donné deux documents à tenir d'accord.
       ⛔ `stepSecond` ne vaut RIEN quand la vue est simple : c'est le rendu qui
       le lit, jamais le moteur. */
    stepSecond: 0,          // le cran du panneau PASSIF — Menu par défaut (Eric)
    engine: null,       // { build, layers, bus } — set once bootEngine() resolves
    document: null,      // the live fh-char/1 document
    decisions: [],        // the last rebuild()'s carnet
    resolved: null,        // the last rebuild()'s fiche — lot 39 needs it whole, not just decisions[]
    report: null,          // LOT 40 — the whole last rebuild() output: {underived, warnings,
                            // unconsumed, …}, exactly the shape render-fiche.mjs's `report` wants
    violations: [],          // the last validate()'s refusals — {key, params, path?}
    engineError: null,
    /* Le refus de `derive` quand le personnage n'est PAS DÉRIVABLE — pas une
       panne, un état de création (voir `rebuild()`). `null` le reste du temps. */
    derivationImpossible: null,
    /* ⭐ CE QUE LA MÉMOIRE DU NAVIGATEUR A RÉPONDU — `{ok:true}` ou
       `{ok:false, raison}`. L'écran Menu le DIT au joueur : « gardé dans ce
       navigateur », ou pourquoi il ne l'est pas.
       ⛔ Un builder qui ne sauvegarde pas en silence est pire que celui d'hier,
       qui ne sauvegardait pas du tout — hier le joueur le savait. */
    memoire: { ok: true },
    /* ⚠️ ET CELUI-CI NE SE TAIT JAMAIS : un personnage ÉTAIT gardé, et il était
       inutilisable. Il survit à la première sauvegarde réussie — sinon le joueur
       repartirait de l'exemple sans jamais apprendre qu'il a perdu quelque
       chose, ce qui est le repli silencieux que la loi §0.5 interdit. */
    memoireIgnoree: null,
    /* 📂 Le mot du dernier fichier REFUSÉ à l'ouverture, ou null. ⛔ Il ne vit
       pas dans le document : c'est un fait d'écran, il meurt au rechargement. */
    ouvertureRefusee: null,
    /* 🧭 La branche de rang B du Menu ouverte : "display" (Appearance),
       "characters" (le magasin de sauvegardes, lot 195) ou "layers" (le tableau
       de commande des couches, lot 188). Lue seulement quand `palier >= 2`. */
    menuBranche: "display",
    /* ══ 🗄️ LOT 195 — LE MAGASIN, ET CE QU'IL A RÉPONDU ════════════════════
       ⭐ TROIS CHAMPS, PAS UN, ET AUCUN NE SE DÉDUIT DES AUTRES :
       · `magasin`      — L'ORGANE lui-même (`null` tant qu'il n'est pas monté).
         ⛔ Il n'est jamais lu par un écran : la coquille l'interroge, l'écran
         reçoit des faits.
       · `magasinListe` — CE QUE `lister()` A RENDU, dans son propre vocabulaire :
         `{etat:"chargement"}` · `{etat:"liste", entrees, groupes}` ·
         `{etat:"refus", raison}`. ⛔ « je cherche encore » et « il n'y a rien »
         sont deux choses ; les confondre ferait croire à une perte.
       · `magasinOu`    — LA LIGNE DISCRÈTE (`ouEstCeRange()`), gardée à part
         parce qu'elle survit à un refus de listage : le bouton `Save location`
         doit rester lisible précisément quand la liste a échoué. */
    magasin: null,
    magasinListe: { etat: "chargement" },
    magasinOu: null,
    /* 📚 LOT 188 — les livres du joueur PRÉSENTS sur le disque mais que le bloc
       `layers` a REFUSÉS (`[{id, raison}]`). Un 404 n'est pas ici : c'est zéro
       livre. Un fichier illisible, lui, se dit dans `Layers` avec sa raison. */
    livresRefuses: [],
    /* ⭐ LE REGISTRE DES FONDS, BRUT — lot 134. On garde le registre, PAS une
       liste dérivée : `collections()` et `collectionServie()` le relisent à
       chaque rendu, et il n'y a donc jamais deux états à tenir d'accord. `null`
       tant qu'il n'est pas chargé, et `null` pour toujours s'il ne se lit pas —
       `tokens.css` sert alors la collection par défaut, et le Menu n'affiche pas
       le réglage plutôt que d'afficher une liste vide. */
    registreFonds: null,
    /* LOT 45 — le hasard n'a AUCUNE existence dans le document (Eric,
       2026-08-13 : "seul le résultat compte", voir ABILITIES/DESTINY steps).
       Ces deux champs sont donc ici, hors de `document`, exactement comme
       l'était `planOpen` — perdus si l'onglet ferme, et c'est voulu.
       *(`planOpen` est parti avec la ligne de commande, refonte 2 §1.)* */
    /* LOT 50 — `abilityRoll` porte maintenant aussi `assign` : la carte
       `clef → index de dé` (commande §2a, « la carte vit au même endroit que
       le lot »). Ni l'un ni l'autre champ n'existe dans `document` — voir
       `abilities-step.mjs`, en-tête. */
    abilityRoll: null,     // le dernier lot de dix jets ({rolls, rerollCount, assign}), ou null
    /* LOT 63 — B5.1c : « il faut CLIQUER pour faire apparaître les rollers ».
       Tant que `abilityMethod` est nul, l'écran ne montre que ses tuiles. */
    abilityMethod: null,   // "roll" | "standard" | "manual"
    /* 🏁 LE BILAN D'ABILITIES (Eric, 06/09) : après `Done` sur la page d'une méthode,
       la racine ne montre plus le choix (R1) mais le BILAN (R2) — six scores sur
       un tapis, `Next` avance, `Cancel` rend le choix. Un drapeau, pas une
       déduction : un lot complet peut vivre SANS bilan (on est revenu au choix). */
    abilityBilan: false,
    /* LOT PLATEAU (2026-08-15) — combien des dix jets sont DÉCOUVERTS. Il vit
       ici et pas dans `abilityRoll` parce qu'il survit à un lot rejeté : le
       plateau remet à zéro lui-même quand il balaie. */
    abilityRevele: 0,
    /* LOT 64 — B4.1/B4.2 : quel panneau d'Inheritance est ouvert. Fermé, on
       voit les deux dalles ; ouvert, l'AUTRE disparaît. */
    inheritanceOpen: null, // "boost" | "feat" | null
    /* ⛔ `equipmentCategory` ET `equipmentSearch` ONT DISPARU LE 2026-08-23 :
       la molette et la loupe qu'ils pilotaient ne sont plus à l'écran. Un état
       que personne ne lit est un état qui ment sur ce que l'écran sait faire. */
    /* ⛔ `rollingMethod` A DISPARU AU LOT 80 : `FH 3D6` et `4D6` ne sont plus
       une molette DANS la méthode « Roll dice », ce sont deux TUILES du
       sélecteur (croquis du 16/08). Un choix, plus deux. */
    /* LOT 82 — LE PANNEAU DE LORE, croquis A : *« lore sends to full page
       description »*. Un interrupteur d'écran de plus, de la même famille que
       `inheritanceOpen` : il ne touche pas le document, il
       meurt avec l'onglet, et il vit HORS du DOM pour survivre au
       remplacement du contenu (SOCLE.md).
       ⭐ Il porte le RECORD (`{kind, id}`) et pas un booléen : deux écrans à
       fiche l'emploient, et douze fiches chacun. Un drapeau ne dirait pas
       laquelle on lit. */
    /* LE PARCOURS D'ÉTAPE (Eric, 2026-08-19) — `{ racine, path }` quand une dalle
       d'item est ouverte, sinon null. C'est le cran le PLUS INTÉRIEUR du retour :
       un item vit dans un guide, qui vit dans un palier, qui vit dans une étape. */
    parcoursItem: null,
    /* Les chemins que le dernier `Done` de guide a REFUSÉS, ou null. Il n'existe
       qu'APRÈS un refus : annoncer d'avance ce qui manque ferait de la liste un
       reproche. */
    parcoursRefus: null,
    lore: null,            // { kind, id } — le record dont on lit la prose, ou null
    destinyRang: null,     // "SB2" = le FF ouvert depuis le catalogue ; null ailleurs
    destinyMode: "draw",   // "draw" (défaut, ADDENDUMS §4) ou "choice" — jamais écrit au document (fh.destiny.* est un namespace strict, mesuré)
    /* LOT 61 — QUATRE ÉTATS D'ÉCRAN POUR DESTINY, ET AUCUN N'EST DANS LE
       DOCUMENT : B6.2 dit « rien n'est acté tant que Valid n'est pas tapé ».
       Le tirage vit donc ici et meurt avec l'onglet — cohérent avec la
       décision du 2026-08-13, « seul le résultat compte, aucun historique ». */
    /* LOT 62 — LE POPUP (III.4, B7.7). Son état vit ICI et non dans le DOM :
       c'est la quatrième des cinq choses que `innerHTML = ""` détruisait, et
       SOCLE.md l'annonçait — « il vivra dans `state` comme le reste ». */
    popup: null,            // { texte } quand il est ouvert, sinon null
    /* ⭐ LES CINQ TEMPS DE DESTINY (lot 109, croquis d'Eric du 2026-08-30) :
       `porte` (le R : Draw ou Choose) · `seq1` `seq2` `seq3` (la cérémonie
       plein écran) · `final` (l'écran commun aux deux branches).
       ⛔ Aucun de ces états n'entre au document : `fh.destiny.*` est un
       namespace strict, et seul `Next` y écrit la carte. */
    destinyPhase: "porte",
    destinySeq2: "melange",  // sous-étape de la séquence 2 : "melange" puis "grossit"
    destinyDezoom: false,    // séquence 3 : la carte retournée repart à 50 %
    destinyTaps: [],         // horodatages des taps — trois d'affilée résolvent
    destinyDraw: null,       // la carte TIRÉE ou CHOISIE, pas encore actée
    destinyFace: "down",     // B6.1c — retournée ou non
    /* LOT 54 — Concept/Universe. `docWriters` = `createDocWriters({schema})`,
       construit UNE FOIS au boot (juste en dessous) : PUR, sans magasin ni bus
       (voir shell.mjs, imports, et universe-step.mjs en tête). `fieldErrors`
       et `pendingStack` sont de l'état d'ÉCRAN, comme `abilityRoll` —
       jamais écrits au document, perdus si l'onglet ferme. */
    docWriters: null,       // { rename, describe } une fois le schéma chargé, sinon null
    fieldErrors: {},        // le dernier refus de rename/describe, par champ ({name, gender, alignment, campaign})
    pendingStack: null,     // "srd" pendant qu'une confirmation de passage à SRD est en attente, sinon null
    /* LOT 58 — DEUX ÉTATS D'ÉCRAN DE PLUS, ET ILS VIVENT ICI POUR UNE RAISON
       (SOCLE.md, « qui possède quoi ») : hors du DOM, donc ils survivent à un
       remplacement de contenu par construction. C'était deux des cinq choses
       que `innerHTML = ""` détruisait.
       · `palier` — où en est `Validate` sur l'écran courant (I.4). Remis à 1
         à chaque changement d'étape, jamais deviné.
       · `cursor` — le cran d'aimantation de l'écran à CATALOGUE courant (Class
         ou Species : le même écran, `catalogue.mjs`). 🔴 ÉCRIT PAR LE
         SCROLLSPY, ET PAR LUI SEUL, et il ne déclenche AUCUN redessin
         (SOCLE.md, la troisième ligne des trois verbes). */
    palier: 1,
    cursor: 0
  };
}

/** 🔴 LES SEULS CHAMPS QUI SURVIVENT À UNE REMISE À ZÉRO — ET CHACUN DIT
 *  POURQUOI. ⛔ C'est l'INVERSE de la liste d'avant : celle-ci est courte, elle
 *  ne parle QUE d'infrastructure, et un champ qu'on oublie d'y écrire tombe —
 *  ce qui est le bon défaut. Y ajouter un champ est une décision qui se
 *  défend par écrit, ici, à côté de son nom.
 *
 *  ⚠️ « Infrastructure » veut dire : **ni le personnage, ni son écran**. Le
 *  moteur, le magasin d'octets, le registre des fonds et les livres refusés
 *  parlent de la SESSION du joueur ; ils ne changent pas parce qu'il commence
 *  un autre personnage. */
export const CHAMPS_QUI_SURVIVENT = {
  /* ⭐ LE DOCUMENT EST POSÉ PAR L'APPELANT, JAMAIS PAR L'ORGANE — et c'est le
     contrat que `remettreLEcranAZero` porte depuis le lot 193. Les deux portes
     écrivent `state.document` (un personnage neuf, un fichier ouvert) AVANT
     d'appeler ; le nuller ici effacerait le personnage qu'on vient de poser. */
  document: "posé par l'appelant — un personnage neuf, ou celui qu'on vient d'ouvrir",
  /* ── LE MOTEUR ─────────────────────────────────────────────────────────── */
  engine: "monté une fois au démarrage ; il ne connaît pas les personnages",
  engineError: "un refus de DÉMARRAGE, pas un fait de personnage — il survit à tout",
  docWriters: "construit une fois au boot sur le schéma ; pur, sans magasin ni bus",
  /* ── LE MAGASIN D'OCTETS (lot 195) ─────────────────────────────────────── */
  magasin: "l'organe monté au démarrage, à côté du moteur et sans lui",
  magasinOu: "où les octets sont rangés — une destination, pas un personnage",
  /* ⚠️ ET CELUI-CI EST UN ARBITRAGE, PAS UNE ÉVIDENCE. `magasinListe` porte
     `{etat:"chargement"}` à l'état neuf : le remettre à zéro SANS relancer un
     `lister()` laisserait la page du magasin bloquée sur « chargement » —
     mesuré sur la branche sans rechargement de `poserLeDocumentOuvert`, qui ne
     redemande rien. La liste est de plus déjà rafraîchie par `exporterJson`
     lors du `Build a character`. Elle survit donc, et elle se rafraîchit par
     son propre écrivain (`rafraichirLeMagasin`), jamais par celui-ci. */
  magasinListe: "la liste du magasin a UN écrivain (`rafraichirLeMagasin`) — la vider sans la redemander bloquerait la page sur « chargement »",
  /* ── LA MÉMOIRE DU NAVIGATEUR ──────────────────────────────────────────── */
  /* ⭐ `memoire` est RÉÉCRIT par `memoriser()` au premier `refresh()` qui suit.
     Le remettre à `{ok:true}` ici afficherait « gardé dans ce navigateur »
     pendant un battement, sur un magasin qui vient peut-être de refuser. */
  memoire: "réécrit par `memoriser()` au premier refresh — le remettre à `{ok:true}` mentirait le temps d'un battement",
  /* ── LES LIVRES ET LES FONDS ───────────────────────────────────────────── */
  livresRefuses: "ce que le bloc `layers` a refusé sur le DISQUE du joueur, au démarrage",
  registreFonds: "une préférence de lecteur chargée une fois ; `null` pour toujours s'il ne se lit pas"
};

/** 🔴 REMETTRE L'ÉCRAN À ZÉRO — ON RECONSTRUIT, ON N'ÉNUMÈRE PLUS.
 *
 *  ⛔ IL MUTE `etat` EN PLACE au lieu de rendre un objet neuf, et ce n'est pas
 *  un détail de style : `shell.mjs` déclare `const state` et une quarantaine de
 *  fermetures le tiennent par référence. Remplacer l'objet laisserait la
 *  moitié de la coquille sur l'ancien.
 *
 *  ⚔️ TROIS SORTS, ET LE TROISIÈME EST CE QUI REND LE GARDE TOTAL :
 *   · nommé dans `CHAMPS_QUI_SURVIVENT` → on n'y touche pas ;
 *   · connu de `etatNeuf()`             → il reprend sa valeur d'état neuf ;
 *   · ni l'un ni l'autre                → il est SUPPRIMÉ. Un champ posé à la
 *     volée sur `state`, que la déclaration ne connaît pas, appartient au
 *     personnage d'avant par construction : personne ne l'a déclaré comme
 *     infrastructure. Le laisser vivre rouvrirait exactement le trou qu'on
 *     ferme, par la seule porte que la déclaration ne surveille pas. */
export function remettreAZero(etat) {
  const neuf = etatNeuf();
  for (const clef of Object.keys(etat)) {
    if (Object.prototype.hasOwnProperty.call(CHAMPS_QUI_SURVIVENT, clef)) continue;
    if (Object.prototype.hasOwnProperty.call(neuf, clef)) etat[clef] = neuf[clef];
    else delete etat[clef];
  }
  /* ⚠️ ET UN CHAMP DE LA DÉCLARATION QUI MANQUERAIT À `etat` SE REPOSE : une
     absence n'est jamais une réponse — un `delete` fait ailleurs ne doit pas
     rendre l'écran neuf différent de celui du démarrage. */
  for (const clef of Object.keys(neuf)) {
    if (Object.prototype.hasOwnProperty.call(CHAMPS_QUI_SURVIVENT, clef)) continue;
    if (!Object.prototype.hasOwnProperty.call(etat, clef)) etat[clef] = neuf[clef];
  }
  return etat;
}
