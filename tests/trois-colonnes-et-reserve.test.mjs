import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8");
const sansCommentaires = CSS.replace(/\/\*[\s\S]*?\*\//g, "");

/** Les règles de la feuille, en couples (sélecteur, corps), commentaires ôtés. */
function reglesDe(css) {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    out.push({ selecteur: m[1].trim().replace(/\s+/g, " "), corps: m[2] });
  }
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
   ⭐ CE FICHIER GARDE UNE FAMILLE DE FAUTES, PAS DEUX LIGNES.

   Les deux lois qu'il tient ont été mesurées SUR LA PAGE RENDUE le 2026-08-26
   (Eric : *« Identity n'a pas sa transparence ni ses boutons »*, puis *« sur
   écran large fais idem que sur 360 pour les tokens »*), et toutes deux
   avaient déjà été écrites correctement AILLEURS avant d'être perdues ici.
   ══════════════════════════════════════════════════════════════════════════ */

/* ══ 🧊 LE GARDE DE LA RÉSERVE EST MORT LE 2026-09-04 — AVEC SON RÉGIME ═════
   Il exigeait ceci : *« si tu poses le raccourci `padding`, tu reposes la
   réserve APRÈS »*. Il avait raison tant que la colonne du `?` était un CREUX
   dans une boîte flex. §6 pré (04/09) a renversé ce régime : *« une borne a une
   COLONNE, jamais une réserve ; une colonne existe même vide, la place est
   tenue par le GABARIT »*. Six réserves ont été retirées, la dernière ce jour.

   ⭐⭐ ET CE GARDE AVAIT ÉCRIT SA PROPRE ÉPITAPHE, mot pour mot :
   *« C'est la faute à laquelle un garde est le plus exposé : défendre la FORME
   d'hier au lieu de la propriété qu'elle servait. »* Il défendait `padding-right`.
   La propriété, c'était **le `?` a sa place au bout de la rangée**. Elle n'est
   pas abandonnée — elle est mieux tenue, et par autre chose. Le garde ci-dessous
   la reprend au bon niveau. */
test("le « ? » a une COLONNE au bout de chaque rangée de contrôles", () => {
  /* 🔴 NORMES §6 pré : trois colonnes, deux bornes, un groupe. La place du `?`
     ne se négocie pas avec le contenu — elle est tenue par le gabarit, donc
     elle existe même quand la rangée ne porte aucun `?`.
     📏 CE QUE L'ANCIEN RÉGIME COÛTAIT, mesuré au lot de §6 pré : en flex avec
     réserves, la rangée débordait PAR-DESSUS SON PROPRE REMBOURRAGE — 40 blg
     sur le livre, 40 sur le `?`, et 1 seul blg de jeu en anglais. */
  const regles = reglesDe(sansCommentaires);
  const cible = (r) => r.selecteur.includes("[data-rangee]")
    && r.selecteur.includes(".parcours-pied") && r.selecteur.includes(".card-pied");

  const gabarit = regles.find((r) => cible(r) && /grid-template-columns/.test(r.corps));
  assert.ok(gabarit, "les cinq rangées partagent UN gabarit — pas une règle par écran");
  assert.match(gabarit.corps, /grid-template-columns:\s*var\(--touch\) 1fr var\(--touch\);/,
    "⛔ `--touch | 1fr | --touch` : les deux bornes valent leur CIBLE, jamais leur dessin");

  /* ⭐ ET LES DEUX BOUTS SONT NOMMÉS, pas devinés par un rang : `:nth-of-type`
     compte par BALISE, et le livre est un `<button>` comme les majeurs — c'est
     l'une des trois méthodes que §6 pré a vu échouer. */
  const droite = regles.find((r) => cible(r) && r.selecteur.endsWith("> .tuto-point"));
  assert.ok(droite, "le `?` a sa règle de colonne");
  assert.match(droite.corps, /grid-column:\s*3;/, "⛔ le `?` tient la TROISIÈME colonne");
  assert.match(droite.corps, /justify-self:\s*end;/, "et il se colle à son bord");
  const gauche = regles.find((r) => cible(r) && r.selecteur.endsWith("> .fiche-livre"));
  assert.match(gauche.corps, /grid-column:\s*1;/, "⛔ et le livre tient la PREMIÈRE");

  /* ⚔️ ATTAQUE — le garde mord-il ? On lui donne le gabarit à QUATRE colonnes
     que §6 pré nomme comme « le signe qu'on recommence », et il doit le voir. */
  const faux = reglesDe(".parcours-pied, .sortie, .fiche-actions, .card-pied, [data-rangee] "
    + "{ grid-template-columns: 1fr auto auto 1fr; }")[0];
  assert.doesNotMatch(faux.corps, /grid-template-columns:\s*var\(--touch\) 1fr var\(--touch\);/,
    "témoin : une quatrième colonne ne passe pas pour le gabarit — le garde lit la FORME, pas la présence");
});

test("le vivier vaut trois colonnes, et c'est la RANGÉE qui les compte", () => {
  /* 🔴 Eric, 2026-08-26 : *« sur écran large, fais idem que sur 360 »*. Une
     rangée qui se remplit selon la largeur fait changer de place au douzième
     jeton entre un téléphone et une tablette — le joueur perd son repère.

     ⛔ LE PIÈGE QUI A COÛTÉ UNE PASSE : borner la CASE ne marche pas.
     `flex-basis: (100% - 2 gouttières) / 3` semblait juste, mais **`max-width`
     écrase `flex-basis` avant que la ligne ne soit coupée** — la case retombe
     à son gabarit de 87 px et SIX tiennent à 1100. Mesuré : `[6, 3]`.
     ⚠️ Et à 360 la règle fausse passait pour bonne : trois cases y prennent
     277 sur 278, la quatrième ne rentre pas de toute façon. **Ce n'était pas
     la règle qui tenait, c'était l'étroitesse de l'écran.**

     ⭐ Le gabarit de la case ne se négocie pas, donc c'est la RANGÉE qui vaut
     trois colonnes. Vérifié après correction à 360 · 372 · 467 · 1100 · 1600 :
     `[3,3,3,3]` partout, case 87×48, rangée 277. */
  /* 🔴 ET LA LARGEUR EST DÉCLARÉE, PAS SEULEMENT BORNÉE — 26/08, second temps.
     `max-width` seul laissait le navigateur choisir la largeur RÉELLE parmi
     `fit-content`, `min-content` et l'étirement ; sur l'iPad d'Eric, les trois
     jetons Gender se sont retrouvés empilés un par ligne pendant que les neuf
     d'Alignment tenaient en 3 × 3, sous les mêmes règles.
     ⭐ Une largeur déclarée ne laisse rien à trancher. */
  const vivier = reglesDe(sansCommentaires)
    .find((r) => r.selecteur === ".choix-glisse .glisse-vivier"
      && /width\s*:/.test(r.corps));
  assert.ok(vivier, "`.choix-glisse .glisse-vivier` doit DÉCLARER sa largeur");
  const borne = vivier.corps.match(/(^|;)\s*width\s*:\s*([^;]+)/)[2].replace(/\s+/g, " ").trim();
  assert.equal(borne, "min(100%, calc(var(--glisse-case) * 3 + var(--sp-8) * 2))",
    "la largeur doit se LIRE comme trois cases et deux gouttières, bornée au "
    + "conteneur — un chiffre en dur (277px) mentirait le jour où le gabarit bouge");
});

test("Identity ne repeint pas un fond opaque par-dessus sa dalle", () => {
  /* 🔴 La règle `.concept-step { background: var(--surface) }` n'était pas
     fausse le jour où elle a été écrite : le 20/08, Eric demandait *« mets-moi
     Identity à la même transparence que les autres »*, et « les autres »
     étaient alors OPAQUES. Depuis v298 elles sont à 50 % — la règle a continué
     de dire la même chose pendant que son référent bougeait.
     ⭐ **Une règle écrite par RESSEMBLANCE doit nommer ce à quoi elle
     ressemble, pas recopier sa valeur.** Identity porte `dalle-intermediaire`
     dans le DOM : c'est elle qui décide, et elle suit le site toute seule. */
  const fond = reglesDe(sansCommentaires)
    .filter((r) => r.selecteur.split(",").some((p) => p.trim() === ".concept-step"))
    .find((r) => /(^|;)\s*background(-color)?\s*:/.test(r.corps));
  assert.equal(fond, undefined,
    "`.concept-step` ne doit poser aucun fond : la dalle qu'il porte dans le "
    + "DOM (`dalle-intermediaire`) est la seule à décider de son voile");
});
