/* ══ UNE FAUSSE INDEXEDDB — lot 388 ═════════════════════════════════════════════════════════════
   ⭐ EXACTEMENT LA SURFACE QUE `baseIndexedDb` (magasin.mjs) APPELLE, et les règles de la spécification
   (W3C IndexedDB 3.0) dont dépend une MONTÉE DE VERSION — rien de plus :
     · une base TIENT ses rayons et ses valeurs d'une ouverture à l'autre (c'est l'iPad d'Eric) ;
     · `open(nom, v)` plus haut que la version tenue → `upgradeneeded`, dans une transaction
       `versionchange` ; ⚖️ une exception dans `onupgradeneeded` ANNULE la montée — la base reste telle
       qu'elle était, version comprise, et l'ouverture échoue (`AbortError`) ;
     · `createObjectStore` d'un rayon qui existe → `ConstraintError` ; `deleteObjectStore` d'un absent →
       `NotFoundError` ; hors montée, les deux → `InvalidStateError` ;
     · `open` plus BAS que la version tenue → `VersionError` ;
     · `transaction` sur un rayon absent → `NotFoundError` ; écrire en `readonly` → `ReadOnlyError` ;
     · les valeurs passent par le CLONAGE STRUCTURÉ, à l'écriture comme à la lecture ; `getAll` et
       `getAllKeys` rendent l'ordre des clefs (chaînes : par unités UTF-16).
   📏 Ces règles ont été relevées au NAVIGATEUR RÉEL le 30/09 (Chrome du panneau, v938, port 8979) :
   voir `tests/base-v3-388.test.mjs`, B0. Un faux plus indulgent que le vrai ferait passer au vert ce
   qui perdrait Ilyra chez Eric.
   ⭐ Il note chaque montée (`montees`) : une réouverture sans montée se prouve. */

const erreur = (nom, message) => { const e = new Error(message); e.name = nom; return e; };
const plusTard = (f) => setTimeout(f, 0);

export function fausseIndexedDb() {
  const bases = new Map();                    // nom → { version, rayons: Map<nom, Map<clef, valeur>> }
  const montees = [];

  function magasin(valeurs, mode) {
    const requete = (faire) => {
      const r = { result: undefined, error: null, onsuccess: null, onerror: null };
      plusTard(() => {
        try { r.result = faire(); if (r.onsuccess) r.onsuccess({ target: r }); }
        catch (e) { r.error = e; if (r.onerror) r.onerror({ target: r }); }
      });
      return r;
    };
    const ecrire = () => { if (mode === "readonly") throw erreur("ReadOnlyError", "the transaction is read-only"); };
    const ordre = () => [...valeurs.keys()].sort();
    return {
      get: (clef) => requete(() => (valeurs.has(clef) ? structuredClone(valeurs.get(clef)) : undefined)),
      put: (valeur, clef) => { ecrire(); const copie = structuredClone(valeur); return requete(() => { valeurs.set(clef, copie); return clef; }); },
      delete: (clef) => { ecrire(); return requete(() => { valeurs.delete(clef); }); },
      clear: () => { ecrire(); return requete(() => { valeurs.clear(); }); },
      getAll: () => requete(() => ordre().map((k) => structuredClone(valeurs.get(k)))),
      getAllKeys: () => requete(() => ordre())
    };
  }

  function connexion(etat, { montee = false } = {}) {
    return {
      get version() { return etat.version; },
      get objectStoreNames() {
        const noms = [...etat.rayons.keys()].sort();
        return { length: noms.length, item: (i) => noms[i] ?? null, contains: (n) => etat.rayons.has(n) };
      },
      createObjectStore(nom) {
        if (!montee) throw erreur("InvalidStateError", "not in a versionchange transaction");
        if (etat.rayons.has(nom)) throw erreur("ConstraintError", `an object store named "${nom}" already exists`);
        etat.rayons.set(nom, new Map());
        return magasin(etat.rayons.get(nom), "versionchange");
      },
      deleteObjectStore(nom) {
        if (!montee) throw erreur("InvalidStateError", "not in a versionchange transaction");
        if (!etat.rayons.has(nom)) throw erreur("NotFoundError", `no object store named "${nom}"`);
        etat.rayons.delete(nom);
      },
      transaction(noms, mode = "readonly") {
        const liste = [].concat(noms);
        for (const n of liste) if (!etat.rayons.has(n)) throw erreur("NotFoundError", `no object store named "${n}"`);
        return {
          objectStore(n) {
            if (!liste.includes(n)) throw erreur("NotFoundError", `"${n}" is not in this transaction`);
            return magasin(etat.rayons.get(n), mode);
          }
        };
      },
      close() {}
    };
  }

  return {
    bases, montees,
    open(nom, version) {
      const r = { result: undefined, error: null, transaction: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
      plusTard(() => {
        const tenue = bases.get(nom) || { version: 0, rayons: new Map() };
        const voulue = version === undefined ? Math.max(1, tenue.version) : version;
        if (voulue < tenue.version) {
          r.error = erreur("VersionError", `the requested version (${voulue}) is less than the existing version (${tenue.version})`);
          if (r.onerror) r.onerror({ target: r });
          return;
        }
        if (voulue > tenue.version) {
          /* la transaction `versionchange` travaille sur une COPIE : si elle échoue, la base tenue ne bouge pas */
          const copie = { version: voulue, rayons: new Map([...tenue.rayons].map(([n, m]) => [n, new Map(m)])) };
          r.result = connexion(copie, { montee: true });
          r.transaction = { objectStore: (n) => {
            if (!copie.rayons.has(n)) throw erreur("NotFoundError", `no object store named "${n}"`);
            return magasin(copie.rayons.get(n), "versionchange");
          } };
          montees.push({ nom, de: tenue.version, a: voulue });
          try { if (r.onupgradeneeded) r.onupgradeneeded({ target: r, oldVersion: tenue.version, newVersion: voulue }); }
          catch (_) {
            r.result = undefined;
            r.error = erreur("AbortError", "the version change transaction was aborted");
            if (r.onerror) r.onerror({ target: r });
            return;
          }
          /* les écritures faites pendant la montée sont des requêtes : on les laisse finir avant de valider */
          plusTard(() => {
            bases.set(nom, copie);
            r.result = connexion(copie);
            r.transaction = null;
            if (r.onsuccess) r.onsuccess({ target: r });
          });
          return;
        }
        r.result = connexion(tenue);
        if (r.onsuccess) r.onsuccess({ target: r });
      });
      return r;
    }
  };
}
