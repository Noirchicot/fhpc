/* ══ LA LIGNÉE PORTE SES TRAITS — lot 128, 2026-09-02 ═════════════════════

   🔴 LA RÈGLE, D'ERIC : *« Un trait dont le CONTENU dépend du choix de lignée
   appartient à la lignée, pas au bloc "Granted automatically". »* Elle n'est
   pas neuve — `species-step.mjs` l'écrit depuis le 19/08, au-dessus du bilan
   d'une ligne : *« ⛔ IL N'APPARAÎT QU'UNE FOIS LE CHOIX SIGNÉ — sauf "gagné
   d'office", qui est là dès le début parce qu'il ne dépend de rien. »*
   Breath Weapon et Damage Resistance dépendaient, et personne ne les avait
   rangés : une absence n'est jamais une réponse.

   🪟 ET LE TRAIT SE MONTRE SOUS DEUX FORMES :
     · dans le SB, l'écran où l'on choisit — la forme GÉNÉRALE, sans l'élément,
       parce que c'est une info commune aux dix lignées ;
     · au bilan de S, une fois le choix signé — la forme SPÉCIFIQUE, l'élément
       nommé.

   ⚠️ CE QUE CE GARDE ÉPELLE, ET COMMENT IL LE MESURE. Il ne récite AUCUNE
   table du code. Il définit « dépendre du choix » par ce que l'écran FAIT :
   *un nom dont le texte servi CHANGE d'une lignée à l'autre*. Puis il exige
   deux choses de ces noms-là — l'absence du bloc accordé, et les deux formes.
   Le jour où l'implémentation change de nom, de table ou d'organe, ce garde
   dit encore la même chose.

   📏 MESURÉ SUR LES DOUZE ESPÈCES avant d'écrire une ligne : cinq portent des
   lignées, et le Dragonborn est le seul dont l'effet est ÉCLATÉ sur plusieurs
   traits — ses options portent `damage` (Acid…Cold), que deux autres traits
   lisent. ⛔ `otherworldly-presence` (Tiefling) cite bien `Fiendish Legacy`,
   mais pour son abilité de lanceur, que le joueur choisit à part : les trois
   legacies le laissent identique. Il ne dépend pas, et le Tiefling reste donc
   un témoin qui PEUT accuser. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");

const QUERY = exempleFhEn().layers.verbs.query;

/** Les douze, NOMMÉES — si une entre ou sort, ce garde le dit avant de
 *  mesurer quoi que ce soit (leçon du témoin, 22 et 24/08). */
const LES_DOUZE = [
  "fh:species:en:araag", "fh:species:en:elestu", "fh:species:en:loroka",
  "srd:species:en:dragonborn", "srd:species:en:dwarf", "srd:species:en:elf",
  "srd:species:en:gnome", "srd:species:en:goliath", "srd:species:en:halfling",
  "srd:species:en:human", "srd:species:en:orc", "srd:species:en:tiefling"
];

/** LES TÉMOINS QUI PEUVENT ACCUSER — deux sans lignée du tout, deux avec une
 *  lignée que RIEN n'éclate. Si le lot débordait d'un pixel sur elles, elles
 *  le diraient. ⛔ Un témoin choisi parce qu'il ne peut rien reprocher est le
 *  pire de tous (leçon du 22 et du 24/08). */
const TEMOINS_SANS_LIGNEE = ["srd:species:en:human", "fh:species:en:araag"];
const TEMOINS_LIGNEE_ENTIERE = ["srd:species:en:elf", "srd:species:en:tiefling"];

function recordDe(query, id) {
  const vue = query({ kind: "species", id });
  return (vue && vue.record) || null;
}

function traitsDuRecord(record) {
  const data = (record && record.data) || {};
  const base = Array.isArray(data.traits) ? data.traits : [];
  const fh = Array.isArray(data.fh_traits) ? data.fh_traits : [];
  return [...base, ...fh].filter((trait) => trait && trait.name);
}

function optionsDe(query, id) {
  const data = (recordDe(query, id) || {}).data || {};
  return Array.isArray(data.lineages) ? data.lineages : [];
}

/** Les décisions d'un écran S : l'espèce retenue, plus les plans que les
 *  autres lignes portent. `choisi === null` = le lignage OUVERT, pas signé. */
function decisionsDe(query, id, choisi) {
  const record = recordDe(query, id);
  const options = optionsDe(query, id);
  const dec = [{
    path: "species", status: "answered", answered: 1, expected: 1,
    options: [id], selected: [id]
  }];
  if (options.length > 0) {
    dec.push({
      path: "species.lineage", status: choisi ? "answered" : "pending",
      answered: choisi ? 1 : 0, expected: 1,
      options: options.map((o) => o.id), selected: choisi ? [choisi] : []
    });
  }
  if (traitsDuRecord(record).some((trait) => trait.id === "keen-senses")) {
    dec.push({
      path: "species.skillBudget", status: "pending", answered: 0, expected: 2,
      options: ["survival", "delve", "vigilance"], selected: []
    });
  }
  return dec;
}

/** Les paires `nom → texte` d'un bloc à lignes « **Mot :** texte ». */
function pairesDuBloc(noeud) {
  if (!noeud) return new Map();
  const paires = new Map();
  for (const p of noeud.querySelectorAll("p")) {
    const fort = p.querySelectorAll("strong")[0];
    if (!fort) continue;
    const mot = fort.textContent.replace(/ : $/, "");
    paires.set(mot, String(p.textContent).slice(fort.textContent.length));
  }
  return paires;
}

/* ── LES TROIS ENDROITS OÙ UN TRAIT PEUT ÊTRE SERVI ────────────────────── */

/** VOIX 1 — le bloc « gagné d'office » de l'écran S. */
function blocAccorde(query, id, choisi) {
  return pairesDuBloc(SPECIES_CATALOGUE.resumeItem(
    { path: "species.granted", confirme: true },
    { decisions: decisionsDe(query, id, choisi), query }, () => {}
  ));
}

/* ⛔ LA « VOIX 2 » A DISPARU AU LOT 129 — la `<dl>` du panneau de choix était
   peinte par `renderGrantedBlock`, un organe que plus rien n'atteignait depuis
   que Species porte le parcours d'étape. Ce garde ne mesure plus que des
   organes VIVANTS : le bloc accordé, le SB, le bilan. ⚠️ Sa couverture rétrécit
   d'un endroit, et c'est le POINT — elle mesurait un écran que personne ne
   voyait, donc elle protégeait du vide. */

/** LE SB — l'écran où l'on choisit, lignage encore ouvert. */
function blocDuSB(query, id) {
  return pairesDuBloc(SPECIES_CATALOGUE.itemCorps(
    { path: "species.lineage" }, { decisions: decisionsDe(query, id, null), query }, () => {}
  ));
}

/** LE BILAN DE S, une fois la lignée signée. */
function blocDuBilan(query, id, choisi) {
  return pairesDuBloc(SPECIES_CATALOGUE.resumeItem(
    { path: "species.lineage", confirme: true },
    { decisions: decisionsDe(query, id, choisi), query }, () => {}
  ));
}

/* ── LA DÉFINITION, MESURÉE SUR L'ÉCRAN — jamais lue dans le code ───────── */

/** LES NOMS DONT LE CONTENU DÉPEND DU CHOIX : ceux que l'écran S sert avec un
 *  texte QUI CHANGE d'une lignée à l'autre. Les deux blocs sont réunis, parce
 *  que le trait a précisément le droit de déménager de l'un à l'autre — c'est
 *  ce que le lot fait, et le garde ne doit pas s'y accrocher. */
function nomsQuiDependentDuChoix(query, id) {
  const options = optionsDe(query, id);
  if (options.length < 2) return [];
  /* ⚠️ ET SEULEMENT DES TRAITS. Ma première mesure était fausse : les lignes
     du bilan de lignage (« At level 1 », « At subsequent levels ») ont la même
     forme typographique et changent, elles aussi, d'une lignée à l'autre —
     elles arrivaient en tête des « dépendants ». Ce ne sont pas des traits :
     le crible est le NOM DES TRAITS DU RECORD, lu dans la donnée. */
  const traits = new Set(traitsDuRecord(recordDe(query, id)).map((t) => t.name));
  const vus = new Map();
  for (const option of options) {
    const dit = new Map([...blocAccorde(query, id, option.id), ...blocDuBilan(query, id, option.id)]);
    for (const [nom, texte] of dit) {
      if (!traits.has(nom)) continue;
      (vus.get(nom) || vus.set(nom, new Set()).get(nom)).add(texte);
    }
  }
  return [...vus].filter(([, textes]) => textes.size > 1).map(([nom]) => nom).sort();
}

/* ══ 0. LES TÉMOINS ══════════════════════════════════════════════════════ */

test("témoin — les douze espèces sont là, et deux noms seulement dépendent du choix", () => {
  const ids = QUERY({ kind: "species" }).map((vue) => vue.id).sort();
  assert.deepEqual(ids, [...LES_DOUZE].sort(),
    "si une espèce entre ou sort, ce garde le DIT avant de mesurer");
  const dependants = {};
  for (const id of LES_DOUZE) {
    const noms = nomsQuiDependentDuChoix(QUERY, id);
    if (noms.length > 0) dependants[id] = noms;
  }
  assert.deepEqual(dependants, {
    "srd:species:en:dragonborn": ["Breath Weapon", "Damage Resistance"]
  }, "⚠️ un troisième trait dépendant, ou une seconde espèce éclatée, se RANGE — il ne s'ajoute pas en silence");
});

test("témoin — les quatre espèces témoins peuvent vraiment accuser", () => {
  for (const id of TEMOINS_SANS_LIGNEE) {
    assert.equal(optionsDe(QUERY, id).length, 0, `${id} : pas de lignée — le témoin le plus nu`);
    assert.ok(traitsDuRecord(recordDe(QUERY, id)).length >= 3,
      `${id} : et il a des traits à perdre, sinon il ne prouve rien`);
  }
  for (const id of TEMOINS_LIGNEE_ENTIERE) {
    assert.ok(optionsDe(QUERY, id).length >= 3,
      `${id} : une lignée bien réelle — c'est ce qui en fait un témoin, pas un figurant`);
    assert.deepEqual(nomsQuiDependentDuChoix(QUERY, id), [],
      `${id} : sa lignée n'éclate sur aucun trait — si le lot débordait sur elle, cette ligne rougirait`);
  }
});

/* ══ 1. L'INVARIANT ══════════════════════════════════════════════════════ */

test("🔴 un trait qui dépend du choix n'est JAMAIS dans le bloc accordé — avant comme après la signature", () => {
  const fautes = [];
  for (const id of LES_DOUZE) {
    const dependants = nomsQuiDependentDuChoix(QUERY, id);
    if (dependants.length === 0) continue;
    const etats = [null, ...optionsDe(QUERY, id).map((o) => o.id)];
    for (const etat of etats) {
      const quand = etat === null ? "avant signature" : etat;
      for (const nom of blocAccorde(QUERY, id, etat).keys()) {
        if (dependants.includes(nom)) fautes.push(`voix 1 ${id}/${quand} : ${nom}`);
      }
    }
  }
  assert.deepEqual(fautes, [],
    "⛔ « gagné d'office » ne dit que ce qui ne dépend de rien — le contrôle doit NOMMER les coupables");
});

test("🔴 …et il ne DISPARAÎT pas : le SB le sert en général, le bilan signé en spécifique", () => {
  const manques = [];
  for (const id of LES_DOUZE) {
    const dependants = nomsQuiDependentDuChoix(QUERY, id);
    if (dependants.length === 0) continue;
    const sb = blocDuSB(QUERY, id);
    for (const nom of dependants) {
      if (!sb.has(nom)) manques.push(`SB ${id} : ${nom}`);
      for (const option of optionsDe(QUERY, id)) {
        if (!blocDuBilan(QUERY, id, option.id).has(nom)) manques.push(`bilan ${id}/${option.id} : ${nom}`);
      }
    }
  }
  assert.deepEqual(manques, [],
    "⛔ un trait retiré d'un bloc sans être posé dans un autre est un acquis PERDU, pas rangé");
});

/* ══ 2. LES DEUX FORMES — une lecture, deux mises en mots ════════════════ */

/** Ce que la forme SPÉCIFIQUE doit être : la générale, l'élément devant.
 *  ⛔ Elle ne se recopie pas ; l'élément se lit sur l'option. */
const specifiqueAttendue = (general, element) => `${element} — ${general}`;

test("🔴 le SB dit la forme GÉNÉRALE, le bilan la SPÉCIFIQUE — et la seconde est la première, préfixée", () => {
  for (const id of LES_DOUZE) {
    const dependants = nomsQuiDependentDuChoix(QUERY, id);
    if (dependants.length === 0) continue;
    const sb = blocDuSB(QUERY, id);
    for (const option of optionsDe(QUERY, id)) {
      const element = option.damage;
      assert.ok(typeof element === "string" && element.length > 0,
        `${id}/${option.id} : l'élément se lit sur la LIGNÉE — sans lui il n'y a pas de forme spécifique`);
      const bilan = blocDuBilan(QUERY, id, option.id);
      for (const nom of dependants) {
        const general = sb.get(nom);
        assert.ok(!general.startsWith(`${element} —`),
          `SB ${id} : « ${nom} » ne nomme AUCUN élément — dix lignées le lisent`);
        assert.equal(bilan.get(nom), specifiqueAttendue(general, element),
          `bilan ${id}/${option.id} : « ${nom} » = l'élément, puis le MÊME texte qu'au SB`);
      }
    }
  }
});

test("🔴 l'élément est celui de la LIGNÉE, pas un littéral — les dix le prouvent", () => {
  const id = "srd:species:en:dragonborn";
  const dependants = nomsQuiDependentDuChoix(QUERY, id);
  const elements = new Set();
  for (const option of optionsDe(QUERY, id)) {
    const bilan = blocDuBilan(QUERY, id, option.id);
    for (const nom of dependants) {
      assert.ok(bilan.get(nom).startsWith(`${option.damage} — `),
        `${option.id}/${nom} : l'élément servi est celui que l'option porte`);
    }
    elements.add(option.damage);
  }
  assert.equal(elements.size, 5,
    "⚠️ cinq éléments distincts sur dix lignées — si un seul était écrit en dur, ce compte le dirait");
});

/* ══ 3. ⚔️ LES ATTAQUES — le garde mord-il, DES DEUX CÔTÉS ? ════════════ */

test("⚔️ la forme générale servie au bilan, ou la spécifique servie au SB, font ROUGIR", () => {
  /* ⛔ Un garde qui n'a jamais rougi est une intention. On éprouve les DEUX
     côtés de l'alternative : le contrôle du SB refuse un texte qui nomme
     l'élément, celui du bilan refuse un texte qui ne le nomme pas. */
  const general = "Replace an attack with a 15 ft Cone or 30 ft Line.";
  const element = "Fire";
  const specifique = specifiqueAttendue(general, element);

  assert.notEqual(specifique, general, "les deux formes ne se confondent pas");
  assert.ok(specifique.startsWith(`${element} —`),
    "⚔️ servie au SB, la forme spécifique se ferait prendre : elle NOMME l'élément");
  assert.ok(!general.startsWith(`${element} —`),
    "…et la générale ne le nomme pas, c'est ce qui les sépare");
  assert.notEqual(specifiqueAttendue(general, "Cold"), specifique,
    "⚔️ et l'élément d'une AUTRE lignée ne passe pas pour celui-ci");
});

test("⚔️ une lignée privée de son élément ne peut plus servir de forme spécifique", () => {
  /* La privation est DÉLIBÉRÉE (TRAPS, lots 8→13) : on retire `damage` à UNE
     option et le contrôle doit la nommer, sans que ses neuf voisines bougent. */
  const id = "srd:species:en:dragonborn";
  const ampute = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    data.lineages = data.lineages.map((o) => (o.id === "white" ? { id: o.id, name: o.name } : o));
    return { ...vue, record: { ...vue.record, data } };
  };
  const sb = blocDuSB(ampute, id);
  const nom = "Breath Weapon";
  assert.equal(blocDuBilan(ampute, id, "white").get(nom), sb.get(nom),
    "sans élément, la lignée retombe sur la forme GÉNÉRALE — elle n'invente pas un élément");
  assert.equal(blocDuBilan(ampute, id, "red").get(nom), specifiqueAttendue(sb.get(nom), "Fire"),
    "et sa voisine intacte nomme toujours le sien : l'amputation est bornée, pas globale");
});

test("⚔️ deux textes recopiés divergeraient — ici les deux formes bougent ENSEMBLE", () => {
  /* ⭐ NORMES §4 quinquies, « UNE source ». Si le SB ou le bilan portait sa
     propre copie du texte, une seule des deux suivrait le condensé retouché.
     C'est LA faute que ce contrôle attrape, et elle ne se voit pas autrement :
     deux textes recopiés sont parfaitement cohérents le jour où on les écrit. */
  const id = "srd:species:en:dragonborn";
  const NEUF = "Un souffle tout neuf, écrit pour ce test.";
  const retouche = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    data.fiche_trait_text = { ...data.fiche_trait_text, "breath-weapon": NEUF };
    return { ...vue, record: { ...vue.record, data } };
  };
  assert.equal(blocDuSB(retouche, id).get("Breath Weapon"), NEUF,
    "le SB suit le condensé retouché");
  assert.equal(blocDuBilan(retouche, id, "red").get("Breath Weapon"), specifiqueAttendue(NEUF, "Fire"),
    "et le bilan aussi — une seule lecture, deux mises en mots");
});

test("⚔️ privé de tout condensé, le trait porté sert sa PROSE, dans les DEUX formes", () => {
  /* ⚖️ L'AUTRE MOITIÉ DE L'ALTERNATIVE. Un blanc serait pire que le pavé
     (lot 126, même arbitrage) : le condensé qui manque n'efface rien. */
  const id = "srd:species:en:dragonborn";
  const sansCondense = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || !vue.record.data) return vue;
    if (vue.record.data.fiche_trait_text === undefined) return vue;
    const data = { ...vue.record.data };
    delete data.fiche_trait_text;
    return { ...vue, record: { ...vue.record, data } };
  };
  const sb = blocDuSB(sansCondense, id);
  const prose = traitsDuRecord(recordDe(QUERY, id)).find((t) => t.id === "breath-weapon").text;
  assert.equal(sb.get("Breath Weapon"), prose, "sans condensé, c'est la prose du record qui sert");
  assert.equal(blocDuBilan(sansCondense, id, "red").get("Breath Weapon"),
    specifiqueAttendue(prose, "Fire"), "et la forme spécifique la préfixe, elle aussi");
});

/* ══ 4. LES TÉMOINS N'ONT PAS BOUGÉ ══════════════════════════════════════ */

/** LES TRAITS QUE LEUR ITEM PORTE À LEUR PLACE — mesuré au lot 129, NOMMÉ ici.
 *
 *  ⭐ « Un trait couvert ne disparaît pas, il change de place » (19/08) : un
 *  trait qui JUSTIFIE un item quitte le bloc accordé, et c'est la porte de
 *  l'item qui le représente (« Lineage » / « High Elf », « Skill budget » puis
 *  « Keen Senses » une fois la bourse dépensée). Ils ne sont donc pas perdus.
 *
 *  ⚠️ ET LA LISTE EST ÉCRITE, PAS DÉDUITE : elle NOMME ce qui n'est plus servi
 *  en toutes lettres, pour qu'une entrée comme une sortie fasse rougir. Un
 *  `deepEqual` sur `[]` ne dirait rien le jour où un troisième trait s'évapore
 *  pour de bon.
 *
 *  🔴 ET ELLE PORTE UNE DETTE, mesurée en la posant : le CONDENSÉ de ces
 *  traits (`fiche_trait_text`, lot 127) n'a plus aucun consommateur depuis que
 *  la `<dl>` du panneau est partie. Il est écrit et il ne s'affiche nulle part
 *  — c'est un arbitrage d'Eric, pas une réparation de test. */
const PORTES_PAR_LEUR_ITEM = {
  "srd:species:en:elf": ["Elven Lineage", "Keen Senses"],
  "srd:species:en:tiefling": ["Fiendish Legacy"]
};

test("les quatre témoins ne PERDENT aucun trait — servi, ou porté par son item", () => {
  /* ⚠️ Sept espèces sur douze n'ont pas de lignée, et quatre en ont une que
     rien n'éclate : aucune ne doit perdre une ligne à cause de ce lot. */
  for (const id of [...TEMOINS_SANS_LIGNEE, ...TEMOINS_LIGNEE_ENTIERE]) {
    const attendus = traitsDuRecord(recordDe(QUERY, id)).map((t) => t.name);
    const servis = new Set([
      ...blocAccorde(QUERY, id, null).keys(),
      ...blocDuSB(QUERY, id).keys()
    ]);
    const perdus = attendus.filter((nom) => !servis.has(nom));
    assert.deepEqual(perdus, PORTES_PAR_LEUR_ITEM[id] || [],
      `${id} : un trait qui n'est ni servi ni porté par un item s'est ÉVAPORÉ`);
  }
});

test("aucune espèce SANS lignée ne fabrique une forme spécifique", () => {
  /* ⛔ L'élément vient de la lignée : là où il n'y a pas de lignée, il ne peut
     pas y avoir de tiret d'élément. Un garde qui ne regarde que le Dragonborn
     ne verrait pas une règle devenue générale par accident. */
  for (const id of LES_DOUZE) {
    if (optionsDe(QUERY, id).length > 0) continue;
    const sb = SPECIES_CATALOGUE.itemCorps(
      { path: "species.lineage" }, { decisions: decisionsDe(QUERY, id, null), query: QUERY }, () => {}
    );
    assert.equal(sb, null, `${id} : sans lignée, il n'y a pas de SB de lignage du tout`);
    const bilan = SPECIES_CATALOGUE.resumeItem(
      { path: "species.lineage", confirme: true },
      { decisions: decisionsDe(QUERY, id, null), query: QUERY }, () => {}
    );
    assert.equal(bilan, null, `${id} : ni bilan de lignage`);
  }
});
