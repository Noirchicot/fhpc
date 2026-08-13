/* ══ LOT 41 — LES CLEFS DE `underived`, ET LE MÉCANISME DES MOTS ═══════

   `Underived.declare(field, reason)` devenait une phrase française nue —
   forcée jusque dans un personnage anglais (loi §0.13). Ce lot le remplace
   par `declare(field, key, params)`, sur le mécanisme du lot 27
   (`src/labels.mjs`), en DEUX ÉTAGES (§0 de la commande, corrigée le
   2026-08-13) :

     · GÉNÉRIQUE — `FR_UNDERIVED`/`EN_UNDERIVED` (`src/labels.mjs`), pour les
       58 sites de `src/build/derive.mjs` + `src/build/skills.mjs` ;
     · FH — `FH_UNDERIVED_FR`/`FH_UNDERIVED_EN` (`src/modules/fh/labels.mjs`),
       pour les 19 sites des deux modules `src/modules/fh/*.mjs`.

   ⛔ COMPOSÉES AU POINT DE LECTURE, JAMAIS DE COMPILATION CROISÉE VERS
   `src/build/` — c'est `tests/build-block.test.mjs` (§0.12) et
   `tests/mcp-block.test.mjs` (GARDE 1) qui tiennent cette frontière ; ce
   fichier-ci se contente de la mesurer une fois de plus au §7. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import { stripComments } from "./source-scan.mjs";
import {
  createLabels, underivedEntry, renderUnderived, FR_UNDERIVED, EN_UNDERIVED
} from "../src/labels.mjs";
import { FH_UNDERIVED_FR, FH_UNDERIVED_EN } from "../src/modules/fh/labels.mjs";
import { render } from "../src/tools/render-fiche.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { readJson, makeHarness, acceptanceDocument, SRD_FR } from "./build-harness.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = /^[a-z][a-z0-9.:_-]{0,79}$/;

/* ── §1 : LA LISTE DES CLEFS, LUE DANS LE CODE, JAMAIS UNE COPIE ──────
   Chaque site (`declare(...)` / `declareUnderived(...)`) écrit sa clef en
   LITTÉRAL — jamais un calcul. On la retrouve donc par un balayage du texte
   DÉPOUILLÉ (les commentaires ne comptent pas comme un site), pas en
   recopiant une liste à la main. */
function keysCitedIn(relPath) {
  const raw = readFileSync(join(ROOT, relPath), "utf8");
  const text = stripComments(raw);
  const found = new Set();
  const re = /"(underived\.[a-z0-9.:_-]{1,79})"/g;
  let m;
  while ((m = re.exec(text)) !== null) found.add(m[1]);
  return found;
}

const genericSites = ["src/build/derive.mjs", "src/build/skills.mjs"];
const fhSites = ["src/modules/fh/destiny-stat.mjs", "src/modules/fh/skill-pool.mjs"];

function citedKeys(files) {
  const all = new Set();
  for (const file of files) for (const key of keysCitedIn(file)) all.add(key);
  return all;
}

test("§1 — chaque clef citée dans src/build/ a son mot dans les DEUX paquets génériques", () => {
  const cited = citedKeys(genericSites);
  assert.ok(cited.size > 0, "le balayage a bien trouvé des clefs — sinon le test ne prouve rien");
  for (const key of cited) {
    assert.ok(Object.hasOwn(FR_UNDERIVED, key), `« ${key} » (cité dans src/build/) manque au paquet FR_UNDERIVED`);
    assert.ok(Object.hasOwn(EN_UNDERIVED, key), `« ${key} » (cité dans src/build/) manque au paquet EN_UNDERIVED`);
  }
});

test("§1 — chaque clef citée dans src/modules/fh/ a son mot dans les DEUX paquets FH", () => {
  const cited = citedKeys(fhSites);
  assert.ok(cited.size > 0, "le balayage a bien trouvé des clefs FH — sinon le test ne prouve rien");
  for (const key of cited) {
    assert.ok(Object.hasOwn(FH_UNDERIVED_FR, key), `« ${key} » (cité dans src/modules/fh/) manque au paquet FH_UNDERIVED_FR`);
    assert.ok(Object.hasOwn(FH_UNDERIVED_EN, key), `« ${key} » (cité dans src/modules/fh/) manque au paquet FH_UNDERIVED_EN`);
  }
});

test("§1 — aucun paquet ne porte une clef morte (plus citée nulle part)", () => {
  /* Le pendant du test ci-dessus : un paquet qui garderait un mot pour une
     clef qu'aucun site n'écrit plus serait du code mort (Eric le refuse). */
  const citedGeneric = citedKeys(genericSites);
  for (const key of Object.keys(FR_UNDERIVED)) {
    assert.ok(citedGeneric.has(key), `« ${key} » est dans FR_UNDERIVED mais aucun site de src/build/ ne l'écrit plus`);
  }
  const citedFh = citedKeys(fhSites);
  for (const key of Object.keys(FH_UNDERIVED_FR)) {
    assert.ok(citedFh.has(key), `« ${key} » est dans FH_UNDERIVED_FR mais aucun site de src/modules/fh/ ne l'écrit plus`);
  }
});

/* ── §2 : REJET — une clef sans mot JETTE ─────────────────────────────── */

test("§2 — REJET : une clef sans mot dans le paquet JETTE, jamais un blanc ni l'id nu", () => {
  const table = createLabels(FR_UNDERIVED);
  assert.throws(() => table("underived.clef-qui-nexiste-pas", {}), /no label for/);
  assert.throws(() => renderUnderived({ key: "underived.absente", params: {} }, table), /no label for/);
});

test("§2 — REJET : underivedEntry() refuse une clef mal formée, des params non scalaires, un field vide", () => {
  assert.throws(() => underivedEntry("champ", "Underived.MAJUSCULE", {}), /underived key invalide/);
  assert.throws(() => underivedEntry("champ", "underived.ok", { x: { objet: true } }), /plats et scalaires/);
  assert.throws(() => underivedEntry("champ", "underived.ok", ["array"]), /plats et scalaires/);
  assert.throws(() => underivedEntry("", "underived.ok", {}), /field.*non vide/);
});

/* ── §3 : REJET — les deux paquets DIVERGENT d'une clef → rouge ────────── */

test("§3 — REJET : les deux paquets génériques couvrent EXACTEMENT le même jeu de clefs", () => {
  const fr = Object.keys(FR_UNDERIVED).sort();
  const en = Object.keys(EN_UNDERIVED).sort();
  assert.deepEqual(fr, en, "le jour où l'un gagne une clef sans l'autre, ce test rougit — c'est le garde du §3b");
});

test("§3 — REJET : les deux paquets FH couvrent EXACTEMENT le même jeu de clefs", () => {
  const fr = Object.keys(FH_UNDERIVED_FR).sort();
  const en = Object.keys(FH_UNDERIVED_EN).sort();
  assert.deepEqual(fr, en, "le jour où l'un gagne une clef sans l'autre, ce test rougit — c'est le garde du §3b");
});

test("§3 — ATTAQUE MANUELLE (jouée ici) : une clef retirée d'un seul paquet fait diverger le garde, et lui seul", () => {
  const fr = { ...FR_UNDERIVED };
  delete fr["underived.no-choice"];
  const frKeys = Object.keys(fr).sort();
  const enKeys = Object.keys(EN_UNDERIVED).sort();
  assert.notDeepEqual(frKeys, enKeys, "la divergence fabriquée EST vue — sinon le garde du §3 ne garde rien");
});

/* ── §4 : LE PERSONNAGE D'EXEMPLE — 19 ENTRÉES, TOUTES KEYÉES ─────────── */

test("§4 — le personnage d'exemple (FH, anglais) rend ses 19 entrées, toutes keyées, zéro phrase nue", async () => {
  const { report } = await exempleFhEn();
  assert.equal(report.underived.length, 17, "LOT 43 — la migration de l'exemple (plus de choix `background`) fait tomber ce compte de 19 à 17 : les trois déclarations que `background` déclenchait (skill_ids manquant, outil manquant, identity.background) se recomposent en deux (identity.background, skillpool-no-background-ref) — voir INVENTAIRE-LOT-43.md");
  for (const entry of report.underived) {
    assert.equal(typeof entry.field, "string");
    assert.match(entry.key, KEY, `« ${entry.field} » : la clef doit suivre \`${KEY}\``);
    assert.equal(typeof entry.reason, "undefined", `« ${entry.field} » : \`.reason\` ne doit plus exister`);
    assert.ok(entry.params && typeof entry.params === "object" && !Array.isArray(entry.params),
      `« ${entry.field} » : \`params\` doit être un objet plat`);
    /* Chaque entrée est SÉRIALISABLE sans perdre sa structure — le `toString`
       non énumérable ne doit jamais apparaître dans `JSON.stringify`. */
    const serialise = JSON.parse(JSON.stringify(entry));
    assert.deepEqual(Object.keys(serialise).sort(), ["field", "key", "params"]);
  }
});

test("§4 — chaque clef du personnage d'exemple a un mot dans la table composée (FR et EN)", async () => {
  const { report } = await exempleFhEn();
  const fr = createLabels(FR_UNDERIVED, FH_UNDERIVED_FR);
  const en = createLabels(EN_UNDERIVED, FH_UNDERIVED_EN);
  for (const entry of report.underived) {
    assert.doesNotThrow(() => renderUnderived(entry, fr), `« ${entry.key} » sans mot français`);
    assert.doesNotThrow(() => renderUnderived(entry, en), `« ${entry.key} » sans mot anglais`);
  }
});

/* ── §5 : ⚔️ L'ATTAQUE — AUCUNE PROSE FRANÇAISE DANS LE CARNET RENDU ──────
   C'est le test qui dit que le lot a atteint son but (§4.5 de la commande,
   et la leçon de la correction du 2026-08-13 : la preuve n'est pas le compte
   des sites, c'est le balayage du carnet RENDU). Motifs français ANCRÉS sur
   des mots qui n'apparaissent dans AUCUN mot anglais du paquet EN — pas des
   sous-chaînes qui pourraient survivre par accident (« un » n'en est pas
   un : « underived » le contient). */
const FRENCH_TELLS = [
  /\baucun\b/i, /\baucune\b/i, /\bpas\b/i, /\bporte\b/i, /\bchoix\b/i, /\bcontrat\b/i,
  /\bespèce\b/i, /\bpersonnage\b/i, /\bcompétence\b/i, /\bd'un\b/i, /\bd'une\b/i,
  /\ble record\b/i, /\bne sait pas\b/i, /« /, / »/
];

test("§5 — ⚔️ ATTAQUE : le carnet rendu (anglais) du personnage d'exemple ne porte aucune prose française", async () => {
  const { document, report } = await exempleFhEn();
  const en = createLabels(EN_UNDERIVED, FH_UNDERIVED_EN);
  assert.equal(report.underived.length, 17);
  for (const entry of report.underived) {
    const mot = renderUnderived(entry, en);
    for (const tell of FRENCH_TELLS) {
      assert.doesNotMatch(mot, tell, `« ${entry.field} » (${entry.key}) : « ${mot} » ressemble encore à du français`);
    }
  }

  /* Et la fiche ENTIÈRE, rendue en anglais — pas seulement les entrées prises
     une par une : le HTML pourrait recomposer du français ailleurs. */
  const html = render(document, report, "en");
  const declareBlock = /<div class="declare">.*?<\/div>/gs;
  const blocs = html.match(declareBlock) || [];
  assert.ok(blocs.length > 0, "la fiche porte au moins un bloc de déclarations à attaquer");
  for (const bloc of blocs) {
    for (const tell of FRENCH_TELLS) {
      assert.doesNotMatch(bloc, tell, `un bloc de déclarations anglais contient encore : ${tell}`);
    }
  }
});

/* ── §6 : LE DOCUMENT RESTE PROPRE ─────────────────────────────────────── */

test("§6 — fh-char/1 ne gagne AUCUNE de ces clefs : underived reste un carnet hors document", async () => {
  const { document } = await exempleFhEn();
  const octets = JSON.stringify(document);
  assert.doesNotMatch(octets, /"underived"/, "le document ne porte pas la clef `underived` du tout");
  for (const key of Object.keys(FR_UNDERIVED)) assert.ok(!octets.includes(key), `« ${key} » a fuité dans le document`);
  for (const key of Object.keys(FH_UNDERIVED_FR)) assert.ok(!octets.includes(key), `« ${key} » a fuité dans le document`);

  const ajv = new Ajv2020({ strict: true, allErrors: true });
  const validateChar = ajv.compile(readJson("schemas/fh-char.schema.json"));
  assert.equal(validateChar(document), true, ajv.errorsText(validateChar.errors));
});

/* ── §7 : UN PERSONNAGE SRD PUR TRAVERSE SANS UNE CLEF FH ──────────────── */

test("§7 — un personnage SRD pur traverse tout sans qu'une clef FH apparaisse", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.ok(out.underived.length > 0, "un SRD pur a bien des déclarations (aucune couche FH montée)");
  for (const entry of out.underived) {
    assert.ok(!entry.key.startsWith("underived.fh."), `« ${entry.field} » porte une clef FH (${entry.key}) sur un SRD pur`);
    assert.ok(Object.hasOwn(FR_UNDERIVED, entry.key), `« ${entry.key} » doit être une clef GÉNÉRIQUE`);
  }
});

/* ── §7 (frontière) : COMPOSÉES AU POINT DE LECTURE, JAMAIS DE CROISEMENT ── */

test("§7 — src/build/ ne cite AUCUNE clef `underived.fh.*` (§0.12, gardée sur les octets)", () => {
  for (const file of genericSites) {
    const raw = readFileSync(join(ROOT, file), "utf8");
    assert.doesNotMatch(stripComments(raw), /underived\.fh\./, `${file} ne doit citer aucune clef FH`);
  }
});
