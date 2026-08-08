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
| `rebuild` | `{document?}` | **Le seul chemin d'écriture de `resolved`.** Plie la pile et les choix, applique les overrides **en dernier**, écrit `resolved` et `modified`. Émet `char-rebuilt`. Rend `{document, resolved, underived, unconsumed, overridesApplied, shadowed, warnings, diff}`. | niveau ou classe absents, score de caractéristique absent, clef de caractéristique hors catalogue, ref mort, pile ≠ `build.layers`, override dans le vide, invariant violé → **jette** |
| `validate` | `{document?}` | Dit ce qui cloche **sans rien écrire**. Rend `{ok, violations, warnings}`. | — (un refus est un résultat ; même une erreur de dérivation devient une violation) |

> ⚠ **Pourquoi DEUX verbes pour un seul geste.** `$defs/build.choices` exige
> « `ref` OU `value`, jamais les deux, jamais aucun ». `choose` et `set` sont
> les deux moitiés de cette règle : un verbe unique à deux formes ne l'aurait
> rendue vérifiable qu'à l'exécution. **À ratifier** (question 4).

> ⚠ Le kickoff écrit `choose, set, override, rebuild, validate` — les cinq y
> sont, sous ces noms, et il n'y en a pas un sixième.

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

## Ce qui est dérivé, et ce qui ne l'est pas

Inventaire mesuré sur le magicien elfe niveau 1, pile réelle + fixture
mécanique (contrat §7).

**Dérivé, et identique au fichier d'exemple** : `derivation`, `identity`
(niveau, espèce, arrière-plan, classes) + `identity.size`, `abilities` (avec
les boosts d'arrière-plan), `proficiency`, `ac` (sans armure, et avec —
`ac_base`/`ac_dex_cap`/`ac_bonus`), `vitals.hpMax` (niveau 1), `speeds`,
`saves`, `skills` (les 18, bonus et maîtrise), `tools`, `spellcasting`
(id, name, ability, dc, attackBonus, slots, et les 8 sorts en id/name/level/
prepared/castType/range/castingTime/duration/ritual), `gear` et `currency`
depuis les choix, `craft`, `traits` d'espèce.

**Non dérivé, déclaré, avec sa raison** :

| Champ | Pourquoi |
|---|---|
| `senses` | le contrat §5 donne `{id, range_m}` **sans `name`**, que le schéma exige ; la perception passive n'a de nom dans aucun record |
| `languages` | aucun genre `language` parmi les 14 |
| `actions` | aucun genre `action` ; composer une attaque demande une règle (Finesse, Lancer) que le contrat ne porte pas |
| `resources` | dés de vie et usages d'aptitude n'ont aucun champ mécanique ; `class-progression.resources` porte des clefs sans nom affichable |
| `notes` | du texte saisi à la main — et un choix ne peut pas le porter : `build.choices[].value` est plafonné à **200 caractères** |
| `traits` de classe, de don, d'arrière-plan | le contrat ne porte aucun champ de trait pour `class`, `feat`, `background` |
| `identity.species` (lignage) | le lignage est un choix, pas un record ; le recoller serait composer un mot affichable |
| `gear[].weight` et `.note` | « 0,5 kg » est une phrase |
| `spells[].damage`, `.text`, `.concentration` | prose (`description`, `duration`) |
| `craft` | module moteur activé par un drapeau (Q4) ; aucun n'existe au M2 |

## Obligations de test

1. **Le test d'acceptation** (`build-acceptance`), sur la vraie matière et
   **par `dispatch` uniquement** : le document part avec `choices` et
   `overrides` **vides**, chaque décision est rejouée par `choose`/`set`/
   `override`, puis `rebuild`. Les **dix-huit compétences nommément**, pas un
   compte. Les divergences avec le fichier d'exemple sont **assertées**, pas
   contournées.
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
   code sont comparées, source pour source, aux `pattern` du schéma.
9. **L'attaque RÉELLE de l'arbre**, hors suite, journalisée dans le rapport de
   lot : douze violations délibérées posées dans les vrais fichiers de
   `src/build/`, douze rouges, arbre restauré. Un garde vert qui n'a jamais
   échoué exprès ne prouve rien.

## ⚠ Points ouverts, pour l'architecte

Repris en détail, avec leur mesure, dans `QUESTIONS-ARCHITECTE.md` à la racine
du worktree. En résumé :

1. La ligne « nombre absent / collection vide déclarée ».
2. ✅ Tranché le 2026-08-08 : `ability_key` canonique dans les deux langues.
3. Quatre champs **hors contrat** que la fixture porte
   (`class.spellcasting_ability_key`, `tool.ability_key`, `spell.cast_type`) —
   à ratifier ou à renommer.
4. `choose` / `set` comme deux moitiés de « `ref` OU `value` ».
5. Trois familles de décisions absentes du personnage d'exemple : le
   **niveau**, l'**équipement** et la **bourse**.
6. Un override sur un champ **non dérivé** : refus ou chemin de secours ?
7. La règle de reconnaissance d'un choix de compétence (racine + légalité).
