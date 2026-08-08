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
   Le Score est la somme de son détail, terme par terme. DEUX termes sont
   dérivables de la construction, DEUX naissent en séance, et TROIS ne sont
   dérivables de rien aujourd'hui — mesuré avant d'écrire une ligne :

   DÉRIVÉS (la construction les porte)
     1. la MAÎTRISE — `resolved.proficiency`, déjà dérivée par le pli ;
     2. la BASE DE DESTINÉE de l'espèce — `data.destiny.base` (2 pour les
        douze espèces), plus `base_bonus` quand il existe. DEUX LIGNES, pas
        une addition : le bonus a une source nommée (l'Elfe : +2 par
        `splinter-of-anon`), et l'écraser dans la base perdrait POURQUOI il
        est là.

   DE SÉANCE (ils entrent par `build.choices`, voir plus bas)
     3. la GLOIRE / DAMNATION — décidée par le MJ, UN terme SIGNÉ ;
     4. le +1 de chaque ÉVEIL ARCANIQUE MAJEUR — décidé par les dés.

   NON DÉRIVABLES, ET DÉCLARÉS PLUTÔT QU'INVENTÉS
     5. l'impact de l'ARCANE MAJEUR — la couche FH ne porte que le genre
        `species`, donc aucune carte à lire.
        ⚠️ RÉÉCRIT LE 2026-08-09, et la RAISON A CHANGÉ DE NATURE : ce terme
        était bloqué par le CONTRAT (le genre `arcana` n'existait pas dans
        l'énumération fermée — trou GAP-KIND). L'architecte a ouvert le genre
        dans les deux schémas ce jour-là, et GAP-KIND est CLOS. Ce qui reste
        est du CONTENU : personne n'a encore écrit la couche des 22 cartes.
        La distinction n'est pas cosmétique — dire encore « le genre n'existe
        pas » enverrait le prochain lot réviser un schéma déjà révisé ;
     6. le don DESTINY TOUCHED (fh) — les 17 dons SRD ne portent aucune
        valeur de Destinée, et la couche FH n'ajoute aucun `feat` ;
     7. la ligne OTHER (objet magique, boon, sous-classe) — même mesure.

   Un Score qui inventerait 5, 6 ou 7 serait un Score FAUX qui aurait l'air
   juste. Ils se déclarent, chacun avec sa raison nommée, à chaque pli.

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
    fail(`the choice "${entry.path}" names the term "${term}", which the Destiny Score does not carry — ` +
      `the terms decided at the table are: ${Object.keys(SESSION_TERMS).join(", ")}. ` +
      "The Arcana impact, the Destiny Touched feat and the Other line have no rule source to read, " +
      "and inventing a channel for them would be inventing a rule.");
  }
  if (entry.ref !== undefined) {
    fail(`the choice "${entry.path}" carries a \`ref\` to a layer record — a Destiny Score term is a NUMBER ` +
      "decided at the table, and no record in the stack states it. Use `set`, not `choose`.");
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
     * @returns {{stat: object|null, underived: Array<{field:string,reason:string}>}}
     */
    contribute({ proficiency, species, choices }) {
      const underived = [];
      const derivedLines = [];

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

      /* 3. LES TERMES DE SÉANCE, dans l'ordre où la table les a écrits. */
      const sessionLines = choices.map(readSessionChoice);

      /* 4. CE QUI N'EST DÉRIVABLE DE RIEN, déclaré au lieu d'être inventé. */
      underived.push({
        field: `stats[${FH_DESTINY_ID}].arcana`,
        reason: "l'impact de l'Arcane majeur n'a AUCUNE source de règle à lire : aucune couche montée ne porte " +
          "de record `arcana`. Le genre, lui, EXISTE depuis la révision du 2026-08-09 (trou GAP-KIND clos) : " +
          "ce qui manque est le CONTENU, une couche portant les 22 cartes, et non une place au schéma. " +
          "L'impact vaut 0, 1 ou 2 selon la carte — un nombre écrit ici serait inventé."
      });
      underived.push({
        field: `stats[${FH_DESTINY_ID}].feat`,
        reason: "le don Destiny Touched (fh) vaut +2 dans les règles d'Eric, et aucun record ne le dit : les 17 " +
          "dons SRD ne portent aucune valeur de Destinée, et la couche FH n'ajoute aucun `feat`. " +
          "Le +2 est une règle connue sans porteur — il attend un record, pas une constante de moteur."
      });
      underived.push({
        field: `stats[${FH_DESTINY_ID}].other`,
        reason: "la ligne « Other » du builder v1 (objet magique, boon, sous-classe) n'a pas plus de source de " +
          "règle que les deux précédentes. Un MJ qui veut la porter aujourd'hui l'écrit comme un terme " +
          "de séance motivé, pas comme une dérivation."
      });

      const breakdown = derivedLines.concat(sessionLines);
      /* `$defs/resolved.stats[].breakdown` exige AU MOINS UN TERME : « un Score
         sans détail serait exactement l'objet que cette collection existe pour
         remplacer ». Sans une seule ligne, il n'y a donc pas d'entrée à publier
         — et c'est dit, pas tu. */
      if (breakdown.length === 0) {
        underived.push({
          field: `stats[${FH_DESTINY_ID}]`,
          reason: "aucun terme du Score n'a pu être établi — ni la maîtrise, ni la Base d'espèce, et la table " +
            "n'a inscrit aucun terme de séance. Le schéma exige au moins un terme de détail, et un Score " +
            "sans détail est exactement ce que cette collection existe pour remplacer."
        });
        return { stat: null, underived };
      }

      return {
        stat: {
          id: FH_DESTINY_ID,
          flag: FH_DESTINY_FLAG,
          name: t("fh.destiny.score"),
          value: breakdown.reduce((total, line) => total + line.value, 0),
          breakdown
        },
        underived
      };
    }
  };
}
