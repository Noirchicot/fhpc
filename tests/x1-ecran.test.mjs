/* ══ LE GARDE DE X1 — LA FICHE D'UN OBJET POSSÉDÉ — lot 213, 2026-09-17 ══════

   🔴 CE QU'IL DÉFEND : que la disposition posée au dépôt soit BIEN la table
   générée (`Plan-ecran-X1/X1_cotes.json` → `X1_declaration.js`), que cette
   table tienne les lois du plan — la dalle, la marge, le plancher des cibles,
   aucun chevauchement, le budget vertical fermé à 500 —, et que l'écran rende
   ce que la table déclare, sans qu'un nombre soit retapé nulle part.

   ⚖️ ET IL DÉFEND LA LOI DU RANG X, qui ne vit dans aucun autre garde : *« les
   x ne s'inscrivent pas dans le belt »* (Eric, 16/09). Une fiche d'objet
   n'écrit JAMAIS la 3ᵉ ligne — ce qui, en code, veut dire une chose précise et
   vérifiable : `x1` n'est pas une clef de `FENETRE_DE`.

   ⛔ SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS : il lit des tables, des
   sources et le DOM du stub. Il ne mesure AUCUN rendu — le rendu se regarde au
   navigateur (`ui/builder/banc-x1.html`, fait pour ça), et c'est là qu'ont été
   trouvés les deux défauts que ce garde n'aurait jamais vus : l'encre du site
   illisible sur le parchemin, et la déchirure qui mangeait le premier caractère
   de la description. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const D = await import("../ui/builder/x1-disposition.mjs");
const { construireLaFicheX1, feuilleDesCotesX1, CLEF_DE, PLAFOND_HARMONISATION } = await import("../ui/builder/x1-ecran.mjs");
const { construireLEcranGear } = await import("../ui/builder/gear-ecran.mjs");
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "x1-cotes.json"), "utf8"));
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
const etape = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));
const coquille = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
const source = stripComments(fs.readFileSync(path.join(UI, "x1-ecran.mjs"), "utf8"));

const { DALLE, MARGE, TOUCH, ORGANES } = D;
const rect = (o) => ({ x: o.x, y: o.y, l: o.l, h: o.h });
const cibleDe = (o) => (o.cible ? { x: o.cible.x, y: o.cible.y, l: o.cible.l, h: o.cible.h } : rect(o));
const secants = (a, b) => a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;

/* ══ 1 — LA DÉCLARATION EST LA TABLE, PAS UNE COPIE QUI DÉRIVE ═══════════ */

test("1 — la déclaration posée au dépôt EST la table du plan (mêmes organes, mêmes cotes)", () => {
  const parNom = Object.fromEntries(TABLE.boites.map((b) => [b.nom, b]));
  assert.equal(ORGANES.length, TABLE.boites.length, "même compte d'organes que la table");
  for (const o of ORGANES) {
    const t = parNom[o.nom];
    assert.ok(t, `« ${o.nom} » est dans la déclaration mais pas dans la table`);
    for (const k of ["x", "y", "l", "h", "sorte"]) assert.equal(o[k], t[k], `${o.nom}.${k}`);
  }
  assert.deepEqual([DALLE.l, DALLE.h, MARGE, TOUCH],
    [TABLE.dalle.l, TABLE.dalle.h, TABLE.marge, TABLE.touch]);
  /* ⭐ LE DÉBORD DU PARCHEMIN EST UNE COTE COMME LES AUTRES : il vient de la
     mesure faite sur l'image, pas d'un nombre choisi dans une feuille. */
  assert.equal(D.PARCHEMIN_DEBORD, TABLE.parchemin_debord);
});

/* ══ 2 — LES LOIS DU PLAN, RECALCULÉES ICI ═══════════════════════════════ */

test("2 — rien hors de la dalle, rien à moins de 4 d'un bord", () => {
  const fautes = [];
  for (const o of ORGANES) {
    const b = cibleDe(o);
    if (b.x < MARGE || b.y < MARGE || b.x + b.l > DALLE.l - MARGE || b.y + b.h > DALLE.h - MARGE) {
      fautes.push(`${o.nom} sort de la dalle utile`);
    }
  }
  assert.deepEqual(fautes, []);
});

test("3 — toute cible atteint 44 dans les DEUX sens, et le dessin peut être plus petit", () => {
  const fautes = [];
  for (const o of ORGANES) {
    if (!o.cible) continue;
    if (o.cible.l < TOUCH || o.cible.h < TOUCH) fautes.push(`${o.nom} : cible ${o.cible.l}×${o.cible.h}`);
    /* ⭐ ET LE DESSIN TIENT DANS SA CIBLE : une cible plus PETITE que son dessin
       ne serait pas une cible, ce serait une amputation. */
    if (o.l > o.cible.l || o.h > o.cible.h) fautes.push(`${o.nom} : dessin plus grand que sa cible`);
  }
  assert.deepEqual(fautes, []);
});

test("4 — aucun chevauchement de dessins, aucun chevauchement de cibles", () => {
  const dessins = [];
  const cibles = [];
  for (let i = 0; i < ORGANES.length; i += 1) {
    for (let j = i + 1; j < ORGANES.length; j += 1) {
      const a = ORGANES[i];
      const b = ORGANES[j];
      /* ⚖️ UNE INCLUSION DÉCLARÉE N'EST PAS UN CHEVAUCHEMENT : la jauge CONTIENT l'œil
         (`dans`), parce qu'Eric a demandé que ses deux chevrons l'encadrent. ⛔ Et elle
         se vérifie : le contenu tient entièrement dans son hôte, sinon c'est bien un
         croisement. C'est la règle que le plan de l'écran R porte déjà pour le montant
         de la bourse. */
      const hote = a.dans === b.nom ? b : b.dans === a.nom ? a : null;
      if (hote) {
        const d = hote === a ? b : a;
        assert.ok(hote.x <= d.x && hote.y <= d.y
          && d.x + d.l <= hote.x + hote.l && d.y + d.h <= hote.y + hote.h,
          `${d.nom} se déclare DANS ${hote.nom} mais en sort`);
      } else if (secants(rect(a), rect(b))) dessins.push(`${a.nom} × ${b.nom}`);
      /* 🔴 DEUX CIBLES NE SE CROISENT PAS — mais une CIBLE a le droit de couvrir une
         ZONE qu'on ne tape pas. Eric, 17/09 au soir : *« le copy text va passer dans la
         marge à gauche »* ; sa cible de 44 ne tient pas dans une marge de 39, elle se
         cale donc contre le bord de page et déborde sur la colonne du texte. ⭐ Ça ne
         coûte rien — un texte ne se tape pas — et le garde le DIT au lieu de l'interdire
         en bloc : il ne compare que ce qui a une cible. */
      if (a.cible && b.cible && secants(cibleDe(a), cibleDe(b))) cibles.push(`${a.nom} × ${b.nom}`);
    }
  }
  assert.deepEqual(dessins, [], "deux dessins qui se croisent sont un plan faux");
  assert.deepEqual(cibles, [], "deux cibles qui se croisent sont un doigt qui se trompe");
});

test("5 — le budget vertical est fermé : la description prend ce qui reste, et rien ne déborde", () => {
  const desc = ORGANES.find((o) => o.nom === "DESCRIPTION");
  const pied = ORGANES.filter((o) => o.y > desc.y + desc.h).map((o) => cibleDe(o));
  /* ⚖️ LE PIED A SA PROPRE MARGE — Eric, 17/09 au soir : *« remonte tout ce qui est
     sous le trait de séparation inférieur du texte de 20 blg »*. La déchirure du bas
     du parchemin mordait dans la rangée des portes. 🔴 RÉÉCRIT À CETTE VÉRITÉ : la
     version d'avant attendait la marge de PAGE, et c'est justement ce qui a changé.
     ⛔ Et le garde lit la valeur dans la TABLE, il ne la recopie pas. */
  assert.equal(TABLE.marge_pied, MARGE + 30, "le pied s'écarte du bas de 30 de plus que la page");
  assert.equal(D.MARGE_PIED, TABLE.marge_pied, "la déclaration porte la même marge que la table");
  assert.equal(Math.max(...pied.map((b) => b.y + b.h)), DALLE.h - TABLE.marge_pied,
    "la dernière rangée finit à 24 du bas, pile");
  /* ⚖️ LA TÊTE A SA MARGE, comme le pied — Eric, 17/09 au soir : *« descendre tout ce
     qui est au-dessus du trait supérieur de 10 blg »*. La déchirure du parchemin mord
     en haut comme en bas. 🔴 Réécrit à cette vérité : la version d'avant attendait la
     marge de page. */
  assert.equal(TABLE.marge_tete, MARGE + 10, "la tête descend de 10 de plus que la page");
  assert.equal(D.MARGE_TETE, TABLE.marge_tete, "la déclaration porte la même marge que la table");
  /* ⭐ ET LA LIGNE DU NOM GLISSE DE 4 DANS SON CRÉNEAU — Eric : *« descend juste la
     ligne du haut de 4 blg »*, *« descends pas le reste »*. Elle mange la gouttière qui
     la séparait des chiffres ; rien d'autre ne bouge, et la somme reste la même. */
  const nom = ORGANES.find((o) => o.nom === "NOM");
  const chiffres = ORGANES.find((o) => o.nom === "PRIX");
  /* 🔴 RÉÉCRIT LE 17/09 AU SOIR, QUAND LES FLÈCHES SONT PARTIES : elles occupaient la
     rangée entière (22 dans une cible de 44) et donnaient donc son sommet. Ce qui reste
     se DESSINE à 40 dans les 44, donc deux plus bas. ⭐ Le garde tient l'invariant, pas
     le nombre : la rangée du nom est posée là où la table la met, et rien ne monte
     au-dessus d'elle. */
  assert.equal(TABLE.y.nom, TABLE.marge_tete + 4, "la rangée du nom : la marge de tête plus son glissement");
  assert.ok(Math.min(...ORGANES.map((o) => cibleDe(o).y)) >= TABLE.y.nom, "et rien ne monte au-dessus d'elle");
  assert.equal(chiffres.y, TABLE.marge_tete + TOUCH + 4,
    "⛔ et la ligne des chiffres, elle, est restée comptée depuis la marge de tête");
  assert.ok(nom.y > TABLE.marge_tete, "le nom est bien descendu dans son créneau");
  /* ⭐ LA ZONE DU TEXTE EST UN GROUPE DE TROIS : un filet, la description, un filet
     — Eric, 17/09 au soir. Les filets sont COLLÉS à la description (ils la délimitent,
     ils ne la voisinent pas) ; la gouttière de 8 est au-dessus et au-dessous du GROUPE.
     🔴 RÉÉCRIT À LA NOUVELLE VÉRITÉ, pas relâché : la version d'avant mesurait 8 contre
     la description elle-même, et elle a rougi le jour où les filets sont arrivés. */
  const haut = ORGANES.find((o) => o.nom === "FILET HAUT");
  const bas = ORGANES.find((o) => o.nom === "FILET BAS");
  assert.equal(haut.y + haut.h, desc.y, "le filet du haut touche la description");
  assert.equal(desc.y + desc.h, bas.y, "et celui du bas aussi");
  /* 🔴 RÉÉCRIT LE 17/09 AU SOIR — Eric : *« réduis de 30 % la largeur du trait de
     délimitation du texte »*. Les filets ne bornent plus la colonne, ils la PONCTUENT :
     70 % de sa largeur, centrés sur la dalle. ⛔ Le garde ne se relâche pas — il tient
     maintenant la proportion ET le centrage, qui sont ce qu'Eric a demandé. */
  assert.deepEqual([haut.x, haut.l], [bas.x, bas.l], "les deux filets sont le même trait");
  /* ⚠️ À UN BLG PRÈS, ET C'EST VOULU : le générateur arrondit en Python, ce garde
     recompterait en JavaScript — et les deux ne tranchent pas un demi de la même façon
     (`round(220.5)` rend 220 là-bas, 221 ici). Le garde tient la RÈGLE (70 %), pas
     l'arrondi, qui appartient à celui qui génère. */
  assert.ok(Math.abs(haut.l - desc.l * 0.7 * 1.1) <= 1,
    "77 % de la colonne du texte, à un blg près — 0,7 réduit puis 1,1 élargi (Eric, 17/09 au soir)");
  assert.equal(haut.x, (DALLE.l - haut.l) / 2, "et centré sur la dalle");
  /* ⛔ LA COPIE ET LA JAUGE SORTENT DU COMPTE : elles vivent DANS la bande du texte, à
     ses côtés, et pas au-dessus ni au-dessous. Les compter ferait dire au garde que la
     gouttière vaut zéro alors qu'elle n'a pas bougé. */
  const bande = new Set(["COPIER", "JAUGE"]);
  const voisins = ORGANES.filter((o) => !bande.has(o.nom));
  const avant = Math.max(...voisins.filter((o) => o.y + o.h <= haut.y).map((o) => cibleDe(o).y + cibleDe(o).h));
  const apres = Math.min(...voisins.filter((o) => o.y >= bas.y + bas.h).map((o) => cibleDe(o).y));
  assert.equal(haut.y - avant, 8, "8 au-dessus du groupe");
  /* 🔴 RÉÉCRIT LE 17/09 AU SOIR — Eric : *« descends la marge du bas de 8 blg »*, puis
     *« pas ce qui est en dessous »*. La zone du texte s'allonge donc par le BAS : le
     filet vient toucher la rangée des états, et la gouttière qui les séparait passe à
     zéro. ⛔ Le garde ne se relâche pas, il tient l'autre fait : rien ne se CHEVAUCHE
     (le test 4 le prouve), et la rangée du dessous n'a pas bougé d'un blg. */
  assert.equal(apres - (bas.y + bas.h), 0, "le filet du bas touche la rangée des états");
  assert.equal(apres, ORGANES.find((o) => o.nom === "EQUIP ON").cible.y,
    "et c'est bien la rangée des états qui commence là, sans avoir bougé");
  /* ⚖️ ET LA MARGE DU TEXTE EST CELLE D'ERIC, prise dans la TABLE et jamais recopiée
     ici — elle a bougé deux fois dans la même soirée (20, puis 30 : *« moins de place
     pour le texte, plus pour la marge ! »*). 🔴 La version d'avant écrivait le nombre,
     et c'est exactement ce qui fait rougir un garde pour une raison qui n'est pas la
     sienne. Ce qu'il tient est l'INVARIANT : le texte s'écarte des deux bords, autant
     à gauche qu'à droite, et plus que la page. */
  assert.equal(desc.x, TABLE.marge_texte, "le texte s'écarte de la marge que la table porte");
  assert.equal(DALLE.l - (desc.x + desc.l), TABLE.marge_texte, "autant à droite qu'à gauche");
  assert.ok(TABLE.marge_texte > TABLE.marge_cote, "et plus que les organes, qui s'écartent déjà de la page");
  assert.equal(D.MARGE_TEXTE, TABLE.marge_texte, "la déclaration porte la même colonne que la table");
});

/* ══ 6 — LA FEUILLE CONSTRUITE POSE TOUT, ET shell.css NE POSE RIEN ══════ */

test("6 — la feuille construite pose chaque organe, à la cote de la table", () => {
  const css = feuilleDesCotesX1();
  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    assert.ok(id, `${o.nom} n'a pas de clef de dépôt`);
    const m = new RegExp(`\\.x1 \\[data-organe="${id}"\\]\\{([^}]*)\\}`).exec(css);
    assert.ok(m, `${o.nom} n'est pas posé par la feuille`);
    const b = cibleDe(o);
    assert.ok(m[1].includes(`left:${b.x}px`) && m[1].includes(`top:${b.y}px`),
      `${o.nom} : la feuille ne pose pas la boîte de la table`);
    if (o.cible) {
      assert.ok(m[1].includes(`border-width:${(o.cible.h - o.h) / 2}px ${(o.cible.l - o.l) / 2}px`),
        `${o.nom} : les bords transparents portent l'écart cible − dessin`);
    }
  }
  /* ⛔ ET LE SÉLECTEUR EST DESCENDANT, jamais un enfant direct : une cote enfermée
     dans une structure meurt à la première fois qu'un organe entre dans un groupe. */
  assert.doesNotMatch(css, /\.x1 > \[data-organe/, "un `>` enfermerait la cote dans la structure du jour");
});

test("7 — shell.css ne porte AUCUNE position de la fiche : les cotes sont dans la table", () => {
  const debut = shell.indexOf(".x1 { background:");
  assert.ok(debut > 0, "le bloc d'habit de la fiche existe");
  const bloc = shell.slice(debut);
  assert.ok(!/\b(left|top)\s*:\s*\d*\.?\d+px/.test(bloc), "une position en dur serait une cote recopiée");
  /* la fiche partage la boîte de la dalle avec l'écran R — une seule règle le dit */
  assert.match(shell, /\.gear,\s*\.x1\s*\{/, "la dalle est déclarée UNE fois pour les deux écrans");
});

/* ══ 8 — LA LOI DU RANG X ════════════════════════════════════════════════ */

test("8 — ⛔ la fiche n'écrit JAMAIS la 3ᵉ ligne du belt (« les x ne s'inscrivent pas dans le belt »)", () => {
  const m = /const FENETRE_DE = \{([^}]*)\}/.exec(etape);
  assert.ok(m, "la table des mots du belt existe");
  assert.ok(!/\bx1\s*:/.test(m[1]), "`x1` ne doit PAS être une clef de FENETRE_DE — c'est là, et seulement là, que la loi se tient");
  /* ⚔️ ET LA MOITIÉ QUI PROUVE QUE LE GARDE N'EST PAS CREUX : la table existe
     vraiment et porte bien les branches, sinon l'absence de `x1` ne dirait rien. */
  assert.match(m[1], /gear:\s*"Gear"/, "la table porte bien les branches qui, elles, écrivent");
});

test("9 — ⛔ le mot `Back` reste celui de la coquille : la fiche dit `Close`", () => {
  /* La loi I.5 et le garde 17 de `shell-wiring` : un écran qui écrit « Back »
     ouvre un second chemin de retour. Le mot ratifié pour une fenêtre qui FERME
     est `Close` (Eric, 07/09). ⏳ Le croquis de X1 dit « back » : la question est
     posée à Eric dans le rapport du lot. */
  assert.doesNotMatch(source, /"Back"/, "`Back` appartient à la coquille, jamais à un écran");
  assert.match(source, /"Close"/, "et la porte qui ferme porte le mot qui dit ce qu'elle fait");
});

/* ══ 10 — CE QUE L'ÉCRAN REND ════════════════════════════════════════════ */

const objetTemoin = {
  index: 3, nom: "Winged Helmet", qte: 2,
  prixUnite: "15 gp", prixTotal: "30 gp", poidsUnite: "3 lb", poidsTotal: "6 lb",
  prose: "A winged helmet.", equipped: true, attuned: false, locked: false
};
const rendu = (options = {}) => construireLaFicheX1({
  objet: objetTemoin, rang: { position: 2, total: 5 }, nombre: 1, destination: "backpack", ...options
}).noeud;
const tous = (n, sel) => [...n.querySelectorAll(sel)];

test("9 bis — la quantité se cale à gauche du titre, et ne s'écrit que si elle dit quelque chose", () => {
  const deux = rendu();
  assert.equal(deux.querySelector('[data-organe="qte"]').textContent, "×2");
  const seul = construireLaFicheX1({ objet: { ...objetTemoin, qte: 1 }, rang: { position: 1, total: 1 } }).noeud;
  assert.equal(seul.querySelector('[data-organe="qte"]').textContent, "", "« ×1 » est du bruit");
});

test("9 ter — les deux filets encadrent le texte, et ils ne parlent pas aux lecteurs d'écran", () => {
  const n = rendu();
  for (const id of ["filet-haut", "filet-bas"]) {
    const f = n.querySelector(`[data-organe="${id}"]`);
    assert.ok(f, `${id} est posé`);
    assert.equal(f.getAttribute("aria-hidden"), "true", "c'est la ZONE qui porte le sens, pas son trait");
  }
});

test("10 — la fiche rend chaque organe de la table, une fois", () => {
  const n = rendu();
  const ids = tous(n, "[data-organe]").map((e) => e.dataset.organe).sort();
  const attendus = ORGANES.map((o) => CLEF_DE[o.nom]).sort();
  assert.deepEqual(ids, attendus);
});

test("11 — les trois interrupteurs disent leur état sur trois canaux, et écrivent la bonne clef", () => {
  const ecrits = [];
  const n = rendu({ objet: { ...objetTemoin, attuned: true }, surEtat: (clef, valeur) => ecrits.push([clef, valeur]) });
  const bascules = tous(n, ".x1-bascule");
  assert.equal(bascules.length, 3, "equip · attune · lock");
  for (const b of bascules) {
    assert.equal(b.getAttribute("role"), "switch", "un interrupteur est un état vrai ou faux, pas un bouton qu'on enfonce");
    assert.ok(b.getAttribute("aria-checked") === "true" || b.getAttribute("aria-checked") === "false");
    assert.equal(b.dataset.on, b.getAttribute("aria-checked"), "la donnée et le rôle disent la MÊME chose");
  }
  /* ⭐ L'ÉTAT ALLUMÉ SE LIT SUR LE BON ORGANE : `attuned` est vrai, `locked` non. */
  const etatDe = Object.fromEntries(bascules.map((b) => [b.dataset.organe, b.dataset.on]));
  assert.deepEqual(etatDe, { "equip-on": "true", "attune-on": "true", "lock-on": "false" });
  /* et taper INVERSE, en nommant la clef du document */
  for (const b of bascules) b.dispatchEvent({ type: "click" });
  assert.deepEqual(ecrits, [["equipped", false], ["attuned", false], ["locked", true]]);
});

test("11 bis — 🔒 VERROUILLÉ : la fiche désarme ce qui DÉPLACE, et rien d'autre (Eric, 18/09)", () => {
  /* ⚖️ *« lock : l'item reste collé à son collecteur, ne bouge pas, ne peut être
     vendu, ni détruit tant qu'il est locked »*.
     ⭐ CE QUE CE GARDE SÉPARE, ET C'EST TOUT LE SUJET : porter ou dévêtir DÉPLACE
     (l'état suit le lieu), donc le verrou l'interdit ; harmoniser ne déplace rien,
     donc il reste libre ; et le verrou lui-même reste libre, ⛔ sinon c'est une
     porte murée et l'objet ne se rouvre jamais. */
  const ecrits = [];
  const n = rendu({ objet: { ...objetTemoin, locked: true }, surEtat: (clef, v) => ecrits.push([clef, v]),
    surPorte: (id) => ecrits.push(["porte", id]) });
  const parOrgane = Object.fromEntries(tous(n, "[data-organe]").map((e) => [e.dataset.organe, e]));

  assert.equal(parOrgane["equip-on"].disabled, true, "porter DÉPLACE : le verrou l'éteint");
  assert.match(parOrgane["equip-on"].title || "", /Locked/,
    "⛔ et il DIT pourquoi : un contrôle éteint sans raison se lit comme une panne");
  assert.notEqual(parOrgane["attune-on"].disabled, true, "harmoniser ne déplace rien");
  assert.notEqual(parOrgane["lock-on"].disabled, true, "⛔ le verrou s'ouvre, sinon il n'est pas un verrou");
  assert.equal(parOrgane["envoyer"].disabled, true, "« ne peut être vendu »");
  assert.equal(parOrgane["trash"].disabled, true, "« ni détruit »");

  /* ⭐ ET LES ORGANES ÉTEINTS SONT MUETS : taper n'écrit rien. C'est ce que le
     garde vérifie vraiment — `disabled` est un dessin, l'absence d'écriture est
     le fait. */
  parOrgane["equip-on"].dispatchEvent({ type: "click" });
  parOrgane["attune-on"].dispatchEvent({ type: "click" });
  assert.deepEqual(ecrits, [["attuned", true]],
    "seule l'harmonisation a parlé — ni le port, ni les deux portes");
});

test("12 — le mot d'état vit DANS le petit carré, et seulement quand il est vrai", () => {
  const n = rendu({ objet: { ...objetTemoin, equipped: true, attuned: false, locked: false } });
  const carres = tous(n, ".x1-etat");
  assert.equal(carres.length, 3);
  const mots = carres.map((c) => {
    const m = c.querySelector(".x1-etat-mot");
    return [c.dataset.organe, m.textContent, m.hidden === true];
  });
  assert.deepEqual(mots, [["equip", "Equipped", false], ["attune", "Attuned", true], ["lock", "Locked", true]],
    "le mot est TOUJOURS posé — c'est sa visibilité qui dit l'état, pour que le titre ne saute pas");
  /* ⛔ et il est dans le carré du titre, pas dans une bande sous la rangée */
  for (const c of carres) {
    assert.ok(c.querySelector(".x1-etat-titre"), "le titre est là");
    assert.ok(c.querySelector(".x1-etat-mot"), "et le mot est son voisin dans la MÊME boîte");
  }
});

test("13 — les quatre portes publient leur geste ; `Use` et le menu `is` sont désarmés et le disent", () => {
  const gestes = [];
  const n = rendu({ surPorte: (id) => gestes.push(id) });
  const portes = tous(n, ".x1-porte").map((b) => [b.dataset.porte, b.textContent, b.disabled === true]);
  assert.deepEqual(portes, [
    ["close", "Close", false], ["use", "Use", true], ["envoyer", "Send", false], ["trash", "Trash", false]
  ]);
  for (const b of tous(n, ".x1-porte")) { if (!b.disabled) b.dispatchEvent({ type: "click" }); }
  assert.deepEqual(gestes, ["close", "envoyer", "trash"]);
  /* 🔴 RÉÉCRIT LE 17/09 AU SOIR : `is` n'a plus de menu. Eric — *« le dropdown `is`
     pas visible, pas de dropdown, juste du texte ? »* — a vu qu'un menu désarmé
     portait le voile des 20 % et disparaissait. Un menu qu'on ne peut pas ouvrir est
     une valeur : elle s'écrit. ⛔ Le garde ne se relâche pas, il change d'objet. */
  /* 🔴 RÉÉCRIT DEUX FOIS DANS LA MÊME SOIRÉE, ET C'EST LA SECONDE QUI TIENT : Eric a
     d'abord demandé un mot (*« pas de dropdown, juste du texte ? »*, une question posée
     devant un menu qui avait disparu sous le voile des 20 %), puis tranché — *« is est
     un dropdown »*. Le garde exige donc un menu ARMÉ : c'est ce qui manquait. */
  const menuIs = n.querySelector('[data-organe="is-quoi"] select');
  assert.ok(menuIs, "`is` est un dropdown");
  assert.equal(menuIs.disabled, false, "et il s'ouvre — un menu désarmé n'est pas un menu");
});

test("14 — ⛔ NI FLÈCHES NI PAGINATION : la tête ne porte plus que la quantité et le nom", () => {
  /* 🔴 RÉÉCRIT DEUX FOIS DANS LA MÊME HEURE, ET LA SECONDE EFFACE LA PREMIÈRE. Eric a
     d'abord retiré les flèches (*« on va enlever les flèches de navigation latérales »*)
     en gardant la pagination ; puis, dix minutes plus tard : *« le 3/12 ne sert à
     rien »*. ⭐ Il avait raison, et sa première décision l'expliquait : sans flèches, un
     rang qu'on ne peut pas parcourir ne dit plus où l'on VA, seulement où l'on est — et
     on le sait, on vient de taper l'objet. La pagination survivait à sa raison.
     ⚖️ Et la quantité rentre de 20 : collée au bord elle se lisait comme un numéro de
     page ; rentrée, elle se lit comme une propriété de l'objet, voisine de son nom. */
  const n = rendu();
  for (const parti of ["pagination", "precedent", "suivant"]) {
    assert.equal(n.querySelector(`[data-organe="${parti}"]`), null, `⛔ ${parti} n'existe plus`);
  }
  assert.ok(!ORGANES.some((o) => ["PAGINATION", "PRECEDENT", "SUIVANT"].includes(o.nom)),
    "et le plan ne les porte plus non plus");
  const qte = ORGANES.find((o) => o.nom === "QTE");
  const nom = ORGANES.find((o) => o.nom === "NOM");
  assert.equal(qte.x, TABLE.marge_cote + 20, "la quantité rentre de 20 depuis la marge des côtés");
  assert.equal(nom.x, (DALLE.l - nom.l) / 2, "et le nom reste centré sur la page");
});

test("14 bis — la jauge de défilement veille sur le texte, et elle ne se touche pas", () => {
  /* ⚖️ Eric, 17/09 au soir : *« juste des chevrons discrets dans la marge droite pour
     informer le lecteur »*. ⭐ C'est l'organe des fenêtres de prose de Destiny (03/09),
     descendu dans une feuille sans import — le MÊME, pas un second. */
  const n = rendu();
  const jauge = n.querySelector('[data-organe="jauge"]');
  assert.ok(jauge, "la jauge est posée");
  assert.equal(jauge.getAttribute("aria-hidden"), "true", "elle informe l'œil, pas le lecteur d'écran");
  assert.equal(jauge.querySelectorAll(".chevron-defile").length, 2,
    "deux chevrons : le haut compte autant que le bas (leçon du 03/09)");
  assert.match(source, /veilleLeDebordement/, "et c'est bien l'organe partagé qui la fabrique");
});

test("15 — prix et poids : la quantité se dit UNE fois, sur la ligne du prix", () => {
  const n = rendu();
  assert.equal(n.querySelector('[data-organe="prix"]').textContent, "15 gp · ×2 · 30 gp");
  assert.equal(n.querySelector('[data-organe="poids"]').textContent, "3 lb · 6 lb",
    "⛔ pas de `×2` ici : la boîte du plan est taillée sur ce mot-là (43,73 dans 44)");
  /* un objet seul ne dit ni quantité ni total — « ×1 » est du bruit */
  const seul = construireLaFicheX1({ objet: { ...objetTemoin, qte: 1 }, rang: { position: 1, total: 1 } }).noeud;
  assert.equal(seul.querySelector('[data-organe="prix"]').textContent, "15 gp");
  assert.equal(seul.querySelector('[data-organe="poids"]').textContent, "3 lb");
});

/* ══ 16 — LE GESTE QUI L'OUVRE ═══════════════════════════════════════════ */

test("15 bis — 👁️ LE MODE LECTURE : il retire les OPTIONS, et rien d'autre", () => {
  /* ⚖️ Eric, 17/09 au soir : *« à l'opposé du copy, à droite, ce symbole permet de
     cacher tout ce qui est au-dessus des boutons pour laisser plus de place au texte »*,
     puis *« la barre inf de texte descend jusqu'à 8 blg au-dessus des boutons et cache
     les options »*, puis *« tu laisses la partie supérieure, titre etc., tranquille »*.
     ⭐ Les trois phrases se lisent ensemble : ce qui se retire, ce sont les trois rangées
     qui vivent SOUS le texte. La tête ne bouge pas. */
  const lu = rendu({ lecture: true, surLecture: () => {} });
  const retires = ["is", "is-quoi", "equip", "attune", "lock", "equip-on", "attune-on",
                   "lock-on", "send", "send-n", "to", "send-vers"];
  for (const id of retires) {
    assert.equal(lu.querySelector(`[data-organe="${id}"]`).hidden, true, `${id} se retire`);
  }
  /* ⛔ ET LA TÊTE RESTE TRANQUILLE — c'est la clause qu'Eric a ajoutée en regardant. */
  for (const id of ["qte", "nom", "prix", "poids"]) {
    assert.equal(lu.querySelector(`[data-organe="${id}"]`).hidden, false, `${id} reste`);
  }
  for (const id of ["description", "filet-haut", "filet-bas", "jauge", "copier", "oeil",
                    "close", "use", "envoyer", "trash"]) {
    assert.equal(lu.querySelector(`[data-organe="${id}"]`).hidden, false, `${id} reste`);
  }
  assert.equal(lu.dataset.lecture, "oui", "la fiche DIT qu'elle est en lecture : la feuille en tire les cotes");
  /* ⚔️ ET HORS LECTURE, TOUT EST LÀ — sans cette moitié, le garde passerait sur une
     fiche qui cacherait ses options en permanence. */
  const plein = rendu();
  assert.equal(plein.dataset.lecture, undefined, "hors lecture, la fiche ne dit rien");
  for (const id of retires) assert.equal(plein.querySelector(`[data-organe="${id}"]`).hidden, false, `${id} est là`);
});

test("15 ter — 📏 en lecture, le texte descend à 8 des portes, et ses cotes viennent de la table", () => {
  const css = feuilleDesCotesX1();
  const porte = ORGANES.find((o) => o.nom === "BACK");
  const filet = ORGANES.find((o) => o.nom === "FILET HAUT");
  const desc = ORGANES.find((o) => o.nom === "DESCRIPTION");
  const bas = (porte.cible ? porte.cible.y : porte.y) - 8;
  const regle = (id) => (new RegExp(`\\.x1\\[data-lecture="oui"\\] \\[data-organe="${id}"\\]\\{([^}]*)\\}`).exec(css) || [])[1];
  assert.equal(regle("filet-bas"), `top:${bas - filet.h}px`, "le filet du bas s'arrête à 8 des portes");
  assert.equal(regle("description"), `height:${bas - filet.h - desc.y}px`,
    "et le texte prend tout jusqu'à lui — ⛔ son SOMMET ne bouge pas, la tête reste tranquille");
  for (const fixe of ["filet-haut", "copier", "oeil", "jauge"]) {
    assert.doesNotMatch(css, new RegExp(`data-lecture="oui"\\] \\[data-organe="${fixe}"`),
      `⛔ rien ne repose ${fixe} : ce qui ne bouge pas ne se réécrit pas`);
  }
  /* ⚖️ *« l'œil et le copy restent où ils sont »* (Eric, 17/09 au soir) : ils vivent dans
     les MARGES, pas dans la zone — deux repères fixes qu'on retrouve au même endroit
     qu'on lise ou qu'on règle. */
});

test("16 — le clic droit sur un jeton porté ouvre la fiche, et il nomme la LIGNE, pas la boîte", () => {
  const ouverts = [];
  const { noeud } = construireLEcranGear({
    boites: { tete1: { nom: "Winged Helmet", qte: 1, index: 7, equipped: true } },
    surJeton: (index) => ouverts.push(index)
  });
  const jeton = noeud.querySelector('[data-organe="tete1"]');
  assert.ok(jeton, "l'emplacement occupé est rendu");
  jeton.dispatchEvent({ type: "contextmenu", preventDefault() {} });
  assert.deepEqual(ouverts, [7], "c'est l'INDEX `gear[N]` qui voyage — une boîte n'identifie rien");
});

test("17 — 🔴 les deux états que la fiche écrit passent par un verbe, et par UN SEUL", () => {
  /* `equipped` reste le revers de la position (`moveGearLine`) : lui ouvrir un
     second écrivain ferait diverger l'état et le lieu. */
  assert.match(coquille, /action\.kind === "setGearChamp"/, "le verbe existe dans la coquille");
  const bloc = coquille.slice(coquille.indexOf('action.kind === "setGearChamp"'), coquille.indexOf('action.kind === "setGearChamp"') + 700);
  assert.match(bloc, /action\.champ === "attuned" \|\| action\.champ === "locked"/,
    "les deux drapeaux sont nommés");
  assert.match(bloc, /action\.champ !== "is"/, "et le troisième champ, le mot du menu `is`");
  assert.doesNotMatch(bloc, /\.equipped/, "⛔ `equipped` n'entre pas par ce chemin : il est le revers de la position");
  /* ⚔️ et l'écran l'appelle bien avec la clef, pas avec un booléen anonyme */
  assert.match(etape, /kind: "setGearChamp", index: ligne\.index, champ: clef, value: valeur/);
  assert.match(etape, /champ: "is", value: valeur/, "le menu `is` écrit, sinon ce n'est pas un menu");
});

test("17 bis — 🔒 LE VERROU VIT DANS LA COQUILLE, UNE FOIS, ET IL PARLE (Eric, 18/09)", () => {
  /* ⚖️ *« lock : l'item reste collé à son collecteur, ne bouge pas, ne peut être
     vendu, ni détruit tant qu'il est locked »*.
     ⭐ POURQUOI CE GARDE EST UN GARDE DE PROPRIÉTAIRE, PAS DE FORME : quatre
     verbes venus de trois écrans déplacent ou détruisent une ligne. L'interdit
     écrit dans les écrans ferait trois copies, et la QUATRIÈME porte — celle
     qu'un lot ajoutera — passerait au travers sans que rien ne rougisse. Il vit
     donc là où les quatre verbes vivent, et ce garde tient cet endroit. */
  assert.match(coquille, /const VERBES_QUI_DEPLACENT = new Set\(\[([^\]]+)\]\)/,
    "la liste est nommée UNE fois, au module");
  const liste = /const VERBES_QUI_DEPLACENT = new Set\(\[([^\]]+)\]\)/.exec(coquille)[1];
  assert.deepEqual(liste.match(/"[a-zA-Z]+"/g).map((s) => s.slice(1, -1)).sort(),
    ["moveGearLine", "placerGearLine", "removeGearLine", "splitGearLine"],
    "les quatre gestes qui déplacent ou détruisent — ⛔ ni plus, ni moins");

  const i = coquille.indexOf("VERBES_QUI_DEPLACENT.has(action.kind)");
  assert.ok(i > 0, "et la liste est LUE, pas seulement déclarée");
  const bloc = coquille.slice(i, i + 700);
  assert.match(bloc, /ligne\.locked === true/, "c'est bien le verrou qui refuse");
  assert.match(bloc, /state\.popup = \{[^}]*role: "gendarme"/,
    "⛔ ET IL NE SE TAIT PAS (loi §0.5) : un refus muet se lit comme une panne");
  assert.match(bloc, /Lock off/, "…et il dit le geste qui défait le refus, pas seulement l'état");

  /* ⛔ ET `attuned` RESTE LIBRE : harmoniser ne déplace rien. Le garde le prouve
     par ce que la liste NE contient pas, sinon un jour elle avalerait tout. */
  assert.doesNotMatch(liste, /setGearChamp/,
    "harmoniser et déverrouiller ne sont pas des mouvements — sinon le verrou se murerait lui-même");
});

test("17 ter — 🔮 LE PLAFOND D'HARMONISATION : trois, et la quatrième ne se propose pas", () => {
  /* ⚖️ Eric, 18/09, rappelant le SRD : *« a creature can be attuned to a maximum of
     3 magic items at once ; attempting to attune to a 4th has no effect until one is
     unattuned »*.
     ⛔ ET C'EST LA SEULE PART DU SRD QUE CET ÉCRAN MODÉLISE — le repos court, les
     prérequis, la rupture à 24 heures se passent EN JEU. Ce qu'un créateur tient,
     c'est le budget : on ne sort pas de la création avec quatre objets harmonisés. */
  assert.equal(PLAFOND_HARMONISATION, 3, "le plafond est nommé une fois, et c'est celui du SRD");

  const ecrits = [];
  const plein = rendu({ objet: { ...objetTemoin, attuned: false }, harmonises: 3,
    surEtat: (clef, v) => ecrits.push([clef, v]) });
  const b = plein.querySelector('[data-organe="attune-on"]');
  assert.equal(b.disabled, true);
  assert.match(b.title || "", /3 items are already attuned/, "il dit le plafond, pas « impossible »");
  b.dispatchEvent({ type: "click" });
  assert.deepEqual(ecrits, [], "et il n'écrit rien");

  /* ⭐ LE TÉMOIN QUI EMPÊCHE LE PIÈGE : un objet DÉJÀ harmonisé garde son
     interrupteur même à trois — sinon le plafond enfermerait au lieu de borner. */
  const sien = rendu({ objet: { ...objetTemoin, attuned: true }, harmonises: 3 });
  assert.notEqual(sien.querySelector('[data-organe="attune-on"]').disabled, true,
    "⛔ on peut toujours DÉFAIRE une harmonisation quand le plafond est atteint");

  const i = coquille.indexOf('action.champ === "attuned" && action.value === true');
  assert.ok(i > 0, "le dernier rempart existe dans la coquille");
  const rempart = coquille.slice(i, i + 600);
  assert.match(rempart, /l\.index !== action\.index/, "il compte les AUTRES lignes, pas celle qu'on rallume");
  assert.match(rempart, /role: "gendarme"/, "⛔ et il ne se tait pas");
});

test("18 — 🔴 l'écran R lit enfin les deux voyants que X1 écrit (la dette du 16/09 est payée)", () => {
  /* Le lot 212 dessinait ♥ et 🔒 en les laissant éteints, faute d'écrivain. Ce
     garde tient les DEUX bouts : la boîte les porte, et le jeton les allume. */
  assert.match(etape, /attuned: ligne\.attuned === true/, "la boîte porte l'état harmonisé");
  assert.match(etape, /locked: ligne\.locked === true/, "et l'état verrouillé");
  const { noeud } = construireLEcranGear({
    boites: { tete1: { nom: "Winged Helmet", qte: 1, index: 7, equipped: true, attuned: true, locked: true } }
  });
  const etats = {};
  for (const v of tous(noeud.querySelector('[data-organe="tete1"]'), "[data-voyant]")) etats[v.dataset.voyant] = v.dataset.etat;
  assert.deepEqual(etats, { verrou: "oui", equipe: "oui", harmonise: "oui" },
    "les trois voyants s'allument maintenant — ils attendaient X1, pas un dessin");
});
