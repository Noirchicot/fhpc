# Inventaire — lot 70 « desktop-fini »

> Le lot 69 a donné au builder la grandeur Large, en jetons seulement. Ce
> lot finit ce qui demandait du JavaScript : les chevrons flottants font
> B0.22 **et servent à quelque chose à la souris**, la fiche annonce sa
> suite, les crans de la ceinture atteignent le seuil tactile. Deux `.mjs`
> touchés (`socle.mjs`, `shell.mjs` — deux lignes), deux CSS, le stub, deux
> suites neuves.

**Tests : 1 026 avant → 1 049 après, EXIT=0** (`npm test > /tmp/t.txt 2>&1;
echo EXIT=$?` — jamais tuyauté). Les 23 nouveaux : 13 de machine à états
des chevrons (`tests/chevrons.test.mjs`, horloges factices de node:test),
10 de garde CSS (`tests/ui-desktop-fini.test.mjs`, balayage d'octets +
attaques en mémoire).

---

## 1. Les mesures de la commande, vérifiées AVANT de toucher quoi que ce soit

| Mesure annoncée | Chez moi |
|---|---|
| « Les chevrons sont morts à 1440 » | **Oui pour les FLOTTANTS, mais pas comme annoncé** — voir §2. Et ⛔ **NON pour les ‹ › de la ceinture** : le lot 69 les disait « deux contrôles morts », un clic sur › à 1440 passe d'Universe à Concept — ce sont des boutons `goToStep`, le remplaçant de `Back` (I.5), vivants quel que soit le débordement. **Les masquer quand la ceinture tient aurait retiré `Back` du desktop.** Rien changé là, et c'est délibéré |
| « Ils disparaissent après une seconde de repos et reviennent au défilement » | **B0.22b et B0.22c MARCHAIENT déjà**, aux deux tailles — vus s'estomper entre deux peintures, `dataset` à l'appui. La fausse piste « le minuteur ne marche pas sur desktop » ne se reproduit pas ; je soupçonne la mesure du lot 69 d'être un artefact du volet masqué (voir §4.1) |
| Crans de la molette d'étapes à 38 px | **oui, exactement** : `.belt-item` 38 px de haut (padding 8+8 + pastille 22), aux deux tailles — `min-height: auto` |
| « Rien n'annonce qu'on peut défiler » | oui : barre de `.stage` invisible sur Mac (overlay), fiche = champ à l'octet près (887 × 794 dans 794), aucun indice qu'il existe onze autres classes |

## 2. Ce que les chevrons flottants faisaient VRAIMENT à 1440 (mesuré)

1. **Ils flashaient sur des écrans qui ne défilent pas** : Universe en
   Large, `scrollHeight 800 == clientHeight 800`, et le `show()` de montage
   les affichait quand même une seconde — une promesse de défilement sans
   défilement.
2. **Une fois effacés, ils étaient irrécupérables à la souris** : boutons en
   `pointer-events: none`, et seul un geste de molette les réveille. Cliquer
   → défiler → 1 s → le contrôle **meurt sous le curseur**. C'est ça, le
   « morts à 1440 ».
3. **Une direction impossible restait pleine encre** : ∨ au pied de Wizard —
   où CHAQUE arrivée sur Class se pose (l'écran reprend le choix, scrollTop
   8800/8800).
4. **L'annonce de l'architecte ne vivait qu'une fois par session** : le
   `show()` de montage, sur un écran (Universe) qui ne défile même pas en
   Large. Arriver en haut de Skills n'annonçait jamais rien — `scrollTo(0)`
   depuis 0 n'émet pas d'événement.
5. **La bande de l'hôte mangeait les gestes** : 60 × 112 px posés sur la
   fiche (x 300–360 à 360 px), `pointer-events: auto` — molette et balayage
   morts dessus.

## 3. Ce que j'ai construit

### `socle.mjs` — `mountChevrons` réécrit (le minuteur B0.22 est INTACT)

- **La vérité géométrique en attributs, jamais un nœud** : `data-visible`
  (hôte), `data-more` (« il reste du contenu plus bas », sur la scène),
  `disabled` (bouts de course). Relue **une image par rafale** au
  défilement (même étranglement rAF que le spy), et par `settle()` après un
  remplacement.
- **`settle(annonce)`** : `refresh()` l'appelle nu (la géométrie se remet à
  jour, la visibilité ne bouge pas) ; `openSurface()` l'appelle avec
  `annonce` — **chaque surface neuve qui défile se montre UNE seconde**,
  puis vit sa vie B0.22. Pas de mou → tout s'éteint, minuteur compris.
  C'est la réserve de découvrabilité de B0.22, servie à chaque écran — le
  comportement de l'indicateur iOS, la comparaison d'Eric elle-même.
- **La souris posée n'est pas du repos** : `pointerover`/`out` de type
  `mouse` retiennent le minuteur (le contrôle ne meurt plus sous la main) ;
  un `pointerover` tactile est ignoré — à 360, B0.22b à l'octet. Le focus
  **clavier** retient pareil, mais **seulement lui** (`:focus-visible`) —
  voir §4.2, payé en une fausse joie.
- `step()` inchangé : un cran = une hauteur de champ, le CSS garde le droit
  d'animer (et `prefers-reduced-motion` de couper).

### `shell.mjs` — deux lignes

`frame.scroller.settle()` dans `refresh()`, `frame.scroller.settle(true)`
dans `openSurface()` — à côté des `spy.settle()` existants, même raison.

### `shell.css` / `tokens.css`

| Règle | Ce qu'elle répare |
|---|---|
| `.stage-chevrons` : **polarité inversée** (`opacity: 0` par défaut, `[data-visible="true"]` allume) + `pointer-events: none` sur l'hôte, `auto` sur les boutons visibles seulement | plus de flash au chargement ; sans JS, pas de faux contrôles ; la bande morte rendue à la molette et au balayage |
| `.stage-chevron:disabled` : encre de mention + bordure de carte | un bout de course se voit « présent, pas actionnable » — la géométrie tient (retirer un bouton d'une pile flottante ferait sauter l'autre sous le curseur ; la ceinture, elle, MASQUE — B0.3 — c'est sa loi, pas celle-ci) |
| `.stage[data-more="true"]` consomme `--stage-amorce` (paire mask/-webkit-mask) | **l'affordance qui manquait** : le bas de la fiche fond dans le décor tant qu'il y a une suite — même famille que l'amorce des molettes (bible §4), un masque, pas une teinte, pas de jeton de couleur inventé |
| `--stage-amorce` : **`none` à la base**, fondu `black/transparent` sur `--sp-32` dans le bloc Large | à 360 l'octet ne bouge pas ; le garde des thèmes du lot 69 reste muet à raison (pas de forme hex/rgb/hsl/color-mix/url) |
| `.belt-item { min-height: var(--touch) }` | le cran passe 38 → 44 px. La ceinture grandit de 6 px (55 → 61), le champ les rend (800 → 794 en Large, 680 → 674 à 360) et **la chaîne d'aimantation suit** : la fiche se taille sur le champ, pas sur un nombre — mesuré fiche 794 = champ 794 et 674 = 674 |

### Le stub (`tests/dom-stub.mjs`)

`clientHeight`/`scrollHeight` qui **jettent sans géométrie déclarée** (la
loi du lot 68 : pas de garde creux sur du vide) ; `poserUneColonne` déclare
la hauteur de contenu.

## 4. Ce qui m'a surpris

1. **Le piège du volet masqué a QUATRE visages, pas un.** La commande
   annonçait le scrollspy gelé (rAF). Mesurés en plus : les **transitions
   CSS** gelées (`data-visible="false"` avec opacité calculée à 1 — l'état
   JS disait vrai, la peinture mentait), les **écritures `scrollTop` en
   `scroll-behavior: smooth`** qui ne bougent pas d'un pixel (l'animation
   est une affaire de rendu — c'est probablement LA fausse mesure « le
   minuteur ne marche pas sur desktop » du lot 69), et les **événements
   `scroll` programmatiques** qui ne flushent qu'à la peinture suivante.
   Règle de survie : l'état se lit au `dataset` dans la microtâche du
   geste ; la peinture se juge sur capture ; toute mesure d'animation
   passe par `behavior: "instant"` ou une sonde `scrollBehavior: 'auto'`
   d'exécution.
2. **Un clic pose le focus, et mon premier « le focus retient » gelait les
   chevrons à l'écran POUR TOUJOURS** — trouvé en cliquant pour de vrai à
   1440 (`activeElement = .stage-chevron`, `visible` bloqué à `true`),
   invisible sous ma propre suite verte fraîche. Sur Chrome, un tap mobile
   fait pareil : B0.22b serait mort après le premier usage, à 360 aussi.
   Correctif : seul le focus **clavier** retient (`:focus-visible`
   départage), et le garde C quater rejoue exactement ce clic. Preuve au
   navigateur : focus encore posé sur ∨, souris partie, `visible: "false"`.
3. **L'attaque qui frappe à côté** : mon ATTAQUE 1 retirait le premier
   `min-height: var(--touch)` du fichier — celui du `.belt-chevron`, ligne
   84, pas celui du cran. La clause disait vrai, l'attaque mentait. Une
   attaque se vise au bloc, pas à la propriété.
4. **`justify-content: safe center` (lot 69) rend les ‹ › de ceinture
   « détachés » à 1440** : les dix étapes centrées, les chevrons aux coins
   de fenêtre. Pas touché — B0.22a assume déjà le bord de fenêtre comme
   langue du cadre, et rapprocher les chevrons re-déborderait la ceinture
   (ils redeviendraient des contrôles de circulation, le contraire du
   centrage ratifié). Si ça gêne Eric à l'œil, c'est une décision d'un
   trait, pas un défaut caché.

## 5. Attaqué sans qu'on me le demande

- **La bande morte au geste** (§2.5) — `pointer-events` réordonnés, les
  balayages traversent les 8 px de gouttière et l'inter-boutons.
- **Le focus clavier montre les chevrons** (`focusin` → `show`) — un
  contrôle qu'on atteint au Tab ne doit pas être invisible.
- **Les bouts de course** (`disabled`) — pas exigés par B0.22, mais « des
  contrôles morts » était la maladie de ce lot ; une direction sans suite
  en est un.

## 6. Ce que je n'ai PAS fait, et pourquoi

- **Rien sur Inheritance/`background`** : la commande corrective de
  l'architecte (en cours de lot) a retiré le sujet — le défaut est dans
  `refPlan`/`decisions.mjs` (le repli « livrée, non choisie » ignoré),
  `src/` est hors périmètre et il s'en charge.
- **Le test « terminé = le carnet seul »** (suggéré en option) : pas écrit.
  Il rougirait aujourd'hui sur `inheritanceValidate` — dont la correction
  vient d'être retirée de mon mandat. Un garde qui naît rouge sur du code
  qu'on m'interdit de toucher n'est pas un garde, c'est une alarme qu'on
  apprendra à ignorer. À écrire DANS le lot qui corrige le moteur.
- **La barre de défilement de `.stage`** : toujours là, toujours la seule
  jauge de POSITION desktop — « sans barre, comment sait-on où on en
  est ? » reste posée à Eric, sans réponse. L'amorce dit « il y a une
  suite », pas « vous en êtes aux deux tiers » ; je ne tranche pas en douce.
- **La profondeur de l'amorce (32 px sur ~800)** est une annonce, pas un
  voile — délibérément discrète. Si Eric la veut plus franche : c'est UN
  jeton (`--stage-amorce`, `--sp-32`) à UN endroit.

## 7. Les chiffres de sortie

### 1440 × 900

| Mesure | Avant | Après |
|---|---|---|
| Universe (champ 794/794) | chevrons flashés 1 s au chargement | **rien — pas de promesse sans défilement** (`visible:"false"`, `more:"false"`) |
| Arrivée sur Class (posée sur Wizard, 8734/9528) | annonce seulement si l'arrivée a défilé ; ∨ pleine encre au pied | **flash d'annonce dans la microtâche du clic** ; **∨ `disabled`**, ∧ vivant ; `more:"false"` au bout |
| Arrivée sur Skills (en haut, 3640 > 684) | jamais d'annonce (`scrollTo(0)` muet) | **flash `true`**, `more:"true"`, amorce allumée |
| Amorce | — | masque calculé `linear-gradient(rgb(0,0,0) calc(100% − 32px), transparent)` sous `data-more="true"`, éteint au bout |
| Souris posée sur un chevron | s'efface SOUS le curseur après 1 s | **tenu tant que survolé** (mesuré > 1 s), repos 1 s plein au départ |
| Clic réel sur ∨ (focus posé) | n/a (pré-correctif : gelés pour toujours) | **s'effacent quand même** — focus de clic sans rétention |
| Deux clics ∨ depuis Monk | irréalisable (morts après le 1er) | **3970 → 4764 → 5558** : deux crans exacts de 794 (sonde `auto`) |
| Cran de ceinture | 38 px | **44 px** ; ‹ › de ceinture : vivants, `goToStep` mesuré |
| Chaîne d'aimantation | fiche 887 × 800 = champ 800 | **fiche 887 × 794 = champ 794** — elle suit le champ |

### 360 × 780

| Invariant | Mesuré |
|---|---|
| Amorce | `data-more` dit vrai (`true` au milieu, `false` au bout) mais **masque `none`** — le jeton borne l'annonce au Large, l'octet 360 intact |
| Chevrons | flash d'annonce à l'arrivée sur Class (`true` en microtâche), repos B0.22b après ~1 s, `pointerover` tactile ignoré (garde C bis) |
| Bouts de course | ∨ `disabled` au pied de Wizard, les deux vivants au milieu |
| Ceinture | cran 44 px, ceinture 61 px, ‹ › tous deux visibles au milieu (B0.3) |
| Chaîne d'aimantation | **fiche 674 = champ 674** (était 680 = 680 — les 6 px payés au seuil tactile, la chaîne suit) |
| Débordement horizontal | aucun (`scrollWidth 360 = fenêtre 360`) |
| Spy/rail | intacts — Fighter/Monk/Ranger surlignés sous le doigt pendant toutes les mesures |

### Les captures

Examinées au navigateur pendant la construction — 1440 × 900 : Universe,
Class (Wizard, Fighter, Monk, Paladin, Ranger — rail suivi), Skills ;
360 × 780 : Universe, Class (Warlock, Fighter). ⚠️ Toujours pas de moyen
d'exporter les pixels du volet en fichiers (Chrome headless plante sur
cette machine, noté en mémoire) : les chiffres ci-dessus sont la partie
transférable. **Recette pour rejouer** :
`cd /Users/Eric/tools/fhpc-worktrees/70-desktop-fini && python3 -m http.server 8095`,
ouvrir `http://localhost:8095/ui/builder/`, fenêtre à 1440 × 900 puis
360 × 780. Pour voir l'annonce : entrer sur Class par la ceinture ; pour la
tenue au survol : poser la souris sur un chevron pendant qu'il est visible.
