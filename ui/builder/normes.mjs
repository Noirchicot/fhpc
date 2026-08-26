/* ══ LES NORMES DE LISTE, CÔTÉ JAVASCRIPT ════════════════════════════════
   Le pendant JS de `tokens.css`. `NORMES.md` est à côté, dans le même
   dossier : ce fichier ne décide RIEN, il porte en machine les nombres que
   ce document a ratifiés — comme `tokens.css` porte `--voile-simple`.

   ⭐ POURQUOI CE FICHIER EXISTE, MESURÉ LE 2026-08-26 : la règle des
   « 15 par page » d'Eric (23/08) est une règle du PRODUIT ENTIER — *« pour
   la liste des sorts niveau 1 on fera ça, pour les maîtrises idem »*. Or
   elle ne vivait que dans `equipment-step.mjs`, sous le nom
   `CASES_PAR_PAGE`, avec ZÉRO emploi ailleurs et ZÉRO garde. Sorts, Dons,
   Compétences et Outils ne la connaissaient pas : le premier de ces écrans
   à se construire pouvait écrire 12 ou 20 sans qu'aucune suite ne rougisse.

   ⚖️ ET C'EST UN DÉFAUT, PAS UNE DICTATURE (Eric, 2026-08-26 : *« c'est pas
   une dictature, on fait ça par défaut »*). Un écran qui dévie passe SON
   nombre, explicitement, et c'est LÉGAL. Ce que le garde
   (`tests/listes.test.mjs`) vérifie n'est donc pas que tout le monde
   emploie le défaut — c'est que le DÉFAUT vaut la bonne valeur, et que
   PERSONNE NE RECOPIE le nombre en littéral. Exactement la paire de
   `tests/decor.test.mjs` (« les trois voiles valent 35 / 50 / 100 % » ET
   « les dalles lisent leur voile, jamais un littéral »).

   ⛔ CE FICHIER NE PORTE PAS DE COTE EN PIXELS. Les pixels sont des jetons
   CSS et le restent (`tokens.css`) ; ici ne vivent que les nombres qu'un
   module JS doit compter — un compte d'objets, pas une dimension. */

/* ── LE NOMBRE D'ITEMS GLISSABLES PAR PAGE ────────────────────────────
   NORMES.md §5 « LES LISTES » : *« 15 jetons par page (défaut), en rangées
   de 3 »*, page non défilante, chevrons latéraux, collecteurs juste en
   dessous. Le budget vertical de ce 15 est calculé en §1 quater : 5 × 48
   + 4 × 8 = 272 px, et la page entière tient à 508 sur les 553 de Safari.

   ⭐ 15 EST UN DÉFAUT, ET IL SE PASSE EN ARGUMENT quand un écran a une
   raison de faire autrement. ⛔ Il ne se RECOPIE jamais. */
export const LISTE_PAR_PAGE = 15;

/**
 * UNE PAGE D'UNE LISTE — l'arithmétique seule, sans un nœud de DOM.
 *
 * ⭐ EXTRAITE EXPRÈS, ET C'EST LA LOI DU DÉPÔT (« on teste la fonction, pas
 * la page ») : tout ce qui touche à un TAMBOUR ou à un défilement a besoin
 * d'une mise en page pour exister et ne se teste qu'au doigt. La
 * PAGINATION, elle, est de l'arithmétique pure — mesurable sur le cas plein
 * comme sur le cas dégénéré, sans navigateur.
 *
 * ⛔ LE NOMBRE DE PAGES EST DÉRIVÉ, JAMAIS STOCKÉ : un compte écrit deux
 * fois est un compte qui finit par se contredire.
 *
 * 🔴 `pages = ceil(objets ÷ parPage)`, TOUJOURS, SANS PLAFOND. Le « 35 par
 * étagère » du rangement est une CIBLE DE DÉCOUPE, jamais un plafond de
 * données — Eric, 23/08 : *« un jour y'aura plus que 35 s'il y a un
 * homebrew ou de l'équipement en plus, c'est prévu »*. Un contenant à
 * 200 objets fait 14 pages et l'écran ne bronche pas. ⛔ Aucun garde ne doit
 * affirmer qu'une étagère fait au plus trois pages.
 *
 * ⭐ Et la page BOUCLE : au-delà de la dernière on revient à la première, en
 * deçà de la première on va à la dernière. Une flèche qui ne fait rien au
 * bout serait une cible tactile morte.
 *
 * @param {Array}  objets  tous les objets de la liste
 * @param {number} page    la page demandée, éventuellement hors bornes
 * @param {number} [parPage] le nombre d'items par page — LISTE_PAR_PAGE par
 *   défaut. ⚖️ UN ÉCRAN QUI DÉVIE LE DIT ICI, et c'est légal.
 * @returns {{page:number, pages:number, objets:Array}} la page RAMENÉE dans ses bornes
 */
export function pageDeListe(objets, page, parPage = LISTE_PAR_PAGE) {
  /* ⛔ PAS DE REPLI SILENCIEUX SUR LE DÉFAUT : une taille de page à 0 rendrait
     `pages = Infinity`, et remplacer la valeur en douce ferait dire au code
     autre chose que ce que l'appelant a écrit. Une absence n'est jamais une
     réponse — on nomme la faute là où elle est commise. */
  if (!Number.isInteger(parPage) || parPage < 1) {
    throw new TypeError(`pageDeListe: parPage doit être un entier ≥ 1, reçu ${String(parPage)}`);
  }
  const total = Array.isArray(objets) ? objets.length : 0;
  const pages = Math.max(1, Math.ceil(total / parPage));
  const brut = Number.isInteger(page) ? page : 0;
  const p = ((brut % pages) + pages) % pages;
  const debut = p * parPage;
  return { page: p, pages, objets: (objets || []).slice(debut, debut + parPage) };
}
