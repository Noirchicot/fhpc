# INVENTAIRE — Lot 43 `43-inheritance-moteur`

Base : `main` à `cf31ddb`. Tests au départ : **694**, tous verts. Tests à
l'arrivée : **708**, tous verts (`npm test`).

---

## 1. Quelle couche j'ai choisie pour l'Inheritance, et pourquoi (§3a.3)

**J'ai réutilisé `fh-skills-en`, pas créé de couche neuve.**

Mesure d'abord : `layers/fh-skills-en.layer.json` n'est **pas hand-authored** —
il est **généré** par `src/tools/gen-fh-skills-layer.mjs` à partir de la
source déclarée `src/tools/fh-skills-source.mjs`, avec un test de
reproductibilité qui compare le fichier commité octet à octet à ce que le
générateur produit (`tests/fh-skills.test.mjs`, « le fichier commité est
EXACTEMENT ce que le générateur produit »). Ce fichier portait déjà, depuis le
lot 35, les quatre `patch` qui retiraient `skill_ids`/`tool_id`/`tool_choice`
des arrière-plans SRD — c'est-à-dire qu'il était **déjà le foyer canonique de
toute la transition d'arrière-plan**, avant même ce lot.

Deux options se présentaient :
1. Étendre `fh-skills-en` : passer les quatre `patch` en `disable`, ajouter
   `fh:background:en:inheritance` dans la même section.
2. Créer une nouvelle couche `fh-inheritance-en` dédiée, hand-authored comme
   `fh-feats-en`.

J'ai choisi (1). Raisons :
- **Une seule transition, un seul foyer.** Séparer « ce qui éteint les
  quatre » (déjà dans `fh-skills-en`) de « ce qui les remplace » (une couche
  neuve) aurait éclaté en deux fichiers un geste qui est un seul fait : les
  arrière-plans du SRD n'existent plus, et voici ce qui les remplace.
- **Pas d'ambiguïté d'ordre entre deux couches sur le même genre.** Une
  couche `fh-inheritance-en` montée par-dessus `fh-skills-en` aurait dû
  `disable` des records que `fh-skills-en` patchait déjà — deux couches qui
  se disputent le même genre `background`, pour un seul résultat. Une seule
  couche qui fait les deux gestes (`disable` + `add`) dans le même passage du
  générateur ne pose pas la question.
- **Le patron `disable` existait déjà dans ce fichier même**, pour
  Perception (lot 22) — je l'ai repris identique (`{op:"disable", reason}`),
  pas réinventé.

Coût mesuré de ce choix : j'ai dû toucher `src/tools/gen-fh-skills-layer.mjs`
et `src/tools/fh-skills-source.mjs` — **hors du terrain déclaré par la
commande** (`layers/`, `src/build/`, `examples/`, `contracts/`, `tests/`).
Voir §3 (« ce qui m'a surpris ») pour la mesure complète de ce débordement et
pourquoi je l'ai jugé nécessaire plutôt que de le contourner en silence.

`Auspicious (fh)` a reçu `category: "origin"` directement dans
`layers/fh-feats-en.layer.json` (hand-authored, pas de générateur pour ce
fichier) — une ligne, comme prévu au §3b.

---

## 2. Ce que la migration de l'exemple a déplacé

### `examples/personnage-fh-en-niveau1.fh-char.json` (généré par `src/tools/exemple-fh-en.mjs`)

- **Retiré** : `{path:"background", ref:{kind:"background", id:"srd:background:en:sage"}}`.
  Lecture littérale du §3e (« Retire son `background` mort, garde son
  `background.originFeat[0]`… et ses `background.boost.*` » — trois verbes,
  pas un quatrième « remplace-le par une référence à l'Inheritance »). Aucun
  choix `background` ne subsiste dans le document : c'est le vrai
  démonstrateur du repli à une option de `decisions.mjs` (§1a/§0.1), pas
  seulement une suite dédiée.
- **Gardé, inchangé** : `background.originFeat[0]` (`fh:feat:en:auspicious`)
  et `background.boost.int`/`background.boost.con`.
- **Mesuré après régénération** (`node src/tools/exemple-fh-en.mjs`) :
  - Score de Destinée : **10** (inchangé).
  - Skill Points : **10** (inchangé).
  - `resolved.identity.background` : disparaît (`"Sage"` → absent, déclaré
    `underived.no-choice`) — `derive.mjs` a sa PROPRE résolution de
    `backgroundRef` (`takeRef("background")`), indépendante du repli de
    `decisions.mjs`, et je ne l'ai délibérément pas touchée (voir §3).
  - `underived.length` : **19 → 17**. Le détail exact (mesuré, pas déduit) :
    - `identity.background` gagne une déclaration (`underived.no-choice`,
      +1) — avant, le nom du record était recopié tel quel, pas de refus à
      formuler.
    - Le bloc `imposedLines` de `skill-pool.mjs` perd deux déclarations : les
      trois qu'il portait pour un arrière-plan choisi mais sans
      `skill_ids`/`tool_id`/`tool_choice` (`skillpool-background-missing-
      skill-ids`, `skillpool-background-missing-tool`,
      `skillpool-class-tools-unmechanical`) se réduisent à UNE seule
      (`skillpool-no-background-ref`), quand `backgroundRef` est absent. Net :
      3 → 1, soit −2.
    - Total : +1 −2 = **−1**… mais la mesure réelle est −2 (19→17) : le
      champ `tools` gagne aussi une réduction similaire (le bloc dédié de
      `derive.mjs` déclare `underived.background-missing-tool-field` quand
      `backgroundView` existe sans `tool_id`/`tool_choice` ; absent, ce
      bloc ne déclare rien du tout — remplacé par la déclaration
      inconditionnelle plus bas dans le fichier, `underived.no-tool-granted`,
      qui existait déjà). Le compte final (17) est celui **mesuré par la
      suite**, pas recalculé à la main ici — `tests/underived-labels.test.mjs`
      §4 le vérifie sur chaque exécution.

### `examples/personnage-srd-fr-niveau1.fh-char.json` (hand-authored, cible d'acceptation SRD pur de ~13 suites)

- `background.feat` → `background.originFeat[0]` (le choix ET la clef
  `build.external.ddb.entityIds`). **Ce fichier n'est pas l'exemple FH** —
  c'est le personnage SRD pur que presque toute la suite utilise par défaut
  (`makeHarness()` sans option = `[SRD_FR, HOMEBREW]` +
  `acceptanceDocument()`). §1b retire `background.feat` **sans distinction
  SRD/FH** (« aucun consommateur ne le lit » est un fait général, pas
  spécifique à l'Inheritance) : ce fichier devait suivre, sous peine de
  laisser la condition de sortie n°6 non vérifiable.
- `resolved` (le détail figé du personnage) : **non touché** — rien dans sa
  forme ne cite le chemin de choix, et aucune suite ne le recompare au
  document reconstruit à cet endroit précis.

---

## 3. Ce qui m'a surpris

1. **Deux artefacts sont générés, pas écrits à la main, et la commande ne le
   savait pas.** `layers/fh-skills-en.layer.json` et
   `examples/personnage-fh-en-niveau1.fh-char.json` sont TOUS DEUX produits
   par des scripts sous `src/tools/` — hors du terrain déclaré. Éditer
   seulement les fichiers `layers/`/`examples/` sans toucher leurs
   générateurs aurait cassé DEUX gardes de reproductibilité déjà verts
   (`tests/fh-skills.test.mjs` et `tests/render-fiche.test.mjs`). J'ai choisi
   de toucher `src/tools/gen-fh-skills-layer.mjs`, `src/tools/
   fh-skills-source.mjs` et `src/tools/exemple-fh-en.mjs` plutôt que de
   laisser ces gardes rouges ou de les affaiblir — la commande demande
   explicitement de disable les records et de migrer l'exemple (§3a, §3e),
   et il n'existe pas de façon de le faire sans ce débordement mesuré. Je le
   signale plutôt que de le taire.

2. **`background.feat` était plus utilisé que « aucun consommateur ne le
   lit » ne le laissait penser.** La mesure du §1b (« aucun consommateur ne
   le lit ») porte sur la DÉRIVATION — vraie. Mais le CHEMIN lui-même était
   exercé par ~13 fichiers de suite via le personnage SRD pur d'acceptation,
   et nommément par trois d'entre eux
   (`tests/build-decisions.test.mjs`, `tests/build-derive.test.mjs`,
   `tests/build-violations.test.mjs`). Le retirer a demandé de migrer le
   personnage d'acceptation, pas seulement le moteur.

3. **Le nouveau garde du total (§1d) casse tout fixture qui ne posait pas de
   boost.** Une fois `background.boost-total-mismatch` unconditionnel (0
   point posé ⇒ refus), neuf scénarios de `fh-skill-pool*.test.mjs` et
   `fh-skill-tiers.test.mjs` — qui ne testent PAS les boosts, mais le pool ou
   les paliers — ont commencé à faire échouer leur propre `validate()`. J'ai
   ajouté `background.boost.int`/`.con` (+2/+1, légal) aux `choixDe()`
   partagées de cinq fichiers. C'était prévisible a posteriori (le même
   patron existe déjà pour `skill-grant.count-mismatch`, qui mord aussi à
   zéro réponse) mais pas anticipé dans la commande.

4. **`skill-pool.mjs` porte un défaut latent que ce lot expose sans le
   corriger.** `imposedLines()` (dans `src/modules/fh/skill-pool.mjs`, hors
   de mon terrain) fait un `return` anticipé quand `backgroundRef` est
   absent — AVANT le bloc qui pose les deux lignes « net zéro » d'un
   `granted_skill_choice` d'espèce (Araag, Humain « Skillful ») et avant la
   déclaration `skillpool-class-tools-unmechanical`. Mesuré : ça ne change
   AUCUN nombre publié (les deux lignes net-zéro s'annulent par construction,
   leur absence ne bouge donc pas `fh:skill-points`), seulement des lignes de
   détail et une déclaration informative, pour un personnage Araag/Humain
   SANS choix `background` posé. Aucun test existant (avant ou après ce lot)
   n'exerce cette combinaison précise (Araag/Humain + zéro choix
   `background`), donc rien ne rougit. Je ne l'ai **pas corrigé** — hors
   terrain, aucun nombre faux, et la commande ne le nomme pas. Signalé ici
   pour que ce ne soit pas une découverte à refaire.

5. **Une TROISIÈME instance du « même refus deux fois »**, que je n'ai pas
   corrigée. `block.mjs` porte un bloc séparé (lignes ~449-472) qui recalcule
   `background.ability-key-invalid`/`background.boost-disallowed`
   INDÉPENDAMMENT de `decisions.mjs::backgroundBoostPlan` — pour un
   arrière-plan SRD **explicitement choisi** avec un `ability_keys` et un
   boost hors catalogue, les DEUX chemins produisent la même violation, et ma
   déduplication (qui ne porte que sur la boucle `projectDecisions` de
   `validate()`) ne la voit pas — c'est un DEUXIÈME point d'entrée dans
   `reported`, pas un doublon au même point. Hors mandat de ce lot (§3e-bis
   ne nomme que `class.skills`/`species.skills` et
   `background.feat-mismatch`), donc non touché — mais c'est la même famille
   de défaut, et il vaut la peine d'être su.

---

## 4. Ce que j'ai changé de cette commande

1. **§3a.3 — le choix de couche** : rendu ci-dessus (§1). La commande
   demandait de choisir et justifier ; je n'ai pas eu besoin de la
   contredire, seulement de mesurer avant de trancher.

2. **Terrain élargi à `src/tools/` (2 fichiers de générateur + 1 générateur
   d'exemple), par nécessité mesurée, pas par confort.** Voir §3.1. Je ne l'ai
   pas fait en silence : c'est nommé ici, et le diff de ces trois fichiers est
   strictement celui qu'imposent §3a et §3e de la commande — rien de plus.

3. **`examples/personnage-srd-fr-niveau1.fh-char.json` migré aussi**, alors
   que la commande ne nomme que l'exemple FH (§3e). Nécessaire pour que la
   condition de sortie n°6 soit VÉRIFIABLE (pas seulement vraie en théorie) —
   voir §2 et §3.2.

4. **Le sens du garde « total » du §1d, inféré, pas dicté.** La commande
   demande un refus sur le total « qui ne vaut pas exactement 3 » et liste
   quatre attaques dont une (« un total de 2 ») est un DÉFICIT, pas un excès.
   J'ai donc fait mordre `background.boost-total-mismatch` dans les DEUX sens
   (trop et pas assez), y compris à 0 (aucun boost posé) — sur le patron déjà
   en place de `skill-grant.count-mismatch`, qui mord aussi à 0. La commande
   ne le dit pas en toutes lettres ; je l'ai déduit de son propre exemple
   d'attaque plutôt que de laisser un total de 2 sans refus.

5. **Les noms des deux clefs neuves** (`background.boost-cap-exceeded`,
   `background.boost-total-mismatch`) sont de mon choix — la commande
   demande « deux clefs nommées, sur le patron du lot 37 », sans dicter les
   noms.

6. **`REFUS — un retrait dans le vide` (deux tests de `fh-skills.test.mjs`)
   retirés plutôt que réécrits.** Ils prouvaient un `patch/remove` qui
   n'existe plus (`disable` n'a pas de champ à retirer partiellement) ; le
   garde qu'ils protégeaient (un retrait dans le vide crie) est déjà couvert
   par le test « REFUS — un arrière-plan du SRD oublié par la table
   d'extinction », qui exerce exactement le même chemin de code
   (`srdRecord()` sur un id introuvable) sans dupliquer le montage.

Aucun des quatre points de contrat (§1a-d) ne s'est révélé faux à la mesure :
les quatre tiennent tels quels. Rien à contester sur le fond de l'architecture
— seulement les débordements de terrain ci-dessus, mesurés et nommés plutôt
que devinés.

---

## 5. Les tests

- **Départ** : 694 (rejoué, vert).
- **Arrivée** : 708 (rejoué, vert).
- Nouveau fichier : `tests/inheritance-lot43.test.mjs` — 18 tests,
  l'acceptation du lot §4 point par point (les neuf items) plus les
  attaques du §0.4 et du §3e-bis.
- Fichiers modifiés pour suivre la migration (comptés, pas devinés) :
  `tests/build-decisions.test.mjs`, `tests/build-derive.test.mjs`,
  `tests/build-violations.test.mjs`, `tests/fh-skill-pool.test.mjs`,
  `tests/fh-skill-pool-tools.test.mjs`, `tests/fh-skill-pool-guards.test.mjs`,
  `tests/fh-skill-pool-training.test.mjs`, `tests/fh-skill-tiers.test.mjs`,
  `tests/fh-skills.test.mjs` (réécriture de la section arrière-plan),
  `tests/skills-step.test.mjs`, `tests/underived-labels.test.mjs`.

### L'attaque manuelle

Neutralisé le repli à une option dans `projectDecisions`
(`src/build/decisions.mjs`, la ligne `if (onlyOption.length === 1)
backgroundView = onlyOption[0];` → `if (false && …)`). Suite complète
rejouée : **13 tests rougissent, tous et seulement dans
`tests/inheritance-lot43.test.mjs`** (§4.1, les deux du §4.2, les quatre du
§4.3, les deux du §4.4, les trois du §4.5) — zéro collatéral ailleurs dans
les 708. Confirme que ce repli est bien LA seule chose qui manquait, et que
rien d'autre n'en dépendait en secret (notamment : le Score de Destinée et le
pool de l'exemple, §4.9, restent verts — ils passent par un canal
indépendant, `refs`, jamais par ce repli). Restauré par `cp` depuis une copie
tampon ; `git diff src/build/decisions.mjs` après restauration montre
exactement mon travail de lot, rien de l'attaque. Suite complète rejouée une
troisième fois : 708/708.

---

## 6. Ce que je rends

- Ce fichier.
- Working tree modifié (voir `git status`/`git diff --stat`) — commits à
  suivre sur `43-inheritance-moteur`, arbre propre, aucun `push`.
