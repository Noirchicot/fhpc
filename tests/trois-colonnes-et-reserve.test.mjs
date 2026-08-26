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

test("aucune règle .sortie n'efface la colonne réservée au « ? »", () => {
  /* 🔴 LA FAUTE, TROIS FOIS DANS LA MÊME JOURNÉE : un bloc qui repose le
     raccourci `padding` remet la droite à ZÉRO, donc le `padding-right` que
     `.sortie` déclare en tête de feuille est PERDU (spécificité 2 contre 1) —
     et la colonne où doivent tenir le `?` et le livre mesurait 0 px.
     ⛔ C'est la « déclaration perdante » : *une déclaration invalide crie, une
     déclaration PERDANTE se tait.* Rien ne casse, rien ne prévient ; il faut
     lire la valeur CALCULÉE sur la page pour la voir.

     ⭐ CE QUE CE GARDE EXIGE N'EST PAS « pas de raccourci » — ce serait un mur,
     et `.ability-collecteur > .sortie` a une exception ARGUMENTÉE (elle retire
     la gouttière de 16 px que sa dalle porte déjà). Il exige la seule chose
     qui compte : **si tu poses le raccourci, tu reposes la réserve APRÈS.**

     ⚠️ ET « LA RÉSERVE » N'EST PLUS SEULEMENT `padding-right` — 26/08, second
     temps. Depuis que le LIVRE tient la gauche et le `?` la droite, `.sortie`
     réserve **autant des deux côtés** (`padding-inline`), ce qui est ce qui
     ramène `Done` au centre exact de la dalle — Eric : *« bien, mais Done
     centré »*. Un garde qui n'aurait connu que `padding-right` aurait donc
     rougi sur la règle JUSTE, et poussé à rétablir l'asymétrie pour le calmer.
     ⭐ **C'est la faute à laquelle un garde est le plus exposé : défendre la
     FORME d'hier au lieu de la propriété qu'elle servait.** Il accepte donc
     les deux écritures, parce que les deux réservent. */
  const fautes = [];
  for (const { selecteur, corps } of reglesDe(sansCommentaires)) {
    if (!selecteur.split(",").some((p) => p.trim().endsWith(".sortie"))) continue;
    const raccourci = corps.search(/(^|;)\s*padding\s*:/);
    if (raccourci === -1) continue;
    const droiteApres = corps.slice(raccourci).search(/padding-(right|inline)\s*:/) !== -1;
    if (!droiteApres) fautes.push(selecteur);
  }
  assert.deepEqual(fautes, [],
    "ces règles posent le raccourci `padding` sans reposer `padding-right` "
    + "après : la colonne du « ? » y tombe silencieusement à 0 px");
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
  const vivier = reglesDe(sansCommentaires)
    .find((r) => r.selecteur === ".choix-glisse .glisse-vivier"
      && /max-width/.test(r.corps));
  assert.ok(vivier, "`.choix-glisse .glisse-vivier` doit borner sa largeur");
  const borne = vivier.corps.match(/max-width\s*:\s*([^;]+)/)[1].replace(/\s+/g, " ").trim();
  assert.equal(borne, "calc(3 * var(--glisse-case) + 2 * var(--sp-8))",
    "la borne doit se LIRE comme trois cases et deux gouttières — un chiffre "
    + "en dur (277px) mentirait le jour où le gabarit bouge");
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
