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
const { construireX5, feuilleDesCotesX5, organesDeLaFamille } = await import("../ui/builder/x5-ecran.mjs");
const { reglesDeLaBourse } = await import("../ui/builder/gear-ecran.mjs");
const { pouvoirsDe, bonusDe, enPieces, prixSaisi, estBaseDeMunition } = await import("../ui/builder/craft.mjs");

const query = exempleFhEn().layers.verbs.query;
const armes = new Map(query({ kind: "weapon" }).map((v) => [v.record.data.name, v.record]));
/* ⭐ LOT 283 — LES BASES TELLES QUE LE PILOTE LES DONNE (`basesDuCraft`) : armes, armures, et
   les munitions qui portent leur paquet. ⛔ Sans elles, ces gardes croiraient encore que
   `Ammunition, +1…` n'a pas de base — ce que le produit ne croit plus. */
const bases = [...query({ kind: "weapon" }), ...query({ kind: "armor" }),
  ...query({ kind: "gear" }).filter((v) => estBaseDeMunition(v.record))].map((v) => v.record);
const plans = new Map(query({ kind: "item" }).map((v) => [v.record.data.name, v.record]));
const PLAN_ARME = plans.get("Weapon, +1, +2, or +3");
const PLAN_ARMURE = plans.get("Armor, +1, +2, or +3");
const magiques = query({ kind: "item" }).map((v) => v.record)
  .filter((r) => String(r?.data?.subtype || "").trim());
/* ⭐ LOT 277 — les plans à variante et l'organe de valeur de Wares, tels que le pilote les donne */
const { variantesDe } = await import("../src/build/objet-crafte.mjs");
const { fabriqueDeValeur } = await import("../ui/builder/equipement-pipeline.mjs");
const PLANS_A_VARIANTE = query({ kind: "item" }).map((v) => v.record).filter((r) => variantesDe(r.data).length >= 2);
/* ⭐ LOT 285 — le plan du parchemin et les sorts de la pile, tels que le pilote les donne */
const PLAN_PARCHEMIN = plans.get("Spell Scroll");
const SORTS = query({ kind: "spell" }).map((v) => v.record);
const valeurDe = fabriqueDeValeur(query);

function monte(o) {
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try { return construireX5(o); }
  finally { if (avant === undefined) delete globalThis.document; else globalThis.document = avant; }
}
const organes = (n) => [...n.querySelectorAll("[data-organe]")].map((e) => e.dataset.organe);
/* ⭐ La bourse et son montant gardent le nom d'organe de R (`purse`, `montant`). */
const organeDom = (nom) => ({ PURSE: "purse", MONTANT: "montant" }[nom] || nom);

/* ══ ① LE PLAN ═════════════════════════════════════════════════════════════ */

test("1 — ⭐ LA FEUILLE LIT LA TABLE, et n'écrit AUCUN nombre à elle", () => {
  const f = feuilleDesCotesX5();
  for (const o of D.ORGANES) {
    const b = o.cible || o;
    assert.match(f, new RegExp(`\\[data-organe="${organeDom(o.nom)}"\\]\\{[^}]*left:${b.x}px`),
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
  /* ⭐ LOT 270 — LE POPUP DE LA BOURSE a ses cotes chez son unique écrivain (`reglesDeLaBourse`,
     gear-ecran) : elles sont connues parce qu'elles VIENNENT de là, ⛔ pas écrites ici. */
  for (const r of reglesDeLaBourse(".x5", D.ORGANES.find((o) => o.nom === "PURSE"), D.DALLE, 0)) {
    for (const m of r.matchAll(/(?:left|top|width|height|padding|border-width):(-?[\d.]+)px/g)) connus.add(m[1]);
  }
  /* ⭐ Lot 262 : la LARGEUR n'est plus écrite ici — la boîte partagée la porte. */
  for (const m of f.matchAll(/(?:left|top|width|height):(-?[\d.]+)px/g)) {
    assert.ok(connus.has(m[1]),
      `🔴 ${m[1]}px n'est dans la table nulle part — une cote écrite à la main dans la feuille`);
  }
});

test("2 — ⛔ LES ORGANES DU DOM SONT CEUX DE LA TABLE, ni plus ni moins — famille par famille (lot 277)", () => {
  /* ⭐ LOT 277 — la table porte DEUX familles : `base` (arme, armure) et `variante`
     (wondrous, potions, wand), plus les organes communs. Une fiche pose les siens et
     les communs, ⛔ jamais ceux de l'autre famille. */
  /* ⭐ LOT 285 — ET UNE TROISIÈME, le `parchemin`, qui REDÉCLARE des communs (QTY, JETON, la
     bourse, le pied) et ne garde que ceux que la table nomme (`COMMUNS_DE`). Le calcul
     « ce qu'une fiche pose » est celui de l'écran (`organesDeLaFamille`) — ⛔ plus une
     seconde écriture ici. Wizard niveau 2 : 37 sorts, donc les deux chevrons. */
  const fiches = {
    base: monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" } }).noeud,
    variante: monte({ plan: plans.get("Ioun Stone"), plansFreres: PLANS_A_VARIANTE, valeurDe }).noeud,
    parchemin: monte({ plan: PLAN_PARCHEMIN, sorts: SORTS, choix: { classe: "Wizard", niveau: 2 } }).noeud,
  };
  /* ⚔️ le calcul de la famille ne se trompe pas en se recopiant : la base et la variante
     gardent TOUS les communs, le parchemin ne garde que le titre et ses propres organes */
  assert.deepEqual(organesDeLaFamille("base").map((o) => o.nom).sort(),
    D.ORGANES.filter((o) => !o.famille || o.famille === "base").map((o) => o.nom).sort());
  assert.ok(!organesDeLaFamille("parchemin").some((o) => ["STATUS", "ENCART", "PHRASE", "TYPE"].includes(o.nom)),
    "⛔ ni statut, ni encart, ni phrase dans la fiche du parchemin");
  for (const [famille, noeud] of Object.entries(fiches)) {
    const attendus = new Set(organesDeLaFamille(famille).map((o) => organeDom(o.nom)));
    const vus = new Set(organes(noeud));
    for (const nom of attendus) {
      assert.ok(vus.has(nom), `⛔ ${famille} : ${nom} est au plan et absent de l'écran`);
    }
    for (const nom of vus) {
      assert.ok(attendus.has(nom), `🔴 ${famille} : ${nom} est à l'écran et absent du plan de sa famille`);
    }
  }
  assert.ok(D.ORGANES.some((o) => o.famille === "variante") && D.ORGANES.some((o) => o.famille === "base"),
    "témoin : la table porte bien les deux familles");
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
  const yPouvoirs = D.ORGANES.find((o) => o.nom === "POWER 1").cible.y;
  /* ⭐ LOT 285 — seuls les COMMUNS remontent : le parchemin a ses propres cotes, et pas de
     rangée des pouvoirs à perdre. */
  const apres = D.ORGANES.filter((o) => !o.famille && (o.cible || o).y > yPouvoirs);
  assert.ok(apres.length >= 5, "il y a bien des organes sous la rangée des pouvoirs");
  for (const o of apres) {
    const b = o.cible || o;
    assert.match(f, new RegExp(
      `\\[data-pouvoirs="aucun"\\] \\[data-organe="${organeDom(o.nom)}"\\]\\{top:${b.y - D.H_RANGEE}px\\}`),
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
  const refus = noeud.querySelector(".x5-encart-refus");
  assert.ok(refus && refus.textContent.length > 10,
    "🔴 et l'encart DIT pourquoi — un champ vide, ou un « 0 GP », serait plausible "
    + "et personne ne le vérifierait");
  assert.equal(noeud.querySelector(".x5-ligne-valeur"), null,
    "⛔ aucune ligne d'argent quand il n'y a pas de prix juste à donner");
});

test("8 — ⚖️ LE TEMPS DE CRAFT : le même en pile SRD et en pile FH (lot 280)", () => {
  /* 🔴 LE LOT 270 LE VOULAIT VIDE EN SRD (Eric, 25/09 : « Crafting time (SRD vide / FH
     rempli) »), sur une prémisse fausse : le SRD 5.2.1 porte sa table de temps (p. 206,
     vérifiée dans le PDF). ⚖️ Eric, 26/09 : le barème SRFH est « la référence de FH et SRD »,
     « prix SRD et FH idem ». ⭐ Temps ET prix, identiques dans les deux piles. */
  const choix = { base: "Dagger", bonus: "Rare" };
  const fh = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix, fh: true });
  const srd = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix, fh: false });
  const temps = (n) => n.noeud.querySelector(".x5-encart-droite .x5-ligne-valeur").textContent;
  assert.equal(temps(fh), "50 days", "une Dagger +2 : Rare (4) + 2 GP → Rare, 50 jours");
  assert.equal(temps(srd), temps(fh), "⭐ le même temps dans les deux piles");
  assert.equal(srd.cote.craftUnitaire, fh.cote.craftUnitaire, "⭐ et le même prix");
});

test("9 — ⚔️ LA FEUILLE EXISTE VRAIMENT, et le mot cède avant le chevron", () => {
  /* ⛔ Un `<span>` sans règle est un nœud parfaitement valide et parfaitement
     vide — les huit tests d'au-dessus resteraient verts. */
  assert.match(CSS, /\.x5-drop-mot\s*\{[^}]*text-overflow:\s*ellipsis/,
    "📏 à 169,5 il reste 153,5 pour le texte : si un nom déborde, c'est le MOT qui cède");
  assert.match(CSS, /\.x5-drop-chevron\s*\{[^}]*flex:\s*0 0 auto/,
    "⛔ le chevron ne se comprime jamais — il dit qu'il y a un menu");
  assert.match(CSS, /\.x5\s*\{[^}]*--x1-encre/,
    "⭐ X5 garde l'encre de la famille des fiches, ⛔ elle n'invente pas un jeu de teintes");
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

test("11 ter — ⭐ LE REFUS DE L'APPELANT S'AFFICHE DANS L'ENCART, pas dans un organe de plus", () => {
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, surEnvoyer: () => {},
    choix: { base: "Longsword", bonus: "Uncommon" }, alerte: "Not enough coin in the purse." });
  const a = noeud.querySelector('[data-organe="ENCART"] [role="alert"]');
  assert.ok(a, "l'alerte est DANS l'encart");
  assert.equal(a.textContent, "Not enough coin in the purse.");
});

test("12 — ⚖️ LES TROIS RÉGIMES suivent le STATUS : Crafting détaille, Buying prix · quantité, Found sans encart", () => {
  const choix = { base: "Longsword", bonus: "Uncommon" };
  const achat = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { ...choix, status: "Buying" }, surChoix: () => {} });
  const trouve = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { ...choix, status: "Found" } });
  const craft = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix });
  const cles = (n) => [...n.noeud.querySelectorAll(".x5-ligne-clef")].map((e) => e.textContent);
  assert.deepEqual(cles(craft), ["Longsword", "Enchanting", "Total", "Crafting time", "Qty 1 · Total"],
    "⚖️ la dictée : la base · Enchanting · Total | Crafting time · Qty · Total");
  assert.deepEqual(cles(achat), ["Price", "Qty 1 · Total"],
    "⚖️ « pour l'achat, uniquement le prix et la quantité (tous deux modifiables) »");
  assert.ok(achat.noeud.querySelector("input.x5-prix"), "⭐ le prix d'achat se tape");
  assert.equal(trouve.noeud.querySelector('[data-organe="ENCART"]'), null, "⚖️ « en free, pas d'encart »");
  assert.match(trouve.noeud.querySelector('[data-organe="PHRASE"]').textContent, /free/i,
    "⭐ la phrase bleue dit le reste");
});

test("13 — 🔴 LA PORTE : `Craft` S'OUVRE SUR UN PLAN QUE X5 SAIT COMPOSER, et nulle part ailleurs", async () => {
  /* ⚖️ Eric, 24/09, devant `Weapon, +1, +2, or +3` en ligne : « impossible pour moi
     d'arriver au blueprint, tu vois bien que craft n'est pas sélectionnable ».
     ⛔ `Craft` était grisé EN DUR pour tout objet (`actif: false`).
     ⭐ Ce garde monte la VRAIE fiche X2, avec le vrai prédicat du pilote. */
  const { construireLaFicheX2 } = await import("../ui/builder/x2-ecran.mjs");
  const { ouvertureDepuisX2 } = await import("../ui/builder/craft.mjs");
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
      peutCrafter: (ref) => Boolean(ouvertureDepuisX2(parRef.get(ref.id), magiques, bases, PLANS_A_VARIANTE)),
      ouvrirCraft: (ref) => ouverts.push(ref.id),
    });
    const optionCraft = (n) => [...n.querySelectorAll("option")].find((o) => o.value === "craft");

    for (const nom of ["Weapon, +1, +2, or +3", "Armor, +1, +2, or +3", "Shield, +1, +2, or +3",
                       "Berserker Axe", "Flame Tongue", "Dwarven Plate",
                       /* ⭐ LOT 277 — les plans à variante s'ouvrent */
                       "Figurine of Wondrous Power", "Ioun Stone", "Potions of Healing",
                       "Wand of the War Mage, +1, +2, or +3", "Belt of Giant Strength",
                       /* ⭐ LOT 283 — les projectiles s'ouvrent : `Any Ammunition` lit enfin ses
                          bases (les munitions qui portent leur paquet, `estBaseDeMunition`) */
                       "Ammunition, +1, +2, or +3", "Ammunition of Slaying",
                       /* ⭐ LOT 285 — le parchemin de sort s'ouvre : sa famille a son écran (la
                          dictée d'Eric du 26/09). Il était dans la liste des fermés ci-dessous
                          jusqu'au lot 284, « une famille sans écran le dit ». */
                       "Spell Scroll"]) {
      const n = monteX2(nom);
      assert.equal(optionCraft(n).disabled, false, `⭐ ${nom} : Craft s'ouvre`);
      const sel = optionCraft(n).parentNode;
      sel.value = "craft";
      sel.dispatchEvent(new Event("change"));
      assert.equal(ouverts.at(-1), nom, `⭐ choisir Craft OUVRE X5 pour ${nom}`);
    }
    /* 🗄️ `Ammunition, +1, +2, or +3` (lot 283) et `Spell Scroll` (lot 285) étaient dans cette
       liste : ⭐ ils sont passés au-dessus, parmi les plans qui s'ouvrent — ⛔ et la liste des
       fermés n'en garde pas trace : un plan fermé à tort serait aussi vert qu'un plan fermé à raison. */
    for (const nom of ["Dagger of Venom", "Bag of Holding"]) {
      assert.equal(optionCraft(monteX2(nom)).disabled, true,
        `⛔ ${nom} : Craft reste fermé — un objet fini ne se crafte pas, et une famille sans écran le dit`);
    }
  } finally {
    if (avant === undefined) delete globalThis.document; else globalThis.document = avant;
  }
});

test("14 — ⚖️ LES FICHES X SONT DES DALLES À 50 % — ⛔ plus de parchemin (lot 273)", () => {
  /* ⚖️ Eric, 25/09 : « honnêtement passer tous les X en dalle 50 % est plus joli que le
     parchemin ». 🗄️ Ce garde disait, jusqu'au lot 272, qu'une fiche qui monte le parchemin
     doit être de sa famille (sinon le SVG se peignait en noir, vu le 24/09). ⭐ La loi est
     maintenant plus simple : AUCUNE fiche ne monte le parchemin, et UNE règle peint la dalle. */
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" } });
  assert.equal(noeud.querySelector(".parchemin"), null, "⛔ X5 ne porte plus de parchemin");
  const f = CSS.replace(/\/\*[\s\S]*?\*\//g, " ");
  const regle = /:is\(\.x1, \.x2, \.x5\)\[data-objet\]::before, \.x0 \.aiguilleur-carte::before\s*\{([^}]*)\}/.exec(f);
  assert.ok(regle, "⭐ UNE règle de famille pour X0, X1, X2 et X5");
  assert.match(regle[1], /background:\s*var\(--dalle-inter\)/, "⚖️ le voile de 50 % (`--voile-inter`)");
  assert.match(regle[1], /box-shadow:\s*inset 0 0 0 1px var\(--verre-lisere\)/, "⚖️ « liseré contour inclus »");
  assert.match(regle[1], /inset:\s*var\(--sp-4\)/, "⚖️ « une dalle classique avec marges »");
  assert.doesNotMatch(f.match(/\.x5\s*\{[^}]*\}/)[0], /background/, "⛔ plus de fond opaque sur la boîte de X5");
  assert.match(f, /\.equipment-step:has\([^)]*\.x5[^)]*\)[^{]*> \.tuto-point\s*\{\s*visibility:\s*hidden/,
    "⚖️ « pas de ? » : le point du tutoriel ne passe plus à travers la dalle");
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

test("17 — ⚖️ L'ENCART DE LA BREASTPLATE +1 : 200 · 2,000 · 2,200 — et ×2, un total de 4,400", () => {
  /* ⚖️ Eric, 25/09 : « Breastplate 200 · Enchanting 2000 · Total 2200 · Qty 2 Total 4400 ». */
  const monteQ = (qte) => monte({ plan: PLAN_ARMURE, bases, itemsMagiques: magiques,
    choix: { base: "Breastplate", bonus: "Rare", qte }, surChoix: () => {} });
  const lignes = (n) => Object.fromEntries([...n.querySelectorAll(".x5-encart-couts .x5-ligne")]
    .map((l) => [l.querySelector(".x5-ligne-clef").textContent, l.querySelector(".x5-ligne-valeur").textContent]));
  const un = monteQ(1).noeud;
  assert.deepEqual(lignes(un), { Breastplate: "200 GP", Enchanting: "2,000 GP", Total: "2,200 GP" },
    "⭐ la MOITIÉ de 400, la moitié de 4 000 (+1 Armor est Rare), et ce qui s'additionne");
  assert.equal(un.querySelector("input.x5-prix").value, "2,200 GP");
  const deux = monteQ(2).noeud;
  assert.equal(deux.querySelector("input.x5-prix").value, "4,400 GP", "⭐ Qty 2 · Total 4,400");
  assert.equal([...deux.querySelector('[data-organe="QTY"]').children].find((o) => o.selected).value, "2");
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
  /* ⭐ LOT 277 — et la VARIANTE : un prix tapé pour un Horn d'argent ne vaut pas pour un Horn de fer.
     (Un autre PLAN repart d'un choix neuf, sans prix : il ne passe pas par cette ligne.) */
  assert.match(src, /\["ITEM", "BONUS", "POWER 1", "POWER 2", "VARIANT", "STATUS", "QTY"\]\.includes\(organe\)\) c\.prix = null/);
  assert.match(src, /choix: \{ status, qte, destination \}/, "⛔ un autre plan ne garde pas le prix tapé");
});

/* ══ LOT 270 — LA FICHE BLUEPRINT ═══════════════════════════════════════════════ */

test("20 — ⚖️ BLUEPRINT : le titre, ⛔ AUCUN JET, ⛔ AUCUN `?`", () => {
  /* ⚖️ Eric, 25/09 : « le titre c'est Blueprint » · « pas de jets pour produire les regular
     magic items (SRD comme FH) » · « pas de point d'interrogation ». */
  for (const fh of [true, false]) {
    const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, fh,
      choix: { base: "Longsword", bonus: "Uncommon" } });
    assert.equal(noeud.querySelector('[data-organe="TITRE"]').textContent, "Blueprint");
    const textes = [...noeud.querySelectorAll("button, select, p, span, h2")].map((e) => e.textContent.trim());
    assert.ok(!textes.some((t) => /^roll$/i.test(t)), `⛔ aucun ROLL (${fh ? "FH" : "SRD"})`);
    assert.ok(!textes.some((t) => /\bDC\b/.test(t)), "⛔ aucun DC");
    assert.ok(!textes.includes("?"), "⛔ aucun bouton `?`");
    assert.equal(noeud.querySelector(".x5-roll"), null);
  }
});

test("21 — ⚖️ LA QUANTITÉ : un menu de 1 à 10, et elle remet le total tapé à zéro", () => {
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" }, surChoix: () => {} });
  const q = noeud.querySelector('[data-organe="QTY"]');
  assert.deepEqual([...q.children].map((o) => o.value), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "⚖️ « je ne veux pas qu'une tuile puisse sortir du craft avec plus de 10 »");
});

test("22 — ⭐ LE JETON PORTE LE NOM DE L'OBJET, et le tap rend l'aperçu à l'appelant", () => {
  const recus = [];
  const flamme = pouvoirsDe(armes.get("Longsword"), magiques).find((r) => r.data.name === "Flame Tongue");
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques,
    choix: { base: "Longsword", bonus: "Uncommon", pouvoirs: [flamme.data.name] }, surJeton: (a) => recus.push(a) });
  const jeton = noeud.querySelector('[data-organe="JETON"]');
  assert.equal(jeton.querySelector(".jeton-nom").textContent, "Longsword +1 (Flame Tongue)",
    "⭐ le nom du moteur (`nomCrafte`) — celui que `Send` posera");
  jeton.dispatchEvent(new Event("click"));
  assert.equal(recus.length, 1);
  assert.equal(recus[0].nom, "Longsword +1 (Flame Tongue)");
  assert.equal(recus[0].base.data.name, "Longsword", "⭐ des RECORDS, pour que la fiche se compose");
});

test("23 — ⚖️ LA BOURSE À DROITE DU JETON, l'organe de R : image, montant dessus, popup", () => {
  /* ⚖️ Eric, 25/09 : « on peut mettre l'item bourse à droite du token (idem celui de gear) ». */
  let ouverte = 0;
  const { noeud } = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" },
    bourse: { cp: 0, sp: 0, gp: 150, pp: 0 }, surBourse: () => { ouverte += 1; } });
  const purse = noeud.querySelector('[data-organe="purse"]');
  assert.ok(purse && purse.className.includes("gear-bouton"), "⭐ le bouton de R — il porte l'image de la bourse");
  assert.ok(noeud.querySelector('[data-organe="montant"]'), "⭐ le montant posé DESSUS");
  purse.dispatchEvent(new Event("click"));
  assert.equal(ouverte, 1, "le tap ouvre la bourse");
  const j = D.ORGANES.find((o) => o.nom === "JETON"), p = D.ORGANES.find((o) => o.nom === "PURSE");
  assert.ok(p.x > j.x + j.l, "📏 à DROITE du jeton");
  const ouvert = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" },
    bourse: { cp: 0, sp: 0, gp: 150, pp: 0 }, bourseOuverte: true });
  assert.ok(ouvert.noeud.querySelector(".gear-bourse"), "⭐ le popup de R, ⛔ pas un second");
});

test("24 — ⚖️ LE PLAN : aucun ascenseur — tout tient dans la dalle", () => {
  /* ⚖️ Eric, 25/09 : « et aucun ascenseur là-dedans ». Le générateur le vérifie ; ce garde le
     relit dans la table recopiée, pour qu'une table éditée à la main ne le contredise pas. */
  const bas = Math.max(...D.ORGANES.map((o) => { const b = o.cible || o; return b.y + b.h; }));
  assert.ok(bas + D.MARGE <= D.DALLE.h, `📏 ${bas + D.MARGE} ≤ ${D.DALLE.h}`);
  assert.doesNotMatch(feuilleDesCotesX5(), /overflow[^;]*:\s*(auto|scroll)/, "⛔ aucun défilement dans la feuille de X5");
});

test("25 — ⚖️ LA RARETÉ EST CITÉE : « Rare armor » pour la Breastplate +1, « Uncommon weapon » pour une épée +1", () => {
  /* ⚖️ Eric, 25/09 : « il faut citer la rareté — crafting time 3 days (FH) · rare weapon ». */
  const r = (plan, choix) => monte({ plan, bases, itemsMagiques: magiques, choix })
    .noeud.querySelector(".x5-encart-rarete").textContent;
  assert.equal(r(PLAN_ARMURE, { base: "Breastplate", bonus: "Rare" }), "Rare armor", "+1 Armor est Rare");
  assert.equal(r(PLAN_ARME, { base: "Longsword", bonus: "Uncommon" }), "Uncommon weapon");
  assert.equal(r(PLAN_ARME, { base: "Longsword", bonus: "Very Rare" }), "Very Rare weapon");
});

test("26 — ⚖️ L'APERÇU X1 DU JETON : Close seul, Equip · Attune · Lock grisés, le reste retiré", async () => {
  /* ⚖️ Eric, 25/09 : « une fiche X1 avec uniquement un back, options de lock, attune, wear
     grisées ». ⭐ `Close` et pas `Back` : `Back` est exclusif à la coquille. */
  const { construireLaFicheX1 } = await import("../ui/builder/x1-ecran.mjs");
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try {
    const { noeud } = construireLaFicheX1({ apercu: true, objet: { nom: "Breastplate +1", qte: 1, prose: "AC: 15" } });
    const par = (id) => noeud.querySelector(`[data-organe="${id}"]`);
    for (const id of ["equip-on", "attune-on", "lock-on"]) {
      assert.ok(par(id), `${id} est là`);
      assert.equal(par(id).disabled, true, `⛔ ${id} est GRISÉ, pas retiré`);
    }
    assert.ok(par("close") && !par("close").hidden, "⭐ Close reste");
    for (const id of ["use", "envoyer", "trash", "send-vers", "is-quoi", "copier", "oeil"]) {
      const e = par(id);
      assert.ok(!e || e.hidden === true, `⛔ ${id} est retiré de l'aperçu`);
    }
    const normal = construireLaFicheX1({ objet: { nom: "Breastplate", qte: 1 } }).noeud;
    assert.equal(normal.querySelector('[data-organe="trash"]').hidden, false, "⚔️ témoin : hors aperçu, rien ne se retire");
  } finally { if (avant === undefined) delete globalThis.document; else globalThis.document = avant; }
});

/* ══ LOT 271 — LES RETOUCHES D'ERIC DU 25/09 ═══════════════════════════════════ */

test("27 — ⚖️ LES TROIS INTERSTICES DES SIX BOÎTES DE CHOIX SONT SUR UNE VERTICALE", () => {
  /* ⚖️ « essaie d'aligner les 3 interstices verticaux des 6 boîtes de choix ». */
  const par = (n) => D.ORGANES.find((o) => o.nom === n);
  const fente = (g, d) => `${par(g).x + par(g).l}→${par(d).x}`;
  const a = fente("ITEM", "BONUS");
  assert.equal(fente("POWER 1", "POWER 2"), a);
  assert.equal(fente("STATUS", "QTY"), a, "⭐ la paire du bas s'aligne sur les colonnes, ⛔ elle ne se centre plus");
});

test("28 — ⚖️ LA BOURSE EST CENTRÉE ENTRE LE JETON ET LE BORD DROIT · 8 blg sous le jeton et au-dessus de l'encart", () => {
  const par = (n) => D.ORGANES.find((o) => o.nom === n);
  const j = par("JETON"), p = par("PURSE");
  assert.equal(p.x + p.l / 2, (j.x + j.l + D.DALLE.l - D.MARGE_COTE) / 2, "« centrée entre breastplate et le bord droit »");
  const basJeton = Math.max(j.y + j.h, p.y + p.h);
  assert.equal(par("CANCEL").cible.y - basJeton, 8, "⚖️ « 8 blg sous le token »");
  assert.equal(par("ENCART").y - (par("STATUS").cible.y + par("STATUS").cible.h), 8, "⚖️ « 8 blg au-dessus de l'encart »");
});

test("29 — ⭐ LA PHRASE EST BLEUE (`--info`, l'encre de l'aiguilleur) et la partie inférieure ne bouge pas", () => {
  assert.match(CSS, /\.x5-phrase\s*\{[^}]*color:\s*var\(--info\)/, "⚖️ « le texte en bleu explique un peu »");
  /* « partie inférieure identique » : la feuille pose le jeton, la bourse et le pied à la MÊME
     cote quel que soit le régime — ⛔ aucune règle ne dépend du statut. */
  assert.doesNotMatch(feuilleDesCotesX5(), /data-status/, "⛔ aucune cote ne suit le statut");
  const craft = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword" } });
  const trouve = monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques, choix: { base: "Longsword", status: "Found" } });
  const pied = (n) => ["JETON", "purse", "CANCEL", "SEND TO", "SEND"].map((o) => Boolean(n.noeud.querySelector(`[data-organe="${o}"]`)));
  assert.deepEqual(pied(trouve), pied(craft), "les mêmes organes en bas, dans les deux régimes");
});

test("30 — ⚖️ LA MARGE CENTRALE DE L'ENCART EST DANS L'AXE DE L'INTERSTICE DES SIX BOÎTES", () => {
  /* ⚖️ « marge centrale de l'encart plus large et alignée avec l'interstice vertical des 6 boîtes ». */
  const par = (n) => D.ORGANES.find((o) => o.nom === n);
  const axe = (par("ITEM").x + par("ITEM").l + par("BONUS").x) / 2;
  assert.equal(par("ENCART").x + par("ENCART").l / 2, axe,
    "📏 l'encart et l'interstice ont le même centre — deux colonnes égales y posent leur marge");
  const regle = /\.x5-encart\s*\{([^}]*)\}/.exec(CSS.replace(/\/\*[\s\S]*?\*\//g, " "))[1];
  assert.match(regle, /grid-template-columns:\s*1fr 1fr/, "⛔ deux colonnes ÉGALES, sinon la marge quitte l'axe");
  assert.match(regle, /gap:\s*var\(--sp-24\)/, "⚖️ « plus large » : 24");
  assert.match(regle, /center\s*\/\s*1px/, "⭐ le filet est tracé au CENTRE");
});

test("31 — ⚖️ « DÉGAGE LES ASCENSEURS » : une fiche X ne fait pas défiler la scène (lot 272)", () => {
  /* 📏 Le belt rendu mesure 61 à 65, les fiches comptent 60 : la scène gardait 495 à 499 pour
     500 et défilait. ⭐ Ces blg tombent dans le vide sous le pied (X5 occupe 470 / 500). */
  const f = CSS.replace(/\/\*[\s\S]*?\*\//g, " ");
  assert.match(f, /\.stage:has\(:is\(\.x0, \.x1, \.x2, \.x5\)\[data-objet\]\)\s*\{\s*overflow:\s*hidden;?\s*\}/,
    "⛔ la scène d'une fiche X ne défile pas");
  const bas = Math.max(...D.ORGANES.map((o) => { const b = o.cible || o; return b.y + b.h; }));
  assert.ok(D.DALLE.h - bas >= 8, `📏 la marge sous le pied (${D.DALLE.h - bas}) couvre l'écart du belt (≤ 5) : rien de lu n'est coupé`);
});

/* ══ LOT 277 — LE BLUEPRINT À VARIANTE ═══════════════════════════════════════════
   ⚖️ Eric, 25/09 : « T'as 127 wondrous en blueprint ? Sur lesquels il y a un choix à
   faire ? » → cinq wondrous, « inclue les potions », « et la wand » ; puis au schéma
   `Ioun Stone ▾ / Variant ▾ / Crafting · Qty / encart / jeton · bourse / pied` :
   « oui c'est ça ». */

test("32 — ⚖️ LES HUIT PLANS À VARIANTE, lus dans leurs records — ⛔ aucune liste de noms", () => {
  assert.deepEqual(PLANS_A_VARIANTE.map((r) => r.data.name).sort(), [
    "Belt of Giant Strength", "Feather Token", "Figurine of Wondrous Power", "Horn of Valhalla",
    "Ioun Stone", "Potion of Giant Strength", "Potions of Healing", "Wand of the War Mage, +1, +2, or +3",
  ], "⭐ les cinq wondrous d'Eric, les deux potions, la wand — ⛔ aucun plan à base (Weapon, Armor, Ammunition…)");
  /* ⭐ les trois formes du SRD sont lues : la rareté, la table, les paragraphes */
  const mots = (n) => variantesDe(plans.get(n).data).map((v) => `${v.mot}:${v.rarete}`);
  assert.deepEqual(mots("Horn of Valhalla"), ["Silver:Rare", "Brass:Rare", "Bronze:Very Rare", "Iron:Legendary"]);
  assert.deepEqual(mots("Belt of Giant Strength"),
    ["Hill:Rare", "Frost or Stone:Very Rare", "Fire:Very Rare", "Cloud:Legendary", "Storm:Legendary"]);
  /* 🔴 LOT 282 — 14, pas 13 : « Mastery (Legendary). » est COLLÉ au paragraphe de Leadership
     dans la couche SRD ; l'inventaire des effets l'a révélé. La lecture ne se fie plus aux sauts
     de ligne. */
  assert.equal(mots("Ioun Stone").length, 14);
  assert.ok(mots("Ioun Stone").includes("Mastery:Legendary"), "⭐ la pierre collée est lue");
  assert.ok(mots("Ioun Stone").includes("Awareness:Rare"));
  assert.deepEqual(mots("Potions of Healing"), ["Standard:Common", "Greater:Uncommon", "Superior:Rare", "Supreme:Very Rare"]);
  assert.deepEqual(mots("Wand of the War Mage, +1, +2, or +3"), ["+1:Uncommon", "+2:Rare", "+3:Very Rare"]);
  /* ⛔ et un objet fini n'a pas de variante */
  for (const n of ["Bag of Holding", "Dagger of Venom", "Cloak of Protection"]) {
    if (plans.get(n)) assert.deepEqual(variantesDe(plans.get(n).data), [], `${n} est un objet fini`);
  }
});

test("33 — ⚖️ LA FICHE : Blueprint · PLAN · VARIANT · Crafting · Qty — ⛔ ni TYPE, ni ITEM, ni BONUS, ni POWER", () => {
  const { noeud } = monte({ plan: plans.get("Ioun Stone"), plansFreres: PLANS_A_VARIANTE, valeurDe,
    choix: { variante: "Awareness" } });
  assert.equal(noeud.dataset.famille, "variante");
  assert.equal(noeud.dataset.pouvoirs, "aucun", "⭐ la rangée des pouvoirs n'existe pas : tout remonte");
  const vus = organes(noeud);
  for (const absent of ["TYPE", "ITEM", "BONUS", "POWER 1", "POWER 2"]) assert.ok(!vus.includes(absent), `⛔ ${absent}`);
  const plan = noeud.querySelector('[data-organe="PLAN"]');
  const choisie = (sel) => [...sel.querySelectorAll("option")].find((o) => o.selected);
  assert.equal(choisie(plan).value, "Ioun Stone");
  assert.deepEqual([...plan.querySelectorAll("option")].map((o) => o.textContent),
    ["Belt of Giant Strength", "Feather Token", "Figurine of Wondrous Power", "Horn of Valhalla", "Ioun Stone"],
    "⭐ le menu PLAN porte les frères de CATÉGORIE — les cinq wondrous, ⛔ ni potion ni wand");
  const variante = noeud.querySelector('[data-organe="VARIANT"]');
  assert.equal(choisie(variante).value, "Awareness");
  assert.equal(variante.querySelectorAll("option").length, 14, "les 14 pierres, Mastery comprise (lot 282)");
  assert.match(noeud.querySelector('[data-organe="JETON"]').textContent, /Ioun Stone \(Awareness\)/);
});

test("34 — ⚖️ LE PRIX : la valeur de l'objet FINI (celle de Wares), fabriqué à moitié — et la rareté LUE", () => {
  /* ⭐ Ioun Stone (Awareness) est Rare : 4 000 GP au barème du SRD, 2 000 à fabriquer. */
  const { noeud, cote } = monte({ plan: plans.get("Ioun Stone"), plansFreres: PLANS_A_VARIANTE, valeurDe,
    choix: { variante: "Awareness", qte: 2 }, fh: true });
  assert.equal(cote.venteUnitaire, 4000);
  assert.equal(cote.craftTotal, 4000, "2 × 2 000");
  const texte = noeud.querySelector('[data-organe="ENCART"]').textContent;
  assert.match(texte, /Enchanting2,000 GP/);
  assert.doesNotMatch(texte, /Base item/, "⛔ une variante n'a pas de base à fabriquer");
  assert.match(texte, /Rare wondrous item/);
  assert.match(texte, /50 days/, "⭐ le temps du barème SRFH pour Rare (lot 280 — le 3 days du lot 277 était celui de la forge)");
  /* 🔴 LA POTION : Rare, vendue à MOITIÉ (`value_footnote`) — et elle reste « Rare » */
  const p = monte({ plan: plans.get("Potions of Healing"), plansFreres: PLANS_A_VARIANTE, valeurDe,
    choix: { variante: "Superior" } });
  assert.equal(p.cote.venteUnitaire, 2000, "une potion Rare vaut 2 000, pas 4 000");
  assert.match(p.noeud.querySelector('[data-organe="ENCART"]').textContent, /Rare potion/,
    "⛔ déduite du prix, la rareté aurait dit « Uncommon »");
  /* ⭐ Standard : la potion de soin commune, 50 GP — le prix même de l'Adventuring Gear */
  const s = monte({ plan: plans.get("Potions of Healing"), plansFreres: PLANS_A_VARIANTE, valeurDe,
    choix: { variante: "Standard" } });
  assert.equal(s.cote.venteUnitaire, 50);
  /* ⚖️ LOT 280 — et SON temps est celui du brassage (1 jour), le même que sa note de craft :
     ⛔ pas les 3 jours d'un Common consommable. Un seul écrivain, `noteDeCraft`. */
  assert.equal(s.cote.temps, "1 day");
  assert.equal(p.cote.temps, "25 days", "Superior : Rare consommable, 50 ÷ 2");
});

test("35 — ⭐ `SEND` REND LE PLAN, LA VARIANTE ET LE MONTANT — le jeton rend l'aperçu", () => {
  let envoi = null, apercu = null;
  const { noeud } = monte({ plan: plans.get("Horn of Valhalla"), plansFreres: PLANS_A_VARIANTE, valeurDe,
    choix: { variante: "Bronze", destination: "backpack" },
    surEnvoyer: (e) => { envoi = e; }, surJeton: (a) => { apercu = a; } });
  const send = noeud.querySelector('[data-organe="SEND"]');
  assert.equal(send.disabled, false);
  send.dispatchEvent(new Event("click"));
  assert.equal(envoi.plan.data.name, "Horn of Valhalla");
  assert.equal(envoi.variante.mot, "Bronze");
  assert.deepEqual(envoi.cout, enPieces(20000), "Very Rare 40 000, fabriqué 20 000");
  noeud.querySelector('[data-organe="JETON"]').dispatchEvent(new Event("click"));
  assert.equal(apercu.nom, "Horn of Valhalla (Bronze)");
  /* ⛔ sans valeur lisible, `Send` ne s'arme pas — et il dit pourquoi */
  const muet = monte({ plan: plans.get("Horn of Valhalla"), choix: {}, surEnvoyer: () => {} }).noeud;
  assert.equal(muet.querySelector('[data-organe="SEND"]').disabled, true);
  assert.match(muet.querySelector('[data-organe="SEND"]').title, /no readable value/);
});

/* ══ LOT 283 — LES PROJECTILES ════════════════════════════════════════════════════
   ⚖️ Eric, 24/09 : « pour les projectiles on a décidé 10 mais on ne paye qu'une fois le
   montant · je veux pas qu'une tuile puisse sortir du craft avec plus de 10 ». */

test("36 — ⚖️ LE BLUEPRINT DES FLÈCHES +1 : les munitions en ITEM, un lot de dix, payé une fois", () => {
  const recus = [];
  const PLAN_MUN = plans.get("Ammunition, +1, +2, or +3");
  const ouvre = (choix) => monte({ plan: PLAN_MUN, bases, itemsMagiques: magiques, choix,
    surEnvoyer: (e) => recus.push(e), surChoix: () => {} });
  const { noeud, cote } = ouvre({ base: "Arrows", bonus: "Uncommon" });
  const options = (organe) => [...noeud.querySelector(`[data-organe="${organe}"]`).querySelectorAll("option")]
    .map((o) => o.textContent);
  assert.deepEqual(options("ITEM").sort(), bases.filter(estBaseDeMunition).map((b) => b.data.name).sort(),
    "⭐ le menu ITEM = les munitions de la pile");
  assert.deepEqual(options("BONUS"), ["—", "+1", "+2", "+3"]);
  assert.ok(options("POWER 1").includes("Ammunition of Slaying"), "⭐ POWER : Slaying");
  const qteChoisie = (n) => [...n.querySelector('[data-organe="QTY"]').querySelectorAll("option")].find((o) => o.selected).value;
  assert.equal(qteChoisie(noeud), "10", "⚖️ le blueprint s'ouvre sur un lot de DIX");
  assert.equal(noeud.querySelector('[data-organe="JETON"]').getAttribute("aria-label"), "Arrows +1 — preview",
    "⭐ le nom posé : « Arrows +1 »");
  assert.match(noeud.querySelector('[data-organe="ENCART"]').textContent, /Qty 10 · Total/);
  assert.equal(cote.qte, 10);
  assert.equal(cote.paiements, 1, "⚖️ UN paiement pour dix");
  noeud.querySelector('[data-organe="SEND"]').dispatchEvent(new Event("click"));
  assert.equal(recus[0].cote.qte, 10, "⭐ `Send` pose une ligne de DIX");
  assert.deepEqual(recus[0].cout, enPieces(100.25), "📏 Crafting : 200 ÷ 2 + 5 SP ÷ 2 = 100,25 → 100 GP, une fois");
  /* ⚖️ moins de dix se choisit, et paie le lot — plus de dix ne sort jamais */
  recus.length = 0;
  ouvre({ base: "Arrows", bonus: "Uncommon", qte: 3 }).noeud.querySelector('[data-organe="SEND"]').dispatchEvent(new Event("click"));
  assert.equal(recus[0].cote.qte, 3);
  assert.deepEqual(recus[0].cout, enPieces(100.25), "⭐ trois flèches paient le lot, pas trois fois");
  assert.equal(ouvre({ base: "Arrows", bonus: "Uncommon", qte: 40 }).cote.qte, 10, "⛔ jamais plus de dix");
  /* ⚖️ Buying : le prix d'achat, une fois — 200,5 → 201 GP */
  recus.length = 0;
  ouvre({ base: "Arrows", bonus: "Uncommon", status: "Buying" }).noeud.querySelector('[data-organe="SEND"]').dispatchEvent(new Event("click"));
  assert.deepEqual(recus[0].cout, enPieces(200.5));
  /* ⭐ une arme s'ouvre toujours sur UNE pièce */
  assert.equal(qteChoisie(monte({ plan: PLAN_ARME, bases, itemsMagiques: magiques,
    choix: { base: "Longsword", bonus: "Uncommon" } }).noeud), "1");
});

test("37 — ⭐ LE PILOTE DONNE LES MUNITIONS À X5, ET LA FICHE X1 D'UNE LIGNE CRAFTÉE COMPTE PAR LOT", () => {
  /* ⛔ Ce garde lit le code SANS ses commentaires. */
  const src = fs.readFileSync(path.join(ROOT, "ui", "builder", "equipment-step.mjs"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  assert.match(src, /const basesDuCraft = \[[^\]]*lireRecords\("gear"\)\.filter\(estBaseDeMunition\)\]/,
    "⭐ `basesDuCraft` prend les munitions par la règle du moteur — ⛔ aucune liste de noms");
  const x1 = src.slice(src.indexOf("function construireX1()"), src.indexOf("function construireX1()") + 3000);
  assert.match(x1, /const fois = recetteDeLaLigne\(ligne\) \? paiementsDe\(rec, qte\) : qte;/,
    "⚖️ une ligne craftée de dix flèches coûte UN lot — ⛔ pas dix fois le prix du lot");
  assert.match(x1, /multiplieCout\(cout, fois\)/);
  const apercu = src.slice(src.indexOf("function construireApercuX5()"), src.indexOf("function construireVue("));
  assert.match(apercu, /multiplieCout\(coutLu, a\.cote && a\.cote\.paiements \? a\.cote\.paiements : qte\)/,
    "⚖️ l'aperçu du jeton dit le total que `Send` paiera");
});
