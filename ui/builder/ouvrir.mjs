/* ══ OUVRIR UN PERSONNAGE DEPUIS UN FICHIER ═══════════════════════════════
   ⚖️ LA LOI D'ERIC, 2026-09-06, et c'est elle qui fait exister ce module :

   > *« La règle de FH : **chacun est propriétaire de ses données**. On passe
   > par l'app Fichiers, libre à moi de le mettre sur le cloud ou sur l'iPad
   > ou ailleurs. Sur desktop ou ailleurs, **je choisis où je range mes
   > persos**. »*

   🔴 CE QU'IL RÉPARE, MESURÉ LE 06/09 : `fichier.mjs` sait SORTIR des octets
   — `Export JSON` écrit les octets canoniques du moteur, le format existe et
   il est juste — et **rien ne savait les relire**. `grep` sur tout `ui/` :
   zéro `FileReader`, zéro `type="file"`, zéro sélecteur. ⛔ **Un fichier
   qu'on ne peut pas rouvrir n'est pas une sauvegarde, c'est une impression.**
   La loi d'Eric n'était donc écrite qu'à moitié : on possédait ses données
   sans jamais pouvoir y revenir.

   ⭐ ET C'EST LE FICHIER QUI PORTE LA LOI, PAS LE NAVIGATEUR. `memoire.mjs`
   garde un personnage dans CE navigateur : c'est un cache de reprise, il
   meurt avec les données de site. Le fichier, lui, va où Eric le range —
   cloud, iPad, disque. Les deux ne se remplacent pas et ne se ressemblent
   pas : l'un reprend, l'autre appartient.

   ── ⛔ CE QUE CE MODULE NE FAIT PAS, ET C'EST LA MOITIÉ DU CONTRAT ───────
   Il vérifie qu'un fichier est **un document de ce builder**. Rien de plus.
   Savoir si les choix tiennent encore sous les couches du jour est le métier
   du MOTEUR (`rebuild`, puis `validate`), qui le dit déjà, mieux, et avec les
   mots des couches. Un second juge ici divergerait du premier le jour où une
   règle bouge — le défaut « deux organes qui disent la même chose » du lot
   60, appliqué à la validation.
   ⚠️ Conséquence VOULUE : un fichier gardé avant un changement de couche
   entre, et c'est l'écran qui explique qu'il ne dérive plus. Le refuser ici
   priverait le joueur du seul organe capable de le lui dire.

   ── ⛔ AUCUN REPLI SILENCIEUX (loi §0.5) ────────────────────────────────
   Deux réponses NOMMÉES — `lu` et `refus` — et le refus porte un mot que le
   joueur peut lire. ⭐ Deux causes ne partagent jamais le même mot : « rien
   ne se passe » quand il a choisi une photo, ou « fichier illisible » quand
   c'est la fiche d'un AUTRE outil, l'enverraient chercher la panne au mauvais
   endroit. Un garde mesure cette distinction, il ne la suppose pas. */

/** Ce que le builder écrit en tête de ses fichiers, et la seule chose qu'il
 *  accepte de rouvrir. ⭐ Le nom est EXPORTÉ pour que personne n'en recopie
 *  la chaîne ailleurs : une constante recopiée est une divergence qui attend. */
export const SCHEMA_ATTENDU = "fh-char/1";

/** LE PERSONNAGE D'UN FICHIER.
 *  @param {string} texte  le contenu du fichier, tel que lu
 *  @returns {{etat:"lu",document:object}|{etat:"refus",raison:string}}
 *
 *  ⚠️ Les mots des refus sont de l'anglais d'interface : ils remontent tels
 *  quels à l'écran, comme ceux de `memoire.mjs`. On ne traduit pas et on
 *  n'invente pas de prose — on nomme ce qui manque. */
export function lireLeFichier(texte) {
  if (typeof texte !== "string") return { etat: "refus", raison: "this file could not be read" };
  if (texte.trim() === "") return { etat: "refus", raison: "this file is empty" };

  let document;
  try { document = JSON.parse(texte); } catch (_) {
    return { etat: "refus", raison: "this file is not JSON — a character file ends in .fh-char.json" };
  }
  /* ⚠️ `typeof null === "object"` et un tableau AUSSI : les deux passeraient
     un test naïf sur le type, et le suivant lirait `.schema` sur du vide. */
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return { etat: "refus", raison: "this file holds JSON, but not a character" };
  }
  /* ⭐ LE REFUS DU MAUVAIS OUTIL CITE CE QUE LE FICHIER PRÉTEND ÊTRE. Sans
     ça, « ce n'est pas un personnage Fate's Hand » laisse croire à un fichier
     corrompu, alors qu'il est parfaitement valide — ailleurs. */
  if (typeof document.schema !== "string" || document.schema === "") {
    return { etat: "refus", raison: "this file does not say what it is" };
  }
  if (document.schema !== SCHEMA_ATTENDU) {
    return { etat: "refus", raison: `this file says it is "${document.schema}", not a Fate's Hand character` };
  }
  /* ⛔ LA SEULE STRUCTURE QU'ON EXIGE, ET ON EXIGE LA BONNE : le document ne
     garde pas une fiche calculée, il garde les CHOIX — c'est `build.choices`
     que `rebuild()` rejoue. Un fichier sans elle n'est pas « incomplet », il
     est vide de tout ce qui fait un personnage. */
  if (!document.build || typeof document.build !== "object" ||
      !Array.isArray(document.build.choices)) {
    return { etat: "refus", raison: "this character file has no choices to replay" };
  }
  return { etat: "lu", document };
}
