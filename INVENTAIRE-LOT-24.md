# Inventaire du lot 24 — `24-feat-skill-points`

Branche `24-feat-skill-points`, worktree
`~/tools/fhpc-worktrees/24-feat-skill-points`, coupée de `main` à `6afa930`.

**Ligne de départ vérifiée avant d'écrire : 530/530 verts.**
**Suite complète rejouée à l'arrivée : 537/537 verts, arbre propre.**
Aucune régression : les 530 d'origine sont tous encore verts, les 7 nouveaux
tests sont ceux de ce lot (+2 réécrits dans des suites voisines, voir §3).

---

## 1. Ce que j'ai livré

### Le canal — un origin feat peut porter des points (contrat §2.1)

`skill-pool.mjs` filtre désormais `refs` sur `kind === "feat"`, exactement
comme `destiny-stat.mjs` le fait déjà pour le Score de Destinée (lot 20) —
même canal, même raison : le don d'origine vit sous
`background.originFeat[n]`, hors du namespace de ce module.

**Nom du champ choisi : `skill_points` — le MÊME que celui de l'espèce, pas
un nouveau.** La forme distingue les genres : `{trait, by_level}` pour une
espèce, `{bonus}` pour un don. C'est exactement le précédent que
`destiny-stat.mjs` pose déjà sur `data.destiny` : `{base}` (espèce), `{bonus}`
(don), `{impact}` (Arcane) — un seul champ, trois formes selon le genre du
record qui le porte. Réutiliser `skill_points` plutôt qu'inventer
`fh_skill_points_bonus` ou un équivalent suit la convention du voisin que la
commande demandait de nommer, et évite un troisième nom pour un seul concept
(« combien de points de compétence ce record donne-t-il »).

Le libellé de la ligne est le `name` du don, recopié tel quel (loi §0.13) —
pas de clef dans `labels.mjs`, comme `destiny-stat.mjs` le fait déjà pour ses
dons et ses cartes.

### Le contenu — `Skilled` vaut +6, et lui seul (contrat §2.2)

`layers/fh-feats-en.layer.json` porte désormais un `patch` sur
`srd:feat:en:skilled` : `data[skill_points].bonus = 6`. Aucun autre don n'est
touché. La note du patch cite la mesure (3 proficiencies ×
`tier_costs.proficient` de 2 = 6, parité exacte avec le texte SRD « three
skills or tools of your choice »).

⚠️ Piège payé en écrivant le patch : la grammaire de `changes` n'admet PAS de
segment à underscore en notation pointée (`data.skill_points` est rejeté,
`chemin mal formé`) — il faut la notation crochet, `data[skill_points]`,
exactement comme `data[fh_skill_pool]` et `data[granted_skill_choice]`
ailleurs dans le dépôt. Je l'ai d'abord écrit en dot, la couche a refusé de
charger, et le message d'erreur nommait le chemin fautif — corrigé.

### Les deux lignes « net zero » (contrat §2.3)

`imposedLines()` ne déclare plus `stats[fh:skill-points].imposed.species`
(la question que le lot 23 posait). À la place, quand une espèce porte
`data.granted_skill_choice`, le module publie DEUX lignes :

```
Araag · 1 granted choice    +1
Araag · 1 imposed choice    −1
```

Net zéro sur le total — **et c'est un changement d'affichage, pas
d'arithmétique** : le nombre publié par le lot 23 était déjà juste, comme
prévenu. Un test verrouille explicitement que le total ne bouge pas
(ACCEPTATION 3, réécrite — voir §3).

⚠️ **Découverte en écrivant le test 3, pas prévue par la commande : l'Humain
porte LUI AUSSI un `granted_skill_choice` (`Skillful`), directement dans le
SRD 5.2.1, indépendamment de toute couche FH.** Le test « Araag vs Humain »
supposait l'inverse (« l'Humain n'a pas de `granted_skill_choice` »). Ce
n'était pas vrai avant le lot 24 non plus — c'était juste invisible, parce
que la ligne se déclarait sans publier de nombre. Le lot 24 la rend visible
pour les DEUX espèces, et j'ai corrigé le test en conséquence : les deux
portent leur paire net zéro, ce qui ne change rien à l'écart mesuré (il reste
exactement 2, le second palier de `Fast Learner`) — la preuve que le net zéro
tient sa promesse même quand les deux côtés du comparatif le déclenchent.

Le grant ne se convertit jamais en points libres (§2.3, `Keen Senses` reste
restreint à `{survival, delve, vigilance}`) : je n'ai touché à aucun mécanisme
de placement, seulement publié les deux lignes qui existaient déjà en germe
dans l'algorithme d'Eric.

---

## 2. Ce que je n'ai PAS fait

- Aucun autre don du SRD n'a reçu de valeur (loi §0.10 — « y'aura d'autres
  origin feats un jour » n'est pas aujourd'hui).
- Le champ `granted_skill_choice.from` (quelles compétences sont éligibles)
  n'est lu nulle part ici : ce module publie un TOTAL, pas un placement — la
  restriction reste entièrement l'affaire du builder, à venir.
- Je n'ai pas touché aux outils imposés par la classe
  (`imposed.class-tools`) ni à aucune des autres déclarations non résolues du
  contrat : elles sont hors du périmètre de ce lot.

---

## 3. Les tests

**7 tests neufs** dans `tests/fh-skill-pool.test.mjs` :

- ACCEPTATION 6/7 — Human Wizard/Rogue + `Skilled` publient 15/19, la ligne
  « Skilled » est nommée et vaut 6 ; sans le don, 9.
- ACCEPTATION 8 — les seize autres dons du SRD traversent muets (aucun terme,
  aucun jet), et la déclaration les nomme un par un.
- ACCEPTATION 9 — un don qui annonce une valeur illisible (`bonus: "six"`)
  JETTE, en nommant le don.
- ATTAQUE — le +6 vient du record : changé à 9 dans la couche, le total suit
  (12+2+9−5 = 18).
- ATTAQUE — un don sans nom (patché à `name: ""`) JETTE au lieu de perdre la
  ligne en silence.
- ATTAQUE — `granted_skill_choice.count` illisible (chaîne, zéro, négatif)
  JETTE en nommant le record d'espèce, pour les trois cas.

**2 tests réécrits** (comportement changé, pas cassé) :

- `fh-skill-pool.test.mjs` — ACCEPTATION 3 : les lignes net zéro remplacent
  l'ancienne assertion « déclaration `imposed.species` », et l'Humain porte
  lui aussi sa paire (découverte ci-dessus).
- `fh-arcana.test.mjs` — le test qui vérifiait que la couche des dons ne
  patchait AUCUN record : `Skilled` est maintenant l'exception nommée, le
  test distingue désormais « Skilled : patché » de « tous les autres : add ».

---

## 4. Les attaques, et ce qui a rougi

- **⛔ Le 6 doit venir du record** — attaque permanente (ci-dessus), vérifiée
  à chaque `npm test`.
- **Attaque le net zéro** — retiré à la main la ligne de placement dans
  `imposedLines()` (juste le second `lines.push`), lancé `npm test` : **6
  tests rougissent** (ACCEPTATION 3, 6, 7, 8, l'attaque « le 6 vient du
  record », et le garde `tree-immuable`). Restauré depuis une copie, `npm
  test` repasse 537/537, `git status` confirme l'arbre identique à avant
  l'attaque (diff nul contre la copie de sauvegarde).
- **Vocabulaire (§0.12/§0.13)** — aucun nom de compétence, d'outil ou de don
  ajouté dans `src/build/` : je n'ai touché à aucun fichier de ce dossier. Le
  garde existant de l'ACCEPTATION 4 (lot 23) continue de le vérifier sans
  modification.
- **Restauration de l'arbre après l'attaque, prouvée** — voir ci-dessus.

---

## 5. Ce que je n'ai pas tranché

- Le champ `stats[fh:skill-points].imposed.class-tools` reste déclaré, non
  résolu : aucun champ mécanique d'outil sur la classe (`tool_proficiencies`
  est une phrase). Hors périmètre de ce lot.
- Le contrat (`contracts/build.md` §438) portait une ligne devenue fausse par
  ce lot (« DÉCISION NON PRISE » sur `imposed.species`) : je l'ai mise à jour
  pour dire TRANCHÉE, avec un pointeur vers le net zéro — c'est un correctif
  de cohérence documentaire, pas une nouvelle décision.
