#!/usr/bin/env node
/* ══ IMPORTER ET REGARDER LES 22 SYMBOLES — outil de contrôle ══════════════
   Il fait les trois choses qu'on refaisait à la main à chaque livraison :
   1. IMPORTE du vault vers le dépôt, en renommant par SLUG (le vault nomme
      par chiffre + nom anglais, le dépôt par slug comme les images de carte) ;
   2. CONTRÔLE mécaniquement — viewBox, currentColor, l'accent, et surtout
      AUCUNE couleur en dur : une seule y suffit à casser un des deux thèmes ;
   3. REND une planche aux TROIS tailles, parce qu'un symbole se juge à la
      cote où il sera vu, jamais sur un rapport ni à 512 px.
   ⚖️ `var(--sp-accent)` est corrigé en `var(--accent)` à l'entrée : le jeton
   du socle existe, et une norme ne se double pas d'un jeton privé. */
import fs from "node:fs";
import path from "node:path";

const VAULT = "/Users/Eric/obsidian-vault/FH-WEB/Ressources/Tarot/07-Symboles-v1";
const RACINE = path.join(import.meta.dirname, "..");
const DEST = path.join(RACINE, "ui/builder/assets/arcana/symboles");
const layer = JSON.parse(fs.readFileSync(path.join(RACINE, "layers/fh-arcana-en.layer.json"), "utf8"));
const ORDRE = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const recs = Object.values(layer.records.arcana).sort(
  (a, b) => ORDRE.indexOf(a.data.numeral) - ORDRE.indexOf(b.data.numeral));

/* ⛔ CE QUE CE MOTIF ATTRAPE, ET IL A DÉJÀ SERVI : une couleur écrite en dur
   rend l'icône illisible dans l'un des deux thèmes — et ça ne se voit que
   dans celui qu'on ne regarde pas. */
const COULEUR = /#[0-9a-fA-F]{3,8}\b|\b(?:black|white|red|blue|green|gold|silver|gray|grey|yellow|orange|purple)\b|rgba?\(|hsla?\(/;
const INTERDIT = /<text|linearGradient|radialGradient|<filter|<mask/;

const rapport = [];
for (const rec of recs) {
  const nom = `${rec.data.numeral}-${rec.name.replace(/ /g, "-")}-symbole-v1.svg`;
  const src = path.join(VAULT, nom);
  if (!fs.existsSync(src)) { rapport.push([rec.data.numeral, "⛔ ABSENT du vault"]); continue; }
  let svg = fs.readFileSync(src, "utf8").replace(/var\(--sp-accent\)/g, "var(--accent)");
  const fautes = [];
  const vb = svg.match(/viewBox="0 0 (\d+) \1"/);
  if (!vb) fautes.push("viewBox non carré ou absent");
  if (!svg.includes("currentColor")) fautes.push("pas de currentColor");
  if (!svg.includes("var(--accent)")) fautes.push("pas d'accent");
  const c = svg.match(COULEUR); if (c) fautes.push(`couleur en dur « ${c[0]} »`);
  const i = svg.match(INTERDIT); if (i) fautes.push(`interdit « ${i[0]} »`);
  const sw = [...svg.matchAll(/stroke-width="([\d.]+)"/g)].map((m) => m[1]);
  fs.writeFileSync(path.join(DEST, `${rec.slug}.svg`), svg);
  rapport.push([rec.data.numeral, fautes.length ? "⛔ " + fautes.join(" · ")
    : `✔ toile ${vb[1]} · trait ${[...new Set(sw)].join("/") || "(hérité)"} · ${fs.statSync(src).size} o`]);
}
for (const [n, m] of rapport) console.log(String(n).padStart(5), m);
const casses = rapport.filter(([, m]) => m.startsWith("⛔"));
console.log(`\n${rapport.length - casses.length} / ${rapport.length} passent le contrôle`);

/* ── LA PLANCHE : trois tailles, deux fonds ──────────────────────────────
   ⚠️ UNE GRILLE CSS A CASSÉ DEUX FOIS ICI (colonnes effondrées, page géante
   qui faisait échouer la capture). Une rangée en `flex-wrap` avec une largeur
   FIXE par case ne peut pas s'effondrer : chaque case occupe ce qu'on lui
   donne, quoi que contienne le SVG. */
/* ⛔ LA PLANCHE SE CONSTRUIT PAR INTERPOLATION, PAS PAR `replace` — et c'est
   un bug payé trois fois : je remplaçais des marqueurs `A`/`B`/`C` dans un
   gabarit, et le SVG inséré au premier remplacement CONTIENT des `B` et des
   `C`. Les remplacements suivants tapaient dedans, et la planche affichait des
   bandes dupliquées. J'ai cru trois fois que les icônes étaient en double.
   ⭐ Un gabarit qui s'interpole ne peut pas se manger lui-même. */
const bande = (taille, larg) => recs.map((r) =>
  `<span class="c" style="width:${larg}px"><span class="s" style="--t:${taille}px">` +
  fs.readFileSync(path.join(DEST, `${r.slug}.svg`), "utf8").trim() +
  `</span><b>${r.data.numeral}</b></span>`).join("");
const page = `<style>*{box-sizing:border-box}html,body{overflow:hidden}
body{margin:0;font:12px Inter,system-ui,sans-serif;--accent:#c9a24a;background:#14161b;color:#ece8df}
.b{padding:16px}.jour{background:#f6f4ef;color:#1d1c19;--accent:#9a7420}
h3{margin:0 0 10px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;opacity:.5}
.r{display:flex;flex-wrap:wrap;gap:14px 2px}
.c{display:inline-block;text-align:center}
.s{display:block}.s svg{width:var(--t);height:var(--t)}
.c b{display:block;font-size:8px;opacity:.4;margin-top:2px}</style>
<div class="b"><h3>72 — pour voir le dessin</h3><div class="r">${bande(72, 82)}</div>
<h3 style="margin-top:16px">36 — LA COTE DU RAIL, c'est elle qui décide</h3><div class="r">${bande(36, 46)}</div>
<h3 style="margin-top:16px">24</h3><div class="r">${bande(24, 34)}</div></div>
<div class="b jour"><h3>le jour, à 36</h3><div class="r">${bande(36, 46)}</div></div>`;
const sortie = process.argv[2] || "/tmp/planche-symboles.html";
fs.writeFileSync(sortie, page);
console.log(`planche : ${sortie}`);
