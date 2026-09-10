/* ══ LE MAGASIN DE SAUVEGARDES — lot 195 ══════════════════════════════════
   ⚖️ Eric, 10/09 (`ARCHITECTURE.md`, § « LE MAGASIN DE SAUVEGARDES ») :

   > *« J'aimerais un **menu de sauvegarde dédié**, dans le site, sans avoir à
   > me balader dans les menus, avec une **option discrète** sur où elles sont
   > vraiment enregistrées. Donc quand j'appuie sur **Open**, j'ai une page avec
   > **toutes mes sauvegardes** dedans. »*
   > *« **Popup la première fois** que je vais dans ce menu : "choisissez la
   > destination de vos sauvegardes" — ça va vers le Finder ou autre chose,
   > bref tu choisis la destination. Une fois que c'est fait, un **bouton reste
   > présent : "save location"**. »*

   ⚖️ Et sa réponse à *« que fait Save ? »* : **une entrée datée à chaque
   Save** — rien n'est écrasé, la page montre les versions par personnage.

   ── 🔴 LA LIMITE MESURÉE, ET ELLE DÉCIDE TOUTE LA FORME ──────────────────
   Le navigateur sait **choisir un dossier une fois et le retenir** *(File
   System Access : `showDirectoryPicker`, la poignée persistée dans IndexedDB,
   `queryPermission`/`requestPermission` au retour)* — y lister, lire, écrire
   sans redemander. **Chrome et Edge sur Mac : oui. Safari, iPad : non.**

   ⇒ **DEUX SOLS, UNE SEULE PAGE.** ⛔ Jamais deux expériences pour le même
   geste : la page est la même, seule **la ligne discrète** change.
   · dossier possible  → popup la première fois, puis `Save location` dit le
     chemin, et le joueur POSSÈDE ses octets ;
   · dossier impossible → le tiroir du navigateur *(IndexedDB)*, le bouton dit
     *« in this browser »*, ⛔ **aucun popup de destination** là où il n'y a
     pas de destination à choisir — et `Save` reste AUSSI un téléchargement,
     parce que le tiroir ne donne pas la propriété (loi d'Eric du 06/09 :
     *« chacun est propriétaire de ses données »*).

   ── ⭐ UNE LOGIQUE, DEUX SOLS — ET C'EST PLUS FORT QUE DEUX MAGASINS ──────
   Le mandat demande *« deux implémentations derrière »*. Elles sont ici, mais
   au niveau où elles DIFFÈRENT VRAIMENT : le **sol** — ce qui sait nommer,
   lire et écrire un texte. Tout ce qui fait un magasin (la clef d'une entrée,
   sa date, sa version, le groupement par personnage, le refus de l'écrasement)
   est écrit UNE fois, au-dessus. ⛔ Écrire deux fois la forme d'une entrée,
   c'est la garantie que la page montrera deux choses différentes selon le
   navigateur — *un organe que N écrans fabriquent sera oublié*.

   ── ⛔ AUCUN REPLI SILENCIEUX (loi §0.5) ────────────────────────────────
   Chaque verbe rend un ÉTAT NOMMÉ, jamais un `null` qui voudrait dire trois
   choses. Un dossier dont la permission a expiré ne retombe **pas** dans le
   tiroir : il le DIT, et la page offre de le rechoisir. Retomber ailleurs
   ferait disparaître les sauvegardes du joueur sans un mot.

   ── ⚠️ CE QUI N'EST PAS ÉPROUVÉ ICI, ET C'EST DIT ───────────────────────
   `showDirectoryPicker` n'existe NI dans `node:test` NI dans le `dom-stub`, et
   **il exige un vrai clic humain** — aucun test ne peut le déclencher. C'est
   pour ça que `env` est injectable, exactement comme dans `fichier.mjs` et
   `memoire.mjs` : le chemin du dossier se prouve par un sol de FIXTURE, et ce
   qui reste non couvert est le rideau le plus fin possible (`solDuDossier`,
   `baseIndexedDb`, `choisirUnDossier`). */

import { lireLeFichier } from "./ouvrir.mjs?v=620";
import { compositionFh } from "./layers-ecran.mjs?v=620";
import { MAITRE } from "./interrupteurs.mjs?v=620";

/** Le mot du tiroir — celui que `Save location` affiche quand il n'y a pas de
 *  destination à choisir. ⚖️ Le mot d'Eric, 10/09, mot pour mot. */
export const MOT_DU_TIROIR = "in this browser";

/** Le suffixe d'un fichier de personnage. ⭐ Le MÊME que `nomDeFichier`
 *  (review-step.mjs) produit pour `Save` : le magasin ne fabrique pas un
 *  second format de fichier, il range celui qui existe. */
export const SUFFIXE = ".fh-char.json";

/** LE MOT DE LA VERSION « SOCLE ».
 *  ⏳ Le maître porte déjà son mot une seule fois (`MAITRE.label`, « Fate's
 *  Hand ») ; le socle, lui, n'a AUCUNE déclaration unique aujourd'hui — le
 *  Menu écrit `"SRD"` (le voyant de `R`), l'écran Layers `"SRD 5.2.1"`. On ne
 *  crée pas ici un troisième écrivain sans le dire : ce mot est celui du Menu,
 *  et l'unification des deux est une question ouverte (voir le rapport). */
export const VERSION_SOCLE = "SRD";

/* ══ L'ENTRÉE — ce qu'une ligne de la page porte ═══════════════════════════
   ⚖️ Le mandat : *« une entrée du magasin porte au minimum le nom, la date, la
   version (SRD ou Fate's Hand — lis le manifeste), et de quoi rouvrir »*.

   🔴 D'OÙ VIENT CHAQUE CHAMP, ET POURQUOI PAS D'AILLEURS :
   · `personnage` ← `document.name`. La DONNÉE, pas le nom du fichier : un
     fichier renommé à la main garde son personnage.
   · `version`    ← `document.build.layers`, lu par `compositionFh`. Le MÊME
     organe que l'interrupteur `Fate's Hand` du Menu — jamais un second juge de
     « à quel jeu joue ce personnage ».
   · `date`       ← LA CLEF, que le magasin a écrite lui-même au moment du
     Save. ⚠️ ET C'EST LE SEUL CHAMP QUI VIENT DE LA FORME, parce qu'il n'est
     nulle part ailleurs : `document.modified` est l'heure de la dernière
     RETOUCHE, pas celle de la sauvegarde, et Eric a demandé *« une entrée
     datée à chaque Save »* — deux Save sans retouche doivent porter deux
     heures. Le prix est nommé : un fichier renommé à la main hors du builder
     perd sa date, et le magasin ne le listera plus. C'est le prix d'un dossier
     que le joueur POSSÈDE ; on ne le paie pas en douce.
   · `clef`       ← de quoi rouvrir, et c'est tout ce que la page en sait. */

/** LA CLEF D'UNE ENTRÉE : `<slug du nom>.<horodatage>.fh-char.json`.
 *
 *  ⛔ PAS DE `:` DANS UN NOM DE FICHIER — l'ISO 8601 en porte deux, et le
 *  Finder les affiche en `/`. L'horodatage est donc le même instant, écrit
 *  avec des tirets ; `dateDeLaClef` fait le chemin inverse.
 *
 *  🔴 ET DEUX SAVE DANS LA MÊME SECONDE FONT DEUX ENTRÉES. ⚖️ *« rien n'est
 *  écrasé »* : si la clef est déjà prise, on en prend une autre (`~2`, `~3`…).
 *  ⛔ Un magasin qui écraserait ici serait un magasin qui perd la version que
 *  le joueur venait de garder — la seule chose qu'Eric a exigée.
 *
 *  @param {object} document  le personnage
 *  @param {string} quand     `platformNow()` — ISO 8601 UTC à la seconde
 *  @param {Set<string>|string[]} [dejaLa]  les clefs déjà présentes
 */
export function clefDeLEntree(document, quand, dejaLa) {
  const prises = dejaLa instanceof Set ? dejaLa : new Set(Array.isArray(dejaLa) ? dejaLa : []);
  const base = `${slug(nomDu(document)) || "character"}.${slug(quand)}`;
  let clef = `${base}${SUFFIXE}`;
  for (let n = 2; prises.has(clef); n += 1) clef = `${base}~${n}${SUFFIXE}`;
  return clef;
}

/** L'HEURE QU'UNE CLEF PORTE, en ISO 8601 — ou `null` si la clef n'est pas du
 *  magasin. ⛔ Rendre une date inventée pour un fichier étranger le ferait
 *  apparaître dans la liste des sauvegardes du joueur. */
export function dateDeLaClef(clef) {
  if (typeof clef !== "string" || !clef.endsWith(SUFFIXE)) return null;
  const tronc = clef.slice(0, -SUFFIXE.length);
  const m = /\.(\d{4})-(\d{2})-(\d{2})t(\d{2})-(\d{2})-(\d{2})z(?:~\d+)?$/.exec(tronc);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}

/** LA VERSION D'UN PERSONNAGE — lue sur son manifeste, par le MÊME organe que
 *  l'interrupteur du Menu (`compositionFh`). Deux juges de « à quel jeu joue
 *  ce personnage » auraient divergé au premier interrupteur coupé. */
export function versionDuDocument(document) {
  return compositionFh(document).maitre ? MAITRE.label : VERSION_SOCLE;
}

/** L'ENTRÉE QUE PORTE UN COUPLE (clef, texte).
 *  @returns {{clef, personnage, date, version}|{clef, date, refus}|null}
 *  `null` = ce n'est pas une entrée du magasin (un fichier qui n'est pas à
 *  nous : on ne le liste pas, et ce n'est pas un refus — il n'a jamais
 *  prétendu être une sauvegarde). Un `refus` = une entrée À NOUS qu'on ne sait
 *  plus lire : ⛔ elle se DIT, elle ne disparaît pas de la liste. */
export function entreeDe(clef, texte) {
  const date = dateDeLaClef(clef);
  if (date === null) return null;
  const issue = lireLeFichier(texte);
  if (issue.etat !== "lu") return { clef, date, refus: issue.raison };
  return {
    clef, date,
    personnage: nomDu(issue.document),
    version: versionDuDocument(issue.document)
  };
}

/** LES ENTRÉES GROUPÉES PAR PERSONNAGE — ⚖️ *« la page montre les versions par
 *  personnage »*, la plus récente en tête, à l'intérieur d'un groupe comme
 *  entre les groupes.
 *
 *  ⛔ UNE ENTRÉE ILLISIBLE A SON PROPRE GROUPE, elle ne se range pas sous un
 *  nom qu'on ne connaît pas : la mettre sous « Unnamed » la mêlerait aux vrais
 *  personnages sans nom.
 *
 *  ⚠️ ON N'APPARIE JAMAIS PAR POSITION : le groupe est nommé par son
 *  personnage, et l'ordre des groupes se déduit de la date de leur entrée la
 *  plus récente. */
export function parPersonnage(entrees) {
  const groupes = new Map();
  const illisibles = [];
  for (const e of Array.isArray(entrees) ? entrees : []) {
    /* ⛔ LE GROUPE DES ILLISIBLES N'A PAS DE CLEF DANS LA MÊME TABLE, et ce
       n'est pas un détail de rangement : une clef fabriquée (« refus:… ») serait
       un NOM, donc quelque chose qu'un personnage pourrait porter. Une liste à
       part ne peut entrer en collision avec aucun nom, jamais. */
    if (!e || typeof e.personnage !== "string") { illisibles.push(e); continue; }
    if (!groupes.has(e.personnage)) groupes.set(e.personnage, { personnage: e.personnage, entrees: [] });
    groupes.get(e.personnage).entrees.push(e);
  }
  const liste = [...groupes.values()];
  if (illisibles.length > 0) liste.push({ personnage: null, entrees: illisibles });
  for (const g of liste) g.entrees.sort(plusRecenteEnTete);
  liste.sort((a, b) => plusRecenteEnTete(a.entrees[0], b.entrees[0]));
  return liste;
}

/* ⭐ L'ORDRE EST UNE COMPARAISON DE CHAÎNES, ET C'EST JUSTE : l'ISO 8601 UTC à
   la seconde se trie lexicographiquement comme il se trie chronologiquement.
   ⛔ Pas de `new Date()` ici — une seconde horloge dans un tri. */
function plusRecenteEnTete(a, b) {
  const da = a && a.date ? a.date : "";
  const db = b && b.date ? b.date : "";
  if (da !== db) return da < db ? 1 : -1;
  /* À date égale, l'ordre reste STABLE et NOMMÉ : la clef départage. Deux
     entrées de la même seconde ne doivent pas changer de place d'un rendu à
     l'autre — le joueur croirait que la liste bouge toute seule. */
  return String(a && a.clef).localeCompare(String(b && b.clef));
}

/* ══ LE MAGASIN — une logique, un sol ══════════════════════════════════════ */

/**
 * @typedef {object} Sol  ce qui sait nommer, lire et écrire un texte
 * @property {() => Promise<string[]>} clefs
 * @property {(clef: string) => Promise<string|null>} lire
 * @property {(clef: string, texte: string) => Promise<void>} ecrire
 */

/**
 * LE MAGASIN — l'interface UNIQUE, et ⛔ aucun écran ne sait quel sol il a.
 *
 * · `lister()`      → `{etat:"liste", groupes, entrees}` | `{etat:"refus", raison}`
 * · `ecrire(texte, quand)` → `{ok:true, entree}` | `{ok:false, raison}`
 * · `lire(entree)`  → `{etat:"lu", document}` | `{etat:"refus", raison}`
 * · `ouEstCeRange()` → la LIGNE DISCRÈTE : `{mot, choisissable, choisi, demandee, possede}`
 *
 * ⭐ `ouEstCeRange` EST DE LA DONNÉE, PAS UNE IDENTITÉ. La page lit
 * `choisissable` pour savoir s'il y a une destination à proposer ; elle ne
 * demande jamais « es-tu le dossier ? ». C'est ce qui rend la règle *« aucun
 * popup là où il n'y a rien à choisir »* vraie par construction plutôt que par
 * discipline.
 */
export function creerMagasin({ sol, ou }) {
  const range = Object.freeze({ ...ou });
  /* ⚔️ LA FILE DES ÉCRITURES — REGARDÉE AU NAVIGATEUR LE 10/09, ET C'EST UN
     ÉCRASEMENT QU'AUCUN TEST NE VOYAIT. Deux `Save` cliqués coup sur coup ont
     rendu UNE SEULE entrée : chacun lit les clefs déjà prises AVANT que l'autre
     ait écrit, les deux calculent donc la même clef, et le second efface le
     premier. Le garde `B2` prouvait le contraire — mais en SÉQUENCE, et c'est
     exactement l'angle mort : *« zéro conflit n'est pas zéro erreur »*.
     ⭐ LE REMÈDE EST UNE FILE, PAS UN VERROU : « lire les clefs, choisir la
     sienne, écrire » devient indivisible, et deux Save simultanés se rangent
     l'un après l'autre. ⛔ Rendre `clefDeLEntree` unique par un hasard aurait
     marché aussi et perdu la seule chose qui rend la clef LISIBLE — son heure. */
  let file = Promise.resolve();
  const enFile = (geste) => {
    const promesse = file.then(geste, geste);
    /* ⛔ La file ne doit JAMAIS mourir sur un refus : elle porte les gestes des
       autres. On avale ici, et l'appelant reçoit son refus par `promesse`. */
    file = promesse.then(() => undefined, () => undefined);
    return promesse;
  };
  return {
    ouEstCeRange: () => range,

    async lister() {
      let clefs;
      try { clefs = await sol.clefs(); } catch (cause) { return { etat: "refus", raison: motDe(cause) }; }
      const entrees = [];
      for (const clef of clefs) {
        if (dateDeLaClef(clef) === null) continue;      // pas à nous : jamais listé, jamais accusé
        let texte;
        try { texte = await sol.lire(clef); } catch (cause) {
          entrees.push({ clef, date: dateDeLaClef(clef), refus: motDe(cause) });
          continue;
        }
        const entree = entreeDe(clef, texte === null ? "" : texte);
        if (entree) entrees.push(entree);
      }
      entrees.sort(plusRecenteEnTete);
      return { etat: "liste", entrees, groupes: parPersonnage(entrees) };
    },

    /** ⚖️ UNE ENTRÉE DATÉE À CHAQUE SAVE — ⛔ jamais un écrasement. La clef
     *  est prise DANS l'état réel du sol, pas dans un compteur en mémoire :
     *  un second onglet qui aurait écrit entre-temps est vu.
     *
     *  ⭐ ON LUI PASSE LE TEXTE, PAS LE DOCUMENT — exactement la loi de
     *  `ecrirePersonnage` (memoire.mjs) et pour la même raison : l'appelant
     *  sérialise déjà par les octets du moteur (`canonicalText`), et une
     *  seconde sérialisation ici donnerait DEUX textes pour un même
     *  personnage. Les octets rangés sont alors byte-identiques à ceux de
     *  `Save` — ce qui est la thèse du produit, pas un détail.
     *  ⛔ ET LE MAGASIN NE RANGE QUE DES PERSONNAGES : le texte repasse devant
     *  `lireLeFichier`, le juge qui existe déjà. Un magasin qui accepterait
     *  n'importe quels octets rendrait une liste qu'il ne saurait pas relire. */
    ecrire(texte, quand) {
      if (typeof texte !== "string" || texte === "") {
        return Promise.resolve({ ok: false, raison: "the character was not serialised" });
      }
      const issue = lireLeFichier(texte);
      if (issue.etat !== "lu") return Promise.resolve({ ok: false, raison: issue.raison });
      /* ⚔️ « LIRE LES CLEFS PRISES, PUIS ÉCRIRE » EST INDIVISIBLE — voir la file,
         en tête. Hors de la file, deux Save du même personnage dans la même
         seconde calculent la même clef et le second efface le premier. */
      return enFile(async () => {
        let dejaLa;
        try { dejaLa = new Set(await sol.clefs()); } catch (cause) { return { ok: false, raison: motDe(cause) }; }
        const clef = clefDeLEntree(issue.document, quand, dejaLa);
        try { await sol.ecrire(clef, texte); } catch (cause) { return { ok: false, raison: motDe(cause) }; }
        return { ok: true, entree: entreeDe(clef, texte) };
      });
    },

    /** ROUVRIR UNE ENTRÉE. ⛔ Le juge du fichier reste `lireLeFichier` — le
     *  magasin ne se met pas à décider ce qu'est un personnage. */
    async lire(entree) {
      const clef = entree && typeof entree === "object" ? entree.clef : entree;
      if (typeof clef !== "string" || clef === "") return { etat: "refus", raison: "this entry has no key" };
      let texte;
      try { texte = await sol.lire(clef); } catch (cause) { return { etat: "refus", raison: motDe(cause) }; }
      if (texte === null || texte === undefined) return { etat: "refus", raison: "this save is no longer there" };
      return lireLeFichier(texte);
    }
  };
}

/* ══ LE SOL DU TIROIR — IndexedDB ══════════════════════════════════════════
   🔴 POURQUOI PAS `localStorage`, QUI EST DÉJÀ LÀ (`memoire.mjs`) : le magasin
   n'écrase JAMAIS, donc il GRANDIT à chaque Save. Le quota de `localStorage`
   est de ~5 Mo pour tout le site, celui d'IndexedDB se compte en centaines.
   Un magasin sans écrasement posé sur `localStorage` a une date de péremption
   qu'on ne saurait pas nommer d'avance ; celui-ci n'en a pas. */

/** Le sol du tiroir, sur une BASE injectée — ⭐ même loi que le `magasin` de
 *  `memoire.mjs` : `indexedDB` n'existe NI dans `node:test` NI dans le
 *  `dom-stub`, et c'est justement le refus (mode privé, quota) qui est la
 *  moitié intéressante du fichier. */
export function solDuTiroir(base) {
  return {
    clefs: () => base.clefs(RAYON_SAUVEGARDES),
    lire: (clef) => base.lire(RAYON_SAUVEGARDES, clef),
    ecrire: (clef, texte) => base.ecrire(RAYON_SAUVEGARDES, clef, texte)
  };
}

/** Le sol d'un DOSSIER — une `FileSystemDirectoryHandle`.
 *  ⚠️ NON ÉPROUVÉ PAR UN TEST, et c'est écrit : aucun test ne peut fabriquer
 *  une vraie poignée. Le rideau est donc le plus fin possible — trois appels,
 *  zéro décision — et la LOGIQUE au-dessus est prouvée par un sol de fixture
 *  qui a exactement cette forme. */
export function solDuDossier(poignee) {
  const permis = async () => {
    if (typeof poignee.queryPermission !== "function") return;   // pas de garde-barrière : rien à demander
    if (await poignee.queryPermission({ mode: "readwrite" }) === "granted") return;
    if (typeof poignee.requestPermission === "function"
        && await poignee.requestPermission({ mode: "readwrite" }) === "granted") return;
    /* ⛔ ON NE RETOMBE PAS DANS LE TIROIR. Les sauvegardes du joueur sont dans
       ce dossier ; basculer ailleurs les ferait DISPARAÎTRE de la page sans un
       mot, et il conclurait qu'elles sont perdues. */
    throw new Error("this browser no longer has permission for that folder — choose it again");
  };
  return {
    async clefs() {
      await permis();
      const noms = [];
      for await (const [nom, enfant] of poignee.entries()) {
        if (enfant && enfant.kind === "file") noms.push(nom);
      }
      return noms;
    },
    async lire(clef) {
      await permis();
      let fiche;
      try { fiche = await poignee.getFileHandle(clef); } catch (_) { return null; }
      return (await fiche.getFile()).text();
    },
    async ecrire(clef, texte) {
      await permis();
      const fiche = await poignee.getFileHandle(clef, { create: true });
      const plume = await fiche.createWritable();
      await plume.write(texte);
      await plume.close();
    }
  };
}

/* ══ LA DESTINATION — la question qu'on ne pose qu'une fois ════════════════
   ⚖️ *« popup la première fois que je vais dans ce menu »*, puis *« un bouton
   reste présent : save location »*.

   🔴 LA QUESTION EST RÉPONDUE, PAS SEULEMENT CHOISIE. Les deux voies du popup
   — prendre un dossier, ou rester dans ce navigateur — répondent toutes les
   deux, et `demandee` le retient. ⛔ Sans ça, le joueur qui décline verrait la
   même question à chaque visite : ce ne serait plus « la première fois ». */

const RAYON_SAUVEGARDES = "sauvegardes";
const RAYON_REGLAGES = "reglages";
const CLEF_DESTINATION = "destination";

/** LE MAGASIN DU JOUEUR — dossier si un a été choisi et qu'on le retrouve,
 *  tiroir sinon. ⛔ Il ne CHOISIT rien : ouvrir la page ne doit pas ouvrir la
 *  boîte de fichiers du système (c'est exactement ce que ce lot retire).
 *
 *  @param {{base: object, dossierPossible: boolean}} env
 */
export async function ouvrirLeMagasin(env) {
  const reglage = await lireLeReglage(env.base);
  const possible = Boolean(env.dossierPossible);
  if (possible && reglage.poignee) {
    return creerMagasin({
      sol: solDuDossier(reglage.poignee),
      ou: {
        mot: nomDeLaPoignee(reglage.poignee), choisissable: true, choisi: true,
        demandee: true, possede: true
      }
    });
  }
  return creerMagasin({
    sol: solDuTiroir(env.base),
    ou: {
      mot: MOT_DU_TIROIR,
      /* ⛔ `choisissable` EST LA SEULE CHOSE QUI DÉCIDE DU POPUP, et elle dit
         ce que le NAVIGATEUR peut faire — jamais ce que ce magasin-ci est. */
      choisissable: possible, choisi: false,
      demandee: Boolean(reglage.demandee),
      /* Le tiroir ne donne pas la propriété : `Save` y reste AUSSI un
         téléchargement. C'est l'appelant qui le lit, une seule fois. */
      possede: false
    }
  });
}

/** LA DESTINATION CHOISIE — la boîte du système, UNE fois, sur un vrai clic.
 *  ⚠️ NON ÉPROUVÉ PAR UN TEST : `showDirectoryPicker` exige une activation
 *  transitoire (un clic humain), qu'aucune suite ne peut fabriquer.
 *  @returns {{etat:"choisi"}|{etat:"decline"}|{etat:"refus",raison:string}} */
export async function choisirUnDossier(env) {
  if (typeof env.showDirectoryPicker !== "function") {
    return { etat: "refus", raison: "this browser cannot choose a folder" };
  }
  let poignee;
  try {
    poignee = await env.showDirectoryPicker({ id: "fhpc-saves", mode: "readwrite" });
  } catch (cause) {
    /* ⭐ FERMER LA BOÎTE N'EST PAS UNE PANNE — c'est un `AbortError`, et le
       joueur a simplement répondu « pas celui-là ». On marque quand même la
       question posée : il l'a vue. */
    await ecrireLeReglage(env.base, { demandee: true });
    return { etat: "decline", raison: motDe(cause) };
  }
  try {
    await ecrireLeReglage(env.base, { demandee: true, poignee });
  } catch (cause) {
    return { etat: "refus", raison: motDe(cause) };
  }
  return { etat: "choisi" };
}

/** LA SECONDE VOIE DU POPUP — *« garde-les dans ce navigateur »*. Elle répond
 *  à la question sans en poser une autre. */
export async function garderDansLeTiroir(env) {
  try { await ecrireLeReglage(env.base, { demandee: true }); } catch (cause) {
    return { etat: "refus", raison: motDe(cause) };
  }
  return { etat: "range" };
}

async function lireLeReglage(base) {
  try {
    const valeur = await base.lire(RAYON_REGLAGES, CLEF_DESTINATION);
    return valeur && typeof valeur === "object" ? valeur : {};
  } catch (_) {
    /* ⭐ UN RÉGLAGE ILLISIBLE N'EST PAS UNE PANNE DU MAGASIN : on retombe sur
       « rien n'a été choisi », ce qui est la vérité — et le tiroir marche. Le
       refus qui compte (celui de l'ÉCRITURE des sauvegardes) sera dit là où il
       est actionnable, une seule fois. */
    return {};
  }
}

function ecrireLeReglage(base, valeur) {
  return base.ecrire(RAYON_REGLAGES, CLEF_DESTINATION, valeur);
}

/** LE MOT D'UN DOSSIER — son nom, tel que le système l'a donné.
 *  ⛔ On n'invente pas un chemin complet : le navigateur ne le donne pas, et
 *  écrire « ~/Documents/… » serait une prose fausse un jour sur deux. */
function nomDeLaPoignee(poignee) {
  const nom = poignee && typeof poignee.name === "string" ? poignee.name.trim() : "";
  return nom !== "" ? nom : "a folder you chose";
}

/* ══ LA BASE — IndexedDB, le rideau le plus fin possible ══════════════════
   ⚠️ NON ÉPROUVÉE PAR UN TEST (Node n'a pas `indexedDB`) : c'est pour ça
   qu'elle ne prend AUCUNE décision. Deux rayons, trois verbes, zéro logique —
   tout ce qui décide est au-dessus, sur une base de fixture.
   ⭐ ET C'EST ELLE QUI JUSTIFIE INDEXEDDB PLUTÔT QUE `localStorage` DEUX FOIS :
   une `FileSystemDirectoryHandle` ne se sérialise pas en texte ; seule une base
   à clonage structuré peut la retenir d'une session à l'autre. */

export const BASE_NOM = "fhpc";
export const BASE_VERSION = 1;

export function baseIndexedDb(indexedDB) {
  let ouverture = null;
  const base = () => {
    if (ouverture === null) {
      ouverture = new Promise((resoudre, rejeter) => {
        const requete = indexedDB.open(BASE_NOM, BASE_VERSION);
        requete.onupgradeneeded = () => {
          for (const rayon of [RAYON_SAUVEGARDES, RAYON_REGLAGES]) {
            if (!requete.result.objectStoreNames.contains(rayon)) requete.result.createObjectStore(rayon);
          }
        };
        requete.onsuccess = () => resoudre(requete.result);
        requete.onerror = () => rejeter(requete.error || new Error("this browser refused its database"));
      });
    }
    return ouverture;
  };
  const transaction = async (rayon, mode, geste) => {
    const db = await base();
    return new Promise((resoudre, rejeter) => {
      const tx = db.transaction(rayon, mode);
      const requete = geste(tx.objectStore(rayon));
      requete.onsuccess = () => resoudre(requete.result);
      requete.onerror = () => rejeter(requete.error || new Error("this browser refused to store it"));
    });
  };
  return {
    clefs: (rayon) => transaction(rayon, "readonly", (s) => s.getAllKeys()).then((k) => k.map(String)),
    lire: (rayon, clef) => transaction(rayon, "readonly", (s) => s.get(clef))
      .then((v) => (v === undefined ? null : v)),
    ecrire: (rayon, clef, valeur) => transaction(rayon, "readwrite", (s) => s.put(valeur, clef)).then(() => undefined)
  };
}

/** ⭐ CE QUE LE NAVIGATEUR PEUT — mesuré, jamais deviné à partir de son nom.
 *  ⛔ Aucun reniflage d'agent : Safari peut gagner `showDirectoryPicker` demain,
 *  et une liste de navigateurs serait fausse ce jour-là sans que rien ne
 *  rougisse. On demande au navigateur ce qu'il sait faire. */
export function dossierPossible(fenetre) {
  return Boolean(fenetre && typeof fenetre.showDirectoryPicker === "function");
}

function nomDu(document) {
  const nom = document && typeof document.name === "string" ? document.name.trim() : "";
  return nom;
}

function slug(mot) {
  return String(mot).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Le mot d'un refus, tel que la panne l'a dit — ⚠️ jamais une prose inventée
 *  (même loi que `raisonDe`, memoire.mjs). */
function motDe(cause) {
  const mot = cause && typeof cause.message === "string" ? cause.message.trim() : "";
  return mot !== "" ? mot : "this browser refused";
}
