/* ══ LES GEMMES DE FATE'S HAND — LOT 181 ═══════════════════════════════════
   Eric a dicté 54 gemmes le 2026-09-08, de l'azurite à 10 po au diamant du
   monarque à 50 000 po. Elles vivaient dans le vault et n'existaient pas dans
   le builder. `layers/fh-gems-en.layer.json` les y porte, au genre `gem` — le
   SECOND genre Fate's Hand après `arcana` — plus un record de RANGEMENT par
   gemme, pour qu'elles apparaissent au catalogue Équipement.

   ⛔ CE FICHIER NE LIT PAS LE VAULT, ET C'EST LA LOI DU DÉPÔT. Écrite en tête
   de `tests/fh-changes.test.mjs` : « ILS NE LISENT PAS LE DÉPÔT VOISIN. Deux
   fois dans la journée du 20/08, une suite verte est passée au rouge parce
   qu'elle lisait l'ARBRE DE TRAVAIL d'à côté — un dépôt dont ni la branche ni
   la propreté ne nous appartiennent ». `~/obsidian-vault` est pire encore :
   un plugin y committe tout seul.

   ➡️ CE QUI EST DONC VÉRIFIABLE ICI, ET CE FICHIER LE FAIT DANS CET ORDRE :
     ① LA COUCHE COMMITÉE — 54 gemmes, 12 paliers, les comptes par palier, et
       le prix qui se RELIT dans l'autre sens par le lecteur du produit ;
     ② LE RANGEMENT — une bijection avec les gemmes, lue dans les DEUX SENS ;
     ③ LES REFUS DU GÉNÉRATEUR — éprouvés sur des sources FABRIQUÉES, jamais
       en attendant que le vault se salisse un jour ;
     ④ LA FRONTIÈRE — ce que la couche NE porte PAS, et qui doit le rester.

   📌 LE VAULT, LUI, EST TENU PAR `EMPREINTE_SOURCE` dans le générateur : une
   source qui bouge ARRÊTE la passe et demande une relecture. C'est la moitié
   qui ne se teste pas ici, et elle est gardée là-bas. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  GEMMES_DU_LIVRE,
  PALIERS_DU_LIVRE,
  construireCouche, prixSrd, assertEmpreinteSource, ETAGERE_DES_GEMMES, TAGS_DES_GEMMES,
  CHAMPS_REFUSES_LANGUE, LAYER, GemError
} from "../src/tools/gen-fh-gems-layer.mjs";
import { GENRES } from "../src/layers/document.mjs";
import { readLayer } from "../src/layers/document.mjs";
import { parseCout, parsePoids } from "../ui/builder/equipement-pipeline.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHEMIN = join(ROOT, "layers", "fh-gems-en.layer.json");
const COUCHE = JSON.parse(readFileSync(CHEMIN, "utf8"));
const GEMMES = COUCHE.records.gem;
const RANGEMENTS = COUCHE.records.shelving;

/* Les douze paliers d'Eric, et le nombre de gemmes que chacun porte —
   `_meta.rollNote` : « 5 gemmes par palier, sauf les trois derniers (10 000 ·
   25 000 · 50 000 gp) qui en portent 3 ». C'est la seule chose de ce fichier
   qui soit recopiée du vault, et c'est délibéré : un test qui déduirait les
   paliers de la couche qu'il vérifie ne vérifierait rien. */
const PALIERS = {
  10: 5, 50: 5, 100: 5, 250: 5, 500: 5, 750: 5,
  1000: 5, 2500: 5, 5000: 5, 10000: 3, 25000: 3, 50000: 3
};

/* ══ ① LA COUCHE COMMITÉE ════════════════════════════════════════════════ */

test("témoin — la couche existe, se valide au contrat, et elle est DANS LA PILE", () => {
  /* ⚔️ SANS CE TÉMOIN, tout ce fichier pourrait être vert sur une couche que
     personne ne monte : 54 records parfaits et invisibles à l'écran. */
  const lu = readLayer(readFileSync(CHEMIN), "fh-gems-en.layer.json");
  assert.deepEqual(lu.counts, { gem: 54, shelving: 54 });
  assert.equal(COUCHE.schema, LAYER.schema);
  assert.equal(COUCHE.id, LAYER.id);
  assert.equal(COUCHE.lang, "en");
  assert.deepEqual(COUCHE.flags, ["fh.gems"]);
  assert.equal(COUCHE.attribution.license, "all-rights-reserved");
  assert.ok(PILE.includes("layers/fh-gems-en.layer.json"),
    "la couche n'est pas dans la pile — 54 gemmes que le builder ne monte pas");
});

test("témoin — `gem` est un GENRE du contrat, et il ne s'est pas ouvert tout seul", () => {
  /* ⚔️ La couche ne PEUT PAS se charger si le contrat ignore le genre — c'est
     le refus construit au lot 93 et qui a mordu au lot 101. Ce témoin dit que
     la révision de `fh-layer/1` a bien eu lieu, pas qu'elle a été contournée. */
  assert.ok(GENRES.includes("gem"), "`gem` doit être déclaré dans `src/layers/document.mjs`");
});

test("🔴 LES 54 GEMMES, PALIER PAR PALIER — un total juste ne dirait rien du contenu", () => {
  /* ⚠️ 54 se lit aussi bien « 12 paliers d'Eric » que « 54 azurites ». Le
     compte par palier est le seul qui dise quelque chose. */
  const parPalier = {};
  for (const entree of Object.values(GEMMES)) {
    parPalier[entree.data.value_gp] = (parPalier[entree.data.value_gp] || 0) + 1;
  }
  assert.deepEqual(parPalier, PALIERS);
  assert.equal(Object.keys(GEMMES).length, 54);
  assert.equal(Object.values(PALIERS).reduce((a, b) => a + b, 0), 54,
    "témoin d'arithmétique : 9 × 5 + 3 × 3 = 54");
});

test("🔴 UN PALIER, UN NOM DE PALIER — et douze noms distincts", () => {
  /* Une gemme à 250 po ne peut pas être « Rare » ici et « Fine » là : le nom
     du palier est une fonction de sa valeur, et rien d'autre. */
  const nomParValeur = new Map();
  for (const entree of Object.values(GEMMES)) {
    const { value_gp: valeur, tier: nom } = entree.data;
    if (nomParValeur.has(valeur)) {
      assert.equal(nomParValeur.get(valeur), nom, `deux noms pour le palier ${valeur} po`);
    } else nomParValeur.set(valeur, nom);
  }
  assert.equal(new Set(nomParValeur.values()).size, 12, "douze paliers, douze noms — aucun homonyme");
});

test("🔴 LE PRIX SE RELIT DANS L'AUTRE SENS, PAR LE LECTEUR DU PRODUIT", () => {
  /* ⭐ C'EST LA SECONDE LECTURE, ET ELLE SEULE ATTRAPE UNE BIJECTION FAUSSE.
     `data.cost` est une CHAÎNE mise en forme (« 1,000 GP ») ; `value_gp` est
     le nombre. Le garde ne compare pas la chaîne à elle-même : il la fait
     relire par `parseCout` — le lecteur que l'écran d'équipement emploie
     vraiment (lot 180) — et exige le nombre d'origine.
     ⚠️ Sans lui, « 1000 GP » aurait passé (typographie fausse, prix juste) et
     une virgule mal placée aurait passé aussi (« 1,00,0 GP »). */
  for (const [id, entree] of Object.entries(GEMMES)) {
    const lu = parseCout(entree.data.cost);
    assert.ok(lu, `${id} : « ${entree.data.cost} » n'est pas un prix lisible par l'écran`);
    assert.equal(lu.gp, entree.data.value_gp, `${id} : le prix affiché et \`value_gp\` divergent`);
    assert.deepEqual([lu.pp, lu.sp, lu.cp], [0, 0, 0], `${id} : une gemme se paie en or, pas en cuivre`);
  }
});

test("🔴 LE POIDS EST « — », LE SIGNE DU SRD — ET CE N'EST PAS ZÉRO", () => {
  /* ⚖️ RATIFICATION D'ERIC, 2026-09-08 : « on garde « — ». Une gemme EST
     négligeable en livres, et c'est le mot du livre ». La plus petite fraction
     que le SRD anglais écrit est 1/4 lb. (113 g) ; aucune gemme ne l'atteint.
     ⛔ ET « — » N'EST PAS ZÉRO : `parsePoids` le REFUSE (il rend `null`, pas
     0), et les quatre poids chiffrés voyagent avec le record — c'est sur eux
     qu'un sac se sommera. Un garde qui vérifierait seulement l'affichage
     laisserait partir une gemme sans masse. */
  const plancher = 0.5; // g — `_meta.weightFloor_g`, règle d'Eric du 2026-09-08
  for (const [id, entree] of Object.entries(GEMMES)) {
    const d = entree.data;
    assert.equal(d.weight, "—", `${id} : le poids imperial doit être le tiret du SRD`);
    assert.equal(d.display.imperial, "—", `${id} : et l'affichage dit la même chose`);
    assert.equal(parsePoids(d.weight), null, `${id} : « — » se REFUSE, il ne vaut pas 0`);
    assert.ok(d.weight_g >= plancher, `${id} : ${d.weight_g} g est sous le plancher de ${plancher} g`);
    assert.ok(d.weight_lb > 0 && d.weight_kg > 0 && d.weight_oz > 0,
      `${id} : « — » à l'écran, mais la masse chiffrée doit exister`);
    assert.ok(parsePoids(d.display.metric), `${id} : l'affichage métrique doit rester lisible`);
    assert.equal(parsePoids(d.display.metric).valeur, d.weight_g / 1000,
      `${id} : l'affichage métrique et \`weight_g\` doivent dire la même masse`);
  }
});

/* ══ ② LE RANGEMENT — LA BIJECTION, LUE DANS LES DEUX SENS ══════════════ */

test("🔴 UNE GEMME, UN RANGEMENT — la bijection lue dans les DEUX sens", () => {
  /* ⚠️ UNE BIJECTION FAUSSE EST COHÉRENTE tant qu'on ne la relit que dans un
     sens : 54 rangements pour 54 gemmes peut vouloir dire « deux rangements
     sur une gemme et zéro sur une autre ». Les deux sens, donc. */
  const visees = Object.values(RANGEMENTS).map((r) => r.data.extends);
  assert.equal(new Set(visees).size, 54, "aucune gemme n'est rangée deux fois");
  for (const vise of visees) {
    assert.ok(GEMMES[vise], `le rangement vise « ${vise} », qui n'est pas une gemme de cette couche`);
  }
  for (const id of Object.keys(GEMMES)) {
    assert.ok(visees.includes(id), `la gemme « ${id} » n'a AUCUN rangement — elle serait invisible au catalogue`);
  }
});

test("🔴 LES RANGEMENTS PORTENT LE PRÉFIXE `fh:`, JAMAIS `srfh:`", () => {
  /* ⛔ ET CE N'EST PAS UNE COQUETTERIE D'IDENTIFIANT. `srfh-shelving-en` monte
     dans les DEUX piles nommées — un joueur en « SRD seul » la garde (voir
     `SRFH_LAYER_IDS`). Un rangement de gemme logé là-bas pointerait, sur cette
     pile, vers un `extends` que rien ne résout : `lireRangement` le compterait
     dans `introuvables`, et 54 objets disparaîtraient en silence du catalogue
     de tous ceux qui jouent SRD. */
  for (const id of Object.keys(RANGEMENTS)) {
    assert.match(id, /^fh:shelving:en:/, `« ${id} » n'appartient pas à une couche Fate's Hand`);
  }
});

test("🔴 L'ÉTAGÈRE EST UNE SEULE CHAÎNE, ET C'EST L'ARBITRAGE OUVERT D'ERIC", () => {
  /* 🔴 LE SEUL POINT OUVERT DU LOT. Deux paroles d'Eric se contredisent :
       · 2026-08-21/22, ÉCRIT — sa structure déclare `crafting › gems`, à zéro ;
       · 2026-09-08, DIT — « les gemmes doivent être dans l'équipement :
         valuables », étagère qui n'existe dans AUCUN record de rangement.
     La décision écrite est posée, et elle tient dans UNE chaîne
     (`ETAGERE_DES_GEMMES`) : la changer et regénérer déplace les 54 gemmes.
     ⛔ Ce test la lit dans le générateur ET dans la couche produite — il
     interdit qu'une seconde écriture apparaisse ailleurs, ce qui rouvrirait le
     défaut `ETAGERE_DE` retiré au lot 95. */
  const [rayon, etagere] = ETAGERE_DES_GEMMES.split(":");
  assert.equal(ETAGERE_DES_GEMMES, "trade-goods:trade-goods",
    "⚖️ TRANCHÉ par Eric le 2026-09-09 : « remplace mes valuables par trade goods, même étagère "
    + "partout ». ⭐ LE MOT EST CELUI DU LIVRE — le SRD 5.2 porte 23 marchandises typées TG — et "
    + "`valuables` était une invention de l'architecte (loi §0.12 : le mot est celui du SRD). "
    + "UNE SEULE étagère : les 54 gemmes FH et les 23 marchandises SRD s'y rangent ENSEMBLE");
  const posees = new Set();
  for (const [id, entree] of Object.entries(RANGEMENTS)) {
    assert.equal(entree.data.of_kind, "gem", `${id} : le rangement doit dire le genre qu'il habille`);
    posees.add(`${entree.data.shelf.aisle}:${entree.data.shelf.shelf}`);
    /* 🔄 08/09 → 09/09. La décision qui FAIT LOI est celle du 09/09 — « remplace mes
       valuables par trade goods, même étagère partout ». Celle du 08/09 (« valuables »)
       est la décision REMPLACÉE : la citer suffisait hier, elle ferait passer le garde
       pour la mauvaise raison aujourd'hui. */
    assert.match(entree.data.shelf.provenance, /2026-09-09/,
      `${id} : la provenance doit citer la décision QUI FAIT LOI (2026-09-09, « trade goods »),
       pas seulement celle qu'elle remplace — sinon le garde passe pour la mauvaise raison`);
    assert.match(entree.data.shelf.provenance, /MOT EST CELUI DU LIVRE/,
      `${id} : et elle doit dire POURQUOI — le SRD porte 23 marchandises typées TG, donc le mot
       vient du livre et non de l'architecte (loi §0.12)`);
  }
  assert.deepEqual([...posees], [`${rayon}:${etagere}`],
    "les 54 gemmes sont sur UNE seule étagère, celle que le générateur déclare");
});

/* 🏷️ LES DEUX TAGS — Eric, 2026-09-08 : *« tag valuables, tag Soulforging »*.
   ⭐ POURQUOI CE TÉMOIN EXISTE : l'étagère répond à « où la trouve-t-on ? », les
   tags à « à quoi sert-elle ? ». Une gemme se VEND et alimente la FORGE, et un
   record n'a qu'une étagère — sans les tags, la moitié de sa vocation serait
   perdue au rangement. ⛔ Le témoin se fonde sur la DONNÉE, pas sur la forme :
   il exige les deux tags sur les 54, dans cet ordre, avec leur provenance.
   ⚠️ Aucun des 416 records `srfh` ne porte de `tags` : ce champ est neuf, donc
   c'est ici qu'on l'empêche de dériver. */
test("🏷️ LES 54 GEMMES PORTENT LES DEUX TAGS D'ERIC, avec leur provenance", () => {
  const attendus = ["trade-goods", "soulforging"];
  assert.deepEqual([...TAGS_DES_GEMMES], attendus,
    "⚖️ Eric, 2026-09-08 : « tag valuables, tag Soulforging » — dans cet ordre, et il n'y en a pas un troisième");

  const vus = new Set();
  for (const [id, entree] of Object.entries(RANGEMENTS)) {
    const t = entree.data.tags;
    assert.ok(t && Array.isArray(t.value), `${id} : un rangement de gemme doit porter ses tags`);
    assert.deepEqual(t.value, attendus, `${id} : les deux tags, et rien d'autre`);
    /* 🔄 08/09 → 09/09 : Eric a ÉLARGI le sens du tag ce jour-là — « cet item
       participe au Soulforging, et peut porter un état associé ». Le tag n'est
       plus une propriété de gemme, c'est un marqueur générique. La date suit la
       décision qui FAIT LOI, pas la première qui a posé le champ. */
    assert.match(t.provenance, /2026-09-09/, `${id} : un champ neuf dit QUI l'a demandé et QUAND`);
    assert.match(t.provenance, /participe au Soulforging/,
      `${id} : la provenance doit porter le SENS d'Eric, pas une paraphrase — le tag déclare une
       APTITUDE au catalogue, jamais un état`);
    vus.add(t.value.join(","));
  }
  assert.equal(Object.keys(RANGEMENTS).length, 54, "les 54, aucune oubliée");
  assert.deepEqual([...vus], [attendus.join(",")], "un seul jeu de tags sur les 54 — aucune dérive");
});

/* ══ ③ LES REFUS DU GÉNÉRATEUR, ÉPROUVÉS ═══════════════════════════════ */

/** Une source minimale et VALIDE — le témoin sans lequel les attaques ne
 *  prouvent rien : un refus qui refuse tout n'est pas un refus. */
function sourceSaine() {
  return {
    _meta: { count: 1, tiers_gp: [10], weightFloor_g: 0.5 },
    gems: [{
      id: "fh:gem:en:azurite", die: "d5", roll: 1,
      name_en: "Azurite", name_fr: "Azurite", value_gp: 10,
      tier_en: "Common Gems", tier_fr: "Gemmes communes",
      weight_g: 10, weight_kg: 0.01, weight_lb: 0.022, weight_oz: 0.35,
      weight_provenance: "Eric, 2026-09-08",
      display: { metric: "10 g", imperial: "—" }
    }],
    retired_gems: [{ id: "fh:gem:en:agate" }]
  };
}

test("témoin — une source saine PASSE, et elle produit les deux records", () => {
  const { layer, compte, parPalier } = construireCouche(sourceSaine());
  assert.equal(compte, 1);
  assert.deepEqual(parPalier, { 10: 1 });
  assert.deepEqual(Object.keys(layer.records.gem), ["fh:gem:en:azurite"]);
  assert.deepEqual(Object.keys(layer.records.shelving), ["fh:shelving:en:azurite"]);
});

test("⚔️ ATTAQUE — une source vide est REFUSÉE : un vide n'est pas une réponse", () => {
  assert.throws(() => construireCouche({ _meta: {}, gems: [] }), GemError);
  assert.throws(() => construireCouche({ _meta: {} }), /aucune gemme/);
});

test("⚔️ ATTAQUE — un compte DÉCLARÉ qui ment sur le compte MESURÉ est vu", () => {
  const s = sourceSaine();
  s._meta.count = 54;
  assert.throws(() => construireCouche(s), /54 gemmes, la liste en porte 1/);
});

test("⚔️ ATTAQUE — un palier hors de `_meta.tiers_gp`, ET un palier déclaré resté VIDE", () => {
  /* Les deux sens, encore. Le premier attrape une gemme égarée ; le second
     attrape un palier qu'on aurait vidé sans s'en apercevoir — et lui seul. */
  const egaree = sourceSaine();
  egaree.gems[0].value_gp = 42;
  assert.throws(() => construireCouche(egaree), /42 po, qui n'est pas un palier déclaré/);

  const vide = sourceSaine();
  vide._meta.tiers_gp = [10, 50];
  assert.throws(() => construireCouche(vide), /sans aucune gemme — 50 po/);
});

test("⚔️ ATTAQUE — un champ manquant fait JETER en nommant la gemme ET le champ", () => {
  for (const champ of ["value_gp", "weight_g", "display", "tier_en", "weight_provenance"]) {
    const s = sourceSaine();
    delete s.gems[0][champ];
    assert.throws(() => construireCouche(s),
      (e) => e.message.includes(champ) && e.message.includes("azurite"),
      `un « ${champ} » absent doit être nommé, avec sa gemme`);
  }
});

test("⚔️ ATTAQUE — un poids SOUS le plancher de 0,5 g d'Eric est refusé", () => {
  const s = sourceSaine();
  s.gems[0].weight_g = 0.2;
  assert.throws(() => construireCouche(s), /sous le plancher de 0.5 g/);
});

test("⚔️ ATTAQUE — une gemme ÉCARTÉE qui remonterait dans la liste active est vue", () => {
  /* `_meta.retiredNote` : « aucun lecteur ne doit les charger ». Ce garde le
     PROUVE au lieu de le promettre — la réserve reste une réserve. */
  const s = sourceSaine();
  s.retired_gems = [{ id: "fh:gem:en:azurite" }];
  assert.throws(() => construireCouche(s), /ÉCARTÉE.*fh:gem:en:azurite/s);
});

test("⚔️ ATTAQUE — un id dupliqué, et un id mal formé", () => {
  const double = sourceSaine();
  double._meta.count = 2;
  double.gems.push({ ...double.gems[0] });
  assert.throws(() => construireCouche(double), /apparaît deux fois/);

  const malForme = sourceSaine();
  malForme.gems[0].id = "srd:gear:en:azurite";
  assert.throws(() => construireCouche(malForme), /mal formé/);
});

test("⚔️ ATTAQUE — une étagère qui n'est pas « rayon:étagère » est refusée", () => {
  assert.throws(() => construireCouche(sourceSaine(), { etagere: "valuables" }), /n'est pas une étagère/);
  assert.throws(() => construireCouche(sourceSaine(), { etagere: "a:b:c" }), /n'est pas une étagère/);
  /* ⭐ ET LE TÉMOIN INVERSE : la chaîne est bien le SEUL levier — une autre
     étagère déplace les 54 gemmes sans toucher à rien d'autre. C'est ce qui
     rend l'arbitrage d'Eric praticable en une ligne. */
  const { layer } = construireCouche(sourceSaine(), { etagere: "equipment:valuables" });
  const shelf = layer.records.shelving["fh:shelving:en:azurite"].data.shelf;
  assert.deepEqual([shelf.aisle, shelf.shelf], ["equipment", "valuables"]);
});

test("⚔️ ATTAQUE — l'empreinte de la source du vault refuse une source qui a bougé", () => {
  /* La moitié de ce lot qui ne se teste pas depuis le disque (le vault n'est
     pas à nous) se teste ici, sur la fonction pure. */
  assert.throws(() => assertEmpreinteSource("0".repeat(64), "a".repeat(64)), /a CHANGÉ/);
  assert.doesNotThrow(() => assertEmpreinteSource("a".repeat(64), "a".repeat(64)));
});

test("⚔️ ATTAQUE — `prixSrd` refuse ce qui n'est pas une valeur, et met la virgule du SRD", () => {
  assert.equal(prixSrd(10), "10 GP");
  assert.equal(prixSrd(1000), "1,000 GP");
  assert.equal(prixSrd(50000), "50,000 GP");
  for (const faux of [0, -5, 2.5, NaN, "10", null, undefined]) {
    assert.throws(() => prixSrd(faux), GemError, `« ${faux} » n'est pas une valeur en pièces d'or`);
  }
});

/* ══ ④ LA FRONTIÈRE — CE QUE LA COUCHE NE PORTE PAS ════════════════════ */

test("🔴 AUCUN CHAMP « FORÊT DES DÉMONS » — c'est une propriété d'INSTANCE", () => {
  /* ⚖️ ARBITRAGE D'ERIC, 2026-09-08 : « la même pierre est ordinaire ou de la
     Forêt selon sa provenance ; le catalogue ne peut pas trancher à sa place ».
     La marque vit sur la ligne possédée (`gear[N]`), comme « Soulgem » est un
     ÉTAT et non un objet. ⛔ Une gemme de la Forêt arrive par la table, jamais
     par l'achat : aucune boutique ne la vend.
     ⚔️ Le garde se fonde sur la DONNÉE — il balaie tous les champs de tous les
     records — et pas sur un champ qu'on aurait pensé à nommer. */
  const interdits = /demon|forest|forêt|démon/i;
  const fautes = [];
  for (const [id, entree] of Object.entries(GEMMES)) {
    for (const [champ, valeur] of Object.entries(entree.data)) {
      if (interdits.test(champ)) fautes.push(`${id} → champ ${champ}`);
      if (typeof valeur === "string" && interdits.test(valeur)) fautes.push(`${id} → ${champ} = ${valeur}`);
    }
  }
  assert.deepEqual(fautes, [],
    "la provenance « de la Forêt des Démons » est une propriété de la LIGNE POSSÉDÉE, jamais du catalogue");
  assert.equal(Object.keys(GEMMES).length, 54, "témoin : le balayage a bien parcouru les 54 records");
});

test("🔴 AUCUN FRANÇAIS — une couche ne mélange pas les langues, et le refus est JOURNALISÉ", () => {
  /* La source du vault porte `name_fr` et `tier_fr` à côté de leurs homologues
     anglais. Le contrat fh-layer/1 est explicite : « une couche ne mélange pas
     les langues ». Ils restent au vault jusqu'à ce qu'une `fh-gems-fr` existe.
     ⛔ ET LE REFUS SE COMPTE. Un refus qu'aucun appelant ne peut obtenir est un
     refus que personne ne relit — c'est la leçon des écartés du lot 95. */
  const { refuses } = construireCouche(sourceSaine());
  assert.deepEqual(refuses, CHAMPS_REFUSES_LANGUE);
  assert.deepEqual(refuses.slice().sort(), ["name_fr", "tier_fr"]);

  const fautes = [];
  for (const [id, entree] of Object.entries(GEMMES)) {
    for (const champ of Object.keys(entree.data)) {
      if (/_fr$/.test(champ)) fautes.push(`${id} → ${champ}`);
    }
  }
  assert.deepEqual(fautes, [], "aucun champ français ne doit avoir traversé");
  /* ⚔️ ET LE TÉMOIN QUI PROUVE QUE LA SOURCE LES PORTAIT VRAIMENT — sans lui,
     ce garde serait vert sur une source qui n'en a jamais eu. */
  const source = sourceSaine();
  assert.ok(source.gems[0].name_fr && source.gems[0].tier_fr,
    "la source de référence doit porter les champs français, sinon le refus ne refuse rien");
});

test("🔴 LA COUCHE N'AJOUTE QUE — elle ne patche ni n'éteint aucun record du SRD", () => {
  /* Les 54 gemmes n'existent dans aucun SRD : il n'y a rien à patcher. Un
     `op` qui apparaîtrait ici voudrait dire que quelqu'un a fait passer une
     modification du livre par la porte des gemmes. */
  for (const genre of Object.values(COUCHE.records)) {
    for (const [id, entree] of Object.entries(genre)) {
      assert.equal(entree.op, undefined, `${id} porte un \`op\` — cette couche n'AJOUTE que`);
      assert.match(id, /^fh:/, `${id} ne commence pas par \`fh:\` — un record d'une autre couche`);
    }
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ⚖️ LA SUPERPOSITION — Eric, 09/09 : « FH doit se superposer », « on
   superpose », ⛔ « on ne veut pas de doublons inutiles », et la contrainte
   qui ferme la pile : « que tu puisses désactiver dmg player et toujours te
   raccrocher au SRD ».

   ⚠️ CE QUE CES DEUX GARDES NE FONT PAS : ils n'empêchent pas le doublon —
   rien ne l'empêche aujourd'hui, l'identifiant `fh:` le fabrique. Ils
   GARDENT LA FRONTIÈRE MESURÉE, pour que le jour où le DMG du joueur est
   importé, la liste des collisions soit connue et non re-devinée.
   ══════════════════════════════════════════════════════════════════════════ */

test("⚖️ LES 23 GEMMES DU LIVRE EXISTENT VRAIMENT — une table qui nomme des fantômes ne garde rien", () => {
  const presents = new Set(Object.keys(COUCHE.records.gem).map((id) => id.split(":").pop()));
  const fantomes = Object.keys(GEMMES_DU_LIVRE).filter((slug) => !presents.has(slug));
  assert.deepEqual(fantomes, [],
    "GEMMES_DU_LIVRE nomme des slugs absents de la couche — la frontière a bougé sans que la table suive");
  /* ⚔️ LE TÉMOIN DANS L'AUTRE SENS : la table doit être un SOUS-ensemble STRICT.
     Si elle couvrait les 54, elle ne distinguerait plus rien et passerait au vert
     en ne disant rien. */
  assert.ok(Object.keys(GEMMES_DU_LIVRE).length < presents.size,
    "la table couvre TOUTE la couche : elle ne sépare plus le livre de l'invention de FH");
  assert.equal(Object.keys(GEMMES_DU_LIVRE).length, 23,
    "23 gemmes sur 54 portent un nom du DMG 2024 — mesuré ch. 7 § Gemstones");
});

test("⚖️ UNE GEMME D'UN PALIER PROPRE À FH NE PEUT PAS ÊTRE UNE GEMME DU LIVRE", () => {
  /* 📏 Le DMG range ses gemmes sur 6 paliers. Les 6 autres de l'échelle d'Eric —
     250, 750, 2 500, 10 000, 25 000, 50 000 — sont à FH seul. Une gemme posée là
     ne double personne, par construction. C'est la moitié de la couche qui est
     À L'ABRI du doublon, et le garde la nomme au lieu de la supposer. */
  const horsLivre = [];
  for (const [id, entree] of Object.entries(COUCHE.records.gem)) {
    const slug = id.split(":").pop();
    const gp = entree.data.value_gp;
    if (PALIERS_DU_LIVRE.includes(gp)) continue;
    horsLivre.push(slug);
    assert.equal(GEMMES_DU_LIVRE[slug], undefined,
      `${id} vaut ${gp} gp — un palier que le DMG ne donne à AUCUNE gemme — et pourtant la table le dit du livre`);
  }
  assert.equal(horsLivre.length, 24,
    "24 gemmes vivent sur les 6 paliers propres à FH (250 · 750 · 2 500 · 10 000 · 25 000 · 50 000)");
  /* ⚔️ Et l'autre moitié : les 30 des paliers du livre, dont 23 collisionnent. */
  assert.equal(Object.keys(COUCHE.records.gem).length - horsLivre.length, 30,
    "30 gemmes vivent sur les 6 paliers du livre — 23 y portent son nom, 7 sont des noms de FH");
});

test("⚖️ LE PALIER QUE FH DONNE À UNE GEMME DU LIVRE — deux divergences, et elles sont NOMMÉES", () => {
  /* ⚠️ Ces deux-là sont le seul point que la mesure ne tranche pas : FH ne donne
     pas le même prix que le DMG. La superposition dit que FH est AU-DESSUS, donc
     que son prix gagne — mais c'est une décision de règle, pas de code, et elle
     est portée à Eric. Le garde les FIGE : une troisième divergence apparue en
     silence serait un accident, pas un choix. */
  const divergences = [];
  for (const [slug, palierLivre] of Object.entries(GEMMES_DU_LIVRE)) {
    const entree = COUCHE.records.gem[`fh:gem:en:${slug}`];
    if (entree.data.value_gp !== palierLivre) {
      divergences.push([slug, entree.data.value_gp, palierLivre]);
    }
  }
  assert.deepEqual(divergences.sort(), [
    ["black-opal", 5000, 1000],
    ["chrysoberyl", 500, 100],
  ], "les divergences de prix avec le DMG doivent rester ces deux-là, et aucune autre");
});
