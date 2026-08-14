/* ══ LA VERSION DU GRAPHE — lot 75 ════════════════════════════════════════
   CE QUE CE FICHIER RÉPARE, MESURÉ : GitHub Pages sert CHAQUE fichier avec
   `cache-control: max-age=600` et un etag, en-têtes non modifiables (et la
   loi §0.9 interdit un serveur à nous). Le compteur de 10 minutes part PAR
   FICHIER, à sa propre date de chargement : après un déploiement, une page
   pouvait tenir un `shell.mjs` neuf et un `abilities-step.mjs` d'avant —
   cohérents en apparence, faux en réalité. Vécu deux fois : Eric a vu
   « 1 à 20 » à l'écran quand le fichier livré disait « 3 à 18 ».

   LE REMÈDE (garde : `tests/versions-graphe.test.mjs`) : chaque import
   relatif de `ui/` porte `?v=<N>`, et tous portent LE MÊME <N> — comme
   `index.html` et les `url()` des feuilles de style. Un shell ancien en
   cache importe des modules anciens ; un shell frais importe des modules
   frais. AUCUN hybride possible : seul `index.html`, fichier unique qui ne
   peut pas être « à moitié » à jour, décide du graphe entier.

   CE MODULE : les chargements d'EXÉCUTION — les couches, l'exemple, le
   schéma, la coquille de fiche, les arcanes — ne passent pas par `import`,
   le cache les mélangerait donc encore. Ils lisent la version dans
   `import.meta.url` du module appelant, qui porte déjà son `?v=<N>`.

   ⛔ PAS DE CONSTANTE `VERSION` ICI, NI AILLEURS. Une constante recopiée
   serait une deuxième source de vérité, libre de diverger de l'URL réelle —
   exactement la famille de défaut qu'on répare. La source de vérité est
   l'URL du module, point.

   📌 LE GESTE DE PUBLICATION : incrémenter <N> PARTOUT, d'un coup —
   `node bin/nouvelle-version.mjs` le fait, et `npm test` vérifie qu'aucune
   ligne n'a été oubliée. Publier sans incrémenter = les visiteurs des
   10 prochaines minutes gardent l'ancien graphe ENTIER (cohérent, jamais
   mélangé) — acceptable ; oublier UNE ligne = le mélange revient — le
   garde rougit avant. */

/** Le suffixe `?v=<N>` lu dans l'URL d'un module — `""` quand l'URL n'en
 *  porte pas. C'est le cas de Node et des tests, qui importent sans query :
 *  un chemin local n'a pas de cache HTTP à percer, et les URL rendues
 *  restent alors celles d'avant ce lot. */
export function versionQuery(moduleUrl) {
  const v = new URL(moduleUrl).searchParams.get("v");
  return v === null ? "" : `?v=${v}`;
}
