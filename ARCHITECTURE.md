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

Manifeste + records par genre — **15 genres**, dont 14 viennent de `fh-srd`
(armor, background, class, class-progression, feat, gear, glossary, item,
monster, skill, species, spell, tool, weapon ; `skill` et `class-progression`
sont arrivés avec le lot `6-srd-tables` le 2026-08-08) **et un vient de Fate's
Hand : `arcana`**, ouvert par révision d'architecte le 2026-08-09 pour porter
les 22 Arcanes majeurs. C'est le premier genre qui n'existe dans aucun SRD, et
la frontière qu'il pose vaut pour tous ceux qui suivront : le générateur de la
couche SRD garde **sa propre liste de 14** et ne produit jamais un genre FH.
Une couche **ajoute** des records, **patche** un
record par id, **désactive** un record, **lève des drapeaux de capacités**
(ex. `fh.destiny`). Jamais d'exécutable — un homebrew d'inconnu est inoffensif
à charger. Les mécaniques nouvelles sont des **modules moteur** activés par les
drapeaux, pas du contenu de couche (décision Q4).

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
