/* ══ LES TROIS PORTES DE REVIEW — LOT 67 (B9.4, B9.5) ═════════════════════

   CE QUE CE LOT PEUT CASSER, ET QUE RIEN D'AUTRE NE VERRAIT :

     A. 🔴 UN IMPORT `node:` DANS LE CHEMIN DU NAVIGATEUR. C'est le piège de
        ce lot précis : `src/doc/serialize.mjs` importe `node:crypto`, donc
        l'importer depuis `ui/` rendrait la page BLANCHE — et aucune suite ne
        bronche, puisque `node`, lui, résout `node:crypto` très bien. C'est
        la même famille que la virgule du lot 66 : un défaut qui ne vit QUE
        dans le navigateur. Le garde marche donc le graphe d'imports en
        entier, depuis `ui/`.
     B. UN EXPORT JSON QUI N'EST PAS LE FICHIER DU MOTEUR. Il doit être
        byte-identique à `toBytes` — c'est la thèse du produit (« le joueur
        se balade partout avec ses persos »). Depuis le lot 67 c'est la MÊME
        fonction ; ce test l'exige quand même, parce que la prochaine
        personne qui « optimisera » l'un des deux le saura.
     C. UNE PAGE EXPORTÉE VIDE. `injecte` remplace un marqueur ; si la
        coquille change de marqueur, le silence serait une page sans fiche.
     D. UN BOUTON QUI NE FAIT RIEN. `ouvrirOnglet` doit DIRE quand le
        navigateur refuse — « pas de faux magasin », deux fois dans le
        mandat. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();

const { canonicalText } = await import("../src/doc/canonical.mjs");
const { toBytes } = await import("../src/doc/serialize.mjs");
const { injecte, MARQUEUR, render } = await import("../src/tools/render-fiche.mjs");
const { nomDeFichier } = await import("../ui/builder/review-step.mjs");
const { ouvrirOnglet, telecharger, REVOKE_MS } = await import("../ui/builder/fichier.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ══ A. LE GRAPHE D'IMPORTS DU NAVIGATEUR ════════════════════════════════
   Il part de chaque module de `ui/` et suit les imports RELATIFS, dans `ui/`
   comme dans `src/`. Deux choses le font rougir :
     · un spécificateur `node:…` — le navigateur ne le résout pas ;
     · un spécificateur NU (`ajv`, `lodash`) — il n'y a pas de bundler, et
       le dépôt n'a aucune dépendance d'exécution (loi §0.1).
   Rendre la liste plutôt qu'asserter sur place : la même fonction sert au
   garde et à son attaque. */
export function importsInterdits(entrees, root) {
  const vus = new Set();
  const fautes = [];
  const file = (p) => fs.readFileSync(p, "utf8");
  const marcher = (fichier, chaine) => {
    if (vus.has(fichier)) return;
    vus.add(fichier);
    const texte = file(fichier);
    /* ⚠️ Les `import` STATIQUES seulement, et c'est suffisant ici : un
       `import()` dynamique n'est évalué que s'il est atteint, donc il ne
       peut pas blanchir la page au chargement. Le jour où `ui/` en écrit
       un, ce garde devra grandir — c'est écrit ici plutôt que découvert. */
    for (const m of texte.matchAll(/^\s*import\s+(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/gm)) {
      const spec = m[1];
      if (spec.startsWith("node:")) { fautes.push({ chaine: [...chaine, fichier], spec }); continue; }
      if (!spec.startsWith(".")) { fautes.push({ chaine: [...chaine, fichier], spec }); continue; }
      /* Lot 75 : les imports relatifs de `ui/` portent `?v=<N>` — la query
         perce le cache HTTP (GitHub Pages, max-age=600 PAR fichier), elle
         n'existe pas sur le disque. On la retire pour trouver le fichier ;
         la cohérence des versions a son propre garde, `versions-graphe`. */
      marcher(path.resolve(path.dirname(fichier), spec.split("?")[0]), [...chaine, fichier]);
    }
  };
  for (const e of entrees) marcher(e, []);
  return fautes.map((f) => `${path.relative(root, f.chaine[f.chaine.length - 1])} importe « ${f.spec} »` +
    (f.chaine.length > 1 ? ` (via ${f.chaine.slice(0, -1).map((c) => path.relative(root, c)).join(" → ")})` : ""));
}

test("A — 🔴 AUCUN import `node:` NI NU dans tout ce que le navigateur charge", () => {
  /* La page charge `shell.mjs` (voir `ui/builder/index.html`) ; tout le
     reste vient par ses imports. On part quand même de TOUS les modules de
     `ui/builder/` : un fichier que shell n'importe plus mais qui traîne
     doit rester chargeable, sinon on le découvre le jour où on le rebranche. */
  const entrees = fs.readdirSync(path.join(ROOT, "ui", "builder"))
    .filter((f) => f.endsWith(".mjs")).map((f) => path.join(ROOT, "ui", "builder", f));
  assert.deepEqual(importsInterdits(entrees, ROOT), [],
    "un import que le navigateur ne sait pas résoudre rend la page BLANCHE, et node ne le voit pas");
});

test("⚔️ ATTAQUE A — le garde voit `node:crypto` réintroduit, même DEUX niveaux plus bas", () => {
  const bac = fs.mkdtempSync(path.join(ROOT, ".attaque-67-"));
  try {
    /* Le cas exact que ce lot a évité : `ui/` importe un module de `src/`
       parfaitement innocent, qui lui-même tire `serialize.mjs`. */
    fs.writeFileSync(path.join(bac, "ecran.mjs"), 'import { x } from "./milieu.mjs";\n');
    fs.writeFileSync(path.join(bac, "milieu.mjs"), 'import { createHash } from "node:crypto";\nexport const x = 1;\n');
    const fautes = importsInterdits([path.join(bac, "ecran.mjs")], ROOT);
    assert.equal(fautes.length, 1);
    assert.match(fautes[0], /milieu\.mjs importe « node:crypto ».*via.*ecran\.mjs/);
  } finally {
    fs.rmSync(bac, { recursive: true, force: true });
  }
});

test("⚔️ ATTAQUE A bis — un paquet npm dans `ui/` est refusé aussi (zéro dépendance d'exécution)", () => {
  const bac = fs.mkdtempSync(path.join(ROOT, ".attaque-67b-"));
  try {
    fs.writeFileSync(path.join(bac, "ecran.mjs"), 'import Ajv from "ajv";\n');
    assert.deepEqual(importsInterdits([path.join(bac, "ecran.mjs")], ROOT).length, 1);
  } finally {
    fs.rmSync(bac, { recursive: true, force: true });
  }
});

/* ══ B. L'EXPORT JSON EST LE FICHIER DU MOTEUR ═══════════════════════════ */

test("B — `canonicalText` rend EXACTEMENT les octets de `toBytes`, sur un vrai personnage", () => {
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "examples/personnage-srd-fr-niveau1.fh-char.json"), "utf8"));
  assert.equal(canonicalText(doc), toBytes(doc).toString("utf8"));
  /* La forme, nommée : deux espaces d'indentation, un saut de ligne final.
     C'est celle des fichiers du dépôt — vérifiée contre le fichier lui-même
     plutôt que contre une constante recopiée. */
  assert.equal(canonicalText(doc).endsWith("\n"), true);
  assert.equal(canonicalText({ a: { b: 1 } }), '{\n  "a": {\n    "b": 1\n  }\n}\n');
});

test("B bis — un document insérialisable est REFUSÉ, pas exporté à moitié", () => {
  const cycle = { name: "boucle" };
  cycle.moi = cycle;
  assert.throws(() => canonicalText(cycle), /sérialisation impossible/);
  assert.throws(() => canonicalText(undefined), /ne produit aucun JSON/);
});

/* ══ LE NOM DU FICHIER ═══════════════════════════════════════════════════ */

test("Le nom du fichier vient du personnage, et il survit à tout ce qu'on peut taper dedans", () => {
  assert.equal(nomDeFichier({ name: "Ilyra Duskleaf" }, "fh-char.json"), "ilyra-duskleaf.fh-char.json");
  assert.equal(nomDeFichier({ name: "K'aal — l'Ardent  " }, "fiche.html"), "k-aal-l-ardent.fiche.html");
  /* ⛔ Un personnage SANS nom s'exporte quand même : c'est un brouillon
     valide (schéma dérivé, lot 47), et refuser l'export ferait de lui une
     récompense. */
  assert.equal(nomDeFichier({}, "fh-char.json"), "character.fh-char.json");
  assert.equal(nomDeFichier({ name: "☠☠☠" }, "fh-char.json"), "character.fh-char.json");
});

/* ══ C. LA PAGE EXPORTÉE ═════════════════════════════════════════════════ */

test("C — `injecte` met la fiche DANS la coquille, et la vraie coquille porte encore le marqueur", () => {
  const coquille = fs.readFileSync(path.join(ROOT, "src/tools/fiche.shell.html"), "utf8");
  assert.equal(coquille.includes(MARQUEUR), true, "la coquille a perdu son marqueur : toute page exportée serait vide");
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "examples/personnage-srd-fr-niveau1.fh-char.json"), "utf8"));
  const page = injecte(coquille, render(doc));
  assert.equal(page.includes(MARQUEUR), false);
  assert.equal(page.includes('<article class="fiche">'), true);
  assert.equal(page.startsWith("<!doctype html>"), true, "la page exportée doit être autonome — c'est un fichier qu'on ouvre seul");
});

test("⚔️ ATTAQUE C — une coquille sans marqueur JETTE, elle ne rend pas une page muette", () => {
  assert.throws(() => injecte("<html>rien à voir</html>", "<article/>"), /ne porte plus le marqueur/);
});

/* ══ D. LES DEUX SORTIES ═════════════════════════════════════════════════ */

function envFactice({ ouvertureRefusee = false } = {}) {
  const journal = { blobs: [], urls: [], revoquees: [], ouverts: [], minuteries: [] };
  let n = 0;
  return {
    journal,
    Blob: class { constructor(parts, options) { journal.blobs.push({ parts, options }); } },
    URL: {
      createObjectURL(blob) { journal.urls.push(blob); return `blob:faux/${n++}`; },
      revokeObjectURL(url) { journal.revoquees.push(url); }
    },
    setTimeout(fn, ms) { journal.minuteries.push({ fn, ms }); return journal.minuteries.length; },
    open(url) { journal.ouverts.push(url); return ouvertureRefusee ? null : { url }; },
    document: createTestDocument()
  };
}

test("D — télécharger : le bon nom, le bon type MIME, et le clic part", () => {
  const env = envFactice();
  const nom = telecharger({ nom: "ilyra.fh-char.json", type: "application/json", contenu: "{}\n" }, env);
  assert.equal(nom, "ilyra.fh-char.json");
  assert.deepEqual(env.journal.blobs[0].options, { type: "application/json" });
  assert.deepEqual(env.journal.blobs[0].parts, ["{}\n"]);
  assert.equal(env.journal.urls.length, 1);
});

test("D bis — l'URL est révoquée PLUS TARD, jamais dans le même tour", () => {
  const env = envFactice();
  telecharger({ nom: "x.json", type: "application/json", contenu: "{}" }, env);
  /* 🔴 Le défaut que ce test empêche : révoquer sur-le-champ annule le
     téléchargement qu'on vient de déclencher — le navigateur n'a pas encore
     lu les octets, et le joueur reçoit un fichier vide ou rien du tout. */
  assert.deepEqual(env.journal.revoquees, [], "révoquée trop tôt : le téléchargement serait vide");
  assert.equal(env.journal.minuteries[0].ms, REVOKE_MS);
  env.journal.minuteries[0].fn();
  assert.equal(env.journal.revoquees.length, 1);
});

test("D ter — ouvrir un onglet rend `false` quand le navigateur refuse, pour que l'écran puisse le DIRE", () => {
  assert.equal(ouvrirOnglet({ type: "text/html", contenu: "<p/>" }, envFactice()), true);
  assert.equal(ouvrirOnglet({ type: "text/html", contenu: "<p/>" }, envFactice({ ouvertureRefusee: true })), false);
});

/* ══ L'ÉCRAN LUI-MÊME ════════════════════════════════════════════════════ */

test("Les trois portes sont là, EN BAS, et dans la MÊME dalle (B9.3)", async () => {
  const { renderReviewStep } = await import("../ui/builder/review-step.mjs");
  const gestes = [];
  const section = renderReviewStep({ document: { name: "Ilyra" }, decisions: [] }, (a) => gestes.push(a.kind));
  const dalles = section.querySelectorAll(".dalle-majeure");
  assert.equal(dalles.length, 1, "B9.3 — une dalle majeure UNIQUE, pas plusieurs");
  const portes = dalles[0].querySelectorAll(".review-porte");
  assert.deepEqual([...portes].map((p) => p.textContent), ["Expert view", "Export JSON", "Export HTML"]);
  for (const p of portes) p.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, ["expertView", "exportJson", "exportHtml"]);
});

test("⛔ AUCUN bouton `sheet` — B9.5 le demande, il n'existe pas, un bouton mort serait un faux magasin", async () => {
  const { renderReviewStep } = await import("../ui/builder/review-step.mjs");
  const section = renderReviewStep({ document: { name: "Ilyra" }, decisions: [] }, () => {});
  /* ⚠️ Ce test ne défend pas l'ABSENCE pour elle-même : il défend le fait
     qu'on ne publie pas une porte vers une pièce qui n'est pas construite.
     Le jour où la fiche v2 existe, ce test change — et c'est là qu'on veut
     être obligé de le relire. */
  const mots = [...section.querySelectorAll(".review-porte")].map((p) => p.textContent.toLowerCase());
  assert.equal(mots.some((m) => m.includes("sheet")), false);
});

/* ══ LA LUMIÈRE VERTE DU BELT — Eric, 2026-08-19 ══════════════════════════
   *« lorsqu'un chapitre de création est complet une lumière verte s'allume
   dans le numéro associé dans le belt »*.

   ⛔ CE QUE CES TESTS EXISTENT POUR EMPÊCHER, et c'était l'état du dépôt : le
   vert vivait sur `data-status="done"`, qui veut dire « tu es PASSÉ devant ».
   Un chapitre traversé sans rien y poser s'allumait. Le juge est maintenant
   `etapeFaite`, celui de Review — un seul, pour que les deux affichages ne
   puissent pas se contredire. */

test("le juge dit FINI, jamais VU — une étape sans aucun fait n'est pas verte", async () => {
  const { etapeFaite } = await import("../ui/builder/review-step.mjs");
  /* PRIVATION DÉLIBÉRÉE : un carnet vide et aucun document. Rien n'a été
     posé, donc rien n'est fini — quelle que soit l'étape où l'on se trouve.
     C'est exactement le cas que `data-status="done"` déclarait vert. */
  const rien = { decisions: [], document: null, resolved: null };
  for (const etape of ["species", "class", "abilities", "concept", "destiny", "universe"]) {
    assert.equal(etapeFaite(rien, etape), false, `${etape} : rien de posé, donc rien de fini`);
  }
});

test("une étape inconnue n'est pas verte, elle est FAUSSE — jamais une erreur à l'écran", async () => {
  const { etapeFaite } = await import("../ui/builder/review-step.mjs");
  assert.equal(etapeFaite({ decisions: [] }, "chapitre-qui-nexiste-pas"), false);
  assert.equal(etapeFaite({ decisions: [] }, undefined), false);
});

test("SPECIES n'est finie que quand le LIGNAGE l'est aussi", async () => {
  const { etapeFaite, REVIEW_GROUPS } = await import("../ui/builder/review-step.mjs");
  /* ⭐ LE CHEMIN DOIT ÊTRE DANS LA TABLE. `species.lineage` est né le
     2026-08-19 ; son absence ici faisait compter un Dragonborn sans ancêtre
     comme FINI — au récapitulatif comme dans la lumière, qui lit la même
     table. On épingle le chemin, on ne compte pas les chemins. */
  const species = REVIEW_GROUPS.find((g) => g.step === "species");
  assert.ok(species.paths.includes("species.lineage"),
    "le lignage appartient à Species : sans lui, la lumière ment");

  const plan = (path, answered, expected) => ({ path, status: "answered", answered, expected });
  const espece = plan("species", 1, 1);

  assert.equal(etapeFaite({ decisions: [espece, plan("species.lineage", 0, 1)] }, "species"), false,
    "espèce posée, lignage vide : la lumière reste éteinte");
  assert.equal(etapeFaite({ decisions: [espece, plan("species.lineage", 1, 1)] }, "species"), true,
    "les deux posés : elle s'allume");
});

test("un plan VERROUILLÉ n'allume rien, même s'il est répondu", async () => {
  const { etapeFaite } = await import("../ui/builder/review-step.mjs");
  /* Un lignage d'une autre espèce est « répondu » au sens du compte, et
     REFUSÉ au sens du carnet. Le vert dirait alors qu'un chapitre fautif est
     fini — c'est le pire des deux mensonges possibles. */
  const decisions = [
    { path: "species", status: "answered", answered: 1, expected: 1 },
    { path: "species.lineage", status: "locked", answered: 1, expected: 1 }
  ];
  assert.equal(etapeFaite({ decisions }, "species"), false);
});
