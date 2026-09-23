/* ══ L'ENCRE DU BOUTON N'A QU'UN ÉCRIVAIN — lot 244, 2026-09-21 ════════════

   🔴 CE QU'IL EXISTE POUR EMPÊCHER, ET C'EST MESURÉ. Le popup « SRD or Fate's
   Hand? » rendait ses deux boutons ILLISIBLES en thème JOUR — Eric l'a
   photographié. Relevé au navigateur le 21/09 (512 × 764, `prefers-color-scheme:
   light`, le vrai bouton du popup, pas une imitation) :

     encre rendue ......... rgb(45, 44, 42)  = `--text` du JOUR
     face du bouton ....... #3d3424          = `--bouton-face`, qui ne bascule pas
     contraste ............ **1,14:1**       ⛔ (1,12 sous la ligne de texte)

   ⭐ LA CAUSE N'ÉTAIT PAS DANS LE POPUP : `fiche.css` redéclarait
   `.fiche-action { color: var(--text) }`, à spécificité ÉGALE au patron du
   bouton (`.fiche-action` dans la liste de shell.css, 0,1,0) et dans une
   feuille chargée APRÈS. Un second écrivain, donc, qui gagnait la cascade.
   ⚠️ ET SON PROPRE COMMENTAIRE L'INTERDISAIT — *« fiche.css charge APRÈS
   shell.css : tout habit résiduel écrit ici BATTRAIT la famille — ne rien y
   remettre »*, écrit six lignes au-dessus de la déclaration fautive. Une règle
   écrite dans un commentaire n'existe pas ; celle-ci vit maintenant ici.

   🔴 POURQUOI ÇA NE SE VOYAIT QU'EN PARTIE, et pourquoi il fallait un garde :
   · en thème NUIT `--text` vaut #d8d3c9 → 8,21:1, le défaut est MUET ;
   · partout où le bouton vit dans `.parcours-pied`, un sélecteur du patron à
     (0,1,1) gagne le départage et l'encre est juste. Le défaut ne se montrait
     donc QUE sur les `.fiche-action` isolés — les neuf popups à actions et les
     douze `Choose` des fiches — et seulement de jour.
   ⛔ Un défaut qui se cache derrière une spécificité et derrière un thème ne
   se rattrape pas à l'œil : il se rattrape à la SOURCE.

   ⭐ LA LOI, ET ELLE PORTE SUR LA DONNÉE, PAS SUR LA FORME : aucune feuille
   chargée après `shell.css` ne déclare `color` pour un membre du patron du
   bouton. L'inventaire des membres est LU dans `shell.css` (la règle qui
   pose `color: var(--bouton-encre)`), et la liste des feuilles est LUE dans
   `index.html` — ni l'un ni l'autre n'est recopié ici, donc ni l'un ni l'autre
   ne peut vieillir en silence.
   ⛔ Et ce garde ne dit pas QUELLE encre le bouton porte — cette désignation
   est au patron. Il dit qu'il n'y en a qu'UNE. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const UI = new URL("../ui/builder/", import.meta.url);
const lire = (nom) => fs.readFileSync(new URL(nom, UI), "utf8");
const sansCommentaires = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/* ── LA LISTE DES FEUILLES, LUE DANS LA PAGE QUI LES CHARGE ────────────────
   ⭐ L'ORDRE EST LA DONNÉE : « après shell.css » n'a de sens que dans l'ordre
   réel du document. ⛔ Ne jamais réécrire cette liste à la main — c'est
   exactement la faute que ce garde surveille ailleurs. */
export function feuillesApresShell(html) {
  const liens = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="\.\/([^"?]+)/g)].map((m) => m[1]);
  const i = liens.indexOf("shell.css");
  assert.ok(i >= 0, "index.html ne charge plus shell.css — la loi n'a plus de repère");
  return liens.slice(i + 1);
}

/* ── LES MEMBRES DU PATRON, LUS DANS LA RÈGLE QUI POSE L'ENCRE ─────────────
   La règle du patron est celle qui déclare `color: var(--bouton-encre)` : son
   texte de sélecteur EST l'inventaire. ⭐ Les clefs sont donc RÉELLES. */
export function membresDuPatron(shellCss) {
  const css = sansCommentaires(shellCss);
  const bloc = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .find(([, , corps]) => /(^|[^-])color\s*:\s*var\(--bouton-encre\)/.test(corps));
  assert.ok(bloc, "shell.css ne pose plus `color: var(--bouton-encre)` — le patron a changé de main");
  const selecteurs = bloc[1].split(",").map((s) => s.trim()).filter(Boolean);
  assert.ok(selecteurs.length >= 10,
    `le patron ne porte que ${selecteurs.length} sélecteurs — extraction suspecte`);
  return selecteurs;
}

/* Les CLASSES du patron : ce qu'un sélecteur d'une autre feuille pourrait
   viser. ⛔ `.fiche-livre` n'en est pas — le patron l'EXCLUT nommément
   (`:not(.fiche-livre)`), et son encre lui appartient. */
export function classesDuPatron(selecteurs) {
  const exclues = new Set();
  const visees = new Set();
  for (const sel of selecteurs) {
    for (const m of sel.matchAll(/:not\(([^)]*)\)|:where\(([^)]*)\)/g)) {
      for (const c of (m[1] || m[2] || "").matchAll(/\.[-\w]+/g)) exclues.add(c[0]);
    }
    const nu = sel.replace(/:(?:not|where|is)\([^)]*\)/g, "");
    for (const c of nu.matchAll(/\.[-\w]+/g)) visees.add(c[0]);
  }
  for (const c of exclues) visees.delete(c);
  return visees;
}

/* ── LES CLASSES COMPAGNES, LUES CHEZ CEUX QUI POSENT L'HABIT ──────────────
   🔴 CE TROU-LÀ A ÉTÉ TROUVÉ EN ÉPROUVANT CE GARDE, PAS EN LE RELISANT. Le
   mutant qui répare le SEUL popup — `.popup-actions .popup-action { color: … }`
   dans une feuille tardive — passait VERT : `.popup-action` n'est pas une
   classe du patron, c'est une classe posée À CÔTÉ de lui
   (`b.className = "fiche-action popup-action"`, shell.mjs).
   ⭐ Or le garde doit pouvoir accuser exactement le correctif qu'il interdit.
   La donnée existe et elle est chez le PRODUCTEUR : toute classe qu'un écran
   pose dans la même chaîne qu'un membre du patron habille le même élément. */
export function classesCompagnes(dossier, classes) {
  const nus = new Set([...classes].map((c) => c.slice(1)));
  const compagnes = new Set();
  for (const f of fs.readdirSync(dossier).filter((n) => n.endsWith(".mjs"))) {
    const src = fs.readFileSync(new URL(f, dossier), "utf8");
    for (const [, chaine] of src.matchAll(/"([-\w]+(?: [-\w]+)+)"/g)) {
      const mots = chaine.split(" ");
      if (!mots.some((m) => nus.has(m))) continue;
      for (const m of mots) if (!nus.has(m)) compagnes.add("." + m);
    }
  }
  return compagnes;
}

/* Les règles d'une feuille qui déclarent `color`, avec leur sélecteur. */
export function reglesQuiPosentUneEncre(css) {
  return [...sansCommentaires(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , corps]) => /(^|[^-])color\s*:/.test(corps))
    .map(([, sel]) => sel.replace(/\s+/g, " ").trim());
}

const INDEX = lire("index.html");
const SHELL = lire("shell.css");
const MEMBRES = membresDuPatron(SHELL);
const CLASSES = classesDuPatron(MEMBRES);
const COMPAGNES = classesCompagnes(UI, CLASSES);
const SURVEILLEES = new Set([...CLASSES, ...COMPAGNES]);
const APRES = feuillesApresShell(INDEX);

/* ── LE TÉMOIN LUI-MÊME SE VÉRIFIE ────────────────────────────────────────
   ⚠️ Un garde qui n'extrait plus rien ne peut plus accuser, et il le fait en
   silence. Ces trois-là disent qu'il a bien de quoi accuser. */
test("le garde a de quoi accuser : des feuilles après shell.css, et des membres", () => {
  assert.ok(APRES.length >= 1, "aucune feuille après shell.css — le garde n'a plus de terrain");
  assert.ok(CLASSES.has(".fiche-action"),
    "`.fiche-action` n'est plus lu dans le patron — l'extraction est cassée, pas la feuille");
  assert.ok(!CLASSES.has(".fiche-livre"),
    "`.fiche-livre` est EXCLU du patron (`:not`) : il ne doit pas entrer dans l'inventaire");
  assert.ok(COMPAGNES.has(".popup-action"),
    "`.popup-action` n'est plus lue chez son producteur — le garde ne peut plus accuser "
    + "le correctif d'un seul cas, qui est précisément ce qu'il interdit");
});

/* ── LA LOI ───────────────────────────────────────────────────────────────── */
test("aucune feuille chargée après shell.css ne redéclare l'encre d'un bouton", () => {
  const fautes = [];
  for (const feuille of APRES) {
    for (const sel of reglesQuiPosentUneEncre(lire(feuille))) {
      for (const classe of SURVEILLEES) {
        /* La classe est VISÉE par ce sélecteur — au mot près, pas en sous-chaîne
           (`.fiche-action` ne doit pas se reconnaître dans `.fiche-actions`). */
        if (new RegExp(`\\${classe}(?![-\\w])`).test(sel)) fautes.push(`${feuille} → ${sel} (vise ${classe})`);
      }
    }
  }
  assert.deepEqual(fautes, [],
    "l'encre du bouton a un SECOND écrivain — la réparation est de le supprimer, "
    + "pas d'ajouter un sélecteur plus spécifique :\n  " + fautes.join("\n  "));
});

/* ── ET LE PATRON GARDE SON ENCRE À LUI ────────────────────────────────────
   ⛔ `--on-accent` BASCULE, `--text` BASCULE ; la face du bouton NON. Un jeton
   qui bascule sur une face qui ne bascule pas rend 1,14:1 un jour sur deux. */
test("le patron pose `--bouton-encre`, jamais un jeton qui bascule", () => {
  const css = sansCommentaires(SHELL);
  const bloc = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .find(([, , corps]) => /(^|[^-])color\s*:\s*var\(--bouton-encre\)/.test(corps));
  assert.doesNotMatch(bloc[2], /(^|[^-])color\s*:\s*var\(--(?:text|on-accent)\b/,
    "le patron du bouton reprend un jeton de SURFACE pour son encre");
});
