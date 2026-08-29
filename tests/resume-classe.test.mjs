/* ══ LE BILAN D'UNE CLASSE EST UNE SYNTHÈSE ════════════════════════════════

   Eric, 2026-08-29, en me montrant ce que je venais de livrer : *« je demande
   un résumé très synthétique, comme dans Species, pas un bloc de texte sans
   formatage »*.

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER : le retour du déversement. J'avais
   collé la description SRD entière en croyant « faire idem Species » — la
   seule aptitude *Spellcasting* du magicien fait 3994 caractères, table de
   progression comprise. Le format était respecté, le résultat illisible : une
   ressemblance de forme masquait une différence de nature.

   ⭐ LE TÉMOIN EST SPECIES, PAS UN CHIFFRE ROND. Species est l'écran qu'Eric
   ratifie (« Species = ce que je veux ») ; sa ligne la plus longue mesurée est
   197 caractères (Trance, l'elfe). On borne donc à 220 — la marge d'une phrase
   un peu longue, pas celle d'un paragraphe. ⛔ Un plafond à 4000 laisserait
   passer exactement le défaut d'origine.

   📌 ET ON VÉRIFIE QUE LE MOTEUR N'AVALE PAS SES CAS : une « phrase » qui se
   termine par deux-points ANNONCE une liste au lieu de définir — c'est le cas
   du moine, et c'est pourquoi `RESUME_DICTE` existe. Le garde le redit pour
   les onze autres, aujourd'hui et après le prochain rafraîchissement du SRD. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resumeDeFeature } from "../ui/builder/class-step.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAFOND = 220;

/** Les aptitudes de niveau 1 des douze classes, LUES OÙ LE BUILDER LES LIT.
    ⛔ Pas un dossier deviné : la couche SRD, famille `class`, `data.features`. */
function aptitudesNiveau1() {
  const couche = JSON.parse(fs.readFileSync(
    path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
  const familles = couche.records || {};
  const classes = familles.class || {};
  const out = [];
  for (const [id, rec] of Object.entries(classes)) {
    const feats = (rec && rec.data && rec.data.features) || [];
    for (const feat of feats.filter((x) => x && x.level === 1)) {
      out.push({ classe: rec.name || id, feat });
    }
  }
  return out;
}

test("les douze classes existent et portent des aptitudes de niveau 1", () => {
  const tout = aptitudesNiveau1();
  const classes = new Set(tout.map((x) => x.classe));
  assert.equal(classes.size, 12,
    `${classes.size} classes lues au lieu de 12 — le corpus SRD a bougé.`);
  assert.ok(tout.length >= 24,
    "moins de deux aptitudes de niveau 1 par classe en moyenne : lecture suspecte.");
});

test("aucun résumé ne dépasse la plus longue ligne de Species", () => {
  const trop = aptitudesNiveau1()
    .map((x) => ({ ...x, r: resumeDeFeature(x.feat) }))
    .filter((x) => x.r.length > PLAFOND);
  assert.deepEqual(trop.map((x) => `${x.classe} / ${x.feat.name} (${x.r.length})`), [],
    `un bilan de classe déverse au lieu de synthétiser (plafond ${PLAFOND}, ` +
    "mesuré sur Species/Trance = 197). Si la phrase est vraiment longue, la " +
    "note se pose dans RESUME_DICTE — on ne relève pas le plafond.");
});

test("aucun résumé n'annonce une liste au lieu de définir", () => {
  const ouvre = aptitudesNiveau1()
    .map((x) => ({ ...x, r: resumeDeFeature(x.feat) }))
    .filter((x) => /[:;]$/.test(x.r) || x.r === "—");
  assert.deepEqual(ouvre.map((x) => `${x.classe} / ${x.feat.name} : ${x.r}`), [],
    "une phrase qui se termine par « : » ouvre sur une liste que le bilan " +
    "n'affiche pas — elle ne définit rien. Poser la note dans RESUME_DICTE.");
});
