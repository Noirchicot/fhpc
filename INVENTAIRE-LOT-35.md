# Inventaire du lot 35 — `35-pool-complet`

Branche `35-pool-complet`, worktree `~/tools/fhpc-worktrees/35-pool-complet`,
coupée de `main` à `6ee1e9e` (remesuré avant d'écrire, conforme à la commande).

**Ligne de départ vérifiée avant d'écrire : 589/589 verts.**
**Suite complète rejouée à l'arrivée : 608/608 verts, arbre propre.**
+19 tests neufs, +9 tests réécrits (marqués `REWRITTEN` sur leur propre
ligne, loi §0.7), zéro régression silencieuse.

Quatre commits, dans l'ordre où les pièces se sont composées :

| SHA | Contenu |
|---|---|
| `927c842` | 4c + 4d — Rogue expertise niveau 1, arrière-plan éteint |
| `f474596` | 4a + 4b — le pool paie les 36 outils, au même barème |
| `cfd7e24` | 4e — le champ `category` sur les 26 compétences |
| `df204c0` | `contracts/build.md` mis à jour |

⛔ Aucun `git push`, aucune fusion dans `main` — la branche attend l'architecte.

---

## 1. L'ordre choisi, et pourquoi il n'est pas celui de la commande

La commande liste 4a/4b/4c/4d/4e. J'ai livré **4c → 4d → 4a/4b → 4e**, pour
une raison de dépendance de mesure, pas de goût : 4c et 4d sont des
correctifs de CONTENU purs (aucune ligne de `src/build/` ou
`src/modules/` n'y touche), donc les moins risqués et les plus vite
vérifiables isolément — les faire d'abord donne une ligne de base propre
avant d'attaquer 4a/4b, qui EUX changent l'arithmétique que 4c/4d avaient
déjà stabilisée. 4e est indépendant des quatre autres (aucune donnée
partagée) et portait son propre point de blocage (§4 ci-dessous) : je l'ai
fait en dernier pour ne pas retarder le reste derrière la validation d'Eric.

---

## 2. 4c — Le Rogue, une valeur par classe

**Ce qui a changé** : `EXPERTISE_FROM_LEVEL = 4` (constante unique) devient
`DEFAULT_EXPERTISE_FROM_LEVEL = 4`, et `CLASS_POOLS` (`fh-skills-source.mjs`)
porte désormais `expertiseFromLevel` **par entrée**, `1` sur le Rogue
seul (`{ target: "srd:class:en:rogue", base: 18, expertiseFromLevel: 1 }`),
les onze autres recevant le défaut via le `.map()` qui construit la table.
`gen-fh-skills-layer.mjs` lit `entry.expertiseFromLevel` au lieu de la
constante, et un garde neuf (`Number.isInteger(...) && > 0`) protège la
valeur comme celle de `base`.

**Zéro ligne de moteur touchée** — exactement ce que la commande demandait
(« si tu te retrouves à écrire « rogue » dans `src/`, tu es sur la mauvaise
route »). `skill-pool.mjs:289` lisait déjà `pool.expertise_from_level` par
classe depuis le lot 34 ; il n'a rien appris de neuf.

**Test neuf** : `le Rogue achète l'expertise dès le niveau 1 ; les onze
autres classes, dès le niveau 4` (`fh-skills.test.mjs`) — relit
`expertise_from_level` sur les 12 records générés, nommément.

---

## 3. 4d — L'arrière-plan éteint

**Ce qui a changé** : `gen-fh-skills-layer.mjs` gagne `buildBackgrounds()`,
troisième fonction de construction aux côtés de `buildSkills`/`buildTools`/
`buildClasses`, câblée dans `buildLayer()`. Elle applique un `patch` étroit
par arrière-plan — `remove: ["data[skill_ids]"]` sur les 4, plus
`"data[tool_id]"` sur les 3 qui le portaient (Acolyte, Criminal, Sage).

**La mesure qui a évité une erreur** : la commande dit « le Soldier n'en a
pas » à propos de `tool_id` — vérifié avant d'écrire une ligne
(`node -e` direct sur `srd-5.2.1-en.layer.json`) : le Soldier porte
`tool_choice: {from: ["srd:tool:en:gaming-set"]}`, pas `tool_id`. La source
déclare donc `BACKGROUNDS_EXTINGUISHED` avec `hasToolId: false` pour lui
seul, et le générateur vérifie la présence du champ AVANT de le retirer
(`assertTargetField`-like, local à ce fichier) — un retrait dans le vide
reste un échec bruyant, jamais un patch qui s'applique à moitié.

**⚠️ Arbitrage NON prévu par la commande, tranché sans remonter** : la
commande liste exactement `skill_ids` et `tool_id` comme les deux champs à
retirer — elle ne mentionne jamais `tool_choice`. Le Soldier GARDE donc son
`tool_choice` intact ; cette couche n'y touche pas. C'est une lecture
littérale de la commande, pas un oubli : `tool_choice` est un CHOIX (le
joueur désigne son outil), pas un octroi automatique comme `tool_id`, et la
commande ne l'a jamais nommé parmi les champs à éteindre. Mesuré, testé
(`les trois arrière-plans qui portaient tool_id... ; le Soldier n'en avait
pas`, qui vérifie explicitement que `tool_choice` survit). **Point ouvert
pour l'architecte** si une incohérence en découle plus tard (le Soldier
resterait le seul arrière-plan à encore imposer un choix d'outil) — je ne
l'ai pas tranché plus loin que ce que la commande demandait.

**Conséquence chiffrée, vérifiée** : le pool du magicien d'exemple passe de
**7 à 10** (`examples/personnage-fh-en-niveau1.fh-char.json`, régénéré).
`History` (imposée par Sage) retombe à `none` ; `Arcana` (imposée par la
CLASSE, `class.skills[0]`) reste à `half` — la preuve que seul le canal
« arrière-plan » s'est éteint, pas le canal « classe ».

### 3.1 — Les neuf tests réécrits, et pourquoi chacun

Neuf assertions de total dans `tests/fh-skill-pool.test.mjs` citaient des
totaux qui incluaient une déduction d'arrière-plan (2 compétences + 1 outil
= 3 points, à 1 point chacun). Chacune est réécrite avec `REWRITTEN
2026-08-12 (lot 35)` sur sa propre ligne de commentaire (loi §0.7 — jamais
en fin de ligne de code) :

| Test | Avant | Après | Motif |
|---|---|---|---|
| ACCEPTATION 1 (×3 cas) | Rogue 11 · Wizard 7 · Druid 9 | Rogue 14 · Wizard 10 · Druid 12 | plus de déduction Acolyte |
| ACCEPTATION 2 (Bard niveau 5) | 16 | 19 | idem, +1 au niveau 6 (17→20) |
| ACCEPTATION 3 (Araag/Human) | 11 / 9 | 14 / 12 | idem, écart inchangé (2) |
| ACCEPTATION 6 (Wizard+Skilled) | 15 / sans don 9 | 18 / sans don 12 | idem |
| ACCEPTATION 7 (Rogue+Skilled) | 19 | 22 | idem |
| ACCEPTATION 8 (16 dons muets) | 9 | 12 | idem |
| ATTAQUE pool/coûts changés | 3 | 9 | idem |
| ATTAQUE Skilled=9 | 18 | 21 | idem |

Chaque réécriture est vérifiée contre l'arithmétique publiée par
`skill-pool.mjs` lui-même (relue sur la pile, jamais recalculée à la main
sans la confronter) — la même discipline que le lot 34 avait déjà pour les
totaux qu'il posait.

**Quatre tests neufs** (`fh-skills.test.mjs`) : les 4 sans `skill_ids`, les
3 sans `tool_id` (+ Soldier vérifié intact), les 4 avec `ability_keys`/
`feat_id` intacts, et deux REJET (retrait dans le vide sur `tool_id` et sur
`skill_ids`, chacun visant un record différent des trois/quatre déclarés).
Plus deux REFUS de structure (un 5ᵉ arrière-plan, un arrière-plan oublié de
la table), symétriques de ceux déjà écrits pour les classes.

---

## 4. 4e — Le champ `category`, et le point que j'ai fait valider

La commande posait un ⛔ explicite : « à faire valider par Eric avant de
générer ». Je n'ai pas deviné — j'ai soumis le tableau proposé par
l'architecte (les 26 compétences réparties en 4 catégories) via une
question directe, **avant** d'écrire une ligne de générateur. Réponse
d'Eric : **validé tel quel**. Le classement livré est donc exactement celui
de la commande, sans retouche.

**La forme retenue** : `SKILL_CATEGORIES = ["knowledge", "social",
"exploration", "physical"]` (identifiants seuls, loi §0.13) ;
`SKILLS_ADDED` porte `category` nativement (9 entrées) ; `SKILLS_KEPT_CATEGORIES`
(17 entrées, nouveau) associe chaque compétence SRD conservée à sa
catégorie, appliquée par un `patch` étroit (`data.category` seul, rien
d'autre du record SRD touché).

**⚠️ Ce que ce lot change structurellement** : avant ce lot, les 17
compétences conservées n'apparaissaient dans AUCUNE couche (« une couche ne
porte que ses deltas »). Elles portent maintenant un `patch` — le premier
jamais posé sur une compétence SRD conservée par cette couche. Le
commentaire de tête de `buildSkills()` est mis à jour pour le dire.

**Deux gardes neufs** :
1. `assertCategory()` — une valeur hors des quatre déclarées fait jeter
   (même doctrine que `abilityName()`, juste au-dessus dans le fichier).
2. Le garde d'orphelin (`sansCategorie`, à la fin de `buildSkills()`) —
   toute compétence conservée sans patch de catégorie fait jeter, en la
   nommant.

**⚠️ Mesuré, pas supposé — le garde d'orphelin est structurellement
INATTEIGNABLE par mutation SRD en boîte noire**, et je le documente plutôt
que de le cacher : `SKILLS_KEPT_CATEGORIES` couvre EXACTEMENT les 17 ids
réels, donc renommer n'importe lequel d'entre eux fait échouer plus tôt, sur
le `srdRecord()` PAR ENTRÉE (record introuvable), jamais sur le garde
d'agrégat qui vient après. **Vérifié par le même montage que le test
préexistant `REFUS — une classe du SRD oubliée par la table des pools`**,
dont j'ai confirmé empiriquement (avant d'écrire mon propre test) qu'il
attrape LUI AUSSI le garde `srdRecord`, pas le garde `oubliées` final que
son nom suggère — une imprécision déjà présente dans le dépôt, pas
introduite ici. Le garde d'agrégat reste posé (défense en profondeur contre
un futur bug de la table source elle-même), mais aucun test de ce lot ne
peut prouver qu'IL SPÉCIFIQUEMENT mord, faute d'un point d'entrée en boîte
noire. Je le signale plutôt que de prétendre le contraire.

**`category` ne touche jamais `resolved`** — vérifié : régénérer l'exemple
ne change que 2 lignes (les hash de couche). C'est un champ de CATALOGUE,
lu directement par le futur builder (`layers.query({kind:"skill"})`),
symétrique de ce que `resolved.tools[]` NE porte PAS (les 36 outils du
catalogue, cf. §5).

**Quatre tests neufs** : les 26 portent une catégorie et c'est exactement
le classement validé (comparé nommément, pas un compte) ; les catégories
sont exactement les 4 déclarées ; une catégorie est un identifiant en
minuscules sans espace (loi §0.13) ; REFUS sur une compétence conservée
renommée (le garde `srdRecord` par entrée, voir ci-dessus).

---

## 5. 4a + 4b — Le pool paie les outils, au même canal

**Le canal de dépense (`skill-pool.mjs`)** : la boucle qui résout `target`
depuis `records("skill")` seul lit maintenant `records("skill")` **puis**
`records("tool")` dans une carte combinée par slug. Garde de collision
AVANT toute résolution : si un slug apparaît dans les deux genres, `fail()`
le nomme (compétence ET outil cités). `source.kind` de la ligne de détail
devient dynamique (`entry.genre`, "skill" ou "tool") au lieu d'être
codé en dur à "skill" — c'était un bug latent que l'extension a forcé à
corriger : une ligne d'achat d'outil aurait sinon porté `source.kind:
"skill"`, un mensonge silencieux.

**`resolved.tools[]` (`derive.mjs`)** : la déclaration « aucune maîtrise
d'outil » est DIFFÉRÉE après le second passage des modules (elle citait
avant `tools.length` capturé trop tôt, ce qui aurait affirmé « aucun outil »
sur un personnage qui vient d'en acheter un). Le second passage cherche
chaque `skillTierOverride` non consommé par une compétence dans
`resolved.tools[]` (déjà possédé → corrigé en place) puis, à défaut, dans le
catalogue `tool` du contrat (nom/caractéristique lus, comme pour l'outil
d'arrière-plan) — jamais les 36, seulement le possédé ou le dépensé.

**⚠️ Point technique qui a coûté un aller-retour** : `tools` (le tableau
local) et `resolved.tools` doivent être la MÊME référence, pas deux tableaux
distincts réassignés — sinon pousser un outil acheté dans l'un ne le fait
pas apparaître dans l'autre. Résolu en ne réassignant jamais `resolved.tools`
une seconde fois : le second passage `push()` directement dans le tableau
que `resolved.tools` référence déjà.

**§0.12 respecté** : `derive.mjs` ne nomme toujours aucune mécanique FH — la
recherche « slug dans skills, puis dans tools » est une recherche générique
dans deux collections du contrat, `tool` étant un genre du schéma comme
`class` ou `background`, déjà lu par ce fichier pour l'outil
d'arrière-plan. Vérifié en le violant (§6).

**Sept tests neufs** (`tests/fh-skill-pool-tools.test.mjs`, nouveau
fichier, symétrique de `fh-skill-tiers.test.mjs` du lot 34) :

1. Achat d'un outil (Calligrapher's Supplies, proficient) — ligne nommée,
   pool débité de 2, `resolved.tools[]` porte l'entrée avec son bonus.
2. REJET — slug inconnu des deux genres → `skill-spend.option-unavailable`.
3. REJET — collision fabriquée (couche de scénario ajoutant un outil au
   slug `athletics`, déjà pris par une compétence) → `fail()` nommé.
4. `resolved.tools[]` garde UNE ligne (l'outil possédé du Soldier), jamais
   36.
5. Rogue niveau 1, expertise acceptée, coût 3 (monté depuis le plancher
   imposé ½, pas 4 plein tarif) ; les onze autres verrouillées
   (`skill-spend.tier-locked`, `unlockLevel: 4`).
6. Rogue SANS plafond de compte : deux expertises niveau 1 passent, le pool
   les débite (14 − 3 − 3 = 8), aucun verrou de NIVEAU.

**Piège évité en écrivant les tests** : `choixDe()` fixait `class.skills[0]
= "arcana"` pour tous les cas — invalide pour le Rogue (`skill_choice.from`
du Rogue ne contient ni Arcana ni History). Une dépense sur un slug non
réellement imposé part du plancher « none », pas « half » : le coût observé
(4, pas 3) l'a révélé avant que le test soit committé. `choixDe()` accepte
maintenant un paramètre `skills`, et les tests Rogue utilisent `stealth`/
`investigation`, vérifiés dans son `skill_choice.from` réel.

---

## 6. Les attaques manuelles — trois, chacune isolée

Trois gardes neufs, chacun attaqué séparément (source modifiée en mémoire,
`npm test` complet rejoué pour voir rougir EXACTEMENT le test visé et rien
d'autre, restauré depuis une copie `/tmp`, `diff` byte-à-byte confirmant la
restauration, suite complète rejouée verte) :

1. **Le garde de collision de slug** (`skill-pool.mjs`, la boucle qui
   `fail()` sur un slug outil déjà pris par une compétence) — désactivée →
   seul `REJET — un slug présent dans les deux genres...` rougit (+ le
   veilleur d'arbre, qui rougit systématiquement sur toute suite non verte).
   Restauré, `diff` vide, 604/604 verts.
2. **Le retrait dans le vide de l'arrière-plan** (`gen-fh-skills-layer.mjs`,
   la présence-check avant `remove: ["data[skill_ids]"/"data[tool_id]"]`) —
   désactivée → les DEUX tests REJET dédiés rougissent, et EUX SEULS.
   Restauré, `diff` vide, 604/604 verts (avant l'ajout de 4e).
3. **Le garde d'existence du patch de catégorie** (`SKILLS_KEPT_CATEGORIES`,
   le `srdRecord()` par entrée) — désactivée → seul `REFUS — une compétence
   conservée renommée...` rougit. Restauré, `diff` vide, 608/608 verts.

---

## 7. Ce que j'ai délibérément PAS touché

- `ui/builder/` — interdit par la commande, non touché.
- La table `SKILLS_KEPT_CATEGORIES`/le classement — validé par Eric tel que
  proposé, aucune retouche de ma part.
- Le `tool_choice` du Soldier — voir §3, arbitrage documenté, pas une
  omission.
- La couche vault `FHV2 - ADDENDUMS` — ses lignes « 🔴 NON implémenté »
  (pool/outils, arrière-plan, Rogue) sont maintenant fausses, mais éditer ce
  fichier n'est pas dans le périmètre de ce worktree (il vit hors du dépôt
  `fhpc`, dans le vault Obsidian) : à l'architecte de le refléter après
  fusion.

## 8. Décompte final

**589 → 608 verts, +19 nets.** Compté par fichier de test (`grep -c
'^test('`, avant `main` vs après) :

| Fichier | Avant | Après | Delta |
|---|---|---|---|
| `tests/fh-skills.test.mjs` | 35 | 47 | +12 (1 Rogue · 6 arrière-plan · 4 catégorie · 1 REJET catégorie) |
| `tests/fh-skill-pool.test.mjs` | 20 | 20 | 0 (9 réécrits, §3.1, aucun ajouté ni retiré) |
| `tests/fh-skill-pool-tools.test.mjs` | — | 7 | +7 (fichier neuf, §5) |
| **Total** | | | **+19** |

12 + 0 + 7 = 19, exactement l'écart 589→608. Arbre propre, `git status`
vide après le dernier commit.
