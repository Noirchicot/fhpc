# Inventaire — lot 39 `etape-competences`

> Écrit à la fin du lot, chiffres mesurés en relançant `npm test` et le
> navigateur — rien n'est recopié d'un commentaire.

---

## 1. Départ → arrivée

| | |
|---|---|
| Tests au départ (`npm test`, mesuré avant la première ligne) | **650 verts, 0 rouge** |
| Tests à l'arrivée | **662 verts, 0 rouge** (650 + 12 dans `tests/skills-step.test.mjs`) |
| Fichiers neufs | `ui/builder/skills-step.mjs` (réécrit intégralement) · `tests/skills-step.test.mjs` · `tests/dom-stub.mjs` · ce fichier |
| Fichiers modifiés | `ui/builder/shell.css` (le bloc « Étape Compétences », + 3 correctifs `min-width:0`) · `ui/builder/shell.mjs` (le `ctx` passé à `renderSkillsStep`, `validate()` après chaque `rebuild()`, le verbe composite `resetSkills`) · `tests/ui-jetons.test.mjs` (une cible d'attaque mise à jour, voir §6) |
| `src/` | **intouché** |
| `tokens.css` | **intouché** (zéro jeton neuf nécessaire) |

---

## 2. Où je lis chaque chose — une ligne par donnée affichée

| Donnée affichée | Source | Chemin exact |
|---|---|---|
| Les 26 lignes de compétence | `resolved.skills[]` | `{id,name,ability,bonus,proficiency}`, toujours 26 |
| La catégorie d'une compétence | `layers.query({kind:"skill"})` | `record.data.category`, jointe par `record.slug === skill.id` |
| Les 36 lignes d'outil (catalogue complet) | `layers.query({kind:"tool"})` | `record.slug`, `record.name`, `record.data.ability_key` |
| Le palier d'un outil **acquis** | `resolved.tools[]` | `.find(t => t.id === slug)`, `{bonus, proficiency}` |
| Le palier d'un outil **non acquis** | **absence** de `resolved.tools[]` | voir §3 |
| Le bonus d'un outil non acquis | `resolved.abilities[key].mod` | lu tel quel, jamais additionné |
| Les paliers achetables (½/●/★) | `class.data.fh_skill_pool.tier_costs` | `Object.keys(...)` sauf `imposed`, triés par coût croissant |
| Le seuil d'expertise (notif. Rogue) | `class.data.fh_skill_pool.expertise_from_level` | comparé à `resolved.identity.level` |
| Le coût de l'expertise affiché | `tier_costs.expertise` | jamais un `4` en dur |
| Le compteur — Left | `resolved.stats['fh:skill-points'].value` | **brut, jamais recalculé** (voir attaque test 12) |
| Le compteur — Pool (dépensé/total) | `breakdown[]` groupé par `source.kind` | dépensé = `-Σ(source.kind∈{skill,tool,training})` ; total = dépensé + Left |
| Le compteur — Class | `decisions[]`, `path:"class.skills"` | `.answered`/`.expected` |
| Le compteur — Species | `decisions[]`, `path:"species.skillBudget"` | `.answered`/`.expected` |
| Le compteur — Invested | somme des trois numérateurs ci-dessus | forme du worked example ratifié (§2b de la commande), pas inventée |
| Le budget captif (Keen Senses) — les 3 lignes | `decisions[]`, `path:"species.skillBudget"` | `.options` (les slugs), chaque `species.skillBudget.<slug>` pour l'état |
| Le cadenas + provenance (imposés de classe/espèce) | `decisions[]`, `path:"class.skills"` / `"species.skills"` | `.selected[]`, `provenance` |
| La notification du Rogue | `class.data.fh_skill_pool` + `resolved.identity.level` | générique — n'importe quelle classe dont le seuil est atteint |
| Les refus par ligne | `validate({document}).violations` | filtré par `.path === "fh.skills.spend.<slug>"` (ou `.train.`, `.skillBudget.`) |
| Les refus du pool (compteur) | `validate(...).violations` | `key ∈ {skill-pool.overspent, skill-pool.no-tool}`, **sans `.path`** |
| Les langues | `resolved.languages[]` | lecture seule, `[]` aujourd'hui — aucun sélecteur (arbitrage §2c) |
| Les apprentissages acquis | `resolved.traits[]` | `.filter(t => t.category === "training")` |
| Le catalogue des trainings | `layers.query({kind:"training"})` | `[]` aujourd'hui — sous-bloc grisé |

---

## 3. Le palier d'un outil non acquis — la question ouverte de la commande

**Trouvé, pas bloqué.** `resolved.tools[]` ne publie que les outils possédés
ou dépensés (`src/build/derive.mjs`, juste avant la fusion des outils achetés
au pool : *« resolved.tools[] NE PUBLIE QUE LES OUTILS POSSÉDÉS OU DÉPENSÉS,
jamais les 36 du catalogue »*). Un outil **absent** de cette collection n'a
donc, par construction, **aucun palier** — l'absence EST l'encodage de
« none », exactement comme `resolved.languages`/`resolved.traits` (catégorie
`training`) sont des ensembles ouverts qui ne listent que ce qui est acquis
(la commande le dit elle-même au §0). Ce n'est pas une supposition : c'est la
forme même de `resolved` qui le décrit, et la mesure (probe Node, ci-dessous)
le confirme.

Le bonus d'un outil non acquis (affiché quand même, décision : chaque ligne
porte sa caractéristique et son bonus) est le modificateur brut de
caractéristique — `resolved.abilities[ability_key].mod`, lu tel quel. Ce
n'est pas une addition faite par l'écran : c'est exactement ce que
`derive.mjs` fait pour un outil possédé à `proficiency: "none"` (le terme de
palier vaut 0), donc lire le modificateur seul EST la valeur juste — aucune
arithmétique n'est réalisée dans `skills-step.mjs`.

---

## 4. L'arbitrage §2c répété en toutes lettres

- **Languages** — `resolved.languages[]` est **toujours vide** aujourd'hui
  (aucun genre `language` parmi les 14, mesuré et confirmé dans
  `derive.mjs`). ⛔ **Aucun sélecteur construit** : un sélecteur sans
  catalogue serait du code mort (loi §0.6). Le sous-bloc affiche
  `resolved.languages[]` en lecture seule et dit « No languages recorded. »
  quand elle est vide.
- **Trainings** — `layers.query({kind:"training"})` rend **0 record**
  aujourd'hui. Le sous-bloc s'affiche **grisé** (`data-status="locked"`),
  **avec sa raison écrite**, jamais caché. Le mécanisme complet (liste
  réelle, bouton cliquable, verbe `fh.skills.train.<slug>`) est écrit et
  **testé avec un record synthétique** (`tests/skills-step.test.mjs`, dernier
  test) — le jour où un vrai training existe, cet écran n'a rien à rouvrir.
- **Le niveau « 4 » n'est écrit NULLE PART.** La commande demande d'afficher
  « le niveau que le refus donne », jamais le nombre en dur. **Mesuré** :
  avec 0 record de training, **aucun refus `skill-train.level-locked` ne
  peut jamais se produire** (le module qui l'émet a besoin d'un record réel
  pour lire `data.from_level`). Il n'existe donc **aucune source vivante**
  pour ce nombre aujourd'hui. J'ai écrit la raison sans le chiffre :
  *« Trainings buy in starting at a level set per training, unless a record
  says otherwise — the catalogue is empty for now. »* — c'est la phrase
  d'Eric du 2026-08-13, moins le nombre qu'elle ne peut pas justifier.
  **Question ouverte, posée ici plutôt qu'un arrêt du lot** (la commande
  anticipait explicitement ce cas de figure) : faut-il qu'Eric confirme que
  cette formulation générique convient tant qu'aucun training n'existe, ou
  préfère-t-il un texte différent ?

---

## 5. La mesure à 360 px

**Mesurée dans un vrai navigateur** (Chrome, via un `<iframe>` forcé à
360×740 CSS px, indépendant des à-coups de l'émulation de viewport de cet
environnement — voir §6, point 3).

### Ce qui débordait, et pourquoi

**Bug réel trouvé et corrigé** : `.decision-card` (enfant de grille de
`.app`), `.stage` (idem) et `.skills-row` (enfant flex de `.skills-rows`)
n'avaient pas de `min-width: 0`. C'est le piège classique de flex/grid — un
enfant a un `min-width` **initial** de `auto`, qui l'empêche de rétrécir
sous la largeur intrinsèque de son plus large descendant. Avant ce lot,
aucune étape n'avait de contenu assez large pour le révéler ; la grille de
compétences (26+36 lignes à plusieurs colonnes fixes) l'a fait apparaître au
premier essai : **la page entière refusait de descendre sous ~584px** et
débordait de 224px à 360px.

**Trois `min-width: 0` corrigent tout** (`.stage`, `.skills-grid` +
`.skills-group`, `.skills-row`) — zéro changement visible ailleurs
(`min-width: 0` ne fait rien tant que rien ne pousse à rétrécir, mesuré : les
662 tests, y compris les cinq attaques du garde du lot 38, restent verts).

### Ce qui tient, mesuré après correction

| | |
|---|---|
| Largeur totale de la page (`document.documentElement.scrollWidth`) | **exactement 360px** |
| Débordements restants | **2**, et les deux sont **voulus** : `.belt` (ceinture d'étapes, molette du lot 38) et `.skills-category-bar` (la barre de catégories, **même composant réemployé**) — tous deux `overflow-x:auto`, contenus dans leur propre boîte, ne poussent jamais la page |
| Les 26+36 lignes | s'affichent, chacune tient dans sa largeur |
| Le compteur (Pool/Class/Species/Invested/Left) | passe en 3 lignes par `flex-wrap`, lisible |

### Ce qui déborde encore, honnêtement

**Les noms longs coupent au milieu du mot** (« Survival » → « Surviva-l »,
« Alchemist's Supplies » → trois lignes). La colonne de nom n'a que
~65-90px de large à 360px une fois les colonnes fixes soustraites
(caractéristique 3ch + bonus 4ch + jusqu'à 4 boutons de palier ≈ 108px +
les `gap`). **Rien ne déborde de l'écran** (fonctionnellement correct,
`min-width:0` + `overflow-wrap:break-word` garantissent la coupe DANS la
boîte), mais la coupure est disgracieuse. Je ne l'ai pas retouchée
au-delà : la commande ratifie la grille à 3 colonnes et la rampe à 4
boutons, et retoucher leurs largeurs relatives serait rouvrir une décision
que je n'ai pas mandat de trancher. **Signalé pour Eric/l'architecte**, pas
corrigé en douce.

---

## 6. Ce que j'ai changé de la commande, et pourquoi

1. **`REFUSAL_WORDS` (anglais) au lieu de `src/labels.mjs` (français).**
   La commande (§3d) dit littéralement « le mot vient de `src/labels.mjs` ».
   Mesuré : ce fichier ne porte QUE `FR_BUILD`, un paquet français écrit pour
   l'architecte/le MCP — jamais consommé par un joueur avant ce lot. La table
   d'Eric joue en anglais (arbitrage du 2026-08-10, déjà tenu par
   `shell.mjs` pour ses intitulés d'étape). Importer `renderBuildViolation`
   afficherait du français sur un écran anglais ; écrire un paquet anglais
   dans `src/labels.mjs` toucherait `src/`, interdit à ce lot. J'ai donc
   écrit `REFUSAL_WORDS` dans `skills-step.mjs`, qui recompose les **mêmes
   clefs et les mêmes paramètres** que le moteur produit déjà, en anglais —
   exactement le rôle que la loi §0.13 donne à l'UI (« le moteur produit des
   identifiants, l'UI produit des mots »), pas une règle inventée.
2. **`.skill-group`/`.skill-slot`/`.skill-chip`/`.skill-lock`/`.skill-budget`
   (lot 33) retirées de `shell.css`**, pas gardées à côté. `skills-step.mjs`
   ne les consomme plus (il ne lit plus `decisions[]` pour peindre les QCM
   de classe/espèce — décision n°3 : ces QCM se posent à leurs propres
   étapes). Les garder aurait laissé du CSS mort derrière un sélecteur qui
   ne matche plus rien (loi §0.6). Conséquence mesurée : une cible
   d'attaque du garde du lot 38 (`tests/ui-jetons.test.mjs`, ATTAQUE 2)
   visait ce CSS par une chaîne littérale — mise à jour vers une règle du
   lot 39 qui porte le même jeton, testée (voir §7).
3. **Trois `min-width: 0` ajoutés à `shell.css`**, non prévus par la
   commande — voir §5. Mesuré, pas deviné : sans eux, la page déborde de
   224px à 360px.
4. **Le budget captif d'espèce (Keen Senses) rendu SUR cet écran**, pas
   seulement résumé au compteur. Relecture attentive de la commande : le §0
   liste « le budget captif d'espèce » parmi les « quatre portes de la
   grille » que CET écran manipule (à la différence des 2 imposés de classe
   et du QCM d'espèce simple, qui eux se posent à leurs étapes — décision
   n°3). C'est un mécanisme de DÉPENSE (tier libre sur budget fermé), pas un
   simple QCM — il a donc sa place ici, en groupe à part, avec ses propres
   verbes `species.skillBudget.<slug>`.
5. **Le vocabulaire du budget captif (`{half, proficient}`) écrit en dur**
   dans `skills-step.mjs` — signalé, pas caché. Contrairement à
   `tier_costs` (un NOMBRE de contenu, par classe, qu'Eric peut changer),
   cette paire est un fait STRUCTUREL du mécanisme lui-même
   (`BUDGET_TIER_COST` dans `src/build/derive.mjs`) : aucun record ne le
   porte, et un slug jamais cliqué n'a AUCUNE entrée vivante dans
   `decisions[]` où le lire avant le premier clic. Question ouverte pour
   l'architecte : faut-il que `decisions.mjs` publie ce vocabulaire sur le
   plan `species.skillBudget` lui-même (un champ `tiers` par exemple), pour
   qu'un jour ce petit reliquat disparaisse ?
6. **`REJET` (test 5/6) et le « plan incomplet » (test 10) construits sur
   des scénarios différents de ceux esquissés implicitement par la
   commande.** Mesuré en écrivant les tests : retirer UNE des deux
   compétences imposées de classe n'est PAS un « plan incomplet » aux yeux
   du moteur — `skill-grant.count-mismatch` le refuse déjà
   (`src/build/block.mjs`). Le test 10 utilise donc le budget captif
   sous-dépensé (`spent < points`, jamais verrouillé) comme exemple qui
   prouve vraiment la phrase de la commande.

---

## 7. Les deux attaques manuelles (routine du dépôt)

| # | Attaque | Ce qui rougit | Restauration |
|---|---|---|---|
| 1 | `Left` recalculé depuis `breakdown[]` au lieu du `value` brut (viole §3c) | **seul** le test 12 (⚔️ ATTAQUE — menteur) | `diff` : 0 octet d'écart |
| 2 | Le refus `skill-pool.overspent` (sans `.path`) fuit sur la première ligne de compétence | **seul** le test 5/6 (REJET — refus au compteur) | `diff` : 0 octet d'écart |

Les deux fois : 11/12 verts sur `tests/skills-step.test.mjs`, restauration
par copie de l'original, `diff` à 0 octet, checksum SHA1 identique avant/après
(`e0ea1902f5c9ab837e2e7e2c28ef3d08a1f153ad`), suite complète (662/662)
rejouée après chaque restauration.

`tests/ui-jetons.test.mjs` porte ses propres cinq attaques (lot 38),
rejouées telles quelles ce lot (une seule cible mise à jour, §6 point 2) —
toutes vertes.

---

## 8. Questions ouvertes pour l'architecte

1. **Le texte du sous-bloc Trainings** (§4) — la formulation générique sans
   le « 4 » convient-elle, ou Eric préfère-t-il un mot différent tant que le
   catalogue est vide ?
2. **Le vocabulaire `{half, proficient}` du budget captif** (§6 point 5) —
   faut-il le faire publier par `decisions.mjs` plutôt que de le garder en
   dur, symétrique et minime, côté écran ?
3. **La coupure des noms longs à 360px** (§5) — accepter la coupure au
   milieu du mot, ou retoucher la largeur relative des colonnes (question de
   forme, pas de mon mandat pour ce lot) ?
4. **La teinte de la rampe (28°, celle de l'accent)** reste ouverte depuis le
   lot 38 (INVENTAIRE-LOT-38.md §7b) — cet écran l'utilise telle quelle
   (`--tier-1/2/3`), sans en dépendre de composant : si Eric tranche pour une
   teinte différente, **seul `tokens.css` bouge**, aucune ligne de
   `skills-step.mjs`/`shell.css` n'a besoin de changer (les trois jetons
   sont consommés par leur NOM, jamais par leur valeur).
