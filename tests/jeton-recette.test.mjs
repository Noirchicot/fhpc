/* ══ LA DIAGONALE DE LA RECETTE — ce qui EST un blueprint, et ce qui ne l'est pas ══

   ⚖️ ERIC, 2026-09-23 : *« certains éléments de wares sont des recettes »*, puis
   *« il faut mettre en évidence les tokens recettes (blueprints) […] une diagonale
   de bas en haut, moitié inférieure droite, bleue »*, puis, le soir :
   *« les kits d'aventuriers sont des blueprints aussi. Activation simple mais
   activation nécessaire »*.

   🔴 CETTE SUITE NAÎT D'UNE DETTE, ET JE L'ÉCRIS EN TÊTE PARCE QUE C'EST LE VRAI
   SUJET : la diagonale a été dessinée le 23/09, commitée, déployée — ET AUCUN
   GARDE NE LA TENAIT. Trois organes (le prédicat, le nœud du jeton, la règle de
   feuille) et pas une assertion. ⛔ Un organe sans garde n'est pas « en attente
   de test » : il est en attente de RÉGRESSION SILENCIEUSE, et il l'aurait eue au
   premier record ajouté.

   ── CE QUE LES QUATRE FAMILLES DE GARDES TIENNENT ──────────────────────────
     ① le PRÉDICAT — ses trois signaux, chacun éprouvé SEUL, et ses refus ;
     ② la DONNÉE RÉELLE — les sept kits d'Eric, comptés sur la pile montée,
        jamais énumérés par leur nom ici ;
     ③ le JETON — le fond est un nœud, il passe AVANT le nom, il est muet, et
        le lecteur d'écran, lui, entend « recipe » ;
     ④ la FEUILLE — la diagonale est vraiment peinte, et sa couleur est un jeton.
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
const TOKENS = fs.readFileSync(path.join(ROOT, "ui", "builder", "tokens.css"), "utf8");

const { estRecette, poidsParLieu } = await import("../ui/builder/equipement-pipeline.mjs");
const { corpsDuJeton, motDuJeton } = await import("../ui/builder/jeton-objet.mjs");

const fixture = exempleFhEn();
const query = fixture.layers.verbs.query;

/* ══ ① LE PRÉDICAT — TROIS SIGNAUX, ET CHACUN DOIT SUFFIRE SEUL ═══════════ */

test("1 — les trois signaux d'Eric, chacun ÉPROUVÉ SEUL sur un record qui ne porte que lui", () => {
  /* ⛔ « Seul » n'est pas une précaution de style : un record de test qui porte
     deux signaux passe même si l'un des deux est mort dans le code. */
  assert.equal(estRecette({ data: { category: "weapon" } }), true, "① une arme magique part de sa base mondaine");
  assert.equal(estRecette({ data: { category: "armor" } }), true, "① une armure aussi");
  assert.equal(estRecette({ data: { rarity: "Rarity Varies" } }), true, "② le marqueur de famille du SRD");
  assert.equal(estRecette({ data: { contents: [{ ref: "srd:gear:en:rope" }] } }), true,
    "③ ⭐ UN OBJET QUI EN CONTIENT D'AUTRES : il faut l'OUVRIR, donc c'est un blueprint");
  assert.equal(estRecette({ data: { contents: [] } }), false,
    "⛔ ET UNE LISTE VIDE N'EN EST PAS UN : `contents: []` dit « on a regardé, il n'y a rien », "
    + "ce qui n'est pas la même chose qu'un paquet. Un objet vide n'a rien à défaire.");
});

test("2 — ⚔️ ATTAQUE : ce qui N'EST PAS une recette, et ces quatre cas sont réels", () => {
  /* 🔴 LE PIÈGE MESURÉ LE 23/09, ET IL A COÛTÉ UN COMPTE FAUX : un filtre sur la
     PROSE attrapait `Staff of Fire` et `Wand of Fear`, qui portent des tables de
     SORTS, pas de variantes. J'avais annoncé 28 familles ; il y en a 13. */
  assert.equal(estRecette({ data: { rarity: "Very Rare (Requires Attunement)" } }), false,
    "⛔ `(Requires Attunement)` suit UNE rareté — une parenthèse n'est pas une énumération");
  assert.equal(estRecette({ data: { rarity: "Rare" } }), false, "une rareté simple n'énumère rien");
  assert.equal(estRecette({ data: { cost: "2 GP", weight: "5 lb." } }), false,
    "⛔ un sac à dos ORDINAIRE n'est pas un kit : même genre, même étagère d'allée, autre étagère");
  /* ⚔️ le garde sait accuser : sans record du tout, il ne jette pas et ne dit pas oui. */
  assert.equal(estRecette(null), false, "un record absent n'est pas une recette (et ne fait pas tomber l'écran)");
  assert.equal(estRecette(undefined), false);
});

test("3 — 🔧 LE SIGNAL A DÉMÉNAGÉ DANS LE RECORD, et le détour par l'étagère a disparu", () => {
  /* 🔴 À GARDER, PARCE QUE ÇA S'EST JOUÉ EN UNE SOIRÉE. Au premier jet, ce
     prédicat lisait l'ÉTAGÈRE `adventuring:packs` — non par goût, mais parce que
     les sept packs du SRD ne portaient QUE `cost`, `name`, `weight`. Rien dans
     leur record ne les distinguait d'un sac à dos ; l'étagère était le seul
     endroit où « ceci est un kit » existait dans la donnée.
     ⭐ Puis `contents` est monté en amont, et le garde 4 — qui épinglait « ce
     record ne porte que trois champs » — est tombé. Il était écrit pour poser
     exactement cette question : *le signal doit-il déménager dans le record ?*
     ⛔ ET LA RÉPONSE ÉTAIT OUI, PARCE QU'UN DÉTOUR QU'ON GARDE DEVIENT UNE SECONDE
     VÉRITÉ : un pack redéplacé aurait perdu sa diagonale sans changer de nature.
     Le signal vit désormais où vit la RAISON — *cet objet en contient d'autres*.
     ⚔️ CE GARDE TIENT LA PORTE FERMÉE : si `chercheEtagere` reparaissait dans la
     signature, c'est que le détour serait revenu. */
  assert.equal(estRecette.length, 1,
    "⛔ `estRecette(record)` — UN SEUL argument. Un second dirait qu'un appelant doit "
    + "savoir quelque chose que le record ne dit pas.");
  assert.equal(poidsParLieu.length, 2,
    "⛔ `poidsParLieu(lignes, chercheRecord)` — et pas de troisième : le poids se lit "
    + "entièrement dans les records, sans rien demander au rangement.");
});

/* ══ ② LA DONNÉE RÉELLE — SUR LA PILE MONTÉE, PAS SUR UN RECORD FABRIQUÉ ══ */

test("4 — ⭐ LES SEPT KITS SE DÉCLARENT EUX-MÊMES, et on les compte sur la pile montée", () => {
  /* ⛔ AUCUN NOM DE KIT N'EST ÉCRIT ICI. On BALAIE le genre `gear` et on retient
     ce qui porte un contenu — le jour où un huitième paquet entre, ce garde le
     compte sans qu'on le retouche. C'est tout l'intérêt d'un signal qui vit dans
     la donnée plutôt que d'une liste de noms. */
  const kits = query({ kind: "gear" }).filter((v) => {
    const c = ((v.record && v.record.data) || {}).contents;
    return Array.isArray(c) && c.length > 0;
  });
  assert.equal(kits.length, 7, "les sept packs du SRD — Burglar, Diplomat, Dungeoneer, Entertainer, Explorer, Priest, Scholar");
  assert.equal(kits.reduce((n, v) => n + v.record.data.contents.length, 0), 64,
    "📏 64 éléments — 11 + 11 + 9 + 10 + 8 + 7 + 8, relus à l'œil dans le PDF épinglé (p.96-99) "
    + "avec `pdftotext -layout`, un extracteur AUTRE que celui du pipeline amont");

  /* 🔧 CE BLOC ÉPINGLAIT « trois champs » ET IL EST TOMBÉ LE 23/09 AU SOIR,
     quand `contents` est monté. C'est lui qui a fait déménager le signal du
     blueprint — voir le garde 3. ⭐ Il continue de tenir la FORME du record,
     parce que c'est elle qui décide où le signal a le droit de vivre. */
  for (const k of kits) {
    const objet = k;
    assert.ok(objet, "le kit pointe un record réel");
    assert.deepEqual(Object.keys(objet.record.data).sort(), ["contents", "cost", "name", "weight"],
      `⛔ ${objet.record.name} porte cost/name/weight ET \`contents\` — rien d'autre`);
    assert.ok(objet.record.data.contents.length > 0, `${objet.record.name} : son contenu n'est pas vide`);
    assert.equal(estRecette(objet.record), true,
      `⭐ et il est donc une recette PAR LUI-MÊME : ${objet.record.name}`);
  }
});

/* ══ ③ LE JETON — L'ORDRE DU DOM EST LA LOI, PAS UN `z-index` ═════════════ */

test("5 — 🔴 LE FOND PASSE AVANT LE NOM, et c'est ce qui évite un `z-index` à accorder", () => {
  const document = createTestDocument();
  globalThis.document = document;
  try {
    const noeuds = corpsDuJeton({ nom: "Explorer's Pack", qte: 1, recette: true });
    assert.equal(noeuds[0].className, "jeton-recette",
      "⛔ PREMIER, toujours : un fond posé après le nom le recouvrirait. L'ordre du DOM suffit, "
      + "et il n'a pas à s'accorder avec les `z-index` des quatre marques.");
    assert.equal(noeuds[0].getAttribute("aria-hidden"), "true",
      "⛔ MUET : une couleur que rien ne prononce est une information réservée aux voyants");

    const sans = corpsDuJeton({ nom: "Backpack", qte: 1, recette: false });
    assert.equal(sans.some((n) => n.className === "jeton-recette"), false,
      "⚔️ et le garde sait accuser : sans le drapeau, aucun fond");
    /* ⛔ `recette: true` STRICTEMENT — une valeur molle (1, "oui") ne peint pas. */
    const mou = corpsDuJeton({ nom: "x", qte: 1, recette: 1 });
    assert.equal(mou.some((n) => n.className === "jeton-recette"), false,
      "⛔ le drapeau est un booléen VRAI, pas une valeur qui ressemble à vrai");
  } finally { delete globalThis.document; }
});

test("6 — ⭐ CE QUE LE LECTEUR D'ÉCRAN ENTEND : « recipe », et il l'entend EN PREMIER", () => {
  assert.equal(motDuJeton({ nom: "Explorer's Pack", qte: 1, recette: true }), "Explorer's Pack, recipe");
  assert.equal(motDuJeton({ nom: "Arrows", qte: 10, recette: true, equipped: true }),
    "Arrows ×10, recipe, equipped",
    "⭐ l'ordre est celui du croquis : la quantité tient au nom, puis la nature, puis les états");
  assert.equal(motDuJeton({ nom: "Backpack", qte: 1 }), "Backpack",
    "⚔️ et un objet ordinaire ne dit rien de plus");
});

/* ══ ④ LA FEUILLE — LA DIAGONALE EST VRAIMENT PEINTE ═════════════════════ */

test("7 — ⚔️ LA DIAGONALE EXISTE DANS LA FEUILLE, et elle va bien en BAS À DROITE", () => {
  /* 🔴 SANS CE GARDE, TOUT CE QUI PRÉCÈDE PASSERAIT SUR UN NŒUD INVISIBLE — un
     `<span>` sans règle est un nœud parfaitement valide, parfaitement vide, et
     les six tests d'au-dessus resteraient verts. C'est le défaut exact que la
     grille du tambour a payé le 23/08 (« quinze cases VIDES »). */
  const regle = /\.jeton-recette\s*\{([^}]*)\}/.exec(CSS);
  assert.ok(regle, "`.jeton-recette` porte une règle");
  /* 🔴 LES COMMENTAIRES SORTENT AVANT TOUTE ASSERTION, ET C'EST UNE FAUTE PAYÉE
     DANS CE TEST MÊME. Le `doesNotMatch(/border-radius: inherit/)` d'en dessous a
     rougi sur la PHRASE DU COMMENTAIRE qui explique pourquoi on ne l'écrit plus —
     la règle était juste, le garde accusait la prose qui la défend.
     ⭐ C'est la leçon du dépôt, reprise ici : compter un mot compte aussi la phrase
     qui le nie. Un garde de feuille mesure des DÉCLARATIONS, ⛔ jamais du texte. */
  const corps = regle[1].replace(/\/\*[\s\S]*?\*\//g, " ");
  assert.match(corps, /linear-gradient\(\s*to bottom right\s*,\s*transparent 50%\s*,\s*var\(--jeton-recette\) 50%\s*\)/,
    "⭐ MOITIÉ INFÉRIEURE DROITE, de bas en haut — le croquis d'Eric, et la coupure est NETTE (50 % / 50 %)");
  assert.match(corps, /position:\s*absolute/);
  /* ⚖️ AMENDÉ LE 23/09 AU SOIR, DEVANT LE RENDU — Eric : *« la diagonale s'arrête
     sous la bande supérieure pour la laisser vide »*. L'assertion d'avant disait
     `inset: 0` (« il couvre la tuile entière ») : elle était juste jusqu'à cette
     phrase, et c'est elle qui a rougi au changement. ⭐ Elle n'est pas SUPPRIMÉE,
     elle est REMPLACÉE par la cote qui la contredit — un garde retiré aurait
     laissé la géométrie sans témoin. */
  assert.match(corps, /inset:\s*var\(--jeton-bande\) 0 0 0/,
    "⭐ ELLE S'ARRÊTE SOUS LA BANDE, et par le jeton qui NOMME la bande — ⛔ jamais un 14 nu");
  assert.match(corps, /pointer-events:\s*none/,
    "⛔ un fond ne prend pas le clic : la tuile dessous reste le bouton");
  assert.match(corps, /border-end-start-radius:\s*inherit/);
  assert.match(corps, /border-end-end-radius:\s*inherit/,
    "⛔ les deux coins DU BAS suivent la tuile, sinon la diagonale déborde de l'arrondi");
  assert.doesNotMatch(corps, /border-radius:\s*inherit/,
    "🔴 ET SURTOUT PAS LES QUATRE : descendue sous la bande, ses coins hauts tombent au MILIEU "
    + "du jeton — un rayon là creuse une encoche dans le bleu, contre le bord droit, où elle se voit.");
});

test("8 — 🎨 LA COULEUR EST UN JETON, aux DEUX thèmes — jamais un hex dans la feuille", () => {
  assert.equal(/--jeton-recette/.test(CSS), true, "la feuille lit le jeton");
  const valeurs = [...TOKENS.matchAll(/--jeton-recette:\s*([^;]+);/g)].map((m) => m[1].trim());
  assert.equal(valeurs.length, 2,
    "⛔ DEUX déclarations : le jour et la nuit. Une seule voudrait dire qu'un thème hérite de l'autre "
    + "une couleur qui n'a pas été mesurée sur son fond.");
  for (const v of valeurs) assert.match(v, /^#[0-9a-f]{6}$/i, `« ${v} » — une couleur, chez les jetons`);
  assert.notEqual(valeurs[0], valeurs[1], "⚔️ et les deux thèmes ne portent pas la MÊME valeur");
});

/* ══ ⑤ UN BLUEPRINT NE PÈSE RIEN — ERIC, 2026-09-23 ═══════════════════════ */

test("9 — ⚖️ UN BLUEPRINT NE PÈSE RIEN, et ce zéro n'est PAS un « à éditer »", () => {
  /* ⚖️ Eric, 23/09 : *« une précision : un blueprint n'a pas de poids »*.
     ⭐ C'est cohérent avec ce qu'il EST : une recette n'est pas l'objet, c'est la
     promesse de l'objet. Un plan d'épée ne pèse pas ce que pèse l'épée.
     🔴 ET LA DISTINCTION QUE CE GARDE TIENT EST LA SEULE QUI COMPTE : « Varies »
     pèse 0 ET RESTE compté dans `inconnus`, parce qu'il ATTEND une édition ; un
     blueprint pèse 0 et n'attend rien. ⛔ Si les deux se confondaient, l'écran
     dirait « plus 3 objets qu'on ne sait pas peser » à propos de trois recettes,
     et personne n'irait jamais les « réparer » — elles sont déjà justes. */
  const catalogue = {
    "x:kit": { data: { weight: "42 lb.", contents: [{ ref: "srd:gear:en:rope" }] } },  // un pack : lourd, et blueprint
    "x:epee": { data: { weight: "3 lb." } },   // une épée ordinaire
    "x:varie": { data: { weight: "Varies" } }  // le cas qui, lui, reste inconnu
  };
  const rec = (ref) => catalogue[ref.id];
  const lignes = [
    { ref: { id: "x:kit" }, location: "backpack", quantity: 2 },
    { ref: { id: "x:epee" }, location: "backpack", quantity: 1 }
  ];

  const avec = poidsParLieu(lignes, rec);
  assert.equal(avec.somme.backpack, 3,
    "⛔ 3 lb, pas 87 : les deux kits à 42 lb ne pèsent rien tant qu'ils sont des plans");
  assert.equal(avec.compte.backpack, 3, "⭐ mais ils SONT dans le sac — le compte les voit");
  assert.equal(avec.inconnus.backpack, 0,
    "⛔ ET ILS NE SONT PAS « À ÉDITER » : leur poids n'est pas manquant, il est NUL par règle");

  /* ⚔️ LE TÉMOIN QUI PROUVE QUE LE GARDE MESURE QUELQUE CHOSE : le MÊME kit, privé
     de son `contents`, redevient un objet ordinaire et ses 84 lb reviennent. Sans
     cette ligne, le test passerait aussi sur un `poidsParLieu` qui aurait perdu
     les kits en route et ne pèserait plus rien du tout. */
  const sans = poidsParLieu(lignes, (ref) => (ref.id === "x:kit" ? { data: { weight: "42 lb." } } : catalogue[ref.id]));
  assert.equal(sans.somme.backpack, 87, "⚔️ 2 × 42 + 3 — le kit pèse dès qu'il cesse d'être un paquet");

  /* ⚔️ ET « VARIES » N'A PAS CHANGÉ DE NATURE AU PASSAGE. */
  const varie = poidsParLieu([{ ref: { id: "x:varie" }, location: "backpack", quantity: 3 }], rec);
  assert.equal(varie.somme.backpack, 0);
  assert.equal(varie.inconnus.backpack, 3,
    "⭐ lui reste INCONNU — c'est exactement ce qui le sépare d'un blueprint");
});

/* ══ ⑤ LES TROIS POSES — LE TROU QUE CE FICHIER N'AVAIT PAS VU ════════════════
   🔴 CE QUI S'EST PASSÉ, ET POURQUOI LES HUIT GARDES D'AU-DESSUS ÉTAIENT VERTS.
   Le 23/09, la diagonale a été posée avec un commentaire qui disait, dans
   l'organe : *« R et le sac portent le MÊME jeton »*. ⛔ Ils sont TROIS. `grep -l
   corpsDuJeton ui/builder/*.mjs` rend `gear-ecran`, `sac-ecran` ET `wares-ecran`,
   et c'est le troisième — le CATALOGUE, le seul écran où Eric a demandé la
   diagonale en premier — qui ne recevait pas le drapeau. Sa pose portait `ref` et
   `nom`, rien d'autre. Résultat mesuré en ligne : `.jeton-recette` = **0** sur sept
   packs affichés, pendant que le prédicat, le nœud et la feuille étaient justes.
   ⭐ AUCUN DES HUIT NE POUVAIT LE DIRE : ils éprouvent le prédicat, l'organe et la
   feuille — ⛔ jamais l'APPELANT. Un organe correct qu'on n'appelle pas correctement
   ne laisse aucune trace. C'est la forme de panne que ce dépôt appelle « une
   écriture qui échoue en silence ».

   ⚠️ ET CE GARDE-CI EST FAIBLE, JE L'ÉCRIS PLUTÔT QUE DE LE LAISSER CROIRE FORT.
   Il lit une SOURCE, pas un rendu. La pose de Wares se fabrique au milieu d'une
   closure de rendu que rien n'exporte, donc je ne peux pas l'appeler pour de vrai
   sans monter tout l'écran. ⛔ Un garde de forme ne prouve pas que la diagonale se
   peint ; il prouve seulement que l'appelant a le geste. ⭐ Il aurait rougi
   aujourd'hui, et c'est la seule raison de l'écrire. Le jour où la fabrique des
   plaques devient importable, il se remplace par une pose lue pour de bon. */
test("10 — ⚔️ DE LA COUCHE JUSQU'AU NŒUD, EN UNE SEULE ASSERTION CONTINUE", async () => {
  /* 🔴 CE GARDE REMPLACE UNE REGEX, ET LA RAISON EST TOUT LE LOT 257.
     Sa version d'avant lisait la SOURCE de `equipment-step.mjs` et cherchait
     `recette: estRecette(item.view.record)` dans le texte. Elle se déclarait faible
     elle-même, et elle avait raison : elle éprouvait une COPIE du texte de l'écran,
     jamais ce que l'écran FABRIQUE. Elle existait parce que la pose était une
     expression anonyme au fond d'une closure — ⛔ rien ne pouvait l'appeler.
     ⭐ `poseDeWares` est sortie en organe exporté. L'écran l'appelle, ce garde
     l'appelle, et il n'y a plus de copie entre les deux.

     ⚖️ ET C'EST LE TROU QUE LA SOIRÉE DU 23/09 A MONTRÉ, PAS UN ZÈLE. Trois gardes
     verts tenaient trois maillons — le 11 va de la couche au prédicat, le 5 tient
     l'ordre du DOM, le 7 tient la feuille — et AUCUN ne les touchait l'un l'autre.
     La diagonale a pu rester invisible sur sept kits sous une suite entièrement
     verte. Un maillon non tenu entre deux gardes ne se voit pas : il se déduit,
     et personne ne le déduit. */
  const { lireRangement, poseDeWares } = await import("../ui/builder/equipment-step.mjs");

  /* ① la couche — ce que la descente depuis `fh-srd` a écrit */
  const couche = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
  const attendus = Object.values(couche.records.gear || {})
    .filter((r) => Array.isArray(r.data && r.data.contents) && r.data.contents.length > 0)
    .map((r) => r.data.name).sort();
  assert.ok(attendus.length > 0, "⛔ la couche ne porte aucun `contents` — tout ce qui suit mesurerait le vide");

  /* ② la pile que l'écran monte, ③ la pose que l'écran fabrique — son organe, pas une copie */
  const { rayons } = lireRangement(query);
  const objets = rayons.flatMap((r) => r.etageres).flatMap((e) => e.objets);
  const poses = objets.map(poseDeWares);
  assert.equal(poses.length, objets.length, "une pose par objet rangé, aucune perdue");

  /* ④ le nœud que `corpsDuJeton` produit pour cette pose — le dernier maillon.
     ⭐ Le DOM du stub, comme les gardes 5 et 6 : `corpsDuJeton` fabrique des nœuds,
     donc il lui faut un `document`. ⛔ Et il est RENDU après coup, même si une
     assertion tombe : un global laissé derrière soi contamine les fichiers suivants
     de la suite, et ce serait un rouge ailleurs qu'ici. */
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  let dessines;
  try {
    dessines = poses
      .filter((pose) => corpsDuJeton(pose).some((n) => n.className === "jeton-recette"))
      .map((pose) => pose.nom).sort();
  } finally {
    if (avant === undefined) delete globalThis.document; else globalThis.document = avant;
  }

  /* ⚔️ ET LA COMPARAISON EST UNE INCLUSION, PAS UNE ÉGALITÉ — ⛔ et ce n'est pas un
     assouplissement. Les kits ne sont pas les seules recettes : une arme et une armure
     en sont aussi (`category`), et une rareté énumérée aussi. Exiger l'égalité ferait
     rougir ce garde au premier objet magique rangé, ce qui n'a rien à voir avec ce
     qu'il surveille. ⭐ Ce qu'il tient : tout ce que la COUCHE déclare avec un contenu
     ressort DESSINÉ à l'autre bout. */
  for (const nom of attendus) {
    assert.ok(dessines.includes(nom),
      `🔴 « ${nom} » porte un contenu dans la couche et ne reçoit AUCUNE diagonale à l'arrivée.\n`
      + "   La chaîne est : couche → `lireRangement` → `poseDeWares` → `corpsDuJeton` → le nœud.\n"
      + `   Dessinés à l'arrivée : ${dessines.join(", ") || "(aucun)"}`);
  }
  assert.ok(dessines.length >= attendus.length);

  /* ⚠️ ⑤ ET LE DERNIER MAILLON RESTE UNE LECTURE DE SOURCE — je l'écris plutôt que
     de laisser croire que tout est tenu par la donnée. Ce qui précède éprouve
     l'ORGANE de bout en bout ; ⛔ il ne dit pas que l'ÉCRAN l'appelle. Une closure
     de rendu ne s'interroge pas sans monter tout l'écran, et si quelqu'un remet une
     pose écrite à la main dans les plaques, les quatre assertions d'au-dessus
     restent vertes. 🔴 C'est LE MÊME TROU, DÉPLACÉ D'UN CRAN — le nommer est la
     seule chose honnête à faire, parce que c'est exactement ce qui a coûté la
     diagonale : un maillon qu'on déduit au lieu de le tenir.
     ⭐ Mais cette lecture-ci vaut mieux que celle qu'elle remplace : elle épingle
     UN APPEL, pas une copie de trois champs. Changer les champs de la pose ne la
     fait plus rougir à tort ; cesser d'appeler l'organe, si. */
  const src = fs.readFileSync(path.join(ROOT, "ui", "builder", "equipment-step.mjs"), "utf8");
  assert.match(src, /objets:\s*page\.objets\.map\(poseDeWares\)/,
    "🔴 les plaques de Wares ne passent plus par `poseDeWares`. Si c'est voulu, l'organe doit "
    + "disparaître avec — ⛔ mais une pose réécrite à la main dans la closure, c'est la panne du "
    + "23/09 à l'identique : sept kits sans diagonale, et pas un garde pour le dire.");
});

/* ══ ⑥ LA DESCENTE, SUR LA VRAIE PILE ══════════════════════════════
   🔧 CE GARDE A CHANGÉ DE SUJET EN GARDANT SON RÔLE, ET ÇA MÉRITE D'ÊTRE ÉCRIT.
   Sa première forme (ARCHI 35, lot 256) tenait : *la clef que l'ÉCRAN a sous la
   main ouvre-t-elle la porte du prédicat ?* — `e.id` de `lireRangement` contre
   `ETAGERE_DES_KITS`. ⛔ Cette constante n'existe plus : le signal du blueprint a
   déménagé de l'étagère vers le record le même soir, quand `contents` est monté.
   ⭐ CE QU'IL PROTÉGEAIT EXISTE TOUJOURS, et c'est même plus intéressant : l'écran
   n'a plus besoin de clef, le record se suffit — donc ce qui reste à tenir, c'est
   que la DESCENTE atteigne la pile. Un `contents` présent dans la couche et absent
   de la pile montée, et sept kits perdent leur diagonale sans un rouge.
   ⛔ IL N'ÉPINGLE AUCUN NOMBRE, et c'est délibéré : « 7 » deviendrait faux au
   premier kit que Fate's Hand ajoute, et un garde qu'on assouplit à chaque ajout
   finit par ne plus rien dire. Il compare deux comptes qui doivent être égaux. */
test("11 — ⚔️ LA DESCENTE DE `contents` ATTEINT LA PILE QUE L'ÉCRAN MONTE", async () => {
  const { lireRangement } = await import("../ui/builder/equipment-step.mjs");
  const couche = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
  const porteUnContenu = (d) => Array.isArray(d && d.contents) && d.contents.length > 0;
  const dansLaCouche = Object.values(couche.records.gear || {})
    .filter((r) => porteUnContenu(r.data)).length;
  assert.ok(dansLaCouche > 0,
    "⛔ la couche ne porte AUCUN `contents` — la descente depuis `fh-srd` s'est perdue en amont, "
    + "et tout ce qui suit mesurerait le vide");

  const { rayons } = lireRangement(query);
  const dansLaPile = rayons.flatMap((r) => r.etageres).flatMap((e) => e.objets)
    .filter((o) => porteUnContenu(o.view.record && o.view.record.data));
  assert.equal(dansLaPile.length, dansLaCouche,
    `⛔ ${dansLaCouche} record(s) à \`contents\` dans la couche, ${dansLaPile.length} dans la pile montée `
    + "— la descente se perd entre les deux, et personne ne le dirait");

  /* ⚔️ ET LE PRÉDICAT LES VOIT TOUS. C'est le dernier maillon : la donnée peut
     arriver intacte et le prédicat la manquer quand même. */
  for (const o of dansLaPile) {
    assert.equal(estRecette(o.view.record), true,
      `⛔ « ${o.view.id} » porte un contenu et le prédicat ne le voit pas`);
  }
});
