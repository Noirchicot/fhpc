/* ══ L'OBJET CRAFTÉ — CE QUE LA FICHE EN GARDE, ET COMMENT IL SE NOMME ═════════
   Lot 265, 2026-09-25.

   ⚖️ Eric, 25/09 : *« l'objet crafté va dans l'équipement du personnage et par
   extension il existe à cette table de jeu, il peut être échangé avec les autres
   persos »* — puis, aux trois questions : **le craft se paie** (la bourse),
   **l'objet arrive tout de suite** (le temps de craft s'affiche, il ne bloque pas),
   **le site ne stocke rien** (il affiche et recalcule).

   ⭐ LA FICHE GARDE LA RECETTE, JAMAIS LE RÉSULTAT. Une ligne `gear[N]` crafté,
   c'est la ligne d'un objet ordinaire — `gear[N]` pointe sur sa BASE (la Longsword
   du SRD) — plus trois compléments facultatifs :
     · `gear[N].bonus`      — le mot du bonus, `"+1"` ;
     · `gear[N].powers[K]`  — chaque pouvoir, une RÉFÉRENCE au record du SRD ;
     · `gear[N].plan`       — le plan d'où il vient (`Weapon, +1, +2, or +3`) ;
     · `gear[N].note`       — *« Crafted by … »*, une ligne sans effet de jeu.
   ⛔ Aucun nom, aucun prix, aucun poids n'est écrit : ils se RECOMPOSENT à chaque
   ouverture. Un nombre enregistré diverge au premier réglage ; une recette suit.
   📏 Le format l'acceptait déjà, sans révision de `fh-char/1` : un choix est une
   référence OU un scalaire, et `gear[3].powers[0]` passe `choicePath`.

   ⛔ MODULE FEUILLE : aucun import. Le moteur (`derive.mjs`) et l'écran
   (`equipment-step.mjs`) nomment la MÊME ligne par la MÊME fonction — deux copies
   divergeraient au premier pouvoir ajouté. */

/** Le plafond du nom dans `resolved.gear[].name` (`fh-char/1`, `maxLength: 100`). */
export const NOM_MAX = 100;

/** `"+1"` → 1 · `"+3"` → 3 · tout le reste → `null`.
 *  ⚖️ LE SRD S'ARRÊTE À +3 (`Weapon, +1, +2, or +3`). 🔴 La première écriture
 *  acceptait `[1-9]` : le garde 3 l'a vu, une armure « +9 » prenait neuf points
 *  de CA. ⛔ Un bonus illisible n'est pas un zéro : l'appelant n'ajoute rien. */
export function lireLeBonus(valeur) {
  const m = typeof valeur === "string" ? /^\+([1-3])$/.exec(valeur.trim()) : null;
  return m ? Number(m[1]) : null;
}

/** Le nom d'un objet crafté : `Longsword +1 (Flame Tongue, Vicious)`.
 *  ⚖️ LA FORME EST UN DÉFAUT DU LOT 265, pas une règle d'Eric : la base d'abord
 *  (c'est ce qu'on tient en main), le bonus collé, les pouvoirs entre parenthèses
 *  dans l'ordre POWER 1 · POWER 2.
 *  ⛔ Un objet sans bonus ni pouvoir garde le nom de sa base — il n'est pas crafté.
 *  📏 Tronqué à `NOM_MAX` par une ellipse : le schéma refuse au-delà, et un
 *  document refusé ne se sauve pas. */
export function nomCrafte({ base, bonus = null, pouvoirs = [] } = {}) {
  const tete = String(base || "").trim();
  const plus = lireLeBonus(bonus) ? ` +${lireLeBonus(bonus)}` : "";
  const noms = (pouvoirs || []).map((p) => String(p || "").trim()).filter(Boolean);
  const nom = `${tete}${plus}${noms.length ? ` (${noms.join(", ")})` : ""}`;
  return nom.length <= NOM_MAX ? nom : `${nom.slice(0, NOM_MAX - 1)}…`;
}

/** La ligne porte-t-elle une recette ? — un bonus lisible ou au moins un pouvoir. */
export function estCrafte({ bonus = null, pouvoirs = [] } = {}) {
  return lireLeBonus(bonus) !== null || (pouvoirs || []).length > 0;
}
