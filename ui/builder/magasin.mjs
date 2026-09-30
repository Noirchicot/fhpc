/* ══ L'ORGANE DU STOCKAGE — lot 374 (refait sur le magasin des lots 195 et 202) ══════════
   ⚖️ Eric, 28/09 : *« le processus de sauvegarde, j'aimerais avoir une gestion à l'intérieur et
   ne jamais avoir à aller dans windows, Mac os ou ios pour aller chercher une fiche. on le fait une
   fois au début et après. c'est streamlined. un sauvegarde à la fin du process de création. puis le
   cache est totalement vidé »*. Puis, 30/09 : **« la sauvegarde c'est la suite »** et **« il faut que
   tout puisse être lisible par la nouvelle fiche »**.
   ⚖️ Et la carte produit (§ 10, 29/09) : le joueur choisit son emplacement (Dropbox en tête), la
   même liste sur tous les appareils, et **l'app vérifie avant d'écrire**.

   ── ⭐ UNE INTERFACE, DES ADAPTATEURS — et c'est la seule forme qui laisse venir Dropbox ─────
   L'organe parle QUATRE verbes, et aucun écran n'en connaît d'autre :
     · `lister()`                  → les personnages rangés ;
     · `lire(id)`                  → un personnage, AVEC sa révision ;
     · `ecrire(texte, {revision})` → ⭐ la révision qu'on croit remplacer est un argument EXIGÉ ;
     · `effacer(id)`.
   Derrière, un ADAPTATEUR par lieu. Deux aujourd'hui — l'APPAREIL (la copie de l'app) et le FICHIER
   (un téléchargement) —, et Dropbox, Google Drive, OneDrive en seront d'autres, sans que rien au-dessus
   ne bouge. ⛔ Un adaptateur ne décide rien de ce qu'est un personnage : le juge reste `lireLeFichier`.

   ── 🔴 CE QU'UN LIEU SAIT FAIRE SE DIT PAR SES CAPACITÉS, JAMAIS PAR SON NOM ──────────────────
   `capacites` est de la DONNÉE : `liste` (il sait lister), `ecrase` (une écriture REMPLACE ce qui était
   là — donc elle vérifie la révision), `efface` (il sait effacer), `sansGeste` (il peut écrire sans un
   clic du joueur : la sauvegarde automatique), `possede` (le joueur tient ses octets hors de l'app).
   ⛔ Aucun écran ne demande « es-tu le fichier ? » : la poubelle lit `efface`, la sauvegarde
   automatique lit `sansGeste`. C'est ce qui rendait vraie, au lot 195, la règle *« jamais deux
   expériences pour le même geste »*, et c'est elle qui laisse entrer demain un lieu de plus.

   ── ⚖️ LA RÉVISION, PORTÉE PAR L'INTERFACE ─────────────────────────────────────────────────
   § 10 : *« l'app VÉRIFIE AVANT D'ÉCRIRE »*. Un lieu qui REMPLACE (`ecrase`) compare la révision
   qu'on lui annonce à celle qu'il tient ; si elles diffèrent, quelqu'un a écrit entre-temps (un autre
   onglet aujourd'hui, un autre appareil demain) et l'écriture est REFUSÉE, avec la révision qu'il
   tient : `{ok:false, conflit:true, revision}`. ⛔ Rien n'est écrasé. Un lieu qui ne remplace jamais
   (le fichier : chaque téléchargement est un fichier de plus) n'a rien à comparer, et il le DÉCLARE
   (`ecrase: false`) — ⛔ il ne contourne pas l'argument, il n'en a pas l'usage.
   ⭐ L'argument est EXIGÉ par l'organe, pas par l'adaptateur : une écriture qui ne dit pas quelle
   version elle remplace est refusée AVANT d'atteindre le lieu. Un adaptateur ne peut donc pas être
   appelé sans elle, même par distraction.

   ⚖️ LES DEUX DÉCISIONS D'ERIC TIENNENT ENSEMBLE (Q1 → b, tranchée par ARCHI 35 le 30/09 sur ses
   propres mots) : le 10/09, *« une entrée datée à chaque Save — rien n'est écrasé, la page montre les
   versions par personnage »* ; le 29/09, *« une ligne par perso »* dans My characters, et *« l'app
   vérifie avant d'écrire »* (§ 10). ⇒ DEUX rayons dans l'appareil : la COPIE COURANTE d'un personnage
   (une par `id`, celle que sa ligne montre, qui suit la sauvegarde automatique, sur sa révision) et
   ses VERSIONS DATÉES (une à chaque Save — jamais à chaque modification —, jamais écrasées, derrière
   la ligne ; la vue qui les montre viendra). La poubelle retire le personnage ENTIER : sa copie et
   toutes ses versions.

   ── ⛔ AUCUN REPLI SILENCIEUX (loi §0.5) ───────────────────────────────────────────────────
   Chaque verbe rend un ÉTAT NOMMÉ. Un lieu qui ne sait pas lister ne rend pas une liste vide : il rend
   `sans-liste`, et la page ne dit pas « aucun personnage ». */

import { lireLeFichier } from "./ouvrir.mjs?v=925";
/* ⚖️ CE QUI FAIT LE PERSONNAGE — l'organe du lot 350 (tout, sauf `modified` et `resolved`, que la
   dérivation estampille à chaque calcul) : c'est sur lui qu'une révision se décide (voir l'appareil). */
import { ceQuiFaitLePersonnage } from "./universe-step.mjs?v=925";
import { canonicalText } from "../../src/doc/canonical.mjs?v=925";

/* ══ L'ORGANE ══════════════════════════════════════════════════════════════════════════ */

/**
 * @typedef {object} Capacites
 * @property {boolean} liste      il sait rendre les personnages rangés
 * @property {boolean} ecrase     une écriture REMPLACE ce qui était là — elle vérifie donc la révision
 * @property {boolean} efface     il sait effacer un personnage
 * @property {boolean} sansGeste  il peut écrire sans un clic du joueur (la sauvegarde automatique)
 * @property {boolean} possede    le joueur tient ses octets hors de l'app
 * @property {string}  lieu       le mot du lieu, tel que le joueur le lit
 */

/**
 * @typedef {object} Adaptateur
 * @property {Capacites} capacites
 * @property {() => Promise<{id:string, texte:string, revision:string|null}[]>} [tout]
 * @property {(id: string) => Promise<{texte:string, revision:string|null}|null>} [lire]
 * @property {(id: string, texte: string, revision: string|null, document: object, options: {version?: string}) =>
 *   Promise<{ok:true, revision:string|null}|{ok:false, conflit:true, revision:string|null}>} ecrire
 * @property {(id: string) => Promise<void>} [effacer]
 */

/** LE MOT D'UN LIEU QUI NE SAIT PAS LISTER — ⚠️ brouillon anglais à Eric. */
export const MOT_SANS_LISTE = "a web page cannot list the files you saved";
/** LE MOT D'UNE ÉCRITURE QUI NE DIT PAS CE QU'ELLE REMPLACE — il ne doit jamais atteindre le joueur :
 *  s'il le fait, c'est un défaut de la coquille, et il le NOMME. */
export const MOT_SANS_REVISION = "the write did not say which version it replaces";

/**
 * L'ORGANE — l'interface UNIQUE. ⛔ Aucun écran ne sait quel adaptateur il a.
 *
 * · `lister()`  → `{etat:"liste", personnages:[{id, revision, document}], illisibles:[{id, raison}]}`
 *                 | `{etat:"sans-liste"}` | `{etat:"refus", raison}`
 * · `lire(id)`  → `{etat:"lu", document, revision}` | `{etat:"absent"}` | `{etat:"refus", raison}`
 * · `ecrire(texte, {revision})` → `{ok:true, revision}` | `{ok:false, conflit:true, revision}` | `{ok:false, raison}`
 * · `effacer(id)` → `{ok:true}` | `{ok:false, raison}`
 *
 * @param {Adaptateur} adaptateur
 */
export function creerStockage(adaptateur) {
  const capacites = Object.freeze({ ...adaptateur.capacites });
  /* ⚔️ LA FILE DES ÉCRITURES — la leçon du lot 195, REGARDÉE AU NAVIGATEUR le 10/09 : deux écritures
     lancées ensemble lisaient chacune l'état d'avant, et la seconde effaçait la première. ⭐ Une file,
     pas un verrou : « lire la révision, décider, écrire » devient indivisible entre deux gestes du
     même onglet. Entre deux onglets, c'est la RÉVISION qui tient (le lieu décide dans une transaction). */
  let file = Promise.resolve();
  const enFile = (geste) => {
    const promesse = file.then(geste, geste);
    /* ⛔ La file ne meurt jamais sur un refus : elle porte les gestes des autres. */
    file = promesse.then(() => undefined, () => undefined);
    return promesse;
  };
  return {
    capacites,

    async lister() {
      if (!capacites.liste || typeof adaptateur.tout !== "function") return { etat: "sans-liste" };
      let rangs;
      try { rangs = await adaptateur.tout(); } catch (cause) { return { etat: "refus", raison: motDe(cause) }; }
      const personnages = [];
      const illisibles = [];
      for (const rang of Array.isArray(rangs) ? rangs : []) {
        const issue = lireLeFichier(rang && rang.texte);
        /* ⛔ UN PERSONNAGE ILLISIBLE NE DISPARAÎT PAS DE LA LISTE : il se DIT, à part — le ranger
           sous un nom inventé le mêlerait aux vrais. */
        if (issue.etat !== "lu") { illisibles.push({ id: rang && rang.id, raison: issue.raison }); continue; }
        personnages.push({ id: rang.id, revision: rang.revision ?? null, document: issue.document });
      }
      personnages.sort(plusRecentEnTete);
      return { etat: "liste", personnages, illisibles };
    },

    async lire(id) {
      if (typeof id !== "string" || id === "") return { etat: "refus", raison: "this character has no id" };
      if (typeof adaptateur.lire !== "function") return { etat: "refus", raison: MOT_SANS_LISTE };
      let rang;
      try { rang = await adaptateur.lire(id); } catch (cause) { return { etat: "refus", raison: motDe(cause) }; }
      /* ⭐ ABSENT N'EST PAS UNE PANNE : le personnage n'est pas (ou plus) rangé ici — sa poubelle l'en
         a sorti, ou il n'y est jamais entré. Un refus, lui, dit que le lieu n'a pas pu répondre. */
      if (!rang) return { etat: "absent" };
      const issue = lireLeFichier(rang.texte);
      if (issue.etat !== "lu") return issue;
      return { etat: "lu", document: issue.document, revision: rang.revision ?? null };
    },

    /** ⭐ ON LUI PASSE LE TEXTE, PAS LE DOCUMENT — la loi de `ecrirePersonnage` (memoire.mjs) : un
     *  seul texte, celui du moteur (`canonicalText`), donc des octets rangés BYTE-IDENTIQUES à ceux
     *  qui partent en fichier. Une seconde sérialisation ici donnerait deux personnages identiques que
     *  rien ne reconnaîtrait comme tels.
     *  ⛔ ET LE SECOND ARGUMENT EST EXIGÉ : `{revision}` — `null` veut dire « je crois qu'il n'y en a
     *  pas encore ». Sans lui, rien n'atteint le lieu. */
    ecrire(texte, attendu) {
      if (!attendu || typeof attendu !== "object" || !Object.prototype.hasOwnProperty.call(attendu, "revision")) {
        return Promise.resolve({ ok: false, raison: MOT_SANS_REVISION });
      }
      if (typeof texte !== "string" || texte === "") {
        return Promise.resolve({ ok: false, raison: "the character was not serialised" });
      }
      /* ⛔ L'ORGANE NE RANGE QUE DES PERSONNAGES : le texte repasse devant le juge qui existe déjà. */
      const issue = lireLeFichier(texte);
      if (issue.etat !== "lu") return Promise.resolve({ ok: false, raison: issue.raison });
      const id = issue.document.id;
      if (typeof id !== "string" || id === "") return Promise.resolve({ ok: false, raison: "this character has no id" });
      const revision = attendu.revision === undefined ? null : attendu.revision;
      return enFile(async () => {
        try {
          /* `version` (lot 192) ne regarde que le NOM d'un fichier : la troisième voie de la
             confirmation du maître range « la version Fate's Hand ». Un lieu qui n'a pas de nom de
             fichier l'ignore. `garder` (Q1 b, l'heure d'un Save) demande à un lieu qui garde des
             VERSIONS d'en ranger une, datée ; la sauvegarde automatique ne le passe jamais. */
          const verdict = await adaptateur.ecrire(id, texte, revision, issue.document, { version: attendu.version, garder: attendu.garder });
          if (verdict && verdict.ok === true) return { ok: true, revision: verdict.revision ?? null };
          if (verdict && verdict.conflit === true) return { ok: false, conflit: true, revision: verdict.revision ?? null };
          return { ok: false, raison: (verdict && verdict.raison) || "this storage refused to store it" };
        } catch (cause) {
          return { ok: false, raison: motDe(cause) };
        }
      });
    },

    async effacer(id) {
      if (!capacites.efface || typeof adaptateur.effacer !== "function") {
        return { ok: false, raison: `${capacites.lieu}: nothing here can be deleted from this page` };
      }
      if (typeof id !== "string" || id === "") return { ok: false, raison: "this character has no id" };
      return enFile(async () => {
        try { await adaptateur.effacer(id); } catch (cause) { return { ok: false, raison: motDe(cause) }; }
        return { ok: true };
      });
    }
  };
}

/* ⭐ LE PLUS RÉCENT EN TÊTE, lu sur `modified` (ISO 8601 UTC à la seconde, qui se trie comme une
   chaîne). À égalité, l'`id` départage : l'ordre reste STABLE d'un rendu à l'autre — le joueur
   croirait sinon que la liste bouge toute seule. ⛔ Pas de `new Date()` : une seconde horloge. */
function plusRecentEnTete(a, b) {
  const ma = a && a.document && typeof a.document.modified === "string" ? a.document.modified : "";
  const mb = b && b.document && typeof b.document.modified === "string" ? b.document.modified : "";
  if (ma !== mb) return ma < mb ? 1 : -1;
  return String(a && a.id).localeCompare(String(b && b.id));
}

/* ══ L'ADAPTATEUR DE L'APPAREIL — la copie de l'app ═════════════════════════════════════════
   ⭐ UN PERSONNAGE PAR CLEF, ET LA CLEF EST SON `id` — celle que `composer` tire à la naissance et
   que le schéma exige. Le nom change, l'`id` ne change jamais : c'est lui qui fait « le même perso ».
   🔴 POURQUOI PAS `localStorage` (`memoire.mjs`) : il ne porte qu'UNE clef par site et ~5 Mo, et
   c'est la COPIE DE TRAVAIL, le cache que `Save character` vide. Les deux ne se remplacent pas :
   l'une reprend là où on en était, l'autre garde les personnages de My characters.
   ⚖️ LA RÉVISION EST UN COMPTEUR que l'appareil tient À CÔTÉ du texte (`r1`, `r2`…). Elle se compare
   et s'avance dans UNE transaction (`echanger`) : deux onglets ne peuvent pas lire la même révision
   puis écrire chacun la leur. */

/** Le mot de l'appareil — ⚠️ brouillon anglais à Eric. */
export const MOT_DE_L_APPAREIL = "in this app";

export function adaptateurAppareil(base) {
  return {
    capacites: { liste: true, ecrase: true, efface: true, sansGeste: true, possede: false, lieu: MOT_DE_L_APPAREIL },
    async tout() {
      const rangs = await base.tout(RAYON_PERSONNAGES);
      return rangs.map(({ clef, valeur }) => ({
        id: clef,
        texte: valeur && typeof valeur.texte === "string" ? valeur.texte : "",
        revision: valeur && typeof valeur.revision === "string" ? valeur.revision : null
      }));
    },
    async lire(id) {
      const valeur = await base.lire(RAYON_PERSONNAGES, id);
      if (!valeur) return null;
      return { texte: valeur.texte, revision: typeof valeur.revision === "string" ? valeur.revision : null };
    },
    async ecrire(id, texte, revision, document, { garder } = {}) {
      let conflit = null;
      let ecrite = null;
      await base.echanger(RAYON_PERSONNAGES, id, (actuelle) => {
        const tenue = actuelle && typeof actuelle.revision === "string" ? actuelle.revision : null;
        /* ⚖️ AUCUNE RÉVISION NE NAÎT QUAND SEULE UNE ESTAMPILLE CHANGE (ARCHI 35, 30/09) : la dérivation
           réécrit `modified` et `resolved.derivation.at` à chaque ouverture ; comparée sur le texte entier,
           chaque ouverture ferait naître une révision fantôme. On compare CE QUI FAIT LE PERSONNAGE —
           identique, rien n'est réécrit et la révision tenue est rendue (ni conflit, ni écriture). C'est
           la règle qu'il faudra aussi pour Dropbox. */
        if (actuelle && typeof actuelle.texte === "string" && memePersonnage(actuelle.texte, document)) { ecrite = tenue; return undefined; }
        /* ⚖️ § 10 — VÉRIFIER AVANT D'ÉCRIRE : la révision annoncée doit être celle que l'appareil
           tient. ⛔ Sinon RIEN n'est écrit, et on rend celle qu'il tient. (Le § 10 vise le stockage
           choisi, entre deux appareils ; l'appareil la tient AUSSI, entre deux onglets.) */
        if (tenue !== revision) { conflit = tenue; return undefined; }
        ecrite = revisionSuivante(tenue);
        return { texte, revision: ecrite };
      });
      if (ecrite === null) return { ok: false, conflit: true, revision: conflit };
      /* ⚖️ Q1 b — UN SAVE GARDE UNE VERSION DATÉE, À CÔTÉ : la clef du lot 195, jamais écrasée
         (`~2` si la seconde est prise). ⛔ Seulement quand on la demande (`garder`, l'heure du Save) :
         la sauvegarde automatique ne fabrique pas une version à chaque lettre tapée. */
      if (typeof garder === "string" && garder !== "") {
        const prises = new Set((await base.tout(RAYON_SAUVEGARDES)).map((r) => r.clef));
        await base.ecrire(RAYON_SAUVEGARDES, clefDeLEntree(document, garder, prises), texte);
      }
      return { ok: true, revision: ecrite };
    },
    /* ⚖️ Q1 b — la poubelle retire le personnage ENTIER : sa copie courante, puis chacune de ses
       versions datées — reconnues par leur `id`, jamais par leur nom (un perso renommé garde ses
       versions ; deux persos du même nom ne se perdent pas l'un l'autre). */
    async effacer(id) {
      await base.effacer(RAYON_PERSONNAGES, id);
      for (const { clef, valeur } of await base.tout(RAYON_SAUVEGARDES)) {
        if (dateDeLaClef(clef) === null || typeof valeur !== "string") continue;
        const issue = lireLeFichier(valeur);
        if (issue.etat === "lu" && issue.document.id === id) await base.effacer(RAYON_SAUVEGARDES, clef);
      }
    },
    /** Les versions datées d'un personnage, la plus récente en tête — pour la vue qui viendra, et
     *  pour la garde qui prouve qu'elles restent. */
    async versions(id) {
      const rangs = [];
      for (const { clef, valeur } of await base.tout(RAYON_SAUVEGARDES)) {
        const date = dateDeLaClef(clef);
        if (date === null || typeof valeur !== "string") continue;
        const issue = lireLeFichier(valeur);
        if (issue.etat === "lu" && issue.document.id === id) rangs.push({ clef, date });
      }
      return rangs.sort((a, b) => (a.date === b.date ? a.clef.localeCompare(b.clef) : a.date < b.date ? 1 : -1));
    }
  };
}

/** LA CLEF D'UNE VERSION DATÉE — celle du lot 195 : `<slug du nom>.<horodatage>.fh-char.json`.
 *  ⛔ Pas de `:` dans un nom de fichier (l'ISO 8601 en porte deux, le Finder les montre en `/`).
 *  🔴 Deux Save dans la même seconde font deux versions (`~2`, `~3`…) : ⚖️ *« rien n'est écrasé »*.
 *  Le MÊME nom sert au dossier (un fichier par Save) : un seul format de clef, deux lieux. */
export function clefDeLEntree(document, quand, dejaLa) {
  const prises = dejaLa instanceof Set ? dejaLa : new Set(Array.isArray(dejaLa) ? dejaLa : []);
  const nom = document && typeof document.name === "string" ? document.name.trim() : "";
  const base = `${slug(nom) || "character"}.${slug(quand)}`;
  let clef = `${base}.fh-char.json`;
  for (let n = 2; prises.has(clef); n += 1) clef = `${base}~${n}.fh-char.json`;
  return clef;
}

function slug(mot) {
  return String(mot).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Deux textes portent-ils le MÊME personnage, estampilles de la dérivation mises à part ?
 *  ⛔ Un texte illisible n'est le même que rien : on écrit. */
function memePersonnage(texteTenu, document) {
  let tenu;
  try { tenu = JSON.parse(texteTenu); } catch (_) { return false; }
  try { return canonicalText(ceQuiFaitLePersonnage(tenu)) === canonicalText(ceQuiFaitLePersonnage(document)); } catch (_) { return false; }
}

/** `null` → `r1`, `r7` → `r8`. ⛔ Une révision illisible ne se « répare » pas en `r1` : elle
 *  repart de sa valeur, et un compteur qui aurait perdu la mémoire le dirait au premier conflit. */
export function revisionSuivante(revision) {
  const m = /^r(\d+)$/.exec(String(revision));
  return `r${m ? Number(m[1]) + 1 : 1}`;
}

/* ══ L'ADAPTATEUR DU FICHIER — la voie d'aujourd'hui, et celle d'iCloud ═══════════════════════
   ⚖️ Vault (29/09) : *« un fichier (la voie iCloud) »* — aucun site ne peut écrire dans l'iCloud
   Drive ; le fichier passe par un téléchargement, que le joueur range où il veut (l'app Fichiers).
   🔴 CE QU'UN FICHIER NE SAIT PAS FAIRE, ET IL LE DÉCLARE : une page web ne peut ni lister les
   fichiers qu'elle a téléchargés, ni les relire sans que le joueur les lui tende (`Open a file…`),
   ni les effacer. Et elle ne peut rien écrire sans un clic (`sansGeste: false`) : c'est `Save
   character` qui l'écrit. ⭐ Chaque téléchargement est un FICHIER DE PLUS — rien n'est jamais
   remplacé, donc aucune révision à comparer (`ecrase: false`).
   ⛔ `telecharger` et `nomDuFichier` sont INJECTÉS : `Blob` et `URL` n'existent ni dans `node:test`
   ni dans le `dom-stub` (la loi de `fichier.mjs`), et le nom se lit là où il est déjà écrit
   (`nomDeFichier`, review-step.mjs) — jamais un second format de nom. */

/** Le mot du fichier — ⚠️ brouillon anglais à Eric. */
export const MOT_DU_FICHIER = "a file you keep";

export function adaptateurFichier({ telecharger, nomDuFichier }) {
  return {
    capacites: { liste: false, ecrase: false, efface: false, sansGeste: false, possede: true, lieu: MOT_DU_FICHIER },
    async ecrire(id, texte, _revision, document, { version } = {}) {
      telecharger({ nom: nomDuFichier(document, version), type: "application/json", contenu: texte });
      return { ok: true, revision: null };
    }
  };
}

/* ══ L'ADAPTATEUR DU DOSSIER — Chrome et Edge sur ordinateur (lots 195 et 202, Q2 → a) ═══════════
   ⚖️ Eric, 28/09 : *« on le fait une fois au début et après. c'est streamlined »*. Le navigateur sait
   choisir un dossier UNE FOIS et le retenir (`showDirectoryPicker`, la poignée persistée dans la base)
   — Safari et l'iPad, non : là, le lieu choisi reste le fichier.
   ⭐ UN FICHIER PAR SAVE, JAMAIS ÉCRASÉ — la clef datée du lot 195 (`clefDeLEntree`) : le dossier garde
   les versions comme l'appareil (Q1 b), et il n'a donc aucune révision à comparer (`ecrase: false`).
   Il sait EFFACER (les fichiers du personnage, reconnus par leur `id`) : la poubelle y pose donc la
   question du 29/09, *« Delete this character for good? »*.
   🔴 LOT 202 — UNE PERMISSION SE DEMANDE DANS UN GESTE, HORS GESTE ON LA REGARDE (📍
   `geste-permission-se-demande-dans-le-geste`) : Chrome retient la poignée, mais remet sa permission à
   « prompt » à chaque rechargement, et la demander hors d'un clic jette `SecurityError`. `ecrire` et
   `effacer` sont toujours appelés dans un clic (Save character, Delete) : ils DEMANDENT. ⛔ Un refus se
   dit, avec la sortie (`Save location`) — jamais un repli silencieux vers un autre lieu.
   ⏳ `sansGeste: false` : la sauvegarde automatique n'écrit pas dans le dossier (elle y fabriquerait une
   version par modification) ; le dossier reçoit chaque Save. ⚠️ NON ÉPROUVÉ PAR UN TEST sur une vraie
   poignée (aucune suite ne peut en fabriquer) : la logique se prouve sur une poignée de FIXTURE qui a
   exactement la surface touchée ici. */

/** Le mot d'un dossier dont la permission est perdue — il NOMME la sortie. ⚠️ Brouillon anglais à Eric. */
export const MOT_PERMISSION_PERDUE = "this browser no longer has permission for that folder — choose it again from Save location";

export function adaptateurDossier(poignee) {
  const nom = poignee && typeof poignee.name === "string" && poignee.name.trim() !== "" ? poignee.name.trim() : "a folder you chose";
  /* REGARDER — `queryPermission` ne demande rien et Chrome l'accepte hors de tout geste. */
  const acces = async () => {
    if (typeof poignee.queryPermission !== "function") return "accorde";
    const mot = await poignee.queryPermission({ mode: "readwrite" });
    if (mot === "granted") return "accorde";
    return mot === "prompt" ? "a-demander" : "refuse";
  };
  /* DEMANDER — dans le clic seulement (voir la tête). */
  const permis = async () => {
    const vu = await acces();
    if (vu === "accorde") return;
    if (vu === "a-demander" && typeof poignee.requestPermission === "function" &&
        (await poignee.requestPermission({ mode: "readwrite" })) === "granted") return;
    throw new Error(MOT_PERMISSION_PERDUE);
  };
  const fichiers = async () => {
    const noms = [];
    for await (const [cle, enfant] of poignee.entries()) if (enfant && enfant.kind === "file") noms.push(cle);
    return noms;
  };
  return {
    capacites: { liste: false, ecrase: false, efface: true, sansGeste: false, possede: true, lieu: nom },
    acces,
    async ecrire(id, texte, _revision, document, { garder } = {}) {
      await permis();
      const quand = typeof garder === "string" && garder !== "" ? garder : document.modified;
      const clef = clefDeLEntree(document, quand, new Set(await fichiers()));
      const fiche = await poignee.getFileHandle(clef, { create: true });
      const plume = await fiche.createWritable();
      await plume.write(texte);
      await plume.close();
      return { ok: true, revision: null };
    },
    async effacer(id) {
      await permis();
      for (const clef of await fichiers()) {
        if (dateDeLaClef(clef) === null) continue;            // pas à nous : jamais touché
        const texte = await (await (await poignee.getFileHandle(clef)).getFile()).text();
        const issue = lireLeFichier(texte);
        if (issue.etat === "lu" && issue.document.id === id) await poignee.removeEntry(clef);
      }
    }
  };
}

/** ⭐ CE QUE LE NAVIGATEUR PEUT — mesuré, jamais deviné à partir de son nom (lot 195). */
export function dossierPossible(fenetre) {
  return Boolean(fenetre && typeof fenetre.showDirectoryPicker === "function");
}

/** LE DOSSIER RETENU, s'il y en a un et que le navigateur sait s'en servir — sinon `null`. */
export async function dossierRetenu({ base, possible }) {
  if (!possible) return null;
  try {
    const reglage = await base.lire(RAYON_REGLAGES, CLEF_DESTINATION);
    return reglage && reglage.poignee ? reglage.poignee : null;
  } catch (_) { return null; }
}

/** CHOISIR LE DOSSIER — la boîte du système, UNE fois, sur un vrai clic (`Save location`).
 *  ⚠️ NON ÉPROUVÉ PAR UN TEST : `showDirectoryPicker` exige une activation transitoire.
 *  @returns {Promise<{etat:"choisi"}|{etat:"decline"}|{etat:"refus",raison:string}>} */
export async function choisirUnDossier({ base, showDirectoryPicker }) {
  if (typeof showDirectoryPicker !== "function") return { etat: "refus", raison: "this browser cannot choose a folder" };
  let poignee;
  /* ⭐ FERMER LA BOÎTE N'EST PAS UNE PANNE (`AbortError`) : le joueur a répondu « pas celui-là ». */
  try { poignee = await showDirectoryPicker({ id: "fhpc-saves", mode: "readwrite" }); } catch (_) { return { etat: "decline" }; }
  try { await base.ecrire(RAYON_REGLAGES, CLEF_DESTINATION, { demandee: true, poignee }); } catch (cause) {
    return { etat: "refus", raison: motDe(cause) };
  }
  return { etat: "choisi" };
}

/* ══ ⚖️ LES DEUX SÉQUENCES QUI TOUCHENT DEUX LIEUX — pures, et gardées ═════════════════════════
   La coquille les APPELLE ; elle ne recompose jamais leur ordre. ⭐ L'ordre EST la règle, et un ordre
   qui ne vivrait que dans une coquille ne se mesure pas (la loi de `sauvegarderPuisEteindre`). */

/** 💾 SAUVER — `Save character`, le `Save` de New character, la version FH du lot 192.
 *  ① LA COPIE DE L'APP d'abord : le personnage ENTRE dans My characters (ou y avance), et une version
 *     datée est gardée derrière sa ligne (`quand`, Q1 b), sur la révision
 *     qu'on croit remplacer — § 10, vérifier avant d'écrire. ⛔ Refusée, RIEN d'autre ne part : le
 *     joueur n'a pas un fichier d'un côté et une liste qui ne le connaît pas de l'autre.
 *  ② LE LIEU CHOISI ensuite (le fichier aujourd'hui : un téléchargement, dans le clic du joueur).
 *  @returns {Promise<{ok:true, revision:string|null}
 *   | {ok:false, ou:"app", conflit?:true, revision?:string|null, raison?:string}
 *   | {ok:false, ou:"choisi", revision:string|null, raison:string}>}
 *   `ou:"choisi"` = la copie de l'app est rangée (sa révision est rendue), seul le lieu choisi a refusé. */
export async function sauverDansLesDeux({ appareil, choisi, texte, revisionApp, version, quand }) {
  /* ⚖️ Q1 b — un Save GARDE une version datée (`garder`), en plus d'avancer la copie courante. */
  const app = await appareil.ecrire(texte, { revision: revisionApp ?? null, garder: quand });
  if (!app.ok) return { ok: false, ou: "app", conflit: app.conflit === true, revision: app.revision ?? null, raison: app.raison };
  /* ⏳ Le lieu choisi d'aujourd'hui ne remplace jamais rien (`ecrase: false`) : sa révision est `null`.
     Dropbox tiendra la sienne — c'est au lot qui le branche de la porter ici, pas à celui-ci de
     l'inventer. */
  const loin = await choisi.ecrire(texte, { revision: null, version });
  if (!loin.ok) return { ok: false, ou: "choisi", revision: app.revision, raison: loin.raison || "this storage refused to store it" };
  return { ok: true, revision: app.revision };
}

/** 🗑️ EFFACER — la poubelle de My characters, SELON LE STOCKAGE CHOISI.
 *  ⚖️ Eric, 30/09 : un lieu qui ne sait pas effacer (le fichier) → *« Efface la copie de l'app »*, et
 *  le fichier reste où le joueur l'a rangé. Un lieu qui SAIT effacer (Dropbox demain) → la dictée du
 *  29/09 : effacé du stockage, pour de bon, PUIS de l'app. ⛔ Le lieu choisi refuse → l'app garde sa
 *  copie : on n'efface pas la ligne d'un personnage qu'on n'a pas su effacer là où il vit.
 *  @returns {Promise<{ok:true, ou:string[]}|{ok:false, raison:string}>} `ou` = les lieux effacés. */
export async function effacerSelonLeStockage({ appareil, choisi, id }) {
  const ou = [];
  if (choisi.capacites.efface) {
    const loin = await choisi.effacer(id);
    if (!loin.ok) return { ok: false, raison: loin.raison };
    ou.push(choisi.capacites.lieu);
  }
  const ici = await appareil.effacer(id);
  if (!ici.ok) return { ok: false, raison: ici.raison };
  ou.push(appareil.capacites.lieu);
  return { ok: true, ou };
}

/* ══ ⚖️ LA RÉOUVERTURE — ce que la copie de travail fait de la copie de l'app ════════════════
   § 10 : *« un envoi raté repart à la réouverture, ET LE DIT »* ; et, deux appareils (ou deux
   onglets) ayant écrit : *« l'app VÉRIFIE AVANT D'ÉCRIRE »* — l'écriture en arrière-plan ne peut pas
   poser de question, *« la question est posée à la réouverture »*.
   ⭐ LA DÉCISION EST PURE, et elle lit trois faits : la copie de travail (le texte), la révision sur
   laquelle elle repose (`base`, memoire.mjs), et la copie de l'app (texte et révision).
   · pas de copie de travail                       → `rien` ;
   · l'app n'a pas ce personnage                   → `hors-app` (il n'est pas dans My characters :
                                                     jamais sauvé, ou sa poubelle l'en a sorti) ;
   · même révision, même texte                     → `rien` (tout est arrivé) ;
   · même révision, texte différent                → `renvoyer` (un envoi a raté : il repart, et le dit) ;
   · révision différente                           → `question` (quelqu'un d'autre a écrit).
   ⚠️ UNE COPIE DE TRAVAIL SANS BASE, que l'app connaît (la reprise des sauvegardes datées, au premier
   démarrage de ce lot) → `renvoyer` : la sauvegarde datée a été faite DEPUIS cette copie de travail,
   qui a continué d'avancer — c'est elle, la plus récente. Poser une question à ce moment-là
   demanderait au joueur de trancher un conflit qui n'existe pas.
   @returns {{geste:"rien"|"hors-app"|"renvoyer"|"question", revision:string|null}} */
export function aLaReouverture({ travail, base, app }) {
  if (!travail || typeof travail.texte !== "string" || typeof travail.id !== "string") return { geste: "rien", revision: null };
  if (!app) return { geste: "hors-app", revision: null };
  const revision = typeof app.revision === "string" ? app.revision : null;
  const surLaMeme = !base || base.id !== travail.id || base.revision === revision;
  if (!surLaMeme) return { geste: "question", revision };
  return { geste: app.texte === travail.texte ? "rien" : "renvoyer", revision };
}

/* ══ LA REPRISE DES SAUVEGARDES DATÉES (lots 195 à 373) ══════════════════════════════════════
   ⚖️ Un joueur qui a sauvé Ilyra trois fois retrouve Ilyra, UNE fois, dans My characters — sa version
   la plus récente. ⛔ Les entrées datées ne sont PAS effacées : elles restent dans leur rayon, intactes,
   et la reprise ne se fait qu'une fois (marquée dans les réglages). Rien de ce que le joueur a gardé ne
   disparaît par une mise à jour. */

/** L'heure qu'une clef datée du lot 195 porte, en ISO 8601 — ou `null` si ce n'en est pas une. */
export function dateDeLaClef(clef) {
  if (typeof clef !== "string" || !clef.endsWith(".fh-char.json")) return null;
  const m = /\.(\d{4})-(\d{2})-(\d{2})t(\d{2})-(\d{2})-(\d{2})z(?:~\d+)?\.fh-char\.json$/.exec(clef);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null;
}

/** LA REPRISE — une fois. @returns {Promise<{repris:number}>} */
export async function reprendreLesAnciennesSauvegardes(base) {
  const reglage = await lireLeReglage(base, CLEF_REPRISE);
  if (reglage && reglage.fait === true) return { repris: 0 };
  const deja = new Set((await base.tout(RAYON_PERSONNAGES)).map((r) => r.clef));
  const plusRecente = new Map();
  for (const { clef, valeur } of await base.tout(RAYON_SAUVEGARDES)) {
    const date = dateDeLaClef(clef);
    if (date === null || typeof valeur !== "string") continue;
    const issue = lireLeFichier(valeur);
    if (issue.etat !== "lu" || typeof issue.document.id !== "string") continue;
    const id = issue.document.id;
    const tenue = plusRecente.get(id);
    if (!tenue || tenue.date < date) plusRecente.set(id, { date, texte: valeur });
  }
  let repris = 0;
  for (const [id, { texte }] of plusRecente) {
    /* ⛔ Un personnage déjà dans l'app n'est pas remplacé par une ancienne sauvegarde. */
    if (deja.has(id)) continue;
    await base.echanger(RAYON_PERSONNAGES, id, (actuelle) => (actuelle ? undefined : { texte, revision: revisionSuivante(null) }));
    repris += 1;
  }
  await base.ecrire(RAYON_REGLAGES, CLEF_REPRISE, { fait: true });
  return { repris };
}

async function lireLeReglage(base, clef) {
  try { return await base.lire(RAYON_REGLAGES, clef); } catch (_) { return null; }
}

/* ══ LA BASE — IndexedDB, le rideau le plus fin possible ═════════════════════════════════════
   ⚠️ NON ÉPROUVÉE PAR UN TEST (Node n'a pas `indexedDB`) : c'est pour ça qu'elle ne prend AUCUNE
   décision. Trois rayons, cinq verbes, zéro logique — tout ce qui décide est au-dessus, sur une base
   de fixture. ⭐ `echanger` exécute la décision qu'on lui passe DANS la transaction qui lit : c'est
   ce qui rend « comparer la révision, puis écrire » indivisible entre deux onglets. La décision est
   celle de l'appelant ; la base ne fait que la tenir dans la même transaction.
   🔄 LOT 374 — VERSION 2 : le rayon `personnages` s'ajoute ; `sauvegardes` (les entrées datées) et
   `reglages` restent tels quels. */

export const BASE_NOM = "fhpc";
export const BASE_VERSION = 2;
const RAYON_PERSONNAGES = "personnages";
const RAYON_SAUVEGARDES = "sauvegardes";
const RAYON_REGLAGES = "reglages";
const CLEF_REPRISE = "reprise-374";
/* La clef du dossier retenu — celle des lots 195 et 202 : un joueur qui avait choisi son dossier le
   retrouve. */
const CLEF_DESTINATION = "destination";
export const RAYONS = Object.freeze([RAYON_PERSONNAGES, RAYON_SAUVEGARDES, RAYON_REGLAGES]);

export function baseIndexedDb(indexedDB) {
  let ouverture = null;
  const base = () => {
    if (ouverture === null) {
      ouverture = new Promise((resoudre, rejeter) => {
        if (!indexedDB || typeof indexedDB.open !== "function") {
          rejeter(new Error("this browser has no database for the app"));
          return;
        }
        const requete = indexedDB.open(BASE_NOM, BASE_VERSION);
        requete.onupgradeneeded = () => {
          for (const rayon of RAYONS) {
            if (!requete.result.objectStoreNames.contains(rayon)) requete.result.createObjectStore(rayon);
          }
        };
        requete.onsuccess = () => resoudre(requete.result);
        requete.onerror = () => rejeter(requete.error || new Error("this browser refused its database"));
      });
    }
    return ouverture;
  };
  const requeteDe = (requete) => new Promise((resoudre, rejeter) => {
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error || new Error("this browser refused to store it"));
  });
  const store = async (rayon, mode) => (await base()).transaction(rayon, mode).objectStore(rayon);
  return {
    lire: async (rayon, clef) => {
      const v = await requeteDe((await store(rayon, "readonly")).get(clef));
      return v === undefined ? null : v;
    },
    ecrire: async (rayon, clef, valeur) => { await requeteDe((await store(rayon, "readwrite")).put(valeur, clef)); },
    effacer: async (rayon, clef) => { await requeteDe((await store(rayon, "readwrite")).delete(clef)); },
    tout: async (rayon) => {
      const s = await store(rayon, "readonly");
      const [clefs, valeurs] = await Promise.all([requeteDe(s.getAllKeys()), requeteDe(s.getAll())]);
      return clefs.map((clef, i) => ({ clef: String(clef), valeur: valeurs[i] }));
    },
    echanger: async (rayon, clef, decider) => {
      const s = await store(rayon, "readwrite");
      const actuelle = await requeteDe(s.get(clef));
      const suivante = decider(actuelle === undefined ? null : actuelle);
      if (suivante !== undefined) await requeteDe(s.put(suivante, clef));
    }
  };
}

/** Le mot d'un refus, tel que la panne l'a dit — ⚠️ jamais une prose inventée (la loi de
 *  `raisonDe`, memoire.mjs). */
function motDe(cause) {
  const mot = cause && typeof cause.message === "string" ? cause.message.trim() : "";
  return mot !== "" ? mot : "this browser refused";
}
