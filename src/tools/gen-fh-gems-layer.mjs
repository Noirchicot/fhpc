/* ══ LE GÉNÉRATEUR DE LA COUCHE FH — LES GEMMES ═══════════════════════════
   Lot 181-gemmes-au-catalogue.

   Il prend le canon d'Eric — `Gems (FH).json`, dans le vault — et il rend
   `layers/fh-gems-en.layer.json` : 54 gemmes au genre `gem`, plus leurs 54
   records de rangement, pour qu'elles apparaissent au catalogue Équipement.

   ⛔ LA COUCHE NE S'ÉCRIT JAMAIS À LA MAIN. C'est la discipline de
   `gen-fh-species-layer.mjs` et de `gen-fh-skills-layer.mjs`, et elle vaut ici
   pour une raison de plus : 54 gemmes × 12 champs recopiés à la main, c'est
   648 occasions de se tromper d'un chiffre sans que personne le voie.

   ── LES TROIS DISCIPLINES DU LOT 15, REPRISES ─────────────────────────
   1. LA DESTINATION EST UN ARGUMENT. Une suite qui veut observer la
      reproductibilité doit pouvoir générer AILLEURS que dans `layers/` —
      sinon elle écrase ce qu'elle mesure (TRAPS.md, lot 13).
   2. LA SOURCE EST UN ARGUMENT AUSSI. `construireCouche()` est PURE : elle
      reçoit le document déjà lu. C'est ce qui permet à la suite d'éprouver
      chaque refus sur une source FABRIQUÉE — une gemme sans poids, un palier
      qui n'existe pas — au lieu d'attendre que le vault se salisse un jour.
   3. AUCUN REPLI SILENCIEUX (loi §0.5). Un champ absent fait JETER en nommant
      la gemme et le champ. Une gemme sans prix affichée « — » serait une
      fiche fausse à la table.

   ── ET UNE QUATRIÈME, PROPRE À CE LOT ────────────────────────────────
   4. LA SOURCE EST VÉRIFIÉE AVANT D'ÊTRE LUE. Elle vit HORS DE CE DÉPÔT
      (`~/obsidian-vault/`), sous un plugin qui committe tout seul : elle peut
      donc changer sans qu'un commit d'ici le dise. Son SHA-256 est déclaré ici
      (`EMPREINTE_SOURCE`) et confronté à chaque passe — même geste
      qu'`assertDigestMatches` dans `gen-srd-layer.mjs`. Une source qui a bougé
      ARRÊTE la génération et demande une relecture, elle ne coule pas dedans.

   ⛔ ET LA SUITE DE TESTS, ELLE, NE LIT PAS LE VAULT. Loi du dépôt, écrite en
   tête de `tests/fh-changes.test.mjs` : « ILS NE LISENT PAS LE DÉPÔT VOISIN.
   Deux fois dans la journée du 20/08, une suite verte est passée au rouge
   parce qu'elle lisait l'ARBRE DE TRAVAIL d'à côté ». Ce qui est vérifiable
   ici, c'est la COUCHE COMMITÉE et les refus de ce module sur des sources
   fabriquées. Le vault n'est lu que par `node src/tools/gen-fh-gems-layer.mjs`.

   Usage :  node src/tools/gen-fh-gems-layer.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

import { sha256Portable } from "../layers/sha256.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const OUT_DIR = join(REPO_ROOT, "layers");
export const OUT_NAME = "fh-gems-en.layer.json";

/** Le canon d'Eric, dans le vault. ⚠️ HORS DE CE DÉPÔT : `~/obsidian-vault`
 *  est synchronisé par le plugin Obsidian Git, donc il bouge sans nous. C'est
 *  la raison d'`EMPREINTE_SOURCE` juste en dessous. */
export const SOURCE_PATH = join(
  homedir(), "obsidian-vault", "5.RPG", "Fate's Hand", "8. Tools", "Gems (FH).json"
);

/** 📏 SHA-256 DES OCTETS DE LA SOURCE, MESURÉ LE 2026-09-08 à 19:42:24 CEST
 *  (`shasum -a 256`), sur le fichier daté du 2026-09-08 19:28.
 *  ⛔ CE N'EST PAS UNE DÉCORATION. Si le vault change et que cette empreinte
 *  ne change pas, la couche commitée cesse silencieusement de décrire le canon
 *  — et c'est LA table qui joue une fiche fausse, pas un test qui rougit. La
 *  passe s'arrête donc et demande une relecture. Le geste, quand Eric édite
 *  les gemmes : relire le fichier, remesurer, poser le nouveau chiffre ICI,
 *  puis regénérer. */
export const EMPREINTE_SOURCE = "e623a20e9029a58f374013ccef9ee8f9d5597765c52bb71ac1b1d8a073cedb96";

/* ══ 🔴 LE SEUL POINT OUVERT DU LOT — L'ÉTAGÈRE ═══════════════════════════

   DEUX PAROLES D'ERIC SE CONTREDISENT, ET L'ARBITRAGE EST LE SIEN :

     · 2026-08-21/22, ÉCRIT — sa structure de rangement déclare `crafting ›
       gems`, à zéro, et elle est la source du tambour (`shelving.aisle` /
       `shelving.shelf`). `tests/tambour-equipement.test.mjs` la nomme déjà :
       « `crafting › gems` […] tous à zéro, tous invisibles ».
     · 2026-09-08, DIT — *« les gemmes doivent être dans l'équipement :
       valuables »*. ⚠️ Et `valuables` n'est une étagère nulle part : les 416
       records de rangement n'en portent aucune (mesuré, 26 étagères, aucune
       ne s'appelle ainsi).

   ➡️ CE GÉNÉRATEUR ÉCRIT LA DÉCISION ÉCRITE — la plus ancienne, la plus
   précise, et la seule qui existe dans la donnée. Mais il l'écrit ICI, en UN
   SEUL ENDROIT, pour que l'arbitrage d'Eric tienne dans une ligne : changer
   cette chaîne pour `"equipment:valuables"` et regénérer suffit à déplacer
   les 54 gemmes. ⛔ Ne la recopie nulle part ailleurs — une seconde écriture
   rouvrirait le défaut `ETAGERE_DE` que le lot 95 a retiré. */
/** `<rayon>:<étagère>` — LA CHAÎNE À CHANGER, ET LA SEULE. */
export const ETAGERE_DES_GEMMES = "trade-goods:trade-goods";

/** D'où vient ce rangement, écrit dans chaque record : le tambour n'affiche
 *  pas cette phrase, mais un lecteur qui se demande « qui a décidé ça ? » la
 *  trouve dans la donnée plutôt que dans un fil de conversation perdu. */
export const PROVENANCE_ETAGERE =
  "eric:2026-09-09 — « remplace mes valuables par trade goods, même étagère partout ». " +
  "⭐ LE MOT EST CELUI DU LIVRE : le SRD 5.2 porte 23 marchandises typées TG (Canvas, Cinnamon, " +
  "Gold, Platinum, Saffron, Silver, Silk…) — `valuables` était une invention de l'architecte, " +
  "et la loi §0.12 dit que le mot est celui du SRD. " +
  "⛔ UNE SEULE ÉTAGÈRE POUR TOUT : les 54 gemmes de Fate's Hand et les 23 marchandises du livre " +
  "s'y rangent ENSEMBLE, elles ne se séparent pas. " +
  "Remplace `crafting › gems` (déclarée à zéro les 21-22/08) et `valuables › gems` (09/09, retirée).";

/* 🔴 LES DEUX TAGS — Eric, 2026-09-08 : *« tag valuables, tag Soulforging »*.
   ⭐ C'EST LA RÉPONSE À UNE QUESTION QUE LE RANGEMENT NE POUVAIT PAS TRANCHER :
   une gemme se VEND (valuables) *et* alimente la forge (soulforging), or un
   record n'a qu'UNE étagère. L'étagère dit OÙ on la trouve ; les tags disent
   À QUOI elle sert. Les deux ne se remplacent pas.
   ⚠️ Aucun des 416 records `srfh` ne porte de `tags` — ce champ est NEUF, et
   c'est pour ça qu'il porte sa provenance comme `craftable` et `slot` portent
   la leur : un lecteur qui le découvre doit savoir qui l'a demandé et quand. */
export const TAGS_DES_GEMMES = Object.freeze(["trade-goods", "soulforging"]);

/* 🔴 CE QUE LE TAG VEUT DIRE — ET IL EST PLUS LARGE QUE LES GEMMES. Eric,
   2026-09-09, corrigeant ma première formulation : *« j'ai suggéré le tag
   Soulforging pour dire : cet item PARTICIPE au Soulforging, et PEUT PORTER un
   état associé »*. ⛔ Ce n'est donc pas une propriété de gemme — c'est un
   marqueur générique, qui vaudra pour l'outil de forge, les 210 ingrédients,
   les 465 catalyseurs et les objets forgés.
   ⭐ ET LES DEUX MOITIÉS VONT ENSEMBLE : le TAG vit au CATALOGUE et déclare une
   APTITUDE, vraie de tous les exemplaires ; l'ÉTAT vit sur la LIGNE POSSÉDÉE
   (`gear[N]`) et n'est vrai que d'un seul. Une gemme taguée `soulforging`
   N'EST PAS une Soulgem : elle peut le devenir, par Transfer Essence.
   ⛔ NE JAMAIS METTRE UN ÉTAT AU CATALOGUE — Eric a posé cette loi trois fois
   en deux jours : la Soulgem, « de la Forêt des Démons », et ce tag. */
export const PROVENANCE_TAGS =
  "eric:2026-09-09 — « cet item participe au Soulforging, et peut porter un état associé », " +
  "puis « un tag associé en SRFH », puis « remplace mes valuables par trade goods ». " +
  "`trade-goods` dit ce que l'objet EST — une valeur marchande, le mot du livre. C'est du " +
  "RANGEMENT, donc SRFH : vrai dans les DEUX piles. " +
  "`soulforging` dit ce à quoi il PARTICIPE, donc l'état qu'il PEUT porter : c'est une règle " +
  "de Fate's Hand, donc SRFH+. " +
  "⛔ Le tag est une APTITUDE du catalogue ; l'ÉTAT vit sur la ligne possédée.";

/* 🔴 LES 23 GEMMES QUE LE LIVRE PORTE DÉJÀ — la frontière, MESURÉE et GELÉE.
   ⚖️ Eric, 2026-09-09, quatre phrases : *« on rajoute les gemmes qui manquent »*,
   *« c'est leur valeur qui détermine »*, *« FH doit se superposer / on superpose »*,
   ⛔ *« on ne veut pas de doublons inutiles »* — puis la contrainte qui ferme la
   pile : *« que tu puisses désactiver dmg player et toujours te raccrocher au SRD »*.

   📏 MESURÉ dans le DMG 2024 qu'Eric POSSÈDE (D&D Beyond `dnd/dmg-2024`, ch. 7
   « Treasure » § Gemstones — la source licite, pas 5e.tools) : le livre range ses
   gemmes sur 6 paliers, 52 pierres — 10 (×12) · 50 (×12) · 100 (×10) · 500 (×6) ·
   1 000 (×8) · 5 000 (×4). L'échelle d'Eric en compte 12 ; les 6 autres — 250, 750,
   2 500, 10 000, 25 000, 50 000 — n'existent pas en GEMMES au DMG (250/750/2 500 y
   sont des paliers d'OBJETS D'ART), et leurs 24 gemmes n'ont AUCUN doublon de nom.

   ⛔ CE QUE CETTE TABLE EMPÊCHE. Les 54 portent un identifiant `fh:gem:en:…`. Le jour
   où le DMG du joueur est importé, `azurite` arriverait sous un AUTRE namespace : le
   moteur verrait deux records et afficherait DEUX lignes à 10 gp. Le doublon n'est pas
   un risque théorique, il est la conséquence mécanique de l'identifiant.
   ⭐ La table ci-dessous ne le répare pas — elle le REND VISIBLE et le fige, pour que
   le lot qui déplacera ces 23 vers un identifiant partagé n'ait pas à re-mesurer.
   ⚠️ Ce sont les 23 SEULS records de la couche qui ne sont pas une invention de FH.

   ⚠️ ET DEUX D'ENTRE ELLES NE SONT PAS D'ACCORD AVEC LE LIVRE SUR LE PRIX — c'est le
   seul point que la mesure ne tranche pas, il attend Eric (voir la valeur, en face). */
export const GEMMES_DU_LIVRE = Object.freeze({
  // slug de la gemme FH : le palier que le DMG 2024 lui donne
  "azurite": 10,
  "hematite": 10,
  "malachite": 10,
  "turquoise": 10,
  "carnelian": 50,
  "chalcedony": 50,
  "citrine": 50,
  "onyx": 50,
  "zircon": 50,
  "amber": 100,
  "chrysoberyl": 100,   /* ⚠️ FH le prix 500 */
  "coral": 100,
  "jade": 100,
  "jet": 100,
  "pearl": 100,
  "alexandrite": 500,
  "peridot": 500,
  "black-opal": 1000,   /* ⚠️ FH le prix 5000 */
  "blue-sapphire": 1000,
  "emerald": 1000,
  "star-ruby": 1000,
  "star-sapphire": 1000,
  "jacinth": 5000,
});

/* 📏 Les 6 paliers que le DMG 2024 donne à ses gemmes. Tout palier de l'échelle
   d'Eric qui n'est PAS ici est un palier que FH apporte seul — et ses gemmes ne
   peuvent, par construction, doubler personne. */
export const PALIERS_DU_LIVRE = Object.freeze([10, 50, 100, 500, 1000, 5000]);

export const LAYER = {
  schema: "fh-layer/1",
  id: "fh-gems-en",
  version: "0.1.0",
  name: "Fate's Hand — Gems (EN)",
  lang: "en",
  flag: "fh.gems"
};

/** ⛔ LES DEUX CHAMPS DU VAULT QUI N'ENTRENT PAS, ET CE N'EST PAS UN OUBLI.
 *  `name_fr` et `tier_fr` sont du FRANÇAIS ; cette couche déclare `lang: "en"`
 *  et le contrat fh-layer/1 est explicite — « une couche ne mélange pas les
 *  langues : le SRD fr et le SRD en sont deux couches ». Les traduire ici
 *  aurait fabriqué une couche bilingue qu'aucun lecteur ne sait lire ; les
 *  laisser au vault les garde intacts pour le jour où `fh-gems-fr` naîtra.
 *  ⭐ LE REFUS EST JOURNALISÉ : `construireCouche` rend `refuses`, et la suite
 *  le LIT. Un refus qu'on ne peut pas compter est un refus qu'on ne relit
 *  jamais — et un champ perdu en silence est exactement ce que ce dépôt paie. */
export const CHAMPS_REFUSES_LANGUE = ["name_fr", "tier_fr"];

/** Les champs que CHAQUE gemme doit porter. Un manquant fait jeter en nommant
 *  la gemme ET le champ (loi §0.5) : une gemme sans `value_gp` s'afficherait
 *  « — » au prix, et le joueur l'achèterait pour rien. */
const CHAMPS_REQUIS = [
  "id", "name_en", "value_gp", "tier_en",
  "weight_g", "weight_kg", "weight_lb", "weight_oz", "weight_provenance", "display",
  "die", "roll"
];

class GemError extends Error {}
function fail(quoi) { throw new GemError(`gen-fh-gems : ${quoi}`); }

/* ══ LA LECTURE DE LA SOURCE, VÉRIFIÉE AVANT D'ÊTRE CRUE ═════════════════ */

/** Confronte l'empreinte lue à celle déclarée. PURE (aucun accès disque),
 *  comme `assertDigestMatches` : le refus s'éprouve sans toucher au vault. */
export function assertEmpreinteSource(digest, attendue = EMPREINTE_SOURCE) {
  if (digest !== attendue) {
    fail(
      `la source du vault a CHANGÉ depuis la dernière passe (attendu ${attendue}, obtenu ${digest}). ` +
      "⛔ Ne pas générer sur une source non relue : relire `Gems (FH).json`, vérifier que les paliers, " +
      "les poids et les arbitrages du `_meta` sont toujours ceux qu'on croit, puis poser la nouvelle " +
      "empreinte dans `EMPREINTE_SOURCE` et regénérer. Refusé, pas sauté."
    );
  }
}

/** Lit la source et rend `{ doc, digest }`, empreinte VÉRIFIÉE. */
export function lireSource(chemin = SOURCE_PATH, { empreinte = EMPREINTE_SOURCE } = {}) {
  let bytes;
  try {
    bytes = readFileSync(chemin);
  } catch (e) {
    fail(`source introuvable — ${chemin} (${e.code || e.message}). Le vault est-il monté ?`);
  }
  const digest = sha256Portable(new Uint8Array(bytes));
  assertEmpreinteSource(digest, empreinte);
  return { doc: JSON.parse(bytes.toString("utf8")), digest };
}

/* ══ LES DEUX MISES EN FORME, ET ELLES NE CRÉENT AUCUNE VALEUR ═══════════ */

/** `10` → « 10 GP » · `1000` → « 1,000 GP ». ⭐ LA FORME EST CELLE DU SRD, PAS
 *  LA MIENNE : la couche SRD anglaise écrit « 25 GP », « 1,000 GP » et
 *  « 1,500 GP » — virgule des milliers comprise. Écrire « 1000 GP » aurait
 *  produit un catalogue où les gemmes se reconnaissent à leur typographie.
 *  ⛔ Et ce n'est PAS une valeur inventée : le nombre vient de `value_gp`, seul
 *  son habillage est calculé — `parseCout` le relit et rend le même entier
 *  (garde : `tests/fh-gems.test.mjs`, la lecture en sens inverse). */
export function prixSrd(valeurGp) {
  if (!Number.isFinite(valeurGp) || valeurGp <= 0 || !Number.isInteger(valeurGp)) {
    fail(`« ${valeurGp} » n'est pas une valeur en pièces d'or — un prix ne se devine pas.`);
  }
  return `${String(valeurGp).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} GP`;
}

/** Le slug d'une gemme, LU dans son id — jamais refabriqué depuis son nom.
 *  ⭐ `Emperor’s Ruby` porte une apostrophe typographique : le vault a déjà
 *  tranché « emperor-s-ruby » (même convention que `srd:gear:en:alchemist-s-
 *  fire`), et refaire le calcul ici serait un SECOND ÉCRIVAIN pour la même
 *  règle — deux écritures divergent. */
function slugDeLId(id) {
  const parts = String(id).split(":");
  if (parts.length !== 4 || parts[0] !== "fh" || parts[1] !== "gem" || parts[2] !== LAYER.lang) {
    fail(`id de gemme mal formé « ${id} » — attendu « fh:gem:${LAYER.lang}:<slug> ».`);
  }
  return parts[3];
}

/** L'id de rangement d'une gemme. ⚠️ PRÉFIXE `fh:`, JAMAIS `srfh:` : ces
 *  records-là vivent dans une couche Fate's Hand et pointent vers des records
 *  qui n'existent PAS sur le fil SRD. `srfh-shelving-en` monte dans les DEUX
 *  piles nommées (voir `SRFH_LAYER_IDS`) — y loger un rangement de gemme
 *  ferait pointer, en mode « SRD seul », vers un `extends` introuvable. */
function idDeRangement(slug) { return `fh:shelving:${LAYER.lang}:${slug}`; }

/* ══ LA CONSTRUCTION — PURE, ET ELLE RECOPIE ═════════════════════════════ */

/** Vérifie la source AVANT d'en tirer quoi que ce soit, et rend ce qu'elle a
 *  refusé. ⭐ CINQ LECTURES, ET LA QUATRIÈME EST UNE SECONDE LECTURE EN SENS
 *  INVERSE : une bijection fausse est cohérente tant qu'on ne la relit que
 *  dans un sens.
 *    ① la source porte bien des gemmes (un vide n'est pas une réponse) ;
 *    ② le compte DÉCLARÉ (`_meta.count`) est le compte MESURÉ ;
 *    ③ chaque gemme porte tous ses champs, son poids respecte le PLANCHER de
 *      0,5 g qu'Eric a posé, et son id est unique ;
 *    ④ tout `value_gp` est un palier déclaré, ET tout palier déclaré porte au
 *      moins une gemme — les deux sens, sinon un palier vidé passerait ;
 *    ⑤ aucune gemme ÉCARTÉE (`retired_gems`) ne s'est glissée dans la couche.
 *      La réserve reste une réserve : `_meta.retiredNote` dit « aucun lecteur
 *      ne doit les charger », et ce garde le prouve au lieu de le promettre.
 *
 *  🔴 ③ AVANT ④, ET CE N'EST PAS UN GOÛT — LA SUITE A ATTRAPÉ L'INVERSE. Dans
 *  le premier jet, ④ passait en premier : une gemme SANS `value_gp` se faisait
 *  refuser par le contrôle des PALIERS, avec le message « vaut undefined po,
 *  qui n'est pas un palier déclaré ». Le refus arrivait bien, mais il accusait
 *  le mauvais coupable — et un mainteneur serait parti chercher un palier
 *  manquant au lieu d'un champ absent. Même doctrine que `deriveGenres` : une
 *  faute doit se voir refuser pour SON motif, jamais pour un contrôle voisin
 *  qui masque la vraie. */
function verifierSource(doc) {
  const meta = (doc && doc._meta) || {};
  const gemmes = Array.isArray(doc && doc.gems) ? doc.gems : null;
  if (!gemmes || gemmes.length === 0) {
    fail("la source ne porte aucune gemme (`gems` absent ou vide) — un vide n'est pas une réponse.");
  }

  if (Number.isInteger(meta.count) && meta.count !== gemmes.length) {
    fail(`le _meta déclare ${meta.count} gemmes, la liste en porte ${gemmes.length}. ` +
      "Un compte déclaré et un compte mesuré qui divergent : lire les records, pas les compter.");
  }

  const plancher = Number.isFinite(meta.weightFloor_g) ? meta.weightFloor_g : null;
  const vusIds = new Set();
  for (const g of gemmes) {
    for (const champ of CHAMPS_REQUIS) {
      if (g[champ] === undefined || g[champ] === null || g[champ] === "") {
        fail(`la gemme « ${g.id || "(sans id)"} » n'a pas de « ${champ} » — refusé, pas comblé.`);
      }
    }
    if (typeof g.display.metric !== "string" || typeof g.display.imperial !== "string") {
      fail(`la gemme « ${g.id} » n'a pas ses deux affichages (display.metric / display.imperial).`);
    }
    if (plancher !== null && g.weight_g < plancher) {
      fail(`la gemme « ${g.id} » pèse ${g.weight_g} g, sous le plancher de ${plancher} g posé par Eric.`);
    }
    if (vusIds.has(g.id)) fail(`l'id « ${g.id} » apparaît deux fois dans la source.`);
    vusIds.add(g.id);
  }

  const paliers = Array.isArray(meta.tiers_gp) ? meta.tiers_gp : null;
  if (!paliers || paliers.length === 0) fail("`_meta.tiers_gp` absent — les paliers ne se devinent pas.");
  const declares = new Set(paliers);
  const vus = new Set();
  for (const g of gemmes) {
    if (!declares.has(g.value_gp)) {
      fail(`la gemme « ${g.id} » vaut ${g.value_gp} po, qui n'est pas un palier déclaré (${paliers.join(", ")}).`);
    }
    vus.add(g.value_gp);
  }
  const vides = paliers.filter((p) => !vus.has(p));
  if (vides.length) {
    fail(`palier(s) déclaré(s) sans aucune gemme — ${vides.join(", ")} po. ` +
      "La seconde lecture, en sens inverse : un palier vidé passerait sans elle.");
  }

  const ecartees = Array.isArray(doc.retired_gems) ? doc.retired_gems : [];
  const intruses = ecartees.map((g) => g.id).filter((id) => vusIds.has(id));
  if (intruses.length) {
    fail(`gemme(s) ÉCARTÉE(S) présente(s) dans la liste active — ${intruses.join(", ")}. ` +
      "`retired_gems` est une réserve : aucun lecteur ne la charge.");
  }

  return { gemmes, ecartees: ecartees.length };
}

/**
 * Construit la couche. PURE : elle ne touche ni au disque ni à l'horloge.
 *
 * @param {object} doc  le document `Gems (FH).json`, déjà lu
 * @returns {{layer:object, compte:number, parPalier:object, refuses:string[], ecartees:number}}
 */
export function construireCouche(doc, { etagere = ETAGERE_DES_GEMMES } = {}) {
  const { gemmes, ecartees } = verifierSource(doc);

  const [rayon, rayonnage] = String(etagere).split(":");
  if (!rayon || !rayonnage || String(etagere).split(":").length !== 2) {
    fail(`« ${etagere} » n'est pas une étagère — attendu « <rayon>:<étagère> », deux mots séparés par un deux-points.`);
  }

  const gem = {};
  const shelving = {};
  const parPalier = {};

  for (const g of gemmes) {
    const slug = slugDeLId(g.id);
    const nom = g.name_en;

    /* ⭐ TOUT CE QUI EST ANGLAIS SE RECOPIE, RIEN NE SE CALCULE — sauf `cost`,
       qui est l'HABILLAGE SRD de `value_gp` (nombre gardé à côté, intact).
       ⛔ `weight` EST `display.imperial`, recopié tel quel : c'est « — », le
       propre signe du SRD anglais pour un poids négligeable (17 records
       l'emploient), et c'est une RATIFICATION d'Eric du 2026-09-08 — « on
       garde « — ». Une gemme EST négligeable en livres, et c'est le mot du
       livre ». ⚠️ « — » N'EST PAS ZÉRO : les quatre poids chiffrés voyagent
       avec le record, et c'est sur EUX qu'un sac se sommera. */
    gem[g.id] = {
      name: nom,
      slug,
      data: {
        cost: prixSrd(g.value_gp),
        die: g.die,
        display: { imperial: g.display.imperial, metric: g.display.metric },
        name: nom,
        roll: g.roll,
        tier: g.tier_en,
        value_gp: g.value_gp,
        weight: g.display.imperial,
        weight_g: g.weight_g,
        weight_kg: g.weight_kg,
        weight_lb: g.weight_lb,
        weight_oz: g.weight_oz,
        weight_provenance: g.weight_provenance
      }
    };

    /* LE RANGEMENT — même forme que `srfh-shelving-en` : `extends`, `of_kind`,
       `shelf{aisle,shelf}`. ⛔ SANS `craftable` NI `slot` : les records `srfh`
       les portent, RIEN NE LES LIT côté gemme (`equipment-step.mjs` ne lit que
       `data.slot.slot`, absent d'un objet non porté — un `gear` rangé par Eric
       ne le porte pas davantage). Les inventer serait poser une décision
       qu'Eric n'a pas prise, et un défaut de ce genre se relit « donnée » un an
       plus tard. Le jour où un consommateur les demande, il les demandera à
       Eric, pas à ce générateur. */
    shelving[idDeRangement(slug)] = {
      name: nom,
      slug,
      data: {
        extends: g.id,
        name: nom,
        of_kind: "gem",
        shelf: { aisle: rayon, provenance: PROVENANCE_ETAGERE, shelf: rayonnage },
        tags: { provenance: PROVENANCE_TAGS, value: [...TAGS_DES_GEMMES] }
      }
    };

    parPalier[g.value_gp] = (parPalier[g.value_gp] || 0) + 1;
  }

  const layer = {
    schema: LAYER.schema,
    id: LAYER.id,
    version: LAYER.version,
    name: LAYER.name,
    lang: LAYER.lang,
    flags: [LAYER.flag],
    attribution: {
      license: "all-rights-reserved",
      text: "Original Fate's Hand content: all rights reserved. This layer adds records of its own and " +
        "modifies NO material from the System Reference Document 5.2.1 — the fifty-four gems exist in no " +
        "SRD, and nothing here patches, extends or reproduces SRD text."
    },
    description:
      "The fifty-four gems of Fate's Hand, dictated by Eric on 2026-09-08 and kept in the vault " +
      "(`5.RPG/Fate's Hand/8. Tools/Gems (FH).json`). Twelve value tiers, from 10 GP to 50,000 GP — five " +
      "gems per tier, except the last three (10,000 · 25,000 · 50,000 GP) which carry three: at that level " +
      "they are unique, named stones. They are NOT magical: their worth comes from size, purity, cut and " +
      "provenance. Each gem carries a shelving record of its own so the Equipment drum can show it; those " +
      "records live HERE and not in `srfh-shelving-en`, which is mounted on the SRD-only stack too and " +
      "must never point at records that stack does not have. ⚠️ Two things this layer does not carry, " +
      "both on purpose: no Demon-Forest field (the same azurite is ordinary or Demon-Forest depending on " +
      "where it was found — that is a property of the OWNED LINE, not of the catalogue), and no French " +
      "names (a layer does not mix languages; `name_fr` and `tier_fr` stay in the vault until a " +
      "`fh-gems-fr` exists).",
    records: { gem, shelving }
  };

  return { layer, compte: gemmes.length, parPalier, refuses: [...CHAMPS_REFUSES_LANGUE], ecartees };
}

export function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

/** Génère la couche et l'ÉCRIT. `outDir` et `sourcePath` sont des arguments :
 *  la suite génère dans un répertoire temporaire et compare là. */
export function generate({ outDir = OUT_DIR, sourcePath = SOURCE_PATH, etagere = ETAGERE_DES_GEMMES } = {}) {
  const { doc, digest } = lireSource(sourcePath);
  const resultat = construireCouche(doc, { etagere });
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, serialize(resultat.layer));
  return { ...resultat, outPath, digest };
}

export { GemError };

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, compte, parPalier, ecartees, digest } = generate();
  const paliers = Object.keys(parPalier).map(Number).sort((a, b) => a - b)
    .map((p) => `${p}:${parPalier[p]}`).join(" · ");
  console.log(
    `fh-gems : ${compte} gemmes au genre \`gem\` + ${compte} rangements sur \`${ETAGERE_DES_GEMMES.replace(":", " › ")}\`\n` +
    `          paliers ${paliers}\n` +
    `          ${ecartees} gemmes écartées laissées au vault (réserve, jamais chargée)\n` +
    `          source ${digest}\n` +
    `          → ${outPath}`
  );
}
