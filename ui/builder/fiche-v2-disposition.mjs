/* ═══ LA FICHE V2 — la maquette, en blg. Généré depuis fiche_cotes.json (vault : FH-WEB/FHPC/Plan-fiche-V2/fiche_gen.py). ═══
   ⛔ NE RIEN CORRIGER ICI : on corrige le générateur du vault et on relance, puis on recopie.
   ⛔ Un blg = un px de feuille de style UNE FOIS `zoom: var(--echelle)` appliqué sur `.app`.
   ⛔ DESSIN et CIBLE sont DEUX cotes. La fiche a sa propre règle tactile (Eric, 05/10) : une case de 30
      dans une cible de 40 (belt 44, carac 36, compétences 42) — elle s'écarte de --touch, et le dit.
   ⚖️ MAQUETTE SEULE (Eric, 07/10) : les mots sont ceux du plan, AUCUNE lecture du moteur. */

export const PANNEAU = { l: 375, h: 560 };
export const BELT_H = 44;            /* le tambour de la fiche — absent de l'aperçu */
export const LOUPE = 1.2456;        /* le rapport du tambour de Gear (roue-tambour.mjs) */

/* L'APERÇU DE SHEET — la fiche sans son tambour, réduite de 10 %, sous la ceinture du builder. */
export const SCENE = { l: 375, h: 500 };
export const APERCU = { echelle: 0.9, x: 18.75, y: 0, l: 337.5, h: 464.4 };
/* La rangée des boutons du hub : ce qui reste sous l'aperçu (500 − 464,4 = 35,6). Des cases de 30,
   alignées sur les bords de l'aperçu ; leur cible est la rangée entière (35,6 — sous les 40 de la fiche). */
export const HUB_BOUTONS = [
  {"id": "liste", "mot": "List", "x": 18.75, "y": 467.2, "l": 78.375, "h": 30, "cible": {"y": 464.4, "h": 35.6}},
  {"id": "manage", "mot": "Manage", "x": 105.125, "y": 467.2, "l": 78.375, "h": 30, "cible": {"y": 464.4, "h": 35.6}},
  {"id": "live", "mot": "Live", "x": 191.5, "y": 467.2, "l": 78.375, "h": 30, "cible": {"y": 464.4, "h": 35.6}},
  {"id": "export", "mot": "Export", "x": 277.875, "y": 467.2, "l": 78.375, "h": 30, "cible": {"y": 464.4, "h": 35.6}},
];

export const ORGANES = [
  {"nom": "Lune", "sorte": "lune", "x": 4, "y": 7, "l": 30, "h": 30, "forme": "rond", "groupe": "Belt", "cible": {"x": 0, "y": 0.0, "l": 44, "h": 44}},
  {"nom": "Tambour du belt", "sorte": "piste-belt", "x": 44, "y": 0, "l": 287, "h": 44, "groupe": "Belt"},
  {"nom": "Cran Spells", "sorte": "onglet", "x": 46.5, "y": 9.96, "l": 46, "h": 24.08, "groupe": "Belt", "cible": {"x": 44, "y": 0.0, "l": 55.0, "h": 44}, "lignes": [{"mot": "Spells", "cran": "t0", "graisse": 600}]},
  {"nom": "Cran Gear", "sorte": "onglet", "x": 105.5, "y": 9.96, "l": 46, "h": 24.08, "groupe": "Belt", "cible": {"x": 99.0, "y": 0.0, "l": 59.0, "h": 44}, "lignes": [{"mot": "Gear", "cran": "t0", "graisse": 600}]},
  {"nom": "Cran Skills (viseur)", "sorte": "onglet-actif", "x": 158.85, "y": 7.0, "l": 57.3, "h": 30, "groupe": "Belt", "cible": {"x": 158.0, "y": 0.0, "l": 59.0, "h": 44}, "lignes": [{"mot": "Skills", "cran": "t1", "graisse": 600}]},
  {"nom": "Cran Traits", "sorte": "onglet", "x": 223.5, "y": 9.96, "l": 46, "h": 24.08, "groupe": "Belt", "cible": {"x": 217.0, "y": 0.0, "l": 59.0, "h": 44}, "lignes": [{"mot": "Traits", "cran": "t0", "graisse": 600}]},
  {"nom": "Cran Actions", "sorte": "onglet", "x": 282.5, "y": 9.96, "l": 46, "h": 24.08, "groupe": "Belt", "cible": {"x": 276.0, "y": 0.0, "l": 55.0, "h": 44}, "lignes": [{"mot": "Actions", "cran": "t0", "graisse": 600}]},
  {"nom": "Viseur", "sorte": "viseur", "x": 158.85, "y": 7, "l": 57.3, "h": 30, "groupe": "Belt"},
  {"nom": "Soleil", "sorte": "soleil", "x": 341, "y": 7, "l": 30, "h": 30, "forme": "rond", "groupe": "Belt", "cible": {"x": 331, "y": 0.0, "l": 44, "h": 44}},
  {"nom": "Dalle 1", "sorte": "dalle-fiche", "x": 0, "y": 44, "l": 375, "h": 115, "groupe": "Dalles"},
  {"nom": "Dalle 2", "sorte": "dalle-fiche", "x": 0, "y": 167, "l": 375, "h": 231, "groupe": "Dalles"},
  {"nom": "Dalle 3", "sorte": "dalle-fiche", "x": 0, "y": 406, "l": 208, "h": 154, "groupe": "Dalles"},
  {"nom": "Portrait", "sorte": "image", "x": 4, "y": 48, "l": 52, "h": 64, "groupe": "Identité"},
  {"nom": "Identité", "sorte": "texte", "x": 64, "y": 48, "l": 39, "h": 64, "groupe": "Identité", "lignes": [{"mot": "Yedrivel", "cran": "t1", "graisse": 600}, {"mot": "Sorc. 2", "cran": "t1", "graisse": 400}, {"mot": "Warl. 2", "cran": "t1", "graisse": 400}]},
  {"nom": "STR score", "sorte": "affichage", "x": 111, "y": 48, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 109.0, "y": 44, "l": 44, "h": 36}, "lignes": [{"mot": "STR 12", "cran": "t1", "graisse": 400}, {"mot": "+1", "cran": "t3", "graisse": 700}]},
  {"nom": "STR save", "sorte": "affichage", "x": 111, "y": 82, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 109.0, "y": 80, "l": 44, "h": 40}, "lignes": [{"mot": "SAVE", "cran": "t1", "graisse": 400}, {"mot": "+3", "cran": "t2", "graisse": 600}]},
  {"nom": "DEX score", "sorte": "affichage", "x": 155, "y": 48, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 153.0, "y": 44, "l": 44, "h": 36}, "lignes": [{"mot": "DEX 14", "cran": "t1", "graisse": 400}, {"mot": "+2", "cran": "t3", "graisse": 700}]},
  {"nom": "DEX save", "sorte": "affichage", "x": 155, "y": 82, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 153.0, "y": 80, "l": 44, "h": 40}, "lignes": [{"mot": "SAVE", "cran": "t1", "graisse": 400}, {"mot": "+3", "cran": "t2", "graisse": 600}]},
  {"nom": "CON score", "sorte": "affichage", "x": 199, "y": 48, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 197.0, "y": 44, "l": 44, "h": 36}, "lignes": [{"mot": "CON 14", "cran": "t1", "graisse": 400}, {"mot": "+2", "cran": "t3", "graisse": 700}]},
  {"nom": "CON save", "sorte": "affichage", "x": 199, "y": 82, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 197.0, "y": 80, "l": 44, "h": 40}, "lignes": [{"mot": "SAVE", "cran": "t1", "graisse": 400}, {"mot": "+3", "cran": "t2", "graisse": 600}]},
  {"nom": "INT score", "sorte": "affichage", "x": 243, "y": 48, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 241.0, "y": 44, "l": 44, "h": 36}, "lignes": [{"mot": "INT 14", "cran": "t1", "graisse": 400}, {"mot": "+2", "cran": "t3", "graisse": 700}]},
  {"nom": "INT save", "sorte": "affichage", "x": 243, "y": 82, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 241.0, "y": 80, "l": 44, "h": 40}, "lignes": [{"mot": "SAVE", "cran": "t1", "graisse": 400}, {"mot": "+3", "cran": "t2", "graisse": 600}]},
  {"nom": "WIS score", "sorte": "affichage", "x": 287, "y": 48, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 285.0, "y": 44, "l": 44, "h": 36}, "lignes": [{"mot": "WIS 14", "cran": "t1", "graisse": 400}, {"mot": "+2", "cran": "t3", "graisse": 700}]},
  {"nom": "WIS save", "sorte": "affichage", "x": 287, "y": 82, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 285.0, "y": 80, "l": 44, "h": 40}, "lignes": [{"mot": "SAVE", "cran": "t1", "graisse": 400}, {"mot": "+3", "cran": "t2", "graisse": 600}]},
  {"nom": "CHA score", "sorte": "affichage", "x": 331, "y": 48, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 329.0, "y": 44, "l": 44, "h": 36}, "lignes": [{"mot": "CHA 14", "cran": "t1", "graisse": 400}, {"mot": "+2", "cran": "t3", "graisse": 700}]},
  {"nom": "CHA save", "sorte": "affichage", "x": 331, "y": 82, "l": 40, "h": 30, "groupe": "Caractéristiques", "cible": {"x": 329.0, "y": 80, "l": 44, "h": 40}, "lignes": [{"mot": "SAVE", "cran": "t1", "graisse": 400}, {"mot": "+3", "cran": "t2", "graisse": 600}]},
  {"nom": "Condition", "sorte": "bouton", "x": 4, "y": 125, "l": 64, "h": 30, "groupe": "Condition → AC", "cible": {"x": 4.0, "y": 120.0, "l": 64, "h": 40}, "lignes": [{"mot": "Condition", "cran": "t1", "graisse": 600}]},
  {"nom": "Rest", "sorte": "bouton", "x": 72, "y": 125, "l": 48, "h": 30, "groupe": "Condition → AC", "cible": {"x": 72.0, "y": 120.0, "l": 48, "h": 40}, "lignes": [{"mot": "Rest", "cran": "t2", "graisse": 600}]},
  {"nom": "HP", "sorte": "affichage", "x": 128, "y": 125, "l": 80, "h": 30, "groupe": "Condition → AC", "cible": {"x": 128.0, "y": 120.0, "l": 80, "h": 40}, "lignes": [{"mot": "HP 30/30", "cran": "t3", "graisse": 700}]},
  {"nom": "PB", "sorte": "affichage", "x": 212, "y": 125, "l": 46, "h": 30, "groupe": "Condition → AC", "lignes": [{"mot": "PB +3", "cran": "t2", "graisse": 700}]},
  {"nom": "Initiative", "sorte": "affichage", "x": 262, "y": 125, "l": 59, "h": 30, "groupe": "Condition → AC", "cible": {"x": 262.0, "y": 120.0, "l": 59, "h": 40}, "lignes": [{"mot": "INIT +3", "cran": "t2", "graisse": 700}]},
  {"nom": "AC", "sorte": "affichage", "x": 325, "y": 125, "l": 46, "h": 30, "groupe": "Condition → AC", "lignes": [{"mot": "AC 15", "cran": "t2", "graisse": 700}]},
  {"nom": "Passif Vigilance", "sorte": "texte", "x": 4, "y": 171, "l": 70, "h": 20, "groupe": "Sens passifs", "lignes": [{"mot": "Vigilance 12", "cran": "t1", "graisse": 400}]},
  {"nom": "Passif Delve", "sorte": "texte", "x": 78, "y": 171, "l": 60, "h": 20, "groupe": "Sens passifs", "lignes": [{"mot": "Delve 10", "cran": "t1", "graisse": 400}]},
  {"nom": "Passif Survival", "sorte": "texte", "x": 142, "y": 171, "l": 68, "h": 20, "groupe": "Sens passifs", "lignes": [{"mot": "Survival 11", "cran": "t1", "graisse": 400}]},
  {"nom": "Passif Insight", "sorte": "texte", "x": 214, "y": 171, "l": 64, "h": 20, "groupe": "Sens passifs", "lignes": [{"mot": "Insight 13", "cran": "t1", "graisse": 400}]},
  {"nom": "Passif Investigation", "sorte": "texte", "x": 282, "y": 171, "l": 89, "h": 20, "groupe": "Sens passifs", "lignes": [{"mot": "Investigation 8", "cran": "t1", "graisse": 400}]},
  {"nom": "Onglet Knowledge", "sorte": "onglet-actif", "x": 4.0, "y": 196, "l": 70.2, "h": 30, "groupe": "Catégories", "cible": {"x": 4.0, "y": 191.0, "l": 70.2, "h": 40}, "lignes": [{"mot": "Knowledge", "cran": "t1", "graisse": 600}]},
  {"nom": "Onglet Social", "sorte": "onglet", "x": 78.2, "y": 196, "l": 70.2, "h": 30, "groupe": "Catégories", "cible": {"x": 78.2, "y": 191.0, "l": 70.2, "h": 40}, "lignes": [{"mot": "Social", "cran": "t1", "graisse": 600}]},
  {"nom": "Onglet Exploration", "sorte": "onglet", "x": 152.4, "y": 196, "l": 70.2, "h": 30, "groupe": "Catégories", "cible": {"x": 152.4, "y": 191.0, "l": 70.2, "h": 40}, "lignes": [{"mot": "Exploration", "cran": "t1", "graisse": 600}]},
  {"nom": "Onglet Physical", "sorte": "onglet", "x": 226.6, "y": 196, "l": 70.2, "h": 30, "groupe": "Catégories", "cible": {"x": 226.6, "y": 191.0, "l": 70.2, "h": 40}, "lignes": [{"mot": "Physical", "cran": "t1", "graisse": 600}]},
  {"nom": "Onglet Tools & Trainings", "sorte": "onglet", "x": 300.8, "y": 196, "l": 70.2, "h": 30, "groupe": "Catégories", "cible": {"x": 300.8, "y": 191.0, "l": 70.2, "h": 40}, "lignes": [{"mot": "Tools &", "cran": "t1", "graisse": 600}, {"mot": "Trainings", "cran": "t1", "graisse": 600}]},
  {"nom": "Academics", "sorte": "ligne", "x": 4, "y": 237, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 4.0, "y": 231, "l": 181.5, "h": 42}, "lignes": [{"mot": "Academics", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "INT", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "+4", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "Appraise", "sorte": "ligne", "x": 4, "y": 279, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 4.0, "y": 273, "l": 181.5, "h": 42}, "lignes": [{"mot": "Appraise", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "INT", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "+2", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "Arcana", "sorte": "ligne", "x": 4, "y": 321, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 4.0, "y": 315, "l": 181.5, "h": 42}, "lignes": [{"mot": "Arcana", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "INT", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "+4", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "History", "sorte": "ligne", "x": 4, "y": 363, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 4.0, "y": 357, "l": 181.5, "h": 42}, "lignes": [{"mot": "History", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "INT", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "+2", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "Investigation", "sorte": "ligne", "x": 189.5, "y": 237, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 189.5, "y": 231, "l": 181.5, "h": 42}, "lignes": [{"mot": "Investigation", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "INT", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "−1", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "Nature", "sorte": "ligne", "x": 189.5, "y": 279, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 189.5, "y": 273, "l": 181.5, "h": 42}, "lignes": [{"mot": "Nature", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "INT", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "+2", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "Religion", "sorte": "ligne", "x": 189.5, "y": 321, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 189.5, "y": 315, "l": 181.5, "h": 42}, "lignes": [{"mot": "Religion", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "INT", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "+2", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "Medicine", "sorte": "ligne", "x": 189.5, "y": 363, "l": 181.5, "h": 30, "groupe": "Compétences", "cible": {"x": 189.5, "y": 357, "l": 181.5, "h": 42}, "lignes": [{"mot": "Medicine", "cran": "t2", "graisse": 600, "ancre": "start"}, {"mot": "WIS", "cran": "t1", "graisse": 400, "ancre": "car"}, {"mot": "+2", "cran": "t3", "graisse": 700, "ancre": "end"}]},
  {"nom": "Bande Destinée", "sorte": "bande-destin", "x": 4, "y": 410, "l": 200, "h": 34, "groupe": "Destinée"},
  {"nom": "Livret Destinée", "sorte": "livret", "x": 7, "y": 412, "l": 30, "h": 30, "groupe": "Destinée", "cible": {"x": 4, "y": 410, "l": 34, "h": 34}, "lignes": [{"mot": "8/8", "cran": "t1", "graisse": 700}]},
  {"nom": "Dé d'or d4", "sorte": "de-or-v1", "x": 44, "y": 416, "l": 22, "h": 22, "forme": "rond", "groupe": "Destinée", "cible": {"x": 38, "y": 410, "l": 34, "h": 34}},
  {"nom": "Dé d'or d6", "sorte": "de-or-v1", "x": 78, "y": 416, "l": 22, "h": 22, "forme": "rond", "groupe": "Destinée", "cible": {"x": 72, "y": 410, "l": 34, "h": 34}},
  {"nom": "Dé d'or d8", "sorte": "de-or-v1", "x": 112, "y": 416, "l": 22, "h": 22, "forme": "rond", "groupe": "Destinée", "cible": {"x": 106, "y": 410, "l": 34, "h": 34}},
  {"nom": "Dé d'or d10", "sorte": "de-or-v1", "x": 146, "y": 416, "l": 22, "h": 22, "forme": "rond", "groupe": "Destinée", "cible": {"x": 140, "y": 410, "l": 34, "h": 34}},
  {"nom": "Dé d'or d12", "sorte": "de-or-v1", "x": 180, "y": 416, "l": 22, "h": 22, "forme": "rond", "groupe": "Destinée", "cible": {"x": 174, "y": 410, "l": 34, "h": 34}},
  {"nom": "Badge 1", "sorte": "badge-info", "x": 4.0, "y": 449, "l": 47.0, "h": 30, "groupe": "Badges", "cible": {"x": 4.0, "y": 444.0, "l": 47.0, "h": 40}, "lignes": [{"mot": "CHAOS", "cran": "t1", "graisse": 700}]},
  {"nom": "Badge 2", "sorte": "badge-crit", "x": 55.0, "y": 449, "l": 47.0, "h": 30, "groupe": "Badges", "cible": {"x": 55.0, "y": 444.0, "l": 47.0, "h": 40}, "lignes": [{"mot": "EXH 2", "cran": "t1", "graisse": 700}]},
  {"nom": "Badge 3", "sorte": "badge-info", "x": 106.0, "y": 449, "l": 47.0, "h": 30, "groupe": "Badges", "cible": {"x": 106.0, "y": 444.0, "l": 47.0, "h": 40}, "lignes": [{"mot": "OVR 3", "cran": "t1", "graisse": 700}]},
  {"nom": "Badge 4", "sorte": "badge-info", "x": 157.0, "y": 449, "l": 47.0, "h": 30, "groupe": "Badges", "cible": {"x": 157.0, "y": 444.0, "l": 47.0, "h": 40}, "lignes": [{"mot": "NOTE", "cran": "t1", "graisse": 700}]},
  {"nom": "Bouton A", "sorte": "rond-bouton", "x": 9, "y": 489, "l": 30, "h": 30, "forme": "rond", "groupe": "Lanceur", "cible": {"x": 0, "y": 484.0, "l": 44, "h": 40}, "lignes": [{"mot": "A", "cran": "t2", "graisse": 700}]},
  {"nom": "Bouton D", "sorte": "rond-bouton", "x": 49, "y": 489, "l": 30, "h": 30, "forme": "rond", "groupe": "Lanceur", "cible": {"x": 44, "y": 484.0, "l": 40, "h": 40}, "lignes": [{"mot": "D", "cran": "t2", "graisse": 700}]},
  {"nom": "Bouton +2", "sorte": "rond-bouton", "x": 89, "y": 489, "l": 30, "h": 30, "forme": "rond", "groupe": "Lanceur", "cible": {"x": 84, "y": 484.0, "l": 40, "h": 40}, "lignes": [{"mot": "+2", "cran": "t2", "graisse": 700}]},
  {"nom": "Bouton +🎲", "sorte": "rond-bouton", "x": 129, "y": 489, "l": 30, "h": 30, "forme": "rond", "groupe": "Lanceur", "cible": {"x": 124, "y": 484.0, "l": 40, "h": 40}, "lignes": [{"mot": "+🎲", "cran": "t2", "graisse": 700}]},
  {"nom": "ROLL", "sorte": "bouton", "x": 164, "y": 484, "l": 40, "h": 40, "groupe": "Lanceur", "cible": {"x": 164, "y": 484.0, "l": 44, "h": 40}, "lignes": [{"mot": "ROLL", "cran": "t2", "graisse": 700}]},
  {"nom": "Dé à lancer 1", "sorte": "de-noir", "x": 4, "y": 526, "l": 30, "h": 30, "groupe": "Dés à lancer", "lignes": [{"mot": "d20", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé à lancer 2", "sorte": "de-rouge", "x": 38, "y": 526, "l": 30, "h": 30, "groupe": "Dés à lancer", "lignes": [{"mot": "d20", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé à lancer 3", "sorte": "de-vert", "x": 72, "y": 526, "l": 30, "h": 30, "groupe": "Dés à lancer", "lignes": [{"mot": "d4", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé à lancer 4", "sorte": "de-jaune", "x": 106, "y": 526, "l": 30, "h": 30, "groupe": "Dés à lancer", "lignes": [{"mot": "d6", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé à lancer 5", "sorte": "case-vide", "x": 140, "y": 526, "l": 30, "h": 30, "groupe": "Dés à lancer"},
  {"nom": "Dé à lancer 6", "sorte": "case-vide", "x": 174, "y": 526, "l": 30, "h": 30, "groupe": "Dés à lancer"},
  {"nom": "Stream", "sorte": "journal", "x": 212, "y": 406, "l": 159, "h": 150, "groupe": "Stream"},
  {"nom": "Log 1", "sorte": "log-entree", "x": 212, "y": 406, "l": 159, "h": 30, "groupe": "Stream", "lignes": [{"mot": "KVOTH", "cran": "t1", "graisse": 700, "ancre": "start", "ligne": 13}, {"mot": "Shortsword · ATK +7", "cran": "t1", "graisse": 400, "ancre": "start", "ligne": 25}, {"mot": "24", "cran": "t3", "graisse": 700, "ancre": "end", "ligne": 20}]},
  {"nom": "Log 2", "sorte": "log-entree", "x": 212, "y": 436, "l": 159, "h": 30, "groupe": "Stream", "lignes": [{"mot": "TOOK", "cran": "t1", "graisse": 700, "ancre": "start", "ligne": 13}, {"mot": "Check · adv.", "cran": "t1", "graisse": 400, "ancre": "start", "ligne": 25}, {"mot": "17", "cran": "t3", "graisse": 700, "ancre": "end", "ligne": 20}]},
  {"nom": "Log 3", "sorte": "log-entree", "x": 212, "y": 466, "l": 159, "h": 30, "groupe": "Stream", "lignes": [{"mot": "KVOTH", "cran": "t1", "graisse": 700, "ancre": "start", "ligne": 13}, {"mot": "Fireball niv. 9 · 13 d6", "cran": "t1", "graisse": 400, "ancre": "start", "ligne": 25}, {"mot": "52", "cran": "t3", "graisse": 700, "ancre": "end", "ligne": 20}]},
  {"nom": "Log 4", "sorte": "log-entree", "x": 212, "y": 496, "l": 159, "h": 30, "groupe": "Stream", "lignes": [{"mot": "TOOK", "cran": "t1", "graisse": 700, "ancre": "start", "ligne": 13}, {"mot": "Stealth", "cran": "t1", "graisse": 400, "ancre": "start", "ligne": 25}, {"mot": "19", "cran": "t3", "graisse": 700, "ancre": "end", "ligne": 20}]},
  {"nom": "Log 5", "sorte": "log-entree", "x": 212, "y": 526, "l": 159, "h": 30, "groupe": "Stream", "lignes": [{"mot": "KVOTH", "cran": "t1", "graisse": 700, "ancre": "start", "ligne": 13}, {"mot": "Initiative", "cran": "t1", "graisse": 400, "ancre": "start", "ligne": 25}, {"mot": "15", "cran": "t3", "graisse": 700, "ancre": "end", "ligne": 20}]},
];

export const POPUPS = [
  {"nom": "Popup repos", "sorte": "popup", "x": 72, "y": 160, "l": 170, "h": 44},
  {"nom": "Long rest", "sorte": "bouton", "x": 76, "y": 167, "l": 77, "h": 30, "cible": {"x": 76.0, "y": 160.0, "l": 77, "h": 44}, "lignes": [{"mot": "Long rest", "cran": "t2", "graisse": 600}]},
  {"nom": "Short rest", "sorte": "bouton", "x": 161, "y": 167, "l": 77, "h": 30, "cible": {"x": 161.0, "y": 160.0, "l": 77, "h": 44}, "lignes": [{"mot": "Short rest", "cran": "t2", "graisse": 600}]},
  {"nom": "Popup dés", "sorte": "popup", "x": 29.5, "y": 362, "l": 316, "h": 44},
  {"nom": "Dé d4", "sorte": "de-clair", "x": 40.5, "y": 369, "l": 30, "h": 30, "forme": "rond", "cible": {"x": 33.5, "y": 362.0, "l": 44, "h": 44}, "lignes": [{"mot": "d4", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé d6", "sorte": "de-clair", "x": 84.5, "y": 369, "l": 30, "h": 30, "forme": "rond", "cible": {"x": 77.5, "y": 362.0, "l": 44, "h": 44}, "lignes": [{"mot": "d6", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé d8", "sorte": "de-clair", "x": 128.5, "y": 369, "l": 30, "h": 30, "forme": "rond", "cible": {"x": 121.5, "y": 362.0, "l": 44, "h": 44}, "lignes": [{"mot": "d8", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé d10", "sorte": "de-clair", "x": 172.5, "y": 369, "l": 30, "h": 30, "forme": "rond", "cible": {"x": 165.5, "y": 362.0, "l": 44, "h": 44}, "lignes": [{"mot": "d10", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé d12", "sorte": "de-clair", "x": 216.5, "y": 369, "l": 30, "h": 30, "forme": "rond", "cible": {"x": 209.5, "y": 362.0, "l": 44, "h": 44}, "lignes": [{"mot": "d12", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé d20", "sorte": "de-clair", "x": 260.5, "y": 369, "l": 30, "h": 30, "forme": "rond", "cible": {"x": 253.5, "y": 362.0, "l": 44, "h": 44}, "lignes": [{"mot": "d20", "cran": "t1", "graisse": 600}]},
  {"nom": "Dé d%", "sorte": "de-clair", "x": 304.5, "y": 369, "l": 30, "h": 30, "forme": "rond", "cible": {"x": 297.5, "y": 362.0, "l": 44, "h": 44}, "lignes": [{"mot": "d%", "cran": "t1", "graisse": 600}]},
];
