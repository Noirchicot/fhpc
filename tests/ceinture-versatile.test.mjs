/* ══ LOT 186 — LA CEINTURE EST VERSATILE ══════════════════════════════════

   ⚖️ ERIC, 2026-09-09, ET SES TROIS PHRASES DANS L'ORDRE OÙ ELLES SONT VENUES :
     *« en pile SRD, que fait le cran Destiny ? »*        → **absent, neuf crans**
     *« si j'allume Destiny dans les couches, il réapparaît ? »* → **oui**
     *« ou il faut que tu réécrives le belt pour qu'il soit versatile SRD / FH »*

   ⛔ CE QUE LA TROISIÈME PHRASE FERME, ET C'EST TOUT LE LOT. Le premier mandat
   disait : « lis `currentStack(doc)`, neuf crans si `"srd"`, dix si
   `"srdfh"` ». C'est FAUX, et la DEUXIÈME question le prouve à elle seule :
   allumer la seule couche des arcanes donne une pile qui n'est NI l'une NI
   l'autre — `currentStack` rend `null`, un aiguillage à deux branches ne sait
   pas quoi faire, et l'écran mort s'affiche.
   ⇒ La ceinture ne lit pas le NOM de la pile, elle lit ce qui est MONTÉ.

   ⚠️ CE QUI REND CE FICHIER NON TAUTOLOGIQUE, ET C'EST SA PREMIÈRE SECTION :
   les drapeaux ne sont pas ÉCRITS ici, ils sont MESURÉS sur les couches du
   dépôt. Un garde qui inventerait ses propres drapeaux jurerait que la
   ceinture sait lire une pile qui n'existe nulle part. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
import { STEPS, ceinture, cransAlignes, etapeParId } from "../ui/builder/etapes.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellText = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8");

/** LE CORPS D'UNE FONCTION, ACCOLADES COMPTÉES — ⛔ pas un `[^}]*`, qui
 *  s'arrêterait à la première accolade fermante venue et jurerait sur un
 *  quart de fonction. */
function corpsDe(source, nom) {
  const debut = source.indexOf(`function ${nom}(`);
  if (debut === -1) return null;
  const ouvre = source.indexOf("{", debut);
  let profondeur = 0;
  for (let i = ouvre; i < source.length; i += 1) {
    if (source[i] === "{") profondeur += 1;
    else if (source[i] === "}") {
      profondeur -= 1;
      if (profondeur === 0) return source.slice(ouvre, i + 1);
    }
  }
  return null;
}

/* ══ 0. LE TÉMOIN — LES DRAPEAUX SONT MESURÉS SUR LES COUCHES ══════════════ */

/** Les drapeaux qu'une pile de couches lève VRAIMENT. On monte les fichiers du
 *  dépôt, on éteint ce qu'on veut éteindre, on relève. */
async function drapeauxDe(fichiersEteints = []) {
  const { createLayers } = await import("../src/layers/index.mjs");
  const { LAYER_FILES } = await import("./ceinture-versatile.fixture.mjs");
  const layers = createLayers({ bus: { emit() {}, on() {} } });
  for (const fichier of LAYER_FILES) {
    layers.verbs.register({
      bytes: new Uint8Array(fs.readFileSync(path.join(ROOT, "layers", fichier))),
      origin: fichier
    });
  }
  /* ⛔ ON DÉMONTE PAR LE HAUT — la leçon du lot 77 : `fh-fiche-en` patche ce
     que `fh-species-en` ajoute, et éteindre la base d'abord fait jeter le pli. */
  for (const id of [...fichiersEteints].reverse()) layers.verbs.disable({ id });
  return layers.verbs.flags();
}

const TOUS = await drapeauxDe([]);

test("témoin — les drapeaux ne sont pas écrits ici, ils sont RELEVÉS sur `layers/`", async () => {
  assert.ok(TOUS.includes("fh.destiny"),
    "aucune couche montée ne lève `fh.destiny` — le garde mesurerait un drapeau qui n'existe plus");
  assert.ok(TOUS.includes("fh.inheritance"),
    "aucune couche montée ne lève `fh.inheritance` — idem");
  /* ⭐ ET LA PILE SRD EN LÈVE ZÉRO : c'est ce qui rend « neuf crans » atteignable
     autrement que sur le papier. */
  const { FH_LAYER_IDS } = await import("../ui/builder/universe-step.mjs");
  assert.deepEqual(await drapeauxDe(FH_LAYER_IDS), [],
    "la pile SRD ne lève aucun drapeau — si elle en levait un, `neuf crans` serait faux");
});

/* ══ 1. LE COMPTE — DIX, PUIS NEUF ═════════════════════════════════════════ */

test("🔴 dix crans quand la pile complète est montée, NEUF sans `fh.destiny`", () => {
  assert.equal(ceinture(TOUS).length, 10, "la pile complète montre les dix crans");
  const sansDestiny = TOUS.filter((f) => f !== "fh.destiny");
  const courte = ceinture(sansDestiny);
  assert.equal(courte.length, 9, "⛔ Eric, 09/09 : « absent — neuf crans »");
  assert.equal(courte.some((c) => c.id === "destiny"), false, "et c'est bien Destiny qui manque");
  /* ⭐ « SI J'ALLUME DESTINY DANS LES COUCHES, IL RÉAPPARAÎT ? » — oui, et
     c'est la même fonction qui répond, sans une branche de plus. */
  assert.equal(ceinture([...sansDestiny, "fh.destiny"]).length, 10, "rallumé, il revient");
});

test("🔴 le mot du cran 3 est DÉCLARÉ, pas choisi par un `if` sur le nom de la pile", () => {
  assert.equal(ceinture(TOUS)[3].mot, "Inheritance", "pile complète : Fate's Hand a remplacé l'arrière-plan");
  assert.equal(ceinture([])[3].mot, "Background", "pile SRD : l'arrière-plan du SRD reprend son nom");
});

/* ══ 2. ⚔️ LA COMBINAISON QU'UN AIGUILLAGE À DEUX BRANCHES RATERAIT ════════ */

test("⚔️ `fh.destiny` SANS `fh.inheritance` — le cran Destiny est LÀ, et le cran 3 dit `Background`", () => {
  /* 🔴 C'EST LA PREUVE DE LA VERSATILITÉ, ET ELLE EST ATTEIGNABLE : allumer la
     seule couche `fh-arcana-en` par-dessus le SRD donne exactement cette pile.
     `currentStack` y rendrait `null` — aucune des deux piles NOMMÉES —, donc
     un `if (stack === "srd") ? 9 : 10` se serait trompé DEUX fois : pas de
     Destiny, et le mauvais mot au cran 3. */
  const crans = ceinture(["fh.destiny"]);
  assert.equal(crans.length, 10, "Destiny est monté : la ceinture est longue");
  assert.equal(crans[4].id, "destiny", "…et il est à sa place, la cinquième");
  assert.equal(crans[3].mot, "Background",
    "⛔ sans `fh.inheritance`, le cran 3 garde son nom SRD — c'est LUI que l'aiguillage aurait raté");
  /* ⚖️ ET LE SYMÉTRIQUE : l'héritage sans la destinée. */
  const inverse = ceinture(["fh.inheritance"]);
  assert.equal(inverse.length, 9, "l'héritage n'amène pas la destinée avec lui");
  assert.equal(inverse[3].mot, "Inheritance", "…et il renomme quand même son cran");
});

/* ══ 3. `etapeParId` DIT LA MÊME CHOSE QUE LA CEINTURE, DANS LES DEUX SENS ══ */

/** Toutes les combinaisons des drapeaux que `STEPS` cite — c'est le seul jeu
 *  qui compte : un drapeau qu'aucun cran n'écoute ne change rien. */
function combinaisons() {
  const cites = [...new Set(STEPS.flatMap((s) =>
    [s.exige, ...(s.motSi || []).map((v) => v.drapeau)].filter(Boolean)))];
  const jeux = [];
  for (let masque = 0; masque < (1 << cites.length); masque += 1) {
    jeux.push(cites.filter((_, i) => masque & (1 << i)));
  }
  return jeux;
}

test("🔴 `etapeParId` et la ceinture ne se contredisent JAMAIS — lu dans les deux sens", () => {
  for (const drapeaux of combinaisons()) {
    const crans = ceinture(drapeaux);
    /* SENS 1 — de la ceinture vers la fonction : chaque cran visible se
       retrouve par son id, au même numéro et au même mot. */
    for (const cran of crans) {
      assert.deepEqual(etapeParId(cran.id, drapeaux), { numero: cran.numero, mot: cran.mot },
        `[${drapeaux}] ${cran.id} : la fonction ne dit pas ce que la ceinture montre`);
    }
    /* SENS 2 — de `STEPS` vers la ceinture : tout id ABSENT de la ceinture rend
       `null`. ⛔ C'est la moitié qu'une lecture unique laisse passer : une
       fonction qui répondrait « step 4, Destiny » sur une pile SRD serait
       parfaitement cohérente avec elle-même, et enverrait le joueur sur un
       cran qui n'est pas à l'écran (feedback : « une bijection fausse est
       cohérente »). */
    const visibles = new Set(crans.map((c) => c.id));
    for (const step of STEPS) {
      if (visibles.has(step.id)) continue;
      assert.equal(etapeParId(step.id, drapeaux), null,
        `[${drapeaux}] ${step.id} n'est pas sur la ceinture — la fonction doit se taire`);
    }
  }
  assert.equal(etapeParId("licorne", TOUS), null, "un id qui n'existe pas rend null, comme avant");
});

/* ══ 4. ⚔️ LE GARDE DE L'INDEX — LE PLUS IMPORTANT DU LOT ══════════════════ */

test("🔴 l'appariement CRAN ↔ ITEM tient sur `STEPS`, ceinture courte comme longue", () => {
  /* 🔴 CE QUI SE JOUE ICI : `paintBelt` écrit `data-status` PAR INDEX sur les
     items du belt, et ces items sont bâtis sur `STEPS`, une fois, au
     chargement. Un tableau qui rétrécirait décalerait tout ce qui suit le
     trou — et l'échec est SILENCIEUX : un cran peindrait l'état d'un AUTRE,
     sans erreur, sans page blanche. C'est l'avertissement que `monterBelt`
     porte depuis le 2026-08-19. */
  for (const drapeaux of combinaisons()) {
    const table = cransAlignes(drapeaux);
    assert.equal(table.length, STEPS.length,
      `[${drapeaux}] la table d'appariement a changé de longueur — l'index de peinture ne veut plus rien dire`);
    table.forEach((cran, index) => {
      if (cran === null) return;
      assert.equal(cran.id, STEPS[index].id,
        `[${drapeaux}] l'item ${index} porte le cran « ${cran.id} » alors que STEPS y met « ${STEPS[index].id} »`);
      assert.equal(cran.rang, index, `[${drapeaux}] le rang d'un cran doit être sa place dans STEPS`);
    });
    /* ⚖️ ET LES TROUS SONT EXACTEMENT LES CRANS NON MONTÉS — ni plus, ni moins. */
    assert.deepEqual(
      table.map((c, i) => (c === null ? STEPS[i].id : null)).filter(Boolean),
      STEPS.filter((s) => !ceinture(drapeaux).some((c) => c.id === s.id)).map((s) => s.id),
      `[${drapeaux}] un trou de la table ne correspond pas à un cran absent de la ceinture`);
  }
});

/** La clause gardée : `paintBelt` apparie par la table ALIGNÉE, et lit le cran
 *  à l'index de la boucle. */
function apparieParStepsF(source) {
  const corps = corpsDe(source, "paintBelt");
  if (!corps) return ["<paintBelt introuvable>"];
  const fautes = [];
  if (!/cransAlignes\(drapeauxMontes\(\)\)/.test(corps)) {
    fautes.push("paintBelt n'apparie plus par la table alignée sur STEPS");
  }
  if (!/const cran = crans\[index\]/.test(corps)) {
    fautes.push("le cran n'est plus lu à l'index de la boucle");
  }
  return fautes;
}

test("🔴 …et `paintBelt` s'en sert : la table alignée, lue à l'index de sa boucle", () => {
  assert.deepEqual(apparieParStepsF(shellText), []);
});

test("⚔️ ATTAQUE — apparier par la ceinture VISIBLE fait rougir le garde de l'index", () => {
  /* ⛔ C'EST LE DÉFAUT EXACT, PAS UNE CARICATURE : `ceinture()` rend les crans
     MONTÉS, donc en pile SRD son 4ᵉ élément est `class` pendant que l'item 4
     du belt est le cran Destiny. Le code compile, la page s'affiche, et le
     cran `Class` peint l'état de `Skills`. */
  /* ⚠️ LA CIBLE EST NOMMÉE AVEC SON RECEVEUR, ET CE GARDE ME L'A APPRIS EN
     RESTANT VERT : `cransAlignes(drapeauxMontes())` apparaît TROIS fois dans
     la coquille (l'enchaînement, la peinture, le refus d'écran), et un
     `replace` de chaîne ne touche que la première — j'ai d'abord mutilé
     `cranVoisin` et conclu que le garde ne mordait pas. */
  const mute = shellText.replace("const crans = cransAlignes(drapeauxMontes());",
    "const crans = ceinture(drapeauxMontes());");
  assert.notEqual(mute, shellText, "témoin : la mutation a trouvé sa cible");
  assert.match(corpsDe(mute, "paintBelt"), /const crans = ceinture\(/,
    "témoin : c'est bien `paintBelt` qui a été mutilé, pas un homonyme ailleurs");
  assert.deepEqual(apparieParStepsF(mute),
    ["paintBelt n'apparie plus par la table alignée sur STEPS"],
    "⚔️ un garde qui ne peut jamais accuser est le pire de tous");
});

/* ══ 5. ⚔️ LE TÉMOIN ANTI-TAUTOLOGIE — UN LIBELLÉ EN DUR DOIT ROUGIR ═══════ */

/** Les mots que `STEPS` déclare — libellés de base ET variantes. Ce sont eux
 *  qu'aucun autre organe n'a le droit de réécrire. */
const MOTS_DE_CRAN = [...new Set(STEPS.flatMap((s) =>
  [s.label, ...(s.motSi || []).map((v) => v.mot)]))];

/** La clause gardée : la peinture du belt n'écrit AUCUN mot d'étape en toutes
 *  lettres — elle ne connaît que `cran.mot`. */
function aucunLibelleEnDurF(source) {
  const corps = stripComments(corpsDe(source, "paintBelt") || "");
  if (!corps) return ["<paintBelt introuvable>"];
  const fautes = MOTS_DE_CRAN.filter((mot) => corps.includes(`"${mot}"`))
    .map((mot) => `paintBelt écrit « ${mot} » en toutes lettres`);
  if (!/cran\.mot/.test(corps)) fautes.push("paintBelt ne lit plus le mot du cran");
  return fautes;
}

test("🔴 aucun libellé d'étape n'est écrit en toutes lettres dans la peinture du belt", () => {
  assert.deepEqual(aucunLibelleEnDurF(shellText), []);
});

test("⚔️ ATTAQUE — un libellé recopié dans `paintBelt` fait ROUGIR le garde", () => {
  /* 📏 LE DÉFAUT QUE ÇA REPRODUIT, ET IL A EXISTÉ : avant ce lot, `monterBelt`
     écrivait `step.label` au montage. Sur une pile sans `fh.inheritance`, le
     cran aurait annoncé `Inheritance` pendant que la ceinture, elle, dit
     `Background` — deux voix pour un même mot, et c'est la voix ÉCRITE qu'on
     aurait crue, parce que c'est elle qu'on voit. */
  const mute = shellText.replace(
    "if (num) num.textContent = String(cran.numero);",
    'if (num) num.textContent = String(cran.numero);\n    if (label) label.textContent = "Inheritance";'
  );
  assert.notEqual(mute, shellText, "témoin : la mutation a trouvé sa cible");
  assert.deepEqual(aucunLibelleEnDurF(mute), ["paintBelt écrit « Inheritance » en toutes lettres"]);
});

/* ══ 6. ⛔ ET LA CEINTURE NE CONNAÎT AUCUNE PILE PAR SON NOM ═══════════════ */

test("⛔ `etapes.mjs` ne nomme aucune pile — ni `srd`, ni `srdfh`, ni `currentStack`", () => {
  /* ⚖️ « Le jour où un moteur tiers arrive, il ne serait dans aucune branche. »
     Un nom de pile dans ce fichier serait le retour du défaut que le lot ferme. */
  const source = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "etapes.mjs"), "utf8"));
  for (const interdit of ["currentStack", '"srdfh"', '"srd"']) {
    assert.equal(source.includes(interdit), false,
      `etapes.mjs cite ${interdit} — la ceinture lirait le NOM de la pile au lieu de ce qui est MONTÉ`);
  }
  /* ⭐ ET LA MOITIÉ QUI ACCUSE : elle lit bien des drapeaux. */
  assert.match(source, /exige/, "aucun cran ne déclare d'exigence — il n'y aurait plus rien à lire");
});
