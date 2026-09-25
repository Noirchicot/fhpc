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
const { construireX5, feuilleDesCotesX5 } = await import("../ui/builder/x5-ecran.mjs");
const { pouvoirsDe, bonusDe, enPieces, prixSaisi } = await import("../ui/builder/craft.mjs");

const query = exempleFhEn().layers.verbs.query;
const armes = new Map(query({ kind: "weapon" }).map((v) => [v.record.data.name, v.record]));
const bases = [...query({ kind: "weapon" }), ...query({ kind: "armor" })].map((v) => v.record);
const plans = new Map(query({ kind: "item" }).map((v) => [v.record.data.name, v.record]));
const PLAN_ARME = plans.get("Weapon, +1, +2, or +3");
const PLAN_ARMURE = plans.get("Armor, +1, +2, or +3");
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
  /* ⭐ Lot 262 : la LARGEUR n'est plus écrite ici — la boîte partagée la porte. */
  for (const m of f.matchAll(/(?:left|top|width|height):(-?[\d.]+)px/g)) {
    assert.ok(connus.has(m[1]),
      `🔴 ${m[1]}px n'est dans la table nulle part — une cote écrite à la main dans la feuille`);
  }
});

test("2 — ⛔ LES ORGANES DU DOM SONT CEUX DE LA TABLE, ni plus ni moins", () => {
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" } });
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
  /* ⚖️ Eric, 24/09 : « oui voilà ». 🔴 LE CAS EST CONSTRUIT, ET IL DOIT L'ÊTRE : aucune
     des 51 bases du SRD n'est sans pouvoir (lot 261). Ce garde tient le MÉCANISME. */
  const vide = { data: { name: "Base de test", cost: "1 GP", weapon_range: "ranged", weapon_category: "exotic" } };
  assert.equal(pouvoirsDe(vide, magiques).length, 0, "le cas construit est bien vide");
  const planVide = { data: { name: "Plan de test", subtype: "Base de test",
    rarity: "Uncommon (+1), Rare (+2), or Very Rare (+3)" } };
  const creuse = monte({ plan: planVide, bases: [vide], itemsMagiques: magiques });
  assert.equal(creuse.noeud.dataset.pouvoirs, "aucun");
  const pleine = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" } });
  assert.equal(pleine.noeud.dataset.pouvoirs, undefined, "⚔️ une épée longue garde sa rangée");
  assert.match(feuilleDesCotesX5(), /\.x5\[data-pouvoirs="aucun"\] \[data-organe\^="POWER"\]\{display:none\}/,
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

test("5 — 🔴 LE BONUS SE LIT DANS LE PLAN — un +1 d'armure est RARE", () => {
  /* 🔴 LE LOT 259 PORTAIT EN DUR `Uncommon → +1, Rare → +2, Very Rare → +3`. Or le SRD
     écrit « Rare (+1), Very Rare (+2), or Legendary (+3) » pour `Armor, +1, +2, or +3`.
     La table en dur aurait affiché « +2 » sur un vrai +1 d'armure, et l'aurait coté à
     400 GP au lieu de 4 000. ⭐ Le bonus est lu, paire par paire, dans le plan. */
  assert.deepEqual(bonusDe(PLAN_ARMURE).map((b) => `${b.mot}=${b.rarete}`),
    ["+1=Rare", "+2=Very Rare", "+3=Legendary"]);
  const { noeud, cote } = monte({ plan: PLAN_ARMURE, bases, itemsMagiques: magiques,
    choix: { base: "Plate Armor", bonus: "Rare" } });
  const bonus = noeud.querySelector('[data-organe="BONUS"]');
  assert.equal(bonus.selectedOptions ? bonus.selectedOptions[0].textContent
    : [...bonus.children].find((o) => o.selected).textContent, "+1",
    "⛔ l'écran dit +1 — pas +2, pas Rare");
  assert.equal(cote.venteUnitaire, 5500,
    "⭐ et un +1 d'armure de plates vaut 5 500 GP — le nombre que le SRD écrit lui-même");
});

test("6 — ⚔️ LE SECOND POUVOIR NE PROPOSE QUE CE QUI TIENT DANS LA LIMITE", () => {
  /* ⛔ CE N'EST PAS UNE RÈGLE ANTI-DOUBLON : c'est la limite de l'échelle. Avec un
     Legendary posé, seuls des Uncommon tiennent — et un seul reste sur la Longsword
     (`Weapon of Warning`). ⭐ Un pouvoir admet « aucun » : un seul offert, c'est DEUX
     choix, et le menu doit rester ouvert. */
  const longue = armes.get("Longsword");
  const leg = pouvoirsDe(longue, magiques).find((r) => /^Legendary/.test(r.data.rarity || ""));
  assert.ok(leg, "l'épée longue offre bien un pouvoir légendaire");
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques,
    choix: { base: "Longsword", pouvoirs: [leg.data.name] } });
  const p2 = noeud.querySelector('[data-organe="POWER 2"]');
  const offerts = [...p2.children].map((o) => o.value).filter(Boolean);
  for (const n of offerts) {
    const r = magiques.find((m) => m.data.name === n);
    assert.match(r.data.rarity, /^Uncommon/, `⛔ ${n} ne tient pas avec un Legendary`);
  }
  assert.ok(!offerts.includes(leg.data.name), "⛔ le pouvoir déjà pris ne se reprend pas");
  assert.equal(p2.disabled, offerts.length === 0, "⭐ un seul pouvoir offert, et le menu reste ouvert");
});

/* ══ ④ LES REFUS ═══════════════════════════════════════════════════════════ */

test("7 — 🔴 UN ASSEMBLAGE HORS LIMITE NE S'ENVOIE PAS, ET IL DIT POURQUOI", () => {
  /* ⚠️ Le croquis d'Eric montre `Dagger + Flame Tongue + Vorpal`. Rare × Legendary
     ÷ 40 = 40 000 000, dix fois la limite. ⛔ La donnée l'interdit, l'écran doit
     le dire — et surtout ne pas afficher un prix plausible. */
  const { noeud, cote } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques,
    choix: { base: "Dagger", bonus: "Rare", pouvoirs: ["Defender"] } });
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
  /* ⚖️ « colonne de gauche inutile en SRD car pas de crafting time ». ⛔ ABSENTE du DOM. */
  const choix = { base: "Dagger", bonus: "Rare" };
  const fh = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix, fh: true });
  const srd = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix, fh: false });
  assert.ok(fh.noeud.querySelector(".x5-panneau-prereq"), "en Fate's Hand, elle est là");
  assert.equal(srd.noeud.querySelector(".x5-panneau-prereq"), null, "⛔ en SRD, ABSENTE du DOM");
  assert.equal(srd.cote.craftUnitaire, fh.cote.craftUnitaire, "⭐ le PRIX est le même");
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

/* ══ ⑤ LA PORTE ET L'ENVOI — lot 262 ═══════════════════════════════════════ */

test("10 — ⭐ LES MENUS SONT NATIFS, et ils s'ouvrent vraiment", () => {
  /* 🔴 LE LOT 259 DESSINAIT DES BOUTONS QUI NE S'OUVRAIENT SUR RIEN. Un `<select>`
     natif s'ouvre au doigt comme à la souris, et iOS le rend dans son propre menu. */
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" } });
  for (const nom of ["ITEM", "BONUS", "POWER 1", "POWER 2", "STATUS", "SEND TO"]) {
    const m = noeud.querySelector(`[data-organe="${nom}"]`);
    assert.equal(m.tagName, "SELECT", `${nom} est un vrai menu`);
    assert.equal(m.disabled, false, `⛔ ${nom} s'ouvre`);
  }
  const item = noeud.querySelector('[data-organe="ITEM"]');
  assert.equal([...item.children].length, 38, "⭐ les 38 armes — lues dans le `subtype` du plan");
  const send = [...noeud.querySelector('[data-organe="SEND TO"]').children].map((o) => o.value);
  assert.ok(!send.includes("craft"), "⛔ on ne se renvoie pas au craft depuis le craft");
});

test("11 — ⭐ `SEND` REND CE QUI A ÉTÉ COMPOSÉ, ET LE MONTANT DU STATUT (lot 265)", () => {
  /* ⚖️ Eric, 25/09 : l'objet crafté va dans l'équipement ; le craft SE PAIE (1 a).
     ⛔ L'écran n'écrit rien : il rend des RECORDS et un montant, l'appelant paie. */
  const recus = [];
  const envoie = (choix) => {
    const { noeud, cote } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix,
      surEnvoyer: (e) => recus.push(e) });
    const send = noeud.querySelector('[data-organe="SEND"]');
    return { send, cote };
  };
  const { send, cote } = envoie({ base: "Longsword", bonus: "Uncommon" });
  assert.equal(send.disabled, false, "⭐ un assemblage légal, avec un bonus : `Send` s'arme");
  send.dispatchEvent(new Event("click"));
  assert.equal(recus.length, 1, "un clic, un envoi");
  const e = recus[0];
  assert.equal(e.base.data.name, "Longsword", "⭐ la BASE est un record");
  assert.equal(e.bonus.mot, "+1", "⭐ le bonus porte son mot — c'est lui que la fiche garde");
  assert.deepEqual(e.pouvoirs, []);
  assert.deepEqual(e.cout, enPieces(cote.craftTotal), "⚖️ Crafting paie le coût de FABRICATION, arrondi comme l'écran l'affiche");
  assert.equal(e.destination, "backpack");

  recus.length = 0;
  envoie({ base: "Longsword", bonus: "Uncommon", status: "Buying" }).send.dispatchEvent(new Event("click"));
  assert.deepEqual(recus[0].cout, enPieces(cote.venteTotale), "⚖️ Buying paie le prix d'ACHAT");
  recus.length = 0;
  envoie({ base: "Longsword", bonus: "Uncommon", status: "Found" }).send.dispatchEvent(new Event("click"));
  assert.equal(recus[0].cout, null, "⚖️ Found ne paie RIEN — ⛔ pas une bourse de zéros");
});

test("11 bis — ⛔ `SEND` INERTE DIT POURQUOI : base nue, assemblage illégal, pas d'appelant", () => {
  const nue = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" },
    surEnvoyer: () => {} }).noeud.querySelector('[data-organe="SEND"]');
  assert.equal(nue.disabled, true, "⛔ une base nue n'est pas un craft — c'est un achat, il a sa porte (X2 · BUY)");
  assert.match(nue.getAttribute("aria-label") || "", /bonus or a power/i, "⛔ le lecteur d'écran entend POURQUOI");
  const sansAppelant = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques,
    choix: { base: "Longsword", bonus: "Uncommon" } }).noeud.querySelector('[data-organe="SEND"]');
  assert.equal(sansAppelant.disabled, true, "⛔ sans appelant, personne n'écrirait — le bouton ne ment pas");
  /* ⚔️ l'assemblage hors limite : Very Rare + un pouvoir Legendary */
  const legendaire = magiques.find((r) => /^Legendary/.test(r.data.rarity || "")
    && pouvoirsDe(bases.find((b) => b.data.name === "Longsword"), magiques).includes(r));
  const illegal = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, surEnvoyer: () => {},
    choix: { base: "Longsword", bonus: "Very Rare", pouvoirs: [legendaire.data.name] } });
  assert.equal(illegal.cote.legal, false, "témoin : l'assemblage est bien hors limite");
  assert.equal(illegal.noeud.querySelector('[data-organe="SEND"]').disabled, true);
});

test("11 ter — ⭐ LE REFUS DE L'APPELANT S'AFFICHE DANS LE PANNEAU, pas dans un organe de plus", () => {
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, surEnvoyer: () => {},
    choix: { base: "Longsword", bonus: "Uncommon" }, alerte: "Not enough coin in the purse." });
  const a = noeud.querySelector('[data-organe="PANNEAU"] [role="alert"]');
  assert.ok(a, "l'alerte est DANS le panneau");
  assert.equal(a.textContent, "Not enough coin in the purse.");
});

test("12 — ⚖️ LES TROIS RÉGIMES DU PANNEAU suivent le STATUS", () => {
  const choix = { base: "Longsword", bonus: "Uncommon" };
  const achat = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { ...choix, status: "Buying" } });
  const trouve = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { ...choix, status: "Found" } });
  const craft = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix });
  const cles = (n) => [...n.noeud.querySelectorAll(".x5-ligne-clef")].map((e) => e.textContent);
  assert.deepEqual(cles(achat), ["Price", "Qty · Total"], "⚖️ Buying : price · qty · total, et rien d'autre (lot 269 : `Price` se tape)");
  assert.equal(achat.noeud.querySelector(".x5-panneau-prereq"), null, "⛔ on n'achète pas un temps de craft");
  assert.deepEqual(cles(trouve), [], "⚖️ Found : aucun champ");
  assert.ok(trouve.noeud.querySelector(".x5-panneau-libre"), "⭐ la phrase du croquis, à la place");
  assert.ok(cles(craft).includes("Crafting cost"), "Crafting : le coût de fabrication");
});

test("13 — 🔴 LA PORTE : `Craft` S'OUVRE SUR UN PLAN QUE X5 SAIT COMPOSER, et nulle part ailleurs", async () => {
  /* ⚖️ Eric, 24/09, devant `Weapon, +1, +2, or +3` en ligne : « impossible pour moi
     d'arriver au blueprint, tu vois bien que craft n'est pas sélectionnable ».
     ⛔ `Craft` était grisé EN DUR pour tout objet (`actif: false`).
     ⭐ Ce garde monte la VRAIE fiche X2, avec le vrai prédicat du pilote. */
  const { construireLaFicheX2 } = await import("../ui/builder/x2-ecran.mjs");
  const { seCrafteDansX5 } = await import("../ui/builder/craft.mjs");
  const parRef = new Map([...plans.values()].map((r) => [r.data.name, r]));
  const fiche = (nom) => ({ ref: { kind: "item", id: nom }, nom, coutTexte: "", cout: null, poidsTexte: "", prose: "" });

  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try {
    const ouverts = [];
    const monteX2 = (nom) => construireLaFicheX2({
      liste: [fiche(nom)], index: 0,
      /* 🔴 LOT 263 — CE GARDE N'APPELAIT PAS COMME LE PILOTE : il omettait les objets
         magiques. `Berserker Axe` y restait donc fermé alors qu'il s'ouvre dans le
         produit — un vert qui ne tenait rien. L'appel est maintenant CELUI du pilote. */
      peutCrafter: (ref) => seCrafteDansX5(parRef.get(ref.id), bases, magiques),
      ouvrirCraft: (ref) => ouverts.push(ref.id),
    });
    const optionCraft = (n) => [...n.querySelectorAll("option")].find((o) => o.value === "craft");

    for (const nom of ["Weapon, +1, +2, or +3", "Armor, +1, +2, or +3", "Shield, +1, +2, or +3",
                       "Berserker Axe", "Flame Tongue", "Dwarven Plate"]) {
      const n = monteX2(nom);
      assert.equal(optionCraft(n).disabled, false, `⭐ ${nom} : Craft s'ouvre`);
      const sel = optionCraft(n).parentNode;
      sel.value = "craft";
      sel.dispatchEvent(new Event("change"));
      assert.equal(ouverts.at(-1), nom, `⭐ choisir Craft OUVRE X5 pour ${nom}`);
    }
    for (const nom of ["Dagger of Venom", "Spell Scroll", "Figurine of Wondrous Power", "Ammunition, +1, +2, or +3"]) {
      assert.equal(optionCraft(monteX2(nom)).disabled, true,
        `⛔ ${nom} : Craft reste fermé — un objet fini ne se crafte pas, et une famille sans écran le dit`);
    }
  } finally {
    if (avant === undefined) delete globalThis.document; else globalThis.document = avant;
  }
});

test("14 — 🔴 UNE FICHE QUI MONTE LE PARCHEMIN EST DANS SA FAMILLE — sinon il se peint en NOIR", async () => {
  /* 🔴 VU À L'IMAGE LE 24/09, ET AUCUN GARDE NE L'AVAIT DIT : X5 posait bien son SVG de
     parchemin, mais `.x5` n'était pas dans `FAMILLE_DU_PARCHEMIN`. La règle qui donne
     `fill: var(--x1-papier)` ne la visait donc pas, et le chemin prenait le défaut du
     SVG — le NOIR — par-dessus tout le papier. Les 2525 gardes étaient verts.
     ⭐ Ce garde lie les deux faits : la fiche porte un `.parchemin`, donc elle est de la
     famille, donc la feuille la vise. */
  const { FAMILLE_DU_PARCHEMIN, SELECTEUR_DU_PARCHEMIN } = await import("../ui/builder/parchemin.mjs");
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" } });
  assert.ok(noeud.querySelector(".parchemin"), "X5 porte bien un parchemin");
  assert.ok(FAMILLE_DU_PARCHEMIN.includes(".x5"),
    "⛔ X5 porte un parchemin sans être de sa famille : le SVG se peindra en noir");
  const regle = new RegExp(`${SELECTEUR_DU_PARCHEMIN.replace(/[.()[\]]/g, "\\$&")} \\.parchemin-fond\\s*\\{[^}]*fill:\\s*var\\(--x1-papier\\)`);
  assert.match(CSS, regle, "⭐ et la feuille vise EXACTEMENT cette famille — un seul écrivain de la liste");
});

test("15 — ⭐ UN POUVOIR À BASE MULTIPLE OUVRE LE PLAN DE SA FAMILLE, pouvoir déjà posé", async () => {
  /* ⚖️ Lot 263 : `Flame Tongue` est devenu un plan (il faut choisir l'arme). Il n'a pas
     de bonus à lui : X5 s'ouvre sur le plan à bonus de SA famille — trouvé, pas nommé —
     avec le pouvoir en POWER 1. ⛔ Sans cette porte, 28 plans porteraient la diagonale
     sans pouvoir s'ouvrir. */
  const { ouvertureX5 } = await import("../ui/builder/craft.mjs");
  const items = [...plans.values()];
  const ft = ouvertureX5(plans.get("Flame Tongue"), items, bases);
  assert.equal(ft.plan.data.name, "Weapon, +1, +2, or +3", "la famille d'une arme de mêlée");
  assert.deepEqual(ft.choix.pouvoirs, ["Flame Tongue"], "⭐ le pouvoir est déjà posé");
  assert.ok(pouvoirsDe(bases.find((b) => b.data.name === ft.choix.base), magiques)
    .some((r) => r.data.name === "Flame Tongue"), "⛔ et la base proposée l'accepte vraiment");
  const dp = ouvertureX5(plans.get("Dwarven Plate"), items, bases);
  assert.equal(dp.plan.data.name, "Armor, +1, +2, or +3", "une armure ouvre la famille des armures");
  assert.equal(ouvertureX5(plans.get("Dagger of Venom"), items, bases), null,
    "⛔ une seule base : rien à composer, c'est un objet qu'on achète");
});

test("16 — ⚖️ UN PLAN MÈNE DIRECTEMENT À X5, et les trois chemins du catalogue passent par UNE porte (lot 267)", () => {
  /* ⚖️ Eric, 25/09 : « un blueprint doit mener directement à X5 ». ⛔ Trois chemins
     ouvraient X2 depuis le catalogue (le tap sur R, le tap dans Wares, la recherche),
     chacun avec son `ficheEnCours` écrit à la main : une règle ajoutée à l'un manquait
     aux deux autres. Ce garde lit le code SANS ses commentaires. */
  const src = fs.readFileSync(path.join(ROOT, "ui", "builder", "equipment-step.mjs"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const poses = src.match(/ficheEnCours = \{/g) || [];
  assert.equal(poses.length, 1, `⛔ ${poses.length} endroits ouvrent X2 à la main — une seule porte, \`ouvrirLObjet\``);
  const porte = src.slice(src.indexOf("function ouvrirLObjet("), src.indexOf("piloteEquipement = {"));
  assert.match(porte, /seCrafteDansX5\(rec, basesDuCraft, magiquesDuCraft\)/,
    "⭐ la porte pose la MÊME question que le menu `Craft` de X2 — un seul critère");
  assert.ok(porte.indexOf('montrer("x5")') < porte.indexOf('montrer("x2")'),
    "⭐ un plan craftable va à X5 AVANT tout X2");
  assert.equal((src.match(/ouvrirLObjet\(/g) || []).length, 4, "la définition + R + Wares + la recherche");
});

/* ══ LOT 269 — LE COÛT DE LA BASE, ET LE PRIX QUI SE TAPE ═══════════════════════ */

test("17 — ⚖️ « CRAFTING COST OF THE BASE ITEM : 200 » pour la Breastplate — et les trois lignes s'additionnent", () => {
  /* ⚖️ Eric, 25/09 : « mets de base la moitié du prix de l'armure ». 🔴 La ligne montrait le
     PRIX (400) : 400 + 2 000 affichés, 2 200 facturés. */
  const { noeud } = monte({ plan: PLAN_ARMURE, bases, itemsMagiques: magiques,
    choix: { base: "Breastplate", bonus: "Rare" }, surChoix: () => {} });
  const lignes = Object.fromEntries([...noeud.querySelectorAll(".x5-ligne")]
    .map((l) => [l.querySelector(".x5-ligne-clef").textContent,
                 (l.querySelector(".x5-ligne-valeur") || l.querySelector("input")).textContent
                 || (l.querySelector("input") || {}).value]));
  assert.equal(lignes["Crafting cost of the base item"], "200 GP", "⭐ la MOITIÉ de 400");
  assert.equal(lignes["Crafting cost"], "2,000 GP", "la moitié de 4 000 (+1 Armor est Rare)");
  assert.equal(noeud.querySelector("input.x5-prix").value, "2,200 GP", "⭐ 200 + 2 000 : ce qui est affiché s'additionne");
  assert.equal(lignes["Base item cost"], undefined, "⛔ l'ancienne ligne (le PRIX de la base) n'existe plus");
});

test("18 — ⭐ LE PRIX SE TAPE : il remplace l'unitaire, le total et ce que `Send` paie — vide, il revient", () => {
  const recus = [];
  const monteAvec = (prix, status) => monte({ plan: PLAN_ARMURE, bases, itemsMagiques: magiques,
    choix: { base: "Breastplate", bonus: "Rare", prix, status }, surChoix: () => {}, surEnvoyer: (e) => recus.push(e) });
  const manuel = monteAvec("1000");
  const champ = manuel.noeud.querySelector("input.x5-prix");
  assert.equal(champ.value, "1,000 GP");
  assert.equal(champ.dataset.manuel, "oui", "⭐ le prix du joueur se distingue du prix calculé");
  manuel.noeud.querySelector('[data-organe="SEND"]').dispatchEvent(new Event("click"));
  assert.deepEqual(recus[0].cout, enPieces(1000), "⭐ `Send` paie le prix TAPÉ");
  const achat = monteAvec("750", "Buying");
  achat.noeud.querySelector('[data-organe="SEND"]').dispatchEvent(new Event("click"));
  assert.deepEqual(recus[1].cout, enPieces(750), "⭐ et en Buying aussi");
  const vide = monteAvec("");
  assert.equal(vide.noeud.querySelector("input.x5-prix").dataset.manuel, "non", "⛔ vide : retour au prix calculé");
  assert.equal(prixSaisi("1,500"), 1500);
  assert.equal(prixSaisi("5 SP"), 0.5);
  assert.equal(prixSaisi("0"), 0, "un zéro tapé EXPRÈS vaut zéro");
  for (const mou of ["", "  ", "abc", "gp"]) assert.equal(prixSaisi(mou), null, `⛔ « ${mou} » ne remplace rien`);
});

test("19 — ⛔ UN PRIX TAPÉ NE SURVIT PAS À UN AUTRE ASSEMBLAGE", () => {
  /* Un prix tapé pour une dague ne doit pas se retrouver sur une armure de plate. Garde de
     source, sans commentaires : le pilote remet le prix à zéro sur les cinq organes. */
  const src = fs.readFileSync(path.join(ROOT, "ui", "builder", "equipment-step.mjs"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ");
  assert.match(src, /if \(organe === "PRIX"\) c\.prix = /);
  assert.match(src, /\["ITEM", "BONUS", "POWER 1", "POWER 2", "STATUS"\]\.includes\(organe\)\) c\.prix = null/);
});
