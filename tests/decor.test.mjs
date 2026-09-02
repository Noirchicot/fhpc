/* ══ LE GARDE DU DÉCOR — LOT 59 ═══════════════════════════════════════════

   CE QU'IL EXISTE POUR EMPÊCHER : qu'une image de fond entre, ou change, sans
   que personne ne remesure ce qu'elle fait au contraste. Le fond passe SOUS
   tout le texte des dalles de verre — c'est le seul élément du builder dont
   un remplacement silencieux peut rendre un écran illisible sans toucher une
   ligne de CSS.

   ⭐ LE PROBLÈME QU'IL FALLAIT RÉSOUDRE, ET LA SORTIE CHOISIE : ce dépôt
   n'a AUCUNE dépendance runtime (loi Q3), donc Node ne sait pas décoder un
   JPEG et le garde ne peut pas relire les pixels. La sortie n'est pas de
   renoncer à mesurer — c'est de LIER la mesure au fichier :

     · `ui/builder/assets/backgrounds.measured.json` porte, pour chaque
       image, son **sha256** et ses **deux pixels extrêmes** (le plus sombre
       et le plus clair de la zone réellement vue, après le flou cuit) ;
     · ce garde recalcule le **sha256 du fichier servi** et exige qu'il
       corresponde. Remplacer une image sans remesurer FAIT ROUGIR ;
     · puis il recalcule le **contraste WCAG** depuis ces deux extrêmes, pour
       chaque encre et chaque voile, en lisant les valeurs dans `tokens.css`.
       Changer `--voile-simple`, ou une encre, ou la surface, refait donc
       toute l'arithmétique.

   🔴 SA LIMITE, ÉCRITE ICI PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : il ne
   décode aucune image. Si la mesure enregistrée est FAUSSE, il la croira —
   il garantit la CORRESPONDANCE entre un fichier et une mesure, jamais la
   justesse de la mesure elle-même. C'est pourquoi les deux pixels extrêmes
   sont dans le JSON plutôt qu'un simple verdict : au moins l'arithmétique
   qui en découle est refaite ici, à chaque suite.

   ══ LOT 134 — IL BOUCLE MAINTENANT SUR LES COLLECTIONS ════════════════════
   Le dépôt sert PLUSIEURS paires jour/nuit, et le joueur en change depuis le
   Menu. ⭐ CE FICHIER NE NOMME DONC PLUS AUCUNE IMAGE : il lit `collections`
   dans le registre et refait tout — condensat, poids, bande, matrice — pour
   CHACUNE. Une troisième collection déposée dans le JSON entre dans le garde
   toute seule, sans qu'une ligne de test soit écrite ; et une collection
   déclarée sans mesure, ou mesurée sans être déclarée, est nommée (garde 0).

   ⛔ ET C'EST BIEN CHAQUE COLLECTION QUI DOIT PASSER, pas la première : le
   joueur qui choisit la troisième voit son texte sur SON fond. Un garde qui
   ne mesurerait que le défaut laisserait entrer une paire illisible derrière
   un réglage que personne du chantier n'a ouvert. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
/* ⭐ LE MODULE LUI-MÊME, PAS UNE COPIE DE SES RÈGLES — lot 136. La liste des
   encres repeignables et le filtre qui les retient sont chez lui ; les
   recopier ici aurait donné deux voix pour une même loi, et c'est exactement
   la maladie que ce dépôt traque. */
import { ENCRES_ADMISES, encresDeLaCollection, feuilleDesEncres } from "../ui/builder/fonds.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI_DIR = path.join(ROOT, "ui", "builder");
const ASSETS = path.join(UI_DIR, "assets");
const MESURE = JSON.parse(fs.readFileSync(path.join(ASSETS, "backgrounds.measured.json"), "utf8"));
const tokensCss = fs.readFileSync(path.join(UI_DIR, "tokens.css"), "utf8");
const shellCss = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8"));

/* Les jetons lus DANS le fichier, jamais recopiés : si la palette bouge, ce
   garde bouge avec elle. `tokens.css` déclare le jour avant le bloc sombre. */
const strippedTokens = stripComments(tokensCss);
const darkIndex = strippedTokens.indexOf("@media (prefers-color-scheme: dark)");
function props(text) {
  const map = new Map();
  for (const m of text.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  return map;
}
const JETONS = {
  jour: props(strippedTokens.slice(0, darkIndex)),
  nuit: new Map([...props(strippedTokens.slice(0, darkIndex)), ...props(strippedTokens.slice(darkIndex))])
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}
function relativeLuminance([r, g, b]) {
  const lin = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const [rl, gl, bl] = [r, g, b].map(lin);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}
function contrast(a, b) {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
/** Le fond EFFECTIF sous une dalle : `voile` de la surface, le reste de l'image. */
function sousLeVoile(surface, pixel, voile) {
  return [0, 1, 2].map((i) => voile * surface[i] + (1 - voile) * pixel[i]);
}

/* ⭐ LES PAIRES À MESURER, LUES DANS LE REGISTRE — jamais écrites ici.
   Rendu : `[{ collection, nom, fichier }]`, une entrée par image servie. */
const COLLECTIONS = Array.isArray(MESURE.collections) ? MESURE.collections : [];
const THEMES = COLLECTIONS.flatMap((c) => [
  { collection: c.id, nom: "jour", fichier: c.jour },
  { collection: c.id, nom: "nuit", fichier: c.nuit }
]);

/* ══ 0 — LE REGISTRE SE TIENT DEBOUT TOUT SEUL ════════════════════════════
   ⛔ CE QU'IL EMPÊCHE, ET RIEN D'AUTRE NE LE VERRAIT : une collection ajoutée
   à moitié. Déclarer une paire sans déposer sa mesure rendrait `MESURE
   .fichiers[fichier]` indéfini — et un `undefined.sha256` fait tomber le
   garde 1 avec une pile, pas avec une phrase. Mesurer un fichier que plus
   aucune collection ne nomme est l'autre moitié : du poids mort qui traverse
   les publications sans que personne le sache. */

test("0 — le registre : au moins deux collections, chacune complète et mesurée", () => {
  assert.ok(COLLECTIONS.length >= 2,
    `${COLLECTIONS.length} collection(s) déclarée(s) — le dépôt en sert plusieurs depuis le lot 134`);
  const fautes = [];
  const nommes = new Set();
  const ids = new Set();
  for (const c of COLLECTIONS) {
    if (!c.id || !c.nom) fautes.push(`collection sans id ou sans nom : ${JSON.stringify(c)}`);
    if (ids.has(c.id)) fautes.push(`deux collections portent l'id « ${c.id} »`);
    ids.add(c.id);
    for (const role of ["jour", "nuit"]) {
      const fichier = c[role];
      if (!fichier) { fautes.push(`${c.id} n'a pas d'image ${role}`); continue; }
      nommes.add(fichier);
      if (!MESURE.fichiers[fichier]) fautes.push(`${c.id} → ${fichier} n'a AUCUNE mesure dans \`fichiers\``);
      if (!fs.existsSync(path.join(ASSETS, fichier))) fautes.push(`${c.id} → ${fichier} n'est pas dans assets/`);
    }
  }
  for (const fichier of Object.keys(MESURE.fichiers)) {
    if (!nommes.has(fichier)) fautes.push(`${fichier} est mesuré mais AUCUNE collection ne le nomme`);
  }
  assert.deepEqual(fautes, [],
    "ajouter une collection est UNE opération de données : deux JPEG, une entrée dans `collections`, " +
    "deux dans `fichiers` — ce garde nomme la moitié qui manque");
  /* Et le défaut existe : c'est lui que `tokens.css` peint avant qu'un module
     ait tourné, et celui sur lequel `fonds.mjs` retombe quand l'id gardé
     désigne une collection retirée. */
  assert.ok(COLLECTIONS.some((c) => c.id === MESURE.defaut),
    `le défaut « ${MESURE.defaut} » n'est pas une collection déclarée`);
});

/* ══ 1 — LES FICHIERS SERVIS SONT CEUX QUI ONT ÉTÉ MESURÉS ════════════════ */

for (const { collection, nom, fichier } of THEMES) {
  test(`1 — ${collection}/${nom} — ${fichier} : le fichier servi est EXACTEMENT celui qui a été mesuré (sha256)`, () => {
    const bytes = fs.readFileSync(path.join(ASSETS, fichier));
    const sha = crypto.createHash("sha256").update(bytes).digest("hex");
    assert.equal(sha, MESURE.fichiers[fichier].sha256,
      `${fichier} a changé sans être remesuré. Le fond passe SOUS tout le texte des dalles de verre : ` +
      "une image remplacée en silence peut rendre un écran illisible sans qu'une ligne de CSS bouge.");
  });

  test(`1bis — ${collection}/${nom} — ${fichier} est bien un JPEG, et léger`, () => {
    const bytes = fs.readFileSync(path.join(ASSETS, fichier));
    /* Les octets magiques, pas l'extension : un PNG renommé `.jpg` passerait
       le nom et pèserait 1,9 Mo (mesuré sur les sources). */
    assert.equal(bytes[0], 0xFF, "octet magique JPEG attendu");
    assert.equal(bytes[1], 0xD8, "octet magique JPEG attendu");
    assert.ok(bytes.length < 120 * 1024,
      `${fichier} pèse ${Math.round(bytes.length / 1024)} Ko — au-delà de 120 Ko, c'est qu'on a reperdu ` +
      "le flou cuit ou le JPEG (les sources PNG faisaient 1,9 et 1,5 Mo pour la MÊME image)");
  });

  test(`1ter — ${collection}/${nom} — ${fichier} : la mesure enregistrée dit ZÉRO pixel hors bande`, () => {
    const m = MESURE.fichiers[fichier];
    assert.equal(m.hors_bande, 0, `${m.hors_bande} pixels hors de la bande ${m.bande.join("–")}`);
    const [lo, hi] = m.bande;
    for (const [label, px] of [["le plus sombre", m.pixel_le_plus_sombre], ["le plus clair", m.pixel_le_plus_clair]]) {
      const v = Math.max(...px);
      assert.ok(v >= lo && v <= hi, `le pixel ${label} (${v}) sort de la bande ${lo}–${hi}`);
    }
  });
}

/* ══ 2 — LES TROIS VOILES SONT CEUX QU'ERIC A RATIFIÉS ════════════════════ */

test("2 — les trois voiles valent 35 / 50 / 100 % (le 35 arrêté le 2026-08-14, il valait 20)", () => {
  assert.equal(JETONS.jour.get("voile-simple"), "35%");
  assert.equal(JETONS.jour.get("voile-inter"), "50%");
  assert.equal(JETONS.jour.get("voile-majeure"), "100%");
});

test("2bis — les trois dalles existent en CSS et lisent leur voile, jamais un littéral", () => {
  /* Le CORPS de la règle, pas la règle entière : les trois dalles portent
     aussi leur rayon, et un motif qui exigeait un bloc d'une seule
     déclaration a rougi dès qu'on l'a ajouté (mesuré). Ce qui compte est que
     le fond vienne du jeton de voile, jamais d'un littéral. */
  const corpsDeLaRegle = (selecteur) => {
    const m = shellCss.match(new RegExp(`\\${selecteur}\\s*\\{([^}]*)\\}`));
    assert.ok(m, `la règle ${selecteur} doit exister dans shell.css`);
    return m[1];
  };
  assert.match(corpsDeLaRegle(".dalle-simple"), /background:\s*var\(--dalle-simple\)/);
  assert.match(corpsDeLaRegle(".dalle-intermediaire"), /background:\s*var\(--dalle-inter\)/);
  assert.match(corpsDeLaRegle(".dalle-majeure"), /background:\s*var\(--surface\)/);
  /* Et les deux surfaces de verre se dérivent de --surface par leur voile —
     une seule source pour la surface, comme `--accent-wash`. */
  assert.match(strippedTokens, /--dalle-simple:\s*color-mix\(in srgb, var\(--surface\) var\(--voile-simple\), transparent\)/);
  assert.match(strippedTokens, /--dalle-inter:\s*color-mix\(in srgb, var\(--surface\) var\(--voile-inter\), transparent\)/);
});

test("2ter — l'image de fond bascule avec le thème, et vient d'un jeton", () => {
  assert.match(shellCss, /background-image:\s*var\(--bg-image\)/,
    "shell.css ne doit nommer aucun fichier — l'image est un jeton, comme une couleur");
});

/* ══ 2 quater — 🔴 LES DEUX AXES NE SE CONFONDENT PAS (LOT 134) ═══════════
   LA COLLECTION dit quelle PAIRE sert · LE THÈME dit LAQUELLE des deux
   images. Le contrat de câblage qui les sépare :

     `--bg-jour` / `--bg-nuit`  = la PAIRE   → posés par `fonds.mjs` sur :root
     `--bg-image`               = le THÈME   → aiguillage de `tokens.css` seul

   ⛔ CE QU'IL EMPÊCHE, ET ÇA NE SE VOIT PAS À LA LECTURE : que `fonds.mjs`
   « simplifie » en écrivant directement `--bg-image`. Ça marcherait — au
   chargement. Puis l'appareil basculerait en mode sombre à 19 h, et le fond
   resterait celui du jour, parce qu'une propriété posée en ligne bat la media
   query pour toujours. Un défaut qu'aucun rendu de chantier ne rencontre. */

test("2 quater — tokens.css sépare la PAIRE (--bg-jour/--bg-nuit) du THÈME (--bg-image)", () => {
  /* Le jour et la nuit aiguillent, ils ne nomment pas de fichier. */
  assert.equal(JETONS.jour.get("bg-image"), "var(--bg-jour)");
  assert.equal(JETONS.nuit.get("bg-image"), "var(--bg-nuit)");
  /* Et la paire écrite en CSS est celle du DÉFAUT — ce que le navigateur peint
     avant qu'un module ait tourné. ⛔ Les autres collections ne sont nommées
     NULLE PART dans le CSS : c'est ce qui rend leur ajout gratuit en code. */
  const defaut = COLLECTIONS.find((c) => c.id === MESURE.defaut);
  assert.equal(JETONS.jour.get("bg-jour"), `url("./assets/${defaut.jour}?v=${JETONS.jour.get("bg-jour").match(/\?v=(\d+)/)[1]}")`);
  assert.equal(JETONS.jour.get("bg-nuit"), `url("./assets/${defaut.nuit}?v=${JETONS.jour.get("bg-nuit").match(/\?v=(\d+)/)[1]}")`);
  /* La version est EXIGÉE, mais pas son chiffre : `bin/nouvelle-version.mjs`
     l'incrémente à chaque publication, et un chiffre en dur ici rougirait à
     chaque fois (contrat du lot 75, tenu par tests/versions-graphe). */
  assert.match(JETONS.jour.get("bg-jour"), /^url\("\.\/assets\/[\w.-]+\?v=\d+"\)$/);
  assert.match(JETONS.jour.get("bg-nuit"), /^url\("\.\/assets\/[\w.-]+\?v=\d+"\)$/);
  for (const c of COLLECTIONS) {
    if (c.id === MESURE.defaut) continue;
    assert.ok(!strippedTokens.includes(c.jour) && !strippedTokens.includes(c.nuit),
      `tokens.css nomme un fichier de la collection « ${c.id} » — ajouter une collection ` +
      "ne doit coûter AUCUNE ligne de CSS, sinon le mécanisme n'en est pas un");
  }
});

test("2 quinquies — fonds.mjs pose la PAIRE et ne touche JAMAIS --bg-image", () => {
  /* Byte-check assumé (patron `shell-wiring`) : ce module écrit dans le DOM,
     on ne peut pas l'exécuter ici pour le prendre en faute — mais la
     DISCIPLINE, elle, se lit. */
  const fonds = stripComments(fs.readFileSync(path.join(UI_DIR, "fonds.mjs"), "utf8"));
  assert.match(fonds, /setProperty\("--bg-jour"/, "fonds.mjs doit poser --bg-jour");
  assert.match(fonds, /setProperty\("--bg-nuit"/, "fonds.mjs doit poser --bg-nuit");
  assert.ok(!/--bg-image/.test(fonds),
    "fonds.mjs nomme --bg-image : une propriété posée EN LIGNE bat la media query pour toujours, " +
    "et le fond cesserait de suivre le thème dès la première bascule système");
});

/* ══ 3 — ⭐ LA MATRICE, RECALCULÉE ICI ════════════════════════════════════
   C'est le cœur du garde. Il refait l'arithmétique de la matrice écrite en
   tête de `shell.css` — depuis les jetons du fichier et les pixels extrêmes
   du JSON — et exige que les verdicts soient ceux-là. Changer un voile, une
   encre, la surface OU l'image refait donc tout le calcul.

   ⚠️ CE QU'IL AFFIRME EST DÉLIBÉRÉMENT DANS LES DEUX SENS : `--text` DOIT
   passer, et les trois autres NE DOIVENT PAS. Un garde qui n'exigerait que
   les réussites laisserait quelqu'un « réparer » `--text-muted` en montant
   le voile à 90 % — c'est-à-dire en supprimant le verre — sans rien casser.
   L'échec fait partie du contrat : il dit que le verre a un prix. */

const ENCRES = [
  { jeton: "text", cible: 4.5, doitPasser: true },
  { jeton: "text-soft", cible: 4.5, doitPasser: false },
  { jeton: "text-muted", cible: 4.5, doitPasser: false },
  { jeton: "border-strong", cible: 3.0, doitPasser: false },
  { jeton: "accent", cible: 4.5, doitPasser: false }
];

/* ══ LOT 136 — 🎨 UNE COLLECTION PEUT PORTER SES PROPRES ENCRES ═══════════
   Eric : *« Les backgrounds ont aussi leurs couleurs de texte et boutons
   associés bien sûr. »*

   🔴 ET LE CONTRAT DE CONTRASTE NE CÈDE PAS : les encres d'une collection
   passent la MÊME matrice que la palette de `tokens.css`, sur SES pixels
   extrêmes. ⛔ Une encre qui échoue est une encre qui CÈDE — jamais le voile,
   jamais le jeton, jamais ce garde.

   ⭐ CE QUI REND L'AJOUT D'UNE 4ᵉ COLLECTION ENCORE GRATUIT : rien ici ne
   nomme une collection ni une couleur. La matrice lit `encresEffectives`, qui
   part de `tokens.css` et laisse la collection en repeindre une partie. Une
   collection sans encres retombe donc EXACTEMENT sur les clauses d'avant. */

/** Les encres RÉELLEMENT servies pour une collection et un thème : la palette
 *  de `tokens.css`, repeinte par ce que la collection déclare.
 *  ⚠️ Le témoin est nommé : le DÉFAUT est `tokens.css`, l'ÉCART est la
 *  collection. Mesurer la collection contre elle-même ne dirait rien. */
function encresEffectives(collectionId, theme) {
  const jetons = JETONS[theme];
  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  const declare = (encresDeLaCollection(collection) || {})[theme] || {};
  const table = new Map();
  for (const { jeton } of ENCRES) table.set(jeton, declare[jeton] || jetons.get(jeton));
  return table;
}

test("3 ter — la liste des encres repeignables est CELLE de la matrice, pas une seconde", () => {
  /* ⛔ Une encre que `fonds.mjs` laisserait repeindre sans que la matrice la
     mesure entrerait dans la page sans passer le contraste. Et une encre
     mesurée ici qu'aucune collection ne peut repeindre n'aurait rien à faire
     dans la liste blanche. Les deux moitiés, dans les deux sens. */
  assert.deepEqual([...ENCRES_ADMISES], ENCRES.map((e) => e.jeton));
  assert.ok(!ENCRES_ADMISES.includes("surface"),
    "`--surface` est le VERRE, pas une encre : le repeindre changerait les trois voiles et toute la matrice");
});

test("3 quater — toute encre DÉCLARÉE est admise, hexadécimale, et RETENUE", () => {
  /* ⛔ Le filtre de `fonds.mjs` est silencieux au navigateur (une encre
     malformée y rend la palette normale plutôt que de casser le décor). Ici il
     doit être BRUYANT : une encre écrite dans le registre et jetée en silence
     est une couleur qu'Eric croit avoir posée. */
  const fautes = [];
  for (const c of COLLECTIONS) {
    if (!c.encres) continue;
    const retenu = encresDeLaCollection(c) || {};
    for (const [theme, bloc] of Object.entries(c.encres)) {
      if (!["jour", "nuit"].includes(theme)) { fautes.push(`${c.id} : « ${theme} » n'est ni jour ni nuit`); continue; }
      for (const [jeton, valeur] of Object.entries(bloc)) {
        if (!ENCRES_ADMISES.includes(jeton)) fautes.push(`${c.id}/${theme} : « ${jeton} » n'est pas une encre repeignable`);
        else if (!(retenu[theme] && retenu[theme][jeton] === valeur))
          fautes.push(`${c.id}/${theme}/${jeton} : « ${valeur} » a été JETÉE (il faut #rrggbb)`);
      }
    }
  }
  assert.deepEqual(fautes, []);
});

test("3 quinquies — la feuille des encres PORTE la media query, elle ne la contourne pas", () => {
  /* 🔴 MÊME PIÈGE QUE `--bg-image`, ET IL VAUT DOUBLE ICI : une encre posée EN
     LIGNE sur `:root` battrait la media query pour toujours, et le texte
     cesserait de suivre le thème dès la première bascule système à 19 h.
     C'est pour ça que ce module écrit une FEUILLE et non `style.setProperty`. */
  const froide = COLLECTIONS.find((c) => c.encres && c.encres.nuit);
  assert.ok(froide, "au moins une collection doit déclarer des encres — sinon ce garde ne mesure rien");
  const css = feuilleDesEncres(encresDeLaCollection(froide));
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(css, /^:root \{/m);
  /* ⛔ ET LE GARDE COMPTE LES `setProperty`, IL NE CHERCHE PAS DES NOMS. Un
     nom LITTÉRAL se cherche ; un nom CALCULÉ (`"--" + jeton`) passerait à
     travers, et c'est exactement la faute qu'une première rédaction de cette
     clause a laissé passer — éprouvée, restée verte, réécrite. La propriété
     tenue est donc : `fonds.mjs` n'a le droit de poser EN LIGNE que la paire
     d'images, et ces deux-là seulement. */
  const fonds = stripComments(fs.readFileSync(path.join(UI_DIR, "fonds.mjs"), "utf8"));
  const poses = [...fonds.matchAll(/setProperty\(([^,]*)/g)].map((m) => m[1].trim());
  assert.deepEqual(poses, ['"--bg-jour"', '"--bg-nuit"'],
    "fonds.mjs ne pose EN LIGNE que la paire d'images : une encre écrite en ligne battrait la " +
    "media query pour toujours, et le texte cesserait de suivre le thème dès la première bascule système");
});

test("⚔️ ATTAQUE 🎨 — une encre de collection qui ÉCHOUE au contraste est vue, et une qui passe ne l'est pas", () => {
  /* 🔴 UN GARDE QUI N'A JAMAIS ROUGI EST UNE INTENTION. On mesure ici les DEUX
     côtés de l'alternative, sur la même collection et le même thème :
     · un `--text` volontairement pâle DOIT tomber sous 4,5 ;
     · celui que le registre déclare vraiment DOIT tenir.
     ⛔ Si la première ligne devenait verte, la matrice ne mesurerait plus les
     encres de collection du tout. */
  const froide = COLLECTIONS.find((c) => c.encres && c.encres.nuit);
  const m = MESURE.fichiers[froide.nuit];
  const jetons = JETONS.nuit;
  const voile = Number(jetons.get("voile-simple").replace("%", "")) / 100;
  const surface = hexToRgb(jetons.get("surface"));
  const pire = (hex) => Math.min(
    contrast(hexToRgb(hex), sousLeVoile(surface, m.pixel_le_plus_sombre, voile)),
    contrast(hexToRgb(hex), sousLeVoile(surface, m.pixel_le_plus_clair, voile))
  );
  const truque = encresDeLaCollection({ encres: { nuit: { ...froide.encres.nuit, text: "#6b6660" } } });
  assert.ok(pire(truque.nuit.text) < 4.5,
    "l'encre truquée doit ÉCHOUER — sinon la clause ne prouve rien");
  assert.ok(pire(encresEffectives(froide.id, "nuit").get("text")) >= 4.5,
    "et celle du registre doit tenir");
});

for (const { collection, nom, fichier } of THEMES) {
  for (const voileNom of ["voile-simple", "voile-inter"]) {
    test(`3 — ${collection}/${nom}, ${voileNom} : seul --text tient sur le verre`, () => {
      const jetons = JETONS[nom];
      const voile = Number(jetons.get(voileNom).replace("%", "")) / 100;
      const surface = hexToRgb(jetons.get("surface"));
      const m = MESURE.fichiers[fichier];
      const encres = encresEffectives(collection, nom);

      for (const { jeton, cible, doitPasser } of ENCRES) {
        const encre = hexToRgb(encres.get(jeton));
        /* Les DEUX extrêmes : selon que l'encre est plus claire ou plus
           sombre que le fond, le pire cas est l'un ou l'autre. */
        const pire = Math.min(
          contrast(encre, sousLeVoile(surface, m.pixel_le_plus_sombre, voile)),
          contrast(encre, sousLeVoile(surface, m.pixel_le_plus_clair, voile))
        );
        if (doitPasser) {
          assert.ok(pire >= cible,
            `--${jeton} tombe à ${pire.toFixed(2)}:1 sous ${voileNom} (${nom}) — cible ${cible}. ` +
            "Si --text ne tient plus sur le verre, plus RIEN ne tient : le verre n'a plus d'usage.");
        } else {
          assert.ok(pire < cible,
            `--${jeton} atteint ${pire.toFixed(2)}:1 sous ${voileNom} (${nom}), au-dessus de ${cible}. ` +
            "Si c'est vrai, la matrice de shell.css est PÉRIMÉE et doit être réécrite — " +
            "ne desserre pas ce test, corrige la matrice (et vérifie qu'on n'a pas simplement supprimé le verre).");
        }
      }
    });
  }

  test(`3bis — ${collection}/${nom}, dalle MAJEURE : toutes les encres passent (c'est là qu'elles vivent)`, () => {
    const jetons = JETONS[nom];
    const surface = hexToRgb(jetons.get("surface"));
    const encresLa = encresEffectives(collection, nom);
    for (const { jeton, cible } of ENCRES) {
      /* Voile 100 % : l'image ne traverse plus, on retombe exactement sur le
         cas que les gardes du lot 38 mesurent déjà. Ce test vérifie que la
         SORTIE existe — sans elle, la matrice interdirait sans rien offrir. */
      const pire = contrast(hexToRgb(encresLa.get(jeton)), surface);
      assert.ok(pire >= cible, `--${jeton} ne tient que ${pire.toFixed(2)}:1 sur une dalle majeure (${nom})`);
    }
  });
}

/* ══ ⚔️ LES ATTAQUES ══════════════════════════════════════════════════════ */

test("⚔️ ATTAQUE — une image remplacée en douce fait rougir le garde 1", () => {
  const vrai = fs.readFileSync(path.join(ASSETS, "bg-day.jpg"));
  const truque = Buffer.concat([vrai, Buffer.from([0x00])]); // un octet de plus, rien de visible
  const sha = crypto.createHash("sha256").update(truque).digest("hex");
  assert.notEqual(sha, MESURE.fichiers["bg-day.jpg"].sha256,
    "un seul octet de différence doit suffire — c'est tout l'intérêt d'un condensat");
});

test("⚔️ ATTAQUE — revenir au voile de 20 % fait tomber --text-soft encore plus bas, et le garde le voit", () => {
  /* On rejoue le voile d'AVANT la décision d'Eric. Le test ne rougit pas
     (--text-soft doit échouer, et il échoue encore plus) — ce que l'attaque
     prouve, c'est le SENS : moins de voile = moins de contraste. C'est la
     thèse que le conseiller avançait le 2026-08-14, vérifiée ici en Node. */
  const jetons = JETONS.jour;
  const surface = hexToRgb(jetons.get("surface"));
  const m = MESURE.fichiers["bg-day.jpg"];
  const encre = hexToRgb(jetons.get("text"));
  const a20 = contrast(encre, sousLeVoile(surface, m.pixel_le_plus_sombre, 0.20));
  const a35 = contrast(encre, sousLeVoile(surface, m.pixel_le_plus_sombre, 0.35));
  assert.ok(a35 > a20,
    `monter le voile doit AUGMENTER le contraste du texte — mesuré ${a20.toFixed(2)} à 20 %, ${a35.toFixed(2)} à 35 %`);
});

test("⚔️ ATTAQUE — un fond hors bande ferait tomber --text sous la cible, et le garde 3 le verrait", () => {
  /* Une image dont le pixel le plus sombre serait à 60 (au lieu de 129) —
     c'est-à-dire hors de la bande 104–190 du thème clair. */
  const jetons = JETONS.jour;
  const surface = hexToRgb(jetons.get("surface"));
  const encre = hexToRgb(jetons.get("text"));
  const sain = contrast(encre, sousLeVoile(surface, MESURE.fichiers["bg-day.jpg"].pixel_le_plus_sombre, 0.35));
  const malade = contrast(encre, sousLeVoile(surface, [55, 58, 60], 0.35));
  assert.ok(sain >= 4.5, "témoin : le vrai fond passe");
  assert.ok(malade < sain, "un fond plus sombre en thème clair dégrade bien le contraste du texte sombre");
});
