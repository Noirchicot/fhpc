# INVENTAIRE — LOT 58 « socle-rendu »

> **Ce que le lot devait faire** : poser la fondation de la refonte
> ergonomique du builder, et la PROUVER sur un écran réel (Class, B2).
> **Ce qu'il a fait** : le cadre persistant, quatre fonctions de socle, les
> règles écrites à côté du code (`ui/builder/SOCLE.md`), l'écran Class refait
> en B2, et **six défauts trouvés à l'œil que 935 tests verts ne voyaient
> pas**.

## La suite

| | |
|---|---|
| **Avant** | **906** tests, 0 échec, `EXIT=0` |
| **Après** | **935** tests, 0 échec, `EXIT=0` |

⚠️ Le code de sortie est CAPTURÉ, jamais tuyauté : `npm test > fichier 2>&1;
echo "EXIT=$?" >> fichier`. La commande le demandait explicitement — une
poussée était partie sur une suite rouge le 2026-08-13 pour avoir écrit
`npm test | grep …`, où le `grep` masque l'échec.

## 🔴 LA MESURE QUI COMPTE — le défaut §0, avant et après

**Même geste, même écran, même fenêtre (360 × 780) : acheter un palier de
compétence à 2 400 px de défilement, sur l'écran Compétences.**

| | Position avant le clic | Après | Perdu |
|---|---|---|---|
| **`main`** *(avant ce lot)* | 2 400 px | **12 px** | **2 388 px** |
| **`58-socle-rendu`** | 2 400 px | **2 400 px** | **0** |

*(Les 12 px résiduels de `main` ne sont pas zéro : c'est `recenterBelt()` qui
tire la page par son `scrollIntoView` APRÈS que `innerHTML = ""` l'a déjà
remise à zéro. Les deux moitiés du défaut §0, visibles dans le même nombre.)*

Et le second symptôme, `A-1.3` : un clic sur « Tools & Trainings » ne
catapulte plus la page — **mesuré `window.scrollY = 0`, hauteur de page ==
hauteur de fenêtre.** La page n'a plus de défilement du tout : seule la scène
en a un (B0.21a).

## Ce qui a été écrit

| Fichier | |
|---|---|
| `ui/builder/socle.mjs` 🆕 | **quatre fonctions**, ~150 lignes commentaires compris |
| `ui/builder/SOCLE.md` 🆕 | les règles, à côté du code — ce que les lots suivants liront |
| `ui/builder/shell.mjs` | le cadre persistant (`mountFrame`), les peintres, les deux verbes |
| `ui/builder/class-step.mjs` | refait en B2 |
| `ui/builder/shell.css` | le cadre, l'écran Class ; `.stage`/`.toggle-bar`/`.record-info` retirés avec leur balisage |
| `ui/builder/tokens.css` | `--touch: 44px`, `--rail-w: 84px` |
| `ui/builder/skills-step.mjs` | une ligne : `scrollIntoView` → `keepInView` |
| `tests/socle.test.mjs` 🆕 | 20 tests — 4 preuves, chacune attaquée |
| `tests/dom-stub.mjs` | `scrollTop`/`scrollLeft`/`scrollTo`/`scrollBy`, et le **rabattement** qui rend le garde mordant |

### La règle de rendu : **B**, tranchée

Le §RENDU laissait trois issues (**A** restaurer le scroll · **B** ne
redessiner que ce qui change · **C** garder la coquille). **B**, et il
contient **A** : le cadre ne meurt jamais (B), l'intérieur de la scène est
encore reconstruit d'un coup mais son défilement survit (A). Descendre B
jusqu'à la ligne de compétence, c'est écrire un moteur de diff — le
mini-framework de 2 000 lignes que la commande interdit.

## 👀 CE QUE J'AI TROUVÉ EN REGARDANT, ET QUE LES TESTS NE VOYAIENT PAS

**Six défauts. Tous sous 935 tests verts.** C'est la leçon du chantier,
vérifiée une fois de plus.

| | Ce que j'ai vu | La cause |
|---|---|---|
| **1** | Les douze fiches de classe faisaient **299 px** au lieu de 680 — « une fiche par écran » (B2.1f) tombait | la feuille de style attendait `[data-bleed]`, et **personne ne l'écrivait**. Écrit dans `renderStepContent` |
| **2** | 🔴 **`scroll-snap` ne faisait RIEN** | `scroll-snap-align` était posé sur les fiches, `scroll-snap-type` **nulle part**. Les deux vont par paire ; seule celle du conteneur allume le mécanisme. **L'invariant II.1 était mort en silence** |
| **3** | 🔴 **L'écran Review affichait 114 626 caractères dans une boîte de hauteur ZÉRO** | **collision de nom** : `render-fiche.mjs` émet déjà `<article class="fiche">`, et j'avais appelé mon conteneur défilant `.fiche`. La feuille héritait `position: absolute; inset: 0`. **C'est le piège des deux échelles typographiques, en CSS, en une heure.** Renommé `.stage` |
| **4** | Arriver sur Class déclenchait une **descente animée de 7 457 px** | `scroll-behavior: smooth` en CSS s'applique AUSSI aux écritures de script. `keepInView` et `swapContent` posent maintenant `behavior: "instant"` — restaurer n'est pas voyager. Les chevrons, eux, sont un geste : ils laissent le CSS décider (et donc `prefers-reduced-motion`) |
| **5** | Arriver sur Class posait le joueur devant **Barbarian** alors que son personnage est **Magicien** | comme le défilement EST le choix, un `Validate` poussé sans regarder aurait écrasé sa classe **en silence**. `goToStep` ouvre maintenant l'écran DEVANT le choix déjà posé |
| **6** | Le raccourci « Tools & Trainings » posait la section **au plus près** au lieu de **en haut** (2 400 → 1 653) | `keepInView(…, "y")` au lieu de `"y-start"`. Juste, mais pas ce qu'on demande à une table des matières |

⚠️ **Et un défaut d'OUTIL, dit plutôt que tu** : les clics du pilote de
navigateur expirent dans cette session (« Browser pane is hidden »). Le
parcours a donc été joué en **déclenchant les vrais écouteurs** (`.click()`
sur les vrais nœuds, `scrollTo` sur le vrai conteneur) et **regardé aux
captures**. C'est le même chemin de code qu'un doigt ; ce n'est pas un doigt.

## ⚔️ LE GARDE, ATTAQUÉ — sur disque, pas seulement en mémoire

Trois attaques réelles, code de sortie capturé à chaque fois, restauration
vérifiée par `git diff` :

| Attaque | Ce qui rougit | Sortie |
|---|---|---|
| vider `swapContent` de sa substance | **B, B bis, B ter** (3) | `1` |
| réintroduire `recenterBelt()` avec son `scrollIntoView` | **D**, seul | `1` |
| faire contourner `swapContent` par `shell.mjs` (`innerHTML = ""`) | **A** et **E**, eux seuls | `1` |
| *restauré* | — | `0`, 20 tests verts |

## ⭐ CE QUE J'AI ATTAQUÉ SANS QU'ON ME LE DEMANDE

**L'ATTAQUE 6 du garde des jetons était devenue VERTE À TORT — à cause de ce
lot.** Sa clause lisait le TEXTE du sélecteur (`\bbutton\b`) ; sa propre note
disait que ça la rendait aveugle aux boutons habillés par leur seule classe,
et citait `.belt-item` comme cas connu. En déplaçant la paire de boutons du
défaut d'origine (`Back` + `Show plan`) vers `.command-plan,
.command-validate`, **je suis passé dans son angle mort**.

Je n'ai pas déplacé la cible : **j'ai fermé l'angle mort.** Second critère,
`cursor: pointer` — le marqueur que ce dépôt pose sur tout ce qui se clique,
et jamais sur une carte inerte. **Mesuré avant de durcir : zéro violation
nouvelle** sur `shell.css` (les 13 blocs qui posent un fond sans encre n'ont
aucun `cursor: pointer`, et ils ont raison : ils HÉRITENT `var(--text)`).
Vérifié en attaquant le durcissement lui-même : désencrer `.belt-item` — le
cas que l'ancienne note nommait — **fait maintenant rougir le garde.**

Et le **padding de 32 px** est descendu à 16 px sur `.decision-card` :
mesure d'Eric (B4.3, « le coupable c'est le PADDING, qui mange 18 % de la
largeur de l'écran »), nommée une seconde fois en B7.5, jamais appliquée. À
360 px la largeur utile passe de 264 à 296 px.

## ⭐ OÙ J'AI CONTREDIT LA COMMANDE

| | |
|---|---|
| **Le popup (III.4) n'est PAS construit** | la commande le listait parmi les cinq choses à faire survivre. **Aucun écran de ce lot n'en a un** — B2 n'en décrit aucun. L'écrire aurait été l'abstraction pour un besoin imaginé que la commande interdit trois lignes plus haut. La RÈGLE est écrite (`SOCLE.md`), le code non |
| **`scroll-snap-type: proximity`, pas `mandatory`** | une fiche plus haute que le champ devient partiellement inatteignable au repos sous `mandatory`. Et le sélecteur n'en dépend pas : `nearestIndex` désigne le cran le plus proche, aimanté ou non |
| **Le rail n'est PAS cliquable** | la commande laissait le point ouvert. Le rendre cliquable poserait un geste qui MÈNE à une classe en un tap — très près de la sélection que II.1 supprime. Lecture stricte de B2.1d (« la gauche SUIT ce qu'on regarde »). **Question posée à Eric plutôt que tranchée par déduction** — c'est la faute nommée deux fois dans ERGONOMIE-BUILDER.md |
| **`Concept` n'est PAS renommé `Identity`** | l'ordre des étapes, lui, est appliqué (décision d'Eric, mesurée saine). Mais `resolved.identity` existe déjà dans `fh-char/1` et ne désigne pas la même chose — le document le signale lui-même comme « à trancher avant de coder » |

## ⚠️ CE QUE LES DONNÉES NE PORTENT PAS — mesuré, pas contourné

B2.1c décrit une fiche « **image → ambiance → features** ». Mesuré sur
`layers/srd-5.2.1-en.layer.json` :

- **aucune image de classe n'existe dans le dépôt.** Ce lot n'en dessine pas
  le cadre vide (« pas de faux magasin ») ;
- **`data.description` n'est PAS de l'ambiance** : 622 à 642 caractères de
  comptabilité de multiclassage (« *As a Multiclass Character • Gain the Hit
  Point Die from the Core Wizard Traits table…* »). L'afficher sous
  l'étiquette « ambiance » serait une étiquette fausse posée sur du texte
  juste.

**Ce qui EST porté s'affiche** : le pool FH (`data.fh_skill_pool.base`, absent
d'un personnage SRD pur — et alors la ligne ne s'affiche pas, jamais un zéro
inventé), le dé de PV, la caractéristique primaire, les sauvegardes, et les
features de **niveau 1** (`features[].level`). Les descriptions de features
(jusqu'à 3 994 caractères pour Spellcasting) restent dehors : les couper
serait effacer des mots, les afficher en entier referait les 6 628 px
d'Inheritance.

🔴 **C'est une dette de CONTENU, pas de code.** La fiche de classe est
aujourd'hui aux trois quarts vide, et ça se voit. **Il faut de l'ambiance et
des images ; personne ne peut les inventer à la place d'Eric.**

## Les mesures du cadre, à 360 × 780

| | |
|---|---|
| molette | **55 px** |
| ligne de commande | **45 px** |
| scène (le seul défilement) | **680 px** — 87 % de la hauteur |
| une fiche de classe | **678 px** — une par écran, vérifié sur les douze |
| rail | **84 px**, les **douze** classes visibles d'un coup *(B2.1g disait « probablement 4 » — le rail fait toute la hauteur, donc les douze tiennent ; aucune fenêtre glissante n'est nécessaire)* |
| cibles tactiles du cadre | **44 × 44 px** — chevrons, Show plan, Validate |

⚠️ **Les quatre barres empilées de B7.6 sont devenues DEUX** dans ce cadre :
molette + ligne de commande = **100 px, 13 % de la hauteur**. Les deux autres
(molette de catégories, barre du pool) appartiennent à l'écran Compétences et
n'existent pas encore.

## Ce que ce lot NE fait PAS

Les neuf autres écrans. Ils tournent dans le nouveau cadre — vérifié, les dix
rendent, aucun n'est vide — mais **leur contenu est celui d'avant** : Review
déverse toujours `resolved.` (14 770 px), Equipment fait 6 725 px, Inheritance
2 073. Le document dit déjà, écran par écran, ce qu'ils doivent devenir.

## La question qui remonte à Eric

**Le rail de gauche doit-il être cliquable ?** Ce lot dit non (un tap qui mène
à une classe ressemble trop à la sélection que II.1 supprime). Si la réponse
est oui, c'est une ligne — mais c'est sa décision, pas une déduction.
