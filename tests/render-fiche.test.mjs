/* ══ LES TESTS D'ACCEPTATION DU LOT 25 — LA COUCHE D'AFFICHAGE ════════

   Le moteur sait fabriquer un personnage complet depuis des mois. Personne ne
   l'avait jamais REGARDÉ. Cette suite dit si l'écran est aussi honnête que le
   moteur qu'il montre.

   ELLE PORTE SUR LA FONCTION, PAS SUR LA PAGE. `render(document, report)` rend
   une CHAÎNE : elle se teste sans DOM, sans navigateur et sans un paquet de
   plus. La coquille HTML n'est vérifiée que sur un point — qu'elle porte
   encore le marqueur où le fragment s'injecte.

   LES CINQ DE LA COMMANDE :
   1. Les 21 rubriques apparaissent, la liste LUE DANS LE SCHÉMA.
   2. Chaque valeur rendue porte son chemin — et AUCUNE n'en est dépourvue.
   3. Un `underived` produit sa RAISON à l'écran, jamais un blanc.
   4. `stats[]` rend son détail : un terme = une ligne, total du document.
   5. ⚔️ L'ATTAQUE : un total mensonger s'affiche MENTEUR. Un écran qui
      recalcule masque les bugs du moteur.

   PLUS CE QUE LE LOT A TROUVÉ EN CHEMIN, et qui vaut d'être gardé rouge :
   6. Le verdict d'adressabilité est celui du SCHÉMA, pas une copie locale.
   7. Les quatre familles de chemins INADRESSABLES sont nommées — le jour où
      l'une se referme (ou une cinquième s'ouvre), ce test le dit.
   8. L'absence de rapport de dérivation est AFFICHÉE, pas comblée.
   9. Aucune déclaration `underived` n'est perdue en route.
   10. L'exemple commité EST ce que son générateur produit.

   ⚠️ AUCUNE ÉCRITURE HORS MÉMOIRE. `tests/tree-immuable.test.mjs` rejoue toute
   la suite entre deux relevés de l'arbre : les documents mutilés et les totaux
   mensongers de cette suite sont des clones EN MÉMOIRE, jamais posés sur le
   disque — y compris pour le test 10, qui compare des octets sans en écrire. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ROOT, makeHarness, acceptanceDocument } from "./build-harness.mjs";
import { render, modele, rubriqueDe, echappe, LIBELLES, MOTS } from "../src/tools/render-fiche.mjs";
import { exempleFhEn, octetsDe, SORTIE } from "../src/tools/exemple-fh-en.mjs";
/* LOT 41 — `underived[].reason` → `{key, params}`. La même composition que
   `render-fiche.mjs` applique pour `lang="fr"` (défaut). */
import { createLabels, renderUnderived, FR_UNDERIVED } from "../src/labels.mjs";
import { FH_UNDERIVED_FR } from "../src/modules/fh/labels.mjs";

const frUnderived = createLabels(FR_UNDERIVED, FH_UNDERIVED_FR);

const schema = JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8"));
/* LUE DANS LE SCHÉMA, JAMAIS RECOPIÉE — idiome de tests/build-derive.test.mjs.
   Une liste recopiée finit toujours par diverger de celle qu'elle imite. */
const RUBRIQUES = schema.$defs.resolved.required;

/* Le personnage Fate's Hand anglais, monté UNE FOIS : la pile pèse 3 Mo et
   rien ici ne la modifie. */
const exemple = exempleFhEn();

/** La section d'une rubrique, découpée dans la sortie. */
function section(html, cle) {
  const trouve = new RegExp(`<section data-rubrique="${cle}">[\\s\\S]*?</section>`).exec(html);
  return trouve === null ? null : trouve[0];
}

/** Tous les couples `{chemin, adressable}` que la sortie porte réellement. */
function cheminsRendus(html) {
  const trouves = [];
  const motif = /data-path="([^"]*)" data-adressable="(oui|non)"/g;
  let match = motif.exec(html);
  while (match !== null) {
    trouves.push({ chemin: match[1].replace(/&amp;/g, "&"), adressable: match[2] === "oui" });
    match = motif.exec(html);
  }
  return trouves;
}

/** Les feuilles du modèle, à plat. */
function feuilles(noeud, sortie = []) {
  if (noeud.forme === "feuille") sortie.push(noeud);
  else for (const enfant of noeud.enfants) feuilles(enfant, sortie);
  return sortie;
}

function toutesLesFeuilles(vue) {
  return vue.rubriques.flatMap((rubrique) => feuilles(rubrique.racine));
}

/* ══ 1 — LES 21 RUBRIQUES ═════════════════════════════════════════════ */

/* ⚠️ AJOUTÉ LE 2026-08-13, PARCE QU'IL MANQUAIT ET QUE ÇA A COÛTÉ. En
   renommant le champ `nom` de l'en-tête en `name` (deux mots français qui
   survivaient au rendu anglais), l'architecte a renommé la propriété SANS son
   lecteur : le titre de la fiche est passé à « (unnamed) » — et les 684 tests
   sont restés VERTS. Le nom du personnage, l'élément le plus visible de la
   page, n'était gardé par rien. Trouvé à l'œil, dans le navigateur.

   📌 La leçon vaut au-delà de ce champ : une suite peut couvrir 21 rubriques
   et laisser le TITRE sans garde, parce que personne ne pense à tester ce
   qu'on voit en premier. */
test("le nom du personnage s'affiche en titre — et son absence se dit", () => {
  const html = render(exemple.document, exemple.report);
  assert.match(html, /<h1>Ilyra Duskleaf<\/h1>/,
    "le titre porte le nom du document, pas un repli");

  /* REJET : un document sans nom dit qu'il n'en a pas, il ne rend pas un
     blanc ni le mot d'une autre langue. */
  const anonyme = structuredClone(exemple.document);
  delete anonyme.name;
  assert.match(render(anonyme, exemple.report), new RegExp(`<h1>${MOTS.sansNom.replace(/[()]/g, "\\$&")}</h1>`),
    "sans nom, le titre le DIT — et le mot vient du paquet, jamais du code");
});

test("les 21 rubriques de `resolved` apparaissent, et la liste vient du schéma", () => {
  assert.equal(RUBRIQUES.length, 21, "le contrat en déclare 21 — si ce nombre bouge, c'est ici qu'on l'apprend");
  const html = render(exemple.document, exemple.report);
  for (const cle of RUBRIQUES) {
    assert.ok(section(html, cle) !== null, `la rubrique « ${cle} » a sa place à l'écran`);
  }
  /* ET AUCUNE DE PLUS : une rubrique affichée que le contrat ne connaît pas
     serait un mot inventé par l'écran. */
  const rendues = [...render(exemple.document, exemple.report).matchAll(/<section data-rubrique="([^"]+)">/g)]
    .map((match) => match[1]);
  assert.deepEqual(rendues.slice().sort(), RUBRIQUES.slice().sort());
});

test("chaque rubrique du schéma a son libellé, et le paquet de mots n'en porte aucun de trop", () => {
  /* Loi §0.13 : les mots de l'interface sont regroupés en un seul endroit. Ce
     test est ce qui les y GARDE — et il rougit le jour où le contrat ajoute
     une rubrique, au lieu de la laisser s'afficher sous une clef nue. */
  assert.deepEqual(Object.keys(LIBELLES).slice().sort(), RUBRIQUES.slice().sort());
});

/* ══ 2 — CHAQUE VALEUR PORTE SON CHEMIN ═══════════════════════════════ */

test("chaque valeur rendue porte son chemin, et le chemin est celui du document", () => {
  const html = render(exemple.document, exemple.report);
  const vue = modele(exemple.document, exemple.report);
  const rendus = new Set(cheminsRendus(html).map((entree) => entree.chemin));

  for (const feuille of toutesLesFeuilles(vue)) {
    assert.ok(rendus.has(feuille.chemin), `« ${feuille.chemin} » est affiché avec son chemin`);
  }

  /* LE CHEMIN N'EST PAS DÉCORATIF : il désigne vraiment cette valeur-là dans
     le document. On le suit à la main sur un échantillon de chaque forme. */
  const suivre = (chemin) => {
    let valeur = exemple.document;
    for (const [, nom, ancre] of `.${chemin}`.matchAll(/\.([a-zA-Z][a-zA-Z0-9]*)(?:\[([^\]]+)\])?/g)) {
      valeur = valeur[nom];
      if (ancre !== undefined) {
        valeur = Array.isArray(valeur)
          ? valeur.find((item, index) => (item && item.id !== undefined ? item.id : String(index)) === ancre)
          : valeur[ancre];
      }
    }
    return valeur;
  };
  assert.equal(suivre("resolved.identity.level"), exemple.document.resolved.identity.level);
  assert.equal(suivre("resolved.skills[arcana].bonus"),
    exemple.document.resolved.skills.find((skill) => skill.id === "arcana").bonus);
  assert.equal(suivre("resolved.gear[torch].quantity"),
    exemple.document.resolved.gear.find((item) => item.id === "torch").quantity);
});

test("AUCUNE valeur n'est rendue sans son chemin — le compte des deux bouts", () => {
  /* Le garde qui empêche la dérive de ce lot. Un gabarit qui lirait un champ
     en dur produirait une valeur ORPHELINE : elle s'afficherait, et rien ne
     dirait au builder à quoi l'apparier. Ici, valeurs rendues et feuilles du
     modèle se comptent, et les deux nombres doivent être le MÊME.
     ⚠️ `<b class="meta">` est exclu exprès : l'en-tête du document vit hors de
     `resolved`, aucun chemin d'override ne peut le viser, et le rendu ne lui
     en attribue aucun (il le DIT sous l'en-tête). */
  const html = render(exemple.document, exemple.report);
  const vue = modele(exemple.document, exemple.report);
  const valeurs = (html.match(/<b>/g) || []).length + (html.match(/<span class="val">/g) || []).length;
  assert.equal(valeurs, toutesLesFeuilles(vue).length,
    "autant de valeurs affichées que de feuilles dans le document — pas une de plus, pas une de moins");
  assert.ok(valeurs > 300, `le document d'exemple en porte des centaines (${valeurs}) : le compte n'est pas vide`);
});

test("une SURCHARGE est appariée à son chemin — c'est à ça que sert un rendu adressé", () => {
  const html = render(exemple.document, exemple.report);
  const surcharge = exemple.document.build.overrides.find((entree) => entree.path === "resolved.gear[torch].quantity");
  assert.ok(surcharge, "l'exemple porte bien cette surcharge");
  const bloc = section(html, "gear");
  assert.match(bloc, /data-path="resolved\.gear\[torch\]\.quantity"[^>]*class="[^"]*"|surcharge/);
  assert.ok(bloc.includes(echappe(MOTS.surcharge)), "l'écran DIT que la valeur a été surchargée");
  assert.ok(bloc.includes(echappe(surcharge.note)), "et il montre la motivation, pas seulement le fait");
  assert.ok(bloc.includes(">4<"), "la valeur affichée est celle du MJ (4), pas celle de la dérivation (2)");
});

/* ══ 3 — UN `underived` PRODUIT SA RAISON ═════════════════════════════ */

test("privé d'une rubrique, l'écran affiche la RAISON du moteur — jamais un blanc", () => {
  /* LA PRIVATION EST DÉLIBÉRÉE : la pile ne monte que le SRD, donc aucune
     couche ne lève de drapeau et `stats` est vide À RAISON. Le moteur dit
     pourquoi ; l'écran doit le dire aussi. */
  const h = makeHarness();
  const sortie = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.deepEqual(sortie.resolved.stats, [], "la privation a bien eu lieu : `stats` est vide");

  const declaration = sortie.underived.find((entree) => entree.field === "stats");
  assert.ok(declaration, "et le moteur, lui, dit pourquoi");

  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}` ; en
     français, la table générique+FH composée rend EXACTEMENT la même phrase
     qu'avant (c'est le test §4.1 de la commande), donc la preuve ne change
     pas de nature ici — seulement de forme d'accès. */
  const html = render(sortie.document, sortie);
  const bloc = section(html, "stats");
  const raison = renderUnderived(declaration, frUnderived);
  assert.ok(bloc.includes(echappe(MOTS.nonDerive)), "la rubrique porte l'en-tête des déclarations");
  assert.ok(bloc.includes(echappe(raison)), "et la RAISON, mot pour mot, telle que le moteur l'a écrite");
  assert.ok(!bloc.includes(echappe(MOTS.videSansRaison)), "elle n'est donc pas signalée comme vide sans raison");

  /* LE CONTRE-ÉPREUVE, ET C'EST ELLE QUI FAIT MAL : le MÊME document, relu
     depuis un fichier, n'a plus de rapport — parce que `fh-char/1` n'a nulle
     part où le garder. L'écran ne fabrique alors AUCUNE raison : il dit qu'il
     n'en a pas. Voir INVENTAIRE-LOT-25.md, trou n°1. */
  const sansRapport = section(render(sortie.document), "stats");
  assert.ok(!sansRapport.includes(echappe(raison)), "sans rapport, la raison a disparu du monde");
  assert.ok(sansRapport.includes(echappe(MOTS.videSansRaison)), "et l'écran le DIT au lieu de laisser une case vide");
});

test("les cinq rubriques vides du personnage FH disent toutes pourquoi", () => {
  const html = render(exemple.document, exemple.report);
  const vides = RUBRIQUES.filter((cle) => {
    const valeur = exemple.document.resolved[cle];
    return Array.isArray(valeur) ? valeur.length === 0 : false;
  });
  assert.ok(vides.length > 0, "un niveau 1 en a forcément — sinon ce test ne prouverait rien");
  for (const cle of vides) {
    const bloc = section(html, cle);
    assert.ok(bloc.includes(echappe(MOTS.nonDerive)), `« ${cle} » est vide et porte sa déclaration`);
    assert.ok(!bloc.includes(echappe(MOTS.videSansRaison)), `« ${cle} » n'est pas un blanc muet`);
  }
});

/* ══ 4 — `stats[]` REND SON DÉTAIL ════════════════════════════════════ */

test("`stats[]` rend son détail terme par terme, et le total est celui du document", () => {
  const html = render(exemple.document, exemple.report);
  const bloc = section(html, "stats");
  const stats = exemple.document.resolved.stats;
  assert.ok(stats.length >= 2, "l'exemple publie au moins deux statistiques — sinon il ne mesure rien");

  for (const stat of stats) {
    assert.ok(bloc.includes(echappe(stat.name)), `« ${stat.name} » est nommée`);
    assert.ok(bloc.includes(`data-path="resolved.stats[${stat.id}].value"`), "son total porte son chemin");

    /* UN TERME = UNE LIGNE. Chaque terme du détail a son libellé ET sa valeur
       dans la MÊME `.ligne` — c'est ce qui rend le calcul lisible à la table. */
    for (const [index, terme] of stat.breakdown.entries()) {
      const racine = `resolved.stats[${stat.id}].breakdown[${index}]`;
      const ligne = new RegExp(`<div class="ligne"><div class="cells">(?:(?!</div></div>)[\\s\\S])*?` +
        `data-path="${racine.replace(/[[\]]/g, "\\$&")}\\.label"[\\s\\S]*?</div></div>`).exec(bloc);
      assert.ok(ligne !== null, `le terme « ${terme.label} » a sa ligne`);
      assert.ok(ligne[0].includes(`>${echappe(terme.label)}<`), "avec son libellé…");
      assert.ok(ligne[0].includes(`data-path="${racine}.value"`), "…et sa valeur sur la même ligne");
      assert.ok(ligne[0].includes(`>${terme.value}<`), `la valeur affichée est ${terme.value}`);
    }
  }
});

/* ══ 5 — ⚔️ L'ATTAQUE : LE TOTAL MENSONGER ════════════════════════════ */

test("⚔️ ATTAQUE — un total qui contredit son détail s'affiche MENTEUR, il n'est pas recalculé", () => {
  /* Un écran qui « corrige » masque les bugs du moteur : le garde de la somme
     (`build.validate`, `statSumViolations`) ne verrait plus jamais rien passer
     parce que l'écran aurait effacé la trace. Le document ment ; l'écran le
     répète mot pour mot. */
  const menteur = structuredClone(exemple.document);
  const stat = menteur.resolved.stats[0];
  const vraieSomme = stat.breakdown.reduce((total, ligne) => total + ligne.value, 0);
  assert.equal(stat.value, vraieSomme, "au départ, le document est honnête");
  stat.value = 99;
  assert.notEqual(99, vraieSomme, "et 99 n'est pas la somme — sinon l'attaque ne prouverait rien");

  const bloc = section(render(menteur, exemple.report), "stats");
  const total = new RegExp(`data-path="resolved\\.stats\\[${stat.id}\\]\\.value"[^>]*>[^<]*</code><b>([^<]*)</b>`)
    .exec(bloc);
  assert.ok(total !== null, "le total est bien rendu");
  assert.equal(total[1], "99", "L'ÉCRAN AFFICHE CE QUE LE DOCUMENT DIT");
  assert.notEqual(total[1], String(vraieSomme), "il n'a pas refait l'addition à la place du moteur");

  /* Et les termes n'ont pas bougé d'un cheveu : le mensonge est sur le total,
     et l'écran laisse voir les deux côtés pour qu'on puisse le CONSTATER. */
  for (const terme of stat.breakdown) assert.ok(bloc.includes(`>${echappe(terme.label)}<`));

  /* L'attaque n'a touché qu'un clone : l'original est intact. */
  assert.equal(exemple.document.resolved.stats[0].value, vraieSomme);
});

test("⚔️ ATTAQUE — un document sans `resolved` ne rend pas une page vide, il rend un refus", () => {
  const ampute = structuredClone(exemple.document);
  delete ampute.resolved;
  const html = render(ampute, exemple.report);
  assert.ok(html.includes(echappe(MOTS.resolvedAbsent)), "le rendu DIT qu'il n'y a rien à afficher");
  assert.equal(/<section data-rubrique=/.test(html), false, "et n'invente aucune rubrique pour meubler");
});

/* ══ 6 — LE VERDICT D'ADRESSABILITÉ VIENT DU SCHÉMA ═══════════════════ */

test("le verdict « adressable » est celui de `$defs/overridePath`, pas une copie locale", () => {
  /* La grammaire du dépôt est déjà comparée au schéma par
     tests/build-block.test.mjs. Ce qui se vérifie ICI, c'est que le rendu s'y
     soumet : chaque verdict affiché est rejoué contre le motif LU DANS LE
     SCHÉMA, à l'instant. */
  const grammaire = new RegExp(schema.$defs.overridePath.pattern);
  const rendus = cheminsRendus(render(exemple.document, exemple.report));
  assert.ok(rendus.length > 0);
  for (const { chemin, adressable } of rendus) {
    assert.equal(adressable, grammaire.test(chemin),
      `« ${chemin} » : le rendu et le schéma ne disent pas la même chose`);
  }
});

test("les familles de chemins INADRESSABLES sont nommées — c'est le livrable du lot", () => {
  /* Ce que le lot a mesuré, gardé rouge. Le jour où l'une de ces familles se
     referme (un `id` ajouté au contrat) ou qu'une cinquième s'ouvre, ce test
     tombe et l'inventaire se met à jour au lieu de vieillir en silence.
     Détail et conséquences : INVENTAIRE-LOT-25.md §« Les quatre trous ». */
  const familles = new Set(
    cheminsRendus(render(exemple.document, exemple.report))
      .filter((entree) => !entree.adressable)
      .map((entree) => entree.chemin
        .replace(/\[[0-9]+\]/g, "[N]")
        .replace(/\[[a-z0-9:._-]+\]/g, "[ID]")
        .replace(/(slots)\.[0-9]+/, "$1.[NIVEAU]")
        .replace(/\.[a-zA-Z]+$/, ""))
  );
  assert.deepEqual([...familles].sort(), [
    "resolved.derivation.stack[ID]",
    "resolved.identity.classes[N]",
    "resolved.spellcasting.slots.[NIVEAU]",
    "resolved.stats[ID].breakdown[N]",
    "resolved.stats[ID].breakdown[N].source"
  ]);
});

/* ══ 8-9 — LE RAPPORT, SA PLACE PERMANENTE, ET RIEN DE PERDU ══════════ */

test("le bloc du rapport est là MÊME QUAND il n'y a pas de rapport — et il le dit", () => {
  const avec = render(exemple.document, exemple.report);
  const sans = render(exemple.document);
  for (const html of [avec, sans]) {
    assert.ok(/<section data-bloc="rapport">/.test(html), "la place est permanente, pas conditionnelle");
    assert.ok(html.includes(echappe(MOTS.titreRapport)));
  }
  assert.ok(sans.includes(echappe(MOTS.rapportAbsent)), "sans rapport, l'écran nomme le manque");
  assert.ok(!avec.includes(echappe(MOTS.rapportAbsent)), "avec rapport, il ne crie pas au loup");
  assert.ok(avec.includes(`${echappe(MOTS.compteNonDerive)} ${exemple.report.underived.length}`),
    "et il annonce combien de déclarations il a reçues");
});

test("aucune déclaration `underived` n'est perdue entre le moteur et l'écran", () => {
  const vue = modele(exemple.document, exemple.report);
  const placees = vue.rubriques.reduce((total, rubrique) => total + rubrique.declarations.length, 0);
  assert.equal(placees + vue.rapport.orphelines.length, exemple.report.underived.length,
    "chaque déclaration est soit rangée dans sa rubrique, soit affichée au bloc commun");

  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  const html = render(exemple.document, exemple.report);
  for (const entree of exemple.report.underived) {
    assert.ok(html.includes(echappe(renderUnderived(entree, frUnderived))), `la raison de « ${entree.field} » est à l'écran`);
  }

  /* L'aiguillage lui-même, sur les formes que le moteur emploie réellement. */
  assert.equal(rubriqueDe("stats"), "stats");
  assert.equal(rubriqueDe("stats[fh:destiny].other"), "stats");
  assert.equal(rubriqueDe("traits (classe, don, arrière-plan)"), "traits");
  assert.equal(rubriqueDe("spellcasting.spells[].castType"), "spellcasting");
  assert.equal(rubriqueDe("[bizarre]"), null, "ce qui ne commence pas par un identifiant part au bloc commun");
});

/* ══ 10 — L'EXEMPLE COMMITÉ EST CELUI DU GÉNÉRATEUR ═══════════════════ */

test("l'exemple Fate's Hand anglais commité est EXACTEMENT ce que son générateur produit", () => {
  /* Il est GÉNÉRÉ, pas écrit à la main — et c'est ce test qui le tient. Les
     octets sont comparés en mémoire : rien n'est écrit sur le disque, sinon
     `tests/tree-immuable.test.mjs` rougirait pour avoir simplement vérifié. */
  const commite = readFileSync(join(ROOT, SORTIE));
  assert.equal(octetsDe(exemple.document).equals(commite), true,
    `${SORTIE} a divergé de son générateur — rejouer « node src/tools/exemple-fh-en.mjs »`);
});

test("l'exemple porte bien ce que l'ancien ne portait pas : `stats` rempli, en anglais", () => {
  /* La mesure qui a justifié d'en fabriquer un : l'exemple français SRD porte
     `stats: []`, donc la rubrique la plus importante à regarder n'y montre
     rien. Les deux sont comparés ici pour que la raison reste vraie. */
  const ancien = JSON.parse(readFileSync(join(ROOT, "examples/personnage-srd-fr-niveau1.fh-char.json"), "utf8"));
  assert.deepEqual(ancien.resolved.stats, [], "l'ancien exemple ne montre aucune statistique dérivée");
  assert.equal(ancien.lang, "fr");

  assert.equal(exemple.document.lang, "en", "le neuf est en anglais — la table d'Eric y joue");
  assert.ok(exemple.document.resolved.stats.length >= 2);
  for (const stat of exemple.document.resolved.stats) {
    assert.ok(stat.breakdown.length >= 1, `« ${stat.id} » porte son détail`);
    assert.equal(stat.value, stat.breakdown.reduce((total, ligne) => total + ligne.value, 0),
      "et son total est la somme de son détail — le document est honnête au départ");
  }
});

/* ══ LA COQUILLE ══════════════════════════════════════════════════════ */

test("la coquille porte encore le marqueur où le fragment s'injecte", () => {
  /* Le seul point de la page qui se teste : sans le marqueur, la commande
     d'une ligne rendrait une page vide sans que rien ne bronche. Le module
     `fiche.mjs` jette dans ce cas — ici on vérifie le fichier lui-même. */
  const coquille = readFileSync(join(ROOT, "src/tools/fiche.shell.html"), "utf8");
  assert.ok(coquille.includes("<!--FICHE-->"), "la coquille garde sa place d'injection");
  assert.ok(!/<script/i.test(coquille), "et elle ne porte aucun script : zéro build, zéro framework");
});

/* ══ 7bis — LES HUIT FORMES DU CONTRAT QUI ÉCHAPPENT À LA GRAMMAIRE ═══

   Les quatre familles vues plus haut sont celles que le personnage d'exemple
   FAIT APPARAÎTRE. Le contrat en porte HUIT : les quatre autres dorment dans
   des rubriques qu'un niveau 1 laisse vides (`actions`, `conditions`). Un
   inventaire qui ne nommerait que ce qu'un document donné montre serait un
   inventaire de circonstance — celui-ci est lu dans le SCHÉMA, donc il vaut
   pour tous les personnages, y compris ceux qui n'existent pas encore.

   Chaque ligne dit CE QUI rend la forme inadressable. Le jour où le contrat en
   referme une (un `id` ajouté, une clef renommée), ce test tombe et
   INVENTAIRE-LOT-25.md se met à jour au lieu de vieillir en silence. */

const R = schema.$defs.resolved.properties;

test("le CONTRAT porte huit formes qu'aucun chemin d'override ne peut viser", () => {
  /* Deux causes, et une seule grammaire : `$defs/overridePath` désigne une
     clef d'objet par `[a-zA-Z][a-zA-Z0-9]*` et un élément de collection par
     une ancre `[a-z][a-z0-9:_-]*`. Tout ce qui sort de ces deux motifs est
     affichable mais pas tweakable. */

  /* ── CAUSE 1 : une collection dont les éléments n'ont pas d'`id`. ──── */
  const sansId = [
    ["resolved.identity.classes[]", R.identity.properties.classes],
    ["resolved.actions[].damage[]", R.actions.items.properties.damage],
    ["resolved.spellcasting.spells[].damage[]",
      schema.$defs.resolved.properties.spellcasting.oneOf[1].properties.spells.items.properties.damage],
    ["resolved.stats[].breakdown[]", R.stats.items.properties.breakdown]
  ];
  for (const [nom, forme] of sansId) {
    assert.equal(forme.type, "array", `${nom} est bien une collection`);
    assert.equal((forme.items.required || []).includes("id"), false,
      `${nom} : ses éléments n'ont pas d'\`id\` obligatoire, donc aucune ancre`);
  }

  /* ── CAUSE 2 : une collection de scalaires — rien à quoi accrocher. ── */
  const scalaires = [
    ["resolved.vitals.conditions[]", R.vitals.properties.conditions],
    ["resolved.actions[].properties[]", R.actions.items.properties.properties]
  ];
  for (const [nom, forme] of scalaires) {
    assert.equal(forme.items.type, "string", `${nom} : une chaîne ne porte pas d'identité`);
  }

  /* ── CAUSE 3 : des clefs que la grammaire ne sait pas écrire. ──────── */
  const slots = schema.$defs.resolved.properties.spellcasting.oneOf[1].properties.slots;
  assert.equal(slots.propertyNames.pattern, "^[1-9]$");
  assert.equal(/^[a-zA-Z][a-zA-Z0-9]*$/.test("1"), false,
    "un niveau d'emplacement s'écrit `1` : la grammaire attend une lettre en tête");

  /* ── CAUSE 4 : deux motifs du MÊME schéma qui ne se recouvrent pas. ── */
  const ancre = /^[a-z][a-z0-9:_-]*$/;
  assert.match("srd-5.2.1-en", new RegExp(schema.$defs.layerRef.properties.id.pattern),
    "un id de couche a le droit de porter des points");
  assert.equal(ancre.test("srd-5.2.1-en"), false,
    "…et l'ancre d'un chemin d'override les refuse : `resolved.derivation.stack[…]` est hors d'atteinte");
  /* Le contraste qui prouve que ce n'est pas la grammaire qui est en cause :
     un `slug`, lui, passe l'ancre de bout en bout. */
  assert.equal(ancre.test("fh:destiny"), true, "un `slug` du contrat, lui, s'ancre sans peine");
});

test("les quatre formes ENDORMIES se réveillent inadressables dès qu'un document les porte", () => {
  /* Mesuré plutôt que déduit : on pose dans un clone les quatre formes qu'un
     niveau 1 ne produit pas, et on regarde ce que l'écran en dit. */
  const porteur = structuredClone(exemple.document);
  porteur.resolved.vitals.conditions = ["prone"];
  porteur.resolved.actions = [{
    id: "dagger-strike", name: "Dagger", economy: "action", category: "attack",
    damage: [{ dice: "1d4", type: "piercing" }], properties: ["finesse"]
  }];
  porteur.resolved.spellcasting.spells[0].damage = [{ dice: "1d8", type: "cold" }];

  const rendus = cheminsRendus(render(porteur, exemple.report));
  const verdict = (chemin) => rendus.find((entree) => entree.chemin === chemin);
  for (const chemin of [
    "resolved.vitals.conditions[0]",
    "resolved.actions[dagger-strike].damage[0].dice",
    "resolved.actions[dagger-strike].properties[0]",
    "resolved.spellcasting.spells[ray-of-frost].damage[0].dice"
  ]) {
    const vu = verdict(chemin);
    assert.ok(vu !== undefined, `« ${chemin} » est bien affiché`);
    assert.equal(vu.adressable, false, `« ${chemin} » est affiché ET marqué inadressable`);
  }

  /* L'attaque n'a touché qu'un clone. */
  assert.deepEqual(exemple.document.resolved.actions, [], "l'original est intact");
});

test("les choix NON CONSOMMÉS sont nommés — une décision perdue ne disparaît pas en silence", () => {
  /* Trois choix de l'exemple ne laissent aucune trace dans `resolved` :
     `species.lineage`, `abilities.mode`, `languages[0]`. Le moteur le DIT
     (`unconsumed`) ; l'écran le répète, sinon le joueur croit que sa langue a
     été prise en compte. Détail et conséquence : INVENTAIRE-LOT-25.md, trou
     n°6. */
  assert.ok(exemple.report.unconsumed.length >= 3, "l'exemple en porte, sinon ce test ne mesure rien");
  const html = render(exemple.document, exemple.report);
  assert.ok(html.includes(echappe(MOTS.nonConsommes)));
  for (const chemin of exemple.report.unconsumed) {
    assert.ok(html.includes(`<code>${echappe(chemin)}</code>`), `« ${chemin} » est nommé à l'écran`);
  }
  /* Et le joueur avait bien décidé quelque chose : le choix existe. */
  assert.ok(exemple.document.build.choices.some((choix) => choix.path === "languages[0]"));
  assert.deepEqual(exemple.document.resolved.languages, [], "…et la rubrique est vide malgré tout");
});
