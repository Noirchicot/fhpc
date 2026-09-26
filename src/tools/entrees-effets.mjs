/* ══ LES ENTRÉES DE L'INVENTAIRE DES EFFETS DES RÈGLES — lot 284 ════════════════
   ⚖️ Eric, 2026-09-26 : « est-ce que tous les éléments des 8 étapes savent s'appliquer ? »
   — non (audit du 26/09) ; puis « la liste déjà », « idem que pour équipement objets mag ».
   ⭐ CE MODULE DIT CE QUI EST INVENTORIÉ, lu dans la pile : chaque trait d'espèce, chaque
   lignage, chaque don, chaque capacité de classe (à son niveau), chaque option de classe,
   chaque arcane et chaque training. l'inventaire des règles (`regles-personnage.effets.json`) porte leurs
   effets ; le garde reconstruit CETTE liste pour tenir l'inventaire complet.
   ⛔ Aucune liste écrite à la main : un record ajouté à la pile apparaît ici, et le garde
   rougit tant que son inventaire ne le couvre pas. */
export function entreesDesEffets(query) {
  const lire = (kind) => { try { return query({ kind }) || []; } catch { return []; } };
  const E = [];
  for (const v of lire("species")) {
    const d = v.record.data || {};
    for (const t of d.traits || []) E.push({ source: "species-trait", id: `${v.id}#trait:${t.slug || t.id}`, name: `${d.name} — ${t.name}`, text: t.text });
    for (const l of d.lineages || []) {
      const text = Object.entries(l.levels || {}).map(([k, t]) => `Level ${k}: ${t}`).join("\n")
        + (d.lineage_intro ? `\n\n(Lineage intro) ${d.lineage_intro}` : "");
      E.push({ source: "lineage", id: `${v.id}#lineage:${l.id}`, name: `${d.name} — ${l.name}`, text });
    }
  }
  for (const v of lire("feat")) E.push({ source: "feat", id: v.id, name: v.record.data.name, text: v.record.data.description });
  for (const v of lire("class")) {
    const d = v.record.data || {};
    /* ⚠️ le NIVEAU fait partie de l'identité : « Improved Brutal Strike » existe à 13 ET à 17 */
    for (const f of d.features || []) E.push({ source: "class-feature", id: `${v.id}#feature:${f.slug || f.id || f.name}@${f.level ?? null}`, name: `${d.name} — ${f.name}`, text: f.description });
  }
  for (const v of lire("class-option")) E.push({ source: "class-option", id: v.id, name: v.record.data.name, text: v.record.data.description });
  for (const v of lire("arcana")) {
    const d = v.record.data || {};
    const text = [`Destiny: ${JSON.stringify(d.destiny)}`, `Power: ${d.power}`, `Vibration: ${d.vibration}`,
      `Ability: ${typeof d.ability === "string" ? d.ability : JSON.stringify(d.ability)}`,
      d.vibrations ? `Vibrations: ${JSON.stringify(d.vibrations)}` : ""].filter(Boolean).join("\n");
    E.push({ source: "arcana", id: v.id, name: d.name, text });
  }
  for (const v of lire("training")) E.push({ source: "training", id: v.id, name: v.record.data.name, text: v.record.data.description });
  /* ⭐ LOT 287 — les SOUS-CLASSES (une par classe dans le SRD : Berserker, Champion, Evoker…),
     puis les propriétés et les maîtrises d'arme. 🔴 Je les avais dites absentes de la pile : elles
     sont dans `class.data.subclass`. Ajoutées EN FIN pour ne pas déplacer l'ordre établi. */
  for (const v of lire("class")) {
    const s = (v.record.data || {}).subclass;
    for (const f of (s && s.features) || []) E.push({ source: "subclass-feature", id: `${v.id}#subclass:${s.name}#feature:${f.name}@${f.level ?? null}`, name: `${v.record.data.name} (${s.name}) — ${f.name}`, text: f.description });
  }
  for (const v of lire("weapon-property")) E.push({ source: "weapon-property", id: v.id, name: v.record.data.name, text: v.record.data.description });
  for (const v of lire("weapon-mastery")) E.push({ source: "weapon-mastery", id: v.id, name: v.record.data.name, text: v.record.data.description });
  return E;
}

/** ⭐ LOT 287 — les SORTS, dans l'ordre alphabétique : l'inventaire dit lesquels changent la
 *  fiche de celui qui en profite (`change_la_fiche`). La durée vient du record. */
export function entreesDesSorts(query) {
  let vs = []; try { vs = query({ kind: "spell" }) || []; } catch { vs = []; }
  return vs.map((v) => ({ source: "spell", id: v.id, name: v.record.data.name, niveau: v.record.data.level,
    duree: v.record.data.duration || null, concentration: v.record.data.concentration === true, text: v.record.data.description }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
