# Contrat de bloc — play

> Rempli par le **lot C** (portage du moteur de jets v1). **À ratifier par
> l'architecte avant merge.** Les points ouverts sont marqués ⚠ et listés en
> fin de fichier.

## Nom

`play`

## Rôle (2 lignes)

Porte l'état de séance (transaction de jet, réserves, main, plateau,
historique) et le vocabulaire `data-*` v1. Émet `roll-settled` aux points de
règlement réels et `pool-changed` quand une ressource comptée bouge.

## Verbes

Seul point d'entrée du bloc. Route `play.<verbe>` via `dispatch` du noyau.
Un verbe inconnu jette en le nommant (loi §0.5, tenu par le registre J0).

### Séance

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `open` | `{character, destiny, vitals, history, poolResources, campaign, pseudo}` | Sème la séance depuis le document. `character` est LU, jamais écrit. Émet `pool-changed`. | — |
| `snapshot` | — | Rend au document ce qui lui appartient : `{destiny, vitals, history, poolResources}`. Élague les ressources épuisées. | — |

### Le jet — `data-roll-now`, `data-roll`, `data-clear-tray`, `data-history-id`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `prepare` | `{name, ability, bonus, mode?, dc?, note?, plusTwo?}` | Ouvre une console de jet sur un test nommé. | — |
| `configure` | patch partiel de la config | Écrit dans la config ouverte (MOD, DD, mode). Sans console : sans effet. | — |
| `roll` | — | **Aiguillage**, comme ROLL en v1 : destin armé → `resolvePending` ; jet ouvert → dés stagés ; console → jet configuré ; sinon → plateau libre. | file de dés vide (tests) |
| `quickRoll` | `{name, ability, bonus, note?}` | Un d20 immédiat, sans console. | — |
| `rollTray` | `{label?}` | Lance la main libre. Un dé de Destinée en attente s'y résout seul. | — |
| `clearTray` | `{closeConsole?}` | Vide la main et le commentaire courant. **Ne touche ni les dettes ni les badges épinglés.** Re-crédite les dés de réserve en attente. | — |
| `editEntry` | `{entryId}` | Rouvre une ligne du flux en console d'ajustement. | entrée absente : sans effet |

### La main — `data-add-tray-die`, `data-die-*`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `addTrayDie` | `{sides}` | Console ouverte → dé bonus ; sinon → dé libre. | d20/d% en bonus, plafond de 3 bonus, plafond de 50 libres → `state.message` |
| `dropTrayDie` | `{sides}` | Le miroir : retire un dé de cette taille, re-crédite s'il venait de la réserve. | — |
| `stageDie` | `{sides, label?, sourceIcon?}` | Stage un dé bonus sur un jet OUVERT. | hors jet ouvert : sans effet ; d20/d%, plafond → `state.message` |
| `unstageDie` | `{sides}` | Retire le dernier dé stagé de cette taille. Rend `true`/`false`. | — |
| `selectDie` | `{base?}`\|`{stagedId}`\|`{bonusId}`\|`{freeId}`\|`{poolId}`\|`{destinyDieId}`\|`{landedKey, entryId}` | Désigne le dé que `mutateDie`/`sealDie`/`dropDie` visent. **C'est de la sélection, donc de l'état de séance — pas du DOM.** | — |
| `mutateDie` | `{advantageMode?, forcedResult?, colour?}` | Applique au dé désigné. Sur un dé TOMBÉ, réécrit l'entrée en place (Portent) et la recalcule. | pas de dé désigné : sans effet |
| `sealDie` | `{seal}` | Habille le dé (le sceau le renomme à chaque fois). `seal:"destiny"` sort un dé de la réserve à la place. | pas de dé de Destinée disponible → `state.message` |
| `dropDie` | — | Retire le dé désigné, re-crédite sa ressource. | d20 de base et dé tombé : refusés, avec un message |

### La Destinée — `data-destiny-pool`, `data-destiny-die`, `data-destiny-step`, `data-destiny-field`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `spendDestiny` | `{dieId}` | **Ne dépense rien.** Pose le dé d'or dans celui des trois contextes qui est vivant (jet ouvert, console, plateau libre). ROLL seul dépense. | dé indisponible, jet portant déjà de la Destinée → `state.message` |
| `stageDestinyDie` | `{dieId}` | Le stage sur un jet ouvert (chemin interne de `spendDestiny`). | — |
| `adjustDestinyDie` | `{sides, direction}` | Correction manuelle de la réserve. Émet `pool-changed`. | — |
| `setDestinyField` | `{field, value, reason?}` | `score` ou points. Émet `pool-changed`. | — |
| `settleAwakening` | `{card?}` | Règle **un** Éveil dû : score +1, +10 points, compteur −1 (plancher 0). ⚠ voir points ouverts. | — |

### Les décisions — `data-die-choice`, `data-nat-choice`, `data-arcane-fate`

Ce sont les **seules** choses qui tiennent la transaction.

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `resolveDieChoice` | `{index}` | Tranche un A/D (d20, bonus, Destinée, ajustement). | hors prompt `die-choice` : sans effet |
| `resolveNatOne` | `{entryId, choice: "accept"\|"chaos"}` | Accepter : +1 point. Défier : le 1 devient 20, points à 0, **Chaos porté** (jamais lancé sur place). | entrée non-1 ou déjà répondue : sans effet |
| `resolveArcaneOne` | `{entryId, choice: "accept"\|"chaos"}` | Accepter : l'échec tient, le +1 reste. Refuser : le 1 lit la face max, réserve vidée, Chaos porté. | idem |

### Le destin différé — `data-pending-*`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `armPending` | `{id}` | **Remplit le plateau seulement** (2d6 Chaos, ou 1d20 de sauvegarde). ROLL reste l'appel du joueur. | transaction active → message ; marqueur non résoluble : sans effet |
| `resolvePending` | — | Lance ce qui est armé, écrit l'entrée, retire le marqueur. | rien d'armé : sans effet |
| `addPending` | `{kind, …}` | Ajoute une dette ou une note épinglée. Au-delà de 4, la plus ancienne est évincée **avec une ligne qui le dit**. | — |
| `dropPending` | `{id}` | Annule ce marqueur, et lui seul. | — |
| `renamePending` | `{id?, label}` | Renomme un badge, ou en épingle un nouveau. Rend `false` si refusé. | libellé vide, 6 badges max → `state.message` |

### La réserve comptée — `data-pool-spend`

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `spendPoolResource` | `{id}` | Décrémente **maintenant** et stage le dé où vit la main. ROLL rend définitif, la reprise annule. Émet `pool-changed`. | ressource épuisée, plafond de bonus → `state.message` |
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
| `pool-changed` | `{reason, destiny, vitals, poolResources}` | Chaque mouvement de points de Destinée, de dés de la réserve, de dettes en attente, de vitaux ou de ressources comptées. |

**Le règlement n'est PAS dans `addHistory`.** `finishRolledEntry` appelle
`addHistory` puis RETOURNE sur un 1 naturel : régler là montrerait à la table
un échec critique qui devient silencieusement un 20. Et un jet ajusté ne passe
jamais par `addHistory` — `completeHistoryAdjustment` mute l'entrée en place.

## Tranche d'état

`play` seul l'écrit. Personne ne la lit autrement qu'en s'abonnant.

| Champ | Forme | Note |
|---|---|---|
| `character` | référence `resolved` | **LU, jamais écrit.** Sert aux bonus de sauvegarde. |
| `destiny` | `{score, points, dice[], overreach, pending[], awakeningOwed, lastChange}` | ⚠ voir points ouverts |
| `vitals` | `{current, max, exhaustion, shortRestUsed}` | ⚠ idem |
| `history` | `[]`, 20 max, plus récent d'abord | rendu par `snapshot` |
| `events` | `[]`, 10 max | commentaire courant ; `clearTray` l'emporte |
| `poolResources` | `[{id, label, short, kind, sides, count, tint}]` | 12 max |
| `traySelection`, `trayResults`, `trayTitle`, `trayResultText`, `trayVerdict`, `trayQuietTitle`, `trayLabel` | la main et sa légende | **ne voyage pas** |
| `rollSequence`, `trayPrompt`, `queueDone`, `rollConfig`, `pendingArmed`, `destinyStaged`, `diePrompt` | la transaction et la sélection | **ne voyage pas** |
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
   réécrit l'entrée en place, sans en ouvrir une seconde.

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
4. Le vocabulaire : 13 règles de badge, 8 verdicts, les `outcome` inchangés au
   bit près (`play-roll-vocabulary`).
5. Les régressions adversariales du Package 9 (`play-roll-engine-adversarial`).
6. La réserve comptée et **tous** les chemins de reprise
   (`play-dice-pool`).
7. Le garde structurel zéro DOM / zéro réseau / hasard injecté
   (`play-block`).
8. Toute suite tourne sur une **file de dés déterministe qui jette quand elle
   est épuisée**, et chaque scénario finit sa file à zéro.

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
3. **`configure`** écrit dans la console par patch partiel, faute de spec de
   champ à champ. À resserrer si l'architecte veut une liste blanche.
