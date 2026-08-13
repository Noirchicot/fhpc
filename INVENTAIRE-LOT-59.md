# INVENTAIRE — LOT 59 « décor »

> **Ce que le lot devait faire** : poser l'image de fond fixe (B0.23a/B0.23c)
> et les trois dalles à leurs voiles ratifiés (III.2).
> **Ce qu'il a fait** : ça, plus **une règle mesurée que personne n'avait** —
> sur du verre, une seule encre du système survit.

## La suite

| | |
|---|---|
| **Avant** | **935** tests, 0 échec, `EXIT=0` |
| **Après** | **953** tests, 0 échec, `EXIT=0` |

## 🔴 LA MESURE QUI A CHANGÉ LE LOT

Le lot devait « appliquer les trois dalles aux dix écrans ». En mesurant le
contraste de chaque encre sous chaque voile, sur les fonds réellement servis :

| Encre | voile 35 % | voile 50 % | voile 100 % | Cible |
|---|---|---|---|---|
| **`--text`** | **6,3 · 7,4** ✅ | **7,5 · 8,5** ✅ | 12,6 · 12,5 ✅ | 4,5 |
| `--text-soft` | 3,0 · 3,6 ❌ | 3,6 · 4,1 ❌ | 6,0 · 6,1 ✅ | 4,5 |
| `--text-muted` | 2,7 · 3,3 ❌ | 3,3 · 3,8 ❌ | 5,5 · 5,6 ✅ | 4,5 |
| `--border-strong` | 1,8 · 2,2 ❌ | 2,2 · 2,5 ❌ | 3,7 · 3,7 ✅ | 3,0 |
| `--accent` | 2,7 · 3,3 ❌ | 3,3 · 3,8 ❌ | 5,5 · 5,6 ✅ | 4,5 |

*(jour · nuit, formule WCAG, au pixel le plus défavorable du fond servi)*

🔴 **Quatre encres sur cinq échouent sur du verre, aux DEUX voiles.** Or
`--text-muted` porte tous les libellés de section, `--border-strong` toutes
les bordures de contrôle. **Poser du verre sous les écrans actuels les aurait
rendus inaccessibles**, sans qu'aucun test existant ne bronche : les gardes du
lot 38 mesurent les encres contre `--sunken`, une surface OPAQUE.

⭐ **Et la bible avait raison sans le savoir.** Elle écrivait *« verre léger =
les gros affichages — FOR/DEX, le Score, un grand nombre »* : des chiffres en
`--text`, à T7. Le verre léger n'a **jamais** été prévu pour du libellé. Le lot
n'a pas contredit la bible, il a chiffré ce qu'elle disait — et étendu aux
encres douces la règle qu'elle réservait à l'accent.

**Ce que le lot pose donc**, au lieu de repeindre dix écrans :
les trois dalles **définies** avec leurs voiles, la **règle d'emploi mesurée**
écrite en tête de `shell.css`, et un **garde qui la recalcule** à chaque suite.

## Le fond

| | |
|---|---|
| Teinte | **ardoise bleutée** — `#87939E` jour, `#354551` nuit *(retenue devant vert-de-gris minéral et prune fumée)* |
| Format | 1024 × 1792, JPEG q75 |
| **Poids** | **23 Ko** et **26 Ko** *(les sources PNG faisaient 1,94 et 1,54 Mo)* |
| Bande jour | 104–190 · mesuré **144/167** · **0 pixel dehors** |
| Bande nuit | 45–125 · mesuré **76/100** · **0 pixel dehors** |
| Texte au pire pixel, voile 35 % | **6,26:1** jour · **7,37:1** nuit |

⭐ **LE FLOU DE 5 px EST CUIT DANS LE JPEG**, pas appliqué au runtime. La bible
prévient que `backdrop-filter` coûte **une passe GPU par surface** ; un flou
cuit coûte zéro, divise encore le poids par cinq (110 → 23 Ko), et **c'est
exactement l'image que la mesure a jugée**. Aucun `backdrop-filter` n'a été
écrit.

Et le fond est **fixe sans `background-attachment: fixed`** : `.app` ne défile
pas (`overflow: hidden`, B0.21a — seule la scène défile), donc son fond est
immobile par construction. Une propriété de moins, et celle-là est connue pour
ramer sur mobile.

## 👀 CE QUE J'AI TROUVÉ EN REGARDANT

**Une dérive de 2 pixels par fiche de classe, soit 22 px sur les douze.**
`.decision-card[data-bleed]` posait `border-color: transparent` — mais **une
bordure transparente occupe toujours ses 2 px**. Avec `box-sizing: border-box`,
la boîte de contenu tombait à 678 pour un champ de 680 : le pas du défilement
cessait d'égaler le champ, et les points d'aimantation dérivaient. Invisible
sur une fiche, fatal sur douze. `border: none` au lieu de `border-color`.
Mesuré après correction : **pas 680, champ 680, dérive nulle sur les douze**.

**Et une décision de géométrie qui en découle** : la gouttière du décor est
**horizontale seulement**. Un écart vertical entre les fiches ajouterait 8 px
au pas sans les ajouter au champ — la même dérive, réintroduite à la main. Les
fiches se touchent donc verticalement, et **on ne le voit jamais** : il n'y en
a qu'une à l'écran (B2.1f). Leurs coins arrondis les séparent pendant le geste.

## ⚔️ LE GARDE — et le problème qu'il fallait résoudre

Ce dépôt n'a **aucune dépendance runtime** (loi Q3), donc Node ne sait pas
décoder un JPEG : le garde **ne peut pas relire les pixels**. La sortie n'est
pas de renoncer à mesurer, c'est de **lier la mesure au fichier** :

- `ui/builder/assets/backgrounds.measured.json` porte le **sha256** de chaque
  image et ses **deux pixels extrêmes** (le plus sombre, le plus clair de la
  zone réellement vue, après flou) ;
- le garde recalcule le sha256 du fichier **servi** — remplacer une image sans
  remesurer fait rougir ;
- puis il **refait toute l'arithmétique de la matrice** depuis ces extrêmes et
  les jetons lus dans `tokens.css`. Changer un voile, une encre, la surface ou
  l'image refait le calcul.

⭐ **Le garde affirme dans LES DEUX SENS** : `--text` **doit** passer, et les
quatre autres **ne doivent pas**. Un garde qui n'exigerait que les réussites
laisserait quelqu'un « réparer » `--text-muted` en montant le voile à 90 % —
c'est-à-dire en supprimant le verre — sans rien casser. **L'échec fait partie
du contrat : il dit que le verre a un prix.**

Trois attaques : une image altérée d'un seul octet *(le sha256 la voit)* · le
retour au voile de 20 % *(vérifie le SENS : moins de voile, moins de
contraste — la thèse du conseiller, refaite en Node)* · un fond hors bande
*(dégrade bien `--text`)*.

🔴 **Sa limite, dite plutôt que tue** : il ne décode aucune image. Si la mesure
enregistrée est fausse, il la croira. Il garantit la **correspondance** entre
un fichier et une mesure, jamais la justesse de la mesure.

## Ce que ce lot NE fait PAS

**Le fond ne respire que dans les gouttières.** Neuf écrans sur dix sont encore
**une seule grande dalle majeure** — opaque, donc le fond ne les traverse pas.
Class est le seul déjà composé de plusieurs dalles, et c'est le seul où l'on
voit le décor faire ce que B0.23b décrit.

⏳ **Ce n'est pas une dette de ce lot : c'est le travail de chaque écran.** Les
recomposer en plusieurs dalles est ce qui fera respirer le fond, et le
vocabulaire est maintenant posé pour le faire correctement — avec la matrice
qui dit quelle encre a le droit d'aller sur quel voile.

## À signaler à Eric

**Les textures n'utilisent qu'un quart de leur bande** : 21 et 23 valeurs sur
86 et 80 disponibles, écart-type 2,7 et 3,0. À l'écran, elles lisent presque
comme un aplat. **La place existe** — le texte tient à 6,26:1 et 7,37:1, très
au-dessus de 4,5 : une texture deux à trois fois plus vivante passerait
encore. Noté, non tranché.
