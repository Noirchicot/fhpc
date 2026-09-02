/* ══ LE GARDE DU SOCLE — LOT 58 ═══════════════════════════════════════════

   LE DÉFAUT QU'IL EXISTE POUR EMPÊCHER DE REVENIR (ERGONOMIE-BUILDER.md,
   partie A §0, mesuré) : `shell.mjs` faisait `app.innerHTML = ""` à chaque
   clic, et `grep -rn "scrollTop\|scrollY\|scrollTo" ui/` ne trouvait AUCUNE
   sauvegarde de position. Sur l'écran Compétences (16 513 px), ça se voyait à
   chaque geste — c'est la cause commune de « ça saute » et « ça remonte vers
   le haut », et elle détruisait cinq choses que les invariants exigent de
   garder.

   QUATRE PREUVES, PARCE QU'AUCUNE SEULE NE SUFFIT — même découpage que le
   garde du lot 57 (`tests/aria-pressed-guard.test.mjs`), et pour la même
   raison :

     A. STRUCTURELLE — aucun fichier de `ui/builder/` hors `socle.mjs` ne
        remplace le contenu d'un nœud. Sans elle, un futur lot rouvrirait le
        défaut en silence.
     B. COMPORTEMENTALE — `swapContent` conserve VRAIMENT la position, et le
        stub le prouve parce qu'il RABAT la position comme un vrai navigateur
        (voir `tests/dom-stub.mjs`, `_clearChildren`). Sans ce rabattement,
        le garde serait creux : un remplacement naïf passerait aussi.
     C. LA DÉCISION DU SCROLLSPY — `nearestIndex` est une fonction PURE,
        extraite exprès : la géométrie n'existe pas dans le stub, mais ce
        qu'on FAIT des mesures se teste.
     D. `scrollIntoView` A DISPARU DE `ui/` — la seconde moitié du défaut §0
        (`recenterBelt` recentrait la ceinture et déplaçait la page).

   ⚔️ CHAQUE PREUVE EST ATTAQUÉE. Un détecteur qu'on n'a jamais vu rougir
   n'est pas un détecteur (leçon des lots 55/56/57).

   🔴 SA LIMITE, ÉCRITE ICI PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : ce
   fichier prouve que la position est CONSERVÉE à travers un remplacement,
   jamais que l'écran est agréable. Il n'y a ni mise en page, ni hauteur, ni
   `scroll-snap` dans `tests/dom-stub.mjs` — l'aimantation, le rail et les
   chevrons se vérifient À L'ŒIL, dans un navigateur servi (voir
   INVENTAIRE-LOT-58.md). C'est la loi du dépôt depuis le 2026-08-14 : les
   cinq défauts qui ont lancé ce chantier ont TOUS été trouvés à l'œil, sous
   876 tests verts. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { loadSources, stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const { swapContent, nearestIndex, scrollParent } = await import("../ui/builder/socle.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI_DIR = path.join(ROOT, "ui", "builder");
const SHELL_PATH = path.join(UI_DIR, "shell.mjs");

/* ══ A — STRUCTURELLE : `socle.mjs` EST LE SEUL REMPLAÇANT ════════════════

   ⚠️ LA LISTE EST NOIRE ET ÉTROITE, ET LES DEUX MOTS COMPTENT.
   NOIRE : on nomme les gestes INTERDITS, jamais les fichiers autorisés —
   une liste blanche recopiée reproduit le risque qu'on corrige (leçon du
   lot 56).
   ÉTROITE : `innerHTML = ""` (VIDER) est le défaut ; `innerHTML = <chaîne>`
   (GARNIR) ne l'est pas. `shell.mjs` garnit légitimement un `<div>` NEUF
   avec la fiche de Review (lot 40, `renderFiche` rend une chaîne, décision
   d'architecture du lot 25) — ce nœud vient d'être créé, il ne défile pas,
   et aucune position n'y a jamais existé. Un garde qui mordrait dessus
   crierait au loup, et un garde qui crie au loup se fait désactiver
   (`tests/source-scan.mjs`, loi du dépôt). */
const REMPLACEMENTS_INTERDITS = [
  /* ⭐ DURCI AU LOT 65 : PLUS AUCUN `innerHTML`, vide ou plein. Le motif ne
     visait que l'assignation VIDE, parce qu'un seul site garnissait
     légitimement — l'étape Review, qui posait la chaîne de `renderFiche`.
     B9 a remplacé ce déversement par un masque, ce site a disparu, et la
     coquille n'en contient plus un seul. Le garde peut donc fermer la porte
     entièrement au lieu de la laisser entrebâillée. */
  [/\.innerHTML\s*=/, "innerHTML — la coquille n'en contient plus aucun depuis le lot 65"],
  [/\.replaceChildren\s*\(/, "replaceChildren hors socle.mjs — passe à côté de la conservation"],
  [/\.removeChild\s*\(/, "removeChild hors socle.mjs — la même chose, en boucle"]
];

function remplacantsHorsSocle(sources) {
  const hits = [];
  for (const source of sources) {
    if (path.basename(source.name) === "socle.mjs") continue;
    for (const [motif, libelle] of REMPLACEMENTS_INTERDITS) {
      if (motif.test(source.text)) hits.push(`${source.name} : ${libelle}`);
    }
  }
  return hits;
}

test("A — dans le vrai ui/builder/, seul socle.mjs remplace le contenu d'un nœud", () => {
  const sources = loadSources([UI_DIR], ROOT);
  assert.ok(sources.length >= 10, "le périmètre doit couvrir les ~15 fichiers de ui/builder/ (garde-fou de portée)");
  assert.deepEqual(remplacantsHorsSocle(sources), [],
    "tout remplacement hors socle.mjs peut jeter la position de défilement — passe par swapContent()");
});

test("⚔️ ATTAQUE A — le détecteur voit `app.innerHTML = \"\"` réintroduit, sur une source inventée", () => {
  const source = { name: "un-nouveau-fichier.mjs", text: 'app.innerHTML = "";\napp.append(node);' };
  assert.deepEqual(remplacantsHorsSocle([source]),
    ["un-nouveau-fichier.mjs : innerHTML — la coquille n'en contient plus aucun depuis le lot 65"]);
});

test("⚔️ ATTAQUE A bis — il voit aussi un `replaceChildren` direct, le contournement moderne du même geste", () => {
  const source = { name: "autre.mjs", text: "node.replaceChildren(...children);" };
  assert.deepEqual(remplacantsHorsSocle([source]),
    ["autre.mjs : replaceChildren hors socle.mjs — passe à côté de la conservation"]);
});

test("A ter — ⭐ ZÉRO `innerHTML` DANS TOUT ui/, et c'est la fin du défaut §0", () => {
  /* Les trois sites ont disparu l'un après l'autre : `app.innerHTML = ""`
     (lot 58, la cause de fond), les crans de la molette (même lot), et la
     fiche de Review (lot 65, remplacée par le masque de B9).
     ⛔ Ce test remplace celui qui gardait l'exception : il n'y en a plus. */
  const sources = loadSources([UI_DIR], ROOT);
  const restants = sources.filter((s) => /\.innerHTML/.test(s.text)).map((s) => s.name);
  assert.deepEqual(restants, [],
    "un `innerHTML` qui revient, c'est un nœud qu'on ne contrôle plus — et le défaut §0 rouvert par la fenêtre");
});

/* ══ B — COMPORTEMENTALE : LA POSITION SURVIT ═════════════════════════════ */

function scrollerAvecContenu(hauteur) {
  const node = document.createElement("div");
  node.append(document.createElement("p"));
  node.scrollTop = hauteur;
  return node;
}

test("B0 — TÉMOIN : le stub RABAT la position quand on vide, comme un vrai navigateur", () => {
  /* ⭐ SANS CE TÉMOIN, TOUT LE RESTE DE LA SECTION B SERAIT CREUX : un stub
     dont `scrollTop` persiste ferait passer `swapContent` ET son
     contournement. C'est le test qui donne sa force aux deux suivants. */
  const node = scrollerAvecContenu(6159);
  node.replaceChildren(document.createElement("p"));
  assert.equal(node.scrollTop, 0, "vider met la hauteur à zéro : la position ne désigne plus rien");
});

test("B — swapContent CONSERVE la position à travers un remplacement complet", () => {
  const node = scrollerAvecContenu(6159); // la mesure réelle du défaut A-1.3
  const neuf = document.createElement("section");
  swapContent(node, [neuf]);
  assert.equal(node.scrollTop, 6159, "la position d'avant est reposée — c'est TOUT le lot");
  assert.deepEqual(node.children, [neuf], "et le contenu a bien été remplacé, pas ajouté");
});

test("B bis — elle conserve AUSSI le défilement horizontal (la molette des étapes)", () => {
  const node = scrollerAvecContenu(0);
  node.scrollLeft = 320;
  swapContent(node, [document.createElement("span")]);
  assert.equal(node.scrollLeft, 320);
});

test("B ter — un remplacement VIDE conserve la position tout autant (le rail qui se vide)", () => {
  /* `paintAside` vide le rail quand l'écran n'en a pas. Le cas limite doit
     passer par la même porte que les autres — sinon il y aurait deux
     chemins, et deux chemins divergent. */
  const node = scrollerAvecContenu(120);
  swapContent(node, []);
  assert.equal(node.scrollTop, 120);
  assert.deepEqual(node.children, []);
});

test("⚔️ ATTAQUE B — un remplacement NAÏF perd la position, et c'est mesurable", () => {
  /* L'attaque n'est pas décorative : elle rejoue EXACTEMENT ce que faisait
     `render()` avant ce lot. Si un jour `swapContent` était vidée de sa
     substance, le test B ci-dessus rougirait pour la même raison que
     celui-ci passe. */
  const node = scrollerAvecContenu(6159);
  node.replaceChildren(document.createElement("section")); // ce que fait `innerHTML = ""` + append
  assert.equal(node.scrollTop, 0, "sans swapContent, la position est perdue — le défaut, reproduit");
});

/* ══ C — LA DÉCISION DU SCROLLSPY, PURE ═══════════════════════════════════ */

test("C — nearestIndex rend le cran le plus proche du haut du champ", () => {
  //  fiches à 0, 680, 1360… ; le champ est à 700 → la deuxième (index 1)
  assert.equal(nearestIndex([0, 680, 1360, 2040], 700), 1);
  assert.equal(nearestIndex([0, 680, 1360, 2040], 0), 0);
  assert.equal(nearestIndex([0, 680, 1360, 2040], 2000), 3);
});

test("C bis — les offsets sont NÉGATIFS quand on a défilé : c'est le cas normal, pas un cas limite", () => {
  /* `getBoundingClientRect().top` d'une fiche déjà dépassée est négatif
     RELATIVEMENT au champ. Le premier scrollspy écrit à la main sur ce
     chantier comparait des valeurs absolues et surlignait donc toujours la
     première fiche — mesuré en écrivant ce test. */
  assert.equal(nearestIndex([-1360, -680, 0, 680], 0), 2);
});

test("C ter — à égalité PARFAITE, le premier gagne — jamais une oscillation", () => {
  /* Sans le `<` strict de `nearestIndex`, deux fiches à distance égale (le
     milieu exact d'un geste) feraient basculer le rail d'un cran à l'autre à
     chaque image. */
  assert.equal(nearestIndex([-340, 340], 0), 0);
  assert.equal(nearestIndex([-340, 340], 0), 0, "et le résultat est stable, appel après appel");
});

test("C quater — aucune fiche : -1, jamais 0 (« la première » serait un mensonge)", () => {
  assert.equal(nearestIndex([], 0), -1);
});

/* ══ C quinquies — `scrollParent` REMONTE JUSQU'AU MARQUEUR, ET S'ARRÊTE ══ */

test("C quinquies — scrollParent trouve le conteneur marqué `data-scroller`, pas le premier parent venu", () => {
  const fiche = document.createElement("main");
  fiche.dataset.scroller = "fiche";
  const groupe = document.createElement("div");
  const section = document.createElement("section");
  groupe.append(section);
  fiche.append(groupe);
  assert.equal(scrollParent(section), fiche);
  assert.equal(scrollParent(fiche), null, "un nœud sans ancêtre marqué n'en invente pas un");
});

/* ══ D — `scrollIntoView` N'EXISTE PLUS DANS ui/ ══════════════════════════ */

function scrollIntoViewDans(sources) {
  return sources.filter((s) => /\bscrollIntoView\s*\(/.test(s.text)).map((s) => s.name);
}

test("D — plus aucun `scrollIntoView` dans ui/ — il déplaçait toute la chaîne des ancêtres", () => {
  assert.deepEqual(scrollIntoViewDans(loadSources([UI_DIR], ROOT)), [],
    "scrollIntoView remonte jusqu'à la page : c'est la seconde moitié du défaut §0 (recenterBelt). " +
    "Utilise keepInView(scroller, child, axis), qui ne touche qu'UN conteneur");
});

test("⚔️ ATTAQUE D — réintroduire recenterBelt() tel qu'il était fait rougir le garde D", () => {
  /* La ligne EXACTE de `shell.mjs` avant ce lot (git show 3a69116). */
  const source = { name: "shell.mjs", text: 'if (current) current.scrollIntoView({ inline: "center", block: "nearest" });' };
  assert.deepEqual(scrollIntoViewDans([source]), ["shell.mjs"]);
});

/* ══ E — LE CÂBLAGE DE shell.mjs, SUR LES OCTETS ══════════════════════════
   Même patron que la « garde 11 » de `tests/ui-jetons.test.mjs` : `shell.mjs`
   n'a aucun harnais de rendu, donc la seule preuve possible est la FORME du
   code. Et la leçon qui va avec, écrite là-bas : prouver qu'une chose est
   POSSIBLE ne prouve pas qu'elle est FAITE. */

const shellText = stripComments(fs.readFileSync(SHELL_PATH, "utf8"));

test("E — shell.mjs remplace le contenu de la fiche PAR swapContent, réellement écrit", () => {
  /* ⚠️ CIBLE ÉLARGIE LE 2026-08-15 : la scène porte désormais DEUX nœuds —
     l'écran, puis sa validation (refonte 2 §1b, `renderValidation`). La
     propriété gardée n'a pas changé d'un pouce : c'est `swapContent` qui
     remplit la fiche, et lui seul. On accepte donc ce qu'on lui passe, sans
     relâcher QUI la remplit. */
  /* ⚠️ CIBLE RÉÉLARGIE LE 2026-08-17 : la liste des nœuds passe par
     `poserLaSortie`, qui décide si le pied d'étape va au bas de la scène ou
     dans la dalle qui l'a déclaré. La propriété gardée n'a TOUJOURS pas
     bougé : c'est `swapContent` qui remplit la fiche, et lui seul. On garde
     donc QUI la remplit, et on cesse de garder la forme de ce qu'on lui
     passe — c'était le détail, pas la règle. */
  /* ⚠️ CIBLE RÉÉLARGIE LE 2026-08-19 : la liste gagne un chapeau de chapitre
     en tête (F3/FF3). Troisième élargissement, même phrase à chaque fois —
     c'est `swapContent` qui remplit la fiche, et lui seul. */
  assert.match(shellText, /swapContent\(frame\.stage,[\s\S]{0,160}poserLaSortie\(renderStepContent\(\)/,
    "sans cette ligne, la fiche se remplirait par un autre chemin — et la position repartirait à zéro");
});

test("E bis — UN SEUL endroit du dépôt remet la fiche en haut, et c'est `openSurface`", () => {
  /* 🔴 LA RÈGLE QUE CE TEST TIENT : `swapContent` ne remet JAMAIS en haut de
     lui-même ; une nouvelle surface, si. Si un second site se mettait à
     écrire `fiche.scrollTop = 0`, on aurait deux politiques de défilement
     qui divergeraient — la faute exacte payée par le lot 53. */
  /* Les DEUX formes d'écriture comptent — sinon un passage de `scrollTop =`
     à `scrollTo({top})` désarmerait le garde sans changer le comportement.
     C'est la faute que l'ATTAQUE 6 du garde des jetons a faite pour de vrai
     ce jour-là : un renommage l'avait rendue verte à tort. */
  const ecritures = shellText.match(/frame\.stage\.(scrollTop\s*=|scrollTo\()/g) || [];
  assert.equal(ecritures.length, 1, `un seul site doit remettre la fiche en haut — trouvé ${ecritures.length}`);

  /* Et il est DANS `openSurface`, jamais dans `refresh` : une mise à jour ne
     renvoie pas le joueur en haut. Les deux corps sont découpés sur le texte
     plutôt que par une seule expression — `openSurface` porte maintenant une
     branche (`at`, le point d'aimantation d'arrivée), et un motif `[^}]*` ne
     traverse pas une accolade. */
  const corpsDe = (nom) => {
    const debut = shellText.indexOf(`function ${nom}(`);
    assert.ok(debut > 0, `${nom} doit exister dans shell.mjs`);
    const suivant = shellText.indexOf("\nfunction ", debut + 1);
    return shellText.slice(debut, suivant === -1 ? shellText.length : suivant);
  };
  assert.match(corpsDe("openSurface"), /frame\.stage\.scrollTo\(\{ top: 0, behavior: "instant" \}\)/,
    "openSurface est le seul à décider qu'une surface neuve s'ouvre en haut — et INSTANTANÉMENT, jamais par un voyage animé");
  assert.doesNotMatch(corpsDe("refresh"), /scrollTop|scrollTo\(/,
    "refresh ne touche JAMAIS au défilement — c'est la règle qui fait tenir tout le socle");
});

test("E ter — `resize` est branché sur refresh, jamais sur openSurface", () => {
  /* Mesuré en écrivant ce lot : l'ancien `render` était branché tel quel sur
     `resize`, donc tourner le téléphone renvoyait en haut d'un écran de
     16 513 px. Personne ne l'avait mesuré — ce n'était qu'un cas de plus du
     défaut §0, mais celui-là ne demande même pas de cliquer. */
  /* ⚠️ RÉÉCRIT LE 2026-08-30 — L'INVARIANT EST LE MÊME, LE CHEMIN A UN CRAN
     DE PLUS. `resize` passe désormais par `surRedimensionnement`, qui repose
     l'échelle AVANT de redessiner : en mode automatique le cran dépend de la
     fenêtre, donc étirer la colonne peut changer de cran et de grandeur.
     🔴 Ce qui compte n'a pas bougé : ce chemin appelle `refresh`, JAMAIS
     `openSurface` — tourner le téléphone ne renvoie pas en haut de l'écran.
     Le test le vérifie sur le CORPS du gestionnaire, pas sur son nom. */
  const brancheResize = shellText.match(/window\.addEventListener\("resize",\s*(\w+)\)/);
  assert.ok(brancheResize, "`resize` doit être branché sur un gestionnaire nommé");
  const nomDuGestionnaire = brancheResize[1];
  if (nomDuGestionnaire !== "refresh") {
    const corps = shellText.match(new RegExp(`function ${nomDuGestionnaire}\\(\\)\\s*\\{([^}]*)\\}`));
    assert.ok(corps, `le gestionnaire \`${nomDuGestionnaire}\` doit être une fonction lisible d'un coup d'œil`);
    assert.match(corps[1], /\brefresh\(\)/, "il redessine par `refresh`");
    assert.doesNotMatch(corps[1], /\bopenSurface\(/,
      "et JAMAIS par `openSurface` : tourner le téléphone renverrait en haut d'un écran de 16 513 px");
  }
});

/* ⚠️ RÉÉCRIT AU LOT 120 — L'INVARIANT TIENT, IL A DEUX MOITIÉS MAINTENANT.
   La clause comptait `mountFrame()` : deux occurrences, sa déclaration et son
   unique appel. Le double affichage (Eric, 2026-09-02) a coupé cette fonction
   en deux — un BELT monté une fois, un PANNEAU monté deux fois — donc la
   phrase « le cadre est monté une fois » était devenue fausse telle quelle.
   ⛔ Elle n'est PAS relâchée pour autant (TRAPS : *« réécrire à la nouvelle
   vérité, jamais relâcher »*) : elle est plus serrée qu'avant, parce qu'elle
   tient maintenant DEUX comptes au lieu d'un. Un troisième panneau, ou un
   second belt, la fait rougir. */
test("E quater — un seul BELT, exactement DEUX panneaux", () => {
  const belts = shellText.match(/monterBelt\(\)/g) || [];
  assert.equal(belts.length, 2,
    "sa déclaration et son unique appel — un second belt et le croquis d'Eric n'est plus respecté (« belt totalement déroulé », UN pour les deux panneaux)");
  const panneaux = shellText.match(/monterPanneau\(/g) || [];
  assert.equal(panneaux.length, 3,
    "sa déclaration et ses DEUX appels — le double affichage en pose deux, jamais un troisième");
});

/* ══ F — ⭐ CHAQUE MODULE DE `ui/` SE PARSE, ET LA COQUILLE AUSSI ══════════

   🔴 TROUVÉ EN SE PRENANT LE MUR, DEUX FOIS DANS LA MÊME SÉANCE (lot 66) :
   une **virgule manquante** dans `state` a tué toute l'application — page
   blanche, aucun cran de molette, rien — et **les 993 tests sont restés
   verts**. Un import oublié (`rollAbilityBatch`, lot 63) était passé pareil.

   La cause est structurelle, et elle était déjà écrite dans le dépôt sans
   qu'on en tire la conséquence : `shell.mjs` n'a AUCUN harnais de rendu, et
   tous ses gardes le lisent **en octets**. Personne ne l'IMPORTE. Un fichier
   qu'aucun test n'importe peut donc être syntaxiquement mort sans qu'une
   seule suite bronche.

   ⚠️ CE QUE CE GARDE NE FAIT PAS : il ne monte pas la coquille (elle a
   besoin d'un vrai DOM, d'un `fetch`, d'un `window`). Il ne prouve donc
   AUCUN comportement. Il prouve seulement que **le fichier est du
   JavaScript valide** — ce qui, mesuré aujourd'hui, était le maillon
   manquant entre « 993 verts » et « l'écran s'affiche ». */

test("F — tous les modules de ui/builder/ se parsent, la coquille comprise", async () => {
  const { execFileSync } = await import("node:child_process");
  const fichiers = loadSources([UI_DIR], ROOT).map((s) => path.join(ROOT, s.name));
  assert.ok(fichiers.length >= 10, "garde-fou de portée");
  const casses = [];
  for (const fichier of fichiers) {
    try {
      execFileSync(process.execPath, ["--check", fichier], { stdio: "pipe" });
    } catch (erreur) {
      casses.push(`${path.relative(ROOT, fichier)} : ${String(erreur.stderr).split("\n").find((l) => /Error/.test(l)) || "parse error"}`);
    }
  }
  assert.deepEqual(casses, [],
    "un module qui ne se parse pas rend la page BLANCHE, et aucun autre test ne le voit — " +
    "ils lisent shell.mjs en octets, personne ne l'importe");
});

test("⚔️ ATTAQUE F — une virgule manquante dans un module est bien vue", async () => {
  const { execFileSync } = await import("node:child_process");
  const os = await import("node:os");
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-parse-"));
  const fautif = path.join(dossier, "shell.mjs");
  /* La faute EXACTE du lot 66, rejouée : une virgule oubliée entre deux
     champs d'un objet littéral. */
  fs.writeFileSync(fautif, "const state = {\n  equipmentSearch: false\n  rollingMethod: \"fh3d6\"\n};\n");
  let vu = false;
  try { execFileSync(process.execPath, ["--check", fautif], { stdio: "pipe" }); } catch { vu = true; }
  fs.rmSync(dossier, { recursive: true, force: true });
  assert.ok(vu, "sans ça, le garde F ne prouverait rien");
});
