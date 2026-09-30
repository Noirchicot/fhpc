/* ══ LOT 388 — IMPORT A BOOK : UN LIVRE VIT DANS LE STOCKAGE DU JOUEUR, ET SEULEMENT LÀ ═══════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 388 import a book.md` (ARCHI 35, 30/09).
   ⚖️ Eric, 29/09 : *« La poubelle d'un livre efface son contenu de son lieu de stockage. Ce lieu de stockage est
   décidé par le bouton vault. »* ; 30/09 : le PHB *« sur son compte uniquement »*.

   🔴 CE QUE CE FICHIER GARDE — sur une FIXTURE de livre et un FAUX Dropbox, ⛔ jamais le PHB :
     J. LE JUGE — un livre valide passe ; un fichier invalide est refusé avec la raison du juge, et rien n'est rangé.
     R. RANGER — dans le lieu choisi (l'appareil, ou Dropbox `books/<id>.layer.json`), octet pour octet.
     M. MONTER — depuis le lieu, ÉTEINT ; un livre que le lieu porte ne se lit JAMAIS dans les fichiers du site ;
        un lieu qui refuse ne laisse pas les fichiers du site prendre sa place.
     P. LA POUBELLE — efface du lieu ; allumée seulement pour un livre que le lieu porte.
     C. LA COQUILLE — le sélecteur, les octets, le lieu du geste, le redémarrage. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { fauxDropbox } from "./faux-dropbox.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));

const { validerUnLivre, creerLibrairie, librairieAppareil, livresDuLieu, LIEUX } = await import("../ui/builder/magasin.mjs");
const { librairieDropbox, gardienDesJetons, preparerLaConnexion, retirerLeRetour, terminerLaConnexion, DOSSIER_LIVRES } = await import("../ui/builder/dropbox.mjs");
const { renderLayersEcran, MOTS_DE_LAYERS } = await import("../ui/builder/layers-ecran.mjs");

/* ── LES FIXTURES ─────────────────────────────────────────────────────────────────────────────────── */

/** UN LIVRE DE FIXTURE — la forme `fh-layer/1` minimale que le juge accepte, un id que l'app connaît, et un
 *  caractère hors ASCII dans son nom : ses octets doivent voyager tels quels. ⛔ Jamais le PHB. */
function livre({ id = "xphb-en", nom = "Fixture Handbook — é", version = "0.0.1-fixture" } = {}) {
  return new TextEncoder().encode(JSON.stringify({
    schema: "fh-layer/1", id, version, name: nom, lang: "en", flags: [],
    attribution: { license: "fixture — not a real book" }, records: {}
  }, null, 2));
}
const sha = (o) => createHash("sha256").update(o).digest("hex");
function baseDeFixture() {
  const rayons = new Map();
  const rayon = (nom) => { if (!rayons.has(nom)) rayons.set(nom, new Map()); return rayons.get(nom); };
  return {
    rayons,
    lire: async (nom, clef) => (rayons.has(nom) && rayons.get(nom).has(clef) ? rayons.get(nom).get(clef) : null),
    ecrire: async (nom, clef, valeur) => { rayon(nom).set(clef, valeur); },
    effacer: async (nom, clef) => { rayon(nom).delete(clef); },
    tout: async (nom) => [...rayon(nom).entries()].map(([clef, valeur]) => ({ clef, valeur })),
    echanger: async (nom, clef, decider) => { const s = decider(rayon(nom).has(clef) ? rayon(nom).get(clef) : null); if (s !== undefined) rayon(nom).set(clef, s); }
  };
}
async function dropboxConnecte(faux) {
  const base = baseDeFixture();
  const adresse = await preparerLaConnexion({ crypto: webcrypto, base, location: { origin: "https://noirchicot.github.io", pathname: "/fhpc/ui/builder/index.html" } });
  const retour = retirerLeRetour(new URL(faux.autoriser(adresse)), { state: null, replaceState() {} });
  assert.equal((await terminerLaConnexion({ retour, base, http: faux.http, maintenant: () => 1 })).etat, "connecte");
  return creerLibrairie(librairieDropbox({ http: faux.http, jetons: gardienDesJetons({ base, http: faux.http, maintenant: () => 1 }) }));
}

/** LE MOTEUR DE LA PAGE, sous Node — les couches du disque ; les fichiers de LIVRES « du site » sont servis par
 *  la fixture `site`, et chaque demande de livre est COMPTÉE. */
async function moteur({ livresDuLieu, site = {} }) {
  const vraiFetch = globalThis.fetch;
  const demandes = [];
  globalThis.fetch = async (url) => {
    const chemin = String(url).split("?")[0];
    const livreDuSite = /\/layers-livres\/([^/]+)\.layer\.json$/.exec(chemin);
    if (livreDuSite) {
      demandes.push(livreDuSite[1]);
      const o = site[livreDuSite[1]];
      if (!o) return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
      return { ok: true, status: 200, arrayBuffer: async () => o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength) };
    }
    if (!fs.existsSync(chemin)) return { ok: false, status: 404, json: async () => null, arrayBuffer: async () => new ArrayBuffer(0) };
    const o = fs.readFileSync(chemin);
    return { ok: true, status: 200, arrayBuffer: async () => o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength), json: async () => JSON.parse(o.toString("utf8")) };
  };
  try {
    const { bootEngine } = await import("../ui/builder/engine.mjs");
    const engine = await bootEngine({ root: ROOT, livresDuLieu });
    return { engine, demandes, pile: engine.layers.verbs.stack() };
  } finally {
    globalThis.fetch = vraiFetch;
  }
}

/* ══ J — LE JUGE ═════════════════════════════════════════════════════════════════════════════════════ */

test("J1 — ⚖️ LE JUGE D'UN LIVRE EST CELUI QUI LE MONTE : forme `fh-layer/1` et un id que l'app connaît — un refus porte SA raison", () => {
  const ok = validerUnLivre(livre());
  assert.equal(ok.etat, "valide");
  assert.equal(ok.id, "xphb-en");
  assert.equal(ok.nom, "Fixture Handbook — é");
  const refus = (octets) => validerUnLivre(octets);
  assert.equal(refus(new Uint8Array(0)).etat, "refus", "un fichier vide");
  assert.equal(refus(new TextEncoder().encode("{ pas du json")).etat, "refus", "du texte qui n'est pas du JSON");
  const pasUneCouche = refus(new TextEncoder().encode(JSON.stringify({ schema: "fh-char/1", id: "kara" })));
  assert.equal(pasUneCouche.etat, "refus");
  assert.match(pasUneCouche.raison, /fh-layer\/1|clef inconnue/, "⭐ la raison est celle du juge (`readLayer`), jamais une prose inventée");
  /* 🔄 LOT 390 — un id que l'app ne connaît pas n'est plus refusé d'office : c'est un CATALOG DE CRÉATEUR, et
     son juge est `verifierUnCatalog` — qui dit chaque faute avec son chemin (ici, la fixture n'a ni auteur ni
     record). La loi « un refus porte la raison du juge » tient : la raison EST sa première faute. */
  const inconnu = refus(livre({ id: "homebrew-en" }));
  assert.equal(inconnu.etat, "refus");
  assert.ok(Array.isArray(inconnu.fautes) && inconnu.fautes.length >= 2, "chaque faute, pas la première seulement");
  assert.deepEqual(inconnu.fautes.map((f) => f.chemin), ["attribution.author", "records"]);
  assert.match(inconnu.raison, /^attribution\.author — Missing\. .* \(and 1 more fault\)$/);
});

test("J2 — ⛔ UN FICHIER REFUSÉ N'EST RANGÉ NULLE PART — ni sur l'appareil, ni dans Dropbox", async () => {
  const base = baseDeFixture();
  const ici = creerLibrairie(librairieAppareil(base));
  assert.equal((await ici.ranger(livre({ id: "homebrew-en" }))).ok, false);
  assert.equal((await ici.ranger(new TextEncoder().encode("nope"))).ok, false);
  assert.equal(base.rayons.size, 0, "rien n'a touché la base");
  const faux = fauxDropbox();
  const loin = await dropboxConnecte(faux);
  const avant = faux.requetes.length;
  assert.equal((await loin.ranger(livre({ id: "homebrew-en" }))).ok, false);
  assert.equal(faux.requetes.length, avant, "⛔ aucune requête : le juge passe AVANT le lieu");
});

/* ══ R — RANGER ══════════════════════════════════════════════════════════════════════════════════════ */

test("R1 — 📚 UN LIVRE VALIDE SE RANGE DANS LE LIEU CHOISI, OCTET POUR OCTET — l'appareil, puis Dropbox `books/<id>.layer.json`", async () => {
  const octets = livre();
  /* l'appareil (le fichier : aucun lieu en ligne) */
  const base = baseDeFixture();
  const ici = creerLibrairie(librairieAppareil(base));
  assert.deepEqual(await ici.ranger(octets), { ok: true, id: "xphb-en", nom: "Fixture Handbook — é" });
  assert.equal(sha(base.rayons.get("livres").get("xphb-en")), sha(octets), "⭐ les mêmes octets : la même empreinte");
  assert.deepEqual(await ici.lister(), { etat: "liste", ids: ["xphb-en"] });
  assert.equal(sha((await ici.lire("xphb-en")).octets), sha(octets));
  /* Dropbox */
  const faux = fauxDropbox();
  const loin = await dropboxConnecte(faux);
  assert.equal((await loin.ranger(octets)).ok, true);
  const f = faux.fichiers.get(`${DOSSIER_LIVRES}/xphb-en.layer.json`);
  assert.ok(f, "rangé sous `books/<id>.layer.json`");
  assert.equal(sha(f.octets), sha(octets), "⭐ octet pour octet — jamais un texte ré-encodé");
  const envoi = faux.requetes.filter((r) => r.url.endsWith("/files/upload")).map((r) => JSON.parse(r.headers["Dropbox-API-Arg"])).pop();
  assert.deepEqual(envoi, { path: "/books/xphb-en.layer.json", mode: "overwrite", autorename: false, mute: true },
    "un livre du même id se REMPLACE : le joueur vient de choisir ce fichier-là");
  assert.deepEqual(await loin.lister(), { etat: "liste", ids: ["xphb-en"] });
  assert.equal(sha((await loin.lire("xphb-en")).octets), sha(octets));
  /* 🔄 LOT 390 — un fichier du lieu que l'app ne connaît pas SE LISTE (un catalog de créateur a un id que
     l'app ne connaît pas d'avance) ; c'est le JUGE du montage qui le refuse, et le refus se DIT. */
  faux.ecrireDirectement("/books/notes.layer.json", "{}");
  assert.deepEqual(await loin.lister(), { etat: "liste", ids: ["notes", "xphb-en"] });
  const auMontage = await livresDuLieu(loin);
  assert.deepEqual(auMontage.livres.map((l) => l.id), ["xphb-en"], "⛔ `notes` ne se monte pas");
  assert.deepEqual(auMontage.illisibles.map((l) => l.id), ["notes"], "⭐ il se dit");
});

/* ══ M — MONTER ══════════════════════════════════════════════════════════════════════════════════════ */

test("M1 — 🔌 LE LIVRE SE MONTE DEPUIS LE LIEU, ÉTEINT — et ⛔ son fichier du site n'est même pas demandé (un seul écrivain)", async () => {
  const duLieu = livre({ nom: "Fixture Handbook — é" });
  const duSite = livre({ nom: "Site Handbook", version: "9.9.9-site" });
  const dmgDuSite = livre({ id: "xdmg-en", nom: "Site DMG" });
  const { engine, demandes, pile } = await moteur({
    site: { "xphb-en": duSite, "xdmg-en": dmgDuSite },
    livresDuLieu: async () => ({ etat: "liste", livres: [{ id: "xphb-en", octets: duLieu }], illisibles: [] })
  });
  const phb = pile.find((c) => c.id === "xphb-en");
  assert.ok(phb, "le livre du lieu est monté");
  assert.equal(phb.name, "Fixture Handbook — é", "⭐ c'est celui du LIEU");
  assert.equal(phb.hash, sha(duLieu), "…aux octets du lieu");
  assert.equal(phb.enabled, false, "⭐ ÉTEINT : c'est le document du perso qui dit ce qui est allumé");
  assert.deepEqual(demandes, ["xdmg-en"], "⛔ le fichier du site pour `xphb-en` n'est même pas demandé ; le DMG, que le lieu n'a pas, l'est");
  assert.equal(pile.find((c) => c.id === "xdmg-en").name, "Site DMG", "les fichiers servis comblent ce que le lieu n'a pas");
  assert.deepEqual(engine.lieuDesLivres, { etat: "liste", ids: ["xphb-en"] });
});

test("M2 — ⛔ UN LIEU QUI REFUSE NE LAISSE PAS LES FICHIERS DU SITE PRENDRE SA PLACE — et son refus remonte", async () => {
  const { engine, demandes, pile } = await moteur({
    site: { "xphb-en": livre({ nom: "Site Handbook" }) },
    livresDuLieu: async () => ({ etat: "refus", raison: "Dropbox could not be reached — are you offline?", lieu: "your Dropbox" })
  });
  assert.deepEqual(demandes, [], "⛔ aucun repli silencieux vers le site");
  assert.equal(pile.some((c) => c.id === "xphb-en" || c.id === "xdmg-en"), false, "aucun livre monté");
  assert.deepEqual(engine.lieuDesLivres, { etat: "refus", raison: "Dropbox could not be reached — are you offline?", lieu: "your Dropbox" });
  /* un livre illisible DANS le lieu se dit (livresRefuses), sans qu'un fichier du site le remplace */
  const illisible = await moteur({
    site: { "xphb-en": livre({ nom: "Site Handbook" }) },
    livresDuLieu: async () => ({ etat: "liste", livres: [], illisibles: [{ id: "xphb-en", raison: "Dropbox could not give this book back" }] })
  });
  assert.deepEqual(illisible.engine.livresRefuses, [{ id: "xphb-en", raison: "Dropbox could not give this book back" }]);
  assert.deepEqual(illisible.demandes, ["xdmg-en"]);
});

test("M3 — 🔄 SUR UN AUTRE APPAREIL RELIÉ À LA MÊME DROPBOX, LE LIVRE EST LÀ AUSSI", async () => {
  const faux = fauxDropbox();
  const ipad = await dropboxConnecte(faux);
  const mac = await dropboxConnecte(faux);
  const octets = livre();
  assert.equal((await ipad.ranger(octets)).ok, true);
  const vuDuMac = await livresDuLieu(mac);
  assert.equal(vuDuMac.etat, "liste");
  assert.deepEqual(vuDuMac.livres.map((l) => [l.id, sha(l.octets)]), [["xphb-en", sha(octets)]]);
  const { pile } = await moteur({ livresDuLieu: () => livresDuLieu(mac) });
  assert.equal(pile.find((c) => c.id === "xphb-en").hash, sha(octets));
});

/* ══ P — LA POUBELLE ═════════════════════════════════════════════════════════════════════════════════ */

test("P1 — 🗑️ LA POUBELLE EFFACE LE LIVRE DE SON LIEU — l'appareil comme Dropbox", async () => {
  const base = baseDeFixture();
  const ici = creerLibrairie(librairieAppareil(base));
  await ici.ranger(livre());
  assert.deepEqual(await ici.effacer("xphb-en"), { ok: true });
  assert.deepEqual(await ici.lister(), { etat: "liste", ids: [] });
  assert.deepEqual(await ici.lire("xphb-en"), { etat: "absent" });
  const faux = fauxDropbox();
  const loin = await dropboxConnecte(faux);
  await loin.ranger(livre());
  assert.deepEqual(await loin.effacer("xphb-en"), { ok: true });
  assert.equal(faux.lire("/books/xphb-en.layer.json"), null, "⭐ parti de Dropbox");
  /* 🔄 LOT 390 — la poubelle efface aussi un catalog de créateur (tout livre du lieu) ; ⛔ jamais un chemin
     qui sortirait de `books/`. */
  assert.deepEqual((await loin.effacer("../characters/kara")).ok, false, "⛔ jamais hors de `books/`");
  faux.revoquer();
  assert.equal((await loin.effacer("xphb-en")).ok, false, "un lieu qui refuse : dit, rien n'est prétendu effacé");
});

test("P2 — 🔘 LAYERS : la poubelle ALLUMÉE seulement pour un livre que le lieu porte ; `Import a book` vit ; un lieu qui refuse se DIT", () => {
  const doc = { schema: "fh-char/1", id: "k", name: "Kara", build: { layers: [{ id: "srd-5.2.1-en" }], choices: [], budgets: {}, overrides: [] } };
  const pile = [{ id: "srd-5.2.1-en", enabled: true }, { id: "xphb-en", name: "Fixture Handbook — é", enabled: false }, { id: "xdmg-en", name: "Site DMG", enabled: false }];
  const gestes = [];
  const n = renderLayersEcran({ document: doc, pile, lieuDesLivres: { etat: "liste", ids: ["xphb-en"] } }, (a) => gestes.push(a));
  const poubelleDe = (id) => n.querySelectorAll(`[data-ligne-livre="${id}"] .poubelle`)[0];
  assert.equal(poubelleDe("xphb-en").disabled, false, "⭐ le livre vit dans le lieu : sa poubelle s'allume");
  assert.equal(n.querySelectorAll(`[data-ligne-livre="xphb-en"] .tdc-bientot`).length, 0, "…sans « soon »");
  assert.equal(poubelleDe("xdmg-en").disabled, true, "⛔ un livre servi par le site : effacer un fichier servi n'est pas le geste dicté");
  poubelleDe("xphb-en").click();
  assert.deepEqual(gestes, [{ kind: "demanderEffacerUnLivre", id: "xphb-en" }], "elle DEMANDE d'abord");
  const importer = n.querySelectorAll("[data-importer]")[0];
  assert.equal(importer.disabled, false);
  assert.equal(importer.textContent, MOTS_DE_LAYERS.importer);
  importer.click();
  assert.deepEqual(gestes[1], { kind: "importerUnLivre" });
  const hors = renderLayersEcran({ document: doc, pile: [pile[0]], lieuDesLivres: { etat: "refus", raison: "Dropbox could not be reached — are you offline?", lieu: "your Dropbox" } }, () => {});
  assert.equal(hors.querySelectorAll(".layers-lieu-refuse")[0].textContent,
    "Your books could not be read from your Dropbox: Dropbox could not be reached — are you offline?.");
});

/* ══ C — LA COQUILLE ═════════════════════════════════════════════════════════════════════════════════ */

test("C1 — 🔌 LA COQUILLE : une librairie par lieu câblé, le lieu du GESTE, des octets, le juge avant le lieu, puis le redémarrage", () => {
  const table = shell.match(/const LIBRAIRIES_DES_LIEUX = \{([\s\S]*?)\n\};/)[1];
  assert.deepEqual([...table.matchAll(/^  ([a-z-]+): /gm)].map((m) => m[1]).sort(), LIEUX.filter((l) => l.cable).map((l) => l.id).sort(),
    "⛔ un lieu câblé sans librairie ferait planter l'import ; une librairie sans lieu est du code mort");
  const importer = shell.slice(shell.indexOf('action.kind === "importerUnLivre"'), shell.indexOf('if (action.kind === "confirmLayerStack")'));
  assert.match(importer, /octets = new Uint8Array\(await fichier\.arrayBuffer\(\)\);/, "⭐ des OCTETS, jamais `text()` : l'empreinte est celle des octets");
  assert.match(importer, /const librairie = await librairieChoisie\(state\.stockage\.base\);\s*const issue = await librairie\.ranger\(octets\);/);
  /* 🔄 LOT 390 — le texte vit dans `texteDuRefusDImport` (layers-ecran.mjs) : un livre connu y garde « This book
     was not imported: <raison du juge> », un catalog y dit ses fautes (`tests/catalog-390.test.mjs`). */
  assert.match(importer, /texte: texteDuRefusDImport\(issue\)/, "un refus se dit, avec la raison du juge");
  assert.match(importer, /await redemarrerSurLesLivres\(\);/);
  assert.equal(/fichier\.text\(\)/.test(importer), false);
  const effacer = shell.slice(shell.indexOf('if (action.kind === "effacerUnLivre")'), shell.indexOf('if (action.kind === "importerUnLivre")'));
  assert.match(effacer, /if \(action\.voie !== "delete" \|\| !state\.stockage\) \{ refresh\(\); return; \}/, "`Cancel` ne fait que repeindre");
  assert.match(effacer, /const issue = await librairie\.effacer\(id\);\s*if \(!issue\.ok\) \{ porteEnPanne\("Delete", issue\.raison\); return; \}\s*await redemarrerSurLesLivres\(\);/);
  assert.match(shell, /bootEngine\(\{ livresDuLieu: livresPourLeMoteur \}\)/);
  assert.match(shell, /try \{ await monterLeStockage\(\); \} catch \(cause\) \{\s*signalerStockagePret\(null\);/, "⛔ jamais un démarrage suspendu à un stockage en panne");
  const redemarrer = shell.match(/async function redemarrerSurLesLivres\(\) \{[\s\S]*?\n\}/)[0];
  assert.ok(redemarrer.indexOf("await envoyerMaintenant();") > 0 && redemarrer.indexOf("await envoyerMaintenant();") < redemarrer.indexOf("reload()"),
    "la sauvegarde en attente part AVANT de redémarrer");
});

test("C2 — ⛔ LE SITE N'EN PORTE JAMAIS UNE LIGNE : aucun écrivain vers `layers-livres/`, et le lieu décide", () => {
  for (const f of fs.readdirSync(UI).filter((n) => n.endsWith(".mjs"))) {
    const src = stripComments(fs.readFileSync(path.join(UI, f), "utf8"));
    for (const m of src.matchAll(/layers-livres/g)) {
      const ligne = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
      assert.match(ligne, /fetch\(/, `${f} : \`layers-livres\` n'est que LU (fetch), jamais écrit — « ${ligne.trim()} »`);
    }
  }
});
