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

/* 🔴 UNE SEULE FAMILLE DEPUIS LE 16/09 — Eric : *« 2 oui une seule apparence
   partout »*. Le chapitre Équipement portait une COPIE mot pour mot de ce
   patron (shell.css ~9055, retirée) ; ses six sélecteurs sont maintenant DANS
   le patron, aux six dernières places.
   ⭐ CE GARDE A ROUGI SUR CETTE FUSION, ET C'ÉTAIT SON TRAVAIL : il exigeait
   DEUX familles. Sa loi n'a pas changé — « l'inventaire écrit ici et celui de
   la feuille sont le MÊME » — seule son expression suit. ⛔ Il n'est pas
   desserré : il exige toujours l'égalité membre pour membre, et l'ordre avec. */
const SOCLE = [
  ".sortie-bouton",
  ".tray-bouton",
  ".species-done",
  ".parcours-item-porte",
  ".parcours-pied button:not(.fiche-livre):where(:not(.tuto-point))",
  ".card-pied button",
  ".fiche-action",
  ".ability-entry",
  /* — le chapitre Équipement, entré le 16/09 — */
  ".pipeline-bouton",
  ".dressing-bouton",
  ".carte-r-bouton",
  ".pipeline-ligne-envoi",
  ".pipeline-pas",
  ".aiguilleur-bouton",
  /* — LOT 212, entré à la fusion du 16/09 : les portes de l'écran R (Gear) —
     Backpack · Send · Wares dans la rangée du pied, et Companions. Un ajout au
     CORPUS, déclaré ici en le sachant, pas une réparation de garde. — */
  ".gear-porte",
  /* — LOT 218, 20/09 : les trois portes du pied de Wares — Gear · Send · Backpack. ⭐ Elles
     entrent par la LISTE, pas par une copie : le relief d'un bouton a un seul écrivain.
     🔴 ET CE GARDE A ROUGI SUR LEUR ENTRÉE, DEUX FOIS ET POUR DEUX RAISONS — c'est son
     travail : l'inventaire a changé de membres, ET le garde du défaut `transparent`
     reconnaît ce défaut à ce que TOUTE la famille le porte, donc il ne le trouvait plus
     tant que cette liste-ci n'était pas à jour. Un seul ajout, deux gardes satisfaits. — */
  ".wares-porte",
  /* — LOT 213, 17/09 : les quatre portes du pied de la fiche X1 — Close · Use ·
     Send · Trash. ⭐ CE GARDE A ROUGI SUR SON ENTRÉE, ET C'EST SON TRAVAIL : une
     famille n'entre pas dans l'habit sans qu'on le sache, et la mise à jour de
     cette liste EST la façon de le savoir. ⛔ Elle n'est pas une réparation du
     garde : elle est la déclaration du lot. — */
  ".x1-porte"
];

/* ⛔ CE QUI RESTE DEHORS, ET NOMMÉMENT : `.pipeline-fleche` porte le filtre du
   bouton mais AUCUN pseudo-élément — *« les flèches restent RONDES »* (shell.css).
   Elle n'a jamais été de ce patron et ne l'a pas rejoint à la fusion. */
const HORS_PATRON_MAIS_PORTE_LE_FILTRE = [".pipeline-fleche"];

/* Le PLANCHER DES GABARITS — shell.css ~8903, `min-width: --bouton-petit`.
   ⚠️ IL NE LES COUVRE PAS TOUTES (sept sur neuf depuis le lot 213 ; le titre de
   ce garde comptait, il nomme maintenant l'écart au lieu de le chiffrer — un
   compte dans un titre vieillit à chaque entrée). `.tray-bouton` et
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
  ".parcours-pied button",
  ".gear-porte",
  /* — LOT 218, 20/09 : les trois portes du pied de Wares — Gear · Send · Backpack. ⭐ Elles
     entrent par la LISTE, pas par une copie : le relief d'un bouton a un seul écrivain.
     🔴 ET CE GARDE A ROUGI SUR LEUR ENTRÉE, DEUX FOIS ET POUR DEUX RAISONS — c'est son
     travail : l'inventaire a changé de membres, ET le garde du défaut `transparent`
     reconnaît ce défaut à ce que TOUTE la famille le porte, donc il ne le trouvait plus
     tant que cette liste-ci n'était pas à jour. Un seul ajout, deux gardes satisfaits. — */
  ".wares-porte",         // LOT 212 — le petit 77, comme les autres portes à mot
  ".x1-porte"            // LOT 213 — les quatre portes de X1, même gabarit petit
];

/* Les familles à mot QUI NE PORTENT AUCUN HABIT — en attente de l'arbitrage
   d'Eric (lot 209). Les trois portent déjà la hauteur `--touch` 44. */
const CANDIDATES = [".skills-onglet", ".review-porte", ".tuto-pied button"];

/* Ce qui porte « bouton » dans son nom SANS être un bouton à mot, nommément,
   pour que le balayage du dernier test ne les redemande pas chaque fois. */
const PAS_DES_BOUTONS_A_MOT = new Set([
  ".b3-bouton",          // un tracé SVG : `fill: none; stroke: …`
  ".b3-barre-bouton",    // la zone cliquable d'une barre du B3, pas un libellé
  ".bouton-moyen",       // un MODIFICATEUR de gabarit, posé sur un bouton déjà de la famille
  ".gear-bouton",        // LOT 212 — Purse et Tally : une IMAGE (bourse, parchemin), pas un libellé — « pas de relief » (Eric, 16/09)
  ".gear-monnaie-bouton" // LOT 212 — les `+`/`−` de la bourse : un GLYPHE, pas un mot (NORMES : « un bouton à glyphe n'en porte pas »)
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
  /* 🔴 LES DEUX MARQUEURS ONT CHANGÉ LE 16/09, ET LA LOI N'A PAS BOUGÉ. Le
     patron peignait deux octogones (`--bouton-biseau` sur le corps,
     `--bouton-bombage` sur la face) ; il porte maintenant le RELIEF sur le
     corps et l'ANNEAU du liseré sur la face. Ce garde suit ses deux nouveaux
     marqueurs — ce qu'il vérifie reste le même : les deux listes sont
     identiques, membre pour membre, sinon un bouton rend faux en silence. */
  /* 🔴 ET ILS ONT CHANGÉ UNE SECONDE FOIS LE 16/09 AU SOIR, TOUJOURS SANS QUE LA
     LOI BOUGE : Eric a retiré l'octogone, donc la tuile `border-image` et
     l'anneau découpé. Le corps porte maintenant sa MATIÈRE, la face son LISERÉ.
     ⭐ Ce garde a suivi trois dessins en un jour sans changer d'une virgule ce
     qu'il exige — c'est le signe qu'il tenait la bonne chose. */
  const corps = basesDeLaRegle("var(--bouton-corps)", "::before");
  const faces = basesDeLaRegle("var(--bouton-lisere-epaisseur)", "::after");
  /* 🔴 UNE SEULE, DEPUIS LE 16/09. Ce garde exigeait DEUX familles, parce que
     le chapitre Équipement portait sa copie. Il a rougi à la fusion : c'était
     son travail. ⛔ Et « une seule » est plus strict que « deux » — une copie
     qui reparaîtrait le ferait rougir de nouveau. */
  assert.equal(corps.length, 1,
    "une seule famille porte le patron. Un SECOND bloc, c'est un second écrivain " +
    "pour un seul dessin : la première repeinture les fait diverger sans bruit");
  assert.equal(faces.length, 1, "à ce corps sa face — sans elle, le bouton perd son liseré de rôle en silence");

  assert.deepEqual(corps[0], faces[0],
    "le corps (::before) et la face (::after) doivent lister EXACTEMENT les mêmes sélecteurs — " +
    "un membre présent d'un seul côté rend un bouton faux sans qu'aucune couleur ne change");
});

test("🔴 L'INVENTAIRE DES PORTEUSES EST CELUI QUE LA FEUILLE PORTE", () => {
  const [socle] = basesDeLaRegle("var(--bouton-corps)", "::before");
  assert.deepEqual(socle, SOCLE,
    "l'habit a changé de membres : mettre à jour SOCLE ici, en le sachant");
});

test("⚔️ LE DÉFAUT `transparent` N'ÉTEINT AUCUN RÔLE ÉCRIT AVANT LUI", () => {
  /* 🔴 LE PIÈGE QUE CE GARDE FERME, ET IL SE REPAIE EN SILENCE. Depuis le
     16/09, `--bouton-fond` ne peint plus le corps : il ne colore que l'anneau,
     et son défaut est `transparent` — c'est ce qui retire son liseré au bouton
     gris. Mais ce défaut vit dans le patron, à mi-feuille, et QUATRE rôles sont
     écrits AVANT lui (L1235 · L1248 · L2159 · L2820). À spécificité égale,
     l'ordre les éteindrait : quatre boutons perdraient leur liseré sans qu'un
     seul test de couleur ne bronche.
     📏 MESURÉ : ils gagnent tous, par SPÉCIFICITÉ et non par position —
     `.sortie-bouton.sortie-done[data-lit]` vaut (0,3,0) contre (0,1,0) pour la
     branche `.sortie-bouton` du patron. ⭐ Mais c'est un équilibre, pas une
     garantie : quiconque simplifie un de ces sélecteurs éteint son liseré.

     ⛔ ET LE CALCUL SE FAIT PAR BRANCHE, JAMAIS SUR LE GROUPE. Ma première
     version comptait les classes des 15 sélecteurs du patron d'un coup et
     trouvait (0,19,2) — elle déclarait cinq rôles « perdus » alors qu'aucun ne
     l'est. Une spécificité de groupe n'existe pas : chaque branche a la sienne. */
  const lignes = (i) => CSS.slice(0, i).split("\n").length;
  const spec = (s) => {
    s = s.replace(/:where\([^)]*\)/g, "");
    return (s.match(/\.[a-zA-Z_-][\w-]*/g) || []).length + (s.match(/\[[^\]]*\]/g) || []).length;
  };
  let defaut = null; const roles = [];
  for (const m of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const d of m[2].matchAll(/--bouton-fond:\s*([^;]+)/g)) {
      const e = { branches: m[1].split(",").map((x) => x.trim()).filter(Boolean),
                  val: d[1].trim(), ligne: lignes(m.index) };
      /* 🔴 LE DÉFAUT EST CELUI DU PATRON, PAS N'IMPORTE QUEL `transparent`.
         Ce garde a rougi sur ce point le jour même où il est né : en retirant
         le liseré des deux `:disabled` gris, j'ai créé deux autres
         `transparent`, écrits PLUS BAS — et il prenait le dernier, donc il
         comparait tous les rôles à `.ability-entry:disabled`. ⭐ Le défaut se
         reconnaît à son groupe : c'est celui que TOUTE la famille porte. */
      if (e.val === "transparent" && e.branches.length === SOCLE.length) defaut = e;
      else if (e.val !== "transparent") roles.push(e);
    }
  }
  assert.ok(defaut, "le défaut `transparent` doit rester déclaré — c'est lui qui retire le liseré du gris");

  const eteints = [];
  for (const r of roles.filter((x) => x.ligne < defaut.ligne)) {
    for (const rb of r.branches) {
      const classesDuRole = rb.match(/\.[a-zA-Z_-][\w-]*/g) || [];
      const concernee = defaut.branches.find((db) => {
        const dc = db.replace(/:not\([^)]*\)/g, "").replace(/:where\([^)]*\)/g, "")
          .match(/\.[a-zA-Z_-][\w-]*/g) || [];
        return dc.length && dc.every((c) => classesDuRole.includes(c));
      });
      if (concernee && spec(rb) <= spec(concernee)) {
        eteints.push(`L${r.ligne} ${rb} (${spec(rb)}) ≤ patron ${concernee} (${spec(concernee)})`);
      }
    }
  }
  assert.deepEqual(eteints, [],
    "un rôle écrit avant le défaut ne le bat plus : son bouton a perdu son liseré. " +
    "⛔ Ne pas déplacer le défaut pour réparer — remonter la spécificité du rôle, " +
    "ou le réécrire après le patron.");
});

test("⛔ `.pipeline-fleche` PORTE LE FILTRE SANS PORTER LE PATRON — et ça reste vrai", () => {
  /* ⭐ Elle serait la prise la plus naturelle d'un balayage « tout ce qui a
     `filter: var(--bouton-ombre)` » — et ce serait faux : une flèche est ronde,
     l'octogone est l'habit des gabarits à libellé. */
  for (const f of HORS_PATRON_MAIS_PORTE_LE_FILTRE) {
    assert.ok(!SOCLE.includes(f), `${f} ne doit pas entrer dans le patron`);
    const re = new RegExp(f.replace(".", "\\.") + "(::before|::after)");
    assert.doesNotMatch(CSS, re, `${f} ne doit porter aucun pseudo-élément du patron`);
    assert.match(CSS, new RegExp(f.replace(".", "\\.") + "\\s*\\{[^{}]*filter:\\s*var\\(--bouton-ombre\\)"),
      `${f} garde son filtre — c'est ce qui la distingue d'un organe plat`);
  }
});

test("📏 LE PLANCHER DES GABARITS NE COUVRE PAS TOUTES LES PORTEUSES", () => {
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
  const porteuses = new Set(SOCLE);
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

  const classees = new Set([...SOCLE, ...CANDIDATES, ...PAS_DES_BOUTONS_A_MOT, ...HORS_PATRON_MAIS_PORTE_LE_FILTRE]);
  const orphelines = [...vues].filter((v) => !classees.has(v)).sort();
  assert.deepEqual(orphelines, [],
    "une famille `*-bouton` existe sans qu'on ait dit si elle porte l'habit : " +
    "la classer ici — porteuse, candidate, ou nommément « pas un bouton à mot »");
});
