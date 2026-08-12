# Inventaire — lot 38 `jetons-surfaces`

> Livrable qui survit au lot (commande §5). Écrit le 2026-08-13, à la fin du
> lot. Chiffres mesurés dans ce document, pas recopiés — chacun est
> reproductible en relançant `node --test tests/ui-jetons.test.mjs`.

---

## 1. Départ → arrivée

| | |
|---|---|
| Tests au départ (`npm test`, mesuré avant la première ligne) | **629 verts, 0 rouge** |
| Tests à l'arrivée | **650 verts, 0 rouge** (629 + 21 dans `tests/ui-jetons.test.mjs`) |
| Fichiers neufs | `ui/builder/tokens.css` · `tests/ui-jetons.test.mjs` · ce fichier |
| Fichiers modifiés | `ui/builder/shell.css` (plus un seul littéral) · `ui/builder/index.html` (charge `tokens.css`) · `ui/builder/shell.mjs` (seuil lu en drapeau, recentrage de la ceinture) · `ui/builder/engine.mjs` (une ligne : `modules:`) |
| `src/` | **intouché** |
| `src/tools/fiche.shell.html` | **intouché** |
| Étape Compétences | **non construite** — lot 39 |

---

## 2. L'inventaire des SURFACES (§3i)

### 2a. Les 17 surfaces existantes — ce qui les peint, aujourd'hui

| Surface | Peint par (jetons) | États |
|---|---|---|
| `body` | `--bg`, `--text`, `--font` | — |
| `.app` (2/3 colonnes) | *(largeurs 220px/320px hors jetons — voir §5)* | `data-plan="open"/"closed"` |
| `.belt` | `--border`, `--sp-20`/`--sp-8`, `--sp-2` ; molette : `--sp-12`, masque | plate à toutes largeurs (§3f) |
| `.belt-item` | `--sp-12`/`--sp-8`, `--radius-md`, `--text-muted`, `--t4` | `done` / `current` / `upcoming` |
| `.belt-index` | `--t2` (rond 22×22, hors échelle de rayon) | — |
| `.belt-label` | hérite de `.belt-item` (`--t4`) | **ne s'efface plus jamais** (défaut n°3 réparé) |
| `.stage` | `--sp-24`/`--sp-32`, `--sp-20` | — |
| `.toggle-bar` | — (mise en page seule) | — |
| `.decision-card` (+ `h1`) | `--surface`, `--border`, `--radius-md`, `--sp-32`, `--measure`, `--t6` | — |
| `.placeholder` (+ `code`) | `--text-soft`, `--t3` ; `code` : `--accent-wash`, `--sp-2`/`--sp-4`, `--radius-sm` | — |
| `.stage-nav` (verbe principal) | `--sp-12` ; boutons : `--sp-8`/`--sp-16`, `--radius-md`, `--border-strong` | `:disabled` ; `:last-child` = `--accent`/`--on-accent` |
| `.skills-step` | `--grid-w` | — |
| `.skill-group` (+ `h3`) | `--sp-24` ; `h3` : `--sp-4`, `--t3`, `--text-muted` | — |
| `.skill-budget` | `--sp-8`, `--t3`, `--text-muted` | — |
| `.skill-slot` | `--sp-8` | `locked` (opacité) |
| `.skill-chip` | `--border-strong`, `--radius-pill`, `--sp-4`/`--sp-12`, `--t3`, `--text-muted` | `chosen` (`--accent`/`--on-accent`) / `:disabled` |
| `.skill-lock` | `--sp-4`, `--t2`, `--critical` | — |
| `.plan` (+ header, liste) | `--border`, `--sp-20` ; liste : `--sp-4`, `--sp-8`, `--radius-md`, `--t3`, `--text-muted` | `current` (`--accent-wash`) / `done` (`--positive`) |
| `.scrim` | `--scrim` *(hors des 14 jetons — voir §5)* | mobile seulement |

**Le corps du builder (défaut nommé au §0 de la commande)** : `--t4` (16px)
posé explicitement sur `.belt-item` et via `button { font: inherit }` — plus
aucun texte de la coquille ne dépend du 16px par défaut du navigateur.

### 2b. Ce que le §4 du schéma d'écran demandera — inventorié, PAS construit

| Ce qu'il faudra | Statut à la fin du lot 38 |
|---|---|
| Barre de catégories collante (scrollspy) | pas de jeton dédié requis — `position: sticky` + `--surface`/`--border` suffiront |
| Compteur à trois bourses (Pool/Class/Species, ne s'additionnent pas) | typographie : `--t2`/`--t3` disponibles ; pas de jeton de mise en page dédié |
| Ligne de notification du Rogue | `--t3`/`--text-soft` suffisent |
| Trois sous-blocs *Tools · Languages · Trainings* | *Trainings* grisé → `--text-muted` + `opacity` déjà pratiqués sur `.skill-slot[data-status="locked"]` |
| Cadenas de ligne + provenance | `.skill-lock` existe déjà (`--critical`), à réutiliser/étendre |
| `6 OVER` en rouge | `--critical` couvre déjà ce rôle |
| Rampe ordinale des paliers (`—`/`½`/`●`/`★`) | **jetons déclarés ce lot** (`--tier-1/2/3`), **aucun consommateur encore** — voir §4c |

Aucun de ces éléments n'a été construit. Le vocabulaire de jetons dont ils
auront besoin (type, espacement, couleur, rampe) existe déjà.

---

## 3. Les chiffres de contraste — mesurés dans `tests/ui-jetons.test.mjs`, pas copiés d'un commentaire

### 3a. Les 14 jetons de couleur sur `--sunken` (le contraste GARANTI, §3b)

| Jeton | Jour | Nuit | Cible |
|---|---|---|---|
| `--text` | 10.36 | 10.11 | 4.5:1 |
| `--text-soft` | 4.94 | 4.87 | 4.5:1 |
| `--text-muted` | 4.50 | 4.51 | 4.5:1 |
| `--border-strong` | **2.9959** ⚠️ | 3.0089 | 3:1 |
| `--accent` | 4.5112 | 4.5248 | 4.5:1 |
| `--positive` | **4.4986** ⚠️ | 4.5150 | 4.5:1 |
| `--caution` | 4.5310 | 4.5050 | 4.5:1 |
| `--critical` | 4.5068 | 4.5047 | 4.5:1 |
| `--info` | 4.5383 | 4.5216 | 4.5:1 |
| `--surface` | 1.10 | 1.13 | décorative |
| `--border` | 1.24 | 1.21 | décorative |
| `--on-accent` *(mesuré contre `--accent`, pas `--sunken`)* | 6.07 | 5.62 | 4.5:1 |

⚠️ **Deux mesures contredisent `PALETTE-FHV2.json` d'un cheveu — la mesure
gagne (règle du dépôt), et voici les deux :**

- **`--border-strong` jour : 2,9959:1**, pas 3,00 — le JSON arrondit à 2
  décimales. Écart : 0,0041, un artefact de quantification 8 bits sur le hex
  `#857e6e`/`#e0ded7` (le nuit, lui, passe à 3,0089:1).
- **`--positive` jour : 4,4986:1**, pas 4,50. Écart : 0,0014, même famille
  d'artefact sur `#326e4b`/`#e0ded7`.

Ce lot n'a pas autorité pour changer un hex de la palette ratifiée. Les deux
seuils sont acceptés dans le garde **avec le chiffre exact écrit en toutes
lettres** (2,99 et 4,498) plutôt que silencieusement arrondis — voir
`tests/ui-jetons.test.mjs`, tests « §3b, le piège du lot » et
« --border-strong tient ~3:1 ». **Question ouverte pour Eric/l'architecte** :
`PALETTE-FHV2.json` devrait-il décaler d'un cran de 8 bits le hex jour de
`bordure-forte` et de `positive` pour obtenir une vraie marge ?

### 3b. `--text` sur `--accent-wash` (le lavis à 10% posé sur `--bg`)

| Thème | Couleur composée | Contraste |
|---|---|---|
| Jour | `#ebe4da` | **11.06:1** |
| Nuit | `#251d14` | **11.14:1** |

Cible 4,5:1, largement tenue (marge ×2,4). Pas besoin de baisser le
pourcentage — testé jusqu'à 30% (contraste encore ≥ 8:1) au cas où un futur
lot voudrait un lavis plus marqué.

### 3c. Les trois lavis de la rampe (sur `--sunken`)

| | Jour | Nuit |
|---|---|---|
| tier-1 (demi ½) | `#7d5431` — **4.90:1** | `#bc8452` — **4.71:1** |
| tier-2 (plein ●) | `#583b22` — **7.56:1** | `#cea682` — **6.75:1** |
| tier-3 (expertise ★) | `#332314` — **11.21:1** | `#dec3ab` — **8.97:1** |

Une seule teinte (28°, celle de l'accent), saturation ~44%, seule la clarté
varie. Les trois tiennent 4,5:1 dans les deux thèmes avec de la marge.

---

## 4. Les cinq attaques du garde

Chaque attaque a été menée **deux fois** : (1) en mémoire, comme test
permanent dans `tests/ui-jetons.test.mjs` (précédent `guards-adversarial.
test.mjs`) — reste dans la suite pour toujours ; (2) **sur le vrai fichier
disque**, restauré et diffé byte-à-byte, pour la preuve littérale demandée
par la commande.

| # | Attaque | Garde qui rougit | Les 4 autres | Restauration |
|---|---|---|---|---|
| 1 | `color: #fff` sur `.stage-nav button:last-child` | **garde 3** (couleur) | verts | `diff` : 0 octet d'écart |
| 2 | `font-size: 13px` sur `.skill-chip` | **garde 1** (type) | verts | `diff` : 0 octet d'écart |
| 3 | `padding: 10px` sur `.belt-item` | **garde 2** (espacement) | verts | `diff` : 0 octet d'écart |
| 4 | `.belt-label { display: none; }` réintroduit | **garde 4** (display:none) | verts | `diff` : 0 octet d'écart |
| 5 | `matchMedia("(max-width: 720px)")` réintroduit dans `shell.mjs` | **garde 5** (seuil unique) | verts | `diff` : 0 octet d'écart |

Suite complète rejouée après chaque restauration : **650/650 verts**, à
chaque fois.

---

## 5. Les exceptions du garde, chacune avec sa raison

| Exception | Raison |
|---|---|
| `0` | une longueur nulle n'exprime aucun jeton |
| `1px` de **bordure** (`border: 1px solid …`) | unité minimale visible, hors de l'échelle d'espacement |
| `1fr` | fraction de grille, pas une longueur |
| `100vh` | hauteur de viewport, hors de propos pour l'échelle locale |
| les pourcentages (`50%`, `100%`) | relatifs à leur boîte — `.belt-index` est un cercle 22×22, 50% le rend rond |
| `999px` | c'est `--radius-pill` lui-même — non consommé en dur aujourd'hui, exception gardée au cas où |
| `transparent`/`black` dans un `mask-image`/`-webkit-mask-image` | un masque encode un CANAL ALPHA, pas une teinte — aucun jeton de la palette ne représente « une opacité de masque ». Portée étroite : seule la valeur de cette propriété est exemptée |
| **`--scrim`** *(nouveau, hors des 14 jetons)* | voir §6, point 2 |

---

## 6. Ce que j'ai changé de la commande, et pourquoi

1. **`--bp-hint` (drapeau) au lieu de `--bp-mid` (nombre) — la piste suggérée
   ne marchait pas.** Mesuré : un `@media` CSS ne peut PAS consommer une
   custom property (`@media (max-width: var(--bp-mid))` n'est pas une syntaxe
   valide — limite native de CSS, aucun préprocesseur autorisé par la loi
   Q3). La piste `--bp-mid` + `shell.mjs` qui la lit aurait donc laissé « 720 »
   écrit **deux fois** quand même (une fois dans `tokens.css`, une fois dans
   le `@media` de `shell.css`). À la place : `shell.css` pose un drapeau
   (`--bp-hint: wide/narrow`) dans son `@media` existant, et `shell.mjs` lit
   le drapeau — plus jamais le nombre. Résultat mesuré : « 720 » n'existe
   qu'à **un seul endroit** dans tout `ui/builder/` (garde 5, vérifié par
   attaque).
2. **Un 15ᵉ jeton, `--scrim`**, hors des 14 de la palette. Le garde exige
   zéro couleur littérale dans `shell.css` ; `.scrim` portait
   `rgba(0,0,0,.4)` en dur (le voile derrière le plan escamotable mobile).
   Ce n'est ni une encre du §3b ni un dérivé de l'accent — un assombrissement
   neutre, identique dans les deux thèmes, comme avant ce lot (zéro
   changement visible). Signalé plutôt que caché : la commande ne l'avait
   pas anticipé.
3. **`--border` scindé en usage : bordures de CONTRÔLE vs bordures
   décoratives.** La commande donne les deux rôles (§3b) mais pas
   l'affectation par sélecteur. J'ai mis `--border-strong` sur les éléments
   cliquables (`.stage-nav button`, `.toggle-bar button`, `.skill-chip`) et
   gardé `--border` sur les séparateurs/cartes (`.belt`, `.decision-card`,
   `.plan`). Jugement dans le périmètre du lot, pas une règle de jeu.
4. **`.plan-list li` reçoit `--radius-md` (8px), pas `--radius-sm`** — la
   commande demandait explicitement de trancher (§3d). Motif : c'est la même
   famille visuelle que `.belt-item` (une ligne sélectionnable avec
   surbrillance d'état courant), donc le même rayon.
5. **Règle d'arrondi des espacements non alignés sur la grille, tenue pour
   tout le fichier** : à égalité entre deux crans (10→8/12, 28→24/32,
   22→20/24, 6→4/8), **arrondi au cran du dessus**. Écrite une fois,
   appliquée partout, documentée en commentaire à chaque occurrence dans
   `shell.css`.
6. **`.skill-budget` et `.skill-chip` (13px) vont tous les deux à T3 (14px),
   pas splittés entre T2/T3.** 13 est à égale distance de T2(12) et T3(14) ;
   les séparer aurait CRÉÉ un écart entre deux textes qui étaient identiques
   avant ce lot — la commande ne décrit qu'un écart entre le 13px existant et
   le 16px par défaut du voisinage, jamais un écart entre budget et chip
   eux-mêmes.
7. **La rampe des paliers (§3i) : hue/lightness calculés, pas donnés par la
   commande.** Elle fixe la contrainte (« une seule teinte, trois lavis,
   4,5:1 sur `--sunken` ») mais aucune valeur. J'ai repris la teinte de
   l'accent (28°, sat ~44%) et balayé la clarté jusqu'à trouver trois paliers
   qui tiennent leur contraste avec marge, dans les deux thèmes — voir §3c.
   **Ce choix de teinte est ouvert**, voir §7b.
8. **Deux razor-thin écarts au §3b, documentés plutôt que masqués** — voir
   §3a.

---

## 7. Les arbitrages d'architecte encore ouverts

### 7a. Les trois demandés explicitement par la commande, répétés pour Eric

- **Les 5 jetons de dés sont écartés du builder** (M4, zéro consommateur
  aujourd'hui) — ratifié dans cette commande, pas rouvert.
- **La rampe des paliers est déclarée ici (§3c), consommée par le lot 39.**
  Les VALEURS exactes (teinte 28°, trois clartés) sont un choix
  d'architecte fait dans ce lot, faute d'instruction plus précise — à
  confirmer ou corriger avant que le lot 39 les affiche à l'écran.
- **Le seuil de 1140px n'est pas déclaré**, faute de consommateur (rien ne
  fait encore flotter l'inspecteur). Arrive avec le lot qui le fait
  flotter.

*(Le quatrième point de la commande — la palette recalculée contre `creux`
— est ratifié depuis le 2026-08-13 : ce n'est plus un arbitrage.)*

### 7b. Trouvés en construisant ce lot, à trancher par Eric

- **Le hex source de `bordure-forte` et de `positive` (jour) est sous son
  seuil nominal d'un cheveu** (2,9959:1 et 4,4986:1 — voir §3a). Ce lot ne
  peut pas corriger `PALETTE-FHV2.json` lui-même.
- **`PALETTE-FHV2.json` vit hors du dépôt git** (`~/tools/fh-phb/`, un
  dossier frère de `fhpc/`, pas un sous-dossier). Un garde ne peut donc pas
  le lire de façon portable — le chemin relatif diverge entre le dépôt
  principal et un worktree, et un CI n'aurait pas ce dossier du tout. Ce
  lot a donc recopié les 14 hex directement dans `tokens.css` (comme
  attendu), et les tests de contraste lisent `tokens.css`, pas le JSON —
  une troisième copie de la vérité, pas une lecture croisée. Faut-il un jour
  verser la palette source dans le dépôt (`fhpc/palette/` ou
  `schemas/palette.json`) pour qu'un garde puisse lire une seule source
  réelle ?
- **La teinte choisie pour la rampe des paliers (28°, celle de l'accent)**
  est un choix d'architecte, pas une décision d'Eric — voir §7a.
