# Inventaire — lot 48 `48-champs-identite`

## Tests, au départ et à l'arrivée

- **Départ** (`npm ci` puis `npm test`, sur `7447f3a`, coupée de `main`
  mesurée par `git -C ~/tools/fhpc rev-parse --short main`) : **780 tests
  verts**, 0 échec. Conforme au nombre annoncé par la commande — vérifié
  avant d'écrire une seule ligne.
- **Arrivée** : **791 tests verts**, 0 échec (780 + 11 tests neufs dans
  `tests/doc-identity.test.mjs`, plus un test existant CORRIGÉ dans
  `tests/schemas.test.mjs` — voir « Ce qui m'a surpris » — sans changer le
  total qu'il comptait).

## Ce que ce lot construit

Trois propriétés RACINE facultatives sur `fh-char/1` — `gender`,
`alignment`, `campaign`, texte libre, non énuméré — et un neuvième verbe,
`doc.describe`, qui les écrit. `create` peut aussi les poser dès la
naissance (toujours facultatifs). `rename` ne bouge pas. Tout vit dans
`schemas/`, `src/doc/`, `contracts/doc.md`, `tests/` ; `ui/` et
`src/build/` ne sont pas touchés.

## Le nom du verbe : `describe`, et pourquoi il redevient défendable CONTRE l'argument du lot 47

Le lot 47 a refusé `describe` pour son verbe qui n'écrit que `name`, avec
cet argument (`INVENTAIRE-LOT-47.md`, mot pour mot) :

> « le mot suggère une action plus large qu'écrire un seul champ … Un nom de
> verbe trop large invite à y accrocher autre chose plus tard. »

Cet argument porte sur QUI DÉCIDE de la largeur du verbe. Pour le `describe`
que le lot 47 avait envisagé et refusé, c'était le CODE : accrocher un champ
de plus aurait été une ligne écrite à la main dans `store.mjs`, sans aucun
garde-fou entre « ce champ appartient à `describe` » et « quelqu'un a jugé
bon de l'y accrocher ». L'objection est juste, et je ne l'ai pas ignorée —
je l'ai neutralisée en changeant QUI décide.

Le `describe` de ce lot n'accepte pas une liste écrite en dur : il accepte
**exactement** `describableFields(schema)` — les propriétés racine du
schéma injecté qui sont à la fois absentes de `required` (facultatives) et
`type: "string"` (descriptives, le mot que ce schéma emploie déjà pour dire
« texte libre », voir le `$comment` de `resolved.identity.creatureType`).
Aucune ligne de `store.mjs` ne nomme `gender`, `alignment` ou `campaign`.
« Accrocher autre chose plus tard » reste possible en toute rigueur, mais ce
n'est plus un geste de code invisible : c'est un changement de **schéma**,
relu, testé (`tests/doc-schema.test.mjs`, la liste des mots-clefs pris en
charge), et ratifié comme tout changement de contrat de ce dépôt. Le verbe
est aussi large que le schéma le déclare, jamais un mot de plus — et c'est
précisément le point où l'argument du lot 47 cesse de s'appliquer : *« un
verbe est trop large quand le CODE décide de ce qu'il accepte ; il ne l'est
plus quand le SCHÉMA décide, parce qu'alors il ne peut pas dériver »*
(commande, §1b).

Deux autres noms mesurés et refusés :
- **un paramètre de plus sur `create`** — refusé : `create` a déjà une
  boucle stricte (« aucun défaut deviné », décision D3) sur quatre champs
  requis ; un cinquième groupe de champs FACULTATIFS mélangerait deux
  disciplines différentes dans la même fonction, et `create` ne suffirait
  plus à décrire un personnage déjà existant qu'on veut enrichir plus tard.
- **`set` / `edit`** — refusés : `set` collide de nom avec le vocabulaire de
  `build` (`build.set` existe et pose un CHOIX, pas une métadonnée — les
  confondre au premier coup d'œil serait une vraie faute de lecture) ;
  `edit` ne dit rien de PLUS que `describe` et perd le lien direct avec le
  mot « descriptif » que la commande emploie déjà (§1b : « facultatifs et
  descriptifs »).

## Comment la liste blanche est lue dans le schéma

`describableFields(schema)` (`src/doc/schema.mjs`) :

```js
export function describableFields(schema) {
  const properties = readFromSchema(schema, ["properties"]);
  const required = new Set(readFromSchema(schema, ["required"]));
  return Object.keys(properties)
    .filter((key) => !required.has(key))
    .filter((key) => isPlainObject(properties[key]) && properties[key].type === "string")
    .sort();
}
```

Deux lectures, aucune recopie : `required` (déjà lu par `deriveDraftSchema`,
lot 47) et `properties` (jamais lu comme un TOUT avant ce lot, seulement
champ par champ via `readFromSchema(schema, ["properties", "id", "pattern"])`
etc.). Le filtre `type === "string"` n'invente rien : c'est le mot que ce
schéma emploie déjà pour dire « chaîne libre, non structurée » partout
ailleurs (`name`, `species`, `creatureType`…), par opposition à un champ
structuré comme `generator` (`type: "object"`, deux sous-champs requis) qui
n'a objectivement rien d'un texte descriptif.

**Pourquoi pas une annotation inventée (`x-describable: true`)** — mesuré et
refusé. `compileSchema` (§ plus haut dans `schema.mjs`) jette sur tout
mot-clef absent de `SUPPORTED` : une annotation neuve aurait dû y être
ajoutée, pour un fait que le schéma dit déjà par son `type`. C'aurait été un
mot-clef de PLUS à maintenir, et le test « la liste des mots-clefs pris en
charge couvre EXACTEMENT ce que le schéma emploie » (`tests/
doc-schema.test.mjs`) l'aurait immédiatement exigé PARTOUT où `describable`
apparaît dans `$defs` — un coût que le schéma n'a pas besoin de payer pour
dire une chose qu'il sait déjà dire.

`create` et `describe` PARTAGENT la même liste (`DESCRIBABLE_FIELDS`, lue
une seule fois à la construction du bloc, dans `createDoc`) — jamais deux
copies qui pourraient diverger.

## Les `maxLength`, et leur motif

- `gender` : **60**. Même borne que `resolved.identity.creatureType`, le
  précédent explicitement cité par la commande pour « texte libre EXPRÈS » —
  un descripteur court (« non-binaire, iel », « homme trans »), jamais une
  phrase.
- `alignment` : **60**, même motif. Une chaîne comme `Chaotic Good (mostly)`
  (18 caractères) ou l'alignement inventé d'une campagne homebrew tient très
  large sous cette borne ; 60 laisse la place à une nuance entre parenthèses
  sans ouvrir la porte à un paragraphe.
- `campaign` : **80**. Même borne que `species`/`background` — un nom-comme-
  identifiant, pas un descripteur d'une ligne : un nom de code de campagne
  (« Le Sentier de Guilde », « Obvious Mimic ») ressemble structurellement
  plus à un nom propre qu'à un adjectif libre, d'où l'alignement sur le
  précédent des NOMS (80) plutôt que sur celui des DESCRIPTEURS (60).

Aucune des trois ne reprend la borne de `name` (200) : `name` est le champ
qu'on LIT le plus souvent et le plus long des trois par nature (un nom de
personnage porte parfois un titre complet) ; les trois champs de ce lot sont
plus proches, par leur USAGE, d'une étiquette que d'un titre.

## Ce qui t'a surpris

**Un test existant utilisait `campaign` comme témoin de « clef inconnue à la
racine », et ce lot l'a cassé.** `tests/schemas.test.mjs`, la mutation
`doc.campaign = "n'importe laquelle"` était censée prouver qu'une clef
racine non déclarée est REJETÉE. En rendant `campaign` légitime, cette
mutation cesse d'être une violation — le test serait devenu un TÉMOIN
D'ADMISSION déguisé en test de REJET, silencieusement, si je n'avais pas
fait tourner la suite complète après avoir touché le schéma. Mesuré : sans
correction, `npm test` donnait 2 rouges (le test lui-même, et le veilleur
d'arbre `tree-immuable` qui refuse de conclure sur un arbre pendant qu'un
autre test est rouge — un artefact de la première rougeur, pas un second
signal, exactement comme dans l'attaque manuelle du lot 47). Corrigé en
remplaçant le témoin par `faction`, un champ d'identité plausible qu'AUCUN
lot, ni celui-ci ni un précédent, n'a ouvert — documenté dans le test
lui-même pour que le prochain lot qui ouvrirait `faction` sache pourquoi ce
test-ci rougirait. Leçon : ajouter une propriété au schéma n'est jamais un
changement isolé à `schemas/` — la suite ENTIÈRE doit être rejouée, pas
seulement les tests du fichier qu'on modifie, parce qu'un autre lot a pu
choisir n'importe quel nom plausible comme témoin de rejet, et la
plausibilité est exactement ce qui rend une collision possible.

**Second point, une mesure plutôt qu'une surprise, mais qui mérite d'être
écrite : la redondance defense-in-depth entre le filtre du verbe et le
schéma tient, comme au lot 47 pour la boucle D3.** J'ai testé (hors suite,
attaque manuelle jetable, détaillée plus bas) ce qui se passe si `create`
recopie N'IMPORTE QUELLE clef du payload au lieu de filtrer sur
`DESCRIBABLE_FIELDS` : chaque appel à `create` (TOUS, puisque `layers` est
toujours dans le payload et n'est pas une clef du document RACINE) se met à
échouer bruyamment — `additionalProperties: false` du schéma refuse la clef
`layers` à la racine, nommément. Le filtre du verbe n'est donc pas la SEULE
ligne de défense contre un champ non désiré : le schéma referme la porte
même si le code de `store.mjs` se trompait complètement. Les deux comptent
quand même : sans le filtre du verbe, un champ légitime mais non voulu à CET
endroit (imaginons un futur champ racine `type: "string"` non pensé pour
`create`) traverserait jusqu'au schéma et n'y serait bloqué QUE s'il n'était
pas déjà une propriété déclarée — ce que `DESCRIBABLE_FIELDS` empêche en
amont, plus tôt et plus précisément qu'un rejet générique.

## Ce que j'ai changé de la commande

Rien de contredit. Deux précisions que la commande laissait ouvertes,
tranchées et documentées ici plutôt que devinées en silence :

1. **La commande ne dit pas explicitement si `describe` doit refuser un
   payload sans AUCUN champ (`{document}` seul).** J'ai choisi de
   l'AUTORISER : un appel qui ne change rien rend une copie inchangée
   (validée quand même), cohérent avec « facultatif » et avec le fait que
   `rename`/`save` n'imposent pas non plus un contenu minimal au-delà de ce
   que le schéma exige déjà. Aucun test ne l'exige explicitement, mais rien
   ne l'interdit non plus, et un refus aurait été une règle inventée que la
   commande ne demande pas.
2. **`create` reste PERMISSIF sur les clefs hors `DESCRIBABLE_FIELDS`
   (ignorées, pas refusées), alors que `describe` est STRICT (refusées et
   nommées) sur les mêmes clefs.** La commande ne tranche pas explicitement
   cette asymétrie. Je l'ai choisie parce qu'elle EXISTAIT déjà avant ce
   lot : le lot 47 a testé et documenté qu'un `id` forcé dans le payload de
   `create` est ignoré, pas refusé (`tests/doc-create.test.mjs`, dernier
   test du fichier). Rendre `create` strict aurait été un changement de
   comportement sur un verbe que ce lot n'a pas mandat de durcir ; le test
   §2.5 de la commande (« le verbe REFUSE d'écrire un champ que le schéma ne
   déclare pas ») porte sur LE verbe neuf du §1b — `describe` — et je l'ai
   lu ainsi plutôt que comme une exigence transversale sur `create` aussi.
   Question ouverte si l'architecte préfère l'uniformité : durcir `create`
   serait un changement d'UNE ligne (`for (const key of Object.keys(options))`
   → refuser au lieu d'ignorer), mais casserait un test déjà ratifié du
   lot 47 sans qu'aucune commande ne l'ait demandé.

## L'attaque manuelle (§2, dernier paragraphe)

### Attaque 1 — le garde qui prouve §1b (« la liste blanche mord dans les deux sens »)

**Garde attaqué** : le refus de `describe` sur une clef hors de
`DESCRIBABLE_FIELDS` (`src/doc/store.mjs`, verbe `describe`).

**Neutralisation** : `if (unknown.length > 0) {` → `if (false && unknown.length > 0) {`
— plus aucune clef n'est jamais refusée par ce garde.

**Mesuré** : `npm test` sur l'arbre attaqué → **788 verts, 3 rouges**. Deux
sont de vrais signaux, tous deux dans `tests/doc-identity.test.mjs` :
- test 1 (« describe lit sa liste blanche DANS LE SCHÉMA ») — sa seconde
  moitié, qui vérifie que `callsign` (une clef hors schéma) est refusée SUR
  LE SCHÉMA RÉEL, ne trouve plus de refus ;
- test 5 (« describe refuse un champ inconnu, et NOMME celui qui est
  refusé ») — chacune de ses cinq assertions `assert.throws` échoue, la clef
  passe désormais silencieusement.

Le troisième rouge, `AUCUNE SUITE NE MUTE UN ARTEFACT COMMITÉ`, est le
veilleur d'arbre : il refuse de conclure quoi que ce soit tant que la suite
est rouge ailleurs — un artefact de la première rougeur, pas un troisième
signal indépendant (même lecture que le lot 47 pour son attaque D3).

**Restauré** : `diff /tmp/store.mjs.pristine.48 src/doc/store.mjs` →
**identique, byte à byte** (`IDENTIQUE BYTE-A-BYTE`).

**Suite complète rejouée** : **791 verts, 0 rouge**.

Ce que l'attaque prouve : le refus est réellement exercé par DEUX tests
distincts (pas un garde mort), et rien d'autre dans la suite ne dépend de ce
comportement par accident — seuls les tests dédiés au §1b de ce lot
rougissent, aucun test du lot 47 ni d'un lot antérieur.

### Attaque 2 — informative : le schéma comme filet, si le filtre du verbe se trompait (hors §2, mesure volontaire pour « ce qui m'a surpris »)

**Garde attaqué** : le filtre `DESCRIBABLE_FIELDS` de `create` (boucle qui
choisit QUOI recopier du payload).

**Neutralisation** : la boucle filtrée
(`for (const key of DESCRIBABLE_FIELDS) { if (Object.prototype.hasOwnProperty.call(options, key)) document[key] = options[key]; }`)
remplacée par une recopie AVEUGLE de tout le payload
(`for (const key of Object.keys(options)) { if (!(key in document)) document[key] = options[key]; }`).

**Mesuré** : `npm test` sur l'arbre attaqué → **774 verts, 17 rouges** — TOUS
les appels à `create` de la suite entière, parce que `layers` (toujours
présent au payload, jamais une clef racine du document) se retrouve copié
à la racine et refusé par `additionalProperties: false` :

```
fhpc/doc: create : le document ne valide pas contre `fh-char/1` — 1 refus :
- « document » : clef inconnue « layers » — tous les objets de fh-char/1
  sont fermés (additionalProperties: false), aucune clef n'est ignorée en
  silence. […]
```

**Restauré** : `diff /tmp/store.mjs.pristine.48 src/doc/store.mjs` →
**identique, byte à byte**.

**Suite complète rejouée** : **791 verts, 0 rouge**.

Ce que cette seconde attaque prouve, et pourquoi elle est utile même hors du
périmètre strict du §2 : un filtre de `create` complètement démonté ne
produit AUCUNE corruption silencieuse — le schéma refuse bruyamment, à
CHAQUE appel, en nommant la clef fautive. Le filtre du verbe n'est donc pas
la SEULE ligne de défense (le schéma en est une seconde, comme pour la
boucle D3 du lot 47), mais il reste la ligne qui rend le refus PRÉCOCE et
LISIBLE plutôt que de laisser `create` échouer sur une clef technique
(`layers`) sans rapport avec l'intention du payload fautif.

## Décisions d'architecte (§1) : tenues à la mesure

- **1a (texte libre, facultatifs, `maxLength`)** : tenu — aucune énumération
  fermée, `required` inchangé, bornes choisies et motivées ci-dessus.
- **1b (un seul verbe neuf, liste blanche lue dans le schéma)** : tenu —
  `describe`, `describableFields`, attaqué au test 1 et au test 5, et par
  l'attaque manuelle 1 ci-dessus.
- **1c (`create` peut les poser, toujours facultatifs)** : tenu — testé au
  test 6 de `doc-identity.test.mjs`, un seul champ à la fois ou aucun.
- **1d (`rename` ne bouge pas)** : tenu — testé au test 7, aucune ligne de
  `rename` modifiée depuis le lot 47.

## Fichiers touchés

- `schemas/fh-char.schema.json` — trois propriétés racine facultatives :
  `gender`, `alignment`, `campaign`. `required` inchangé.
- `src/doc/schema.mjs` — `describableFields(schema)`.
- `src/doc/index.mjs` — export de `describableFields`.
- `src/doc/store.mjs` — verbe `describe` ; `create` étendu (boucle qui pose
  les champs descriptifs fournis, sans les exiger) ; `DESCRIBABLE_FIELDS`
  calculé une fois à la construction, partagé par les deux verbes.
- `contracts/doc.md` — verbe neuf, réponse 5 (les champs d'identité),
  invariant 13, obligations de test §11, bannière d'extension.
- `tests/doc-identity.test.mjs` — neuf (11 tests, §2 de la commande au
  complet, plus un test 0 qui mesure `describableFields` directement).
- `tests/doc-block.test.mjs` — liste exacte des verbes du bloc, +1
  (`describe`).
- `tests/schemas.test.mjs` — témoin de « clef inconnue à la racine » changé
  de `campaign` (devenu légitime) à `faction` (voir « Ce qui m'a surpris »).

Aucun fichier de `ui/` ni de `src/build/` n'a été touché.

## SHAs et arbre

- Branche `48-champs-identite`, coupée de `main` à `7447f3a` (remesuré :
  `git -C ~/tools/fhpc rev-parse --short main` → `7447f3a`, identique à ce
  que la commande annonçait).
- `f483517` — « Lot 48 — doc.describe : genre, alignement, campagne, lus
  dans le schéma » : le schéma, `describableFields`, le verbe `describe`,
  `create` étendu, les tests neufs et corrigés, `contracts/doc.md`.
- Ce commit — « Lot 48 — l'inventaire » : ce fichier.
- `git status` rend un arbre propre après ce commit.
