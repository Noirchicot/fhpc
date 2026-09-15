# Lot 207 — le belt · état au 15/09, après l'audit

**Worktree** `~/tools/fh-worktrees/207-belt-dominant`, branche `207-belt-dominant`, sur `main = 26250f0`.
Quatorze commits, **2228 verts**. `npm test` avant chaque commit. ⛔ **Jamais `git push`.**
Serveur : `preview_start` nom **`fhpc-207`** → `http://localhost:8907/ui/builder/index.html`.

---

## 1. LA LOI DU RAIL — un seul actif, tuile OU astre

> **Il y a exactement UN élément actif sur le rail à la fois.**

⭐ **ET LE MOTEUR LE SAVAIT DÉJÀ.** Menu est `STEPS[0]`, Sheet le dernier, et `paintBelt` écrit
`data-status` sur les **dix** items par index — astres compris. La loi n'est pas câblée : elle est
la conséquence de `state.step`, qui est un nombre unique. Il ne manquait que la **peinture**.
⛔ Un second modèle d'état (un drapeau « astre actif ») aurait été une seconde voix.

⛔ **QUATRE AXES INDÉPENDANTS, aucun n'en commande un autre.** Eric, 15/09 : *« le voile n'est pas
un zoom »*. Un voile est une TRANSPARENCE, une taille une DIMENSION, un cran de texte un BARREAU
D'ÉCHELLE, un halo une OMBRE.

| l'axe | l'actif | tout le reste |
|---|---|---|
| ① **la taille** — largeur **ET** hauteur | **45** | **41** |
| ② **le voile** | **50 %** *(`--dalle-inter`)* | **10 %** *(`--belt-dalle`)* |
| ③ **le texte** | `--t2` | `--t1` |
| ④ **le halo** | **oui** | non |

⛔ **La cible tactile vaut 44 sur les quatre états** — elle n'est aucun de ces axes.
⚠️ **Sauf l'astre allumé, qui monte à 45** : `--touch` est un **plancher**, pas une cote. Un dessin
de 45 dans une boîte de 44 serait rogné d'un demi-blg de chaque côté.
⛔ **L'astre actif ne bouge pas de place** : le soleil reste à 4 du bord gauche, la lune à 4 du droit.

🔴 **LE PIÈGE DE L'AXE ①, ET IL A COÛTÉ UNE NUIT** : 41 et 45 sont des **hauteurs**, la largeur est
une **part de piste**. Écrites séparément elles divergeaient — hauteur +9,76 %, largeur +10,5 %.
➡️ **UN SEUL RATIO**, `--belt-ratio-dom`, **lu par les deux axes**. Les cotes sont des NOMBRES
(`--belt-cote`, `--belt-cote-dom`) : CSS ne divise pas une longueur par une longueur, il divise un
nombre par un nombre. Les trois parts somment à 3, donc la rangée remplit sa piste au blg près.

---

## 2. LES COTES, MESURÉES SUR LE RENDU

```
--belt-cote        41     la tuile non active · le dessin des astres
--belt-cote-dom    45     la tuile active · l'astre allumé · la pleine lune
--astre-cible      44     = --touch, le plancher, jamais franchi vers le bas
--belt-voile       10%    le voile du belt, à LUI (⛔ pas --voile-simple, qui habille le builder)
--belt-halo        0,62   dans les DEUX thèmes (--spy-halo vaut 0,45 le jour contre 0,65 la nuit)
--sp-4             4      la marge des astres au bord, et l'écart du chevron
```

📏 **Rendu à 375 de fenêtre** : piste **207** · tuile **61,66** · dominante **67,67**
*(ratio largeur 1,0975 contre 45/41 = 1,09756 — le même)* · pastille **15,39** · astres **41 / 45**.

**La tuile** : nom au-dessus · pastille · 3ᵉ ligne sur l'active seulement *(couture posée, pas
d'écrivain — elle appartient au chapitre Équipement)*.
**Les astres** : soleil → Menu, croissant → Sheet, **pleine lune → volet secondaire** *(+10 %, non
branchée, lot de la double vue)*. Disque **154** dans un cadre de **160**, WebP sans perte, encre
en jetons, **pas de contour**.

---

## 3. LES SEPT PIÈGES DÉJÀ PAYÉS

1. ⛔ **N'AJOUTE JAMAIS DE `zoom`. Écris des dimensions.** Un `zoom` sur la tuile s'annule : il met
   à l'échelle jusqu'au `100%` que le `calc` lit chez le parent *(mesuré : dominante 79,4 contre
   normale 80, l'inverse du but)*.
   ⚠️ **À ne pas confondre avec `zoom: var(--echelle)` sur `.app`**, qui est la loi du 30/08 et
   définit le **blg** : *ce que vaut un px de feuille UNE FOIS le zoom appliqué*.
2. ⛔ **La rangée flex étire les tuiles** — `align-items: stretch` écrase toute hauteur écrite.
   `align-self: center`, sinon l'écart de hauteur est nul quoi qu'on écrive.
3. ⛔ **`min-height: var(--touch)` relève la tuile de 41 à 44** — une tuile EST un bouton. Sortie
   tranchée par Eric : **le dessin rétrécit, la cible garde 44** *(dalle en pseudo-élément)*.
4. 🔴 **DEUX ÉCRIVAINS POUR UNE SURFACE, et c'est ÇA qui rendait tout invisible.** La boîte peignait
   `--dalle-simple` sur ses 44 pendant que la `::before` peignait la cote (41/45) derrière. Les huit
   tuiles rendaient 44, **dominante comprise** — l'écart était écrit, testé, et invisible. Le liseré
   faisait pareil, d'où *« les tuiles sont coupées »*.
   ➡️ **Réparer, c'est SUPPRIMER le second écrivain, pas le recouvrir.**
5. 🔴 **`min-width: auto` laisse le CONTENU pousser un enfant flex.** Mesuré : `Inheritance` rendait
   67,61 et `Equipment` 64,44 là où la formule donne 57,95 — trois largeurs dans une rangée qui en
   promet deux, et c'est ce qui se lisait *« centrage bof »*. `min-width: 0`.
6. 🔴 **UNE LARGEUR NULLE N'EST PAS UNE ABSENCE.** Un enfant flex à zéro compte quand même sa
   **gouttière** — les deux espaceurs ajoutaient 2 × 8 blg en vue double. `content: none`, pas `0px`.
7. ⛔ **`getbbox()` compte un alpha à 1** — seuiller à **alpha > 8** en recadrant un astre.

---

## 4. CE QU'UN GARDE NE PEUT PAS DIRE — les deux trous trouvés le 15/09

🔴 **UNE SUITE VERTE NE DIT PAS QUE LA FEUILLE EST UNE FEUILLE.** Tous les gardes lisent le CSS à
travers la même expression régulière sur les accolades : ils ne savent pas ce qu'est un commentaire.
Un `*/` posé trop tôt a tué `--chevron-trait`, donc les deux chevrons du belt — **sous 2225 tests
verts**, et le symptôme était à trois organes de la cause. Deux fautes du même genre dormaient déjà
dans `dice3d.css` et `shell.css`.
➡️ `tests/css-syntaxe.test.mjs`, sur les **octets**, en amont de toute interprétation.
⭐ **La règle générale : quand tous les gardes lisent un fichier À TRAVERS le même extracteur,
aucun ne peut accuser l'extracteur.**

🔴 **UNE QUESTION SUR UN ÉCRIVAIN NE SE POSE JAMAIS À UNE CASCADE.** Mon premier garde « un seul
écrivain » lisait `regle(shellCss, CRAN)`, qui **concatène** `.belt-item` et
`.belt-item:not([hidden])`. Éprouvé en remettant le fond fautif : **resté vert** sur le défaut
exact qu'il devait tenir — le `background: none` de l'autre règle était dans le texte lu.
➡️ Il **énumère** les règles une par une et **nomme** celle qui peint.
⚠️ Et son filtre ramassait `.belt-item[data-fait="true"] .belt-index` — la pastille verte, qui a
tout droit de peindre son disque. **Un garde qui accuse un innocent se fait desserrer.**

**Deux gardes du belt ont mordu, ils avaient raison.** Si un garde rougit : **suivre sa loi,
adapter son expression, jamais le desserrer.** Et l'éprouver ROUGE avant de le croire vert.

---

## 5. CE QUI RESTE

1. ⏳ **La troisième ligne** — la couture existe (`state.fenetre` → `fenetreOuverte()`), personne ne
   l'écrit. Le câblage appartient au **chapitre Équipement**.
2. ⏳ **`Background` en tuile dominante** — 68,17 à `--t2` pour 63,67 de place, **4,50 de trop**.
   C'est le mot le plus long des huit. Aucun vide du belt ne les rend sans défaire un arbitrage
   d'Eric. **Question posée, pas tranchée.**
3. ⏳ **La pleine lune** — convertie à 154 comme les deux autres, **pas encore à +10 %**, branchée
   nulle part. Lot de la **double vue**.
4. ⏳ **Le vide aux deux bouts** — le « toujours au centre » fait que le premier cran s'affiche avec
   un vide à sa gauche, le dernier avec un vide à sa droite. C'est la conséquence du mot d'Eric ;
   **à regarder, réversible en une ligne** *(le jeton `--belt-espaceur`)*.

---

## 6. LA RÈGLE DE PREUVE

⛔ **Ne jamais affirmer un rendu sans l'avoir mesuré.** Trois fois j'ai dit « c'est perceptif » ou
« c'est réparé » en regardant une image ; trois fois la mesure suivante m'a contredit.

Mesurer en **blg** — `getBoundingClientRect()` **divisé par `--echelle`** : ce n'est pas zoomer,
c'est RECONVERTIR des pixels peints dans l'unité où Eric donne ses cotes.
⚠️ **Et choisir le bon témoin.** Calculer le contraste d'une dalle contre le jeton `--bg` ne dit
rien : le belt est posé sur **l'image de fond**, pas sur une couleur unie. Le témoin y était faux,
et il aurait « prouvé » que le voile ne sert à rien.
⚠️ **L'image du pane peut geler** : si le DOM et la capture se contredisent, c'est la capture qui
ment — forcer un redimensionnement avant de juger.
⚠️ **Le navigateur cache les feuilles** malgré `?v=630` : `fetch(href, {cache:"reload"})` sur chaque
`<link>` avant de recharger, sinon on mesure l'ancien CSS.

Mesurer l'actif ET un inactif, astres compris, **dans les deux thèmes et les deux vues**. Puis
regarder l'image. Puis `npm test`. Puis commettre en disant ce qui a été **mesuré**.

---

<sub>

**Journal.** · *15/09, nuit* — première version du prompt (cinq parties), avant le premier coup de
marteau. · *15/09, audit* — deux erreurs du prompt corrigées ici : **« `keepInView` garde seulement
en vue »** était FAUX *(l'axe `"x"` CENTRE, et il centre juste : −0,01 à +0,38 blg sur les six crans
du milieu — ce qui manquait était le MOU aux deux bouts)* ; **« l'actif : voile plein »** était FAUX
*(il vaut 50 %, `--dalle-inter` — Eric, 15/09 : « le voile passe de 35 % à 50 % »)*. Ajoutés : les
pièges 4, 5 et 6, le chapitre 4 sur ce qu'un garde ne peut pas dire, et les trois pièges de mesure.

</sub>
