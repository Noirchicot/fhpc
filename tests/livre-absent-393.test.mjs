/* ══ LOT 393 — ALLUMER UN LIVRE NE FAIT PLUS OUBLIER UN LIVRE ABSENT ════════════════════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 393 livre absent garde.md` (ARCHI 35, 30/09), tiré du banc du lot 390 : un
   perso déclare le PHB sur un appareil qui ne l'a pas ; on allume Emberwood — et le perso perdait sa déclaration
   du PHB, sans qu'on y touche (`monterLeLivre` vidait `build.layers`, `rebuild` adoptait la pile MONTÉE).
   Une perte de donnée silencieuse, que `socle-perso-sauve-s-ouvre-toujours` interdit déjà.

   🔴 CE QUE CE FICHIER GARDE :
     A. L'ORGANE (`garderLesLivresAbsents`, recalage.mjs) : un livre absent déclaré RESTE, à sa place, qu'on
        allume ou qu'on éteigne un autre livre (ou Fate's Hand) ; un livre MONTÉ qu'on éteint PART (c'est le
        geste) ; une couche de l'app retirée du produit ne se repose pas. Le câblage des deux gestes est tenu
        par `tests/ecran-layers.test.mjs` F4.
     B. LE MOT D'UN CHOIX MORT qui vise un record de catalog nomme la ligne à rallumer — par le préfixe du
        record (la règle du juge du lot 390), contre la liste des catalogs connus que la coquille passe.
     C. LE GUIDE dit l'image générique. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { garderLesLivresAbsents } = await import("../ui/builder/recalage.mjs");
const { motDUnRecordAbsent, MOT_HORS_PILE } = await import("../ui/builder/mot-du-choix.mjs");
/* ⚠️ LA FEUILLE PORTE UN ÉTAT (la liste des catalogs connus) : on l'importe par le SPÉCIFICATEUR EXACT que
   `mot-du-choix.mjs` emploie (`./interrupteurs.mjs?v=N`) — sinon Node charge une seconde instance, et la liste
   posée ici n'est pas celle que le mot lit. Dans la page, tout passe par `?v=N` : une seule instance. */
const MOT = path.join(ROOT, "ui", "builder", "mot-du-choix.mjs");
const SPEC = /from "(\.\/interrupteurs\.mjs[^"]*)"/.exec(fs.readFileSync(MOT, "utf8"))[1];
const { coucheDUnId, interrupteurDUnId, connaitreLesCatalogues } = await import(new URL(SPEC, pathToFileURL(MOT)).href);

const c = (id, hash = "h") => ({ id, version: "1", hash });
const SOCLE = [c("srd-5.2.1-en"), c("srfh-shelving-en"), c("srfh-mecaniques-en")];
const FH = [c("fh-species-en"), c("fh-skills-en")];
const ids = (l) => l.map((x) => x.id);
const pile = (...liste) => liste.map((id) => ({ id }));

/* ══ A — L'ORGANE ═══════════════════════════════════════════════════════════════════════════════════ */

test("A1 — 📚 ON ALLUME EMBERWOOD : le PHB que l'appareil n'a pas RESTE déclaré, à sa place (le scénario du banc du lot 390)", () => {
  const avant = [...SOCLE, c("xphb-en"), ...FH];                         // le PHB déclaré, absent de l'appareil
  const apres = [...SOCLE, c("example-emberwood"), ...FH];                // la pile MONTÉE, adoptée par `rebuild`
  const montee = pile(...ids(SOCLE), "example-emberwood", ...ids(FH));    // le PHB n'est monté nulle part
  const garde = garderLesLivresAbsents(apres, avant, montee);
  assert.deepEqual(ids(garde), ["srd-5.2.1-en", "srfh-shelving-en", "srfh-mecaniques-en", "xphb-en", "example-emberwood", "fh-species-en", "fh-skills-en"],
    "⭐ le PHB reste, juste après ce qui le précédait");
  assert.deepEqual(garde.find((x) => x.id === "xphb-en"), c("xphb-en"), "sa déclaration entière (version, empreinte)");
  assert.notEqual(garde.find((x) => x.id === "xphb-en"), avant[3], "une copie : l'organe ne partage rien");
  /* rien d'absent : le même tableau */
  const rien = [...SOCLE, ...FH];
  assert.equal(garderLesLivresAbsents(rien, rien, pile(...ids(rien))), rien);
});

test("A2 — 🔌 ON ÉTEINT UN LIVRE : l'absent reste, le livre MONTÉ qu'on éteint part ; un catalog absent reste ; une couche de l'app retirée ne revient pas", () => {
  const avant = [...SOCLE, c("xphb-en"), c("xdmg-en"), c("noirchicot-mistlands"), ...FH, c("fh-retiree-en")];
  const apres = [...SOCLE, ...FH];                                         // on a éteint le DMG (monté)
  const montee = pile(...ids(SOCLE), "xdmg-en", ...ids(FH));               // le DMG est monté, éteint
  const garde = garderLesLivresAbsents(apres, avant, montee);
  assert.deepEqual(ids(garde), ["srd-5.2.1-en", "srfh-shelving-en", "srfh-mecaniques-en", "xphb-en", "noirchicot-mistlands", "fh-species-en", "fh-skills-en"],
    "⭐ le PHB et le catalog absents restent ; ⛔ le DMG éteint part (c'est le geste) ; ⛔ la couche retirée du produit ne revient pas");
});

test("A3 — 🧷 LES DEUX GESTES DE LAYERS reposent les livres absents — un livre, et Fate's Hand", () => {
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
  const reposer = shell.match(/function reposerLesLivresAbsents\(avant\) \{[\s\S]*?\n\}/)[0];
  assert.match(reposer, /garderLesLivresAbsents\(state\.document\.build\.layers, avant, state\.engine\.layers\.verbs\.stack\(\)\)/,
    "la pile ENTIÈRE montée, éteintes comprises : un livre éteint n'est pas absent");
  for (const nom of ["monterLesCouches", "monterLeLivre"]) {
    const corps = shell.match(new RegExp(`function ${nom}\\([^)]*\\) \\{([\\s\\S]*?)\\n\\}`))[1];
    assert.match(corps, /reposerLesLivresAbsents\(avant\);\s*$/, `${nom} repose les livres absents, en dernier`);
  }
});

/* ══ B — LE MOT D'UN CHOIX MORT ═══════════════════════════════════════════════════════════════════════ */

test("B1 — 🗣️ UN CHOIX MORT QUI VISE UN RECORD DE CATALOG nomme la ligne à rallumer — son NOM monté, son id absent", () => {
  try {
    connaitreLesCatalogues([{ id: "example-emberwood", nom: "Emberwood (model catalog)" }, { id: "noirchicot-mistlands", nom: "noirchicot-mistlands" }]);
    assert.equal(coucheDUnId("example-emberwood:spell:en:ember-lance"), "example-emberwood", "⭐ le préfixe EST le catalog (la règle du juge)");
    assert.deepEqual(interrupteurDUnId("example-emberwood:spell:en:ember-lance"), { id: "example-emberwood", label: "Emberwood (model catalog)" });
    assert.equal(motDUnRecordAbsent("example-emberwood:spell:en:ember-lance"), "Ember lance comes with Emberwood (model catalog) — switch it on in Layers",
      "le nom de la ligne que Layers montre");
    assert.equal(motDUnRecordAbsent("noirchicot-mistlands:feat:en:fog-step"), "Fog step comes with noirchicot-mistlands — switch it on in Layers",
      "un catalog absent de l'appareil : son id, comme Layers le montre alors");
    assert.equal(coucheDUnId("someone-unknown:spell:en:x"), null, "⛔ un préfixe qu'aucun catalog connu ne porte n'est rien");
    assert.equal(motDUnRecordAbsent("someone-unknown:spell:en:x"), `X — ${MOT_HORS_PILE}`);
    assert.equal(interrupteurDUnId("fh:species:en:araag").label, "Fate's Hand", "et Fate's Hand reste Fate's Hand");
  } finally {
    connaitreLesCatalogues([]);
  }
  assert.equal(coucheDUnId("example-emberwood:spell:en:ember-lance"), null, "la liste vidée : plus rien de connu");
});

test("B2 — 🧷 LA COQUILLE PASSE LES CATALOGS CONNUS AVANT DE PEINDRE — ceux du lieu par leur nom, ceux que le perso déclare par leur id", () => {
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
  const refresh = shell.match(/function refresh\(\) \{[\s\S]*?paintBelt\(\);/)[0];
  assert.match(refresh, /reglerLaVue\(\);\s*connaitreLesCatalogues\(cataloguesConnus\(\)\);\s*paintBelt\(\);/, "avant de peindre");
  const connus = shell.match(/function cataloguesConnus\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(connus, /state\.cataloguesDuLieu/, "ceux que le lieu porte");
  assert.match(connus, /!estUnNomDeLApp\(id\)/, "⛔ jamais une couche de l'app : les noms réservés du juge");
  assert.equal((shell.match(/connaitreLesCatalogues\(/g) || []).length, 1, "UN seul écrivain de la liste");
});

/* ══ C — LE GUIDE ═════════════════════════════════════════════════════════════════════════════════════ */

test("C1 — 🖼️ LE GUIDE DIT L'IMAGE GÉNÉRIQUE : une espèce de catalog prend l'image générique, aucune image par catalog", () => {
  const guide = fs.readFileSync(path.join(ROOT, "docs", "CATALOG.md"), "utf8");
  assert.match(guide, /\*\*Pictures\.\*\* A species from a catalog shows the builder's generic picture: a catalog has no pictures of its\s+own for now\./);
});
