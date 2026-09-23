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
  idCanonique,
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
/* ⚖️ LA COUPE D'ERIC, 2026-09-23 : *« les 54 gemmes tombent à 27 »*, et elle SUIT
   LA RARETÉ — ⛔ pas une moitié uniforme. Une pierre commune se croise souvent,
   une pierre souveraine est une pièce unique.
   ⭐ LES DOUZE PALIERS RESTENT, TOUS : chacun ouvre un cran de PP dans l'échelle
   du Soulforging. On coupe des NOMS, jamais des paliers — et c'est pour ça que
   cette table garde ses douze lignes. */
const PALIERS = {
  10: 3, 50: 3, 100: 3, 250: 3, 500: 2, 750: 2,
  1000: 2, 2500: 2, 5000: 2, 10000: 2, 25000: 2, 50000: 1
};

/* ══ ① LA COUCHE COMMITÉE ════════════════════════════════════════════════ */

test("témoin — la couche existe, se valide au contrat, et elle est DANS LA PILE", () => {
  /* ⚔️ SANS CE TÉMOIN, tout ce fichier pourrait être vert sur une couche que
     personne ne monte : 54 records parfaits et invisibles à l'écran. */
  const lu = readLayer(readFileSync(CHEMIN), "fh-gems-en.layer.json");
  assert.deepEqual(lu.counts, { gem: 27, shelving: 27 });
  assert.equal(COUCHE.schema, LAYER.schema);
  assert.equal(COUCHE.id, LAYER.id);
  assert.equal(COUCHE.lang, "en");
  assert.deepEqual(COUCHE.flags, ["fh.gems"]);
  assert.equal(COUCHE.attribution.license, "all-rights-reserved");
  assert.ok(PILE.includes("layers/fh-gems-en.layer.json"),
    "la couche n'est pas dans la pile — 27 gemmes que le builder ne monte pas");
});

test("témoin — `gem` est un GENRE du contrat, et il ne s'est pas ouvert tout seul", () => {
  /* ⚔️ La couche ne PEUT PAS se charger si le contrat ignore le genre — c'est
     le refus construit au lot 93 et qui a mordu au lot 101. Ce témoin dit que
     la révision de `fh-layer/1` a bien eu lieu, pas qu'elle a été contournée. */
  assert.ok(GENRES.includes("gem"), "`gem` doit être déclaré dans `src/layers/document.mjs`");
});

test("🔴 LES 27 GEMMES, PALIER PAR PALIER — un total juste ne dirait rien du contenu", () => {
  /* ⚠️ 27 se lit aussi bien « 12 paliers d'Eric » que « 27 azurites ». Le
     compte par palier est le seul qui dise quelque chose — et depuis la coupe du
     23/09 il dit une chose de plus : le GRADIENT. 3 à chaque palier commun, 2 au
     milieu, 1 au sommet. Un total juste sur un gradient plat serait faux. */
  const parPalier = {};
  for (const entree of Object.values(GEMMES)) {
    parPalier[entree.data.value_gp] = (parPalier[entree.data.value_gp] || 0) + 1;
  }
  assert.deepEqual(parPalier, PALIERS);
  assert.equal(Object.keys(GEMMES).length, 27);
  assert.equal(Object.values(PALIERS).reduce((a, b) => a + b, 0), 27,
    "témoin d'arithmétique : 4 × 3 + 7 × 2 + 1 = 27 — la coupe d'Eric du 23/09");
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
  assert.equal(new Set(visees).size, 27, "aucune gemme n'est rangée deux fois");
  for (const vise of visees) {
    assert.ok(GEMMES[vise], `le rangement vise « ${vise} », qui n'est pas une gemme de cette couche`);
  }
  for (const id of Object.keys(GEMMES)) {
    assert.ok(visees.includes(id), `la gemme « ${id} » n'a AUCUN rangement — elle serait invisible au catalogue`);
  }
});

test("🔴 LE PRÉFIXE D'UN RANGEMENT DIT QUI POSSÈDE LA GEMME — `fh:` l'invention, `srfh:` le partage", () => {
  /* ⛔ ET CE N'EST PAS UNE COQUETTERIE D'IDENTIFIANT. `srfh-shelving-en` monte
     dans les DEUX piles nommées — un joueur en « SRD seul » la garde (voir
     `SRFH_LAYER_IDS`). Un rangement de gemme logé là-bas pointerait, sur cette
     pile, vers un `extends` que rien ne résout : `lireRangement` le compterait
     dans `introuvables`, et 54 objets disparaîtraient en silence du catalogue
     de tous ceux qui jouent SRD. */
  /* ⚖️ 09/09 — CE GARDE A CHANGÉ DE LOI, PAS DE SÉVÉRITÉ. Il exigeait `fh:`
     pour les 54. Eric a tranché « on superpose / pas de doublons inutiles » :
     les 23 gemmes que le DMG porte AUSSI passent en `srfh:` pour que les deux
     couches posent LE MÊME id et que le moteur n'en garde qu'un record
     (`stack.mjs:143`). Le garde exige donc maintenant LE BON préfixe pour
     CHAQUE gemme — 31 `fh:`, 23 `srfh:` — ce qui est plus strict, pas moins :
     l'ancien laissait passer une 24ᵉ gemme partagée restée en `fh:`.
     ⛔ CE QUI RESTE VRAI ET NE DOIT PAS BOUGER : le danger que l'ancien garde
     nommait. `srfh-shelving-en` monte dans les DEUX piles ; un rangement logé
     LÀ-BAS pointerait vers un `extends` que « SRD seul » ne résout pas. Ici le
     préfixe `srfh:` désigne un ID PARTAGÉ, pas la couche `srfh-shelving-en` —
     le rangement reste dans `fh-gems-en`, et le témoin ci-dessous le prouve. */
  const compte = { fh: 0, srfh: 0 };
  for (const id of Object.keys(RANGEMENTS)) {
    const slug = id.split(":").pop();
    const attendu = Object.hasOwn(GEMMES_DU_LIVRE, slug) ? "srfh" : "fh";
    assert.match(id, new RegExp(`^${attendu}:shelving:en:`),
      `« ${id} » : le DMG ${attendu === "srfh" ? "PORTE" : "ne porte PAS"} cette pierre, ` +
      `son rangement doit donc commencer par \`${attendu}:\``);
    compte[attendu] += 1;
  }
  assert.deepEqual(compte, { fh: 18, srfh: 9 },
    "📏 MESURÉ APRÈS LA COUPE DU 23/09 : 18 inventions de Fate's Hand, 9 pierres partagées avec "
    + "le livre. ✅ ET LES NEUF SONT DES REPLIS NOMMÉS, PAS DES CHOIX — Eric voulait zéro nom du "
    + "DMG (*« si ça tombe sur du DMG tu élimines et passes au nom suivant »*), et quatre paliers "
    + "n'ont pas de quoi remplir autrement : 10 po (1 hors DMG pour 3), 50 po (0 pour 3), 100 po "
    + "(0 pour 3), 1000 po (1 pour 2). ⛔ La cause n'est pas un oubli d'Eric : à ces paliers les "
    + "pierres sont des gemmes RÉELLES — Jade, Jet, Onyx, Amber — que le livre liste parce "
    + "qu'elles existent, pas parce qu'il les a inventées.\n"
    + "   ⚠️ LE JOUR OÙ CE 9 BAISSE, c'est qu'Eric aura inventé des pierres pour ces quatre "
    + "paliers ; le jour où il MONTE sans qu'on l'ait décidé, c'est que la préférence pour les "
    + "inventions a cassé dans le générateur.");
  /* ⚔️ LE TÉMOIN QUI GARDE L'ANCIENNE VÉRITÉ : la couche qui PORTE ces
     rangements est toujours `fh-gems-en`, quel que soit le préfixe de l'id. */
  assert.equal(COUCHE.id, "fh-gems-en",
    "les rangements doivent rester dans la couche FH — un id partagé n'est pas un déménagement");
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
  assert.equal(ETAGERE_DES_GEMMES, "trade-goods:gems",
    "✅ TRANCHÉ par Eric le 2026-09-23 : « sous trade goods tu auras gems, et ce sera une plus "
    + "grosse catégorie ». ⭐ LE RAYON GARDE LE MOT DU LIVRE (le SRD 5.2 porte 23 marchandises "
    + "typées TG, et `valuables` était une invention de l'architecte — loi §0.12), mais les "
    + "pierres prennent leur ÉTAGÈRE à elles. ⏳ Le 09/09 disait l'inverse (« même étagère "
    + "partout ») : c'est la parole la plus récente qui vaut.");
  const posees = new Set();
  for (const [id, entree] of Object.entries(RANGEMENTS)) {
    assert.equal(entree.data.of_kind, "gem", `${id} : le rangement doit dire le genre qu'il habille`);
    posees.add(`${entree.data.shelf.aisle}:${entree.data.shelf.shelf}`);
    /* 🔄 08/09 → 09/09. La décision qui FAIT LOI est celle du 09/09 — « remplace mes
       valuables par trade goods, même étagère partout ». Celle du 08/09 (« valuables »)
       est la décision REMPLACÉE : la citer suffisait hier, elle ferait passer le garde
       pour la mauvaise raison aujourd'hui. */
    assert.match(entree.data.shelf.provenance, /2026-09-23/,
      `${id} : la provenance doit citer la décision QUI FAIT LOI (2026-09-23, « sous trade goods
       tu auras gems »), pas seulement celles qu'elle remplace — sinon le garde passe pour la
       mauvaise raison`);
    /* 🔧 CE GARDE EXIGEAIT « MOT EST CELUI DU LIVRE », ET IL TENAIT UNE FAUSSETÉ.
       La note disait que le SRD 5.2 portait 23 marchandises typées TG ; ⛔ mesuré sur
       le PDF épinglé, il n'en porte AUCUNE (Canvas 0, Cinnamon 0, Saffron 0). Un garde
       qui exige qu'une phrase soit présente ne vérifie pas qu'elle soit VRAIE — c'est
       la limite de tout garde de texte, et elle mérite d'être écrite ici.
       ⭐ Il exige désormais la trace de la CORRECTION : tant que le mot y est, la note
       porte la mesure au lieu de la prémisse fausse. */
    assert.match(entree.data.shelf.provenance, /MESURÉ SUR LE PDF ÉPINGLÉ/,
      `${id} : la provenance doit porter la MESURE (aucune table Trade Goods dans 5.2.1),
       pas l'affirmation de 2026-09-09 qui invoquait §0.12 sur une prémisse fausse`);
  }
  assert.deepEqual([...posees], [`${rayon}:${etagere}`],
    "les 27 gemmes sont sur UNE seule étagère, celle que le générateur déclare");
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
  assert.equal(Object.keys(RANGEMENTS).length, 27, "les 27, aucune oubliée");
  assert.deepEqual([...vus], [attendus.join(",")], "un seul jeu de tags sur les 54 — aucune dérive");
});

/* ══ ③ LES REFUS DU GÉNÉRATEUR, ÉPROUVÉS ═══════════════════════════════ */

/** Une source minimale et VALIDE — le témoin sans lequel les attaques ne
 *  prouvent rien : un refus qui refuse tout n'est pas un refus. */
/* ⚖️ LA COUPE D'ERIC (23/09) DÉCRIT SES DOUZE PALIERS, et `construireCouche`
   REFUSE une source dont le nombre de paliers ne correspond pas — c'est voulu :
   une coupe qui ne recouvre pas la source laisserait un palier se vider ou se
   garder en entier sans que personne le décide. ⛔ Les sources FABRIQUÉES de ce
   fichier portent UN palier, donc elles apportent leur propre coupe. */
const COUPE_FIXTURE = Object.freeze({ garde: [1] });

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
  const { layer, compte, parPalier } = construireCouche(sourceSaine(), COUPE_FIXTURE);
  assert.equal(compte, 1);
  assert.deepEqual(parPalier, { 10: 1 });
  /* ⭐ `azurite` EST l'une des 23 que le DMG porte aussi : son id est donc
     PARTAGÉ. Le témoin le dit explicitement — sans ça, un lecteur croirait à
     une faute de frappe. */
  assert.deepEqual(Object.keys(layer.records.gem), ["srfh:gem:en:azurite"]);
  assert.deepEqual(Object.keys(layer.records.shelving), ["srfh:shelving:en:azurite"]);
});

test("⚔️ ATTAQUE — une source vide est REFUSÉE : un vide n'est pas une réponse", () => {
  assert.throws(() => construireCouche({ _meta: {}, gems: [] }, COUPE_FIXTURE), GemError);
  assert.throws(() => construireCouche({ _meta: {} }, COUPE_FIXTURE), /aucune gemme/);
});

test("⚔️ ATTAQUE — un compte DÉCLARÉ qui ment sur le compte MESURÉ est vu", () => {
  const s = sourceSaine();
  s._meta.count = 54;
  assert.throws(() => construireCouche(s, COUPE_FIXTURE), /54 gemmes, la liste en porte 1/);
});

test("⚔️ ATTAQUE — un palier hors de `_meta.tiers_gp`, ET un palier déclaré resté VIDE", () => {
  /* Les deux sens, encore. Le premier attrape une gemme égarée ; le second
     attrape un palier qu'on aurait vidé sans s'en apercevoir — et lui seul. */
  const egaree = sourceSaine();
  egaree.gems[0].value_gp = 42;
  assert.throws(() => construireCouche(egaree, COUPE_FIXTURE), /42 po, qui n'est pas un palier déclaré/);

  const vide = sourceSaine();
  vide._meta.tiers_gp = [10, 50];
  assert.throws(() => construireCouche(vide, COUPE_FIXTURE), /sans aucune gemme — 50 po/);
});

test("⚔️ ATTAQUE — un champ manquant fait JETER en nommant la gemme ET le champ", () => {
  for (const champ of ["value_gp", "weight_g", "display", "tier_en", "weight_provenance"]) {
    const s = sourceSaine();
    delete s.gems[0][champ];
    assert.throws(() => construireCouche(s, COUPE_FIXTURE),
      (e) => e.message.includes(champ) && e.message.includes("azurite"),
      `un « ${champ} » absent doit être nommé, avec sa gemme`);
  }
});

test("⚔️ ATTAQUE — un poids SOUS le plancher de 0,5 g d'Eric est refusé", () => {
  const s = sourceSaine();
  s.gems[0].weight_g = 0.2;
  assert.throws(() => construireCouche(s, COUPE_FIXTURE), /sous le plancher de 0.5 g/);
});

test("⚔️ ATTAQUE — une gemme ÉCARTÉE qui remonterait dans la liste active est vue", () => {
  /* `_meta.retiredNote` : « aucun lecteur ne doit les charger ». Ce garde le
     PROUVE au lieu de le promettre — la réserve reste une réserve. */
  const s = sourceSaine();
  s.retired_gems = [{ id: "fh:gem:en:azurite" }];
  assert.throws(() => construireCouche(s, COUPE_FIXTURE), /ÉCARTÉE.*fh:gem:en:azurite/s);
});

test("⚔️ ATTAQUE — un id dupliqué, et un id mal formé", () => {
  const double = sourceSaine();
  double._meta.count = 2;
  double.gems.push({ ...double.gems[0] });
  assert.throws(() => construireCouche(double, COUPE_FIXTURE), /apparaît deux fois/);

  const malForme = sourceSaine();
  malForme.gems[0].id = "srd:gear:en:azurite";
  assert.throws(() => construireCouche(malForme, COUPE_FIXTURE), /mal formé/);
});

test("⚔️ ATTAQUE — une étagère qui n'est pas « rayon:étagère » est refusée", () => {
  assert.throws(() => construireCouche(sourceSaine(), { ...COUPE_FIXTURE, etagere: "valuables" }), /n'est pas une étagère/);
  assert.throws(() => construireCouche(sourceSaine(), { ...COUPE_FIXTURE, etagere: "a:b:c" }), /n'est pas une étagère/);
  /* ⭐ ET LE TÉMOIN INVERSE : la chaîne est bien le SEUL levier — une autre
     étagère déplace les 54 gemmes sans toucher à rien d'autre. C'est ce qui
     rend l'arbitrage d'Eric praticable en une ligne. */
  const { layer } = construireCouche(sourceSaine(), { ...COUPE_FIXTURE, etagere: "equipment:valuables" });
  const shelf = layer.records.shelving["srfh:shelving:en:azurite"].data.shelf;
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
  assert.equal(Object.keys(GEMMES).length, 27, "témoin : le balayage a bien parcouru les 27 records");
});

test("🔴 AUCUN FRANÇAIS — une couche ne mélange pas les langues, et le refus est JOURNALISÉ", () => {
  /* La source du vault porte `name_fr` et `tier_fr` à côté de leurs homologues
     anglais. Le contrat fh-layer/1 est explicite : « une couche ne mélange pas
     les langues ». Ils restent au vault jusqu'à ce qu'une `fh-gems-fr` existe.
     ⛔ ET LE REFUS SE COMPTE. Un refus qu'aucun appelant ne peut obtenir est un
     refus que personne ne relit — c'est la leçon des écartés du lot 95. */
  const { refuses } = construireCouche(sourceSaine(), COUPE_FIXTURE);
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
      /* ⚖️ 09/09 — deux préfixes légitimes, et un seul par gemme : `fh:` pour
         les 31 inventions, `srfh:` pour les 23 partagées avec le livre. Le
         garde vérifie LEQUEL, pas « au moins un des deux ». */
      const slug = id.split(":").pop();
      const attendu = Object.hasOwn(GEMMES_DU_LIVRE, slug) ? "srfh" : "fh";
      assert.match(id, new RegExp(`^${attendu}:`),
        `${id} devrait commencer par \`${attendu}:\` — ` +
        `le DMG ${attendu === "srfh" ? "porte" : "ne porte pas"} cette pierre`);
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

/* 📏 LES QUATORZE PIERRES DU DMG QUE LA COUPE DU 23/09 ÉCARTE — MESURÉ, PAS CHOISI.
   ✅ ERIC, 23/09 : *« si ça tombe sur du DMG tu élimines et passes au nom suivant »*.
   Le générateur préfère donc à chaque palier les inventions de Fate's Hand, et ces
   quatorze-là cèdent leur place.
   ⭐ ET C'EST CE QUI DONNE DES DENTS AU GARDE D'EN DESSOUS : un slug mal tapé dans
   `GEMMES_DU_LIVRE` ne serait NI présent dans la couche NI dans ces quatorze-là.
   Sans cette liste, le garde dirait « absent, donc écarté » de n'importe quel
   fantôme. */
const DU_LIVRE_COUPEES = Object.freeze([
  "alexandrite", "black-opal", "blue-sapphire", "carnelian", "chalcedony",
  "chrysoberyl", "coral", "jacinth", "malachite", "pearl", "peridot",
  "star-ruby", "star-sapphire", "turquoise"
]);

test("⚖️ LES 23 GEMMES DU LIVRE SONT OU DANS LA COUCHE, OU DANS LA COUPE — jamais nulle part", () => {
  const presents = new Set(Object.keys(COUCHE.records.gem).map((id) => id.split(":").pop()));
  const coupees = new Set(DU_LIVRE_COUPEES);
  const fantomes = Object.keys(GEMMES_DU_LIVRE).filter((slug) => !presents.has(slug) && !coupees.has(slug));
  assert.deepEqual(fantomes, [],
    "⛔ GEMMES_DU_LIVRE nomme un slug qui n'est ni dans la couche ni dans les neuf coupées — "
    + "la frontière a bougé sans que la table suive");
  /* ⚔️ ET LA LISTE DES COUPÉES NE DÉBORDE PAS : une pierre qu'on y laisserait
     après son retour dans la couche ferait taire le garde sur elle, pour toujours. */
  const revenues = DU_LIVRE_COUPEES.filter((slug) => presents.has(slug));
  assert.deepEqual(revenues, [],
    "⛔ une pierre est à la fois dans la couche et dans la liste des coupées — la mesure a vécu");
  assert.equal(Object.keys(GEMMES_DU_LIVRE).length, 23,
    "23 gemmes sur les 54 du canon portent un nom du DMG 2024 — mesuré ch. 7 § Gemstones");
  assert.equal(23 - DU_LIVRE_COUPEES.length, 9,
    "📏 NEUF pierres du livre restent, sur 27, et ce sont des REPLIS NOMMÉS — quatre paliers "
    + "n'ont pas assez d'inventions de FH pour remplir leur quota. Voir le garde des préfixes.");
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
  assert.equal(horsLivre.length, 12,
    "📏 12 gemmes vivent sur les 6 paliers propres à FH (250 · 750 · 2 500 · 10 000 · 25 000 · 50 000) "
    + "— 3 + 2 + 2 + 2 + 2 + 1, la coupe d'Eric du 23/09");
  /* ⚔️ Et l'autre part : les 15 des paliers du livre, dont 14 portent son nom. */
  assert.equal(Object.keys(COUCHE.records.gem).length - horsLivre.length, 15,
    "15 gemmes vivent sur les 6 paliers du livre — 9 y portent son nom (les replis), 6 sont de FH");
});

test("⚖️ LE PALIER QUE FH DONNE À UNE GEMME DU LIVRE — deux divergences, et elles sont NOMMÉES", () => {
  /* ⚠️ Ces deux-là sont le seul point que la mesure ne tranche pas : FH ne donne
     pas le même prix que le DMG. La superposition dit que FH est AU-DESSUS, donc
     que son prix gagne — mais c'est une décision de règle, pas de code, et elle
     est portée à Eric. Le garde les FIGE : une troisième divergence apparue en
     silence serait un accident, pas un choix. */
  const divergences = [];
  for (const [slug, palierLivre] of Object.entries(GEMMES_DU_LIVRE)) {
    const entree = COUCHE.records.gem[idCanonique(slug)];
    /* ⛔ UNE PIERRE COUPÉE N'A PLUS DE PRIX À COMPARER, et la sauter n'est pas
       l'excuser : la liste `DU_LIVRE_COUPEES` la tient déjà, et le garde d'au-dessus
       exige qu'elle soit VRAIMENT absente. */
    if (!entree) continue;
    if (entree.data.value_gp !== palierLivre) {
      divergences.push([slug, entree.data.value_gp, palierLivre]);
    }
  }
  assert.deepEqual(divergences.sort(), [],
    "⏳ IL N'EN RESTE AUCUNE, ⛔ ET CE N'EST PAS UNE RÉPARATION. Les deux pierres qui divergeaient "
    + "du DMG — `black-opal` (5 000 chez FH, 1 000 au livre) et `chrysoberyl` (500 contre 100) — "
    + "portent toutes deux un NOM DU LIVRE, donc la préférence d'Eric pour les inventions de FH "
    + "les écarte. La divergence a disparu de l'ÉCRAN, pas du canon : le vault garde ses 54, les "
    + "deux comprises et à leur prix.\n"
    + "   ⚔️ ET CE GARDE RESTE ARMÉ POUR ÇA : le jour où l'une revient — parce qu'un palier gagne "
    + "des inventions et que la préférence rebat les cartes — elle revient AVEC sa divergence, et "
    + "c'est ici qu'on le verra. Une liste vide n'est pas un garde mort tant que ce qu'elle "
    + "mesure peut reparaître.");
});
