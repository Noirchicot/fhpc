/* ══ LE PANNEAU DE LORE — lot 82 ═════════════════════════════════════════
   📐 Croquis A d'Eric (2026-08-15), annoté en toutes lettres sous le bouton :
   *« lore sends to full page description either FH or SRD »*, et la page
   dessinée porte en tête *« return to character creation »*.

   ⭐ CE QUE CE FICHIER RÉPARE, ET IL ATTENDAIT DEPUIS LE LOT 77 : `LORE`
   était `disabled`. `catalogue.mjs` écrivait déjà pourquoi — *« il demande le
   panneau plein écran, un organe partagé par trois écrans qui a son propre
   lot. Il reste `disabled` : un bouton qui ne répond pas est pire qu'un
   bouton qui s'annonce éteint. »* Voici le lot.

   ── CE QU'IL SAIT FAIRE, ET RIEN D'AUTRE ────────────────────────────────
   Il rend un nœud : un titre, la prose, un retour. Il ne connaît ni la
   coquille ni les verbes du moteur (contrat d'écran, SOCLE.md) — on lui
   passe un `query` et un `onAction`, il rend et il signale.

   ⛔ IL N'EST PAS UN POPUP. `popup.mjs` implémente l'invariant III.4 — *« un
   popup se ferme en CLIQUANT DEHORS »* — et son en-tête prévient lui-même de
   ne pas le confondre avec la fermeture d'une dalle majeure. Le lore n'est ni
   l'un ni l'autre : c'est une PAGE, elle occupe la scène, et on en revient
   par un geste nommé. Un texte de deux cents mots qui disparaît parce que le
   pouce a effleuré le bord serait insupportable à lire.

   ⭐ ET IL SERT LES DEUX ÉCRANS À FICHE. Les douze classes portent leur lore
   dans la même couche que les douze espèces (`fh-lore-en`, 24 records) ; le
   bouton est dessiné une fois par `renderFicheActions`, pour les deux. Écrire
   ce panneau côté Species seul le ferait recopier côté Class le jour d'après
   — la loi du dépôt, et elle a déjà coûté. */

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** Le texte de lore d'un record, ou `null`.
 *
 *  ⛔ AUCUN REPLI INVENTÉ. Si la couche `fh-lore-en` n'est pas montée — un
 *  personnage SRD pur, exactement le cas que la loi §0.12 protège — il n'y a
 *  pas de lore, et le panneau doit le DIRE au lieu d'afficher une page vide
 *  ou un texte fabriqué. C'est la même règle que la fiche : « jamais un tiret
 *  inventé pour remplir ». */
export function loreDe(query, kind, id) {
  const view = query({ kind, id });
  const lore = view && view.record && view.record.data && view.record.data.lore;
  return lore && typeof lore.text === "string" && lore.text.length > 0 ? lore : null;
}


/* ══ LE BALISAGE INLINE — `*italique*` et `**gras**` ════════════════════════
   Le générateur du vault CONSERVE délibérément le balisage des cellules et des
   paragraphes (`*Faerie Fire*`, `**Drow**`) : il porte le sens — un sort est en
   italique, un terme de règle en gras — et le nettoyer à la source l'aurait
   perdu pour tout le monde. Le rendre est donc le travail de cet écran.

   ⛔ ET PAS PAR `innerHTML`. Deux gardes du dépôt le refusent (`build-block`,
   `doc-block`), et ils ont raison : ce texte vient d'un chapitre que n'importe
   qui peut éditer. On compose des NŒUDS, un par fragment.

   ⚠️ L'ORDRE DES DEUX MOTIFS COMPTE : `**gras**` d'abord, sinon `*…*` mange la
   première étoile de chaque paire et rend « *gras* » en italique vide. */
function inline(source) {
  const nœuds = [];
  const motif = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let curseur = 0;
  let trouve;
  while ((trouve = motif.exec(source)) !== null) {
    if (trouve.index > curseur) nœuds.push(text(source.slice(curseur, trouve.index)));
    nœuds.push(trouve[1] !== undefined
      ? el("strong", null, [text(trouve[1])])
      : el("em", null, [text(trouve[2])]));
    curseur = motif.lastIndex;
  }
  if (curseur < source.length) nœuds.push(text(source.slice(curseur)));
  return nœuds;
}

/** Une section du chapitre : un titre, puis SOIT de la prose, SOIT une table.
 *  Jamais les deux — c'est le contrat de `data.lore.sections`. */
function renderSection(section) {
  const bloc = el("section", "lore-section");
  if (section.heading) bloc.append(el("h3", "lore-section-titre", [text(section.heading)]));

  if (section.table && Array.isArray(section.table.rows)) {
    /* ⚠️ UNE VRAIE TABLE, pas une grille en `div`. Dix ancêtres draconiques
       avec leur dégât sont des DONNÉES tabulaires : un lecteur d'écran doit
       pouvoir annoncer « Black, Damage, Acid ». */
    const table = el("table", "lore-table");
    const colonnes = Array.isArray(section.table.columns) ? section.table.columns : [];
    if (colonnes.length > 0) {
      const ligne = el("tr", null, colonnes.map((c) => el("th", null, inline(String(c)))));
      table.append(el("thead", null, [ligne]));
    }
    const corps = el("tbody");
    for (const rangee of section.table.rows) {
      const cellules = (Array.isArray(rangee) ? rangee : [rangee])
        .map((cell) => el("td", null, inline(String(cell == null ? "" : cell))));
      corps.append(el("tr", null, cellules));
    }
    table.append(corps);
    /* La table défile DANS SA BOÎTE : le corps de la page ne défile jamais
       latéralement (même loi que partout dans ce dépôt). */
    bloc.append(el("div", "lore-table-boite", [table]));
    return bloc;
  }

  /* ⚠️ UNE PUCE RESTE UNE PUCE. Le générateur du vault sépare chaque puce par
     une ligne blanche ET lui garde son « - » — délibérément, pour que l'écran
     puisse en faire de VRAIES listes plutôt que des paragraphes commençant par
     un tiret. Sans ce regroupement, les cinq traits du Dragonborn s'affichaient
     « - Darkvision — 60 feet. » en toutes lettres. */
  let liste = null;
  for (const para of String(section.text || "").split(/\n{2,}/)) {
    const ligne = para.trim();
    if (ligne.length === 0) continue;
    const puce = /^[-*•]\s+/.exec(ligne);
    if (puce) {
      if (!liste) { liste = el("ul", "lore-liste"); bloc.append(liste); }
      liste.append(el("li", null, inline(ligne.slice(puce[0].length))));
      continue;
    }
    liste = null; // une phrase pleine ferme la liste en cours
    bloc.append(el("p", null, inline(ligne)));
  }
  return bloc;
}

/** LE PANNEAU. `onAction` reçoit `{ kind: "lore", ref: null }` au retour —
 *  c'est la coquille qui possède l'état, jamais ce module (SOCLE.md : « l'état
 *  d'un panneau vit dans `state`, jamais dans le DOM »). */
export function renderLorePanel({ query, kind, id, onAction }) {
  const act = typeof onAction === "function" ? onAction : () => {};
  const view = query({ kind, id });
  const nom = view && view.record ? view.record.name : id;
  const lore = loreDe(query, kind, id);

  const page = el("section", "lore-page");
  page.dataset.lore = kind;

  /* ⭐ LE RETOUR EST EN TÊTE, PAS EN PIED, et c'est le croquis qui le place :
     *« return to character creation »* est écrit tout en haut de la page
     dessinée. La raison tient à la lecture — au bas d'un texte de deux cents
     mots, le retour serait à trouver après avoir tout fait défiler ; en tête,
     il est là au moment où on décide d'arrêter de lire. */
  const retour = el("button", "lore-retour", [text("← Back to character creation")]);
  retour.type = "button";
  retour.addEventListener("click", () => act({ kind: "lore", ref: null }));
  page.append(retour);

  page.append(el("h2", "lore-titre", [text(nom)]));

  if (!lore) {
    /* La phrase nomme la COUCHE, pas un incident : c'est une pile SRD pure,
       un état légitime du produit, pas une panne. */
    page.append(el("p", "lore-vide", [text(
      "No Fate's Hand lore is mounted for this entry — the fh-lore-en layer is not in this character's stack."
    )]));
    return page;
  }

  /* ⛔ LE TEXTE EST DÉCOUPÉ EN PARAGRAPHES, PAS RENDU D'UN BLOC. La couche
     porte des sauts de ligne doubles ; les écraser rendrait deux cents mots
     en un seul pavé. Et le découpage se fait sur la DONNÉE, jamais par du
     HTML injecté — aucun `innerHTML` ne traverse ce dépôt. */
  const corps = el("div", "lore-corps");
  for (const para of lore.text.split(/\n{2,}/)) {
    const t = para.trim();
    if (t.length > 0) corps.append(el("p", null, inline(t)));
  }
  page.append(corps);

  /* ⭐ LE CHAPITRE ENTIER, ET PAS SEULEMENT SON BLURB. `data.lore.sections`
     porte le chapitre du vault de haut en bas depuis le 2026-08-19 — les
     Traits, le Breath Weapon, les dix ancêtres draconiques. La donnée était
     descendue ; personne ne la rendait, et le bouton `Lore` continuait
     d'afficher deux cents mots là où la page publiée en porte deux mille.

     ⚠️ Les DOUZE ESPÈCES en ont, les DOUZE CLASSES non — leur chapitre
     n'existe pas encore dans le vault (`docs/chapters/classes.md` fait
     quatorze lignes). Ce panneau sert les deux : le jour où ces chapitres
     seront écrits, ils s'afficheront sans une ligne de plus ici. */
  if (Array.isArray(lore.sections)) {
    for (const section of lore.sections) {
      if (section) page.append(renderSection(section));
    }
  }

  return page;
}
