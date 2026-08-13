# Inventaire — lot 54 `54-ecrans-concept-univers`

> Le dernier lot du builder. À la fin, les neuf étapes sont branchées.

## 0. Départ / arrivée

- **Tests au départ** : `npm ci` puis `npm test` → **837** verts, comme
  attendu par la commande. Aucun rouge, arbre propre.
- **Tests à l'arrivée** : **876** verts (+39), aucun rouge, arbre propre.
  - 8 dans `tests/doc-writers.test.mjs`
  - 9 dans `tests/concept-step.test.mjs`
  - 13 dans `tests/universe-step.test.mjs`
  - 9 dans `tests/shell-wiring.test.mjs`
- **Branche** : `54-ecrans-concept-univers`, coupée de `main` à `e32daf3`
  (remesuré : `git -C ~/tools/fhpc rev-parse --short main` → `e32daf3`,
  identique à ce que la commande annonçait).
- **Commits** et **SHAs** : voir le bas de ce fichier (posés après relecture,
  avant que je republie cet inventaire).
- Aucun `git push`, aucune fusion.

## 1. La forme donnée aux écrivains importables

Le trou mesuré par l'architecte (§1 de la commande) : `doc.rename` et
`doc.describe` sont **purs** (le lot 47 l'écrit noir sur blanc pour
`rename` ; `describe` est bâti pareil, lot 48), mais ils n'existaient que
dans la fermeture de `createDoc({storage, bus, schema, now})`, qui **refuse**
de se construire sans magasin (`store.mjs:83`, désormais renuméroté). Le
navigateur n'a aucun magasin `fh-char/1`, et l'arbitrage de l'architecte
était ferme : ne pas monter `doc` avec un faux magasin en mémoire.

**La forme retenue** : `src/doc/writers.mjs`, un nouveau fichier qui exporte
une seule fonction, `createDocWriters({schema})`. Elle ne prend QUE le
schéma (le seul intrant dont `rename`/`describe` ont réellement besoin —
compilation du validateur de brouillon, `SCHEMA_TAG`, `DESCRIBABLE_FIELDS`)
et rend `{rename, describe, assertValid, DESCRIBABLE_FIELDS, SCHEMA_TAG,
compiled}`. Le corps de `rename`/`describe` est **repris mot pour mot** de
ce qu'il était dans `store.mjs` — aucune ligne de logique n'a changé, le
fichier a seulement changé d'adresse.

**`store.mjs` ne recopie plus rien** : `createDoc` appelle
`createDocWriters({schema})` une fois, et pose ses fonctions comme verbes
par **raccourci de propriété** (`rename,` / `describe,` — pas
`rename(payload) { … }`). Le verbe du bloc et la fonction que
`ui/builder/` importe sont donc **littéralement la même référence de
fonction**, jamais deux copies qui pourraient diverger. `assertValid` (le
chemin d'admission commun à TOUS les verbes du bloc — `create`, `open`,
`save`, `import`, `duplicate`, `list`) vient aussi de `writers.mjs`
maintenant : une seule compilation du validateur de brouillon, réutilisée
partout, au lieu d'une copie qui existait avant ce lot uniquement dans
`store.mjs`.

**Le test qui le prouve** (§3, point 1 de la commande, le plus important) :
`tests/doc-writers.test.mjs`, test 3, rejoue **neuf scénarios de refus**
(nom vide, nom trop long, document absent, champ trop long, clef hors
liste blanche, champ requis, champ structuré…) sur `doc.verbs.rename`/
`.describe` (obtenus en construisant un vrai bloc `doc`, magasin en
mémoire) **et** sur `createDocWriters({schema}).rename`/`.describe` appelé
séparément, et vérifie que les deux rendent **le même document** ou **le
même message d'erreur, mot pour mot**, à chaque fois. Deux tests 0/0bis,
en amont, vérifient sur les OCTETS de `store.mjs` que le câblage est
réellement du raccourci de propriété et pas une redéfinition locale — même
patron que la garde 11 de `tests/ui-jetons.test.mjs` (« prouver que c'est
possible ne prouve pas que c'est fait »).

`ui/builder/shell.mjs` construit `createDocWriters({schema})` **une seule
fois**, au boot, en même temps que le moteur (`Promise.all([bootEngine(),
loadExampleDocument(), loadDocSchema()])` — `loadDocSchema` est neuve dans
`engine.mjs`, même patron `fetch` que `loadExampleDocument`). Concept et
Universe reçoivent `writers`/l'appellent via `applyDecisionAction`, jamais
directement — même discipline que tous les autres verbes du builder.

`tests/shell-wiring.test.mjs`, test 7 (+ 7bis/7ter), grepp `ui/` entier
(pas seulement `shell.mjs`) avec `\bcreateDoc\b` (ancré aux deux bouts —
voir §3 plus bas, « ce qui m'a surpris ») et vérifie qu'AUCUN fichier ne le
porte. `src/doc/index.mjs` exporte maintenant `createDocWriters` en plus
(à côté de `createDoc`), pour que ce soit la porte d'entrée publique
naturelle du bloc — mais `ui/builder/shell.mjs` importe `writers.mjs`
**directement**, pas par `index.mjs` : ce dernier importe `store.mjs`, qui
importe `node:crypto` (pour `randomUUID`, verbe `create`) — un import que
le navigateur ne sait pas résoudre. Un détail qui aurait fait planter le
builder au chargement si je l'avais raté (voir §3, « ce qui m'a surpris »).

## 2. Ce que j'ai mesuré sur le changement de pile

Commande §2b : « mesure ce que changer de pile implique sur un personnage
déjà construit — et si c'est destructeur, sers-toi de `confirm.mjs` ».

**Le geste** : `document.build.layers` est la manifestation FIGÉE de la
pile au moment où le personnage a été plié — mais `rebuild` (`src/build/
block.mjs:245-259`) a une porte de sortie : si `document.build.layers` est
**vide** (`[]`), il ADOPTE silencieusement la pile actuellement montée dans
`layers` (`dispatch("layers.stack")`, filtrée sur `enabled`), sans rien
écraser. C'est la porte que ce lot emploie pour BASCULER une pile déjà
déclarée, pas seulement pour en adopter une la première fois. Changer de
pile est donc, dans `shell.mjs` (`applyLayerStack`) :

1. `layers.verbs.enable`/`.disable({id})` sur les quatre couches FH ;
2. `document.build.layers = []` ;
3. `rebuild()`.

**Mesuré directement** (probe Node ad hoc, puis `tests/universe-step.
test.mjs`, test C, sur le VRAI personnage d'exemple EN+FH du dépôt) :
passer de SRD+FH à SRD **NE TOUCHE PAS** `document.build.choices` — les
choix Fate's Hand (don d'origine, arcane de destinée, budget de compétence
d'espèce) restent tels quels sur le document, octet pour octet. Ce qui
change, c'est le PERSONNAGE RÉSOLU : `validate()` nomme alors deux refus,
`choice.ref-missing` (le don/l'arcane FH ne pointe plus vers rien) et
`skill-grant.count-mismatch` (le budget de compétence que la couche
espèces FH ajoutait disparaît). Repasser à SRD+FH restaure **exactement**
l'état d'avant — mêmes `unconsumed`, plus aucune violation — sans qu'un
octet du document n'ait eu besoin d'être réécrit entre les deux.

**Ma conclusion, et pourquoi elle contredit à moitié la commande** : ce
n'est **pas** une perte de données (rien n'est effacé), donc `confirm.mjs`
ne protège **pas** contre une destruction ici — contrairement à Class (lot
46), où confirmer efface vraiment des `class.skills[n]` orphelins. C'est un
passage à un état RÉSOLU dégradé et RÉVERSIBLE. J'ai quand même posé la
confirmation (§3 de la commande le permet : « et le test le montre, y
compris la confirmation si tu en poses une ») parce que le joueur qui
clique « SRD » perd quand même, à l'écran, l'effet de ses choix FH tant
qu'il ne revient pas — une confirmation qui NOMME ce qui s'arrête
d'appliquer (et précise que ça revient) me semble plus honnête qu'un clic
silencieux, mais j'ai reformulé le titre pour ne PAS dire « seront perdus »
(faux) — voir `universe-step.mjs`, `renderUniverseStep`.

## 3. Ce qui m'a surpris

1. **`lang`/`units` ne sont écrivables par AUCUN verbe existant.**
   `describableFields(schema)` ne retient que les propriétés racine
   FACULTATIVES (absentes de `required`) — `lang` (`$ref`) et `units`
   (`type: "object"`) sont toutes deux REQUISES, donc structurellement hors
   de `describe`, et `rename` ne touche que `name`. La commande liste
   pourtant « la langue de la fiche » et « les unités » parmi ce que
   Universe « porte » (§0), sans jamais dire QUI les écrit après `create`.
   Mesuré, pas contourné : je n'ai PAS ajouté un dixième verbe (un
   changement de contrat que cette commande ne mandate pas — §1 ne parle
   QUE de rendre `rename`/`describe` atteignables, pas d'en inventer un
   troisième) ni élargi `describe` à des champs requis (ça romprait sa
   sémantique documentée, « n'écrit que ce que le schéma déclare facultatif
   »). L'écran les affiche en LECTURE SEULE, avec une note explicite. Ce
   trou est déclaré ici et dans `contracts/doc.md` — c'est, je crois, ce que
   le lot 50 a fait pour un trou de test qu'il ne pouvait pas boucher.

2. **`node:crypto` transite par `store.mjs` jusqu'à `index.mjs`.**
   `src/doc/index.mjs` importe `createDoc` de `store.mjs` pour `registerDoc`
   — et `store.mjs` importe `randomUUID` de `node:crypto` (verbe `create`).
   Si `ui/builder/shell.mjs` avait importé `createDocWriters` depuis
   `index.mjs` (le geste le plus naturel — « c'est la porte publique du
   bloc ») plutôt que directement depuis `writers.mjs`, le module entier
   aurait échoué à charger dans le navigateur (`node:crypto` n'y résout
   rien) — un échec silencieux-jusqu'à-l'écran, du genre que ce dépôt
   déteste. `writers.mjs` n'importe QUE `errors.mjs`/`schema.mjs`/
   `../schemas/invariants.mjs`, aucun des trois ne touchant `node:*` : c'est
   ce qui le rend chargeable tel quel dans un `<script type="module">`.

3. **Le raccourci `\bcreateDoc\b` doit être ancré, pas cherché en
   sous-chaîne.** `createDocWriters` CONTIENT littéralement la sous-chaîne
   `createDoc`. Un premier jet du garde 7 (`tests/shell-wiring.test.mjs`)
   avec `.includes("createDoc")` aurait fait rougir le garde sur son PROPRE
   remède — exactement « un motif bien ancré, mais sur une seule
   orthographe de ce qu'il cherche », la leçon que ce chantier a déjà payée
   une fois (le `grep` à 56 sites contre 77 réels). Corrigé avant de
   committer, avec un test témoin dédié (7bis) qui vérifie que
   `createDocWriters` ne fait PAS rougir 7.

4. **`choice.label` porte deux formes différentes dans le même document.**
   `background.originFeat[0]` a `label: "Origin feat"` (décrit le SLOT) ;
   `fh.destiny.arcana` a `label: "The Hermit"` (c'est déjà le NOM du
   record). En affichant tel quel `${label}: ${name}` dans la confirmation
   du changement de pile, j'obtenais « The Hermit: The Hermit » — vu à
   l'écran (§4), pas en lisant le JSON. Corrigé : le préfixe ne s'affiche
   que si `label !== name`.

5. **Les coordonnées de clic du navigateur de test ne sont pas fiables
   pour un `<input>` derrière un `<datalist>`** (au moins dans cet
   environnement) — `key: "BackSpace"`/`"Delete"` seuls n'ont pas modifié
   la valeur d'un champ, alors que `type` (après une sélection déjà posée)
   fonctionnait. Contourné en manipulant `element.value` + un `Event
   ("change")` synthétique pour la vérification manuelle du refus de nom
   vide (§4) — la même voie que le vrai gestionnaire `change` écoute, donc
   une preuve honnête malgré le détour. La preuve AUTOMATIQUE (le refus de
   nom vide) ne dépend d'aucun de ces gestes : `tests/concept-step.test.mjs`
   test 3 et `tests/doc-writers.test.mjs` test 3 l'éprouvent directement sur
   `writers.rename`.

## 4. §4 — Ce que j'ai vu, en servant le builder

Servi sur `python3 -m http.server`, viewport desktop (1280×720) PUIS mobile
(375×812, préréglage du navigateur de test) — vérifié explicitement avant
de juger la mise en page, l'architecte ayant déjà mesuré qu'un viewport de
400 px fait légitimement basculer le seuil de 720.

**Le parcours complet, des neuf étapes, pour la première fois** :

- **Universe & Layers** (étape 0) : les deux boutons « SRD »/« SRD + FH »,
  « SRD + FH » actif par défaut (cohérent avec les cinq couches du
  personnage d'exemple). Cliquer « SRD » ouvre la confirmation, NOMME
  « Origin feat: Auspicious (fh) » et « The Hermit », et les deux boutons
  (Confirmer/Annuler) fonctionnent — confirmé : bascule vers SRD sans
  crash, aucune erreur console ; re-basculé vers SRD + FH, tout redevient
  actif. Le champ « Campaign codename » écrit et relit « Nymedes » à
  travers un rendu complet. Langue/unités affichées en lecture seule
  (« English / feet / pounds »).
- **Concept** (étape 1) : nom pré-rempli (« Ilyra Duskleaf », depuis
  l'exemple), genre et alignement libres, l'alignement propose une liste
  native (`<datalist>`) ET accepte « Chaotic Good (mostly) » — vérifié
  survivant à un rendu complet. Vider le nom et déclencher `change` affiche,
  sous le champ, en rouge, le message EXACT du bloc `doc` : « fhpc/doc:
  rename : le document ne valide pas contre `fh-char/1` — 1 refus : -
  « document.name » : 0 caractère(s), au moins 1 attendu(s). » — et le champ
  revient visuellement à « Ilyra Duskleaf » (dernière valeur valide), jamais
  une valeur à moitié écrite.
- **Class** → **Species** → **Inheritance** → **Abilities** → **Destiny**
  → **Skills** → **Equipment** → **Review** : les huit étapes déjà câblées
  par les lots précédents fonctionnent toujours, sans régression visible —
  Wizard/Elf/Auspicious (fh)/The Hermit pré-remplis depuis l'exemple, le
  budget de compétences d'espèce à jour, l'équipement du Magicien listé, et
  la fiche finale de Review affiche **« Ilyra Duskleaf »** dans son en-tête
  — la preuve que le nom écrit à l'étape Concept traverse jusqu'à la fiche,
  sans qu'un seul `rebuild()` n'ait été nécessaire pour ça (`name` n'entre
  jamais dans `resolved`).
- **Mobile (375 px)** : la ceinture défile horizontalement (patron déjà
  éprouvé par les lots précédents), le champ « Campaign codename » et les
  deux boutons de pile s'empilent proprement en pleine largeur — rien de
  cassé, aucun débordement horizontal.

Aucune erreur console à aucune étape.

## 5. Ce que j'ai changé de cette commande

- **Je n'ai PAS rendu `lang`/`units` éditables** (§2b les liste), pour la
  raison mesurée au §3.1 ci-dessus : aucun verbe existant ne peut les
  écrire, et en fabriquer un est un changement de contrat hors du mandat de
  ce lot (« rendre `rename`/`describe` atteignables », pas « en ajouter un
  troisième »). Affiché en lecture seule à la place, avec le trou nommé
  dans `contracts/doc.md` et ici.
- **J'ai choisi de poser `confirm.mjs`** sur le passage à SRD malgré ma
  mesure qu'il n'y a AUCUNE perte de données — parce que le personnage
  résolu, lui, se dégrade réellement tant qu'on reste sur SRD, et un joueur
  mérite d'être prévenu avant de cliquer, même si « rien n'est perdu ». J'ai
  reformulé le titre de la boîte pour dire exactement ça (pas « seront
  perdus »), afin de ne pas mentir sur ce que le clic fait vraiment.
- **J'ai retiré le `else` générique final de `renderStage()`** (le
  placeholder de lot 33, « This step will read the decisions[] ledger… »)
  plutôt que de le laisser mort derrière les dix branches maintenant
  exhaustives — la commande dit « plus aucun placeholder dans shell.mjs »,
  et un `else` qu'aucune étape ne peut plus atteindre reste un texte qui
  ment sur ce qui reste à câbler.
