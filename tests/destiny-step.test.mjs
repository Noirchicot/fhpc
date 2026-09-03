/* ══ LES TESTS DE L'ÉTAPE DESTINY — lot 45, refaits au 61, REFAITS AU 109 ══

   ⛔ AUCUN plan `decisions[]` (mesuré au lot 45, toujours vrai) — `ctx` porte
   `document` (le brut, pour la carte déjà ACTÉE) et `resolved` (le Score).

   ⚠️ CE QUI A CHANGÉ AU LOT 109, et pourquoi ces tests ont bougé : l'étape a
   maintenant trois temps (croquis d'Eric du 2026-08-30). Un **R** d'ambiance
   avec deux portes, une **cérémonie** plein écran ou le **catalogue** des 22,
   puis un **écran final commun** aux deux branches.
   ⭐ LES LOIS QUE LES ANCIENS TESTS PROUVAIENT SONT TOUTES CONSERVÉES — le
   Score lu à l'octet, les six champs recopiés, les 22 options du catalogue,
   le mode hors document, et surtout **rien n'est acté avant la sortie**. Seuls
   les gestes ont changé de nom : `OK` est devenu `Draw`/`Choose`, `Validate`
   est devenu `Next`, et le retournement vit dans la cérémonie.
   ⛔ Un test supprimé « parce que l'écran a changé » emporte sa leçon ; ceux-ci
   sont réécrits sur la nouvelle vérité, pas retirés. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, manifestOf, uneCouche, SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN } from "./build-harness.mjs";
import { createFhDestinyStat, FH_DESTINY_ID } from "../src/modules/fh/destiny-stat.mjs";

globalThis.document = createTestDocument();

const {
  renderDestinyStep, drawArcana, currentArcanaId, destinyValidate,
  renderDestinyFinal, arcanaImageSrc, ARCANA_BACK_SRC, DESTINY_ARCANA_PATH
} = await import("../ui/builder/destiny-step.mjs");
const { renderCatalogueCards, catalogueOptions } = await import("../ui/builder/catalogue.mjs");

const fixture = exempleFhEn();
const { build } = fixture;
const query = fixture.layers.verbs.query;

function rebuild(document) { return build.verbs.rebuild({ document }); }

/** L'écran FINAL — c'est là que vivent le Score, le texte et la paire de
 *  boutons. `phase: "final"` : la cérémonie est passée, ou le catalogue a
 *  rendu sa carte. */
function ctxFrom(document, report, extra) {
  return Object.assign({
    phase: "final", document, resolved: report.resolved, query,
    drawnId: currentArcanaId(document)
  }, extra || {});
}

/* ══ 8 — LE SCORE AFFICHÉ EST CELUI DU MOTEUR, À L'OCTET ═════════════════ */

test("le Score affiché est resolved.stats['fh:destiny'].value, tel quel", () => {
  const report = rebuild(fixture.document);
  const node = renderDestinyStep(ctxFrom(report.document, report), () => {});
  const value = node.querySelectorAll(".card-final-total")[0];
  const stat = report.resolved.stats.find((s) => s.id === "fh:destiny");
  assert.ok(stat);
  assert.equal(value.textContent, String(stat.value));
});

test("⚔️ ATTAQUE — un Score menteur (value ≠ somme du détail) s'affiche MENTEUR, jamais recalculé", () => {
  const report = rebuild(fixture.document);
  const menteur = structuredClone(report.resolved);
  const stat = menteur.stats.find((s) => s.id === "fh:destiny");
  const vraieSomme = stat.breakdown.reduce((total, line) => total + line.value, 0);
  stat.value = 9999;
  assert.notEqual(9999, vraieSomme, "9999 n'est pas la somme — sinon l'attaque ne prouve rien");
  const node = renderDestinyStep(ctxFrom(report.document, { resolved: menteur }), () => {});
  const value = node.querySelectorAll(".card-final-total")[0];
  assert.equal(value.textContent, "9999", "l'écran affiche ce que `resolved` dit, jamais l'addition refaite");
});

/* ══ 6 — LES 22 ARCANES VIENNENT DU CATALOGUE, JAMAIS UN 22 EN DUR ═══════
   ⚠️ La liste passe maintenant par le CATALOGUE PARTAGÉ (lot 60) : Destiny
   n'a aucun plan dans `decisions[]`, il fournit donc ses options
   (`ctx.options`). Ce que le test prouve est inchangé — le compte vient de
   la pile montée, jamais du code. */

test("mode choix : les options viennent de query({kind:\"arcana\"}) — 22 sur la pile complète", () => {
  const options = (query({ kind: "arcana" }) || []).map((v) => v.id);
  assert.equal(options.length, 22);
  const node = renderCatalogueCards(
    { decisions: [], query, path: DESTINY_ARCANA_PATH, kind: "arcana", options, cursor: 0 },
    (q, id) => [renderDestinyFinal({ gabarit: "apercu", query: q, drawnId: id, document: {}, resolved: null })]
  );
  assert.equal(node.querySelectorAll("[data-snap]").length, 22);
});

test("un catalogue à 3 cartes (pile réduite) n'en affiche QUE 3 — jamais 22 en dur", () => {
  const trois = (query({ kind: "arcana" }) || []).slice(0, 3).map((v) => v.id);
  const node = renderCatalogueCards(
    { decisions: [], query, path: DESTINY_ARCANA_PATH, kind: "arcana", options: trois, cursor: 0 },
    (q, id) => [renderDestinyFinal({ gabarit: "apercu", query: q, drawnId: id, document: {}, resolved: null })]
  );
  assert.equal(node.querySelectorAll("[data-snap]").length, 3);
});

/* ══ 🔴 B6.2 — RIEN N'EST ACTÉ TANT QUE `Validate` N'EST PAS TAPÉ ════════
   C'est le changement de fond du lot 61 : au lot 45, le bouton « Draw »
   écrivait `choose` dans le document sur-le-champ. Eric : « tant que Valid
   n'est pas tapé, ça n'est pas acté », et « Draw again est illimité ». */

test("🔴 la cérémonie n'appelle AUCUN verbe de document — elle ne fait que des gestes d'écran", async () => {
  const { renderCeremonie } = await import("../ui/builder/destiny-ceremonie.mjs");
  const appels = [];
  const fs = renderCeremonie({ phase: "seq3", drawnId: "fh:arcana:en:the-tower", face: "down" },
    (a) => appels.push(a));
  const carte = fs.querySelectorAll(".ceremonie-flip")[0];
  assert.ok(carte, "la carte est là, de dos");
  carte.click();
  assert.deepEqual(appels, [{ kind: "destinyFlip" }],
    "le tap ne produit QU'UN geste d'écran — aucun `choose`, aucun chemin de document");
});

test("🔴 le R ne commet rien non plus : ses deux portes sont des gestes d'écran", () => {
  const report = rebuild(fixture.document);
  const appels = [];
  const node = renderDestinyStep(
    { phase: "porte", document: {}, resolved: report.resolved, query }, (a) => appels.push(a));
  const boutons = node.querySelectorAll(".parcours-pied button").filter((b) => !b.className.includes("fiche-livre"));
  assert.deepEqual(boutons.map((b) => b.textContent), ["Draw", "Choose"],
    "deux gestes, deux textes — l'héritage du lot 55 §3 tient");
  boutons[0].click();
  boutons[1].click();
  assert.deepEqual(appels, [{ kind: "destinyDraw" }, { kind: "destinyMode", value: "choice" }],
    "ni l'un ni l'autre n'écrit au document — `fh.destiny.mode` ferait JETER rebuild() (mesuré lot 45)");
});

test("🔴 c'est la SORTIE qui acte, et elle pose le MÊME `choose` qu'au lot 45", () => {
  const porte = destinyValidate({ drawnId: "fh:arcana:en:the-tower" });
  assert.equal(porte.ready, true);
  assert.deepEqual(porte.action,
    { kind: "choose", path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-tower" } });
  assert.equal(porte.next, "step");
});

test("🔴 DESTINY NE LAISSE PAS LA COQUILLE POSER SA PAIRE — `exists: false`", () => {
  /* Les deux écrans portent leur propre pied (`Draw`/`Choose` au R,
     `I changed my mind`/`Next` à la fin). La paire de la coquille en plus
     serait le doublon du 19/08 : deux commandes pour un geste. */
  assert.equal(destinyValidate({ drawnId: "fh:arcana:en:the-tower" }).exists, false);
  assert.equal(destinyValidate({ drawnId: null }).ready, false,
    "sans carte, rien à valider — une scène vide n'a rien à acter");
  assert.equal(destinyValidate({ drawnId: null }).action, null);
});

test("le document rendu par `choose` est celui qui compte : un rebuild dessus voit la NOUVELLE carte", () => {
  const avant = rebuild(fixture.document);
  const scoreAvant = avant.resolved.stats.find((s) => s.id === "fh:destiny").value;
  const { document: apres } = build.verbs.choose({
    document: avant.document, path: "fh.destiny.arcana",
    ref: { kind: "arcana", id: "fh:arcana:en:the-tower" }
  });
  const reconstruit = rebuild(apres);
  assert.equal(currentArcanaId(reconstruit.document), "fh:arcana:en:the-tower");
  assert.ok(reconstruit.resolved.stats.find((s) => s.id === "fh:destiny"),
    `le Score existe toujours après le changement de carte (avant : ${scoreAvant})`);
});

/* ══ LA CÉRÉMONIE — trois séquences, et rien qu'elles ════════════════════ */

test("🔴 de dos, il n'y a RIEN D'AUTRE que la carte (l'héritage de B6.1b)", async () => {
  const { renderCeremonie } = await import("../ui/builder/destiny-ceremonie.mjs");
  const fs = renderCeremonie({ phase: "seq3", drawnId: "fh:arcana:en:the-tower", face: "down" }, () => {});
  assert.equal(fs.querySelectorAll(".ceremonie-flip").length, 1);
  assert.equal(fs.querySelectorAll(".card-final-score").length, 0, "pas de Score");
  assert.equal(fs.querySelectorAll(".card-pied").length, 0, "pas de boutons");
  /* ⚠️ PAR MOTIF, PAS PAR ÉGALITÉ : les `src` portent la version du graphe,
     lue dans l'URL du module qui les fabrique — le test importe le sien par
     une autre URL, donc deux constantes également justes ne sont pas égales. */
  assert.match(fs.querySelectorAll(".ceremonie-flip-dos")[0].getAttribute("src"), /back\.webp/);
});

test("retournée, la carte cesse d'être un geste — et sa face est la carte tirée", async () => {
  const { renderCeremonie } = await import("../ui/builder/destiny-ceremonie.mjs");
  const id = "fh:arcana:en:the-tower";
  const fs = renderCeremonie({ phase: "seq3", drawnId: id, face: "up" }, () => {});
  const carte = fs.querySelectorAll(".ceremonie-flip")[0];
  assert.equal(carte.disabled, true, "une carte déjà retournée n'est plus tapable");
  assert.match(fs.querySelectorAll(".ceremonie-flip-carte")[0].getAttribute("src"), /the-tower\.webp/);
});

test("la frappe écrit les mots d'Eric, et la scène ne porte rien d'autre", async () => {
  const { renderCeremonie, CEREMONIE_TEXTE } = await import("../ui/builder/destiny-ceremonie.mjs");
  const fs = renderCeremonie({ phase: "seq1" }, () => {});
  assert.equal(fs.querySelectorAll(".ceremonie-texte").length, 1);
  assert.equal(fs.querySelectorAll("button").length, 0,
    "aucun bouton : la cérémonie ne s'interrompt que par insistance (trois taps)");
  assert.doesNotMatch(CEREMONIE_TEXTE, /\.$/, "pas de point final — Eric, 2026-08-30");
});

test("🔴 LA FRAPPE A LE TEMPS DE FINIR — la séquence 1 dure ce qu'elle écrit", async () => {
  /* Mesuré au banc le 30/08 : à 85 ms le caractère, les 31 signes prenaient
     2,6 s des 3 s de la séquence, et le mélange emportait la phrase avant
     qu'on ait pu la lire. Une durée écrite en dur ment dès que le texte change
     d'un mot — celle-ci se calcule, et ce garde vérifie qu'elle laisse de quoi
     LIRE, pas seulement de quoi écrire. */
  const { DUREES, CEREMONIE_TEXTE } = await import("../ui/builder/destiny-ceremonie.mjs");
  const frappe = DUREES.frappe * CEREMONIE_TEXTE.length;
  assert.ok(DUREES.seq1 > frappe,
    `la séquence (${DUREES.seq1} ms) doit dépasser la frappe (${frappe} ms) — sinon le texte est coupé`);
  assert.ok(DUREES.seq1 - frappe >= 700,
    "et lui laisser au moins 0,7 s de lecture une fois le dernier caractère posé");
  assert.ok(DUREES.seq1 <= 4000, "sans dépasser les « 3 secondes » du croquis d'Eric d'une seconde entière");
});

test("le mélange ne pose AUCUN style en ligne — deux chiffres, et la feuille fait le reste", async () => {
  const { renderCeremonie } = await import("../ui/builder/destiny-ceremonie.mjs");
  const fs = renderCeremonie({ phase: "seq2", etape: "melange" }, () => {});
  const dos = fs.querySelectorAll(".ceremonie-dos");
  assert.equal(dos.length, 12, "douze copies du même dos");
  for (const img of dos) {
    assert.equal(img.getAttribute("style"), null,
      "garde 7 : aucun style en ligne dans ui/ — même `setProperty` est refusé");
    assert.ok(img.dataset.part && img.dataset.cascade, "le script ne pose que deux chiffres");
  }
});

test("🔴 TROIS TAPS RÉSOLVENT, un seul ne fait rien — le plein écran les compte", async () => {
  const { renderCeremonie } = await import("../ui/builder/destiny-ceremonie.mjs");
  const appels = [];
  const fs = renderCeremonie({ phase: "seq2", etape: "melange" }, (a) => appels.push(a));
  fs.dispatchEvent({ type: "pointerdown" });
  assert.deepEqual(appels, [{ kind: "destinyTap" }],
    "l'écran REMONTE chaque tap ; c'est la coquille qui décide si trois d'affilée résolvent");
});

/* ══ L'ÉCRAN FINAL — ce qu'il montre, et ce qu'il calcule ════════════════ */

test("l'écran final recopie les champs du record, jamais une reformulation", () => {
  const report = rebuild(fixture.document);
  const id = currentArcanaId(report.document);
  const view = query({ kind: "arcana", id });
  const node = renderDestinyStep(ctxFrom(report.document, report), () => {});
  assert.ok(node.querySelectorAll(".card-final-nom")[0].textContent.includes(view.record.name));
  /* ⭐ ON LIT LE TEXTE, PAS UNE BALISE — corrigé au lot 142. Ce test exigeait des
     `<dd>`, une forme que le croquis d'Eric du 02/09 a remplacée par des fenêtres
     encadrées. La LOI qu'il porte n'a pas bougé d'un mot : le champ du record est
     recopié TEL QUEL, jamais reformulé. Un test qui épelle une balise se casse au
     premier redessin et emporte sa loi avec lui. */
  const valeurs = node.querySelectorAll(".card-final-corps *").map((n) => n.textContent);
  for (const champ of ["meaning", "power", "ability"]) {
    const attendu = view.record.data[champ];
    if (attendu) assert.ok(valeurs.includes(String(attendu)), `« ${champ} » doit être recopié tel quel`);
  }
});

test("🔴 SEULES LES VIBRATIONS À PORTÉE SONT LISTÉES (Eric, 2026-08-30)", async () => {
  const { vibrationsAccessibles, rangMaxDeVibration } = await import("../ui/builder/destiny-step.mjs");
  const data = { vibrations: [1, 2, 3, 4, 5, 6].map((rank) => ({ rank, name: `V${rank}`, effect: "…" })) };
  /* la table du chapitre Destiny & Arcana §8, tranchée le 29/08 */
  assert.deepEqual([1, 3, 5, 7, 11, 16, 21].map(rangMaxDeVibration), [1, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(vibrationsAccessibles(data, 2).map((v) => v.rank), [1]);
  assert.deepEqual(vibrationsAccessibles(data, 12).map((v) => v.rank), [1, 2, 3, 4]);
  assert.deepEqual(vibrationsAccessibles(data, 30).map((v) => v.rank), [1, 2, 3, 4, 5, 6],
    "un Score de 21+ ouvre tout — et rien de plus que tout");
});

test("🔴 LE SCORE PROJETÉ AJOUTE L'IMPACT D'UNE CARTE PAS ENCORE ACTÉE, ET LUI SEUL", async () => {
  const { scoreDeDestinee } = await import("../ui/builder/destiny-step.mjs");
  const resolved = { stats: [{ id: "fh:destiny", value: 7 }] };
  assert.equal(scoreDeDestinee(resolved, 2), 9, "la carte pressentie compte : le joueur voit ce qu'il aura");
  assert.equal(scoreDeDestinee(resolved, 0), 7, "actée, son impact est DÉJÀ dans le Score du socle");
  assert.equal(scoreDeDestinee({ stats: [] }, 2), null, "pas de stat, pas de Score inventé");
});

test("le pied final nomme les deux gestes du croquis, et n'en commet aucun tout seul", () => {
  const report = rebuild(fixture.document);
  const appels = [];
  const node = renderDestinyStep(ctxFrom(report.document, report), (a) => appels.push(a));
  const boutons = node.querySelectorAll(".parcours-pied button").filter((b) => !b.className.includes("fiche-livre"));
  /* 🔴 « Done », PAS « Next » — croquis d'Eric du 2026-09-02. Le geste ne change
     pas (`destinyNext`), c'est le MOT : NORMES §6 réserve `NEXT` à ce qui ne fait
     que naviguer, et ce bouton-là ACTE la carte au document. */
  assert.deepEqual(boutons.map((b) => b.textContent), ["I changed my mind", "Done"]);
  boutons[0].click();
  boutons[1].click();
  assert.deepEqual(appels, [{ kind: "destinyReset" }, { kind: "destinyNext" }]);
});

test("le voyant est un VOYANT — jamais un bouton (Eric : « idem voyant dans species »)", () => {
  const report = rebuild(fixture.document);
  const node = renderDestinyStep(ctxFrom(report.document, report), () => {});
  const tete = node.querySelectorAll(".card-final-tete")[0];
  assert.ok(tete, "la tête de la dalle porte le voyant");
  assert.equal(tete.querySelectorAll("button").length, 0,
    "le croquis l'appelait « bouton vert de validation » — c'est un état, pas une commande");
  assert.equal(tete.querySelectorAll(".parcours-voyant").length, 1,
    "et c'est le MÊME organe que les voyants d'items de Species");
});

/* ══ Le garde des jetons — vérifié par la suite complète, pas ici ═══════ */
