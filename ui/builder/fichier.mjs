/* ══ SORTIR UN FICHIER DU BUILDER — lot 67 ═══════════════════════════════
   B9.4 : *« possiblement un EXPORT JSON ou HTML de la fiche, tout en bas »*.

   ⛔ LA LOI §0.9 CADRE TOUT CE FICHIER : *« aucun serveur mondial à
   maintenir »*. Il n'existe donc **nulle part où déposer des octets** — pas
   d'upload, pas d'URL de partage, pas de compte. La seule sortie possible
   est **le disque du joueur**, par les deux gestes que le navigateur offre
   sans serveur : télécharger, et ouvrir dans un onglet.

   ── POURQUOI `env` EST INJECTABLE ────────────────────────────────────────
   `Blob`, `URL.createObjectURL` et `window.open` sont les trois seules
   choses de tout `ui/` qui n'existent NI dans `node:test` NI dans le
   `dom-stub`. Les passer plutôt que les lire au global n'est pas une
   abstraction pour un besoin imaginé : c'est la seule façon de tester que ce
   fichier appelle **le bon nom de fichier avec le bon type MIME**, et le lot
   66 vient de rappeler ce que coûte un module de `ui/` qu'aucun test
   n'importe (une virgule manquante, l'application morte, 993 verts).

   ⚠️ LA RÉVOCATION EST DIFFÉRÉE, ET C'EST MESURÉ AILLEURS QUE CHEZ NOUS :
   révoquer l'URL dans le même tour annule le téléchargement qu'on vient de
   déclencher — le navigateur n'a pas encore lu les octets. */

/** Le délai avant de rendre les octets au navigateur. Assez long pour qu'un
 *  téléchargement démarre et qu'un onglet charge ; assez court pour ne pas
 *  garder un personnage entier en mémoire une fois la page quittée. */
export const REVOKE_MS = 60_000;

function urlDe(fichier, env) {
  const blob = new env.Blob([fichier.contenu], { type: fichier.type });
  const url = env.URL.createObjectURL(blob);
  env.setTimeout(() => env.URL.revokeObjectURL(url), REVOKE_MS);
  return url;
}

/** Télécharge `{nom, type, contenu}`. Rend le nom écrit sur le lien — c'est
 *  ce qu'un test peut lire, et c'est ce que le joueur retrouvera sur son
 *  disque. */
export function telecharger(fichier, env = globalThis) {
  const lien = env.document.createElement("a");
  lien.href = urlDe(fichier, env);
  lien.download = fichier.nom;
  /* ⛔ PAS D'INSERTION DANS LE DOCUMENT. Un `<a>` posé puis retiré ferait
     clignoter le cadre et, surtout, passerait sous les yeux du `spy` du
     socle — qui compterait un point d'aimantation de plus le temps d'un
     tour. Un clic programmatique sur un nœud détaché suffit : mesuré. */
  lien.click();
  return lien.download;
}

/** Ouvre `{type, contenu}` dans un onglet. Rend `false` si le navigateur a
 *  refusé — et l'appelant DOIT le dire : un bouton qui ne fait rien en
 *  silence est exactement le « faux magasin » que le mandat interdit. */
export function ouvrirOnglet(fichier, env = globalThis) {
  const onglet = env.open(urlDe(fichier, env), "_blank");
  return Boolean(onglet);
}
