# Lot 5 — `5-moteur-srd-fh` : l'inventaire de la coupe

> **Le SRD dessous, Fate's Hand en couche.** Écrit à la livraison du lot,
> branche `5-moteur-srd-fh`, coupée de `main` (`faac1e4`, 127 tests verts).
> À lire avec KICKOFF §L5 ouvert : chaque section porte le numéro de l'exigence
> à laquelle elle répond.
>
> **Deux listes attendent l'architecte** — §7 (drapeaux de couche) et §8 (la
> forme de provenance d'un dé reçu). Elles deviennent des entrées de schéma,
> et c'est lui qui les écrit, pas ce lot (loi §0.10).

---

## §1 — La mesure, faite avant la coupe

Le lot 3 a porté le moteur v1 fidèlement, ce qui était sa commande. Le moteur
v1 est un moteur **Fate's Hand** : mesuré le 2026-08-07, **384 lignes sur
2 556** citaient une mécanique maison, et **aucun drapeau, aucun interrupteur**
ne permettait de l'éteindre.

Ce qui a été classé, ligne par ligne, avant d'écrire quoi que ce soit :

| Ce qui est **SRD** | Où c'est resté |
|---|---|
| le d20, avantage / désavantage / A/D, le modificateur, le seuil | `src/play/session.mjs`, `dice.mjs` |
| les dés bonus, leur plafond de trois, leurs jetons de source | `session.mjs`, `lexicon.mjs` |
| **Guidance** (sort SRD), **Bardic Inspiration** (Barde), **Tactical Mind** (Guerrier niv. 2) | `lexicon.mjs` → `CORRECTION_DICE` |
| **le Point d'inspiration héroïque** (p.183) | `session.mjs` → `rerollDie` |
| l'historique, le plateau libre, le Portent sur un dé tombé | `session.mjs` |
| **la transaction de jet, et le fait qu'elle soit ROUVRABLE** | `session.mjs` (D.2 — intouchée) |
| la condition d'Épuisement (six niveaux, mort au sixième) | `session.mjs` |
| les dégâts, le coup critique qui double les dés (p.179) | `session.mjs`, `rolltypes.mjs` |

| Ce qui est **Fate's Hand** | Où c'est parti |
|---|---|
| la réserve de Destinée, ses points, ses dés, leur récupération | `src/layers/fh/index.mjs` |
| le 1 naturel qui **pose une question** (accepter / défier) | `src/layers/fh/index.mjs` |
| l'échec critique arcanique et son offre | `src/layers/fh/index.mjs` |
| le Chaos, ses tables, ses dettes portées | `src/layers/fh/{index,chaos}.mjs` |
| l'Overreach, sa sauvegarde, son coût en Épuisement | `src/layers/fh/index.mjs` |
| l'Éveil arcanique et son compteur de tirages dus | `src/layers/fh/index.mjs` |
| le **+2 maison** (`plusTwo`) | `src/layers/fh/lexicon.mjs` |
| les verdicts ∞, `FATE REFUSED`, `FUMBLE 1 · CHOOSE` | `src/layers/fh/lexicon.mjs` |

### Ce qui ne se rangeait pas tout seul — et comment c'est tranché

**Un seul cas, et il est classé plutôt que remonté**, parce que la SOURCE
tranche : **l'Épuisement**. Le SRD 5.2.1 le décrit
(`srd:glossary:en:exhaustion`, p.181) — six niveaux, la mort au sixième — mais
il dit : *« the roll is reduced by 2 times your Exhaustion level »*. Le moteur
v1 appliquait **−1**, et son propre commentaire disait « Épuisement maison ».

→ La **condition** est SRD et reste dans le moteur. Le **multiplicateur** est
une *valeur de règle* que la couche remplace (`rules.exhaustionPerLevel`).
Aucune valeur n'a été inventée : le 2 est cité de la source, le 1 est celui du
moteur v1. C'est la **seule** valeur de règle surchargée de tout le lot, et le
test `les deux moteurs tournent côte à côte` la mesure des deux côtés.

**Rien d'autre n'est resté ambigu.** Il n'y a donc pas de liste de STOP de
classement — la liste de STOP du lot porte sur le MÉCANISME (§2) et sur les
deux formes que l'architecte doit écrire (§7, §8).

---

## §2 — Le mécanisme d'extension : la mesure de ce qui manquait

§L5.2 demandait de vérifier que les phases existantes suffisent **avant** d'en
inventer un. Voici la mesure, et elle nuance l'hypothèse sans la renverser.

**Ce qui existait.** Quatorze noms de phase sur `state.rollSequence.phase` :
`remaining`, `destiny`, `destiny-events`, `result`, `nat1`, `arcane1`,
`roll-choice`, `destiny-choice`, `adjustment-choice`, `open`,
`open-after-events`, `adjustment`, `standalone`, `free-tray`. **Ils nomment
correctement les moments** : sept des huit points où le moteur v1 appelait une
mécanique maison tombent sur une phase déjà nommée. L'hypothèse de l'architecte
tient sur le fond.

**Ce qui manquait, en deux points, et il faut les distinguer :**

1. **Aucune répartition.** `phase` était un **champ de statut** — muté en
   dix-neuf endroits, lu sémantiquement par une seule table (`BLOCKING_PHASES`).
   Rien n'itérait sur des gestionnaires enregistrés. C'était l'hypothèse de
   l'architecte qui restait à *brancher*, pas un vocabulaire neuf à inventer :
   `src/play/sequence.mjs` la branche, sur **les mêmes noms**.

2. **Aucun cycle de vie de module.** Le huitième point — semer la tranche
   d'état d'une mécanique à l'ouverture de séance, et la rendre au `snapshot` —
   **n'est pas un moment de jet, et aucune phase ne le nomme.** C'est le seul
   endroit où ce lot a dû ajouter quelque chose que les phases ne portaient
   pas : les moments `session-open` / `session-snapshot` / `session-clear`.

   ⚠️ **À RATIFIER.** Ce que le lot a fait ici est volontairement le geste le
   plus petit possible : **la disposition de l'état ne change pas d'un octet**
   — la tranche FH reste `state.destiny`, exactement où le lot 3 l'avait
   laissée. Seul change **qui l'écrit**. Aucun contrat de donnée n'a été
   inventé. Si l'architecte veut une autre forme (une tranche nommée par
   module, un espace de noms `state.layers.fh`), c'est une édition d'un seul
   fichier.

**Et un troisième constat, qui est le vrai enseignement du lot :** une couche
de règles n'a pas besoin *que* de phases. Le vocabulaire de jet est une
**table**, pas une séquence — on ne s'y « inscrit » pas sur un moment, on y
**insère une règle par priorité**. Ce lot a donc dû ouvrir cinq surfaces
d'extension, et une seule des cinq est une phase :

| Surface | Ce qu'elle porte | Est-ce une phase ? |
|---|---|---|
| **moments** (`sequence.mjs`) | semer / rendre / nettoyer, pré-jet, résultat, réouverture | ✅ oui — l'hypothèse |
| **contributions de lexique** | verdicts, badges, sources, parts, total, dés du plateau, signature | ❌ non — c'est une table, insérée par priorité |
| **cycle de vie de module** | verbes, dérivations, tranche d'état | ❌ non — voir point 2 ci-dessus |
| **valeurs de règle** (`rules`) | le multiplicateur d'Épuisement, et rien d'autre à ce jour | ❌ non |
| **réclamations de ROLL** | quel chemin l'unique bouton ROLL emprunte | ❌ non — un aiguillage, pas un moment |

Les quatre non-phases sont **déclaratives** (une couche rend des données, le
moteur les lit) et **sans dispatch dynamique** — c'est ce qui les garde
lisibles. Mais elles existent, et l'architecte doit savoir que « un module
s'inscrit sur une phase » ne décrivait qu'un cinquième du besoin réel.

---

## §3 — Ce qui est parti côté FH, et pourquoi (le détail)

| Fonction v1 | Classement | Où elle vit maintenant |
|---|---|---|
| `makeDestinySlots`, `normalizeDestiny` | FH | `layers/fh` — semée au moment `session-open` |
| `spendDestinyDie`, `destinyPlanFor`, `destinyEventSpecs` | FH | `layers/fh` |
| `arcaneDecision`, `resolveArcaneOne` | FH | `layers/fh` — décision ouverte au moment `reopen`/`pre-roll` |
| `naturalDestiny` | FH | `layers/fh` → gestionnaire du moment `result` |
| `resolveNatOne` | FH | `layers/fh` — le SRD n'a rien à dire d'un 1 hors attaque |
| `settleAwakening` | FH | `layers/fh` — **réécrite**, voir §5 |
| `setDestinyPoints`, `recoverLowestDie`, `adjustDestinyDie`, `updateDestinyField` | FH | `layers/fh` |
| `pendingFate` & cie (7 fonctions), `armPendingFate`, `rollPendingFate` | FH | `layers/fh` |
| `createChaos` | FH | `layers/fh/chaos.mjs` (déplacé, comportement inchangé) |
| `stageDestinyDie`, `stageDestinyFromPool`, `standaloneDestiny`, `announceStagedDestiny` | FH | `layers/fh` |
| `rollSequenceDestiny` | FH | `layers/fh` → réclame le moment `pre-roll` |
| `LEX` (les huit lexèmes ∞ / Crit 20 / Fumble 1) | FH | `layers/fh/labels.mjs` |

**Ce qui a été SUPPRIMÉ, pas déplacé** (loi §0.6) :

- **le sceau `destiny`** sur un dé bonus. `sealStagedDie("destiny")` allait
  chercher un dé dans la réserve — une commodité d'interface v1 qui est
  exactement la confusion que D.3 nomme (« un dé de Destinée se prend dans la
  réserve, ce n'est pas un autocollant »). Aucune suite ne le couvrait. Le
  verbe `spendDestiny` fait la même chose, et il le dit.
- **`guidance`, `other-1`, `other-2`, `other-3` de `SEALABLE_SOURCES`** (D.3).
  Les *jetons de source* restent — il faut bien nommer un dé bonus sur le
  plateau — c'est le **scellage** qui est coupé.
- **`SPOILER_BADGE_KINDS`**, table de familles tenue à côté des règles, dont
  deux des trois entrées étaient des noms de mécaniques maison **dans le moteur
  SRD**. Le drapeau `spoiler` est descendu **sur la règle de badge**, où il a
  toujours voulu être.
- **la matière de dé `chaos`** dans `DIE_MATERIAL_NAMES` : `dieColour`
  l'excluait explicitement deux lignes plus bas. Sortie de la liste, le
  résultat est identique au bit près.
- **le moment `settle`** n'a jamais été créé : le règlement s'annonce déjà sur
  le bus (`roll-settled`), et un second chemin pour le même fait est une dette.

---

## §4 — Ce que le lot a AJOUTÉ, exigence par exigence

### A — Les jets se composent : trois types, réglages fermés **par type**

`src/play/rolltypes.mjs` déclare `check`, `attack`, `spell`. Chacun porte
**ses phases** et **sa liste fermée de réglages**.

- **`check`** — un jet contre un seuil.
- **`attack`** — deux jets **liés, sur une seule entrée de flux** : toucher,
  puis des dégâts dont un critique **double les dés et jamais le bonus**
  (`srd:glossary:en:critical-hit`, p.179). Un coup dont on *sait* qu'il a
  manqué ne lance pas de dégâts ; quand la CA est inconnue — c'est le MJ qui la
  tient — le moteur lance plutôt que de deviner un échec.
- **`spell`** — trois résolutions nommées (`save`, `attack`, `none`), un
  emplacement consommé, un niveau de lancement, la concentration. Un sort à
  sauvegarde **n'a aucun jet du lanceur** : la séquence saute la phase `d20`,
  et le verdict `success`/`failure` **attend un dé qui a été lancé** (sans
  quoi le total zéro du lanceur ferait échouer chaque boule de feu contre son
  propre DD).

**La correction de `configure`.** Le verbe livré par le lot 3 faisait
`Object.assign(state.rollConfig, patch)` : la forme « compétence » prise pour
la règle générale. Il laissait écrire `ac` sur une compétence sans broncher.
Il lit désormais chaque réglage contre la liste **du type courant** et **jette
en nommant ce que ce type accepte**.

⚠️ **Le `slotResourceId` d'un sort.** Décrémenter l'emplacement suppose de
savoir quelle ressource comptée le porte. Le lot **n'invente pas** de
convention d'identifiant : le type déclare `slotResourceId`, et sans lui le
moteur **annonce** la dépense sans décrémenter. À trancher quand le bloc
`build` produira les emplacements.

### B — Les mots sortent du moteur (loi §0.13)

Une règle porte un `id` et une `priority` ; **elle ne porte aucun mot**. Les
mots vivent dans un **paquet de libellés** (`src/play/labels.mjs`, et celui de
la couche) que `derive` applique à la frontière. **Un id sans mot JETTE** —
peindre `verdict.natural-20` sur le plateau d'une table en séance serait pire
qu'une erreur.

`FATE REFUSED`, qui était écrit en dur au milieu de verdicts passant déjà par
une table, est devenu une entrée comme les autres.

**Ce que ça rend possible, et qui est le point** : `verdict.natural-20` dit
« NATURAL 20 » dans le paquet SRD et « CRITICAL 20 » dans celui de la couche.
Le renommage ratifié par Eric le 2026-08-05 est devenu **une édition de
données**, sur la même règle, avec la même chaîne `outcome` sur le fil.

**La mesure honnête de ce qui reste.** Les libellés, les verdicts, les badges,
les jetons de source, les refus adressés au joueur, les titres de plateau et
**toutes les lignes de flux** passent par le paquet — l'anglais rendu est
identique au bit près, et ce sont les 145 tests qui le prouvent. Ce qui n'y
passe **pas** : le **nom d'un jet** (`entry.name`) et le **texte d'une ligne de
Chaos**, qui sont des données du joueur et du contenu, pas du moteur. Aucune
traduction n'est livrée : on ouvre la porte, on ne livre pas les langues.

### C — L'Éveil arcanique, réécrit (le bug garanti, évité)

`keepArcana()` v1 appliquait `score+1` / `points+10` **inconditionnellement**.
Ce n'était juste que parce que le paquet v1 ne contenait que les 22 majeurs :
porté avec les 78 cartes, **tout mineur aurait donné +1 au Score**.

La correction n'est pas un `if` de plus : **la partie chiffrée n'existe pas
tant que la carte n'est pas connue**. Elle est fonction de la carte.

- Un seul chemin : la pioche règle **et** applique.
- La carte doit déclarer `arcana: "major" | "minor"` et ses `points`. **Une
  carte muette jette** — retomber sur l'ancienne constante par défaut serait
  exactement le bug.
- Seul un **majeur** monte le Score maximum. Un **mineur** donne des points
  temporaires et une Brique, et **aucun +1**.
- Le trigger v1 était déjà **juste** (un 20 naturel qui amène les points à 0) —
  la prémisse « deux 20 naturels » que l'architecte avait écrite ne se trouvait
  nulle part dans le code.
- ⚠️ Le `+1` au Score est un **acquis permanent sans source de règle**. `play`
  **émet** l'événement `awakening-settled` portant le choix scalaire à
  enregistrer (`{path: "fh.awakenings[n]", value}`) ; il n'écrit pas le
  document, qui ne lui appartient pas.

### D.1 — Trois verbes de dé, trois fenêtres, trois cibles

| Verbe | Qui | Fenêtre | Cible |
|---|---|---|---|
| `addDie` | Bardic · Tactical Mind | **après un échec** | le **total** |
| `rerollDie` | Inspiration héroïque | **immédiatement après ce dé** | **n'importe quel dé** |
| `mountDie` | Guidance · l'avantage | **avant le jet** | le d20 / le montage |

**La fenêtre est une garde réelle, pas un commentaire.** `stageBonusDie` n'en
avait aucune : un Bardic passait sur un succès, et c'était un dé perdu pour
rien. Quand le jet n'a pas de seuil — c'est le MJ qui tient le DD — le moteur
**autorise et le dit**, plutôt que de faire semblant de vérifier.

`rerollDie` traverse le **même** mécanisme de réécriture en place que le
Portent : l'entrée est mutée, jamais dupliquée, et le verdict est recalculé.
C'est ce qui lui permet de viser un dé de dégâts aussi bien qu'un d20.

### D.2 — La transaction rouvrable : **rien n'a bougé**

`adjustment-choice` reste une phase bloquante, `completeHistoryAdjustment` en
reste la sortie, `entry.adjusted` est posé aux deux mêmes points, le badge
`adjusted` le dit toujours. Le lot n'a **ajouté** qu'une chose : un test qui la
vérifie **sur le moteur SRD nu**, là où personne ne l'avait encore fait.

### D.4 — Le remboursement conditionnel : **vérifié absent, livré**

Vérification demandée, résultat : **il n'existait pas**. `recreditPoolDie` ne
rendait une ressource que si son dé n'avait **pas** de résultat — un dé lancé
était dépensé, point. C'est juste pour Bardic (*« expended when it's rolled »*)
et **faux** pour Tactical Mind (*« If the check still fails, this use of Second
Wind isn't expended »*).

`settleCorrections` tourne au moment où le verdict est connu, et **le
remboursement laisse une ligne** — une ressource qui revient en silence est le
même défaut qu'une dette qui s'éteint en silence.

### D.5 — Le don de dé : **les deux bouts, pas le transport**

- **Chez le donneur**, `giveDie` décrémente **sa** ressource et émet
  `die-given` avec un enregistrement `fh-die-gift/1`. Il ne touche à aucun
  autre document.
- **Chez le receveur**, `receiveDie` pose une **ressource comptée ordinaire**
  qui **porte sa provenance**. C'est le point : un dé donné se dépense
  exactement comme un dé qu'on possédait déjà.
- **Le transport n'est pas fait**, et c'est la commande : il appartient au bloc
  `table` (M4). Dans ce lot, un dé reçu se pose directement, et deux tests le
  prouvent.
- **Les deux fenêtres sont deux portes** : `ahead` (le dé **attend** sur la
  fiche) et `reaction` (le dé arrive **pendant une transaction ouverte** et se
  stage aussitôt).
- **La couche compte** : donner un dé de **Bardic** est SRD ; donner un dé de
  **Destinée** (Arcane du Diable) est FH, et la couche s'inscrit sur **le même
  verbe** par `giftSources`.

---

## §5 — Les assertions `REWRITTEN`, et pourquoi

Discipline §0.7 : chaque assertion que la coupe rend fausse est **réécrite à la
nouvelle vérité**, marquée `REWRITTEN` sur sa propre ligne, avec sa raison.
Aucune n'a été relâchée ni supprimée.

| Suite | Assertion | Nouvelle vérité |
|---|---|---|
| `play-block` | « open a semé la Destinée » | `registerPlay()` sans couche est le moteur SRD nu : la tranche n'est pas semée, et le verbe **n'existe pas**. Plus forte que l'ancienne. |
| `play-block` | le garde structurel inspectait `src/play/*.mjs` à plat | il marche l'arbre : `src/layers/fh/` tient la **même** loi zéro-DOM |
| `play-settlement` | `h.t.rollTrayDice()` sur un dé d'or en attente | l'aiguillage passe par des **réclamations déclarées** ; `verbs.roll()` les consulte. Ce qui est vérifié n'a pas bougé. |
| `play-roller-state-machine` | idem, sur `stageDestinyFromPool` | idem |
| `play-roller-state-machine` | « le libellé suit le sceau vers `other-1` » | `other-1` n'est plus un sceau (D.3). Le retour se fait vers l'autre vrai sceau, et sceller hors liste est un **refus nommé**. |
| `play-roll-engine-adversarial` | `settleAwakening({name, numeral})` | la carte doit **déclarer** ce qu'elle donne (§C). Le COMPTE testé n'a pas bougé d'un pouce. |
| `play-roll-vocabulary` | 7 sources, ordre `destiny` en tête | 6 SRD + 1 de la couche, et l'ordre porte du sens : retirez la couche, il en reste six |
| `play-roll-vocabulary` | `token.label` | `token.labelId` + paquet (§0.13) |
| `play-roll-vocabulary` | `SEALABLE_SOURCES` à six | à **deux** (D.3) |
| `play-roll-vocabulary` | 13 règles de badge | **14** — `rerolled` est neuf, et 5 seulement sont SRD |
| `play-roll-vocabulary` | 8 verdicts, `rule.verdict` porte le mot | **11**, dont 6 SRD ; la règle porte un `id`, le paquet porte le mot |
| `play-roll-vocabulary` | badge `natural-20` = « CRITICAL 20 » | toujours vrai **avec la couche** ; le SRD nu dit « NATURAL 20 » sur la **même** règle |

**Aucune suite FH n'a été supprimée.** Les suites qui testent une mécanique
maison montent désormais la couche explicitement (`play-harness.mjs`), ce qui
est précisément ce qui rend `play-srd-only.test.mjs` intéressante : elle, ne la
monte pas.

---

## §6 — Les tests d'acceptation

| | Test | Verdict |
|---|---|---|
| **1** | un personnage SRD pur lance une compétence de bout en bout | ✅ |
| **2** | une attaque enchaîne toucher puis dégâts, deux phases d'un même jet | ✅ |
| **3** | **un personnage SRD pur dépense son Point d'inspiration héroïque pour RELANCER un dé, et le verdict est recalculé** | ✅ |

Le troisième est celui qui compte : Fate's Hand a **retiré** cette mécanique et
le SRD la garde. C'est le seul qui prouve la séparation **dans le sens
difficile** — une mécanique SRD que le système maison n'utilise pas.

**Deux gardes structurels** empêchent la coupe de se refermer en douce, et ils
jugent des octets, pas de la bonne volonté :

1. aucun fichier de `src/play/` ne contient les mots Destiny, Chaos, Overreach,
   Arcane, Awakening ou Fate (commentaires retirés d'abord — ils nomment ce qui
   est parti) ;
2. aucun fichier de `src/play/` ne **nomme une couche**, ni par son nom ni par
   son drapeau : pas de `if (fh)`, qui est la forme dégradée de la même erreur.

**145 tests, tous verts** (127 à la coupe de branche, +18).

---

## §7 — ⚠️ LISTE POUR L'ARCHITECTE n°1 : les drapeaux que FH doit lever

Levés par la couche aujourd'hui, dans la forme `$defs/flag` de `fh-char/1`
(`^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$`) :

| Drapeau | Ce qu'il allume | Note |
|---|---|---|
| `fh.destiny` | la réserve, les points, les dés, leur dépense | le socle : les quatre autres en dépendent |
| `fh.chaos` | les tables, les dettes portées, les 2d6 | tables **injectées**, jamais embarquées (§0.8) |
| `fh.overreach` | le manque devenu dette, sa sauvegarde, son coût | découle de `fh.destiny`, séparé exprès (invariant 4) |
| `fh.arcana` | l'Éveil, son compteur, le règlement par la carte | le paquet des 78 cartes est du **contenu**, pas ce drapeau |
| `fh.exhaustion` | le multiplicateur maison (−1 au lieu de −2) | ⚠️ le **seul** drapeau qui remplace une valeur de règle SRD |

**Trois questions que le lot ne tranche pas :**

1. **Granularité.** Ces cinq drapeaux sont montés **ensemble** aujourd'hui (une
   seule couche les lève tous). Faut-il qu'ils soient séparément activables — une
   table qui veut la Destinée sans le Chaos ? Le mécanisme le permet, la couche
   ne le fait pas.
2. **`fh.exhaustion` n'est pas de la même nature que les quatre autres** :
   il n'allume pas un module, il **remplace un nombre**. Si l'architecte veut
   que les drapeaux ne désignent que des modules, il lui faut un second
   vocabulaire pour les valeurs de règle.
3. **Qui les écrit dans `build`.** Le bloc `play` les *lève* (`derive.flags()`)
   ; c'est `build` qui devra les inscrire dans le document.

---

## §8 — ⚠️ LISTE POUR L'ARCHITECTE n°2 : la forme de provenance d'un dé reçu

**Le besoin, pas le schéma** (loi §0.10). Vérifié :
`resolved.resources[]` de `fh-char/1` a `{id, name, max, current, recharge}` et
**`additionalProperties: false`**. Il n'y a **aucun** champ de provenance, et
rien ne peut en porter un sans que l'architecte l'écrive.

Ce dont le moteur a besoin, mesuré sur les deux bouts construits :

```
origin: {
  from:      string   // QUI a donné le dé — le nom du personnage donneur
  source:    string   // QUELLE source : "bardic", "destiny", … (jeton de source)
  timing:    "ahead" | "reaction"   // LA FENÊTRE, et ce sont deux portes
  givenAt:   timestamp
  expiresAt: timestamp | null       // Bardic expire au bout d'une heure (SRD)
}
```

**Quatre choses à savoir avant de l'écrire :**

1. **`timing` n'est pas cosmétique.** Un dé donné *à l'avance* attend sur la
   fiche ; un dé donné *en réaction* arrive pendant une transaction ouverte et
   se stage aussitôt. Les confondre est le même genre d'erreur que confondre
   les trois verbes de D.1.
2. **`expiresAt` est réel** : *« Once within the next hour »* (Bardic
   Inspiration, SRD). Le moteur ne l'applique pas encore — il n'a pas d'horloge
   de séance — mais le champ doit exister ou l'information sera perdue au
   premier aller-retour par le document.
3. **`from` est un nom de personnage, pas un identifiant de document.** Le
   personnage appartient au joueur (décision 3) et le receveur n'a aucun droit
   de pointer le document du donneur. Si l'architecte veut un identifiant
   stable, il faut trancher d'où il vient.
4. **Le champ `origin` existe déjà dans le normaliseur de `play`** — il y était
   depuis le lot 3, jamais rempli. Le lot 5 le remplit et en fixe la forme.
   Un aller-retour `snapshot` → `open` **à l'intérieur du bloc `play`** la
   conserve, et un test le vérifie. **La frontière est le SCHÉMA** : avec
   `additionalProperties: false` sur `resolved.resources[]`, le premier bloc
   qui validera le document rejettera la ressource — ou, pire s'il élague, la
   dépouillera de sa provenance sans le dire (leçon `fix-panel-persistence`
   n°3 : jamais de strip silencieux). Ce lot ne peut pas fermer ça : il faut
   que le champ entre au schéma.

**Le nom `fh-die-gift/1`** est celui de l'enregistrement qui voyagera entre les
deux bouts (bloc `table`, M4). Il est proposé, pas ratifié.

---

## §9 — Ce que le lot n'a pas fait, et qui reste ouvert

- **Le transport du don** — bloc `table`, M4, par commande explicite de §L5.
- **L'expiration d'un dé reçu** — le champ existe, la règle attend une horloge
  de séance et la ratification du schéma (§8).
- **Le `slotResourceId` d'un sort** — le type le déclare, personne ne le
  produit encore (§4, exigence A).
- **La granularité des drapeaux** (§7, question 1).
- **Les points ouverts du lot 3** restent ouverts et ne sont pas rouverts ici :
  qui possède `destiny`/`vitals` (à trancher au lot `build`), et la copie de
  travail de séance — décision d'architecte déjà prise, non rouverte.
