# Inventaire du lot 23 — `23-pool-competences`

Branche `23-pool-competences`, worktree
`~/tools/fhpc-worktrees/23-pool-competences`, coupée de `main` à `512898d`.

**Ligne de départ vérifiée avant d'écrire : 517/517 verts.**
**Suite complète rejouée à l'arrivée : 530/530 verts, arbre propre.**
Aucune régression : les 517 d'origine sont tous encore verts, les 13 nouveaux
sont ceux de ce lot.

| Commit | |
|---|---|
| `ddd3afa` | Le pli tend le NIVEAU aux modules — la maîtrise ne le dit pas |
| `7ea4c8b` | Un pool de points est une statistique dérivée, et son détail dit pourquoi |
| *(celui-ci)* | Le contrat dit où vit le pool, ce qu'il vaut, et ce qui n'est pas tranché |

---

## 1. Ce que j'ai livré

### Le module — `src/modules/fh/skill-pool.mjs`

Drapeau `fh.skills`, ancre **`fh:skill-points`**. Même forme que
`destiny-stat.mjs` (lot 19), injecté de la même façon, publié dans
`resolved.stats[]` — **zéro contrat neuf sur la destination**, conformément à
l'arbitrage du 2026-08-09. ⛔ **Rien n'est écrit dans `build.budgets`**, et le
module n'a aucun moyen de le faire.

Quatre termes, chacun lu sur un record :

| Terme | Source | Lignes produites |
|---|---|---|
| Pool de classe | `data[fh_skill_pool].base` du record de **classe**, atteint par `refs` | 1 |
| Paliers traversés | `data[fh_skill_pool].by_level`, cumulé sur les niveaux **≤ niveau** | 1 **par palier** |
| Bumps d'espèce | `data.skill_points.by_level` du record d'espèce | 1 par palier |
| Imposés, **déduits** | `skill_choice.count` (classe), `skill_ids` + outil (arrière-plan), au coût `tier_costs.imposed` | 3 |

⛔ **Aucun de ces nombres n'est dans le code.** Prouvé en attaquant : la couche
change, le total suit (voir §4, attaque E).

### Les cinq tests d'acceptation — `tests/fh-skill-pool.test.mjs`

Les cinq demandés, plus huit attaques. 13 tests, tous verts.

### Le contrat — `contracts/build.md`

Trois endroits, **ratification demandée avant merge** :
1. §« Ce qu'il reçoit » — la ligne `level` (voir §2, c'est le point qui compte).
2. §« Ce qui est dérivé » — la table des deux entrées de `stats[]`, la mesure
   du total, et la règle Q15-8.
3. La ligne `build.budgets` — la question 1 du lot 22 est **close**, et le
   champ n'a **plus aucun consommateur connu** : la loi §0.6 se pose sur lui.

---

## 2. ⛔ CE QUE J'AI DÛ AJOUTER AU PROTOCOLE — À RATIFIER

**Le protocole d'injection ne tend pas le NIVEAU au module, et sans lui le
test d'acceptation 2 est impossible.**

La commande dit « le protocole du module est au contrat — lis-le, **il est à
jour** ». Il l'est : le document décrit exactement ce que le code faisait. Il
est **insuffisant**, ce qui n'est pas la même chose.

### La mesure

| Fait | Comment il se vérifie |
|---|---|
| Le module reçoit `proficiency`, `species`, `choices`, `records`, `refs` | `src/build/derive.mjs`, appel de `contribute` |
| **`proficiency` ne dit pas le niveau** | niveaux 5, 6, 7 et 8 → maîtrise **3** dans les quatre cas |
| Un barde niveau 5 et un barde niveau 8 n'ont **pas** le même pool | 22 contre 27 (`by_level`, couche des compétences) |
| Le niveau n'est atteignable par aucun autre canal | `refs` ne porte que des entrées **avec un `ref`** ; le choix `level` porte une `value`. `records` lit la pile, pas le document |

Sans `level`, la seule issue du module est d'écrire une table de niveaux **en
dur** — exactement ce que `stats[]` existe pour éviter, et la faute pour
laquelle le lot 20 s'est fait prendre.

### Ce que j'ai fait, et pourquoi je n'ai pas STOPPÉ

J'ai ouvert le canal : `level` passe dans `contribute`, une ligne, strictement
additive. **Précédent exact** : le lot 20 a dû ouvrir `feats` pour la même
raison (un besoin réel qu'aucune forme existante ne servait), l'a signalé, et
l'architecte l'a généralisé en `refs` le lendemain. Ce n'est pas une décision
**de règle de jeu** — c'est de la plomberie à une seule issue sensée, sur un
nombre que le pli a déjà lu. Bloquer tout le lot dessus aurait été une
sur-lecture de §0.10.

⚠️ **Si l'architecte préfère une autre forme, le module change de deux lignes.**
Mais il faut *une* forme : le lot 2 du barde ne se livre pas sans.

---

## 3. ⚠️ TROIS AFFIRMATIONS DE LA COMMANDE QUE J'AI TROUVÉES FAUSSES OU INCOMPLÈTES

### 3.1 — « Un Rogue niveau 1 publie un pool de **18** »

**Pas le total.** La commande dit dans la même page que les imposés se
**déduisent** du pool. Un roublard qui publie 18 n'en a donc déduit aucun. Les
deux affirmations ne peuvent pas être vraies du même nombre.

18, 16, 14 et 12 sont les **pools de classe** — le premier terme du détail.
Le total publié est **ce qui reste à répartir**.

**La mesure qui tranche est d'Eric et elle est indépendante de mon code** :
sa réforme fait passer un personnage « d'environ 2 points libres à **7–10** »
(vault, *FHV2 — Couche FH*, § « Plus de compétences, plus de points »).

| | Pool | Imposés | **Total publié** |
|---|---|---|---|
| Magicien 1 | 12 | 2 + 2 + 1 | **7** |
| Druide 1 | 14 | 2 + 2 + 1 | **9** |
| Roublard 1 | 18 | 4 + 2 + 1 | **11** |

C'est le **total** qui atterrit dans sa fourchette, pas le pool brut. Le test
d'acceptation 1 asserte donc **les deux** : le terme `Class Pool · Rogue` = 18,
nommément, **et** le total, détail complet comparé comme un objet.

### 3.2 — « `contracts/build.md` §… Lis-le, il est à jour »

Vrai du document, insuffisant pour le lot. Voir §2.

### 3.3 — Ce que la commande ne dit pas : les imposés d'ESPÈCE

La commande écrit « Choix imposés — **1 point chacun**, déduits du pool », sans
dire **lesquels**. La mesure du canon dit deux choses convergentes :

- règle d'Eric, 2026-08-08 : « un choix imposé par **la classe ou
  l'arrière-plan** » ;
- décision A : « les **bases du SRD** fixent les compétences et outils imposés
  (Guerrier 2 au choix, Rogue 4…) ».

**L'espèce n'est nommée nulle part.** Or l'Araag (`Skillful`, une compétence au
choix) et l'Elestu (`Keen Senses`) portent un `granted_skill_choice`.

Je ne l'ai **pas** déduit — ce serait inventer une règle — et je ne l'ai **pas**
tu — ce serait le repli silencieux de §0.5. **Il se DÉCLARE**, en nommant la
question. Voir §5, question 1.

---

## 4. Les gardes attaqués — ceux qui ont tenu comptent autant

Sept violations délibérées posées dans les **vrais fichiers** de l'arbre, sept
rouges, arbre restauré et vérifié par `git status`. Un garde vert qui n'a jamais
échoué exprès ne prouve rien.

| # | Attaque | Rouge sur | Verdict |
|---|---|---|---|
| A | `tierLevel <= level` devient `=== level` (seul le dernier palier compte) | ACCEPTATION 2 **et** 3 | ✅ la règle Q15-8 est tenue des deux côtés, classe **et** espèce |
| B | le module publie quand même quand le pool de classe manque (les bumps d'espèce suffisent à faire un détail) | ACCEPTATION 5 | ✅ aucun nombre fabriqué |
| C | la classe amputée se **déclare** au lieu de jeter | ATTAQUE amputation | ✅ les deux manques ne se confondent pas |
| D | les imposés d'espèce sont déduits d'office | ACCEPTATION 3 | ✅ la règle inventée est vue |
| E | **le pool devient une table EN DUR dans le module** (`Rogue: 18, Bard: 16…`, toutes justes) | ATTAQUE « ni le pool ni le coût ne sont écrits » | ✅ — **et voir l'encadré ci-dessous** |
| F | `src/build/derive.mjs` cite `fh_skill_pool` en commentaire | ACCEPTATION 4 | ✅ loi §0.12 tenue sur le **vocabulaire**, pas seulement sur les imports |
| G | l'absence de niveau retombe sur 1 au lieu de refuser | ATTAQUE niveau | ✅ pas de repli silencieux |

### ⚠️ L'attaque E est la leçon du lot, et elle confirme l'avertissement de la commande

Avec une table `{Rogue: 18, Bard: 16, Druid: 14, Monk: 14, Ranger: 14}` écrite
en dur dans le module, **les cinq tests d'acceptation restent VERTS**. Tous les
nombres sont justes ; ils sont obtenus de la mauvaise façon, et le pool
cesserait de suivre la couche le jour où Eric le rééquilibre.

Seule l'attaque dédiée — changer le pool **dans la couche** et exiger que le
total suive — le voit. C'est exactement le défaut que la commande annonçait
(« un garde qui asserte un compte… 18 obtenu de la mauvaise façon »), et il
survivait à mes cinq acceptations. Le garde a été **ajouté après** cette mesure,
pas avant.

### Les gardes qui ont mordu pendant l'écriture

Aucun. Les 517 tests d'origine sont restés verts d'un bout à l'autre, y compris
après l'ajout de `level` — aucune suite n'épingle la liste exacte des entrées de
`contribute`, ce que j'ai vérifié avant de la modifier (`grep -rn contribute
tests/`).

---

## 5. ⛔ CE QUE JE N'AI PAS TRANCHÉ

### Question 1 — les maîtrises imposées par l'ESPÈCE se déduisent-elles ? ⚠️ BLOQUANTE POUR LE BUILDER

Détail en §3.3. Les deux réponses sont défendables et **aucune n'est écrite** :

- **oui** → l'Araag et l'Elestu perdent 1 point ; cohérent avec « tout ce que le
  SRD impose coûte 1 » ;
- **non** → cohérent avec la lettre de la règle d'Eric, qui n'énumère que deux
  sources.

Aujourd'hui : **déclaré**, jamais compté. Le builder affichera donc un pool
d'Araag potentiellement trop généreux de 1 point. Un mot d'Eric suffit.

### Question 2 — `build.budgets` a-t-il encore une raison d'exister ?

Il est `required` au schéma, **personne ne l'écrit ni ne le lit**, et son unique
« consommateur concret » annoncé — le pool — vient de partir ailleurs. Le
contrat lui gardait un sens étroit (« le MJ accorde 3 points »). Aucun
consommateur de cette nature n'existe. **La loi §0.6 se pose sur lui**, et ce
n'est pas à un lot de retirer un champ `required` d'un schéma public.

### Question 3 — les outils imposés par la CLASSE

`tool_proficiencies` est une **phrase** (« Thieves' Tools », « Choose 3 Musical
Instruments », `null` pour le magicien) : aucun équivalent de `skill_choice`.
La règle d'Eric dit qu'ils coûteraient 1 point chacun. **Déclaré.** Boucher le
trou demande un champ mécanique dans la couche — du contenu, pas du moteur, et
ce n'était pas mon lot.

### Question 4 — le multiclassage

**Hors de portée, et pas par choix** : le pli lui-même ne dérive qu'**une**
classe (`takeRef("class")`). ⚠️ Et quand il portera le multiclassage, le
`by_level` de la couche ne suffira plus : elle a **fusionné** le +1 du barde
avec le +2 universel, or le canon veut que le +1 suive les niveaux de barde et
le +2 le niveau de personnage. Les deux devront être **dé-fusionnés dans la
couche** — c'est un lot de contenu, pas de moteur.

### Question 5 — la dépense

Ce lot publie ce dont le joueur **dispose**. `tier_costs.half/proficient/
expertise` et `expertise_from_level` sont dans le record, **lus par personne**.
Un choix posé dans le namespace `fh.skills.*` est aujourd'hui un **refus
nommé** : il n'y a pas de canal de dépense, et j'en ai ouvert aucun (loi §0.6).

---

## 6. Ce que je n'ai PAS construit, délibérément

- ⛔ **Rien dans `build.budgets`.**
- ⛔ **Aucun nom de compétence** nulle part dans `src/` — le garde de
  vocabulaire du test 4 le vérifie sur les huit fichiers de `src/build/`.
- ⛔ **Aucune arithmétique de barde.** Le `+3` du niveau 4 est **calculé par la
  couche** ; le module le recopie, et un test l'asserte contre la couche relue.
- ⛔ **Aucune synergie**, aucun Tilt, aucun genre `language`.
- ⛔ **Pas de `git push`.** Trois commits locaux, la branche se fusionne
  localement.
