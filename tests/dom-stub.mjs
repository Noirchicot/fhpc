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
    this.scrollTop = 0;
    this.scrollLeft = 0;
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
}

class FakeDocument {
  createElement(tag) { return new FakeElement(tag); }
  createTextNode(text) { return new FakeTextNode(text); }
}

/** Un `document` neuf, isolé par test — aucun état partagé entre deux appels. */
export function createTestDocument() {
  return new FakeDocument();
}
