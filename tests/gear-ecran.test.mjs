/* ══ LE GARDE DE L'ÉCRAN R (Gear) — lot 212, 2026-09-16 ═══════════════════════

   🔴 CE QU'IL DÉFEND : que la disposition posée au dépôt soit BIEN la table
   générée (`Plan-ecran-R/R_cotes.json` → `R_declaration.js`), et que cette
   table tienne les lois du 15/09 — la dalle, la marge, les deux gouttières,
   le jeton des tokens, le plancher des cibles, aucun chevauchement, le budget
   vertical fermé. Les neuf gardes du générateur sont en Python, dans le vault :
   ils ne tournent pas ici. Ceux-ci sont leur écho en `node:test`, pour que
   `npm test` rougisse le jour où quelqu'un retouche un nombre à la main.

   ⛔ SA LIMITE : il lit la table et le DOM du stub. Il ne mesure aucun rendu —
   la preuve en blg (`getBoundingClientRect() ÷ --echelle`) se prend au
   navigateur, et elle est dans le rapport du lot. */

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
const D = await import("../ui/builder/gear-disposition.mjs");
const { construireLEcranGear, feuilleDesCotes, CLEF_DE, DESTINATIONS, libelleDe } =
  await import("../ui/builder/gear-ecran.mjs");
const { BOITES, SLOT_VERS_BOITES } = await import("../ui/builder/b3-disposition.mjs");
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "gear-cotes.json"), "utf8"));
const tokens = stripComments(fs.readFileSync(path.join(UI, "tokens.css"), "utf8"));
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));

const { DALLE, BELT_H, MARGE, TOUCH, JETON, ORGANES, LIGNES, BARRE } = D;
const jetons = ORGANES.filter((o) => o.sorte === "jeton");
const dessins = ORGANES.filter((o) => o.creation !== false);   // les lunes : `creation: false` au plan
const rect = (o) => ({ x: o.x, y: o.y, l: o.l, h: o.h });
const cibleDe = (o) => (o.cible ? { x: o.cible.x, y: o.cible.y, l: o.cible.l, h: o.cible.h } : rect(o));
const secants = (a, b) => a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;
/* ⚖️ LA SEULE INCLUSION ADMISE : un voyant `dans` un bouton (le MONTANT sur la
   bourse, Eric 16/09 soir). Ce n'est pas un chevauchement, c'est une inclusion,
   et elle se VÉRIFIE : la boîte tient entièrement dans son hôte. Tout autre
   croisement rougit. (Le gel du 17/09 — MONTANT mordait TORSO/BACK 3 — est
   levé par la descente de la bourse : plus d'exception nommée.) */
const hote = (a, b) => (a.dans === b.nom ? b : b.dans === a.nom ? a : null);
const contenu = (d, h) => h.x <= d.x && h.y <= d.y && d.x + d.l <= h.x + h.l && d.y + d.h <= h.y + h.h;

/* ══ 1 — LA DÉCLARATION EST LA TABLE, PAS UNE COPIE QUI DÉRIVE ═══════════ */

test("1 — la déclaration posée au dépôt EST la table du plan (mêmes organes, mêmes cotes)", () => {
  const parNom = Object.fromEntries(TABLE.boites.map((b) => [b.nom, b]));
  assert.equal(ORGANES.length, TABLE.boites.length, "même compte d'organes que la table");
  for (const o of ORGANES) {
    const t = parNom[o.nom];
    assert.ok(t, `« ${o.nom} » est dans la déclaration mais pas dans la table`);
    for (const k of ["x", "y", "l", "h", "sorte"]) assert.equal(o[k], t[k], `${o.nom}.${k}`);
  }
  assert.deepEqual([DALLE.l, DALLE.h, BELT_H, MARGE, TOUCH], [TABLE.dalle.l, TABLE.dalle.h, TABLE.belt, TABLE.marge, TABLE.touch]);
  assert.deepEqual(LIGNES, TABLE.Y);
});

test("1 bis — le jeton de la déclaration EST celui des tokens, et la cible est `--touch`", () => {
  const [, caseL] = tokens.match(/--glisse-case:\s*(\d+)px/) || [];
  const [, caseH] = tokens.match(/--glisse-h:\s*(\d+)px/) || [];
  const [, touche] = tokens.match(/--touch:\s*(\d+)px/) || [];
  assert.equal(JETON.l, Number(caseL)); assert.equal(JETON.h, Number(caseH));
  assert.equal(TOUCH, Number(touche));
  for (const j of jetons) assert.deepEqual([j.l, j.h], [JETON.l, JETON.h], `${j.nom} n'est pas un jeton 87 × 48`);
});

/* ══ 2 — LES LOIS DU PLAN ══════════════════════════════════════════════════ */

test("2 — rien à moins de 4 d'un bord, et rien hors de la dalle (les dessins)", () => {
  for (const o of dessins) {
    assert.ok(o.x >= MARGE && o.y >= BELT_H + MARGE && o.x + o.l <= DALLE.l - MARGE && o.y + o.h <= DALLE.h - MARGE,
      `⛔ ${o.nom} mord la marge : ${o.x},${o.y} ${o.l}×${o.h}`);
  }
});

test("2 bis — les huit rangées ne sont séparées que par 4 ou 8, et le budget vertical est fermé à 560", () => {
  for (let i = 0; i + 1 < LIGNES.length; i++) {
    const ecart = LIGNES[i + 1] - (LIGNES[i] + JETON.h);
    assert.ok(ecart === 4 || ecart === 8, `rangée ${i + 1} → ${i + 2} : écart ${ecart}`);
  }
  assert.equal(LIGNES[0], BELT_H + MARGE, "la première rangée colle au belt, à la marge près");
  assert.equal(BARRE.y - (LIGNES[7] + JETON.h), 8, "8 entre la dernière rangée et la barre");
  assert.equal(BARRE.h, TOUCH, "la barre vaut la cible");
  /* 12 sous la barre = 8 sous la rangée (§6 pré) + les 4 de marge de la dalle */
  assert.equal(DALLE.h - (BARRE.y + BARRE.h), 8 + MARGE);
});

test("2 ter — aucun dessin n'en chevauche un autre, aucune cible non plus, et toute cible atteint 44 dans les deux sens", () => {
  for (let i = 0; i < dessins.length; i++) for (let j = i + 1; j < dessins.length; j++) {
    const h = hote(dessins[i], dessins[j]);
    if (h) { const d = h === dessins[i] ? dessins[j] : dessins[i]; assert.ok(contenu(d, h), `${d.nom} sort de son hôte ${h.nom}`); continue; }
    assert.ok(!secants(rect(dessins[i]), rect(dessins[j])), `dessins sécants : ${dessins[i].nom} × ${dessins[j].nom}`);
    assert.ok(!secants(cibleDe(dessins[i]), cibleDe(dessins[j])), `cibles sécantes : ${dessins[i].nom} × ${dessins[j].nom}`);
  }
  for (const o of dessins) {
    if (o.sorte === "jeton") continue;    // un jeton est plus grand que la cible dans les deux sens (48 > 44 ; 87 > 44)
    if (o.sorte === "voyant") continue;   // un voyant se lit, il n'a AUCUNE cible (artefact 15/09)
    const c = cibleDe(o);
    assert.ok(c.l >= TOUCH && c.h >= TOUCH, `⛔ ${o.nom} : cible ${c.l} × ${c.h} sous le plancher 44`);
    /* et la cible CONTIENT le dessin */
    assert.ok(c.x <= o.x && c.y <= o.y && c.x + c.l >= o.x + o.l && c.y + c.h >= o.y + o.h, `${o.nom} : le dessin sort de sa cible`);
  }
});

test("2 quater — ⚔️ ATTAQUE : une cible de 40 rougirait", () => {
  const faux = { nom: "X", sorte: "bouton", x: 327, y: 236, l: 40, h: 40, cible: { x: 327, y: 234, l: 40, h: 44 } };
  const c = cibleDe(faux);
  assert.equal(c.l >= TOUCH && c.h >= TOUCH, false, "le plancher se voit bien sur la largeur aussi — c'est la faute que le plan portait");
});

/* ══ 3 — LA TABLE NOM → CLEF, ET LE DÉPÔT QUI LA PORTE ═════════════════════ */

test("3 — chaque organe posé a une clef, chaque clef est unique, et les emplacements existent au dépôt", () => {
  const clefs = [];
  for (const o of ORGANES) {
    /* ⚖️ HORS CRÉATION, MAIS PAS DE LA MÊME FAÇON — et la nuance est tout le sujet.
       Les quatre LUNES appartiennent à un autre écran (double vue, fiche) : elles
       n'ont pas de clef du tout, rien ici ne les connaît.
       Le GROUP TALLY, lui, appartient à CET écran mais à un autre MOMENT — Eric,
       16/09 : « n'apparaît que quand un des joueurs ou DM envoie vers le party
       inventory ». Il a donc une clef et une cote posée, et c'est la DONNÉE qui
       décide s'il se montre. ⛔ Lui refuser sa clef obligerait à le poser plus tard
       par une seconde règle écrite ailleurs — deux écrivains pour une place. */
    if (o.creation === false) {
      if (o.nom === "PARTY TALLY") {
        assert.equal(CLEF_DE[o.nom], "party-tally", "le Group Tally a sa clef : sa place est réservée");
        /* ⛔ SA CIBLE, PAS SON DESSIN : depuis qu'Eric a réduit les parchemins à 40
           (16/09 au soir), la règle pose la BOÎTE DE CIBLE et laisse des bords
           transparents porter l'écart. Comparer `o.x` ici aurait rougi pour la
           bonne raison — je l'ai écrit, et le garde me l'a dit. */
        assert.ok(feuilleDesCotes().includes(`[data-organe="party-tally"]{left:${cibleDe(o).x}px`), "et sa cote est posée d'avance");
        clefs.push(CLEF_DE[o.nom]);
        continue;
      }
      assert.equal(o.sorte, "lune", `${o.nom} : hors création, seules les lunes n'ont pas de clef`);
      assert.equal(CLEF_DE[o.nom], undefined, `${o.nom} ne doit pas être posée`);
      continue;
    }
    assert.ok(CLEF_DE[o.nom], `« ${o.nom} » n'a pas de clef`);
    clefs.push(CLEF_DE[o.nom]);
  }
  assert.equal(new Set(clefs).size, clefs.length, "deux organes se partagent une clef");
  const boites = new Set(BOITES.map((b) => b.clef));
  for (const j of jetons) {
    const clef = CLEF_DE[j.nom];
    if (["collecteur", "sol1", "sol2"].includes(clef)) continue;   // hors personnage : pas des boîtes du rangement
    assert.ok(boites.has(clef), `${j.nom} → ${clef} n'existe pas dans BOITES`);
  }
  assert.ok(SLOT_VERS_BOITES.torso.includes("torse3") && SLOT_VERS_BOITES.back.includes("torse3"),
    "la troisième boîte du torse reçoit torso et back");
});

test("3 bis — les libellés sont ceux du croquis : sans numéro, sans `opt`", () => {
  assert.equal(libelleDe("HEAD/FACE 1"), "HEAD/FACE");
  assert.equal(libelleDe("BODY FORGING opt"), "BODY FORGING");
  assert.equal(libelleDe("BELT"), "BELT");
  assert.equal(libelleDe("FOOT/LEG 2"), "FOOT/LEG", "Eric, 16/09 : « foot leg mieux » — au plan depuis");
  /* et le dépôt ne dit plus « Sheath » nulle part dans sa table */
  assert.ok(!BOITES.some((b) => /sheath/i.test(b.nom)), "« Sheath » est périmé (croquis du 15/09)");
});

/* ══ 4 — LA FEUILLE DES COTES : une règle par organe, les px de la table ════ */

test("4 — la feuille construite pose chaque organe à ses px du plan, sous le belt", () => {
  const css = feuilleDesCotes();
  for (const o of dessins) {
    const id = CLEF_DE[o.nom];
    if (o.sorte === "porte" || o.sorte === "rond") {
      assert.ok(!css.includes(`[data-organe="${id}"]`), `${o.nom} est placé par la grille de la rangée, pas par la feuille`);
      continue;
    }
    const m = css.match(new RegExp(`\\[data-organe="${id}"\\]\\{([^}]*)\\}`));
    assert.ok(m, `pas de règle pour ${o.nom}`);
    const boite = o.sorte === "jeton" ? rect(o) : cibleDe(o);
    assert.ok(m[1].includes(`left:${boite.x}px`), `${o.nom} : left`);
    assert.ok(m[1].includes(`top:${boite.y - BELT_H}px`), `${o.nom} : top ${boite.y - BELT_H}`);
    if (o.sorte === "jeton") assert.ok(!/width|height/.test(m[1]), "un jeton lit sa cote dans les tokens, pas dans la feuille");
    else assert.ok(m[1].includes(`width:${boite.l}px`) && m[1].includes(`height:${boite.h}px`), `${o.nom} : la boîte est la cible`);
  }
  const r = css.match(/\.gear > \.gear-rangee\{([^}]*)\}/);
  assert.ok(r && r[1].includes(`left:${MARGE}px`) && r[1].includes(`top:${BARRE.y - BELT_H}px`)
    && r[1].includes(`width:${DALLE.l - 2 * MARGE}px`) && r[1].includes(`height:${BARRE.h}px`), "la rangée est posée à BARRE");
});

test("4 bis — shell.css ne porte AUCUNE position de l'écran : les cotes sont dans la table", () => {
  const bloc = shell.slice(shell.indexOf(".gear {"), shell.indexOf(".gear-porte {"));
  assert.ok(bloc.length > 0, "le bloc de l'écran existe");
  assert.ok(!/\b(left|top)\s*:\s*\d*\.?\d+px/.test(bloc), "une position en dur dans shell.css serait une cote recopiée");
  assert.match(shell, /\.gear \{ --bouton-cran-serre: var\(--t2\); \}/, "l'exception du cran est nommée sur l'écran");
  /* les trois portes sont de la famille : corps, face et plancher les listent */
  for (const marque of [".gear-porte::before {", ".gear-porte::after {", ".gear-porte):not(.fiche-livre):not(.tuto-point) {"]) {
    assert.ok(shell.includes(marque), `la famille des boutons ne liste pas ${marque}`);
  }
});

/* ══ 5 — LE DOM : ce que l'écran rend ══════════════════════════════════════ */

function rendu(options) {
  return construireLEcranGear(options).noeud;
}
const tous = (n, sel) => [...n.querySelectorAll(sel)];

test("5 — l'écran rend chaque organe posé du plan, une fois, et pas les lunes", () => {
  const n = rendu({});
  const ids = tous(n, "[data-organe]").map((e) => e.dataset.organe);
  const attendus = dessins.filter((o) => o.sorte !== "porte" && o.sorte !== "rond").map((o) => CLEF_DE[o.nom]);
  /* le montant : de la table s'il y est, déduit de PURSE sinon — dans les deux cas rendu une fois */
  if (!ORGANES.some((o) => o.nom === "MONTANT")) attendus.push("montant");
  attendus.push("party-tally");   /* posé bien que `creation: false` : son voile dit qu'il est vide */
  assert.deepEqual(ids.sort(), attendus.sort());
  assert.equal(ORGANES.filter((o) => o.creation === false).length, 5, "les quatre lunes et le Party Tally sont au plan, hors création");
  /* ⚖️ LE GROUP TALLY EST TOUJOURS POSÉ, ET C'EST LE VOILE QUI DIT SON ÉTAT — Eric,
     16/09 au soir : *« tu l'as pas mis »*. Il avait raison : rien n'alimente encore
     `compteParty`, donc « conditionnel » voulait dire « jamais », et une place
     réservée que rien n'occupe n'est pas un organe, c'est un trou.
     ⛔ CE GARDE TENAIT LE CONTRAIRE ET IL AVAIT TORT AVEC MOI : il vérifiait
     l'absence, donc il aurait défendu la faute. Il tient maintenant la présence, et
     l'état se lit sur `data-compte` — que le voile à 20 % traduit à l'œil. */
  const pt = n.querySelector('[data-organe="party-tally"]');
  assert.ok(pt, "le Group Tally est posé, même vide — son voile dit qu'il est vide");
  assert.equal(pt.dataset.compte, "0");
  assert.equal(rendu({ compteParty: 0 }).querySelector('[data-organe="party-tally"]').dataset.compte, "0");
  assert.equal(rendu({ compteParty: 7 }).querySelector('[data-organe="party-tally"]').dataset.compte, "7");
  assert.match(rendu({ compteParty: 7 }).querySelector('[data-organe="party-tally"]').getAttribute("aria-label"), /^Party tally — 7 lines$/);
  /* et la feuille lui donne SON parchemin, pas celui du Tally personnel */
  assert.match(shell, /\[data-organe="party-tally"\]\s*\{\s*background-image:\s*var\(--icone-parchemin-party\)/);
  /* ⚖️ UN TALLY VIDE S'EFFACE AU LIEU DE S'ENTOURER — Eric, 16/09 au soir : « plutôt
     que de faire un halo… mets un voile à 10 % sur l'image ». ⛔ Et le halo ne doit
     pas revenir par une autre porte : il disait la même chose une seconde fois. */
  assert.match(shell, /\.gear-bouton\[data-organe="party-tally"\]\s*\{\s*opacity:\s*var\(--organe-eteint\)/);
  /* ⚖️ LE MÊME VOILE HABILLE L'EMPLACEMENT OPTIONNEL — Eric, 16/09 : « le body forging,
     mets-le à 20 %, idem », « l'optionnel uniquement ». ⛔ UN SEUL JETON POUR LES DEUX :
     deux nombres de même valeur auraient divergé au premier réglage. */
  assert.match(shell, /\.gear-emplacement\[data-optionnelle\]\s*\{\s*opacity:\s*var\(--organe-eteint\)/);
  assert.ok(!/opacity:\s*\.6/.test(shell.slice(shell.indexOf(".gear-emplacement[data-optionnelle]"))),
    "⛔ le .6 hérité d'un autre écran ne revient pas");
  assert.match(shell, /:not\(\[data-compte="0"\]\)\s*\{\s*opacity:\s*1\s*;?\s*\}/, "plein dès la première ligne");
  assert.match(tokens, /--organe-eteint:\s*\.\d+/, "le voile est un jeton, pas un littéral perdu dans la feuille");
  assert.ok(!/opacity:\s*var\(--organe-eteint\)[^}]*box-shadow/.test(shell), "⛔ le halo du tally est retiré, il ne revient pas");
  /* ⚖️ ET LE NOM D'UNE PLACE EN ATTENTE EST EN ITALIQUE, encre douce — Eric, 16/09 :
     « pour les emplacements et les collecteurs, idem ». ⭐ Une seule règle les tient
     tous les deux : `.gear-nom` est porté par l'emplacement vide ET par le collecteur. */
  assert.match(shell, /\.gear-nom\s*\{[^}]*font-style:\s*italic/);
  assert.match(shell, /\.gear-nom\s*\{[^}]*color:\s*var\(--text-soft\)/);
  assert.match(shell, /\.gear-nom\s*\{[^}]*font-size:\s*var\(--t1\)/);
  /* ⚖️ CENTRÉ DANS LES DEUX SENS, DONC SANS ENFANT VIDE — Eric, 16/09 au soir. Un
     `<span>` vide ne se voit pas mais compte dans le flex : le mot cessait d'être au
     milieu sans qu'on voie pourquoi. ⛔ Le vide ne se pose pas. */
  const vide = rendu({}).querySelector(".gear-collecteur");
  assert.equal(vide.children.length, 1, "un collecteur vide n'a QUE son nom");
  assert.equal(vide.children[0].className, "gear-nom");
  /* ⚠️ LE CAS DÉGRADÉ, ET IL EST NOMMÉ POUR NE PAS ÊTRE PRIS POUR LA RÈGLE : une
     collecte qui désigne un index qu'aucune boîte ne porte. L'écran ne peut pas
     nommer ce qu'il ne trouve pas, alors il compte — plutôt que de mentir en se
     disant vide. ⛔ Le cas NORMAL est plus bas : le collecteur NOMME son objet. */
  const orphelin = rendu({ collecte: new Set(["introuvable"]) }).querySelector(".gear-collecteur");
  assert.equal(orphelin.children.length, 2, "à défaut de le nommer, il dit qu'il retient quelque chose");
  assert.equal(orphelin.children[1].textContent, "1 to send");
  /* et le mot du dropdown ne cède jamais sa place au select */
  assert.match(shell, /\.gear-destination-mot\s*\{\s*flex:\s*none/, "toujours visible, collé au haut");
  assert.match(tokens, /--icone-parchemin-party:\s*url\(/);
  /* 🔴 LES TROIS PORTES SONT DANS LE GROUPE DE LA COLONNE DU MILIEU — et c'est la
     rangée qui le pose, pas la coquille. ⛔ Eric l'a vu sur deux appareils le 16/09 :
     sans lui, la première porte prend tout le `1fr` (274 blg au lieu de 77) et les
     deux autres passent à la ligne. Le défaut n'apparaissait qu'APRÈS un geste, parce
     que `poserLesBornes` ne repasse qu'au montage — c'est pour ça que je ne le voyais
     pas en ouvrant l'écran. */
  const rang = n.querySelector(".gear-rangee");
  /* ⛔ pas `:scope >` : le DOM des tests ne le résout pas, et un garde qui rougit
     pour son propre sélecteur ne dit rien de l'écran. On lit les enfants. */
  const groupe = [...rang.children].find((e) => e.className === "rangee-majeurs");
  assert.ok(groupe, "la rangée porte son propre groupe, même sans la coquille");
  assert.deepEqual([...groupe.children].map((e) => e.dataset.porte), ["backpack", "send", "wares"],
    "les trois portes sont DANS le groupe, dans l'ordre du plan");
  assert.equal(tous(rang, ".gear-porte").length, 3, "trois portes dans la rangée");
  assert.equal(tous(n, ".gear-rangee").length, 1);
  assert.ok(n.querySelector(".gear-rangee").dataset.rangee, "la rangée déclare data-rangee (§6 pré, cinquième porte)");
  assert.equal(n.querySelector(".gear-rangee").children[0].className, "fiche-livre gear-livre", "le livre est la première borne");
  assert.ok(n.querySelector("style"), "la feuille des cotes est dans l'écran");
});

test("5 bis — un emplacement occupé porte l'objet, sa quantité et ses trois voyants — seul ⭕ s'allume", () => {
  const n = rendu({ boites: { tete1: { nom: "Winged helmet", qte: 2, index: 3, equipped: true } } });
  const e = n.querySelector('[data-organe="tete1"]');
  assert.equal(e.dataset.occupe, "oui");
  assert.equal(e.querySelector(".gear-nom"), null, "(b) Eric 16/09 : le nom du slot s'efface quand un objet est posé");
  assert.match(e.getAttribute("aria-label"), /^HEAD\/FACE — Winged helmet/, "…mais il reste dans le nom accessible");
  assert.match(e.querySelector(".gear-objet").textContent, /^Winged helmet/);
  /* la quantité suit le nom sur sa ligne (Eric, 16/09 : trois lignes au plus pour l'objet) */
  assert.equal(e.querySelector(".gear-objet .gear-qte").textContent, "×2");
  const etats = Object.fromEntries(tous(e, ".gear-voyant").map((v) => [v.dataset.voyant, v.dataset.etat]));
  assert.deepEqual(etats, { verrou: "non", equipe: "oui", harmonise: "non" });
  assert.equal(n.querySelector('[data-organe="tete2"]').dataset.occupe, undefined, "le voisin reste vide");
  /* Eric, 16/09 : la barre d'un libellé est un retour à la ligne (« weapons sous pocket ») */
  const nom = n.querySelector('[data-organe="tete2"]').querySelector(".gear-nom");
  assert.equal(nom.textContent, "HEAD/FACE");
  assert.equal(nom.querySelectorAll("wbr").length, 1, "la barre est une occasion de retour, pas un retour (« on superpose quand ça dépasse »)");
});

test("5 ter — les cibles de dépôt : tout emplacement VIDE et le collecteur VIDE (Eric, 16/09 : « dans tous les sens », « un item, pas 2 »)", () => {
  const vide = rendu({});
  const cibles = tous(vide, "[data-creneau]").map((c) => c.dataset.creneau).sort();
  const emplacements = jetons.map((j) => CLEF_DE[j.nom]).sort();   // 20 emplacements + le collecteur
  assert.deepEqual(cibles, emplacements, "vide, chaque emplacement est une cible, le collecteur aussi");
  assert.equal(vide.querySelector('[data-organe="collecteur"]').dataset.compte, "0");
  /* occupé, un emplacement n'est plus une cible — une case tient une chose */
  const porte = rendu({ boites: { tete1: { nom: "Helm", qte: 1, index: 3, equipped: true } } });
  assert.equal(porte.querySelector('[data-organe="tete1"]').dataset.creneau, undefined, "occupé : plus une cible");
  assert.equal(porte.querySelector('[data-organe="tete1"]').dataset.occupe, "oui");

  /* ⚖️ COLLECTÉ, L'OBJET A QUITTÉ SA BOÎTE — Eric, 16/09 au soir : « il doit quitter
     l'emplacement et rester dans le collecteur ». ⛔ CE GARDE TENAIT LES DEUX CAS POUR
     UN SEUL et défendait donc l'ancien mensonge : la boîte restait « occupée » alors
     que son objet était ailleurs, et on voyait la même chose à deux endroits.
     ⭐ La place redevient VIDE, donc une CIBLE : on peut y reposer autre chose. */
  const plein = rendu({ boites: { tete1: { nom: "Helm", qte: 1, index: 3, equipped: true } }, collecte: new Set([3]) });
  const boiteVidee = plein.querySelector('[data-organe="tete1"]');
  assert.equal(boiteVidee.dataset.occupe, undefined, "la boîte n'est plus occupée : son objet est dans le collecteur");
  assert.equal(boiteVidee.dataset.creneau, "tete1", "et elle redevient une cible");
  assert.equal(boiteVidee.querySelector(".gear-nom").textContent, "HEAD/FACE", "elle redit son nom");

  const col = plein.querySelector('[data-organe="collecteur"]');
  assert.equal(col.dataset.occupe, "oui", "c'est le collecteur qui porte l'objet");
  assert.equal(col.querySelector(".gear-objet").textContent, "Helm", "et il le NOMME, il ne compte pas");
  assert.match(col.getAttribute("aria-label"), /^Send collector — Helm$/);
  assert.equal(col.dataset.creneau, undefined, "plein : le collecteur n'accepte pas un second objet");
  assert.equal(col.dataset.compte, "1");
  /* la quantité suit l'objet, comme dans une boîte */
  const parPaquet = rendu({ boites: { tete1: { nom: "Arrow", qte: 20, index: 7 } }, collecte: new Set([7]) });
  assert.equal(parPaquet.querySelector('[data-organe="collecteur"] .gear-qte').textContent, "×20");
});

test("5 ter bis — 🔴 shell.mjs porte le geste `placerGearLine` : la boîte choisie est un choix du personnage, le sol n'équipe pas", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  assert.ok(shellText.includes('action.kind === "placerGearLine"'), "le geste existe dans la coquille");
  assert.match(shellText, /gear\[\$\{action\.index\}\]\.boite/, "il écrit `gear[N].boite`");
  assert.match(shellText, /auSol \? "ground" : "self"/, "le sol est le troisième état : location « ground »");
  assert.match(shellText, /value: !auSol/, "…jamais équipé au sol (Eric : « tu portes pas, tu n'équipes pas »)");
});

test("5 quater — les portes et les boutons publient leur geste ; Companions et le livre sans cible sont `disabled`", () => {
  const gestes = [];
  const n = rendu({ surPorte: (p) => gestes.push(`porte:${p}`), surBouton: (b) => gestes.push(`bouton:${b}`),
    surDestination: (v) => gestes.push(`dest:${v}`), compteTally: 3 });
  for (const b of tous(n, ".gear-porte")) b.click();
  n.querySelector('[data-organe="purse"]').click();
  n.querySelector('[data-organe="tally"]').click();
  assert.deepEqual(gestes, ["porte:backpack", "porte:send", "porte:wares", "bouton:purse", "bouton:tally"]);
  assert.equal(n.querySelector('[data-organe="tally"]').dataset.compte, "3");
  assert.equal(n.querySelector('[data-organe="companions"]').disabled, true);
  assert.equal(n.querySelector('[data-organe="companions"]').className, "gear-porte", "Companions est un petit de la famille, pas un bouton à image");
  assert.equal(n.querySelector(".gear-livre").disabled, true);
  /* le dropdown : les quatre destinations de la création, deux encore fermées */
  const options = tous(n, "option");
  assert.deepEqual(options.map((o) => o.textContent), DESTINATIONS.map((d) => d.mot));
  assert.deepEqual(options.map((o) => o.disabled === true), DESTINATIONS.map((d) => !d.actif));
  /* ⚖️ LE MOT « destination » EST COLLÉ AU HAUT DE LA BOÎTE, PAS DANS LE SELECT —
     Eric, 16/09 au soir. ⛔ Un `<select>` ne rend que ses `<option>` : le mot vit
     donc dans la boîte qui porte l'organe, et le select la remplit. */
  const boite = n.querySelector('[data-organe="send-to"]');
  assert.equal(boite.tagName, "DIV", "l'organe du plan est la BOÎTE — c'est elle qui reçoit la cote");
  assert.equal(boite.children[0].className, "gear-destination-mot", "le mot vient EN PREMIER : c'est ce qui le colle au haut");
  assert.equal(boite.children[0].textContent, "destination");
  assert.equal(boite.children[0].getAttribute("aria-hidden"), "true", "le select porte déjà le nom accessible");
  assert.equal(boite.children[1].tagName, "SELECT", "et le select est dessous, entier");
  assert.equal(boite.querySelector("select").getAttribute("aria-label"), "Send to");
  assert.match(shell, /\.gear-destination-mot\s*\{[^}]*font-size:\s*var\(--t1\)/, "T1");
  assert.match(shell, /\.gear-destination-mot\s*\{[^}]*font-style:\s*italic/, "italique");
  assert.match(shell, /\.gear-destination-mot\s*\{[^}]*color:\s*var\(--text-soft\)/,
    "une encre douce qui bascule — « un peu moins blanc flashy », et un blanc fixe aurait crié la nuit");
});

test("5 quinquies — la bourse s'affiche en gp, arrondie à l'inférieur, et vide elle dit 0", () => {
  const lire = (n) => { const m = n.querySelector(".gear-montant"); return [m.querySelector(".gear-montant-nombre").textContent, m.querySelector(".gear-montant-unite").textContent, m.dataset.empile]; };
  assert.deepEqual(lire(rendu({ bourse: { pp: 1, gp: 5, sp: 9, cp: 9 } })), ["15", "gp", "false"], "deux chiffres : « gp » reste en ligne");
  const n = rendu({});
  assert.deepEqual(lire(n), ["0", "gp", "false"]);
  assert.equal(n.querySelector('[data-organe="purse"]').textContent, "", "rien d'écrit DANS le bouton : le montant est le voyant posé dessus");
  assert.match(n.querySelector('[data-organe="purse"]').getAttribute("aria-label"), /^Purse — 0 gp$/);
  /* le voyant est SUR la bourse (Eric, 16/09 soir) : `dans: "PURSE"` au plan, 40 dans 50,
     et sa règle vient de la table — pas retapée */
  const purse = ORGANES.find((o) => CLEF_DE[o.nom] === "purse");
  const montant = ORGANES.find((o) => o.nom === "MONTANT");
  assert.equal(montant.dans, "PURSE"); assert.ok(contenu(montant, purse), "le montant tient dans la bourse");
  assert.equal(purse.l, purse.h, "la bourse est un carré"); assert.ok(purse.l >= TOUCH, "le dessin de la bourse est sa propre cible");
  assert.equal(purse.cible, undefined, "50 ≥ 44 : aucune cible à porter, donc aucun bord transparent");
  assert.match(shell, /\.gear-montant\s*\{[^}]*color:\s*var\(--bourse-encre\)/, "l'encre du montant est le jeton de la bourse");
  /* 🔴 LES MILLIERS SE SÉPARENT, ET PAR UNE ESPACE FINE INSÉCABLE — Eric, 16/09 au
     soir, qui écrit lui-même « 85 565 gp » en demandant à voir. L'insécable est le
     fond de l'affaire : le nombre ne doit JAMAIS se couper en deux lignes, seul le
     blanc avant « gp » le peut. ⛔ Et le séparateur ne vient pas de la locale de la
     machine : `toLocaleString` rendrait une virgule en anglais et autre chose en test
     qu'au navigateur. */
  assert.deepEqual(lire(rendu({ bourse: { gp: 85565 } })), ["85\u202f565", "gp", "true"]);
  assert.deepEqual(lire(rendu({ bourse: { gp: 999 } })), ["999", "gp", "true"], "sous mille, rien à séparer — mais trois chiffres, donc empilé");
  assert.deepEqual(lire(rendu({ bourse: { gp: 1234567 } })), ["1\u202f234\u202f567", "gp", "true"], "tous les groupes, pas seulement le premier");
  /* ⚖️ LA BASCULE EST À TROIS CHIFFRES, ET ELLE SE PROUVE DES DEUX CÔTÉS — Eric,
     16/09 : « les gp sous le chiffre au-delà de 2 digits ». ⛔ 99 en ligne, 100
     empilé : un garde qui ne testerait qu'un côté laisserait passer un `>=`. */
  assert.equal(lire(rendu({ bourse: { gp: 99 } }))[2], "false", "99 : deux chiffres, en ligne");
  assert.equal(lire(rendu({ bourse: { gp: 100 } }))[2], "true", "100 : trois chiffres, empilé");
  assert.match(shell, /\.gear-montant\[data-empile="true"\]\s*\{[^}]*flex-direction:\s*column/,
    "c'est la feuille qui empile, sur l'état que le module déclare");
  /* ⚖️ ET LE CRAN DU MONTANT EST LE SEUL MAIGRE DE L'ÉCRAN — Eric : « ne mets pas en
     gras et descends d'un incrément ». La table le porte, la feuille le rend : les
     deux doivent dire la même chose, sinon le garde des libellés du plan mesure un
     mot dans une taille que personne ne sert. */
  assert.equal(montant.cran, "T0/400", "le plan porte le cran maigre du montant");
  assert.match(shell, /\.gear-montant\s*\{[^}]*font-size:\s*var\(--t0\)[^}]*font-weight:\s*400/,
    "la feuille sert le cran que le plan déclare — T0, maigre");
  assert.match(tokens, /--bourse-encre:\s*#/, "le jeton existe");
  assert.match(shell, /\.gear-porte\[data-porte="send"\]\s*\{\s*--bouton-fond:\s*var\(--positive\)/, "Send : liseré vert (une conséquence) ; les autres portes restent bleues");
  if (montant) assert.ok(feuilleDesCotes().includes(`[data-organe="montant"]{left:${montant.x}px;top:${montant.y - BELT_H}px;width:${montant.l}px;height:${montant.h}px}`), "le montant est posé par la table");
  else assert.ok(feuilleDesCotes().includes(`.gear > .gear-montant{left:${purse.x}px;top:${purse.y + purse.h + MARGE - BELT_H}px;width:${purse.l}px}`));
});
