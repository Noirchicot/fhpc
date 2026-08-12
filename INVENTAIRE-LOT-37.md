# Inventaire du lot 37 — `37-pool-garde`

Branche `37-pool-garde`, worktree `~/tools/fhpc-worktrees/37-pool-garde`,
coupée de `main` après la fusion du lot 36 (`f242f74`, remesuré avant
d'écrire, conforme à la commande).

**Ligne de départ vérifiée avant d'écrire : 621/621 verts.**
**Suite complète rejouée à l'arrivée : 629/629 verts, arbre propre.**
+8 tests neufs (`fh-skill-pool-guards.test.mjs`), une fixture existante
ajustée (`fh-skill-pool-training.test.mjs`, voir §4), zéro régression.

Quatre commits, dans l'ordre où les pièces se sont composées :

| SHA | Contenu |
|---|---|
| `5466766` | §3a/§3b — `skill-pool.overspent`, `skill-pool.no-tool`, dans le module + labels FR |
| `eb979ca` | §3c — `validate()` projette enfin `decisions.mjs` |
| `712d543` | `tests/fh-skill-pool-guards.test.mjs` + ajustement de la fixture training |
| `dfef6e6` | `contracts/build.md` — section LOT 37 |

⛔ Aucun `git push`, aucune fusion dans `main` — la branche attend
l'architecte. `ui/builder/` non touché.

---

## 1. Le virage en cours de route — §3c a changé de forme

Ma première passe construisait un canal `capturedSpends` (`derive.mjs` →
`skill-pool.mjs`) pour que le module chiffre lui-même le budget captif
d'espèce, symétrique de `imposedSkillSlugs`. **L'architecte a mesuré que
c'était la mauvaise pièce** : `skill-budget.overspent` existe déjà dans
`decisions.mjs` (`speciesBudgetPlan`, lot 34) et pose déjà son verrou —
mesuré sur `entry.lock`, `decisions.mjs:251`. Le trou n'était pas
l'absence d'un contrôle, c'était que **`validate()` n'appelait jamais
`projectDecisions()`** (`rebuild` le fait, `block.mjs:326` ; `validate` ne
le faisait pas, malgré l'import déjà présent ligne 49).

J'ai retiré `capturedSpends` en entier — le paramètre du module, sa
fonction `speciesBudgetOverspendViolation`, le JSDoc, et les 14 lignes de
`derive.mjs` qui le construisaient (le passage n'a laissé aucune trace :
`git diff` sur `derive.mjs` est vide entre `main` et cette branche). Le
correctif réel tient en une boucle de quatre lignes dans `block.mjs`,
verbe `validate` :

```js
for (const entry of projectDecisions({ query, choices: document.build.choices })) {
  if (entry && entry.lock) reported.add(entry.lock);
}
```

**La distinction que la commande demandait de vérifier (§2b) est réglée par
la FORME, pas par du code de tri.** `finish()` (`decisions.mjs:34-43`) ne
pose `.lock` que sur un plan ou une étape **en faute** — une option hors
catalogue, un palier illisible, un budget dépassé. Un plan simplement
**incomplet** (`answered < expected`, aucune valeur illégale posée) reçoit
`status: "pending"`, jamais `.lock`. La boucle ci-dessus ne remonte donc
que les fautes réelles ; un personnage encore en cours de répartition (le
cas courant à la table, à tout instant de la construction) reste
`validate().ok === true` comme avant ce lot. Vérifié par construction
(lecture de `finish()`) et par l'absence de régression sur les 621 tests
existants qui appellent `validate()` sur des documents en cours de
répartition.

⭐ **Ce correctif ferme plus que le budget captif.** `skill-budget.option-unavailable`
et `skill-budget.tier-invalid` — même carnet, même `.lock` — étaient tout
aussi invisibles à `validate()` avant ce lot ; ils le sont désormais aussi
peu que `skill-budget.overspent`, sans une ligne de plus. Et tout verrou
que `decisions.mjs` posera à l'avenir (une classe future avec son propre
plan multi-choix, par exemple) remontera de la même façon, automatiquement.

---

## 2. §3a — le pool négatif, dans `skill-pool.mjs`

**Comptage : `preSpendTotal` puis `spentTotal`, pas une relecture de
`lines`.** Juste avant les deux dépenses libres (`spend.*`, `train.*`),
`preSpendTotal = lines.reduce(...)` capture ce que les lignes FIXES du pool
(classe, paliers, espèce, don, imposés) laissent à répartir. Chaque dépense
appliquée (refusée ou non — voir 2a) incrémente `spentTotal` du même
montant que sa ligne. Le total final est donc *toujours*
`preSpendTotal − spentTotal`, sans avoir à re-sommer `lines` une seconde
fois : la garde vérifie `preSpendTotal − spentTotal < 0`.

**Aucun `path`, et c'est un choix, pas un oubli.** La commande le
tranchait déjà (§3a : « il n'y en a pas de bon ») ; je l'ai suivi tel quel.
`available`/`spent`/`over` donnent à un lecteur humain (ou une UI) de quoi
reconstruire le calcul sans qu'aucune ligne individuelle ne soit accusée.

**Testé que le refus ne défait rien** (comportement 2a, commande §4 test 3) :
`resolved.skills[].proficiency` porte bien le palier acheté même quand
`skill-pool.overspent` est présent — le refus se prononce à la sortie, il
ne réécrit pas la répartition.

---

## 3. §3b — au moins un outil, l'arbitrage à répéter pour Eric

**ARBITRAGE, révocable.** Les addendums écrivent « ≥ 1 point en outils **à
la création** ». Le moteur ne voit pas un instant, il voit un document :
j'ai retenu la lecture « propriété du personnage », vraie à **tout**
niveau — un personnage créé directement au niveau 5 sans outil est refusé
au même titre qu'un niveau 1. L'autre lecture (« seulement au niveau 1 »)
laisserait un personnage créé plus haut échapper à la règle ; rien dans la
commande ni dans les addendums n'appelle explicitement cette exception, et
la répéter ici comme demandé (commande §3b) : **si cet arbitrage doit être
renversé, c'est un mot d'Eric, pas une relecture de code — la garde ne
distingue actuellement aucun niveau.**

**Le catalogue `tool` est lu inconditionnellement**, avant le bloc
`if (spendEntries.length > 0)` : un personnage qui n'a RIEN dépensé est
justement le cas que cette garde doit attraper, et il ne passe jamais par
ce bloc.

---

## 4. La fixture qui a dû changer — nommée, pas ajustée en silence

`tests/fh-skill-pool-training.test.mjs`, test « \`false\` est une valeur
booléenne légale (commande §3a [lot 36]) — même effet que l'absence, aucun
refus » : ce document (Wizard niveau 4, Halfling, aucun outil) passait à
tort avant ce lot — c'est exactement le trou que §3b ferme. Je lui ai
ajouté un point en outils (`fh.skills.spend.calligrapher-s-supplies` à
`"half"`) pour qu'elle reste conforme à la garde neuve sans toucher à son
sujet réel (la légalité de `false` sur le canal training). Aucun autre
test existant n'a basculé — vérifié par la suite complète, verte du
premier coup après ce seul ajustement.

---

## 5. Les deux attaques manuelles

1. **§3a** (`if (preSpendTotal - spentTotal < 0)` → `if (false && ...)`)
   — suite complète rejouée : seuls rougissent les deux tests qui portent
   sur `skill-pool.overspent` (« REJET — un point de trop… » et « le refus
   ne bloque PAS la dépense… »), plus le garde d'immutabilité de l'arbre
   qui refuse de conclure sur une suite rouge (attendu). Restauré depuis
   une copie `/tmp`, `diff` byte-à-byte vide, 629/629 verts.
2. **§3c** (la boucle `projectDecisions` dans `block.mjs` → condition
   `if (false && entry && entry.lock)`) — seul rougit « REJET — un budget
   captif dépassé… », plus le même garde d'immutabilité. Restauré, `diff`
   byte-à-byte vide, 629/629 verts.

(§3b non attaqué séparément — sa forme est une ligne, `toolSlugs.has(slug)`
dans un `.some()`, et sa couverture accept/rejet directe suffit à la même
confiance ; les deux attaques ci-dessus couvrent le minimum de la
commande.)

---

## 6. Décompte final

**621 → 629 verts, +8 nets**, tous dans `tests/fh-skill-pool-guards.test.mjs`
(fichier neuf). Une fixture ajustée dans `tests/fh-skill-pool-training.test.mjs`
(§4), zéro autre fichier de test modifié. `derive.mjs` : **zéro diff** avec
`main` — la première tentative n'y a laissé aucune trace après le retrait de
`capturedSpends`.
