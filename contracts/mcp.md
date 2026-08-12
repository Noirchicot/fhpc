# Contrat de bloc — mcp

> Rempli par le lot **`10-mcp-v0`** le 2026-08-08.
> **À ratifier par l'architecte avant merge.** Les points soumis à décision
> sont marqués ⚠ et repris dans `QUESTIONS-ARCHITECTE.md`.
>
> Il hérite des arbitrages de `contracts/layers.md` et `contracts/build.md` et
> ne les rouvre pas — en particulier la **décision 4** du 2026-08-08 :
> `choose` et `set` restent **deux verbes**, donc **deux outils**.

## Nom

`mcp`

## Rôle (2 lignes)

Adaptateur pur : expose les verbes de `layers` et `build` en **tools** MCP et
le personnage ouvert en **resource**. Aucune logique de règles, aucun état de
domaine.

---

## ⚠️ VERSION DE PROTOCOLE VISÉE, ET DATE DE VÉRIFICATION

| | |
|---|---|
| **Révision MCP implémentée** | **`2026-07-28`** |
| **Source** | `modelcontextprotocol.io/specification/2026-07-28` (base, transports/stdio, server/tools, server/resources, server/discover, basic/versioning) |
| **Date de la vérification** | **2026-08-08** |
| **Révisions antérieures servies** | **aucune.** `initialize` est refusé, en nommant la révision parlée |

**La spécification a bougé, et l'écart n'est pas cosmétique.** Ce qui a été lu
le 2026-08-08 contredit ce qu'un modèle « sait » du protocole :

1. **Il n'y a plus de poignée de main `initialize`, ni de session de
   protocole.** MCP `2026-07-28` est **stateless** : chaque requête porte sa
   version et les capacités de son client dans `params._meta`. Écrire ce
   serveur de mémoire aurait produit une poignée de main qui n'existe plus.
2. **Tout `result` porte un `resultType`** (`"complete"` ici). Un client d'une
   révision antérieure lit son absence comme `"complete"` ; on l'écrit
   toujours.
3. **`server/discover` remplace la découverte**, et un serveur **DOIT**
   l'implémenter.
4. **Une resource absente rend `-32602`**, plus `-32002` (réservé, dont cette
   révision **interdit** l'émission).
5. **La plage `-32020`…`-32099` est réservée à la spécification** : aucun code
   n'y est alloué par ce lot. Le seul code réservé émis est **`-32022`**
   (`UnsupportedProtocolVersionError`).

C'est la §3 du mandat de ce lot, et elle est payée : *« la connaissance d'un
modèle sur une spécification qui bouge a une date de péremption »*.

## Construction

```js
createMcp({ dispatch, serverInfo, blocks })   // une instance, avec son propre dispatch
connectMcp({ serverInfo, blocks })            // l'instance câblée sur le dispatch DU NOYAU
serveStdio({ input, output, log, mcp, onClose })   // la boucle de transport
```

- `dispatch` : **obligatoire**. Seul chemin vers le domaine.
- `blocks` : **obligatoire** — la liste des blocs que la racine de composition
  a réellement montés (`["layers","build"]`, plus `"doc"` s'il y a un magasin).
  L'adaptateur **ne publie que les outils qu'elle couvre**. Pas de défaut
  permissif : il rendrait le catalogue faux dans le seul cas qui compte.
- `serverInfo` `{name, version}` : **obligatoire**. Sur un protocole sans
  session, c'est dans **chaque** résultat que le serveur s'identifie ; un
  serveur anonyme n'est diagnosticable par personne.
- ⚠ **`connectMcp`, pas `registerMcp`** : le bloc n'a **aucun verbe**
  (`ARCHITECTURE.md`), donc rien à poser sur le registre. « Connecter » est le
  mot que la carte emploie déjà pour un bloc de frontière (`connect-ddb`).
- **Les flux sont injectés**, jamais pris : `src/mcp/` ne nomme jamais
  `process`. Une suite fait donc tourner le transport entier en mémoire.

**La racine de composition est `bin/fhpc-mcp.mjs`, et elle est HORS du bloc.**
Elle enregistre `layers` puis `build` sur le noyau — et `doc` **si et seulement
si** on lui a donné un magasin —, lit `package.json`, et passe
`process.stdin/stdout/stderr`. Elle est le seul fichier du chemin MCP
qui nomme `process` et le seul qui lise le disque — les deux sont interdits
dans `src/mcp/`. *Un adaptateur qui monte lui-même le domaine qu'il adapte
n'est plus un adaptateur.*

Lancement :

```
node bin/fhpc-mcp.mjs                              # sans magasin
node bin/fhpc-mcp.mjs --store <dossier>            # avec magasin
node bin/fhpc-mcp.mjs --store <dossier> --create   # …en créant le dossier
```

⚠️ **Le magasin n'a AUCUN défaut** — pas de `~/.fhpc`, pas de dossier courant
(décision D2 du bloc `doc` : *le personnage appartient au joueur*). Sans
`--store`, le bloc `doc` n'est pas monté et ses outils ne sont pas publiés :
le serveur ne promet pas une porte qui n'ouvre sur rien. Une option inconnue
est un **refus, code de sortie 2** — un serveur lancé avec `--stroe` qui
démarrerait quand même ferait croire au magasin jusqu'au premier `doc.save`,
c'est-à-dire jusqu'au moment où quelqu'un croit enregistrer.

## Verbes

**Aucun.** `ARCHITECTURE.md` donne à ce bloc « adaptateur : doc/build/play en
tools+resources », sans verbe, sans événement, sans état. Il ne s'enregistre
donc pas sur le registre du noyau, et l'instance rend `{name, handle}` : un
message MCP entre par `handle`, une réponse sort — ou `null` pour une
notification, à laquelle il ne **DOIT** rien être répondu. ⚠ question 3.

## Événements

**Aucun.** Le bloc n'émet rien sur le bus. Il ne s'y abonne pas non plus.

## Méthodes MCP servies

| Méthode | Rend | Notes |
|---|---|---|
| `server/discover` | `{supportedVersions, capabilities, instructions}` | **exigé** par la spécification. `capabilities` = `{tools:{}, resources:{}}` — ni `listChanged` ni `subscribe` : la liste d'outils ne change jamais, et rien ne s'abonne au M2 |
| `tools/list` | `{tools:[…]}` | ordonnée, et **fixe pour un serveur donné** : elle ne varie ni par connexion ni par effet de bord. Elle dépend en revanche des **blocs montés au démarrage** (câblage `doc`, 2026-08-08) — deux serveurs lancés différemment publient des catalogues différents, et chacun dit vrai sur lui-même |
| `tools/call` | `{content, structuredContent?, isError}` | voir « Les outils » |
| `resources/list` | `{resources:[la fiche ouverte]}` | une seule entrée, toujours la même |
| `resources/read` | `{contents:[{uri, mimeType, text}]}` | `-32602` si l'URI est inconnue **ou** si aucun personnage n'est ouvert |
| `initialize` | `-32601` **en nommant la révision parlée** | la spécification le demande : un client hérité n'a aucun mécanisme de rattrapage, et ce message est le seul diagnostic qu'il pourra montrer |

## Les outils

**Le nom d'un outil EST sa route.** `build.choose` appelle
`dispatch("build.choose", …)`. Ce n'est pas de la paresse : c'est le seul
nommage qui **n'invente rien** (loi §0.10). Le kickoff, `ARCHITECTURE.md` et
les deux contrats de bloc nomment déjà ces verbes ; un second vocabulaire
(`mount_layer`, `pick`, `apply`…) serait une table de correspondance à tenir,
donc une table qui divergera. La spécification autorise le point dans un nom
d'outil et en donne l'exemple (`admin.tools.list`). **Garde dédié**, attaqué.

| Outil | Arguments | Route | Rend (`structuredContent`) |
|---|---|---|---|
| `layers.register` | `{layer, origin?}` | `layers.register` | `{id, version, hash, name, lang, records}` |
| `layers.stack` | — | `layers.stack` | le manifeste de la pile, dans l'ordre |
| `layers.query` | `{kind, id?}` | `layers.query` | une vue, `null`, ou toutes les vues du genre |
| `build.choose` | `{path, ref:{kind,id}, label?, document?}` | `build.choose` | `{choice:{path, replaced, kind}}` |
| `build.set` | `{path, value, label?, document?}` | `build.set` | `{choice}` |
| `build.override` | `{path, value, by, note?, document?}` | `build.override` | `{override}` |
| `build.rebuild` | `{document?}` | `build.rebuild` | `{resolved, decisions, underived, unconsumed, overridesApplied, shadowed, warnings, diff}` |
| `build.validate` | `{document?}` | `build.validate` | `{ok, violations, warnings}` |
| `doc.open` ¹ | `{id}` | `doc.open` | `{id, hash, size}` — le document part au miroir, jamais au résultat |
| `doc.save` ¹ | `{document?, expect?}` | `doc.save` | `{id, hash, size, replaced}` |
| `doc.list` ¹ | — | `doc.list` | l'inventaire, une entrée par personnage, `ok:false` + `reason` pour les illisibles |
| `mcp.document` | — | **aucune** | le document `fh-char/1` ouvert, entier |

> ⚠ **`layer` est le TEXTE du fichier de couche, pas un objet.** Le bloc
> `layers` prend des **octets** parce que `build.layers[].hash` est le SHA-256
> **du fichier** ; un objet re-sérialisé ne les rend pas. La conséquence est
> mesurée et assumée : une ligne JSON-RPC de **3,08 Mo** pour la couche SRD FR.
> Elle passe (mesuré sur le vrai transport, ~100 ms), et le test de transport
> vérifie que l'empreinte qui en ressort est **celle que le personnage
> d'exemple déclare déjà**. Un octet perdu au passage la ferait diverger sans
> rien casser d'autre.

> ⚠ **`mcp.document` est le seul outil sans route**, et il porte le nom du
> bloc qui le fabrique : il rend le document que l'**adaptateur** tient en
> mémoire, ce qu'aucun bloc ne peut faire à sa place. Le préfixe `mcp.` ne se
> confond pas avec les verbes du bloc `doc`, arrivés depuis et routés sous
> leurs propres noms.

> ¹ **Les trois outils `doc` ne sont publiés que si le serveur a un magasin.**
> Câblage du 2026-08-08 : le lot 10 s'était interdit `open`/`save` pour ne pas
> préempter une tranche qui n'existait pas encore ; le lot 14 a livré le bloc,
> ces outils ne fabriquent donc plus rien — ils **routent**, comme les huit
> autres. `src/mcp/` ne gagne pas une ligne de disque.
>
> ⚠️ **`doc.save` sans argument enregistre le personnage OUVERT**, et c'est la
> seule entorse — mesurée — à « le miroir ne fait autorité sur rien » : le
> personnage d'exemple pèse **18 634 caractères**. Exiger que l'appelant le
> repasse, c'est le faire retranscrire par un modèle de langue entre
> `build.rebuild` et `doc.save`, alors que les deux bouts l'ont déjà exact —
> et un caractère faux donnerait un document corrompu **qui resterait valide au
> schéma**. Le miroir est remis **tel quel** au bloc, qui valide tout ce qui
> entre : il ne gagne aucune autorité, il évite une retranscription.

### Ce que la surface expose — et ce qu'elle n'expose pas

**Exposé** : monter une couche, lister la pile, **lire le contenu des
couches**, les cinq verbes de `build`, le document ouvert. Une resource.

**Non exposé, et pourquoi** :

| Non exposé | Raison |
|---|---|
| `layers.enable`, `layers.disable` | aucun besoin formulé au M2 (loi §0.6). Elles s'ajouteront le jour où une couche FH se monte et se démonte pour de vrai |
| `layers.flags`, `layers.ruleValues` | idem — et le pont clef de couche ↔ clef de règle du moteur est **ajourné** par l'arbitrage n°4 du lot 7 |
| tous les verbes de `play` | le bloc `play` n'est pas sur le chemin critique du M2. `ARCHITECTURE.md` l'annonce pour le bloc `mcp` ; ce lot ne l'a pas fabriqué faute de besoin formulé (⚠ question 6) |
| `doc.import`, `doc.export`, `doc.duplicate` | aucun besoin formulé (loi §0.6). `export` porte **en plus une décision non prise** : il rend des **octets**, et un octet ne traverse pas JSON-RPC sans un encodage à choisir (base64 ? texte ?). La choisir sans besoin serait inventer (loi §0.10) — elle se prendra le jour où quelqu'un veut le byte-identique de bout en bout |
| `outputSchema` sur les outils | ce serait une **deuxième copie** de la forme que `build` et `layers` rendent déjà, et **rien ne la comparerait**. Deux copies d'une règle divergent toujours sauf si quelque chose les compare (leçon `layers-document`) (⚠ question 4) |
| `prompts/*`, `subscriptions/*`, pagination, `resources/templates/list` | facultatifs, et sans besoin. Le M2 ne les demande pas |

> ⚠ **`layers.query` sans `id` peut être ÉNORME**, et c'est mesuré :
> `spell` = 339 records = **611 Ko** de résultat ; `class` = **175 Ko** ;
> `species` = 21 Ko ; un seul record = 3,1 Ko. La surface **ne projette pas**
> et **ne tronque pas** : ce serait un élagage silencieux, et l'appelant ne
> saurait pas ce qui a disparu. Il choisit, il paye. Une forme « index »
> (id + nom seuls) serait une invention : ⚠ question 7.

## Tranche d'état

**Aucune de domaine.** Le bloc tient **un miroir** : le dernier document que le
domaine lui a rendu (ou celui que l'appelant vient de lui passer).

| Champ | Forme | Note |
|---|---|---|
| le miroir | un document `fh-char/1`, ou `null` | servi par la resource et par `mcp.document`, et remis **tel quel** à `doc.save` quand l'appelant n'a pas passé de document. **Jamais écrit ici, jamais dérivé, jamais consulté par une règle** |

Le miroir se met à jour **aux deux bouts** — sur l'argument `document` reçu
**et** sur le `document` rendu. Il le faut : `build.validate({document})`
change le personnage ouvert du bloc `build` sans rien rendre, et ne suivre que
les résultats laisserait le miroir en retard sur ce que le domaine tient. Le
même chemin générique le remplit depuis `doc.open`, **sans que l'adaptateur
sache de quel verbe il vient** : un verbe qui rend `{document}` alimente le
miroir, point.

⚠️ **L'instance ne rend que `{name, handle}`.** Pas de `state`, pas de
poignée. Même forme que `layers` et `build`, et pour la même raison : c'est la
seule où « personne ne lit l'état d'un autre bloc » se **vérifie** au lieu de
se promettre.

## Invariants

1. **`src/mcp/` n'importe jamais `src/build/`, `src/layers/`, `src/play/`,
   `src/modules/`, `src/schemas/` ni `src/tools/`.** Le `dispatch` du noyau
   est le seul chemin vers le domaine. C'est l'interdit central du lot
   (décision D3) — garde structurel **récursif**, attaqué sur l'arbre réel, y
   compris dans un sous-répertoire.
2. **Zéro logique de règles.** Un appel d'outil est un `dispatch`, une réponse
   est un habillage. Aucun calcul, aucune valeur par défaut, aucune
   correspondance de vocabulaire.
3. **Le nom d'un outil EST sa route** (sauf `mcp.document`, sans route), et la
   liste des routes est comparée aux **verbes réels** des blocs. Un verbe
   renommé chez eux fait rougir ici.
4. **Une erreur d'OUTIL n'est pas une erreur de PROTOCOLE.**
   - refus de règle (`BuildError`, `LayerError`, tout jet d'un verbe) →
     **résultat marqué `isError: true`**, avec le **nom de la classe** et le
     message entiers. Le serveur survit, et le modèle peut se corriger.
   - requête malformée, méthode inconnue, **outil inconnu**, resource
     inconnue, `_meta` incomplet → **erreur JSON-RPC**.
   Jamais l'inverse, et **jamais un succès vide** (loi §0.5).
5. **Le nom de la classe d'erreur traverse.** ⚠️ Mesuré le 2026-08-08 :
   `BuildError` pose `this.name`, **`LayerError` ne pose rien** et se présente
   comme un `Error` nu. On lit donc `constructor.name`. Aucun `instanceof`
   n'est possible (invariant 1), et il n'y a aucune étape de compilation qui
   pourrait renommer une classe (loi §0.11). ⚠ question 8.
6. **`decisions`, `underived` et `shadowed` traversent jusqu'à l'IA**, dans le
   `structuredContent` **et nommés dans le texte**. C'est tout l'intérêt du
   M2 : la machine doit savoir ce qu'elle peut encore choisir et ce qui n'a
   **pas** pu être dérivé. Les avaler serait le repli silencieux que ce
   chantier combat. Éprouvé sur une décision réelle et sur un
   recouvrement **délibéré**, pas sur une pile qui n'en produit pas.
   ⚠️ **LOT 41** : `underived[]` porte `{field, key, params}`, pas une phrase
   (voir `contracts/build.md`, « Le carnet `underived` de `rebuild` »). Le
   `structuredContent` publie la forme structurée telle quelle — une IA qui
   garde un personnage lit désormais un identifiant, pas une phrase figée en
   français. Le **texte**, lui, continue de porter la raison en clair : ce
   fichier n'est ni `src/build/` ni `src/mcp/` (les deux s'interdisent
   `../modules/`, GARDE 1 de `tests/mcp-block.test.mjs`) — `src/mcp/tools.mjs`
   compose donc la ligne texte via la coercition `${entry}` de chaque entrée,
   qui porte déjà, depuis sa construction, le rendu FRANÇAIS lié à sa propre
   table (générique ou FH) — jamais en import direct d'un paquet de mots.
7. **Un argument inconnu est un REFUS**, jamais un argument ignoré. La liste
   des clefs vient du **schéma de l'outil**, jamais d'une seconde liste.
   Sans cette règle, `build.choose({pathh: …})` rendrait un succès sur une
   décision qui n'a pas été posée.
8. **Tout résultat porte `resultType` et l'identité du serveur**, écrits à un
   seul endroit (`resultResponse`). Sur un protocole sans session, c'est la
   seule façon pour un client de savoir à qui il parle.
9. **La version et les capacités sont vérifiées AVANT la méthode**, sur
   **chaque** requête. Une méthode servie sous une version inconnue serait
   servie sous des règles inconnues.
10. **Aucun message ne porte de saut de ligne littéral.** Vérifié à
    l'encodage, et le refus **jette** : un cadrage cassé désynchronise le
    client sur tout ce qui suit, et il n'existe aucune resynchronisation.
11. **`stdout` ne porte que des messages MCP.** Toute journalisation part sur
    `stderr`. Le client de test analyse **chaque** ligne : une ligne non-JSON
    devient du « junk », et le junk fait rougir.
12. **Le document ne repart jamais dans un résultat d'outil** : il a deux
    adresses, la resource et `mcp.document`, et pas une troisième. Ce n'est
    pas un élagage silencieux — les deux adresses sont dans la description de
    chaque outil.
13. **Aucun accès disque, aucun `process`, aucun réseau dans `src/mcp/`.**
    Le personnage appartient au joueur : c'est l'appelant qui enregistre, et
    rien ne survit à l'arrêt du processus. Éprouvé par une **conséquence
    observable** (deux processus successifs ne partagent rien), pas seulement
    par une inspection de code.

## Dépendances interdites

- **Tout import de `src/build/`, `src/layers/`, `src/play/`, `src/modules/`,
  `src/schemas/`, `src/tools/`** — l'interdit central.
- **Le disque** (`node:fs`, `node:path`, `readFileSync`, `writeFileSync`,
  `homedir`).
- **Le processus** (`process.*`, `node:child_process`, `spawn`) — les flux
  sont injectés. `node:child_process` est **autorisé dans la suite**, qui joue
  le rôle de l'IA.
- **Réseau** (`fetch`, `XMLHttpRequest`, `WebSocket`) et `setInterval`.
- **DOM** par ses formes atteignables. Comme aux blocs `layers` et `build`, le
  mot `document` n'est **pas** interdit : c'est le mot du domaine ici.
- **`Math.random`**, **`Date`** — l'adaptateur ne décide ni d'un hasard ni
  d'une heure.
- **Un id de couche ou une langue en dur.**
- **Le vocabulaire des mécaniques de couche** (loi §0.12), y compris dans les
  littéraux.

> **Ce qui n'est PAS interdit, et c'est un choix** : `setTimeout`. `stdio.mjs`
> n'en emploie aucun, mais un minuteur y serait un outil de **transport**
> légitime, pas une mécanique de règle. Interdire une porte qu'on n'a pas de
> raison de fermer est un garde décoratif.

> **Ce qui n'est PAS interdit non plus** : le vocabulaire de jeu français. À
> la différence de `src/build/`, ce bloc **est** l'interface — les
> descriptions d'outils sont des MOTS par nature (loi §0.13 : « le moteur
> produit des identifiants, **l'interface produit des mots** »). ⚠ question 9
> sur leur **langue**.

## Dépendances de dév introduites

**Aucune.** `ajv 8.20.0` était déjà là. Le protocole est écrit à la main
(décision D1) : `@modelcontextprotocol/sdk` est une dépendance de **runtime**,
et la loi §0.11 est absolue.

> ⚠️ Un relâchement d'`ajv` est **nommé** dans la suite : `allowUnionTypes`.
> `ajv` en mode strict refuse `"type": ["string","number",…]`, que JSON
> Schema 2020-12 autorise et que MCP exige de supporter ; `build.set` en a un
> besoin réel (« un scalaire, jamais une structure » **est** une union de
> types primitifs). C'est une opinion d'`ajv`, pas une règle du dialecte.

## Obligations de test

1. **Le test d'acceptation** (`mcp-acceptance`) : le magicien elfe niveau 1
   est construit **de bout en bout à travers la surface MCP seule**, sur la
   vraie matière (couche SRD FR, 1 309 records, 3,1 Mo, montée par l'outil),
   et son `resolved` est celui du fichier d'exemple — les dix-huit compétences
   **nommément**, les overrides en dernier, les huit sorts.
2. **⚠️ « PAR LA SURFACE SEULE » EST VÉRIFIÉ, PAS PROMIS.** Un garde lit la
   source de `mcp-acceptance.test.mjs` **et** de `mcp-harness.mjs` et rougit
   sur un appel à `dispatch`, un accès à `.verbs`, un appel au dériveur ou
   l'import d'un rouage interne. Attaqué dans les deux sens — un `index.mjs`
   importé pour monter les blocs reste légitime.
3. **Le pendant de transport** (`mcp-transport`) : le serveur lancé comme un
   **vrai processus enfant**, le personnage construit à travers le tuyau, et
   ce que seul ce chemin peut voir — le cadrage, la propreté de `stdout`,
   l'UTF-8 à travers les frontières de morceaux (l'empreinte SRD est
   **identique** à celle du fichier d'exemple), l'arrêt sur fermeture de
   l'entrée (code 0).
4. **La séparation des deux erreurs**, sur la ligne : un refus de règle rend
   `isError: true` **et le serveur répond encore après** ; un outil inconnu,
   une méthode inconnue, une resource inconnue, un `_meta` absent, une version
   non supportée rendent des **erreurs JSON-RPC** aux codes de la
   spécification.
5. **Le cadrage lui-même** : JSON illisible → `-32700` avec `id: null` ; ligne
   vide → **rien** ; notification → **rien** ; message sérialisé sans saut de
   ligne littéral, vérifié sur un texte long et multiligne.
6. **`decisions`, `underived` et `shadowed` traversent** — `decisions` est
   éprouvé sur le vrai plan de compétences, et `shadowed` sur une **couche de
   scénario qui recouvre délibérément** un record du SRD, avec son **pendant**
   (sans elle, la liste est vide). ⚠️ Un test qui montre un refus ne
   s'appuie jamais sur une pénurie de circonstance.
7. **Les gardes STRUCTURELS et leurs ATTAQUES** (`mcp-block`) : chaque
   interdit violé une fois dans une source fabriquée, vu **et nommé** ; le
   périmètre est une **liste de noms**, attaqué à vide et amputé ; l'arpenteur
   éprouvé sur un **vrai sous-répertoire**, créé puis retiré.
8. **Le catalogue est conforme** : noms dans la charte de la spécification,
   uniques ; `inputSchema` compilé par `ajv` ; liste d'arguments **fermée**
   dans le schéma **et tenue à l'exécution**.
9. **L'ATTAQUE RÉELLE DE L'ARBRE**, hors suite, journalisée dans le rapport de
   lot : **vingt-huit** violations délibérées posées dans les vrais fichiers
   de `src/mcp/` et des deux suites, **vingt-huit rouges nommées**, arbre
   restauré.
10. ⚠️ **UN TEST QUI PEND EST PIRE QU'UN TEST ROUGE.** Le harnais de transport
    prend le contexte du test et ferme son processus enfant à la sortie, avec
    un `SIGKILL` de secours. Mesuré en écrivant ce lot : une assertion qui
    échoue sautait par-dessus le `close()`, l'enfant restait vivant, et le
    lanceur attendait une poignée qui ne se fermerait jamais.

## ⚠ Points ouverts, pour l'architecte

Repris en détail, avec leur mesure, dans `QUESTIONS-ARCHITECTE.md`.

1. **La décision D2 (« un document ouvert pour la durée de la session ») a été
   prise avant que la révision `2026-07-28` soit lue — et cette révision est
   STATELESS.** Le lot tient les deux sans en maquiller aucune (argument
   `document` optionnel sur chaque outil de `build`). À trancher.
2. L'URI de la resource : `fh-char:///open`.
3. Le bloc `mcp` **sans verbe** et **hors registre**.
4. Pas d'`outputSchema`.
5. Le garde §0.12 partagé ne voit pas les formes camelCase (mesuré).
6. `play` n'est pas exposé.
7. `layers.query` sans `id` : 611 Ko pour le genre `spell`.
8. `LayerError` ne pose pas son `name`.
9. La langue des descriptions d'outils.
