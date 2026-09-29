/* ══ LOT 350 — LE PREMIER PAS : « New character » FAIT NAÎTRE un personnage ════

   ⚖️ Eric, 29/09 (dictée du Menu, `FH-WEB/FHPC/FHPCv2 arborescence d'entree`) :
   *« tout reste dans le navigateur tant que tu n'as pas fait New character. Un
   prompt apparaît dans New disant que si tu veux garder l'existant il faut
   sauvegarder, deux choix : Delete · Save. Puis on arrive directement dans le 1 du
   processus de création. Les réglages du nouveau perso sont ceux des Layers en
   place. »* Puis : *« Cancel aussi »* · trois avertissements (Layers · Vault · le
   perso effacé) · `Save` écrit dans le stockage choisi, ou un fichier · sans perso
   en cours, **`Cancel · Start`** (ratifié).

   🗄️ CE QUE CE FICHIER GARDAIT JUSQU'AU LOT 349 (lot 193, Eric, 10/09) : `Build a
   character` sauvegardait, repartait à zéro, puis posait le popup « SRD or Fate's
   Hand? » (`creerUnPersonnage`, `popupDuJeu`, `choisirLeJeu`). ⛔ Il meurt : *« les
   réglages du nouveau perso sont ceux des Layers en place »* — plus de question.
   ⭐ Les gardes qui le tenaient sont RÉÉCRITS À LA NOUVELLE VÉRITÉ, pas relâchés :
   la règle du 192 (un Save refusé n'efface rien), l'attente d'une promesse, un seul
   organe d'écriture, un seul organe de remise à zéro, l'étape 1 trouvée par son id.

   🔴 CE QUE CE FICHIER GARDE, ET SUR QUOI :
     A. la SÉQUENCE pure (`nouveauPersonnageSelonLaVoie`) — Save d'abord, PUIS la
        naissance ; un Save refusé n'efface rien ; `Delete` oublie PUIS fait naître ;
        `Start` ne range rien ; `Cancel` ne fait rien. C'est l'ordre qui est la règle.
     B. la FENÊTRE pure (`popupNouveauPersonnage`) — ses voies selon qu'il y a un perso
        en cours, ses trois avertissements, son rôle ; et `personnageEnCours`.
     C. le NOM d'un personnage sans nom — le mot d'Eric, celui de la naissance.
     D. ⚔️ LE MANIFESTE, CONFRONTÉ À CELUI QUE `rebuild` ADOPTE sur la VRAIE
        pile : deux écrivains de la même forme, et c'est ici qu'un troisième
        champ de `$defs/layerRef` se ferait voir.
     E. les OCTETS de la coquille — elle câble la séquence, le même organe que
        `Save`, et la naissance qui ouvre l'étape 1.
     F. `composer` (src/doc/writers.mjs) — l'écrivain qui fait NAÎTRE le
        document, le même que `doc.create`, appelable sans magasin.
     G. le carnet d'un personnage neuf, garni dès la naissance.

   ⚠️ ON TESTE LA FONCTION, PAS LA PAGE : la géométrie se regarde au
   navigateur, ce fichier garde le RAISONNEMENT et le CÂBLAGE. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { acceptanceDocument, makeHarness, manifestOf, readJson, PILE_SRD } from "./build-harness.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

globalThis.document = createTestDocument();

const { renderUniverseStep, nouveauPersonnageSelonLaVoie, popupNouveauPersonnage, personnageEnCours, ceQuiFaitLePersonnage,
  MOTS_DU_NOUVEAU_PERSONNAGE, NOM_DU_PERSONNAGE_NEUF } = await import("../ui/builder/universe-step.mjs");
const { canonicalText } = await import("../src/doc/canonical.mjs");
const { manifesteDeLaPile } = await import("../ui/builder/layers-ecran.mjs");
const { createDocWriters, CHOIX_DE_NAISSANCE } = await import("../src/doc/writers.mjs");

/** Le journal des gestes — c'est l'ORDRE qu'on mesure, pas seulement le fait
 *  que chacun ait eu lieu. Un jeu de gestes qui s'exécutent tous dans le
 *  mauvais ordre passerait un test qui compte, et perdrait le personnage. */
function journal(saveRend) {
  const vus = [];
  return {
    vus,
    gestes: {
      sauvegarder: () => { vus.push("sauvegarder"); return saveRend; },
      oublier: () => { vus.push("oublier"); },
      naitre: () => { vus.push("naitre"); }
    }
  };
}

/* ══ A — LA SÉQUENCE PURE ══════════════════════════════════════════════════ */

test("A1 — 🔴 `Save` : Save UNE fois, PUIS la naissance — jamais l'inverse", async () => {
  const j = journal(true);
  const ne = await nouveauPersonnageSelonLaVoie({ voie: "save", ...j.gestes });
  assert.equal(ne, true, "le personnage neuf est né");
  assert.deepEqual(j.vus, ["sauvegarder", "naitre"],
    "⛔ inverser Save et naissance sauvegarderait le personnage vide qu'on vient de fabriquer");
});

test("A2 — ⚔️ SAVE REFUSÉ : rien ne bouge — ni oubli, ni naissance (la règle du 192)", async () => {
  /* ⚖️ Eric, 10/09 : *« téléchargement bloqué = pas de reset »*, et le 29/09 le
     `Save` de la fenêtre écrit dans le stockage choisi. Le refus est déjà dit par la
     porte (`porteEnPanne`) ; ce que ce garde tient, c'est que le personnage du
     joueur est TOUJOURS LÀ. */
  const j = journal(false);
  const ne = await nouveauPersonnageSelonLaVoie({ voie: "save", ...j.gestes });
  assert.equal(ne, false);
  assert.deepEqual(j.vus, ["sauvegarder"], "le document n'est pas remplacé");
});

test("A3 — ⚔️ UN SAVE QUI REND AUTRE CHOSE QUE `true` EST UN REFUS — une promesse aussi", async () => {
  /* Une absence n'est jamais une réponse : `undefined` (une porte qui se tait)
     n'autorise pas plus l'effacement qu'un `false` franc. */
  for (const rendu of [undefined, null, 0, "", "true", 1]) {
    const j = journal(rendu);
    assert.equal(await nouveauPersonnageSelonLaVoie({ voie: "save", ...j.gestes }), false, `rendu ${JSON.stringify(rendu)}`);
    assert.deepEqual(j.vus, ["sauvegarder"]);
  }
  /* ⚔️ LOT 195 — ET UNE PROMESSE NON TENUE EST UN REFUS. La séquence attend
     (le magasin range en différé) : un `await` oublié ferait de TOUTE promesse —
     y compris `Promise.resolve(false)` — un accord, et le personnage du joueur
     serait effacé sur un objet toujours vrai. */
  for (const rendu of [false, undefined, null]) {
    const j = journal(rendu);
    const gestes = { ...j.gestes, sauvegarder: async () => { j.vus.push("sauvegarder"); return rendu; } };
    assert.equal(await nouveauPersonnageSelonLaVoie({ voie: "save", ...gestes }), false, `promesse de ${JSON.stringify(rendu)}`);
    assert.deepEqual(j.vus, ["sauvegarder"], "⛔ une promesse n'est pas un accord");
  }
});

test("A4 — 🔴 `Start` (SANS PERSONNAGE) : ni Save ni oubli — la naissance seule", async () => {
  const j = journal(true);
  assert.equal(await nouveauPersonnageSelonLaVoie({ voie: "start", ...j.gestes }), true);
  assert.deepEqual(j.vus, ["naitre"],
    "écrire un fichier de rien serait un téléchargement que personne n'a demandé");
});

test("A5 — 🔴 `Delete` : la copie du navigateur est oubliée, PUIS la naissance — et jamais un Save", async () => {
  /* ⚖️ Eric, 29/09 : *« Forget »* devient le `Delete` de la fenêtre, et il efface
     *« dans le navigateur »*. ⛔ Oublier APRÈS la naissance oublierait le perso neuf. */
  const j = journal(true);
  assert.equal(await nouveauPersonnageSelonLaVoie({ voie: "delete", ...j.gestes }), true);
  assert.deepEqual(j.vus, ["oublier", "naitre"]);
});

test("A6 — ⛔ `Cancel` NE FAIT RIEN — et une voie inconnue non plus", async () => {
  for (const voie of ["cancel", "", "reset", undefined]) {
    const j = journal(true);
    assert.equal(await nouveauPersonnageSelonLaVoie({ voie, ...j.gestes }), false, `voie ${JSON.stringify(voie)}`);
    assert.deepEqual(j.vus, [], "⛔ aucun geste : ni Save, ni oubli, ni naissance");
  }
});

/* ══ B — LA FENÊTRE ════════════════════════════════════════════════════════ */

test("B1 — ⚖️ LES VOIES SONT CELLES D'ERIC : `Cancel · Delete · Save` avec un perso, `Cancel · Start` sans", () => {
  /* *« Cancel aussi »* (29/09), puis la correction d'ARCHI 35, RATIFIÉE : sans perso
     en cours, `Delete` et `Save` n'ont rien à effacer ni à sauver — il ne restait que
     `Cancel` et aucun chemin vers l'étape 1. */
  assert.deepEqual(popupNouveauPersonnage({ enCours: true, choisir: () => {} }).actions.map((a) => a.mot),
    ["Cancel", "Delete", "Save"]);
  assert.deepEqual(popupNouveauPersonnage({ enCours: false, choisir: () => {} }).actions.map((a) => a.mot),
    ["Cancel", "Start"]);
});

test("B2 — 🔴 CHAQUE VOIE ÉMET SON NOM — la fenêtre ne sait pas ce qu'il fait", () => {
  for (const [enCours, attendu] of [[true, ["cancel", "delete", "save"]], [false, ["cancel", "start"]]]) {
    const voies = [];
    const popup = popupNouveauPersonnage({ enCours, choisir: (v) => voies.push(v) });
    for (const action of popup.actions) action.faire();
    assert.deepEqual(voies, attendu);
  }
});

test("B3 — 🗣️ TROIS AVERTISSEMENTS, DANS L'ORDRE D'ERIC — et le troisième seulement s'il y a un perso", () => {
  const [layers, vault, efface] = MOTS_DU_NOUVEAU_PERSONNAGE.avertissements;
  assert.match(layers, /Layers/, "① régler les Layers avant");
  assert.match(vault, /Vault/, "② choisir son stockage dans Vault");
  assert.match(efface, /erased/, "③ le perso en cours sera effacé");
  const avec = popupNouveauPersonnage({ enCours: true, choisir: () => {} });
  assert.deepEqual(avec.texte.split("\n"), [layers, vault, efface], "une ligne par avertissement — `paintPopup` en fait trois paragraphes");
  const sans = popupNouveauPersonnage({ enCours: false, choisir: () => {} });
  assert.deepEqual(sans.texte.split("\n"), [layers, vault],
    "*« ses avertissements Layers et Vault servent au premier perso »* — rien à effacer, rien à dire");
  assert.equal(avec.titre, MOTS_DU_NOUVEAU_PERSONNAGE.titre);
  /* ⚖️ LE LEXIQUE DU 10/09 : ⛔ ni « couche », ni « homebrew », ni « layer » dans un
     mot de joueur. ⚠️ `Layers` et `Vault` avec leur majuscule sont des NOMS D'ÉCRANS :
     on les RETIRE avant de mesurer. */
  const sansLesLieux = avec.texte.split("Layers").join("").split("Vault").join("");
  assert.doesNotMatch(sansLesLieux, /\b(layer|layers|couche|couches|homebrew)\b/i);
  /* ⛔ *« Liens Layers / Vault dans le prompt → non, ça fait trop de liens »* (29/09). */
  assert.equal(avec.actions.some((a) => /Layers|Vault/.test(a.mot)), false, "⛔ aucune voie ne mène à Layers ni à Vault");
});

test("B4 — ⛔ LA FENÊTRE PRÉVIENT, ELLE NE CONDAMNE PAS : rôle `guide`, `Delete` seul en rouge, pas de réponse exigée", () => {
  const popup = popupNouveauPersonnage({ enCours: true, choisir: () => {} });
  assert.equal(popup.role, "guide", "§7 : le gendarme DIT L'ERREUR — ici rien n'est une erreur");
  assert.deepEqual(popup.actions.map((a) => a.defait), [false, true, false], "`Delete` DÉFAIT, donc le rouge de ce qui coûte ; ⛔ ni Cancel ni Save");
  /* ⭐ ELLE N'EXIGE PAS DE RÉPONSE, et c'est la différence avec le popup du 193 : lui
     repartait à zéro AVANT de poser sa question, donc une question esquivée laissait
     un document à moitié né. Ici rien ne bouge avant qu'on choisisse — fermer d'un tap
     dehors vaut `Cancel`. */
  assert.equal("exigeUneReponse" in popup, false, "⛔ rien n'est engagé avant la réponse : on peut la fermer");
});

test("B5 — 🔴 « PAS DE PERSO EN COURS », C'EST L'EXEMPLE COMMITÉ — hors ce que la dérivation estampille", () => {
  /* 📏 Le navigateur n'est jamais vide : le démarrage retombe sur l'exemple, et
     `memoriser()` l'écrit dès le premier rendu. La mémoire ne dit donc rien ; le TEXTE
     de ce qui fait le personnage, si.
     ⚠️ CE GARDE A D'ABORD DIT LE CONTRAIRE, ET LE BANC L'A CORRIGÉ. Il affirmait que le
     `rebuild` du démarrage ne change pas une lettre de l'exemple, et il comparait les
     textes entiers. 📏 Mesuré au navigateur le 29/09 (visiteur neuf, stockage vidé) : la
     fenêtre offrait `Cancel · Delete · Save`, parce que la dérivation ESTAMPILLE
     `modified` et `resolved.derivation.at` à l'heure du démarrage — et rien d'autre. Le
     témoin ci-dessous rejoue exactement cette estampille. */
  const exemple = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "personnage-fh-en-niveau1.fh-char.json"), "utf8"));
  const texte = (doc) => canonicalText(ceQuiFaitLePersonnage(doc));
  const redemarre = structuredClone(exemple);
  redemarre.modified = "2026-09-29T03:18:36.003Z";
  redemarre.resolved.derivation.at = "2026-09-29T03:18:36.003Z";
  assert.notEqual(canonicalText(redemarre), canonicalText(exemple), "témoin : le document ENTIER a bougé — c'est le piège");
  assert.equal(personnageEnCours(texte(redemarre), texte(exemple)), false, "l'exemple re-dérivé n'est le perso de personne");
  assert.equal(personnageEnCours(texte({ ...redemarre, name: "Ilyra" }), texte(exemple)), true, "⚔️ un nom posé, et c'est un perso à soi");
  const choisi = structuredClone(redemarre);
  choisi.build.choices.push({ path: "alignment", value: "Chaotic Good" });
  assert.equal(personnageEnCours(texte(choisi), texte(exemple)), true, "⚔️ un choix de plus, aussi");
  assert.deepEqual(Object.keys(ceQuiFaitLePersonnage(exemple)), Object.keys(exemple).filter((k) => k !== "modified" && k !== "resolved"),
    "⛔ seuls les deux champs que la dérivation estampille sont retirés — `id`, `created`, `build` disent QUI il est");
  assert.equal(personnageEnCours(null, texte(exemple)), false, "pas de document, rien à effacer");
  assert.equal(personnageEnCours("{}", null), true,
    "⛔ un exemple non chargé ne promet rien : le perso est tenu pour « en cours », et rien ne s'efface sans choix");
});

/* ══ C — LE NOM D'UN PERSONNAGE SANS NOM ═══════════════════════════════════ */

test("C1 — 🔴 LE MOT DE LA NAISSANCE EST CELUI D'ERIC — et le Menu ne le répète plus", () => {
  /* `fh-char/1` exige `name.minLength: 1` — un personnage neuf ne peut pas
     naître sans nom. */
  assert.equal(NOM_DU_PERSONNAGE_NEUF.length > 0, true, "le schéma refuse une chaîne vide");
  /* ⚖️ ET LE MOT EST CELUI D'ERIC — 2026-09-10, en entier : *« "Name
     character" »*. ⛔ Il est écrit ICI, une fois, parce qu'une cote DONNÉE ne
     se laisse pas remplacer par un défaut déduit : `Unnamed character` était
     le mien, faute de son mot, et rien n'aurait rougi s'il revenait.
     ⭐ Le changement de mot est aussi un changement de VOIX : l'ancien
     DÉCRIVAIT un état, celui-ci DEMANDE un geste. */
  assert.equal(NOM_DU_PERSONNAGE_NEUF, "Name character",
    "le mot d'Eric, 10/09 — un défaut déduit ne le remplace pas en silence");
  /* 🔄 LOT 350 — SON SECOND LECTEUR EST PARTI : la ligne d'état de R (« in browser :
     <nom> · saved ») est retirée par Eric le 29/09. ⚔️ Elle ne revient pas en douce. */
  const doc = {
    schema: "fh-char/1", id: "premier-pas", name: "   ", lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-10T00:00:00Z", modified: "2026-09-10T00:00:00Z",
    build: { layers: [], choices: [], budgets: {}, overrides: [] }
  };
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  assert.equal(node.querySelectorAll(".tdc-etat, .tdc-nom").length, 0, "⛔ la ligne d'état ne revient pas");
  assert.equal(node.textContent.includes(NOM_DU_PERSONNAGE_NEUF), false, "…et R ne répète pas le nom du perso");
});

/* ══ D — ⚔️ LE MANIFESTE, CONFRONTÉ À CELUI QUE `rebuild` ADOPTE ═══════════ */

test("D1 — ⚔️ le manifeste du navigateur est CELUI que `rebuild` écrit, sur la vraie pile", () => {
  /* 🔴 POURQUOI DEUX ÉCRIVAINS EXISTENT : `rebuild` n'adopte la pile QUE quand
     il réussit à dériver, et un personnage NEUF ne dérive pas (pas de classe).
     Le navigateur doit donc savoir DÉCLARER la pile lui-même. Ce garde est ce
     qui empêche les deux de diverger — le bloc `build` compare
     `id@version#hash` et JETTE au moindre écart. */
  const h = makeHarness();                     // la pile du harnais : SRD fr + la couche d'exemple
  const doc = acceptanceDocument(h.layers);
  doc.build.layers = [];                       // « jamais construit » : `rebuild` adopte
  const out = h.verbs.rebuild({ document: doc });
  assert.deepEqual(manifesteDeLaPile(h.layers.verbs.stack()), out.document.build.layers,
    "⛔ un champ de plus dans `$defs/layerRef` se voit ICI, pas dans la fiche d'un joueur");
  assert.deepEqual(manifesteDeLaPile(h.layers.verbs.stack()), manifestOf(h.layers),
    "…et c'est aussi la forme du générateur d'exemple");
});

test("D2 — ⚔️ une couche ÉTEINTE n'entre pas au manifeste, et `name` n'est posé que s'il existe", () => {
  const pile = [
    { id: "a", version: "1.0.0", hash: "a".repeat(64), name: "A", enabled: true },
    { id: "b", version: "2.0.0", hash: "b".repeat(64), name: "B", enabled: false },
    { id: "c", version: "3.0.0", hash: "c".repeat(64), enabled: true }
  ];
  assert.deepEqual(manifesteDeLaPile(pile), [
    { id: "a", version: "1.0.0", hash: "a".repeat(64), name: "A" },
    { id: "c", version: "3.0.0", hash: "c".repeat(64) }
  ]);
  assert.equal("name" in manifesteDeLaPile(pile)[1], false, "⛔ jamais une clef posée à vide");
  assert.deepEqual(manifesteDeLaPile(null), [], "une pile absente n'est pas une pile inventée");
});

/* ══ E — LES OCTETS DE LA COQUILLE ═════════════════════════════════════════ */

const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));

/** Le corps d'une voie, de son `action.kind` à celui qui suit. */
function voie(kind) {
  const debut = shell.indexOf(`action.kind === "${kind}"`);
  assert.ok(debut >= 0, `la voie \`${kind}\` existe`);
  const fin = shell.indexOf("if (action.kind === ", debut + 1);
  return shell.slice(debut, fin < 0 ? undefined : fin);
}

/** Le geste `naitre` de la voie `nouveauPersonnage`, jusqu'à la fin de la séquence. */
function naissance() {
  const debut = shell.indexOf("naitre: () => {");
  assert.ok(debut >= 0, "le geste `naitre` existe");
  return shell.slice(debut, shell.indexOf("}).then(", debut));
}

test("E1 — 🔌 `nouveauPersonnage` passe par la SÉQUENCE pure, et `Save` par le MÊME organe que Sheet", () => {
  assert.match(voie("nouveauPersonnage"), /nouveauPersonnageSelonLaVoie\(\{\s*voie: action\.voie,/,
    "le verbe de la fenêtre appelle la séquence gardée, il ne réécrit pas l'ordre");
  assert.match(shell, /sauvegarder: \(\) => exporterJson\(\{ quoi: "New character" \}\)/,
    "⛔ jamais un second chemin d'écriture : `exporterJson` rend true/false depuis le 192 — et son refus NOMME la porte poussée");
  /* ⚖️ LOT 350 — LE MOT PAR DÉFAUT EST CELUI DU BOUTON DE SHEET : *« Sheet reçoit
     Save character »* (Eric, 29/09). Sheet l'appelle sans `quoi`, donc c'est lui
     que son refus nomme. */
  assert.match(shell, /function exporterJson\(\{ version, quoi = "Save character" \} = \{\}\)/,
    "…par défaut, le refus nomme le bouton que le joueur a pressé dans Sheet");
  assert.doesNotMatch(shell, /porteEnPanne\("(Export JSON|Save character)"/,
    "⛔ le nom de la porte ne s'écrit plus en dur dans le corps : il vient de l'appelant");
  /* 🗑️ `Delete` : l'organe de `memoire.mjs`, celui de l'ancien `Forget` — pas un
     `removeItem` écrit dans la coquille. */
  assert.match(shell, /oublier: \(\) => \{ oublierPersonnage\(\); \}/);
  assert.doesNotMatch(shell, /localStorage\.removeItem|\.removeItem\(/, "⛔ la clef du navigateur n'a qu'un écrivain");
  assert.match(naissance(), /^naitre: \(\) => \{\s*state\.document = personnageNeuf\(precedent\);/,
    "« repartir à zéro » est un document NEUF, pas des champs vidés un par un");
  /* La fenêtre est celle de l'écran, pas une boîte écrite dans la coquille — et
     « perso en cours » se MESURE sur le texte, il ne se devine pas. */
  assert.match(voie("ouvrirNouveauPersonnage"),
    /state\.popup = popupNouveauPersonnage\(\{\s*enCours: personnageEnCours\(state\.document \? canonicalText\(ceQuiFaitLePersonnage\(state\.document\)\) : null, texteDeLExemple\),/);
  assert.match(shell, /texteDeLExemple = canonicalText\(ceQuiFaitLePersonnage\(exemple\)\);/,
    "la référence est l'exemple du démarrage, par le MÊME écrivain de texte ET le même tri (B5)");
  /* ⛔ JAMAIS LE `confirm()` DU NAVIGATEUR. ⚠️ Et le garde mesure la FORME
     D'EMPLOI, pas le mot : `state.docWriters.confirm({…})` est le verbe du bloc
     `doc`, il porte le même mot et n'a rien à voir. Le `confirm(` du navigateur
     est celui que RIEN ne précède. */
  assert.doesNotMatch(shell, /(?<![.\w$])confirm\s*\(/, "⛔ jamais le `confirm()` du navigateur");
  assert.match(shell, /state\.docWriters\.confirm\(/, "témoin : le verbe homonyme du bloc `doc` est bien là, et il ne rougit pas");
});

test("E2 — 🔌 LA NAISSANCE, DANS L'ORDRE : document neuf · écran à zéro · étape 1 · carnet · pile déclarée", () => {
  assert.match(naissance(),
    /state\.document = personnageNeuf\(precedent\);\s*remettreLEcranAZero\(\);\s*goToStep\(CONCEPT_INDEX\);\s*rebuild\(\);\s*declarerLaPileMontee\(\);\s*\}\s*$/,
    "⛔ déclarer avant `rebuild` serait inutile, remettre à zéro après `goToStep` effacerait le cran");
  assert.match(shell, /function declarerLaPileMontee\(\) \{\s*if \(state\.document\.build\.layers\.length > 0\) return;/,
    "on ne redéclare pas ce que `rebuild` a déjà adopté");
  /* ⚖️ *« Les réglages du nouveau perso sont ceux des Layers en place »* (29/09) :
     la naissance ne TOUCHE PAS à la pile. ⛔ C'est ce que faisait `choisirLeJeu`
     (`applyLayerStack(action.value)`), et c'est ce qu'Eric a retiré. */
  assert.doesNotMatch(naissance(), /applyLayerStack|layersVerbs|enable\(|disable\(/,
    "⛔ la naissance ne règle rien : elle PREND la pile montée");
  assert.doesNotMatch(shell, /"choisirLeJeu"|"construireLePersonnage"/, "⛔ ni la question ni son verbe ne reviennent");
});

test("E6 — ⚖️ `Create character` OUVRE L'ÉTAPE 1 SANS RIEN CRÉER ; la naissance l'ouvre APRÈS la remise à zéro", () => {
  /* ⚖️ Eric, 29/09 : *« Bouton - Create character- (vers Etape 1 du builder) »*.
     ⛔ IL NE CRÉE RIEN : pas de Save, pas de document neuf, pas de remise à zéro.
     C'est ce qui le distingue de `New character`. */
  assert.match(shell, /action\.kind === "ouvrirLaCreation"\) \{ goToStep\(CONCEPT_INDEX\); return; \}/,
    "une ligne : l'organe de l'atterrissage, et rien d'autre");
  /* ⛔ L'ORDRE EST TOUT dans la naissance : la remise à zéro rend le rang R ;
     poser le cran AVANT elle, ce serait l'écrire puis l'effacer. */
  assert.match(naissance(), /remettreLEcranAZero\(\);\s*goToStep\(CONCEPT_INDEX\);/,
    "⛔ le cran s'ouvre APRÈS la remise à zéro, sinon elle l'efface");
  /* ⭐ PAR L'ORGANE, JAMAIS PAR LE CHAMP — le garde D2 du lot 197 tient que
     cette voie ne pose QUE le document ; `goToStep` est le propriétaire de
     l'atterrissage. */
  assert.doesNotMatch(shell, /state\.step = CONCEPT_INDEX/,
    "⛔ écrire le champ à la main rouvrirait la liste par nom (197 · D2)");
  /* 🔴 Trouvé PAR l'id — la loi de `REVIEW_INDEX`. Un `state.step = 1` dirait
     la même chose aujourd'hui et mentirait le jour où un cran s'insère. */
  assert.match(shell, /const CONCEPT_INDEX = STEPS\.findIndex\(\(step\) => step\.id === "concept"\)/,
    "⛔ jamais un index écrit à la main");
  /* ⚔️ DEUX APPELANTS, ET CE SONT LES DEUX GESTES DICTÉS. 🔄 Jusqu'au lot 349 il n'y
     en avait qu'un (`Build a character` faisait les deux) ; Eric les a séparés le
     29/09. ⛔ Un troisième serait un atterrissage que personne n'a dicté. */
  assert.equal((shell.match(/goToStep\(CONCEPT_INDEX\)/g) || []).length, 2,
    "`Create character` et la naissance de `New character` — pas un de plus");
  /* ⚔️ ET OUVRIR UN PERSONNAGE RANGÉ revient au Menu (rang R du magasin). */
  const pose = shell.match(/function poserLeDocumentOuvert\(document\) \{([\s\S]*?)\n\}/);
  assert.ok(pose, "l'organe des deux portes existe");
  assert.doesNotMatch(pose[1], /goToStep\(/,
    "⛔ ouvrir un personnage rangé garde le Menu — c'est son rang R");
});

test("E3 — 🔴 UN SEUL ÉCRIVAIN REMET L'ÉCRAN À ZÉRO — et depuis le 197, il ne l'ÉNUMÈRE plus", () => {
  /* Un organe que N écrans fabriquent est un organe qu'on oublie : la liste
     était écrite dans `ouvrirUnFichier`, et sa propre tête disait déjà le
     piège (« raterait le onzième qu'on ajoutera demain, EN SILENCE »).

     🌱 LOT 197 — ET LE ONZIÈME ÉTAIT DÉJÀ ARRIVÉ QUATORZE FOIS. 📏 Mesuré le
     10/09 sur v620 : `state` portait 41 champs, ce chemin en remettait 18, et
     23 survivaient. ⛔ CE GARDE NE SE DESSERRE PAS — il change d'objet, parce
     que son objet d'avant est devenu le défaut : exiger que la LISTE soit ici
     obligeait à écrire une liste. Il exige maintenant qu'AUCUNE liste ne vive
     dans aucun des trois chemins, et que tous les trois passent par
     `remettreAZero` (`etat-neuf.mjs`), dont le contenu est mesuré sur la
     donnée par `tests/etat-neuf.test.mjs`. */
  const corps = shell.match(/function remettreLEcranAZero\(\) \{([\s\S]*?)\n\}/);
  assert.ok(corps, "la fonction existe");
  assert.match(corps[1], /remettreAZero\(state\);/,
    "elle DÉLÈGUE à la source de l'état neuf — ⛔ elle ne réécrit pas l'ordre");
  assert.deepEqual([...corps[1].matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()), [],
    "⛔ un seul `state.x = …` ici et la liste par nom est de retour, avec son défaut");

  /* ⭐ LOT 195 — L'ORGANE A GAGNÉ UN ÉTAGE, ET LE GARDE AVEC LUI. Le magasin
     avait besoin, MOT POUR MOT, de ce que `ouvrirUnFichier` faisait après avoir
     lu un fichier : `poserLeDocumentOuvert` est né de là. ⛔ Les DEUX portes
     (le fichier du disque, l'entrée du magasin) passent par cet organe, et
     AUCUNE ne pose de champ à la main.
     🔄 LOT 350 — la tranche de `ouvrirUnFichier` s'arrêtait au verbe
     `oublierPersonnage`, parti avec `Forget` : elle s'arrête désormais à la voie
     qui la suit, trouvée par `voie()`. */
  const ouvrir = voie("ouvrirUnFichier");
  assert.match(ouvrir, /poserLeDocumentOuvert\(issue\.document\);/, "l'ouverture d'un fichier RÉEMPLOIE l'organe");
  const entree = voie("ouvrirUneEntree");
  assert.match(entree, /poserLeDocumentOuvert\(issue\.document\);/,
    "rouvrir une sauvegarde du magasin est le MÊME atterrissage — ⛔ pas un second chemin");
  const pose = shell.match(/function poserLeDocumentOuvert\(document\) \{([\s\S]*?)\n\}/);
  assert.ok(pose, "l'organe existe");
  assert.match(pose[1], /remettreLEcranAZero\(\);/, "et c'est LUI qui réemploie l'organe");
  /* ⚠️ LES DEUX PORTES ÉCRIVENT ENCORE UN CHAMP, ET UN SEUL : le refus de
     LECTURE (`ouvertureRefusee`), posé quand le fichier ou l'entrée ne se lit
     PAS — c'est-à-dire quand `poserLeDocumentOuvert` n'est jamais atteint. Ce
     n'est pas une moitié de remise à zéro, c'est le mot du refus. ⛔ Tout
     autre champ ici serait le second écrivain de retour. */
  for (const [ou, texte] of [["ouvrirUnFichier", ouvrir], ["ouvrirUneEntree", entree]]) {
    const poses = [...new Set([...texte.matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()))];
    assert.deepEqual(poses, ["state.ouvertureRefusee ="],
      `\`${ou}\` ne pose que le refus de LECTURE — le reste appartient à l'organe`);
  }
  assert.match(naissance(), /remettreLEcranAZero\(\);/, "…et le personnage neuf aussi");
});

test("E4 — ⛔ LE MOTEUR PAS CHARGÉ EST UNE PORTE EN PANNE, comme pour `Save` — jamais un bouton muet", () => {
  assert.match(voie("ouvrirNouveauPersonnage"),
    /if \(!state\.engine \|\| !state\.docWriters\) \{\s*porteEnPanne\("New character", "the engine has not finished loading\."\);\s*return;/,
    "la fenêtre ne s'ouvre pas sur une naissance impossible");
  /* ⏳ LOT 195 — LA SÉQUENCE ATTEND, donc c'est la PROMESSE qui porte le refus.
     Le mot est celui de la porte poussée, et un `composer` qui jette se dit au
     lieu de casser la page. */
  assert.match(voie("nouveauPersonnage"), /\}\)\.then\(\(\) => refresh\(\),[\s\S]{0,200}\(cause\) => porteEnPanne\("New character", cause\.message\)\);/,
    "un refus de `composer` se DIT, il ne casse pas la page en silence");
});

test("E5 — 🔴 LE DOCUMENT NEUF NAÎT DE L'ÉCRIVAIN DU BLOC `doc`, et il hérite langue et unités", () => {
  assert.match(shell, /state\.docWriters\.composer\(\{/, "⛔ pas un objet littéral écrit dans la coquille");
  assert.match(shell, /lang: precedent\.lang,\s*units: precedent\.units,/,
    "aucun défaut deviné (décision D3) : `en`/pieds posés d'office trahiraient un joueur en `fr`/mètres");
  assert.match(shell, /at: platformNow\(\)/, "l'horloge du bloc `doc`, pas une seconde écrite ici");
});

/* ══ F — `composer` : L'ÉCRIVAIN QUI FAIT NAÎTRE UN DOCUMENT ═══════════════ */

const schema = readJson("schemas/fh-char.schema.json");
const writers = createDocWriters({ schema });
const NEUF = {
  name: "Sonde", lang: "en", units: { distance: "ft", weight: "lb" },
  layers: [{ id: "srd-5.2.1-en", version: "1.0.0", hash: "f".repeat(64) }],
  id: "premier-pas-neuf", at: "2026-09-10T02:24:10Z"
};

test("F1 — 🔴 un document NEUF est `fh-char/1` moins `resolved`, LE NIVEAU DE NAISSANCE pour seul choix, la pile DÉCLARÉE", () => {
  const doc = writers.composer({ ...NEUF });
  assert.equal(doc.schema, "fh-char/1");
  assert.equal("resolved" in doc, false, "un brouillon ne dérive rien");
  /* 🌱 LOT 198 — RÉÉCRIT À LA NOUVELLE VÉRITÉ, PAS RELÂCHÉ : ce garde disait
     « ZÉRO choix ». Mesuré sur v621, un personnage né ainsi ne dérivait JAMAIS
     (`derive` exige `level`, et aucun écran ne l'écrit). Un personnage naît
     au niveau 1 — un fait du produit, écrit par `composer`, une fois. Ce que
     le garde tient n'a pas molli : rien d'AUTRE que la naissance n'est posé,
     et la naissance se lit à la constante, jamais recopiée. */
  assert.deepEqual(doc.build.choices, [...CHOIX_DE_NAISSANCE].map((c) => ({ ...c })),
    "le seul choix d'un document neuf est son niveau de naissance (lot 198)");
  assert.equal(doc.build.choices.length, 1, "et rien d'autre : « à zéro à la création » — Eric, 10/09");
  assert.deepEqual(doc.build.budgets, {});
  assert.deepEqual(doc.build.overrides, []);
  assert.deepEqual(doc.build.layers, NEUF.layers, "il part avec la pile choisie DÉCLARÉE");
  assert.equal(doc.created, NEUF.at);
  assert.equal(doc.modified, NEUF.at);
});

test("F2 — ⚔️ AUCUN DÉFAUT DEVINÉ (décision D3) : chacun des six champs manquants est NOMMÉ", () => {
  for (const clef of ["name", "lang", "units", "layers", "id", "at"]) {
    const payload = { ...NEUF };
    delete payload[clef];
    assert.throws(() => writers.composer(payload), (e) => e.message.includes(`« ${clef} »`), `« ${clef} » manque`);
  }
});

test("F3 — 🔴 LE NAVIGATEUR ET LE BLOC ÉCRIVENT LE MÊME DOCUMENT — `create` est `composer`", () => {
  /* ⛔ `store.mjs` n'écrit plus la forme d'un document neuf : il appelle
     `composer` avec l'id et l'heure qu'il possède. Deux écrivains auraient
     divergé au premier champ ajouté au schéma, et celui du navigateur en
     silence puisque `create` seul avait des tests. */
  const store = stripComments(fs.readFileSync(path.join(ROOT, "src", "doc", "store.mjs"), "utf8"));
  assert.match(store, /return composer\(\{ \.\.\.options, id: freshId\(\), at: now\(\) \}, "create"\)/);
  assert.doesNotMatch(store, /schema: SCHEMA_TAG,\s*id: freshId/, "la forme n'est plus écrite deux fois");
});

test("F4 — 🔴 LES CHAMPS DESCRIPTIFS SONT ACCEPTÉS DÈS LA NAISSANCE, JAMAIS EXIGÉS (lot 48, §1c)", () => {
  const nu = writers.composer({ ...NEUF });
  assert.equal("gender" in nu, false);
  const decrit = writers.composer({ ...NEUF, gender: "she/her", alignment: "Chaotic Good", inconnu: "avalé" });
  assert.equal(decrit.gender, "she/her");
  assert.equal(decrit.alignment, "Chaotic Good");
  assert.equal("inconnu" in decrit, false, "ce qu'il ne sait pas nommer, il ne le garde pas");
});

test("F5 — ⚔️ UN DOCUMENT QUI NE VALIDE PAS EST REFUSÉ, avec le verbe qui parle", () => {
  assert.throws(() => writers.composer({ ...NEUF, name: "" }, "create"),
    (e) => /^fhpc\/doc: create : le document ne valide pas/.test(e.message));
  assert.throws(() => writers.composer({ ...NEUF, id: "pas d'espace ici" }),
    (e) => /composer : le document ne valide pas/.test(e.message));
});

/* ══ G — 🔴 LA NAISSANCE LAISSE TOUJOURS UN MOTEUR COHÉRENT ════════════════
   📏 Eric, 13/09 (lot 201) : *« next ne m'amène pas sur species ? pourquoi ? »* —
   Species vide, `snaps 0`, six interrupteurs allumés. La question « SRD or
   Fate's Hand? » fermée sans réponse → `choisirLeJeu` ne tournait jamais → le
   carnet vidé par `remettreAZero` (197) n'était jamais regarni.
   🔄 LOT 350 — LA QUESTION EST PARTIE, LE VERROU RESTE : la naissance dérive
   tout de suite (G1 sur la donnée, G2 sur la coquille). Et le second verrou du
   201 — une question qui EXIGE sa réponse — n'a plus d'objet ici : la fenêtre
   n'engage rien avant qu'on choisisse (G3). */

test("G1 — 🔴 SUR LA DONNÉE : le personnage neuf, dérivé SANS réponse, a déjà les espèces de la pile montée", () => {
  /* Ce que `rebuild()` fait dans `repartirAZero` : sans classe, le moteur
     REFUSE (`BuildError`) et la coquille pose le carnet par `verbs.decisions`.
     Ce garde rejoue exactement ces deux verbes sur le document que `composer`
     fait naître, sur la vraie pile EN. ⛔ Aucune espèce recopiée ici : le
     témoin est le genre monté (`query`). */
  const h = makeHarness({ layers: PILE_SRD });
  const doc = writers.composer({ ...NEUF, layers: manifestOf(h.layers), id: "premier-pas-201" });
  assert.throws(() => h.verbs.rebuild({ document: doc }), (e) => e.name === "BuildError",
    "témoin : un personnage neuf n'a pas de classe, le moteur le dit");
  const plans = h.verbs.decisions({ document: doc }).decisions || [];
  const especes = plans.find((p) => p.path === "species");
  assert.ok(especes, "le carnet d'un document vivant porte le plan `species`");
  const montees = (h.layers.verbs.query({ kind: "species" }) || []).map((v) => v.id).sort();
  assert.ok(montees.length >= 2, `témoin de portée : la pile monte plusieurs espèces (lu : ${montees.length})`);
  assert.deepEqual((especes.options || []).slice().sort(), montees,
    "⛔ zéro option ici, c'est l'écran vide d'Eric — le carnet doit porter les espèces montées");
});


test("G2 — 🔌 LA NAISSANCE DÉRIVE tout de suite, et chaque voie repeint — `Cancel` compris", () => {
  /* Le 193 excluait ce `rebuild()` (« laisserait ce mot mort derrière le
     popup ») ; sa raison est morte au 198 (seul Sheet nomme). */
  assert.match(naissance(), /goToStep\(CONCEPT_INDEX\);\s*rebuild\(\);/,
    "⛔ sans `rebuild()` ici, la naissance laisse `state.decisions = []` sur un document vivant");
  /* ⚠️ Et D2 (etat-neuf) tient toujours : un `rebuild()` n'est pas une pose de champ. */
  assert.deepEqual([...naissance().matchAll(/state\.\w+\s*=[^=]/g)].map((m) => m[0].trim()), ["state.document ="]);
  /* Le second verrou, dans la même voie : la séquence REPEINT quelle que soit la
     voie. `paintPopup` a déjà ôté la fenêtre de `state` (`state.popup = null`
     avant `faire`) ; c'est ce `refresh` qui l'ôte de l'ÉCRAN — `Cancel` n'a pas
     d'autre effet, et sans lui la fenêtre resterait peinte (📏 banc du 13/09). */
  assert.match(voie("nouveauPersonnage"), /nouveauPersonnageSelonLaVoie\(\{[\s\S]*\}\)\.then\(\(\) => refresh\(\),/);
  assert.match(shell, /button\(action\.mot, \(\) => \{ state\.popup = null; action\.faire\(\); \}\)/,
    "témoin : la fenêtre se retire de l'état AVANT le geste, pour toutes les voies");
});

test("G3 — ⛔ LA FENÊTRE N'EXIGE PAS DE RÉPONSE, et la coquille ne pose le champ qu'à UN endroit : la question de Fate's Hand (lot 351)", () => {
  /* 🗄️ LOT 201 (Eric, 10/09) : *« Un popup doit me dire, avant même d'arriver à
     l'étape 1, tout de suite : tu veux SRD ou FH ? »* — la question exigeait sa
     réponse parce que le réglage ne se faisait QUE sur elle, APRÈS une remise à
     zéro déjà faite. 🔄 LOT 350 : rien n'est engagé avant la réponse, donc un tap
     dehors vaut `Cancel` (B4). */
  for (const enCours of [true, false]) {
    assert.equal("exigeUneReponse" in popupNouveauPersonnage({ enCours, choisir: () => {} }), false);
  }
  /* ⚔️ LE MÉCANISME SURVIT, et il a un autre porteur : le dépôt voisin pose ses
     questions par le verbe `popup` (lot 307, « Craft this item for … GP? »). La
     coquille ne fait que le TRANSMETTRE et le LIRE. */
  assert.match(shell, /exigeUneReponse: action\.exigeUneReponse === true/, "témoin : le champ voyage avec le verbe `popup`");
  assert.doesNotMatch(shell, /role: "gendarme"[^}]*exigeUneReponse/, "le gendarme ne retient personne");
  /* 🔄 LOT 351 — UN PORTEUR, ET UN SEUL, NOMMÉ : la question de Fate's Hand, peinte en
     FENÊTRE depuis `pendingStack` — ARCHI 35, 29/09, tranché en architecte : *« même organe
     renderConfirmationPile, trois voies intactes, réponse exigée »*. Posée dans `Layers`, elle
     faisait défiler la page. 🗄️ Ce garde disait « elle ne le pose nulle part » : c'était vrai
     jusqu'à cette décision. ⛔ Il ne se relâche pas : un SECOND site le ferait rougir. */
  const poses = shell.match(/exigeUneReponse: true/g) || [];
  assert.equal(poses.length, 1, "la coquille pose le champ à UN endroit, pas deux");
  assert.match(shell, /renderConfirmationPile\([^)]*\)\], \{ exigeUneReponse: true \}/,
    "…et cet endroit est la question du maître — ailleurs, la coquille ne fait que LIRE le champ");
});
