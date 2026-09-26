/* ══ LES EFFETS DES OBJETS MAGIQUES SUR LES CHIFFRES DE LA FICHE — lot 289 ═══════════
   ⚖️ Eric, 2026-09-26 : une Ioun Stone (Intellect) harmonisée donne VRAIMENT +2 en INT,
   et tout ce qui en découle bouge. L'inventaire du lot 282 (`sources-effets/`) dit, pour
   chaque objet magique du SRD, ses effets et la citation qui les prouve ; ce module est
   son SEUL lecteur (garde 6 de `tests/effets-objets.test.mjs`), par sa copie ES générée
   (`src/tools/gen-effets-objets.mjs` dit pourquoi ce chemin et pas une couche).

   ⛔ CE MODULE NE TOUCHE PAS LA FICHE. Il CLASSE les effets des lignes de `gear` et tient
   le REGISTRE de ce qui a été appliqué ; c'est `derive.mjs` qui l'appelle, à chaque
   endroit où un chiffre naît — parce que l'ordre y est TOUT (voir la tête du registre).

   ── LES RÈGLES D'ERIC (26/09, validées) ──────────────────────────────────────
   1. Un effet s'applique si l'objet est ÉQUIPÉ, et HARMONISÉ quand sa condition le dit
      (`harmonise`, `harmonise+porte`, `harmonise+tenu`). `porte` et `tenu` = équipé.
      `toujours` = dès qu'il est dans le sac.
   2. Les CONSOMMABLES (`consomme`) et les effets À ACTIVER (`active`) ne s'appliquent
      pas : temporaires, ils vont « à part » — même rangés dans le sac.
   3. On commence par la famille « chiffre », et seulement les cibles qui ont une place
      dans `resolved`.
   4. ① un effet DÉCLENCHÉ ne change pas les chiffres, il s'affiche à part ;
      ② un ÉTAT que le moteur voit (sans armure…) se calcule depuis l'équipement ;
      ③ un effet À CHOIX ne s'applique que si le choix est fait.

   ── LES TROIS SORTIES (`resolved.effects`) ───────────────────────────────────
   · `applied` : une entrée par CHIFFRE modifié (un +1 aux sauvegardes en fait six), avec
     son chemin d'override (`resolved.saves.str.bonus`), l'avant et l'après — la
     provenance qu'Eric lit en Expert view ;
   · `apart`   : ce qui ne change aucun chiffre, avec sa raison ;
   · `pending` : ce qui s'appliquerait avec l'harmonisation ou le choix, avec sa raison.
   ⛔ Les raisons sont des IDENTIFIANTS (loi §0.13) : l'écran les dira en mots. */
import DONNEES from "../../sources-effets/objets-magiques-srd.effets.mjs";
import { lireLeBonus } from "./objet-crafte.mjs";

/** « a creature can be attuned to a maximum of 3 magic items at once » (SRD, rappelé
 *  par Eric le 18/09). ⚠️ L'écran a le sien (`PLAFOND_HARMONISATION`, x1-ecran.mjs) : le
 *  moteur ne l'importe pas (un bloc n'importe pas `ui/`), un garde compare les deux. */
export const PLAFOND_HARMONISATION = 3;

const PAR_ID = new Map(DONNEES.objets.map((objet) => [objet.id, objet]));

/** Les effets d'un objet par son id de record — `[]` pour un objet que l'inventaire
 *  ne connaît pas (un objet maison n'a pas d'effets inventoriés : ce n'est pas une faute). */
export function effetsDeLObjet(id) {
  const objet = PAR_ID.get(id);
  return objet ? objet.effets : [];
}

/* ══ ① LES DÉCLENCHÉS — un chiffre qui ne vaut que dans une situation ═══════════════
   ⭐ Chacun est PROUVÉ par sa citation (le garde « marqueurs » les relit toutes) :
   ⛔ une liste par nom ne dit pas qu'elle est incomplète — c'est donc la DONNÉE qui la
   tient : tout effet chiffré dont la citation pose une restriction (« against », « made
   to », « if you », « bestowed by »…) doit être ici, dans les états, ou être un `fixe` /
   `plancher` (dont le « unless » EST la règle de calcul). */
export const DECLENCHES = [
  { id: "srd:item:en:arrow-catching-shield", cible: "ac", raison: "triggered",
    preuve: "against ranged attack rolls" },
  { id: "srd:item:en:gloves-of-swimming-and-climbing", cible: "skill.athletics", raison: "triggered",
    preuve: "checks made to climb or swim" },
  { id: "srd:item:en:rod-of-lordly-might", cible: "skill.athletics", raison: "triggered",
    preuve: "checks made to break through doors" },
  /* ⛔ pas un déclenché au sens strict : il augmente le score DONNÉ PAR UN AUTRE OBJET. Le
     moteur ne sait pas encore dire « ce score vient de la ceinture » — à part, avec sa raison. */
  { id: "srd:item:en:hammer-of-thunderbolts", cible: "ability.str", raison: "needs-other-item",
    preuve: "bestowed by your Belt of Giant Strength or Gauntlets of Ogre Power" }
];

/* ══ ② LES ÉTATS QUE LE MOTEUR VOIT — calculés depuis l'équipement ═════════════════
   `derive.mjs` les juge dans la CA, où il sait ce qui est porté. */
export const A_ETAT = [
  { id: "srd:item:en:bracers-of-defense", cible: "ac", etat: "no-armor-no-shield",
    preuve: "if you are wearing no armor and using no Shield" },
  { id: "srd:item:en:robe-of-the-archmagi", cible: "ac", etat: "no-armor",
    preuve: "If you aren’t wearing armor, your base Armor Class is 15 plus your Dexterity modifier" }
];

/** Les cibles qui ont une place dans `resolved`, et les modes que chacune sait recevoir.
 *  ⛔ `attack.weapon` / `damage.weapon` n'y sont pas : `resolved.actions` est vide. */
const CIBLES = [
  [/^ability\.(str|dex|con|int|wis|cha)$/, ["bonus", "fixe"]],
  [/^proficiency\.bonus$/, ["bonus"]],
  [/^ac$/, ["bonus", "fixe"]],
  [/^save\.all$/, ["bonus"]],
  [/^hp\.max$/, ["bonus"]],
  [/^speed\.walk$/, ["bonus", "plancher"]],
  [/^skill\.[a-z][a-z-]*$/, ["bonus"]],
  [/^check\.all$/, ["bonus"]],
  [/^attack\.spell$/, ["bonus"]],
  [/^dc\.spell$/, ["bonus"]]
];
const modesDeLaCible = (cible) => {
  const trouvee = CIBLES.find(([motif]) => motif.test(cible));
  return trouvee ? trouvee[1] : null;
};

/** La valeur NUMÉRIQUE d'un effet, ou `null`. Deux phrases de la source se lisent, et
 *  aucune autre : « +1 per level » (Berserker Axe) et « 15 + Dex » (Robe of the Archmagi,
 *  la base de CA — `plusDex` le dit). ⛔ Une valeur illisible n'est jamais un zéro. */
export function valeurNumerique(effet, { level } = {}) {
  const v = effet.valeur;
  if (Number.isInteger(v)) return { valeur: v };
  const texte = typeof v === "string" ? v.trim() : "";
  const parNiveau = /^\+?(-?\d+) per level$/.exec(texte);
  if (parNiveau) return Number.isInteger(level) ? { valeur: Number(parNiveau[1]) * level } : null;
  const plusDex = /^(\d+) \+ Dex$/.exec(texte);
  if (plusDex) return { valeur: Number(plusDex[1]), plusDex: true };
  return null;
}

/**
 * LE CLASSEMENT STATIQUE — ce que l'effet EST, sans rien savoir du personnage.
 * @returns {{voie:string, etat?:string}} `voie` = `applicable`, ou la raison de l'à-part.
 */
export function classerEffet(effet, id) {
  if (effet.condition === "consomme") return { voie: "consumable" };
  if (effet.condition === "active") return { voie: "activated" };
  if (effet.famille !== "chiffre") return { voie: "not-a-number" };
  const declenche = DECLENCHES.find((d) => d.id === id && d.cible === effet.cible);
  if (declenche) return { voie: declenche.raison };
  const modes = modesDeLaCible(effet.cible);
  if (!modes) return { voie: "no-place" };
  if (!modes.includes(effet.mode)) return { voie: "mode-unsupported" };
  const aEtat = A_ETAT.find((d) => d.id === id && d.cible === effet.cible);
  /* ⛔ `fixe` sur la CA n'a de sens que comme BASE d'un état (la Robe) */
  if (effet.cible === "ac" && effet.mode === "fixe" && !aEtat) return { voie: "mode-unsupported" };
  if (valeurNumerique(effet, { level: 1 }) === null) return { voie: "value-not-numeric" };
  return aEtat ? { voie: "applicable", etat: aEtat.etat } : { voie: "applicable" };
}

/** Le mot que la ligne a CHOISI : `gear[N].variant` (le mot que X5 écrit), sinon le bonus
 *  de la ligne (« Weapon/Armor, +1, +2, or +3 » : la variante EST le bonus, `lireLeBonus`). */
export function varianteChoisie({ variante, bonus }) {
  if (typeof variante === "string" && variante.trim()) return variante.trim();
  const plus = lireLeBonus(bonus);
  return plus === null ? null : `+${plus}`;
}

const HARMONISE = new Set(["harmonise", "harmonise+porte", "harmonise+tenu"]);

/** La partie PUBLIQUE d'une entrée — ce qui atterrit dans `resolved.effects`. */
function entree(ligne, objet, effet, extra) {
  const e = { line: ligne.index, object: ligne.name, item: objet.name, target: effet.cible, mode: effet.mode };
  if (effet.famille === "chiffre" && (Number.isInteger(effet.valeur) || typeof effet.valeur === "string")) {
    e.value = effet.valeur;
  }
  if (Number.isInteger(effet.plafond)) e.cap = effet.plafond;
  e.condition = effet.condition;
  if (typeof effet.variante === "string") e.variant = effet.variante;
  return Object.assign(e, extra);
}

/**
 * LE PLAN — chaque effet de chaque ligne, rangé.
 *
 * @param {object} p
 * @param {Array} p.lignes `{index, name, equipped, attuned, refKind, variante, bonus,
 *   objets:[{id, name, role:"ref"|"plan"|"power"}]}` — les lignes que `derive` a LUES
 *   (une ligne incomplète n'y est pas : un seul lecteur de `gear`).
 * @param {number} p.level le niveau (« +1 per level »)
 * @returns {{applicables:Array, apart:Array, pending:Array, harmonises:number, depasse:boolean}}
 */
export function planDesEffets({ lignes, level }) {
  const harmonises = lignes.filter((l) => l.attuned === true).length;
  const depasse = harmonises > PLAFOND_HARMONISATION;
  const applicables = [];
  const apart = [];
  const pending = [];
  for (const ligne of lignes) {
    const choisie = varianteChoisie(ligne);
    const vus = new Set();
    for (const objet of ligne.objets) {
      if (vus.has(objet.id)) continue;       // un plan qui est aussi un pouvoir ne compte qu'une fois
      vus.add(objet.id);
      for (const effet of effetsDeLObjet(objet.id)) {
        const statique = classerEffet(effet, objet.id);
        /* règle ③ — le choix, D'ABORD : une AUTRE variante que celle de la ligne n'est pas
           cet objet-là (une Potion of Giant Strength (Hill) n'est pas celle du Storm). */
        let choixManquant = false;
        if (typeof effet.variante === "string") {
          const racine = effet.variante.split(" — ")[0];
          if (choisie === null) choixManquant = true;
          else if (effet.variante !== choisie) {
            if (racine === choisie) choixManquant = true;   // la sous-variante n'est pas choisie
            else continue;
          }
        }
        /* règle 2 — consommables et à-activer : à part, où qu'ils soient rangés */
        if (statique.voie === "consumable" || statique.voie === "activated") {
          apart.push(entree(ligne, objet, effet, { reason: statique.voie }));
          continue;
        }
        /* règle 1 — hors `toujours`, un objet non équipé ne fait RIEN (ni pending) */
        if (effet.condition !== "toujours" && ligne.equipped !== true) continue;
        /* ⭐ LE BONUS D'UNE ARMURE CRAFTÉE EST DÉJÀ ÉCRIT PAR LA LIGNE (lot 265) — le +N de
           `Armor, +1, +2, or +3` ou de `Shield, +1…` sur la CA. La CA le note elle-même dans
           `applied` : le reprendre ici le compterait deux fois. */
        if (objet.role === "plan" && ligne.refKind === "armor" && effet.cible === "ac"
          && typeof effet.variante === "string" && /^\+\d$/.test(effet.variante)) continue;
        const demande = HARMONISE.has(effet.condition);
        const bloqueHarmonisation = demande && (ligne.attuned !== true || depasse);
        if (statique.voie !== "applicable") {
          /* ⛔ ce qui ne changerait aucun chiffre même harmonisé n'attend rien : il n'est
             « à part » que si l'objet AGIT sur le personnage */
          if (bloqueHarmonisation || choixManquant) continue;
          apart.push(entree(ligne, objet, effet, { reason: statique.voie }));
          continue;
        }
        if (choixManquant) { pending.push(entree(ligne, objet, effet, { reason: "choice" })); continue; }
        if (demande && ligne.attuned !== true) { pending.push(entree(ligne, objet, effet, { reason: "attunement" })); continue; }
        if (demande && depasse) { pending.push(entree(ligne, objet, effet, { reason: "attunement-cap" })); continue; }
        const lu = valeurNumerique(effet, { level });
        applicables.push({ ligne, objet, effet, valeur: lu.valeur, plusDex: lu.plusDex === true,
          etat: statique.etat || null, public: entree(ligne, objet, effet, {}) });
      }
    }
  }
  return { applicables, apart, pending, harmonises, depasse };
}

/** Le rang d'un mode dans l'ORDRE D'APPLICATION (voir le registre). */
const RANG = { bonus: 0, fixe: 1, plancher: 2 };

/** Un effet sur un nombre. `bonus` plafonné ne BAISSE jamais (« increases by 2, to a
 *  maximum of 20 » : le plafond borne la HAUSSE) ; `fixe` et `plancher` ne baissent
 *  jamais un nombre plus haut (« no effect on you if your Strength without the belt is
 *  equal to or greater than the belt's score » · « unless your Speed is higher »). */
export function appliquerAuNombre(avant, mode, valeur, plafond) {
  if (mode === "bonus") {
    if (!Number.isInteger(plafond)) return avant + valeur;
    return avant >= plafond ? avant : Math.min(avant + valeur, plafond);
  }
  if (mode === "fixe" || mode === "plancher") return Math.max(avant, valeur);
  throw new Error(`effets-objets : le mode « ${mode} » ne s'applique pas à un nombre.`);
}

/**
 * LE REGISTRE — ce que `derive` a appliqué, et où.
 *
 * ⚖️ L'ORDRE, ET SA PREUVE PAR LES CITATIONS : une BASE (le score des choix, la CA de
 * l'armure), puis les BONUS dans l'ordre du document (chacun borné par SON plafond),
 * puis les `fixe`, puis les `plancher`.
 *   · les bonus AVANT le `fixe` : la ceinture compare au score « without the belt »
 *     (Belt of Giant Strength) — c'est-à-dire à tout le reste, bonus compris ;
 *   · le plafond propre à chaque bonus : « increases by 2, to a maximum of 20 » borne CE
 *     bonus, pas un autre ;
 *   · `fixe` et `plancher` prennent le plus haut, jamais ne baissent (Gauntlets, Boots).
 * ⛔ Un effet APPLICABLE que personne n'a appliqué (la cible n'est pas dérivée) n'est pas
 *   perdu : `sortie()` le range « à part », raison `target-underived`.
 */
export function creerRegistre(plan) {
  const applied = [];
  const apart = plan.apart.slice();
  const utilises = new Set();
  const ecartes = new Set();
  const pour = (cible) => plan.applicables
    .filter((a) => a.effet.cible === cible && !ecartes.has(a))
    .sort((x, y) => RANG[x.effet.mode] - RANG[y.effet.mode]);
  return {
    /** Les effets applicables d'une cible, dans l'ordre d'application. */
    effets: pour,
    /** Applique à `avant` les effets de `cible` que `garder` retient ; rend l'après. */
    appliquer(cible, chemin, avant, garder = () => true) {
      let valeur = avant;
      for (const a of pour(cible)) {
        if (!garder(a)) continue;
        const apres = appliquerAuNombre(valeur, a.effet.mode, a.valeur, a.effet.plafond);
        applied.push({ ...a.public, value: a.valeur, path: chemin, before: valeur, after: apres });
        utilises.add(a);
        valeur = apres;
      }
      return valeur;
    },
    /** Note un changement que `derive` a calculé lui-même (une base d'état, le +N d'une ligne). */
    noter(a, chemin, avant, apres) {
      applied.push({ ...a.public, value: a.valeur, path: chemin, before: avant, after: apres });
      if (a.effet) utilises.add(a);
    },
    /** Un effet applicable dont la situation n'est pas réunie (② : une armure est portée). */
    ecarter(a, raison) {
      if (ecartes.has(a)) return;
      ecartes.add(a);
      apart.push({ ...a.public, reason: raison });
    },
    sortie() {
      for (const a of plan.applicables) {
        if (!utilises.has(a) && !ecartes.has(a)) apart.push({ ...a.public, reason: "target-underived" });
      }
      return { applied, apart, pending: plan.pending.slice() };
    }
  };
}
