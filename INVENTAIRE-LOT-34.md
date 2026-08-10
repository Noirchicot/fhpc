# Inventaire du lot 34 — `34-skill-pool-tiers`

Branche `34-skill-pool-tiers`, worktree
`~/tools/fhpc-worktrees/34-skill-pool-tiers`, coupée de `main` à `d132c80`.

**Ligne de départ vérifiée avant d'écrire : 579/579 verts.**
**Suite complète rejouée à l'arrivée : 589/589 verts, arbre propre.**
Aucune régression : les 579 d'origine sont tous encore verts (5 réécrits
pour de bonnes raisons mesurées, voir §5) ; 10 tests nouveaux
(`tests/fh-skill-tiers.test.mjs`, plus 1 test de garde dans
`fh-species.test.mjs`).

---

## 1. Le détour architectural qui a coûté le plus de temps

Ma première passe lisait `data[fh_skill_pool]` (et `tier_costs`,
`expertise_from_level`) **directement dans `derive.mjs`**, pour construire
le plancher et le canal de dépense dans le pli lui-même. Ça marchait — et ça
faisait rougir DEUX gardes de la loi §0.12, mesurés en le lançant :

- `tests/build-block.test.mjs` (« LOI §0.12 ») interdit `\bfh[A-Z_]` dans
  `src/build/` — `fh_skill_pool` contient `fh_`, littéralement.
- `tests/fh-skill-pool.test.mjs` (ACCEPTATION 4) est plus dur encore : il
  interdit le mot **`expertise`** lui-même, `tier_costs`, `imposed` (en
  anglais), `Fast Learner`, `Educated` — **dans tout fichier de
  `src/build/`, commentaires compris**, pas seulement le code exécutable.

Conséquence : le plancher à quatre paliers, le canal de dépense et le
verrou d'expertise ne peuvent PAS vivre dans `derive.mjs`, `decisions.mjs`
ni `block.mjs` — même en y lisant juste une valeur, même en n'y écrivant
qu'un commentaire qui NOMME le champ. C'est le module
(`src/modules/fh/skill-pool.mjs`, hors du garde) qui doit tout faire, et il
doit le faire à travers des canaux **génériques** que le pli recopie sans
jamais les nommer.

**La forme retenue**, mesurée deux fois avant de tenir :

1. Le pli (`derive.mjs`) construit `resolved.skills[]` **exactement comme
   avant ce lot** (un imposé = maîtrisé plein) — c'est le modèle SRD,
   générique, inchangé. Il calcule aussi `imposedSkillSlugs`, une liste
   plate de slugs — un fait générique (« ces compétences sont déjà
   imposées »), pas un mot de FH.
2. Il tend cette liste au module activé par `fh.skills`, comme il tend déjà
   `level`/`proficiency`/`species`/`refs`.
3. Le module rend `skillTiers: {slug: {proficiency, bonusTerm}}` — le NOM du
   palier et son bonus DÉJÀ CALCULÉ (le module connaît la formule, il la
   fait). Le pli, en second passage après la boucle des modules, ADDITIONNE
   `bonusTerm` au modificateur de caractéristique et REMPLACE `proficiency` —
   sans jamais écrire ni lire le mot `expertise`.
4. Pour le refus keyé (verrou d'expertise, palier illégal…), le module rend
   `violations: [{key, params, path}]` — MÊME discipline, un canal de plus.
   `derive.mjs` les recopie dans `moduleViolations` (résultat de
   `rebuild`) ; `block.validate` les fusionne dans son propre rapport.

C'est un détour qui a coûté une réécriture complète de la section
COMPÉTENCES et de la boucle des modules, mais c'est la SEULE forme qui
satisfait §0.12 tel qu'il est réellement gardé — pas tel que je l'avais
supposé.

**Le budget captif d'espèce** (`granted_skill_budget`,
`species.skillBudget.*`) n'a PAS ce problème : c'est un champ de CONTENU
générique (comme `granted_skill_choice`), et il vit donc dans
`decisions.mjs` sans détour — voir §3.

---

## 2. Mes trois arbitrages (les points ouverts de la commande)

### 2.1 — Le nom de champ : `granted_skill_budget`

`{count, from}` (Araag/Human, « Skillful ») et `{points, from}`
(Elf/Elestu, « Keen Senses ») sont deux MÉCANIQUES différentes — la
première pose une compétence pleine par choix, la seconde pose un budget
de points à répartir sur une grille de paliers. Réutiliser le même champ
`granted_skill_choice` pour les deux formes aurait obligé tout lecteur à
faire du `typeof declaration.count === "number" ? … : …` pour deviner
laquelle il tenait — exactement la sorte de code que ce dépôt refuse
(§0.6, et le précédent `skill_points`/`destiny` qui distingue déjà par la
FORME, pas par un nom générique fourre-tout). `granted_skill_budget` dit ce
qu'il est en le nommant, symétrique de `granted_skill_choice` : même
famille de mots, sens différent, jamais ambigu à la lecture d'un record.

### 2.2 — La forme du canal de dépense : deux chemins, pas un

- `species.skillBudget.<slug>` (root `species`, hors namespace de module) —
  parce que le budget captif ne touche jamais `fh:skill-points` et doit
  rester lisible par le pli générique et par `decisions.mjs`.
- `fh.skills.spend.<slug>` (dans le namespace du module `fh.skills`) — parce
  que juger cette dépense (plancher, verrou d'expertise) exige de lire
  `fh_skill_pool`, et que **seul un fichier hors `src/build/` a le droit de
  le faire** (voir §1). Le mesurer m'a fait ABANDONNER ma première idée
  (`class.skillSpend.<slug>`, suggérée par la commande) : elle aurait remis
  le canal dans le pli générique, exactement là où le garde mord.

  Bonus mesuré après coup : un test PRÉEXISTANT
  (`tests/fh-skill-pool.test.mjs`, « ATTAQUE — un choix posé dans le
  namespace du module est REFUSÉ ») utilisait déjà le chemin
  `fh.skills.spend[0]` pour prouver que ce namespace refusait tout. La forme
  `fh.skills.spend.<slug>` (points, pas crochets) ne collisionne pas avec
  lui — les deux gardes cohabitent, mesuré, `npm test` à l'appui.

### 2.3 — Le sort de `{count, from}` : il reste, pour Araag et Human seuls

Mesuré (`grep -rn granted_skill_choice layers/` après régénération) : les
SEULS porteurs réels de `granted_skill_choice` dans toute la pile sont
`fh:species:en:araag` (par `lift` depuis Human) et `srd:species:en:human`
(natif SRD, « Skillful »). Aucun autre grant de la pile n'est un budget
captif déguisé. La commande demandait de vérifier « s'il existe un tel cas
réel » avant de le garder par confort — c'est fait, et le résultat est
positif : `{count, from}` reste la forme d'un choix NON restreint par
palier (une pleine maîtrise, choisie librement dans `from`, y compris
`"any"`), `{points, from}` celle d'un budget CAPTIF à paliers variables. Les
deux coexistent parce qu'elles décrivent deux règles différentes, pas parce
qu'une migration est restée à moitié faite.

### 2.4 (point non prévu par la commande, mais mesuré et tranché) — la frontière §0.12 est plus stricte qu'annoncé

Voir §1. Je le note ici parce que c'est la mesure qui a le plus changé la
forme du lot, et parce qu'un futur lot qui toucherait `src/build/` doit le
savoir avant d'écrire une ligne : **aucun fichier de `src/build/` ne peut
mentionner `fh_skill_pool`, `tier_costs`, `expertise` (n'importe quelle
casse), `imposed` (en anglais), `Fast Learner` ou `Educated` — même en
commentaire.** `tests/fh-skill-pool.test.mjs` (ACCEPTATION 4) le vérifie
littéralement sur les octets du fichier.

---

## 3. Ce que j'ai livré, fichier par fichier

- **`src/tools/fh-species-source.mjs`** — Elestu porte `grantedSkillBudget:
  {points: 2, from: KEEN_SENSES_SKILLS}` au lieu de `grantedSkillChoice`.
  Constante `KEEN_SENSES_BUDGET_POINTS = 2`, exportée.
- **`src/tools/gen-fh-species-layer.mjs`** — `addEntry` pose
  `data.granted_skill_budget` quand `grantedSkillBudget` est déclaré ;
  `patchEntry` (le cas `keenSenses` de l'Elf) **retire**
  `data[granted_skill_choice]` (`remove`, vérifié présent par
  `assertTargetField` avant retrait) et pose `data[granted_skill_budget]` à
  la place.
- **`layers/fh-species-en.layer.json`** — régénéré. Diff : Elestu et Elf
  portent `granted_skill_budget` au lieu de `granted_skill_choice`. Araag et
  Human intacts.
- **`src/build/derive.mjs`** — § COMPÉTENCES : reste SRD-générique (voir
  §1). Ajout du budget captif d'espèce (content générique, hors module) et
  de deux canaux génériques de plus dans la boucle des modules :
  `skillTiers` (corrige `resolved.skills[]` en second passage) et
  `violations` (recopié dans `moduleViolations`).
- **`src/modules/fh/skill-pool.mjs`** — nouveau : lit `imposedSkillSlugs`,
  traite `fh.skills.spend.<slug>`, calcule le plancher, le verrou
  d'expertise, le coût de la différence (ligne de détail NOMMÉE dans le
  pool), et rend `skillTiers`/`violations`. Import ajouté :
  `buildViolation` depuis `../../build/validate.mjs` (le sens du module vers
  `src/build/` est autorisé ; c'est l'inverse qui ne l'est pas).
- **`src/build/decisions.mjs`** — nouveau groupe DISTINCT
  `species.skillBudget` (contrat §4e). Le canal `fh.skills.spend.*`
  N'EST PAS projeté ici — voir §1, et le commentaire laissé dans le fichier
  à l'endroit exact où j'ai retiré `classSpendPlan`.
- **`src/build/block.mjs`** — `rebuild()` expose `moduleViolations` ;
  `validate()` les fusionne dans son propre rapport (`reported.addMany`).
- **`src/labels.mjs`** / **`src/modules/fh/labels.mjs`** — nouvelles clefs
  (`skill-budget.*`, `skill-spend.*`) et le libellé de la ligne de dépense
  (`fh.skills.term.spend`).
- **`src/tools/exemple-fh-en.mjs`** + **`examples/personnage-fh-en-niveau1.fh-char.json`**
  (régénéré) — l'Elf de l'exemple dépense désormais ½ Survival + ½
  Vigilance au lieu de l'ancien `species.keenSenses = "survival"`.
- **`contracts/build.md`** — nouvelle section « LOT 34 — LA GRILLE À QUATRE
  PALIERS » sous § THE SKILL POOL : les deux formes de grant, les deux
  canaux, le canal de correction des paliers, et POURQUOI le canal de
  dépense principal n'est pas dans `decisions.mjs`.
- **`tests/fh-skill-tiers.test.mjs`** (nouveau) — les 6 obligations de test
  de la commande (§5, points 1 à 6), plus 2 tests de non-régression ciblés.
- **`tests/build-decisions.test.mjs`**, **`tests/fh-species.test.mjs`**,
  **`tests/fh-skills.test.mjs`** — mis à jour pour la nouvelle forme (voir
  §5, « pourquoi ils ont changé »).

---

## 4. La formule du bonus `half`, et celle d'`expertise`

Dans `tierBonusTerm(tier, proficiency)` (`skill-pool.mjs`, seul endroit du
dépôt qui a le droit de l'écrire) :

```
none        →  0
half        →  Math.floor(proficiency / 2)
proficient  →  proficiency
expertise   →  proficiency * 2
```

`half` et `proficient` sont vérifiés contre le builder de référence
(`fh-skill-builder.html`, `TIER_FULL`) et contre le vault (« Demi 1 pt ·
Plein 2 pts » — le nombre de points, pas le bonus, ne pas confondre les
deux échelles, comme la commande le rappelle). `expertise` double le bonus
de maîtrise : c'est l'arithmétique standard du SRD (l'Expertise du
Roublard), non réinventée — la commande ne donne pas ce nombre
explicitement, et je l'ai vérifié contre la règle SRD plutôt que de la
deviner à vide.

---

## 5. Les attaques, et ce qui a rougi

Deux attaques MANUELLES, chacune : source modifiée, `npm test` (fichier
ciblé) rejoué pour voir rougir EXACTEMENT le test attendu et rien d'autre,
source restaurée depuis une copie de secours, `diff` byte-à-byte confirmant
la restauration, `npm test` complet rejoué vert.

1. **Le verrou d'expertise** (`skill-pool.mjs`, la condition
   `value === "expertise" && level < expertiseFromLevel(...)`) désactivée
   (`if (false && …)`) → le test « le verrou d'expertise refuse AVANT le
   niveau… » rougit, seul, dans `tests/fh-skill-tiers.test.mjs`. Restauré,
   `diff` vide, suite complète verte.
2. **La restriction du budget captif** (`derive.mjs`, la condition
   `!allowedBudget.has(slug) || !Object.hasOwn(BUDGET_TIER_COST, value)`)
   désactivée (`if (false) continue;`) → le test « Keen Senses — une
   compétence HORS {…} est un refus keyé… » rougit, seul. Restauré, `diff`
   vide, suite complète verte.

Non-régression, ce qui a changé et pourquoi (§8 de la commande) :

- `tests/fh-species.test.mjs` — l'assertion `granted_skill_choice.from` sur
  Elf/Elestu devient `granted_skill_choice === undefined` +
  `granted_skill_budget.{from,points}` : le champ a changé de forme (§2.1).
  `perceptionReferences()` (le garde « plus de Perception ») lit maintenant
  les DEUX champs, sinon il devient aveugle au budget captif — un test
  d'attaque dédié le prouve.
- `tests/fh-skills.test.mjs` — même changement de champ sur le `ref` que la
  couche des compétences avait déjà pris (Elestu).
- `tests/build-decisions.test.mjs` — le test Araag/Elestu attendait un plan
  `species.skills` compté pour l'Elestu ; il n'existe plus (Elestu ne porte
  plus `granted_skill_choice`). Réécrit pour vérifier le nouveau plan
  `species.skillBudget`, ses options, son coût et son statut.

Aucun autre test existant qui touchait `granted_skill_choice` ou le pool
n'a eu besoin de changer — mesuré en isolant `tests/fh-skill-pool.test.mjs`
seul (20/20 verts sans aucune modification de ce fichier).

---

## 6. La table AVANT/APRÈS — Elf niveau 1, Magicien, Acolyte

Personnage : Elf / Wizard / Acolyte, niveau 1, `class.skills` = Arcana +
History. Deux jets de `rebuild()`, seule différence : la dépense du budget
captif.

### Le pool de classe (`fh:skill-points`) — IDENTIQUE dans les deux cas

| Ligne | Valeur |
|---|---|
| Class Pool · Wizard | +12 |
| Wizard · 2 imposed choices | −2 |
| Acolyte · 2 imposed choices | −2 |
| Acolyte · 1 imposed choice | −1 |
| **Total publié** | **7** |

Aucune ligne « Elf » nulle part — c'est la preuve du contrat §4e : le
budget captif ne touche jamais ce détail, avec ou sans Keen Senses dépensé.

### `resolved.skills[]` — les quatre lignes qui bougent

| Compétence | SANS Keen Senses dépensé | AVEC ½ Survival + ½ Vigilance |
|---|---|---|
| Survival (Sag) | `none`, bonus 1 | `half`, bonus **2** |
| Vigilance (Sag) | `none`, bonus 1 | `half`, bonus **2** |
| Delve (Sag) | `none`, bonus 1 | `none`, bonus 1 — le troisième n'a rien reçu |
| Arcana (Int, imposée par la classe) | `half`, bonus 3 | `half`, bonus 3 — inchangée, hors sujet du budget |

Le magicien de l'exemple commité (`examples/personnage-fh-en-niveau1.fh-char.json`)
dépense exactement cette répartition (½ Survival, ½ Vigilance) — c'est
l'une des deux allocations légales, l'autre étant Plein sur une seule des
trois.

---

## 7. Confirmations demandées

- **SHA du dernier commit** : voir le message rendu par `git log -1` après
  le commit qui suit cet inventaire.
- **Aucun `git push`, aucune fusion dans `main`.**
- **`ui/builder/` intact** — `git diff --stat main -- ui/builder/` vide.
- **`derive.mjs:1091-1096` (région d'attribution, lot hors périmètre)
  intacte** — ma seule zone touchée dans ce fichier est § COMPÉTENCES et la
  boucle des modules de statistique, à distance de cette région.
