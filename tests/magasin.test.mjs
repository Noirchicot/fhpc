/* ══ LOT 195 — LE MAGASIN DE SAUVEGARDES ══════════════════════════════════

   ⚖️ Eric, 10/09, gravé dans `ARCHITECTURE.md` (§ « LE MAGASIN DE
   SAUVEGARDES ») : *« quand j'appuie sur **Open**, j'ai une page avec **toutes
   mes sauvegardes** dedans »* · *« **popup la première fois** que je vais dans
   ce menu »* · *« un **bouton reste présent : "save location"** »* · et sa
   réponse à « que fait Save ? » : *« **une entrée datée à chaque Save** —
   rien n'est écrasé, la page montre les versions par personnage »*.

   🔴 CE QUE CE FICHIER GARDE, ET SUR QUOI :
     A. L'ENTRÉE — nom · date · version, chacun lu là où il est vrai.
        ⚔️ Une entrée sans version → rouge.
     B. L'ÉCRASEMENT — deux Save du même personnage font DEUX entrées, la plus
        récente en tête. ⚔️ Un magasin qui écrase → rouge.
     C. LES DEUX SOLS — la MÊME logique rend la MÊME chose sur un dossier de
        fixture et sur un tiroir de fixture. ⚔️ Deux formes d'entrée → rouge.
     D. LA PAGE — elle rend CE QUE `lister()` REND, quel que soit le sol.
     E. LA DESTINATION — ⛔ aucun popup là où il n'y a rien à choisir ; la ligne
        discrète dit « in this browser » ; décliner est une réponse.
     F. LES DEUX ÉCRIVAINS EXISTANTS — la version FH (192) et `Build a
        character` (193) passent par `ecrire`, pas par un second chemin.
        ⚔️ Un `telecharger` de personnage appelé en direct → rouge.

   ⚠️ CE QUE CE FICHIER NE PEUT PAS ÉPROUVER, ET IL LE DIT : `showDirectoryPicker`
   exige un vrai clic humain, et `indexedDB` n'existe pas sous Node. Le chemin du
   DOSSIER est donc prouvé par un sol de fixture qui a exactement la forme d'une
   `FileSystemDirectoryHandle` ; ce qui reste non couvert est nommé dans la tête
   de `ui/builder/magasin.mjs` (`solDuDossier`, `baseIndexedDb`,
   `choisirUnDossier`). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

globalThis.document = createTestDocument();

const {
  creerMagasin, solDuTiroir, solDuDossier, ouvrirLeMagasin, garderDansLeTiroir,
  clefDeLEntree, dateDeLaClef, entreeDe, parPersonnage, versionDuDocument,
  MOT_DU_TIROIR, VERSION_SOCLE, SUFFIXE
} = await import("../ui/builder/magasin.mjs");
const { renderMagasinEcran, popupDeLaDestination, motDeLaDate } = await import("../ui/builder/magasin-ecran.mjs");
const { renderUniverseStep, SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, sauvegarderPuisEteindre, creerUnPersonnage }
  = await import("../ui/builder/universe-step.mjs");
const { MAITRE } = await import("../ui/builder/interrupteurs.mjs");

/* ── LES DEUX SOLS DE FIXTURE ────────────────────────────────────────────
   ⭐ ILS ONT LA FORME DES VRAIS, PAS UNE FORME COMMODE. Le tiroir est monté
   par `solDuTiroir` sur une base à deux rayons — le même verbe que la base
   IndexedDB. Le dossier est monté par `solDuDossier` sur une poignée qui
   expose `entries`, `getFileHandle`, `createWritable`, `queryPermission` :
   c'est la surface exacte que `magasin.mjs` touche. Un sol de fixture qui
   simplifierait la forme prouverait un chemin que personne n'emprunte. */

function baseDeFixture() {
  const rayons = new Map();
  const rayon = (nom) => {
    if (!rayons.has(nom)) rayons.set(nom, new Map());
    return rayons.get(nom);
  };
  return {
    rayons,
    clefs: async (nom) => [...rayon(nom).keys()],
    lire: async (nom, clef) => (rayon(nom).has(clef) ? rayon(nom).get(clef) : null),
    ecrire: async (nom, clef, valeur) => { rayon(nom).set(clef, valeur); }
  };
}

function poigneeDeFixture(nom = "Personnages", permission = "granted") {
  const fichiers = new Map();
  return {
    fichiers,
    name: nom,
    queryPermission: async () => permission,
    requestPermission: async () => permission,
    async *entries() {
      for (const clef of fichiers.keys()) yield [clef, { kind: "file" }];
      yield ["une-photo.png", { kind: "file" }];      // un intrus du dossier du joueur
      yield ["un-sous-dossier", { kind: "directory" }];
    },
    async getFileHandle(clef, options) {
      if (!fichiers.has(clef)) {
        if (!options || !options.create) throw new Error("NotFoundError");
        fichiers.set(clef, "");
      }
      return {
        getFile: async () => ({ text: async () => fichiers.get(clef) }),
        createWritable: async () => ({
          write: async (texte) => { fichiers.set(clef, texte); },
          close: async () => {}
        })
      };
    }
  };
}

const magasinDeTiroir = (base = baseDeFixture()) => creerMagasin({
  sol: solDuTiroir(base),
  ou: { mot: MOT_DU_TIROIR, choisissable: false, choisi: false, demandee: false, possede: false }
});
const magasinDeDossier = (poignee = poigneeDeFixture()) => creerMagasin({
  sol: solDuDossier(poignee),
  ou: { mot: poignee.name, choisissable: true, choisi: true, demandee: true, possede: true }
});

/* ── LES PERSONNAGES DE SONDE ────────────────────────────────────────────
   ⭐ LA PILE EST CELLE QUE L'ÉCRAN NOMME, jamais une liste écrite ici : c'est
   `compositionFh` qui juge la version, et il lit les mêmes ids que le Menu. */
function docDe(nom, ids) {
  return {
    schema: "fh-char/1", id: `sonde-${nom}`, name: nom, lang: "en",
    units: { distance: "ft", weight: "lb" },
    created: "2026-09-10T00:00:00Z", modified: "2026-09-10T00:00:00Z",
    build: {
      layers: ids.map((id) => ({ id, version: "0.0.0", hash: "x".repeat(64) })),
      choices: [], budgets: {}, overrides: []
    }
  };
}
const PILE_SRD = [SRD_LAYER_ID, ...SRFH_LAYER_IDS];
const PILE_FH = [...PILE_SRD, ...FH_LAYER_IDS];
const texteDe = (doc) => JSON.stringify(doc);

/* ══ A — L'ENTRÉE : nom · date · version ══════════════════════════════════ */

test("A1 — 🔴 UNE ENTRÉE PORTE NOM · DATE · VERSION, et chacun est lu là où il est VRAI", async () => {
  const m = magasinDeTiroir();
  await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
  const liste = await m.lister();
  assert.equal(liste.etat, "liste");
  assert.equal(liste.entrees.length, 1);
  const e = liste.entrees[0];
  assert.equal(e.personnage, "Ilyra", "le NOM vient du document, pas du nom de fichier");
  assert.equal(e.date, "2026-09-10T14:32:00Z", "la DATE est celle du Save, pas celle de la dernière retouche");
  assert.equal(e.version, MAITRE.label, "la VERSION est lue sur le manifeste, par l'organe du Menu");
  assert.equal(typeof e.clef, "string", "et de quoi rouvrir");
});

test("A2 — ⚔️ UNE ENTRÉE SANS VERSION EST IMPOSSIBLE : les deux jeux se nomment, aucun ne se tait", () => {
  /* ⚔️ LA MUTATION QUE CE GARDE ATTRAPE : faire rendre `undefined` (ou la
     chaîne vide) à `versionDuDocument` pour l'un des deux jeux. La page
     afficherait alors une ligne « 10 sept. 14:32 · » — une sauvegarde dont on
     ne sait plus à quelles règles elle appartient, c'est-à-dire la seule chose
     qui distingue deux fichiers du même personnage. */
  assert.equal(versionDuDocument(docDe("Ilyra", PILE_FH)), MAITRE.label);
  assert.equal(versionDuDocument(docDe("Ilyra", PILE_SRD)), VERSION_SOCLE);
  for (const doc of [docDe("A", PILE_FH), docDe("A", PILE_SRD), docDe("A", []), {}, null]) {
    const mot = versionDuDocument(doc);
    assert.equal(typeof mot, "string", "⛔ une version qui n'est pas un mot");
    assert.notEqual(mot.trim(), "", "⛔ une entrée sans version : la ligne ne dirait plus à quoi elle appartient");
  }
});

test("A3 — 🔴 LA VERSION SUIT LE MANIFESTE, pas un mot posé à l'écriture", async () => {
  /* Le même personnage sauvegardé avant et après avoir éteint Fate's Hand
     donne DEUX entrées qui ne portent pas le même jeu — ⚖️ c'est exactement le
     cas du 192 (« garder une sauvegarde de la version FH »). */
  const m = magasinDeTiroir();
  await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
  await m.ecrire(texteDe(docDe("Ilyra", PILE_SRD)), "2026-09-10T14:40:00Z");
  const { entrees } = await m.lister();
  assert.deepEqual(entrees.map((e) => e.version), [VERSION_SOCLE, MAITRE.label],
    "la plus récente en tête, et chacune dit SON jeu");
});

test("A4 — ⛔ UN FICHIER QUI N'EST PAS DU MAGASIN N'EST PAS LISTÉ, et ce n'est pas un refus", () => {
  /* Le dossier du joueur est SON dossier : il y a des photos dedans. Les
     accuser en rouge remplirait la page de lignes qui n'ont jamais prétendu
     être des sauvegardes. ⛔ Mais un fichier À NOUS qu'on ne sait plus lire,
     lui, se DIT — le faire disparaître ferait croire à une perte. */
  assert.equal(dateDeLaClef("une-photo.png"), null);
  assert.equal(dateDeLaClef(`ilyra${SUFFIXE}`), null, "sans horodatage, ce n'est pas une clef du magasin");
  assert.equal(entreeDe("une-photo.png", "PNG…"), null);
  const clef = `ilyra.2026-09-10t14-32-00z${SUFFIXE}`;
  assert.equal(dateDeLaClef(clef), "2026-09-10T14:32:00Z");
  const casse = entreeDe(clef, "{ pas du json");
  assert.equal(casse.personnage, undefined);
  assert.match(casse.refus, /not JSON/, "et il RECOPIE la cause");
});

/* ══ B — ⚔️ L'ÉCRASEMENT ══════════════════════════════════════════════════ */

test("B1 — ⚖️ DEUX SAVE DU MÊME PERSONNAGE FONT DEUX ENTRÉES, la plus récente en tête", async () => {
  const m = magasinDeTiroir();
  await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
  await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T18:05:00Z");
  const liste = await m.lister();
  assert.equal(liste.entrees.length, 2, "⚔️ un magasin qui écrase n'en rendrait qu'une");
  assert.deepEqual(liste.entrees.map((e) => e.date),
    ["2026-09-10T18:05:00Z", "2026-09-10T14:32:00Z"]);
  assert.equal(liste.groupes.length, 1, "⚖️ « la page montre les versions par personnage »");
  assert.equal(liste.groupes[0].personnage, "Ilyra");
  assert.equal(liste.groupes[0].entrees.length, 2);
});

test("B2 — ⚔️ DEUX SAVE DANS LA MÊME SECONDE FONT ENCORE DEUX ENTRÉES", async () => {
  /* 🔴 C'EST LA MUTATION LA PLUS FACILE À ÉCRIRE ET LA PLUS COÛTEUSE : une clef
     bâtie sur le seul horodatage écraserait la sauvegarde qu'on vient de faire
     dès qu'on clique deux fois, et le joueur perdrait précisément la version
     qu'il voulait garder. Elle ne se voit qu'ici. */
  const m = magasinDeTiroir();
  const un = await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
  const deux = await m.ecrire(texteDe(docDe("Ilyra", PILE_SRD)), "2026-09-10T14:32:00Z");
  assert.equal(un.ok, true);
  assert.equal(deux.ok, true);
  assert.notEqual(un.entree.clef, deux.entree.clef, "⚔️ deux clefs égales = une entrée perdue");
  const liste = await m.lister();
  assert.equal(liste.entrees.length, 2);
  /* ⭐ ET L'ORDRE RESTE STABLE à date égale : une liste qui bougerait d'un
     rendu à l'autre ferait croire au joueur que ses saves se déplacent. */
  const encore = await m.lister();
  assert.deepEqual(encore.entrees.map((e) => e.clef), liste.entrees.map((e) => e.clef));
});

test("B2 bis — ⚔️ DEUX SAVE LANCÉS ENSEMBLE FONT ENCORE DEUX ENTRÉES — le défaut REGARDÉ AU NAVIGATEUR", async () => {
  /* 📏 MESURÉ LE 10/09 SUR LA v619, AVANT LA FILE : deux clics sur `Save` coup
     sur coup ont laissé **UNE SEULE** entrée dans le tiroir
     (`ilyra-duskleaf.2026-09-10t04-33-53z.fh-char.json`, seule dans IndexedDB).
     Chaque écriture lisait les clefs déjà prises AVANT que l'autre ait écrit :
     les deux calculaient la même clef, et la seconde effaçait la première.

     🔴 ET `B2` ÉTAIT VERT PENDANT CE TEMPS-LÀ — il enchaîne les Save avec
     `await`. *« Zéro conflit n'est pas zéro erreur »* : c'est le geste
     SIMULTANÉ qui casse, et il ne se mesure qu'ici. ⚔️ Retirer la file de
     `creerMagasin` → rouge sur cette ligne, verte partout ailleurs. */
  const m = magasinDeTiroir();
  const [un, deux] = await Promise.all([
    m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z"),
    m.ecrire(texteDe(docDe("Ilyra", PILE_SRD)), "2026-09-10T14:32:00Z")
  ]);
  assert.equal(un.ok, true);
  assert.equal(deux.ok, true);
  assert.notEqual(un.entree.clef, deux.entree.clef);
  const liste = await m.lister();
  assert.equal(liste.entrees.length, 2,
    "⚔️ un Save simultané qui écrase l'autre : le joueur perd la version qu'il venait de garder");
});

test("B2 ter — ⛔ UN REFUS NE TUE PAS LA FILE : le Save suivant passe quand même", async () => {
  /* Une file qui meurt sur le premier refus emporterait les gestes des autres —
     un `Save` refusé une fois, et plus rien ne se rangerait jusqu'au
     rechargement, EN SILENCE. */
  const base = baseDeFixture();
  const m = magasinDeTiroir(base);
  const refuse = await m.ecrire("{}", "2026-09-10T14:32:00Z");
  assert.equal(refuse.ok, false);
  const apres = await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:33:00Z");
  assert.equal(apres.ok, true, "la file a survécu au refus");
});

test("B3 — 🔴 CE QUI EST RANGÉ EST BYTE-IDENTIQUE À CE QU'ON A DONNÉ", async () => {
  /* La thèse du produit : *« le joueur se balade partout avec ses persos »*. Un
     magasin qui reformaterait le JSON rendrait des octets qui ne sont plus ceux
     du moteur, et le fichier cesserait d'être comparable au fichier exporté. */
  const base = baseDeFixture();
  const m = magasinDeTiroir(base);
  const texte = texteDe(docDe("Ilyra", PILE_FH));
  const issue = await m.ecrire(texte, "2026-09-10T14:32:00Z");
  const relu = await m.lire(issue.entree);
  assert.equal(relu.etat, "lu");
  assert.deepEqual(relu.document, JSON.parse(texte));
  assert.equal(base.rayons.get("sauvegardes").get(issue.entree.clef), texte, "les mêmes octets, à l'octet près");
});

test("B4 — ⛔ LE MAGASIN NE RANGE QUE DES PERSONNAGES, et il DIT pourquoi il refuse", async () => {
  const m = magasinDeTiroir();
  for (const [octets, motif] of [["", /not serialised/], ["{}", /does not say what it is/],
    [JSON.stringify({ schema: "roll20/2" }), /roll20\/2/]]) {
    const issue = await m.ecrire(octets, "2026-09-10T14:32:00Z");
    assert.equal(issue.ok, false);
    assert.match(issue.raison, motif, "⛔ jamais un refus muet");
  }
  assert.deepEqual((await m.lister()).entrees, [], "et rien n'a été rangé");
});

/* ══ C — LES DEUX SOLS RENDENT LA MÊME CHOSE ══════════════════════════════ */

test("C1 — ⚔️ LE DOSSIER ET LE TIROIR RENDENT LA MÊME LISTE, à la clef près", async () => {
  /* 🔴 C'EST LA RAISON D'ÊTRE DE LA FORME : *« jamais deux expériences pour le
     même geste »*. Deux implémentations complètes auraient divergé au premier
     champ ajouté à une entrée, et le joueur aurait vu deux pages selon son
     navigateur. Ici la logique est écrite UNE fois ; ce test le prouve en
     confrontant les deux sols sur la même séquence de Save. */
  const gestes = [
    [docDe("Ilyra", PILE_FH), "2026-09-10T14:32:00Z"],
    [docDe("Nodren", PILE_SRD), "2026-09-10T15:00:00Z"],
    [docDe("Ilyra", PILE_SRD), "2026-09-10T16:10:00Z"]
  ];
  const rendu = async (m) => {
    for (const [doc, quand] of gestes) await m.ecrire(texteDe(doc), quand);
    const liste = await m.lister();
    return liste.groupes.map((g) => [g.personnage, g.entrees.map((e) => `${e.date}|${e.version}`)]);
  };
  const parTiroir = await rendu(magasinDeTiroir());
  const parDossier = await rendu(magasinDeDossier());
  assert.deepEqual(parDossier, parTiroir, "⚔️ deux formes d'entrée se verraient ICI");
  assert.deepEqual(parTiroir, [
    ["Ilyra", ["2026-09-10T16:10:00Z|SRD", `2026-09-10T14:32:00Z|${MAITRE.label}`]],
    ["Nodren", ["2026-09-10T15:00:00Z|SRD"]]
  ], "le groupe le plus récemment sauvegardé en tête, ses versions les plus récentes d'abord");
});

test("C2 — ⛔ UN DOSSIER DONT LA PERMISSION A EXPIRÉ LE DIT — il ne retombe PAS dans le tiroir", async () => {
  /* 🔴 LA MUTATION QUE CE GARDE INTERDIT : « si le dossier ne répond plus, on
     lit le tiroir ». Les sauvegardes du joueur DISPARAÎTRAIENT de la page sans
     un mot, et il conclurait qu'il les a perdues. Le repli silencieux exact que
     la loi §0.5 interdit. */
  const m = magasinDeDossier(poigneeDeFixture("Personnages", "denied"));
  const liste = await m.lister();
  assert.equal(liste.etat, "refus");
  assert.match(liste.raison, /permission/, "et il dit quoi faire : choisir le dossier de nouveau");
  assert.match(liste.raison, /choose it again/);
  const ecrit = await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
  assert.equal(ecrit.ok, false, "⛔ et on n'écrit pas non plus ailleurs en douce");
});

test("C3 — 🔴 LA LIGNE DISCRÈTE EST UNE DONNÉE, jamais l'identité du sol", () => {
  assert.deepEqual(magasinDeTiroir().ouEstCeRange(),
    { mot: MOT_DU_TIROIR, choisissable: false, choisi: false, demandee: false, possede: false });
  const dossier = magasinDeDossier().ouEstCeRange();
  assert.equal(dossier.mot, "Personnages", "le bouton dit OÙ c'est");
  assert.equal(dossier.possede, true, "et que le joueur possède ses octets");
  /* ⭐ AUCUN VERBE « QUEL MAGASIN ES-TU ? » : la page n'aurait qu'à le lire. */
  for (const m of [magasinDeTiroir(), magasinDeDossier()]) {
    assert.deepEqual(Object.keys(m).sort(), ["ecrire", "lire", "lister", "ouEstCeRange"],
      "⛔ une seule interface, et rien qui trahisse le sol");
  }
});

/* ══ D — LA PAGE REND CE QUE `lister()` REND ══════════════════════════════ */

const listeDe = async (m) => m.lister();

test("D1 — 🗄️ LA PAGE REND CE QUE `lister()` REND, quel que soit le sol", async () => {
  for (const m of [magasinDeTiroir(), magasinDeDossier()]) {
    await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
    await m.ecrire(texteDe(docDe("Ilyra", PILE_SRD)), "2026-09-10T16:10:00Z");
    const node = renderMagasinEcran({ magasin: await listeDe(m), ou: m.ouEstCeRange() }, () => {});
    const groupes = node.querySelectorAll(".magasin-groupe");
    assert.equal(groupes.length, 1, "un personnage, un groupe");
    assert.equal(node.querySelectorAll(".magasin-nom")[0].textContent, "Ilyra");
    const lignes = node.querySelectorAll(".magasin-ouvrir");
    assert.equal(lignes.length, 2, "deux Save, deux lignes — ⛔ rien n'est écrasé");
    assert.deepEqual(node.querySelectorAll(".magasin-version").map((s) => s.textContent),
      [VERSION_SOCLE, MAITRE.label], "chaque ligne DIT sa version");
    assert.deepEqual(node.querySelectorAll(".magasin-date").map((s) => s.textContent),
      [motDeLaDate("2026-09-10T16:10:00Z"), motDeLaDate("2026-09-10T14:32:00Z")]);
    assert.match(node.querySelectorAll(".magasin-date")[0].textContent, /Sep 10 · 16:10/,
      "⚖️ le mot d'Eric : « Ilyra — 10 sept. 14:32 »");
  }
});

test("D2 — 🔌 OUVRIR UNE ENTRÉE ÉMET UN VERBE avec sa clef — l'écran ne touche jamais le magasin", async () => {
  const m = magasinDeTiroir();
  const issue = await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
  const gestes = [];
  const node = renderMagasinEcran({ magasin: await listeDe(m), ou: m.ouEstCeRange() }, (a) => gestes.push(a));
  node.querySelectorAll(".magasin-ouvrir")[0].dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirUneEntree", clef: issue.entree.clef }]);
});

test("D3 — ⚠️ « JE CHERCHE ENCORE » ET « IL N'Y A RIEN » NE SE DISENT PAS PAREIL", () => {
  /* Les confondre ferait croire au joueur, le temps d'un dossier lent, qu'il a
     tout perdu. Et un refus de listage ne se tait jamais. */
  const ou = magasinDeTiroir().ouEstCeRange();
  const chargement = renderMagasinEcran({ magasin: { etat: "chargement" }, ou }, () => {});
  assert.equal(chargement.querySelectorAll(".magasin-attente").length, 1);
  assert.equal(chargement.querySelectorAll(".magasin-vide").length, 0);

  const vide = renderMagasinEcran({ magasin: { etat: "liste", groupes: [], entrees: [] }, ou }, () => {});
  assert.equal(vide.querySelectorAll(".magasin-vide").length, 1);
  assert.match(vide.querySelectorAll(".magasin-vide")[0].textContent, /clearing site data/,
    "dans le tiroir, il DIT ce qui les emporterait");

  const refus = renderMagasinEcran({ magasin: { etat: "refus", raison: "no permission" }, ou }, () => {});
  const mot = refus.querySelectorAll(".magasin-refus")[0];
  assert.ok(mot, "un refus de listage se DIT");
  assert.match(mot.textContent, /no permission/, "et il RECOPIE la cause");
  assert.equal(refus.querySelectorAll(".magasin-lieu").length, 1,
    "⛔ et `Save location` reste lisible PRÉCISÉMENT quand la liste a échoué : c'est là qu'il sert");
});

test("D4 — ⛔ UNE ENTRÉE ILLISIBLE RESTE VISIBLE et n'est PAS cliquable", async () => {
  const base = baseDeFixture();
  const m = magasinDeTiroir(base);
  await m.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T14:32:00Z");
  base.rayons.get("sauvegardes").set(`nodren.2026-09-09t10-00-00z${SUFFIXE}`, "{ tronqué");
  const node = renderMagasinEcran({ magasin: await listeDe(m), ou: m.ouEstCeRange() }, () => {});
  const casse = node.querySelectorAll('.magasin-entree[data-refus="true"]');
  assert.equal(casse.length, 1, "la faire disparaître ferait croire à une perte");
  assert.equal(casse[0].querySelectorAll("button").length, 0, "⛔ un bouton qui ouvre sur une erreur est un bouton mort");
  assert.match(node.querySelectorAll(".magasin-groupe")[1].textContent, /Unreadable saves/,
    "elle ne se range pas sous un nom qu'on ne connaît pas");
});

test("P4 — 📂 `Open a file…` VIT DANS LA PAGE — la loi du 06/09 n'a pas bougé", () => {
  /* ⚖️ *« chacun est propriétaire de ses données […] je choisis où je range mes
     persos »*. `Open` sur `R` ouvre désormais cette page ; un joueur qui reçoit
     un `.fh-char.json` d'ailleurs doit toujours pouvoir l'ouvrir, et c'est ICI
     que la boîte du système est restée. ⚔️ La retirer → rouge. */
  const gestes = [];
  const node = renderMagasinEcran(
    { magasin: { etat: "liste", groupes: [], entrees: [] }, ou: magasinDeTiroir().ouEstCeRange() },
    (a) => gestes.push(a));
  const b = node.querySelectorAll(".magasin-fichier")[0];
  assert.ok(b, "la boîte de fichiers a une porte, et elle est dans la page");
  b.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirUnFichier" }],
    "elle émet un verbe : c'est la coquille qui touche le disque, jamais l'écran");
});

/* ══ E — LA DESTINATION ═══════════════════════════════════════════════════ */

test("E1 — ⚔️ LE TIROIR : PAS DE POPUP DE DESTINATION, et la ligne dit « in this browser »", async () => {
  /* ⚖️ *« popup la première fois que je vais dans ce menu »* — mais ⛔ **là où
     il y a une destination à choisir**. Un popup posé sur un iPad, qui ne sait
     pas ouvrir de dossier, serait une question sans réponse possible.
     🔴 LE GARDE MESURE LA DONNÉE, PAS LA FORME : c'est `choisissable` qui décide,
     et il vient de ce que la FENÊTRE sait faire. */
  const m = await ouvrirLeMagasin({ base: baseDeFixture(), dossierPossible: false });
  const ou = m.ouEstCeRange();
  assert.equal(ou.choisissable, false, "⚔️ le seul champ qui autorise le popup");
  assert.equal(ou.mot, MOT_DU_TIROIR, "⚖️ le mot d'Eric, mot pour mot");
  assert.equal(ou.possede, false, "…et Save reste AUSSI un téléchargement");

  const node = renderMagasinEcran({ magasin: await listeDe(m), ou }, () => {});
  const lieu = node.querySelectorAll(".magasin-lieu")[0];
  assert.ok(lieu, "⛔ le bouton reste PRÉSENT — un réglage impossible ne se cache pas");
  assert.equal(lieu.disabled, true);
  assert.equal(lieu.dataset.choisissable, "false");
  assert.match(lieu.textContent, /Save location — in this browser/);
  assert.match(lieu.getAttribute("title"), /cannot pick a folder/, "et il dit POURQUOI il dort");
});

test("E2 — 🔴 LE DOSSIER POSSIBLE : la question se pose UNE fois, et décliner est une RÉPONSE", async () => {
  const base = baseDeFixture();
  const neuf = (await ouvrirLeMagasin({ base, dossierPossible: true })).ouEstCeRange();
  assert.equal(neuf.choisissable, true);
  assert.equal(neuf.choisi, false);
  assert.equal(neuf.demandee, false, "la première visite : la question n'a pas encore été posée");

  await garderDansLeTiroir({ base });
  const apres = (await ouvrirLeMagasin({ base, dossierPossible: true })).ouEstCeRange();
  assert.equal(apres.demandee, true,
    "⚔️ sans ça, « la première fois » se répéterait à chaque visite — décliner ne serait plus une réponse");
  assert.equal(apres.mot, MOT_DU_TIROIR, "…et les saves restent dans le tiroir, ce que le bouton DIT");
  assert.equal(apres.choisissable, true, "⛔ mais le bouton reste vivant : il pourra encore choisir");
});

test("E3 — 🚪 LE POPUP A DEUX VOIES PAIRES, et il ne signale rien", () => {
  /* ⛔ PAS `confirm.mjs` : sa paire peint un bouton en `--critical` parce
     qu'elle protège une DESTRUCTION (la mesure du lot 193). Ici les deux voies
     sont paires — ni l'une ni l'autre ne défait quoi que ce soit. */
  const repondu = [];
  const popup = popupDeLaDestination((dossier) => repondu.push(dossier));
  assert.equal(popup.role, "guide", "celui qui « ne signale rien » (§7)");
  assert.equal(popup.actions.length, 2, "⛔ décliner est une voie, pas une croix");
  assert.deepEqual(popup.actions.map((a) => a.mot), ["Keep them here", "Choose a folder"]);
  for (const voie of popup.actions) voie.faire();
  assert.deepEqual(repondu, [false, true], "les DEUX répondent à la question");
  assert.match(popup.texte, /Save location/, "et il dit où le réglage vit ensuite");
  /* ⚖️ LE LEXIQUE DU 10/09 : ⛔ ni « couche », ni « homebrew » dans un mot de joueur. */
  assert.doesNotMatch(popup.texte, /\b(layer|layers|couche|couches|homebrew)\b/i);
});

/* ══ F — LES DEUX ÉCRIVAINS EXISTANTS PASSENT PAR `ecrire` ════════════════ */

const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));

test("F1 — ⚔️ UN SEUL CHEMIN D'ÉCRITURE : `exporterJson` est le SEUL à nommer `magasin.ecrire`", () => {
  /* ⚖️ Le mandat : *« les deux écrivains existants doivent entrer dans le
     magasin sans second chemin »*. ⚔️ LA MUTATION ÉPROUVÉE : appeler
     `telecharger` avec un `fh-char.json` ailleurs que dans `exporterJson` — le
     fichier partirait sur le disque SANS entrée dans le magasin, et la page
     d'Eric ne le montrerait jamais. */
  assert.equal((shell.match(/state\.magasin\.ecrire\(/g) || []).length, 1,
    "un seul appelant de l'écriture du magasin");
  const organe = shell.match(/async function exporterJson\([\s\S]{0,1600}?\n\}\n/);
  assert.ok(organe);
  assert.match(organe[0], /state\.magasin\.ecrire\(contenu, platformNow\(\)\)/);
  /* ⭐ ON MESURE LA FORME D'EMPLOI, PAS LE MOT : `telecharger` sert AUSSI à
     `Export HTML` et `Expert view`, qui ne sont pas des personnages. Ce qui est
     interdit, c'est un `fh-char.json` qui sort sans passer par le magasin. */
  const sorties = [...shell.matchAll(/nomDeFichier\(state\.document, "fh-char\.json"/g)];
  assert.equal(sorties.length, 1, "⛔ un second fichier de personnage écrit ailleurs");
  assert.ok(organe[0].includes('nomDeFichier(state.document, "fh-char.json"'),
    "…et le seul est DANS l'organe qui range l'entrée");
});

test("F2 — 🔌 LES DEUX ÉCRIVAINS DU 192 ET DU 193 APPELLENT `exporterJson`, pas un double", () => {
  assert.match(shell, /sauvegarderPuisEteindre\(\{\s*sauvegarder: \(\) => exporterJson\(\{ version: NOM_DE_LA_VERSION_FH \}\)/,
    "la copie de la version FH (192)");
  assert.match(shell, /sauvegarder: \(\) => exporterJson\(\{ quoi: "Build a character" \}\)/,
    "le fichier automatique de `Build a character` (193)");
  assert.match(shell, /action\.kind === "exportJson"\) \{ void exporterJson\(\); return; \}/,
    "et le bouton `Save` lui-même");
});

test("F3 — ⚔️ UN ESPION SUR L'ORGANE : les deux séquences pures rangent DEUX entrées, et un refus n'efface rien", async () => {
  /* ⭐ UN ESPION, PAS UN DOUBLE : le `sauvegarder` qu'on donne aux deux
     séquences est le VRAI `ecrire` d'un vrai magasin — c'est ce que la coquille
     câble, à la fixture du sol près. Un faux `sauvegarder` aurait prouvé que la
     séquence appelle quelque chose, pas qu'une entrée existe. */
  const m = magasinDeTiroir();
  const journal = [];
  const sauvegarder = async (doc, quand) => {
    const issue = await m.ecrire(texteDe(doc), quand);
    journal.push(issue.ok ? "range" : "refus");
    return issue.ok;
  };

  /* 192 — la version FH : Save d'abord, l'extinction ensuite. */
  let eteint = false;
  assert.equal(await sauvegarderPuisEteindre({
    sauvegarder: () => sauvegarder(docDe("Ilyra", PILE_FH), "2026-09-10T14:32:00Z"),
    eteindre: () => { eteint = true; }
  }), true);
  assert.equal(eteint, true);

  /* 193 — `Build a character` : Save d'abord, reset ensuite. */
  let reset = 0;
  assert.equal(await creerUnPersonnage({
    personnage: true,
    sauvegarder: () => sauvegarder(docDe("Ilyra", PILE_SRD), "2026-09-10T18:05:00Z"),
    repartirAZero: () => { reset += 1; },
    demanderLeJeu: () => {}
  }), true);
  assert.equal(reset, 1);

  const liste = await m.lister();
  assert.equal(liste.entrees.length, 2, "⚔️ deux gestes, deux entrées — aucun n'a écrasé l'autre");
  assert.deepEqual(liste.entrees.map((e) => e.version), [VERSION_SOCLE, MAITRE.label]);
  assert.deepEqual(journal, ["range", "range"]);

  /* ⚔️ ET UN MAGASIN QUI REFUSE N'EFFACE RIEN — la règle du 192, mot pour mot,
     désormais mesurée SUR LE MAGASIN et plus sur un téléchargement. */
  const refuse = creerMagasin({
    sol: { clefs: async () => { throw new Error("QuotaExceededError"); }, lire: async () => null, ecrire: async () => {} },
    ou: { mot: MOT_DU_TIROIR, choisissable: false, choisi: false, demandee: true, possede: false }
  });
  let touche = 0;
  assert.equal(await creerUnPersonnage({
    personnage: true,
    sauvegarder: async () => (await refuse.ecrire(texteDe(docDe("Ilyra", PILE_FH)), "2026-09-10T19:00:00Z")).ok,
    repartirAZero: () => { touche += 1; },
    demanderLeJeu: () => { touche += 1; }
  }), false);
  assert.equal(touche, 0, "⛔ entrée non rangée = pas de reset");
});

/* ══ G — LE MENU N'EN SAIT RIEN ═══════════════════════════════════════════ */

test("G1 — ⛔ L'ÉCRAN NE REÇOIT JAMAIS L'ORGANE — il reçoit des faits", () => {
  /* 🔴 C'est ce qui rend « une seule page pour les deux magasins » vrai par
     construction plutôt que par discipline : la page ne PEUT pas se brancher
     sur le sol, elle ne l'a pas. ⚔️ Passer `state.magasin` dans le `ctx` →
     rouge ici. */
  const ctx = shell.slice(shell.indexOf('step.id === "universe" && state.engine'),
    shell.indexOf("} else if (step.id === \"universe\" && state.engineError)"));
  assert.match(ctx, /magasin: state\.magasinListe/, "ce que `lister()` a rendu");
  assert.match(ctx, /ou: state\.magasinOu/, "et la ligne discrète");
  assert.equal(/magasin: state\.magasin\b(?!Liste)/.test(ctx), false,
    "⛔ l'organe lui-même n'entre pas dans un écran");
});

test("G2 — 🔴 LE POPUP DE DESTINATION EST POSÉ PAR LA COQUILLE, sur la DONNÉE, et une seule fois", () => {
  const porte = shell.slice(shell.indexOf('action.kind === "ouvrirLeMagasin"'),
    shell.indexOf('action.kind === "ouvrirUneEntree"'));
  assert.match(porte, /if \(ou && ou\.choisissable && !ou\.choisi && !ou\.demandee\)/,
    "⛔ trois conditions, et aucune ne demande « quel magasin ai-je ? »");
  assert.match(porte, /state\.popup = popupDeLaDestination\(/,
    "⛔ jamais le `confirm\\(\\)` du navigateur : la description d'état que `paintPopup` sait peindre");
  assert.match(porte, /void rafraichirLeMagasin\(\);/,
    "⭐ la liste se redemande à chaque ouverture : un autre onglet a pu écrire");
});

test("G3 — 🗄️ LE MAGASIN MONTE SANS LE MOTEUR, et sa panne ne tue pas le builder", () => {
  assert.match(shell, /\(async \(\) => \{ await monterLeMagasinEtLister\(\); \}\)\(\);/,
    "il n'attend ni la pile ni le schéma : ranger des octets ne demande pas de savoir dériver");
  const monte = shell.match(/async function monterLeMagasinEtLister\(\) \{[\s\S]*?\n\}/);
  assert.ok(monte);
  assert.match(monte[0], /catch \(cause\) \{[\s\S]*?state\.magasinListe = \{ etat: "refus", raison: cause\.message \};/,
    "⛔ une panne du magasin se DIT dans la page, elle ne casse pas le builder");
});

/* ══ H — CE QUI EST PUREMENT UNE FONCTION ═════════════════════════════════ */

test("H1 — 🔴 LE MOT D'UNE DATE NE LIT AUCUNE HORLOGE, et il ne dépend d'aucun fuseau", () => {
  /* `new Date(iso).toLocaleString()` rendrait deux mots pour la même sauvegarde
     selon le lecteur — et un test qui ne pourrait rien affirmer. */
  assert.equal(motDeLaDate("2026-09-10T14:32:00Z"), "Sep 10 · 14:32");
  assert.equal(motDeLaDate("2026-01-01T00:00:00Z"), "Jan 1 · 00:00");
  assert.equal(motDeLaDate("pas une date"), "pas une date", "⛔ jamais une date inventée");
  const source = stripComments(fs.readFileSync(path.join(UI, "magasin-ecran.mjs"), "utf8"));
  assert.equal(/new Date\(/.test(source), false, "⛔ pas de seconde horloge dans un écran");
});

test("H2 — 🔴 LA CLEF EST UN NOM DE FICHIER LÉGAL, et elle retient l'heure exacte", () => {
  const clef = clefDeLEntree(docDe("Ilyra Duskleaf", PILE_FH), "2026-09-10T14:32:00Z");
  assert.equal(clef, `ilyra-duskleaf.2026-09-10t14-32-00z${SUFFIXE}`);
  assert.equal(clef.includes(":"), false, "⛔ le Finder affiche un `:` en `/`");
  assert.equal(dateDeLaClef(clef), "2026-09-10T14:32:00Z", "l'aller-retour est exact");
  assert.equal(clefDeLEntree({ name: "   " }, "2026-09-10T14:32:00Z"),
    `character.2026-09-10t14-32-00z${SUFFIXE}`, "un nom vide ne fabrique pas une clef vide");
  const prises = new Set([clef]);
  const seconde = clefDeLEntree(docDe("Ilyra Duskleaf", PILE_FH), "2026-09-10T14:32:00Z", prises);
  assert.notEqual(seconde, clef);
  assert.equal(dateDeLaClef(seconde), "2026-09-10T14:32:00Z", "…et la seconde porte la MÊME heure");
});

test("H3 — ⚔️ LE GROUPE DES ILLISIBLES NE PEUT PAS ÊTRE CONFONDU AVEC UN NOM", () => {
  /* Une clef fabriquée (« refus:… ») serait un NOM, donc quelque chose qu'un
     personnage pourrait porter — et un joueur facétieux mêlerait ses saves aux
     entrées cassées. Une liste à part ne peut pas entrer en collision. */
  const groupes = parPersonnage([
    { clef: "a", date: "2026-09-10T10:00:00Z", personnage: "refus:a", version: "SRD" },
    { clef: "b", date: "2026-09-10T11:00:00Z", refus: "broken" }
  ]);
  assert.equal(groupes.length, 2);
  assert.deepEqual(groupes.map((g) => g.personnage), [null, "refus:a"],
    "l'illisible est le plus récent ici, et il n'a PAS de nom");
});
