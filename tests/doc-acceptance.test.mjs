/* ══ LE TEST D'ACCEPTATION DU LOT 14 ═══════════════════════════════════

   « Un personnage est sauvegardé, listé, rouvert, exporté, réimporté dans un
     magasin VIERGE — et il en ressort byte-identique, sans qu'aucune ligne de
     `src/doc/` ne nomme un chemin ni n'importe `node:fs`. »

   Et son pendant, qui compte autant : trois documents refusés, chacun en
   NOMMANT sa raison — un JSON corrompu, un document d'un schéma inconnu, et
   un document qui transporte de l'ÉTAT DE SÉANCE (leçon n°4).

   ⚠️ LA SECONDE MOITIÉ DE LA PHRASE EST PROUVÉE AILLEURS, ET C'EST VOULU :
   « aucune ligne de src/doc/ ne nomme un chemin » est un garde STRUCTUREL,
   attaqué dans `tests/doc-block.test.mjs`. Ici on prouve le VOYAGE ; là-bas on
   prouve que le bloc n'a pas triché pour le faire. Les deux moitiés se
   perdraient l'une sans l'autre.

   ⚠️ AUCUN OCTET N'EST ÉCRIT SUR LE DISQUE PAR CE FICHIER. Les deux magasins
   sont en mémoire — ce qui n'est possible QUE parce que le stockage est
   injecté (décision D1). Le magasin système de fichiers est éprouvé dans
   `doc-block`, dans un répertoire temporaire. */

import test from "node:test";
import assert from "node:assert/strict";

import { DocError } from "../src/doc/index.mjs";
import {
  EXAMPLE_CHAR, exampleBytes, exampleDocument, makeDoc, memoryStorage
} from "./doc-harness.mjs";

/* ── LE VOYAGE, SUR LES OCTETS DU FICHIER DU DÉPÔT ─────────────────── */

test("ACCEPTATION — sauvegardé, listé, rouvert, exporté, réimporté dans un magasin VIERGE : byte-identique", () => {
  const original = exampleBytes();
  const document = exampleDocument();

  /* 1. LE MAGASIN DU JOUEUR. Le personnage y ENTRE par ses octets : c'est le
        geste réel (« j'ai reçu ce fichier », « je viens de l'exporter du
        Mac »), et c'est celui qui doit rendre les mêmes octets à la sortie. */
  const chez_moi = makeDoc();
  const entree = chez_moi.verbs.import({ bytes: original });
  assert.equal(entree.id, document.id);
  assert.equal(entree.replaced, false);
  assert.equal(entree.renamed, false);
  assert.equal(entree.size, original.length, "les octets stockés sont ceux qui sont entrés, à l'octet près");

  /* 2. LISTÉ. L'inventaire nomme le personnage, sa langue, son niveau et son
        empreinte — de quoi le reconnaître sans l'ouvrir. */
  const inventaire = chez_moi.verbs.list();
  assert.equal(inventaire.length, 1);
  assert.deepEqual(inventaire[0], {
    id: "exemple-sylvane-aubelame",
    ok: true,
    hash: entree.hash,
    size: original.length,
    name: "Sylvane Aubelame",
    lang: "fr",
    level: 1,
    created: "2026-08-07T09:00:00Z",
    modified: "2026-08-08T11:15:00Z"
  });

  /* 3. ROUVERT. Le document rendu est celui du fichier, ENTIER — comparé
        objet contre objet, jamais par une projection (leçon de la revue du
        2026-08-08 : une projection laisse passer les écarts qu'elle ne
        regarde pas). */
  const ouvert = chez_moi.verbs.open({ id: document.id });
  assert.deepEqual(ouvert.document, document);
  assert.equal(ouvert.hash, entree.hash);

  /* 4. EXPORTÉ. Des OCTETS, jamais un chemin : le bloc ne connaît pas le
        disque, il ne peut donc pas nommer un endroit (décision D1). */
  const valise = chez_moi.verbs.export({ id: document.id });
  assert.ok(Buffer.isBuffer(valise.bytes) || valise.bytes instanceof Uint8Array);
  assert.equal(Buffer.compare(Buffer.from(valise.bytes), original), 0,
    `les octets exportés ne sont pas ceux de ${EXAMPLE_CHAR} — « partir avec ses persos » veut dire ` +
    "repartir avec SON fichier, pas avec une reconstitution qui lui ressemble");
  assert.equal(valise.hash, entree.hash);

  /* 5. RÉIMPORTÉ DANS UN MAGASIN VIERGE. Un autre appareil, une autre
        session, rien en commun — pas même l'instance du bloc. */
  const ailleurs = makeDoc({ storage: memoryStorage() });
  assert.deepEqual(ailleurs.verbs.list(), [], "le magasin d'arrivée est VIERGE, et on le vérifie plutôt que de le croire");
  const arrivee = ailleurs.verbs.import({ bytes: valise.bytes });
  assert.equal(arrivee.id, document.id);
  assert.equal(arrivee.hash, entree.hash);

  /* 6. ET IL EN RESSORT BYTE-IDENTIQUE. */
  const retour = ailleurs.verbs.export({ id: document.id });
  assert.equal(Buffer.compare(Buffer.from(retour.bytes), original), 0,
    "le voyage complet doit rendre le fichier d'origine, octet pour octet");
  assert.deepEqual(ailleurs.verbs.open({ id: document.id }).document, document);
});

test("ACCEPTATION — le même voyage pour un document qui arrive EN MÉMOIRE (la sortie du bloc `build`)", () => {
  /* `build.rebuild` rend un OBJET, pas un fichier. C'est `save` qui lui donne
     des octets — canoniques, cette fois — et le voyage doit tenir pareil. */
  const document = exampleDocument();
  const chez_moi = makeDoc();
  const ecrit = chez_moi.verbs.save({ document });

  assert.deepEqual(chez_moi.verbs.list().map((entry) => entry.id), [document.id]);
  assert.deepEqual(chez_moi.verbs.open({ id: document.id }).document, document);

  const valise = chez_moi.verbs.export({ id: document.id });
  assert.equal(valise.hash, ecrit.hash);

  const ailleurs = makeDoc({ storage: memoryStorage() });
  ailleurs.verbs.import({ bytes: valise.bytes });
  const retour = ailleurs.verbs.export({ id: document.id });
  assert.equal(Buffer.compare(Buffer.from(retour.bytes), Buffer.from(valise.bytes)), 0);
  assert.deepEqual(ailleurs.verbs.open({ id: document.id }).document, document);

  /* ET LE PENDANT QUI DONNE SON SENS AU PRÉCÉDENT : les octets canoniques ne
     sont PAS ceux du fichier du dépôt (il est mis en forme autrement), et
     c'est justement pourquoi `import` stocke les octets reçus TELS QUELS au
     lieu de les re-sérialiser. Sans cette règle, un aller-retour changerait le
     fichier de quelqu'un sans que rien ne le dise. */
  assert.notEqual(Buffer.compare(Buffer.from(valise.bytes), exampleBytes()), 0,
    "si ces deux formes devenaient identiques, ce test cesserait de prouver ce qu'il prouve — le relire");
});

/* ── LES TROIS REFUS, ET CHACUN NOMME SA RAISON ────────────────────── */

/** Le magasin doit rester VIERGE après un refus : « ne valide pas » veut dire
 *  « n'entre pas », pas « entre et on verra ». */
function refuse(bytes, motif) {
  const magasin = memoryStorage();
  const { verbs } = makeDoc({ storage: magasin });
  let error = null;
  try { verbs.import({ bytes }); } catch (caught) { error = caught; }
  assert.ok(error, "un document fautif doit être REFUSÉ — un succès silencieux est le pire des résultats");
  assert.ok(error instanceof DocError, `le refus est un DocError, reçu ${error.constructor.name} : ${error.message}`);
  assert.match(error.message, motif, `le refus doit NOMMER sa raison — reçu : ${error.message}`);
  assert.deepEqual(magasin.list(), [], "un document refusé n'entre pas dans le magasin");
  return error.message;
}

test("REFUS 1 — un JSON corrompu, et le refus dit qu'il est illisible", () => {
  const casse = Buffer.from(exampleBytes().toString("utf8").slice(0, 4000), "utf8");
  const message = refuse(casse, /JSON illisible/);
  assert.match(message, /import/, "et il dit par quelle porte il est arrivé");

  /* LE TÉMOIN : les octets ENTIERS passent. Sans lui, ce test ne prouverait
     rien de plus qu'un bloc qui refuse tout. */
  const { verbs } = makeDoc();
  assert.equal(verbs.import({ bytes: exampleBytes() }).id, "exemple-sylvane-aubelame");
});

test("REFUS 2 — un document d'un schéma inconnu, et le refus nomme les deux schémas", () => {
  const etranger = exampleDocument();
  etranger.schema = "fh-char/2";
  const message = refuse(Buffer.from(JSON.stringify(etranger, null, 2) + "\n", "utf8"), /fh-char\/2/);
  assert.match(message, /fh-char\/1/, "il nomme aussi le seul schéma que ce bloc ouvre");

  /* ET L'AUTRE FORME DU MÊME REFUS : un document qui n'est pas un personnage
     du tout. La raison change, le refus reste. */
  refuse(Buffer.from('{"schema":"fh-layer/1","id":"srd","records":{}}\n', "utf8"), /fh-layer\/1/);
});

test("REFUS 3 — un document qui transporte de l'ÉTAT DE SÉANCE (leçon n°4)", () => {
  /* L'état de séance, ce sont les mots de `contracts/play.md` : la
     transaction de jet, la main, le plateau, la sélection, l'historique. Il
     appartient au bloc `play` et IL NE VOYAGE PAS. Le refus vient de la
     fermeture de tous les objets de `fh-char/1` — une seule règle, celle du
     schéma, appliquée à l'exécution. */
  const seance = exampleDocument();
  seance.session = { transaction: { open: true }, hand: ["d20"], history: [] };
  const message = refuse(
    Buffer.from(JSON.stringify(seance, null, 2) + "\n", "utf8"),
    /clef inconnue « session »/
  );
  assert.match(message, /état de séance/, "le refus NOMME ce qui est refusé, il ne dit pas seulement « non »");
  assert.match(message, /play/, "et il dit à qui appartient cet état");

  /* LA MÊME LEÇON, UN CRAN PLUS BAS : l'état de séance glissé DANS `resolved`,
     là où un auteur pressé le mettrait pour qu'il « voyage avec la fiche ». */
  const dansResolved = exampleDocument();
  dansResolved.resolved.traySelection = { dieId: "d20-1" };
  refuse(
    Buffer.from(JSON.stringify(dansResolved, null, 2) + "\n", "utf8"),
    /« document\.resolved » : clef inconnue « traySelection »/
  );

  /* LE TÉMOIN, ENCORE : ce qui EST persistant traverse. `vitals` et le
     `current` des ressources voyagent — ils vivent dans `resolved` et se
     décrémentent au règlement (leçon n°4, seconde moitié). */
  const blesse = exampleDocument();
  blesse.resolved.vitals.hpCurrent = 3;
  blesse.resolved.vitals.conditions = ["prone"];
  const { verbs } = makeDoc();
  const entree = verbs.save({ document: blesse });
  assert.equal(verbs.open({ id: entree.id }).document.resolved.vitals.hpCurrent, 3,
    "un personnage blessé reste blessé au repos : ce n'est pas de l'état de séance, c'est sa fiche");
});
