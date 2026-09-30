/* ══ 🖐️ LOT 361 — UN REPEINT NE CASSE RIEN : NI LE GESTE, NI LE TEXTE, NI L'OBJET ARMÉ ════════════════
   Mandat d'ARCHI 35 (29/09) : *« à Identity, quand le champ Name a encore le focus après la frappe, le premier
   "armer puis poser" est avalé »* — puis, sur le texte perdu au glisser : *« un repeint (refresh) ne détruit
   JAMAIS un texte pas encore enregistré, quel que soit le champ »*.

   📏 LES QUATRE CHAÎNES, MESURÉES AU NAVIGATEUR (v912, sonde d'événements, souris et iPad) :
     ① souris, jeton : `pointerdown` Woman → le focus quitte Name → `change` → `rename` → repeint → `pointerup`
        arme l'ANCIEN Woman, détaché → le clic sur Gender désarme ;
     ② souris, bouton : `mousedown` sur Done → `change` → repeint → `mouseup` sur le NOUVEAU Done → aucun
        `click` ; au doigt, l'onglet Species pareil, par le `mousedown` qu'iOS synthétise ;
     ③ doigt, appui long : Woman armé ; 1,2 s après, le `mousedown` synthétisé → `change` → repeint → le jeton
        armé est remplacé → le tap sur Gender désarme ;
     ④ doigt, glisser : aucun focus perdu → la pose repeint → Name, encore actif, est remplacé sans `change` : le
        texte tapé est perdu.

   CE QUE CE FICHIER TIENT — chaque garde vient d'une de ces chaînes :
     A. `repeint.mjs` — un repeint demandé pendant un appui attend la fin de son clic (②) ; un texte actif
        s'enregistre avant le repeint (④), ou revient s'il n'avait nulle part où s'écrire ;
     B. `glisser.mjs` — l'objet armé suit son OBJET (`cle`), pas son nœud (① ③) ;
     C. le câblage — `refresh()` passe par `avantLeRepeint`, et chaque organe armé déclare sa clé.

   ⚠️ LE STUB EST PLAT : ni phases, ni remontée, ni focus, ni `click` fabriqué. Ce fichier rejoue donc L'ORDRE
   DU NAVIGATEUR à la main, et le dit à chaque pas : le document en capture d'abord, puis la cible ; la perte du
   focus au `mousedown` (et le `change` qu'elle fait dire à un champ modifié) ; et la règle du `click` — ⛔ aucun
   `click` quand le nœud pressé a quitté le document (mesuré à la chaîne ② : il ne vient jamais). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

/* ══ L'HORLOGE — `setTimeout` fourni par le test, comme `elementFromPoint` : « l'appui long a tenu » et « la fin de
   la tâche » se disent à la main, à la milliseconde. */
const horloge = (() => {
  const attendus = new Map();
  let suivant = 0;
  globalThis.setTimeout = (fn) => { attendus.set(++suivant, fn); return suivant; };
  globalThis.clearTimeout = (id) => { attendus.delete(id); };
  /* ⚠️ UN SEUL PASSAGE : un minuteur posé pendant ce passage attend le suivant — sans quoi le flash d'un
     transfert s'éteindrait avant qu'on le regarde, et le garde « aucun flash » ne pourrait jamais accuser. */
  return { ecouler() { const tous = [...attendus.values()]; attendus.clear(); for (const fn of tous) fn(); } };
})();

/* ══ LE VEILLEUR — `MutationObserver` fourni par le test : le navigateur livre les mutations à la fin de la tâche
   qui a repeint ; la coquille du banc les livre à la fin de son `refresh()`. */
const veilleurs = new Set();
class VeilleurDuBanc {
  constructor(rappel) { this.rappel = rappel; }
  observe() { veilleurs.add(this); }
  disconnect() { veilleurs.delete(this); }
}
globalThis.MutationObserver = VeilleurDuBanc;
function livrerLesMutations() { for (const v of [...veilleurs]) v.rappel([]); }

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

const { avantLeRepeint, champDeTexteActif } = await import("../ui/builder/repeint.mjs");
const { armerJeton } = await import("../ui/builder/glisser.mjs");
const { renderConceptStep } = await import("../ui/builder/concept-step.mjs");
const { swapContent } = await import("../ui/builder/socle.mjs");

/* ══ L'ORDRE DU NAVIGATEUR, RÉÉCRIT À LA MAIN ══════════════════════════════════════════════════════════════ */

function evenement(type, target, pointerType) {
  return {
    type, target, clientX: 0, clientY: 0, pointerId: pointerType === "mouse" ? 1 : 2, button: 0, buttons: 1,
    pointerType, isPrimary: true, cancelable: true, arrete: false,
    preventDefault() {}, stopPropagation() { this.arrete = true; }
  };
}

/** L'APPUI : le document en CAPTURE (l'écoute du repeint, puis celle d'un objet armé), puis la cible — sauf si un
 *  écouteur l'a arrêté ; à la souris, `mousedown` suit. */
function presser(el, pointerType) {
  const e = evenement("pointerdown", el, pointerType);
  document.dispatchEvent(e);
  if (!e.arrete) el.dispatchEvent(e);
  if (pointerType === "mouse") document.dispatchEvent(evenement("mousedown", el, pointerType));
}

/** LE RELÂCHÉ : `pointerup` au document ; à la souris, `mouseup` et `click` dans la MÊME tâche — ⛔ aucun `click`
 *  si le nœud pressé a quitté le document. Puis la fin de la tâche. */
function relacher(el, pointerType) {
  document.dispatchEvent(evenement("pointerup", el, pointerType));
  if (pointerType === "mouse") {
    document.dispatchEvent(evenement("mouseup", el, pointerType));
    if (el.isConnected) el.dispatchEvent(evenement("click", el, pointerType));
  }
  horloge.ecouler();
}

/** LA PERTE DU FOCUS — l'action par défaut d'un `mousedown` ailleurs : le champ actif le perd, et le navigateur
 *  lui fait dire `change` s'il a été modifié depuis. */
function perdreLeFocus() {
  const champ = document.activeElement;
  document.activeElement = document.body;
  if (champ && champ.__modifie) {
    champ.__modifie = false;
    champ.dispatchEvent({ type: "change", target: champ });
  }
}

/** TAPER : le champ devient actif, sa valeur change, et son `blur()` fait ce que fait celui du navigateur. */
function taper(champ, texte) {
  champ.value = texte;
  champ.__modifie = true;
  document.activeElement = champ;
  champ.blur = () => { if (document.activeElement === champ) perdreLeFocus(); };
}

/** Rien d'armé, rien d'appuyé, aucun minuteur : chaque garde part d'un écran calme. */
function aucalme() {
  document.dispatchEvent({ type: "keydown", key: "Escape" });
  document.dispatchEvent(evenement("pointerup", document.body, "mouse"));
  horloge.ecouler();
  document.activeElement = document.body;
  document.elementFromPoint = () => null;
}

/** LA COQUILLE DU BANC — ce que `shell.mjs` fait d'Identity, en quelques lignes : l'état, `rename` et `describe`,
 *  et un `refresh()` qui passe par `avantLeRepeint` AVANT de remplacer l'écran puis appelle `apres()` — les deux
 *  gestes du lot 361, dans l'ordre de la vraie. */
function coquille({ avecDone = false } = {}) {
  aucalme();
  document.body.replaceChildren();              // ⛔ l'écran d'un garde précédent serait un faux jumeau
  const racine = document.createElement("div");
  document.body.append(racine);
  const etat = {
    doc: {
      schema: "fh-char/1", id: "lot-361", name: "Sonde", lang: "en", units: { distance: "ft", weight: "lb" },
      created: "2026-09-29T00:00:00Z", modified: "2026-09-29T00:00:00Z",
      build: { layers: [], choices: [], budgets: {}, overrides: [] }
    },
    actions: []
  };
  const onAction = (a) => {
    etat.actions.push(a);
    if (a.kind === "rename") etat.doc = { ...etat.doc, name: a.name };
    if (a.kind === "describe") etat.doc = { ...etat.doc, [a.field]: a.value };
    refresh();
  };
  function refresh() {
    const apres = avantLeRepeint(refresh);
    if (!apres) return;
    const ecran = [renderConceptStep({ document: etat.doc, fieldErrors: {} }, onAction)];
    if (avecDone) {
      const done = document.createElement("button");
      done.className = "sortie-done";
      done.addEventListener("click", () => etat.actions.push({ kind: "done" }));
      ecran.push(done);
    }
    swapContent(racine, ecran);
    apres();
    livrerLesMutations();
  }
  refresh();
  return {
    etat,
    nom: () => racine.querySelectorAll(".doc-field-input")[0],
    jeton: (mot) => racine.querySelectorAll(".glisse-jeton").find((j) => j.dataset.valeur === mot),
    genre: () => racine.querySelectorAll(".glisse-creneau").find((c) => c.dataset.creneau === "concept-gender"),
    done: () => racine.querySelectorAll(".sortie-done")[0]
  };
}

/* ══ ① ③ — IDENTITY, LE PREMIER GESTE APRÈS LA FRAPPE ═════════════════════════════════════════════════════ */

test("1 — ⭐ LE GARDE DU MANDAT : Name a le focus → armer (clic) → poser (clic) → le jeton est POSÉ, du premier coup", () => {
  const b = coquille();
  taper(b.nom(), "Essai");
  const woman = b.jeton("Woman");
  presser(woman, "mouse");
  perdreLeFocus();                    // l'action par défaut du `mousedown` : `change` → `rename`, PENDANT l'appui
  relacher(woman, "mouse");           // l'organe arme ; la fin de la tâche repeint
  const neuf = b.jeton("Woman");
  assert.notEqual(neuf, woman, "le repeint a remplacé le jeton — sans quoi ce garde ne prouverait rien");
  assert.equal(neuf.dataset.deplacement, "arme",
    "⛔ repeint, l'objet armé s'est éteint : l'armement tenait un nœud, pas son objet");
  assert.equal(b.genre().dataset.destination, "oui", "⛔ sa destination ne s'allume plus après le repeint");
  const genre = b.genre();
  presser(genre, "mouse");
  relacher(genre, "mouse");
  assert.equal(b.etat.doc.gender, "Woman", "⛔ LE PREMIER « ARMER PUIS POSER » EST AVALÉ (chaîne ①)");
  assert.equal(b.etat.doc.name, "Essai", "et le nom tapé est enregistré");
});

test("2 — AU DOIGT : l'appui long arme Woman ; le `mousedown` qu'iOS synthétise 1,2 s plus tard repeint — le liseré reste, et le tap sur Gender pose", () => {
  const b = coquille();
  taper(b.nom(), "Essai");
  const woman = b.jeton("Woman");
  presser(woman, "touch");
  horloge.ecouler();                  // l'appui long a tenu : l'objet s'arme
  relacher(woman, "touch");
  assert.equal(woman.dataset.deplacement, "arme", "l'appui long arme (la grammaire, inchangée)");
  /* le tap qu'iOS synthétise après l'appui long : `mousedown`, perte du focus, `mouseup` — sans `click` */
  document.dispatchEvent(evenement("mousedown", woman, "mouse"));
  perdreLeFocus();
  document.dispatchEvent(evenement("mouseup", woman, "mouse"));
  horloge.ecouler();
  const neuf = b.jeton("Woman");
  assert.notEqual(neuf, woman, "le repeint a remplacé le jeton armé — sans quoi ce garde ne prouverait rien");
  assert.equal(neuf.dataset.deplacement, "arme", "⛔ le liseré s'est éteint sous l'œil : l'objet armé n'a pas suivi");
  assert.equal(neuf.dataset.flash, undefined, "⛔ suivre son objet n'est pas une activation : aucun flash");
  const genre = b.genre();
  assert.equal(genre.dataset.destination, "oui");
  presser(genre, "touch");
  relacher(genre, "touch");
  assert.equal(b.etat.doc.gender, "Woman", "⛔ le tap sur Gender n'a pas posé (chaîne ③)");
});

test("2 bis — hors navigateur (sans `MutationObserver`), l'APPUI SUIVANT fait la même reprise : le tap pose quand même", () => {
  const avant = globalThis.MutationObserver;
  globalThis.MutationObserver = undefined;
  try {
    const b = coquille();
    taper(b.nom(), "Essai");
    const woman = b.jeton("Woman");
    presser(woman, "touch");
    horloge.ecouler();
    relacher(woman, "touch");
    document.dispatchEvent(evenement("mousedown", woman, "mouse"));
    perdreLeFocus();
    document.dispatchEvent(evenement("mouseup", woman, "mouse"));
    horloge.ecouler();
    assert.equal(woman.isConnected, false, "le jeton armé a bien été remplacé");
    const genre = b.genre();
    presser(genre, "touch");
    relacher(genre, "touch");
    assert.equal(b.etat.doc.gender, "Woman", "⛔ sans veilleur, l'appui suivant n'a pas repris l'objet armé");
  } finally {
    globalThis.MutationObserver = avant;
  }
});

/* ══ ② — LE BOUTON PRESSÉ PENDANT L'ENREGISTREMENT ══════════════════════════════════════════════════════════ */

test("3 — ⭐ UN BOUTON PRESSÉ PENDANT QUE NAME S'ENREGISTRE REÇOIT SON CLIC : le repeint attend la fin du clic", () => {
  const b = coquille({ avecDone: true });
  taper(b.nom(), "X");
  const done = b.done();
  presser(done, "mouse");
  perdreLeFocus();                    // `change` → `rename` → `refresh()` : demandé PENDANT l'appui
  const pendant = b.done();
  relacher(done, "mouse");
  assert.equal(pendant, done, "⛔ le repeint est passé PENDANT l'appui : le bouton pressé a été remplacé (chaîne ②)");
  assert.ok(b.etat.actions.some((a) => a.kind === "done"), "⛔ Done n'a pas reçu son clic");
  assert.equal(b.etat.doc.name, "X", "l'état, lui, s'écrit tout de suite");
  assert.notEqual(b.done(), done, "⭐ et le repeint retenu est bien passé — APRÈS le clic");
});

/* ══ ④ — LE TEXTE EN COURS ═════════════════════════════════════════════════════════════════════════════════ */

test("4 — ⭐ LE GARDE DU TEXTE : champ actif, texte tapé, un repeint sans `change` → le texte survit, enregistré", () => {
  const b = coquille();
  taper(b.nom(), "Glisse");
  const woman = b.jeton("Woman");
  const genre = b.genre();
  document.elementFromPoint = () => genre;
  presser(woman, "touch");            // au doigt, un glisser ne prend pas le focus : Name reste actif
  document.dispatchEvent({ ...evenement("pointermove", woman, "touch"), clientX: 40 });
  relacher(woman, "touch");           // la pose repeint — aucun `change` n'est parti
  assert.equal(b.etat.doc.gender, "Woman", "le glisser pose (il posait déjà)");
  assert.equal(b.etat.doc.name, "Glisse", "⛔ LE TEXTE TAPÉ EST MORT AVEC SON CHAMP : le repeint ne l'a pas fait enregistrer (chaîne ④)");
  assert.equal(b.nom().value, "Glisse", "et le champ repeint le montre");
});

test("5 — un champ qui n'écrit NULLE PART (la monnaie qu'on ajoute, la recherche) retrouve son texte, repeint — ⛔ jamais chez un homonyme", () => {
  aucalme();
  document.body.replaceChildren();
  const racine = document.createElement("div");
  document.body.append(racine);
  let homonymes = 1;
  const relus = [];
  function refresh() {
    const apres = avantLeRepeint(refresh);
    if (!apres) return;
    const champs = [];
    for (let i = 0; i < homonymes; i += 1) {
      const c = document.createElement("input");
      c.type = "text";
      c.setAttribute("aria-label", "How many gp to add or remove");
      c.addEventListener("input", () => relus.push(c.value));
      champs.push(c);
    }
    swapContent(racine, champs);
    apres();
  }
  refresh();
  const champ = racine.querySelectorAll("input")[0];
  taper(champ, "50");
  refresh();                          // un repeint venu d'ailleurs (la pose d'un glisser)
  const neuf = racine.querySelectorAll("input")[0];
  assert.notEqual(neuf, champ, "le champ a été remplacé");
  assert.equal(neuf.value, "50", "⛔ le texte d'un champ sans enregistrement est mort avec son nœud");
  assert.deepEqual(relus, ["50"], "⭐ et le champ qui suit la frappe l'a relu, comme si on venait de le taper");
  taper(neuf, "70");
  homonymes = 2;
  refresh();
  /* (un champ neuf du stub n'a pas de valeur : `undefined` là où le navigateur dirait "") */
  assert.deepEqual(racine.querySelectorAll("input").map((c) => c.value || ""), ["", ""],
    "⛔ deux champs du même nom : on ne devine pas lequel était le sien");
});

test("6 — ⚔️ un relâché MANQUÉ ne gèle pas l'écran ; ⛔ ni un sélecteur ni le clic droit n'arment la retenue", () => {
  aucalme();
  let repeints = 0;
  function refresh() { const apres = avantLeRepeint(refresh); if (!apres) return; repeints += 1; apres(); }
  document.dispatchEvent(evenement("pointerdown", document.body, "mouse"));
  refresh();
  assert.equal(repeints, 0, "pendant l'appui, le repeint est retenu");
  document.dispatchEvent({ ...evenement("pointermove", document.body, "mouse"), buttons: 0 });
  horloge.ecouler();
  assert.equal(repeints, 1, "⛔ le pointeur bouge sans bouton : l'appui est fini, le repeint retenu doit passer");
  const select = document.createElement("select");
  const option = document.createElement("option");
  select.append(option);
  document.body.append(select);
  document.dispatchEvent(evenement("pointerdown", option, "mouse"));
  refresh();
  assert.equal(repeints, 2, "⛔ un sélecteur ouvre sa liste hors de la page : son appui ne retient rien");
  document.dispatchEvent({ ...evenement("pointerdown", document.body, "mouse"), button: 2 });
  refresh();
  assert.equal(repeints, 3, "⛔ le clic droit VOIT, et sur Mac sa fiche s'ouvre à l'appui : il ne retient rien");
  aucalme();
});

/* ══ B — L'ORGANE : L'OBJET ARMÉ SUIT SON OBJET ════════════════════════════════════════════════════════════ */

/** Un écran d'organe nu : un vivier (jetons) et un créneau libre, repeint à volonté. */
function ecranNu({ cles }) {
  aucalme();
  document.body.replaceChildren();
  const bloc = document.createElement("div");
  document.body.append(bloc);
  const poses = [];
  function peindre(neuves = cles, { eteints = [] } = {}) {
    const jetons = neuves.map((cle, i) => {
      const j = document.createElement("button");
      j.dataset.valeur = `j${i}`;
      j.disabled = eteints.includes(i);
      armerJeton(j, { grammaire: true, portee: bloc, cle, onTap: () => {}, onDepot: (c) => poses.push(`j${i}→${c}`) });
      return j;
    });
    const creneau = document.createElement("button");
    creneau.dataset.creneau = "libre";
    swapContent(bloc, [...jetons, creneau]);
    livrerLesMutations();
  }
  peindre();
  return { poses, peindre, jetons: () => bloc.querySelectorAll("[data-valeur]"), creneau: () => bloc.querySelectorAll("[data-creneau]")[0] };
}

test("7 — un repeint PENDANT l'appui : c'est le JUMEAU qui s'arme, pas le nœud détaché", () => {
  const e = ecranNu({ cles: ["objet:1"] });
  const presse = e.jetons()[0];
  presser(presse, "mouse");
  e.peindre();                        // un repeint qui ne passe pas par la retenue (un repeint local de l'écran)
  relacher(presse, "mouse");
  assert.equal(presse.dataset.deplacement, undefined, "⛔ l'organe a armé le nœud DÉTACHÉ");
  assert.equal(e.jetons()[0].dataset.deplacement, "arme", "⛔ le jumeau vivant n'est pas armé");
  presser(e.creneau(), "mouse");
  relacher(e.creneau(), "mouse");
  assert.deepEqual(e.poses, ["j0→libre"]);
});

test("8 — ⛔ deux jumeaux, aucun, ou un jumeau éteint : on ne choisit pas, on désarme ; ⛔ sans `cle`, un objet repeint se désarme comme avant", () => {
  const e = ecranNu({ cles: ["objet:1"] });
  const a = e.jetons()[0];
  presser(a, "mouse");
  relacher(a, "mouse");
  assert.equal(a.dataset.deplacement, "arme");
  e.peindre(["objet:1", "objet:1"]);  // le repeint en montre DEUX
  assert.ok(e.jetons().every((j) => j.dataset.deplacement === undefined), "⛔ un homonyme a hérité de l'armement");
  presser(e.creneau(), "mouse");
  relacher(e.creneau(), "mouse");
  assert.deepEqual(e.poses, [], "⛔ deux jumeaux : l'organe en a choisi un");
  const f = ecranNu({ cles: ["objet:1"] });
  presser(f.jetons()[0], "mouse");
  relacher(f.jetons()[0], "mouse");
  f.peindre(["objet:2"]);             // le repeint ne le montre plus
  assert.equal(f.jetons()[0].dataset.deplacement, undefined, "⛔ un autre objet a hérité de l'armement");
  const g = ecranNu({ cles: ["objet:1"] });
  presser(g.jetons()[0], "mouse");
  relacher(g.jetons()[0], "mouse");
  g.peindre(["objet:1"], { eteints: [0] });   // le repeint le montre ÉTEINT : il est posé ailleurs
  assert.equal(g.jetons()[0].dataset.deplacement, undefined, "⛔ un jumeau éteint a hérité de l'armement");
  const sans = ecranNu({ cles: [undefined] });
  const s = sans.jetons()[0];
  presser(s, "mouse");
  relacher(s, "mouse");
  assert.equal(s.dataset.deplacement, "arme");
  sans.peindre();
  assert.equal(sans.jetons()[0].dataset.deplacement, undefined, "⛔ sans clé déclarée, rien ne dit qui est le jumeau");
  presser(sans.creneau(), "mouse");
  relacher(sans.creneau(), "mouse");
  assert.deepEqual(sans.poses, [], "⛔ un objet sans clé, repeint, a été posé : l'organe a deviné");
});

/* ══ C — LE CÂBLAGE ═════════════════════════════════════════════════════════════════════════════════════════ */

test("9 — `refresh()` passe par `avantLeRepeint` juste après `memoriser()`, et finit par `apres()`", () => {
  const src = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  assert.match(src, /import \{ avantLeRepeint, champDeTexteActif \} from "\.\/repeint\.mjs\?v=\d+";/);
  const debut = src.indexOf("function refresh() {");
  const fin = src.indexOf("\nfunction peindreLePassif");
  assert.ok(debut > 0 && fin > debut, "refresh() et son voisin se trouvent");
  const corps = src.slice(debut, fin).trim();
  assert.match(corps, /^function refresh\(\) \{\s*memoriser\(\);\s*const apres = avantLeRepeint\(refresh\);\s*if \(!apres\) return;\s*reglerLaVue\(\);/,
    "⛔ le repeint ne passe plus par sa retenue, ou pas au bon endroit (après `memoriser`, avant de peindre)");
  assert.match(corps, /peindreLePassif\(\);\s*apres\(\);\s*\}$/, "⛔ le texte gardé ne revient plus : `apres()` doit finir `refresh()`");
});

test("10 — chaque organe armé déclare sa `cle` — ⛔ sauf le dé d'Abilities, nommé", () => {
  /* ⛔ UNE EXCEPTION, NOMMÉE AVEC SA RAISON : `abilities-step.mjs` est le fichier du lot 362 (en cours le 29/09),
     et sa page n'a aucun champ de texte — rien n'y repeint un dé armé. ⭐ Qui armera un organe neuf demain devra
     déclarer sa clé, ou venir s'inscrire ici. */
  const EXCEPTIONS = new Map([["abilities-step.mjs", "lot 362 ; aucun champ de texte sur sa page"]]);
  const sans = [];
  let appels = 0;
  for (const f of fs.readdirSync(UI).filter((n) => n.endsWith(".mjs"))) {
    const src = stripComments(fs.readFileSync(path.join(UI, f), "utf8"));
    for (let i = src.indexOf("armerJeton("); i >= 0; i = src.indexOf("armerJeton(", i + 1)) {
      if (/function\s+$/.test(src.slice(Math.max(0, i - 12), i))) continue;   // la définition
      let prof = 0, j = i + "armerJeton".length;
      for (; j < src.length; j += 1) {
        if (src[j] === "(") prof += 1;
        else if (src[j] === ")") { prof -= 1; if (prof === 0) break; }
      }
      appels += 1;
      if (!/\bcle\s*:/.test(src.slice(i, j)) && !EXCEPTIONS.has(f)) sans.push(`${f} @${src.slice(0, i).split("\n").length}`);
    }
  }
  assert.ok(appels >= 10, `les appels d'organe se trouvent (${appels})`);
  assert.deepEqual(sans, [], "⛔ un organe armé sans `cle` : repeint, son objet armé s'éteindrait");
});

test("11 — ⭐ LA SAUVEGARDE AUTOMATIQUE (lot 374) NE REPEINT PAS SOUS LA FRAPPE : son repeint attend que le champ perde le focus", async () => {
  /* ⚖️ ARCHI 35, 30/09 : « vérifie qu'elle ne provoque aucun repeint pendant qu'on tape le nom ». Mesuré au code :
     `memoriser()` programme l'envoi (800 ms) à chaque modification, et `envoyerEtDire()` repeint quand l'ÉTAT de l'envoi
     change (refus, conflit, reprise). Tombé sous la frappe, ce repeint enregistrait le texte mais ôtait le focus : le
     clavier se fermait au milieu d'un mot. ⭐ On rejoue ICI le vrai corps de la fonction, lu dans `shell.mjs`. */
  const src = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  /* 🔄 LOT 377 — le repeint sans geste vit dans `direSiLeMenuChange`, partagé avec le courrier de Dropbox :
     on rejoue les DEUX vrais corps. */
  const m = src.match(/async function envoyerEtDire\(\{ urgent = false \} = \{\}\) \{([\s\S]*?)\n\}/);
  assert.ok(m, "`envoyerEtDire` se trouve dans shell.mjs");
  const dire = src.match(/function direSiLeMenuChange\(avant\) \{[\s\S]*?\n\}/);
  assert.ok(dire, "`direSiLeMenuChange` se trouve dans shell.mjs");
  assert.match(src, /void courrier\.poster\(id, \{ urgent \}\)\.then\(direSiLeMenuChange\(state\.envoi\.etat\)\);/,
    "⛔ le courrier de Dropbox repeint par le MÊME chemin — jamais sous la frappe");
  const fabriquer = new Function("state", "envoyerALApp", "refresh", "champDeTexteActif",
    `${dire[0]}\nreturn async function envoyerEtDire({ urgent = false } = {}) {${m[1]}};`);
  const essai = async (champ, etatApres) => {
    const state = { envoi: { etat: "a-jour" } };
    let repeints = 0;
    const ecoute = {};
    const actif = champ ? { addEventListener: (t, fn) => { ecoute[t] = fn; } } : null;
    const f = fabriquer(state, async () => { state.envoi = { etat: etatApres }; }, () => { repeints += 1; }, () => actif);
    await f();
    const avantBlur = repeints;
    if (ecoute.blur) ecoute.blur();
    return { avantBlur, apresBlur: repeints };
  };
  assert.deepEqual(await essai(true, "refus"), { avantBlur: 0, apresBlur: 1 },
    "⛔ l'état de l'envoi a changé pendant la frappe : le repeint est passé SOUS le champ actif");
  assert.deepEqual(await essai(false, "refus"), { avantBlur: 1, apresBlur: 1 }, "sans champ actif, il repeint tout de suite");
  assert.deepEqual(await essai(true, "a-jour"), { avantBlur: 0, apresBlur: 0 }, "rien n'a changé : aucun repeint");
  /* et le témoin lit bien le champ où l'on tape — ⛔ pas une case, pas le corps de la page */
  aucalme();
  const champ = document.createElement("input");
  champ.type = "text";
  document.activeElement = champ;
  assert.equal(champDeTexteActif(), champ);
  const coche = document.createElement("input");
  coche.type = "checkbox";
  document.activeElement = coche;
  assert.equal(champDeTexteActif(), null);
  document.activeElement = document.body;
  assert.equal(champDeTexteActif(), null);
});
