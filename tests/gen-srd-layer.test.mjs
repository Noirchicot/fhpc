/* Lot 4-couche-srd — le générateur de la couche SRD (kickoff §L4).

   Quatre obligations posées par le mandat : le MANIFEST se vérifie avant
   usage (mismatch → échec bruyant qui nomme le fichier) ; les deux couches
   valident contre fh-layer/1 ; les comptes par genre ne descendent pas sous
   les seuils relevés à la génération (2 658 records au total : les 2 613 du
   kickoff §L4, plus les 19 par langue des deux genres du lot 19 de fh-srd,
   plus les 5 objets rendus par son lot 86, plus `item-value` — 1 record par
   langue, lot 92) ; trois ids connus se retrouvent tels quels.

   Le générateur est relancé ici (pas seulement lu depuis layers/ commité) :
   un test qui ne relit que la sortie déjà écrite ne prouve pas que la
   génération elle-même est reproductible.

   ⚠️ …ET IL EST RELANCÉ DANS UN RÉPERTOIRE TEMPORAIRE, jamais dans `layers/`.
   Cette suite y écrivait, et l'exécution suivante héritait de la mutation ;
   le récit complet et le garde qui l'interdit sont dans tests/tree-watch.mjs
   et tests/tree-immuable.test.mjs.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import {
  GENRES,
  GENRES_MAISON,
  LANGS,
  SRD_ROOT,
  verifyManifest,
  assertDigestMatches,
  deriveGenres,
  lireInventaire,
  buildLayer,
  generate
} from "../src/tools/gen-srd-layer.mjs";
import { GENRES as GENRES_DECLARES } from "../src/layers/document.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const layerSchema = JSON.parse(readFileSync(join(root, "schemas/fh-layer.schema.json"), "utf8"));
const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateLayer = ajv.compile(layerSchema);

/* fh-srd est une dépendance ferme de ce lot (kickoff §L4, worktree monté
   APRÈS le merge du lot 6-srd-tables) — pas un intrant optionnel qu'on
   saute en silence si absent. Un dépôt manquant est un échec bruyant, pas un
   `skip`. */
if (!existsSync(SRD_ROOT)) {
  throw new Error(`gen-srd-layer.test : fh-srd introuvable à ${SRD_ROOT} — dépendance ferme du lot 4-couche-srd.`);
}

/* ══ L'AMONT EST-IL EN PLEIN LOT ? — 2026-08-20 ═════════════════════════════
   🔴 CE GARDE M'A SURPRIS DEUX FOIS DANS LA MÊME JOURNÉE, et la seconde après
   que je l'aie documenté dans un message de commit. Il compare la couche
   commitée à ce que le générateur produit DEPUIS L'ARBRE DE TRAVAIL de
   `~/tools/fh-srd`. Quand un lot y travaille — et il y en a eu deux
   aujourd'hui — il rougit avec un diff de trois millions de caractères qui ne
   dit rien de la cause.

   ⛔ ET IL NE PEUT PAS DISTINGUER LES DEUX SITUATIONS QU'IL MÉLANGE : « notre
   artefact a dérivé » (un vrai défaut, à réparer) et « le voisin travaille »
   (rien à faire, attendre la fusion). Un garde qui rougit pour deux raisons
   opposées sans les nommer fait perdre plus de temps qu'il n'en sauve.

   ⭐ LA BONNE QUESTION N'EST PAS « L'ARBRE EST-IL SALE », C'EST « CE FICHIER
   DIT-IL AUTRE CHOSE QUE `main` ? » — le fil FH WEB l'a posée mieux que moi
   pour son propre résolveur de citations, et je reprends sa formulation. Elle
   couvre d'un seul geste les DEUX cas : la modification non commitée ET la
   branche divergente. Un `git status` ne voit que le premier ; une branche à
   l'arbre propre mais aux octets divergents passerait au travers.

   ⚠️ ET SI GIT EST ILLISIBLE, ON CONTINUE — mais sans prétendre avoir vérifié.
   Le garde reprend alors son ancien comportement, ce qui est le bon repli : il
   vaut mieux un diff illisible qu'un test qui se tait. */
function amontEnPleinLot() {
  const git = (args) => execFileSync("git", args, { cwd: SRD_ROOT, encoding: "utf8" }).trim();
  try {
    const branche = git(["rev-parse", "--abbrev-ref", "HEAD"]);
    /* ⚠️ `SRD_ROOT` DÉSIGNE `…/fh-srd/exports`, PAS LA RACINE DU DÉPÔT — et
       c'est ce qui a fait taire ce garde à son premier essai : un pathspec
       `exports/` résolu depuis `exports/` cherche `exports/exports/`, ne trouve
       rien, et conclut « l'amont est calme ». Le `.` dit « ce dossier-ci », qui
       est exactement le périmètre à surveiller. */
    const ecarts = git(["diff", "--name-only", "main", "--", "."])
      .split("\n").map((ligne) => ligne.trim()).filter(Boolean);
    return ecarts.length > 0 ? { branche, ecarts } : null;
  } catch (_) {
    return null;
  }
}

test("le MANIFEST se vérifie avant usage : un mismatch nomme le fichier et jette", () => {
  assert.throws(
    () => assertDigestMatches("srd/en/spell.json", "deadbeef", { sha256: "cafebabe" }),
    /srd\/en\/spell\.json/,
    "l'erreur doit nommer le fichier fautif"
  );
});

test("le MANIFEST se vérifie avant usage : une entrée absente nomme aussi le fichier", () => {
  assert.throws(
    () => assertDigestMatches("srd/fr/skill.json", "deadbeef", undefined),
    /srd\/fr\/skill\.json/
  );
});

test("verifyManifest() passe sur les exports fh-srd réels — les genres DÉRIVÉS × les deux langues", () => {
  assert.doesNotThrow(() => verifyManifest());

  /* ⚠️ CE LIBELLÉ DISAIT « 32 fichiers, 16 genres × 2 langues » PENDANT QUE LA
     SOURCE EN PORTAIT 34 ET 17. Un chiffre écrit dans un titre de test n'est
     relu par personne : il décore, il ne mesure pas. Le compte se prend donc
     ICI, sur la liste dérivée — et en PLANCHER, comme les comptes par genre :
     un genre SRD de plus est une bonne nouvelle, pas une régression. */
  assert.ok(GENRES.length >= 17,
    `${GENRES.length} genre(s) dérivé(s) — la source en portait 17 le 2026-08-23 ; en perdre serait une régression`);
  assert.equal(LANGS.length, 2, "les deux langues, et un `verifyManifest()` qui ne vérifierait rien passerait aussi");
});

test("chaque couche générée valide contre fh-layer/1", () => {
  for (const lang of LANGS) {
    const { layer } = buildLayer(lang);
    const ok = validateLayer(layer);
    assert.equal(ok, true, `couche ${lang} devrait valider — ${ajv.errorsText(validateLayer.errors)}`);
  }
});

test("les genres DÉRIVÉS sont présents dans chaque couche, aucun manquant, aucun en trop", () => {
  for (const lang of LANGS) {
    const { layer } = buildLayer(lang);
    assert.deepEqual(Object.keys(layer.records).sort(), [...GENRES].sort());
  }
});

test("2 658 records au total — 2 656 dans la source + `item-value` × 2 langues (lot 92)", () => {
  /* MESURÉ le 2026-08-23, et le chiffre précédent — 2 651 — était périmé de
     SEPT : cinq objets `item` rendus à l'anglais par le lot 86 de fh-srd, et
     les deux records `item-value` que la liste de genres écrite en dur sautait
     en silence. Le total, lui, n'a jamais bougé tout seul : c'est la source
     qu'on a corrigée, et la copie qui n'avait pas suivi. */
  const { total: totalFr } = buildLayer("fr");
  const { total: totalEn } = buildLayer("en");
  assert.equal(totalFr, 1329, "la couche FR seule");
  assert.equal(totalEn, 1329, "la couche EN seule — elle a rattrapé le FR sur `item` (253 → 258)");
  assert.equal(totalFr + totalEn, 2658);
});

/* Seuils relevés à la génération (mesurés ci-dessus) : un futur sync fh-srd
   qui ferait taire un genre entier — un fichier vide lu sans erreur — doit
   casser ce test, pas passer inaperçu. */
const FLOORS = {
  armor: 13, background: 4, class: 12, "class-progression": 12, feat: 17,
  /* `item` : 253 → 258 le 2026-08-23. Ce n'était PAS une croissance de la
     source : le FR portait déjà 258, et le lot 86 de fh-srd a rendu à l'EN
     cinq objets que son extraction avalait — Dancing Sword, Frost Brand, Luck
     Blade, Sword of Life Stealing, Sword of Wounding. Le plancher suivait donc
     la langue la plus pauvre, et il l'aurait suivie indéfiniment. */
  gear: 82, glossary: 152, item: 258, monster: 330, skill: 18, species: 9,
  spell: 339, tool: 25, weapon: 38,
  /* Lot 92 de fh-srd — le barème des prix par rareté, UN record par langue.
     ⭐ ET C'EST UNE ÉGALITÉ DÉGUISÉE DE PLUS, pour la même raison que les deux
     ci-dessous : une seule table, donc un seul record. Un deuxième serait une
     anomalie d'extraction. Ce genre est l'accusé de ce lot : il vivait dans la
     source, inscrit au MANIFEST, dans les deux langues — et la couche l'a
     ignoré une journée entière parce qu'une liste de seize noms ne le
     connaissait pas. */
  "item-value": 1,
  /* Lot 19 de fh-srd (2026-08-20) — les deux blocs de la page 90 du SRD 5.2.1.
     ⭐ CES DEUX SEUILS SONT DES ÉGALITÉS DÉGUISÉES, et c'est voulu : contrairement
     aux sorts ou aux monstres, ce sont des ensembles FERMÉS que la source énumère
     (11 propriétés, 8 maîtrises). Un 12ᵉ ou un 9ᵉ serait une anomalie d'extraction,
     pas une richesse — et il passerait ce plancher-ci. Le garde qui compte À
     L'ÉGAL vit en amont, dans fh-srd (`SectionCountError`, qui NOMME le terme
     manquant) ; celui-ci n'est que le filet de ce dépôt. */
  "weapon-mastery": 8, "weapon-property": 11
};

test("comptes par genre ≥ seuils relevés à la génération, pour les deux langues", () => {
  /* ⚠️ UN GENRE SANS SEUIL N'EST PAS UN GENRE SANS PLANCHER — il est NON
     MESURÉ, et `n >= undefined` vaut `false` en silence, ce qui rendrait
     l'échec illisible (« attendu ≥ undefined »). Depuis que `GENRES` se dérive
     de la source, un genre neuf arrive ICI avant d'arriver dans cette table :
     il est donc nommé, avec ce qu'il faut faire. Une absence n'est pas une
     réponse. */
  const sansSeuil = GENRES.filter((genre) => !Number.isInteger(FLOORS[genre]));
  assert.deepEqual(sansSeuil, [],
    `genre(s) dérivé(s) de la source sans seuil déclaré : ${sansSeuil.join(", ")} — ` +
    "relever le compte à la génération et l'inscrire dans FLOORS, ne pas laisser le garde deviner.");

  for (const lang of LANGS) {
    const { countsByGenre } = buildLayer(lang);
    for (const genre of GENRES) {
      assert.ok(
        countsByGenre[genre] >= FLOORS[genre],
        `${lang}/${genre} : ${countsByGenre[genre]} record(s), attendu ≥ ${FLOORS[genre]}`
      );
    }
  }
});

/* ══ LA PORTE QUI LAISSAIT PASSER — 2026-08-23 (lot 93) ════════════════════
   🔴 CE GÉNÉRATEUR PORTAIT LA BONNE RÈGLE ET FAISAIT L'INVERSE. Son commentaire
   disait « ce qui entre ici est un fichier d'export fh-srd, un point », et
   trois lignes plus bas seize noms écrits en dur. `exports/srd/en/` en portait
   DIX-SEPT. `item-value` — livré par le lot 92, présent dans les deux langues,
   déjà inscrit au MANIFEST — n'a provoqué AUCUNE erreur : il était simplement
   absent de la couche, et personne ne l'aurait su.

   ⭐ ET LA RÉPONSE OPPOSÉE EXISTAIT DÉJÀ, LE MÊME SOIR, DANS LA SOURCE : chez
   fh-srd, `build_web.py` a REFUSÉ le genre neuf tant qu'il n'était pas déclaré
   — deux suites rouges, défaut trouvé en dix secondes. Le même problème, deux
   réponses opposées ; ces deux attaques gardent la bonne.

   ⚠️ ELLES ATTAQUENT LES DEUX MOITIÉS SÉPARÉMENT, et il faut les deux : la
   première éprouve la RÈGLE sur un inventaire fabriqué, la seconde éprouve la
   LECTURE en posant un vrai fichier sur un vrai disque. Un refus juste sur un
   inventaire que personne ne sait remplir ne refuserait rien. */

test("⚔️ ATTAQUE (la règle) — les quatre refus NOMMENT ce qu'ils écartent", () => {
  const sain = {
    fr: { disque: ["item", "spell"], manifest: ["item", "spell"] },
    en: { disque: ["spell", "item"], manifest: ["spell", "item"] }
  };
  const declares = ["item", "spell"];

  /* LE TÉMOIN D'ABORD : un garde qui refuse tout ne prouve rien de plus qu'un
     garde qui accepte tout. Et il rend la liste TRIÉE — l'ordre des clefs
     `records` de la couche écrite en dépend, donc de sa reproductibilité. */
  assert.deepEqual(deriveGenres(sain, { declares }), ["item", "spell"]);

  // ① LE GENRE MAISON — refusé pour SON motif, la loi §0.12.
  assert.throws(
    () => deriveGenres({ ...sain, en: { disque: ["item", "spell", "arcana"], manifest: ["item", "spell", "arcana"] } }, { declares: [...declares, "arcana"] }),
    (e) => /arcana/.test(e.message) && /0\.12/.test(e.message) && /Refusé, pas sauté/.test(e.message),
    "un genre Fate's Hand dans les exports SRD doit être nommé AVEC son motif"
  );

  // ② LE FICHIER NON VÉRIFIÉ — posé sans être inscrit au MANIFEST.
  assert.throws(
    () => deriveGenres({ ...sain, en: { disque: ["item", "spell", "tarot"], manifest: ["item", "spell"] } }, { declares }),
    (e) => /srd\/en\/tarot\.json/.test(e.message) && /MANIFEST/.test(e.message),
    "le chemin exact du fichier non inscrit doit être dans le message"
  );

  // ...et le sens inverse : inscrit au MANIFEST, absent du disque.
  assert.throws(
    () => deriveGenres({ ...sain, fr: { disque: ["item"], manifest: ["item", "spell"] } }, { declares }),
    (e) => /srd\/fr\/spell\.json/.test(e.message) && /INTROUVABLE/.test(e.message),
    "une source qui a perdu un export se nomme, elle ne se comble pas"
  );

  // ③ LE GENRE BOITEUX — publié dans une langue et pas dans l'autre.
  assert.throws(
    () => deriveGenres({
      fr: { disque: ["item"], manifest: ["item"] },
      en: { disque: ["item", "spell"], manifest: ["item", "spell"] }
    }, { declares }),
    (e) => /spell/.test(e.message) && /absent en fr/.test(e.message),
    "l'asymétrie doit dire QUELLE langue manque — pas se rattraper par une intersection"
  );

  // ④ LE GENRE INCONNU DU CONTRAT — celui qui rendrait la couche invalide.
  assert.throws(
    () => deriveGenres({
      fr: { disque: ["item", "tarot"], manifest: ["item", "tarot"] },
      en: { disque: ["item", "tarot"], manifest: ["item", "tarot"] }
    }, { declares }),
    (e) => /tarot/.test(e.message) && /fh-layer\/1/.test(e.message),
    "un genre que le contrat ne déclare pas doit être nommé, pas écrit sur le disque"
  );

  // ET LE VIDE N'EST PAS UNE RÉPONSE.
  assert.throws(() => deriveGenres({}), /vide/);

  /* Enfin, sur la VRAIE liste : ce que la source publie aujourd'hui est bien
     déclaré au contrat, et aucun genre maison ne s'y est glissé. */
  for (const genre of GENRES) {
    assert.ok(GENRES_DECLARES.includes(genre), `${genre} dérivé mais absent du contrat fh-layer/1`);
    assert.equal(GENRES_MAISON.includes(genre), false, `${genre} est un genre maison — il n'a rien à faire dans la couche SRD`);
  }
  assert.deepEqual(GENRES_MAISON, ["arcana", "training"]);
});

test("⚔️ ATTAQUE (la lecture) — un FICHIER d'export inconnu posé sur le disque est NOMMÉ, pas sauté", () => {
  /* ⛔ L'ARBRE EST FABRIQUÉ DANS UN RÉPERTOIRE TEMPORAIRE. Poser le faux export
     dans `~/tools/fh-srd` pour prouver qu'on sait le voir serait salir le dépôt
     du voisin — la faute même que tests/tree-immuable.test.mjs interdit, un
     cran plus loin. `lireInventaire()` prend donc sa racine en argument. */
  const tmp = mkdtempSync(join(tmpdir(), "fhpc-faux-srd-"));
  const ecrireManifest = (paths) =>
    writeFileSync(join(tmp, "MANIFEST.json"), JSON.stringify({ files: paths.map((p) => ({ path: p, sha256: "0".repeat(64) })) }));
  const poser = (lang, genre) => writeFileSync(join(tmp, "srd", lang, `${genre}.json`), "{}\n");

  try {
    for (const lang of ["fr", "en"]) mkdirSync(join(tmp, "srd", lang), { recursive: true });
    for (const lang of ["fr", "en"]) { poser(lang, "item"); poser(lang, "spell"); }
    const socle = ["srd/fr/item.json", "srd/fr/spell.json", "srd/en/item.json", "srd/en/spell.json"];
    /* Le MANIFEST porte aussi ce qui n'est PAS un genre de la couche SRD — et
       c'est le piège que la lecture doit éviter toute seule : `exclusions.json`
       n'a pas de langue, `srd/correspondence.json` est sous `srd/` sans être
       sous une langue, et `srfh/` est une AUTRE couche (lot 90, hors de ce lot). */
    const bruit = ["exclusions.json", "srd/correspondence.json", "srfh/en/item.json", "srfh/en/shelving.json"];
    ecrireManifest([...socle, ...bruit]);

    // TÉMOIN — le bruit du MANIFEST ne devient pas un genre, et rien ne rougit.
    const declares = ["item", "spell"];
    assert.deepEqual(deriveGenres(lireInventaire(tmp), { declares }), ["item", "spell"],
      "ni `exclusions`, ni `correspondence`, ni la couche `srfh` ne sont des genres de la couche SRD");

    // ON POSE LE FAUX EXPORT — sur le disque seulement.
    poser("en", "tarot");
    assert.throws(() => deriveGenres(lireInventaire(tmp), { declares }),
      (e) => /srd\/en\/tarot\.json/.test(e.message) && /MANIFEST/.test(e.message),
      "un fichier posé et non inscrit doit être NOMMÉ — c'est exactement ce qu'une liste en dur sautait");

    // ON L'INSCRIT AU MANIFEST — il reste boiteux, et il est encore nommé.
    ecrireManifest([...socle, ...bruit, "srd/en/tarot.json"]);
    assert.throws(() => deriveGenres(lireInventaire(tmp), { declares }),
      (e) => /tarot/.test(e.message) && /absent en fr/.test(e.message));

    // ON LE PUBLIE DANS LES DEUX LANGUES — le contrat le refuse, et le nomme.
    poser("fr", "tarot");
    ecrireManifest([...socle, ...bruit, "srd/en/tarot.json", "srd/fr/tarot.json"]);
    assert.throws(() => deriveGenres(lireInventaire(tmp), { declares }),
      (e) => /tarot/.test(e.message) && /fh-layer\/1/.test(e.message),
      "⛔ ET C'EST LE DERNIER VERROU : sans lui, `node src/tools/gen-srd-layer.mjs` écrirait sur le disque une couche que le schéma refuse");

    /* ⭐ LA PREUVE PAR L'ACCUSÉ : déclaré au contrat, le genre neuf ENTRE. Sans
       ce dernier pas, ces attaques prouveraient seulement qu'on sait tout
       refuser — et c'est précisément ce qu'il ne faut pas faire d'un genre SRD
       de plus. C'est le chemin qu'`item-value` aurait dû suivre. */
    assert.deepEqual(deriveGenres(lireInventaire(tmp), { declares: [...declares, "tarot"] }),
      ["item", "spell", "tarot"]);

    // ET LE GENRE MAISON, LUI, N'ENTRE JAMAIS — même déclaré, même inscrit.
    for (const lang of ["fr", "en"]) poser(lang, "arcana");
    ecrireManifest([...socle, ...bruit, "srd/en/tarot.json", "srd/fr/tarot.json", "srd/en/arcana.json", "srd/fr/arcana.json"]);
    assert.throws(() => deriveGenres(lireInventaire(tmp), { declares: [...declares, "tarot", "arcana"] }),
      (e) => /arcana/.test(e.message) && /0\.12/.test(e.message));

    // UNE RACINE SANS MANIFEST SE NOMME, elle ne rend pas un inventaire vide.
    const vide = mkdtempSync(join(tmpdir(), "fhpc-sans-manifest-"));
    try {
      assert.throws(() => lireInventaire(vide), (e) => /MANIFEST\.json illisible/.test(e.message) && e.message.includes(vide));
    } finally {
      rmSync(vide, { recursive: true, force: true });
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("spot-check — un sort, une espèce, un don connus survivent tels quels", () => {
  const { layer: en } = buildLayer("en");
  const { layer: fr } = buildLayer("fr");

  assert.equal(en.records.spell["srd:spell:en:fireball"].name, "Fireball");
  assert.equal(en.records.species["srd:species:en:dragonborn"].name, "Dragonborn");
  assert.equal(en.records.feat["srd:feat:en:alert"].name, "Alert");

  assert.equal(fr.records.spell["srd:spell:fr:boule-de-feu"].name, "Boule de feu");
  assert.equal(fr.records.species["srd:species:fr:drakeide"].name, "Drakéide");
});

test("piège de forme — class-progression du lanceur de pacte n'est pas « corrigé »", () => {
  /* kickoff §L4, encadré « CE QUI A CHANGÉ SOUS TES PIEDS » : spell_slots est
     un TABLEAU chez un lanceur plein/demi, et ABSENT chez l'occultiste, dont
     la magie de pacte vit en scalaire dans resources.spell_slots avec son
     slot_level. Discriminant fiable : spell_slot_levels ∈ {0, 5, 9}. */
  const { layer: en } = buildLayer("en");
  const warlock = en.records["class-progression"]["srd:class-progression:en:warlock"].data;
  const wizard = en.records["class-progression"]["srd:class-progression:en:wizard"].data;
  const fighter = en.records["class-progression"]["srd:class-progression:en:fighter"].data;

  assert.equal(warlock.spell_slot_levels, 0, "l'occultiste n'a pas de bande d'emplacements — c'est une magie de pacte");
  assert.equal(
    Object.hasOwn(warlock.levels[0], "spell_slots"),
    false,
    "l'occultiste ne porte AUCUN tableau spell_slots au niveau du level — ne pas en fabriquer un"
  );
  assert.equal(typeof warlock.levels[0].resources.spell_slots, "number", "chez l'occultiste, spell_slots est un SCALAIRE dans resources");
  assert.equal(typeof warlock.levels[0].resources.slot_level, "number");

  assert.equal(wizard.spell_slot_levels, 9);
  assert.equal(wizard.levels[0].spell_slots.length, 9);
  assert.equal(typeof wizard.levels[0].resources.cantrips, "number", "le magicien garde ses ressources propres (cantrips…) EN PLUS de la bande de slots, jamais l'une à la place de l'autre");

  assert.equal(fighter.spell_slot_levels, 0);
  assert.equal(Object.hasOwn(fighter.levels[0], "spell_slots"), false, "un non-lanceur n'a pas de bande d'emplacements du tout");

  const levels = [...new Set([warlock, wizard, fighter].map((d) => d.spell_slot_levels))];
  for (const v of levels) assert.ok([0, 5, 9].includes(v), `spell_slot_levels doit être 0, 5 ou 9 — obtenu ${v}`);
});

test("aucune correspondance FR↔EN inventée — les deux couches restent autonomes", () => {
  const { layer: en } = buildLayer("en");
  const { layer: fr } = buildLayer("fr");
  assert.equal(en.lang, "en");
  assert.equal(fr.lang, "fr");
  const enSpellIds = new Set(Object.keys(en.records.spell));
  const frSpellIds = new Set(Object.keys(fr.records.spell));
  const shared = [...enSpellIds].filter((id) => frSpellIds.has(id));
  assert.equal(shared.length, 0, "aucun id de sort ne devrait être partagé entre les deux langues");
});

test("déterminisme — deux générations produisent des objets byte-identiques une fois sérialisés", () => {
  for (const lang of LANGS) {
    const first = JSON.stringify(buildLayer(lang).layer);
    const second = JSON.stringify(buildLayer(lang).layer);
    assert.equal(first, second);
  }
});

/* REWRITTEN 2026-08-08 (lot 13) — CE TEST ÉCRIVAIT DANS `layers/`.
   Il appelait `generate()`, dont la destination était en dur, donc il
   ÉCRASAIT les deux couches commitées, puis comparait avant/après. Défaut
   mesuré et reproductible par l'architecte, avec deux conséquences :

     · la suite laissait l'arbre SALE à chaque exécution ;
     · l'exécution SUIVANTE héritait de la mutation — deux passes d'affilée
       sans nettoyage : 307 vertes / 1 rouge, puis 304 vertes / 4 rouges. La
       même suite, deux verdicts, sans qu'une ligne ait changé.

   CE QUE LE TEST PROUVE N'A PAS BOUGÉ ; L'ENDROIT OÙ IL L'ÉCRIT, SI. Il
   génère dans un répertoire temporaire — `generate()` prend sa destination en
   argument depuis ce lot — et compare la sortie fraîche aux fichiers
   commités. C'est même un peu plus fort qu'avant : l'ancienne version
   comparait le disque à lui-même APRÈS l'avoir écrasé, donc elle ne pouvait
   plus rougir sur une couche commitée périmée ; celle-ci le peut.

   Le garde qui interdit la rechute — pour cette suite et pour toutes les
   autres — est tests/tree-immuable.test.mjs. */
test("generate() écrit les deux couches DANS SA DESTINATION, et les fichiers commités sont ceux-là", () => {
  const tmp = mkdtempSync(join(tmpdir(), "fhpc-gen-srd-"));
  const avant = {
    fr: readFileSync(join(root, "layers/srd-5.2.1-fr.layer.json"), "utf8"),
    en: readFileSync(join(root, "layers/srd-5.2.1-en.layer.json"), "utf8")
  };
  try {
    const results = generate({ outDir: tmp });
    assert.deepEqual(Object.keys(results).sort(), ["en", "fr"], "les deux langues sont écrites, pas une");

    for (const lang of LANGS) {
      const attendu = join(tmp, `srd-5.2.1-${lang}.layer.json`);
      assert.equal(results[lang].outPath, attendu, "le générateur DIT où il a écrit");
      assert.equal(existsSync(attendu), true, `le fichier ${lang} doit exister dans la destination donnée`);
      /* ⭐ LA CAUSE AVANT LE DIFF. Trois millions de caractères ne disent pas
         pourquoi ils diffèrent ; cette phrase-ci, si. */
      const lot = amontEnPleinLot();
      if (lot && readFileSync(attendu, "utf8") !== avant[lang]) {
        assert.fail(
          `la couche ${lang} diffère, et L'AMONT EST EN PLEIN LOT : ` +
          `${SRD_ROOT} est sur la branche « ${lot.branche} », ` +
          `${lot.ecarts.length} fichier(s) d'export s'écartent de \`main\` (${lot.ecarts.join(", ")}). ` +
          "Ce n'est PAS une dérive de notre artefact : régénérer maintenant importerait du travail non fusionné. " +
          "Attendre la fusion, puis `node src/tools/gen-srd-layer.mjs`."
        );
      }
      assert.equal(readFileSync(attendu, "utf8"), avant[lang],
        `la couche ${lang} commitée n'est plus celle que le générateur produit — régénérer, ou dire ce qui a bougé`);
    }

    /* ET IL N'A ÉCRIT QUE LÀ. La preuve du lot : les deux couches commitées
       sont intactes après l'appel. Sans cette assertion, la réparation elle-
       même reposerait sur la confiance. */
    assert.equal(readFileSync(join(root, "layers/srd-5.2.1-fr.layer.json"), "utf8"), avant.fr,
      "`generate({outDir})` ne doit RIEN écrire dans layers/");
    assert.equal(readFileSync(join(root, "layers/srd-5.2.1-en.layer.json"), "utf8"), avant.en);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

/* ══ OÙ SE LIT LE COMPTE DE MAÎTRISES — 2026-08-20 ═════════════════════════
   🔴 CE GARDE EST PRÉVENTIF, ET IL VISE UN PIÈGE QUE JE M'APPRÊTE À TENDRE
   MOI-MÊME. Le fil FH WEB s'est fait mordre par sa propre garde en exigeant le
   compte de maîtrises DANS LA TABLE DE PROGRESSION : elle a refusé de
   construire, « Paladin a un vivier mais aucun compte dans sa progression ».

   ⛔ CE N'ÉTAIT PAS UN TROU DANS LES DONNÉES, C'ÉTAIT SA LECTURE. Seuls le
   barbare et le guerrier portent une colonne « Weapon Mastery », parce que ce
   sont les SEULS dont le nombre bouge en montant de niveau. Pour paladin,
   rôdeur et roublard il ne change jamais, donc la colonne n'existe pas — et le
   compte vit sur le record de CLASSE. C'est la forme de la source ; c'est la
   lecture qui doit s'y plier.

   ⚠️ ET LE PRÉCÉDENT QUI ME TENDRA LE PIÈGE EST DÉJÀ DANS CE DÉPÔT :
   `decisions.mjs` lit les comptes de sorts mineurs et préparés dans
   `class-progression.levels[].resources`. Écrire l'écran des maîtrises en
   suivant ce patron — le geste naturel, le fichier voisin — rendrait le
   builder AVEUGLE pour trois classes sur cinq, en silence : elles n'auraient
   simplement aucun plan, donc aucun écran, donc aucune maîtrise à choisir.

   📌 TROISIÈME PIÈGE DE LA MÊME FAMILLE DANS LA JOURNÉE, et c'est la vraie
   leçon : SUPPOSER LA FORME D'UN CHAMP AU LIEU DE LA LIRE. Les deux autres —
   `ac_dex_cap` qui vaut 0 sans être absent, et `strength` qui porte déjà son
   préfixe — ont la même racine. */
test("🔴 le compte de maîtrises se lit sur la CLASSE, pas dans la progression", () => {
  const { layer } = buildLayer("en");
  const classes = Object.entries(layer.records.class);

  const surLaClasse = classes.filter(([, r]) => Number.isInteger(r.data.weapon_mastery_count));
  assert.equal(surLaClasse.length, 5, "cinq classes portent Weapon Mastery au niveau 1");

  /* ⚔️ LE TÉMOIN QUI REND LE GARDE UTILE : montrer ce qu'on PERDRAIT en lisant
     la progression. Si un jour le SRD y met les cinq, ce test rougira — et ce
     sera une bonne nouvelle à constater, pas un défaut. */
  const dansLaProgression = Object.entries(layer.records["class-progression"])
    .filter(([, r]) => (r.data.levels || []).some((n) => Number.isInteger((n.resources || {}).weapon_mastery)));
  assert.equal(dansLaProgression.length, 2,
    "seuls le barbare et le guerrier ont la colonne — ce sont les seuls dont le nombre GRANDIT");

  const perdues = surLaClasse
    .map(([id]) => id.split(":").pop())
    .filter((slug) => !dansLaProgression.some(([id]) => id.endsWith(`:${slug}`)));
  assert.deepEqual(perdues.sort(), ["paladin", "ranger", "rogue"],
    "⛔ lire le compte dans la progression rendrait le builder aveugle pour CES trois classes");
});

test("⚠️ le VIVIER, lui, ne dépend pas du niveau — seul le compte grandit", () => {
  /* La table de progression dit « MORE kinds », pas « d'autres kinds ». Le
     vivier vaut donc à tous les niveaux, et le nom du champ ne le dit pas —
     `weapon_mastery_from` pourrait se lire comme « au niveau 1 ». Un lecteur
     qui chercherait un vivier PAR NIVEAU ne le trouverait pas et pourrait
     conclure qu'il manque. Il ne manque pas : il n'existe qu'une fois. */
  const { layer } = buildLayer("en");
  const barbare = layer.records["class-progression"]["srd:class-progression:en:barbarian"];
  const comptes = (barbare.data.levels || [])
    .map((n) => (n.resources || {}).weapon_mastery)
    .filter(Number.isInteger);
  assert.ok(new Set(comptes).size > 1, "témoin : le COMPTE du barbare grandit bien avec le niveau");
  assert.equal(Object.keys(layer.records.class["srd:class:en:barbarian"].data)
    .filter((k) => k.startsWith("weapon_mastery_from")).length, 1,
    "un seul vivier, sans déclinaison par niveau");
});
