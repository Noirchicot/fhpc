/* ══ L'INVENTAIRE DES EFFETS DES OBJETS MAGIQUES — lot 282 ═══════════════════════
   ⚖️ Eric, 2026-09-26 : *« avant de tout appliquer sur la fiche, un précurseur déjà qui
   liste tous les effets, après la fiche décidera de comment les appliquer »*.
   ⭐ `sources-effets/objets-magiques-srd.effets.json` : pour CHAQUE objet magique du SRD
   5.2.1, ses effets (famille, cible, mode, valeur, plafond, condition, variante) et la
   CITATION exacte qui les prouve. Extrait par quatre agents, fusionné et relu par l'archi.
   ⭐ LOT 289 — LA FICHE LE LIT : `src/build/effets-objets.mjs`, par sa copie ES générée.
   Ces gardes tiennent qu'il DIT VRAI et qu'il est COMPLET — la condition pour que la fiche
   s'y fie ; `tests/effets-objets-fiche.test.mjs` tient ce que la fiche en FAIT. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { variantesDe } from "../src/build/objet-crafte.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOC = JSON.parse(fs.readFileSync(path.join(ROOT, "sources-effets", "objets-magiques-srd.effets.json"), "utf8"));
const COUCHE = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
const ITEMS = COUCHE.records.item;
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

test("1 — ⭐ COMPLET : chaque objet magique du SRD y est, une seule fois", () => {
  const ids = DOC.objets.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length, "⛔ aucun doublon");
  assert.deepEqual([...ids].sort(), Object.keys(ITEMS).sort(), "⛔ ni un objet de moins, ni un de plus");
  const sansEffet = DOC.objets.filter((o) => !o.effets.length && !norm(o.note));
  assert.deepEqual(sansEffet.map((o) => o.name), [], "⛔ un objet sans effet dit pourquoi (note)");
});

test("2 — 🔴 VRAI : chaque effet cite la description de son objet, mot pour mot", () => {
  const fautes = [];
  for (const o of DOC.objets) {
    const d = norm(ITEMS[o.id].data.description);
    for (const e of o.effets) if (!e.citation || !d.includes(norm(e.citation))) fautes.push(`${o.name} :: ${e.citation}`);
  }
  assert.deepEqual(fautes, [], "⛔ une citation introuvable est un effet inventé");
});

test("3 — ⭐ UN VOCABULAIRE FERMÉ : familles, conditions, modes, forme des cibles", () => {
  const familles = Object.keys(DOC.familles);
  for (const o of DOC.objets) for (const e of o.effets) {
    assert.ok(familles.includes(e.famille), `${o.name} : famille « ${e.famille} »`);
    assert.ok(DOC.conditions.includes(e.condition), `${o.name} : condition « ${e.condition} »`);
    assert.ok(DOC.modes.includes(e.mode), `${o.name} : mode « ${e.mode} »`);
    assert.match(e.cible, /^[a-z]+(\.[a-z0-9+-]+)*$/, `${o.name} : cible « ${e.cible} »`);
  }
});

test("4 — ⚖️ LES VARIANTES PORTENT LES NOMS DE X5 — une seule lecture des variantes", () => {
  /* ⭐ Le jour où la fiche appliquera l'effet d'une Ioun Stone (Intellect), elle lira le mot
     que X5 a écrit dans `gear[N].variant` : les deux doivent être le MÊME mot. */
  const PLUS = ["+1", "+2", "+3"];
  for (const o of DOC.objets) {
    const mots = variantesDe(ITEMS[o.id].data).map((v) => v.mot);
    for (const e of o.effets.filter((x) => x.variante)) {
      /* ⭐ une SOUS-variante nomme sa variante d'abord : « Ivory Goats — Goat of Terror » */
      const racine = String(e.variante).split(" — ")[0];
      if (mots.length) assert.ok(mots.includes(racine), `${o.name} : « ${e.variante} » n'est pas une variante de X5 (${mots.join(", ")})`);
      else if (/, \+1, \+2, or \+3$/.test(o.name)) assert.ok(PLUS.includes(e.variante), `${o.name} : « ${e.variante} »`);
    }
  }
});

test("5 — ⚔️ LES TÉMOINS : les effets qu'on attend, là où on les attend", () => {
  const effets = (nom) => DOC.objets.find((o) => o.name === nom).effets;
  const un = (nom, f) => effets(nom).find(f);
  const intellect = un("Ioun Stone", (e) => e.variante === "Intellect" && e.cible === "ability.int");
  assert.deepEqual([intellect.mode, intellect.valeur, intellect.plafond, intellect.condition], ["bonus", 2, 20, "harmonise+porte"],
    "⭐ la question d'Eric du 26/09 : l'Intellect donne +2 en INT, max 20, harmonisée et portée");
  const colline = un("Belt of Giant Strength", (e) => e.variante === "Hill");
  assert.deepEqual([colline.cible, colline.mode, colline.valeur], ["ability.str", "fixe", 21]);
  assert.ok(un("Cloak of Protection", (e) => e.cible === "ac" && e.valeur === 1));
  assert.ok(un("Cloak of Protection", (e) => e.cible === "save.all" && e.valeur === 1));
  const plus2 = effets("Weapon, +1, +2, or +3").filter((e) => e.variante === "+2").map((e) => e.cible).sort();
  assert.deepEqual(plus2, ["attack.weapon", "damage.weapon"]);
  assert.equal(un("Boots of Striding and Springing", (e) => e.cible === "speed.walk").mode, "plancher",
    "« unless your Speed is higher » : un plancher, pas une valeur fixe");
});

test("6 — ⭐ UN SEUL LECTEUR : le moteur, par sa copie ES — et un seul écrivain de la copie", () => {
  /* ⚖️ « après la fiche décidera de comment les appliquer ». LOT 289 : la fiche a décidé.
     🔴 CE GARDE ÉTAIT « aucun lecteur » (lot 282) ; il est tombé exprès, et il est remplacé
     par celui qui NOMME le lecteur autorisé — un second lecteur (un écran qui relirait
     l'inventaire pour afficher « +2 ») serait une seconde vérité des effets, et il rougit ici.
     · à l'exécution, un seul module IMPORTE la copie ES : `src/build/effets-objets.mjs` ;
     · un seul module lit le `.json` : le générateur de cette copie. */
  const lecteurs = [];
  const importeurs = [];
  const retire = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  for (const dossier of ["src", "ui", "bin", "tools"]) {
    const marche = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) marche(p);
      else if (/\.(mjs|js|html)$/.test(f.name)) {
        /* ⚠️ L'IMPORT MAP d'`index.html` ÉPINGLE l'URL versionnée de la copie (le graphe du
           navigateur, `bin/nouvelle-version.mjs`) : une épingle n'est pas une lecture. Elle
           est retirée, et elle SEULE — une autre mention dans la page compterait. */
        const texte = fs.readFileSync(p, "utf8").replace(/<script type="importmap">[\s\S]*?<\/script>/g, " ");
        if (texte.includes("sources-effets")) lecteurs.push(path.relative(ROOT, p));
        if (/(from|import\()\s*["'][^"']*sources-effets\/objets-magiques-srd\.effets\.mjs/.test(retire(texte))) {
          importeurs.push(path.relative(ROOT, p));
        }
      }
    } };
    if (fs.existsSync(path.join(ROOT, dossier))) marche(path.join(ROOT, dossier));
  }
  assert.deepEqual(importeurs, ["src/build/effets-objets.mjs"],
    "⛔ la copie ES n'a qu'un lecteur : le moteur des effets");
  assert.deepEqual(lecteurs.sort(), ["src/build/effets-objets.mjs", "src/tools/gen-effets-objets.mjs"],
    "⛔ hors du moteur et de son générateur, personne ne nomme l'inventaire");
});
