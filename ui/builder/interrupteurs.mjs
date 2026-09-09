/* ══ LES INTERRUPTEURS DE `Layers` — LA TABLE, SANS L'ÉCRAN — lot 191 ═════
   ⛔ CE MODULE N'IMPORTE RIEN, ET C'EST SA RAISON D'ÊTRE. La table
   interrupteur → couches vivait dans `layers-ecran.mjs`, qui importe
   `universe-step.mjs`, qui importe la moitié du builder. Or le mot d'un choix
   non résolu (`mot-du-choix.mjs`) doit NOMMER l'interrupteur qui porte le
   record — *« Araag comes with Lore — switch it on in Layers »* (Eric, 09/09)
   — et ce mot est lu par `carnet.mjs`, `catalogue.mjs`, tous les écrans :
   un import de l'écran `Layers` depuis là ferait un cycle. La table descend
   donc ici, feuille sans import, et `layers-ecran.mjs` la réexporte : ses
   lecteurs (l'écran, les gardes) ne changent pas d'adresse.

   ⚖️ LES DEUX RÈGLES D'ERIC DU 09/09, gravées dans `ARCHITECTURE.md`
   (§ « LES ESPÈCES FATE'S HAND SONT DU LORE ») :
     *« Il n'y a pas d'Araag dans SRD si le bouton Lore n'est pas poussé. »*
     *« Lore rajoute le monde FH sans les règles. »*
   ⇒ `fh-species-en` est du LORE — ce qu'une espèce PORTE (son nom, ses
   lignages, ses traits nommés) est du monde, et vient avec Lore ; ce qu'un
   trait FAIT vient de son propre interrupteur, inerte sans lui. Le lot 188
   l'avait posée au catalogue « parce qu'elle suit le maître » ; elle en sort.
   Les gemmes, elles, restent du catalogue : une pierre n'est pas de l'ambiance.

   ⚠️ L'ORDRE DE MONTAGE (lot 77) : `fh-fiche-en` et `fh-lore-en` PATCHENT les
   trois espèces que `fh-species-en` AJOUTE. Le montage suit toujours
   `FH_LAYER_IDS` (`monterLesCouches`, shell.mjs ; `gestesDAlignement`) — on
   allume par le bas, on éteint par le haut — donc l'ensemble Lore s'allume
   species → fiche → lore et s'éteint dans l'ordre inverse. La liste ci-dessous
   est écrite dans l'ordre du manifeste pour qu'un lecteur le voie ; ce n'est
   pas elle qui ordonne le geste. */

/** LES SIX INTERRUPTEURS — la coupe d'Eric du 08/09, couche par couche.
 *  L'ordre est celui de son dessin. `couches` = ce que l'interrupteur allume
 *  et éteint ; `exige` = un autre interrupteur sans lequel celui-ci dort.
 *  ⛔ LES IDS SONT ÉCRITS ICI EN TOUTES LETTRES, et un garde les confronte à
 *  `FH_LAYER_IDS` (`tests/ecran-layers.test.mjs`) : l'union des six plus le
 *  catalogue doit être EXACTEMENT la pile Fate's Hand, sans trou ni doublon. */
export const INTERRUPTEURS = Object.freeze([
  { id: "trainings",   label: "Trainings",      note: "languages, dark rituals",              couches: ["fh-trainings-en"] },
  { id: "skills",      label: "Skills & tools", note: "tiers and the skill pool",             couches: ["fh-skills-en"] },
  { id: "inheritance", label: "Inheritance",    note: "one origin, in place of backgrounds",  couches: ["fh-inheritance-en"],
    exige: "trainings", motSiDort: "off while Trainings is off" },
  { id: "destiny",     label: "Destiny",        note: "22 Arcana, the die, the Tilt",         couches: ["fh-arcana-en", "fh-feats-en", "fh-spells-en"] },
  /* ⚖️ LORE = LE MONDE : les trois espèces neuves (Araag, Elestu, Loroka) et
     les textes de fiche — Eric, 09/09. Trois couches, dans l'ordre du manifeste. */
  { id: "lore",        label: "Lore",           note: "the species, names and flavour of Nymedes", couches: ["fh-species-en", "fh-fiche-en", "fh-lore-en"] },
  { id: "soulforging", label: "Soulforging",    note: "the forge and its items",              couches: ["fh-soulforging-en"] }
].map(Object.freeze));

/** LE CATALOGUE FATE'S HAND — les 54 gemmes. Du contenu, pas une règle : il
 *  n'a pas d'interrupteur, il suit le maître. ⛔ Les espèces n'y sont plus
 *  (09/09) : elles sont du Lore. */
export const CATALOGUE_FH = Object.freeze(["fh-gems-en"]);

/** LE MAÎTRE — l'interrupteur `Fate's Hand` de `Layers` et du Menu, celui
 *  qui allume les six d'un coup. C'est LUI que le mot nomme pour un record
 *  du catalogue : une gemme ne vient avec aucun enfant. */
export const MAITRE = Object.freeze({ id: "maitre", label: "Fate's Hand" });

/** LES LIVRES DU JOUEUR, avec le nom que l'écran affiche quand le livre n'est
 *  PAS monté (un livre monté porte son nom dans le manifeste). ⛔ Les noms
 *  viennent de `src/tools/gen-livre-layer.mjs` (`LIVRES`), qui ne s'importe pas
 *  dans un navigateur ; un garde tient les deux listes ensemble. */
export const LIVRES_DU_JOUEUR = Object.freeze([
  { id: "xphb-en", nom: "Player's Handbook (2024)" },
  { id: "xdmg-en", nom: "Dungeon Master's Guide (2024)" }
].map(Object.freeze));

/** L'INTERRUPTEUR QUI PORTE UNE COUCHE — `{id, label}`, ou `null` pour une
 *  couche qu'aucun interrupteur ne pilote (le SRD, `srfh` : le plancher). */
export function interrupteurDeLaCouche(coucheId) {
  const enfant = INTERRUPTEURS.find((sw) => sw.couches.includes(coucheId));
  if (enfant) return { id: enfant.id, label: enfant.label };
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
       fh-inheritance-en  fh:background
       fh-skills-en       fh:skill · fh:tool
       fh-soulforging-en  fh:tool (UN : soulforging) · fh:spell (UN : transfer-essence)
       fh-species-en      fh:species
       fh-spells-en       fh:spell
       fh-trainings-en    fh:training

   ⚠️ ET CE N'EST PAS UNE BIJECTION — *« une bijection fausse est cohérente »*
   (mémoire de la maison). `fh:tool` et `fh:spell` sont partagés par DEUX
   couches : Soulforging ajoute un outil et un sort sous les préfixes de
   Skills et de Spells. Le préfixe seul les aurait rangés sous le mauvais
   interrupteur, en silence. D'où `COUCHE_PAR_ID` : les deux ids nommés.
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
  "fh:spell:en:transfer-essence": "fh-soulforging-en"
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
 *  mot d'un choix non résolu nomme : *« Araag comes with Lore »*. */
export function interrupteurDUnId(id) {
  const couche = coucheDUnId(id);
  return couche ? interrupteurDeLaCouche(couche) : null;
}
