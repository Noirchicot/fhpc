/* ══ LA MÉMOIRE DU NAVIGATEUR — UN personnage, et un seul ══════════════════
   Eric, 2026-08-20 : *« Un perso est enregistré dans le navigateur de tout le
   monde, et disparaît s'il n'est pas enregistré s'il y a un reset. Pour le
   moment ça suffit je crois. Et à un moment chaque compte sauvegardera chez
   lui. »*

   📏 CE QUE ÇA RÉPARE, MESURÉ SUR LE SITE DÉPLOYÉ LE 2026-08-20 : choisir
   Fighter, recharger la page, et retomber sur **Wizard** — le personnage
   d'exemple commité. `localStorage` était vide avant et après. Tout ce que le
   joueur faisait mourait avec l'onglet.

   ⛔ CE FICHIER N'EST PAS L'EXPORT, ET LES DEUX NE SE REMPLACENT PAS.
   `fichier.mjs` sort des octets vers le DISQUE du joueur — c'est ce qu'Eric
   appelle « enregistré », et c'est la seule copie qui survit à un nettoyage du
   navigateur. Celui-ci ne fait que **reprendre là où on en était** : il
   n'existe que dans ce navigateur, et il s'efface avec ses données de site.
   ⏳ Le jour où « chaque compte sauvegardera chez lui », c'est ce module-ci qui
   gagnera une seconde adresse — pas l'export, qui restera ce qu'il est.

   ── POURQUOI LE MAGASIN EST INJECTABLE ──────────────────────────────────
   Même loi que `fichier.mjs` : `window.localStorage` n'existe NI dans
   `node:test` NI dans le `dom-stub`. Le passer plutôt que de le lire au global
   n'est pas une abstraction pour un besoin imaginé — c'est la seule façon de
   tester ce que ce module fait d'un magasin qui REFUSE (mode privé, quota
   plein), et ce refus est la moitié intéressante du fichier.

   ── ⛔ AUCUN REPLI SILENCIEUX (loi §0.5) ────────────────────────────────
   Trois réponses NOMMÉES, jamais un `null` qui voudrait dire trois choses :
   `vide` (personne n'a rien écrit), `lu` (voici le personnage), `refus`
   (quelque chose est là ou le magasin existe, mais on ne peut pas s'en
   servir — et on dit pourquoi). L'appelant montre le refus au joueur ; il ne
   le devine pas. */

/** ⭐ UNE SEULE CLEF, ET C'EST LA RÈGLE D'ERIC EN UN MOT : « un perso ».
 *  Écrire un second personnage écraserait le premier — c'est voulu tant qu'il
 *  n'y a pas d'écran pour en choisir un. Le jour où il y en aura un, cette
 *  clef deviendra un préfixe, et ce fichier sera le seul à changer. */
export const CLEF_PERSONNAGE = "fhpc.personnage";

/** Le magasin réel, ou `null` s'il n'y en a pas.
 *  ⚠️ LA SIMPLE LECTURE DE `window.localStorage` PEUT JETER — iframe
 *  cloisonnée, cookies tiers bloqués. Le `try` est donc autour de l'ACCÈS,
 *  pas seulement autour des appels. */
function leMagasin(magasin) {
  if (magasin) return magasin;
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage || null;
  } catch (_) { return null; }
}

/** LE PERSONNAGE GARDÉ DANS CE NAVIGATEUR.
 *  @returns {{etat:"vide"}|{etat:"lu",document:object}|{etat:"refus",raison:string}}
 *  `vide` = rien à reprendre · `lu` = le voici · `refus` = il y en avait un et
 *  il est inutilisable.
 *
 *  ⚠️ UN TEXTE ILLISIBLE N'EST PAS « RIEN ». Retomber sur l'exemple sans le
 *  dire ferait croire au joueur que son personnage n'a jamais existé, alors
 *  qu'il est là, corrompu, sous la même clef. On le NOMME, et on laisse
 *  l'appelant décider — c'est exactement le repli silencieux que la loi §0.5
 *  interdit. */
export function lirePersonnage(magasin) {
  /* ⭐ `refus` VEUT DIRE UNE SEULE CHOSE, ET C'EST CE QUI LE REND UTILE :
     « il y avait un personnage, et il est inutilisable ». Un magasin absent ou
     illisible n'est PAS ça — c'est « rien à reprendre », et le problème de
     magasin sera rapporté par l'ÉCRITURE, une fois, là où il est actionnable
     (« exporte ton personnage, ce navigateur ne le gardera pas »). Le dire
     deux fois ferait deux messages pour une seule panne, et le joueur
     chercherait deux causes. */
  const store = leMagasin(magasin);
  if (!store) return { etat: "vide" };
  let texte;
  try { texte = store.getItem(CLEF_PERSONNAGE); } catch (_) {
    return { etat: "vide" };
  }
  if (texte === null || texte === undefined || texte === "") return { etat: "vide" };
  let document;
  try { document = JSON.parse(texte); } catch (_) {
    return { etat: "refus", raison: "the saved character could not be read" };
  }
  /* ⛔ ON NE VALIDE PAS ICI, ET C'EST DÉLIBÉRÉ. Le juge du document est le
     moteur (`rebuild`, puis `validate`), et il sait déjà refuser en NOMMANT ce
     qui cloche. Un second juge dans un écran serait une deuxième vérité sur ce
     qu'est un personnage valable — et c'est celle-ci qui se tromperait, parce
     qu'elle ne connaît pas les couches montées.
     ⚠️ On vérifie seulement que c'est un OBJET : `JSON.parse("3")` rend un
     nombre, et le passer au moteur donnerait une erreur illisible. */
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return { etat: "refus", raison: "the saved character is not a character" };
  }
  return { etat: "lu", document };
}

/** GARDER LE PERSONNAGE. On lui passe le TEXTE, pas le document.
 *
 *  ⭐ ET CE N'EST PAS UN DÉTAIL D'INTERFACE : l'appelant sérialise déjà pour
 *  savoir si quelque chose a changé (`canonicalText`), et une seconde
 *  sérialisation ici donnerait deux textes pour un même personnage — donc deux
 *  façons de répondre « est-ce le même ? ». Un seul texte, une seule vérité.
 *
 *  @returns {{ok:true}|{ok:false,raison:string}}
 */
export function ecrirePersonnage(texte, magasin) {
  const store = leMagasin(magasin);
  if (!store) return { ok: false, raison: "this browser does not allow local storage" };
  try {
    store.setItem(CLEF_PERSONNAGE, String(texte));
    return { ok: true };
  } catch (erreur) {
    return { ok: false, raison: raisonDe(erreur) };
  }
}

/** OUBLIER. ⛔ Personne ne l'appelle aujourd'hui — et ce n'est PAS du code mort
 *  (loi §0.6) : c'est la moitié de la clef, sans laquelle `lire`/`écrire` ne
 *  forment pas un magasin. Un test l'exerce, et le jour où un geste « nouveau
 *  personnage » existera (il n'existe pas : le builder n'a aucun personnage
 *  VIERGE, seulement l'exemple commité), il n'aura rien à écrire ici. */
export function oublierPersonnage(magasin) {
  const store = leMagasin(magasin);
  if (!store) return { ok: false, raison: "this browser does not allow local storage" };
  try {
    store.removeItem(CLEF_PERSONNAGE);
    return { ok: true };
  } catch (erreur) {
    return { ok: false, raison: raisonDe(erreur) };
  }
}

/** Le mot d'un refus, tel que le navigateur l'a dit.
 *  ⚠️ ON NE TRADUIT PAS `QuotaExceededError` EN PROSE : un message inventé
 *  vieillirait mal et mentirait sur un cas qu'on n'a pas prévu. On rend ce que
 *  l'erreur porte, et un repli seulement quand elle ne porte rien. */
function raisonDe(erreur) {
  const mot = erreur && typeof erreur.message === "string" ? erreur.message.trim() : "";
  return mot !== "" ? mot : "this browser refused to store it";
}
