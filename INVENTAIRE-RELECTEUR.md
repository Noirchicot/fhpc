# RELECTEUR Adverserial — inventaire d'attaque des gardes du M1

**Cible** : le M1 fusionné sur `main` (`b4cd30a`, 170 tests verts) — `src/kernel/`,
`src/play/`, `src/modules/fh/`, `src/schemas/`, `src/tools/`, `schemas/`,
`layers/`, et leurs suites.
**Hors périmètre** : `src/layers/` (territoire du lot `7-bloc-layers`, en cours).
**Branche** : `relecteur-adverserial`. **Écrit le 2026-08-08.**

Méthode : on ne relit pas les gardes, on les **viole**. Chaque garde a reçu une
violation délibérée de ce qu'il prétend interdire ; celui qui ne rougit pas est
déclaré creux, et le défaut n'est retenu **que** s'il vient avec le test qui
échouait avant le correctif.

| | |
|---|---|
| Gardes attaqués | **11** |
| Creux | **4** (dont 1 non corrigible sans décision d'architecte) |
| Tenants | **6** |
| Tenants avec réserve nommée | **1** |
| Faux positif de l'attaquant, écarté avant rapport | 1 |
| Tests | 170 → **182 verts** |
| Correctif | 27 lignes de `src/` · 214 lignes de tests |

---

## 1. LES CREUX

### C1 — Les deux gardes de la loi §0.12 étaient percés en trois endroits

**Ce qu'ils croyaient couvrir.** « Aucun fichier de `src/play/` ne cite une
mécanique Fate's Hand » et « les modules s'inscrivent, ils ne sont pas
appelés ». C'est la loi la plus haute du chantier — *le SRD est la base, FH est
une couche par-dessus* — et ces deux tests sont tout ce qui la tient.

**Ce qu'ils couvraient vraiment.** Trois trous, indépendants et cumulatifs :

1. **`readdirSync` à plat.** Un module posé dans `src/play/rules/` n'était
   inspecté par personne. Le garde jumeau de `play-block` marchait l'arbre,
   lui — les deux copies du même code avaient divergé sans que rien ne le dise.
2. **`/\barcane?\b/i` ne matche pas `arcana`.** Or `arcana` est
   l'identifiant que ce dépôt emploie : le drapeau de capacité s'appelle
   `fh.arcana`. Le garde gardait le mot du cahier des charges, pas celui du
   code. Même angle mort sur `arcanes`, `arcanum`, `destinies`.
3. **`layers/fh` est un chemin mort.** L'architecte a déplacé les modules dans
   `src/modules/fh/` le 2026-08-08 ; le garde §L5.3 cherche encore l'ancien
   chemin. `import { fhTotal } from "../modules/fh/lexicon.mjs"` passait.
   (Ironie mesurable : le commentaire de `play-block` se félicite que *son*
   garde ait détecté le renommage tout seul. Son voisin ne l'a pas suivi.)

**La preuve.** Violation composée — `src/play/utils.mjs` important la couche et
manipulant `arcana`, plus `src/play/rules/hook.mjs` citant Destinée et Chaos :

```
avant : ℹ tests 170  ℹ pass 170  ℹ fail 0
après  : ✖ §0.12 …  ✖ §L5.3 …   ℹ pass 173  ℹ fail 2
         « src/play/rules/hook.mjs cite « Destiny » (destiny) ;
           src/play/utils.mjs cite « Arcana » (arcana) »
         « src/play/utils.mjs nomme la couche (chemin du module : modules/fh) »
```

**Le correctif.** L'arpenteur, le dépouilleur et les deux vocabulaires vivent
désormais en **un seul exemplaire** — `tests/source-scan.mjs` — au lieu de trois
copies inline déjà divergentes. L'arpenteur est récursif ; les vocabulaires
couvrent les formes que le code emploie ; le garde **nomme** le fichier, la
mécanique et le texte trouvé au lieu de dire non.
Et le scanner est lui-même sous attaque : `tests/guards-adversarial.test.mjs`
lui donne les violations ci-dessus et exige qu'il rougisse.

### C2 — Le dépouilleur de commentaires effaçait du code réel

**Ce qu'il croyait couvrir.** Retirer les commentaires avant l'inspection — pour
qu'un garde n'interdise pas d'expliquer la frontière qu'il défend. Intention
juste.

**Ce qu'il couvrait vraiment.** `text.replace(/\/\*[\s\S]*?\*\//g, "")` ne sait
pas ce qu'est une chaîne. Deux formes ordinaires, mesurées :

| forme | effet |
|---|---|
| une regex contenant `/*`, une chaîne contenant `*/` plus loin | tout ce qui sépare les deux disparaît — `window` compris |
| une chaîne contenant `//` | la fin de la ligne disparaît — `document` compris |

Autrement dit : le garde **zéro-DOM / zéro-réseau** devenait aveugle sur des
zones entières de fichier, sans que rien ne l'indique. C'est le suspect que le
mandat nommait (« leur dépouilleur est une regex, et une regex a des angles ») ;
il mordait.

**Le correctif.** Un balayage à états qui ne retire un commentaire que hors
chaîne, gabarit et regex — et qui **conserve les littéraux de chaîne**, puisque
c'est par une chaîne d'import que C1.3 était passé. Cinq assertions le tiennent.

> Note de méthode, gardée parce qu'elle est instructive : la première version du
> commentaire qui documente ce défaut contenait le contre-exemple mot pour mot,
> donc un `*/`, qui a fermé le bloc et cassé le fichier. Le bug se reproduit dans
> sa propre documentation.

### C3 — Aucun invariant ne protégeait les ancres d'override

**Ce qu'il croyait couvrir.** `src/schemas/invariants.mjs` existe précisément
pour ce que JSON Schema ne sait pas dire (« unique par champ ») et couvre
l'unicité de `build.choices[].path`, `build.overrides[].path`, `build.layers[].id`.

**Ce qu'il couvrait vraiment.** Rien du côté `resolved` — alors que le schéma
dit du `slug` qu'il « sert d'ancre aux chemins d'override :
`resolved.skills[arcanes].bonus` ». **Dix collections** portent un `id`
(`skills`, `tools`, `actions`, `resources`, `traits`, `gear`, `craft`, `notes`,
`languages`, `senses`) et aucune n'était vérifiée. Deux compétences homonymes
aux bonus différents passaient schéma **et** invariants : l'override désigne les
deux, aucune ne gagne — exactement le défaut que ce module nomme ailleurs.

**Bonus trouvé au passage** : `build.layers: [null]` avec un `stack` présent
faisait sortir le module en `TypeError`. Un validateur qui plante sur une entrée
hostile ne valide pas cette entrée.

**Le correctif.** Boucle **générique** sur toute collection de `resolved` — la
prochaine collection ajoutée est couverte sans qu'on y pense — et `asKey`
tolérant aux entrées non conformes, qui les **nomme** au lieu de planter.
Quatre tests, dont un qui vérifie que deux entrées *sans* id ne s'accusent pas
l'une l'autre (durcir ne doit pas rendre fautif un document ordinaire).

### C4 — La provenance d'un dé ne traverse pas la frontière moteur ↔ contrat

**⚠️ Trouvé, prouvé, NON corrigé — décision d'architecture (loi §0.10).**

**Ce que personne ne couvrait.** Le lot 5 a fixé la forme de `origin` et l'a
explicitement livrée à l'architecte. L'architecte a répondu le même jour en
ajoutant `origin` au schéma — **avec un autre vocabulaire**. Chaque bout est
testé chez lui ; aucune suite ne compile `fh-char/1` contre une sortie de
`snapshot()`. La poignée de main a eu lieu dans le vide.

| le moteur écrit | le contrat déclare | |
|---|---|---|
| `timing` | `window` | renommage |
| `"ahead"` | `"advance" \| "reaction"` | renommage de valeur |
| `expiresAt` | `expires` | renommage |
| `expiresAt: null` | champ **absent** | deux façons de dire « pas d'échéance » |
| `givenAt` | *(rien)* | **trou de contrat** |

`additionalProperties: false` : la provenance que le moteur persiste est
**intégralement rejetée** par le contrat, sur les quatre premiers points. Le
cinquième, `givenAt`, est le seul qui ne se règle pas par un renommage — quand
le dé a été donné n'a aucune place dans `fh-char/1`, et c'est ce dont dépend
l'expiration.

**Pourquoi je ne corrige pas.** Choisir qui s'aligne sur qui, et où loger
`givenAt`, est une décision d'architecture — pas de relecture. Le RELECTEUR
s'arrête et pose la question.

**Ce que je laisse à la place.** `tests/frontiere-doc-moteur.test.mjs` épingle la
divergence point par point, avec un témoin qui prouve que le sous-schéma n'est
pas simplement cassé. Le jour où l'un des deux bouts bouge, il devient **rouge**
et force la mise à jour de l'autre. La divergence ne peut plus être invisible.

---

## 2. LES GARDES QUI ONT TENU

Ils comptent autant : le but était de savoir ce que valent les 170 tests.

| garde | attaque | verdict |
|---|---|---|
| Marques `REWRITTEN` | balayage des **60 occurrences** : y en a-t-il une qui *commente* une assertion ? | **tient** — toutes en tête de bloc ou dans un message ; aucune assertion muette. Le bug du 2026-08-07 ne s'est pas reproduit |
| `safeKey` / `safeValue` (les deux schémas) | `__proto__` aux niveaux 1, 3, 5 et dans un tableau ; `prototype` au niveau 4 ; `eval` imbriqué — **via `JSON.parse`**, qui crée bien la clé | **tient à toute profondeur** |
| Dépendance `fh-srd` absente (`gen-srd-layer`) | suite relancée avec un `HOME` truqué | **tient** — échec bruyant qui nomme le chemin, pas un `skip`. Le précédent `fh-srd` (témoin sortant en code 0) ne s'est pas reproduit |
| MANIFEST SHA-256 | digest faux, entrée absente | **tient** — les deux jettent en nommant le fichier |
| Seuils par genre (`FLOORS`) | — | **tient** — 14 genres nommés un par un ; un genre mis à zéro casse. C'est la bonne forme de garde de compte |
| `sources.length >= 10` (`play-block`) | — | **tient depuis le 2026-08-08** — l'architecte l'avait déjà durci en nommant `play/` et `modules/fh/`. C'est le seul `>= N` qui restait, et il est doublé d'assertions nommées |
| Garde-fou de dérive v1 (`v1-coverage`) | builds v1 absents | **tient, avec réserve** — il se saute quand `~/tools/fh-phb/builds` n'existe pas, mais il le **dit** (`t.diagnostic`) et le test principal tourne toujours. Sur la machine d'Eric il s'exécute. Réserve nommée, pas défaut |

**Faux positif écarté.** Ma première sonde de pollution de prototype annonçait
`__proto__` accepté au niveau 5. C'était ma sonde qui était fausse : un littéral
JS `{__proto__: …}` **fixe le prototype** au lieu de créer une clé, donc la
charge n'existait pas. Re-sondé via `JSON.parse` : le schéma rejette. Consigné
ici parce qu'un relecteur adversarial qui ne vérifie pas ses propres coups rend
des défauts imaginaires.

---

## 3. CE QUE JE N'AI PAS CORRIGÉ, ET POURQUOI

**Trois questions ouvertes à l'architecte.** Aucune n'est un défaut de garde :
ce sont des règles qui n'ont jamais été décidées. Elles ne viennent donc **pas**
avec un correctif — les signaler est le travail, les trancher ne l'est pas.

1. **C4** ci-dessus — la réconciliation `origin`, et le logement de `givenAt`.
2. **Références pendantes dans `resolved`.** `action.resourceId` peut pointer
   une ressource inexistante, `action.gearId` un objet absent, un override peut
   s'ancrer sur un id qui n'existe dans aucune collection, `craft[].flag` peut
   nommer un drapeau que le document ne lève pas. Les quatre sont acceptés
   aujourd'hui (vérifié). L'intégrité référentielle est une **règle neuve**, pas
   un durcissement : c'est à l'architecte de dire si un document doit être clos
   sur lui-même, ou si un pointeur pendant est un cas légitime pendant la
   construction.
3. **Marques `REWRITTEN` en milieu de ligne.** Quatre existent, dans des
   *messages* d'assertion (`assert.equal(…, "REWRITTEN (dock v6): …")`). Elles
   ne commentent rien et ne sont pas le bug du 2026-08-07. La loi §0.7 dit « sur
   sa propre ligne » ; faut-il l'appliquer aussi aux messages ? Cosmétique — je
   le note et je n'y touche pas.

**Le zèle, dit platement.** Le reste de l'attaque n'a rien donné. Les suites
`play-roller-state-machine` (716 l.), `play-roll-vocabulary` (386 l.) et
`play-dice-pool` sont denses, nommées et mordantes ; je n'ai pas trouvé
d'assertion creuse dedans, et je n'ai pas de remarque cosmétique à ajouter au
compte. C'est un résultat, pas un échec.

---

## 4. CE QUI A CHANGÉ

| fichier | quoi |
|---|---|
| `tests/source-scan.mjs` | **neuf** — arpenteur récursif, dépouilleur à états, les deux vocabulaires. Une seule copie |
| `tests/guards-adversarial.test.mjs` | **neuf** — l'attaque des gardes, 5 tests |
| `tests/frontiere-doc-moteur.test.mjs` | **neuf** — l'épingle de C4, 3 tests |
| `tests/play-srd-only.test.mjs` | les deux gardes §0.12 / §L5.3 rebranchés (`REWRITTEN` sur sa propre ligne) |
| `tests/play-block.test.mjs` | arpenteur et dépouilleur inline retirés (`REWRITTEN`) |
| `src/schemas/invariants.mjs` | unicité des ancres de `resolved` + `asKey` qui nomme au lieu de planter |
| `tests/schemas.test.mjs` | 4 tests d'invariants hors-schéma |

**Aucune fonctionnalité neuve. Aucune assertion relâchée.** Les deux assertions
devenues fausses sont réécrites à la nouvelle vérité et marquées `REWRITTEN` sur
leur propre ligne (loi §0.7).
