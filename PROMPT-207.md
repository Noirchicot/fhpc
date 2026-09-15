# Lot 207 — le belt · prompt autonome

**Worktree** `~/tools/fh-worktrees/207-belt-dominant`, branche `207-belt-dominant`, sur `main = 26250f0`.
Cinq commits déjà posés, **2220 verts**. `npm test` avant chaque commit. ⛔ **Jamais `git push`.**
Serveur : `preview_start` nom **`fhpc-207`** → `http://localhost:8907/ui/builder/index.html`.

---

## 1. LA LOI DU RAIL — un seul actif, et c'est lui qui grossit

> **Il y a exactement UN élément actif sur le rail à la fois : une tuile OU un astre.**
> L'actif grossit et porte le halo. **Tout le reste** rétrécit et s'efface.

⛔ **QUATRE AXES INDÉPENDANTS, et aucun n'en commande un autre.** Eric, 15/09 :
*« le voile n'est pas un zoom »*. Un voile est une TRANSPARENCE, une taille est une DIMENSION,
un cran de texte est un BARREAU D'ÉCHELLE, un halo est une OMBRE. Les écrire séparément.

| l'axe | l'actif | tout le reste |
|---|---|---|
| ① **la taille** *(dimension écrite)* | **45** | **41** |
| ② **le voile** *(transparence de la dalle)* | plein | **10 %** |
| ③ **le texte** *(un cran de l'échelle)* | `--t2` | `--t1` |
| ④ **le halo** *(une ombre)* | **oui** | non |

⛔ **La cible tactile vaut 44 partout, sur les quatre états** — elle n'est aucun de ces axes.

⭐ **LE TEXTE CHANGE DE CRAN, IL NE SE MET PAS À L'ÉCHELLE.** Eric, 15/09 : *« le texte descend
d'un incrément plutôt que de dézoomer aussi »*, *« idem sur l'agrandissement »*.
➡️ inactif **`--t1`** (10) · actif **`--t2`** (12). Un cran de l'échelle, dans les deux sens.
⛔ Jamais un facteur sur `font-size` : l'échelle du dépôt a des barreaux, on saute d'un barreau.

⚖️ Eric, 15/09 : *« soleil actif : augmente la cote du soleil (45), qui reste à gauche, mets-lui un
halo, tout le reste passe à un voile à 10 % et rapetisse de 10 % (bref à 41). Idem quand lune
active. »* · *« 41 astres, 41 tuiles non actives, 45 tuile active. »*

⛔ **L'astre actif NE BOUGE PAS DE PLACE** — le soleil reste à gauche, la lune à droite.
⚠️ Le voile inactif vaut **35 %** aujourd'hui (`--voile-simple`). Il passe à **10 %** : c'est
probablement ce qui rendait la dominante invisible — 35 contre 50 ne se voit pas.

---

## 2. LES COTES ARRÊTÉES — ne pas les recalculer

```
--belt-tuile       41px   la tuile NON active · le dessin des astres
--belt-tuile-dom   45px   la tuile active · l'astre actif · la pleine lune
--astre-cible      44px   = --touch, la cible tactile, partout
--sp-4              4px   la marge des astres au bord
```
⛔ **Une cote DONNÉE bat une cote DÉDUITE.** Ce sont ses chiffres, ronds. Ne pas les réécrire en
`44 × 0,95`.

**La tuile** : nom (`--t1`) au-dessus · pastille **15,4** *(−30 %)* · 3ᵉ ligne (`--t1`) sur l'active
seulement. Largeur = un tiers de la piste moins ses gouttières, modulée par `--belt-part`.
**Les astres** : soleil → Menu, croissant → Sheet, **pleine lune → le volet secondaire** (+10 %,
non branchée, lot de la double vue). Images : `ui/builder/assets/belt/*.webp`, disque **154** dans
un cadre de **160**, sans perte.
**Encre des astres** : noire sur le soleil, blanche sur la lune, **en jetons** *(le garde 3 refuse
une couleur littérale)*. Un astre ne bascule pas avec le thème.
⛔ **Pas de contour sur les astres** — *« inutile et moche »*.

---

## 3. LES QUATRE PIÈGES DÉJÀ PAYÉS — ne pas les repayer

1. ⛔ **N'AJOUTE JAMAIS DE `zoom`. Écris des dimensions.** Un `zoom` posé sur la tuile s'annule
   tout seul : il met à l'échelle jusqu'au `100%` que le `calc` lit chez le parent — base
   `parent/p/3`, remultipliée par `p` → les trois tuiles identiques (mesuré : dominante 79,4
   contre normale 80, l'inverse du but).
   ⚠️ **À NE PAS CONFONDRE AVEC LE ZOOM DU DÉPÔT**, qui lui est la loi : `zoom: var(--echelle)`
   sur `.app` (`shell.css:94`) — Eric, 30/08 : *« TOUT LE BUILDER SUIT LE ZOOM, les ratios ne
   changent nulle part »*. C'est lui qui définit le **blg** : *un blg est ce que vaut un px de
   feuille UNE FOIS le zoom appliqué*. Toutes les cotes de ce lot sont en blg et le suivent.
2. ⛔ **La rangée flex étire les tuiles.** `align-items: stretch` écrase toute hauteur écrite.
   `align-self: center` sur la tuile, sinon l'écart de hauteur est nul quoi qu'on écrive.
3. ⛔ **`min-height: var(--touch)` relève la tuile de 41 à 44.** Une tuile EST un bouton.
   **La sortie, tranchée par Eric : le DESSIN rétrécit, la CIBLE garde 44.** La dalle peinte est un
   pseudo-élément à la cote, centré dans une cible qui ne bouge pas. ⛔ Ne jamais baisser
   `min-height` : *un contrôle ne se laisse pas dimensionner par un dessin*.
4. ⛔ **`getbbox()` compte le halo d'alpha 1.** En recadrant une image d'astre, seuiller à
   **alpha > 8**, sinon le disque utile rétrécit et deux astres de même cote paraissent inégaux.

**Deux gardes ont déjà mordu, et ils avaient raison les deux fois** — `belt-deux-largeurs` tient
*« la largeur se déduit de la piste »* et *« l'écart de la piste réserve la place du chevron »*.
Si un garde rougit : **suivre sa loi, adapter son expression, jamais le desserrer.**

---

## 4. CE QUI RESTE À FAIRE

1. **Le modèle d'état ci-dessus** — l'astre devient un état actif possible, au même titre qu'une
   tuile. Un seul écrivain décide qui est actif.
2. **Le voile inactif à 10 %.**
3. **Le halo sur l'actif** — il existe (`--spy-halo`) mais ne se voit pas. ⚠️ Mesuré : **0,65 la
   nuit, 0,45 le jour** — le jour est 31 % plus faible. Le rendre franc dans les deux thèmes.
4. **Les tuiles sont coupées** *(mot d'Eric)* — mesurer le débordement réel avant de conclure ;
   la dernière fois que je l'ai « vu », rien ne débordait.
5. **Le centrage** — le rail doit CENTRER la fenêtre en cours ; aujourd'hui `keepInView` la garde
   seulement *en vue*.
6. **La taille du texte dans les tuiles.**
7. **La troisième ligne** — la couture existe (`state.fenetre` → `fenetreOuverte()`), personne ne
   l'écrit encore. Le câblage appartient au chapitre Équipement.

---

## 5. COMMENT PROUVER — et l'erreur à ne pas refaire

⛔ **Ne jamais affirmer un rendu sans l'avoir mesuré.** Trois fois cette nuit j'ai dit « c'est
perceptif » ou « c'est réparé » en regardant une image ; trois fois la mesure suivante m'a
contredit. **Mesurer d'abord, parler ensuite.**

À chaque passe : `getBoundingClientRect()` **divisé par `--echelle`** — ce n'est pas zoomer, c'est
RECONVERTIR des pixels peints en blg, l'unité dans laquelle Eric donne ses cotes. Comparer des
pixels peints à une cote en blg est une faute de mesure, pas une faute de dessin.
Mesurer l'actif ET un inactif, astres compris. Puis regarder
l'image. Puis `npm test`. Puis commettre avec un message qui dit ce qui a été **mesuré**.
