/* ══ X5 — L'ÉCRAN, ET CE QUI LE TIENT AU PLAN ═════════════════════════════════

   ⚖️ Le croquis fait foi (`Croquis/2026-09-23-X5-recipe-and-craft.jpg`), le plan
   coté le chiffre (`FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py`), le moteur le calcule
   (`craft.mjs`, lot 258). ⭐ CET ÉCRAN N'AJOUTE AUCUNE RÈGLE ET AUCUNE COTE — ces
   gardes vérifient exactement ça, parce que c'est la seule chose qu'il pourrait
   faire de mal.

   ── LES QUATRE FAMILLES ────────────────────────────────────────────────────
     ① LE PLAN — la feuille lit la table, ⛔ elle n'écrit aucun nombre ;
     ② LA RANGÉE QUI DISPARAÎT — et ce qui la suit remonte ;
     ③ LE MOTEUR — l'écran montre ce que `craft.mjs` dit, rien d'autre ;
     ④ LES REFUS — un assemblage impossible ne s'envoie pas, et il dit pourquoi.
*/
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8");
const D = await import("../ui/builder/x5-disposition.mjs");
const { construireX5, feuilleDesCotesX5, BONUS_EN_MOT } = await import("../ui/builder/x5-ecran.mjs");
const { pouvoirsDe } = await import("../ui/builder/craft.mjs");

const query = exempleFhEn().layers.verbs.query;
const armes = new Map(query({ kind: "weapon" }).map((v) => [v.record.data.name, v.record]));
const magiques = query({ kind: "item" }).map((v) => v.record)
  .filter((r) => String(r?.data?.subtype || "").trim());

function monte(o) {
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try { return construireX5(o); }
  finally { if (avant === undefined) delete globalThis.document; else globalThis.document = avant; }
}
const organes = (n) => [...n.querySelectorAll("[data-organe]")].map((e) => e.dataset.organe);

/* ══ ① LE PLAN ═════════════════════════════════════════════════════════════ */

test("1 — ⭐ LA FEUILLE LIT LA TABLE, et n'écrit AUCUN nombre à elle", () => {
  const f = feuilleDesCotesX5();
  for (const o of D.ORGANES) {
    const b = o.cible || o;
    assert.match(f, new RegExp(`\\[data-organe="${o.nom}"\\]\\{[^}]*left:${b.x}px`),
      `⛔ ${o.nom} n'est pas posé à la cote de la table (${b.x})`);
  }
  /* ⚔️ ET LE GARDE SAIT ACCUSER UNE COTE INVENTÉE : tout nombre de la feuille doit
     se retrouver dans la table. ⛔ Sans ça, un `top: 208px` écrit à la main
     passerait inaperçu jusqu'à la première régénération du plan. */
  const connus = new Set();
  for (const o of D.ORGANES) {
    const b = o.cible || o;
    for (const v of [b.x, b.y, b.l, b.h, b.y - D.H_RANGEE]) connus.add(String(v));
  }
  /* ⭐ LA DALLE ELLE-MÊME EST UNE COTE DE LA TABLE — et ce garde l'a prouvé en
     rougissant : j'avais donné sa largeur à `.x5` sans l'inscrire ici, et il a
     refusé le 375 comme un nombre écrit à la main. C'est exactement son office. */
  connus.add(String(D.DALLE.h));
  connus.add(String(D.DALLE.l));
  for (const m of f.matchAll(/(?:left|top|width|height):(-?[\d.]+)px/g)) {
    assert.ok(connus.has(m[1]),
      `🔴 ${m[1]}px n'est dans la table nulle part — une cote écrite à la main dans la feuille`);
  }
});

test("2 — ⛔ LES ORGANES DU DOM SONT CEUX DE LA TABLE, ni plus ni moins", () => {
  const { noeud } = monte({ base: armes.get("Longsword"), itemsMagiques: magiques });
  const attendus = new Set(D.ORGANES.map((o) => o.nom));
  const vus = new Set(organes(noeud));
  for (const nom of attendus) {
    assert.ok(vus.has(nom), `⛔ ${nom} est au plan et absent de l'écran`);
  }
  for (const nom of vus) {
    assert.ok(attendus.has(nom), `🔴 ${nom} est à l'écran et absent du plan — un organe hors plan`);
  }
});

/* ══ ② LA RANGÉE QUI DISPARAÎT ═════════════════════════════════════════════ */

test("3 — 🔴 SANS POUVOIR DISPONIBLE, LA RANGÉE DISPARAÎT — et ne se grise pas", () => {
  /* ⚖️ Eric, 24/09, à « les faire disparaître, pas les griser ? » : « oui voilà ».
     ⭐ Une option grisée promet qu'un jour elle s'ouvrira ; une option absente dit
     que cette base n'est pas de cette famille-là. C'est la loi des cinq gemmes à
     10 po, appliquée à une rangée. */
  const arbalete = [...armes.values()].find((r) => pouvoirsDe(r, magiques).length === 0);
  assert.ok(arbalete, "la pile porte bien une arme sans aucun pouvoir");

  const vide = monte({ base: arbalete, itemsMagiques: magiques });
  assert.equal(vide.noeud.dataset.pouvoirs, "aucun");
  const pleine = monte({ base: armes.get("Longsword"), itemsMagiques: magiques });
  assert.equal(pleine.noeud.dataset.pouvoirs, undefined,
    "⚔️ et une épée longue, elle, garde sa rangée");

  const f = feuilleDesCotesX5();
  assert.match(f, /\.x5\[data-pouvoirs="aucun"\] \[data-organe\^="POWER"\]\{display:none\}/,
    "⛔ la rangée disparaît vraiment — un `opacity` ou un `disabled` ne suffirait pas");
});

test("4 — ⭐ ET TOUT CE QUI SUIT REMONTE DE LA HAUTEUR RENDUE", () => {
  /* 🔴 SANS CE BLOC, LA RANGÉE DISPARAÎTRAIT EN LAISSANT SON TROU. Les organes
     sont posés en ABSOLU depuis la table : retirer celui du milieu ne referme
     rien tout seul. C'est le genre de défaut qu'aucun garde de fichier ne voit —
     il faut regarder l'image, ou l'écrire ici. */
  const f = feuilleDesCotesX5();
  const apres = D.ORGANES.filter((o) => (o.cible || o).y > 100);
  assert.ok(apres.length >= 5, "il y a bien des organes sous la rangée des pouvoirs");
  for (const o of apres) {
    const b = o.cible || o;
    assert.match(f, new RegExp(
      `\\[data-pouvoirs="aucun"\\] \\[data-organe="${o.nom}"\\]\\{top:${b.y - D.H_RANGEE}px\\}`),
      `⛔ ${o.nom} ne remonte pas de ${D.H_RANGEE} quand la rangée s'efface`);
  }
});

/* ══ ③ LE MOTEUR — L'ÉCRAN MONTRE, IL NE CALCULE PAS ══════════════════════ */

test("5 — ⚖️ LE BONUS S'AFFICHE `+1`, JAMAIS `Uncommon`", () => {
  /* ⚖️ « en SRD tu ne parleras pas de PP » — et la rareté d'un bonus est la même
     plomberie : le joueur choisit « +2 », le moteur ne connaît que des paliers. */
  assert.deepEqual(BONUS_EN_MOT, { Uncommon: "+1", Rare: "+2", "Very Rare": "+3" });
  const { noeud } = monte({ base: armes.get("Dagger"), itemsMagiques: magiques,
    choix: { bonus: "Rare" } });
  const mot = noeud.querySelector('[data-organe="BONUS"] .x5-drop-mot').textContent;
  assert.equal(mot, "+2", "⛔ l'écran dit +2, pas Rare");
});

test("6 — ⚔️ LE SECOND POUVOIR NE PROPOSE QUE CE QUI TIENT DANS LA LIMITE", () => {
  /* ⛔ CE N'EST PAS UNE RÈGLE ANTI-DOUBLON : c'est la limite de l'échelle, et
     c'est `craft.mjs` qui la tient. Ce garde vérifie que l'écran la CONSULTE. */
  const longue = armes.get("Longsword");
  const dispos = pouvoirsDe(longue, magiques);
  const legendaire = dispos.find((r) => /^Legendary/.test(r.data.rarity || ""));
  assert.ok(legendaire, "l'épée longue offre bien un pouvoir légendaire");

  const { noeud } = monte({ base: longue, itemsMagiques: magiques,
    choix: { pouvoirs: [legendaire] } });
  const p2 = noeud.querySelector('[data-organe="POWER 2"]');
  assert.ok(p2, "le second dropdown existe");
  /* ⚔️ Avec un Legendary posé, seuls des Uncommon tiennent encore — et l'épée
     longue n'en offre aucun. Le contrôle doit donc être INERTE, ⛔ pas ouvert sur
     un menu vide : c'est le défaut de `data-glissable` qui promettait un geste
     que personne n'écoutait. */
  assert.equal(p2.disabled, true,
    "⛔ après un Legendary, plus rien ne tient — le dropdown ne promet pas un menu vide");
});

/* ══ ④ LES REFUS ═══════════════════════════════════════════════════════════ */

test("7 — 🔴 UN ASSEMBLAGE HORS LIMITE NE S'ENVOIE PAS, ET IL DIT POURQUOI", () => {
  /* ⚠️ Le croquis d'Eric montre `Dagger + Flame Tongue + Vorpal`. Rare × Legendary
     ÷ 40 = 40 000 000, dix fois la limite. ⛔ La donnée l'interdit, l'écran doit
     le dire — et surtout ne pas afficher un prix plausible. */
  const { noeud, cote } = monte({ base: armes.get("Dagger"), itemsMagiques: magiques,
    choix: { bonus: "Rare", pouvoirs: [{ data: { rarity: "Legendary (Requires Attunement)", name: "Defender" } }] } });
  assert.equal(cote.legal, false);
  const send = noeud.querySelector('[data-organe="SEND"]');
  assert.equal(send.disabled, true, "⛔ on n'envoie pas une tuile qui n'existe pas");
  const refus = noeud.querySelector(".x5-panneau-refus");
  assert.ok(refus && refus.textContent.length > 10,
    "🔴 et le panneau DIT pourquoi — un champ vide, ou un « 0 GP », serait plausible "
    + "et personne ne le vérifierait");
  assert.equal(noeud.querySelector(".x5-ligne-valeur"), null,
    "⛔ aucune ligne d'argent quand il n'y a pas de prix juste à donner");
});

test("8 — ⚖️ EN PILE SRD, LA COLONNE GAUCHE N'EST PAS CONSTRUITE", () => {
  /* ⚖️ « colonne de gauche inutile en SRD car pas de crafting time ».
     ⛔ ABSENTE, pas cachée : un organe en `display:none` reste dans le DOM, dans
     la tabulation et dans le nom accessible. */
  const choix = { bonus: "Rare" };
  const fh = monte({ base: armes.get("Dagger"), itemsMagiques: magiques, choix, fh: true });
  const srd = monte({ base: armes.get("Dagger"), itemsMagiques: magiques, choix, fh: false });
  assert.ok(fh.noeud.querySelector(".x5-panneau-prereq"), "en Fate's Hand, elle est là");
  assert.equal(srd.noeud.querySelector(".x5-panneau-prereq"), null, "⛔ en SRD, ABSENTE du DOM");
  assert.equal(srd.noeud.querySelector(".x5-roll"), null, "et son bouton avec elle");
  assert.equal(srd.cote.craftUnitaire, fh.cote.craftUnitaire,
    "⭐ mais le PRIX est le même dans les deux piles — seule la règle du temps diffère");
});

test("9 — ⚔️ LA FEUILLE EXISTE VRAIMENT, et le mot cède avant le chevron", () => {
  /* ⛔ Un `<span>` sans règle est un nœud parfaitement valide et parfaitement
     vide — les huit tests d'au-dessus resteraient verts. */
  assert.match(CSS, /\.x5-drop-mot\s*\{[^}]*text-overflow:\s*ellipsis/,
    "📏 à 169,5 il reste 153,5 pour le texte : si un nom déborde, c'est le MOT qui cède");
  assert.match(CSS, /\.x5-drop-chevron\s*\{[^}]*flex:\s*0 0 auto/,
    "⛔ le chevron ne se comprime jamais — il dit qu'il y a un menu");
  assert.match(CSS, /\.x5\s*\{[^}]*--x1-papier/,
    "⭐ X5 emprunte la palette du parchemin, ⛔ elle n'invente pas un jeu de teintes");
});
