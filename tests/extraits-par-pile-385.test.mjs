/* ══ 🧮 LOT 385 — CHAQUE EXTRAIT CITÉ SE TROUVE DANS LE TEXTE DE SA PILE ══════════════════════════
   Mandat d'ARCHI 35 (30/09) : *« une garde vérifie que dans chaque pile, chaque extrait cité se trouve
   dans le texte du record de CETTE pile »*.

   ── POURQUOI ELLE MANQUAIT ──────────────────────────────────────────────────────────────────────
   Au lot 384, les usages déclarés dans `srfh-mecaniques-en` (montée dans les DEUX piles) citaient la
   phrase SRD « a number of times equal to your Proficiency Bonus ». La couche FH réécrit cette phrase
   (« twice — plus one more use at character levels 5, 9, 13, and 17 », `PROF_USES`) : en pile FH,
   quatre déclarations citaient une phrase que leur record ne porte plus. Les gardes du 384 relisaient
   les extraits dans la couche SRD seule — ⛔ un témoin qui ne lit qu'une pile ne peut pas accuser l'autre.
   Les chiffres étaient justes (l'échelle FH reproduit le SRD) : c'est la CITATION qui mentait.

   ── CE QU'ELLE LIT, PILE PAR PILE (le pli, jamais une couche seule) ────────────────────────────
   · espèce : `trait_uses` (compte, action, attente) dans le texte du trait ; `counts` → le record
     compté et son `sheet_counter` ; `trait_levels` dans le texte du trait ; `lineage_effects[…].uses`
     dans le texte de niveau 1 de l'option, et `count_extrait` dans le trait qui déclare la réserve ;
   · classe : `resource_uses` et `martial_arts` dans la description de l'aptitude qu'ils nomment ;
     `economy_extrait` d'un sort, dans son temps d'incantation ;
   · don : `sheet_uses`, `spell_uses` dans sa description ;
   · glossaire : `sheet_counter`, `sheet_action` (lot 383) ; la Pact Magic (lot 383) dans son aptitude.
   ⏳ Hors d'elle : la règle d'attaque (`weapon_attack`, qui cite des records de propriété et des pages)
   et `sheet_resource` (des pages) — le domaine des armes est verbatim dans les deux piles (`fh-changes`,
   `verbatim-srd`), et aucune couche FH ne touche un glossaire (mesuré au pli le 30/09).
   ⭐ Une déclaration dont le trait est RETIRÉ par la pile (Resourceful en FH) est INERTE — `derive` ne
   la lit pas — et le témoin la nomme au lieu de la juger.
   ⚔️ Vue ROUGE avant la réparation (le rapport du lot 385 le montre), et sous mutation. */
import test from "node:test";
import assert from "node:assert/strict";
import { makeHarness, PILE_SRD } from "./build-harness.mjs";
import { PILE as PILE_FH } from "../src/tools/exemple-fh-en.mjs";

const PILES = { SRD: PILE_SRD, FH: PILE_FH };

/** Toutes les citations de la pile : `{ ou, extrait, texte }`, `texte` étant celui du record de la pile
 *  (ou `null` quand la déclaration est inerte : son trait n'existe pas dans cette pile). */
function citations(h) {
  const q = (kind) => h.layers.verbs.query({ kind }) || [];
  const parId = (kind) => new Map(q(kind).map((v) => [v.id, v]));
  const glossaire = parId("glossary"); const sorts = parId("spell"); const classes = parId("class");
  const out = [];
  const citer = (ou, extrait, texte) => { if (typeof extrait === "string") out.push({ ou, extrait, texte }); };
  const usage = (ou, u, texte) => {
    citer(`${ou} · compte`, u.extrait, texte);
    citer(`${ou} · action`, u.action && u.action.extrait, texte);
    citer(`${ou} · attente`, u.awaits && u.awaits.extrait, texte);
    if (u.action && typeof u.action.spell === "string" && typeof u.action.economy_extrait === "string") {
      const sort = sorts.get(u.action.spell);
      citer(`${ou} · économie`, u.action.economy_extrait, sort ? sort.record.data.casting_time : "");
    }
  };
  for (const v of q("species")) {
    const d = v.record.data || {};
    const traits = new Map((d.traits || []).filter((t) => t && t.id).map((t) => [t.id, t]));
    const nom = v.id.split(":").pop();
    for (const u of d.trait_uses || []) {
      const trait = traits.get(u.trait);
      usage(`${nom} ${u.trait}`, u, trait ? trait.text : null);
      if (typeof u.counts === "string") {
        const compte = glossaire.get(u.counts);
        assert.ok(compte && compte.record.data.sheet_counter, `${nom} ${u.trait} : « ${u.counts} » et son plafond`);
      }
    }
    for (const n of d.trait_levels || []) {
      const trait = traits.get(n.trait);
      citer(`${nom} ${n.trait} · niveau`, n.extrait, trait ? trait.text : null);
    }
    for (const [option, effets] of Object.entries(d.lineage_effects || {})) {
      if (!effets || !effets.uses) continue;
      const lignee = (d.lineages || []).find((o) => o.id === option);
      usage(`${nom} ${option}`, effets.uses, lignee ? lignee.levels["1"] : null);
      if (effets.uses.count_trait) {
        const trait = traits.get(effets.uses.count_trait);
        citer(`${nom} ${option} · réserve`, effets.uses.count_extrait, trait ? trait.text : null);
      }
    }
  }
  for (const v of q("class-progression")) {
    const d = v.record.data || {};
    const classe = classes.get(d.class);
    const aptitude = (nom) => ((classe && classe.record.data.features) || []).find((f) => f && f.name === nom);
    const nom = v.id.split(":").pop();
    for (const u of d.resource_uses || []) {
      const a = aptitude(u.feature);
      usage(`${nom} ${u.feature}`, u, a ? a.description : "");
    }
    if (d.pact_magic) { const a = aptitude(d.pact_magic.feature); citer(`${nom} ${d.pact_magic.feature}`, d.pact_magic.extrait, a ? a.description : ""); }
    const arts = d.martial_arts;
    if (arts) {
      const a = aptitude(arts.feature);
      const texte = a ? a.description : "";
      for (const e of [...Object.values(arts.extraits || {}), ...((arts.requires && arts.requires.extraits) || []),
        ...((arts.weapon_attacks && arts.weapon_attacks.extraits) || [])]) citer(`${nom} ${arts.feature}`, e, texte);
    }
  }
  for (const v of q("feat")) {
    const d = v.record.data || {};
    const nom = v.id.split(":").pop();
    for (const u of [...(d.sheet_uses || []), ...(d.spell_uses ? [d.spell_uses] : [])]) usage(nom, u, d.description || "");
  }
  for (const v of q("glossary")) {
    const c = v.record.data && v.record.data.sheet_counter;
    if (c) citer(`${v.id.split(":").pop()} · plafond`, c.extrait, v.record.data.description || "");
    const sa = v.record.data && v.record.data.sheet_action;
    if (sa) citer(`${v.id.split(":").pop()} · action`, sa.extrait, v.record.data.description || "");
  }
  return out;
}

const ETAT = Object.fromEntries(Object.entries(PILES).map(([nom, couches]) => [nom, citations(makeHarness({ layers: couches }))]));

for (const nom of Object.keys(PILES)) {
  test(`${nom} — chaque extrait cité se trouve dans le texte du record de cette pile`, () => {
    const fautes = ETAT[nom].filter((c) => c.texte !== null && !c.texte.includes(c.extrait));
    assert.deepEqual(fautes.map((c) => `${c.ou} : « ${c.extrait} »`), []);
  });
}

test("témoins — ce que chaque pile cite, et ce qu'elle laisse inerte", () => {
  /* ⚠️ Nommer le témoin avant de mesurer : une garde qui ne lit rien est verte. Les comptes sont
     relevés sur la pile montée le 30/09 (lot 385) ; un compte qui bouge se relit, il ne se recopie pas. */
  const inertes = (nom) => ETAT[nom].filter((c) => c.texte === null).map((c) => c.ou);
  assert.deepEqual(inertes("SRD"), []);
  assert.deepEqual(inertes("FH"), ["human resourceful · compte"], "Twice-Born retire Resourceful : sa déclaration dort");
  /* 60 dans chaque pile, lues une à une le 30/09 : 32 d'espèce (dont 2 niveaux de trait et 6 réserves de
     Goliath), 23 de classe (7 pour Martial Arts, 1 pour la Pact Magic), 2 de dons, 3 de glossaire —
     moins rien : la pile FH cite les mêmes sources avec SES phrases. */
  assert.equal(ETAT.SRD.length, 60, "citations lues en pile SRD");
  assert.equal(ETAT.FH.length, 60, "citations lues en pile FH");
  /* ⭐ et la pile FH cite SES phrases : l'échelle écrite, jamais le bonus de maîtrise */
  const echelle = ETAT.FH.filter((c) => c.extrait.includes("twice — plus one more use at character levels 5, 9, 13, and 17")).map((c) => c.ou);
  assert.deepEqual(echelle.sort(), ["dragonborn breath-weapon · compte", "dwarf stonecunning · compte", "gnome forest-folk · compte",
    ...["cloud", "fire", "frost", "hill", "stone", "storm"].map((o) => `goliath ${o} · réserve`), "orc adrenaline-rush · compte"].sort());
  assert.equal(ETAT.FH.filter((c) => c.extrait.includes("Proficiency Bonus") && c.ou.match(/^(dragonborn|dwarf|goliath|orc|gnome) /)).length, 0,
    "aucune déclaration FH d'espèce ne cite le bonus de maîtrise");
});
