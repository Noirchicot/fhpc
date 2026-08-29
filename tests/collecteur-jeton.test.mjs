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

test("les trois régimes de rangement existent, et par un SEUL patron", () => {
  /* Eric, 2026-08-29 : skills par 4 · les six caracs sur une ligne · les sorts
     par 3 sur 5 rangées (cantrips compris).
     ⚔️ CE GARDE A ÉTÉ RÉÉCRIT LE JOUR MÊME. Il exigeait l'ancienne écriture —
     trois blocs qui s'excluaient en `:not()` des deux autres. Cette forme
     s'est cassée TROIS fois : un `:not()` de plus déplace la spécificité, donc
     un régime se met à battre un autre par accident (les six caracs repassées
     au socle, rangées 3 + 3). Le patron unique `data-rangs` + `--par-rangee`
     donne aux trois la MÊME spécificité : une seule valeur est vraie, elles ne
     peuvent plus se battre. Le garde juge donc le PATRON, pas les trois cas. */
  const regimes = {};
  for (const r of REGLES) {
    const m = r.sel.match(/\[data-rangs="(\w+)"\]/);
    const p = r.corps.match(/--par-rangee\s*:\s*(\d+)/);
    if (m && p) regimes[m[1]] = Number(p[1]);
  }
  assert.equal(regimes.sorts, 3, "les sorts (cantrips compris) se rangent par trois");
  assert.equal(regimes.caracs, 6, "les six caractéristiques tiennent sur une ligne");
  const defaut = REGLES.find((r) => /\[data-rangs\]/.test(r.sel)
    && /--par-rangee\s*:\s*4/.test(r.corps));
  assert.ok(defaut, "le défaut (skills) doit valoir quatre par rangée");

  /* La classe vient de la SOURCE : six créneaux ne font pas six caractéristiques. */
  const glisser = fs.readFileSync(path.join(UI, "glisser.mjs"), "utf8");
  assert.match(glisser, /dataset\.rangs/, "le régime n'est pas posé à la source");
  assert.ok(!/:nth-child\(6\)/.test(listes),
    "un régime est reconnu par un compte d'enfants — une exception se nomme.");
});

test("la cote ET la borne se déduisent du même nombre par rangée", () => {
  const cote = REGLES.find((r) => /--collecteur-case\s*:/.test(r.corps));
  assert.ok(cote, "aucune cote déduite");
  assert.match(cote.corps, /var\(--rangee-dense\)/,
    "la cote doit se déduire de la rangée la plus DENSE déclarée par l'écran " +
    "(repli : la loi --par-rangee) — diviser par la loi maximale fait payer " +
    "à Identity (1 créneau) la rangée de 4 qu'il n'a pas (ALIGNMENT cassée).");
  assert.match(cote.corps.replace(/\s+/g, " "), /--rangee-dense: var\(--par-rangee\)/,
    "sans déclaration de l'émetteur, la cote doit replier sur la loi.");
  assert.match(cote.corps, /min\(/,
    "la cote doit être plafonnée par min() : une case ne grandit jamais " +
    "au-dessus du socle.");

  /* ⚔️ BORNER LA CASE NE BORNE PAS LA RANGÉE — mesuré : la cote plafonnait au
     socle et il entrait SIX cases dans une rangée large. « Quatre par ligne »
     n'était vrai qu'à l'étroit.
     ⚖️ RÉÉCRIT LE 29/08 AU SOIR (« JAMAIS PLUS, JAMAIS MOINS ») : les deux
     rangées restent bornées, mais plus par le MÊME nombre — `--par-rangee`
     est la loi des collecteurs, le vivier plafonne à 3. L'ancienne version de
     ce garde exigeait la borne commune : elle figeait la couture qu'Eric a
     défaite (Alignment 4+4+1). */
  const borneCreneaux = REGLES.find((r) => /\.glisse-creneaux$/.test(r.sel.trim())
    && /max-width\s*:\s*calc\(\s*var\(--par-rangee\)/.test(r.corps));
  assert.ok(borneCreneaux, "la rangée de collecteurs n'est plus bornée par --par-rangee");
  const borneVivier = REGLES.find((r) => /\.glisse-vivier$/.test(r.sel.trim())
    && /max-width\s*:\s*calc\(3 \* var\(--collecteur-case\)/.test(r.corps));
  assert.ok(borneVivier, "le vivier n'est plus plafonné à 3 cases");
  /* et les deux rangées PRENNENT leur largeur (le bloc partagé) : une borne
     dit « pas plus large que », jamais « aussi large que ». */
  const partage = REGLES.find((r) => /\.glisse-vivier,/.test(r.sel) && /\.glisse-creneaux/.test(r.sel));
  assert.ok(partage && /width\s*:\s*100%/.test(partage.corps),
    "le bloc partagé des deux rangées ne prend plus width:100% — le vivier " +
    "s'étire et la rangée se tasse (mesuré : 63/74, 49/74, 28/87).");
});

test("le jeton et la valeur d'un collecteur portent le MÊME corps", () => {
  /* Eric, 2026-08-29 : « les mêmes règles d'écriture s'appliquent aux tokens et
     aux collecteurs » — parce qu'un collecteur rempli PORTE le mot du jeton.
     ⚔️ L'écart était DORMANT : `.glisse-creneau-valeur` valait `--t3`, et une
     règle plus spécifique le rattrapait à T1 dans les écrans de choix. Faux
     nulle part, vrai le jour où un collecteur naîtrait ailleurs. */
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
  const corpsDe = (sel) => {
    for (const b of blocs(shell)) {
      if (b.sel !== sel) continue;
      const f = b.corps.match(/font-size\s*:\s*var\(--(t\d)\)/);
      if (f) return f[1];
    }
    return null;
  };
  assert.equal(corpsDe(".glisse-creneau-valeur"), "t1",
    "la valeur d'un collecteur doit porter --t1, comme le jeton : c'est le " +
    "même mot une fois posé.");
  assert.equal(corpsDe(".glisse-creneau-nom"), "t1",
    "le nom d'un collecteur porte --t1 lui aussi — c'est la CAPITALE qui le " +
    "distingue de la valeur, jamais la taille.");
});

test("tout lien hors jeton est bleu — le bilan compris", () => {
  /* Eric, 2026-08-29, DEUXIÈME rappel : *« pas de liens bleus sur sorts et
     cantrips du wizard »*. La dictée du 28/08 (« pas besoin de mettre le texte
     des tokens en bleu ») parle du texte SUR le jeton ; je l'avais sur-étendue
     aux noms du bilan, et ce garde figeait ma sur-extension (`color: inherit`).
     La ligne de partage ratifiée : le jeton reste encre, tout lien HORS jeton
     est bleu — `.lien-sort` comme `.bilan-nom`.
     ⚔️ Le garde compte les FAMILLES de liens produites : le builder n'en a que
     deux, donc la règle est complète. Une troisième qui apparaîtrait sans habit
     déclaré passerait aujourd'hui inaperçue. */
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
  const bloc = (sel) => {
    for (const b of blocs(shell)) if (b.sel === sel) return b.corps;
    return "";
  };
  assert.match(bloc(".lien-sort"), /color:\s*var\(--lien\)/,
    "un lien dans la prose porte `--lien`, le bleu à un souffle de l'encre " +
    "(Eric, 29/08 : « on sait qu'il est là, mais on le voit à peine »).");
  assert.match(bloc(".bilan-nom"), /color:\s*var\(--lien\)/,
    "un nom au bilan est de la PROSE, pas un jeton : il porte `--lien` " +
    "(2ᵉ rappel d'Eric, 29/08 — sorts et cantrips du magicien).");
  assert.match(bloc(".bilan-nom"), /text-decoration:\s*none/,
    "un <a> est souligné PAR DÉFAUT : sans retrait explicite, la moitié des " +
    "entrées d'un bilan crie et l'autre non.");

  /* Aucune troisième famille de liens sans habit déclaré. */
  const sources = fs.readdirSync(UI).filter((f) => f.endsWith(".mjs"))
    .map((f) => fs.readFileSync(path.join(UI, f), "utf8")).join("\n");
  const familles = [...new Set([...sources.matchAll(/el\("a",\s*"([a-z-]+)"/g)]
    .map((m) => m[1]))].sort();
  assert.deepEqual(familles, ["bilan-nom", "lien-sort"],
    `familles de liens inattendues : ${familles.join(" · ")} — chacune doit ` +
    "déclarer son habit (bleu partout hors jeton).");
});

test("aucune cote partagée ne porte de POURCENTAGE", () => {
  /* ⚔️ LA FAUTE QUI EST REVENUE TROIS FOIS, ET QUE CE GARDE FERME.
     Eric, 2026-08-29 : « taille des collecteurs de spells dans SB2 putain ! » —
     mesuré : jeton 87, collecteur 160 sur le même écran.
     🔴 LA CAUSE, TOUJOURS LA MÊME : `100%` se résout chez CELUI QUI L'UTILISE.
     La même déclaration donnait 55 px dans le vivier (parent 277) et 87 dans
     la rangée (parent 592). Une cote écrite en pourcentage n'est PAS partagée,
     quoi qu'en dise le commentaire qui l'accompagne — et deux commentaires
     successifs ont prétendu le contraire.
     ⭐ LA PARADE : `cqw` se résout sur le CONTENEUR NOMMÉ (`container-type:
     inline-size`), donc sur la même base pour tous ses descendants. */
  for (const r of REGLES) {
    if (!/--(collecteur-case|case-cedee)\s*:/.test(r.corps)) continue;
    assert.ok(!/\d\s*%/.test(r.corps),
      `« ${r.sel} » calcule une cote partagée avec un POURCENTAGE :\n` +
      `  ${r.corps.replace(/\s+/g, " ").trim()}\n` +
      "Un pourcentage se résout chez celui qui l'utilise — les deux organes " +
      "obtiendront des valeurs différentes. Employer cqw sur un conteneur nommé.");
  }
  const conteneurs = REGLES.filter((r) => /container-type\s*:\s*inline-size/.test(r.corps));
  const cqw = REGLES.filter((r) => /cqw/.test(r.corps));
  if (cqw.length) {
    assert.ok(conteneurs.length,
      "des cotes emploient cqw mais aucun conteneur n'est nommé " +
      "(`container-type: inline-size`) : cqw retomberait sur la fenêtre.");
  }
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

test("la hauteur d'un jeton ne se laisse pas dicter par un voisin", () => {
  /* 🔴 MESURÉ LE 29/08 SUR « UNSEEN SERVANT » (Eric : *« token = collector »*) :
     le jeton rendait 87×60 contre une case à 87×48 — avec UNE ligne de texte.
     Ce n'était pas le nom qui poussait : la colonne du CHEVRON (60 px) étirait
     le vivier par le `align-items: stretch` de la rangée, et le jeton suivait.
     Une cote dictée par un voisin n'est pas une cote.
     ⭐ La parade est UNE ligne, et c'est elle qu'on fige : le vivier se centre
     dans la rangée (`align-self`), l'égalisation par CONTENU (deux jetons côte
     à côte, un nom sur deux lignes) vivant un niveau plus bas, intacte. */
  const listes = stripComments(fs.readFileSync(path.join(UI, "listes.css"), "utf8"));
  const bloc = /\.choix-glisse \.grille-rang > \.glisse-vivier\s*\{([^}]*)\}/.exec(listes);
  assert.ok(bloc, "le bloc du vivier entre ses gouttières a disparu de listes.css.");
  assert.match(bloc[1], /align-self\s*:\s*center/,
    "le vivier s'étire à la hauteur de la colonne du chevron : tout jeton " +
    "seul sur sa page redevient plus haut que sa case (Unseen Servant, 60 vs 48).");
});

test("deux lois de rangée : le vivier plafonne à 3, les collecteurs à --par-rangee", () => {
  /* ⚖️ « JAMAIS PLUS, JAMAIS MOINS » — Eric, 29/08. Mesuré avant la coupure :
     « même base, même borne » donnait la borne des collecteurs (4) au vivier,
     et Alignment rendait 9 jetons en 4+4+1. Le garde exige que les DEUX bornes
     existent SÉPARÉMENT — et que celle du vivier soit un `max-width` : une
     borne en `width` seule CÈDE sous flex-grow (la rangée de pagination). */
  const listes = stripComments(fs.readFileSync(path.join(UI, "listes.css"), "utf8"));
  const creneaux = /\.glisse-creneaux\s*\{[^}]*max-width:\s*calc\(var\(--par-rangee\)/.test(listes);
  assert.ok(creneaux,
    "la rangée de collecteurs ne se borne plus par --par-rangee (4 par défaut, 6 caracs).");
  const vivier = /\.glisse-vivier\s*\{[^}]*max-width:\s*calc\(3 \* var\(--collecteur-case\)/.test(listes);
  assert.ok(vivier,
    "le vivier ne plafonne plus à 3 cases : une sélection de 4 jetons sur une " +
    "ligne revient (Alignment 4+4+1).");
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
  assert.match(shell, /\.choix-glisse \.glisse-vivier \{[^}]*max-width:\s*calc\(var\(--glisse-case\) \* 3/s,
    "la borne générique du vivier (hors régimes) n'est plus un max-width : " +
    "le flex-grow de la rangée de pagination la dépasse.");
});
