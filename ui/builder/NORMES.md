# NORMES DE L'INTERFACE — ratifiées par Eric

> 🔴 **CE FICHIER NE PORTE QUE CE QUI EST VALIDÉ.** Chaque ligne a été tranchée par Eric,
> à une date, et ne se rediscute pas dans un lot. Ce qui n'est **pas** tranché vit dans le vault
> (`FH-WEB/FHPC/FHPCv2 nomenclature UI.md`) — ⛔ ne pas l'implémenter depuis là.
>
> ⚖️ **Une norme est un DÉFAUT, pas un mur** (Eric, 26/08 : *« c'est pas une dictature, on fait ça
> par défaut »*). Un écran qui dévie le fait **explicitement**, et c'est légal. Un garde vérifie
> **que le défaut vaut la bonne valeur** et **que personne ne recopie le nombre en littéral** —
> jamais que tous les écrans l'emploient.

---


> ## 📚 CES TROIS FICHIERS SONT UN SEUL CORPUS *(Eric, 2026-08-29)*
>
> *« Ok que ça soit dans trois fichiers, mais **l'application au builder est la même**. »*
>
> | fichier | ce qu'il porte |
> |---|---|
> | **NORMES.md** | **les organes** : jeton, collecteur, bouton, liste, popup · les voiles et le relief · les cotes partagées · l'écriture · les gestes |
> | **CADRES.md** | **les écrans** : F · FF · FS, la carte, la dalle, la tuile · les largeurs (`--card-w`, `--panel-w`, `--grid-w`, `--measure`) · l'habillage `D-` · `data-bleed` |
> | **SOCLE.md** | **le mécanisme** : qui possède quoi, les trois verbes, ce qui ne se redessine jamais, le contrat d'un écran |
>
> ⭐ **TROIS PORTES, UNE SEULE LOI.** Le découpage sert à trouver, pas à cloisonner : aucune règle
> n'est vraie « seulement dans son fichier ». Une règle d'organe vaut sur tous les écrans, une cote
> d'écran vaut pour tous les organes qu'il porte, et le mécanisme vaut pour les deux.
>
> ⚖️ **AVEC LES EXCEPTIONS NOMMÉES** — la règle d'Eric du 26/08 : *« il y aura des exceptions pour
> tokens et collecteurs, mais ils doivent être argumentés »*. Une exception se **nomme** (jamais un
> `:nth-child` qui devine) et se pose **à côté de son argument**.
>
> ⚠️ **NOMMER N'EST PAS METTRE À L'ABRI**, et ça a coûté trois lots le 29/08 : trois régimes de
> rangement écrits en `:not()` l'un de l'autre étaient tous nommés — et se sont battus quand même,
> parce qu'**une exclusion de plus déplace la spécificité**. La forme sûre est un attribut à
> plusieurs valeurs (`data-rangs`), qui donne à tous les cas la MÊME spécificité.
>
> 📌 **PORTÉE : LE BUILDER.** Le site du livre (`fh-phb`) a sa propre feuille et n'est pas régi
> ici. L'étendre est une décision d'Eric, pas une conséquence de ce paragraphe.

---

## 0 bis. 🔴 **LE ZOOM, ET LE `blg`** *(Eric, 2026-08-30)*

> **« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT NULLE PART. Tout grandit de manière
> proportionnelle. »**
>
> **« Le plancher c'est la taille 360 sur laquelle on travaille. »**

### Le mot

⭐ **Un `blg`** — *« blurg »*, le mot d'Eric — **est l'unité de dessin du builder** : ce que vaut un
`px` de feuille de style une fois le zoom appliqué. `--t4: 16px` se lit **« T4 = 16 blg »**.

| | zoom ×1 | ×1,5 | ×3 |
|---|---|---|---|
| **10 blg** | 10 px | 15 px | 30 px |
| `--t4` = **16 blg** | 16 | 24 | 48 |
| le rail = **90 blg** | 90 | 135 | 270 |

🔴 **Le nombre de blg ne change JAMAIS ; c'est le pixel qui bouge sous lui.** Deux organes à 8 et
16 blg restent dans un rapport de 1 à 2 sur n'importe quel écran, à n'importe quel cran.

📌 **Eric autorise `bg` ou `px` à l'oral** — *« si je suis feignant »*. **À l'écrit c'est `blg`** :
`--bg` est déjà le parchemin (`tokens.css`), et un nom qui dit deux choses n'a pas sa place ici.

### Les six lois

| loi | détail |
|---|---|
| 🔴 **aucune exception** | ni les filets d'un blg, ni les ombres, ni `--touch`. Une valeur qui resterait fixe pendant que le reste grandit **change un rapport** — c'est ce que la loi interdit |
| 📌 **plancher = 1** | *« la taille 360 sur laquelle on travaille »*. Rien ne rétrécit sous le barème ratifié : **aucun texte ne peut passer sous T1** |
| ⭐ **`--touch` n'a plus de `max()`** | 44 blg valent toujours ≥ 44 px sur une échelle qui ne descend jamais. La loi d'Apple et celle d'Eric disent la même chose — *tant que le plancher tient*, et un garde le mesure |
| ⛔ **le reflux survit, le redimensionnement meurt** | une rangée qui passe de 4 cases à 3 ne change **aucun** rapport (loi du 19/08, *« si on peut faire 4, on fait 4 »*). Une cote qui double sur grand écran, si |
| ⛔ **jamais un `@media` de largeur** | il **ne se réévalue pas** sous `zoom` — mesuré au banc : à 1920 au cran 5, `min-width: 1140px` matchait encore et le rail rendait **600 px réels**. La grandeur passe par `data-grandeur`, calculé sur `innerWidth / échelle` |
| ~~⚠️ **le cran est borné, jamais clampé**~~ | **renversé le 2026-09-02** — Eric : *« si l'auto fait bien son travail, effectivement les boutons sont obsolètes »*. La rampe de crans du Menu est **retirée** (lot 118) : depuis l'échelle continue, Auto rend déjà le plus grand facteur que la fenêtre porte, et un cran manuel ne pouvait que **rapetisser** (mesuré à 1366 × 1024 : Auto ×1,83, « Large » ×1,25 — le libellé mentait). La taille se règle en **redimensionnant la fenêtre** ; sur téléphone et tablette, l'appareil décide. Les clefs `fhpc.echelle.cran*` sont effacées à chaque lecture. ⚖️ **Et la RAISON de ce retrait tombe le même jour** — voir l'amendement du 02/09 ci-dessous : avec le partage, un réglage joueur peut agrandir |

### 🔴 AMENDEMENT DU 2026-09-02 — **LE BUILDER EST UN PARTAGE DE L'ÉCRAN**

> **« Concept. Builder plein écran sur mobile. […] Etc… »**
> **« Donc largeur plutôt basée sur la largeur, et un plancher à la hauteur ; si ça passe pas on
> saute un cran en dessous. »** · **« Tout passe en mode widget pour desktops. »**
> **« iPad tu suggères 1/2 donc, là où petit écran tu suggères 1/3. »** · **« 7 crans »**

⭐ **Ce n'est pas une taille d'écran, c'est un PARTAGE** — et c'est le mot d'Eric du 31/08 :
*« combien la fenêtre donne au builder, et combien elle laisse à côté »*. `1/4` dit « un quart pour
le builder, trois pour le décor ». **La taille en découle, elle ne se décide pas ailleurs.**

| # | cran | part | écran type | panneau | échelle | hauteur prise |
|---|---|---|---|---|---|---|
| 1 | le réduit | 96 % | 360 × 800 | 360 × 538 | ×0,96 | 67 % |
| 2 | le plein écran | 1/1 | 375 × 812 | 375 × 560 | ×1,00 | 69 % |
| 3 | la tablette | **1/2** | 1366 × 1024 | **683 × 1020** | ×1,82 | **100 %** |
| 4 | le petit | 1/3 | 1440 × 900 | 480 × 717 | ×1,28 | 80 % |
| 5 | le moyen | 1/4 | 1920 × 1080 | 480 × 717 | ×1,28 | 66 % |
| 6 | le grand | 1/5 | 2560 × 1440 | 512 × 765 | ×1,37 | 53 % |
| 7 | l'xtra | 1/6 | 3440 × 1440 | 573 × 856 | ×1,53 | 59 % |

📌 **Les sept NOMS ne sont pas dans ce tableau, et c'est voulu** : ils vivent dans `BARREAUX`
(`echelle.mjs`) et **nulle part ailleurs** — un renommage doit être une seule édition, et un garde
le vérifie. Les chiffres ci-dessus sont une **mesure**, relevée au navigateur par émulation de
viewport le 02/09 ; le même garde la refait.

⭐ **DEUX FAITS QUI PROUVENT QUE LA TABLE EST JUSTE, mesurés :**

| | |
|---|---|
| ⭐ **le petit sur un 1440 et le moyen sur un 1920 rendent la MÊME largeur : 480** | `1440/3 = 1920/4`. La fraction qui rétrécit **compense exactement** l'écran qui grandit — c'est ce qui justifie que les parts décroissent d'un cran à l'autre, et ce n'est pas une coïncidence |
| ⭐ **deux panneaux au demi font exactement 100 % de la largeur** | `2 × W/2 = W`, sur les quatre formes d'iPad. Le *« 1/2 »* d'Eric et sa *« proposition de passage en affichage double d'office »* sont **la même idée par les deux bouts**. ➡️ **La vue double n'est pas une exception au partage : elle en est la conséquence au cran de la tablette** |

### Le mécanisme, en deux temps

| | |
|---|---|
| ① **la LARGEUR pose le cran** | l'écran choisit son cran, le cran donne sa part, la part donne la largeur. **Rien d'autre n'intervient à ce stade** |
| ② **la HAUTEUR ne fait que DESCENDRE** | on calcule la hauteur qu'il faut (`largeur × 560/375`). Si la place ne la porte pas, ⛔ on ne rabote pas la largeur d'un continuum : **on saute un cran en dessous**, autant de fois qu'il le faut |
| ⚠️ **« un cran en dessous » se compte en TAILLE RENDUE** | ⛔ pas en indice, et ⛔ pas « la part du cran d'en dessous appliquée à cet écran-ci » : cette seconde lecture donne une taille **plus grande** et inverse le saut |
| 🔴 **le plancher est le DESSIN, pas un nombre** | un partage ne rend jamais moins que `--panneau-l`, **lu dans les jetons**. Sous le dessin, un builder n'est pas plus petit, il est **coupé**. Seul le plein écran y échappe — c'est là que vit le cran réduit |
| 📌 **le 96 % est un QUOTIENT** | `360 / 375 = 0,96`, exactement. ⛔ Jamais écrit en littéral. Eric, 31/08 : *« si tu réduis de 4 % la taille sur mini mobile c'est ok »* |
| ⚠️ **le résidu, nommé plutôt que masqué** | si même le DERNIER cran ne tient pas en hauteur, la descente n'a plus rien sous elle et le panneau déborde. Mesuré : `2999 × 700` demande 746 de haut. ⛔ **Aucun huitième cran inventé** — le garde le laisse visible |

### ⚖️ Le saut de cran a un témoin, et un seul

📏 **L'iPad Air couché, `1180 × 820`** : au demi il demande `590 × 881` pour 820 disponibles — **il
déborde de 61**. Il saute un cran, retombe au tiers, et rend **`393 × 587`**, 72 % de la hauteur.
⭐ **C'est le seul cas de toute la table où le saut se déclenche.** S'il cessait de se déclencher
là, le mécanisme serait mort et la table seule le cacherait — d'où un garde qui prouve d'abord
qu'il DÉBORDERAIT, puis qu'il descend, puis qu'il tient.

### 🧊 Ce que cet amendement renverse, et pourquoi

| renversé | remplacé par |
|---|---|
| ~~**la règle sacrée du 31/08** `min(L/375, H/560)` partout~~ | elle **tient toujours** en plein écran *(« sur téléphone et tablette, l'appareil décide »)* et **en vue double**, où deux panneaux font déjà l'écran. Elle est amendée **pour la vue simple à partir de la tablette** : elle rendait ×1,93 sur un 1920 × 1080 — un panneau de 723 × 1080, **89 % de la hauteur**, une bande haute et étroite. Eric : *« plus du tout respectée »* |
| ~~**l'échelle est continue**~~ | au-dessus du plein écran elle est **discrète** — c'est ce que *« 7 crans »* veut dire, et c'est ce qui rend le réglage joueur possible |
| ~~**la rampe de crans du Menu est obsolète** *(lot 118, ce matin)*~~ | ⚖️ **la raison du 118 tombe.** Elle était mesurée : *depuis l'échelle continue, l'auto rendait déjà le plus grand facteur que la fenêtre porte, donc un cran manuel ne pouvait que **rapetisser*** (1366 × 1024 : Auto ×1,83, « Large » ×1,25 — le libellé mentait). ⭐ **Avec le partage, l'auto rend ×0,96 à ×1,53 : un réglage joueur peut désormais AGRANDIR autant que réduire.** Eric : *« décision de le faire en auto, et laisser le joueur régler à sa guise »* — l'auto reste le **défaut**, jamais un mur. ⛔ Les clefs `fhpc.echelle.cran*` ne ressuscitent pas : le 118 les efface à chaque lecture, et deux mécanismes de réglage se battraient |
| ~~**« 1/3 sur iPad »** *(première formulation du 02/09)*~~ | ⛔ **mort le jour même.** Mesuré : sur un iPad couché le tiers portait le vide de **50 à 67 %** — il rétrécissait le panneau **sans réduire le vide, il l'augmentait** ; et debout il tombait **sous le panneau nu** (`1024/3 = 341`). Le demi le remplace |
| ~~**les six noms du 31/08** `mini · mobile · small · medium · large · extra`~~ | Eric a nommé cette échelle deux fois. **Liste retenue le 02/09**, sur sa réponse *« celle du 2/09 »*. ⚠️ **Le cran réduit, lui, revient** — il avait disparu d'une lecture intermédiaire qui le prenait pour un état et non pour un rang ; Eric a tranché *« 7 crans »*. Sa reprise n'est pas une erreur |

### ⏳ Le repli désigné, **écrit et non construit** *(30/08 au soir)*

Si un moteur n'honorait pas `zoom` — improbable : la propriété vient d'Internet
Explorer, **WebKit l'a implémentée très tôt** et Safari l'honore depuis ses
premières versions ; le retardataire fut Firefox, en 126 (mai 2024), quand le
CSSWG a spécifié *ce que WebKit et Blink faisaient déjà* — le repli désigné est :

```css
.app { transform: scale(var(--echelle)); transform-origin: top left;
       width: calc(100% / var(--echelle)); height: calc(100% / var(--echelle)); }
```

| | |
|---|---|
| ✅ **ce qui ne bouge pas** | `facteurZoom` — mesuré : `offsetWidth` ignore les transformations, `getBoundingClientRect()` les rend, **le rapport vaut ×2 sous les deux mécanismes** · les divisions `vw`/`vh` par `--echelle` · les deux seuils · les `container-type` · le plancher de 340 blg |
| ⚠️ **ce qui change** | un `position: fixed` sous `.app` vise **`.app`**, plus la fenêtre · `.app` devient un contexte d'empilement · la netteté passe du raster au compositeur — **à mesurer au cran 3 sur un vrai appareil avant de poser quoi que ce soit** (le dépôt porte déjà ce défaut écrit : `will-change: transform` retiré de `.roue-cran`, *« le GPU ÉTIRE LA TEXTURE… ça frise à l'œil »*) |
| ⛔ **son seul défaut propre** | il ne réserve **aucune place de mise en page** : un hôte `<div>` à hauteur `auto` recevrait `calc(100%/E)` résolu en `auto`. Borné au mode widget en `<div>`, qui n'existe pas — et où le cran est déjà faux sous `zoom` (`appliquerEchelle` lit `innerWidth`, la fenêtre de l'hôte) |

🔴 **IL N'EST PAS CONSTRUIT, ET IL NE DOIT PAS L'ÊTRE** tant que la mesure n'est
pas faite. Une **détection automatique** `zoom` → repli serait exactement le code
mort que la loi §0.6 interdit : elle ne peut pas mesurer au démarrage (au cran 1
les deux régimes sont indistinguables), elle doublerait le sens de chaque
lecture géométrique du dépôt, et une branche jamais parcourue est une branche
jamais testée. Si le verdict tombe mal, on **substitue** — quatre lignes contre
quatre lignes, dans un seul fichier, pour tout le monde. Une substitution n'a
pas besoin d'être détectée.

📏 **L'instrument existe** : `ui/builder/diag.html`, la règle à deux barres et
le rapport des deux familles de lecture. Cinq minutes sur l'appareil.

### Ce que ça supprime

⚖️ **Trois renversements datés du 30/08**, chacun écrit à sa place :

1. **la grandeur Large** (`@media (min-width: 1140px)`) — elle rehaussait `--t6` de 22 à 28 pendant
   que `--t4` restait à 16 : le rapport titre/corps sautait de 1,375 à 1,75. Même métier que le
   zoom, fait deux fois et à moitié. **Avec elle tombe *« T1–T4 ne bougent pas »*** *(tokens.css
   §69)* : au cran 3 le corps vaut 48 blg ;
2. **l'homothétie `--u` de la carte-résumé** — voir §4 quater ;
3. **la seconde colonne de CADRES §2 bis** — 766 · 887 n'existent plus.

⭐ **Et ça ne supprime AUCUNE cote.** Les 265 valeurs en pixels du dépôt étaient déjà des blg ; il
leur manquait la déclaration qui le dit — `zoom: var(--echelle)` sur `.app`, **une ligne**.

---

## 1. ⛔ LES QUATRE VOCABULAIRES — ils ne se mélangent jamais

| vocabulaire | ce qu'il nomme |
|---|---|
| **`R` / `B` / `SB`** | un **RANG** dans une arborescence (la profondeur). ⛔ **JAMAIS un nom de page** — une page a un **nom** |
| **`F` / `FF` / `FS`** | le **CADRE**. Seul l'écran porte la lettre |
| **carte · dalle · tuile** | l'**OBJET**. ⛔ ne porte jamais de lettre. Une **carte** a une hauteur imposée |
| **`T1`…`T7`** | les tailles de texte. ⛔ pas `H1`/`H2` |

⛔ **« R1 » n'existe pas.** Cette faute a coûté un lot entier le 2026-08-23.
⛔ Écrire **« Entrée › B2 »** ou **« Équipement › B2 »**, jamais « B2 » seul : chaque chapitre a
son propre `R`, ses propres `B`.

---

## 0. 🔴 LA RÈGLE UNIVERSELLE — **« GOOGLE HEADLESS »**

> Eric, 2026-08-26 : *« et la règle universelle désormais : **GOOGLE HEADLESS** »*.

🔴 **UNE NORME SE VÉRIFIE SUR LA PAGE RENDUE, PAS DANS LA SOURCE.**

| ⛔ ce qui ne prouve rien | ✅ ce qui prouve |
|---|---|
| lire une valeur dans `tokens.css` | **ouvrir la page dans un navigateur sans écran et la mesurer** |
| lire le **nom** d'un jeton | lire sa **valeur calculée**, celle que le navigateur applique |
| regarder un écran de démonstration | **mesurer tous les cas**, y compris ceux qu'on n'a pas dessinés |
| calculer un contraste sur une couleur pure | le calculer sur le **rendu cumulé**, voile compris |

⭐ **Cette règle est née de quatre fautes de la même nuit**, toutes de la même famille : *conclure
sur la source au lieu de regarder la chose.*
- j'ai lu **`--accent`** et j'ai écrit *« pas du violet »* — sans lire `#845933` ;
- j'ai retapé un `client_id` à la main et changé un `O` en `0` ;
- un budget vertical a été établi sur un chiffre de hauteur **non mesuré** ;
- « pas de conflit avec un bouton » allait être **constaté à l'œil** sur un seul écran.

⭐ **Et ça vaut aussi pour les gardes** : un test qui lit un fichier CSS vérifie **ce qui est
écrit** ; un test qui rend la page vérifie **ce que le joueur voit**. `tests/decor.test.mjs` fait
déjà le premier — **le second manque.**

### Ce qu'on a sous la main *(mesuré le 26/08)*

| | |
|---|---|
| **Google Chrome** | ✅ `151.0.7922.174`, installé |
| **puppeteer / playwright** | 🔴 **absents** de `fhpc` — à ajouter, épinglés, comme toute dépendance de dev |

⚠️ **⛔ Ne pas confondre avec la règle des PDF** : les PDF Fate's Hand se génèrent à la
**weasyprint**, jamais à Chrome headless *(qui plante sur ce pipeline)*. **Chrome headless sert à
REGARDER une page, pas à en fabriquer une.**

---

## 1 bis. 🔴 RIEN N'EST JAMAIS DANS LA MARGE

> Eric, 2026-08-26, en majuscules : *« **RIEN ne doit jamais être dans la marge !!!** »* ·
> *« à part des dalles et des tuiles »*.

| ce qui peut occuper la marge | ce qui ne le peut JAMAIS |
|---|---|
| ✅ une **dalle** | ⛔ un **bouton** · un **jeton** · un **chevron** · le **`?`** · un **popup** · un **texte** |
| ✅ une **tuile** | ⛔ **tout le reste, sans exception** |

⭐ **La marge est une RESPIRATION, pas une réserve de place.** Le jour où un contrôle y déborde,
c'est que la page **porte quelque chose en trop** — et la réponse est de retirer ce quelque chose,
jamais de coloniser le blanc. *(Même loi que « un contenu qui ne tient pas : demander ce qu'il
porte EN TROP, jamais ajouter un défilement ».)*

⛔ **Cette loi annule toute formulation antérieure** — y compris *« le chevron apparaît dans une
marge si possible »*, corrigé par Eric le jour même.

---

## 1 ter. 🔴 UNE COTE DE CONTENANT NE S'ÉCRIT PAS — ELLE SE DÉDUIT D'AVANCE

> Eric, 2026-08-26 : *« **on ne note pas la cote dans le code, mais on doit chercher à la déduire
> à l'avance** »*.

| ⛔ ce qu'on ne fait pas | ✅ ce qu'on fait |
|---|---|
| figer `--belt-h: 60px` | **calculer** la hauteur depuis ses parts : police, interligne, `padding`, `gap` |
| relever un pixel à l'écran et le graver | écrire **la formule**, et s'en servir **avant** de dessiner |

⭐ **Une cote figée MENT.** Le jour où un libellé grandit d'un point, la ceinture change de hauteur
et le jeton ne le sait pas : tout le budget vertical se décale **sous** celui qui l'avait calculé.
La déduction, elle, reste vraie — elle suit la cause.

⭐ **Et c'est ce qui rend le budget prévisible SANS mesurer** : on sait ce que la page peut porter
**avant** de l'avoir affichée. ⛔ Un budget établi en regardant un écran ne prouve rien sur les
autres — c'est la même faute que « constater à l'œil qu'il n'y a pas de conflit ».

### ⛔ La distinction, elle, ne bouge pas

| ce qui se DÉDUIT | ce qui reste une COTE ÉCRITE |
|---|---|
| la hauteur d'un **contenant** *(ceinture, bande de boutons, dalle)* | `--touch: 44` — **une cible tactile ne cède jamais** |
| | `--glisse-case: 87` · `--glisse-h: 48` — la cote d'un **organe** |
| | `--measure: 62ch` · `--fiche-h: 440` — des cotes **données par Eric** |

⭐ **La règle se lit en une phrase** : *un ORGANE porte sa cote, un CONTENANT la déduit.*
Et ⭐ **une cote DONNÉE bat toujours une cote DÉDUITE** — si Eric a dit un nombre, il gagne.

---

## 1 ter bis. 🔴 UN COLLECTEUR ET SON JETON ONT UNE SEULE COTE *(dicté le 29/08)*

> Eric, 2026-08-29 : *« taille du collecteur toujours la même que le jeton, partout — règle à
> faire respecter sur tout le site »*, puis *« règle universelle : **un collecteur = un jeton en
> taille. Ne varie jamais.** »*

⭐ **C'est §1 ter appliqué à une paire.** La cote ne s'écrit nulle part : elle se **déduit du
cadre**, une seule fois, et **les deux organes la lisent** (`--collecteur-case`, déclarée sur
`.choix-glisse`). Deux nombres égaux divergent au premier qui bouge ; un jeton de mesure partagé
ne peut pas diverger.

### ⛔ TROIS FAÇONS DE LA FAIRE DIVERGER — les trois ont été commises, toutes mesurées

| ce qui a été écrit | ce que ça a rendu |
|---|---|
| deux `87px`, un de chaque côté | le premier qui bouge laisse l'autre derrière |
| le jeton lit la cote, mais en `flex: 0 **1**` | il s'écrase sur son contenu court : **10 px** contre 74 |
| la cote vaut `25%` — **un pourcentage** | le vivier faisait 277 px, la rangée 320 : **63 contre 74** |

🔴 **LE TROISIÈME EST LE PLUS RETORS, ET C'EST UNE LOI GÉNÉRALE** : *un pourcentage se résout chez
**celui qui l'utilise**.* Une cote partagée n'est partagée que si sa **BASE** l'est. Elle se
déclare donc sur l'**ancêtre commun** des deux organes, jamais sur l'un des deux — et les deux
rangées prennent la largeur du même cadre.

⛔ **Et un organe ne rétrécit jamais sous sa cote** : `flex: 0 0`, jamais `0 1`. Un `shrink` non
nul rend la cote partagée décorative.

**Garde** : `tests/collecteur-jeton.test.mjs` — il ne compte pas des pixels, il juge la mécanique
(la cote sur l'ancêtre commun, les deux lecteurs, aucun nombre en dur, `shrink` 0).

---

### ⚠️ La leçon d'« Unseen Servant » *(29/08)* — une cote dictée par un VOISIN n'est pas une cote

Mesuré : un jeton à **87×60** contre une case à **87×48**, avec UNE ligne de texte (76×12). Ce
n'était pas le nom qui poussait — la colonne du **chevron** (flèche + compte, 60 px) étirait le
vivier par le `align-items: stretch` de la rangée, et le jeton suivait. Parade : le vivier se
**centre** dans sa rangée (`align-self: center`, `listes.css`) ; l'égalisation par CONTENU (deux
jetons côte à côte, un nom qui se replie) vit un niveau plus bas et reste intacte. Garde :
`tests/collecteur-jeton.test.mjs`.

---

## 1 ter bis². ✍️ LES MÊMES RÈGLES D'ÉCRITURE POUR LE JETON ET LE COLLECTEUR *(29/08)*

> Eric, 2026-08-29 : *« Norme : **les mêmes règles d'écriture s'appliquent aux tokens et aux
> collecteurs** »*, et sa raison, donnée juste avant : *« comme les collecteurs se transforment
> en token »*.

⭐ **UN COLLECTEUR REMPLI PORTE LE MOT DU JETON DÉPOSÉ.** Deux corps pour le même mot selon qu'il
est *tenu* ou *posé*, ce serait deux modèles pour un organe dont §2 dit qu'il n'en a qu'un.

| | corps | pourquoi |
|---|---|---|
| le **jeton** | `--t1` | sa règle du 26/08 : *« 13 T1, on aura moins d'emmerdes, on jugera après coup »* — le moindre regret, à T1 tout rentre |
| la **valeur** d'un collecteur | `--t1` | c'est le même mot, une fois posé |
| le **nom** d'un collecteur | `--t1`, en capitales | l'ÉTIQUETTE, pas la valeur — la capitale est ce qui les distingue, jamais la taille |

⛔ **ET LA RÈGLE EST VRAIE PAR CONSTRUCTION, PAS PAR SAUVETAGE.** `.glisse-creneau-valeur` a porté
`--t3` (14 px) pendant tout ce temps sans que rien ne se voie : une règle plus spécifique la
rattrapait à T1 dans les écrans de choix, et le seul émetteur de cette classe y vit. L'écart était
**dormant** — faux nulle part, et vrai le jour où un collecteur naîtrait ailleurs. Il est retiré à
la source.

🔴 **C'EST LA MÊME FAUTE QUE §1 ter bis NOMME POUR LES COTES** : une valeur qui n'est juste que
parce qu'une autre la corrige plus loin n'est pas juste, elle est *couverte*. On répare la
déclaration, pas son sauveteur.

---

## 1 ter bis³. 🔗 UN LIEN HORS JETON EST BLEU *(29/08)*

> Eric, 2026-08-29 : *« Règle générale : **liens hors token en bleu**. »* — pour tous les écrans.
> Et son complément du 28/08 : *« pas besoin de mettre le texte des tokens en bleu, la carac d'un
> token est déjà de l'interactif sur un clic »*.

⭐ **LA LIGNE DE PARTAGE EST LE JETON, PAS L'INTERACTIVITÉ** *(corrigée le 29/08 — deuxième rappel
d'Eric : « pas de liens bleus sur sorts et cantrips du wizard »)*. La dictée du 28/08 (« pas besoin
de mettre le texte des tokens en bleu ») parle du texte **SUR le jeton** — un organe déjà
manifestement interactif. Un nom relu **dans la prose du bilan** n'est PAS un jeton : il est un mot
au milieu d'autres mots, et il porte le bleu. ⛔ J'avais étendu la dictée du jeton au bilan — c'est
la sur-extension que ce paragraphe interdit désormais.

| ce qu'on lit | habit | pourquoi |
|---|---|---|
| le texte **sur un jeton** | **encre** | l'organe dit déjà qu'il répond |
| un nom **dans une phrase** (`.lien-sort`) | **`--lien`**, non souligné | rien d'autre ne dit qu'il répond |
| un nom **au bilan** (`.bilan-nom`) | **`--lien`**, non souligné | c'est de la prose — le jeton est ailleurs |

🎨 **LA COULEUR EST `--lien`, UN BLEU À UN SOUFFLE DE L'ENCRE** *(Eric, 29/08 : « plus discret
encore : on sait qu'il est là, mais on le voit à peine. Choisis un bleu très proche du noir »)* —
`#1f3250` de jour contre l'encre `#2d2c2a`, `#c2d0e5` de nuit contre `#d8d3c9` *(calé en trois essais le 30/08 : #1d2633 invisible → #223f6d trop bleu → le mi-chemin ratifié)*. ⛔ `--info` garde
ses autres métiers (voyants, popups, boutons) : un lien n'est pas une information qui crie.
⏳ **NOTE DALTONIENS** *(demande d'Eric, même jour)* : prévoir une **option de soulignage des
liens** — un réglage joueur pour qui ne distingue pas ce bleu de l'encre ; à trancher avec Eric le
jour du panneau d'options, jamais un défaut imposé.

⛔ **ET LE SOULIGNEMENT SUIT LA MÊME LOI.** Un `<a href>` est souligné par DÉFAUT par le
navigateur : une règle qui pose l'encre sans retirer la décoration laisse la moitié des entrées
crier. Mesuré le 29/08 au bilan du magicien — les sorts (rendus en `<button>`) restaient nus,
les compétences (rendues en `<a>` vers le livre) arrivaient soulignées. **Deux habits dans une
seule phrase.**

📌 **PORTÉE MESURÉE** : le builder ne produit que ces deux familles de liens. La règle est donc
complète, pas partielle — et le garde vérifie qu'aucune troisième n'apparaisse sans habit.

---

## 1 ter ter. 📐 COMMENT UNE RANGÉE DE COLLECTEURS SE RANGE *(dicté le 29/08)*

> ⚖️ **PRÉCISION DU 29/08 AU SOIR — « JAMAIS PLUS, JAMAIS MOINS »** (Eric) : les **JETONS** ne
> dépassent **jamais 3 par ligne** ; les **COLLECTEURS** jamais **4**. Ce sont **deux lois**, pas
> une : `--par-rangee` est la loi DES COLLECTEURS, le vivier a la sienne (3, câblée en dur).
> ⛔ Mesuré avant la coupure : « même base, même borne » donnait la borne des collecteurs au
> vivier — Alignment rendait 9 jetons en 4+4+1.
> **Exceptions, toutes NOMMÉES** : les **six caractéristiques** (FOR DEX CON INT SAG CHA) tiennent
> sur UNE ligne de collecteurs (`data-rangs="caracs"`) ; les **dés d'Ability rolls** — 1 dé = 1
> jeton — tiennent à SIX sur une ligne, jetons comme collecteurs, dans leur organe propre
> (`fs-rangee` / `ability-creneaux`, hors vivier). Et la taille ne bouge jamais : un collecteur
> = un jeton (§1 ter bis).

| rangée | règle | dicté |
|---|---|---|
| **collecteurs de skills** | **quatre par ligne** ; au-delà on passe à la ligne ; une ligne incomplète se **centre** | *« pour tous les collecteurs de skills se limiter à des lignes de 4 »* |
| **les six caractéristiques** | **tout sur une ligne**, jamais de retour | *« STR DEX CON INT WIS CHA — règle spécifique, là on met tout sur une ligne ! »* |

⛔ **LA RANGÉE DES SIX SE NOMME, ELLE NE SE COMPTE PAS.** La classe vient de l'appelant
(`renderChoixGlisses({ rangee: "caracs" })`), pas d'un `:nth-child(6)` qui aurait rangé sur une
ligne n'importe quel écran à six créneaux. **Une exception se nomme** — même loi que
`:not(.ability-creneaux)`.

⚠️ **LES DEUX RÈGLES DE LARGEUR SE CONTREDISENT SI ON LES ÉCRIT EN NOMBRES.** À 360 la rangée
offre 320, et quatre cases pleines plus leurs gouttières en demandent 372. C'est la cote déduite
(§1 ter bis) qui les réconcilie : `min(socle, (100% − gouttières) / 4)` — sur un grand écran le
socle plafonne, à l'étroit le quart gagne et **le vide cède, jamais l'organe**.

---

## 1 ter quater. 📏 360 EST LA LARGEUR DE RÉFÉRENCE — et la marge cède la dernière *(29/08)*

> Eric : *« on vise toujours la compatibilité avec **360** sur tout le site »* · *« ce que je veux
> est simple : que ça **tienne toujours en largeur sur 360**, et que les grands écrans soient
> **normalisés sur une largeur max** »*.

**Toute mesure de largeur se prend à 360.** C'est déjà la largeur du banc (`banc-listes.html`), et
le garde le vérifie — si le banc changeait de largeur en silence, toutes les mesures du dépôt
parleraient d'un autre écran.

### La gouttière cède si et seulement si un organe ne rentre pas sans elle

Eric, en deux temps le même jour : *« pour les 360 on se passe de marge, mais faut que ça
rentre »*, puis *« **si en 360 la marge est possible sans impacter tout le monde, on
l'applique** »*.

⭐ **Sa condition est VÉRIFIABLE, et c'est ce qui en fait une règle** : on retire la marge
seulement après avoir mesuré qu'un organe ne rentre pas avec elle. Mesuré le 29/08 : les huit
écrans rendent 352 dans 360, aucun ne déborde, les skills tiennent leur 4 + 3 et les six caracs
leur ligne unique — **la marge reste**.

⛔ **CE QU'ON NE FAIT PAS POUR REMPLIR UNE LARGEUR** : `width: 100%` sur une boîte qui porte une
marge. Un pourcentage se calcule sur le contenant **sans déduire les marges** — mesuré : la carte
demandait 360 + 8 et sortait de 4 px. Et `margin-inline: auto` **désactive** l'étirement en
cross-axis : remplir ET centrer demande de porter les gouttières sur le **cadre**, pas sur la
boîte.

---

## 1 quater. 📏 LE BUDGET DE LA PAGE — des cotes VOULUES, jamais écrites dans le code

> ⚠️ **Ces nombres ne sont PAS des jetons CSS et ne doivent pas le devenir** *(§1 ter)*. Ce sont
> les cotes que la page **doit tenir**, connues **d'avance**, pour dessiner sans se tromper.

### La cible

| | |
|---|---|
| 🔴 **LA LARGEUR CIBLE** | **360 px** — ⛔ **pas 375**. C'est la base sur laquelle tout est dessiné |
| la rangée utile à 360 | **278** — moins deux gouttières de 8 |
| **hauteur, Safari** *(barres visibles)* | **≈ 553** — ⚠️ **valeur courante, NON mesurée sur l'appareil** |
| **hauteur, plein écran** | **667** |
| **la page ne défile jamais** | `.app { height: 100dvh; overflow: hidden }` — c'est **structurel** |

⭐ **Et le 360 n'est pas une préférence : c'est ce qui a FABRIQUÉ la cote du jeton.** Mesuré, écrit
dans `tokens.css:228` : *« à 360 px la rangée dispose de 278, moins deux gouttières de 8, soit
87,3 pour trois — **87** est donc la cote qui tient la promesse à la largeur cible ; **un pixel de
plus et on retombe à deux par ligne** »*.

➡️ **Changer la cible change le jeton.** Tout budget calculé sur 375 est faux : il donne du mou
qui n'existe pas.

🔴 **RENVERSÉ LE 2026-08-26 — TROIS COLONNES, TOUJOURS.** Eric, les deux lois posées devant lui :
**« trois colonnes, toujours »**. Ce paragraphe décrivait la **loi A** *(« la rangée en met autant
qu'elle peut : 3 dès 277 px · 4 dès 372 · 5 dès 467 »)*, qui vivait dans le vivier pendant que la
grille de R imposait déjà trois. **Les deux ne peuvent pas être vraies en même temps.**

⭐ **SA RAISON EST ÉCRITE DANS LE CODE DEPUIS LE 23/08, et c'est elle qui a gagné** :
*« R est une grille à position stable — **un objet ne change pas de place selon l'écran** »*. Une
rangée qui se remplit fait bouger le douzième objet d'une ligne à l'autre entre un téléphone et une
tablette ; le joueur perd le seul repère qu'il a.

⚠️ **CE QUE ÇA COÛTE, dit plutôt que masqué** : sur un écran large, la rangée reste à trois et
laisse du blanc aux deux bouts. C'est le prix de la position stable, et il est assumé.

⛔ Et la case **ne grandit pas** pour remplir sa rangée — *« une case qui s'étire ne laisse RIEN à
centrer »*, et le centrage du reliquat *(§5)* disparaîtrait.

🔴 **Toute conclusion de budget doit dire sur laquelle des deux hauteurs elle repose.** Une
conclusion qui tient sur **553** tient partout ; une conclusion qui n'a besoin que de **667** est
fragile.

### La ceinture (`.belt`)

| | |
|---|---|
| ⛔ **aucune cote déclarée** | elle n'a **ni hauteur ni jeton** |
| **elle se DÉDUIT** | de sa police, son interligne, son `padding`, son `gap` |
| **au réglage d'aujourd'hui** | ≈ **60 px** — ⚠️ **un relevé, pas une constante** : il bouge si un libellé change |
| **et elle n'est PAS sur tous les écrans** | ⛔ **Entrée › R n'en a pas** : c'est un **seuil**, pas une étape du parcours à 8 temps. **60 px récupérés.** |

### 📐 LA TABLE DES HAUTEURS — pour calculer un budget sans rien mesurer

| la bande | hauteur | d'où elle vient |
|---|---|---|
| **une rangée de jetons** | **48** | `--glisse-h` — cote écrite |
| **écart entre rangées** | **8** | la gouttière, la même qu'en largeur |
| **un collecteur** | **48** | même cote que le jeton |
| **un bouton, un étage** | **44** | 🔴 **`--touch`** — le texte n'en demande que ~33 |
| **un bouton, deux étages** | **48** *(T3)* · **56** *(T4)* | déduit du corps |
| **un `+` / `−`** | **44** de cible | le dessin est plus petit |
| 🔴 **un dropdown** | **44** | ⭐ **`--touch` aussi** — c'est un contrôle qu'on touche |
| **une zone d'écriture** | **44** | idem |
| **la ceinture d'étapes** | ≈ **60** | ⚠️ **déduite**, pas écrite — bouge avec le libellé |
| **un titre + consigne** | ≈ **40** | déduit |

⭐ **Cinq organes sur dix retombent sur 44, et ce n'est pas un hasard** : **tout ce qui se touche a
le même plancher**. ➡️ Un budget se compte donc en **multiples de 44 et 48**, et il se calcule de
tête.

⭐ **Exemple, la bande basse d'un écran d'équipement** : collecteurs 48 + écart 8 + boutons 44 =
**100 px**, toujours, quel que soit l'écran.

### ⚠️ Le dropdown : la hauteur est juste, le reste est en écart

| | la norme *(26/08)* | le code aujourd'hui |
|---|---|---|
| hauteur | 44 | ✅ `min-height: var(--touch)` sur les **deux** dropdowns existants |
| liseré | ⛔ **aucun** | 🔴 **1 px** — et `.pipeline-dropdown` porte même **`--ok`, une bordure VERTE conditionnelle**, exactement le liseré vert supprimé |
| fond | **transparence 20 %** | 🔴 **opaque** (`--surface`, `--sunken`) |
| caractères | **gras** | 🔴 `font: inherit`, pas de gras |

⏳ Trois corrections à faire quand les organes seront refaits. **La hauteur, elle, n'a pas à bouger.**

### Le budget d'une page de jetons *(les 15, en rangées de 3)*

| bande | px |
|---|---|
| ceinture d'étapes | 60 |
| titre + consigne | 40 |
| **15 jetons — 5 × 48 + 4 × 8** | **272** |
| collecteurs | 48 |
| boutons | 44 |
| 4 écarts de 8 + marge basse | 44 |
| **TOTAL** | **508 sur 553 — il reste 45** |

⭐ **3 par rangée à 360, et c'est juste** : la rangée dispose de **278**, trois jetons en prennent
**277** *(3 × 87 + 2 × 8)*. **Il reste 1 px.** ⛔ **Quatre en demanderaient 372 — impossible à la
cible.**

🔴 **⚠️ MAIS CE BUDGET NE COMPTE PAS LES CHEVRONS, et le lot A l'a mesuré le 26/08.** Dès qu'une
liste **pagine**, elle porte deux gouttières de chevron — **2 × `--touch` + 2 × `--sp-4` = 96 px**.
Il ne reste alors que **201** pour trois cases qui en demandent 277.

| la liste | ce que la rangée offre | la case rendue |
|---|---|---|
| **sans pagination** | 278 | **87** — la cote pleine |
| le **tambour** d'Équipement *(paginé)* | — | **75** *(mesuré, en production depuis le 24/08)* |
| un **vivier paginé** | 201 | 🔴 **62** |

⛔ **ET LA CASE CÈDE, ELLE NE PASSE PAS À LA LIGNE.** Sans quoi la rangée retombe à **DEUX** par
ligne — ce qui contredit *« trois colonnes, toujours »* **et rend la pagination inutile** : quinze
jetons sur deux colonnes pèsent 440 px, autant que trente-et-un sur trois.

⭐ **Une loi du souple à connaître, mesurée par le lot A** : `flex-shrink` seul **n'y suffit pas** —
*un conteneur qui enveloppe passe à la ligne AVANT de rétrécir.* Le découpage en lignes se fait sur
la taille **hypothétique** de chaque case ; le rétrécissement ne travaille que sur une ligne déjà
trop pleine. La parade est de donner à la case **un tiers de la rangée** comme base : la ligne en
contient trois **par construction**, il n'y a plus de calcul à réussir.

⏳ **CE QUE ÇA COÛTE, ET C'EST UNE DETTE OUVERTE** : à **62 px**, `ABREGE_MAX = 16` *(calibré sur
77 px utiles, §2 bis)* **ne promet plus rien** — le repli tient, mais un nom long y prend trois
lignes. ⭐ **La piste mesurée, non prise faute de mandat** : rendre la rangée **saignante**
*(`--saignee-debord`, l'idiome existe)* pour qu'elle occupe les **329** de la carte au lieu des 297
de l'item — la case remonterait à **72**, à un pixel de l'Équipement. ⛔ Ça touche la géométrie de
la dalle, pas la pagination : **décision d'Eric**. Le « mou » de 58 px que j'avais annoncé venait d'un calcul à **375**, une largeur qui
n'est pas la nôtre : **il n'existe pas.**

🔴 **45 px, c'est mince — une ligne de plus les mange**, et ⛔ **la réponse n'est JAMAIS un
défilement** *(§5)*. La réponse est : **qu'est-ce que la page porte EN TROP ?** Trois candidats
mesurés, ⏳ **aucun choisi** : le titre+consigne (40, alors que la ceinture nomme déjà l'étape) ·
la ceinture réduite aux numéros (−16) · **les collecteurs (48), qui disparaissent d'eux-mêmes sur
un écran où chaque emplacement porte un nom** *(mesuré sur Species : zéro collecteur)*.

### Le budget de **Entrée › R**

**≈ 380 sur 553 — il reste 173.** Avec la raison exigée sous chaque porte muette *(§ du cahier
de R)* : **125** dans le cas le plus étroit. ⭐ **R a de la place**, et la conclusion tient sur les
deux hauteurs.

⚠️ **Ce 380 est un PLAFOND PRUDENT, pas une mesure** : les sept blocs y sont comptés à `--touch`
44, alors que **quatre n'en sont pas** — la zone d'écriture, les deux promesses affichées, et les
trois portes, dont la forme n'est pas tranchée. **Il ne peut que descendre.**

---

## 1 quinquies. 🔴 LE TITRE EST UN NOM DE SECOURS, PAS UN NOM PAR DÉFAUT

> Eric, 2026-08-26 : *« le seuil a un titre **quand un autre objet ne le désigne pas** : exemple
> équipement, où le tambour désigne. »*

| l'écran | ce qui le nomme | titre ? |
|---|---|---|
| **Équipement › R** | 🥁 **le tambour** — il affiche le rayon et l'étagère | ⛔ **non** |
| **Entrée › R (le Seuil)** | rien | ✅ **oui** |
| une **étape du parcours** | 🎗️ **la ceinture** — elle nomme l'étape à 8 px de là | ⛔ **non** |

⭐ **La règle se lit à l'envers, et c'est ce qui la rend juste** : ⛔ **on ne nomme pas deux fois.**
Un titre posé au-dessus d'un objet qui dit déjà de quoi il s'agit **coûte 40 px pour ne rien
apprendre** — et sur une page qui ne défile pas, 40 px, c'est presque une rangée de jetons.

➡️ **Avant de poser un titre, la question est : « qu'est-ce qui nomme déjà cet écran ? »** Si
quelque chose le fait, le titre est **en trop** — au sens exact du §1 quater.

⚠️ **Et ça règle le débat « titre + consigne » du budget** : les 40 px du titre ne sont un candidat
au « en trop » que sur les écrans **où la ceinture nomme déjà l'étape**. Sur le Seuil, qui n'a pas
de ceinture, **le titre n'est pas du gras : c'est la seule chose qui dise où on est.**

---

## 1 quinquies bis. 🔴 LE CADRE D'ÉCRAN NE PORTE NI FOND, NI LISERÉ, NI REMBOURRAGE *(26/08)*

> Eric, 2026-08-26, en regardant v298 servie : **« le cadre en blanc pourquoi ? derrière la dalle
> que fait-il là ? »**

**Rien.** Il dessinait une boîte autour du vide.

| ce que `.decision-card` porte | |
|---|---|
| un **fond** | ⛔ **non** |
| un **liseré** | ⛔ **non** |
| un **rembourrage** | ⛔ **non** — c'est lui qui creusait l'écart blanc entre le contour et la dalle |
| une **marge** | ✅ **oui, elle reste** |

⭐ **La marge reste, et c'est sa phrase du 17/08** : *« sans elle, les dalles toucheraient les bords
de l'écran. **C'est la carte qui s'efface, pas ses gouttières.** »*

⛔ **UN CONTOUR EST UNE PEINTURE.** J'avais généralisé `background: none` et laissé `border` et
`padding` — sa règle du 17/08 en retirait **trois**. ⭐ Appliquer une règle à moitié donne la
confiance de l'avoir appliquée.

📏 **Mesuré après** : fond transparent · liseré 0 · rayon 0 · rembourrage 0 · marge 16 conservée ·
**écart cadre → dalle = 0 des trois côtés**.

---

## 1 sexies. ✅ LE SEUIL — sa sortie et son défilement *(tranché 26/08)*

> Eric : *« la première fenêtre qui amène sur FH Web propose d'ouvrir **une autre fenêtre** vers le
> site. **Le titre est la sortie = économie d'espace, donc OK.** Je pense que cette fenêtre doit
> être **scrollable**. »*

| | |
|---|---|
| **le cadre** | **`FS`** — plein écran, ni ceinture ni menu latéral |
| **le titre** | ✅ **il existe** *(rien d'autre ne nomme le Seuil, §1 quinquies)* |
| 🔴 **le titre EST la sortie** | il paie **une fois pour deux besoins** — ~40 px au lieu de 40 + 52 |
| 🔴 **la sortie OUVRE UNE AUTRE FENÊTRE** | ⛔ elle **ne quitte pas** le Companion |
| 🔴 **le Seuil DÉFILE** | c'est **le seul écran** dans ce cas |

⭐ **Ouvrir plutôt que quitter, c'est ce qui protège le travail en cours.** Un joueur qui va lire
une règle sur FH Web **ne perd pas** son personnage à moitié créé : il revient sur un onglet
resté vivant. ⛔ Une sortie qui navigue aurait rendu le titre dangereux au lieu d'utile.

### ✅ L'ORDRE DES BLOCS DU SEUIL — tranché 26/08, option ②

| # | le bloc | |
|---|---|---|
| — | `‹ FH Web — Player Companion` | 🔴 **collé en haut**, c'est la sortie |
| 1 | **Nom de joueur** | l'identité |
| 2 | **Connecter mon coffre** | ⭐ **l'action principale** quand il n'y a pas de coffre |
| 3 | **New character** | la porte qui marche **toujours**, même sans coffre |
| 4 | **My characters** | ⏳ porte sa raison quand rien à lire |
| 5 | **DM** | ⏳ idem |
| 6 | **Langue** · anglais | 🔽 **prévalidé** |
| 7 | **Système d'unités** · impérial | 🔽 **prévalidé** |
| — | le **`?`** | 🔴 **collé en bas à droite** |

⭐ **La lecture : je me déclare, j'entre, je me règle.**

⭐ **Et ce n'est pas un goût, c'est la règle d'Eric appliquée** : *« en bas de page, **PRÉVALIDÉS**,
pour ne pas surcharger le joueur »*. `Langue` et `Unités` ont exactement ce profil — un bon défaut,
déjà juste, qu'on ne lit que si on veut le changer. **Ils descendent.**

📌 ⛔ **`Connecter mon coffre` ne descend PAS avec eux** : sans coffre, c'est **l'action principale
de l'écran**. Ce n'est pas un réglage prévalidé, c'est la deuxième chose à faire après s'être nommé.

⚠️ **Le point faible, dit d'avance** : `New character` passe **avant** les deux portes muettes,
donc **les deux refus tombent au MILIEU de l'écran**, pas à la fin. C'est le bon sens de lecture
*(ce qui marche d'abord)*, mais ça met deux « non » en travers du chemin. ⏳ **À regarder au doigt**
avant de figer.

### 🔴 CE QUE LE DÉFILEMENT DU SEUIL IMPOSE

Le Seuil est **l'exception** à *« la page ne défile jamais »* — et il l'est parce qu'il n'est pas
une page de travail : c'est **un vestibule**, dont le contenu grandit *(des personnages, des
campagnes)* sans qu'aucun compte n'ait à se lire d'un coup d'œil.

⛔ **Mais un écran qui défile ne peut pas porter ses organes fixes dans son flux.**

| l'organe | où il doit vivre |
|---|---|
| **le titre-sortie** | 🔴 **collé en haut** — sinon on ne peut plus sortir une fois descendu |
| **le `?`** | 🔴 **collé en bas à droite** *(§7)* — un rappel qui défile n'est plus un rappel |
| tout le reste | dans le flux, il défile |

⭐ **La règle qui en sort, et elle vaut pour tout écran qui défilera un jour** : ⛔ **ce qui défile
ne porte pas les organes fixes.** Deux couches — **le flux**, et **ce qui reste**.

### ✅ LE DRESSING défile aussi *(Eric, 26/08 — « un dressing qui scrolle, des boutons fixes »)*

**`Équipement › B3`** est le **second** écran à défiler, et il applique la même loi :

| couche | ce qu'elle porte |
|---|---|
| **ce qui reste, en haut** | 🔴 **le TITRE** *(Eric : « laisse le titre dans le dressing aussi »)* |
| **le flux** | les emplacements portés, le sac, les contenants — **ça grandit avec le personnage** |
| **ce qui reste, en bas** | 🔴 **les boutons** |

⭐ **Le titre du dressing n'est PAS une exception au §1 quinquies, il l'applique** : le dressing
**n'a pas de tambour** — c'est `Équipement › R` qui le porte. **Rien ne nomme B3**, donc B3 a un
titre. La loi tient sans amendement.

⭐ **Et la forme des deux écrans qui défilent est désormais la MÊME** : titre collé en haut · flux
au milieu · contrôles collés en bas. ➡️ **Un écran qui défile a trois bandes, pas deux** — et les
deux du dehors ne bougent jamais.

⭐ **Et les deux exceptions se ressemblent, ce qui confirme la règle** : le Seuil et le dressing
sont tous deux des écrans dont **le contenu grandit sans qu'aucun compte n'ait à se lire d'un coup
d'œil**. Un vestibule, une garde-robe. ⛔ Une **liste de choix** — jetons, sorts, dons — n'est ni
l'un ni l'autre : elle **pagine** *(§5)*.

⚠️ **Ceci N'EST PAS une commande de lot** : `Équipement` est un chantier à part entière *(Eric,
26/08 : « abilities / skills / destiny / équipement / identity nécessitent un boulot à part
entière »)*. C'est **une contrainte à respecter le jour où ce chantier s'ouvrira.**

⚠️ Et le budget du Seuil *(≈380 px, §1 quater)* **cesse d'être une contrainte dure** : il devient
la hauteur du **premier écran vu**, pas celle de l'écran entier. ⏳ Ce qui doit tenir **au-dessus
de la ligne de flottaison** n'est pas tranché.

---

## 2. LES ORGANES — forme ET remplissage

> 🔴 **UN ORGANE SE RECONNAÎT À SA FORME, PAS À SA COULEUR.** C'est la loi qui gouverne toute
> cette section : la couleur peut changer *(elle porte l'état, §6)*, **la forme ne change jamais**.
> ⛔ Deux organes qui se ressemblent sont deux organes qu'on confondra.

### Les quatre du glisser *(validé 26/08 sur maquette)*

| organe | forme | remplissage | voile |
|---|---|---|---|
| **zone de drop** | rectangle **très arrondi** | **creux** : texte d'attente + liseré, aucun fond | max, voire nulle |
| **jeton** | rectangle **très arrondi** | **teinté** *(doré)* | +20 % d'accent → **68 % cumulés** *(sur une dalle à 50)* |
| **bouton** | 🔴 **OCTOGONE à coupe** | **plein, en signal** | 🔴 **100 % — OPAQUE** |
| **collecteur** | comme le jeton | 🔴 **vide : creux, tireté · REMPLI : l'habit du jeton** *(voir §2 ter)* | — |

### 🔴 2 ter — LE COLLECTEUR : LE FOND DIT CE QU'IL PORTE, LE LISERÉ DIT SON ÉTAT

> Eric, 2026-08-26 : *« rempli prend le **doré ET LE RELIEF** du jeton, juste un **liseré bleu**
> autour pour rappeler que c'est un collecteur »*, puis : *« ce même liseré peut appliquer **les
> codes couleurs qu'on connaît** »*.

| l'état | le fond | le liseré | ce qu'il DIT |
|---|---|---|---|
| **vide** | ⛔ aucun — **creux** *(`--creux`)* | ⛔ **AUCUN** — transparent *(26/08)* | 🔴 **« drop it here »**, T1, minuscules |
| **rempli, valide** | 🔴 **le doré du jeton** + **`--relief`** | 🔵 **bleu, 2 px** — *« celui-ci est bon »* | le nom de ce qui est posé |
| **mauvaise pose** | idem, le doré reste | 🔴 **rouge, 2 px** | idem |
| **tout posé** | idem | 🟢 **vert, 2 px, sur tous à la fois** | idem |

#### 🔴 « TOUT POSÉ » = **LE CHOIX EST FINI**, jamais « toutes les cases remplies » *(lot 123, 02/09)*

> Eric, 02/09 : *« SB skill budget (elestu, elf…) : le liseré autour des collecteurs ne passe pas
> de bleu à vert quand j'ai dépensé tout le budget. »*

⛔ **Les deux lectures se confondent tant qu'il y a autant de jetons que de cases, et divergent dès
qu'il y en a MOINS.** Une **bourse captive** en est la preuve : Elestu a **2 points pour TROIS
collecteurs**. Le code lisait *« toutes les cases remplies »* — donc le vert y était
**structurellement inatteignable**, sur toute bourse, pour tout personnage.
📏 **Mesuré** : `+2` sur Delve → consigne *« 2 of 2 points spent »*, `Done` du pied **vert**, et
les collecteurs `data-complet="false"` — Delve bleu `rgb(95,144,199)`, les deux autres
transparents. Deux organes du même écran répondaient à deux questions différentes.

⭐ **LA VÉRITÉ EST CELLE DU PLAN** : `answered === expected`, exactement le test que la **porte du
SB** portait déjà (`budgetDepense`, 27/08). L'écran ne juge rien de plus — il cesse de compter des
cases pour lire le seul juge.

⛔ **Trois refus survivent au vert, et chacun a payé son incident** :

| le refus | ce qu'il empêche |
|---|---|
| **dépassement** *(`answered > expected`, ou un `lock` du noyau)* | un vert sur un budget explosé — *« 3 of 2 »*, 19/08 |
| **un créneau verrouillé** | qu'un vert d'ensemble recouvre une **mauvaise pose** rouge |
| **rien d'attendu** *(`expected` nul ou absent)* | qu'un champ vide naisse vert |

📌 **Portée : TOUS les viviers du site** — la condition vit dans l'organe partagé (`glisser.mjs`),
pas dans un écran. Témoins mesurés avant/après : *Gender* (une case, un choix) reste vert · un
**vivier plein** (Languages, 2 de 2) reste vert · un budget **entamé** reste bleu · un
**dépassement** reste rouge.

---

#### ✅ TROIS PRÉCISIONS DU 26/08 — *« règle générale pour tout le site »*

> Eric : *« le collecteur doit **doubler son épaisseur** de liseré, trop fin pas assez visible »* ·
> *« on voit bien le liseré quand il est rempli, **ton pointillé sert à rien** »* ·
> *« **drop it here** en T1 dans le collecteur, ça **disparaît quand c'est rempli** »* ·
> *« en **minuscules** bien sûr »*.

**① Le liseré REMPLI vaut `--creneau-lisere-rempli` — 2 px.** À 1 px il se confondait avec le
liseré que tout organe porte, alors qu'il est **le seul trait de l'écran qui dise « cette case a
reçu quelque chose »**.
⛔ **Et 2 px est un JETON, pas un littéral** : le garde des littéraux n'excepte que le `1px` de
bordure *(l'unité minimale visible)*, et surtout une cote sans nom est introuvable le jour où elle
rebouge.
⚠️ **Ma première lecture a visé à côté** : j'avais épaissi la bordure de BASE, donc le pointillé
d'attente en même temps. Une case vide n'a rien à crier ; une case remplie, si.

**② Le pointillé d'attente a DISPARU.** La cible s'allume **au moment où on l'approche**
*(`[data-vise]`)* : un contour qui crie en permanence pour un rôle qu'il ne joue qu'à l'instant du
dépôt ajoute une boîte à un écran qui en porte déjà douze.
🔴 **MAIS LA BORDURE RESTE, EN TRANSPARENT** — c'est tout l'écart entre *retirer le dessin* et
*retirer la cote*. Un `border-style: none` ferait disparaître 2 px de chaque côté : **la case
sauterait au moment où elle se remplit**, et le geste le plus important de l'écran ferait bouger ce
qu'on vient de viser.

**③ Vide, la case DIT ce qu'elle attend.** Et ça découle du ② : tant qu'un contour tireté
l'entourait, le tiret suffisait — la BOÎTE disait *« dépose ici »*, le tiret disait *« rien
encore »*. Le contour parti, un tiret seul ne dit plus ce qu'on attend de vous.
⭐ Le mot occupe **la ligne que le tiret occupait déjà**, dans le même corps : il ne coûte rien.
⚠️ **Il s'efface au remplissage** — une consigne qui reste après avoir été suivie devient du bruit,
et pire, elle ferait douter de ce qui est posé.
📌 **Les minuscules sont garanties par la RÈGLE, pas par la source** : le nom du collecteur porte
`text-transform: uppercase` *(→ ALIGNMENT)*, la valeur porte `none`. Elle ne **peut pas** se
retrouver en capitales.

**④ Et la consigne n'a pas l'air d'une RÉPONSE** — Eric : *« de la même couleur qu'Alignment, et en
italique »*. C'est ce qui manquait à *« drop it here »* : posé dans la case, au même corps et à la
même couleur qu'un nom choisi, il se lisait comme une réponse — **comme si le personnage
s'appelait « drop it here »**. Deux signaux le rangent du bon côté :

| signal | ce qu'il dit |
|---|---|
| la **couleur du LIBELLÉ** *(`--text-muted`, celle d'« ALIGNMENT »)* | *« je suis de la famille des étiquettes »* |
| l'**italique** | *« je ne suis pas une donnée »* |

⛔ **Et seulement quand la case est vide** *(`[data-rempli="false"]`)* : une réponse posée reprend le
plein et le droit. Sinon on aurait remplacé une ambiguïté par une autre, dans l'autre sens.
📏 **Mesuré** : vide → `rgb(146,140,127)` italique, **identique au libellé au pixel de couleur
près** · rempli → `rgb(216,211,201)` droit.

📏 **Mesuré à 375 × 553, un collecteur rempli et un vide côte à côte** : `2px solid rgb(70,157,106)`
contre `2px solid transparent`, **tous deux 87 × 48** — aucun saut ; *« drop it here »* à 10 px sur
une ligne, sans débord.

⭐⭐ **DEUX CANAUX, DEUX MESSAGES, ET C'EST LA TROUVAILLE** : le **REMPLISSAGE** dit *« je porte un
jeton »* · le **LISERÉ** dit *« je suis un collecteur, et voilà mon état »*.

⛔ **CE QUE ÇA RÉPARE, ET C'ÉTAIT MESURABLE** : avant le 26/08, l'état peignait le FOND — un
créneau invalide effaçait le doré sous un lavis rouge. **Le joueur perdait l'information « il y a un
objet là-dedans » au moment précis où il en a le plus besoin pour le retirer.**

⭐ **L'échelle du 19/08 n'est pas perdue, elle a déménagé sur le bord** — *« une pose valide =
récepteur BLEU, une mauvaise pose = ROUGE, toutes les poses valides = tous VERTS »*. Les trois
teintes tiennent, et la raison d'Eric tient avec elles : *« un vert posé dès le premier dépôt ne
laisse plus rien à dire quand tout est fini — il dépense la récompense trop tôt. »*

📏 **MESURÉ AU PIXEL, parce qu'Eric a demandé si le liseré RECOUVRE** *(sonde horizontale traversant
le bord, jour)* : fond de page · **1 SEUL pixel de liseré** · une transition · **le doré, stable**.
➡️ **Il entoure, il ne recouvre pas.** Rien du jeton n'est mangé.

🔴 **ET LE RELIEF REMPLACE LE CREUX, il ne s'y ajoute pas** : un creux dit *« pose ici »*, un relief
dit *« quelque chose est posé »*. Les garder tous les deux ferait un organe qui demande et qui a
reçu en même temps.

⚠️ **CE QUI RESTE VRAI DE LA COTE** : le collecteur de l'Équipement *(`.carte-r-collecteur`)* garde
sa hauteur `--touch` **44** et non `--glisse-h` 48 — *« un collecteur n'est pas un jeton qu'on
glisse, c'est une cible qu'on VISE, et son plancher est le pouce »*. ⛔ Le doré du rempli ne change
pas cette cote.

---

### 🔴 LES AUTRES ORGANES — le registre complet *(Eric, 26/08 : « rajoute le voyant et le on/off »)*

| organe | forme | ce qui le distingue | où il est décrit |
|---|---|---|---|
| **l'INTERRUPTEUR — sélecteur exclusif** | une **piste + un pouce**, DESSINÉS | ⛔ **AUCUNE COULEUR** — la **position du pouce** et l'**encre pleine** | §6, *« deux espèces d'interrupteur »* |
| **l'INTERRUPTEUR — bascule simple** | idem | idem | §6 |
| 🔴 **le VOYANT D'AVANCEMENT** | un **disque** portant un chiffre | ⛔ **NON CLIQUABLE** · un **anneau** = en cours, un **disque PLEIN** = fait | §6, *« le voyant est le cran de la ceinture »* |
| **le CHEVRON** | une **barrette** | il **s'efface, mais sa zone reste** | §6 |
| **le DROPDOWN** *(de choix · directionnel)* | rectangle **très large, peu haut** | ⛔ **aucun liseré** · voile 20 % · gras | §8 |
| **la ZONE D'ÉCRITURE** | libre | ✅ rien à normer, elle est bien par défaut | §8 |
| **le POPUP** *(guide · aiguilleur · gendarme)* | une bulle ancrée en bas | **la teinte dit le rôle** — parchemin · bleu · rouge | §7 |
| **le `?`** | petit et discret | **collé en bas à droite** de la rangée | §7 |
| 🔴 **le LIVRE** *(organe neuf, 26/08)* | un **rond DESSINÉ** — cercle 28 px, un livre à couverture et **dos** | **collé en bas à gauche**, la jumelle du `?` | §7 bis |

⭐ **Deux d'entre eux ne portent AUCUNE couleur de l'échelle, et c'est délibéré** : l'interrupteur
*(il porte un ÉTAT qui demeure, pas une action qui avance)* et le guide *(il est optionnel, donc il
ne signale rien)*. ➡️ **Un organe qui n'emprunte pas à l'échelle ne peut pas la contredire.**

⚠️ **Et deux d'entre eux ne se touchent pas** : le **voyant** *(non cliquable)* et le **popup**
*(il parle, on ne l'appuie pas)*. ⛔ Ne pas leur donner l'apparence d'un contrôle.

⭐ **La coupe d'angle appartient au bouton SEUL.** C'est ce qui interdit de le confondre avec un
jeton, quelle que soit la couleur.

### 🔴 LES QUATRE PANS COUPÉS PORTENT L'ARÊTE — rouvert et tranché 02/09

> Eric, 2026-09-02 : **« le relief est mal fait, tous les boutons octogonaux ont ce problème »**.

La décision du 26/08 *(pans nus acceptés)* est rouverte par Eric lui-même. La mesure nouvelle montre
que quatre bandes droites dessinent un rectangle dans l'octogone : le trait du haut s'arrête avant
les pans, et l'objet se lit comme un aplat portant une ombre plutôt que comme un bouton bombé.

| | |
|---|---|
| **les huit côtés** | portent une arête continue, diagonales comprises |
| **le haut** | est au moins aussi marqué que le bas — la lumière vient d'en haut |
| **la projection de jour** | reste une ombre, mais ne domine plus le biseau |
| **la projection de nuit** | reste une lueur blanche |

⭐ **Le médium change, pas la forme** : un premier octogone peint l'arête ; un second, en retrait,
repeint la face bombée. Le ruban visible entre les deux suit mécaniquement les huit côtés. La coupe
extérieure reste `--bouton-coupe` **10**, les cotes et l'opacité ne bougent pas.

🔴 **Le liseré d'une zone de drop porte la couleur du corps du jeton attendu** — la cible annonce
ce qu'elle accepte avant qu'on lâche.

### Combien de modèles *(26/08)*

**bouton = 3 couleurs · jeton = UN SEUL modèle · collecteur = UN SEUL modèle.**
⭐ La variété vit dans les **boutons**, pas dans les jetons.

---

## 2 bis. ✅ LE JETON AUJOURD'HUI : LA COULEUR DE BASE ET LE RELIEF — RIEN D'AUTRE

> Eric, 2026-08-26, sur les variantes, l'échelle de valeur du liseré et ce que porte le fond :
> **« on ne fait rien pour le moment, juste la couleur de base et le relief »**.

### 🔴 ⛔ IL N'Y A PAS DE VARIANTES DE JETON — tranché 26/08

> Eric, 2026-08-26 : **« il n'y a pas de variantes de jetons (juste une exception : les jetons
> craft) »**.

⭐⭐ **C'EST LA DÉCISION QUI FERME LE PLUS GROS NŒUD DE LA NOMENCLATURE.** Quatre points y étaient
ouverts depuis des jours — *les variantes feat/feature/trait/training · la « légère variante » entre
elles · l'échelle de valeur du liseré d'équipement · ce que porte le fond*. **Ils tombent tous
ensemble, parce qu'il n'y a rien à distinguer.**

| | |
|---|---|
| 🔴 **UN SEUL MODÈLE DE JETON** | le doré, le relief, T1. **Point.** |
| ⛔ **pas de liseré par famille** | feat, feature, trait, training, skill, tool, équipement : **le même jeton** |
| ⛔ **pas d'échelle de valeur** sur le liseré d'équipement | un objet rare n'a pas un bord différent |
| ⛔ **le fond ne code rien** | il est la matière du jeton, pas un message |
| ✅ **UNE seule exception** | les **jetons CRAFT** — ⏳ leur forme n'est pas décrite |

⭐ **Et ça confirme ce que §2 disait déjà sans oser en tirer la conséquence** : *« bouton = 3
couleurs · **jeton = UN SEUL modèle** · collecteur = UN SEUL modèle »*. La ligne existait ; c'est la
liste des « variantes à trancher » juste en dessous qui la contredisait.

⚠️ **Ce qui reste vraiment ouvert sur le jeton** : le **standard d'abréviations** *(le SEUIL vaut 16,
c'est le vocabulaire des abrégés qui manque)* et la **forme du jeton craft**.

---

| ✅ ce qu'on construit **maintenant** | ⏳ ce qui attend |
|---|---|
| **la couleur de base** *(le doré)* | ⛔ **plus rien sur les variantes — il n'y en a pas** |
| **le relief** | le **standard d'abréviations** *(le seuil est tranché, pas le vocabulaire)* |
| **le texte : 🔴 T1** *(ci-dessous)* | la **forme du jeton CRAFT**, la seule exception |

⭐⭐ **Cohérent avec ce qu'il avait déjà dit** : *« dès qu'on a un jeton, on peut déjà faire cela »*.
**Le jeton unique se construit d'abord ; tout le reste se pose PAR-DESSUS sans le redessiner.**
⛔ Attendre d'avoir tranché les variantes pour dessiner le jeton serait attendre pour rien.

📌 ⛔ **Ce n'est pas de la dette, c'est une séquence.** La couleur de base et le relief sont ce dont
**tous** les jetons auront besoin, quelle que soit leur famille — les construire maintenant
**n'engage aucun choix futur**.

### ✅ LE CORPS DU JETON EST **T1** — tranché 26/08, appliqué le 26/08

> Eric, 2026-08-26, à la question *« T1 ou T2 dans le jeton ? »* : **« 13 T1 on aura moins
> d'enmerdes on jugera apres coup »**. *(Le « 13 » était le numéro de la question dans une liste,
> pas une section — ⛔ un ancien renvoi « §13 » de ce fichier ne pointait nulle part.)*

| | |
|---|---|
| **le corps** | 🔴 **`--t1` = 10 px** sur le **libellé du jeton**, et sur lui seul |
| **où il est écrit** | `.choix-glisse .glisse-jeton` **et** `.glisse-jeton` nue — **les deux** |
| **le garde** | `tests/jeton-corps.test.mjs` |

⭐ **SA RAISON EST LE MOINDRE REGRET, et c'est ce qui la rend solide** : à T1 tout rentre, donc
**aucun nom ne force à inventer une abréviation aujourd'hui** ; si c'est trop petit au doigt, ça se
verra et on remontera d'un barreau. L'inverse — T2, puis trente noms qui débordent — coûterait un
**standard d'abréviations écrit dans l'urgence**. ⏳ *« On jugera après coup »* : le doigt tranchera.

📏 **MESURÉ AU NAVIGATEUR, dans la case réelle** *(87 px, dont **77** utiles : 87 − 8 de rembourrage
− 2 de liseré)* :

| le mot | car. | à T2 | à T1 |
|---|---|---|---|
| **`Prestidigitation`** — le mot-témoin de la dérivation du 19/08 | 16 | 85 px ⛔ | 🔴 **73 px ✅ entier** |
| `caractéristique` | 15 | 85 px ⛔ | 72 px ✅ |
| `Invulnerability` | 15 | 79 px ⛔ | 67 px ✅ |
| `supplémentaires` | 15 | 94 px ⛔ | 80 px ⛔ |

⭐⭐ **Et le compte du corpus dit qu'il avait raison** *(3 831 mots distincts des couches)* : le seuil
d'abréviation à T2 coupait **435** mots ; redérivé à T1 il en coupe **3**, et **zéro en anglais** —
la langue par défaut du Seuil.

🔴 **DEUX PIÈGES MESURÉS, à ne pas repayer :**

| | |
|---|---|
| ⛔ **la règle nue ne dit pas le corps rendu** | `.choix-glisse .glisse-jeton` **(0,0,2,0)** bat `.glisse-jeton` **(0,0,1,0)**. Le jeton rendait **12 px** pendant que sa règle nue en annonçait 14 — §0 « Google Headless », le même piège que le rayon de 4 px du lignage |
| ⛔ **un compte de caractères n'est pas une largeur** | `supplémentaires` fait **15** car. et **80** px — il sort ; `Prestidigitation` en fait **16** et **73** — il tient. **Aucun seuil en caractères ne sépare ces deux-là** ; le repli (`overflow-wrap: break-word`) rattrape le cas, la case garde ses 48 px |

### ✅ LA CASE DE LA GRILLE **EST** UN JETON — tranché 26/08

> Eric, 2026-08-26 : **« c'est un jeton — aligne-la sur T1 »**.

`.grille-jeton`, la case du tambour d'Équipement, portait `--t2` et n'avait **jamais** été tranchée.
Elle porte **`--t1`**, comme tout jeton.

⛔ **ET J'AVAIS SOUTENU L'INVERSE, À TORT.** J'avais arrêté un lot en écrivant *« un organe qu'on
GLISSE et un objet de PAGINATION ne sont pas la même chose »*. La feuille disait déjà le contraire,
vingt lignes plus bas : `.carte-r .grille-jeton { touch-action: none }` — et son propre commentaire
l'écrit : *« `.grille-jeton` n'était pas glissable avant R1 »*. **Elle se glisse. C'est un jeton.**

📌 **La leçon** : j'ai tiré une distinction d'un RAISONNEMENT sur les gestes au lieu de lire ce que
le code FAIT du geste. ⛔ Un nom qu'on croit menteur mérite qu'on vérifie l'objet d'abord.

⏳ **CE QUI RESTE DIFFÉRENT, mesuré et NON tranché** : la case porte encore `--radius-sm` *(le jeton
a `--organe-rayon`)*, `--surface` opaque *(le jeton a `--jeton-teinte`)* et **aucun `--relief`**.
Eric a tranché **le CORPS**, pas l'habit complet. ⛔ Ne pas aligner le reste sans lui.

---

### ✅ LA TAILLE STANDARD — **le token ET son collecteur**, ratifié 26/08

> Eric, 2026-08-26, en quatre messages successifs :
> **« les +1 / +2 / +x sont des tokens »** · **« on va les appeler des BONUS TOKENS, taille
> standard »** · **« tous les tokens et leurs collecteurs, taille standard »** ·
> **« Identity : taille token = taille collecteur ! »**

**La cote standard est `--glisse-case` × `--glisse-h` — aujourd'hui 87 × 48 px.** Elle vaut pour
**tout token** et pour **tout collecteur**, sur les huit étapes.

🔴 **ET LES DEUX LISENT LE MÊME JETON DE MESURE, PAS DEUX NOMBRES ÉGAUX.** C'est la seule forme qui
tienne : deux nombres égaux divergent au premier qui bouge, et personne ne voit le jour où ils l'ont
fait. La feuille les habille par **une règle qui les nomme tous les deux** :

```css
.choix-glisse .glisse-vivier > li,
.choix-glisse .glisse-creneaux:not(.ability-creneaux) > .glisse-creneau {
  flex: 0 0 var(--glisse-case);
  max-width: var(--glisse-case);
}
```

📌 **Vocabulaire** : un **bonus token** est un token qui porte une valeur à poser (`+1`, `+2`, `+x`)
au lieu d'un nom. ⛔ **Ce n'est pas une variante de jeton** *(il n'y en a pas — voir plus haut)* :
c'est un jeton ordinaire dont le libellé est un nombre.

---

### 🔒 LES JETONS ET LES BOUTONS SONT **SACRÉS** — 26/08

> Eric, 2026-08-26, au milieu d'une chasse aux pixels : **« les jetons et les boutons
> sont sacrés »** · **« on les laisse en paix »**.

🔴 **C'EST UNE LOI DE DERNIER RECOURS, ET ELLE SE DÉCLENCHE EXACTEMENT QUAND ON EN A
BESOIN** : le jour où un écran ne tient pas, le gabarit d'un jeton est ce qu'il y a de
plus tentant à rogner — il est gros, il est répété, et deux pixels de moins ne se
voient pas *sur une case*. Ils se voient sur toutes.

| ce qui est sacré | ce qui ne l'est pas |
|---|---|
| la cote du jeton — **87 × 48** | les **écarts** entre les blocs |
| le **corps** du jeton — **T1** | le corps des **titres** |
| la cible tactile d'un bouton — **44** | les **marges** d'un champ |
| le gabarit d'un bouton libellé | les gouttières d'une rangée |

⭐ **ET LA RAISON EST MESURABLE, PAS SENTIMENTALE** : un jeton porte un mot qui doit
rester lisible et une cible que le pouce doit atteindre ; un écart ne porte rien. **Quand
un écran déborde, ce sont les VIDES qui doivent céder, jamais les ORGANES.**

📏 **Éprouvé le 26/08 sur Identity, du dépassement à l'ajustement exact** — 78 px de
trop au départ, **0** à l'arrivée, sans qu'un seul jeton ni un seul bouton bouge :

| ce qui a cédé | rendu |
|---|---|
| marges entre champs *(16 → 8 → 4)* | 24 |
| `Name` passé dans l'encart d'écriture | 21 |
| quatre écarts à −4 *(belt, Gender ×2, rangée)* | 16 |
| titres descendus d'un T *(t3 → t2)* | ~6 |
| écarts internes d'un choix *(12 → 8)* | 16 |

⛔ **CE QU'ON A REFUSÉ EN CHEMIN, ET QUI AURAIT « MARCHÉ »** : descendre le corps du
jeton d'un cran. Ça n'aurait d'ailleurs rien rendu — **la case mesure 48 px par
GABARIT, quel que soit le corps qu'elle porte**. La tentation était donc doublement
mauvaise : elle brisait une norme, et elle ne payait pas.

---

### ⚖️ LES EXCEPTIONS EXISTENT, ET ELLES S'ARGUMENTENT — 26/08

> Eric, 2026-08-26 : **« il y aura des exceptions pour tokens et collecteurs, mais ils doivent être
> argumentés. Notamment pour les augmentations des caractéristiques, ou les ability rolls. »**

C'est la même loi que partout ailleurs dans ce document : *« les normes peuvent avoir des
exceptions, elles sont argumentées »*. Une exception se pose **à côté de son argument**, dans la
feuille, à l'endroit où elle s'écrit — jamais dans un addendum, jamais en silence.

| Exception nommée par Eric | Pourquoi elle a de quoi s'argumenter |
|---|---|
| **les augmentations de caractéristique** | six collecteurs sur une ligne, un par caractéristique — leur nombre est dicté par la fiche, pas par la mise en page |
| **les ability rolls** | l'objet qu'on prend est un **dé**, pas un jeton : il porte `fs-de` et non `glisse-jeton`, et sa forme dit qu'il a été **jeté** |

⛔ **CE QUE « ARGUMENTÉE » VEUT DIRE, ET CE QU'ELLE NE VEUT PAS DIRE.** Une exception argumentée dit
**ce qu'elle retire et pourquoi ce retrait est juste ICI**. Exemple en place, `.ability-collecteur >
.sortie` : elle réserve `--touch` (44) là où le site réserve 52, **parce que la gouttière de 16 est
déjà portée par sa dalle** — la réserve tactile, elle, est intacte. ⛔ Une exception qui dit
seulement *« ici c'est différent »* n'est pas argumentée, c'est un écart.

---

### ✅ TROIS MAX POUR UNE **SÉLECTION** — les collecteurs, eux, sont libres *(26/08)*

> Eric, 2026-08-26, la mesure sous les yeux : **« oui, 4 collecteurs à côté sur une ligne on peut ;
> mais pas une SÉLECTION de 4 tokens, là c'est 3 max »**.

| Objet | Loi |
|---|---|
| **le vivier** *(`.glisse-vivier`)* — ce qui **propose** | **trois colonnes, toujours**, à toute largeur |
| **la rangée de collecteurs** *(`.glisse-creneaux`)* — ce qui **reçoit** | **libre** : son nombre est dicté par ce que l'étape demande |

🔴 **ET C'EST LA RANGÉE QU'ON BORNE, PAS LA CASE.** Le gabarit du token ne se négocie pas, donc la
rangée vaut `3 × --glisse-case + 2 × --sp-8` = 277 px, `margin-inline: auto`. Bornée là, elle en
contient trois et coupe à la quatrième — à 360 comme à 1600, **sans qu'aucun calcul n'ait à
réussir**.

⛔ **LA FORME QUI NE MARCHE PAS, ET QUI A ÉTÉ DÉPLOYÉE UNE JOURNÉE** *(v311, 26/08)* : donner à la
case `flex: 0 1 calc((100% − 2 gouttières) / 3)`. Un vivier n'a pas de largeur imposée — il se
mesure sur son contenu. Une base en **pourcentage** y est donc **circulaire** (la case veut un tiers
du vivier, le vivier veut la somme des cases), le navigateur tranche par le contenu, et comme la
base autorisait de **rétrécir**, les bonus tokens `+1` et `+2` d'*Ability boosts* sont tombés à
**12 × 48 px**.

⚠️ **ET ELLE PASSAIT SIX MESURES JUSTES** : Lineage à 360, 372, 467, 900, 1100 et 1600 rendait
`[3,3,3,3]` partout. Six largeurs, **un seul témoin** — un vivier PLEIN, dont les douze cases se
soutiennent. Le cas qui casse est le vivier **presque vide** : deux cases, rien pour les tenir.
📌 **La leçon, et elle vaut au-delà de ce cas : le NOMBRE de mesures ne rachète pas un témoin
unique.** Six mesures sur le même objet restent une mesure.

---

### ✅ LE SEUIL D'ABRÉVIATION SUIT LE CORPS — **16**, ratifié 26/08

> Eric, 2026-08-26, les deux options chiffrées devant lui : **« 16 — garde ce que tu as fait »**.

`ABREGE_MAX` valait **10**, déduit de `--t2`. Le corps est passé à T1, donc le seuil devait suivre :
garder une conséquence après avoir retiré sa cause, c'est laisser le code mentir.

| le seuil | ce qu'il fait au mot-témoin | mots abrégés sur les 3 831 du corpus |
|---|---|---|
| 🔴 **16** *(retenu)* | `Prestidigitation` reste **ENTIER** | **3**, tous français — **zéro en anglais** |
| 15 *(la méthode du 19/08)* | `Prestidigitation` → `Prestidigit.` | 11 |

⭐ **Pourquoi la méthode a été écartée, et Eric l'a confirmé** : le 19/08 prenait *« un cran sous le
dernier qui passe »*, ce qui donnerait 15. Mais **15 abrégerait le mot-témoin lui-même** — celui qui
a servi à justifier tout le passage à T1. Le seuil aurait annulé le bénéfice qu'il était censé
servir.

🔴 **ET LA LIMITE DE LA MÉTHODE, MESURÉE** : *un compte de caractères n'est pas une largeur.*
« supplémentaires » fait **15** caractères et **80** px — il sort ; « Prestidigitation » en fait
**16** et **73** — il tient. ⛔ **Aucun seuil en caractères ne sépare ces deux-là.** Le repli
(`overflow-wrap: break-word`) rattrape le cas et la case garde ses 48 px.

⚠️ **CE QUE CE PARAGRAPHE RÉPARE, ET IL FAUT LE DIRE** : la décision du 26/08 n'avait **jamais été
écrite ici** — elle n'apparaissait que dans un mot d'une case de tableau, derrière un renvoi mort.
Le vault la listait encore comme **ouverte**. ⭐ *Une norme qui ne vit que dans un document n'existe
pas* — celle-ci ne vivait même pas là.

---

## 3. 🔴 LE BOUTON EST OPAQUE — mesuré, pas préféré

| le bouton sur une dalle *(mesuré à 35 %, avant la norme du 26/08 — ⏳ à remesurer sur 50)* | cumulé | étiquette jour | étiquette nuit |
|---|---|---|---|
| **opaque** | 100 % | **6,07–6,13** ✓ | **5,59–5,61** ✓ |
| voilé à 50 % | 68 % | 3,63 ✗ | 3,00 ✗ |
| voilé à 35 % | 58 % | 3,12 ✗ | **2,47** ✗ |

⭐ Et la raison non chiffrable : **un signal qui se voile cesse d'être un signal**. Le rouge voilé
à 35 % rend `#74493b` de nuit — un brun.

⛔ **Un bouton ne porte JAMAIS l'habit d'une dalle** — c'est ce qui les rendait anonymes.

✅ **LA DETTE EST PAYÉE — remesurée le 2026-08-26.** Cette ligne annonçait que `.species-done`
portait encore `--dalle-inter`. **C'est faux** : il porte `--bouton-fond: var(--text-muted)` et le
patron octogone à deux étages, exactement comme `.parcours-item-porte` et `.parcours-pied button`.
⭐ **Une dette recopiée n'est pas une dette vérifiée** — celle-ci a survécu à sa propre réparation
parce que personne n'avait refait la mesure.

### ✅ L'OMBRE DU BOUTON DEVIENT UNE LUEUR LA NUIT — tranché 26/08

> Eric, 2026-08-26, la mesure posée devant lui : **« une lueur claire la nuit »**.

| | le fond | sous le bord bas | l'écart |
|---|---|---|---|
| **jour** *(ombre noire, inchangée)* | 243,1 | 197,3 | **Δ 45,8** ✅ |
| **nuit** *(avant)* | 18,1 | 15,2 | **Δ 2,9** ⛔ — absente, pas discrète |
| **nuit** *(la lueur, blanc 22 %)* | 18,1 | **50,9** | **Δ 32,8** ✅ |

⭐⭐ **LA RAISON EST PHYSIQUE, PAS DÉCORATIVE, ET C'EST CE QUI LA REND NON NÉGOCIABLE** : un objet
posé sur une surface **claire** se détache par l'ombre qu'il projette ; sur une surface **sombre**,
par la lumière qu'il renvoie. Le jour il reste **45 points de marge** sous le fond ; la nuit il n'en
reste que **18 avant le noir absolu**, et une ombre à 30 % n'en prend que 3. **C'est le fond qui
décide de la direction.**

⛔ **Ne pas remonter l'alpha du noir « pour compenser »** : il n'y a rien à compenser, la marge
n'existe pas.

📌 **Le dépôt le faisait déjà à moitié** : `--verre-lisere` vaut 55 % de blanc le jour et 14 % la
nuit — même teinte, deux forces, parce que la marge n'est pas la même. Ici on va un cran plus loin :
⭐ **ce n'est pas la force qui change, c'est le SENS.**

---

## 4. LES VOILES — et la loi qui les gouverne

> 🔴 **LA NORME DU SITE, RATIFIÉE LE 2026-08-26 devant la page déployée** — Eric, après avoir
> regardé v299 : *« voilà c'est ça la norme du site en terme de transparence : **50 %** (c'est pas
> 35 %) »*.

| étage | voile |
|---|---|
| **le FOND** *(`.decision-card`, le cadre de l'écran)* | 🔴 **AUCUN** — ni couleur, ni liseré, ni rembourrage. Il ne garde que sa **marge** |
| **la DALLE** | 🔴 **50 %** — *« c'est ça la norme du site »* |
| **35 %** | ⏳ **le barreau des petits blocs INTÉRIEURS** *(mesuré : `ability-methodes`, `card-reveal`, `card-action`, `inheritance-panel`)* |
| **100 %** | le **bouton**, et lui seul |

### 🔴 UNE RÈGLE ÉCRITE PAR **RESSEMBLANCE** DOIT NOMMER SA SOURCE, JAMAIS RECOPIER SA VALEUR

> Eric, 2026-08-26 : **« Identity n'a pas sa transparence ni ses boutons »**.

`.concept-step { background: var(--surface) }` — Identity était **opaque**, seule des huit étapes.
⭐ **ET CETTE RÈGLE N'ÉTAIT PAS FAUSSE LE JOUR OÙ ELLE A ÉTÉ ÉCRITE, C'EST TOUT LE PIÈGE.** Le
20/08, Eric demandait *« mets-moi Identity à la **même transparence que les autres** »* — et
« les autres » étaient alors des `dalle-majeure` **opaques**. La règle disait donc « comme les
autres » en écrivant `--surface`.

🔴 **Depuis la v298, « les autres » sont à 50 %.** La règle a continué de dire la même chose pendant
que **son référent bougeait** : elle rendait Identity opaque au nom d'une ressemblance qui n'existait
plus. ⛔ **`background: var(--surface)` ne dit pas « comme les autres » — il dit « opaque »**, et
personne ne voit la différence tant que les autres ne bougent pas.

📌 **La parade est de ne rien écrire du tout.** Identity porte déjà `dalle-intermediaire` dans le
DOM : c'est **elle** qui décide, et elle suit le site sans qu'on y revienne.

⚠️ **ET J'AI REFAIT LA MÊME FAUTE TROIS MINUTES PLUS TARD**, sur la colonne du `?` de la même
étape : j'y recopiais `calc(--sp-16 + --touch)`, si bien qu'Identity réservait **60 px** là où
Destiny et Skills en réservent **52** *(la grandeur étroite — un `[data-grandeur]`
depuis le 30/08, plus un `@media`)*. La réserve n'est pas une constante.
**Même parade, même forme : ne rien écrire, et laisser `padding-right` retomber sur `.sortie`.**

---

⭐⭐ **ET ÇA N'INVENTE RIEN : C'EST SA RÈGLE DU 17/08, ÉTENDUE.** Elle vivait déjà dans
`shell.css`, en **exception** pour trois écrans :

> *« la carte est une `dalle-majeure` OPAQUE ; tant qu'elle peint, aucun voile posé sur son contenu
> ne se voit. **La carte s'efface, l'écran devient la dalle.** »*

Trois écrans avaient l'exception *(Abilities, Universe, Concept)*. **Tous l'ont depuis v299.**

🔴 **POURQUOI 50 ET PAS 35, ET C'EST MESURÉ, PAS UN GOÛT** : la **fiche d'espèce** — la carte que le
joueur regarde le plus longtemps — porte **50 %** depuis toujours. Eric l'a désignée en disant
*« on part de ça, état actuel »*. ⛔ Le document affirmait *« 50 % → aucun organe aujourd'hui »* :
**c'était faux**, et c'est le document qui a été corrigé, pas la fiche.

📌 **La leçon de forme, parce qu'elle s'est payée deux fois dans la même heure** : j'ai commencé par
faire descendre la fiche à 35 **au motif que ce paragraphe l'exigeait**. ⛔ **Corriger l'objet
d'après le document, c'est prendre le document pour la mesure.** L'objet est là depuis des semaines,
Eric le regarde tous les jours ; le paragraphe, lui, n'avait jamais été remesuré.

⚠️ **CE QUE 35 EST DEVENU** — il n'est ni mort ni « gardé au cas où » : c'est le voile des **petits
blocs posés DANS une dalle**. Quatre le portent aujourd'hui, comptés dans `ui/`. Un bloc intérieur
plus léger que sa dalle se lit comme un creux ; l'inverse ferait une tache.

🔴 **LES ALPHAS S'ADDITIONNENT : 35 % dans 35 % rend 57,7 %.**
➡️ ⛔ **Jamais deux voiles empilés** → **pas de conteneur d'écran, des dalles autonomes.**

⚠️ Le jeton n'est sur aucun des trois barreaux : il **ajoute 20 % d'accent** à sa dalle (48 %
cumulés). ⛔ 48 % **n'est pas** le barreau « 50 » — deux mécaniques différentes.

✅ Déjà câblé : `--voile-simple/inter/majeure` dans `tokens.css`, dalles **calculées** par
`color-mix`, gardées par `tests/decor.test.mjs` (la valeur **et** l'absence de littéral).
**C'est le modèle à copier pour toute nouvelle norme.**

---

## 5. LES LISTES

| | |
|---|---|
| **15 jetons par page** *(défaut)* | en **rangées de 3** |
| **set incomplet** | on **centre** le dernier ou les deux derniers |
| ⛔ | la grille **ne s'étire pas, ne se recompose pas** pour combler le vide |
| **la page ne défile pas** | ce qui ne tient pas passe à la page suivante |
| **navigation** | **chevrons latéraux**, jusqu'au bout du contenant |
| **sous la liste** | les **collecteurs**, puis **encore dessous** les boutons |
| **cible** | tout tient sur un **iPhone SE** |

### 🔴 SA PORTÉE : LE SITE ENTIER — et elle n'est appliquée que dans UN chapitre

> Eric, **2026-08-23** : *« il faudra normaliser **l'ensemble du site** sur 15 items glissables max
> … donc pour la liste des sorts niveau 1 on fera ça, pour les maîtrises idem »*.
> Le vault le grave en tête de `FHPCv2 norme des listes` : *« Ce n'est pas une règle de l'écran
> Équipement. **C'est une règle du produit entier.** »*

✅ **PORTÉE AUX VIVIERS LE 26/08 AU SOIR (lot A).** L'organe unique `renderChoixGlisses`
*(`glisser.mjs`)* pagine désormais **tous** les viviers de choix — Species, Class, Inheritance,
Identity — plus un cinquième appelant que le mandat n'avait pas vu, `renderLanguesGlisse`.
⭐ **Un seul endroit, pas quatre** : les écrans ne fabriquent pas leur vivier, ils remettent un plan
à l'organe. Paginer chez eux aurait fait quatre copies de la même arithmétique — exactement ce que
`tests/listes.test.mjs` existe pour empêcher.
📏 Mesuré au rendu *(360 × 553)* : `Prepared spells` passe de **31 jetons** et un débord de 571 px à
**15 jetons**, 3 pages *(15/15/1)*, le compte **31** sous le chevron gauche et **1/3** sous le droit,
la page **boucle**, et elle **survit au rafraîchissement**. Les sept viviers courts n'ont pas bougé
d'un pixel.

⚖️ **UN CHOIX QUE LE LOT A PRIS, ET QU'UN MOT D'ERIC RENVERSE** : les chevrons **disparaissent quand
il n'y a qu'une page**. §5 ne le disait pas. Sans ça, sept viviers sur neuf perdaient **96 px** pour
deux flèches mortes.

📏 **L'ÉTAT D'AVANT, gardé pour mémoire :** `LISTE_PAR_PAGE` et `pageDeListe` sont au
socle, mais seuls `equipment-step.mjs` et `equipement-pipeline.mjs` les appellent. Partout ailleurs
`.glisse-vivier` est un `flex-wrap` **sans aucune pagination** : la dalle grandit sans fin.
⚠️ Et le *« 3 par rangée »* qu'on y observe est un **accident d'arithmétique**, pas une règle :
3 × 87 + 2 × 8 = **277** pour une rangée de 278. Le quatrième ne rentre pas, voilà tout.

⏳ **Ce qui reste à faire est donc un LOT, pas une décision** : porter la pagination aux huit autres
listes *(sorts niveau 1 : 4 pages · outils : 2 · dons : 2 · compétences : 2 · arcanes : 2 —
et quatre listes tiennent déjà sur une page)*.

### ⚠️ LE 15 VIT À DEUX ENDROITS, ET C'EST UNE DETTE MESURÉE

| où | ce qui est écrit |
|---|---|
| `ui/builder/normes.mjs` | `LISTE_PAR_PAGE = 15` — gardé par `tests/listes.test.mjs` |
| `ui/builder/shell.css` | `grid-template-rows: repeat(**5**, var(--fhpc-case-h))` |

⛔ **Changer l'un sans l'autre casse la grille en silence** : le JS servirait 12 objets dans une
grille qui en réserve 15, ou l'inverse. ⏳ Aucun garde ne les tient d'accord.

### ⏳ CE QUI N'EST TOUJOURS PAS TRANCHÉ

| | |
|---|---|
| **les 127 objets merveilleux = 9 pages** | le vault : *« ce n'est pas un défaut de la norme, c'est le signe que **cette étagère est trop grosse** »* — elle appelle un niveau de rangement de plus |

✅ **Et DEUX points se sont refermés le 26/08** : *« ce que devient un jeton trop long pour sa
case »* — `ABREGE_MAX = 16` *(§2 bis)* — et les flèches à une seule page, juste ci-dessous.

---

### ✅ UNE SEULE PAGE N'A PAS DE FLÈCHES — tranché 26/08

> Eric, 2026-08-26 : **« quand il y a 3 tokens, on n'affiche que 3 tokens, pas besoin de flèches
> ni de titre s'il est déjà présent »**.

⭐ **Ce point était en attente depuis le lot A**, qui avait pris le choix sobre **en le disant** :
*« 🔴 un mot d'Eric le renverse »*. Le mot est venu, et il **confirme** — la règle cesse d'être la
prudence d'un lot pour devenir celle du site. Elle vaut pour **les deux écrans qui paginent** :
`glisser.mjs` *(qui ne construit pas ses gouttières)* et Équipement *(qui recompose sa rangée)*.

**Pourquoi ce n'est pas qu'une question de goût** : une flèche qui ne mène nulle part reste une
cible tactile de 44 px que le pouce vise pour rien, et les deux gouttières coûtent **96 px** de
largeur à une rangée qui n'en a que 20 de reste sur un téléphone.

⛔ **ET SURTOUT PAS `display: none`.** C'est le **défaut n°3** du dépôt — *« effacer un mot au lieu
de recomposer »* — et le garde 4 de `ui-jetons.test.mjs` le refuse. Une flèche masquée garde sa
place dans la grille et reste atteignable au clavier : on retire l'image du problème en laissant le
problème. **La rangée EST ses trois tokens**, pas une rangée à cinq places dont deux se taisent.

⚖️ **L'exception, et elle est argumentée** : l'**état d'attente** d'Équipement *(dos de cartes,
aucune étagère chargée)* **garde** ses deux gouttières. Eric a parlé des listes COURTES ; étendre sa
consigne à un état dont il n'a rien dit serait décider à sa place — et le test 11 nomme cet état
*« l'état de départ du **croquis** »*. **Un croquis d'Eric prime sur une déduction.**

---

🔴 **`pages = ceil(objets ÷ 15)`, TOUJOURS, sans plafond.** Le **35 par étagère** est une cible de
**découpe**, jamais un plafond de données — le homebrew le fera déborder, **c'est prévu**.
⛔ **Aucun garde ne doit affirmer « une étagère fait au plus trois pages ».**

✅ **Déjà câblé** *(2026-08-26)* : `LISTE_PAR_PAGE` et `pageDeListe()` dans **`normes.mjs`** — le
pendant JS de `tokens.css` —, gardés par **`tests/listes.test.mjs`** (la **valeur** *et* l'**absence
de littéral**). C'est le modèle de `--voile-simple`, copié pour un nombre de JavaScript.
⚖️ **Et c'est un DÉFAUT** : un écran qui dévie passe **son** nombre à `pageDeListe(objets, page, N)`,
explicitement, et le garde reste muet. Ce qu'il interdit, c'est de **recopier le 15**.
📏 **Mesuré sur la page rendue** *(Chrome 151, 360 × 553 et 360 × 667)* : étagère à **33 objets** →
`33` à gauche, `1/3` à droite, **15 jetons** en 5 × 3, dernière page **3** ; `scrollHeight` =
`clientHeight` — **la page ne défile pas**.

---

## 4 ter. 📐 LE GABARIT DU RANG **B** — le menu d'une étape *(dicté par Eric, 27/08)*

> Eric, 2026-08-27 : **« note bien aussi toutes les cotes de ce niveau B : tout Species va en
> hériter »** · **« et potentiellement Classes aussi »** · **« c'est proof of concept À METTRE À
> L'ÉPREUVE »**.

> [!warning] ⏳ **STATUT : PREUVE DE CONCEPT, PAS UNE COTE GRAVÉE**
> Ce gabarit a été **dicté cote par cote sur UN écran** — Elf — et il tient sur celui-là. Eric l'a
> qualifié lui-même : **à mettre à l'épreuve**.
> ⛔ **Ne pas le citer comme ratifié** tant que l'épreuve n'est pas faite. Ce qui la fera :
> une espèce **sans lignage** *(le bloc 4 change de contenu)* · une espèce à **`skill_points`**
> *(Human, Araag, Elestu — le seul champ qu'Elf n'a pas)* · **Class**, qui a d'autres portes et un
> autre volume de prose.
> ⭐ **Ce qui est déjà sûr, en revanche, ce sont les LOIS** — le sacré, les trois âges de la porte,
> la paire, le défilement unique. Elles ne dépendent d'aucune cote.

🔴 **CE N'EST PAS LE GABARIT D'ELF, C'EST CELUI DE `renderGuideSpecifique`** — l'organe qui rend le
menu d'étape. Il sert **déjà** trois étapes : **Species** *(les 12 espèces)*, **Inheritance** et
**Class**. Une cote posée ici est posée quinze fois.

### L'ordre vertical, et les écarts *(mesurés à 375 × 553, iPhone SE)*

| | bloc | cote |
|---|---|---|
| | *(rembourrage de la dalle)* | **4** haut · **16** côtés · **4** bas |
| 1 | **le titre** *(« Elf »)* | T5 · à **4 px** du haut |
| 2 | **la saignée** | collée sous le titre · **8 px** avant la suite |
| 3 | **les portes**, l'une sous l'autre | **8 px** entre elles · écart interne **4** |
| 4 | **le bloc sans porte** *(« Granted automatically »)* | **0 px** avant lui · **9 px** avant son texte |
| 5 | **sa fenêtre de texte** | prend **tout ce qui reste**, et défile |
| 6 | **la bande d'aiguilleur** | **12 px** avant · **3 lignes T1** · **8 px** après |
| 7 | **le pied** | livre à gauche · boutons centrés · `?` à droite · **8 px** dessous |

⭐⭐ **LA CLEF DE CE GABARIT EST À LA LIGNE 5** : tout ce qui est resserré au-dessus va **à la
fenêtre**. C'est le but qu'Eric a fini par nommer — *« on fait de l'espace pour la fenêtre, laisse
ceux du bas où ils sont »*. 📏 **Mesuré : 78 px au départ, 184 à l'arrivée.**

### ⛔ Ce qui n'est PAS négociable dans ce gabarit

| | |
|---|---|
| **la porte** | 44 px de cible, corps **T3** — c'est un bouton, il est **sacré** *(§2 bis)* |
| **le `?` et le livre** | 22 de dessin dans 44 de cible, aux deux bouts *(§7 bis)* |
| **la fenêtre** | elle **défile**, elle ne se tronque pas *(§5 bis)* |

### 📌 Les postes qui ont payé, et où les reprendre

| poste | avant | après | ce qu'il était |
|---|---|---|---|
| la **saignée** | 17 | **8** | 8 + trait 1 + 8 — *17 px pour un trait* |
| la tête d'un bloc **sans porte** | 44 | **auto** | `--touch` protégeait un bouton **absent** |
| le rembourrage **bas** de la dalle | 16 | **4** | |
| la marge du **titre** | 8 | **0** | elle s'ajoutait à celle de la saignée |

⚠️ **ET CE GABARIT SE MESURE, IL NE SE RELIT PAS.** Trois de ces quatre postes étaient **deux
marges légitimes qui s'additionnaient** — chacune juste de son côté. On ne les voit qu'en
**décomposant** l'écart : *« 32 = 16 + 16 »*.

---

## 4 quater. 📐 LA CARTE DU RANG R EST UN DESSIN PROPORTIONNEL *(dicté au banc, 27/08)*

> Eric, 2026-08-27, une séance entière en direct : **« je voudrais que les blocs gardent leurs
> proportions d'un écran à l'autre »** · **« stabiliser tout ça d'un appareil à l'autre »** ·
> **« chaque élément se pose là où il faut et à la bonne proportion : sur iPad, sur Mac, sur
> iPhone »** · **« si je crée une nouvelle classe tout rentre là-dedans et sera joli partout »**.

🔴 **LE PRINCIPE : la carte est un DESSIN, pas une somme de cotes.** Chaque habit a sa référence —
**269 × 440 en portrait** (dicté), **625 × 440 en paysage** (validé) — et toutes les cotes internes,
**corps de texte compris**, sont celles de CE dessin-là, **en blg** *(⚠️ elles passaient par une
échelle locale `--u` jusqu'au 30/08 — voir l'encadré ci-dessous)*. Le nombre de caractères par
ligne est constant, donc les retours à la ligne — et les proportions — sont les mêmes de 375 à
1920, **et à tous les crans**. Avec la **police embarquée** (Inter, lot 57), le rendu
cesse aussi de dépendre de la machine : c'est ce qui a fermé le débordement des blocs 2/3 vu sur le
PC d'un ami d'Eric.

> ## ⚖️ **`--u` A ÉTÉ RETIRÉE LE 2026-08-30 — le principe reste, son moteur change**
>
> Eric : *« la carte s'adaptait car je voulais que ça soit joli sur 2 proportionnalités
> différentes, donc là ça devient **hors sujet** »*. L'adaptation **remonte d'un cran** : c'est le
> CRAN qui s'adapte à la fenêtre, plus chaque organe à sa boîte.
>
> 📏 **Et la mesure lui donnait raison avant l'argument.** Au banc, sous `zoom`, cette échelle
> locale devenait **non monotone** — à 1920 la dalle rendait `625 → 781 → 937 → **1420** → **920**`
> aux cinq crans. *Elle rétrécissait en zoomant.* Deux échelles qui se croisent.
>
> ⭐ **CE QUI RESTE EST LE DESSIN LUI-MÊME**, aux cotes du 27/08, en **blg** : 269 × 440 en
> portrait, 625 × 440 en paysage. À l'échelle 1, la carte est identique au pixel près.
> ⛔ **Ce qui est interdit, c'est qu'une SECONDE échelle réapparaisse** — un garde le mesure
> (`tests/fiche-moule.test.mjs`).

| loi | détail |
|---|---|
| 🧊 ~~**plafond d'échelle u = 1**~~ | **levé le 30/08.** Il bornait une croissance **subie** (le conteneur gonflait un dessin de téléphone en poster) ; le zoom est une croissance **choisie**. Même goût, mécanisme opposé |
| ⭐ **le pied, et ce que « sacré » veut dire** | `height = 440 blg` (396 de dessin + 44 de rangée tactile). La hauteur s'écrivait `396u + 44px` parce que l'échelle locale pouvait **rétrécir** ; le zoom global ne descend jamais sous 1, donc 44 blg valent toujours ≥ 44 px. La loi ne dit plus *« fixe »*, elle dit **« jamais moins »** — même promesse au doigt, un seul nombre |
| ⚠️ **renversement daté** | CADRES.md §8 (*« le corps de fiche ne se met pas à l'échelle avec la dalle »*) est **renversé pour cette carte seule** — la stabilité entre appareils prime, une carte-résumé se lit comme une image se regarde. §8 tient partout ailleurs |
| 🔴 **le moule impose son format au CONTENU** | *« c'est un résumé de classe »* · *« transformer un player handbook de taille livre en ce petit condensé »* — le contenu se taille pour les boîtes, jamais l'inverse |

### Le format du contenu — les cotes du condensé

| boîte | cote | source |
|---|---|---|
| **ligne de lineage/subclass** | **≤ 31 caractères**, une ligne, `nowrap` au paysage | mesuré : « Ten lines : breath + resistance », 31 car. = 226 px pile — ⚖️ UNE exception mesurée : « Berserker : Rage into Violent fury » (34 car., 226/226 au pixel, Eric : *« si t'as la place »*) |
| **bande de classe** | intertitre `Subclasses` + la voie sous un **nom COURT** : *« Berserker : Rage into fury »* — ⛔ *« on dégage path »* : le préfixe générique est une information nulle, le nom complet vit au rang B | garde 6 bis réécrit : le nom court doit **vivre dans** le vrai nom SRD |
| **blurb portrait** | **8 lignes pleines** = 3/10 de la zone — arbitré en trois temps : *« 1/3 → vers 1/4, sinon on s'asphyxie → 3/10 »* ; **justifié + césure** | la boîte se compte en LIGNES, jamais une ligne coupée aux deux tiers |
| **abréviations ratifiées** | **ADV** (advantage) · **SV** (saves) | *« saves pourrait s'écrire SV, advantage ADV »* |

### Le paysage, dernier réglage d'Eric

`220 (image) | bloc 1 | 200 (texte) | 16 (respiration)` — *« une symétrie entre la largeur du blurb
et le png »* puis *« rapetisser un peu le blurb, agrandir un peu le barbare »*. Image **220 × 340**,
corps de la colonne texte **10,5u** (descendu avec sa largeur : même ratio, les lignes qui tenaient
tiennent). Interligne **unique 1,2** sur tout le bloc 1 (*« espacement pas homogène, ça fait
chelou »*).

### 🔦 Le halo du scrollspy

> Eric : *« le scrollspy n'est pas assez visible — un halo de luminance autour de Elf dans les
> tuiles à gauche »*, puis *« pas mal mais un peu moins large »*.

Jeton **`--spy-halo`**, un par thème : **lueur blanche la nuit, encre le jour** — une lueur sur
parchemin clair serait invisible. `box-shadow: 0 0 6px 1px`, sur `[aria-current="true"]` du rail.

### ⛔ Deux pièges de géométrie, payés le jour même

| piège | ce qui s'est passé |
|---|---|
| **une rangée vide garde ses DEUX gouttières** | sans bande, la rangée `auto → 0` volait un gap au bloc voisin : 11 px d'asymétrie mesurés (les 7 « bloc 3 mal centré » de l'audit d'Eric). Parade : le voisin **enjambe** la rangée vide (`grid-row: n / m`) — la symétrie revient par construction |
| **une règle d'un habit FUIT dans l'autre** | l'enjambement portrait, écrit nu à (0,4,0), battait la règle paysage (0,3,0) — *« bloc 1 trop haut »*, vu par Eric avant moi. Une règle propre à un habit se **borne à son media query** |

---

## 4 quinquies. 📐 LE SOUS-ÉCRAN (SB) ET LE BILAN DU B *(dictés au banc, nuit du 27/08)*

> Eric : **« en SB lineage : le texte doit être dans une fenêtre scroll »** · **« il faut une
> place pour l'aiguilleur sous la fenêtre »** · **« une harmonie de principe B, SB1 et SB2 »** ·
> **« c'est le scroll qui récupère le rab »**.

### Le gabarit du SB — le squelette du B, transposé

| bloc | cote |
|---|---|
| **le titre** | à 4 du haut · **4 px** avant les jetons (*« 4 pixels entre lineage et token »*) |
| **les organes du glisser** | sacrés, intouchés |
| **LA FENÊTRE** | prend tout ce qui reste et **défile** — *« c'est le scroll qui récupère le rab »* ; un SB **sans** prose laisse le rab entre la bande et le pied |
| **la bande d'aiguilleur** | **12 avant · 3 lignes T1 · 8 après** — les cotes du B, mesurées puis reproduites ; elle porte le mot de prévention (*« Leaving this open marks nothing — only Done records the choice »*), et l'écran peut le **préciser** (le geste tap-info du lignage) |
| **le pied** | livre à gauche · boutons centrés, gaps 8 · `?` à droite · **8 du bord** — l'harmonie mesurée : B 8/12/8, SB1 8/12/8, SB2 8/12/rab |

⛔ **L'ancienne consigne du glisser a dégagé** (*« ça dégage »*) — l'aiguilleur est le seul texte
de guidage du SB. ⛔ **La saignée d'avant-pied aussi** : le B n'a pas de trait là, et elle rendait
17 px pour un gabarit à 12.

### Le bilan du B parle en MODE TEXTE

> Eric : **« si on met tout en mode texte : "High Elf Lineage" · "Skill budget" · en dessous les
> niveaux — Delve novice (en italique), Survival novice (en italique) »**.

| l'item réglé | sa tête | dessous |
|---|---|---|
| le lignage | **High Elf Lineage** — `motDe` sans parenthèses, le sous-titre capitalisé | la mise en mots du lignage (ci-dessous) |
| la bourse | **Skill budget**, nu — le « spent » de la porte n'a plus rien à dire | *Delve novice, Survival novice* — **une ligne, en italique**, chaque skill étant un lien |

### La mise en mots d'un lignage — UNE source, trois consommateurs

> Eric : **« At level 1 : the range of your darkvision… / At subsequent levels you gain spells : /
> level 3 : Faerie Fire (lien) / level 5 : Darkness (lien) »** — et il y tient : *« je tiens à
> "At subsequent levels" »*.

`lignesDuLignage` (species-step) est la seule voix — la fenêtre du SB1, le popup du tap sur un
token, le bilan du B la consomment tous les trois. **SB1 garde les textes complets** (*« dans
lineages on a la place, on peut garder le format, mais tu link les spells »*) ; **le bilan lit le
FORMAT RACCOURCI** (`data[fiche_lineage_lvl1]`, couche fh-fiche — esprit SRFH : *« c'est un format
raccourci pour entrer dans les fiches »* ; ⏳ migrera dans une vraie famille srfh de fh-srd).

⚠️ **ET « UNE SOURCE » VEUT DIRE UNE LECTURE, PAS UNE PHRASE** *(lot 126, 02/09)*. Les trois voix
ne disent pas la même phrase — SB1 énumère, le bilan enchaîne *« … at level 3 and … at level 5 »*,
le popup est en texte nu — et c'est en croyant que la source était la PHRASE que le dépôt a laissé
le bilan **relire l'option pour son compte**. Il ne connaissait alors qu'une des deux formes
(`levels`), pas l'autre (`damage`), et le Dragonborn rendait *« At level 1 : »* suivi de **rien**,
sur ses dix lignées. ⭐ Ce qui se partage est `contenuDuLignage` — **la lecture de l'option** ;
chaque voix la met en mots à sa façon. ⛔ Une forme d'option neuve s'ajoute là, **une fois**.

📏 **Mesuré sur les douze espèces avant de toucher une ligne** (sonde de rendu, pas déduction) :
cinq portent des lignées, et **le Dragonborn était le seul à rendre vide** — 10/10. Les quatre
autres rendaient un texte, mais **le mauvais** : faute de condensé, leur bilan servait la prose
SRD entière (Hoddon **228 caractères** au niveau 1, Goliath 131). ✅ Les quatre condensés manquants
sont écrits depuis — Eric, 02/09 : *« la décision c'est d'écrire les versions minimalistes et
synthétiques qui n'existent pas, avec le moteur »*. Le témoin de longueur est l'Elfe (43–81 car.).

### ⚖️ L'EXCEPTION NOMMÉE DU DRAGONBORN — le SB des lignages sans sa table *(Eric, 2026-09-02)*

> **« Dragonborn, SB lignages : exception, on change le donné. Le texte de l'aiguilleur dit "il y a
> 10 lignées, cliquer sur les tokens de choix pour regarder les options". Tu fais court, tu fais
> plus joli que ça. C'est là que vivra la version synthétique pour chaque choix. »**

📏 **L'ARGUMENT, MESURÉ** *(375 × 812, dalle de 500 blg)* : ses **dix jetons occupent quatre
rangées**, et il ne reste que **74 blg** de fenêtre pour le texte — quand l'intro et la table en
demandent **316**. L'intro seule s'y voit ; **la table entière vit sous le pli**. C'est la question
du §1 quater — *« qu'est-ce que cet écran porte EN TROP ? »* — et la réponse d'Eric est : la table.

| ce que l'écran garde | ce qui part |
|---|---|
| les **dix jetons** — intouchés, c'est le choix | 🔴 **la table des dix**, et aucun repli en prose (le `<dl>` rendrait les mêmes dix entrées) |
| la **fenêtre** et son **intro** — la règle commune du souffle, qui ne varie pas | l'ancienne fin de l'intro (*« the table gives it for each lineage »*), qui renverrait à un tableau absent |
| la **bande d'aiguilleur**, qui dit ce que la table disait | — |

**Le mot exact de la bande** *(à la place de la bande commune)* :
`Ten lineages, one element each — tap to read, drag one into the slot to choose.` puis le socle de
prévention du gabarit, mot pour mot. ⭐ Le compte (*Ten*) **est gardé contre la couche** : un
chiffre écrit à la main dans une phrase ment le jour où la donnée bouge, et il ment en silence.

⭐ **LE GESTE N'EST PAS INVENTÉ** : §7 ter le ratifie déjà — *« tap au doigt · clic droit à la
souris → la même fenêtre FF »*. L'écran nommé n'invente rien, il fait du tap **la voie normale de
lecture**, et c'est là que vit la version synthétique de chaque lignée.

⛔ **ELLE EST NOMMÉE, ET SA FRONTIÈRE EST GARDÉE.** `LIGNAGES_SANS_TABLE` (species-step) ne contient
qu'un **id de record** — jamais un `:nth-child`, jamais un seuil chiffré, jamais *« les espèces à
beaucoup de lignées »* : **le Goliath (6) et le Hoddon (3) gardent leur table**, et le garde le
vérifie aussi fort que le reste (`tests/lignage-exception-dragonborn.test.mjs`). ⏳ Si un second
écran cède un jour, il s'écrit **ici**, avec sa propre mesure à côté de son nom.

### 📏 CE QU'UN TRAIT ACCORDE SE LIT D'UN COUP D'ŒIL — la bande des condensés *(lot 127, 02/09)*

> Eric, devant la capture du Dragonborn : **« dragonborn S : granted texte pas conforme »**.

⭐ **C'EST LA MÊME MALADIE QUE CI-DESSUS, UN CRAN PLUS LOIN.** Sous *Granted automatically*,
l'écran S servait la **prose du SRD recopiée telle quelle** — Breath Weapon **833 caractères**,
Draconic Flight 480 — et deux voix la lisaient chacune pour son compte : la ligne du parcours
(*« **Mot :** texte »*) et la `<dl>` du panneau de choix. Elles lisent désormais **la même
lecture** (`contenuDuTrait`), chacune la mettant en mots à sa façon.

📏 **MESURÉ AU RENDU SUR LES DOUZE ESPÈCES** *(375 × 812, fenêtre du parcours 335 px)*, avant de
toucher une ligne — et **ce n'est pas un défilement de confort, c'est un pavé** : Dragonborn
**614 px de contenu pour 251 de fenêtre** (363 sous le pli), Dwarf 353, Orc 332, Halfling 301,
Elf 283, Goliath 271. ⚠️ Et le Hoddon **n'en fait pas partie** malgré ses 1481 caractères de
`Hoddon Lineage` : ce trait-là est **porté par la ligne Lineage** (`TRAITS_COUVERTS`), donc absent
de cet écran. *Un total juste ne dit rien du contenu — c'est le rendu qu'on mesure, pas la donnée.*

⭐ **LE TÉMOIN ÉTAIT DÉJÀ ÉCRIT, ET C'EST ERIC QUI L'AVAIT ÉCRIT.** Les traits qu'il a rédigés pour
ses espèces tiennent en **39 à 77 caractères** (Araag : 39, 44, 45, 74 · Human : 46, 57, 77) ; les
condensés de lignée du lot 126 en **33 à 102**. Les seules proses qui débordent sont **celles
recopiées du SRD**.

| la loi | le détail |
|---|---|
| 📐 **la bande** | un texte de trait servi à l'écran tient en **≤ 102 caractères** — la cote **DONNÉE** du plus long condensé du dépôt (`rock-folk`, Hoddon), jamais un seuil inventé |
| 🏠 **le lieu** | `data[fiche_trait_text]` dans `layers/fh-fiche-en.layer.json`, **indexé par l'id du trait** — la même clef que `TRAITS_COUVERTS` |
| ⛔ **ce que ce n'est pas** | `data[fiche_traits]` reste la poignée de faits saillants de la **carte du catalogue** (le Dragonborn n'y met qu'un trait sur cinq). Deux consommateurs, deux données — l'un ne se détourne pas pour l'autre |
| ⚖️ **le repli** | un trait sans condensé **sert sa prose**. Un blanc serait pire que le pavé — même arbitrage qu'au lot 126 |
| 🔗 **les sorts** | en `[[Nom]]`, comme les condensés de lignée, et **linkifiés dans les deux voix** : des crochets doubles à l'écran ne sont pas un lien, c'est une fuite de balisage |
| ✍️ **les abréviations** | **ADV** et **SV** seulement (voir *abréviations ratifiées*) — aucune autre ne se crée en passant |

⛔ **AUCUNE RÈGLE DE JEU N'EST INVENTÉE ICI** : un condensé est le **résumé fidèle** de ce que la
couche accorde déjà. Un trait dont la règle n'est pas comprise **se signale**, il ne se comble pas.

Les gardes : `tests/trait-accorde-bande.test.mjs` (la bande, **et le repli**, les deux branches
de l'alternative) et `tests/trait-accorde-voix-unique.test.mjs` (les deux voix disent la même
chose, avec les condensés **comme sans eux**).

### 🧬 UN TRAIT QUI DÉPEND DU CHOIX APPARTIENT À LA LIGNÉE *(lot 128, 02/09)*

> Eric : **« Un trait dont le CONTENU dépend du choix de lignée appartient à la lignée, pas au
> bloc *Granted automatically*. »**

⭐ **LA RÈGLE N'EST PAS NEUVE — elle était déjà écrite dans `species-step.mjs`** depuis le 19/08,
au-dessus du bilan d'une ligne : *« ⛔ il n'apparaît qu'une fois le choix signé — **sauf « gagné
d'office », qui est là dès le début parce qu'il ne dépend de rien** »*. Ce qui manquait, ce
n'était pas la loi, c'était **son application à deux traits** : `Breath Weapon` et
`Damage Resistance` n'étaient dans aucune table. ⚠️ *Une absence n'est jamais une réponse* — un
trait absent d'une table ne dit pas qu'il est gagné d'office, il dit que **personne ne l'a rangé**.

| la loi | le détail |
|---|---|
| 🔴 **le critère** | le **contenu** du trait change avec l'option choisie. Structurellement : **la lignée porte une valeur qu'un AUTRE trait consomme** (`option.damage`) |
| 🪟 **deux formes, une lecture** | au **SB** (l'écran où l'on choisit) la forme **GÉNÉRALE**, sans l'élément — c'est commun aux dix lignées ; au **bilan de S**, une fois signé, la forme **SPÉCIFIQUE** : `Fire — ` puis le **même texte** |
| 🏠 **la source** | `contenuDuTrait` (lot 127) — ⛔ la spécifique **n'est pas un second texte**, c'est le premier **préfixé**. Deux textes recopiés divergent à la première retouche |
| 📌 **l'élément** | il **se lit sur la lignée**, jamais en littéral. Sans élément (lignée à paliers), la forme spécifique **retombe sur la générale** plutôt que d'en inventer un |
| 🚫 **le bloc accordé** | il les perd **dès que l'espèce ouvre un choix de lignée**, signé ou non — c'est **avant** la signature que leur place y mentirait le plus |
| ⛔ **ce que ce n'est pas** | `TRAITS_COUVERTS` retire un trait qui **se redirait** (`Elven Lineage` EST la ligne Lineage). Celui-ci retire un trait qui, seul, **mentirait**. Deux tables, deux raisons |

📏 **MESURÉ SUR LES DOUZE ESPÈCES avant d'agir.** Cinq portent des lignées ; **le Dragonborn est
le seul dont l'effet est éclaté** sur plusieurs traits. ⛔ `otherworldly-presence` (Tiefling) cite
bien `Fiendish Legacy`, mais pour son **abilité de lanceur, que le joueur choisit à part** — les
trois legacies le laissent identique : **il ne relève pas de cette règle**, et le Tiefling reste
donc un témoin qui *peut* accuser.

📐 **Au rendu, 375 × 812** : le bloc *Granted automatically* du Dragonborn passe de **318 px de
contenu pour 251 de fenêtre** à **206 pour 206** — plus rien sous le pli. Les onze autres espèces
sont **identiques au caractère près**, dans les trois voix.

Le garde : `tests/lignee-porte-ses-traits.test.mjs`. ⭐ Il **ne récite aucune table** : il définit
*« dépendre du choix »* par ce que l'écran FAIT — **un nom de trait dont le texte servi change
d'une lignée à l'autre** — puis exige de ces noms-là l'absence du bloc accordé et les deux formes.
Éprouvé **rouge des deux côtés** de l'alternative : la générale servie au bilan, la spécifique
servie au SB.

### 🔗 §7 ter — LA LOI GÉNÉRALE DES LIENS

> ⚖️ **LA LOI-MÈRE, dictée le 2026-08-30** — Eric : *« Règle générale, partout dans le builder,
> dans FH web, dans la future fiche de perso : dès qu'un **skill, feat, trait, feature, spell,
> invocation, training** apparaît, il y a un **lien vers le site FH web**. Ou **vers le SRD quand
> on joue en mode SRD**. »* Et sa précision : *« cantrips = spells »*.
>
> Un lien suppose une **cible** : le livre fabrique des ancres prévisibles (`l<niveau>-<nom>`
> pour une feature, `opt-<nom>` pour une option de classe, `spell-<slug>` pour un sort — depuis
> le 30/08, 339 sorts ancrés). Une famille sans ancre est une famille qu'on ne peut pas lier :
> l'ancre se fabrique AVANT le lien.
> ⏳ **LE MODE SRD** (lien vers le SRD au lieu du site) est déclaré ici et attend son câblage —
> la fenêtre FF interne, qui plie le texte SRD, en tient lieu sur les écrans de choix.
> 📌 La fenêtre FF reste le geste des **écrans de choix** (tap sur un jeton = info) ; la loi des
> liens porte sur les NOMS écrits — bilans, prose, fiches.

> Dictées antérieures, absorbées par la loi-mère : *« dans FH tous les skills sont linked à FH
> WEB »* · *« tous les sorts au SRD, sauf sorts modifiés »* · *« le lien vers le SRD pour le
> spell et aussi vers le species via le livre »*.

**La règle : la fiche condense, LES LIENS mènent au long.**

| l'objet cité | son lien |
|---|---|
| **un sort — cantrip compris** *(30/08)* | le **livre web**, à l'ancre près (`chapters/spells/#spell-<slug>`) ; la FF interne reste le geste d'info des écrans de choix |
| **un sort MODIFIÉ par FH** (id `fh:`) | le **livre web** (chapitre Magic) |
| **un skill** | **toujours le livre web** (chapitre Skills & Tools — les records internes n'ont pas de prose) |
| **l'espèce** | le **livre** du pied (lot 61) |
| **une feature de classe** *(29/08)* | le **livre web**, à l'ancre près — `chapters/classes/<classe>/#l<niveau>-<nom>`, les ancres que `sync_from_vault.py` fabrique |
| **un don** *(29/08)* | le **livre web** (chapitre Feats) |
| le geste sur un **token** | tap au doigt · **clic droit** à la souris → la même fenêtre FF (*« idem clic droit sur un token, ou tap sur un token »*) |

La table des ancres vit dans `ui/builder/liens-fh.mjs` — une table de NAVIGATION, pas des mots de
règle. ⛔ Un lien qui n'ouvre rien apprend à ne plus cliquer (la loi du `?`) : un sort introuvable
au query s'écrit en texte simple, jamais en faux lien.

⚠️ **ET UN LIEN EN PHRASE SE NOTE, IL NE SE DEVINE PAS** *(29/08)* : chercher les noms du
catalogue dans une phrase MENT — mesuré, « Shield » chez le moine est l'armure, pas le sort.
Les cas réels se comptent (deux sur 35 phrases de bilan) et vivent dans `LIENS_DICTES`
(`class-step.mjs`), comme les résumés d'exception vivent dans `RESUME_DICTE`.

---

## 5 bis. 🔴 LE DÉFILEMENT INTERNE — autorisé, et à UNE seule condition

> Eric, 2026-08-26 : *« quand on a un long bloc de texte, comme celui pour la description des
> inheritances, je voudrais un **scrollable interne — pas la dalle, mais uniquement la ZONE DE
> TEXTE**. Ça permettrait de garder le bilan Species sur une page. »*

| ✅ ce qui peut défiler | ⛔ ce qui ne défile JAMAIS |
|---|---|
| **une zone de texte** — de la prose longue | **la page** *(`100dvh`, `overflow: hidden`)* |
| une **table** dans sa boîte *(déjà en place : `.lore-table-boite`)* | **la dalle** qui la porte |
| | une **liste de jetons** → elle **pagine** *(§5)* |
| | une **bande de contrôles** — boutons, collecteurs |

⭐ **La ligne de partage est nette : LA PROSE DÉFILE, LES CONTRÔLES NON.**
- On **lit** un texte de haut en bas : le défilement est le geste naturel de la lecture, et rien
  n'est **perdu** — juste plus bas.
- On **choisit** parmi des jetons : un jeton hors écran est **introuvable**, et le joueur ne sait
  plus **combien** il en reste. D'où la pagination et **le compte sous le chevron**.

⭐ **Et ça ne contredit pas la loi « demander ce que la page porte EN TROP »** *(§1 quater)* : cette
loi vise **les contrôles**, dont la lecture d'un seul coup d'œil est le service rendu. Un bloc de
lore n'a pas ce service à rendre — **le tronquer à la cote serait une perte, le faire défiler n'en
est pas une.**

🔴 **Ce que ça débloque, et c'est la raison d'Eric** : *« garder le bilan Species sur une page »*.
Sans défilement interne, une description longue pousse le bilan hors de l'écran ; avec, **la page
garde sa forme quel que soit le lignage choisi**.

⛔ **Deux gardes-fous** :
1. **La boîte qui défile porte une hauteur, pas la dalle** — sinon la dalle grandit et la page
   déborde, ce qu'elle ne peut pas faire.
2. **On doit VOIR qu'il y a plus** — sinon le joueur croit avoir tout lu. *(Le chevron du §6
   existe pour ça ; ⏳ reste à dire s'il s'applique aussi à une zone de prose.)*
3. 🔴 **LA FENÊTRE EST UN NŒUD, PAS UNE FORME DE TEXTE** *(lot 123, 02/09)*. Le verrou du n°1
   doit se poser **avant** de savoir de quoi le texte est fait — sinon il ne protège que la
   forme qu'il connaissait.
   📏 **Mesuré, et c'est ce que ce point coûte** : le sous-écran de lignage n'avait de fenêtre
   que sous la forme **prose** *(le `<dl>` lui-même)*. La forme **table** posait son intro et sa
   table nues dans la section, donc rien ne portait la hauteur. À 375 × 812, dalle de 500 blg :
   Elf **500** · Tiefling **500** *(les deux témoins, en prose)* · Hoddon **639** · Dragonborn
   **742** · Goliath **775** — le pied *(Cancel · Done · le livre)* poussé de **139**, **242** et
   **275 blg SOUS l'écran**.
   ⛔ **Et la ligne de partage n'était pas l'espèce** — Eric a écrit *« toutes sauf Elf »*, mais
   Tiefling allait bien lui aussi. Ce que les deux avaient en commun n'était pas leur nom, c'était
   leur **forme**. Une règle calée sur une forme du contenu ne dit jamais qu'elle en ignore une
   autre.

---

## 6. LES BOUTONS

| gabarit | capacité | sa largeur |
|---|---|---|
| **small** | **6 caractères**, **deux étages possibles** | 🔴 **DÉDUITE** du compte de caractères |
| **medium** | **12 caractères**, deux étages | 🔴 **DÉDUITE** — mot-témoin : **`COMPANIONS`** (10) |
| **no constraint** | libre | — |
| 🔴 **`+` / `−`** | un glyphe | **le plus petit possible** *(voir ci-dessous)* |

🔴 **`large` A ÉTÉ RENOMMÉ `medium`** *(Eric, 26/08)*. Sur trois gabarits, *« large »* se lisait
comme **le plus grand** alors que c'est **celui du milieu** — le plus grand est `no constraint`.
**small · medium · no constraint** : l'ordre se lit tout seul, et un lot ne peut plus se tromper
de gabarit.

⭐ **Chaque gabarit a son MOT-TÉMOIN** — un mot réel qui prouve la cote, jamais un compte
abstrait : **`CANCEL`** (6) pour `small`, **`COMPANIONS`** (10) pour `medium`.

⭐ **Un gabarit est un COMPTE DE CARACTÈRES, pas une largeur en pixels.** C'est §1 ter appliqué :
la largeur se **déduit** du compte et de la police. ⛔ Écrire `width: 96px` figerait un gabarit qui
mentirait au premier changement de corps.

⚠️ **Et il manque une pièce pour pouvoir déduire** : ⛔ **aucune taille de texte n'est déclarée
pour un bouton** — `.species-done` porte `font: inherit`. Tant que le corps d'un bouton n'est pas
nommé *(T-quoi ?)*, **les largeurs de `small` et `medium` ne sont pas calculables.** ⏳ À trancher.

### 📐 LES COTES DES BOUTONS — extrapolées le 26/08

> ⚠️ **EXTRAPOLATION, pas mesure.** Elle repose sur un ratio de **0,58 em par caractère**
> *(semi-gras, casse mixte)*. 🔴 **À vérifier au navigateur sans écran** *(§0)* avant d'être gravée.

**Tout se déduit de la rangée de 278 et de la gouttière de 8** *(les mêmes que le jeton)*, sous ta
règle **« même largeur sur une ligne »** :

| gabarit | par ligne | largeur | ce qu'il porte |
|---|---|---|---|
| **small** | **3** | 🔴 **87** | `NEXT` · `DONE` · `BACK` · `CANCEL` — **6 caractères** |
| **medium** | **2** | **135** | 12 caractères — **`COMPANIONS`** |
| **no constraint** | **1** | **278** | libre |
| *(4 par ligne)* | 4 | *64* | ⏳ jamais demandé |

⭐⭐ **UN PETIT BOUTON FAIT 87 — EXACTEMENT LA LARGEUR D'UN JETON.** Ce n'est pas une coïncidence :
les deux se déduisent de la **même** rangée de 278 avec la **même** gouttière. ➡️ **Boutons et
jetons partagent une seule grille**, et une bande de boutons s'aligne sous une rangée de jetons
sans réglage.

### Le corps du texte

| gabarit | à **T3** (14) | à **T4** (16) |
|---|---|---|
| **small** — 6 car. | besoin 65 / 87 · **marge 22** ✅ | besoin 72 / 87 · marge 15 ✅ |
| **medium** — 12 car. | besoin 113 / 135 · **marge 22** ✅ | besoin 127 / 135 · 🔴 **marge 8** |

➡️ **T3 est le corps recommandé** : c'est le seul qui laisse la **même marge (22 px) aux deux
gabarits**. ⚠️ À T4, `medium` n'a plus que 8 px — **un mot un peu large déborde**, et le déficit ne
se verrait que sur ce gabarit-là.

### La hauteur

| | |
|---|---|
| **un étage** | 🔴 **44** — le texte n'en demande que ~33, **c'est `--touch` qui décide** |
| **deux étages** *(T3)* | **48** |
| **deux étages** *(T4)* | **56** |

⭐ **Le plancher tactile gouverne la hauteur d'un bouton à un étage** : la typographie n'y arrive
pas. C'est encore *« un contrôle ne se laisse jamais dimensionner par un dessin »*.

### 🔴 `+` / `−` : le dessin le plus petit possible, la cible au minimum tactile

> Eric, 2026-08-26 : *« boutons + / − : **le plus petit possible / minimum acceptable sur
> tactile** »*.

| | |
|---|---|
| **le DESSIN** | 🔴 **le plus petit possible** — il ne porte qu'un glyphe |
| **la CIBLE** | 🔴 **`--touch` 44**, le minimum acceptable au doigt |

⭐ **C'est le cas où les deux divergent le plus, et il est voulu.** *« Un contrôle ne se laisse
jamais dimensionner par un dessin »* : le rond peut faire 24 px, **sa zone en fait 44**. ⛔ Réduire
la cible pour l'accorder au dessin serait exactement la faute inverse.

Position : **en bas de page, centrés**. 🔴 **Même largeur pour tous les boutons d'une même ligne.**

| type | couleur |
|---|---|
| ~~choix de mode~~ | 🔴 **CE N'EST PAS UN BOUTON** → voir *« l'interrupteur »* ci-dessous |
| `done` *(étapes)* | 🟢 **VERT** — 🔴 **`Done` = VALIDATION** *(Eric, 26/08)*. Il **valide** ce qui est là, **puis remonte d'un cran** |
| `next` *(étapes)* | 🔵 **BLEU** — *« on continue »* |
| `next` d'alerte | **cadre rouge, corps bleu** → **popup** entre `done` et `next` |
| **défaire** *(`Cancel`, « j'ai changé d'avis », « refaire mon perso »)* | 🔴 **rouge, TOUJOURS** → **popup** *(voir la famille « défaire »)* |
| navigation *(next, back)* | 🔵 **bleu** |
| **`+` / `−`** | **`+` vert · `−` rouge** — 🔴 **carré OU petit cercle** *(Eric, 26/08)* |

### 🔴 LES QUATRE COULEURS SONT UNE ÉCHELLE D'AVANCEMENT *(tranché 26/08)*

> Eric : *« le bleu on garde, ce sont les actions sous les états intermédiaires. **Un bouton va
> passer de bleu à vert voire à rouge** dans les zones de choix — quand on prend +4 alors qu'on a
> droit à +2. »*

| couleur | ce qu'elle dit |
|---|---|
| **gris** — 🔴 le jeton est **`--text-muted`** | **rien n'est encore fait** |
| 🔵 **bleu** | 🔴 **un MOUVEMENT NON IMPACTANT** — on se déplace, rien ne change *(donc : on est toujours en cours)* |
| 🟢 **vert** | **c'est bon, on a fini** |
| 🔴 **rouge** | **ce n'est pas bon** |

⭐ **Ce ne sont donc pas quatre couleurs de boutons : c'est UNE échelle, et le bouton la
PARCOURT.** Un même bouton passe de gris à bleu, de bleu à vert, et **retombe au rouge** si le
joueur dépasse son droit. ⛔ Ne jamais figer la couleur d'un bouton à sa déclaration — **elle se
dérive de l'état.**

⭐ **Et c'est la MÊME échelle que la signalisation** *(le cercle d'étape, plus bas)* : rien fait ·
en cours · validé · problème. **Une seule échelle, deux porteurs** — un bouton qu'on appuie, un
cercle qu'on ne peut pas appuyer.

⭐ **Elle éclaire `done` et `next`, et elle a corrigé la dictée** *(Eric, 26/08 : « le done est
vert, le next est bleu » — l'inverse de ce qu'il avait dicté)* : **`done` est VERT parce que c'est
FINI**, **`next` est BLEU parce qu'on CONTINUE**. Ce ne sont pas deux conventions arbitraires,
c'est **l'échelle elle-même**, et c'est elle qui a tranché.

### 🔴 LE LIBELLÉ ET LA COULEUR SONT DEUX AXES INDÉPENDANTS

> Eric, 2026-08-26 : *« **mais un même bouton peut changer de couleur, à voir dans l'acte** »*.

| l'axe | ce qu'il dit | il change |
|---|---|---|
| **le LIBELLÉ** | **ce que fait** le bouton | ⛔ **jamais** — `Done` reste `Done` |
| **la COULEUR** | **où on en est** | ✅ **à chaque acte** |

⭐ **Donc « `done` = vert » ne veut PAS dire « le bouton Done est vert ».** Ça veut dire : *un
`Done` est vert **quand l'étape est finie***. Sur une étape incomplète, **le même bouton est gris
ou bleu** ; sur un choix hors droit, **il est rouge**.

⛔ **Un lot ne déclare donc JAMAIS `class="bouton-vert"`.** Il déclare un bouton, et **l'état
peint**. Une couleur écrite dans le balisage est un bogue — elle mentira au premier changement
d'état.

⭐ **Et c'est ce qui rend le bouton lisible sans le lire** : le joueur voit **où il en est** avant
même de lire ce qu'il peut faire. La couleur porte l'avancement, le mot porte l'acte — **deux
informations, aucune redondance**.

📌 **Ce qui se garde** : qu'aucune couleur ne soit figée dans le balisage, et que la couleur se
dérive **du même état** que le cercle de signalisation. ⛔ Deux dérivations séparées finiraient
par diverger — c'est la faute des deux échelles typographiques que le dépôt paie encore.

### 🔴 LA FAMILLE « DÉFAIRE » — rouge, toujours, quel que soit l'état

> Eric, 2026-08-26 : *« le **cancel** est rouge »* · *« **j'ai changé d'avis** est rouge »*.

| le bouton | |
|---|---|
| `Cancel` | 🔴 rouge |
| `I changed my mind` / *« je ne veux pas ça »* | 🔴 rouge |
| *« je veux refaire mon perso »* | 🔴 rouge |

⭐ **C'est la seule famille où la couleur ne dit PAS où on en est — elle dit ce que le bouton
FAIT.** Les deux axes s'y confondent, et **c'est voulu** : un bouton qui **défait** ne doit jamais
pouvoir être appuyé par distraction. ⛔ Un `Cancel` gris, ça s'appuie sans le vouloir.

### 🔴 LES TROIS VERBES DE LA RANGÉE — la définition d'Eric, mot pour mot *(26/08)*

> Eric, 2026-08-26, en trois lignes :
> **« `Done` valide les choix · `I changed my mind` les annule · `Next` : navigation »**

| le bouton | ce qu'il FAIT | ce qu'il ne fait pas |
|---|---|---|
| **`Done`** | **valide** les choix de l'étape | ⛔ il ne fait pas avancer |
| **`I changed my mind`** | **annule** ces choix | ⛔ il ne recule pas — il DÉFAIT |
| **`Next`** | **navigation**, rien d'autre | ⛔ il ne valide rien |
| **`Back`** | **navigation**, et **UNIQUEMENT dans les sous-menus** | ⛔ il n'existe pas au rang R |

🔴 **`Back` NE PARAÎT JAMAIS À L'ENTRÉE D'UNE ÉTAPE** — Eric, 2026-08-26 : *« le
`back` c'est uniquement dans les sous-menus »*. Au rang **R**, on ne revient de
nulle part : la ceinture d'étapes EST la navigation de ce niveau. ✅ **Déjà
câblé, vérifié dans la source** : `renderSortieEtape` ne produit un retour que
si `state.palier > 1` ou si l'on est dans un item de parcours — donc jamais à
l'entrée. La norme ne change rien ici, **elle nomme ce que le code faisait déjà
sans que ce soit écrit**, ce qui est exactement ce qui permet à un lot de ne pas
le défaire par erreur.

⭐ **CE QUE CETTE TABLE RÈGLE, ET QUI N'ÉTAIT PAS ÉCRIT** : pourquoi `Done` et
`Next` ne coexistent jamais. Ce ne sont pas deux façons d'avancer — c'est **le même
moment vu avant et après**. Tant que les choix ne sont pas validés, la rangée offre
de VALIDER ; une fois validés, il n'y a plus rien à valider et elle offre de
NAVIGUER. D'où la séquence, qu'Eric a lui-même reformulée en question :

| où l'on est | l'étape est… | la rangée porte |
|---|---|---|
| **rang R** *(entrée)* | en cours | `I changed my mind` · **`Done`** |
| **rang R** *(entrée)* | validée | `I changed my mind` · **`Next`** |
| **sous-menu** *(B, SB)* | — | **`Back`** · `Done` — ⭐ c'est le SEUL endroit où `Back` paraît |

⚠️ **ET `I changed my mind` NE BOUGE PAS ENTRE LES DEUX** : c'est la seule porte
ouverte dans tous les états, celle qui défait. Elle reste rouge dans les deux
*(§6, la famille « défaire »)*.

---

### 🔴 LA LOI DE LA PORTE — voyant et texte disent la MÊME chose *(27/08)*

> Eric, 2026-08-27, en deux lignes :
> **« condition remplie → voyant vert / texte de RÉSOLUTION »**
> **« condition non remplie → voyant vide / texte de PROPOSITION »**

| l'état | le voyant | le texte de la porte |
|---|---|---|
| **condition non remplie** | ⚪ **vide** | **proposition** — *« Lineage »*, *« Skill budget »* |
| **condition remplie** | 🟢 **vert** | **résolution** — *« High Elf »* sur *lineage*, *« Skill budget »* sur *spent* |

⭐⭐ **CE QUE CE VOCABULAIRE RÈGLE, ET QUE « question / réponse » NE RÉGLAIT PAS** : une porte
peut avoir plusieurs résolutions à la fois. `Skill budget` n'a pas UNE réponse — il en a autant que
de compétences dotées *(« Survival +1, Vigilance +1 »)*, et aucune ne tient dans une porte. Sa
résolution n'est donc pas un nom, c'est un **état** : `spent`. **Une résolution dit que c'est
résolu ; elle ne dit pas forcément par quoi.**

📐 **LE GABARIT DES DEUX LIGNES** *(ratifié 27/08)*

| ligne | corps | pourquoi |
|---|---|---|
| **la résolution** | **T3** | c'est elle qu'on vient lire |
| **la proposition**, dessous | **T1 italique** | même habit que *« drop it here »* dans un collecteur vide — **l'italique dit *« je ne suis pas une donnée »*** |

⛔ **ET LES DEUX SIGNAUX NE PEUVENT PAS SE CONTREDIRE — c'est le défaut qui a fait écrire cette
loi.** Le 27/08, les portes annonçaient *« High Elf »* et *« spent »* pendant que **les voyants à
leur gauche étaient vides**.
🔴 **La cause était une confusion de notions** : l'écran d'appel savait ce qui était **POSÉ**
*(`answered >= expected`)*, le voyant disait ce qui était **CONFIRMÉ** *(passé par son `Done`)*. Ce
ne sont pas les mêmes états — **on peut poser un lignage sans valider son écran**.
⭐ **La parade est un partage des rôles** : l'appelant sait **QUELLE** est la résolution, l'écran
sait **SI** elle compte. Tant qu'elle ne compte pas, il aplatit — et la porte redit sa proposition.

⚠️ **ET CETTE LOI S'ARRÊTE À LA VALIDATION DE L'ÉTAPE** : une fois le `Done` du pied poussé, la
porte **disparaît** et c'est le résumé qui parle *(§ « soit la porte, soit le résumé »)*. Les trois
états se suivent donc : **proposition → résolution → plus de porte du tout.**

---

### 🚨 LE VERROU, LE GENDARME, ET LES BOUTONS BLOQUÉS *(dicté au banc, nuit du 27/08)*

> Eric, devant le cas réel (un budget à 3 points pour 2, conclu avant le correctif) :
> **« tu peux bloquer le Next et faire parler le gendarme en rouge à la place de l'aiguilleur »** ·
> **« il faut bloquer le Done aussi, et laisser le bouton visible pour pouvoir retourner dans
> Skill budget »** · **« le bouton est rouge »** · **« si tu bypass par le menu, t'as Keen Senses
> en rouge dans le bilan »** · **« image de blocage = main sur le bouton · le bouton rouge vers
> lequel tu dois aller : image de doigt »** · **« sur Wood Elf j'ai pas le bouton pour revenir
> en arrière »**.

🔴 **LA LOI : UN VERROU DU NOYAU PRIME SUR UNE SIGNATURE.** Une étape signée dont un plan porte
un verrou (`skill-budget.overspent`…) n'est PAS une étape réglée — et l'écran entier le dit,
d'une seule voix :

| organe | sous verrou |
|---|---|
| **la bande** | elle cesse de guider : le **GENDARME** parle — rouge, le mot du refus (*« Overspent by 1 — 3 of 2 points spent. Go back and remove the extra. »*) |
| **`Done` / `Next`** | **désarmés ET rouges** · au survol : **la main d'arrêt** (`not-allowed`) |
| **la porte fautive** | **octogone ROUGE PLEIN** (il bat le vert de la signature) · au survol : **le doigt** — elle reste le SEUL chemin, elle rouvre le sous-écran |
| **le voyant de la ligne** | rouge — la loi de la porte vaut aussi en rouge : les deux signaux ne se contredisent jamais |
| **la tête du bilan** (étape conclue) | elle **redevient une PORTE**, rouge — *« j'ai pas le bouton pour revenir en arrière »* : même conclue, une étape verrouillée offre son chemin de retour, sans démolir le reste |

⭐ **LES DEUX ROUGES NE DISENT PAS LE MÊME GESTE, et c'est le curseur qui les sépare** : le bouton
désarmé montre la MAIN D'ARRÊT (tu ne passes pas par là), la porte accusée offre le DOIGT (c'est
par ici). Un seul rouge, deux invitations opposées — sans un mot de plus.

⛔ **LE BUG QUI A FAIT ÉCRIRE TOUT ÇA** (lot 67) : le noyau posait le verrou, et l'écran testait
`answered >= expected` — trois novices passaient pour « spent ». **Un dépassement n'est pas une
réponse.** Le compte d'une bourse est EXACT (`===`), et un plan verrouillé n'est jamais résolu.

📌 **Où c'est câblé** : crochet `cfg.gendarme(ctx) → {mot, chemin}` (le catalogue nomme le verrou
et l'item fautif) ; `renderGuideSpecifique` fait le reste. Gardes : `tests/budget-verrou.test.mjs`.

### ✅ `I changed my mind` N'EST **JAMAIS SEUL** DANS SA RANGÉE — tranché 26/08

> Eric, 2026-08-26, capture d'Identity à l'appui : **« la bonne chose à faire, toujours un Next à
> côté de I changed my mind »**.

**La règle tient en une phrase, et c'est ce qui la rend sûre** :

| l'étape est… | le second bouton |
|---|---|
| **réglée** | `Next` — on avance |
| **pas réglée** | `Done` — on règle |

⛔ **CE QUI MANQUAIT ÉTAIT UN QUATRIÈME ÉTAT, ET IL NE SE VOYAIT PAS.** Le pied traitait
`acheve && !conclu` (→ `Next`) et `!acheve` (→ `Done`). Le cas **`acheve && conclu`** — l'étape
réglée ET déjà conclue, **celui où le joueur REVIENT sur un chapitre fini** — ne tombait dans aucune
branche : sa rangée ne portait **que le bouton qui défait**. La seule porte offerte à qui relit une
étape achevée était de la **démolir**.

📌 **La leçon, et elle a une famille** : ⛔ **un `else if` sans `else` ne prévient jamais qu'il ne
couvre pas tout.** Il rend simplement moins que prévu, et **se tait** — c'est *« une absence n'est
jamais une réponse »* sous une autre forme. Le garde ne compte donc pas les boutons *(compter deux
boutons dans un état laisserait entrer un cinquième état non couvert)* : **il refuse le trou**, en
exigeant un `if/else` complet.

---

⭐ **Et la règle générale n'en souffre pas, elle se précise** : la couleur suit l'**état**, sauf
pour ce qui **détruit du travail déjà fait** — là, elle suit **l'acte**, et elle prévient.

### ⭐ LE CRITÈRE : ce n'est pas le MOT, c'est ce que le geste COÛTE

> Eric, 2026-08-26 : *« un bouton **back** sera bleu je pense, **s'il n'impacte rien** »*.

| le geste | couleur |
|---|---|
| **il ne coûte rien** — on se déplace, le travail reste | 🔵 **bleu** |
| **il détruit du travail déjà fait** | 🔴 **rouge** + **popup**, ⛔ **et il ne s'appelle PAS `Back`** |

⛔ **AMENDÉ le 26/08 — « back et next = navigation uniquement ».** J'avais écrit ici que « `Back`
a la couleur de sa conséquence ». **C'est caduc** : un `Back` ne coûte rien **par définition**, et
un bouton qui détruit porte **un autre mot** *(famille DÉFAIRE)*. Le critère du coût reste vrai —
il ne s'applique simplement plus à `Back`, mais **au choix du LIBELLÉ**.

⭐ **Et ça referme la règle des deux axes proprement** : la couleur suit **l'état**, sauf quand le
bouton **détruit** — et « détruit » se mesure au **travail perdu**, pas au vocabulaire du libellé.

### ⭐ LA DÉFINITION DU BLEU, en trois mots

> Eric, 2026-08-26 : **« bleu = mouvement non impactant »**.

⭐ **C'est plus serré que « en cours », et ça dit la même chose** : un mouvement qui ne change
rien **te laisse là où tu étais** — donc toujours en cours. `next`, `back`, la navigation,
l'aiguilleur : **tous déplacent, aucun ne modifie.**

⛔ **Le test tient en une question** : *après ce clic, le document a-t-il changé ?*
**Non → bleu.** Oui et c'est fini → vert. Oui et c'est faux → rouge. Oui et **ça efface** → rouge
avec popup.

📌 Ces boutons portent déjà l'autre précaution du §6 : **un choix important → popup de
confirmation.** Rouge **et** confirmé, jamais l'un sans l'autre.

### 🔴 LES TROIS VERBES — chaque famille de boutons en porte UN

> Eric, 2026-08-26 : *« back et next = **navigation** uniquement »* · **« done = validation »**.

| la famille | son verbe | ce qu'elle fait au document | sa couleur |
|---|---|---|---|
| **`Back` · `Next`** | **NAVIGUER** | ⛔ **rien** | 🔵 bleu |
| **`Done`** | 🔴 **VALIDER** | ✅ il **signe** ce qui est là, puis **remonte d'un cran** | 🟢 vert |
| **`Cancel` · `I changed my mind`** | **DÉFAIRE** | 🔴 il **détruit** du travail fait | 🔴 rouge **+ popup** |

⭐⭐ **Trois familles, trois verbes, aucun recouvrement.** ⛔ Un bouton qui fait deux de ces choses
est un bouton mal nommé — c'est la discipline qu'Eric applique depuis le 17/08 : **il ne règle pas
le cas ambigu, il sépare les mots.**

⚠️ **CECI AMENDE UNE LIGNE QUE J'AVAIS GRAVÉE LE MATIN MÊME.** J'avais écrit : *« `Done` ne signe
rien, c'est la TUILE qui signe »*, en m'appuyant sur `shell.mjs:600` *(« le palier s'avance ICI
plutôt que par `pressDone` »)*. **J'avais sur-lu** : ce commentaire dit que **le palier** avance
par la tuile — il ne dit pas que `Done` ne valide pas. Et la phrase d'Eric du 20/08, citée dans
`catalogue.mjs:573`, disait déjà l'inverse : *« si je dis à BS Done, direction R **POUR VALIDER**
la… »*.

📌 **La leçon** : j'ai lu un commentaire qui parlait **d'un mécanisme** et j'en ai tiré une règle
**sur une intention**. ⛔ Un commentaire de code dit comment ça marche, **pas ce que ça veut dire**.

### 🔴 `BACK` ET `NEXT` NE FONT QUE NAVIGUER — c'est une définition, pas une couleur

> Eric, 2026-08-26 : **« back et next = navigation uniquement »**.

⛔ **Un `Back` ou un `Next` NE MODIFIE JAMAIS LE DOCUMENT.** Ce n'est pas une préférence de
dessin : c'est **ce que ces deux mots ont le droit de faire.**

| | |
|---|---|
| ce qu'ils font | **déplacer le regard**, rien d'autre |
| leur couleur | 🔵 **bleu**, toujours — *« mouvement non impactant »*, §6 |
| ⛔ ce qu'ils ne font pas | **valider · écrire · effacer · signer un choix** |

⭐⭐ **ET ÇA SUPPRIME UN CAS QU'ON AVAIT OUVERT.** J'avais écrit *(§ « le critère »)* qu'un `Back`
« qui détruit du travail » serait rouge. ⛔ **Ce cas n'existe plus** : un bouton qui détruit du
travail **n'est pas un `Back`**, c'est un bouton de la famille **DÉFAIRE**, et il doit **porter un
autre mot** — `Cancel`, `I changed my mind`.

➡️ **Le libellé cesse d'être ambigu** : on ne se demande plus *« ce back-là coûte-t-il quelque
chose ? »*. **Un `Back` ne coûte rien, par définition. S'il coûte, ce n'est pas un `Back`.**

⭐ **C'est la même discipline que « un état, pas deux actions »** : Eric ne règle pas le cas
ambigu, **il supprime l'ambiguïté en séparant les mots.** ⛔ Un bouton dont on doit deviner le
coût est un bouton mal nommé.

📌 **Ce qui se garde** : qu'aucun `Back` ni `Next` n'écrive dans le document. C'est vérifiable
mécaniquement, et ça vaut mieux qu'une relecture.

### ✅ `BACK` ET `DONE` PRENNENT LEUR COULEUR — le 26/08 renverse le 17/08

> Eric, 2026-08-26 : **« back bleu, done vert »**.

⚠️ `shell.css` porte un commentaire daté : **« AUCUNE COULEUR DANS BACK ET DONE — Eric,
2026-08-17 »**. 🔴 **Il est renversé.** La règle du 26/08 s'applique, et le commentaire du 17/08
n'a plus autorité sur ces deux boutons.

⭐ **Et le renversement est cohérent, il n'est pas un caprice** : le 17/08, l'échelle des quatre
couleurs n'existait pas — « aucune couleur » était alors la seule façon de ne pas mentir. Depuis
qu'une échelle dit ce que chaque teinte signifie, **une couleur n'est plus du bruit : c'est une
information.** `Back` est bleu parce qu'il **ne coûte rien** ; `Done` est vert parce que **c'est
fini**.

⛔ **Mais le 17/08 SURVIT là où il porte sur un autre organe** : *« aucune couleur »* reste la
règle de **l'INTERRUPTEUR** *(§ « deux espèces d'interrupteur »)*, et pour la même raison qu'à
l'origine — **un état qui demeure n'a rien à dire à une échelle qui mesure l'avancement.**

📌 **La leçon, pour les prochains renversements** : une règle ancienne ne tombe pas en bloc. Elle
tombe **là où la raison qui la fondait a disparu**, et **tient partout ailleurs**. ⛔ Vérifier
pourquoi elle avait été écrite avant de la retirer.

### ✅ LE GRIS EST `--text-muted`, ET UN `DONE` INACHEVÉ EST GRIS *(tranché 26/08)*

> Eric, 2026-08-26 : *« gris c'est mieux, **le bleu impliquerait un mouvement** »*.

⭐⭐ **L'argument est de sens, pas de lisibilité, et c'est ce qui le rend juste** : le bleu veut
dire **« mouvement non impactant »** — or **un `Done` sur une étape inachevée ne bouge pas**, il
attend. Le peindre en bleu lui prêterait une activité qu'il n'a pas.

➡️ **`Done` reste GRIS tant que l'étape n'est pas achevée**, et il passe au **vert** quand elle
l'est. ⛔ Il ne passe jamais par le bleu.

| le jeton | pourquoi lui |
|---|---|
| 🔴 **`--text-muted`** | **6,06** le jour · **5,59** la nuit — **dans la bande** des autres boutons (5,6–6,1) |
| ⛔ pas `--border-strong` | 4,09 / 3,73 — **hors bande**, plus pâle que tout le reste |

⭐ **Un bouton gris doit rester LISIBLE.** *« Rien n'est fait »* n'est pas *« désactivé au point
d'être illisible »* : **le joueur doit pouvoir lire ce qu'il n'a pas encore fait.**

📌 ⛔ **Aucune teinte n'a été inventée** — c'est un jeton existant, réemployé. La palette garde ses
cinq teintes.

### 🟣 Le rouge peut être accompagné

> Eric : *« le rouge c'est pas bon — **tu peux me mettre un flic en même temps** »*.

Un bouton rouge **dit qu'il y a un problème** ; le **GENDARME** *(popup violet, §7)* **dit lequel**.
⭐ **Les deux ne font pas double emploi** : la couleur se voit d'un coup d'œil et ne prend pas de
place ; le gendarme prend la parole et coûte une interruption. **Le rouge signale, le violet
explique.**

### ✅ QUAND LE GENDARME PARLE — tranché 26/08

> Eric : *« le gendarme **quand ça risque de bloquer**, pas tout rouge je pense »*.

| le cas | le rouge | le gendarme |
|---|---|---|
| un choix hors droit *(+4 pour un droit de +2)* | ✅ | ⛔ **non** — le joueur voit ce qu'il a fait, il défait |
| ⛔ **ça BLOQUE** — on ne peut pas continuer tant que ce n'est pas résolu | ✅ | 🔴 **OUI** |

⭐⭐ **Le critère est mécanique, pas esthétique : le gendarme parle quand le rouge EMPÊCHE
D'AVANCER.** Un rouge qu'on peut corriger soi-même en un geste n'a besoin de personne ; un rouge
qui ferme la route doit dire **pourquoi**, sinon le joueur cherche.

⛔ **Et un gendarme sur chaque rouge serait pire que pas de gendarme du tout** : une interruption
qui survient tout le temps cesse d'être lue. **On la ferme sans la lire, et le jour où elle compte,
elle est fermée aussi.**

📌 **Ce qui se garde** : qu'un gendarme n'apparaisse **que** sur un état qui empêche de continuer.
C'est vérifiable — le juge qui décide « on peut avancer » est le même qui décide « le gendarme
parle ».

### 🔴 L'INTERRUPTEUR — un organe à part entière *(tranché 26/08)*

> Eric, 2026-08-26 : *« les boutons on/off, il y en a plein dans le menu »* · **« on/off
> interrupteur, oui »**.

⛔ **Un `on/off` N'EST PAS UN BOUTON.** C'est un **organe distinct**, au même titre que le jeton,
le collecteur ou le dropdown.

⭐ **La raison est mécanique, pas esthétique** : les quatre couleurs sont **une ÉCHELLE
D'AVANCEMENT** — gris, bleu, vert, rouge — et **un interrupteur ne la parcourt pas.** Il n'est ni
« en cours » ni « fini » : **il est dans une position, et il y reste.** Son rouge ne dit pas
*« c'est faux »*, il dit *« c'est éteint »*.

➡️ **Deux sens du rouge sur le même écran, c'est un rouge qui ne signale plus rien.** La collision
se règle donc **par la FORME**, exactement comme la coupe d'angle distingue le bouton du jeton.

### 🔴 DEUX ESPÈCES D'INTERRUPTEUR — et une seule pose une question

> Eric, 2026-08-26 : *« certains s'allument et **conditionnent l'éteinte de l'autre** : langues,
> impérial/métrique »*.

| l'espèce | ce que c'est | exemples |
|---|---|---|
| **le SÉLECTEUR EXCLUSIF** | plusieurs lignes, **une seule allumée** — allumer l'une **éteint** l'autre | **`Langue`** fr/en · **`Unités`** impérial/métrique · `SRD` / `SRD+FH` |
| **la BASCULE SIMPLE** | un seul état, on/off | l'activation du **guide** *(§7)* |

⭐ **Et le sélecteur exclusif est DÉJÀ BÂTI** — c'est la décision d'Eric du **2026-08-17**, citée
dans `shell.css:792` :

> *« SRD et SRD + FH sont des **sélecteurs, PAS des boutons**. Mets-les en texte l'un au-dessus de
> l'autre avec un bouton on/off ; **quand l'un s'allume, l'autre s'éteint**. »*

Le bloc porte son titre : **« LES LIGNES À BASCULE — un état, pas deux actions »**.

### 🔴 SA RÈGLE DE DESSIN — ⛔ AUCUNE COULEUR

> `shell.css:803` : *« ⚠️ **AUCUNE COULEUR NON PLUS ICI** : l'allumé se dit par la **POSITION du
> pouce** et par l'**encre pleine**, l'éteint par une encre sourde. **Deux canaux, pas un** — et
> `aria-pressed` le dit une troisième fois. »*

⭐⭐ **C'EST CE QUI RÈGLE LE CONFLIT AVEC L'ÉCHELLE, ET PAR CONSTRUCTION** : un organe qui
**n'emprunte aucune couleur** ne peut pas contredire une échelle de couleurs. La formulation
d'Eric du 17/08 — **« un état, pas deux actions »** — avait nommé le problème neuf jours avant
qu'il n'apparaisse.

| | |
|---|---|
| **la forme** | une **piste et un pouce**, ⛔ **DESSINÉS, jamais un glyphe** *(un glyphe change de forme selon la police installée)* |
| **allumé** | le pouce **à droite**, l'encre **pleine**, le mot en **600** |
| **éteint** | le pouce à gauche, une **encre sourde** |
| ⛔ **il ne porte aucun mot** | son nom vient **du texte à sa gauche** |
| **cotes bâties** | ligne **44** · piste **44 × 24** en `--radius-pill` · pouce **18 × 18** |
| son écrivain unique | `markPressed`, tenu par `tests/aria-pressed-guard.test.mjs` |

### ✅ LA BASCULE SIMPLE GARDE SON BOUTON — tranché 26/08

> Eric, 26/08, sur le choix entre la ligne à bascule et le bouton : **« bouton On/Off (19/08,
> 72 × 44, liseré vert) »**, puis, l'objection du vert posée : **« a »** — *on l'assume*.

| | |
|---|---|
| **la forme** | un **bouton 72 × 44**, rayon 8, libellé **`On`** / **`Off`** |
| **allumé** | **liseré vert** |
| **éteint** | pas de liseré |
| ⛔ **le rouge de la dictée** | **SUPPRIMÉ** — un *« éteint »* n'est pas un *« pas bon »* |

🔴 **LE VERT PORTE DONC DEUX SENS — ET C'EST ASSUMÉ.** Dans l'échelle il dit *« fini »* ; ici il
dit *« en marche »*.

⭐ **Ce qui rend la double lecture tenable, et il faut l'écrire pour que personne ne « corrige »
l'un des deux** : le **PORTEUR** diffère, comme pour le rouge du gendarme.

| le vert sur… | ce qu'il dit |
|---|---|
| un **bouton de commande** *(`Done`)* | **fini** — l'échelle |
| un **bouton `On`/`Off`** | **en marche** — un état |
| 🔴 une **pastille de coffre** *(Seuil, tranché 26/08)* | **vivant** — une santé |

⛔ **Un lot ne doit donc JAMAIS dériver l'état d'un `On`/`Off` de la même source que la couleur
d'un bouton de parcours.** Ce sont deux mécaniques distinctes qui rendent la même teinte.

### ✅ LE TROISIÈME SENS DU VERT — la pastille de coffre *(tranché 26/08)*

> Eric, 2026-08-26, les trois formes rendues devant lui : **« C — la pastille et la date »**.

Le bloc coffre du **Seuil** porte, en 2ᵉ ligne, une **pastille** *(un point de 8 px)* + le **mot de
l'état** + **· depuis quand** : `🟢 Vivant · vu il y a 3 jours` · `🔴 Injoignable · …` ·
`🟠 Changé · …`.

⭐ **POURQUOI LES DEUX, ET ÇA S'EST VU AU RENDU, PAS DANS LE RAISONNEMENT** : la **date seule est
muette sur l'état** *(« il y a 12 jours » ne dit pas si le coffre est mort ou tranquille)* ; la
**pastille seule est muette sur le temps** *(un « Vivant » ne distingue pas ce matin d'il y a un
mois)*. ➡️ **La pastille signale, la date explique** — la loi du §7 *(« le rouge signale, le violet
explique »)* appliquée à un bloc qui ne parle pas.

⭐⭐ **ET LA RÈGLE QUI TIENT LES TROIS VERTS EST TOUJOURS LA MÊME : le PORTEUR diffère.** Un bouton
qu'on appuie · un interrupteur qu'on bascule · **un point qu'on ne touche pas**. ⛔ Ne jamais
« corriger » l'un d'après un autre : ils ne dérivent pas de la même source et n'ont aucune raison
de converger.

⚠️ **Et le sélecteur exclusif, lui, ne change pas** : il reste **sans aucune couleur** *(position du
pouce, encre pleine — décision du 17/08)*. **Les deux espèces divergent donc aussi par le dessin**,
et c'est cette divergence qui les rend reconnaissables :

| l'espèce | son dessin |
|---|---|
| **sélecteur exclusif** *(`Langue`, `Unités`)* | piste + pouce, ⛔ **aucune couleur** |
| **bascule simple** *(le guide)* | bouton `On`/`Off`, **liseré vert allumé** |

### 🔴 LE REGISTRE DES BOUTONS — la famille entière, en une table *(26/08)*

> Eric, 2026-08-26, en les énumérant : *« le `?` et le livre **sont des boutons** »* · *« `+` et `−`
> sont **aussi** des boutons, avec leur propre forme, l'un rouge l'autre vert »*.

| le bouton | sa forme | sa couleur |
|---|---|---|
| `Back` · `Next` | **octogone à coupe** | 🔵 bleu — *mouvement non impactant* |
| `Done` | octogone | ⚪ gris inachevé → 🟢 vert fini |
| `Cancel` · `I changed my mind` | octogone | 🔴 rouge **+ popup** |
| **`+`** | 🔴 **carré ou petit cercle** | 🟢 **VERT** |
| **`−`** | la **même** forme que le `+` | 🔴 **ROUGE** |
| **le `?`** | un **rond** de 22 px | ⛔ **aucune couleur de l'échelle** — parchemin ou contour |
| **le livre** | un **rond** de 22 px, la jumelle du `?` | ⛔ aucune |
| **`On` / `Off`** | un bouton **72 × 44** | 🟢 liseré vert allumé |
| 🃏 **le tarot** | ⚖️ **une CARTE** — exception argumentée *(ci-dessus)* | — |
| 🚪 **le bouton de PROPOSITION** | octogone, **T3** | ⚪ neutre — *« il reste ça à faire »* |
| 🚪 **le bouton de RÉSOLUTION** | octogone, **T3** + un sous-titre **T1 italique** | 🟢 vert — *« c'est réglé »* |

---

#### 🚪 LES DEUX BOUTONS DE MENU DE CRÉATION *(Eric, 27/08)*

> **« nouvelles normes aussi pour les boutons de menus de création : bouton de PROPOSITION /
> bouton de RÉSOLUTION »**

🔴 **C'EST LE BOUTON LE PLUS FRÉQUENT DU BUILDER, ET IL MANQUAIT À CE REGISTRE.** Chaque menu
d'étape en aligne deux, trois ou quatre — `Lineage`, `Skill budget`, `Ability boosts`, `Languages`,
`Origin feat`, `Cantrips`… Ils portaient un habit sans avoir de nom.

| | le bouton de **proposition** | le bouton de **résolution** |
|---|---|---|
| **ce qu'il dit** | *« voilà ce qui reste à décider »* | *« voilà ce qui a été décidé »* |
| **son texte** | le nom de la question — *« Lineage »* | la **résolution** — *« High Elf »* |
| **son sous-titre** | ⛔ aucun | la question, en **T1 italique** — *lineage* |
| **son voyant** | ⚪ **vide** | 🟢 **vert** |
| **quand** | tant que la condition n'est pas remplie | dès qu'elle l'est |

⭐⭐ **CE N'EST PAS DEUX BOUTONS, C'EST UN BOUTON À DEUX ÂGES.** Le même organe, au même endroit,
qui change de discours quand la condition bascule. ⛔ **Ne pas en faire deux composants** : le jour
où ils divergeraient, un menu montrerait une proposition résolue.

⚠️ **ET UNE RÉSOLUTION N'EST PAS TOUJOURS UN NOM.** `Skill budget` n'a pas UNE réponse — il en a
autant que de compétences dotées, et aucune ne tient dans un bouton. Sa résolution est un **état** :
*spent*. **Une résolution dit que c'est résolu ; elle ne dit pas forcément par quoi.**

⛔ **LES DEUX SIGNAUX NE PEUVENT PAS SE CONTREDIRE**, et c'est le défaut qui a fait écrire cette
norme : le 27/08, des boutons annonçaient *« High Elf »* et *« spent »* pendant que **leurs voyants
étaient vides**. La cause était une confusion de notions — l'écran d'appel savait ce qui était
**POSÉ**, le voyant disait ce qui était **CONFIRMÉ**. **On peut poser un lignage sans valider son
écran.**

📌 **LE TROISIÈME ÂGE EST L'ABSENCE** : une fois l'étape entière validée par le `Done` du pied, le
bouton **disparaît** et son résumé prend sa place *(§ « soit la porte, soit le résumé »)*.
**proposition → résolution → plus de bouton du tout.**

⭐ **CE QUE LA TABLE APPREND, ET QU'AUCUNE LIGNE SEULE NE DISAIT** : *« bouton »* ne veut pas dire
*« octogone »*. **L'octogone est l'habit des trois gabarits À LIBELLÉ** ; un bouton qui porte un
**glyphe** ou un **dessin** n'a pas de mot à cadrer, donc pas de coupe à porter. ⛔ Un lot qui
octogonaliserait le `?` ou le `+` appliquerait la règle du mauvais membre de la famille.

📏 **UN DÉFAUT MESURÉ EN ÉCRIVANT CETTE TABLE** : `.pipeline-pas` servait le `+` **et** le `−` avec
une seule règle portant `border: 1px solid var(--critical)`. **Le `+` était rouge** — il disait
*« ce n'est pas bon »* au moment précis où le joueur AJOUTE quelque chose. ✅ Corrigé le 26/08 : la
**forme** leur reste commune, la **couleur** les sépare.

---

### 🔴 LE QUATRIÈME GABARIT — `+` et `−`

> Eric, 2026-08-26 : *« les boutons + et − peuvent être dans des petits cercles (+ vert) (− rouge) »*
> · **« ce sont des boutons »**.

| | |
|---|---|
| **ce que c'est** | 🔴 **un BOUTON**, un quatrième gabarit à côté de small / large / no-constraint |
| **forme** | **carré** ou **petit cercle** |
| **couleur** | **`+` vert · `−` rouge** |

⭐ **Donc la coupe d'angle n'est pas « ce qui fait un bouton » — c'est l'habit des trois gabarits
à libellé.** Un `+`/`−` n'a pas de libellé : son glyphe le nomme, sa forme n'a rien à porter.

🔴 **`--touch` 44 tient, même si le cercle est petit.** ⛔ Un contrôle ne se laisse jamais
dimensionner par son dessin : le rond peut faire 24 px, **sa cible en fait 44**.

### 🔴 LE VOYANT D'AVANCEMENT — c'est le CRAN DE LA CEINTURE *(tranché 26/08)*

> Eric, 2026-08-26 : *« le voyant d'avancement (dans le belt) : **rouge erreur / bleu avancement /
> vert fin** »*.

⛔ **Ce n'est pas un organe de plus.** Le « cercle avec numéro d'étape » de la dictée **EST**
`.belt-index`, le chiffre d'un cran de ceinture. ⛔ Ne pas en fabriquer un second.

| état | le voyant | dans le code |
|---|---|---|
| **rien fait** | liseré basique, chiffre nu | ✅ le défaut |
| 🔵 **avancement** | **bleu** | 🔴 **n'existe pas** |
| 🟢 **fin** | **disque PLEIN vert**, chiffre en `--on-accent` | ✅ `.belt-item[data-fait="true"]` |
| 🔴 **erreur** | **rouge** | 🔴 **n'existe pas** |

⭐ **Une règle de dessin qu'Eric a déjà donnée le 19/08, et qui vaut pour les quatre états** :
*« le 1 dans le belt doit être **TOTALEMENT** vert, et on doit voir le chiffre dessus »*.
➡️ **Un anneau se lit « en cours », un disque PLEIN se lit « fait ».** C'est la différence entre
**un contour et un état** — et elle doit tenir pour le bleu et le rouge aussi.

⚠️ **Et l'encre du chiffre est celle du FOND, pas du texte** : sur un disque plein, `--text`
(clair de nuit) tomberait sous le seuil. `--on-accent` est le jeton fait pour ça.

⭐ **Une distinction déjà payée, à ne pas perdre** : le vert vivait sur `data-status="done"`, qui
veut dire *« tu es passé devant »* — **un chapitre traversé sans rien y poser s'allumait quand
même**. Il vit désormais sur `data-fait`, prononcé par le juge de Review. ⛔ **Traverser n'est pas
finir**, et le bleu ne devra pas retomber dans le même piège : *« en cours »* n'est pas *« ouvert
une fois »*.

⏳ **Reste à construire** : le **bleu** et le **rouge**. ⏳ Et à trancher : quel juge prononce
« erreur » sur une étape ?

### 🔴 LES CHEVRONS — un seul objet, deux rôles *(tranché 26/08)*

> Eric : *« pour le moment le chevron est une aide à la navigation latérale **AUSSI** »*.

⭐ **Un seul objet.** Il amorce le défilement **et** il fait naviguer dans une liste paginée.
⛔ Ne pas en fabriquer deux.

| | |
|---|---|
| **place** | 🔴 **à GAUCHE et à DROITE** — ⛔ **pas au-dessus** |
| **sous chaque chevron** | 🔴 le **nombre de pages** et le **nombre d'items** |
| **allure** | **petit et discret** |
| ⛔ **pas dans la marge** | il se pose **sur** la dalle, au ras de son bord *(§1 bis)* |
| **apparition** | à l'approche du doigt ou de la souris — **500 ms de présence suffisent** |
| **disparition** | il s'efface, **MAIS LA ZONE RESTE CLIQUABLE** |
| **effet** | appuyer = **scroll** / page suivante |

~~⭐ *« Pas besoin d'être efficace au tactile — surtout utile pour la souris. »*~~
🔴 **RENVERSÉ LE 2026-09-02** — Eric, sur le chevron du belt : *« il doit fonctionner en tactile
et en clic souris »*. C'était la **seule** exception à `--touch` 44 de tout le registre ; elle
tombe. ➡️ La cible d'un chevron vaut `--touch`, et c'est le DESSIN qui se déduit d'elle
(`44 − 2 × 8 = 28`), jamais l'inverse. ⚠️ **Et ça se paie ailleurs, dit plutôt que masqué** : au
belt étroit, les 12 blg gagnés par chaque cible sont pris aux trois tuiles, qui passent de 79 à
**71 blg**. *« Un contrôle ne se laisse jamais dimensionner par un dessin »* — ni par ses
voisins. Voir §6 ter, le belt.

⭐ **Et le compte sous le chevron est ce qui accomplit la norme des listes** : sans lui, une liste
paginée est un défilement sans fin ; avec lui, **toute liste a une taille connue** et le joueur
sait toujours où il en est.

⚠️ **Écart mesuré avec le code du 15/08** : `.stage-chevrons` est aujourd'hui **en haut et en bas**
(`position: absolute; inset: 0`, 36 × 14, non tactile — *« une amorce redondante avec le geste de
défilement, pas un contrôle »*). La norme le déplace **à gauche et à droite** et lui ajoute un
compte. ⛔ La cote 36 × 14 et le refus du `--touch` 44 datent d'un objet qui n'était **qu'**une
amorce : ⏳ **à revérifier maintenant qu'il devient aussi un contrôle de pagination.**

---

## 6 ter. 🎗️ LE BELT — DEUX LARGEURS, ET CE QUI CHANGE DANS CHACUNE *(2026-09-02)*

> Eric, 2026-09-02, croquis `2026-09-02-belt-etroit-tuiles-egales.jpg` :
> **« TOUTES LES TUILES DU MENU FONT LA MÊME TAILLE »** · *« sur la version courte je rajoute ces
> chevrons cliquables, qui s'intercalent parfaitement entre les tuiles »* · *« quand je suis en
> bout de course le chevron disparaît »* · *« mets le voile à 100 % pour menu et sheet »* ·
> **« désormais le belt fonctionne sur deux largeurs, avec des exceptions dans chaque format ;
> il doit fonctionner en tactile et en clic souris »**.

🔴 **CE QUI NE CHANGE PAS, ET C'EST LA CONSTANTE DE CADRES §0** : la ceinture est **toujours
visible**, elle fait **60 blg**, et le panneau garde ses **500**. Tout ce qui suit se loge dans ces
60 blg — un belt qui grandit prend sa place à la scène, et le 31/08 a mesuré qu'il n'y a que
**9 blg** de mou.

### ⭐ LA LOI, EN UNE PHRASE : **une tuile vaut la piste divisée par ce qu'elle montre**

| | **le belt ÉTROIT** *(vue simple)* | **le belt DÉROULÉ** *(vue double)* |
|---|---|---|
| ce que la piste montre | **3** crans *(le croquis en dessine trois)* | **les 8** |
| la piste | **229** blg | **684** blg |
| **une tuile** | **71** | **78,5** |
| le chevron | ✅ **deux**, un par bout | ⛔ **aucun** — il n'y a plus de course |
| le défilement | oui, d'un cran à la fois | ⛔ **aucun** — tout est là |

⛔ **CE N'EST PAS DEUX RÈGLES, C'EST UNE RÈGLE ET DEUX COMPTES.** La même formule sert les deux
formats ; ce sont *« les exceptions dans chaque format »* qu'Eric nomme, et elles se réduisent à
un nombre de crans visibles. ⭐ Une seule ligne de feuille bascule le tout —
`--belt-chevron-zone`, qui vaut 24 en étroit et 0 en double.

### 📐 LA TUILE — deux rangs, et c'est ce qui rend « la même taille » possible

| | |
|---|---|
| **le dessin** | la **pastille numérotée** AU-DESSUS, le **nom** en dessous, centrés |
| **le corps du nom** | 🔴 **T2**, interligne **1** |
| **la hauteur** | **44** — `--touch`, le plancher, atteint pile |
| **la largeur** | ⛔ **jamais écrite** — elle se déduit de la piste *(§1 ter)* |

⭐ **POURQUOI DEUX RANGS, ET CE N'EST PAS UN GOÛT** : côte à côte, la pastille et le mot faisaient
une largeur qui suivait **le mot** — mesuré, `Class` 99 blg contre `Inheritance` 142. Empilés, la
largeur ne dépend plus de rien, et *« toutes les tuiles font la même taille »* devient possible
**par construction** plutôt que par réglage.

📏 **DEUX RANGS N'EST PAS UNE PRÉFÉRENCE : UN SEUL RANG NE RENTRE NULLE PART**, et c'est mesuré
sur la page rendue. Un rang demande `2 + pastille 22 + 2 + le mot + 2` :

| un seul rang | la tuile offre | le contenu demande | il manque |
|---|---|---|---|
| **T2**, belt étroit | 71 | **92** | 21 |
| **T2**, belt déroulé | 78 | **92** | 14 |
| **T1**, belt étroit | 71 | **81** | 10 |
| **T1**, belt déroulé | 78 | **81** | **3** |

⛔ **Aucune case ne passe** — pas même la plus favorable, le corps le plus petit dans la tuile la
plus large. ⭐ **Et ça referme l'objection qui vaut la peine d'être posée** : *« une fois les tuiles
égales, la piste double offre 78,5 — plus large que 71 — donc le mot y tient »*. Il y tient
**seul** ; il n'y tient pas **à côté de la pastille**. Le déficit du lot 120 n'a pas disparu avec
les tuiles à contenu, il a changé de forme.

📏 **ET LE CORPS EST T2 PARCE QUE LES VIDES ONT CÉDÉ.** Le mot-témoin `Inheritance` demande
**64 blg** ; à 8 de rembourrage la tuile n'en offrait que 63 — *il manquait un blg*.
⛔ **La réponse n'est pas de rétrécir l'organe**, c'est §2 bis : *« quand un écran déborde, ce sont
les VIDES qui cèdent, jamais les organes »*. Deux vides ont cédé — le rembourrage latéral
*(4 → 2)* et l'interligne *(1,2 → 1)* — et la place est passée à **67** pour 64 demandés.
⭐ **La leçon vaut au-delà de ce cran** : un organe qu'on descend d'un barreau *« parce qu'il
manque un demi-pixel »* est presque toujours un vide qu'on n'a pas regardé.
⚠️ **Et l'interligne n'est pas un détail** : c'est lui qui garde la tuile à **44** et donc la
ceinture à **60**. À 1,2 la tuile rendait 46,4, et la ceinture 62 — deux blg pris à la scène.

⚖️ **ET ÇA RENVERSE UNE DÉCISION DU LOT 120, DONT LA CAUSE A DISPARU.** Le 120 rendait le cran en
**numéro seul** en vue double, parce que les huit crans à un rang demandaient **995 blg pour
684**. Deux rangs suppriment cette largeur : **le nom est revenu partout**, et plus rien n'efface
un `textContent`. ⭐ C'est exactement ce que *« ça va en partie s'extrapoler à la version large »*
voulait dire.

### ⭐ LA LEÇON À PART : **UN VIDE SE PAIE AILLEURS QU'OÙ ON LE REGARDE** *(02/09)*

> Relevée en mesurant la tuile, et sortie de sa section à la demande de l'architecte : elle ne
> parle pas du belt, elle parle de tous les budgets.

📏 **LE CAS, EN TROIS NOMBRES.** Le libellé de la tuile était à l'interligne **1,2**. On regardait
ce vide comme un réglage de TEXTE — deux blg de blanc autour d'un mot, la chose la plus anodine
d'une feuille de style. Mesuré, il rendait la tuile à **46,4** au lieu de 44, donc la ceinture à
**62** au lieu de 60 : **deux blg pris à la SCÈNE**, à l'autre bout du panneau, sur un budget qui
n'a que **9 blg** de mou *(mesure du 31/08)*.

🔴 **LA LOI : UN VIDE N'EST PAS LOCAL.** Dans une chaîne de boîtes, tout espace intérieur remonte —
l'interligne pousse la ligne, la ligne pousse la tuile, la tuile pousse la ceinture, la ceinture
prend sa place à ce qui est dessous. ⛔ **Le regarder à l'endroit où il est écrit ne dit donc rien
de ce qu'il coûte.** C'est la même famille que *« 32 = 16 + 16 »* du §4 ter — deux marges
légitimes, chacune juste de son côté, qui ne se voient qu'en **décomposant** l'écart.

⭐ **ET C'EST LE COMPLÉMENT EXACT DE LA LOI DU §2 bis** *(« quand un écran déborde, ce sont les
VIDES qui cèdent, jamais les organes »)*. Cette loi-là dit **quoi** faire céder ; celle-ci dit
**où chercher** — ⛔ pas forcément dans la boîte qui déborde. Le vide qui a sauvé le corps du
libellé n'était pas dans la ligne du texte, il était dans l'interligne d'un mot à deux boîtes de
là.

➡️ **LE GESTE, EN UNE PHRASE** : avant de descendre un organe d'un barreau, **écrire la somme
verticale de sa boîte** et regarder lequel de ses termes est un vide. Un organe qu'on rétrécit
*« parce qu'il manque un demi-pixel »* est presque toujours un vide qu'on n'a pas décomposé.

### 🎚️ LE CHEVRON DU BELT — un organe du seul format étroit

| | |
|---|---|
| **où** | dans la gouttière **entre l'onglet de bout et la première tuile**, aux deux bouts |
| **la cible** | 🔴 **`--touch` 44** — *« il doit fonctionner en tactile et en clic souris »* |
| **sa boîte** | **28** = `--touch − 2 × --sp-8`, **déduite de la cible**, jamais l'inverse |
| **le trait** | **12** dans cette boîte, épaisseur `--sp-2` |
| **son habit** | 🔴 **AUCUNE TUILE** — le trait seul, à **35 %** *(`--chevron-trait`)*, flottant sur le décor |
| ⛔ **dessiné, jamais un glyphe** | deux bords d'un carré tournés de 45° *(la loi du pouce et du livre)* |
| **le pas** | **une tuile**, jamais un écran : la rangée passe de `1 2 3` à `2 3 4` |
| **en bout de course** | 🔴 **il disparaît** — ⭐ **et sa place reste** |

⚖️ **LE VOILE EST SUR LE TRAIT, PAS SOUS LUI — renversé le 2026-09-02, et c'est une LECTURE qui
était fausse, pas une consigne qui a changé.** Eric : *« rends sa tuile invisible, voile 0 % ; je
veux juste voir la flèche, qui flotte au-dessus du background. La flèche est un organe (c'est un
bouton spécial) et a un voile à 35 %. »*

⛔ **CE QUE J'AVAIS ÉCRIT ICI, ET POURQUOI C'ÉTAIT FAUX.** J'avais lu son *« transparence voile
35 % »* comme le voile d'une **dalle posée SOUS** la flèche, au motif qu'un cran est une dalle à
35 % *(15/08)* et que le chevron *« s'intercale entre les tuiles »*. La déduction se tenait — et
son croquis ne dessinait **qu'un trait nu**. C'était une **surface de plus** dans une rangée qui
en porte onze.
⭐ **Le 35 % vit donc sur l'ENCRE** : `--chevron-trait` vaut `color-mix(in srgb, var(--text)
var(--voile-simple), transparent)` — la formule exacte des trois dalles, transposée d'un fond à un
trait. ⛔ Aucun pourcentage inventé, et elle bascule avec le thème puisque `--text` le fait déjà.

⭐ **CE QUI SURVIT DE LA LECTURE FAUSSE, ET C'EST L'ESSENTIEL** : la CIBLE n'a pas bougé d'un blg,
ni la place réservée dans la piste. **On a retiré une PEINTURE, pas une COTE** — la distinction du
collecteur du 26/08, *« retirer le dessin, pas la cote »*.

⛔ **ET LES DEUX BOUTS RESTENT À 100 %** *(même jour)* : `Menu` et `Sheet` ne sont pas des étapes,
et l'opacité le dit sans un mot. La raison tient sans la dalle du chevron — elle ne dépendait
d'elle que dans ma phrase, pas dans les faits.

📌 **ET LE TRAIT REMPLIT SA BOÎTE** *(02/09, lot 131)* : il a dessiné **8** blg dans une boîte de
**28** pendant une demi-journée — vingt blg de vide autour d'une flèche qu'Eric avait demandé à
voir. Rien n'était faux, aucune cote ne débordait, la suite était verte. ⭐ **Un rendu se regarde :
compter ne dit rien de ce que l'œil reçoit.**

🔴 **SA PLACE RESTE QUAND IL DISPARAÎT**, et c'est la moitié qu'on oublie : le chevron est posé en
ABSOLU sur une zone que la piste **réserve** dans son écart. Le retirer ne déplace donc aucune
tuile — sans ça, la rangée sauterait d'un cran chaque fois qu'on atteint un bout. C'est la loi du
§6 *(« il s'efface, mais la zone reste »)*, appliquée à la lettre.
⛔ **`hidden`, jamais un `display: none` en feuille** *(défaut n°3, garde 4)* — et la règle
d'auteur se borne à `:not([hidden])`, faute de quoi elle **bat** le `[hidden]` de l'agent
utilisateur : mesuré le jour même, le chevron restait peint en annonçant qu'il n'y était plus.

📐 **AUCUNE TUILE N'EST JAMAIS COUPÉE, ET C'EST DE L'ARITHMÉTIQUE** : la piste vaut
`3 × 71 + 2 × 8 = 229`, le pas vaut `71 + 8 = 79`, et `keepInView` **centre** le cran courant —
donc `scrollLeft = 79 × (n − 1)`, toujours un multiple exact du pas. **Les trois régimes de
défilement — le chevron, le recentrage, l'aimantation — tombent sur les mêmes bornes.**
⭐ C'est ce qui autorise la piste à **clipper** son contenu *(un écart, plus un rembourrage)* sans
contredire la règle du 15/08 : *« une dalle tranchée net fait une arête, pas une amorce »* — il
n'y a jamais de dalle tranchée.

### 🔒 TROIS TUILES, ET T2 — la question est FERMÉE PAR LA MESURE *(02/09)*

> Eric : *« regarde si tu peux mettre 4 boutons sur une vue sans que rien ne se chevauche »*, puis,
> après l'avoir essayé lui-même : *« ça ne passe pas, on reste à 3 visibles d'un coup »* · *« essaie
> de voir si tu peux mettre du T3 partout sinon T2 »* · **« priorité 1 ergonomique, priorité 2
> joli »**.

📏 **LA RANGÉE EST PLEINE AU BLG PRÈS**, relevée abscisse par abscisse sur le site DÉPLOYÉ, à 375 :

```
onglet Menu   −29 →  29        chevron      302 → 346   (44 = --touch)
chevron        29 →  73  (44)  onglet Sheet 346 → 404
piste          73 → 302  (229 = 71 + 8 + 71 + 8 + 71)
                     29 + 44 + 229 + 44 + 29 = 375
```

⭐ **UNE SOMME QUI FERME PROUVE QU'IL N'Y A RIEN À PRENDRE** — là où *« ça a l'air serré »* ne
prouve rien. ⛔ Une tuile ne peut donc s'élargir qu'en prenant sur une **cible tactile** : le
chevron à `--touch`, ou la moitié visible d'un onglet (29). **Priorité 1 l'interdit.**

📏 **ET T3 NE PASSE PAS** — mesuré au rendu sur `Inheritance`, le mot le plus long, dans la police
servie : il demande **74,2 blg**.

| ce que la tuile offre au mot | T3 (74,2) |
|---|---|
| **en service** *(rembourrage 2)* — **67** | manque **7,2** |
| rembourrage 0 — 71 | manque 3,2 |
| gouttière 4 **et** rembourrage 0 — 73,7 | manque **0,5** |
| onglets poussés à 19 visibles — 73,7 | manque **0,5** |
| onglets 19 **et** rembourrage 1 — 75,7 | ✅ passe, de 1,5 |

🔴 **SEULE LA DERNIÈRE PASSE, ET ELLE FAIT TOMBER LA PRISE DE L'ONGLET DE 29 À 19 BLG.** Refusée —
priorité 1. **C'est T2**, et ce n'est pas un goût : c'est ce que la rangée porte.
📌 Et T3 rate **aussi en vue double** *(tuile 78, offert 74, demandé 74,2 — il manque 0,2)* : le
repli d'Eric s'applique des deux côtés.

⭐⭐ **POURQUOI CETTE TABLE EST DANS LA BIBLE PLUTÔT QUE DANS UN RAPPORT** : un refus CHIFFRÉ se
discute, un refus d'opinion se contourne. Le jour où quelqu'un redemande quatre tuiles ou T3, il
lit **de combien** ça rate et **ce que ça coûterait**, au lieu de refaire la mesure.
⛔ **Les trois seules réserves de largeur sont des cotes DATÉES** : la cible du chevron *(02/09)*,
la moitié visible des onglets *(19/08)* et l'air entre tuiles *(15/08, « la taille du a de
Barde »)*. En libérer une est une décision d'Eric, jamais une conséquence d'un lot.

### 🎛️ LES DEUX BOUTS — `Menu` et `Sheet`, à 100 %

| | |
|---|---|
| **leur voile** | 🔴 **100 %, opaque** *(ils valaient 80 % depuis leur naissance)* |
| **ce que ça dit** | ⛔ **ils ne sont pas des étapes** — ils sortent de la rangée sans un mot |
| le reste | inchangé : demi-pastille happée par le bord, mot vertical, liseré 1 px |

### ⚠️ CE QUE LE BANC NE SAIT PAS MESURER, dit plutôt que masqué

📏 Mesuré le 02/09 dans le navigateur du banc : **aucun défilement lissé de script ne bouge** —
ni sur la piste, ni sur la scène, dont les chevrons sont pourtant en production depuis le lot 70 ;
et **aucun événement `scroll` n'est délivré**, même à un écouteur posé à la main juste avant.
⛔ **C'est l'instrument qui est muet, pas le dépôt** — la même leçon que le `WKWebView` du 31/08,
où l'iPad d'Eric a renversé le banc. On ne change pas le code pour plaire à un banc.
⭐ **Ce que ça impose quand même, et c'est une bonne règle** : un geste peint **lui-même** l'état
de ses chevrons, sur la position **visée** — jamais en attendant un événement. Un chevron qui
mentirait pendant toute l'animation mentirait précisément pendant qu'on le regarde.

---

## 7. LES TROIS POPUPS — trois rôles, trois couleurs *(26/08)*

> 🔴 **C'EST L'APPLICATION QUI EST EN STANDBY, PAS LA NORME** — Eric, 2026-08-26 : *« les guide
> gendarme aiguilleur, toujours en standby et à l'étude »*, puis, sur ce paragraphe même :
> **« c'est juste son APPLICATION qui est en standby »**.
>
> ✅ **CE QUI SUIT FAIT AUTORITÉ.** Les trois rôles, leurs couleurs, la pile et les pastilles sont
> **tranchés** : un lot qui construit un popup s'y conforme, et un lot qui les contredit est refusé.
> ⛔ **CE QUI ATTEND** : aller **déployer** les trois voix sur les écrans — dessiner le gendarme,
> poser les pastilles, migrer les tutoriels. **Personne ne part faire ça sans qu'Eric rouvre.**
>
> ⭐ **LA DIFFÉRENCE COMPTE POUR UN LOT** : il LIT cette section et l'applique à ce qu'il touche ;
> il ne PART PAS en chantier dessus. Une norme en standby resterait une norme non écrite — celle-ci
> ne l'est pas.
>
> ✅ **ET UNE PIÈCE SORT EXPRESSÉMENT DU STANDBY** — Eric, le même jour : **« le point d'entrée au
> guide `?` doit être fait par contre »**. Voir §7 *(le `?`)* : son passage dans la rangée, ses deux
> aspects, et le popup-parchemin porté aux étapes qui ne l'ont pas encore.
>
> ⏳ **ET LES FENÊTRES DERRIÈRE EN FONT PARTIE** *(Eric, 26/08 : « ça fait partie du standby »)*.
> 📏 Mesuré le même jour, **trois objets, trois traitements** : `.popup` ne voile **rien** *(la page
> reste entière et cliquable)* · `.aiguilleur` du départ voile **tout l'écran à 72 %** ·
> `.confirm-dialog` vit **dans le flux**. ⛔ **Aucune règle n'est écrite**, et ce paragraphe n'en
> écrit pas.
> ⚠️ **Ce qu'un lot doit savoir quand même** : le `.popup` a une raison DURE de ne rien poser
> derrière — ancré `bottom: 0`, il est **là où vivent les récepteurs du glisser**, et un dépôt
> atterrissait dessus *(défaut mesuré le 20/08, payé par `pointer-events: none`)*. ⛔ Ne pas lui
> ajouter un voile « pour faire comme l'aiguilleur ».
>
> ⏳ Le chantier est ouvert au vault, `0.TASKS/Tasks RPG.md` — *« FHPC : les trois voix »*.

### ✅ CE QUI EST TRANCHÉ MALGRÉ LE STANDBY — le nom de l'objet du départ *(26/08)*

> Eric : **« c'est plutôt un aiguilleur, on a TOUJOURS besoin de lui »**.

La fenêtre qui demande *« I keep my kit »* ou *« Take the 50 GP »* s'appelait **« guide
obligatoire »**, puis `decision-kit`, puis **`aiguilleur`** — trois noms en un jour, et chacun a
corrigé une faute.

⭐⭐ **SA PHRASE PORTE LE CRITÈRE, PAS SEULEMENT LE MOT** : le **guide** est défini par son caractère
**OPTIONNEL** — *« il ne réclame rien »*, on le congédie, on le rouvre au `?`. Celui-ci ne se
congédie pas : sans réponse, l'étape n'a pas de point de départ.
➡️ 🔴 **CE QU'ON NE PEUT PAS REFUSER N'EST PAS UNE AIDE.**

⏳ **ET CE QUE ÇA LAISSE OUVERT, dans le chantier en standby** : §7 range l'aiguilleur parmi les
POPUPS, et §2 dit qu'un popup *« parle, on ne l'appuie pas »*. Celui-ci porte **deux boutons**. Un
aiguilleur qui exige une réponse n'est pas la même forme qu'un aiguilleur qui prévient en passant.
⛔ **À Eric de dire si ce sont deux organes ou un seul.**

---


| l'organe | couleur | ce qu'il dit |
|---|---|---|
| **le GUIDE** | 📜 **parchemin** — la surface elle-même | une aide **OPTIONNELLE** |
| **l'AIGUILLEUR** | 🔵 **bleu** | 🔴 **il PRÉVIENT** — *« attention, voilà où tu vas »* |
| **le GENDARME** | 🔴 **ROUGE** *(corrigé 26/08 — le violet est pris)* | 🔴 **il DIT L'ERREUR** — *« voilà ce qui ne va pas »* |

⭐ **Eric, 26/08, en trois mots chacun** : *« le gendarme **dit l'erreur** »* · *« l'aiguilleur
**prévient** »*.
➡️ **Le temps les sépare** : l'aiguilleur parle **AVANT** *(ça va coincer)*, le gendarme parle
**APRÈS** *(ça a coincé, voilà quoi)*. ⛔ Deux voix, deux moments — un aiguilleur qui constate
arrive trop tard, un gendarme qui anticipe crie pour rien.

⭐ **Le guide n'a pas de couleur de signal, et c'est ce qui le rend optionnel** : il ne réclame
rien. Les deux autres portent un signal, **donc ils interrompent**.
🔴 **LE VIOLET EST PRIS : violet = MAGIE** *(Eric, 26/08)* — les voyants d'attunement, et tout ce
qui relève du magique dans l'Équipement. ⛔ Il ne peut donc pas servir à un popup. **Le gendarme
redevient rouge.**

### ⚠️ Le code est en ÉCART sur ce point — et c'est le code qui a tort

| | |
|---|---|
| **le croquis d'Eric** | la pastille d'attunement est **violette** |
| **le code aujourd'hui** | `.b3-attune` porte **`--accent`** = **`#845933`**, mesuré : **teinte 28°**, un brun-cuivre |
| **la palette** | ⛔ **aucun violet** dans `tokens.css` *(accent, positive, caution, critical, info)* |

⭐ **Les croquis d'Eric priment sur le texte et sur le code.** Donc : **`--magie` est une teinte à
créer**, et la pastille d'attunement doit la porter. ⏳ Travail réel, pas une convention à écrire.

📌 **Et la leçon de la façon dont on l'a trouvé** : j'ai d'abord écrit *« elle porte `--accent`,
pas du violet »* — en lisant **le NOM du jeton, pas sa VALEUR**. Eric a répondu « c'est du
violet », j'ai mesuré `#845933`, et c'était un brun. **Aucun de nous deux ne lisait la même chose.**
⛔ Un nom de jeton ne dit pas sa couleur : **la mesurer**.

⭐ **Et le rouge du gendarme ne crée aucune ambiguïté, parce que le PORTEUR diffère** : le rouge
d'un **bouton** dit *« ce bouton défait »* ou *« cet état est faux »* ; le rouge d'un **popup** dit
*« voilà le mur »*. On ne confond pas une chose qu'on appuie avec une chose qui parle.
⭐ **Un composant, trois teintes, trois intentions** — la plomberie `.popup` existe déjà.

### ✅ LES TROIS COEXISTENT — UN SEUL POPUP, TROIS PASTILLES *(tranché 26/08)*

> Eric : *« c'est **le vrai problème**, ça. **Le rouge est au-dessus, le bleu au-dessus du
> parchemin.** Une pastille permet de naviguer d'une couleur à l'autre **SANS FERMER**, sur chacun
> des trois. Donc un rouge peut porter une pastille bleue et parchemin. »*

**L'ordre de la pile — le plus urgent devant :**

```
🔴  GENDARME    « ça ne peut pas marcher »   ← au-dessus de tout
🔵  AIGUILLEUR  « fais ceci »
📜  GUIDE       « si tu veux »               ← au fond
```

**Les pastilles — ce qui est là, mais pas devant :**

| ce que le joueur voit | ce que ça dit |
|---|---|
| un popup **rouge** portant une **pastille bleue** et une **parchemin** | *« il y a un mur ; il y a aussi une consigne et une aide, quand tu voudras »* |
| il touche la pastille bleue | 🔵 l'aiguilleur **passe devant — ⛔ SANS FERMER** |

⭐⭐ **Trois choses que ce dessin règle d'un coup :**

| | |
|---|---|
| **la coexistence** | ⛔ jamais trois bulles empilées à l'écran — **une seule** |
| **la hiérarchie** | ⭐ **elle est portée par LA PILE, pas par la couleur** : le plus urgent est devant, et ça se voit **sans lire** |
| **rien n'est perdu** | un popup qui en cacherait un autre **ferait disparaître une information** ; **la pastille prouve qu'elle existe** |

⭐ **Et « sans fermer » est le mot qui compte** : fermer pour rouvrir ferait perdre le fil et
obligerait à se souvenir. **Naviguer entre trois voix d'une même bulle, non.**

⛔ **La pastille n'apparaît QUE si l'autre voix a quelque chose à dire.** Une pastille qui ne mène
à rien est un bouton qui ment — et **le joueur cesserait de les regarder.**

⏳ **Non tranché** : si le gendarme se ferme tout seul · la **forme** de la pastille · ce qu'on voit
quand **un seul** des trois parle *(zéro pastille, sans doute)*.

### 🔴 LE GUIDE EST UN POPUP — il ne vit JAMAIS dans le flux *(tranché 26/08)*

> Eric, 2026-08-26, en réponse à « Class › guide déborde de 553 » : **« le guide devient un popup,
> donc il ne déborde pas »**.

| | |
|---|---|
| ⛔ **le guide n'est pas un bloc de la page** | il ne prend **aucune place** dans le budget vertical |
| ✅ **c'est un popup** | il se pose **par-dessus**, et il se ferme |
| **on le rouvre** | par le **`?`** *(ci-dessous)* |

⭐⭐ **Et c'est la réponse la plus économe qu'on pouvait donner au débordement.** La question était
*« qu'est-ce que Class porte EN TROP ? »* — la réponse n'est pas *« on enlève quelque chose »*,
c'est **« ce quelque chose n'avait rien à faire dans le flux »**. Mesuré : le mot du guide valait
**63 px sur Class**, et le `.parcours-resume` de Species **448 px à lui seul**.

➡️ ⛔ **Aucun écran ne compte plus le guide dans sa hauteur.** Le budget §1 quater s'allège d'autant,
**partout**, sans rien retirer au joueur.

⭐ **Et ça referme la boucle du §7** : le guide était déjà défini comme **optionnel** et
**congédiable**, avec le `?` pour le rappeler. **Un contenu optionnel qui occupe une place fixe
n'est pas optionnel** — il l'est enfin vraiment.

⚠️ **Ce que ça N'AUTORISE PAS** : ⛔ sortir du flux tout ce qui gêne. Le guide en sort **parce
qu'il est optionnel**, pas parce qu'il est encombrant. Un bilan, une liste, une consigne
**nécessaires** restent dans la page — et si elles débordent, la question *« qu'est-ce qui est en
trop ? »* garde toute sa force.

### 🔴 Le `?` — le rappel permanent

| | |
|---|---|
| **place** | **en bas à droite**, fixe |
| 🔴 **où il vit** | ✅ **TRANCHÉ le 26/08 — il ENTRE DANS LA RANGÉE de boutons**, collé à droite, et ⛔ **il ne participe pas au centrage**. Eric : *« il n'entre pas en conflit avec le centrage des boutons, il sera toujours collé à droite »*. ⛔ `--touch` 44 ne cède **jamais** |
| ⛔ **pas dans la marge** | il est **sur** la dalle, en bas à droite *(voir §1 bis)* |
| **cycle de vie** | il **apparaît de base** · il propose **systématiquement d'être désactivé totalement** · un simple **`ok`** le fait partir pour cette fois |
| **retour** | il **revient spontanément à chaque nouveau personnage** — ⛔ **sauf s'il a été désactivé dans le menu** |
| **réactivation** | **toujours possible en cliquant sur `?`** |
| ⛔ **borné** | aux écrans qui **ont** un guide. Un `?` qui n'ouvre rien apprend à ne plus le regarder |

### 🔴 POURQUOI « BORNER LA LARGEUR » NE RÉPARAIT RIEN — mesuré le 26/08

Ce paragraphe demandait de **borner la largeur de la rangée par calcul**. ⛔ **La largeur n'était
pas la variable.**

📏 `.sortie` était en **`space-between`** : le bouton de droite **EST** le bord droit, quel que soit
son mot. Le `?` vise le même coin, à 44 px du bord. **Recouvrement : 44 px, à 360 comme à 375** — le
nombre ne bougeait pas, parce que les deux objets visaient le même coin **par construction**.
Rétrécir la rangée déplaçait son bord **gauche** ; celui de droite se recollait.

✅ **LA SORTIE, tranchée par Eric** : la rangée passe à **`justify-content: center`** et **réserve
une colonne de `--touch` de chaque côté**. Les boutons se centrent sur ce qui reste ; les deux
petits organes — le **livre** à gauche, le **`?`** à droite — vivent dans les colonnes réservées et
**ne décalent jamais le centre**.

⭐⭐ **ET LE MÉCANISME EXISTAIT DÉJÀ DANS LA FEUILLE** : `.parcours-pied` porte `center` +
`padding-right: var(--touch)` depuis le **19/08** et n'a **jamais** eu le conflit. ⛔ On n'a rien
inventé : on a étendu une recette qui marchait sur un écran à celle qui ne l'avait pas.

📏 Mesuré à 360 après : rembourrage gauche **8**, droite **52** *(8 + 44)*, boutons centrés.

---

### 🔴 7 bis — LE LIVRE : la jumelle gauche du `?` *(organe neuf, 26/08)*

> Eric, 2026-08-26 : *« plutôt qu'un bouton rules ou lore, on crée un bouton de même dimension que
> `?` mais à ma gauche, **il contient un livre**… et exit le bouton lore »*, puis : *« **deux petits
> organes à gauche et à droite**, prenant peu de place dans la rangée des boutons, **ils ne se
> centrent pas** »*.

| | |
|---|---|
| **sa place** | **en bas à GAUCHE**, dans la colonne réservée de la rangée |
| **sa cible** | 🔴 **`--touch` 44** — comme le `?`, comme tout ce qui se touche |
| **son dessin** | 🔴 **un cercle de 22 px — LA COTE EXACTE DU `?`** *(Eric, 26/08 : « le livre doit être dans un bouton rond, **même taille que `?`** »)* |
| ⛔ **dessiné, pas écrit** | un glyphe 📖 change de forme selon la police installée et rend une couleur qui n'est pas la nôtre — même raison qu'au pouce de l'interrupteur *(§6)* |
| **ce qu'il remplace** | le bouton **`LORE`** du pied de fiche, qui disparaît |

⭐⭐ **CE QUE ÇA RANGE DÉPASSE LA PLACE** : le pied portait **deux mots** pour deux gestes de nature
différente — `LORE` ouvre une **lecture**, `CHOOSE` **écrit dans le document**. Au même habit, côte à
côte, ils disaient qu'ils se valaient. ➡️ **⭕ à gauche on LIT · le bouton au centre on CHOISIT ·
⭕ à droite on demande de l'AIDE.**

⚠️ **Un organe sans texte doit se NOMMER** : `aria-label`, sinon il disparaît de la page pour qui ne
voit pas le dessin. Le garde l'exige.

### 🔴 UN BOUTON SE POSE SUR UNE DALLE, JAMAIS SUR LE FOND *(tranché 26/08)*

> Eric, 2026-08-26 : **« aucun bouton dans le fond »** · *« Destiny, la carte TEXTE doit avoir sa
> rangée de boutons »*.

⭐ **LA RAISON EST DANS §1 quinquies bis** : le fond ne peint rien. **Ce n'est pas une surface, c'est
une respiration** — un contrôle posé dessus n'a **rien sous lui**.

📏 **LE DÉFAUT QUE ÇA A RÉVÉLÉ, mesuré le 26/08** : les deux boutons de Destiny *(`Draw again`,
`Choose yourself`)* étaient posés **directement dans `.card-step`**, donc sur le cadre d'écran. Tant
que le cadre peignait, ils **avaient l'air** d'être sur quelque chose. Depuis que le fond est nu, ils
flottent sur l'image.

➡️ **Ils vivent désormais sur la carte TEXTE**, avec le Score qui les suit pour la même raison : il
porte du texte, il va où le texte va.

⚠️ **ET LE CAS SANS DALLE EST NOMMÉ, pas masqué** : quand il n'y a pas de carte texte, il n'y a pas
de dalle où poser les boutons. On les **garde visibles** — *un écran qui perd ses gestes est pire
qu'un écran mal rangé* — et le code le dit à l'endroit où ça se produit.

---

### 🔴 LE FLUX NE PORTE AUCUN BOUTON — ce sont les BANDES FIXES qui les portent *(26/08)*

> Eric, 2026-08-26, en montrant l'écran des Compétences : *« les listes restent identiques et
> scrollables. **Exception : elles ne portent pas de bouton. C'est la carte FIXE qui les porte.** »*
> · *« la barre blanche doit **totalement disparaître**, et ses éléments reportés sur la petite dalle
> sous le titre. **Cette petite dalle restera fixe.** »*

| la bande | c'est une dalle ? | porte-t-elle des contrôles ? |
|---|---|---|
| **la tête** *(fixe)* | ✅ **oui** | ✅ le titre, les onglets, les compteurs, le `?`, le livre |
| **le flux** *(il défile)* | ⛔ **non** — *« son bord est invisible »* | ⛔ **aucun contrôle d'écran** |
| **le pied** *(fixe)* | ✅ **oui** | ✅ la rangée de boutons |

⭐⭐ **LA RAISON EST MÉCANIQUE, PAS ESTHÉTIQUE, ET C'EST CE QUI LA REND SÛRE** : un contrôle qui
défile **s'en va**. Le joueur qui cherche `Done` doit alors se rappeler **où** il l'a laissé — un
bouton qu'il faut retrouver n'est plus un bouton, c'est une chasse. ➡️ **Ce qui commande reste ; ce
qui se lit défile.**

⛔ **ET ÇA REJOINT « PAS DE BOUTONS DANS LE FOND »** : un pied transparent n'est pas une bande, c'est
un vide. 📏 Mesuré le 26/08 sur Compétences : `Done` était posé sur l'image, sans rien sous lui.
**Les deux bandes fixes sont donc des DALLES ; le flux n'en est pas une** — et c'est précisément ce
qui lui permet de défiler sans emporter de contrôle.

📏 **CE QUE ÇA A RETIRÉ, mesuré** : la barre blanche de Compétences vivait dans `.stage-topbar`, le
slot horizontal du **CADRE** — donc hors de toute dalle. Tant que le cadre peignait, elle avait l'air
d'appartenir à l'écran. ⭐ **Le slot ne disparaît pas, il se vide** : c'est sa loi *(B0.19 — un écran
le garnit ou le laisse vide)*, la même qui a servi à l'Équipement le 23/08.

⚠️ ⛔ **CE QUE CETTE RÈGLE NE DIT PAS** : les **lignes** d'une liste gardent leurs propres commandes
— les trois crans de palier d'une compétence, le `+`/`−` d'une quantité. Ce sont des organes **de la
ligne**, pas des contrôles **de l'écran**. La règle vise ce qui commande la PAGE.

---

### ⚖️ L'EXCEPTION DU TAROT — argumentée, parce qu'une norme en admet *(26/08)*

> Eric, 2026-08-26 : **« les normes peuvent avoir des exceptions, elles sont argumentées »**, puis,
> sur ce cas : **« tu as raison, le tarot est un bouton exception »**.

La carte de Destiny *(`.card-face`)* est un **`<button>` qui ne contient qu'une IMAGE**. Elle
déroge à trois normes, et voici pourquoi chacune cède :

| la norme | ce que le tarot fait | l'argument |
|---|---|---|
| §2 — le bouton est un **OCTOGONE à coupe** | ⛔ un **rectangle**, aux proportions d'une carte | **la carte EST l'objet**. Un octogone la découperait — on ne rogne pas un tarot pour qu'il ressemble à un bouton |
| §4 — le voile de la dalle est **50 %** | ⛔ **100 %, opaque** *(`dalle-majeure`)* | §4 le prévoit lui-même : *« 100 % — beaucoup de contenu, **ou des images** »*. Un voile sur une illustration la salit |
| §1 quinquies — un objet **porte un titre** | ⛔ **aucun texte** | *« on ne nomme pas deux fois »* : la carte se nomme par son image, et son nom accessible est sur le bouton *(`aria-label`)*. ⭐ Le texte, lui, vit sur la carte d'à côté — **une carte montre, l'autre explique** |

### 🔴 LA RÈGLE DES DEUX DALLES, dans les mots d'Eric

> Eric, 2026-08-26 : **« la dalle tarot ne porte AUCUN AUTRE bouton que le tarot. C'est la dalle
> TEXTE qui porte les éléments classiques. »**

| la dalle | ce qu'elle porte |
|---|---|
| 🃏 **la dalle TAROT** | **elle-même, et rien d'autre.** ⛔ Ni `?`, ni livre, ni pastille, ni rangée de boutons |
| ⭐ *et la règle se referme d'elle-même* | **le `?` et le livre SONT des boutons** *(Eric, 26/08)* — donc *« aucun autre bouton que le tarot »* les exclut **par construction**, sans qu'on ait à les nommer un par un |
| 📄 **la dalle TEXTE** | 🔴 **tous les éléments classiques** — la rangée de boutons, le Score, le `?`, le livre |

⭐⭐ **ET C'EST CE QUI REND L'EXCEPTION TENABLE.** Une exception qui prendrait la place d'une norme
sans la remplacer laisserait un trou : où iraient les organes ? Ici, **la carte d'à côté les
reçoit** — l'écran n'a rien perdu, il a réparti. **Une carte montre, l'autre porte.**

📏 **CE QU'IL EN COÛTAIT DE NE PAS L'ÉCRIRE, mesuré le 26/08 par le lot G** : le `?` était appendu
dans la carte du tarot — un `<button>` DANS un `<button>`, du HTML invalide, et surtout un clic qui
remonte : **demander de l'aide RETOURNAIT LA CARTE.** Le chercheur d'hôte exclut désormais les
boutons, et l'hôte devient la carte texte, juste dessous.

⚠️ **MAIS L'EXCLUSION DES BOUTONS EST UN EFFET, PAS LA RÈGLE.** Elle marche ici parce que le tarot
*se trouve* être un bouton. ⛔ Le jour où une dalle-image ne serait pas un bouton, elle recevrait le
`?` sans que rien ne proteste. **C'est la règle ci-dessus qui fait autorité, et c'est elle que le
garde mesure** *(`tests/destiny-deux-dalles.test.mjs`)*.

⭐⭐ **CE QUE CETTE EXCEPTION ENSEIGNE, ET C'EST POURQUOI ELLE EST ÉCRITE** : une norme qui n'admet
aucune exception se fait contourner en silence. Écrite avec son argument, l'exception **se relit** —
et le prochain siège saura si son cas lui ressemble. ⛔ Une exception **non argumentée** n'en est pas
une : c'est un oubli qui se défend.

---

### 🔴 LA PAIRE — les deux ronds encadrent la rangée *(tranché 26/08)*

> Eric, 2026-08-26 : *« ils sont tous deux **cadrés à gauche et à droite de la rangée de
> boutons** »* · *« le livre n'est pas toujours câblé, **il le sera** »*.

| | |
|---|---|
| **la même cote** | 🔴 **22 px de dessin, 44 de cible**, des deux côtés |
| **la même place** | aux **deux bouts de la rangée de boutons**, dans les colonnes réservées |
| **la même réserve** | 🔴 **autant à gauche qu'à droite** — c'est elle qui recentre les boutons *(ci-dessous)* |
| ⛔ **hors du centrage** | les boutons se centrent sur ce qui reste entre eux |

🔴 **DANS LA RANGÉE, MAIS PAS DE SON HABIT — Eric, 2026-08-27, quand j'ai buté dessus** :
*« ce sont des boutons SPÉCIAUX, mais ils rentrent dans leur rangée quand même : l'un cadré à
droite, l'autre à gauche »* · *« le livre est un cercle »*.

⭐ **LES DEUX MOITIÉS COMPTENT, ET ELLES TIRENT EN SENS INVERSE.** Ils sont **DANS** la rangée —
donc tout sélecteur écrit « les boutons de ce pied » les attrape. Et ils n'ont **PAS** son habit —
l'octogone est réservé aux gabarits à libellé *(§6)*, un bouton à **dessin** n'a pas de mot à cadrer.

⛔ **CE QUE ÇA COÛTE QUAND ON L'OUBLIE, mesuré le 27/08** : le livre posé au pied du parcours est
sorti en **LOSANGE**. `.parcours-pied button` figurait dans la liste des sélecteurs octogonaux, et
le livre l'a hérité sans que rien ne le demande — **il n'existait pas quand cette liste a été
écrite**.
📌 **Un sélecteur écrit par POSITION *(« tout bouton de ce pied »)* attrape ce qui arrivera plus
tard, et il ne prévient pas.** Quand une rangée peut accueillir les deux familles, elle se nomme
`:not(.fiche-livre)` — ou par la classe du gabarit, jamais par l'endroit.

⭐⭐ **L'ÉGALITÉ EST CE QUI FAIT LA PAIRE, et ce n'est pas décoratif** : deux ronds de tailles
différentes aux deux bouts d'une rangée se lisent comme **deux objets sans rapport**. À la même cote,
ils se lisent comme **les deux bornes d'un même geste** — ⭕ à gauche on **LIT** · au centre on
**AGIT** · ⭕ à droite on demande de l'**AIDE**.

### ✅ PREMIER CÂBLAGE RÉEL DU LIVRE — **Abilities**, 26/08

> Eric, 2026-08-26, deux fois pour lever tout doute : **« Info doit devenir un livre et
> disparaître »**, puis **« Abilities : info doit disparaître et devenir un bouton livre ! »**

**Les deux moitiés comptent** : il prend la **forme du livre**, ET le mot « INFO » **quitte
l'écran**.

⛔ **POURQUOI CE BOUTON ÉTAIT UN DÉFAUT AVANT DE DEVENIR UN LIVRE.** Il portait `ability-entry` —
donc le gabarit, l'octogone et le pan coupé des **quatre méthodes**. Un cinquième bouton identique
proposait quelque chose **qui n'est pas un choix**. La feuille l'admettait déjà à demi-mot en
2026-08-16 : *« il ne se distingue plus par sa forme »*, et il fallait **une phrase sous la rangée**
pour le rendre découvrable — une phrase dont le seul travail était de **rattraper une confusion de
forme**.

⭐ **Le livre règle les deux d'un coup** : c'est l'organe qui veut dire *« le texte est là »*, rond,
**à la cote du `?`**, et il ne ressemble à **aucune** méthode. La phrase peut donc le **désigner**
au lieu de réparer.

📏 **Mesuré sur la page rendue** *(1100 px, v313)* : livre **44 × 44** à gauche · `?` **44 × 44** à
droite · les quatre méthodes centrées entre eux — la paire, exactement comme elle est décrite
ci-dessus.

⚠️ **IL GARDE `aria-pressed`** : c'est un **interrupteur** *(le panneau est ouvert, ou non)*, et un
livre qui bascule doit le dire. ⚠️ **Et il garde un `aria-label`** — un bouton muet à l'écran ne
doit pas l'être aussi pour un lecteur d'écran.

📌 **Une leçon de déplacement, pas de dessin.** La consigne disait *« pick one of the methods
**ABOVE** »* quand elle vivait SOUS la rangée. Remontée au-dessus *(Eric : « le texte devait être en
haut », il recouvrait le `?`)*, **le même mot désignait la barre d'étapes**. ⛔ **Un déplacement peut
rendre faux un texte qu'on n'a pas touché** : la phrase ne parlait pas d'elle-même, elle POINTAIT.

---

### ✅ LA RÉSERVE EST SYMÉTRIQUE, ET C'EST CE QUI CENTRE LES BOUTONS *(26/08, second temps)*

> Eric, 2026-08-26, devant Identity : **« bien mais Done centré »**, puis **« fais
> comme pour tous les panels »**.

🔴 **Tant qu'un seul bout était occupé, le centrage était FAUX par construction.**
Réserver la place du `?` à droite décalait le centre de la moitié de cette
réserve — mesuré : `Done` tombait **26 px à gauche** du milieu de sa dalle. Ce
n'était pas un réglage raté, c'était le prix assumé de la note du matin *(« il
n'entre pas en conflit avec le centrage, il sera toujours collé à droite »)*.

⭐ **DEPUIS QUE LE LIVRE TIENT LA GAUCHE, LES DEUX BOUTS SONT OCCUPÉS** — donc
réserver **autant des deux côtés** (`padding-inline`) rend le centre du contenu
égal au centre de la rangée. **Rien n'est arbitré : c'est de l'arithmétique.**

📏 **Mesuré après correction** *(900 px)* : Identity `60/60`, écart **0** ·
Species, Inheritance, Class `44/44`, écart **0**.

⚠️ **DEUX PIEDS, UNE SEULE LOI.** `.sortie` *(Identity, Destiny, Skills)* et
`.parcours-pied` *(Species, Inheritance, Class)* sont deux pieds **nés
séparément** qui font le même métier ; ils avaient divergé sans que rien ne le
dise. Le second réservait `0 / 44`. ⛔ **Deux implémentations d'un même organe
sont une divergence qui attend son tour** — c'est la troisième fois de la journée
que ce dépôt la paie *(voir aussi le `Done` à deux formes, §6)*.

📌 **Les deux chiffres diffèrent, et c'est argumenté** : `.sortie` réserve
`--sp-16 + --touch` au bas de la SCÈNE ; `.parcours-pied` réserve `--touch` seul,
parce qu'il vit DANS une dalle qui porte déjà son rembourrage. ⭐ **Ce qui compte
n'est pas le chiffre, c'est qu'il soit LE MÊME à gauche et à droite.**

---

⚖️ **ET LE LIVRE PEUT EXISTER SANS ÊTRE CÂBLÉ** *(Eric, le même jour)*. ⛔ C'est une **exception
nommée** à la règle du `?` — *« un `?` qui n'ouvre rien apprend à ne plus le regarder »* — et elle
ne vaut QUE pendant la construction. ⏳ Un livre qui n'ouvrirait toujours rien le jour où le reste
est fini serait le défaut que cette règle-là interdit.

⏳ **CE QUI RESTE À FAIRE, mesuré par le lot G le 26/08** : la rangée réserve bien sa colonne, mais
**elle est vide sur les dix écrans** — le `?` vit encore au coin bas-droit d'une dalle *(règle du
19/08)*, et **cinq écrans sur dix n'ont aucune rangée**. Le déplacer demande de changer l'ordre de
rendu *(la rangée est posée APRÈS la carte, le `?` ne peut pas la voir depuis là)* et de répondre
pour les cinq écrans sans rangée. **C'est un lot, pas une retouche.**

---

⭐ **Le `?` est ce qui autorise le guide à disparaître** : on ne ferme franchement une aide que si
l'on sait la retrouver.
⭐ **Deux sorties distinctes, et il ne faut pas les confondre** : `ok` = « pas maintenant » ·
désactivation = « plus jamais, et c'est dans le menu ». **La seconde est la seule qui survit au
personnage suivant.**

### ✅ SON ASPECT — tranché 26/08

> Eric : *« le `?` **en parchemin quand jamais vu**, juste **un cercle quand consommé** »*.

| l'état du guide | le `?` |
|---|---|
| **jamais vu** | 📜 **plein, en parchemin** — il **appelle** |
| **déjà vu** | ⭕ **un simple cercle** — contour seul, il **attend** |

⭐⭐ **C'est la loi du voyant de la ceinture, appliquée à un autre organe** : *un anneau se lit
« en cours », un disque PLEIN se lit « fait »*. Ici : **plein = il y a quelque chose pour toi**,
**contour = tu l'as lu, je reste là**.

⭐ **Et il n'emprunte AUCUNE couleur de l'échelle.** Le vert avait été envisagé puis écarté : dans
l'échelle il dit *« fini »*, ce qui est **l'inverse** de *« jamais vu »*. **Le parchemin ne veut
dire qu'une chose — le guide.**

⛔ **Et ça ne crie pas.** Le guide est **optionnel** : un `?` en couleur de signal réclamerait
l'attention qu'il a précisément **le droit de ne pas prendre**.

---

## 8. AUTRES ORGANES ET TEXTES

### 🔴 LES DEUX DROPDOWNS — ils ne font pas le même métier *(tranché 26/08)*

| | **de CHOIX** | **DIRECTIONNEL** |
|---|---|---|
| ce qu'il fait | on y prend une valeur | il dit **où va** l'objet |
| 🔴 **valeur par défaut** | — | ✅ **OBLIGATOIRE** |
| exemple | — | le **collecteur d'équipement** : dropdown **`backpack`** par défaut + bouton **`Send`** |

⛔ **PAS DE LISERÉ sur un dropdown** *(Eric, 26/08 — corrige sa propre dictée)*. Il reste
rectangulaire, **très large, peu haut**, transparence **20 %**, caractères **gras** contrastant.

⭐ **Pourquoi le directionnel exige un défaut** : il répond à une question que le joueur ne s'est
pas posée. Sans défaut, l'objet reste en l'air et le geste échoue en silence — **avec `backpack`
déjà là, `Send` marche du premier coup** et le joueur ne change la destination que s'il le veut.
C'est exactement la règle des **« prévalidés »** : *un réglage qui a un bon défaut se montre sans
se demander.*

✅ **La zone d'écriture** : ⛔ **rien à normer, elle est bien par défaut** *(Eric, 26/08 — annule
le liseré rose de sa dictée, qui n'existait dans aucune palette)*.

### Les textes qui changent

> ✅ **Simplifié par Eric le 26/08 : « normal noir / gain vert / perte rouge ».**
> **Trois états, pas quatre** — le *bleu* de la dictée disparaît des textes.

| cas | couleur |
|---|---|
| **normal** | 🔴 **l'encre normale — `--text`** |
| **gain** | **vert** |
| **perte** | **rouge** |

⛔ **« Ne bouge pas » ne veut PAS dire « noir littéral ».** Mesuré : un `#000` sur le fond de nuit
`#14120e` rend **1,11:1** — *le texte disparaît*. `--text` vaut `#d8d3c9` la nuit et une encre
sombre le jour : **même intention, et ça survit au thème.**

⭐ **La règle se lit à l'envers, et c'est ce qui la rend juste** : ⛔ **une valeur qui n'a pas
changé ne se colore pas.** La couleur est réservée à ce qui bouge — sinon elle ne signale plus rien.

⭐ **Et le bleu s'en trouve libéré** : il ne sert plus qu'à ce qui est **EN COURS** (`next`,
`back`, la navigation) et à l'**aiguilleur**. Une teinte, un seul sens — *« ça continue, voilà où
aller »*.

🔴 **Page unique, sauf mention contraire.**

---

## 9. LE SEUIL D'ENTRÉE *(26/08)*

⛔ **`login` et `pass` sont MORTS.** Le site n'a **aucun compte**. Ils sont remplacés par
**`Nom de joueur`** *(libre, changeable)* + **`Connecter mon coffre`** *(un bouton → un écran
`Authorize` chez GitHub → plus jamais)*.

⛔ **On ne stocke jamais** de login ni de mot de passe. On stocke **un nom de joueur** et **des
chemins**. Détail : `FH-WEB/FHPC/FHPCv2 hebergement donnees.md`.

---

**Sources** : vault `FH-WEB/FHPC/` — `FHPCv2 nomenclature UI` · `FHPCv2 norme des listes` ·
`FHPCv2 entree R cahier charges` · `FHPCv2 hebergement donnees` · `FHPC norme des organes`.
