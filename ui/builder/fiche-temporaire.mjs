/* ══ LA FICHE DE PERSONNAGE TEMPORAIRE — lot 294 ═══════════════════════════
   ⚖️ Eric, 2026-09-26 : *« demande à un agent de produire une fiche de perso
   temporaire dans Sheet »*. « Temporaire » : ce n'est PAS la fiche définitive
   (un projet à part, qu'Eric dessinera). C'est une fiche honnête et lisible,
   en attendant — et elle le DIT dans son titre.

   ── CE QU'ELLE MONTRE ─────────────────────────────────────────────────────
   Tous les chiffres et toutes les listes que le moteur a calculés, dans l'ordre
   d'une fiche de D&D : l'identité, les six caractéristiques, la maîtrise, la
   CA, les PV, la vitesse, l'initiative ; les sauvegardes, les compétences, les
   sens, les langues, les outils ; le lancement de sorts ; les traits, les
   ressources, les statistiques dérivées, l'équipement, la bourse ; et les
   EFFETS D'OBJETS (lot 289) — la provenance d'un chiffre qu'un objet change,
   et deux listes courtes, « Not applied » et « Waiting ».

   ── ⛔ AUCUNE RÈGLE DE JEU ICI ──────────────────────────────────────────────
   Elle n'affiche que `resolved`. Elle n'additionne rien, ne dérive rien, ne
   complète rien : un chiffre est écrit TEL QUE LE MOTEUR LE PORTE. La
   provenance « 15 +2 Ioun Stone (Intellect) » est LUE dans
   `resolved.effects.applied` (`before`, `value`, `object`), jamais recomposée
   — et le chiffre affiché reste celui de `resolved`, pas l'`after` d'un effet.
   Le garde de `tests/fiche-temporaire.test.mjs` se fonde sur la DONNÉE : on
   change un chiffre de `resolved`, la fiche suit.

   ── ⛔ UNE ABSENCE N'EST JAMAIS UNE RÉPONSE ─────────────────────────────────
   Trois cas, et ils ne se confondent pas :
     · la rubrique MANQUE à `resolved`, ou elle est vide ET le moteur la déclare
       dans `underived` → « not derived yet » ;
     · elle est vide et AUCUNE déclaration ne l'accompagne → « None » (le moteur
       a dérivé une liste vide : un Guerrier n'a pas de sorts) ;
     · elle est pleine mais le moteur en déclare une partie → la liste, plus
       « Some entries are not derived yet ».
   Jamais un tiret muet, jamais un zéro inventé. Et deux lignes qu'une fiche de
   D&D porte et que le contrat n'a pas (l'initiative, la Perception passive)
   disent « not derived yet » elles aussi — un joueur qui les cherche doit
   savoir qu'elles manquent, pas croire qu'il les a mal lues.
   📌 Les RAISONS du moteur (`underived[].key`) ne sont pas recopiées ici : elles
   parlent au développeur (« contract §3 », « law §0.13 »). La fiche dit
   « not derived yet », et Expert view dit pourquoi — la ligne de pied le dit.

   ── ⭐ POURQUOI UN MODULE À CÔTÉ DE `render-fiche.mjs`, ET PAS LUI ──────────
   `render-fiche.mjs` (Expert view) tient une propriété qui est sa raison
   d'être : *« le rendu ne connaît le nom d'AUCUN champ de `resolved` — il
   descend ce qu'on lui donne »*. Une fiche lisible est l'inverse exact : elle
   doit savoir que `ac` va à côté de `vitals.hpMax`, et que `saves` précède
   `skills`. Lui greffer cette connaissance détruirait la propriété qui fait
   qu'Expert view ne peut rien oublier.
   ⭐ Ce qui est PARTAGÉ l'est donc par import, jamais par copie :
     · les TITRES des rubriques — `LIBELLES_EN`, ceux d'Expert view ;
     · le RATTACHEMENT d'une déclaration `underived` à sa rubrique —
       `rubriqueDe`, la fonction même d'Expert view : les deux vues disent
       « non dérivé » pour les mêmes rubriques, par construction ;
     · les mots des raisons d'effets — `EN_EFFECT_REASONS`, `src/labels.mjs`.

   ── LA PLACE DANS L'ÉCRAN ──────────────────────────────────────────────────
   Elle vit DANS la dalle unique de Sheet (B9.3), au-dessus de la revue
   « fait / pas fait » (`review-step.mjs`). ⚖️ Elle défile avec la scène : c'est
   une FICHE, et une fiche ne pagine pas (Eric, 21/09,
   `liste-une-fiche-defile-elle-ne-pagine-pas`) ; la scène porte déjà
   `overscroll-behavior: contain` et ses chevrons (`socle.mjs`). */

import { LIBELLES_EN, rubriqueDe } from "../../src/tools/render-fiche.mjs?v=848";
import { createLabels, EN_EFFECT_REASONS } from "../../src/labels.mjs?v=848";
import { etapeParId } from "./etapes.mjs?v=848";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* ══ LES MOTS DE LA FICHE ═══════════════════════════════════════════════════
   Les TITRES des rubriques viennent de `LIBELLES_EN` (Expert view). Ce qui
   suit, ce sont les mots de CETTE page — anglais, la langue des écrans. */
export const MOTS_FICHE = {
  titre: "Character sheet (temporary)",
  note: "Not the final sheet: every number here is the engine's, as it stands.",
  pasDerive: "not derived yet",
  aucun: "None",
  partiel: "Some entries are not derived yet.",
  pied: "Expert view shows every value with its path, and why a part is not derived.",
  espece: "Species",
  classe: "Class",
  niveau: "Level",
  taille: "Size",
  maitrise: "Proficiency",
  ca: "Armor Class",
  pv: "Hit points",
  pvTemp: "Temporary HP",
  etats: "Conditions",
  vitesse: "Speed",
  initiative: "Initiative",
  perceptionPassive: "Passive Perception",
  maitriseSauvegarde: "proficient",
  caracDeSort: "Ability",
  ddSort: "Save DC",
  attaqueSort: "Spell attack",
  emplacements: "Slots",
  niveauDeSort: (n) => (n === 0 ? "Cantrips" : `Level ${n}`),
  nonPrepare: "not prepared",
  sorts: "Spells",
  equipe: "equipped",
  nonEquipe: "not equipped",
  harmonise: "attuned",
  nonApplique: "Not applied",
  enAttente: "Waiting",
  autresEffets: "Other item effects",
  sansRaison: "reason not described yet",
  fixeA: (v) => `→ ${v}`,
  auMoins: (v) => `at least ${v}`,
  plafond: (v) => `max ${v}`
};

/* Les tailles : `identity.size` est une CLEF du contrat (`medium`), jamais un
   mot — c'est l'interface qui la dit (loi §0.13). */
const TAILLES = { tiny: "Tiny", small: "Small", medium: "Medium", large: "Large", huge: "Huge", gargantuan: "Gargantuan" };
/* La recharge d'une ressource — même loi. */
const RECHARGES = { none: "no recharge", short: "short rest", long: "long rest", day: "per day" };
/* Les autres vitesses que la marche, par leur clef de contrat. */
const VITESSES = { walk: "", fly: "fly", swim: "swim", climb: "climb", burrow: "burrow" };

/* ⭐ LES PALIERS. Fate's Hand en a trois, Novice · Adept · Expert (canon) ; le
   SRD n'a que « maîtrisé » et « expertise ». Le mot suit la PILE MONTÉE — le
   drapeau `fh.skills`, celui qui monte l'écran Skills (`etapes.mjs`) — et
   jamais le nom d'une pile. Les valeurs restent celles du moteur. */
const PALIERS_FH = { novice: "Novice", adept: "Adept", expert: "Expert" };
const PALIERS_SRD = { novice: "Novice", adept: "Proficient", expert: "Expertise" };

const RAISONS = createLabels(EN_EFFECT_REASONS);

/** Une raison d'effet, EN MOTS — jamais l'identifiant. Une raison que le
 *  paquet ignore se dit comme telle (le garde l'empêche d'arriver). */
export function motDeLaRaison(raison) {
  return RAISONS.has(raison) ? RAISONS(raison) : MOTS_FICHE.sansRaison;
}

function signe(n) { return Number.isInteger(n) ? (n >= 0 ? `+${n}` : String(n)) : String(n); }
const estObjet = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const estVide = (v) => v === null || v === undefined
  || (Array.isArray(v) ? v.length === 0 : estObjet(v) && Object.keys(v).length === 0);

/* ══ CE QUE LE MOTEUR DÉCLARE NON DÉRIVÉ ═══════════════════════════════════
   Une déclaration porte sur la rubrique ENTIÈRE quand rien ne suit la tête
   que `rubriqueDe` lit (`tools`), ou une parenthèse (`traits (classe, don,
   arrière-plan)`) ; elle porte sur un SOUS-CHAMP quand la tête est suivie d'un
   `.` ou d'un `[` (`senses[perception-passive]`, `identity.background`). */
function lireDeclarations(report) {
  const underived = report && Array.isArray(report.underived) ? report.underived : [];
  const rubriques = new Set();
  const champs = new Set();
  for (const entree of underived) {
    if (!entree || typeof entree.field !== "string") continue;
    champs.add(entree.field);
    const tete = rubriqueDe(entree.field);
    if (tete === null) continue;
    const suite = entree.field.slice(tete.length);
    if (!/^[.[]/.test(suite)) rubriques.add(tete);
  }
  rubriques.champs = champs;
  return rubriques;
}

/** L'état d'une rubrique, lu, jamais jugé : `absente` · `vide` · `partielle` · `ok`. */
function etatDe(resolved, declarees, cle) {
  if (!resolved || !Object.prototype.hasOwnProperty.call(resolved, cle)) return "absente";
  const vide = estVide(resolved[cle]);
  if (vide) return declarees.has(cle) ? "absente" : "vide";
  return declarees.has(cle) ? "partielle" : "ok";
}

/* ══ LA PROVENANCE — `resolved.effects.applied`, par CHEMIN ══════════════════
   Le moteur écrit le chemin du chiffre qu'il change (`resolved.abilities.int
   .score`, `resolved.saves.str.bonus`, `resolved.skills[arcana].bonus`) — la
   grammaire des overrides, celle qu'Expert view affiche. La fiche demande
   « qui a changé CE chiffre ? » au chemin du chiffre qu'elle écrit, et marque
   le chemin comme LU : ce qu'aucun chiffre de la fiche n'a réclamé part dans
   « Other item effects », jamais nulle part. */
function registreDesEffets(resolved) {
  const effets = resolved && estObjet(resolved.effects) ? resolved.effects : null;
  const applied = effets && Array.isArray(effets.applied) ? effets.applied : [];
  const lus = new Set();
  return {
    effets,
    /** Le texte de provenance d'un chemin, ou `null` si aucun objet n'y touche. */
    provenance(chemin) {
      const entrees = applied.filter((a) => a && a.path === chemin);
      if (entrees.length === 0) return null;
      entrees.forEach((a) => lus.add(a));
      return `${entrees[0].before} ` + entrees.map(motDUnEffet).join(", ");
    },
    nonLus() { return applied.filter((a) => a && !lus.has(a)); }
  };
}

/** Un effet appliqué, dans ses propres chiffres : `+2 Ioun Stone (Intellect)`. */
function motDUnEffet(a) {
  const nom = a.object;
  if (a.mode === "bonus") {
    const cap = Number.isInteger(a.cap) ? ` (${MOTS_FICHE.plafond(a.cap)})` : "";
    return `${signe(a.value)}${cap} ${nom}`;
  }
  if (a.mode === "plancher") return `${MOTS_FICHE.auMoins(a.after)} ${nom}`;
  return `${MOTS_FICHE.fixeA(a.after)} ${nom}`;
}

/* ══ LES BRIQUES DE DESSIN ═════════════════════════════════════════════════ */

function bloc(cle, titre, enfants) {
  const section = el("section", "perso-bloc", [el("h3", "perso-bloc-titre", [text(titre)])]);
  section.dataset.rubrique = cle;
  for (const e of enfants) if (e) section.append(e);
  return section;
}

/** Le mot d'une absence — `not derived yet` ou `None` — dans sa propre classe,
 *  pour que la feuille et les gardes le reconnaissent. */
function motDAbsence(etat) {
  const derive = etat !== "absente";
  const p = el("p", "perso-absent", [text(derive ? MOTS_FICHE.aucun : MOTS_FICHE.pasDerive)]);
  p.dataset.absence = derive ? "vide" : "non-derive";
  return p;
}

function motPartiel() {
  const p = el("p", "perso-absent", [text(MOTS_FICHE.partiel)]);
  p.dataset.absence = "partielle";
  return p;
}

/** Une case : étiquette, valeur, et la provenance sous la valeur. */
function cellule(etiquette, valeur, { provenance = null, note = null, chemin = null } = {}) {
  const c = el("div", "perso-cellule");
  if (chemin) c.dataset.path = chemin;
  c.append(el("span", "perso-cellule-etiquette", [text(etiquette)]));
  const v = el("span", "perso-cellule-valeur", [text(valeur === null ? MOTS_FICHE.pasDerive : valeur)]);
  if (valeur === null) v.dataset.absence = "non-derive";
  c.append(v);
  if (note) c.append(el("span", "perso-cellule-note", [text(note)]));
  if (provenance) c.append(el("span", "perso-provenance", [text(provenance)]));
  return c;
}

/** Une ligne de liste : le nom à gauche, les mots à droite, la provenance dessous. */
function ligne(nom, droite, { provenance = null, marque = false } = {}) {
  const li = el("li", "perso-ligne");
  if (marque) li.dataset.marque = "oui";
  li.append(el("span", "perso-ligne-nom", [text(nom)]));
  if (droite) li.append(el("span", "perso-ligne-valeur", [text(droite)]));
  if (provenance) li.append(el("span", "perso-provenance", [text(provenance)]));
  return li;
}

/* ══ LES RUBRIQUES, DANS L'ORDRE D'UNE FICHE DE D&D ═════════════════════════ */

function blocIdentite(r, ctx) {
  const id = estObjet(r.identity) ? r.identity : null;
  const lignes = el("ul", "perso-liste");
  const classes = id && Array.isArray(id.classes) ? id.classes : [];
  const espece = ctx.espece || (id ? id.species : undefined);
  const motFond = (etapeParId("background", ctx.flags) || { mot: "Background" }).mot;
  const val = (v) => (v === undefined || v === null || v === "" ? null : v);
  const paire = (etiquette, valeur) => {
    const li = ligne(etiquette, valeur === null ? MOTS_FICHE.pasDerive : valeur);
    if (valeur === null) li.dataset.absence = "non-derive";
    return li;
  };
  lignes.append(paire(MOTS_FICHE.espece, val(espece)));
  lignes.append(paire(MOTS_FICHE.classe, classes.length > 0
    ? classes.map((c) => `${c.name} ${c.level}`).join(" / ") : null));
  lignes.append(paire(MOTS_FICHE.niveau, val(id ? id.level : undefined)));
  lignes.append(paire(motFond, val(id ? id.background : undefined)));
  lignes.append(paire(MOTS_FICHE.taille, id && id.size ? (TAILLES[id.size] || id.size) : null));
  return bloc("identity", LIBELLES_EN.identity, [id ? lignes : motDAbsence("absente")]);
}

function blocCaracteristiques(r, etat, reg) {
  if (etat === "absente" || etat === "vide") return bloc("abilities", LIBELLES_EN.abilities, [motDAbsence(etat)]);
  const grille = el("div", "perso-grille perso-grille-six");
  for (const [cle, a] of Object.entries(r.abilities)) {
    const chemin = `resolved.abilities.${cle}.score`;
    grille.append(cellule(cle.toUpperCase(), estObjet(a) && a.score !== undefined ? String(a.score) : null, {
      note: estObjet(a) && a.mod !== undefined ? signe(a.mod) : null,
      provenance: reg.provenance(chemin), chemin
    }));
  }
  return bloc("abilities", LIBELLES_EN.abilities, [grille]);
}

/** La rangée du combat : maîtrise, CA, PV, vitesse, initiative. Pas de titre de
 *  rubrique : chaque case porte le sien, et chacune vient d'une rubrique à elle. */
function blocCombat(r, reg, unite) {
  const grille = el("div", "perso-grille perso-grille-combat");
  const nombre = (v) => (Number.isInteger(v) ? v : null);
  const p = nombre(r.proficiency);
  grille.append(cellule(MOTS_FICHE.maitrise, p === null ? null : signe(p),
    { provenance: reg.provenance("resolved.proficiency"), chemin: "resolved.proficiency" }));
  const ca = nombre(r.ac);
  grille.append(cellule(MOTS_FICHE.ca, ca === null ? null : String(ca),
    { provenance: reg.provenance("resolved.ac"), chemin: "resolved.ac" }));
  const v = estObjet(r.vitals) ? r.vitals : null;
  const pv = v ? nombre(v.hpMax) : null;
  const notes = [];
  if (v && Number.isInteger(v.hpCurrent) && v.hpCurrent !== v.hpMax) notes.push(`current ${v.hpCurrent}`);
  if (v && Number.isInteger(v.tempHp) && v.tempHp > 0) notes.push(`${MOTS_FICHE.pvTemp} ${v.tempHp}`);
  grille.append(cellule(MOTS_FICHE.pv, pv === null ? null : String(pv),
    { note: notes.length > 0 ? notes.join(" · ") : null,
      provenance: reg.provenance("resolved.vitals.hpMax"), chemin: "resolved.vitals.hpMax" }));
  const s = estObjet(r.speeds) ? r.speeds : {};
  const marche = nombre(s.walk);
  const autres = Object.entries(s).filter(([k, n]) => k !== "walk" && Number.isInteger(n))
    .map(([k, n]) => `${VITESSES[k] || k} ${n}${unite ? ` ${unite}` : ""}`);
  grille.append(cellule(MOTS_FICHE.vitesse, marche === null ? null : `${marche}${unite ? ` ${unite}` : ""}`,
    { note: autres.length > 0 ? autres.join(" · ") : null,
      provenance: reg.provenance("resolved.speeds.walk"), chemin: "resolved.speeds.walk" }));
  /* ⚠️ Le contrat n'a pas de champ d'initiative : la case le DIT. */
  grille.append(cellule(MOTS_FICHE.initiative, null));
  const enfants = [grille];
  if (v && Array.isArray(v.conditions) && v.conditions.length > 0) {
    enfants.push(el("p", "perso-texte", [text(`${MOTS_FICHE.etats}: ${v.conditions.join(", ")}`)]));
  }
  const section = el("section", "perso-bloc perso-bloc-combat");
  section.dataset.rubrique = "combat";
  for (const e of enfants) section.append(e);
  return section;
}

function blocSauvegardes(r, etat, reg) {
  if (etat === "absente" || etat === "vide") return bloc("saves", LIBELLES_EN.saves, [motDAbsence(etat)]);
  const grille = el("div", "perso-grille perso-grille-six");
  for (const [cle, s] of Object.entries(r.saves)) {
    const chemin = `resolved.saves.${cle}.bonus`;
    const c = cellule(cle.toUpperCase(), estObjet(s) && Number.isInteger(s.bonus) ? signe(s.bonus) : null, {
      note: estObjet(s) && s.proficient === true ? MOTS_FICHE.maitriseSauvegarde : null,
      provenance: reg.provenance(chemin), chemin
    });
    if (estObjet(s) && s.proficient === true) c.dataset.marque = "oui";
    grille.append(c);
  }
  return bloc("saves", LIBELLES_EN.saves, [grille]);
}

/** Compétences et outils : même forme au contrat, même ligne ici. */
function blocMaitrises(cle, r, etat, reg, paliers) {
  const titre = LIBELLES_EN[cle];
  if (etat === "absente" || etat === "vide") return bloc(cle, titre, [motDAbsence(etat)]);
  const liste = el("ul", "perso-liste perso-liste-colonnes");
  for (const s of r[cle]) {
    if (!estObjet(s)) continue;
    const chemin = `resolved.${cle}[${s.id}].bonus`;
    const palier = s.proficiency && s.proficiency !== "none" ? (paliers[s.proficiency] || s.proficiency) : "";
    const mots = [typeof s.ability === "string" ? s.ability.toUpperCase() : "", signe(s.bonus), palier]
      .filter(Boolean).join(" · ");
    liste.append(ligne(s.name, mots, { provenance: reg.provenance(chemin), marque: palier !== "" }));
  }
  return bloc(cle, titre, [liste, etat === "partielle" ? motPartiel() : null]);
}

function blocSens(r, etat, unite) {
  const enfants = [];
  if (etat === "absente" || etat === "vide") enfants.push(motDAbsence(etat));
  const liste = el("ul", "perso-liste");
  if (Array.isArray(r.senses)) {
    for (const s of r.senses) {
      if (!estObjet(s)) continue;
      liste.append(ligne(s.name, Number.isInteger(s.value) ? `${s.value} ${s.unit || unite || ""}`.trim() : ""));
    }
  }
  /* ⚠️ Le contrat n'a pas de ligne de Perception passive : elle le DIT. */
  const passive = ligne(MOTS_FICHE.perceptionPassive, MOTS_FICHE.pasDerive);
  passive.dataset.absence = "non-derive";
  liste.append(passive);
  enfants.push(liste);
  if (etat === "partielle") enfants.push(motPartiel());
  return bloc("senses", LIBELLES_EN.senses, enfants);
}

/** Une liste de NOMS — langues, actions, traits, craft. */
function blocNoms(cle, r, etat, nomDe) {
  const titre = LIBELLES_EN[cle];
  if (etat === "absente" || etat === "vide") return bloc(cle, titre, [motDAbsence(etat)]);
  const liste = el("ul", "perso-liste");
  for (const item of r[cle]) {
    const [nom, droite] = nomDe(item);
    if (nom) liste.append(ligne(nom, droite || ""));
  }
  return bloc(cle, titre, [liste, etat === "partielle" ? motPartiel() : null]);
}

function blocSorts(r, etat, reg, declarees) {
  const sc = r.spellcasting;
  if (etat === "absente" || etat === "vide") return bloc("spellcasting", LIBELLES_EN.spellcasting, [motDAbsence(etat)]);
  const grille = el("div", "perso-grille perso-grille-combat");
  grille.append(cellule(MOTS_FICHE.caracDeSort, typeof sc.ability === "string" ? sc.ability.toUpperCase() : null,
    { note: sc.name || null }));
  grille.append(cellule(MOTS_FICHE.ddSort, Number.isInteger(sc.dc) ? String(sc.dc) : null,
    { provenance: reg.provenance("resolved.spellcasting.dc"), chemin: "resolved.spellcasting.dc" }));
  grille.append(cellule(MOTS_FICHE.attaqueSort, Number.isInteger(sc.attackBonus) ? signe(sc.attackBonus) : null,
    { provenance: reg.provenance("resolved.spellcasting.attackBonus"), chemin: "resolved.spellcasting.attackBonus" }));
  const enfants = [grille];
  const emplacements = estObjet(sc.slots) ? Object.entries(sc.slots) : [];
  const liste = el("ul", "perso-liste");
  if (emplacements.length > 0) {
    const recharge = sc.slotsRecharge ? ` · ${RECHARGES[sc.slotsRecharge] || sc.slotsRecharge}` : "";
    liste.append(ligne(MOTS_FICHE.emplacements, emplacements
      .map(([n, s]) => `${MOTS_FICHE.niveauDeSort(Number(n))}: ${s.current} of ${s.max}`).join(" · ") + recharge));
  }
  /* Les sorts, rangés par niveau DANS L'ORDRE où le moteur les donne : un
     regroupement, pas un tri qu'on inventerait. */
  const parNiveau = new Map();
  for (const sort of Array.isArray(sc.spells) ? sc.spells : []) {
    if (!estObjet(sort)) continue;
    if (!parNiveau.has(sort.level)) parNiveau.set(sort.level, []);
    parNiveau.get(sort.level).push(sort.prepared === false ? `${sort.name} (${MOTS_FICHE.nonPrepare})` : sort.name);
  }
  for (const [niveau, noms] of parNiveau) liste.append(ligne(MOTS_FICHE.niveauDeSort(niveau), noms.join(", ")));
  /* Aucun sort : « None » si le moteur n'en déclare pas l'absence, sinon
     « not derived yet » (`spellcasting.spells` — aucun choix de sort encore). */
  if (parNiveau.size === 0) {
    const nonDerive = declarees.champs.has("spellcasting.spells");
    const li = ligne(MOTS_FICHE.sorts, nonDerive ? MOTS_FICHE.pasDerive : MOTS_FICHE.aucun);
    if (nonDerive) li.dataset.absence = "non-derive";
    liste.append(li);
  }
  enfants.push(liste);
  if (etat === "partielle") enfants.push(motPartiel());
  return bloc("spellcasting", LIBELLES_EN.spellcasting, enfants);
}

function blocStats(r, etat) {
  if (etat === "absente" || etat === "vide") return bloc("stats", LIBELLES_EN.stats, [motDAbsence(etat)]);
  const liste = el("ul", "perso-liste");
  for (const s of r.stats) {
    if (!estObjet(s)) continue;
    const detail = Array.isArray(s.breakdown)
      ? s.breakdown.map((t) => `${t.label} ${signe(t.value)}`).join(", ") : null;
    liste.append(ligne(s.name, String(s.value), { provenance: detail }));
  }
  return bloc("stats", LIBELLES_EN.stats, [liste, etat === "partielle" ? motPartiel() : null]);
}

function blocEquipement(r, etat) {
  if (etat === "absente" || etat === "vide") return bloc("gear", LIBELLES_EN.gear, [motDAbsence(etat)]);
  const liste = el("ul", "perso-liste");
  for (const g of r.gear) {
    if (!estObjet(g)) continue;
    const mots = [`×${g.quantity}`, g.equipped === true ? MOTS_FICHE.equipe : MOTS_FICHE.nonEquipe];
    if (g.attuned === true) mots.push(MOTS_FICHE.harmonise);
    liste.append(ligne(g.name, mots.join(" · "), { marque: g.equipped === true }));
  }
  return bloc("gear", LIBELLES_EN.gear, [liste, etat === "partielle" ? motPartiel() : null]);
}

function blocBourse(r, etat) {
  if (etat === "absente" || etat === "vide") return bloc("currency", LIBELLES_EN.currency, [motDAbsence(etat)]);
  const pieces = Object.entries(r.currency).map(([k, n]) => `${n} ${k}`).join(" · ");
  return bloc("currency", LIBELLES_EN.currency, [el("p", "perso-texte", [text(pieces)]),
    etat === "partielle" ? motPartiel() : null]);
}

/** Les effets qui ne changent aucun chiffre, ou pas encore — REGROUPÉS par ligne
 *  d'équipement et par raison : une Potion of Healing non choisie porte quatre
 *  entrées au moteur (une par variante), le joueur lit une ligne. Regrouper
 *  n'est pas calculer : chaque entrée reste dite, sa variante comprise. */
function listeDEffets(entrees) {
  const groupes = new Map();
  for (const e of entrees) {
    if (!e) continue;
    const clef = `${e.line}\u0000${e.reason}`;
    if (!groupes.has(clef)) groupes.set(clef, { objet: e.object, raison: e.reason, variantes: [] });
    const g = groupes.get(clef);
    if (typeof e.variant === "string" && !g.variantes.includes(e.variant) && !String(e.object).includes(e.variant)) {
      g.variantes.push(e.variant);
    }
  }
  const liste = el("ul", "perso-liste");
  for (const g of groupes.values()) {
    const li = ligne(g.objet, motDeLaRaison(g.raison),
      { provenance: g.variantes.length > 0 ? g.variantes.join(", ") : null });
    li.dataset.raison = g.raison;
    liste.append(li);
  }
  return liste;
}

function blocEffets(reg) {
  const effets = reg.effets;
  if (!effets) return bloc("effects", LIBELLES_EN.effects, [motDAbsence("absente")]);
  const apart = Array.isArray(effets.apart) ? effets.apart : [];
  const pending = Array.isArray(effets.pending) ? effets.pending : [];
  /* ⚠️ APPELÉ EN DERNIER : `nonLus()` ne sait ce qu'aucun chiffre n'a réclamé
     qu'une fois toute la fiche écrite. */
  const orphelins = reg.nonLus();
  const enfants = [];
  const sous = (cle, titre, contenu) => {
    const s = el("div", "perso-sous-bloc", [el("h4", "perso-sous-titre", [text(titre)]), contenu]);
    s.dataset.liste = cle;
    return s;
  };
  if (pending.length > 0) enfants.push(sous("waiting", MOTS_FICHE.enAttente, listeDEffets(pending)));
  if (apart.length > 0) enfants.push(sous("not-applied", MOTS_FICHE.nonApplique, listeDEffets(apart)));
  if (orphelins.length > 0) {
    const liste = el("ul", "perso-liste");
    for (const a of orphelins) liste.append(ligne(a.object, `${a.before} → ${a.after}`));
    enfants.push(sous("other", MOTS_FICHE.autresEffets, liste));
  }
  if (enfants.length === 0) enfants.push(motDAbsence("vide"));
  return bloc("effects", LIBELLES_EN.effects, enfants);
}

/* ══ LA FICHE ═══════════════════════════════════════════════════════════════ */

/**
 * @param {object} ctx
 * @param {object|null} ctx.resolved la fiche dérivée — la SEULE source des chiffres
 * @param {object|null} [ctx.report]  la sortie de `rebuild()` (`underived`)
 * @param {object|null} [ctx.document] le document — seulement `units.distance`
 * @param {string[]}    [ctx.flags]   les drapeaux de la pile montée
 * @param {string|null} [ctx.espece]  l'espèce composée avec son lignage par
 *   l'écran (`lignageChoisi`, species-step) — l'interface compose, pas le moteur
 * @returns {HTMLElement} `<div class="perso-fiche">`
 */
export function renderFicheTemporaire(ctx) {
  const r = ctx && estObjet(ctx.resolved) ? ctx.resolved : {};
  const flags = ctx && Array.isArray(ctx.flags) ? ctx.flags : [];
  const declarees = lireDeclarations(ctx && ctx.report);
  const etat = (cle) => etatDe(ctx && ctx.resolved, declarees, cle);
  const reg = registreDesEffets(r);
  const doc = ctx && ctx.document;
  const unite = doc && doc.units && typeof doc.units.distance === "string" ? doc.units.distance : "";
  const paliers = flags.includes("fh.skills") ? PALIERS_FH : PALIERS_SRD;

  const fiche = el("div", "perso-fiche");
  fiche.append(blocIdentite(r, { ...ctx, flags }));
  fiche.append(blocCaracteristiques(r, etat("abilities"), reg));
  fiche.append(blocCombat(r, reg, unite));
  fiche.append(blocSauvegardes(r, etat("saves"), reg));
  fiche.append(blocMaitrises("skills", r, etat("skills"), reg, paliers));
  fiche.append(blocSens(r, etat("senses"), unite));
  fiche.append(blocNoms("languages", r, etat("languages"), (l) => [estObjet(l) ? l.name : l]));
  fiche.append(blocMaitrises("tools", r, etat("tools"), reg, paliers));
  fiche.append(blocSorts(r, etat("spellcasting"), reg, declarees));
  fiche.append(blocNoms("actions", r, etat("actions"), (a) => [a && a.name]));
  fiche.append(blocNoms("traits", r, etat("traits"), (t) => [t && t.name, t && t.source]));
  fiche.append(blocNoms("resources", r, etat("resources"), (x) => [x && x.name,
    x ? `${x.current} of ${x.max}${x.recharge ? ` · ${RECHARGES[x.recharge] || x.recharge}` : ""}` : ""]));
  fiche.append(blocStats(r, etat("stats")));
  fiche.append(blocEquipement(r, etat("gear")));
  fiche.append(blocBourse(r, etat("currency")));
  fiche.append(blocNoms("craft", r, etat("craft"), (c) => [c && c.name]));
  /* LES EFFETS EN DERNIER — ils disent aussi ce qu'aucun chiffre n'a réclamé. */
  fiche.append(blocEffets(reg));
  fiche.append(el("p", "perso-pied", [text(MOTS_FICHE.pied)]));
  return fiche;
}
