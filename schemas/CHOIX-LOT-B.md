# Lot B — choix de forme et trous de schéma

**À ratifier par l'architecte avant fusion de `schemas-v1`.** Branche coupée de
`main` de `fhpc`, worktree `~/tools/fhpc-worktrees/schemas`.

Trois sections : ce que le lot a **décidé** (§1), ce qu'il a **ajouté** au-delà
de l'inventaire imposé (§2), et ce qu'il n'a **pas** su placer (§3 — les trous,
remontés plutôt qu'inventés, loi §0.10).

---

## §1 — Choix de forme pris

1. **Les collections sont des tableaux de records à `id` obligatoire**, sur le
   modèle des `records[]` de `fh-srd` — pas des objets à clefs. Exceptions :
   les six caractéristiques et les six sauvegardes (clefs fixes), et
   `spellcasting.slots` (niveaux 1 à 9). Raison : une couche peut ajouter ses
   propres compétences et ses propres sens ; un jeu de clefs figé les
   rendrait impossibles.

2. **Une seule grammaire de chemin dans tout le système** : segments séparés par
   `.`, sélection par **id** entre crochets. Elle sert aux `overrides` de
   `fh-char/1` et aux `changes` d'un `patch` de `fh-layer/1`. Un override est
   **toujours enraciné dans `resolved`** : changer une règle passe par
   `build.choices`, pas par un override sur `build` (le schéma rejette
   `build.…`).

3. **Un chemin d'override ne peut pas adresser par index.** Les ids de
   `resolved` doivent commencer par une lettre, donc `resolved.skills[0].bonus`
   est rejeté par la forme même du chemin. Côté `build.choices`, `[0]` reste
   autorisé : là, c'est une position de décision (« la première compétence de
   classe »), pas un record.

4. **`attacks` et `actions` fusionnés en une seule collection `actions[]`**, une
   attaque étant une action de catégorie `attack`. Vocabulaire **porté** du
   panneau v1 `fh-panel-actions.js` (`economy` action/bonus/reaction, catégories
   Attack/Check/Damage/Utility), passé en minuscules — ce sont des clefs machine.

5. **Un seul endroit qui compte : `resources[]`.** Un trait, une action ou un
   objet à usages limités ne compte pas lui-même : il pointe sa ressource par
   `resourceId`. Les dés de vie sont une ressource comme les autres. Découle de
   la leçon de persistance n°4 (décrément **au règlement**, pas par élagage).

6. **`craft[]` est namespacé par drapeau.** Chaque entrée porte le `flag` qui
   l'active, et son `data` est une charge utile **opaque**, validée par le module
   moteur propriétaire du drapeau — pas par ce schéma (décision Q4). Le panneau
   reste vide tant qu'aucune couche ne lève de drapeau d'artisanat.

7. **`notes` est une chaîne unique** (fidèle au panneau v1). → voir GAP-NOTES.

8. **`spellcasting` est un bloc unique ou `null`**, conformément à l'inventaire
   imposé (`dc`, `attackBonus`, `slots`, `spells`). Le multiclassage lanceur
   (DD par classe, emplacements partagés) **n'est pas couvert** — question
   ouverte §4.

9. **Le `changes` d'un `patch` est une carte chemin → valeur**, pas un objet à
   fusionner. Aucune sémantique de fusion à deviner, aucune fusion profonde qui
   écrase en silence.

10. **La clef d'un record EST son id** (imposé au §3.2 du kickoff) : les entrées
    ne portent pas de champ `id` interne, qui serait une seconde source de vérité
    capable de diverger de la clef.

11. **`attribution` est obligatoire au niveau de la couche**, surchargeable par
    record (`attribution`, `source`, `contentHash`). Ceci répond au besoin du
    **lot D §5.2** : l'attribution CC-BY peut voyager par record, et le lot D
    n'a pas à s'arrêter. Coût : une couche personnelle doit déclarer sa licence,
    fût-elle `all-rights-reserved`.

12. **`hash` = SHA-256 des octets du fichier de couche**, calculé par le bloc
    `layers` au chargement. Une couche ne contient jamais son propre hash.

13. **« Jamais d'exécutable » est un invariant de schéma, pas un commentaire.**
    `$defs/safeKey` refuse à toute profondeur `__proto__`, `constructor`,
    `prototype`, `script`, `javascript`, `eval`, `exec`, `function` (et leurs
    variantes capitalisées) dans les données de record, dans un `changes` et dans
    la valeur d'un override. La liste est **exacte et ancrée** : aucun faux
    positif sur un mot ordinaire.

14. **Les horodatages sont vérifiés par `pattern`, pas par `format`** : ajv
    n'applique `format` qu'avec `ajv-formats`, et le lot n'introduit **qu'une**
    dépendance de dev.

15. **`$id` en `urn:fhpc:schema:…`** — aucun nom de domaine revendiqué par un
    dépôt public.

16. **Les 12 genres sont énumérés en dur**, côté couche (`records`) comme côté
    référence de choix (`kind`). Un genre inconnu (`spel`, mais aussi `arcana`)
    est un **rejet bruyant**. Les genres FH entrent par une révision explicite
    des deux schémas, pas par un joker.

17. **Les invariants hors portée de JSON Schema sont du code**, pas des
    assertions de test : `src/schemas/invariants.mjs`, module pur zéro-dep,
    consommé par la suite et **à câbler par le bloc `build`**. JSON Schema
    2020-12 ne sait pas dire « unique par champ ».

18. **`ajv` épinglé en 8.20.0**, pas 8.17.1 : la 8.17.1 porte un avis ReDoS
    (GHSA-2g4f-4pwh-qvx6) qu'un dépôt public afficherait. `strict: true`, sans
    aucun opt-out — les schémas ont été écrits pour passer le mode strict, pas
    l'inverse.

---

## §2 — Ajouts au-delà de l'inventaire imposé (ratifier ou couper)

| # | Ajout | Pourquoi | Si coupé |
|---|---|---|---|
| A | racine `lang` | le SRD existe en `fr` et en `en` ; un document mélangé est indétectable sans lui | l'affichage devine la langue des chaînes |
| B | racine `units` (`distance`, `weight`) | 9 m et 30 ft sont la même vitesse, et rien ne dit laquelle | les nombres de `resolved` deviennent ambigus |
| C | `resolved.identity` (`level`, `classes[]`, `species?`, `background?`) | « joue sans ses couches » suppose un en-tête de fiche ; sans lui, `resolved` est une colonne de nombres | l'en-tête doit être reconstruit depuis `build`, donc depuis les couches — ce que `resolved` refuse par principe |
| D | `resolved.derivation` (`at`, `stack`) | permet de dire « `resolved` est périmé » quand `build` a bougé sans reconstruction ; sans lui, la dégradation ne peut pas être bruyante | le décalage build↔resolved devient invisible |
| E | `abilities.*.mod` stocké à côté de `score` | c'est une valeur finale, et un MJ peut l'écarter du score par override sans que la fiche se contredise | chaque consommateur recalcule, et un override sur le mod devient impossible |
| F | `layerRef.name` (facultatif) | nommer une couche **manquante** à l'écran plutôt qu'afficher son id nu | l'utilisateur lit `exemple-homebrew-fr` au lieu du titre |

---

## §3 — Trous de schéma (test d'acceptation §7 : les sept builds v1)

Les sept personnages FH v1 réels (`~/tools/fh-phb/builds/*.fh.json`) ont été
inventoriés — **chemins et types seulement**, aucune valeur, aucun contenu FH
dans ce dépôt public (`tests/fixtures/v1-build-field-inventory.json`, produit par
`tests/tools/derive-v1-inventory.mjs`).

**118 chemins. 66 ont une place dans `fh-char/1`, 6 sont structurels, 2 sont des
encodages DDB sans objet, et 44 tombent dans dix trous.** La suite
`tests/v1-coverage.test.mjs` exige que chaque chemin soit classé et que les dix
trous soient **tous encore invoqués** : personne ne peut en boucher un en douce,
ni ajouter un champ v1 sans que la question « où va-t-il ? » soit posée.

| Trou | Champs v1 concernés | Ce qui manque | Piste (non implémentée) |
|---|---|---|---|
| **GAP-DERIVED** (7) | `destiny.score`, `destiny.breakdown[]`, `destiny.arcana.impact`, `destinyFeats.score` | une **statistique dérivée définie par une couche**, avec son détail de calcul affichable. `resources[]` compte, `skills[]` a une caractéristique — un score de Destinée n'est ni l'un ni l'autre | une collection `resolved.stats[]` `{id, flag, name, value, breakdown[]}`, namespacée par drapeau comme `craft[]` |
| **GAP-ROLLS** (10) | `builderState.ab.set.rolls[]`, `kept`, `keptIdx`, `rerolls` | l'**historique des jets de création** de caractéristiques. C'est de l'état de construction persistant, pas de l'état de séance — et le chapitre FH « Character Creation Rolls » en fait une règle | `build.creation` ? À trancher : le document porte-t-il la trace de sa fabrication ? |
| **GAP-EXT** (9) | `character.ddbId`, `background.abilityBoostFeatIds[]`, `background.originFeats[].id`, `destinyFeats.originFeatId(s)`, `builderState.ddbId` | les **identifiants d'un système externe** (D&D Beyond). Le bloc `connect-ddb` est détachable, mais le lien doit survivre au document | `build.external` `{ddb: {characterId, entityIds}}`, ignoré quand le bloc est absent |
| **GAP-BUDGET** (6) | `raceP`, `featP`, `langPts`, `bonus1`, `glory`, `other` | les **budgets de points de construction** définis par une couche (points d'espèce, de don, de langue…) | `build.budgets` `{<flag>.<id>: number}` ; ou des choix scalaires, si l'architecte préfère ne rien ajouter |
| **GAP-NOTES** (3) | `background.story`, `destiny.notesText`, `builderState.story` | `resolved.notes` est **une** chaîne ; v1 en porte au moins deux distinctes (histoire du personnage, notes de Destinée) — l'une écraserait l'autre | `notes` en liste `{id, title, text}` |
| **GAP-KIND** (2) | `destiny.arcana.id`, `builderState.arcana` | un **genre hors des 12** (`arcana`). L'énumération est fermée par choix (§1.16) : le trou est intentionnel, mais il doit être bouché avant que la couche FH n'arrive | ajouter les genres FH à `kind` et à `records` en `fh-*/1` révisé, au M2 |
| **GAP-TOOLS** (2) | clefs `Tool - …` de `builderState.tiers` | les **maîtrises d'outils**, distinctes des compétences. `skills[]` les avalerait mécaniquement (caractéristique + maîtrise + bonus) mais perdrait la distinction que l'UI v1 fait | `resolved.tools[]` en miroir de `skills[]`, ou un champ `category` sur l'entrée de compétence |
| **GAP-GEN** (2) | `meta.builder`, `builderState.v` | la **provenance de l'outil auteur** (nom + version) | racine `generator` `{name, version}` |
| **GAP-CAMP** (2) | `character.campaign`, `builderState.campaign` | l'**appartenance de campagne**. « Le personnage appartient au joueur, la campagne au MJ » — reste que le document sait aujourd'hui à quelle table il joue | à trancher : propriété du bloc `table` (et donc hors document), ou champ racine ? |
| **GAP-LOCK** (1) | `builderState.tiers.<clef>.l` | la **provenance/verrou d'une maîtrise** : accordée par une source, donc non dépensable dans le budget | champ `grantedBy` sur l'entrée de compétence, ou dérivé de `build.choices` |

Deux champs sont classés **sans objet** et n'appellent aucun équivalent :
`skills[].type` (encodage DDB « compétence personnalisée vs native ») et
`builderState.name` (doublon de saisie de `character.name`).

---

## §4 — Questions ouvertes (hors trous v1)

1. **Monnaie.** Ni l'inventaire imposé ni les builds v1 ne portent de pièces.
   `resolved.gear[]` n'a pas de champ prix. Un personnage SRD niveau 1 a de
   l'argent : où ?
2. **Multiclassage lanceur.** Un seul bloc `spellcasting` (imposé). Un
   Magicien 3 / Clerc 2 a deux DD et des emplacements partagés.
3. **Ordre d'affichage des collections.** Non modélisé : l'ordre est une affaire
   d'UI, dérivée des champs (niveau de sort, économie d'action, nom). À confirmer.
4. **Dépendances déclarées d'une couche.** Pas de champ `requires` : un `patch`
   visant un id absent de la pile est détectable au chargement sans lui. Suffit-il ?

---

## §5 — Livraison et vérification

```bash
cd ~/tools/fhpc-worktrees/schemas && npm install && npm test
```

45 tests, 0 échec. Ce qu'ils couvrent :

- les deux schémas compilent en **2020-12 strict** ;
- les deux exemples valident ;
- le hash de couche inscrit dans le personnage est le **SHA-256 réel** du fichier
  de couche commité (il ne peut pas dériver sans faire rougir la suite) ;
- **27 mutilations** rejetées, une par invariant : état de séance dans le
  document, clef racine inconnue, override sans chemin / sans auteur / signé
  `dm` / enraciné dans `build` / adressé par index / polluant le prototype,
  choix ambigu ou vide, genre inconnu, couche sans hash, cinq caractéristiques,
  emplacement de niveau 10, craft sans drapeau, ressource sans maximum, patch
  sans `changes`, record mêlant deux opérations, données porteuses de `script`
  ou de `constructor`, drapeau non espacé, couche sans licence ni langue ;
- les invariants hors schéma (unicité de chemin, pile dérivée ≠ pile du build,
  couche montée deux fois) ;
- le **test d'acceptation §7** : classement complet des 118 chemins v1.

Le hash de la couche SRD dans l'exemple de personnage est
`0000…0000` — **placeholder assumé et visible** : la couche SRD n'existe qu'au
lot D. Le second hash, lui, est réel et vérifié par la suite.

> **Constat hors périmètre, pour l'architecte** : le squelette J0 ne contient ni
> `src/kernel/registry.mjs`, ni `src/kernel/bus.mjs`, ni `tests/kernel.test.mjs`
> (kickoff §2.7 et §2.8), alors que les six commits de `main` annoncent le lot
> terminé. Le lot B n'y a pas touché — le noyau n'est pas son périmètre.
