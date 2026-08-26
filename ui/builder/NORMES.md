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
cible.** Le « mou » de 58 px que j'avais annoncé venait d'un calcul à **375**, une largeur qui
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

| l'état | le fond | le liseré |
|---|---|---|
| **vide** | ⛔ aucun — **creux** *(`--creux`)* | **tireté** |
| **rempli, valide** | 🔴 **le doré du jeton** + **`--relief`** | 🔵 **bleu** — *« celui-ci est bon »* |
| **mauvaise pose** | idem, le doré reste | 🔴 **rouge** |
| **tout posé** | idem | 🟢 **vert, sur tous à la fois** |

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
| **le `?`** | petit et discret | **collé en bas à droite**, hors du flux | §7 |

⭐ **Deux d'entre eux ne portent AUCUNE couleur de l'échelle, et c'est délibéré** : l'interrupteur
*(il porte un ÉTAT qui demeure, pas une action qui avance)* et le guide *(il est optionnel, donc il
ne signale rien)*. ➡️ **Un organe qui n'emprunte pas à l'échelle ne peut pas la contredire.**

⚠️ **Et deux d'entre eux ne se touchent pas** : le **voyant** *(non cliquable)* et le **popup**
*(il parle, on ne l'appuie pas)*. ⛔ Ne pas leur donner l'apparence d'un contrôle.

⭐ **La coupe d'angle appartient au bouton SEUL.** C'est ce qui interdit de le confondre avec un
jeton, quelle que soit la couleur.

### ✅ LES QUATRE PANS COUPÉS NE PORTENT PAS D'ARÊTE — tranché 26/08

> Eric, 2026-08-26, la mesure posée devant lui : **« non, ça me va »**.

📏 **Mesuré au navigateur sans écran** *(Chrome 151, bouton gris, jour)* : les pixels de la diagonale
valent **158-160**, entre le fond à **243** et le corps à **98**. C'est de l'**anticrénelage**, pas
une lumière. Le pan reste à la teinte du corps.

| | |
|---|---|
| **le haut et le bas** | portent l'arête *(blanc .58 · noir .45)* |
| **les côtés** | portent la leur *(blanc .16 · noir .20)* |
| 🔴 **les quatre pans coupés** | ⛔ **rien, et c'est voulu** |

⭐ **Ce n'est pas un oubli, c'est la limite du médium** : un `linear-gradient` éclaire des bandes
**droites**. La diagonale d'un pan tombe hors des 1,5 px du haut comme des 1,5 px du côté — aucun
stop ne peut l'atteindre. L'éclairer demanderait un `conic-gradient` et des angles qu'Eric n'a
jamais nommés.

➡️ **Ça se lit comme la TRANCHE du biseau**, et Eric l'a validé en connaissance de la mesure.

⛔ **AUCUN LOT NE ROUVRE CETTE QUESTION.** Un futur siège qui verra les pans nus croira à un défaut :
il n'en est pas un. La cause est écrite ci-dessus, la décision est datée.

🔴 **Le liseré d'une zone de drop porte la couleur du corps du jeton attendu** — la cible annonce
ce qu'elle accepte avant qu'on lâche.

### Combien de modèles *(26/08)*

**bouton = 3 couleurs · jeton = UN SEUL modèle · collecteur = UN SEUL modèle.**
⭐ La variété vit dans les **boutons**, pas dans les jetons.

---

## 2 bis. ✅ LE JETON AUJOURD'HUI : LA COULEUR DE BASE ET LE RELIEF — RIEN D'AUTRE

> Eric, 2026-08-26, sur les variantes, l'échelle de valeur du liseré et ce que porte le fond :
> **« on ne fait rien pour le moment, juste la couleur de base et le relief »**.

| ✅ ce qu'on construit **maintenant** | ⏳ ce qui attend |
|---|---|
| **la couleur de base** *(le doré)* | les **variantes** — feat / feature / trait / training |
| **le relief** | le **liseré par famille** |
| | l'**échelle de valeur** du liseré d'équipement |
| | ce que porte le **fond** |
| **le texte : 🔴 T1** *(ci-dessous)* | le **standard d'abréviations** |

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
*(Dette connue : `.species-done` porte encore `--dalle-inter`.)*

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

📏 **MESURÉ LE 26/08 — elle ne vit que dans l'Équipement.** `LISTE_PAR_PAGE` et `pageDeListe` sont au
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
| **les flèches quand il n'y a qu'une page** | disparaissent-elles ? **Quatre listes sur neuf** tiennent sur une page — espèces, classes, maîtrises d'arme, propriétés d'arme |
| **les 127 objets merveilleux = 9 pages** | le vault : *« ce n'est pas un défaut de la norme, c'est le signe que **cette étagère est trop grosse** »* — elle appelle un niveau de rangement de plus |

✅ **Et un point s'est refermé le 26/08** : *« ce que devient un jeton trop long pour sa case »* —
c'est `ABREGE_MAX = 16`, ratifié le même jour *(§2 bis)*.

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

⭐ *« Pas besoin d'être efficace au tactile — surtout utile pour la souris. »*

⭐ **Et le compte sous le chevron est ce qui accomplit la norme des listes** : sans lui, une liste
paginée est un défilement sans fin ; avec lui, **toute liste a une taille connue** et le joueur
sait toujours où il en est.

⚠️ **Écart mesuré avec le code du 15/08** : `.stage-chevrons` est aujourd'hui **en haut et en bas**
(`position: absolute; inset: 0`, 36 × 14, non tactile — *« une amorce redondante avec le geste de
défilement, pas un contrôle »*). La norme le déplace **à gauche et à droite** et lui ajoute un
compte. ⛔ La cote 36 × 14 et le refus du `--touch` 44 datent d'un objet qui n'était **qu'**une
amorce : ⏳ **à revérifier maintenant qu'il devient aussi un contrôle de pagination.**

---

## 7. LES TROIS POPUPS — trois rôles, trois couleurs *(26/08)*

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
| 🔴 **contrainte** | **jamais en conflit avec un bouton** → la largeur de la rangée de boutons est **bornée par calcul**, pas à l'œil. ⛔ `--touch` 44 du `?` ne cède **jamais** |
| ⛔ **pas dans la marge** | il est **sur** la dalle, en bas à droite *(voir §1 bis)* |
| **cycle de vie** | il **apparaît de base** · il propose **systématiquement d'être désactivé totalement** · un simple **`ok`** le fait partir pour cette fois |
| **retour** | il **revient spontanément à chaque nouveau personnage** — ⛔ **sauf s'il a été désactivé dans le menu** |
| **réactivation** | **toujours possible en cliquant sur `?`** |
| ⛔ **borné** | aux écrans qui **ont** un guide. Un `?` qui n'ouvre rien apprend à ne plus le regarder |

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
