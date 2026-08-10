/* ══ L'ÉTAPE COMPÉTENCES, BRANCHÉE — lot 33 ═══════════════════════════
   Lit `decisions[]` (lot 28), rien d'autre. Ne connaît aucun nom de règle :
   les options sont des identifiants, les labels affichés sont ceux du
   contrat (`skill.data.name`, tendu par l'appelant) faute d'un mécanisme
   de mots pour l'UI — voir la dette notée dans `shell.mjs` (lot 31).

   Chaque groupe de compétences (`class.skills`, `species.skills`, …) peut
   être :
     · un slot UNIQUE  — une seule entrée, `path` = la racine du groupe ;
     · un plan MULTIPLE — une entrée sommaire (compte) + une entrée par
       emplacement (`class.skills[0]`, `class.skills[1]`, …). Lecture faite
       sur la vraie matière (lot 28/32) : la sommaire n'est PAS cliquable,
       chaque emplacement l'est. */

/* ⚠️ NE JAMAIS GROUPER PAR TEXTE DE CHEMIN. Un premier essai groupait par
   « le dernier segment vaut "skills" » — et ratait le vrai chemin de choix
   de l'Elfe, `species.keenSenses` (le nom de SON trait, pas un mot
   générique). Bogue trouvé en cliquant pour de vrai : le clic tombait sur
   l'entrée SOMMAIRE synthétique (`species.skills`), que le moteur refuse
   silencieusement de traiter (`clear` répond `removed:false`) parce
   qu'aucun choix n'y vit jamais.

   Le champ STABLE est `provenance.field` — `skill_choice` (classe) ou
   `granted_skill_choice` (espèce), posé par `decisions.mjs` lui-même,
   jamais déduit d'un texte de chemin. */
const SKILL_FIELDS = new Set(["skill_choice", "granted_skill_choice"]);

function groupOf(path) {
  return path.replace(/\[\d+\]$/, "");
}

function skillDecisions(decisions) {
  const bySkillGroup = new Map();
  for (const entry of decisions || []) {
    if (!entry.provenance || !SKILL_FIELDS.has(entry.provenance.field)) continue;
    const group = `${entry.provenance.kind}:${entry.provenance.field}`;
    if (!bySkillGroup.has(group)) bySkillGroup.set(group, []);
    bySkillGroup.get(group).push(entry);
  }
  return bySkillGroup;
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}

/** @param {object} decisions le carnet `rebuild().decisions`
 *  @param {(action: {kind:"set"|"clear", path:string, value?:string}) => void} onAction */
export function renderSkillsStep(decisions, onAction) {
  const groups = skillDecisions(decisions);
  const section = el("section", "skills-step");

  if (groups.size === 0) {
    section.append(el("p", "placeholder", [
      document.createTextNode("No skill decisions in this document yet.")
    ]));
    return section;
  }

  for (const [group, entries] of groups) {
    /* ⚠️ `entries[0]` N'EST PAS la sommaire, et un premier essai le croyait
       (bogue trouvé au clic réel, sur l'Elfe). `projectDecisions` TRIE le
       carnet ENTIER par chemin avant de le rendre (`decisions.mjs:246`) —
       "species.keenSenses" < "species.skills" alphabétiquement, donc le
       VRAI emplacement précède sa sommaire synthétique dans le tableau.

       Le signal fiable : `multiPlan` fixe `basePath` à `${root}.skills`,
       TOUJOURS — c'est la sommaire, jamais un chemin de choix réel, SAUF
       si elle a été absorbée par la déduplication de `decisions.mjs` (une
       espèce dont le choix réel vivrait littéralement à ce chemin — alors
       il ne reste qu'UNE entrée, et celle-là EST actionnable). Une
       sommaire ne se distingue donc que si elle COEXISTE avec au moins un
       autre chemin du même groupe. */
    const syntheticPath = `${entries[0].provenance.kind}.skills`;
    const summary = entries.length > 1 ? entries.find((entry) => entry.path === syntheticPath) : null;
    const slots = summary ? entries.filter((entry) => entry !== summary) : entries;

    const block = el("div", "skill-group");
    const provenance = (summary || entries[0]).provenance;
    const title = provenance
      ? `${provenance.kind} — ${provenance.id.split(":").pop()}`
      : group;
    block.append(el("h3", null, [document.createTextNode(title)]));
    const budgetSource = summary || slots[0];
    block.append(el("p", "skill-budget", [
      document.createTextNode(`${budgetSource.answered} of ${budgetSource.expected} chosen`)
    ]));

    const targets = slots;
    for (const slot of targets) {
      const row = el("div", "skill-slot");
      row.dataset.status = slot.status;
      const chips = el("div", "skill-chips");
      for (const optionId of slot.options) {
        const chosen = slot.selected.includes(optionId);
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "skill-chip";
        chip.dataset.chosen = String(chosen);
        chip.textContent = optionId;
        chip.disabled = slot.status === "locked";
        chip.addEventListener("click", () => {
          if (chosen) onAction({ kind: "clear", path: slot.path });
          else onAction({ kind: "set", path: slot.path, value: optionId });
        });
        chips.append(chip);
      }
      row.append(chips);
      if (slot.lock) {
        row.append(el("p", "skill-lock", [document.createTextNode(slot.lock.key)]));
      }
      block.append(row);
    }
    section.append(block);
  }

  return section;
}
