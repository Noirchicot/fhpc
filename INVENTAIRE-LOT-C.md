# Lot C — inventaire de portage du moteur de jets

**Source (lecture seule)** : `~/tools/fh-phb`, `docs/javascripts/fh-player-sheet.js`
sur `main` (5 645 l.), plus `fh-utils.js` (35 l.) cherry-read sur
`origin/split-pure-modules`.
**Cible** : `src/play/` sur la branche `engine-port` du dépôt `fhpc`.
**Écrit le 2026-08-07.** À lire avant de ratifier — c'est le relevé de ce qui
est entré, de ce qui est resté, et de pourquoi.

| | |
|---|---|
| Modules livrés | 7 fichiers, 2 556 lignes (`src/play/`) |
| Suites portées | 6 fichiers, 1 563 lignes (`tests/play-*`) |
| Tests | **64 verts**, noyau J0 compris |
| `REWRITTEN` du lot C | **16** |
| `REWRITTEN` hérités de la v1, conservés | 22 |

---

## 1. Ce qui est ENTRÉ

### `src/play/utils.mjs` (57 l.)
`clamp`, `mod`, `signed` — de `fh-utils.js`. `rollDie` devient
`makeRollDie(randomUint32)` : l'échantillonnage par rejet de la v1 est
conservé mot pour mot (sans lui, `0x100000000 % sides` biaise les faces
basses), mais la source de hasard est un paramètre. `platformRandomUint32` /
`platformUuid` sont les défauts, et **le seul endroit du bloc qui lit
`globalThis.crypto`**.

### `src/play/dice.mjs` (246 l.)
`DIE_SEQUENCE`, `ROLL_DIE_SIZES`, `MAX_BONUS_DICE`, `MAX_FREE_DICE`,
`MAX_HISTORY`, `dieColour`, `rollMode`, `forcedDieResult`, `chooseDiePlan`,
`entryBonusDice`, `bonusSourceFor`, `trayDiceForPlan`, `pendingTrayDice`, et le
kit à hasard : `makeDiePlan`, `newFreeDie`, `normalizeFreeDie`, `newBonusDie`,
`normalizeBonusDie`, `mirrorNamedBonusDice`, `trayDiceFromEntry`.

### `src/play/lexicon.mjs` (244 l.)
`ROLL_SOURCES`, `UNKNOWN_SOURCE`, `SEALABLE_SOURCES`, `rollSource`,
`sealLabel`, `LEX`, `rollHasDc`, `ROLL_VERDICTS`, `rollVerdict`, `outcomeFor`,
`SPOILER_BADGE_KINDS`, `ROLL_BADGE_RULES` (13), `rollBadges`, `entryTotal`,
`rollParts`, `rollRuling`, `rollVocabulary`.
**La ligne affichage/machine est gardée** : les `verdict` sont renommables, les
`outcome` sont gelés au bit près et la suite le vérifie.

### `src/play/chaos.mjs` (46 l.)
`chaosTableFor`, `chaosRowText`, `chaosVerdict`, sur une table **injectée**.

### `src/play/export.mjs` (87 l.)
`rollExportDice`, `rollExport` (`fh-roll/1`), `intentOutcome`, `intentFor`, et
`feedSignature` renommé `rollSignature` (il ne parle plus d'un fil).

### `src/play/session.mjs` (1 850 l.) — le bloc
Toute la machine à états, sous les noms v1 pour que le diff reste auditable :

- **Destinée** : `makeDestinySlots`, `normalizeDestiny`, `recoverLowestDie`,
  `adjustDestinyDie`, `setDestinyPoints`, `updateDestinyField`,
  `spendDestinyDie`, `arcaneDecision`, `destinyPlanFor`, `destinyEventSpecs`,
  `resolveArcaneOne`, `naturalDestiny`, `settleAwakening` (⚠ §4).
- **Vitaux** : `normalizeVitals`, `exhaustionLevel`, `exhaustionPenalty`,
  `exhaustionNote`, `exhaustionText`, `setExhaustion`, `setVitals`, `saveInfo`.
- **Événements** : `recordEvent`, `pushEvent`, `dropEventsTagged`,
  `announceEvents`, `openDecision`, `closeDecision`, `runQueueDone`.
- **Transaction** : `BLOCKING_PHASES`, `rollTransactionActive`, `stagedList`,
  `rollOpen`, `openEntry`, `stagedBonusCount`, `entryById`, `releaseRoll`.
- **Le jet** : `rollInput`, `ensureConfigBonusDice`, `syncPresetFlags`,
  `snapshotRollConfig`, `configFromEntry`, `runConfiguredRoll`,
  `rollSequenceDestiny`, `rollSequenceRemaining`, `showDieChoice`,
  `continueRemainingChoices`, `resolveDieChoice`, `finishRolledEntry`,
  `quickRoll`, `openRollState`, `repeatOpenRoll`, `rollStagedDice`,
  `stageBonusDie`, `unstageDie`, `stageDestinyDie`, `announceStagedDestiny`,
  `stageDestinyFromPool`, `standaloneDestiny`, `resolveNatOne`.
- **Ajustement d'historique** : `applyHistoryAdjustment`,
  `applyHistoryAdjustmentRemaining`, `completeHistoryAdjustment`,
  `continueAdjustmentChoices`, `recomputeEntry`, `addHistory`.
- **Plateau** : `setTrayFromEntry`, `prepareTrayForConfig`, `refreshOpenTray`,
  `refreshEntryTray`, `refreshTrayForState`, `clearDiceTray`, `addTrayDie`,
  `removeTrayDie`, `removeTrayDieSize`, `dropTrayDie`, `rollTrayDice`,
  `openStatusText`, `rollVerdictText`, `rollDetailText`.
- **Destin différé** : `pendingFate`, `addPendingFate`, `dropPendingFate`,
  `savePendingLabel`, `pendingLabel`, `pendingResolvable`, `pendingTitle`,
  `armPendingFate`, `rollPendingFate`.
- **Réserve comptée** : `poolList`, `poolResourceById`,
  `visiblePoolResources`, `normalizePoolResource(s)`, `poolSourceIconFor`,
  `poolTitle`, `recreditPoolResource`, `recreditPoolDie`,
  `recreditPendingPoolDice`, `poolResourceReferenced`, `prunePoolResources`,
  `spendPoolResource`.
- **Menu d'un dé** : `findStagedDie`, `landedDiePart`, `retuneLandedDie`,
  `mutateStagedDie`, `dropStagedDie`, `sealStagedDie`.
- **Neuf, et assumé** : `open`, `snapshot`, `settleEntry`, `notify`,
  `emitPool`.

---

## 2. Ce qui est RESTÉ, et pourquoi

### 2.1 Le rendu — la moitié du fichier v1
`render`, `renderMessage`, `renderStageZone`, `renderJudgmentFrame`,
`judgmentDecisionHtml`, `renderEventContent`, `renderConsole`, `renderDestiny`,
`renderIdentity`, `renderStats`, `renderHpTracker`, `renderSkills`, tout le
groupe `renderEdit*`, `renderPoolStrip`, `renderPoolCard`, `diceTrayInner`,
`trayDiceForDisplay`, `frameMood`, `dieAnimationKey`, `rollSummaryText`,
`outcomeTone`, `attrJson`, `skillRow`, `statGear`.
→ **Le bloc `play` ne produit aucune surface.** Ce qu'elles peignaient est de
l'état, et l'état est ici.

### 2.2 Les visuels de dés — bibliothèque pure partagée (ARCHITECTURE §1)
`DIE_GEO`, `DIE_MATERIAL`, `DIE_COLOURS`, `TOKEN_TONES`, `dieMaterialName`,
`dieSvg`, `pickerFace`, `tokenSvg`, `dieSize`, `visualDie`, `HAND_LABELS`,
`ABILITY_SHORT`, `shortDieLabel`, `handLabel`, `SOURCE_GLYPHS`,
`sourceGlyphSvg`, `bonusSourceMark`, `sourceToneClass`.
→ C'est `fh-dice-visual.js`, déjà isolé et prouvé pur sur
`split-pure-modules`. Il rendra des SVG pour l'UI ; `play` n'en a pas besoin.
**Seule la LISTE des noms de matières est entrée** (`DIE_MATERIAL_NAMES`, dans
`dice.mjs`) : c'est elle que `dieColour` valide. Les palettes restent là-bas.

### 2.3 L'overlay, l'animation, les minuteurs
`invokeBuilder`, `retireBuilder`, `overlayHeld`, `overlayAssembling`,
`overlayVisible`, `scheduleOverlayRetreat`, `VERDICT_MS`, `startCalling`,
`stopCalling`, `callingNow`, `CALL_MS`, `armTrayReveal`, `trayRevealPending`,
`stopTrayReveal`, `prefersReducedMotion`, `rollAnimationMs`,
`ROLL_STAGGER_MS`.
→ Du temps d'écran. Aucun ne décide d'un résultat : la v1 résolvait déjà le jet
**avant** l'animation, et le portage le montre — les suites v1 les traversaient
sans jamais en dépendre.

### 2.4 La persistance et le réseau
`storageKey`, `loadPlayState`, `persistPlayState`, `saveProfile`,
`profileWrite`, `revisionOf`, `showProfileConflict`, `api`, `apiAt`, `post`,
`postAt`, `loadParty`, `loadBuild`, `loadInventory`.
→ `play` ne persiste rien : l'état de séance ne voyage pas (règle de
persistance n°4), et ce qui appartient au document sort par `snapshot`.

### 2.5 Le fil de table
`feedActive`, `feedPad`, `setFeedStatus`, `tablePost`, `broadcastEntry`,
`feedMerge`, `streamZoneInner`, `TABLE_RENDEZVOUS_INTERVAL`,
`TABLE_WS_RETRY_MAX`, tout le groupe LIVE/RECENT/OFF.
→ **Bloc `table`.** `broadcastEntry` est remplacé par `settleEntry`, aux mêmes
points d'appel, avec la même déduplication par signature et les mêmes
révisions — mais il ÉMET au lieu de POSTER.

### 2.6 La fiche et l'import
`effectiveCharacter`, `skillInfo`, `emptyProfile`, `canonicalDdbUrl`,
`crNumber`, `snapshotAbility`, et tout le groupe d'import DDB
(`applyImportedRecord`, `applyDdbModifiers`, `canonicalToolName`,
`knownSkillName`, `importedTier`, `reportImport`…), plus `beginSheetEdit`,
`captureEditDraft`, `saveSheetEdit`, `addEditTool`, `removeEditTool`…
→ **Blocs `build` et `connect-ddb`.** `saveInfo` fait exception et EST entré :
la sauvegarde d'Overreach en a besoin, et elle appartient au moteur.

### 2.7 Les Arcanes Majeurs
`arcanaDeck`, `currentArcana`, `arcanaDrawn`, `arcanaArtUrl`, `drawArcana`,
`flipArcana`, `keepArcana`.
→ Le paquet des 22 est du **contenu** (`window.FH_ARCANA`, généré depuis le
vault) et la carte gardée appartient au **document**. Seule la moitié moteur de
`keepArcana` est entrée, sous le nom `settleAwakening` (⚠ §4).

### 2.8 Les entrées DOM de la console
`syncConsoleInputs`, `removeGenericBonusDie`, `openConfig`, `onPoolCardInput`,
`syncPoolCardInputs`, `newPoolDraft`, `savePoolCard`, `deletePoolResource`,
`openPoolEdit`, `trayBonusCount`, `trayDieCounts`, `onClick`, `bindEvents`.
→ Lisaient des champs. Ce que la console écrit passe maintenant par les verbes
`prepare` et `configure`. `savePendingLabel` **est** entré, mais reçoit son
libellé en payload au lieu de le lire dans `#fhPsBadgeLabel`.

### 2.9 Le zoom, les modes de dock, la route
`renderModeControl`, `renderZoomControl`, `autoFitZoom`, `nearestZoomStep`,
`setZoom`, `resetZoom`, `stepZoom`, `routeValue`, `rememberRoute`, `esc`,
`iconSvg`, `glyph`, `nowLabel`.
→ Chrome d'application.

### 2.10 Deux retraits assumés (loi §0.6, pas de code mort)
- `state.traySurfaceDie` : la « marque d'extinction M3c » n'était lue que par
  le plateau. Elle est retirée du bloc ; le comportement reste dans fh-phb.
- `numberOr` et `pbFor` de `fh-utils.js` : le moteur de jets ne s'en sert pas.
  Ils suivront le bloc `build`.

---

## 3. Les assertions `REWRITTEN` du lot C (16)

Les 22 marques héritées de la v1 sont **conservées telles quelles** : elles
racontent pourquoi une vérité a bougé entre dock v5, v6 et le lot R34-R39, et
les supprimer effacerait cette mémoire. Les 16 ci-dessous sont les miennes.
Chacune porte sa raison sur sa propre ligne dans le fichier.

| Suite | N | Motif |
|---|---|---|
| `play-roller-state-machine` | 9 | Assertions de SURFACE, sans équivalent dans le bloc : le bouton ROLL et la disparition d'APPLY (`renderConsole`), l'absence de bouton/ligne/zone d'événements dans le roller et la place des badges (`renderStageZone`, `diceTrayInner`), le badge rouge de dette et l'Arcane gardé sur la ligne de Destinée, les deux réponses dans la fenêtre de jugement (`renderJudgmentFrame`), la rangée de robes fusionnée et la pastille allumée (`renderEventContent`), le clignotement du dé posé (`trayDiceForDisplay`), la clef `data-die-landed` et le signe « − » du jeton d'Épuisement (`visualDie`), le menu d'un dé tombé. **Dans quatre cas l'état sous-jacent est réasserté à la place** (le sceau et la couleur d'un dé stagé, l'interdiction de retirer un dé tombé, le prompt `arcane1`, la clef `landedKey`). |
| `play-roll-vocabulary` | 4 | Le dessin des glyphes (poids de trait, lemniscate en un sous-chemin) ; les variables et règles de `companion-dock.css` ; l'invite de prise en main grepée dans le HTML ; le style « oxblood » gagné par égalité avec le verdict. Plus **un déplacement de garde** : le grep « exactement un `badges.push` » vise désormais `lexicon.mjs`, le fichier qui porte la règle. |
| `play-dice-pool` | 2 | La persistance de la réserve (`persistPlayState`/`loadPlayState`/`storageKey`) → remplacée par une assertion sur `snapshot` ; `state.builderOpen` et `renderPoolStrip() === ""` → remplacés par la ressource à zéro et la pastille invisible. |
| `play-roll-engine-adversarial` | 1 | Le règlement d'un Éveil passait par `keepArcana` (paquet + profil) → passe par `settleAwakening`. La garantie testée — un compte, pas un drapeau, plancher à zéro — est inchangée et même renforcée d'un cas. |

### Assertions v1 qui n'ont pas d'héritier ici, et où elles vont
- **`testBroadcastRetriesAfterFailedSend`** (adversariale) : un envoi raté
  reste rejouable et n'a pas consommé de numéro de révision. Entièrement bâti
  sur `fetch` et le statut du fil. **À re-tenir dans le bloc `table`** — c'est
  écrit dans l'en-tête de la suite portée. La moitié qui survit ici (deux
  règlements synchrones d'une entrée inchangée = une émission) est portée.
- **Le contenu des tables de Chaos** : la v1 assertait que la ligne 12 de STR
  contient « fatal », en chargeant la vraie table générée. C'est l'IP Fate's
  Hand d'Eric, qui n'entre pas dans ce dépôt public à ce stade (§0.8, §3). Les
  suites tournent sur une **table-fixture neutre** ; ce qui est vérifié est la
  mécanique de lecture — bornes, plafond, capacité inconnue, dégradation
  annoncée. Le contenu reste vérifié dans fh-phb.
- **Les 13 autres suites de fh-phb** (`dice-tray`, `tray-expanded`,
  `player-sheet*`, `actions-panel`, `panel-spells`, `traits-panel`,
  `static-dice*`, `soulforge*`, `gm-control`, `build-revision-chain`,
  `profile-conflict`) n'encodent pas le moteur : elles jugent des panneaux, le
  rendu des dés, la fiche, l'inventaire ou le Worker. Aucune n'était à porter.

---

## 4. ⚠ Ce qui attend l'architecte

1. **Qui possède `destiny` et `vitals`** — le compromis pris, et pourquoi il
   n'improvise aucune règle : voir `contracts/play.md`, points ouverts §1.
2. **`settleAwakening`**, verbe hors table du kickoff : §2 du même endroit.
3. **`configure`**, patch partiel faute de spec : §3.

Aucun de ces trois n'a été tranché par le lot. Loi §0.10.

---

## 5. Vérifier ce lot

```bash
cd ~/tools/fhpc-worktrees/engine && node --test
```
