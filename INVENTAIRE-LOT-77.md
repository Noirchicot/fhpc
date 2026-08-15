# Inventaire du lot 77 — les 24 fiches à 360

> **En clair** : les deux couches de texte sont montées (elles ne l'étaient
> nulle part), la fiche est redessinée aux cotes du gabarit, et les deux
> gardes du §3 tournent enfin sur les 24 fiches au lieu de deux.
> `npm test` : **1 111 tests, `EXIT=0`** (départ : 1 101).

---

## 1. Ce qui a été livré

| | |
|---|---|
| Les deux couches montées | `ui/builder/engine.mjs` (`LAYER_FILES`) **et** `src/tools/exemple-fh-en.mjs` (`PILE`), même ordre, en queue de pile |
| La fiche redessinée | `ui/builder/fiche.css` (neuf) + `renderFicheBody` dans `catalogue.mjs`, appelé par les deux écrans |
| Les gardes | `tests/fiche-360.test.mjs` — 340 caractères · 118 px · **et les deux piles** |
| L'exemple | `examples/personnage-fh-en-niveau1.fh-char.json` régénéré (sa `derivation.stack` porte les 7 couches) |

⛔ **`shell.css` n'a pas été touché** (un autre lot l'écrit). Le seul octet
posé dans `shell.mjs` est le correctif du §3.3 ci-dessous — une ligne, et il
répare un plantage.

---

## 2. Les mesures — toutes prises au navigateur, volet en train de peindre

**Le témoin d'images comptait 9** à la dernière lecture ; les mesures prises
à 0 image ont été jetées et refaites (le volet du navigateur gèle
`requestAnimationFrame` tant qu'il ne peint pas — c'est arrivé, deux fois).

| Cote | Attendue | **Mesurée** |
|---|---|---|
| Rail | 78 | **78** ✅ |
| Dalle de fiche | 242 | **242** ✅ |
| Colonne de stats | 118 | **118** ✅ |
| Image | 100 × 130 | **100 × 130** ✅ |
| Blurb | 226 × 160 | **226 × 160** ✅ |
| `LORE` / `CHOOSE` | 44 de haut | **44** ✅ |
| La ligne de stats la plus large des 24 fiches | ≤ 118 | **114,4** — `Weapons : Smpl+FL` (rogue) |

📌 **Le pire cas n'était pas celui que le gabarit désignait.** Il annonçait
`W. Prof. : 2` (116 px chez lui) ; sur les 130 lignes des 24 fiches, c'est
**`Weapons : Smpl+FL` du rogue** qui mène. Le gabarit le disait lui-même :
*« un autre écran peut porter pire »*. Il en portait un.

### Comment un garde Node mesure une largeur sans navigateur

`tests/fixtures/avances-t2.json` — les **avances par caractère MESURÉES** au
`measureText` du navigateur, dans la police et la taille réelles. La fidélité
du modèle a été mesurée contre la mise en page réelle, sur les 130 lignes :
**sous-estimation maximale 0,09 px**, surestimation maximale 2,04 px. Le
modèle ne ment jamais en faveur du texte — un garde qui sur-estime refuse
trop tôt, il ne laisse pas passer trop tard.

---

## 3. Trois défauts trouvés en chemin — aucun n'était dans la commande

### 3.1 🔴 `fh-fiche-en` ne pouvait pas se monter : un chemin de patch illégal

La couche écrivait `"data.fiche_stats"`. La grammaire des patchs du dépôt
(`src/layers/paths.mjs`) n'accepte **pas** l'underscore dans un segment
pointé : `TOKEN = /\.([a-zA-Z][a-zA-Z0-9]*)|\[([a-z][a-z0-9:_-]*)\]/`. La
pile jetait au montage, en nommant le chemin.

**Corrigé en suivant la convention déjà en place** — les autres couches
écrivent exactement ça : `data[skill_points]` (`fh-feats-en`),
`data[fh_skill_pool]` (`fh-skills-en`), `data[granted_skill_budget]`
(`fh-species-en`). Les 24 occurrences sont passées à **`data[fiche_stats]`**.
⚠️ C'est la couche qui était fautive, pas la grammaire : rien n'a été élargi.

### 3.2 🔴 La pile nommée « SRD + FH » est restée à cinq couches

`universe-step.mjs` portait les quatre IDs FH **recopiés à la main**, et
`currentStack()` comparait à un `ids.size === 5` écrit en dur. Une fois les
deux couches montées, la pile réelle (7) ne correspondait plus à aucune des
deux piles nommées : **l'écran Universe accusait le personnage d'exemple
lui-même** d'avoir une pile hors des deux jeux de règles — vu à l'écran, en
rouge, dès le premier chargement.

Le compte se déduit désormais de la liste, et `tests/universe-step.test.mjs`
**confronte** la pile nommée à `LAYER_FILES` au lieu de la recopier.

### 3.3 🔴 Passer de « SRD + FH » à « SRD » faisait planter la pile

`applyLayerStack("srd")` éteignait les couches **dans l'ordre de la liste**.
`fh-fiche-en` patche les trois espèces que `fh-species-en` **ajoute** (araag,
elestu, loroka) : éteindre la base d'abord laissait une couche haute patcher
dans le vide, et `src/layers/stack.mjs` jetait — à raison (§L7.2).

> `fhpc/layers: la couche « fh-fiche-en » patche species « fh:species:en:araag », qui n'est dans aucune couche sous elle`

**On démonte une pile par le haut, on la monte par le bas.** Une ligne dans
`shell.mjs`, et le test C d'`universe-step` rejoue le geste exact — c'est lui
qui a trouvé le défaut.

---

## 4. ⛔ CE QUI A RÉSISTÉ — À TOI, PAS À MOI

### 4.1 Les deux gardes passent, mais l'un des deux n'a **aucune** marge

| Garde | Verdict | Le détail qui compte |
|---|---|---|
| 340 caractères | ✅ 24/24 | le plus long : **fighter, 338** (ton texte) |
| 118 px | ✅ 130/130 | le plus large : **rogue, `Weapons : Smpl+FL`, 114,4 px** |

⚠️ **Mais la limite de 340 caractères n'est PAS conservatrice, et le garde ne
le voit pas.** Mesuré au navigateur, dans la boîte réelle de 226 px :

| Fiche | Caractères | **Lignes rendues** |
|---|---|---|
| **druid** | 337 | **10 / 10** |
| **monk** | 333 | **10 / 10** |
| **bard** | 332 | **10 / 10** |
| fighter | 338 | 9 / 10 |

**Trois blurbs remplissent déjà la boîte à ras bord.** Le nombre de
caractères est un mauvais proxy (une césure malheureuse coûte une ligne
entière) : un iPhone dont la police résout un poil plus large les fait
déborder, en silence, et le garde reste vert. **Question : est-ce qu'on
descend la limite à ~320, ou est-ce qu'on garde 340 en sachant ça ?**

### 4.2 `Dragonborn` ne tient pas dans le rail

Mesuré à T3, dans les 70 px utiles du rail de 78 :

| | Largeur |
|---|---|
| `Barbarian` (le mot sur lequel le gabarit a coté le rail) | 65,5 px ✅ |
| **`Dragonborn`** — gras (cran courant) | **80,7 px** ❌ |
| **`Dragonborn`** — normal | **77,2 px** ❌ |
| `Dragonborn` à T2, gras | 70,4 px — ça passerait, à 0,4 px près |

Le gabarit a coté le rail sur la plus longue **classe** ; il n'a jamais
regardé les douze **espèces**. Le nom est tronqué à l'écran — c'est visible
sur la capture. Les trois sorties sont toutes à toi :
élargir le rail (mais la fiche n'a pas 6 px à rendre), descendre le rail à T2
(ce que le gabarit a écarté pour la lisibilité), ou abréger le nom affiché.
**Je n'ai rien tranché et je n'ai pas posé de garde rouge.**

### 4.3 La fiche d'espèce a perdu ses traits, sa Destinée et ses points

`fh-fiche-en` ne porte, pour une espèce, que **`Type · Sz · Speed ·
Lineages`**. L'ancienne fiche affichait en plus `Destiny`, `Skill points` et
**la liste des traits** — et **ton croquis d'espèce met justement les traits
dans la moitié basse** (`Brave — advantage on saves against being
Frightened`, `Destiny — Base 2 · halfling chosen: advantage on Chaos rolls`),
là où ton croquis du Wizard met le blurb.

**Tes deux dessins ne disent pas la même chose pour cette moitié-là.** J'ai
suivi la commande du lot (boîte fixe de 10 lignes, blurb, pour les deux
écrans) et j'ai remonté l'écart au lieu de le trancher.

⭐ **Et il y a la place** : mesuré à 360 × 640, la fiche d'espèce laisse
**240 px de vide** entre le blurb et les boutons (185 px sur une fiche de
classe). Les traits y tiendraient sans rien bouger d'autre.

### 4.4 Ce qui est resté dehors, exprès

- **`LORE` et `CHOOSE` sont ÉTEINTS** (`disabled`, opacité .55). Le panneau
  `lore` plein écran et son `copier` sont hors périmètre — c'est un organe
  partagé par trois écrans, il a son lot. `CHOOSE` ouvre le 2ᵉ palier que
  `Validate` ouvre déjà : le câbler demandait de trancher lequel des deux
  gestes reste, et ça t'appartient.
- **Les 16 px de marge de page AVANT le rail** que le gabarit demande : le
  rail commence à 0. Ça se règle dans `.stage-aside`/`.stage`, donc dans
  `shell.css` — le fichier interdit à ce lot.
- **Les features de niveau 1** ont quitté la fiche de classe : plus de place
  dans la boîte fixe, et le panneau `lore` est leur destination naturelle.

---

## 5. Les gardes ajoutés

`tests/fiche-360.test.mjs` — 9 tests.

1. **340 caractères** sur les 24 blurbs, verdict en fonction pure, avec son
   attaque (une fiche à 341 est nommée ; une à 340 pile passe).
2. **118 px** sur les 130 lignes, à T2, étiquette en gras — plus une attaque
   qui prouve qu'une étiquette non abrégée rougit, et une autre qu'un glyphe
   absent de la table **jette** au lieu de compter zéro.
3. **Les deux piles sont la même liste, dans le même ordre.** C'est le garde
   du défaut que ce lot a trouvé : les couches existaient et n'étaient
   montées nulle part, et il y a *deux* endroits où les monter.
4. La **provenance** des 24 blurbs est connue, et les deux textes de ta main
   (wizard, fighter) sont toujours marqués `eric`.

### Les gardes existants qui ont bougé, et pourquoi

| Garde | Avant | Maintenant |
|---|---|---|
| `catalogue` B ter · `aria-pressed` | « la fiche ne produit **aucun** bouton » | « aucun bouton **de sélection** » — les deux actions du croquis sont nommées, et **aucun bouton ne porte de record** (plus strict que le compte qu'il remplace) |
| `catalogue` C / C bis | lisaient `.catalogue-card-row` | lisent `.fiche-stat-row`, étiquettes compressées (`Hit points` → `HP/level`) |
| `class-species` test 8 | vérifiait les lignes SRD | vérifie **en plus** qu'aucune fiche FH n'apparaît sans sa couche |
| `universe` A0 | recopiait les 4 IDs | **confronte** la pile nommée à `LAYER_FILES` |
| `versions-graphe` test 3 | 4 chargements | 5 — `fiche.css` entre, avec sa raison |

⚠️ **Le seul garde vraiment assoupli est celui des boutons**, et c'est
parce que tes croquis du 15 août mettent `LORE` et `CHOOSE` au pied de la
fiche et que le gabarit leur donne T3 et 44 px. « Zéro bouton » ne pouvait
plus être la formulation. Ce qui est gardé à la place — aucun bouton ne porte
de valeur de record — est ce que l'invariant II.1 dit vraiment.

---

## 6. Comment regarder

```bash
cd /Users/Eric/tools/fhpc-worktrees/77-fiches-360 && python3 -m http.server 8455
```

Puis `http://localhost:8455/ui/builder/index.html`, fenêtre à 360 px, molette
du haut sur **Species** ou **Class**.
