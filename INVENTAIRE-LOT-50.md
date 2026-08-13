# Lot 50 — l'inventaire

**Branche** : `50-repartition-caracs`, coupée de `main` à `dd2b66e` (remesuré : `git -C ~/tools/fhpc rev-parse --short main` → `dd2b66e`, identique au SHA annoncé par la commande).

**Tests** : **767 verts au départ** (`npm ci` puis `npm test`, mesuré avant toute ligne de code — conforme au nombre annoncé par la commande). **774 verts à l'arrivée** (`npm test`, suite complète) — **+7 nets** : `tests/abilities-step.test.mjs` gagne 19 tests, en perd 2 (les deux qui testaient l'ANCIENNE signature de `optionsForRow`, par valeur — retirés, pas affaiblis, voir §3 plus bas), et un troisième existant est réécrit (le plafond de 18) sans changer le compte.

**Périmètre tenu** : `ui/builder/abilities-step.mjs`, `ui/builder/shell.mjs`, `ui/builder/shell.css`, `tests/abilities-step.test.mjs`. Zéro ligne touchée dans `src/`, `schemas/`, `contracts/doc.md` (mesuré : `git diff --stat` liste exactement ces quatre fichiers). Aucun `git push`, aucune fusion.

---

## 1. Le défaut, et pourquoi il résistait à 767 tests verts

Mesuré sur la page déployée (§0 de la commande) : trois rangées sur six (CON, WIS, CHA dans l'exemple) restaient bloquées sur les valeurs du personnage préexistant, sans jamais recevoir de dé. La cause, lue dans `optionsForRow` :

```js
const index = pool.indexOf(value);
if (index >= 0) pool.splice(index, 1);
```

Cette ligne retirait du lot **par la valeur**. Une valeur qui ressemble à un dé (le `14` que DEX portait déjà, sans qu'aucun dé n'ait jamais été tiré) volait sa place à un vrai dé ; une valeur qui ne ressemble à rien (`13`, `12`, `10`) ne consommait jamais rien et revenait éternellement (`renderAssignRow`, `options.unshift(current)`).

**Pourquoi 767 tests ne l'ont pas vu** : la suite d'origine (lot 45) testait `optionsForRow` avec des scores DÉJÀ choisis pour ne collisionner avec aucune valeur préexistante du personnage d'exemple (« Totaux choisis pour NE COLLISIONNER avec AUCUN des six scores déjà posés », lisait le commentaire du test retiré). Le test évitait précisément la situation qui casse — un personnage qui porte déjà six scores avant le premier tirage, ce qui est le cas de **tout** personnage réel dans ce builder (il vient toujours d'un import ou d'un défaut). C'est la prémisse citée par la commande : « un nombre suffit à identifier un dé » — vraie tant qu'aucun nombre ne se recoupe, fausse sur toute fiche réelle.

## 2. La forme reprise, et ce qui a été laissé

`~/tools/fh-skills/fh-skill-builder.html:731` : `assign: {STR:null, DEX:null, …}` — une caractéristique pointe vers l'**index** d'un dé dans le lot gardé, jamais vers sa valeur.

**Repris à l'octet** : le principe (index, pas valeur) et l'état `null` = « rien reçu ».

**Laissé** :
- Le builder v1 range `assign` avec `set`/`kept` dans le MÊME objet mutable global (`AB_STATE`) et le fait vivre dans le `localStorage` autosauvé du personnage entier. Ici, `assign` vit dans `state.abilityRoll` (shell.mjs), qui **ne survit jamais** au-delà de l'onglet — décision d'Eric, 2026-08-13, §2a : « le lot de dix dés ne survit pas ». Le document ne gagne donc aucun champ, contrairement au builder v1 qui n'a pas cette contrainte.
- Le v1 range les options DANS un `<select>` HTML natif (`disabled` sur les index pris). Ce lot garde `renderPicker`/`carnet.mjs` (le composant partagé du chantier v2, boutons `.record-option`), pas de `<select>`.
- Le v1 n'a ni la colonne « Final » (score + boosts), ni l'alerte de plafond, ni la note « pas du tirage » (§2c) — ces trois-là sont propres à ce chantier, pas repris de nulle part.

## 3. Comment une rangée non distribuée se dit à l'écran (§2c)

Deux signaux, jamais un seul :
- `row.dataset.assigned` (`"true"`/`"false"`) — machine-lisible, testé directement (test 4).
- `.ability-row-source`, un texte : `"from this roll"` si `assign[key]` est un index, ou `"<valeur> — not from this roll"` sinon (`"not assigned yet"` si le document lui-même n'a encore rien). La valeur COURANTE du document reste donc toujours visible — rien ne se cache — mais jamais confondue avec un dé.

Le picker, lui, offre alors **tous** les dés encore libres — c'est exactement ce qui manquait à CON/WIS/CHA au §0. Un dé déjà servi ailleurs disparaît des OPTIONS de tout le monde sauf de qui le porte (`optionsForRow`) ; le sien reste dans ses propres options pour que `renderPicker` puisse le montrer actif (cliquer dessus ne fait rien de plus, `renderPicker` n'appelle `onSelect` que sur une option inactive).

## 4. Ce qui a surpris

- **Le test qui aurait dû accrocher le défaut ne le pouvait pas par construction** (§1 ci-dessus) — pas une négligence du lot 45, une prémisse qui ne tenait que dans le cas que le test choisissait de tester. Leçon : un test « ne collisionne avec rien » est parfois un test qui évite la vraie question.
- **`aria-label` sur les boutons du picker montre maintenant un INDEX (0-9), pas la valeur du dé.** `carnet.mjs::renderPicker` pose `btn.setAttribute("aria-label", String(value))` — et `value`, en mode Roll, est désormais l'index du dé (nécessaire pour l'identité), pas son total. Un lecteur d'écran annoncera donc « 3 » pour un dé qui vaut 14. **Mesuré, pas corrigé** : `carnet.mjs` n'est pas dans le périmètre de ce lot (le lot 47 y travaille, et le fichier est partagé par Class/Species/Compétences — le modifier ici serait un contournement silencieux d'un périmètre fermé, pas une correction). Signalé à l'architecte plutôt que réparé en douce — dans l'esprit du lot 43.
- **Servir l'écran a débusqué un bug d'automation, pas un bug du builder** : mes premiers clics de vérification manuelle atterrissaient sur la mauvaise ligne parce que mes coordonnées venaient d'une capture d'écran mise à l'échelle (800×450 affiché pour un viewport réel de 1280×720). Basculer sur des clics par référence DOM (`read_page`/`ref_N`) a réglé ça — le fix lui-même n'y était pour rien, mais ça explique une bonne partie du temps passé sur cette étape.
- Le `.claude/launch.json` du worktree portait un `name`/port déjà pris par une autre session (« fhpc-builder » sur le port 8137, une autre discussion). Contourné en démarrant `python3 -m http.server` à la main sur un port libre (8971) et en pointant le navigateur dessus par URL — le fichier a été remis exactement dans son état d'origine avant de committer (aucun diff dessus).

## 5. Ce qui a été vu à l'écran (§4 de la commande)

**Avant tout tirage** (état par défaut, personnage d'exemple) : les six rangées montrent chacune leur valeur (`8`, `14`, `13`, `15`, `12`, `10`) avec la note « not from this roll », et un picker **vide** (« No dice rolled yet. » au-dessus). CON et INT, boostées par l'Inheritance, montrent déjà leur colonne Final en couleur (`14 (+2)`, `17 (+3)`).

**Après un clic sur `Roll`** : dix dés apparaissent, six gardés (bordurés), le lot gardé était `14 · 12 · 18 · 12 · 12 · 15`. **Les six rangées montrent, chacune, les SIX options** — c'est le point exact où le défaut du §0 empêchait CON/WIS/CHA d'avoir accès à quoi que ce soit d'autre que des `11`.

**En assignant les six une à une** (STR→12, DEX→18, CON→12, INT→12, WIS→14, CHA→15) : chaque assignation retire exactement UN dé du pool des cinq autres rangées — jamais plus, jamais par valeur (deux `12` distincts sont restés deux options séparées jusqu'au bout). **Les six rangées ont fini distribuées.** C'était impossible à obtenir avant ce lot (au mieux trois, jamais six).

**Réassignation observée en cours de route** : en cliquant une seconde fois sur une autre option d'une rangée déjà servie (WIS, 15→12→14), le dé précédemment tenu (15, puis 12) est réapparu immédiatement dans les options des autres rangées — la libération fonctionne au clic réel, pas seulement dans les tests.

**Reroll** : un clic sur `Reroll` a tiré un nouveau lot (`13 · 14 · 10 · 15 · 12 · 13`) et remis **instantanément** les six rangées à « not from this roll », chacune retrouvant les six nouvelles options — §2b tenu à l'écran, pas seulement dans `emptyAbilityAssign()`.

## 6. Ce qui a été changé de cette commande

- **Les deux tests de `optionsForRow` par VALEUR ont été retirés, pas affaiblis.** La commande dit « étends-le » ; la signature de la fonction qu'ils testaient a changé de nature (par construction, elle ne peut plus prendre une liste de valeurs et une carte de valeurs — elle prend le lot et une carte d'index). Les garder aurait exigé soit de mentir sur ce qu'ils prouvent, soit de maintenir en vie une fonction fantôme. Remplacés par un test direct de la nouvelle signature et par les tests dédiés du §3 de la commande.
- **Le test existant « un score final > 18 affiche une alerte... rien ne bloque » a été enrichi d'un `rollBatch` réel.** Sans lot fourni (`rollBatch: null`, son état d'origine), la rangée INT n'a plus aucune option depuis ce lot — la seconde moitié du test (« cliquer une autre option ne bloque pas ») ne pouvait plus s'exercer (`if (otherBtn)` restait silencieusement vide). Lui donner un lot réel restaure une assertion qui prouve vraiment quelque chose, sans changer ce qu'elle prouve.
- **Le test « CON et INT... le picker montre encore le CHOIX BRUT, actif » a changé d'assertion, pas d'intention.** Sans lot tiré, le picker (mode Roll) n'a plus d'options du tout — il ne peut donc plus montrer « 13 actif » comme avant (ce n'était vrai qu'à l'époque où le picker listait des valeurs libres, pas des dés). L'invariant qu'il protège (« le brut reste visible, jamais absent ») est maintenant tenu par `.ability-row-source`, pas par le picker — l'assertion a suivi.
- **`assignedByKey` a été supprimé du fichier**, pas seulement de la ligne qui l'utilisait : depuis que `optionsForRow` ne regarde plus les valeurs du document, c'était une variable calculée puis jamais lue. Retirée plutôt que laissée morte.
- **Non demandé par la commande, ajouté quand même** : `data-assigned` sur les jetons de dés (`.ability-die`), en plus de `data-kept` — pur affichage (§4, « regarde-le »), aucune règle n'en dépend. Signalé ici pour que ce ne soit pas une surprise en revue.

## 7. Les quatre décisions d'architecte (§2) — tenues, aucune remise en cause

- **§2a** (la carte hors document, avec le lot) : tenue à l'octet — `state.abilityRoll.assign`, jamais dans `document`. Mesuré par le test 7 (« le document ne porte que six `abilities.<key>` »).
- **§2b** (un nouveau lot remet la carte à `null`) : tenue — `emptyAbilityAssign()` posée à chaque `roll`/`reroll` dans `shell.mjs`, vue à l'écran (§5 ci-dessus).
- **§2c** (rangée non distribuée : valeur courante montrée, dite hors lot, tous les dés libres offerts) : tenue — §3 ci-dessus.
- **§2d** (plafond de 18 seulement au niveau 1) : tenue — `renderCapWarning` lit `resolved.identity.level`, testé aux deux niveaux (1 et 5, même score, même carac).

Aucune des quatre n'a cédé à la mesure — rien à remonter à l'architecte de ce côté-là. Le seul point remonté est celui du §4 ci-dessus (aria-label), hors périmètre plutôt que contredit.
