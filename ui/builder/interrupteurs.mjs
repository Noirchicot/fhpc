/* ══ LES INTERRUPTEURS DE `Layers` — LA TABLE, SANS L'ÉCRAN — lot 191 ═════
   ⛔ CE MODULE N'IMPORTE RIEN, ET C'EST SA RAISON D'ÊTRE. La table
   interrupteur → couches vivait dans `layers-ecran.mjs`, qui importe
   `universe-step.mjs`, qui importe la moitié du builder. Or le mot d'un choix
   non résolu (`mot-du-choix.mjs`) doit NOMMER l'interrupteur qui porte le
   record — *« Araag comes with World — switch it on in Layers »* (Eric, 09/09,
   l'interrupteur renommé le 10/09 ; depuis le lot 351, *« … comes with Fate's
   Hand »* : un seul interrupteur, tout ou rien) — et ce mot est lu par `carnet.mjs`,
   `catalogue.mjs`, tous les écrans :
   un import de l'écran `Layers` depuis là ferait un cycle. La table descend
   donc ici, feuille sans import, et `layers-ecran.mjs` la réexporte : ses
   lecteurs (l'écran, les gardes) ne changent pas d'adresse.

   ⚖️ LES DEUX RÈGLES D'ERIC DU 09/09, gravées dans `ARCHITECTURE.md`
   (§ « LES ESPÈCES FATE'S HAND SONT DU LORE ») :
     *« Il n'y a pas d'Araag dans SRD si le bouton Lore n'est pas poussé. »*
     *« Lore rajoute le monde FH sans les règles. »*
   ⇒ `fh-species-en` est du MONDE — ce qu'une espèce PORTE (son nom, ses
   lignages, ses traits nommés) est du monde, et vient avec cet interrupteur ;
   ce qu'un trait FAIT vient de son propre interrupteur, inerte sans lui. Le
   lot 188 l'avait posée au catalogue « parce qu'elle suit le maître » ; elle
   en sort. Les gemmes, elles, restent du catalogue : une pierre n'est pas de
   l'ambiance.

   ⚖️ LOT 192 — L'INTERRUPTEUR S'APPELLE `World`. Eric, 10/09, dans le lexique
   (`ARCHITECTURE.md`, § « LE LEXIQUE ») : *« pas Lore mais World ? ça me va »*
   — **World** = *les descriptions, l'ambiance, et les espèces et classes dans
   leur version SRD*. Les citations du 09/09 ci-dessus gardent leur mot : c'est
   ce qu'Eric a dit ce jour-là, et la règle n'a pas changé de sens, seulement
   de nom. ⛔ « Lore » n'est plus un mot du joueur : ni sur l'écran `Layers`,
   ni dans le mot d'un choix non résolu, ni sur l'écran mort. Un garde le tient
   sur le TEXTE RENDU (`tests/ecran-layers.test.mjs`, G1).
   ⚠️ L'ID INTERNE RESTE `lore`, ET IL NE MENT PAS : c'est un nom de
   construction, comme `fh-lore-en` (la couche) et `fh.lore` (le drapeau) — il
   ne sort qu'en clef de `compositionFh().enfants` (le `data-enfant="lore"` de
   l'organe est parti au lot 351 avec les six lignes), jamais dans un texte. Le renommer aurait renommé
   des ids que des tests et des documents lisent, pour un mot que personne ne
   voit.

   ⚠️ L'ORDRE DE MONTAGE (lot 77) : `fh-fiche-en` et `fh-lore-en` PATCHENT les
   trois espèces que `fh-species-en` AJOUTE. Le montage suit toujours
   `FH_LAYER_IDS` (`monterLesCouches`, shell.mjs ; `gestesDAlignement`) — on
   allume par le bas, on éteint par le haut — donc l'ensemble World s'allume
   species → fiche → lore et s'éteint dans l'ordre inverse. La liste ci-dessous
   est écrite dans l'ordre du manifeste pour qu'un lecteur le voie ; ce n'est
   pas elle qui ordonne le geste. */

/** LA CARTE DE FATE'S HAND — qui fait quoi, couche par couche (la coupe d'Eric du
 *  08/09). `couches` = les sublayers d'une sous-unité ; `exige` = une autre
 *  sous-unité sans laquelle celle-ci n'a pas de sens (l'Inheritance sans les
 *  Trainings n'offre plus de langue).
 *  🔄 LOT 351 — CE NE SONT PLUS DES INTERRUPTEURS. Eric, 29/09, à « Fate's Hand se
 *  règle interrupteur par interrupteur ? » : *« Non. Tout ou rien »* — *« on branche
 *  ou on branche pas »*, et au Menu **un seul interrupteur FH** ; à « et les
 *  sous-moteurs ? » : gardés *« comme CARTE de qui fait quoi — ça a été très utile
 *  pour dire qui fait quoi, je ne veux pas que ça tombe dans l'oubli »*.
 *  ⇒ La table reste (c'est la carte), `Layers` ne la montre plus comme six lignes,
 *  et `compositionFh` la lit encore : un perso bâti avant le lot 351 peut déclarer
 *  une sous-unité entière coupée — il reste LÉGITIME (rien ne l'accuse), il n'est
 *  simplement plus PRODUCTIBLE depuis l'écran. 🗄️ `motSiDort` (« off while
 *  Trainings is off ») est parti avec les six lignes : c'était un mot d'écran.
 *  ⛔ LES IDS SONT ÉCRITS ICI EN TOUTES LETTRES, et un garde les confronte à
 *  `FH_LAYER_IDS` (`tests/ecran-layers.test.mjs`) : l'union des six plus le
 *  catalogue doit être EXACTEMENT la pile Fate's Hand, sans trou ni doublon. */
export const INTERRUPTEURS = Object.freeze([
  { id: "trainings",   label: "Trainings",      note: "languages, dark rituals",              couches: ["fh-trainings-en"] },
  { id: "skills",      label: "Skills & tools", note: "tiers and the skill pool",             couches: ["fh-skills-en"] },
  { id: "inheritance", label: "Inheritance",    note: "one origin, in place of backgrounds",  couches: ["fh-inheritance-en"],
    exige: "trainings" },
  { id: "destiny",     label: "Destiny",        note: "22 Arcana, the die, the Tilt",         couches: ["fh-arcana-en", "fh-feats-en", "fh-spells-en"] },
  /* ⚖️ WORLD = LE MONDE : les trois espèces neuves (Araag, Elestu, Loroka) et
     les textes de fiche — Eric, 09/09 ; nommé `World` le 10/09 (*« Lore
     rajoute le monde FH sans les règles »* → « Nymedes — the world without
     its rules »). Trois couches, dans l'ordre du manifeste. L'id `lore` est
     un nom de construction (tête de fichier). */
  { id: "lore",        label: "World",          note: "Nymedes — the world without its rules", couches: ["fh-species-en", "fh-fiche-en", "fh-lore-en"] },
  { id: "soulforging", label: "Soulforging",    note: "the forge and its items",              couches: ["fh-soulforging-en"] }
].map(Object.freeze));

/** LE CATALOGUE FATE'S HAND — les 54 gemmes. Du contenu, pas une règle : il
 *  n'a pas d'interrupteur, il suit le maître. ⛔ Les espèces n'y sont plus
 *  (09/09) : elles sont du World. */
/* ⭐ LES MUNITIONS SONT DU CATALOGUE, comme les gemmes : une flèche n'est pas
   de l'ambiance. Même raison que celle écrite plus haut pour la pierre. */
export const CATALOGUE_FH = Object.freeze(["fh-gems-en", "fh-munitions-en"]);

/** LE MAÎTRE — l'interrupteur `Fate's Hand` de `Layers`, le SEUL depuis le lot 351
 *  (tout ou rien). C'est LUI que le mot nomme pour TOUT record Fate's Hand :
 *  *« Araag comes with Fate's Hand — switch it on in Layers »*.
 *  `familles` — ce que la source apporte, lu à l'écran *« en italique t0 »* (Eric,
 *  29/09, la dictée de B0 : « FH … engine/world/catalog »). */
export const MAITRE = Object.freeze({ id: "maitre", label: "Fate's Hand", familles: Object.freeze(["engine", "world", "catalog"]) });

/** LE SOCLE — le SRD, toujours actif : un voyant, jamais un interrupteur (09/09).
 *  ⚖️ La dictée du 29/09 : *« SRD (tj actif) engine/catalog (en italique t0) »*, et à
 *  « le SRD dans Books ? » : *« le SRD est le book de base »* (engine + catalog). */
export const SOCLE = Object.freeze({ label: "SRD 5.2.1", familles: Object.freeze(["engine", "catalog"]) });

/** LES LIVRES DU JOUEUR, avec le nom que l'écran affiche quand le livre n'est
 *  PAS monté (un livre monté porte son nom dans le manifeste). ⛔ Les noms
 *  viennent de `src/tools/gen-livre-layer.mjs` (`LIVRES`), qui ne s'importe pas
 *  dans un navigateur ; un garde tient les deux listes ensemble. */
/* ⚖️ LOT 350 — `court` : le mot du livre sur la ligne `Books` du Menu R, celui du
   plan v10 (« SRD · FH · PHB · DMG », Eric, 29/09). ⛔ Ce n'est pas le `sigle` du
   générateur (`XPHB`, le code de la source) : c'est le mot que le joueur lit. */
export const LIVRES_DU_JOUEUR = Object.freeze([
  { id: "xphb-en", nom: "Player's Handbook (2024)", court: "PHB", familles: Object.freeze(["catalog"]) },
  { id: "xdmg-en", nom: "Dungeon Master's Guide (2024)", court: "DMG", familles: Object.freeze(["catalog"]) }
].map(Object.freeze));
/* ⚖️ LOT 351 — `familles` : un livre de règles de base n'apporte que du CATALOGUE
   (la carte du 29/09 : « CORE RULES n'a QUE des catalogues »). */

/** L'INTERRUPTEUR QUI PORTE UNE COUCHE — `{id, label}`, ou `null` pour une
 *  couche qu'aucun interrupteur ne pilote (le SRD, `srfh` : le plancher).
 *  🔄 LOT 351 — TOUTE COUCHE FATE'S HAND EST PORTÉE PAR LE MAÎTRE : il n'y a plus
 *  d'interrupteur « World » ni « Destiny » à pousser, et un mot qui les nommerait
 *  enverrait le joueur vers une ligne qui n'existe pas. */
export function interrupteurDeLaCouche(coucheId) {
  if (INTERRUPTEURS.some((sw) => sw.couches.includes(coucheId))) return MAITRE;
  if (CATALOGUE_FH.includes(coucheId)) return MAITRE;
  const livre = LIVRES_DU_JOUEUR.find((l) => l.id === coucheId);
  if (livre) return { id: livre.id, label: livre.nom };
  return null;
}

/* ══ DANS QUELLE COUCHE VIT UN ID — UN REPLI, ET IL LE DIT ═══════════════
   📏 MESURÉ LE 10/09 SUR `src/layers/stack.mjs` : le bloc `layers` enregistre
   toutes les couches, éteintes comprises, mais n'expose AUCUN verbe qui dise
   d'où vient un id — `query` ne lit que le pli des couches ACTIVES (§L7.1,
   « le seul chemin de lecture du contenu »), `stack()` rend le manifeste
   (ids, drapeaux, comptes) sans les records, et `engine.mjs` jette les
   octets de `layers/<id>.layer.json` sitôt `register` appelé. Le chemin
   propre — un verbe `origin({kind, id})` du bloc `layers` — toucherait le
   contrat du bloc (`contracts/layers.md`) : c'est un choix d'Eric, nommé
   dans le bilan du lot, pas pris ici.

   ⭐ LE REPLI : LE PRÉFIXE DE L'ID. Chaque couche Fate's Hand n'AJOUTE que
   des ids d'un ou deux préfixes (`fh:species:` → `fh-species-en`), mesuré sur
   les treize fichiers du dépôt le 10/09 :

       fh-arcana-en       fh:arcana
       fh-feats-en        fh:feat
       fh-gems-en         fh:gem · srfh:gem · (fh:shelving, srfh:shelving)
       fh-munitions-en    fh:gear · (fh:shelving)
       fh-inheritance-en  fh:background
       fh-skills-en       fh:skill · fh:tool
       fh-soulforging-en  fh:tool (UN : soulforging) · fh:spell (UN : transfer-essence)
       fh-species-en      fh:species
       fh-spells-en       fh:spell
       fh-trainings-en    fh:training

   ⚠️ ET CE N'EST PAS UNE BIJECTION — *« une bijection fausse est cohérente »*
   (mémoire de la maison). `fh:tool` et `fh:spell` sont partagés par DEUX
   couches : Soulforging ajoute un outil et un sort sous les préfixes de
   Skills et de Spells. Le préfixe seul les aurait rangés sous la mauvaise
   couche (et, jusqu'au lot 351, sous le mauvais interrupteur), en silence. D'où `COUCHE_PAR_ID` : les deux ids nommés.
   ⛔ Une liste d'exceptions par nom ne dit pas qu'elle est incomplète — c'est
   un garde qui le dit : `tests/jamais-un-id-nu.test.mjs` relit CHAQUE id
   ajouté par CHAQUE couche Fate's Hand sur le disque et exige que
   `coucheDUnId` rende sa couche. Une couche neuve, un préfixe neuf, un
   troisième outil Soulforge : rouge.

   Les rangements (`shelving`) ne sont pas dans la table : un rangement n'est
   jamais la cible d'un `ref` de choix (les genres qu'un choix désigne :
   `src/build/decisions.mjs`), et `srfh:shelving` est ajouté à la fois par le
   plancher et par les gemmes. Le garde les exclut, et le dit.

   Le plancher (`srd:`, `srfh:` hors gemmes) rend `null` : il est toujours
   monté, un record du SRD ne peut pas manquer par un interrupteur. */
const COUCHE_PAR_PREFIXE = Object.freeze({
  "fh:arcana": "fh-arcana-en",
  "fh:feat": "fh-feats-en",
  "fh:gem": "fh-gems-en",
  "srfh:gem": "fh-gems-en",
  "fh:gear": "fh-munitions-en",
  "fh:background": "fh-inheritance-en",
  "fh:skill": "fh-skills-en",
  "fh:tool": "fh-skills-en",
  "fh:spell": "fh-spells-en",
  "fh:species": "fh-species-en",
  "fh:training": "fh-trainings-en",
  /* Les livres du joueur : `gen-livre-layer.mjs` écrit `<sigle>:<genre>:en:<slug>`. */
  "xphb": "xphb-en",
  "xdmg": "xdmg-en"
});

/** Les ids que le préfixe rangerait sous la MAUVAISE couche — mesurés, et
 *  gardés contre le disque (voir la tête de section). */
export const COUCHE_PAR_ID = Object.freeze({
  "fh:tool:en:soulforging": "fh-soulforging-en",
  "fh:spell:en:transfer-essence": "fh-soulforging-en",
  /* ⭐ LES QUATRE PLANS DU SOULFORGING (Eric, 24/09) — et ils sont ici pour la
     même raison que les deux d'au-dessus : `fh:gear` appartient à
     `fh-munitions-en` par préfixe, et ces quatre-là n'en sont pas.
     ⛔ LE PRÉFIXE NE PEUT PAS LES DISTINGUER, et ce n'est pas une faiblesse à
     réparer : `fh:gear:en:…` dit le genre et la langue, jamais la couche. Deux
     couches Fate's Hand qui ajoutent du `gear` se partagent donc le même
     préfixe, par construction. ⭐ C'est exactement ce que cette table existe
     pour dire, et le garde B3 l'a attrapée au premier record. */
  "fh:gear:en:soulgem": "fh-soulforging-en",
  "fh:gear:en:catalyst-part": "fh-soulforging-en",
  "fh:gear:en:structure-part": "fh-soulforging-en",
  "fh:gear:en:soulforged-item": "fh-soulforging-en"
});

/** LA COUCHE QUI AJOUTE UN ID — un repli par préfixe (voir ci-dessus), ou
 *  `null` : le plancher, un rangement, ou un id d'une forme inconnue. */
export function coucheDUnId(id) {
  if (typeof id !== "string" || id === "") return null;
  if (COUCHE_PAR_ID[id]) return COUCHE_PAR_ID[id];
  const segments = id.split(":");
  const deux = segments.slice(0, 2).join(":");
  if (COUCHE_PAR_PREFIXE[deux]) return COUCHE_PAR_PREFIXE[deux];
  return COUCHE_PAR_PREFIXE[segments[0]] || null;
}

/** L'INTERRUPTEUR QUI PORTE UN ID — `{id, label}` ou `null`. C'est ce que le
 *  mot d'un choix non résolu nomme : *« Araag comes with Fate's Hand »* (lot 351 ;
 *  « World » avant, quand chaque sous-unité avait sa ligne). */
export function interrupteurDUnId(id) {
  const couche = coucheDUnId(id);
  return couche ? interrupteurDeLaCouche(couche) : null;
}
