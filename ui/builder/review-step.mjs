/* ══ L'ÉTAPE REVIEW — lot 65, B9 ══════════════════════════════════════════
   Eric, 2026-08-14 : **« un masque propre, TRÈS CLAIR »** · 🔴 **« QUE DU
   TEXTE »** · **« sur une DALLE MAJEURE UNIQUE — pas plusieurs »**. Et son
   exigence première, plus ancienne : **« on doit avoir une visibilité de ce
   qui est fait / pas fait »**.

   ── CE QUE ÇA REMPLACE, ET POURQUOI C'ÉTAIT INTENABLE ────────────────────
   L'écran déversait `resolved` en entier : **11 894 px** mesurés sur le
   personnage d'exemple, **27 370** après quelques choix de plus, **538
   lignes dont 464 commençant par `resolved.`**. Et le pire, relevé au
   §3bis : **il GRANDIT AVEC LE PERSONNAGE** — « l'écran devient d'autant
   plus illisible que le personnage est abouti », le contraire exact de ce
   qu'on attend d'un récapitulatif.

   ── ⭐ CE QUE CE MASQUE LIT, ET POURQUOI IL NE PEUT PAS DIVERGER ─────────
   Il ne juge RIEN. « Fait / pas fait » est déjà prononcé par le moteur, dans
   le carnet : chaque plan porte son `answered`, son `expected`, son `status`
   et son `lock`. Ce fichier les GROUPE PAR ÉTAPE et les met en phrases.

   ⛔ C'est délibérément le carnet, et pas une liste de conditions écrite ici
   écran par écran : deux définitions de « terminé » — celle qui allume
   `Validate` et celle qui remplit Review — auraient divergé au premier lot
   suivant. Le carnet est la seule qui existe.

   ── LOT 67 — LES TROIS PORTES DU BAS (B9.4, B9.5) ───────────────────────
   Le lot 65 les avait laissées ouvertes, faute de savoir si elles ouvraient
   sur quelque chose. Elles ouvrent — et **aucune des trois ne construit un
   rendu neuf** :

     · **`Expert view`** et **`Export HTML`** rendent la MÊME page :
       `render(document, report)` de `src/tools/render-fiche.mjs`, dans sa
       coquille. ⭐ **C'est exactement ce que cet écran déversait avant le
       lot 65** — chaque valeur avec son chemin, `underived`, `warnings`, les
       ancres d'override. Le masque ne l'a donc pas supprimé : il l'a mis
       derrière une porte. L'une l'ouvre, l'autre l'enregistre.
     · **`Export JSON`** rend le document, dans **les octets canoniques du
       moteur** (`canonicalText`, partagé avec `toBytes` — lot 67).

   ⛔ POURQUOI PAS DE BOUTON `sheet`. B9.5 demande « un accès à `sheet` », et
   `sheet` est **la fiche v2 jouable** — que la charte réserve explicitement
   à une décision d'Eric, et qui n'existe pas. Un bouton vers rien serait le
   « faux magasin » que le mandat interdit deux fois. **Il n'y en a pas, et
   c'est le seul point de B9 qui reste ouvert.**

   📌 ET B9.2 (« QUE DU TEXTE ») N'EST PAS CONTREDIT : il gouverne le
   RÉCAPITULATIF, pas les portes — c'est Eric lui-même qui pose un export et
   deux accès sur cet écran, en B9.4 et B9.5. Les portes sont en bas, dans la
   MÊME dalle (B9.3 : « une dalle majeure UNIQUE, pas plusieurs »). */

import { planAt } from "./carnet.mjs?v=924";
import { lignageChoisi, detenteurDuDonDEspece } from "./species-step.mjs?v=924";
/* 🧬 LOT 364 — les dons d'origine, nommés par UN compositeur (celui de l'organe du don). */
import { donsDOrigineNommes, detenteurDuDonDArrierePlan } from "./inheritance-step.mjs?v=924";
/* LOT 360 — les choix de capacité, en mots : un seul écrivain, celui de l'étape Class. */
import { capacitesChoisies } from "./class-step.mjs?v=924";
/* LOT 191 — le mot d'un record absent : l'id humanisé et le refus nommé,
   jamais l'id. Le Sheet le lit dans `validate()` (`choice.ref-missing`). */
import { motDUnRecordAbsent } from "./mot-du-choix.mjs?v=924";
/* LOT 294 — la fiche de personnage TEMPORAIRE, au-dessus de la revue. */
import { renderFicheTemporaire, MOTS_FICHE } from "./fiche-temporaire.mjs?v=924";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* ⛔ UNE TABLE DE ROUTAGE, PAS DES RÈGLES. Elle dit à quelle ÉTAPE appartient
   un chemin de décision — rien de plus. Aucun seuil, aucun compte, aucune
   condition : ce qui est « fait » reste prononcé par le carnet.
   ⚠️ L'ordre est celui de `STEPS` (shell.mjs) ; les deux tables se lisent
   côte à côte, et le test le vérifie plutôt que de l'espérer. */
export const REVIEW_GROUPS = [
  { step: "universe", label: "Universe & Layers", paths: [] },
  { step: "concept", label: "Biography", paths: [] },
  { step: "abilities", label: "Abilities", paths: [] },
  /* ⚠️ `species.lineage` A ÉTÉ AJOUTÉ LE 2026-08-19, et son absence ici se
     serait vue : cinq espèces sur douze portent un lignage, et sans ce chemin
     un Dragonborn sans ancêtre choisi comptait pour FINI — au récapitulatif
     comme dans la lumière du belt, qui lit la même table. */
  /* 🧬 LOT 364 — ET LE DON DE VERSATILE (`species.originFeat[0]`) : sans lui, un Human
     sans son don d'origine comptait pour FINI, comme le Dragonborn sans ancêtre le 19/08. */
  { step: "species", label: "Species", paths: ["species", "species.lineage", "species.skills", "species.skillBudget",
    "species.originFeat[0]"] },
  { step: "destiny", label: "Destiny", paths: [] },
  { step: "background", label: "Inheritance", paths: ["background", "background.boost", "background.originFeat[0]"] },
  /* LOT 72 — les sorts entrent au carnet (`class.cantrips`/`class.prepared`,
     decisions.mjs) : Review les montre comme n'importe quelle autre étape.
     Un non-lanceur n'a pas ces plans, `planAt` rend null, la ligne ne change
     pas — même mécanique que les chemins déjà listés. */
  /* ⭐ `class.weaponMastery` AJOUTÉ LE 2026-08-20, et son absence se serait vue
     exactement comme celle de `species.lineage` le 19 : cinq classes sur douze
     portent Weapon Mastery, et sans ce chemin un Roublard sans maîtrise
     choisie comptait pour FINI — au récapitulatif comme dans la lumière du
     belt, qui lit la même table. Un plan absent (un Magicien) ne change rien :
     `planAt` rend `null`, la ligne ne bouge pas. */
  { step: "class", label: "Class",
  /* ⭐ `class.invocations` AJOUTÉ LE 2026-08-29, pour la raison exacte de la
     ligne au-dessus : sans lui, un Warlock sans invocation choisie comptait
     pour FINI — au récapitulatif comme dans la lumière du belt. */
  /* ⭐ LOT 365 — `class.skills` AJOUTÉ, pour la raison exacte des deux lignes du dessus :
     en SRD, les compétences de classe (« Choose 2 ») sont un plan de l'étape Class
     (`class.skills`, decisions.mjs), et sans ce chemin un Druid sans compétence choisie
     comptait pour FINI — seul « The engine refuses » le disait. En Fate's Hand ce plan
     n'existe pas (la bourse est `class.skillBudget`) : `planAt` rend `null`, rien ne
     change. 🛡️ `tests/sheet-compte-les-plans-de-class.test.mjs` tient la liste inversée :
     tout plan que le carnet publie pour l'étape Class compte, dans les deux piles. */
    paths: ["class", "class.skillBudget", "class.skills", "class.weaponMastery", "class.invocations",
            "class.cantrips", "class.prepared"],
  /* ⭐ LOT 360 — ET LES CHOIX DE CAPACITÉ DÉCLARÉS (Divine Order, Primal Order,
     Fighting Style…), trouvés par leur PROVENANCE (`feature_choices.<id>`), jamais
     par une liste de chemins ici : une capacité déclarée demain compte sans une ligne
     de plus, et un Clerc sans ordre ne compte pas pour FINI. */
    familles: ["feature_choices."] },
  { step: "skills", label: "Skills", paths: [] },
  { step: "equipment", label: "Equipment", paths: [] }
];

/** L'état d'un plan, EN MOTS — et rien d'autre que ce que le carnet dit. */
function etatDuPlan(plan) {
  if (plan.status === "locked") return { fait: false, mot: "needs attention" };
  const attendu = Number.isInteger(plan.expected) ? plan.expected : 1;
  const repondu = Number.isInteger(plan.answered) ? plan.answered : 0;
  if (repondu >= attendu) return { fait: true, mot: "done" };
  return { fait: false, mot: `${repondu} of ${attendu}` };
}

/** Les faits d'une étape qui n'a AUCUN plan — lus au document, jamais jugés.
 *  ⚠️ Ce ne sont pas des règles : ce sont des présences. « Un nom est posé »
 *  n'est pas « le nom est valide » — c'est `validate()` qui prononce ça, et
 *  ses refus s'affichent plus bas, tels quels. */
function presences(step, document, resolved) {
  const choix = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const pose = (path) => choix.some((c) => c.path === path);
  if (step === "concept") {
    return [{ fait: Boolean(document && document.name), mot: document && document.name ? document.name : "no name yet" }];
  }
  if (step === "abilities") {
    const clefs = ["str", "dex", "con", "int", "wis", "cha"];
    const posees = clefs.filter((k) => pose(`abilities.${k}`)).length;
    return [{ fait: posees === clefs.length, mot: posees === clefs.length ? "six scores set" : `${posees} of 6 scores` }];
  }
  if (step === "destiny") {
    const carte = pose("fh.destiny.arcana");
    return [{ fait: carte, mot: carte ? "card drawn" : "no card yet" }];
  }
  if (step === "universe") {
    const couches = document && document.build && Array.isArray(document.build.layers) ? document.build.layers.length : 0;
    return [{ fait: couches > 0, mot: `${couches} layer${couches === 1 ? "" : "s"}` }];
  }
  if (step === "skills") {
    const stat = (resolved && Array.isArray(resolved.stats) ? resolved.stats : []).find((s) => s.id === "fh:skill-points");
    if (!stat) return [{ fait: true, mot: "no pool on this stack" }];
    return [{ fait: stat.value >= 0, mot: stat.value >= 0 ? `${stat.value} left` : `${stat.value} — overspent` }];
  }
  if (step === "equipment") {
    const lignes = choix.filter((c) => /^gear\[\d+\]$/.test(c.path)).length;
    return [{ fait: true, mot: `${lignes} item${lignes === 1 ? "" : "s"}` }]; // rien n'est obligatoire ici
  }
  return [];
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut
 * @param {object} ctx.resolved   la fiche dérivée
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {object} [ctx.report]   la sortie complète de `rebuild()` (warnings…)
 * @param {Array}  [ctx.violations] les refus de `validate()`
 */
/** ⭐ EST-CE QUE CETTE ÉTAPE EST FINIE ? — LE SEUL JUGE, ET IL EST ICI.
 *
 *  Il existait déjà, fondu dans la boucle de Review. Le belt en avait besoin
 *  à son tour (la lumière verte, Eric 2026-08-19), et le recopier là-bas
 *  aurait fait DEUX réponses à une seule question — la faute que ce dépôt
 *  paie le plus cher (voir la tête de `resolvedRef`, côté moteur). Extrait,
 *  exporté, appelé par les deux.
 *
 *  ⛔ IL NE JUGE RIEN LUI-MÊME : il assemble ce que le carnet a prononcé
 *  (`etatDuPlan`) et ce que le document PORTE (`presences`). Aucun seuil ici.
 *
 *  ⚠️ UNE ÉTAPE SANS AUCUN FAIT N'EST PAS FINIE — `etats.length > 0`. Sans
 *  cette moitié, une étape muette s'allumerait en vert d'entrée de jeu, ce
 *  qui est exactement le mensonge qu'on vient de retirer au belt. */
export function etapeFaite({ decisions, document, resolved, violations }, stepId) {
  const groupe = REVIEW_GROUPS.find((g) => g.step === stepId);
  if (!groupe) return false;
  const etats = etatsDuGroupe(groupe, { decisions, document, resolved, violations });
  return etats.length > 0 && etats.every((e) => e.fait);
}

/** LES FAITS D'UN GROUPE, EN MOTS — le carnet, les présences, et les choix
 *  que la pile ne résout pas. Une seule liste pour la ligne du Sheet et pour
 *  `etapeFaite` : deux listes finiraient par se contredire. */
function etatsDuGroupe(groupe, { decisions, document, resolved, violations }) {
  const familles = Array.isArray(groupe.familles) ? groupe.familles : [];
  const parFamille = familles.length === 0 ? [] : (decisions || []).filter((plan) => plan &&
    typeof plan.path === "string" && !/\[[0-9]+\]$/.test(plan.path) && !groupe.paths.includes(plan.path) &&
    plan.provenance && typeof plan.provenance.field === "string" &&
    familles.some((famille) => plan.provenance.field.startsWith(famille)));
  return groupe.paths
    .map((path) => planAt(decisions || [], path))
    .filter(Boolean)
    .concat(parFamille)
    .map(etatDuPlan)
    .concat(presences(groupe.step, document || null, resolved || null))
    .concat(nonResolusDuGroupe(groupe, violations));
}

/** 🔴 LOT 191 — UN CHOIX QUE LA PILE NE RÉSOUT PAS N'EST PAS « done ».
 *  📏 Mesuré le 09/09 : un Araag en pile SRD, et la ligne Species du Sheet
 *  disait « done » — le plan a bien UNE réponse, c'est le record qui manque.
 *  ⭐ On lit `validate()` (`choice.ref-missing`), jamais une seconde lecture
 *  de la pile ; le mot est celui de l'organe unique, jamais l'id. Le chemin
 *  du refus est rangé par la même table que les plans : la racine du groupe
 *  (`background.originFeat[0]` appartient à Inheritance parce que
 *  `background` y est). */
function nonResolusDuGroupe(groupe, violations) {
  const racines = groupe.paths.filter((p) => !p.includes(".") && !p.includes("["));
  return (Array.isArray(violations) ? violations : [])
    .filter((v) => v && v.key === "choice.ref-missing" && typeof v.path === "string")
    .filter((v) => racines.some((r) => v.path === r || v.path.startsWith(`${r}.`) || v.path.startsWith(`${r}[`)))
    .map((v) => ({ fait: false, mot: motDUnRecordAbsent(v.params && v.params.id) }));
}

export function renderReviewStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const document = ctx.document || null;
  const resolved = ctx.resolved || null;
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "review-step");

  /* B9.3 — UNE DALLE MAJEURE, UNE SEULE. Tout tient dedans. */
  const dalle = el("section", "review-mask dalle-intermediaire");

  const identite = resolved && resolved.identity ? resolved.identity : {};
  const classe = Array.isArray(identite.classes) && identite.classes[0] ? identite.classes[0].name : null;
  /* 🔴 LE LIGNAGE COMPOSE L'IDENTITÉ — « Elf (High Elf) » (Eric, 2026-09-08).
     ⭐ ET C'EST L'INTERFACE QUI COMPOSE, PAS LE MOTEUR : la loi §0.13 veut que
     le moteur manipule des identifiants et que l'interface produise les mots.
     Le moteur déclare `underived.lineage-not-composed` en disant lui-même
     *« la composition appartient à l'interface »* — il attendait ce code-ci.
     ⛔ Le nom vient de `lignageChoisi` (species-step), pas d'une seconde
     lecture : deux lectures du même choix finiraient par se contredire. */
  const lignage = lignageChoisi(ctx);
  const espece = identite.species && lignage ? `${identite.species} (${lignage})` : identite.species;
  const titre = [document && document.name, espece, classe].filter(Boolean).join(" · ");

  /* ══ LOT 294 — LA FICHE TEMPORAIRE, EN TÊTE DE LA DALLE ══════════════════
     ⚖️ Eric, 26/09 : *« une fiche de perso temporaire dans Sheet »*. Elle vient
     AU-DESSUS de la revue, pas à sa place, et voici pourquoi :
       · la fiche dit CE QUE LE PERSONNAGE EST — les chiffres de `resolved` ;
       · la revue dit CE QUI MANQUE ET OÙ ALLER — le carnet, les refus de
         `validate()`, les choix qu'aucune règle ne lit. Rien de cela n'est
         dans `resolved`, et une ligne de la revue MÈNE à son étape : la
         retirer ferait de Sheet un constat sans chemin.
     ⭐ Le joueur arrive sur Sheet pour voir son personnage : la fiche d'abord,
     la revue ensuite (« Build steps »), les trois portes en bas — la MÊME
     dalle (B9.3). Le titre dit « temporary » : ce n'est pas la fiche finale.
     ⛔ Le nom reste `.review-name` (un garde le lit), il descend d'un rang :
     le titre de la dalle est désormais celui de la fiche. */
  const tete = el("header", "perso-tete");
  tete.append(el("h2", "perso-titre", [text(MOTS_FICHE.titre)]));
  tete.append(el("p", "review-name", [text(titre || "Unnamed character")]));
  tete.append(el("p", "perso-note", [text(MOTS_FICHE.note)]));
  dalle.append(tete);
  dalle.append(renderFicheTemporaire({
    resolved, report: ctx.report || null, document, flags: ctx.flags || [], espece: espece || null,
    /* LOT 360 — les choix de capacité, composés par l'interface comme le lignage */
    choix: [
      /* 🧬 LOT 364 — les dons d'origine d'abord (ARCHI 35, Q3 : celui de l'arrière-plan ET
         celui de Versatile, par le MÊME compositeur), puis les choix de capacité. */
      ...donsDOrigineNommes(ctx, [detenteurDuDonDArrierePlan(ctx), detenteurDuDonDEspece(ctx)].filter(Boolean)),
      ...capacitesChoisies(ctx)
    ]
  }));

  dalle.append(el("h3", "review-heading review-heading-etapes", [text("Build steps")]));
  const liste = el("ol", "review-steps");
  for (const groupe of REVIEW_GROUPS) {
    const etats = etatsDuGroupe(groupe, { decisions, document, resolved, violations: ctx.violations });
    /* Une étape sans plan NI présence ne se montre pas « à moitié » : elle
       n'a rien à dire, et on le dit. */
    const fait = etats.length > 0 && etats.every((e) => e.fait);
    const ligne = el("li", "review-line");
    ligne.dataset.step = groupe.step;
    ligne.dataset.done = String(fait);
    ligne.append(el("span", "review-line-label", [text(groupe.label)]));
    ligne.append(el("span", "review-line-state", [text(
      etats.length === 0 ? "—" : etats.map((e) => e.mot).join(" · ")
    )]));
    /* ⛔ CLIQUABLE, ET C'EST LE POINT DE L'ÉCRAN : voir qu'il manque quelque
       chose sans pouvoir y aller ferait de Review un constat, pas un
       récapitulatif. */
    ligne.addEventListener("click", () => act({ kind: "goToStepId", value: groupe.step }));
    liste.append(ligne);
  }
  dalle.append(liste);

  /* LES REFUS DU MOTEUR, TELS QUELS — jamais reformulés ici. S'il n'y en a
     pas, la rubrique n'existe pas (pas de cadre vide). */
  const refus = ctx.violations || [];
  if (refus.length > 0) {
    dalle.append(el("h3", "review-heading", [text("The engine refuses")]));
    const ul = el("ul", "review-refusals");
    for (const v of refus) ul.append(el("li", null, [text(v.path ? `${v.path} — ${v.key}` : v.key)]));
    dalle.append(ul);
  }

  /* Les choix qu'AUCUNE RÈGLE NE CONSOMME : ils ne laissent aucune trace sur
     la fiche, et le joueur a le droit de le savoir avant de s'étonner. */
  const orphelins = (ctx.report && Array.isArray(ctx.report.unconsumed) ? ctx.report.unconsumed : [])
    .map((u) => (typeof u === "string" ? u : u && u.path)).filter(Boolean);
  if (orphelins.length > 0) {
    dalle.append(el("h3", "review-heading", [text("Recorded, but no rule reads them")]));
    const ul = el("ul", "review-refusals");
    for (const p of orphelins) ul.append(el("li", null, [text(p)]));
    dalle.append(ul);
  }

  dalle.append(renderPortes(act));
  section.append(dalle);
  return section;
}

/* ══ LE NOM DU FICHIER QUI SORT ══════════════════════════════════════════
   Il vient du nom du personnage, et de rien d'autre : un horodatage ferait
   deux exports du même personnage se ranger comme deux personnages, et le
   joueur ne saurait plus lequel est à jour. Écraser est le comportement
   voulu — c'est SON fichier.
   ⚠️ `.fh-char.json` est la forme des fichiers du dépôt (`examples/`), pas
   une invention de cet écran.

   ⭐ LOT 192 — SAUF QUAND LE FICHIER EST UNE VERSION, ET IL LE DIT. Eric,
   10/09 : *« il faut que la version FH reste sauvegardée, donc ça duplique
   le perso »*. Une sauvegarde faite AVANT d'éteindre Fate's Hand n'est pas
   « le personnage à jour » : c'est sa version Fate's Hand, gardée à côté de
   celle qui va continuer en SRD. Deux fichiers au même nom se seraient
   écrasés — ou rangés `(1)` par le navigateur, sans dire lequel est lequel.
   Le nom porte donc la version, ENTRE le nom et le type :
   `ilyra.fates-hand.fh-char.json`. La règle « du nom du personnage et de
   rien d'autre » tient pour un export ordinaire : sans `version`, rien ne
   change. Le mot de la version est un slug déjà (même alphabet que le nom),
   passé par le même filtre par sécurité. */
export function nomDeFichier(document, suffixe, version) {
  const brut = document && typeof document.name === "string" ? document.name : "";
  const slug = brut.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const versionSlug = typeof version === "string" ? version.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "";
  return `${slug || "character"}.${versionSlug ? `${versionSlug}.` : ""}${suffixe}`;
}

/* Les trois portes. ⛔ Elles n'ont AUCUNE condition d'affichage : un
   personnage à peine commencé s'exporte aussi — c'est un brouillon valide
   (schéma dérivé, lot 47), et le cacher jusqu'à « fini » ferait de l'export
   une récompense au lieu d'une sortie. */
/* ⚖️ LOT 350 — `Export JSON` S'APPELLE `Save character`, ET C'EST LE MÊME GESTE.
   Eric, 29/09 : *« le save character sera dans Sheet »* — le `Save` du Menu en part
   (il émettait `exportJson`, le verbe que cette porte émet depuis le lot 67). ⛔ Deux
   portes pour un seul geste seraient un second organe (la question C37, `Open` et
   `My characters`) : la porte d'ici prend donc le mot d'Eric, le verbe ne bouge pas,
   et le fichier non plus (`nomDeFichier`, plus haut). Le mot `Export JSON` (B9.4,
   14/08) cède au plus récent — ✅ RATIFIÉ par Eric le 29/09, à « `Save character` à la
   place d'`Export JSON` dans Sheet ? » : *« Oui, Save character »*. */
function renderPortes(act) {
  const portes = el("div", "review-portes");
  portes.append(bouton("Expert view", "review-porte", () => act({ kind: "expertView" })));
  portes.append(porteSaveCharacter(act));
  portes.append(bouton("Export HTML", "review-porte", () => act({ kind: "exportHtml" })));
  return portes;
}

/** LA PORTE `Save character` — UN SEUL ÉCRIVAIN POUR SES DEUX LIEUX : le pied de la
 *  fiche (`renderPortes`) et l'écran « perso incomplet » (`renderSheetIncomplet`).
 *  ⛔ Deux copies de la même porte divergeraient au premier réglage — le mot, la classe
 *  ou le verbe — et le joueur verrait deux boutons qui se ressemblent sans faire la même
 *  chose. */
export function porteSaveCharacter(act) {
  return bouton("Save character", "review-porte", () => act({ kind: "exportJson" }));
}

/** ══ ⚖️ LOT 350 — L'ÉCRAN « PERSO INCOMPLET » DE SHEET GARDE `Save character` ══════
 *  Quand la fiche ne peut pas naître (ni classe ni scores — `manqueDuCran`, etapes.mjs,
 *  en décide seul), Sheet montrait le mot du manque, et rien d'autre : un perso tout juste
 *  né par `New character` n'avait alors AUCUNE porte pour se sauver, puisque `Save` a
 *  quitté le Menu.
 *  ⚖️ Eric, 29/09, à « un perso inachevé : Sheet affiche l'écran "perso incomplet", où
 *  `Save character` n'est pas — où sauver ? » : *« Save aussi sur cet écran »*.
 *  ⭐ LA MÊME DALLE QUE LA FICHE (B9.3 : une dalle, tout dedans), LA MÊME PORTE
 *  (`porteSaveCharacter`), LE MÊME VERBE (`exportJson`) : le mot du manque, tel que la
 *  coquille le reçoit d'`ecran-mort.mjs` (⛔ jamais recopié ici), puis la rangée des
 *  portes réduite à celle qui a un sens sans fiche.
 *  ⛔ `Expert view` et `Export HTML` n'y sont pas : ils publient la FICHE, qui n'existe pas
 *  encore — une porte vers une pièce qui n'est pas construite serait un faux magasin (B9.5).
 *  @param {string} mot le mot de l'écran mort (`motDeLEcranMort`)
 *  @param {(action: object) => void} onAction */
export function renderSheetIncomplet(mot, onAction) {
  const act = onAction || (() => {});
  const section = el("section", "review-step");
  section.dataset.incomplet = "true";
  const dalle = el("section", "review-mask dalle-intermediaire");
  dalle.append(el("p", "placeholder", [text(mot)]));
  const portes = el("div", "review-portes");
  portes.append(porteSaveCharacter(act));
  dalle.append(portes);
  section.append(dalle);
  return section;
}

function bouton(libelle, className, onClick) {
  const b = el("button", className, [text(libelle)]);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

/** Review est la DESTINATION : il n'y a pas de pas suivant, donc pas de
 *  palier. `Validate` y reste éteint — c'est déjà ce que faisait le bouton
 *  final depuis le lot 55, et la loi vient de là. */
export function reviewValidate() {
  return { exists: true, ready: false, action: null, next: "step" };
}
