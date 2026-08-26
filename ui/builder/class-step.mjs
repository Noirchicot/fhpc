/* ══ L'ÉTAPE CLASS — lot 42, refaite au lot 58 (B2), AMINCIE AU LOT 60 ════
   Même loi que Compétences (lot 39), inchangée : le moteur prononce, l'écran
   affiche. ZÉRO règle de jeu ici.

   ⭐ CE QUI A CHANGÉ AU LOT 60 : le catalogue à défilement aimanté (les douze
   fiches, le rail, les deux paliers) est parti dans `catalogue.mjs`, parce
   que Species est LE MÊME ÉCRAN (Eric : « l'étape 3 va être identique à la
   2 ») et que le recopier aurait produit les deux copies que la loi du dépôt
   interdit. Ce fichier ne garde que **ce qui appartient à Class** : à quoi
   ressemble une fiche de classe, et ce que confirme son 2ᵉ palier.

   🔴 LES INVARIANTS QUE LE LOT 58 A POSÉS TIENNENT TOUJOURS : il n'y a AUCUN
   geste de sélection (II.1 — on défile, le défilement s'aimante, la fiche
   sur laquelle on se pose EST la classe choisie), et AUCUN bouton dans la
   fiche (B2.1e, I.3 — `Validate` est unique et vit dans la barre du haut).

   ── ⚠️ CE QUE LES DONNÉES NE PORTENT PAS, mesuré au lot 58 ───────────────
   B2.1c décrit « image → ambiance → features ». Aucune image de classe
   n'existe dans le dépôt, et `data.description` (622-642 caractères) n'est
   PAS de l'ambiance : c'est de la comptabilité de multiclassage. Ni l'une ni
   l'autre n'est inventée ici — voir INVENTAIRE-LOT-58.md. */

import { planAt, planSlots, renderSlotQcm } from "./carnet.mjs?v=321";
import { renderFicheBody, renderCardRows, renderCardNames, imageDeFiche, DOS_DE_CARTE } from "./catalogue.mjs?v=321";
import { renderConfirmDialog } from "./confirm.mjs?v=321";
import { renderChoixGlisses } from "./glisser.mjs?v=321";

/* ⭐ LE CHEMIN DE L'IMAGE ET LE DOS DE CARTE ONT DÉMÉNAGÉ DANS
   `catalogue.mjs` le 2026-08-16, quand les douze espèces sont arrivées :
   les DEUX écrans à fiche en ont besoin, et `species-step.mjs` l'avait
   annoncé (*« elles arrivent pour les deux écrans au même endroit »*). Une
   seconde copie ici aurait été la faute que ce dépôt paie ailleurs.
   📏 LES COTES MESURÉES RESTENT VRAIES, et elles vivent avec le geste qui
   pose les images (`bin/image-de-fiche.py`, et le fichier du vault qu'il
   cite) : le plus grand rendu de l'image est **173 × 296 px CSS**, PLAFONNÉ
   (identique à 1024, 1366 et 1440 de large, la dalle étant bornée à 440 de
   haut). 🔴 Et le poids se compte PAR ÉCRAN, pas par image : les douze
   fiches se chargent ensemble. */

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}

/* LES TROIS PRIX DU CANON (§A.1) — novice 1 · adept 2 · expert 4. L'écran
   parle d'un BUDGET : il nomme donc chaque palier par ce qu'il COÛTE, comme la
   bourse d'espèce le fait déjà. ⛔ Les valeurs restent celles du moteur
   (`novice`/`adept`/`expert`) : seul le MOT change. */
const PRIX_DES_PALIERS = Object.freeze(["novice", "adept", "expert"]);
function prixDuPalier(valeur) {
  if (valeur === "novice" || valeur === "half") return "+1";
  if (valeur === "adept" || valeur === "proficient") return "+2";
  if (valeur === "expert" || valeur === "expertise") return "+4";
  return String(valeur);
}

/* LE NOM DU PALIER, À CÔTÉ DE SON PRIX — la même table, l'autre colonne.
   ⭐ ET LES DEUX MOTS SONT UTILES, CHACUN À SA PLACE : l'écran de CHOIX parle
   en prix (« +2 », c'est ce qu'on dépense, et c'est le geste), le BILAN parle
   en nom (« Adept », c'est ce qu'on a, et c'est le résultat). Ils vivent dans
   le même fichier, sur la même table, pour ne pas pouvoir se contredire.
   ⛔ Les valeurs restent celles du moteur (`novice`/`adept`/`expert`) — Novice,
   Adept, Expert sont les trois paliers du canon, pas trois mots d'écran. */
function nomDuPalier(valeur) {
  if (valeur === "novice" || valeur === "half") return "Novice";
  if (valeur === "adept" || valeur === "proficient") return "Adept";
  if (valeur === "expert" || valeur === "expertise") return "Expert";
  return String(valeur);
}

/* ⚠️ UN SLUG N'EST PAS UN IDENTIFIANT — mesuré à l'écran le 2026-08-20 : les
   récepteurs de la bourse affichaient « sleight-of-han » et « acrobatics » au
   lieu des noms. Le carnet publie ses créneaux par SLUG
   (`class.skillBudget.stealth`), les records vivent sous un identifiant complet
   (`srd:skill:en:stealth`), et une requête par slug ne trouve rien.
   ⛔ ON NE RECOMPOSE PAS L'IDENTIFIANT à coups de préfixe : « stealth » est au
   SRD, « delve » est maison — deviner le préfixe marcherait jusqu'au jour où il
   se tromperait, en silence. On CHERCHE dans le catalogue, qui sait les deux.
   📌 Et le nom reste celui du RECORD, recopié : aucun mot n'est fabriqué ici. */
function skillLabel(query, id) {
  const view = query({ kind: "skill", id });
  if (view && view.record) return view.record.name;
  const parSlug = (query({ kind: "skill" }) || [])
    .find((v) => v && v.record && (v.record.slug === id || String(v.id).endsWith(`:${id}`)));
  return parSlug && parSlug.record ? parSlug.record.name : id;
}

/* LOT 72 — le même geste pour un sort : le NOM vient du record, jamais
   recomposé ici (loi §0.13 côté écran : on descend des mots, on n'en
   fabrique pas). */
/* ⭐ EXPORTÉS LE 2026-08-20 — le don d'origine offre les MÊMES sorts, avec le
   même geste. Les recopier sous l'Inheritance aurait fait deux façons de
   nommer un sort et deux façons de l'expliquer, qui divergent au premier
   réglage. ⛔ Ni l'une ni l'autre ne connaît la classe : on leur tend un
   `query` et un identifiant. */
/* Le NOM d'une arme, lu au record. Même geste que `spellLabel` : on descend
   des mots, on n'en fabrique pas. */
export function weaponLabel(query, id) {
  const view = query({ kind: "weapon", id });
  return view && view.record ? view.record.name : id;
}

export function spellLabel(query, id) {
  const view = query({ kind: "spell", id });
  return view && view.record ? view.record.name : id;
}

/* ══ L'INFO D'UN SORT — lot 79, étape 5 ══════════════════════════════════
   Eric, 2026-08-16 : *« tap pour info, drag and drop to select ; sur desktop
   clic droit info, gauche select »*. Voici ce que l'info DIT.

   ⛔ RIEN N'EST COMPOSÉ ICI, ET SURTOUT AUCUN LIBELLÉ : la ligne de tête est
   la SUITE DES VALEURS du record, jointes — « evocation · Action · 120 feet
   · V, S · Instantaneous ». Écrire « Casting time : » serait fabriquer des
   mots de règle dans un écran (loi §0.13 : on descend des mots, on n'en
   fabrique pas), et ces mots-là n'existent dans aucune couche.
   ⚠️ Une valeur absente disparaît de la ligne — elle ne devient pas un vide
   à côté d'un séparateur. */
export function spellInfo(query, id) {
  const view = query({ kind: "spell", id });
  const record = view && view.record;
  if (!record) return null;
  const data = record.data || {};
  const tete = [data.school, data.casting_time, data.range, data.components, data.duration]
    .filter((mot) => typeof mot === "string" && mot.trim() !== "");
  return {
    kind: "popup",
    titre: record.name || id,
    texte: [tete.join(" · "), data.description].filter(Boolean).join("\n\n")
  };
}

/* ══ L'INFO D'UNE ARME — ce que le joueur a besoin de savoir pour choisir ═══
   2026-08-20. Choisir une maîtrise, c'est choisir une ARME ; ce qu'on gagne est
   la propriété qu'elle porte. Sans son texte, « Topple » est un choix à
   l'aveugle — et c'était le trou nommé au mandat : jusqu'à ce matin, aucune
   couche ne portait la définition des huit propriétés.

   ⛔ RIEN N'EST COMPOSÉ ICI, comme pour un sort : la ligne de tête est la SUITE
   DES VALEURS du record, jointes. Le seul mot ajouté est le nom de la propriété
   de maîtrise, qui est lui-même une valeur du record.
   ⚠️ ET LA DÉFINITION SE RÉSOUT PAR NOM : chaque arme porte `mastery: "Topple"`,
   une chaîne. Recomposer un identifiant marcherait aujourd'hui et se tromperait
   au premier nom à espace. On cherche dans le catalogue.
   📌 UNE MAÎTRISE SANS DÉFINITION S'AFFICHE QUAND MÊME, avec son seul nom : le
   joueur voit ce qu'il choisit, et le manque ne le prive pas de l'arme. */
export function weaponInfo(query, id) {
  const view = query({ kind: "weapon", id });
  const record = view && view.record;
  if (!record) return null;
  const data = record.data || {};
  const tete = [data.damage, data.weapon_category, data.weapon_range, data.properties, data.cost, data.weight]
    .filter((mot) => typeof mot === "string" && mot.trim() !== "");
  const propriete = typeof data.mastery === "string" ? data.mastery : null;
  const def = propriete
    ? (query({ kind: "weapon-mastery" }) || []).find((v) => v && v.record && v.record.name === propriete)
    : null;
  const texteDeLaMaitrise = def && def.record.data && typeof def.record.data.description === "string"
    ? `${propriete} — ${def.record.data.description}`
    : propriete;
  return {
    kind: "popup",
    titre: record.name || id,
    texte: [tete.join(" · "), texteDeLaMaitrise].filter(Boolean).join("\n\n")
  };
}

/* LOT 72 — les deux groupes de sorts du 2ᵉ palier. UNE TABLE, pas deux
   copies : le QCM, la confirmation d'effacement et le palier lisent la
   même liste — en ajouter un troisième (un jour : les sorts d'un lignage ?)
   est une ligne ici, pas un écran neuf. */
const SPELL_QCMS = [
  /* LOT 79, ÉTAPES 3 ET 4 — LES DEUX GROUPES SONT AU GLISSER, et la seconde
     étape n'a rien eu à réécrire : une consigne, et les trente sorts se sont
     posés. C'était le test que le mandat avait prévu pour l'organe (« s'il n'y
     a rien à réécrire à cette étape, l'organe est bon »).
     🧊 La FENÊTRE DÉFILANTE qu'ils avaient jusqu'au 2026-08-20 a été retirée :
     *« plus d'ascenseurs couplés avec des actions drag and drop »*.
     ⛔ `renderSlotQcm` reste importé et VIVANT : il sert l'espèce, sa bourse
     captive et le don d'origine. Deux formes, un seul contrat d'action. */
  { basePath: "class.cantrips", title: "Cantrips", slotWord: "Cantrip",
    consigne: "Drag a cantrip onto a slot to choose it · tap or right-click for info" },
  { basePath: "class.prepared", title: "Prepared spells", slotWord: "Spell",
    consigne: "Drag a spell onto a slot to choose it · tap or right-click for info" }
];

/** La classe RETENUE, lue au carnet — le pendant exact d'`especeRetenue`.
 *  ⛔ Lue au plan de la racine, jamais devinée depuis l'écran courant : c'est
 *  le carnet qui dit ce qui est posé. */
function classeRetenue(ctx) {
  const plan = planAt(ctx.decisions || [], "class");
  const id = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
  if (!id || typeof ctx.query !== "function") return null;
  const view = ctx.query({ kind: "class", id });
  return view && view.record ? view.record : null;
}

/* ══ CE QUE LA CLASSE DONNE SANS QU'ON CHOISISSE — 2026-08-20 ══════════════
   Eric : *« il devrait y avoir une phase bilan dans les classes aussi »*.

   ⭐ ET C'EST LA LIGNE QUI MANQUAIT LE PLUS. Une classe donne d'abord ce qu'on
   ne choisit PAS — dé de vie, jets de sauvegarde, armes, armures, features de
   niveau 1 — et le guide n'en disait pas un mot : il n'affichait que les trois
   ou quatre décisions restantes. Le joueur qui venait de valider Fighter lisait
   « Skill points » et rien d'autre.
   ⛔ ELLE NE DÉPEND DE RIEN (pas de `depend`, contrairement à celle de
   l'espèce, qui attend son lignage) : ce qui est acquis ici l'est dès que la
   classe est posée, et son voyant est donc allumé d'office. */
export const LIGNE_ACQUIS_CLASSE = Object.freeze({
  path: "class.granted",
  sansChoix: true,
  label: "Granted automatically"
});

/* ══ LE BILAN D'UNE LIGNE DU GUIDE — le même organe que Species ════════════
   📐 Eric, 2026-08-19, pour Species : *« sous lineages tu fais apparaître le
   bilan du lineage […] dans le bilan, le texte tu l'écris proprement comme un
   joli bilan : une ligne par élément, tu évites les doublons »*. Class n'en
   avait aucun — trois boutons nus, et rien qui dise ce qu'ils ont rapporté.

   ⛔ IL N'APPARAÎT QU'UNE FOIS LE CHOIX SIGNÉ — sauf « gagné d'office », qui
   est là dès le début parce qu'il ne dépend de rien. Un résumé qui s'affiche
   avant la signature ferait dire au bilan ce que le joueur n'a pas encore
   validé, et le voyant à côté dirait l'inverse.
   ⛔ ET RIEN N'EST COMPOSÉ ICI : les lignes sont celles du record (celles-là
   mêmes que la fiche affichait, `fiche_stats`), les noms viennent des records
   de compétence et de sort. On descend des mots, on n'en fabrique pas. */
function resumeDeLItem(item, ctx) {
  const record = classeRetenue(ctx);
  if (!record || !item) return null;
  const data = record.data || {};
  const decisions = ctx.decisions || [];

  /* ── CE QUI EST ACQUIS SANS RIEN CHOISIR ─────────────────────────────────
     ⭐ LES MÊMES LIGNES QUE LA FICHE, PAR LE MÊME CHAMP. `fiche_stats` est la
     version compressée et MESURÉE pour la colonne de 360 (lot 77) ; en
     réécrire une seconde ici donnerait deux façons de dire « D10 ».
     ⚠️ Et le repli SRD pur est le même qu'ailleurs dans ce fichier : sans la
     couche `fh-fiche-en`, on lit le record nu — plus long, mais vrai. */
  if (item.path === LIGNE_ACQUIS_CLASSE.path) {
    const stats = Array.isArray(data.fiche_stats)
      ? data.fiche_stats.map((ligne) => [ligne.label, ligne.value])
      : [["Hit points", data.hit_point_die],
        ["Primary ability", data.primary_ability],
        ["Saving throws", Array.isArray(data.saving_throw_proficiencies)
          ? data.saving_throw_proficiencies.join(", ") : null]];
    /* ⛔ LES FEATURES SE LISTENT, ELLES NE SE TABULENT PAS : elles n'ont pas de
       valeur en face — `renderCardRows` jette d'ailleurs toute ligne dont la
       valeur est vide, donc les y mettre les ferait disparaître en silence.
       C'est `renderCardNames` qui les porte, comme sur la fiche SRD. */
    const level1 = (Array.isArray(data.features) ? data.features : [])
      .filter((f) => f && f.level === 1 && typeof f.name === "string")
      .map((f) => f.name);
    const corps = [renderCardRows(stats), renderCardNames("Level 1 features", level1)]
      .filter(Boolean);
    return corps.length > 0 ? el("div", "parcours-resume-corps", corps) : null;
  }

  if (!item.confirme) return null;

  /* ── LA BOURSE : une ligne par compétence dotée, son palier en toutes
     lettres et son prix. ⛔ Les compétences NON dotées ne s'écrivent pas : un
     bilan dit ce qu'on a, pas ce qu'on aurait pu avoir. */
  if (item.path === "class.skillBudget") {
    const budget = planAt(decisions, "class.skillBudget");
    if (!budget) return null;
    const lignes = (budget.options || []).map((slug) => {
      const etape = planAt(decisions, `class.skillBudget.${slug}`);
      const palier = etape && Array.isArray(etape.selected) ? etape.selected[0] : null;
      return palier
        ? [skillLabel(ctx.query, slug), `${nomDuPalier(palier)} (${prixDuPalier(palier)})`]
        : null;
    }).filter(Boolean);
    return lignes.length > 0 ? renderCardRows(lignes) : null;
  }

  /* ── LE QCM SRD, quand c'est lui qui vit (pile sans couche maison). */
  if (item.path === "class.skills") {
    const qcm = planAt(decisions, "class.skills");
    const lignes = (qcm && Array.isArray(qcm.selected) ? qcm.selected : [])
      .map((id) => [skillLabel(ctx.query, id), "Trained"]);
    return lignes.length > 0 ? renderCardRows(lignes) : null;
  }

  /* ── LES MAÎTRISES : l'arme choisie, et la PROPRIÉTÉ qu'elle apporte. C'est
     la propriété qui est le gain — « Maul » seul ne dirait pas ce qu'on a. */
  if (item.path === "class.weaponMastery") {
    const plan = planAt(decisions, "class.weaponMastery");
    const lignes = (plan && Array.isArray(plan.selected) ? plan.selected : [])
      .map((id) => {
        const view = ctx.query ? ctx.query({ kind: "weapon", id }) : null;
        const mastery = view && view.record && view.record.data && view.record.data.mastery;
        return [weaponLabel(ctx.query, id), typeof mastery === "string" && mastery !== "" ? mastery : "—"];
      });
    return lignes.length > 0 ? renderCardRows(lignes) : null;
  }

  /* ── LES SORTS : leur nom, et l'école que le record déclare. ⛔ Une école
     absente laisse la ligne debout avec un tiret plutôt que de la faire
     disparaître : le sort EST choisi, c'est le fait qui compte. */
  for (const groupe of SPELL_QCMS) {
    if (item.path !== groupe.basePath) continue;
    const plan = planAt(decisions, groupe.basePath);
    const lignes = (plan && Array.isArray(plan.selected) ? plan.selected : [])
      .map((id) => {
        const view = ctx.query ? ctx.query({ kind: "spell", id }) : null;
        const ecole = view && view.record && view.record.data && view.record.data.school;
        return [spellLabel(ctx.query, id), typeof ecole === "string" && ecole !== "" ? ecole : "—"];
      });
    return lignes.length > 0 ? renderCardRows(lignes) : null;
  }
  return null;
}

/* `fiche: true` — CET ÉCRAN PASSE PAR `renderFicheBody`, donc ses douze
   dalles portent le pied `LORE` / `CHOOSE` du croquis. C'est déclaré ICI, dans
   le fichier qui appelle `renderFicheBody` (une brique, un écrivain), et c'est
   ce que `shell.mjs` lit pour ne PAS y poser le `Validate` générique : sur un
   écran à fiche, `CHOOSE` est la validation (Ch6). Destiny et le don d'origine
   ne le déclarent pas — leurs cartes n'ont pas de pied, ils gardent `Validate`. */
/* ⭐ `parcours: true` — Class reprend le parcours d'Eric (2026-08-19) SANS une
   ligne de code de plus : guide général → guide spécifique → items → bilan.
   Ses items sortent du carnet comme ceux de Species — `class.skills`,
   `class.cantrips`, `class.prepared` — parce que le parcours ne connaît que
   des chemins sous une racine, jamais un nom d'étape. */
export const CLASS_CATALOGUE = {
  path: "class", kind: "class", label: "Classes", fiche: true, parcours: true,
  /* ⭐ LE CORPS D'UN ITEM NE REND QUE SON BLOC — même contrat que Species
     (`itemCorps`), et c'est ce qui rend les deux chapitres identiques à
     l'usage. Sans lui, le parcours retombait sur `cfg.choices()`, donc sur
     l'écran entier : ouvrir « Cantrips » montrait aussi les compétences et
     les sorts préparés. */
  itemCorps: (item, ctx, act) => renderClassChoices(ctx, act, item.path),
  /* ⭐ LES DEUX CROCHETS QUI FONT LE BILAN (Eric, 2026-08-20). Species les
     portait depuis le 19/08 et Class ne les avait jamais posés : la charpente
     du parcours était là, son contenu manquait. */
  resumeItem: resumeDeLItem,
  lignesEnPlus: [LIGNE_ACQUIS_CLASSE],
  itemLabel: (chemin) => (chemin === "class.skillBudget" ? "Skill points"
    : chemin === "class.skills" ? "Class skills"
    : chemin === "class.cantrips" ? "Cantrips"
    : chemin === "class.prepared" ? "Prepared spells"
    : chemin === "class.weaponMastery" ? "Weapon mastery"
    : chemin === LIGNE_ACQUIS_CLASSE.path ? LIGNE_ACQUIS_CLASSE.label : chemin)
};

/** LE CORPS D'UNE FICHE DE CLASSE — lot 77, la fiche à 360.
 *
 *  ⭐ CE QUI A CHANGÉ, ET POURQUOI CE N'EST PAS UNE RÉÉCRITURE DE GOÛT. Les
 *  quatre lignes que B2 nommait étaient lues DIRECTEMENT dans le record SRD
 *  (`hit_point_die` est une phrase entière, `saving_throw_proficiencies` une
 *  liste jointe) : à 360 px dans une colonne de 118, elles débordaient. La
 *  couche `fh-fiche-en` porte désormais les MÊMES faits, compressés à la
 *  colonne et mesurés (`data[fiche_stats]`), plus les ~50 mots d'ambiance
 *  que `data.description` n'a jamais été (c'est de la comptabilité de
 *  multiclassage — mesuré au lot 58).
 *
 *  ⛔ RIEN N'EST COMPOSÉ ICI. L'écran descend des mots, il n'en fabrique
 *  pas : une ligne absente de la couche est une ligne qui ne s'affiche pas.
 *  ⏳ Les features de niveau 1 quittent la fiche — elles n'ont plus de place
 *  dans la boîte fixe, et le panneau `lore` (hors périmètre) est leur
 *  destination naturelle. */
/* ══ LES TROIS TOTAUX DU CANON §B.1, DÉRIVÉS ET NON RECOPIÉS ══════════════
   🔴 Eric, 2026-08-20 : *« mets à jour les points de skills dans les classes »*.
   Ce qu'il y avait à mettre à jour n'était pas un nombre — ils étaient tous
   justes — mais LEUR NOMBRE D'EXEMPLAIRES.

   📏 MESURÉ AVANT DE TOUCHER : la ligne « Free points » vivait **recopiée à la
   main** dans `fh-fiche-en` (« 10 pts », « 12 pts », « 14 pts »), pendant que le
   nombre vit dans `fh-skills-en` (`fh_skill_pool.free_point_pool`). Les douze
   valeurs concordaient encore ce jour-là — et **rien ne les tenait d'accord**.
   Une règle qui bouge d'un côté laissait douze fiches mentir de l'autre.

   ⭐ ET LE CANON EN PUBLIE **TROIS**, pas un : *« bound skill points »* (déjà
   placés par la classe), *« bound tool points »*, *« free point pool »* (le
   seul que le joueur dépense). La carte n'en montrait qu'un, donc le joueur ne
   pouvait pas savoir ce qui était déjà posé pour lui.
   ⛔ ET UN ZÉRO EST UN FAIT : sept classes n'imposent aucun outil, et le moteur
   le dit en toutes lettres (*« none is a fact, negative is nonsense »*). La
   ligne s'affiche donc à 0 — c'est une réponse, pas un vide.
   📌 Le drapeau reste celui de la couche : sans `fh_skill_pool` (personnage SRD
   pur), aucune de ces lignes n'existe. On dérive ce qui est là, on n'invente
   jamais un pool. */
function lignesDuPool(data) {
  const pool = data.fh_skill_pool;
  if (!pool || typeof pool !== "object") return [];
  /* « 1 pt », pas « 1 pts » — le Rogue porte un seul point d'outil, et une
     faute d'accord sur une fiche se voit autant qu'un nombre faux. */
  const pts = (n) => (Number.isInteger(n) ? `${n} pt${n === 1 ? "" : "s"}` : null);
  return [
    ["Bound skills", pts(pool.bound_skill_points)],
    ["Bound tools", pts(pool.bound_tool_points)],
    ["Free points", pts(pool.free_point_pool)]
  ].filter(([, valeur]) => valeur !== null);
}

export function renderClassCardBody(query, id) {
  const view = query({ kind: "class", id });
  const data = (view && view.record && view.record.data) || {};
  if (!Array.isArray(data.fiche_stats)) return renderClassCardBodySrd(data);
  return renderFicheBody({
    stats: [...data.fiche_stats, ...lignesDuPool(data).map(([label, value]) => ({ label, value }))],
    blurb: data.blurb && data.blurb.text,
    /* ⭐ LA BANDE D'INFOS, CÔTÉ CLASSE (lot 78b). Le MÊME organe que chez
       l'espèce — `renderFicheBody` ne sait pas qui l'appelle, et la feuille
       cotait déjà le gabarit « avec infos » sur une CLASSE (« la bande
       consomme exactement le mou d'une classe », fiche.css). Elle n'était
       simplement branchée nulle part ici : la couche portait les mots, et
       l'écran ne les descendait pas.
       ⛔ ET CE N'EST PAS UN ORGANE DE DÉCISION — Eric, 2026-08-15 : « on ne
       choisit pas de subclass au 1er niveau ». La bande ANNONCE (une
       sous-classe, au niveau 3), elle n'invite pas ; le choix, lui, n'existe
       ni ici ni dans le carnet. Comme partout, le tri est dans la COUCHE :
       une classe sans `fiche_infos` n'aurait pas de bande, et sa fiche
       centrerait son blurb toute seule. */
    infos: data.fiche_infos,
    image: imageDeFiche(id),
    imageSecours: DOS_DE_CARTE,
    imageAlt: ""
  });
}

/** LA FICHE D'UN PERSONNAGE SRD PUR — la couche `fh-fiche-en` débrayée.
 *
 *  🔴 CE N'EST PAS UN REPLI DÉCORATIF, C'EST LA LOI §0.12 : « un personnage
 *  SRD pur traverse-t-il l'écran de bout en bout ? ». `fiche_stats` et
 *  `blurb` sont du contenu Fate's Hand ; sans la couche qui les porte, la
 *  fiche neuve serait VIDE — douze dalles blanches. Ce corps-ci est
 *  exactement celui d'avant le lot 77, gardé tel quel : la pile SRD nue rend
 *  ce qu'elle rendait, ni plus ni moins.
 *
 *  ⚠️ ET IL N'EST PAS TENU PAR LE GARDE DES 118 px — il ne peut pas l'être :
 *  ses lignes viennent du record SRD (`hit_point_die` est une phrase
 *  entière), et c'est précisément parce qu'elles débordent de la colonne que
 *  `fh-fiche-en` existe. À 360 px, une pile SRD nue est LISIBLE mais pas
 *  CALIBRÉE — le dire ici plutôt que le laisser découvrir. */
function renderClassCardBodySrd(data) {
  /* ⭐ LOT 82 — LE NOMBRE QUE LE JOUEUR DÉPENSE, ET LUI SEUL. La carte
     montrait `base`, qui mélangeait le pool et les points déjà placés : douze
     nombres faux à l'écran. Le canon §B.1 publie trois totaux, et le joueur
     n'en manipule qu'un — c'est celui-là que la carte annonce. Le bound (déjà
     dépensé quand la feuille arrive) a sa place sur la fiche, pas sur la carte
     de choix : ici, ce qui aide à choisir, c'est ce qu'on aura à dépenser. */
  /* ⭐ LES MÊMES TROIS TOTAUX QUE LA FICHE FH, par le même organe : deux
     façons de compter les points sur deux chemins de rendu, ce serait deux
     vérités. Le lot 82 n'en montrait qu'un ici, avec l'argument « ce qui aide
     à choisir, c'est ce qu'on aura à dépenser » — Eric a tranché autrement le
     2026-08-20 : les trois totaux, parce que savoir ce qui est DÉJÀ POSÉ pour
     soi fait partie du choix. */
  const rows = renderCardRows([
    ...lignesDuPool(data),
    ["Hit points", data.hit_point_die],
    ["Primary ability", data.primary_ability],
    ["Saving throws", Array.isArray(data.saving_throw_proficiencies) ? data.saving_throw_proficiencies.join(", ") : null]
  ]);
  const level1 = (Array.isArray(data.features) ? data.features : [])
    .filter((f) => f && f.level === 1 && typeof f.name === "string")
    .map((f) => f.name);
  return [rows, renderCardNames("Level 1 features", level1)].filter(Boolean);
}

/* ══ LE MENU DES CHOIX INTRINSÈQUES (B2.3) — LE PALIER 2 ═════════════════
   « La fenêtre majeure disparaît et le menu des choix apparaît. » */
/* 🔴 `seulement` — UN ITEM EST UNE CHOSE, PAS TOUT L'ÉCRAN. Eric, 2026-08-20 :
   *« un boulot général de vérification sur species et classes, pour que tout
   soit harmonisé »*.
   📏 CE QUI N'ÉTAIT PAS HARMONISÉ, mesuré à 360 : derrière le bouton
   « Cantrips » du guide de Class s'ouvraient **52 jetons et 9 récepteurs** —
   c'est-à-dire les compétences, les mineurs ET les préparés, tout l'écran du
   2ᵉ palier. Species, lui, ouvre un item sur UNE chose.
   ⭐ Le filtre est un paramètre, pas un second écran : sans lui, la fonction
   rend exactement ce qu'elle rendait (c'est encore le 2ᵉ palier hors parcours
   qui l'appelle ainsi). Avec lui, elle ne pose que le bloc demandé. */
export function renderClassChoices(ctx, onAction, seulement) {
  const decisions = ctx.decisions || [];
  const query = ctx.query;
  const act = onAction || ctx.onAction || (() => {});
  const menu = el("div", "catalogue-choices");
  const retenu = (chemin) => !seulement || seulement === chemin;

  /* ══ LOT 79, ÉTAPE 2 — LES COMPÉTENCES PASSENT AU GLISSER-DÉPOSER ══════
     📐 Croquis C, 2ᵉ écran : sept pastilles au-dessus, `CHOICE 1` / `CHOICE 2`
     en dessous, et la consigne. Eric, 2026-08-16 : *« on va tester le drag on
     verra »*, puis *« on peut construire les 2 en même temps »* — le jeton se
     tape ET se glisse, `glisser.mjs` porte les deux.
     ⭐ L'ÉCRAN LE PLUS SIMPLE D'ABORD, ET C'EST LE SÉQUENCEMENT DU MANDAT : sept
     options, deux créneaux, aucune grille, aucun défilement imbriqué. On éprouve
     le geste ici avant de l'installer sur trente sorts.
     ⛔ `renderSlotQcm` reste importé et employé : les sorts le gardent pour
     l'instant (étapes 3 et 4), et l'espèce ne le lâchera jamais. Deux formes,
     un seul contrat d'action — le moteur ne voit aucune différence. */
  /* ══ LES POINTS LIÉS DE LA CLASSE, AU GLISSER — 2026-08-20 ═══════════════
     🔴 CE QUE ÇA REMPLACE : le QCM `class.skills`, où le joueur cochait N
     maîtrises. Mesuré ce jour-là, ces cases ne coûtaient RIEN au pool et
     n'accordaient RIEN (`proficiency: "none"`) — la couche maison avait ajouté
     son pool à côté du système SRD au lieu de le remplacer.

     ⭐ ET L'ÉCRAN EST CELUI DE LA BOURSE D'ESPÈCE, mot pour mot : des JETONS DE
     PRIX (« +1 », « +2 », « +4 ») qu'on pose sur des compétences. C'est déjà le
     geste de Keen Senses, et le canon publie exactement ces trois paliers
     (novice 1 · adept 2 · expert 4). Deux écrans qui dépensent des points de la
     même façon doivent le faire avec le même organe.
     ⭐ `+4` EST NEUF, ET IL A UN PROPRIÉTAIRE : le Rogue place un Expert dans
     ses points liés. Aucune espèce n'en accorde, donc le palier n'avait jamais
     eu à exister ici.
     ⛔ `reutilisable` — un prix n'est pas un objet unique : « +1 » peut aller
     sur deux compétences. Sans ce drapeau, poser le premier éteignait le jeton
     et l'écran se bloquait (défaut trouvé par Eric sur la bourse d'espèce). */
  const budget = planAt(decisions, "class.skillBudget");
  const glisse = budget ? renderChoixGlisses({
    plan: budget,
    slots: (budget.options || []).map((slug, index) => {
      const etape = planAt(decisions, `class.skillBudget.${slug}`);
      return {
        path: `class.skillBudget.${slug}`, index,
        options: etape ? etape.options : PRIX_DES_PALIERS,
        selected: etape ? etape.selected : [],
        lock: etape ? etape.lock : null,
        mot: skillLabel(query, slug)
      };
    }),
    titre: "Skill points", mot: "Skill", unite: "points spent",
    labelOf: (id) => prixDuPalier(id),
    consigne: `${budget.answered} of ${budget.expected} points spent — drag a price onto a skill.`,
    reutilisable: true,
    onAction: act
  }) : null;
  if (glisse && retenu("class.skillBudget")) menu.append(glisse);

  /* 🔴 ET LE SRD PUR GARDE SON ÉCRAN — loi §0.12, et c'est un test qui me l'a
     rappelé dans la minute. Sans la couche maison, aucune bourse n'est
     déclarée : le personnage a toujours ses N maîtrises SRD à cocher, et les
     lui retirer l'aurait laissé SANS AUCUN écran de compétences. La bascule
     remplace un système là où l'autre existe ; elle n'en supprime pas un là où
     il est le seul. */
  if (!budget) {
    const qcm = planAt(decisions, "class.skills");
    const glisseSrd = qcm ? renderChoixGlisses({
      plan: qcm, slots: planSlots(decisions, "class.skills"),
      titre: "Class skills", mot: "Choice",
      labelOf: (id) => skillLabel(query, id), onAction: act,
      consigne: "Tap a skill, or drag it onto a slot."
    }) : null;
    if (glisseSrd && retenu("class.skills")) menu.append(glisseSrd);
  }

  /* ══ LOT 72 — LES SORTS, LE MÊME QCM ═══════════════════════════════════
     `renderSlotQcm` rend `null` sans plan : un Rogue n'affiche RIEN ici —
     jamais un cadre vide. `refKind: "spell"` fait poser un `choose` (un sort
     est un record), le reste est mot pour mot le geste de `class.skills`. */
  for (const groupe of SPELL_QCMS) {
    /* ⭐ DEUX FORMES, LE MÊME CONTRAT. La grille lit `planAt`/`planSlots`, le
       QCM lit `decisions` — les deux rendent `null` sans plan, donc un Rogue
       n'affiche RIEN ici, jamais un cadre vide. `refKind: "spell"` fait poser
       un `choose` (un sort est un record) des deux côtés. */
    /* ⭐ LA CONSIGNE DIT LE GESTE QUI MARCHE PARTOUT, pas les quatre cas.
       Glisser choisit au doigt comme à la souris ; taper (doigt) et cliquer
       droit (souris) donnent l'info. Le clic gauche qui pose sur un bureau
       est un raccourci en plus, pas une contradiction — et une consigne de
       quatre lignes coûterait la hauteur qu'on vient de mesurer. */
    /* 🔴 UNE SEULE FORME POUR LES SORTS — Eric, 2026-08-20 : *« le glisser
       partout ! »*. Le drapeau `grille` réglait DEUX choses à la fois : la
       fenêtre défilante (retirée) ET l'aiguillage entre le glisser et l'ancien
       QCM. Les découpler était le vrai travail : le retirer sans regarder
       aurait renvoyé les trente sorts au QCM, soit exactement l'inverse de ce
       qu'Eric demande.
       ⛔ `renderSlotQcm` reste importé et VIVANT — il sert l'espèce, sa bourse
       captive et le don d'origine. Ce qui disparaît, c'est le CHOIX entre les
       deux pour un même écran : un geste qui dépend de l'écran est un geste
       qu'il faut réapprendre. */
    const planSorts = planAt(decisions, groupe.basePath);
    const bloc = planSorts ? renderChoixGlisses({
      plan: planSorts, slots: planSlots(decisions, groupe.basePath),
      titre: groupe.title, mot: groupe.slotWord,
      refKind: "spell", labelOf: (id) => spellLabel(query, id), onAction: act,
      onInfo: (id) => { const info = spellInfo(query, id); if (info) act(info); },
      consigne: groupe.consigne
    }) : null;
    if (bloc && retenu(groupe.basePath)) menu.append(bloc);
  }

  /* ══ LES MAÎTRISES D'ARME, AU GLISSER — 2026-08-20 ═══════════════════════
     🔴 CE QUE ÇA COMBLE : cinq classes portent une feature `Weapon Mastery` au
     niveau 1 et le builder ne proposait RIEN. Eric l'a vu à l'écran — *« mais
     il n'y a pas les weapon masteries dans les classes ? »* — et il a fallu
     descendre jusqu'au SRD pour que la donnée existe : les huit définitions
     étaient dans notre PDF depuis toujours, page 90, et notre extraction les
     jetait en silence.

     ⭐ LE MÊME ORGANE QUE LES SORTS, MOT POUR MOT. Des jetons (les armes du
     vivier), des récepteurs (autant que la classe en accorde), l'info au tap
     ou au clic droit. Un troisième dessin pour un troisième choix aurait été
     un troisième geste à réapprendre.
     ⛔ ET IL RENVOIE `null` SANS PLAN : un Magicien n'affiche RIEN ici, jamais
     un cadre vide — même contrat que `class.cantrips` chez un Roublard. */
  const maitrises = planAt(decisions, "class.weaponMastery");
  const blocMaitrises = maitrises ? renderChoixGlisses({
    plan: maitrises, slots: planSlots(decisions, "class.weaponMastery"),
    titre: "Weapon mastery", mot: "Mastery",
    refKind: "weapon", labelOf: (id) => weaponLabel(query, id), onAction: act,
    onInfo: (id) => { const info = weaponInfo(query, id); if (info) act(info); },
    consigne: "Drag a weapon onto a slot to choose its mastery · tap or right-click for info"
  }) : null;
  if (blocMaitrises && retenu("class.weaponMastery")) menu.append(blocMaitrises);

  /* ══ LOT 46 — LA CONFIRMATION, INCHANGÉE ═══════════════════════════════
     Les anciens `class.skills[n]` que le `choose` ne nettoie pas
     (verrouillés) DOIVENT s'effacer — après confirmation, en NOMMANT ce qui
     part (décision d'Eric, 2026-08-13).
     ⛔ C'EST LE CARNET QUI DÉSIGNE QUOI EFFACER : cette ligne ne refait
     aucune comparaison, elle FILTRE sur le verrou déjà posé. */
  /* ⚠️ LES CRÉNEAUX D'UNE BOURSE NE SONT PAS INDEXÉS — `class.skillBudget.<slug>`
     et non `class.skills[n]`. `planSlots` cherche un `[n]` et ne trouvait donc
     plus rien : la confirmation avait disparu en silence avec la bascule, et
     changer de classe aurait laissé des points posés sur des compétences que la
     nouvelle classe n'offre pas. C'est le carnet qui les nomme (`lock`), ici on
     ne fait que les cueillir.
     📌 Le verrou change de clef aussi : une bourse refuse par
     `skill-budget.option-unavailable`, un QCM par `decision.option-unavailable`.
     Les deux sont acceptées — un écran ne choisit pas le vocabulaire du moteur. */
  const orphelins = decisions
    .filter((plan) => typeof plan.path === "string" && plan.path.startsWith("class.skillBudget.") &&
      plan.lock && /option-unavailable$/.test(plan.lock.key));
  if (orphelins.length > 0) {
    menu.append(renderConfirmDialog({
      title: "These skills are no longer valid for this class:",
      items: orphelins.map((slot) => skillLabel(query, slot.lock.params.selected || slot.path.split(".").pop())),
      confirmLabel: "Clear them",
      cancelLabel: "Keep them locked",
      onConfirm: () => act({ kind: "resetSkills", paths: orphelins.map((slot) => slot.path) }),
      onCancel: () => {}
    }));
  }

  /* ══ LOT 72 — LA MÊME CONFIRMATION POUR LES SORTS — jamais un effacement
     silencieux : on NOMME ce qui part, et on demande (le patron du lot 46,
     étendu, pas un mécanisme neuf). C'était le trou mesuré par Eric le
     2026-08-14 : Wizard → Rogue, 7 sorts orphelins listés dans Review, aucun
     moyen de s'en débarrasser. Le carnet les verrouille désormais (lot 72,
     `decisions.mjs`) ; cette boîte ne fait que LIRE le verrou — une boîte À
     PART de celle des compétences, parce qu'elle nomme d'autres pertes, pas
     parce que le geste diffère (`resetSkills` = « efface ces chemins, un
     seul rebuild », il n'a jamais su ce qu'est une compétence). */
  const sortsOrphelins = SPELL_QCMS.flatMap((groupe) => planSlots(decisions, groupe.basePath))
    .filter((slot) => slot.lock && slot.lock.key === "decision.option-unavailable");
  if (sortsOrphelins.length > 0) {
    menu.append(renderConfirmDialog({
      title: "These spells are no longer valid for this class:",
      items: sortsOrphelins.map((slot) => spellLabel(query, slot.lock.params.selected)),
      confirmLabel: "Clear them",
      cancelLabel: "Keep them locked",
      onConfirm: () => act({ kind: "resetSkills", paths: sortsOrphelins.map((slot) => slot.path) }),
      onCancel: () => {}
    }));
  }
  return menu;
}

/** LE 2ᵉ PALIER DE CLASS : « Validate 2 = features choisis » (B2.4). Le plan
 *  dit combien sont attendus et combien sont répondus — jamais un compte
 *  refait ici. `null` si la classe ne publie aucun choix : elle n'a alors
 *  qu'UN palier (voir `catalogueValidate`).
 *
 *  LOT 72 — le palier lit TOUS les plans du menu (compétences ET sorts) :
 *  un magicien à 3/3 compétences mais 0/3 sorts mineurs n'est pas prêt.
 *  Même règle qu'avant pour chacun (`answered >= expected`), appliquée à
 *  chaque plan présent — un plan absent (Rogue : pas de sorts) ne compte
 *  pas, et une classe sans AUCUN plan garde son palier unique. */
export function classPalier2(decisions) {
  /* ⚠️ LES MAÎTRISES ENTRENT DANS LE COMPTE (2026-08-20) : un Guerrier à 6/6
     points mais 0/3 maîtrises n'est pas prêt. Même règle que les sorts, et un
     plan absent (un Magicien) ne compte pas. */
  const plans = ["class.skillBudget", "class.weaponMastery", ...SPELL_QCMS.map((groupe) => groupe.basePath)]
    .map((path) => planAt(decisions, path))
    .filter(Boolean);
  if (plans.length === 0) return null;
  return { ready: plans.every((plan) => plan.answered >= plan.expected) };
}
