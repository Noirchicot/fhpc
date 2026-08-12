# Inventaire du lot 36 — `36-trainings`

Branche `36-trainings`, worktree `~/tools/fhpc-worktrees/36-trainings`, coupée
de `main` à `56ea9d1` (remesuré avant d'écrire, conforme à la commande).

**Ligne de départ vérifiée avant d'écrire : 614/614 verts.**
**Suite complète rejouée à l'arrivée : 621/621 verts, arbre propre.**
+7 tests neufs, zéro test réécrit, zéro régression.

Trois commits, dans l'ordre où les pièces se sont composées :

| SHA | Contenu |
|---|---|
| `18fd452` | Le canal `fh.skills.train.<slug>` — module, labels, canal générique `traits`, schéma |
| `0a87604` | `tests/fh-skill-pool-training.test.mjs` — accept et rejet pour chaque clause |
| `7d31480` | `contracts/build.md` — LOT 36 documenté |

⛔ Aucun `git push`, aucune fusion dans `main` — la branche attend l'architecte.
`ui/builder/` non touché.

---

## 1. Les deux points ouverts — arbitrés avant que j'écrive une ligne

La commande posait §3a (le canal) et §3d (l'emplacement dans `resolved`)
comme explicitement ouverts, avec l'instruction de les faire valider plutôt
que les deviner. Je les ai posés à Eric par question directe **avant**
d'écrire du code de moteur — pas de version provisoire codée en attendant la
réponse.

**Réponse reçue, et c'est celle que j'ai codée telle quelle** :

| Point | Arbitrage |
|---|---|
| §3a — le canal | `fh.skills.train.<slug>`, valeur **booléenne** ou **absente**. Tout autre chemin du namespace reste un refus nommé, comme `spend.*` |
| §3d — l'emplacement | `resolved.traits[]`, avec un champ neuf `category` (facultatif, énumération fermée à une valeur `"training"`). **Pas de rubrique neuve** |

Le message d'Eric portait aussi une précision **postérieure à la rédaction de
la commande**, que j'ai donc traitée comme faisant partie de l'arbitrage
plutôt que comme une question de plus : les **maîtrises d'armes et
d'armures** sont aussi des trainings, mais **octroyées, jamais achetées** —
scope entier à un lot futur (§5 ci-dessous), et les **langues NE bougent
PAS** de `resolved.languages[]`.

---

## 2. Le canal (§3a) — dans `skill-pool.mjs`, pas un fichier neuf

**Pourquoi pas un module à part** : la commande parle d'une « troisième
dépense du **même** pool », pas d'un pool distinct — le training débite
`fh:skill-points`, exactement comme `spend.*`. Un module séparé aurait dû
recevoir le `pool` de classe, le `level`, et republier une seconde entrée de
`resolved.stats[]` pour un seul terme de plus ; l'étendre là où `spend.*`
vit déjà évite cette duplication et garde une seule ligne de `breakdown` par
personnage.

**La forme retenue** : le tail-parsing qui `fail()`ait sur tout chemin ne
commençant pas par `spend.` accepte maintenant aussi `train.` — deux listes
séparées (`spendEntries`, `trainEntries`), traitées par deux blocs
indépendants. Aucun garde de collision de catalogue n'est nécessaire (contrat
`build.md`, §36) : le genre `training` a son propre espace de slugs, jamais
mélangé à `skill`/`tool`.

**`value` : booléen des deux côtés, pas seulement `true`.** La commande dit
« valeur booléenne ou absente » — j'ai lu ça littéralement : `true` acquiert,
`false` ne fait **rien** (même effet que l'absence du choix, testé
explicitement), et **seul** un type non-booléen (une chaîne comme
`"proficient"`, un nombre) est un refus nommé
(`skill-train.value-invalid`). Une lecture plus stricte (rejeter `false`
aussi) aurait pu se défendre, mais elle aurait été une invention : rien dans
la commande ne dit que `false` est illégal, et « ou absente » place
explicitement `false` du côté légal du canal.

---

## 3. Le coût et le verrou de niveau (§3b, §3c) — deux fonctions, même forme que l'existant

**`trainingCost(view)`** — lit `data.cost` sur le record `training`, `fail()`
si absent ou non entier positif. Même discipline que `tierPointCost` : le
nombre vient du contenu, jamais d'une table de ce fichier.

**`trainingFromLevel(view)`** — lit `data.from_level`. **Absent**, le
plancher générique de la commande (4) s'applique
(`DEFAULT_TRAINING_FROM_LEVEL`) ; **présent**, c'est la dérogation. C'est le
point que la commande soulignait en ⭐ (« exactement la forme
d'`expertise_from_level` ») et je l'ai pris au pied de la lettre : la
dérogation ne demande **aucune branche de moteur**, elle demande qu'une
future couche de sous-classe (`Silent Blade`) pose un `patch` sur le record
`fh:training:en:garrote` avec `data.from_level: 3` — exactement comme le
Rogue reçoit son `expertise_from_level: 1` par un `patch` de classe (lot 35),
jamais par un `if (classId === "rogue")`.

**Testé sans que `Silent Blade` existe** (commande §3e le dit hors périmètre
de contenu, pas hors périmètre de mécanisme) : le test « DÉROGATION » fabrique
un training de scénario avec `from_level: 3` directement dans la couche de
test — la preuve porte sur la LECTURE du champ, pas sur le contenu réel.

---

## 4. `resolved.traits[]` (§3d) — le canal générique, symétrique de `skillTiers`

`skill-pool.mjs` rend maintenant `traits: acquiredTraits` en plus de `stat`,
`underived`, `consumed`, `skillTiers`, `violations`. `derive.mjs` le recopie
dans `resolved.traits[]` (déjà construit par les traits d'espèce, plus haut
dans le fichier — **on y ajoute, on ne le remplace pas**) sans jamais nommer
« training » : la validation ne porte que sur la forme générique (`id` et
`name` en chaînes), exactement le degré de rigueur que `skillTiers` applique
déjà à ses propres entrées. §0.12 respecté : aucun mot du vocabulaire
skill-pool n'entre dans `derive.mjs`.

**`category`, pas de `source` pour un training acheté.** J'ai délibérément
laissé `source` absent sur les entrées de training : les exemples que la
commande donne pour ce champ (« Elf », « Fighter ») décrivent tous deux un
**octroi** (ce qui a DONNÉ le trait), et un training acheté n'a rien
d'équivalent à nommer — le payeur, c'est le joueur, et ça se lit déjà dans
`build.choices[]`. Le jour où les maîtrises d'armes/armures octroyées
entreront dans la même collection (§5), leur `source` portera le nom de ce
qui les a données (la classe, probablement) — cohérent avec le reste du
contrat, sans qu'un training acheté n'ait besoin d'inventer un `source` vide
de sens.

---

## 5. Ce que ce lot pose et ne construit pas (§3e)

| | Statut |
|---|---|
| Langue supplémentaire, arme exotique, le Garrot | **mécanisme prêt** — n'importe quel record `training` avec `data.cost` s'achète dès aujourd'hui |
| Maîtrises d'armes/armures | **mécanisme prêt, contenu hors lot** — `resolved.traits[]` + `category: "training"` accueillerait un training OCTROYÉ exactement comme un acheté (aucun champ ne distingue les deux : la ligne de `breakdown` du pool est ce qui dit « payé », son absence dirait « octroyé ») ; le point d'octroi (probablement la classe, à la création) reste à écrire |
| Dark Rituals | **hors périmètre**, sous-classes non construites (M4) |
| Garrot gratuit niveau 3 (`Silent Blade`) | **hors périmètre**, mécanisme de dérogation déjà prêt (§3) — n'attend qu'un `patch` de couche |
| Langues dans `resolved.languages[]` | **non touché**, délibérément — la commande l'interdit nommément |

---

## 6. Les deux attaques manuelles

Deux gardes neufs, chacun attaqué séparément (source modifiée en mémoire,
`node --test tests/fh-skill-pool-training.test.mjs` rejoué pour voir rougir
EXACTEMENT le test visé et rien d'autre, restauré depuis une copie `/tmp`,
`diff` byte-à-byte confirmant la restauration, suite complète rejouée verte) :

1. **Le verrou de niveau** (`if (level < unlockLevel)` → `if (false && ...)`)
   — seul `REJET — le même achat au niveau 3 est skill-train.level-locked...`
   rougit. Restauré, `diff` vide, 621/621 verts.
2. **Le garde de type sur la valeur** (`if (typeof value !== "boolean")` →
   `if (false)`) — seul `REJET — une valeur de palier (« proficient »)...`
   rougit (l'achat s'applique alors en silence sur une valeur invalide,
   exactement le risque que le garde existe pour couper). Restauré, `diff`
   vide, suite complète rejouée verte.

Le schéma a été vérifié séparément (`category` hors énumération → rejeté,
`category: "training"` → accepté), par un script `ajv` ponctuel plutôt qu'un
test committé — la commande ne le demande pas explicitement et le test 7
(garde des 16 genres) était déjà couvert par le commit d'ouverture du genre.

---

## 7. Décompte final

**614 → 621 verts, +7 nets**, tous dans `tests/fh-skill-pool-training.test.mjs`
(fichier neuf, symétrique de `fh-skill-pool-tools.test.mjs` du lot 35).
Aucun autre fichier de test modifié — le canal `train.*` est additif, il ne
change l'arithmétique d'aucun personnage existant.
