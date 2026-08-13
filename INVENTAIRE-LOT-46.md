# INVENTAIRE — Lot 46 `46-ecran-inheritance`

Base : `main` à `2a9d711`. Tests au départ : **740**, tous verts. Tests à
l'arrivée : **765**, tous verts (`npm test`).

Commits, dans l'ordre :

1. `6a1e8b2` — les deux fondations partagées : les mots des deux refus neufs
   de `background.boost` dans `carnet.mjs`, `renderFinalColumn` exportée
   depuis `abilities-step.mjs`.
2. `489a80a` — `confirm.mjs` et ses tests : le composant de confirmation,
   seul, avant tout écran qui s'en sert.
3. `ec50c0d` — `inheritance-step.mjs`, le câblage `shell.mjs`, `shell.css`,
   et les 13 tests de l'écran.
4. `8da4b94` — `class-step.mjs` se sert de la confirmation, et ses 4 tests.

Arbre propre après le dernier commit (`git status` vide).

---

## 1. Où j'ai mis le composant de confirmation, et pourquoi

**`ui/builder/confirm.mjs`, un fichier neuf à côté de `carnet.mjs` — pas dedans.**

`carnet.mjs` a un rôle déclaré dès sa première ligne : « LE CARNET, PARTAGÉ »,
et chacun de ses trois exports (`renderPicker`, `renderSlotQcm`,
`renderRecordChoice`) lit le carnet — `decisions[]`, via `planAt`/`planSlots`.
`renderConfirmDialog` ne lit RIEN de tout ça : pas de `decisions[]`, pas de
`document`, pas de `query`. Il ne connaît que trois choses génériques — un
titre, une liste de choses nommées, deux callbacks — et les deux callbacks
sont appelés **sans argument** : c'est l'appelant qui décide ce que confirmer
ou annuler déclenchent (exactement la loi que `carnet.mjs` énonce déjà pour
`renderPicker` : « ce module ne connaît AUCUN verbe »). Mélanger les deux
familles dans un seul fichier aurait fait de `carnet.mjs` un fourre-tout —
j'ai préféré garder sa portée nette : un fichier, une famille de composant.

Le seul consommateur aujourd'hui est `class-step.mjs`, mais le composant ne
sait rien de lui — ni le mot « skill », ni « class », ni un chemin. La preuve
est dans `tests/confirm.test.mjs` : chaque test l'instancie avec des chaînes
et des callbacks bidon, jamais un carnet fabriqué.

---

## 2. Ce que j'ai fait du plan `background` à une seule option

**Rien écrit au document.** L'écran affiche le nom du record en MENTION
(`.inheritance-frame`, un `<p>`) sous le titre de l'étape, et n'émet **aucun**
`choose({path:"background", …})`.

Mesuré avant de trancher : `decisions.mjs` (lot 43) a son propre repli à une
option, entièrement local à la PROJECTION du carnet — il permet à
`background.boost` et `background.originFeat[0]` d'exister sans qu'un
`choose` ait jamais été posé sur `background`. Mais `derive.mjs`
(`backgroundRef = takeRef("background")`, ligne 315) n'a **pas** ce même
repli : sans `choose` explicite, `resolved.identity.background` reste
`undefined` et `underived` porte `identity.background: underived.no-choice`
— un écart entre les deux fichiers, documenté par le lot 43 lui-même
(INVENTAIRE-LOT-43.md, §3, point 4, une famille de défaut voisine).

J'ai hésité entre deux lectures de « l'écran le POSE, en silence » (commande
§0) : (a) l'écran ÉMET le `choose` lui-même, sans bouton visible, pour que
`identity.background` se résolve malgré tout ; (b) l'écran se contente
d'AFFICHER le nom, sans jamais écrire au document. J'ai choisi (b), pour
trois raisons :
- Un `render()` qui déclenche un `onAction` PENDANT son propre rendu est un
  effet de bord dans une fonction pure, et `shell.mjs` rappelle `render()`
  de façon synchrone depuis `applyDecisionAction` — un `choose` émis depuis
  l'intérieur de `renderStage()` ré-entrerait dans `render()` avant que
  l'appel extérieur soit revenu. Risqué, jamais fait ailleurs dans le
  builder.
- Mesuré : `render-fiche.mjs` (l'écran Review) ne cite **jamais** le mot
  `background` — l'écart entre les deux fichiers n'a aucune conséquence
  visible aujourd'hui, sur aucun écran, y compris Review.
- Mesuré aussi : le personnage d'exemple lui-même (`src/tools/
  exemple-fh-en.mjs`) ne porte **aucun** choix `background` — c'est le
  document réel du builder qui traverse exactement le chemin (b), et rien
  n'y casse.

Je n'ai donc pas comblé l'écart `decisions.mjs`/`derive.mjs` — c'est du
moteur, hors de `ui/builder/`, et une décision qui dépasse ce lot (fallait-il
que `derive.mjs` ait le même repli, ou que l'écran écrive le choix ?). Je le
signale plutôt que de trancher à sa place.

Le cas SRD pur (4 options, condition de sortie n°6 du lot 43) N'EST PAS ce
cadre à une option : c'est une vraie liste, et l'écran réutilise
`renderRecordChoice` — le même geste que Class/Species, zéro composant
inventé pour ce cas.

---

## 3. Ce qui m'a surpris en regardant l'écran

1. **`background.boost` est verrouillé dès l'écran vide, avant le moindre
   clic.** Contrairement à `class.skills`/`species.skills` (qui restent
   `pending`, jamais `locked`, tant qu'aucun candidat n'existe —
   `multiPlan`, `src/build/decisions.mjs`), `backgroundBoostPlan` juge le
   total dès qu'il existe un plan : `points !== BOOST_TOTAL` est vrai à
   `points = 0`. Un personnage tout neuf affiche donc « 0 points spent, 3
   expected. » en rouge avant d'avoir touché quoi que ce soit. Testé et
   assumé (`tests/inheritance-step.test.mjs`, le test « SURPRISE ») : la
   commande interdit explicitement de prévenir ce refus (« tu ne le
   recalcules pas, tu ne le prévien pas »), donc je l'affiche tel quel. Pas
   corrigé côté moteur (hors `ui/builder/`), signalé pour l'architecte.

2. **`skillLabel` (`class-step.mjs`, lot 39/42) affiche des slugs bruts, pas
   des noms.** Il cherche `query({kind:"skill", id})` avec le slug de
   `class.skills[n]` (« arcana »), mais le catalogue indexe par id COMPLET
   (« srd:skill:en:arcana ») — la recherche échoue TOUJOURS, et retombe sur
   le slug lui-même. Vu à l'écran (capture, Class → Fighter) : les boutons
   du QCM affichent « arcana », « animal-handling », pas « Arcana », « Animal
   Handling ». Ce défaut préexiste à ce lot (il touche déjà les boutons du
   QCM de classe, avant toute confirmation) et ma nouvelle boîte de
   confirmation en hérite mécaniquement (elle nomme « arcana », « investigation
   », pas « Arcana », « Investigation »). Testé tel quel (pas une valeur
   idéale inventée) dans `tests/class-species-steps.test.mjs`. Non corrigé :
   la commande n'autorise à toucher `class-step.mjs` que pour le geste de
   confirmation (« c'est la SEULE raison » — commande §2b), pas pour
   réparer `skillLabel`, un helper partagé avec le QCM lui-même et avec
   `species-step.mjs` (sa propre copie).

3. **La donnée SRD de « Skilled » porte un mot en trop, collé sans
   séparation.** `data.description` de `srd:feat:en:skilled` se termine par
   `"…Repeatable. You can take this feat more than once. General Feats"` —
   `"General Feats"` est une étiquette de catégorie qui a fui DANS le texte
   de description au moment où la couche a été générée, sans son propre
   `\n\n`. Visible à l'écran (capture, carte « Skilled ») : le mot
   s'accroche à la fin du dernier paragraphe. Rien à faire côté écran (il
   affiche `description` telle quelle, découpée sur `\n\n` — c'est
   exactement ce qu'on lui demande) ; c'est une question de contenu
   (`layers/srd-5.2.1-en.layer.json`), hors de mon terrain (`ui/builder/`
   et `tests/` seulement).

---

## 4. Ce que j'ai changé de cette commande

1. **Le plan `background` à une option : affichage pur, aucun `choose`
   émis.** Voir §2 — la commande dit « l'écran le POSE, en silence » sans
   trancher si « pose » veut dire « écrit au document » ou « affiche ».
   J'ai choisi la lecture affichage-seul, pour les raisons du §2, et laissé
   l'écart `decisions.mjs`/`derive.mjs` non comblé plutôt que de le
   contourner par un effet de bord risqué dans `render()`.

2. **Le cas SRD pur (4 options) n'est pas dans la commande §2a**, qui ne
   décrit que le cadre à une option et les deux plans FH. Je l'ai ajouté
   (`renderRecordChoice`, réutilisé tel quel) parce que sans lui, un
   personnage SRD pur voit un écran Inheritance totalement VIDE — ni cadre,
   ni bonus, ni don, puisque `background.boost`/`background.originFeat[0]`
   n'existent que via le repli à une option, qui ne joue pas à 4 options
   (condition de sortie n°6 du lot 43, testée). Sans ce geste, un joueur SRD
   ne pourrait plus jamais poser d'arrière-plan — un softlock. Coût : zéro
   ligne neuve, `renderRecordChoice` fait tout le travail.

3. **`BOOST_POINT_OPTIONS = [1, 2]` déclaré dans l'écran, jamais publié par
   le moteur.** Mesuré (`decisions.mjs`, `backgroundBoostPlan`) :
   `background.boost.<clef>` ne publie AUCUN tiers numérique — son seul
   `options` est la liste des clefs elles-mêmes. La commande ne le nomme
   pas explicitement ; je l'ai traité comme un fait structurel du mécanisme
   (le plafond `BOOST_CAP = 2` du moteur), sur le même patron que
   `BUDGET_TIERS` (`species-step.mjs`, justifié là-bas pour la même raison :
   « un fait structurel, pas du contenu »).

4. **Le composant de confirmation vit dans un fichier neuf (`confirm.mjs`),
   pas dans `carnet.mjs`.** La commande laissait le choix ouvert (« à toi de
   dire lequel et pourquoi ») — tranché au §1.

Aucun désaccord de fond avec la commande : les trois piliers (le moteur
prononce/l'écran affiche, la confirmation réutilisable, le carnet désigne
quoi effacer) tiennent tels quels. Les quatre points ci-dessus sont des
décisions à l'intérieur d'une zone que la commande laissait volontairement
ouverte, pas des contradictions de ce qu'elle tranche.

---

## 5. Les tests

- **Départ** : 740 (rejoué, vert).
- **Arrivée** : 765 (rejoué, vert) — 25 tests neufs :
  `tests/inheritance-step.test.mjs` (13), `tests/confirm.test.mjs` (8),
  4 ajoutés à `tests/class-species-steps.test.mjs`.

### L'attaque manuelle

Neutralisé `onCancel` dans `class-step.mjs` : remplacé le no-op par un appel
réel à `resetSkills` (le même geste que Confirm). Suite complète rejouée :
**exactement 2 tests rougissent** — `⚔️ « Cancel » NE TOUCHE RIEN…` (le test
visé, qui vérifie qu'aucun `onAction` ne part) et, en cascade,
`tests/tree-immuable.test.mjs` (« AUCUNE SUITE NE MUTE UN ARTEFACT COMMITÉ »)
— attendu et documenté par ce fichier lui-même : il rejoue toute la suite
dans un sous-processus et refuse de juger l'arbre quand cette suite est
rouge (« le garde ne peut rien conclure d'une suite rouge »). Aucun autre
collatéral parmi les 765. Restauré par `cp` depuis une copie tampon,
`diff` byte à byte confirmé identique à l'original. Suite complète rejouée
une troisième fois : 765/765.

`npm test` final (après restauration) : **765 tests, 765 pass, 0 fail.**

---

## 6. Ce que je rends

- Ce fichier.
- Quatre commits sur `46-ecran-inheritance`, arbre propre (`git status`
  vide), SHAs listés en tête.
- Aucun `git push`, aucune fusion.
