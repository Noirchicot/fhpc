/* ══ LA LOI DU COLLECTEUR ET DU JETON — Eric, 2026-08-29 ═══════════════════

   *« Règle universelle : un collecteur = un jeton en taille. Ne varie
   jamais. »* Et, le même jour : *« pour tous les collecteurs de skills, se
   limiter à des lignes de 4 ; si on ne complète pas la ligne à 4, on
   centre »* · *« tous les collecteurs avec les 6 caracs : règle spécifique,
   là on met tout sur une ligne »* · *« on vise toujours la compatibilité
   avec 360 »*.

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER, ET IL EST NÉ D'UNE PANNE RÉELLE :
   la cote a été écrite trois fois de suite d'une façon qui la faisait
   diverger, et CHAQUE FOIS le CSS était valide et l'écran plausible.

     1. deux nombres égaux — le collecteur et le jeton portaient chacun leur
        `87px`, et le premier qui bougeait laissait l'autre derrière ;
     2. un shrink de 1 — le jeton lisait bien la cote partagée, puis se
        laissait écraser par son contenu court (mesuré : **10 px** contre 74) ;
     3. **un pourcentage dans deux parents différents** — le plus retors :
        `--collecteur-case` valait `25%`, le vivier faisait 277 px et la rangée
        de collecteurs 320, donc « un quart » ne valait pas la même chose des
        deux côtés (**63 contre 74**). Une cote partagée n'est partagée que si
        sa BASE l'est.

   ⭐ LA PARADE STRUCTURELLE : les deux organes lisent `--collecteur-case`, et
   cette variable est déclarée sur leur ANCÊTRE COMMUN (`.choix-glisse`),
   jamais sur l'un des deux. Ce garde lit la feuille et exige exactement ça —
   il ne juge pas des pixels, il juge la MÉCANIQUE qui les produit. Un garde
   qui compterait des pixels rendus ne verrait rien tant qu'aucun mot ne
   déborde ; celui-ci refuse la construction qui rend la dérive possible.

   ⛔ SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS : il lit du CSS, pas un
   écran. Il garantit que la cote est UNE et partagée ; il ne dit pas qu'elle
   est jolie. Le banc (`banc-listes.html`, largeur 360) reste le juge du rendu. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const listes = stripComments(fs.readFileSync(path.join(UI, "listes.css"), "utf8"));
const tokens = stripComments(fs.readFileSync(path.join(UI, "tokens.css"), "utf8"));

/** Les déclarations d'un bloc, par sélecteur — lues, jamais recopiées. */
function blocs(css) {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    out.push({ sel: m[1].replace(/\s+/g, " ").trim(), corps: m[2] });
  }
  return out;
}
const REGLES = blocs(listes);

test("la cote partagée est déclarée sur l'ancêtre commun, jamais sur un organe", () => {
  const declarants = REGLES.filter((r) => /--collecteur-case\s*:/.test(r.corps));
  assert.ok(declarants.length > 0, "aucune déclaration de --collecteur-case");
  for (const r of declarants) {
    assert.ok(
      /\.choix-glisse/.test(r.sel),
      `--collecteur-case déclarée hors du cadre commun : « ${r.sel} ».\n` +
      "Un pourcentage se résout chez celui qui l'utilise : déclarée sur une " +
      "rangée, l'autre rangée ne la voit pas et les deux cotes divergent.");
    assert.ok(
      !/\.glisse-creneaux(?![-\w])|\.glisse-vivier/.test(r.sel),
      `--collecteur-case déclarée sur une rangée (« ${r.sel} ») : sa jumelle ` +
      "ne la lira pas.");
  }
});

test("le collecteur ET le jeton lisent la cote — aucun ne porte un nombre à lui", () => {
  const lecteurs = REGLES.filter((r) => /var\(--collecteur-case\)/.test(r.corps));
  const cible = (motif) => lecteurs.some((r) => motif.test(r.sel));
  assert.ok(cible(/\.glisse-creneau\b/), "le collecteur ne lit pas --collecteur-case");
  assert.ok(cible(/\.glisse-vivier\s*>\s*li|\.glisse-jeton/),
    "le jeton ne lit pas --collecteur-case");

  /* ⛔ ET AUCUN DES DEUX NE SE FIGE SUR UN NOMBRE. Une cote écrite en dur à
     côté d'une cote partagée est la panne n° 1, à l'identique. */
  for (const r of REGLES) {
    if (!/\.glisse-creneau\b|\.glisse-jeton\b/.test(r.sel)) continue;
    const dur = r.corps.match(/(?:flex-basis|width|max-width)\s*:\s*(\d+px)/);
    assert.ok(!dur, `cote en dur (${dur && dur[1]}) sur « ${r.sel} » : ` +
      "deux nombres égaux divergent au premier qui bouge.");
  }
});

test("un jeton ne rétrécit jamais sous sa cote (shrink 0)", () => {
  for (const r of REGLES) {
    if (!/var\(--collecteur-case\)/.test(r.corps)) continue;
    if (!/\.glisse-vivier\s*>\s*li|\.glisse-creneau\b/.test(r.sel)) continue;
    const flex = r.corps.match(/flex\s*:\s*([^;]+);/);
    if (!flex) continue;
    assert.match(flex[1].trim(), /^0\s+0\s/,
      `« ${r.sel} » porte flex: ${flex[1].trim()} — un shrink non nul laisse ` +
      "l'organe s'écraser sur son contenu (mesuré : 10 px contre 74).");
  }
});

test("les collecteurs de skills se rangent par quatre, la ligne courte centrée", () => {
  const quatre = REGLES.find((r) => /--collecteur-case\s*:/.test(r.corps)
    && /\/\s*4\b/.test(r.corps));
  assert.ok(quatre, "aucune cote déduite d'un quart de rangée");
  assert.match(quatre.corps, /min\(/,
    "la cote doit être plafonnée par min() : sur un large écran une case ne " +
    "grandit jamais au-dessus du socle.");
  const centre = REGLES.find((r) => /\.glisse-creneaux/.test(r.sel)
    && /justify-content\s*:\s*center/.test(r.corps));
  assert.ok(centre, "la ligne incomplète n'est pas centrée");
  const wrap = REGLES.find((r) => /\.glisse-creneaux/.test(r.sel)
    && /flex-wrap\s*:\s*wrap/.test(r.corps));
  assert.ok(wrap, "la rangée des skills ne passe pas à la ligne");
});

test("les six caractéristiques tiennent sur une ligne, et se nomment", () => {
  const caracs = REGLES.filter((r) => /--caracs/.test(r.sel));
  assert.ok(caracs.length, "aucune règle pour la rangée des caractéristiques");
  const cote = caracs.find((r) => /--collecteur-case\s*:/.test(r.corps))
    || REGLES.find((r) => /--caracs/.test(r.sel) && /\/\s*6\b/.test(r.corps))
    || REGLES.find((r) => /:has\(\.glisse-creneaux--caracs\)/.test(r.sel));
  assert.ok(cote && /\/\s*6\b/.test(cote.corps),
    "la cote des caractéristiques ne se déduit pas d'un sixième de rangée");
  assert.ok(caracs.some((r) => /flex-wrap\s*:\s*nowrap/.test(r.corps)),
    "la rangée des six peut passer à la ligne");

  /* La classe est POSÉE PAR LA SOURCE, pas déduite d'un compte d'enfants :
     six créneaux ne font pas six caractéristiques. */
  const glisser = fs.readFileSync(path.join(UI, "glisser.mjs"), "utf8");
  assert.match(glisser, /glisse-creneaux--caracs/,
    "la rangée des caractéristiques n'est pas nommée à la source");
  assert.ok(!/:nth-child\(6\)/.test(listes),
    "la rangée des six est reconnue par un compte d'enfants — une exception " +
    "se nomme, elle ne se compte pas.");
});

test("la largeur de référence du dépôt reste 360", () => {
  /* Eric, 2026-08-29 : *« on vise toujours la compatibilité avec 360 sur tout
     le site »*. Le banc EST cette norme : s'il changeait de largeur en
     silence, toutes les mesures du dépôt parleraient d'un autre écran. */
  const banc = fs.readFileSync(path.join(UI, "banc-listes.html"), "utf8");
  assert.match(banc, /width:\s*360px/,
    "le banc des listes ne mesure plus à 360 — la largeur cible a bougé sans " +
    "que personne ne le dise.");
  assert.match(tokens, /--touch:\s*44px/,
    "le seuil tactile a bougé : la cote des six caractéristiques (46 px à " +
    "360) était calculée pour rester au-dessus de lui.");
});
