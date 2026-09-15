# INVENTAIRE — LOT 209, l'habit des boutons

**Branche** `209-habit-boutons` · arbre propre · `npm test` **2242 / 2242**
📅 15–16 septembre 2026.

⛔ **CORRECTION DU 16/09 — CE RAPPORT A AFFIRMÉ UN FAIT FAUX.** Il disait *« rien n'est
poussé »*. Vérifié par `git ls-remote` : **`origin/209-habit-boutons` = `d7a45c77`**, et la
branche locale suit ce remote — **cinq des commits sont sur GitHub**, seuls les derniers sont
locaux. Je n'ai jamais lancé `git push` ; la branche a été publiée hors de cette session, et je
l'ai écrit sans le vérifier. ⭐ **L'état d'un remote se lit, il ne se déduit pas de ce qu'on a
soi-même fait.** Le geste qui reste est donc `git push`, pas `push -u` — voir §6.

> **Ce que le lot devait faire** : poser le nouveau dessin de bouton d'Eric sur tout le site,
> d'un seul geste, sans qu'aucune cote ne bouge. Lot de **peinture**.
> **Ce qu'il a fait** : tout ce qui rend ce geste possible et prouvé — mais **la peinture
> elle-même n'est pas posée**, et le §4 dit pourquoi.

---

## 1. Mes erreurs

**① J'ai violé la règle de preuve en l'appliquant.**
J'ai injecté des témoins de mesure **hors de `.app`** — donc hors du `zoom: var(--echelle)` —
tout en divisant par l'échelle. Résultat : hauteur **32,23** au lieu de 44, `Expert view` à
77,53 au lieu de 105,85. Tous mes chiffres étaient faux d'un facteur 1,3653, et **tous avaient
l'air plausibles**.
➡️ `rect ÷ échelle` ne vaut **que** sous `.app`. Un témoin posé ailleurs se mesure en px nus et
la division ment sans rien signaler. Le contrôle `el.closest(".app") !== null` est désormais
écrit dans le code plutôt que confié à la mémoire.

**② J'ai lu une capture d'écran au lieu de mesurer.**
J'ai cru reconnaître un octogone sur `Build a character`. Mesuré : `.tdc-majeur`, **351 blg,
aucun `clip-path`** — un organe plat, hors de la famille. C'est exactement ce contre quoi le
mandat prévient : *si le DOM et la capture se contredisent, c'est la capture qui ment*.

**③ Mes « huit libellés qui dépassent 105 » étaient des largeurs de texte**, relevées sans
interroger l'organe porteur. La conclusion tenait, ses chiffres non — et c'est la faute que
j'avais moi-même nommée à une session voisine deux heures plus tôt. **Un inventaire qui ne dit
pas s'il est du DÉCLARÉ ou du RENDU fera tomber quelqu'un.**

**④ J'ai choisi l'encre du bouton inactif au jugé.**
`#9a9186` rendait **2,61:1** contre le haut de la face (`#554f46`) — sous le seuil de 3, donc
pas même « gros texte », et le haut est le fond le pire, celui où le mot est centré. Corrigée à
`#c9c0b3` : **4,50:1**, et toujours plus sourde que l'encre active (5,72 contre 8,46 au centre).

**⑤ J'ai fait rougir deux gardes par ma propre faute** — `tree-immuable` (j'ai modifié l'arbre
pendant que la suite tournait en arrière-plan) et `fraction-d-ecran` (mes clés `"petit"` et
`"moyen"` sont des **noms de crans** réservés à `echelle.mjs`). Les deux avaient raison ; j'ai
changé mes mots, jamais leur loi.

---

## 2. Verdict

**Le dessin est posable sur tout le site sans toucher une ligne de balisage, c'est mesuré sur la
vraie tuile, et aucune cote de bouton n'a bougé.**

---

## 3. Le tableau mesuré

### 3.1 Le relevé avant / après — builder servi, échelle **1,3653**, sous `.app`

| bouton | AVANT *(coupe 10 · biseau 1,5)* | APRÈS *(coupe 8 · biseau 2)* | |
|---|---|---|---|
| `Open` · `Save` · `Forget` | 77 × 44 blg | 77 × 44 blg | ✅ |
| `Display` · `DM` · `Tools` | 77 × 44 | 77 × 44 | ✅ |
| le livre · le `?` | 44 × 44 | 44 × 44 | ✅ |
| corps du mot | 16 px / 600 | 16 px / 600 | ✅ |

⭐ **Identiques au centième. Seule la forme change** — le mandat exact du lot.
📌 **Et la mesure tranche une contradiction du corpus** : le bouton à mot rend **16 px / 600**,
pas `--t3` 14. La ligne T3 de la Bible était périmée ; c'est la mesure qui le dit, pas un avis.

### 3.2 La voie `border-image`, mesurée sur **ma** tuile

*(tuile reconstruite dans la page servie et contrôlée par sa **longueur** avant d'être crue :
3 534 o à 24, 3 542 à 77, 3 574 à 105 — les trois concordent avec le générateur. Une
réimplémentation qui diverge ne tombe pas juste sur trois longueurs.)*

| | |
|---|---|
| `border-image-slice` relu | ✅ `8 8 12 fill` |
| 3 largeurs, **une seule tuile** — 78,60 · 109,82 · 147,10 blg | ✅ hauteur 44 partout |
| coins à **×4** | ✅ **francs** — le SVG est rastérisé à la taille rendue |
| état **pressé** accessible en `border-image` | ⛔ **non** — voir §4 |
| encre inactive `#c9c0b3` — 4,50 / 5,72 / 7,18 | ✅ calculé ici, pas repris sur parole |
| `NORMES.md` §6 « la coupe reste 10 » | ✅ corrigée **dans le même lot** |
| gardes — **13 attaques, 13 rouges** avant d'être crus verts | ✅ |
| `shell.css` touché | ⛔ **rien**, délibérément |
| `npm test` | ✅ **2242 / 2242** |

### 3.3 Ce que le lot a corrigé au relevé du 15/09

Sept familles étaient annoncées « vrais boutons à mot, sans habit ». Vérifiées une par une :

| famille | le relevé disait | mesuré |
|---|---|---|
| `.porte-de` (20) | vrai bouton à mot | ⛔ un porte-**DÉ** — `aspect-ratio: 1`, `line-height: 0`, canvas/img |
| `.card-porte` (7) | vrai bouton à mot | ⛔ la **dalle** de Destiny R — `flex column` + `gap` + `padding` |
| `.pipeline-bouton` (9) | sans habit | ✅ **l'a déjà** — copie du patron, shell.css ~9010 |
| `.carte-r-bouton` (8) | sans habit | ✅ **l'a déjà** — même bloc |
| `.dressing-bouton` (6) | sans habit | ✅ **l'a déjà** — même bloc |
| `.aiguilleur-bouton` (5) | sans habit | ✅ **l'a déjà** — même bloc |
| `.skills-onglet` (3) | sans habit | ✅ **exact** — seule ligne juste du relevé |

➕ **Deux familles manquaient**, vrais boutons à mot, cible tactile 44 déjà en place :
`.review-porte` *(Expert view · Export JSON · Export HTML)* et `.tuto-pied button`
*(I understand)*.
⛔ `.card-action` et `.card-draw-btn` sont du **CSS orphelin** — zéro occurrence dans le balisage.

📏 **Un écart à connaître avant de mesurer** : le plancher des gabarits *(shell.css ~8903)* ne
couvre que **six** des huit porteuses. `.tray-bouton` et `.ability-entry` portent l'habit **sans**
la cote 77 ; leur largeur vient d'ailleurs. Qui l'ignore lit deux cotes et croit à une régression.

📏 **Les largeurs réelles de la famille**, mesurées sous `.app`, hauteur 44, avec deux témoins de
contrôle qui prouvent la méthode avant le résultat *(`Export HTML` dans un `.parcours-pied` →
**77,00**, le plancher ; `Inheritance.bouton-moyen` → **105,00**, le gabarit)* :

```
.review-porte       Expert view 105,85 · Export JSON 113,69 · Export HTML 115,46
.tuto-pied button   I understand 128,64 · Turn tutorials off 159,44
```

Cinq largeurs distinctes, **aucune à 77 ni à 105** — `Expert view` rate le gabarit large de 0,85.
⭐ C'est ce qui justifie un **générateur** plutôt que deux fichiers : la recette interdit
l'étirement *(« aucune multiplication des anciens sommets par W/77 »)*, et le site pose
`min-width`, pas `width`.

---

## 4. Ce qui reste, et pourquoi

### 4.1 🔴 Une limite révélée par la mesure, absente de toute note préalable

En `border-image`, **le document ne peut pas atteindre le DOM interne du SVG**. `data-state` est
donc inaccessible : seul le groupe `fh-rest` s'affiche, quoi qu'on écrive.

- le groupe `fh-pressed` est du **poids mort** — 228 octets sur 3 534, transportés à chaque
  chargement pour rien ;
- **l'état pressé demandera une SECONDE tuile** *(le `cap` à y = 2)* et une permutation de
  `border-image-source` — pas une translation, pas un réglage.

⭐ Non bloquant aujourd'hui : relevé le 15/09, la feuille ne porte **aucun `:active`** — l'état
pressé n'est câblé nulle part. Mais cela change le prix du lot qui câblera l'enfoncement, et
touche la recommandation du 211 *(« les autres formes s'enfoncent seulement »)* : par
`border-image`, l'enfoncement coûte une tuile de plus **par forme**.

### 4.2 ⛔ `shell.css` n'est pas touché — c'est un refus motivé

Ce qui est prouvé, c'est que la **voie tient**. Poser l'habit sur les huit familles dépend de deux
arbitrages d'Eric **ouverts depuis le 15/09 au matin**, et peindre sans eux serait décider à sa
place :

> **① Les trois candidates — `.skills-onglet`, `.review-porte`, `.tuto-pied button` — prennent-elles
> le nouveau dessin ?** Les trois portent déjà la hauteur 44. Risque mesuré sur `.skills-onglet`
> seul : son mot vit dans un `<span>` à `--skills-ligne`, plus court que 44.

> **② Le duplicata de l'Équipement diverge-t-il ou fusionne-t-il ?** `shell.css` ~9010 porte une
> **copie mot pour mot** du patron du socle, pour six sélecteurs du chapitre Équipement. Repeindre
> le socle sans y toucher laisserait le site avec **deux habits**.

### 4.3 ⚖️ Deux cotes ont bougé, et pas du fait d'Eric

`--bouton-coupe` **10 → 8** et `--bouton-biseau-epaisseur` **1,5 → 2** ont été décidées par la
session `documents-08` **sous délégation explicite d'Eric** — *« prends la décision pour moi ça me
saoule »*, 16/09. ⛔ **Ce n'est donc pas une décision d'Eric** : il a regardé et approuvé **le
dessin**, pas ces nombres. Le bouton hybride *(coin 10 + rebord 2)* n'a jamais été validé par
personne — c'était un objet fabriqué pour poser une question.

C'est écrit ainsi dans `tokens.css`, dans `NORMES.md` §6 et dans le commit : **une ligne à défaire**
si l'architecte juge que la coupe devait rester à 10.

⚠️ `NORMES.md` §6 `bouton-pans-coupes-nus` écrivait *« la coupe extérieure reste `--bouton-coupe`
10 »*. La phrase est corrigée **dans le même lot** : laissée en place, la prochaine régénération
de la Bible aurait republié 10 contre une feuille à 8. **Une cote qu'on change sans corriger la
phrase qui la nomme sera ressuscitée par sa propre documentation.**

### 4.4 Ce qui n'a pas pu être fait

- **Le banc n'a jamais été ouvert.** `preview_start` lit le launch.json du répertoire de
  **lancement** de la session, pas du worktree : le serveur sert `/Users/Eric/tools/fhpc`, où le
  banc n'existe pas. Depuis une session isolée en worktree, le launch.json de `main` est hors de
  portée. ⛔ Le mandat interdit un serveur lancé au shell ; la consigne n'a pas été desserrée, y
  compris quand une session voisine en a proposé la voie. Les preuves ont été prises autrement —
  en reconstruisant la tuile dans la page déjà servie, avec contrôle par longueur.
- **La matrice souris × doigt** n'a pas été éprouvée : aucun geste tactile n'a été testé.

---

## 5. Les fichiers du lot

| fichier | ce qu'il fait |
|---|---|
| `ui/builder/bouton-relief.mjs` | la géométrie, recalculable à toute largeur · **non branché** |
| `ui/builder/banc-boutons.html` | le banc : 3 gabarits × 5 états × 2 thèmes, sur fond d'image, + la voie `border-image` |
| `tests/bouton-geometrie.test.mjs` | 6 gardes — dont la reproduction **à l'octet** des deux SVG d'origine |
| `tests/bouton-inventaire.test.mjs` | 5 gardes — l'inventaire des porteuses, figé |
| `tests/bouton-relief.test.mjs` | **adapté** : il exige que la feuille et le générateur soient d'accord |
| `tests/fixtures/bouton-relief-{77,105}x44.svg` | les deux SVG d'origine, en **témoins** |
| `ui/builder/tokens.css` | les deux cotes, avec leur raison et leur délégation |
| `ui/builder/NORMES.md` | §6 corrigé |

⛔ **Ne jamais régénérer un témoin pour faire passer un garde** — ce serait effacer la référence
pour sauver la copie.

---

## 6. Le geste qui reste

La branche est **déjà sur `origin`** *(voir la correction en tête)* : il ne reste qu'à pousser
les commits qui lui manquent.

```bash
git -C ~/tools/fh-worktrees/209-habit-boutons push
```

---

## 7. Ce que ce lot a corrigé dans `NORMES.md`, et ce qu'il a laissé

**Corrigé** — deux règles, parce que §6 en porte **deux** sur le bouton et qu'en corriger une seule
donne exactement la confiance d'avoir corrigé le bouton :

| règle | ce qui était faux | ce qui est écrit |
|---|---|---|
| `bouton-pans-coupes-nus` *(1500)* | « la coupe extérieure reste `--bouton-coupe` **10** » | ratré, **8** depuis le 16/09, avec sa raison et sa délégation |
| `bouton-deux-largeurs` *(4543)* | « texte **T3** », « **deux** largeurs et deux seulement », « **Non tranché** » | **16 px / 600** *(Eric, 15/09 : « garde 16 et corrige la règle »)* · **petit · large · libre** · tranché |

⛔ **Laissé, et signalé plutôt que décidé** :
- 📍 `bouton-large-renomme-medium` *(26/08, vivante)* dit **« `large` s'appelle désormais
  `medium` »** — **l'inverse exact** du renommage d'Eric du 15/09. Les deux ne peuvent pas être
  vraies ensemble. C'est un arbitrage d'Eric, pas une correction d'écriture.
- L'identifiant `bouton-deux-largeurs` est devenu un **faux nom** : il dit « deux », la règle en
  porte trois. ⛔ On ne renomme pas un identifiant sous un lien.
- **Cinq autres lignes disent encore T3 pour un bouton** *(≈ 930, 2563, 3946, 4860, 4861)*. Elles
  parlent d'autres organes ou d'autres étages, et **trois corps coexistent réellement dans le
  site** — 16/600, 14/600 *(Identity)*, 14/400 *(Skills)*. Les corriger sans les mesurer une par
  une referait la faute que ce lot vient de payer.
- ⛔ Le **code** garde `--bouton-moyen` et `.bouton-moyen` : **aucun `--bouton-large` n'existe**.
  Dans une feuille on écrit `moyen`, dans le corpus on dit `large`. Le renommage du jeton est un
  lot à lui seul.

⭐ **La leçon, et elle est la jumelle de mon erreur ③** : *un chiffre juste sur le mauvais organe*
devient ici *une phrase juste sur la mauvaise règle*. Deux règles voisines, même §6, même objet —
corriger l'une donne le sentiment d'avoir corrigé l'objet.
