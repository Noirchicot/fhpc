/* ══ L'EXPORT « CE QUE FATE'S HAND CHANGE » — LOT 78 ═══════════════════════
   `exports/fh-changes.json` traverse la frontière : il est produit ici et lu
   par un AUTRE dépôt (`~/tools/fh-phb`, `sync_from_vault.py`), qui en écrit le
   menu en tête de chaque chapitre du livre d'Eric.

   🔴 D'OÙ LA FORME DE CETTE SUITE. Un contrat entre deux dépôts n'a pas de
   compilateur : si la sortie change de forme, personne ne rougit ici — c'est
   la PAGE PUBLIÉE qui se tait ou qui ment, et il faudra qu'un humain le
   remarque. Ces gardes sont donc le seul endroit où le contrat est exécutable.

   ⛔ ET ILS NE LISENT PAS LE DÉPÔT VOISIN. Deux fois dans la journée du 20/08,
   une suite verte est passée au rouge parce qu'elle lisait l'ARBRE DE TRAVAIL
   d'à côté — un dépôt dont ni la branche ni la propreté ne nous appartiennent.
   Ce qui est vérifiable ici, c'est notre moitié : les 18 genres du moteur, la
   forme, la mesure. La moitié d'en face est vérifiée en face. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  OUT_NAME, CONTRAT, GenError,
  build, generate, serialize, empreinte, mesurerGenre, monter
} from "../src/tools/gen-fh-changes.mjs";
import { GENRES } from "../src/layers/document.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";
import { LAYER_FILES } from "../ui/builder/engine.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHEMIN = join(ROOT, "exports", OUT_NAME);
const CLEFS = ["added", "patched", "removed"];

test("témoin — le fichier commité existe et déclare son contrat", () => {
  assert.ok(existsSync(CHEMIN), `${CHEMIN} devrait être commité : c'est le dépôt voisin qui le lit sur le disque.`);
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  assert.equal(doc.contract, CONTRAT);
  assert.equal(doc.lang, "en", "la pile mesurée est la pile ANGLAISE — une couche FR existe, le silence serait une devinette");
  assert.match(doc.$generated, /GENERATED/);
  assert.match(doc.layer_run, /^[0-9a-f]{64}$/);
});

/* ══ 1. LA SORTIE COMMITÉE EST CELLE DE LA PASSE ═════════════════════════ */

test("🔴 le fichier commité est OCTET POUR OCTET une génération fraîche", () => {
  /* Deux gardes en un, et ils ne gardent pas la même chose :
     · le DÉTERMINISME — deux passes rendent les mêmes octets (tri par point de
       code, jamais `localeCompare`) ;
     · L'ÉDITION À LA MAIN — une correction en passant dans le JSON est vue ici
       et non trois semaines plus tard, quand la passe suivante l'aura écrasée
       en silence et que la page aura recommencé à mentir.
     ⚠️ La génération va dans un dossier TEMPORAIRE : une suite qui écrit dans
     `exports/` pour s'observer mute l'arbre et l'exécution suivante en hérite
     (lot 13, TRAPS.md). */
  const tmp = mkdtempSync(join(tmpdir(), "fhpc-fh-changes-"));
  try {
    const { outPath } = generate({ outDir: tmp });
    assert.equal(readFileSync(outPath, "utf8"), readFileSync(CHEMIN, "utf8"),
      "`exports/fh-changes.json` a divergé de son générateur — soit il a été édité à la main, " +
      "soit une couche a changé sans que la passe soit rejouée (`node src/tools/gen-fh-changes.mjs`). " +
      "⚠️ ET SI TU N'AS RIEN TOUCHÉ : `layers/fh-lore-en.layer.json` est écrite par `~/tools/fh-phb/sync_from_vault.py:2074` à chaque publication du site. Une passe de publication suffit à faire rougir ce test. `git diff layers/` le dira en une ligne. ");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("🔴 la sortie commitée déclare la pile que LA PAGE monte", () => {
  /* `generate({pile})` accepte une pile en argument — c'est ce qui rend les
     attaques ci-dessous possibles, et c'est aussi le trou : rien n'empêche de
     commiter le résultat d'une pile bricolée. Le fichier commité, lui, doit
     décrire la pile réelle du navigateur. */
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  const publiee = doc.stack.map((couche) => couche.id);
  const page = LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, ""));
  assert.deepEqual(publiee, page,
    "l'export décrit une autre pile que celle qu'`engine.mjs` monte : le menu du livre parlerait " +
    "d'un jeu de règles que personne ne joue.");
});

/* ══ 2. LES TROIS RÈGLES DU CONTRAT ══════════════════════════════════════ */

test("🔴 RÈGLE ② — les trois clefs sont là sur TOUS les genres, vides comprises", () => {
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  const manquantes = [];
  for (const [genre, mesure] of Object.entries(doc.genres)) {
    for (const clef of CLEFS) if (!Array.isArray(mesure[clef])) manquantes.push(`${genre}.${clef}`);
  }
  assert.deepEqual(manquantes, [],
    "une clef absente se lit « non mesuré », jamais « zéro » — le consommateur ne peut pas " +
    "distinguer « FH ne retire rien » de « la passe n'a pas mesuré les retraits ».");
});

test("⚔️ ATTAQUE — un genre amputé d'une clef est VU par le même contrôle", () => {
  /* Le garde ne vaut que s'il mord. On fabrique la faute exacte que la règle ②
     interdit : un genre qui dit « rien » en omettant la clef. */
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  delete doc.genres.background.removed;
  const manquantes = [];
  for (const [genre, mesure] of Object.entries(doc.genres)) {
    for (const clef of CLEFS) if (!Array.isArray(mesure[clef])) manquantes.push(`${genre}.${clef}`);
  }
  assert.deepEqual(manquantes, ["background.removed"],
    "l'attaque doit être vue par le MÊME contrôle que celui qui garde la vraie sortie");
});

test("🔴 LES 20 GENRES SONT DÉCLARÉS — aucun n'est laissé à deviner", () => {
  /* Le consommateur traite un genre ABSENT comme non mesuré. Les dix genres
     que Fate's Hand ne touche pas ont pourtant bien été mesurés : les déclarer
     vides dit « j'ai regardé », ce qui est une information. C'est la règle ②
     appliquée un cran plus haut. */
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  assert.deepEqual(Object.keys(doc.genres).sort(), GENRES.slice().sort(),
    "l'export doit couvrir exactement les genres du moteur — un genre neuf ouvert dans " +
    "`document.mjs` et absent d'ici sortirait « non mesuré » sans que personne le sache.");
});

test("🔴 RÈGLE ① — des NOMS, jamais des comptes", () => {
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  const fautes = [];
  for (const [genre, mesure] of Object.entries(doc.genres)) {
    for (const clef of CLEFS) {
      for (const entree of mesure[clef]) {
        if (typeof entree !== "string" || entree.trim() === "") fautes.push(`${genre}.${clef} → ${JSON.stringify(entree)}`);
      }
    }
  }
  assert.deepEqual(fautes, [],
    "un compte ne se vérifie pas et ne se lit pas ; un nom fait les deux, et le jour où le menu " +
    "voudra des liens, ils sont déjà là.");
});

/* ══ 3. LA MESURE EST VRAIE, PAS SEULEMENT REPRODUCTIBLE ═════════════════ */

test("⭐ l'export et le garde VERBATIM disent la même chose sur les armes", () => {
  /* Eric, 2026-08-20 : *« pour les armes, je n'ai rien fait de différent du
     SRD »*. `tests/verbatim-srd.test.mjs` l'interdit dans les COUCHES ; ici on
     vérifie que la mesure le RAPPORTE. Les deux gardes peuvent tomber
     séparément : une couche propre mal mesurée publierait un faux changement,
     et une couche sale bien mesurée publierait un vrai changement interdit. */
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  for (const genre of ["weapon", "weapon-mastery", "weapon-property"]) {
    for (const clef of CLEFS) {
      assert.deepEqual(doc.genres[genre][clef], [],
        `${genre}.${clef} devrait être vide : le domaine des armes est verbatim SRD.`);
    }
  }
});

test("la mesure rapporte ce qu'Eric peut vérifier de tête", () => {
  /* Deux témoins choisis parce qu'ils sont les plus vérifiables du livre —
     et parce qu'ils sont les deux phrases les plus fortes du futur menu. */
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  assert.deepEqual(doc.genres.background.removed, ["Acolyte", "Criminal", "Sage", "Soldier"],
    "Fate's Hand ÉTEINT les quatre arrière-plans du SRD");
  assert.deepEqual(doc.genres.background.added, ["Inheritance"],
    "…et pose l'Inheritance à leur place");
  assert.deepEqual(doc.genres.species.added, ["Araag", "Elestu", "Loroka"]);
  assert.deepEqual(doc.genres.skill.removed, ["Perception"]);
  assert.equal(doc.genres.arcana.added.length, 22, "les 22 Arcanes — le genre qui n'a AUCUNE contrepartie SRD");
});

test("⭐ LE RENOMMAGE EST DÉCLARÉ — le Gnome ne disparaît pas en silence", () => {
  /* `srd:species:en:gnome` est patché en « Hoddon ». Rangé dans `patched` sous
     son seul nom d'arrivée, il ferait croire que le Hoddon est une espèce du
     SRD que FH retouche — et le mot « Gnome » quitterait le fichier sans qu'une
     ligne le dise. Or *« Fate's Hand remplace le Gnome par le Hoddon »* est
     exactement la phrase qu'Eric craignait de voir noyée. */
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  assert.deepEqual(doc.genres.species.renamed, [{ from: "Gnome", to: "Hoddon" }]);
  assert.ok(doc.genres.species.patched.includes("Hoddon"),
    "le record renommé reste un patch : c'est bien le record du SRD qui a changé");
  for (const [genre, mesure] of Object.entries(doc.genres)) {
    assert.ok(Array.isArray(mesure.renamed), `${genre}.renamed manque — même règle ② que les trois autres`);
  }
});

/* ══ 4. LES REFUS ════════════════════════════════════════════════════════ */

test("⚔️ ATTAQUE — une pile dont le SRD n'est pas au bas est REFUSÉE", () => {
  /* LE GARDE QUI COMPTE LE PLUS. Toute la mesure repose sur « le SRD est la
     couche du bas » : réordonnée, `provenance.from` cesse de désigner le SRD et
     le fichier sortirait en déclarant que Fate's Hand AJOUTE 1 093 records,
     330 monstres compris — tout en restant vert, et publié en tête de chaque
     chapitre. */
  const inversee = [PILE[1], ...PILE.filter((_, i) => i !== 1)];
  assert.throws(() => build({ pile: inversee }), (erreur) => {
    assert.ok(erreur instanceof GenError, `attendu GenError, reçu ${erreur.constructor.name}`);
    assert.match(erreur.message, /couche du bas/);
    assert.match(erreur.message, /fh-species-en/, "le refus doit NOMMER le vrai bas de pile");
    return true;
  });
});

test("⚔️ ATTAQUE — un record dont un patch a VIDÉ le nom fait JETER", () => {
  /* ⭐ ET LE TROU EST RÉEL, MESURÉ EN ÉCRIVANT CE TEST. Un `add` ne peut pas
     être sans nom : le lecteur de couche l'exige (`assertString`, min 1). Le
     pli refuse aussi `remove: ["name"]` — retirer une racine entière du record.
     Mais `changes: {"name": ""}` PASSE : la validation du nom est faite à la
     lecture du geste `add`, jamais sur le RÉSULTAT d'un patch. Un nom vide, ou
     un nombre, traverse donc tout le moteur et n'aurait été vu que dans le
     menu d'un chapitre publié — sous la forme d'une virgule solitaire. */
  const tmp = mkdtempSync(join(tmpdir(), "fhpc-fh-changes-attaque-"));
  try {
    const couche = (id, records) => ({
      schema: "fh-layer/1", id, version: "0.0.1", name: id, lang: "en",
      flags: [], attribution: { license: "CC-BY-4.0" }, description: "témoin de test", records
    });
    const bas = couche("srd-5.2.1-en", {
      skill: { "srd:skill:en:temoin": { name: "Témoin", slug: "temoin", data: { ability: "dex" } } }
    });
    const haut = couche("fh-attaque-en", {
      skill: { "srd:skill:en:temoin": { op: "patch", changes: { name: "" } } }
    });
    writeFileSync(join(tmp, "srd-5.2.1-en.layer.json"), JSON.stringify(bas));
    writeFileSync(join(tmp, "fh-attaque-en.layer.json"), JSON.stringify(haut));
    const pile = ["srd-5.2.1-en.layer.json", "fh-attaque-en.layer.json"];

    assert.throws(() => build({ root: tmp, pile }), (erreur) => {
      assert.ok(erreur instanceof GenError);
      assert.match(erreur.message, /n'a pas de nom lisible/);
      assert.match(erreur.message, /srd:skill:en:temoin/, "le refus doit nommer le genre ET l'id fautif");
      return true;
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

/* ══ 5. L'EMPREINTE ══════════════════════════════════════════════════════ */

test("l'empreinte suit les OCTETS des couches, et se recalcule depuis `stack`", () => {
  /* ⭐ Une empreinte dont personne ne peut retrouver les ingrédients ne prouve
     rien, elle rassure. Celle-ci se recalcule à partir de ce que le fichier
     publie juste à côté d'elle — c'est ce qui en fait une preuve. */
  const doc = JSON.parse(readFileSync(CHEMIN, "utf8"));
  assert.equal(empreinte(doc.stack), doc.layer_run);

  const bougee = doc.stack.map((couche, i) => (i === 0 ? Object.assign({}, couche, { hash: "0".repeat(64) }) : couche));
  assert.notEqual(empreinte(bougee), doc.layer_run,
    "une couche dont les octets changent doit changer l'empreinte de la passe");
});

/* ══ 6. LA FONCTION DE MESURE, SEULE ═════════════════════════════════════ */

test("`mesurerGenre` ne compte un ajout FH qu'UNE fois, même patché ensuite", () => {
  /* Les trois espèces maison sont posées par `fh-species-en` PUIS patchées par
     `fh-fiche-en` et `fh-lore-en`. Elles doivent sortir en `added`, jamais en
     `patched` : le SRD n'a jamais rien dit d'elles, donc FH ne « change » rien
     en les complétant. C'est précisément ce qu'une lecture naïve des `op:` des
     fichiers de couche aurait raté. */
  const srd = monter([PILE[0]]);
  const fh = monter(PILE);
  const species = mesurerGenre("species", srd, fh);
  for (const nom of ["Araag", "Elestu", "Loroka"]) {
    assert.ok(species.added.includes(nom), `${nom} devrait être un ajout`);
    assert.ok(!species.patched.includes(nom), `${nom} ne doit pas être compté deux fois`);
  }
  assert.equal(species.added.length + species.patched.length, 12, "les 12 espèces de la pile, chacune une fois");
});

test("le sérialiseur rend un JSON relisible et terminé par une fin de ligne", () => {
  const texte = serialize(build());
  assert.equal(texte.at(-1), "\n");
  assert.doesNotThrow(() => JSON.parse(texte));
});
