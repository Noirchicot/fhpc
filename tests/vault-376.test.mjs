/* ══ LOT 376 — VAULT : LA PAGE OÙ LE JOUEUR CHOISIT SON STOCKAGE, UNE FOIS ═══════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 376 vault.md` (ARCHI 35, 30/09).

   ⚖️ Eric, 29/09 : *« Vault (droite -> B2) »* ; *« exact, un bouton par stockage, + un choix libre
   "Other" »* — ⛔ jamais d'adresse à recopier ; le mandat du Menu R (B2) : *« Dropbox (en tête) · Google
   Drive · OneDrive · un fichier (la voie iCloud) · GitHub (catalogues de table publics) · Other »* ; seul
   le fichier est câblé. `Save location` sur My characters *« jusqu'au lot Vault »* (ratifié le 30/09,
   12:50).

   🔴 CE QUE CE FICHIER GARDE :
     L. LA TABLE DES LIEUX — l'ordre dicté, un seul lieu câblé ; le réglage du lieu retenu (l'organe).
     P. LA PAGE — l'ordre rendu, les places réservées éteintes avec leur mot, le lieu choisi qui se
        voit, `Save location` ici.
     C. LA COQUILLE — la porte `Vault` de R, un adaptateur par lieu câblé, le choix qui REMONTE le lieu,
        et `Save character` qui écrit au lieu choisi. */

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
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
const css = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));

const { LIEUX, LIEU_PAR_DEFAUT, lieuRetenu, choisirUnLieu, MOT_DU_FICHIER } = await import("../ui/builder/magasin.mjs");
const { renderUniverseStep, MOTS_DE_VAULT } = await import("../ui/builder/universe-step.mjs");

function baseDeFixture() {
  const rayons = new Map();
  const rayon = (nom) => { if (!rayons.has(nom)) rayons.set(nom, new Map()); return rayons.get(nom); };
  return {
    rayons,
    lire: async (nom, clef) => (rayons.has(nom) && rayons.get(nom).has(clef) ? rayons.get(nom).get(clef) : null),
    ecrire: async (nom, clef, valeur) => { rayon(nom).set(clef, valeur); }
  };
}
const vault = (lieu, surAction = () => {}) => renderUniverseStep({ ecran: "vault", lieux: LIEUX, lieu }, surAction);
const FICHIER = { id: "fichier", mot: MOT_DU_FICHIER, choisissable: true };

/* ══ L — LA TABLE DES LIEUX ══════════════════════════════════════════════════════════════════ */

test("L1 — ⚖️ L'ORDRE DICTÉ : Dropbox · Google Drive · OneDrive · le fichier · GitHub · Other — et le fichier seul est câblé", () => {
  assert.deepEqual(LIEUX.map((l) => l.id), ["dropbox", "google-drive", "onedrive", "fichier", "github", "other"],
    "⚖️ « Dropbox (en tête) · Google Drive · OneDrive · un fichier · GitHub · Other »");
  /* 🔄 LOT 377 — Dropbox est câblé (ARCHI 35, 30/09), et il porte `connexion` : on ne le choisit que connecté. */
  assert.deepEqual(LIEUX.filter((l) => l.cable).map((l) => l.id), ["dropbox", "fichier"], "le fichier, et Dropbox depuis le lot 377");
  assert.deepEqual(LIEUX.filter((l) => l.connexion === true).map((l) => l.id), ["dropbox"], "seul Dropbox exige une connexion");
  assert.equal(LIEU_PAR_DEFAUT, "fichier", "« ou dans un fichier si rien n'a été réglé »");
  assert.equal(Object.isFrozen(LIEUX) && LIEUX.every((l) => Object.isFrozen(l)), true, "une table qu'on lit, jamais qu'on retouche");
});

test("L2 — 🔑 LE LIEU RETENU : le défaut sans réglage ; un lieu NON câblé se refuse et n'écrit rien ; le fichier s'écrit et se relit", async () => {
  const base = baseDeFixture();
  assert.equal(await lieuRetenu(base), "fichier", "rien de réglé → le fichier");
  /* 🔄 LOT 377 — Dropbox est câblé : il se refuse tant que le joueur n'est pas connecté (voir plus bas). */
  for (const id of ["google-drive", "onedrive", "github", "other"]) {
    const issue = await choisirUnLieu(base, id);
    assert.equal(issue.etat, "refus", `⛔ ${id} n'est pas câblé`);
    assert.match(issue.raison, /not connected yet/);
  }
  assert.equal((await choisirUnLieu(base, "ftp")).etat, "refus", "un lieu qui n'existe pas");
  assert.deepEqual(await choisirUnLieu(base, "dropbox"), { etat: "refus", raison: "connect to Dropbox first" },
    "⛔ LOT 377 — un lieu qui exige une connexion ne se choisit pas sans elle");
  assert.equal(base.rayons.size, 0, "⛔ un refus n'écrit rien");
  assert.deepEqual(await choisirUnLieu(base, "fichier"), { etat: "choisi", id: "fichier" });
  assert.deepEqual(base.rayons.get("reglages").get("lieu"), { id: "fichier" });
  assert.equal(await lieuRetenu(base), "fichier");
  /* un réglage qui désignerait un lieu non câblé (un jour débranché) ne casse rien : le défaut */
  base.rayons.get("reglages").set("lieu", { id: "github" });
  assert.equal(await lieuRetenu(base), "fichier");
  /* 🔄 LOT 377 — connecté, Dropbox se choisit, et se relit. */
  assert.deepEqual(await choisirUnLieu(base, "dropbox", { connecte: true }), { etat: "choisi", id: "dropbox" });
  assert.equal(await lieuRetenu(base), "dropbox");
});

/* ══ P — LA PAGE ═════════════════════════════════════════════════════════════════════════════ */

test("P1 — 🗄️ LA PAGE REND LES SIX LIEUX DANS L'ORDRE DICTÉ, en deux rangées de trois", () => {
  const page = vault(FICHIER);
  assert.equal(page.dataset.ecran, "vault");
  assert.equal(page.dataset.sortieIci, "true", "⛔ elle ne porte pas sa sortie : la coquille pose `Back`");
  assert.equal(page.querySelector(".tdc-titre-b").textContent, MOTS_DE_VAULT.titre);
  const boutons = page.querySelectorAll("[data-lieu]");
  assert.deepEqual(boutons.map((b) => b.dataset.lieu), LIEUX.map((l) => l.id));
  assert.deepEqual(boutons.map((b) => b.textContent), ["Dropbox", "Google Drive", "OneDrive", "File", "GitHub", "Other"]);
  const rangees = page.querySelectorAll(".tdc-rangee");
  assert.deepEqual(rangees.map((r) => r.dataset.disposition), ["trois", "trois"]);
  assert.equal(page.querySelectorAll("input").length, 0, "⛔ jamais d'adresse à recopier");
});

test("P2 — 💤 LES LIEUX NON CÂBLÉS SONT DES PLACES RÉSERVÉES : présentes, éteintes, « soon » SOUS elles", () => {
  const page = vault(FICHIER);
  const reservees = page.querySelectorAll("[data-lieu]").filter((b) => b.dataset.reserve === "true");
  /* 🔄 LOT 377 — Dropbox n'est plus réservé : sa porte vit (elle part se connecter, ou le choisit). */
  assert.deepEqual(reservees.map((b) => b.dataset.lieu), ["google-drive", "onedrive", "github", "other"]);
  for (const b of reservees) {
    assert.equal(b.disabled, true, `${b.textContent} : éteint`);
    const place = b.parentNode;
    assert.ok(place.className.includes("tdc-place"));
    const mot = place.querySelectorAll(".tdc-bientot")[0];
    assert.equal(mot && mot.textContent, "soon", `${b.textContent} : son mot`);
    assert.ok(place.childNodes.indexOf(mot) > place.childNodes.indexOf(b), "le mot SOUS la porte");
  }
});

test("P3 — ⭐ LE LIEU CHOISI SE VOIT : le halo de l'actif et son mot dessous ; le toucher le choisit", () => {
  const gestes = [];
  const page = vault({ id: "fichier", mot: "FH saves", choisissable: true }, (a) => gestes.push(a));
  const fichier = page.querySelectorAll("[data-lieu]").find((b) => b.dataset.lieu === "fichier");
  assert.equal(fichier.getAttribute("aria-current"), "true");
  assert.equal(fichier.disabled, false);
  assert.equal(fichier.parentNode.querySelector(".vault-lieu-mot").textContent, "FH saves", "le nom du dossier retenu, ou « a file you keep »");
  assert.equal(page.querySelectorAll("[aria-current]").length, 1, "un seul lieu désigné");
  fichier.dispatchEvent({ type: "click", target: fichier });
  assert.deepEqual(gestes, [{ kind: "choisirUnLieu", id: "fichier" }], "l'écran ÉMET, la coquille choisit");
  /* le halo est CELUI des portes carrées — un écrivain */
  assert.match(css, /button\.porte-carree\[aria-current="page"\]::before,\s*button\.menu-porte\[aria-current="true"\]::before \{/);
});

test("P4 — 🗂️ `SAVE LOCATION` VIT DANS VAULT : allumé là où le navigateur sait choisir un dossier, éteint ailleurs, et il dit pourquoi", () => {
  const gestes = [];
  const peut = vault({ id: "fichier", mot: MOT_DU_FICHIER, choisissable: true }, (a) => gestes.push(a)).querySelector(".vault-lieu");
  assert.equal(peut.textContent, "Save location");
  assert.equal(peut.getAttribute("aria-label"), `Save location — ${MOT_DU_FICHIER}`);
  peut.dispatchEvent({ type: "click", target: peut });
  assert.deepEqual(gestes, [{ kind: "choisirLeLieu" }]);
  const nePeutPas = vault({ id: "fichier", mot: MOT_DU_FICHIER, choisissable: false }).querySelector(".vault-lieu");
  assert.equal(nePeutPas.disabled, true, "⛔ jamais caché (`menu-reglage-impossible-reste-visible`)");
  assert.match(nePeutPas.title, /cannot pick a folder/);
});

/* ══ C — LA COQUILLE ═════════════════════════════════════════════════════════════════════════ */

test("C1 — 🔌 UN ADAPTATEUR PAR LIEU CÂBLÉ — ni un de plus, ni un de moins", () => {
  const table = shell.match(/const ADAPTATEURS_DES_LIEUX = \{([\s\S]*?)\n\};/)[1];
  const clefs = [...table.matchAll(/^  ([a-z-]+): /gm)].map((m) => m[1]);
  assert.deepEqual(clefs, LIEUX.filter((l) => l.cable).map((l) => l.id),
    "⛔ un lieu câblé sans adaptateur ferait planter `lieuChoisi` ; un adaptateur sans lieu câblé est du code mort");
  assert.match(shell, /async function lieuChoisi\(base\) \{\s*return ADAPTATEURS_DES_LIEUX\[await lieuRetenu\(base\)\]\(base\);\s*\}/);
});

test("C2 — ⚖️ CHOISIR UN LIEU : l'organe écrit le réglage, puis le lieu est REMONTÉ — et `Save character` écrit là", () => {
  assert.match(shell, /if \(action\.kind === "ouvrirVault"\) \{ state\.palier = 2; state\.menuBranche = "vault"; openSurface\(\); return; \}/);
  const geste = shell.slice(shell.indexOf('action.kind === "choisirUnLieu"'), shell.indexOf('action.kind === "choisirLeLieu"'));
  /* 🔄 LOT 377 — le choix dit s'il est connecté ; un lieu qui exige une connexion part d'abord s'y connecter. */
  assert.match(geste, /const issue = await choisirUnLieu\(state\.stockage\.base, action\.id, \{ connecte \}\);/);
  assert.match(geste, /if \(connexion && !connecte\) \{ await partirSeConnecter\(connexion\); return; \}/);
  assert.match(geste, /state\.stockage\.lieu = issue\.id;\s*state\.stockage\.choisi = await lieuChoisi\(state\.stockage\.base\);/,
    "⛔ remonté par l'organe, jamais rapiécé");
  assert.match(geste, /if \(issue\.etat !== "choisi"\) \{ porteEnPanne\("Vault", issue\.raison\); return; \}/, "un refus se dit");
  const save = shell.match(/async function exporterJson\([\s\S]*?\n\}\n/)[0];
  assert.match(save, /appareil: state\.stockage\.appareil, choisi: state\.stockage\.choisi,/, "`Save character` écrit au lieu CHOISI");
  const monter = shell.match(/async function monterLeStockage\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(monter, /choisi: await lieuChoisi\(base\),[\s\S]*lieu: await lieuRetenu\(base\),/, "au démarrage aussi, le lieu retenu");
});

test("C3 — ⛔ L'ÉCRAN REÇOIT LA TABLE, IL NE L'IMPORTE PAS — magasin.mjs lit déjà universe-step : pas de cycle", () => {
  const ecran = stripComments(fs.readFileSync(path.join(UI, "universe-step.mjs"), "utf8"));
  assert.equal(/from "\.\/magasin\.mjs/.test(ecran), false);
  const ctx = shell.slice(shell.indexOf('step.id === "universe" && state.engine'), shell.indexOf('} else if (step.id === "universe" && state.engineError)'));
  assert.match(ctx, /lieux: LIEUX,/);
});
