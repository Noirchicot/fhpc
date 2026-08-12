# Inventaire — lot 41 `underived-clefs`

> Livrable qui survit au lot (commande §5). Écrit le 2026-08-13, à la fin du
> lot. Chiffres mesurés dans ce document, pas recopiés — chacun est
> reproductible en relançant `npm test` ou `node --test tests/underived-labels.test.mjs`.

---

## 0. Le STOP, et pourquoi ce document a deux vies

Ce lot a **refusé d'écrire une ligne de code** à sa première mesure : la
commande disait « 56 appels, tous dans `src/build/derive.mjs` », et le
balayage réel a trouvé **77 sites sur quatre fichiers**, dont 19 dans deux
modules FH que la commande ne nommait pas. La première version de ce fichier
était donc un rapport de blocage, remis SANS code, demandant à l'architecte de
trancher le périmètre.

**L'architecte a vérifié, confirmé les 77 sites, et étendu le périmètre aux
quatre fichiers** (message du coordinateur, 2026-08-13, section « CORRECTION
DU 2026-08-13 » ajoutée à la commande). Ce document est la version FINALE,
écrite après un lot terminé sur ce périmètre étendu.

---

## 1. Départ → arrivée

| | |
|---|---|
| Tests au départ (`npm test`, mesuré avant la première ligne de code) | **670 verts, 0 rouge** |
| Tests à l'arrivée | **684 verts, 0 rouge** (670 + 14 dans `tests/underived-labels.test.mjs`) |
| Fichiers neufs | `tests/underived-labels.test.mjs` · ce fichier |
| Fichiers modifiés | `src/labels.mjs` · `src/build/derive.mjs` · `src/build/skills.mjs` · `src/build/block.mjs` · `src/mcp/tools.mjs` · `src/modules/fh/destiny-stat.mjs` · `src/modules/fh/skill-pool.mjs` · `src/modules/fh/labels.mjs` · `src/tools/render-fiche.mjs` · `contracts/build.md` · `contracts/mcp.md` · 9 fichiers de test (§6) |
| `examples/*.fh-char.json` | **intouchés** (`git diff --stat examples/` : rien) — le document reste propre, mesuré, pas juste affirmé |

---

## 2. Le compte des clefs distinctes contre les 77 sites, et comment j'ai groupé

| | Sites | Clefs distinctes |
|---|---|---|
| Générique (`src/build/derive.mjs` + `src/build/skills.mjs`) | 58 | **55** |
| FH (`src/modules/fh/destiny-stat.mjs` + `src/modules/fh/skill-pool.mjs`) | 19 | **21** |
| **Total** | **77** | **76** |

Groupé par ce que chaque site DIT, pas par sa position :

- **Vrais doublons** (même phrase exacte, sites différents) : un seul,
  `underived.no-choice` (params `{root}`), qui couvre les 5 sites qui disaient
  littéralement « aucun choix `X`. » (espèce ×3, arrière-plan ×1, sur
  `identity.species`/`identity.size`/`speeds`/`identity.background`/`senses`).
  C'est la SEULE consolidation réelle de ce lot.
- **Deux clefs par site ternaire** : 3 sites (un en `derive.mjs` — la table
  de progression —, un en `derive.mjs` — les sens sans espèce vs sans
  couche —, deux dans les modules FH — dons sans choix vs dons sans bonus,
  ×2) rendaient DEUX phrases différentes selon une condition ; chaque branche
  a sa propre clef, jamais une seule clef avec un `context` fourre-tout — un
  `context` enum aurait demandé à la table de mots de RECOMPOSER la
  différence de sens, ce que `createLabels` n'est pas fait pour porter
  proprement (une entrée est UNE chaîne ou UNE fonction de `params`, jamais
  un aiguillage de phrases).
- **Le reste (≈ 70 sites) : une clef par site.** Ce dépôt écrit une
  justification bespoke à chaque refus (contrat cité, question à
  l'architecte, mesure datée) ; au-delà du doublon ci-dessus, forcer une
  consolidation aurait fait mentir un site sur un autre — exactement l'erreur
  que la commande interdit (« groupe par ce qu'elles DISENT »). **76 clefs
  pour 77 sites n'est donc pas un échec de groupement : c'est la mesure d'un
  code déjà peu redondant.**

Détail des deux groupements ternaires :
- `underived.progression-field-missing-at-level` / `underived.no-progression-record`
  (un seul site, `derive.mjs`, proficiency).
- `underived.species-no-senses` / réemploi de `underived.no-choice` (un seul
  site, `derive.mjs`, senses).
- `underived.fh.destiny-feat-no-choice` / `underived.fh.destiny-feat-no-bonus`
  (`destiny-stat.mjs`).
- `underived.fh.skillpool-feat-no-choice` / `underived.fh.skillpool-feat-no-bonus`
  (`skill-pool.mjs`).

---

## 3. Le sort du `toString` du lot 27

**Repris — et il s'est avéré indispensable, pas juste pratique.**

Chaque entrée (`underivedEntry(field, key, params, render)`, `src/labels.mjs`)
porte un `toString` non énumérable lié, **au moment de sa construction**, à
la table de SA propre origine :
- `derive.mjs`/`skills.mjs` le lient à `createLabels(FR_UNDERIVED)` ;
- `destiny-stat.mjs`/`skill-pool.mjs` le lient à `createLabels(FH_UNDERIVED_FR)`.

Deux endroits en dépendent **réellement**, pas par confort :

1. **`src/build/block.mjs`** (le rendu `warnings[]` de `validate`) reçoit des
   entrées `underived` dont il ne peut PAS savoir si elles viennent du pli
   générique ou d'un module FH — et §0.12 lui interdit d'importer
   `src/modules/fh/labels.mjs` pour trancher. La coercition `${entry}` résout
   ça sans qu'il importe un seul mot de couche.
2. **`src/mcp/tools.mjs`** — MESURÉ EN COURS DE LOT : j'avais d'abord importé
   `FH_UNDERIVED_FR` directement dans ce fichier pour composer le texte MCP.
   `tests/mcp-block.test.mjs` (GARDE 1, « le domaine ») a rougi : il interdit
   déjà `../modules/` dans `src/mcp/`, pour la même raison que §0.12 le fait
   pour `src/build/`. Le `toString` de chaque entrée a réglé ça exactement
   comme au point 1 — sans lui, il aurait fallu soit violer ce garde, soit
   inventer un TROISIÈME mécanisme (un « rendu neutre » séparé), ce que la
   commande interdit nommément (§3d).

⚠️ **Un bug réel, trouvé et corrigé grâce à ce garde.** La boucle de recopie
de `derive.mjs` (`for (const entry of outcome.underived) underived.declare(...)`)
RECONSTRUISAIT d'abord chaque entrée FH via `Underived.declare()`, qui lie
TOUJOURS son `toString` à la table générique par défaut — écrasant le rendu
FH d'origine. `renderUnderived` jetait alors « no label for
"underived.fh.destiny-arcana-layer-not-mounted" » au premier personnage FH
construit (`tests/skills-step.test.mjs`, entre autres, l'a vu). Corrigé en
donnant à `Underived.declare()` un quatrième paramètre `render` optionnel ;
la boucle de recopie transmet `() => entry.toString()` — l'entrée garde SON
rendu, `derive.mjs` ne le réécrit jamais. C'est la même variante de faute que
la « faute de l'architecte » du §0 : mesurer la bonne FORME (`{key, params}`)
sans mesurer que la RECONSTRUCTION effaçait un canal existant.

---

## 4. §3d — un mécanisme de mots, ou deux ?

**Un seul mécanisme (`createLabels`/`underivedEntry`/`renderUnderived`,
`src/labels.mjs`), deux PAQUETS par langue, composés au point de lecture** —
exactement la proposition acceptée par l'architecte, et déjà à moitié en
place avant ce lot (`src/play/labels.mjs` réexportait déjà `createLabels`
depuis la racine).

| Étage | Où | Sites couverts |
|---|---|---|
| Générique | `src/labels.mjs` — `FR_UNDERIVED`/`EN_UNDERIVED` | 58 (`derive.mjs` + `skills.mjs`) |
| FH | `src/modules/fh/labels.mjs` — `FH_UNDERIVED_FR`/`FH_UNDERIVED_EN` | 19 (les deux modules) |

Composition au point de lecture, mesurée dans trois consommateurs différents,
chacun avec une contrainte différente :

- **`src/tools/render-fiche.mjs`** (l'écran) : compose les deux paquets par
  langue (`UNDERIVED_T_FR`/`UNDERIVED_T_EN`) — c'est la SEULE frontière du
  dépôt qui a le droit de connaître les deux à la fois (aucun garde
  structurel ne le lui interdit), parce que c'est elle qui doit rendre N'IMPORTE
  QUELLE entrée d'un personnage FH, dans la langue choisie.
- **`src/build/block.mjs`** et **`src/mcp/tools.mjs`** : n'importent AUCUN
  paquet — ils lisent le `toString` déjà lié à chaque entrée (§3).

Zéro troisième système : aucun fichier ne réinvente une table de mots pour
`underived` en dehors de ces quatre exports.

---

## 5. Ce qui est TRANCHÉ, inchangé

Identifiants dans le moteur, mots à l'interface (§0.13) ; `declare(field, key,
params)` ; forme `{field, key, params}` (pas de `path` — `underived` déclare
un champ, il n'accuse jamais un chemin de choix) ; préfixe `underived.`
(`underived.fh.` pour la couche FH) ; le français reste un paquet parmi deux ;
le document `fh-char/1` ne gagne aucune clef.

---

## 6. La liste NOMMÉE des 24 tests existants qui basculent

Chacun marqué `REWRITTEN 2026-08-13 (lot 41)` **sur sa propre ligne**, avec sa
raison, dans le fichier (loi §0.7). Aucun n'est un relâchement : chacun relit
la MÊME garantie via `renderUnderived(entry, table)` ou `String(entry)`
plutôt que `entry.reason` (qui n'existe plus).

| Fichier | Test |
|---|---|
| `tests/build-derive.test.mjs` | SANS LES CHAMPS MÉCANIQUES DU §3, rien n'est deviné : tout ce qui manque est nommé |
| `tests/build-derive.test.mjs` | UN RECORD D'ESPÈCE SANS `traits` est déclaré — et la privation est DÉLIBÉRÉE |
| `tests/build-derive.test.mjs` | un outil sans `ability_key` est SAUTÉ et NOMMÉ — jamais émis à moitié |
| `tests/build-derive.test.mjs` | la CA avec armure, et son refus platement quand le champ mécanique manque |
| `tests/build-decisions.test.mjs` | une compétence sans `ability_key` reste illégale pour le pli ET pour la projection |
| `tests/build-acceptance.test.mjs` | CE QUE LA PILE NE SAIT PAS NOURRIR N'EST PAS DEVINÉ — et `rebuild` le DIT |
| `tests/fh-arcana.test.mjs` | LE DON N'EST PLUS SIGNALÉ COMME INERTE — il compte, donc il est RÉCLAMÉ |
| `tests/fh-arcana.test.mjs` | ACCEPTATION 2 — SANS LA COUCHE DES CARTES, aucun nombre n'est fabriqué : le terme se DÉCLARE |
| `tests/fh-arcana.test.mjs` | SANS LA COUCHE DES DONS, le don se DÉCLARE aussi — et le reste du Score tient |
| `tests/fh-arcana.test.mjs` | SANS CARTE NOMMÉE, le terme se déclare en nommant LE CHOIX — pas un contenu absent |
| `tests/fh-destiny-score.test.mjs` | CE QUI N'EST DÉRIVABLE DE RIEN EST DÉCLARÉ — jamais fabriqué |
| `tests/fh-destiny-score.test.mjs` | DRAPEAU ÉTEINT, MODULE MUET — et les choix de séance le disent au lieu de disparaître |
| `tests/fh-destiny-score.test.mjs` | ACCEPTATION 3 — un personnage SRD PUR rend `stats: []`, et rien ne cite la Destinée |
| `tests/fh-destiny-score.test.mjs` | UNE ESPÈCE SANS BASE DE DESTINÉE SE DÉCLARE — le moteur ne lui invente pas un 2 |
| `tests/fh-destiny-score.test.mjs` | SANS ESPÈCE, LA BASE SE DÉCLARE — poser 2 ferait passer la valeur d'Eric pour une règle du moteur |
| `tests/fh-destiny-score.test.mjs` | SANS MAÎTRISE DÉRIVÉE, LE TERME SE DÉCLARE — 0 rendrait un Score plus bas sans un mot |
| `tests/fh-destiny-score.test.mjs` | LE MODULE NE S'ALLUME QUE SUR SON DRAPEAU — monté sans la couche, il ne publie rien |
| `tests/fh-skill-pool.test.mjs` | ACCEPTATION 4 — couche FH débrayée : `stats` est VIDE et la déclaration le dit |
| `tests/fh-skill-pool.test.mjs` | ACCEPTATION 5 — drapeau levé, couche des compétences absente : le terme se DÉCLARE |
| `tests/fh-skill-pool.test.mjs` | ACCEPTATION 8 — un don SANS `data.skill_points` ne casse rien : seize dons du SRD traversent muets |
| `tests/mcp-acceptance.test.mjs` | ⚠️ `underived` TRAVERSE JUSQU'À L'IA — dans le structuredContent ET dans le texte |
| `tests/render-fiche.test.mjs` | privé d'une rubrique, l'écran affiche la RAISON du moteur — jamais un blanc |
| `tests/render-fiche.test.mjs` | aucune déclaration `underived` n'est perdue entre le moteur et l'écran |
| `tests/render-fiche-en.test.mjs` | privé d'une rubrique, l'écran anglais affiche la RAISON en anglais — jamais un blanc, jamais du français *(renommé — voir §7)* |

---

## 7. Un renommage de test, pas seulement une réécriture — et pourquoi

`tests/render-fiche-en.test.mjs` portait un test titré « … affiche la RAISON
**du moteur** — jamais un blanc » avec pour preuve : « et la RAISON, mot pour
mot, telle que le moteur l'a écrite — **le moteur ne traduit rien** ». C'était
vrai avant ce lot, et c'était **le défaut que ce lot corrige** : la page
anglaise affichait une raison FRANÇAISE, parce que le moteur ne parlait que
français. Garder ce test tel quel après le lot l'aurait fait mentir dans
l'autre sens — ou pire, il serait resté vert en prouvant l'ANCIEN comportement
si j'avais seulement changé `.reason` en `String(entry)` sans toucher au
fond. Il est donc renommé **« … affiche la RAISON en anglais — jamais un
blanc, jamais du français »**, et sa preuve compare maintenant contre
`renderUnderived(declaration, EN_UNDERIVED+FH_UNDERIVED_EN)`, avec une
assertion neuve (`doesNotMatch(raisonEn, /[«»]|aucun module de statistique/)`)
qui vérifie explicitement que ce n'est plus la citation française.

---

## 8. Les deux attaques manuelles (commande §4, dernier paragraphe)

**Attaque 1 — le garde de parité (§3).** `underived.no-choice` retiré de
`FR_UNDERIVED` (copie temporaire de `src/labels.mjs`, restaurée après).
Résultat : **3 tests rougissent, tous dans `tests/underived-labels.test.mjs`**
(§1 citation, §3 parité, et le test d'attaque du §3 lui-même, qui collisionne
avec la même clef) — rien d'autre dans les 684. `diff` byte-à-byte après
restauration : **identique**. Suite rejouée : **684 verts**.

**Attaque 2 — le garde anti-prose (§5).** Un fragment français
(« aucun module d'artisanat n'existe. ») glissé dans le mot ANGLAIS de
`underived.no-craft-module` (`EN_UNDERIVED`). Résultat : **exactement 1 test
rougit** — `§5 — ⚔️ ATTAQUE : le carnet rendu (anglais) du personnage
d'exemple ne porte aucune prose française`. `diff` byte-à-byte après
restauration : **identique**. Suite rejouée : **684 verts**.

---

## 9. Ce que j'ai changé de la commande, et pourquoi

1. **Le périmètre de fichiers** : étendu de `src/build/derive.mjs` seul aux
   quatre fichiers mesurés (§0 de la commande corrigée) — décision de
   l'architecte après le STOP de ce lot, pas la mienne.
2. **Aucun troisième mécanisme de mots** : la question posée au §3d a reçu la
   réponse acceptée (un mécanisme, deux paquets), sans modification depuis.
3. **`underived.no-choice`** : seule vraie consolidation (5 sites → 1 clef).
   Je n'ai PAS forcé d'autres regroupements plus agressifs (ex. fusionner les
   quatre variantes de « le bonus de maîtrise n'a pas été dérivé » sous une
   seule clef à `context`) parce que leurs phrases COMPLÈTES divergent, et
   qu'un `context` enum aurait demandé à la table de mots de recomposer un
   sens que `createLabels` (une chaîne OU une fonction de `params`, jamais un
   aiguillage) ne porte pas proprement — décision d'architecture mineure,
   documentée ici plutôt que remontée, parce qu'elle ne change ni la forme du
   contrat ni le compte final au-delà de ce qui est écrit au §2.
4. **Le renommage d'un test** (§7) plutôt qu'une simple réécriture d'assertion
   — parce que son ANCIEN nom et son ANCIEN commentaire de preuve
   décrivaient, comme un fait acquis, exactement le défaut que ce lot répare.

Aucune règle de jeu n'a bougé. Aucun `git push`. Aucune fusion.
