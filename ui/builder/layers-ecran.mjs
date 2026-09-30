/* ══ L'ÉCRAN `Layers` — LE TABLEAU DE COMMANDE DES COUCHES — lot 188 ══════
   ⚖️ Eric, 09/09, gravé avec sa question : *« Comment s'appelle l'écran des
   six interrupteurs ? »* → **`Layers`** — et non `Rules`, en collision avec
   le nom accessible du bouton livre ; et l'écran ne fait pas que des règles,
   il porte aussi les livres du joueur et le contenu de table.

   LE DESSIN EST D'ERIC (artefact « Six interrupteurs, un catalogue », 08/09) :
   *« Un tableau de commande, pas une liste d'options. Le socle, puis les
   couches qui s'empilent dessus. »*

       SRD 5.2.1      compatible with the core rules   — un VOYANT (09/09)
       Fate's Hand    allume les six d'un coup          — MAÎTRE
       ── ses six couches, chacune se coupe seule ──
       Trainings · Skills & tools · Inheritance · Destiny · World · Soulforging
       (World s'appelait Lore jusqu'au 10/09 — le lexique, lot 192)
       ── catalogue, du contenu, pas des règles ──
       les livres du joueur · + Table items

   🔄 LOT 351 — ERIC A REDESSINÉ L'ÉCRAN LE 29/09 (la dictée de B0, le plan v10) :

       SRD 5.2.1   [base book]  engine · catalog          — le VOYANT, toujours actif
       PHB         [your copy]  catalog         ◉  🗑      — un livre installé et déclaré
       Fate's Hand              engine · world · catalog  ◉ — UN interrupteur, tout ou rien
       ── installed, not active ──  (caché s'il est vide)
       DMG         [your copy]  catalog         ○  🗑      — installé, pas déclaré
       ── options ──
       Import a book                                      — place réservée

   🗑 = la poubelle, ÉTEINTE avec « soon » tant que le stockage du Vault ne porte aucun
   livre (Eric, 29/09 : « La poubelle d'un livre efface son contenu de son lieu de stockage. Ce lieu de stockage est
   décidé par le bouton vault. »).
   🗄️ `+ Table items` a quitté l'écran — Eric, 29/09 : *« table items devient -> campaign
   items (et va dans Dungeon master) »* ; la page Dungeon Master le pose (lot 357).
   ⭐ La confirmation de Fate's Hand se pose en FENÊTRE, plus dans la page (ARCHI 35, 29/09).

   ⛔ Les six enfants ne sont plus des lignes (*« Tout ou rien »*) : ils restent la
   CARTE de qui fait quoi (`interrupteurs.mjs`). ⛔ Plus de `Delete a book` : chaque
   livre porte sa poubelle (`poubelle-organe.mjs`, partagée avec `My characters`).
   Ce qui suit raconte l'écran du lot 188 ; la loi du jour est dans `renderLayersEcran`.

   🔴 UN INTERRUPTEUR EST UN ENSEMBLE DE COUCHES, PAS UNE COUCHE — mesuré le
   09/09 sur les drapeaux du dépôt : `Destiny` = `fh-arcana-en` + `fh-feats-en`
   + `fh-spells-en` ; `World` = `fh-species-en` + `fh-fiche-en` + `fh-lore-en` ;
   les quatre autres en portent une. `fh-gems-en` est du CATALOGUE : elle ne
   se coupe pas seule, elle suit le maître.
   ⚖️ LOT 191 — `fh-species-en` a QUITTÉ le catalogue pour World, sur les deux
   règles d'Eric du 09/09 : *« Il n'y a pas d'Araag dans SRD si le bouton Lore
   n'est pas poussé »* et *« Lore rajoute le monde FH sans les règles »*. La
   table vit dans `interrupteurs.mjs` (une feuille sans import, pour que le
   mot d'un choix non résolu puisse nommer son interrupteur sans cycle) et
   se réexporte d'ici : ses lecteurs ne changent pas d'adresse.

   ⚖️ UNE COUCHE ÉTEINTE NE LAISSE PAS DE TROU, ELLE DÉGRADE (Eric). Sans
   Trainings, l'Inheritance n'offre plus de langue ; le moteur déclare le
   manque et continue (mesuré au lot 184, `ARCHITECTURE.md`). C'est pourquoi
   un enfant se coupe SANS confirmation : rien n'est effacé, tout revient à
   l'allumage. Le maître, lui, garde la confirmation du lot 54 — c'est le seul
   geste qui met tout Fate's Hand en pause d'un coup — et depuis le lot 192
   elle a TROIS voies : garder, sauvegarder la version FH puis couper, couper
   (`renderConfirmationPile`, universe-step.mjs, et sa tête dit pourquoi la
   question ne se pose qu'au maître) — depuis le lot 351, en fenêtre (`paintPopup`).

   ⚖️ ET UN INTERRUPTEUR PEUT EN EXIGER UN AUTRE — Eric, 08/09 : *l'Inheritance
   dépend des Trainings*. Éteindre Trainings éteint Inheritance ; tant que
   Trainings dort, Inheritance se montre `disabled` avec son mot.

   🔴 UN SOUS-ENSEMBLE EST LÉGITIME, PAS INCONNU. `currentStack` ne nomme que
   deux piles (`srd`, `srdfh`) et rend `null` entre les deux ; l'écran mort
   accusait alors le personnage. Le précédent est le lot 186 (la ceinture lit
   ce qui est MONTÉ) : ici, `compositionFh` lit le document interrupteur par
   interrupteur, et seule une composition qu'AUCUN interrupteur ne peut
   produire — un ensemble coupé en deux, le socle absent — reste innommable.

   ⚠️ CE MODULE ET `universe-step.mjs` S'IMPORTENT L'UN L'AUTRE, et c'est
   assumé : les listes de couches vivent là-bas (les tests les y lisent depuis
   le lot 54), l'organe interrupteur et l'écran vivent ici. ⛔ Aucun export de
   l'autre module n'est lu AU CHARGEMENT de celui-ci — seulement dans des
   fonctions — sinon l'ordre d'import déciderait qui plante.

   ⚠️ LES TEXTES SONT DES BROUILLONS en anglais (arbitrage d'Eric, tête de
   `shell.mjs`) ; c'est lui qui arrête les mots que le joueur lit. */

import { SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, RULE_LAYER_IDS, LIVRE_LAYER_IDS, placeReservee } from "./universe-step.mjs?v=919";
/* LOT 191 — la table des interrupteurs est une feuille (voir sa tête) ; elle
   se réexporte d'ici pour l'écran, la coquille et les gardes. */
import { INTERRUPTEURS, CATALOGUE_FH, LIVRES_DU_JOUEUR, MAITRE, SOCLE } from "./interrupteurs.mjs?v=919";
export { INTERRUPTEURS, CATALOGUE_FH, LIVRES_DU_JOUEUR };
/* ⭐ LOT 351 — la poubelle, organe au socle (feuille sans import), partagée avec `My characters`. */
import { poubelle } from "./poubelle-organe.mjs?v=919";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* ⭐ LOT 213 — L'ORGANE A DÉMÉNAGÉ DANS UNE FEUILLE SANS IMPORT, pour que la
   fiche X1 le prenne sans traîner `Layers` derrière elle. ⛔ Rien d'autre n'a
   bougé : la fabrique est la même, ses appelants ne changent pas d'adresse. */
import { interrupteur } from "./interrupteur-organe.mjs?v=919";
export { interrupteur };

/* ══ UNE PLACE RÉSERVÉE — la loi du 26/08, tranchée en forme le 08/09 ═════
   Eric, 26/08 : *« à mettre dans le menu mais pas le câbler »* · *« on note,
   on câble après »*. Eric, 08/09 : *« il faut laisser une place à tout ce
   que j'ai dit »* — pour que les itérations suivantes n'aient pas à
   détruire pour reconstruire.

   ⭐ ELLE EST PRÉSENTE, ÉTEINTE, ET ELLE LE DIT — la forme exacte de
   `Double view` quand la fenêtre est trop petite (📍 `menu-reglage-
   impossible-reste-visible`) : `disabled` + un mot. ⛔ Pas une seconde forme :
   un joueur qui a appris ce que veut dire « gris avec un mot » sur un
   réglage l'apprend une fois pour toutes.

   ⭐ LOT 188 — LE MOT SE CHOISIT. « soon » reste le défaut (une place qu'un
   lot câblera) ; un livre absent du disque dit « not on this device », qui
   n'est pas une promesse : personne ne le câblera, c'est au joueur de
   l'importer. */
export function ligneReservee(label, mot = "soon") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "tdc-ligne";
  b.disabled = true;
  b.dataset.reserve = "true";
  b.append(el("span", null, [text(label)]));
  b.append(el("span", "tdc-bientot", [text(mot)]));
  return b;
}

/* ══ LE VOYANT — Eric, 09/09, sur la v612 en ligne ═══════════════════════
   *« Le bouton SRD est un VOYANT, pas un bouton — il est toujours actif. »*

   📏 CE QU'IL REMPLACE, ET POURQUOI C'ÉTAIT FAUX : le socle était un
   `interrupteur({ on: true, disabled: true })` — ici ET au Menu (où il jouait
   en plus le miroir de Fate's Hand). Un interrupteur `disabled` RESSEMBLE À
   UN BOUTON QU'ON NE PEUT PAS POUSSER : la piste grise, le pouce gris, le
   curseur barré — trois signes qui disent « pas à toi de le toucher », alors
   que la vérité est « il n'y a rien à toucher ». Et le lecteur d'écran
   annonçait *« interrupteur, activé, désactivé »* sur une chose qui n'a
   jamais eu deux positions.

   ⭐ UN VOYANT EST UNE LAMPE : elle dit « allumé », on ne la pousse pas. La
   norme existait avant l'organe — `voyant-non-cliquable` (NORMES, 26/08) :
   *« Le voyant ne se touche pas : ne pas lui donner l'apparence d'un
   contrôle. »* Sa forme est celle de la pastille de coffre (📍
   `cadre-pastille-de-coffre`, tranchée par Eric : *« C — la pastille et la
   date »*) : un POINT de 8 px + le mot de l'état. Le Menu en portait déjà une
   sur la ligne d'état (`[data-garde]`, « ● saved ») ; c'est la même lampe.

   🔴 CE QU'IL N'EST PAS, ET UN GARDE LE TIENT (`tests/ecran-layers.test.mjs`) :
   ⛔ pas un `<button>` · ⛔ pas de `role="switch"` · ⛔ pas d'`aria-checked` ·
   ⛔ pas de `disabled` · ⛔ pas de focus clavier. `role="status"` : une région
   d'état, lue comme du texte, jamais annoncée comme un contrôle.

   ⭐ UN SEUL ORGANE POUR UN SEUL SENS : le socle de `Layers`. Le SRD y est
   TOUJOURS allumé — Eric : *« il est toujours actif »* — y compris quand Fate's
   Hand l'est aussi : le miroir « SRD éteint quand FH est allumé » (08/09) est
   abandonné par ce mot du 09/09. Le SRD n'est pas l'inverse de Fate's Hand,
   c'est le plancher sous lui.
   🔄 LOT 350 — IL VIVAIT À DEUX ENDROITS, IL N'EN A PLUS QU'UN : la ligne des
   règles du Menu (`universe-step.mjs`) portait la même lampe à côté de
   l'interrupteur Fate's Hand. Eric a refait le Menu le 29/09 : `Rules` s'y LIT
   en texte (« SRD » ou « Fate's Hand »), et la lampe comme l'interrupteur ne
   vivent plus qu'ici.
   ⭐ LOT 351 — `etiquette` et `familles`, facultatives, les mêmes pièces que
   l'interrupteur (voir `interrupteur-organe.mjs`) et les mêmes classes : une seule
   feuille les habille, sur la lampe comme sur la ligne qui se règle. */
export function voyant({ label, note, etiquette, familles, etat = "always on" }) {
  const ligne = el("div", "voyant");
  ligne.setAttribute("role", "status");
  ligne.dataset.on = "true";
  const mot = el("span", "voyant-mot", etiquette
    ? [el("span", "ligne-tete", [text(label), el("span", "ligne-etiquette", [text(etiquette)])])]
    : [text(label)]);
  if (note) mot.append(el("span", "voyant-note", [text(note)]));
  if (familles) mot.append(el("span", "ligne-familles", [text(familles)]));
  ligne.append(mot);
  /* La lampe est DESSINÉE par la feuille sur `data-on` (un point, `--positive`),
     jamais un glyphe — la même loi qu'au pouce de l'interrupteur. */
  ligne.append(el("span", "voyant-etat", [el("span", "voyant-lampe"), text(etat)]));
  return ligne;
}

/* ══ LA CARTE DE FATE'S HAND, LE CATALOGUE, LES LIVRES ═════════════════════
   ⭐ LOT 191 — la table a DÉMÉNAGÉ dans `interrupteurs.mjs` (feuille sans
   import) et se réexporte en tête de ce fichier. `couches` = les sublayers d'une
   sous-unité (le montage/démontage, lui, suit TOUJOURS `FH_LAYER_IDS` — voir
   `monterLesCouches`, shell.mjs).
   🔄 LOT 351 — DES SIX INTERRUPTEURS, IL EN RESTE UN. Eric, 29/09 : *« Tout ou
   rien »* pour Fate's Hand, et les sous-unités gardées *« comme CARTE de qui
   fait quoi »*. La table n'est plus rendue en lignes ; `compositionFh` la lit
   encore pour juger un perso bâti avant (voir sa tête).
   ⛔ LES IDS Y SONT ÉCRITS EN TOUTES LETTRES, et un garde les confronte à
   `FH_LAYER_IDS` (`tests/ecran-layers.test.mjs`) : l'union des six plus le
   catalogue doit être EXACTEMENT la pile Fate's Hand, sans trou ni doublon.
   Une couche qui entrerait dans `engine.mjs` hors de la carte rougirait là. */

function idsDuDocument(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  return new Set(layers.map((layer) => layer.id));
}

/** LA COMPOSITION FATE'S HAND DU DOCUMENT — lue interrupteur par interrupteur.
 *
 *  Lue sur le DOCUMENT, jamais sur la pile montée (même loi que
 *  `currentStack`) : c'est ce que le joueur a choisi pour CE personnage.
 *
 *  · `socle`     — le SRD et `srfh` sont là (sans eux, rien ne se nomme) ;
 *  · `enfants`   — par interrupteur, `true` si TOUTES ses couches sont déclarées ;
 *  · `catalogue` — les couches de catalogue sont là ;
 *  · `maitre`    — Fate's Hand est ENGAGÉ : le catalogue ou au moins un enfant ;
 *  · `tous`      — les six enfants sont allumés (la pile `srdfh`) ;
 *  · `legitime`  — la composition est une que les interrupteurs PEUVENT
 *                  produire : le socle présent, aucun interrupteur coupé en
 *                  deux (une couche de `Destiny` sans les deux autres), le
 *                  catalogue entier ou absent. ⛔ C'est LA condition de
 *                  l'écran mort (`ecran-mort.mjs`) et du mot rouge du Menu :
 *                  une règle qui MANQUE au milieu d'un ensemble, jamais un
 *                  ensemble entier qu'on a choisi d'éteindre.
 *
 *  🔄 LOT 351 — UN SOUS-ENSEMBLE ENTIER RESTE LÉGITIME, IL N'EST PLUS PRODUCTIBLE.
 *  L'écran ne coupe plus Fate's Hand que tout ou rien (Eric, 29/09) ; un perso bâti
 *  avant, qui déclare Destiny coupé par exemple, n'est pas accusé pour autant : il
 *  dérive, `Rules` dit « Fate's Hand » (`maitre`), et le maître de `Layers` le montre
 *  allumé. L'éteindre puis le rallumer le remet en tout-ou-rien — rien n'est effacé.
 *
 *  @param {object} doc le document `fh-char/1`
 */
export function compositionFh(doc) {
  const ids = idsDuDocument(doc);
  const socle = ids.has(SRD_LAYER_ID) && SRFH_LAYER_IDS.every((id) => ids.has(id));
  let legitime = socle;
  const enfants = {};
  for (const sw of INTERRUPTEURS) {
    const presentes = sw.couches.filter((id) => ids.has(id)).length;
    enfants[sw.id] = presentes === sw.couches.length;
    if (presentes !== 0 && presentes !== sw.couches.length) legitime = false;
  }
  const catalogueN = CATALOGUE_FH.filter((id) => ids.has(id)).length;
  const catalogue = catalogueN === CATALOGUE_FH.length;
  if (catalogueN !== 0 && !catalogue) legitime = false;
  const maitre = catalogue || Object.values(enfants).some(Boolean);
  const tous = catalogue && INTERRUPTEURS.every((sw) => enfants[sw.id]);
  return { socle, enfants, catalogue, maitre, tous, legitime };
}

/* 🗄️ LOT 351 — `couchesApresLeGeste` EST PARTI AVEC LES SIX INTERRUPTEURS. Il rendait
   les couches à laisser montées après le geste d'UN enfant (la dépendance Inheritance →
   Trainings comprise) ou du maître. Les enfants ne sont plus des gestes (Eric, 29/09 :
   *« Tout ou rien »*), et le maître passe par `applyLayerStack` (shell.mjs), qui monte
   `FH_LAYER_IDS` ou rien — la fonction n'avait plus d'appelant (loi §0.6, pas de code
   mort). Ses gardes (`tests/ecran-layers.test.mjs`, C1-C4) sont partis avec elle. */

/** LES GESTES QUI RANGENT LA PILE MONTÉE SUR LE DOCUMENT — pure, pour que le
 *  garde la lise sur la vraie pile sans coquille (`alignerLaPileSurLeDocument`,
 *  shell.mjs, ne fait qu'appliquer ce qu'elle rend).
 *
 *  Ne bougent que les couches PILOTABLES : Fate's Hand et le contenu (livres,
 *  homebrew) — ⛔ jamais le SRD ni `srfh`, qui sont le plancher. On éteint par
 *  le HAUT (l'ordre du manifeste à l'envers), on allume par le BAS : la leçon
 *  du lot 77, `fh-fiche-en` patche ce que `fh-species-en` ajoute.
 *
 *  @param {Array<{id:string, enabled:boolean}>} pile le manifeste de la pile montée
 *  @param {Iterable<string>} declares les ids que `document.build.layers` déclare
 *  @returns {{eteindre: string[], allumer: string[]}} dans l'ordre d'application
 */
export function gestesDAlignement(pile, declares) {
  const voulus = new Set(declares);
  const pilotables = (Array.isArray(pile) ? pile : [])
    .filter((c) => c && (FH_LAYER_IDS.includes(c.id) || !RULE_LAYER_IDS.includes(c.id)));
  return {
    eteindre: [...pilotables].reverse().filter((c) => c.enabled && !voulus.has(c.id)).map((c) => c.id),
    allumer: pilotables.filter((c) => !c.enabled && voulus.has(c.id)).map((c) => c.id)
  };
}

/* 🗄️ LOT 351 — `recordsDe` EST PARTI AUSSI : il comptait les records d'un interrupteur
   enfant pour sa note (« 13 records »). Plus d'enfant, plus de note, plus d'appelant. */

/** LES MOTS DE `Layers` — les brouillons du plan v10 (`base book`, `your copy`,
 *  `installed, not active`, `options`) et de la dictée du 29/09. ⚖️ C'est Eric qui
 *  arrête les mots que le joueur lit : ils vivent ICI, une fois, et se corrigent ici. */
export const MOTS_DE_LAYERS = Object.freeze({
  titre: "Layers",
  etiquetteSocle: "base book",
  etiquetteLivre: "your copy",
  eteints: "installed, not active",
  options: "options",
  importer: "Import a book",
  absent: "not on this device",
  /* le mot de TOUTE place réservée (`placeReservee`, `ligneReservee`) : le même, jamais un autre */
  bientot: "soon"
});
/* 🗄️ `tableItems` (« + Table items ») EST PARTI — Eric, 29/09 : *« table items devient ->
   campaign items (et va dans Dungeon master) »*. La place vit désormais dans la page
   Dungeon Master (lot 357), sous le nom « Campaign items ». */

/** Les mots de la question — brouillons (le plan v10 : « le livre devra être
 *  réimporté ») ; Eric arrête les mots. */
export const MOTS_EFFACER_UN_LIVRE = Object.freeze({
  titre: "Delete this book?",
  texte: "It leaves this device. To use it again, you will have to import it again."
});

/** LA QUESTION AVANT D'EFFACER UN LIVRE — ⚖️ Eric, 29/09 : Delete a book *« demande
 *  aussi une confirmation »*, et la poubelle remplace le bouton (*« juste une poubelle à
 *  côté comme My Characters »*). La description d'état que `paintPopup` sait peindre
 *  (`{titre, role, texte, actions}`) — ⛔ aucun composant neuf, et ⛔ elle ne sait pas
 *  ce que `choisir` fait : la coquille décide.
 *  · rôle `guide` — elle prévient ; `Delete` porte `defait`, le rouge de ce qui coûte ;
 *  · elle n'EXIGE pas de réponse : rien n'est effacé avant le choix, un tap dehors
 *    vaut `Cancel`.
 *  @param {{nom: string, choisir: (voie: "cancel"|"delete") => void}} p */
export function popupEffacerUnLivre({ nom, choisir }) {
  return {
    titre: MOTS_EFFACER_UN_LIVRE.titre,
    role: "guide",
    texte: `${nom}\n${MOTS_EFFACER_UN_LIVRE.texte}`,
    actions: [
      { mot: "Cancel", defait: false, faire: () => choisir("cancel") },
      { mot: "Delete", defait: true, faire: () => choisir("delete") }
    ]
  };
}

const lesFamilles = (familles) => familles.join(" · ");

/** UNE LIGNE DE LIVRE MONTÉ — son interrupteur (allumé si le document le déclare), ses
 *  familles, l'étiquette « your copy », et la POUBELLE tout à droite. ⛔ La poubelle
 *  n'efface rien : elle DEMANDE (`demanderEffacerUnLivre`), et la question vient avant.
 *  ⏳ ET ELLE EST ÉTEINTE, « soon » sous elle — Eric, 29/09 : « La poubelle d'un livre efface son contenu de son lieu de stockage. Ce lieu de stockage est
 *  décidé par le bouton vault. »
 *  Aucun livre ne vit encore dans ce stockage (`Import a book` et les connecteurs du Vault
 *  sont hors du lot 351) : effacer le fichier servi à la page n'est pas le geste dicté. */
function ligneDeLivre(livre, monte, declare, onAction) {
  const nom = monte.name || livre.nom;
  const sw = interrupteur({
    label: nom, etiquette: MOTS_DE_LAYERS.etiquetteLivre, familles: lesFamilles(livre.familles), on: declare,
    onChange: (on) => onAction({ kind: "requestBookSwitch", id: livre.id, value: on })
  });
  sw.dataset.livre = livre.id;
  const trash = poubelle({ mot: `Delete ${nom}`, eteinte: true, onClick: () => onAction({ kind: "demanderEffacerUnLivre", id: livre.id }) });
  const place = el("div", "tdc-place", [trash, el("span", "tdc-bientot", [text(MOTS_DE_LAYERS.bientot)])]);
  const ligne = el("div", "layers-livre", [sw, place]);
  ligne.dataset.ligneLivre = livre.id;
  return ligne;
}

/** 🎛️ L'ÉCRAN `Layers` — le rang B du Menu, tel qu'Eric l'a dicté le 29/09 (lot 351).
 *
 *  ⚖️ La dictée, mot pour mot : *« B0 — other page - Layers · SRD (tj actif) engine/catalog
 *  (en italique t0) · PHB (bouton activé) … catalog · DMG (bouton activé) … catalog · FH
 *  (bouton activé) engine/world/catalog · ---- éléments installés mais pas actifs ---- ·
 *  Paname (bouton désactivé) … · ---- Options ---- · Bouton import a book »*.
 *  Puis, chaque réponse avec sa question : Fate's Hand interrupteur par interrupteur ? →
 *  *« Non. Tout ou rien »* ; « Delete a book » : comment choisit-on le livre ? → *« pas de
 *  bouton delete a book, juste une poubelle à côté comme My Characters »* ; la rangée
 *  « installed, not active » quand rien n'est éteint ? → **cachée** ; PHB, DMG, Faerûn,
 *  Spelljammer ? → **des exemples** (Panam n'existe pas) : seuls les livres INSTALLÉS se
 *  montent, et ce sont les seuls qu'on montre. Fate's Hand éteint ? → *« Descend sous
 *  "installed, not active" »*. `+ Table items` ? → *« table items devient -> campaign items
 *  (et va dans Dungeon master) »*.
 *
 *  ⭐ DEUX GROUPES, ET CHAQUE LIGNE VA OÙ SON ÉTAT LA MET : en haut ce qui est actif (le
 *  SRD, toujours ; un livre que le perso déclare ; Fate's Hand engagé), sous le séparateur
 *  ce qui est installé mais éteint. Puis les options.
 *  ⛔ IL NE PORTE PAS SA PROPRE SORTIE : `data-sortie-ici` la déclare, et c'est la coquille
 *  qui produit la paire — la même loi que Display.
 *
 *  @param {object} ctx
 *  @param {object} ctx.document       le document `fh-char/1`
 *  @param {Array} [ctx.pile]          le manifeste de la pile montée (`layers.verbs.stack()`)
 *  @param {Array} [ctx.livresRefuses] `[{id, raison}]` — un livre présent mais illisible
 *  @param {(action: object) => void} onAction
 *    `{kind:"requestLayerStack", value}` (Fate's Hand — la coquille confirme) ·
 *    `{kind:"requestBookSwitch", id, value}` (un livre monté) ·
 *    `{kind:"demanderEffacerUnLivre", id}` (sa poubelle).
 */
export function renderLayersEcran(ctx, onAction) {
  const doc = ctx.document;
  const composition = compositionFh(doc);
  const pile = Array.isArray(ctx.pile) ? ctx.pile : null;
  const section = el("section", "universe-step layers-ecran dalle-intermediaire");
  section.dataset.objet = "dalle";
  section.dataset.sortieIci = "true";
  section.dataset.ecran = "layers";
  section.append(el("h3", "tdc-titre-b", [text(MOTS_DE_LAYERS.titre)]));
  /* 🗄️ LOT 351 — LA NOTE DU LOT 188 EST PARTIE (« The base, then the layers stacked on it. A
     layer you switch off degrades the sheet… »). 📏 Mesuré au banc à 375 × 812, deux livres
     installés : quatre lignes, 68 px, et la scène débordait de 9 px — Eric : *« on respecte
     les hauteurs de dalle, pas de scroll »*. C'est ce que la page portait EN TROP : ni la
     dictée de B0 ni le mandat ne la nomment, et ce qu'elle disait (rien n'est effacé, tout
     revient) est dit là où il sert — dans la question de Fate's Hand (*« they stay saved,
     and resume as soon as you switch it back on »*). */

  const actifs = [];
  const eteints = [];

  /* ① LE SOCLE — un VOYANT, pas un interrupteur verrouillé (Eric, 09/09) : le SRD est
     toujours actif, c'est le plancher et la promesse du produit (« ce que tu construis
     reste ouvrable par n'importe qui »). */
  const socle = voyant({ label: SOCLE.label, etiquette: MOTS_DE_LAYERS.etiquetteSocle, familles: lesFamilles(SOCLE.familles) });
  socle.dataset.socle = "true";
  actifs.push(socle);

  /* ② LES LIVRES DU JOUEUR — sa copie, fabriquée sur son appareil (`layers-livres/`).
     ⭐ Seuls les livres INSTALLÉS se montrent : un livre absent n'a rien à régler ni à
     effacer. ⚠️ Sauf s'il est DÉCLARÉ par le perso (ouvert sur un autre appareil —
     A-TRANCHER §C34) : alors il se montre, éteint, avec son mot, pour que le joueur sache
     ce qui manque. Un livre présent mais illisible dit sa raison. */
  const ids = idsDuDocument(doc);
  const refuses = Array.isArray(ctx.livresRefuses) ? ctx.livresRefuses : [];
  for (const livre of LIVRES_DU_JOUEUR) {
    const monte = pile ? pile.find((c) => c && c.id === livre.id) : null;
    const refus = refuses.find((r) => r && r.id === livre.id);
    const declare = ids.has(livre.id);
    if (monte) {
      (declare ? actifs : eteints).push(ligneDeLivre(livre, monte, declare, onAction));
    } else if (declare || refus) {
      const b = ligneReservee(livre.nom, refus ? `unreadable: ${refus.raison}` : MOTS_DE_LAYERS.absent);
      b.dataset.livre = livre.id;
      (declare ? actifs : eteints).push(b);
    }
  }

  /* ③ FATE'S HAND — UN SEUL INTERRUPTEUR, tout ou rien (Eric, 29/09). Le geste est celui
     du maître depuis le lot 188 (`requestLayerStack`) : la coquille confirme avant
     d'éteindre, à trois voies (lot 192). ⛔ Ni poubelle ni étiquette : Fate's Hand vient
     avec le builder, il ne s'efface pas. Éteint, il *« Descend sous "installed, not
     active" »* (Eric, 29/09).
     ⭐ LA CONFIRMATION N'EST PLUS DANS LA PAGE — ARCHI 35, 29/09, tranché en architecte :
     posée sous lui (le placement du 09/09, pour qu'elle ne tombe pas sous le pli), elle
     faisait DÉFILER Layers de 127 px à 1280 × 800 (mesuré au banc). La coquille la peint
     en FENÊTRE depuis `pendingStack` (`paintPopup`), réponse exigée : là où le geste
     a été fait, par-dessus la page, sans rien pousser. */
  const maitre = interrupteur({
    label: MAITRE.label, familles: lesFamilles(MAITRE.familles), on: composition.maitre,
    onChange: (on) => onAction({ kind: "requestLayerStack", value: on ? "srdfh" : "srd" })
  });
  maitre.dataset.maitre = "true";
  (composition.maitre ? actifs : eteints).push(maitre);

  const lignes = el("div", "tdc-lignes");
  lignes.append(...actifs);
  /* ④ « INSTALLED, NOT ACTIVE » — le séparateur et sa liste, SEULEMENT S'IL Y EN A
     (Eric, 29/09 : la rangée vide est cachée). */
  if (eteints.length > 0) {
    lignes.append(el("p", "tdc-regle", [text(MOTS_DE_LAYERS.eteints)]));
    lignes.append(...eteints);
  }
  /* ⑤ LES OPTIONS — `Import a book`, place réservée : présente, éteinte, un mot sous elle
     (le pipeline ne tourne que sur le Mac, hors de ce lot). ⛔ Plus de `Delete a book` :
     chaque livre porte sa poubelle. 🗄️ `+ Table items` est parti dans Dungeon Master
     (Eric, 29/09 : *« table items devient -> campaign items »*, lot 357). */
  lignes.append(el("p", "tdc-regle", [text(MOTS_DE_LAYERS.options)]));
  const importer = placeReservee(MOTS_DE_LAYERS.importer);
  importer.dataset.importer = "true";
  lignes.append(el("div", "layers-options", [importer]));
  section.append(lignes);

  return section;
}

/** ⭐ LOT 193 — LE MANIFESTE D'UNE PILE MONTÉE, la forme de `$defs/layerRef`.
 *
 *  📏 CE N'EST PAS UNE FORME INVENTÉE ICI : c'est MOT POUR MOT celle que
 *  `rebuild` compose pour adopter la pile (`mounted`, src/build/block.mjs) et
 *  celle de `src/tools/exemple-fh-en.mjs` — `{id, version, hash}`, plus `name`
 *  QUAND la couche en porte un, jamais une clef posée à vide.
 *
 *  🔴 POURQUOI LE NAVIGATEUR EN A BESOIN : `rebuild` n'adopte la pile QUE
 *  lorsqu'il réussit à dériver, et un personnage NEUF ne dérive pas (pas de
 *  classe). Sans cette fonction, le document du joueur qui vient de choisir son
 *  jeu ne DÉCLARERAIT rien, et le Menu l'accuserait en rouge.
 *
 *  ⚠️ DEUX ÉCRIVAINS DE LA MÊME FORME, ET UN GARDE LES CONFRONTE
 *  (`tests/premier-pas.test.mjs`) : le jour où `$defs/layerRef` gagne un champ,
 *  c'est ce garde qui le dit, pas une fiche fausse chez un joueur.
 *
 *  ⛔ PURE, et elle reçoit la pile — elle ne va pas la chercher : c'est ce qui
 *  la rend lisible par un test sans coquille et sans navigateur.
 *
 *  @param {{id: string, version: string, hash: string, name?: string, enabled: boolean}[]} pile ce que `layers.verbs.stack()` rend
 *  @returns {{id: string, version: string, hash: string, name?: string}[]} */
export function manifesteDeLaPile(pile) {
  return (Array.isArray(pile) ? pile : [])
    .filter((couche) => couche && couche.enabled)
    .map((couche) => {
      const ref = { id: couche.id, version: couche.version, hash: couche.hash };
      if (typeof couche.name === "string") ref.name = couche.name;
      return ref;
    });
}

/* Les deux constantes sont réexportées pour que le garde des listes n'ait
   qu'un import : les ids des livres viennent de `universe-step.mjs`. */
export { LIVRE_LAYER_IDS };
