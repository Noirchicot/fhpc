/* ══ LES NOMS QUI ONT SURVÉCU À LEUR RETRAIT — LOT 79 ══════════════════════
   🔴 UNE FAMILLE DE DÉFAUT DE PLUS, ET ELLE N'EST PAS CELLE DE LA JOURNÉE.
   Les six pièges du 20/08 étaient des ABSENCES mal lues. Celui-ci est une
   PRÉSENCE qui a survécu à un retrait : le record est bien éteint, et son NOM
   continue de vivre dans le texte d'un AUTRE record, dans un champ que rien ne
   relie à lui.

   Trouvé par le fil FH WEB en filtrant les citations du livre : la fiche du
   Barde disait `Tools: Choose 3 Musical Instruments` alors que le record
   `Musical Instrument` est éteint depuis que Fate's Hand le splite en trois.
   Un barde lisait l'instruction de choisir trois exemplaires d'un outil qui
   n'existe pas dans le jeu. Le filtre par RECORD ne pouvait pas l'attraper —
   il n'y avait pas de record à filtrer, seulement un mot dans une phrase.

   ⭐ LA LISTE DES NOMS MORTS EST DÉRIVÉE, JAMAIS ÉCRITE. Elle sort de
   `exports/fh-changes.json` : les `removed` de chaque genre, plus les
   `renamed[].from`. Une liste écrite à la main aurait le défaut exact que ce
   garde cherche — elle vieillirait pendant que la matière bouge.

   ── LA PORTÉE, ET POURQUOI ELLE S'ARRÊTE LÀ ──────────────────────────────
   Les genres qu'un JOUEUR traverse en créant son personnage. Pas les
   monstres : les 330 portent « Passive Perception » dans leur bloc, c'est du
   contenu de meneur, et Eric a tranché qu'il ne se cite pas. Pas les sorts ni
   les objets : leur prose emploie ces mots au sens commun bien plus souvent
   qu'au sens de règle. ⚠️ Ce n'est donc PAS un garde universel, et le dire
   fait partie du garde : hors de cette portée, personne ne mesure.

   ── LA DETTE EST DÉCLARÉE, PAS TOLÉRÉE EN SILENCE ────────────────────────
   Quinze occurrences existent aujourd'hui. Trois attendent une RÈGLE d'Eric
   (voir §DETTE), deux sont DÉLIBÉRÉES, dix vivent dans des champs que le
   builder n'affiche pas. Chacune est nommée ci-dessous avec sa raison.
   ⛔ ET LE GARDE MORD DANS LES DEUX SENS : une occurrence NEUVE le fait
   rougir, et une occurrence de la liste qui DISPARAÎT le fait rougir aussi.
   Sans le second sens, la liste survivrait aux corrections qu'elle décrit et
   redeviendrait exactement ce qu'elle remplace : un texte qui a vieilli. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { monter } from "../src/tools/gen-fh-changes.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Les genres qu'un joueur traverse en créant son personnage. */
const PORTEE = ["species", "class", "background", "feat", "training", "tool", "skill", "arcana"];

/* Les champs que `ui/builder/class-step.mjs` et `species-step` AFFICHENT
   vraiment. Séparer les deux listes est le cœur du tri : `skill_proficiencies`
   porte « Perception » depuis toujours et personne ne le lit dans le builder ;
   `features[].description` le porte aussi, et un joueur de Barbare le LIT. */
const AFFICHES = /^data\.(description|blurb|lore\.|traits\[|features\[\d+\]\.description|lineages\[)/;

/** ⏳ LA DETTE, AU 2026-08-20. Chaque ligne dit où, quoi, et pourquoi elle
 *  tient encore. `rule` marque celles qui attendent un arbitrage d'Eric. */
const DETTE = [
  /* ── DÉLIBÉRÉ : la prose d'Eric CITE le terme SRD pour dire ce qu'il change.
     Le retirer rendrait la comparaison incompréhensible. ─────────────────── */
  { genre: "species", id: "srd:species:en:elf", chemin: "data.lore.sections[0].text", mot: "Perception",
    pourquoi: "délibéré — « (The SRD grants one proficiency among Insight, Perception or Survival.) », Eric compare" },
  { genre: "species", id: "fh:species:en:elestu", chemin: "data.lore.sections[0].text", mot: "Perception",
    pourquoi: "délibéré — même phrase de comparaison que l'Elfe" },

  /* ── 🔴 ATTEND UNE RÈGLE D'ERIC. Le joueur LIT ces trois-là. ──────────── */
  { genre: "species", id: "srd:species:en:gnome", chemin: "data.traits[2].text", mot: "Gnome", rule: true,
    pourquoi: "🔴 le trait « Hoddon Lineage » dit « Forest Gnome »/« Rock Gnome » pendant que les boutons disent « Forest Folk »/« Rock Folk » — voir §DETTE" },
  { genre: "class", id: "srd:class:en:barbarian", chemin: "data.features[6].description", mot: "Perception", rule: true,
    pourquoi: "🔴 Primal Knowledge OFFRE Perception dans sa liste de choix — quel nom FH prend sa place ?" },
  { genre: "class", id: "srd:class:en:bard", chemin: "data.description", mot: "Musical Instrument", rule: true,
    pourquoi: "🔴 « proficiency with one Musical Instrument of your choice » — lequel des trois outils FH ?" },
  { genre: "class", id: "srd:class:en:bard", chemin: "data.features[1].description", mot: "Musical Instrument", rule: true,
    pourquoi: "🔴 « use a Musical Instrument as a Spellcasting Focus » — même question" },

  /* ── INERTE : le builder n'affiche PAS ces champs. Ils pourrissent quand
     même, et c'est là que le fil FH WEB les a trouvés — le LIVRE, lui, les
     cite. La correction leur appartient, la mesure est ici. ─────────────── */
  { genre: "class", id: "srd:class:en:barbarian", chemin: "data.skill_proficiencies", mot: "Perception",
    pourquoi: "inerte dans le builder (le pool FH remplace ce champ) — mais le livre le cite" },
  { genre: "class", id: "srd:class:en:druid", chemin: "data.skill_proficiencies", mot: "Perception", pourquoi: "idem" },
  { genre: "class", id: "srd:class:en:fighter", chemin: "data.skill_proficiencies", mot: "Perception", pourquoi: "idem" },
  { genre: "class", id: "srd:class:en:ranger", chemin: "data.skill_proficiencies", mot: "Perception", pourquoi: "idem" },
  { genre: "class", id: "srd:class:en:rogue", chemin: "data.skill_proficiencies", mot: "Perception", pourquoi: "idem" },
  { genre: "class", id: "srd:class:en:bard", chemin: "data.starting_equipment", mot: "Musical Instrument",
    pourquoi: "inerte — l'équipement de départ n'est pas encore un écran" },
  { genre: "class", id: "srd:class:en:bard", chemin: "data.tool_proficiencies", mot: "Musical Instruments",
    pourquoi: "inerte ici — c'est LA ligne que le fil FH WEB a trouvée dans le livre" },
  { genre: "class", id: "srd:class:en:monk", chemin: "data.starting_equipment", mot: "Musical Instrument", pourquoi: "inerte" },
  { genre: "class", id: "srd:class:en:monk", chemin: "data.tool_proficiencies", mot: "Musical Instrument", pourquoi: "inerte" }
];

/* ── LA MESURE ─────────────────────────────────────────────────────────── */

function nomsMorts() {
  const changes = JSON.parse(readFileSync(join(ROOT, "exports", "fh-changes.json"), "utf8"));
  const noms = [];
  for (const mesure of Object.values(changes.genres)) {
    noms.push(...mesure.removed, ...mesure.renamed.map((r) => r.from));
  }
  return noms;
}

function occurrences() {
  const noms = nomsMorts();
  const motif = new RegExp(`\\b(${noms.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})s?\\b`, "g");
  const fh = monter(PILE);
  const trouvees = [];
  const fouille = (valeur, chemin, ctx) => {
    if (typeof valeur === "string") {
      for (const mot of new Set(valeur.match(motif) || [])) trouvees.push({ ...ctx, chemin, mot });
      return;
    }
    if (Array.isArray(valeur)) { valeur.forEach((v, i) => fouille(v, `${chemin}[${i}]`, ctx)); return; }
    if (valeur && typeof valeur === "object") {
      for (const [k, v] of Object.entries(valeur)) fouille(v, chemin ? `${chemin}.${k}` : k, ctx);
    }
  };
  for (const genre of PORTEE) {
    for (const vue of fh.query({ kind: genre })) fouille(vue.record, "", { genre, id: vue.id });
  }
  return trouvees;
}

const clef = (o) => `${o.genre}|${o.id}|${o.chemin}|${o.mot}`;

/* ── LES GARDES ────────────────────────────────────────────────────────── */

test("témoin — la liste des noms morts est DÉRIVÉE et n'est pas vide", () => {
  const noms = nomsMorts();
  assert.ok(noms.length >= 8, `attendu au moins 8 noms disparus, mesuré ${noms.length}`);
  assert.ok(noms.includes("Perception") && noms.includes("Musical Instrument") && noms.includes("Gnome"),
    "sans ces trois-là, ce garde ne garde rien de ce qu'il prétend garder");
});

test("🔴 AUCUN nom mort NEUF dans ce qu'un joueur traverse", () => {
  const connues = new Set(DETTE.map(clef));
  const neuves = occurrences().filter((o) => !connues.has(clef(o)));
  assert.deepEqual(neuves.map(clef), [],
    "un record éteint ou renommé a laissé son nom dans le texte d'un autre record. " +
    "Soit on corrige la couche, soit on l'ajoute à DETTE avec sa raison — jamais en silence.");
});

test("⛔ la DETTE ne survit pas à ses corrections — une ligne périmée ROUGIT", () => {
  /* Le second sens du garde, et c'est lui qui empêche la liste de devenir le
     texte vieilli qu'elle remplace. Une occurrence corrigée dans la couche
     DOIT disparaître d'ici, sans quoi on tolérerait pour toujours un défaut
     qui n'existe plus — et le prochain lecteur croirait le bug encore là. */
  const vues = new Set(occurrences().map(clef));
  const perimees = DETTE.filter((d) => !vues.has(clef(d))).map(clef);
  assert.deepEqual(perimees, [],
    "ces lignes de DETTE ne correspondent plus à rien dans les couches : le défaut est corrigé, " +
    "la ligne doit partir.");
});

/* ══ §DETTE — CE QUI ATTEND UN ARBITRAGE D'ERIC ══════════════════════════ */

test("⏳ DETTE — le Hoddon porte TROIS noms pour la même lignée", () => {
  /* 🔴 MESURÉ LE 2026-08-20, et c'est le plus visible des trois : le joueur
     LIT un nom et CLIQUE sur un autre.
       · `data.lineages[].name`   → « Forest Folk »   (ce que le bouton affiche)
       · `data.traits[2].text`    → « Forest Gnome »  (ce que le trait raconte)
       · `data.description`       → « Forest Hoddon » (ce que la substitution a posé)

     ⚠️ ET LE GARDE QUI DEVAIT L'EMPÊCHER ÉTAIT VERT. `gen-fh-species-layer`
     déclare bien `Forest Gnome → Forest Hoddon`, avec une alarme si le motif
     ne se trouve pas et un `mustNotContain` sur le résultat. Les deux ne
     regardent QUE `data.description`. Le mot a survécu dans `traits[].text`
     parce que personne n'y mesurait — le garde couvrait l'endroit où la
     correction s'appliquait, pas l'endroit où le mot pouvait vivre.

     ⏳ CE TEST FAILLIRA LE JOUR OÙ ERIC TRANCHERA, et c'est voulu : il rappelle
     alors qu'il y a TROIS endroits à aligner, pas un. La question est simple —
     la lignée s'appelle-t-elle « Forest Folk » (le bouton, et « The Mole
     People » à côté suggère que c'est la voix d'Eric) ou « Forest Hoddon »
     (la substitution mécanique) ? */
  const fh = monter(PILE);
  const data = fh.query({ kind: "species", id: "srd:species:en:gnome" }).record.data;
  assert.deepEqual(data.lineages.map((l) => l.name), ["Forest Folk", "Rock Folk", "The Mole People"]);
  assert.match(data.traits[2].text, /Forest Gnome/, "le trait dit encore « Gnome » — dette connue");
  assert.match(data.description, /Forest Hoddon/, "la description dit « Hoddon » — troisième nom");
});

test("⏳ DETTE — QUATRE textes AFFICHÉS nomment un choix qui n'existe pas", () => {
  /* ⭐ LE TRI QUI COMPTE, ET C'EST LUI QU'ERIC A SENTI EN LISANT LE LIVRE :
     *« je vois des classes de personnages un coup c'est SRD un coup c'est FH »*.
     Ces quatre-là, le joueur les LIT dans le builder — la couture est sous ses
     yeux. Les onze autres vivent dans des champs que rien n'affiche : même
     défaut, sans témoin. */
  const affichees = DETTE.filter((d) => AFFICHES.test(d.chemin) && d.rule);
  assert.equal(affichees.length, 4,
    "quatre dettes attendent une règle d'Eric : la lignée du Hoddon, le Barbare " +
    "(Primal Knowledge offre Perception), et le Barde deux fois (Musical Instrument).");
  for (const d of affichees) assert.ok(d.pourquoi.startsWith("🔴"), `${clef(d)} doit dire pourquoi elle attend`);
});
