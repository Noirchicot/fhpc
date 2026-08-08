# Contrat de bloc — doc

> Rempli par le lot **`14-bloc-doc`** le 2026-08-08.
> **À ratifier par l'architecte avant merge.** Les points soumis à décision
> sont marqués ⚠ et repris dans `QUESTIONS-ARCHITECTE.md`.
>
> Il hérite des arbitrages de `contracts/layers.md`, `contracts/build.md` et
> `contracts/mcp.md` et ne les rouvre pas — en particulier la **décision D2 du
> lot 10** : au M2 aucun bloc ne possédait le stockage, et l'adaptateur MCP
> s'est délibérément interdit un verbe `open`/`save` pour laisser cette
> tranche-ci libre. Ce lot ne touche pas à `src/mcp/`.

## Nom

`doc`

## Rôle (2 lignes)

Gère les documents `fh-char/1` au repos (stockage local) : ouverture,
sauvegarde, liste, import/export, duplication. Ne connaît ni les règles ni la
séance de jeu.

---

## Construction

```js
createDoc({ storage, schema, bus, now })   // une instance
registerDoc({ storage, schema, now })      // l'instance du noyau, sur le bus J0
```

| Argument | Obligatoire | Pourquoi |
|---|---|---|
| `storage` | **oui** | Le **port de stockage**, injecté (décision D1). Trois méthodes : `list()`, `read(key)`, `write(key, bytes)`. |
| `schema` | **oui** | Le document `fh-char/1`, chargé **par l'appelant** — `src/doc/` ne lit pas de fichier, et un schéma est un fichier. Le bloc **génère** sa liste blanche à partir de lui : aucune règle n'est recopiée en code. |
| `bus` | **oui** | Un document qui s'ouvre ou se sauvegarde sans l'annoncer est un changement que personne ne peut suivre. |
| `now` | non | L'horloge, injectable. Seule `duplicate` l'emploie. Défaut de plate-forme dans `src/doc/clock.mjs`, seul fichier du répertoire autorisé à nommer `Date` (même partage qu'au bloc `build`). |

**Il n'y a aucun défaut**, ni pour la racine du magasin, ni pour le schéma :
un défaut serait un chemin en dur (D2) ou une règle devinée (D3).

### Le port de stockage

```js
{
  list()            // → string[]  : les clefs présentes
  read(key)         // → octets, ou `null` si la clef est absente
  write(key, bytes) // → void      : pose ces octets sous cette clef
}
```

Trois méthodes, et pas une quatrième. Il n'y a **pas de `remove`** : aucun
verbe du kickoff ne supprime, et fabriquer une porte de suppression pour un
besoin que personne n'a formulé est interdit (loi §0.6). Un port incomplet est
un **refus à la construction**, jamais un cas à contourner.

**Une implémentation système de fichiers est livrée, HORS du bloc** :
`src/storage/fs.mjs`, `createFsStorage({ root, create })`.
`<clef>.fh-char.json`, à plat dans la racine, écriture atomique (fichier
temporaire puis `rename`). Elle est le pendant de `bin/fhpc-mcp.mjs` : le seul
fichier du chemin `doc` qui nomme `node:fs`, `node:path`, un séparateur ou une
extension.

## Verbes

Seul point d'entrée du bloc. Route `doc.<verbe>` via `dispatch` du noyau.
Un verbe inconnu jette en le nommant (loi §0.5, tenu par le registre J0).

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `open` | `{id}` | Lit, valide, rend `{id, document, hash, size}`. Émet `doc-opened`. Retient l'empreinte lue (témoin de collision). | id hors forme, document absent, JSON illisible, schéma inconnu, document invalide, clef ≠ `document.id` → **jette** |
| `save` | `{document, expect?}` | Sérialise en octets **canoniques** et écrit. Rend `{id, hash, size, replaced, document}`. Émet `doc-saved` (`reason: "save"`). | document invalide, collision d'écriture → **jette** |
| `list` | — | L'inventaire : `[{id, ok, hash, size, name, lang, level, created, modified}]`, trié par id. Une entrée cassée porte `ok:false` et sa `reason`. **Seul verbe qui ne jette pas.** | le magasin lui-même en panne → **jette** |
| `import` | `{bytes, as?, expect?}` | Valide des octets étrangers et les stocke **tels quels**. `as` renomme — et réécrit alors le `id` **dans** le document, ce qui re-sérialise. Rend `{id, hash, size, replaced, renamed, document}`. Émet `doc-saved` (`reason: "import"`). | `bytes` absent ou non-octets, `as` hors forme, document invalide, collision → **jette** |
| `export` | `{id}` | Rend **les octets du magasin**, à l'octet près : `{id, bytes, hash, size}`. N'émet rien. | document absent, document stocké invalide → **jette** |
| `duplicate` | `{id, as}` | Copie sous un id neuf **que l'appelant nomme**, avec `created`/`modified` = `now()`. Rend `{id, from, hash, size, replaced, document}`. Émet `doc-saved` (`reason: "duplicate"`). | `as` absent, `as` = `id`, `as` déjà pris, source absente ou invalide → **jette** |

> Le kickoff écrit `open, save, list, import, export, duplicate` — les six y
> sont, sous ces noms, et il n'y en a pas un septième.

**Tout ce qui sort est cloné** : documents (`structuredClone`) et octets
(`Buffer.from`). L'appelant ne tient jamais l'objet du bloc.

## Événements

| Type | Payload | Quand |
|---|---|---|
| `doc-opened` | `{id, hash, size}` | À chaque `open` réussi. |
| `doc-saved` | `{id, hash, size, reason, replaced}` | À chaque écriture réussie. `reason` ∈ `save` \| `import` \| `duplicate`. |

⚠ **`reason` plutôt qu'un troisième type d'événement.** `ARCHITECTURE.md` donne
deux événements à ce bloc et deux seulement ; inventer `doc-imported` serait
inventer un nom (loi §0.10). Le champ `reason` est l'idiome déjà employé par
`layers-changed`. **À ratifier** (question 3).

Aucun horodatage n'est mis dans la charge utile : le bus du noyau en pose un
lui-même (`src/kernel/bus.mjs`), et un champ que le bus écrase selon qui l'a
fourni serait un champ qui ment une fois sur deux.

## Tranche d'état

`doc` seul l'écrit — **et personne ne la lit.**

| Champ | Forme | Note |
|---|---|---|
| les documents au repos | dans le **magasin injecté** | le bloc les possède au sens de la carte : lui seul y écrit. Il ne les tient pas en mémoire. |
| le registre de lecture | `Map<id, empreinte>` | ce que le bloc a **réellement** lu ou écrit. Ce n'est pas un cache — rien n'est servi depuis lui — c'est le témoin qui rend la collision d'écriture détectable. Ne sort jamais. |

⚠️ **Le bloc ne tient AUCUN personnage ouvert.** `build` possède déjà « le
personnage ouvert » ; en tenir un second ici ferait deux propriétaires pour une
seule chose, et le test d'acceptation de la carte l'interdit (« toute feature
écrit l'état d'UN seul bloc »). `open` lit et rend.

⚠️ **L'instance ne rend que `{name, verbs}`.** Pas de `state`, pas de poignée.
Même forme que `layers`, `build` et `mcp`, et pour la même raison : c'est la
seule où « personne ne lit l'état d'un autre bloc » se **vérifie** au lieu de
se promettre.

---

## Les trois réponses demandées par l'architecte

### 1. L'identité — deux documents de même `id` dans un magasin

**Ça ne peut pas arriver : la clef du magasin EST le `id` du document.** Le
schéma dit de `id` que « l'unicité est garantie par le bloc `doc`, pas par le
schéma » ; c'est la seule façon de la garantir sans tenir un index — un index
serait une seconde vérité, et une seconde vérité diverge.

La correspondance est vérifiée **aux deux bouts** :

- **à l'écriture**, la clef est **dérivée** du document et jamais reçue à côté
  de lui. Aucun verbe n'accepte un argument « où le ranger » : il n'y a donc
  pas de geste qui puisse les faire diverger ;
- **à la lecture**, un magasin trafiqué à la main (un fichier renommé, un
  document recopié sous deux noms) est **nommé et refusé**, par ses deux
  identités. `open`, `export` et `duplicate` jettent ; `list` le rapporte avec
  sa raison.

La question « lequel gagne ? » devient donc la question de la collision
d'écriture — **traitée, pas subie**.

### 2. La collision d'écriture — on refuse, et le choix explicite a une forme

**Le dernier ne gagne pas en silence.** La leçon n°1 dit que le vide ne bat
jamais le rempli **sans choix explicite de l'utilisateur** : voici la forme de
ce choix.

Le témoin est une **empreinte de contenu** (SHA-256 des octets stockés), pas
un verrou : un verrou dans un magasin de fichiers ment dès qu'un processus
meurt, et ce produit doit marcher hors ligne, sur trois appareils.

1. **La boucle ordinaire ne demande rien.** Le bloc sait ce qu'il a lu ou
   écrit ; `open` → modifier → `save` passe.
2. **Ce qu'il n'a pas lu, il ne l'écrase pas.** Un document posé là par une
   session précédente ou par quelqu'un d'autre fait **refuser** `save`, et le
   refus dit les deux issues : l'ouvrir d'abord, ou déclarer ce qu'on écrase
   par `{expect: "<empreinte>"}` — l'empreinte que `list()` rend.
3. **Ce qui a bougé sous lui, il le dit.** Deux écritures qui se croisent :
   refus, avec **les deux empreintes**, et la marche à suivre (relire, rejouer,
   réécrire).
4. **`expect: null` veut dire « je crée »**, et il est vérifié dans les deux
   sens : quelque chose est déjà là → refus ; l'empreinte attendue a disparu →
   refus aussi (recréer en silence un document qu'on croyait modifier est la
   même faute dans l'autre sens).

**Un refus laisse le magasin exactement où il était.** Éprouvé.

### 3. `export` rend des OCTETS, jamais un chemin

C'est la seule réponse cohérente avec D1 : le bloc ne connaît pas le disque,
il ne peut donc pas nommer un endroit où il aurait écrit. Il ne nomme pas non
plus de **fichier** — choisir un nom de fichier, c'est déjà décider à la place
du joueur (D2). L'appelant reçoit `{id, bytes, hash, size}` et fait ce qu'il
veut : l'écrire, l'envoyer, le coller dans un message.

Corollaire, et c'est ce qui rend « byte-identique » vrai plutôt
qu'approximativement vrai : **`export` rend les octets du magasin sans les
re-sérialiser**, et **`import` stocke les octets reçus tels quels**. Ce qui
entre en octets ressort les mêmes ; ce qui entre en objet (la sortie de
`build.rebuild`) reçoit des octets canoniques (JSON, deux espaces, saut de
ligne final ; **l'ordre des clefs n'est pas trié** — le trier réécrirait
silencieusement un fichier que quelqu'un a rangé à la main).

---

## Invariants

1. **`src/doc/` n'importe jamais `node:fs` et ne nomme aucun chemin** — ni
   racine, ni séparateur, ni extension, ni nom de fichier. C'est l'interdit
   central du lot (décisions D1 et D2) — garde structurel **récursif**, attaqué
   sur l'arbre réel, y compris dans un sous-répertoire.
2. **Rien n'entre dans le magasin sans valider `fh-char/1`**, et rien n'en
   sort par `open`/`export`/`duplicate` sans valider non plus. Un refus est
   **bruyant de bout en bout** et **nomme toutes ses raisons d'un coup**, avec
   le **chemin** de chaque champ fautif.
3. **Une seule liste blanche, GÉNÉRÉE du schéma.** `src/doc/schema.mjs`
   compile le sous-ensemble de JSON Schema 2020-12 que `fh-char/1` emploie et
   applique le fichier de schéma lui-même. Aucune règle n'est recopiée en
   code — donc aucune ne peut diverger. **Un mot-clef non pris en charge fait
   JETER la compilation** en le nommant : une règle ajoutée au contrat ne peut
   pas rester silencieusement inappliquée.
4. **L'état de séance ne voyage pas.** Tous les objets de `fh-char/1` sont
   fermés ; un document qui transporte une transaction, une main, un plateau,
   une sélection ou un historique est refusé, et le refus **nomme** ce qui est
   refusé et à qui il appartient (`play`). Les ressources comptées et les
   `vitals`, eux, voyagent : ils vivent dans `resolved`.
5. **La clef du magasin EST le `id` du document**, vérifié à l'écriture et à
   la lecture (voir réponse 1).
6. **Le dernier ne gagne pas en silence** (voir réponse 2).
7. **`save` ne touche à RIEN du contenu** — pas même `modified`. Un bloc qui
   réécrit ce qu'on lui confie rend deux sauvegardes du même document
   différentes, et l'empreinte cesse d'être un témoin. Les **deux seuls
   champs** que ce bloc écrit dans un document sont `created` et `modified`
   d'une **copie** (`duplicate`), plus son `id` — une copie est un document
   neuf, et un document neuf qui prétend avoir été créé avant d'exister est un
   mensonge daté.
8. **`list` est le seul verbe indulgent, et il l'est pour ne rien cacher.**
   Une entrée illisible est **rapportée** (`ok:false` + `reason`), jamais
   sautée : un inventaire qui cache un fichier est pire qu'un inventaire qui
   en montre un cassé. Le refus reste entier aux autres portes.
9. **Tout ce qui sort est cloné.**
10. **Les clefs dangereuses sont refusées PENDANT `JSON.parse`**, par le
    reviver, avant qu'un seul objet du document existe — et la liste vient de
    `$defs/safeKey` du schéma, pas d'une copie. Plus strict que le schéma
    (qui ne l'impose qu'aux valeurs d'override) : une clef nommée `__proto__`
    n'a rien à faire dans un personnage, où qu'elle soit.
11. **Aucun réseau, aucune synchronisation.** La baseline du voyage est le
    fichier ; personne n'a formulé le besoin d'autre chose (loi §0.6).

## Dépendances interdites

- **Le disque** (`node:fs`, `node:path`, `node:os`, toute opération de
  fichier, `homedir`, `tmpdir`, `import.meta.url`, `fileURLToPath`).
- **Tout chemin** : littéral commençant par un chemin, séparateur nu, chemin
  recollé dans un gabarit, nom de fichier de données, `.fhpc`, le module
  `path`, `sep`.
- **Le processus** (`process.*`, `node:child_process`, `spawn`) — une racine
  de magasin qui viendrait de l'environnement serait un chemin choisi par le
  bloc, pas par le joueur.
- **Réseau** (`fetch`, `XMLHttpRequest`, `WebSocket`) et `setInterval`.
- **DOM** par ses formes atteignables, plus `localStorage` et `indexedDB`.
  Comme aux blocs `layers`, `build` et `mcp`, le mot `document` n'est **pas**
  interdit : c'est le mot du domaine ici, et le plus employé du bloc.
- **`Math.random`** partout ; **`Date`** partout sauf `clock.mjs`.
- **Un id de couche ou une langue en dur.**
- **Tout import de `src/build/`, `src/layers/`, `src/play/`, `src/modules/`,
  `src/mcp/`, `src/tools/` — et de `src/storage/`.** Ce dernier est le cœur de
  D1 : un bloc qui importe son magasin ne le reçoit plus, et le garde tombe.
  `src/schemas/invariants.mjs` est **autorisé et voulu** : ce module existe
  pour que les invariants que JSON Schema ne sait pas dire s'appliquent au même
  endroit chez `build` et ici.
- **Le vocabulaire des mécaniques de couche** (loi §0.12), y compris dans les
  littéraux.

## Dépendances de dév introduites

**Aucune.** `ajv 8.20.0` était déjà là, et elle ne valide rien à l'exécution
(loi §0.11) : elle sert de **juge** au validateur du bloc dans la suite.

---

## Comment le MCP s'y branchera (⚠ pas fait par ce lot — décision D5)

Le lot 10 tient **un** document en mémoire, servi par la resource
`fh-char:///open` et par l'outil `mcp.document`, et il s'est explicitement
interdit `open`/`save`. Le câblage est un **lot d'après**. Ce que ce contrat
promet à ce lot-là :

| Outil MCP | Route | Note |
|---|---|---|
| `doc.list` | `doc.list` | l'inventaire, sans argument — la seule surface qui ne peut pas être énorme |
| `doc.open` | `doc.open` | son résultat alimente le **miroir** du bloc `mcp`, exactement comme un résultat de `build` aujourd'hui |
| `doc.save` | `doc.save` | `{document?, expect?}` — le `document` peut venir du miroir, ce qui referme la boucle `build` → `doc` sans que les deux blocs se connaissent |
| `doc.import` / `doc.export` | idem | ⚠️ **les octets ne sont pas du JSON-RPC confortable** : `export` rend des octets, et la surface devra choisir entre du texte UTF-8 et une resource. Le précédent existe (`layers.register` fait passer 3,08 Mo de texte, mesuré) |
| `doc.duplicate` | `doc.duplicate` | `as` obligatoire tant que la question 2 n'est pas tranchée |

**Le nom d'un outil EST sa route** (contrats/mcp.md) : rien à inventer.
`mcp.document` garde son préfixe et ne peut pas être confondu avec ces
verbes-ci. La **racine de composition** (`bin/fhpc-mcp.mjs`) devra construire
le magasin — et c'est **elle** qui recevra la racine du répertoire, pas le
bloc.

## Obligations de test

1. **Le test d'acceptation** (`doc-acceptance`), sur les octets du **vrai**
   fichier d'exemple : sauvegardé, listé, rouvert, exporté, réimporté dans un
   magasin **vierge**, et **byte-identique** au bout du voyage. Le même
   parcours est rejoué pour un document arrivant **en mémoire** (la sortie de
   `build.rebuild`), avec son **pendant** : les octets canoniques ne sont pas
   ceux du fichier, et c'est précisément pourquoi `import` ne re-sérialise pas.
2. **Les trois refus, chacun nommant sa raison** : JSON corrompu, schéma
   inconnu, état de séance — et **le magasin reste vierge** après chacun.
   Chaque refus a son **témoin** : le même document sans la faute entre.
3. **Le juge** (`doc-schema`) : `ajv` et le validateur du bloc rendent le même
   verdict sur un corpus de **45 documents** — **38 fautes** délibérées, une à
   la fois, et **7 témoins d'admission**. Le verdict attendu est écrit à la
   main, jamais déduit du juge : un corpus dont la réponse vient de l'arbitre
   ne prouve que l'accord de deux copies d'une même erreur.
4. **La liste des mots-clefs pris en charge couvre EXACTEMENT ce que le schéma
   emploie**, dans les deux sens : un mot-clef employé et non supporté fait
   jeter la compilation ; un mot-clef supporté et non employé est du code que
   rien ne prouve, et le test le refuse aussi.
5. **Les gardes STRUCTURELS et leurs ATTAQUES** (`doc-block`) : chaque
   interdit violé une fois dans une source fabriquée, vu **et nommé** ; le
   périmètre est une **liste de noms**, attaqué à vide et amputé ; l'arpenteur
   éprouvé sur un **vrai sous-répertoire**, créé puis retiré ; l'exemption
   d'horloge prouvée **dans les deux sens**, et sur le vrai `clock.mjs`.
6. **La frontière a un autre côté, et il est habité** : un test exige que
   `src/storage/fs.mjs` nomme **réellement** `node:fs`, l'écriture et le
   renommage atomique. Sans lui, « zéro disque dans `src/doc/` » se tiendrait
   aussi bien dans un dépôt où rien n'écrit jamais de fichier.
7. **Le magasin système de fichiers sur un VRAI disque**, dans un répertoire
   **temporaire** (une suite ne mute jamais l'arbre de travail — lot 13) : le
   voyage complet, le nom du fichier, l'absence de fichier partiel, les clefs
   dangereuses refusées, et la **conséquence observable** — un second bloc
   monté sur la même racine voit le personnage. Une inspection de code ne
   prouve pas la persistance.
8. **L'ATTAQUE RÉELLE DE L'ARBRE**, hors suite, journalisée dans le rapport de
   lot : **trente-six** violations délibérées posées dans les vrais fichiers de
   `src/doc/`, **trente-six rouges**, arbre restauré. Un garde vert qui n'a
   jamais échoué exprès ne prouve rien.
9. **Aucun octet écrit sur le disque par les suites d'acceptation et de
   schéma** — ce qui n'est possible que parce que le stockage est injecté.

## ⚠ Points ouverts, pour l'architecte

Repris en détail, avec leur mesure, dans `QUESTIONS-ARCHITECTE.md`.

1. Le **schéma est injecté** comme le magasin — `src/doc/` ne lit pas de
   fichier, et un schéma est un fichier.
2. **`duplicate` exige `as`** : le bloc ne fabrique aucun identifiant.
3. **`doc-saved` porte une `reason`** plutôt qu'un troisième type d'événement.
4. **Aucun verbe de suppression**, et le port n'a pas de `remove`.
5. **`export` ne prend qu'un `id`**, pas un document en mémoire.
6. Les **octets à travers MCP** — la question que le câblage devra trancher.
