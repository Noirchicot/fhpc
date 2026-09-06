#!/usr/bin/env node
/* ══ LA BUILDER BIBLE SE GÉNÈRE, ELLE NE S'ÉCRIT PAS ═══════════════════════════

   Eric, 2026-09-06, devant 112 adresses de retard : *« 1 »* — on la regénère.

   🔴 CE QUE CE SCRIPT EXISTE POUR EMPÊCHER : qu'une COPIE DE LECTURE mente. La
   Bible du vault a été bâtie à la main le 03/09 ; le corpus a bougé de 112
   adresses depuis, et AUCUN des 9 sacrés posés le 06/09 n'y figurait. Un agent
   qui l'aurait lue pour connaître les sacrés — ce que la loi lui ordonne — en
   aurait manqué cinq.

   ⛔ SA LOI : la source est `ui/builder/`, toujours. Ce script ne fait que la
   RENDRE LISIBLE. On ne corrige jamais une règle dans la sortie.

   ⭐ ET LE MANIFESTE VIT DANS LE DÉPÔT, PAS DANS LE VAULT. Un garde qui lirait
   `~/obsidian-vault` casserait pour quiconque clone `fhpc` — le témoin doit être
   là où le garde tourne. Le manifeste est donc l'empreinte de la source ; s'il
   diverge, c'est que la Bible n'a pas été regénérée. */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
export const MANIFESTE = path.join(UI, "BIBLE.manifest");

/* ⭐ LE PLAN, RATIFIÉ PAR ERIC LE 2026-09-06 — huit chapitres. L'ordre est celui
   qu'il a validé : le mécanisme, la surface, les cotes, ce qu'on pose dessus. */
export const PLAN = [
  ["1-socle",      "Socle",       "le mécanisme",                ["socle", "vocabulaire"]],
  ["2-page",       "Page",        "la surface et ses cadres",    ["panneau", "cadre"]],
  ["3-dimension",  "Dimension",   "ce qui se compte",            ["budget"]],
  ["4-organes",    "Organes",     "ce qu'on pose dessus",        ["bouton","rangee","jeton","collecteur","popup","aiguilleur","livre","chevron","aide","interrupteur","voyant","dropdown","saisie"]],
  ["5-ecriture",   "Écriture",    "les textes et les gestes",    ["ecriture", "geste"]],
  ["6-listes",     "Listes",      "la pagination",               ["liste"]],
  ["7-etapes",     "Étapes",      "les dix écrans",              ["menu","identity","species","inheritance","destiny","class","abilities","skills","equipement","sheet"]],
];

const FICHIERS = ["NORMES.md", "CADRES.md", "SOCLE.md", "ECRANS.md"];

/** LIT LA SOURCE — une règle = son adresse, sa phrase, son niveau, ses liens. */
export function lireCorpus() {
  const regles = [];
  for (const f of FICHIERS) {
    const L = fs.readFileSync(path.join(UI, f), "utf8").split("\n");
    L.forEach((l, i) => {
      const m = /^>?\s*📍 `([a-z0-9-]+)` · ([^·]+) · ([0-9/?]+)\s*(·.*)?$/.exec(l);
      if (!m) return;
      const suite = (L[i + 1] || "").replace(/^>\s*/, "");
      const norme = suite.startsWith("⚖️") ? suite.replace(/^⚖️\s*/, "") : null;
      regles.push({
        ancre: m[1], statut: m[2].trim(), date: m[3],
        liens: (m[4] || "").trim(),
        sacre: !!norme && norme.startsWith("🔒"),
        phrase: norme ? norme.replace(/^🔒\s*/, "").replace(/^\*\*|\*\*$/g, "") : null,
        fichier: f, famille: m[1].split("-")[0],
      });
    });
  }
  return regles;
}

/** L'EMPREINTE — ce qui doit changer quand la Bible doit être regénérée. */
export function empreinte(regles) {
  const corps = regles
    .map((r) => `${r.ancre}|${r.statut}|${r.date}|${r.sacre ? "S" : "R"}|${r.phrase ?? ""}|${r.liens}`)
    .sort().join("\n");
  return { n: regles.length, sha: crypto.createHash("sha256").update(corps).digest("hex") };
}


/** LA PAGE DES RÉFÉRENCES — sur quoi la FORME de cette Bible est bâtie.
    ⭐ Eric, 2026-09-06 : *« mets les références sur lesquelles la Bible est
    construite dans la Bible. »* Une Bible qui ne dit pas d'où elle tient sa forme
    demande qu'on la croie sur parole. */
function references(regles) {
  const sacres = regles.filter((r) => r.sacre).length;
  return `# Références

*Sur quoi la **forme** de cette Bible est bâtie.* ⛔ Pas son contenu — le contenu vient
du corpus. Ceci dit d'où viennent l'adresse, le statut, le niveau et la supersession.

> [!info]+ 📖 POURQUOI CETTE PAGE EXISTE
> Eric, 2026-09-06 : *« mets les références sur lesquelles la Bible est construite dans
> la Bible. »* Une Bible qui ne dit pas d'où elle tient sa forme demande qu'on la croie
> sur parole — et le premier reproche fait à celle d'avant était justement qu'elle était
> **la Bible de l'architecte**, pas une pratique partagée.

---

## Ce qu'on a repris, et à qui

### 1. L'adresse stable et le statut — *Architecture Decision Records*

Un enregistrement est **immuable** : on ne le corrige pas, on le **supersède**. L'ancien
passe à *« superseded by … »* et pointe vers le neuf. Le champ statut est *« ce qui permet
à un lecteur de balayer un répertoire et de savoir lesquels font encore autorité »*.

➡️ **Chez nous** : \`📍 ancre · statut · date\`, le jeu fermé des six statuts, et la
**loi des deux âges** — la plus récente fait foi, l'ancienne s'archive.

* [Backstage — Architecture Decision Records](https://backstage.io/docs/architecture-decisions/)
* [Microsoft Azure Well-Architected — maintenir un ADR](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record)

### 2. La supersession passe à l'échelle — *Kafka KIP*

Plus de **mille** propositions déposées en dix ans, plusieurs centaines formellement
supersédées. *« Pour toute équipe qui craint que la discipline de supersession ne passe
pas l'échelle, l'index KIP est la réfutation. »*

➡️ **Chez nous** : ${regles.length} règles ne sont pas un problème de volume. La revue est
**périodique**, pas continue — on balaie l'index, on marque, on écrit les supersessions.

### 3. Normatif contre informatif — *rédaction de standards*

Les standards séparent **deux classes de texte** : le **normatif**, qui détermine la
conformité — précis, testable — et l'**informatif**, qui explique sans obliger.
*« Si le mandat et la justification sont mélangés, il faut les scinder. »*

➡️ **Chez nous** : \`⚖️\` porte **une phrase** normative ; la prose en dessous porte
l'incident daté et la mesure. C'est ce qui manquait à 237 adresses, qui disaient *où*
sans dire *quoi*.

* [The Open Group — rédiger un standard](https://pubs.opengroup.org/standards-guide/handbook-publications-development/latest/chap03-intro.html)
* [Language.Foundation — normatif vs informatif](https://language.foundation/Eliminating-Ambiguity-in-Requirements-What-Is-Normative-vs-Informative-Language)

### 4. Déprécier sans effacer — *design systems*

Une section pour ce qui est déprécié, avec **le motif et l'alternative** ; les équipes ne
doivent pas avoir à deviner si ce qu'elles lisent est courant ou périmé depuis six mois.

➡️ **Chez nous** : rien ne se supprime, tout s'archive — et le reliquat garde son incident.

* [zeroheight — déprécier dans un design system](https://learninghub.zeroheight.com/hc/en-us/articles/8772962477851-Deprecating-in-design-systems-When-it-s-time-to-say-goodbye)
* [Brad Frost — maintenir un design system](https://atomicdesign.bradfrost.com/chapter-5/)

---

## Ce qu'on n'a repris de personne

⭐ **Le niveau SACRÉ.** Les standards ont \`MUST\` et \`SHOULD\` ; nous avons **sacré** et
**règle** — mais avec une exigence qu'aucune des références ne pose : *« tout agent a en
mémoire TOUS les sacrés »*. C'est ce qui les oblige à rester **peu** : ils sont ${sacres}.
⛔ Un sacré qu'il faut chercher n'est pas un sacré.

⭐ **L'incident daté sous chaque règle.** Les références recommandent le *rationale* ;
ici il est **obligatoire**, et c'est ce qui rend une règle obéie plutôt que subie.

---

## La source, et rien d'autre

| fichier | ce qu'il porte |
|---|---|
| \`fhpc/ui/builder/NORMES.md\` | les organes, les voiles, les cotes, l'écriture, les gestes |
| \`fhpc/ui/builder/CADRES.md\` | les écrans, les objets, les largeurs |
| \`fhpc/ui/builder/SOCLE.md\` | le mécanisme, et les lois de la Bible elle-même |
| \`fhpc/ui/builder/ECRANS.md\` | les règles d'écran déployées, ⛔ jamais ratifiées |
| \`fhpc/ui/builder/A-TRANCHER.md\` | les contradictions vivantes |
| \`fhpc/tests/corpus-ancres.test.mjs\` | les sept refus qui tiennent le format |
| \`fhpc/tools/bible.mjs\` | ce qui a écrit la page que vous lisez |
`;
}

/* ── la sortie ─────────────────────────────────────────────────────────────── */
const esc = (s) => s.replace(/\|/g, "\\|");

function page([slug, titre, sous, familles], regles, sacres) {
  const mien = regles.filter((r) => familles.includes(r.famille));
  const parFam = new Map();
  for (const r of mien) (parFam.get(r.famille) ?? parFam.set(r.famille, []).get(r.famille)).push(r);

  let out = `# ${titre}\n\n*${sous}* — **${mien.length} règles**, générées depuis \`fhpc/ui/builder/\`.\n\n`;
  out += `> [!warning]+ ⛔ NE CORRIGEZ RIEN ICI\n> Cette page est **générée**. La source est \`fhpc/ui/builder/\` ; une correction`
       + ` écrite ici est perdue à la prochaine génération. ⛔ On corrige la source, puis on\n> relance \`node tools/bible.mjs\`.\n\n`;
  if (sacres.length) out += `> [!danger]+ 🔒 LES ${sacres.length} SACRÉS — à connaître par cœur, sans les chercher\n`
       + sacres.map((r) => `> · **${esc(r.phrase)}** \`${r.ancre}\``).join("\n") + "\n\n";

  for (const [fam, rs] of [...parFam].sort((a, b) => b[1].length - a[1].length)) {
    out += `---\n\n## \`${fam}\` — ${rs.length} règles\n\n`;
    for (const r of rs.sort((a, b) => a.ancre.localeCompare(b.ancre))) {
      out += `### ${r.sacre ? "🔒 " : ""}${esc(r.phrase ?? "⚠️ *cette règle n'a pas encore de phrase normative*")} { #${r.ancre} }\n\n`;
      out += `\`${r.ancre}\` · **${r.statut}** · ${r.date}${r.liens ? " · " + esc(r.liens) : ""} · source \`${r.fichier}\`\n\n`;
    }
  }
  return out;
}

/** ÉCRIT la Bible dans le vault, et le manifeste dans le dépôt. */
export function generer(dest) {
  const regles = lireCorpus();
  const sacres = regles.filter((r) => r.sacre);
  fs.mkdirSync(dest, { recursive: true });

  /* l'accueil : le plan, les sacrés, et d'où ça vient */
  let idx = `# Builder Bible\n\n> [!info]+ 📖 GÉNÉRÉE LE ${new Date().toISOString().slice(0, 10)}`
    + ` — ne rien corriger ici\n> **Source unique : \`fhpc/ui/builder/\`** — \`NORMES.md\` · \`CADRES.md\` ·`
    + ` \`SOCLE.md\` ·\n> \`ECRANS.md\` · \`A-TRANCHER.md\`, gardés par 17 suites de test.\n>`
    + `\n> ⛔ Cette Bible est une **copie de lecture**. Si les deux diffèrent, **la source a\n> raison**.`
    + ` On corrige la source, puis \`node tools/bible.mjs\`.\n\n`
    + `**${regles.length} règles**, dont **${sacres.length} sacrées** et`
    + ` **${regles.filter((r) => !r.phrase).length} sans phrase normative**.\n\n`;
  idx += `## 🔒 Les ${sacres.length} sacrés — à connaître sans les chercher\n\n`
    + sacres.map((r) => `1. **${esc(r.phrase)}** — \`${r.ancre}\``).join("\n") + "\n\n## Le plan\n\n| | chapitre | | règles |\n|---|---|---|--:|\n";

  const pages = [];
  PLAN.forEach(([slug, titre, sous, familles], i) => {
    const n = regles.filter((r) => familles.includes(r.famille)).length;
    idx += `| ${i + 1} | [${titre}](${slug}.md) | ${sous} | ${n} |\n`;
    pages.push([`${slug}.md`, page([slug, titre, sous, familles], regles, sacres.filter((r) => familles.includes(r.famille)))]);
  });
  const orphelines = regles.filter((r) => !PLAN.some(([, , , f]) => f.includes(r.famille)));
  idx += `| 8 | [À trancher](8-a-trancher.md) | les contradictions | 26 |\n`;
  idx += `| — | [Références](0-references.md) | sur quoi sa forme est bâtie | — |\n`;
  if (orphelines.length) idx += `\n⚠️ **${orphelines.length} règles hors plan** : familles `
    + [...new Set(orphelines.map((r) => `\`${r.famille}\``))].join(" · ") + ".\n";

  pages.push(["8-a-trancher.md", "# À trancher\n\n*les contradictions vivantes* — copie de `fhpc/ui/builder/A-TRANCHER.md`.\n\n"
    + fs.readFileSync(path.join(UI, "A-TRANCHER.md"), "utf8")]);
  pages.push(["0-references.md", references(regles)]);
  pages.push(["index.md", idx]);

  for (const [nom, contenu] of pages) fs.writeFileSync(path.join(dest, nom), contenu);
  fs.writeFileSync(MANIFESTE, JSON.stringify(empreinte(regles), null, 1) + "\n");
  return { pages: pages.length, regles: regles.length, sacres: sacres.length, orphelines: orphelines.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dest = process.argv[2] ?? path.join(process.env.HOME, "obsidian-vault", "FH-WEB", "Builder Bible");
  const r = generer(dest);
  console.log(`  ✅ ${r.pages} pages · ${r.regles} règles · ${r.sacres} sacrés · ${r.orphelines} hors plan`);
  console.log(`  → ${dest}`);
}
