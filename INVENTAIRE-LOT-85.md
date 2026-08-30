# LOT 85 — LE ZOOM, ET LE `blg`

> Eric, 2026-08-30 : **« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT
> NULLE PART. Tout grandit de manière proportionnelle. »**

**Deux règles CSS ajoutées, trois mécanismes supprimés, zéro cote modifiée.**

---

## 1. Ce que le lot fait

```css
.app { zoom: var(--echelle); height: 100%; }   /* shell.css */
html, body { height: 100dvh; }
```

À partir de ces deux règles, **chaque `px` des cinq feuilles est un `blg`** — l'unité
de dessin. Les 265 valeurs en pixels du dépôt en étaient déjà ; il leur manquait la
déclaration qui le dit.

| | |
|---|---|
| ➕ | 2 règles CSS · le jeton `--echelle` · `ui/builder/echelle.mjs` · une ligne dans le Menu |
| ➖ | la grandeur Large (`@media min-width: 1140px`) · l'homothétie `--u` de la carte · **tous** les `@media` de largeur |
| ✏️ | 4 gardes réécrits · 2 gardes neufs · CADRES §2 bis · NORMES §0 bis et §4 quater |
| 🔒 | **aucune cote de dessin touchée** |

---

## 2. Pourquoi `zoom` et pas les trois autres pistes

| piste | pourquoi non |
|---|---|
| **multiplier les jetons** (`calc(16px * var(--u))`) | ne tient pas la loi : **167 valeurs en px brut** (filets, ombres, géométrie) resteraient sur place. Et c'est ce que faisait `--cd-fs` au dock v1 — **TRAPS.md §17-18** en a le rapport d'autopsie : *« moved the fonts but left the width pinned »*, plus un cycle silencieux |
| **`rem` partout** | la méthode la plus rodée du web (Bootstrap, Tailwind, MUI, Primer) — mais elle ne fait suivre que ce qui est écrit en `rem`, et elle hérite du réglage de police du navigateur : **une seconde échelle invisible** |
| **`transform: scale()`** | il peint **après** la mise en page : celle-ci ne sait jamais qu'elle a été agrandie. Le clamp de la carte, le rail et les seuils liraient une largeur inventée. C'est la bonne réponse pour un kiosque, dont la composition ne s'adapte jamais |
| **`zoom`** | ✅ change **l'unité avant** la mise en page. Tout ce qui interroge la place — `100%`, `100cqh`, le clamp — reçoit une réponse **vraie** |

---

## 3. Ce que le banc a mesuré

Chromium, les vraies feuilles, écran Species, 4 fenêtres × 5 crans.
*(Banc jetable, hors dépôt.)*

### Ce qui marchait tout de suite

| organe | ×1 | ×1,5 | ×2 | ×3 |
|---|---|---|---|---|
| ceinture | 60 | 90 | 120 | 180 |
| rail | 90 | 135 | 180 | 270 |
| dalle | 269×440 | 404×660 | 538×880 | 807×1320 |

Exactement × le cran, sur les quatre fenêtres. Aucun ratio n'a bougé.

### 🔴 Les trois défauts trouvés — aucun n'aurait été vu à la relecture

**1. `zoom` ne rebase pas `vw`/`vh`.** À 360×640 au cran 5, `scrollHeight` rendait
**3200** dans une fenêtre de 640 : toute l'app débordait, cadre compris.
→ `.app` passe de `height: 100dvh` à `height: 100%`, `100dvh` remonte sur `html, body`.
C'était **la seule unité de viewport de toute la coquille** — et c'est pour ça que le
mode widget ne demande rien de plus.

**2. `zoom` ne réévalue jamais les `@media`.** À 1920 au cran 5, `min-width: 1140px`
matchait encore : `--rail-w` rendait 120 blg = **600 px réels**. À 1024 au cran 1,5
(fenêtre effective 683 blg, **sous** le seuil étroit), le drapeau annonçait `wide`.
→ tous les `@media` de largeur supprimés ; la grandeur devient `data-grandeur`, calculé
par `echelle.mjs` sur `innerWidth / échelle`. **Un garde neuf interdit d'en réécrire un.**

**3. L'homothétie de la carte devenait non monotone.** À 1920 : `625 → 781 → 937 →
**1420** → **920**`. Elle rétrécissait en zoomant.
→ supprimée. Eric l'avait dit avant la mesure : *« la carte s'adaptait car je voulais
que ça soit joli sur 2 proportionnalités différentes, donc là ça devient hors sujet »*.

### Après correctifs — 4 fenêtres × 5 crans

`cadre : tient` · `débordement du document : non` · rail et dalle **× le cran, exactement**.

La scène lit la fenêtre **en blg** : à 1920 elle rend 1830 · 1190 · 870 · 550 aux crans
1 · 1,5 · 2 · 3. C'est la fenêtre exprimée dans la nouvelle unité.

---

## 4. Le réglage

`ui/builder/echelle.mjs` — un organe, un propriétaire.

**Cinq crans, plancher 1** *(décision d'Eric : « le plancher c'est la taille 360 sur
laquelle on travaille »)* : `1 · 1,25 · 1,5 · 2 · 3`.

**Auto par défaut** — le plus grand cran que la fenêtre justifie ET qui laisse de quoi
dessiner :

| écran | cran auto | corps |
|---|---|---|
| iPhone 360 · colonne VTT 480 · 768 | **1** | 16 |
| iPad 1024 | **1,25** | 20 |
| bureau 1920 | **2** | 32 |

⭐ **Le téléphone et la colonne de VTT restent au cran 1** — donc zéro régression
visuelle là où Eric teste, par construction et pas par promesse.

**Dans le Menu**, sous `Tutorials` : `Auto · Standard · Large · Larger · Huge · Giant`.
⛔ **Les crans qui ne tiennent pas sont grisés, jamais clampés** — un réglage qui se
transforme en un autre est un réglage qui ment. Mesuré au navigateur : à 360 seuls
`Auto` et `Standard` sont offerts ; à 480, `Large` s'ajoute ; à 1920, les six.

📌 **Le Menu existait déjà** — onglet de la ceinture, classe `belt-onglet`. La ligne
coûte **zéro hauteur fixe** : la ligne de commande supprimée le 15/08 (*« 45 px sur les
dix écrans pour deux boutons »*) n'est pas rouverte.

---

## 5. Le mode widget

Mesuré : le builder dans un cadre de **380 × 700** sur une page de 1920.
Scène = **290 blg** au cran 1, **100 blg** au cran 2, **aucun débordement**.

Le `zoom` est posé sur `.app` et pas sur `:root` : `.app` se mesure alors sur son
parent, donc le builder remplit ce qu'on lui donne — plein écran, iframe, ou `<div>`
dans la page d'un VTT.
⚠️ **Testé en iframe, pas en `<div>` monté** : c'est là que le choix de `.app` compte
vraiment, et ce cas-là reste à mesurer le jour où le dock existe.

---

## 6. Les renversements, datés

Chacun est écrit à sa place, avec sa raison — un lot futur qui voudrait « réparer »
doit d'abord rouvrir la ligne avec Eric.

| ce qui est renversé | où | pourquoi |
|---|---|---|
| **« T1–T4 ne bougent pas »** *(tokens.css §69)* | `tokens.css` | au cran 3 le corps vaut 48 blg. La loi du 30/08 est plus récente et plus générale |
| **« plafond d'échelle u = 1 »** — l'Araag *(NORMES §4 quater)* | `NORMES.md`, `fiche.css` | il bornait une croissance **subie** ; le zoom est **choisie**. Même goût, mécanisme opposé |
| **la seconde colonne de CADRES §2 bis** (766 · 887) | `CADRES.md` | une largeur qui double sur grand écran pendant que `--sp-8` ne bouge pas change un rapport |
| **« le pied est HORS homothétie »** | `fiche.css`, `NORMES.md` | la loi ne dit plus *« fixe »*, elle dit **« jamais moins »** — sur une échelle qui ne descend jamais sous 1, c'est la même promesse au doigt |

---

## 7. Les gardes

**Neufs**

- `tests/echelle.test.mjs` — 14 clauses : la grandeur se lit en blg (avec l'attaque qui
  prouve que lire la fenêtre brute donnerait une autre réponse) · la largeur voulue et le
  plancher sont **lus dans les jetons**, jamais recopiés · `appliquerEchelle` n'écrit que
  deux attributs · le cran est borné · `localStorage` qui jette ne fait rien tomber.
- **`garde 5 bis`** (`ui-jetons`) — 🔴 **aucune requête média de LARGEUR dans
  `ui/builder/`**. C'est le garde qui attrape le piège que ce lot a découvert : une telle
  requête serait juste au cran 1 et fausse à tous les autres, *silencieusement*. Les
  requêtes de préférence et d'orientation restent permises.

**Réécrits — intention inchangée, adresse ou expression nouvelle**

| garde | ce qui change |
|---|---|
| `garde 5` (`ui-jetons`) | il gardait « 720 une seule fois, dans shell.css ». Il garde maintenant **720 ET 1140**, une fois chacun, dans `echelle.mjs` |
| `garde 7` (`ui-jetons`) | une exception nommée de plus : `echelle.mjs` écrit `--echelle` en ligne — une valeur **calculée** ne peut pas vivre dans une feuille. Une attaque prouve que l'exception est réelle et **étroite** (un seul `setProperty`) |
| `ui-grandeur-large` | il gardait un bloc `@media` supprimé. Il garde le bloc `[data-grandeur]` : **aucune couleur** (inchangé) et **aucune cote** (la clause qui remplace « T1–T4 ne bougent pas », et qui est plus large qu'elle) |
| `desktop-fini 4` | le contrat de l'amorce est mot pour mot le même, porté par `[data-grandeur="large"]` |
| `fiche-moule` | il exigeait `height: calc(var(--u) * 396 + 44px)`. Il interdit maintenant que **toute** échelle locale réapparaisse dans la carte |
| `socle E ter` | `resize` passe par `surRedimensionnement` (l'échelle se repose avant le redessin). Le test vérifie le **corps** du gestionnaire, plus son nom : `refresh`, jamais `openSurface` |
| `corpus-normes` | il résout un cran de `var()` avant de comparer à CADRES, et **interdit le retour** des cotes Large dans la table |
| `fiche-360 garde 6` | `--fiche-dalle-w` a déménagé sur `:root` (`echelle.mjs` en a besoin pour borner les crans) — même geste que `--fiche-h` le 23/08 |

---

## 8. État de la suite

```
avant : 1268 tests · 1256 verts · 12 rouges
après : 1284 tests · 1272 verts · 12 rouges
```

**+16 tests, exactement les mêmes 12 rouges** — toutes `Cannot find package 'ajv'`,
la dépendance de dev absente du conteneur de mesure. Aucun garde CSS, jeton ou UI n'est
rouge.

---

## 9. Ce qui reste ouvert

1. **Le plafond des crans.** Eric a donné un ordre de grandeur — *« sur mega écran zoom
   x5 »* — et la formule lui donne raison (un 4K non mis à l'échelle demande ×4,94).
   **3** est posé comme défaut défendable ; monter à 5 est **un chiffre** dans
   `CRANS`, et rien d'autre.
2. **Le dock en `<div>`.** Le mode widget est mesuré en iframe. Le jour où le dock
   existe, remesurer — c'est là que le choix de `.app` plutôt que `:root` se paie.
3. **Le cotage complet.** Eric : *« tous nos organes sont cotés, ceux qui ne le sont pas
   le seront »*. Sous `zoom` ce n'est **plus un prérequis** : un `1px` brut au fond de
   `shell.css` est un blg qu'on n'a pas baptisé — il grandit correctement, il est juste
   introuvable le jour où il rebouge. Reste 73 filets, 31 ombres et 20 géométries à
   remonter en jetons nommés. **Un lot de rangement, à son heure, qui ne bloque rien.**
