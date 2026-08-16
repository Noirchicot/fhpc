# Les cadres du builder — F, FF, et l'habillage D

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

## 0 bis. TROIS DÉCISIONS D'ERIC, 2026-08-16 (après mesure)

1. 🔴 **`Validate` VA DISPARAÎTRE PARTOUT.** Ce n'est pas un réglage : c'est
   la barre qui pesait **76 px** dans le champ de chaque écran, et c'est elle
   qui faisait céder la promesse de F2 couché. Toute cote qui la compte
   deviendra fausse le jour où elle partira. ⏳ **Ce qui la remplace n'est pas
   décidé** — aujourd'hui `Validate` est le seul passage d'étape, sauf sur les
   écrans à fiche où `CHOOSE` valide déjà (Ch6). Le jour où elle part, il
   faudra dire par quoi on avance.
2. ✅ **Le téléphone COUCHÉ n'est pas une cible.** Eric, mot pour mot : *« mon
   petit portable en mode paysage on s'en fout »*. Une cote qui ne tient que
   là ne bloque plus rien — et le seul endroit où F2 cédait était là.
   ⛔ Cela ne dit RIEN de l'iPad couché, qui reste une cible (c'est lui qui a
   imposé la composition à trois colonnes de F1).
3. ✅ **Le plafond de F2 : SEULEMENT EN SECOURS.** *« Si ton tweak n'intervient
   qu'en urgence oui, sinon non. »* — et c'est exactement ce que fait un
   `max-height` : il ne se voit pas tant que le contenu tient, il ne mord que
   quand la carte allait déborder. Rien à inventer pour obtenir ce
   comportement, il est natif. ⏳ Non posé pour autant : plus personne ne
   déborde une fois `Validate` partie et le paysage hors cible.

## 0. LA CONSTANTE, ET ELLE EST AU-DESSUS DE TOUT

> *« BELT IS ALWAYS VISIBLE »* — première ligne du croquis.

**La ceinture des dix étapes n'est jamais couverte, par aucun cadre.** Elle
n'est pas un cadre : c'est la coquille. Un cadre commence sous elle.

    hauteur mesurée : 60 px (375 × 553, le 2026-08-16)

---

## 1. LES DEUX FAMILLES

| | le menu latéral | largeur du contenu |
|---|---|---|
| **F** *(Floating)* | **gardé** — la colonne étroite de gauche | ce qui reste |
| **FF** *(Floating Full)* | **absent** | toute la scène |

Le menu latéral, c'est `.stage-aside` — `--rail-w` : **90 px** à l'étroit,
**120 px** en Large. Il n'existe que là où il y a une liste à suivre (les
douze classes, les douze espèces, les 22 arcanes).

## 2. LE CHIFFRE — ✅ ARRÊTÉ LE 2026-08-16, ET IL N'EN RESTE QUE DEUX

| | la hauteur | qui décide |
|---|---|---|
| **1** | **imposée** — une cote posée sur la fenêtre | l'écran |
| **2** | **libre** — la fenêtre fait la taille de ce qu'elle porte | le contenu |

⛔ **F3 EST MORT, ET ERIC A RAISON DE L'AVOIR TUÉ** : *« F3 me semble
inutile »*. Une longue liste n'est pas un troisième format — c'est une
hauteur LIBRE qui dépasse le champ, et elle défile pour cette seule raison.
Le troisième chiffre ne décrivait rien que les deux autres ne disent déjà.

⚠️ **ET LE SENS DE « 1 » N'A PAS BOUGÉ, C'EST DÉLIBÉRÉ** (choix A d'Eric,
2026-08-16). Une numérotation inverse avait été proposée — `1` = hauteur
libre — puis écartée : `F1` veut dire *la fiche, hauteur imposée* depuis le
15/08, et le mot est écrit dans `fiche.css`, dans `GABARIT-360-CLASS-SPECIES.md`
et dans le mandat du lot 79. **Un mot qui change de sens selon l'âge du
fichier qui le porte ne vaut plus rien** ; l'ordre des chiffres ne payait rien
d'autre.

## 2 bis. LES COTES, EN CHIFFRES

Les marges sont sur **les quatre côtés**, systématiquement, et c'est **un seul
jeton pour tout le vocabulaire** — elles ne font donc pas partie du barème.

| | jeton | étroit | grand écran |
|---|---|---|---|
| **Marge** (4 côtés) | `--sp-8` / `--sp-16` | **8** | **16** |
| **Largeur max — carte** | `--card-w` | 62 ch ≈ **625** | 76 ch ≈ **766** |
| **Largeur max — écran à contrôles** | `--panel-w` | 62 ch ≈ **625** | 88 ch ≈ **887** |
| **Largeur max — grille** | `--grid-w` | 60 ch ≈ **605** | 76 ch ≈ **766** |

⚠️ **IL N'Y A PAS UNE MESURE, IL Y EN A TROIS, ET C'EST VOULU** : une grille de
compétences n'est pas un paragraphe, une rangée de caractéristiques non plus
(§3e des jetons). Le cadre dit la marge ; c'est l'ÉCRAN qui dit de quelle
nature est sa largeur.

## 2 ter. L'ÉTAT DES LIEUX, APRÈS LE BARÈME À DEUX CHIFFRES

| | qui l'emploie |
|---|---|
| **F1** — menu, hauteur imposée | Classes, Espèces, don d'origine, Destinée en mode *choix* |
| **F2** — menu, hauteur libre | ⏳ personne |
| **FF1** — plein, hauteur imposée | ⏳ personne |
| **FF2** — plein, hauteur libre | Univers, Concept, Caractéristiques, Compétences, Équipement, Bilan, Destinée en mode *tirage* |

🔴 **DEUX FORMATS EN SERVICE SUR QUATRE.** Le builder n'est fait que de fiches
(F1) et de cartes qui font la taille de leur contenu (FF2). Le reste du
vocabulaire est disponible, pas employé.

## 3. F1 — *la fiche* · species et classes

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

## 4. F2 — *le menu, et une hauteur libre* · ⏳ aucun écran

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
* **largeur `--card-w`** : `--measure` (62 ch) à l'étroit, **76 ch** en Large.
* ⏳ **Personne ne l'emploie, et rien ne l'implémente** : aucun écran du
  builder ne pose sa hauteur aujourd'hui. Ce format est une PLACE RÉSERVÉE.

### ⭐ CE QUE TOUTE FENÊTRE FLOTTANTE PROMET — Eric, 2026-08-16

*(écrit à propos de F2, vrai de tout cadre centré à marges : 1, 2 ou 3)*

> *« Je l'ai conçue pour qu'elle puisse ressembler à une CARTE : marges
> au-dessus ET en dessous, sur mon portable — donc garanti sur la majorité
> des portables et des bureaux. »*

**La promesse n'est pas une hauteur, c'est de l'AIR EN HAUT ET EN BAS.** Une
carte qui touche les deux bords n'est plus une carte, c'est une page. C'est
donc un **plafond** qu'il faut à F2, jamais une hauteur imposée — et le
plafond doit compter ce que la carte NE VOIT PAS.

### 📏 LA PROMESSE, MESURÉE LE 2026-08-16 (Concept et Universe)

| écran | champ | Concept | Universe | ressemble à une carte ? |
|---|---|---|---|---|
| **375 × 553** — SE debout | 493 | 271 *(air 223)* | 317 *(air 177)* | ✅ |
| **1280 × 800** — bureau | 740 | 303 *(air 438)* | 349 *(air 392)* | ✅ |
| **667 × 375** — SE **couché** | 315 | 271 *(air 45)* | **317 → air −1** | 🔴 **non** |

🔴 **LE PIÈGE EST AILLEURS QUE DANS LA CARTE : LA BARRE `VALIDATE` PARTAGE LE
MÊME CHAMP, ET ELLE PÈSE 76 px.** Le budget réel d'une carte qui garde son air
n'est donc pas le champ, c'est `champ − 76 − 16`. Couché sur un téléphone,
cela laisse **223 px** : Concept en demande 255, Universe 301. Les deux
débordent, et Universe touche même le bas de l'écran (vérifié à l'œil, la
carte est coupée net par le bord).

⛔ **Ce que ce n'est PAS** : un défaut de contenu. Les deux écrans sont
sobres. C'est la promesse de F2 qui n'est tenue par aucune règle — elle tient
aujourd'hui par la chance d'avoir peu à afficher, et elle cède au premier
écran couché.

⏳ **CE QUI LA RENDRAIT STRUCTURELLE** (non fait, décision d'Eric) : un
plafond sur la carte — `max-height` = le champ moins la barre moins les
marges — et le contenu qui défile À L'INTÉRIEUR. La carte garderait alors son
air sur tout écran, et « variable à la demande » deviendrait vrai dans le seul
sens qui compte : elle prend ce qu'il lui faut, jamais plus que ce qui la
laisse ressembler à une carte.
⚠️ Le prix est connu : un second défilement dans la scène — le même que celui
des grilles de sorts. Sur ces écrans-là il n'y a aucun glisser, donc aucune
des complications payées au lot 79.

## 5. FF1 — *la fiche pleine largeur* · ⏳ Destiny

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

## 6. FF2 — *plein, hauteur libre* · Skills, et presque tout le reste

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
  Elle existe déjà, elle n'a rien à voir avec le format.
* 🔴 **C'EST UN 2** — sa hauteur est celle de son contenu. Même chose pour
  Universe, Concept, Abilities, Equipment, Review : **tout ce qui n'est pas
  une fiche est un 2 aujourd'hui.**
* ⏳ **Défaut signalé par Eric (16/08), non encore mesuré par moi** : au tout
  début du défilement, la marge supérieure manque. À mesurer dans la page
  avant d'y toucher — la cause n'est pas connue.

## 6 bis. ✅ CONCEPT EST UN FF2

La question posée hier (*« FF2 ou FF3 ? »*) est tombée avec F3. Concept n'a
aucun menu latéral et sa hauteur est celle de son contenu : **FF2**, comme
presque tout le builder. Mesuré : 271 px pour un champ de 493.

## 8. L'HABILLAGE — `D-<format>-<variante>-<plateforme>`

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

⭐ **La conclusion d'Eric tient quand même, en changeant d'invariant** : la
continuité d'écran à écran vient bien des boîtes — mais de leurs **cotes
réservées** (226 pour la colonne de lecture, 16 px pour le corps), pas d'un
rapport d'échelle.

### Le fond, et ce sont les valeurs QUI EXISTENT DÉJÀ

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

## 9. CE QUE CE FICHIER N'EST PAS

⛔ Il ne remplace pas `SOCLE.md` (qui possède quoi, les trois verbes, ce qui
survit à un redessin) : celui-là dit le MÉCANISME, celui-ci dit les FORMATS.
⛔ Il ne remplace pas la feuille : une cote se change dans `tokens.css` ou
`fiche.css`, et se **recopie** ici avec sa date. Deux sources d'accord valent
mieux qu'une source unique qu'on oublie de lire — mais elles se citent, elles
ne s'inventent pas.
