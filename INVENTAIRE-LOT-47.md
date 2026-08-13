# Inventaire — lot 47 `47-document-neuf`

## Tests, au départ et à l'arrivée

- **Départ** (`npm ci` puis `npm test`, sur `9f747e5`, la même que `main`
  mesurée par `git -C ~/tools/fhpc rev-parse --short main`) : **765 tests
  verts**, 0 échec. Conforme au nombre annoncé par la commande.
- **Arrivée** : **778 tests verts**, 0 échec (765 + 13 tests neufs dans
  `tests/doc-create.test.mjs`, plus deux tests existants ajustés — voir
  plus bas — sans changer le total qu'ils comptaient).

## Ce que ce lot construit

`doc.create` (le septième verbe), `doc.rename` (le huitième), un schéma de
brouillon **dérivé** de `fh-char/1` (`deriveDraftSchema`, `src/doc/
schema.mjs`), et `doc.list` qui distingue désormais un brouillon d'un
personnage complet. Tout vit dans `src/doc/` ; `src/build/` et `ui/` ne sont
pas touchés.

## Le nom du verbe du nom : `rename`, pas `describe` ni un paramètre de `save`

Trois options mesurées à la commande (§2b) :

- **un paramètre de `save`** — refusé : `save` a un invariant fort et
  éprouvé (« ne touche à RIEN du contenu, pas même `modified` », invariant 7
  du contrat). Un paramètre `name` sur `save` casserait cet invariant ou le
  rendrait conditionnel, ce qui est pire — un invariant qui a des exceptions
  n'en est plus un.
- **`describe`** — refusé : le mot suggère une action plus large qu'écrire
  un seul champ (une description, un résumé), alors que ce verbe ne touche
  QUE `name`. Un nom de verbe trop large invite à y accrocher autre chose
  plus tard, exactement le problème que `build.set`/`build.choose` évitent
  en étant coupés pile où le schéma les coupe.
- **`rename`** — retenu : c'est le mot le plus étroit qui dit exactement ce
  que fait le verbe (« changer un nom qui existe déjà »), il est déjà du
  vocabulaire ordinaire du dépôt (`import({as})` « renomme » un document, et
  le mot est déjà employé dans son propre commentaire), et il n'invite à
  rien d'autre.

`rename` est **pur** : il ne touche ni le magasin ni `build.choices`, prend
`{document, name}` et rend une **copie** renommée (validée comme toute
admission — un nom vide ou > 200 caractères est refusé, nommé, comme le
schéma le dit déjà de `name`). Le document peut être un brouillon ou un
personnage complet ; les deux valident (§2c).

## Comment `create` produit l'`id`

Il le produit **lui-même** — contrairement à `duplicate`, qui EXIGE `as` de
l'appelant (loi §0.10 : un id est un nom, l'inventer déciderait à la place
du joueur). La différence tient à ce qu'il y a à copier : `duplicate` copie
un document que son joueur a déjà nommé, donc l'appelant doit nommer la
copie. `create` n'a **rien** à copier — il n'y a encore personne à qui
laisser le choix, et un document neuf sans id n'a pas d'emplacement dans le
magasin (la clef du magasin EST l'id, réponse 1 du contrat).

Le générateur (`freshId()`, `src/doc/store.mjs`) tire un **UUID v4** du
CSPRNG de la plate-forme (`node:crypto`/`randomUUID` — déjà présent dans le
bloc pour `digest`, aucune dépendance neuve) et vérifie que le résultat
respecte `ID_PATTERN` (lu depuis le schéma, jamais recopié) avant de le
rendre — un garde qui ne se déclenche jamais en pratique avec un UUID v4,
mais qui transforme un changement futur du motif de `id` en refus nommé
plutôt qu'en id silencieusement invalide.

`Math.random` reste interdit sans exception dans tout `src/doc/` (garde
structurel existant, non touché) : c'est pourquoi ce générateur passe par
`node:crypto` et non par un PRNG ordinaire.

`create` **ne touche pas le magasin** : l'unicité RÉELLE contre ce qui
existe déjà n'est donc pas vérifiée ici, elle l'est à `save`, par la garde
de collision d'écriture ordinaire (`expect: null` — réponse 2 du contrat).
Un UUID v4 rend une collision non provoquée assez improbable pour ne jamais
survenir en pratique ; la garde de collision existe pour toute autre raison
qu'elle aurait de se produire (un magasin partagé entre deux sessions, par
exemple), pas spécifiquement pour ce cas-là.

## Comment le schéma de brouillon est dérivé

`deriveDraftSchema(schema)` (`src/doc/schema.mjs`) lit le `required` réel de
`fh-char/1` (via `readFromSchema`, le patron déjà mesuré par la commande) et
en rend une **copie superficielle** dont `required` est **filtré** de
`resolved` — `{...schema, required: required.filter(k => k !== "resolved")}`.
Rien d'autre ne bouge : mêmes `$defs`, mêmes `properties`, même contrainte
sur chaque champ.

C'est ce qui rend « une seule clef retirée, aucune autre touchée » vrai :
`draftSchema.required.length === schema.required.length - 1`, mesuré et
testé (`tests/doc-create.test.mjs`, test 8). Et c'est ce qui rend « c'est
une DÉRIVATION, pas une copie figée » démontrable plutôt qu'affirmé : le
même test ajoute une clef fictive au `required` du schéma BRUT et vérifie
qu'elle apparaît **aussitôt** dans le brouillon dérivé, sans qu'une ligne de
`deriveDraftSchema` ne change — parce que la fonction filtre un tableau
qu'on lui passe, elle n'en recopie pas le contenu à la main.

`createDoc` compile ce schéma dérivé, et **lui seul** (`compiled =
compileSchema(deriveDraftSchema(schema), …)`) : un seul validateur suffit
aux deux formes (brouillon et complet), parce que le brouillon est un
SUR-ENSEMBLE strict du complet — il admet l'absence de `resolved`, il ne
relâche RIEN de ce que le schéma dit d'un champ présent. C'est ce qui rend
la graduation gratuite (§1c) : dès que `rebuild` pose `resolved`, le même
validateur, sans changer, le juge déjà à la rigueur complète de `fh-char/1`.

`fh-char.schema.json` lui-même n'est **pas** modifié — `resolved` y reste
`required`, comme l'architecte l'a tranché (§1b de la commande : « rendre
`resolved` facultatif dans `fh-char/1` est REFUSÉ »).

## Ce qui a été ajouté à `list`

Un champ `draft` (booléen), calculé par `document.resolved === undefined`.
Et un changement défensif : `level` vaut `null` pour un brouillon au lieu de
lire `document.resolved.identity.level`, qui aurait fait planter `list` —
le seul verbe du bloc qui ne doit **jamais** jeter (invariant 8 du
contrat). `contracts/doc.md` documente les deux, avec leur test.

Rien d'autre n'a été ajouté à `list` : ni un résumé des choix posés, ni un
pourcentage d'avancement — « ajoute ce qu'il faut, et pas plus » (commande
§2c) s'est lu comme « distinguer les deux ÉTATS, pas décrire leur contenu ».

## Ce qui m'a surpris

**Les gardes explicites de `create` (« aucun défaut deviné », décision D3)
sont redondants avec le schéma, et je ne l'avais pas anticipé avant de les
attaquer.** `create` détruit `{name, lang, units, layers}` et jette
explicitement si l'un manque, en nommant « décision D3 ». Mais un champ
`undefined` reste une CLEF PRÉSENTE dans l'objet JS construit (`{name:
undefined, …}` a bien la clef `name`), donc le `required` du schéma la
trouve déjà là — c'est la vérification de TYPE (`type: "string"` vs.
`⟨undefined⟩`) qui refuse ensuite, dans `assertValid`. Résultat mesuré par
l'attaque manuelle (voir plus bas) : neutraliser la boucle D3 pour UN champ
ne change RIEN au fait que `create` continue de jeter — seul le message
change, de « décision D3, « units » manque » à un générique « attendu
object, reçu ⟨undefined⟩ ». Un test qui se contente de `assert.throws(...)`
sans regarder le message n'aurait rien vu. J'ai donc écrit
`tests/doc-create.test.mjs` pour vérifier le CONTENU du message partout où
ça compte, pas seulement le fait qu'il jette — et l'attaque manuelle
ci-dessous le prouve plutôt que de l'affirmer.

**Second point, plus petit** : le patron `manifestOf(layers)` de
`tests/build-harness.mjs` (déjà écrit par un lot antérieur) est EXACTEMENT
la fonction que `create` demande à son appelant de fournir en entrée
(`layers.verbs.stack().filter(enabled).map({id,version,hash,name})`), au
mot près. Je m'attendais à devoir écrire ce patron moi-même dans les tests ;
il existait déjà, ce qui a confirmé que la mesure du kickoff (« reprends le
geste de `src/tools/exemple-fh-en.mjs` ») était la bonne cible.

## Ce que j'ai changé de la commande

Rien de contredit. Une seule précision que la commande laissait ouverte et
que j'ai dû trancher moi-même, documentée ici plutôt que devinée en
silence : la commande dit que `rename` doit écrire `name` « à sa racine »
mais ne dit rien de `modified`. J'ai choisi de **ne pas** faire bouger
`modified` dans `rename` — un verbe pur qui ne touche que ce qu'on lui
demande (`name`), à l'image de l'invariant 7 (« `save` ne touche à RIEN du
contenu, pas même `modified` »). Bumper `modified` aurait été une décision
UX plausible (« le document a changé, disons-le ») mais non demandée, et
elle appartient plutôt au lot qui câblera le builder (qui sait QUAND un
document a réellement changé aux yeux du joueur — à chaque frappe ? à
chaque `save` ?). Question ouverte, pas un choix silencieux.

## L'attaque manuelle (§3, dernier paragraphe)

**Garde attaqué** : la boucle « aucun défaut deviné » de `create`
(`src/doc/store.mjs`), spécifiquement l'entrée `["units", units]`.

**Neutralisation** : `["units", units]` → `["units", units || {}]` — un
`units` manquant ne déclenche plus le refus D3 explicite.

**Mesuré** : `npm test` sur l'arbre attaqué → **776 verts, 2 rouges**.
Un seul est un vrai signal : `create refuse l'appel incomplet, et NOMME le
champ manquant (décision D3, aucun défaut deviné)` (`tests/doc-create.
test.mjs`) — précisément la boucle sur les quatre champs, qui échoue sur
l'itération `units` (message reçu : `attendu object, reçu ⟨undefined⟩` au
lieu de citer « décision D3 » et « « units » manque »). Le second rouge,
`AUCUNE SUITE NE MUTE UN ARTEFACT COMMITÉ`, est le veilleur d'arbre qui
refuse de conclure quoi que ce soit sur un arbre pendant que la suite est
rouge ailleurs — un artefact de la première rougeur, pas un second signal
indépendant.

**Restauré** : `diff` contre la copie pristine → **identique, byte à
byte** (`diff /tmp/store.mjs.pristine src/doc/store.mjs` vide).

**Suite complète rejouée** : **778 verts, 0 rouge**.

Ce que l'attaque prouve : le garde explicite est réellement exercé par un
test (contrairement à un garde qui ne rougirait jamais attaqué), ET ce
garde n'est PAS la seule ligne de défense contre un `units` manquant (le
schéma refuse quand même) — seulement la ligne qui rend le refus lisible.
Les deux faits comptent : sans le premier, le garde serait mort ; sans le
second, je l'aurais cru seul responsable du refus, ce qui aurait été faux.

## Décisions d'architecte (§1) : tenues à la mesure

Les quatre tiennent, sans contradiction trouvée :

- **1a (le brouillon voyage par fichier)** : tenu — `create`/`rename` ne
  touchent à aucun transport, `export`/`import` restent les seuls.
- **1b (le schéma de brouillon se DÉRIVE)** : tenu — `deriveDraftSchema`,
  attaqué au test 8.
- **1c (la graduation est gratuite)** : tenu — aucun convertisseur écrit ;
  le test 4 chaîne `create` → choix → `rebuild` → validation stricte sur le
  MÊME document.
- **1d (le nom entre par un verbe du bloc `doc`)** : tenu — `rename` vit
  dans `src/doc/store.mjs`, `src/build/` n'est pas touché.

## Fichiers touchés

- `src/doc/store.mjs` — `create`, `rename`, `freshId()`, le validateur
  interne basculé sur le schéma dérivé, `list()` étendu.
- `src/doc/schema.mjs` — `deriveDraftSchema`.
- `src/doc/index.mjs` — export de `deriveDraftSchema`.
- `contracts/doc.md` — verbes neufs, réponse 4 (schéma de brouillon),
  invariants 7/8/12 relus, obligations de test §10, points MCP.
- `tests/doc-create.test.mjs` — neuf (13 tests, §3 de la commande au
  complet).
- `tests/doc-block.test.mjs` — liste exacte des verbes du bloc, +2.
- `tests/doc-acceptance.test.mjs` — `draft: false` ajouté à l'inventaire
  attendu du personnage d'exemple.

Aucun fichier de `ui/` ni de `src/build/` n'a été touché.
