/* ══ LOT 348 — 👆 UN BOUTON NE ZOOME JAMAIS LA PAGE ═══════════════════════════════════════════════════════
   NORMES `geste-bouton-ne-zoome-pas`. Constat d'Eric (28/09, simulateur iOS, iPad Pro 11, Safari) : six taps
   rapides sur le chevron droit du belt ont zoomé TOUTE la page — deux taps rapprochés font un double tap, et
   pour Safari un double tap est un zoom. La réponse est UNE ligne au socle de `shell.css` :
       :where(.app button) { touch-action: manipulation; }
   ⭐ `manipulation` garde le défilement ET le pincement ; il ne retire que le zoom au double tap.

   🛡️ CE QUE CE GARDE TIENT — sur la CASCADE, ⛔ jamais sur l'écriture de la ligne :
   · ① tout bouton du builder se résout en `manipulation` : ôter la règle le rend à `auto`, et le double tap
     zoome de nouveau ;
   · ② le défaut ne bat AUCUNE déclaration explicite, sur un bouton qui la porte. Les règles sont les VRAIES :
     toutes celles des feuilles que charge `index.html` (dans son ordre), plus la feuille que Wares écrit à
     l'exécution. 🔴 Le piège tenu d'abord : `[data-glissable="true"]` (`none`) sur les dés et les jetons qui
     SONT des boutons — un défaut à spécificité non nulle (`.app button`, 0,1,1) le battrait, et le doigt
     rendrait la main au défilement en plein glisser ;
   · ③ sur les vrais écrans d'Equipment (Pack, Wares, Gear — fabriqués par leurs modules) : aucun bouton ne
     reste en `auto`, et chaque jeton glissable garde sa valeur à lui.
   ⛔ LE GARDE CRIE devant un sélecteur qu'il ne sait pas lire : une règle sautée en silence serait exactement
   celle qui bat le défaut sans que personne le dise. Une absence n'est jamais une réponse.

   📏 Ce garde ne remplace pas le doigt, il tient ce que le doigt a montré — au simulateur iOS 27, taps réels à
   150 ms : `main` zoome au premier double tap (chevron du belt, tuner de Pack), la règle n'en laisse passer
   aucun. Voir la note de `shell.css`. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestDocument } from "./dom-stub.mjs";
import { stripComments, reglesDeLaFeuille } from "./source-scan.mjs";

globalThis.document = createTestDocument();
const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");

const { feuilleDesCotesWares, construireLesWares } = await import("../ui/builder/wares-ecran.mjs");
const { construireLeSac } = await import("../ui/builder/sac-ecran.mjs");
const { construireLEcranGear } = await import("../ui/builder/gear-ecran.mjs");

/* ══ LES RÈGLES `touch-action`, DANS L'ORDRE DE LA CASCADE ═══════════════════════════════════════════════
   ⭐ L'ordre des feuilles se LIT dans `index.html`, il ne se recopie pas. La feuille de Wares vient après :
   c'est un `<style>` que l'écran pose en se construisant, donc plus tard que tous les `<link>`. */
const FEUILLES = [...lire("index.html").matchAll(/<link rel="stylesheet" href="\.\/([\w.-]+\.css)/g)].map((m) => m[1]);
const SOURCES = [
  ...FEUILLES.map((f) => ({ origine: f, css: stripComments(lire(f)) })),
  { origine: "wares-ecran.mjs · feuilleDesCotesWares()", css: feuilleDesCotesWares() }
];
const REGLES = SOURCES.flatMap(({ origine, css }) => reglesDeLaFeuille(css).flatMap((r) => {
  const m = r.corps.match(/(?:^|;)\s*touch-action\s*:\s*([^;]+)/);
  return m ? [{ origine, sel: r.sel, parts: r.parts, valeur: m[1].trim(), sous: r.sous }] : [];
}));

/* ══ LE MOTEUR DE SÉLECTEURS DU GARDE ════════════════════════════════════════════════════════════════════
   Le sous-ensemble qu'emploient les règles `touch-action` du builder : balise, `*`, `#id`, `.classe`,
   `[attr]`, `[attr="v"]`, `:where()`, `:is()`, `:not()`, combinateurs descendant et enfant.
   ⛔ Tout le reste LÈVE — apprendre la syntaxe au garde avant de conclure. */
function coupe(texte, estSeparateur) {
  const morceaux = [];
  let courant = "", prof = 0, guillemet = null;
  for (const c of texte) {
    if (guillemet) { courant += c; if (c === guillemet) guillemet = null; continue; }
    if (c === '"' || c === "'") { guillemet = c; courant += c; continue; }
    if (c === "(" || c === "[") prof += 1;
    if (c === ")" || c === "]") prof -= 1;
    if (prof === 0 && estSeparateur(c)) { morceaux.push(courant); courant = ""; continue; }
    courant += c;
  }
  morceaux.push(courant);
  return morceaux.map((m) => m.trim()).filter(Boolean);
}
/** `.a > .b .c` → [{lien: null, simples}, {lien: ">", …}, {lien: " ", …}] — de gauche à droite. */
function decomposer(sel) {
  /* un `>` de premier niveau devient un jeton à lui ; ceux des parenthèses restent à leur argument */
  let norme = "", prof = 0, guillemet = null;
  for (const c of sel) {
    if (guillemet) { norme += c; if (c === guillemet) guillemet = null; continue; }
    if (c === '"' || c === "'") { guillemet = c; norme += c; continue; }
    if (c === "(" || c === "[") prof += 1;
    if (c === ")" || c === "]") prof -= 1;
    norme += prof === 0 && c === ">" ? " > " : c;
  }
  const jetons = coupe(norme, (c) => /\s/.test(c));
  const composes = [];
  let lien = null;
  for (const j of jetons) {
    if (j === ">") { lien = ">"; continue; }
    if (/^[+~]$/.test(j)) throw new Error(`⛔ le garde ne sait pas lire le combinateur « ${j} » de « ${sel} »`);
    composes.push({ lien: composes.length ? (lien || " ") : null, simples: simplesDe(j, sel) });
    lien = null;
  }
  return composes;
}
function simplesDe(compose, sel) {
  const simples = [];
  let reste = compose;
  const balise = reste.match(/^(\*|[a-zA-Z][\w-]*)/);
  if (balise) { simples.push({ type: balise[1] === "*" ? "tout" : "balise", nom: balise[1].toLowerCase() }); reste = reste.slice(balise[1].length); }
  while (reste) {
    let m;
    if ((m = reste.match(/^\.([\w-]+)/))) simples.push({ type: "classe", nom: m[1] });
    else if ((m = reste.match(/^#([\w-]+)/))) simples.push({ type: "id", nom: m[1] });
    else if ((m = reste.match(/^\[\s*([\w-]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([\w-]+))\s*)?\]/))) {
      simples.push({ type: "attr", nom: m[1], valeur: m[2] ?? m[3] ?? m[4] });
    } else if ((m = reste.match(/^:(where|is|not)\(/))) {
      let prof = 1, i = m[0].length;
      while (i < reste.length && prof) { if (reste[i] === "(") prof += 1; if (reste[i] === ")") prof -= 1; i += 1; }
      if (prof) throw new Error(`⛔ parenthèse jamais refermée dans « ${sel} »`);
      simples.push({ type: m[1], args: coupe(reste.slice(m[0].length, i - 1), (c) => c === ",") });
      m = [reste.slice(0, i)];
    } else throw new Error(`⛔ le garde ne sait pas lire « ${reste} » dans « ${sel} » — apprends-le-lui avant de conclure`);
    reste = reste.slice(m[0].length);
  }
  return simples;
}
const parentElement = (n) => (n.parentNode && n.parentNode.nodeType === 1 ? n.parentNode : null);
function correspondSimple(el, s) {
  switch (s.type) {
    case "tout": return true;
    case "balise": return el.tagName.toLowerCase() === s.nom;
    case "classe": return String(el.className || "").split(/\s+/).includes(s.nom);
    case "id": return (el.getAttribute("id") ?? el.id) === s.nom;
    case "attr": return el.hasAttribute(s.nom) && (s.valeur === undefined || el.getAttribute(s.nom) === s.valeur);
    case "where": case "is": return s.args.some((a) => correspond(el, a));
    case "not": return !s.args.some((a) => correspond(el, a));
    default: throw new Error(`⛔ sélecteur simple inconnu : ${s.type}`);
  }
}
function correspondDe(el, composes, i) {
  if (!composes[i].simples.every((s) => correspondSimple(el, s))) return false;
  if (i === 0) return true;
  if (composes[i].lien === ">") { const p = parentElement(el); return Boolean(p) && correspondDe(p, composes, i - 1); }
  for (let p = parentElement(el); p; p = parentElement(p)) if (correspondDe(p, composes, i - 1)) return true;
  return false;
}
function correspond(el, sel) {
  const composes = decomposer(sel);
  return correspondDe(el, composes, composes.length - 1);
}
const comparer = (p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2];
function specificite(sel) {
  const t = [0, 0, 0];
  for (const { simples } of decomposer(sel)) for (const s of simples) {
    if (s.type === "id") t[0] += 1;
    else if (s.type === "classe" || s.type === "attr") t[1] += 1;
    else if (s.type === "balise") t[2] += 1;
    else if (s.type === "is" || s.type === "not") {
      const plus = s.args.map(specificite).sort(comparer).pop();
      t[0] += plus[0]; t[1] += plus[1]; t[2] += plus[2];
    }
    /* `:where()` et `*` ne pèsent rien — c'est tout l'intérêt du défaut */
  }
  return t;
}

/* ══ LA CASCADE : la valeur SPÉCIFIÉE de `touch-action` pour un élément ══════════════════════════════════
   La plus spécifique gagne ; à égalité, la dernière dans l'ordre des feuilles. Aucune règle → `auto`. */
function specifiee(el) {
  let gagnante = null;
  for (const r of REGLES) {
    if (r.sous) throw new Error(`⛔ « ${r.sel} » (${r.origine}) vit sous « ${r.sous} » : le garde ne sait pas la peser`);
    if (/!important/.test(r.valeur)) throw new Error(`⛔ « ${r.sel} » (${r.origine}) est en !important : le garde ne sait pas la peser`);
    for (const part of r.parts) {
      if (!correspond(el, part)) continue;
      const sp = specificite(part);
      if (!gagnante || comparer(sp, gagnante.sp) >= 0) gagnante = { ...r, part, sp };
    }
  }
  return gagnante || { valeur: "auto", part: "(aucune règle — la valeur initiale)", origine: "—", sp: [0, 0, 0] };
}

function el(balise, attrs = {}, ...enfants) {
  const n = document.createElement(balise);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else n.setAttribute(k, v);
  }
  for (const e of enfants) n.append(e);
  return n;
}
/** Un bouton qui porte le sélecteur `sel` lui-même, posé dans `.app` — la balise de son sujet cède à `button`. */
function boutonQuiPorte(sel) {
  const composes = decomposer(sel);
  const fabriquer = (simples, estLeSujet) => {
    const balise = simples.find((s) => s.type === "balise");
    const n = el(estLeSujet ? "button" : (balise ? balise.nom : "div"));
    if (estLeSujet && balise && balise.nom !== "button") return null;   // la règle vise une autre balise
    for (const s of simples) {
      if (s.type === "classe") n.className = `${n.className || ""} ${s.nom}`.trim();
      else if (s.type === "id") n.setAttribute("id", s.nom);
      else if (s.type === "attr") n.setAttribute(s.nom, s.valeur ?? "");
      else if (s.type !== "balise" && s.type !== "tout") {
        throw new Error(`⛔ le garde ne sait pas fabriquer l'organe de « ${sel} » (${s.type}) — apprends-le-lui`);
      }
    }
    return n;
  };
  const app = el("div", { class: "app" });
  let hote = app;
  for (let i = 0; i < composes.length; i += 1) {
    const n = fabriquer(composes[i].simples, i === composes.length - 1);
    if (!n) return null;
    hote.append(n);
    hote = n;
  }
  assert.ok(correspond(hote, sel), `⛔ le garde a fabriqué un organe que « ${sel} » ne vise pas : le moteur ment`);
  return hote;
}

/* ══ ⓪ LES TÉMOINS — le moteur lit ce qu'il faut, et il sait accuser ════════════════════════════════════ */

test("⓪ a — les écrivains de `touch-action` sont TOUS lus : les feuilles d'`index.html`, et Wares à l'exécution", () => {
  const feuillesDuDossier = fs.readdirSync(UI).filter((f) => f.endsWith(".css")).sort();
  assert.deepEqual([...FEUILLES].sort(), feuillesDuDossier,
    "⛔ une feuille du dossier n'est pas chargée par `index.html` (ou l'inverse) : l'ordre de la cascade ne se lit plus");
  /* ⭐ Les modules qui écrivent `touch-action` HORS commentaire — une chaîne de CSS générée. On les ÉNUMÈRE sur la
     source : un nouvel écrivain que ce garde ignorerait pourrait battre le défaut sans qu'il le voie. */
  const ecrivains = fs.readdirSync(UI).filter((f) => f.endsWith(".mjs"))
    .filter((f) => /touch-action\s*:|touchAction\b/.test(stripComments(lire(f)))).sort();
  assert.deepEqual(ecrivains, ["wares-ecran.mjs"],
    "⛔ un module écrit `touch-action` à l'exécution et ce garde ne lit pas sa feuille : l'ajouter à SOURCES");
  assert.ok(REGLES.some((r) => r.origine.startsWith("wares-ecran.mjs")), "⛔ la feuille de Wares n'a rendu aucune règle `touch-action`");
});

test("⓪ b — le moteur pèse comme un navigateur : spécificité, `:where()` nul, ordre à égalité", () => {
  assert.deepEqual(specificite(":where(.app button)"), [0, 0, 0]);
  assert.deepEqual(specificite(".app button"), [0, 1, 1]);
  assert.deepEqual(specificite('[data-glissable="true"]'), [0, 1, 0]);
  assert.deepEqual(specificite('.sac-case[data-glissable="true"]'), [0, 2, 0]);
  assert.deepEqual(specificite(":is(#a, .b) span"), [1, 0, 1]);
  const b = el("button", { class: "x", "data-glissable": "true" });
  el("div", { class: "app" }, el("nav", { class: "belt" }, b));
  assert.ok(correspond(b, ":where(.app button)") && correspond(b, ".app > nav button") && correspond(b, '[data-glissable="true"]'));
  assert.ok(!correspond(b, ".app > button") && !correspond(b, ":not(.x)") && !correspond(b, ".belt-chevron"));
  assert.throws(() => correspond(b, "button:hover"), /ne sait pas lire/, "⛔ un sélecteur illisible doit LEVER, jamais répondre « non »");
});

/* ══ ① TOUT BOUTON DU BUILDER SE RÉSOUT EN `manipulation` ═══════════════════════════════════════════════ */

test("① un bouton du builder, où qu'il soit sous `.app`, vaut `manipulation` — sans la règle il vaut `auto`, et le double tap zoome", () => {
  const nu = el("button");
  const chevron = el("button", { class: "belt-chevron", "data-sens": "apres" });
  const tuner = el("button", { class: "sac-tuner", "data-sens": "droite" });
  const dansUnPopup = el("button", { class: "confirm-oui" });
  el("div", { class: "app" }, nu, el("nav", { class: "belt" }, chevron),
    el("div", { class: "stage" }, el("div", { class: "sac" }, tuner)), el("div", { class: "popup" }, dansUnPopup));
  for (const [nom, bouton] of [["un bouton nu", nu], ["le chevron du belt", chevron], ["le tuner de Pack", tuner], ["un bouton de popup", dansUnPopup]]) {
    const v = specifiee(bouton);
    assert.equal(v.valeur, "manipulation",
      `⛔ ${nom} vaut « ${v.valeur} » (${v.part} · ${v.origine}) : deux taps rapides zooment la page — le constat du 28/09`);
    assert.deepEqual(v.sp, [0, 0, 0], `⛔ ${nom} tient son \`manipulation\` d'une règle qui PÈSE (${v.part}, ${v.sp}) : un défaut ne pèse rien`);
  }
  /* ⭐ Et hors de `.app`, la règle ne touche rien : la page d'un VTT qui accueille le builder garde ses boutons. */
  const ailleurs = el("button");
  el("div", { class: "page-hote" }, ailleurs);
  assert.equal(specifiee(ailleurs).valeur, "auto", "⛔ le défaut déborde de `.app` : il touche les boutons de la page hôte");
});

/* ══ ② LE DÉFAUT NE BAT AUCUNE DÉCLARATION EXPLICITE ═════════════════════════════════════════════════════ */

test("② chaque règle `touch-action` réelle garde son organe contre le défaut — `none` des glissables d'abord", () => {
  const explicites = REGLES.filter((r) => !r.parts.some((p) => specificite(p).every((x) => x === 0)));
  assert.ok(explicites.some((r) => r.parts.includes('[data-glissable="true"]') && r.valeur === "none"),
    "témoin — la règle des surfaces glissables (`none`) est bien lue");
  assert.ok(explicites.length >= 8, `témoin — ${explicites.length} règles explicites lues, on en attendait au moins 8`);
  const vues = [];
  for (const r of explicites) for (const part of r.parts) {
    const bouton = boutonQuiPorte(part);
    if (!bouton) continue;
    const v = specifiee(bouton);
    vues.push(`${part} → ${v.valeur}`);
    assert.equal(v.valeur, r.valeur,
      `⛔ sur un bouton qui porte « ${part} » (${r.origine}), le défaut « ${v.part} » (${v.sp}) bat « ${r.valeur} » : ` +
      "un défaut qui pèse écrase la déclaration d'un organe — sur un jeton glissable, le doigt part au défilement");
  }
  assert.ok(vues.length >= 8, `témoin — ${vues.length} organes éprouvés : ${vues.join(" · ")}`);
});

/* ══ ③ LES VRAIS ÉCRANS D'EQUIPMENT ═════════════════════════════════════════════════════════════════════ */

test("③ Pack, Wares, Gear fabriqués par leurs modules : aucun bouton en `auto`, chaque glissable garde sa valeur", () => {
  const ecrans = {
    Pack: construireLeSac({ sections: [{ nom: "Camp" }, { nom: "Storage 1" }], section: 0, poids: {}, destinations: [],
      objets: [{ index: 4, nom: "Rope", qte: 1 }, { index: 5, nom: "Lantern", qte: 1, locked: true }] }).noeud,
    Wares: construireLesWares({ categories: [{ nom: "Armory" }, { nom: "Tools" }], categorie: 0,
      sousCategories: [{ nom: "Rings" }], sousCategorie: 0, objets: [{ ref: "srd:item:en:a", nom: "Rope", qte: 1 }],
      sections: [{ valeur: "backpack", mot: "Backpack" }], destination: "backpack" }).noeud,
    Gear: construireLEcranGear({ boites: { tete1: { nom: "Helm", qte: 1, index: 3 } }, collecte: new Set() }).noeud
  };
  let boutons = 0, glissables = 0;
  for (const [nom, noeud] of Object.entries(ecrans)) {
    el("div", { class: "app" }, el("div", { class: "stage" }, noeud));
    const tous = [noeud, ...noeud.querySelectorAll("*")];
    for (const n of tous.filter((x) => x.tagName === "BUTTON")) {
      boutons += 1;
      const v = specifiee(n);
      assert.notEqual(v.valeur, "auto", `⛔ ${nom} : le bouton « ${n.className} » vaut \`auto\` — deux taps rapides y zooment la page`);
    }
    for (const n of tous.filter((x) => x.getAttribute && x.getAttribute("data-glissable") === "true")) {
      glissables += 1;
      const v = specifiee(n);
      assert.notEqual(v.valeur, "manipulation",
        `⛔ ${nom} : le glissable « ${n.tagName.toLowerCase()}.${n.className} » vaut \`manipulation\` (${v.part}) — le défaut a battu sa marque`);
      assert.ok(v.sp.some((x) => x > 0), `⛔ ${nom} : le glissable « ${n.className} » ne tient sa valeur d'aucune règle explicite`);
    }
  }
  assert.ok(boutons >= 10, `témoin — ${boutons} boutons lus sur les trois écrans`);
  assert.ok(glissables >= 2, `témoin — ${glissables} surfaces glissables lues (Pack et Wares en portent)`);
});
