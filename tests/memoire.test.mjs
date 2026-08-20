/* ══ LA MÉMOIRE DU NAVIGATEUR — `ui/builder/memoire.mjs` ══════════════════
   2026-08-20. Eric : *« Un perso est enregistré dans le navigateur de tout le
   monde, et disparaît s'il n'est pas enregistré s'il y a un reset. »*

   ⭐ TESTÉ SANS NAVIGATEUR, ET C'EST LA RAISON D'ÊTRE DU MAGASIN INJECTABLE.
   `window.localStorage` n'existe ni dans `node:test` ni dans le `dom-stub` ;
   le passer en argument permet d'éprouver la moitié qui compte vraiment — ce
   que le module fait quand le magasin REFUSE (mode privé, quota plein) — et
   qu'aucun test ne pourrait atteindre autrement.

   🔴 LE CONTRAT QUE CETTE SUITE FIGE, parce qu'il s'est décidé en l'écrivant :
   `refus` veut dire UNE seule chose — « il y avait un personnage et il est
   inutilisable ». Un magasin absent ou illisible rend `vide`, pas `refus` :
   ce n'est pas une perte, c'est « rien à reprendre », et la panne de magasin
   est rapportée par l'ÉCRITURE, une fois, là où le joueur peut agir. */

import test from "node:test";
import assert from "node:assert/strict";

const { lirePersonnage, ecrirePersonnage, oublierPersonnage, CLEF_PERSONNAGE } =
  await import("../ui/builder/memoire.mjs");

/** Un magasin de test : la seule surface que `memoire.mjs` emploie. */
function magasin(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => { data.delete(k); },
    _data: data
  };
}

/* ── CE QUI MARCHE ──────────────────────────────────────────────────────── */

test("rien de gardé → `vide`, et surtout pas une erreur", () => {
  assert.deepEqual(lirePersonnage(magasin()), { etat: "vide" });
});

test("l'aller-retour rend le MÊME personnage", () => {
  const store = magasin();
  const perso = { schema: "fh-char/1", name: "Yedrivel", build: { choices: [{ path: "class" }] } };
  assert.deepEqual(ecrirePersonnage(JSON.stringify(perso), store), { ok: true });
  const relu = lirePersonnage(store);
  assert.equal(relu.etat, "lu");
  assert.deepEqual(relu.document, perso);
});

test("⭐ UN SEUL PERSONNAGE — écrire une seconde fois remplace le premier", () => {
  /* C'est la règle d'Eric en un mot (« un perso »), et elle doit être un FAIT
     du module, pas une intention : deux clefs qui s'accumuleraient rempliraient
     le magasin sans que personne le voie. */
  const store = magasin();
  ecrirePersonnage(JSON.stringify({ name: "A" }), store);
  ecrirePersonnage(JSON.stringify({ name: "B" }), store);
  assert.equal(store._data.size, 1, "une seule clef occupée");
  assert.equal(lirePersonnage(store).document.name, "B");
});

test("oublier rend le magasin vide", () => {
  const store = magasin();
  ecrirePersonnage(JSON.stringify({ name: "A" }), store);
  assert.deepEqual(oublierPersonnage(store), { ok: true });
  assert.deepEqual(lirePersonnage(store), { etat: "vide" });
});

test("la clef est celle qu'on annonce — un magasin partagé se relit à la main", () => {
  const store = magasin();
  ecrirePersonnage("{\"name\":\"A\"}", store);
  assert.equal(store.getItem(CLEF_PERSONNAGE), "{\"name\":\"A\"}");
});

/* ── CE QUI CASSE, ET COMMENT ON LE DIT ─────────────────────────────────── */

test("🔴 un texte illisible est un REFUS NOMMÉ, jamais un `vide` silencieux", () => {
  /* Retomber sur l'exemple sans rien dire ferait croire au joueur que son
     personnage n'a jamais existé — le repli silencieux que la loi §0.5
     interdit. */
  const store = magasin({ [CLEF_PERSONNAGE]: "{ceci n'est pas du JSON" });
  const lu = lirePersonnage(store);
  assert.equal(lu.etat, "refus");
  assert.match(lu.raison, /could not be read/);
});

test("un JSON valide qui n'est pas un objet est refusé aussi", () => {
  /* `JSON.parse("3")` rend un nombre : le passer au moteur donnerait une
     erreur illisible, très loin de sa cause. */
  for (const octets of ["3", "\"Yedrivel\"", "[]", "null"]) {
    const lu = lirePersonnage(magasin({ [CLEF_PERSONNAGE]: octets }));
    assert.equal(lu.etat, "refus", `refusé : ${octets}`);
  }
});

test("⚔️ AUCUN MAGASIN → `vide`, PAS `refus` — c'est le contrat", () => {
  /* Sans argument et sans `window`, on est exactement dans le cas du mode
     privé le plus dur. Ce n'est pas une perte : il n'y avait rien. */
  assert.deepEqual(lirePersonnage(), { etat: "vide" });
});

test("⚔️ un magasin dont la LECTURE jette rend `vide` — la panne se dit à l'écriture", () => {
  const store = {
    getItem() { throw new Error("SecurityError"); },
    setItem() { throw new Error("SecurityError"); },
    removeItem() {}
  };
  assert.deepEqual(lirePersonnage(store), { etat: "vide" });
  const ecrit = ecrirePersonnage("{}", store);
  assert.equal(ecrit.ok, false);
  assert.equal(ecrit.raison, "SecurityError", "le mot du navigateur, pas une prose inventée");
});

test("🔴 une écriture qui échoue le DIT — un builder qui ne sauvegarde plus en silence est le pire cas", () => {
  const plein = {
    getItem: () => null,
    setItem() { const e = new Error("QuotaExceededError"); throw e; },
    removeItem() {}
  };
  assert.deepEqual(ecrirePersonnage("{}", plein), { ok: false, raison: "QuotaExceededError" });
});

test("une erreur sans message garde quand même une raison lisible", () => {
  const muet = { getItem: () => null, setItem() { throw new Error(""); }, removeItem() {} };
  const issue = ecrirePersonnage("{}", muet);
  assert.equal(issue.ok, false);
  assert.match(issue.raison, /refused to store/);
});

test("⛔ le module NE VALIDE PAS le personnage — ce juge-là est le moteur", () => {
  /* Un second juge dans un écran serait une deuxième vérité sur ce qu'est un
     personnage valable, et c'est celle-ci qui se tromperait : elle ne connaît
     pas les couches montées. On rend l'objet tel quel ; `rebuild` puis
     `validate` prononcent. */
  const bancal = { pas_du_tout: "un personnage" };
  const lu = lirePersonnage(magasin({ [CLEF_PERSONNAGE]: JSON.stringify(bancal) }));
  assert.equal(lu.etat, "lu");
  assert.deepEqual(lu.document, bancal);
});
