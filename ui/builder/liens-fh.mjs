/* ══ LES LIENS DE LA PROSE — dictés par Eric le 27/08 ══════════════════════
   « dans FH tous les skills sont linked à FH WEB » · « tous les sorts au
   SRD [la fenêtre FF interne], sauf sorts modifiés [→ FH web] » · « et t'as
   toujours le lien vers le SRD pour le spell et aussi vers le species via
   le livre ».

   La règle : la fiche condense, LES LIENS mènent au long.
   · un SORT s'ouvre dans la fenêtre FF interne (spellInfo, le SRD plié) —
     SAUF un sort modifié par une couche fh, qui pointe vers le livre web ;
   · un SKILL pointe TOUJOURS vers le livre web (le chapitre Skills & Tools) —
     les records skill internes n'ont pas de prose, le livre est leur maison ;
   · l'ESPÈCE s'ouvre par le LIVRE du pied (déjà câblé, lot 61).

   ⛔ Les ancres ci-dessous sont une table de NAVIGATION, pas des mots de
   règle : elles pointent, elles ne disent rien. Six skills « complexes » ont
   leur section dédiée au chapitre ; les autres atterrissent sur la table
   des 26. Une ancre morte se voit en cliquant — le banc est son témoin. */

export const FH_WEB = "https://noirchicot.github.io/fh-phb";

const ANCRES_SKILLS = {
  "delve": "the-perception-split-delve-survival-vigilance",
  "survival": "the-perception-split-delve-survival-vigilance",
  "vigilance": "the-perception-split-delve-survival-vigilance",
  "hunting": "hunting",
  "leadership": "leadership",
  "tactics": "tactics-the-study-action",
  "animal-handling": "animal-handling-riding",
  "history": "knowledge-by-creature-type"
};

/** L'URL FH web d'un skill, par son slug ou son nom. */
export function lienSkillFhWeb(slugOuNom) {
  const slug = String(slugOuNom || "").toLowerCase().replace(/\s+/g, "-");
  const ancre = ANCRES_SKILLS[slug] || "the-26-skills";
  return `${FH_WEB}/chapters/skills-and-tools/#${ancre}`;
}

/** L'URL FH web d'une aptitude de classe, à l'ancre près. Les ancres sont
 *  FABRIQUÉES par le livre (`sync_from_vault.py`, `_ancre`) : `l<niveau>-<nom>`
 *  en minuscules-tirets — prévisibles, donc composables sans lire la page. */
export function lienFeatureFhWeb(classe, niveau, nom) {
  const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${FH_WEB}/chapters/classes/${slug(classe)}/#l${niveau}-${slug(nom)}`;
}

/** L'URL FH web du chapitre des dons. */
export function lienFeatsFhWeb() {
  return `${FH_WEB}/chapters/feats/`;
}

/** Un sort MODIFIÉ par Fate's Hand pointe vers le livre web ; l'id d'une
 *  couche fh commence par `fh:`. */
export function sortEstModifieFh(id) {
  return typeof id === "string" && id.startsWith("fh:");
}
export function lienSortFhWeb() {
  return `${FH_WEB}/chapters/magic/`;
}
