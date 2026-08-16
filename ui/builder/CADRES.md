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

## 2. LES CHIFFRES, DANS LES DEUX FAMILLES

| | hauteur | marges | contenu |
|---|---|---|---|
| **1** | **imposée** (une cote, pas le contenu) | ↕ ↔ centré | tient en un écran |
| **2** | **variable** (le contenu décide) | ↕ ↔ centré | tient en un écran |
| **3** | plein écran tenté | ↔ seulement | **longue liste** qui défile |

---

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

**Qui l'emploie aujourd'hui** : `class`, `species`, et le don d'origine.

## 4. F2 — *la carte* · Concept, Universe

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

* **hauteur : celle du contenu.** Le fond se voit tout autour, la carte est
  centrée (`margin-inline: auto`).
* **largeur `--card-w`** : `--measure` (62 ch) à l'étroit, **76 ch** en Large.

### ⭐ CE QUE F2 PROMET — Eric, 2026-08-16

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

## 6. FF2 — *la carte pleine largeur* · Skills

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

**F2 sans le menu**, plus une rangée de ronds de palier qui lui est propre.

* **largeur `--grid-w`** — ⚠️ **une TROISIÈME nature de largeur**, ni prose ni
  carte : une grille de compétences n'est pas un paragraphe (§3e des jetons).
  Elle existe déjà, elle n'a rien à voir avec F2.
* ⏳ **Défaut signalé par Eric (16/08), non encore mesuré par moi** : au tout
  début du défilement, la marge supérieure manque. À mesurer dans la page
  avant d'y toucher — la cause n'est pas connue.

## 7. F3 / FF3 — *la longue liste* ⏳

Le croquis pose **F3** (plein écran tenté, marges latérales seulement, longue
liste — le `✗∞` du dessin) et laisse **FF3 vide**. Par symétrie, FF3 serait le
même sans menu.

⛔ **Aucun écran ne les emploie aujourd'hui, et rien n'est écrit pour eux.**
Les nommer suffit ; les coter le jour où un écran les demandera.

---

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
