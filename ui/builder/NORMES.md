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

## 6. LES BOUTONS

| gabarit | capacité |
|---|---|
| **small** | 6 caractères, deux étages possibles |
| **large** | 12 caractères, deux étages |
| **no constraint** | libre |

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

⚠️ **Mesuré le 26/08** : la pastille d'attunement (`shell.css:4448`) porte aujourd'hui `--accent`,
et **il n'existe aucun violet dans `tokens.css`** *(la palette a cinq teintes : accent, positive,
caution, critical, info)*. **`violet = magie` est donc une déclaration neuve**, à créer, pas un
constat.

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
