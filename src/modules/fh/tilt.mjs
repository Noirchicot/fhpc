/* ══ LE TILT — la seule façon dont Fate's Hand penche un jet ══════════
   Règle d'Eric, ratifiée le 2026-08-08 (logbook « FHV2 - Couche FH »,
   section « ⭐ Le mécanisme s'appelle Tilt »). LA TABLE, telle qu'elle est
   écrite, et rien d'autre :

     | Tilts       | Désavantage présent ? | Résultat                     |
     | 0           | non                   | jet normal                   |
     | 1           | non                   | +2                           |
     | 2 ou plus   | non                   | Avantage                     |
     | 0           | oui                   | Désavantage                  |
     | 1 ou plus   | oui                   | jet normal — tout s'annule   |

   ⭐ IL N'EXISTE PAS DE TILT NÉGATIF. Un malus s'exprime TOUJOURS en donnant
   un Tilt à l'autre côté : pénaliser une attaque, c'est un Tilt sur l'AC du
   défenseur ; pénaliser un jet de compétence, c'est un Tilt sur le DC — soit
   +2 au DC. Rien ne descend jamais du côté du lanceur, et c'est pour ça que
   ce fichier ne sait produire aucun nombre négatif.

   LA RAISON D'ERIC, ET C'EST ELLE QUI GOUVERNE LA FORME DE CE CODE :
   « ça évite aux humains des calculs trop compliqués. » Rien ne s'additionne.
   Le compte de Tilts n'est pas une somme de bonus, c'est un SEUIL — présence,
   ou absence, comme l'Avantage en 5e. D'où une table à cinq lignes plutôt
   qu'une formule, et d'où l'absence de tout plafond de valeur : trois Tilts
   ne valent pas plus que deux, et le dire coûte moins cher que de le borner.

   ── CE QUE CE FICHIER NE FAIT PAS, ET C'EST DÉLIBÉRÉ ──────────────────

   1. IL NE RÉIMPLÉMENTE NI L'AVANTAGE NI LE DÉSAVANTAGE. Ils existent dans le
      moteur SRD (`rollMode`, `makeDiePlan`) et le Tilt se contente de les
      PRODUIRE : il rend un `mode` du vocabulaire SRD, que le chemin commun
      sait déjà résoudre sans savoir d'où il vient.

   2. IL NE CALCULE AUCUNE SYNERGIE. Eric, même jour : « Une seule règle, et
      elle ne se calcule pas : 1 = +2 · 2 = avantage. […] c'est décidé en jeu,
      à la table. » FHPC reçoit un compte de Tilts, il ne le devine pas — et
      aucune table de synergie n'entre ici.

   3. IL NE TOUCHE PAS AUX CHIFFRES QUI RESTENT DES CHIFFRES. « Il n'y a plus
      de −2 » ne vise QUE les malus situationnels. Deux familles gardent leur
      nombre, tranchées par Eric le même jour :
        · l'ÉPUISEMENT — « un modificateur appliqué au jet, pas un +2 au DC » ;
          il vaut −1 par degré sous FH (`rules.exhaustionPerLevel`), et cette
          valeur est déjà juste, déjà câblée, déjà sous test ;
        · les −2 des TABLES DE FATALITÉ — des séquelles du Chaos sur une
          caractéristique, pas des modificateurs de jet.
      Aucun des deux ne passe par ce fichier, et aucun ne doit y passer.

   ── ⭐ LA COMPOSITION AVEC LE SRD — tranchée par Eric le 2026-08-09 ────

   « 2 tilts = avantage = on peut pas faire mieux / seuls les dés peuvent
   donner des bonus supplémentaires. » Puis, en toutes lettres :

     A + T = A   ·   A + A = A   ·   A + D = Flat
     D + (2T = A) = Flat         ·   D + T = Flat

   IL N'Y A PLUS DEUX SYSTÈMES D'ANNULATION, IL N'Y EN A QU'UN — et c'est ce
   qui permet de supprimer le refus que ce module opposait jusqu'ici. La règle
   tient en deux phrases, et la table ci-dessus ne change pas d'une ligne :

     · un AVANTAGE, d'où qu'il vienne, vaut le SEUIL DÉJÀ ATTEINT (2 Tilts) ;
     · un DÉSAVANTAGE, d'où qu'il vienne, bascule sur la deuxième colonne.

   Les cinq lignes d'Eric en découlent sans exception : `A + T` fait 2+1 Tilts,
   donc Avantage — et c'est là qu'est le PLAFOND, le +2 du Tilt ne s'ajoute
   PAS par-dessus un Avantage, parce qu'« on peut pas faire mieux ». `A + D`
   tombe sur « 1 ou plus + désavantage : tout s'annule ». `D + 2T` et `D + T`
   aussi.

   📌 ET UN CAS QU'ERIC N'A PAS ÉNONCÉ tombe juste tout seul, ce qui est le
   signe que la règle est la bonne et non un placage : `A + D + T` donne Flat,
   sans qu'on ait rien inventé pour lui.

   ⚠️ CE QUE LE PLAFOND IMPLIQUE, DIT FRANCHEMENT : sur un jet déjà en
   Avantage, un Tilt ne rapporte plus rien. C'est voulu — « seuls les dés
   peuvent donner des bonus supplémentaires », donc Bardic, Tactical Mind et
   la Destinée restent les seules voies au-delà du plafond.

   ⚠️ CE QUI N'EST TOUJOURS PAS DANS CE FICHIER : le côté DÉFENSEUR. Un Tilt
   sur l'AC ou sur le DC vaut +2, sans cumul (décision du 2026-08-09, l'idiome
   du couvert SRD : « a target benefits only from the most protective
   degree »). C'est un nombre que la table donne au moteur, pas un calcul
   qu'il fait ici. */

/** Les quatre résultats possibles, et il n'y en a pas de cinquième.
 *  Des IDENTIFIANTS, jamais des mots de joueur (loi §0.13) : le paquet de
 *  libellés de la couche en fait des phrases, ce fichier n'en fait rien. */
export const TILT_NORMAL = "normal";
export const TILT_PLUS_TWO = "plus-two";
export const TILT_ADVANTAGE = "advantage";
export const TILT_DISADVANTAGE = "disadvantage";

export const TILT_OUTCOMES = [TILT_NORMAL, TILT_PLUS_TWO, TILT_ADVANTAGE, TILT_DISADVANTAGE];

/** Le seul nombre de la règle. Un Tilt seul vaut +2 — pas +1 par Tilt. */
export const TILT_BONUS = 2;

/** Le seuil au-delà duquel un Tilt cesse de valoir un bonus et vaut un
 *  Avantage. « 2 ou plus » : c'est un seuil, pas un palier d'échelle — il n'y
 *  a rien après. */
export const TILT_ADVANTAGE_AT = 2;

function refuse(what) {
  throw new Error("fhpc/fh: " + what);
}

/**
 * La table, appliquée. Rend ce qu'elle rend et rien de plus : un identifiant
 * de résultat, le `mode` de d20 correspondant dans le vocabulaire du moteur
 * SRD, et le bonus plat.
 *
 * @param {object}  input
 * @param {number}  input.tilts         combien de Tilts penchent en faveur du jet — un entier ≥ 0
 * @param {boolean} input.disadvantage  un désavantage est-il présent sur ce jet ? (D'OÙ QU'IL VIENNE)
 * @param {boolean} [input.advantage]   un avantage est-il déjà présent ? (d'où qu'il vienne) Il vaut
 *                                      le seuil atteint : « on peut pas faire mieux » (Eric, 2026-08-09).
 * @returns {{tilts: number, disadvantage: boolean, advantage: boolean, outcome: string, mode: "flat"|"advantage"|"disadvantage", bonus: 0|2}}
 */
export function resolveTilt({ tilts, disadvantage, advantage = false } = {}) {
  /* §0.5 — un compte que le moteur ne sait pas lire est un REFUS, jamais un
     zéro consolant : un jet qui devait pencher et qui part à plat ne se
     remarque qu'à la table, une fois le dé tombé. */
  if (typeof tilts !== "number" || !Number.isSafeInteger(tilts)) {
    refuse(
      "a Tilt count must be a whole number — got " + JSON.stringify(tilts) +
      ". Tilts are counted, never measured: the table reads 0, 1, and \"2 or more\"."
    );
  }
  /* LE REFUS QUI PORTE LA RÈGLE ELLE-MÊME. Un −1 ici n'est pas une valeur
     hors bornes à ramener dans la plage : c'est quelqu'un qui croit qu'un
     malus se donne au lanceur. Le message dit où il se donne vraiment,
     sinon le refus n'apprend rien. */
  if (tilts < 0) {
    refuse(
      "there is no negative Tilt, and " + tilts + " asks for one. A malus is ALWAYS expressed by giving a " +
      "Tilt to the other side: penalising an attack is a Tilt on the defender's AC, penalising a check is a " +
      "Tilt on the DC — that is, +2 to the DC. Nothing ever subtracts from the roller."
    );
  }
  if (typeof disadvantage !== "boolean") {
    refuse(
      "a Tilt is resolved against the PRESENCE of a disadvantage, which is a boolean — got " +
      JSON.stringify(disadvantage) + ". Presence or absence, like Advantage in 5e: there is no amount of " +
      "disadvantage to weigh against the Tilt count."
    );
  }
  if (typeof advantage !== "boolean") {
    refuse(
      "an advantage is a PRESENCE too — got " + JSON.stringify(advantage) + ". Two advantages are one " +
      "advantage (Eric, 2026-08-09: « A + A = A »), so there is nothing to count here either."
    );
  }

  /* ⭐ L'AVANTAGE VAUT LE SEUIL DÉJÀ ATTEINT. C'est toute la composition avec
     le SRD, et elle tient en une ligne : « 2 tilts = avantage = on peut pas
     faire mieux ». Un jet déjà en Avantage est donc, pour cette table, un jet
     qui a déjà ses deux Tilts — d'où `A + T = A` sans que le +2 s'ajoute, et
     d'où `A + A = A` sans qu'on ait à le dire à part. */
  const effective = advantage ? Math.max(tilts, TILT_ADVANTAGE_AT) : tilts;

  /* Les cinq lignes, dans l'ordre où Eric les a écrites. La deuxième colonne
     de la table est un aiguillage, pas un terme d'une somme : un désavantage
     présent ne retire pas des Tilts, il change de ligne. */
  if (disadvantage) {
    /* « 1 ou plus » avec un désavantage : tout s'annule, et il n'en reste
       rien. C'est aussi `A + D = Flat` : l'Avantage compte pour deux, donc on
       est bien sur cette ligne — une seule règle d'annulation, pas deux. */
    if (effective >= 1) return outcome(tilts, true, advantage, TILT_NORMAL, "flat", 0);
    return outcome(tilts, true, advantage, TILT_DISADVANTAGE, "disadvantage", 0);
  }
  if (effective >= TILT_ADVANTAGE_AT) return outcome(tilts, false, advantage, TILT_ADVANTAGE, "advantage", 0);
  if (effective === 1) return outcome(tilts, false, advantage, TILT_PLUS_TWO, "flat", TILT_BONUS);
  return outcome(tilts, false, advantage, TILT_NORMAL, "flat", 0);
}

function outcome(tilts, disadvantage, advantage, id, mode, bonus) {
  return { tilts, disadvantage, advantage, outcome: id, mode, bonus };
}
