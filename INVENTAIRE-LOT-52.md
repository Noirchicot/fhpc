# Lot 52 — l'inventaire

**Branche** : `52-dettes-lot-43`, coupée de `main` à `33337a4` (remesuré : `git -C ~/tools/fhpc rev-parse --short main` → `33337a4`, identique au SHA annoncé par la commande).

**Tests** : **801 verts au départ** (`npm ci` puis `npm test`, conforme au nombre annoncé). **811 verts à l'arrivée** — **+10 nets** : 7 tests neufs pour la dette A (`tests/fh-skill-pool-lot52.test.mjs`), 3 pour la dette B (`tests/build-block-lot52-dette-b.test.mjs`), plus deux assertions existantes ajustées (`tests/underived-labels.test.mjs`, 17 → 18, voir §1 ci-dessous).

**Périmètre tenu** : `src/modules/fh/skill-pool.mjs`, `src/build/block.mjs`, `tests/`. Zéro ligne touchée dans `ui/`, `contracts/` (mesuré : `git diff --stat` sur les deux commits liste exactement ces fichiers). Aucun `git push`, aucune fusion.

**Commits** : `cc60207` (dette A), `4655b01` (dette B). Arbre propre.

---

## 0. Le piège d'outillage (§0 de la commande)

Confirmé sans y toucher davantage : `src/build/block.mjs` était corrigé et gardé avant que je commence (les deux octets NUL bruts sont devenus des séquences d'échappement, `grep -c ""` y rend maintenant un compte réel). Je l'ai lu directement (`Read`, pas `grep`) pour la dette B, et grep dessus fonctionne bien aujourd'hui — vérifié.

---

## 1. DETTE A — `imposedLines()`, réordonné

### Ce qui a été mesuré avant de toucher au code

Le personnage d'exemple réel (`examples/personnage-fh-en-niveau1.fh-char.json`, celui que la page monte) ne porte **aucun** choix `path: "background"` — confirmé en listant ses choix. Les quatre arrière-plans SRD sont `disable` dans `fh-skills-en.layer.json`. `backgroundRef` est donc absent pour tout personnage FH réel, pas seulement pour « un Araag/Humain sans background » comme le disait le lot 43.

Sous l'ancien code, le `return` anticipé (déclenché par `!backgroundRef`) sautait TROIS choses, dont deux ne lisent jamais `backgroundRef` :
- `skillpool-class-tools-unmechanical` (une simple déclaration, jamais lue nulle part) — **jamais rendue**, pour personne.
- Le bloc espèce entier, y compris ses deux `fail()` (`granted_skill_choice` scalaire, ou `count` non positif) — **inatteignables**, pour personne. Confirmé en reproduisant l'ancien comportement (`git stash` avant de committer) : les six tests ci-dessous rougissaient tous sauf un.

### Comment j'ai réordonné

Dans `imposedLines()` (`src/modules/fh/skill-pool.mjs`), les deux blocs qui ne lisent pas `backgroundRef` — la déclaration des outils de classe, et le net zéro d'espèce (grant + placement, avec ses deux `fail()`) — sont sortis de dessous le `return`, et placés juste après le bloc `skill_choice` de la classe. Le `return` lui-même **n'a pas été supprimé** : ce qui le suit encore (`skill_ids` de l'arrière-plan, son outil) lit vraiment `backgroundRef`, et continue d'être sauté quand il est absent.

### La preuve qu'aucun total ne bouge

`tests/fh-skill-pool-lot52.test.mjs`, test 5 (« ⛔ LIGNE ROUGE ») mesure les quatre espèces citées par l'architecte, sans aucun choix `background`, à Wizard niveau 1 : **Human 12, Araag 12, Elf 10, Loroka 10** — exactement les valeurs de la sonde de l'architecte (§1b de la commande). Le mécanisme qui garantit ce non-mouvement : le grant d'espèce et son placement s'annulent toujours à somme nulle (`+count*cost` puis `-count*cost`), donc les DÉPLACER dans le détail ne change ni leur valeur ni la somme — seul l'ORDRE des lignes dans `breakdown` change (vérifié ligne à ligne dans les tests 1/1bis/4, comparaison `deepEqual` de l'objet entier, jamais une projection).

### Ce que ça a changé ailleurs

Deux tests existants (`tests/underived-labels.test.mjs`, §4 et §5) comptaient les entrées `underived` du personnage d'exemple à **17** — un compte que le lot 43 avait lui-même corrigé de 19 à 17, sans voir qu'il aurait dû s'arrêter à **18** : `skillpool-class-tools-unmechanical` manquait à son propre calcul, pour la même raison que la dette elle-même. Les deux assertions sont maintenant à 18, avec un commentaire qui trace le calcul (19 − 1 + 1 = 18).

---

## 2. DETTE B — `background.boost-disallowed`, la mesure et le verdict

### La mesure, sur le pli réel

Comme l'indique la règle de mesure n°2 du mandat, j'ai construit des documents et **compté les violations rendues par `validate()`**, jamais cherché les écrivains au grep.

**Scénario 1 — SRD pur (aucune couche FH), arrière-plan Sage (`ability_keys: con, int, wis`), boost sur `str`** (hors catalogue) :
`validate()` rendait **DEUX** `background.boost-disallowed`, identiques clef pour clef, params pour params. Le doublon est réel — je l'ai mesuré AVANT toute correction (script jetable, supprimé après usage) et confirmé qu'il correspond exactement à l'indice du lot 43 : `decisions.mjs::backgroundBoostPlan` (lu par `projectDecisions`) et le second calcul de `block.mjs` (verbe `validate`) partagent la même condition de déclenchement (`background` explicitement choisi + `ability_keys` tableau) et publient chacun leur `buildViolation(...)`, sans jamais se comparer — le dédoublonnement par empreinte de `block.mjs` (lot 43, §3e-bis) ne porte QUE sur les verrous internes à `projectDecisions`, jamais sur ce second calcul séparé.

**Scénario 2 — le pli réel, avec l'Inheritance** (la seule couche FH mesurée aujourd'hui) : Inheritance ne porte PAS `ability_keys` du tout (`{description, feat_choice, name}`, mesuré en lisant le record). `block.mjs`, avant correction, exigeait `Array.isArray(keys)` pour tourner — ce qui n'était **jamais** vrai pour l'Inheritance. Sur le pli FH réel d'aujourd'hui, la copie de `block.mjs` était donc déjà **injoignable** de fait (troisième issue du tableau, pour ce cas précis) — mais PAS parce que le chemin est mort en général : dès qu'un `background` SRD (avec `ability_keys`) est choisi explicitement (SRD pur, ou une couche tierce qui en ajoute un), le doublon du scénario 1 redevient bien réel. Les deux mesures cohabitent : « injoignable aujourd'hui pour l'Inheritance » n'implique pas « injoignable pour tout document ».

**Verdict retenu (deuxième ligne du tableau, dédoublonnée)** : **la violation sort deux fois**, dans un scénario reproductible avec le contenu SRD existant → **dédupliquée**, avec son test (`tests/build-block-lot52-dette-b.test.mjs`, test 1 : compte tombe de 2 à 1 après correctif, avec régression prouvée par `git stash`).

### `background.ability-key-invalid` — vérifié, pas dupliqué

Un seul producteur (`block.mjs`), sans équivalent dans `decisions.mjs` : c'est un contrôle du CONTENU du record (une clef hors des six canoniques écrite dans `ability_keys` lui-même), pas un jugement sur le choix du joueur. Aucun record réel n'a de clef cassée aujourd'hui (les quatre arrière-plans SRD et l'Inheritance sont tous propres), donc cette violation précise ne sort actuellement d'aucun document réel — mais le CODE qui la produit tourne bien dès qu'un `background` avec `ability_keys` est choisi (test 3, avec un record patché pour porter une clef cassée : rougit, une seule fois). Conservé intact.

### Le correctif

`block.mjs` ne recalcule plus `background.boost-disallowed` — `decisions.mjs` en est la source unique, et gère en prime le cas `ability_keys` absent (repli sur les six clefs canoniques, contrat §1c) que la copie ignorait (elle se contentait d'avertir, jamais de refuser). `background.ability-key-invalid` reste, seul.

---

## 3. Ce qui a surpris

- **La ligne rouge de la dette A a failli être franchie par le TEST, pas par le code.** Mes premières versions des tests 1/1bis avaient l'ordre des lignes du `breakdown` faux (je pensais que le net zéro d'espèce sortait avant l'imposé de classe ; c'est l'inverse — l'imposé de classe est poussé DANS `imposedLines()` avant le bloc réordonné). Le code était juste, mes attentes ne l'étaient pas — corrigé en lisant la sortie réelle plutôt qu'en la devinant.
- **Le lot 43 avait lui-même sous-compté sa propre migration** (19 → 17 au lieu de 19 → 18, voir §1) — la même dette qu'il déclarait ailleurs lui avait échappé jusque dans son propre test de comptage.
- **La dette B était réelle, mais pas là où je m'attendais.** Sur le pli FH d'aujourd'hui (Inheritance), le second producteur de `block.mjs` était déjà mort — c'est en testant un scénario SRD pur (sans aucune couche FH, comme au temps où les quatre arrière-plans SRD étaient encore choisissables) que le doublon est apparu, bien vivant. Une mesure sur un seul scénario (le pli FH actuel) m'aurait fait conclure à tort à « dette retirée » — exactement le piège que la commande met en garde contre au §0.
- **`warnings.push(... "la légalité des augmentations n'a pas pu être vérifiée")`** (dans `block.mjs`, branche `else` du `if (Array.isArray(keys))`) reste techniquement inexact depuis le lot 43 : `decisions.mjs` VÉRIFIE bel et bien la légalité même quand `ability_keys` est absent (repli sur les six clefs). Ce n'est ni une duplication ni un garde qui ne mord plus — c'est un message obsolète, hors du périmètre de cette commande (elle ne le nomme pas), et aucun test ne s'appuie dessus. Signalé ici plutôt que corrigé en douce.

## 4. Ce qui a été changé de cette commande

Rien n'a été contredit : les deux dettes existaient bel et bien, mesurées, et les deux issues retenues (A : réordonner sans rayer ; B : dédupliquer, deuxième ligne du tableau) correspondent à ce que la commande anticipait comme réponses possibles. Le seul écart est un signalement, pas un changement : le message d'avertissement obsolète noté au §3, laissé intact.
