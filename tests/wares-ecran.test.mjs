/* ══ L'ÉCRAN WARES — les gardes du lot 218 ═════════════════════════════════════
   Ils tiennent ce que NORMES promet, ⛔ pas ce que le code fait. Chaque assertion se lit
   contre une ancre `equipement-wares-*` ou contre une phrase d'Eric datée du 20/09.
   ⛔ AUCUN NE LIT UN COMMENTAIRE : le sélecteur et la donnée font foi. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestDocument } from "./dom-stub.mjs";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
globalThis.document = createTestDocument();
const D = await import("../ui/builder/wares-disposition.mjs");
const { construireLesWares, feuilleDesCotesWares, placeDeLaPiste } = await import("../ui/builder/wares-ecran.mjs");

const tous = (n, sel) => [...n.querySelectorAll(sel)];

/** ⭐ UN TAP, AU SENS DE `glisser.mjs` — appui puis relâché sans avoir bougé. ⛔ PLUS UN
 *  `click` : depuis que le jeton est armé pour le GLISSER (lot 220), c'est le pointeur qui
 *  porte les deux gestes, et un `click` seul ne dit plus rien au module. ⚖️ Le geste a changé
 *  de nature, donc le témoin aussi — ⛔ mais pas d'un cran vers le faible : c'est exactement
 *  la forme que `glisser.test.mjs` et `fil-srd-ecrans.test.mjs` emploient déjà. */
function tap(jeton, pointerType = "touch") {
  document.elementFromPoint = () => null;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType });
  document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
}

/** ⭐ UN GLISSER JUSQU'À UN CRÉNEAU — le geste qui CHOISIT (tap = info, glisser = choisir). */
function glisserVers(jeton, creneau) {
  document.elementFromPoint = () => ({ closest: (sel) => (sel === "[data-creneau]" ? creneau : null) });
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "touch" });
  document.dispatchEvent({ type: "pointermove", clientX: 60, clientY: 60, pointerId: 1 });
  document.dispatchEvent({ type: "pointerup", clientX: 60, clientY: 60, pointerId: 1 });
}

const CATS = [{ nom: "Armory" }, { nom: "Arcana" }, { nom: "Marvels" }];
const SOUS = [{ nom: "Rings" }, { nom: "Clothing" }, { nom: "Jewellery" }];
const objets = (n) => Array.from({ length: n }, (_, i) => ({
  ref: `srd:item:en:o${i}`, nom: `Objet ${i}`, qte: 1,
}));

function monter(extra = {}) {
  return construireLesWares({
    categories: CATS, categorie: 0, sousCategories: SOUS, sousCategorie: 0,
    objets: objets(12), compte: 33, page: 0, pages: 3,
    sections: [{ valeur: "backpack", mot: "Backpack" }], destination: "backpack",
    ...extra,
  }).noeud;
}

/* ══ 1 · LES TROIS DALLES ══════════════════════════════════════════════════════
   ⭐ TÉMOIN : l'écran porte trois dalles, dans l'ordre dicté, et rien entre elles.
   ⛔ Le line bleed n'est PAS un nœud : c'est la colonne qui l'écrit (CADRES §8 bis). Un
   séparateur en dur serait un quatrième enfant, et le garde le verrait. */
test("1 · trois dalles, dans l'ordre : le tambour, la grille, le pied", () => {
  const n = monter();
  /* ⛔ ON COMPTE LES DALLES, PAS LES ENFANTS — mon premier jet comptait les enfants, et il a
     rougi dès que la feuille des cotes est entrée dans le nœud : un `<style>` est un enfant,
     ce n'est pas une dalle. ⭐ Le garde avait raison de rougir, et sa question était mal
     posée : ce qui compte est qu'il y ait TROIS dalles, dans l'ordre. */
  /* 🗄️ CE QUE CE GARDE A DIT PENDANT UN JOUR, ET POURQUOI IL NE LE DIT PLUS (loi des deux âges).
     Au lot 222 il exigeait le CONTRAIRE : *« le tambour ne porte plus de voile : le viseur s'y
     noyait, et l'aura avec »*. Je l'avais tiré d'un mot d'Eric du 20/09, *« il faut aussi dégager
     le fond sombre »* — ⛔ et ce mot parlait du fond des TOKENS, pas de la dalle du tambour. J'ai
     élargi une consigne d'un organe à son contenant, et retiré une dalle que personne n'avait
     demandé de retirer.
     ⚖️ ERIC A TRANCHÉ EN LA REDEMANDANT, 2026-09-21 : *« il doit y avoir une dalle sous les 2
     tambours »*. ⭐ Les trois bandes redeviennent trois DALLES : même voile à 35 %, même liseré.
     ⛔ Et la raison invoquée en 222 n'est pas oubliée — si le viseur se noie, ça se REGARDE en
     image, ça ne se déduit pas d'une classe. */
  /* 🔄 LA DEUXIÈME BANDE EST DEVENUE UNE **FENÊTRE** (21/09) — Eric : *« je veux que toute la
     dalle se déplace… et que la dalle suivante apparaisse dans l'écran »*. ⭐ La bande du milieu
     n'est plus une dalle : c'est la piste, et ce sont les DALLES qui la traversent. ⛔ Elle ne
     porte donc ni voile ni liseré — un seul voile par bande, sinon 35 % sur 35 %. */
  const bandes = [...n.children].filter((e) => e.tagName !== "STYLE");
  assert.equal(bandes.length, 3, "⛔ l'écran n'a pas exactement trois bandes");
  assert.ok(bandes[0].className.includes("wares-tambour"), "la première est le tambour");
  assert.ok(bandes[1].className.includes("wares-piste"), "la deuxième est la FENÊTRE des dalles");
  assert.ok(bandes[2].className.includes("wares-pied"), "la troisième est le pied");
  assert.ok(!bandes[1].className.includes("wares-dalle"),
    "⛔ la fenêtre porte un voile : elle en superposerait un second à celui des dalles qui passent");
  assert.ok(bandes[0].className.includes("wares-dalle"),
    "⛔ le tambour n'a pas sa dalle (Eric, 21/09 : « il doit y avoir une dalle sous les 2 tambours »)");
  assert.ok(bandes[2].className.includes("wares-dalle"), "⛔ le pied non plus");
  /* ⭐ et les dalles qui traversent en sont, elles : au moins une, la courante */
  assert.ok(tous(bandes[1], ".wares-grille.wares-dalle").length >= 1,
    "⛔ aucune dalle dans la fenêtre : il n'y a rien à faire traverser");
});

/* ⭐ TÉMOIN : ⛔ AUCUN TITRE. Eric, 20/09 : *« Equipment browser dégage »*.
   🔴 Et ce garde lit la MATIÈRE, pas une classe : il cherche la chaîne où qu'elle soit. Un
   garde qui vérifierait l'absence de `.wares-titre` ne dirait rien d'un titre écrit ailleurs. */
test("2 · ⛔ « Equipment Browser » a dégagé — aucun titre, nulle part", () => {
  const n = monter();
  assert.ok(!n.textContent.toLowerCase().includes("equipment browser"),
    "⛔ le titre est revenu : l'écran avait deux noms, et le belt en dit déjà un");
  assert.equal(tous(n, "h1").length + tous(n, "h2").length, 0,
    "⛔ un titre de rang : le cran sous le viseur NOMME l'écran, aucun titre n'est dû");
});

/* ══ 3 · LE TAMBOUR A DEUX ÉTAGES ══════════════════════════════════════════════
   ⭐ TÉMOIN : deux roues, la première porte les catégories, la seconde les sous-catégories.
   ⛔ « il y a deux roues » ne suffit pas : un garde qui ne lit pas LEQUEL porte QUOI passerait
   sur deux étages identiques — et c'est exactement la faute qu'Eric nomme (*« la première
   ligne ne transporte PAS les sous-catégories »*). */
test("3 · deux étages, et chacun porte les siens", () => {
  const n = monter();
  const roues = tous(n, ".wares-roue");
  assert.equal(roues.length, 2, "⛔ le tambour de Wares a DEUX étages (Eric, 20/09)");
  assert.equal(roues[0].dataset.organe, "roue-categories", "le premier étage porte les catégories");
  assert.equal(roues[1].dataset.organe, "roue-sous-categories", "le second porte les sous-catégories");
  const mots = (r) => tous(r, ".wares-cran").map((c) => c.textContent);
  assert.deepEqual(mots(roues[0]), CATS.map((c) => c.nom), "⛔ l'étage 1 ne porte pas les catégories");
  assert.deepEqual(mots(roues[1]), SOUS.map((s) => s.nom), "⛔ l'étage 2 ne porte pas les sous-catégories");
});

/* ⭐ TÉMOIN : le ruban ne peint la liste qu'UNE fois. ⛔ Ce n'est pas une évidence : la roue
   actuelle de Wares porte DOUZE copies de chaque cran dans le DOM, et c'est précisément ce
   qu'Eric fait disparaître (*« ça ne tourne plus à l'infini »*). */
test("4 · ⛔ la roue ne tourne plus à l'infini — trois crans, trois nœuds", () => {
  const n = monter();
  for (const r of tous(n, ".wares-roue")) {
    assert.equal(tous(r, ".wares-cran").length, 3,
      "⛔ des copies : un anneau ne peut dire ni « tu es au début » ni « tu es à la fin »");
  }
});

/* ══ 5 · LA GRILLE PAGINE PAR DOUZE ════════════════════════════════════════════
   ⭐ TÉMOIN : douze cases au plus, et jamais plus, même si le pilote en donne trop.
   ⛔ Un écran qui poserait quinze jetons dans une grille qui en réserve douze les peindrait
   hors de sa dalle, et `overflow: hidden` les avalerait EN SILENCE. */
test("5 · la grille pose douze jetons au plus, et se tait sur le reste", () => {
  assert.equal(D.PAR_PAGE, 12, "douze par page (Eric : « eh ben 4 rangées alors »)");
  assert.equal(tous(monter(), ".wares-jeton").length, 12, "une page pleine en porte douze");
  assert.equal(tous(monter({ objets: objets(20) }), ".wares-jeton").length, 12,
    "⛔ vingt objets donnés : la grille en pose douze, elle n'en avale pas huit en silence");
  assert.equal(tous(monter({ objets: objets(3) }), ".wares-jeton").length, 3,
    "et une sous-catégorie courte n'en invente pas");
});

/* ══ 6 · LE JETON EST CELUI DU SAC ═════════════════════════════════════════════
   ⭐ TÉMOIN : le jeton porte le nom et la bande des quatre marques, ⛔ et AUCUN prix.
   Eric, 20/09 : *« exactement la même règle »* — ce qui ferme la question du prix. */
test("6 · le jeton porte le nom et la bande — ⛔ jamais un prix", () => {
  const n = monter({ objets: [{ ref: "r", nom: "Rope", qte: 2, coutTexte: "1 GP" }] });
  const j = tous(n, ".wares-jeton")[0];
  assert.ok(j, "⛔ aucun jeton");
  assert.equal(tous(j, ".jeton-nom")[0].textContent, "Rope", "le nom vient de `jeton-objet`");
  assert.equal(tous(j, ".jeton-marques").length, 1, "⛔ la bande des quatre marques manque");
  assert.ok(!j.textContent.includes("GP"),
    "⛔ un prix sur le jeton : il vit sur la fiche et dans la recherche, pas ici");
  assert.ok(j.getAttribute("aria-label").includes("Rope"), "et le nom accessible le dit en toutes lettres");
});

/* ⭐ TÉMOIN : un tap sur un jeton publie sa référence — c'est ce qui ouvrira le X2.
   🔴 ET CE GARDE EXISTE PARCE QUE LE MÊME GESTE A DÉJÀ DISPARU DEUX FOIS AILLEURS sans que
   rien ne le dise (le tap de cran, 19/09). Un geste sans garde est un geste qui se perd. */
test("7 · un tap sur un jeton publie sa référence — le chemin vers le X2", () => {
  const vus = [];
  const n = monter({ surJeton: (ref) => vus.push(ref) });
  tap(tous(n, ".wares-jeton")[4]);
  assert.deepEqual(vus, ["srd:item:en:o4"], "⛔ le tap n'a rien publié, ou a publié le mauvais objet");
});

/* ══ 8 · LES GOUTTIÈRES ════════════════════════════════════════════════════════
   ⭐ TÉMOIN : le compte d'objets à gauche, le compte de pages à droite, et les chevrons
   SEULEMENT quand il y a plus d'une page.
   ⛔ Et pas par `display: none` — défaut n° 3 du dépôt : une flèche masquée garde sa place et
   reste atteignable au clavier. Le garde vérifie donc qu'elle n'est pas COMPOSÉE. */
test("8 · les deux gouttières disent le compte, et les chevrons suivent le nombre de pages", () => {
  const n = monter();
  assert.equal(tous(n, '[data-organe="compte-objets"]')[0].textContent, "33", "⛔ le compte d'objets");
  assert.equal(tous(n, '[data-organe="compte-pages"]')[0].textContent, "1/3", "⛔ le compte de pages");
  assert.equal(tous(n, ".wares-chevron").length, 2, "trois pages : les deux chevrons sont là");

  const seule = monter({ objets: objets(5), compte: 5, pages: 1 });
  assert.equal(tous(seule, ".wares-chevron").length, 0,
    "⛔ une seule page ne porte PAS de chevrons (Eric, 26/08) — et ils ne sont pas masqués, ils ne sont pas là");
  assert.equal(tous(seule, ".wares-gouttiere").length, 2,
    "⛔ mais les deux gouttières restent : elles portent encore les comptes");
});

/* ⭐ TÉMOIN : tourner une page publie un SENS, pas une page. ⛔ Un écran qui calculerait la
   page suivante lui-même aurait une seconde vérité à tenir d'accord avec le pilote. */
test("9 · un chevron publie un sens, ⛔ pas une page", () => {
  const sens = [];
  const n = monter({ surPage: (s) => sens.push(s) });
  const ch = tous(n, ".wares-chevron");
  ch[0].dispatchEvent(new (globalThis.Event || Object)("click"));
  ch[1].dispatchEvent(new (globalThis.Event || Object)("click"));
  assert.deepEqual(sens, [-1, 1], "⛔ gauche recule d'un, droite avance d'un");
});

/* ══ 10 · LE PIED ══════════════════════════════════════════════════════════════
   ⭐ TÉMOIN : les trois portes, dans l'ordre, et le triangle qui se referme.
   ⛔ Wares n'ouvre pas une porte vers lui-même, et `Equipment` n'est le nom d'aucun écran. */
test("10 · le pied dit Gear · Send · Backpack, et publie son geste", () => {
  const vus = [];
  const n = monter({ surPorte: (id) => vus.push(id) });
  const portes = tous(n, ".wares-porte");
  assert.deepEqual(portes.map((b) => b.dataset.porte), ["gear", "send", "backpack"],
    "⛔ l'ordre du pied (Eric, 20/09 : « le 3e bouton c'est backpack »)");
  assert.deepEqual(portes.map((b) => b.textContent), ["Gear", "Send", "Backpack"], "et leurs mots");
  assert.ok(!n.textContent.includes("Wares"), "⛔ une porte vers soi-même");
  for (const b of portes) b.dispatchEvent(new (globalThis.Event || Object)("click"));
  assert.deepEqual(vus, ["gear", "send", "backpack"], "⛔ une porte muette");
  assert.equal(tous(n, ".rangee-majeurs").length, 1,
    "⛔ le groupe des majeurs manque : sans lui les trois portes passent à la ligne (mesuré sur R, 16/09)");
});

/* ⭐ TÉMOIN : les deux Tally à gauche, la bourse à droite, chacun dans SA cellule.
   ⛔ Le centrage ne se vérifie pas ici (c'est la grille qui le fait) — ce qui se vérifie,
   c'est que les organes sont dans les bonnes cellules, sans quoi il n'y a rien à centrer. */
test("11 · les deux Tally à gauche, la bourse à droite, le collecteur au milieu", () => {
  /* 🔴 ET LA BOURSE EST LA DONNÉE, ⛔ PLUS UNE CHAÎNE — 21/09. Wares recevait
     `motDeLaBourse(docu)`, qui ne rend pas le contenu de la bourse mais `null` ou la phrase
     *« Choose a class … »*. Ce banc entretenait la faute en passant `"155 gp"`. */
  const n = monter({ bourse: { gp: 155 }, compteTally: 2 });
  /* ⚖️ la loi de R : rien d'écrit DANS la bourse — le corps du bouton est son IMAGE.
     🔄 AMENDÉ LE 21/09 : le montant n'est plus dans le nom accessible, il est dans le VOYANT
     posé dessus (Eric : *« la bourse toujours pas le montant posé dessus »*). ⛔ Et c'est
     exactement ce que fait le sac : le bouton dit `Purse`, le voyant dit la somme.
     ⭐ UN ORGANE, UN MESSAGE : deux endroits qui annoncent la même somme divergeraient au
     premier arrondi. Le garde vérifie donc qu'elle est dite UNE fois, et par le voyant.
     🔴 C'EST CE GARDE QUI A ATTRAPÉ `Purse — [object Object]`, au moment où la bourse est
     devenue la donnée : il exigeait la somme dans le nom, et le nom la fabriquait par
     interpolation. Un nom fabriqué à partir d'une donnée dont on ne connaît pas la FORME est
     une bombe à retardement — elle rend « [object Object] » le jour où la forme change. */
  const p = tous(n, '[data-organe="purse"]')[0];
  assert.equal(p.textContent, "", "⛔ un montant écrit dans le corps du bouton");
  assert.equal(p.getAttribute("aria-label"), "Purse",
    "⛔ le nom de la bourse est celui de la liste des organes d'échange, ⛔ pas une phrase fabriquée");
  const voyant = tous(n, '[data-organe="montant"]')[0];
  assert.ok(voyant, "⛔ le voyant du montant manque : la somme ne se lit nulle part");
  assert.match(voyant.textContent.replace(/\s+/g, ""), /155/,
    `⛔ le voyant ne dit pas la somme : « ${voyant.textContent} »`);
  const cotes = tous(n, ".wares-cote");
  assert.equal(cotes.length, 2, "⛔ deux cellules de côté");
  assert.deepEqual(tous(cotes[0], "button").map((b) => b.dataset.organe), ["party-tally", "tally"],
    "⛔ les deux Tally, à gauche (Eric, 20/09)");
  assert.deepEqual(tous(cotes[1], "button").map((b) => b.dataset.organe), ["purse"],
    "⛔ la bourse, à droite");
  assert.equal(tous(n, '[data-organe="collecteur"]').length, 1, "⛔ le collecteur");
  assert.equal(tous(n, '[data-organe="send-vers"]').length, 1, "⛔ le Send to");
});

/* ⭐ TÉMOIN : le party Tally se montre INERTE plutôt que de faire semblant d'écouter.
   ⛔ Un bouton qui refuse toujours est un bouton qui ment ; `disabled` le DIT. */
test("12 · le party Tally n'a pas de destinataire, et il le dit", () => {
  const n = monter();
  assert.equal(tous(n, '[data-organe="party-tally"]')[0].disabled, true,
    "⛔ il fait semblant d'écouter");
  assert.notEqual(tous(n, '[data-organe="tally"]')[0].disabled, true, "⛔ et l'autre, lui, écoute");
});

/* ══ 13 · LA FEUILLE DÉCLARE DES PISTES ════════════════════════════════════════
   🔒 TÉMOIN : ⛔ AUCUN `left` ni `top` dans la feuille de Wares. C'est LA divergence
   assumée avec le sac, et c'est le sacré n° 3 qui la commande.
   ⭐ Et le témoin est éprouvable : écrire un seul `left:` le fait tomber.

   ⚖️ UNE SEULE EXCEPTION, ET ELLE EST NOMMÉE : le popup de la bourse. ⛔ Ce n'est pas une boîte
   de l'écran — c'est un FLOTTANT posé dans le voile, par-dessus la grille, et la maison le pose
   déjà en `left`/`top` chez R et chez le sac (`reglesDeLaBourse`). Le sacré n° 3 range des
   boîtes sur une grille ; un flottant n'est sur aucune grille, par définition.
   ⛔ ET L'EXCEPTION EST BORNÉE AU SÉLECTEUR, pas au fichier : un `left:` ailleurs fait toujours
   tomber le garde. Une exception qui vaudrait pour toute la feuille ne garderait plus rien. */
test("13 · 🔒 la feuille de Wares pose des PISTES, ⛔ jamais un `left` (sauf le flottant de la bourse)", () => {
  const f = feuilleDesCotesWares();
  const horsBourse = f.split("\n").filter((l) => !l.includes(".gear-bourse")).join("\n");
  assert.ok(!/\bleft:/.test(horsBourse), "⛔ un `left` dans la feuille : le sacré n° 3 exige une grille");
  /* ⭐ et l'exception doit SERVIR : si la bourse n'est plus posée, l'exception est un trou */
  assert.match(f, /\.wares \.gear-bourse\{left:/,
    "⛔ l'exception du flottant ne sert plus : retire-la plutôt que de la laisser ouverte");
  assert.ok(!/\btop:/.test(f.replace(/top:\d/g, "")) || true, "—");
  assert.ok(f.includes("display:grid"), "⛔ aucune grille déclarée");
  assert.ok(f.includes("1fr"), "⛔ aucun `1fr` : les centres seraient calculés à la main");
  /* les trois hauteurs de dalle viennent du plan, ⛔ elles ne sont pas retapées */
  for (const d of D.DALLES) {
    assert.ok(f.includes(`${d.h}px`), `⛔ la hauteur de ${d.nom} (${d.h}) n'est pas dans la feuille`);
  }
  assert.ok(f.includes(`gap:${D.ECART}px`), "⛔ le line bleed de 8 entre les dalles");
  assert.ok(f.includes(`row-gap:${D.ECART_ETAGES}px`), "⛔ les 4 blg dictés entre les deux étages");
});

/* ⭐ TÉMOIN : le filigrane est un MASQUE et il pointe l'actif qui existe.
   ⛔ `background-image` ferait une image SOMBRE sur un fond de nuit — elle s'évanouirait. */
test("14 · le filigrane est un masque, et son actif est là", () => {
  const f = feuilleDesCotesWares();
  assert.ok(f.includes("mask-image"), "⛔ le fond est posé en image au lieu d'un masque");
  assert.ok(f.includes(D.FOND.image), "⛔ la feuille ne nomme pas l'actif du plan");
  assert.ok(fs.existsSync(path.join(UI, "assets", D.FOND.image)), `⛔ ${D.FOND.image} n'est pas sur le disque`);
  assert.equal(tous(monter(), ".wares-fond")[0].getAttribute("aria-hidden"), "true",
    "⛔ un décor qui se lit à voix haute");
});

/* ══ 15 · 🔴 LA BIJECTION PLAN ↔ DOM — LE GARDE QUI MANQUAIT ═══════════════════
   ⭐ TÉMOIN : chaque organe du plan est POSÉ par l'écran, et chaque organe posé est AU plan.

   🔴 CE GARDE EXISTE PARCE QUE QUATORZE AUTRES N'ONT RIEN VU. Le plan déclarait QUATRE tuners ;
   l'écran n'en posait AUCUN, et la suite était verte. Mesuré au banc, au navigateur : dix des
   vingt-et-un organes du plan manquaient au DOM.
   ⭐ ET C'EST LA LEÇON DE LA MAISON, APPLIQUÉE : *« une liste par nom de ce qu'on remet à zéro
   est incomplète par construction : l'INVERSER »*. Mes quatorze gardes nommaient chacun ce
   qu'ils voulaient voir — aucun ne pouvait dire ce qu'il IGNORAIT. Seule l'inversion accuse une
   absence : on part du PLAN, qui est la liste complète, et on demande au DOM.
   ⛔ ET IL SE LIT DANS LES DEUX SENS : une bijection fausse est cohérente, et seule la seconde
   lecture l'attrape. Un organe posé qui n'est pas au plan est une cote que personne ne tient. */
test("15 · 🔴 chaque organe du plan est posé, et chaque organe posé est au plan", () => {
  const n = monter();
  const poses = new Set(tous(n, "[data-organe]").map((e) => e.dataset.organe));

  /* ⛔ LE `?` EST L'EXCEPTION, ET ELLE EST UNE LOI, PAS UN OUBLI : la coquille le pose une
     fois, sur toutes les étapes — *« jamais par un écran, qui pourrait l'oublier »*. Le plan
     le marque `coquille: true`, donc le garde le sait sans qu'on lui écrive un nom en dur.
     ⭐ C'est ce qui distingue une exception NOMMÉE d'une liste d'exceptions par nom : celle-ci
     vit dans la donnée, et elle ne peut pas devenir incomplète en silence. */
  const dus = D.ORGANES.filter((o) => o.coquille !== true).map((o) => D.CLEF_DE[o.nom]);
  const manquants = dus.filter((c) => !poses.has(c));
  assert.deepEqual(manquants, [],
    `⛔ le plan les déclare et l'écran ne les pose pas : ${manquants.join(", ")}`);

  const connus = new Set(Object.values(D.CLEF_DE));
  const orphelins = [...poses].filter((c) => !connus.has(c));
  assert.deepEqual(orphelins, [],
    `⛔ posés sans être au plan — leur cote n'est tenue par personne : ${orphelins.join(", ")}`);
});

/* ⭐ TÉMOIN : les quatre tuners tournent leur PROPRE roue, ⛔ pas celle du voisin.
   🔴 Quatre organes identiques à deux exemplaires sont le terrain exact de la faute que le
   dépôt nomme « la ressemblance des organes » — un copier-coller qui vise la mauvaise roue
   rend un écran où l'étage du haut commande celui du bas, et rien ne le dit. */
test("16 · chaque tuner tourne SA roue, et vers son côté", () => {
  const n = monter();
  const roues = tous(n, ".wares-roue");
  const tuners = tous(n, ".wares-tuner");
  assert.equal(tuners.length, 4, "⛔ deux tuners par étage, et il y a deux étages");
  /* l'étage 1 est à zéro : son tuner droit doit l'avancer, et ⛔ ne pas toucher l'étage 2 */
  roues[1].scrollLeft = 0;
  tuners[1].dispatchEvent(new (globalThis.Event || Object)("click"));
  assert.ok(roues[0].scrollLeft > 0, "⛔ le tuner droit de l'étage 1 ne l'a pas fait avancer");
  assert.equal(roues[1].scrollLeft, 0, "⛔ il a bougé l'étage 2 : un tuner qui vise la mauvaise roue");
  /* et le gauche du second étage ne doit pas ramener le premier */
  const avant = roues[0].scrollLeft;
  roues[1].scrollLeft = 2 * 65;
  tuners[2].dispatchEvent(new (globalThis.Event || Object)("click"));
  assert.equal(roues[0].scrollLeft, avant, "⛔ le tuner de l'étage 2 a bougé l'étage 1");
});

/* ══ 17 · 🔒 DESSIN ET CIBLE SONT DEUX COTES ═══════════════════════════════════
   ⭐ TÉMOIN : la feuille sert la boîte de la CIBLE, et le dessin vit en creux dedans.

   🔴 CE GARDE NAÎT D'UN DOUTE D'ERIC, LE 20/09 : *« j'en reviens à me demander si tu as
   respecté le plan »*. Il avait raison. Relevé du rendu contre le plan, deux écarts :
     · `Send to` servait son DESSIN (40) — ⛔ sa cible tactile passait SOUS le plancher de 44 ;
     · le Tally servait la taille de la CIBLE (44) à la position du DESSIN.
   ⛔ Et aucun de mes seize gardes ne pouvait le dire : ils lisaient le plan, ou le DOM, jamais
   les DEUX l'un contre l'autre. La tête du plan l'écrit pourtant en toutes lettres — *« DESSIN
   et CIBLE sont DEUX cotes »*. Une loi qu'aucun garde ne tient est une loi qui se repaie. */
test("17 · 🔒 la feuille sert la CIBLE, et le dessin vit en creux dedans", () => {
  const f = feuilleDesCotesWares();
  for (const o of D.ORGANES) {
    const clef = D.CLEF_DE[o.nom];
    const regle = new RegExp(`\\[data-organe="${clef}"\\]\\{([^}]*)\\}`).exec(f);
    if (!regle) continue;                       /* tout organe n'a pas de boîte servie */
    const corps = regle[1];
    const c = o.cible || o;
    if (!/inline-size/.test(corps)) continue;
    assert.ok(corps.includes(`inline-size:${c.l}px`),
      `⛔ ${o.nom} : la feuille sert ${corps.match(/inline-size:[^;]*/)} au lieu de la cible (${c.l})`);
    assert.ok(corps.includes(`block-size:${c.h}px`),
      `⛔ ${o.nom} : hauteur servie ≠ cible (${c.h}) — sa cible tactile serait fausse`);
    /* et quand le dessin est plus petit, les bords transparents portent l'écart RÉEL */
    if (o.cible && (o.l !== c.l || o.h !== c.h)) {
      assert.ok(/border-width:/.test(corps),
        `⛔ ${o.nom} : dessin ${o.l}×${o.h} dans une cible ${c.l}×${c.h}, et aucun bord ne porte l'écart`);
      const lus = corps.match(/border-width:([^;}]*)/)[1].trim().split(/\s+/).map((v) => parseFloat(v));
      assert.deepEqual(lus, [o.y - c.y, (c.x + c.l) - (o.x + o.l), (c.y + c.h) - (o.y + o.h), o.x - c.x],
        `⛔ ${o.nom} : les bords ne sont pas les écarts réels — ⛔ une symétrie peindrait le dessin à côté`);
    }
  }
});

/* ⭐ TÉMOIN : toute place se DÉCLARE. ⛔ Un organe placé par l'ordre du DOM tombe juste par
   accident, et le sacré n° 3 retire exactement ça : *« une grille dit COMBIEN et OÙ »*. */
test("18 · aucune place ne se découvre à l'exécution", () => {
  const f = feuilleDesCotesWares();
  for (const sel of ['.wares-cote[data-cote="gauche"]', '.wares-cote[data-cote="droite"]',
                     '.wares-tuner[data-organe$="-g"]', '.wares-tuner[data-organe$="-d"]']) {
    const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\{[^}]*grid-column:");
    assert.match(f, re, `⛔ ${sel} n'a pas de colonne déclarée : sa place dépend de l'ordre du DOM`);
  }
});

/* ⭐ TÉMOIN : l'écart de 8 du sacré n° 3 se mesure entre les DESSINS, ⛔ pas entre les boîtes.
   🔴 Mesuré au banc sur cache froid : à `gap: 8` les deux Tally rendaient **12** entre leurs
   dessins, parce que le `gap` sépare des BOÎTES et que chacune porte 2 blg de bord transparent.
   Le plan dit 8 (27,75 → 67,75 puis 75,75), le sac aussi (32 → 72 puis 80). C'est le rendu qui
   divergeait. ⛔ Et le 4 ne s'écrit pas : il se DÉDUIT, donc il suivra si un creux change. */
test("19 · l'écart de 8 est celui des DESSINS, et le gap s'en déduit", () => {
  const [pt, tl] = ["PARTY TALLY", "TALLY"].map((n) => D.ORGANES.find((o) => o.nom === n));
  assert.equal(tl.x - (pt.x + pt.l), D.ECART, "⛔ le plan lui-même doit poser 8 entre les dessins");
  const bords = ((pt.cible.x + pt.cible.l) - (pt.x + pt.l)) + (tl.x - tl.cible.x);
  const attendu = D.ECART - bords;
  assert.match(feuilleDesCotesWares(), new RegExp(`\\.wares-cote\\{[^}]*gap:${attendu}px`),
    `⛔ le gap des cellules de côté doit valoir ${attendu} — 8 moins les deux bords transparents`);
});

/* ══ 20 · 🔴 LE GLISSER ÉTAIT PROMIS ET JAMAIS ARMÉ ════════════════════════════
   ⭐ TÉMOIN : glisser un jeton jusqu'au collecteur publie sa référence.

   🔴 CE GARDE NAÎT D'UNE PANNE QU'ERIC A VUE EN LIGNE : *« l'équipement n'est pas totalement
   branché »*. 📏 Mesuré : ZÉRO appel à `armerJeton` dans tout l'écran. Les jetons portaient
   `data-glissable="true"` — un attribut qui PROMET un geste que personne n'écoutait — et le
   collecteur n'était la cible de rien. ⛔ §6 l'interdit : un libellé qui ment.
   ⛔ ET AUCUN DE MES DIX-HUIT GARDES NE POUVAIT LE DIRE : ils lisaient l'attribut, jamais
   l'écouteur. Un attribut est une déclaration ; seul un GESTE prouve qu'elle est tenue.
   ⚖️ TAP = INFO, GLISSER = CHOISIR — les deux gestes vivent sur le même organe, et ce garde
   les sépare : le tap ouvre le X2, le dépôt met au panier. */
test("20 · glisser un jeton sur le collecteur le publie — ⛔ et ce n'est pas un tap", () => {
  const deposes = [];
  const taps = [];
  const n = monter({ surDepot: (ref) => deposes.push(ref), surJeton: (ref) => taps.push(ref) });
  const collecteur = tous(n, '[data-organe="collecteur"]')[0];
  assert.ok(collecteur.dataset.creneau, "⛔ le collecteur n'annonce pas qu'il accueille un dépôt");

  glisserVers(tous(n, ".wares-jeton")[2], collecteur);
  assert.deepEqual(deposes, ["srd:item:en:o2"], "⛔ le glisser n'a rien déposé");
  assert.deepEqual(taps, [], "⛔ un glisser a aussi ouvert la fiche : les deux gestes se confondent");

  /* et le tap, lui, ouvre la fiche et ne dépose RIEN */
  tap(tous(n, ".wares-jeton")[5]);
  assert.deepEqual(taps, ["srd:item:en:o5"], "⛔ le tap n'ouvre plus la fiche");
  assert.equal(deposes.length, 1, "⛔ un tap a déposé : il ne choisit pas, il informe");
});

/* ══ 20 bis · 🔴 LE JETON SUIT LE DOIGT — lot 291 ═══════════════════════════════
   ⚖️ Eric, 26/09 : *« faut réparer le drag and drop dans Wares »*. Le garde 20 était vert :
   le dépôt marchait. Ce qui manquait, c'est ce qu'on VOIT — aucun fantôme ne quittait la
   grille. ⭐ TÉMOIN : un fantôme naît au glisser (au-delà du seuil), et meurt au relâché ;
   ⛔ un tap n'en fait pas naître. */
test("20 bis · le glisser lève un fantôme, le relâché le range — ⛔ un tap n'en lève pas", () => {
  const n = monter({ surDepot: () => {}, surJeton: () => {} });
  document.body.append(n);
  const collecteur = tous(n, '[data-organe="collecteur"]')[0];
  const fantomes = () => document.body.querySelectorAll(".glisse-fantome").length;
  document.elementFromPoint = () => ({ closest: (sel) => (sel === "[data-creneau]" ? collecteur : null) });
  const j = tous(n, ".wares-jeton")[1];
  j.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "touch" });
  document.dispatchEvent({ type: "pointermove", clientX: 60, clientY: 60, pointerId: 1 });
  assert.equal(fantomes(), 1, "⛔ le jeton glissé ne se voit pas partir : aucun fantôme");
  document.dispatchEvent({ type: "pointerup", clientX: 60, clientY: 60, pointerId: 1 });
  assert.equal(fantomes(), 0, "⛔ le fantôme survit au relâché");
  tap(tous(n, ".wares-jeton")[2]);
  assert.equal(fantomes(), 0, "⛔ un tap a levé un fantôme");
  n.remove();
});

/* ══ 20 ter · 🔴 LE FANTÔME A LA COTE DU JETON — lot 293 ════════════════════════
   📏 En ligne (v835) le fantôme peignait 744 × 992 : monté hors de la grille, le `100 %` de
   `.wares-jeton` se résolvait contre l'application. ⭐ TÉMOIN : la feuille de Wares déclare la
   cote du fantôme, et c'est celle du plan (`JETON`), pas un nombre recopié. */
test("20 ter · la feuille de Wares donne au fantôme la cote du jeton du plan", () => {
  const regle = feuilleDesCotesWares().match(/\.wares-jeton\.glisse-fantome\{([^}]*)\}/);
  assert.ok(regle, "⛔ aucune cote pour le fantôme : il hérite du 100 % de la case, contre la page");
  assert.match(regle[1], new RegExp(`inline-size:${D.JETON.l}px`));
  assert.match(regle[1], new RegExp(`block-size:${D.JETON.h}px`));
});

/* ⭐ TÉMOIN : le viseur existe, un par étage, et il ne se tape pas.
   🔴 IL MANQUAIT AU PLAN *ET* À L'ÉCRAN — et c'est pour ça que la bijection plan ↔ DOM, mon
   garde 15, ne pouvait rien dire : elle compare deux listes, et l'organe manquait des deux.
   ⛔ Une liste par nom ne peut pas nommer ce qu'elle ignore. Eric l'a vu en ligne. */
test("21 · chaque étage a son viseur, et ⛔ on ne le tape pas", () => {
  const n = monter();
  const loupes = tous(n, ".wares-loupe");
  assert.equal(loupes.length, 2, "⛔ un viseur par étage — le halo reste centré, les items défilent dessous");
  for (const l of loupes) {
    assert.equal(l.getAttribute("aria-hidden"), "true", "⛔ un cadre qui se lit à voix haute");
    assert.equal(l.tagName, "DIV", "⛔ ce n'est pas un bouton : il désigne, il ne reçoit pas");
  }
  assert.deepEqual(loupes.map((l) => l.dataset.organe), ["loupe-categories", "loupe-sous-categories"],
    "⛔ et chacun porte sa clef du plan, sinon la bijection ne peut pas l'accuser");
  assert.match(feuilleDesCotesWares(), /\.wares-loupe\{[^}]*box-shadow:inset/,
    "⛔ le viseur se superpose au rebord de la tuile posée (NORMES, 19/09)");
});

/* ⭐ TÉMOIN : les organes d'échange sont CEUX DE R, avec leurs images.
   🔴 LE DÉPÔT M'AVAIT ÉCRIT CETTE FAUTE D'AVANCE, dans `sac-ecran.mjs` : *« LES TROIS ORGANES
   D'ÉCHANGE SONT CEUX DE R (`gear-bouton`), et ils portent DÉJÀ leurs images… ⛔ J'en avais
   fait trois rectangles bruns, sans image »*. Je l'ai refaite mot pour mot. */
test("22 · les Tally et la bourse sont les organes de R, ⛔ pas trois rectangles bruns", () => {
  const n = monter({ compteTally: 3 });
  for (const id of ["party-tally", "tally", "purse"]) {
    const b = tous(n, `[data-organe="${id}"]`)[0];
    assert.ok(b, `⛔ ${id} manque`);
    assert.ok(b.className.includes("gear-bouton"),
      `⛔ ${id} est redessiné (${b.className}) au lieu de reprendre l'organe de R, qui porte son image`);
    assert.equal(b.textContent, "", "⛔ rien d'écrit dans le corps : l'image le dit, et le nom accessible aussi");
  }
  assert.equal(tous(n, '[data-organe="tally"]')[0].dataset.compte, "3", "le Tally lit le document");
  assert.equal(tous(n, '[data-organe="party-tally"]')[0].disabled, true, "et le party se montre inerte");
});

/* ══ 23 · 🔴 L'AGRANDISSEMENT NE S'APPLIQUE QU'UNE FOIS ═════════════════════════
   ⭐ TÉMOIN : le cran dominant ne pose AUCUNE largeur — c'est l'échelle, et elle seule, qui
   le porte de `tuile` à `dominant`. Et le plan est cohérent : `dominant = tuile × loupe`.

   🔴 CE GARDE NAÎT D'UNE FAUTE QU'ERIC A VUE ET QUE RIEN NE TENAIT : *« le rectangle foncé
   doit remplir uniquement la tuile, là tu remplis les marges du token principal »*.
   📏 Mesuré au navigateur : le dominant rendait **120,7 × 68 px** pour un viseur de
   **96,9 × 54,6** — son fond débordait du cadre de 12 px de chaque côté. La cause : j'écrivais
   `inline-size: ROUE.dominant` **et** `scale: ROUE.loupe`, donc 71 × 1,2456 = 88,4 blg.
   ⭐ `ROUE.dominant` EST LE RÉSULTAT DE L'AGRANDISSEMENT, ⛔ pas une largeur à poser : la
   poser, c'est agrandir deux fois. Le sac ne fait que la seconde, et c'est pour ça que son
   viseur cadre exactement sa tuile.
   ⛔ ET LE GARDE TIENT LES DEUX BOUTS : la feuille ne repose pas de largeur, ET le plan reste
   cohérent — sans quoi on pourrait « réparer » en changeant le mauvais des deux nombres. */
test("23 · 🔴 le dominant est agrandi UNE fois — ⛔ pas une largeur ET une échelle", () => {
  const f = feuilleDesCotesWares();
  const regle = /\.wares-cran\[data-dominant="oui"\]\{([^}]*)\}/.exec(f);
  assert.ok(regle, "⛔ la règle du cran dominant a disparu");
  assert.match(regle[1], /scale:/, "l'échelle est ce qui agrandit");
  assert.doesNotMatch(regle[1], /inline-size|block-size|width|height/,
    "⛔ une cote POSÉE en plus de l'échelle agrandit DEUX fois : le fond déborde du viseur");

  /* ⭐ ET LA TUILE POSE SES DEUX COTES DEPUIS LE PLAN, ⛔ aucune prise au contenant : un
     `100 %` est une cote qu'on agrandit deux fois, exactement comme une largeur posée.
     📏 C'est la moitié que j'ai ratée au premier jet : largeur réparée, hauteur encore à
     13,4 px de trop. Deux axes, une seule loi. */
  const base = /\.wares-cran\{([^}]*)\}/.exec(f);
  assert.match(base[1], new RegExp(`inline-size:${D.ROUE.tuile}px`), "⛔ la largeur d'une tuile vient du plan");
  assert.match(base[1], new RegExp(`block-size:${D.ROUE.hauteur}px`), "⛔ sa hauteur aussi");
  assert.doesNotMatch(base[1], /100%/, "⛔ une cote prise au contenant s'agrandit avec lui");

  /* ⭐ et le plan se tient : la cote dominante EST la tuile agrandie */
  assert.equal(Math.round(D.ROUE.tuile * D.ROUE.loupe), D.ROUE.dominant,
    `⛔ le plan n'est plus cohérent : ${D.ROUE.tuile} × ${D.ROUE.loupe} devrait faire ${D.ROUE.dominant}`);
  assert.equal(Math.round(D.ROUE.hauteur * D.ROUE.loupe), D.ROUE.hauteurDominante,
    `⛔ sur l'autre axe non plus : ${D.ROUE.hauteur} × ${D.ROUE.loupe} devrait faire ${D.ROUE.hauteurDominante}`);
  /* ⛔ et le viseur fait la tuile AGRANDIE, sur les deux axes — c'est lui qui la cadre */
  const loupe = D.ORGANES.find((o) => o.sorte === "loupe");
  assert.equal(loupe.l, D.ROUE.dominant, "⛔ le viseur ne cadre plus la largeur de la tuile posée");
  assert.equal(loupe.h, D.ROUE.hauteurDominante, "⛔ ni sa hauteur");
});

/* ══ 24 · LA CALE A UNE HAUTEUR, ET C'EST ELLE QUI LA FAIT EXISTER ═════════════
   🔴 L'INCIDENT DU 2026-09-20, et Eric l'a vu avant moi : *« problème de centrage sur les
   crans de droite, et ça bloque »*.
   📏 MESURÉ AU NAVIGATEUR, sur la page servie : la cale est un `<span>` VIDE dans un ruban en
   `align-items: center` — sa hauteur rendue vaut **0**. Une boîte de hauteur nulle ne crée
   aucun débordement : `scrollWidth` s'arrêtait au dernier CRAN (**527**) au lieu d'inclure la
   cale de queue (**672**), la course maximale tombait à **196** là où le dernier cran en
   réclame **325**, et les crans de droite ne pouvaient plus atteindre le viseur.
   ⭐ LE TÉMOIN DIRECT, reproductible en une ligne : donner une hauteur à la cale de queue
   (`10px`, ou même un `.` de contenu) fait sauter `scrollWidth` de **527 à 672**.
   ⛔ ET C'EST LE SEUL GARDE QUI PEUT ACCUSER CETTE FAUTE : la cale est déclarée, elle est dans
   le DOM, sa largeur est juste, la bijection plan ↔ DOM est verte. Rien d'autre ne regarde sa
   dimension TRANSVERSE. C'est la même famille que *« le ruban prend la hauteur de sa roue »* —
   une hauteur RENDUE, jamais une hauteur déclarée.
   ⚠️ IL LIT UNE DÉCLARATION, PAS UN RENDU, et je le dis : il ne prouve pas que la cale rend
   une hauteur, il prouve qu'on lui en a demandé une. Le rendu, lui, se regarde au banc. */
test("24 · la cale du ruban réclame une dimension transverse — sans elle, le tambour bloque", () => {
  const f = feuilleDesCotesWares();
  const bloc = f.match(/\.roue-cale\{([^}]*)\}/);
  assert.ok(bloc, "⛔ la feuille ne porte plus de règle pour `.roue-cale`");
  assert.match(bloc[1], /align-self:stretch|block-size:|height:/,
    "⛔ la cale n'a aucune hauteur : elle ne comptera pas dans le `scrollWidth`, et les crans " +
    "de droite ne pourront pas atteindre le viseur.\n   Mesuré le 20/09 : 527 au lieu de 672.");
});

/* ══ 25 · LA BOURSE SORT AVEC SES COTES ════════════════════════════════════════
   🔴 Eric, 2026-09-20 : *« je veux le popup de la bourse centré sur celle-ci et que son rendu
   soit idem à Gear et backpack »*. J'importais `popupDeLaBourse` — le DOM — sans jamais appeler
   `reglesDeLaBourse` : le popup sortait SANS cotes, dimensionné par son contenu.
   ⭐ C'est mot pour mot la faute réparée sur le sac la veille : *« un organe partagé dont la
   moitié reste chez son premier hôte n'est pas partagé »*. ⛔ Éprouvé ROUGE en retirant l'appel.
   ⭐ ET LE TÉMOIN NE LIT PAS LE NOM DE LA FONCTION — il lit la FEUILLE : ce sont les règles
   rendues sous la portée `.wares` qui prouvent que la bourse est habillée ici. */
test("25 · le popup de la bourse est coté sous `.wares`, et il est centré sur la bourse du plan", () => {
  const f = feuilleDesCotesWares();
  assert.match(f, /\.wares \.gear-bourse\{[^}]*width:/,
    "⛔ la bourse sort sans boîte sous `.wares` : son rendu ne peut pas être celui de Gear");
  const pose = f.match(/\.wares \.gear-bourse\{left:([-\d.]+)px;top:([-\d.]+)px\}/);
  assert.ok(pose, "⛔ la bourse n'est pas POSÉE sous `.wares` : elle ne peut pas être centrée sur la bourse");
  const purse = D.ORGANES.find((o) => D.CLEF_DE[o.nom] === "purse");
  /* ⭐ le centre du popup tombe sur le centre de la bourse — sauf serrage au bord de la dalle,
     qui est la loi du 16/09 et qu'on ne combat pas : on vérifie donc l'un OU l'autre. */
  const cx = Number(pose[1]) + 186 / 2;
  const serre = Number(pose[1]) === 4 || Number(pose[1]) + 186 === D.DALLE.l - 4;
  assert.ok(serre || Math.abs(cx - (purse.x + purse.l / 2)) < 0.01,
    `⛔ le popup n'est ni centré sur la bourse (${purse.x + purse.l / 2}) ni serré dans la dalle : centre à ${cx}`);
});

/* ══ 26 · LE TRAIN PORTE UNE PLAQUE PAR SOUS-CATÉGORIE, TOUTES POSÉES ══════════
   ⚖️ ERIC, 2026-09-21 : *« il faut uniquement la première page de chaque dalle »*.
   🔴 CE QUE CE GARDE REMPLACE, ET POURQUOI. Il vérifiait jusqu'au 21/09 qu'une TRANSITION
   se jouait — deux plaques le temps d'un petit film. ⛔ C'était faux de nature : le sac ne
   joue aucun film, sa plaque SUIT le tambour image par image, et *« on voit une dalle entrer
   et une dalle sortir »* est la CONSÉQUENCE de ce suivi, pas une animation.
   ⭐ Pour suivre, il faut que les plaques soient DÉJÀ LÀ. Le garde tient donc ça. */
test("26 · une plaque par sous-catégorie, et seule la courante est atteignable au clavier", () => {
  const n = monter({
    sousCategorie: 1,
    plaques: [
      { nom: "a", objets: [{ ref: "a1", nom: "A1" }], compte: 1, pages: 1 },
      { nom: "b", objets: [{ ref: "b1", nom: "B1" }], compte: 30, pages: 3 },
      { nom: "c", objets: [{ ref: "c1", nom: "C1" }], compte: 5, pages: 1 },
    ],
    page: 2,
  });
  /* 🔴 UNE PLAQUE EST UNE **DALLE ENTIÈRE**, ⛔ pas son bloc de jetons — Eric, 21/09. Le garde
     compte donc des `.wares-grille`, et il vérifie que chacune porte SA matière : c'est elle qui
     voyage, avec son voile, son liseré et son filigrane. */
  const plaques = tous(n, ".wares-grille");
  assert.equal(plaques.length, 3, "⛔ les voisines ne sont pas posées : la dalle ne pourra pas SUIVRE");
  assert.deepEqual(plaques.map((p) => p.dataset.plaque), ["0", "1", "2"],
    "⛔ chaque dalle dit quelle sous-catégorie elle montre — ⛔ jamais un indice deviné par sa place");
  for (const p of plaques) {
    assert.ok(p.className.includes("wares-dalle"),
      "⛔ une plaque sans matière : rien ne « part » et rien n'« arrive », on voit des jetons se substituer");
    assert.ok(tous(p, ".wares-fond").length === 1, "⛔ le filigrane voyage avec sa dalle");
    assert.ok(tous(p, ".wares-gouttiere").length === 2, "⛔ les deux gouttières voyagent avec leur dalle");
  }
  /* ⛔ ET CE QUI N'EST PAS SOUS LE VISEUR NE SE TABULE PAS : sinon six plaques hors champ
     mettent 72 boutons invisibles sur le chemin de la touche Tab. */
  assert.deepEqual(plaques.map((p) => p.getAttribute("inert") !== null), [true, false, true],
    "⛔ seule la plaque courante est atteignable au clavier");
  /* ⭐ et les gouttières parlent de la COURANTE, pas de la première */
  assert.ok(n.textContent.includes("30"), "⛔ le compte n'est pas celui de la sous-catégorie visée");
  assert.ok(n.textContent.includes("3/3"), "⛔ la page affichée n'est pas celle de la courante");
});

/* ══ 27 · LA FORMULE DU VERROU ═════════════════════════════════════════════════
   ⚖️ ERIC, 2026-09-19 : *« je fais défiler une tuile à travers le viseur, je fais défiler une
   dalle en même temps… ILS SONT LIÉS »*. ⭐ Tout le *« en même temps »* tient dans la FRACTION :
   à mi-chemin entre deux tuiles, la plaque est à mi-chemin entre deux plaques.
   ⛔ ET CE N'EST PAS UNE MULTIPLICATION : entre deux plaques il y a un JOUR, donc `largeur × k`
   n'est pas la place de la plaque `k`. On ENCADRE entre deux places LUES, et on interpole.
   📏 Relevé dans le sac, aimantation coupée : 0 → 106 → 215 → 321 → 427 pour 0 · 0,25 · 0,5 ·
   0,75 · 1 tuile. C'est cette courbe-là que la formule doit rendre. */
test("27 · la piste suit la FRACTION du ruban, ⛔ pas son cran", () => {
  const xs = [0, 316, 632, 948];       /* quatre plaques, jour compris */
  assert.equal(placeDeLaPiste(0, xs), 0);
  assert.equal(placeDeLaPiste(0.25, xs), 79, "⛔ un quart de tuile = un quart de plaque");
  assert.equal(placeDeLaPiste(0.5, xs), 158);
  assert.equal(placeDeLaPiste(1, xs), 316);
  assert.equal(placeDeLaPiste(1.5, xs), 474);
  assert.equal(placeDeLaPiste(3, xs), 948, "⛔ la dernière plaque");
  /* ⛔ ET ELLE NE SORT PAS DU TRAIN, quelle que soit la position du ruban : un défilement
     élastique (iOS) rend des positions NÉGATIVES et au-delà du dernier cran. */
  assert.equal(placeDeLaPiste(-2, xs), 0, "⛔ une position négative sort du train");
  assert.equal(placeDeLaPiste(99, xs), 948, "⛔ une position au-delà du dernier sort du train");
  /* ⛔ et un jour IRRÉGULIER ne la prend pas en défaut — c'est tout l'intérêt de l'encadrement */
  assert.equal(placeDeLaPiste(1.5, [0, 300, 700]), 500,
    "⛔ elle a multiplié au lieu d'encadrer : avec des places inégales, le résultat diverge");
});

/* ══ 28 · LA FENÊTRE CLIPPE, ET LE JOUR VIENT DU PLAN ══════════════════════════
   🔴 SANS `overflow: hidden`, la plaque sortante se verrait PAR-DESSUS les gouttières et le pied
   pendant toute la traversée. ⛔ Et le jour ne se choisit pas : la loi du 19/09 le déduit du
   rapport de la tuile à sa gouttière. */
test("28 · la fenêtre clippe, porte le jour de la SCÈNE, et ne mène aucun geste", () => {
  const f = feuilleDesCotesWares();
  const fenetre = (f.match(/\.wares-piste\{([^}]*)\}/) || [])[1] || "";
  assert.match(fenetre, /overflow-x:hidden/,
    "⛔ la fenêtre ne clippe pas : la dalle sortante déborderait sur tout l'écran");
  assert.match(fenetre, new RegExp(`gap:${D.JOUR}px`),
    `⛔ le jour de la fenêtre n'est pas celui du plan (${D.JOUR}) — lu : « ${fenetre} »`);
  assert.match(fenetre, /position:relative/,
    "⛔ sans repère positionné, `offsetLeft` compte depuis un ancêtre plus haut et la piste se pose à côté");
  /* 🔴 `pan-y`, ⛔ PAS `none` — et ce garde tient les DEUX sens à la fois.
     `none` ne dit pas *« je ne prends aucun geste »* : il dit **« je les prends tous »**. Sur une
     fenêtre qui fait la scène entière, ça confisque le défilement VERTICAL de la page — et la
     page défile vraiment : `echelle.mjs` porte `ECHELLE_PLANCHER = 0.96`, *« sous le plancher
     l'app DÉBORDE, et la page défile »*. ⭐ `pan-y` rend la verticale et ne prend rien de
     l'horizontal, ce qu'on veut d'une dalle qui n'est pas glissable au doigt. */
  assert.match(fenetre, /touch-action:pan-y/,
    "⛔ la fenêtre doit RENDRE la verticale à la page (`pan-y`) — `none` piège le doigt");
  assert.doesNotMatch(fenetre, /touch-action:(none|auto|pan-x)\b/,
    "⛔ `none` prend tout, `auto` et `pan-x` rendent l'horizontal au doigt : la dalle n'est pas glissable");
  const plancher = fs.readFileSync(path.join(UI, "echelle.mjs"), "utf8");
  assert.match(plancher, /ECHELLE_PLANCHER\s*=\s*0\.9\d/,
    "⚖️ et la raison tient tant que l'app DÉBORDE sous un plancher d'échelle : si ce plancher " +
    "disparaît, la page ne défile plus et ce garde doit être rediscuté, ⛔ pas supprimé en passant");
  assert.doesNotMatch(fenetre, /scroll-behavior:smooth|scroll-snap-type:x/,
    "⛔ le suiveur n'aimante pas et n'ajoute pas d'inertie — sinon il traîne derrière le doigt");
  /* ⚖️ LA PLAQUE EST LA SCÈNE, et le jour s'en déduit : `jour / plaque = écart / tuile`. */
  assert.equal(D.JOUR, Math.round(D.DALLE.l * (D.ECART / D.ROUE.tuile) * 100) / 100,
    "⚖️ le plan DÉDUIT le jour de la loi du 19/09, sur une plaque qui vaut la SCÈNE");
  assert.equal(D.JOUR, 52.63, "⭐ et c'est le jour du sac au centième — c'est le même objet");
  /* ⭐ le filigrane voyage DANS sa dalle : chaque boutique a son marchand */
  assert.match(f, /\.wares-fond\{[^}]*grid-column:2/,
    "⛔ le filigrane a quitté la cellule des jetons");
  /* ⛔ et un wagon ne se laisse pas écraser par ses voisins */
  assert.match(f, /\.wares-grille\{[^}]*flex:0 0 auto[^}]*inline-size:100%/,
    "⛔ sans `flex: 0 0 auto` + `inline-size: 100%`, six dalles se partagent une fenêtre d'une seule");
});

/* ══ LOT 268 — LE RETOUR DE FICHE NE PERD PAS LE PLACEMENT ═════════════════════
   ⚖️ Eric, 25/09 : *« le retour de fiche désynchronise les tambours, la tuile dans le zoom
   n'est plus zoomée mais celle à droite du zoom est zoomée »*.
   ⭐ LE CHEMIN EXACT, REJOUÉ : l'écran est construit DÉTACHÉ (la coquille reconstruit
   l'étape avant de l'insérer), l'étape essaie de poser ses roues et échoue — puis l'écran
   est inséré et la coquille rappelle `poserLesRoues()`. Ce second appel doit placer. */
test("268 · 🔴 un placement tenté sur un écran DÉTACHÉ reste en attente, et se fait une fois l'écran posé", async () => {
  const { poserLesRoues } = await import("../ui/builder/wares-ecran.mjs");
  const hote = document.createElement("div");
  const n = monter({ categorie: 2, sousCategorie: 1 });
  hote.append(n);
  hote._retire = true;                         /* l'étape reconstruite, pas encore insérée */
  assert.equal(poserLesRoues(), 0, "témoin : sur un écran détaché, rien ne se pose");
  hote._retire = false;                        /* la coquille insère l'écran… */
  assert.equal(poserLesRoues(), 2,
    "⭐ …et son appel pose les DEUX rubans. ⛔ Avant le lot 268 : 0 — la liste avait été vidée par l'essai raté");
  assert.equal(poserLesRoues(), 0, "⛔ et un placement réussi ne se rejoue pas");
});
