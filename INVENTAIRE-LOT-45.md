# Inventaire — Lot 45 (`45-ecrans-hasard`)

Worktree : `~/tools/fhpc-worktrees/45-ecrans-hasard`, branche `45-ecrans-hasard`,
coupée de `main` à `cf31ddb` (remesuré au départ, conforme à la commande).
Lot 42 déjà fusionné avant le départ (`carnet.mjs` présent) ; aucun conflit
avec le lot 43 (`layers/`, `src/build/`, `examples/`, `contracts/`) — ce lot
n'a touché que `ui/builder/` et `tests/`.

## Tests — départ et arrivée

- **Départ** : `npm ci` (déjà fait) puis `npm test` → **694 tests, 694 pass, 0 fail**.
- **Première livraison** : `npm test` → **723 tests, 723 pass, 0 fail** (694 + 29 neufs :
  11 dans `tests/dice.test.mjs`, 9 dans `tests/abilities-step.test.mjs`, 9 dans
  `tests/destiny-step.test.mjs`). Aucun test préexistant modifié.
- **Après correction d'architecte** (voir §« Correction post-revue » plus bas) :
  **724 tests, 724 pass, 0 fail** (+1, la preuve d'extensibilité). Les 9 tests
  originaux d'`abilities-step.test.mjs` n'ont pas bougé d'un octet (diff en
  pur ajout, vérifié).

## Comment le hasard est rendu testable

Toute la mécanique de tirage vit dans **`ui/builder/dice.mjs`**, un module
qui ne connaît **aucun DOM** et ne connaît **aucune règle de jeu** — quatre
fonctions pures :

- `rollThreeD6(rng)` / `rollTen(rng)` — un jet, dix jets, sur une source
  d'aléa **injectée** (jamais `Math.random()` appelé dans ce fichier).
- `markKept(rolls)` — les six meilleurs totaux, égalité tranchée par l'ordre
  du jet (déterministe sur un lot donné).
- `rollAbilitySet(rng)` — la méthode d'Eric complète (dix jets, relance du
  lot ENTIER si aucun n'atteint 15), qui compte ses relances (`rerollCount`)
  sans jamais garder le contenu des lots rejetés.
- `drawArcana(catalog, rng)` — tire un index dans le **catalogue reçu**
  (jamais un 22 câblé), même discipline d'injection.

`tests/dice.test.mjs` les attaque avec des sources d'aléa **scriptées**
(`scriptedRng`, une suite fixe de nombres qui boucle) : le test qui compte
(« ⚔️ ATTAQUE — un lot dont aucun des dix jets n'atteint 15 est REJETÉ EN
ENTIER ») scripte un premier lot où les dix totaux valent 6, suivi d'un
second où le premier jet vaut 18, et prouve que `rollAbilitySet` rend le
**second** lot avec `rerollCount: 1` — jamais le premier, jamais un jet
remplacé seul. Un test séparé rejoue `rollThreeD6(Math.random)` mille fois
pour les bornes physiques [3,18] (hasard réel, volontaire : ce test-là ne
prouve pas la règle de relance, seulement que les dés sont de vrais d6).

Les écrans (`abilities-step.mjs`, `destiny-step.mjs`) ne font QUE consommer
ces fonctions et afficher leur résultat — `tests/abilities-step.test.mjs`
et `tests/destiny-step.test.mjs` leur passent un `rollBatch`/`rng` fabriqué
à la main (jamais un vrai tirage) pour vérifier le rendu et le câblage vers
`onAction`, exactement le patron de `tests/skills-step.test.mjs`.

## Pourquoi le hasard dans l'écran n'est pas une entorse à « le moteur prononce, l'écran affiche »

Cette loi porte sur les **règles opposables** — ce que `validate()` peut
refuser. Rien de ce que `dice.mjs` produit n'est une règle : c'est un
**générateur de nombres/d'index**, dont la sortie n'atteint le document que
par les MÊMES verbes que Class/Species utilisent déjà (`set`/`choose`), qui
la traitent identiquement, qu'elle vienne d'un dé ou d'un clavier. Mesuré en
tête de commande (§0) : `abilities.mode` vaut `unconsumed` — le moteur ne
sait même pas QUE le joueur a tiré plutôt que choisi, et ne peut donc pas
« prononcer » sur une méthode qu'il ne voit pas. La preuve la plus directe :
le test 5 (« saisie directe pose EXACTEMENT le même chemin ») — un
`set({path:"abilities.dex", value:17})` posé à la main et un `set` posé
après un tirage sont, pour le moteur, un seul et même geste.

## La déclaration du plafond de 18

**Non implémenté dans ce lot, comme demandé** (§3c) — mesuré à nouveau ici :
`abilities.int = 20` passe toujours avec zéro refus. L'écran se contente
d'une **alerte cosmétique**, jamais un blocage :

- `renderCapWarning()` (`abilities-step.mjs`) compare `resolved.abilities[key]
  .score` (le score **final**, boosts compris, tel que le moteur le rend —
  jamais le score brut posé) à `18`, et affiche `> 18 at creation` en rouge
  quand il le dépasse.
- Testé (`"un score final > 18 affiche une alerte, et onAction PART quand
  même"`) : le clic qui reposerait une autre valeur au-dessus produit bien
  un appel — rien n'empêche le geste.
- Vérifié à l'écran (voir « ce qui a surpris ») : `abilities.int = 18` posé
  sur le personnage d'exemple (qui porte déjà `background.boost.int = 2`)
  affiche `+6 > 18 at creation` — l'alerte réagit au score COMPOSÉ, pas à
  la seule saisie du joueur, conformément à la décision du 2026-08-13
  (« un personnage créé au niveau 5 a des augmentations légitimes… »).

Cette décision (2026-08-13, postérieure à la commande écrite) est citée
littéralement en tête de `abilities-step.mjs`.

## Ce qui a surpris en regardant l'écran

Servi avec `python3 -m http.server` + le Chrome piloté (le port du
`.claude/launch.json` était déjà pris par une autre session ; serveur monté
à la main sur un port libre, même contenu).

1. **Un vrai risque de crash, trouvé en écrivant le test d'assignation
   avant même d'ouvrir le navigateur** : `rebuild()` JETTE si l'une des six
   caractéristiques manque (`"les six scores de caractéristique sont des
   CHOIX, et ceux-ci manquent…"`), et `applyDecisionAction` (`shell.mjs`)
   appelle `rebuild()` sans filet après chaque `clear`. `renderPicker`
   pose un tiret d'effacement par défaut dès qu'on lui passe `onClear` —
   je l'avais câblé par réflexe sur les six lignes, exactement comme les
   lignes de Compétences. **Retiré avant même le premier test DOM** : une
   valeur d'ability ne se REMPLACE (`set`, qui écrase la même clef) que
   jamais ne s'EFFACE depuis cet écran. Sondé une fois avec le vrai moteur
   pour confirmer le message d'erreur exact avant d'écrire le commentaire
   qui l'explique dans le code.
2. **Le personnage d'exemple porte déjà `abilities.mode: "standard"`** —
   une méthode que ce lot n'implémente pas (héritage d'un autre outil,
   `src/tools/exemple-fh-en.mjs`, écrit avant que « la liste » soit
   tranchée). Sans repli, l'écran se serait ouvert sur un mode qui ne
   correspond à aucun des deux blocs rendus. Vérifié à l'écran : la note
   « Method "standard" isn't built by this screen yet — showing Roll (3d6 ×
   10, keep 6) instead. » s'affiche bien, et c'est très exactement la
   clause « rien ne se cache » du chantier appliquée à un cas que je
   n'avais pas anticipé en écrivant la commande.
3. **Avant tout tirage, les six scores déjà posés (8, 14, 13, 15, 12, 10)
   disparaissaient de l'écran** au lieu de s'y afficher actifs — le pool
   d'options d'une ligne vient du lot tiré (`rollBatch`), et tant qu'aucun
   lot n'existe, ce pool est vide. Trouvé en construisant le premier test
   DOM (pas encore dans le navigateur) : `renderAssignRow` repêche
   maintenant la valeur déjà posée si elle n'est pas dans le pool courant.
4. **La distinction visuelle « retenu vs écarté » sur les dix dés était
   trop faible** à l'écran (`--tier-2` sur la bordure seule, sur un jeton de
   quelques pixels) — vue en écran réel, pas en DOM stub. Ajouté
   `opacity: .55` sur les dés écartés (`data-kept="false"`), même famille
   que `.ability-method-block[data-status="inactive"]` déjà dans le fichier.
5. **`fh.destiny.mode` fait JETER `rebuild()`**, contrairement à
   `abilities.mode` — sondé AVANT d'écrire `destiny-step.mjs` (voir « ce que
   j'ai changé »), pas une surprise visuelle mais une mesure qui a
   directement changé la forme du fichier.
6. Ce qui a marché du premier coup, sans surprise : le tirage de carte
   change le Destiny Score sous les yeux (10 → 8 sur « The Hermit » →
   « Judgement »), les 22 cartes s'affichent toutes en mode choix, et
   passer de tirage à choix n'a rien cassé dans un sens comme dans l'autre.

## Ce que j'ai changé de la commande

1. **Le mode de Destinée n'est PAS écrit au document** — la commande
   traitait `abilities.mode`/`fh.destiny` en miroir (« les deux modes, sur
   les deux écrans », ADDENDUMS §4). Mesuré avant d'écrire une ligne de
   `destiny-step.mjs` : `set({path:"fh.destiny.mode", value:"draw"})` suivi
   d'un `rebuild()` **jette** — `fh.destiny.*` est un namespace STRICT
   (`src/modules/fh/destiny-stat.mjs`), qui ne reconnaît que
   `arcana`/`glory[n]`/`awakening[n]`/`other[n]`, et refuse tout le reste.
   `abilities.*`, lui, est un préfixe générique (pas de module dédié qui le
   parse) : `abilities.mode` y traverse `rebuild()` sans encombre,
   simplement `unconsumed`. Le mode Destinée vit donc **hors document**
   (`shell.mjs`, `state.destinyMode`, exactement comme `state.planOpen`) —
   c'est un écart mesuré, pas un oubli, cité en tête de `destiny-step.mjs`
   et testé (`"basculer de mode appelle onModeChange, JAMAIS un verbe de
   document"`, qui rejoue la mesure du throw).
2. **Retiré le tiret d'effacement (`onClear`) sur les lignes Abilities**
   (roll ET manuel) — voir « ce qui a surpris » n°1. Ni la commande ni les
   dix tests qu'elle liste ne le demandaient explicitement ; l'omettre est
   la seule façon de ne jamais produire un document à cinq caractéristiques.
3. **La saisie manuelle réutilise `renderPicker`** (une plage 1..20
   cliquable) plutôt qu'un `<input type="number">`. Aucun écran du builder
   n'utilise d'élément de saisie de texte aujourd'hui (`dom-stub.mjs` ne
   porte d'ailleurs pas de valeur `.value` pour un `<input>` par
   construction — il aurait fallu l'étendre), et cette forme rend le test 5
   (« la saisie directe pose EXACTEMENT le même chemin ») trivial : les
   deux modes partagent le même geste de clic, la même fonction `onSelect`.
   Signalé, pas caché : la borne à 20 (au lieu de 18) est un choix de
   widget assumé, pour que l'alerte de plafond ait une chance de se
   déclencher sans qu'aucun bouton ne soit retiré (retirer les valeurs > 18
   SERAIT le blocage que §3c interdit).
4. Rien d'autre. Les dix tests listés par la commande (§4) sont tous
   couverts ; le mode est une liste (`ABILITY_METHODS`/`ARCANA_METHODS`,
   deux entrées chacune aujourd'hui) ; le plafond de 18 est déclaré, jamais
   implémenté.

## Correction post-revue (architecte, 2026-08-13)

**Le défaut, mesuré par l'architecte, lignes 302/310 de la première
livraison** : la boucle de `renderAbilitiesStep` lisait bien
`ABILITY_METHODS`, mais son CORPS branchait sur `method.id === "roll"` /
`"manual"` pour choisir QUOI rendre — le tableau ne pilotait que l'ÉTAT
actif/inactif, pas le RENDU. Ajouter une troisième méthode aurait donc coûté
une entrée de tableau **et** un `else if` de plus dans ce fichier, exactement
la « chirurgie » que la commande interdit (§3a-bis).

**Corrigé** : chaque entrée d'`ABILITY_METHODS` porte maintenant son propre
`render(ctx)` — `renderRollMethod`/`renderManualMethod`, tous deux déplacés
depuis le corps de la boucle sans changer une ligne de leur logique interne
(vérifié : les 9 tests DOM déjà écrits passent SANS ÊTRE TOUCHÉS). La boucle
ne compare plus `method.id` qu'à `mode.id` (une comparaison d'ÉTAT,
légitime — c'est elle qui dit si CE bloc est actif) et appelle
`method.render({document, resolved, rollBatch, assignedByKey, onAction})`
sans jamais regarder lequel c'est.

**Preuve ajoutée** (`tests/abilities-step.test.mjs`, un seul test neuf) :
une troisième entrée — fausse, avec son propre `render` — est poussée dans
`ABILITY_METHODS` **depuis le test seul** (le tableau exporté est une
référence partagée, le muter suffit ; aucun paramètre d'injection n'a été
ajouté à `renderAbilitiesStep`). Elle s'affiche, active, avec son propre
marqueur DOM, pendant que `roll`/`manual` restent rendus mais inactifs — le
tout **sans qu'une ligne d'`ui/builder/abilities-step.mjs` n'ait dû
changer** pour l'accueillir. Le tableau est restauré (`pop()`) dans un
`finally`, pour qu'aucun test voisin n'hérite de la fausse méthode.

**Tests, avant/après la correction** : 723 → 724 (le seul test neuf est
cette preuve). Les 9 tests d'`abilities-step.test.mjs` de la première
livraison sont un DIFF EN PUR AJOUT — vérifié à l'octet (`git diff`), rien
au-dessus de la ligne 197 n'a bougé.

## Correction post-fusion (branche `45b-abilities-affichage`, architecte, 2026-08-13)

Lot 45 fusionné dans `main` à `91cf64e` (724 tests). L'architecte a ensuite
**servi le builder et regardé l'écran Abilities** — la pratique que la
commande d'origine désignait déjà comme « la plus rentable du chantier » —
et y a mesuré un défaut d'affichage réel, pas un bug de calcul :

```
CON   13    +2   ⛔  (13 ne donne pas +2)
INT   15    +3   ⛔  (15 ne donne pas +3)
```

**La cause, mesurée par l'architecte** : la ligne affichait le CHOIX BRUT
(`currentAbilityValue`, ce que `set()` écrit — 13, 15) à côté du
MODIFICATEUR FINAL (`resolved.abilities[key].mod`, boosts d'Inheritance
compris — `background.boost.con = 1`, `background.boost.int = 2`) sans dire
que c'étaient deux registres différents. **Et le score final lui-même (14,
17) n'apparaissait nulle part** — le nombre qu'on lit pourtant à la table.

**La correction, sur une branche neuve** (`45b-abilities-affichage`, coupée
de `main` à `91cf64e` — l'ancien worktree avait été retiré à la fusion) :

- Le picker (le champ éditable) **reste inchangé** — toujours le choix
  brut, toujours ce que `onSelect` pose avec `set()`. Contrainte ferme n°1
  tenue : rien n'est inversé.
- Une **cellule « Final » à part, titrée**, toujours affichée (boostée ou
  non — l'absence de boost doit être aussi lisible que sa présence, jamais
  une case qui apparaît/disparaît) : `score (mod)`, LU dans
  `resolved.abilities[key]` — AUCUN calcul dans `renderFinalColumn`, pas
  même la comparaison `data-boosted` (elle compare deux valeurs déjà lues,
  n'en fabrique aucune). Contrainte ferme n°2 tenue : rien n'est recalculé.
- `data-boosted="true"` colore la cellule Final en accent quand
  `score !== choix brut` — un signal, pas un chiffre de plus.
- `renderAssignRow`/`renderManualRow` factorisés dans un `renderAbilityRow`
  commun (leur corps était déjà identique à un mot près — même loi de
  non-duplication que `carnet.mjs`) : la colonne Final n'a donc été écrite
  QU'UNE FOIS, pour les deux méthodes.

**Le test qui mord** (`tests/abilities-step.test.mjs`) : sur le personnage
d'exemple TEL QUEL (aucune fixture inventée — CON/INT y sont déjà boostés,
mesuré par l'architecte lui-même), vérifie que CON affiche `13` actif au
picker ET `14 (+2)` dans la cellule Final avec `data-boosted="true"`, idem
pour INT (`15` / `17 (+3)`), et que les quatre autres caracs (sans boost)
affichent `data-boosted="false"` avec le même nombre des deux côtés. Un
second test confirme que le mode manuel porte la même colonne (corps de
ligne partagé).

**Vérifié à l'écran** (builder servi à la main, port `.claude/launch.json`
à nouveau pris par une autre session — même geste que la première
livraison) : CON et INT s'affichent maintenant en accent avec leur « Final
14 (+2) »/« Final 17 (+3) » lisibles, les quatre autres caracs en neutre
avec leur final identique au brut — en mode Roll comme en mode Manual.

**Non traité, par choix explicite** : la note de l'architecte sur
`shell.css:89` (`.stage-nav button:disabled { opacity: .4; }`, le bouton
« Back » peu lisible à l'étape 0). C'est une convention DE LA COQUILLE
entière (lots 33/38), pas une régression de ce lot ni de cette correction —
la commande de l'architecte la nommait explicitement « pas un blocage ».
La retoucher changerait le contraste de TOUS les contrôles désactivés du
builder, une décision de jeton de conception qui dépasse le périmètre
« corrige l'écran Abilities » de cette branche. Laissée telle quelle,
signalée ici pour qu'elle ne se perde pas.

**Tests, avant/après cette correction** : 724 → **726** (+2 : l'attaque
CON/INT et le test de la colonne Final en mode manuel). Les 10 tests
préexistants d'`abilities-step.test.mjs` (les 9 d'origine + la preuve
d'extensibilité de la revue précédente) sont un DIFF EN PUR AJOUT — vérifié
(`git diff --stat` : « 73 insertions(+) », zéro suppression). La seule zone
touchée d'`abilities-step.mjs` est le rendu des lignes (`renderCapWarning` →
`renderFinalColumn`/`renderAbilityRow`) ; `renderRollMethod`/
`renderManualMethod`/la boucle de `renderAbilitiesStep` (déjà corrigée à la
revue précédente) n'ont pas bougé.

## Commits

Voir `git log --oneline` sur la branche — arbre propre après le dernier
commit, aucun `git push`, aucune fusion.
