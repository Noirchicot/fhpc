# Contrat de bloc — layers

> Rempli par le lot **`7-bloc-layers`** (kickoff §L7), le 2026-08-08.
> **À ratifier par l'architecte avant merge.** Les points soumis à décision
> sont marqués ⚠ et repris en fin de fichier.
>
> ⚠️ **NE PAS CONFONDRE AVEC `src/modules/fh/`.** Un **module moteur** est du
> code activé par un drapeau (décision Q4) ; une **couche** est un document de
> données qui, entre autres, lève ce drapeau. Le nom `src/layers/` a été libéré
> exprès pour ce bloc le 2026-08-08 ; les modules moteur ne reviennent pas.

## Nom

`layers`

## Rôle (2 lignes)

Charge et sert le contenu des couches `fh-layer/1` (enregistrement,
activation/désactivation, requêtes par genre+id) et maintient la pile active.
Données pures, jamais d'exécutable.

## Construction

```js
createLayers({ bus, ruleValueKeys })      // une instance
registerLayers({ ruleValueKeys })         // l'instance du noyau, sur le bus J0
```

- `bus` : **obligatoire**. Une pile qui change sans l'annoncer est un
  changement que personne ne peut suivre.
- `ruleValueKeys` : les clefs de `ruleValues` que **le moteur déclare savoir
  lire**. Absente, toute couche portant des `ruleValues` est **refusée** —
  refuser ce qu'on ne sait pas vérifier vaut mieux que l'accepter sans le
  vérifier (loi §0.5). ⚠ voir point ouvert 4.

**Le bloc ne lit pas le disque.** Une couche entre par ses **octets**
(`register({bytes})`) : qui possède le fichier le lit. Deux raisons, toutes
deux dures — `build.layers[].hash` est le SHA-256 des **octets du fichier**
(un objet re-sérialisé ne les rend pas), et lire un fichier appartient au bloc
qui possède le stockage, pas à celui qui possède le contenu.

## Verbes

Seul point d'entrée du bloc. Route `layers.<verbe>` via `dispatch` du noyau.
Un verbe inconnu jette en le nommant (loi §0.5, tenu par le registre J0).

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `register` | `{bytes, origin?}` | Lit, valide, empreinte, **empile au-dessus** et replie. Rend `{id, version, hash, name, lang, records}` — les trois premiers sont exactement ce que `build.layers[]` exige. `origin` est un libellé pour les messages (un chemin de fichier, en général). | pas d'octets, JSON illisible, forme invalide, clef interdite, id déjà monté, pli impossible → **jette** |
| `enable` | `{id}` | Fait re-participer une couche montée, **à sa place** dans la pile. Rend `{id, enabled, changed}`. | id non monté → **jette** en nommant la pile |
| `disable` | `{id}` | Retire une couche de la pile **active** ; elle reste montée, à sa place. Rend `{id, enabled, changed}`. | idem |
| `query` | `{kind, id?}` | **Le seul chemin de lecture du contenu.** Avec `id` : la vue pliée, ou `null`. Sans : toutes les vues du genre. | `kind` hors des 14 genres → **jette** |
| ⚠ `flags` | — | Les drapeaux levés par la pile active, triés, sans doublon. | — |
| ⚠ `ruleValues` | — | Les valeurs de règle de la pile active. | — |
| ⚠ `stack` | — | Le manifeste de la pile, dans l'ordre : `{id, version, hash, name, lang, enabled, flags, records}`. | — |

> ⚠ **Trois verbes en plus des quatre du kickoff.** La table de
> `ARCHITECTURE.md` se dit « échantillon », et les trois répondent à des
> exigences explicites de §L7 : « `flags` et `ruleValues` sont exposés
> séparément » (§L7.3) en demande deux, et le bloc `build` a besoin du
> manifeste pour écrire `build.layers[]`. **À ratifier.**

> ⚠ Le kickoff écrit `query(kind, id)` ; le verbe prend un **payload**
> `{kind, id}` comme tous les verbes du dépôt — `dispatch` ne passe qu'un
> argument.

## Événements

| Type | Payload | Quand |
|---|---|---|
| `layers-changed` | `{reason, stack, counts, total, flags, ruleValues, shadowed}` | À chaque changement RÉEL de la pile (`register`, `enable`, `disable`). Un `enable` sur une couche déjà allumée rend `changed:false` et **n'émet rien** : on n'annonce pas un changement qui n'a pas eu lieu. |

`shadowed` liste les `add` qu'un `add` d'une couche plus haute a recouverts
(`{kind, id, by, over}`). « Le dernier qui parle gagne » reste la règle ; le
recouvrement, lui, ne se fait pas en silence.

## Tranche d'état

`layers` seul l'écrit — **et personne ne la lit.**

| Champ | Forme | Note |
|---|---|---|
| la pile montée | `[{id, document, hash, origin, enabled}]`, dans l'ordre d'enregistrement | l'ordre EST la pile : SRD dessous, FH par-dessus, homebrew au-dessus |
| le pli | `Map<genre, Map<id, vue>>` + `{shadowed, flags, ruleValues, counts, total}` | recalculé de zéro à chaque changement |

⚠️ **L'instance ne rend que `{name, verbs}`.** Pas de `state`, pas de poignée
de rouages, pas de carte. Ce n'est pas de la pudeur : c'est la seule forme où
« personne ne lit l'état d'un autre bloc » se **vérifie** au lieu de se
promettre, et le test d'acceptation §L7 l'exige mot pour mot (« sans qu'aucun
autre bloc n'ait lu son état »). C'est une **différence assumée** avec le bloc
`play`, qui expose `state` et `engine` parce que ses suites portées les
tenaient déjà en v1.

### La vue rendue par `query`

```js
{ kind, id, record: {name, slug?, data, attribution?, source?, contentHash?}, provenance }
provenance = { from: <id de la couche qui a posé le record>,
               patchedBy: [{by: <id de couche>, applied: [{path, created}]}] }
```

La vue est **gelée en profondeur** (le pli partage ses records avec les
documents analysés : un consommateur qui muterait ce qu'il a reçu corromprait
la pile de tout le monde). Le gel est **paresseux**, à la lecture — geler
2 613 records dont personne ne lira la moitié serait payer plein tarif pour une
garantie qu'on ne consomme pas.

## Invariants

1. **`query` est le seul chemin de lecture du contenu.** Un genre hors des 14
   **jette** : une requête sur `spel` rendrait une liste vide, et une liste
   vide ressemble à une réponse.
2. **La pile est ordonnée et le pli est le sien.** Le dernier qui parle gagne.
   `add` pose, `patch` modifie par id, `disable` retire.
3. **Un `patch` ou un `disable` qui vise un record absent est un échec
   bruyant** (§L7.2). Sans lui, une couche écrite pour une autre pile
   s'appliquerait à moitié, en silence, et la table jouerait une fiche fausse.
   ⚠ Le disable-dans-le-vide n'est pas nommé par §L7 ; ce lot l'a rendu
   bruyant par le même raisonnement (point ouvert 2).
4. **Retirer une couche rend ce qu'elle avait pris.** Vrai *par
   reconstruction* : le pli est recalculé de zéro, il n'y a aucun état
   d'annulation à tenir.
5. **Le pli est transactionnel.** Une couche qui échoue est démontée et
   l'erreur remonte : jamais de pile à moitié pliée.
6. **`flags` et `ruleValues` sont deux surfaces séparées** (révision du
   2026-08-08) : « ce module tourne-t-il ? » contre « quel nombre le moteur
   applique-t-il ? ». Une clef de règle inconnue du moteur est **rejetée** ;
   deux couches sur la même clef sont une **ambiguïté** qui jette (même règle
   que `session.mjs` pour les `rules` de module).
7. **Zéro exécutable.** Les clefs dangereuses sont refusées **pendant**
   `JSON.parse`, avant qu'un objet existe — une passe de nettoyage *après*
   arriverait après la pollution qu'elle prétend empêcher, et un « strip »
   silencieux est le contre-modèle de la loi §0.5. Le pli tient ses records
   dans des `Map`, immunisées par construction.
8. **Aucune correspondance FR↔EN.** Les deux couches SRD sont autonomes ; rien
   dans `src/layers/` ne nomme une langue ni une couche (garde structurel). La
   pile **lit** `lang`, elle ne le devine jamais.
9. **Un patch touche `name`, `slug`, `data` — et rien d'autre.** ⚠ Règle posée
   par ce lot (point ouvert 3) : `attribution` est refusé parce qu'une couche
   homebrew ne doit pas pouvoir décrocher la notice CC-BY d'un record SRD dont
   elle dérive (loi §0.8) ; `source` parce qu'un patch ne déplace pas un record
   dans un autre livre ; `contentHash` parce qu'on ne signe pas soi-même le
   paquet qu'on vient de modifier. **Un record patché perd son `contentHash`** :
   le certificat ne décrit plus son contenu.
10. **Le déterminisme du pli.** Les chemins d'un `changes` sont appliqués dans
    l'ordre trié : deux exécutions donnent le même record, même si deux chemins
    se recouvrent.

## Dépendances interdites

- **Le disque** (`node:fs`, `node:path`, `readFileSync`, `homedir`) — une
  couche entre par ses octets. Garde structurel.
- **DOM, `window`, `localStorage`, `innerHTML`, `querySelector`**. ⚠️ Le garde
  ne peut PAS interdire le mot `document` comme le fait `play-block` : ici
  « document » est le mot du **domaine** (une couche EST un document
  `fh-layer/1`). Le garde interdit donc le DOM par ses formes atteignables
  (`window.*`, `globalThis.document`, `document.getElementById|querySelector|
  createElement|body|head|write`), et l'attaque du garde le prouve sur du vrai
  code de DOM.
- **Réseau** (`fetch`, `XMLHttpRequest`, `WebSocket`) et **minuteurs**.
- **`Math.random`, `Date.now`** — un pli est déterministe.
- **Un id de couche ou une langue en dur** (§L7.5).
- **La tranche d'un autre bloc**, et tout import de `src/play/`,
  `src/modules/`, `src/schemas/`, `src/tools/`. Une pile de couches qui
  connaîtrait le moteur ferait du moteur une dépendance du contenu — l'exact
  envers de la loi §0.12.

## Obligations de test

1. **Le test d'acceptation §L7**, sur la vraie matière et **par `dispatch`
   uniquement** (`layers-acceptance`) : les deux couches SRD (2 613 records,
   14 genres) ; les **18 compétences nommément** (pas un compte — un compte
   reste vert si la pile rend dix-huit mauvaises) ; une couche de table qui en
   patche une et en désactive une autre ; le retrait qui rend ; la couche
   d'exemple du lot 2 appliquée au **vrai** SRD ; les deux langues qui ne
   s'apparient jamais.
2. **L'empreinte est celle des octets**, et elle **coïncide avec le hash que le
   personnage d'exemple du lot 2 transporte déjà** — le pont entre les deux
   lots (`layers-document`, `layers-acceptance`).
3. **Le pli** : ordre, dernier-qui-parle, patch/disable dans le vide, patch
   d'une couche basse vers le haut, transactionnalité, double montage
   (`layers-fold`).
4. **Les chemins de patch** : identité jamais index, création au bout
   rapportée, création en profondeur refusée, racines fermées, `snake_case`
   entre crochets (`layers-fold`).
5. **Les gardes STRUCTURELS, et leurs ATTAQUES** (`layers-block`). Chaque
   interdit est violé une fois dans une source fabriquée et doit être vu **et
   nommé** ; le périmètre est une **liste de noms**, attaquée à vide et
   amputée d'un fichier. La leçon du 2026-08-08 : un garde qui compte des
   fichiers reste vert quand on le pointe ailleurs.
6. **Le garde de dérive schéma ↔ code** (`layers-document`), lui aussi attaqué :
   `ajv` étant une dépendance de dév, le validateur en code est l'exécution du
   schéma, et deux copies d'une règle divergent toujours sauf si quelque chose
   les compare.
7. **La décision Q4 prise au mot** : un document hostile est chargé, et on
   vérifie qu'il n'a rien obtenu — ni prototype, ni place dans la pile.
8. **L'immuabilité** de tout ce que `query` et `stack` rendent, jusqu'au fond.

## ⚠ Points ouverts, pour l'architecte

Le bloc `build` arrive derrière ce lot et héritera de ces choix de forme.

1. **Qui pose l'ordre de la pile.** §L7 dit que l'ordre compte sans dire qui le
   décide. Ce lot a tranché : **l'ordre d'enregistrement EST la pile**, et
   `enable`/`disable` ne déplacent rien. Aucun verbe de réordonnancement n'a
   été fabriqué pour un besoin que personne n'a encore formulé (loi §0.6).
   **À ratifier** — c'est l'appelant qui devient responsable de monter dans le
   bon ordre.

2. **Un `add` qui en recouvre un autre.** §L7.2 nomme le patch-dans-le-vide
   comme échec bruyant, pas le recouvrement. Ce lot suit la lettre — dernier
   gagne — mais le **rapporte** dans `layers-changed.shadowed`. Faut-il aller
   plus loin et **jeter** (« sers-toi de `patch` ») ? Symétriquement : le
   **`disable` dans le vide**, que §L7 ne nomme pas non plus, a été rendu
   bruyant ici par le même raisonnement que le patch. Les deux sont
   réversibles vers le laxisme, l'inverse n'est pas vrai.

3. **Un patch ne peut pas toucher `attribution`.** Règle posée par ce lot au
   nom de la loi §0.8 (le juridique est de premier rang) : une couche homebrew
   qui réécrirait `attribution` retirerait la notice CC-BY d'un record SRD dont
   elle dérive. Le schéma, lui, ne l'interdit pas. **À ratifier ou à renvoyer
   au schéma.**

4. **La correspondance entre une clef de `ruleValues` et une clef de règle du
   moteur n'est écrite NULLE PART.** Mesuré : les couches parlent en clefs
   pointées (`fh.exhaustion`, schéma fh-layer/1) ; le moteur, lui, déclare
   `rules: { exhaustionPerLevel: 1 }` (`src/modules/fh/index.mjs:78`,
   `src/play/session.mjs:94`). **Deux vocabulaires, aucun pont.** Ce lot n'en a
   pas inventé (loi §0.10) : il exige que le moteur DÉCLARE ses clefs
   (`createLayers({ruleValueKeys})`) et refuse tout le reste bruyamment. Il
   reste à décider **qui écrit le pont**, et si `ruleValues` remplace à terme
   le `layer.rules` du moteur.

5. **La grammaire de chemin exclut le souligné des segments pointés**
   (`[a-zA-Z][a-zA-Z0-9]*`), alors que les exports fh-srd sont en snake_case :
   **1 544 des 14 145 clefs `data` de la couche SRD FR** (11 %) ne sont
   atteignables qu'entre crochets — `data[example_uses]`, pas
   `data.example_uses`. Ça **marche**, mais ça ne se devine pas, et la même
   grammaire sert aux overrides de `fh-char/1`. Voulu, ou à élargir ?

6. **Le personnage d'exemple du lot 2 porte un hash factice.**
   `examples/personnage-srd-fr-niveau1.fh-char.json` déclare
   `build.layers[srd-5.2.1-fr].hash = "0000…0000"` (et idem dans
   `resolved.derivation.stack`) : la couche SRD n'existait pas encore quand il
   a été écrit. Elle existe maintenant, et ce bloc calcule son empreinte
   réelle. **Ce lot n'a pas touché l'exemple d'un autre lot** — la correction
   est de deux lignes et elle appartient à l'architecte.

7. **`ARCHITECTURE.md` dit encore « les 12 genres `fh-srd` ».** La révision du
   2026-08-08 en a fait 14 (`skill`, `class-progression`). Même remarque :
   fichier canonique, correction d'un mot, pas touché par ce lot.
