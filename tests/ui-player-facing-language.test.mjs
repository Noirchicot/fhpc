/* ══ LOT 55, §2.3 — LE GARDE CONTRE LE LANGAGE DE CHANTIER, POSÉ AILLEURS
   QUE `tests/guards-adversarial.test.mjs` (le lot 56 y écrit en ce moment).

   ⭐ CE GARDE EST NÉ D'UN AUTRE GARDE QUI A RATÉ. L'architecte a écrit un
   scan des chaînes visibles de `ui/` juste après avoir corrigé §2.2
   (`universe-step.mjs` citait `INVENTAIRE-LOT-54.md`, un document interne,
   dans une phrase montrée au joueur). Ce scan cherchait `LOT-`, `.md`,
   `TODO`, `FIXME`, `placeholder`. Il n'a PAS vu §2.1 (`abilities-step.mjs`,
   « Method "standard" isn't built by this screen yet — showing Roll…
   instead. ») parce que cette phrase ne contient AUCUN de ces mots. Trouvée
   « deux écrans plus loin, à l'œil » (commande, §2.3).

   LA LEÇON QUE CE FICHIER EXISTE POUR TENIR : un garde de vocabulaire ne
   voit QUE les formes qu'on lui a nommées — le prochain « n'est pas encore
   câblé ici » écrit avec des mots différents lui échappera tout autant. Ce
   n'est pas un défaut de CE garde-ci en particulier, c'est la nature d'un
   garde de mots-clefs : il attrape des FORMES, pas une INTENTION. La liste
   ci-dessous est donc délibérément documentée avec ce qu'elle NE voit pas —
   pour que le prochain lot qui la lit sache où elle s'arrête, plutôt que de
   la croire plus large qu'elle n'est (même discipline que les gardes posés
   dans la nuit du 13 au 14 août, voir §0 de la commande de ce lot).

   ⚠️ CE QUI EST DÉLIBÉRÉMENT EXCLU DE LA LISTE : `placeholder`. C'est un mot
   du VOCABULAIRE TECHNIQUE légitime de ce dépôt — une classe CSS
   (`el("p", "placeholder", …)`, `shell.mjs`/`skills-step.mjs`) et un
   attribut de champ de recherche (`equipment-step.mjs`, `searchField`) —
   AUCUN des deux n'est un aveu de chantier. Le garde de l'architecte le
   cherchait ; mesuré ici (grep sur `ui/builder/*.mjs`, texte brut) : il
   aurait crié au loup des dizaines de fois sur du code sain. Un garde qui
   crie au loup se fait désactiver (loi déjà écrite dans
   `tests/source-scan.mjs`) — omis donc, à dessein, pas par oubli. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments, walkSources } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI_DIR = path.join(ROOT, "ui", "builder");

/* ══ LE VOCABULAIRE INTERDIT — chacun avec la forme EXACTE qui l'a fait
   entrer dans la liste. Ancré large (`\b…\b` ou expression complète) plutôt
   que sur un mot isolé façon `placeholder`, précisément pour éviter le piège
   ci-dessus : chaque motif vise une TOURNURE de chantier, jamais un simple
   terme technique qui aurait un second sens légitime.

   MESURÉ AVANT DE POSER (comme l'exige `source-scan.mjs`) : zéro occurrence
   dans le texte DÉPOUILLÉ (commentaires retirés) de `ui/builder/*.mjs`
   aujourd'hui — donc aucune de ces lignes ne peut crier au loup sur le code
   existant. */
export const CHANTIER_LANGUAGE = [
  [/isn.t built/i, "« isn't built » — §2.1, le défaut d'origine"],
  [/\bnot built\b/i, "« not built » — la même forme, sans contraction"],
  [/\bnot yet implemented\b/i, "« not yet implemented »"],
  [/\bnot implemented yet\b/i, "« not implemented yet »"],
  [/\bunder construction\b/i, "« under construction »"],
  [/\bcoming soon\b/i, "« coming soon »"],
  [/\bwork in progress\b/i, "« work in progress »"],
  [/\bthis screen (doesn.t|does not|isn.t)\b/i, "« this screen doesn't/isn't… » — l'écran qui parle de lui-même"],
  [/\bchantier\b/i, "« chantier », le mot français du dépôt lui-même"],
  [/\btodo\b/i, "« TODO »"],
  [/\bfixme\b/i, "« FIXME »"],
  [/\bWIP\b/, "« WIP » (sensible à la casse : pas de faux positif sur un mot ordinaire)"]
];

/* ⚠️ CE QUE CETTE LISTE NE VOIT TOUJOURS PAS, ET C'EST DIT PLUTÔT QUE MASQUÉ
   (même discipline que `HOUSE_MECHANICS` dans `source-scan.mjs`) :

     - une phrase de chantier qui n'emploie AUCUN de ces mots — exactement le
       défaut de §2.1, qui a échappé au garde précédent PARCE QU'aucun de ses
       cinq motifs n'y figurait. Celui-ci EST dans la liste maintenant (la
       forme exacte, ci-dessus) ; la PROCHAINE tournure inédite lui échappera
       pareil, jusqu'à ce qu'elle soit trouvée à l'œil et ajoutée ici ;
     - un texte français équivalent (« pas encore construit », « en cours de
       développement ») — ce dépôt écrit ses écrans en anglais (arbitrage
       d'Eric, voir `shell.mjs` en tête), donc non couvert ici par choix, pas
       par oubli ;
     - toute forme scindée par de la concaténation ou de l'interpolation sur
       plusieurs lignes que la regex ne recoud pas — comme `HOUSE_MECHANICS`
       le documente déjà pour `destinydie` en un seul mot. */

function scanUi() {
  const files = walkSources(UI_DIR);
  const hits = [];
  for (const file of files) {
    const text = stripComments(fs.readFileSync(file, "utf8"));
    for (const [pattern, label] of CHANTIER_LANGUAGE) {
      const found = text.match(pattern);
      if (found) hits.push({ file: path.relative(ROOT, file), label, match: found[0] });
    }
  }
  return hits;
}

test("aucun langage de chantier visible dans ui/builder/ — le joueur ne lit jamais ce qui est construit ou non", () => {
  const files = walkSources(UI_DIR);
  assert.ok(files.length > 5, "témoin : le balayage a bien trouvé les fichiers du builder");
  const hits = scanUi();
  assert.deepEqual(hits, [], `langage de chantier trouvé : ${hits.map((h) => `${h.file} — ${h.label} (« ${h.match} »)`).join(" ; ")}`);
});

/* ══ TÉMOIN NÉGATIF — LA COMMANDE ELLE-MÊME DIT QUE LE COMMENTAIRE QUI CITE
   §2.1 (juste au-dessus de la correction, dans `abilities-step.mjs`) NE DOIT
   PAS FAIRE MORDRE LE GARDE : il cite la phrase fautive ENTRE GUILLEMETS,
   dans un commentaire, exactement comme `INVENTAIRE-LOT-54.md` reste cité
   légitimement dans le commentaire d'`universe-step.mjs` (§2.2). C'est LA
   PARTIE DIFFICILE de ce garde (commande, §2.3, dernier tiret) — vérifiée
   ici sur le fichier RÉEL, pas sur un texte fabriqué. */
test("témoin — le commentaire d'abilities-step.mjs qui CITE la phrase fautive ne fait PAS mordre le garde", () => {
  const raw = fs.readFileSync(path.join(UI_DIR, "abilities-step.mjs"), "utf8");
  assert.match(raw, /isn.t built by this screen yet/,
    "témoin : le fichier réel cite bien la phrase fautive, dans son commentaire de correction");
  const hits = scanUi().filter((h) => h.file.endsWith("abilities-step.mjs"));
  assert.deepEqual(hits, [], "la citation vit dans un COMMENTAIRE — stripComments() doit l'effacer avant le test");
});

/* ══ ⚔️ L'ATTAQUE — le garde doit MORDRE sur une chaîne VISIBLE (hors
   commentaire), et NE PAS mordre quand la même chaîne n'est QUE citée dans
   un commentaire. Les deux moitiés de l'attaque, jouées sur un texte
   fabriqué (jamais sur le dépôt réel) pour ne rien laisser derrière. */
test("⚔️ ATTAQUE — une chaîne de chantier VISIBLE (pas un commentaire) fait mordre le garde", () => {
  const fake = `
    function el(tag, className, children) { /* … */ }
    export function renderSomeStep() {
      return el("p", "note", [document.createTextNode(
        "Method \\"custom\\" isn't built by this screen yet — showing Roll instead."
      )]);
    }
  `;
  const stripped = stripComments(fake);
  const hits = CHANTIER_LANGUAGE.filter(([pattern]) => pattern.test(stripped));
  assert.ok(hits.length > 0, "l'attaque doit être VUE — au moins un motif doit mordre sur la chaîne visible");
});

test("⚔️ ATTAQUE (témoin de retenue) — LA MÊME chaîne, mais UNIQUEMENT dans un commentaire, ne fait PAS mordre le garde", () => {
  const fake = `
    /* Ancienne phrase, retirée le 2026-08-14 : "Method X isn't built by this
       screen yet — showing Roll instead." Voir INVENTAIRE-LOT-45.md. */
    export function renderSomeStep() {
      return null;
    }
  `;
  const stripped = stripComments(fake);
  const hits = CHANTIER_LANGUAGE.filter(([pattern]) => pattern.test(stripped));
  assert.deepEqual(hits, [], "un commentaire qui NOMME l'ancienne faute pour l'historique ne doit pas rendre le garde aveugle ni criard");
});

/* ══ §2.1 — LE FIL DIRECT : la phrase RÉELLEMENT écrite aujourd'hui dans
   `abilities-step.mjs` (visible, hors commentaire) ne contient AUCUNE des
   formes interdites — la correction elle-même est la preuve la plus directe
   que §2.1 est réglé, indépendamment du scan général ci-dessus. */
test("§2.1 — la note de repli d'Abilities ne porte plus AUCUN mot de la liste interdite", () => {
  const raw = fs.readFileSync(path.join(UI_DIR, "abilities-step.mjs"), "utf8");
  const noteLine = raw.split("\n").find((line) => line.includes("isn't offered on this screen"));
  assert.ok(noteLine, "témoin : la nouvelle phrase existe bien, telle qu'écrite au §2.1 de ce lot");
  for (const [pattern, label] of CHANTIER_LANGUAGE) {
    assert.doesNotMatch(noteLine, pattern, `la nouvelle phrase mord encore sur ${label}`);
  }
});
