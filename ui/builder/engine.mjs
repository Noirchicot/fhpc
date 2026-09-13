/* ══ LE MOTEUR, CHARGÉ DANS LA PAGE — lot 33 ══════════════════════════
   Prouvé en navigateur au lot 32 : `src/build` et `src/layers` sont du JS
   portable, zéro serveur nécessaire. Ce fichier fait exactement ce que la
   sonde du lot 32 faisait à la main : monter la pile, brancher `build`,
   exposer ses verbes.

   ⛔ AUCUNE RÈGLE ICI. Ce fichier ne fait que charger et brancher — toute
   décision de jeu vient de `rebuild()`, jamais de ce module. */

/* Lot 75 — les `fetch` d'exécution portent la version du graphe, lue dans
   l'URL de CE module : sans elle, un moteur frais pouvait recharger des
   couches de la version d'avant, servies par le cache (max-age=600 PAR
   fichier). Voir la tête de `version.mjs`. */
import { versionQuery } from "./version.mjs?v=623";

/* EXPORTÉE pour `tests/ui-jetons.test.mjs` (§4, test 9) : le garde monte la
   MÊME liste, pas une copie qui pourrait diverger — la fidélité de « la
   pile montée comme la page » tient à cet import, pas à une recopie. */
/* LOT 77 — `fh-fiche-en` et `fh-lore-en` ferment la pile, DANS CET ORDRE, et
   le même que `src/tools/exemple-fh-en.mjs` : les deux couches ne font que
   `patch` des records déjà posés (les 9 espèces du SRD, les 3 de
   `fh-species-en`, les 12 classes), donc elles ne peuvent monter qu'APRÈS
   ceux qui les définissent. ⛔ Les DEUX piles se tiennent à jour ensemble —
   une seule des deux et l'écran et les tests divergeraient en silence. */
export const LAYER_FILES = [
  "srd-5.2.1-en.layer.json",
  /* ⭐ LOT 95 — `srfh` se monte JUSTE AU-DESSUS DU LIVRE, et cette place n'est
     pas un choix d'ici : c'est le RANG 15 que fh-srd lui a donné (SRD 10,
     phb_opt 20, fates_hand 30). Elle porte le rangement d'Eric et n'aplatit
     rien — chaque record a son propre id et un `data.extends` vers l'objet
     SRD qu'il habille. ⚠️ EN seulement, comme la source. */
  "srfh-shelving-en.layer.json",
  /* ⭐ LOT 196 — LA SECONDE COUCHE `srfh`, ET SA PLACE EST UNE CONTRAINTE, PAS
     UN GOÛT. Elle DÉCLARE `data[spell_list_choice]` sur `srd:feat:en:magic-
     initiate` — un patch tombe dans le vide si son record n'est pas dessous,
     donc elle se monte au-dessus du SRD ; et `fh-feats-en`, qui patche le même
     record pour son blurb, doit rester AU-DESSUS d'elle. Entre les deux, il
     n'y a qu'une place, et c'est celle-ci.
     ⛔ Elle entre ici EN MÊME TEMPS que dans `SRFH_LAYER_IDS` (universe-step)
     et dans `PILE` (exemple-fh-en) : trois listes, un seul geste (lot 77). */
  "srfh-mecaniques-en.layer.json",
  "fh-species-en.layer.json",
  "fh-skills-en.layer.json",
  /* ⭐ LOT 184 — `fh-skills-en` PORTAIT TROIS INTERRUPTEURS ; en voici deux,
     sortis pour que chacun ait le sien (ARCHITECTURE.md, « La coupe des
     couches »). ⚠️ L'ORDRE DES DEUX N'EST PAS INDIFFÉRENT ET IL SE LIT :
     `fh-inheritance-en` offre deux langues qui sont des records de
     `fh-trainings-en` (`granted_language_choice.from` → `fh:training:en:
     language-*`). Aucune des deux ne PATCHE ce que l'autre pose — le genre
     `training` n'est écrit que par la première, le genre `background` que par
     la seconde — donc le montage ne peut pas se casser sur l'ordre ; mais la
     pile DIT la dépendance en la posant dans le bon sens, et un lecteur ne
     doit pas avoir à la deviner. Elles restent collées à `fh-skills-en`, d'où
     elles viennent, plutôt que d'aller se ranger ailleurs.
     ⛔ Elles entrent ici EN MÊME TEMPS que dans `FH_LAYER_IDS` et dans `PILE` :
     trois listes, un seul geste (leçon du lot 77). */
  "fh-trainings-en.layer.json",
  "fh-inheritance-en.layer.json",
  "fh-arcana-en.layer.json",
  "fh-feats-en.layer.json",
  "fh-spells-en.layer.json",
  /* ⭐ LOT 179 — `Soulforge Crafting` dans SA couche, pour qu'il devienne un
     interrupteur. Elle se monte APRÈS `fh-skills-en` (elle y reprend l'outil)
     et APRÈS `fh-spells-en` (elle y reprend Transfer Essence et les rôles
     Soulforge d'Identify et Gentle Repose), et AVANT les deux couches de
     texte qui ferment la pile. */
  "fh-soulforging-en.layer.json",
  /* ⭐ LOT 181 — les 54 gemmes d'Eric, genre `gem` (le second genre Fate's
     Hand après `arcana`) plus leurs 54 rangements. Elle n'AJOUTE que : aucune
     dépendance de montage, donc sa place est celle du contenu maison — après
     les couches mécaniques, avant les deux couches de texte qui ferment la
     pile. ⚠️ Elle entre ici EN MÊME TEMPS que dans `FH_LAYER_IDS` et dans
     `PILE` : trois listes, un seul geste (leçon du lot 77). */
  "fh-gems-en.layer.json",
  "fh-fiche-en.layer.json",
  "fh-lore-en.layer.json"
];

/* ══ 📚 LES LIVRES DU JOUEUR — lot 188 ═════════════════════════════════════
   ⚖️ Eric, 09/09 : *« tu dois pouvoir les activer et les désactiver »*, *« ils
   seront visibles dans le menu »*, et *« la version officielle ne contiendra
   pas DMG et player »*.

   🔴 LE FICHIER N'EXISTE QUE SUR LE DISQUE DU JOUEUR : `layers-livres/` est
   ignoré par git (`gen-livre-layer.mjs`), donc ABSENT du site déployé — par
   construction, pas par discipline. Dans le navigateur, un livre n'existe que
   si le fichier est servi. ⇒ Un 404 n'est PAS une erreur, c'est zéro livre :
   `fetch` dit `ok: false`, on passe. ⛔ Ne jamais faire tomber le boot pour un
   livre : c'est le SRD qui est le plancher, pas le DMG.

   ⭐ LA PLACE DANS LA PILE EST UNE LOI (ARCHITECTURE, « la superposition ») :
   le livre se monte AU-DESSUS du SRD et de `srfh`, EN DESSOUS des couches
   Fate's Hand — c'est ce qui fait que FH RECOUVRE le livre et non l'inverse.
   L'ordre de la pile est l'ordre d'enregistrement (stack.mjs) : on enregistre
   donc les livres juste après `srfh`, avant `fh-species-en`.

   ⭐ ET IL SE MONTE ÉTEINT. C'est le DOCUMENT qui décide ce qui est allumé
   (`alignerLaPileSurLeDocument`, shell.mjs) ; un livre monté allumé d'office
   ferait diverger la pile active de tout personnage qui ne le déclare pas, et
   `rebuild` refuserait. Un livre PRÉSENT mais que le bloc refuse (un fichier
   d'une autre version) est rapporté dans `livresRefuses`, avec sa raison, pour
   que l'écran `Layers` le dise au lieu de le taire. */
export const LIVRE_FILES = ["xphb-en.layer.json", "xdmg-en.layer.json"];
/** Le fichier au-dessus duquel les livres se montent — le plancher `srfh`.
 *  🔴 LOT 196 — IL SE DÉDUIT, IL NE S'ÉCRIT PLUS. Ce nom était `srfh-shelving-
 *  en.layer.json` en dur, et c'était juste tant que `srfh` n'avait qu'une
 *  couche. Le jour où `srfh-mecaniques-en` est arrivée juste au-dessus, la
 *  constante a cessé de désigner « le haut de `srfh` » pour désigner « la
 *  première des deux » — les livres se seraient montés ENTRE les deux couches
 *  `srfh`, et la loi écrite dix lignes plus haut (« au-dessus du SRD ET de
 *  `srfh` ») aurait été fausse sans qu'une seule ligne rougisse.
 *  ⭐ La liste dit donc elle-même où est son plancher : la DERNIÈRE couche
 *  `srfh` de la pile, quelle qu'elle soit et quel que soit leur nombre. */
const SOUS_LES_LIVRES = LAYER_FILES.filter((f) => f.startsWith("srfh-")).at(-1);

async function octetsDuLivre(root, file) {
  let reponse;
  try {
    reponse = await fetch(`${root}/layers-livres/${file}${versionQuery(import.meta.url)}`);
  } catch (_) {
    return null;                                    // pas de réseau, pas de fichier : zéro livre
  }
  if (!reponse || !reponse.ok) return null;         // 404 : le livre n'est pas sur cet appareil
  return new Uint8Array(await reponse.arrayBuffer());
}

async function monterLesLivres(layers, root) {
  const refuses = [];
  for (const file of LIVRE_FILES) {
    const bytes = await octetsDuLivre(root, file);
    if (!bytes) continue;
    try {
      const { id } = layers.verbs.register({ bytes, origin: file });
      layers.verbs.disable({ id });
    } catch (error) {
      refuses.push({ id: file.replace(/\.layer\.json$/, ""), raison: error.message });
    }
  }
  return refuses;
}

function makeBus() {
  const listeners = new Map();
  return {
    on(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
      return () => listeners.get(type).delete(fn);
    },
    emit(type, data) {
      const event = Object.assign({ type }, data);
      for (const fn of listeners.get(type) || []) fn(event);
      return event;
    }
  };
}

/* §3h (lot 38) — DÉFAUT n°3, remesuré : sans `modules:`, `resolved.stats`
   revenait VIDE. L'écran ne perdait pas que le pool de compétences, il
   perdait aussi le Score de Destinée — les deux sur le personnage
   d'exemple. Mêmes modules que `src/tools/exemple-fh-en.mjs`, qui monte la
   même pile pour générer l'exemple commité. */
/** Monte la pile réelle et rend `{ build, layers }` — prêt pour `rebuild`. */
export async function bootEngine({ root = "../.." } = {}) {
  const { createLayers } = await import("../../src/layers/index.mjs?v=623");
  const { createBuild } = await import("../../src/build/index.mjs?v=623");
  const { createFhDestinyStat } = await import("../../src/modules/fh/destiny-stat.mjs?v=623");
  const { createFhSkillPoolStat } = await import("../../src/modules/fh/skill-pool.mjs?v=623");
  /* LOT 148 BIS — le module qui fait ARRIVER sur la fiche les traits que la
     couche des espèces AJOUTE (`Splinter of Anon`, `Outlasting`,
     `Twice-Born`). Sans lui, ils s'appliquent sans que le joueur les voie. */
  const { createFhSpeciesTraits } = await import("../../src/modules/fh/species-traits.mjs?v=623");

  const bus = makeBus();
  const layers = createLayers({ bus });
  const dispatch = (route, payload) => {
    const [block, verb] = route.split(".");
    if (block !== "layers") throw new Error(`engine: unexpected route "${route}"`);
    return layers.verbs[verb](payload);
  };
  const build = createBuild({
    bus,
    dispatch,
    now: () => new Date().toISOString(),
    modules: [createFhDestinyStat(), createFhSkillPoolStat(), createFhSpeciesTraits()]
  });

  let livresRefuses = [];
  for (const file of LAYER_FILES) {
    const bytes = new Uint8Array(await (await fetch(`${root}/layers/${file}${versionQuery(import.meta.url)}`)).arrayBuffer());
    layers.verbs.register({ bytes, origin: file });
    /* 📚 LOT 188 — les livres du joueur, juste au-dessus de `srfh` (voir leur tête). */
    if (file === SOUS_LES_LIVRES) livresRefuses = await monterLesLivres(layers, root);
  }

  return { build, layers, bus, livresRefuses };
}

/** Charge le personnage d'exemple EN+FH — la seule matière réelle
 *  disponible tant que `doc.open` n'est pas branché (voir `contracts/doc.md`,
 *  « Comment le MCP s'y branchera » — hors périmètre de ce lot). À remplacer
 *  par un vrai document ouvert/créé plus tard. */
export async function loadExampleDocument({ root = "../.." } = {}) {
  return (await fetch(`${root}/examples/personnage-fh-en-niveau1.fh-char.json${versionQuery(import.meta.url)}`)).json();
}

/* LOT 54 — Concept/Universe écrivent `document.name`/`.gender`/`.alignment`/
   `.campaign` par `createDocWriters({schema})` (`src/doc/writers.mjs`), PAS
   par `createDoc` : le bloc `doc` refuse de se construire sans magasin, et
   le navigateur n'en a aucun (`src/doc/store.mjs`, tête de fichier). Ces
   écrivains n'ont besoin QUE du schéma — chargé ici, comme les couches et
   l'exemple, jamais recopié dans `ui/`. */
/** Le schéma `fh-char/1`, tel qu'il est sur le disque — même geste que
 *  `loadExampleDocument`. */
export async function loadDocSchema({ root = "../.." } = {}) {
  return (await fetch(`${root}/schemas/fh-char.schema.json${versionQuery(import.meta.url)}`)).json();
}
