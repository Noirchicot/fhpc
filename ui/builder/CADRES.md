# Les cadres du builder — F, FF, FS, et l'habillage D

> **Vocabulaire posé par Eric le 2026-08-16** (croquis `IMG_1560`, et le
> message qui l'accompagne). Il continue le nom **F1**, qui existait déjà
> depuis le 15/08 (« si on décide que c'est une taille F1, taille de fiche »,
> `GABARIT-360-CLASS-SPECIES.md` §1bis).
>
> ⭐ **À quoi ça sert.** Un écran dit désormais *« je suis un F1 »* au lieu de
> re-décrire sa géométrie. Les cotes vivent ICI et dans la feuille ; un lot
> qui les recopie dans sa prose les fera diverger.
>
> ⛔ **Ce fichier ne décide rien tout seul.** Chaque cote qu'il donne est
> soit lue dans `tokens.css`/`fiche.css`, soit mesurée dans la page et
> datée. Ce qui n'est ni l'un ni l'autre porte ⏳.

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
>
> 📖 **ET SA FEUILLE A UN NOM DEPUIS LE 2026-09-06 : LA *FH WEB BIBLE*.** Eric, ce jour-là :
> *« crée un fil qui construit une Bible pour le site web — FH WEB Bible, différente de la Builder
> Bible. **Cite quand même dans le builder que quand on parle du site il faut visiter l'autre
> Bible.** »*
> ➡️ **Dès qu'un lot parle du LIVRE** — le bouton 📖 et où il mène, `LIVRE_ARCANES` et les autres
> sorties vers un chapitre, la loi des liens, les ancres que `sync_from_vault.py` fabrique, la voix
> du texte publié — **il va lire `fh-phb/docs/bible-web/`** *(en ligne :
> `noirchicot.github.io/fh-phb/bible-web/`)*. ⛔ Un lien à sens unique ne vaut rien : la FH WEB
> Bible renvoie ici de son côté, à ce paragraphe et à `ecriture-loi-des-liens`.

---

## 0 bis. TROIS DÉCISIONS D'ERIC, 2026-08-16 (après mesure)
📍 `cadre-prediction-fausse-du-16-08` · remplacée · 16/08
📍 `cadre-pied-76` · vivante · 16/08
📍 `cadre-telephone-couche-hors-cible` · vivante · 16/08
📍 `cadre-validate-disparu` · vivante · 16/08
📍 `cadre-plafond-en-secours` · à trancher · 16/08

1. ✅ **`Validate` A DISPARU PARTOUT** — décidé le 16/08, **fait le 16/08**
   (lot 80, §5.1). Ce n'était pas un réglage : c'est la barre qui pesait
   **76 px** dans le champ de chaque écran, et qui faisait céder la promesse
   de F2 couché.
   ⭐ **CE QUI LA REMPLACE EST TRANCHÉ** : la paire du croquis, `BACK` à
   gauche et `DONE` à droite, produite UNE FOIS par la coquille
   (`renderSortieEtape`, shell.mjs) — les dix écrans en héritent du même
   geste. `BACK` recule d'un **palier** quand il y en a un, d'une **étape**
   sinon : c'est ce qui réconcilie I.5 (*« la molette remplace Back »*, vrai
   entre étapes) avec le lot 79 §4.1 bis (*« un sous-écran de palier n'a
   aucune ceinture, donc aucun retour »*). Les deux gardes correspondants (16
   et 17) ont été RÉÉCRITS à cette vérité, jamais désarmés.
   ⛔ Les écrans à fiche restent l'exception qu'ils étaient (Ch6) : `CHOOSE`
   valide chez eux, et le pied ne s'y pose qu'au 2ᵉ palier.
   📏 **ET LA COTE DE 76 px NE BOUGE PAS** — mesuré après la bascule, à 375
   comme à 360 : le pied fait toujours **76 px** de haut. Deux boutons côte à
   côte coûtent ce qu'un seul coûtait ; le budget de F2 (`champ − 76 − 16`)
   reste donc valable tel quel, et le §4 plus bas n'a pas à être recalculé.

   ⚠️ **SOUS QUELLE CONDITION CE 76 RESTE VRAI, ET DE COMBIEN ON EN EST LOIN**
   (relevé par l'architecte du lot 79 ; chiffré ici plutôt que laissé en
   « tant que »). Les 76 px valent **tant que la paire tient sur UNE ligne** :
   un troisième bouton, ou des libellés traduits plus longs, la feraient
   passer à deux lignes et la cote sauterait — même forme que la condition
   *« une fiche fait un champ »* qui garde `scroll-snap: mandatory`.
   📏 Mesuré au cas le plus étroit (**360**, la cote de référence) :

       champ intérieur du pied ....... 344   (360 − 8 − 8, les mêmes
                                              gouttières que la carte)
       `BACK` 79 + `DONE` 82 + écart 8   169
       ────────────────────────────────────
       MOU RESTANT ................... 175 px

   ⭐ **On en est donc loin — plus du double de la place occupée.** Au corps
   de ces boutons (T3), 175 px valent une SEIZAINE de caractères de plus : le
   budget total est de **24 caractères de libellé** contre 8 aujourd'hui.
   ⛔ Un troisième bouton coûterait en plus son propre rembourrage (42 px),
   donc c'est LUI le vrai risque, pas la longueur d'un mot.
   🔴 Et cette condition est **gardée**, pas promise : `tests/shell-wiring.
   test.mjs` compte les boutons du pied et leurs caractères. Une condition
   que personne ne teste est une condition qui rouille — c'est exactement ce
   qui est arrivé à la phrase corrigée juste au-dessus.
   🔴 Ce qui a changé, en revanche, et qui était un DÉFAUT antérieur : ce pied
   n'avait aucune gouttière latérale — il touchait les deux bords de l'écran
   pendant que la carte au-dessus gardait ses 8 px (§2 bis : *« les marges
   sont sur LES QUATRE CÔTÉS, systématiquement »*). Un seul bouton aligné à
   droite le cachait à moitié ; la paire l'a rendu visible des deux côtés.
   Corrigé au même cran que la carte.
2. ✅ **Le téléphone COUCHÉ n'est pas une cible.** Eric, mot pour mot : *« mon
   petit portable en mode paysage on s'en fout »*. Une cote qui ne tient que
   là ne bloque plus rien — et le seul endroit où F2 cédait était là.
   ⛔ Cela ne dit RIEN de l'iPad couché, qui reste une cible (c'est lui qui a
   imposé la composition à trois colonnes de F1).
3. ✅ **Le plafond de F2 : SEULEMENT EN SECOURS.** *« Si ton tweak n'intervient
   qu'en urgence oui, sinon non. »* — et c'est exactement ce que fait un
   `max-height` : il ne se voit pas tant que le contenu tient, il ne mord que
   quand la carte allait déborder. Rien à inventer pour obtenir ce
   comportement, il est natif. ⏳ Non posé pour autant.
   🔴 **ET LA RAISON QUI ÉTAIT ÉCRITE ICI ÉTAIT FAUSSE, VÉRIFIÉE LE 16/08 :**
   *« plus personne ne déborde une fois `Validate` partie »* supposait que son
   départ RENDAIT ses 76 px. Il ne rend rien — la paire `BACK`/`DONE` qui la
   remplace pèse **exactement les mêmes 76 px** (mesuré après la bascule). Le
   budget de F2 est inchangé, et le cas qui débordait déborderait encore.
   ⭐ Ce qui le retire réellement du chemin, c'est la décision **2** ci-dessus
   — le téléphone couché n'est pas une cible — et elle seule. Une prédiction
   qui se vérifie doit être vérifiée : celle-ci ne tenait pas.

## 0. LA CONSTANTE, ET ELLE EST AU-DESSUS DE TOUT
📍 `cadre-belt-toujours-visible` · vivante · 16/08 · bornée par `budget-entree-r-sans-ceinture` · bornée par `cadre-seuil-est-un-fs`

> *« BELT IS ALWAYS VISIBLE »* — première ligne du croquis.

**La ceinture des dix étapes n'est jamais couverte, par aucun cadre.** Elle
n'est pas un cadre : c'est la coquille. Un cadre commence sous elle.

    hauteur mesurée : 60 px (375 × 553, le 2026-08-16)

🔴 **ET ELLE FAIT TOUJOURS 60 blg, SUR LES DEUX LARGEURS** *(2026-09-02)*.
Depuis le double affichage, la ceinture a **deux formats** — étroite (elle
montre trois crans et porte deux chevrons) et déroulée (elle les montre tous
les huit) — mais **une seule hauteur**, et c'est une contrainte dure : le
panneau vaut 560 blg dont 500 pour la scène, et le 31/08 a mesuré qu'il ne
reste que **9 blg** de mou. Une ceinture qui grandit les prend à la scène.
➡️ **Le détail des deux formats vit dans `NORMES.md` §6 ter** — la tuile à
deux rangs, sa cote déduite, le chevron et son bout de course, les deux bouts
à 100 %. Il n'est pas recopié ici : deux copies divergent.

---

## 1. LES DEUX FAMILLES
📍 `cadre-rail` · vivante · 30/08

| | le menu latéral | largeur du contenu |
|---|---|---|
| **F** *(Floating)* | **gardé** — la colonne étroite de gauche | ce qui reste |
| **FF** *(Floating Full)* | **absent** | toute la scène |

Le menu latéral, c'est `.stage-aside` — `--rail-w` : **90 blg**, partout.
⚖️ *(Il valait 90 à l'étroit et 120 en grandeur Large jusqu'au 2026-08-30 :
c'était un rapport qui changeait avec la place — 11,25 fois `--sp-8` d'un côté,
15 de l'autre — et le zoom l'a remplacé. Sur un 1920 au cran 2 le rail rend
180 pixels, bien au-delà des 120 que le desktop obtenait.)*
Il n'existe que là où il y a une liste à suivre (les douze classes, les douze
espèces, les 22 arcanes).

## 2. ✅ LE MODÈLE RATIFIÉ — Eric, 2026-08-19
📍 `cadre-fs-sortie-nommee` · vivante · 19/08
📍 `cadre-trois-ecrans` · vivante · 19/08

> ⛔ **CE QUI SUIT REMPLACE LA GRILLE À DEUX CHIFFRES.** Elle collait une
> propriété d'ÉCRAN (le rail) à une propriété de DALLE (la hauteur) en une
> étiquette, et la faisait porter par la dalle — qui ne peut pas connaître le
> rail. Trois défauts mesurés le même jour en sont sortis (voir plus bas).
> Les sections qui la définissaient ont été **supprimées**, pas annotées.

### Deux niveaux, deux mots
📍 `cadre-measure-unique` · vivante · 19/08
📍 `cadre-saignante` · vivante · 19/08
📍 `cadre-trois-objets` · vivante · 19/08

**L'ÉCRAN — il y en a trois. Lui seul porte la lettre.**

| | ce qu'il montre | mesure |
|---|---|---|
| **F** | belt + **menu latéral** (`--rail-w` **90 blg**) + une colonne | `--measure` |
| **FF** | belt + le contenu sur toute la scène | `--measure` |
| **FS** | **plein écran** : ni belt ni menu, ça recouvre tout | `--measure` |

⭐ **UNE SEULE MESURE : `--measure` = 62ch.** Eric : *« 62 fonctionne sur le
plus petit comme le plus grand, avec et sans rail. »* Un `--measure-f` a vécu
une heure avant d'être tué : deux noms pour une valeur, c'est la divergence
garantie au premier réglage. C'est un **plafond**, jamais une largeur.

⛔ **FS N'EST PLUS L'ÎLOT.** Ce nom désignait le petit format répété ; l'îlot
s'appelle désormais **tuile**, et `FS` reprend le sens qu'Eric lui donnait déjà
en parlant de `Rules` : *« détacher un chapitre entier du player et l'afficher
en FS »*, *« on recouvre tout »*. Un plein écran DOIT porter une sortie nommée.

**CE QUI VIT DEDANS — il y en a trois. Ils ne portent jamais de lettre.**

| | hauteur | largeur | écart |
|---|---|---|---|
| **carte** | **imposée** — `--fiche-h` = **440 px** | celle de sa colonne (**269 px** mesuré à 375) | 8 px |
| **dalle** | **libre** — celle de son contenu | plafonnée par `--measure` | 8 px |
| **tuile** | **aucune écrite** — la rangée l'égalise | **aucune écrite** — `repeat(6, 1fr)` | **4 px** |

📌 **UNE TUILE N'A QUE DES MARGES** (Eric, 2026-08-19 : *« les petits îlots sur
lesquels étaient les dés, ils ont seulement des marges, il faut s'en
souvenir »*). Ni largeur ni hauteur écrites : trois décisions suffisent —
combien de colonnes, quel écart, quelle forme.

**UNE SEULE MARQUE : `saignante`.** Une dalle qui se termine par un filet
débordant de **−16 px** (`--saignee-debord`), pour dire qu'une autre suit.
⛔ Jamais sur la dernière dalle d'un écran : elle n'aurait rien à séparer.

### Comment ça se lit, et comment ça s'écrit
📍 `cadre-comment-ca-se-lit-et-comment-ca-s-ecrit` · vivante · 19/08

> L'écran **Species** est un **F**. Il porte des **cartes**.
> L'écran **Identity** est un **FF**. Il porte trois **dalles**, dont la
> première est **saignante**.

Dans le DOM : l'écran écrit `data-ecran="F|FF|FS"` (posé par `paintAside`,
shell.mjs) ; un objet écrit `data-objet="carte|dalle|tuile"` et, s'il saigne,
`data-saigne="oui"`. ⛔ **Aucun objet n'écrit de lettre.**

### La traduction de l'ancien vocabulaire
📍 `cadre-traduction-ancien-vocabulaire` · vivante · 19/08

| avant | après |
|---|---|
| F1 · FF1 | **carte** (dans un écran F · FF) |
| F2 · FF2 | **dalle** |
| F3 · FF3 | **dalle saignante** |
| FS *(l'îlot)* | **tuile** |
| — | **FS** = plein écran *(sens neuf)* |

### 🔴 Les trois défauts qui ont tué la grille, tous le même jour
📍 `cadre-trois-defauts-qui-ont-tue-grille-tous-meme-jour` · vivante · 19/08

1. **Le chapeau de chapitre déclarait `FF3` sur les huit chapitres et était un
   `F3` sur quatre.** Une dalle ne peut pas connaître le rail.
2. **Deux `F1` portaient deux mesures** — parce que « F1 » mélangeait *l'écran
   a un rail* et *la carte fait 440 px*.
3. **Le guide général déclaré `F1` faisait 275 px au lieu de 440.** La vraie
   question n'était pas *quel format*, mais *où il vit* : mis dans la colonne,
   il a fait 440 sans qu'une cote soit écrite.

## 2 quinquies. LE « ? » — en haut à DROITE de la dalle
📍 `cadre-question-en-haut-a-droite` · vivante · 19/08

Eric, 2026-08-19, après l'avoir vu à gauche : *« le ? est sur la dalle tout à
droite au même niveau que le titre »*.

Il rouvre le tutoriel, et il est **posé par la coquille**, une fois, sur toutes
les étapes — jamais par un écran, qui pourrait l'oublier. 🔴 **C'est le filet de
sécurité de `Turn tutorials off`** : sans lui ce bouton serait irréversible.

⚠️ Le coin haut-droit lui appartient : ce qui commence la dalle (titre ou
première ligne) s'arrête avant lui, sinon le texte passe DESSOUS — et c'est
justement le texte que ce bouton sert à rouvrir.

## 2 bis. LES COTES, EN CHIFFRES
📍 `cadre-marges-quatre-cotes` · vivante · 16/08
📍 `cadre-trois-largeurs` · vivante · 30/08

Les marges sont sur **les quatre côtés**, systématiquement, et c'est **un seul
jeton pour tout le vocabulaire** — elles ne font donc pas partie du barème.

| | jeton | la cote, en **blg** |
|---|---|---|
| **Marge** (4 côtés) | `--sp-8` / `--sp-16` | **8** · **16** |
| **Largeur max — carte** | `--card-w` | **625** *(62 ch de raison)* |
| **Largeur max — écran à contrôles** | `--panel-w` | **625** *(62 ch)* |
| **Largeur max — grille** | `--grid-w` | **605** *(60 ch)* |

### ⚖️ UNE SEULE COLONNE DEPUIS LE 2026-08-30 — *le renversement, et sa raison*
📍 `cadre-une-seule-colonne` · remplacée · 30/08

La table en avait **deux** : « étroit » et « grand écran », où la même carte valait 625 puis 766,
le panneau 625 puis 887. C'était la grandeur Large du lot 69, et elle est **supprimée**.

🔴 **La loi d'Eric du 30/08** : *« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT NULLE
PART. »* Une largeur qui double sur grand écran pendant que `--sp-8` ne bouge pas **change un
rapport** — c'est exactement ce que la loi interdit, et c'est le même métier que le zoom, fait
deux fois et à moitié.

⭐ **CE QUI REMPLACE LA SECONDE COLONNE** : l'échelle. Une carte fait 625 blg à tous les crans ;
au cran 2 elle rend 1 250 pixels, bien au-delà des 766 que le desktop obtenait. Le grand écran
n'est plus servi par des cotes plus grandes, il est servi par des **pixels plus gros**.

📌 **ET C'EST POURQUOI LA COLONNE S'APPELLE « blg »** — le *blurg*, l'unité de dessin
(`tokens.css`). Un blg est ce que vaut un `px` de feuille une fois le zoom appliqué. Le nombre de
blg ne change jamais ; c'est le pixel qui bouge sous lui.

### 🔴 LA COTE EST EN PIXELS, LE `ch` N'EST PLUS QUE SA RAISON *(29/08)*
📍 `cadre-cote-en-px-le-ch-est-la-raison` · vivante · 29/08
📍 `ecriture-mesure-de-prose` · vivante · 29/08

Ces largeurs ont vécu en `ch` jusqu'à ce jour, et **c'était un défaut invisible d'ici**.

📏 **MESURÉ** : `76ch` rend **765 px** avec Inter, **766** en police système… et **608 px** en
police de repli. 157 px d'écart pour la MÊME déclaration — car `ch` est la largeur du « 0 » de la
police **résolue au point d'usage**, et une custom property qui la porte se recalcule chez chaque
lecteur, avec la fonte qu'il a *à cet instant*.

⛔ **CE QUE ÇA A COÛTÉ** : cinq correctifs de largeur, tous vérifiés justes ici (Inter toujours
chargée quand je mesure) et tous faux chez Eric, dont l'iPad calculait pendant ou après un repli
de fonte — au point que deux états du même écran rendaient deux largeurs (904 puis 690 px sur ses
captures). *« Google Headless » ne protège que du moteur qu'on regarde.*

⭐ **LA RÈGLE QUI EN SORT, ET ELLE VAUT AU-DELÀ D'ICI** : une cote de **CADRE** est une largeur de
boîte, elle se fige en px. Le `ch` reste légitime pour une **mesure de prose** (une longueur de
ligne EST une affaire de caractères) — mais alors il borne du texte, jamais une boîte dont
dépendent d'autres cotes.

⚠️ **IL N'Y A PAS UNE MESURE, IL Y EN A TROIS, ET C'EST VOULU** : une grille de
compétences n'est pas un paragraphe, une rangée de caractéristiques non plus
(§3e des jetons). Le cadre dit la marge ; c'est l'ÉCRAN qui dit de quelle
nature est sa largeur.

### 🔴 LA LARGEUR N'EST PAS UNE PROPRIÉTÉ DU FORMAT — question d'Eric, 2026-08-16
📍 `cadre-largeur-n-est-pas-une-propriete-du-format` · vivante · 16/08

> *« C'est normalement la caractéristique d'une FF2, non ? »*, en demandant de
> plafonner deux dalles à `--measure`.

**NON, ET LE FICHIER INVITAIT LA QUESTION.** Le chiffre du barème ne dit QUE la
hauteur (§2) ; la lettre ne dit QUE le menu latéral (§1). **Aucun des deux ne
dit la largeur.** Mais §4 et §6 en annoncent une pour chaque format, et on lit
naturellement ça comme une règle du format.

📏 **MESURÉ, ET LE DÉMENTI EST NET** : les sept écrans FF2 emploient **trois
largeurs différentes**.

| FF2 | largeur | pourquoi |
|---|---|---|
| Compétences · Équipement | `--grid-w` | une GRILLE |
| Caractéristiques | `--panel-w` | un écran à CONTRÔLES |
| Concept · Destinée | `--measure` | de la PROSE |

⭐ **CE QUE LES §4 ET §6 DONNENT EST DONC CE QUE LEUR UTILISATEUR ACTUEL
EMPLOIE, pas une contrainte du format.** Deux écrans du même format peuvent
avoir des largeurs différentes sans qu'aucune règle ne soit violée — c'est même
le cas aujourd'hui, sur le format le plus employé du builder.

📌 **ET DEPUIS LE 2026-08-30, AUCUN DES TROIS NE BOUGE.** Ce paragraphe disait
que `--measure` était *« le seul des trois à ne pas bouger en grandeur Large »*,
là où `--card-w` passait à 76 ch et `--panel-w` à 88. Le zoom a supprimé ces
rehaussements : les trois valent la même chose à tous les crans, en **blg**.
⭐ **Ce que la note voulait dire reste vrai, et vaut maintenant pour les trois** :
dire *« la même largeur que Destiny »* et que ce soit vrai sur un bureau comme
sur un téléphone. C'est l'échelle qui fait la différence entre les deux, plus la
cote.

## 3. LA CARTE — *la fiche* · species et classes  ⟨ex-F1⟩
📍 `cadre-carte-hauteur-imposee` · vivante · 15/08
📍 `cadre-carte-largeur` · vivante · 16/08
📍 `geste-defilement-aimante` · vivante · 15/08

```
 ┌───────────────────────────────────────────────┐
 │  CEINTURE — dix étapes, toujours visible      │ 60
 ├───────────────────────────────────────────────┤
 │ ┌────┐ ┌─────────────────────────────────┐    │
 │ │menu│ │                                 │    │
 │ │ 90 │ │        DALLE FENÊTRE            │    │
 │ │    │ │      242 min × 440 fixe         │ 440│  ← la hauteur ne bouge pas
 │ │    │ │                                 │    │
 │ │    │ └─────────────────────────────────┘    │
 │ └────┘  ↑                               ↑     │
 └─────────8──────────────────────────────8──────┘
   ↑8                                        8↑
```

* **hauteur `--fiche-h: 440 px`, IMPOSÉE** — décision d'Eric du 15/08 : une
  fiche fait un écran, ni plus ni moins. C'est ce qui rend le défilement
  aimanté honnête (`scroll-snap-type: y mandatory`, gardé par `snap.test.mjs`).
* **largeur : plancher 242 px, plafond `--measure` (62 ch).** Le plancher est
  calculé, pas choisi : 360 − 16 marge − 78 rail − 8 écart − 16 marge.
* **marges 8 partout.**
* **couché** : la même dalle passe en trois colonnes (image · texte · infos),
  `@media (orientation: landscape)` dans `fiche.css`. La composition suit la
  FORME de l'écran, jamais la place qui reste.

### 📏 CE QUE LA COTE IMPOSÉE ACHÈTE VRAIMENT — mesuré le 2026-08-16
📍 `cadre-carte-achete-la-regularite` · vivante · 16/08

Eric : *« imposer la hauteur dans mes cartes species ne changerait rien sur
tous les mobiles, car les organes du dressage sont limitants — donc elle
marche en F2 et F3 de la même manière »*. **Mesuré à 375 × 553, en relâchant
la contrainte le temps de la mesure : vrai pour les classes, faux pour les
espèces.**

| | hauteur naturelle | hauteur imposée | ce que la cote fait |
|---|---|---|---|
| **les 12 classes** | **455** (les douze, au pixel) | 440 | elle **comprime** de 15 |
| **5 espèces** *(Dragonborn, Elf, Hoddon, Goliath, Tiefling)* | **440** | 440 | **rien** — le dressage est limitant, exactement comme prévu |
| **7 espèces** *(Araag, Elestu, Loroka, Dwarf, Halfling, Human, Orc)* | **392** | 440 | elle **ajoute 48 px de vide** |

🔴 **ET LA CAUSE EST NOMMÉE, PAS SUPPOSÉE : c'est la bande d'infos.** Les cinq
espèces qui la portent (`data-infos="oui"`) atteignent 440 toutes seules ; les
sept qui ne l'ont pas s'arrêtent à 392. La bande ne mesure que 14 px — c'est
sa présence qui redistribue le reste.

⭐ **DONC LA COTE IMPOSÉE N'ACHÈTE PAS DE LA HAUTEUR, ELLE ACHÈTE DE LA
RÉGULARITÉ.** En F3, le catalogue d'espèces montrerait **deux tailles de
carte** (392 et 440) au défilement. C'est ça qu'on perdrait — pas des pixels.
📌 Sur les classes, elle fait l'inverse : elle serre les douze de 15 px, de
façon identique. Rien n'est rogné à l'œil (vérifié sur la fiche servie), mais
c'est le signe qu'elles sont **à la limite** — un mot de plus dans un blurb
sortira par là.

**Qui l'emploie aujourd'hui** : `class`, `species`, le don d'origine (panneau
ouvert) et Destiny en mode choix — autrement dit **tout ce qui porte le menu**
(voir §3 bis).

## 3 bis. QUI PORTE LE MENU LATÉRAL — la seule chose qui sépare F de FF
📍 `cadre-qui-porte-le-rail` · vivante · 16/08

Relevé dans `catalogueCourant` (shell.mjs) le 2026-08-16, **écran par écran** :

| avec menu (**F**) | sans menu (**FF**) |
|---|---|
| Species · Class | Universe · Concept · Abilities · Skills · Equipment · Review |
| le don d'origine, panneau OUVERT | le don d'origine, panneau fermé |
| Destiny en mode **choix** | Destiny en mode **tirage** (le défaut) |

🔴 **CONSÉQUENCE, ET ELLE SIMPLIFIE LA CARTE : la famille F N'A QU'UN SEUL
FORMAT EN SERVICE, ET C'EST F1.** Tout ce qui porte le menu est une fiche de
catalogue. **F2 n'a aucun utilisateur** — Concept et Universe, que je lui
avais attribués hier, n'ont pas de menu latéral : ce sont des **FF**.
📌 C'est Eric qui l'a relevé (*« Concept c'est du FF1 car pas de barre
latérale »*), et le code lui donne raison.

## 4. LA DALLE DANS UN ÉCRAN F — les cotes mesurées  ⟨ex-F2⟩
📍 `cadre-dalle-hauteur-libre` · vivante · 19/08
📍 `cadre-f2-place-reservee` · vivante · 16/08

```
 ┌───────────────────────────────────────────────┐
 │  CEINTURE                                     │ 60
 ├───────────────────────────────────────────────┤
 │ ┌────┐ ┌─────────────────────────────────┐    │
 │ │menu│ │                                 │    │
 │ │ 90 │ │        DALLE FENÊTRE            │  ⇕ │  ← la hauteur SUIT le contenu
 │ │    │ │     largeur ≤ 62 ch             │    │
 │ └────┘ └─────────────────────────────────┘    │
 └───────────────────────────────────────────────┘
   ↑8                                        8↑
```

* **hauteur : celle du contenu** — c'est tout ce qui la sépare de F1.
* **largeur `--card-w`** : `--measure` (**625 blg**, 62 ch de raison), partout.
  ⚖️ *(Elle passait à 76 ch en grandeur Large jusqu'au 2026-08-30 — voir §2 bis,
  « une seule colonne depuis le 30/08 ».)*
  ⚠️ C'est la largeur de son utilisateur, PAS une propriété du format — voir
  §2 bis, « la largeur n'est pas une propriété du format ».
* ⏳ **Personne ne l'emploie, et rien ne l'implémente** : aucun écran du
  builder ne pose sa hauteur aujourd'hui. Ce format est une PLACE RÉSERVÉE.

### ⭐ CE QUE TOUTE FENÊTRE FLOTTANTE PROMET — Eric, 2026-08-16
📍 `cadre-promesse-de-l-air` · à trancher · 16/08

*(écrit à propos de F2, vrai de tout cadre centré à marges : 1, 2 ou 3)*

> *« Je l'ai conçue pour qu'elle puisse ressembler à une CARTE : marges
> au-dessus ET en dessous, sur mon portable — donc garanti sur la majorité
> des portables et des bureaux. »*

**La promesse n'est pas une hauteur, c'est de l'AIR EN HAUT ET EN BAS.** Une
carte qui touche les deux bords n'est plus une carte, c'est une page. C'est
donc un **plafond** qu'il faut à F2, jamais une hauteur imposée — et le
plafond doit compter ce que la carte NE VOIT PAS.

### 📏 LA PROMESSE, MESURÉE LE 2026-08-16 (Concept et Universe)
📍 `cadre-promesse-mesuree-2026-08-16` · vivante · 16/08

| écran | champ | Concept | Universe | ressemble à une carte ? |
|---|---|---|---|---|
| **375 × 553** — SE debout | 493 | 271 *(air 223)* | 317 *(air 177)* | ✅ |
| **1280 × 800** — bureau | 740 | 303 *(air 438)* | 349 *(air 392)* | ✅ |
| **667 × 375** — SE **couché** | 315 | 271 *(air 45)* | **317 → air −1** | 🔴 **non** |

🔴 **LE PIÈGE EST AILLEURS QUE DANS LA CARTE : LA SORTIE D'ÉTAPE PARTAGE LE
MÊME CHAMP, ET ELLE PÈSE 76 px.** ⚠️ *C'était `Validate` quand ce relevé a été
pris ; c'est la paire `BACK`/`DONE` depuis le lot 80 — et le pied fait toujours
76 px, re-mesuré après la bascule (§0 bis). Le budget ci-dessous n'a donc pas
bougé d'un pixel, seul le nom de ce qui l'occupe a changé.* Le budget réel d'une carte qui garde son air
n'est donc pas le champ, c'est `champ − 76 − 16`. Couché sur un téléphone,
cela laisse **223 px** : Concept en demande 255, Universe 301. Les deux
débordent, et Universe touche même le bas de l'écran (vérifié à l'œil, la
carte est coupée net par le bord).

⛔ **Ce que ce n'est PAS** : un défaut de contenu. Les deux écrans sont
sobres. C'est la promesse de F2 qui n'est tenue par aucune règle — elle tient
aujourd'hui par la chance d'avoir peu à afficher, et elle cède au premier
écran couché.

⏳ **CE QUI LA RENDRAIT STRUCTURELLE** (non fait, décision d'Eric) : un
plafond sur la carte — `max-height` = le champ moins le pied moins les
marges — et le contenu qui défile À L'INTÉRIEUR. La carte garderait alors son
air sur tout écran, et « variable à la demande » deviendrait vrai dans le seul
sens qui compte : elle prend ce qu'il lui faut, jamais plus que ce qui la
laisse ressembler à une carte.
⚠️ Le prix est connu : un second défilement dans la scène — le même que celui
des grilles de sorts. Sur ces écrans-là il n'y a aucun glisser, donc aucune
des complications payées au lot 79.

## 5. LA CARTE DANS UN ÉCRAN FF — les cotes mesurées  ⟨ex-FF1⟩
📍 `cadre-destiny-menu-en-mode-choix` · à trancher · 16/08

```
 ┌───────────────────────────────────────────────┐
 │  CEINTURE                                     │ 60
 ├───────────────────────────────────────────────┤
 │  ┌─────────────────────────────────────────┐  │
 │  │                                         │  │
 │  │           DALLE FENÊTRE                 │440│
 │  │        pas de menu à gauche             │  │
 │  └─────────────────────────────────────────┘  │
 └───────────────────────────────────────────────┘
   ↑8                                        8↑
```

**F1 sans le menu.** Même hauteur imposée, mêmes marges, centré.

⚠️ **CE QUE DESTINY FAIT DÉJÀ, ET LA QUESTION QUE ÇA POSE.** Mesuré dans le
code (`catalogueCourant`, shell.mjs) : Destiny n'a **pas** de menu latéral en
mode **tirage** (le défaut) — il est donc **déjà** un FF. Le menu n'apparaît
qu'en mode **choix**, là où il y a 22 arcanes à parcourir : c'est le seul
endroit où il gagne sa place. « Destiny en FF1 » revient donc à retirer le
menu **du mode qui en a le plus besoin**. À trancher avant de le faire.

## 6. LA DALLE DANS UN ÉCRAN FF — Skills, et presque tout le reste  ⟨ex-FF2⟩
📍 `cadre-dalle-dans-ecran-ff` · vivante · ?

```
 ┌───────────────────────────────────────────────┐
 │  CEINTURE                                     │ 60
 ├───────────────────────────────────────────────┤
 │  ┌─────────────────────────────────────────┐  │
 │  │  ○ ○ ○   ← menu horizontal (paliers)    │  │
 │  ├─────────────────────────────────────────┤  │
 │  │           DALLE FENÊTRE               ⇕ │  │  ← hauteur du contenu
 │  └─────────────────────────────────────────┘  │
 └───────────────────────────────────────────────┘
```

**Pleine largeur, hauteur du contenu**, plus une rangée de ronds de palier
qui lui est propre.

* **largeur `--grid-w`** — ⚠️ **une TROISIÈME nature de largeur**, ni prose ni
  carte : une grille de compétences n'est pas un paragraphe (§3e des jetons).
  Elle existe déjà, **elle n'a rien à voir avec le format** — et ce n'est pas
  une formule : les sept FF2 en emploient trois différentes (§2 bis, mesuré).
* 🔴 **C'EST UN 2** — sa hauteur est celle de son contenu. Même chose pour
  Universe, Concept, Abilities, Equipment, Review : **tout ce qui n'est pas
  une fiche est un 2 aujourd'hui.**
* ⏳ **Défaut signalé par Eric (16/08), non encore mesuré par moi** : au tout
  début du défilement, la marge supérieure manque. À mesurer dans la page
  avant d'y toucher — la cause n'est pas connue.

## 6 bis. ✅ IDENTITY EST UN ÉCRAN FF QUI PORTE DES DALLES
📍 `cadre-identity-est-ecran-ff-qui-porte-dalles` · vivante · 16/08

La question posée hier (*« FF2 ou FF3 ? »*) est tombée avec F3. Concept n'a
aucun menu latéral et sa hauteur est celle de son contenu : **FF2**, comme
presque tout le builder. Mesuré : 271 px pour un champ de 493.

## 7. LA TUILE — *l'îlot* · le petit format répété  ⟨ex-FS⟩
📍 `cadre-tuile-ecart-4` · vivante · 16/08
📍 `cadre-tuile-n-a-que-des-marges` · vivante · 19/08
📍 `cadre-tuile-taille-du-de-deduite` · vivante · 16/08
📍 `geste-une-rangee-de-tuiles-est-une-cible-unique` · vivante · 16/08

> Nommé par Eric le 2026-08-16, en construisant le plateau des
> caractéristiques : *« six caracs qui flottent au-dessus du background, avec
> un dé en 3d dessus […] on va les appeler des FS (floating small) »*.

```
 ┌──────────────────────────────────────────────┐
 │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
 │  │ 15 │ │ 14 │ │ 13 │ │ 12 │ │ 10 │ │ 8  │   │  ← six îlots, une rangée
 │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │
 │    54     ↑4                                 │
 └──────────────────────────────────────────────┘
```

**Un FS n'est pas une fenêtre, c'est une TUILE** — un petit objet flottant,
répété en rangée, qui porte UNE chose (un dé, un score, un jeton). Il n'a
donc ni les marges ni les hauteurs des F/FF : il n'a qu'un **écart** et un
**nombre de colonnes**.

* ⛔ **AUCUNE LARGEUR NI HAUTEUR ÉCRITE, ET C'EST LE POINT.** `repeat(6, 1fr)`
  déduit la largeur ; la hauteur vient du contenu, et les six s'égalisent
  parce qu'une ligne de grille prend la hauteur de sa plus haute cellule.
  Trois décisions suffisent : **combien de colonnes, quel écart, quelle forme
  (ou aucune)**.
* 🔴 **L'ÉCART EST DE 4, ET C'EST L'ARITHMÉTIQUE DE 360 QUI L'A IMPOSÉ** —
  mesuré le 16/08. À 8, l'îlot vaut 50,7 et son dé 42 : **deux pixels sous
  `--touch` (44)**. Et ce n'est pas rattrapable ailleurs — six cases de 52
  plus cinq écarts de 8 demandent 352 px pour 344 disponibles. À 4 : îlot
  **54**, dé **46**.
* ⭐ **Ce qui EST écrit, c'est la taille du dé** — le moteur 3D veut des
  pixels — et elle se **déduit** de la largeur mesurée d'un îlot, jamais
  d'une constante.
* 📌 Une rangée de FS peut être une **cible de dépôt** : le banc lui donne
  `data-creneau`, et lâcher un dé n'importe où dessus le fait rentrer chez
  lui. Une seule zone d'accueil plutôt que six — viser un îlot de 54 px au
  pouce serait un jeu d'adresse.

**Où le voir** : `ui/builder/ilots-lab.html` (banc d'essai, déployé).

## 8. L'HABILLAGE — `D-<format>-<variante>-<plateforme>`
📍 `cadre-habillage-d` · vivante · 16/08

> Eric, 16/08 : *« c'est comment on organise les boîtes de texte dans une
> fenêtre, et aussi son background »*.

**Le cadre dit la BOÎTE ; l'habillage dit CE QU'IL Y A DEDANS.** Deux écrans
peuvent être des F1 et n'avoir pas le même habillage.

| | |
|---|---|
| `D-F1-1-d` | habillage de la fenêtre F1, variante **1 (species)**, **desktop** |
| `D-F1-1-m` | la même, **mobile** |
| `D-F1-2-d` | habillage F1, variante **2 (classes)**, desktop |
| `D-F1-2-m` | la même, mobile |

📌 **Les deux variantes sont identiques aujourd'hui** — et le nom existe
justement pour qu'elles puissent cesser de l'être sans rien renommer.

### 📏 LA BOÎTE DONNE-T-ELLE LE CONTRÔLE ? OUI — MAIS PAS PAR LA PROPORTION
📍 `cadre-boite-achete-une-cote-reservee` · vivante · 16/08
📍 `ecriture-corps-de-lecture-ne-se-met-pas-a-l-echelle` · vivante · 16/08 · bornée par `budget-carte-r-est-un-dessin`

Eric, 2026-08-16 : *« si on met le texte et les images dans des boîtes, a-t-on
un meilleur contrôle du rendu ? La même boîte texte 1 des classes fait-elle la
même taille sur un grand écran — je serais presque sûr que non, mais elle
garde sa proportionnalité. »*

**Mesuré sur la MÊME fiche (Barbarian), deux écrans :**

| bloc | 375 × 553 | 1280 × 800 | rapport |
|---|---|---|---|
| la dalle | 269 × 440 | **625** × 440 | largeur ×2,32 · **hauteur ×1** |
| l'image | 100 × 156 | 175 × 296 | ×1,75 · ×1,90 |
| **TEXTE 1** (nom + stats) | 145 × 126 | **106** × 126 | **×0,73** · ×1 |
| TEXTE 2 (bande d'infos) | 253 × 14 | 226 × 14 | ×0,89 · ×1 |
| TEXTE 3 (le blurb) | 253 × 144 | 226 × 130 | ×0,89 · ×0,90 |
| corps du texte | **16 px** | **16 px** | ×1 |

✅ **La première intuition est juste** : non, la boîte ne fait pas la même
taille.
🔴 **La seconde est fausse, et l'écart est net** : elle ne garde AUCUNE
proportionnalité. Pendant que la dalle gagne 2,32×, TEXTE 1 **rétrécit**
(145 → 106). Rien n'est proportionnel, dans aucun sens.

⭐ **ET LA RAISON EST LA BONNE : LE TEXTE NE SE MET PAS À L'ÉCHELLE.** Le corps
vaut 16 px sur les deux écrans, parce que 16 px est une taille de LECTURE, pas
un décor — c'est pour ça que les hauteurs de bloc sont identiques au pixel
(126 = 126, 14 = 14). Une boîte de texte proportionnelle voudrait dire un
texte proportionnel, donc illisible en bas d'échelle ou ridicule en haut.

⛔ **CE QU'UNE BOÎTE ACHÈTE N'EST DONC PAS UNE PROPORTION, C'EST UNE COTE
RÉSERVÉE** — et ce dépôt l'a déjà payé une fois : la colonne de texte de la
fiche est FIXÉE à 226 px depuis le 16/08, parce qu'en la laissant se partager
la place, la première vraie image l'a fait tomber à 203,6 et les lignes de
sous-classe se sont repliées (`fiche.css`, « une cote de lecture ne recule pas
devant un décor »). **C'est l'image qui cède, jamais le texte.**

### 🔍 REPRIS AXE PAR AXE, À LA DEMANDE D'ERIC — et sa lecture trouve ce que la mienne ratait
📍 `cadre-forme-non-gardee` · à trancher · 16/08

Le même relevé, en rapports **par axe** et en **forme** (hauteur ÷ largeur) :

| bloc | A · 375×553 | forme A | B · 1280×800 | forme B | ×larg | ×haut | **dérive de forme** |
|---|---|---|---|---|---|---|---|
| **l'écran** | 375 × 553 | 1,475 | 1280 × 800 | 0,625 | 3,413 | 1,447 | 0,424 |
| **la dalle** | 269 × 440 | 1,636 | 625 × 440 | 0,704 | 2,323 | 1,000 | **0,430** |
| texte 1 | 145 × 126 | 0,869 | 106 × 126 | 1,189 | 0,731 | 1,000 | 1,368 |
| texte 2 | 253 × 14 | 0,055 | 226 × 14 | 0,062 | 0,893 | 1,000 | 1,119 |
| texte 3 | 253 × 144 | 0,569 | 226 × 130 | 0,893 | 0,893 | 0,903 | **1,011** |
| l'image | 100 × 156 | 1,560 | 175 × 296 | 1,691 | 1,750 | 1,897 | 1,084 |

⭐ **CE QUE CETTE LECTURE MONTRE, ET QUE « ×larg / ×haut » CACHAIT** : la
**dalle se déforme exactement comme l'écran** — 0,430 contre 0,424, **1,4 %
d'écart**. Elle passe de portrait à paysage au même rythme que lui. Et le
**blurb garde sa forme à 1,1 %**. La proportionnalité qu'Eric cherchait
existe donc bel et bien — à l'échelle de la dalle et du texte de prose.
📌 Ma formule précédente (« rien n'est proportionnel ») était trop large :
elle comparait des facteurs d'axe, jamais des formes.

🔴 **MAIS ELLE N'EST TENUE PAR AUCUNE RÈGLE, ET UN TROISIÈME ÉCRAN LE PROUVE.**
Mesuré à **1280 × 1000** : l'écran prend la forme 0,781, la dalle reste à
**0,704** — l'accord de 1,4 % devient **10 %**. La dalle ne suit pas l'écran :
sa hauteur est clouée à 440 et sa largeur plafonnée à 62 ch. L'accord vu
entre A et B est une **coïncidence de ces deux écrans-là**.

⛔ **CONCLUSION, ET ELLE NE CHANGE PAS** : si la continuité doit reposer sur
la forme, il faut l'ÉCRIRE (un `aspect-ratio` sur la dalle) — aujourd'hui
rien ne la tient. Les seuls invariants réellement gardés sont des **cotes
réservées** : 226 px de colonne de lecture, 16 px de corps, 440 de hauteur.

⭐ **La conclusion d'Eric tient quand même, en changeant d'invariant** : la
continuité d'écran à écran vient bien des boîtes — mais de leurs **cotes
réservées** (226 pour la colonne de lecture, 16 px pour le corps), pas d'un
rapport d'échelle.

### Le fond, et ce sont les valeurs QUI EXISTENT DÉJÀ
📍 `cadre-encre-sur-verre` · vivante · ?

| habillage | jeton | ce que c'est |
|---|---|---|
| **35 %** | `--voile-simple` → `--dalle-simple` | verre léger — les choix, les gros affichages |
| **50 %** | `--voile-inter` → `--dalle-inter` | verre moyen — un peu de texte |
| **plein** | `--surface` (dalle majeure) | opaque — le fond ne traverse plus |
| **sur mesure** | ⏳ | aucun écran n'en a encore |

🔴 **Sur du verre, seule l'encre `--text` tient les 4,5:1** — `--text-muted`
rend 3,0 à 3,6. Vérifié par `tests/decor.test.mjs` **dans les deux thèmes**,
avec le fond d'écran réel de chacun. Un habillage qui passe en verre ne peut
pas garder son texte gris.

---

## 8 bis. 🔴 FAIRE PASSER LE FOND ENTRE DEUX DALLES — `data-bleed`
📍 `cadre-bleed-garde-les-gouttieres` · vivante · 16/08
📍 `cadre-data-bleed` · vivante · 16/08
📍 `cadre-data-bleed-porte-aussi-la-hauteur` · vivante · 16/08

> Eric, 2026-08-16, après m'avoir vu échouer deux fois : *« démerde-toi comme
> tu veux mais je veux voir du background entre ces deux dalles — ça a déjà
> été fait dans skills »*. Puis : *« un truc important à retenir, ce
> data-bleed, à noter pour faire des séparations »*.

**LE PIÈGE, ET IL SE REPOSERA À CHAQUE ÉCRAN COMPOSÉ DE DALLES.** Tout écran
est rendu dans `.decision-card`, qui est une **dalle MAJEURE** — donc opaque
(`--surface`). Deux dalles posées dedans ne peuvent pas être séparées par le
fond : l'intervalle montre la carte, c'est-à-dire **la même couleur que ce
qu'il est censé séparer**.

⛔ **AUCUNE MARGE NE PEUT RÉPARER ÇA**, et c'est ce qui rend le piège coûteux :
le symptôme ressemble à « l'écart est trop petit », donc on augmente l'écart.
Mesuré sur Abilities : à 12 px comme à 24, le résultat est identique — le
problème n'est pas la TAILLE de l'intervalle, c'est CE QU'ON VOIT DEDANS.
📌 Ajouter le liseré de verre aux deux dalles ne suffit pas non plus : il les
borde, il ne fait pas apparaître le fond.

⭐ **LE REMÈDE : LA CARTE S'EFFACE.** `shell.mjs` pose `data-bleed="true"` sur
`.decision-card`, et la feuille lui retire son fond, sa bordure et son
rembourrage. Elle cesse d'être une SURFACE et redevient une boîte de mise en
page — le principe que le lot 59 écrivait déjà (B0.23b) : *« des dalles qui
FLOTTENT »*. **Un écran DÉJÀ composé de dalles n'a pas besoin d'une dalle de
plus dessous ; elle ne fait que boucher le fond.**

| qui l'emploie | comment |
|---|---|
| **Class · Species** (palier 1) | `data-bleed` — les douze fiches flottent |
| **Skills** | `data-bleed` — la grille et ses barres flottent |
| **Abilities** | une règle à part (voir ci-dessous) |

⚠️ **`data-bleed` PORTE AUSSI `height: 100%`, ET CE N'EST PAS TOUJOURS
SOUHAITABLE.** Cette cote sert aux écrans dont le contenu se TAILLE SUR LE
CHAMP (les fiches de catalogue, la grille de Skills). Un **FF2** — dont la
hauteur est celle de son contenu, par définition — ne doit pas la recevoir :
elle lui imposerait le champ. Abilities emploie donc une règle qui reprend la
transparence sans la hauteur (`.decision-card:has(> .abilities-step)`).
📌 Le jour où un troisième écran a le même besoin, c'est le drapeau qu'il faut
scinder en deux (transparence · hauteur), pas la règle qu'il faut recopier.

⭐ **ET LES GOUTTIÈRES RESTENT** : la marge de la carte survit à l'effacement.
C'est la SURFACE qui disparaît, pas les 8 px qui empêchent les dalles de
toucher le bord de l'écran (§2 bis : les marges sont sur les quatre côtés,
systématiquement).

---

## 9. CE QUE CE FICHIER N'EST PAS
📍 `socle-la-source-cite-elle-ne-s-invente-pas` · vivante · ?

⛔ Il ne remplace pas `SOCLE.md` (qui possède quoi, les trois verbes, ce qui
survit à un redessin) : celui-là dit le MÉCANISME, celui-ci dit les FORMATS.
⛔ Il ne remplace pas la feuille : une cote se change dans `tokens.css` ou
`fiche.css`, et se **recopie** ici avec sa date. Deux sources d'accord valent
mieux qu'une source unique qu'on oublie de lire — mais elles se citent, elles
ne s'inventent pas.
