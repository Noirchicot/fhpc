# Contrat de bloc — play

> Rempli par le **lot C** (portage du moteur de jets v1), **recoupé par le
> lot 5** (`5-moteur-srd-fh`). **À ratifier par l'architecte avant merge.**
> Les points ouverts sont marqués ⚠ et listés en fin de fichier.
>
> ⚠️ **LE BLOC EST SRD ; FATE'S HAND EST UNE COUCHE MONTÉE PAR L'APPELANT**
> (loi §0.12). `createPlay({ bus })` sans `layers` est le moteur du jeu de
> base : un personnage SRD pur le traverse de bout en bout, et **les verbes
> d'une couche n'existent pas** tant qu'elle n'est pas montée. Ce n'est pas un
> interrupteur — c'est une absence (loi §0.6). L'inventaire complet de la coupe
> vit dans `COUPE-LOT-5.md`.

## Nom

`play`

## Rôle (2 lignes)

Porte l'état de séance (transaction de jet, réserves, main, plateau,
historique) et le vocabulaire `data-*` v1. Émet `roll-settled` aux points de
règlement réels et `pool-changed` quand une ressource comptée bouge.

## Construction

```js
createPlay({ bus, layers = [], randomUint32, uuid, now })
```

`layers` est la liste des **modules moteur** montés (décision Q4 : une
mécanique nouvelle est un module activé par un drapeau, pas du contenu de
couche). Chacun déclare ses drapeaux, ses libellés, ses règles de verdict et de
badge, ses verbes, et **s'inscrit sur des MOMENTS** — il n'est jamais appelé
par le chemin commun.

```js
import { createFhLayer } from "../layers/fh/index.mjs";
createPlay({ bus, layers: [createFhLayer({ chaosTables })] });
```

### Les moments (`src/play/sequence.mjs`)

| Moment | Quand | Ce qu'un module peut rendre |
|---|---|---|
| `session-open` | `open` sème la séance | — (il sème sa tranche) |
| `session-snapshot` | `snapshot` rend au document | `{contribute}` |
| `session-clear` | CLEAR TRAY | — |
| `mount` | la console est prête, rien n'est lancé | `{events}` |
| `pre-roll` | ce qui se lance AVANT le d20 | `{claimed}` — il prend la suite |
| `result` | le d20 est tombé, son naturel connu | `{events, decision}` |
| `reopen` | des dés rejoignent un jet déjà réglé | `{events, decision, settled}` |

Quatre autres surfaces d'extension sont **déclaratives** (le module rend des
données, le moteur les lit) : les contributions de lexique (verdicts, badges,
sources, parts, total, dés du plateau, signature), le cycle de vie (verbes,
dérivations), les **valeurs de règle** (`rules`), et les **réclamations de
ROLL**. Elles sont mesurées et discutées dans `COUPE-LOT-5.md` §2.

## Les types de jet (exigence A)

Trois, déclarés dans `src/play/rolltypes.mjs`, chacun avec **ses phases** et
**sa liste FERMÉE de réglages** :

| Type | Ce que c'est | Phases |
|---|---|---|
| `check` | un jet contre un seuil | mount · pre-roll · d20 · result · open |
| `attack` | **deux jets liés** : toucher, puis des dégâts qu'un critique double (les dés, jamais le bonus) | + damage |
| `spell` | souvent aucun jet du lanceur : une sauvegarde de la cible, un emplacement, un niveau, parfois la concentration | + slot |

## Verbes

Seul point d'entrée du bloc. Route `play.<verbe>` via `dispatch` du noyau.
Un verbe inconnu jette en le nommant (loi §0.5, tenu par le registre J0).

**Les verbes marqués 🜂 appartiennent à la couche Fate's Hand : ils n'existent
que si elle est montée.**

### Séance

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `open` | `{character, destiny, vitals, history, poolResources, campaign, pseudo}` | Sème la séance depuis le document. `character` est LU, jamais écrit. Émet `pool-changed`. | — |
| `snapshot` | — | Rend au document ce qui lui appartient : `{destiny, vitals, history, poolResources}`. Élague les ressources épuisées. | — |

### Le jet — `data-roll-now`, `data-roll`, `data-clear-tray`, `data-history-id`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `prepare` | `{name, ability, bonus, mode?, dc?, note?, plusTwo?}` | Ouvre une console de jet sur un test nommé. | — |
| `configure` | patch de réglages | ⚠️ **Corrigé au lot 5.** Chaque réglage est lu contre la liste **FERMÉE DU TYPE COURANT** ; une clef étrangère **jette** en nommant ce que ce type accepte, au lieu d'être avalée. Sans console : sans effet. | clef inconnue, valeur illégale → **jette** |
| `roll` | — | **Aiguillage**, comme ROLL en v1 : destin armé → `resolvePending` ; jet ouvert → dés stagés ; console → jet configuré ; sinon → plateau libre. | file de dés vide (tests) |
| `quickRoll` | `{name, ability, bonus, note?}` | Un d20 immédiat, sans console. | — |
| `rollTray` | `{label?}` | Lance la main libre. Un dé de Destinée en attente s'y résout seul. | — |
| `clearTray` | `{closeConsole?}` | Vide la main et le commentaire courant. **Ne touche ni les dettes ni les badges épinglés.** Re-crédite les dés de réserve en attente. | — |
| `editEntry` | `{entryId}` | Rouvre une ligne du flux en console d'ajustement. | entrée absente : sans effet |

### D.1 — Les trois verbes de dé, et ils ne se ramènent pas l'un à l'autre

Trois fenêtres, trois cibles, trois portes. **Un moteur qui les traite pareil
laissera passer un Bardic sur un succès.**

| Verbe | Payload | Fenêtre → cible | Erreurs |
|---|---|---|---|
| `addDie` | `{source, sides?, poolResourceId?}` | **après un échec** → le **total**. Sources : `bardic`, `tactical` (SRD, `CORRECTION_DICE`). | jet non posé, jet réussi, type inapplicable, plafond → `state.message` + `false` |
| `rerollDie` | `{entryId, dieKey, poolResourceId?, source?}` | **immédiatement après ce dé** → **n'importe quel dé** (`d20`, `bonus:<id>`, `damage:<n>`, `free:<n>`). Point d'inspiration héroïque, SRD p.183 : « you must use the new roll ». Réécrit l'entrée **en place** et recalcule le verdict. | dé absent du jet, ressource épuisée → `state.message` + `false` |
| `mountDie` | `{source?, sides?, mode?}` | **avant le jet** → le d20 / le montage. Guidance, l'avantage. | jet déjà posé, plafond → `state.message` + `false` |

### D.5 — Le don d'un dé entre joueurs (les deux bouts, **pas** le transport)

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `giveDie` | `{source, to, timing, poolResourceId?, dieId?}` | **Chez le DONNEUR** : décrémente **sa** ressource, émet `die-given` avec un `fh-die-gift/1`. Ne touche à aucun autre document. | ressource absente ou épuisée → `state.message` + `null` |
| `receiveDie` | un `fh-die-gift/1` | **Chez le RECEVEUR** : pose une ressource comptée **ordinaire** portant sa **provenance**. `timing:"reaction"` sur un jet ouvert la stage aussitôt ; `"ahead"` la laisse attendre. | enregistrement malformé → **jette** ; réserve pleine → `state.message` |

**Le transport appartient au bloc `table`** (M4). Ici un dé reçu se pose
directement. ⚠️ La forme de `origin` est un **besoin de schéma** livré à
l'architecte, pas une entrée écrite par ce lot — voir `COUPE-LOT-5.md` §8.

### La main — `data-add-tray-die`, `data-die-*`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `addTrayDie` | `{sides}` | Console ouverte → dé bonus ; sinon → dé libre. | d20/d% en bonus, plafond de 3 bonus, plafond de 50 libres → `state.message` |
| `dropTrayDie` | `{sides}` | Le miroir : retire un dé de cette taille, re-crédite s'il venait de la réserve. | — |
| `stageDie` | `{sides, label?, sourceIcon?}` | Stage un dé bonus sur un jet OUVERT. | hors jet ouvert : sans effet ; d20/d%, plafond → `state.message` |
| `unstageDie` | `{sides}` | Retire le dernier dé stagé de cette taille. Rend `true`/`false`. | — |
| `selectDie` | `{base?}`\|`{stagedId}`\|`{bonusId}`\|`{freeId}`\|`{poolId}`\|`{destinyDieId}`\|`{landedKey, entryId}` | Désigne le dé que `mutateDie`/`sealDie`/`dropDie` visent. **C'est de la sélection, donc de l'état de séance — pas du DOM.** | — |
| `mutateDie` | `{advantageMode?, forcedResult?, colour?}` | Applique au dé désigné. Sur un dé TOMBÉ, réécrit l'entrée en place (Portent) et la recalcule. | pas de dé désigné : sans effet |
| `sealDie` | `{seal}` | Déclare que le dé **EST** un dé de correction (le sceau le renomme à chaque fois). ⚠️ **D.3 : la liste est tombée à `bardic` et `tactical`.** Le sceau `destiny` a été **supprimé** — un dé de Destinée se prend dans la réserve (`spendDestiny`), ce n'est pas un autocollant. | sceau hors liste → `state.message`, et rien n'est renommé |
| `dropDie` | — | Retire le dé désigné, re-crédite sa ressource. | d20 de base et dé tombé : refusés, avec un message |

### La Destinée — `data-destiny-pool`, `data-destiny-die`, `data-destiny-step`, `data-destiny-field`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| 🜂 `spendDestiny` | `{dieId}` | **Ne dépense rien.** Pose le dé d'or dans celui des trois contextes qui est vivant (jet ouvert, console, plateau libre). ROLL seul dépense. | dé indisponible, jet portant déjà de la Destinée → `state.message` |
| 🜂 `stageDestinyDie` | `{dieId}` | Le stage sur un jet ouvert (chemin interne de `spendDestiny`). | — |
| 🜂 `adjustDestinyDie` | `{sides, direction}` | Correction manuelle de la réserve. Émet `pool-changed`. | — |
| 🜂 `setDestinyField` | `{field, value, reason?}` | `score` ou points. Émet `pool-changed`. | — |
| 🜂 `settleAwakening` | `{card?}` | Règle **un** Éveil dû : score +1, +10 points, compteur −1 (plancher 0). ⚠ voir points ouverts. | — |

### Les décisions — `data-die-choice`, `data-nat-choice`, `data-arcane-fate`

Ce sont les **seules** choses qui tiennent la transaction.

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `resolveDieChoice` | `{index}` | Tranche un A/D (d20, bonus, Destinée, ajustement). | hors prompt `die-choice` : sans effet |
| 🜂 `resolveNatOne` | `{entryId, choice: "accept"\|"chaos"}` | Accepter : +1 point. Défier : le 1 devient 20, points à 0, **Chaos porté** (jamais lancé sur place). | entrée non-1 ou déjà répondue : sans effet |
| 🜂 `resolveArcaneOne` | `{entryId, choice: "accept"\|"chaos"}` | Accepter : l'échec tient, le +1 reste. Refuser : le 1 lit la face max, réserve vidée, Chaos porté. | idem |

### Le destin différé — `data-pending-*`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| 🜂 `armPending` | `{id}` | **Remplit le plateau seulement** (2d6 Chaos, ou 1d20 de sauvegarde). ROLL reste l'appel du joueur. | transaction active → message ; marqueur non résoluble : sans effet |
| 🜂 `resolvePending` | — | Lance ce qui est armé, écrit l'entrée, retire le marqueur. | rien d'armé : sans effet |
| 🜂 `addPending` | `{kind, …}` | Ajoute une dette ou une note épinglée. Au-delà de 4, la plus ancienne est évincée **avec une ligne qui le dit**. | — |
| 🜂 `dropPending` | `{id}` | Annule ce marqueur, et lui seul. | — |
| 🜂 `renamePending` | `{id?, label}` | Renomme un badge, ou en épingle un nouveau. Rend `false` si refusé. | libellé vide, 6 badges max → `state.message` |

### La réserve comptée — `data-pool-spend`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `spendPoolResource` | `{id}` | Décrémente **maintenant** et stage le dé où vit la main. ROLL rend définitif, la reprise annule. ⚠️ **D.4** : une ressource dont la source déclare `refundIfStillFails` (Tactical Mind) est **re-créditée au règlement** si le test échoue quand même — avec une ligne qui le dit. Émet `pool-changed`. | ressource épuisée, plafond de bonus → `state.message` |
| `setPoolResources` | `{resources}` | Remplace la liste (normalisée). Émet `pool-changed`. | — |

### Les vitaux — `data-hp-*`, `data-exh-*`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `setVitals` | `{patch, message?}` | PV, PV max, repos court, Épuisement. Émet `pool-changed`. | — |
| `setExhaustion` | `{level, reason?, silent?}` | Borné 0–6. Rend le niveau atteint. | — |

## Événements

| Type | Payload | Quand |
|---|---|---|
| `roll-settled` | `{rollId, rev, roll: fh-roll/1, intent}` | Aux **deux** points de règlement réels : `openRollState` (tout chemin de d20 y converge) et la branche `finish-sequence` de `runQueueDone` (jet de Destinée isolé, Chaos, sauvegarde d'Overreach). **Gardé par `rollTransactionActive()`** et dédupliqué par signature : une entrée inchangée ne se réémet pas ; une entrée qui accrète un dé stagé se réémet en `rev+1`. |
| `pool-changed` | `{reason, vitals, poolResources, …contributions}` | Chaque mouvement de vitaux ou de ressources comptées, **plus ce que chaque couche montée déclare posséder** (la couche FH y remet `destiny`). |
| `die-given` | `fh-die-gift/1` | Un joueur donne un dé (D.5, bout DONNEUR). Le **transport** appartient au bloc `table`. |
| 🜂 `awakening-settled` | `{card, granted, choice, owed}` | Un Éveil réglé. Porte le **choix scalaire** que `build` doit inscrire : un `+1` au Score est un acquis permanent **sans source de règle**, et `resolved` seul l'effacerait à la prochaine dérivation (invariant 1). |

**Le règlement n'est PAS dans `addHistory`.** `finishRolledEntry` appelle
`addHistory` puis RETOURNE sur un 1 naturel : régler là montrerait à la table
un échec critique qui devient silencieusement un 20. Et un jet ajusté ne passe
jamais par `addHistory` — `completeHistoryAdjustment` mute l'entrée en place.

## Tranche d'état

`play` seul l'écrit. Personne ne la lit autrement qu'en s'abonnant.

| Champ | Forme | Note |
|---|---|---|
| `character` | référence `resolved` | **LU, jamais écrit.** Sert aux bonus de sauvegarde. |
| 🜂 `destiny` | `{score, points, dice[], overreach, pending[], awakeningOwed, lastChange}` | ⚠ **écrit par la couche, pas par le moteur.** Sans elle, la clef n'existe pas. |
| `vitals` | `{current, max, exhaustion, shortRestUsed}` | ⚠ idem |
| `history` | `[]`, 20 max, plus récent d'abord | rendu par `snapshot` |
| `events` | `[]`, 10 max | commentaire courant ; `clearTray` l'emporte |
| `poolResources` | `[{id, label, short, kind, sides, count, tint}]` | 12 max |
| `traySelection`, `trayResults`, `trayTitle`, `trayResultText`, `trayVerdict`, `trayQuietTitle`, `trayLabel` | la main et sa légende | **ne voyage pas** |
| `rollSequence`, `trayPrompt`, `queueDone`, `rollConfig`, `diePrompt` | la transaction et la sélection | **ne voyage pas** |
| 🜂 `pendingArmed`, `destinyStaged` | ce que la couche a armé ou posé | **ne voyage pas** ; n'existe pas sans elle |
| `message`, `messageKind` | dernier refus adressé au joueur | remplace `renderMessage()` |
| `settled` | `{[entryId]: {signature, rev}}` | mémoire de règlement de la séance |

Les dérivations (`derive`) sont en **lecture seule** sur une entrée : badges,
Ruling, `fh-roll/1`, `intent`, dés du plateau, ligne de Chaos. Aucune surface
n'a le droit d'en recalculer une pour son compte — c'est la leçon des treize
`badges.push` éparpillés dans le rendu v1.

## Invariants

1. **Une seule chose règle un jet** : `settleEntry`, et jamais sous transaction.
2. **Rien n'est dépensé avant ROLL** — ni un dé de Destinée, ni une ressource
   de réserve reprise avant le jet. C'est ce qui rend l'annulation gratuite.
3. **Les points de Destinée ne tombent jamais sous zéro** ; le manque devient
   l'Overreach, qui pose le DD du Chaos.
4. **Chaos et Overreach sont deux mécaniques séparées**, et toutes deux
   DIFFÉRÉES : la table n'est jamais bloquée au milieu d'un tour.
5. **Aucune dette ne disparaît en silence** : une éviction laisse une ligne.
6. **Un jet déjà classé garde le niveau d'Épuisement sous lequel il a roulé.**
7. Les chaînes `outcome` sont **face-machine et gelées** ; les `verdict` sont de
   l'affichage et peuvent être renommés.
8. **L'état de séance ne voyage pas** (règle de persistance n°4).
9. Un dé tombé peut être **remplacé, jamais retiré** de son jet ; le remplacer
   — par un Portent ou par une relance (D.1) — réécrit l'entrée en place, sans
   en ouvrir une seconde.
10. ⚠️ **La transaction de jet est ROUVRABLE, et c'est intouchable (D.2).** Un
    jet réglé n'est pas figé : il reçoit un dé et **change de verdict**, en
    révision du même jet. Rien du lot 5 n'y a touché.
11. **Le moteur rend des IDENTIFIANTS ; un paquet de libellés rend les MOTS**
    (loi §0.13). Une règle de verdict ou de badge ne porte aucun texte. Un id
    sans mot **jette** — jamais un repli qui peindrait `verdict.natural-20` sur
    le plateau d'une table en séance.
12. **Le chemin commun ne cite aucune couche.** Deux gardes structurels le
    vérifient sur les octets (`tests/play-srd-only.test.mjs`) : aucun fichier
    de `src/play/` ne nomme une mécanique maison, ni une couche, ni un drapeau.

## Dépendances interdites

- **DOM, `window`, `document`, `localStorage`** — tenu par un garde structurel
  (`tests/play-block.test.mjs`) qui inspecte le code de `src/play/`.
- **Réseau** (`fetch`, `XMLHttpRequest`, `WebSocket`) — le transport appartient
  au bloc `table`, qui s'abonne à `roll-settled`.
- **Minuteurs** (`setTimeout`, `setInterval`) — l'animation et les délais
  d'overlay sont de l'UI.
- **`Math.random` et la lecture directe de `globalThis.crypto`** hors de
  `utils.mjs` : le hasard est injecté, sinon une suite devient non déterministe
  sans le dire.
- **La tranche d'un autre bloc.** `play` ne lit pas le document ; il reçoit ce
  qu'il lui faut par `open` et le rend par `snapshot`.
- **Le contenu Fate's Hand** : les tables de Chaos sont injectées, pas
  embarquées (§0.8).

## Obligations de test

1. Les deux points de règlement, et **le piège `addHistory`** : un 1 naturel non
   résolu ne doit jamais atteindre la table (`play-settlement`).
2. Déduplication par signature et révisions d'un même jet.
3. La machine à états complète : Destinée, Chaos, Overreach, A/D, Portent,
   dés stagés, M1 (`play-roller-state-machine`).
4. Le vocabulaire : **14** règles de badge (5 SRD + 9 de la couche), **11**
   verdicts (6 SRD + 5), les `outcome` inchangés au bit près, et les MOTS dans
   le paquet et non sur la règle (`play-roll-vocabulary`).
5. Les régressions adversariales du Package 9 (`play-roll-engine-adversarial`).
6. La réserve comptée et **tous** les chemins de reprise
   (`play-dice-pool`).
7. Le garde structurel zéro DOM / zéro réseau / hasard injecté
   (`play-block`).
8. Toute suite tourne sur une **file de dés déterministe qui jette quand elle
   est épuisée**, et chaque scénario finit sa file à zéro.
9. ⚠️ **Les trois tests d'acceptation du lot 5** (`play-srd-only`), qui font
   foi sur la séparation : un personnage SRD pur lance une compétence de bout
   en bout ; une attaque enchaîne toucher puis dégâts comme deux phases d'un
   même jet ; **un personnage SRD pur dépense son Point d'inspiration héroïque
   pour RELANCER un dé, et le verdict est recalculé** — une mécanique que
   Fate's Hand a retirée et que le SRD garde.
10. Les **deux gardes structurels** de la coupe, jugés sur les octets : aucun
    fichier de `src/play/` ne cite une mécanique maison, aucun ne nomme une
    couche (`play-srd-only`).
11. D.1 (les trois fenêtres), D.2 (la transaction rouvrable, **sans** la
    couche), D.4 (le remboursement conditionnel), D.5 (les deux bouts du don et
    la survie de la provenance), A (la liste fermée par type).

## ⚠ Points ouverts, pour l'architecte

1. **Qui possède `destiny` et `vitals`.** L'architecture les range dans
   `resolved` (ressources comptées, décrémentées au règlement) ; le moteur v1
   les mute directement et les suites en dépendent. Le portage les garde dans
   la tranche de `play`, semés par `open` et rendus par `snapshot`, et annonce
   chaque mouvement par `pool-changed`. C'est le compromis qui préserve le
   comportement sans improviser une règle (loi §0.10). **À trancher au lot
   `build`** : soit `play` garde une copie de travail de séance, soit il
   n'écrit que des événements et `build` applique.
2. **`settleAwakening`** n'existe pas dans la table du kickoff. C'est la moitié
   MOTEUR de `keepArcana` v1 (score +1, +10 points, un Éveil dû réglé) ; le
   paquet des 22 Arcanes est du contenu et le choix de la carte appartient au
   document. Sans ce verbe, le compteur `awakeningOwed` ne redescendrait
   jamais et la régression du Package 9 serait perdue. **À ratifier ou à
   renvoyer au bloc qui portera les Arcanes.**
3. ~~**`configure`** écrit dans la console par patch partiel~~ — **RÉSOLU au
   lot 5 (exigence A)** : la liste est fermée **par type**, et une clef
   étrangère jette.

4. **Le cycle de vie de module** (`session-open` / `session-snapshot` /
   `session-clear`) est le seul point que les phases du lot 3 ne nommaient pas.
   La disposition de l'état **ne change pas d'un octet** — la tranche de la
   couche reste `state.destiny`, seul change qui l'écrit. **À ratifier**, avec
   sa forme si l'architecte en veut une autre (`state.layers.<nom>` par ex.).

5. **Les drapeaux de couche** — liste et trois questions dans
   `COUPE-LOT-5.md` §7. `fh.exhaustion` n'est pas de la même nature que les
   quatre autres : il remplace un **nombre**, il n'allume pas un module.

6. **La forme de provenance d'un dé reçu** — `COUPE-LOT-5.md` §8. Le moteur la
   remplit et la fait survivre à un aller-retour `snapshot`/`open` ; elle bute
   sur `additionalProperties: false` dans `resolved.resources[]`. **C'est
   l'architecte qui l'écrit au schéma.**

7. **`slotResourceId`** : consommer l'emplacement d'un sort suppose de savoir
   quelle ressource comptée le porte. Le type le déclare, le lot **n'invente
   aucune convention d'identifiant** — sans lui, la dépense est annoncée sans
   être décrémentée.
