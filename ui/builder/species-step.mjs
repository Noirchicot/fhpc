/* ══ L'ÉTAPE SPECIES — lot 42, REFAITE AU LOT 60 (B3 = B2) ════════════════
   Eric, 2026-08-14 : *« l'étape 3 va être identique à la 2 »*. Species est
   donc le MÊME écran que Class — catalogue à défilement aimanté, rail,
   `Validate` à paliers — et tout ça vit dans `catalogue.mjs`, partagé.
   ⛔ ERGONOMIE-BUILDER.md l'exige mot pour mot : *« Ne recopie pas B2 ici.
   Une règle écrite deux fois diverge. B3 = B2, point. »*

   Ce fichier ne garde donc que **ce qui appartient à Species** : à quoi
   ressemble une fiche d'espèce, et ce que confirme son 2ᵉ palier.

   ── LES ÉTATS D'ESPÈCE (lot 42, §3c) — LE CARNET DIT LEQUEL, jamais le nom
   de l'espèce :
     · `species.skillBudget` publié → LA BOURSE CAPTIVE (Elf, Elestu) : des
       points sur des compétences nommées, palier au choix par compétence ;
     · `species.skills` publié → UN CHOIX IMPOSÉ — ⏳ **PLUS AUCUN
       UTILISATEUR depuis le 2026-08-17** ; l'Humain et l'Araag le portaient,
       et Eric a fait absorber ce don par leur barème de points (*« Fast
       Learner qui recouvre tout »*, *« Skillful origine SRD écrase
       Educated »*) parce qu'ils en recevaient DEUX. Le code reste : le
       mécanisme est celui des classes, et une espèce peut le reprendre ;
     · ni l'un ni l'autre (dix espèces sur douze) → RIEN.
   ⭐ ET CE TROISIÈME CAS EST CE QUE LE LOT 60 A DÛ TRANCHER : une espèce qui
   n'accorde rien n'a **QU'UN SEUL PALIER**. Un 2ᵉ appui sur un menu vide
   serait un geste pour rien. I.4 le prévoit : « un écran peut en compter un,
   deux ou trois ».

   ⛔ LE LIGNAGE NE SE CHOISIT TOUJOURS PAS (lot 42, §0.4) : le personnage
   d'exemple porte `species.lineage`, mais AUCUN plan ne l'accompagne — le
   moteur le rend `unconsumed`. Un QCM ici afficherait un choix sans effet. */

import { planAt, planSlots, renderPicker, renderSlotQcm, decisionRefusalWord } from "./carnet.mjs?v=189";
import { renderFicheBody, renderCardRows, renderCardNames, imageDeFiche, DOS_DE_CARTE } from "./catalogue.mjs?v=189";
import { renderChoixGlisses } from "./glisser.mjs?v=189";

/* ✅ LES DOUZE IMAGES SONT ARRIVÉES LE 2026-08-16, et la promesse écrite ici
   est tenue à la lettre : *« le jour où les images arrivent, elles arrivent
   pour les deux écrans AU MÊME ENDROIT »*. `imageDeFiche` et le dos de carte
   vivent maintenant dans `catalogue.mjs`, le fichier que les deux écrans à
   fiche partagent déjà — pas recopiés ici.
   📌 Le record se nomme `gnome` (l'id SRD) et Fate's Hand l'appelle
   **Hoddon** dans sa couche de lore : le fichier posé est donc `gnome.webp`.
   Le dossier ne connaît que des ids, jamais des noms d'affichage. */

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function skillLabel(query, id) {
  const view = query({ kind: "skill", id });
  return view && view.record ? view.record.name : id;
}
/* Capitalisation d'AFFICHAGE seulement (« half » → « Half ») — un mot
   d'écran, pas une règle (même famille que `CATEGORY_LABEL`, lot 39). */
function tierLabel(value) {
  return typeof value === "string" && value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

/* `fiche: true` — même déclaration que Class, même raison (Ch6) : cet écran
   passe par `renderFicheBody`, ses dalles portent `LORE` / `CHOOSE`, et
   `CHOOSE` y remplace le `Validate` générique. « B3 = B2 », jusqu'au bout. */
/* ⭐ `parcours: true` — Species est la première étape à porter le parcours
   d'Eric (2026-08-19) : guide général → guide spécifique → items → bilan.
   Le drapeau suffit ; la coquille fait le reste, et Class puis Inheritance
   n'auront qu'à le poser à leur tour. */
/* ══ UN SOUS-ÉCRAN NE PORTE QU'UN SEUL ITEM — Eric, 2026-08-19 ═════════════
   📐 Sa capture d'écran l'a montré mieux qu'un texte : la dalle d'item portait
   TOUT le panneau — lignage, bourse, gagné d'office, acquis — alors qu'elle
   est censée porter UNE chose. C'était le repli assumé du 19/08 au matin ; le
   voilà remplacé.

   Sa nomenclature d'adresses, du même message :
     · **R0** — la racine : la fiche de l'espèce (son lore, son `Choose`).
     · **B0** — la branche : le guide, sa liste de validation, puis le bilan.
     · **SB1, SB2…** — les sous-branches : un formulaire de choix par item,
       validé par son `Done`, qui ramène en B0.
   ⛔ *« un écran = une lettre et un chiffre — on ne voit jamais deux
   dénominations sur un même écran »*. */
function corpsDeLItem(item, ctx, act) {
  const record = especeRetenue(ctx);
  if (!record || !item) return null;
  /* SB1 — le lignage, et RIEN d'autre. */
  if (item.path === "species.lineage") return renderLineageBlock(ctx, record, act);
  /* ══ SB2 — LA BOURSE, EN GLISSER-DÉPOSER (Eric, 2026-08-19) ═════════════
     *« skill budget est un drag and drop : des tokens +1 et +2 au-dessus avec
     un compteur de budget qui est de 2, en dessous 3 récepteurs. »*

     ⭐ ET SES JETONS EXISTENT DÉJÀ : Novice coûte 1 point, Adept en coûte 2
     (canon §A.1). Les « +1 » et « +2 » d'Eric SONT les deux paliers, nommés
     par leur prix au lieu de leur nom — ce qui est le bon mot ici, puisque
     l'écran parle d'un budget. Aucun troisième objet à inventer.

     ⛔ ET LES RÉCEPTEURS SONT LES COMPÉTENCES, pas des cases anonymes : le
     carnet publie un chemin par slug (`species.skillBudget.<slug>`), et c'est
     lui qui dit lesquels. Trois pour l'Elfe et l'Elestu — Survival, Delve,
     Vigilance. */
  if (item.path === "species.skillBudget") {
    const decisions = ctx.decisions || [];
    const budget = planAt(decisions, "species.skillBudget");
    if (!budget) return null;
    const slugs = budget.options || [];
    const slots = slugs.map((slug, index) => {
      const etape = planAt(decisions, `species.skillBudget.${slug}`);
      return {
        path: `species.skillBudget.${slug}`, index,
        options: etape ? etape.options : BUDGET_TIERS,
        selected: etape ? etape.selected : [],
        lock: etape ? etape.lock : null,
        /* Le récepteur porte le NOM de sa compétence — c'est ce qu'on vise. */
        mot: skillLabel(ctx.query, slug)
      };
    });
    return renderChoixGlisses({
      plan: budget, slots, titre: "Skill budget", mot: "Skill",
      /* Le prix, pas le palier : l'écran parle de budget. */
      labelOf: (id) => (id === "half" || id === "novice" ? "+1" : id === "adept" ? "+2" : tierLabel(id)),
      consigne: `${budget.answered} of ${budget.expected} points spent — drag +1 or +2 onto a skill.`,
      /* ⭐ UN BUDGET SE DÉPENSE EN VALEURS, PAS EN OBJETS : « +1 » peut aller
         sur deux compétences. Sans ce drapeau, poser le premier éteignait le
         jeton et l'écran se bloquait — trouvé par Eric à l'usage. */
      reutilisable: true,
      onAction: act
    });
  }
  /* Le QCM de compétences, quand une espèce en porte un. */
  if (item.path === "species.skills") {
    return renderSlotQcm({
      decisions: ctx.decisions || [], basePath: "species.skills", title: "Species skill",
      labelOf: (id) => skillLabel(ctx.query, id), onAction: act
    });
  }
  /* ⛔ AUCUN REPLI SILENCIEUX : un item sans corps le DIT. Rendre le panneau
     entier « au cas où » est exactement la faute qu'Eric vient de voir. */
  return el("p", "parcours-refus", [text(
    `This choice has no screen yet — ${item.path}.`
  )]);
}

/** Ce que la ligne « gagné d'office » attend. Eric : *« granted automatically
 *  est une autre ligne, grisée tant qu'on n'a pas choisi le lignage ; ensuite
 *  le voyant devient vert et tout s'écrit dans le bilan »*.
 *
 *  ⭐ CE N'EST DONC PAS UN ITEM SANS CHOIX, c'est un item qui DÉPEND d'un
 *  autre. Il ne s'allume pas d'office : il attend que le lignage soit signé,
 *  parce que c'est le lignage qui décide de ce qui est acquis (le dégât du
 *  souffle, la résistance…). Un voyant vert avant ce choix mentirait. */
/* ══ LE BILAN D'UNE LIGNE — Eric, 2026-08-19 ═══════════════════════════════
   *« sous lineages tu fais apparaître le bilan du lineage […] le texte de
   bilan est en dessous et n'est pas centré. »*

   ⛔ IL N'APPARAÎT QU'UNE FOIS LE CHOIX SIGNÉ — sauf « gagné d'office », qui
   est là dès le début parce qu'il ne dépend de rien. Afficher un résumé vide
   ferait trois lignes de « — » là où il n'y a encore rien à dire. */
/* ⛔ CE QU'UNE LIGNE COUVRE DÉJÀ, ET QUI NE DOIT PAS SE REDIRE — Eric,
   2026-08-19 : *« tu évites les doublons comme Keen Senses à deux endroits »*.

   ⭐ IL AVAIT RAISON, ET LE DÉFAUT ÉTAIT GROS : le bilan « gagné d'office »
   listait TOUS les traits, dont `Elven Lineage` (qui EST la ligne Lineage
   juste au-dessus) et `Keen Senses` (qui EST la ligne Skill budget). Trois
   lignes pour dire deux choses, et le lecteur cherche laquelle fait foi.

   ⚠️ LA TABLE EST EXPLICITE, PAS DEVINÉE. Rapprocher un trait d'un item par
   ressemblance de nom marcherait pour l'Elfe et casserait au premier renommage
   — le Hoddon a déjà vu son trait rebaptisé une fois. */
const TRAITS_COUVERTS = {
  "species.lineage": ["elven-lineage", "gnomish-lineage", "hoddon-lineage",
    "draconic-ancestry", "giant-ancestry", "fiendish-legacy"],
  "species.skillBudget": ["keen-senses"],
  "species.skills": []
};

/** Un mot d'écran à partir d'un slug : `delve` → `Delve`. Les slugs sont des
 *  clefs de moteur ; les montrer tels quels donne un bilan qui a l'air d'un
 *  export de base de données. */
function motPropre(valeur) {
  const mot = String(valeur || "").replace(/[-_]/g, " ");
  return mot.charAt(0).toUpperCase() + mot.slice(1);
}

/* ══ LE BILAN D'UNE LIGNE — Eric, 2026-08-19 ═══════════════════════════════
   *« dans le bilan, le texte tu l'écris proprement comme un joli bilan : une
   ligne par élément, tu évites les doublons. »*

   ⛔ IL N'APPARAÎT QU'UNE FOIS LE CHOIX SIGNÉ — sauf « gagné d'office », qui
   est là dès le début parce qu'il ne dépend de rien. */
/** Le trait qui ACCORDE cet item, s'il en existe un sur le record.
 *
 *  ⭐ UN TRAIT COUVERT NE DISPARAÎT PAS, IL CHANGE DE PLACE — Eric,
 *  2026-08-19 : *« tu aurais pu noter Keen Senses au-dessus de Delve et
 *  Vigilance »*. Le retirer de « gagné d'office » était juste (il s'y répétait)
 *  ; le faire disparaître ne l'était pas. Un joueur qui lit « Delve — Novice »
 *  sans savoir D'OÙ ces points viennent lit un résultat sans sa cause.
 *
 *  Même règle pour tous : le lignage aussi porte le sien en tête. */
function traitQuiAccorde(record, chemin) {
  const ids = TRAITS_COUVERTS[chemin] || [];
  return traitsDe(record).find((trait) => ids.includes(trait.id)) || null;
}

function resumeDeLItem(item, ctx) {
  const record = especeRetenue(ctx);
  if (!record || !item) return null;
  const data = record.data || {};
  const decisions = ctx.decisions || [];

  /* ── CE QUI EST ACQUIS SANS RIEN CHOISIR ─────────────────────────────── */
  if (item.path === LIGNE_ACQUIS.path) {
    const sens = Array.isArray(data.senses)
      ? data.senses.map((s) => (s && s.range_ft ? `${s.name} ${s.range_ft} ft` : s && s.name)).filter(Boolean).join(", ")
      : null;
    const destiny = data.destiny && data.destiny.base;
    const lignes = [
      ["Size", data.size], ["Speed", data.speed], ["Creature type", data.creature_type],
      ["Senses", sens], ["Destiny", Number.isFinite(destiny) ? String(destiny) : null]
    ];
    /* LES TRAITS, UN PAR LIGNE, ET SANS CEUX QUE LES AUTRES LIGNES PORTENT. */
    const couverts = new Set();
    for (const [chemin, ids] of Object.entries(TRAITS_COUVERTS)) {
      if (planAt(decisions, chemin)) for (const id of ids) couverts.add(id);
    }
    for (const trait of traitsDe(record)) {
      if (!couverts.has(trait.id)) lignes.push([trait.name, trait.text || "—"]);
    }
    return renderCardRows(lignes);
  }

  if (!item.confirme) return null;

  /* ── LE LIGNAGE : son nom, puis ce qu'il donne, palier par palier ─────── */
  if (item.path === "species.lineage") {
    const options = lignagesDe(record) || [];
    const plan = planAt(decisions, "species.lineage[0]") || planAt(decisions, "species.lineage");
    const pose = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
    const choisi = options.find((o) => o && o.id === pose);
    if (!choisi) return null;
    const trait = traitQuiAccorde(record, "species.lineage");
    return renderCardRows([
      ...(trait ? [[trait.name, choisi.name]] : [[choisi.name, ""]]),
      ...beneficesDe(choisi)
    ]);
  }

  /* ── LA BOURSE : une ligne par compétence dotée, son palier en toutes
     lettres. ⛔ Les compétences non dotées ne s'écrivent pas : un bilan dit ce
     qu'on A, pas ce qu'on aurait pu avoir. */
  if (item.path === "species.skillBudget") {
    const budget = planAt(decisions, "species.skillBudget");
    if (!budget) return null;
    const lignes = (budget.options || []).map((slug) => {
      const etape = planAt(decisions, `species.skillBudget.${slug}`);
      const palier = etape && Array.isArray(etape.selected) ? etape.selected[0] : null;
      return palier ? [motPropre(skillLabel(ctx.query, slug)), tierLabel(palier)] : null;
    }).filter(Boolean);
    if (lignes.length === 0) return null;
    const trait = traitQuiAccorde(record, "species.skillBudget");
    return renderCardRows(trait ? [[trait.name, trait.text || ""], ...lignes] : lignes);
  }
  return null;
}

export const LIGNE_ACQUIS = {
  path: "species.granted",
  sansChoix: true,
  depend: "species.lineage",
  label: "Granted automatically"
};

export const SPECIES_CATALOGUE = {
  path: "species", kind: "species", label: "Species", fiche: true, parcours: true,
  /* ⏳ LE TEXTE EST UN BROUILLON — le mien, pas celui d'Eric. Il dit ce que
     l'écran ATTEND, et il se corrige ICI, à un seul endroit. */
  itemCorps: corpsDeLItem,
  resumeItem: resumeDeLItem,
  itemLabel: (chemin) => (chemin === "species.lineage" ? "Lineage"
    : chemin === "species.skillBudget" ? "Skill budget"
    : chemin === "species.skills" ? "Species skill"
    : chemin === LIGNE_ACQUIS.path ? LIGNE_ACQUIS.label : chemin),
  lignesEnPlus: [LIGNE_ACQUIS],
  guideGeneral: {
    titre: "Choosing a species",
    texte: "Your species is where the character starts: it sets size, speed, senses, " +
      "and a handful of traits you never have to choose.\n\n" +
      "Scroll through the twelve below and read what each one is. When one fits, press " +
      "Choose — the next screen lists everything that species still leaves you to settle."
  }
};

/** LE CORPS D'UNE FICHE D'ESPÈCE — lot 77. ⭐ C'EST EXACTEMENT LA FICHE DE
 *  CLASS, et c'est le point : `renderFicheBody` est écrit une fois, les deux
 *  écrans ne lui passent que LEUR record. Ce qui les distingue tient
 *  entièrement dans la couche (`Type` · `Sz` · `Speed` · `Lineages` chez
 *  l'espèce, `Ability` · `HP` · `Saves` … chez la classe), plus dans le 2ᵉ
 *  palier plus bas — pas dans le dessin.
 *
 *  ✅ TRANCHÉ PAR ERIC, 2026-08-15 (lot 78) : LA MOITIÉ BASSE D'UNE ESPÈCE
 *  PORTE SES TRAITS, comme son croquis A — pas le blurb.
 *
 *  ⭐ DONC *« B3 = B2 »* NE VAUT QUE POUR LA GÉOMÉTRIE. La boîte reste fixe
 *  à 160 px et à la même place ; ce qu'on y met appartient à l'écran. Les
 *  deux croquis d'Eric ne disaient pas la même chose de cette moitié-là, et
 *  le lot 77 avait remonté l'écart au lieu de le trancher.
 *
 *  📏 LA COTE, ET ELLE EST PLUS DURE QUE CELLE DU BLURB (mesurée aux avances
 *  réelles, boîte de 226 px à T2) : une ligne porte 37 caractères, la boîte
 *  en tient 10, et le PIRE CAS est l'Elfe — 5 traits SRD + `Splinter of Anon`
 *  + `Destiny` = **7 entrées**.
 *  ⚠️ Une première cote annonçait 6 : elle comptait les traits SRD seuls et
 *  oubliait les `fh_traits` que la couche FH ajoute (l'`Outlasting` du
 *  halfling, les deux de l'Humain). Un échantillon incomplet, encore.
 *  Le garde tient maintenant la vraie propriété — des LIGNES RENDUES, pas
 *  des caractères (`tests/fiche-360.test.mjs`). */
export function renderSpeciesCardBody(query, id) {
  const view = query({ kind: "species", id });
  const data = (view && view.record && view.record.data) || {};
  if (!Array.isArray(data.fiche_stats)) return renderSpeciesCardBodySrd(data);
  return renderFicheBody({
    stats: data.fiche_stats,
    traits: data.fiche_traits,
    /* ⭐ LE BLURB REVIENT À L'ÉCRAN le 2026-08-17. Il vivait dans la couche
       depuis le lot 77 et n'était passé à personne : la moitié basse portait
       les traits. Les maquettes d'Eric remontent les traits en bloc 1, donc
       le bas est libre — et cinquante mots déjà écrits cessent d'être morts. */
    blurb: typeof data.blurb === "string" ? data.blurb : (data.blurb && data.blurb.text),
    /* `Lineages` a quitté la colonne de stats pour sa propre bande (croquis
       d'Eric) — le TRI est dans la COUCHE, pas ici : une règle du jeu ne vit
       jamais dans un écran. Sept espèces sur douze n'en ont pas, et leur
       fiche centre alors son blurb. */
    infos: data.fiche_infos,
    image: imageDeFiche(id),
    imageSecours: DOS_DE_CARTE,
    imageAlt: ""
  });
}

/** LA FICHE D'ESPÈCE D'UN PERSONNAGE SRD PUR — même raison qu'à Class (loi
 *  §0.12), même geste : le corps d'avant le lot 77, gardé intact, servi
 *  quand la couche `fh-fiche-en` n'est pas montée. */
function renderSpeciesCardBodySrd(data) {
  const sens = Array.isArray(data.senses)
    ? data.senses.map((s) => (s && s.range_ft ? `${s.name} ${s.range_ft} ft` : s && s.name)).filter(Boolean).join(", ")
    : null;
  const destiny = data.destiny && data.destiny.base;
  const bump = data.skill_points && data.skill_points.by_level && data.skill_points.by_level["1"];
  const rows = renderCardRows([
    ["Size", data.size],
    ["Speed", data.speed],
    ["Creature type", data.creature_type],
    ["Senses", sens],
    ["Destiny", Number.isFinite(destiny) ? String(destiny) : null],
    ["Skill points", Number.isFinite(bump) ? `+${bump}` : null]
  ]);
  const traits = (Array.isArray(data.traits) ? data.traits : [])
    .map((t) => t && t.name).filter((n) => typeof n === "string");
  return [rows, renderCardNames("Traits", traits)].filter(Boolean);
}

/* ══ LA BOURSE CAPTIVE (Keen Senses…) ════════════════════════════════════
   `species.skillBudget`, ses propres verbes sur `species.skillBudget.<slug>`
   — les MÊMES chemins que `skills-step.mjs` sait déjà lire et écrire : les
   deux écrans opèrent sur le même document, aucune incohérence possible. */

/* ⚠️ L'EXCEPTION DU LOT 42, CONSERVÉE TELLE QUELLE, et sa raison : un slug
   JAMAIS CLIQUÉ ne porte AUCUNE entrée dans `decisions[]` (les sous-plans ne
   sont générés que pour les chemins déjà présents dans `build.choices`). Sur
   une espèce fraîchement choisie, il n'existe donc AUCUN endroit vivant où
   lire la paire `half`/`proficient`. Un repli à `[]` ferait disparaître les
   boutons de palier tant que le joueur n'a rien cliqué — c'est l'attaque qui
   avait trouvé ce bogue au lot 42. */
const BUDGET_TIERS = ["novice", "adept"];

function renderSpeciesBudget(ctx, budgetPlan, act) {
  const { decisions, query } = ctx;
  const wrap = el("section", "skills-budget-block");
  wrap.dataset.status = budgetPlan.status;
  wrap.append(el("h3", null, [text("Species skill budget")]));
  wrap.append(el("p", "skills-budget-note", [text(`${budgetPlan.answered} of ${budgetPlan.expected} points spent`)]));
  if (budgetPlan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(budgetPlan.lock))]));
  const rows = el("div", "skills-rows");
  for (const slug of budgetPlan.options) {
    const path = `species.skillBudget.${slug}`;
    const step = planAt(decisions, path);
    const row = el("div", "skills-row");
    row.dataset.row = slug;
    row.append(el("span", "record-row-label", [text(skillLabel(query, slug))]));
    row.append(renderPicker({
      options: step ? step.options : BUDGET_TIERS,
      selected: step ? step.selected : [],
      labelOf: tierLabel,
      onSelect: (value) => act({ kind: "set", path, value }),
      onClear: () => act({ kind: "clear", path }),
      lock: step ? step.lock : null
    }));
    rows.append(row);
  }
  wrap.append(rows);
  return wrap;
}

/* ══ LE PANNEAU « CHOOSE » — LA SÉQUENCE D'ERIC ═════════════════════════════
   📐 Sa spec du 2026-08-18, mot pour mot, et c'est l'ORDRE qui compte :

       « Derrière choose :
         Choix lineages
         Line bleed
         Afficher ce qui est gagné d'office
         Line bleed
         Tous les choix à faire drag and drop
         Affiché ce qui est acquis
         Done »

   Quatre blocs séparés par des filets qui saignent, et un geste pour sortir.
   Avant ce lot, ce panneau rendait UN seul organe — la bourse captive OU le
   QCM — et ne disait ni ce que l'espèce donnait, ni ce qu'on avait pris.

   ⭐ CE QUI EST GAGNÉ D'OFFICE ET CE QUI EST ACQUIS SONT DEUX BLOCS, et la
   différence n'est pas cosmétique : l'un est ce que l'espèce DONNE (le
   joueur ne peut rien y faire), l'autre est ce que le joueur a PRIS. Les
   fondre ferait croire qu'on peut renoncer à sa Darkvision.

   ⛔ AUCUNE RÈGLE DE JEU ICI. Les traits, les lignages et les points sont lus
   dans le record et dans le carnet ; cet écran ne calcule rien. */

/** Le filet qui saigne — il déborde le panneau des deux côtés (`shell.css`),
 *  pour SÉPARER sans encadrer : un blanc seul ne se voit pas, une boîte
 *  enfermerait. */
function saignee() {
  const trait = el("hr", "saignee");
  trait.setAttribute("aria-hidden", "true");
  return trait;
}

/** Le record de l'espèce RETENUE — lu dans le carnet, jamais deviné.
 *  ⚠️ `selected` est un TABLEAU (leçon du lot 79, tête de `renderChoixGlisses`). */
function especeRetenue(ctx) {
  const plan = planAt(ctx.decisions || [], "species");
  const id = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
  if (!id || !ctx.query) return null;
  const view = ctx.query({ kind: "species", id });
  return view && view.record ? view.record : null;
}

function lignagesDe(record) {
  const liste = record && record.data && record.data.lineages;
  return Array.isArray(liste) && liste.length > 0 ? liste : null;
}

/** Ce qu'une option de lignage APPORTE, en une ligne par palier.
 *  Le Dragonborn est le seul à porter `damage` au lieu de `levels` : sa table
 *  ne donne pas un bénéfice, elle donne le dégât que Breath Weapon lira. */
function beneficesDe(option) {
  if (option && typeof option.damage === "string") return [["Damage", option.damage]];
  const paliers = (option && option.levels) || {};
  return Object.keys(paliers)
    .sort((a, b) => Number(a) - Number(b))
    .map((niveau) => [`Level ${niveau}`, paliers[niveau]]);
}

/* ── BLOC 1 — LE CHOIX DE LIGNAGE ──────────────────────────────────────── */

/** ⭐ IL RÉUTILISE `renderChoixGlisses`, l'organe du lot 79 : mêmes gestes que
 *  les sorts mineurs du magicien — glisser pour choisir, taper pour lire.
 *  Écrire un second glisser ici, c'est deux gestes qui divergent.
 *
 *  ⚠️ ET LES BÉNÉFICES SONT AFFICHÉS, PAS CACHÉS DERRIÈRE LE TAP. Choisir
 *  entre dix ancêtres draconiques sans voir leurs dégâts n'est pas un choix,
 *  c'est un tirage. Le tap MARQUE l'option lue ; il ne la révèle pas. */
function renderLineageBlock(ctx, record, act) {
  const options = lignagesDe(record);
  if (!options) return null;
  const decisions = ctx.decisions || [];
  const groupe = planAt(decisions, "species.lineage");
  if (!groupe) return null;
  /* ⚠️ `planSlots` ET PAS `planAt` : un créneau porte un `index`, que
     `renderChoixGlisses` affiche (`${mot} ${index + 1}`). Un plan lu par
     `planAt` n'en a pas — le créneau s'est affiché « Lineage NaN » dans la
     page, mesuré le soir même. Un organe partagé se nourrit avec ce qu'il
     attend, pas avec ce qui lui ressemble.

     ⭐ ET LE REPLI EXISTE parce que le chemin du choix peut être le GROUPE :
     le document d'acceptation écrit `species.lineage` sans indice, et
     `multiPlan` rend alors son entrée à ce chemin-là. Le panneau doit rendre
     ce personnage aussi. */
  const creneaux = planSlots(decisions, "species.lineage");
  const etape = creneaux.length > 0 ? creneaux : [{ ...groupe, index: 0 }];
  const nomDe = (id) => {
    const trouve = options.find((option) => option && option.id === id);
    return trouve ? trouve.name : id;
  };

  const bloc = el("section", "species-lignage");
  const glisse = renderChoixGlisses({
    plan: groupe, slots: etape, titre: "Lineage", mot: "Lineage",
    labelOf: nomDe, onAction: act,
    consigne: "Drag a lineage into the slot — tap one to read what it grants.",
    onInfo: (id) => {
      for (const ligne of bloc.querySelectorAll("[data-lignage]")) {
        ligne.dataset.lu = ligne.dataset.lignage === id ? "oui" : "non";
      }
    }
  });
  if (glisse) bloc.append(glisse);

  const liste = el("dl", "species-lignage-benefices");
  for (const option of options) {
    const nom = el("dt", null, [text(option.name)]);
    nom.dataset.lignage = option.id;
    /* Le seul lignage sans équivalent SRD porte sa marque, comme le chapitre
       du vault l'écrit : `The Mole People *(FH)*`. */
    if (option.fh) nom.append(el("span", "species-lignage-fh", [text("FH")]));
    liste.append(nom);
    for (const [etiquette, corps] of beneficesDe(option)) {
      const valeur = el("dd", null, [text(`${etiquette} — ${corps}`)]);
      valeur.dataset.lignage = option.id;
      liste.append(valeur);
    }
  }
  bloc.append(liste);
  return bloc;
}

/* ── BLOC 2 — CE QUI EST GAGNÉ D'OFFICE ───────────────────────────────── */

/** ⚠️ LES TRAITS SONT `data.traits` PUIS `data.fh_traits`, dans cet ordre, et
 *  la règle est totale : la couche FH pose ses traits à part parce qu'un
 *  chemin de patch ne crée pas d'élément de collection (voir la tête de
 *  `patchEntry` dans `gen-fh-species-layer.mjs`). Les lire à un seul endroit,
 *  c'est en perdre la moitié. */
function traitsDe(record) {
  const data = (record && record.data) || {};
  const base = Array.isArray(data.traits) ? data.traits : [];
  const fh = Array.isArray(data.fh_traits) ? data.fh_traits : [];
  return [...base, ...fh].filter((trait) => trait && trait.name);
}

function renderGrantedBlock(ctx, record) {
  const data = (record && record.data) || {};
  const bloc = el("section", "species-acquis");
  bloc.append(el("h3", null, [text("Granted automatically")]));

  const sens = Array.isArray(data.senses)
    ? data.senses.map((s) => (s && s.range_ft ? `${s.name} ${s.range_ft} ft` : s && s.name)).filter(Boolean).join(", ")
    : null;
  const destiny = data.destiny && data.destiny.base;
  const points = data.skill_points && data.skill_points.by_level && data.skill_points.by_level["1"];
  const rows = renderCardRows([
    ["Size", data.size],
    ["Speed", data.speed],
    ["Creature type", data.creature_type],
    ["Senses", sens],
    ["Destiny", Number.isFinite(destiny) ? String(destiny) : null],
    ["Skill points", Number.isFinite(points) ? `+${points}` : null]
  ]);
  if (rows) bloc.append(rows);

  const traits = traitsDe(record);
  if (traits.length > 0) {
    const liste = el("dl", "species-traits");
    for (const trait of traits) {
      liste.append(el("dt", null, [text(trait.name)]));
      if (typeof trait.text === "string" && trait.text.length > 0) {
        liste.append(el("dd", null, [text(trait.text)]));
      }
    }
    bloc.append(liste);
  }
  return bloc;
}

/* ── BLOC 4 — CE QUI EST ACQUIS ────────────────────────────────────────── */

/** Ce que le JOUEUR a pris — le lignage posé et les compétences retenues.
 *  ⛔ Il ne recopie pas le bloc 2 : ce qui est donné n'est pas ce qui est
 *  choisi, et un joueur qui relit son écran doit voir la différence.
 *
 *  ⚠️ Quand rien n'est encore posé, il le DIT au lieu de disparaître. Un bloc
 *  qui s'évapore fait croire qu'il n'existe pas ; une phrase dit qu'il attend. */
function renderAcquiredBlock(ctx, record) {
  const decisions = ctx.decisions || [];
  const bloc = el("section", "species-acquis");
  bloc.append(el("h3", null, [text("What you have taken")]));
  const lignes = [];

  const options = lignagesDe(record);
  if (options) {
    const plan = planAt(decisions, "species.lineage[0]") || planAt(decisions, "species.lineage");
    const pose = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
    const option = pose ? options.find((o) => o && o.id === pose) : null;
    if (option) {
      const premier = beneficesDe(option)[0];
      lignes.push(["Lineage", premier ? `${option.name} — ${premier[1]}` : option.name]);
    }
  }

  const budget = planAt(decisions, "species.skillBudget");
  if (budget) {
    for (const slug of budget.options || []) {
      const etape = planAt(decisions, `species.skillBudget.${slug}`);
      const palier = etape && Array.isArray(etape.selected) ? etape.selected[0] : null;
      if (palier) lignes.push([skillLabel(ctx.query, slug), tierLabel(palier)]);
    }
  }

  const qcm = planAt(decisions, "species.skills");
  if (qcm) {
    for (const valeur of qcm.selected || []) lignes.push(["Skill", skillLabel(ctx.query, valeur)]);
  }

  const rows = renderCardRows(lignes);
  if (rows) bloc.append(rows);
  else bloc.append(el("p", "species-acquis-vide", [text("Nothing taken yet — your choices will appear here.")]));
  return bloc;
}

/* ── LE PANNEAU ─────────────────────────────────────────────────────────── */

/** LE MENU DU 2ᵉ PALIER — désormais la séquence entière d'Eric.
 *
 *  ⚠️ LES FILETS NE SE POSENT QU'ENTRE DEUX BLOCS PRÉSENTS. Sept espèces sur
 *  douze n'ont pas de lignage ; un filet en tête de panneau annoncerait un
 *  bloc absent. */
export function renderSpeciesChoices(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const act = onAction || ctx.onAction || (() => {});
  const menu = el("div", "catalogue-choices");
  const record = especeRetenue(ctx);
  const blocs = [];

  const lignage = record ? renderLineageBlock(ctx, record, act) : null;
  if (lignage) blocs.push(lignage);
  if (record) blocs.push(renderGrantedBlock(ctx, record));

  /* LES CHOIX À FAIRE — la bourse captive OU le QCM, jamais les deux (voir
     les états d'espèce en tête de fichier). Inchangés : ce lot les ENTOURE,
     il ne les réécrit pas. */
  const budget = planAt(decisions, "species.skillBudget");
  if (budget) blocs.push(renderSpeciesBudget(ctx, budget, act));
  else {
    const qcm = renderSlotQcm({
      decisions, basePath: "species.skills", title: "Species skill",
      labelOf: (id) => skillLabel(ctx.query, id), onAction: act
    });
    if (qcm) blocs.push(qcm);
  }

  if (record) blocs.push(renderAcquiredBlock(ctx, record));

  for (let index = 0; index < blocs.length; index += 1) {
    if (index > 0) menu.append(saignee());
    menu.append(blocs[index]);
  }

  /* DONE — le dernier mot de la spec. ⛔ Ce n'est PAS un second geste de
     validation : il émet `done`, que la coquille traduit par le même
     `pressDone()` que le palier de `Validate`. Deux portes pour une sortie
     divergeraient le jour où l'une des deux change. */
  if (blocs.length > 0) {
    const done = el("button", "species-done", [text("Done")]);
    done.type = "button";
    done.addEventListener("click", () => act({ kind: "done" }));
    menu.append(done);
  }
  return menu;
}

/** LE 2ᵉ PALIER DE SPECIES — `null` quand l'espèce n'accorde rien.
 *
 *  ⚠️ CE QU'ERIC N'A PAS DIT, ET QUI EST DONC INFÉRÉ : ERGONOMIE-BUILDER.md
 *  le signale lui-même — « le 2ᵉ palier de Validate est-il ce budget ? Sur
 *  Class, Validate 2 = features choisis. L'équivalent ici serait le budget
 *  d'espèce — inféré, pas dit par Eric ». C'est la lecture retenue : elle
 *  découle de « B3 = B2 », et elle est la seule qui donne un sens au 2ᵉ
 *  appui. Signalée ici plutôt que fondue dans le code. */
export function speciesPalier2(decisions) {
  /* 🔴 2026-08-18 — LE LIGNAGE OUVRE UN SECOND PALIER, ET CE N'EST PAS UN
     DÉTAIL : sans cette ligne, `Choose` sur un Dragonborn passait DIRECTEMENT
     à l'étape suivante — le panneau existait, personne ne pouvait l'ouvrir.
     Mesuré dans la page le soir même, pas déduit.

     ⚠️ ET LES TROIS PLANS SE CUMULENT au lieu de se remplacer. L'ancien code
     lisait « la bourse OU le QCM » et sortait au premier trouvé ; l'Elfe porte
     MAINTENANT les deux (sa bourse captive ET son lignage), et un `ready` qui
     ne regarde que le premier déclarerait l'écran fini avec un lignage vide. */
  const plans = ["species.lineage", "species.skillBudget", "species.skills"]
    .map((chemin) => planAt(decisions, chemin))
    .filter(Boolean);
  if (plans.length === 0) return null; // Loroka & co : un seul palier
  return { ready: plans.every((plan) => plan.answered >= plan.expected) };
}
