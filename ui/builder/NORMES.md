# NORMES DE L'INTERFACE — ratifiées par Eric

> 🔴 **CE FICHIER NE PORTE QUE CE QUI EST VALIDÉ.** Chaque ligne a été tranchée par Eric,
> à une date, et ne se rediscute pas dans un lot. Ce qui n'est **pas** tranché vit dans le vault
> (`FH-WEB/FHPC/FHPCv2 nomenclature UI.md`) — ⛔ ne pas l'implémenter depuis là.
>
> ⚖️ **Une norme est un DÉFAUT, pas un mur** (Eric, 26/08 : *« c'est pas une dictature, on fait ça
> par défaut »*). Un écran qui dévie le fait **explicitement**, et c'est légal. Un garde vérifie
> **que le défaut vaut la bonne valeur** et **que personne ne recopie le nombre en littéral** —
> jamais que tous les écrans l'emploient.
📍 `socle-norme-est-un-defaut` · vivante · 26/08
⚖️ **Une norme est un DÉFAUT, pas un mur : un écran qui dévie le fait explicitement, et c'est légal.**
📍 `socle-exceptions-argumentees` · vivante · 26/08
⚖️ **Une exception se NOMME (jamais un `:nth-child` qui devine) et se pose à côté de son argument.**
📍 `socle-corpus-unique` · vivante · 29/08
⚖️ **Les trois fichiers sont un seul corpus : aucune règle n'est vraie « seulement dans son fichier ».**
📍 `socle-portee-builder` · vivante · 29/08
⚖️ **La portée de ce corpus est le BUILDER : le site du livre (`fh-phb`) a sa propre feuille.**
📍 `socle-nommer-n-est-pas-mettre-a-l-abri` · vivante · 29/08
⚖️ **Nommer ne met pas à l'abri : la forme sûre est un attribut à plusieurs valeurs, qui donne à tous les cas la MÊME spécificité.**

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
>
> ## ⚖️ **LA LOI DES DEUX ÂGES** *(Eric, 2026-09-06)*
>
> **« Quand c'est ancien c'est archivé mais gardé, et une règle neuve prime sur une ancienne
> jusqu'à ce qu'on ait statué. »**
>
> 🔴 **DEUX CONSÉQUENCES, ET ELLES NE SE NÉGOCIENT PAS.**
> ① **Rien ne se supprime.** Une règle périmée est **archivée**, jamais effacée : elle porte
> l'incident qui l'a fait naître, et cet incident se repaie si on l'oublie.
> ② **La plus RÉCENTE fait foi, par défaut et sans attendre d'arbitrage.** ⛔ Un lot ne
> s'arrête pas devant deux règles qui se contredisent : il applique la neuve, marque
> l'ancienne `remplacée par`, et laisse la trace. Eric tranche après, s'il le veut.
>
> ⭐ **CE QUE ÇA CHANGE POUR CELUI QUI LIT** : le corpus a une **surface** — ce qui fait foi
> aujourd'hui — et une **profondeur** — ce qui a fait foi et qu'on garde. ⛔ Un lot ne lit
> que la surface. C'est ce qui doit ramener le corpus sous le seuil des **200 règles**
> qu'un lecteur suit vraiment.
>
>
> ## 🔒 **DEUX NIVEAUX DE NORMATIF** *(Eric, 2026-09-06)*
>
> **« Sacré : les règles qu'on respecte toujours, partout — ça doit être connu de tout agent.
> Règle : ce qu'on respecte la plupart du temps, et où on autorise des exceptions
> argumentées. »**
>
> | niveau | ce qu'il oblige | comment il se marque |
> |---|---|---|
> | 🔒 **SACRÉ** | **toujours, partout.** ⛔ Aucune exception, jamais, dans aucun lot. Un lot qui le trouve gênant a tort — c'est le lot qui change | `⚖️ 🔒` sur la ligne normative |
> | ⚖️ **RÈGLE** | **par défaut.** Un écran qui dévie le fait **explicitement**, et c'est légal — mais l'exception se **nomme** et se pose **à côté de son argument** | `⚖️` seul — c'est le défaut |
>
> ⭐ **UN SACRÉ N'EST PAS UNE RÈGLE FORTE, C'EST UNE LOI QUI NE CÈDE PAS.** La différence
> n'est pas d'intensité, elle est de nature : devant une règle on argumente, devant un sacré
> on obéit. ⛔ Un lot qui hésite entre les deux n'a pas à choisir — il lit le marqueur.
>
> 📌 **ET UN SACRÉ SE CONNAÎT SANS AVOIR À LE CHERCHER.** Ils sont peu nombreux et se lisent
> d'un coup : c'est la condition pour qu'un agent les respecte sans avoir lu tout le corpus.
>
> 📌 **PORTÉE : LE BUILDER.** Le site du livre (`fh-phb`) a sa propre feuille et n'est pas régi
> ici. L'étendre est une décision d'Eric, pas une conséquence de ce paragraphe.
>
> 📖 **ET SA FEUILLE A UN NOM DEPUIS LE 2026-09-06 : LA *WEB BIBLE*.** Eric, ce jour-là :
> *« crée un fil qui construit une Bible pour le site web — Web Bible, différente de la Builder
> Bible. **Cite quand même dans le builder que quand on parle du site il faut visiter l'autre
> Bible.** »*
> ➡️ **Dès qu'un lot parle du LIVRE** — le bouton 📖 et où il mène, `LIVRE_ARCANES` et les autres
> sorties vers un chapitre, la loi des liens, les ancres que `sync_from_vault.py` fabrique, la voix
> du texte publié — **il va lire `fh-phb/docs/bible-web/`** *(en ligne :
> `noirchicot.github.io/fh-phb/bible-web/`)*. ⛔ Un lien à sens unique ne vaut rien : la Web Bible
> renvoyait ici de son côté, à ce paragraphe et à `ecriture-loi-des-liens`.
>
> ⚠️ **CETTE ADRESSE NE RÉPOND PLUS DEPUIS LE 2026-09-06** — Eric : *« tu efface la bible sur le site WEB »*, *« les deux »*, *« uniquement sur le site »*. Les deux tirages ont quitté `fh-phb/docs/` ; la **source unique** est le corpus que vous lisez. ⛔ Le contenu de la Web Bible n'existe plus qu'à `fh-phb` `7dc6e76` — 62 adresses sans amont.

---

## 0 bis. 🔴 **LE ZOOM, ET LE `blg`** *(Eric, 2026-08-30)*

> **« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT NULLE PART. Tout grandit de manière
> proportionnelle. »**
>
> **« Le plancher c'est la taille 360 sur laquelle on travaille. »**

### Le mot
📍 `panneau-blg` · vivante · 30/08
⚖️ **Le `blg` (« blurg ») est l'unité de dessin du builder : ce que vaut un `px` de feuille de style une fois le zoom appliqué.**
📍 `panneau-blg-a-l-ecrit` · vivante · 30/08
⚖️ **À l'écrit on écrit `blg` ; `bg` et `px` sont tolérés à l'oral seulement.**

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
📍 `panneau-crans-manuels-retires` · remplacée · 02/09
⚖️ **La rampe de crans manuels du Menu n'existe plus : la taille se règle en redimensionnant la fenêtre, et sur téléphone/tablette l'appareil décide.**
📍 `ecriture-aucun-texte-sous-t1` · vivante · 30/08
⚖️ **Aucun texte ne peut passer sous T1.**
📍 `panneau-jamais-de-media-largeur` · vivante · 30/08
⚖️ **Jamais un `@media` de largeur : la grandeur passe par `data-grandeur`, calculé sur `innerWidth / échelle`.**
📍 `panneau-plancher` · vivante · 30/08
⚖️ **Le plancher de l'échelle est 1 : rien ne rétrécit sous le barème ratifié, et aucun texte ne peut passer sous T1.**
📍 `panneau-reflux-oui-redimensionnement-non` · vivante · 30/08
⚖️ **Le reflux survit, le redimensionnement meurt : une rangée peut passer de 4 cases à 3, une cote ne peut pas doubler sur grand écran.**
📍 `panneau-touch-sans-max` · vivante · 30/08
⚖️ **`--touch` n'a plus de `max()` : 44 blg valent toujours ≥ 44 px.**
📍 `panneau-zoom-sans-exception` · vivante · 30/08 · bornée par `panneau-texte-fixe`
⚖️ **Aucune valeur n'échappe au zoom — ni les filets d'un blg, ni les ombres, ni `--touch`.** ~~Aucune exception.~~ **Une seule depuis le 20/09 : le texte** — voir l'amendement du 2026-09-20 ci-dessous (`panneau-texte-fixe`).

| loi | détail |
|---|---|
| 🔴 **aucune exception** ~~(sauf aucune)~~ **sauf le texte, depuis le 20/09** | ni les filets d'un blg, ni les ombres, ni `--touch`. Une valeur qui resterait fixe pendant que le reste grandit **change un rapport** — c'est ce que la loi interdit. ⚠️ **Le texte est l'exception ratifiée le 20/09** : Eric a vu sur l'iPad un texte qui ne grandit pas dans des boîtes qui grandissent, et l'a préféré |
| 📌 **plancher = 1** | *« la taille 360 sur laquelle on travaille »*. Rien ne rétrécit sous le barème ratifié : **aucun texte ne peut passer sous T1** |
| ⭐ **`--touch` n'a plus de `max()`** | 44 blg valent toujours ≥ 44 px sur une échelle qui ne descend jamais. La loi d'Apple et celle d'Eric disent la même chose — *tant que le plancher tient*, et un garde le mesure |
| ⛔ **le reflux survit, le redimensionnement meurt** | une rangée qui passe de 4 cases à 3 ne change **aucun** rapport (loi du 19/08, *« si on peut faire 4, on fait 4 »*). Une cote qui double sur grand écran, si |
| ⛔ **jamais un `@media` de largeur** | il **ne se réévalue pas** sous `zoom` — mesuré au banc : à 1920 au cran 5, `min-width: 1140px` matchait encore et le rail rendait **600 px réels**. La grandeur passe par `data-grandeur`, calculé sur `innerWidth / échelle` |
| ~~⚠️ **le cran est borné, jamais clampé**~~ | **renversé le 2026-09-02** — Eric : *« si l'auto fait bien son travail, effectivement les boutons sont obsolètes »*. La rampe de crans du Menu est **retirée** (lot 118) : depuis l'échelle continue, Auto rend déjà le plus grand facteur que la fenêtre porte, et un cran manuel ne pouvait que **rapetisser** (mesuré à 1366 × 1024 : Auto ×1,83, « Large » ×1,25 — le libellé mentait). La taille se règle en **redimensionnant la fenêtre** ; sur téléphone et tablette, l'appareil décide. Les clefs `fhpc.echelle.cran*` sont effacées à chaque lecture. ⚖️ **Et la RAISON de ce retrait tombe le même jour** — voir l'amendement du 02/09 ci-dessous : avec le partage, un réglage joueur peut agrandir |

### 🔴 AMENDEMENT DU 2026-09-20 — **LE TEXTE GARDE SA TAILLE**
📍 `panneau-texte-fixe` · vivante · 20/09 · borne `panneau-zoom-sans-exception`
⚖️ **Les boîtes suivent le zoom, le texte non : T0…T7 sont des pixels d'écran. Le moteur qui zoome le texte est compensé ; celui qui ne le zoome pas (Safari iPad) est laissé tel quel. Un sauf-conduit d'une ligne (`TEXTE_FIXE`, `echelle.mjs`) rend l'état d'avant.**

> **« les organes de taille identique, mais pas le texte »** *(deux captures côte à côte, Mac et iPad)*
> **« le webkit donne un rendu plus joli que celui du mac »**
> **« 1 »** *(à la question « le Mac s'aligne sur l'iPad, ou l'inverse ? »)* · **« mets en place un sauf-conduit si on se rend compte que ça marche pas »**

**Ce que la loi du 30/08 disait, et ce qui change.** *« Tout le builder suit le zoom, les ratios ne changent nulle part. »* Depuis le 20/09 le texte est la **seule** exception : le rapport texte/boîte **change** avec la fenêtre, et c'est voulu. Tout le reste de §0 bis tient — plancher, grandeur, `--touch`, jamais de `@media` de largeur.

**Mesuré avant d'écrire** *(banc « Le texte suit-il le zoom ? », mêmes `shell.css`, `tokens.css` et Inter que le builder ; témoin = rapport largeur du texte / largeur de sa boîte, sous `.app` à 1,28 et hors zoom)* :

| appareil · moteur | heure | `text-size-adjust` | le texte suit-il ? |
|---|---|---|---|
| iPad Pro 13 · Safari | 02:28 · 02:37 · 02:47 | 100 % · auto · none | ⛔ **non** — écart 21,9 %, six largeurs identiques au dixième dans les trois modes |
| iPad Pro 13 · Safari, **page nue** sans nos feuilles | 02:51 | — | ⛔ **non** — 8 → 9, 12 → 13, 16 → 16 déclarés, et le zoom ignoré |
| Mac · Chrome | 02:38 | auto · 100 % | ✅ oui — 0,03 % |
| Mac · Safari | 02:31 · 02:32 | auto · 100 % | ✅ oui — 2,8 % |

⭐ **Donc c'est le moteur, pas nos feuilles** : Safari iPad calcule le texte depuis la taille **déclarée** (avec un petit rehaussement sous 16) et ignore le `zoom` du conteneur ; aucune des trois valeurs de `text-size-adjust` ne l'en empêche. Chrome, et Safari macOS, zooment le texte. PC et Android tournent sur le moteur de Chrome.

⛔ **Ce qui a été cru puis réfuté la même nuit** : la ligne `html { text-size-adjust: 100% }` (commit 01d0107b, 02:59) posée sur l'hypothèse *« WebKit recalcule par-dessus le zoom, cette ligne l'en empêche »*. Mesurée : inerte sur les trois appareils. Retirée.

**Le mécanisme, en trois pièces** :

| pièce | où | ce qu'elle fait |
|---|---|---|
| la **sonde** | `echelle.mjs` · `poserSondeTexte` (posée par `shell.mjs` au démarrage) | deux témoins invisibles, le même texte avec et sans `zoom: 2` ; `texteSuitLeZoom` compare leurs largeurs — 2 = le moteur zoome le texte, 1 = il ne le zoome pas. ⛔ Jamais l'agent : l'iPad se présente comme un Mac |
| l'**attribut** | `appliquerEchelle` → `<html data-texte-suit-zoom="oui">` | posé seulement quand le moteur zoome le texte ; troisième attribut sur `<html>`, toujours aucun nœud |
| la **compensation** | `tokens.css` · `--compense-texte` | 1 par défaut ; `var(--echelle)` sous `html[data-texte-suit-zoom="oui"]`. Les huit crans sont `calc(N px / var(--compense-texte))` : division et zoom s'annulent, le texte rend N px. Le nombre reste sur chaque ligne |

⭐ **Le sauf-conduit** : `TEXTE_FIXE = false` dans `echelle.mjs`. Une ligne. L'attribut n'est plus posé, `--compense-texte` reste 1, Mac, PC et Android rendent comme avant l'amendement ; l'iPad n'a jamais changé. Le garde `echelle.test.mjs` éprouve les deux positions.

⚠️ **Ce que ça touche d'autre** : les 40 cotes en `em` de `shell.css` (interlettrages, hauteurs de lignes, réserve de `--touch` autour d'un texte) suivent le texte, comme elles le doivent. Aucune cote de boîte n'est en `em`.

### 🔴 AMENDEMENT DU 2026-09-02 — **LE BUILDER EST UN PARTAGE DE L'ÉCRAN**
📍 `panneau-amendement-2026-09-02` · vivante · 02/09
⚖️ **La taille du panneau se déduit du PARTAGE de la fenêtre — sept crans, une part par cran — jamais d'une taille d'écran.**

> **« Concept. Builder plein écran sur mobile. […] Etc… »**
> **« Donc largeur plutôt basée sur la largeur, et un plancher à la hauteur ; si ça passe pas on
> saute un cran en dessous. »** · **« Tout passe en mode widget pour desktops. »**
> **« iPad tu suggères 1/2 donc, là où petit écran tu suggères 1/3. »** · **« 7 crans »**

⭐ **Ce n'est pas une taille d'écran, c'est un PARTAGE** — *« combien la fenêtre donne au
builder, et combien elle laisse à côté »*.
⚠️ **ATTRIBUTION CORRIGÉE LE 02/09** : cette phrase a été écrite ici comme « le mot d'Eric du
31/08 ». Elle ne l'est pas. Vérifié au transcrit brut, champ `role` : c'est une **reformulation de
l'architecte** (30/08 23h45 UTC, `role = assistant`, *« ton échelle […] c'est une échelle de
partage »* — il s'adresse à Eric, il ne le cite pas). Eric ne l'a jamais tapée ; il l'a laissée
passer. ⭐ **La formulation reste** — elle est juste et elle éclaire la règle. C'est sa **signature**
qui était fausse. ⛔ Une norme qui cite faux se défend ensuite toute seule : c'est le même défaut
que la cote DÉDUITE prise pour une cote DONNÉE.
Les citations d'Eric de cette section, elles, sont vérifiées : *« Tout passe en mode widget pour
desktops »* · *« largeur plutôt basée sur la largeur, et un plancher à la hauteur »* · *« 7 crans »*. `1/4` dit « un quart pour
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

### ✅ LES DEUX BORNES DU CRAN DES TABLETTES — **mesurées, jamais choisies** *(ratifiées 02/09)*
📍 `panneau-deux-bornes-cran-tablettes` · vivante · 02/09
⚖️ **Le cran du demi est borné à `768` en bas et `1440` en haut, et les deux bornes sont MESURÉES : un appareil en sort parce qu'il ne passe pas, jamais parce qu'on l'a jugé.**

> **« probablement un iPad mini va préférer un affichage mobile »** · **« du classique au Pro 13
> pouces, le 1/2 passera »**

| borne | ce qui la pose |
|---|---|
| **en bas, `768`** | l'iPad mini debout fait **744** : au demi il rendrait `744/2 = 372`, soit ×0,99 — **sous le panneau nu**. C'est le **seul appareil de la gamme** dans ce cas. L'iPad classique 9,7 juste au-dessus fait 768 et rend 384. ⭐ **La règle ne l'exclut pas par jugement, elle l'exclut parce qu'il NE PASSE PAS** |
| **en haut, `1440`** | le cran du demi doit couvrir **toutes les tablettes couchées**, et la plus large est l'iPad Pro 13 à **1376** ; 1440 est le premier portable. ⛔ Un seuil sous 1376 couperait la famille **par la largeur**, alors que c'est la **hauteur** qui doit la couper |

⭐ **ET L'INVARIANT DERRIÈRE, qui vaut pour les cinq crans partagés** : à l'entrée de son cran, la
part rend **au moins le dessin**. Mesuré : `768/2 = 384` · `1440/3 = 480` · `1680/4 = 420` ·
`2200/5 = 440` · `3000/6 = 500`. ➡️ **Le plancher n'est jamais atteint à une entrée : c'est une
défense, pas un mécanisme.**

⛔ **ET LE MOT « MINI » N'EXISTE NULLE PART DANS LE CODE hors du nom d'un cran.** Le mini couché
fait 1133, donc il est POSÉ sur le demi, puis sa hauteur de 744 le fait **sauter un cran** : il rend
`378 × 564`, ×1,01. Aucun cas particulier n'est écrit pour lui, et il ne doit jamais l'être.

### 📏 COUCHÉE, LA GAMME iPAD SE COUPE EN DEUX — et c'est le saut de cran qui coupe
📍 `panneau-couchee-gamme-ipad-se-coupe-en-deux` · vivante · ?
⚖️ **Aucun appareil n'a de cas particulier : c'est le SAUT DE CRAN qui coupe la gamme des tablettes, et il se déduit du rapport `--panneau-h / --panneau-l`.**

| appareil | couché | ratio | cran rendu | panneau | 2 panneaux |
|---|---|---|---|---|---|
| iPad 9,7 | 1024 × 768 | 1,33 | **demi** | 512 × 765 | **100 %** |
| iPad Pro 12,9 *(celui d'Eric)* | 1366 × 1024 | 1,33 | **demi** | 683 × 1020 | **100 %** |
| iPad Pro 13 | 1376 × 1032 | 1,33 | **demi** | 688 × 1027 | **100 %** |
| iPad mini | 1133 × 744 | 1,52 | *saut* → tiers | 378 × 564 | 89 % |
| iPad Air | 1180 × 820 | 1,44 | *saut* → tiers | 393 × 587 | 94 % |
| iPad Pro 11 | 1194 × 834 | 1,43 | *saut* → tiers | 398 × 594 | 95 % |

⭐ **L'iPad d'Eric est le meilleur cas de la gamme** — ce n'est ni un défaut ni à corriger, mais il
doit le lire : c'est ce que verront les autres.

🔴 **ET LES 4:3 TIENNENT LE DEMI À 0,4 % PRÈS.** Un 4:3 couché porte le demi si et seulement si
`--panneau-h ≤ 1,5 × --panneau-l`, soit **562,5** pour un panneau de 375. Le dépôt est à **560** :
il reste **2,5 blg**, mesurés **3 à 5 px** à l'écran. ⚠️ **Monter `--panneau-h` de trois blg ferait
sauter d'un cran toute la famille 4:3 d'un coup**, et aucune autre règle ne broncherait. Un garde
tient cette frontière dans les deux sens.

### Le mécanisme, en deux temps
📍 `panneau-mecanisme-en-deux-temps` · vivante · 31/08
⚖️ **La LARGEUR pose le cran, la HAUTEUR ne fait que descendre : quand la place ne porte pas la hauteur, on saute un cran en dessous, ⛔ on ne rabote jamais la largeur.**

| | |
|---|---|
| ① **la LARGEUR pose le cran** | l'écran choisit son cran, le cran donne sa part, la part donne la largeur. **Rien d'autre n'intervient à ce stade** |
| ② **la HAUTEUR ne fait que DESCENDRE** | on calcule la hauteur qu'il faut (`largeur × 560/375`). Si la place ne la porte pas, ⛔ on ne rabote pas la largeur d'un continuum : **on saute un cran en dessous**, autant de fois qu'il le faut |
| ⚠️ **« un cran en dessous » se compte en TAILLE RENDUE** | ⛔ pas en indice, et ⛔ pas « la part du cran d'en dessous appliquée à cet écran-ci » : cette seconde lecture donne une taille **plus grande** et inverse le saut |
| 🔴 **le plancher est le DESSIN, pas un nombre** | un partage ne rend jamais moins que `--panneau-l`, **lu dans les jetons**. Sous le dessin, un builder n'est pas plus petit, il est **coupé**. Seul le plein écran y échappe — c'est là que vit le cran réduit |
| 📌 **le 96 % est un QUOTIENT** | `360 / 375 = 0,96`, exactement. ⛔ Jamais écrit en littéral. Eric, 31/08 : *« si tu réduis de 4 % la taille sur mini mobile c'est ok »* |
| ⚠️ **le résidu, nommé plutôt que masqué** | si même le DERNIER cran ne tient pas en hauteur, la descente n'a plus rien sous elle et le panneau déborde. Mesuré : `2999 × 700` demande 746 de haut. ⛔ **Aucun huitième cran inventé** — le garde le laisse visible |

### ⚖️ Le saut de cran a un témoin, et un seul
📍 `panneau-saut-cran-a-temoin-et-seul` · vivante · 31/08
⚖️ **Le saut de cran a un témoin unique — l'iPad Air couché, `1180 × 820` — et un garde prouve d'abord qu'il DÉBORDERAIT, puis qu'il descend, puis qu'il tient.**

📏 **L'iPad Air couché, `1180 × 820`** : au demi il demande `590 × 881` pour 820 disponibles — **il
déborde de 61**. Il saute un cran, retombe au tiers, et rend **`393 × 587`**, 72 % de la hauteur.
⭐ **C'est le seul cas de toute la table où le saut se déclenche.** S'il cessait de se déclencher
là, le mécanisme serait mort et la table seule le cacherait — d'où un garde qui prouve d'abord
qu'il DÉBORDERAIT, puis qu'il descend, puis qu'il tient.

### 🧊 Ce que cet amendement renverse, et pourquoi
📍 `panneau-ce-que-cet-amendement-renverse-et-pourquoi` · vivante · 31/08
⚖️ **Au-dessus du plein écran l'échelle est DISCRÈTE — sept crans — et `min(L/375, H/560)` ne vaut plus qu'en plein écran et en vue double.**

| renversé | remplacé par |
|---|---|
| ~~**la règle sacrée du 31/08** `min(L/375, H/560)` partout~~ | elle **tient toujours** en plein écran *(« sur téléphone et tablette, l'appareil décide »)* et **en vue double**, où deux panneaux font déjà l'écran. Elle est amendée **pour la vue simple à partir de la tablette** : elle rendait ×1,93 sur un 1920 × 1080 — un panneau de 723 × 1080, **89 % de la hauteur**, une bande haute et étroite. Eric : *« plus du tout respectée »* |
| ~~**l'échelle est continue**~~ | au-dessus du plein écran elle est **discrète** — c'est ce que *« 7 crans »* veut dire, et c'est ce qui rend le réglage joueur possible |
| ~~**la rampe de crans du Menu est obsolète** *(lot 118, ce matin)*~~ | ⚖️ **la raison du 118 tombe.** Elle était mesurée : *depuis l'échelle continue, l'auto rendait déjà le plus grand facteur que la fenêtre porte, donc un cran manuel ne pouvait que **rapetisser*** (1366 × 1024 : Auto ×1,83, « Large » ×1,25 — le libellé mentait). ⭐ **Avec le partage, l'auto rend ×0,96 à ×1,53 : un réglage joueur peut désormais AGRANDIR autant que réduire.** Eric : *« décision de le faire en auto, et laisser le joueur régler à sa guise »* — l'auto reste le **défaut**, jamais un mur. ⛔ Les clefs `fhpc.echelle.cran*` ne ressuscitent pas : le 118 les efface à chaque lecture, et deux mécanismes de réglage se battraient |
| ~~**« 1/3 sur iPad »** *(première formulation du 02/09)*~~ | ⛔ **mort le jour même.** Mesuré : sur un iPad couché le tiers portait le vide de **50 à 67 %** — il rétrécissait le panneau **sans réduire le vide, il l'augmentait** ; et debout il tombait **sous le panneau nu** (`1024/3 = 341`). Le demi le remplace |
| ~~**les six noms du 31/08** `mini · mobile · small · medium · large · extra`~~ | Eric a nommé cette échelle deux fois. **Liste retenue le 02/09**, sur sa réponse *« celle du 2/09 »*. ⚠️ **Le cran réduit, lui, revient** — il avait disparu d'une lecture intermédiaire qui le prenait pour un état et non pour un rang ; Eric a tranché *« 7 crans »*. Sa reprise n'est pas une erreur |

### ⏳ Le repli désigné, **écrit et non construit** *(30/08 au soir)*
📍 `panneau-repli-ce-qui-change` · en standby · 30/08
⚖️ **Sous le repli, un `position: fixed` viserait `.app` et non la fenêtre, `.app` deviendrait un contexte d'empilement, et la netteté passerait au compositeur.**
📍 `panneau-repli-transform` · en standby · 30/08
⚖️ **Un repli en `transform: scale()` est écrit mais NON construit, et il ne doit pas l'être avant mesure sur appareil.**
📍 `socle-pas-de-code-mort` · vivante · 30/08
⚖️ **Une branche jamais parcourue est une branche jamais testée : le code mort est interdit (loi §0.6).**

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
📍 `ecriture-t1-t4-bougent-desormais` · remplacée · 30/08
⚖️ **« T1–T4 ne bougent pas » est tombé avec la grandeur Large : au cran 3 le corps vaut 48 blg.**
📍 `panneau-grandeur-large-supprimee` · remplacée · 30/08
⚖️ **La grandeur « Large » n'existe plus : `@media (min-width: 1140px)` et ses rehaussements de cotes sont retirés.**
📍 `panneau-zoom-universel` · vivante · 30/08
⚖️ **Tout le builder suit le zoom ; aucun ratio ne change nulle part.**

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
📍 `ecriture-t1-a-t7` · vivante · 26/08
⚖️ **Les tailles de texte se nomment T1 à T7 — jamais H1/H2.**
📍 `socle-quatre-vocabulaires` · vivante · 26/08
⚖️ **Quatre vocabulaires ne se mélangent jamais : `R`/`B`/`SB` = un RANG · `F`/`FF`/`FS` = le CADRE · carte/dalle/tuile = l'OBJET · `T1…T7` = les tailles de texte.**
📍 `socle-r1-n-existe-pas` · vivante · 26/08
⚖️ **« R1 » n'existe pas, et on écrit toujours « Entrée › B2 » ou « Équipement › B2 », jamais « B2 » seul.**

> ## 🚪 AMENDEMENT n° 1 — **LE VOCABULAIRE EST UNE PORTE, PAS UNE ANNEXE** *(Eric, 2026-09-05)*
>
> **« il faut que tout le monde sache, avant d'écrire quoi que ce soit dedans, respecte sa
> terminologie »**
>
> 🔴 **AVANT D'ÉCRIRE UNE LIGNE DANS CE CORPUS — ou dans le builder — ON APPREND SES MOTS.**
> Ce n'est pas une politesse de rédaction : c'est la **condition d'entrée**. Un lot qui écrit
> avec ses propres mots produit une règle que personne ne retrouvera, et qui contredira sans
> qu'on le voie une règle déjà là sous un autre nom.
>
> ⛔ **ET ÇA VAUT DANS LES DEUX SENS.** Employer un mot du corpus pour autre chose est aussi
> grave que d'en inventer un : le nom `aiguilleur` était **déjà pris** (le recouvrement plein
> écran d'Équipement) quand une session l'a repris pour un texte de guide — le banc l'a rendu
> 375 × 500 blg, et c'est la MESURE qui a envoyé lire la norme, pas l'inverse.
>
> ⭐ **CE QUE CET AMENDEMENT COÛTE À CELUI QUI ÉCRIT** : une lecture. ⭐ **CE QU'IL ÉVITE** :
> une règle orpheline qu'on ne peut ni citer, ni périmer, ni comparer — c'est-à-dire une
> règle qui **s'empile** au lieu de remplacer. C'est la maladie que tout ce corpus paie.
>
> 📌 **PREMIER AMENDEMENT DU RÉGIME DES ANCRES** : à partir d'ici, une règle a une adresse, un
> statut et un lien. Un mot juste est ce qui rend l'adresse trouvable — sans lui, les trois
> autres ne servent à rien.


> ## 🧭 AMENDEMENT n° 2 — **TOUT PROMPT D'ARCHITECTE MÈNE À LA BIBLE** *(Eric, 2026-09-05)*
>
> **« tout prompt fixé par un architecte doit mener à la bible »**
>
> 🔴 **UN PROMPT N'EST PAS UNE SOURCE, C'EST UN CHEMIN.** Un mandat, une passation, une
> commande à un siège : ces textes **désignent** les règles, ⛔ ils ne les redisent pas. Le
> lecteur doit finir **dans le corpus**, à l'adresse exacte — pas dans un résumé du corpus.
>
> ⛔ **ET CETTE RÈGLE ACCUSE D'ABORD L'ARCHITECTE.** Les mandats écrits jusqu'ici recopiaient
> des pans entiers de règles « pour que le siège n'ait pas à chercher ». Chacun est devenu une
> **copie de plus** — exactement la maladie que le chantier de la source unique existe pour
> soigner. Un mandat qui recopie une règle en crée une seconde, et la seconde dérive.
>
> ⭐ **CE QU'UN PROMPT PORTE LÉGITIMEMENT** : ce que le corpus **ne peut pas** porter — la
> mesure du jour, l'état du terrain, le geste attendu, la question à poser à Eric. ⛔ **Ce
> qu'il ne porte jamais** : l'énoncé d'une règle. Pour ça, il donne son **adresse**.
>
> 📌 **CONSÉQUENCE DIRECTE DE L'AMENDEMENT n° 1** : un prompt ne peut mener à une règle que si
> cette règle a une **adresse** et que l'auteur du prompt en connaît le **mot juste**. Les deux
> amendements sont une seule loi prise par ses deux bouts — le vocabulaire à l'entrée,
> l'adressage à la sortie.


| vocabulaire | ce qu'il nomme |
|---|---|
| **`R` / `B` / `SB`** | un **RANG** dans une arborescence (la profondeur). ⛔ **JAMAIS un nom de page** — une page a un **nom** |
| **`F` / `FF`** | le **CADRE**, et il n'y en a que DEUX par défaut *(Eric, 06/09)*. Seul l'écran porte la lettre. ⛔ `FS` et les chiffres (`F1`, `FF2`…) sont des **subtilités** : elles se discutent **quand on travaille sur la page concernée**, jamais dans la nomenclature générale |
| **carte · dalle · tuile** | l'**OBJET**. ⛔ ne porte jamais de lettre. Une **carte** a une hauteur imposée |
| **`T0`…`T7`** | les tailles de texte (T0 = 8 px, un renfort sous un dé, ajouté le 05/09 sur *« passe en T0 »* — jamais une ligne à lire). ⛔ pas `H1`/`H2` |

⛔ ~~**« R1 » n'existe pas.** Cette faute a coûté un lot entier le 2026-08-23.~~
📍 `vocabulaire-r1-n-existe-pas` · remplacée · 23/08 · remplacée par `vocabulaire-r-de-depart-r-d-arrivee`
⚖️ **`R1` n'existe pas : `R` est un rang, et un chiffre derrière lui nommerait une page.**

### ⭐ LE `R` A DEUX TEMPS — **R de DÉPART et R d'ARRIVÉE** *(Eric, 2026-09-06)*
📍 `vocabulaire-r-de-depart-r-d-arrivee` · vivante · 06/09 · remplace `vocabulaire-r1-n-existe-pas`
⚖️ **Le `R` a deux temps — `R1` le R de DÉPART (le choix), `R2` le R d'ARRIVÉE (le bilan) — et le chiffre y nomme un TEMPS du rang, jamais une page.**

> Eric, 2026-09-06 : *« j'ai changé la terminologie avec le R d'arrivée et de départ,
> mais ça fait plus sens »* · *« je l'ai utilisé pour Abilities aussi »*.

| | |
|---|---|
| **R1 — le R de DÉPART** | la racine telle qu'on l'aborde : le CHOIX à faire |
| **R2 — le R d'ARRIVÉE** | la même racine une fois l'étape validée : le **BILAN** |

⭐ **CE QUE LE RENVERSEMENT CORRIGE, ET POURQUOI IL EST JUSTE.** La loi du 23/08
interdisait `R1` parce qu'à l'époque **un rang n'avait qu'un seul écran** : un chiffre
derrière `R` ne pouvait donc désigner qu'une PAGE, et `R`/`B`/`SB` est un rang, jamais
un nom de page (loi ci-dessus, elle, **toujours vivante**). Le bilan du 06/09 a créé le
cas que la loi ne connaissait pas : **une racine qui a deux états successifs**. Le
chiffre ne nomme plus une page — il nomme **un TEMPS du même rang**.

⛔ **CE QUI RESTE INTERDIT, ET N'A PAS BOUGÉ D'UN MOT** : `B1`, `B2`, `SB2` restent des
RANGS, jamais des noms de page ; et on écrit toujours **« Entrée › B2 »**, jamais « B2 »
seul. Le renversement ne touche QUE le `R`, et seulement parce qu'il a deux temps.

📌 **Déjà en usage** : `NORMES §7.9` (le bilan d'Abilities, 06/09) et l'écran final de
Destiny. ⚠️ Cette section existe parce que le corpus se contredisait : §7.9 employait
`R1`/`R2` le matin même où la ligne du 23/08 les interdisait encore. **Les deux étaient
écrites, aucune ne pointait vers l'autre.**
⛔ Écrire **« Entrée › B2 »** ou **« Équipement › B2 »**, jamais « B2 » seul : chaque chapitre a
son propre `R`, ses propres `B`.

---

## 0. 🔴 LA RÈGLE UNIVERSELLE — **« GOOGLE HEADLESS »**
📍 `socle-chrome-headless-ne-fabrique-pas-de-pdf` · vivante · 26/08
⚖️ **Chrome headless sert à REGARDER une page, pas à en fabriquer une : les PDF Fate's Hand se génèrent à la weasyprint.**
📍 `socle-google-headless` · vivante · 26/08
⚖️ **Une norme se vérifie sur la PAGE RENDUE, pas dans la source.**

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
📍 `socle-le-garde-qui-manque` · à trancher · 26/08
⚖️ **Un test qui lit un fichier CSS vérifie ce qui est ÉCRIT ; un test qui rend la page vérifie ce que le joueur VOIT — le second manque.**

| | |
|---|---|
| **Google Chrome** | ✅ `151.0.7922.174`, installé |
| **puppeteer / playwright** | 🔴 **absents** de `fhpc` — à ajouter, épinglés, comme toute dépendance de dev |

⚠️ **⛔ Ne pas confondre avec la règle des PDF** : les PDF Fate's Hand se génèrent à la
**weasyprint**, jamais à Chrome headless *(qui plante sur ce pipeline)*. **Chrome headless sert à
REGARDER une page, pas à en fabriquer une.**

---

## 1 bis. 🔴 RIEN N'EST JAMAIS DANS LA MARGE
📍 `cadre-rien-dans-la-marge` · vivante · 26/08
⚖️ **Rien n'est jamais dans la marge, à part une dalle ou une tuile.**

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

## 1 bis. 🗣️ LES MOTS QUI PORTENT DEUX SENS — la liste, et elle est courte exprès
📍 `vocabulaire-mots-a-deux-sens` · vivante · 07/09
⚖️ **Un mot du dépôt qui porte deux sens s'écrit ICI, avec ses deux sens et l'incident qui l'a révélé — ⛔ on ne le renomme pas au passage.**

🔴 **L'INCIDENT QUI CRÉE CETTE SECTION, LE 2026-09-07 VERS 03h.** Deux sièges ont failli se croiser
sur le mot **jeton** : l'un parlait de l'ORGANE *(celui qu'on glisse)*, l'autre d'une VARIABLE CSS
*(`--lie`, `--tier-1`, `--sp-8`)*. Aucun des deux n'avait tort, et rien n'aurait signalé le
malentendu — ⛔ **deux sens d'un même mot ne produisent pas d'erreur, ils produisent un accord
apparent.**

⚠️ **ET CETTE SECTION EXISTE PARCE QU'ELLE N'EXISTAIT PAS.** L'architecte a écrit *« ce mot rejoint
ta liste »* — 📏 vérifié le 07/09 : **il n'y avait pas de liste**. Le corpus documentait **un** cas,
au détour d'une note de `SOCLE.md`, et rien ne le rassemblait avec les autres. ⭐ *Croire qu'un lieu
existe parce qu'on y range depuis longtemps est la même faute que déduire un fichier d'un préfixe* —
et c'est la seconde fois en une nuit.

| le mot | sens ⑴ | sens ⑵ | où c'est écrit |
|---|---|---|---|
| **fiche** | la **feuille de personnage** — ce que `render-fiche.mjs` émet | la **surface qui défile**, quand Eric le dit ; en CODE elle s'appelle `.stage` | `socle-fiche-vs-stage` — ⚠️ mesuré : la feuille de Review héritait `position: absolute` et rendait une boîte de hauteur zéro |
| **jeton** | l'**ORGANE** qu'on glisse — 87 × 48, l'octogone de §2 *(Eric dit « token »)* | une **variable CSS** au socle — `--lie`, `--tier-1`, `--sp-8` | ici, 07/09. ⚠️ Deux sièges ont failli se croiser dessus |
| **livre** | l'**ORGANE** — le bouton 📖 posé sur une rangée, qui MÈNE à un chapitre (`.fiche-livre`) | le **PRODUIT** — le livre publié, FH WEB, le manuscrit | ici, 07/09. ⚠️ Incident mesuré ci-dessous : la loi de la trilogie a été écrite dans un sens et lue dans l'autre |

🔴 **L'INCIDENT DU MOT « LIVRE », ET IL A COÛTÉ CINQ ÉCRANS.** La loi *« la trilogie est due à tout
écran — livre · bouton(s) · `?` »* *(`rangee-trilogie-due-partout`, 06/09)* parle de **l'organe**.
📏 Relevé écran par écran le 06/09 à 14:31, sur douze rangées : **cinq n'avaient pas de livre**.
⭐ **Et la cause est la dissymétrie que le mot cachait** — mesurée par moi sur `origin/main` :

| l'organe | qui le fabrique | ce qui arrive |
|---|---|---|
| le **`?`** *(`.tuto-point`)* | **la coquille seule** — `shell.mjs`, et aucun fichier d'écran | il ne manque **nulle part** |
| le **livre** *(`.fiche-livre`)* | **cinq fichiers d'écran** *(`abilities-step` · `catalogue` · `concept-step` · `destiny-step` · `parcours-ecrans`)* **plus** la coquille | absent **5 fois sur 12** |

⛔ **Personne n'avait rapproché les deux, parce que *« le livre »* dans la loi ne disait pas lequel
des deux sens.** Un lecteur qui pense au PRODUIT ne se demande pas qui le fabrique ; un lecteur qui
pense à l'ORGANE se le demande tout de suite. ⭐ *Un mot à deux sens ne fait pas hésiter : il fait
lire la mauvaise question.*
📏 **ET IL EST PARTOUT** : `livre` rend **171 occurrences** dans les quatre fichiers du corpus —
c'est le mot ambigu le plus fréquent qu'on ait mesuré.
📌 Relayé par l'architecte, avec ses deux sens et son incident, exactement au format que cette
section exige. ⛔ *Il en nommait trois autres et n'a envoyé que celui-là : il n'avait le dossier
complet que pour lui.* C'est la bonne retenue.

⏳ **DEUX AUTRES SONT NOMMÉS PAR L'ARCHITECTE ET NON VÉRIFIÉS ICI** — *« le site »* et
*« chapitre »*. ⛔ Ils ne sont pas gravés : on n'inscrit pas un mot ambigu sur la foi d'un compte,
il faut **ses deux sens et son incident**. Le jour où l'un d'eux coûte un croisement, il prend sa
ligne.

⛔ **CE QUE CETTE SECTION N'EST PAS : un chantier de renommage.** Renommer un mot du dépôt touche le
code, les gardes et l'habitude d'Eric — c'est une décision, pas une conséquence d'avoir écrit une
liste. ⭐ *Nommer une ambiguïté suffit à la désamorcer* : deux sièges qui savent que le mot en porte
deux demandent lequel, au lieu de se répondre à côté.

---

## 1 ter. 🔴 UNE COTE DE CONTENANT NE S'ÉCRIT PAS — ELLE SE DÉDUIT D'AVANCE
📍 `budget-contenant-se-deduit` · vivante · 26/08
⚖️ **Une cote de contenant ne s'écrit pas, elle se déduit d'avance — de la police, l'interligne, le `padding` et le `gap`.**

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
📍 `budget-cote-donnee-bat-cote-deduite` · vivante · 26/08
⚖️ **Une cote DONNÉE bat toujours une cote DÉDUITE : si Eric a dit un nombre, il gagne.**
📍 `budget-un-organe-porte-sa-cote` · vivante · 26/08
⚖️ **Un ORGANE porte sa cote, un CONTENANT la déduit.**

| ce qui se DÉDUIT | ce qui reste une COTE ÉCRITE |
|---|---|
| la hauteur d'un **contenant** *(ceinture, bande de boutons, dalle)* | `--touch: 44` — **une cible tactile ne cède jamais** |
| | `--glisse-case: 87` · `--glisse-h: 48` — la cote d'un **organe** |
| | `--measure: 62ch` · `--fiche-h: 440` — des cotes **données par Eric** |

⭐ **La règle se lit en une phrase** : *un ORGANE porte sa cote, un CONTENANT la déduit.*
Et ⭐ **une cote DONNÉE bat toujours une cote DÉDUITE** — si Eric a dit un nombre, il gagne.

---

## 1 ter bis. 🔴 UN COLLECTEUR ET SON JETON ONT UNE SEULE COTE *(dicté le 29/08)*
📍 `collecteur-cote` · vivante · 29/08
⚖️ **Un collecteur a toujours exactement la taille d'un jeton, partout.**

> Eric, 2026-08-29 : *« taille du collecteur toujours la même que le jeton, partout — règle à
> faire respecter sur tout le site »*, puis *« règle universelle : **un collecteur = un jeton en
> taille. Ne varie jamais.** »*

⭐ **C'est §1 ter appliqué à une paire.** La cote ne s'écrit nulle part : elle se **déduit du
cadre**, une seule fois, et **les deux organes la lisent** (`--collecteur-case`, déclarée sur
`.choix-glisse`). Deux nombres égaux divergent au premier qui bouge ; un jeton de mesure partagé
ne peut pas diverger.

### ⛔ TROIS FAÇONS DE LA FAIRE DIVERGER — les trois ont été commises, toutes mesurées
📍 `collecteur-cote-sur-l-ancetre-commun` · vivante · 29/08
⚖️ **Une cote partagée se déclare sur l'ANCÊTRE COMMUN des deux organes, jamais sur l'un des deux.**
📍 `jeton-un-organe-ne-retrecit-jamais` · vivante · 29/08
⚖️ **Un organe ne rétrécit jamais sous sa cote : `flex: 0 0`, jamais `0 1`.**

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
📍 `collecteur-cote-dictee-par-un-voisin` · vivante · 29/08
⚖️ **Une cote dictée par un voisin n'est pas une cote : le vivier se centre dans sa rangée au lieu de s'étirer.**

Mesuré : un jeton à **87×60** contre une case à **87×48**, avec UNE ligne de texte (76×12). Ce
n'était pas le nom qui poussait — la colonne du **chevron** (flèche + compte, 60 px) étirait le
vivier par le `align-items: stretch` de la rangée, et le jeton suivait. Parade : le vivier se
**centre** dans sa rangée (`align-self: center`, `listes.css`) ; l'égalisation par CONTENU (deux
jetons côte à côte, un nom qui se replie) vit un niveau plus bas et reste intacte. Garde :
`tests/collecteur-jeton.test.mjs`.

---

## 1 ter bis². ✍️ LES MÊMES RÈGLES D'ÉCRITURE POUR LE JETON ET LE COLLECTEUR *(29/08)*
📍 `collecteur-ecriture-comme-le-jeton` · vivante · 29/08
⚖️ **Les mêmes règles d'écriture s'appliquent au jeton et au collecteur : valeur en T1, nom en T1 capitales.**
📍 `ecriture-capitale-distingue-l-etiquette` · vivante · 26/08
⚖️ **Le nom d'un collecteur est en capitales, sa valeur en minuscules : la capitale est ce qui les distingue, jamais la taille.**

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
📍 `ecriture-couleur-du-lien` · vivante · 29/08
⚖️ **`--lien` est un bleu à un souffle de l'encre : `#1f3250` de jour, `#c2d0e5` de nuit.**
📍 `ecriture-lien-hors-jeton-est-bleu` · vivante · 29/08
⚖️ **Un lien hors jeton est bleu, non souligné ; le texte SUR un jeton reste en encre.**
📍 `ecriture-pas-de-soulignement` · vivante · 29/08
⚖️ **Un lien n'est jamais souligné, et la décoration par défaut du navigateur doit être retirée explicitement.**
📍 `jeton-texte-en-encre` · vivante · 28/08
⚖️ **Le texte SUR un jeton reste en encre, jamais en bleu de lien.**
📍 `ecriture-option-soulignage-daltoniens` · à trancher · 29/08
⚖️ **Une option joueur de soulignage des liens est à prévoir pour qui ne distingue pas ce bleu de l'encre.**

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
📍 `collecteur-quatre-par-ligne` · vivante · 29/08
⚖️ **Les collecteurs ne dépassent jamais quatre par ligne ; au-delà on passe à la ligne, et une ligne incomplète se centre.**
📍 `collecteur-six-caracs-une-ligne` · vivante · 29/08
⚖️ **Les six caractéristiques tiennent sur UNE ligne de collecteurs, jamais de retour.**
📍 `jeton-six-des-sur-une-ligne` · vivante · 29/08
⚖️ **Les dés d'Ability rolls tiennent à SIX sur une ligne, jetons comme collecteurs, dans leur organe propre.**

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
📍 `panneau-compatibilite-360` · vivante · 29/08
⚖️ **Toute mesure de largeur se prend à 360, et les grands écrans sont normalisés sur une largeur max.**

> Eric : *« on vise toujours la compatibilité avec **360** sur tout le site »* · *« ce que je veux
> est simple : que ça **tienne toujours en largeur sur 360**, et que les grands écrans soient
> **normalisés sur une largeur max** »*.

**Toute mesure de largeur se prend à 360.** C'est déjà la largeur du banc (`banc-listes.html`), et
le garde le vérifie — si le banc changeait de largeur en silence, toutes les mesures du dépôt
parleraient d'un autre écran.

### La gouttière cède si et seulement si un organe ne rentre pas sans elle
📍 `cadre-marge-cede-la-derniere` · vivante · 29/08
⚖️ **La gouttière ne cède que si un organe ne rentre pas sans elle — et à 360 la mesure dit qu'elle reste.**
📍 `cadre-pas-de-width-100-sur-boite-a-marge` · vivante · 29/08
⚖️ **On ne remplit pas une largeur avec `width: 100%` sur une boîte qui porte une marge : les gouttières se portent sur le CADRE.**

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

## 1 ter quinquies. 🔴 L'ÉCHELLE EST UN ESCALIER — **on descend TOUT le bloc, on ne sort jamais UNE valeur** *(dicté le 2026-09-03)*
📍 `panneau-echelle-est-escalier` · vivante · 03/09
⚖️ **Quand un seul endroit ne tient pas, c'est TOUT le bloc qui descend au barreau inférieur ; ⛔ jamais une valeur locale posée hors de l'échelle.**

> **« Rajouter un cran à l'échelle si besoin, et toujours arrondir la GLOBALITÉ à l'inférieur,
> si problème à un endroit. »**

⭐ **QUAND UN SEUL ENDROIT NE TIENT PAS, C'EST TOUT LE BLOC QUI DESCEND D'UN CRAN.** Jamais une
valeur locale qui sort de l'échelle pour sauver sa colonne. **L'homogénéité prime sur l'ajustement
local** : un écran dont tous les organes sont sur des barreaux se lit comme un seul objet ; un
écran où l'un d'eux est entre deux barreaux se lit comme un montage.

| le geste | ce qu'il vaut |
|---|---|
| ✅ **descendre TOUT le bloc au barreau inférieur** | la forme normale. On perd un cran partout, on ne perd l'homogénéité nulle part |
| ✅ **ajouter un cran à l'échelle** | légal **si aucun barreau existant ne convient** — et c'est une **décision d'Eric**, pas la conséquence d'un lot. Un lot qui croit en avoir besoin **s'arrête et le dit** |
| ⛔ **poser la valeur qui manque, en dur, à cet endroit-là** | c'est la faute. Elle est invisible au cran 1 et **grandit avec le zoom** |

### 🔴 Pourquoi la faute ne se voit QUE sur les grands écrans
📍 `panneau-pourquoi-faute-ne-se-voit-que-sur-grands-ecrans` · vivante · ?
⚖️ **Une valeur hors échelle n'est jamais « juste sur cet écran-là » : elle est fausse partout, et le cran ne fait que la rendre visible ailleurs.**

Eric, en regardant les fiches du rang R : *« sur mon iPhone les caractères et les espaces sont
homogènes ; par contre sur l'iPad et sur le desktop les caractères et les espaces sont incohérents,
tailles différentes »*. La cause est arithmétique, pas esthétique — **le cran multiplie l'écart** :

| | iPhone ×1,00 | iPad ×1,4571 | bureau ×1,28 |
|---|---|---|---|
| `--t2` | 12,0 | 17,5 | 15,4 |
| **13 en dur** | 13,0 | **18,9** ⛔ | **16,6** ⛔ |
| `--t3` | 14,0 | 20,4 | 17,9 |

Au cran 1, un 13 posé entre 12 et 14 est **indiscernable**. Au cran de l'iPad, il tombe **entre**
deux barreaux au milieu d'organes qui, eux, sont dessus. ⛔ **Une valeur hors échelle n'est donc
jamais « juste sur cet écran-là » : elle est fausse partout, et seulement visible ailleurs.**

### ⭐ Et la perte va presque toujours dans le BON sens
📍 `panneau-et-perte-va-presque-toujours-dans-bon-sens` · vivante · 03/09
⚖️ **Une taille de texte s'écrit `var(--t0..--t7)` ou un multiple ÉCRIT d'un barreau, un écart `var(--sp-*)` — ⛔ écrire le NOMBRE d'un barreau en littéral est la même faute que d'en écrire un faux.**

La raison qui pousse à sortir de l'échelle est presque toujours *« ça ne rentre pas »*. Or **le
barreau inférieur fait rentrer DAVANTAGE**, pas moins. Mesuré le 03/09 sur la carte du rang R : le
corps du bloc 1 avait été descendu deux fois (`16 → 14 → 13`) **pour faire tenir une colonne** ;
en le posant sur `--t2` (12), les lignes qui débordaient tiennent mieux et **quatre troncatures
mesurées ont reculé** (Dragonborn −14 → −7 blg, Hoddon −20 → −13, −18 → −11, −8 → −2), aucune
nouvelle n'est apparue.

📌 **Corollaire d'écriture** *(§1 ter, et le garde `tests/fiche-sur-l-echelle.test.mjs`)* : une
taille de texte s'écrit `var(--t0..--t7)` ou un **multiple écrit** du barreau
(`calc(var(--t1) * 1.2)` pour une ligne — le rapport est légal, la cote ne l'est pas), un écart
s'écrit `var(--sp-*)`. ⛔ **Écrire le NOMBRE d'un barreau en littéral est la même faute** que d'en
écrire un faux : `18px` valait exactement `--t5` sur la carte du R, et il survivait à la mort de sa
raison.

⚖️ **Ce que la règle ne recouvre pas** : les **cotes d'un dessin** (269 × 440 de la carte, 145 de
sa colonne, 100 de son image — §4 quater) ne sont ni des tailles de texte ni des écarts. Elles ont
leur propre loi et ne montent sur aucune échelle de type.

---

## 1 quater. 📏 LE BUDGET DE LA PAGE — des cotes VOULUES, jamais écrites dans le code
📍 `chevron-cout-en-largeur` · vivante · 26/08
⚖️ **Une paire de chevrons coûte 96 px de largeur à la rangée.**
📍 `panneau-jamais-de-defilement` · vivante · 26/08
⚖️ **La page ne défile jamais — c'est structurel.**

> ⚠️ **Ces nombres ne sont PAS des jetons CSS et ne doivent pas le devenir** *(§1 ter)*. Ce sont
> les cotes que la page **doit tenir**, connues **d'avance**, pour dessiner sans se tromper.

### La cible
📍 `jeton-la-case-ne-s-etire-pas` · vivante · 26/08
⚖️ **La case ne grandit pas pour remplir sa rangée.**
📍 `jeton-trois-colonnes-toujours` · vivante · 26/08
⚖️ **La rangée reste à trois colonnes même sur écran large, et le blanc aux deux bouts est assumé.**
📍 `panneau-hauteurs-de-reference` · vivante · 26/08
⚖️ **Deux hauteurs servent de référence : ≈553 (Safari, barres visibles) et 667 (plein écran) ; toute conclusion de budget dit sur laquelle elle repose.**
📍 `panneau-largeur-cible` · vivante · 26/08
⚖️ **La largeur cible du builder est 360, pas 375.**

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
📍 `budget-ceinture-deduite` · vivante · 26/08
⚖️ **La ceinture n'a ni hauteur ni jeton : elle se déduit, et son ≈60 est un relevé, pas une constante.**
📍 `budget-entree-r-sans-ceinture` · vivante · 26/08 · borne `cadre-belt-toujours-visible`
⚖️ **Entrée › R n'a pas de ceinture : c'est un seuil, pas une étape du parcours — 60 px récupérés.**

| | |
|---|---|
| ⛔ **aucune cote déclarée** | elle n'a **ni hauteur ni jeton** |
| **elle se DÉDUIT** | de sa police, son interligne, son `padding`, son `gap` |
| **au réglage d'aujourd'hui** | ≈ **60 px** — ⚠️ **un relevé, pas une constante** : il bouge si un libellé change |
| **et elle n'est PAS sur tous les écrans** | ⛔ **Entrée › R n'en a pas** : c'est un **seuil**, pas une étape du parcours à 8 temps. **60 px récupérés.** |

### 📐 LA TABLE DES HAUTEURS — pour calculer un budget sans rien mesurer
📍 `budget-table-des-hauteurs` · vivante · 26/08
⚖️ **La table des hauteurs permet de calculer un budget sans rien mesurer.**
📍 `geste-cible-tactile-44` · vivante · 26/08
⚖️ **Tout ce qui se touche a le même plancher : 44.**

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
📍 `dropdown-habit` · vivante · 26/08
⚖️ **Un dropdown est rectangulaire, très large et peu haut, sans aucun liseré, à 20 % de transparence, en caractères gras contrastants.**
📍 `dropdown-ecart-avec-le-code` · dépréciée · 26/08
⚖️ **Le code est en écart sur trois points : liseré 1 px (et même vert conditionnel), fond opaque, pas de gras.**

| | la norme *(26/08)* | le code, **remesuré le 2026-09-05** |
|---|---|---|
| hauteur | 44 | ✅ `min-height: var(--touch)` sur les **deux** dropdowns existants |
| liseré | ⛔ **aucun** | ✅ `border: 0` sur les **six** sites du dropdown |
| fond | **transparence 20 %** | ✅ `--dropdown-fond: color-mix(… var(--voile-dropdown) …)`, `--voile-dropdown: 20%` |
| caractères | **gras** | ✅ `font-weight: 600` sur `.pipeline-dropdown` |

✅ **LES TROIS ÉCARTS SONT RÉPARÉS.** La hauteur n'avait jamais bougé.

> ⏩ **CE QUE CETTE TABLE DISAIT JUSQU'AU 2026-09-05, ET POURQUOI ON LE GARDE.** Elle
> annonçait trois écarts du code : *« liseré 1 px — et `.pipeline-dropdown` porte même
> `--ok`, une bordure VERTE conditionnelle »*, *« fond opaque (`--surface`, `--sunken`) »*,
> *« `font: inherit`, pas de gras »*, avec la mention ⏳ *« trois corrections à faire quand
> les organes seront refaits »*.
>
> 🔴 **AUCUNE DES TROIS N'ÉTAIT ENCORE VRAIE**, et `shell.css` porte lui-même, en
> commentaire au-dessus de `.pipeline-dropdown`, la trace des trois réparations. La règle
> décrivait un code qui n'existait plus — et c'est le corpus, pas le code, qui avait tort.
>
> ⚠️ **C'EST LA MALADIE QUE L'ADRESSAGE EXISTE POUR SOIGNER, PRISE EN FLAGRANT DÉLIT.** Un
> écran se répare, la règle qui le décrit ne le sait pas, et la description périmée continue
> de se lire comme une loi. ⛔ Un écart écrit dans le corpus se **remesure** avant d'être
> cité, jamais recopié sur la foi de sa date.

### Le budget d'une page de jetons *(les 15, en rangées de 3)*
📍 `budget-chevrons-non-comptes` · vivante · 26/08
⚖️ **Le budget de la page de jetons ne compte pas les chevrons : dès qu'une liste pagine, elle perd 96 px de largeur.**
📍 `budget-page-de-jetons` · vivante · 26/08
⚖️ **Une page de 15 jetons pèse 508 sur 553 — il reste 45.**
📍 `budget-trois-jetons-a-360` · vivante · 26/08
⚖️ **Trois jetons à 360, et c'est juste : la rangée dispose de 278, trois en prennent 277 — il reste 1 px.**
📍 `jeton-base-en-tiers-de-rangee` · vivante · 26/08
⚖️ **Pour qu'une ligne contienne trois cases par construction, on donne à la case un tiers de la rangée comme base.**
📍 `jeton-la-case-cede-en-pagination` · vivante · 26/08
⚖️ **Sous pagination, la case cède sa largeur — elle ne passe pas à la ligne.**
📍 `budget-dette-de-l-abrege-a-62` · à trancher · 26/08
⚖️ **À 62 px de case, `ABREGE_MAX = 16` ne promet plus rien : c'est une dette ouverte.**
📍 `budget-en-trop` · à trancher · 26/08
⚖️ **Un contenu qui ne tient pas pose la question « qu'est-ce que la page porte EN TROP ? » — jamais « ajoutons un défilement ».**

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
📍 `budget-entree-r` · à trancher · 26/08
⚖️ **Entrée › R pèse ≈380 sur 553 — il reste 173, et 125 dans le cas le plus étroit.**

**≈ 380 sur 553 — il reste 173.** Avec la raison exigée sous chaque porte muette *(§ du cahier
de R)* : **125** dans le cas le plus étroit. ⭐ **R a de la place**, et la conclusion tient sur les
deux hauteurs.

⚠️ **Ce 380 est un PLAFOND PRUDENT, pas une mesure** : les sept blocs y sont comptés à `--touch`
44, alors que **quatre n'en sont pas** — la zone d'écriture, les deux promesses affichées, et les
trois portes, dont la forme n'est pas tranchée. **Il ne peut que descendre.**

---

## 1 quinquies. 🔴 LE TITRE EST UN NOM DE SECOURS, PAS UN NOM PAR DÉFAUT
📍 `budget-titre-de-secours` · vivante · 26/08
⚖️ **Le titre est un nom de SECOURS, pas un nom par défaut : on ne nomme pas deux fois.**

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
📍 `cadre-cadre-d-ecran-nu` · vivante · 26/08
⚖️ **Le cadre d'écran ne porte ni fond, ni liseré, ni rembourrage — il ne garde que sa marge.**

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
📍 `cadre-seuil-est-un-fs` · vivante · 26/08 · borne `cadre-belt-toujours-visible`
⚖️ **Le Seuil est un FS : plein écran, ni ceinture ni menu latéral, et son titre EST sa sortie.**
📍 `geste-seuil-defile` · vivante · 26/08
⚖️ **Le Seuil défile — c'est un vestibule, pas une page de travail.**

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
📍 `cadre-seuil-ordre-des-blocs` · vivante · 26/08
⚖️ **L'ordre du Seuil est : sortie collée en haut · Nom de joueur · Connecter mon coffre · New character · My characters · DM · Langue · Unités · le `?` collé en bas à droite.**

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
📍 `aide-bas-a-droite` · vivante · 26/08
⚖️ **Le `?` est en bas à droite, fixe, sur la dalle — jamais dans la marge.**
📍 `geste-un-ecran-qui-defile-a-trois-bandes` · vivante · 26/08
⚖️ **Ce qui défile ne porte pas les organes fixes : un écran qui défile a trois bandes, et les deux du dehors ne bougent jamais.**

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
📍 `geste-dressing-defile` · vivante · 26/08
⚖️ **Le dressing (`Équipement › B3`) est le second écran à défiler.**

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

### ✅ LE SAC défile aussi — et il est le premier à le faire **à l'horizontale** *(Eric, 19/09)*
📍 `geste-sac-defile-a-l-horizontale` · vivante · 19/09
⚖️ **Le sac (`Équipement › B1`) est le troisième écran à défiler, et le premier dont le flux va de côté.**

Eric, 2026-09-19, croquis à l'appui : *« dalle fixe »* en haut · *« dalle qui défile »* au milieu ·
*« dalle fixe »* en bas — puis, quand je cherchais ailleurs : *« regarde species en écran R »* ·
*« la loi du défilement ! »*.

| la bande | ce qu'elle porte | elle bouge ? |
|---|---|---|
| **ce qui reste, en haut** | la roue des sections · `Sort` · `Encumbrance` et ses trois parts · `edit sections` | ⛔ non |
| **le flux** | la grille de douze jetons — **une dalle par section**, et elles glissent **de côté** | 🔴 oui |
| **ce qui reste, en bas** | les deux `Tally` · le collecteur · la bourse · `Send to ▾` · `Gear` `Send` `Wares` | ⛔ non |

⭐ **LA LOI TIENT SANS AMENDEMENT SUR L'AUTRE AXE**, et c'est ce qui la confirme : elle ne parlait
pas de verticalité, elle parlait de **couches** — *le flux, et ce qui reste*. Tourner l'axe ne
change rien à ce qu'elle interdit.

⭐ **ET LE BLEED EST LA MARQUE DE LA COUPE** — Eric : *« line bleed de 8 au-dessus et en dessous »*.
Les deux bandes fixes **tranchent** la bande qui coule : sa rangée du haut et celle du bas saignent
de **8 blg**. ⛔ Une bande qui contiendrait exactement son contenu aurait l'air FINIE ; c'est la
coupe qui dit *« ça continue »*. C'est ce que font les cartes de Species, coupées par le bord de
l'écran — **un cadre coupe, un contenant tient**.

### ✅ UN CADRE TÉMOIN qui désigne une arête **se superpose à elle** *(Eric, 19/09)*
📍 `equipement-loupe-se-superpose-au-rebord` · vivante · 19/09
⚖️ **Un cadre qui dit « c'est celle-ci » se pose SUR le rebord de la boîte, il ne s'ajoute pas autour.**

Eric, 2026-09-19 : *« plutôt qu'entourer, le halo souligne précisément le rebord de la tuile
maîtresse ; l'actuel halo est moche »* · puis, devant le rendu : *« la loupe doit parfaitement se
superposer, donc **trait plus fin, forme identique, même taille que le bord de la tuile** »*.

📏 **Ce que la photo montrait, et c'est DEUX traits — pas un trop épais.** Une boîte porte déjà son
liseré, dessiné `inset` donc **à l'intérieur** de son bord ; un `outline` se pose **à l'extérieur**,
contre lui. Les deux ne se superposent pas, ils **s'additionnent** : une bande de 3 blg à deux
couleurs, claire dehors et sombre dedans. ⛔ C'est ça qui fait l'autocollant.

⛔ **Et une superposition n'est pas une ressemblance.** Si la boîte désignée est **agrandie** — la
tuile posée de la roue l'est de 1,2456 — son rayon PEINT et son liseré PEINT le sont aussi. Un trait
recopié tel quel rate les quatre coins. ⭐ La règle se **génère** donc là où l'agrandissement est une
cote : le cadre reprend le rayon et l'épaisseur **du rebord lui-même**, multipliés par le facteur.
Seule sa **couleur** change, et elle seule reste dans la feuille.

⛔ **Ceci ne touche pas `collecteur-lisere-entoure-ne-recouvre-pas`** *(26/08)* : ce liseré-là dit
l'**état** d'un jeton et doit rester dehors pour ne rien manger du contenu. Un cadre témoin, lui, ne
dit rien du contenu — il désigne une **arête**. Deux organes, deux questions.

⚠️ **Et la troisième exception ressemble aux deux autres** : le sac est un écran dont le contenu
**grandit avec le personnage**, comme le Seuil et le dressing. La loi du non-défilement (§5) n'est
pas entamée — elle vaut pour les pages de travail dont tout doit se lire d'un coup d'œil.

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
📍 `budget-seuil-n-est-plus-une-contrainte-dure` · vivante · 26/08
⚖️ **Le budget du Seuil (≈ 380 blg) borne le PREMIER ÉCRAN VU, plus l'écran entier.**

---

## 1 septies. 🎒 DEUX SURFACES QUI DÉFILENT ENSEMBLE — la plaque, le jour, et qui mène *(19–20/09)*

Le sac (`Équipement › B1`) a été le premier écran à faire défiler **deux rubans en même temps** : la
roue des sections et le ruban des plaques. Huit lois en sont sorties en une nuit ; ⛔ **sept
vivaient dans des commentaires de code** et n'étaient donc lisibles par personne — c'est ce que
répare cette section.

### ✅ UNE BANDE QUI DÉFILE EST UNE PLAQUE *(Eric, 19/09)*
📍 `cadre-bande-mobile-est-une-plaque` · vivante · 19/09
⚖️ **Une bande qui défile est une PLAQUE : elle porte la classe de matière de son rang, ⛔ jamais un cadre dessiné sur la fenêtre.**

Eric, 2026-09-19, devant l'écran : *« la dalle ne se détache pas »*, puis *« dalles identiquement
délimitées »*.

🔴 **CE QUI MANQUAIT TENAIT EN UN MOT : les dalles n'avaient pas de MATIÈRE.** Transparentes, rien
ne « part » et rien n'« arrive » — on voyait des jetons **se substituer**, jamais une plaque
**glisser**. Il demandait un objet qui traverse le champ ; on répondait par un **trait**.

⭐ **Et elle PORTE la classe, ⛔ elle n'en recopie pas les déclarations** — `dalle-simple` reste le
seul écrivain de la matière. Le cadre qu'on avait tracé disparaît avec : *ce qui délimite une
plaque, c'est la plaque*.

⛔ **Trois symptômes avaient été réparés avant la cause** : un cadre sur la fenêtre, puis un cadre
par dalle, puis un second voile. C'est Eric qui a nommé la cause — *« tu as superposé des plaques
sur les mobiles »*.

### ✅ UN SEUL VOILE PAR BANDE *(Eric, 19/09)*
📍 `cadre-un-seul-voile-par-bande` · vivante · 19/09
⚖️ **Un voile se pose UNE fois : une dalle qui porte des bandes ne porte plus le sien.**

Eric, 2026-09-19 : *« une transparence identique entre les dalles fixes et mobiles »*.

🔴 **ET ELLE NE L'ÉTAIT PAS** : `.sac` portait déjà `dalle-simple`, et un **second** venait d'être
posé sur la plaque mobile. **35 % sur 35 %** — la plaque était plus sombre que ses voisines, et
c'est exactement ce qu'il a vu.

⛔ **Un voile qui se superpose à lui-même n'est pas un réglage à corriger, c'est DEUX ÉCRIVAINS pour
une matière.** ⭐ La dalle du sac ne porte donc plus rien, et les trois bandes en portent une
chacune ; le jour entre elles montre le fond tout seul — plus besoin du masque qui perçait le voile,
il n'y a plus de voile à percer.

### ✅ LE JOUR EST À LA PLAQUE CE QUE LA GOUTTIÈRE EST À LA TUILE *(Eric, 19/09)*
📍 `budget-le-jour-est-a-la-plaque-ce-que-la-gouttiere-est-a-la-tuile` · vivante · 19/09
⚖️ **Le jour entre deux plaques se DÉDUIT du rapport de la tuile à sa gouttière, ⛔ il ne se choisit pas.**

```
jour / 375 = 8 / 57        ⇒  jour = 52,63
(375 + 52,63) / 65 = 375 / 57 = 6,5789
```

⭐ **Ce que la loi achète** : les deux rubans deviennent **la même image à deux échelles**. Un doigt
qui parcourt une tuile parcourt exactement une plaque, quelle que soit l'échelle à laquelle on
regarde. ⛔ Avec un jour choisi à la main, les deux rapports divergent et le suiveur « décale » —
visiblement, et de plus en plus loin du centre.

📏 **Vérifiée sur la page déployée, six plaques** *(dont une section qui en vaut deux)* :
`0 · 428 · 855 · 1283 · 1711 · 2138`. Le pas **alterne 428 / 427**, parce que 52,63 ne tombe pas
rond — et c'est l'argument décisif pour la loi du pas, ci-dessous.

⛔ **8 et 24 étaient des ESSAIS, pas des réglages.** Eric demandait une **loi** ; on proposait des
**valeurs**. ⚠️ Et le croquis portait **deux huit distincts** — la marge intérieure du cadre et la
gouttière de la grille : se ressembler ne les rend pas identiques, l'une dimensionne une *plaque*,
l'autre sépare des *jetons*.

### ✅ CELUI QUE LE DOIGT TOUCHE MÈNE *(Eric, 19/09)*
📍 `geste-celui-que-le-doigt-touche-mene` · vivante · 19/09
⚖️ **Quand deux surfaces défilent ensemble, celle que le doigt a TOUCHÉE mène et n'écrit que dans l'autre ; le `pointerdown` la désigne, et rien d'autre ne la change.**

Eric, 2026-09-19 : *« si on n'est pas en mode drag **le swipe fonctionne** »* — donc les **deux**
surfaces défilent au doigt.

🔴 **ET DEUX DÉFILEURS VERROUILLÉS L'UN À L'AUTRE OSCILLENT** : chacun lit l'autre et le corrige à
l'image suivante, indéfiniment. ⛔ Ce n'est pas une question de réglage, **c'est une boucle**.

⭐ **La parade ne se règle pas, elle se construit** : il n'y a jamais deux écrivains en même temps
**par construction**. ⛔ Et ce n'est pas un meneur *permanent* : une pente supposerait un ruban mené
par l'autre, ce qu'Eric a précisément refusé.

### ✅ LE SUIVEUR N'AIMANTE PAS *(mesuré le 19/09)*
📍 `geste-le-suiveur-n-aimante-pas` · vivante · 19/09
⚖️ **L'aimantation appartient au MENEUR et se coupe chez l'autre : un suiveur qui aimante refuse les positions intermédiaires et saute de cran en cran.**

📏 **Relevé à l'écran le 19/09**, roue immobilisée à mi-chemin (**97 = 65 × 1,5**) : les plaques
rendaient **383** là où la position demandée valait **563**. Une aimantation `mandatory` *refuse*
toute position intermédiaire — le navigateur la corrige à l'image suivante.

⛔ **ET LE BANC NE POUVAIT PAS LE VOIR** : tous les relevés tombaient sur des positions **déjà
alignées** (65 × 3, 375 × 3), là où l'aimantation ne corrige rien. ⭐ *Une mesure qui ne visite que
les crans ne dit rien de l'entre-deux* — c'est Eric qui l'a vu, à l'œil, après trois vérifications
vertes.

### ✅ LE PAS D'UNE PLAQUE SE LIT, DANS LES DEUX SENS *(19/09)*
📍 `geste-le-pas-d-une-plaque-se-lit` · vivante · 19/09
⚖️ **Le pas d'une plaque se LIT dans la mise en page (`offsetLeft`), dans les DEUX sens du lien — ⛔ une largeur n'est pas un pas.**

⛔ **Entre deux plaques il y a le jour** : le pas vaut `375 + 52,63`, pas 375.

📏 **Ce que la faute coûtait, mesuré** : le chemin inverse divisait par la **largeur** → **14 %** de
dérive à la deuxième plaque, **28 %** à la troisième, **42 %** à la quatrième ; au huitième cran
elle aurait désigné la plaque d'à côté. Eric l'a photographiée le 19/09 à 22:52 — une tuile arrêtée
**entre** deux crans, `Storage 1` à cheval sur `Storage 2`.

⭐ **ET LA FAUTE EST NÉE AVEC LE JOUR.** Tant qu'il valait 0, largeur et pas se confondaient et elle
dormait ; elle s'est réveillée à 8, a doublé à 24, et à 52,63 elle valait une demi-tuile. 🔴 C'est
la réponse exacte à *« le 24 crée un décalage, le 8 en crée moins »* : **le décalage ne venait pas
de la loi du jour**, qui est juste, mais d'une formule qui l'ignorait. On avait réglé une loi pour
compenser un bogue.

⭐ **Et c'est aussi pourquoi un pas ne se CALCULE pas** : un pas calculé dirait 427,63 partout et
dériverait d'un demi-blg par plaque ; un pas **lu** tombe sur le bord que le navigateur a vraiment
posé — 428 ici, 427 là. Aucune formule ne devine cet arrondi.

### ✅ UN ARBITRE SE LIT À L'ARRIVÉE *(19/09)*
📍 `socle-un-arbitre-se-lit-a-l-arrivee` · vivante · 19/09
⚖️ **Un minuteur choisit son exécutant au moment où il TIRE, jamais au moment où on l'arme.**

🔴 **LA CHAÎNE, ET ELLE EST LA TÊTE DE SÉRIE DU 19/09** : les plaques mènent → le suivi écrit
`r.scrollLeft` → cette écriture émet un `scroll` **sur la roue** → et l'écouteur de la roue réarme
le repos avec **son** handler. Le geste était **mené par les plaques et terminé par la roue** ; la
fin de geste des plaques ne tournait **jamais**.

⭐ **LA LEÇON EST PLUS LARGE QUE CE BOGUE** : *toute décision gelée à l'armement d'un minuteur est
une décision prise **avant les faits**.* Entre l'armement et le tir, le monde a le temps de changer
— et ici il changeait à cause de nous.

### ✅ UN RETOURNEMENT N'HÉRITE PAS DE SON ENTOURAGE *(vérifié deux fois, 19 et 20/09)*
📍 `socle-un-retournement-n-herite-pas-de-son-entourage` · vivante · 20/09
⚖️ **Un calcul retourné ou réemployé hérite de la FORMULE, ⛔ pas de ce qui l'entoure : ses gardes, sa pose et son arbitre se réécrivent.**

🔴 **PREMIER CAS, 19/09 — le verrou.** Écrit dans le sens roue → plaques, puis *retourné*. Trois
fautes en sont sorties, toutes filles de celle-ci : le **pas** divisé par une largeur, la **pose**
qui ne se faisait plus, l'**arbitre** figé à l'armement.

🔴 **SECOND CAS, 20/09 — la fiche d'un objet.** `renderB1` ferme par
`montrer(ficheEnCours.retour || "r")` : **il LIT son appelant**. La fiche X1, plus récente, ne l'a
pas hérité — elle nommait `"gear"` **en dur**, quatre fois, et les deux `surJeton` qui l'ouvrent
n'enregistraient pas l'origine. Eric : *« je visite un item et je le referme, je ne reviens pas au
point d'origine, je reviens dans gear, problématique »*.

⭐ **DEUX ORGANES, DEUX NUITS, LA MÊME FAUTE — c'est ce qui en fait une loi du socle** et pas une
anecdote du sac. ⛔ Le symptôme ne se voit jamais là où le calcul est juste : il se voit là où le
*contexte* d'origine manquait.

---

## 2. LES ORGANES — forme ET remplissage
📍 `jeton-forme` · vivante · 26/08
⚖️ **Un jeton est un rectangle très arrondi, et sa forme ne change jamais.**

> 🔴 **UN ORGANE SE RECONNAÎT À SA FORME, PAS À SA COULEUR.** C'est la loi qui gouverne toute
> cette section : la couleur peut changer *(elle porte l'état, §6)*, **la forme ne change jamais**.
> ⛔ Deux organes qui se ressemblent sont deux organes qu'on confondra.

### ⭕ LES RONDS DE PALIER — ni jeton ni bouton à libellé, et Eric les a validés
📍 `bouton-ronds-de-palier` · vivante · 07/09
⚖️ **Un palier se montre par TROIS ronds — vide · demi · plein entouré — cliquables, à cible tactile `--touch` 44 et dessin réduit — **30 blg** ; ⛔ ce n'est ni un jeton, ni un bouton à libellé.**

> **Eric**, 2026-09-07, devant le croquis : *« un demi, un plein, un plein entouré, c'est bien »* ·
> *« boutons ronds plus petits que dans la page originale, limite inf du tactile »* · *« rien de
> rempli = pas compétent »*.

⭐ **C'EST L'ANCRE QUI MANQUAIT, PAS LA DÉCISION.** L'organe existe depuis le 14/08
*(`skills-pas-de-bouton-zero` : l'absence de maîtrise est l'ABSENCE de remplissage)*, `CADRES §6`
le nomme en passant — *« une rangée de ronds de palier »* — et rien ne le décrivait. Un organe
qu'on nomme sans l'adresser est un organe que le premier lot venu redessinera à sa façon.

🔴 **CE QU'IL FAUT DIRE EN PREMIER, C'EST CE QU'IL N'EST PAS**, et deux règles s'appliqueraient
sinon par ressemblance :
* ⛔ **pas un jeton** — Eric l'a borné le jour même : *« on n'utilise pas des jetons dans le panneau
  skills »* *(`jeton-skills-ne-porte-aucun-jeton`)*. Donc ⛔ ni la cote 87 × 48, ni le rectangle très
  arrondi, ni *« un collecteur = un jeton en taille »*.
* ⛔ **pas un bouton à libellé** — il ne porte aucun mot, donc ⛔ pas l'octogone à coupe, qui est
  *« réservé aux gabarits à libellé »* *(`bouton-dans-la-rangee-mais-pas-de-son-habit`)*.

⭐ **ET IL SUIT LA SEULE LOI QUI VAUT POUR TOUT CONTRÔLE** : le **dessin** est le plus petit
possible, la **cible** vaut `--touch` 44 — exactement `bouton-dessin-plus-petit-possible-cible-au-minimum-tactile`
et la loi générale *« un contrôle ne se laisse jamais dimensionner par un dessin »*. C'est ce qui
autorise Eric à demander des ronds *« plus petits »* sans que rien ne cède : ce qui rétrécit est le
dessin, jamais la zone.

⚠️ **SA FAMILLE EST `bouton` PAR DÉFAUT, ET C'EST UNE TENSION QUE JE NOMME PLUTÔT QUE DE LA TAIRE.**
C'est un **contrôle**, donc la famille des contrôles ; mais toutes les autres règles de `bouton`
décrivent l'octogone à libellé. ⛔ L'amendement n° 1 interdit d'inventer une famille, donc je ne le
fais pas — ⏳ **si Eric veut une famille propre aux contrôles sans mot, c'est sa décision**, et elle
tient en un renommage d'adresse.

📌 **CE QUE PORTE LE ROND, ET CE QUE PORTE LA LIGNE** : la couleur du remplissage et le halo
appartiennent au ROND *(`skills-lie-est-un-halo-violet-captif`, ECRANS §7)* ; le geste du second tap
aussi *(`skills-second-tap-redescend`)*. La ligne, elle, ne porte plus rien depuis le 07/09 —
`renderFloorTiers`, qui allumait toujours le premier rond, **n'existe plus** *(vérifié sur
`origin/main`, `86eb2fc`)*.

### ⛔ SKILLS NE PORTE AUCUN JETON — et la famille jeton ne le gouverne donc pas
📍 `jeton-skills-ne-porte-aucun-jeton` · vivante · 07/09
⚖️ **Le panneau Skills ne porte AUCUN jeton — ils y sont trop volumineux — et les règles de la famille `jeton` ne le gouvernent donc pas.**

> **Eric**, 2026-09-07 : *« on n'utilise pas des jetons dans le panneau skills, trop volumineux, je
> maintiens le halo violet. **C'est mon choix de procéder de la sorte.** On n'utilise pas de tokens
> là, donc ta loi ne s'applique pas. »*

📏 **VÉRIFIÉ AVANT D'ÊTRE ÉCRIT** : `grep glisse-jeton` rend **0** dans `skills-step.mjs`, sur `main`
comme sur l'écran reconstruit. La règle ne demande rien de neuf au code — elle **nomme** ce qui est.

🔴 **CE QU'ELLE EMPÊCHE, ET C'EST TOUT SON INTÉRÊT.** Sans elle, un siège qui lit §2 applique à
Skills la cote **87 × 48**, *« un collecteur = un jeton en taille, ne varie jamais »*, *« trois
colonnes toujours »* — et **il aura l'air d'avoir raison**. ⛔ C'est la règle appliquée par
RESSEMBLANCE, que ce fichier condamne déjà *(`cadre-regle-par-ressemblance-nomme-sa-source`)* : une
famille dit de quoi une règle parle, ⛔ jamais sur quoi elle s'applique.

⭐ **ET ELLE TRANSFORME UNE COÏNCIDENCE EN CONSÉQUENCE.** Le 07/09, `skills-quatre-par-ligne`
*(ECRANS §7)* a été reclassée : elle gouverne les **collecteurs** (`listes.css`, `.choix-glisse`) et
non l'écran Skills, qui n'en porte aucun — on l'avait alors **constaté**. On sait maintenant
**pourquoi** : Skills ne porte aucun jeton, donc aucun collecteur, donc aucune règle de rangement de
collecteurs. ⛔ Les deux ne se lient pas par le régime *(une règle `déployée, hors corpus` ne peut
pas porter de borne)* — elles se citent ici, et c'est le seul endroit où ça se lit.
📌 Le corollaire de `socle-famille-ne-dit-pas-le-fichier` se complète donc : **un préfixe ne dit ni
le fichier qui porte la règle, ni l'écran qu'elle gouverne.**

📌 **ET LE HALO VIOLET NE BOUGE PAS.** `--lie` est un jeton CSS à part entière — vérifié :
`#765299` le jour, `#9e81bb` la nuit, *« même départ que `--tier-1`, libre d'en diverger »*. Une
couleur nommée n'est pas un organe : la borne d'Eric porte sur les **jetons**, pas sur les jetons
CSS. *(Voir juste ci-dessous : le mot en porte deux sens.)*

### Les quatre du glisser *(validé 26/08 sur maquette)*
📍 `jeton-quatre-glisser` · vivante · 26/08
⚖️ **Les quatre organes du glisser se distinguent par leur REMPLISSAGE : zone de drop creuse · jeton teinté · bouton plein et opaque · collecteur creux à vide, habit du jeton une fois rempli.**

| organe | forme | remplissage | voile |
|---|---|---|---|
| **zone de drop** | rectangle **très arrondi** | **creux** : texte d'attente + liseré, aucun fond | max, voire nulle |
| **jeton** | rectangle **très arrondi** | **teinté** *(doré)* | +20 % d'accent → **68 % cumulés** *(sur une dalle à 50)* |
| **bouton** | rectangle **peu arrondi** *(rayon 6)* — ~~octogone à coupe~~, retiré le 16/09 | **plein, en signal** | 🔴 **100 % — OPAQUE** |
| **collecteur** | comme le jeton | 🔴 **vide : creux, tireté · REMPLI : l'habit du jeton** *(voir §2 ter)* | — |

⭐ **ET CETTE RÈGLE A SURVÉCU AU RETRAIT DE L'OCTOGONE SANS QU'ON AIT À LA TOUCHER — c'est sa phrase
qui le dit.** Elle pose que les quatre organes se distinguent par leur **REMPLISSAGE**, pas par leur
forme : la colonne « forme » décrit, elle ne départage pas. Le bouton reste **opaque et plein**, le
jeton **teinté à 20 %** — l'écart qui les sépare n'a pas bougé d'un point.

🔴 **ET ÇA RÉVÈLE UNE CONTRADICTION QUI DORMAIT DEPUIS LE 26/08, dans ce fichier.** `bouton-octogone`
écrivait que la coupe *« interdit de le confondre avec un jeton, quelle que soit la couleur »* —
donc que la **forme** départage. §2 écrivait le contraire le même jour : le **remplissage**
départage. ⛔ **Les deux ne pouvaient pas être vraies ensemble**, et personne ne s'en est aperçu
tant que le bouton avait une forme à lui.
⭐ **Le retrait de l'octogone ne crée pas la tension : il la met au jour.** Une règle de secours
n'est jamais éprouvée tant que la règle principale tient — et c'est en la retirant qu'on découvre
qu'on en avait deux, ou aucune. *(Relevé le 16/09, en amendant `bouton-octogone`.)*

### 🔴 2 ter — LE COLLECTEUR : LE FOND DIT CE QU'IL PORTE, LE LISERÉ DIT SON ÉTAT
📍 `collecteur-relief-remplace-le-creux` · vivante · 26/08
⚖️ **Le relief REMPLACE le creux, il ne s'y ajoute pas.**

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
📍 `collecteur-tout-pose-choix-est-fini-jamais-toutes-cases-remplies` · vivante · 02/09
⚖️ **« Tout posé » se lit `answered === expected` — le choix est FINI — ⛔ jamais « toutes les cases sont remplies ».**

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
📍 `collecteur-deux-canaux` · vivante · 26/08
⚖️ **Le REMPLISSAGE dit ce que le collecteur porte, le LISERÉ dit son état.**
📍 `collecteur-drop-it-here` · vivante · 26/08
⚖️ **Un collecteur vide affiche « drop it here » en T1 minuscules, italique, à la couleur du libellé — et le mot s'efface au remplissage.**
📍 `collecteur-equipement-44` · vivante · 26/08
⚖️ **Le collecteur de l'Équipement garde une hauteur de 44, pas 48.**
📍 `collecteur-lisere-2px` · vivante · 26/08
⚖️ **Le liseré rempli vaut 2 px, et 2 px est un JETON, pas un littéral.**
📍 `collecteur-lisere-entoure-ne-recouvre-pas` · vivante · 26/08
⚖️ **Le liseré entoure le jeton, il ne le recouvre pas.**
📍 `collecteur-lisere-etats` · vivante · 26/08
⚖️ **Le liseré porte les codes couleur : bleu = pose valide, rouge = mauvaise pose, vert = tout posé.**
📍 `collecteur-rempli-prend-l-habit-du-jeton` · vivante · 26/08
⚖️ **Rempli, un collecteur prend le doré ET le relief du jeton.**
📍 `collecteur-vide-est-creux-et-sans-lisere` · vivante · 26/08
⚖️ **Un collecteur vide est creux, sans aucun liseré visible.**
📍 `ecriture-italique-dit-pas-une-donnee` · vivante · 26/08
⚖️ **L'italique dit « je ne suis pas une donnée » : c'est l'habit d'une proposition et d'un mot d'attente.**

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

### 🕓 UN RÉGLAGE MONTRÉ ET NON CÂBLÉ SE LIT COMME TEL
📍 `interrupteur-montre-et-non-cable-se-lit-comme-tel` · vivante · 26/08
⚖️ **Un réglage qu'on montre sans l'avoir câblé se dit lui-même — « bientôt » — et un bon défaut se montre sans se demander, prévalidé.**

> **Eric**, 2026-08-26 *(`FHPCv2 hebergement donnees`)*.

⭐ **LES DEUX MOITIÉS SE TIENNENT, ET C'EST CE QUI LES REND UTILES ENSEMBLE.** Montrer ce qui n'existe
pas encore **rassure** — à condition que l'écran le dise ; le taire fabrique un contrôle mort, et
*un contrôle qui ne répond pas passe pour cassé* *(§7.11)*. Symétriquement, un défaut qu'on juge bon
se **pose**, il ne se **demande** pas : une question dont la réponse est connue coûte un geste pour
rien.
📌 **C'est la parente de `cadre-f2-place-reservee`** *(« aucun utilisateur, rien ne l'implémente :
c'est une place réservée »)* — celle-là décrit une place vide dans le CORPUS, celle-ci une place
vide **à l'écran, sous les yeux du joueur**. ⛔ Deux objets, deux règles.

### 🔴 LES AUTRES ORGANES — le registre complet *(Eric, 26/08 : « rajoute le voyant et le on/off »)*
📍 `bouton-octogone` · vivante · 26/08 · **corps réécrit 16/09 — l'octogone est retiré**
⚖️ **Un bouton à libellé est un RECTANGLE à angles arrondis — rayon 6, face sombre unique, liseré de rôle à 2 du bord.**

> Eric, 2026-09-16, devant le rendu en ligne : *« ultra moche et hors sujet »*, *« bouton beaucoup
> trop épais »*, *« le relief est beaucoup trop marqué »*. Puis, devant six essais posés sur les
> deux fonds réels : *« leger liseré à 2 est celui qui me convient le mieux on garde celui-ci. donc
> tous les boutons standards passent à ce format »*.

⛔ **L'OCTOGONE A VÉCU DU 26/08 AU 16/09, ET SON NOM RESTE SUR CETTE ANCRE.** On ne renomme pas un
identifiant sous un lien : `bouton-octogone` est devenu un **faux nom**, et c'est assumé — le
renommage est une décision d'Eric, signalée, pas prise ici.

🔴 **ET LA PHRASE D'AVANT DISAIT PLUS QUE LA FORME** : *« la coupe d'angle lui appartient **seul** »* —
c'est-à-dire qu'**un seul trait, catégorique**, séparait le bouton du jeton. Ce trait a disparu.

### ✅ CE QUI SÉPARE UN BOUTON D'UN JETON — tranché par Eric le 17/09
📍 `bouton-trois-traits-le-separent-du-jeton` · vivante · 17/09
⚖️ **Trois traits séparent le bouton du jeton — l'OPACITÉ, la FORME et la COULEUR — et aucun ne suffit seul.**

> Eric, 2026-09-17 : *« visuellement l'opacité, la forme et la couleur font la différence. y'a pas
> de doute de mon point de vue. »*

| | bouton | jeton |
|---|---|---|
| **opacité** | **opaque** — `--bouton-face` `#3d3424` | **translucide**, teinté à 20 % d'accent |
| **forme** | rayon **6** | `--organe-rayon` **16** |
| **couleur** | encre **claire fixe** sur corps sombre | encre **sombre** sur teinte dorée |
| *(cote)* | petit **77 × 40** | **87 × 48** |

🔴 **CE QUI A CHANGÉ N'EST PAS LA VALEUR, C'EST LA NATURE DE LA DISTINCTION.** Avant : **un trait
unique et catégorique** — un objet a une coupe d'angle ou il n'en a pas. Depuis le 17/09 : **un
faisceau de trois**, et chacun n'est qu'une différence de **degré**.
⛔ **ET LA FORME N'A PAS CESSÉ DE DISTINGUER** — c'est une correction d'Eric à la façon dont la
question lui a été posée. On lui a présenté *« ils ont désormais la même forme »* : **c'était trop
fort.** Un rectangle à rayon 16 et un à rayon 6 ne sont pas la même forme à l'œil ; ce qui a disparu
est **la coupe**, pas la distinction de forme.
⚠️ **UNE DISTINCTION DE DEGRÉ SE PERD QUAND ON « HARMONISE »** : quiconque rapprocherait les deux
rayons au nom de la cohérence retirerait un des trois traits sans s'en apercevoir. ⛔ Le rayon 6 du
bouton et le 16 du jeton ne sont pas deux valeurs d'un même réglage : ils sont **ce qui les
sépare**.

📌 **ET §2 DISAIT DÉJÀ UNE PART DE CETTE RÉPONSE, DEPUIS LE 26/08** — que les quatre organes du
glisser se distinguent par leur **REMPLISSAGE**. ⛔ Elle contredisait alors `bouton-octogone`, qui
attribuait la distinction à la forme seule ; personne ne l'a vu tant que le bouton avait une forme à
lui. ⭐ La réponse d'Eric **absorbe les deux** : l'opacité et la couleur sont du remplissage, la
forme reste un trait — mais aucun des trois ne porte seul ce que la coupe portait.
📍 `interrupteur-deux-especes` · vivante · 26/08
⚖️ **Il y a deux espèces d'interrupteur : le sélecteur exclusif et la bascule simple.**
📍 `popup-parle-on-ne-l-appuie-pas` · vivante · 26/08
⚖️ **Un popup parle, on ne l'appuie pas.**
📍 `voyant-non-cliquable` · vivante · 26/08
⚖️ **Le voyant ne se touche pas : ne pas lui donner l'apparence d'un contrôle.**

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

### 🔴 LES QUATRE PANS COUPÉS PORTENT L'ARÊTE — rouvert et tranché 02/09, **sans objet depuis le 16/09**
📍 `bouton-pans-coupes-nus` · dépréciée · 26/08
⚖️ ~~**Les quatre pans coupés ne portent pas d'arête, et c'est voulu.**~~ **Le bouton n'a plus de pans coupés : cette règle est sans objet depuis le 16/09.**

⛔ **DÉPRÉCIÉE, PAS REMPLACÉE — et j'ai d'abord voulu inventer un troisième mot.** J'avais posé le
statut *« sans objet »* : le garde des adresses l'a refusé, et il a raison — *« un statut inventé
est une règle dont personne ne sait si elle oblige »*. Le jeu est fermé à six.
⭐ **Mais la nuance que je cherchais est vraie, alors je l'écris dans le CORPS, là où elle ne casse
aucun contrat** : une règle *remplacée* cède la place à une autre qui dit mieux la même chose ;
celle-ci décrit une **partie du dessin qui n'existe plus**, et rien ne lui succède. Un rectangle
arrondi n'a pas de pan coupé, donc pas de question d'arête sur ce pan. ⭐ Elle reste lisible pour
qui lit l'histoire du bouton, et elle n'oriente plus personne.

📌 **CE QUI EN SURVIT, ET QUI VALAIT PLUS QUE SON OBJET** : *« le médium change, pas la forme »*. Le
dessin du 16/09 le démontre à l'envers — le médium ET la forme ont changé, et ce qui n'a pas bougé
est ailleurs : la **cible 44**, le **dessin 40**, les **deux cotes 77 et 105**, et le fait que la
couleur de rôle vive à **un seul endroit**.
📍 `collecteur-zone-de-drop` · vivante · 26/08
⚖️ **Une zone de drop est un rectangle très arrondi, creux, dont le liseré porte la couleur du corps du jeton attendu.**

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
repeint la face bombée. Le ruban visible entre les deux suit mécaniquement les huit côtés. ~~La coupe
extérieure reste `--bouton-coupe` **10**~~, les cotes et l'opacité ne bougent pas.

🔴 **LA COUPE EST À 8 DEPUIS LE 16/09, ET LE REBORD À 2** *(lot 209)* — la valeur **10** était
**antérieure au dessin**. Le bouton à relief qu'Eric a regardé et approuvé est construit sur une
coupe de **8** et un rebord de **2** : les deux cotes viennent du même dessin, et en garder une sans
l'autre reviendrait à décider à la place du dessinateur sur un équilibre qu'il a réglé à l'œil.
⚖️ **Décidé par la session `documents-08` sous délégation explicite d'Eric** — *« prends la décision
pour moi ça me saoule »*, 16/09. ⛔ **Ce n'est donc pas une décision d'Eric**, et c'est écrit ainsi
exprès : il a approuvé **le dessin**, pas ce nombre. Le bouton hybride *(coin 10 + rebord 2)* n'a
jamais été validé par personne — c'était un objet fabriqué pour poser une question.
📏 **Mesuré avant et après le changement**, sur le builder servi, échelle 1,3653 : les huit boutons
du pied rendent **77 × 44 blg** à coupe 10 **et** à coupe 8. ⭐ **Aucune cote ne bouge — seule la
forme change**, ce qui est exactement ce que §6 exige de ce chapitre.
⚠️ **Et la cote du coin n'est pas celle du bord** : à un retrait parallèle `i`, le sommet d'une
diagonale se décale de `i × (√2 − 1)`, jamais de `i`. C'est ce qui garde l'épaisseur **constante**
dans les pans coupés. ⛔ Mesurer cette épaisseur **entre deux sommets** donne **1,5153** et ne veut
rien dire : elle se mesure **perpendiculairement au bord**, et vaut alors **1,4** — comme sur un bord
droit. Deux nombres voisins qui ne mesurent pas la même grandeur.

🔴 **Le liseré d'une zone de drop porte la couleur du corps du jeton attendu** — la cible annonce
ce qu'elle accepte avant qu'on lâche.

### Combien de modèles *(26/08)*
📍 `jeton-combien-modeles` · vivante · 26/08
⚖️ **Un seul modèle de jeton, un seul de collecteur, trois couleurs de bouton : la variété vit dans les BOUTONS.**

**bouton = 3 couleurs · jeton = UN SEUL modèle · collecteur = UN SEUL modèle.**
⭐ La variété vit dans les **boutons**, pas dans les jetons.

---

## 2 bis. ✅ LE JETON AUJOURD'HUI : LA COULEUR DE BASE ET LE RELIEF — RIEN D'AUTRE
📍 `jeton-standard-d-abreviations` · à trancher · 26/08
⚖️ **Le vocabulaire des abrégés n'existe pas — le seuil est tranché, pas le vocabulaire.**

> Eric, 2026-08-26, sur les variantes, l'échelle de valeur du liseré et ce que porte le fond :
> **« on ne fait rien pour le moment, juste la couleur de base et le relief »**.

### 🔴 ⛔ IL N'Y A PAS DE VARIANTES DE JETON — tranché 26/08
📍 `jeton-habit` · vivante · 26/08
⚖️ **Un jeton porte la couleur de base (le doré) et le relief — rien d'autre.**
📍 `jeton-modele-unique` · vivante · 26/08
⚖️ **Il n'y a pas de variantes de jeton — une seule exception, les jetons craft.**
📍 `jeton-forme-du-craft` · à trancher · 26/08
⚖️ **La forme du jeton CRAFT, seule exception admise, n'est pas décrite.**

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
📍 `jeton-corps-t1` · vivante · 26/08
⚖️ **Le libellé d'un jeton est en T1.**
📍 `jeton-specificite-du-corps` · vivante · 26/08
⚖️ **La règle nue ne dit pas le corps rendu : `.choix-glisse .glisse-jeton` (0,0,2,0) bat `.glisse-jeton` (0,0,1,0).**

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
📍 `jeton-case-de-grille-est-un-jeton` · vivante · 26/08
⚖️ **La case du tambour d'Équipement (`.grille-jeton`) est un jeton, et porte T1.**
📍 `jeton-case-de-grille-habit-non-tranche` · à trancher · 26/08
⚖️ **L'habit de la case de grille reste différent de celui du jeton, et ce n'est pas tranché.**

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
📍 `jeton-bonus-token` · vivante · 26/08
⚖️ **Un bonus token est un jeton ordinaire dont le libellé est un nombre.**
📍 `jeton-cote` · vivante · 26/08 · bornée par `jeton-cote-vive-et-pixel-peint`
⚖️ **Un jeton mesure 87 × 48 blg.**
📍 `jeton-deux-lecteurs-un-jeton-de-mesure` · vivante · 26/08
⚖️ **Le jeton et son collecteur lisent le MÊME jeton de mesure, jamais deux nombres égaux.**

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

### 🔵 87 EST UN PLAFOND — la cote qu'une case REND, et le piège du pixel peint
📍 `jeton-cote-vive-et-pixel-peint` · vivante · 13/09 · borne `jeton-cote`
⚖️ **`--glisse-case` (87) est le PLAFOND d'une case, pas sa taille : ce qu'elle rend ici s'appelle `--case-vive`, et tout organe monté hors du bloc lit celle-là.**
⚖️ **Une cote se dit en blg. Un nombre relevé à l'écran est un pixel PEINT — les deux ne coïncident qu'au cran 1, et les confondre écrit une cote fausse dans le socle.**

> **La question posée à Eric**, 2026-09-13 : *« Sur “Ability boosts”, le jeton +1 fait 67 px de large,
> mais la maison déclare 87 (ta cote du 19/08) — c'est la case qui ne l'honore plus, et le fantôme dit 87. »*
> **Sa réponse** : *« La cote descend à 67 »* — on acte la taille réellement peinte ; les rangées
> gardent leur densité, et le fantôme rétrécit pour correspondre.

📏 **CE QUE LE BANC A MESURÉ LE 13/09** *(512 × 900, Chromium avec WebGL, les DEUX piles, verdict identique)* :

| ce qu'on regarde | valeur |
| --- | --- |
| `zoom` sur `.app` | **1,36533** *(512 ÷ 375, la largeur sacrée)* |
| la case, en blg | `flex-basis: 49,1667px` |
| le jeton `+1`, **peint** | **67,13 × 65,53** ← le « 67 px » de la question |
| le fantôme, **peint** | **118,78 × 65,53** *(87 blg × 1,36533)* |
| écart fantôme ↔ jeton, avant / après | **51,65 px** / **−0,01 px** |

⛔ **67 EST DONC UNE COTE PEINTE, PAS UNE COTE** : `49,1667 × 1,36533 = 67,13`. Écrire
`--glisse-case: 67px` poserait 67 **blg** — le fantôme peindrait 91,5 contre 67,1 *(24 px d'écart)*, et
toutes les rangées encore au plafond *(les sorts, les skills, les trois boutons de `Roll Options`)*
rétréciraient au passage, ce qu'Eric ne demande pas. **La cote qui descend est celle que l'organe
DÉCLARE, et elle n'a pas de nombre.** Le plafond reste 87.

⭐ **LA FORME QUI TIENT** : chaque régime de rangement déclare, **dans la même règle que sa formule**,
`--case-vive: var(--sa-formule)` ; le socle en pose le repli `var(--glisse-case)`. Deux déclarations
collées ne peuvent pas diverger — deux déclarations éloignées, si *(cette cote s'est écrite quatre
fois de suite, et chaque fois un organe est resté en arrière)*. Un organe monté hors du bloc se monte
**dans** le bloc pour hériter la cote, ⛔ jamais en s'écrivant une taille en style en ligne.

---

### 🔒 LA CATÉGORIE DES SACRÉS — neuf lois, et elles ne se négocient dans aucun lot
📍 `socle-categorie-sacres` · vivante · 04/09
⚖️ **Un sacré ne cède pas quand un écran déborde : un lot qui ne fait pas tenir un écran retire du contenu ou descend tout le bloc d'un cran, ⛔ il ne rogne jamais un sacré.**

> Eric, 2026-09-04 : *« Donc **ranger dans la catégorie des sacrés** si ce n'est pas le cas. »*

⭐ **UN SACRÉ N'EST PAS UNE NORME FORTE, C'EST UNE LOI QUI NE CÈDE PAS QUAND UN
ÉCRAN DÉBORDE.** C'est ce qui le distingue du reste du fichier : *« une norme est
un DÉFAUT, pas un mur »* (26/08) — un sacré, si. ⛔ Un lot qui n'arrive pas à
faire tenir un écran **retire du contenu** (§1 quater) ou **descend tout le bloc
d'un cran** (§1 ter quinquies) ; il ne rogne pas un sacré.

📌 **LA TABLE EST LA LISTE ENTIÈRE, ET C'EST SA RAISON D'ÊTRE** — *« un sacré qu'il faut
chercher n'est pas un sacré »* (`socle-tout-agent-connait-les-sacres`). ⛔ Elle en annonçait
**trois** le 04/09 et il y en avait **neuf** au soir du 06/09 : une liste qu'on ne tient pas
est pire qu'aucune liste, parce qu'un agent qui l'a lue croit les connaître tous.

| # | la loi | son adresse | depuis |
|---|---|---|---|
| 1 | quand un écran déborde, ce sont les **VIDES** qui cèdent, jamais les organes | `budget-les-vides-cedent` | 26/08 |
| 2 | **les jetons et les boutons** — leur cote et leur corps ne cèdent jamais | `jeton-sacre` | 26/08 |
| 3 | le duo **`?` + livre** — une fois par écran, dans la dernière rangée, en bas | `livre-sacre-n-2-duo-livre-vit-dans-derniere-rangee` | **04/09** |
| 4 | **tout est dans une boîte, les boîtes sont sur une grille**, ≥ 8 blg | `socle-sacre-n-3-tout-est-dans-boite-boites-sont-sur-grille` | **04/09** |
| 5 | le **format d'écriture** d'une règle : une adresse, une phrase, l'incident | `socle-format-d-ecriture-est-sacre` | **06/09** |
| 6 | tout agent a en mémoire **TOUS les sacrés** avant d'écrire une ligne | `socle-tout-agent-connait-les-sacres` | **06/09** |
| 7 | un agent qui va **coder lit la Bible d'abord** | `socle-bible-lue-avant-de-coder` | **06/09** |
| 8 | **franchir la frontière** builder ↔ FH WEB oblige à lire l'autre Bible | `socle-franchir-la-frontiere-oblige-a-lire-l-autre-bible` | **06/09** |
| 9 | deux sacrés qui se **contredisent** se refondent ou fusionnent | `socle-deux-sacres-contradictoires-se-fusionnent` | **06/09** |

⚠️ **CETTE TABLE SE TIENT DANS LE MÊME GESTE QUE LE SACRÉ QU'ELLE AJOUTE.** Un neuvième
sacré posé sans sa ligne ici serait un sacré qu'il faut chercher — ⛔ c'est-à-dire pas un
sacré du tout.

---

### 🔒 SACRÉ N° 2 — **LE DUO EST DANS LA DERNIÈRE RANGÉE, UNE FOIS PAR ÉCRAN** *(04/09)*
📍 `socle-sacre-n-2-duo-est-dans-derniere-rangee-fois-par-ecran` · remplacée · 04/09 · remplacée par `livre-sacre-n-2-duo-livre-vit-dans-derniere-rangee`
⚖️ **Le duo `?` + livre paraît UNE FOIS PAR ÉCRAN, dans la dernière rangée, cadré à gauche et à droite d'une cellule qui porte au moins un bouton, à 8 blg du bord bas de la dalle.**

> 🗄️ **ARCHIVÉE LE 2026-09-06 — CE N'EST PAS UN DÉSAVEU, C'EST UNE FUSION.** Le SACRÉ n° 2
> était écrit **deux fois** dans ce fichier : ici, d'après le rapport du 04/09, et plus bas
> d'après la **dictée mot pour mot d'Eric du 05/09**, qui se déclare elle-même *« la version
> qui fait foi »* et qui **corrige** ce texte-ci sur deux points — « 8 blg du **bord** » au
> lieu du **bas**, et *« toujours en bas »* omis. ⛔ Deux sacrés qui disent la même loi de
> deux façons, c'est **zéro sacré** *(`socle-deux-sacres-contradictoires-se-fusionnent`)* :
> l'un des deux survit, l'autre s'archive, et les deux se citent.
> ⭐ **CE QUE CE TEXTE-CI A VERSÉ AU SURVIVANT AVANT DE S'ARCHIVER, et il fallait le porter
> à la main** : *« une fois par ÉCRAN »* et *« une cellule qui porte au moins un bouton »* —
> deux clauses que la dictée du 05/09 ne redit pas, et qu'une fusion paresseuse aurait
> perdues en silence. ⚠️ *Archiver un doublon, c'est d'abord chercher ce qu'il est le seul
> à dire.*
> 📌 **ET LA SOUS-SECTION CI-DESSOUS RESTE VIVANTE** : `socle-point-ouvert-et-il-est-mesure`
> n'est pas archivée avec sa parente — une règle vivante sous une section archivée se lit
> à son adresse, pas à sa place dans le fichier.

> *« Une seule fois **par écran**. **Pas par dalle**. »*
> *« Le duo est toujours dans une **cellule contenant au moins un bouton**, à
> **8 blg du bord de la dernière dalle** ; ils sont **cadrés à g et à d**. »*
> *« **Dernière dalle** ou **dalle flottante fixe du bas**. »*

| ce que la loi fixe | et ce que ça interdit |
|---|---|
| **une fois par ÉCRAN** | ⛔ une pastille par dalle, par fiche, par bloc |
| la cellule porte **au moins un bouton** | ⛔ une rangée de bornes toute seule : le duo encadre des gestes, il n'en est pas un |
| **8 blg** du bord bas de la dalle | ⛔ collé au bord — c'est déjà la cote de §6 pré, redite |
| **cadrés à gauche et à droite** | ⛔ dans le groupe des majeurs : ils ne participent pas au centrage |
| **la dernière dalle**, ou **la dalle flottante fixe du bas** si l'écran en a une | ⛔ n'importe quelle rangée « trouvée » — voir l'absolu du même jour, plus bas |

📏 **CE QUI EST CONFORME AUJOURD'HUI, mesuré le 04/09** : les huit étapes rendent
le duo à **8 blg** du bord bas de sa dalle. ⚖️ *Skills rendait **0** — sa dalle
fixe du bas n'avait jamais reçu la gouttière que §6 pré cote pourtant ; corrigé
le jour même.* **Équipement n'a aucune rangée** depuis le virage B3 du 23/08 :
sa pastille reste posée en `absolute`, ce que §6 pré autorise sur une dalle SANS
rangée.

⭐ **ET « DALLE FLOTTANTE FIXE DU BAS » DÉSIGNE UN MOTIF QUI EXISTE DÉJÀ** :
`skills-pied`, une `dalle-intermediaire` hors du flux qui défile. C'est le seul
écran du dépôt qui en porte une.

#### ⏳ LE POINT OUVERT, ET IL EST MESURÉ — *« une fois par écran »* CONTRE LE CATALOGUE À RAIL
📍 `socle-point-ouvert-et-il-est-mesure` · vivante · 03/09
⚖️ **Un écran qui DÉFILE porte son duo sur une dalle flottante fixe du bas, ⛔ jamais sur sa dernière dalle — sinon il est hors de vue pour toutes les fiches sauf la dernière.**

⚠️ **DEUX PHRASES D'ERIC SE CROISENT ICI, ET IL FAUT LE DIRE PLUTÔT QUE DE
CHOISIR À SA PLACE.**

| | |
|---|---|
| **03/09** | en voyant **une** pastille pour vingt-deux fiches : *« il y a toujours `?` et livre »* ➡️ une par fiche, parce qu'un rail n'en montre **qu'une à la fois** |
| **04/09** | *« une seule fois par écran, pas par dalle »* |

📏 **LA MESURE QUI ARBITRE, prise sur Species en mode catalogue** : 12 fiches,
contenu de **6 500 blg** dans une fenêtre de 500. Une pastille unique posée sur
la **dernière dalle** serait à **y = 6 462** — *treize écrans plus bas*, donc
absente pour onze fiches sur douze. ⛔ **C'est exactement le défaut que la règle
du 03/09 a été écrite pour retirer.**

⭐ **LES DEUX PHRASES SE RÉCONCILIENT PAR LA SECONDE BRANCHE DE LA LOI, ET PAR
ELLE SEULE** : *« ou dalle flottante fixe du bas »*. Un écran qui **défile** ne
peut pas porter son duo sur sa dernière dalle — il lui faut la dalle fixe, celle
de Skills. ➡️ **Décision d'Eric, pas d'un lot** : elle coûte ~60 blg de hauteur
de fiche (44 de rangée + 2 × 8) sur Species, Class et Destiny.

---

### 🔒 SACRÉ N° 3 — **TOUT EST DANS UNE BOÎTE, LES BOÎTES SONT SUR UNE GRILLE** *(04/09)*
📍 `socle-sacre-n-3-tout-est-dans-boite-boites-sont-sur-grille` · vivante · 04/09 · remplace `cadre-sacre-n-3-tout-est-dans-boite-boites-sont-sur-grille`
⚖️ 🔒 **Tout ce qui vit sur une dalle est dans une BOÎTE, les boîtes sont sur une GRILLE — les boutons compris — et elles sont à ≥ 8 blg de leurs voisines, écart que la grille écrit seule.**

> 🔀 **FUSION DU 2026-09-06.** Le SACRÉ n° 3 était écrit **deux fois** ; cette phrase porte
> maintenant ce que la seconde écriture disait en propre — *« les boutons compris »* et
> *« c'est la grille qui écrit l'écart, jamais une marge posée organe par organe »*.
> Le doublon est archivé sous `cadre-sacre-n-3-tout-est-dans-boite-boites-sont-sur-grille`.
> ⚠️ **Ce qui vivait avec lui et n'était PAS une redite** — le bornage d'Eric du 05/09,
> *« on laisse tout tranquille tant que ça marche »* — n'a pas été archivé avec le doublon :
> il a reçu sa propre adresse, `socle-on-laisse-tranquille-ce-qui-marche`.
> ⛔ *Archiver un doublon sans regarder ce qu'il porte de neuf périme une règle vivante
> par effet de bord.*

> *« Désormais tout ce qu'il y a sur une dalle est dans une boîte, qui est sur
> une grille, espacée d'**au moins 8 blg** avec ses voisines. »* · *« Absolu aussi. »*

⭐ **TROIS EXIGENCES, ET LA TROISIÈME EST LA PLUS DURE À TENIR** : être une
**boîte** *(rien ne flotte à côté)* · vivre sur une **grille** *(le rangement est
déclaré, jamais découvert à l'exécution)* · être à **≥ 8 blg** de ses voisines.

🔴 **ET LA GRILLE DEVIENT LE SEUL ÉCRIVAIN DE L'ÉCART.** Une marge d'enfant
s'**ajoute** au `gap` : mesuré sur R Abilities le jour même, deux intervalles
rendaient **16 blg** au lieu de 8 et la dalle **204** au lieu de 188. ⛔ Le remède
n'est pas un `.dalle > *` — il pèse `(0,1,0)`, autant que l'organe qu'il vise,
donc c'est **l'ordre du fichier** qui trancherait. L'exception se **nomme**.

📏 **L'ÉTAT DU DÉPÔT LE 04/09, mesuré dalle par dalle sur les huit étapes.**
⛔ **Une seule dalle est conforme** — celle de **R Abilities**, refaite ce jour :

| dalle | ce qui manque |
|---|---|
| `concept-step` *(Identity)* · `skills-tete` · `skills-group` | `display: block` — aucune grille |
| `parcours-guide` *(Species · Inheritance · Class)* | `flex`, et **deux écarts à 0** |
| `card-final` *(Destiny)* | `flex`, **un écart à 0** |
| `dressing` *(Équipement)* | `flex`, **un écart à 0** |
| `ability-organe` · `choix-glisse` *(pages de méthode)* | `flex` |

⏳ **CE N'EST DONC PAS UN LOT, C'EST UN CHANTIER — et il touche un budget que
plusieurs écrans ont déjà payé cher.** Passer un écart de 0 à 8 sur `card-final`
pousse la pire carte d'arcane (**498 blg** mesurés) au-delà des **500** que le
panneau offre ; Identity a demandé 483 des 500 disponibles. ⛔ **Chaque dalle
convertie doit être remesurée**, et l'ordre de conversion est une décision
d'Eric — pas la conséquence d'avoir écrit la loi.

---

### 🔒 LES JETONS ET LES BOUTONS SONT **SACRÉS** — 26/08
📍 `budget-les-vides-cedent` · vivante · 26/08
⚖️ 🔒 **Quand un écran déborde, ce sont les VIDES qui cèdent, jamais les ORGANES.**
📍 `jeton-sacre` · vivante · 26/08
⚖️ 🔒 **Les jetons et les boutons sont SACRÉS : leur cote et leur corps ne cèdent jamais.**

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

### 🔒 SACRÉ n° 2 — **LE DUO `?` + LIVRE VIT DANS LA DERNIÈRE RANGÉE** *(Eric, 2026-09-04)*
📍 `livre-sacre-n-2-duo-livre-vit-dans-derniere-rangee` · vivante · 04/09 · remplace `socle-sacre-n-2-duo-est-dans-derniere-rangee-fois-par-ecran`
⚖️ 🔒 **La dernière rangée est TOUJOURS EN BAS de la dalle, ses boutons majeurs cadrés au centre en un seul groupe, et le duo `?` + livre — UNE FOIS PAR ÉCRAN — cadré à gauche et à droite dans une cellule qui porte au moins un bouton, à 8 blg du bas.**

> 🔀 **FUSION DU 2026-09-06.** Cette phrase porte désormais les DEUX écritures du sacré :
> la dictée d'Eric du 05/09 *(la rangée en bas, le groupe centré, 8 blg du **bas**)* et les
> deux clauses que seul le tirage du 04/09 disait — *« une fois par écran »* et *« une
> cellule qui porte au moins un bouton »*. Le tirage est archivé sous
> `socle-sacre-n-2-duo-est-dans-derniere-rangee-fois-par-ecran`, il n'est pas effacé.

> ⚠️ **CONSIGNÉE ICI PAR L'ARCHITECTE LE 2026-09-05, ET IL FAUT SAVOIR D'OÙ ELLE VIENT.**
> Eric l'a ratifiée le 04/09 devant une session distante, qui l'a écrite **dans son
> conteneur** — un travail que personne n'a poussé et que ce dépôt n'a jamais vu.
> Mesuré le 05/09 : **zéro occurrence** de ces lois dans `NORMES.md`.
> ⭐ *Une règle qui ne vit que dans le conteneur qui l'a écrite n'existe pas* — c'est la
> loi « une règle restée ORALE n'existe pas » appliquée à une session au lieu d'une
> conversation. Le texte ci-dessous est donc **la règle**, pas un compte rendu.
>
> ✅ **ET LE CODE EST REVENU LE 2026-09-05 — cette note ne dit plus « à refaire ».**
> La session distante a transmis ses **quatre commits** par le Drop, en `format-patch`.
> Ils se sont appliqués **sans un seul conflit sur leur base exacte** (v528), parce que
> les blobs de cette base vivaient encore dans le dépôt. ⭐ *Un travail qu'on croit perdu
> parce qu'il n'est pas sur une branche peut n'être qu'ailleurs* — la question à poser
> n'était pas « que faut-il refaire », mais « le conteneur peut-il encore parler ».
> ⛔ Et ce que la récupération NE change pas : la loi qui ouvre cette note reste vraie.
> Une règle qui ne vit que dans le conteneur qui l'a écrite n'existe pas — c'est bien
> parce qu'elle avait été recopiée ICI qu'elle a survécu à la nuit où le code, lui,
> ne tenait qu'à un fil.

> ⭐ **DICTÉE MOT POUR MOT PAR ERIC LE 2026-09-05**, et c'est cette version qui fait foi :
> *« les boutons tj en bas, toujours bouton(s) cadré centre, duo ? et livre cadrés à d et
> a g dans une cellule à 8 blg du bas de la dalle »*.
> ⚠️ Elle **corrige** le tirage que j'avais fait du rapport : j'avais écrit « 8 blg du
> **bord** de la dalle » et j'avais **omis « toujours en bas »**. Un bord n'est pas le
> bas, et « en bas » n'est pas une conséquence — c'est une clause.

🔴 **LA LOI, EN CINQ CLAUSES.**

| | |
|---|---|
| **la rangée** | **TOUJOURS EN BAS** de la dalle — ⛔ ce n'est pas une conséquence de l'ordre du DOM, c'est une clause |
| **les majeurs** | **toujours cadrés au CENTRE**, un ou plusieurs, c'est le GROUPE qui se centre |
| **le duo** | `?` et livre **cadrés à droite et à gauche**, dans une **cellule** de cette rangée |
| **à quelle distance** | **8 blg du BAS de la dalle** |
| **combien** | **UNE FOIS DANS UN ÉCRAN** — Eric, 05/09, confirmé une seconde fois — ⛔ pas par dalle · et dans la **DERNIÈRE** rangée |

### 🔴 CE QUE CHAQUE BORNE **FAIT** — et ce n'est pas la même chose *(Eric, 2026-09-05)*
📍 `socle-ce-que-chaque-borne-fait` · vivante · 05/09
⚖️ **Le livre SORT du builder vers FH WEB, le `?` reste dans l'écran et ouvre le popup du guide : le livre parle du JEU, le `?` parle de l'ÉCRAN.**

> *« le livre doit emmener vers le site FH WEB »* · *« le point d'interrogation est le
> guide et fait un popup »*.

⛔ **LES CINQ CLAUSES CI-DESSUS NE DISENT QUE LA PLACE.** Deux organes ronds, de même
cote, aux deux bouts de la même rangée : rien dans leur géométrie ne dit qu'ils ne font
pas le même geste. Ils n'en font pas le même, et c'est une clause à part entière.

| | l'organe | ce qu'il FAIT | où ça mène |
|---|---|---|---|
| 📖 | **le livre** (`.fiche-livre`) | **SORT du builder** vers la règle publiée | le site **FH WEB** — `FH_WEB`, `liens-fh.mjs` |
| ❓ | **le `?`** (`.tuto-point`) | **le GUIDE**, et il ouvre un **popup** | il reste dans l'écran |

📖 **ET CE QUI SE PASSE DE L'AUTRE CÔTÉ DE LA PORTE N'EST PAS RÉGI ICI.** Le chapitre où le livre
atterrit — sa voix, ce qu'il a le droit de citer du SRD, son bandeau de pied, l'ancre sur laquelle
il ouvre — obéissait à la **Web Bible**, ⚠️ **retirée du site le 2026-09-06** *(voir l'en-tête)*. ⛔ **Choisir une cible sans la lire, c'est ce qui a coûté six phrases
le 06/09.** ➡️ Lire en particulier `citation-declare-la-substitution` *(⛔ on ne recopie pas la
prose du SRD)* et `fabrique-code-n-est-pas-la-source` *(⛔ on n'écrit pas le livre depuis le code)*.

⭐ **ET LA DIFFÉRENCE N'EST PAS COSMÉTIQUE : ELLE DIT OÙ VIT LA RÈGLE.** Un texte de
règle écrit dans l'interface est une règle publiée PAR l'interface — sans source, sans
version, sans empreinte (§0.8, et `concept-step.mjs` l'a déjà payé : *« connecte le livre
à la section alignement dans le SRD »*). Le livre ne RACONTE pas la règle, il y **mène**.
Le `?`, lui, ne publie rien : il rappelle comment se sert l'écran qu'on a sous les yeux.
🔴 *Le livre parle du JEU, le `?` parle de l'ÉCRAN.* C'est ce qui les rend inéchangeables,
et c'est pourquoi ils tiennent les deux bouts au lieu de se suivre.

⚖️ **LE PATRON EXISTE DÉJÀ, ET IL EST À `destiny-step.mjs`** — un `href` ouvre FH WEB
(`window.open(href, "_blank", "noopener")`), son absence retombe sur le popup de lore.
⭐ Ce qui manque ailleurs n'est donc PAS une mécanique : c'est la **cible**.

⏳ **ÉTAT MESURÉ LE 2026-09-05 — c'est un INVENTAIRE, pas une commande** (§ sacré n° 3 :
*« on laisse tout tranquille tant que ça marche »*). Sur les six livres du dépôt, **trois**
sortent vers une règle publiée : `destiny-step.mjs` (FH WEB), `concept-step.mjs` (le SRD),
et **`abilities-step.mjs` depuis le 05/09** — Eric : *« en tout cas ton livre doit pointer
là »*. Son panneau interne est parti avec ; ce qu'il disait s'écrit au chapitre
`ability-scores`, et le trou est nommé dans le code tant que l'écrivain n'a pas publié.
⛔ **Les trois autres ouvrent encore un popup de lore** : `parcours-ecrans.mjs` (le rang B
et B2) et `catalogue.mjs`. Ils attendent une cible, pas une mécanique.
⛔ **Chaque conversion demande une CIBLE, et une cible est une décision** : quel chapitre
de FH WEB pour quel écran. Aucune ne se déduit du code.

### 🔴 ET S'IL Y A PLUSIEURS DALLES — **LA DERNIÈRE, OU UNE DALLE FLOTTANTE FIXE**
📍 `cadre-et-s-il-y-a-plusieurs-dalles` · vivante · 05/09
⚖️ **Un écran à plusieurs dalles pose son duo dans la DERNIÈRE dalle ou dans une dalle flottante fixe, et c'est le DÉFILEMENT qui tranche entre les deux — jamais une préférence.**

> Eric, 2026-09-05, en réponse au seul cas que les cinq clauses ne tranchaient pas :
> *« s'il y'a plusieurs dales, la dernière ou dans un dalle flottante fixe »*.

**Deux formes autorisées, et deux seulement.** Un écran à plusieurs dalles pose le duo
soit **dans la dernière dalle**, soit dans une **dalle flottante fixe** — ⛔ jamais une
pastille par dalle.

⚠️ **ET LE CHOIX ENTRE LES DEUX SE MESURE, IL NE SE PRÉFÈRE PAS.** Le critère est le
**défilement** : sur un écran qui tient dans la fenêtre, la dernière dalle EST visible et
suffit. Sur un catalogue qui défile — Species porte **12 fiches** — une pastille posée
sur la dernière dalle est hors de vue pour toutes les autres, et c'est très exactement le
défaut que la règle existe pour retirer. ⭐ *La dernière dalle est le défaut ; la dalle
flottante est ce qu'un défilement impose.*

⛔ **UN PRÉCÉDENT À NE PAS CITER DE TRAVERS, mesuré le 05/09.** Le rapport du 04/09
nommait `skills-pied` comme *« seule dalle du dépôt hors du flux qui défile »*. C'est
faux : `skills-pied` n'a **qu'une seule déclaration** dans toute la feuille, `flex: none`,
et **aucun** `position: fixed` ni `sticky`. Son effet de pied fixe vient de la **colonne
flex** qui l'entoure — un frère défile, lui ne se comprime pas.
🔴 La conséquence pour qui construira la dalle flottante : **ce n'est pas un `position`
à recopier, c'est une structure à poser** — une colonne dont le milieu défile. Species,
Class et Destiny ne sont pas bâtis comme ça aujourd'hui, et le coût annoncé (« ~60 blg de
hauteur de fiche ») ne compte pas cette restructuration.

⛔ **« UNE FOIS DANS UN ÉCRAN » A ÉTÉ REDIT, ET CE N'EST PAS UNE REDITE.** Eric l'avait
déjà dit le 04/09 ; il l'a répété seul, le 05/09, après avoir dicté le reste. Une clause
qu'on répète est une clause qu'on a vue se faire contourner. ⛔ Elle ferme la lecture
« une pastille par fiche » que le 03/09 pouvait laisser croire.

⭐ **ET « TOUJOURS EN BAS » TRANCHE UNE QUESTION QU'ON CROYAIT OUVERTE.** Le rapport du
04/09 demandait à l'architecte d'arbitrer entre *« une seule fois par écran »* et le
catalogue à rail. Eric a tranché lui-même, et pas par un compromis : le duo n'est jamais
un organe à placer à part — **il est DANS la rangée de boutons, et cette rangée est en
bas**. Ce qui restait à décider n'était donc pas *où mettre le duo*, mais **où mettre la
rangée quand il y a plusieurs dalles** — et c'est la clause ci-dessus qui y répond :
la dernière dalle, ou une dalle flottante fixe.

⚠️ **CORRECTION DE L'ARCHITECTE, 05/09** : j'avais d'abord écrit ici qu'il n'y avait
« pas de dalle flottante à inventer ». C'était faux, et Eric l'a corrigé dans la minute —
la dalle flottante est l'**une des deux formes autorisées**, pas une option écartée.

⛔ **ET « LA DERNIÈRE » N'EST PAS UN DÉTAIL DE RÉDACTION — C'EST LE CŒUR.** Tant qu'un
écran ne portait **qu'une** rangée, « la première » et « la dernière » désignaient le
même nœud : la loi tenait par **coïncidence**, et trois écrivains employaient
`querySelector` (qui rend la première) sans que rien ne rougisse. Le premier écran à
porter **deux** rangées fait cesser la coïncidence.
⭐ *Une loi qui tient par coïncidence est indiscernable d'une loi qui tient — jusqu'au
jour où le cas qui les sépare arrive.*

### 🔒 SACRÉ n° 3 — **TOUT EST DANS UNE BOÎTE, LES BOÎTES SONT SUR UNE GRILLE** *(Eric, 2026-09-04)*
📍 `cadre-sacre-n-3-tout-est-dans-boite-boites-sont-sur-grille` · remplacée · 04/09 · remplacée par `socle-sacre-n-3-tout-est-dans-boite-boites-sont-sur-grille`
⚖️ **Les boutons compris : c'est la GRILLE qui écrit l'écart de 8 blg, ⛔ jamais une marge posée organe par organe.**

> 🗄️ **ARCHIVÉE LE 2026-09-06 — SECONDE ÉCRITURE DU MÊME SACRÉ.** *« Une règle énoncée deux
> fois est deux règles »* : sa clause propre — *« les boutons compris »*, et la grille seule
> écrivain de l'écart — est versée dans le survivant, qui la porte désormais dans sa phrase.
> ⛔ Ce qui suit sous ce titre reste lisible : la définition d'un sacré *(elle vit à
> `socle-categorie-sacres`)*, le **bornage** du 05/09 *(qui a maintenant sa propre adresse,
> ci-dessous)*, et le relevé du 04/09 dalle par dalle.

**Les boutons compris.** Les écarts valent **8 blg**, et c'est **la grille** qui les
écrit — jamais une marge posée organe par organe.

⭐ **CE QU'UN « SACRÉ » AJOUTE AU VOCABULAIRE, ET POURQUOI IL FALLAIT UN MOT.** Une
**norme** est un **défaut**, pas un mur (26/08) : un écran qui n'entre pas peut s'en
écarter en argumentant. Un **sacré**, non. Un lot qui n'arrive pas à faire tenir un
écran **retire du contenu** (§1 quater) ou **descend tout le bloc d'un cran**
(§1 ter quinquies) — ⛔ il ne rogne pas un sacré.

#### 🔴 ET IL EST BORNÉ PAR UNE RÈGLE PLUS HAUTE — *Eric, 2026-09-05*
📍 `socle-on-laisse-tranquille-ce-qui-marche` · vivante · 05/09
⚖️ **Un sacré dit comment on CONSTRUIT, ⛔ pas qu'il faut aller refaire ce qui tourne : convertir une dalle existante demande un défaut mesuré à l'écran, ou un mot d'Eric — jamais un relevé de non-conformité.**

> **« on fera comme ça désormais, on laisse tout tranquille tant que ça marche »**

📌 **CETTE ADRESSE A ÉTÉ POSÉE LE 2026-09-06, ET C'EST LA FUSION QUI L'A RENDUE NÉCESSAIRE.**
Le bornage vivait **sans adresse**, à l'intérieur d'une section qui n'était qu'une seconde
écriture du sacré n° 3. En archivant le doublon, on aurait périmé une règle d'Eric plus
récente que celle qu'elle borne — ⚠️ *une règle sans adresse meurt de la mort de sa voisine.*

⛔ **UN SACRÉ DIT COMMENT ON CONSTRUIT, ⛔ PAS QU'IL FAUT ALLER RÉÉCRIRE CE QUI TOURNE.**
Un écran conforme par construction est la règle pour tout ce qu'on pose ; un écran qui
**marche** ne se convertit pas pour la seule raison qu'il n'est pas conforme. La
conversion d'une dalle existante demande **un défaut mesuré à l'écran**, ou un mot
d'Eric — jamais un relevé de non-conformité.

⭐ **POURQUOI C'EST UNE RÈGLE ET PAS DE LA PARESSE**, et le chantier venait de le
démontrer : le relevé du 04/09 nommait huit dalles non conformes et concluait qu'il
fallait les convertir. Or **chaque conversion se remesure** — passer un écart de 0 à 8 sur
`card-final` pousse la pire carte d'arcane (498 blg) au-delà des 500 du panneau. ⛔ Une
mise en conformité qui casse un écran qui marchait n'est pas un progrès : c'est une
régression avec une bonne raison. *Le coût d'une harmonisation se paie à l'écran, pas dans
un tableau de conformité.*

📌 Corollaire pour tout lot : une liste de « ce qui n'est pas conforme » est un
**inventaire**, jamais une **commande**.

⚠️ **ET CELUI-CI EST UN CHANTIER, PAS UNE CASE À COCHER.** Relevé du 04/09, dalle par
dalle : **une seule dalle du dépôt est conforme**. `concept-step`, `skills-tete` et
`skills-group` sont en `display: block` ; `parcours-guide` (Species · Inheritance ·
Class), `card-final`, `dressing`, `ability-organe` et `choix-glisse` sont en `flex`
avec des écarts à 0.
🔴 **Chaque dalle convertie se REMESURE** : passer un écart de 0 à 8 sur `card-final`
pousse la pire carte d'arcane (**498 blg** mesurés) au-delà des **500** du panneau, et
Identity en demande déjà **483**. ⛔ L'ordre de conversion est une **décision d'Eric**,
pas une conséquence — voir la dette ouverte au bas de ce fichier.

---

### ⚖️ LES EXCEPTIONS EXISTENT, ET ELLES S'ARGUMENTENT — 26/08
📍 `jeton-exceptions-nommees` · vivante · 26/08
⚖️ **Les exceptions de jeton et de collecteur sont nommées par Eric : les augmentations de caractéristique et les ability rolls.**

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
📍 `collecteur-rangee-libre-en-nombre` · vivante · 26/08
⚖️ **Le nombre de collecteurs d'une rangée est dicté par ce que l'étape demande — c'est le vivier qui est borné, pas eux.**
📍 `jeton-jamais-de-base-en-pourcentage` · vivante · 26/08
⚖️ **Une case ne prend jamais une base en pourcentage : c'est la RANGÉE qu'on borne, pas la case.**
📍 `jeton-trois-par-ligne` · vivante · 26/08
⚖️ **Un vivier ne dépasse jamais trois jetons par ligne, à toute largeur.**

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
📍 `jeton-abrege-16` · vivante · 26/08
⚖️ **Le seuil d'abréviation est de 16 caractères.**
📍 `jeton-un-compte-n-est-pas-une-largeur` · vivante · 26/08
⚖️ **Aucun seuil en caractères ne sépare deux mots de même longueur : le repli `overflow-wrap: break-word` rattrape le cas.**
📍 `socle-une-norme-qui-ne-vit-que-dans-un-document-n-existe-pas` · vivante · 26/08
⚖️ **Une norme qui ne vit que dans un document n'existe pas : elle se câble en défaut partagé, avec son garde.**

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
📍 `bouton-opaque` · vivante · 26/08
⚖️ **Un bouton est OPAQUE — 100 %, et il ne porte jamais l'habit d'une dalle.**
📍 `socle-une-dette-recopiee-n-est-pas-une-dette-verifiee` · vivante · 26/08
⚖️ **Une dette recopiée n'est pas une dette vérifiée.**

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
📍 `bouton-ombre-devient-lueur-la-nuit` · vivante · 26/08
⚖️ **L'ombre du bouton devient une LUEUR la nuit : c'est le fond qui décide de la direction.**

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
📍 `cadre-voile-du-fond` · vivante · 26/08
⚖️ **Le fond (le cadre d'écran) ne porte AUCUN voile.**

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
📍 `cadre-jamais-deux-voiles-empiles` · vivante · 26/08
⚖️ **Jamais deux voiles empilés : pas de conteneur d'écran, des dalles autonomes.**
📍 `cadre-modele-a-copier` · vivante · 26/08
⚖️ **Le modèle d'une norme bien câblée est `--voile-simple/inter/majeure` : jeton au socle, dalles calculées par `color-mix`, garde sur la valeur ET l'absence de littéral.**
📍 `cadre-regle-par-ressemblance-nomme-sa-source` · vivante · 26/08
⚖️ **Une règle écrite par ressemblance doit NOMMER sa source, jamais recopier sa valeur.**
📍 `cadre-voile-de-la-dalle` · vivante · 26/08
⚖️ **La norme du site est un voile de 50 % sur la dalle.**
📍 `cadre-voile-des-blocs-interieurs` · vivante · 26/08
⚖️ **35 % est le voile des petits blocs posés DANS une dalle.**
📍 `socle-corriger-l-objet-d-apres-le-document` · vivante · 26/08
⚖️ **Corriger l'objet d'après le document, c'est prendre le document pour la mesure.**

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
📍 `liste-ordre-vertical` · vivante · 26/08
⚖️ **Sous la liste viennent les collecteurs, puis encore dessous les boutons.**
📍 `liste-pagination-jamais-defilement` · vivante · 26/08
⚖️ **Une liste de jetons pagine, elle ne défile jamais : ce qui ne tient pas passe à la page suivante.**
📍 `liste-quinze-est-un-defaut` · vivante · 26/08
⚖️ **Le 15 est un DÉFAUT : un écran qui dévie passe explicitement son nombre à `pageDeListe(objets, page, N)`.**
📍 `liste-quinze-par-page` · vivante · 26/08
⚖️ **Une liste sert 15 jetons par page, en rangées de 3.**
📍 `liste-set-incomplet-se-centre` · vivante · 26/08
⚖️ **Une ligne incomplète se centre ; la grille ne s'étire ni ne se recompose pour combler le vide.**

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
📍 `liste-pagination-a-porter-aux-huit-autres` · vivante · 26/08
⚖️ **Huit listes n'ont pas encore la pagination : c'est un lot, pas une décision.**
📍 `liste-portee-site-entier` · vivante · 23/08
⚖️ **La norme des 15 est une règle du produit entier, pas de l'écran Équipement.**
📍 `liste-trois-par-rangee-etait-un-accident` · vivante · 26/08
⚖️ **Le « 3 par rangée » qu'on observait dans un `flex-wrap` sans pagination était un accident d'arithmétique, pas une règle.**
📍 `liste-un-seul-organe-pagine` · vivante · 26/08
⚖️ **La pagination vit dans l'organe unique `renderChoixGlisses`, pas dans les écrans.**

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
📍 `liste-quinze-vit-a-deux-endroits` · à trancher · 26/08
⚖️ **Le 15 vit à deux endroits sans garde qui les tienne d'accord : c'est une dette mesurée.**

| où | ce qui est écrit |
|---|---|
| `ui/builder/normes.mjs` | `LISTE_PAR_PAGE = 15` — gardé par `tests/listes.test.mjs` |
| `ui/builder/shell.css` | `grid-template-rows: repeat(**5**, var(--fhpc-case-h))` |

⛔ **Changer l'un sans l'autre casse la grille en silence** : le JS servirait 12 objets dans une
grille qui en réserve 15, ou l'inverse. ⏳ Aucun garde ne les tient d'accord.

### ⏳ CE QUI N'EST TOUJOURS PAS TRANCHÉ
📍 `liste-etagere-trop-grosse` · à trancher · ?
⚖️ **Les 127 objets merveilleux (9 pages) ne sont pas un défaut de la norme, mais le signe qu'une étagère est trop grosse.**

| | |
|---|---|
| **les 127 objets merveilleux = 9 pages** | le vault : *« ce n'est pas un défaut de la norme, c'est le signe que **cette étagère est trop grosse** »* — elle appelle un niveau de rangement de plus |

✅ **Et DEUX points se sont refermés le 26/08** : *« ce que devient un jeton trop long pour sa
case »* — `ABREGE_MAX = 16` *(§2 bis)* — et les flèches à une seule page, juste ci-dessous.

---

### ✅ UNE SEULE PAGE N'A PAS DE FLÈCHES — tranché 26/08
📍 `liste-exception-etat-d-attente-equipement` · vivante · 26/08
⚖️ **L'état d'attente d'Équipement garde ses deux gouttières de chevron — exception argumentée.**
📍 `liste-jamais-display-none` · vivante · 26/08
⚖️ **Une flèche absente est retirée de la rangée, jamais masquée par `display: none`.**
📍 `liste-pages-sans-plafond` · vivante · 26/08
⚖️ **`pages = ceil(objets ÷ 15)`, toujours, sans plafond.**
📍 `liste-une-seule-page-pas-de-fleches` · vivante · 26/08
⚖️ **Quand il n'y a qu'une page, il n'y a pas de flèches.**

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
📍 `bouton-la-paire-encadre-la-rangee` · remplacée · 26/08 · remplacée par `bouton-rangee-controles`
⚖️ **Le livre à gauche et le `?` à droite encadrent la rangée de boutons, à la même cote, hors du centrage.**

> 🗄️ **ARCHIVÉE LE 2026-09-06 — LA NEUVE DIT TOUT CE QU'ELLE DIT, ET COMMENT.** §6 pré
> *(`bouton-rangee-controles`, 04/09)* porte les mêmes trois faits — le livre à gauche, le `?`
> à droite, hors du centrage — **plus la mécanique qui les tient** : trois colonnes, deux
> bornes `--touch`, un groupe `1fr` qui se centre. ⭐ *Une règle qui dit QUOI sans dire
> COMMENT se fait obéir de quatre façons différentes* — et c'est exactement ce qui est
> arrivé : quatre réserves en rembourrage, écrites à quatre dates par quatre lots.
📍 `budget-gabarit-b-non-negociable` · vivante · 27/08
⚖️ **Trois choses du gabarit B ne se négocient pas : la porte (44 de cible, T3), le `?` et le livre (22 dans 44), la fenêtre (elle défile, elle ne se tronque pas).**

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
📍 `budget-gabarit-du-rang-b` · à trancher · 27/08
⚖️ **Le gabarit du rang B (le menu d'étape) est dicté cote par cote, mais c'est une PREUVE DE CONCEPT, pas une cote gravée.**

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
📍 `budget-ce-qui-n-est-pas-negociable-dans-ce-gabarit` · vivante · 27/08
⚖️ **Dans ce gabarit, la porte (cible 44, corps T3), le duo `?` + livre (22 de dessin dans 44 de cible) et le défilement de la fenêtre ne se négocient pas.**

| | |
|---|---|
| **la porte** | 44 px de cible, corps **T3** — c'est un bouton, il est **sacré** *(§2 bis)* |
| **le `?` et le livre** | 22 de dessin dans 44 de cible, aux deux bouts *(§7 bis)* |
| **la fenêtre** | elle **défile**, elle ne se tronque pas *(§5 bis)* |

### 📌 Les postes qui ont payé, et où les reprendre
📍 `budget-deux-marges-qui-s-additionnent` · vivante · 27/08
⚖️ **Un gabarit se mesure, il ne se relit pas : trois postes du B étaient deux marges légitimes qui s'additionnaient.**

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
📍 `panneau-homothetie-u-retiree` · remplacée · 30/08
⚖️ **L'échelle locale `--u` de la carte-résumé est retirée : c'est le CRAN qui s'adapte à la fenêtre, plus chaque organe à sa boîte.**
📍 `panneau-plafond-u-leve` · remplacée · 30/08
⚖️ **Le plafond d'échelle `u = 1` est levé.**
📍 `budget-carte-r-est-un-dessin` · vivante · 27/08 · borne `ecriture-corps-de-lecture-ne-se-met-pas-a-l-echelle`
⚖️ **La carte du rang R est un DESSIN proportionnel, pas une somme de cotes.**
📍 `budget-carte-r-hauteur` · vivante · 30/08
⚖️ **La carte du rang R fait 440 blg : 396 de dessin + 44 de rangée tactile, et la loi dit « jamais moins », pas « fixe ».**
📍 `budget-pas-de-seconde-echelle` · vivante · 30/08
⚖️ **Il est interdit qu'une SECONDE échelle réapparaisse dans un dessin.**

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

### ✅ LES CORPS DE LA CARTE SONT SUR L'ÉCHELLE *(2026-09-03)*
📍 `budget-corps-carte-sont-sur-echelle` · vivante · 03/09
⚖️ **Les quatre corps de la carte du rang R sont sur l'échelle — `--t5` · `--t2` · `--t1` · `--t1` — et ses écarts en `--sp-8` / `--sp-4`.**

Les quatre corps du portrait étaient écrits en pixels bruts — `18px` (le nombre de `--t5`),
`13px`, `10,5px`, `11px` — et les cinq écarts en `8px`/`4px`. Ils valent désormais
**`--t5` · `--t2` · `--t1` · `--t1`**, écarts en `--sp-8`/`--sp-4`, ligne du blurb en
`calc(var(--t1) * 1.2)`. C'est l'application de **§1 ter quinquies** : la globalité descend d'un
cran, aucun cran neuf n'a été ajouté. ⭐ La boîte du blurb reste **HUIT LIGNES** — elle se compte
en lignes, donc elle descend avec le corps (8 × 12) et rend ses 9,6 blg au bloc 1.

### Le format du contenu — les cotes du condensé
📍 `ecriture-condense-de-la-carte-r` · vivante · 27/08
⚖️ **Le contenu d'une carte-résumé se taille pour les boîtes, jamais l'inverse.**
📍 `ecriture-nom-court-sans-prefixe-generique` · vivante · 27/08
⚖️ **La bande de classe porte un nom COURT : on dégage « path ».**

| boîte | cote | source |
|---|---|---|
| **ligne de lineage/subclass** | **≤ 31 caractères**, une ligne, `nowrap` au paysage | mesuré : « Ten lines : breath + resistance », 31 car. = 226 px pile — ⚖️ UNE exception mesurée : « Berserker : Rage into Violent fury » (34 car., 226/226 au pixel, Eric : *« si t'as la place »*) |
| **bande de classe** | intertitre `Subclasses` + la voie sous un **nom COURT** : *« Berserker : Rage into fury »* — ⛔ *« on dégage path »* : le préfixe générique est une information nulle, le nom complet vit au rang B | garde 6 bis réécrit : le nom court doit **vivre dans** le vrai nom SRD |
| **blurb portrait** | **8 lignes pleines** = 3/10 de la zone — arbitré en trois temps : *« 1/3 → vers 1/4, sinon on s'asphyxie → 3/10 »* ; **justifié + césure** | la boîte se compte en LIGNES, jamais une ligne coupée aux deux tiers |
| **abréviations ratifiées** | **ADV** (advantage) · **SV** (saves) | *« saves pourrait s'écrire SV, advantage ADV »* |

### Le paysage, dernier réglage d'Eric
📍 `budget-paysage-de-la-carte-r` · vivante · 27/08
⚖️ **Le paysage de la carte R se règle en `220 (image) | bloc 1 | 200 (texte) | 16 (respiration)`.**

`220 (image) | bloc 1 | 200 (texte) | 16 (respiration)` — *« une symétrie entre la largeur du blurb
et le png »* puis *« rapetisser un peu le blurb, agrandir un peu le barbare »*. Image **220 × 340**,
corps de la colonne texte **10,5u** (descendu avec sa largeur : même ratio, les lignes qui tenaient
tiennent). Interligne **unique 1,2** sur tout le bloc 1 (*« espacement pas homogène, ça fait
chelou »*).

### 🔦 Le halo du scrollspy
📍 `budget-halo-du-scrollspy` · vivante · 27/08
⚖️ **Le scrollspy porte un halo de luminance : lueur blanche la nuit, encre le jour.**

> Eric : *« le scrollspy n'est pas assez visible — un halo de luminance autour de Elf dans les
> tuiles à gauche »*, puis *« pas mal mais un peu moins large »*.

Jeton **`--spy-halo`**, un par thème : **lueur blanche la nuit, encre le jour** — une lueur sur
parchemin clair serait invisible. `box-shadow: 0 0 6px 1px`, sur `[aria-current="true"]` du rail.

### ⛔ Deux pièges de géométrie, payés le jour même
📍 `budget-rangee-vide-garde-ses-gouttieres` · vivante · 27/08
⚖️ **Une rangée vide garde ses DEUX gouttières : le voisin doit ENJAMBER la rangée vide.**
📍 `budget-une-regle-d-habit-se-borne-a-son-media` · vivante · 27/08
⚖️ **Une règle propre à un habit se borne à son media query, sinon elle fuit dans l'autre.**

| piège | ce qui s'est passé |
|---|---|
| **une rangée vide garde ses DEUX gouttières** | sans bande, la rangée `auto → 0` volait un gap au bloc voisin : 11 px d'asymétrie mesurés (les 7 « bloc 3 mal centré » de l'audit d'Eric). Parade : le voisin **enjambe** la rangée vide (`grid-row: n / m`) — la symétrie revient par construction |
| **une règle d'un habit FUIT dans l'autre** | l'enjambement portrait, écrit nu à (0,4,0), battait la règle paysage (0,3,0) — *« bloc 1 trop haut »*, vu par Eric avant moi. Une règle propre à un habit se **borne à son media query** |

---

### 📐 LA MARGE HAUTE DE DESTINY R2 — 4 en haut, 0 en bas, et ⛔ pas 16
📍 `budget-destiny-r2-marge-haute` · vivante · 07/09
⚖️ **L'écran final de Destiny (R2) porte 4 blg de marge au-dessus et 0 en dessous — ⛔ il ne prend PAS les 16 du défaut des autres écrans du parcours.**

> **Eric**, 2026-09-07 : *« Destiny R2, la marge sous le belt doit augmenter de 4 »*.

🔴 **ET LA MOITIÉ QUI COMPTE EST LA SECONDE : R2 NE REJOINT PAS LES AUTRES.** Eux prennent **16**
*(`.decision-card { margin-block: var(--sp-16) }`, `shell.css:1298`)* ; R2 prend **4**. Eric a
demandé *« augmenter de 4 »* — **de 0 à 4** — ⛔ **pas un alignement**. Un lot qui « harmoniserait »
à 16 en croyant finir le travail défera sa cote.

📏 **D'OÙ VENAIT LE ZÉRO, ET CE N'EST PAS UN OUBLI.** La marge valait **0** et c'était **déclaré** :
`.decision-card:has(> .card-step > .card-final) { height: 100%; margin-block: 0 }`
*(`shell.css:8892`)*. ⛔ Cette ligne n'a **pas** été posée pour retirer l'espace — elle appartient à
la **chaîne de hauteur du 30/08** *(« ça doit rester dans le cadre que j'ai dessiné »)*, et ses deux
voisines immédiates ne portent que `height: 100%`. **La marge est tombée en effet de bord.**
⭐ *Une cote perdue par effet de bord se retrouve dans la déclaration qui l'a emportée, jamais là où
on la cherche.*

📏 **LA CASCADE EST MESURÉE, ET IL N'Y A QU'UN ÉCRIVAIN.** `:has()` prend la spécificité de son
argument le plus spécifique : `.decision-card:has(> .card-step > .card-final)` pèse **0-3-0**
*(une classe + deux dans l'argument)* contre **0-1-0** pour `.decision-card` seul — elle gagne
**quel que soit l'ordre du fichier**. Les deux autres `margin-block: 0` posées sur ce sélecteur
visent `equipment-step` et `parcours-item-dalle`, **jamais** `card-final`.
📌 *(Le relais annonçait 0-2-0 ; le compte exact est 0-3-0. La conclusion ne change pas, et une cote
fausse dans le corpus voyage — c'est pour ça qu'elle est recomptée ici.)*

⚠️ **CETTE COTE EST PROUVÉE PAR LA FEUILLE, ⛔ PAS PAR L'ŒIL — et le siège qui l'a codée le dit
lui-même.** Le volet de prévisualisation lit le `launch.json` du **checkout principal**, partagé par
deux autres sièges ; ouvrir un banc depuis un worktree aurait sali leur arbre. ⭐ *Un rendu se
REGARDE avant livraison* reste la loi — ici elle n'a pas pu être tenue, et **c'est écrit plutôt que
masqué**. ⏳ La première capture de R2 confirmera les 4 blg, ou les démentira.

📌 Lot `174-destiny-r2-marge`, commit `15f1bf7`, **1833/1833** — ⛔ non poussé.

## 4 quater bis. 📐 LE GABARIT DE L'ÉCRAN FINAL DE DESTINY *(figé au banc, 2026-09-03)*
📍 `budget-gabarit-ecran-final-destiny` · vivante · 03/09
⚖️ **Le gabarit de l'écran final de Destiny est FIGÉ : chaque nombre y est un relevé sur la page rendue à 375 × 500 blg, jamais une intention.**

> Eric : **« tu mesures tout précisément »** · **« tu figes tout ça »** · **« tu as 7 blocs texte
> et un bloc image, place-les et fige-les »**.
> Chaque nombre est un **RELEVÉ** sur la page rendue à 375 × 500 blg, cran 1, carte *l'Ermite*.
> Gardes : `tests/destiny-final-budget.test.mjs` et `tests/dalle-du-rang.test.mjs`.

### 🔴 LE BUDGET, ET IL EST FERMÉ
📍 `budget-et-il-est-ferme` · vivante · 31/08
⚖️ **La scène vaut 500 blg — le panneau de 560 moins la ceinture de 60 — et c'est le budget d'un écran sur TOUS les appareils.**

    panneau      560 blg      (règle sacrée du 31/08)
    ceinture     − 60
    ─────────────────────
    scène        500 blg  ←  LE BUDGET D'UN ÉCRAN

⚠️ **`500` n'est PAS une limite de l'iPhone SE**, et la confusion a coûté une soirée. C'est ce qui
reste du panneau une fois la ceinture posée ; le panneau de 560 est calibré pour tenir sur un SE
(553 de haut utile, peint au cran « mini » à 96 %). ➡️ **La limite est la même sur tous les
appareils** — un iPad ne donne pas plus de blg, il les peint plus gros.

### 🔴 HUIT BLOCS, HUIT CASES NOMMÉES
📍 `budget-huit-blocs-huit-cases-nommees` · vivante · ?
⚖️ **Les huit blocs de l'écran final sont huit CASES NOMMÉES d'une grille : un bloc se déplace en changeant un mot du dessin, ⛔ jamais en compensant une marge par une autre.**

⛔ **CINQ BLOCS VIVAIENT DANS UN CONTENEUR**, et c'est ce qui rendait l'écran irréglable : un bloc
enfermé ne peut pas être PLACÉ, il subit le flux de sa boîte. Une soirée entière s'est passée à
pousser des marges pour déplacer des blocs qui n'avaient pas d'adresse.

    grid-template-columns: minmax(180px, 1fr) auto        gap: 8

    "titre       titre"
    "ability     image"
    "impact      image"
    "meaning     image"
    "power       image"
    "rangs       image"
    "score       image"

⭐ **Le dessin se lit ici, en sept lignes, et se change en déplaçant un mot** — plus en compensant
une marge par une autre.

### La colonne des postes — 475 sur 500
📍 `budget-colonne-postes` · vivante · ?
⚖️ **La colonne des postes de l'écran final se compte VOYANT COMPRIS — 4 + 10 + ~395 + 8 + 44 + 8 — et rend 463 des 500.**

| | poste | blg |
|---|---|---|
| | rembourrage haut | **4** |
| 1 | **le voyant** *(`.card-final-tete`)* | **10** |
| 2 | **le corps** — les huit cases | **~395** |
| | écart au pied | **8** |
| 3 | **le pied** — quatre boutons | **44** |
| | rembourrage bas | **8** |
| | **TOTAL mesuré** *(l'Ermite, 3 vibrations)* | **463**, soit **37 de marge** |

⚠️ **LE VOYANT COMPTE POUR 10, ET IL A ÉTÉ OUBLIÉ DEUX FOIS** dans le décompte de la séance — la
somme tombait à 492 au lieu de 500, et les 8 manquants ont été cherchés dans les marges.

### Les blocs, leur forme et leur cote
📍 `budget-blocs-leur-forme-et-leur-cote` · vivante · ?
⚖️ **Chaque bloc de l'écran final a une largeur et une hauteur figées, et l'image occupe une cellule étirée sur les six rangées autres que le titre.**

| bloc | largeur | hauteur | forme |
|---|---|---|---|
| **titre** | 343 | 20 | **pleine largeur, centré sur la DALLE**, T4 |
| **ABILITY** | 198 | 15 | étiquette + valeur sur une ligne |
| **IMPACT** | 198 | 15 | idem |
| **MEANING** | 198 | 62 | étiquette, puis sa fenêtre |
| **POWER** | 198 | 62 | idem |
| **VIBRATIONS** *(case `rangs`)* | 198 | 70 | **une par ligne, NOMMÉE seulement** — « N vp » en gras + un LIEN |
| **DESTINY SCORE** | 198 | 99 | total sur la ligne de l'étiquette, un terme nommé par ligne |
| **l'image** | 137 × 235 | — | **centrée** dans une cellule étirée sur SIX rangées (toutes sauf le titre) |
| *(le pied)* | 343 | 44 | quatre boutons — frère de la grille, hors budget des cases |

### 🔴 CE QUE L'ÉCRAN NE MONTRE PAS, ET OÙ ÇA VIT
📍 `budget-ce-que-ecran-ne-montre-pas-et-ou-ca-vit` · vivante · 03/09
⚖️ **L'effet d'une vibration vit dans un POPUP et la règle entière de la carte vit dans le LIVRE : ce qui est en trop sur un écran se DÉPLACE, il ne se coupe pas.**

> Eric, 2026-09-03 : *« les vibrations peuvent n'être que nommées »* · *« les vibrations = popup »*
> · *« le livre mène aux règles dans FH Web »*.

| | où |
|---|---|
| l'**effet** d'une vibration | un **popup**, ouvert par le lien sur son nom |
| la **règle entière** de la carte | le **livre** du pied → `fh-phb/chapters/arcana/<slug>/` *(les 22 vérifiées en 200 le 03/09)* |

⭐⭐ **C'EST LA LOI DU DÉPÔT APPLIQUÉE, PAS UNE TROUVAILLE** : *« un contenu qui ne tient pas :
demander ce qu'il porte EN TROP, jamais ajouter un défilement »*. L'effet n'était pas en trop dans
le JEU, il était en trop **sur cet écran**. On ne l'a pas coupé, on l'a déplacé.
📏 **Ce que ça a rendu : 29 blg**, et c'est ce qui a fait rentrer l'écran dans le budget sans
toucher à un seul texte de règle.

⚖️ **HABIT DU LIEN** : `.lien-sort` — `--lien`, **non souligné**, rendu en `<button>` (§1 ter bis³).
⛔ Pas `--info` : un lien n'est pas une information qui crie.

### Les écarts — **8 partout**, un seul écrivain, aucune exception
📍 `budget-ecarts-8-partout-seul-ecrivain-aucune-exception` · vivante · 03/09
⚖️ **Les écarts de l'écran final valent 8 partout et le `gap` en est le seul écrivain — aucune exception à retenir.**

    titre=8   ability=8   impact=8   meaning=8   power=8   vibrations=8

🔴 **DEUX D'ENTRE EUX ONT VALU 16, ET ERIC A TRANCHÉ L'INVERSE** (03/09) : je les avais figés comme
voulus — ils séparaient trois natures (ce que la carte **est**, ce qu'elle **ouvre**, ce qu'elle
**pèse**). ⭐ **Ce que leur retrait rend : 16 blg**, soit **une ligne de règle**, et c'est le seul
argument qui compte ici. Onze cartes sur vingt-deux portent un `power` plus long que celui de
l'Ermite ; un écart décoratif payé par un texte de règle coupé n'est pas un arbitrage.
⚖️ **La loi redevient simple** : l'écart entre deux blocs a UN SEUL écrivain, le `gap`, et aucune
exception à retenir.

### 🎨 L'encre porte la structure, depuis que les cadres sont invisibles
📍 `ecriture-encre-porte-structure-depuis-que-cadres-sont` · vivante · 26/08
⚖️ **Depuis que les cadres sont invisibles, c'est l'ENCRE qui porte la structure : ⛔ aucun bloc n'a de cadre ni de rembourrage, et ce qu'un croquis dessine en rectangle est une place réservée.**

| | |
|---|---|
| **étiquettes** | `--text`, T2, capitales |
| **valeurs, fenêtres, termes du Score** | `--text-soft` |
| **« N vp » et les valeurs du Score** | **gras**, encre de corps — jamais `--text` |
| **noms de vibration** | `--lien` |

🔴 **AUCUN BLOC N'A DE CADRE NI DE REMBOURRAGE** — même loi que le gabarit du 26/08 : *« la zone de
scroll a un bord invisible »*. Ce qu'un croquis dessine comme un rectangle est une PLACE réservée.

⚖️ **DEUX EXCEPTIONS DE MARGE, NOMMÉES ET BORNÉES** : le rembourrage de la dalle vaut
`4 · 8 · 8 · 16`. La **droite** cède 8 blg à la carte, le **bas** en prend 8 au lieu de 4 (Eric,
03/09 : *« 8 blg sous les boutons »*) — ⭐ et c'est ce qui aligne enfin le **livre** sur les
boutons : il est POSÉ par la coquille au bas de la dalle, il rendait 8 quand les boutons rendaient
4. La dette du lot 138 se paie par arithmétique, pas par un second réglage.
🔴 Le **haut** et la **GAUCHE** ne cèdent jamais, et les deux cessions valent `var(--sp-8)`,
épelé dans les gardes : une exception qui n'est pas bornée n'est plus une exception, c'est une
porte.

### ⛔ TROIS PIÈGES PAYÉS CETTE NUIT, ET ILS SE RESSEMBLENT
📍 `budget-trois-pieges-payes-cette-nuit-et-ils-se-ressemblent` · vivante · 97/79
⚖️ **Une marge, un centrage ou une répartition qui compense un défaut disparu est le défaut suivant : il se retire avec sa cause.**

1. **`align-self: center` RÉTRÉCIT la cellule** à son contenu : il ne reste alors rien à répartir,
   et le centrage ne déplace rien. Mesuré : cellule 235 pour une image de 235. La cellule doit
   `stretch`, et c'est l'IMAGE qui se centre dedans.
2. **`align-items` ne dimensionne pas les rangées** — `align-content: start` le fait. Sans lui, une
   grille qui reçoit une hauteur ÉTIRE ses rangées et distribue du vide entre les blocs (mesuré :
   242/97/79 pour des contenus de 202/72/38).
3. **UNE MARGE DE COMPENSATION SURVIT À SA CAUSE.** Trois ont été retirées cette nuit ; chacune
   réparait un défaut disparu et était devenue le défaut suivant. La dernière mangeait le `gap` et
   faisait mesurer 0 là où on lisait 8.

### ⏳ Ce qui n'est PAS figé
📍 `budget-ce-qui-n-est-pas-fige` · vivante · 03/09
⚖️ **Le pire cas du budget des 22 arcanes est BORNÉ — 3 vibrations, 5 lignes de bonus — et il se vérifie sur la page CAPTURÉE, ⛔ jamais sur un clone.**

- **la hauteur de l'image** — elle a valu 42, 40, 38, 33 puis 42 % du panneau dans la même soirée ;
- **le voyant** : il n'est pas sur le croquis d'Eric, gardé faute de décision ;
- **l'ancrage du livre et du `?`** : ancrés au bas de la DALLE (posés par la coquille) quand la
  paire vit dans le flux — 8 blg de décalage mesuré, et aucun espacement ne les alignera ;
- 🔴 **LE BUDGET DES 21 AUTRES CARTES — REMESURÉ le 03/09 sur le gabarit final** (les 22 clonées
  dans la dalle vivante, à sa largeur réelle) :

  🔴 **LE PIRE CAS EST VERROUILLÉ, et c'est Eric qui l'a fermé** (03/09) : *« personne n'a plus de
  3 vibrations, on a le max au lvl 1 »* et *« 5 lignes de bonus pour le score, donc ça c'est au max
  aussi »*. ⭐ Un budget dont le pire cas est BORNÉ se vérifie une fois pour toutes — ce n'est plus
  une estimation, c'est un calcul fermé.

  🔴 **LES 22 CAPTURÉES UNE PAR UNE DANS LE VRAI BANC**, Chrome headless piloté en CDP : écran R →
  porte *Choose* → catalogue → sélection → validation. ⭐ **Le chemin B2 est donc traversé 22 fois**,
  et ce ne sont pas des clones — ce sont les pages rendues.

  | | débordent | la scène défile | la plus haute |
  |---|---|---|---|
  | sans plafond *(mesuré sur clones)* | **6 / 22** | — | *The Devil* **579** — 79 de trop |
  | **fenêtres de 4 lignes** *(capture réelle)* | **0 / 22** | **aucune** | *The Fool* **498** |

  📏 Hauteurs réelles : **439 · 454 · 469 · 484 · 498**. Une ligne de corps vaut **14,5 blg**.

  ⚠️ **LA MARGE EST DE 2 blg, PAS DE 8**, et mes clones l'avaient annoncée trop large. Deux
  cartes saturent — *The Fool* et *Wheel of Fortune* — et **toute ligne ajoutée à cet écran les
  casse**. ⛔ Un clone reste un clone : il portait le Score et les écarts de *l'Ermite* pour toutes
  les cartes. Il a bien classé les 22, il n'a pas donné la bonne cote.

  ⭐ **DEUX CHOSES QUE SEULE LA CAPTURE RÉELLE A DITES**, et elles expliquent tout l'écart de 60 blg
  entre la plus basse et la plus haute :
  1. **La fenêtre de prose n'est PAS fixe** — c'est un `max-height`. Le bloc mesure **63** blg à
     trois lignes et **77** à quatre. Une carte au texte court ne paie pas le plafond.
  2. 🔴 **LE BLOC `IMPACT` EST CONDITIONNEL** : il n'existe pas quand l'impact vaut `0`. Quatre
     cartes (*Strength*, *Death*, *The Tower*, *Judgement*, *The Devil*) sont 23 blg plus légères
     pour cette seule raison, Score compris. ⛔ **Le pire cas n'est donc pas « la carte au texte le
     plus long »** — c'est *impact ≠ 0* **ET** `meaning` à 4 lignes **ET** `power` à 4 lignes. Deux
     cartes réunissent les trois.

### ⚖️ L'EXCEPTION AU NON-DÉFILEMENT — la seule, et elle est bornée
📍 `liste-exception-au-non-defilement` · vivante · 03/09 · bornée par `liste-une-fiche-defile-elle-ne-pagine-pas`
⚖️ **L'unique exception au non-défilement est bornée aux deux fenêtres de prose de l'arcane, à quatre lignes exactement — parce que ce qui débordait était une règle du jeu, et rien n'est en trop dans une règle du jeu.**

> Eric, 2026-09-03 : *« on s'octroie une ligne supplémentaire pour power : donc 4 lignes »* · *« si
> c'est mécaniquement possible on passe à 4 lignes scrollable, on fait une exception à la règle du
> non scrollable ici »* · *« pas des barres »* · *« ces chevrons n'apparaissent que quand la boîte
> déborde, ils sont dans la marge gauche »* · *« entre le bloc et le bord de la dalle »*.

🔴 **LA LOI GÉNÉRALE NE BOUGE PAS** : *« un contenu qui ne tient pas : demander ce qu'il porte EN
TROP, jamais un défilement interne »* (palette FREE, 91 → 56 blg).
⭐ **POURQUOI ELLE CÈDE ICI ET NULLE PART AILLEURS** : dans la palette, ce qui était en trop était
de la **décoration**. Ici c'est une **règle du jeu** — mesuré, *The Devil* perdait **7 lignes sur
11** à la coupe, soit 64 % de son pouvoir. La loi dit de retirer ce qui est en trop ; **rien n'est
en trop dans un texte de règle.**

| la condition | et pourquoi elle tient |
|---|---|
| **4 lignes exactement** | et l'**interligne est ÉCRIT** (`1.21`) : `normal` rend 1,208 pour Inter, une valeur que personne n'a posée. En repli de police, « 4 lignes » cesserait de valoir 4 lignes — et le budget des 22 avec |
| **le geste ne fuit pas** | `overscroll-behavior: contain` — sans lui, le doigt arrivé en bas emporte la page derrière. Vérifié au vrai geste : `stage.scrollTop = 0` |
| **ça se VOIT** | deux chevrons, **dans le rembourrage gauche de la dalle**, allumés seulement au débordement — et le haut compte autant que le bas |
| **bornée** | à ces deux fenêtres. Le garde H la tient, conditions comprises |

⛔ **L'ASCENSEUR N'EST PAS LE SIGNE, ET CE N'EST PAS UN GOÛT** : Eric l'a refusé, et sur iOS il est
en surimpression — il n'apparaît **que pendant le geste**, donc jamais avant qu'on touche. Le
chevron est le seul signe qui existe **avant**.
⭐ **LA GOUTTIÈRE EST DE LARGEUR NULLE** : les chevrons débordent vers la gauche par une marge
négative, dans les 16 blg du rembourrage. Ils ne prennent donc **aucune largeur au texte** — ni
présents ni absents — et les lignes ne se recomposent pas d'une carte à l'autre.

⚠️ **UN PIÈGE PAYÉ AU BANC** : `ResizeObserver` ne se déclenche que sur un changement de **taille**,
et la fenêtre est plafonnée. Un texte deux fois plus long n'en change pas la taille d'un blg :
le contenu déborde et **aucun événement ne le dit**. Il faut DEUX lectures — une programmée pour la
première mise en page, l'observateur pour ce qui bouge après.

### ⚖️ LA BORNE D'ERIC — le critère est la PAGINATION, pas l'identité de la fenêtre
📍 `liste-une-fiche-defile-elle-ne-pagine-pas` · vivante · 21/09 · borne `liste-exception-au-non-defilement`
⚖️ **La loi du non-défilement vise les écrans PAGINÉS : une fiche n'a pas de pages, elle peut donc défiler à l'intérieur.**

> Eric, 2026-09-21 : *« il peut y avoir du défilement interne dans une fiche X1, **il n'y a pas
> plusieurs pages** »*.

🔴 **CE QUE ÇA RÈGLE, ET C'ÉTAIT UNE VRAIE IMPASSE.** La loi du 03/09 bornait l'exception *« à ces
deux fenêtres »* — les deux fenêtres de prose de l'arcane, nommées une par une. ⛔ **Une liste
d'exceptions PAR NOM ne dit jamais qu'elle est incomplète** : la description de X1 défilait, elle
était hors liste, et rien ne pouvait dire si c'était une dette ou un cas légitime.

⭐ **LE CRITÈRE D'ERIC N'EST PAS UNE TROISIÈME EXCEPTION, C'EST UNE LIGNE DE PARTAGE** — et elle
s'énonce sans nommer un seul écran :

| l'écran | ce qu'il fait du trop-plein | et pourquoi |
|---|---|---|
| **paginé** — une liste de jetons | il **pagine**, ⛔ il ne défile jamais | un jeton hors écran est **introuvable**, et le joueur ne sait plus combien il en reste |
| **une fiche** — un objet, une carte | elle **défile**, ⛔ elle ne pagine pas | *« il n'y a pas plusieurs pages »* : une fiche est UN objet, la couper en deux inventerait un second écran |

⛔ **ET LA LOI GÉNÉRALE NE BOUGE TOUJOURS PAS** : *« un contenu qui ne tient pas : demander ce
qu'il porte EN TROP, jamais un défilement interne »* *(§1 quater)*. Ce qu'Eric borne est sa
**PORTÉE** — elle vise ce qui **pagine**. Sur un écran paginé, le trop-plein a un ailleurs où
aller ; sur une fiche, il n'en a pas, et la question *« qu'est-ce qui est EN TROP ? »* n'a pas de
réponse honnête.

📏 **LE FAIT QUI ATTENDAIT CETTE BORNE, mesuré par le lot 219** : `.x1-description` porte **180 blg
de boîte pour 400 de contenu**, soit **220 de débordement** ; `scrollTop` atteint 220 et le chevron
bas s'allume. ✅ **Ce n'est donc plus une dette, c'est conforme** — et le mode lecture de la fiche
*(l'œil, qui retire les trois rangées d'options pour rendre leur place au texte)* reste la réponse
« qu'est-ce qu'on porte EN TROP » **appliquée à l'intérieur de la fiche**, pas son contournement.

⛔ **LES DEUX GARDE-FOUS DU 03/09 RESTENT, ET ILS NE SE NÉGOCIENT PAS** : le geste ne fuit pas
*(`overscroll-behavior: contain`)*, et **ça se VOIT** *(deux chevrons dans la marge, allumés au
seul débordement — le haut compte autant que le bas)*. Une fiche qui défile sans le dire laisse
croire au joueur qu'il a tout lu.

---

## 4 quater ter. 🗂️ LE CATALOGUE À RAIL — B2 de Destiny *(mesuré au banc, 2026-09-03)*
📍 `cadre-catalogue-a-rail` · vivante · 03/09
⚖️ **Le catalogue à rail de Destiny › B2 est mesuré au banc : chaque nombre y est un relevé sur la page rendue, jamais une intention.**

> Eric, dans la nuit : *« juste une numérotation des arcanes à gauche »* · *« 8 tuiles tiennent
> TOUJOURS dans un écran »* · *« la dalle s'arrête 8 blg sous les boutons, centrée verticalement »*
> · *« cancel choose centrés, livre cadré à G, ? cadré à D »* · *« je veux que la dalle reste
> minimaliste, pas qu'elle recouvre tout l'écran »*.
> Chaque nombre ci-dessous est un **RELEVÉ** sur la page rendue, jamais une intention.

### 🔴 LA FICHE **EST** L'ÉCRAN FINAL — un seul organe, deux rangs
📍 `cadre-fiche-est-ecran-final` · vivante · ?
⚖️ **La fiche du catalogue EST l'écran final rendu par un gabarit qui RETIRE — ⛔ jamais un second écran qui recopie.**

⛔ **IL N'Y A PAS DE SECONDE MISE EN PAGE.** La fiche du catalogue est
`renderDestinyFinal({ gabarit: "apercu" })` : le MÊME rendu, à qui l'on **retire** le voyant, le
Destiny Score et la paire `Cancel / Next`, et que l'on dézoome.
⭐ **Un gabarit qui RETIRE, jamais un écran jumeau qui recopie** : le jour où l'écran final bouge,
la fiche bouge avec lui. Deux écrans qui montrent la même chose se corrigent deux fois, et
divergent la fois où l'on oublie — c'est ce que le garde du lot 60 interdit aux catalogues, et
`renderArcanaCardBody` (retiré) vivait ici sans que personne le nomme.

### 📐 LA CHAÎNE DES COTES — chaque maillon tombe de son voisin
📍 `cadre-chaine-cotes` · vivante · ?
⚖️ **Chaque cote du catalogue se DÉDUIT de sa voisine — tuile 64, rail 72, fiche 287, dézoom 0,765 — et c'est le mot le plus large qui commande la largeur, pas le nom.**

    tuile      64      Temperance (59), le mot le plus large des 22
    rail       72      8 de rembourrage + 64
    fiche     287      375 − 72 − 2×8
    dézoom  0,765      287 / 375                    ← garde I refait la division

🔴 **CE N'EST PAS LE NOM QUI COMMANDE LA LARGEUR, C'EST LE MOT LE PLUS LARGE**, et ce renversement
est *tout* ce qui rend le nom écrit abordable : *The High Priestess* sur une ligne coûte **107** blg
— plus cher que la vignette de 90 qu'on remplaçait. Dès qu'on autorise le retour à la ligne, la
contrainte passe à **Temperance (59)**. ⭐ Et **trois étages suffisent** : aucun des 22 noms ne fait
plus de trois mots.

### 🧲 HUIT CRANS PAR ÉCRAN, PAR CONSTRUCTION
📍 `cadre-huit-crans-par-ecran-par-construction` · vivante · ?
⚖️ **Le cran d'aimantation se DÉRIVE de la piste — `(piste − 7 écarts) / 8` — et le rembourrage vaut l'écart ; une hauteur écrite ne tiendrait que par coïncidence.**

    piste = (panneau − ceinture) − rembourrage haut = 500 − 4 = 496
    cran  = (piste − 7 écarts) / 8                  = (496 − 28) / 8 = 58,5

⛔ **UNE HAUTEUR ÉCRITE TIENT PAR COÏNCIDENCE** : à 56, la piste offrait 484 pour un pas de 60, soit
**8,07** crans — douze blg du neuvième dépassaient. Dérivée, elle ne peut plus être fausse.
📌 **UN REMBOURRAGE PLUS LARGE QUE L'ÉCART OUVRE UNE FENÊTRE SUR LE VOISIN.** À 8 en haut, après un
glissé, **4 blg du cran précédent** reparaissaient : l'aimant pose le cran courant à 8, celui d'avant
finit un écart plus tôt. **Rembourrage = écart.** Les deux bouts disaient la même chose.
⚖️ `scroll-snap-type: y **mandatory**` et `scroll-snap-align: **start**` — `proximity` ne recale que
si l'on s'immobilise déjà presque en place, et `center` coupe les DEUX extrémités.

### 🪟 LA DALLE — libre, et jamais tout l'écran
📍 `cadre-dalle-libre-et-jamais-tout-ecran` · vivante · ?
⚖️ **La dalle du catalogue a une hauteur `auto` — elle vaut son contenu et grandit vers le bas ; c'est la RANGÉE qui garde ses 500 et qui fait le cran.**

| | |
|---|---|
| hauteur | **`auto`** — elle vaut son contenu, de `273` à `373` |
| la rangée | garde ses **500** : c'est elle le cran d'aimantation, la dalle s'y centre |
| écarts autour des boutons | **`8`** au-dessus, **`8`** en dessous |

⛔ **DEUX RÉGLAGES ONT VÉCU ICI ET SONT TOMBÉS AVEC LEUR CAUSE** : une hauteur figée (`312px`, un
littéral qu'aucun garde ne surveillait) et un `margin-top: auto` qui faisait **descendre le titre de
34 blg** sur les cartes courtes. ⭐ Le titre est stable parce que la dalle grandit vers le **bas**,
pas parce qu'on pousse le mou ailleurs. **Une hauteur qu'on n'écrit pas ne peut pas devenir fausse.**

### 🎛️ LA RANGÉE DE BOUTONS — quatre organes, une grille
📍 `bouton-rangee-boutons` · vivante · ?
⚖️ **Les quatre organes de la rangée ont chacun leur colonne (`--touch | 1fr | 1fr | --touch`) : deux organes dans une même cellule s'empilent, et ⛔ aucun ne se sort du flux.**

    grid-template-columns: --touch | 1fr | 1fr | --touch
    livre → 1     Choose → 2 (fin)     Cancel → 3 (début)     ? → 4

🔴 **UN ÉLÉMENT EN `position: absolute` N'A AUCUN RAPPORT AVEC SES VOISINS**, seulement avec sa
boîte. Livre et `?` avaient été sortis du flux pour que la paire reste centrée quand le `?` manque —
ils cessaient donc de pousser, donc de repousser : ils se laissaient **recouvrir**.
⚔️ **MESURÉ EN TRADUISANT LES LIBELLÉS** (« Choisir cette carte » / « Annuler mon choix ») :
recouvrement de **81 blg**, et la paire sortait de la dalle de 29 et 37. Il n'y avait qu'**1 blg** de
jeu en anglais. Après la grille : `4` et `4`, aucun chevauchement.
⛔ **TROIS COLONNES NE SUFFISENT PAS** — `Cancel` dans la colonne du `?` s'y **empile** (−77 mesuré).
Deux organes dans une même cellule ne se poussent pas, ils se superposent : *la grille ne répare que
ce qu'on lui donne à séparer.* Les deux `1fr` du milieu sont égaux, c'est **eux** qui centrent.
⚖️ La rangée vaut **44**, comme sur les quatre autres écrans, et les 8 du bas viennent du
rembourrage de la **dalle** — pas du sien. *Un écart identique obtenu par un autre écrivain n'est
pas le même écart : il se comporte différemment dès qu'autre chose bouge.*

### 🎨 CE QUE LE RANG CHANGE, ET RIEN D'AUTRE
📍 `cadre-ce-que-rang-change-et-rien-autre` · vivante · ?
⚖️ **Le RANG décide de ce que l'écran montre et d'où mène son retour ; ⛔ aucun état n'est retenu — un rang se lit, il ne se mémorise pas.**

> ✍️ **VOCABULAIRE RECOUSU LE 2026-09-07** : ce tableau disait *« SB2 (l'écran final) »*. Depuis le
> 06/09, l'écran final de Destiny est un **`R2`** — `vocabulaire-r-de-depart-r-d-arrivee` le nomme
> nommément parmi ses deux usages établis. ⛔ `SB2` n'est pas faux comme RANG, il est **périmé pour
> cet écran-là** : le chiffre y nomme désormais un TEMPS de la racine, pas une page du chemin de
> choix. ⭐ *Un vocabulaire renversé laisse derrière lui des tableaux qui n'ont rien fait de mal — et
> que rien ne signale.*

| | B2 (l'aperçu) | R2 (l'écran final) |
|---|---|---|
| voyant · Score · `Done` | ⛔ absents | ✅ présents |
| vibrations | **inertes**, encre de corps | liens `--lien`, popup |
| fenêtres de prose | **libres** | plafonnées à 4 lignes, défilantes |
| le retour | `Cancel` → le **R** | `Cancel` → **B2** |

🔴 **LE PLAFOND DE PROSE RESTE VITAL EN R2** : c'est lui qui fait tenir les 22 cartes dans les
500 blg — la pire y est à **498**. Le lever là-bas casserait le budget ; l'aperçu, lui, flotte dans
une rangée de 500 et peut grandir.
⭐ **LE RANG DÉCIDE, AUCUN ÉTAT N'EST RETENU.** Le même bouton mène à deux endroits selon le rang où
il est rendu — pas selon d'où l'on vient. Un rang se lit, il ne se mémorise pas, donc aucun chemin
tordu ne peut le mettre en défaut.

### 🚫 UN SEUL VOILE
📍 `cadre-seul-voile` · vivante · 27/08
⚖️ **Un seul voile : la DALLE peint ses 35 %, la rangée qui la porte est nue.**

La **rangée** est nue (`catalogue-card`, aucun fond, aucune ombre) ; seule la **dalle** peint ses
35 %. ⛔ Elle portait `dalle-intermediaire` — un reste juste devenu faux : quand la rangée ÉTAIT la
fiche, le régime d'une dalle avait du sens ; depuis que le corps rend la sienne, c'était une plaque
sous une plaque. 📌 **Aucune règle n'était fausse le jour où elle a été écrite. C'est le contexte qui
a bougé sous elle, et rien ne le signale.**

### 🗂️ LE RANG X — LA FICHE D'UN OBJET, ET ELLE NE S'INSCRIT PAS DANS LE BELT
📍 `cadre-rang-x-fiche-d-un-objet` · vivante · 17/09
⚖️ **Un écran de rang `X` est la fiche d'UN objet : il recouvre toute la dalle, le belt reste, et ⛔ il n'écrit JAMAIS la 3ᵉ ligne de la ceinture.**

> Eric, 16/09 : **« les x ne s'inscrivent pas dans le belt »** · **« maintenant, clic droit ou tap
> sur un token doit produire une fiche X1 »**.

⭐ **`X` EST UN RANG, PAS UN NOM DE PAGE** — il entre dans la famille `R` · `B` · `SB`, et il s'écrit
comme eux : **« Équipement › X1 »**, jamais « X1 » seul. Ce qu'il ajoute au vocabulaire est un rang
qui **ne se range pas dans le chemin** : on n'y descend pas depuis un `R` par une porte, on l'ouvre
en TAPANT une chose — un jeton — et on la referme pour retrouver exactement l'écran qu'on avait.

⚖️ **CE QUE LE RANG X DÉCIDE** — et il ne décide rien d'autre :

| | ce qu'un rang X fait |
|---|---|
| la dalle | il la recouvre **entière** (375 × 500), le belt reste **visible et inchangé** |
| la 3ᵉ ligne du belt | ⛔ **jamais écrite** — elle continue de dire le lieu d'où l'on vient |
| le retour | il **ferme** et rend l'écran d'avant ; ⛔ il ne recule d'aucune étape |
| l'état | **aucun ne survit** à sa fermeture : ce qu'il change, il l'écrit au document |
| le livre et le `?` | ⛔ **ni l'un ni l'autre** — Eric, 17/09 : *« pas de livre ni de ? »* |

⛔ **ET LA TRILOGIE NE LUI EST PAS DUE.** La règle *« livre · boutons majeurs · `?` est DUE à
tout écran »* vise un écran du PARCOURS, où le joueur avance et peut avoir besoin d'aide ou du
livre. Une fiche de rang X n'est pas une étape : elle s'ouvre sur UNE chose, elle la montre, elle
se ferme. ⭐ Le `?` parle de l'écran d'où l'on vient, et il y est déjà ; le livre parle du jeu, et
la fiche n'est pas une porte vers le jeu. Eric l'a tranché en cinq mots le 17/09, et c'est
l'exception argumentée que la trilogie prévoit.

🔴 **POURQUOI L'ABSENCE D'ÉCRITURE EST UNE LOI ET PAS UN DÉTAIL.** La 3ᵉ ligne dit *où l'on est*. Une
fiche d'objet n'est pas un lieu : elle est ce qu'on regarde SANS quitter le lieu où l'on est. Le jour
où elle s'y inscrirait, le joueur qui la ferme retrouverait une ceinture qui parle d'un écran qu'il
ne voit plus. ⭐ En code, la loi tient à une seule chose, vérifiable : **le rang X n'a pas de mot
dans la table des fenêtres** (`FENETRE_DE`, `equipment-step.mjs`) — et c'est le garde de X1 qui le
tient (`tests/x1-ecran.test.mjs`, « 8 »).

⛔ **ET SON RETOUR NE DIT PAS `Back`.** Le mot appartient à la coquille, qui seule le pose
(`bouton-la-classe-et-le-verbe-font-l-organe`, la table des mots : *« `Back` — `shell.mjs` seul —
🔒 exclusif »*). Une fiche qui ferme **ne recule de rien** : son mot est **`Close`**,
celui qu'Eric a ratifié le 07/09 pour la fenêtre d'information d'un jeton. ✅ **ET IL L'A RATIFIÉ UNE
SECONDE FOIS, POUR X1, LE 17/09** — *« le close est très bien »*. Le croquis de X1 écrivait « back » ;
la loi du dépôt l'emporte, et ⛔ **la question est close** : elle ne se rouvre pas dans un lot.
⭐ Ce que la ratification confirme au-delà du mot : `Close` est désormais le mot des QUATRE fermetures
du produit — les popups de Class, de Species, de Skills, et la fiche de rang X.

### 🪨 LE SOL ALLÈGE, LA CORBEILLE DÉTRUIT — ⛔ ET L'UN NE REMPLACE PAS L'AUTRE
📍 `equipement-sol-allege-corbeille-detruit` · vivante · 17/09
⚖️ **Le sol est un LIEU qui ALLÈGE : l'objet posé reste au document et sur l'écran R, il sort seulement du calcul de poids. La corbeille, elle, DÉTRUIT, derrière un avertissement.**

> Eric, 2026-09-17 : **« la corbeille détruit »** · **« ground c'est juste pour que le joueur puisse
> poser un item trop lourd et voir l'incidence sur sa carrying capacity. ground = exclu du calcul de
> poids. mais ça ne part pas à la poubelle, les subtilités se règlent en jeu »** · **« l'item reste
> sur la fiche, mais ne compte pas en poids »** · **« trash détruit, prompt de warning quand poussé »**.

| le geste | ce qu'il fait au poids | ce qu'il laisse |
|---|---|---|
| **poser au sol** (`location: "ground"`, les deux cases de R) | l'objet **sort** du poids porté | il RESTE — au document, sur R, repris d'un geste |
| **`Trash`** | plus rien à peser | **rien** : cinq chemins effacés, d'où le popup rouge de la famille défaire (§6) |

⛔ **LE SOL N'EST DONC PAS UNE CORBEILLE DOUCE, ET LA CORBEILLE NE POSE RIEN AU SOL.** Deux organes,
deux gestes, aucun recouvrement. ⭐ Et le produit n'arbitre pas ce qu'un objet posé devient à la
table : *« les subtilités se règlent en jeu »* — poser, c'est retirer un poids, pas raconter une
histoire.

🔴 **J'AI ÉCRIT ICI, LE 17/09, QU'AUCUN CALCUL DE POIDS N'EXISTAIT. C'ÉTAIT FAUX, ET VOICI
COMMENT.** J'avais cherché `carrying` et `encumbr` — les mots de la RÈGLE — et conclu de leur
absence que la chose n'existait pas. ⛔ **Un grep qui ne trouve pas prouve que le MOT est absent,
jamais que la CHOSE l'est.** `poidsParLieu` (`equipement-pipeline.mjs`) somme les poids depuis le
24/08, par lieu, et les écrans de sacs l'affichent sous le titre *« Gear weight »* — trois lignes,
`Self` · `Backpack` · `Storage`, avec le compte des objets dont le poids est inconnu.

✅ **CE QUI EXISTE, MESURÉ CETTE FOIS EN LISANT LE CODE** : un **total par lieu**, affiché.
⛔ **CE QUI N'EXISTE PAS** : la **capacité de charge** — le plafond auquel comparer ce total. C'est
elle que la règle d'Eric attend, et elle seule.

⚠️ **ET LE SOL EST DÉJÀ HORS DU COMPTE, MAIS PAR ACCIDENT — pas par décision.** `poidsParLieu`
déclare trois seaux (`self`, `backpack`, `storage`) ; une ligne au sol tombe dans un quatrième que
personne n'a déclaré, et le panneau ne lit que les trois premiers. ⭐ Le résultat est JUSTE
aujourd'hui et il est FRAGILE : il tient à ce que personne n'ajoute une ligne « Ground » au panneau.
➡️ Le jour où la capacité se calcule, `ground` s'exclut **par une clause écrite**, pas par un seau
oublié — et ce jour-là un garde la tient. ⛔ Ne pas la redécouvrir, ⛔ ne pas la rediscuter.

---

### ⚖️ LE POIDS DE JEU — LE PLANCHER, LE ZÉRO, ET CE QU'ILS NE DISENT PAS PAREIL
📍 `equipement-poids-plancher-et-zero` · vivante · 23/09
⚖️ **Un poids se lit, puis s'arrondit à `0,1 lb` en anglais et se relève au plancher `0,1 lb` ·
`50 g`. Un `"—"` prend le plancher. Un `"Varies"` vaut `0`, et ce zéro est la marque de ce qui
n'a pas encore été édité.**

> Eric, 2026-09-23, en quatre temps : **« arrondit les poids, le plancher est 0,1 lb, tout est
> arrondi au 0,1 près »** · **« en français ce sera 50 g — notre système métrique permet d'avoir
> plus de fluidité, on aura des g et des kg »** · **« poids varies = 0 jusqu'à ce qu'on l'ait
> édité »** · du tiret : **« Candle, Ink Pen, Paper, String, Signal Whistle, Vial, Sling, les deux
> Spell Scrolls, applique le 0,1 lb »**.

| ce que la source écrit | ce que ça pèse | `origine` |
|---|---|---|
| `"1 lb."` · `"250 g"` | la valeur lue, arrondie puis relevée | `lu` |
| `"—"` *(18 objets)* | **le plancher** — 0,1 lb ou 50 g | `plancher` |
| `"Varies"` *(5 objets)* | **0**, et l'objet reste compté dans `inconnus` | `a-editer` |

🔴 **LE PLANCHER EST NATIF DE CHAQUE SYSTÈME — CE N'EST PAS UNE CONVERSION.** `0,1 lb` vaut
**45,36 g**, pas 50. Chaque édition porte le nombre **rond de sa propre unité**, ce qui prolonge
exactement la loi déjà écrite dans `equipement-pipeline.mjs` : *« la livre et le kilo ne se
convertissent JAMAIS l'un dans l'autre ici »*. ⛔ Convertir le plancher rouvrirait cette porte-là.

⛔ **ET LE ZÉRO N'EST PAS LE PLANCHER — c'est toute la finesse de la règle.** Un objet **pesé** ne
descend jamais sous le plancher ; un objet **à éditer** ne l'atteint jamais. `0` veut dire *« à
faire »*, `0,1 lb` veut dire *« pesé, et léger »*. Le livre ne dit pas « inconnu » quand il écrit
`—`, il dit **négligeable** — et négligeable n'est pas zéro. Les deux se distinguent à l'œil, sur
l'écran comme dans le code.

⚠️ **CE QUE CETTE RÈGLE CHANGE DANS LE CODE, ET IL FAUT QUE CE SOIT DIT.** `equipement-pipeline.mjs` portait
l'inverse, écrit noir sur blanc : *« "—" et "Varies" rendent null — ce sont des faits de la source,
**pas des zéros** »*, et `poidsParLieu` les jetait tous deux dans `inconnus`. La parole du
propriétaire est la plus récente et elle gagne. ⭐ **Le parseur, lui, n'a pas changé de loi** :
`parsePoids` LIT toujours `null` sur ces deux chaînes. C'est la **lecture** qui est neuve, et elle
vit dans `poidsDeJeu`, à un endroit qu'on peut nommer — pas dans le parseur, qui reste pur.

⏳ **CE QUI N'EST PAS TRANCHÉ ET NE DOIT PAS ÊTRE INVENTÉ : le PAS métrique.** Eric a donné le
plancher (`50 g`) et les unités (*« des g et des kg »*), **jamais un pas d'arrondi**. `PAS_ARRONDI.kg`
vaut donc `null` : un kilo lu est gardé tel quel. ⛔ Poser 50 g déplacerait `Dart` de **125 g à
150 g** — une valeur du livre, changée sans qu'on l'ait demandé.

📏 **CE QUE LA RÈGLE DÉPLACE, MESURÉ** : côté anglais, **une seule valeur du livre bouge** — `Dart`,
`1/4 lb.` → **0,3 lb**. Côté français, **aucune** : le minimum y est `125 g`, très au-dessus du
plancher. Sur les 416 objets rangés, les manques de poids tombent de **281 à 213**.

---

### ⚒️ LE POIDS D'UN OBJET MAGIQUE EST CELUI DE SA BASE MONDAINE
📍 `equipement-poids-herite-de-la-base` · vivante · 20/09
⚖️ **Un objet magique qui désigne une arme ou une armure non magique pèse le poids de cette base,
lue dans son champ `subtype`.**

> Eric, 2026-09-20 : **« pour SRD, tous les items qui font référence à un item non magique, arme
> armure, même poids que l'item non magique. Tu mets le poids »** — adaptation SRFH, sa logique.

Le SRD ne l'écrit pas, mais une *Adamantine Armor* n'est rien d'autre qu'une armure, et une armure
a un poids. Quand le `subtype` ouvre un **choix** (*« Any Simple or Martial »*, 28 bases ·
*« Glaive, Greatsword, Longsword… »*), le poids est celui de la base **choisie**, et la fourchette
est connue : *Defender* pèse de **1 à 18 lb** selon l'arme.

📏 **50 objets sur 52 sont servis** — `magic-armor` passe de 19 manques à **0**, `magic-weapons` de
33 à **2**. ⚠️ **Les deux qui résistent ne sont pas un échec de la règle** : *Ammunition, +1/+2/+3*
et *Ammunition of Slaying* héritent bien de `gear:ammunition`, mais **cette base porte elle-même
`"Varies"`**. Il n'y a rien à hériter tant que les 5 munitions typées ne sont pas écrites en amont
dans `fh-srd`.

⛔ **CE QUE LA RÈGLE N'ATTEINT PAS, ET C'EST NORMAL** : `marvels` (149 objets) n'a **aucun** objet
qui désigne une base mondaine — un *Bag of Holding* n'est l'agrandissement de rien.

---

### 🔨 LE SOULFORGING PÈSE CE QUE PÈSE LA TROUSSE DU BRICOLEUR
📍 `equipement-poids-soulforging-tinker` · vivante · 23/09
⚖️ **L'outil `fh:tool:en:soulforging` porte le poids de `srd:tool:en:tinker-s-tools` — `10 lb.` en
anglais, `5 kg` en français. Son prix reste `"Varies"`.**

> Eric, 2026-09-23 : **« soulforging tools = idem poids tinkering tools, tout le reste = varies »**.

Les deux poids sont **lus dans le livre**, chacun dans son édition, ⛔ jamais l'un converti depuis
l'autre — même loi que le plancher, un cran plus haut. Le prix n'a pas été tranché : il reste
`"Varies"`, donc **0 jusqu'à édition**, et on ne lui invente pas les 50 GP de la trousse.

⏳ **ET LES ONZE AUTRES OUTILS FH RESTENT `"Varies"`.** ⚠️ Aucun des douze n'est **rangé** : ils ne
portent pas de `shelf` et n'apparaissent donc sur aucune étagère de l'écran d'équipement. C'est un
trou séparé, et il n'est pas tranché.

🔴 **LES TROIS JEUX PÈSENT, ET LEUR POIDS EST UNE DÉCISION D'ERIC — PAS UNE TABLE RECOPIÉE.**
`gen-fh-skills-layer.mjs` posait `cost` et `weight` = `"Varies"` sur tout outil qui `inherits`. Or
`"Varies"` vaut désormais **0** : trois jeux à 0 dans un sac, c'est un sac qui ment.

| jeu | poids | pourquoi ce nombre |
|---|---|---|
| **Card Set** | `1 lb.` | un paquet de cartes |
| **Three-Dragon Ante** | `1 lb.` | ⭐ **jeu de CARTES** — le nom ne dit pas la matière, le jeu si |
| **Dragonchess Set** | `2 lb.` | ⭐ **plateau et pièces** : ça pèse plus qu'un paquet |

⛔ **DEUX SOURCES ONT ÉTÉ MESURÉES, ET LA LOI §0.8 LES REFUSE TOUTES DEUX.** Les livres du joueur
chiffrent chaque jeu *(contenu WotC hors SRD)* ; le **Pathfinder Reference Document** aussi
*(`Cards 1 lb.` · `Board game 2 lbs.`)* — mais il est publié sous **OGL 1.0a**, et §0.8 dit *« ni
tiers **non-CC** »*. ⭐ **La seconde source n'était pas plus admissible que la première : elle
changeait seulement le nom de la licence qui la refuse.**

✅ **CE QUI EST ÉCRIT DANS LA COUCHE EST DONC UN NOMBRE D'ERIC**, porté par sa `weight_provenance`,
exactement comme les poids des 54 gemmes *(`"Eric, 2026-09-08"`)*. ⭐ Les références ouvertes ont
servi à **choisir** le nombre, jamais à le **fournir** — et c'est la différence que §0.8 mesure.

### 💎 UNE GEMME SOUS 50 PO NE PORTE PAS L'OPTION DE CRAFT
📍 `equipement-gemme-sous-le-seuil` · vivante · 23/09
⚖️ **L'option de craft d'une gemme — celle qui en fait un Soulgem — n'apparaît QUE si la gemme
vaut au moins 50 po. ⛔ Pas une option grisée : pas d'option.**

> Eric, 2026-09-23 : **« les gemmes FH ont une option craft intégrée, après avoir lancé [le sort],
> préciser rareté (inférieur ou égal à la valeur de la gemme), type de créature = soulgem »**, puis,
> sur le bord de l'échelle : **« les gemmes de 10 po n'ont pas l'option craft »**.

📏 **CE QUE LA SUPERPOSITION DES DEUX TABLES DONNE** — les 12 paliers de gemme contre l'échelle PP
du chapitre *(`Soulforge Crafting`, « Min gem »)* : **chaque palier ouvre exactement un cran de
plus**, terme à terme.

| palier | valeur | PP max |
|---|---|---|
| **Common Gems ×5** | **10 po** | ⛔ **aucun** |
| Ornamental | 50 po | 1 |
| Fine · Rare · Precious · Superb | 100 → 750 po | 2 · 3 · 4 · 5 |
| Exceptional · Sublime · Legendary | 1 000 → 5 000 po | 6 · 7 · 8 |
| Masterwork · Royal · Sovereign | 10 000 → 50 000 po | 9 · 10 · 11 |

⭐ **LE DROPDOWN N'A DONC RIEN À FILTRER** : le palier de la gemme **dit** le maximum. Une liste
qu'on coupe à l'usage se trompe le jour où l'échelle bouge ; une borne lue sur la pierre, non.

⛔ **ET L'ABSENCE VAUT MIEUX QUE LE GRIS.** Une option grisée promet qu'un jour elle s'ouvrira ;
une option absente dit que **cette pierre n'est pas de cette famille-là**. Les *Common Gems* à 10 po
sont des marchandises : elles se vendent, elles ne se forgent pas. ⏳ **Elles étaient cinq, elles
sont trois** depuis la coupe du 23/09 — *Rhodonite, Azurite, Hematite* ; la règle vaut pour le
palier, pas pour des noms, donc elle ne bouge pas avec eux.

✅ **ET LE SORT S'APPELLE `Transfer Essence` — TRANCHÉ PAR ERIC LE 2026-09-23.** La question était
ouverte : il avait dit *« infuse gem »* le matin, et ce nom n'existait ni dans la couche
(`fh:spell:en:transfer-essence`, niveau 1, dans `fh-soulforging-en`) ni dans le manuscrit. Sa
réponse : **« transfer essence »**. ⛔ *« Infuse Gem »* ne s'écrit nulle part — pas dans un
écran, pas dans un artefact, pas dans une note. **Un seul nom circule.**

---

### 📦 UNE MUNITION SE VEND PAR DIX — SANS EXCEPTION
📍 `equipement-paquets-de-munitions` · vivante · 23/09
⚖️ **Toutes les munitions se vendent par DIX : les cinq mondaines, la munition à bonus, celle de
mise à mort. ⛔ Aucune exception.**

> Eric, 2026-09-23 : **« on statue sur 10 pour les munitions classiques et sur 5 pour les autres,
> comme arrow of slaying »**, puis, aussitôt : **« attends, on fait par 10 pour tout ! »**.

⭐ **LE DIX N'EST PAS UNE INVENTION, ET LE SRD LE DIT DEUX FOIS.** `Ammunition, +1, +2, or +3`
porte, mot pour mot : *« This ammunition is typically found or sold in quantities of **ten or
twenty** pieces »* — Eric retient le premier des deux. Et la phrase suivante **confirme le prix par
un second chemin** : *« **Ten pieces** of this ammunition are **equivalent in value to a potion of
the same rarity** »*. Dix flèches +1 valent donc 400 gp — exactement ce que `srd:item-value` donne
pour Uncommon. ⭐ **Deux raisonnements indépendants, le même nombre.**

⛔ **POUR L'AMMUNITION OF SLAYING, LE LIVRE SE TAIT** — la phrase « ten or twenty » ne vaut que
pour la munition à bonus. Le dix y est donc une **décision d'Eric**, et elle a été prise *contre*
un cinq posé quelques minutes plus tôt. ⭐ **Une exception qui ne sert qu'un seul record coûte plus
cher à retenir qu'à supprimer** : la règle sans exception se tient dans une phrase, celle avec un
cas particulier demande qu'on se souvienne duquel.

📏 **ET LE LIVRE APPARIE DÉJÀ MUNITION ET POTION** — *« equivalent in value to a potion of the same
rarity »*. ⭐ La règle du consommable *(prix et temps de production divisés par deux)* les traite
donc pareil **parce que le SRD les avait appariées le premier**, pas par commodité.

⏳ **CE QUE CE TEXTE ENTROUVRE, ET QUI N'EST PAS TRANCHÉ** : *« Once it hits a target, the
ammunition is no longer magical »*. Un paquet de dix n'est pas un objet qui s'use — ce sont **dix
charges à usage unique**. Le jour où le sac devra décompter les flèches restantes, `pack` devra
devenir une **quantité** et non plus la seule marque `×10` du jeton. ⛔ Eric a dit *« uniquement
pour acheter »* : donc pas aujourd'hui.

---

### 💰 LE PRIX ET LE TEMPS D'UNE RECETTE — UNE DIVISION, ET UNE ÉCHELLE D'ERIC
📍 `equipement-prix-et-temps-du-craft` · vivante · 23/09
⚖️ **Le prix de vente est celui du SRD. Le coût de production est sa MOITIÉ. Le temps suit
l'échelle d'Eric. ⭐ Et un CONSOMMABLE divise les deux par deux.**

> Eric, 2026-09-23 : **« work time on change — common 2 days, uncommon 4 days, rare 10 days, very
> rare 30 days, legendary 100 days »**, puis **« on divise par deux le temps et le prix de
> production des consumables. Règles FH »**.

| rareté | vente *(SRD)* | production | temps | ⭐ **consommable** | |
|---|---|---|---|---|---|
| **Common** | 100 gp | 50 gp | 2 j | **25 gp** | **1 j** |
| **Uncommon** | 400 gp | 200 gp | 4 j | **100 gp** | **2 j** |
| **Rare** | 4 000 gp | 2 000 gp | 10 j | **1 000 gp** | **5 j** |
| **Very Rare** | 40 000 gp | 20 000 gp | 30 j | **10 000 gp** | **15 j** |
| **Legendary** | 200 000 gp | 100 000 gp | 100 j | **50 000 gp** | **50 j** |

🔴 **LA VENTE NE S'INVENTE PAS : LE SRD LA PORTE DÉJÀ.** `srd:item-value` — *Magic Item Rarities
and Values* — donne les cinq valeurs, sous **CC-BY**. Le builder ne l'exploitait pas encore.
⭐ **Et il porte aussi la règle du coût de base**, mot pour mot : *« If a magic item incorporates an
item that has a purchase cost, ADD that item's cost. For example, +1 Armor (Plate Armor) has a
value of 5 500 GP = 4 000 (Rare) + 1 500 (Plate Armor) »*. C'est exactement la première ligne du
panneau du croquis — **la donnée sait déjà faire ce calcul**.

📏 **POURQUOI LA MOITIÉ, ET PAS UN AUTRE RAPPORT.** Mesuré sur les cinq paliers : la table de craft
du DMG donne `50 · 200 · 2 000 · 20 000 · 100 000`, soit **exactement la moitié** de la valeur SRD,
**cinq fois sur cinq, au gp près**. ⭐ **Conséquence, et elle règle la licence** : il n'y a rien à
importer. Le SRD porte la vente ; la production est une **division** qu'Eric pose. ⛔ La table du
DMG devient inutile — §0.8 n'a plus rien à refuser.

⛔ **LE TEMPS, LUI, NE SE DÉRIVE DE RIEN, ET C'EST POURQUOI ERIC LE POSE.** Aucun record du SRD ne
porte de temps de fabrication *(balayé sur les 18 genres : trois occurrences, toutes de la prose de
sort)*. Et aucune formule ne relie le temps au prix — les prix montent en ×4 puis ×10, le temps en
×2 · ×2,5 · ×3 · ×3,33. ⭐ **L'échelle `2 · 4 · 10 · 30 · 100` est une décision Fate's Hand**, et
elle remplace les *workweeks* `1 · 2 · 10 · 25 · 50` du DMG.

📌 **CE QU'EST UN CONSOMMABLE — TROIS FAMILLES, NOMMÉES PAR ERIC** : *« consumables : projectiles
magiques, potions, parchemins »* (23/09). **27 objets**, et ⛔ **ils ne se lisent pas tous au même
champ** :

| famille | combien | où ça se lit |
|---|---|---|
| **potions** | 24 | `category: "potion"` |
| **parchemins** | 1 | `category: "scroll"` — *Spell Scroll*, la famille entière dans un jeton |
| **projectiles magiques** | 2 | ⚠️ `category: "weapon"` — il faut lire le **`subtype`** : `"Any Ammunition"` |

🔴 **ET C'EST LE PIÈGE DE CETTE RÈGLE.** *Ammunition +1/+2/+3* et *Ammunition of Slaying* sont
rangées parmi les **armes** par leur catégorie ; seul leur `subtype` dit que ce sont des munitions.
⛔ Un filtre sur `category` seul les manquerait — et il les facturerait **le double** du prix voulu,
en silence. ⭐ La lecture se fait donc sur **deux champs**, jamais sur un.

⏳ **ET ON NE DEVINE PAS AU-DELÀ** : des objets merveilleux à usage unique existent *(Feather Token,
Elemental Gem…)*, mais le SRD ne les marque nulle part. Tant qu'Eric ne les nomme pas, ils ne sont
pas des consommables.

---

### ⏳ LE CRAFT ORDINAIRE NE DEMANDE AUCUN JET — SEUL LE SOULFORGING EN DEMANDE
📍 `equipement-craft-sans-jet` · vivante · 23/09
⚖️ **Le craft standard coûte du TEMPS et de l'ARGENT, rien d'autre : pas de DC, pas de jet, pas de
bouton `ROLL`. ⛔ Les jets appartiennent au Soulforging, et à lui seul.**

> Eric, 2026-09-23 : **« dans le crafting standard, pas de jets à faire »**.

🔴 **ET LE CROQUIS DU MÊME JOUR DISAIT AUTRE CHOSE.** Le panneau `CRAFTING` y portait
*« crafting roll DC 16 »* et un bouton `ROLL` à côté du temps de fabrication. ⭐ **Ils sortent** :
il reste les **prérequis**, le **temps** et les **cinq coûts** *(base item · ingrédients · crafting
· unit price · qty → total)*.

⭐ **ET C'EST CE QUI SÉPARE LES DEUX CHEMINS**, qui se ressemblaient dangereusement :

| | ce qu'on dépense | ce qu'on risque |
|---|---|---|
| **craft ordinaire** | du temps, de l'argent | **rien** — il aboutit |
| **Soulforging** | du temps, de l'argent, **et du sang** | **trois jets** : Study, Hunting, Soulforging Tools — et *« fail by 5 or more → everything is lost »* |

⛔ **Un bouton `ROLL` sur l'écran de craft ordinaire dirait donc le contraire de la règle** : il
promettrait un hasard qui n'existe pas, et il effacerait la seule chose qui rend le Soulforging
cher — le risque.

---

### 📐 LE JETON D'UNE RECETTE PORTE UNE DIAGONALE BLEUE
📍 `jeton-diagonale-de-la-recette` · vivante · 23/09
⚖️ **Un jeton de recette (*blueprint*) se reconnaît à une diagonale qui va du coin bas-gauche au
coin haut-droit : la moitié INFÉRIEURE DROITE est bleue. ⛔ Ce n'est PAS une cinquième marque.**

> Eric, 2026-09-23 : **« il faut mettre en évidence les tokens recettes (blueprints) […] je pense à
> une diagonale de bas en haut, moitié inférieure droite bleue »**, et, sur ce qu'est une recette :
> **« on ne va plus partir des items de base, on partira des recettes déjà données dans magic
> items »**.

🔴 **LA LOI DE LA BANDE N'EST PAS TOUCHÉE, ET C'EST CE QUI REND LA MARQUE POSSIBLE.** Les
**quatre marques** vivent dans la bande haute de 12 (`jeton-quatre-marques-de-la-bande`) ; la
diagonale est un **FOND**, sous le nom. Elle n'entre pas dans la bande, ne déplace pas le nom, et
ne prend aucune des quatre places. ⭐ **C'est une cinquième information sans être une cinquième
marque** — le seul endroit du jeton qui restait libre.

📏 **ET ELLE PASSE DERRIÈRE LE NOM, DONC ELLE SE MESURE.** Le contraste de `--text` :

| | sur `--sunken` *(le fond qu'elle remplace)* | sur `--jeton-recette` |
|---|---|---|
| **jour** `#c5d8ee` | 10,36:1 | **9,59:1** |
| **nuit** `#25344a` | 10,11:1 | **8,44:1** |

⭐ On perd **moins d'un point** et on reste très au-dessus du seuil. La règle de la maison —
*« chaque encre tient son seuil contre le PIRE fond qu'elle rencontre »* — vaut désormais contre
ce fond-ci aussi.

📐 **LE DESSIN, EN UNE LIGNE** : `linear-gradient(to bottom right, transparent 50%, var(--jeton-recette) 50%)`.
L'axe du dégradé est **perpendiculaire** à la diagonale voulue, et l'arrêt net à 50 % colore la
moitié qui va vers le bas-droit. ⛔ `to top right` donnerait l'autre moitié.

✅ **ÉCRIT, ET EN TROIS ENDROITS SEULEMENT** : `estRecette` dans `equipement-pipeline.mjs` *(la
dérivation)*, `.jeton-recette` dans `jeton-objet.mjs` *(le fond, posé AVANT le nom — l'ordre du DOM
évite un `z-index` qu'il aurait fallu accorder avec les quatre marques)*, et la règle CSS dans
`shell.css`. ⭐ **L'écran R et le sac n'ont pas été touchés** : ils portent le même organe de
jeton, et deux copies divergeraient à la première marque ajoutée.
⛔ **LE DRAPEAU NE PORTE AUCUNE LISTE DE NOMS** — `estRecette` lit deux signaux de la donnée : la
`category` *(weapon, armor)* et le **marqueur de famille dans la rareté**. Une liste par nom serait
périmée au premier ajout.
♿ **ET LE LECTEUR D'ÉCRAN L'ENTEND** : `motDuJeton` dit *« recipe »* en toutes lettres. Une couleur
que rien ne prononce est une information réservée aux voyants.

📋 **LES 59 JETONS QUI LA PORTENT.**
⚖️ **Une recette est une entrée d'objet magique du catalogue — plus une composition à partir d'une
base mondaine.** *(Eric, 23/09, renversant le croquis du même jour.)*

| type de craft | jetons | où |
|---|---|---|
| **Craft Weapon** | **33** | `armory › magic-weapons`, en entier |
| **Craft Armor** | **19** | `armory › magic-armor`, en entier |
| **Craft Wondrous** | **6** | ⛔ **les recettes seulement** — Belt of Giant Strength · Feather Token · Figurine of Wondrous Power · Horn of Valhalla · Ioun Stone · Wand of the War Mage |
| **Scribe Scroll** | **1** | Spell Scroll |
| | **59** | **aucun doublon** |

⛔ **`Brew Potion` est retiré** *(« potions inutile »)* et **le Soulforging passe par une autre
voie** : il n'entre pas dans cette fiche.

⭐ **POURQUOI SIX WONDROUS ET PAS 181** : Eric — *« uniquement les recettes, items fourre-tout en un
comme figurine of wondrous power »*. 📏 **Le signal est la RARETÉ, pas la prose** : le SRD écrit
`Rarity Varies` — ou énumère *« Rare (Silver or Brass), Very Rare (Bronze), Legendary (Iron) »* —
exactement quand l'entrée est une **famille**. ⚠️ Un filtre sur la prose sur-rapporte : il attrape
*Staff of Fire* et *Wand of Fear*, qui ont des tables de **sorts**, pas de variantes.

---

### 🏷️ « TABLE ITEMS » — LE MOT DU JOUEUR POUR CE QUI NE VIENT D'AUCUN LIVRE
📍 `equipement-table-items` · vivante · 23/09
⚖️ **Ce que le joueur lit s'appelle `Table items`. Le concept s'appelle **catalogue de table**.
⛔ « Homebrew » ne s'écrit nulle part où un joueur peut le lire.**

> Eric, 2026-09-23 : **« "Table items" probablement mieux oui »** — et, sur le geste qui le crée :
> **« when such an item is created, if non existent in wares, it goes in a group […] category in
> wares »**.

🔴 **LA QUESTION ÉTAIT OUVERTE DEPUIS LE 10/09.** Le lexique signé bannit « homebrew » —
*« fait maison = confusion »* — et pose `catalogue de table` pour le **concept**. Mais il laissait
une ligne en suspens : *« la place réservée "+ Homebrew content" de l'écran Layers porte le mot
banni ; "+ Table content" ? À trancher »*. ✅ **Tranché, et ce n'est ni l'un ni l'autre : `Table
items`.**

| où | ce qui s'écrit |
|---|---|
| l'écran `Layers`, place réservée | **`+ Table items`** |
| la catégorie de Wares où atterrit un objet fabriqué absent du catalogue | **Table items** |
| le concept, en prose | **catalogue de table** |
| ⚠️ `dataset.homebrew` dans le code | **inchangé** — clef de construction, pas un mot du joueur |

⭐ **LA DISTINCTION QUI TIENT TOUT** : `homebrew` reste admissible **là où le joueur ne lit pas** —
un nom de fichier, une clef de `dataset`, un commentaire. Il est banni **partout où un œil de
joueur passe**. Renommer la clef casserait un garde sans rien changer à l'écran.

---

### 🏹 LES CINQ MUNITIONS — UN JETON, UN PAQUET DE DIX
📍 `equipement-munitions-paquet-de-dix` · vivante · 23/09
⚖️ **Les cinq munitions typées existent enfin, chacune en paquet de dix, et les flèches
RÉÉCRIVENT le générique `gear:ammunition` au lieu de s'ajouter à côté.**

> Eric, 2026-09-23 : **« prends la base pathfinder, met en paquet de 10 »**, puis, sur ce que
> « par 10 » veut dire : **« tu achètes un item avec un ×10 marqué dessus »**.

| munition | armes | prix | poids |
|---|---|---|---|
| **Arrows** *(réécrit `ammunition`)* | arc court · arc long | `5 SP` | `1,5 lb.` |
| **Crossbow Bolts** | les trois arbalètes | `1 GP` | `1 lb.` |
| **Sling Bullets** | fronde | `1 SP` | `5 lb.` |
| **Blowgun Needles** | sarbacane | `5 SP` | `0,1 lb.` *(plancher)* |
| **Firearm Bullets** | mousquet · pistolet | `10 GP` | `0,2 lb.` |

⭐ **UN JETON = UN PAQUET.** `pack: 10` est la **marque** du jeton, pas une quantité possédée :
le joueur achète un objet qui porte ×10, il ne coche pas dix cases.

🔴 **LES FLÈCHES RÉÉCRIVENT LE GÉNÉRIQUE, ET C'EST LE PATRON DE `TOOLS_REWRITTEN`.** Garder
`gear:ammunition` à côté de ses cinq héritiers ferait **acheter des munitions deux fois** — la
faute exacte que le lot 185 a refusée pour le Dice Set. Le générique devient donc les flèches,
sous son id d'origine, et **garde l'étagère que `srfh` lui donne déjà**. Les quatre autres
portent leur propre rangement.

⛔ **LES CHIFFRES SONT D'ERIC, PAS UNE TABLE RECOPIÉE.** Le Pathfinder Reference Document est
publié sous **OGL 1.0a** ; §0.8 refuse *« tiers non-CC »* exactement comme elle refuse le PHB.
La référence a servi à **choisir**, jamais à **fournir** — chaque record porte sa `cost_provenance`
et sa `weight_provenance`.

⚠️ **CE QUE ÇA REMPLACE** : la table du vault du 21/08 *(flèches 5 pa · 0,5 lb, billes 2 pc ·
0,75 lb…)*. Un seul chiffre y survit — le prix des flèches, `5 SP` des deux côtés. Les billes
passent de **0,75 lb à 5 lb** : c'est un vrai changement de sensation en jeu, voulu.

✅ **ET LA FUSION DU 20/09 EST APPLIQUÉE EN AMONT — DANS LA BASE, PAS DANS UNE COUCHE.** Eric,
23/09 : *« les munitions vont dans Armory / Ranged Weapons »*, puis, en lisant le rapport de
construction, *« donc ammo et les autres projectiles, à mettre dans ranged weapons »*.

⛔ **LA PREMIÈRE VERSION NE SERVAIT QU'UNE PILE, ET C'ÉTAIT LE DÉFAUT.** Les cinq munitions de
Fate's Hand quittaient `projectiles` par `fh-munitions-en` — une couche **FH seulement**. La ligne
`Ammunition` du SRD, elle, y restait : la pile SRD seule gardait une étagère à un objet. Or Eric
avait tranché *« idem pour FH et SRD »* dès le 20/09. La fusion appartient donc à
`fh-srd/src/shelving.py`, que **les deux piles** lisent.

⭐ **ET L'ÉTAGÈRE EST RETIRÉE DE LA STRUCTURE, PAS LAISSÉE À ZÉRO.** `companions` et `crafting`
gardent des étagères vides parce qu'elles **seront** remplies ; `projectiles` ne le sera jamais.
⛔ **Une étagère déclarée qui n'attend rien est une promesse qui ment.**

| Armory | avant | après |
|---|---|---|
| `thrown-weapons` *(« Ranged Weapons »)* | 10 | **21** *(17 en pile SRD seule)* |
| `melee-weapons` | 28 | **22** |
| `projectiles` | 1 | **retirée de la déclaration** |
| sous-catégories | 6 | **5** |

⭐ **LE TOTAL N'A PAS BOUGÉ — 21 AVANT, 21 APRÈS — ET C'EST LA PREUVE.** Le déménagement a
seulement changé de main : ce que la couche FH faisait, la base le fait. Ce qui y gagne, c'est la
pile SRD seule, et elle ne se voit pas dans ce compte-là.

🔴 **ET C'EST LA RÉPARATION D'UN NOM QUI MENTAIT.** Eric, 23/09 : *« toutes les armes de jet, les
munitions vont dans cette catégorie »*, puis *« idem pour FH et SRD »*. ⛔ **`thrown-weapons` ne
contenait AUCUNE arme de jet** : ses dix records viennent de `derived:weapon.weapon_range` — arcs,
arbalètes, fronde, sarbacane, mousquet, pistolet. Les six vraies `Thrown` du SRD — **Dagger,
Handaxe, Javelin, Light Hammer, Spear, Trident** — dormaient chez les **mêlées**, parce qu'elles
frappent aussi de près. Le slug mentait sur son contenu depuis le lot 90.

⭐ **Le libellé « Ranged Weapons » couvre enfin les trois familles** : ce qu'on tire, ce qu'on
lance, et les munitions qui les alimentent.

⚠️ **CE PATCH MONTE DANS LES DEUX PILES**, sur le mot d'Eric — un rangement est SA classification,
pas une règle Fate's Hand : le joueur en SRD pur voit la même étagère. Il vit donc dans
`srfh-mecaniques-en`, *« ce qui est ambigu, ni le livre ni Fate's Hand »*.
📌 **Conséquence de montage à connaître** : `srfh-mecaniques-en` **dépend désormais de
`srfh-shelving-en`** — un patch dont la cible n'est pas sous lui est un échec bruyant (§L7.2).
Une seule pile du dépôt montait l'une sans l'autre ; elle décrivait une pile qui ne peut plus
exister.

⚠️ **LA CLEF RESTE `thrown-weapons`**, donc le tambour affiche encore *« Thrown Weapons »* :
« Ranged Weapons » est le **libellé** tranché le 20/09, et le **slug** se migre en amont dans
`fh-srd`. ⛔ L'identité est la clef, jamais le libellé — et un garde tient ce décalage pour qu'il
ne se perde pas.

📏 **21 objets = 2 pages**, à 12 comme à 15 par page : les chevrons reviennent sur cette étagère.

📌 **UNE COUCHE NEUVE, `fh-munitions-en`**, et elle est du **catalogue** — comme les gemmes : une
flèche n'est pas de l'ambiance. Elle entre dans les **trois listes d'un seul geste** (`LAYER_FILES`,
`FH_LAYER_IDS`, `PILE`), leçon du lot 77.

---

### 🧳 LES KITS D'AVENTURIER SONT DES BLUEPRINTS — ET C'EST L'ÉTAGÈRE QUI LE DIT
📍 `equipement-kits-sont-des-blueprints` · vivante · 23/09

✅ **Eric, 2026-09-23** : *« les kits d'aventuriers sont des blueprints aussi. **Activation simple
mais activation nécessaire** »*.

⭐ **UN KIT NE SE FABRIQUE PAS : IL SE DÉFAIT.** Et c'est pourtant le même jeton, la même
diagonale bleue, parce que du point de vue du joueur le geste est identique — **ce qu'il achète
n'est pas ce qu'il obtient**. Il faut un acte de plus. C'est ça, un blueprint ; la direction du
geste (composer ou décomposer) ne change rien à la marque.

🔴 **ET LE SIGNAL N'EST PAS DANS LE RECORD — MESURÉ LE 23/09.** Les sept packs du SRD ne portent
que `cost`, `name`, `weight`. **Ni contenu, ni catégorie, ni marqueur.** Rien ne distingue un
*Explorer's Pack* d'un *Backpack* dans la donnée du record.

➡️ **LE SEUL ENDROIT OÙ « CECI EST UN KIT » EXISTE EST L'ÉTAGÈRE** où Eric les a rangés le
21/08 : `adventuring › packs`. C'est donc elle qu'on lit. ⛔ **Pas une liste des sept noms** —
elle serait périmée au premier ajout (leçon d'`item-value`, lot 93). Un huitième kit rangé là
portera sa diagonale sans qu'on touche une ligne de code.

📌 `ETAGERE_DES_KITS` est **exporté par `equipement-pipeline.mjs`** et lu par son garde : la
chaîne n'est écrite qu'à **un seul endroit**. C'est la parade d'ARCHI 35 contre *la liste écrite
deux fois*, qui rougit un jour sur un fait parfaitement vrai.

⚠️ **CE QUI MANQUE ENCORE, ET IL FAUT LE DIRE NET : L'ACTIVATION N'A PAS DE CONTENU À VERSER.**
Le SRD décrit le contenu de chaque pack en prose (p. 95), mais **l'export `fh-srd` ne l'a jamais
capturé** — vérifié dans `exports/srd/en/gear.json`. La marque est posée, l'écran sait donc
annoncer « recipe » ; **le geste d'ouverture, lui, attend que le contenu monte en amont**. ⛔ Ce
n'est pas une option de l'écran : tant que la donnée n'existe pas, aucun écran ne peut l'inventer.

---

### 💎 `trade-goods` SE PARTAGE EN DEUX — `gems` ET `commodities`
📍 `equipement-trade-goods-deux-etageres` · vivante · 23/09

✅ **Eric, 2026-09-23** : *« sous trade goods tu auras gems, et ce sera une plus grosse
catégorie »*, puis, pour la seconde : *« une autre sous-catégorie : market goods, ou autre
chose… »* — et il tranche **`commodities`**.

⚖️ **POURQUOI CE MOT-LÀ ET PAS « market goods »** : les 23 lignes du livre sont des biens qu'on
échange **au poids** — blé, farine, sel, cuivre, argent, soie, safran. ⛔ Et *« market goods »*
frôlait **`Wares`**, qui est déjà le nom de la PORTE du catalogue : deux mots voisins pour deux
organes différents, c'est l'homonymie qui a coûté une journée le 23/08 sur « Clothing ».
⭐ Et ça défait `trade-goods › trade-goods`, qui bégayait.

🔴 **MAIS `commodities` N'EXISTE PAS ENCORE, ET C'EST UNE MESURE, PAS UN OUBLI.** Les 23
marchandises du SRD **ne sont dans aucun record du builder** — vérifié le 23/09 : aucun `gear` ne
porte Canvas, Cinnamon, Saffron, Silk…, et aucun record n'est non rangé. ⛔ **Le rayon
`trade-goods` n'a donc JAMAIS porté que des gemmes**, contrairement à ce que deux gardes et une
provenance affirmaient (« 77 quand les 23 l'auront rejointe » — une prévision lue comme une
mesure).

➡️ **L'ÉTAGÈRE NAÎTRA AVEC SON CONTENU, PAS AVANT.** Déclarer `commodities` à vide aujourd'hui
serait exactement la promesse qui ment qu'on vient de retirer avec `projectiles`. L'ordre est :
importer les 23 depuis le SRD en amont (`fh-srd`), les ranger sur `trade-goods › commodities`,
et l'étagère paraîtra au tambour du même geste — parce que l'export ne porte que les
combinaisons peuplées.

---

### ⚔️ LE RAYON S'APPELLE `armory` — IL N'Y A AUCUNE TABLE DE LIBELLÉS
📍 `equipement-rayon-armory-la-clef-est-le-libelle` · vivante · 23/09

✅ **Eric, brief d'ouverture du 20/09** : *« le rayon `battlefield` s'appelle Armory »*. Le
renommage est resté trois jours en liste d'attente sous « si Eric veut que la clef rejoigne
l'étiquette » — **c'était une instruction, pas une option**, et il l'a vu à l'écran : *« je vois
toujours battlefield et pas armory dans wares, normal ? »*

🔴 **NON, ET LA RAISON TIENT EN UNE LIGNE DE CODE.** `lireRangement` fait
`label: titreDeValeur(rayon)` — [equipment-step.mjs](equipment-step.mjs). ⛔ **Il n'existe nulle
part de table qui traduirait une clef en mot d'écran.** Le libellé est FABRIQUÉ à partir de la
clef, donc tant que la clef dit `battlefield`, l'écran dit « Battlefield », quoi qu'on écrive
ailleurs — dans une couche, dans une note, dans un artefact.

⭐ **CE N'EST PAS UNE FAIBLESSE DU TAMBOUR, C'EST SA LOI.** L'identité d'une étagère est
`aisle:shelf`, **jamais le libellé** (deux rayons portent une étagère « Clothing » ; les confondre
a coûté une journée le 23/08). Un seul écrivain pour le mot affiché, et c'est la clef.
➡️ **Conséquence pratique : renommer une catégorie à l'écran = renommer le slug en amont dans
`fh-srd/src/shelving.py`, puis régénérer.** Il n'y a pas de raccourci par la couche.

📏 **LA PLACE NE BOUGE PAS, ET ÇA S'EST VÉRIFIÉ AVANT LE GESTE** : le tambour trie par
libellé, et « Arcana » < « Armory » comme « Arcana » < « Battlefield ». Le rayon reste au
troisième cran de la roue — **aucune réordonnance à suivre nulle part**.

⚠️ **LE SECOND RENOMMAGE DU MÊME BRIEF ÉTAIT PARTI SEUL** (`thrown-weapons` → `ranged-weapons`,
le 23/09). Deux renommages demandés ensemble, un seul appliqué : c'est la forme de défaut que le
mot « si Eric veut » fabrique. ⛔ **Une demande du brief ne devient pas une option parce qu'on l'a
mise en liste d'attente.**

---

### 🧰 LES OUTILS FATE'S HAND SONT RANGÉS — `crafting › tools`, AVEC CEUX DU SRD
📍 `equipement-outils-fh-ranges` · vivante · 23/09
⚖️ **Les douze outils Fate's Hand rejoignent `tools › tools`, la même étagère que les 25 du
SRD — et leur rangement vit dans LEUR couche, pas dans `srfh-shelving-en`.**

> Eric, 2026-09-23 : **« y'a pas une étagère tools ? dans crafting ? »**

Il y en a une, elle porte les 25 outils du SRD depuis le lot 90, et les onze outils neufs n'y
étaient pas. ⛔ **Ce n'était pas un choix** : `srfh-shelving-en` est construite sur le **SRD seul**
et n'a jamais vu ces records. ⭐ **Le motif est celui des 54 gemmes** : une couche Fate's Hand porte
SON propre rangement — et il s'éteint avec l'interrupteur qui l'allume.

| | |
|---|---|
| `fh-skills-en` | **11** rangements, préfixe `fh:` |
| `fh-soulforging-en` | **1** rangement |
| ⛔ les deux **réécrits** | **aucun** — ils SONT `srd:tool:en:gaming-set` et `musical-instrument`, déjà rangés ; un second afficherait **deux lignes pour un seul outil** |

⭐ **LE GARDE A FAIT SON TRAVAIL** : `tambour-equipement` « 5 bis » nommait les douze depuis le lot
95, *« pour qu'un ajout futur casse ici au lieu de disparaître en silence »*. Il a cassé. La dette
est payée, et le test dit maintenant l'inverse : **plus aucun outil sans étagère**.

🏷️ **ET LE RAYON S'APPELLE `tools`, PLUS `crafting`** — Eric, 23/09 : *« ne mets pas crafting
tools, mets tools »*. ⭐ Le rayon dit ce que l'objet **est**, pas ce qu'on en **fait** : on ne
cherche pas une trousse de forgeron dans un rayon nommé d'après son usage.

⛔ **`crafting` N'EST PAS RENOMMÉ — IL SE VIDE.** Et une combinaison non peuplée n'entre pas dans
l'export *(test 5 ter)*, donc le rayon **disparaît du tambour**. ⏳ Il reparaîtra le jour où les
**210 ingrédients du Soulforging** y entrent — `Essence` · `Structure` · `Catalyst`, 70 chacun.
📌 La question du 09/09 — *« elle disparaît ou elle attend les ingrédients ? »* — trouve donc sa
réponse : **elle attend, et elle attend ceux-là**.

✅ **LE DÉBORDEMENT DES 37 EST RATIFIÉ** — Eric, 23/09 : *« pour les gemmes on [est] aussi
au-dessus des 35 »*. La cible de 35 garde son sens *(c'est une **cible de découpage**)*, mais deux
étagères l'assument, pour la même raison : ce qu'elles portent ne se découpe pas plus fin sans
mentir. Un outil est un outil ; une gemme est une gemme.
⛔ **Ratifié ne veut pas dire oublié** : les deux restent **nommées** dans le garde, avec leur
compte, pour qu'un **troisième** débordement rougisse au lieu de se glisser.

⚠️ `tools › tools` répète son nom, comme `trade-goods › trade-goods` : forme déjà admise.

---

### 💰 LE PRIX SE PREND AU SRD, PUIS À LA RÉFÉRENCE OUVERTE — ET SEULEMENT POUR UN OBJET
📍 `equipement-prix-srd-puis-reference` · vivante · 23/09
⚖️ **Le prix d'un outil FH est celui du SRD s'il existe ; sinon celui de la référence ouverte,
au bas de sa fourchette — et rien du tout pour ce qui n'est pas un objet.**

> Eric, 2026-09-23 : **« prends le prix SRD s'il existe, prends le prix Pathfinder sinon »**.

🔴 **LE PREMIER CRAN EST VIDE POUR LES DOUZE, ET C'EST MESURÉ** : `srd:tool:en:gaming-set` et
`srd:tool:en:musical-instrument` portent tous deux `"Varies"`, et **le SRD n'a ni véhicule ni
monture** — aucun record. La règle s'arrête donc au second cran.

| outil | prix | poids | d'où |
|---|---|---|---|
| **Card Set (regular)** · **Three-Dragon Ante (regular)** · **Dice Set (regular)** | `1 SP` | `0,2 lb.` | bas de fourchette — le jeu **courant** |
| **Dragonchess Set (regular)** | `1 SP` | `2 lb.` | idem, mais plateau et pièces |
| **Instrument (Wind, regular)** · **(Other, regular)** · **(Strings, regular)** | `5 GP` | `5 lb.` | l'instrument qu'on porte à la main |
| **Soulforging** | `50 GP` | `10 lb.` | ✅ **le premier cran** : `srd:tool:en:tinker-s-tools`, lu dans le SRD |
| **Vehicles ×3** · **Mount ×3** | `"Varies"` | `"Varies"` | ⛔ **ce ne sont pas des objets** — des maîtrises, qu'on n'achète pas |

🔴 **DEUX OUTILS ONT FAILLI RESTER EN ARRIÈRE, ET C'EST UNE QUESTION D'ERIC QUI LES A TROUVÉS.**
`Dice Set` et `Instrument (Strings)` ne sont pas des outils **ajoutés** : ce sont les deux records
du SRD **réécrits** (`TOOLS_REWRITTEN`). Ils gardent leur id SRD et leurs champs d'origine, donc la
branche `inherits` — celle qui a chiffré leurs cinq voisins — **ne les croise jamais**. Résultat :
chaque famille portait un membre à `"Varies"`, les cordes à 0 pendant que le vent pesait 5 lb.
⭐ Aucun garde ne l'a vu ; Eric a demandé *« instrument chords tu avais quoi ? »*.
📌 **La signature à retenir** : *deux chemins pour une même famille, et un lot qui n'en emprunte
qu'un.* Le générateur accepte désormais un prix et un poids sur les **deux** chemins.

⚖️ **0,2 lb POUR LES CARTES ET LES DÉS** — Eric, 23/09, corrigeant le lot : *« cards 0,2 lb, dice
set 0,2 lb »*. ⭐ Et **Three-Dragon Ante suit**, parce que son poids n'a jamais été lu ailleurs que
sur celui du Card Set : c'est un jeu de cartes, il pèse ce que pèsent des cartes.

⭐ **LE SOULFORGING EST LE SEUL À TOUCHER LE PREMIER CRAN.** Eric, 23/09 : *« soulforging tools =
prix tinker tools »*, après *« idem poids tinkering tools »*. Prix **et** poids viennent donc du
même record du SRD — `50 GP` · `10 lb.` en anglais, `5 kg` en français, chacun lu dans son édition.

🏷️ **ET SEPT OUTILS PRENNENT LE MOT `regular`** — Eric, 23/09 : *« Card Set · Three-Dragon Ante ·
Dragonchess Set (regular) »*, *« instruments regular (rajoute ce terme) »*. Le mot distingue la
version **courante**, celle que le catalogue vend, d'une version de maître qui n'existe pas encore.
⭐ Les slugs **ne bougent pas** : l'identité est la clef, jamais le libellé.
🔴 **ET LE MOT N'EST PAS ENCORE DANS LE MANUSCRIT** : `Skills & Tools — Player Guide` (vault) écrit
toujours *Card Set*, *Dice Set*, *Dragonchess Set*, *Instrument (Wind)*, *Instrument (Strings)*, *Three-Dragon Ante*. La loi du garde
des 37 outils dit que **le livre est le manuscrit et la couche s'aligne** — ⏳ **le terme doit donc
descendre dans le livre**, sinon la prochaine comparaison rouvrira l'écart.

⚠️ **LE POIDS DES INSTRUMENTS EST 5 lb, ET CE N'EST PAS LE CHIFFRE DE LA RÉFÉRENCE** *(qui dit
3 lb)*. C'est celui d'Eric, et il prime — la référence a servi à situer l'ordre de grandeur, jamais
à fournir le nombre.

⭐ **LE BAS DE FOURCHETTE EST LE JEU COURANT**, et c'est celui que le catalogue vend : le haut
paie l'ivoire et la dorure, pas la règle du jeu. ⛔ Une fourchette n'est pas une valeur — on en
prend un bout, en disant lequel et pourquoi.

⛔ **ET LE PRIX EST UN NOMBRE D'ERIC, comme le poids.** §0.8 refuse l'**OGL** exactement comme elle
refuse le PHB : la référence ouverte a servi à **choisir** le chiffre, jamais à le **fournir**.
Chaque record porte sa `cost_provenance` qui le dit.

⏳ **CE QUI RESTE À `"Varies"`, ET C'EST LA BONNE RÉPONSE** : les six **Vehicles** et **Mount**.
⛔ Ce ne sont pas des objets — on n'achète pas une maîtrise. Leur zéro n'est pas un trou à combler,
et le générateur porte la clause qui le dit, pour que personne ne vienne « compléter » ça plus tard.

---

### 🏷️ LES QUATRE MARQUES D'UN JETON, ET LA BANDE QUI LEUR EST RÉSERVÉE
📍 `jeton-quatre-marques-de-la-bande` · vivante · 17/09
⚖️ **Un jeton porte QUATRE marques dans une bande haute de 12 qui lui est réservée — verrou, quantité encadrée, anneau d'encre (porté), disque violet (harmonisé) — et ⛔ le nom ne monte JAMAIS dedans.**

> Eric, 2026-09-17, croquis en main : **« un rond noir (pas vert) vide = equiped »** · **« on lâche
> le cœur, on met le rond violet pour attuned »** · **« mon verrou dessiné à la main est parfait,
> mieux que le tien, et il rentre dans l'espace »** · **« la quantité encadrée ou pas avec un x99 en
> t0, ça devrait passer »** · et la formulation qu'il a corrigée trois fois jusqu'à ce qu'elle soit
> juste : **« cercle noir autour d'un centre rond transparent »**, **« le attuned remplit le
> transparent par du violet »**, **« attuned not equiped : juste un rond violet »**.

| la marque | son dessin | ce qu'elle dit |
|---|---|---|
| en haut à **gauche** | le **verrou** : corps plein 10 × 8, anse arquée de 6 × 4 au-dessus | `locked` |
| au **centre** | la **quantité encadrée**, en T0 — `×99` y tient avec 14 de marge | la pile, ⛔ seulement si > 1 |
| à **droite** | un **cercle d'encre de 12, 2 d'encre, centre rond transparent** | `equipped` |
| **dans ce centre** | un **disque violet de 8** (`--magie`) | `attuned` — seul, il se passe de l'anneau |

📐 **LA BANDE, ET LA COTE QUI LA TIENT** : la tuile fait 87 × 48 en `border-box`, liseré 2, donc
**83 × 44 utiles**. La bande va de 2 à 14 sous le bord interne (`--jeton-bande: 14`), les quatre
marques font 12 (`--jeton-marque`), et **le nom commence à 14**.
🔴 **ELLE VALAIT 10, ET LES DEUX SE RECOUVRAIENT DE 2** — les marques descendaient à 12, le nom
commençait à 10. Eric l'a vu à l'œil : *« j'ai mesuré que l'espace haut du token soit libre pour ces
petits marquages et pas de conflit avec le texte »*.
⭐ **ET LA TROISIÈME LIGNE DU NOM EST SAUVE SANS RIEN NÉGOCIER** : 44 − 14 = 30 = 3 × 10 — l'interligne
du nom passe de 1.1 à 1, et les trois lignes du 16/09 tiennent SOUS la bande au lieu de commencer
dedans. C'est la seule valeur qui loge les deux règles ensemble.
⭐ **« L'UN DANS L'AUTRE » SANS UNE COTE EN DOUBLE** : 12 d'anneau moins 2 × 2 d'encre = 8 de vide,
et le disque fait 8. Les deux marques ne sont pas voisines — **c'est le même centre, vide ou rempli**.
⛔ **ET LE MOT « CŒUR » NE DÉSIGNE PLUS RIEN ICI** : il nommait un SYMBOLE (celui que l'harmonisation
portait), et deux sens pour un mot dans une règle de dessin, c'est une relecture fausse garantie.
📌 **La quantité a changé d'organe** : elle suivait le nom sur sa ligne et lui mangeait des
caractères. Elle est une MARQUE, pas un morceau du nom.

---

### 🎚️ CE QUE VEULENT DIRE LES TROIS ÉTATS D'UN OBJET
📍 `equipement-trois-etats-d-un-objet` · vivante · 18/09
⚖️ **`equipped` = posé dans une case de Gear hors sol, donc UTILISABLE · `attuned` = harmonisé, et sans lui l'objet n'est PAS utilisable · `locked` = collé à sa case : il ne bouge pas, ne se vend pas, ne se détruit pas.**

> Eric, 2026-09-18 : **« equipé, c'est utilisable par le perso car dans les cases gear (hors
> ground) »** · **« si un item n'est pas attuned il n'est pas utilisable — incidences sur la fiche
> de perso »** · **« lock : l'item reste collé à son collecteur, ne bouge pas, ne peut être vendu,
> ni détruit tant qu'il est locked »**.

| l'état | ce qu'il dit | ce qu'il change |
|---|---|---|
| `equipped` | l'objet est **dans une case de Gear**, ⛔ le sol excepté | il devient utilisable par le personnage |
| `attuned` | il est **harmonisé** | sans harmonisation, ⛔ il n'est pas utilisable — et la fiche de personnage devra le dire |
| `locked` | il est **collé à sa case** | ⛔ ni déplacé, ni vendu, ni détruit, tant qu'il l'est |

⭐ **ET C'EST POURQUOI `equipped` NE S'ÉCRIT PAS À LA MAIN** : il est le REVERS de la position.
`moveGearLine` et `placerGearLine` le posent avec le lieu — le sol met `location: "ground"` et
`equipped: false` d'un même geste. Deux écrivains pour un état feraient diverger l'état et le lieu.
Le lien avec le sol est déjà écrit : [[equipement-sol-allege-corbeille-detruit]].

✅ **ET L'INTERDIT EST POSÉ, LE 18/09 MÊME** — *« pose le lock maintenant »*. Il vit **dans la
coquille**, là où les quatre verbes vivent ensemble (`VERBES_QUI_DEPLACENT`, nommés une fois) :
`moveGearLine`, `placerGearLine`, `splitGearLine`, `removeGearLine`. ⛔ **L'écrire dans les écrans
aurait fait trois copies** — le glisser du dressing, les portes de X1, la corbeille — et la
quatrième porte qu'un lot ajoutera serait passée au travers sans que rien ne rougisse.
⛔ **ET IL NE REFUSE PAS EN SILENCE** (loi §0.5) : il lève le gendarme, qui dit l'état **et le geste
qui le défait**. Un verrou muet se lit comme une panne.
⭐ **TROIS ÉTAGES, ET CHACUN SON RÔLE** : l'écran R **n'arme pas** le glisser d'un jeton verrouillé
(pas de fantôme, pas de cible qui s'allume — rien ne promet un dépôt qui sera refusé) mais le TAP
l'ouvre toujours, ⛔ sinon le verrou serait une impasse ; la fiche X1 **éteint** `Send`, `Trash` et
l'interrupteur `equip` en disant pourquoi ; la coquille **refuse** en dernier, et ne devrait jamais
avoir à le faire.
⭐ **CE QUE LE VERROU NE TOUCHE PAS, ET POURQUOI** : `attuned` (harmoniser ne déplace rien) et
`locked` lui-même — ⛔ un verrou qui s'interdirait d'être ouvert serait une porte murée.

🔴 **ET IL N'EST PAS UNE RESTRICTION FONCTIONNELLE — Eric l'a précisé le 18/09, et c'est ce qui
donne sa mesure à toute la règle :**

> **« un jeton verrouillé ne se déplace pas, mais il est équipé et tu peux faire tout le reste :
> profiter de ses avantages AC pour une armure, bonus de toucher, type de dégâts, etc. — surtout
> l'utiliser. L'objectif, c'est de ne pas le déplacer par mégarde. »**

⚖️ **LE VERROU EST UN GARDE-FOU CONTRE LA MÉGARDE, PAS UN INTERDIT DE JEU.** Un objet verrouillé
**reste équipé**, **rend tous ses effets** — CA d'armure, bonus de toucher, type de dégâts — et
⛔ **`Use` ne s'éteint JAMAIS sous lui**. Ce qu'il empêche tient en un mot : le **déplacement
involontaire** d'un objet qu'on ne veut plus voir bouger.
⛔ **D'OÙ LA LIMITE EXACTE DE CE QU'ON ÉTEINT** : `equip` seulement parce que porter et dévêtir
DÉPLACENT (l'état suit le lieu) ; `Send` parce qu'il déplace ; `Trash` parce qu'il détruit.
⛔ **Rien d'autre.** Le jour où un lot éteindrait un organe de plus sous le verrou, il transformerait
un garde-fou en carcan — et cette ligne est là pour l'en empêcher.

---

### 🔮 LE PLAFOND D'HARMONISATION — trois, et rien d'autre du SRD
📍 `equipement-plafond-d-harmonisation` · vivante · 18/09
⚖️ **Un personnage ne peut être harmonisé qu'à TROIS objets : la quatrième harmonisation ne se propose pas. ⛔ Et c'est la SEULE part de l'harmonisation du SRD que la création modélise.**

> Eric, 2026-09-18, rappelant le SRD : **« a creature can be attuned to a maximum of 3 magic items
> at once ; attempting to attune to a 4th has no effect until one is unattuned »**.

⛔ **CE QUE LA CRÉATION NE MODÉLISE PAS, ET CE N'EST PAS UN OUBLI.** Le SRD dit aussi le **repos
court d'une heure**, les **prérequis** par objet (*« requires attunement by a Wizard »*), la rupture
au bout de **24 heures** loin de l'objet, la fin quand une autre créature s'y harmonise, et qu'on
peut porter ou **vendre** un objet sans y être harmonisé. ⭐ **Tout cela se passe EN JEU** — un
créateur de personnage ne fait pas passer le temps et ne joue pas de repos. Ce qu'il doit tenir,
c'est le **budget** : on ne sort pas de la création avec quatre objets harmonisés, comme on n'en
sort pas avec sept compétences.
⭐ **IL SE COMPTE SUR LE DOCUMENT, PAS SUR L'ÉCRAN** : toutes les lignes comptent, où qu'elles
soient rangées — le sac harmonise autant que le corps.
⛔ **ET IL NE VERROUILLE QUE LA QUATRIÈME** : un objet déjà harmonisé garde son interrupteur, sinon
le plafond enfermerait au lieu de borner — et personne ne pourrait plus en défaire un.
📌 Le plafond est nommé **une fois** (`PLAFOND_HARMONISATION`, `x1-ecran.mjs`) et la coquille
l'importe : deux constantes divergeraient le jour où il bougerait.

⚖️ **ET LE BODY FORGING Y ENTRE — Eric, 18/09 : *« le body forging, si, rentre dans les 3
attunements, sauf si un perso a un feat spécial »*.** ⭐ Rien à faire pour ça, et c'est le signe que
le compte est au bon endroit : il porte sur **les lignes du document**, pas sur les cases de
l'écran. Un objet harmonisé compte, qu'il soit au corps, au sac, dans une forge ou au sol.
⏳ **L'EXCEPTION PAR DON N'EST PAS MODÉLISÉE** : *« sauf si un perso a un feat spécial »* — le jour
où un don relèvera le plafond, il le relèvera **là où les dons vivent**, pas dans cet écran. ⛔ Ne
pas l'inventer : aucun don du SRD ne le fait.

---

### 🏷️ CE QUE `is` DÉCIDE — la rubrique de la fiche de personnage
📍 `equipement-is-range-l-objet-dans-la-fiche` · vivante · 18/09
⚖️ **`is` est une donnée DESTINÉE À LA FICHE DE PERSONNAGE : elle dit dans quelle rubrique l'objet apparaît — une action, une action bonus, une réaction, une attaque, un sort.**

> Eric, 2026-09-18 : **« c'est des données destinées à la fiche de personnage. Ça risque de
> changer, mais ça permet de mettre l'action de lancer une boule de feu avec un parchemin dans les
> actions / bonus action / réaction, par exemple. Ou de le mettre dans les sorts. Certains seront
> une action (pas le droit de le mettre en bonus action) — ça dépend de ce que fait l'objet, et des
> capacités du perso. »**

⭐ **CE QUE ÇA TRANCHE, ET ÇA TRANCHE PEU EXPRÈS** : la liste n'est pas une taxonomie de l'objet,
c'est un **rangement**. Un parchemin de boule de feu n'EST pas une action bonus — on le RANGE
là, parce que c'est là que le joueur le cherchera pendant sa partie.
⛔ **DONC LA LISTE N'EST PAS DÉDUCTIBLE DU RECORD** : ni le genre (`weapon`, `armor`), ni le SRD ne
peuvent la remplir à la place du joueur — *« ça dépend de ce que fait l'objet, et des capacités du
perso »*. C'est un choix, et il reste au joueur.
⏳ **ET RIEN NE LE LIT ENCORE** : `gear[N].is` s'écrit et ressort dans `unconsumed`. La fiche de
personnage le consommera — *« ça risque de changer »* est d'Eric, et la règle est datée pour ça.

---

### ⏳ `USE` EST UN RENDEZ-VOUS, PAS UN BOUTON MORT
📍 `equipement-use-est-un-rendez-vous` · vivante · 18/09
⚖️ **`Use` garde sa place au pied de la fiche et reste DÉSARMÉ pendant la création : il n'y sert à rien, et sa note le dit — ⛔ il n'annonce pas une panne.**

> Eric, 2026-09-18 : **« le use va varier d'un objet à l'autre. Il ne sert à rien en création. Il
> sera très utile pour utiliser un anneau d'invisibilité, utiliser une baguette de boule de feu,
> etc. Laisse le bouton qu'on oublie pas de le traiter quand c'est utile. »**

⭐ **POURQUOI ON GARDE UN BOUTON QUI NE FAIT RIEN**, alors que la règle ordinaire l'interdirait : sa
place EST l'information. Le retirer ferait oublier le geste ; le laisser tient le rendez-vous avec
le miroir « Équipement en jeu ». C'est la même loi que **les quatre lunes du plan de R** — dessinées
et cotées, non posées : *« les lunes sont pour les écrans plus grands »*.
⛔ **MAIS SA NOTE NE MENT PLUS** : elle disait *« not wired yet »*, ce qui se lit comme un travail
en retard. Elle dit maintenant que ce geste appartient au jeu, pas à la création — rien ne manque.
⛔ **ET LE VERROU NE L'ÉTEINT JAMAIS** : verrouiller empêche de déplacer, pas d'utiliser.

---

### 📜 LA DÉCHIRURE DU PARCHEMIN NE SE PAIE PAS EN MARGE
📍 `cadre-dechirure-du-parchemin-hors-dalle` · vivante · 18/09 · **amendée le 21/09**
⚖️ **La déchirure de la fiche X1 ne coûte pas un blg au texte — et depuis le 21/09 elle se voit ENTIÈRE : la silhouette tient DANS la dalle, et ses creux laissent voir le fond de l'application.**
⛔ **Ce que la règle interdit n'a pas bougé d'un mot : payer de la marge pour du décor.** Ce qui a changé, c'est le moyen — le bord n'est plus une image dont il faudrait dégager les arêtes, c'est un contour calculé dont la profondeur est un paramètre.

> Eric, 2026-09-18 : **« les 28 de large en moins, c'est ok. On laisse le parchemin comme ça. »**

📏 **LE CHIFFRE EST MESURÉ, PAS ESTIMÉ** : en balayant l'alpha de l'image d'Eric ligne par ligne, la
déchirure rentre de 3,4 % à gauche et 2,8 % à droite, soit **12,9 blg au pire** — d'où les 14 qu'il
faudrait rendre de chaque côté.
⭐ **CE QUE LA DÉCISION PROTÈGE** : la description est la **seule zone élastique** de la fiche, et
toute la soirée du 17/09 a consisté à lui rendre de la place — le titre retiré (44), les chiffres
amincis (32), la bande de rappel (40) : de 116 à 232. ⛔ En reprendre 28 pour une dent complète
aurait défait le tiers de ce travail.
⭐ **ET LA DÉCHIRURE AMORCÉE SUFFIT À DIRE « PARCHEMIN »** : ce qu'on voit au bord est un bord
déchiré, pas un bord droit — et c'est tout ce que l'œil avait à comprendre.

🔴 **SA PRÉMISSE EST MORTE LE 21/09, SA DÉCISION TIENT** *(lot 219)*. La règle arbitrait un
**coût** : montrer la déchirure entière valait 14 de marge sur quatre côtés, *parce que la
déchirure était une IMAGE dont il fallait dégager les bords*. ⭐ Depuis que le bord est
**calculé**, sa profondeur est un paramètre : elle se règle à **9,5 blg**, le dégagement du
premier organe peint, et la déchirure entière se voit **sans rendre un seul blg au texte**.
⛔ **Ce qui ne change pas, et c'est ce qu'Eric a tranché** : on ne paie pas de marge pour le
décor. La règle est donc **tenue**, pas levée — par un autre moyen.

🔴 **ET LE 21/09 LA PHRASE D'EN-TÊTE TOMBE, PAR LA VOIX D'ERIC** *(lot 243)*. Elle disait *« on ne
voit que le DÉBUT de la déchirure »* — une description de l'ANCIENNE image, restée en place après
que le lot 219 eut rendu la déchirure entière gratuite.

> Eric, 2026-09-21, devant la fiche servie : **« efface la plaque en dessous et n'agrandis pas
> X »** · **« on verra le contour »** · **« juste X et le fond derrière »**

⚠️ **CE QUI L'AVAIT CONTREDITE EN SILENCE, ET C'EST LA MÊME FAUTE DANS L'AUTRE SENS** : le lot 240
avait lu *« on ne voit que le début »* comme un ordre de pousser le papier HORS de la dalle, ligne
moyenne à `−k·haut`, quatre arêtes coupées à plat par l'`overflow`. ⛔ Il l'a écrit lui-même en
dernière ligne de son message — *« la fiche se lit comme un rectangle »* — et il l'a poussé quand
même, parce que la loi de ce fichier semblait le couvrir. ⭐ **Une loi qui décrit un rendu mort
arme celui qui la lit au pied de la lettre.** C'est pour ça qu'elle est amendée ici et pas
seulement dans le code.

📏 **LA PILE EST À DEUX COUCHES, ET IL N'Y A RIEN ENTRE — MESURÉ, ⛔ PAS SUPPOSÉ** (Chromium, 21/09,
`ui/builder/index.html`, chaîne matérialisée puis lue au `getComputedStyle`) : `.x1`,
`.equipment-step`, `.decision-card`, `.stage`, `.stage-area`, `.panneau-contenu`, `.panneau`,
`.panneaux`, `.app` et `html` rendent **tous** `rgba(0, 0, 0, 0)` / `background-image: none`. Le
seul organe qui peint sous la fiche est `body` — `rgb(20, 18, 14)` + `bg-ruins-night`.
⭐ **Il n'y a donc AUCUNE plaque au dépôt** : celle qu'Eric a vue était le parchemin agrandi
lui-même. *« Efface la plaque »* et *« n'agrandis pas X »* sont **un seul geste**.

---

### 📜 LE PARCHEMIN DE LA FICHE EST DESSINÉ, ⛔ JAMAIS UNE IMAGE
📍 `cadre-parchemin-calcule-trois-palettes` · vivante · 21/09
⚖️ **La surface de la fiche X1 est un contour SVG calculé à la cote RÉELLE du panneau — ⛔ aucune image matricielle — et elle porte TROIS palettes : jour, nuit, et la bleutée du Party Tally, qui PRIME sur les deux autres.**

> Eric, 2026-09-21 : **« aucune image matricielle de parchemin ne doit être nécessaire »** ·
> **« conserver les couleurs jour, nuit et bleutée du prototype »** · **« le bleu est un
> contexte hors jour nuit, il PRIME »** · **« la palette bleutée doit rester claire et
> lisible : pas un panneau nocturne simplement recoloré en bleu »** · **« remplacer les
> séparateurs ornementaux à losanges et points par de simples filets fins en dégradé »**.

📏 **LE DÉFAUT ÉTAIT MESURABLE, ET IL ÉTAIT DANS UNE SEULE DÉCLARATION** :
`.x1 { background: var(--x1-parchemin) center / 100% 100% no-repeat }`. ⛔ `100% 100%` ne
préserve aucun rapport — la dalle fait **375 de large toujours** mais sa hauteur suit la scène,
donc le grain et la déchirure s'allongeaient ou s'écrasaient d'un appareil à l'autre. Mesuré le
21/09 : à 700 de haut, la même image rendait ses accrocs **40 % plus longs** qu'à 500.
⭐ **CE QUE LE CALCUL APPORTE, ET QU'AUCUN RÉGLAGE D'IMAGE NE POUVAIT DONNER** : un accroc fait
**4 blg** que la fiche en fasse 420 ou 700 de haut. La matière ne s'étire pas, parce qu'il n'y a
plus rien à étirer — le bord gagne des points, il ne redistribue pas les siens.

⚖️ **TROIS RENDUS, ⛔ PAS SIX.** Jour et nuit sont l'affaire du **lecteur**
*(`prefers-color-scheme`, sur `:root`)* ; la bleutée est l'affaire de **l'objet regardé**. Elle ne
se combine pas avec le thème, elle le **préempte** : une fiche du Party Tally est bleu pâle le
soir comme le matin.
🔴 **ET « PRIMER » EST UNE AFFIRMATION SUR QUI GAGNE, DONC ELLE SE MESURE.** 📏 Relevé au
navigateur le 21/09, `getComputedStyle` sur la fiche en contexte Party Tally, application forcée
en jour puis en nuit : les **dix** jetons du parchemin rendent la **même** valeur aux deux
relevés, pendant que le témoin `--text` passe de `#2d2c2a` à `#d8d3c9`. ⭐ Le témoin prouve que
la sonde **voit** le thème changer — sans lui, l'égalité ne dirait rien.
⛔ **LA BLEUTÉE DOIT DONC ÊTRE COMPLÈTE, PAS SEULEMENT PRÉSENTE** : elle redéfinit **tout** ce que
le bloc de nuit touche. Le jour où la nuit gagnerait un jeton que la bleutée oublie, ce jeton-là
passerait en nuit **sous un papier bleu** — un panneau bleu à l'encre nocturne, exactement ce
qu'Eric refuse — et **aucun test de couleur ne broncherait**. C'est `tests/parchemin.test.mjs`
garde 6 qui le tient, et il a été éprouvé ROUGE.

📏 **LA PROFONDEUR DU BORD EST DÉDUITE, ⛔ PAS CHOISIE** : c'est la plus courte distance entre un
bord de la dalle et la boîte de **dessin** d'un organe — **9,5 blg** *(COPIER à gauche, JAUGE à
droite ; le haut en offre 20, le bas 36)*. ⚠️ **ET LA BOÎTE DE DESSIN N'EST PAS LA CIBLE** : les
cibles de 44 descendent jusqu'à **4** du bord, mais elles portent l'écart en **bordure
transparente** — rien n'y est peint, et le décor ne les rogne pas puisqu'il n'intercepte aucun
geste. Confondre les deux fait accuser un défaut qui n'existe pas *(fait le 21/09, corrigé en
mesurant le `padding-box`)*.
⭐ **UN SEUL BUDGET POUR LES QUATRE CÔTÉS** : le bas en offrirait 36, mais une déchirure quatre
fois plus profonde en bas qu'aux côtés ne se lit pas comme une feuille. L'asymétrie qu'Eric
demande vient du **bruit**, ⛔ pas d'un budget par arête.

---

### 🔢 DEUX CASES DU MÊME NOM PORTENT LEUR NUMÉRO
📍 `equipement-numero-de-la-case` · vivante · 17/09
⚖️ **Un emplacement dont le nom est porté par plusieurs cases affiche son NUMÉRO, sous le mot et d'un cran plus petit ; ⛔ une case seule de son nom n'en porte pas.**

> Eric, 2026-09-17 : **« pour pas se paumer, numéroter les emplacements de même nom est essentiel je
> pense »** · **« le chiffre, mets-le en petit, un incrément en dessous »** · **« chiffre en dessous
> plus propre »** · **« un seul élément, pas de chiffre »**.

⛔ **IL ÉTAIT DANS LA TABLE ET NULLE PART AILLEURS.** Sept noms sont portés par deux cases ou plus —
HEAD/NECK, ARM/HAND, POCKET/WEAPON, FOOT/LEG, GROUND (deux), TORSO/BACK (trois), EXTRA STORAGE
(quatre) — et rien à l'écran ne les distinguait : **on ne pouvait pas DIRE de laquelle on parlait.**
⭐ **« UN INCRÉMENT » EST UNE MARCHE DE L'ÉCHELLE, PAS UNE VALEUR** : le mot est en T1, le chiffre est
donc en T0, et le jour où l'échelle bouge il descend avec elle.
⭐ **Le numéro vient du NOM DÉCLARÉ**, pas d'un compteur de rendu : il ne peut pas se décaler d'une
case à l'autre. Et il vit dans les DEUX états — vide il désigne la case qu'on vise, occupée il dit
laquelle des deux porte cet objet. Le nom accessible le porte aussi : deux « HEAD/NECK — empty »
identiques sont exactement la confusion qu'Eric nomme.
📌 **Et deux noms ont été corrigés le même jour** : *« arm/hand au singulier »* et *« c'est head neck »*
— repris dans `R_gen.py`, régénérés, recopiés verbatim. ⛔ Jamais à la main dans le dépôt.

---

### ✂️ UNE PILE SE SCINDE, ET LA PART DÉTACHÉE NAÎT NUE
📍 `equipement-scinder-une-pile` · vivante · 17/09
⚖️ **`Send n` sur une pile de N SCINDE : la pile garde N − n, une ligne neuve de n part à destination — et elle perd `equipped`, `attuned` et `locked`.**

> Eric, 2026-09-17 : **« c'est un tu choisis combien »** · **« oui, un item Qty 2 peut devenir 2 items
> qty 1 »** · **« oui scinder »** · **« la part détachée perd tous ces : attunned locked equiped »**.

⛔ **ET CE N'EST PAS UNE FORME DE DONNÉE NEUVE — je l'avais écrit, c'était faux.** `addGearLine` n'a
JAMAIS fusionné : deux lignes du même record existent déjà dans tout document où la même chose a été
achetée deux fois. Scinder retire n de la pile et pose une ligne de n. La forme n'a pas bougé.
⭐ **POURQUOI LA PART DÉTACHÉE NAÎT NUE** : ces trois états parlent de **l'exemplaire qu'on garde**.
Une dague harmonisée ne se duplique pas parce qu'on coupe la pile en deux.
📌 **L'écran le promettait déjà** : le champ est borné `1 … qté` et affiche `/N`. Il disait *« choisis
combien »* pendant que le code déplaçait tout — un libellé qui ment, ce que §6 interdit.
⏳ **CE QUI N'EST PAS TRANCHÉ ET NE DOIT PAS ÊTRE INVENTÉ** : rien ne REFUSIONNE deux piles, et les
plafonds de quantité (Eric : *« un max théorique 99 »*, *« sinon moi j'en mets une, c'est 10, et pour
les projectiles c'est 20 »*, *« le contenant, on laisse voir en jeu »*) sont **à débattre**.

---

### 🎒 LE SAC — CE QU'UN RANG B PORTE, ET D'OÙ ÇA VIENT
📍 `equipement-le-sac-porte-ce-que-la-source-dit` · vivante · 18/09
⚖️ **B1 porte une grille de jetons, le COMPTE à gauche et la PAGE à droite, le parchemin permanent, QUATRE lignes de poids, `DROP` et `SEND TO ▾` — et son pied dit `Gear · Send · Wares`.**

> La source du chapitre *(l'artefact « Équipement à la création », état au 16/09)* : **« B1 Backpack —
> une grille de jetons · le compte total à gauche, la page à droite · le parchemin à droite
> (permanent) · GEAR WEIGHT · DROP · SEND TO ▾ | GEAR · SEND · WARES »**, et **« l'encart passe donc
> de trois à quatre lignes, sur R et sur B1 »**.

🔴 **CETTE LIGNE EXISTE PARCE QUE J'AI CONSTRUIT L'ÉCRAN SANS LIRE LA SOURCE, ET QUE JE L'AI DÉPLOYÉ
TROIS FOIS.** Eric a dû dire deux fois *« et l'artefact te dit tout »*. Trois organes manquaient —
le compte et la page, la quatrième ligne de poids, `DROP` — et aucun garde ne pouvait les réclamer :
un garde vérifie que l'écran suit **son** plan, jamais que le plan suit **la source**.
⭐ **CE QUE LA DICTÉE D'ERIC A AJOUTÉ PAR-DESSUS (17–18/09), ET QUI PRIME** : le tambour des
sections et ses deux tuners, `Sort` et `Sections`, un **collecteur** (*« il nous manque un
collecteur, il faut faire sauter une rangée »* — d'où 12 jetons et non 15), la bourse et les deux
Tally autour de lui, les trois lunes des grands écrans.
⛔ **ET LA « PAGE » DU SAC EST SA SECTION** : la source décrit un sac d'avant les compartiments, qui
se feuilletait. Eric les a remplacés par des sections nommées et le tambour EST le feuilleteur — la
fraction dit donc où l'on en est dans la liste. ⛔ Un second paginateur aurait donné deux organes
pour un seul geste.
⏳ **NON TRANCHÉ, ET À NE PAS DEVINER** : ce que fait *« tighten up »* dans une grille qui se tasse
déjà toute seule ; ce qui arrive à une section qui déborde de douze ; et si le rangement local doit
se graver au document ou rester un coup d'œil.

---

### ✨ UN HALO RECOUVRE LE REBORD, ⛔ IL NE L'ENTOURE PAS
📍 `cadre-le-halo-recouvre-le-rebord` · vivante · 20/09
⚖️ **Le halo d'un organe DÉSIGNÉ est entièrement `inset` : il entre par le rebord et diffuse vers l'intérieur. ⛔ Rien ne sort — ⛔ jamais un anneau posé contre le bord.**

> Eric, 2026-09-20, en regardant le tambour de Wares : **« fais en sorte que le halo recouvre
> plutôt qu'entourer sur le premier pixel du bord, mais aussi en dessous »** — puis, en donnant
> l'objectif qui tranche : **« objectif qu'on voie la marge autour de la tuile »**.

⭐ **ET C'EST L'OBJECTIF QUI DIT COMBIEN SORT : RIEN.** 📏 Mesuré sur le tambour : la tuile posée
est agrandie de 1,2456, donc elle déborde de **7 blg** de chaque côté sur un écart qui en vaut 8 —
il ne reste qu'**UN blg** de marge, et la moindre part extérieure du halo l'avale. Un halo qui sort
d'un blg ne « déborde » pas un peu : il **supprime** la marge.
⏳ **ET LE BLG QUI RESTE EST MINCE — c'est une COTE, pas un réglage.** Pour une marge de 8 VISIBLE
il faudrait un écart de `8 + 7 = 15`, donc un `pas` de 72 au lieu de 65. ⛔ Le pas est ce qui rend
`scrollLeft = pas × k` exact, sur les DEUX tambours : il ne se change pas en passant.

⭐ **C'EST LA MÊME QUESTION QUE LA LOUPE, POSÉE SUR UN AUTRE ORGANE.** La loi du 19/09
*(`equipement-loupe-se-superpose-au-rebord`)* dit d'un cadre témoin qu'il *« se pose SUR le rebord
de la boîte, il ne s'ajoute pas autour »*, et la raison y est écrite : **deux traits qui se touchent
sans se superposer s'ADDITIONNENT**, et ça fait l'autocollant. Un halo purement extérieur a le même
défaut — il dessine une **seconde arête** contre la première.
📌 **CE QUE LA PHRASE D'ERIC DIT EXACTEMENT, MOT PAR MOT** : *« recouvre »* → l'`inset`, qui
**remplace** le trait au lieu de s'y ajouter ; *« sur le premier pixel du bord »* → il commence à
l'arête même, pas un blg plus loin ; *« mais aussi en dessous »* → et de là il diffuse vers
l'**intérieur** de la tuile. ⭐ Les trois morceaux décrivent UNE ombre, pas deux.
🗄️ **ARCHIVÉ, et l'erreur vaut d'être gardée** : j'ai d'abord lu la phrase comme deux ombres — une
`inset` plus une extérieure sans étalement, « à cheval sur l'arête ». Elle a vécu une heure, jusqu'à
l'objectif. ⛔ Une part extérieure, fût-elle d'un blg, mange la seule marge qui reste.
⭐ **L'ENCRE RESTE CELLE DU BELT** — `--belt-halo`, le jeton qui dit déjà *« c'est ici que ça se
passe »* sur le cran courant, sur les bascules de X1 et sur l'interrupteur du mode du sac. ⛔ Ce
n'est pas une lueur neuve : c'est la même, autrement posée.
📏 **ET ELLE VAUT POUR LES DEUX TAMBOURS** — le sac et Wares partagent la règle. Eric compare les
deux écrans ; deux tambours qui ne s'allument pas pareil seraient deux tambours.

🔴 **ET J'AI FAILLI ÉCRIRE CETTE LOI SUR UN RENDU FAUX.** En rédigeant le commentaire de `shell.css`
j'ai fermé le bloc **une seconde fois** : le moteur CSS, tombant sur de la prose, a sauté jusqu'au
prochain `;` — **celui du `box-shadow`** — et la déclaration a disparu. Le navigateur montrait donc
le liseré nu, le halo n'a **jamais** été appliqué, et **j'ai accusé le cache**. ⭐ C'est le garde
`css-syntaxe` *(né du même accident le 15/09)* qui a donné la ligne exacte. 📌 **La leçon se répète
mot pour mot** : *quand tous les gardes lisent un fichier à travers le même extracteur, aucun ne
peut accuser l'extracteur* — et un rendu qui manque ne prouve pas que la règle est absente du
fichier ; il peut prouver que **le fichier est cassé plus haut**.

---

### 🛒 WARES — TROIS DALLES, UN TAMBOUR À DEUX ÉTAGES, UNE GRILLE DE DOUZE
📍 `equipement-wares-trois-dalles` · vivante · 20/09
⚖️ **Wares est fait des MÊMES organes que le sac : un tambour *(deux étages au lieu d'un)*, une grille de jetons, un pied. ⛔ Il ne redessine rien — il importe.**

> Eric, 2026-09-20, en dictant l'écran : **« Voile 35 %. Equipment browser dégage. »** · **« pas de
> menu d'éditions »** · **« première ligne du tambour de Wares, les catégories, fonctionnement
> exactement celui de backpack. Ça ne tourne plus à l'infini, navigation identique. »** · **« 4
> blg »** · **« deuxième ligne porte les sous-catégories. Même fonctionnement que backpack, même
> navigation, on a juste un deuxième étage de navigation. »**

| la dalle | ce qu'elle porte | hauteur |
|---|---|---|
| **1** | le tambour, **deux étages** — les catégories, puis les sous-catégories | **92** |
| **2** | la grille de jetons et ses deux gouttières *(compte d'objets à gauche, compte de pages à droite)* | **232** |
| **3** | les deux Tally · le collecteur · la bourse · `Send to ▾` · la rangée du pied | **160** |

⭐ **`92 + 8 + 232 + 8 + 160 = 500`, PILE.** Les deux `8` sont les line bleeds (§8 bis).
⛔ **CE QUE WARES NE PORTE PAS**, et c'est la dictée qui l'enlève : aucun mode édition *(ni `/`, ni
`×`, ni `+ Storage`, ni `done sections`)*, ni `Sort`, ni `Encumbrance`, ni `sections`. ⭐ **C'est
exactement ce qui libère les 92 blg pour DEUX étages là où le sac n'en loge qu'un.**
🔴 **ET LE TITRE `EQUIPMENT BROWSER` DÉGAGE.** L'écran avait deux noms — celui de son titre et celui
que la 3ᵉ ligne du belt écrit déjà. §6 interdit un libellé qui ment ; deux noms pour un écran sont
la même faute, en plus discret.

---

### 🥁 LE SWIPE DE WARES PAGINE — ⛔ ET CE N'EST PAS CE QUE FAIT LE SAC
📍 `equipement-wares-swipe-pagine` · vivante · 20/09
⚖️ **Le glisser de dalle, dans Wares, déplace dans les PAGES de la sous-catégorie. ⛔ Il ne change jamais de sous-catégorie — c'est le tambour qui en change.**

> Eric, 2026-09-20 : **« le swipe de dalle […] déplace dans les pages de la catégorie, pas d'une
> sous-catégorie à l'autre (ATTENTION LÀ C'EST DIFFÉRENT DE BACKPACK) »**.

⭐ **ERIC A NOMMÉ LA DIFFÉRENCE LUI-MÊME, EN MAJUSCULES, ET C'EST LA RAISON DE CETTE LIGNE.** Dans le
sac, une dalle EST une section : glisser change de section. Dans Wares, une sous-catégorie ne tient
pas sur une dalle — elle en fait plusieurs. Le geste garde donc sa forme et change de sens.
📌 **Les deux gouttières restent** : une sous-catégorie a plusieurs pages, donc `‹` `›`, le compte
d'objets et le compte de pages. ⭐ La règle `liste-une-seule-page-pas-de-fleches` s'applique quand
même : une sous-catégorie de **douze ou moins** n'a pas de chevrons.

---

### 🔢 WARES PAGINE PAR **DOUZE**, ⛔ PAS PAR QUINZE — ET C'EST LA HAUTEUR QUI LE DIT
📍 `equipement-wares-douze-par-page` · vivante · 20/09
⚖️ **La grille de Wares fait QUATRE rangées de trois, soit douze jetons par page. ⛔ L'écran passe son nombre à `pageDeListe(objets, page, 12)` ; il ne recopie pas le 15, et il ne le tait pas.**

> Eric, 2026-09-20, en dictant : **« 5 rangées de 3 tokens, si on a la place »** — puis, la mesure
> faite : **« eh ben 4 rangées alors »**.

📏 **LA MESURE QUI A TRANCHÉ, ET ELLE EST ARITHMÉTIQUE.** À cinq rangées la dalle 2 vaut
`8 + 5×48 + 4×8 + 8 = 288`, et l'écran demande `92 + 8 + 288 + 8 + 160 = 556` pour une scène qui en
offre **500** : ⛔ **56 de trop**.
⛔ **ET AUCUN RACLAGE NE LES RÉCUPÈRE** : écarts de rangée 8 → 4 *(−16)*, les deux line bleeds 8 → 4
*(−8)*, rembourrages de la dalle 2 *(−8, et ça contredit le croquis du 19/09)*, hauteur du jeton
48 → 44 *(−20, et 🔒 44 est le plancher)* — **−52 au total, il manque encore 4**, pour un écran
devenu illisible. La seule autre sortie était de fondre le collecteur et `Send to` sur une rangée,
c'est-à-dire de décider du produit à la place d'Eric.
⭐ **`NORMES` PRÉVOYAIT DÉJÀ CE CAS** : *« un écran qui dévie passe SON nombre à `pageDeListe`,
explicitement, et le garde reste muet. Ce qu'il interdit, c'est de recopier le 15. »*

---

### 📦 LES REMBOURRAGES DE DALLE VALENT 4, LES ÉCARTS ENTRE ORGANES VALENT 8
📍 `equipement-wares-rembourrage-quatre` · vivante · 20/09
⚖️ **Dans Wares, le rembourrage d'une dalle vaut `4` ; l'écart entre deux organes garde le `8` du sacré n° 3. ⛔ Une exception, un argument : le budget vertical.**

🔴 **CETTE LIGNE EXISTE PARCE QUE LE SACRÉ N° 3 A CASSÉ MON BUDGET, ET IL AVAIT RAISON.** J'avais coté
la dalle 3 à **156** en recopiant deux entorses du sac : un écart de `4` avant la rangée du pied, et
un `Send to` dessiné **40** de haut au lieu de sa BOÎTE de **44** — 🔒 le plancher `--touch`, laissé
filer. Aux 8 réglementaires la dalle 3 vaut **160**, et la somme passait à 504.
⭐ **CE SONT LES REMBOURRAGES QUI CÈDENT, JAMAIS LES ÉCARTS.** Un écart porte le rythme entre deux
organes ; un rembourrage ne sépare rien, il borde. Le précédent est d'Eric lui-même *(06/09 :
« faut récupérer des blg »)*, et il porte le même argument.
⛔ **ET LA DALLE 2 GARDE SES 8** : son rembourrage est fixé par le croquis du 19/09 *(« 8 au-dessus
du premier jeton et 8 sous le dernier »)*. ⭐ Un croquis d'Eric prime sur une généralisation.

---

### 🎫 LE JETON DE WARES EST CELUI DU SAC — ⛔ UNE SEULE DIFFÉRENCE, ET C'EST LE TAP
📍 `equipement-wares-jeton-et-x2` · vivante · 20/09
⚖️ **Wares importe `jeton-objet.mjs` sans le toucher : le nom sur trois lignes au plus, la bande des quatre marques. ⛔ Pas de prix sur le jeton. La SEULE différence : un tap ouvre un `X2`, pas un `X1`.**

> Eric, 2026-09-20 : **« les jetons EXACTEMENT la même règle que dans les menus Gear/Backpack.
> Différence une seule : un tap sur token, mène à un écran X2 pas X1. »**

⭐ **ET ÇA TRANCHE UNE QUESTION QUE J'ALLAIS POSER** : fallait-il poser le prix sous le mot, puisque
la fiche et la recherche chiffrent ? Non. *« Exactement la même règle »* ferme la porte — le prix
vit sur la fiche, ⛔ jamais sur le jeton.
⭐ **`jeton-objet.mjs` EST UN MODULE FEUILLE** — aucun import, aucune cote, aucune couleur — et c'est
précisément ce qui rend un troisième porteur gratuit. ⛔ Wares ne le redessine pas.
⏳ **CE QUI N'EST PAS TRANCHÉ, ET QUE JE N'INVENTE PAS** : la bande des quatre marques décrit un
objet **possédé** *(`locked`, `equipped`, `attuned`, la quantité)*. Sur une étagère de boutique les
quatre tombent à « non » et la bande rend **14 blg sur 48** qui ne disent rien. On garde la bande
vide *(le comportement actuel)* ; dire *« ce que tu possèdes déjà »* serait une règle neuve.

---

### 🔴 `b1` DÉSIGNE DEUX OBJETS — LA FICHE DU CATALOGUE S'APPELLE `X2`
📍 `equipement-la-fiche-du-catalogue-est-un-x2` · vivante · 20/09
⚖️ **La fiche d'un objet du CATALOGUE est un `X2` ; celle d'un objet POSSÉDÉ est un `X1`. ⛔ Aucune des deux n'écrit dans le belt.**

> Eric, 2026-09-16, déjà dans le code : **« les x ne s'inscrivent pas dans le belt »** —
> `shell.mjs` le cite et nomme la paire : *« une fiche d'objet (X1, X2) n'écrit jamais »*.

🔴 **LE MOT EXISTAIT DANS LA LOI ET NULLE PART AILLEURS.** Le dépôt ne porte que `x1-ecran.mjs` et
`x1-disposition.mjs` ; la fiche qui s'ouvre depuis Wares est codée sous le nom de vue **`b1`** — *le
même mot que le rang B1, qui est le sac*. ⛔ **Un nom, deux objets** : c'est la faute que ce dépôt
repaie tous les quinze jours, et elle se répare en prenant le nom que la loi donnait déjà.
📌 **ET CE N'EST PAS UN ÉCRAN NEUF** : il existe, il marche, et son `BACK` rend Wares avec son rayon,
sa sous-catégorie et sa page — 📏 mesuré au navigateur le 20/09. Seul son nom change.

---

### 🪙 LA BOURSE À DROITE, LES DEUX TALLY À GAUCHE — CENTRÉS PAR LA GRILLE
📍 `equipement-wares-bourse-et-tally-centres` · vivante · 20/09
⚖️ **Sur la dalle 3, la bourse occupe la cellule de DROITE et les deux Tally celle de GAUCHE, centrés sur les deux axes. ⛔ Le centre ne s'écrit pas — c'est une cellule `1fr` qui enjambe les rangées et porte `place-self: center`.**

> Eric, 2026-09-20 : **« la bourse peut se trouver à droite, les Tally à gauche, centrés
> horizontalement et verticalement dans le rectangle vide »** · **« sur la 3e dalle »** · puis, en
> le voyant venir : **« ils seront effectivement entre 2 lignes »**.

⭐ **LA COLONNE DU MILIEU VAUT 96 PARCE QUE `Send to` EST LE PLUS LARGE**, ⛔ pas 87, la largeur du
collecteur. C'est le plus large qui pose la piste ; le collecteur se centre dedans.
🔴 **ET CETTE RÈGLE CORRIGE UNE DÉRIVE QUE LE SAC TRAÎNE.** 📏 Mesuré dans `sac-disposition.mjs` :
la bourse y est centrée sur une marge de **4** *(x 276)* et les deux Tally sur une marge de **8**
*(x 32 et 80)* — **deux règles pour une même rangée**, et 2 blg d'écart vertical entre les trois.
⭐ La phrase d'Eric n'en pose qu'UNE, et les trois organes retombent sur le même axe.
⛔ **J'AVAIS D'ABORD CENTRÉ SUR LA BANDE DU COLLECTEUR, ET C'ÉTAIT TROP ÉTROIT.** Le rectangle vide
est ce qui reste de la dalle **entière** une fois retirées la colonne centrale et la rangée du pied
— il enjambe donc les deux lignes, ce qu'Eric a confirmé avant que je le montre.

---

### 🚪 LE PIED DE WARES DIT `Gear · Send · Backpack` — LE TRIANGLE SE REFERME
📍 `equipement-wares-pied-triangle` · vivante · 20/09
⚖️ **Chaque écran d'équipement porte les DEUX portes qu'il n'est pas. ⛔ `Equipment` est le nom de l'ÉTAPE, jamais d'un écran.**

> Eric, 2026-09-20 : **« le 3e bouton c'est backpack »**.

| l'écran | son pied |
|---|---|
| **R** *(Gear)* | `Backpack · Send · Wares` |
| **B1** *(le sac)* | `Gear · Send · Wares` |
| **Wares** | `Gear · Send · Backpack` |

⭐ **PAS DE TROU, PAS DE PORTE VERS SOI-MÊME**, et le `Send` du milieu fait partout la même chose :
il vide le collecteur vers la destination choisie, ou, s'il est vide, ouvre la liste d'envoi.

---

### 🔗 LA PLAQUE DE WARES **SUIT** LE TAMBOUR, ⛔ ELLE NE JOUE PAS UN FILM
📍 `equipement-wares-la-plaque-suit-le-tambour` · vivante · 21/09
⚖️ **La plaque se déplace À CHAQUE IMAGE du défilement du tambour, en suivant sa position FRACTIONNAIRE. ⛔ Ce n'est pas une animation jouée après coup : c'est un verrou, et c'est la même mécanique que le sac.**

> Eric, 2026-09-19 : **« je fais défiler une tuile à travers le viseur, je fais défiler une dalle
> en même temps… ILS SONT LIÉS »**. Et le 21/09, en me renvoyant au code du sac : **« regarde le
> code de backpack et regarde ce qui se passe sur une transition de plaque »**.

🔴 **CE QUE J'AVAIS LIVRÉ EN v778, ET C'ÉTAIT FAUX DE NATURE.** J'avais écrit une TRANSITION : on
tape, le tambour tourne, il se pose *(~400 ms)*, l'étape repeint, **et alors** un film de ~460 ms se
joue. Deux mouvements successifs pour un seul geste — et pendant un vrai glissé du tambour, la
plaque ne montrait **rien**, puis sautait. 📏 Mesuré sur les deux écrans, même sonde, aimantation
coupée :

| tuiles parcourues | 0 | 0,25 | 0,5 | 0,75 | 1 | 1,5 | 2 |
|---|---|---|---|---|---|---|---|
| **sac** | 0 | 106 | 215 | 321 | 427 | 641 | 855 |
| **Wares — v778** | 0 | **0** | **0** | **0** | **0** | **0** | **0** |
| **Wares — le verrou** | 0 | **78** | **159** | **237** | **315** | **474** | **632** |

⭐ **ET C'EST LÀ LA LOI GÉNÉRALE** : *« on voit une dalle entrer et une dalle sortir »* n'est pas
une animation qu'on **joue** — c'est la **conséquence** du fait que la plaque suit le doigt. Une
animation jouée après coup **raconte** le mouvement ; elle ne le **fait** pas. ⛔ Et la différence
se voit : pendant tout le trajet du doigt, la version « film » ne montre rien.

🔴 **ET LA PLAQUE EST LA DALLE ENTIÈRE, ⛔ PAS SON BLOC DE JETONS** — Eric, 2026-09-21, après le
croquis et deux explications : *« je veux que **TOUTE LA DALLE** se déplace vers la droite ou la
gauche et que la dalle suivante apparaisse dans l'écran ; tout tu me le fais mais **à l'intérieur
d'une dalle** »*. J'avais fait défiler les 12 jetons dans la colonne du milieu *(277)* en laissant
le cadre — voile, liseré, gouttières, filigrane — **planté**.
⭐ **ET LE SAC L'ÉCRIT DÉJÀ, EN TOUTES LETTRES**, sur `.sac-dalles` : *« le trait de coupe vit sur
CHAQUE DALLE, pas ici : **une fenêtre encadrée montre un trou fixe, une dalle encadrée voyage avec
le sien** »*. ⛔ J'avais le croquis **et** le code, et j'ai quand même mis trois versions à le lire.
📏 **LA PLAQUE VAUT DONC LA SCÈNE (375)**, la fenêtre aussi, et le jour `375 × 8 / 57 = 52,63` —
celui du sac au centième, **parce que c'est le même objet**. Mesuré : six dalles aux places
`0 · 428 · 855 · 1283 · 1711 · 2138`, soit un pas de **427,63**.
🔴 **ET LA FENÊTRE REND LA VERTICALE À LA PAGE (`touch-action: pan-y`), ⛔ ELLE NE PREND PAS
`none`.** J'avais écrit `none` en croyant dire *« je ne prends aucun geste »* ; `none` dit
l'inverse — **je les prends tous et je n'en rends aucun**. 📏 Or cette fenêtre fait la scène
entière, et la page défile vraiment sous elle : `echelle.mjs` porte `ECHELLE_PLANCHER = 0.96`,
*« sous le plancher l'app ne rétrécit plus : elle DÉBORDE, et la page défile. C'est le choix
d'Eric »*. Un doigt posé là aurait donc été **piégé** : ça glisse partout sauf sur la moitié de
l'écran. ⭐ `pan-y` rend la verticale et ne prend rien de l'horizontal — exactement ce qu'on veut
d'une dalle qui n'est pas glissable au doigt ; le sac dit la même chose en miroir (`pan-x`,
*« le geste vertical reste à la page, l'horizontal est à nous »*).
📌 **ET `touch-action` S'INTERSECTE AVEC LES ANCÊTRES** : un `none` posé haut ne se rattrape pas
plus bas. ⭐ Repéré par Agent Equipment, vérifié dans `echelle.mjs` avant d'être corrigé — ⛔ un
avis de pair se mesure comme un autre.

⛔ **ET LA FENÊTRE NE PORTE NI VOILE NI LISERÉ** : un seul voile par bande, sinon 35 % par-dessus
35 % — la faute qu'Agent Equipment a livrée et qu'Eric a diagnostiquée avant lui.
📌 **CE QUI DIVERGE DU SAC, ET JE LE NOMME** : là-bas les gouttières sont sorties dans la bande
fixe ; ici elles **voyagent avec leur dalle**, parce qu'Eric a dit *« toute la dalle »* et parce que
chaque plaque annonce alors **son** compte et **sa** page. Une gouttière restée fixe dirait les
chiffres d'une dalle pendant qu'on en regarde une autre.

⚖️ **CE QU'IL FAUT POUR SUIVRE : QUE LES PLAQUES SOIENT DÉJÀ LÀ** — Eric, 21/09 : *« il faut
uniquement la première page de chaque dalle »*. Une plaque par sous-catégorie, chacune sur sa
**page 1**, ⛔ sauf la courante qui porte la page où le joueur est. 📏 Coût borné, mesuré : la
catégorie la plus fournie en porte 7, soit **7 plaques / 84 jetons** — ⛔ pas les 47 plaques /
564 jetons qu'il faudrait pour poser toutes les pages de tout.
⛔ **ET CE QUI N'EST PAS SOUS LE VISEUR NE SE TABULE PAS** *(`inert`)* : six plaques hors champ,
c'est 72 boutons invisibles sur le chemin de la touche Tab.

⛔ **LE SENS INVERSE RESTE COUPÉ** — *« la dalle de Wares ne sera pas swipable car elle a plusieurs
pages »*. Le sac a deux meneurs possibles et un arbitre ; ici le tambour mène **toujours**, la piste
ne reçoit aucun geste *(`touch-action: none`)*. ⭐ Un seul écrivain, donc **pas d'arbitre à tenir** —
c'est la moitié du mécanisme du sac qu'on ne reprend PAS, et je le dis pour qu'on ne la cherche pas.
⛔ **ET LE SUIVEUR N'AIMANTE PAS**, ni ne défile « en douceur » : une aimantation `mandatory` refuse
toute position intermédiaire *(mesuré dans le sac : 383 au lieu de 563 à mi-chemin)*, et une inertie
ajoutée ferait traîner la plaque derrière le doigt. **L'aimantation appartient au meneur.**

🔴 **DEUX PIÈGES DE MESURE, ET ILS M'ONT FAIT CONCLURE FAUX TROIS FOIS.**
1. **`offsetLeft` se compte depuis le plus proche ancêtre POSITIONNÉ.** Sans `position: relative`
   sur la piste, les plaques rendaient **49 · 365 · 681** — la gouttière était dans le compte, et la
   piste se serait posée 49 blg à côté. Après : **0 · 316 · 632**.
2. **Une poignée de nœud PÉRIMÉE rend 0 en silence.** Un repeint remplace les nœuds ; une sonde qui
   garde sa référence mesure un écran mort et conclut que rien ne bouge. ⭐ Une sonde doit
   **ré-interroger le document à chaque pas**.

⛔ **ET LE VERROU NE PASSE PAS PAR UNE VARIABLE DE MODULE.** Mon premier jet en utilisait une, parce
que le tambour se construit avant la dalle 2. 📏 Sonde à l'appui : le suiveur était bien appelé
*(`p = 0,507`)* mais sa piste rendait **`isConnected: false`** — la variable avait déjà été
réassignée par le rendu suivant, et le tambour d'un écran écrivait dans la piste d'un autre.
⭐ **La parade est structurelle** : la piste naît **avant** le tambour, et le tambour reçoit une
**fermeture** qui la tient. Les deux naissent et meurent ensemble ; il n'y a plus rien à tenir
d'accord. 📌 *Une indirection par l'état du module est un trou par construction* — rien n'y garantit
que les deux bouts appartiennent au même rendu.

🔴 **ET UNE MESURE SUR DES FRACTIONS PROPRES NE PROUVE RIEN** — c'est Agent Equipment qui m'a
repris : *« tes 78 / 159 / 237 / 315 sont des fractions propres, donc probablement des positions
que l'aimantation ne corrige pas ; mes trois vérifications vertes tombaient toutes sur des crans
déjà alignés, et le défaut vivait exactement entre les points que je n'avais jamais mesurés »*.
⭐ **Le témoin est une position SALE, et une IMAGE.** Mesuré à `0,37` tuile : la piste rend
**159,30** pour `427,63 × 0,37 = 158,22` attendus — **0,8 blg** d'écart, qui est l'arrondi de mise
en page *(374 rendu pour 375 au plan)*, ⛔ pas une correction d'aimantation.

⭐ **ET LA PLACE D'UNE PLAQUE SE LIT, ⛔ ELLE NE SE MULTIPLIE PAS** : entre deux plaques il y a un
jour, donc `largeur × k` n'est pas la place de la plaque `k`. On encadre entre deux places lues dans
la mise en page et on interpole avec la fraction — c'est `placeDeLaPiste(p, xs)`, une fonction pure,
tenue par son garde.

---

### 📦 LE COLLECTEUR DE WARES PORTE UNE ÉTAPE DE PLUS, ⛔ PAS CELUI DU SAC
📍 `equipement-le-collecteur-de-wares-a-une-etape-de-plus` · vivante · 21/09
⚖️ **Déposer dans le collecteur de Wares n'envoie rien. `Send` ouvre une fiche X2 qui demande la destination et TRANCHE LE PAIEMENT. ⛔ UNE exception : le Tally, qui ne paie pas — c'est un contenant PROVISOIRE, et le paiement a lieu SUR lui.**

> Eric, 2026-09-21 : **« le collecteur de Wares fait une étape supplémentaire. Après l'appui sur
> Send, Gear, Backpack, Party bag, Craft. Il faut décider si on paye ou si c'est gratuit, donc
> fiche X2. Exception les fiches Tally, car elles sont un container provisoire, et c'est sur le
> Tally qu'aura lieu le paiement. »**

⭐ **CE QUI DISTINGUE WARES DU SAC, ET C'EST TOUT L'ÉCART.** Dans le sac, le collecteur déplace un
objet **qu'on possède déjà** d'un contenant à un autre : rien à payer, donc `Send` suffit. Dans
Wares, le collecteur fait **entrer** un objet du catalogue dans le personnage — et une entrée pose
une question que le sac n'a jamais à poser : *cet objet, on le paie ou il est offert ?*
⛔ **CE N'EST DONC PAS LE MÊME ORGANE À UNE ÉTAPE PRÈS** — c'est le même organe avec une DÉCISION
derrière. Un `Send` de Wares qui se contenterait d'envoyer ferait entrer gratuitement tout ce que le
joueur touche.

⚖️ **LE TALLY EST L'EXCEPTION, ET SA RAISON EST SA NATURE** : il ne possède pas, il **retient**.
Y déposer n'est pas acquérir, c'est mettre de côté. ⭐ Le paiement se déplace donc avec l'objet :
il aura lieu **au Tally**, à la sortie, ⛔ pas à l'entrée. Un contenant provisoire qui ferait payer
transformerait une hésitation en achat.
📌 C'est la même famille que *« CART c'est Tally »* (20/09) : le Tally **est** le panier, et un
panier se paie une fois, au passage en caisse.

⚖️ **RÉPONDU LE MÊME JOUR, ET GRAVÉ AVEC LA QUESTION** — Eric, 21/09 : **« la fiche X2 s'ouvre sur
un Send, pas au moment du choix de destination. C'est le réglage du dropdown Send to qui décide de
X2 ou pas X2. C'est dans la fiche X2 ou dans le Tally qu'il y a résolution du paiement et envoi vers
la destination. Le Tally saute X2. »**

| la question posée | la réponse |
|---|---|
| qui porte les quatre destinations | le **menu `Send to` du pied** — il existe déjà |
| quand la X2 s'ouvre | **sur `Send`**, ⛔ pas au choix de la destination |
| qui décide s'il y a une X2 | **le réglage du menu `Send to`** : la destination commande |
| le Tally | il **saute la X2** |
| où se résout le paiement | **dans la X2, ou dans le Tally** — et c'est le même endroit qui envoie vers la destination |

⭐ **CE QUE ÇA ÉCLAIRE** : la X2 n'est pas un dialogue de confirmation, c'est **le lieu de la
résolution**. Paiement et envoi s'y font ensemble, ⛔ pas l'un puis l'autre ailleurs — une somme
débitée sans que l'objet parte, ou l'inverse, serait un état que rien ne rattrape.
📌 **Et la destination COMMANDE le chemin** : c'est le menu qui décide s'il y a une X2. Le Tally
n'en a pas parce qu'il ne conclut rien ; il retient, et c'est lui qui conclura plus tard.

⏳ **CE QUI RESTE OUVERT, UN SEUL POINT** : *« payer ou gratuit »* — le joueur **choisit** sur la
X2, ou le système le **déduit** du contexte *(équipement de départ offert, achat payé)* et la X2 ne
fait que l'annoncer ? *« Résolution »* ne dit pas lequel des deux.

⏳ **ET L'ORDRE DES TRAVAUX EST DICTÉ** *(Eric, 21/09)* : *« on câblera l'aller-retour Send juste
avant d'attaquer la fiche X2 »*. ⛔ **Donc pas maintenant, et ce n'est pas un oubli.**
📏 Ce qui existe aujourd'hui, mesuré : le dépôt sur le collecteur de Wares part **droit au panier**
(`cartAdd`), et le collecteur est un `<div>` qui porte le mot *« SEND COLLECTOR »* — il reçoit, mais
il ne **montre** pas ce qu'il tient. ⭐ C'est pour ça que l'aller-**retour** ne marche pas : il n'y a
rien à reprendre. Le jour venu, on prend l'organe du sac, ⛔ on n'en redessine pas un second.

---

### 🎚️ LA TUILE AU REPOS EST VOILÉE À 20 %, ⛔ PLUS TRANSPARENTE
📍 `cadre-la-tuile-au-repos-est-voilee` · vivante · 21/09
⚖️ **Une tuile de tambour au repos porte `--dalle-cran` (20 %). La posée garde `--dalle-inter` (50 %). ⛔ L'écart entre les deux est ce qui DÉSIGNE — il ne se referme pas.**

> Eric, 2026-09-21 : **« pour les tuiles non sélectionnées rajouter du voile sur le fond à 20 ou
> 35 % serait plus joli je pense »**, puis, tranché : **« voile des tuiles à 20% »**.

🗄️ **CE QU'ELLE REPREND, ET LA RÈGLE D'AVANT N'ÉTAIT NULLE PART ICI.** Eric avait dit le 19/09,
en regardant le belt : *« de transparent à plein, c'est plus efficace »* — et **le fond est le
SIGNE** reste vrai. ⛔ Mais cette règle-là ne vivait que dans un commentaire de `shell.css` et dans
l'assertion d'un garde, **pas dans ce corpus** : il n'y a donc aucune ancre à citer, et c'est
précisément pour ça que celle-ci s'écrit ici. 📌 *Une règle orale n'existe pas* — et une règle qui
ne vit que dans le test qui la tient ne peut être ni relue, ni amendée, ni même contredite
proprement.
⭐ **CE QUI CHANGE EST L'ÉCHELLE** : elle va désormais **d'à peine à plein** au lieu de **rien à
plein**. La tuile au repos cesse d'être un trou dans la dalle sans cesser d'être en retrait.
⭐ **ET C'EST UN JETON, ⛔ PAS UNE COULEUR** : `--voile-cran: 20%` et
`--dalle-cran: color-mix(in srgb, var(--surface) var(--voile-cran), transparent)` — le même patron
que `--dalle-simple` et `--dalle-inter`. Le jour où `--surface` change, les trois suivent ensemble.
📌 **ET LE GARDE NE SE CONTENTE PAS D'ACCEPTER LA NOUVELLE VALEUR** : il vérifie que l'**écart**
entre le repos et la posée subsiste *(au moins 20 points)*. Un garde qui lâcherait la contrainte
en même temps que la valeur laisserait disparaître la distinction qu'il est là pour tenir.

---

### 🏷️ UN NOM QUI DIT UNE FORME NE DIT PAS DE QUOI IL PARLE
📍 `socle-un-nom-qui-dit-une-forme` · vivante · 21/09
⚖️ **Un identifiant qui nomme la FORME de ce qu'il rend *(« un mot », « une chaîne », « une liste »)* sans dire de QUOI il parle se branche tout seul au mauvais endroit. ⛔ Et la faute ne se voit qu'au rendu.**

🔴 **L'INCIDENT, MESURÉ LE 21/09.** Wares recevait `bourse: motDeLaBourse(docu)`. `motDeLaBourse`
ne rend **pas** le contenu de la bourse : il rend `null`, ou la phrase *« Choose a class … to get
your starting gold »*. Wares affichait donc une **phrase** là où R et le sac reçoivent les quatre
monnaies, et le popup lisait `enGP(<phrase>)` — soit **0**, silencieusement.
⭐ **LE NOM M'A TROMPÉ** : *« mot de la bourse »* s'entend comme *« la bourse, en mots »* ; il dit
en réalité *« ce qu'on annonce à qui n'a pas encore de classe »*. Le sac, lui, prend
`currentCurrency(docu)` — un nom qui dit **la chose**.

⭐ **ET L'AUTRE MOITIÉ DE LA LEÇON EST SUR L'INTERPOLATION.** Le nom accessible se fabriquait par
`` `Purse — ${o.bourse}` ``. Le jour où la donnée est devenue un objet, le bouton a rendu
**« Purse — [object Object] »**. 📏 Un gabarit qui interpole une donnée dont on ne connaît pas la
FORME est une bombe à retardement : il est juste tant que la forme ne change pas, et muet le jour où
elle change. ⛔ **La réparation n'est pas de reformater le nombre à cet endroit** — c'est de le dire
**une seule fois**, par l'organe dont c'est le métier *(le voyant du montant)*. Un organe, un
message ; deux endroits qui annoncent la même somme divergent au premier arrondi.

---

### 🪟 UN ÉCRAN QUI DÉCLARE LA SCÈNE ENTRE DANS LA LISTE DU SOCLE
📍 `cadre-un-ecran-entre-dans-la-liste-du-socle` · vivante · 21/09
⚖️ **Un écran qui déclare la largeur de SCÈNE (375) doit être membre de la règle du socle qui ressort de la gouttière de la carte. ⛔ Sinon il est plus large que la boîte qui le tient, et son bord droit est coupé — sans qu'aucune cote ait l'air fausse.**

> Eric, 2026-09-21, en regardant Wares en ligne : **« tu dois aussi constater que le bord droit de
> la dalle n'a pas de liseré, est-ce à cause d'une superposition ? ou autre chose ? »**

⭐ **AUTRE CHOSE, ET C'EST MESURABLE.** 📏 Relevé au navigateur le 21/09 : `.decision-card` rend
**367** blg — la scène moins la gouttière de 4 de chaque côté — quand un écran d'équipement déclare
**375**. `.gear`, `.x1` et `.sac` ressortent de cette gouttière par
`margin-inline: calc(-1 * var(--stage-gouttiere))` et rendent donc **375 à fleur de `.stage`**.
`.wares`, absent de la liste, restait **collé à gauche** et débordait de **4 blg à droite au-delà de
`.stage`**, dont l'`overflow: auto` coupait le dépassement. Le liseré du bord droit tombait
exactement dans ce qui était coupé.

📌 **POURQUOI SEUL LE BORD DROIT SE VOYAIT** : le débord est d'un SEUL côté. Une boîte trop large
mais centrée perdrait ses deux bords, et la symétrie ferait croire à un défaut de peinture ; une
boîte trop large et alignée à gauche n'en perd qu'un, et l'œil lit *« il manque un trait »* au lieu
de *« la boîte est trop large »*. ⭐ **Le symptôme désigne le bord ; la cause est la LARGEUR.**

⛔ **ET AUCUN GARDE DE FICHIER NE POUVAIT LE DIRE** : la cote 375 est juste, elle vient du plan, elle
est dans la feuille. Ce qui manquait est une APPARTENANCE — et une appartenance absente ne s'écrit
nulle part. ⭐ C'est la famille de *« une absence n'est jamais une réponse »* appliquée à une liste :
un écran qui n'est pas dans la liste n'y est pas écrit en creux, il n'y est pas.

⭐ **ET LA RÉPARATION EST TOUJOURS LA MÊME** : entrer dans la liste, ⛔ jamais recopier son bloc.
C'était la **quatrième** fois du chantier Wares — après `.wares-porte`, les trois organes d'échange
et la tuile du tambour. 📌 Le garde qui tient ça vit dans `tests/x1-ecran.test.mjs` §7, et il a
fallu le **généraliser** : il épelait la liste `.gear, .x1, .sac` et accusait donc l'arrivée d'un
membre — c'est-à-dire exactement ce que la loi veut. ⛔ **Un garde qui épelle une liste garde la
liste, pas la règle.**

---

### 🥁 LE TAMBOUR DE WARES EST UNE DALLE, COMME SES DEUX VOISINES
📍 `equipement-wares-tambour-est-une-dalle` · vivante · 21/09 · remplace la règle orale du lot 222
⚖️ **Les trois bandes de Wares sont trois DALLES : même voile à 35 %, même liseré. ⛔ Le tambour n'est pas une exception.**

> Eric, 2026-09-21 : **« il doit y avoir une dalle sous les 2 tambours »**.

🗄️ **CE QUI EST ARCHIVÉ, AVEC L'INCIDENT QUI L'A PAYÉ.** Au lot 222 j'avais RETIRÉ cette dalle, et
le garde de l'écran exigeait le contraire : *« le tambour ne porte plus de voile : le viseur s'y
noyait, et l'aura avec »*. 🔴 Je l'avais tiré d'un mot d'Eric du 20/09 — *« il faut aussi dégager le
fond sombre »* — **et ce mot parlait du fond des TOKENS**, dans une phrase qui ne parle que d'eux
*(« il faut que tu autorises les espaces vides à droite et à gauche des tokens »)*.
⛔ **J'AI ÉLARGI UNE CONSIGNE D'UN ORGANE À SON CONTENANT.** C'est la faute générale, et elle a un
nom : une consigne porte sur ce qu'elle NOMME. Le contenant n'est pas « le fond » de ce qu'il
contient — il est un organe à lui, avec sa propre matière, et il aurait fallu le demander.
⭐ **ET LA RÈGLE RETIRÉE N'AVAIT JAMAIS ÉTÉ ÉCRITE ICI** : elle vivait dans un commentaire de garde,
c'est-à-dire nulle part. 📌 *Une règle orale n'existe pas* — et une règle qui ne vit que dans le
test qui la tient ne peut pas être relue par celui qui la contredit.

---

### 📏 LA CALE D'UN RUBAN : UNE IDENTITÉ, ET UNE HAUTEUR
📍 `cadre-la-cale-d-un-ruban` · vivante · 21/09
⚖️ **La cale qui permet au premier et au dernier cran d'atteindre le viseur vaut `piste / 2 − tuile / 2 − écart`. ⛔ Pas la moitié du vide. Et elle porte une DIMENSION TRANSVERSE, sans quoi elle n'existe pas pour le défilement.**

> Eric, 2026-09-21 : **« problème de centrage sur les crans de droite, et ça bloque »**.

⭐ **DEUX FAUTES DANS UN SEUL ORGANE, ET AUCUNE NE SE VOYAIT DANS UN FICHIER.**

**1 · L'IDENTITÉ.** Le ruban est un flex : il pose un écart entre la cale et le premier cran, comme
entre deux crans. La cale n'est donc pas la moitié du vide — c'est la moitié du vide **moins cet
écart**. À 137 au lieu de 129, centrer le cran `k` réclamait `écart + pas × k` quand le module écrit
`pas × k`. 🔴 **ET LE `scroll-snap` RATTRAPAIT LES 8 BLG** : l'organe était faux et rendait juste,
tant qu'il restait de la course. ⛔ **Un organe qui n'est juste que grâce à un correcteur n'est pas
juste** — il attend le jour où le correcteur n'a plus de marge, et ce jour-là c'est le dernier cran.

**2 · LA HAUTEUR.** La cale est un élément VIDE dans un ruban en `align-items: center` : sa hauteur
rendue vaut **0**. 📏 **Une boîte de hauteur nulle ne crée aucun débordement** — `scrollWidth`
s'arrêtait au dernier CRAN (**527**) au lieu d'inclure la cale de queue (**672**), la course maximale
tombait à **196** là où le dernier cran en réclame **325**, et les crans de droite ne pouvaient plus
atteindre le viseur. ⭐ **Témoin direct et reproductible en une ligne** : donner une hauteur à la
cale — `10px`, ou même un `.` de contenu — fait sauter `scrollWidth` de **527 à 672**.

⛔ **ET C'EST UNE LARGEUR NULLE QUI N'EST PAS UNE ABSENCE, RETOURNÉE** : la cale est déclarée, elle
est dans le DOM, sa largeur est juste, la bijection plan ↔ DOM est verte. Ce qui manquait est une
dimension **transverse**, que personne ne regardait. ⭐ Même famille que *« le ruban prend la hauteur
de sa roue »* : une hauteur **rendue** n'est pas une hauteur **déclarée**.

🔴 **AMENDEMENT DU 21/09 — LA FORMULE VIT DANS LE MODULE QUI POSE LA CALE**, ⛔ plus chez chaque
écran. 📏 Mesuré sur le sac : depuis le lot 218, `roue-tambour.mjs` POSE deux cales, et la feuille
du sac ne les dimensionnait pas — elles rendaient **0 × 0**. Son ancien `padding-inline: 137px` était
toujours là, et **une cale vide reste un élément flex** : elle ajoutait un écart de 8 ENTRE le
rembourrage et le premier cran. Relevé avant / après : `scrollLeft` de centrage
**8 · 73 · 138 · 203 · 268** contre un code qui écrit **0 · 65 · 130 · 195 · 260** ; après, les deux
listes sont **identiques**.
⛔ **ET C'EST UNE RÉGRESSION QUE J'AI INTRODUITE** en extrayant le module, sur un écran qui marchait
— cachée trois jours par le `scroll-snap`. ⭐ **La leçon : un organe que le module POSE, c'est le
module qui dit de quelle taille il est.** Personne d'autre ne sait *pourquoi* il a cette taille-là :
elle n'est pas décorative, elle est la condition de l'invariant que ce module tient. Laisser cette
moitié chez l'appelant, c'est la loi `cadre-organe-partage-voyage-avec-ses-cotes` prise à l'envers.
📌 `coteDeLaCale({piste, tuile, pas})` est une **fonction pure** : le module reste sans chiffre.

📌 **LE GARDE DE L'IDENTITÉ EST ARITHMÉTIQUE** *(`tests/roue-tambour.test.mjs` §10, qui vérifie les
DEUX tambours sur leurs cotes réelles, et `tests/wares-plan.test.mjs` §13)*, et il a été éprouvé
rouge avec la formule fautive. ⚠️ **Le garde de la course *(§14)* reste VERT à 137, et je l'écris** : la
géométrie permettait la course, c'est le rendu qui la refusait. Un témoin qui ne peut pas accuser
l'incident qui l'a fait naître doit le DIRE, sans quoi son vert se lit comme une innocence.

---

### 👛 UN ORGANE PARTAGÉ VOYAGE AVEC SES COTES
📍 `cadre-organe-partage-voyage-avec-ses-cotes` · vivante · 21/09
⚖️ **Importer le DOM d'un organe partagé sans importer ses RÈGLES n'est pas le partager : c'est en refaire un second, en creux. ⛔ Un organe est un DOM *et* ses cotes.**

> Eric, 2026-09-21 : **« je veux le popup de la bourse centré sur celle-ci et que son rendu soit
> idem à Gear et backpack »**.

🔴 **MESURÉ : Wares importait `popupDeLaBourse` et n'appelait jamais `reglesDeLaBourse`.** Le popup
sortait donc **sans cotes**, dimensionné par son contenu, posé où le flux voulait. ⭐ C'est **mot
pour mot** la faute réparée sur le sac la veille, et elle y était déjà écrite : *« un organe partagé
dont la moitié reste chez son premier hôte n'est pas partagé »*.
📌 **CE QUI SE DONNE À L'APPEL, ⛔ ET NE SE DEVINE PAS** : la portée *(`.wares`)*, l'ANCRE *(la
bourse du plan de l'écran)*, la dalle, et le haut de la dalle — R compte sous le belt, les autres non.

⚖️ **ET LE SERRAGE EST LA LOI, PAS UN DÉFAUT** *(Eric, 16/09)* : centré sur une bourse posée près du
bord, le popup sortirait de l'écran. 📏 Relevé le 21/09 sur Wares : bourse centrée en `x = 303,25`,
popup de 186 — un centrage exact le poserait de `210` à `396`, soit **21 blg hors d'une dalle de
375**. Il est donc serré à `x = 185`. ⭐ *« Centré sur celle-ci »* et *« serré dans la dalle »* ne
se contredisent pas : le serrage est ce qui rend le centrage tenable au bord.

---

---

### ➡️ `NEXT` VIT DANS **R**, ⛔ PAS DANS WARES — ET LE CART EST LE TALLY
📍 `equipement-next-vit-dans-r` · vivante · 20/09
⚖️ **Le bouton qui termine l'étape Équipement appartient à `R` (Gear). ⛔ Wares ne le porte pas — et ce qui s'appelait `CART` est le `Tally`, qui existe déjà.**

> Eric, 2026-09-20, en relisant ce qui manquait au nouveau Wares : **« en fait le next devra être
> dans R »** · **« Cart c'est tally tu l'as déjà fait »** · **« sur ton plan il y a un collecteur,
> une go to et un send juste en dessous. donc rien à faire de plus »**.

🔴 **ET C'EST MOI QUI AVAIS SURESTIMÉ LE TROU.** J'avais compté CINQ organes perdus en passant de
l'ancien Wares au neuf — `NEXT`, la loupe, `CART`, `CRAFT`, `TO GEAR DROP`. 📏 Vérifié contre le
plan, il en restait **deux** : `CART` est le `Tally` *(posé)*, `TO GEAR DROP` est le
`SEND COLLECTOR` *(posé)*, et `CRAFT` est **mort** — mesuré au navigateur, aucun écouteur.
⭐ **Un inventaire par NOM d'un écran qu'on remplace compte les libellés, pas les fonctions.** Deux
mots différents pour le même organe se comptent deux fois, et un organe mort se compte comme vivant.
⛔ La bonne lecture n'est pas *« quels boutons disparaissent »* mais *« quelle FONCTION n'a plus de
porte »*.
⏳ **CE QUI RESTE DÛ, ET LES DEUX SONT DATÉS** : `NEXT` doit naître dans R *(il n'y est pas
aujourd'hui — mesuré)*, et la **loupe** attend son lot — Eric : *« une chose que nous devons faire
oui. Pas ce soir. »*

---

### 🎒 LA PORTE VERS LE PARTY INVENTORY ATTEND QUE LE `?` ET LE LIVRE PARTENT
📍 `equipement-porte-party-inventory-au-pied` · vivante · 19/09
⚖️ **Le jour où le `?` et le livre quittent la fiche du joueur, un bouton vers le PARTY INVENTORY prend leur place, à GAUCHE de `Gear`. ⛔ Pas avant.**

> Eric, 2026-09-19, en demandant explicitement qu'on la mémorise : **« lorsqu'on n'aura plus besoin
> de `?` et livre, un bouton qui va vers le party inventory à gauche de Gear. Note importante à
> mémoriser. »**

⭐ **CE N'EST PAS UNE TÂCHE, C'EST UN RENDEZ-VOUS**, et c'est pour ça qu'elle est écrite ici plutôt
que faite. Le `?` et le livre occupent aujourd'hui les **deux bornes** de la rangée du pied (§6 pré,
la grille `borne | 1fr | borne`). Tant qu'ils sont dus, poser ce bouton ferait **six organes dans
une rangée qui en tient cinq**.
📌 **ET SA PLACE EST DANS LE GROUPE DES MAJEURS, PAS SUR UNE BORNE** : *« à gauche de Gear »* — donc
dans le `1fr` du milieu, avec les portes, pas à l'extérieur avec les ronds.
⭐ **POURQUOI CETTE PORTE EXISTE** : le party inventory est *« un autre backpack »* (Eric, 19/09),
partagé par tout le groupe, et on n'y entre aujourd'hui que par un **cran de la roue** du sac. Une
porte au pied de la fiche le rendrait atteignable sans passer par l'équipement.
⏳ **Ce qui la déclenche n'est pas daté** : c'est le jour où le guide et le livre cessent d'être dus,
et cette décision-là n'est pas prise.

---

### 👆 UN ORGANE À DEUX VISAGES : UN SEUL RÉCLAME LE PLANCHER TACTILE
📍 `cadre-le-plancher-tactile-se-mesure-sur-le-visage-qui-se-tape` · vivante · 18/09
⚖️ **Le plancher de 44 se mesure sur le visage qu'on TAPE, pas sur celui qui n'existe qu'à la souris. ⭐ Et une cible qui le réclame ne sort JAMAIS de la dalle : ce qui dépasse est clippé, donc perdu.**

> Eric, 2026-09-18 au soir : **« les tuners sont pour la souris, donc les 44 hors sujet. Les chevrons
> eux ont besoin des 44 ; pas grave si ça dépasse un peu sur la dalle adjacente. »**

⭐ **LE MÊME ORGANE, DEUX VISAGES** : au repos c'est un **chevron**, qu'on tape — il lui faut ses 44.
Au survol il devient le **tuner** à molette, qui n'existe qu'à la souris. Je mesurais le plancher sur
le mauvais visage, et j'en concluais une impasse qui n'en était pas une.
📏 **CE QUI L'A RÉVÉLÉ, ET IL A FALLU REGARDER AU TÉLÉPHONE** : `.sac` porte `overflow: hidden`, donc
une cible qui sort de la dalle est **clippée — partout**, pas seulement sur un petit écran. Le
chevron gauche, centré sur un dessin de 10 posé à 4 du bord, courait de **−13 à 31** : il n'en
restait que **31 de touchable**.
⛔ **ET LE GARDE DES CIBLES NE POUVAIT PAS LE VOIR** : il vérifie la boîte **déclarée**, jamais ce
qu'il en reste à l'écran. Un plancher se mesure sur ce que le doigt atteint.
⚖️ **CE QUE LE RABATTEMENT COÛTE, ET ERIC L'ACCEPTE** : la cible mord alors **22 blg sur le cran
voisin** au lieu de 9. *« Pas grave si ça dépasse un peu sur la dalle adjacente »* — ⭐ et la raison
tient : un cran est un organe **du tambour**, dont la cible est la roue entière ; un chevron est un
bouton à lui seul.
🔴 **J'AVAIS FAIT L'INVERSE D'ABORD, ET JE L'AI ANNULÉ** : j'ai rabattu, vu les 22 blg volés au cran,
et reculé — en croyant réparer, j'avais rendu l'écran pire. ⭐ C'est Eric qui a tranché le vrai
partage, et il n'était dans aucune de mes deux versions : *le plancher n'appartient pas à l'organe,
il appartient au GESTE*.
📌 **CONSÉQUENCE SUR LA FEUILLE** : les quatre bords transparents se déduisent des **écarts réels**
dessin/cible, ⛔ plus d'une symétrie. Pour toute cible centrée ils rendent les mêmes nombres — c'est
une généralisation, qui attendait qu'une cible cesse d'être centrée pour devenir nécessaire.
⚠️ **ET ELLE A UNE SECONDE CONSÉQUENCE, PAYÉE LE LENDEMAIN** — la section suivante.

---

### 🔑 UN LIEU SE RECONNAÎT À SA NATURE, ⛔ PAS À LA FORME DE SA CLEF
📍 `equipement-le-lieu-ne-se-lit-pas-dans-la-forme-de-la-clef` · vivante · 19/09
⚖️ **Une décision qui porte sur ce qu'une chose EST ne se prend jamais sur la FORME de son identifiant. ⛔ Et une décision qu'aucun garde ne peut interroger vit dans un fichier qui n'exporte rien : sortez-la.**

> Eric, 2026-09-19 au soir : **« que le drag and drop fonctionne à nouveau car ce n'est plus le cas »**.

🔴 **CE QUE ÇA FAISAIT.** `placerGearLine` décidait `location` en testant `/^s\d+$/` sur la boîte.
Or la clef du party bag est un **MOT** (`party`), choisie précisément pour ne pouvoir entrer en
collision avec aucun numéro. Elle échouait donc au test, tombait dans le `else` final, et l'objet
déposé dans le sac du groupe ressortait **`location: "self"`, équipé sur le personnage**.
⚠️ **ET LE COMMENTAIRE JUSTE AU-DESSUS DÉCRIVAIT LA FAUTE** : *« sans cette branche, un objet glissé
dans le sac s'y retrouvait équipé »*. La branche existait. Elle ne couvrait pas ce cas — et une prose
juste au-dessus d'un test étroit **endort** au lieu d'alerter.
⛔ **AUCUN GARDE NE POUVAIT L'ATTRAPER**, parce que la décision vivait dans `shell.mjs`, **qui
n'exporte rien**. Le seul témoin qui la visait lisait son TEXTE (`/auSol \? "ground" : "self"/`) : il
tenait la forme d'une décision, jamais son résultat. ⭐ La loi est sortie (`lieuDeLaBoite`,
`seRange`) ; elle a maintenant un témoin qui l'interroge, et il rougit sur `'self' !== 'storage'`.
⭐ **LE CRITÈRE EST DEVENU SÉMANTIQUE** : `sN` et `party` sont deux écritures d'une même idée — *« ça
se range, ça ne se porte pas »*.

---

### 🖌️ UN GESTE QUI TRAVERSE LES RENDUS NE PEUT PAS CAPTURER SON REPEINT
📍 `cadre-le-repeint-se-relit-il-ne-se-capture-pas` · vivante · 19/09
⚖️ **Un rappel de fin de geste doit RELIRE le repeint courant, jamais garder celui du rendu qui l'a armé. ⛔ `peindre()` écrit dans LE NŒUD DE SON RENDU : appelé après un `act`, il peint dans un nœud détaché — et l'écran reste figé sur un état qui n'existe plus.**

🔴 **MESURÉ DANS L'APPLICATION LE 19/09 AU SOIR**, en posant le déplacement des sections. Le geste
ÉCRIT l'ordre à chaque croisement ; chaque écriture fait refabriquer le nœud de l'étape par la
coquille. Au lâcher, la fermeture qu'on tenait était celle d'avant le PREMIER croisement : l'état
retombait (`deplacementSac = null`) et **le mode restait allumé à l'écran**. Deux `pointerup`
successifs n'y changeaient rien — la preuve que ce n'était pas l'événement qui manquait.
⭐ **C'EST LA MÊME LOI QUE LA MARGE, DANS L'AUTRE SENS.** `equipement-glisser-dans-la-marge-relit-l-ecran`
dit déjà qu'un glisser doit **LIRE** l'état au dépôt, pas celui du rendu qui l'a armé. Elle vaut
aussi pour **ÉCRIRE** : le repeint se relit (`repeindreLeSac`, réassigné à chaque rendu), il ne se
capture pas.
📌 **CE QUI DISTINGUE CE CAS DES AUTRES RAPPELS** : tous les autres (`surSection`, `surTourner`…)
partent d'un clic sur le DOM courant, donc leur fermeture est fraîche par construction. Seul un
geste qui **dure** traverse les rendus. ⛔ La règle ne vise donc que ceux-là — l'élargir à tous
serait une indirection payée pour rien.

---

### 📐 UNE BOÎTE A DEUX DIMENSIONS — ET LA SORTIE EST CELLE QU'ERIC A NOMMÉE
📍 `cadre-une-taille-se-valide-sur-les-deux-dimensions` · vivante · 19/09
⚖️ **Une taille ne « passe » que si elle passe en LARGEUR *et* en HAUTEUR. ⛔ Et quand elle ne passe pas, on prend la sortie qu'Eric a nommée — on ne serre pas une cote qu'il n'a pas donnée pour sauver la sienne.**

> Eric, 2026-09-19 au soir, sur les deux mots du `+` : **« si ça passe en T1 fais en T1 italique »** · **« ou T0 italique »**.

⭐ **SA RÈGLE EST UNE MESURE, PAS UN GOÛT** : essaie le grand, tombe au petit s'il ne rentre pas.
🔴 **ET J'AI FAILLI M'ARRÊTER À LA PREMIÈRE DIMENSION.** En largeur T1 passait : `backpack` rend
**48,05** pour **48,46** utiles — de **0,41 blg**, et j'allais conclure. C'est la **hauteur** qui
refusait : la pile `10 + 14 + 10` à l'interligne du cran (1,15) fait trois lignes de
**12 + 17 + 12 = 41** dans un cran de **40**. Relevé dans l'application : `scrollHeight 41 >
clientHeight 40`, et `.sac-cran` porte `overflow: hidden` — ⛔ **un blg rogné, en silence**.
⛔ **ET LA TENTATION ÉTAIT DE SERRER L'INTERLIGNE** pour garder le T1. C'eût été inventer une cote
qu'Eric n'a pas donnée, alors qu'il avait lui-même nommé la sortie. ⭐ *Quand un contenu ne rentre
pas, on lui retire quelque chose ou on prend la porte qu'on nous a montrée ;* ⛔ *on ne rétrécit pas
la pièce autour de lui.*
🛡️ **LE TÉMOIN** : `tests/sac-ecran.test.mjs` n° 21 — il **refait l'addition** depuis les jetons
(`--t0`, `--t3`), l'interligne écrit dans `.sac-cran` et la hauteur du cran **dans le plan** ;
⛔ il ne recopie aucun nombre, donc il refait le calcul si un jeton bouge. Éprouvé rouge en
remettant `--t1` : *« les trois étages font 41 blg (12 + 17 + 12, interligne 1.15) dans un cran de
40 »* — **les mêmes nombres que le navigateur**, obtenus autrement. ⭐ Deux témoins indépendants
qui tombent sur le même chiffre, c'est ce qui distingue une mesure d'une coïncidence.
📌 **LA LARGEUR, ELLE, NE SE CALCULE PAS SOUS NODE** (pas de métrique de police) : elle se mesure
dans l'application, et le chiffre est écrit dans `shell.css`. ⛔ Un garde qui prétendrait la tenir
mentirait sur ce qu'il sait.

---

### 📐 UNE COTE DU PLAN QUE NUL ORGANE PEINT NE LIT EST INERTE
📍 `cadre-une-cote-que-nul-organe-ne-lit-est-inerte` · vivante · 19/09
⚖️ **Un organe dont le DESSIN est peint par un enfant (`::before`, pastille, corps) doit faire lire à cet enfant la boîte que la feuille construite pose. ⛔ Une taille propre à l'enfant est un SECOND ÉCRIVAIN : le plan peut alors bouger sans que rien ne suive, et sans que rien ne le dise.**

> Eric, 2026-09-19 au soir : **« j'ai demandé dessin 30×30 / tactile 44×44 »**.

🔴 **CE QUI L'A RÉVÉLÉ EST UN QUASI-ACCIDENT.** J'allais changer `POIGNEE` de 40 à 30 dans
`backpack_gen.py`, régénérer, recopier verbatim — le geste juste, dans le bon ordre — et **rien
n'aurait bougé à l'écran**. La pastille colorée, seul dessin visible d'une poignée, valait
`--sp-24` **en dur** pendant que la table déclarait 40. ⛔ Deux cotes pour un organe, dont aucune
ne tenait l'autre d'accord.
⚠️ **ET LE SILENCE ÉTAIT TOTAL** : les tests seraient restés verts (ils lisent la table), le diff
aurait été propre, la Bible régénérée, et j'aurais rapporté un changement qui n'existait pas.
📏 **CE QUI L'A ATTRAPÉ** : avoir demandé *« avec quoi ce vert est-il peint ? »* **avant** de
toucher aux bords — et la réponse fut un troisième mécanisme que je n'avais pas dans ma liste
(`gear-porte::before` peint déjà son 40 par `--bouton-retrait-v`, `.sac-tuner` par un masque sur
sa boîte de contenu, `.sac-poignee` par une pastille à cote propre). ⭐ **Trois familles, trois
mécanismes** : une mesure qui n'en connaît qu'un conclut faux sur les deux autres.
🔴 **J'AI D'AILLEURS CONCLU FAUX EN CHEMIN, ET C'EST LA MÊME FAUTE** : ayant relevé que
`border-width` sans `border-style` calcule `0`, j'ai annoncé *« 5 cotes de bord sur 12 sont
jetées »*. ⛔ **Inexact** — pour la famille `gear-porte`, le dessin de 40 est bel et bien peint,
par `::before`, et le `border-width` n'y est que redondant. ⭐ *Une mesure demande trois lectures :
déclaré · rendu · **et par quel organe***.
⭐ **LA RÉPARATION EST UN RETRAIT** : `inset: 0` fait tenir à l'enfant la boîte de contenu du
parent — c'est-à-dire exactement le dessin que `feuilleDesCotesSac()` pose. ⛔ Plus aucun littéral,
et un seul écrivain.
🛡️ **LE TÉMOIN** : `tests/sac-ecran.test.mjs` n° 15, ③ — il exige `inset: 0` **et refuse** toute
`inline-size`/`block-size` propre à la pastille. Éprouvé rouge en lui rendant son `--sp-24`.

---

### 🪞 UN MIROIR SE PREND SUR LE DESSIN, PAS SUR LA CIBLE
📍 `cadre-un-miroir-se-prend-sur-le-dessin` · vivante · 19/09
⚖️ **Dès qu'un dessin est DÉCENTRÉ dans sa cible, toute transformation qui le retourne doit prendre son origine sur le DESSIN — `transform-box: content-box`. ⛔ Par défaut `transform-origin` se résout sur la boîte de BORDURE, et le glyphe se déplace de la différence des deux bords.**

> Eric, 2026-09-19, sur le sac en ligne : **« le chevron droit est mal placé »**.

🔴 **LA BOÎTE ÉTAIT JUSTE ET LE DESSIN FAUX** — exactement la famille du livre et du `?` de la veille,
et pour la même raison : ce qui s'était décroché n'était pas la boîte. La cible du chevron gauche
mesure `0..44`, celle du droit `331..375` : **symétriques au blg près**. Donc `getBoundingClientRect`
ne voyait rien, le garde des cotes ne voyait rien, et **2322 témoins verts ne disaient rien**.
📏 **MESURÉ DANS L'APPLICATION, PAR LA PORTE `Backpack`, AVEC UN VRAI PERSONNAGE** : dessin déclaré
`361..371`, **peint `335..345`** — 26 blg à gauche, **par-dessus le mot du dernier cran**, qui lisait
« Storage » au lieu de « Storage 2 ». ⭐ Le symptôme visible n'était pas le chevron : c'était un mot
tronqué qu'on aurait cherché dans la largeur du cran.
⚖️ **LA CAUSE** : `transform-origin` prend par défaut le centre de la boîte de bordure — **22**. Or
depuis le 18/09 (section ci-dessus) le dessin d'un tuner est décentré dans sa cible, centre **35**.
Mirer autour de 22 ce qui est centré sur 35 le déplace de `2 × (35 − 22)` = **26**, soit exactement
`bord gauche − bord droit` (`30 − 4`). ⭐ **Zéro tant que la cible est centrée** : voilà pourquoi la
faute est née le jour même du rabattement, et pas avant.
⭐ **LA RÉPARATION DIT LA MÊME PHRASE QUE LE GLYPHE, AU MIROIR** : `background-clip: content-box` dit
déjà *« peins-toi dans le dessin, pas dans la cible »* ; `transform-box: content-box` dit
*« retourne-toi autour du dessin, pas autour de la cible »*. ⛔ **Elle n'écrit aucune cote** : 26 ne
figure nulle part, il se déduit des bords.

🔬 **ET LE PIÈGE DE MESURE, QUI COMPTE PLUS QUE LA FAUTE** : `getComputedStyle(n).transformOrigin`
rend **`22px 22px` dans les deux cas** — avec et sans `transform-box`. Un témoin bâti dessus aurait
conclu *« rien n'a changé »* et **menti dans le sens rassurant**. ⭐ Ce qui a tranché est une **sonde
posée dans la boîte de contenu** (un enfant à `width/height: 100%`) : son rect subit le transform de
son parent, donc il dit où le dessin **se peint**. ⚖️ *Une origine ne se lit pas dans la propriété qui
la nomme — elle se lit dans ce qu'elle déplace.*

🛡️ **LE TÉMOIN** : `tests/sac-ecran.test.mjs` n° 20, **éprouvé rouge** (message : *« TUNER G et TUNER D
ont un dessin DÉCENTRÉ dans leur cible (écarts 4/30 · 30/4), et la feuille les mire »*). ⭐ Il
s'ancre sur la **DONNÉE** — il ne pose la question que pour les organes que `sac-disposition.mjs` dit
décentrés, et se tait tout seul si le plan les recentre. ⛔ Et il **refuse d'être tautologique** : il
exige d'abord qu'un miroir existe, sinon il accuse au lieu de passer vert sur un écran vide.

---

### 🖐️ LE GLISSER SURVIT AU REPEINT — DONC SON RAPPEL DOIT RELIRE L'ÉCRAN
📍 `equipement-glisser-dans-la-marge-relit-l-ecran` · vivante · 18/09
⚖️ **Un glisser qui fait défiler l'écran sous lui doit LIRE l'état au moment du DÉPÔT, jamais celui du rendu qui l'a armé. ⛔ Sinon on glisse jusqu'à la section 3 et l'objet atterrit dans la 1 — sans que rien ne crie.**

> Eric, 2026-09-18 : **« le drag dans la marge fait défiler latéralement les sections en maintenant
> le fantôme, ce qui permet de le déplacer d'une section à l'autre »**.

⭐ **CE GESTE N'EST POSSIBLE QUE PARCE QUE `glisser.mjs` A DÉJÀ PAYÉ LA FACTURE** (lot 205,
*« il reste bloqué là où tu le vois »*) : les écouteurs vivent sur `document`, le fantôme sur
`document.body`, et la visée passe par `elementFromPoint`. Le geste ne tient donc à **aucun nœud de
l'écran** — on peut reconstruire toute la grille sous lui.
🔴 **ET C'EST EXACTEMENT CE QUI CRÉE LE PIÈGE.** Le rappel qui s'exécute au dépôt est la fermeture du
rendu **d'AVANT** le défilement. S'il referme sur la section et la page, il écrit les anciennes.
⭐ **LA PARADE** : ce qui peut changer pendant le geste se tient en état de **MODULE**
(`sectionSac`, `pageSac`) et se **relit** dans le rappel. ⛔ Jamais dans la fermeture.
⭐ **ET LE MINUTEUR AUSSI SE TIENT AU MODULE** — la loi de `gesteVivant`, *« ce qui est partagé se
tient au module, pas dans une fermeture »*. En fermeture il **fuit** : chaque cran repeint, donc crée
un nouvel objet d'écran, pendant que l'ancien minuteur continue. La roue serait partie toute seule.
📏 **MESURÉ AU NAVIGATEUR, PAS À PAS** : `Potions` → seuil franchi, fantôme posé → entré dans la
marge à +30 ms : `Composants` → maintenu à +500 ms : `Trésor` → relâché : `Trésor`, et plus rien ne
tourne.
⛔ **LA MARGE NE S'INVENTE PAS** : c'est tout ce qui est HORS de la largeur de la grille, et cette
largeur vient du plan. Et le facteur du zoom se **lit** (`facteurZoomCourant`) — un rectangle rend
des pixels PEINTS quand la mise en page est en blg, et mélanger les deux familles donne un résultat
juste au cran 1 et faux partout ailleurs.

---

### 🗄️ `STORAGE` N'EST PAS UNE DESTINATION DU CHAPITRE — SEULEMENT UNE LIGNE DE POIDS
📍 `equipement-storage-nest-plus-une-destination` · vivante · 18/09
⚖️ **On n'envoie plus rien vers `storage` : le chapitre ne lui donne aucun écran, et un envoi vers un endroit qu'on ne peut pas regarder est un objet perdu. ⭐ Ce qui y est déjà rangé se LIT, sur la ligne `Other` du panneau de poids.**

> Eric, 2026-09-18, devant l'ancien sac : **« le remise c'est quoi ? »** — et la question était la
> bonne réponse. « La remise » est un mot que j'avais inventé pour `storage` ; lui l'appelle
> **Other**, et il l'a défini le 16/09 : **« Other c'est des trucs que tu portes pas — genre mon
> cheval ce qu'il porte, coffre dans mon château etc… nommable par le joueur »**.

⛔ **LA SOURCE DU CHAPITRE NE LE PORTE PAS COMME DESTINATION.** Son `SEND TO ▾` a huit entrées —
*« Backpack · Gear · Party inventory · Companion · Group PC · Merchant/NPC · Tally · Craft »* — et
`Storage` n'en est pas. C'était un reste de la tuyauterie d'avant l'écran R.
📏 **MESURÉ LE 18/09, ET C'EST CE QUI A TRANCHÉ** : la SEULE porte au monde vers l'écran de la remise
(`sb33`) était l'ANCIENNE liste du sac, atteinte par la porte `Backpack`. Le jour où cette porte
ouvre le sac B1, `sb33` devient injoignable — mais **deux écrans offraient encore `→ Storage`**
(`renderB1`, `renderB2`). Un objet envoyé là n'aurait plus jamais pu être regardé.
⭐ **LA RÈGLE QUI EN SORT, ET ELLE VAUT POUR TOUT LE PRODUIT** : *une destination n'existe que si son
écran existe.* Le dropdown le disait déjà pour `Tally` et `Craft` — il les montre `actif: false`
plutôt que de laisser choisir. `Storage` n'avait pas ce garde-fou.
⛔ **RIEN N'EST SUPPRIMÉ, ET RIEN N'EST PERDU** : le code de `sb33` dort, `poidsParLieu` compte
toujours `storage`, et la 4ᵉ ligne du panneau le dit à l'écran. Un personnage sauvegardé garde ses
objets ; on ne peut simplement plus en ajouter.
⏳ **ET LE PÉRIMÈTRE D'OTHER EST EXPLICITEMENT NON TRANCHÉ DANS LA SOURCE** (*« si la monture est un
conteneur ou un companion »*). Le jour où Eric lui donne une porte, la destination revient avec elle.

---

### 📦 CHAQUE OBJET DU SAC OCCUPE UNE PLACE, ET ELLE EST AU DOCUMENT
📍 `equipement-une-place-dans-une-section` · vivante · 18/09
⚖️ **`gear[N].place` numérote la case d'un objet DANS sa section. La page n'est pas un organe : c'est une division de la suite des places — page = place ÷ la grille.**

> Eric, 2026-09-18, trois réponses d'un coup : **« tighten up ok »** · **« plus de place, ça
> va dans la page suivante ou celle d'après, prochain emplacement dispo, voire ça crée une page
> supplémentaire si besoin »** · **« oui évidemment, le rangement fait partie des caracs du perso ;
> ça doit survivre à la session au même titre que les autres changements »**.

⭐ **LES TROIS RÉPONSES NE FONT QU'UN SEUL MODÈLE, et c'est ce qui les rend courtes.** Une grille
qui se tasse toute seule n'a **ni trou à fermer** (donc *« tighten up »* ne veut rien dire), **ni
page suivante** où déborder, **ni rangement à garder**. Dès que chaque objet a une place : le trou
existe, le débord prend la première place libre, et le rangement s'écrit.
⛔ **C'EST POUR ÇA QUE J'AVAIS REFUSÉ D'ÉCRIRE `tighten up` À LA PREMIÈRE PASSE** — et j'avais
raison de refuser plutôt que de deviner : dans le modèle d'alors, le bouton n'aurait rien fait.
📏 **LE CHEMIN EST MESURÉ CONTRE LE MOTEUR**, même protocole que `boite`, `attuned` et `locked` :
zéro `moduleViolation` neuve, zéro `warning` neuf, zéro `underived` neuf, les chemins ressortent en
`unconsumed`, et `clear` ne laisse rien. ⭐ **Et la mesure est restée un test** (`P1`) au lieu d'être
perdue avec la session qui l'a faite.
⛔ **UNE LIGNE SANS PLACE GARDE SON RANG DE DOCUMENT** : les personnages sauvegardés avant ce lot
s'ouvrent entiers, et le premier rangement leur en écrit une. Une absence n'est pas une faute, c'est
l'état d'avant.
⭐ **`Tighten up` EST LE PREMIER DU POPUP, et ce n'est pas un hasard** : c'est le seul des quatre qui
**respecte** le rangement du joueur — il ferme les trous sans rien réordonner. Les trois autres
rangent, donc ils effacent ce qu'il a fait ; lui le condense.
⛔ **ET LA PLACE PART AVEC LA BOÎTE** : elle numérote une case DANS une section. Un objet qui quitte
le sac n'a plus de place ; celui qui y revient en reçoit une neuve, la première libre.
⏳ **CE QUI N'EST PAS TRANCHÉ** : le geste TACTILE qui tourne la page. À la souris, la molette sur la
grille la tourne — l'idiome du tuner, qu'Eric a demandé pour la roue. Au doigt, il manque un
balayage, et ⛔ il ne s'invente pas.

---

### 🔴 UNE MESURE NE VAUT QUE CONTRE UNE SOURCE EXTÉRIEURE
📍 `socle-mesurer-contre-la-source-jamais-contre-son-plan` · vivante · 18/09
⚖️ **Un écran se mesure contre l'ARTEFACT, une loi de NORMES, un écran déjà en production ou l'œil d'Eric. ⛔ Jamais contre la table qu'on vient d'écrire soi-même.**

> Eric, 2026-09-18, en regardant l'écran en ligne après trois déploiements : **« heu, il manque plein
> de choses, tu as déployé, t'as fait quoi ? »** · **« t'as fait de la grosse merde là »**.

⛔ **LA FAUTE, NOMMÉE** : chaque *« ✓ mesuré »* que j'annonçais comparait l'écran au plan que j'avais
écrit **moi-même**. Une boucle fermée est cohérente ; elle ne peut pas voir qu'elle est fausse.
⭐ **ET LES CINQ FAUTES QUI ONT COMPTÉ ONT TOUTES PASSÉ LES GARDES** — la dalle au voile de R au lieu
du sien, les trois images absentes, les deux glyphes absents, la roue qui refusait de boucler, le
livre et le `?` dont le cercle s'était décroché. Les 2308 tests étaient verts à chaque fois.
📌 **D'OÙ LA CONDUITE** : ① lire la source **avant** d'ouvrir un fichier ; ② regarder l'écran RENDU,
à côté d'un écran du même rang, **avant** d'annoncer quoi que ce soit ; ③ écrire le garde **après**
avoir vu la faute, et l'éprouver **rouge** avant de le laisser vert.

---

### 📏 UNE MESURE DE POSITION NE VOIT PAS UN DESSIN QUI SE DÉCROCHE
📍 `cadre-les-bornes-gardent-leur-ancre` · vivante · 18/09
⚖️ **Le livre et le `?` restent `position: relative` dans une rangée. ⛔ `static` les décroche de leur cercle — et une mesure de leur BOÎTE ne le voit pas.**

> Eric, 2026-09-18, sur le sac en ligne : **« je ne parle même pas du livre et du ? qui sont mal
> centrés »**.

⛔ **C'ÉTAIT DÉJÀ ÉCRIT DANS `shell.css` (§6 pré, 02/09), mot pour mot** : *« `relative`, JAMAIS
`static` — et ça a coûté une livraison. Ces deux bornes portent leur cercle en `::before` ABSOLU ;
passées en `static`, le cercle s'ancre sur l'ancêtre positionné le plus proche et se dessine À CÔTÉ
du glyphe »*. Je l'ai reproduit en posant `data-organe` sur les enfants de la rangée du sac, puis en
défaisant leur `absolute` avec un `static`.
📏 **CE QUE J'AVAIS MESURÉ, ET POURQUOI ÇA NE DISAIT RIEN** : 44 × 44, colonnes 44 / 279 / 44 —
identiques à R. Les **boîtes** l'étaient ; c'est le **dessin** qui était parti, `::before` à
`left: 11px` dans une rangée de 367, soit ~300 blg du glyphe.
⭐ **LA PARADE EST DE TUER LA CAUSE, PAS DE POSER UNE EXCEPTION** : aucun écran ne marque les enfants
de sa rangée de pied avec `data-organe`. R ne l'a jamais fait — ses portes portent `data-porte`, ses
bornes ne portent rien, et la grille partagée les range.

---

### ⛔ CE QUI NE SE DEVINE JAMAIS — sept drapeaux déclarés
📍 `socle-ce-qui-ne-se-devine-jamais` · vivante · 27/08
⚖️ **L'écran DÉCLARE son gabarit par sept drapeaux nommés et le catalogue DESSINE — ⛔ rien ne se devine d'après les nœuds rendus.**

`railEtroit` · `railEtiquette` · `titreDansLaFiche` · `corpsEstUneDalle` · `retourInterne` ·
`sansDone` · `motDuRetour`. ⭐ **L'écran DÉCLARE, le catalogue DESSINE.** Deviner le gabarit d'après
les nœuds rendus a coûté deux passes le 15 août ; un sélecteur par GENRE (`[data-kind="arcana"]`) a
été refusé par le garde du vocabulaire — la feuille décrit une **géométrie**, jamais une couche.

---

## 4 quinquies. 📐 LE SOUS-ÉCRAN (SB) ET LE BILAN DU B *(dictés au banc, nuit du 27/08)*
📍 `budget-gabarit-du-sb` · vivante · 27/08
⚖️ **Le gabarit du SB est le squelette du B transposé, et c'est le scroll qui récupère le rab.**

> Eric : **« en SB lineage : le texte doit être dans une fenêtre scroll »** · **« il faut une
> place pour l'aiguilleur sous la fenêtre »** · **« une harmonie de principe B, SB1 et SB2 »** ·
> **« c'est le scroll qui récupère le rab »**.

### Le gabarit du SB — le squelette du B, transposé
📍 `budget-sb-ancienne-consigne-degagee` · remplacée · 27/08
⚖️ **L'ancienne consigne du glisser et la saignée d'avant-pied ont dégagé du SB.**

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
📍 `ecriture-bilan-en-mode-texte` · vivante · 27/08
⚖️ **Le bilan d'un B parle en mode texte : une tête, puis les niveaux dessous.**

> Eric : **« si on met tout en mode texte : "High Elf Lineage" · "Skill budget" · en dessous les
> niveaux — Delve novice (en italique), Survival novice (en italique) »**.

| l'item réglé | sa tête | dessous |
|---|---|---|
| le lignage | **High Elf Lineage** — `motDe` sans parenthèses, le sous-titre capitalisé | la mise en mots du lignage (ci-dessous) |
| la bourse | **Skill budget**, nu — le « spent » de la porte n'a plus rien à dire | *Delve novice, Survival novice* — **une ligne, en italique**, chaque skill étant un lien |

### La mise en mots d'un lignage — UNE source, trois consommateurs
📍 `ecriture-une-source-trois-consommateurs` · vivante · 27/08
⚖️ **La mise en mots d'un lignage a UNE source, lue par trois consommateurs.**

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
📍 `cadre-exception-nommee-dragonborn` · vivante · 02/09
⚖️ **Le SB des lignages du Dragonborn sert sa bande d'aiguilleur à la place de sa table, et l'exception est nommée par un ID DE RECORD (`LIGNAGES_SANS_TABLE`) — ⛔ jamais un seuil ni un `:nth-child`.**

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
📍 `ecriture-ce-qu-trait-accorde-se-lit-coup-il` · vivante · 02/09
⚖️ **Un texte de trait servi à l'écran tient en ≤ 102 caractères — la cote DONNÉE du plus long condensé du dépôt — et un trait sans condensé sert sa prose plutôt qu'un blanc.**

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
📍 `socle-trait-qui-depend-choix-appartient-a-lignee` · vivante · 02/09
⚖️ **Un trait dont le CONTENU change avec l'option choisie appartient à la lignée, ⛔ jamais au bloc *Granted automatically*.**

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

### 🤝 DEUX MÉTHODES POUR POSER UN JETON, ET JAMAIS UNE SEULE
📍 `geste-deux-methodes-pour-poser-un-jeton` · vivante · 07/09
⚖️ **Partout où un vivier alimente des collecteurs, DEUX méthodes coexistent : le glisser-déposer, et le popup d'information dont le pied porte les boutons qui posent.**

> **Eric**, 2026-09-07, titre compris : **« Alternative au drag and drop »**
> *« **Méthode 1** : Possibilité alternative au drag and drop. tap / clic droit, pour lire ;
> boutons et **back / select** au pied de la description pour le placer direct dans le collecteur
> ou revenir en arrière ; toujours possible aussi de tap / clic en dehors pour quitter le popup.
> **Méthode 2** : drag and drop dans le collecteur. »*

⭐ **CE N'EST PAS UN GESTE DE PLUS, C'EST UNE SECONDE ROUTE VERS LE MÊME ACTE.** Le glisser demande
de viser ; le popup demande de lire puis d'appuyer. ⛔ Un écran qui n'offrirait que le glisser
oblige à connaître le jeton **avant** de le prendre — or c'est justement le popup qui le fait
connaître. *La méthode qui informe doit pouvoir conclure ce qu'elle a fait comprendre.*

📌 **ELLE ÉTEND `geste-tap-info-clic-droit-info`, ELLE NE LA REMPLACE PAS.** Cette règle-là *(NORMES
§7 ter)* dit depuis le 16/08 que **tap au doigt** et **clic droit à la souris** ouvrent la même
fenêtre d'information ; ce qui est neuf le 07/09, c'est que **le pied de cette fenêtre agit**.
⛔ Aucun lien de supersession n'est posé : l'ancienne est entièrement vraie, la neuve dit ce que la
fenêtre porte **en plus**.

| | le geste | ce qu'il fait |
|---|---|---|
| **méthode 1** | tap *(doigt)* · clic droit *(souris)* | ouvre le **détail**, et son pied porte les boutons qui posent ou qui rendent |
| **méthode 2** | glisser-déposer *(doigt)* · clic gauche *(souris)* | pose **directement**, sans popup — inchangé depuis le 16/08 |

🟢 **ET UN JETON PRIS RESTE VIVANT DANS LE VIVIER.** ⛔ Il ne se grise pas — *« non coloré = non
cliquable »* *(`bouton-gris-non-cliquable`, 06/09)*, et il reste parfaitement cliquable puisqu'on
peut le rendre. Il porte le **halo vert** de la validation (`--positive`) et `aria-pressed="true"`.
⭐ *Un objet qu'on peut encore reprendre n'a pas le droit de se peindre comme éteint.*

✅ **TROIS POINTS QUI ÉTAIENT DES ARBITRAGES DE SIÈGE SONT RATIFIÉS PAR ERIC — 2026-09-07 vers 19:3x.**
⚠️ **Ses trois réponses tiennent en un mot chacune, et c'est pour ça que la QUESTION est gravée à
côté** : *« close »*, *« oui »*, *« a »* ne veulent rien dire seuls. ⭐ *Une réponse d'un mot n'est
une décision qu'accompagnée de sa question — séparées, elles se périment le jour où personne ne se
souvient de ce qu'on demandait.*

| la question posée | Eric | ce que ça fixe |
|---|---|---|
| le bouton qui **ferme le popup sans rien faire** s'appelle-t-il `Close` ? *(Eric avait écrit « back »)* | **« close »** | ✅ **`Close`** — et les deux arguments qui l'avaient fait choisir tiennent toujours : le **SENS** *(un libellé nomme ce que son bouton FAIT ; celui-ci ferme, il ne recule d'aucun écran)* et le **GARDE** *(`shell-wiring.test.mjs:517`, éprouvé rouge : `"Back"` → 1831/1833)* |
| `Select` place-t-il l'outil dans le **premier collecteur libre** ? | **« oui »** | ✅ **le premier libre** — 📏 `const libre = col.indexOf(null)`, vérifié sur `origin/main`. ⛔ Et quand les quatre sont pris, `Select` **n'est pas affiché** : il ne reste que `Close` — *un bouton qui ne ferait rien mentirait* |
| sur un outil **déjà pris**, le bouton de droite est-il `Drop` rouge qui le retire *(A)*, ou `Close` seul avec retrait depuis le collecteur *(B)* ? | **« a »** | ✅ **`Drop`, rouge, il retire** — rouge par la **famille DÉFAIRE** *(`bouton-famille-defaire`)* : le geste rend du travail fait |

📏 **VÉRIFIÉ DANS LE CODE EN LIGNE, `origin/main` `adcfdc2` (v602)** : `mot: "Close"` **1** ·
`"Drop"` **1** · `defait` **3** · et la bascule exacte
`pris ? { mot: "Drop", defait: true … } : (libre >= 0 ? { mot: "Select" … } : null)`.

📌 **TOUTE LA RÈGLE EST DÉSORMAIS DE SA MAIN** : les deux méthodes coexistent ·
le tap et le clic droit lisent · le pied de la description agit · un tap en dehors ferme le popup.
⏳ **LE CÂBLAGE VIT SUR `173-skills-dalles`, ET ELLE N'EST PAS POUSSÉE** — `c1f8fc7` · `498a925`
*(l'alternative : tap lit, `Close` · `Select` au pied)* · `c161f3f` · `107628b`. 📏 Vérifié :
`origin/main` est à `43a62c8` (v601) et n'a **aucun** `onInfo` passé au sélecteur.

⛔ **ET J'AI ÉCRIT LE CONTRAIRE ICI, SUR UNE MESURE FAUSSE — corrigé le 07/09.** J'avais compté
`grep -c onInfo` = **2** sur `origin/main` et conclu que c'était fusionné. 🔴 **Les deux occurrences
étaient DANS LE COMMENTAIRE QUI L'INTERDIT** : *« ⛔ PAS D'`onInfo` ICI »*. Le mot réellement passé
en argument : **zéro** sur `origin/main`, **un** sur la branche.
⭐ *Une ABSENCE n'est jamais une réponse — et une PRÉSENCE n'est jamais une preuve.* Le corpus
portait déjà la première moitié ; voici la seconde, et elle m'a coûté une affirmation gravée.
📌 Le geste juste tenait en une ancre : `grep -cE "^\s*onInfo\s*:"` — la **déclaration**, pas le mot.

### 🔎 UN MOT SE COMPTE DANS SA FORME D'EMPLOI, JAMAIS EN TEXTE LIBRE
📍 `socle-un-mot-compte-dans-la-phrase-qui-le-nie` · vivante · 07/09
⚖️ **Compter un mot en texte libre le compte AUSSI dans les phrases qui l'interdisent, le commentent ou le regrettent — une mesure de présence vise la FORME D'EMPLOI, jamais le mot nu.**

🔴 **L'INCIDENT, LE 2026-09-07.** `grep -c onInfo` rendait **2** sur `origin/main` ; les deux étaient
dans *« ⛔ PAS D'`onInfo` ICI »*. J'en ai conclu qu'un câblage existait, je l'ai **écrit dans le
corpus**, et j'ai contredit un relais qui avait raison. ⭐ **Le commentaire était sous mes yeux dans
ma propre sortie** — le chiffre a été plus fort que la lecture.

⛔ **CE N'EST PAS UNE FAUTE D'INATTENTION, C'EST LA FORME D'UN OUTIL.** Un dépôt qui documente ses
interdits — ce que celui-ci fait à chaque ligne — **contient le mot autant de fois qu'il l'interdit
que lorsqu'il l'emploie**. Plus le corpus est discipliné, plus le comptage nu ment.
📌 **La parade est toujours la même et elle est courte** : ancrer sur ce qui **déclare**
*(`^\s*onInfo\s*:`, `^📍`, `^export function`)* plutôt que sur le mot. C'est la loi du garde
appliquée à une mesure : *un garde se fonde sur la DONNÉE, jamais sur la FORME* — ici, sur la
**forme d'emploi**, jamais sur l'occurrence.
⭐ **ET C'EST LA MÊME FAMILLE QUE LE FILTRE LEXICAL QUI A ÉCHOUÉ AU TRI DES COUPLES** *(06/09 :
« une règle qui n'emploie pas le mot est invisible »)*. Les deux bouts du même outil : il **rate**
ce qui ne dit pas le mot, et il **compte** ce qui le nie.

🔴 **UNE PAROLE, PUIS SA CORRECTION PAR ERIC — ⛔ pas deux paroles qui se croisent.** J'avais écrit
ici qu'il fallait lui poser une question ; **il n'y en a pas.** La chronologie du 07/09, sur **le
même écran**, celui d'`Add a tool` :

| | ce qu'Eric dit | ce que ça fait |
|---|---|---|
| **06:2x** | *« add a tool ne fonctionne pas, dans ce cas une sélection = halo vert »* | `onInfo` retiré, le tap POSE *(v600, déployé)* |
| **13:1x** | *« Tap sur un tool doit afficher sa description »* | le tap LIT de nouveau |
| **13:2x** | *« Méthode 1 / Méthode 2 »* — la règle ci-dessus | les deux méthodes, partout |

⭐ **L'EXCEPTION DE 06:2x EST DONC MORTE DE LA MAIN D'ERIC, PAS D'UN LOT** : il l'a renversée sept
heures plus tard, **devant ce sélecteur-là**, avant de dicter la règle générale. ⛔ Il n'y a rien à
lui demander, et le commentaire d'interdiction est remplacé dans `498a925` par le bloc qui cite les
deux heures.
⚠️ **CE QUE J'AVAIS ÉCRIT, ET POURQUOI C'ÉTAIT FAUX** : j'avais lu le commentaire de 06:2x sur
`origin/main`, mesuré qu'il tenait toujours, et bâti là-dessus *« deux paroles se croisent, question
à poser »*. Le commentaire tenait — il n'était simplement **pas à jour de la branche en cours**.
⭐ *Deux dates ne se croisent que si personne n'a parlé entre les deux ; avant de nommer un
croisement, demander à celui qui tient l'écran s'il y a un mot au milieu.*

📌 **ET UN DÉTAIL D'ERIC QUE LE PREMIER RELAIS N'AVAIT PAS** : quand les quatre collecteurs sont
pris, **`Select` n'est pas affiché** — le popup n'offre que `Close`. ⭐ *Un bouton qui ne ferait rien
mentirait*, et c'est `bouton-gris-non-cliquable` réglé par l'absence plutôt que par le gris.

📌 Le témoin du lot 173 : *« L'ALTERNATIVE AU GLISSER-DÉPOSER »* dans `tests/skills-step.test.mjs`.

### 🔗 §7 ter — LA LOI GÉNÉRALE DES LIENS

📖 **CETTE LOI TRAVERSE LA FRONTIÈRE, ET LE LIVRE A SON PROPRE CORPUS.** Elle oblige des cibles qui
vivent sur **FH WEB**, et l'ancre qu'elle exige est fabriquée par `fh-phb/sync_from_vault.py`, pas
ici. ➡️ **Côté livre, elle se lisait dans la Web Bible** — ⚠️ **retirée du site le 2026-09-06** —
§ *La fabrique — ce qui vit chez le voisin*. ⚠️ Et la tension entre cette loi et le
**📌 PORTÉE : LE BUILDER** de l'en-tête y est posée telle quelle, non tranchée, en `W4`.
📍 `ecriture-ancre-avant-lien` · vivante · 30/08
⚖️ **L'ancre se fabrique AVANT le lien : une famille sans ancre est une famille qu'on ne peut pas lier.**
📍 `ecriture-lien-en-phrase-se-note` · vivante · 29/08
⚖️ **Un lien à l'intérieur d'une phrase se NOTE, il ne se devine pas.**
📍 `ecriture-loi-des-liens` · vivante · 30/08
⚖️ **Dès qu'un skill, feat, trait, feature, spell, invocation ou training apparaît, il y a un lien vers le site FH Web — ou vers le SRD en mode SRD.**
📍 `ecriture-pas-de-faux-lien` · vivante · 30/08
⚖️ **Un sort introuvable au query s'écrit en texte simple, jamais en faux lien.**
📍 `geste-tap-info-clic-droit-info` · vivante · ?
⚖️ **Sur un token : tap au doigt et clic droit à la souris ouvrent la même fenêtre FF d'information.**
📍 `ecriture-mode-srd-non-cable` · à trancher · 30/08
⚖️ **Le mode SRD (lier vers le SRD au lieu du site) est déclaré et attend son câblage.**

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
📍 `geste-deux-gardes-fous-du-defilement-interne` · vivante · 26/08
⚖️ **La boîte qui défile porte une hauteur (pas la dalle), et on doit VOIR qu'il y a plus.**
📍 `geste-la-page-ne-defile-jamais` · vivante · 26/08
⚖️ **La page ne défile jamais ; une bande de contrôles ne défile jamais ; une liste de jetons pagine.**
📍 `geste-la-prose-defile-les-controles-non` · vivante · 26/08
⚖️ **La ligne de partage est nette : la prose défile, les contrôles non.**
📍 `chevron-sur-une-zone-de-prose` · à trancher · 26/08
⚖️ **Il n'est pas dit si le chevron s'applique aussi à une zone de prose qui défile.**

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

## 6 pré. 🔲 **LA RANGÉE DE CONTRÔLES — DEUX BORNES ET UN GROUPE** *(norme, 2026-09-04)*
📍 `bouton-rangee-controles` · vivante · 04/09 · remplace `bouton-la-paire-encadre-la-rangee`
⚖️ **Une rangée de contrôles est TROIS COLONNES — deux bornes `--touch` et un groupe `1fr` — et c'est le GROUPE qui se centre, pas chaque bouton.**

> Eric, après m'avoir vu échouer **trois fois de suite** : *« la règle est
> toujours la même et la même erreur est faite. Boutons majeurs centrés, `?` et
> livre sur les côtés. **Va falloir que t'y arrives systématiquement.** »* Puis :
> *« tu trouves ta règle générale, tu rends cette installation de boutons une
> norme, qu'on se plante plus »*.

### 🔴 LA FORME, ET ELLE EST UNIQUE
📍 `bouton-forme-et-elle-est-unique` · vivante · ?
⚖️ **Tout ce qui n'est pas une borne entre dans `.rangee-majeurs`, une SEULE cellule en flex : le nombre de boutons cesse d'être une question.**

```
grid-template-columns:  var(--touch) | 1fr | var(--touch)
                        ↑ le livre     ↑ LE GROUPE   ↑ le « ? »
```

**Trois colonnes. Deux bornes. Un groupe.** Tout ce qui n'est pas une borne
entre dans `.rangee-majeurs`, une **seule** cellule, en `flex` avec `gap: 8`.

⭐ **ET C'EST CE GROUPE QUI SE CENTRE, PAS CHAQUE BOUTON.** La conséquence est
toute la norme : **le nombre de boutons cesse d'être une question.** Un, deux ou
cinq, ils se rangent et se centrent sans qu'une règle les compte.

Les quatre rangées du site convergent ici : `.parcours-pied` · `.sortie` ·
`.fiche-actions` · `.card-pied`.

### ⛔ LES TROIS MÉTHODES QUI ONT ÉCHOUÉ — toutes VERTES aux tests
📍 `bouton-trois-methodes-qui-ont-echoue` · vivante · ?
⚖️ **⛔ Jamais une colonne par organe : deux organes dans une même cellule s'EMPILENT, trois dans un même GROUPE se POUSSENT.**

Elles ont échoué **pour la même raison** : elles désignaient *une colonne par
organe*. Le tableau est le cœur de cette norme.

| la méthode | ce qui l'a tuée | mesuré |
|---|---|---|
| `flex` + réserves en `padding` | une boîte flex déborde **par-dessus son propre rembourrage** | **−40** sur le livre, **−40** sur le `?` ; **1 blg** de jeu en anglais |
| colonne par **rang** (`:nth-of-type`) | il compte **par BALISE**, et le livre est un `<button>` | `Next` et le `?` **empilés**, −44 sur quatre écrans |
| colonne par **nom de classe** | deux boutons peuvent porter la **même** classe | `Draw` et `Choose` sont tous deux `.parcours-next` → **empilés à 104** |

🔴 **LA LOI QUI EN SORT : deux organes dans une même cellule s'EMPILENT ; trois
dans un même GROUPE se POUSSENT.** Un groupe n'a pas besoin de savoir combien il
porte ; une grille de colonnes nommées, si — et elle se trompera le jour où le
contenu la démentira.

📌 Et **une quatrième colonne est le signe qu'on recommence** : dès qu'on écrit
`1fr | auto | auto | 1fr` pour serrer deux boutons autour du centre, on est
revenu à désigner des organes. *(Mesuré aussi : deux `1fr` **égaux** écrasent le
plus large des deux — `Cancel` est passé de 171 à **120 blg**, libellé
rogné, sans que rien ne déborde.)*

### ⛔ LA RÉSERVE EN REMBOURRAGE EST INTERDITE — les quatre écrivains
📍 `bouton-reserve-en-rembourrage-est-interdite` · vivante · 04/09 · borne `bouton-reserve-symetrique`
⚖️ **Une borne a une COLONNE, ⛔ jamais une réserve en rembourrage : une colonne existe même vide, tenue par le gabarit et non négociée par le contenu.**

Une borne a une **colonne**, jamais une réserve. Une colonne existe même vide :
la place est tenue par le **gabarit**, jamais négociée par le contenu.

Quatre réserves en `padding` ont été retirées le 04/09, écrites à quatre dates
par quatre lots — `.parcours-pied`, `.fiche-actions` (×2, gauche et droite) et
`.card-porte/.card-final .parcours-pied`. **Chacune avait raison le jour de son
écriture, et aucune ne savait que les autres existaient.**

⭐ *Un besoin satisfait quatre fois n'est pas quatre fois plus sûr : c'est trois
occasions de diverger.* Symptôme mesuré une fois la grille posée : la rangée de
Destiny R faisait **335** pour des colonnes de **291**, et le groupe se centrait
**22 blg à gauche** du milieu. Eric l'a vu à l'œil avant toute mesure.

### 🔴🔴 `position: relative`, **JAMAIS** `static` — la faute qu'on refait à chaque fois
📍 `bouton-position-relative-jamais-static` · vivante · 04/09
⚖️ **Une borne se sort du flottement en `position: relative`, ⛔ JAMAIS `static` — sinon le cercle de son `::before` cherche un autre ancêtre et se dessine à côté du glyphe.**

> Eric, 2026-09-04, en majuscules : *« note ce relative pas static, car cette
> erreur est faite à chaque fois !!! »*

Sortir une borne du flottement se fait en `relative`. **Pas en `static`.**

```css
/* ✅ */  position: relative; inset: auto;
/* ⛔ */  position: static;   inset: auto;
```

**POURQUOI, ET C'EST LA SEULE RAISON QUI COMPTE :** le livre et le `?` portent
leur **cercle** dans un `::before` en `position: absolute`. Une borne en
`relative` est le **bloc conteneur** de ce cercle. Passée en `static`, elle
cesse de l'être — le cercle va chercher l'ancêtre positionné le plus proche et
se dessine **à côté** du glyphe.

📏 **CE QUE ÇA DONNE À L'ÉCRAN** : *deux cercles superposés*, sur le livre comme
sur le `?`, sur **tous** les écrans du site. Eric l'a vu sur son iPad ; **aucune
de mes mesures ne l'avait attrapé** — position, largeur, recouvrement, centre du
groupe, tout était vert. La v525 est partie en ligne avec le défaut.

⚠️ **ET C'EST LA LEÇON GÉNÉRALE, PAS UN DÉTAIL DE CE BOUTON-LÀ :

> **Une mesure de POSITION ne voit pas un dessin qui se décroche.**

Un organe peut être exactement à sa place et *paraître* faux parce que sa
décoration, elle, n'y est plus. Aucun relevé de `getBoundingClientRect()` ne
le dira — il faut **regarder l'image**.

📌 **LE RÉFLEXE** : avant d'écrire `position: static` sur quoi que ce soit,
chercher un `::before` ou un `::after` en `absolute` sur cet organe. S'il y en a
un, la réponse est `relative`. On ne retire jamais une ancre en croyant ne
retirer qu'un flottement.

### 🔴🔴 L'ABSOLU DU 2026-09-04 — **LE LIVRE ET LE « ? » SONT DANS LA *DERNIÈRE* RANGÉE**
📍 `livre-absolu-2026-09-04` · vivante · 04/09
⚖️ **La dernière rangée de boutons d'un écran EST celle qui porte les deux bornes, et un seul écrivain les pose (`poserLesBornes`) — ⛔ « dernière » n'est jamais « celle qu'on trouve ».**

> Eric : *« Livre et `?` toujours dans la dernière rangée. **Dernière rangée de
> boutons = `?` et livre dedans. C'est un absolu.** »*

⭐ **CE N'EST PAS UNE PRÉFÉRENCE DE PLACE, C'EST UNE DÉFINITION.** La dernière
rangée de boutons d'un écran **est** celle qui porte les deux bornes. Il n'y a
donc rien à décider écran par écran : la question *« où mettre le `?` ? »* ne se
pose plus.

⛔ **ET « DERNIÈRE » N'EST PAS « CELLE QU'ON TROUVE ».** `querySelector` rend la
**première**. Les deux lectures du dépôt l'employaient : tant qu'un écran ne
portait qu'une rangée, *première* et *dernière* désignaient le même nœud et la
loi tenait **par coïncidence**. **R Abilities en porte deux depuis ce matin** —
c'est le premier écran où la coïncidence cesse, et c'est ce qui a rendu la règle
visible.

| ce qui était écrit | ce qui l'est |
|---|---|
| ⛔ **trois écrivains** — `renderStepContent` posait le `?`, `poserLaSortie` le livre, `garnirLaSortie` les deux | ✅ **un seul**, `poserLesBornes`, au point que tout chemin traverse (le `cadrerLesRangees` que le garde 18 épingle) |
| ⛔ le livre cherché **deux fois**, avec deux commentaires et deux raisons | ✅ une fois |
| ⛔ quatre lectures en cascade pour retrouver une pastille *(l'hôte, sa dalle, la fiche qui l'enveloppe, une dalle sœur)* | ✅ aucune — **une règle qui ne dépend plus d'où l'organe se trouvait n'a plus besoin de le savoir** |

🔴 **UN ABSOLU TENU À TROIS ENDROITS N'EN EST PAS UN.** C'est §6 pré mot pour
mot : *« un besoin satisfait quatre fois n'est pas quatre fois plus sûr : c'est
trois occasions de diverger. »* Les trois se rattrapaient l'un l'autre — **le
résultat était juste, la règle ne l'était pas.**

### ⚖️ LES DEUX SEULES BORNES DE L'ABSOLU, ET ELLES SE MESURENT
📍 `livre-deux-seules-bornes-absolu-et-elles-se-mesurent` · vivante · 20/08
⚖️ **L'absolu du duo a deux bornes et deux seulement : son périmètre s'arrête à la FICHE, et une dalle sans rangée ne déplace rien.**

| borne | pourquoi | mesuré |
|---|---|---|
| **le périmètre s'arrête à la FICHE** *(`.fiche-dalle`, `.catalogue-card`, un cran `[data-snap]`)* | là où les pages **alternent**, chacune porte SA pastille et SA rangée — leçon des cinq dons du 20/08 | sur Species et Class : **12 fiches, 12 rangées, 12 `?`, 12 livres, 0 hors rangée, 0 rangée qui en porte deux**. Sans cette borne, les vingt-deux `?` de Destiny descendraient dans la rangée de la dernière fiche, invisible sans faire défiler |
| **aucune rangée ⇒ aucun déplacement** | §6 pré autorise l'`absolute` d'une borne *« sur une dalle SANS rangée »* | **Équipement** est dans ce cas depuis le virage B3 du 23/08 : zéro rangée de contrôles, le `?` reste posé sur sa dalle |

📌 **ET L'ORDRE DES DEUX TEMPS N'EST PAS INTERCHANGEABLE** : on **place les
bornes AVANT de grouper les majeurs**, pour que le `prepend` du livre le mette
devant le futur groupe. ⛔ **Le clavier suit le DOM, pas l'écran.**

---

### 📐 LES COTES, ET ELLES NE SE NÉGOCIENT PAS
📍 `bouton-cotes-et-elles-ne-se-negocient-pas` · vivante · 04/09
⚖️ **Une borne est un carré `--touch`, ⛔ jamais la largeur de son dessin ; la rangée vaut 44, l'écart du groupe 8, et 8 la sépare du bord de la dalle en haut comme en bas.**

| | |
|---|---|
| borne (livre, `?`) | carré **`--touch`** — ⛔ jamais la largeur de son DESSIN. Mesuré avant : un livre à **31 blg**, parce qu'un glyphe est étroit |
| hauteur de rangée | **44** |
| écart dans le groupe | **8** |
| **au-dessus** de la rangée | **8** |
| **sous** la rangée, jusqu'au bord de la dalle | **8** |
| position d'une borne | `absolute` **INTERDIT** dans une rangée — un organe hors flux ne pousse rien, donc il se laisse recouvrir. Son `absolute` ne vaut que sur une dalle SANS rangée |

### ✅ LE TÉMOIN — comment on prouve qu'une rangée est juste
📍 `bouton-temoin-comment-on-prouve-qu-rangee-est-juste` · vivante · 04/09
⚖️ **Une rangée se prouve en DEUX temps : libellés allongés sans aucun recouvrement, puis centre du groupe relevé contre le centre de la DALLE — écart attendu 0.**

⛔ **Une rangée juste en anglais ne prouve rien.** L'épreuve est en deux temps,
et les deux comptent :

1. **allonger les libellés** (« Je change finalement d'avis ») et relever les
   positions : **zéro recouvrement** entre les quatre organes ;
2. **relever le centre du groupe contre le centre de la DALLE** — pas contre le
   centre de la rangée. Écart attendu : **0**. C'est ce second témoin qui a
   attrapé le rembourrage survivant que le premier laissait passer.

📌 Relevé de référence, 26 rangées du site le 04/09 : **0 recouvrement, 0 écart
de centre, 0 organe en `absolute`**.

## 6 pré bis. 🧭 **L'AIGUILLEUR — LE TEXTE QUI DIT OÙ ALLER** *(Eric, 2026-09-04)*
📍 `aide-aiguilleur-texte-qui-dit-ou-aller` · vivante · 04/09
⚖️ **L'aiguilleur est BLEU et il a toujours une boîte de TROIS lignes : c'est ce qui rend le budget d'un écran calculable d'avance.**

> ⚠️ **CONSIGNÉE PAR L'ARCHITECTE LE 2026-09-05.** Même origine que les sacrés n° 2 et
> n° 3 : ratifiée le 04/09 devant une session distante, écrite dans son conteneur, et
> **jamais poussée**. Ce texte est la règle.
> ✅ **Le code est revenu le 2026-09-05** — les quatre commits du conteneur, transmis par
> le Drop et fusionnés. L'organe de cette section est `.guide-mot` ; son encre sur verre
> est réparée, et l'amendement qui suit porte le sélecteur exact.

🔴 **DEUX CLAUSES, ET AUCUNE N'EST COSMÉTIQUE.**

| | la clause | ce qu'elle empêche |
|---|---|---|
| **la couleur** | l'aiguilleur est **BLEU**, ⛔ jamais l'encre du corps | qu'un texte qui MÈNE quelque part se confonde avec un texte qui se LIT |
| **la boîte** | il a **toujours** une boîte de **3 lignes** | que l'écran se réorganise sous l'œil selon la longueur du libellé |

⭐ **LA BOÎTE FIXE N'EST PAS DU CONFORT : C'EST CE QUI REND LE BUDGET D'UN ÉCRAN
CALCULABLE D'AVANCE.** Un organe dont la hauteur dépend de son contenu se mesure après
coup, écran par écran, et se remesure à chaque mot changé. Trois lignes réservées, et le
budget se **déduit** (§1 ter) au lieu de se relever.

⚠️ **ET LA COULEUR A UN DÉFAUT MESURÉ QUI DÉBORDE CE CHAPITRE.** Sur un voile de verre,
le bleu de l'aiguilleur rendait **2,63:1 le jour et 2,74:1 la nuit** — sous le plancher
de lisibilité, et mesuré **sur le rendu cumulé**, pas sur la déclaration. Réparé à
**5,51 / 5,68** en conditionnant l'encre au voile.
🔴 **La réparation va à l'ORGANE, pas à l'écran** : `.guide-mot` vit déjà sur une
`dalle-simple` à Destiny R, donc le défaut n'est pas né avec Abilities et une correction
locale en aurait laissé la moitié debout. ⭐ *Quand un défaut se lit sur deux écrans, il
appartient à l'organe qu'ils partagent.*

### 🔵 L'AIGUILLEUR ET LE TUTORIEL DISENT LA MÊME ÉTAPE — PAS DE LA MÊME FAÇON *(Eric, 2026-09-05)*
📍 `aide-aiguilleur-et-tutoriel-disent-meme-etape` · vivante · 05/09
⚖️ **L'aiguilleur POINTE en trois lignes sous les yeux de tous ; le tutoriel du `?` EXPLIQUE dans un popup, et il a le droit d'être verbeux.**

> *« le `?` est un tutoriel plus verbeux, plus agréable à lire, que l'aiguilleur, c'est
> un popup »*.

⛔ **LES DEUX PARLENT DE L'ÉCRAN, ET C'EST CE QUI LES REND CONFONDABLES.** Le livre, lui,
se distingue tout seul : il parle du JEU et il SORT (sacré n° 2). L'aiguilleur et le
tutoriel, non — ils s'adressent au même joueur, sur le même écran, au même moment. Ce qui
les sépare n'est donc pas leur sujet : c'est leur **format**, et il se décide.

| | l'aiguilleur (`.guide-mot`) | le tutoriel (le `?`) |
|---|---|---|
| **où** | **dans** la dalle, sous le titre | un **popup**, ouvert à la demande |
| **combien** | une boîte de **3 lignes**, jamais plus | il **respire** — verbeux, et c'est voulu |
| **le ton** | il **POINTE** : *« choisis une méthode ci-dessous »* | il **EXPLIQUE**, et il doit être agréable à lire |
| **qui le voit** | tout le monde, tout le temps | celui qui le demande |

⭐ **ET LA BRIÈVETÉ DE L'UN EST CE QUI PAIE LA LONGUEUR DE L'AUTRE.** L'aiguilleur est
sous les yeux en permanence : trois lignes est un plafond, pas une cible, parce qu'un
texte permanent qui s'allonge devient du décor qu'on cesse de lire. Le tutoriel s'ouvre
sur un geste — celui qui le demande a *décidé* de lire, et lui servir trois lignes sèches
est une réponse avare à une question franche.
🔴 *Un texte qu'on subit se compte en lignes ; un texte qu'on demande se juge au plaisir
de le lire.*

⚠️ **CE QUE ÇA INTERDIT EN PRATIQUE, et ç'a été mesuré le 05/09** : le tutoriel
d'Abilities tenait en trois lignes sèches, dont une citait `INFO` — un organe retiré le
matin même. ⛔ Un tutoriel qui NOMME un organe se périme avec lui, et il envoie le joueur
chercher ce qui n'est plus là. Il décrit ce qu'on peut FAIRE et où ça mène ; les noms
propres d'organes n'y entrent que s'ils sont écrits sur le bouton.

⛔ **ET LE NOM `.aiguilleur` EST PRIS** — il désigne le recouvrement plein écran
d'Équipement (375 × 500 blg), et ce fichier l'interdisait **déjà par écrit**. La session
distante a écrit la classe, l'a mesurée au banc, et c'est **la mesure qui l'a envoyée
lire la norme** — pas l'inverse. ⭐ C'est la règle universelle « Google headless » (§0)
qui a payé : *on regarde avant de conclure, même quand on croit connaître le nom.*

---

### 🔵 AMENDEMENT DE L'AIGUILLEUR — **sur du verre, il écrit en `--text`**
📍 `aide-amendement-aiguilleur` · vivante · 26/08
⚖️ **Sur une dalle de verre, l'aiguilleur écrit en `--text` et non en `--text-soft` — et la réparation va à l'ORGANE, conditionnée au voile, jamais à un écran.**

> Eric, le même jour : *« le texte en dessous, ça devrait être en bleu :
> l'aiguilleur. Pas en noir. L'aiguilleur a toujours besoin d'une boîte texte de
> 3 de hauteur. »*

⭐ **IL NE DEMANDE PAS UN ORGANE, IL EN NOMME UN QUI EXISTE.** L'aiguilleur est
l'une des trois voix de §7, bleu par ratification du 26/08, et sa boîte de **3
lignes T1** est déjà publiée deux fois dans ce fichier (§ du gabarit d'Elf, § du
SB1). Son dessin est `.guide-mot`. ⛔ **Il n'a pas de sosie** — `destiny-step.mjs`
l'avait déjà tranché : *« C'EST `.guide-mot`, L'ORGANE DU RANG B, PAS UN
SOSIE »*. ⚠️ Et `.aiguilleur` est **un autre objet** : le recouvrement plein
écran d'Équipement. Une classe de ce nom posée sur un paragraphe a rendu
**375 × 500 blg** au banc — le commentaire de §7 l'interdisait déjà par écrit,
c'est la MESURE qui l'a fait lire.

🔴 **CE QUI EST NEUF EST UNE MESURE, PAS UN GOÛT.** Relevé sur la page rendue,
sur le rendu **cumulé** (image de fond + voile 35 % + lavis d'info) :

| | encre `--text-soft` | encre `--text` |
|---|---|---|
| **jour** | **2,63:1** ⛔ | **5,51:1** ✅ |
| **nuit** | **2,74:1** ⛔ | **5,68:1** ✅ |

pour une cible de **4,5**. ⭐ **Et le défaut n'est pas né avec R Abilities** :
l'organe vit déjà sur une `dalle-simple` à **Destiny R** et à son écran final.
La réparation est donc à l'**organe**, conditionnée au **voile**
(`:is(.dalle-simple, .dalle-intermediaire) > .guide-mot`) — une exception par
écran aurait laissé Destiny cassé. Sur fond opaque, l'encre douce tient ses 4,5
et ne bouge pas.
⛔ **C'est CADRES §8, déjà écrit** : *« un habillage qui passe en verre ne peut
pas garder son texte gris »*.

---

## 6 pré ter. 🔲 **TOUT EST DANS UNE BOÎTE, LES BOÎTES SONT SUR UNE GRILLE** *(norme, 2026-09-04)*
📍 `cadre-tout-est-dans-boite-boites-sont-sur-grille` · vivante · 04/09
⚖️ **Ceci est la MESURE du sacré n° 3, pas un second énoncé : la grille devient le seul écrivain de l'écart, et une marge d'enfant qui survit s'AJOUTE au `gap`.**

> 📌 **C'est la MESURE du SACRÉ n° 3**, pas un second énoncé : la règle est
> dictée plus haut (§ sacré n° 3) ; ici on montre ce qu'elle coûte et comment on
> la tient, relevé sur R Abilities. ⛔ Une règle énoncée deux fois est deux règles.

> Eric, en refaisant **R Abilities** : *« désormais tout est dans une boîte, toutes les boîtes sont
> sur une grille **y compris les boutons**. Et dès qu'il y a du texte c'est dans une boîte. »* ·
> *« Et on définit les espaces en général **8 blg**. Le plancher est défini par construction et on
> sait ce qu'on ne doit pas dépasser. »*

### 🔴 LES TROIS PHRASES, ET CE QU'ELLES INTERDISENT
📍 `cadre-trois-phrases-et-ce-qu-elles-interdisent` · vivante · ?
⚖️ **Plus d'organe posé « à côté », plus de `flex-wrap` qui coupe où il peut, plus de barème d'écarts par organe : `--sp-8` est le défaut, et s'en écarter se NOMME.**

| la phrase | ce qu'elle retire |
|---|---|
| **tout est dans une boîte** | ⛔ plus d'organe posé « à côté ». Un texte nu entre deux blocs n'appartient à rien, donc rien ne le déplace quand ses voisins bougent |
| **les boîtes sont sur une grille** | ⛔ plus de `flex-wrap` qui coupe où il peut. Une grille dit **combien** et **où** ; un repli le découvre à l'exécution, et le découvre autrement au premier libellé traduit |
| **les espaces valent 8** | ⛔ plus de barème d'écarts à retenir par organe. `--sp-8` est le défaut ; s'en écarter se **nomme** |

⭐ **ET LA GRILLE DEVIENT LE SEUL ÉCRIVAIN DE L'ÉCART.** C'est la conséquence
qui coûte, et elle a été mesurée le jour même : une marge d'enfant **s'ajoute**
au `gap`. Sur R Abilities, deux intervalles rendaient **16 blg** au lieu de 8 et
la dalle **204** au lieu de 188, parce que le titre et l'aiguilleur portaient
encore la marge qui les espaçait avant la grille.
⛔ **Et le remède n'est pas un `.dalle > *`** : il pèse `(0,1,0)`, autant que
`.guide-mot` — c'est donc **l'ordre du fichier** qui trancherait, et l'organe
vit deux mille lignes plus bas. *« Une déclaration invalide crie, une
déclaration PERDANTE se tait. »* L'exception se **nomme** (`.ability-methodes >
.guide-mot`), elle ne se parie pas sur la cascade.

### 📐 « LE PLANCHER EST DÉFINI PAR CONSTRUCTION »
📍 `cadre-plancher-est-defini-par-construction` · vivante · ?
⚖️ **Le plancher se CALCULE avant de dessiner — la somme verticale écrite, puis vérifiée sur la page — et le découpage se DÉCLARE au lieu de se compter.**

⭐ **Ça ne veut pas dire « il y a de la place », ça veut dire qu'on la CALCULE
avant de dessiner** — §1 ter, appliqué. Le relevé de R Abilities, écrit avant la
première ligne de code puis vérifié sur la page :

    8 rembourrage + 15 titre + 8 + 45 aiguilleur + 8 + 44 rangée + 8 + 44 rangée + 8  =  188 blg
    la scène en offre 436 sous la carte                             ➡️  le plancher n'est pas approché

    en largeur :  3 × 87 + 2 × 8 = 277  ✅  dans 351 utiles
                  4 × 87 + 3 × 8 = 372  ⛔  21 de trop

🔴 **C'EST DONC LA LARGEUR QUI POSE LE TROIS**, pas un goût — la même
arithmétique de 360 qui a fabriqué la cote du jeton (`tokens.css`). ⛔ Et le
découpage se **déclare** (deux rangées écrites) au lieu de se **compter** (un
`:nth-child` ou un repli) : §1 ter ter, *« une exception se nomme, elle ne se
compte pas »*.
⭐ **LE COMPTE N'EST ÉCRIT QU'À UN ENDROIT** : la feuille emploie
`grid-auto-flow: column`, qui crée autant de colonnes qu'on lui donne d'enfants.
Un `repeat(3, …)` en CSS face à un `slice(0, 3)` en JS aurait été **un nombre
écrit deux fois, c'est-à-dire deux nombres**.

### ⚖️ `data-rangee` — LA CINQUIÈME PORTE DE §6 pré
📍 `cadre-data-rangee-cinquieme-porte-6-pre` · vivante · ?
⚖️ **Une rangée neuve DÉCLARE `data-rangee` et hérite de tout le bloc : ⛔ un cinquième nom de classe est le signe qu'on recommence.**

La rangée de contrôles était énumérée par **quatre noms de classe**, à **sept
endroits** (cinq dans `shell.css`, deux dans `shell.mjs`). La seconde rangée de
R Abilities en est une cinquième — et lui donner un cinquième NOM aurait été
sept éditions de plus, donc sept occasions de diverger.

⭐ **Une rangée neuve DÉCLARE `data-rangee` et hérite de tout le bloc.** Même
leçon que `data-rangs` (§1 ter bis) : *« la forme sûre est un attribut, qui donne
à tous les cas la MÊME spécificité »*. ⛔ **Un cinquième nom de classe est
désormais le signe qu'on recommence**, exactement comme la quatrième colonne
l'était pour §6 pré.

---

## 6. LES BOUTONS
📍 `bouton-gabarit-est-un-compte-de-caracteres` · vivante · 26/08
⚖️ **Un gabarit est un compte de caractères, pas une largeur en pixels — la largeur se déduit.**
📍 `bouton-large-renomme-medium` · vivante · 26/08
⚖️ **`large` s'appelle désormais `medium`.**
📍 `bouton-trois-gabarits` · vivante · 26/08
⚖️ **Il y a trois gabarits à libellé : small (6 caractères), medium (12), no constraint.**

| gabarit | capacité | sa largeur |
|---|---|---|
| **small** | **6 caractères**, **deux étages possibles** | 🔴 **DÉDUITE** du compte de caractères |
| **medium** | **12 caractères**, deux étages | 🔴 **DÉDUITE** — mot-témoin : **`COMPANIONS`** (10) |
| **no constraint** | libre | — |
| 🔴 **`+` / `−`** | un glyphe | **le plus petit possible** *(voir ci-dessous)* |

#### ✅ LA FORME EST CELLE QUE LA FEUILLE DESSINE AUJOURD'HUI *(Eric, 2026-09-06 · corps réécrit 16/09)*
📍 `bouton-forme-octogone-ratifiee` · vivante · 06/09 · **corps réécrit 16/09**
⚖️ **La forme du bouton est celle que la feuille dessine AUJOURD'HUI — depuis le 16/09, un rectangle à angles arrondis ; les gabarits restent `petit` · `large` · `libre`.**

> Eric, 2026-09-06 : **« garde le gabarit, mais la forme octogone actuelle est la norme »**.
> Eric, 2026-09-16 : **« tous les boutons standards passent à ce format »** — le rectangle arrondi.

🔴 **CE QUE ÇA FERME, ET CE QUE ÇA NE FERMAIT PAS.** Cette règle disait que la forme *« ne se
rediscute plus »*, et elle a été rediscutée dix jours plus tard. ⛔ Ce n'était pas une
désobéissance : elle ratifiait **ce que la feuille dessine aujourd'hui**, et « aujourd'hui » a
changé quand Eric a vu le rendu en ligne.
⭐ **Sa clause utile n'était donc pas « octogone », c'était « aujourd'hui »** — elle interdit de
rediscuter la forme *entre deux décisions d'Eric*, jamais de suivre la sienne. C'est pourquoi son
corps se réécrit sans que son statut bouge.

📏 **LA FORME DU 16/09**, mesurée sur le site servi *(v635)*, les deux thèmes : rayon **6** · face
`#3d3424` **identique jour et nuit** · encre **fixe** `#efe6d2` · liseré à **2** du bord, épaisseur
**1,4**, rayon **4** *(= rayon du bouton − marge)*.
⛔ Aucun nombre ne se recopie ici : les cotes vivent dans `tokens.css`, et ce sont elles qui font
foi *(§1 ter)*. Ceux-ci sont un **relevé daté**, pas une source.

⚠️ **ET L'ENCRE NE BASCULE PAS, contrairement à tout le reste du site.** `--on-accent` vaut
`#ffffff` le jour et `#14120e` la nuit ; sur une face qui ne bascule pas, l'encre de nuit serait
presque noire sur presque noir. C'est la même espèce que `--de-encre` : une encre d'**objet**, pas
une encre de **page**.

⭐ **ET LES TROIS GABARITS NE BOUGENT PAS.** Eric a d'abord dit *« 14 caractères »* pour `medium`,
puis **« garde le 12 carac »** dans le même échange. La table ci-dessus est donc inchangée :
`small` **6** · `medium` **12** · `no constraint`. 📌 On garde la trace des deux phrases parce que
la seconde corrige la première — ⛔ ce n'est pas une hésitation à effacer, c'est une décision datée.

⚖️ **CE QUI RESTE OUVERT, ET CE N'EST PAS LA FORME** : le **corps du texte** d'un bouton n'est
toujours pas nommé *(⏳ ci-dessus, « T-quoi ? »)*. Tant qu'il ne l'est pas, les largeurs de `small`
et `medium` restent **non calculables** — un compte de caractères ne devient une largeur qu'une fois
la police et le corps connus.

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
📍 `bouton-meme-largeur-par-ligne` · vivante · 26/08
⚖️ **Tous les boutons d'une même ligne ont la même largeur, et la rangée se pose en bas de page, centrée.**
📍 `bouton-cotes-extrapolees` · à trancher · 26/08
⚖️ **small = 87, medium = 135, no constraint = 278 — extrapolés, pas mesurés.**

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
📍 `bouton-corps-du-texte` · à trancher · 26/08
⚖️ **Aucun corps de texte n'est déclaré pour un bouton, donc les largeurs de small et medium ne sont pas calculables.**

| gabarit | à **T3** (14) | à **T4** (16) |
|---|---|---|
| **small** — 6 car. | besoin 65 / 87 · **marge 22** ✅ | besoin 72 / 87 · marge 15 ✅ |
| **medium** — 12 car. | besoin 113 / 135 · **marge 22** ✅ | besoin 127 / 135 · 🔴 **marge 8** |

➡️ **T3 est le corps recommandé** : c'est le seul qui laisse la **même marge (22 px) aux deux
gabarits**. ⚠️ À T4, `medium` n'a plus que 8 px — **un mot un peu large déborde**, et le déficit ne
se verrait que sur ce gabarit-là.

### La hauteur
📍 `bouton-hauteur` · vivante · 26/08 · **amendée 16/09 — le dessin et la cible se séparent**
⚖️ **Le DESSIN d'un bouton fait 40, sa CIBLE tactile reste 44 — le dessin est centré, la cible déborde de 2 en haut et de 2 en bas.**

> Eric, 2026-09-16 : *« passe tous les boutons à hauteur **40 blg** (cible tactile reste à **44**
> donc dépasse de 2 au dessus et en dessous) »*.

🔴 **DEUX COTES LÀ OÙ IL N'Y EN AVAIT QU'UNE.** Jusqu'au 16/09 cette règle disait *« un bouton fait
44 »*, et `--touch` servait à la fois de zone touchable et de hauteur peinte. Elles se séparent :
ce qui rétrécit est le **dessin**, jamais la **cible**.
⛔ **`jeton-sacre` n'est pas entamé** — *« les jetons et les boutons sont SACRÉS : leur cote et leur
corps ne cèdent jamais »*. Le pouce garde ses 44 blg exactement comme avant.
⭐ **Et le dépôt connaissait déjà cette distinction sans l'appliquer au bouton** : l'astre du belt
porte `--astre-dessin` / `--astre-cible` depuis le 15/09. Le 16/09 ne l'invente pas, il l'étend.

📏 **MESURÉ SUR LE SITE, avant et après le changement** *(builder servi, sous `.app`)* :

| | cible rendue | dessin peint | retrait |
|---|---:|---:|---:|
| **avant** | 77 × **44** | **44** | 0 / 0 |
| **après** | 77 × **44** | **40** | **2** en haut · **2** en bas |

⭐ **La cible est inchangée au centième** — c'est la preuve que la loi sacrée tient.
📐 Le retrait **se dérive** (`--bouton-retrait-v`, moitié de l'écart entre les deux cotes) : ⛔ ne
jamais l'écrire en littéral, sinon 40 peut rebouger sans que les 2 suivent.

### Les cotes de chaque famille — Eric, 16/09
📍 `bouton-cotes-par-famille` · vivante · 16/09
⚖️ **Chaque famille de bouton a sa cote de DESSIN, et toutes partagent la même cible de 44 : petit 77 × 40 · large 105 × 40 · carré 44 × 44 · `+`/`−` 40 × 40 · collecteur de caractéristique 48 × 44 · collecteur classique 87 × 48.**

| famille | dessin | cible |
|---|---:|---:|
| **petit** *(`Cancel`, `Next`, `Done`…)* | **77 × 40** | 77 × 44 |
| **large** *(`Inheritance`…)* | **105 × 40** | 105 × 44 |
| **carré** *(le Tally, la bourse)* | **44 × 44** | 44 × 44 |
| **`+` / `−`** | **40 × 40** | 44 × 44 |
| **dropdown / collecteur de caractéristique** | **48 × 44** | — |
| **dropdown / collecteur classique** | **87 × 48** | — |

⛔ **LE BELT EST HORS DE CETTE NORME — Eric, 16/09 : *« le belt is off limits de tout ça »***.
La lune et le soleil ne figurent pas dans le tableau, et leurs jetons (`--astre-dessin` 41) ne
sont pas touchés. J'avais écrit la lune à Ø 40 et fait passer `--astre-dessin` à 40 : les deux
sont annulés. ⭐ Le belt appartient au lot 207, fusionné et en ligne ; **une cote juste posée dans
le mauvais lot reste une cote posée par quelqu'un qui n'en répond pas.**

⭐ **Le CARRÉ est le seul dont le dessin égale sa cible** : à 44 il remplit la zone touchable et n'a
aucune marge à laisser. Tous les autres sont à 40 dans 44.
⭐ **Et le collecteur classique était DÉJÀ juste** : `--glisse-case` 87 × `--glisse-h` 48 rendaient
exactement ces cotes avant qu'on les redemande. Une cote déduite de la place a tenu quand elle a
été redictée de mémoire.

⏳ **DEUX ÉTAGES — RÈGLE CONSERVÉE, PREUVE SUSPENDUE.** Cette section disait *« 48 à deux étages en
T3, 56 en T4 »*. Ces deux nombres sont **déduits**, jamais mesurés.
📏 **Mesuré le 16/09**, un bouton à deux lignes, corps 16/600, `line-height: normal` : **38,82 blg**
— il tenait dans 44 avec 5,18 de reste. ⚠️ **Dans 40 il ne reste plus que 1,18**, soit 0,59 de
chaque côté. ⛔ **Aucune de ces trois valeurs — 48, 56, 40 à deux étages — ne se reconduit sans une
mesure neuve**, et celle du 16/09 ne porte que sur UN bouton là où la règle en vise tous.

⭐ **Le plancher tactile gouverne la hauteur d'un bouton à un étage** : la typographie n'y arrive
pas. C'est encore *« un contrôle ne se laisse jamais dimensionner par un dessin »*.

### 🔴 `+` / `−` : le dessin le plus petit possible, la cible au minimum tactile
📍 `bouton-dessin-plus-petit-possible-cible-au-minimum-tactile` · vivante · 26/08
⚖️ **Le DESSIN d'un `+` / `−` est le plus petit possible et sa CIBLE vaut `--touch` 44 : un contrôle ne se laisse jamais dimensionner par son dessin.**

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
📍 `bouton-echelle-des-quatre-couleurs` · vivante · 26/08
⚖️ **Les quatre couleurs sont UNE échelle d'avancement que le bouton parcourt : gris rien fait · bleu mouvement non impactant · vert fini · rouge pas bon.**

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

📍 `bouton-echelle-jamais-au-repos` · vivante · 13/09
⚖️ **Un organe AU REPOS ne porte jamais `--critical` : le rouge dit « ce n'est pas bon » ou « ça défait », donc il exige un état, un refus ou une destruction. Une case vide attend, elle n'accuse pas.**

> **La question posée à Eric**, 2026-09-13 : *« Les dix carrés “roll 1…roll 10” du plateau de dés
> sont rouges avant le premier jet. Tu les avais demandés comme ça le 05/09 — on les garde, ou ils
> passent au bleu comme les collecteurs d'ability boost ? »*
> **Sa réponse** : *« Bleus, comme les boosts. »*

📏 **LE BALAYAGE DU 13/09**, navigateur ouvert, huit chapitres, **les deux piles**, pseudo-éléments
compris *(sans eux le témoin ne voit pas un bouton en relief, et ne peut donc jamais accuser)* :
**deux familles** portaient le rouge au repos — les dix `.tray-case-num` *(réparés : ils empruntent
`--info`, le jeton même du collecteur rempli)* et les huit `+`/`−` de la bourse B3 *(`.b3-bouton`,
**laissés en l'état et nommés à Eric** : c'est l'encre d'un croquis, et les croquis font foi)*.
Tout le reste était `Cancel`, `Forget`, `Reset` — **ceux-là défont, ils sont dans la loi.**

⛔ **ET LE ROUGE SE PREND SUR LE JETON, JAMAIS SUR UN NOMBRE** : le bleu posé ici est `--info`,
celui que porte déjà le liseré d'un collecteur qui a reçu quelque chose. Deux teintes égales
divergent au premier lot qui en bouge une.

### 🔴 LE LIBELLÉ ET LA COULEUR SONT DEUX AXES INDÉPENDANTS
📍 `bouton-deux-axes` · vivante · 26/08
⚖️ **Le libellé dit ce que fait le bouton et ne change jamais ; la couleur dit où on en est et change à chaque acte.**
📍 `bouton-jamais-de-couleur-dans-le-balisage` · vivante · 26/08
⚖️ **Un lot ne déclare jamais `class="bouton-vert"` : il déclare un bouton, et l'état peint.**

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

### 🚧 LA CLASSE ET LE VERBE FONT L'ORGANE — mais TROIS MOTS ont leur propre régime
📍 `bouton-la-classe-et-le-verbe-font-l-organe` · vivante · 07/09
⚖️ **Un organe de la coquille se reconnaît à sa CLASSE et à son VERBE, jamais à son libellé — sauf trois mots dont le régime est écrit dans un témoin : `Back` est EXCLUSIF à la coquille, `Validate` est BANNI, `Cancel` et `Done` sont PARTAGÉS.**

📏 **LES TROIS RÉGIMES, MESURÉS LE 07/09 — qui écrit le mot nu dans `ui/` :**

| le mot | porteurs | le régime | son témoin |
|---|---|---|---|
| **`Back`** | **`shell.mjs` seul** | 🔒 **exclusif** — ⛔ un écran ne l'écrit pas | `shell-wiring.test.mjs:517` — *« écrit UNE fois et par la coquille — jamais par un écran »* |
| **`Validate`** | **aucun** | ⛔ **banni** — il ne doit exister nulle part | `shell-wiring.test.mjs:345` |
| **`Cancel`** | `confirm` · `destiny-step` · `parcours-ecrans` · `abilities-step` · `shell` | ✅ **partagé** — 4 écrans l'écrivent aujourd'hui | ⛔ **aucun témoin sur le mot nu** |
| **`Done`** | `destiny-step` · `species-step` · `parcours-ecrans` · `shell` | ✅ **partagé** — 3 écrans l'écrivent aujourd'hui | ⛔ **aucun témoin sur le mot nu** |

⭐ **ET LA RAISON N'EST PAS UN CAPRICE DE GARDE, ELLE EST DANS LE GESTE.** `Back` est le seul dont le
**verbe** n'existe que dans la coquille — `pressBack()` n'est appelé nulle part ailleurs, et le
garde le tient aussi *(:474)*. Un second `Back` rouvrirait **deux chemins de recul**, ce que la loi
I.5 interdit. `Cancel` et `Done`, eux, nomment des gestes qu'un écran fait **pour son compte** : il
est légitime qu'il les affiche.

⚖️ **CE QUI RESTE VRAI DE LA RÈGLE GÉNÉRALE, ET C'EST L'ESSENTIEL** : ⛔ **aucun écran n'écrit une
CLASSE de la coquille** — `sortie-back` · `sortie-annule` · `sortie-bouton sortie-done`, un seul
producteur, trois témoins *(:470-473)*. C'est la classe et le verbe qui font l'organe ; le mot n'est
tenu que là où le geste est unique.
📌 **Et le garde le dit lui-même** : *« un garde écrit contre une ORTHOGRAPHE devient faux le jour où
l'orthographe change de camp ; écrit contre un PROPRIÉTAIRE, il tient »* — c'est un garde de
**propriétaire**, pas d'orthographe.

⛔ **CETTE RÈGLE A ÉTÉ ÉCRITE FAUSSE UNE PREMIÈRE FOIS, LE JOUR MÊME, ET VOICI COMMENT.** J'avais lu
le **commentaire** en tête de `SORTIE_ETAPE` — *« la façon d'identifier l'organe : par sa CLASSE et
son VERBE, plus par son mot »* — et j'en avais conclu qu'aucun mot n'était tenu. 📏 Faux : trente
lignes plus bas, une assertion tient le mot nu `"Back"`.
🔴 **J'AI PRIS UNE INTENTION ÉCRITE EN PROSE POUR CE QUE LE FICHIER FAIT.** ⭐ *Un commentaire dit ce
qu'un auteur a voulu ; seule l'assertion dit ce que le garde exige.* Et c'est **le jumeau exact**
de `socle-un-mot-compte-dans-la-phrase-qui-le-nie`, écrit une heure plus tôt : là je comptais un mot
dans la phrase qui le nie, ici je croyais une phrase qui nie une pratique que le fichier applique.
⛔ **Les deux fautes sont la même** : *prendre de la PROSE pour de la DONNÉE.*
📌 **Le dégât était réel et il a été évité par une relecture croisée** : la version fausse autorisait
un écran à écrire `Back`, et la suite aurait rougi sur le premier siège qui l'aurait crue.

⏳ **LE CAS D'ESPÈCE RESTE OUVERT, ET LES DEUX ARGUMENTS TIENNENT ENSEMBLE.** Le pied du popup du
sélecteur de Skills s'appelle `Close` *(lot 173)* là où Eric avait écrit *« back »* :
* le **SENS** — un libellé nomme ce que son bouton FAIT, et celui-ci ferme un détail, il ne recule
  d'aucun écran *(Eric, 20/08 : « back n'efface pas »)* ;
* le **GARDE** — 📏 éprouvé ROUGE par le siège Skills avant d'être écrit : avec `mot: "Back"`,
  `npm test` rend **1831/1833** et le témoin `:517` accuse ; avec `"Close"`, **1833/1833**.
➡️ **Si Eric veut `Back` là, il y a bien quelque chose à rouvrir : le témoin `:517`**, avec sa
raison — ⛔ jamais l'écran qu'on repeint en silence.

### 🔴 DEUX MOTS DE RETOUR, ET LA COULEUR SE DÉDUIT DU MOT *(Eric, 2026-09-05)*
📍 `bouton-deux-mots-retour-et-couleur-se-deduit-mot` · vivante · 05/09
⚖️ **Deux mots de retour et deux seulement — `Back` bleu qui n'annule rien, `Cancel` rouge qui abandonne du travail — et la teinte se DÉDUIT du mot.**

> **« back = navigation = bleu · cancel = annulation = rouge »**
> puis, pour fermer toute lecture molle : **« back n'annule rien »**.

| le mot | le geste | la teinte | la classe |
|---|---|---|---|
| **`Back`** | ⛔ **il ne touche à rien** — il recule, c'est tout | 🔵 bleu | `sortie-back` → `--info` |
| **`Cancel`** | 🔴 il **abandonne ou efface** du travail fait | 🔴 rouge | `sortie-annule` → `--critical` |

⛔ **DEUX MOTS, PAS TROIS.** `I changed my mind` a été retiré le 05/09 — Eric : *« cancel est
clair et court »*, puis *« remplace par cancel partout »*. ⭐ Ce n'est pas un appauvrissement :
les deux mots étaient **déjà la même famille** au corpus (DÉFAIRE, rouge) et ne se distinguaient
que par leur **destination**. Cette distinction-là ne disparaît pas — elle cesse simplement
d'être portée par le MOT. C'est la coquille qui lit le rang et décide où le geste rend.

🔴 **ET LA FUSION A RÉPARÉ UN DÉFAUT VIVANT, LIVRÉ EN LIGNE.** La teinte se déduit du mot
(`motDuRetour === "Cancel" ? "sortie-annule" : "sortie-back"`). Tant que le geste qui EFFACE
s'appelait `I changed my mind`, il n'était pas `Cancel` — il recevait donc `sortie-back`,
c'est-à-dire **du BLEU, la couleur de la navigation**. ⛔ Un bouton qui détruit du travail était
peint comme un bouton qui recule.

⭐ **LA LEÇON, ET ELLE DÉBORDE CE CAS** : *quand une TEINTE se déduit d'un MOT, changer le
vocabulaire change le dessin.* Un renommage qu'on croyait cosmétique a corrigé une couleur —
il aurait tout aussi bien pu en casser une. ⛔ Avant de renommer un libellé, chercher qui LIT
ce libellé : ici, une ligne de `shell.mjs` en tirait une classe CSS.

📌 Gardé par `tests/shell-wiring.test.mjs` §16 ter, qui vérifie la LOI (le mot du geste, et la
teinte déduite du mot) — ⛔ plus la forme de la ternaire, qu'il épelait avant et qui l'a fait
rougir sur cette réparation même.

### 🔴 LA FAMILLE « DÉFAIRE » — rouge, toujours, quel que soit l'état
📍 `bouton-famille-defaire` · vivante · 26/08
⚖️ **La famille DÉFAIRE est rouge, toujours, quel que soit l'état, et toujours accompagnée d'un popup.**

> Eric, 2026-08-26 : *« le **cancel** est rouge »* · *« **j'ai changé d'avis** est rouge »*.

| le bouton | |
|---|---|
| `Cancel` | 🔴 rouge |
| `Cancel` / *« je ne veux pas ça »* | 🔴 rouge |
| *« je veux refaire mon perso »* | 🔴 rouge |

⭐ **C'est la seule famille où la couleur ne dit PAS où on en est — elle dit ce que le bouton
FAIT.** Les deux axes s'y confondent, et **c'est voulu** : un bouton qui **défait** ne doit jamais
pouvoir être appuyé par distraction. ⛔ Un `Cancel` gris, ça s'appuie sans le vouloir.

### 🔴 LES TROIS VERBES DE LA RANGÉE — la définition d'Eric, mot pour mot *(26/08)*
📍 `bouton-back-dans-les-sous-menus-seulement` · vivante · 26/08
⚖️ **`Back` n'existe qu'en sous-menu ; il ne paraît jamais à l'entrée d'une étape (rang R).**
📍 `bouton-done-et-next-jamais-ensemble` · vivante · 26/08
⚖️ **`Done` et `Next` ne coexistent jamais : c'est le même moment vu avant et après.**

> Eric, 2026-08-26, en trois lignes :
> **« `Done` valide les choix · `Cancel` les annule · `Next` : navigation »**

| le bouton | ce qu'il FAIT | ce qu'il ne fait pas |
|---|---|---|
| **`Done`** | **valide** les choix de l'étape | ⛔ il ne fait pas avancer |
| **`Cancel`** | **annule** ces choix | ⛔ il ne recule pas — il DÉFAIT |
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
| **rang R** *(entrée)* | en cours | `Cancel` · **`Done`** |
| **rang R** *(entrée)* | validée | `Cancel` · **`Next`** |
| **sous-menu** *(B, SB)* | — | **`Back`** · `Done` — ⭐ c'est le SEUL endroit où `Back` paraît |

⚠️ **ET `Cancel` NE BOUGE PAS ENTRE LES DEUX** : c'est la seule porte
ouverte dans tous les états, celle qui défait. Elle reste rouge dans les deux
*(§6, la famille « défaire »)*.

---

### 🔴 LA LOI DE LA PORTE — voyant et texte disent la MÊME chose *(27/08)*
📍 `bouton-gabarit-des-deux-lignes` · vivante · 27/08
⚖️ **Une porte porte sa résolution en T3 et sa proposition dessous en T1 italique.**
📍 `bouton-loi-de-la-porte` · vivante · 27/08
⚖️ **Le voyant et le texte d'une porte disent la MÊME chose : condition remplie → voyant vert + texte de résolution ; non remplie → voyant vide + texte de proposition.**
📍 `bouton-resolution-n-est-pas-toujours-un-nom` · vivante · 27/08
⚖️ **Une résolution dit que c'est résolu ; elle ne dit pas forcément par quoi.**

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
📍 `bouton-tete-de-bilan-redevient-une-porte` · vivante · 27/08
⚖️ **Même conclue, une étape verrouillée redonne sa tête de bilan sous forme de porte rouge.**
📍 `bouton-verrou` · vivante · 27/08
⚖️ **Un verrou du noyau prime sur une signature : sous verrou, `Done` et `Next` sont désarmés ET rouges, la porte fautive devient un octogone rouge plein, et le gendarme parle.**

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

### ✅ `Cancel` N'EST **JAMAIS SEUL** DANS SA RANGÉE — tranché 26/08
📍 `bouton-i-changed-my-mind-jamais-seul` · vivante · 26/08
⚖️ **`Cancel` n'est jamais seul dans sa rangée : `Next` si l'étape est réglée, `Done` sinon.**

> ✍️ **LE MOT A CHANGÉ LE 05/09, PAS LA LOI — réécrit en place le 2026-09-06.** La phrase
> disait encore `I changed my mind`, un libellé retiré du produit
> *(`bouton-deux-mots-retour-et-couleur-se-deduit-mot` : « deux mots, pas trois »)*, alors que
> le TITRE de cette section portait déjà `Cancel`. ⚠️ C'est le point aveugle que
> `tests/corpus-ancres.test.mjs` nomme lui-même : *une section peut être périmée à
> l'intérieur d'elle-même, le titre portant la décision neuve et le corps gardant le mot
> mort.* ⛔ Aucun lien de supersession n'est posé : la règle n'est pas remplacée, c'est son
> vocabulaire qui a suivi.

> Eric, 2026-08-26, capture d'Identity à l'appui : **« la bonne chose à faire, toujours un Next à
> côté de Cancel »**.

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
📍 `bouton-critere-du-cout` · vivante · 26/08
⚖️ **Ce n'est pas le mot qui décide de la couleur, c'est ce que le geste COÛTE — et « détruit » se mesure au travail perdu.**

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
📍 `bouton-definition-du-bleu` · vivante · 26/08
⚖️ **Bleu = mouvement non impactant : après ce clic, le document n'a pas changé.**

> Eric, 2026-08-26 : **« bleu = mouvement non impactant »**.

⭐ **C'est plus serré que « en cours », et ça dit la même chose** : un mouvement qui ne change
rien **te laisse là où tu étais** — donc toujours en cours. `next`, `back`, la navigation,
l'aiguilleur : **tous déplacent, aucun ne modifie.**

⛔ **Le test tient en une question** : *après ce clic, le document a-t-il changé ?*
**Non → bleu.** Oui et c'est fini → vert. Oui et c'est faux → rouge. Oui et **ça efface** → rouge
avec popup.

📌 Ces boutons portent déjà l'autre précaution du §6 : **un choix important → popup de
confirmation.** Rouge **et** confirmé, jamais l'un sans l'autre.

### 💾 LA TROISIÈME VOIE — une confirmation qui change de jeu propose de garder une copie *(10/09)*
📍 `bouton-troisieme-voie-sauvegarde` · vivante · 10/09
⚖️ **Avant d'éteindre ce qui change de jeu (le maître Fate's Hand), la confirmation offre une troisième voie : SAUVEGARDER LA VERSION D'AVANT, PUIS couper — par le même organe que `Save`, jamais un second chemin d'écriture ; un `Save` refusé ne coupe pas.**

> Eric, 2026-09-10 : *« il faut que la version FH **reste sauvegardée**, donc ça duplique le perso.
> Au moins poser la question : **voulez-vous garder une sauvegarde de la version FH ?** »*

| la voie | ce qu'elle fait | sa couleur |
|---|---|---|
| **Keep on** | rien ne bouge | neutre *(annuler)* |
| **Save the Fate's Hand version first** | `Save` — le fichier dit sa version : `<nom>.fates-hand.fh-char.json` — **puis** l'extinction | l'encre de `Save`, en contour *(vert)* |
| **Switch off** | l'extinction, sans copie — le comportement d'avant | rouge *(il défait)* |

⭐ **Un organe, pas trois** : `renderConfirmDialog` (`confirm.mjs`) gagne une `troisiemeVoie`
facultative, posée **sur sa ligne, pleine largeur, au-dessus** de la paire annuler · confirmer
*(regardé au navigateur : au milieu de la rangée, son libellé long pliait la paire en trois lignes
ragées)* ; sans elle, la boîte rend ce qu'elle rendait. L'ordre du DOM est l'ordre visuel.

📏 **La question ne se pose qu'au MAÎTRE.** Un enfant (Destiny, World…) se coupe sans confirmation
*(lot 188 : il DÉGRADE, il n'efface rien, tout revient à l'allumage)* ; le maître **change de jeu**,
et c'est au changement de jeu que la version mérite sa copie. Étendre la question aux enfants est un
mot d'Eric, pas un lot.

### 🔴 LES TROIS VERBES — chaque famille de boutons en porte UN
📍 `bouton-done-signe` · vivante · 26/08
⚖️ **`Done` signe ce qui est là, puis remonte d'un cran.**
📍 `bouton-trois-verbes` · vivante · 26/08
⚖️ **Trois familles, trois verbes, aucun recouvrement : `Back`/`Next` NAVIGUENT (bleu), `Done` VALIDE (vert), `Cancel` DÉFAIT (rouge + popup).**

> ⚠️ **UN ORGANE DIVERGE AUJOURD'HUI, ET IL EST NOMMÉ PLUTÔT QUE REPEINT — 08/09.**
> 📏 Mesuré sur `origin/main` `a251d47` : `Build a character` porte `.tdc-majeur`, dont la feuille
> dit `background: var(--positive)` — **vert** — et dont le code dit *« il NAVIGUE vers Identity »*.
> ⛔ **Un geste qui navigue et qui est vert n'entre dans aucune des trois familles.**
> ⏳ **Un relais l'annonce comme un choix d'Eric du 08/09, ⛔ sans citer ses mots** — je ne le grave
> donc **pas** comme une décision *(`socle-un-arbitrage-ne-se-relaie-pas-de-seconde-main`)*, et la
> question est ouverte à `A-TRANCHER § C29`.
> 🔴 **⛔ ET AUCUN LOT NE REPEINT CE VERT EN BLEU tant qu'Eric n'a pas parlé.** Si c'est bien son
> choix, un siège qui « répare » défait une décision ; si ce n'en est pas un, c'est à lui de le
> dire. ⭐ *C'est le même traitement que les deux familles grises de `§C24` : une norme neuve ne se
> câble pas en repeignant au hasard ce qu'elle condamne.*

> ✍️ **CORRIGÉ EN PLACE LE 2026-09-06 — le mot a changé, les trois verbes n'ont pas bougé.**
> La phrase citait encore `I changed my mind` en quatrième libellé ; il a été retiré du
> produit le 05/09 *(`bouton-deux-mots-retour-et-couleur-se-deduit-mot` : « deux mots, pas
> trois »)*. ⛔ Une phrase normative qui NOMME un organe retiré envoie un lot chercher ce qui
> n'est plus là — et celle-ci est la table de référence des couleurs.

> Eric, 2026-08-26 : *« back et next = **navigation** uniquement »* · **« done = validation »**.

| la famille | son verbe | ce qu'elle fait au document | sa couleur |
|---|---|---|---|
| **`Back` · `Next`** | **NAVIGUER** | ⛔ **rien** | 🔵 bleu |
| **`Done`** | 🔴 **VALIDER** | ✅ il **signe** ce qui est là, puis **remonte d'un cran** | 🟢 vert |
| **`Cancel`** | **DÉFAIRE** | 🔴 il **détruit** du travail fait | 🔴 rouge **+ popup** |

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
📍 `bouton-back-next-n-ecrivent-jamais` · vivante · 26/08
⚖️ **Un `Back` ou un `Next` ne modifie jamais le document : ni valider, ni écrire, ni effacer, ni signer.**

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
autre mot** — `Cancel`.

➡️ **Le libellé cesse d'être ambigu** : on ne se demande plus *« ce back-là coûte-t-il quelque
chose ? »*. **Un `Back` ne coûte rien, par définition. S'il coûte, ce n'est pas un `Back`.**

⭐ **C'est la même discipline que « un état, pas deux actions »** : Eric ne règle pas le cas
ambigu, **il supprime l'ambiguïté en séparant les mots.** ⛔ Un bouton dont on doit deviner le
coût est un bouton mal nommé.

📌 **Ce qui se garde** : qu'aucun `Back` ni `Next` n'écrive dans le document. C'est vérifiable
mécaniquement, et ça vaut mieux qu'une relecture.

### ✅ `BACK` ET `DONE` PRENNENT LEUR COULEUR — le 26/08 renverse le 17/08
📍 `bouton-back-bleu-done-vert` · vivante · 26/08
⚖️ **`Back` est bleu et `Done` est vert — le commentaire « aucune couleur dans back et done » du 17/08 est renversé.**

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

### 🔴 LA TRILOGIE EST DUE À TOUT ÉCRAN — livre · bouton(s) · `?` *(Eric, 2026-09-06)*
📍 `rangee-trilogie-due-partout` · vivante · 06/09
⚖️ **La trilogie livre · bouton(s) majeurs · `?` est DUE à tout écran : un écran sans elle est un défaut, et c'est l'exception qui s'argumente et se date.**

> Eric, 2026-09-06 : *« **ils doivent tous avoir la trilogie.** Mais c'est les autres qu'on passe
> à la moulinette. »*

| place | organe |
|---|---|
| **gauche** | 📖 le **livre** |
| **centre** | les **boutons majeurs** — ⛔ jamais `Done` et `Next` ensemble |
| **droite** | ❓ le **`?`** |

⭐ **ET C'EST LA CHARGE DE LA PREUVE QUI CHANGE DE CAMP.** Avant, un écran sans livre posait la
question *« celui-ci en mérite-t-il un ? »* — chaque absence se discutait, donc aucune ne se
réparait. Désormais **un écran sans trilogie est un DÉFAUT**, et c'est l'exception qui doit
s'argumenter et se dater.

📏 **L'ÉTAT AU JOUR DE LA LOI, mesuré écran par écran le 06/09 à 14:31** — douze rangées, **cinq
sans livre** :

| écran | ce qui manque | statut |
|---|---|---|
| `Skills R` · onglet `Menu` | pas de livre | ⏳ **à reconstruire** — on n'y touche pas |
| `Equipment R` · onglet `Sheet` | **aucune rangée** | ⏳ **à reconstruire** — on n'y touche pas |
| **`Identity` — le bilan (R2)** | pas de livre | 🔴 **défaut** — l'écran porte sa trilogie en **R1** et la perd en **R2** |

⚠️ **« À reconstruire » N'EST PAS « CONFORME ».** Eric : *« on peut les laisser tranquille pour le
moment »* — ⛔ c'est un **report**, pas une dispense. Réparer le pied d'un écran qu'on va démonter,
c'est payer deux fois ; **mais la trilogie leur est due au jour de leur reconstruction.**

🔴 **ET LA CAUSE DU DÉFAUT EST STRUCTURELLE, PAS LOCALE.** Le `?` est posé **par la coquille**, une
fois, pour tous ; le **livre est fabriqué par SEPT écrans** (`abilities-step` · `catalogue` ·
`concept-step` · `destiny-step` · `parcours-ecrans` ×2). ⛔ Un organe que chaque écran doit se
rappeler de poser **sera oublié par ceux qui l'oublient** — et le corpus l'écrivait déjà, **pour le
`?` seulement** : *« il est posé par la coquille, une fois, sur toutes les étapes — jamais par un
écran, qui pourrait l'oublier »*. **La règle existait ; personne ne l'avait appliquée au livre.**

⭐⭐ **ET ERIC A DONNÉ LE REMÈDE LE MÊME JOUR, EN UNE PHRASE** : *« les deux, livre et `?`,
doivent être dans **la même entité** »* · *« on ne veut pas se disperser »*.

🔴 **CE N'EST PAS UNE PRÉFÉRENCE DE RANGEMENT, C'EST CE QUI SUPPRIME LE DÉFAUT.** Le `?` ne
manque **jamais** — parce que la coquille le pose. Le livre manque **cinq fois sur douze** — parce
que sept écrans le fabriquent. ➡️ **Un organe unique n'a qu'un seul écrivain, donc un seul endroit
où être oublié — et cet endroit est la coquille, qui ne l'oublie pas.** Le lot d'architecture qu'on
croyait devoir ouvrir **n'existe plus** : il suffit que le duo soit **une entité**, et le livre suit
le `?` partout où il va déjà.

📌 **C'EST AUSSI LE SACRÉ N° 2 RENDU RÉEL.** Le duo `?` + livre était déjà déclaré **sacré** ; il
était sacré **dans le corpus** et **séparé dans le code**. ⛔ Une norme qui ne vit que dans un
document n'existe pas.

⏳ **CE QUI RESTE — l'écriture, pas la décision** *(Eric : « si un autre agent doit faire le travail
de la coquille, après, on fait ça »)* *(Eric : « si un autre agent doit
faire le travail de la coquille, après, on fait ça »)* : **la coquille pose le livre comme elle pose
le `?`**, l'écran ne déclarant que **sa destination**. 📌 Le motif existe déjà — *« l'item déclare un
hôte et reçoit la paire de la coquille »* — et `shell.mjs:4407` **sait déjà** placer un livre à
gauche ; il ne sait pas le créer. ⛔ **Lot à part**, après la fusion des cotes.

### 🔴 DEUX LARGEURS DE BOUTON — **77 et 105** *(Eric, 2026-09-06)* · **amendée le 15–16/09**
📍 `bouton-deux-largeurs` · vivante · 06/09 · **amendée 15/09 (gabarits) et 16/09 (corps)**
⚖️ **Deux largeurs de bouton — PETIT 77 pour ≤ 6 caractères, LARGE 105 pour ≤ 11 — hauteur `--touch`, texte **16 px / graisse 600**, écriture classique. Et un troisième gabarit sans cote : LIBRE.**

⚠️ **L'IDENTIFIANT RESTE `bouton-deux-largeurs`, ET IL EST DEVENU UN FAUX NOM.** On ne renomme pas
un identifiant sous un lien : le nom dit « deux », la règle en porte **trois**. ⏳ Le renommage est
une décision d'Eric, signalée à l'architecte le 16/09, **pas prise ici**.

> Eric, 2026-09-06 : *« je veux une taille standard pour tous les petits boutons sur tout le
> site »* · *« **la cote 77** comme standard petit »* · *« **donc c'est 105**, c'est acté »*
> pour le moyen · *« l'écriture classique en **T3**, bien »*.

| | la cote | ce qu'elle porte |
|---|---:|---|
| **PETIT** | **77** | un libellé de **6 caractères ou moins** — `Done` · `Next` · `Cancel` · `Choose` · `Draw` · `FH 3D6` · `4D6` · `ARRAY` · `FREE` |
| **LARGE** | **105** | jusqu'à **11 caractères** — il porte **`Equipment`** et même **`Inheritance`**, le plus long nom de chapitre |
| **LIBRE** | — | largeur **déduite du mot**, hors échelle — `Expert view` 105,85 · `Export JSON` 113,69 · `Export HTML` 115,46 · `I understand` 128,64 · `Turn tutorials off` 159,44 *(mesurés le 16/09)* |

🔴 **`MOYEN` S'APPELLE `LARGE` DEPUIS LE 15/09** *(Eric : « petit / large / libre, y'en a 3 »)*.
⛔ **Mais le CODE dit toujours `moyen`** — `--bouton-moyen` *(`tokens.css`)* et `.bouton-moyen`
*(`shell.css`)*, cinq emplois, et **aucun `--bouton-large` n'existe**. ➡️ Ne pas citer un jeton
qui n'existe pas : dans une feuille on écrit `--bouton-moyen`, dans le corpus on dit **large**.
Le renommage du jeton est un lot à lui seul.
⚠️ **ET ELLE ENTRE EN TENSION AVEC UNE AUTRE RÈGLE, VIVANTE, DANS CE MÊME FICHIER** — l'ancre
`bouton-large-renomme-medium` *(26/08)* dit **« `large` s'appelle désormais `medium` »**, soit
l'inverse du vocabulaire du 15/09. Les deux ne peuvent pas être vraies ensemble.
⏳ **ET RIEN N'EST PÉRIMÉ ICI, DÉLIBÉRÉMENT.** Périmer une règle demande un lien dans les deux
sens et change son statut de `vivante` à `remplacée` : c'est une décision d'Eric, pas une
correction d'écriture. Ce paragraphe **signale**, il ne tranche pas — l'architecte porte
l'arbitrage. ⛔ Tant qu'il n'est pas rendu, les deux lignes restent lisibles côte à côte, et
c'est la seule forme honnête d'une contradiction qu'on n'a pas le droit de résoudre.

⛔ **Hauteur `--touch` (44), texte **16 px / graisse 600**, écriture **classique** — pas de
capitales, Eric l'a retiré le jour même : *« j'ai pas demandé les capitales, j'ai dit AU CAS OÙ
les capitales »***.

🔴 **T3 (14) EST ABROGÉ POUR CETTE FAMILLE — Eric, 15/09 : *« garde 16 et corrige la règle »***.
📏 **Mesuré le 16/09 sur le builder servi**, échelle 1,3653, sous `.app` : les six boutons du pied
*(`Open` · `Save` · `Forget` · `Display` · `DM` · `Tools`)* rendent **16 px / 600**, pas 14. Le
code rendait 16 depuis toujours et les écrans ont été validés ainsi ; c'est la **loi** qui avait
tort, pas le code.
⚠️ **Et l'abrogation vaut pour CETTE famille, pas pour tout le fichier.** Trois corps coexistent
réellement dans le site — **16/600** *(Menu, Species, Inheritance, Destiny, Class)* · **14/600**
*(Identity)* · **14/400** *(Skills)*. ⛔ Cinq autres lignes de ce fichier disent encore T3 pour un
bouton *(≈ 930, 2563, 3946, 4860, 4861)* : elles parlent d'autres organes ou d'autres étages, et
**aucune n'a été touchée ici**. Les corriger sans les avoir mesurées une par une serait refaire la
faute que cette section-ci vient de payer.
📌 Rembourrage **`--sp-8`**, et c'est lui qui rend les cotes possibles — voir plus bas.

⭐ **LES DEUX COTES NE SONT PAS CHOISIES, ELLES SONT DÉDUITES DE LA PLACE**, et c'est ce qui les
rend défendables. La dalle offre **335 blg** de contenu *(367 moins ses 2 × 16)*. Eric a posé
**deux configurations, et chacune doit tenir** :

| la cote sert à | l'arithmétique | reste |
|---|---|---:|
| **4 petits** en largeur | 4 × 77 + 3 × 8 = **332** | 3 |
| **3 petits + livre + `?`** | 44 + 3 × 77 + 2 × 8 + 44 = **335** | 0, pile |
| **3 moyens** en largeur | 3 × 105 + 2 × 8 = **331** | 4 |
| **2 moyens + livre + `?`** | 44 + 2 × 105 + 8 + 44 = **306** | 29 |

📏 **MESURÉ AU BANC LE 06/09, chaque mot dans SA classe** *(⚠️ une sonde qui emprunte la classe
d'un autre organe ment : la première a pris un onglet du belt, police 16 et rembourrage 0)* :

| le mot le plus large de sa famille | largeur à `--sp-8` | dans sa cote |
|---|---:|---|
| **`Cancel`** *(le petit le plus large **au rendu**)* | **69,4** | 77 → **7,6 de marge** |
| `Choose` | 66,9 | 77 → 10,1 |
| `Inheritance` | **92,7** | 105 → **12,3 de marge** |
| `Equipment` | **88,6** | 105 → **16,4 de marge** |

⛔ **CORRECTION DU 06/09, 15:0x — L'ARCHITECTE AVAIT NOMMÉ LE MAUVAIS TÉMOIN.** Cette section a
d'abord écrit que **`Choose`** était « le petit le plus large du dépôt ». **C'est faux au rendu.**
Le siège BOUTONS l'a mesuré : `Cancel` vit dans `.parcours-annuler` à **16 px / 600**, `Choose`
dans `.fiche-action` à **14 / 400**. À corps égal `Choose` gagne ; **à l'écran c'est `Cancel`** —
69,4 contre 66,9. ⭐ **Le témoin d'une cote n'est pas le mot le plus long, c'est le mot le plus
large DANS SA PROPRE CLASSE** — et c'est exactement le piège que la ligne suivante annonce, payé
par celui qui l'écrivait.

⚠️ **ET LA FAMILLE NE REND PAS T3.** `.parcours-pied button` rend **16 px / 600** là où cette loi
disait T3 (14). C'est ce qui ramène la marge de `Cancel` à **7,6** au lieu de ~15.
✅ **TRANCHÉ LE 15/09 — Eric : *« garde 16 et corrige la règle »***. ~~Non tranché~~ : c'est le
**code** qui fait foi, la loi est amendée plus haut. Les deux vérités ne coexistent plus.
⭐ **Et le sens de la correction mérite d'être retenu** : entre une loi écrite et un rendu validé à
l'écran depuis des semaines, c'est la loi qui cède. Une règle qu'aucun écran n'applique n'est pas
une règle, c'est une intention.

⚠️ **ET LE REMBOURRAGE EST LE VRAI LEVIER, PAS LA LARGEUR.** À `--sp-20` *(l'ancien)*, `Choose`
réclamait **89,7** — aucune largeur ne pouvait satisfaire à la fois « le plus gros mot rentre » et
« quatre boutons dans la rangée ». C'est en descendant le rembourrage que les deux se referment.
📌 Corollaire : ⛔ **on ne rétrécit jamais un bouton en réduisant sa police ou en tronquant son
mot.** On rend son rembourrage, ou on change le mot.

⚖️ **105 A ÉTÉ CHOISI CONTRE 101 ET CONTRE 106, ET LA RAISON EST ÉCRITE ICI POUR QU'ON NE
« L'OPTIMISE » PAS DEMAIN.** Trois candidats ont été calculés, chacun par ce que son RESTE devient
une fois la rangée centrée :

| cote | 3 moyens | reste | marge de chaque côté | |
|---:|---:|---:|---:|---|
| **106** | 334 | 1 | **0,5** | ⛔ un demi-blg — le maximum théorique, et le pire |
| **105** | 331 | 4 | 2,0 | ✅ **retenu par Eric** |
| **101** | 319 | 16 | **8,0** | ◻︎ les marges tomberaient sur `--sp-8`, un jeton |

⭐ **101 était mathématiquement plus élégant, et Eric a tranché 105 quand même.** Sa loi du jour est
*« la marge importe plus »* — mais il l'a appliquée au **bouton**, pas au reste : 105 donne à
`Inheritance` **12,3 blg** de respiration là où 101 n'en laisse que 8,3. ⛔ **La marge qui compte est
celle du MOT dans son bouton, pas celle de la rangée dans sa dalle.** C'est le mot qu'on lit.

⛔ **CE QUI N'ENTRE PAS DANS CES DEUX COTES** *(Eric les a exclus nommément)* : les **chevrons** ·
les **onglets** `Menu`/`Sheet` *(58, `--onglet-taille`, un organe déclaré à part)* · les
**interrupteurs** on/off · le **livre** et le **`?`**, qui valent `--touch` 44 et sont des ronds,
pas des boutons à mot.

### 🔴 NON COLORÉ = NON CLIQUABLE *(Eric, 2026-09-06)*
📍 `bouton-gris-non-cliquable` · vivante · 06/09 · borne `bouton-done-gris-inacheve`
⚖️ **NON COLORÉ = NON CLIQUABLE, dans les deux sens : un bouton gris n'est jamais cliquable, un bouton cliquable n'est jamais gris.**

> Eric, 2026-09-06 : *« un `Done` non cliquable se confond avec un bouton non coloré.
> **Désormais NON COLORÉ = NON CLIQUABLE.** »*

⭐ **CE N'EST PAS UN GOÛT, C'EST UN TÉMOIN MESURÉ, ET IL EST FORT.** Devant `4D6` en scène 2,
Eric a dit *« 4D6 n'a pas de `Done` »* — puis, deux messages plus tard : *« le `Done` est là mais
grisé quand inactif »*. **Il ne l'avait pas vu.** Un bouton présent, à sa place, lisible au
contraste — et **invisible à l'usage**. Le gris ne se lisait pas comme « désarmé » : il ne se
lisait pas du tout.

➡️ **LA RÈGLE, DANS LES DEUX SENS** *(c'est ce qui la rend opposable)* :

| | |
|---|---|
| **un bouton GRIS** | ⛔ **n'est jamais cliquable** |
| **un bouton CLIQUABLE** | ⛔ **n'est jamais gris** — il porte le verbe qu'il fait : naviguer **bleu** · valider **vert** · défaire **rouge** |

⚠️ **ET LE GRIS DIT AUJOURD'HUI DEUX CHOSES CONTRAIRES DANS LE MÊME PRODUIT** — relevé par le
siège Abilities le 06/09, **vérifié par l'architecte, deux occurrences et deux seulement** :

| où | ce que le gris y signifie | état |
|---|---|---|
| `shell.mjs:4064` — le `Done` *(`done.disabled = !gate.ready`)* | *« tu ne peux pas »* | ✅ conforme |
| `shell.css:7630` — `.ability-entry` *(les quatre méthodes `FH 3D6` `4D6` `ARRAY` `FREE`)* | *« tu peux, je n'ai simplement pas d'état »* — 📏 **mesurées au banc : `#928c7f`, `aria-pressed="false"`, et PARFAITEMENT cliquables** — c'est même le seul geste de l'écran | ⛔ **viole** |
| `shell.css:7922` — `.pipeline-bouton`, `.dressing-bouton`, `.carte-r-bouton`, `.pipeline-ligne-envoi`, `.pipeline-pas`, `.aiguilleur-bouton` *(Équipement)* | le commentaire au-dessus **déclare** le gris comme un état légitime : *« MUET (GRIS DÉFAUT) »* | ⛔ **viole** |

🔴 **CES DEUX FAMILLES SONT DONC EN INFRACTION CONNUE, ET LEUR SORT N'EST PAS TRANCHÉ** :
bleues *(elles naviguent, elles agissent)*, ou vraiment **désarmées** là où elles sont grises ?
⛔ **C'est un arbitrage d'Eric** — voir `A-TRANCHER § C24`. ⚠️ Tant qu'il n'a pas tranché, on ne
repeint rien : une norme neuve ne se câble pas en repeignant au hasard ce qu'elle condamne.

📌 **ET LE GARDE VIENT APRÈS, PAS AVANT.** Un garde de la forme *« aucun bouton gris n'est
cliquable, aucun bouton cliquable n'est gris »* rougirait **immédiatement** sur ces deux familles.
Le poser aujourd'hui, c'est livrer une suite rouge ; l'assouplir pour qu'il passe, c'est écrire un
garde creux. Il se pose **le jour où Eric a tranché**, il se fonde sur la **DONNÉE** (`disabled`,
la teinte calculée), ⛔ jamais sur la forme d'un sélecteur.

### 🔴 INACTIF N'EST PAS UNE NUANCE DE GRIS — c'est un TROISIÈME ÉTAT *(Eric, 20/09)*
📍 `bouton-inactif-garde-sa-couleur` · vivante · 20/09 · **ferme la moitié restée ouverte de `A-TRANCHER § C24`**

> Eric, 2026-09-20, sur `COMPANIONS` : *« quand il sera actif ce sera un liseré bleu, il est
> inactif, pas de destinations, mets réduit son voile comme pour les tally, comme ça on oublie
> pas qu'ils existent. Un vrai bouton inactif n'a pas de liseré, mais aussi la capacité de
> devenir actif. »*

⚖️ **Un bouton INACTIF garde la couleur qu'il portera une fois actif, n'affiche AUCUN liseré
tant qu'il dort, et porte le voile `--organe-eteint` — le même que le tally vide.**

⭐ **CE QUE CETTE RÈGLE AJOUTE — ce n'est pas une redite de `bouton-gris-non-cliquable`.** Le
corpus ne connaissait que **deux** termes : *gris* ⇒ pas cliquable, *coloré* ⇒ cliquable. Eric
en pose un **troisième**, qui ne se range sous aucun des deux :

| l'état | sa couleur | son liseré | ce qu'il dit au joueur |
|---|---|---|---|
| **actif** | le verbe qu'il fait | **oui**, de cette couleur | *« vas-y »* |
| **gris** | `--text-muted` | aucun | *« tu ne peux pas »* |
| ⭐ **inactif** | **celle de son réveil** *(latente)* | **aucun** | *« pas encore — mais je serai là »* |

➡️ **La couleur appartient au BOUTON, la présence du liseré appartient à son ÉTAT.** Les deux
règles que le siège croyait en conflit sur `COMPANIONS` — *« Eric l'a nommé dans les bleus »* et
*« un bouton gris n'a pas de liseré »* — **sont vraies toutes les deux et ne se rencontrent
jamais** : la première parle de l'identité, la seconde de l'état. ⛔ Il n'y avait rien à arbitrer.

⭐ **ET LE VOILE N'EST PAS UN ORNEMENT, C'EST SA RAISON D'ÊTRE.** *« comme ça on oublie pas
qu'ils existent »* — un bouton retiré de l'écran ne promet rien ; un bouton voilé à 20 % dit
qu'une porte existe et qu'elle s'ouvrira. ⛔ **Donc on ne « nettoie » pas un inactif en le
retirant** : le retirer détruit l'information que le voile porte.

✅ **DÉJÀ CONFORME, MESURÉ — pas déduit.** `getComputedStyle` sur
`button.gear-porte[data-organe=companions]`, feuilles `tokens.css?v=767` + `shell.css?v=767`,
le 20/09 à 14:52 :

| | `disabled` *(aujourd'hui)* | le même, armé |
|---|---|---|
| `--bouton-fond` *(la couleur du liseré, `shell.css:8835`)* | **`transparent`** | **`#5f90c7`** — le bleu |
| `opacity` | **`0.2`** = `--organe-eteint` | `1` |

⭐ La règle d'Eric était **déjà le comportement du code**, depuis `.gear-porte:disabled,
.x1-porte:disabled` *(`shell.css:11774`, lot 213, 18/09)*. ⚠️ **Ce qui était faux, c'est un
COMMENTAIRE** : `shell.css:9223` affirme encore *« les muets (CRAFT, COMPANIONS, réserve) restent
au gris du défaut »*, et la cascade le dément 2551 lignes plus bas. 🔴 *Le sélecteur fait foi,
jamais le commentaire qui l'entoure.*

⛔ **LE VÉRITABLE DÉFAUT EST AILLEURS, ET IL EST STRUCTUREL : CETTE LOI A ONZE ÉCRIVAINS.**
Relevé le 20/09 sur `shell.css` — **aucune règle générale `button:disabled` n'existe au socle**,
chaque famille réécrit la sienne, avec **six voiles différents** :

| voile | familles |
|---|---|
| `.5` | `.sortie-bouton` |
| `.45` | `.tray-bouton` |
| `.4` | `.glisse-jeton` · `.gear-bouton` |
| ✅ `--organe-eteint` *(.20)* | `.gear-monnaie-bouton` · `.gear-porte` · `.x1-porte` · `.sac-poignee` |
| **aucun voile**, liseré retiré seul | `.parcours-pied button.tdc-porte` · `.ability-entry` |
| **aucun des deux** *(curseur seul)* | `.interrupteur` · `.magasin-lieu` · `.parcours-pied button` |

🔴 **Une norme se câble en DÉFAUT PARTAGÉ AU SOCLE, jamais famille par famille** — onze
écrivains, c'est la garantie qu'un douzième écran l'oubliera sans qu'aucun garde ne bronche.
⚠️ ⛔ **Mais l'unification n'est PAS un `sed`** : `.sortie-bouton` à `.5` et `.glisse-jeton` à `.4`
ont peut-être été **regardés** et retenus — exactement comme le `.6` du body forging, qui était
une cote copiée que personne n'avait regardée, remplacée par `.20` le 16/09 devant l'œil d'Eric.
➡️ Chaque valeur se **regarde sur son écran** avant d'être ramenée au défaut, ou gardée avec son motif.

📌 **ET LE GARDE PEUT ENFIN SE POSER.** Le corpus disait, quelques lignes plus haut : *« il se
pose le jour où Eric a tranché »*. C'est ce jour. ⛔ Il se fonde sur la **DONNÉE** (`disabled`, la
teinte calculée), jamais sur la forme d'un sélecteur — et il doit chercher **ce qui MANQUE**
*(une famille sans voile)*, pas seulement ce qui est écrit en trop.

### ✅ LE GRIS EST `--text-muted`, ET UN `DONE` INACHEVÉ EST GRIS *(tranché 26/08)*
📍 `bouton-done-gris-inacheve` · vivante · 26/08 · bornée par `bouton-gris-non-cliquable`
⚖️ **Un `Done` sur une étape inachevée est GRIS, jamais bleu, et il passe au vert quand elle est achevée.**

> ⚖️ **BORNÉE, PAS REMPLACÉE, LE 2026-09-06.** La règle ci-dessus ne change **ni la teinte du
> `Done`** *(il reste gris tant que l'étape est inachevée)* **ni son argument** *(« le bleu
> impliquerait un mouvement »)* : elle lui donne un **SENS OPPOSABLE** — ce gris-là veut dire
> *« tu ne peux pas »*, et plus aucun bouton cliquable n'a le droit de le porter. Cette section
> reste **vivante**, entière.

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
📍 `bouton-rouge-signale-violet-explique` · vivante · ?
⚖️ **Un bouton rouge dit qu'il y a un problème ; le gendarme dit lequel.**

> Eric : *« le rouge c'est pas bon — **tu peux me mettre un flic en même temps** »*.

Un bouton rouge **dit qu'il y a un problème** ; le **GENDARME** *(popup violet, §7)* **dit lequel**.
⭐ **Les deux ne font pas double emploi** : la couleur se voit d'un coup d'œil et ne prend pas de
place ; le gendarme prend la parole et coûte une interruption. **Le rouge signale, le violet
explique.**

### ✅ QUAND LE GENDARME PARLE — tranché 26/08
📍 `bouton-gendarme-quand-ca-bloque` · vivante · 26/08
⚖️ **Le gendarme ne parle que quand le rouge EMPÊCHE d'avancer.**

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
📍 `interrupteur-n-est-pas-un-bouton` · vivante · 26/08
⚖️ **Un `on/off` n'est pas un bouton : c'est un organe distinct, au même titre que le jeton ou le collecteur.**

> Eric, 2026-08-26 : *« les boutons on/off, il y en a plein dans le menu »* · **« on/off
> interrupteur, oui »**.

⛔ **Un `on/off` N'EST PAS UN BOUTON.** C'est un **organe distinct**, au même titre que le jeton,
le collecteur ou le dropdown.

⭐ **La raison est mécanique, pas esthétique** : les quatre couleurs sont **une ÉCHELLE
D'AVANCEMENT** — gris, bleu, vert, rouge — et **un interrupteur ne la parcourt pas.** Il n'est ni
« en cours » ni « fini » : **il est dans une position, et il y reste.** Son rouge ne dit pas
*« c'est faux »*, il dit *« c'est éteint »*.

➡️ **Deux sens du rouge sur le même écran, c'est un rouge qui ne signale plus rien.** La collision
se règle donc **par la FORME**. ~~exactement comme la coupe d'angle distingue le bouton du jeton~~

⚠️ **SON ANALOGIE EST RÉÉCRITE, PAS SEULEMENT RE-POINTÉE — 17/09.** Elle s'appuyait sur la coupe
d'angle, c'est-à-dire sur **un trait unique et catégorique** : un objet l'a ou ne l'a pas, et la
frontière est nette. Depuis qu'Eric a retiré l'octogone, ce qui sépare un bouton d'un jeton est un
**faisceau de trois traits de degré** — opacité, forme, couleur *(`bouton-trois-traits-le-separent-du-jeton`)*.
🔴 **UN ARGUMENT QUI REPOSAIT SUR UNE FRONTIÈRE NETTE ET QUI REPOSE MAINTENANT SUR UNE CONVERGENCE
N'EST PAS LE MÊME ARGUMENT.** ⛔ Ne pas le croire intact parce que sa conclusion n'a pas changé : ici
la forme sépare **encore**, mais elle ne sépare plus **à elle seule**. La comparaison reste juste
pour dire *« la forme peut porter une distinction »* ; elle ne l'est plus pour dire *« et cela
suffit »*.

### 🔴 DEUX ESPÈCES D'INTERRUPTEUR — et une seule pose une question
📍 `interrupteur-trois-sens-du-vert` · vivante · 26/08
⚖️ **Le vert porte trois sens, et c'est le PORTEUR qui les sépare : « fini » sur un bouton, « en marche » sur un On/Off, « vivant » sur une pastille de coffre.**

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
📍 `interrupteur-dessine-jamais-un-glyphe` · vivante · 26/08
⚖️ **La piste et le pouce sont DESSINÉS, jamais un glyphe.**
📍 `interrupteur-selecteur-sans-couleur` · vivante · 17/08
⚖️ **Le sélecteur exclusif ne porte AUCUNE couleur : l'allumé se dit par la position du pouce et l'encre pleine.**

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
📍 `interrupteur-bascule-simple` · vivante · 26/08
⚖️ **La bascule simple garde son bouton : 72 × 44, rayon 8, libellé `On`/`Off`, liseré vert allumé.**

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
📍 `cadre-pastille-de-coffre` · vivante · 26/08
⚖️ **Le bloc coffre du Seuil porte une pastille de 8 px + le mot de l'état + « depuis quand ».**

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
| `Cancel` | octogone | 🔴 rouge **+ popup** |
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
📍 `bouton-porte-a-deux-ages` · vivante · 27/08
⚖️ **Le bouton de menu de création est UN bouton à deux âges : proposition tant que la condition n'est pas remplie, résolution dès qu'elle l'est.**
📍 `bouton-troisieme-age-est-l-absence` · vivante · 27/08
⚖️ **Une fois l'étape validée par le `Done` du pied, la porte disparaît et le résumé prend sa place.**

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
📍 `bouton-plus-moins` · vivante · 26/08
⚖️ **`+` et `−` sont un quatrième gabarit : carré ou petit cercle, `+` vert et `−` rouge.**

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

### 💡 LE VOYANT SRD — une lampe, pas un bouton *(Eric, 09/09)*
📍 `voyant-srd-toujours-allume-jamais-un-controle` · vivante · 09/09
⚖️ **Le SRD est un VOYANT : toujours allumé, dans les deux piles, et il n'expose ni `role="switch"`, ni `aria-checked`, ni `disabled` — un `role="status"` qui dit « always on ». ⛔ Jamais un interrupteur grisé.**

> Eric, 2026-09-09, devant la v612 : *« Le bouton SRD est un **voyant**, pas un bouton — il est
> toujours actif. »*

📏 **CE QUE C'ÉTAIT, ET POURQUOI C'ÉTAIT FAUX.** Le socle de `Layers` et la ligne des règles du Menu
portaient un `interrupteur({ on: true, disabled: true })`. Un interrupteur `disabled` **ressemble à
un bouton qu'on ne peut pas pousser** — piste grise, pouce gris, curseur barré : trois signes qui
disent *« pas à toi de le toucher »*, quand la vérité est *« il n'y a rien à toucher »*. Et le lecteur
d'écran annonçait *« interrupteur, activé, désactivé »* sur une chose qui n'a jamais eu deux positions.

⭐ **LA NORME EXISTAIT AVANT L'ORGANE** — `voyant-non-cliquable` *(26/08)* : *« le voyant ne se touche
pas : ne pas lui donner l'apparence d'un contrôle »*. Sa forme est celle de la **pastille de coffre**
*(`cadre-pastille-de-coffre`, « C — la pastille et la date »)* : un **point de 8 px** + le **mot de
l'état**. Le Menu en portait déjà une sur sa ligne d'état *(`[data-garde]`, « ● saved »)*.

| | |
|---|---|
| **l'organe** | `voyant({ label, note })` — `layers-ecran.mjs`, à côté d'`interrupteur` et `ligneReservee` |
| **ses deux emplois** | le socle de **`Layers`** *(« SRD 5.2.1 · the core rules »)* · la ligne des règles du **Menu** *(« SRD »)* — **un organe, un sens, deux endroits** |
| **ce qu'il annonce** | `role="status"`, `data-on="true"`, le mot **always on** ; ⛔ pas de `<button>`, pas de focus clavier |
| **son dessin** | la **même ligne** que l'interrupteur *(`--touch` 44, mot en 600, note en T1 dessous)* ; à droite, **un point `--positive`** et le mot, ⛔ ni piste ni pouce |
| **le sens qui change** | ⛔ **plus de miroir inversé** *(« quand l'un s'allume, l'autre s'éteint », 17/08)* : le SRD est allumé **que Fate's Hand le soit ou non** — c'est le **plancher**, pas l'autre plateau |
| son garde | `tests/ecran-layers.test.mjs` *(D0 — l'attaque remet l'interrupteur au socle et la clause accuse)* · `tests/universe-step.test.mjs` R7 |

🔴 **ET LE GARDE DU LOT 188 SURVIT SOUS SA NOUVELLE FORME** — *« le SRD ne s'éteint JAMAIS »* : il ne
peut plus s'éteindre parce qu'il **n'a plus de position éteinte**, et la clause le vérifie dans les
deux états du maître.

### 🔴 LE VOYANT D'AVANCEMENT — c'est le CRAN DE LA CEINTURE *(tranché 26/08)*
📍 `voyant-anneau-vs-disque` · vivante · 19/08
⚖️ **Un anneau se lit « en cours », un disque PLEIN se lit « fait » — et la règle vaut pour les quatre états.**
📍 `voyant-est-le-cran-de-la-ceinture` · vivante · 26/08
⚖️ **Le voyant d'avancement EST `.belt-index`, le chiffre d'un cran de ceinture — on n'en fabrique pas un second.**
📍 `voyant-traverser-n-est-pas-finir` · vivante · 26/08
⚖️ **Le vert du voyant vit sur `data-fait`, prononcé par le juge de Review, pas sur `data-status="done"`.**
📍 `voyant-bleu-et-rouge-a-construire` · à trancher · 26/08
⚖️ **Le bleu (avancement) et le rouge (erreur) du voyant n'existent pas encore, et le juge qui prononce « erreur » n'est pas désigné.**

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
📍 `chevron-apparition-et-zone` · vivante · 26/08
⚖️ **Le chevron apparaît à l'approche du doigt ou de la souris (500 ms de présence suffisent), s'efface, mais sa zone reste cliquable.**
📍 `chevron-compte-sous-le-chevron` · vivante · 26/08
⚖️ **Sous chaque chevron figurent le nombre de pages et le nombre d'items.**
📍 `chevron-gauche-et-droite` · vivante · 26/08
⚖️ **Les chevrons se posent à GAUCHE et à DROITE, jamais au-dessus, sur la dalle et au ras de son bord.**
📍 `chevron-un-objet-deux-roles` · vivante · 26/08
⚖️ **Le chevron est un seul objet : il amorce le défilement ET il fait naviguer dans une liste paginée.**
📍 `chevron-ecart-avec-le-code` · à trancher · 26/08
⚖️ **Le code du 15/08 pose `.stage-chevrons` en haut et en bas, en 36 × 14, non tactile.**

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
📍 `cadre-belt-deux-largeurs-et-ce-qui-change-dans-chacune` · vivante · 02/09
⚖️ **La ceinture est toujours visible et fait 60 blg ; le belt fonctionne sur DEUX largeurs, dont les exceptions se réduisent à un nombre de crans visibles.**

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
📍 `cadre-loi-en-phrase-tuile-vaut-piste-divisee-par-ce-qu-elle` · vivante · ?
⚖️ **Une tuile vaut la piste divisée par ce que la piste montre — une seule formule, deux comptes.**

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

### 🔴 LA CEINTURE EST VERSATILE — elle montre ce que la PILE MONTÉE justifie *(Eric, 2026-09-09)*
📍 `cadre-belt-versatile-drapeaux` · vivante · 09/09
⚖️ **Un cran de ceinture DÉCLARE le drapeau dont il a besoin ; la ceinture montre ceux dont le besoin est satisfait. ⛔ Elle ne lit jamais le NOM de la pile.**

> Eric, 2026-09-09, dans l'ordre où les trois phrases sont venues :
> *« en pile SRD, que fait le cran Destiny ? »* → **absent, neuf crans** ·
> *« si j'allume Destiny dans les couches, il réapparaît ? »* → **oui** ·
> *« ou il faut que tu réécrives le belt pour qu'il soit versatile SRD / FH »*.

⛔ **CE QUE LA DEUXIÈME QUESTION FERME, ET C'EST TOUTE LA RÈGLE.** Un aiguillage à deux branches
— *« neuf crans si la pile s'appelle `srd`, dix si elle s'appelle `srdfh` »* — se serait trompé sur
la pile qu'Eric décrit lui-même : **SRD plus la seule couche des arcanes** n'est NI l'une NI
l'autre. `currentStack` y rend `null`, et l'écran mort se serait affiché. 📏 **Mesuré le 09/09 sur
les couches du dépôt** : SRD seul lève `[]`, SRD + `fh-arcana-en` lève `["fh.destiny"]`, la pile
complète en lève huit.

| | |
|---|---|
| **la source** | `layers.verbs.flags()` — les drapeaux levés par la pile **montée**, ⛔ jamais `document.build.layers` |
| **un cran conditionnel** | `exige: "<drapeau>"` — sans le drapeau, **le cran n'existe pas** |
| **un mot conditionnel** | `motSi: [{ drapeau, mot }]` — le libellé change **seul** *(`Background` → `Inheritance`)* |
| **le numéro de la pastille** | celui de la ceinture **VISIBLE** — ceinture courte, `Class` porte **4**, pas 5 |
| **l'index qui peint l'état** | 🔴 celui de **`STEPS`**, toujours dix — un cran non monté est **caché**, jamais retiré |
| **l'enchaînement** | ⛔ plus de `± 1` : le cran **voisin sur la ceinture visible** |

🔴 **L'INDEX EST LA MOITIÉ QUI SE TRAHIT SANS CASSER.** Les items du belt sont bâtis **une fois**,
au chargement, donc **avant** qu'une seule couche soit montée. Un tableau qui rétrécirait décalerait
tout ce qui suit le trou, et **l'échec serait SILENCIEUX** — un cran peindrait l'état d'un autre,
sans erreur, sans page blanche. ⇒ La table d'appariement rend **toujours `STEPS.length` entrées**,
`null` là où le cran n'est pas monté *(`cransAlignes`, `etapes.mjs`)*.

⚖️ **ET UN CRAN QUI DISPARAÎT SOUS LE JOUEUR SE DIT.** En vue double, le panneau passif peut être
Destiny pendant que l'actif est le Menu — c'est-à-dire pendant qu'on éteint Fate's Hand. L'écran
rend alors le **refus qui nomme** *(§5 du canon, `MOT_CRAN_NON_MONTE`)*, sa cause et sa sortie.
⛔ **On ne rassoit personne d'office** : une réparation silencieuse est ce que `ecran-mort.mjs`
refuse déjà pour la pile.

📍 `cadre-belt-huit-crans-en-srd-skills-exige-fh-skills` · vivante · 09/09
⚖️ **Le cran Skills exige `fh.skills` : en pile SRD la ceinture montre HUIT crans — Menu · Identity · Species · Background · Class · Abilities · Equipment · Sheet — et les compétences se choisissent DANS la classe.**

> Eric, 2026-09-09, devant la v612 : *« Tu n'as pas enlevé Skills, pourtant tout est décoché dans
> Layers. »* puis : *« En SRD les compétences sont choisies **dans les classes**. »*

📏 **NEUF CE MATIN-LÀ, HUIT DEPUIS.** Le lot 186 comptait neuf crans en SRD parce que seul Destiny
déclarait une exigence. L'écran Skills est le **pool de points de Fate's Hand** *(`fh-skills-en`,
drapeau `fh.skills` — mesuré : cette couche seule lève exactement `["fh.skills"]`)* ; le SRD n'a
**pas d'étape Skills** — ses compétences sont un `skill_choice { count, from }` du record de classe,
et c'est l'écran Class qui les pose. ⇒ Skills **rejoint la loi de Destiny** *(`exige`)*, sans un cas
particulier : `cranVoisin`, `cransAlignes` et `MOT_CRAN_NON_MONTE` le couvrent tels quels. Les gardes
qui comptaient **neuf** sans Destiny comptent **huit** sans Destiny ni Skills — ce n'est pas un
relâchement, c'est le second cran qui rejoint la loi du premier. ⛔ **Abilities ne bouge pas** :
*« Abilities, tu laisses comme dans FH »* *(Eric, 09/09)*.

📌 **LE NOM DE L'ÉCRAN DES SIX INTERRUPTEURS EST ARRÊTÉ : `Layers`** *(Eric, 09/09)*. Il portera
aussi les bascules des livres et du homebrew — c'est pourquoi `Rules` a été écarté : ce mot est
déjà le **nom accessible du bouton livre** *(`aria-label`, `destiny-step.mjs` et
`universe-step.mjs`)*. ⛔ Le lot 186 **ne construit pas cet écran** ; il grave le nom pour que le
lot qui le bâtira n'ait pas à le rouvrir.

### 📐 LA TUILE — deux rangs, et c'est ce qui rend « la même taille » possible
📍 `cadre-tuile-deux-rangs-et-c-est-ce-qui-rend-meme-taille` · vivante · ?
⚖️ **La tuile empile la pastille AU-DESSUS du nom : sa largeur cesse alors de dépendre du mot, et « toutes les tuiles font la même taille » devient vrai par construction.**

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
📍 `budget-lecon-a-part-vide-se-paie-ailleurs-qu-ou-on-regarde` · vivante · 02/09
⚖️ **Un vide n'est pas local : avant de descendre un organe d'un barreau, écrire la somme verticale de sa boîte et chercher lequel de ses termes est un vide.**

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
📍 `chevron-belt` · vivante · 02/09
⚖️ **Le chevron du belt est un TRAIT DESSINÉ sans tuile, à cible `--touch` 44, dont le voile de 35 % vit sur l'ENCRE ; en bout de course il disparaît et sa place reste.**

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
📍 `cadre-trois-tuiles-et-t2` · vivante · 02/09
⚖️ **Le belt étroit montre TROIS tuiles en T2 : la rangée est pleine au blg près, et une tuile ne pourrait s'élargir qu'en prenant sur une cible tactile.**

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
📍 `cadre-deux-bouts-menu-et-sheet-a-100` · vivante · 02/09
⚖️ **`Menu` et `Sheet` sont OPAQUES à 100 % : ce ne sont pas des étapes, et l'opacité le dit sans un mot.**

| | |
|---|---|
| **leur voile** | 🔴 **100 %, opaque** *(ils valaient 80 % depuis leur naissance)* |
| **ce que ça dit** | ⛔ **ils ne sont pas des étapes** — ils sortent de la rangée sans un mot |
| le reste | inchangé : demi-pastille happée par le bord, mot vertical, liseré 1 px |

### ⚠️ CE QUE LE BANC NE SAIT PAS MESURER, dit plutôt que masqué
📍 `cadre-ce-que-banc-ne-sait-pas-mesurer-dit-plutot-que-masque` · vivante · 02/09
⚖️ **Un geste peint LUI-MÊME l'état de ses chevrons, sur la position VISÉE — ⛔ jamais en attendant un événement de défilement.**

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
📍 `popup-application-en-standby` · en standby · 26/08
⚖️ **C'est l'APPLICATION des trois voix qui est en standby, pas la norme : un lot LIT cette section et l'applique, il ne PART PAS en chantier dessus.**
📍 `popup-fenetres-derriere-non-reglees` · en standby · 26/08
⚖️ **Ce qu'un popup pose derrière lui n'est réglé par aucune règle — trois objets, trois traitements mesurés.**
📍 `geste-le-popup-ne-doit-pas-capter-le-lacher` · vivante · 26/08
⚖️ **Le `.popup`, ancré en bas, ne capte pas le lâcher : il est là où vivent les récepteurs du glisser.**
📍 `popup-violet-est-pris-par-la-magie` · vivante · 26/08
⚖️ **Le violet ne peut pas servir à un popup : violet = MAGIE.**

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

### ❓ LE POPUP QUI POSE UNE QUESTION NE SE FERME QUE PAR UNE RÉPONSE *(Eric, 10/09 · lot 201, 13/09)*
📍 `popup-question-exige-une-reponse` · vivante · 13/09
⚖️ **Un popup qui pose une question ne se ferme que par une de ses réponses — ni clic à côté, ni Échap — et il est modal : rien dessous n'est atteignable tant qu'elle est ouverte.**
📍 `popup-question-prend-le-pointeur` · vivante · 13/09
⚖️ **Un popup dont le pied agit prend le pointeur sur ce pied ; un popup-question le prend en entier. `pointer-events: none` reste la loi du popup de statut, et d'aucun autre.**

> ⚖️ **Eric**, 2026-09-10 : *« Un popup doit me dire, avant même d'arriver à l'étape 1, tout de
> suite : tu veux SRD ou FH ? — et faire le réglage pour moi. »* Un réglage qui ne se fait que sur
> la réponse ne peut pas tolérer une question esquivée.
>
> 📏 **CE QUE LA QUESTION ESQUIVÉE COÛTAIT — Eric, 13/09** : *« next ne m'amène pas sur species ?
> pourquoi ? »* — Species vide, `snaps 0`, six interrupteurs allumés, toutes les couches en 200.
> Reproduit au banc (v624, 512 × 764) : « SRD or Fate's Hand? » fermé par un clic hors de lui →
> `choisirLeJeu` ne tourne jamais → le carnet vidé par la remise à zéro (197) n'est jamais regarni →
> Species n'a rien à lister. **Et le clic sur son propre bouton était un clic dehors** : `.popup`
> est `pointer-events: none` *(`geste-le-popup-ne-doit-pas-capter-le-lacher`, 20/08)*, ses boutons
> l'héritaient, `elementFromPoint` au centre de « Fate's Hand » rendait la rangée `Done` du dessous.
> **Le geste normal d'un joueur produisait l'écran vide.**
>
> ⭐ **DEUX VERROUS INDÉPENDANTS, PAS UN** : la création dérive le personnage neuf **tout de suite**
> *(`repartirAZero` → `rebuild()` ; sans classe le moteur nomme `derivationImpossible` et pose le
> carnet par `verbs.decisions` — plus jamais `state.decisions = []` sur un document vivant)* ; et la
> question **exige une réponse**. Le second sans le premier laisserait le trou à la prochaine porte
> qui vide le carnet ; le premier sans le second laisserait la question esquivable.
>
> 🔌 **COMMENT, ET PAR LA DONNÉE** : le popup porte `exigeUneReponse: true` *(`popupDuJeu`,
> universe-step.mjs)* ; `paintPopup` le passe à `mountPopup.show`, qui n'appelle plus `onOutside`
> et pose `data-exige-une-reponse` sur l'hôte ; la feuille fait le reste — `pointer-events: auto`
> et un `::before` en `position: fixed; inset: 0` au voile de l'aiguilleur *(`--voile-ecran`,
> tokens.css — le 72 % de l'aiguilleur devenu jeton, un seul voile pour deux objets)*.
> ⛔ **Jamais un `if (titre === …)`** : le prochain popup-question n'aura qu'à porter le champ.
> ⭐ **Pourquoi un voile et pas `inert`** : le belt vit hors du panneau, la scène et le rail dans
> une autre branche — rendre inerte « tout sauf le popup » serait une liste de nœuds par nom, donc
> incomplète par construction ; un voile `fixed` couvre la page entière sans nommer personne, et il
> naît et meurt avec l'attribut que `mountPopup` pose — aucun second écrivain.
> ⚠️ **Ce qu'il ne couvre pas** : le clavier. Un `Tab` peut encore atteindre un bouton du dessous ;
> le produit se joue au doigt, et c'est laissé en l'état, dit ici.
>
> 🟢 **CE QUI NE CHANGE PAS** : le gendarme, le guide sans actions, le popup d'information d'un
> jeton *(`Close` · `Select`)* se ferment toujours au clic dehors *(III.4, lot 62)* — la règle du
> 07/09 *(« toujours possible aussi de tap / clic en dehors pour quitter le popup »)* reste entière ;
> elle parle d'un popup qui **informe**, pas d'un popup qui **demande**. Et le `.popup` de statut ne
> prend toujours pas le lâcher du glisser — seul le **pied qui agit** (`data-actions`) le prend, la
> rangée et rien d'autre.
>
> 🛡️ Les gardes : `tests/popup.test.mjs` E–E quinquies · `tests/premier-pas.test.mjs` G1–G3 *(G1 sur
> la donnée : le personnage neuf dérivé sans réponse porte les espèces montées)* · le banc
> `banc-esc.mjs` *(quatre gestes → 12 espèces)*.

### 🔑 UNE PERMISSION SE DEMANDE DANS LE GESTE — HORS GESTE, ON LA REGARDE *(lot 202, 13/09)*
📍 `geste-permission-se-demande-dans-le-geste` · vivante · 13/09
⚖️ **Une permission du navigateur (dossier, et demain n'importe laquelle) ne se DEMANDE que dans un clic du joueur ; hors clic on la REGARDE, et ce qu'on voit se dit comme un ÉTAT nommé — avec ce qu'il faut cliquer — jamais comme un refus, jamais par un repli silencieux.**

> 📏 **MESURÉ LE 13/09** : Chrome retient le dossier choisi d'une session à l'autre, mais remet sa
> permission à « prompt » à chaque rechargement, et `requestPermission` hors d'un geste jette
> `SecurityError: User activation is required to request permissions`. Le magasin du lot 195
> demandait au chargement : la page `Open` disait ce refus tel quel et n'offrait **rien à cliquer** —
> seul `Save location`, qui rouvre le sélecteur comme si aucun dossier n'avait jamais été choisi.
> ⚖️ Eric, 10/09 : *« le processus de sauvegarde ne semble pas fonctionnel »* ; 13/09, à « j'attaque
> la sauvegarde seul ? » : *« non tu continues »*.
>
> ⭐ **LA FORME** : deux verbes, pas un — REGARDER (`queryPermission`, permis partout) et DEMANDER
> (`requestPermission`, dans un clic). L'état « à autoriser » vit **une fois, au-dessus des sols**
> (`lister()` → `{etat:"a-autoriser", dossier}`), et la page le rend avec **le nom du dossier** et **un
> bouton** dont le clic est le geste : *« Allow access to ‹dossier› »*. `Save`, toujours cliqué,
> demande lui-même dans son clic *(📏 l'activation transitoire survit aux `await` de la file — mesuré
> en Chromium)* ; s'il est refusé quand même, la porte se dit et **nomme ce bouton** comme sortie.
> `Save location` reste présent — c'est la sortie de l'autre cas, celui où le joueur a dit non.
>
> ⛔ **CE QUE ÇA INTERDIT** : demander dans un `permis()` appelé par tout le monde ; un état
> « à autoriser » rendu comme un refus ; un repli vers le tiroir *(C2 du lot 195, gardé)* ; un
> téléchargement de secours là où `possede` dit que les octets vivent dans le dossier.
> 🛡️ Gardes : `tests/magasin.test.mjs` I1–I5 *(la fausse poignée COMPTE les demandes)*.

### ✅ CE QUI EST TRANCHÉ MALGRÉ LE STANDBY — le nom de l'objet du départ *(26/08)*
📍 `popup-aiguilleur-nom-et-critere` · vivante · 26/08
⚖️ **Ce qu'on ne peut pas refuser n'est pas une aide : la fenêtre du départ est un AIGUILLEUR, pas un guide.**
📍 `popup-trois-roles-trois-couleurs` · vivante · 26/08
⚖️ **Il y a trois popups : le GUIDE (parchemin, optionnel), l'AIGUILLEUR (bleu, il prévient), le GENDARME (rouge, il dit l'erreur).**

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
📍 `popup-magie-teinte-a-creer` · à trancher · 26/08
⚖️ **`--magie` est une teinte à créer, et la pastille d'attunement doit la porter.**

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
📍 `popup-pastille-seulement-si-l-autre-parle` · vivante · 26/08
⚖️ **Une pastille n'apparaît que si l'autre voix a quelque chose à dire.**
📍 `popup-pile-et-pastilles` · vivante · 26/08
⚖️ **Un seul popup à l'écran, trois pastilles : le rouge est au-dessus, le bleu au-dessus du parchemin, et on navigue de l'un à l'autre SANS FERMER.**
📍 `popup-points-non-tranches` · à trancher · 26/08
⚖️ **Trois points restent ouverts : si le gendarme se ferme tout seul, la FORME de la pastille, et ce qu'on voit quand un seul des trois parle.**

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
📍 `budget-guide-hors-budget` · vivante · 26/08
⚖️ **Aucun écran ne compte plus le guide dans sa hauteur.**
📍 `popup-guide-est-un-popup` · vivante · 26/08
⚖️ **Le guide est un popup : il ne vit jamais dans le flux et ne prend aucune place dans le budget vertical.**

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
📍 `aide-borne-aux-ecrans-qui-ont-un-guide` · vivante · 26/08
⚖️ **Le `?` n'apparaît que sur les écrans qui ONT un guide.**
📍 `aide-entre-dans-la-rangee` · vivante · 26/08
⚖️ **Le `?` entre dans la rangée de boutons, collé à droite, et il ne participe pas au centrage.**

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
📍 `bouton-borner-la-largeur-ne-reparait-rien` · vivante · 26/08
⚖️ **Rétrécir la rangée ne résout pas le recouvrement du `?` : c'est `space-between` qui collait le dernier bouton au bord.**

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
📍 `livre-aria-label` · vivante · 26/08
⚖️ **Un organe sans texte doit se nommer par `aria-label`.**
📍 `livre-dessine-pas-un-glyphe` · vivante · 26/08
⚖️ **Le livre est dessiné, jamais écrit avec un glyphe 📖.**
📍 `livre-jumelle-gauche-du-question` · vivante · 26/08
⚖️ **Le livre est un rond de 22 px, à la cote exacte du `?`, collé en bas à GAUCHE.**

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
📍 `bouton-sur-une-dalle-jamais-sur-le-fond` · vivante · 26/08
⚖️ **Un bouton se pose sur une dalle, jamais sur le fond.**

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
📍 `bouton-le-flux-ne-porte-aucun-bouton` · vivante · 26/08
⚖️ **Le flux ne porte aucun contrôle d'écran : ce sont les bandes fixes (tête et pied), qui sont des dalles, qui les portent.**
📍 `bouton-les-lignes-gardent-leurs-commandes` · vivante · 26/08
⚖️ **Les lignes d'une liste gardent leurs propres commandes : la règle ne vise que ce qui commande la PAGE.**

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
📍 `bouton-tarot-exception` · vivante · 26/08
⚖️ **Le tarot est un bouton d'exception : une CARTE rectangulaire, opaque, sans texte.**

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
📍 `bouton-deux-dalles-de-destiny` · vivante · 26/08
⚖️ **La dalle tarot ne porte aucun autre bouton que le tarot ; c'est la dalle TEXTE qui porte les éléments classiques.**

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
📍 `bouton-dans-la-rangee-mais-pas-de-son-habit` · vivante · 27/08
⚖️ **Le livre et le `?` sont DANS la rangée mais n'ont pas son habit : l'octogone est réservé aux gabarits à libellé.**

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
📍 `livre-abilities-info-devient-livre` · vivante · 26/08
⚖️ **Sur Abilities, le bouton `INFO` devient un livre et le mot quitte l'écran.**
📍 `livre-un-deplacement-rend-faux-un-texte` · vivante · 26/08
⚖️ **Un déplacement peut rendre faux un texte qu'on n'a pas touché.**

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
📍 `aide-cycle-de-vie` · vivante · 26/08
⚖️ **Le `?` apparaît de base, propose systématiquement d'être désactivé totalement, un `ok` le fait partir pour cette fois, il revient à chaque nouveau personnage sauf désactivation, et la réactivation est toujours possible.**
📍 `bouton-reserve-symetrique` · vivante · 26/08 · bornée par `bouton-reserve-en-rembourrage-est-interdite`
⚖️ **La rangée réserve `--touch` de chaque côté et se centre sur ce qui reste : c'est l'arithmétique, pas un arbitrage.**

> 🔗 **BORNÉE, PAS REMPLACÉE — 2026-09-06.** Ce qu'elle dit reste vrai : la réserve est
> symétrique, et c'est la symétrie qui centre. ⛔ Ce qu'elle ne dit PAS, c'est **par quoi**
> réserver — et lue au pied de la lettre elle a produit **quatre réserves en `padding`**,
> retirées le 04/09. `bouton-reserve-en-rembourrage-est-interdite` la borne : la réserve est
> une **colonne**, jamais un rembourrage.
> ⭐ *Une borne ne tue pas : cette règle vaut encore partout, elle a seulement cessé de
> laisser le choix de la méthode.*
📍 `livre-peut-exister-sans-etre-cable` · vivante · 26/08
⚖️ **Le livre peut exister sans être câblé — exception nommée, et seulement pendant la construction.**
📍 `livre-rangee-encore-vide` · à trancher · 26/08
⚖️ **La rangée réserve bien sa colonne mais elle est vide sur les dix écrans : le `?` vit encore au coin bas-droit d'une dalle, et cinq écrans sur dix n'ont aucune rangée.**

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
📍 `aide-aspect` · vivante · 26/08
⚖️ **Le `?` est plein en parchemin quand le guide n'a jamais été vu, un simple cercle quand il l'a été.**

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
📍 `ecriture-page-unique` · vivante · 26/08
⚖️ **Page unique, sauf mention contraire.**

### 🔴 LES DEUX DROPDOWNS — ils ne font pas le même métier *(tranché 26/08)*
📍 `dropdown-defaut-obligatoire-au-directionnel` · vivante · 26/08
⚖️ **Un dropdown directionnel a OBLIGATOIREMENT une valeur par défaut.**
📍 `dropdown-deux-metiers` · vivante · 26/08
⚖️ **Il y a deux dropdowns : celui de CHOIX (on y prend une valeur) et le DIRECTIONNEL (il dit où va l'objet).**
📍 `saisie-zone-d-ecriture` · vivante · 26/08
⚖️ **Il n'y a rien à normer sur la zone d'écriture : elle est bien par défaut.**

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
📍 `ecriture-pas-de-noir-litteral` · vivante · 26/08
⚖️ **« Ne bouge pas » ne veut pas dire « noir littéral » : c'est `--text`.**
📍 `ecriture-trois-etats-de-texte` · vivante · 26/08
⚖️ **Un texte qui change se peint en trois états seulement : normal (encre), gain (vert), perte (rouge).**
📍 `ecriture-une-valeur-inchangee-ne-se-colore-pas` · vivante · 26/08
⚖️ **Une valeur qui n'a pas changé ne se colore pas.**

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
📍 `socle-pas-de-compte` · vivante · 26/08
⚖️ **Le site n'a aucun compte : `login` et `pass` sont morts, remplacés par un nom de joueur libre et « Connecter mon coffre ».**

⛔ **`login` et `pass` sont MORTS.** Le site n'a **aucun compte**. Ils sont remplacés par
**`Nom de joueur`** *(libre, changeable)* + **`Connecter mon coffre`** *(un bouton → un écran
`Authorize` chez GitHub → plus jamais)*.

⛔ **On ne stocke jamais** de login ni de mot de passe. On stocke **un nom de joueur** et **des
chemins**. Détail : `FH-WEB/FHPC/FHPCv2 hebergement donnees.md`.

---

## 7. 🎲 LE GLISSER DES DÉS — Abilities › B1, **FIGÉ** *(Eric, 2026-09-06 : « je veux que tu figes »)*
📍 `geste-glisser-des-des` · vivante · 06/09
⚖️ **Le glisser des dés d'Abilities › B1 est FIGÉ : ses cotes et ses gestes ne se rouvrent que sur un mot d'Eric.**

> Eric, 06/09, B1 en ligne et validé au pouce : *« tu figes la manière de faire fonctionner les
> fantômes, et le drag and drop versatile : aller-retour source/destination, déplacement latéral ;
> taille des collecteurs versus la taille des dés ; l'architecture des dés — taille du texte, son
> centrage versus taille du dé, pour les grands dés et les petits dés ; position du collecteur sur le
> podium ; et dégager les artefacts marrons. Ici je ne demande pas le liseré bleu rouge vert. »*

**Garde** : `tests/abilities-b1-fige.test.mjs` (les cotes et les règles), `tests/abilities-step.test.mjs`
(les gestes). Adresses : `ui/builder/abilities-step.mjs`, `abilities-tray.mjs`, `tokens.css`, `shell.css`.

### 7.1 Le dé est le token, le collecteur est une dépression
📍 `jeton-de-est-le-token-collecteur-est-une-depression` · vivante · 06/09
⚖️ **Le dé EST le token de cet écran et le collecteur une DÉPRESSION, pas un jeton en relief — les deux lisent la même cellule `--de-pose`.**
| objet | ce qu'il est | la cote | où |
|---|---|---|---|
| **le dé** | le token de cet écran — un token spécial, le cube 3D avec son relief à lui | cellule **`--de-pose` = 41** (sa boîte au podium, îlot 54,5 × `.75`), face **`--collecteur-face` = 28** | `tokens.css` |
| **le collecteur** | une **dépression carrée** (`--creux`), pas un jeton en relief | **80 % de la cellule** (`--collecteur-creux`), dessinée par `::before` dans une cellule de 41 | `shell.css` |
| **la cellule** | §1 ter bis : *un collecteur = un jeton en taille* — la dépression ET le dé posé lisent `--de-pose` | 41, jamais la colonne | `.ability-creneau .fs-de`, `.glisse-cible-vide` |
| **le signe** | « drop » / « here », deux lignes figées, T1, `--text-muted` italique | — | `renderCibleVide` |

⛔ **Rien ne bouge au dépôt** : la colonne s'ancre en haut, la ligne du bonus est réservée même vide à la
métrique du bonus. Mesuré à 375 : nom, cellule, colonne, dalle identiques avant / après (520 · 534 · 82 · 196,4).

### 7.2 Le podium
📍 `cadre-podium` · vivante · 06/09
⚖️ **Chaque pastille du podium est une cible, l'origine redevient un collecteur quand le dé l'a quittée, et la pose ne joue qu'à l'ARRIVÉE d'un lot — jamais à un redessin.**
- Six pastilles (`--podium-pastille`) ; le dé y est réduit à `.75` (le `.8` du moteur repris, `data-sides="6"`), cube 29 × 32,6, **face 28** — c'est l'étalon de `--collecteur-face` : *si le dé du podium change, la face se remesure*.
- **L'origine devient un collecteur** quand le dé l'a quitté : la même dépression, centrée dans le disque (dx 0, dy 0), sans voile.
- **Chaque pastille est une cible** `podium:<index du jet>` ; l'ordre vit dans le lot (`rollBatch.podium`). Lâcher entre les pastilles (`vivier`) rend le dé à sa place.
- **La pose ne joue qu'à l'arrivée d'un lot** (`data-pose`, reconnu par l'identité de `rolls`) — jamais à un redessin.

### 7.3 Le glisser versatile — les quatre gestes, jusqu'à `Done`
📍 `geste-glisser-versatile-quatre-gestes-jusqu-a-done` · vivante · 06/09
⚖️ **Le glisser est VERSATILE — poser · déplacer · échanger · revenir, plus le rangement d'un podium à l'autre — et `Done` s'allume à six poses sans rien bloquer.**
| geste | verbe | ce que le document apprend |
|---|---|---|
| **poser** (podium → collecteur vide) | `assignAbilityRoll` | la valeur, par `set` |
| **déplacer** (collecteur → collecteur vide) | `assignAbilityRoll` (la source rend `null`) | la valeur, par `set` |
| **échanger** (collecteur ↔ collecteur plein, ou podium ↔ collecteur plein) | `assignAbilityRoll` (§1b, `holderKey`) | deux `set` |
| **revenir** (collecteur → podium, par glisser ou par tap) | `unassignAbilityRoll` | **rien** — `rebuild()` jette sur une valeur manquante ; la porte compte les POSES (`abilitiesValidate`) |
| **d'un podium à l'autre** (pastille → pastille, ou collecteur → une pastille) | `abilityPodium {rollIndex, slotOf, key}` | **rien** — un rangement |

🔒 Le tap sur un dé posé = revenir. `Done` s'allume quand six poses existent et **ne bloque rien** : on peut continuer à déplacer.

### 7.4 Le fantôme
📍 `geste-fantome` · vivante · 06/09
⚖️ **Le fantôme est IDENTIQUE à l'objet, divisé par le zoom courant avant d'être posé, et c'est LUI qui vise la cible.**
- Il est **identique à l'objet** : `FS.fantome` = `--de-pose` (41), ses `.porte-de` / image ramenés à `width: 100 %`, le `.8` du moteur repris — ⛔ sinon il est monté à la résolution (96) et son centre tombe 24 px sous le doigt.
- Il vit dans `.app`, qui porte le zoom : **on divise par `facteurZoomCourant()` avant de poser** (`fantomeBouger`). ⛔ Le lot 125 avait fermé cette faute dans `glisser.mjs` « dernier site » — faux : celui-ci la portait. *Une faute « fermée partout » se vérifie par grep sur la forme, pas en croyant le commentaire.*
- Le fantôme **vise** (`fantomeCentre`) : la cible est celle qu'il recouvre, mesurée à (−3,1 ; −3,1) du doigt à zoom 1. C'est ce qui rend la case A → B exacte.
- ⛔ Une épreuve de geste se **dispatche d'un coup, sans `await`** : un onglet masqué bride les minuteurs et ne joue pas les animations.

### 7.5 Le chiffre sur le dé — par taille de dé
📍 `ecriture-chiffre-sur-le-de-par-taille-de-de` · vivante · 06/09
⚖️ **Le chiffre d'un dé se règle par TAILLE DE DÉ — T2 sur le grand, T1 sur le petit, T0 pour la somme — et se centre sur la FACE, pas sur la boîte.**
| dé | boîte | chiffre (`.valeur`) | centrage |
|---|---|---|---|
| **grand** (podium, collecteur, fantôme) | 41 | **T2**, serif du moteur, 500 | sur la **face** : `translateY(−8,75 %)`, mesuré au canvas (centre de la face à 41,25 %) |
| **petit** (tapis de sélection) | 26 (= `TAILLE_DE_RESULTAT`, = `--tray-de-resultat`) | **T1** | idem |
| la somme sous un petit dé | — | **T0** (le huitième barreau, né pour elle) | — |

### 7.6 Aucun artefact brun pendant le geste
📍 `geste-aucun-artefact-brun-pendant-le-geste` · vivante · 06/09
⚖️ **Au survol, RIEN ne se peint : le seul retour visuel du geste est le fantôme.**
Au survol, **rien ne se peint** : ni contour de colonne, ni outline de rangée, ni dépression allumée, ni anneau
autour du dé à échanger — au podium comme aux collecteurs. Le retour visuel du geste est le fantôme.
*(Le liseré bleu / rouge / vert du §2 ter n'est pas demandé ici.)*

### 7.8 `Roll Options` — trois boutons, et la scène 1 seulement *(06/09)*
📍 `bouton-roll-options-trois-boutons-scene-1` · vivante · 06/09
⚖️ **`Roll Options` porte trois boutons de type `Next`, de cote identique et centrés dans une même cellule — et tout le bloc disparaît en scène 2.**
> *« 3d6, Flash et Reset = trois boutons de taille identique de type next (en bleu) et centrés dans une
> même cellule. L'aiguilleur doit expliquer ce que font ces trois boutons. Roll Options peut disparaître
> avec les trois boutons et les dés mobiles en scène 2. »*

- **De type `Next`** : `.tray-bouton` entre dans la **famille octogone**, et prend le **bleu du mouvement** (`--info`) — jeter ou balayer ne signe rien au document. ⚠️ La teinte se pose **après** le bloc de la famille : à spécificité égale, écrite avant, elle perdrait en silence.
- **Taille identique** : `flex: 0 0 var(--glisse-case)` — la cote partagée du dépôt, celle que `Next` plafonne. ⛔ Jamais la largeur naturelle : trois libellés de longueurs différentes font trois boutons différents.
- **Centrés dans une cellule** : la rangée s'**étire** (`justify-self: stretch`) et son contenu se centre — la leçon de `FREE` (05/09).
- **L'aiguilleur les nomme**, en scène 1 seulement : la règle de la méthode (`explicationDe`) **puis** ce que font les trois boutons. Les libellés ne sont pas recopiés — le premier vient de la mécanique, `Flash` et `Reset` de `LIBELLES` (abilities-tray.mjs). ⛔ Un texte qui NOMME un organe se périme avec lui.
- **Tout le bloc part en scène 2** — titre, boutons, tapis vert et dés mobiles ensemble. ⚖️ `Reset` ramenait en scène 1 (05/09) ; c'est désormais `Cancel` (verbe `abilityClear`). *Le geste survit, il change de bouton parce que sa dalle a changé.*
- 📏 Mesuré à 375 : trois boutons **87 × 44**, 29 blg de reste de chaque côté ; aiguilleur **3 lignes** (le plafond) en scène 1, 2 en scène 2.

### 7.7 La sortie de l'écran
📍 `cadre-sortie-de-l-ecran-du-glisser-des-des` · vivante · 06/09
⚖️ **`Done` est VERT dès qu'il est allumé et mène au BILAN ; `Cancel` est ROUGE dès qu'il a quelque chose à abandonner — et c'est la coquille qui les pose.**
`Done` **vert** dès qu'il est allumé (six poses) — Eric, 06/09 : *« mieux en vert finalement »* (bleu
le matin même) ; il mène au **bilan** (7.9), pas à l'étape suivante. `Cancel` **rouge** dès qu'il a
quelque chose à abandonner (le premier jet). Règle de la coquille (`renderSortieEtape`, `data-lit` /
`data-arme`), un producteur pour dix écrans.

### 7.9 Le bilan — R2, l'écran de la racine une fois l'étape validée *(06/09)*
📍 `cadre-bilan-du-glisser-des-des` · vivante · 06/09
⚖️ **`R2` est la destination COMMUNE de B1 / B2 / B3 / B4 : le bilan lit le document, jamais la méthode qui y a mené.**
Eric : *« quand j'appuie sur Done, on remonte en R avec les résultats. R1 (l'ancien choix) disparaît,
devient R2 un bilan »*. Sur **son tapis** (`tapis-bilan`, 552 × 184, rectangle à coins courts — le stade du tirage mangeait les
cellules des bouts), six cellules — **nom** (accent, T1
gras, libre de sortir de sa cellule comme au collecteur) · **le score sur un dé** (cellule `--de-pose`) · **bonus signé** et son mot — le même dessin que
les colonnes du collecteur. Dessous, une dalle de verre : l'aiguilleur (*l'étape est validée*) et la
rangée `livre · Cancel · Next · ?`. `Next` est la même porte que `Done` (`next: "step"`) ; `Cancel`
(verbe déclaré `abilityBilanCancel`) rend le choix, **R1**, sans jeter le lot. Le bilan est un
drapeau de la coquille (`abilityBilan`), jamais déduit d'un lot complet. ⭐ **R2 est la destination COMMUNE de
B1 / B2 / B3 / B4** (Eric, 06/09) : il lit le document et la fiche dérivée, pas la méthode — un seul bilan,
quatre chemins pour y arriver.
**Les noms de caractéristiques sont en `--accent`** (06/09 : l'oxblood *« passe pour un message
d'erreur »*), partout où ils nomment une cellule — collecteur et bilan.

### 7.10 🔴 UN ÉCRAN, UN AIGUILLEUR — le premier s'éteint quand le second s'allume *(06/09 au soir)*
📍 `aiguilleur-un-seul-par-ecran-le-premier-s-eteint` · vivante · 06/09
⚖️ **Un écran n'a qu'UN aiguilleur allumé : le premier s'éteint quand le second s'allume.**
> Eric : *« dans FH 3D6, B1 : le premier aiguilleur disparaît quand le 2ᵉ apparaît en scène 2. Il ne
> reste que le titre FH 3D6. »*

En **scène 2**, la dalle de l'organe ne porte plus que son **titre**. L'aiguilleur qui disait la
règle de la méthode s'en va ; celui du **collecteur** devient l'unique.
⭐ **C'est §6 pré bis appliqué**, pas une règle neuve : un écran a un aiguilleur. La même loi a tué
la ligne d'or de Late Bloomer le même soir (7.11) — **là un second était AJOUTÉ sous les caracs,
ici le premier restait ALLUMÉ** ; deux paragraphes de guidage sur un écran, c'est deux fois la même
faute.
📏 **Et ça referme une mesure** : en scène 2 le gabarit trois bandes écrasait cette dalle — le flux
ne montrait qu'**une ligne et demie** de l'aiguilleur, donc un texte tronqué que personne ne pouvait
lire. Une dalle qui ne porte que son titre n'a plus rien à tronquer.
⚖️ **La portée est celle de la SCÈNE, pas de l'écran** : `scene2` n'existe que sur les deux méthodes
à dés. **ARRAY et FREE gardent leur aiguilleur** — chez eux il n'y a pas de bascule, et c'est le seul
endroit où la méthode s'explique. ⏳ Qu'ils en portent **deux à la fois** est vrai et mesuré : c'est
une question ouverte pour Eric, pas une déduction à prendre dans un lot.

### 7.11 🌱 LATE BLOOMER — un trait se présente comme un TOKEN, jamais comme une phrase *(06/09 au soir)*
📍 `jeton-trait-est-un-token-sans-destination` · vivante · 06/09
⚖️ **Un trait se présente comme un TOKEN — l'octogone unique de §2 bis, liseré vert — et celui-ci n'a AUCUNE destination : il informe, et rien d'autre.**
> Eric, en renversant la ligne d'or du matin même : *« on fait plus simple pour Late Bloomer,
> présente-le comme un token classique. Il se place sous les caracs, annule le 2ᵉ aiguilleur (ça faut
> pas faire), le token n'a aucune destination mais il se présente comme un trait. Clic droit pour
> info. L'unique aiguilleur dit juste qu'il existe. »* · *« token classique, tu comprends pas, comme
> un dé »* — **l'octogone de §2 bis**, celui des lignages et des sorts, ⛔ **pas** le cube 3D de cet
> écran. · *« il a un liseré vert car il est valide. »*

| ce qu'il est | la cote | où |
|---|---|---|
| **le token** | `.glisse-jeton` — le modèle UNIQUE de §2 bis | **87 × 44** (`--glisse-case`), T1, rembourrage `--sp-4` | `.ability-trait-jeton` |
| **son liseré** | 🟢 **vert**, 2 px — la teinte de §2 ter qui dit *« l'ensemble est bon »* | `--positive` · `--creneau-lisere-rempli` | idem |
| **sa place** | **sous les six caracs** — sous les collecteurs en B1 scène 2, sous le tapis au bilan | rangée centrée | `.ability-trait` |
| **son geste** | **il informe, et rien d'autre** | popup `{titre, texte}` | `renderTraitTardif` |

🔴 **IL N'A AUCUNE DESTINATION**, et c'est ce qui le sépare de tous les autres jetons du site : rien
à glisser, aucun créneau qui l'attende. Il ne **demande** pas un choix, il **constate** un acquis —
d'où le vert, dès qu'il paraît. ⛔ Pas de `armerJeton` : ce qu'on n'arme pas ne part pas par accident.
⭐ **LES TROIS GESTES OUVRENT LA MÊME FENÊTRE.** Eric a dicté le clic droit (la moitié souris de la
loi du 16/08). Mais le clic **gauche** n'a rien à sélectionner ici : lui laisser un **clic mort**
serait pire que la divergence — un contrôle qui ne répond pas passe pour cassé.
📏 **Deux dalles, un seul dessin** : le token vit dans `.choix-glisse` (le collecteur, qui impose
`flex: 1 1 auto` + `width: 100 %`) **et** dans la dalle du bilan, qui n'en est pas une. Les deux
cotes se posent donc sur le token lui-même, **APRÈS** le bloc de la famille — mesuré à l'écran deux
fois avant d'être juste : d'abord étiré sur les 351 blg de la dalle *(règle écrite avant, donc
perdante — le piège de 7.8, le même jour)*, puis coupé en deux lignes au bilan *(le rembourrage de
12 de la règle nue)*. **Un objet qui se dessine de deux façons selon la dalle qui le porte est deux
objets**, et §2 bis n'en admet qu'un.
✅ **L'EFFET EST CÂBLÉ — 2026-09-06 au soir, lot 169**, et **PRÉCISÉ PAR ERIC LE 2026-09-07** devant
un relevé qui a montré que la première formulation laissait passer un cas. Ce que le trait donne :
**+2 points libres** au pool de Skills, et **le droit d'acheter UNE Expertise avant que sa classe ne
l'ouvre**. ⛔ **Rien n'est offert** — le joueur peut dépenser ses deux points ailleurs.

> Eric, 2026-09-07, devant le relevé du lot 171 : *« pas possible ça, **c'est 2 max**. Les points de
> Late Bloomer tu les dépenses ailleurs. Plus de limite au-delà du lvl 1 si t'es un Rogue. Les autres
> auront droit à une Expertise grâce à Late Bloomer. »*

| ce qui était écrit le 06/09 | ce que ça dit depuis le 07/09 |
|---|---|
| *« deux expertises max au niveau 1 »* | **deux AU TOTAL, kit lié compris** — la bourse d'espèce ou de classe **compte** dans le plafond, et elle fait **PLANCHER** |
| *« le droit d'acheter l'Expertise au niveau 1 »* | **le droit d'acheter UNE Expertise avant que sa classe ne l'ouvre** — la cote se **lit** sur le grant (`maxExpertise`), ⛔ jamais figée dans le code |
| *(rien n'était dit)* | **au-delà du niveau 1, plus aucune limite** — c'est le Rogue |

🔴 **CE QUE LA PREMIÈRE FORMULATION LAISSAIT PASSER, ET C'EST MESURÉ.** Le 06/09 à 23:52, un Rogue
niveau 1 sortait avec **TROIS** Expertises : la bourse liée et le pool écrivaient le même slug **sans
se voir**. *« Deux max au niveau 1 »* était vrai de ce que le pool comptait, et faux du personnage —
⭐ *une phrase peut être juste sur l'organe qui la lit et fausse sur l'objet qu'elle décrit.*
📌 **Et la réparation ferme trois autres cas sans une règle de plus** : un palier posé par une bourse
est **semé en plancher** avant la dépense, donc le pool ne le redescend plus, ne le repaie plus, et
ne monte qu'au prix de la différence.
✅ **ET C'EST L'ÉTAT DE `main` DEPUIS LE 2026-09-07 À 02:4x** — Eric : *« allez on push et on
déploie »*. Le câblage est fusionné *(`origin/main` `86eb2fc`, 7 gardes vus rouges puis verts)* :
📏 vérifié, `maxExpertise` rend **6 occurrences** dans `src/modules/fh/skill-pool.mjs`.
⚠️ *Ce paragraphe disait « loi d'Eric, pas l'état de main » quand il a été écrit, deux heures plus
tôt. Une note d'attente se périme par le bon côté — encore faut-il aller la relire.*
🔴 **ET LE TOKEN SE MONTRE DÉSORMAIS DEPUIS LE PERSONNAGE, PLUS SEULEMENT DEPUIS LE LOT DE DÉS.**
`ajuste: "haut"` vit dans l'écran et meurt avec la session : un personnage rouvert perdait son token,
et le moteur ne pouvait rien appliquer. Le trait s'écrit au personnage (`fh.skills.trait.late-bloomer`)
au moment où l'étape se **signe**, et s'efface quand elle se **dessigne**. L'écran lit **les deux
sources** — le lot avant `Done`, le personnage après et pour toujours.

### 7.12 🎨 B4 `FREE` — la palette est une RANGÉE, et son budget est fermé *(06/09)*
📍 `cadre-palette-de-free-est-une-rangee` · vivante · 06/09
⚖️ **La palette de `FREE` est une RANGÉE hors de tout défilement, entre l'organe et le collecteur : un vivier dont on ne voit qu'un quart n'est pas un vivier.**
> Eric : *« toujours un grid, prends B1 en exemple »* · *« c'est 4×4 »* · *« la taille des dés idem à
> B1, ça passe en hauteur »* — puis, de lui-même : *« ou pas »*.

**La palette quitte la dalle et prend la place du podium** : rangée `.fs-rangee` fille de l'étape,
entre l'organe et le collecteur, **hors de tout défilement** — la structure de B1 en scène 2, à la
lettre : *dalle · rangée de valeurs · dalle*.
📏 **Ce que ça répare, mesuré** : dans `.ability-flux` (la zone qui défile du gabarit trois bandes)
elle pesait **344 blg pour ~90 montrés** — on ne voyait que `3 · 4 · 5 · 6`, et les douze autres
valeurs vivaient sous un défilement que rien n'annonce. *« Un jeton hors écran est introuvable »*
(§5 bis) : un vivier dont on voit un quart n'est pas un vivier.

**LE BUDGET, RECENSÉ AU BANC LE 06/09 À 15:11** *(lot 168, écran LIVRÉ — chaque poste relevé par
`getBoundingClientRect`, jamais déduit)*. ⚠️ **La carte fait 492**, pas 486 : le 486 était la cote
du 05/09 et personne ne l'avait remesurée — il a fait perdre une heure à deux sièges.

| poste | blg | ce qui le compose |
|---|---|---|
| organe, **titre + aiguilleur** | 79,59 | 4 + titre 21,59 + écart 8 + **flux 38** + 8 |
| palette **4 × 4**, dés à **44** | 188 | **0** + 4 × 44 + 3 × 4 + **0** *(rembourrage retiré)* |
| collecteur **sans son aiguilleur** | 214,78 | 8 + titre 28,80 + 8 + créneaux 94 + 8 + **sortie 60** + 8 |
| écarts de l'étape | 8 | 2 × 4 *(le line bleed ramené à 4 le 06/09)* |
| **total** | **490,37** dans **492** | **il reste 1,63** |

🔵 **L'AIGUILLEUR DE L'ORGANE EST LIVRÉ — 06/09, lot 168, après TROIS sièges.** Sa boîte à **deux
lignes** vaut **38** *(4 + 2 × 15 + 4 ; le plancher de deux lignes est borné à
`.ability-organe[data-methode="free"] .guide-mot`, ⛔ jamais global — les autres écrans gardent les
trois lignes d'Eric du 27/08)*.
🔴 **LE TÉMOIN, ET IL N'Y EN A QU'UN** : `.ability-flux` rend `scrollHeight` **38** pour
`clientHeight` **38**, et l'écran montre **deux lignes entières**, bande bleue comprise *(mesuré et
REGARDÉ à 15:11, 375 × 720)*. ⛔ Les deux sièges précédents ont lu **38/25** puis **38/32** et ont
refusé de livrer une bande coupée : *« un contenu qui ne tient pas, on demande ce qu'il porte EN
TROP, jamais un défilement »*. Le succès de ce lot n'est pas un compte de blg, **c'est l'écran**.
⚖️ **CE QUI LE FINANCE — deux cotes d'Eric, et il a tranché la seconde lui-même** :

| poste | rend | ce que c'est |
|---|---|---|
| rembourrage **HAUT** de `.ability-collecteur > .sortie`, 16 → 8 | +8 | sa cote du 05/09 |
| rembourrage **vertical du tapis** 4/4 → 0 | +8 | ⭐ **un orphelin** — voir ci-dessous |
| place libre de la carte | +23,61 | le reste du recensement |

⭐ **ET LE POSTE DÉCISIF ÉTAIT DÉJÀ ORPHELIN — c'est ce qui l'a rendu gratuit.** Ce rembourrage de 4
était **déduit** du rapport de `tapis-4x4.webp` (1,764) pour qu'un `contain` remplisse la boîte au
pixel ; le `row-gap` 8 → 4 du 06/09 a porté la boîte à **1,872**, et le tapis **ne touchait déjà
plus** les bords (10,7 de vide de chaque côté, mesuré). ⛔ **Une cote qui ne sert plus ce pour quoi
elle a été déduite est un orphelin : la retirer ne casse rien qui vive encore.** La question posée à
Eric en une phrase — *« je retire le rembourrage, ou tu recadres l'image ? »* — a reçu **« A »** :
`tapis-4x4.webp` n'est pas touché, il reste son asset.
⛔ **LES DEUX AUTRES POSTES N'ONT PAS ÉTÉ PRIS**, et c'est à noter pour la prochaine fois : le
**titre du collecteur** (+36,8) dit le geste, la **ligne de bonus réservée** (+31) est la règle
d'Eric du 05/09 — et sa métrique d'attente (`.ability-row-final-attente`, T3/600) existe précisément
pour que la rangée ne remonte pas au premier dépôt.
⭐ **ET LE TEXTE, LUI, EST DÉJÀ COUPÉ** *(la seule des trois décisions qui ne coûte aucune cote)* :
155 signes tombaient en **3 lignes**, sa première phrase seule en fait 86 et **2** — mesuré à 351 blg
de large. C'est la loi d'Eric appliquée à la lettre : *« un contenu qui ne tient pas, on demande ce
qu'il porte EN TROP — jamais un défilement ni une police plus petite »*.

🔴 **Le 4 × 4 est la seule division RÉGULIÈRE de seize** (3 × 5 laisse un orphelin sur une quatrième
rangée, 7 × 3 en laisse deux) — et c'est le croquis d'Eric du 16/08, retrouvé le 06/09.
⛔ **Le dé ne prend PAS la cote de B1 (54)** : `4 × 54 + 24 = 240`, **37 de trop**. Il ne descend pas
non plus sous **44** — un dé de la palette est un **contrôle**, on le prend au doigt, et `--touch`
ne cède jamais (deux essais tués par elle : 36 sur 6 colonnes, 38 sur 8). La colonne vaut 84 et le
dé s'y centre : le vide autour est **ce qui reste quand une cote de contrôle refuse de plier**.
⚠️ **LE PRIX EST DEUX AIGUILLEURS, ET IL FAUT LE DIRE.** Celui de l'organe (53) portait la seule
écriture du produit disant *« take any value, as often as you like »* et *« drag a die off to
discard it »* — ⛔ j'ai failli le retirer en affirmant qu'on le relisait sur la tuile du sélecteur :
**mesuré, c'est faux**, `renderSelecteurMethode` ne rend que les libellés, et le chapitre FH Web ne
décrit que le 3d6 × 10. Il descend donc dans le **`?`**, pas dans le vide. 🔵 **06/09, lot 168 —
et il y est VRAIMENT descendu** : `GUIDES.abilities` ne portait que le recouvrement, pas le rejet.
*« Drag a die off to discard it »* n'était donc lisible **nulle part** ; il y est maintenant, gardé.
Celui du collecteur (52 avec son écart) part **sur FREE seulement** ; son **titre** reste et dit le
geste.
⭐ **ARRAY ne bouge pas** — son vivier tient sur une rangée, il garde ses deux textes. Eric :
*« Array, t'y touches pas, il est bien. »*

🔴 **ET LEUR RETOUR DIT `Cancel`, PAS `Back`** *(Eric, 06/09 : « remplacer le back par un cancel
rouge », « idem dans array », « cancel est toujours rouge »)*. §6 tranche par le sens — *« back
n'annule rien · cancel abandonne ou efface du travail fait »* — et **quitter cette page abandonne
les scores qu'on vient d'y poser** : le mot était faux, et la teinte l'était avec lui *(la teinte se
déduit du mot)*.
⛔ **Aucun verbe déclaré, et c'est voulu** : `abilityClear` jette le LOT, or sur ces deux méthodes
le lot n'est pas tiré — **il EST la méthode** (`lotSansDes`). Le jeter laisserait une page sans
vivier. C'est le retour par défaut de la coquille qui vaut ici, exactement comme la dalle de
scène 1 de B1 : **le mot seul, le geste de la coquille.**

🟢 **ET LE DÉ EST SUR UN CERCLE VERT, À COÛT NUL** *(Eric : « tu peux mettre les dés sur des cercles
verts ? sans perdre davantage de place ? »)*. Le disque est peint **sur le BOUTON du dé**, pas sur
l'îlot qui le porte : le bouton fait déjà 44 × 44 et c'est lui qui donne la hauteur de la rangée —
y peindre un fond n'ajoute pas un pixel *(mesuré : palette 197, carte 473, inchangées)*.
⛔ **Sur l'îlot, ça aurait coûté 59** : le rapport de B1 est *dé = 75 % du disque*, donc 44 / .75 =
58,7 par rangée, soit `4 × 58,7 + 24 = 259` — 59 de trop pour une page qui a 3 de reste. **Le même
dessin à un étage près, et l'un des deux ne rentre pas.**
⭐ Le `.75` du podium est repris tel quel. ⛔ **Les seize disques sont partis le même soir**, quand
le TAPIS est arrivé : un dé sur un cercle sur un tapis fait deux fonds verts empilés. C'est le
partage de B1 — les dés du **tapis** n'ont pas de pastille, les dés du **podium** n'ont pas de tapis.
Le `.75`, lui, reste : il laisse le feutre se voir entre les seize.

🟢 **LE TAPIS** *(`tapis-4x4.webp`, 552 × 313, livré sur commande chiffrée)* : son rembourrage était
**déduit du rapport de l'image**, jamais choisi — image 552/313 = **1,764**, grille nue
362,4/197,5 = 1,835 *(plus large que le tapis)*, avec **4 tout autour** 362,4/205,5 = **1,764**.
🔴 **ET IL EST PARTI LE 06/09 AU SOIR, sur le mot d'Eric** *(« A », c'est-à-dire : retire le
rembourrage plutôt que je recadre l'image)*. La raison est mesurée, pas esthétique : le `row-gap`
8 → 4 du matin même avait porté la boîte à **1,872**, le `contain` ne la remplissait donc **déjà
plus** (10,7 blg de vide de chaque côté), et le rembourrage avait cessé de servir ce pour quoi il
avait été déduit. Il rend **8 blg**, la moitié de l'aiguilleur.
⛔ **Le latéral reste à 4** : `padding` écrivait les quatre côtés — deux longhands (`padding-block`
/ `padding-inline`) remplacent le raccourci, sinon l'axe horizontal serait parti **en silence**,
la faute que `shell.css` a déjà payée quatre fois.
⭐ **Et la sortie « propre » n'a pas été prise sans lui** : un recadrage de l'image au nouveau
rapport reste possible, c'est un **asset**, donc un mot d'Eric — il a choisi l'autre branche.
⚠️ **Le fichier n'était pas où ChatGPT disait l'avoir rangé** — il ne peut pas écrire sur le disque.
Une livraison se **vérifie au disque**, jamais sur la parole de qui l'annonce.

✅ **LA DETTE EST FERMÉE** *(06/09, lot 168)*. ⚠️ Ce paragraphe portait *« la carte fait 486 et elle
est pleine à 486 pile »* et *« un aiguilleur coûte 53 »* : **les deux chiffres étaient périmés** —
la carte fait **492**, et le plancher de 45 (trois lignes) n'était pas une fatalité, il se borne. Un
chiffre périmé dans une note de passation coûte plus cher que pas de note du tout : il a envoyé deux
sièges chercher 53 blg là où il en fallait 38.
⭐ **CE QUI L'A FERMÉE, DANS L'ORDRE** : le texte raccourci *(155 → 86 signes, v588 — la seule
décision qui ne coûte aucune cote, et le geste de rejet descendu dans `GUIDES.abilities`)* · le
plancher ramené à deux lignes **pour ce seul organe** · le rembourrage haut de la `.sortie`
*(16 → 8)* · et le rembourrage du tapis, **l'orphelin**, tranché par Eric.

⭐ Le `.75` du podium : cube **32,6** dans un disque de **43,4**. Ce qui rétrécit est le **dessin** ;
la **cible** reste le bouton de 44 — §1 ter, *un dessin ne dimensionne pas un contrôle*.

### 7.13 🖐️ LES GESTES DE FREE — le collecteur se vide, il ne se duplique pas *(06/09)*
📍 `geste-free-collecteur-se-vide-jamais-ne-duplique` · vivante · 06/09
⚖️ **C'est l'ORIGINE du geste qui décide, pas la nature du vivier : un dé pris à la palette se recopie, un dé pris à un collecteur le VIDE.**
> Eric : *« il faut qu'on puisse recouvrir par un autre dé (c'est câblé) · il faut qu'on puisse
> balancer un dé dans le vide pour évacuer un collecteur (pas fait) · il faut qu'on puisse déplacer
> un dé posé latéralement, vider le collecteur et le poser ailleurs (ici pas fait, on duplique) »*.

| geste | ce qui se passe |
|---|---|
| **recouvrir** *(palette → collecteur plein)* | la valeur remplace — déjà câblé |
| **balancer dans le vide** *(collecteur → nulle part)* | 🆕 la case se **vide** (`onHorsCible`) |
| **déplacer latéralement** *(collecteur → collecteur)* | 🆕 la cible reçoit, **puis la source se vide** — deux écritures, dans cet ordre |

🔴 **CE QUE ÇA CORRIGE, ET LA RAISON D'ALORS ÉTAIT INCOMPLÈTE.** On lisait *« la palette est
inépuisable, donc déplacer RECOPIE »* — **vrai de la palette, faux du collecteur**.
📌 *La règle corrigée n'avait pas d'adresse au corpus : elle vivait dans `abilities-step.mjs`
(« divergence voulue n° 1 ») et dans son test. Il n'y a donc rien à citer en retour — mais il fallait
le dire, sinon le lien manquant passerait pour un oubli.* Prendre une
valeur au magasin ne l'épuise pas ; prendre un dé **posé**, si : le geste dit *« celui-là,
ailleurs »*, et un déplacement qui laisse l'objet derrière lui n'est pas un déplacement. **C'est
l'ORIGINE du geste qui décide, pas la nature du vivier.**
⭐ Le vide était **déjà distingué** dans `glisser.mjs` depuis le 20/08 *(« pour un jeton du VIVIER
c'est un non-geste ; pour le contenu d'un RÉCEPTEUR c'est le geste d'annulation »)* — il attendait
qu'un appelant le lui dise. ⛔ **Seul FREE le dit** : les trois autres ont un podium où le dé
retourne, et **B1 est figé** (§7.3).
⚠️ **Un test de ce geste ne s'écrit pas `glisser(de, null)`** : sans cible, aucun `pointermove`
n'est dispatché, le seuil de 6 px n'est pas franchi et `armerJeton` lit un **TAP**. Le test passait
en mesurant le tap. Le vrai vide fait **bouger** le pointeur et rend `elementFromPoint` vide.

## 6 pré quater. 🔌 L'ÉCRAN DÉCLARE, LA COQUILLE EXÉCUTE *(2026-09-07)*
📍 `socle-l-ecran-declare-la-coquille-execute` · vivante · 07/09
⚖️ **Un écran DÉCLARE son verbe de retour ; c'est la COQUILLE qui l'exécute — un geste que chaque écran doit se rappeler de poser sera oublié par ceux qui l'oublient.**

📏 **CE QUI ÉTAIT ÉCRIT, ET CE QUI L'EST — vérifié dans le code le 07/09.** `renderSortieEtape`
connaissait **deux verbes, nommés en dur** :

```js
/* avant */  const auRetour = decl.sortieVerbe === "abilityClear"     ? … 
                            : decl.sortieVerbe === "abilityBilanCancel" ? … : …
/* après */  const auRetour = decl.sortieVerbe
               ? () => applyDecisionAction({ kind: decl.sortieVerbe }) : …
```

⭐ **UN TROISIÈME ÉCRAN A SUFFI À MONTRER QUE CE N'ÉTAIT PAS UN MÉCANISME.** Tant que seul Abilities
déclarait, l'énumération et la loi rendaient le même résultat — la coïncidence, encore. Skills
déclare `data-sortie-verbe="resetSkills"`, `data-sortie-mot="Reset"`,
`data-sortie-done-mot="Done|Next"` et **ne fabrique aucun bouton** : c'est ce qui a fait tomber
l'énumération.

📌 **C'EST LA MÊME LOI QUE LE `?` ET QUE LES DEUX BORNES**, et elle a déjà été payée trois fois :
le `?` posé par la coquille *(une fois, pour tous)* · les bornes rassemblées dans `poserLesBornes`
*(trois écrivains devenus un)* · le **livre**, fabriqué par SEPT écrans, et **absent de cinq**.
⭐ *Un organe que chaque écran doit se rappeler de poser sera oublié par ceux qui l'oublient* —
ce n'est pas une prédiction, c'est un relevé du 06/09.

⚠️ **CE QUE ÇA N'AUTORISE PAS** : un écran ne déclare pas un COMPORTEMENT, il déclare un **verbe du
moteur**. La coquille l'exécute par `applyDecisionAction` — donc un écran ne peut toujours pas
écrire au document par ce chemin, et `socle-qui-possede-quoi` n'est pas entamé.
✅ **Le câblage est sur `main` depuis le 2026-09-07** — 📏 vérifié sur `origin/main` (`86eb2fc`) :
`kind: decl.sortieVerbe` y rend **une** occurrence, l'énumération a disparu.

---

## 6 pré quinquies. 🚪 UN FAIT DU RECORD N'EST PAS UNE PORTE *(Eric, 2026-09-09)*
📍 `socle-un-plan-requis-n-est-pas-un-item` · vivante · 09/09
⚖️ **Ce qu'un record IMPOSE ne s'ouvre pas et ne se signe pas : un plan requis (`provenance.mode === "required"`) n'est pas un item du parcours — il se montre comme un acquis, sur la ligne « gagné d'office ».**

> Eric, 2026-09-09, devant l'arrière-plan SRD : *« Pour le feat : Savage Attacker (c'est **granted**) pas de bouton. Les compétences idem, les skills sont **granted**, y'a pas de choix. **Idem que pour les lineages.** »*

📏 **CE QUI ÉTAIT À L'ÉCRAN, MESURÉ LE 09/09 (375 × 812, Acolyte)** : trois portes — `Ability boosts`, `Magic Initiate / origin feat`, `Calligrapher's Supplies / Tool` — dont deux s'ouvraient sur une phrase (« Granted by your background — nothing to pick here ») et un `Done` **à signer pour rien**. Le carnet publie ces plans pour ANNONCER ce que `refs` applique déjà (`decisions.mjs`, lot 43 : *« ce plan ne fait plus que l'ANNONCER »*) ; le parcours les lisait comme des décisions.

⭐ **LA RÈGLE VIT DANS `itemsDeLEtape` (`parcours.mjs`), UNE FOIS.** Le lot 187 l'avait vue et REMISE (*« une règle GÉNÉRALE du parcours — elle n'est pas prise ici »*) ; Eric l'a tranchée le lendemain. Elle se lit sur la **donnée** (la provenance publiée par le carnet), jamais sur un nom de chemin ni sur un compte (« `answered === expected` » dirait la même chose d'un choix déjà fait, qui reste une porte).

⚠️ **CE QUE ÇA NE CHANGE PAS** : le `Done` d'un choix FAIT reste une porte (la loi de la porte, §« LA LOI DE LA PORTE ») ; un acquis qui DÉPEND d'un choix reste la ligne `depend:` des lignages (`species.granted`) ; et `refusDuDone` / `etapeAchevee` suivent d'eux-mêmes — un acquis ne manque jamais.

📌 **CE QUI LA TIENT** : `tests/background-step.test.mjs` (l'Acolyte n'a qu'un item, les bonus ; le Soldier en a deux, son outil se choisit) et `tests/parcours.test.mjs` (un plan requis dans une liste synthétique n'est pas un item ; le même plan sans provenance en est un).

---

## 6 pré sexies. 🚪 …SAUF S'IL PORTE, EN DESSOUS, UNE DÉCISION À PRENDRE *(Eric, 2026-09-10)*
📍 `socle-un-requis-qui-porte-une-decision-est-une-porte` · vivante · 10/09
⚖️ **Un plan requis redevient un item du parcours quand le carnet publie, SOUS lui, au moins un plan qui n'est pas requis. Ce qui est imposé se montre ; ce qu'il reste à régler DEDANS s'ouvre.**

> Eric, 2026-09-10, sur l'Acolyte du fil SRD : *« B3 : tool ou skills — s'il y a un choix, un bouton, puis tokens et collecteurs, Back / Done (ici le background Acolyte est incomplet) ; sinon c'est du granted. Alors attention : **Magic Initiate nécessite un bouton, ça doit être configuré — exactement le même chemin que dans FH, tu as juste à recopier.** »*

📏 **CE QUI ÉTAIT À L'ÉCRAN** : l'arrière-plan IMPOSE son don (`feat_id`), donc `background.originFeat[0]` sort `required`, donc §6 pré quinquies le range en acquis — et c'est juste tant que le don n'a **rien** à régler. *Magic Initiate* en a : deux tours mineurs et un sort de niveau 1, que le carnet publie **sous** lui. Personne n'ouvrait la porte qui y mène, et le joueur ne pouvait pas choisir ses sorts.

⭐ **LE CRITÈRE RESTE LA DONNÉE, ET IL NE CONTREDIT PAS §6 pré quinquies** — qui refuse un critère de **compte** (« `answered === expected` dirait la même chose d'un choix déjà fait »). Celui-ci ne compte rien : il lit la **provenance des plans du dessous**. ⛔ Un sous-plan lui-même `required` ne compte pas — la liste de sorts d'un « Magic Initiate (Cleric) » est fixée par l'arrière-plan, elle n'ouvre aucune porte. Un outil imposé, un don sans branches : rien en dessous, donc pas de porte.

⚠️ **ET LA PORTE PREND LE RÉSUMÉ AVEC ELLE** : le don qui s'ouvre quitte la ligne « gagné d'office » — *soit la porte, soit le résumé, jamais les deux* (Eric, 26/08). Le don qui ne règle rien y reste, avec sa fenêtre au tap.

📌 **CE QUI LA TIENT** : `porteUneDecisionOuverte` (`parcours.mjs`), une fois, lue aussi par `background-step` pour son résumé ; `tests/lot194-don-accorde.test.mjs` (la vraie déclaration montée par une couche de fixture) et `tests/fil-srd-ecrans.test.mjs` (le carnet fabriqué, et son inverse).

---

## 6 pré septies. 🟩 UN COMPTE QUI N'A PAS COMMENCÉ N'EST PAS UN COMPTE FAUX *(Eric, 2026-09-10)*
📍 `socle-rien-de-pose-n-est-pas-une-faute` · vivante · 10/09
⚖️ **Une porte non faite est NEUTRE, avec son compte ; elle ne rougit qu'après un geste commencé et incomplet. Et le `Done` d'un item ne le signe pas tant que son plan n'a pas répondu.**

> Eric, 2026-09-10, sur le fil SRD : *« B1 : ability boost commence en rouge, et pas de bouton Back / Done. »*

📏 **DEUX FAITS MESURÉS LE 10/09, ET ILS SE TIENNENT PAR LA MAIN.** ① `background.boost` posait `background.boost-total-mismatch` **dès zéro candidat** : la porte s'ouvrait accusée, le `Done` désarmé et la bande d'aiguilleur remplacée par « 0 points spent, 3 expected. » — avant le moindre geste. Les autres budgets ne font pas ça (`species.skillBudget` à 0 sur 2 ne porte aucun verrou). ② Ce verrou-là **désarmait le `Done` par accident** : le retirer seul aurait échangé un faux rouge contre un faux *« This step is settled »* — mesuré, un item vide pouvait déjà se signer **partout ailleurs** (`Species skill` sans compétence choisie).

⭐ **LE COMPTE FAIT LE TRAVAIL QUE LE VERROU FAISAIT PAR HASARD.** `answered / expected` retient la porte, le `Done` et l'étape ; un verrou par-dessus ne rendait pas la règle plus stricte, il rendait « pas encore fait » indiscernable de « mal fait ». ⛔ **Aucun garde ne se desserre** : un seul point posé sur trois rougit toujours, le plafond par carac aussi, et `Cancel` reste armé — *« ainsi que la possibilité de revenir en arrière »* (Eric, 29/08).

📌 **CE QUI LA TIENT** : `tests/inheritance-step.test.mjs` (neutre à zéro / rouge à 2 sur 3) et `tests/fil-srd-ecrans.test.mjs` (la porte des caracs, +2/+1 et +1/+1/+1 acceptés, +3 refusé ; le `Done` d'un item désarmé tant que le compte n'y est pas).

---

## 6 pré octies. 🌱 LES CHAPITRES TRAVAILLENT SUR LES CHOIX ; UN SEUL CHAPITRE DÉDUIT : SHEET *(Eric, 2026-09-10)*
📍 `socle-un-seul-chapitre-deduit` · vivante · 10/09
⚖️ **Un personnage naît au niveau 1, dans `composer`, un seul écrivain. Le cran DÉCLARE ce que son écran lit (`lit`, etapes.mjs) et la coquille tend les faits — mais UN SEUL cran déclare : `review` (Sheet), le chapitre qui déduit. Tout autre chapitre travaille sur les choix : il VIT sans fiche et sans classe, et là où un chiffre déduit devrait s'afficher, il NOMME ce qui manque et où aller — jamais un mensonge, jamais un écran mort, jamais une valeur tronquée. Sheet est le seul endroit où « il manque X, va sur Y » ferme l'écran.**

> Eric, 2026-09-10, sur v621 : *« Fais en sorte que ça soit **à zéro à la création** d'un nouveau. Fais ce qu'il faut pour que le **Next mène sur le chapitre suivant de manière fluide**. Il manque encore **Équipement**. **Réécris plutôt que faire des pirouettes.** »*
> Puis, devant le premier passage du lot 198 — qui faisait déclarer trois crans (Skills lisait la fiche, Equipment la classe, Sheet la fiche) et tuait les deux premiers sans elles : *« Ce que tu crées dans Sheet est un **précurseur de la fiche**, non ? Pourquoi ne pas **dériver tous ces éléments dans le bilan de Sheet** ? »* — formulé par l'archi : **les chapitres travaillent sur les choix ; un seul chapitre déduit : Sheet.**

📏 **CE QUI ÉTAIT MESURÉ SUR v621 (pile SRD, personnage neuf, au navigateur)** : Identity → Species → Background → Class vivants, puis **Abilities, Equipment et Sheet morts pour toujours** — *« it cannot be derived yet »*. Trois faits en chaîne : ① `level` n'était écrit par AUCUN écran (seul le générateur d'exemple le posait ; la page partait autrefois d'un exemple complet, et c'est ce qui cachait le trou) ; ② `derive` exige `level`, `class` et les six `abilities.*` — `species` n'est pas exigé ; ③ la coquille tuait **six écrans par nom** (`ECRANS_QUI_LISENT_LA_FICHE`) dès que la dérivation refusait — **dont Abilities, l'écran qui POSE les scores**. Tué parce que les scores manquaient ; les scores manquaient parce qu'il était tué. La liste était fausse deux fois de plus : Destiny ne lit pas `resolved`, et Inheritance mourait sur tout personnage neuf de la pile Fate's Hand, deux crans AVANT Class.

📏 **CE QUE LE PREMIER PASSAGE AVAIT MESURÉ, ET QUI RESTE VRAI** : le pool de Skills est une stat DÉRIVÉE (`fh:skill-points`) — sans fiche, l'écran disait *« No free pool — the SRD rules apply »* sur une pile qui PORTE le pool, un mensonge ; l'or de départ d'Equipment vient du record de classe (`orDuDepart`) — sans classe, l'aiguilleur offrait les 50 PO de l'Inheritance seuls, une **bourse tronquée** qu'une classe choisie ensuite n'aurait jamais complétée. La mesure était juste ; la conclusion (`lit` sur Skills et Equipment, donc l'écran mort) était fausse.

⭐ **QUATRE RÉPONSES, UNE SEULE FORME — celle du lot 186 : le cran déclare, la coquille lit.**
· **A. Le niveau de naissance est un fait du produit**, pas un choix du joueur ni un défaut deviné (D3 refuse d'inventer ce qui appartient au joueur : sa langue, ses unités, son nom — pas ceci). Il s'écrit là où le document naît, `composer` (`CHOIX_DE_NAISSANCE`, writers.mjs), et l'exemple (`exempleFhEn`) passe par lui : **un seul écrivain** de `{ path: "level" }`.
· **B. `lit`** à côté d'`exige` (etapes.mjs) — et **un seul déclarant, `review`**. `LECTURES` ne porte qu'une lecture, `fiche` ; `manqueDuCran(step, faits)` rend la lecture non satisfaite, une lecture inconnue **jette**. La coquille tend UN fait (`derivable`, lu sur le refus de `rebuild`) et ne porte aucune liste d'écrans par nom.
· **C. `motDeLEcranMort` lit les choix**, jamais le message du moteur (français, machine) : classe et scores manquants ensemble → les deux crans, en un seul voyage ; classe seule → le mot du 20/08, à la lettre ; scores seuls → les clefs manquantes et le cran Abilities ; niveau absent (un fichier d'avant le lot) → sa sortie, Build a character. Les noms de cran se lisent sur la ceinture (`etapeParId`), jamais écrits en dur. `MOT_SANS_RAISON` survit pour ce que le document ne sait pas nommer.
· **D. Un chapitre qui travaille sur les choix NOMME au lieu de mourir.** Skills sans fiche : le catalogue des compétences se montre (les records de la pile, sans bonus ni palier), et là où le pool devrait s'afficher, la place porte **le mot de l'écran mort** — `motDuManque` (ecran-mort.mjs) en est le **seul écrivain**, Skills l'importe et ne recopie aucune phrase ; dès que la fiche existe, le pool s'affiche et le mot disparaît. Equipment sans classe : le dressing et la boutique se montrent, la question kit/or ne se pose pas (elle n'a pas d'objet), `orDuDepart` ne rend **aucun total** (⛔ pas l'Inheritance seule), et **« My gold » dit « Choose a class on Class to get your starting gold »** (`motDeLaBourse`, un seul écrivain pour B1 et B2). **La bourse est complète, ou nommée — jamais tronquée.**

⭐ **LES CHIFFRES DÉDUITS MONTRÉS EN CHEMIN SONT UN CONFORT, JAMAIS UNE PORTE** : la colonne finale d'Abilities, le poids portable d'Equipment, le pool de Skills — présents quand la fiche existe, absents sinon (« — », jamais un zéro inventé), et aucun écran ne meurt de leur absence.

⚠️ **CE QUE ÇA N'AUTORISE PAS** : un second `lit` dans `STEPS` (un chapitre qui meurt de ce qu'il ne déduit pas — c'est le garde B1, vu rouge en remettant `lit` sur Skills) ; un `if (step.id === "abilities")` de plus dans la coquille (la liste par nom, revenue par une autre porte) ; une phrase de manque recopiée dans un écran (deux écrivains, identiques aujourd'hui, divergents demain) ; un total d'or sans la classe (tronqué n'est ni complet ni nommé) ; un défaut deviné pour un choix du joueur (le niveau est le SEUL fait de naissance) ; une réparation silencieuse d'un fichier sans niveau (on nomme, le joueur décide).

⏳ **À ERIC** : les mots de C et D sont des brouillons (comme tous ceux d'`ecran-mort.mjs`) — en particulier « …and this screen comes back with them », que Skills affiche tel quel à la place du pool ; Sheet sans fiche rend aujourd'hui un tableau d'avancement honnête (*« Abilities · 0 of 6 scores »*) — le montrer à la place du refus est son mot ; le cadre « Purse » du dressing (B3, croquis) montre « — » sans classe, le mot vit à « My gold » (B1/B2) — l'y porter aussi est son mot ; et un personnage gardé AVANT ce lot n'a pas de niveau : il lit `MOT_SANS_NIVEAU`, et le magasin (hors lot) dira s'il se répare.

📌 **CE QUI LA TIENT** : `tests/naitre-derivable.test.mjs` — A (le composeur fait naître, l'exemple passe par lui, le témoin sans niveau refuse comme v621), B1 (un seul déclarant, sur la donnée `STEPS.filter(lit)`), B5 (le garde central : sur un personnage neuf sans classe ni scores, aucun cran de la ceinture n'est mort dans les deux piles, sauf Sheet qui nomme), B6 (Skills sans fiche nomme avec le mot importé ; avec fiche, le pool), B7 (Equipment sans classe vit, My gold nomme, aucun « Take the » ; avec classe, l'or), C (jamais la phrase muette quand un choix exigé manque, sur les 128 sous-ensembles), E2 (complète ou nommée), D1 (la coquille sans liste par nom, un seul fait — garde sur la forme, et il le dit). Chacun vu ROUGE sous sa mutation le 10/09.

---

### 7.14 🆓 `FREE` EST 100 % LIBRE — aucune condition sur le choix des caracs *(Eric, 2026-09-06)*
📍 `budget-free-est-cent-pour-cent-libre` · vivante · 06/09
⚖️ **La méthode `FREE` n'oppose AUCUNE condition au choix des caractéristiques — ni total, ni budget, ni plafond, ni plancher.**

> Eric, 2026-09-06 : *« **free c'est 100 % de liberté sur le choix des caracs** »*.

📏 **LE CODE Y ÉTAIT DÉJÀ CONFORME LE JOUR OÙ LA RÈGLE A ÉTÉ DITE**, mesuré dans le moteur par
le siège Archi : un document `18/18/18/18/18/18` rend **zéro** refus sur les caracs — exactement
comme le tableau standard — et `3 × 6` aussi. ⭐ *Une règle qui décrit ce que le code fait déjà
n'est pas inutile : elle empêche qu'on le « répare ».*

⚠️ **LA BORNE QUI RESTE, ET IL NE FAUT PAS LA CONFONDRE AVEC UNE CONDITION** : un score vaut
**3 à 18**. C'est le **domaine d'un score**, pas une contrainte sur le choix — la liberté porte
sur **quelles valeurs on met où, et combien de fois**. ⛔ C'est exactement la phrase qu'un
successeur lira de travers si personne ne l'écrit.
📌 **ET CETTE BORNE N'A PAS D'ADRESSE AU CORPUS** — vérifié le 06/09 : elle vit dans le moteur
(`CREATION_SCORE_MAX`) et dans une parole d'Eric du 15/08 que ce fichier ne porte pas. ⛔ Elle
n'en reçoit pas une ici : on n'adresse pas une règle qu'on n'a pas mesurée soi-même, sous peine
de graver un chiffre déduit à la place d'un chiffre donné. ⏳ À poser le jour où elle est lue
dans le moteur.

⭐ **UNE CONSÉQUENCE QUI FERME UNE QUESTION, ET ELLE EST SIGNALÉE COMME UNE LECTURE.** `POINT BUY`
n'est pas offerte, et son barème n'existe nulle part au dépôt. Un budget de points sur `FREE`
aurait été un Point Buy déguisé ; Eric ayant tranché la liberté totale, **le barème absent cesse
d'être un manque**. ⚠️ *Eric n'a pas dit cela en toutes lettres — c'est la lecture du siège
Archi, notée comme telle et non comme sa parole.*

📌 **CE QUI LA TIENT** : `tests/free-cent-pour-cent.test.mjs`, vu **rouge des deux côtés** avant
d'être cru vert, avec un seul levier — `CREATION_SCORE_MAX` à 17 fait échouer le cas `18 × 6`
*(la liberté rétrécit)*, à 20 fait échouer le témoin contraire *(le moteur cesse de juger, et le
fichier serait vert pour rien)*.

---

## 7 bis. 👻 LE FANTÔME A LA BOÎTE DE CE QU'IL COPIE — **quoi qu'il copie** *(lot 205, 2026-09-13)*
📍 `geste-fantome-a-la-boite-de-ce-qu-il-copie` · vivante · 13/09
⚖️ **Un fantôme rend la largeur ET la hauteur de la boîte SAISIE, pour tout ce qui peut être saisi — pas pour une classe. Il est `position: fixed`, donc il n'a pas de cellule : aucune déclaration qui suppose une rangée ne s'adresse à lui.**

> Eric, 2026-09-13 : *« Pour les abilities boost le retour de token sur son origine, le fantôme n'est plus carré, par contre tout est bleu durant le process. »*

📏 **MESURÉ AU BANC** (site en ligne v628, Chromium 512 × 900 **avec WebGL**, « Ability boosts », les DEUX piles, verdict identique) :

| geste | fantôme peint | `width` calculée | classe du clone |
|---|---|---|---|
| **aller** vivier → collecteur | 67,13 × 65,53 ✅ | `49,16px` | `glisse-jeton glisse-fantome` |
| **retour** collecteur → vivier | **512,00** × 65,53 ⛔ | `375px` | `glisse-creneau glisse-fantome` |
| collecteur → collecteur | **512,00** × 65,53 ⛔ | `375px` | `glisse-creneau glisse-fantome` |
| lâché dans le vide | **512,00** × 65,53 ⛔ | `375px` | `glisse-creneau glisse-fantome` |

🔴 **LA CAUSE N'EST PAS UNE CLASSE OUBLIÉE, C'EST UNE PHRASE MAL ADRESSÉE.** Un collecteur REMPLI est lui-même armé — c'est ainsi qu'on ressort un jeton (§ le geste d'annulation d'Eric, 19/08) — donc le clone du retour est un `.glisse-creneau`. La cascade, LUE au navigateur : `.choix-glisse .glisse-creneau` (0,2,0) porte `width: 100%` et bat `.glisse-fantome` (0,1,0). Or `width: 100%` veut dire *« la largeur de ta CELLULE »* : un `position: fixed` n'en a pas, son bloc conteneur est la **fenêtre** — 375 blg, la largeur sacrée, 512 px peints. ⛔ Et le jeton n'en réchappait pas par mérite : `.glisse-jeton.glisse-fantome` pèse (0,2,0) lui aussi, il gagnait par l'**ordre des lignes**.

⭐ **LA RÉPARATION RETIRE AU LIEU D'AJOUTER** : on ne monte pas la voix du fantôme sur un second sélecteur (`.glisse-creneau.glisse-fantome` aurait fermé CE cas et laissé dehors le troisième organe armé de demain) — **on cesse de dire « remplis ta cellule » à ce qui n'a pas de cellule** (`:not(.glisse-fantome)` sur la recette). La cote reste déclarée **une fois**, chez le fantôme : `--case-vive` (§ lot 204). 📌 L'HABIT, lui, reste partagé (hauteur plancher, rayon, `box-sizing`) — un fantôme doit être IDENTIQUE, l'exclure de l'habit l'aurait rendu moins identique.

📏 **APRÈS, MESURÉ AU MÊME BANC** (quatre gestes × deux piles, captures regardées) : écart de largeur **0,00 px** partout sauf **−0,01** (SRD, collecteur → collecteur), écart de hauteur **0,00 px**. Et la boîte peinte de **chaque** case du dépôt (quatre écrans × trois largeurs) est **identique** avant et après.

📌 **CE QUI LA TIENT** : `tests/fantome-hors-du-flux.test.mjs` (il RÉSOUT la cascade pour chaque chose que le geste découvre saisissable, au lieu de chercher un sélecteur qui lui plaît) et `tests/fantome-a-la-cote-de-sa-case.test.mjs`.

---

## 7 ter. 🛡️ UN DÉCOR NE SE LAISSE PAS SAISIR, UNE SURFACE DE GESTE NE SE SÉLECTIONNE PAS *(lot 205, 2026-09-13)*
📍 `geste-decor-inerte-et-surface-armee-non-selectionnable` · vivante · 13/09
⚖️ **Une image de décor naît NON DÉPLAÇABLE — la propriété et l'attribut — et toute surface qu'`armerJeton` arme déclare son armement, d'où la feuille déduit qu'elle ne se sélectionne pas. Aucune de ces deux règles ne s'écrit par famille d'organe.**

⚠️ **CE N'EST PAS UNE RÉPARATION PROUVÉE DE LA PANNE D'ERIC** (*« Abilities ne marche toujours pas »*, 13/09) : elle ne se reproduit pas au banc. Ce sont **deux portes restées ouvertes** après le lot 203, fautives en elles-mêmes.

📏 **PORTE ① — MESURÉ APRÈS LE 203** (512 × 900, WebGL, Abilities → 4D6 → Flash) : les **douze** `img.fh-cd-static-snap` portaient `pointer-events: none` ✅ **et `draggable: true`** ⛔. Le 203 empêche le navigateur de VISER l'image ; il ne lui retire pas la propriété d'être arrachée. ⭐ La loi vit une fois (`decorInerte`, dice3d.mjs) et s'applique où le décor NAÎT. ⚠️ Il en faut **deux gestes** : la propriété est ce que le navigateur consulte, l'attribut est ce qu'un `cloneNode`, un `outerHTML` et un garde peuvent lire. ⏳ Et l'écart est à **porter en amont** (`fh-phb`, `fh-static-dice.js`) puis à recopier.

📏 **PORTE ② — MESURÉ EN DÉCOUVRANT LES SURFACES ARMÉES PAR LE GESTE** (un `pointerdown` + `pointermove` sur chaque élément peint, on garde ceux qui répondent) : `identity` 12 × `.glisse-jeton` · `boosts SRD` 2 × `.glisse-jeton` · `boosts FH` 1 × `.glisse-creneau` rempli · `4D6` 6 × `.fs-de` — **toutes déjà à `user-select: none`**. ⛔ Et c'est ce qui rendait la situation trompeuse : la règle tenait par **quatre déclarations recopiées à la main**, une par famille d'organe, qui se trouvaient couvrir les quatre appels d'`armerJeton`. Une coïncidence entretenue à la main — le **cinquième** organe armé n'aurait rien reçu, et rien ne l'aurait dit. ⭐⭐ `armerJeton` pose donc sa marque (`data-arme`), la feuille lit la marque, et il n'y a plus qu'**un écrivain**. ⚠️ Le fantôme ne la porte pas : la copie n'est pas armée, elle EST le glissé (§ lot 203, étendu ici).

✅ **RÉPONDU AU LOT 206** : `touch-action: none` a rejoint la marque, après la mesure sur un vrai iPad que ce paragraphe réclamait. ⚠️ Et la marque a changé de nom — `data-glissable`, pas `data-arme` : voir 7 quater.

## 7 quater. 🔴 LE DOIGT N'EST PAS UN POINTEUR LENT — LA CAPTURE IMPLICITE *(lot 206, 2026-09-14)*
📍 `geste-capture-perdue-d-un-enfant` · vivante · 14/09
⚖️ **Un `lostpointercapture` dit de QUI la capture est perdue : celui d'un ENFANT du jeton n'est pas le nôtre et ne conclut rien. Et `touch-action` ne se lit pas sur le seul élément touché — le navigateur INTERSECTE la chaîne, de l'élément d'où le doigt part jusqu'au conteneur qui défile.**

⚖️ **ERIC, 14/09** : *« ça marche sur mac mais pas sur ipad dans chrome »*, puis, précisément : *« LE DÉ NE VEUT PAS QUITTER SON EMPLACEMENT DE DÉPART. Et ça marche parfaitement sur Mac. »*

🔴 **L'ANGLE MORT, ET IL EXPLIQUE DEUX JOURS DE CHASSE** : les bancs de ces lots jouaient tous à la **souris**. ⛔ Un pointeur de souris n'a **pas de capture implicite** ; un pointeur **tactile** en a une, et elle va à la **cible du `pointerdown`** — c'est-à-dire à l'**enfant** sous le doigt (`.porte-de`), pas au jeton armé. Quand `bouge` prend la capture explicite sur le jeton au 6ᵉ pixel, le navigateur la retire à l'enfant et lui envoie `lostpointercapture` — **qui bulle**. Il arrivait sur le jeton, où `perdu` le lisait comme « mon jeton a disparu » et clôturait le geste **à l'instant où il commençait**. ⛔ **Ce n'est pas un défaut WebKit** : mesuré identique en Chromium tactile. Le clivage est **doigt / pointeur**, pas WebKit / Chromium.

📏 **MESURÉ SUR UN VRAI iPad** (iPad Pro 11 pouces, iOS 26.5, Safari, vrais événements tactiles, sonde d'événements dans la page), pendant le glisser qui échouait : `touchmove=9 · pointermove=10 · pointercancel=0 · scroll=0 · leve=1 · repose=1` · `CAPTURE: G→SPAN.porte-de  L→SPAN.porte-de  G→BUTTON.ability-de-gar`. ⭐ **Tout arrivait** — trois hypothèses éliminées d'un coup : les `pointerevents` ne manquent pas, rien n'est annulé, rien ne défile. Le dé se levait (`leve=1`) et se **reposait** aussitôt (`repose=1`).

📏 **ET `touch-action` N'Y ÉTAIT POUR RIEN** : relevé de la chaîne depuis le point du doigt, en v629 comme en **v626** (avant le lot 203) — `SPAN.porte-de{auto}` ◂ `BUTTON.fs-de{none}`. L'élément de départ a changé au 203, **l'intersection non**. ⛔ Le corpus disait *« `touch-action` ne gouverne QUE l'élément d'où le doigt PART »* — **inexact**, et cette inexactitude a coûté la chasse : il gouverne la **chaîne**.

⭐ **LA PORTE SE FONDE SUR LA DONNÉE** — la cible que le message porte —, jamais sur la classe de l'enfant. ⚠️ Et elle ne desserre pas le lot 199 : le message qui vise **le jeton** conclut toujours, sinon un jeton disparu en plein geste rouvrirait l'écran mort. Un `target` absent vaut « le nôtre », même argument que `dUnAutre`.

## 7 quinquies. ⚖️ DEUX SENS POUR UN ATTRIBUT EST UNE DETTE *(lot 206, 2026-09-14)*
📍 `ecriture-attribut-un-seul-sens` · vivante · 14/09
⚖️ **Un attribut a UN sens dans toute la maison. Un sélecteur NU (`[data-x]`) attrape tout ce qui le porte, quel que soit le sens voulu — c'est donc le nouveau venu qui déménage, pas l'ancien.**

📏 **MESURÉ** : `data-arme` disait déjà *« ce `Cancel` a quelque chose à abandonner »* (`shell.mjs`, Eric 06/09 : *« le cancel est rouge dès le début des tirages »* ; peint par `shell.css:959`). Le lot 205 l'a repris pour *« cette surface porte un glisser »*, avec un sélecteur **nu**. ⛔ Inoffensif tant qu'il ne portait que `user-select` ; il a cessé de l'être quand `touch-action: none` l'a rejoint — **un doigt posé sur `Cancel` n'aurait plus pu faire défiler la page**. ⭐ La marque du geste s'appelle donc `data-glissable`, qui dit ce que l'organe **EST** et fait la paire avec `data-glisse` (*« il est EN TRAIN de l'être »*).

📌 **CE QUI LA TIENT** : `tests/decor-ne-se-laisse-pas-saisir.test.mjs` (neuf cas, chacun vu rouge par mutation) et `tests/de-ne-prend-pas-le-pointeur.test.mjs` (lot 203, intact).

## 7 sexies. ⚖️ UN AIGUILLEUR QUI EXIGE UNE RÉPONSE EST UN **POPUP À QCM**, ET IL PORTE UN `Done` *(lot 245, 2026-09-21)*
📍 `popup-qui-exige-une-reponse-est-un-qcm` · vivante · 21/09
⚖️ **§2 dit d'un popup qu'il « parle, on ne l'appuie pas ». C'est vrai du popup qui PRÉVIENT. Celui qui EXIGE une réponse est un autre organe : il pose ses questions en QCM, une section par source, et il se ferme par un `Done` unique.**

🔴 **CETTE QUESTION ÉTAIT OUVERTE DEPUIS LE 26/08, ET ELLE VIVAIT DANS UN COMMENTAIRE** — `equipment-step.mjs` : *« §7 range l'aiguilleur parmi les POPUPS, et §2 dit qu'un popup parle, on ne l'appuie pas. Celui-ci porte DEUX boutons. Un aiguilleur qui exige une réponse n'est donc pas la même forme qu'un aiguilleur qui prévient en passant. **À Eric de dire si ce sont deux organes ou un seul.** »* ⛔ **Une règle écrite dans un commentaire n'existe pas** : personne ne l'a lue en vingt-six jours, et la question serait revenue au prochain popup à boutons.

⚖️ **ERIC TRANCHE, 21/09**, en dictant la maquette : *« Il faut un popup avec un QCM. Propre et bien présenté. 1 — Fighter : your class gives you bla-bla. **Choose** … 2 — Background : your background gives you blabla. **Choose** … Bouton **Done** — l'or et l'équipement vont dans Gear par défaut. »*

| | l'aiguilleur qui **prévient** | le popup qui **exige** |
|---|---|---|
| sa voix | *« attention, voilà où tu vas »* | *« réponds, et je pose »* |
| on peut l'ignorer | oui — c'est un guide | ⛔ non : sans réponse, l'étape n'a pas de point de départ |
| ses boutons | aucun | les options, **plus un `Done`** |
| son état | rien | il **ÉCRIT au document**, une seule fois |

⭐ **QUATRE RÈGLES QUE CE POPUP PORTE, ET AUCUNE N'EST COSMÉTIQUE :**
· **N options, jamais deux.** Le rendu COMPTE les options de la donnée. 📏 Le Fighter en a **trois** (*« Choose A, B, or C »*) ; un rendu câblé sur deux l'ampute en silence.
· **Une source qui n'offre qu'une option ne pose pas de question.** ⚖️ Eric : *« idem en plus simple pour Fate's Hand »*. En pile FH l'origine porte `"50 GP"`, une chaîne nue : la section devient une **CONSTATATION**. ⛔ Un QCM à une seule réponse ment au joueur. ⚠️ Mais *« plus simple »* n'est pas *« muet »* — le joueur doit savoir d'où vient son or, sinon le récapitulatif porte un montant sans provenance.
· **Le récapitulatif EST le butin, pas une description du butin.** L'écran et le geste appellent **la même fonction**. C'est la propriété payée par le lot 182 (*« un écran qui annonce un montant et en pose un autre »*), étendue des pièces aux objets.
· **Rien ne s'écrit avant `Done`.** Les réponses vivent dans la fermeture de l'écran ; un clic d'option repeint, il n'écrit pas. ⛔ Un choix à moitié posé serait un kit à moitié posé, et le popup ne se reposerait jamais.

🔴 **ET LE DÉFAUT QU'IL RÉPARE EST CELUI D'UN ÉCRAN QUI MENTAIT.** Le popup disait *« your class kit is yours, **already listed** »* ; 📏 mesuré dans `shell.mjs` le 21/09, la branche `kit` écrivait `depart: "kit"` **et rien d'autre** — aucune ligne `gear[N]`. ⭐ **Ce n'était pas un popup laid, c'était un popup qui décrivait un monde que le code ne fabriquait pas.** C'est ça, *« pas clair »*.

⚖️ **CHAQUE SOURCE OFFRE SON PAQUET OU SON OR, ET LA QUESTION SE POSE SOURCE PAR SOURCE.** C22 (*« les 50 PO REMPLACENT le kit »*, 08/09) n'est pas défaite, elle est élargie : le geste d'hier était global (`kit` OU `purse`, toutes sources à la fois), la maquette du 21/09 pose une question par source. ⭐ **Le panachage — le paquet de la classe AVEC l'or de l'origine — devient donc une réponse valide**, et c'est un changement de règle assumé par Eric (*« je te demande de l'améliorer »*), pas un effet de bord.

⛔ **LE DÉCOUPAGE DE LA PHRASE SRD EST UN AFFICHAGE, JAMAIS UNE SECONDE ÉCRITURE.** Le choix d'architecte du 13/08 interdisait de structurer la phrase *« parce que ça créerait une DEUXIÈME ÉCRITURE de la même règle »* ; Eric l'a levé **pour l'écran**, pas pour la donnée. ⭐ **Aucun nom d'objet du SRD n'est retapé dans le code** — un garde le tient, et il lit les noms DANS LA COUCHE. Et **ce qui ne se rapproche d'aucun record est NOMMÉ au joueur** avec le texte du livre, jamais deviné ni avalé. 📏 Mesuré sur les seize phrases des couches, **avant et après les trois décisions d'Eric du 21/09** — le total ne bouge pas (93 morceaux), leur sort si :

| | rapprochés | refusés | absence voulue | renvoi à Skills |
|---|---|---|---|---|
| lot 245 (21/09, matin) | 86 | **7** | — | — |
| lot 246 (21/09, soir) | **90** | **0** | 1 | 2 |

⛔ Les rapprocher **à la main** resterait le second écrivain : *« Arrows → Ammunition »* est une règle de jeu, elle appartient à **la couche** (`srfh-mecaniques-en`), et l'écran ne fait que lire un champ déclaré. Voir la section suivante.

⚠️ **UN `gear[]` N'ADMET PAS DEUX LIGNES DU MÊME RECORD**, et ce n'est pas une préférence d'écran : `rebuild` JETTE — *« deux entrées portent l'id "dagger" — l'ancre d'override les désigne les deux, et aucune ne gagne par défaut »*. ⭐ Le kit **FUSIONNE** donc avec ce que le joueur possède déjà, et la fusion vit dans le LECTEUR, pas dans le geste : deux arithmétiques de la même quantité divergent.

📏 **CE QUE LA CARTE MESURE** (navigateur, 512 × 764, `prefers-color-scheme: light`) : **549 blg en pile Fate's Hand** (une question, une constatation) contre **681 en pile SRD** (deux questions) — pour la **même classe**. ⭐ C'est le témoin de la lecture de pile : deux rendus identiques voudraient dire que la pile n'est pas lue. ⚠️ **Et 681 est exactement la hauteur disponible** : la carte SRD tient au blg près. Une ligne de plus déborde. C'est pour ça que le titre d'une section porte sa consigne (*« 1 Fighter — Choose: »*) au lieu d'avoir une ligne à lui — ⛔ et pas un défilement interne : la loi est de demander ce que le contenu porte **EN TROP**.

📌 **CE QUI LA TIENT** : `tests/equipment-step.test.mjs` (le découpage qui refuse · les deux piles · aucun nom retapé · `Done` pose vraiment · le panachage · la seconde lecture en sens inverse contre `orDuDepart`) et le garde d'octets sur `shell.mjs`. Six mutations jouées, six rouges.


---

## 6 nonies. ⚖️ **LE DÉPART, SES TROIS SORTS, ET LA COTE DU BOUTON DE CHOIX** *(Eric, 2026-09-21 — lot 246)*
📍 `equipement-morceau-de-phrase-a-trois-sorts` · vivante · 21/09

🔴 **UN MORCEAU DE PHRASE A TROIS SORTS, PAS DEUX**, et les confondre est la faute que ce lot répare. Un morceau qui ne rencontre aucun record peut être :

| sort | ce que l'écran fait | ce que le joueur lit |
|---|---|---|
| **rapproché** | une ligne dans `gear[]` | l'objet, dans le récapitulatif |
| **refusé** | rien | *« … has no entry in this stack — not added. Pick it yourself in Wares. »* |
| **absence voulue** | rien | **rien** — ⛔ et c'est le point |
| **renvoi à un autre écran** | dépend de ce qui y a été choisi | un objet, une question, ou un fait |

⭐ **UNE ABSENCE VOULUE N'EST PAS UN REFUS.** ⚖️ Eric : *« Pas d'item spellbook, il sera matérialisé par la **section sorts**. Rien à ajouter ici. »* Un refus **envoie le joueur chercher l'objet dans Wares** ; une absence délibérée n'a rien à aller chercher. ⛔ Un écran qui s'excuse d'une absence voulue inquiète pour rien et fait perdre du temps. 📌 **Le livre de sorts est matérialisé par LES SORTS, pas par l'équipement** — la règle vit dans la couche (`data[starting_equipment_absent]`), sans quoi un lot la « réparera » dans six semaines.

⚖️ **LES MUNITIONS SONT GRATUITES, À LA QUANTITÉ DE LA PHRASE.** Eric, citant la règle `Ammunition` du SRD : *« Donc flèches = munitions **(gratuit)** = tu mets la quantité requise »*. ⭐ *« Gratuit »* a un sens précis, et c'est une **absence de geste** : la munition entre dans Gear **sans rien retrancher de la bourse** — le kit est donné, il ne s'achète pas. ⛔ Le coût `Varies` du record ne doit jamais être soustrait de l'or de départ. ⭐ Et **la quantité vient de la PHRASE** (« 20 Arrows » → 20) : le jour où le SRD écrit 30, le code suit sans qu'on le retouche.

🔴 **LE PIÈGE DU MOT DOUBLE, ET IL EST DANS CE DÉPÔT.** Deux records portent le nom d'affichage **« Ammunition »** : `srd:gear:en:ammunition` (**l'objet**) et `srd:weapon-property:en:ammunition` (**la propriété d'arme**). ⛔ Un commentaire ne tient pas cette distinction — **un garde la tient, par les deux ids**.

⚖️ **UN MORCEAU PEUT RENVOYER À UN AUTRE ÉCRAN, ET ON LE LIT DANS LE DOCUMENT.** Eric : *« Pour l'outil du barde : tu regardes le choix fait dans **Skills**. S'il en a choisi **deux**, il aurait deux possibilités ; si **un seul**, il a cet instrument ; si **aucun**, il n'a rien. »* — puis *« **idem barde et monk** »*. Trois sorties, et ce sont les siennes :

· **un candidat** → on le pose, ⛔ sans question ;
· **deux ou plus** → une **question de plus**, et `Done` attend — ⛔ choisir à la place du joueur est pire que ne rien poser ;
· **aucun** → **un FAIT**, ⛔ pas un refus.

🔴 **ON LIT LE DOCUMENT (`fh.skills.spend.<slug>`), JAMAIS L'ÉTAT D'UN AUTRE ÉCRAN.** Skills collecte aussi ses ajouts dans une variable de module (`ecran.ajoutes.tool`) qui ne survit pas à un rechargement et n'est pas dans le personnage. ⭐ On ne **fabrique** rien ici : on **relit** un choix déjà fait ailleurs.

⚠️ **« PAS ENCORE » N'EST PAS « AUCUN »**, et les deux se disent avec des mots différents. Un joueur qui passe par Équipement **avant** Skills n'a encore rien choisi ; un joueur qui en revient les mains vides a choisi de ne rien prendre. 📏 Ce qui les sépare se lit dans le document : une dépense, n'importe laquelle, prouve la visite.

⭐ **« IDEM » PORTE SUR LE GESTE, PAS SUR L'ENSEMBLE.** Le barde ne regarde qu'**une** famille (Musical Instrument) ; le moine en regarde **deux** (Artisan's Tools **et** Musical Instrument). La famille est donc **déclarée par classe**, ⛔ jamais déduite du nom de la classe.
📏 **ET CE QUE LA DONNÉE PORTE A ÉTÉ MESURÉ** (21/09, 25 outils SRD + 16 FH) : **aucun record d'outil ne porte de champ de famille** (`category`, `family`, `group` : absents partout) ; `craft` **ne discrimine pas** (`thieves-tools` porte « None » comme `musical-instrument`) ; `variants` est du texte libre. ⭐ Le seul lien de famille réel est `inherits`, qui existait **à la source** depuis le 09/09 et que le générateur **perdait** : il est maintenant porté à la couche. **La famille d'un outil est `data.inherits` s'il en a un, sinon son propre id** — une règle, ⛔ pas une liste.
⚖️ **ET LA FAMILLE « ARTISAN'S TOOLS » EST CETTE LISTE, ET RIEN D'AUTRE** *(Eric, 21/09 — tranché)*. Le lot 246 avait dû déclarer `"any"` sur le moine, **sur-inclusion assumée et mesurée** : un moine qui avait acheté un jeu, un véhicule ou une monture les voyait proposés. Eric a nommé les **dix-sept** outils d'artisan un par un, puis fermé le reste d'un mot : *« les autres c'est **other tools** (cf D&D Beyond) »*.

**Alchemist's Supplies · Brewer's Supplies · Calligrapher's Supplies · Carpenter's Tools · Cartographer's Tools · Cobbler's Tools · Cook's Utensils · Glassblower's Tools · Jeweler's Tools · Leatherworker's Tools · Mason's Tools · Painter's Supplies · Potter's Tools · Smith's Tools · Tinker's Tools · Weaver's Tools · Woodcarver's Tools**

⭐ **ET C'EST LA NOTION DE FAMILLE DÉJÀ POSÉE, PAS UNE SECONDE** : les dix-sept prennent `data.inherits`, comme les instruments de Fate's Hand — la famille est donc portée par l'OUTIL, jamais énumérée dans la déclaration d'une classe. ⛔ Une liste de dix-sept ids écrite sur le moine aurait fait de la classe le second écrivain de la famille, et la prochaine classe qui en a besoin l'aurait recopiée.
🔴 **LA RACINE `srfh:tool:en:artisan-s-tools` N'EST PAS UN RECORD, C'EST UNE CLEF.** « Artisan's Tools » n'existe dans tout le SRD que dans la phrase du Monk et dans `Fabricate` : il n'y a rien à pointer, et ⛔ en **fabriquer** un poserait un 26ᵉ outil dans Skills et dans Wares, là où Eric n'a demandé aucun objet neuf. Personne ne **résout** cette chaîne — on la **compare** ; un garde exige qu'aucun record ne la porte.
⭐ **ET LA LISTE EST DANS LE BON SENS** : ce qui est **dedans**. ⛔ Les « autres » ne sont énumérés nulle part — une liste de ce qu'on **exclut** se périme au premier outil ajouté et personne ne le voit ; une liste de ce qu'on **inclut** laisse le nouvel outil dehors, ce qui est le défaut sûr. 📏 Mesuré : les 25 outils du SRD **moins** ces dix-sept font exactement les huit « other tools » *(Disguise Kit, Forgery Kit, Gaming Set, Herbalism Kit, Musical Instrument, Navigator's Tools, Poisoner's Kit, Thieves' Tools)*.

### 📏 LE CRAN DU BOUTON DE CHOIX — **30 de corps, 44 de cible**
📍 `bouton-de-choix-trente-de-corps-quarante-quatre-de-cible` · vivante · 21/09

⚖️ Eric, 21/09 : *« Tu peux faire des boutons de **30 diam (tactile 44)** pour les choix. »* et *« Une ligne de texte, **bouton à droite** = peu d'espace perdu »*, puis *« **Deux lignes** de texte un bouton à droite alors. Ou **trois lignes** de texte un bouton à droite. »*

🔴 **C'EST UNE SECONDE TAILLE, BORNÉE À UN USAGE** — ⛔ **PAS « les boutons rapetissent »**. La norme ratifiée du chantier reste **40 / 44** (16-17/09). Le **30 / 44** ne vaut que pour **la pastille de choix d'un QCM**, où le libellé est **à côté** et non dedans. Un bouton qui porte son mot garde 40.

🔴 **LA CIBLE 44 NE CÈDE JAMAIS** — *un contrôle ne se laisse pas dimensionner par son dessin*. La **boîte** fait 44, le **corps peint** fait 30. 📏 Mesuré par `elementFromPoint` sur le builder servi : boîte 44 × 44 déclarés (60,02 rendus, comme **tous** les boutons du chantier), corps peint 30 × 30, anneau du liseré intact, rayon 6.

⭐ **UNE OPTION N'EST PLUS UN BOUTON À LIBELLÉ : c'est une RANGÉE À DEUX COLONNES** — le texte **dit**, la pastille **choisit**. ⛔ Le texte n'entre pas dans le bouton (un bouton qui contient un paragraphe impose sa boîte tactile à chaque ligne), et ⛔ **la pastille reste à droite et hors du texte** : elle ne passe pas dessous quand le texte va à trois lignes.

⚠️ **« DIAM » NE VEUT PAS DIRE ROND** : la norme du 16/09 dit **rectangle, rayon 6**, et l'octogone est mort. Seule la **cote** change.

🔴 **ET ON NE FABRIQUE AUCUN ORGANE POUR ÇA** : le patron du bouton sait déjà séparer le dessin de la cible. ⛔ **Ne pas poser sa propre cible dans un `::after`** — c'est l'**anneau du liseré**, et l'écraser fait perdre au bouton son fond, sa bordure et son rayon (mesuré : `border-radius: 0px`).
⛔ **ET REDÉCLARER `--bouton-hauteur` SEUL NE SUFFIT PAS.** 📏 Mesuré : sur la pastille, `--bouton-hauteur` valait bien `30px` et `--bouton-retrait-v` rendait `calc((44px - 40px) / 2)` — **le 40 y était déjà substitué**. ⭐ **Une propriété personnalisée est résolue dans la portée qui la DÉCLARE, pas dans celle qui l'emploie** : redéfinir sa dépendance plus bas ne la recalcule jamais. Les deux se redéclarent **ensemble**, et le retrait garde sa **formule**.

### 📏 LE NOM COURT D'UN OUTIL — **une dérivation d'affichage, jamais un renommage**
📍 `equipement-outil-nom-court-derive-du-possessif` · vivante · 21/09

⚖️ Eric, 21/09 : *« Tu retires le mot tool sur chaque item. Tu fais **Tool : smith, glassblower etc.** — tu gagnes de l'espace. »*

🔴 **C'EST UNE DÉRIVATION D'AFFICHAGE, ET C'EST LA BORNE.** ⛔ **Aucun `name` de record ne bouge** : le nom entier reste dans le nom accessible du bouton, dans la ligne posée dans Gear et dans le récapitulatif. Renommer `Smith's Tools` en `smith` **dans la donnée** serait réécrire du SRD à la main *(loi §L)* — ce que le lot 246 a refusé de faire pour « Arrows → Ammunition », et pour la même raison.

⚠️ **LE SUFFIXE N'EST PAS TOUJOURS « Tools »** — les dix-sept en portent **trois** : `Tools`, **`Supplies`** *(Alchemist, Brewer, Calligrapher, Painter)* et **`Utensils`** *(Cook)*. ⛔ Un découpage qui aurait cherché « Tools » aurait laissé *« Alchemist's Supplies »* intact et **personne ne l'aurait vu** : le mot serait juste resté un peu long. ⭐ **La règle ne regarde donc pas la FIN du nom, elle regarde le POSSESSIF** — un seul mot, suivi de `'s` ou `s'`, suivi d'autre chose — et elle **ne nomme aucun suffixe**.

⭐ **ET ELLE REFUSE PROPREMENT, elle ne force jamais** : un nom sans possessif *(« Instrument (Wind) », « Musical Instrument », « Dice Set », « Mount (Air) »)* ressort **entier**. C'est ce qui la rend sûre pour le barde, dont aucun candidat n'est un outil d'artisan ; un métier en deux mots ressortirait entier lui aussi, plutôt que tronqué à son premier mot.

📏 **LES DIX-SEPT SORTIES, MESURÉES UNE PAR UNE** : alchemist · brewer · calligrapher · carpenter · cartographer · cobbler · cook · glassblower · jeweler · leatherworker · mason · painter · potter · smith · tinker · weaver · woodcarver.

---

### 📐 LA QUESTION D'OUTIL SE LIT **EN LIGNE** — le libellé de famille dans le flux
📍 `equipement-question-d-outil-en-ligne` · vivante · 21/09

🔴 **ET LE MOT COURT SEUL NE GAGNAIT RIEN — MESURÉ AVANT DE CHOISIR.** Raccourcir « Smith's Tools » en « smith » dans une rangée qui reste **en colonne** rend la **même carte, 759 et 825, au pixel près** : la hauteur d'une rangée est celle de sa **pastille** *(44 déclarés, 60,02 rendus)*, jamais celle de son mot, et un libellé de deux lignes tient déjà sous 44. ⭐ **Une lecture qui gagne zéro ne peut pas être celle d'une phrase qui dit « tu gagnes de l'espace ».** Le libellé de famille entre donc **dans** le flux au lieu de le surplomber, et les paires mot + pastille s'y rangent à la suite — `Tool: ○ smith ○ glassblower`.

⛔ **ET C'EST BORNÉ À CETTE QUESTION-LÀ.** Les options A/B/C gardent leur colonne : un libellé d'option est une **phrase entière**, et deux colonnes y couperaient les mots *(§ de la rangée à deux colonnes, lot 246)*. ⭐ Même famille `.aiguilleur-*`, mêmes pièces — seul le **conteneur** change.

🔴 **LA PASTILLE PASSE DEVANT SON MOT, ET C'EST UNE CORRECTION D'IMAGE.** Regardé en capture avant de livrer : en ligne, « smith [pastille] glassblower [pastille] » se lit *« smith · [pastille] glassblower »* — la pastille colle au mot **suivant**, et le joueur choisit l'outil d'à côté. 📏 **Et l'écarter ne répare pas** : passer l'écart entre paires de 8 à 16 a fait passer la question à **trois** lignes et rendu les 88 tout juste gagnés *(671 → 759)*. ⭐ En tête, la pastille est un bouton radio et son mot le suit.

---

### ⚠️ CE QUI RESTE OUVERT — **la carte déborde encore à trois outils**
📍 `equipement-carte-du-depart-deborde-avec-la-question-d-outil` · à trancher · 21/09

🔴 **ET D'ABORD, LE RELEVÉ DU LOT 246 PORTAIT LA MAUVAISE UNITÉ.** Il disait *« voile de 681 **blg** »* : c'est **681 pixels**, soit **499 blg** — 📏 mesuré des deux côtés sur le builder servi *(le voile rend 499 une fois divisé par `--echelle`, 1,3643 à 512 de large)*. ⭐ Les chiffres du tableau, eux, étaient justes : ils étaient **tous** en pixels, donc comparables entre eux. Le mot était faux, pas la mesure — mais un chiffre qui voyage avec la mauvaise unité finira par être divisé une fois de trop. **Toute cette section est en pixels.**
⚠️ **ET « LE PIRE DES 48 » EN MANQUAIT UN** : le relevé donnait 620 *(Fighter)*. 📏 Rejoué sur les 48 combinaisons, le pire est **Fighter × Soldier à 656** — l'arrière-plan Soldier porte un refus de plus *(« Gaming Set (same as above) »)*, qui coûte 36. La marge n'était pas 61, **elle était 25**.

📏 **RELEVÉ DU 21/09, builder servi, 512 × 764, voile de 681 px** *(pile SRD + l'interrupteur `Skills & tools`, Moine × Acolyte, option A choisie)* :

| cas | avant (lot 246) | après (lot 247) | verdict |
|---|---|---|---|
| pire des 48 classe × arrière-plan *(Fighter × Soldier)* | **656** | 656 | ✅ marge 25 |
| **Moine, 2 outils dans Skills** | **759** | **671** | ✅ **marge 10** |
| **Moine, 3 outils** | **825** | **737** | ⛔ **+56** *(était +144)* |
| Barde, 3 instruments *(pile Fate's Hand)* | 694 | **671** | ✅ |
| Moine, 2 / 3 outils *(pile Fate's Hand)* | 628 / 694 | **541 / 606** | ✅ |

🔴 **ET CE N'EST PLUS LA QUESTION D'OUTIL QUI DÉBORDE — MESURÉ.** Le même moine **sans aucune question** rend **623** ; avec un *fait* à la place de la question, **641**. La question ne peut donc coûter que **58** avant de sortir du voile ; elle en coûte **114** à trois candidats, parce que **trois métiers ne tiennent pas sur une ligne de 285 blg**. ⛔ Aucune disposition de la seule question d'outil ne peut refermer les 56 qui restent.

⚖️ **CE QUI RESTE EST DONC L'ARBITRAGE D'ERIC, ET LA MESURE DIT OÙ IL PORTE** : le récapitulatif du bas coûte **68**, et sa phrase d'accompagnement **51** de plus — **119 px** qui **répètent mot pour mot** la liste de l'option choisie, déjà lue 300 px plus haut. 📌 Le retirer rendrait **618** à trois outils. ⛔ Mais ce sont **les mots d'Eric et sa maquette** : ni troncature, ni défilement interne, ni coupe sans lui.

---

**Sources** : vault `FH-WEB/FHPC/` — `FHPCv2 nomenclature UI` · `FHPCv2 norme des listes` ·
`FHPCv2 entree R cahier charges` · `FHPCv2 hebergement donnees` · `FHPC norme des organes`.

## 7 septies. ⚖️ UN **POPUP MAJEUR** REMPLACE SON ÉCRAN — ce qu'il recouvre passe au voile 0 *(Eric, 2026-09-23 — lot 250)*
📍 `popup-majeur-remplace-son-ecran` · vivante · 23/09

Eric, 23/09 : *« règles pour les popups majeurs : ce qu'ils recouvrent passe au
voile 0 tant qu'ils sont ouverts »*, puis *« X0 est un popup majeur »*.

**Un popup majeur ne se pose pas DEVANT un écran, il le REMPLACE.** Il prend la
dalle entière, il porte le parchemin des fiches X, et ce qu'il recouvre ne doit
rien laisser transparaître — ni une forme sous le papier, ni une cible qu'un
doigt pourrait atteindre à travers.

### 📌 LE PORTEUR EST L'ÉCRAN, ⛔ PAS LE POPUP
📍 `popup-majeur-porteur-est-l-ecran` · vivante · 23/09

L'écran recouvert pose `data-popup-majeur="oui"` sur son propre nœud ; la feuille
éteint tout ce qui n'est pas le popup :

```css
[data-popup-majeur="oui"] > :not(.aiguilleur) { opacity: 0; pointer-events: none; }
```

⭐ **Un popup ne sait pas ce qu'il cache ; un écran sait qu'il est caché.** Le
jour où un second popup majeur existe, son écran pose le même attribut et hérite
de la règle sans une ligne de plus.

### ⛔ CE N'EST PAS `display: none`
📍 `popup-majeur-n-est-pas-display-none` · vivante · 23/09

Les organes recouverts gardent leur BOÎTE, donc leur place. Ils reviennent
exactement où ils étaient quand le popup se ferme, sans que rien ne soit
remesuré — c'est la même loi que le mode lecture de X1.

### ⚖️ QUI EST MAJEUR — **X0, X1, X2** *(Eric, 23/09 : « X1 et X2 »)*
📍 `popup-majeur-x0-x1-x2` · vivante · 23/09

⭐ **ET LES TROIS N'HONORENT PAS LA RÈGLE DE LA MÊME FAÇON** — c'est le fond de
la chose, et ça n'avait jamais été écrit :

| organe | comment il honore |
|---|---|
| **X0** | il **RECOUVRE** l'écran Gear, dont le nœud reste au document → il faut l'éteindre. C'est le cas où la règle TRAVAILLE. |
| **X1**, **X2** | elles **REMPLACENT** la vue : `rendu()` retourne LEUR nœud, celui du sac n'est jamais construit. |

📏 **Mesuré au navigateur le 23/09** : la fiche X1 ouverte n'a **aucun frère**
dans `.equipment-step`. Il n'y a rien à voiler — ⭐ et c'est la forme la plus
forte de la règle, pas une dispense.

🔴 **CE QUI EST GARDÉ, ET CE N'EST PAS THÉORIQUE** *(`tests/popup-majeur.test.mjs`)* :
le jour où X1 ou X2 deviendrait un **calque** posé par-dessus le sac — pour
garder un défilement, pour animer une ouverture — elle recouvrirait **sans
éteindre**, et le sac transparaîtrait sous le parchemin. ⛔ Le symptôme serait
visuel, tardif, et personne ne penserait à cette règle en le voyant. Les six
attaques du garde ont été éprouvées ROUGE.

### ⏳ CE QUI RESTE À TRANCHER
📍 `popup-majeur-le-reste-des-popups` · à trancher · 23/09

Le choix de pile (*SRD ou Fate's Hand*), la confirmation de fin d'étape et les
guides ne sont pas majeurs tant qu'Eric ne l'a pas dit — ⛔ un popup qui
prendrait cet attribut sans son mot éteindrait un écran que le joueur doit
peut-être continuer de voir.
