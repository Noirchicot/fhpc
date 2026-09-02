/* ══ LA FENÊTRE DU SB SERT UN TEXTE DE LIGNÉE, PAS UN PAVÉ — lot 129 ══════

   🔴 LE DÉFAUT D'ERIC, 2026-09-02, devant la fenêtre du SB du Hoddon : elle
   servait la prose du SRD telle quelle. *« Quelle forme ? Les mêmes infos,
   plus court, mieux structuré avec les liens, comme l'Elfe. »*

   ⭐ C'EST UN TROISIÈME NIVEAU DE TEXTE, et c'est ce que ce garde épelle. Le
   dépôt en portait deux :
     · le CONDENSÉ d'une ligne (`fiche_lineage_lvl1`, lot 126) — il abrège,
       il perd des faits, et il sert le bilan ;
     · la PROSE du record — la règle complète, celle du livre.
   Le troisième dit **la même information, restructurée** : rien de perdu, une
   ligne par fait, les sorts en lien.

   ⛔ ET IL NE TOUCHE PAS À LA PROSE DU RECORD. Celle-là vient du convertisseur
   qui applique les renommages d'Eric, et le chapitre publié du site en dépend.
   Un contrôle ci-dessous le vérifie explicitement : si quelqu'un « range » un
   jour le texte de fenêtre dans `levels["1"]`, ce garde rougit.

   ⚠️ CE QU'IL MESURE, ET COMMENT. Il ne cite aucune fonction : il regarde ce
   que la fenêtre du SB SERT — combien de nœuds, avec quel contenu — et il
   éprouve LES DEUX BRANCHES : la lignée qui porte un texte de fenêtre, et
   celle qui n'en porte pas et sert sa prose comme avant. Une alternative
   gardée d'un seul côté est toujours l'autre qui casse. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");

const QUERY = exempleFhEn().layers.verbs.query;

const HODDON = "srd:species:en:gnome";
/** LES TÉMOINS QUI PEUVENT ACCUSER — deux espèces à lignées qui ne portent
 *  AUCUN texte de fenêtre. Si ce lot débordait d'un pixel sur elles, leur
 *  fenêtre changerait, et les contrôles du bas le diraient. */
const TEMOINS = ["srd:species:en:elf", "srd:species:en:tiefling", "srd:species:en:goliath"];

function recordDe(query, id) {
  const vue = query({ kind: "species", id });
  return (vue && vue.record) || null;
}

function optionsDe(query, id) {
  const data = (recordDe(query, id) || {}).data || {};
  return Array.isArray(data.lineages) ? data.lineages : [];
}

function decisionsDe(query, id) {
  const dec = [{
    path: "species", status: "answered", answered: 1, expected: 1,
    options: [id], selected: [id]
  }];
  const options = optionsDe(query, id);
  if (options.length > 0) {
    dec.push({
      path: "species.lineage", status: "pending", answered: 0, expected: 1,
      options: options.map((o) => o.id), selected: []
    });
  }
  return dec;
}

/** LA FENÊTRE DU SB, lignée par lignée : `{ id → [ligne, ligne…] }`.
 *  ⚠️ Elle relève les NŒUDS, pas un texte recollé — c'est justement le point :
 *  « Darkvision 120 ft » et « Novice in tinker's tools » sont deux faits, et
 *  un paragraphe qui les recolle redevient le pavé qu'Eric a refusé. */
function fenetreDuSB(query, id) {
  const noeud = SPECIES_CATALOGUE.itemCorps(
    { path: "species.lineage" }, { decisions: decisionsDe(query, id), query }, () => {}
  );
  const dit = {};
  if (!noeud) return dit;
  for (const option of optionsDe(query, id)) {
    const cellules = noeud.querySelectorAll(`[data-lignage="${option.id}"]`)
      .filter((n) => n.tagName === "DD");
    const td = noeud.querySelectorAll("tr").find((tr) => tr.dataset.lignage === option.id);
    if (td) {
      const lignes = td.querySelectorAll("p").map((p) => p.textContent);
      dit[option.id] = lignes.length > 0
        ? lignes
        : td.querySelectorAll("td").map((c) => c.textContent);
    } else if (cellules.length > 0) {
      dit[option.id] = cellules.map((n) => n.textContent);
    }
  }
  return dit;
}

/** La même requête, PRIVÉE des textes de fenêtre — l'autre branche. */
function sansFenetre(query) {
  return (demande) => {
    const vue = query(demande);
    if (!vue || !vue.record || !vue.record.data) return vue;
    if (vue.record.data.fiche_lineage_text === undefined) return vue;
    const data = { ...vue.record.data };
    delete data.fiche_lineage_text;
    return { ...vue, record: { ...vue.record, data } };
  };
}

/* ══ 0. LES TÉMOINS — sans eux, la suite balaierait le vide ══════════════ */

test("témoin — le Hoddon porte bien trois lignées, et lui seul porte un texte de fenêtre", () => {
  assert.deepEqual(optionsDe(QUERY, HODDON).map((o) => o.id),
    ["forest-folk", "rock-folk", "mole-people"], "les trois lignées du Hoddon");
  const porteurs = QUERY({ kind: "species" })
    .filter((vue) => vue.record && vue.record.data && vue.record.data.fiche_lineage_text)
    .map((vue) => vue.id);
  assert.deepEqual(porteurs, [HODDON],
    "⚠️ Eric n'a validé QUE le Hoddon — une seconde espèce qui en porterait un doit se DIRE ici");
  for (const id of TEMOINS) {
    assert.ok(optionsDe(QUERY, id).length >= 2,
      `${id} : une lignée bien réelle — c'est ce qui en fait un témoin, pas un figurant`);
  }
});

/* ══ 1. L'INVARIANT ═════════════════════════════════════════════════════ */

test("🔴 la fenêtre sert UNE LIGNE PAR FAIT — jamais un bloc recollé", () => {
  const servi = fenetreDuSB(QUERY, HODDON);
  assert.deepEqual(Object.keys(servi).sort(), ["forest-folk", "mole-people", "rock-folk"]);
  const comptes = Object.fromEntries(Object.entries(servi).map(([k, v]) => [k, v.length]));
  assert.deepEqual(comptes, { "forest-folk": 2, "rock-folk": 2, "mole-people": 3 },
    "⛔ deux, deux et trois faits — un seul nœud par lignée voudrait dire recollé");
  for (const [id, lignes] of Object.entries(servi)) {
    for (const ligne of lignes) {
      assert.ok(ligne.trim().length > 0, `${id} : aucune ligne vide`);
      assert.equal(ligne.includes("[["), false, `${id} : le balisage de lien ne fuit pas`);
      assert.equal(ligne.includes("]]"), false, `${id} : idem pour la fermante`);
    }
  }
});

test("🔴 …et c'est un TROISIÈME texte — ni le condensé, ni la prose", () => {
  /* ⚖️ CE QUI SÉPARE LES TROIS, ET CE N'EST PAS LA LONGUEUR — mesuré en
     écrivant ce garde, et ma première formulation était fausse : sur
     `mole-people`, la fenêtre et le condensé font **86 caractères chacun**.
     Un plafond de longueur n'aurait donc rien séparé du tout.

     ⭐ CE QUI SÉPARE, C'EST LA FORME ET LE CONTENU :
       · le CONDENSÉ tient en UNE ligne — c'est sa définition (le bilan) ;
       · la FENÊTRE en sert plusieurs, une par fait ;
       · la PROSE reste la règle longue, et de loin la plus longue ;
     et aucun des trois n'est la recopie d'un autre. */
  const condenses = recordDe(QUERY, HODDON).data.fiche_lineage_lvl1;
  const nu = (texte) => String(texte).replace(/\[\[([^\]]+)\]\]/g, "$1");
  const servi = fenetreDuSB(QUERY, HODDON);
  for (const option of optionsDe(QUERY, HODDON)) {
    const lignes = servi[option.id];
    const fenetre = lignes.join(" ");
    const condense = nu(condenses[option.id]);
    const prose = option.levels["1"];
    assert.ok(lignes.length >= 2,
      `${option.id} : la fenêtre sert plusieurs lignes — le condensé, lui, en tient UNE`);
    assert.equal(nu(condense).split("\n").length, 1,
      `${option.id} : témoin — le condensé est bien resté une seule ligne`);
    assert.notEqual(fenetre, condense, `${option.id} : la fenêtre n'est pas le condensé recopié`);
    assert.notEqual(fenetre, prose, `${option.id} : ni la prose recopiée`);
    /* ⛔ AUCUN FACTEUR INVENTÉ ICI — ma première écriture exigeait « 1,5 fois
       plus longue » et `rock-folk` la faisait rougir (241 contre 170). Ce qui
       est VRAI et mesuré, c'est l'ordre : la prose est plus longue. */
    assert.ok(prose.length > fenetre.length,
      `${option.id} : la prose reste la règle longue (${prose.length} vs ${fenetre.length})`);
  }
});

test("🔴 les sorts d'un texte de fenêtre sont de VRAIS liens, pas des noms morts", () => {
  const noeud = SPECIES_CATALOGUE.itemCorps(
    { path: "species.lineage" }, { decisions: decisionsDe(QUERY, HODDON), query: QUERY }, () => {}
  );
  const liens = noeud.querySelectorAll(".lien-sort").map((n) => n.textContent).sort();
  assert.deepEqual(liens,
    ["Mending", "Minor Illusion", "Prestidigitation", "Prestidigitation", "Speak with Animals"],
    "⛔ sans ça, le contrôle du balisage resterait vert si les noms étaient simplement effacés");
});

test("⚖️ L'AUTRE BRANCHE — privée de son texte de fenêtre, la lignée resert sa PROSE", () => {
  /* ⛔ Un blanc serait pire que le pavé (lot 126, même arbitrage). Et sans ce
     contrôle, le repli pourrait disparaître sans qu'un test rougisse : il ne
     s'emprunte plus sur la pile réelle. */
  const servi = fenetreDuSB(sansFenetre(QUERY), HODDON);
  for (const option of optionsDe(QUERY, HODDON)) {
    assert.deepEqual(servi[option.id], [option.levels["1"]],
      `${option.id} : la prose du record prend le relais, en un seul nœud comme avant`);
  }
});

test("les témoins n'ont pas bougé d'un nœud — avec ou sans texte de fenêtre", () => {
  /* Trois espèces à lignées qui n'en portent aucun : leur fenêtre doit être
     EXACTEMENT la même dans les deux régimes. Si le lot débordait, elle
     changerait ici. */
  for (const id of TEMOINS) {
    assert.deepEqual(fenetreDuSB(QUERY, id), fenetreDuSB(sansFenetre(QUERY), id),
      `${id} : ce lot ne touche pas aux lignées sans texte de fenêtre`);
  }
});

test("🔴 LE TEXTE DE FENÊTRE NE S'ÉCRIT PAS DANS LA RÈGLE — `levels[\"1\"]` reste la prose", () => {
  /* ⛔ La prose du record vient du convertisseur qui applique les renommages
     d'Eric, et `fh-phb/docs/chapters/species/hoddon.md` en dépend : la
     réécrire changerait ce que le LIVRE imprime. Le nouveau texte vit dans la
     couche de PRÉSENTATION, à côté des condensés.
     ⚠️ Ce contrôle mord sur la donnée, pas sur l'écran : c'est le seul endroit
     d'où l'on verrait quelqu'un « ranger » le texte au mauvais étage. */
  for (const option of optionsDe(QUERY, HODDON)) {
    const prose = option.levels["1"];
    assert.ok(prose.length > 130,
      `${option.id} : la prose du record est restée la règle longue (${prose.length} car.)`);
    assert.equal(prose.includes("[["), false,
      `${option.id} : et elle ne porte AUCUN balisage de fiche — ce n'est pas un texte d'écran`);
  }
});

/* ══ 2. ⚔️ LES ATTAQUES — le garde mord-il ? ════════════════════════════ */

test("⚔️ un texte de fenêtre RECOLLÉ en un seul bloc fait rougir le compte", () => {
  /* On rejoue le défaut exact : les faits collés bout à bout, comme la prose
     SRD les servait. Le compte de nœuds doit le voir. */
  const recolle = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== HODDON) return vue;
    const data = { ...vue.record.data };
    data.fiche_lineage_text = Object.fromEntries(
      Object.entries(data.fiche_lineage_text).map(([k, v]) => [k, v.replace(/\n/g, " ")])
    );
    return { ...vue, record: { ...vue.record, data } };
  };
  const comptes = Object.fromEntries(
    Object.entries(fenetreDuSB(recolle, HODDON)).map(([k, v]) => [k, v.length])
  );
  assert.deepEqual(comptes, { "forest-folk": 1, "rock-folk": 1, "mole-people": 1 },
    "⚔️ recollé, chaque lignée ne sert plus qu'UN nœud — et l'invariant du haut en attend 2, 2 et 3");
});

test("⚔️ le popup du jeton dit la MÊME chose que la fenêtre — pas la prose d'à côté", () => {
  /* NORMES §4 quinquies : le popup RÉPÈTE ce que la fenêtre montre. Lui
     laisser la prose pendant que la fenêtre sert le texte restructuré serait
     rouvrir les deux voix que les lots 126 et 127 ont refermées.
     ⛔ AUCUNE BRANCHE CONDITIONNELLE ICI : le jeton est retrouvé, le geste est
     joué, et l'absence de popup est une FAUTE — un garde qui n'assert que
     « si ça a marché » ne peut jamais accuser. */
  const popups = [];
  const noeud = SPECIES_CATALOGUE.itemCorps(
    { path: "species.lineage" },
    { decisions: decisionsDe(QUERY, HODDON), query: QUERY },
    (action) => { if (action && action.kind === "popup") popups.push(action); }
  );
  const servi = fenetreDuSB(QUERY, HODDON);
  for (const option of optionsDe(QUERY, HODDON)) {
    const jeton = noeud.querySelectorAll("[data-valeur]").find((n) => n.dataset.valeur === option.id);
    assert.ok(jeton, `témoin : le jeton de ${option.id} existe, sinon ce contrôle ne prouve rien`);
    jeton.dispatchEvent({ type: "contextmenu", preventDefault() {} });
  }
  assert.equal(popups.length, 3, "⚔️ les trois gestes ont bien ouvert trois fenêtres d'info");
  for (const [index, option] of optionsDe(QUERY, HODDON).entries()) {
    assert.deepEqual(popups[index].texte.split("\n"), servi[option.id],
      `${option.id} : le popup répète la fenêtre, ligne pour ligne`);
  }
});
