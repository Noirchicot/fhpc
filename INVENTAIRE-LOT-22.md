# Inventaire du lot 22 — `22-chapitre-4-competences`

Branche `22-chapitre-4-competences`, worktree
`~/tools/fhpc-worktrees/22-chapitre-4-competences`.
Suite complète rejouée : **517/517 verts**, arbre propre.

| Commit | |
|---|---|
| `430eb6a` | Le chapitre 4 entre comme CONTENU : 26 compétences, 36 outils |
| `c8d9419` | Les douze pools de classe entrent comme CONTENU, pas comme mécanique |
| *(celui-ci)* | Le contrat `build` dit le trou de `budgets`, et l'inventaire dit ce que je n'ai pas tranché |

---

## ⛔ CE QUE JE N'AI PAS LIVRÉ, ET POURQUOI — À LIRE EN PREMIER

**Les tests d'acceptation 2 et 3 (le pool) ne sont pas écrits, et la
dérivation du pool n'existe pas.** Ce n'est pas un débordement de temps :
c'est un **refus au titre de la loi §0.10**, sur un trou de contrat que la
commande annonçait comme inexistant.

La commande dit : *« Il n'y a donc AUCUN trou de contrat sur ta route. Si tu en
trouves un, c'est une vraie trouvaille : STOP, question à l'architecte. »*
J'en ai trouvé un, et il est net.

Le reste du lot — **tout le contenu du chapitre 4** — est livré et vert.

---

## Question 1 — `build.budgets` n'a aucun chemin d'écriture ⛔ BLOQUANTE

### La mesure, avant l'argument

| Fait | Comment il se vérifie |
|---|---|
| `budgets` est **`required`** | `schemas/fh-char.schema.json`, `$defs/build.required` = `["layers","choices","budgets","overrides"]` |
| **Personne ne l'écrit** | `grep -rn "budgets" src/` → **aucune occurrence**. Pas une lecture, pas une écriture |
| **Aucun verbe ne le vise** | `choose` et `set` écrivent `choices` ; `override` écrit `overrides` ; `rebuild` écrit `resolved` ; `validate` n'écrit rien |
| **Une reconstruction ne peut pas l'écrire** | invariant 4 du contrat `build` (« une reconstruction ne modifie JAMAIS `build` », une seule exception nommée : `build.layers` vide) et invariant 2 du schéma (« `build` n'est jamais écrasé par une reconstruction ») |
| **Un module n'a pas de canal vers lui** | `contracts/build.md` §« Ce qu'il rend » : un module rend `{stat, underived, consumed}`. Rien d'autre n'est recopié |
| Le seul document d'exemple le porte **vide** | `examples/personnage-srd-fr-niveau1.fh-char.json` → `"budgets": {}` |

Deux tests figent cette mesure dans `tests/fh-skills.test.mjs` (§« la mesure de
la question 1 »), pour que l'arbitrage trouve un fait plutôt qu'un récit.

### Pourquoi je ne peux pas le contourner « en attendant »

Le test d'acceptation 2 demande qu'un Rogue niveau 1 **reçoive**
`build.budgets[…] = 18`. Or 18 se calcule de la classe et du niveau — c'est une
**dérivation**. Et une dérivation qui atterrit dans `build` contredit
frontalement les deux invariants ci-dessus.

**Et le conflit n'est pas théorique : le barde le rend visible.** Son pool
change à **chaque niveau** (+1 dès le 2). Un `build.budgets` figé à la création
serait donc faux dès le niveau 2, à moins que quelque chose le réécrive — ce
que l'invariant 4 interdit précisément.

Le `$comment` du champ dit lui-même : *« un budget est une ressource de
CONSTRUCTION, pas une case de la fiche jouable […] c'est une donnée
d'entrée. »* Un nombre qui se recalcule à chaque niveau n'est pas une donnée
d'entrée.

### Les deux options, chiffrées

**Option A — le pool est une STATISTIQUE, pas un budget.**
Le module publie dans `resolved.stats[]`, exactement comme le Score de Destinée
(lot 19). Chemin **déjà ratifié, déjà testé, zéro changement de contrat**. Le
`breakdown` porterait les termes : pool de classe, paliers traversés, bumps
d'espèce, imposés déduits — ce qui donne au MJ le *pourquoi* du nombre.
`build.budgets` resterait alors ce qu'il devrait être : un budget **octroyé à
la main** (« le MJ accorde 3 points »), une vraie donnée d'entrée.
⚠️ Coût : contredit le `$comment` de `budgets`, qui désigne le pool FH comme
son « premier consommateur concret ».

**Option B — on ouvre le canal.**
Le retour d'un module gagne un `budgets`, la dérivation le recopie dans
`build.budgets`, et l'invariant 4 gagne une **deuxième** exception nommée.
⚠️ Coût : touche `contracts/build.md`, le `$comment` du schéma et l'invariant
2 du document. Et il faudra dire ce qui arrive à un budget **saisi à la main**
qu'une reconstruction écraserait — le problème que l'invariant 4 existe pour
empêcher.

**Ma recommandation : A.** Le pool se dérive intégralement de la classe, du
niveau et de l'espèce ; rien dedans n'est une saisie. Mais c'est une décision
d'architecture, pas de lot, et je ne l'ai pas prise.

---

## Question 2 — la clef `fh.skillPoints` ne passe pas sa propre grammaire

Mesure : `$defs/budgets.propertyNames` → `$ref: "#/$defs/flag"`, dont le motif
est `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$`. **Aucune majuscule admise.**

```
fh.skillPoints  → REJET
fh.skillpoints  → OK
fh.destiny      → OK
```

Le `$comment` de `budgets` donne pourtant `fh.skillPoints` en exemple, et la
commande du lot 22 l'écrit dans son test d'acceptation 2. Le validateur du
dépôt **implémente** `propertyNames` (`src/doc/schema.mjs:239`) : ce n'est pas
un mot-clef décoratif.

C'est le **même piège que le lot 19 a payé** sur `stats[].id`, qui refuse le
point et l'a fait basculer sur `fh:destiny`. La forme minuscule
`fh.skillpoints` est ma proposition, mais la clef n'existe nulle part encore —
la trancher coûte zéro tant que la question 1 n'est pas résolue.

---

## Question 3 — les langues ont une règle, mais pas de genre

Le chapitre 4 les cadre (« gratuites à la création, **1 point** ensuite »), et
la commande me demandait de déclarer si aucun genre `language` n'existe.
**Mesuré : il n'y en a pas**, et `contracts/build.md` le déclarait déjà. J'ai
seulement **complété la ligne existante** pour dire que la règle, elle, existe
— sans inventer le genre.

---

## Ce qui EST livré

### Le contenu — commit `430eb6a`

`layers/fh-skills-en.layer.json`, produit par
`src/tools/gen-fh-skills-layer.mjs` depuis `src/tools/fh-skills-source.mjs`.

| | Arithmétique | Vérifié sur la vraie pile |
|---|---|---|
| Compétences | 18 SRD − 1 + 9 = **26** | 2 For · 3 Dex · 8 Int · 7 Sag · 6 Cha |
| Outils | 25 SRD − 2 + 13 = **36** | 23 conservés (dont 3 re-caractérisés) |
| Classes | **12** pools | Rogue 18 · Bard 16 · D/M/R 14 · autres 12 |

**La couche ne porte que ses deltas.** Les 17 compétences et 23 outils
conservés n'ont aucune entrée : recopier un record SRD identique le figerait
contre une correction future de `fh-srd`.

Les trois re-caractérisations d'outil, mesurées une par une contre le canon :
Mason's `str→int`, Tinker's `dex→int`, Potter's `int→wis`. Les 20 autres
portaient déjà la bonne caractéristique.

Les sept outils qui éclatent un record SRD (4 jeux, 3 familles d'instruments)
**héritent** son `utilize`, lu à la génération. Les six véhicules et montures,
que le SRD ne porte pas du tout, n'en inventent aucun.

### Les pools — commit `c8d9419`

Posés sur les 12 records `class`, comme la Base de Destinée l'est sur les
espèces. La progression est **énumérée niveau par niveau** : « +2 tous les 4
niveaux » écrit dans le code serait une règle de jeu dans le moteur.

### Les tests d'acceptation 1 et 4

Le **4 est le plus important**, et il passe : couche débrayée, la pile rend ses
**18** compétences avec Perception, ses 25 outils génériques compris, aucune
classe ne porte de pool, et **aucune** compétence FH ne fuit. Testé aussi à
chaud par `disable`/`enable`, sans remonter les octets.

---

## Les trois divergences du canon — confirmées, non reproduites

Les trois affirmations de la commande sont **exactes**. Je les ai vérifiées
indépendamment avant de m'y fier.

| # | Vérification |
|---|---|
| 1 | `class` = **12 records**, aucun artificier. Le tableau du chapitre en donne 13 : périmé |
| 2 | La couche codée dit `araag`→`fast-learner` (1/3/6), `elestu`→`fast-learner`, `human`→`educated` (création seule). Le chapitre disait « Araags **and Humans** » et zéro à l'Elestu : faux sur les deux |
| 3 | Le trio est bien Survival · Delve · Vigilance, et c'est **`fh:skill:en:delve` / `:vigilance`** que l'Elestu désigne déjà |

⛔ **L'Artificier** : rien à retirer, comme la commande le disait — une couche
ne peut pas désactiver un record inexistant. Un test vérifie que le mot
n'apparaît **nulle part** dans l'artefact publié (loi §0.8, dépôt public), et
un autre qu'une 13ᵉ classe apparue au SRD ferait **jeter** le générateur.

---

## Les gardes attaqués — ceux qui ont tenu comptent autant

| Garde | Attaque | Verdict |
|---|---|---|
| « 26 compétences » | liste truquée à **26 entrées**, une seule remplacée | ✅ rouge — le compte seul serait passé |
| idem, plus vicieux | les **26 bons noms**, une seule caractéristique déplacée | ✅ rouge |
| grammaire des chemins de patch | `data.ability_key` | ✅ **A MORDU POUR DE VRAI** — voir plus bas |
| retrait d'un record absent | Perception renommée au SRD | ✅ jette en la nommant |
| héritage d'un parent absent | Gaming Set renommé | ✅ jette |
| `utilize` manquant au parent | privation délibérée | ✅ jette — le lot n'en invente pas |
| compte du SRD | une 19ᵉ compétence apparue | ✅ jette |
| patch sans objet | `mason` déjà `int` au SRD | ✅ jette |
| caractéristique hors catalogue | `luck` | ✅ jette |
| `ref` pris par une autre couche | `delve` renommé `spelunking` | ✅ jette, **en nommant l'Elestu** |
| recopie de prose SRD | `example_uses` d'Athletics collé dans Might | ✅ jette, contrôle sur le **résultat** |
| 13ᵉ classe | artificier injecté au SRD | ✅ jette |
| classe sans pool | `monk` renommé | ✅ jette en le nommant |
| `ruleValues` non déclarées | tentative de porter les coûts en règles | ✅ **le montage est REFUSÉ** — d'où les coûts dans le record |

### Le garde qui a mordu pendant l'écriture

`data.ability_key` : la grammaire des chemins de patch n'admet pas
l'underscore après un point. Le bloc `layers` a **refusé le montage** en
nommant le chemin. La forme correcte est `data[ability_key]`, et la couche des
espèces la donnait déjà. Un garde qui attrape l'auteur du lot avant la table
vaut son prix.

### Deux de mes tests étaient verts pour la mauvaise raison

Écrits d'abord avec un `delete`, les refus « SRD sans Perception » et « SRD
sans Gaming Set » **passaient sur le mauvais garde** : supprimer un record
change aussi le compte, si bien que c'est le contrôle des 18/25 qui mordait, et
le garde de nommage n'était jamais atteint. Corrigés en **renommant** —
le compte reste intact, la cible devient introuvable.

Ces deux tests n'ont jamais existé dans l'arbre : pas de marque `REWRITTEN`
(loi §0.7), qui vise les assertions qu'un lot rend fausses. Je le signale
parce que le mécanisme — *vert pour la mauvaise raison* — est exactement ce que
la loi cherche à empêcher.

---

## Ce que la commande disait et que j'ai trouvé différent

**Le worktree était déjà monté**, à `c47c612`, et `main` avait un commit
d'avance (`01a5166`, « deux Tilts sur le DC valent +2 »). Fusionné en
*fast-forward* avant de commencer.

Pour le reste, la commande était juste sur tout ce que j'ai pu vérifier — y
compris les trois divergences, les comptes du SRD, et l'existence du canal
`refs`. Le seul écart de fond est le trou de la question 1, sur un point où
elle affirmait qu'il n'y en avait aucun.

---

## Ce que je n'ai PAS construit, comme demandé

- ⛔ **Aucune synergie.** Aucune table, pas même « pour plus tard ».
- ⛔ **Le Tilt** appartient au lot 21 : pas touché.
- ⛔ **Aucun genre `language`** inventé.
- ⛔ **Aucun nom de compétence dans `src/build/`.** Les 26 noms vivent dans
  `src/tools/` (générateur hors ligne) et dans la couche. Le garde de
  frontière du bloc reste vert.

## Ce qui reste au prochain lot

1. **L'arbitrage de la question 1**, puis la dérivation : pool de classe +
   paliers **traversés** (règle Q15-8) + bumps d'espèce (`skill_points.by_level`,
   déjà dans la couche des espèces) − imposés à 1 point.
2. **Le multiclassage**, que la commande ne mentionne pas et que le canon
   tranche (règle 10) : le pool vient de la **classe de départ**, les paliers
   +2 s'accumulent **par classe** selon les niveaux réellement atteints, le +1
   du barde suit ses niveaux de barde, le +2 d'espèce suit le niveau de
   personnage. ⚠️ Ce n'est **pas** équivalent à un calcul sur le niveau total :
   un Warlock 5 / Monk 3 vaut 14 par classe, 16 par niveau de personnage.
3. **La Perception passive** (`senses[perception-passive]`), que le retrait du
   record de compétence ne retire pas — le logbook la signale déjà comme
   « conséquence technique à traiter par l'architecte ».
4. **La couche FR**, si Eric la veut : ce lot ne livre que `en`.
