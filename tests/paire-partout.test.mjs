import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8");
const sansCommentaires = CSS.replace(/\/\*[\s\S]*?\*\//g, "");

function reglesDe(css) {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    out.push({ selecteur: m[1].trim().replace(/\s+/g, " "), corps: m[2], index: m.index });
  }
  return out;
}

test("le `?` et le livre gardent leur habit dans N'IMPORTE QUELLE rangée", () => {
  /* 🔴 Eric, 2026-08-27 : *« la règle livre et `?` va être PARTOUT »*.

     ⛔ CE QUI A FAIT ÉCRIRE CE GARDE, ET C'EST ARRIVÉ DEUX FOIS LE MÊME JOUR :
     le livre posé au pied du parcours est sorti en LOSANGE (il héritait de
     l'octogone de `.parcours-pied button`), puis DÉCENTRÉ (il héritait de son
     `padding: 0 var(--sp-16)`). Deux symptômes, UNE cause — un sélecteur écrit
     par POSITION attrape un organe qui n'existait pas quand il a été écrit.

     ⭐ ET LA PARADE N'EST PAS D'EXCLURE AU CAS PAR CAS : la TROISIÈME rangée
     qui accueillera un livre aurait repayé la faute. La règle est posée en FIN
     de feuille pour gagner sur n'importe quelle rangée, présente ou à venir —
     et ce test tient sa POSITION, pas seulement son existence. */
  const regles = reglesDe(sansCommentaires);
  const paire = regles.filter((r) =>
    /\.fiche-livre|\.tuto-point/.test(r.selecteur) && /padding\s*:\s*0|clip-path\s*:\s*none/.test(r.corps));
  assert.ok(paire.length >= 2,
    "la feuille doit poser les invariants de la paire (rembourrage nul, aucun corps octogonal)");

  /* ⛔ ET APRÈS TOUTE RÈGLE DE RANGÉE : une protection écrite avant ce qu'elle
     protège ne protège rien — c'est une déclaration perdante de plus. */
  const derniereRangee = Math.max(...regles
    .filter((r) => /(-pied|\.sortie)\s+button|(-pied|\.sortie)\s*>?\s*button/.test(r.selecteur))
    .map((r) => r.index), -1);
  /* ⚠️ LE MAX, PAS LE MIN — première écriture de ce garde, et elle rougissait
     sur une feuille SAINE. `.fiche-livre` est déjà déclarée en amont (son habit
     d'origine) ; prendre la PREMIÈRE occurrence revenait à mesurer la règle
     perdante. Ce qu'on veut savoir, c'est qu'il en EXISTE une après la dernière
     rangée — celle qui gagne.
     📌 Un garde qui accuse une source juste est un garde faux, et il coûte plus
     cher qu'une absence de garde : il pousse à « corriger » ce qui va bien. */
  const derniereProtection = Math.max(...paire.map((r) => r.index));
  assert.ok(derniereProtection > derniereRangee,
    "aucun invariant de la paire n'est posé APRÈS les règles de rangée — "
    + "la rangée gagne, et l'organe reprend son habit");
});

test("⚔️ ATTAQUE — une rangée qui octogonalise ses boutons ne doit pas atteindre la paire", () => {
  /* Le garde ci-dessus tient la POSITION ; celui-ci tient la PORTÉE : on vérifie
     qu'aucune protection n'est bornée à un écran particulier. */
  const paire = reglesDe(sansCommentaires)
    .filter((r) => /padding\s*:\s*0|clip-path\s*:\s*none/.test(r.corps))
    .filter((r) => /\.fiche-livre|\.tuto-point/.test(r.selecteur));
  for (const r of paire) {
    assert.doesNotMatch(r.selecteur, /parcours|concept|species|abilities|equipment/,
      `« ${r.selecteur} » borne la paire à UN écran — Eric a dit « partout »`);
  }
});
