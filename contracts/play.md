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
import { createFhLayer } from "../modules/fh/index.mjs";
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
| 🜂 `setDestinyField` | `{field, value, reason?}` | `score` ou points. Une valeur posée à la main est **déclarée**, donc **non plafonnée** (⚠ voir points ouverts n°8). Émet `pool-changed`. | — |
| 🜂 `recoverDestiny` | `{amount?, reason?}` | **Le seul chemin que le Score borne.** Rend des points de **récupération** ; `amount` vaut **1** par défaut (§2 : « Long rest: regain +1 Destiny Point »). Ce qu'une espèce ou un Arcane y ajoute descend de la couche par `amount`. Un plafond qui mord **laisse une ligne**. Émet `pool-changed`. | `amount` non entier, négatif ou illisible → **jette** |
| 🜂 `settleAwakening` | `{card}` | Règle **un** Éveil dû : la **carte** déclare ce qu'elle donne (seul un **majeur** monte le Score de +1 ; les points sont **temporaires** et peuvent dépasser le Score), compteur −1 (plancher 0). ⚠ voir points ouverts. | carte absente, `arcana` hors `major`/`minor`, points non déclarés → **jette** |

### Les décisions — `data-die-choice`, `data-nat-choice`, `data-arcane-fate`

Ce sont les **seules** choses qui tiennent la transaction.

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `resolveDieChoice` | `{index}` | Tranche un A/D (d20, bonus, Destinée, ajustement). | hors prompt `die-choice` : sans effet |
| 🜂 `resolveNatOne` | `{entryId, choice: "accept"\|"chaos"}` | Accepter : +1 point. Défier : le 1 devient 20, points à 0, **Chaos porté** (jamais lancé sur place). | entrée non-1 ou déjà répondue : sans effet |
| 🜂 `resolveArcaneOne` | `{entryId, choice: "accept"\|"chaos"}` | Accepter : l'échec tient, le +1 reste. Refuser : le 1 lit la face max, réserve vidée, Chaos porté. | idem |

### La Vibration — ce qu'un critique arcanique OFFRE (lot 16)

Le **maximum** d'un dé de Destinée est un **critique arcanique** ; si le
personnage a un Arcane connu, il signale en plus une **Vibration** : un effet
de sort **optionnel**, de niveau égal à la taille du dé — **d4→1 · d6→2 ·
d8→3 · d10→4 · d12→5** (`The Major Arcana.md`).

Elle voyage sur `entry.destiny.vibration = {sides, level}`, s'annonce dans le
flux et porte le badge `vibration`. **Le moteur ne connaît aucun texte de
carte** : il déclenche et calcule le niveau, l'effet est celui que porte
l'Arcane du personnage et c'est une **couche de contenu** qui le rend (Q4).
Un Arcane inconnu ne signale rien — le critique arcanique, lui, a lieu quand
même. Une taille de dé hors de la table **jette** plutôt que d'inventer un
niveau.

**OÙ LE MOTEUR LIT « ton Arcane » — corrigé au lot 21.** Il lisait
`character.destinyBuild.arcana`, un chemin **v1** : zéro occurrence dans
`schemas/fh-char.schema.json`, zéro dans `examples/*.json`. Sur un document v2
il rendait `false` à tous les coups, et **aucune Vibration ne s'est jamais
signalée**. Il lit désormais le choix ratifié le 2026-08-08 (§9 ci-dessous) :

```json
{ "path": "fh.destiny.arcana", "ref": { "kind": "arcana", "id": "…" } }
```

Le moteur y vérifie **seulement qu'une carte est nommée** — pas son nom, pas
son `power`, pas son effet. Trois formes **jettent** au lieu de rendre « pas de
carte » (loi §0.5), parce que répondre « non » à une question mal posée est
exactement ainsi que cette mécanique est morte une fois : un `character` qui ne
porte pas `build.choices` (ce n'est pas un `fh-char/1` — la tranche `resolved`,
une fiche v1) ; un choix qui porte un `value` au lieu d'un `ref` ; un `ref`
d'un autre genre que `arcana`. **Aucun `character` du tout** reste légitime et
silencieux.

### Le Tilt — la seule façon dont Fate's Hand penche un jet (lot 21)

Règle d'Eric, **ratifiée le 2026-08-08**. Elle remplace tous les malus chiffrés
**situationnels** du système.

| Tilts | Désavantage présent ? | Résultat |
|---|---|---|
| 0 | non | jet normal |
| **1** | non | **+2** |
| **2 ou plus** | non | **Avantage** |
| 0 | **oui** | **Désavantage** |
| **1 ou plus** | **oui** | **jet normal** — tout s'annule |

⭐ **Il n'existe pas de Tilt négatif.** Un malus s'exprime toujours en donnant
un Tilt à l'**autre** côté : un Tilt sur l'AC du défenseur, ou un Tilt sur le
DC (soit **+2 au DC**). La raison d'Eric gouverne la forme du code : *« ça
évite aux humains des calculs trop compliqués »* — rien ne s'additionne, c'est
une présence ou une absence, comme l'Avantage en 5e.

**Drapeau** : `fh.tilt`. **Réglages de console** (🜂, ils n'existent pas sans la
couche) : `tilts` — un entier ≥ 0 ; `tiltDisadvantage` — un booléen. Un compte
négatif ou illisible **jette**, et le refus dit où le malus se donne.

**Ce que le moteur en fait** : la table est une fonction pure
(`src/modules/fh/tilt.mjs`) qui rend `{outcome, mode, bonus}`. La couche
l'applique au moment `pre-roll`, priorité 40 — avant que le dé de Destinée
puisse réclamer la séquence. Elle **ne réimplémente ni l'Avantage ni le
Désavantage** : elle produit le `d20Mode` que le moteur SRD résout déjà. Le
+2 voyage sur `plusTwo`, le fait sur `entry.tilt = {tilts, disadvantage,
outcome}`, et le badge `tilt` le rend lisible à la table.

> ⚠️ **Ce que le Tilt ne touche pas, et c'est tranché.** « Il n'y a plus de −2 »
> ne vise QUE les malus situationnels. L'**Épuisement** reste un modificateur
> chiffré appliqué au jet (−1 par degré sous FH, `rules.exhaustionPerLevel`) —
> Eric, 2026-08-08, reconfirmé le 2026-08-09. Les **−2 des Tables de Fatalité**
> sont des séquelles du Chaos sur une caractéristique, pas des modificateurs de
> jet : ils restent tels quels. **Aucune synergie n'est modélisée** — « 1 = +2 ·
> 2 = avantage » est décidé à la table, le moteur reçoit un compte.

> ⚠️ **Le moteur refuse de trancher une collision.** Si une source SRD a déjà
> posé `d20Mode` dans l'**autre** sens que le Tilt, il **jette** en nommant les
> deux : Fate's Hand annule dans sa table, la 5e annule entre avantage et
> désavantage, et rien ne ratifie laquelle l'emporte (loi §0.10).

> ⚠️ **Vibration ≠ Éveil arcanique**, et les confondre est une erreur déjà
> commise. L'**Éveil** se déclenche sur des **Points à 0 après un 20 naturel
> au d20** et fait piocher dans **les 78 cartes** ; la **Vibration** se
> déclenche sur un **critique arcanique** et rend l'effet listé sur **ton**
> Arcane. Le moteur a **raison** de ne pas déclencher d'Éveil sur un critique
> arcanique.

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
| `character` | le document `fh-char/1` | **LU, jamais écrit.** Sert aux bonus de sauvegarde **et** — depuis le lot 21 — à savoir si le personnage nomme un Arcane (`build.choices[]`). ⚠ **Cette ligne disait « référence `resolved` », et le lot 21 la corrige à ce que le code exige désormais.** Elle n'a jamais été exacte : `saveInfo` lit `abilities`/`pb`/`savingProficiencies`, des noms **plats de la v1** qui ne sont ni au sommet de `fh-char/1` ni dans `resolved` (`resolved.abilities.str` est `{score, mod}`, `resolved.proficiency`, `resolved.saves`). Aucun appelant de production n'existe encore : le seul écrivain est `open()`. **À ratifier, avec le portage de `saveInfo`** — voir `INVENTAIRE-LOT-21.md`, question n°1. |
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
3 bis. **Le Score de Destinée plafonne la RÉCUPÉRATION, et rien d'autre**
   (lot 16, règle tranchée par Eric le 2026-08-08). Toute **hausse** de points
   déclare sa nature ; une hausse qui n'en déclare aucune **jette**. Une
   **baisse** n'en déclare aucune — dépenser n'est jamais plafonné.
   · `recovered` — bornée par `max(score, points actuels)` : elle ne franchit
     pas le Score, et ne fait pas redescendre qui est déjà au-dessus ;
   · `temporary` — pioche d'Arcane, 1 naturel, **et le +1 de l'« Accept » sur
     un dé de Destinée** (§3.4) : **non bornée**, et ce qui dépasse le Score
     **reste jusqu'à ce qu'on le dépense** ;
   · `declared` — une valeur posée à la main (⚠ point ouvert n°8).
   **UN SEUL COMPTEUR, PAS DEUX** : « tant que je ne suis pas au-dessus de mon
   score, les temporaires se comportent comme des récupérations » — il n'y a
   donc rien à distinguer sous le plafond, et le moteur ne tient aucune
   comptabilité de points temporaires.
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
4. Le vocabulaire : **16** règles de badge (5 SRD + 11 de la couche), **11**
   verdicts (6 SRD + 5), les `outcome` inchangés au bit près, et les MOTS dans
   le paquet et non sur la règle (`play-roll-vocabulary`).
   REWRITTEN
   *(lot 16 : quatorze → quinze. La quinzième est `vibration`, retrouvée — le
   dock v1 la portait pour les 22 Arcanes, la couche v2 n'en avait aucune
   trace. Elle descend de la couche, comme il se doit : pas d'Arcane, pas de
   Vibration.)*
   REWRITTEN
   *(lot 21 : quinze → seize. La seizième est `tilt`. Un +2 ou un avantage sans
   badge est un jet dont la table ne peut pas relire la raison — c'est
   exactement ce que cette collection existe pour empêcher.)*
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
12. **Les deux écarts du lot 16** (`fh-destiny`) : le plafond de récupération
    (dont l'attaque du garde — une hausse sans nature doit rougir), la table
    des cinq niveaux de Vibration, l'absence de Vibration sans Arcane, et la
    **régression Éveil ≠ Vibration** — un critique arcanique ne doit toujours
    pas déclencher d'Éveil.
13. **Le lot 21** (`fh-tilt`, plus la section « lot 21 » de `fh-destiny`) : les
    **cinq lignes** de la table du Tilt, chacune sous son nom, jusqu'au total
    du jet ; **son pendant** — la couche débrayée, un personnage SRD pur
    traverse un jet entier, `configure({tilts})` **jette** en nommant ce que le
    type accepte, et aucune ligne de `src/play/` ne cite le mot ; la Vibration
    lue sur un **document v2 réel** et muette sur le chemin v1 ; la **régression
    Épuisement** — il garde son chiffre et ne devient pas un Tilt.

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

8. **Une valeur de points POSÉE À LA MAIN est-elle plafonnée ?** (lot 16)
   `setDestinyField` la traite comme `declared` — non bornée — parce que la
   borner empêcherait de rattraper un état de séance, et parce qu'aucune règle
   d'Eric ne couvre ce cas. C'est le seul endroit du plafond qui n'a pas de
   phrase derrière lui.

9. ~~**Où vit l'Arcane du personnage ?**~~ (lot 16) — ✅ **RÉPONDU LE
   2026-08-08 par révision d'architecte.** La question était : la Vibration se
   déclenche si `character.destinyBuild.arcana` existe — un chemin v1 — alors
   que le schéma nommait **GAP-KIND** et que l'Arcane n'avait aucune place
   ratifiée dans `fh-char/1`.

   **La réponse n'a demandé AUCUN champ neuf**, et c'est le point qui valait
   d'être mesuré plutôt que supposé : `$defs/kind` gouverne déjà
   `build.choices[].ref.kind`. Ouvrir le genre `arcana` a donc suffi à donner
   sa place à la carte, dans la forme exacte qu'emploient déjà l'espèce, la
   classe et l'historique :

   ```json
   { "path": "fh.destiny.arcana", "ref": { "kind": "arcana", "id": "…" }, "label": "The Hermit" }
   ```

   Le préfixe `fh.destiny.` n'est pas décoratif : c'est le namespace du module
   de Destinée (lot 19), et un choix posé hors de ce préfixe ressortirait
   `unconsumed`. **Reste au moteur** à cesser de lire `character.destinyBuild.arcana`
   — c'est du code, pas du contrat, et donc le travail d'un lot.

10. **Un critique arcanique OBTENU PAR REFUS déclenche-t-il une Vibration ?**
    (lot 16) Refuser un 1 sur un dé de Destinée (§3.4) fait lire le 1 comme la
    face la plus haute : c'est un **Arcane Critical Success**, mais ce n'est
    pas un maximum **lancé**. Le moteur ne signale **aucune** Vibration dans ce
    cas — le choix conservateur, faute de phrase. **À trancher par Eric.**

11. **Que valent DEUX Tilts sur le DC ?** (lot 21) Par symétrie avec la table,
    ce serait un Désavantage pour celui qui jette — **mais Eric ne l'a pas
    dit**, donc ce n'est pas gravé et le moteur ne le modélise pas. Il ne
    connaît que le côté du LANCEUR : un Tilt sur l'AC ou sur le DC est un
    nombre que la table lui donne. **À trancher par Eric.**

12. **Comment un Tilt compose-t-il avec un avantage accordé par une source
    SRD ?** (lot 21) Deux systèmes d'annulation coexistent — celui de la table
    du Tilt et celui de la 5e — et rien ne dit lequel l'emporte quand ils
    penchent en sens contraires. Le moteur **jette** en nommant les deux plutôt
    que de choisir (loi §0.10). **À trancher par Eric.**

13. **`state.character` est-il le document ou `resolved` ?** (lot 21) La
    tranche d'état disait « référence `resolved` », `arcanaKnown()` a besoin de
    `build.choices` (donc du document), et `saveInfo` lit des champs **plats de
    la v1** qui n'existent dans ni l'un ni l'autre. Aucun appelant de
    production n'existe encore pour arbitrer. Le lot 21 a tranché **pour la
    Vibration** — le document — et l'a écrit au contrat ; `saveInfo` reste sur
    ses noms v1. **À ratifier par l'architecte**, avec le portage de `saveInfo`.

14. **Le moment `mount` n'est invoqué nulle part.** (lot 21) Il est déclaré
    dans `MOMENTS` (`src/play/sequence.mjs`) et `sequence.run("mount", …)`
    n'apparaît dans aucun fichier — mesuré. `runConfiguredRoll` pose bien
    `phase: "mount"`, mais ne répartit rien. S'y inscrire serait du code mort à
    l'inscription (loi §0.6) : le Tilt s'inscrit donc sur `pre-roll`. **Le
    moment est à brancher ou à retirer.**
