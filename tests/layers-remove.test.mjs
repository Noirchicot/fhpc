/* ══ LE RETRAIT — une couche sait enfin RETIRER ════════════════════════
   Lot 17-couche-fh-retrait, 2026-08-08.

   CE QUI MANQUAIT, MESURÉ PAR LE LOT 15 QUI A EU RAISON DE REFUSER : un
   `patch` savait poser et modifier, pas SUPPRIMER. Une couche ne pouvait donc
   pas retirer une aptitude qu'une couche du dessous accorde — et la seule
   voie ouverte (réécrire `data.traits` en entier) aurait recopié le texte SRD
   des traits gardés, qui aurait divergé au premier mouvement du SRD.

   LA FORME : `{ "op": "patch", "remove": ["data.traits[resourceful]"] }` —
   une clef SŒUR de `changes`, une liste de chemins de la MÊME grammaire.
   Jamais une valeur sentinelle, et surtout jamais un `null` qui voudrait dire
   « retire » : `null` est une valeur JSON légitime.

   CE QUE CE FICHIER DOIT TENIR, phrase par phrase :
   · une couche retire ce que la couche du dessous accordait, et RETIRER LA
     COUCHE LE REND — vrai par reconstruction, prouvé et non promis ;
   · un retrait dans le vide JETTE EN NOMMANT LE CHEMIN ;
   · les interdits du patch valent pour le retrait : ni `attribution`, ni
     `source`, ni `contentHash`, ni une racine entière ;
   · un record amputé perd son `contentHash` ;
   · le pli reste TRANSACTIONNEL et DÉTERMINISTE.

   ⚠️ CHAQUE GARDE EST VIOLÉ UNE FOIS, doit rougir EN NOMMANT la chose, et
   l'objet attaqué est restauré. Un garde qu'on n'a jamais vu rougir est une
   intention, pas un garde (TRAPS.md). Et les refus passent par LE GARDE
   LUI-MÊME (`applyRemoval`, `assertLayerShape`, le pli), jamais par une regex
   nue qui imiterait son verdict. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeBlock, aLayer, anAdd, bytes } from "./layers-harness.mjs";
import { applyRemoval, applyPatch, applyChanges } from "../src/layers/paths.mjs";
import { assertLayerShape } from "../src/layers/document.mjs";

/* Jette-t-il, et le message NOMME-t-il la chose ? Un rejet muet et un rejet
   qui oblige à deviner coûtent le même prix à qui le reçoit. */
function rejects(fn, needle, what) {
  let caught = null;
  try { fn(); } catch (error) { caught = error; }
  assert.ok(caught, `${what} devrait être REJETÉ et a été accepté.`);
  assert.match(caught.message, needle, `${what} : le refus doit nommer la chose (message : ${caught.message})`);
  return caught;
}

const HASH = "a".repeat(64);

/* ── LE SOCLE ─────────────────────────────────────────────────────────
   Un record qui ressemble à ce que le SRD pose vraiment : des traits nommés
   dans une collection, une attribution CC-BY, une source, un contentHash. */
function socleLayer() {
  return aLayer({
    id: "socle",
    name: "Socle",
    attribution: { license: "CC-BY-4.0", text: "SRD 5.2.1, Wizards of the Coast LLC" },
    records: {
      species: {
        "socle:species:fr:humain": {
          name: "Humain",
          slug: "humain",
          data: {
            name: "Humain",
            description: "Ingénieux. Tu récupères de l'inspiration.\n\nDébrouillard. Tu sais tout faire.",
            traits: [
              { id: "ingenieux", name: "Ingénieux", text: "Tu récupères de l'inspiration." },
              { id: "debrouillard", name: "Débrouillard", text: "Tu sais tout faire." },
              { id: "polyvalent", name: "Polyvalent", text: "Tu prends un don d'origine." }
            ],
            marques: ["finesse", "lourde"],
            vitesse: 30
          },
          attribution: { license: "CC-BY-4.0", text: "SRD 5.2.1, Wizards of the Coast LLC" },
          source: { id: "srd-5.2.1", locator: "Species" },
          contentHash: HASH
        }
      }
    }
  });
}

const HUMAIN = "socle:species:fr:humain";

/** La pile réelle des scénarios : le socle dessous, une couche de retrait
 *  par-dessus. `entry` est le geste de la couche du dessus. */
function pile(entry, { id = "table" } = {}) {
  const block = makeBlock();
  block.verbs.register({ bytes: bytes(socleLayer()), origin: "socle" });
  block.verbs.register({
    bytes: bytes(aLayer({ id, name: id, records: { species: { [HUMAIN]: entry } } })),
    origin: id
  });
  return block;
}

const traitIds = (view) => view.record.data.traits.map((trait) => trait.id);

/* ══ 1. ACCEPTATION — RETIRER, ET RENDRE EN RETIRANT LA COUCHE ═════════ */

test("ACCEPTATION — une couche RETIRE une aptitude que la couche du dessous accordait", () => {
  const { verbs } = pile({ op: "patch", remove: ["data.traits[ingenieux]"] });

  const vue = verbs.query({ kind: "species", id: HUMAIN });
  /* NOMMÉ, PAS COMPTÉ : un garde qui asserte « deux traits » reste vert quand
     la pile en rend deux mauvais (TRAPS.md). */
  assert.deepEqual(traitIds(vue), ["debrouillard", "polyvalent"],
    "« Ingénieux » est parti, et les deux autres sont restés — nommés, pas comptés");

  /* Et les traits gardés sont ceux du socle, MOT POUR MOT : c'est tout le
     propos du retrait contre la réécriture du tableau. */
  const socle = socleLayer().records.species[HUMAIN].data.traits;
  assert.deepEqual(vue.record.data.traits, socle.filter((trait) => trait.id !== "ingenieux"),
    "retirer n'est pas réécrire : aucun texte du dessous n'a été recopié");
});

test("ACCEPTATION — RETIRER LA COUCHE REND CE QU'ELLE AVAIT RETIRÉ (par reconstruction)", () => {
  const { verbs } = pile({ op: "patch", remove: ["data.traits[ingenieux]"] });
  assert.deepEqual(traitIds(verbs.query({ kind: "species", id: HUMAIN })), ["debrouillard", "polyvalent"]);

  verbs.disable({ id: "table" });
  assert.deepEqual(traitIds(verbs.query({ kind: "species", id: HUMAIN })),
    ["ingenieux", "debrouillard", "polyvalent"],
    "le pli est recalculé de zéro : il n'y a AUCUN état d'annulation à tenir, donc rien qui puisse " +
    "se désynchroniser (contrat layers, invariant 4)");

  /* Et le record rendu est celui du socle À L'IDENTIQUE — jusqu'au
     contentHash, qui n'avait aucune raison de disparaître puisque plus
     personne ne touche au contenu. */
  const rendu = verbs.query({ kind: "species", id: HUMAIN }).record;
  assert.equal(rendu.contentHash, HASH, "le certificat revient avec le contenu qu'il certifie");
  assert.deepEqual(rendu.data, socleLayer().records.species[HUMAIN].data);

  verbs.enable({ id: "table" });
  assert.deepEqual(traitIds(verbs.query({ kind: "species", id: HUMAIN })), ["debrouillard", "polyvalent"],
    "et remonter la couche reprend ce qu'elle retirait");
});

test("ACCEPTATION — un retrait ôte aussi bien une CLEF d'objet qu'un ÉLÉMENT de collection", () => {
  const { verbs } = pile({ op: "patch", remove: ["data.vitesse", "data.marques[lourde]"] });
  const data = verbs.query({ kind: "species", id: HUMAIN }).record.data;

  assert.equal(Object.hasOwn(data, "vitesse"), false, "la clef d'objet est partie");
  assert.deepEqual(data.marques, ["finesse"], "et l'élément de collection aussi — par son identité");
  assert.equal(data.name, "Humain", "le reste du record n'a pas bougé");
});

test("ACCEPTATION — plusieurs retraits dans la MÊME collection : l'identité, jamais le rang", () => {
  /* Le vrai piège d'une suppression dans un tableau : le second retrait ne
     doit pas dépendre de la position que le premier a décalée. On retire donc
     le PREMIER puis le DERNIER, l'ordre où un code écrit par index se casse. */
  const { verbs } = pile({ op: "patch", remove: ["data.traits[ingenieux]", "data.traits[polyvalent]"] });
  assert.deepEqual(traitIds(verbs.query({ kind: "species", id: HUMAIN })), ["debrouillard"]);

  /* Et dans l'ordre inverse, le résultat est le même — c'est ce que veut dire
     « on désigne par l'identité ». */
  const { verbs: autre } = pile({ op: "patch", remove: ["data.traits[polyvalent]", "data.traits[ingenieux]"] });
  assert.deepEqual(traitIds(autre.query({ kind: "species", id: HUMAIN })), ["debrouillard"]);
});

test("ACCEPTATION — un record AMPUTÉ perd son contentHash, comme un record patché", () => {
  const { verbs } = pile({ op: "patch", remove: ["data.traits[ingenieux]"] });
  const record = verbs.query({ kind: "species", id: HUMAIN }).record;
  assert.equal(Object.hasOwn(record, "contentHash"), false,
    "le certificat décrit le contenu CHEZ SA SOURCE ; retirer une aptitude rompt cette description " +
    "autant qu'en changer une, et le laisser serait affirmer une intégrité qu'on vient de rompre");

  /* Le TÉMOIN : sur la pile sans couche du dessus, le certificat est là. Sans
     lui, ce test ne prouverait qu'un socle sans contentHash. */
  const { verbs: nu } = makeBlock();
  nu.register({ bytes: bytes(socleLayer()), origin: "socle" });
  assert.equal(nu.query({ kind: "species", id: HUMAIN }).record.contentHash, HASH);
});

test("ACCEPTATION — la provenance RAPPORTE les retraits, et les rapporte toujours", () => {
  const { verbs } = pile({
    op: "patch",
    changes: { "data.vitesse": 25 },
    remove: ["data.traits[ingenieux]"]
  });
  const patchedBy = verbs.query({ kind: "species", id: HUMAIN }).provenance.patchedBy;
  assert.deepEqual(patchedBy, [{
    by: "table",
    applied: [{ path: "data.vitesse", created: false }],
    removed: ["data.traits[ingenieux]"]
  }], "qui a retiré quoi se lit dans la provenance, pas dans un diff qu'il faudrait refaire");

  /* `removed` est présent MÊME VIDE : une forme qui apparaît et disparaît
     selon le contenu oblige chaque lecteur à la tester avant de la lire. */
  const { verbs: sans } = pile({ op: "patch", changes: { "data.vitesse": 25 } });
  assert.deepEqual(sans.query({ kind: "species", id: HUMAIN }).provenance.patchedBy[0].removed, []);
});

/* ══ 2. LES REFUS, ET LEURS ATTAQUES ═══════════════════════════════════ */

test("REFUS — un retrait dans le vide JETTE en nommant le chemin", () => {
  /* Trois façons de ne rien viser, et chacune doit nommer le chemin : une
     clef d'objet absente, un élément de collection absent, un intermédiaire
     absent. Un retrait à moitié appliqué en silence est ce que §L7.2 refuse
     pour le patch, et il n'y a aucune raison de l'accorder au retrait. */
  rejects(() => pile({ op: "patch", remove: ["data.courage"] }),
    /data\.courage/, "retirer une clef qui n'existe pas");
  rejects(() => pile({ op: "patch", remove: ["data.traits[chanceux]"] }),
    /data\.traits\[chanceux\]/, "retirer un trait que le socle n'accorde pas");
  rejects(() => pile({ op: "patch", remove: ["data.lignees[drow].nom"] }),
    /data\.lignees/, "retirer sous un intermédiaire absent");

  /* Le TÉMOIN, sans lequel on ne prouverait qu'un garde qui crie tout le
     temps : le même geste sur un chemin qui vise vraiment quelque chose passe. */
  assert.doesNotThrow(() => pile({ op: "patch", remove: ["data.traits[ingenieux]"] }));
});

test("REFUS — le retrait d'`attribution`, de `source` et de `contentHash`, un par un", () => {
  /* LA RAISON, et elle est de premier rang (loi §0.8) : une couche ne décroche
     pas la notice CC-BY d'un record dont elle dérive. Un interdit qui ne
     vaudrait que pour l'ÉCRITURE se contournerait par la SUPPRESSION — c'est
     exactement le trou que ce lot pouvait ouvrir. */
  for (const chemin of ["attribution", "attribution.license", "attribution.text"]) {
    rejects(() => pile({ op: "patch", remove: [chemin] }), /attribution/,
      `retirer « ${chemin} » d'un record SRD`);
  }
  rejects(() => pile({ op: "patch", remove: ["source.id"] }), /source/, "retirer la source d'un record");
  rejects(() => pile({ op: "patch", remove: ["contentHash"] }), /contentHash/, "retirer le certificat lui-même");

  /* Et le refus reste vrai HORS DU PLI, sur le garde nu — c'est lui qui porte
     la règle, le pli ne fait que l'appeler. */
  rejects(() => applyRemoval({ attribution: { license: "CC-BY-4.0" } }, "attribution.license", "attaque"),
    /attribution/, "le garde de racine, appelé directement");

  /* Le TÉMOIN : les trois racines ouvertes le sont toujours. */
  assert.doesNotThrow(() => applyRemoval({ data: { a: 1 } }, "data.a", "témoin"));
});

test("REFUS — on ne retire pas une RACINE entière du record", () => {
  /* `fh-layer/1` EXIGE `name` et `data` sur un record ($defs/opAdd.required) :
     un pli qui les ôterait produirait un record que son propre schéma ne
     saurait pas exprimer. `slug` y est joint par symétrie — le refus est
     réversible vers le laxisme, l'inverse ne l'est pas. */
  for (const racine of ["data", "name", "slug"]) {
    rejects(() => pile({ op: "patch", remove: [racine] }), new RegExp(`${racine}|racine`),
      `retirer la racine « ${racine} »`);
  }
  /* Le TÉMOIN : un cran plus bas, ça passe. La règle porte sur la RACINE, pas
     sur ce qu'elle contient. */
  assert.doesNotThrow(() => pile({ op: "patch", remove: ["data.vitesse"] }));
});

/* ══ 3. L'ORDRE — LE RETRAIT AVANT `changes`, ET POURQUOI ══════════════ */

test("L'ORDRE — les retraits s'appliquent AVANT les modifications", () => {
  /* La démonstration la plus courte : `changes` recrée la clef que `remove`
     vient d'ôter. Si les modifications passaient d'abord, la clef serait
     partie ; elles passent après, donc elle est là, avec la valeur neuve. */
  const { record, applied, removed } = applyPatch(
    { name: "X", data: { vitesse: 30 } },
    { remove: ["data.vitesse"], changes: { "data.vitesse": 25 } },
    "ordre"
  );
  assert.equal(record.data.vitesse, 25, "le retrait a précédé la modification");
  assert.deepEqual(removed, ["data.vitesse"]);
  assert.deepEqual(applied, [{ path: "data.vitesse", created: true }],
    "et `created:true` le PROUVE : la clef n'existait plus quand la modification est passée");
});

test("L'ORDRE — c'est le seul des deux qui fasse CRIER un patch qui se contredit", () => {
  /* Voilà l'argument, et il est vérifiable plutôt qu'esthétique. Un patch qui
     dit deux choses contraires ne doit pas être arbitré par un ordre : il doit
     être ENTENDU. Les deux sens de la contradiction jettent, en nommant. */

  // (a) retirer X puis écrire SOUS X : l'intermédiaire n'existe plus.
  rejects(() => applyPatch(
    { name: "X", data: { traits: [{ id: "ingenieux", name: "Ingénieux" }] } },
    { remove: ["data.traits[ingenieux]"], changes: { "data.traits[ingenieux].name": "Autre" } },
    "contradiction"
  ), /data\.traits\[ingenieux\]/, "un patch qui retire ce qu'il modifie");

  // (b) créer X par `changes` puis le retirer : le retrait passe avant, il ne vise rien.
  rejects(() => applyPatch(
    { name: "X", data: {} },
    { remove: ["data.courage"], changes: { "data.courage": 3 } },
    "contradiction"
  ), /data\.courage/, "un patch qui retire ce qu'il pose");

  /* L'ORDRE INVERSE, JOUÉ À LA MAIN, POUR MONTRER CE QU'ON A ÉVITÉ : les deux
     mêmes patchs réussissent et s'annulent EN SILENCE. C'est ce silence-là qui
     a décidé de l'ordre — pas une préférence de lecture. */
  const silencieux = applyChanges({ name: "X", data: {} }, { "data.courage": 3 }, "inverse");
  assert.equal(silencieux.record.data.courage, 3);
  assert.doesNotThrow(() => applyRemoval(silencieux.record, "data.courage", "inverse"),
    "modifications d'abord : le patch se contredit et personne ne l'entend");
  assert.equal(Object.hasOwn(silencieux.record.data, "courage"), false);
});

test("L'ORDRE — les retraits suivent la LISTE, les modifications suivent le tri", () => {
  /* Deux ordres, deux raisons. Une CARTE n'a pas d'ordre qui se lise à l'œil,
     d'où le tri de `changes` (invariant 10). Un TABLEAU porte déjà l'ordre que
     son auteur a écrit — le trier remplacerait une intention lisible par une
     convention. Ici, la seconde entrée de la liste ne vise plus rien une fois
     la première passée : l'ordre déclaré se LIT dans le message d'erreur. */
  const cible = () => ({ name: "X", data: { traits: [{ id: "a" }, { id: "b" }] } });
  rejects(() => applyPatch(cible(), { remove: ["data.traits[a]", "data.traits[a]"] }, "doublon"),
    /data\.traits\[a\]/, "un chemin listé deux fois : le second retrait ne vise plus rien");

  /* Et deux plis du même patch rendent le même record : le déterminisme ne
     tient pas au hasard de l'ordre des clefs. */
  const un = applyPatch(cible(), { remove: ["data.traits[b]"], changes: { "data.vitesse": 1, "data.taille": 2 } }, "d");
  const deux = applyPatch(cible(), { remove: ["data.traits[b]"], changes: { "data.taille": 2, "data.vitesse": 1 } }, "d");
  assert.deepEqual(JSON.stringify(un.record), JSON.stringify(deux.record),
    "mêmes octets, quel que soit l'ordre d'écriture des clefs");
});

/* ══ 4. LE PLI RESTE TRANSACTIONNEL ════════════════════════════════════ */

test("TRANSACTIONNEL — une couche dont un retrait échoue est DÉMONTÉE, la pile revient où elle était", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: bytes(socleLayer()), origin: "socle" });
  const avant = verbs.query({ kind: "species", id: HUMAIN });

  rejects(() => verbs.register({
    bytes: bytes(aLayer({
      id: "casse", name: "Cassée",
      records: {
        species: {
          [HUMAIN]: { op: "patch", remove: ["data.traits[ingenieux]", "data.traits[introuvable]"] }
        }
      }
    })),
    origin: "casse"
  }), /introuvable/, "une couche dont le second retrait vise le vide");

  assert.deepEqual(verbs.stack().map((couche) => couche.id), ["socle"],
    "la couche fautive n'est pas montée : jamais de pile à moitié pliée");
  assert.deepEqual(verbs.query({ kind: "species", id: HUMAIN }).record, avant.record,
    "et le premier retrait, qui avait pourtant réussi, n'a laissé AUCUNE trace");
});

/* ══ 5. LE DOCUMENT : LA FORME DE `remove`, REFUSÉE QUAND ELLE EST FAUSSE ═ */

const patchDoc = (entry) => aLayer({ records: { species: { "t:species:fr:x": entry } } });

test("le document accepte `remove` seul, `changes` seul, et les deux ensemble", () => {
  for (const entry of [
    { op: "patch", remove: ["data.traits[x]"] },
    { op: "patch", changes: { "data.a": 1 } },
    { op: "patch", changes: { "data.a": 1 }, remove: ["data.b"], note: "les deux" }
  ]) {
    assert.doesNotThrow(() => assertLayerShape(patchDoc(entry), "t"), JSON.stringify(entry));
  }
});

test("ATTAQUE — la forme de `remove` : ni objet, ni vide, ni chemin tordu, ni patch qui ne fait rien", () => {
  rejects(() => assertLayerShape(patchDoc({ op: "patch", remove: { "data.a": null } }), "t"),
    /tableau de chemins/, "un `remove` en objet — la forme qu'aurait eue une valeur sentinelle");
  rejects(() => assertLayerShape(patchDoc({ op: "patch", remove: [] }), "t"),
    /vide/, "un `remove` vide");
  rejects(() => assertLayerShape(patchDoc({ op: "patch", remove: ["data..a"] }), "t"),
    /mal formé/, "un chemin de retrait mal formé");
  rejects(() => assertLayerShape(patchDoc({ op: "patch", remove: [42] }), "t"),
    /mal formé/, "un chemin de retrait qui n'est pas une chaîne");
  rejects(() => assertLayerShape(patchDoc({ op: "patch" }), "t"),
    /ni changes ni remove/, "un patch qui ne porte ni l'un ni l'autre");
  rejects(() => assertLayerShape(patchDoc({ op: "patch", changes: {} }), "t"),
    /vide/, "un `changes` vide reste refusé, comme avant");

  /* ⚠️ ET `null` NE VEUT TOUJOURS PAS DIRE « RETIRE ». C'est le cœur du choix
     de forme : `null` reste une valeur JSON légitime qu'un patch POSE. Si un
     jour quelqu'un le lisait comme un retrait, ce test le lui dirait. */
  const { record } = applyPatch({ name: "X", data: { a: 1 } }, { changes: { "data.a": null } }, "null");
  assert.equal(Object.hasOwn(record.data, "a"), true, "la clef est là…");
  assert.equal(record.data.a, null, "…et elle vaut null : posée, pas retirée");
});

test("ATTAQUE — `op:\"remove\"` n'existe pas : le retrait n'ouvre pas une quatrième opération", () => {
  /* Le geste s'appelle `remove` DANS un patch. Une entrée dont l'`op` vaudrait
     « remove » resterait un rejet — sinon deux grammaires diraient la même
     chose, et « aucune convention par cas » aurait déjà cédé. */
  rejects(() => assertLayerShape(patchDoc({ op: "remove", remove: ["data.a"] }), "t"),
    /add, patch et disable/, "une quatrième opération déguisée");
});
