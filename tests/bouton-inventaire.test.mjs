/* ══ LE GARDE DE L'INVENTAIRE DES BOUTONS — lot 209, 2026-09-15 ════════════

   🔴 CE QU'IL EXISTE POUR EMPÊCHER. Le lot 209 va repeindre l'habit du bouton
   d'un seul geste. Un tel lot a deux façons de casser en silence :

     1. AJOUTER UN SÉLECTEUR À UNE DES DEUX RÈGLES ET L'OUBLIER DANS L'AUTRE.
        `::before` peint le corps et l'arête, `::after` la face en retrait. Un
        bouton présent dans la première et absent de la seconde garde son
        corps et perd son bombage — il rend, il est juste FAUX, et aucun test
        de couleur ne le dit. Les deux listes doivent être identiques, membre
        pour membre.

     2. LAISSER NAÎTRE UNE FAMILLE À MOT SANS DÉCIDER DE SON HABIT. C'est
        exactement ce qui est arrivé : le relevé du 15/09 a annoncé sept
        familles « sans habit », et la vérification en a trouvé quatre qui
        l'avaient déjà (par la COPIE de l'Équipement), deux qui ne sont pas
        des boutons du tout — `.porte-de` est un porte-DÉ (`aspect-ratio: 1`,
        `line-height: 0`), `.card-porte` est la DALLE de Destiny R — et une
        seule qui était bien ce qu'on disait. ⛔ Un inventaire qu'on refait à
        la main se refait faux. Celui-ci est écrit une fois et vérifié à
        chaque suite.

   ⭐ CE GARDE NE DIT PAS QUI DOIT PORTER L'HABIT — cette désignation
   appartient à Eric. Il dit seulement que l'inventaire écrit ici et celui de
   la feuille sont le MÊME. Le jour où Eric fait entrer une famille, ce garde
   rougit, et c'est son travail : on met l'inventaire à jour EN LE SACHANT.

   ⚠️ IL NE REMPLACE PAS UNE MESURE. Il lit ce que la feuille DÉCLARE, pas ce
   que le navigateur REND — le relevé en blg se prend à l'écran, jamais ici. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const SHELL = fs.readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8");
const CSS = SHELL.replace(/\/\*[\s\S]*?\*\//g, "");

/* ── LES TROIS RANGS, TELS QUE LA FEUILLE LES PORTE LE 15/09 ───────────── */

/* Le patron du SOCLE — shell.css ~8612 / ~8643. */
const SOCLE = [
  ".sortie-bouton",
  ".tray-bouton",
  ".species-done",
  ".parcours-item-porte",
  ".parcours-pied button:not(.fiche-livre):where(:not(.tuto-point))",
  ".card-pied button",
  ".fiche-action",
  ".ability-entry"
];

/* La COPIE de l'Équipement — shell.css ~9021 / ~9040. ⛔ C'est un duplicata
   du patron, pas un second dessin : les deux blocs portent aujourd'hui les
   mêmes déclarations. Un lot qui repeint le socle sans le suivre ici ferait
   diverger le site en deux habits. */
const EQUIPEMENT = [
  ".pipeline-bouton",
  ".dressing-bouton",
  ".carte-r-bouton",
  ".pipeline-ligne-envoi",
  ".pipeline-pas",
  ".aiguilleur-bouton"
];

/* Le PLANCHER DES GABARITS — shell.css ~8903, `min-width: --bouton-petit`.
   ⚠️ IL NE COUVRE QUE SIX DES HUIT PORTEUSES. `.tray-bouton` et
   `.ability-entry` portent l'habit SANS la cote 77 : leur largeur vient
   d'ailleurs. Ce n'est pas un oubli à réparer dans un lot de peinture —
   c'est un écart à connaître avant de mesurer, sinon on lit deux cotes
   différentes et on croit à une régression. */
const PLANCHER = [
  ".sortie-bouton",
  ".species-done",
  ".parcours-item-porte",
  ".card-pied button",
  ".fiche-action",
  ".parcours-pied button"
];

/* Les familles à mot QUI NE PORTENT AUCUN HABIT — en attente de l'arbitrage
   d'Eric (lot 209). Les trois portent déjà la hauteur `--touch` 44. */
const CANDIDATES = [".skills-onglet", ".review-porte", ".tuto-pied button"];

/* Ce qui porte « bouton » dans son nom SANS être un bouton à mot, nommément,
   pour que le balayage du dernier test ne les redemande pas chaque fois. */
const PAS_DES_BOUTONS_A_MOT = new Set([
  ".b3-bouton",          // un tracé SVG : `fill: none; stroke: …`
  ".b3-barre-bouton",    // la zone cliquable d'une barre du B3, pas un libellé
  ".bouton-moyen"        // un MODIFICATEUR de gabarit, posé sur un bouton déjà de la famille
]);

/* ── L'EXTRACTION ──────────────────────────────────────────────────────── */

/* Les sélecteurs de la règle dont le corps porte `decl`, en retirant le
   pseudo-élément : c'est la BASE qu'on compare d'une règle à l'autre. */
function basesDeLaRegle(decl, pseudo) {
  const re = new RegExp("([^{}]+)\\{([^{}]*" + decl.replace(/[-()]/g, "\\$&") + "[^{}]*)\\}", "g");
  const trouvees = [...CSS.matchAll(re)]
    .filter(([, sel]) => sel.includes(pseudo))
    .map(([, sel]) => sel.split(",").map((s) => s.trim().replace(pseudo, "")).filter(Boolean));
  return trouvees;
}

test("🔴 LES DEUX RÈGLES DU PATRON LISTENT LES MÊMES SÉLECTEURS — corps et face, membre pour membre", () => {
  const corps = basesDeLaRegle("var(--bouton-biseau)", "::before");
  const faces = basesDeLaRegle("var(--bouton-bombage)", "::after");
  assert.equal(corps.length, 2, "deux familles portent le patron : le socle et la copie de l'Équipement");
  assert.equal(faces.length, 2, "à chaque corps sa face — une famille sans face perd son bombage en silence");

  for (let i = 0; i < corps.length; i++) {
    assert.deepEqual(corps[i], faces[i],
      "le corps (::before) et la face (::after) doivent lister EXACTEMENT les mêmes sélecteurs — " +
      "un membre présent d'un seul côté rend un bouton faux sans qu'aucune couleur ne change");
  }
});

test("🔴 L'INVENTAIRE DES PORTEUSES EST CELUI QUE LA FEUILLE PORTE — socle et Équipement", () => {
  const [socle, equipement] = basesDeLaRegle("var(--bouton-biseau)", "::before");
  assert.deepEqual(socle, SOCLE,
    "l'habit du socle a changé de membres : mettre à jour SOCLE ici, en le sachant");
  assert.deepEqual(equipement, EQUIPEMENT,
    "la copie de l'Équipement a changé de membres : mettre à jour EQUIPEMENT ici, en le sachant");
});

test("📏 LE PLANCHER DES GABARITS NE COUVRE QUE SIX DES HUIT PORTEUSES", () => {
  const bloc = /:is\(([^)]*)\):not\(\.fiche-livre\):not\(\.tuto-point\)\s*\{([^{}]*min-width:\s*var\(--bouton-petit\)[^{}]*)\}/
    .exec(CSS);
  assert.ok(bloc, "le plancher `min-width: var(--bouton-petit)` doit rester trouvable");
  const membres = bloc[1].split(",").map((s) => s.trim()).filter(Boolean);
  assert.deepEqual(membres, PLANCHER, "les membres du plancher des gabarits ont changé");

  for (const dehors of [".tray-bouton", ".ability-entry"]) {
    assert.ok(SOCLE.includes(dehors), `${dehors} doit rester une porteuse de l'habit`);
    assert.ok(!membres.includes(dehors),
      `${dehors} porte l'habit SANS le plancher 77 — si ça change, la cote de la famille change avec`);
  }
});

test("🔴 LES TROIS CANDIDATES NE PORTENT TOUJOURS AUCUN HABIT — l'arbitrage d'Eric n'est pas rendu", () => {
  const porteuses = new Set([...SOCLE, ...EQUIPEMENT]);
  for (const c of CANDIDATES) {
    assert.ok(!porteuses.has(c),
      `${c} est entrée dans l'habit : c'est une DÉSIGNATION, elle appartient à Eric — ` +
      "la déplacer de CANDIDATES vers SOCLE ici, et dire dans le lot qui l'a décidé");
  }
  /* et elles portent bien la cible tactile : c'est ce qui les rend éligibles */
  for (const [sel, attendu] of [
    [".skills-onglet", /height:\s*var\(--touch\)/],
    [".review-porte", /min-height:\s*var\(--touch\)/],
    [".tuto-pied button", /min-height:\s*var\(--touch\)/]
  ]) {
    const regle = new RegExp(sel.replace(/[.\s]/g, (m) => (m === "." ? "\\." : "\\s+")) + "\\s*\\{([^{}]*)\\}");
    const m = regle.exec(CSS);
    assert.ok(m, `${sel} doit rester déclarée`);
    assert.match(m[1], attendu, `${sel} doit garder sa cible tactile 44 — c'est ce qui la rend éligible à l'habit`);
  }
});

test("⚔️ AUCUNE FAMILLE `*-bouton` N'EXISTE SANS ÊTRE CLASSÉE — socle, Équipement, candidate ou nommément exclue", () => {
  /* ⛔ Le balayage ignore les PLURIELS : `.tray-boutons`, `.carte-r-boutons`,
     `.ability-methodes-boutons` sont des CONTENEURS, comme `.fiche-actions`
     et `.popup-actions` (NORMES §6). Un conteneur ne porte pas d'habit. */
  const vues = new Set();
  for (const [, nom] of CSS.matchAll(/\.([a-z0-9-]*-bouton)(?![a-z0-9-])/g)) vues.add("." + nom);
  for (const [, nom] of CSS.matchAll(/\.(bouton-[a-z0-9-]+)(?![a-z0-9-])/g)) vues.add("." + nom);

  const classees = new Set([...SOCLE, ...EQUIPEMENT, ...CANDIDATES, ...PAS_DES_BOUTONS_A_MOT]);
  const orphelines = [...vues].filter((v) => !classees.has(v)).sort();
  assert.deepEqual(orphelines, [],
    "une famille `*-bouton` existe sans qu'on ait dit si elle porte l'habit : " +
    "la classer ici — porteuse, candidate, ou nommément « pas un bouton à mot »");
});
