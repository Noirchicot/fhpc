/* ══ LE SCORE DE DESTINÉE — LE MODULE QUI LE PUBLIE ═══════════════════
   Lot 19-score-destinee. Premier consommateur de `resolved.stats[]`
   (GAP-DERIVED, bouché au schéma le 2026-08-08).

   Loi §0.12 : « LE SRD EST LA BASE, FH EST UNE COUCHE PAR-DESSUS. » Ce
   fichier vit donc dans `src/modules/fh/`, et `src/build/` ne l'importe
   JAMAIS — le garde de frontière du bloc l'interdit déjà nommément
   (`tests/build-block.test.mjs`, motif `../modules/`). La dérivation reçoit
   ses modules par injection, comme `play` reçoit ses couches, et elle
   n'active celui-ci que si la pile lève `fh.destiny`.

   ── CE QUE LE SCORE VAUT, ET CE QU'IL NE PEUT PAS VALOIR ──────────────
   Le Score est la somme de son détail, terme par terme. QUATRE termes sont
   dérivables de la construction, DEUX naissent en séance, et UN seul n'est
   dérivable de rien — mesuré avant d'écrire une ligne :

   DÉRIVÉS (la construction les porte)
     1. la MAÎTRISE — `resolved.proficiency`, déjà dérivée par le pli ;
     2. la BASE DE DESTINÉE de l'espèce — `data.destiny.base` (2 pour les
        douze espèces), plus `base_bonus` quand il existe. DEUX LIGNES, pas
        une addition : le bonus a une source nommée (l'Elfe : +2 par
        `splinter-of-anon`), et l'écraser dans la base perdrait POURQUOI il
        est là ;
     3. l'IMPACT DE L'ARCANE MAJEUR — `data.destiny.impact` de la carte que le
        choix `fh.destiny.arcana` désigne par un `ref` (lot 20) ;
     4. le bonus d'un DON qui en porte un — `data.destiny.bonus`, aujourd'hui
        le seul *Auspicious (fh)*, +2 (lot 20 ; renommé le 2026-08-10).

   DE SÉANCE (ils entrent par `build.choices`, voir plus bas)
     5. la GLOIRE / DAMNATION — décidée par le MJ, UN terme SIGNÉ ;
     6. le +1 de chaque ÉVEIL ARCANIQUE MAJEUR — décidé par les dés.

   NON DÉRIVABLE, ET DÉCLARÉ PLUTÔT QU'INVENTÉ
     7. la ligne OTHER (objet magique, boon, sous-classe) — aucune source de
        règle à lire. Un Score qui l'inventerait serait un Score FAUX qui
        aurait l'air juste. Elle se déclare, avec sa raison, à chaque pli.

   ⚠️ RÉÉCRIT LE 2026-08-09 PUIS LE 2026-08-10, ET LES DEUX FOIS LA RAISON A
   CHANGÉ DE NATURE. Les termes 3 et 4 étaient ici sous « NON DÉRIVABLES ».
   Le 2026-08-09 l'architecte a ouvert le genre `arcana` dans les deux
   schémas : ce n'était plus le CONTRAT qui manquait (trou GAP-KIND, clos)
   mais le CONTENU. Le lot 20 pose ce contenu — les 22 cartes et la fiche du
   don — et les deux termes se dérivent. Garder l'ancienne déclaration
   enverrait le prochain lot écrire une couche déjà écrite.

   CE QUI RESTE DÉCLARÉ, ET DANS QUEL CAS : la couche des cartes N'EST PAS
   MONTÉE (le genre répond, et il répond vide), ou le personnage ne nomme
   aucune carte, ou aucun de ses dons ne porte de valeur de Destinée. Le
   terme se déclare alors avec la raison exacte — jamais un zéro consolant.

   ── POURQUOI LES TERMES DE SÉANCE PASSENT PAR `build.choices` ─────────
   Invariant n°1 de `fh-char/1` : `resolved` n'est écrit que par la
   dérivation. Un terme posé DIRECTEMENT dans `resolved` serait effacé par la
   première reconstruction, et le Score reviendrait faux sans dire de combien.
   `build.choices` survit à toute reconstruction par définition — c'est la
   tranche que le pli RELIT. La Gloire y entre donc comme une décision de
   construction, parce qu'elle doit durer autant que le personnage.

   📌 RÈGLE D'ERIC, 2026-08-08, et c'est elle qui justifie `label` : « le +X
   qu'on va donner au score sera motivé par une entrée dans la fiche de
   perso : "+1 Gloire, a sauvé la région de la destruction" ». La même entrée
   se lit à la table ET compte dans le total. Un terme discrétionnaire sans
   trace ne peut être ni contesté ni corrigé — d'où le REFUS BRUYANT d'un
   choix sans `label`. */

import { createLabels } from "../../play/labels.mjs";
import { FH_EN } from "./labels.mjs";

const t = createLabels(FH_EN);

/** Le drapeau qui allume ce module. Levé par `layers/fh-species-en.layer.json`. */
export const FH_DESTINY_FLAG = "fh.destiny";

/** L'ancre de l'entrée dans `resolved.stats[]`.
 *
 *  ⚠️ CE N'EST PAS `fh.destiny`, ET C'EST MESURÉ. `stats[].id` est un
 *  `$defs/slug` (`^[a-z][a-z0-9:_-]{0,79}$`) : LE POINT N'Y EST PAS ADMIS, pas
 *  plus que dans le sélecteur d'un chemin d'override (`[a-z][a-z0-9:_-]*`). Un
 *  id `fh.destiny` serait donc rejeté par le schéma ET inadressable par un
 *  override — deux fois faux. Le deux-points est le séparateur de namespace du
 *  dépôt (`srd:species:en:elf`), il est légal des deux côtés, et il garde le
 *  namespace visible : un MJ écrit `resolved.stats[fh:destiny].value`.
 *  Le drapeau, lui, reste `fh.destiny` — il voyage dans le champ `flag`.
 *  ⚠️ Question 1 à l'architecte : le kickoff du lot dit « id `fh.destiny` ». */
export const FH_DESTINY_ID = "fh:destiny";

/** Les deux termes de séance que la décision d'architecte a nommés, et EUX
 *  SEULS. Un troisième nom (`other`, `arcana`) est un REFUS qui nomme les deux
 *  admis : accepter une tranche neuve serait inventer un canal que personne
 *  n'a ratifié, et l'ignorer serait le repli silencieux que §0.5 interdit. */
/** Le SEUL chemin du namespace qui désigne un RECORD au lieu d'un nombre, et
 *  le genre qu'il a le droit de désigner.
 *
 *  ⚠️ `tail` NU, sans indice : un personnage porte UNE carte, pas une liste.
 *  La forme `<terme>[n]` est celle des termes de séance, qui s'accumulent.
 *  ⚠️ LE GENRE EST VÉRIFIÉ. Un `ref` de genre `species` posé sous ce chemin
 *  irait lire `data.destiny.base` — la Base d'espèce, déjà comptée ailleurs —
 *  et le Score serait faux en ayant l'air juste. */
const ARCANA_TAIL = "arcana";
const ARCANA_KIND = "arcana";

/** Le champ où un record de couche porte sa contribution au Score. La
 *  convention vient de la couche des espèces (`data.destiny.base`,
 *  `data.destiny.base_bonus`, lot 15) : le namespace `data.destiny`, puis un
 *  nom de TERME. La carte porte son `impact`, le don son `bonus`. Deux mots
 *  différents parce que ce sont deux termes différents du détail — les
 *  confondre reviendrait à dire que le moteur additionne des `destiny.value`
 *  anonymes, et le `breakdown` cesserait de dire d'où vient quoi. */
const DESTINY_DATA = "destiny";

const SESSION_TERMS = {
  /* La Gloire est UN terme SIGNÉ, jamais deux quantités : négatif = Damnation.
     Elle est une décision de MJ (Eric : « c'est décidé par le MJ — un haut
     fait peut rajouter 1 »), donc elle porte `by: "gm"`. */
  glory: { by: "gm" },
  /* L'Éveil est décidé par les DÉS, pas par une personne : pas de `by`. Lui en
     coller un désignerait un responsable là où il n'y en a pas. */
  awakening: { by: null }
};

function fail(what) {
  throw new Error(`fhpc/fh: ${what}`);
}

/* ── LE TERME DE SÉANCE, LU SUR UN CHOIX ─────────────────────────────
   `tail` est le chemin PRIVÉ DE SON PRÉFIXE : `fh.destiny.glory[0]` arrive
   ici en `glory[0]`. Tout écart est un refus qui NOMME le chemin fautif. */
function readSessionChoice(entry) {
  const match = /^([a-z][a-zA-Z0-9]*)\[(?:[0-9]+)\]$/.exec(entry.tail);
  if (!match) {
    fail(`the choice "${entry.path}" is not a Destiny Score term — the shape is ` +
      `"${FH_DESTINY_FLAG}.<term>[n]", and the terms are: ${Object.keys(SESSION_TERMS).join(", ")}. ` +
      "A path this module cannot read is a refusal, not a line it quietly drops.");
  }
  const term = match[1];
  if (!Object.hasOwn(SESSION_TERMS, term)) {
    /* REWRITTEN 2026-08-10 (lot 20) — l'ancienne raison disait « The Arcana
       impact, the Destiny Touched feat and the Other line have no rule source
       to read ». Les deux premiers EN ONT UNE depuis ce lot, et un refus qui
       ment sur la raison envoie chercher au mauvais endroit. Le refus lui-même
       n'est pas relâché : la forme `<terme>[n]` reste celle des termes de
       séance, et l'Arcane ne s'écrit pas ainsi — il s'écrit `${ARCANA_TAIL}`,
       nu, avec un `ref`. La ligne « Other » reste, elle, sans source. */
    fail(`the choice "${entry.path}" names the term "${term}", which the Destiny Score does not carry under the ` +
      `indexed form "<term>[n]" — the terms decided at the table are: ${Object.keys(SESSION_TERMS).join(", ")}. ` +
      `The Major Arcana is not one of them: a character carries ONE card, named by "${ARCANA_TAIL}" with a ` +
      "`ref`, not a list of numbers. The Other line has no rule source to read at all, and inventing a " +
      "channel for it would be inventing a rule.");
  }
  if (entry.ref !== undefined) {
    /* REWRITTEN 2026-08-10 (lot 20) — LE GARDE EST RESTREINT, PAS OUVERT.
       L'ancienne raison disait qu'AUCUN record de la pile ne porte un terme du
       Score ; c'est devenu faux pour la carte, qui EST un record. Elle reste
       vraie mot pour mot pour la Gloire et l'Éveil : ce sont des nombres
       décidés à la table, et un `ref` posé là serait un record qu'on lit à la
       place d'une décision. Le chemin de l'Arcane ne passe pas par ici — il
       est aiguillé avant. Un test le prouve, sinon j'aurais remplacé un garde
       par une porte. */
    fail(`the choice "${entry.path}" carries a \`ref\` to a layer record — the term "${term}" is a NUMBER ` +
      "decided at the table, and no record in the stack states it. Use `set`, not `choose`. " +
      `(The one path of this namespace that DOES name a record is "${ARCANA_TAIL}".)`);
  }
  if (!Number.isInteger(entry.value)) {
    fail(`the choice "${entry.path}" carries ${JSON.stringify(entry.value)} — a Destiny Score term is a whole ` +
      "signed number (negative Glory is Damnation). A term the engine cannot add is a refusal, not a zero.");
  }
  if (typeof entry.label !== "string" || entry.label.trim() === "") {
    fail(`the choice "${entry.path}" carries no \`label\` — Eric's rule, 2026-08-08: "the +X we give the score ` +
      'will be motivated by an entry on the character sheet: \'+1 Glory, saved the region from destruction\'". ' +
      "The same entry is read at the table AND counts in the total; a discretionary term without a trace " +
      "can be neither disputed nor corrected.");
  }
  const line = { label: entry.label, value: entry.value };
  if (SESSION_TERMS[term].by) line.by = SESSION_TERMS[term].by;
  return line;
}

/* ── LA BASE D'ESPÈCE, EN DEUX LIGNES ────────────────────────────────
   `data.destiny` est de la DONNÉE DE COUCHE (lot 15) : `{base}` pour onze
   espèces, `{base, base_bonus, base_bonus_trait}` pour l'Elfe. */
function speciesLines(species, lines, underived) {
  if (!species) {
    underived.push({
      field: `stats[${FH_DESTINY_ID}].base`,
      reason: "aucun choix `species` : la Base de Destinée est une donnée de l'espèce (`data.destiny.base`), " +
        "et un personnage sans espèce n'en a aucune à lire. Poser 2 par défaut ferait passer la valeur " +
        "des douze espèces d'Eric pour une règle du moteur."
    });
    return;
  }
  const data = species.data || {};
  const destiny = data.destiny;
  if (!destiny || typeof destiny !== "object") {
    underived.push({
      field: `stats[${FH_DESTINY_ID}].base`,
      reason: `le record d'espèce « ${species.id} » ne porte pas \`data.destiny\` : la couche FH le pose sur ` +
        "les douze espèces (lot 15), et une espèce qui n'en a pas vient d'une couche tierce ou amputée. " +
        "Le moteur ne lui invente pas de Base."
    });
    return;
  }
  if (!Number.isInteger(destiny.base)) {
    fail(`the species record "${species.id}" carries \`data.destiny.base\` = ${JSON.stringify(destiny.base)}, ` +
      "which is not a whole number — a Destiny Base that cannot be added is bad content, not a missing field.");
  }
  lines.push({
    label: t("fh.destiny.term.base", { species: species.name }),
    value: destiny.base,
    source: { kind: "species", id: species.id }
  });

  if (destiny.base_bonus === undefined) return;
  /* ⚠️ DEUX LIGNES, PAS UNE ADDITION. Le bonus a une source NOMMÉE — le trait
     qui l'accorde — et l'additionner dans la base perdrait pourquoi il est là.
     Son libellé EST le nom du trait, recopié : aucun mot fabriqué ici. */
  if (!Number.isInteger(destiny.base_bonus)) {
    fail(`the species record "${species.id}" carries \`data.destiny.base_bonus\` = ` +
      `${JSON.stringify(destiny.base_bonus)}, which is not a whole number.`);
  }
  const traitId = destiny.base_bonus_trait;
  const traits = [...(Array.isArray(data.fh_traits) ? data.fh_traits : []),
    ...(Array.isArray(data.traits) ? data.traits : [])];
  const trait = traits.find((item) => item && item.id === traitId);
  if (!trait || typeof trait.name !== "string") {
    /* Le nombre est CONNU et le mot manque : sauter la ligne rendrait un Score
       court d'exactement ce bonus, et personne ne verrait de quoi. Le refus est
       donc bruyant — c'est du contenu faux, pas un travail à finir. */
    fail(`the species record "${species.id}" grants a Destiny Base bonus of ${destiny.base_bonus} through ` +
      `\`base_bonus_trait\` = ${JSON.stringify(traitId)}, and no trait of that id carries a name. ` +
      "Dropping the line would leave the Score short by exactly that bonus, silently; naming it " +
      "after its own id would put an identifier where a human reads a reason.");
  }
  lines.push({
    label: trait.name,
    value: destiny.base_bonus,
    source: { kind: "species", id: species.id }
  });
}

/* ── L'ARCANE MAJEUR, LU SUR LE RECORD QUE LE CHOIX DÉSIGNE ──────────
   Lot 20. Le personnage nomme SA carte par un `ref`, exactement comme il nomme
   son espèce, sa classe et son historique — la forme que la révision du
   2026-08-09 a rendue légale sans ajouter un seul champ.

   TROIS SITUATIONS, ET ELLES NE SE RESSEMBLENT PAS. Les confondre serait le
   défaut du lot :
     · AUCUN CHOIX → le personnage ne nomme aucune carte. Déclaré.
     · UN CHOIX, ET LE GENRE RÉPOND VIDE → la couche des 22 cartes n'est pas
       montée. Déclaré, en nommant le contenu qui manque : le contrat, lui,
       est là depuis la révision du 2026-08-09 (GAP-KIND clos).
     · UN CHOIX, LE GENRE EST PEUPLÉ, ET LA CARTE N'Y EST PAS → c'est un `ref`
       MORT. Il JETTE : le personnage a été construit sur une couche qui n'est
       plus là, et compter 0 lui volerait jusqu'à 2 points en silence. */
function arcanaLines(entry, records, lines, underived) {
  if (!entry) {
    underived.push({
      field: `stats[${FH_DESTINY_ID}].arcana`,
      reason: `aucun choix \`${FH_DESTINY_FLAG}.${ARCANA_TAIL}\` : l'impact de l'Arcane majeur est une donnée de LA ` +
        "CARTE (`data.destiny.impact`), et un personnage qui n'en nomme aucune n'en a aucune à lire. " +
        "L'impact vaut 0, 1 ou 2 selon la carte — jamais codable en dur, donc jamais supposé non plus."
    });
    return;
  }
  if (entry.ref === undefined) {
    fail(`the choice "${entry.path}" carries a value, not a \`ref\` — a Major Arcana is a RECORD of the stack, ` +
      "and its impact is read on the card. A number written here would be the engine restating a rule that " +
      "belongs to content, and it would survive the day the card is rebalanced.");
  }
  if (entry.ref.kind !== ARCANA_KIND) {
    fail(`the choice "${entry.path}" designates a "${entry.ref.kind}" record — this path names a card, and only ` +
      `the "${ARCANA_KIND}" genre carries one. A record of another genre may well hold a \`data.destiny\` of ` +
      "its own (a species holds its Base), and reading it here would count that term TWICE.");
  }
  if (typeof records !== "function") {
    fail("the derivation handed this module no way to read the stack — the Major Arcana term is read on a record, " +
      "and a module that cannot reach records can only invent it. This is a wiring failure, not missing content.");
  }
  const pool = records(ARCANA_KIND);
  if (!Array.isArray(pool) || pool.length === 0) {
    underived.push({
      field: `stats[${FH_DESTINY_ID}].arcana`,
      reason: `le personnage nomme la carte « ${entry.ref.id} » et AUCUNE couche montée ne porte de record ` +
        "`arcana`. Le genre, lui, EXISTE depuis la révision du 2026-08-09 (trou GAP-KIND clos) : il répond, " +
        "et il répond VIDE. Ce qui manque est le CONTENU — la couche des 22 cartes (`fh-arcana-en`) n'est pas " +
        "montée. L'impact vaut 0, 1 ou 2 selon la carte : un nombre posé ici serait inventé."
    });
    return;
  }
  const card = records(ARCANA_KIND, entry.ref.id);
  if (!card) {
    fail(`the choice "${entry.path}" designates the card "${entry.ref.id}", which is in none of the ${pool.length} ` +
      "carried by the stack — the layer that held it is gone, or a higher layer disabled it. A dead reference " +
      "is a character built on a stack that is no longer there; counting 0 would quietly cost up to 2 points.");
  }
  if (typeof card.name !== "string" || card.name.trim() === "") {
    /* Le libellé EST le nom du record, recopié — la règle que le lot 19 a
       appliquée au bonus de l'Elfe (loi §0.13). Le nommer d'après son id
       mettrait un identifiant là où un humain lit une carte. */
    fail(`the card record "${entry.ref.id}" carries no usable \`name\`, and the breakdown line is labelled with it, ` +
      "copied. Naming the line after the record id would put an identifier where a human reads a card.");
  }
  const destiny = card.data && card.data[DESTINY_DATA];
  const impact = destiny && typeof destiny === "object" ? destiny.impact : undefined;
  if (!Number.isInteger(impact)) {
    fail(`the card record "${entry.ref.id}" carries \`data.${DESTINY_DATA}.impact\` = ${JSON.stringify(impact)}, ` +
      "which is not a whole number — the twenty-two cards carry 0, 1 or 2. An impact the engine cannot add " +
      "is bad content, not a missing field: dropping the line would leave the Score short by exactly it.");
  }
  lines.push({ label: card.name, value: impact, source: { kind: ARCANA_KIND, id: card.id } });
}

/* ── LE DON QUI PORTE UNE VALEUR DE DESTINÉE ─────────────────────────
   Lot 20. Le don ne vit PAS dans le namespace de ce module : la table de
   couverture v1 le range sous `background.originFeat[n]`, comme n'importe quel
   don d'origine, et c'est la bonne place — un personnage ne doit pas déclarer
   son don deux fois. La dérivation tend donc au module les records que les
   choix désignent, et le module RÉCLAME ceux qu'il a lus.

   UN DON SANS `data.destiny` N'EST PAS UN REFUS : c'est le cas des 17 dons du
   SRD, et de tous ceux à venir. Le champ absent dit « ce don ne touche pas au
   Score », et c'est un fait, pas un trou. Un `data.destiny` PRÉSENT dont le
   bonus n'est pas un entier, en revanche, est du contenu faux — il jette. */
function featLines(feats, lines, underived, consumed) {
  const bearers = [];
  for (const feat of Array.isArray(feats) ? feats : []) {
    const destiny = feat && feat.data ? feat.data[DESTINY_DATA] : undefined;
    if (destiny === undefined) continue;
    if (!destiny || typeof destiny !== "object") {
      fail(`the feat record "${feat.id}" carries \`data.${DESTINY_DATA}\` = ${JSON.stringify(destiny)}, which is ` +
        "not an object — the convention of this layer is `data.destiny.<term>`, and a scalar there hides which " +
        "term of the Score it was meant to be.");
    }
    if (!Number.isInteger(destiny.bonus)) {
      fail(`the feat record "${feat.id}" carries \`data.${DESTINY_DATA}.bonus\` = ${JSON.stringify(destiny.bonus)}, ` +
        "which is not a whole number. A feat that announces a Destiny value and cannot state it is bad content, " +
        "not a feat to skip: skipping it would leave the Score short without a word.");
    }
    if (typeof feat.name !== "string" || feat.name.trim() === "") {
      fail(`the feat record "${feat.id}" grants ${destiny.bonus} to the Destiny Score and carries no usable ` +
        "`name` — the breakdown line is labelled with it, copied from the record (loi §0.13).");
    }
    bearers.push(feat);
  }
  if (bearers.length === 0) {
    const chosen = (Array.isArray(feats) ? feats : []).map((feat) => feat.id);
    underived.push({
      field: `stats[${FH_DESTINY_ID}].feat`,
      reason: chosen.length === 0
        ? "aucun choix ne désigne de record `feat` : la valeur de Destinée d'un don est portée par le don " +
          "(`data.destiny.bonus`), et un personnage sans don n'en a aucune à lire. Le +2 d'Auspicious (fh) " +
          "est une règle connue, mais elle appartient à son record — pas à une constante du moteur."
        : `aucun des dons choisis ne porte \`data.${DESTINY_DATA}.bonus\` (${chosen.join(", ")}) : les dons du SRD ` +
          "n'ont aucune valeur de Destinée, et c'est un FAIT, pas un trou. Le don qui en porte une est " +
          "`fh:feat:en:auspicious`, dans la couche `fh-feats-en` — si le personnage le joue, c'est que " +
          "la couche n'est pas montée ou que le choix ne le désigne pas."
    });
    return;
  }
  for (const feat of bearers) {
    lines.push({ label: feat.name, value: feat.data[DESTINY_DATA].bonus, source: { kind: "feat", id: feat.id } });
    if (typeof feat.path === "string") consumed.push(feat.path);
  }
}

/**
 * Le module de statistique dérivée que le bloc `build` reçoit par injection.
 *
 * Il ne connaît ni le noyau, ni le bus, ni le document : on lui passe ce que
 * le pli a déjà su lire, il rend UNE entrée `resolved.stats[]` et la liste de
 * ce qu'il n'a pas pu dériver.
 */
export function createFhDestinyStat() {
  return {
    flag: FH_DESTINY_FLAG,
    id: FH_DESTINY_ID,

    /**
     * @param {object} input
     * @param {number|null} input.proficiency  `resolved.proficiency`, ou `null` si le pli ne l'a pas dérivée
     * @param {object|null} input.species      le record d'espèce choisi : `{id, name, slug, data}`
     * @param {Array}       input.choices      les choix sous `fh.destiny.*`, dans l'ordre du document
     * @param {Function}    input.records      `(kind, id?) => vue aplatie | null | liste du genre` (lot 20)
     * @param {Array}       input.refs         les records que le personnage désigne HORS de ce namespace, `{path, kind, id, name, slug, data}` — ce module ne regarde que les `feat` (lot 20, généralisé par l'architecte le 2026-08-09)
     * @returns {{stat: object|null, underived: Array, consumed: string[]}}
     */
    contribute({ proficiency, species, choices, records, refs }) {
      const underived = [];
      const derivedLines = [];
      /* Les choix HORS namespace que ce module a réellement lus. La dérivation
         ne les marque consommés que sur cette réclamation : un don qui compte
         dans le Score ne doit pas ressortir « il ne change rien à la fiche ». */
      const consumed = [];

      /* 1. LA MAÎTRISE. Un nombre qu'on ne sait pas calculer est ABSENT,
         jamais zéro (règle de refus n°1 de la dérivation) : sans elle, la
         ligne ne vaut pas 0, elle n'existe pas et elle se déclare. */
      if (Number.isInteger(proficiency)) {
        derivedLines.push({ label: t("fh.destiny.term.proficiency"), value: proficiency });
      } else {
        underived.push({
          field: `stats[${FH_DESTINY_ID}].proficiency`,
          reason: "le bonus de maîtrise n'a pas été dérivé, et il est un terme du Score : le compter pour 0 " +
            "rendrait un Score plus bas de 2 à 6 points sans que rien ne le dise."
        });
      }

      /* 2. LA BASE D'ESPÈCE, en une ou deux lignes. */
      speciesLines(species, derivedLines, underived);

      /* 3. LES TERMES DE SÉANCE, dans l'ordre où la table les a écrits — et
         L'AIGUILLAGE. Le chemin de l'Arcane est mis de côté AVANT la lecture
         des termes de séance : c'est le seul du namespace qui nomme un record,
         et le refus du `ref` doit continuer à mordre sur tous les autres. */
      let arcanaChoice = null;
      const sessionChoices = [];
      for (const entry of choices) {
        if (entry.tail === ARCANA_TAIL) arcanaChoice = entry;
        else sessionChoices.push(entry);
      }
      const sessionLines = sessionChoices.map(readSessionChoice);

      /* 4. L'ARCANE ET LE DON, lus sur leurs records — jamais écrits en dur.
         REWRITTEN 2026-08-10 (lot 20) : ces deux termes étaient DÉCLARÉS non
         dérivables ici même, et la déclaration disait vrai le jour où elle a
         été écrite. Elle est devenue fausse dès que la couche des 22 cartes et
         la fiche du don sont entrées dans le dépôt — et une déclaration fausse
         est pire qu'aucune, elle envoie refaire un travail déjà fait. Elles ne
         sont pas SUPPRIMÉES pour autant : elles ressortent, avec la raison
         exacte, dès que le contenu ou le choix manque (voir les deux lecteurs
         plus haut). */
      arcanaLines(arcanaChoice, records, derivedLines, underived);
      /* Le canal est générique depuis le 2026-08-09 : c'est au module de dire
         quel genre l'intéresse. Ici les dons, et eux seuls — une classe ou un
         arrière-plan désignés par le personnage ne portent pas de valeur de
         Destinée, et les lire ici fabriquerait un terme que rien ne motive. */
      featLines((Array.isArray(refs) ? refs : []).filter((ref) => ref.kind === "feat"),
        derivedLines, underived, consumed);

      /* 5. CE QUI N'EST DÉRIVABLE DE RIEN, déclaré au lieu d'être inventé.
         REWRITTEN 2026-08-10 (lot 20) — la raison disait « n'a pas plus de
         source de règle que les deux précédentes ». Les deux précédentes en
         ONT une désormais, et la comparaison devenait un aveu à l'envers : le
         lecteur en aurait déduit qu'il suffit d'écrire une couche. Ce n'est
         pas le cas — « Other » n'est pas UN contenu manquant, c'est TROIS
         familles de contenus (objet magique, boon, sous-classe) dont aucune
         n'a de genre, de champ ni de décision d'architecte. Le verdict ne
         bouge pas ; c'est la raison qui devient exacte. */
      underived.push({
        field: `stats[${FH_DESTINY_ID}].other`,
        reason: "la ligne « Other » du builder v1 recouvre trois familles — objet magique, boon, sous-classe — et " +
          "aucune ne porte de valeur de Destinée dans un champ que ce module pourrait lire. Ce n'est donc pas " +
          "une couche qui manque, comme pour l'Arcane et le don : c'est une décision qui n'a pas été prise. " +
          "Un MJ qui veut la porter aujourd'hui l'écrit comme un terme de séance motivé, pas comme une dérivation."
      });

      const breakdown = derivedLines.concat(sessionLines);
      /* `$defs/resolved.stats[].breakdown` exige AU MOINS UN TERME : « un Score
         sans détail serait exactement l'objet que cette collection existe pour
         remplacer ». Sans une seule ligne, il n'y a donc pas d'entrée à publier
         — et c'est dit, pas tu. */
      if (breakdown.length === 0) {
        underived.push({
          field: `stats[${FH_DESTINY_ID}]`,
          reason: "aucun terme du Score n'a pu être établi — ni la maîtrise, ni la Base d'espèce, ni l'Arcane, " +
            "ni un don, et la table n'a inscrit aucun terme de séance. Le schéma exige au moins un terme de " +
            "détail, et un Score sans détail est exactement ce que cette collection existe pour remplacer."
        });
        return { stat: null, underived, consumed };
      }

      return {
        stat: {
          id: FH_DESTINY_ID,
          flag: FH_DESTINY_FLAG,
          name: t("fh.destiny.score"),
          value: breakdown.reduce((total, line) => total + line.value, 0),
          breakdown
        },
        underived,
        consumed
      };
    }
  };
}
