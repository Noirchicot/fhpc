/* ══ LES TROIS PAGES D'ÉQUIPEMENT ONT LE MÊME HAUT, LE MÊME PIED, LES MÊMES CÉSURES — lot 323 ══════
   ⚖️ Eric, 27/09 : « Mon objectif : aligner le design des 3 pages » · « L'idée c'est que haut et pied
   de page, césures, marges, lorsque c'est possible (gear aura toujours une seule dalle en haut),
   soient idem sur les 3 ».
   🔴 POURQUOI CE GARDE : au lot 322 la grille de Pack a raccourci, et la bourse et la lune — centrées
   dans un espace qui partait du bas des jetons — sont remontées de 3 sans qu'aucun garde le voie
   (chaque écran était vert CONTRE SON PROPRE PLAN). ⭐ Celui-ci compare les trois PLANS entre eux.
   📐 Gear compte le belt dans ses cotes (0..60) : on le retire pour parler dans le repère des deux
   autres, qui commencent sous le belt. */
import test from "node:test";
import assert from "node:assert/strict";

const G = await import("../ui/builder/gear-disposition.mjs");
const P = await import("../ui/builder/sac-disposition.mjs");
const W = await import("../ui/builder/wares-disposition.mjs");

const gear = (nom) => { const o = G.ORGANES.find((x) => x.nom === nom); return o && { ...o, y: o.y - G.BELT_H }; };
const pack = (nom) => P.ORGANES.find((x) => x.nom === nom);
const wares = (nom) => W.ORGANES.find((x) => x.nom === nom);
const cle = (o) => o && [o.x, o.y, o.l, o.h];

test("1 — ⚖️ les dalles : même haut de page, même césure, même pied (Gear n'a qu'une dalle en haut)", () => {
  const corps = G.DALLES.find((d) => d.nom === "CORPS");
  const piedG = G.DALLES.find((d) => d.nom === "PIED");
  const [tambour, grille, piedW] = W.DALLES;
  /* le pied : même haut, même hauteur, même bas de page */
  assert.deepEqual([piedG.y - G.BELT_H, piedG.h], [piedW.y, piedW.h], "Gear et Wares : le même pied");
  assert.equal(P.DALLES.y + P.DALLES.h + 8, piedW.y, "Pack : le pied commence là où commence celui de Wares");
  assert.equal(P.DALLE.h, W.DALLE.h, "Pack et Wares : la même dalle");
  /* le haut : la grille de Pack est celle de Wares ; le corps de Gear finit où elles finissent */
  assert.deepEqual([P.DALLES.y, P.DALLES.h], [grille.y, grille.h], "Pack et Wares : la même grille");
  assert.equal(tambour.y + tambour.h + 8, grille.y, "Wares : la césure du haut vaut 8");
  assert.equal(corps.y - G.BELT_H + corps.h, grille.y + grille.h, "Gear : son corps finit où finissent les grilles");
  /* les césures du bas : 8 partout */
  assert.equal(piedW.y - (grille.y + grille.h), 8);
  assert.equal(piedG.y - (corps.y + corps.h), 8);
});

test("2 — ⚖️ le pied porte ses organes aux MÊMES cotes sur les trois pages", () => {
  for (const nom of ["COLLECTEUR", "PURSE", "TALLY", "PARTY TALLY", "LUNE", "SEND VERS"]) {
    const nomGear = { COLLECTEUR: "SEND COLLECTOR", "SEND VERS": "SEND TO" }[nom] || nom;
    const g = gear(nomGear), p = pack(nom), w = wares(nom);
    assert.ok(g && p && w, `${nom} manque sur un des trois plans`);
    /* la lune de Gear est posée par sa cible au bord (x 0..44) : on compare les CIBLES quand il y en a */
    const c = (o) => cle(o.cible && typeof o.cible === "object" ? o.cible : o);
    assert.deepEqual([c(p)[0], c(p)[1]], [c(w)[0], c(w)[1]], `${nom} : Pack ≠ Wares`);
    assert.equal(p.y, g.y, `⛔ ${nom} : Pack à ${p.y}, Gear à ${g.y}`);
  }
  assert.equal(G.BARRE.y - G.BELT_H, pack("RANGEE").y, "la rangée du bas, Gear = Pack");
  assert.equal(wares("RANGEE").y, pack("RANGEE").y, "la rangée du bas, Wares = Pack");
});

test("3 — ⚖️ LOT 325 : la LUNE se peint au même point sur les trois pages — dessin compris, pas seulement la cible", async () => {
  /* Eric, 27/09 : « La position de la lune dans gear doit être harmonisée aux deux autres ». 🔴 Le
     garde 2 comparait les CIBLES (identiques) ; le DESSIN se creuse dans la cible par des bords, et
     Gear les écrivait symétriques (7/7) quand Pack et Wares écrivent ceux du plan (4 à gauche, 10 à
     droite) — l'astre de Gear était 3 plus à droite. ⭐ On compare donc les BORDS que chaque feuille écrit. */
  const { createTestDocument } = await import("./dom-stub.mjs");
  globalThis.document = globalThis.document || createTestDocument();
  const { feuilleDesCotes } = await import("../ui/builder/gear-ecran.mjs");
  const { feuilleDesCotesSac } = await import("../ui/builder/sac-ecran.mjs");
  const bords = (css) => (css.match(/\[data-organe="lune"\]\{[^}]*border-width:([^;}]+)/) || [])[1];
  const g = bords(feuilleDesCotes({ grandEcran: true }));
  const p = bords(feuilleDesCotesSac());
  assert.ok(g && p, "les deux feuilles posent la lune");
  assert.equal(g.trim(), p.trim(), `⛔ la lune de Gear (${g}) n'est pas creusée comme celle de Pack (${p})`);
});
