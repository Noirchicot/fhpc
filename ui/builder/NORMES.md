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

📌 La rangée en met **autant qu'elle peut** : **3 dès 277 px · 4 dès 372 · 5 dès 467**. ⛔ Et la
case **ne grandit pas** pour remplir sa rangée — *« une case qui s'étire ne laisse RIEN à
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

## 2. LES TROIS ORGANES — forme ET remplissage *(validé 26/08 sur maquette)*

| organe | forme | remplissage | voile |
|---|---|---|---|
| **zone de drop** | rectangle **très arrondi** | **creux** : texte d'attente + liseré, aucun fond | max, voire nulle |
| **jeton** | rectangle **très arrondi** | **teinté** *(doré)* | +20 % d'accent → **48 % cumulés** |
| **bouton** | 🔴 **OCTOGONE à coupe** | **plein, en signal** | 🔴 **100 % — OPAQUE** |
| **collecteur** | comme le jeton | — | 35 %, comme sa dalle |

⭐ **La coupe d'angle appartient au bouton SEUL.** C'est ce qui interdit de le confondre avec un
jeton, quelle que soit la couleur.

🔴 **Le liseré d'une zone de drop porte la couleur du corps du jeton attendu** — la cible annonce
ce qu'elle accepte avant qu'on lâche.

### Combien de modèles *(26/08)*

**bouton = 3 couleurs · jeton = UN SEUL modèle · collecteur = UN SEUL modèle.**
⭐ La variété vit dans les **boutons**, pas dans les jetons.

---

## 3. 🔴 LE BOUTON EST OPAQUE — mesuré, pas préféré

| le bouton sur une dalle à 35 % | cumulé | étiquette jour | étiquette nuit |
|---|---|---|---|
| **opaque** | 100 % | **6,07–6,13** ✓ | **5,59–5,61** ✓ |
| voilé à 50 % | 68 % | 3,63 ✗ | 3,00 ✗ |
| voilé à 35 % | 58 % | 3,12 ✗ | **2,47** ✗ |

⭐ Et la raison non chiffrable : **un signal qui se voile cesse d'être un signal**. Le rouge voilé
à 35 % rend `#74493b` de nuit — un brun.

⛔ **Un bouton ne porte JAMAIS l'habit d'une dalle** — c'est ce qui les rendait anonymes.
*(Dette connue : `.species-done` porte encore `--dalle-inter`.)*

---

## 4. LES VOILES — et la loi qui les gouverne

| option | emploi |
|---|---|
| **35 %** | la **dalle**, et le **collecteur** |
| **50 %** | ⏳ aucun organe aujourd'hui — au registre |
| **100 %** | le **bouton**, et lui seul |

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

🔴 **`pages = ceil(objets ÷ 15)`, TOUJOURS, sans plafond.** Le **35 par étagère** est une cible de
**découpe**, jamais un plafond de données — le homebrew le fera déborder, **c'est prévu**.
⛔ **Aucun garde ne doit affirmer « une étagère fait au plus trois pages ».**

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
| choix de mode | **on = vert · off = rouge · désactivé = gris** |
| `done` *(étapes)* | 🟢 **VERT** — *« c'est fini »*. ⭐ Il **NE SIGNE RIEN** : c'est la **tuile** qui signe. `Done` dit « j'ai fini ici » et **remonte d'un cran** |
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
| **gris** | **rien n'est encore fait** |
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
| **il ne coûte rien** — on remonte, le travail reste | 🔵 **bleu** *(navigation, en cours)* |
| **il détruit du travail déjà fait** | 🔴 **rouge** + **popup** |

⭐ **Donc `Back` n'a pas UNE couleur : il a la couleur de sa conséquence.** Le même libellé est
bleu là où il ne coûte rien, rouge là où il efface. ⛔ Un lot qui peint `Back` en bleu « parce que
c'est un back » se trompera le jour où ce back-là jette une étape entière.

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

### 🟣 Le rouge peut être accompagné

> Eric : *« le rouge c'est pas bon — **tu peux me mettre un flic en même temps** »*.

Un bouton rouge **dit qu'il y a un problème** ; le **GENDARME** *(popup violet, §7)* **dit lequel**.
⭐ **Les deux ne font pas double emploi** : la couleur se voit d'un coup d'œil et ne prend pas de
place ; le gendarme prend la parole et coûte une interruption. **Le rouge signale, le violet
explique.**

⏳ **Non tranché** : le gendarme accompagne-t-il **tout** rouge, ou seulement ceux dont la raison
n'est pas devinable ?

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

### Signalisation — ⛔ NON CLIQUABLE
Cercle avec numéro d'étape : **rien fait** = liseré basique · **en cours** = bleu · **validé** =
vert · **problème** = rouge.

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
| **l'AIGUILLEUR** | 🔵 **bleu** | **une consigne** — *« fais ceci »* |
| **le GENDARME** | 🔴 **ROUGE** *(corrigé 26/08 — le violet est pris)* | **une impossibilité** — *« ça ne peut pas marcher »* |

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
