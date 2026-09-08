# FHPC v2 — Architecture canonique

> Transplanté depuis `fh-phb/FHPC-V2-KICKOFF.md` §1 le 2026-08-07, lot J0.
> Miroir : vault `7.CLAUDE AND ERIC LOGBOOK/Chantier FH & FHPC/FHPC v2 — Architecture.md`.
> Ceci est la copie vivante côté dépôt.

### Le produit

Constructeur de personnage indépendant sur SRD 5.2, couches de règles
empilables (FH livrée, homebrew par MJ). Thèse : « le joueur peut se balader
partout avec ses persos et les tweaker. » FHPC est un serveur MCP ; l'IA du
joueur porte le perso dans les VTT. Le personnage appartient au joueur, la
campagne au MJ. Date dure unique : **2026-11-07, la table d'Eric joue**.

### Le document `fh-char/1` — deux étages, un fichier JSON

- **`resolved`** : la fiche jouable, valeurs finales uniquement (CA, PV,
  compétences, actions, sorts avec DD/bonus calculés, ressources comptées,
  vitals persistants). Aucun pointeur vers des règles. Joue sans ses couches,
  et **le dit** (dégradation bruyante).
- **`build`** : manifeste des couches (`{id, version, hash}`), choix,
  **overrides de première classe** (`{path, value, note, by}`) appliqués en
  dernier. « La parole du MJ bat le JSON » ; les tweaks survivent à toute
  reconstruction ; l'écart règles↔décision est affichable, jamais écrasé.

Règles : (1) `resolved` n'est écrit que par la dérivation — pli de la pile
SRD → FH → homebrew → overrides ; (2) un seul chemin d'édition avec ou sans
couches : l'override ; (3) ouvert sans ses couches : `resolved` joue, `build`
reste inerte et intact, les couches manquantes sont listées et affichées.

### Les couches `fh-layer/1` — données, jamais du code

Manifeste + records par genre — la liste vit dans `src/layers/document.mjs`
(`GENRES`) et dans `schemas/fh-layer.schema.json`, tenues ensemble par un garde
de dérive. La plupart viennent de `fh-srd` (armor, background, class,
class-progression, feat, gear, glossary, item, item-value, class-option,
monster, skill, species, spell, tool, weapon, weapon-mastery, weapon-property ;
`skill` et `class-progression` sont arrivés avec le lot `6-srd-tables` le
2026-08-08), un vient de la couche `srfh` (`shelving`, lot 95 — le rangement
d'Eric), **et trois viennent de Fate's Hand : `arcana`** (2026-08-08, les 22
Arcanes majeurs), **`training`** (2026-08-12) **et `gem`** (2026-09-08, lot 181,
les 54 gemmes d'Eric). `arcana` est le premier genre qui n'existe dans aucun
SRD, et la frontière qu'il pose vaut pour tous ceux qui suivent : le générateur
de la couche SRD ne produit **jamais** un genre FH — il les refuse nommément
(`GENRES_HORS_SRD`).

⚠️ **UN CHIFFRE DE GENRES A ÉTÉ FAUX CINQ FOIS DANS CE DÉPÔT**, ici comme dans
`document.mjs` : « 15 genres, dont 14 » se lisait encore quand il y en avait 21.
Il est retiré plutôt que corrigé une sixième — `GENRES.length` répond, et lui ne
se trompe pas.

⛔ **ET OUVRIR UN GENRE AU CONTRAT DÉSARME UNE PORTE.** Le refus « un genre que
le contrat ne déclare pas » cesse de couvrir un nom à la seconde où on le
déclare. Un genre maison entre donc dans `GENRES_HORS_SRD` **dans le même
commit** que sa ligne du contrat — mesuré au lot 95 (`shelving`), refait au lot
181 (`gem`).
Une couche **ajoute** des records, **patche** un
record par id, **désactive** un record, **lève des drapeaux de capacités**
(ex. `fh.destiny`). Jamais d'exécutable — un homebrew d'inconnu est inoffensif
à charger. Les mécaniques nouvelles sont des **modules moteur** activés par les
drapeaux, pas du contenu de couche (décision Q4).

### La coupe des couches — six interrupteurs, un catalogue (Eric, 2026-09-08)

Une couche est de l'un de **deux genres**, et le genre décide où elle se pilote.

**L'interrupteur** *ajoute ou retire une règle*, et il vit dans l'écran `Rules` du
Menu. Ils sont **six** : `Trainings` · `Skills & tools` · `Inheritance` · `Destiny` ·
`Lore` · `Soulforging`.

**Le catalogue** *offre du contenu*, marqué compatible SRD ou non : `species`, les
lignages, `class`, les sous-classes. Araag, Loroka, Elestu, Hoddon sont du
**homebrew**, pas des règles — c'est la porte homebrew de SOWLREACH.

⚖️ **Un drapeau garde un MODULE ; seule une couche fait disparaître du CONTENU.** Un
drapeau éteint ne consomme rien, les choix restent `unconsumed` (`derive.mjs:1226`) :
éteindre Destiny par drapeau laisserait les 22 Arcanes choisissables et inertes.

📏 **La coupe est mesurée, pas déclarée.** Ce que `fh-species-en` fait aux neuf espèces
SRD se trie sans reste : d'un côté les règles — `destiny` (9×), `granted_skill_budget`
(2×), `skill_points` (2×), `fh_traits` (3×) ; de l'autre le contenu — `lineages` (3×),
`lineage_intro` (2×), `traits[…].text` (6×), `description` (3×). Les 19 lignages ne
portent que `id · name · damage|levels` : **aucune règle FH dedans**. Et le marqueur du
catalogue existe déjà — `mole-people` porte `"fh": true`, `forest-folk` et `rock-folk`
non.

⚠️ **Les trois espèces neuves, elles, mélangent** : Araag met `Fast Learner` (la face
de `skill_points`) et `Soulforged Affinity` dans `data.traits`, là où les neuf SRD
mettent leurs traits FH dans `data[fh_traits]` — le canal séparé que lit
`modules/fh/traits.mjs:66`. **Deux conventions pour la même chose ; l'extraction doit
les ramener à une.**

#### L'arbitrage du 09/09 — l'interrupteur Soulforging reste incomplet, et c'est voulu

**« Le trait `Soulforged Affinity` de l'Araag ne peut pas suivre sa couche : on étend la grammaire
du patch pour qu'une couche puisse AJOUTER un élément dans un tableau, ou on accepte l'interrupteur
incomplet ? » → ON ACCEPTE.** Eric, 09/09 : *« laisse l'Araag incomplet, pas grave. »*

📏 **Le fait, mesuré au lot 179 en appelant la fonction** — pas déduit : `applyChange` refuse de
créer un élément dans un tableau (`src/layers/paths.mjs`, règle 3), *« on désigne un élément
existant par son identité, on n'en crée pas un par un chemin »*. Le trait vit dans `data.traits`
d'un record que `fh-species-en` **ajoute** ; aucune couche au-dessus ne peut l'y remettre.

⇒ **Conséquence assumée, à ne pas re-signaler comme un défaut** : éteindre `fh-soulforging-en`
laisse l'Araag avec un trait qui lui promet de Body Forge une Soulgem, dans un jeu où le
Soulforging n'existe plus. ⛔ **Ce n'est pas un bug à corriger, c'est une dette tranchée.**
📌 Elle se rouvrira d'elle-même le jour où une couche FH devra poser un trait sur une espèce
qu'elle n'a pas créée — c'est **alors** que la clef d'ajout, sœur du `remove` du lot 17, se paiera.

#### Les trois arbitrages du 08/09, chacun avec sa question

**1. « Soulforging : interrupteur ou contenu ? » → INTERRUPTEUR.** Il rejoint `craft`
dans Équipement : un gros catalogue *et* des règles propres à la forge et aux
propriétés des objets magiques. ⚠️ Il n'a **aucun écran aujourd'hui** et il est tissé
dans **5 couches, 10 records** (Araag · l'Elfe · le Wizard · l'outil
`fh:tool:en:soulforging` · 3 sorts dont `identify` et `gentle-repose` patchés) :
**son extraction est un lot AVANT son bouton**.

**2. « Hoddon : espèce neuve ou renommage ? » → NI L'UN NI L'AUTRE, c'est LORE.** *« Tu
pousses le bouton Lore et c'est un gnome. »* Le renommage `name`/`slug`/`data.name` →
`Hoddon`, le trait `Gnomish Lineage` → `Hoddon Lineage`, et `Forest Gnome`/`Rock Gnome`
→ `Forest Folk`/`Rock Folk` appartiennent à la couche **Lore**. Le **lignage
supplémentaire** (`mole-people`) appartient au **catalogue homebrew**. 📏 Le gnome SRD
ne porte aucun `data.lineages` — sa lignée est de la prose dans le trait
`gnomish-lineage` ; FH la structure, en renomme deux, en ajoute une.

**3. « Un contenu qui exige une règle absente ? » → IL S'AFFICHE INERTE, sa règle
manquante NOMMÉE**, jusqu'au jour où on l'ajoute.

⚖️ **La règle de dégradation, dictée le 08/09** : sans la couche `Skills & tools`, **les
points libres deviennent des compétences supplémentaires à répartir à la création.**
📏 L'humain SRD porte `Skillful` — *« proficiency in one skill of your choice »* — donc
**1** ; Araag en donne **2** (confirmé par Eric le 08/09 : *« +2 compétences, au lvl 1
et point »*). ⚠️ La forme FH d'Araag donne 2 points aux niveaux 1, 3 **et** 6
(`skill_points.by_level`) ; la forme dégradée n'en donne que **2, à la création, et
rien ensuite** — une espèce SRD n'accorde pas de compétence aux niveaux suivants.

⚖️ **Et « point » ne se dit pas en SRD.** Un point FH achète un palier
(Novice/Adept/Expert) ; sans la couche, il n'existe plus rien à acheter. La forme
dégradée s'écrit donc en vocabulaire SRD — **une compétence maîtrisée**, soit le
palier Novice — et le compte se lit `skill_points.by_level["1"]`, jamais la somme des
niveaux.

### Les blocs — verbes en entrée, événements en sortie, état privé

Chaque bloc : ses verbes (seul point d'entrée), sa tranche d'état (lui seul
l'écrit), ses événements (seul moyen pour les autres de savoir). Personne ne
lit l'état d'un autre bloc autrement qu'en s'abonnant. Contrat écrit par bloc
dans `contracts/`.

| Bloc | Verbes (échantillon) | État possédé | Événements |
|---|---|---|---|
| `doc` | open, save, list, import, export, duplicate | documents au repos (stockage local) | doc-opened, doc-saved |
| `layers` | register, enable, disable, query(kind, id) | contenu des couches chargées, pile active | layers-changed |
| `build` | choose, set, override, rebuild, validate | tranche `build` du perso ouvert | char-rebuilt (avec diff) |
| `play` | vocabulaire `data-*` v1 nommé : stageDie, roll, addDie, rerollDie, mountDie, giveDie… | état de séance : transaction, pools, main, tray, historique | roll-settled (`fh-roll/1` + `intent`), pool-changed, die-given |
| `table` | share, join, goLive | état de livraison, LIVE/RECENT/OFF | feed-updated, table-status |
| `mcp` | adaptateur : doc/build/play en tools+resources | aucun | — |
| `connect-ddb` | pull, push (détachable, jamais diffusé) | état de liaison | — |

> ⚠️ **`play` est le moteur SRD ; Fate's Hand est une COUCHE montée par
> l'appelant** (loi §0.12, lot `5-moteur-srd-fh`). Les verbes d'une couche —
> `spendDestiny`, `resolvePending`, `settleAwakening`… — **n'existent pas** tant
> qu'elle n'est pas montée : ce n'est pas un interrupteur, c'est une absence
> (§0.6). Une couche s'inscrit sur des MOMENTS, elle n'est jamais appelée.
> Détail : `contracts/play.md` et `COUPE-LOT-5.md`.

UI (consommatrices, jamais propriétaires) : `ui-builder-desktop` (premier,
iPad compris), `ui-builder-mobile` (plus tard, pensé différemment — « on ne
peut pas tout voir en même temps »), vue de jeu minimale (date), dock v1
(gelé, repli). Bibliothèques pures partagées : visuels de dés, lexique de jet.

**Test d'acceptation de la carte** : toute feature écrit l'état d'UN seul
bloc ; les traversées passent par événements. Une feature qui exige d'écrire
deux tranches = bug de découpage, corriger avant de coder.

### Persistance (leçons `fix-panel-persistence`, gravées)

1. Jamais de fusion par `||` — le vide ne bat jamais le rempli sans choix
   explicite de l'utilisateur.
2. Tout rejet bruyant de bout en bout (contre-modèle : `safeOpaque → null`).
3. Une seule liste blanche générée du schéma, client ET serveur — jamais de
   strip silencieux derrière un `200 OK`.
4. L'état de séance (main, sélection, transaction) ne voyage pas ; les
   ressources comptées vivent dans `resolved` et se décrémentent **au
   règlement** (événement), pas par élagage de références.

Baseline du voyage : export/import fichier. Toute synchro : optionnelle et
débranchable.
