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
  setAttribute(name, value) { this._attrs.set(name, String(value)); }
  getAttribute(name) { return this._attrs.has(name) ? this._attrs.get(name) : null; }
  hasAttribute(name) { return this._attrs.has(name); }
  removeAttribute(name) { this._attrs.delete(name); }
  set textContent(text) {
    this.childNodes = [];
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
     visible. `skills-step.mjs` l'appelle sans vérifier de retour. */
  scrollIntoView() {}
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
