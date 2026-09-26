/* ══ LES DROITS CHIFFRÉS DU PERSONNAGE — lot 287 ════════════════════════════════
   ⚖️ Eric, 2026-09-26 : « donc tu as la liste de tous les éléments du perso de 1 à 8 ? » —
   pas tout : les DROITS d'une classe (dé de vie, sauvegardes, armures, armes et outils
   maîtrisés, compétences à choisir, maîtrises d'arme), ceux de l'héritage, et les armes et
   armures ordinaires ne sont pas du texte à extraire : ce sont des CHAMPS. « 1 2 3 oui ».
   ⭐ Cette fonction les LIT dans la pile et rend l'inventaire ; le fichier généré
   (`droits-personnage.json`, dossier des sources d'effets) est tenu égal à elle par un garde.
   ⛔ Aucune valeur écrite à la main : tout vient des records. */
export function droitsDuPersonnage(query) {
  const lire = (kind) => { try { return query({ kind }) || []; } catch { return []; } };
  const classes = lire("class").map((v) => {
    const d = v.record.data || {};
    return {
      id: v.id, name: d.name,
      hit_die: d.hit_die ?? null,
      saves: d.saving_throw_keys || [],
      armor: d.armor_training || null,
      weapons: d.weapon_proficiencies || null,
      weapon_ids: d.weapon_proficiency_ids || [],
      tools: d.tool_proficiencies || null,
      skills: d.skill_choice ? { count: d.skill_choice.count ?? null, from: d.skill_choice.from || [] } : null,
      weapon_mastery_count: d.weapon_mastery_count ?? null,
      primary: d.primary_ability_keys || [],
      subclass: d.subclass ? d.subclass.name : null,
    };
  });
  const heritages = lire("background").map((v) => {
    const d = v.record.data || {};
    return { id: v.id, name: d.name, feat_choice: d.feat_choice ?? null,
      language_choice: d.granted_language_choice ?? null, equipment: d.equipment ?? null };
  });
  const armes = lire("weapon").map((v) => {
    const d = v.record.data || {};
    return { id: v.id, name: d.name, category: d.weapon_category || null, range: d.weapon_range || null,
      damage: d.damage || null, properties: (d.property_list || []).map((p) => p.detail ? `${p.label} (${p.detail})` : p.label),
      mastery: d.mastery || null, cost: d.cost || null, weight: d.weight || null };
  });
  const armures = lire("armor").map((v) => {
    const d = v.record.data || {};
    return { id: v.id, name: d.name, category: d.armor_category || null, ac: d.armor_class || null,
      ac_base: d.ac_base ?? null, ac_dex_cap: d.ac_dex_cap ?? null, strength_min: d.strength_min ?? null,
      stealth_disadvantage: d.stealth_disadvantage === true, cost: d.cost || null, weight: d.weight || null };
  });
  return { classes, heritages, armes, armures };
}
