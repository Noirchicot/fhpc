/* ══ L'ANCRE D'UNE LIGNE DE SAC — lot 296 ══════════════════════════════════

   🔴 LE DÉFAUT. `resolved.gear[].id` valait le slug du RECORD (`dagger`). Deux
   lignes du même record — deux dagues craftées différemment, une pile de flèches
   scindée en deux, un second achat rangé ailleurs — portaient donc le même id, et
   `rebuild` jetait (`src/schemas/invariants.mjs`, *« deux entrées portent l'id
   "dagger" »*) : plus de fiche du tout. Ces lignes sont pourtant LÉGITIMES — ce ne
   sont pas les mêmes objets, ou ils ne sont pas au même endroit.

   ⚖️ LA RÈGLE, UNE SEULE FONCTION, AUCUN AUTRE ÉCRIVAIN :
     · la ligne de PLUS PETIT index `gear[N]` d'un id de base garde l'id nu
       (`dagger`) — les documents et les overrides d'avant ce lot gardent leurs
       ancres, et un personnage sans doublon est identique à l'octet ;
     · chaque autre ligne du même id de base reçoit `<base>:gear-<N>`, où `N` est
       SON index de document (`dagger:gear-5` est la ligne `gear[5]`).

   ⭐ POURQUOI L'INDEX DU DOCUMENT, ET PAS UN RANG (`dagger~2`). L'index `gear[N]` est
   une IDENTITÉ, pas une position (`tests/gear-index-identite.test.mjs`) : aucun geste
   ne renumérote, un index libéré n'est jamais repris (`nextGearIndex` = max + 1).
   Contre les gestes :
     · DÉPLACER (`moveGearLine`, `placerGearLine`) : l'index ne bouge pas → l'id non plus ;
     · SCINDER (`splitGearLine`) : la source garde son index, la part détachée en reçoit
       un neuf → la source garde son id, la part détachée en prend un neuf ;
     · RETIRER une ligne AVANT : les suivantes gardent leur index → leur id. ⛔ Un rang
       (`~2`, `~3`) glisserait ici EN SILENCE : la 3ᵉ dague deviendrait la 2ᵉ, et
       l'override qui visait la 2ᵉ (retirée) mordrait sur la 3ᵉ sans un mot.
     · ⚠️ LE SEUL GLISSEMENT QUI RESTE : retirer la ligne qui porte l'id NU. La
       suivante devient la première et prend `dagger` — c'est le prix de « la première
       ligne garde l'id d'aujourd'hui ». ⭐ LOT 306 : le retrait RÉ-ANCRE l'override de
       la ligne promue (`overridesApresRetrait`, plus bas) et efface ceux de la ligne
       retirée — plus d'orphelin, plus de morsure silencieuse sur la voisine.
   ⭐ Et c'est la clef que les effets d'objets emploient déjà (`effects[].line` = N,
   `effets-objets.mjs`) : une ligne a UN nom de ligne, partout.

   ⛔ POURQUOI `:` ET PAS `~`. `$defs/slug` (`fh-char/1`) n'admet que `[a-z0-9:_-]`.
   Et un slug de RECORD n'admet jamais `:` (`fh-layer/1` : `^[a-z0-9][a-z0-9-]*$`) :
   `<base>:gear-<N>` ne peut donc pas être le slug d'un autre record — aucune ligne
   voisine ne peut le porter par hasard. Si la base retombe sur l'id du record
   (`srd:gear:en:x`, quatre segments au plus), l'ancre en a cinq : aucun id de record
   n'a cette forme. L'invariant reste là pour le jour où ce raisonnement serait faux.

   ⛔ L'INVARIANT N'EST PAS AFFAIBLI : il refuse toujours deux ids égaux. Ce module
   fait seulement que deux lignes distinctes n'en portent plus deux égaux. */

import { parseChoicePath, parseOverridePath } from "./paths.mjs";

/** Le plafond d'un `$defs/slug` (`^[a-z][a-z0-9:_-]{0,79}$`). */
export const ANCRE_MAX = 80;

/** Le suffixe d'une ligne qui n'est pas la première de son id de base. */
export const suffixeDeLigne = (index) => `:gear-${index}`;

/**
 * Les ids de `resolved.gear[]`, un par ligne du document.
 * @param {Array<{index:number, base:string}>} lignes toutes les lignes `gear[N]` qui nomment un record
 *   (`base` = le slug du record, sinon son id — l'id d'avant ce lot)
 * @returns {Map<number,string>} index du document → id de la ligne
 */
export function ancresDesLignes(lignes) {
  const premiere = new Map();
  for (const { index, base } of lignes) {
    const deja = premiere.get(base);
    if (deja === undefined || index < deja) premiere.set(base, index);
  }
  const ancres = new Map();
  for (const { index, base } of lignes) {
    if (premiere.get(base) === index) { ancres.set(index, base); continue; }
    const suffixe = suffixeDeLigne(index);
    /* ⛔ tronquer la BASE, jamais le suffixe : c'est lui qui distingue la ligne */
    ancres.set(index, `${base.slice(0, ANCRE_MAX - suffixe.length)}${suffixe}`);
  }
  return ancres;
}

/* ══ LOT 306 — LES OVERRIDES SUIVENT LEUR LIGNE ════════════════════════════

   🔴 LES DEUX DÉFAUTS QUE LE LOT 296 AVAIT SIGNALÉS. (1) Retirer `gear[N]` laissait
   derrière lui les overrides ancrés sur CETTE ligne. (2) Retirer la ligne qui porte l'id
   NU fait monter la suivante à l'id nu : un override posé sur `dagger:gear-M` devenait
   orphelin (`rebuild` JETAIT, plus de fiche), et un override resté sur `dagger` — celui
   de la ligne retirée — aurait mordu EN SILENCE sur la suivante.

   ⚖️ LA RÈGLE (architecte, 26/09 — mécanique, pas produit) :
     · retirer `gear[N]` efface tout override dont l'ancre désigne CETTE ligne — son
       ancre est son id AVANT le retrait ;
     · tout override d'une AUTRE ligne dont l'id change à cause du retrait (la promotion
       `dagger:gear-M` → `dagger`) est RÉ-ANCRÉ sur le nouvel id : il vise la même ligne.
   ⭐ Les deux ancres, AVANT et APRÈS, sortent de `ancresDesLignes` — ⛔ jamais d'une
   seconde règle. Et les lignes sortent de `lignesDuCarnet`, que `derive` lit aussi :
   ce que le retrait croit être l'ancre d'une ligne est ce que la fiche lui donnera. */

/**
 * Les lignes `gear[N]` d'un carnet qui nomment un record, avec leur BASE d'ancre
 * (le slug du record, sinon son id). ⭐ LE SEUL LECTEUR : `derive` et le retrait d'une ligne.
 * @param {Array<{path:string, ref?:{kind:string,id:string}}>} choices `build.choices`
 * @param {(ref:{kind:string,id:string}, path:string) => ({slug?:string}|null)} recordDe le record d'un ref
 * @returns {Array<{index:number, base:string}>}
 */
export function lignesDuCarnet(choices, recordDe) {
  const lignes = [];
  for (const choice of Array.isArray(choices) ? choices : []) {
    if (!choice || typeof choice.path !== "string" || !choice.ref) continue;
    const parsed = parseChoicePath(choice.path);
    if (parsed.root !== "gear" || parsed.segments.length !== 2 || parsed.segments[1].kind !== "index") continue;
    const record = recordDe(choice.ref, choice.path);
    lignes.push({ index: parsed.segments[1].value, base: (record && record.slug) || choice.ref.id });
  }
  return lignes;
}

/** L'ancre de ligne qu'un chemin d'override désigne (`resolved.gear[<ancre>]…`), sinon `undefined`. */
export function ancreViseeParLOverride(path) {
  const { segments } = parseOverridePath(path);
  if (segments.length < 2 || segments[0].kind !== "name" || segments[0].value !== "gear" || segments[1].kind !== "id") return undefined;
  return segments[1].value;
}

/**
 * ⭐ LOT 306 — Les overrides après le retrait de `gear[index]`. PURE : rend une liste neuve,
 * dans le MÊME ordre, où ceux de la ligne retirée manquent et ceux d'une ligne promue portent
 * sa nouvelle ancre. ⛔ Un override qui ne vise aucune ligne de gear revient identique.
 * @param {object} p
 * @param {Array<{path:string}>} p.overrides `build.overrides` AVANT le retrait
 * @param {Array<{index:number, base:string}>} p.lignes `lignesDuCarnet` AVANT le retrait
 * @param {number} p.index la ligne retirée
 */
export function overridesApresRetrait({ overrides, lignes, index }) {
  const avant = ancresDesLignes(lignes);
  const apres = ancresDesLignes(lignes.filter((l) => l.index !== index));
  const partante = avant.get(index);
  const reancre = new Map();
  for (const [i, ancre] of avant) {
    if (i !== index && apres.get(i) !== ancre) reancre.set(ancre, apres.get(i));
  }
  const garde = [];
  for (const override of Array.isArray(overrides) ? overrides : []) {
    const ancre = ancreViseeParLOverride(override.path);
    if (ancre === undefined) { garde.push(override); continue; }
    if (partante !== undefined && ancre === partante) continue;
    if (reancre.has(ancre)) {
      const tete = `resolved.gear[${ancre}]`;
      garde.push({ ...override, path: `resolved.gear[${reancre.get(ancre)}]${override.path.slice(tete.length)}` });
      continue;
    }
    garde.push(override);
  }
  return garde;
}
