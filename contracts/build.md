# Contrat de bloc — build

> Rempli par le lot **`9-bloc-build`** le 2026-08-08.
> **À ratifier par l'architecte avant merge.** Les points soumis à décision
> sont marqués ⚠ et repris dans `QUESTIONS-ARCHITECTE.md`.
>
> Il hérite des sept arbitrages de `contracts/layers.md` (section du
> 2026-08-08) et ne les rouvre pas, et de l'arbitrage du même jour sur
> `ability_key` (canonique dans les deux langues).

## Nom

`build`

## Rôle (2 lignes)

Dérive la tranche `resolved` du personnage ouvert depuis la pile de couches
et les choix/overrides de sa tranche `build`. Seul chemin d'écriture de
`resolved`.

## Construction

```js
createBuild({ bus, dispatch, now })   // une instance
registerBuild({ now })                // l'instance du noyau, sur le bus et le dispatch J0
```

- `bus` : **obligatoire**, et il lui faut `emit` **et** `on`. Le bloc annonce
  (`char-rebuilt`) et il **écoute** (`layers-changed`) : le `shadowed` d'une
  pile ne lui appartient pas, il lui est rapporté.
- `dispatch` : **obligatoire**. C'est par lui, et uniquement par lui, que le
  bloc atteint `layers.query` et `layers.stack`. `src/build/` n'importe jamais
  `src/layers/` — garde structurel, attaqué.
- `now` : l'horloge, injectable. `resolved.derivation.at` en dépend, et une
  suite qui ne peut pas la figer ne peut pas comparer deux documents.
  Défaut de plate-forme dans `src/build/clock.mjs`, seul fichier du répertoire
  autorisé à nommer `Date` (même partage que `src/play/utils.mjs`).

**Le bloc ne lit pas le disque.** Au M2 le bloc `doc` n'existe pas : il reçoit
et rend des documents **en mémoire**. Lire un fichier appartient à qui possède
le stockage. Il n'y a **pas de verbe `open`** : le kickoff n'en donne pas, et
en fabriquer un préempterait la tranche de `doc` (loi §0.6). Un verbe qui
reçoit `{document}` l'adopte ; les suivants s'en passent.

## Verbes

Seul point d'entrée du bloc. Route `build.<verbe>` via `dispatch` du noyau.
Un verbe inconnu jette en le nommant (loi §0.5, tenu par le registre J0).

| Verbe | Payload | Effet | Erreurs |
|---|---|---|---|
| `choose` | `{document?, path, ref:{kind,id}, label?}` | Pose un **record** sur un point de décision. Remplace la décision précédente sur le même chemin. Rend `{document, choice:{path, replaced, kind}}`. | `value` en plus de `ref`, `ref` malformé, chemin de choix hors grammaire, segment interdit → **jette** |
| `set` | `{document?, path, value, label?}` | Pose un **scalaire**. Même remplacement. Rend `{document, choice}`. | `ref` en plus de `value`, `value` absente, `value` non scalaire, chemin hors grammaire → **jette** |
| `override` | `{document?, path, value, by, note?}` | Pose la parole du MJ dans `build.overrides`. Rend `{document, override}`. | `by` hors `player`/`gm`, `value` absente, chemin d'override hors grammaire (**index interdit**) → **jette** |
| `clear` | `{document?, path, kind}` | Retire une entrée de `build.choices` (`kind: "choice"`) ou de `build.overrides` (`kind: "override"`), jamais des deux à l'aveugle. Rend `{document, cleared:{path, kind, removed}}`. Un chemin absent n'est **pas** une faute : `removed` vaut `false`, le verbe ne jette pas. | `kind` hors `choice`/`override`, chemin hors grammaire de la collection visée → **jette** |
| `rebuild` | `{document?}` | **Le seul chemin d'écriture de `resolved`.** Plie la pile et les choix, applique les overrides **en dernier**, écrit `resolved` et `modified`. Émet `char-rebuilt`. Rend `{document, resolved, underived, unconsumed, overridesApplied, shadowed, warnings, diff}`. | niveau ou classe absents, score de caractéristique absent, clef de caractéristique hors catalogue, ref mort, pile ≠ `build.layers`, override dans le vide, invariant violé → **jette** |
| `validate` | `{document?}` | Dit ce qui cloche **sans rien écrire**. Rend `{ok, violations, warnings}`. | — (un refus est un résultat ; même une erreur de dérivation devient une violation) |

> ⚠ **Pourquoi DEUX verbes pour un seul geste.** `$defs/build.choices` exige
> « `ref` OU `value`, jamais les deux, jamais aucun ». `choose` et `set` sont
> les deux moitiés de cette règle : un verbe unique à deux formes ne l'aurait
> rendue vérifiable qu'à l'exécution. **À ratifier** (question 4).

> ⚠ Le kickoff écrit `choose, set, override, rebuild, validate` — les cinq y
> sont, sous ces noms. **Mis à jour par le lot `26-verbe-clear`** : un
> sixième s'y est ajouté depuis, `clear` — sans lui une décision posée ou un
> override levé par erreur ne pouvait plus être ENLEVÉ, seulement remplacé.

## Événements

| Type | Payload | Quand |
|---|---|---|
| `char-rebuilt` | `{id, at, diff, underived, unconsumed, shadowed, stack}` | À chaque `rebuild` réussi. |

`diff` est une **liste de chemins d'override** (`resolved.skills[nature].bonus`),
jamais d'index : un abonné doit pouvoir recopier la ligne telle quelle pour
figer la valeur par un override, et un index se décale à la reconstruction
suivante. L'appariement se fait par identité quand l'élément en a une.

## Tranche d'état

`build` seul l'écrit — **et personne ne la lit.**

| Champ | Forme | Note |
|---|---|---|
| le personnage ouvert | le document `fh-char/1`, cloné | tout ce qui entre et tout ce qui sort est cloné : l'appelant ne tient jamais l'objet du bloc |
| le dernier `shadowed` | `[{kind, id, by, over}]` ou `null` | reçu par abonnement à `layers-changed`, jamais lu dans la pile |

⚠️ **L'instance ne rend que `{name, verbs}`.** Pas de `state`, pas de poignée.
Même forme que le bloc `layers`, et pour la même raison : c'est la seule où
« personne ne lit l'état d'un autre bloc » se **vérifie** au lieu de se
promettre.

## Invariants

1. **`resolved` n'est écrit QUE par la dérivation** — un pli SRD → FH →
   homebrew → overrides. Aucun autre verbe ne le touche.
2. **Les overrides sont appliqués EN DERNIER**, dans l'ordre de
   `build.overrides`, et survivent à toute reconstruction. « La parole du MJ
   bat le JSON. »
3. **`resolved.derivation.stack` EST `build.layers`.** Vrai par construction,
   et vérifié quand même à chaque `rebuild` par `charInvariantViolations` :
   un invariant qu'on croit tenu est un invariant qu'on ne teste plus.
4. **Une reconstruction ne modifie JAMAIS `build`** — sauf un cas, unique et
   nommé : un document dont `build.layers` est **vide** n'a jamais été
   construit, et il adopte la pile montée. Dès qu'une pile est déclarée, elle
   fait foi et un écart **jette** (« la couche a changé sous le personnage »).
5. **Ce que la pile ne sait pas nourrir n'est pas deviné**, et `rebuild` le
   dit. La ligne de partage, posée par ce lot (⚠ question 1) :
   - un **nombre** qu'on ne sait pas calculer est **absent** de `resolved` ;
   - une **collection** qu'on ne sait pas nourrir est **vide**, et sa
     déclaration est **obligatoire** — les vingt clefs de `resolved` sont
     requises par le schéma, et un document invalide est injouable ;
   - une **structure** dont un champ obligatoire manque n'est **pas émise à
     moitié** : l'entrée est sautée et nommée ;
   - le **structurel** (niveau, classe, les six scores) **jette**.
   > Invariant testé : *aucune collection vide n'est rendue sans une entrée
   > `underived` qui la nomme.* Attaqué le 2026-08-08 (retirer une
   > déclaration en gardant la collection vide → rouge).
6. **Une clef de caractéristique hors des six canoniques JETTE**, en nommant
   le record et la clef (arbitrage du 2026-08-08). Un champ **absent** se
   déclare ; un champ **hors catalogue** est du contenu faux.
7. **L'état de jeu traverse le pli.** `vitals.hpCurrent`, `tempHp`,
   `conditions` et le `current` des emplacements sont **repris** de la tranche
   précédente. Une reconstruction ne soigne personne. Sur une **première**
   construction seulement, `hpCurrent` suit `hpMax` — et **après** les
   overrides, sinon un MJ qui accorde un point de vie créerait un personnage
   neuf déjà blessé.
8. **Un override ne crée rien** : ni une clef, ni un élément de collection. Un
   override dans le vide veut dire que la dérivation n'a pas produit ce que le
   MJ croyait tweaker. ⚠ Question 6 : c'est aussi ce qui empêche l'override
   d'être le chemin de secours quand un champ n'est pas dérivable.
9. **`query` est le SEUL chemin de lecture du contenu**, et `stack` le seul
   moyen de savoir sur quoi on plie. Vérifié à l'exécution : un `rebuild`
   n'emprunte que ces deux routes.
10. **Le pli est déterministe.** Deux reconstructions des mêmes choix sur la
    même pile ne diffèrent que par `derivation.at`.
11. **Aucun mot affichable n'est produit par le bloc** (loi §0.13). Tous ceux
    qui atterrissent dans `resolved` sont le `name` d'un record, recopié. En
    particulier, le **lignage n'est pas recollé** au nom de l'espèce : la
    composition appartient à l'interface.

## Dépendances interdites

- **Le disque** (`node:fs`, `node:path`, `readFileSync`, `writeFileSync`,
  `homedir`) — le bloc reçoit et rend des documents en mémoire.
- **DOM, `window`, `localStorage`, `innerHTML`, `querySelector`.** Comme au
  bloc `layers`, le mot `document` n'est **pas** interdit : c'est le mot du
  domaine ici. Le DOM l'est par ses formes atteignables.
- **Réseau** (`fetch`, `XMLHttpRequest`, `WebSocket`) et **minuteurs**.
- **`Math.random`** partout ; **`Date`** partout sauf `clock.mjs`.
- **Un id de couche ou une langue en dur.** La dérivation LIT `units.distance`
  pour choisir entre `speed_m` et `speed_ft` ; elle ne devine aucune langue.
- **Tout import de `src/layers/`, `src/play/`, `src/modules/`, `src/tools/`.**
  `src/schemas/invariants.mjs` est **autorisé** et voulu : ce module dit
  lui-même qu'il existe « pour que le bloc `build` les applique au même
  endroit que les tests ».
- **Le vocabulaire français de jeu** — les six noms de caractéristique et les
  dix-huit noms de compétence, dans le code **comme dans les littéraux**. Une
  table `"Sagesse" → wis` est la faute que ce lot existe pour éviter
  (`DERIVATION-FIELDS.md` §1). Garde dédié, attaqué.

## ⛔ Où vit un POOL DE POINTS — arbitrage du 2026-08-09

**Question posée par le lot 22, qui a refusé de construire sans elle (loi
§0.10). Il a eu raison, et la commande de l'architecte avait tort.**

La commande affirmait qu'il n'y avait « aucun trou de contrat » parce que
`build.budgets` **existe** au schéma. Mesurer l'existence d'un champ n'est pas
mesurer sa **jouabilité** — et les trois faits, revérifiés par l'architecte,
disent l'inverse :

| Fait | Mesure |
|---|---|
| `budgets` est **`required`** | `$defs/build.required` |
| **Personne ne l'écrit ni ne le lit** | `grep -rn "budgets" src/` → **aucune occurrence** |
| **Aucune dérivation ne PEUT l'écrire** | invariant 4 ci-dessous : *une reconstruction ne modifie jamais `build`* |

**L'argument qui tranche est le BARDE** : son pool change à **chaque** niveau
(+1 dès le 2). Un budget figé à la création serait faux dès le niveau 2, à
moins que quelque chose le réécrive — ce que l'invariant 4 interdit
précisément. **Un nombre qui se recalcule à chaque niveau n'est pas une donnée
d'entrée, c'est une dérivation.**

### → La règle, désormais opposable

> **Un pool de points dérivé se publie dans `resolved.stats[]`, par un module à
> drapeau — jamais dans `build.budgets`.**

Chemin déjà ratifié et déjà testé (le Score de Destinée, lot 19) : **zéro
contrat neuf**. Et le `breakdown` porte le **pourquoi** du nombre — pool de
classe, paliers traversés, bumps d'espèce, imposés déduits — ce qu'un entier nu
ne fera jamais.

`build.budgets` garde un sens étroit : un budget **qu'on accorde** (« le MJ
donne 3 points »), ce qui est une vraie donnée d'entrée. ⚠️ Si aucun
consommateur de cette nature n'apparaît, la **loi §0.6** devra se poser sur lui.

⚠️ **Et une seconde erreur du même commentaire d'architecte, trouvée par le
lot** : il donnait `fh.skillPoints` en exemple de clef. `propertyNames` pointe
sur `$defs/flag`, motif `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$` — **pas de
majuscule**. `fh.skillPoints` serait **rejeté** par le validateur du dépôt.
Même piège que le lot 19 avait payé sur `stats[].id`. Toute clef de budget
s'écrit **en minuscules**.

## Les modules de statistique — le protocole d'injection

> ⚠️ **Porté au contrat le 2026-08-09, et c'était une dette de l'architecte.**
> Ce protocole vivait dans l'en-tête de `src/build/derive.mjs` et dans
> `INVENTAIRE-LOT-19.md` §2 — un commentaire et un rapport daté, ni l'un ni
> l'autre ratifiés. Le lot 20 a demandé sa mise au contrat **explicitement**, et
> il avait raison : deux lots ont déjà écrit contre cette forme sans qu'elle
> soit nulle part opposable. ⚠️ Et l'inventaire du lot 19 décrit la forme
> **d'avant** la généralisation du 2026-08-08 : il ne connaît ni `records`, ni
> `refs`, ni `consumed`. **Ne le lis plus comme le contrat** — c'est ici.

Une statistique dérivée est produite par un **module activé par un drapeau**,
jamais par le pli (décision Q4). `src/build/` **n'importe aucun module** — le
garde de frontière nomme `../modules/` dans `FORBIDDEN`. Il est **injecté** :

```js
createBuild({ bus, dispatch, modules: [createFhDestinyStat()] });
```

Le pli lit les drapeaux par `dispatch("layers.flags")` et n'appelle **que** les
modules dont le drapeau est levé. Ce fichier ne nomme aucune mécanique de
couche (loi §0.12) : il ouvre un chemin, il ne s'en sert pas.

### Ce qu'un module déclare

| | |
|---|---|
| `flag` | le drapeau de couche qui l'allume. |
| `contribute(input)` | sa seule porte. Un module qui ne déclare pas **les deux** est un **refus nommé**, jamais un module qu'on saute — *« UN MODULE QUE LA DÉRIVATION NE SAIT PAS APPELER EST UN REFUS »*. |

### Ce qu'il reçoit — `input`

| Entrée | Ce qu'elle porte |
|---|---|
| `proficiency` | `resolved.proficiency`, ou `null` si le pli ne l'a pas dérivée. Un module qui ne l'a pas **déclare** son terme au lieu de poser 0 — *« SANS MAÎTRISE DÉRIVÉE, LE TERME SE DÉCLARE »*. |
| `level` | ⚠️ **AJOUT DU LOT 23, ratification demandée.** Le niveau du personnage, entier 1–20 — toujours présent : le pli **jette** sans lui (« le niveau n'est dérivable de rien »), il n'y a donc pas de cas `null` à traiter. **Ce n'est pas du confort : `proficiency` NE DIT PAS le niveau.** Les niveaux 5 à 8 la donnent tous à 3, et une statistique qui s'accumule *par niveau* — un pool de points, une ressource de progression — vaut des choses différentes aux deux bouts de cette tranche. Sans ce champ, un module n'a qu'une issue : une table de niveaux **écrite en dur**, très exactement ce que `stats[]` existe pour éviter. Mesuré par le lot 23 : son test d'acceptation 2 (le barde créé au niveau 5) est **impossible** sans lui. |
| `species` | `{id, name, slug, data}` du record d'espèce, ou `null`. |
| `choices` | **les choix de son namespace** (chemin `=== flag`, ou préfixé `flag.` / `flag[`), chacun `{path, tail, value, ref, label}`. `tail` est le chemin privé de son préfixe, le point de séparation retiré **seulement s'il y en a un** (`fh.destiny[0]` reste dans le namespace). Ils sont marqués **consommés d'office** : c'est le module qui les juge, et un chemin qu'il ne sait pas lire est un refus qui le nomme (loi §0.5). |
| `records(kind, id?)` | **le même chemin de lecture que le pli**, vue aplatie `{id, name, slug, data}`. ⚠️ **Avec `id`** : le record ou `null`. **Sans `id`** : la liste du genre — et ce n'est pas un confort. C'est ce qui distingue *« le genre répond vide »* (le contenu n'est pas monté → **DÉCLARER**) de *« le genre est peuplé et ce record n'y est pas »* (un `ref` mort → **REFUSER**). Un `null` unique confondrait les deux, et un contenu manquant se lirait comme un document faux. |
| `refs` | tous les records que le personnage désigne par un `ref` **hors** du namespace du module, dans l'ordre du document, chacun avec son `path` et son `kind`, déjà aplati. Le module filtre le genre qui l'intéresse. Ce qu'il voit déjà par `choices` ne lui est **pas** tendu deux fois — le lui donner inviterait à le compter deux fois. |

**Pourquoi `refs` est générique et pas un canal par genre.** Le lot 20 avait dû
ouvrir un canal `feats`, seule forme que sa section autorisait, parce qu'un don
d'origine vit sous `background.originFeat[0]` — hors de tout namespace, donc
invisible à tout module. Le besoin était juste ; la forme ne l'était pas.
`feats` était le **premier d'une série** : le chapitre 4 a le même besoin pour
la **classe** (le pool vient d'elle) et pour l'**arrière-plan** (les choix
imposés viennent de lui). On aurait ouvert `classes`, `backgrounds`… un champ
par genre, à chaque lot. *(Prouvé : « UN MODULE VOIT LA CLASSE ET
L'ARRIÈRE-PLAN, pas seulement les dons ».)*

L'autre issue — faire déclarer le même don **deux fois** au personnage, une fois
comme don et une fois dans le namespace du module — reste exclue : deux places
pour un seul fait, et la dérive garantie.

📌 **Un `ref` mort JETTE**, ici comme partout ailleurs dans le pli (`class`,
`species`, `gear[n]`, les sorts passent déjà par `must`). Ce canal n'invente pas
cette règle : il cesse d'y échapper.

⚠️ **Et la résolution est PARESSEUSE, par module — pas faite d'avance.** La
première version de l'architecte résolvait tous les `ref` en amont avec `must`.
**Deux tests ont rougi, et ils avaient raison** : résoudre d'avance vole au
module la distinction ci-dessus entre couche absente et record inexistant. La
généralisation qui « résout tout d'avance » est la faute à ne pas refaire.

### Ce qu'il rend

| Retour | |
|---|---|
| `stat` | l'entrée `resolved.stats[]`, ou `null` s'il n'a pas **un seul** terme à publier (le schéma exige `minItems: 1` sur `breakdown`). |
| `underived` | ses propres déclarations, versées dans le carnet commun. |
| `consumed` | les chemins qu'il a **réellement lus hors de son namespace**. Sans lui, un don qui compte dans une statistique ressortirait `unconsumed` et `validate` dirait de lui « il ne change rien à la fiche » — **un faux témoignage, pas une omission**. |

⚠️ **Le garde de réclamation.** Un module ne réclame que ce que la dérivation
lui a **tendu** ; réclamer autre chose est un refus qui le nomme. Sans ce garde,
un module pourrait faire taire n'importe quel choix du document. Il est vérifié
**en le violant**, et il mord sur **tous** les genres — pas seulement les dons
*(« UN MODULE NE RÉCLAME QUE CE QU'ON LUI A TENDU », « ATTAQUE — le garde de
réclamation mord sur TOUS les genres »)*. Un `consumed` qui n'est pas une liste
est également refusé.

### Les propriétés que des tests tiennent

1. **Drapeau éteint** → le module ne tourne pas, `stats` est vide, et ses choix
   ressortent `unconsumed` — signalés, pas avalés.
2. **Couche montée sans son module** → `stats` vide, et la déclaration nomme
   **les deux listes** (drapeaux levés / drapeaux servis) : sans ça, un
   personnage FH monté sans son module rendrait le même carnet qu'un personnage
   SRD pur, et l'oubli serait invisible.
3. **Un drapeau levé que personne ne sert se déclare.**
4. **`stats: []` pour un personnage SRD pur**, et rien du chemin commun ne cite
   une mécanique de couche.

## Ce qui est dérivé, et ce qui ne l'est pas

> ⚠️ **Inventaire RÉVISÉ le 2026-08-08, après la fusion du lot 8 et la
> régénération des couches.** Il a bougé **dans les deux sens**, et c'est
> normal : cet inventaire décrit la rencontre entre un moteur et une matière,
> pas seulement le moteur. Mesuré sur le magicien elfe niveau 1, sur la
> **vraie pile**, sans aucun échafaudage.

**Dérivé, et identique au fichier d'exemple** : `derivation`, `identity`
(niveau, espèce, arrière-plan, classes) + `identity.size`, `abilities` (avec
les boosts d'arrière-plan), `proficiency`, `ac` (sans armure, et avec —
`ac_base`/`ac_dex_cap`/`ac_bonus`), `vitals.hpMax` (niveau 1), `speeds`,
`saves`, `skills` (les 18, bonus et maîtrise), `tools`, `spellcasting`
(id, name, ability, dc, attackBonus, slots, et les 8 sorts en id/name/level/
prepared/range/castingTime/duration/ritual/**text**/**concentration**), `gear`
et `currency` depuis les choix, `craft`, **`senses`** d'espèce et — depuis le
lot 13 — les **`traits`** d'espèce (5/5 pour l'Elfe, `{id, name, source, text}`,
`source` = le nom du record d'espèce).

**Trois divergences ASSUMÉES avec le fichier d'exemple**, assertées et non
contournées : `identity.species` ne porte pas le lignage et gagne
`identity.size` (champ ajouté au schéma après l'écriture de l'exemple) ; les
textes et phrases de sort — et depuis le lot 13 les **textes de trait**, plus
le `name` de `lignage-elfique` — viennent du **record**, pas des résumés
éditoriaux saisis à la main ; et `senses[].id` est `darkvision`, l'identifiant
du record, là où le fichier écrivait le slug français `vision-dans-le-noir` —
un id est une ancre d'override, pas un mot.

**Deux mouvements au 2026-08-08, et le second est reparti dans l'autre sens le
même jour** : `senses` est passé de non dérivé à **dérivé** (la sous-question
sur `senses[].name` a été retenue et le lot 8 le livre) ; `traits` d'espèce est
passé de dérivé à **refusé et déclaré** par le lot 8 — puis **de nouveau
dérivé** (lot 13), le lot 11 ayant réparé dans `fh-srd` l'extraction à deux
colonnes que le lot 8 avait nommée comme son préalable. Le bloc n'a pas changé
d'avis : c'est la matière qui a changé, et la déclaration l'a suivie **dans les
deux sens**.

**Un trait qui accorde un sens paraît DEUX FOIS, et c'est voulu.** L'Elfe porte
cinq traits, dont « Vision dans le noir », **et** un sens `darkvision` de 18 m.
Les deux sont vrais : le trait porte la **règle** (`text`), le sens porte le
**nombre** que la fiche affiche sur sa ligne. Le contrat ne lie aucun trait au
sens qu'il accorde ; retirer le trait obligerait le moteur à rapprocher
`vision-dans-le-noir` de `darkvision` par leur **nom affichable**, ce que la loi
§0.13 interdit. La dérivation **recopie la liste du record**, elle ne la trie
pas.

**`resolved.stats[]` — ce que les modules y publient au 2026-08-09** : deux
entrées, chacune sous son drapeau et son ancre.

| Ancre | Drapeau | Lot | Ce que le total vaut |
|---|---|---|---|
| `fh:destiny` | `fh.destiny` | 19/20 | le Score de Destinée : maîtrise + Base d'espèce + Arcane + don |
| `fh:skill-points` | `fh.skills` | 23 | **ce qu'il RESTE à répartir** : pool de classe + paliers **traversés** + bumps d'espèce − imposés. ⚠️ **Incomplet depuis la ratification du 2026-08-09** : il manque le terme **origin feat** (`Skilled` = +6) et les deux lignes « net zero » des granted choices — lot 24 |

⚠️ **Le total du pool n'est PAS le pool brut.** Un Roublard niveau 1 a un *pool
de classe* de 18 et publie **11** — 4 imposés de classe, 2 compétences et 1
outil d'arrière-plan, à 1 point chacun (`tier_costs.imposed`, lu sur le record).
Mesure indépendante qui le confirme : Eric chiffre le résultat attendu de sa
réforme à « environ 2 points libres à **7–10** » ; magicien 12−5 = 7, druide
14−5 = 9, roublard 18−7 = 11. Publier 18 ne dirait rien de ce que le joueur
peut dépenser.

### ⭐ THE SKILL POOL — l'algorithme canonique, ratifié par Eric le 2026-08-09

**Écrit en terminologie anglaise à sa demande explicite** (« utilise la
terminologie anglaise pour les règles »). C'est **sa** présentation, recopiée,
pas une reformulation d'architecte :

```
skill pool  =  class base                (the background's flat 6 is INSIDE it)
            +  species bonus             (points — Educated, Fast Learner)
            +  origin feat bonus         (points — Skilled = +6)

imposed placements, 1 point each (tier ½, `tier_costs.imposed`) :
            −  class      skill_choice.count
            −  background skill_ids + tool
            −  granted choices from a trait or a feat    ⟵ NET ZERO

remaining   =  what the player distributes
```

**La décomposition du `base`, mesurée sur les douze records** : le background
est une constante de **6**, la part de classe est variable — Rogue 12, Bard 10,
Druid/Monk/Ranger 8, les huit autres 6. La note de chaque record le dit déjà
(*« level-1 skill pool 18, background included »*). **Aucun changement de
donnée n'est dû** : Eric décrivait la composition d'un nombre qui existait.

⚠️ **LE « NET ZERO » EST LA CLEF, et il réconcilie deux formulations d'Eric qui
semblaient se contredire.** Il a écrit « imposé par l'espèce **se rajoute** au
pool », puis « tu **places** les points imposés par certains traits ou feats ».
Les deux sont vraies ensemble : le pool grossit du grant, le placement le
reprend. Net zéro sur le total, **deux lignes dans le `breakdown`** — et c'est
la seule lecture qui n'oppose pas ses deux phrases. Conséquence pratique : le
nombre publié par le lot 23 est **déjà juste** ; ce qui manque est la paire de
lignes qui montre le raisonnement.

⚠️ **Un grant restreint ne se convertit PAS en points.** Le `Keen Senses` de
l'Elestu tire dans `{survival, delve, vigilance}` ; un point est dépensable
partout. Convertir le grant en points effacerait la restriction, donc la
saveur de l'espèce. Le grant reste un grant.

**`Skilled` — vérifié au SRD avant d'être chiffré** : `srd:feat:en:skilled`,
`category: "origin"`, *« three skills or tools of your choice »*. Il **n'impose
rien** (Eric l'avait dit, le texte le confirme), et 3 proficiencies × 2
(`tier_costs.proficient`) = **+6**. La valeur est donc à **parité exacte** avec
le SRD, pas une inflation.

#### La mesure d'équilibrage, montrée parce qu'elle surprend

| Personnage niveau 1 | base | species | Skilled | imposés | **reste** |
|---|---|---|---|---|---|
| Wizard nu | 12 | — | — | 2+3 | **7** |
| Rogue nu | 18 | — | — | 4+3 | **11** |
| Human Wizard + Skilled | 12 | +2 | +6 | 2+3 | **15** |
| Human Rogue + Skilled | 18 | +2 | +6 | 4+3 | **19** |

La fourchette « 7–10 » qu'Eric visait décrit **le cas nu**. Empiler species
bonus et Skilled double le reste, et **il l'assume** : les outils se paient sur
le même pool (36 en catalogue), l'expertise coûte 4, et — mesuré — **elle est
verrouillée jusqu'au niveau 4 sur les douze classes**
(`expertise_from_level: 4`). Un niveau 1 ne peut donc acheter que du ½ et du
plein : 19 points, c'est de la **largeur**, jamais de la profondeur. Le SRD
fait l'inverse pour un Rogue — moins de compétences, mais **Expertise dès le
niveau 1**. Deux courbes différentes, un total comparable.
⚠️ *Cette divergence Expertise-au-niveau-1 est un choix d'Eric, pas un oubli :
notée ici pour qu'aucun lot ne la « corrige ».*

⚠️ **Les paliers se cumulent sur les niveaux TRAVERSÉS** (règle Q15-8 d'Eric) :
créé au niveau 5, un personnage a les paliers ≤ 5, pas celui du 6. « À la
création » ne veut **pas** dire « au niveau 1 ». Chaque palier est **une ligne
du `breakdown`**, avec son niveau — un terme unique « paliers traversés : +6 »
serait exact et indémontrable.

**Non dérivé, déclaré, avec sa raison** :

| Champ | Pourquoi |
|---|---|
| `senses[perception-passive]` | elle se **calcule** (10 + le bonus de la compétence), mais son **nom** ne vit dans aucun record : ce n'est pas un sens d'espèce, c'est une ligne de fiche |
| `traits` d'espèce | **plus dans cette table depuis le lot 13** — ils sont **dérivés**. Ne subsiste que la déclaration résiduelle : un record d'espèce qui ne porte pas `traits` du tout (couche tierce ou amputée), prouvée par une privation délibérée |
| `spells[].castType` | **refusé par le lot 8**, mesure à l'appui — cinq constructions ressemblent à une sauvegarde et une seule est le fait, et un sort peut être génuinement les deux. Le schéma a cédé : le champ n'est plus obligatoire, le sort est émis **sans** son mode |
| `languages` | aucun genre `language` parmi les 14. ⚠️ Le chapitre 4 leur donne pourtant une règle (**gratuites à la création, 1 point ensuite**) : la règle existe, le genre qui la porterait n'existe pas. Le lot 22 ne l'a pas inventé (loi §0.10) |
| `build.budgets` | **⚠️ AUCUN CHEMIN D'ÉCRITURE, mesuré par le lot 22, et TOUJOURS AUCUN.** Le champ est `required` au schéma, vide dans le seul document d'exemple, et `grep -rn budgets src/` ne rend **rien**. ✅ **La question 1 est TRANCHÉE** (arbitrage du 2026-08-09, §« Où vit un POOL DE POINTS ») : le pool de compétences **n'atterrit pas ici**, il se publie dans `resolved.stats[]` — et le lot 23 l'y publie. Le `$comment` du champ, qui le nomme comme son « premier consommateur concret », est donc **périmé** : `budgets` n'a plus aucun consommateur connu, et la **loi §0.6** se pose désormais sur lui. ⚠ Point ouvert pour l'architecte |
| `stats[fh:skill-points].imposed.species` | **✅ TRANCHÉE (arbitrage du 2026-08-09, § ⭐ THE SKILL POOL — LE NET ZÉRO, livré par le lot 24).** L'Araag, l'Elestu et l'Humain (`Skillful`) portent un `granted_skill_choice` — une maîtrise que l'ESPÈCE impose. La déclaration que le lot 23 posait ici n'a plus lieu d'être : le grant SE RAJOUTE au pool PUIS SE PLACE au coût d'un imposé, deux lignes publiées dans `breakdown`, un total inchangé. |
| `stats[fh:skill-points].imposed.class-tools` | aucun champ **mécanique** d'outil sur la classe : `tool_proficiencies` est une phrase (« Choose 3 Musical Instruments », `null` pour le magicien), et il n'existe pas d'équivalent de `skill_choice`. Les compter demanderait de lire une phrase anglaise dans le moteur |
| le **multiclassage** du pool | hors de portée, et pas par choix du lot 23 : **le pli lui-même ne dérive qu'UNE classe** (`takeRef("class")`, `identity.classes = [{name, level}]`). Le canon le tranche pourtant (« le +1 du Barde suit ses niveaux de barde, le +2 d'espèce suit le niveau de personnage »), et ⚠ le `by_level` de la couche a **fusionné** le +1 du barde avec le +2 universel — donc il ne se découpe pas par classe tel quel. À rouvrir le jour où le pli portera le multiclassage |
| `actions` | aucun genre `action` ; composer une attaque demande une règle (Finesse, Lancer) que le contrat ne porte pas |
| `resources` | dés de vie et usages d'aptitude n'ont aucun champ mécanique ; `class-progression.resources` porte des clefs sans nom affichable |
| `notes` | du texte saisi à la main — et un choix ne peut pas le porter : `build.choices[].value` est plafonné à **200 caractères** |
| `traits` de classe, de don, d'arrière-plan | le contrat ne porte aucun champ de trait pour `class`, `feat`, `background` |
| `identity.species` (lignage) | le lignage est un choix, pas un record ; le recoller serait composer un mot affichable |
| `gear[].weight` et `.note` | « 0,5 kg » est une phrase ; les deux sont **facultatifs** au schéma, donc les omettre est légitime — mais ça se déclare |
| `spells[].damage` | non structurés **nulle part** : ni dé, ni type, ni progression par niveau d'emplacement |
| `spells[].concentration` | **dérivée** depuis le lot 8 (339/339) ; il n'en manque plus que sur la couche d'exemple, non régénérée. Jamais déduite de `duration`, qui est une phrase |
| `craft` | module moteur activé par un drapeau (Q4) ; aucun n'existe au M2 |

## Obligations de test

1. **Le test d'acceptation** (`build-acceptance`), sur la vraie matière et
   **par `dispatch` uniquement** : le document part avec `choices` et
   `overrides` **vides**, chaque décision est rejouée par `choose`/`set`/
   `override`, puis `rebuild`. Les **dix-huit compétences nommément**, pas un
   compte.
   ⚠️ **ON COMPARE L'OBJET, JAMAIS UNE PROJECTION.** Leçon de la revue du
   2026-08-08 : la première passe comparait `identity` à un littéral, `gear` à
   une chaîne `id×quantité` et un sort à cinq de ses douze champs — quatre
   divergences avec le fichier passaient donc sans rougir NI être déclarées.
   C'est la parente exacte du « garde qui compte ». Désormais chaque
   collection est diffée **entière** contre le fichier et la liste des écarts
   est **exacte** ; les écarts de sort sont en plus comptés **par famille**,
   pour qu'un écart d'une cinquième nature tombe avant la table.
2. **Les overrides en dernier** : la dérivation seule donne 8 PV et 2 torches,
   le fichier en porte 9 et 4 ; et une seconde reconstruction ne les efface pas.
3. **Les refus** (`build-derive`) : niveau, classe, score, clef hors
   catalogue, pile qui a bougé, override dans le vide, chemin mal formé.
4. **Les dégradations** : la pile telle qu'elle est **avant le lot 8** — rien
   n'est deviné, tout ce qui manque est nommé, et la raison cite le **champ
   mécanique attendu**, pas un vague « données manquantes ».
5. **Le document produit valide `fh-char/1`** (ajv, dépendance de dév), et ses
   clefs de `resolved` sont exactement les vingt requises.
6. **La loi §0.12** : un personnage SRD pur, sans la couche d'exemple, sans
   aucun drapeau levé, traverse la dérivation de bout en bout.
7. **Les gardes STRUCTURELS, et leurs ATTAQUES** (`build-block`) : chaque
   interdit violé une fois dans une source fabriquée, vu **et nommé** ; le
   périmètre est une **liste de noms**, attaqué à vide et amputé ; l'exemption
   de `clock.mjs` prouvée dans les deux sens.
8. **Le garde de dérive schéma ↔ code** : les deux grammaires de chemin du
   code sont comparées, source pour source, aux `pattern` du schéma — et
   `SPELL_TEXT_MAX` au `maxLength` du texte de sort. (Celui-là a été écrit
   *après coup* : une attaque a montré qu'un commentaire de `derive.mjs`
   promettait ce comparateur alors qu'il n'existait pas. Une promesse en
   commentaire n'est pas une garantie.)
9. **L'attaque RÉELLE de l'arbre**, hors suite, journalisée dans le rapport de
   lot : **dix-huit** violations délibérées posées dans les vrais fichiers de
   `src/build/`, dix-huit rouges, arbre restauré. Un garde vert qui n'a jamais
   échoué exprès ne prouve rien.
10. ⚠️ **UN REFUS NE SE PROUVE PLUS PAR LA PÉNURIE DE LA SOURCE.** Avant la
    fusion du lot 8, il suffisait de monter la vraie couche pour voir le bloc
    déclarer : elle ne portait aucun champ mécanique. `hit_die`,
    `saving_throw_keys`, `speed_m`, `size_key`, `tool.ability_key`, `ac_base`
    sont arrivés, et **cinq preuves se sont évaporées avec eux**. On ne relâche
    pas une garantie parce que la matière s'est améliorée : chaque refus est
    reprouvé par une **couche de scénario délibérément amputée**, qui recouvre
    le record par un `add` ne gardant que la prose. L'amputation devient
    lisible au lieu d'être un accident dont la disparition passerait inaperçue,
    et chaque scénario porte son **pendant sur la vraie matière** — le champ y
    est bien dérivé.

## ⚠ Points ouverts, pour l'architecte

Repris en détail, avec leur mesure, dans `QUESTIONS-ARCHITECTE.md` à la racine
du worktree. En résumé :

**LES SEPT SONT TRANCHÉES** (arbitrage de l'architecte, 2026-08-08). Le détail
et la mesure de chacune restent dans `QUESTIONS-ARCHITECTE.md`, qui vaut
désormais comme journal de décision.

1. ✅ **RATIFIÉE telle quelle** — nombre absent / collection vide **plus**
   déclaration obligatoire / structure jamais à moitié émise. Le `required` du
   schéma ne bouge pas : un document valide qui dit ce qu'il ne sait pas vaut
   mieux qu'un document invalide.
2. ✅ `ability_key` canonique dans les deux langues, appliqué.
3. ✅ **LES QUATRE NOMS RATIFIÉS** et commandés au lot 8 —
   `class.spellcasting_ability_key`, `tool.ability_key`, `spell.cast_type`,
   `senses[].name`, plus `spell.concentration`. Trous du contrat, pas du lot.
4. ✅ **DEUX VERBES** — le MCP v0 hérite de cette forme.
5. ✅ **Le fichier d'exemple est complété** (niveau, équipement, bourse,
   `livre-de-sorts` → `livre`) ; les notes restent dehors, le plafond mesuré à
   200 caractères contre 188 le tranche.
6. ✅ **RÈGLE STRICTE RATIFIÉE** — un override ne crée rien. La contradiction
   se dissout dès que le lot 8 livre `hit_die` : `hpMax` sera dérivé, donc
   l'override du MJ tweakera bien quelque chose qui existe. La suite
   `⚠️ QUESTION 6` sera à réécrire à la nouvelle vérité, marquée `REWRITTEN`
   sur sa propre ligne.
7. ✅ **RÈGLE RATIFIÉE, parade REFUSÉE** — `granted_skill_choice.path`
   demanderait au SRD de porter une convention du constructeur, que le PDF ne
   dit pas. La faille reste étroite et datée.
