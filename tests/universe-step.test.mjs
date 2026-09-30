/* ══ LOT 54 — L'ÉTAPE UNIVERSE & LAYERS ═══════════════════════════════════
   Trois sujets, dans l'ordre du §3 de la commande :

     A. `currentStack`/`fhRefChoices` — les deux fonctions PURES qui portent
        toute la connaissance de « quelle pile est active » / « qu'est-ce
        qui pointe vers Fate's Hand ». Testées directement, sans DOM.
     B. `renderUniverseStep` — la fonction de rendu (DOM-stub, comme
        Compétences/Class/Species) : les lignes que R lit, le champ campagne,
        et l'affichage lang/units.
     C. ⚔️ LE TEST QUI MONTRE CE QUE CHANGER DE PILE FAIT VRAIMENT — rejoue
        EXACTEMENT le geste de `shell.mjs` (`applyLayerStack`) sur la VRAIE
        pile et le VRAI bloc `build`, sans DOM : `layers.enable/disable` +
        `document.build.layers = []` + `rebuild`. C'est la mesure que
        `universe-step.mjs` documente en tête de fichier (« NE PERD RIEN
        dans build.choices… ce qui se dégrade, c'est le PERSONNAGE RÉSOLU »)
        — ce test en est la preuve, pas juste l'affirmation.

   🔄 LOT 350 — LE MENU R EST REFAIT, tel qu'Eric l'a dicté le 29/09
   (`FH-WEB/FHPC/FHPCv2 arborescence d'entree`). Les sections B, D et R sont
   RÉÉCRITES à la nouvelle vérité, pas relâchées : chaque garde dit ce qu'il
   tenait avant, et ce qu'il tient maintenant. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { makeHarness, manifestOf, readJson, SRD_EN, PILE_SRD, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN, FH_SPELLS_EN, FH_FICHE_EN, FH_LORE_EN }
  from "./build-harness.mjs";

globalThis.document = createTestDocument();

const { renderUniverseStep, currentStack, currentBooks, currentContent, fhRefChoices, SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, LIVRE_LAYER_IDS, RULE_LAYER_IDS,
  popupNouveauPersonnage, MOT_DE_L_AIGUILLEUR_DU_MENU, MOT_SANS_CODE_DE_CAMPAGNE,
  livresAbsentsDuMenu, MOT_DES_LIVRES_ABSENTS }
  = await import("../ui/builder/universe-step.mjs");
/* 🔄 LOT 357 — deux gardes lisent la SOURCE de la coquille et de la feuille (le câblage de
   la page Dungeon Master, le centrage des rangées) : commentaires retirés, comme partout. */
const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const SHELL = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
const CSS = fs.readFileSync(path.join(UI, "shell.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");

/** Les organes du Menu. */
const interrupteurs = (node) => node.querySelectorAll(".interrupteur");
/* ⚖️ LOT 350 — R LIT les règles et les livres : deux lignes, trouvées par leur
   donnée (`data-ligne`), jamais par leur position. */
const ligne = (node, quoi) => node.querySelectorAll(`.tdc-ligne-lue[data-ligne="${quoi}"]`)[0];
const valeur = (node, quoi) => ligne(node, quoi).querySelectorAll(".tdc-ligne-valeur")[0].textContent;
/* 🔄 L'interrupteur Fate's Hand et le voyant SRD ont quitté R pour `Layers` (lots
   188-189, puis la dictée du 29/09) : on les cherche LÀ, par leur donnée — le
   maître par `data-maitre`, le socle par `data-socle` (lot 189). */
const layers = (doc, onAction = () => {}) =>
  renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, ecran: "layers" }, onAction);
const maitre = (node) => node.querySelectorAll(".interrupteur[data-maitre]")[0];
const socle = (node) => node.querySelectorAll("[data-socle]")[0];
/* LOT 77 — la pile que le NAVIGATEUR monte, pour la confronter à la pile
   NOMMÉE (test A0). Importée, jamais recopiée : c'est la recopie qui a
   laissé les deux diverger. */
const { LAYER_FILES } = await import("../ui/builder/engine.mjs");

const FT_LB = { distance: "ft", weight: "lb" };
function draftDocument(extra = {}) {
  return {
    schema: "fh-char/1", id: "universe-step-test", name: "Sonde", lang: "en", units: FT_LB,
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: { layers: [], choices: [], budgets: {}, overrides: [] },
    ...extra
  };
}
function manifestFor(ids) {
  return ids.map((id) => ({ id, version: "0.0.0", hash: "x".repeat(64), name: id }));
}

/* ══ A — LES DEUX FONCTIONS PURES ══════════════════════════════════════ */

test("A0 — la pile SRD+FH nommée est EXACTEMENT celle que le moteur monte", () => {
  assert.equal(SRD_LAYER_ID, "srd-5.2.1-en");
  /* ⭐ LOT 77 — LA LISTE N'EST PLUS RECOPIÉE ICI, ELLE EST CONFRONTÉE. Ce
     test portait les quatre noms à la main ; le jour où `engine.mjs` en a
     monté deux de plus (`fh-fiche-en`, `fh-lore-en`), la pile nommée est
     restée à cinq et l'écran Universe a accusé le personnage d'exemple
     d'avoir une pile hors des deux jeux de règles — mesuré au navigateur.
     Une liste écrite deux fois diverge : c'est la loi du dépôt, et elle
     vient de coûter une fois de plus. Le garde compare donc les DEUX
     sources réelles. */
  /* ⭐ LOT 95 — LA PILE A TROIS PALIERS, PLUS DEUX. `srfh-shelving-en` n'est
     ni le livre ni Fate's Hand : c'est ce qui est AMBIGU (le rangement
     d'Eric). Elle a donc sa propre liste, et elle est montée dans les DEUX
     piles nommées — la bascule de `shell.mjs` ne touche que `FH_LAYER_IDS`.
     ⛔ La ranger dans l'une des deux aurait été plus court et faux : dans
     `FH_LAYER_IDS` elle serait débrayée en mode SRD et le tambour se
     viderait ; dans le SRD elle ferait passer une décision d'Eric pour du
     livre. */
  const duMoteur = LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, ""));
  assert.deepEqual([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS], duMoteur,
    "la pile nommée « SRD + FH » doit être la pile que `engine.mjs` monte, dans le même ordre");
  /* ⭐ LOT 196 — ELLES SONT DEUX. `srfh-mecaniques-en` déclare, dans la forme
     que le moteur lit, une mécanique que le texte SRD énonce en prose
     (`data[spell_list_choice]` sur Magic Initiate). Même rang, même raison :
     le texte est du livre, la FORME est une décision d'ici — donc ni l'un ni
     l'autre, donc les deux piles. */
  assert.deepEqual(SRFH_LAYER_IDS, ["srfh-shelving-en", "srfh-mecaniques-en"],
    "les couches srfh sont nommées à part — ni SRD, ni FH");
  /* ⛔ ET LE HARNAIS DES SUITES MONTE LA MÊME PILE SRD QUE L'ÉCRAN. C'est une
     QUATRIÈME liste (`PILE_SRD`, tests/build-harness.mjs) et elle divergerait
     comme les trois autres l'ont fait au lot 77 : une suite qui mesure « ce
     que le joueur a en SRD » sur une pile amputée est verte et ne prouve
     rien. Les deux listes sont donc CONFRONTÉES, jamais recopiées. */
  assert.deepEqual(PILE_SRD.map((f) => f.replace(/^layers\//, "").replace(/\.layer\.json$/, "")),
    [SRD_LAYER_ID, ...SRFH_LAYER_IDS],
    "la pile SRD des suites doit être la pile SRD de l'écran, dans le même ordre");
});

test("A1 — currentStack reconnaît « srd » et « srdfh », qui portent TOUTES DEUX la couche srfh", () => {
  /* ⭐ LOT 95 — « SRD » N'EST PLUS « UNE SEULE COUCHE ». Les deux piles portent
     le livre ET le rangement d'Eric (`srfh`, ni l'un ni l'autre) ; seules les
     couches Fate's Hand les distinguent. Les listes sont CONFRONTÉES, pas
     recopiées : un nom écrit à la main ici a déjà coûté le lot 77. */
  assert.equal(currentStack(draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } })), "srd");
  assert.equal(
    currentStack(draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } })),
    "srdfh"
  );
});

test("A2 — currentStack rend null hors des deux piles nommées (aucune, ou une composition différente)", () => {
  assert.equal(currentStack(draftDocument()), null, "aucune couche déclarée");
  assert.equal(
    currentStack(draftDocument({ build: { layers: manifestFor(["srd-5.2.1-en", "fh-species-en"]), choices: [], budgets: {}, overrides: [] } })),
    null,
    "une composition qui n'est ni SRD seule ni les cinq"
  );
});

test("A3 — fhRefChoices ne retient QUE les choix dont le ref pointe vers fh:, nommés via query", () => {
  const doc = draftDocument({
    build: {
      layers: [], budgets: {}, overrides: [],
      choices: [
        { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
        { path: "background.originFeat[0]", ref: { kind: "feat", id: "fh:feat:en:auspicious" }, label: "Origin feat" },
        { path: "abilities.str", value: 10 }
      ]
    }
  });
  const query = ({ kind, id }) => (id === "fh:feat:en:auspicious" ? { record: { name: "Auspicious (fh)" } } : null);
  assert.deepEqual(fhRefChoices(doc, query), ["Origin feat: Auspicious (fh)"]);
});

test("A3bis — fhRefChoices n'affiche PAS un préfixe qui répète le nom (label === name, ex. les arcanes)", () => {
  const doc = draftDocument({
    build: {
      layers: [], budgets: {}, overrides: [],
      choices: [{ path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-hermit" }, label: "The Hermit" }]
    }
  });
  const query = () => ({ record: { name: "The Hermit" } });
  assert.deepEqual(fhRefChoices(doc, query), ["The Hermit"], "pas « The Hermit: The Hermit »");
});

test("A4 — fhRefChoices retombe sur l'id nu si query ne rend rien (couche déjà débranchée)", () => {
  const doc = draftDocument({
    build: {
      layers: [], budgets: {}, overrides: [],
      choices: [{ path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-hermit" } }]
    }
  });
  assert.deepEqual(fhRefChoices(doc, () => null), ["fh:arcana:en:the-hermit"]);
});

/* ══ B — LE RENDU (DOM-stub) ══════════════════════════════════════════ */

/* 🔄 LOT 350 — LE MENU NE RÈGLE PLUS LES RÈGLES, IL LES LIT. Trois âges :
   · 17/08 — deux SÉLECTEURS exclusifs, SRD et SRD + FH (📍 `menu-regles-au-selecteur`) ;
   · 08/09 — UN interrupteur « Fate's Hand », et le 09/09 le voyant SRD à côté ;
   · 29/09 — Eric refait le Menu : *« Rules : (SRD mais inutile de citer) Fate's
     hand »*. La ligne se LIT ; l'interrupteur et le voyant vivent dans `Layers`
     (lots 188-189), où `tests/ecran-layers.test.mjs` les garde en entier.
   ⭐ B1 · B2 · B2 bis sont RÉÉCRITS, pas relâchés : ils tenaient qu'un état se
   montre juste et qu'un geste émet le bon verbe ; ils tiennent maintenant que la
   ligne dit juste, qu'elle n'émet RIEN, et qu'une pile hors des jeux se DIT. */

const pile = (ids) => ({ layers: manifestFor(ids), choices: [], budgets: {}, overrides: [] });
const docSrd = (extra = {}) => draftDocument({ build: pile([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), ...extra });
const docFh = (extra = {}) => draftDocument({ build: pile([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), ...extra });
const rendre = (doc, onAction = () => {}, ctx = {}) =>
  renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, ...ctx }, onAction);
/* 🗄️ LOT 357 — `campaignField` est parti avec le champ : `Campaign` se LIT (B3). */

test("B1 — 🔴 `Rules` SE LIT : SRD sur la pile SRD, Fate's Hand sur SRD + FH — et R n'a AUCUN interrupteur", () => {
  const nSrd = rendre(docSrd());
  const nFh = rendre(docFh());
  assert.equal(valeur(nSrd, "rules"), "SRD", "le maître au repos : le socle seul");
  assert.equal(valeur(nFh, "rules"), "Fate's Hand", "*« (SRD mais inutile de citer) Fate's hand »* — le SRD n'est pas répété");
  for (const node of [nSrd, nFh]) {
    assert.equal(interrupteurs(node).length, 0, "⛔ plus aucun interrupteur sur R : ils vivent dans Layers");
    assert.equal(node.querySelectorAll("[data-socle], .voyant, .bascule-liste, .tdc-regles, .tdc-deux").length, 0,
      "⛔ ni le voyant SRD, ni les anciens sélecteurs, ni leur ligne");
  }
  /* 🔄 TÉMOIN QU'ILS ONT DÉMÉNAGÉ, PAS DISPARU : la même pile, lue par `Layers`. */
  assert.equal(maitre(layers(docSrd())).dataset.on, "false", "pile SRD → le maître de Layers est éteint");
  assert.equal(maitre(layers(docFh())).dataset.on, "true", "pile SRD + FH → allumé");
  assert.ok(socle(layers(docFh())), "et le voyant SRD est là-bas");
});

test("B2 — ⛔ LES LIGNES DE R NE SONT PAS DES CONTRÔLES : les toucher n'émet rien", () => {
  /* 🗄️ B2 tenait que l'interrupteur de R émettait `requestLayerStack` vers l'AUTRE
     pile ; ce geste appartient désormais à `Layers` (ecran-layers, D4 — et S1 plus
     bas l'y éprouve). Ce qui reste à tenir ICI, c'est l'autre moitié : ⛔ une ligne
     LUE n'a ni bouton, ni rôle de contrôle, ni écouteur — un joueur qui la touche ne
     change pas de jeu sans le savoir. */
  const gestes = [];
  const node = rendre(docFh(), (a) => gestes.push(a));
  for (const quoi of ["rules", "books"]) {
    const l = ligne(node, quoi);
    assert.ok(l, `la ligne \`${quoi}\` existe`);
    assert.equal(l.querySelectorAll("button, input, [role]").length, 0, `⛔ \`${quoi}\` ne porte aucun contrôle`);
    l.click();
    for (const morceau of l.querySelectorAll("span")) morceau.click();
  }
  assert.deepEqual(gestes, [], "les toucher n'émet RIEN");
});

test("B2 bis — ⚔️ UNE PILE HORS DES DEUX JEUX SE DIT TOUJOURS — et elle envoie là où l'on répare", () => {
  /* 🗄️ Le garde du 17/08 empêchait de recliquer la ligne allumée pour ne pas laisser
     le personnage sans pile ; celui du 08/09 tenait qu'une pile inconnue se montre
     ÉTEINTE. 🔄 LOT 350 : R n'a plus rien à allumer, mais une pile qu'aucun
     interrupteur ne peut produire doit toujours se DIRE (📍 `menu-sous-ensemble-
     legitime`) — et le mot envoie à `Layers`, le seul endroit où l'on règle. */
  const bizarre = draftDocument({ build: pile([SRD_LAYER_ID]) });
  const node = rendre(bizarre);
  assert.equal(valeur(node, "rules"), "SRD", "une pile inconnue ne se montre jamais « Fate's Hand » par défaut");
  const mots = node.querySelectorAll(".doc-field-error").map((p) => p.textContent).join(" ");
  assert.match(mots, /doesn't match either ruleset/, "et l'écran le DIT");
  assert.match(mots, /open Layers/, "…en nommant la porte qui répare");
  for (const legitime of [docSrd(), docFh()]) {
    assert.equal(rendre(legitime).querySelectorAll(".doc-field-error").length, 0,
      "⛔ une pile légitime ne fait jamais sortir le mot rouge");
  }
});

test("B3 — 📖 `Campaign` SE LIT : « none » sans code — ⛔ plus de champ, rien d'émis ; `Books` met le SRD EN TÊTE", () => {
  /* 🔄 LOT 357 — B3 tenait le champ `Campaign` modifiable à la main (Eric, 29/09 matin :
     « tant que le code de campagne n'est pas câblé »). Redicté l'après-midi, mot pour mot :
     *« campaign : c'est le titre de la campagne, il se créera dans Dungeon Master/ Create
     campaign. s'il aucun code de campagne n'est entré : il indique none. pas d'écart pour
     écrire ici »*. ⭐ Le garde ne se relâche pas, il change d'objet : il tenait qu'une frappe
     émet le bon verbe ; il tient maintenant qu'il n'y a plus rien à frapper, que la ligne dit
     « none » MÊME quand le document porte une valeur (le titre viendra du code, pas du
     document), et que toucher la ligne n'émet rien.
     ⚖️ `Books` : à « le SRD dans Books ? » → *« Books est un terme générique ; le SRD est le
     book de base »*. Les mots de la ligne sont ceux du plan v10 : « SRD · FH · PHB · DMG ». */
  const gestes = [];
  const complet = draftDocument({ campaign: "Eberron", build: pile([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS, ...LIVRE_LAYER_IDS]) });
  const node = rendre(complet, (a) => gestes.push(a));
  assert.equal(node.querySelectorAll("#universe-campaign, .tdc-champ").length, 0, "⛔ plus de champ `Campaign` sur R");
  assert.equal(MOT_SANS_CODE_DE_CAMPAGNE, "none", "le mot d'Eric");
  assert.equal(valeur(node, "campaign"), "none", "⛔ sans code, « none » — pas la valeur que le document porte");
  const l = ligne(node, "campaign");
  assert.equal(l.querySelectorAll("button, input, [role]").length, 0, "⛔ une ligne lue ne porte aucun contrôle");
  l.click();
  for (const morceau of l.querySelectorAll("span")) morceau.click();
  assert.deepEqual(gestes, [], "la toucher n'émet RIEN — ⛔ surtout pas `describe/campaign`");
  assert.equal(complet.campaign, "Eberron", "le document garde sa valeur : R ne l'écrit plus, et ne l'efface pas");
  assert.equal(valeur(node, "books"), "SRD · FH · PHB · DMG", "le socle, Fate's Hand, puis les livres du joueur");
  assert.equal(valeur(rendre(docSrd()), "books"), "SRD", "sans Fate's Hand ni livre, le SRD reste — il n'est jamais absent");
});

test("B3 ter — 📚 LOT 388 : UN LIVRE DÉCLARÉ QUE LA PILE N'A PAS MONTÉ s'écrit EN ROUGE dans `Books`, et le mot rouge envoie à Layers", () => {
  /* ⚖️ `menu-r-regles-et-livres-se-lisent` : *« Une pile qu'aucun interrupteur ne peut produire se dit en rouge,
     et le mot envoie à `Layers` »*. Un perso qui déclare le PHB sur un appareil (ou une Dropbox) qui ne l'a pas
     est cette pile — le lot 388 rend le cas courant. 📏 Mesuré au banc v939 avant réparation : « SRD · FH · PHB »
     en blanc, aucun mot rouge, alors que `Layers` disait « not on this device ». ⛔ Le mot de §C34 n'est pas
     touché : les mots rouges sont ceux qui existent déjà. */
  const gestes = [];
  const ids = [SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS, ...LIVRE_LAYER_IDS];
  const doc = draftDocument({ build: pile(ids) });
  const montee = (sans) => ids.filter((id) => !sans.includes(id)).map((id) => ({ id, enabled: true }));
  /* le PHB manque ; le DMG est monté */
  const node = rendre(doc, (a) => gestes.push(a), { pile: montee(["xphb-en"]) });
  assert.equal(valeur(node, "books"), "SRD · FH · PHB · DMG", "⭐ le Menu résume toujours le perso : il écrit PHB");
  const rouges = ligne(node, "books").querySelectorAll(".tdc-livre-absent");
  assert.deepEqual(rouges.map((r) => [r.textContent, r.dataset.livre]), [["PHB", "xphb-en"]], "⛔ PHB EN ROUGE, et lui seul (le DMG est là)");
  const dit = node.querySelectorAll("[data-livres-absents]");
  assert.equal(dit.length, 1);
  assert.ok(dit[0].className.split(" ").includes("doc-field-error"), "le rouge des mots de R");
  assert.equal(dit[0].textContent, "PHB: not on this device — open Layers.", "⭐ le mot envoie à Layers — avec les mots qui existent");
  assert.equal(MOT_DES_LIVRES_ABSENTS(["PHB", "DMG"]), "PHB, DMG: not on this device — open Layers.");
  /* ⛔ toujours une ligne LUE : aucun contrôle, et la toucher n'émet rien */
  assert.equal(ligne(node, "books").querySelectorAll("button, input, [role]").length, 0);
  for (const morceau of ligne(node, "books").querySelectorAll("span")) morceau.click();
  assert.deepEqual(gestes, []);
  /* ⭐ un livre MONTÉ, même éteint, n'est pas absent ; et sans pile, on n'accuse pas */
  const tout = rendre(doc, () => {}, { pile: ids.map((id) => ({ id, enabled: id !== "xphb-en" })) });
  assert.equal(tout.querySelectorAll(".tdc-livre-absent, [data-livres-absents]").length, 0, "monté et éteint : rien de rouge");
  assert.deepEqual(livresAbsentsDuMenu(doc, undefined), [], "⛔ sans pile, on ne sait pas : on n'accuse pas");
  assert.deepEqual(livresAbsentsDuMenu(doc, montee(["xphb-en", "xdmg-en"])), ["xphb-en", "xdmg-en"], "dans l'ordre stable des livres");
  assert.equal(rendre(docFh(), () => {}, { pile: montee([]) }).querySelectorAll(".tdc-livre-absent, [data-livres-absents]").length, 0, "un perso sans livre : rien de rouge");
});

test("B5 — la langue et les unités vivent dans APPEARANCE, en places réservées lisibles (pas les codes bruts)", () => {
  /* Eric, 26/08 : *« on note, on câble après »* — elles se montrent éteintes,
     avec leur valeur d'aujourd'hui. Eric, 08/09 : *« R doit tenir en une page »*
     — elles quittent la racine. */
  const doc = draftDocument({ lang: "en", units: { distance: "ft", weight: "lb" } });
  const racine = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, () => {});
  assert.equal(racine.querySelectorAll(".universe-locale-row").length, 0, "plus rien à la racine");
  const app = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, ecran: "display", fonds: [], echelle: { auto: {}, crans: [] } }, () => {});
  const reservees = app.querySelectorAll(".tdc-ligne[data-reserve]").map((b) => b.textContent.replace(/\s+/g, " ").trim());
  assert.ok(reservees.some((t) => /Language — English/.test(t)), `la langue, lisible — vu : ${reservees.join(" | ")}`);
  assert.ok(reservees.some((t) => /Units — feet · pounds/.test(t)), "les unités, lisibles");
  for (const b of app.querySelectorAll(".tdc-ligne[data-reserve]")) assert.equal(b.disabled, true, "réservée = éteinte");
});

/* ══ C — ⚔️ LE TEST QUI MONTRE CE QUE CHANGER DE PILE FAIT, SUR LA VRAIE
   PILE ET LE VRAI BLOC `build` (§3, test 5 de la commande) ═══════════════ */

test("C — ⚔️ passer de SRD+FH à SRD ne perd RIEN dans build.choices, dégrade le résolu (refus NOMMÉS), et l'aller-retour restaure tout", () => {
  /* ⭐ LOT 95 — `srfh-shelving-en` est dans cette pile parce qu'elle est dans
     les DEUX piles nommées : la bascule n'éteint que les couches FH, donc le
     rangement d'Eric survit au passage en « SRD seul ». Une pile de test qui
     l'oublierait ne serait reconnue NI comme « srd » NI comme « srdfh ». */
  /* 🔴 LOT 179 — CETTE LISTE ÉTAIT ÉCRITE À LA MAIN, ET ELLE A DIVERGÉ LE
     JOUR MÊME OÙ UNE COUCHE EST ENTRÉE. L'arrivée de `fh-soulforging-en`
     dans `engine.mjs` a fait monter à ce test une pile à neuf couches quand
     la page en montait dix : `currentStack` a rendu `null` — « ni srd ni
     srdfh » — et le test a rougi sur un document parfaitement sain.
     ⭐ C'EST EXACTEMENT LA FAUTE QUE LE TEST A0 DÉNONCE QUINZE LIGNES PLUS
     HAUT (« une liste écrite deux fois diverge »), et elle était ici, dans le
     même fichier, sur la même pile. Elle se DÉDUIT donc de `LAYER_FILES`,
     la source que A0 tient déjà pour vraie — la prochaine couche entrera
     dans cette pile de test sans que personne y pense. */
  const harness = makeHarness({ layers: LAYER_FILES.map((fichier) => `layers/${fichier}`) });
  /* Le personnage d'exemple EN+FH DU DÉPÔT (`examples/personnage-fh-en-
     niveau1.fh-char.json`, lot 20) — celui que `engine.mjs`/`shell.mjs`
     chargent réellement au boot du builder, jamais recopié à la main. */
  const example = readJson("examples/personnage-fh-en-niveau1.fh-char.json");
  let doc = {
    schema: example.schema, id: example.id, name: example.name, lang: example.lang, units: example.units,
    generator: { name: "tests/universe-step", version: "1.0.0" },
    created: example.created, modified: example.modified,
    build: {
      layers: manifestOf(harness.layers),
      choices: structuredClone(example.build.choices),
      budgets: structuredClone(example.build.budgets),
      overrides: structuredClone(example.build.overrides)
    }
  };

  const before = harness.verbs.rebuild({ document: doc });
  doc = before.document;
  assert.deepEqual(currentStackViaModule(doc), "srdfh");
  const choicesBefore = structuredClone(doc.build.choices);
  const affectedBefore = fhRefChoices(doc, harness.layers.verbs.query);
  assert.ok(affectedBefore.length > 0, "témoin : ce personnage porte bien des choix Fate's Hand nommables");

  /* ── LE GESTE EXACT DE shell.mjs (`applyLayerStack("srd")`) ─────────── */
  /* 🔴 LOT 77 — PAR LE HAUT. `applyLayerStack` éteint la pile à l'envers de
     la liste, et ce test rejoue le geste EXACT : `fh-fiche-en` patche les
     trois espèces que `fh-species-en` ajoute, donc éteindre la base d'abord
     fait jeter la pile (§L7.2). C'est ce test qui a trouvé le défaut. */
  for (const id of [...FH_LAYER_IDS].reverse()) harness.layers.verbs.disable({ id });
  doc = { ...doc, build: { ...doc.build, layers: [] } };
  const degraded = harness.verbs.rebuild({ document: doc });
  doc = degraded.document;

  assert.deepEqual(doc.build.choices, choicesBefore, "AUCUN choix n'a bougé — rien n'est effacé de build.choices");
  assert.deepEqual(currentStackViaModule(doc), "srd");

  const violations = harness.verbs.validate({ document: doc }).violations;
  const keys = violations.map((v) => v.key);
  assert.ok(keys.includes("choice.ref-missing"), `un ref FH mort doit être NOMMÉ : ${keys.join(", ")}`);
  assert.ok(keys.includes("skill-grant.count-mismatch"), `le budget de compétence FH doit être NOMMÉ : ${keys.join(", ")}`);

  /* ── L'ALLER-RETOUR : rien n'a été perdu, tout redevient consommé ────── */
  for (const id of FH_LAYER_IDS) harness.layers.verbs.enable({ id });
  doc = { ...doc, build: { ...doc.build, layers: [] } };
  const restored = harness.verbs.rebuild({ document: doc });
  assert.deepEqual(restored.unconsumed, before.unconsumed, "après l'aller-retour, exactement les mêmes chemins non consommés qu'avant");
  assert.deepEqual(
    harness.verbs.validate({ document: restored.document }).violations,
    [],
    "et plus aucun refus : le personnage restauré est de nouveau valide"
  );
});

function currentStackViaModule(doc) { return currentStack(doc); }

/* ══ D. OÙ VIT CE PERSONNAGE — la mémoire du navigateur, 2026-08-20 ═══════
   Eric : *« Un perso est enregistré dans le navigateur de tout le monde, et
   disparaît s'il n'est pas enregistré s'il y a un reset. »*

   🔴 CE BLOC EST NÉ PARCE QUE LA SAUVEGARDE EST INVISIBLE : pas de bouton, pas
   de message. Une sauvegarde qu'on ne voit pas est une sauvegarde en laquelle
   on ne peut pas avoir confiance — et le jour où elle échoue, le joueur
   travaillerait des heures en se croyant gardé.

   🔄 LOT 350 — Eric, 29/09 : la ligne « in browser : <nom> · saved » est RETIRÉE,
   et `Open · Save · Forget` quittent R (`Open` → `My characters`, `Save` → Sheet,
   `Forget` → le `Delete` de la fenêtre `New character`). ⚖️ CE QUI NE BOUGE PAS :
   UNE PERTE SE DIT. Le Menu se tait quand tout est gardé, et parle — en rouge,
   dans sa tête — quand le navigateur refuse de garder ou qu'un personnage gardé
   ne se rouvre pas. D1-D8 sont réécrits à cette vérité ; D9 n'a pas bougé. */

test("D1 — gardé : R SE TAIT — plus de ligne d'état, et plus aucun geste de fichier sur R", () => {
  /* 🗄️ 20/08 → 08/09 : la tête de R disait « in browser : <nom> · saved », pastille
     verte, et `Save` était juste dessous. ⚖️ 29/09 : la ligne est retirée, et *« le
     save character sera dans Sheet »* (`tests/review-export.test.mjs` l'y tient).
     ⛔ Un « saved » à chaque visite n'était plus un message : c'était un décor. */
  const node = rendre(draftDocument(), () => {}, { memoire: { ok: true } });
  assert.equal(node.querySelectorAll(".universe-memoire, .tdc-etat, [data-garde]").length, 0, "⛔ la ligne d'état ne revient pas");
  assert.equal(node.querySelectorAll(".tdc-tete .doc-field-error").length, 0, "rien à dire quand tout est gardé");
  const mots = node.querySelectorAll("button").map((b) => b.textContent.trim());
  for (const parti of ["Open", "Save", "Forget", "Save character", "Export JSON"]) {
    assert.equal(mots.includes(parti), false, `⛔ \`${parti}\` a quitté R`);
  }
});

test("D2 — 🔴 PAS gardé : la raison du navigateur est RECOPIÉE dans la tête de R, et elle dit où sauver", () => {
  const node = rendre(draftDocument(), () => {}, { memoire: { ok: false, raison: "QuotaExceededError" } });
  const dit = node.querySelectorAll(".tdc-tete .doc-field-error").map((p) => p.textContent).join(" ");
  assert.match(dit, /QuotaExceededError/, "le mot du navigateur, pas une prose inventée");
  assert.match(dit, /Save it from Sheet/, "…et le geste qui reste possible, là où il vit désormais");
});

test("D3 — 🔴 UNE PERTE SE DIT : un personnage illisible laisse un message, même une fois la sauvegarde repartie", () => {
  /* Sans lui, un joueur dont le personnage gardé est corrompu repart de
     l'exemple en croyant n'avoir jamais rien construit. */
  const node = rendre(draftDocument(), () => {}, { memoire: { ok: true }, memoireIgnoree: "the saved character could not be read" });
  const perdu = node.querySelectorAll(".tdc-tete .doc-field-error")[0];
  assert.ok(perdu, "le message de perte existe, dans la tête de R");
  assert.match(perdu.textContent, /A character was saved here but could not be reopened/);
  assert.match(perdu.textContent, /could not be read/, "et il porte la raison");
});

test("D4 — ⚖️ UNE SEULE PORTE PROMET UN PERSONNAGE NEUF — `New character` — ET ELLE MÈNE À SA FENÊTRE", () => {
  /* 🗄️ LA LOI D'AVANT (20/08, resserrée le 06/09 — 📍 `menu-dit-la-sauvegarde`) :
     *« aucune porte ne PROMET un personnage neuf »*, parce que le builder n'avait
     AUCUN personnage vierge — il naissait de l'exemple commité, et « Start over »
     aurait rendu un Magicien tout fait. Le garde nommait la PROMESSE (new · start
     over · restart · reset · fresh · blank) et exigeait qu'AUCUN bouton ne la porte.
     ⚖️ CE QUI L'A REMPLACÉE : le lot 193 a donné au builder un personnage vierge
     (`composer`, `personnageNeuf`), et Eric a dicté la porte le 29/09 : *« New
     character (centre) »*, avec sa fenêtre et ses trois avertissements.
     ⭐ LE GARDE NE SE RELÂCHE PAS, IL CHANGE D'OBJET : il nomme toujours la
     promesse, et il exige maintenant qu'UNE seule porte la porte, sous le mot
     d'Eric, et qu'elle mène à la FENÊTRE — jamais à une naissance sans
     avertissement. ⚔️ Un second bouton « Start over », ou un `New character` qui
     ferait naître directement → rouge ici. */
  const gestes = [];
  const node = rendre(draftDocument(), (a) => gestes.push(a), { memoire: { ok: true } });
  const promettent = node.querySelectorAll("button").filter((b) => /\b(new|start over|restart|reset|fresh|blank)\b/i.test(b.textContent));
  assert.deepEqual(promettent.map((b) => b.textContent.trim()), ["New character"], "une porte, un mot");
  promettent[0].dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirNouveauPersonnage" }],
    "⛔ elle ouvre la FENÊTRE — la naissance ne vient qu'après un choix (tests/premier-pas.test.mjs)");
});

test("D6 — 🔴 LA SORTIE DE SECOURS DEMEURE : l'ancien `Forget` est le `Delete` de la fenêtre", () => {
  /* Eric, 2026-09-06 : *« un bouton reset du perso, dans le menu, qui permet de
     vider le cache quand ça bloque »* — c'était `Forget`. Mesuré le même jour : un
     personnage gardé avant un changement de couche rendait SIX écrans sur huit
     muets, et rien dans l'interface n'en sortait. ⚖️ 29/09 : `Forget` devient le
     `Delete` de `New character`. ⛔ La sortie ne disparaît pas : elle a une porte de
     plus à passer, et elle efface par le même organe (`oublierPersonnage` —
     tests/premier-pas.test.mjs, A5 et E1). */
  const gestes = [];
  const node = rendre(draftDocument(), (a) => gestes.push(a), { memoire: { ok: true } });
  assert.equal(node.querySelectorAll(".universe-oubli").length, 0, "⛔ plus de bouton d'oubli sur R");
  node.querySelectorAll("button").find((b) => b.textContent === "New character").dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirNouveauPersonnage" }]);
  const efface = popupNouveauPersonnage({ enCours: true, choisir: (v) => gestes.push(v) }).actions.find((a) => a.mot === "Delete");
  assert.ok(efface, "la fenêtre porte `Delete` quand il y a un perso à effacer");
  efface.faire();
  assert.equal(gestes.at(-1), "delete", "et il émet la voie qui oublie PUIS fait naître");
});

test("D8 — 🗄️ `My characters` OUVRE LA PAGE DU MAGASIN — `Open` est parti, et c'était la même pièce", () => {
  /* ⚖️ Eric, 10/09 : *« quand j'appuie sur Open, j'ai une page avec toutes mes
     sauvegardes dedans »* — et depuis le lot 195, `Open` et `My characters` menaient
     à la MÊME pièce (A-TRANCHER §C37). 🔄 LOT 350 : la dictée du 29/09 ne garde que
     `My characters` (gauche, rangée 1) — C37 est tranchée.
     ⭐ LE GARDE GARDE SA MOITIÉ STRICTE : il exige LEQUEL — `ouvrirLeMagasin`,
     jamais `ouvrirUnFichier`. ⚔️ Rebrancher la porte sur la boîte du système →
     rouge ici. ⚠️ La boîte n'a pas disparu : elle vit dans la page (`Open a
     file…`), et c'est `tests/magasin.test.mjs` (P4) qui l'y tient.
     ⛔ ET LA PORTE N'EST PAS ROUGE : elle NAVIGUE, elle ne défait rien. */
  const gestes = [];
  const node = rendre(draftDocument(), (a) => gestes.push(a), { memoire: { ok: true } });
  assert.equal(node.querySelectorAll(".universe-ouvrir").length, 0, "⛔ `Open` a quitté R");
  const b = node.querySelectorAll("button").find((x) => x.textContent === "My characters");
  assert.ok(b, "la porte existe");
  assert.equal(b.disabled, false);
  assert.equal(b.dataset.defait, undefined, "⛔ pas la teinte de ce qui défait");
  b.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirLeMagasin" }], "⛔ jamais la boîte du système depuis R");
});

test("D9 — ⚠️ UNE OUVERTURE REFUSÉE SE DIT, avec le mot de la cause — ET LÀ OÙ LE GESTE A ÉTÉ FAIT", () => {
  /* Un fichier choisi qui ne rentre pas et un écran qui ne bouge pas, c'est un
     bouton mort du point de vue du joueur : il ne saura pas s'il a raté son
     geste ou son fichier. Même loi que le personnage illisible du navigateur.
     ⭐ LOT 195 — LE MOT A SUIVI SON BOUTON, ET C'EST UN RESSERREMENT : la boîte
     de fichiers ne s'ouvre plus depuis `R`, donc un mot posé dans la tête de `R`
     parlerait d'un geste que le joueur n'a pas fait SUR CET ÉCRAN. Le garde
     exige désormais les deux moitiés — rien en `R`, et le mot entier dans la
     page du magasin. ⚔️ Remettre le message en tête de `R` → rouge ici. */
  const doc = draftDocument();
  const racineAvecRefus = renderUniverseStep({
    document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true },
    ouvertureRefusee: 'this file says it is "roll20/2", not a Fate\'s Hand character'
  }, () => {});
  assert.equal(racineAvecRefus.querySelectorAll(".tdc-tete .doc-field-error").length, 0,
    "⛔ le tableau de commande ne parle plus d'un fichier : il n'en ouvre plus");

  const sansRefus = renderUniverseStep(
    { document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true }, ecran: "characters" }, () => {});
  assert.equal(sansRefus.querySelectorAll(".doc-field-error").length, 0,
    "⛔ rien à dire tant que rien n'a été refusé — un message permanent ne serait plus un message");

  const avecRefus = renderUniverseStep({
    document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true }, ecran: "characters",
    ouvertureRefusee: 'this file says it is "roll20/2", not a Fate\'s Hand character'
  }, () => {});
  const dit = avecRefus.querySelectorAll(".doc-field-error").map((p) => p.textContent).join(" ");
  assert.match(dit, /not opened/, "l'écran dit que le fichier n'est pas entré");
  assert.match(dit, /roll20\/2/, "et il RECOPIE la cause, il ne la résume pas");
});

test("D7 — ⛔ ET LA SORTIE DE SECOURS N'EST JAMAIS GRISÉE, même quand la mémoire refuse", () => {
  /* 🔴 `memoire.ok` dit si la dernière ÉCRITURE a réussi, jamais s'il y a
     quelque chose à jeter. Un magasin qui refuse d'écrire peut très bien
     garder un personnage périmé — c'est le cas exact qu'on répare. Le griser
     là-dessus retirerait la sortie de secours au moment précis où elle sert.
     🔄 LOT 350 : la sortie passe par `New character` — c'est LUI qui ne se grise
     jamais. */
  for (const memoire of [{ ok: true }, { ok: false, raison: "QuotaExceededError" }]) {
    const node = rendre(draftDocument(), () => {}, { memoire });
    const b = node.querySelectorAll("button").find((x) => x.textContent === "New character");
    assert.ok(b, `la porte existe aussi quand ok=${memoire.ok}`);
    assert.notEqual(b.disabled, true, `elle reste pressable quand ok=${memoire.ok}`);
  }
});

test("D5 — sans `memoire` dans le ctx, l'écran ne ment pas : il se tait sur l'échec", () => {
  /* Repli DÉCLARÉ : un appelant qui n'a pas encore d'état de mémoire (aucun
     aujourd'hui) ne fait pas clignoter une alerte rouge. 🔄 LOT 350 : la pastille
     verte est partie avec la ligne d'état ; ce qui se tient, c'est le silence. */
  assert.equal(rendre(draftDocument()).querySelectorAll(".tdc-tete .doc-field-error").length, 0);
});

/* ══ R — LE MENU, TEL QU'ERIC L'A DICTÉ LE 29/09 (lot 350) ══════════════════
   🗄️ LE TABLEAU DE COMMANDE DU 08/09 est remplacé : `Build a character`, le trio
   `Open · Save · Forget`, les places `DM · Tools`, la rangée du bas (le livre,
   `Display` au format petit), `My characters` en pleine largeur, le voyant SRD.
   R1-R7 et S1 sont RÉÉCRITS à la nouvelle vérité ; chacun dit ce qu'il tenait. */

function racine(ctx = {}, onAction = () => {}) {
  return renderUniverseStep({ document: draftDocument(), query: () => null, fieldErrors: {}, memoire: { ok: true }, ...ctx }, onAction);
}

test("R1 — 🧭 R porte le nom du produit en tête, et son sous-titre — ⛔ plus de ligne d'état, aucun repère de rang", () => {
  /* ⚖️ Eric, 29/09 : le titre et son sous-titre sont GARDÉS ; la ligne « in browser :
     <nom> · saved » est RETIRÉE ; et les repères `R`, `B0…B4` ne s'affichent jamais
     (🙏 un rang n'est pas le nom d'une page). */
  const node = racine();
  assert.equal(node.querySelectorAll(".tdc-marque")[0].textContent, "SOWLREACH");
  assert.equal(node.querySelectorAll(".tdc-sous-titre")[0].textContent, "Agnostic SRD 5.2.1 interface");
  assert.equal(node.querySelectorAll(".tdc-etat, .tdc-nom").length, 0, "⛔ la ligne d'état ne revient pas");
  assert.doesNotMatch(node.textContent, /\b(R|B[0-4])\b/, "aucun repère de rang dans ce que le joueur lit");
});

test("R2 — 🔴 le geste majeur est `New character` : il OUVRE LA FENÊTRE, puis l'étape 1 — et R n'a pas de Done", () => {
  /* 🔄 LOT 357 — R2 tenait `Create character` → l'étape 1 DU PERSO EN COURS, sans rien
     créer (`ouvrirLaCreation`). Eric l'a redicté le 29/09 après-midi : *« create Character
     on garde (nomme le plutôt new character) »*, et à « le grand bouton New character, que
     fait-il ? » : *« La fenêtre, puis l'étape 1 »*. Le garde tient toujours UN geste majeur,
     un seul verbe, et pas de `Done` ; il tient maintenant que ce verbe est la FENÊTRE —
     jamais une naissance sans avertissement, jamais l'étape 1 sans elle.
     🗄️ `Build a character` (08/09) → `Create character` (350) → `New character` (357). */
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  const majeurs = node.querySelectorAll(".menu-porte[data-majeure]");
  assert.deepEqual(majeurs.map((b) => b.textContent), ["New character"], "UN geste majeur, sous le mot d'Eric");
  majeurs[0].dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirNouveauPersonnage" }],
    "⛔ la fenêtre d'abord — la naissance et l'étape 1 ne viennent qu'après un choix (premier-pas)");
  assert.equal(node.dataset.sortieIci, undefined, "⛔ pas de paire de sortie à la racine : un Done doublerait ce bouton");
  assert.equal(node.querySelectorAll(".tdc-majeur").length, 0, "🗄️ `Build a character` ne revient pas");
  assert.equal(node.querySelectorAll("button").some((b) => b.textContent === "Create character"), false,
    "🗄️ `Create character` a pris le nom `New character`");
});

test("R3 — 🔌 LES VERBES DE R SONT CEUX QU'ERIC A DICTÉS, NI PLUS NI MOINS", () => {
  /* 🗄️ R3 tenait le trio `Open · Save · Forget` au format réglementé ; le trio est
     parti (D1, D6, D8). Ce garde tient maintenant l'ENSEMBLE : chaque bouton VIVANT
     de R, pressé une fois, émet UN verbe, et l'ensemble est celui de la dictée.
     ⚔️ Un bouton de plus, un verbe de plus, ou une porte réservée qui se réveille
     sans son lot → rouge ici. */
  /* 🔄 LOT 357 — l'ensemble change avec la redictée : `Create character` devient `New
     character` (la fenêtre), la porte `New character` du bas disparaît, et `Dungeon Master`
     se réveille — son lot, c'est celui-ci (sa page, R9). */
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  const vivants = node.querySelectorAll("button").filter((b) => !b.disabled);
  for (const b of vivants) b.dispatchEvent({ type: "click" });
  /* 🔄 LOT 376 — `Vault` se réveille : son lot, c'est celui-ci (sa page, `tests/vault-376.test.mjs`). */
  assert.deepEqual(vivants.map((b) => b.textContent),
    ["New character", "My characters", "Dungeon Master", "Vault", "Layers", "Display"]);
  assert.deepEqual(gestes.map((g) => g.kind),
    ["ouvrirNouveauPersonnage", "ouvrirLeMagasin", "ouvrirDungeonMaster", "ouvrirVault", "ouvrirLayers", "ouvrirDisplay"]);
});

test("R4 — 💤 LA PLACE RÉSERVÉE DE R : Campaign code — présente, éteinte, un mot SOUS elle ; Dungeon Master et Vault vivent", () => {
  /* ⚖️ Eric, 29/09 : *« Vault (droite, réservé) »*, et le code de campagne présent, éteint,
     en T0 — *« Campaign code on garde »*, redit l'après-midi. ⭐ LA FORME est celle de
     `Double view` quand la fenêtre est trop petite (📍 `menu-reglage-impossible-reste-
     visible`) : présente, éteinte, un mot — ⛔ pas une seconde forme.
     🔄 LOT 357 — `Dungeon Master` QUITTE les places réservées de R : sa porte est vivante et
     ouvre sa page, dont les QUATRE éléments sont, eux, réservés (R9).
     🗄️ `DM · Tools` (08/09) : `Tools` quitte R (*« on mettra ça chez le DM si on
     l'utilise »*), et `DM` s'écrit en entier. */
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  /* 🔄 LOT 376 — `Vault` QUITTE les places réservées de R : sa porte ouvre sa page, où ce sont les LIEUX
     non câblés (Dropbox, Google Drive, OneDrive, GitHub, Other) qui sont réservés. La forme des places
     réservées reste gardée là-bas (`tests/vault-376.test.mjs`, P2) et sur la page DM (R9). */
  const reservees = node.querySelectorAll("button[data-reserve]");
  assert.deepEqual(reservees.map((b) => b.textContent), []);
  for (const vivante of ["Dungeon Master", "Vault"]) {
    const b = node.querySelectorAll("button").find((x) => x.textContent === vivante);
    assert.ok(b && b.disabled !== true && b.dataset.reserve === undefined, `\`${vivante}\` est une porte VIVANTE`);
  }
  const code = node.querySelectorAll(".tdc-code[data-reserve]")[0];
  assert.ok(code, "le code de campagne a sa place");
  const champ = code.querySelectorAll("input")[0];
  assert.equal(champ.disabled, true, "présent, éteint");
  assert.ok(champ.className.includes("tdc-code-champ"), "en T0 — la feuille le dit (`.tdc-code-champ`)");
  assert.equal(code.querySelectorAll(".tdc-bientot")[0].textContent, "soon");
  /* ⛔ AUCUN ÉCOUTEUR : un champ qui accepterait une frappe sans rien en faire
     serait un bouton mort (le transport de table n'est pas construit). */
  champ.dispatchEvent({ type: "change" });
  champ.dispatchEvent({ type: "input" });
  assert.deepEqual(gestes, [], "le code n'émet rien tant qu'il n'est pas câblé");
  assert.equal(node.querySelectorAll("button").some((b) => /^(Tools|DM)$/.test(b.textContent)), false, "🗄️ ni `Tools` ni `DM`");
});

test("R5 — 🚪 LES CINQ PORTES EN DEUX RANGÉES : My characters · Dungeon Master / Vault · Layers · Display — et plus de pied", () => {
  /* 🔄 LOT 357 — R5 tenait six portes sur trois rangées (*« My characters (gauche) · New
     character (centre) · Vault (droite) · Layers (gauche) · Dungeon Master (droite) ·
     Display »*, 29/09 matin). Redicté l'après-midi : *« jusqu'à new character : celui doit
     dégager […] donc les 4 boutons du bas. My characters, Vault, Layers, display. centre les
     2 par en 2 rangées »* ; puis *« 1ere rangée : My characters / Dungeon Master · 2e rangée
     : Vault / Layers / Display »*. Le centrage se lit dans la feuille (R11).
     ⚖️ Et à « le pied actuel de R (le livre FH Web, le `?`) » : *« pas de livre ni de ? dans
     l'étape Menu »*. 🗄️ R5 tenait aussi, avant le 350, la rangée du bas (le livre, `Display
     · DM · Tools` au standard). */
  const node = racine();
  const rangees = node.querySelectorAll("nav.tdc-portes .tdc-rangee");
  assert.deepEqual(rangees.map((r) => r.dataset.disposition), ["deux", "trois"]);
  assert.deepEqual(rangees.map((r) => r.querySelectorAll("button").map((b) => b.textContent)),
    [["My characters", "Dungeon Master"], ["Vault", "Layers", "Display"]]);
  assert.equal(node.querySelectorAll("button").filter((b) => b.textContent === "New character").length, 1,
    "⛔ la porte `New character` du bas est partie : un seul organe par geste (le grand bouton)");
  assert.equal(node.querySelectorAll(".parcours-pied, .fiche-livre, .tdc-porte, .tdc-pied, .tdc-trio").length, 0,
    "⛔ ni pied, ni livre, ni les petites portes d'avant");
  /* ⭐ LE GABARIT LARGE, PAR LA FAMILLE : toutes les portes de R sont `.menu-porte`,
     que la feuille met au patron (105 × 40, cible 44 — `tests/bouton-inventaire`). */
  assert.ok(node.querySelectorAll("button").every((b) => b.className === "menu-porte"),
    "une seule famille de boutons sur R");
});

test("R6 — 🧑 `My characters` est la SEULE porte vers le magasin — C37 tranchée par la dictée", () => {
  /* ⚖️ DEUX MOTS D'ERIC, VRAIS TOUS LES DEUX, DITS À DEUX JOURS D'ÉCART : *« My
     characters bouton large bleu cadré à gauche »* (08/09) et *« j'appuie sur Open,
     qui est sur R ; dans cette fenêtre, toutes mes saves »* (10/09). Depuis le lot
     195 c'était le MÊME rang B, et R6 tenait que les deux portes ne divergent pas
     (A-TRANCHER §C37). 🔄 29/09 : la dictée ne garde que `My characters`, à gauche.
     ⚔️ Ce garde tient maintenant qu'il n'y a plus DEUX portes. */
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  for (const b of node.querySelectorAll("button").filter((x) => !x.disabled)) b.dispatchEvent({ type: "click" });
  assert.equal(gestes.filter((g) => g.kind === "ouvrirLeMagasin").length, 1, "⛔ deux portes vers une pièce, c'est C37 rouverte");
  const b1 = renderUniverseStep({
    document: draftDocument({ name: "Ilyra" }), query: () => null, fieldErrors: {}, memoire: { ok: true },
    ecran: "characters", magasin: { etat: "liste", groupes: [], entrees: [] }
  }, () => {});
  assert.equal(b1.dataset.ecran, "characters");
  assert.equal(b1.dataset.sortieIci, "true", "rang B : la coquille pose Back · Done");
});

test("R7 — 💡 LE VOYANT SRD A QUITTÉ R ; ce que R en garde, c'est le SRD en tête de `Books`", () => {
  /* ⚖️ 09/09 : *« Le bouton SRD est un VOYANT, pas un bouton — il est toujours
     actif. »* R7 tenait le voyant SUR R ; 🔄 29/09, R LIT `Rules` et le voyant vit
     dans `Layers` (ecran-layers le garde en entier : ni bouton, ni switch, ni
     aria-checked, aucun écouteur). Ce garde tient les deux moitiés qui touchent R :
     ⛔ aucun contrôle à deux positions sur R, et le SRD n'y est jamais ÉTEINT — il
     ouvre `Books` dans les deux jeux, comme la lampe reste allumée là-bas. */
  for (const doc of [docSrd(), docFh()]) {
    const node = racine({ document: doc });
    assert.equal(node.querySelectorAll('[role="switch"]').length, 0, "⛔ aucun contrôle à deux positions sur R");
    assert.match(valeur(node, "books"), /^SRD\b/, "le SRD est le book de base, en tête, dans les deux jeux");
    const lampe = socle(layers(doc));
    assert.equal(lampe.dataset.on, "true", "témoin : là-bas, la lampe est allumée dans les deux jeux");
    assert.notEqual(lampe.tagName, "BUTTON", "témoin : et c'est toujours une lampe");
  }
});

test("R8 — 🧭 L'AIGUILLEUR DE R : l'organe `.guide-mot`, UNE fois, et il ne nomme que ce qui est écrit sur R", () => {
  /* ⚖️ Eric, 29/09 : *« Aiguilleur qui explique qu'on peut activer un Livre ou un
     autre dans layers, que le DM peut donner un code de campagne. »* ⏳ Le texte est
     le BROUILLON du plan v10 — Eric arrête les mots. ⛔ Un aiguilleur POINTE
     (📍 `aide-aiguilleur-et-tutoriel-disent-meme-etape`) : chaque lieu qu'il nomme
     doit être écrit sur R. ⚔️ Renommer une porte sans lui → rouge ici. */
  const node = racine();
  const aiguilleurs = node.querySelectorAll(".guide-mot");
  assert.equal(aiguilleurs.length, 1, "un aiguilleur, l'organe partagé — ⛔ jamais un sosie");
  assert.equal(aiguilleurs[0].textContent, MOT_DE_L_AIGUILLEUR_DU_MENU);
  const ecrit = [
    ...node.querySelectorAll("button").map((b) => b.textContent),
    ...node.querySelectorAll(".doc-field-label, .tdc-ligne-mot").map((l) => l.textContent)
  ];
  for (const lieu of ["Layers", "Dungeon Master"]) {
    assert.ok(MOT_DE_L_AIGUILLEUR_DU_MENU.includes(lieu), `témoin : l'aiguilleur nomme \`${lieu}\``);
    assert.ok(ecrit.includes(lieu), `\`${lieu}\` est écrit sur R`);
  }
  assert.ok(ecrit.some((m) => /^campaign code$/i.test(m)) && /campaign code/i.test(MOT_DE_L_AIGUILLEUR_DU_MENU),
    "…et le code de campagne, sous le nom que porte sa place");
});

/* ══ LOT 357 — LA PAGE DUNGEON MASTER, LE MOT DES CRÉATIONS MAISON, LE CÂBLAGE ═══════
   ⚖️ Eric, 29/09 après-midi : *« table items devient -> campaign items (et va dans Dungeon
   master). il y au aussi un bouton homebrew à l'intérieur de Dungeon master […] garde ce
   qu'on met dans Dungeon master en mémoire, voire crée les elements dans une page sans
   nécessairement les cabler. Le bouton connect to VTT sera dedans aussi. »* — et `Create
   campaign` (*« il se créera dans Dungeon Master/ Create campaign »*). */
const pageDm = (onAction = () => {}) =>
  renderUniverseStep({ document: draftDocument(), query: () => null, fieldErrors: {}, ecran: "dm" }, onAction);

test("R9 — 🎲 LA PAGE DUNGEON MASTER : quatre places réservées, deux rangées de deux, sans câblage — et le retour des rangs B", () => {
  const gestes = [];
  const page = pageDm((a) => gestes.push(a));
  assert.equal(page.dataset.ecran, "dm", "le rang que la coquille nomme `dm`");
  assert.equal(page.dataset.sortieIci, "true", "rang B : la coquille pose le retour au Menu, comme pour les autres");
  assert.ok(page.className.includes("dalle-intermediaire"), "la dalle de R, voile à 50 %");
  assert.equal(page.querySelectorAll("h3.tdc-titre-b")[0].textContent, "Dungeon Master", "le titre des rangs B");
  const rangees = page.querySelectorAll("nav.tdc-portes .tdc-rangee");
  assert.deepEqual(rangees.map((r) => r.querySelectorAll("button").map((b) => b.textContent)),
    [["Create campaign", "Campaign items"], ["Homebrew", "Connect to VTT"]]);
  /* ⭐ LA FORME UNIQUE DU « PAS ENCORE » : présente, éteinte, « soon » SOUS elle — la même
     que `Vault` sur R (📍 `menu-reglage-impossible-reste-visible`). */
  for (const b of page.querySelectorAll("button")) {
    assert.equal(b.disabled, true, `${b.textContent} : réservée = éteinte`);
    assert.equal(b.dataset.reserve, "true", `${b.textContent} : marquée réservée`);
    assert.equal(b.className, "menu-porte", `${b.textContent} : le gabarit des portes de R`);
    const place = b.parentNode;
    const mot = place.querySelectorAll(".tdc-bientot")[0];
    assert.equal(mot && mot.textContent, "soon", `${b.textContent} : son mot`);
    assert.ok(place.childNodes.indexOf(mot) > place.childNodes.indexOf(b), `${b.textContent} : le mot SOUS elle`);
    b.dispatchEvent({ type: "click" });
  }
  assert.deepEqual(gestes, [], "⛔ aucun câblage : *« sans nécessairement les cabler »*");
  /* ⏳ `Tools` : *« on mettra ça chez le DM si on l'utilise (à faire plus tard) »* — pas encore. */
  assert.equal(page.querySelectorAll("button").some((b) => /^Tools$/.test(b.textContent)), false, "⏳ `Tools` n'y est pas encore");
});

test("R10 — 🏷️ LES MOTS DU JOUEUR : `Campaign items` (plus `Table items`), et « Homebrew » NULLE PART sauf le bouton de la page Dungeon Master", () => {
  /* ⚖️ Eric, 29/09 : *« table items devient -> campaign items »*. Et à « le bouton des
     créations maison : quel mot, puisque le lexique du 10/09 bannit "homebrew" devant le
     joueur ? » → *« Homebrew »* (relayé par ARCHI 35). ⭐ C'est une EXCEPTION NOMMÉE (📍
     `menu-dm-bouton-homebrew`) : le ban tient partout ailleurs. Ce garde la tient des deux
     côtés — le mot EST sur le bouton de la page DM, et il n'est sur AUCUNE autre page du Menu.
     ✅ Le lot 351 a retiré `+ Table items` de `Layers` (fusionné, v908) : la page rejoint ce
     garde, Fate's Hand allumé ET éteint — éteint, ses livres descendent dans la liste du bas. */
  const doc = draftDocument();
  const pages = {
    R: racine(),
    dm: pageDm(),
    layersFh: layers(docFh()),
    layersSrd: layers(docSrd()),
    display: renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, ecran: "display" }, () => {}),
    characters: renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true },
      ecran: "characters", magasin: { etat: "liste", groupes: [], entrees: [] } }, () => {})
  };
  for (const [nom, page] of Object.entries(pages)) {
    assert.doesNotMatch(page.textContent, /table items/i, `⛔ \`Table items\` sur ${nom} : le mot est \`Campaign items\``);
  }
  assert.equal(pages.dm.querySelectorAll("button").filter((b) => b.textContent === "Campaign items").length, 1,
    "`Campaign items` a sa place, sur la page Dungeon Master");
  const ouHomebrew = Object.entries(pages).flatMap(([nom, page]) =>
    page.querySelectorAll("*").filter((n) => n.childNodes.every((c) => typeof c.textContent === "string" && !c.tagName) && /homebrew/i.test(n.textContent))
      .map((n) => `${nom}:${n.tagName}:${n.textContent}`));
  assert.deepEqual(ouHomebrew, ["dm:BUTTON:Homebrew"], "« Homebrew » : UN endroit, le bouton de la page DM");
});

test("R11 — 🔌 LA COQUILLE OUVRE LA PAGE DUNGEON MASTER COMME LES AUTRES RANGS B, et la feuille CENTRE les rangées", () => {
  /* ⭐ AUCUN MÉCANISME NEUF (lot 136) : le même compteur `palier`, la même branche
     `menuBranche` — donc `pressBack` sait déjà remonter. */
  assert.match(SHELL, /action\.kind === "ouvrirDungeonMaster"\) \{ state\.palier = 2; state\.menuBranche = "dm"; openSurface\(\); return; \}/,
    "⛔ la porte `Dungeon Master` doit ouvrir son rang B par l'organe partagé");
  /* 🗄️ `ouvrirLaCreation` (le `Create character` du lot 350) : plus aucun écran ne l'émet. */
  assert.doesNotMatch(SHELL, /"ouvrirLaCreation"/, "⛔ un verbe sans émetteur ne reste pas dans la coquille");
  /* ⭐ LE CENTRAGE : *« centre les 2 par en 2 rangées »*. L'écart entre deux portes se DÉDUIT
     du trio — ⛔ il ne s'écrit pas : trois pistes de porte, deux intervalles égaux, et chaque
     porte de la paire centrée sur deux pistes et l'intervalle qui les sépare.
     ⚠️ Le DOM des tests n'a pas de mise en page : ce garde lit la feuille ; la géométrie
     rendue (la paire sur les intervalles du trio) se mesure au navigateur. */
  const regle = (CSS.match(/\.tdc-rangee\s*\{([^}]*)\}/) || [])[1] || "";
  assert.match(regle, /display:\s*grid/, "⛔ la rangée est une grille");
  assert.match(regle, /justify-items:\s*center/, "⛔ chaque porte se centre dans son aire");
  assert.match(regle, /grid-template-columns:\s*var\(--bouton-moyen\) 1fr var\(--bouton-moyen\) 1fr var\(--bouton-moyen\);/,
    "⛔ trois pistes de porte et deux intervalles ÉGAUX : le trio remplit la largeur");
  const aire = (dispo, rang) => (CSS.match(new RegExp(String.raw`\.tdc-rangee\[data-disposition="${dispo}"\] > :nth-child\(${rang}\) \{ grid-column: ([^;]+); \}`)) || [])[1];
  assert.equal(aire("trois", 2), "3", "le trio : la deuxième porte sur la piste du milieu");
  assert.equal(aire("trois", 3), "5", "…la troisième sur la dernière");
  assert.equal(aire("deux", 1), "1 / 4", "la paire : la première porte couvre les pistes 1 à 3 — centrée, elle tombe sur le premier intervalle");
  assert.equal(aire("deux", 2), "3 / 6", "…la seconde les pistes 3 à 5 — sur le second intervalle");
  assert.match(CSS, /\.tdc-rangee\[data-disposition="deux"\] > \* \{ grid-row: 1; \}/,
    "⛔ la paire tient sur UNE ligne : ses deux aires partagent la piste du milieu, sans `grid-row` la seconde passerait dessous");
  assert.doesNotMatch(CSS, /\.tdc-rangee[^{]*\{[^}]*space-between/, "🗄️ plus de `space-between` : la paire tomberait aux bords");
});

test("S1 — 🔴 L'INTERRUPTEUR : role=switch, aria-checked = data-on, et cliquer INVERSE — éprouvé là où il vit", () => {
  /* Trois canaux pour un état — la couleur (feuille, sur data-on), la position
     (feuille), et aria-checked. L'écran n'écrit aucune couleur. */
  /* ⚠️ ÉPROUVÉ SUR LES DEUX ÉTATS — vu vert à tort le 08/09 : testé sur la seule
     pile SRD (éteint), un `aria-checked` figé à "false" coïncidait avec `data-on`
     et le garde ne voyait rien. Un garde d'égalité se teste là où les deux
     valeurs DIVERGENT si l'une est fausse.
     🔄 LOT 350 — R n'a plus d'interrupteur (B1) : le maître Fate's Hand vit dans
     `Layers`, et c'est LÀ que ce garde l'éprouve, sur les deux états. */
  for (const node of [layers(docSrd()), layers(docFh())]) {
    assert.ok(interrupteurs(node).length > 0, "témoin : l'écran porte des interrupteurs");
    for (const sw of interrupteurs(node)) {
      assert.equal(sw.getAttribute("role"), "switch");
      assert.equal(sw.getAttribute("aria-checked"), sw.dataset.on, "aria-checked porte EXACTEMENT data-on");
      assert.ok(sw.querySelectorAll(".interrupteur-piste .interrupteur-pouce")[0], "une piste, un pouce — dessinés, jamais un glyphe");
    }
  }
  assert.equal(maitre(layers(docFh())).dataset.on, "true", "témoin : le second écran est bien ALLUMÉ");
  for (const doc of [docSrd(), docFh()]) {
    const vus = [];
    const sw = maitre(layers(doc, (a) => vus.push(a)));
    const avant = sw.dataset.on === "true";
    sw.click();
    assert.equal(vus.length, 1);
    assert.equal(vus[0].value, avant ? "srd" : "srdfh", "le clic demande l'INVERSE de l'état affiché");
  }
});

test("S2 — APPEARANCE : Tutorials et Double view sont des interrupteurs ; Double view grisé quand la fenêtre ne le porte pas", () => {
  const app = (ctx) => renderUniverseStep({ document: draftDocument(), query: () => null, fieldErrors: {}, ecran: "display", fonds: [], echelle: { auto: {}, crans: [] }, ...ctx }, () => {});
  const n1 = app({ tutoriel: true, vueDouble: true, vueDoublePossible: true });
  const sws = n1.querySelectorAll(".interrupteur");
  const mots = sws.map((b) => b.querySelectorAll(".interrupteur-mot")[0].textContent);
  assert.deepEqual(mots, ["Tutorials", "Double view"]);
  assert.deepEqual(sws.map((b) => b.dataset.on), ["true", "true"]);
  const n2 = app({ tutoriel: false, vueDouble: true, vueDoublePossible: false });
  const vue = n2.querySelectorAll(".interrupteur")[1];
  assert.equal(vue.disabled, true, "sous la porte : désarmé, jamais retiré");
  assert.equal(vue.dataset.on, "false", "et il s'affiche ÉTEINT : une préférence gardée mais inapplicable ne s'annonce pas allumée");
  assert.match(n2.textContent, /too small for two panels/, "et il DIT pourquoi il dort");
});

/* ══════════════════════════════════════════════════════════════════════════
   ⚖️ LES LIVRES DU JOUEUR — un axe orthogonal aux règles (Eric, 09/09)
   « que tu puisses désactiver dmg player et toujours te raccrocher au SRD »,
   « tu dois pouvoir les activer et les désactiver ».
   ══════════════════════════════════════════════════════════════════════════ */

test("A5 — ⛔ LA MINE : un livre allumé ne doit PAS rendre la pile inconnue", () => {
  /* 🔴 SANS LE CORRECTIF, CE TEST EST ROUGE ET L'ÉCRAN MORT S'AFFICHE POUR
     TOUT LE MONDE. `currentStack` comparait la pile déclarée par ÉGALITÉ
     EXACTE de l'ensemble ; `ecran-mort.mjs:97` rend « pile inconnue » dès que
     `currentStack` est `null` sur un document qui porte des couches. Allumer
     le DMG suffisait donc à condamner tous les personnages. */
  const avecLivre = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en"]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(avecLivre), "srd",
    "un personnage SRD qui allume son DMG joue TOUJOURS en SRD — le livre apporte du contenu, pas des règles");

  const fhAvecDeuxLivres = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xphb-en", "xdmg-en", ...FH_LAYER_IDS]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(fhAvecDeuxLivres), "srdfh",
    "et Fate's Hand avec les deux livres reste Fate's Hand");
});

test("A6 — `currentBooks` dit QUELS livres sont allumés, dans un ordre STABLE", () => {
  const aucun = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: []
  } });
  assert.deepEqual(currentBooks(aucun), [], "aucun livre : la liste est vide, pas nulle");
  /* ⚔️ L'ORDRE EST CELUI DE `LIVRE_LAYER_IDS`, PAS CELUI DU DOCUMENT — deux
     documents qui portent les mêmes livres doivent rendre la MÊME liste, sinon
     le Menu afficherait ses interrupteurs dans un ordre qui change tout seul. */
  const inverse = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en", "xphb-en"]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.deepEqual(currentBooks(inverse), LIVRE_LAYER_IDS,
    "l'ordre vient de la liste, jamais du document");
  assert.deepEqual(currentBooks(null), [], "un document absent n'est pas une erreur, c'est zéro livre");
});

test("A7 — ⚔️ CE QUI REND UNE PILE INNOMMABLE, C'EST UNE RÈGLE QUI MANQUE — PAS DU CONTENU EN TROP", () => {
  /* ⛔ LE RISQUE DU CORRECTIF : à force d'ignorer des couches, `currentStack`
     pourrait finir par tout accepter. Il doit continuer à refuser ce qui l'a
     toujours mérité — une pile FH amputée d'une de ses couches de RÈGLES. */
  const fhIncomplete = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en", ...FH_LAYER_IDS.slice(1)]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(fhIncomplete), null,
    "il manque une couche FH : la pile reste innommable, et le livre n'y change rien");
  const sansSrfh = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(sansSrfh), null, "sans `srfh`, aucune des deux piles nommées ne colle");
});

test("A8 — ⚖️ « SI ON A BIEN FAIT NOTRE BOULOT, LES LIVRES RAJOUTENT DU HOMEBREW » (Eric, 09/09)", () => {
  /* 🔴 C'EST UNE ÉPREUVE, PAS UNE PHRASE. Elle dit : un livre ne doit être
     qu'un cas de homebrew. Si le code doit CONNAÎTRE le nom d'un livre pour
     que la pile tienne, on a mal fait le travail — et c'était le cas une heure
     plus tôt, avec une liste `LIVRE_LAYER_IDS` en dur consultée par
     `currentStack`. Ce test est ce qui empêche ce cas particulier de revenir. */
  const inconnue = "la-classe-que-mon-ami-a-ecrite";
  assert.equal(RULE_LAYER_IDS.includes(inconnue), false, "témoin : personne n'a jamais entendu parler de cette couche");
  assert.equal(LIVRE_LAYER_IDS.includes(inconnue), false, "témoin : ce n'est pas un livre non plus");
  const doc = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, inconnue]), choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(doc), "srd",
    "⛔ un homebrew que personne n'a listé ne doit PAS envoyer le personnage sur l'écran mort");
  assert.deepEqual(currentContent(doc), [inconnue], "il est vu, nommé, et rangé du côté du CONTENU");

  /* ⚔️ ET LA MÊME CHOSE POUR UN LIVRE — la preuve qu'il n'a rien de spécial :
     les deux passent par le MÊME chemin, et rendent le MÊME résultat. */
  const avecLivre = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en"]), choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(avecLivre), currentStack(doc),
    "un livre et un homebrew inconnu doivent donner EXACTEMENT le même nom de pile");
  assert.equal(currentContent(avecLivre).length, currentContent(doc).length,
    "et être comptés du même côté");
});
