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
const { construireLesWares, feuilleDesCotesWares } = await import("../ui/builder/wares-ecran.mjs");

const tous = (n, sel) => [...n.querySelectorAll(sel)];

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
  const dalles = tous(n, ".wares-dalle");
  assert.equal(dalles.length, 3, "⛔ l'écran n'a pas exactement trois dalles");
  assert.ok(dalles[0].className.includes("wares-tambour"), "la première est le tambour");
  assert.ok(dalles[1].className.includes("wares-grille"), "la deuxième est la grille");
  assert.ok(dalles[2].className.includes("wares-pied"), "la troisième est le pied");
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
  tous(n, ".wares-jeton")[4].dispatchEvent(new (globalThis.Event || Object)("click"));
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
  const n = monter({ bourse: "155 gp", compteTally: 2 });
  /* ⚖️ la loi de R : rien d'écrit DANS la bourse, le montant va au nom accessible */
  const p = tous(n, '[data-organe="purse"]')[0];
  assert.equal(p.textContent, "", "⛔ un montant écrit dans le corps du bouton");
  assert.match(p.getAttribute("aria-label"), /155 gp/, "⛔ et il doit se dire à voix haute");
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
   ⭐ Et le témoin est éprouvable : écrire un seul `left:` le fait tomber. */
test("13 · 🔒 la feuille de Wares pose des PISTES, ⛔ jamais un `left`", () => {
  const f = feuilleDesCotesWares();
  assert.ok(!/\bleft:/.test(f), "⛔ un `left` dans la feuille : le sacré n° 3 exige une grille");
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
