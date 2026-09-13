/* ══ LE GARDE DE L'ALERTE AU REPOS — lot 204, 2026-09-13 ══════════════════

   ❓ IL NAÎT D'UNE QUESTION POSÉE À ERIC, ET DE SA RÉPONSE. Le lot 203 avait
   relevé, en balayant les éléments rendus, que les dix carrés `roll 1…roll 10`
   du plateau de dés portaient `--critical` — *« le seul collecteur du dépôt
   peint en alerte sans rien à reprocher »*. La question du 13/09 : *« Tu les
   avais demandés rouges le 05/09 — on les garde, ou ils passent au bleu comme
   les collecteurs d'ability boost ? »* ✅ *« Bleus, comme les boosts. »*

   🔴 CE QU'IL EXISTE POUR EMPÊCHER, ET CE N'EST PAS UN GOÛT. `--critical` est
   une ENCRE DE SENS, pas une couleur : la table des teintes de `shell.css` la
   définit *« rouge : ce n'est pas bon, ou ça défait »*. Un organe qui la porte
   AU REPOS — c'est-à-dire sans qu'un état, un refus ou une destruction le
   justifie — dit au joueur qu'il a fait une faute au moment précis où il n'a
   rien fait du tout. Aucune suite ne regardait ça : il a fallu qu'un lot
   balaie la page à la main pour le voir, et deux semaines après la pose.

   ⭐ IL SE FONDE SUR LA DONNÉE, PAS SUR LA FORME, et c'est tout son intérêt :
   il ne porte AUCUNE liste de sélecteurs. Il REND le plateau par la porte du
   joueur (`renderAbilitiesStep`, méthode `FH 3D6`), énumère les nœuds que ce
   rendu produit, et confronte chacun aux règles de la feuille en n'admettant
   que ce que le nœud porte VRAIMENT — ses classes et ses attributs rendus.
   ⛔ La leçon du lot 197 est exactement là : une liste PAR NOM de ce qu'on
   surveille est incomplète par construction — elle ne connaît que ce que son
   auteur avait sous les yeux. Un carré ajouté demain au plateau entre dans ce
   garde tout seul.

   ⚖️ CE QU'IL N'AFFIRME PAS, ÉCRIT PARCE QUE ÇA NE SE VOIT PAS :
     · il ne juge QUE le plateau de dés. Le balayage complet du 13/09 (les huit
       chapitres, les deux piles, navigateur ouvert, pseudo-éléments compris)
       vit dans le rapport du lot ; il a nommé deux familles en dehors d'ici —
       les boutons qui DÉFONT (`Cancel`, `Forget`, `Reset`, et ceux-là sont
       dans la loi) et les huit `+`/`−` de la bourse B3 (`.b3-bouton`), qui
       sont une question posée à Eric, pas une faute tranchée. ⛔ Ce garde ne
       tranche pas à sa place ;
     · il lit la CASCADE À PLAT : il ne sait pas qu'une règle plus spécifique
       pourrait en écraser une autre. Il est donc PLUS sévère que la page — ce
       qui est le bon sens d'un garde — et le navigateur reste le juge du rendu
       (relevé du 13/09 dans le rapport, captures à l'appui). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const FEUILLES = ["tokens.css", "shell.css", "listes.css", "fiche.css", "display.css"];
const CSS = FEUILLES.map((f) => stripComments(fs.readFileSync(path.join(UI, f), "utf8"))).join("\n");

const { renderAbilitiesStep } = await import("../ui/builder/abilities-step.mjs");

/* ══ LA FEUILLE, LUE — les règles qui EMPLOIENT l'encre de l'alerte ═══════
   ⛔ On ne retient pas les règles qui la DÉFINISSENT (`--critical: #aa3f2f`
   dans `:root`, et sa jumelle de nuit) : définir un jeton ne peint rien. Seul
   son EMPLOI — `var(--critical)`, `color-mix(… var(--critical) …)` — pose de
   l'encre sur un organe. */
function reglesQuiEmploientLAlerte(css) {
  const out = [];
  for (const [, selecteur, corps] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/var\(\s*--critical\s*\)/.test(corps)) continue;
    const sel = selecteur.replace(/\s+/g, " ").trim();
    /* une règle sous `@media` : le capteur ramasse l'en-tête avec elle — on ne
       garde que ce qui suit la dernière accolade ouvrante restée dans le texte */
    const propre = sel.slice(sel.lastIndexOf("{") + 1).trim();
    if (!propre || propre.startsWith("@")) continue;
    for (const branche of propre.split(",")) {
      const b = branche.trim();
      if (b) out.push({ branche: b, source: propre });
    }
  }
  return out;
}

/* ══ « AU REPOS » SE LIT SUR LE NŒUD, PAS SUR LE SÉLECTEUR ════════════════
   Un attribut (`[data-etat="bas"]`, `[data-arme="true"]`) se VÉRIFIE sur ce
   que le nœud porte réellement : c'est de la donnée. Une pseudo-classe
   (`:hover`, `:disabled`, `:has(…)`) décrit un état que le rendu ne connaît
   pas — une branche qui en porte une ne peint donc jamais au repos, et on la
   laisse tranquille. ⭐ Les pseudo-ÉLÉMENTS (`::before`, `::after`), eux,
   peignent sans condition : ils restent dans le lot. */
function porteUnEtat(branche) {
  return /(^|[^:]):[a-z-]+/.test(branche.replace(/::[a-z-]+/g, ""));
}

const COMBINATEURS = /\s*[>+~]\s*|\s+/;

function compoundMatch(noeud, compound) {
  const net = compound.replace(/::[a-z-]+/g, "");
  if (!net) return true;
  const classes = net.match(/\.[A-Za-z0-9_-]+/g) || [];
  const attrs = [...net.matchAll(/\[([A-Za-z0-9_-]+)(?:="([^"]*)")?\]/g)];
  const tag = net.replace(/\[[^\]]*\]/g, "").replace(/\.[A-Za-z0-9_-]+/g, "").trim();
  if (tag && tag !== "*" && (noeud.tagName || "") !== tag.toUpperCase()) return false;
  const portees = String(noeud.className || "").split(/\s+/).filter(Boolean);
  for (const c of classes) if (!portees.includes(c.slice(1))) return false;
  for (const [, nom, valeur] of attrs) {
    if (!noeud.hasAttribute(nom)) return false;
    if (valeur !== undefined && noeud.getAttribute(nom) !== valeur) return false;
  }
  return true;
}

/** Le nœud porte-t-il cette branche, dans l'état où le rendu l'a laissé ?
 *  ⭐ La lecture des ancêtres est VOLONTAIREMENT large : il suffit qu'un
 *  ancêtre porte chaque compound restant. Un garde qui se trompe doit se
 *  tromper du côté de l'accusation — le contraire serait un témoin qui ne peut
 *  jamais accuser. */
function noeudPorte(noeud, branche) {
  const compounds = branche.split(COMBINATEURS).filter(Boolean);
  const dernier = compounds.pop();
  if (!compoundMatch(noeud, dernier)) return false;
  for (const c of compounds) {
    let a = noeud.parentNode;
    let trouve = false;
    while (a && !trouve) { if (a.nodeType === 1 && compoundMatch(a, c)) trouve = true; a = a.parentNode; }
    if (!trouve) return false;
  }
  return true;
}

/** Tous les éléments RENDUS sous une racine — le nœud, puis sa descendance. */
function elements(racine) {
  const out = [];
  const marcher = (n) => {
    if (!n || n.nodeType !== 1) return;
    out.push(n);
    for (const e of n.childNodes) marcher(e);
  };
  marcher(racine);
  return out;
}

/** LE RELEVÉ : pour un rendu donné et une feuille donnée, qui porte l'alerte
 *  sans rien à reprocher. C'est la même sonde pour la mesure et pour l'attaque
 *  — sinon l'attaque ne prouverait rien du garde. */
function porteursDeLAlerte(racine, css) {
  const regles = reglesQuiEmploientLAlerte(css).filter((r) => !porteUnEtat(r.branche));
  const trouves = [];
  for (const n of elements(racine)) {
    for (const r of regles) {
      if (noeudPorte(n, r.branche)) {
        trouves.push(`${(n.tagName || "?").toLowerCase()}.${n.className || ""} « ${String(n.textContent || "").trim().slice(0, 16)} » ← ${r.branche}`);
        break;
      }
    }
  }
  return trouves;
}

/* ══ LE PLATEAU, RENDU PAR LA PORTE DU JOUEUR ════════════════════════════ */

const fixture = exempleFhEn();
function plateau() {
  return renderAbilitiesStep({
    document: fixture.document, resolved: fixture.report.resolved,
    rollBatch: null, method: "fh3d6", palier: 2
  }, () => {});
}

test("sonde — le plateau rend bien ses dix carrés, sinon ce garde ne garde rien", () => {
  const n = plateau();
  const cases = elements(n).filter((e) => String(e.className || "").split(/\s+/).includes("tray-case-num"));
  assert.equal(cases.length, 10, "dix carrés `roll N` — le témoin a quelque chose à regarder");
  assert.deepEqual(cases.slice(0, 2).map((c) => c.textContent), ["roll 1", "roll 2"]);
});

test("🔵 AUCUN ÉLÉMENT DU PLATEAU N'EMPRUNTE L'ENCRE DE L'ALERTE AU REPOS", () => {
  /* ⚖️ Eric, 2026-09-13 : *« Bleus, comme les boosts. »* Une case vide attend
     un dé ; elle n'a rien à reprocher, donc rien à dire en rouge. */
  const fautes = porteursDeLAlerte(plateau(), CSS);
  assert.deepEqual(fautes, [],
    "un organe AU REPOS peint en `--critical` dit « ce n'est pas bon » alors que rien ne l'est :\n  " + fautes.join("\n  "));
});

test("⚔️ ATTAQUE — le garde MORD : le rouge remis sur les carrés est vu, et nommé", () => {
  /* 🔴 LA MUTATION EST CELLE QUE LE LOT VIENT DE DÉFAIRE, à la lettre : la
     déclaration du 05/09, rendue à la feuille. Un garde qu'on n'a pas vu
     ROUGE ne prouve rien — il pourrait être vert parce qu'il ne lit rien. */
  const mute = CSS + "\n.tray-case-num { box-shadow: inset 0 0 0 1px var(--critical); }\n";
  const fautes = porteursDeLAlerte(plateau(), mute);
  assert.equal(fautes.length, 10, "les dix carrés sont vus, un par un");
  assert.ok(fautes.every((f) => f.includes("tray-case-num")),
    "⭐ et il les NOMME : un total juste ne dirait rien du contenu");
});

test("⚔️ ATTAQUE À L'ENVERS — un rouge D'ÉTAT ne fait pas crier le garde", () => {
  /* ⛔ Un garde qui accuserait tout rouge serait inutilisable : la moitié de la
     feuille peint `--critical` sur un état, et c'est sa raison d'être. On
     vérifie donc qu'un état que le rendu ne porte PAS reste muet — `data-etat`
     vaut « vide » sur une case neuve, jamais « bas ». */
  const mute = CSS + "\n.tray-case[data-etat=\"bas\"] .tray-case-num { color: var(--critical); }\n";
  assert.deepEqual(porteursDeLAlerte(plateau(), mute), [],
    "un rouge conditionné à un état absent du rendu n'est pas un rouge au repos");
  /* ⭐ ET LE MÊME SÉLECTEUR AVEC L'ÉTAT QUE LE RENDU PORTE VRAIMENT, LUI, CRIE
     — sinon la vérification d'au-dessus passerait pour une bonne raison qui
     n'en est pas une (le garde pourrait ignorer TOUS les attributs). */
  const muteVrai = CSS + "\n.tray-case[data-etat=\"vide\"] .tray-case-num { color: var(--critical); }\n";
  assert.equal(porteursDeLAlerte(plateau(), muteVrai).length, 10,
    "l'attribut est bien LU sur le nœud, pas ignoré");
});
