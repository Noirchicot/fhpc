# Inventaire du lot `20-arcanes-fh`

**Ce que le lot livre.** Le Score de Destinée sait enfin compter les deux termes
qui bloquaient : l'**impact de l'Arcane majeur**, lu sur la carte que le
personnage désigne, et le **don `Destiny Touched (fh)`**, lu sur sa fiche. Les
22 cartes et le don entrent dans le dépôt comme **contenu de couche**, et le
module apprend à les lire — **aucun des deux nombres n'est écrit dans le
moteur**.

Mesuré sur le personnage d'acceptation : le Score passe de **6** (maîtrise +
Base d'espèce + Splinter of Anon) à **10**, et chacune des cinq lignes cite son
origine.

**Un lot n'a pas pu être livré sans ouvrir une porte qui n'était pas prévue** :
la dérivation ne tendait aux modules **aucun chemin de lecture** ni **aucun
don**. Voir §3 — c'est la question 1 à l'architecte, et elle est la plus
importante de ce document.

---

## §1 — Les deux couches

| Fichier | `id` | Contenu |
|---|---|---|
| `layers/fh-arcana-en.layer.json` | `fh-arcana-en` | **22 records** `fh:arcana:en:<slug>` |
| `layers/fh-feats-en.layer.json` | `fh-feats-en` | **1 record** `fh:feat:en:destiny-touched` |

Les deux lèvent `fh.destiny` et rien d'autre. Les deux sont en **anglais
seulement** (décision d'Eric : la table joue en anglais). Aucune couche FR.

### Où vit l'impact, et pourquoi là

`data.destiny.impact`, en entier. La convention vient de la couche des espèces
(`data.destiny.base`, `data.destiny.base_bonus`, lot 15) : le namespace
`data.destiny`, puis **un nom de terme**. Le don porte donc `data.destiny.bonus`
— un mot différent parce que c'est un terme différent du détail. Les confondre
sous un `destiny.value` anonyme ferait additionner au moteur des nombres dont le
`breakdown` ne saurait plus dire d'où ils viennent.

### Ce qui voyage avec la carte, et ce qui ne voyage pas

Chaque record porte son **chiffre romain** (`numeral`, `"0"` à `"XXI"`), son
`meaning`, son `power` et sa `vibration`. Ce lot ne s'en sert pas : on ne jette
pas une donnée de la carte parce qu'un lot n'en a pas l'usage — c'est ainsi
qu'une source s'appauvrit sans que personne le remarque. Un test exige les
quatre champs sur les 22 cartes et **22 chiffres romains distincts**.

Deux champs du builder v1 sont volontairement **restés dehors**, et ce n'est pas
un oubli :

- **`skillPts: 0`** du don. Zéro point de compétence, c'est l'**absence** d'une
  attribution, pas une attribution qui vaut zéro. La couche des espèces emploie
  déjà `skill_points` avec une **autre forme** (`{trait, by_level}`) : poser un
  scalaire sous la même clef fabriquerait un piège pour le lot des compétences.
- **`id: 2383104`** du don. C'est un identifiant **D&D Beyond**, et la table de
  couverture v1 le range dans `build.external.ddb.entityIds` — pas dans un
  record de règle.

### L'attribution n'est PAS celle de la couche des espèces

Les Arcanes sont du contenu **100 % original** : ils ne patchent, n'étendent et
ne reproduisent **aucun matériel SRD**. Recopier la phrase de `fh-species-en`
(« Portions of the SRD material … have been modified ») aurait été une
**déclaration de licence fausse** sur un dépôt public. Les deux couches portent
donc `all-rights-reserved` et un texte qui dit `modifies NO material`. Un test
compare les deux attributions et exige qu'elles divergent.

### Aucun `disable`, et c'est mesuré

La note « replaces Lucky » du don vise *Lucky* (PHB 2024), **absent du SRD 5.2**.
Un test le vérifie sur la pile réelle (`query({kind:"feat", id:"srd:feat:en:lucky"})`
rend `null`) : il n'y a rien à désactiver, et désactiver un record absent aurait
fait croire à une dépendance qui n'existe pas. Les 23 records sont des `add`.

### La couche n'a pas de générateur, contrairement à celle des espèces

`gen-fh-species-layer.mjs` existe parce que cette couche-là **patche le SRD** et
doit se re-plier quand `fh-srd` bouge. Les Arcanes ne dérivent de rien : le
ruleset est figé, la matière a été extraite **mécaniquement** de
`fh-skills/fh-skill-builder.html` (jamais recopiée à la main) et la couche est
désormais la source. Écrire un générateur qui `eval`-ue un fichier HTML v1
aurait été du code sans besoin (loi §0.6) attaché à un amont qui va disparaître.

---

## §2 — Ce que le module a appris à lire

`src/modules/fh/destiny-stat.mjs` — le seul fichier de **logique** du lot.

### Le verrou de la ligne 118, ouvert pour la carte et pour elle seule

Le module refusait **tout** choix portant un `ref`. Le chemin
`fh.destiny.arcana` en porte un **par conception**. Le refus est donc
**restreint, pas ouvert** :

- `fh.destiny.arcana` est **aiguillé avant** la lecture des termes de séance ;
- un `ref` sur `glory[0]` ou `awakening[0]` **continue de jeter** — un test le
  prouve sur les deux chemins ;
- `fh.destiny.arcana[0]` (forme indicée) est refusé : un personnage porte **une**
  carte, pas une liste ;
- **le genre du `ref` est vérifié.** Un `ref` d'espèce posé sous ce chemin irait
  lire `data.destiny.base` — la Base d'espèce, **déjà comptée** — et le Score
  vaudrait 12 au lieu de 10 sans qu'un mot le dise.

### Trois situations qui ne se ressemblent pas

C'est la distinction sur laquelle repose tout le lot, et la confondre aurait été
son défaut :

| Situation | Verdict | Pourquoi |
|---|---|---|
| **Aucun choix** `fh.destiny.arcana` | **déclaré**, en nommant le choix qui manque | le personnage ne nomme aucune carte |
| **Un choix, et le genre répond VIDE** | **déclaré**, en nommant la carte portée, `GAP-KIND clos` et la couche `fh-arcana-en` à monter | le contrat est là depuis le 2026-08-08 ; c'est le **contenu** qui n'est pas monté |
| **Un choix, le genre est peuplé, la carte n'y est pas** | **JETTE** | `ref` **mort** : le personnage a été construit sur une couche qui n'est plus là, et compter 0 lui volerait jusqu'à 2 points |

C'est `records(kind)` **sans id** qui permet de séparer les deux derniers : le
genre **répond** (contrat présent) et il répond **vide** (contenu absent). Un
simple `null` les aurait confondus, et un contenu manquant se serait lu comme un
document faux.

### Les refus de contenu JETTENT

Un `impact` qui n'est pas un entier (`"two"`, `1.5`, absent, `destiny` absent),
une carte sans `name` exploitable, un `data.destiny` de don qui est un scalaire,
un `bonus` qui n'est pas un entier. Chaque cas est prouvé sur une **privation
délibérée** — une couche de scénario qui recouvre le record réel —, jamais sur
une pénurie de circonstance qui cesserait de prouver le jour où la source
s'enrichit.

**La frontière, et elle compte :** un don **sans** `data.destiny` n'est **pas**
un refus. C'est le cas des dix-sept dons du SRD et de tous ceux à venir : le
champ absent dit « ce don ne touche pas au Score », et c'est un fait. Un test le
vérifie sur les vrais records SRD.

### Les libellés et les valeurs viennent des records

`label` = le `name` du record, **recopié** (loi §0.13, règle appliquée au bonus
de l'Elfe par le lot 19). `value` = le champ du record, **lu**. Un test rejoue le
même personnage avec une carte à **0**, une à **1** et une à **2**, choisies
dans le fichier de couche — parce que les cinq termes du personnage
d'acceptation valent tous 2, et qu'un impact écrit en dur y passerait inaperçu.

---

## §3 — ⚠️ CE QUE LE LOT A DÛ OUVRIR, ET QUI N'ÉTAIT PAS DANS LA COMMANDE

**QUESTION 1 À L'ARCHITECTE — la plus importante de ce document.**

La commande dit que `destiny-stat.mjs` est le **seul fichier de logique** du lot,
et que pour le don « il n'a jamais manqué que la fiche ». **Les deux étaient
faux à la mesure**, et le lot n'était pas livrable sans le dire :

1. **Un module n'avait aucun chemin de lecture.** `contribute` recevait
   `{proficiency, species, choices}`. Un `ref` dans un choix arrivait comme un
   **identifiant nu** : le module tenait `fh:arcana:en:the-hermit` et n'avait
   aucun moyen d'atteindre le record. Sa seule issue aurait été d'écrire les 22
   impacts **en dur** — exactement ce que la commande interdit et ce que la
   collection `stats[]` existe pour éviter.
2. **Un module ne voyait aucun don.** La table de couverture v1 range les dons
   d'origine sous **`build.choices[background.originFeat[n]]`**
   (`tests/v1-coverage.test.mjs`) — **hors du namespace de tout module**. Le
   module ne recevant que ses propres choix, le don lui était invisible. La
   seule alternative aurait été de faire déclarer le même don **deux fois** au
   personnage (une fois comme don, une fois sous `fh.destiny.feat`) : deux
   places pour un seul fait, et la dérive garantie.

**Ce que j'ai fait, et pourquoi je n'ai pas bloqué.** Le test d'acceptation du
§6 exige les deux lignes ; bloquer n'aurait rien livré. J'ai donc ouvert le
strict nécessaire dans `src/build/derive.mjs`, **de façon générique** — ce
fichier ne nomme toujours **aucune** mécanique de couche, et le garde de
vocabulaire §0.12 le vérifie :

| Ajout | Forme | Ce que ça donne |
|---|---|---|
| `input.records` | `(kind, id?) => vue aplatie \| null \| liste du genre` | le **même** chemin de lecture que le pli, aplati comme `input.species` |
| `input.feats` | `[{path, id, name, slug, data}]` | les records que les choix désignent par un `ref` de genre `feat`, dans l'ordre du document |
| retour `consumed` | `string[]` | les chemins **hors namespace** que le module a **réellement lus** |

**Pourquoi `consumed` existe.** Sans lui, un don qui vaut +2 au Score
ressortirait `unconsumed`, et `validate` dirait de lui « **il ne change rien à
la fiche** ». Ce n'est pas une omission, c'est un **faux témoignage**. Le canal
est gardé des deux côtés, et les deux gardes sont attaqués : un module ne peut
réclamer **que** ce que la dérivation lui a tendu (sinon il ferait taire
n'importe quel choix du document), et un don **ordinaire** reste signalé comme
inerte (réclamer tous les dons éteindrait l'avertissement pour de bon).

**Ce que l'architecte doit trancher :** ces trois ajouts au contrat du module
(documenté dans `INVENTAIRE-LOT-19.md` §2, pas dans un `contracts/*.md` ratifié)
sont-ils la bonne forme, ou faut-il les porter au contrat `build` avant que le
chapitre 4 en hérite ?

**Un effet de bord à connaître :** un `ref` de don **mort** fait désormais
échouer `rebuild` (`reader.must`, comme `class`, `species`, `gear[n]` et les
sorts). Avant ce lot, il n'était vu que par `validate`. Le comportement est
cohérent avec le reste du pli, mais il change pour des documents déjà invalides.

---

## §4 — Les questions que je n'avais pas le droit de trancher

**QUESTION 2 (celle du §4 de la commande) — le `power` et la `vibration` de la
carte doivent-ils apparaître dans `resolved` ?**

**Non tranchée, et le Score est livré sans.** La mesure confirme l'argument
« contre » de la commande : le contrat du module rend `{stat, underived}`, il
n'a **aucun moyen** d'écrire `resolved.traits[]`, et le faire demanderait un
**second point d'injection qui n'existe pas**. L'argument « pour » reste entier :
le document `fh-char/1` doit rester jouable sans ses couches (BRIEF §3.1), la
table de couverture v1 mappe déjà `destiny.arcana.power` →
`resolved.traits[].text`, et le pouvoir d'un Arcane est du texte qu'on lit à la
table.

**Ce que le lot a fait en attendant :** les trois textes **voyagent dans la
couche** (`data.meaning`, `data.power`, `data.vibration`) et un test les exige
sur les 22 cartes. Le jour où l'architecte ouvre le point d'injection, la
matière est déjà là — il n'y aura pas de couche à réécrire.

**QUESTION 3 — `settleAwakening` lit toujours un chemin v1.**
`src/modules/fh/index.mjs` déclenche la Vibration sur
`character.destinyBuild.arcana`. Le chemin ratifié est désormais
`build.choices[fh.destiny.arcana].ref.id`, et la couche porte enfin le contenu
de la carte que ce moteur voulait lire. **Non touché** (§3c de la commande) :
c'est une dette connue qui demande un arbitrage. Elle est maintenant
**débloquée** — ce qui lui manquait n'existe plus.

**QUESTION 4 — la ligne « Other » reste déclarée, et sa raison a changé.**
Elle n'est pas de ce lot. Mais sa raison disait « n'a pas plus de source de
règle **que les deux précédentes** », ce qui est devenu un aveu à l'envers : un
lecteur en déduirait qu'il suffit d'écrire une couche. Ce n'est pas le cas —
« Other » recouvre **trois familles** (objet magique, boon, sous-classe) dont
aucune n'a de genre, de champ ni de décision. Le **verdict n'a pas bougé** ;
c'est la raison qui est devenue exacte.

---

## §5 — Les assertions réécrites (aucune relâchée)

| Où | Ancienne vérité | Nouvelle vérité |
|---|---|---|
| `tests/fh-destiny-score.test.mjs`, « CE QUI N'EST DÉRIVABLE DE RIEN » | la raison de l'Arcane **doit** citer `GAP-KIND clos` | elle ne le cite **plus ici** — GAP-KIND ne dit rien à un personnage qui ne nomme aucune carte. La citation est **déplacée** là où elle est vraie (couche non montée, carte nommée) et `tests/fh-arcana.test.mjs` l'exige mot pour mot. **Deux interdictions s'ajoutent** : la raison ne doit dire ni « toujours ouvert » ni « la couche n'est pas montée » |
| idem, les trois déclarations | « les trois termes sans source de règle » | deux d'entre eux **ont** une source ; ce qui reste vrai ici, c'est que **ce personnage-là** ne les établit pas. Les assertions exigent maintenant que la raison nomme **le choix qui manque** |
| idem, `query({kind:"arcana"}) === []` | **inchangée**, et il faut dire pourquoi : le vide observé n'est plus une pénurie du dépôt mais un **choix de montage**. Plus forte, pas plus faible |
| idem, `Object.keys(couche.records) === ["species"]` | « la couche FH ne porte QUE `species` » | « la couche des **espèces** porte toujours QUE `species` » — les cartes et le don vivent dans **leurs propres couches**, pas entassés dans celle-ci |
| `src/modules/fh/destiny-stat.mjs`, en-tête | « TROIS ne sont dérivables de rien » | **QUATRE** termes dérivés, **DEUX** de séance, **UN** déclaré |
| idem, refus d'un terme inconnu | « The Arcana impact, the Destiny Touched feat and the Other line have no rule source to read » | les deux premiers en ont une ; le refus **n'est pas relâché** (la forme `<terme>[n]` reste celle des termes de séance) mais sa raison indique le bon chemin |
| idem, refus du `ref` | « aucun record de la pile ne porte un terme du Score » | vrai **mot pour mot** pour la Gloire et l'Éveil ; le chemin de la carte ne passe pas par là, et un test le prouve |
| idem, `breakdown` vide | « ni la maîtrise, ni la Base d'espèce » | « ni la maîtrise, ni la Base d'espèce, **ni l'Arcane, ni un don** » |

⚠️ **`tests/fh-destiny-score.test.mjs` est bien passé au rouge**, comme la
commande l'annonçait, et sur la seule assertion annoncée. Rien n'a été commenté,
supprimé ni relâché : chaque marque `REWRITTEN` est **sur sa propre ligne**.

---

## §6 — Ce que le lot n'a PAS fait

- ⛔ `src/modules/fh/index.mjs` — non touché (question 3).
- ⛔ Aucune couche FR.
- ⛔ `src/build/validate.mjs` — **non touché**, et le garde de somme est
  **toujours vert sans avoir été modifié**. Un test du lot le rejoue sur les
  cinq lignes, override de MJ compris (`vaut 20 … somme à 10`).
- ⛔ `schemas/` — non touché. Le genre était déjà ouvert, aucun champ neuf
  n'a été dû.
- ⛔ Aucun `disable`, aucun `patch` : les 23 records sont des `add`.

---

## §7 — Les tests et les commits

**457 tests, 457 verts, 0 rouge** (`npm test` depuis la racine du worktree) —
440 avant le lot, **+17** apportés par `tests/fh-arcana.test.mjs`.

**Les trois vérifications demandées au §6 de la commande :**

1. **les 22 cartes entrent**, et leurs impacts se répartissent bien : **5 à 0,
   9 à 1, 8 à 2**, comptés sur la pile montée. C'est cette répartition qui
   prouve qu'aucun nombre n'est écrit en dur — si les 22 valaient 2, une
   constante passerait tous les tests du fichier ;
2. **suite complète re-jouée verte** ;
3. **les gardes ont été attaqués**, un par un, en cassant l'implémentation et
   en vérifiant que le test qui devait mordre a mordu **seul** :

| Mutation | Test qui mord |
|---|---|
| impact écrit en dur (`value: 2`) | LA LIGNE DE LA CARTE SUIT LE RECORD |
| contrôle de genre du `ref` retiré | LE CHEMIN DE LA CARTE N'ACCEPTE QUE LE GENRE DE LA CARTE |
| refus du `ref` ouvert à tous les chemins | LE REFUS DU `ref` MORD TOUJOURS HORS DU CHEMIN DE LA CARTE |
| couche absente traitée comme un `ref` mort | ACCEPTATION 2 |
| garde du canal `consumed` retiré | UN MODULE NE RÉCLAME QUE CE QU'ON LUI A TENDU |
| tous les dons réclamés, même les inertes | LE DON N'EST PLUS SIGNALÉ COMME INERTE |

**Les commits** (branche `20-arcanes-fh`, arbre propre, rien poussé) :

- `189a2ca` — Les 22 Arcanes majeurs et le don Destiny Touched entrent comme CONTENU
- `3e34aee` — Le Score de Destinée compte enfin sa carte et son don
- **ce commit-ci** — L'inventaire du lot 20, et les quatre questions qu'il n'avait pas le droit de trancher (un commit ne peut pas citer son propre SHA)
