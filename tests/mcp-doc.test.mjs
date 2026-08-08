/* ══ LE CÂBLAGE MCP → `doc` — CE QUI LE PROUVE ═════════════════════════
   Architecte, 2026-08-08.

   ⚠️ CE FICHIER N'APPELLE JAMAIS `dispatch`, ET C'EST VÉRIFIÉ (garde 3 de
   `mcp-block.test.mjs`, dont la liste le nomme). Tout passe par des messages
   MCP : si un personnage arrive sur le disque ici, c'est qu'une IA peut l'y
   mettre, et pas qu'un test a su appeler la bonne fonction.

   ── CE QUE CE FICHIER EXISTE POUR PROUVER ──────────────────────────────
   Le lot 10 avait laissé le M2 avec un serveur qui SAIT CONSTRUIRE et NE SAIT
   PAS GARDER : rien ne survivait à l'arrêt du processus. La dette était
   nommée depuis, non payée. Trois choses doivent être vraies pour qu'elle le
   soit :

   1. un personnage dérivé s'enregistre, se retrouve dans l'inventaire, et se
      rouvre — le tout par des outils ;
   2. l'enregistrement N'EXIGE PAS que l'appelant recopie le document (18 634
      caractères de JSON pour un niveau 1 : le faire retranscrire par un
      modèle de langue serait la corruption garantie) ;
   3. un serveur SANS magasin ne ment pas : il ne publie pas ces outils, et il
      dit pourquoi si on les appelle quand même.

   Le troisième est le moins évident et le plus important : c'est celui qui
   distingue « le catalogue décrit le serveur » de « le catalogue décrit le
   dépôt ». */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createFsStorage } from "../src/storage/fs.mjs";
import { createMcp, CODES, TOOLS } from "../src/mcp/index.mjs";
import {
  FICHIER, HOMEBREW, SRD_FR,
  documentVierge, fileText, makeClient, openSurface, toolFor
} from "./mcp-harness.mjs";

/* Le magasin vit dans un dossier temporaire, créé ici et nulle part ailleurs :
   ce test écrit de VRAIS fichiers, c'est le point. Un magasin en mémoire
   prouverait le câblage sans prouver le disque. */
const magasin = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-doc-"));
const client = makeClient(openSurface({ storage: createFsStorage({ root: magasin }) }));

/** La construction d'un personnage, par la surface seule. Faite une fois :
 *  monter la couche SRD coûte plusieurs secondes, et aucun test ne la mute. */
let bati = null;
function construire() {
  if (bati) return bati;
  /* Les DEUX couches : le personnage d'exemple pose des choix sur des records
     de la couche homebrew (sa lanterne pliante). Ne monter que le SRD ferait
     échouer la dérivation — et le refus serait juste. */
  client.ok("layers.register", { layer: fileText(SRD_FR), origin: SRD_FR });
  client.ok("layers.register", { layer: fileText(HOMEBREW), origin: HOMEBREW });
  const stack = client.ok("layers.stack");

  let premier = { document: documentVierge(stack) };
  for (const choice of FICHIER.build.choices) {
    const args = Object.assign({}, premier, { path: choice.path });
    if (choice.ref !== undefined) args.ref = choice.ref; else args.value = choice.value;
    if (choice.label !== undefined) args.label = choice.label;
    client.ok(toolFor(choice), args);
    premier = {};
  }
  client.ok("build.rebuild", {});
  bati = { stack };
  return bati;
}

/* ── LE TEST D'ACCEPTATION DU CÂBLAGE ───────────────────────────────── */

test("UN PERSONNAGE DÉRIVÉ S'ENREGISTRE, SE LISTE ET SE ROUVRE — par la surface MCP seule", () => {
  construire();

  /* 1. ENREGISTRER SANS RIEN RECOPIER. `doc.save` est appelé À VIDE : c'est
        le personnage que `build.rebuild` vient de dériver qui part sur le
        disque. C'est l'exigence n°2, et elle se lit dans l'appel. */
  const enregistre = client.ok("doc.save", {});
  assert.equal(enregistre.id, FICHIER.id);
  assert.equal(enregistre.replaced, false, "le magasin était vide : c'est une création");
  assert.equal(typeof enregistre.hash, "string");
  assert.ok(enregistre.size > 0);

  /* Et le fichier EST là, sur un vrai disque, sous un vrai nom. */
  const fichiers = fs.readdirSync(magasin);
  assert.deepEqual(fichiers, [`${FICHIER.id}.fh-char.json`],
    "le magasin porte le personnage, et lui seul");

  /* 2. LE RETROUVER. L'inventaire projette de quoi RECONNAÎTRE un
        personnage — pas le document, qui est derrière `open`. */
  const liste = client.ok("doc.list");
  assert.equal(liste.length, 1);
  assert.equal(liste[0].ok, true, "l'entrée est lisible");
  assert.equal(liste[0].id, FICHIER.id);
  assert.equal(liste[0].name, FICHIER.name);
  assert.equal(liste[0].hash, enregistre.hash, "l'empreinte listée est celle qui vient d'être écrite");

  /* 3. LE ROUVRIR — et le document repart bien à sa seule adresse. */
  const ouvert = client.ok("doc.open", { id: FICHIER.id });
  assert.equal(ouvert.id, FICHIER.id);
  assert.equal(ouvert.hash, enregistre.hash);
  assert.equal(ouvert.document, undefined,
    "un résultat d'outil ne porte JAMAIS le document : il est à la resource et à mcp.document");

  /* 4. ET C'EST BIEN LE MÊME PERSONNAGE. Le tour complet — dériver,
        enregistrer, rouvrir — rend un document identique à ce que le serveur
        tenait. Sans cette ligne, les trois précédentes ne prouvent que des
        empreintes qui se ressemblent. */
  const rendu = client.ok("mcp.document");
  assert.equal(rendu.id, FICHIER.id);
  assert.ok(rendu.resolved, "le document rouvert porte sa fiche jouable");
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(magasin, `${FICHIER.id}.fh-char.json`), "utf8")).id,
    rendu.id);
});

test("LE REFUS D'ÉCRASER CE QU'ON N'A PAS LU EST ATTEIGNABLE, ET RÉSOLUBLE, DEPUIS LA SURFACE", () => {
  construire();
  const id = FICHIER.id;

  /* Quelqu'un d'autre écrit dans le magasin — une autre session, un autre
     outil. Le bloc doit s'en apercevoir. */
  const chemin = path.join(magasin, `${id}.fh-char.json`);
  const dehors = JSON.parse(fs.readFileSync(chemin, "utf8"));
  dehors.name = "Écrit par quelqu'un d'autre";
  fs.writeFileSync(chemin, JSON.stringify(dehors, null, 2) + "\n");

  /* ⚠️ LE REFUS EST UN RÉSULTAT, PAS UN PLANTAGE : l'IA le lit et le corrige.
     C'est toute la différence entre un serveur utilisable et un serveur qui
     s'arrête. */
  const refus = client.call("doc.save", {});
  assert.equal(refus.isError, true);
  assert.match(refus.content[0].text, /a changé dans le magasin|ne l'a pas lu/,
    "le refus DIT ce qui s'est passé");

  /* Et il est résoluble sans quitter la surface : `doc.list` rend l'empreinte
     à déclarer, `expect` l'accepte. Un refus dont on ne peut pas sortir par
     les outils serait une impasse — le pire des deux mondes. */
  const trouvee = client.ok("doc.list").find((entry) => entry.id === id).hash;
  const force = client.ok("doc.save", { expect: trouvee });
  assert.equal(force.replaced, true, "l'écrasement délibéré a été fait, et il est déclaré");
});

test("`doc.save` SANS PERSONNAGE OUVERT REFUSE — il n'écrit pas un fichier vide", () => {
  /* Une surface neuve, sans rien d'ouvert. Le refus doit nommer le geste
     manquant, pas rendre un succès sur un document qui n'existe pas. */
  const neuve = makeClient(createMcp({
    dispatch: () => { throw new Error("le noyau ne doit PAS être atteint : le refus est en amont."); },
    serverInfo: { name: "fhpc", version: "0.0.0-test" },
    blocks: ["layers", "build", "doc"]
  }));
  const reponse = neuve.request("tools/call", { name: "doc.save", arguments: {} });
  assert.equal(reponse.error.code, CODES.invalidParams);
  assert.match(reponse.error.message, /Aucun personnage ouvert/);
});

/* ── L'EXIGENCE N°3 : UN SERVEUR SANS MAGASIN NE MENT PAS ────────────── */

function sansMagasin() {
  return createMcp({
    dispatch: () => { throw new Error("aucun verbe ne doit être atteint dans ces scénarios."); },
    serverInfo: { name: "fhpc", version: "0.0.0-test" },
    blocks: ["layers", "build"]
  });
}

test("SANS MAGASIN, LE CATALOGUE NE PROMET RIEN — les outils doc.* ne sont pas publiés", () => {
  const nu = makeClient(sansMagasin());
  const publies = nu.request("tools/list").result.tools.map((tool) => tool.name);

  for (const nom of ["doc.open", "doc.save", "doc.list"]) {
    assert.equal(publies.includes(nom), false, `« ${nom} » n'est pas publié par un serveur sans magasin`);
  }
  /* LE PENDANT, sans lequel le test ci-dessus passerait sur un catalogue
     vide : tout le reste est bien là. */
  for (const nom of ["layers.register", "build.rebuild", "mcp.document"]) {
    assert.equal(publies.includes(nom), true, `« ${nom} » reste publié`);
  }

  /* Et les instructions du serveur DISENT la même chose que son catalogue.
     Deux descriptions du même serveur qui divergeraient, c'est la faute que
     ce dépôt a mesurée deux fois. */
  const instructions = nu.request("server/discover").result.instructions;
  assert.match(instructions, /n'a PAS de magasin/);
  assert.equal(/doc\.save/.test(instructions), false);
});

test("SANS MAGASIN, APPELER `doc.save` DONNE LE BON DIAGNOSTIC — pas « unknown tool »", () => {
  const nu = makeClient(sansMagasin());
  const reponse = nu.request("tools/call", { name: "doc.save", arguments: {} });

  assert.equal(reponse.error.code, CODES.invalidParams);
  /* ⚠️ LA DISTINCTION QUI COMPTE. « Unknown tool » enverrait une IA chercher
     une faute de frappe dans un nom parfaitement correct. Le refus doit dire
     que l'outil EXISTE et que la CAPACITÉ manque — deux gestes différents. */
  assert.match(reponse.error.message, /existe, mais le bloc « doc » n'est pas monté/);
  assert.equal(/Unknown tool/.test(reponse.error.message), false);

  /* Et un vrai nom inconnu garde son vrai diagnostic : la distinction n'est
     pas décorative, elle sépare bien deux cas. */
  const faute = nu.request("tools/call", { name: "doc.sav", arguments: {} });
  assert.match(faute.error.message, /Unknown tool/);
});

test("AVEC MAGASIN, LES INSTRUCTIONS ET LE CATALOGUE S'ACCORDENT AUSSI", () => {
  const instructions = client.request("server/discover").result.instructions;
  assert.match(instructions, /magasin local/);
  assert.match(instructions, /doc\.save/);

  const publies = client.request("tools/list").result.tools.map((tool) => tool.name);
  for (const nom of ["doc.open", "doc.save", "doc.list"]) {
    assert.equal(publies.includes(nom), true, `« ${nom} » est publié`);
  }
  /* Le catalogue publié est un SOUS-ENSEMBLE de celui du dépôt, jamais autre
     chose : aucun outil n'est inventé à la volée. */
  const connus = new Set(TOOLS.map((tool) => tool.name));
  for (const nom of publies) assert.equal(connus.has(nom), true, `« ${nom} » vient bien du catalogue du dépôt`);
});
