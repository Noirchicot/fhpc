/* ══ LE KIT DANS WARES DIT CE QU'IL CONTIENT, ET OÙ IL SE VERSERA — lot 314, 2026-09-27 ══════════
   ⚖️ Eric, 27/09 : « Pour les kits dans wares tu ne mets aucune description. Il faut aussi préciser
   dans le kit, qu'un container sera créé […] pour poser les éléments ».
   🔴 Le SRD n'écrit aucune `description` pour un kit : la fiche X2 disait « No further detail ».
   ⭐ CE GARDE LIT LES VRAIS RECORDS : chaque kit du SRD, sans exception. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { recordProse, PREFIXE_PAGE_DE_KIT } from "../ui/builder/equipment-step.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COUCHE = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
const KITS = Object.values(COUCHE.records.gear).filter((r) => Array.isArray(r.data.contents) && r.data.contents.length);

test("1 — ⭐ chaque kit du SRD récite SON contenu, élément par élément, dans l'ordre du SRD", () => {
  assert.deepEqual(KITS.map((k) => k.name).sort(), ["Burglar’s Pack", "Diplomat’s Pack", "Dungeoneer’s Pack",
    "Entertainer’s Pack", "Explorer’s Pack", "Priest’s Pack", "Scholar’s Pack"], "témoin : les sept kits du SRD");
  for (const k of KITS) {
    const prose = recordProse({ record: k });
    assert.ok(!/No further detail/.test(prose), `${k.name} : ⛔ la fiche ne dit rien`);
    const ligne = prose.split("\n").find((l) => l.startsWith("Contents: "));
    assert.ok(ligne, `${k.name} : pas de ligne Contents`);
    assert.equal(ligne, `Contents: ${k.data.contents.map((e) => e.text || e.name).join(", ")}.`, `${k.name} : le contenu lu, pas retapé`);
  }
});

test("2 — ⚖️ la phrase du rangement nomme la page que le kit créera — le nom du lot 301", () => {
  const explorateur = KITS.find((k) => k.name === "Explorer’s Pack");
  const prose = recordProse({ record: explorateur });
  assert.match(prose, /^Contents: Backpack, Bedroll, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches/m);
  assert.ok(prose.includes(`a storage page named “${PREFIXE_PAGE_DE_KIT} Explorer’s Pack” is created in your Backpack`),
    "⛔ la phrase du container manque, ou ne porte pas le nom de la page");
});

test("3 — ⛔ un objet qui n'est pas un kit ne parle ni de contenu ni de page", () => {
  const corde = Object.values(COUCHE.records.gear).find((r) => r.name === "Rope");
  const prose = recordProse({ record: corde });
  assert.ok(!/Contents:|storage page/.test(prose), prose);
});
