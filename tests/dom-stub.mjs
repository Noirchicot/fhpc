/* ══ UN DOM MINIMAL, POUR TESTER UNE FONCTION QUI REND DES NŒUDS ═══════
   Loi §4 de la commande du lot 39 : « on teste la fonction, pas la page ».
   `renderSkillsStep` construit son arbre avec `document.createElement` —
   Node ne fournit AUCUN DOM, et la loi Q3 interdit d'en installer un
   (`jsdom`, `happy-dom`) comme paquet de plus. Ce fichier n'est pas un
   paquet : c'est le sous-ensemble de `Document`/`Element` dont
   `skills-step.mjs` a réellement besoin — `createElement`, `createTextNode`,
   `append`, `textContent`, `className`, `dataset`, `addEventListener` et un
   `querySelectorAll` minimal (balise, `.classe`, `[attr]`, `[attr="val"]`,
   combinateur descendant), rien de plus.

   ⚠️ CE N'EST PAS UN NAVIGATEUR. Aucune mise en page, aucun CSS, aucun
   `innerHTML`. `skills-step.mjs` n'en a besoin d'aucun — il compose son
   arbre avec `createElement`/`append`/`textContent`, jamais avec des
   chaînes HTML (contrairement à `shell.mjs`, qui n'est pas testé ici : la
   coquille reste hors du périmètre de ce lot, seule la fonction l'est). */

/* ══ LE `style` D'UN NŒUD — ajouté le 2026-08-15, et voici pourquoi ═══════
   ⛔ CE STUB N'AVAIT PAS DE `.style`, ET CETTE ABSENCE A LÉGIFÉRÉ. Le moteur
   de dés (`dice3d.mjs`, recopié de `fh-phb`) donne sa taille à chaque dé par
   `host.style.setProperty("--fh-static-die-size", …)` — une valeur CALCULÉE
   par dé, pas du décor. Sans `.style`, `createDieHost` jetait un `TypeError`,
   et le plateau d'Abilities en a tiré une règle : « les dés ne naissent que
   d'un GESTE, jamais au rendu ».

   🔴 CETTE RÈGLE N'EN ÉTAIT PAS UNE. C'était une limite du stub habillée en
   principe — le même genre de faute que l'exception « T3 ne passe pas »,
   bâtie sur une mesure prise au mauvais barreau. Mesuré : une fois `.style`
   présent, `createDieHost` ET `mount` passent, et `mount` DÉGRADE proprement
   sans navigateur (c'est son repli prévu quand WebGL manque).

   ⚠️ ET CE N'EST PAS UN PERMIS DE METTRE DU DÉCOR EN LIGNE. Mesuré le jour
   même : `dice3d.mjs` est le SEUL fichier de `ui/` qui écrive `.style`, les
   autres sont vierges. Un garde le fige (`tests/ui-jetons.test.mjs`) — le
   décor va dans la feuille, cette prothèse ne sert qu'au moteur recopié.

   📌 Elle reste MINIMALE et honnête : elle retient ce qu'on lui pose et rend
   ce qu'on lui demande. Elle ne calcule rien, n'hérite de rien, et ne
   prétend à aucune mise en page — comme le reste de ce fichier. */
class FakeStyle {
  constructor() { this._props = new Map(); }
  setProperty(nom, valeur) { this._props.set(String(nom), String(valeur)); }
  getPropertyValue(nom) { return this._props.get(String(nom)) || ""; }
  removeProperty(nom) { const v = this.getPropertyValue(nom); this._props.delete(String(nom)); return v; }
  get cssText() { return [...this._props].map(([k, v]) => `${k}: ${v}`).join("; "); }
  /* ⚠️ IL SE LIT ET IL S'ÉCRIT. Un `cssText` en lecture seule a fait tomber
     quinze tests d'un coup : le moteur recopié pose le repli de ses dés par
     `style.cssText = "…"`. Un stub qui n'offre qu'un accesseur n'est pas
     minimal, il est FAUX — et il ment dans le sens le plus coûteux, en
     jetant sur du code qui marche au navigateur. */
  set cssText(valeur) {
    this._props.clear();
    for (const paire of String(valeur).split(";")) {
      const i = paire.indexOf(":");
      if (i <= 0) continue;
      this._props.set(paire.slice(0, i).trim(), paire.slice(i + 1).trim());
    }
  }
}

class FakeNode {
  constructor() {
    this.parentNode = null;
    this.childNodes = [];
  }
  get children() {
    return this.childNodes.filter((node) => node.nodeType === 1);
  }
  append(...items) {
    for (const item of items) {
      const node = typeof item === "string" ? new FakeTextNode(item) : item;
      node.parentNode = this;
      this.childNodes.push(node);
    }
  }
  prepend(...items) {
    const nodes = items.map((item) => (typeof item === "string" ? new FakeTextNode(item) : item));
    for (const node of nodes) node.parentNode = this;
    this.childNodes = [...nodes, ...this.childNodes];
  }
  appendChild(node) {
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.childNodes = this.parentNode.childNodes.filter((node) => node !== this);
      this.parentNode = null;
    }
  }
}

class FakeTextNode extends FakeNode {
  constructor(text) {
    super();
    this.nodeType = 3;
    this.textContent = text;
  }
}

/* Sélecteur minimal : un ENCHAÎNEMENT `tag.class[attr=val]`, combiné par un
   espace (descendant) — assez pour un test, pas un moteur CSS. */
function matchesSimple(el, simple) {
  const attrRe = /\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/g;
  let rest = simple;
  const attrs = [];
  let match;
  while ((match = attrRe.exec(simple))) attrs.push(match);
  rest = rest.replace(attrRe, "");
  const classes = rest.match(/\.[a-zA-Z0-9_-]+/g) || [];
  rest = rest.replace(/\.[a-zA-Z0-9_-]+/g, "");
  const tag = rest.trim();
  if (tag && tag !== "*" && el.tagName !== tag.toUpperCase()) return false;
  for (const cls of classes) {
    const name = cls.slice(1);
    if (!(el.className || "").split(/\s+/).includes(name)) return false;
  }
  for (const [, attrName, attrValue] of attrs) {
    if (!el.hasAttribute(attrName)) return false;
    if (attrValue !== undefined && el.getAttribute(attrName) !== attrValue) return false;
  }
  return true;
}

function collectElements(root, out = []) {
  for (const child of root.childNodes) {
    if (child.nodeType === 1) {
      out.push(child);
      collectElements(child, out);
    }
  }
  return out;
}

class FakeElement extends FakeNode {
  constructor(tagName) {
    super();
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this._attrs = new Map();
    this._listeners = new Map();
    this.style = new FakeStyle();
    this.disabled = false;
    this.type = "";
    this.hidden = false;
    /* ══ LOT 58 — LE DÉFILEMENT, ET IL EST HONNÊTE ═══════════════════════
       ⛔ UN `scrollTop` QUI SE CONTENTERAIT DE PERSISTER RENDRAIT LE GARDE
       DU SOCLE CREUX : `swapContent` passerait sans rien faire, et un
       remplacement naïf passerait aussi. Ce stub reproduit donc ce que fait
       un VRAI navigateur, et c'est tout l'intérêt : vider les enfants d'un
       conteneur met sa hauteur à zéro, et la position de défilement est
       RABATTUE À 0 — voir `_clearChildren` plus bas.
       ⚠️ CE N'EST TOUJOURS PAS UNE MISE EN PAGE : il n'y a ni hauteur, ni
       rectangle, ni butée haute. Ce stub sait dire « la position a été
       perdue » ou « elle a été gardée », rien de plus — et c'est
       exactement la question que pose le §RENDU. */
    this._scrollTop = 0;
    this.scrollLeft = 0;
    /* ══ LOT 68 — LA GÉOMÉTRIE, ET ELLE EST OPTIONNELLE ═══════════════════
       `_geometrie` reste `null` tant qu'un test ne la POSE pas (voir
       `poserUneColonne` en bas de ce fichier). Tant qu'elle est nulle,
       `getBoundingClientRect` **jette** au lieu de rendre des zéros.
       ⛔ C'est délibéré : un rectangle de zéros laisserait un test du spy
       « passer » en mesurant du vide — exactement le genre de garde creux
       que ce dépôt a déjà payé deux fois (le `scroll-snap` mort sous 935
       verts, la virgule sous 993). Un test qui a besoin d'une mise en page
       doit la déclarer ; sinon il n'a rien à demander. */
    this._geometrie = null;
    const self = this;
    this.dataset = new Proxy({}, {
      get(_target, key) {
        const attr = "data-" + String(key).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
        return self._attrs.get(attr);
      },
      set(_target, key, value) {
        const attr = "data-" + String(key).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
        self._attrs.set(attr, String(value));
        return true;
      }
    });
  }
  /* ⚠️ LOT 68 — `scrollTop` ÉMET UN `scroll`, COMME UN VRAI NAVIGATEUR.
     C'est le trou qui a laissé le spy sans test : le stub POSAIT la valeur
     sans jamais prévenir personne, donc un écouteur `scroll` n'était appelé
     par aucune suite. `watchSnap` — dont l'invariant II.3 dit « le
     scrollspy EST le sélecteur » — n'avait donc AUCUN test, alors que son
     arithmétique (`nearestIndex`), elle, en a cinq. L'arithmétique était
     prouvée, le câblage qui la nourrit ne l'était pas. */
  get scrollTop() { return this._scrollTop; }
  set scrollTop(value) {
    const avant = this._scrollTop;
    this._scrollTop = value;
    if (value !== avant) this.dispatchEvent({ type: "scroll", target: this });
  }
  /** La mise en page, UNIQUEMENT si un test l'a déclarée (`poserUneColonne`).
   *  ⛔ Jette sinon — un rectangle de zéros ferait passer un test du spy en
   *  mesurant du vide. */
  getBoundingClientRect() {
    const g = this._geometrie;
    if (!g) {
      throw new Error("dom-stub : getBoundingClientRect() sans géométrie déclarée. " +
        "Ce stub ne fabrique pas de mise en page — appelle `poserUneColonne(scroller, …)` " +
        "dans le test, ou ne demande pas de rectangle.");
    }
    return { top: g.top(), height: g.height, bottom: g.top() + g.height, left: 0, right: 0, width: 0 };
  }
  /* ══ LOT 70 — LE CHAMP ET LE CONTENU, même loi que le rectangle ═════════
     `mountChevrons` (socle.mjs) lit `clientHeight` (la hauteur du champ) et
     `scrollHeight` (la hauteur du contenu) pour dire s'il RESTE quelque
     chose à défiler. Un zéro par défaut ferait dire « rien à défiler » à un
     test qui a oublié sa géométrie — le même garde creux que le rectangle
     de zéros, donc le même refus. `poserUneColonne` déclare les deux. */
  get clientHeight() {
    const g = this._geometrie;
    if (!g) {
      throw new Error("dom-stub : clientHeight sans géométrie déclarée. " +
        "Appelle `poserUneColonne(scroller, …)` dans le test.");
    }
    return g.height;
  }
  get scrollHeight() {
    const g = this._geometrie;
    if (!g) {
      throw new Error("dom-stub : scrollHeight sans géométrie déclarée. " +
        "Appelle `poserUneColonne(scroller, …)` dans le test.");
    }
    /* Un élément sans contenu déclaré a la hauteur de son champ — comme un
       vrai navigateur : scrollHeight ne descend jamais sous clientHeight. */
    return Math.max(g.height, g.contenu ?? 0);
  }
  get className() { return this._attrs.get("class") || ""; }
  set className(value) { this._attrs.set("class", value); }
  /* ⚠️ LOT 61 — `src` et `alt` sont des propriétés MIROIR dans un vrai DOM :
     écrire `img.src = …` pose l'attribut, et `getAttribute("src")` le relit.
     Le stub s'était contenté d'une propriété JS ordinaire, donc une image
     rendue par le code n'avait AUCUN attribut à inspecter — un test sur les
     images passait à côté de son sujet sans le dire. */
  get src() { return this._attrs.get("src") || ""; }
  set src(value) { this._attrs.set("src", String(value)); }
  get alt() { return this._attrs.get("alt") || ""; }
  set alt(value) { this._attrs.set("alt", String(value)); }
  setAttribute(name, value) { this._attrs.set(name, String(value)); }
  getAttribute(name) { return this._attrs.has(name) ? this._attrs.get(name) : null; }
  hasAttribute(name) { return this._attrs.has(name); }
  removeAttribute(name) { this._attrs.delete(name); }
  /** Vider un conteneur met sa hauteur à zéro : le navigateur RABAT la
   *  position de défilement, et ne la rend jamais. Les deux seuls chemins de
   *  vidage du stub passent par ici — sinon l'un des deux mentirait. */
  _clearChildren() {
    this.childNodes = [];
    this.scrollTop = 0;
    this.scrollLeft = 0;
  }
  replaceChildren(...items) {
    this._clearChildren();
    this.append(...items);
  }
  set textContent(text) {
    this._clearChildren();
    if (text !== "" && text !== undefined && text !== null) this.append(String(text));
  }
  get textContent() {
    return this.childNodes.map((node) => (node.nodeType === 3 ? node.textContent : node.textContent)).join("");
  }
  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(fn);
  }
  removeEventListener(type, fn) {
    if (this._listeners.has(type)) this._listeners.get(type).delete(fn);
  }
  dispatchEvent(event) {
    for (const fn of this._listeners.get(event.type) || []) fn(event);
    return true;
  }
  click() {
    if (this.disabled) return;
    this.dispatchEvent({ type: "click", target: this });
  }
  /* Sans mise en page, « faire défiler jusqu'à » n'a pas de sens géométrique
     — no-op délibéré, comme le ferait un navigateur pour un élément déjà
     visible.
     ⚠️ LOT 58 — `scrollIntoView` a disparu de `ui/` (un garde le prouve,
     `tests/socle.test.mjs` preuve D) ; ces trois-là restent parce que le
     socle les appelle, et parce qu'un stub qui ne les porte pas ferait
     jeter le code au lieu de le mesurer. `scrollTo`/`scrollBy` posent
     vraiment la valeur : c'est ce que `keepInView` écrit, et un no-op
     rendrait ses tests creux. */
  scrollIntoView() {}
  scrollTo(options) {
    if (!options) return;
    if (typeof options.top === "number") this.scrollTop = options.top;
    if (typeof options.left === "number") this.scrollLeft = options.left;
  }
  scrollBy(options) {
    if (!options) return;
    if (typeof options.top === "number") this.scrollTop += options.top;
    if (typeof options.left === "number") this.scrollLeft += options.left;
  }
  querySelectorAll(selector) {
    const pool = collectElements(this);
    const hasAncestorIn = (el, set) => {
      let node = el.parentNode;
      while (node) {
        if (set.includes(node)) return true;
        node = node.parentNode;
      }
      return false;
    };
    return selector.split(",").map((s) => s.trim()).flatMap((single) => {
      const parts = single.split(/\s+/).filter(Boolean);
      let matched = pool;
      parts.forEach((part, index) => {
        if (index === 0) {
          matched = pool.filter((el) => matchesSimple(el, part));
        } else {
          const ancestors = matched;
          matched = pool.filter((el) => matchesSimple(el, part) && hasAncestorIn(el, ancestors));
        }
      });
      return matched;
    }).filter((el, index, all) => all.indexOf(el) === index);
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
  /* ⭐ AJOUTÉ LE 2026-08-16 (lot 79) : le glisser-déposer remonte du nœud
     touché jusqu'au créneau qui le porte. Comme `elementFromPoint`, c'est une
     API que `ui/` emploie RÉELLEMENT — le stub ne grandit jamais d'avance. */
  closest(selector) {
    let node = this;
    while (node) {
      if (node.nodeType === 1 && matchesSimple(node, selector.trim())) return node;
      node = node.parentNode;
    }
    return null;
  }
}

class FakeDocument {
  /* ⭐ AJOUTÉ LE 2026-08-16 POUR LE LOT 80, même loi que `elementFromPoint`
     ci-dessous : le stub grandit avec ce que `ui/` emploie RÉELLEMENT.
     Le FANTÔME du glisser (le dé qui suit le doigt) est posé en coordonnées
     d'écran, donc à la racine de la page et non dans la scène — un fantôme
     dans le flux se ferait couper par le premier `overflow`. Sans `body`, la
     moitié « je vois ce que je déplace » du geste n'aurait aucun juge hors
     navigateur, et l'écran jetterait au premier `pointermove`. */
  constructor() { this.body = new FakeElement("body"); }
  createElement(tag) { return new FakeElement(tag); }
  /* ⭐ AJOUTÉ LE 2026-08-24 POUR B3 : la scène du dressing (`b3-scene.mjs`)
     est un SVG, et un SVG se crée avec `createElementNS`. Le stub ne
     distingue pas les espaces de noms — il n'en a pas besoin : les tests
     jugent l'ARBRE (classes, attributs, enfants), pas le rendu vectoriel. */
  createElementNS(_ns, tag) { return new FakeElement(tag); }
  /* ⭐ AJOUTÉ LE 2026-08-16 POUR LE LOT 79, et le stub grandit comme il a
     toujours grandi : avec ce que `ui/` emploie RÉELLEMENT, jamais d'avance.
     Le glisser-déposer cherche le créneau SOUS le pointeur ; sans point
     d'entrée ici, la moitié « dépôt » du geste n'aurait aucun juge hors
     navigateur. Par défaut il ne trouve rien — un test qui veut simuler une
     cible pose `document.elementFromPoint = () => noeud`. */
  elementFromPoint() { return null; }
  createTextNode(text) { return new FakeTextNode(text); }
}

/** Un `document` neuf, isolé par test — aucun état partagé entre deux appels. */
export function createTestDocument() {
  return new FakeDocument();
}

/* ══ LOT 68 — UNE COLONNE, ET RIEN DE PLUS ═══════════════════════════════
   Le seul modèle de mise en page que ce stub accepte, et c'est exactement
   celui du catalogue : des enfants de hauteur égale empilés dans un
   conteneur qui défile. La formule est celle d'un vrai navigateur pour une
   colonne simple — le haut d'un enfant, c'est le haut du champ, moins ce
   qu'on a défilé, plus ce qui le précède :

       enfant[i].top = champ.top − scrollTop + i × hauteur

   ⛔ CE QU'IL NE MODÉLISE PAS, ET QU'IL NE FAUT PAS LUI FAIRE DIRE :
   marges, `scroll-snap`, hauteurs inégales, `position: sticky`, transformées.
   Un test qui aurait besoin de l'un de ceux-là ment s'il utilise ce
   helper — il lui faut un vrai navigateur. Le spy, lui, ne lit QUE des
   `top`, donc une colonne suffit à l'exercer honnêtement. */
export function poserUneColonne(scroller, { top = 0, hauteurDuChamp = 800, hauteurDesEnfants = 800 } = {}) {
  const enfants = scroller.childNodes.filter((n) => n.nodeType === 1);
  /* LOT 70 — la colonne déclare aussi sa hauteur de CONTENU : c'est elle
     que `scrollHeight` rend, et c'est la différence contenu − champ (le
     « mou ») que `mountChevrons` mesure. Une colonne vide n'a que son
     champ : rien à défiler, et il faut pouvoir le dire honnêtement. */
  scroller._geometrie = {
    top: () => top,
    height: hauteurDuChamp,
    contenu: enfants.length * hauteurDesEnfants
  };
  enfants.forEach((enfant, i) => {
    enfant._geometrie = { top: () => top - scroller.scrollTop + i * hauteurDesEnfants, height: hauteurDesEnfants };
  });
  return enfants;
}
