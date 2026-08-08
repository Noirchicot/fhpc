# Inventaire — lot `21-vibration-tilt`

Branche `21-vibration-tilt`, coupée de `main` = `6344cce`.
**459 tests verts en base → 482 verts à l'arrivée.** Aucun `git push` : c'est le
geste d'Eric.

---

## 0. Ce que la commande disait, et ce que la mesure dit

La commande du siège était juste sur l'essentiel, et **fausse sur un point**.
Elle avait aussi raté deux pannes voisines. Les quatre lignes en un coup d'œil :

| Affirmation de la commande | Verdict | Mesure |
|---|---|---|
| `destinyBuild` absent du schéma et des exemples | ✅ **vrai** | 0 occurrence dans `schemas/fh-char.schema.json`, 0 dans `examples/*.json` |
| La Vibration ne se déclenche jamais sur un document v2 | ✅ **vrai** | `arcanaKnown()` rendait `false` inconditionnellement |
| `state.character` « est bien un `fh-char/1` » | ⚠️ **non mesurable en l'état** | le contrat disait l'inverse, `saveInfo` lit une **troisième** forme, aucun appelant de production n'existe — voir §4 |
| L'Épuisement est déjà juste, hors périmètre | ✅ **vrai** | `rules.exhaustionPerLevel: 1`, tenu par `play-srd-only.test.mjs:482-483` — **pas touché** |

Et **deux pannes que la commande n'annonçait pas**, trouvées en chemin et
corrigées parce que le Tilt roule dessus : le +2 de la couche n'atteignait
jamais l'entrée (§2), et `prepare()` perdait silencieusement tout réglage de
module (§3).

---

## 1. La Vibration — le correctif

### Le diagnostic, refait

`arcanaKnown()` (`src/modules/fh/index.mjs`) lisait :

```js
const build = state.character && state.character.destinyBuild;
return !!(build && build.arcana);
```

`destinyBuild` est un nom de champ **v1**. Sur un document v2 il rend `false` à
tous les coups, donc `vibrationFor()` rend `null`, donc **aucune Vibration ne
s'est jamais signalée**. Le critique arcanique, lui, avait bien lieu : la ligne
du flux disait tout sauf la seule chose qui manquait, et c'est ce qui a rendu la
panne invisible pendant cinq lots.

**Ce qui l'a rendue invisible AUX TESTS est plus grave que le bug.** Le harnais
(`tests/play-harness.mjs`) posait `character: { destinyBuild: { arcana: { name:
"The Hermit" } }, build: {} }`. Les deux côtés de l'assertion recopiaient le
même chemin v1 : quatre tests d'acceptation étaient **verts** sur une mécanique
morte.

### Ce qui a changé

- `arcanaChoiceEntry()` lit `build.choices[]` au chemin ratifié le 2026-08-09,
  par son `ref` de genre `arcana`. Le chemin n'est **pas recopié** : il est
  exporté par le module qui le possède (`destiny-stat.mjs`,
  `ARCANA_CHOICE_PATH`) — deux copies auraient dérivé à la prochaine révision.
- Le moteur y vérifie **seulement qu'une carte est nommée**. Ni le nom, ni le
  `power`, ni l'effet. Le niveau reste calculé depuis la **taille du dé**.
- **Le chemin v1 est supprimé, pas gardé en repli** (§0.6), et un test l'exige
  explicitement : un document qui porte l'ancien champ et rien d'autre est muet.
- **Trois formes jettent** au lieu de rendre « pas de carte » (§0.5) : un
  `character` sans `build.choices` (ce n'est pas un `fh-char/1`), un choix qui
  porte un `value` au lieu d'un `ref`, un `ref` d'un autre genre. Répondre
  « non » à une question mal posée est **exactement** ainsi que la mécanique est
  morte la première fois.
- **Aucun `character` du tout** reste légitime et silencieux : une séance sur un
  plateau libre n'est pas une fiche cassée.

### Les fixtures

Toutes les fiches v1 des suites sont portées sur `fhCharacter()`, qui n'écrit
que le chemin ratifié. Le **texte piège** de `fh-destiny.test.mjs` a changé de
place avec la carte : il vivait sur `destinyBuild.arcana.vibration`, il vit
maintenant sur le `label` du choix — le seul mot du document v2 qui pourrait
encore fuir. L'assertion n'est pas relâchée, elle vise le même fait.

---

## 2. ⚠️ Le +2 de la couche n'atteignait jamais l'entrée

**Non annoncé par la commande. Mesuré :**

```
cfg.plusTwo = true  →  entry.plusTwo = undefined  →  total 13 au lieu de 15
(d20 = 10, bonus 3)
```

`cfg.plusTwo` était réglable, il peignait un jeton « FH bonus » dans le plateau
**en attente**, et `runConfiguredRoll` ne le recopiait jamais sur l'entrée.
`fhTotal` lit `entry.plusTwo`. Le joueur voyait donc son +2 **avant** le jet, et
pas après.

**Même maladie que la Vibration** : une mécanique réglable, visible, et sans
effet. Corrigé parce que le +2 du Tilt roule sur ce fil — sans lui, le Tilt
serait né mort à son tour.

C'est la **couche** qui écrit sa propre clef sur l'entrée, dans son gestionnaire
`pre-roll` : le chemin commun ne sait pas ce qu'est un +2 maison.

---

## 3. ⚠️ `prepare()` perdait tout réglage de module

**Non annoncé par la commande. Mesuré :**

```
prepare({ …, plusTwo: true })  →  cfg.plusTwo === false
```

`rollInput` ne recopiait que les clefs de la liste fermée **du type**, alors que
`configure` merge `type.settings` **et** `configSettings` (ce que les modules
montés déclarent). Les deux listes avaient divergé — et `contracts/play.md:89`
annonce pourtant `prepare({… plusTwo?})` depuis le lot 5.

C'est le repli silencieux que §0.5 interdit, dans le verbe qui ouvre chaque jet.
Corrigé de façon **générique** : `rollInput` construit la même liste fermée que
`configure`. Aucun module n'y est nommé, et `configSettings` est vide quand rien
n'est monté — la contre-épreuve est testée.

---

## 4. Le Tilt

`src/modules/fh/tilt.mjs` — une table pure, sans état, sans dépendance :
`resolveTilt({tilts, disadvantage}) → {tilts, disadvantage, outcome, mode, bonus}`.

- Les cinq lignes d'Eric telles quelles. `mode` est du vocabulaire **SRD**
  (`flat` / `advantage` / `disadvantage`) : le Tilt **produit** l'Avantage, il
  ne le réimplémente pas — `makeDiePlan` fait le travail, comme toujours.
- **Aucun Tilt négatif.** Un `-1` jette, et le message enseigne la contrepartie :
  *« a malus is ALWAYS expressed by giving a Tilt to the other side […] a Tilt
  on the DC — that is, +2 to the DC »*. Un refus qui dirait seulement « hors
  bornes » n'apprendrait pas la règle, et le suivant l'écrirait pareil.
- **Aucune table de synergie.** Le moteur reçoit un compte, il ne le calcule
  pas.
- **Aucun plafond de valeur** : « 2 ou plus » est un seuil, pas une échelle.
  Borner coûterait plus cher que de le dire.

**Le branchement** : un gestionnaire `pre-roll` de priorité **40** — avant le dé
de Destinée (100), qui peut réclamer la séquence et la rendre lui-même. Il
compose `cfg.d20Mode` et `cfg.plusTwo`, écrit `entry.tilt` (les faits seuls) et
`entry.d20Mode`. Le drapeau `fh.tilt` entre dans `flags`, le badge `tilt` dans
le vocabulaire, `"tilt"` dans `entryKeys`.

**Pourquoi `pre-roll` et pas `mount`** : le moment `mount` est déclaré dans
`MOMENTS` et **`sequence.run("mount", …)` n'existe nulle part** — mesuré. S'y
inscrire aurait été du code mort à l'inscription (§0.6).

**Un ajustement ne penche rien** : le d20 est déjà tombé. Le Tilt se déclare
avant, ou il ne se déclare pas — et comme `configFromEntry` le restitue à la
console, le rappliquer le compterait deux fois.

### Ce que je n'ai PAS touché, et c'est explicite

- **`exhaustionPenalty`, `SRD_EXHAUSTION_PER_LEVEL`, `exhaustionPerLevel`** :
  pas une ligne. Un test de régression nommé le verrouille — deux degrés valent
  −2 sous FH, ils s'appliquent **au jet**, et ils coexistent avec un Tilt sans se
  convertir l'un en l'autre.
- **Les −2 des Tables de Fatalité** : elles ne sont pas dans ce dépôt (contenu
  d'Eric) et rien ici ne les approche.

---

## 5. Les gardes que j'ai attaqués

Neuf mutations, chacune passée par la suite entière puis annulée.
**Ceux qui ont tenu comptent autant que celui qui a cédé.**

| Mutation | Résultat |
|---|---|
| `arcanaKnown()` rebranché sur le chemin v1 | 🔴 **11 tests** rougissent |
| Le +2 du Tilt n'atteint plus l'entrée | 🔴 4 tests |
| Le Tilt ne pose plus `d20Mode` | 🔴 3 tests |
| `Tilt` retiré du vocabulaire interdit | 🔴 3 tests |
| Une règle de Tilt écrite dans `src/play/` | 🔴 3 tests |
| Le refus de collision A/D relâché | 🔴 2 tests |
| Le Tilt s'applique aussi après coup | 🔴 2 tests |
| Le refus du Tilt négatif relâché | 🔴 rougit |
| **Le fil du `plusTwo` manuel recoupé** | ⚪️ **480 verts — LE GARDE N'A PAS MORDU** |

### Le garde qui a cédé, et ce qu'il a révélé

Retirer `if (cfg.plusTwo) entry.plusTwo = true;` laissait **la suite entière
verte**. Tous mes tests du Tilt passent par la branche qui pose `entry.plusTwo`
de son côté : le +2 **manuel** — celui qui existait avant ce lot et n'arrivait
jamais — restait sans témoin, **exactement comme la Vibration l'était**.

Deux tests ajoutés (commit `13f5066`), et la mutation rougit maintenant. C'est
la leçon la plus rentable du lot : j'avais réparé une panne et j'allais la
laisser sans garde, à trois lignes de l'endroit où j'écrivais le commentaire qui
la décrit.

---

## 6. Les assertions réécrites (§0.7)

Aucune supprimée, aucune relâchée. Trois, chacune marquée `REWRITTEN` **sur sa
propre ligne** :

| Fichier | Ancienne vérité | Nouvelle |
|---|---|---|
| `play-roll-vocabulary.test.mjs` | 15 règles de badge | **16** — la seizième est `tilt` |
| `play-srd-only.test.mjs` | 5 drapeaux levés | **6** — `fh.tilt` ; l'égalité reste **exacte** |
| `fh-destiny.test.mjs` | le texte piège sur `destinyBuild.arcana.vibration` | sur le `label` du choix — le piège a suivi la carte, le fait visé est le même |

---

## 7. Ce que je n'ai pas tranché — pour l'architecte

Cinq questions. Les cinq sont aussi écrites dans `contracts/play.md`,
« Points ouverts », n°11 à 14.

1. **`state.character` est-il le document ou `resolved` ?** — *bloquante à
   terme, contournée ici.* La commande affirmait « c'est bien un `fh-char/1` ».
   Trois mesures se contredisent : `contracts/play.md:219` disait « référence
   `resolved` » ; `saveInfo` lit `ch.abilities[X]` (un **nombre**), `ch.pb`,
   `ch.savingProficiencies` — des noms **plats de la v1**, alors que
   `resolved.abilities.str` vaut `{score, mod}`, que la maîtrise s'appelle
   `resolved.proficiency` et les sauvegardes `resolved.saves` ; et **aucun
   appelant de production de `open()` n'existe** pour arbitrer. J'ai tranché
   **pour la Vibration seule** (le document — c'est la seule lecture qui rende
   le chemin ratifié atteignable), je l'ai écrit au contrat, et `saveInfo` reste
   sur ses noms v1. **À ratifier, avec le portage de `saveInfo`.**

2. **Que valent DEUX Tilts sur le DC ?** Par symétrie, un Désavantage. **Eric ne
   l'a pas dit** — non écrit, non modélisé. Le moteur ne connaît que le côté du
   lanceur.

3. **Comment un Tilt compose-t-il avec un Avantage d'origine SRD ?** Deux
   systèmes d'annulation, rien qui dise lequel gagne. Le moteur **jette** en
   nommant les deux plutôt que de choisir (§0.10). Une réponse d'Eric
   remplacerait ce refus par une règle.

4. **Le moment `mount` n'est branché nulle part.** Déclaré dans `MOMENTS`,
   jamais invoqué. **À brancher ou à retirer** — en l'état c'est du vocabulaire
   mort, ce que §0.6 vise.

5. **`normalizeDestiny` lit encore `ch.destinyBuild.score`**
   (`src/modules/fh/index.mjs`, ligne ~130). C'est **le dernier chemin v1
   vivant** du fichier, et c'est la même maladie que celle que ce lot répare.
   Je ne l'ai pas touché : ce n'est pas la Vibration, et le Score de Destinée a
   désormais **son propre module dérivé** (lot 19, `resolved.stats[fh:destiny]`)
   — le brancher dessus est un lot, pas une ligne. **Signalé, pas corrigé.**

---

## 8. Fichiers touchés

**Neufs** — `src/modules/fh/tilt.mjs`, `tests/fh-tilt.test.mjs`,
`INVENTAIRE-LOT-21.md`.

**Couche FH** — `index.mjs` (lecteur d'Arcane, gestionnaire de Tilt, drapeau,
réglages, badge), `destiny-stat.mjs` (le chemin devient exportable),
`lexicon.mjs` (badge), `labels.mjs` (le mot du badge).

**Chemin commun** — `src/play/session.mjs`, **une seule fonction** : `rollInput`
construit la même liste fermée que `configure`. Générique, ne nomme aucun
module, corrige une divergence contrat/code mesurée.

**Contrat** — `contracts/play.md` : la Vibration corrigée, le Tilt décrit
(verbes, drapeau, table, refus), `character` rectifié, le compte des badges,
la suite qui fait foi, quatre points ouverts.
**Non ratifié — c'est le geste de l'architecte, avant merge.**

**Suites** — `play-harness.mjs` (`fhCharacter()`), `fh-destiny`, `play-settlement`,
`play-roller-state-machine`, `play-roll-vocabulary`, `play-srd-only`,
`guards-adversarial`, `source-scan.mjs`.
