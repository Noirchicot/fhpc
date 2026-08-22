/* ══ L'INDEX D'UNE LIGNE DE SAC EST UNE IDENTITÉ, PAS UNE POSITION ═══════

   🔴 LA PROPRIÉTÉ, NOMMÉE ICI PARCE QU'ELLE N'ÉTAIT ÉCRITE NULLE PART.
   Dans `build.choices`, le `N` de `gear[N]` DÉSIGNE UN OBJET — ce n'est pas
   son rang dans une liste. Deux mesures le montrent, et aucune n'était
   gardée :
     · `removeGearLine` (`ui/builder/shell.mjs`) `clear` les TROIS chemins
       `gear[N]`, `gear[N].quantity`, `gear[N].equipped` et NE RENUMÉROTE
       RIEN — les lignes suivantes gardent leur chemin littéral ;
     · `nextGearIndex` (`ui/builder/equipment-step.mjs`) rend `max + 1`, donc
       un index libéré n'est JAMAIS repris.
   Les index sont donc STABLES et TROUÉS : après un retrait au milieu, le sac
   se lit `0, 2, 3` — et c'est correct.

   ⚔️ CE QUE ÇA PROTÈGE, ET LE GESTE QUI LE CASSE. L'étape Équipement va être
   redessinée de zéro. Reconstruire le sac en LISTE COMPACTE (`lines.map((l,
   i) => …)`, `splice`, une renumérotation « pour faire propre ») est
   l'implémentation qu'on écrit sans y penser devant un écran de liste. Elle
   renumérote. Un personnage DÉJÀ ENREGISTRÉ dont on retire le 2ᵉ objet
   verrait alors son `gear[2].equipped` décrire un AUTRE objet : pas
   d'exception, pas de test rouge, juste un joueur qui porte la mauvaise
   chose — la panne la plus chère, celle qui se voit en séance.

   ⛔ POURQUOI CE FICHIER REJOUE LES GESTES À LA MAIN. `shell.mjs` n'a AUCUN
   export (il exécute son `render()` à l'import) — même limite, même réponse
   que `tests/equipment-step.test.mjs` : `applyAddGearLine`/
   `applyRemoveGearLine` ci-dessous sont des COPIES de sa séquence de verbes,
   et elles pilotent les VRAIS `choose`/`set`/`clear`/`rebuild`. Elles
   prouvent la RÈGLE, jamais le câblage de `shell.mjs` (que le garde d'octets
   de `equipment-step.test.mjs` couvre déjà).

   ⭐ ET CE GARDE SAIT ROUGIR — mesuré, puis restauré (diff nul) : simuler
   une renumérotation après le retrait (réécrire les chemins des lignes
   restantes en `0,1,2`) fait tomber LES TROIS tests.
   🔴 Une chose s'est apprise en le mesurant, et elle a changé le test 3 :
   une renumérotation PURE laisse `resolved.gear` INTACT dans la même session
   — mêmes objets, même ordre. Un test qui se contente de relire la fiche
   après le retrait reste donc vert alors que tout a glissé. Ce qui trahit,
   c'est l'ÉCRITURE SUIVANTE contre un index mémorisé — d'où le geste ajouté
   à la fin du test 3. Un garde qui ne rougit jamais ne garde rien. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { currentGearLines, nextGearIndex } = await import("../ui/builder/equipment-step.mjs");

const fixture = exempleFhEn();
const { build } = fixture;

function rebuild(document) { return build.verbs.rebuild({ document }); }

/* ── LES DEUX GESTES DE `shell.mjs`, REJOUÉS MOT POUR MOT (voir l'en-tête) ── */
function applyAddGearLine(document, { ref, quantity, equipped }) {
  const index = nextGearIndex(document);
  let doc = build.verbs.choose({ document, path: `gear[${index}]`, ref }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].quantity`, value: quantity }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].equipped`, value: equipped }).document;
  return doc;
}
function applyRemoveGearLine(document, index) {
  let doc = document;
  for (const suffix of ["", ".quantity", ".equipped"]) {
    doc = build.verbs.clear({ document: doc, path: `gear[${index}]${suffix}`, kind: "choice" }).document;
  }
  return doc;
}

/** Le personnage d'exemple porte DÉJÀ huit lignes (`gear[0..7]`, mesuré) —
 *  ces tests partent d'un sac vide pour que les index posés ici soient
 *  exactement `0,1,2,3` : sinon ils mesureraient la fixture, pas la règle.
 *  Même geste que `withoutCurrency` dans `tests/equipment-step.test.mjs`.
 *
 *  ⚠️ ET IL FAUT AUSSI RETIRER L'OVERRIDE — mesuré en écrivant ce fichier :
 *  la fixture porte `resolved.gear[torch].quantity = 4`, qui vise l'objet
 *  PAR SON SLUG, pas par son index. Vider le sac sans le retirer fait jeter
 *  `rebuild` (« un override tweake ce qui existe, il ne fabrique pas la case
 *  qui manque »). Deux systèmes d'identité cohabitent donc sur le même sac :
 *  l'INDEX côté `build.choices`, le SLUG côté `build.overrides` — raison de
 *  plus pour que l'index ne glisse jamais. */
function withoutGear(document) {
  let doc = build.verbs.clear({ document, path: "resolved.gear[torch].quantity", kind: "override" }).document;
  for (const line of currentGearLines(doc)) doc = applyRemoveGearLine(doc, line.index);
  return doc;
}

/* Quatre objets DISTINCTS par leur slug, leur quantité ET leur `equipped` :
   un test qui ne compte que les lignes passerait alors que tout a glissé —
   c'est précisément la faute qu'on traque, donc chaque champ doit trahir le
   décalage à lui seul. */
const SAC = [
  { ref: { kind: "gear", id: "srd:gear:en:crowbar" }, quantity: 1, equipped: false },
  { ref: { kind: "gear", id: "srd:gear:en:torch" }, quantity: 2, equipped: false },
  { ref: { kind: "armor", id: "srd:armor:en:chain-mail" }, quantity: 1, equipped: true },
  { ref: { kind: "gear", id: "srd:gear:en:rations" }, quantity: 5, equipped: false }
];

function sacDeQuatre() {
  let doc = withoutGear(fixture.document);
  for (const item of SAC) doc = applyAddGearLine(doc, item);
  return doc;
}

/** L'empreinte du sac : index → ce que cet index DÉSIGNE. C'est cette carte
 *  qui doit survivre au retrait, pas le nombre de lignes. */
function empreinte(document) {
  return new Map(currentGearLines(document).map((l) => [l.index, `${l.ref.id}|${l.quantity}|${l.equipped}`]));
}

/* ══ 1 — LE CŒUR : RETIRER UNE LIGNE DU MILIEU NE DÉPLACE PAS LES AUTRES ══ */
test("retirer une ligne du milieu ne déplace pas les autres : un index reste attaché au MÊME objet", () => {
  const avant = sacDeQuatre();
  assert.deepEqual(currentGearLines(avant).map((l) => l.index), [0, 1, 2, 3],
    "le sac de départ doit bien porter les quatre index 0..3, sinon ce test ne mesure pas ce qu'il croit");
  const carteAvant = empreinte(avant);

  const apres = applyRemoveGearLine(avant, 1);

  assert.deepEqual(currentGearLines(apres).map((l) => l.index), [0, 2, 3],
    "les index restants sont TROUÉS (0, 2, 3) — une liste compacte 0,1,2 signerait une renumérotation");

  /* ⭐ LA VRAIE ASSERTION. Compter trois lignes ne prouve rien : après une
     renumérotation il y en aurait trois aussi. Ce qui compte, c'est que
     CHAQUE index désigne encore exactement ce qu'il désignait avant. */
  for (const [index, signature] of empreinte(apres)) {
    assert.equal(signature, carteAvant.get(index),
      `gear[${index}] désigne un AUTRE objet qu'avant le retrait — les lignes ont glissé, ` +
      "et un personnage enregistré porterait désormais la mauvaise chose");
  }
  assert.equal(empreinte(apres).get(2), carteAvant.get(2),
    "Chain Mail était en gear[2] equipped:true — après le retrait de gear[1], il y est TOUJOURS");
});

/* ══ 2 — UN INDEX LIBÉRÉ NE SE RECYCLE PAS ══════════════════════════════
   `nextGearIndex` rend `max + 1`, jamais « le premier trou ». Recycler le 1
   libéré ferait qu'un objet neuf hériterait de l'identité d'un objet mort —
   la même panne que la renumérotation, prise par l'autre bout. */
test("un index libéré n'est jamais réutilisé : le prochain ajout prend 4, pas le trou laissé en 1", () => {
  const apres = applyRemoveGearLine(sacDeQuatre(), 1);
  assert.equal(nextGearIndex(apres), 4,
    "1 est libre mais mort ; 4 est le seul index neuf — le recycler donnerait à un objet neuf l'identité d'un objet retiré");

  const avecAjout = applyAddGearLine(apres, {
    ref: { kind: "gear", id: "srd:gear:en:rope" }, quantity: 1, equipped: false
  });
  const ligneNeuve = currentGearLines(avecAjout).find((l) => l.ref.id === "srd:gear:en:rope");
  assert.equal(ligneNeuve.index, 4);
  assert.deepEqual(currentGearLines(avecAjout).map((l) => l.index), [0, 2, 3, 4],
    "le trou en 1 reste un trou — c'est la forme normale d'un sac qui a vécu");
});

/* ══ 3 — CE QUE LE JOUEUR RESSENT : LA FICHE SURVIT AU RETRAIT ══════════
   La propriété n'est pas une élégance interne : c'est ce qui fait qu'après
   avoir jeté sa torche, le personnage porte toujours SA cotte de mailles et
   compte toujours SES cinq rations. */
test("un personnage enregistré survit au retrait : resolved.gear décrit les trois objets restants, quantités et port intacts", () => {
  const apres = applyRemoveGearLine(sacDeQuatre(), 1);
  const report = rebuild(apres);
  const sac = report.resolved.gear.map((g) => ({ id: g.id, quantity: g.quantity, equipped: g.equipped }));
  assert.deepEqual(sac, [
    { id: "crowbar", quantity: 1, equipped: false },
    { id: "chain-mail", quantity: 1, equipped: true },
    { id: "rations", quantity: 5, equipped: false }
  ], "la torche part, et RIEN d'autre ne bouge — ni l'ordre, ni les quantités, ni ce qui est porté");
  assert.ok(!report.resolved.gear.some((g) => g.id === "torch"), "la ligne retirée ne revient pas par la fiche");
  assert.equal(report.resolved.ac, 16, "Chain Mail est toujours porté — sa ligne n'a pas bougé");

  /* ⭐ LÀ OÙ LE PERSONNAGE ENREGISTRÉ SE FAIT VRAIMENT MAL, et il a fallu le
     mesurer pour le voir : une renumérotation PURE laisse `resolved.gear`
     identique dans la même session (mêmes objets, même ordre) — le deepEqual
     ci-dessus reste vert. Ce qui casse, c'est l'ÉCRIT SUIVANT contre un
     index MÉMORISÉ : l'écran (ou une sauvegarde relue) tient « Chain Mail =
     gear[2] » et repose `gear[2].equipped`. Si les lignes ont glissé, ce
     geste déshabille les rations et laisse la cotte de mailles sur le dos —
     sans erreur, sans test rouge, juste un joueur qui porte la mauvaise
     chose. */
  const INDEX_MEMORISE_DE_LA_COTTE = 2;
  const range = build.verbs.set({
    document: apres, path: `gear[${INDEX_MEMORISE_DE_LA_COTTE}].equipped`, value: false
  }).document;
  const apresRangement = rebuild(range);
  assert.deepEqual(apresRangement.resolved.gear.map((g) => ({ id: g.id, equipped: g.equipped })), [
    { id: "crowbar", equipped: false },
    { id: "chain-mail", equipped: false },
    { id: "rations", equipped: false }
  ], "l'index mémorisé AVANT le retrait doit encore désigner Chain Mail — sinon on range l'objet de quelqu'un d'autre");
  assert.notEqual(apresRangement.resolved.ac, 16,
    "la cotte rangée ne protège plus : si l'AC reste à 16, c'est que le geste a atterri sur une AUTRE ligne");
});
