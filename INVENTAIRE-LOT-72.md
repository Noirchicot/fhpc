# Inventaire — lot 72 « plans-sorts »

> Branche `72-plans-sorts`, partie de `main` à `8c45fae`.
> `npm test` : **1 049 verts avant** (EXIT=0) → **1 068 verts après** (EXIT=0, +19).

## Ce que le lot devait obtenir, et ce qu'il obtient

Un magicien ne pouvait pas choisir ses sorts : la donnée était là (339 records
`spell`, les comptes dans `class-progression.levels[].resources`), le moteur
**consommait** déjà `class.cantrips[n]` / `class.prepared[n]` (`derive.mjs`
~776), mais aucun PLAN DE DÉCISION n'était publié. Le lot publie les plans,
Review les montre, l'écran Class les fait choisir, et le changement de classe
propose l'effacement des sorts orphelins — en les nommant, jamais en silence.

## La mesure avant / après (condition de sortie n°2)

Le cas d'Eric rejoué sur la vraie pile de l'UI (EN + FH, personnage d'exemple
`Ilyra Duskleaf`, `choose class = srd:class:en:rogue`, `rebuild`) :

| | avant (8c45fae) | après ce lot |
|---|---|---|
| plans de sorts au carnet (Wizard) | **0** | 2 groupes + 7 étapes, 3/3 et 4/4 `answered` |
| après passage à Rogue : sorts jugés | **0** — les 7 sorts uniquement dans `unconsumed` | **9 verrous** `decision.option-unavailable` (2 groupes + 7 étapes) |
| lignes en souffrance dans Review | **13** (11 `unconsumed` + 2 plans verrouillés) — le chiffre d'Eric se reproduit | 11 `unconsumed` + **11** plans verrouillés, mais TOUT est désormais nommé et actionnable |
| moyen de s'en débarrasser | **aucun** (la confirmation ne couvrait que `class.skills`) | la boîte « These spells are no longer valid for this class » NOMME les 7, « Clear them » les efface |
| après « Clear them » (les deux boîtes) | impossible | `unconsumed` **13 → 3** (`species.lineage`, `abilities.mode`, `languages[0]` — pré-existants, hors périmètre), **0** plan verrouillé |
| `validate()` | muet sur les sorts | 7 refus `decision.option-unavailable`, un par sort, dédupliqués par l'empreinte du lot 37 |

## Ce que j'ai changé

- **`src/build/decisions.mjs`** — `classSpellPlans` (+ table `SPELL_GROUPS`),
  branché dans `projectDecisions` sur **le même `classView`** que
  `class.skills` (leçon du lot 71 : un seul écrivain pour « quelle est la
  classe »). `expected` lu dans `resources.cantrips` / `.prepared_spells`,
  options au croisement `spell.classes × spell.level` **contre
  `classView.record.name`** (jamais une chaîne en dur — prouvé par une classe
  fabriquée « Zzz » dans la suite), plafond de préparation par
  `levels[].spell_slots` puis `resources.slot_level` (Warlock). Une classe
  sans ressource ne publie rien ; des réponses qui traînent publient le plan
  qui les JUGE.
- **`src/labels.mjs`** — `spell-grant.count-mismatch`, la clef sœur de
  `skill-grant.count-mismatch` : même forme, l'objet compté change
  (« sort(s) », pas « compétence(s) »).
- **`ui/builder/carnet.mjs`** — `renderSlotQcm` gagne `refKind` (une case pose
  `choose` + `ref` au lieu de `set` + `value`) et `slotWord` (« Cantrip 2 »,
  « Spell 3 ») ; défauts inchangés, même loi que `renderPicker` : l'appelant
  choisit le verbe. Le mot anglais du nouveau verrou entre dans
  `DECISION_REFUSAL_WORDS`.
- **`ui/builder/class-step.mjs`** — les deux QCM de sorts au 2ᵉ palier (table
  `SPELL_QCMS`, le même composant que `class.skills`, pas un troisième
  sélecteur) ; la confirmation d'effacement étendue aux sorts (une boîte À
  PART qui nomme SES pertes, le même geste `resetSkills` — « efface ces
  chemins, un rebuild ») ; `classPalier2` lit les trois plans (2/2 compétences
  ne suffisent plus à un magicien).
- **`ui/builder/review-step.mjs`** — `class.cantrips` / `class.prepared`
  rejoignent le groupe Class de `REVIEW_GROUPS` : la ligne dit
  « done · done · done · done », ou « needs attention » quand un sort est
  orphelin.
- **`contracts/build.md`** — « Elle ne projette ni sorts » marqué REWRITTEN,
  section « ⭐ LOT 72 » (sources lues, publication/jugement, clefs
  langue-natives, candidats par chemin).
- **Tests** — `tests/plans-sorts.test.mjs` neuf (19 tests : guide EN,
  jugement Rogue/Cleric, sur-compte, mauvais genre, classe fabriquée, pile FR
  ×3, écran ×5, Review) ; trois suites existantes mises à jour parce qu'elles
  verrouillaient l'inventaire d'avant-lot (`build-decisions` : la liste des
  chemins ; `mcp-acceptance` : `DÉCISIONS (13)` → `(22)` ; 
  `class-species-steps` : le compte de lignes se lit désormais PAR BLOC, et
  le nombre de blocs devient une assertion — Rogue 1, Wizard 3).

## Ce qui m'a surpris

1. **La commande avait raison pour l'anglais, et la pile FR la contredit.**
   La table de la commande (`wizard: {cantrips: 3, prepared_spells: 4}`…) se
   reproduit exactement sur `srd-5.2.1-en`. Mais la progression FR porte
   **`sorts_mineurs` / `sorts_prepares`** — clefs de ressource
   **langue-natives**, propriété documentée et assumée de la source
   (`layers/TRADUCTION.md`, qui interdit d'inventer une correspondance).
   Une table `sorts_mineurs → cantrips` dans le moteur aurait été la faute
   `"Sagesse" → wis`. J'ai donc suivi le §1c ratifié (« un record qui ne
   nomme pas ses clefs ne les restreint pas ») : sur une pile sans clef
   lisible, le plan **juge** (options, verrous, y compris après un changement
   de classe) mais ne **guide** pas (pas de compte inventé, pas de créneau
   manquant, pas de `provenance`). Le magicien d'exemple FR sort 3/3 et 4/4
   `answered` ; l'EN sort le plan complet. Si l'architecte préfère que la
   couche FR porte les clefs canoniques, c'est un chantier de GÉNÉRATEUR
   (fh-srd), pas de moteur.
2. **Le harnais FR compte 16 sorts mineurs de Magicien, pas 15** : la couche
   homebrew d'exemple ajoute « Chuchotement des pages » (niveau 0,
   `classes: ["Magicien"]`) — le croisement embarque l'homebrew sans une
   ligne de moteur, et le test le fige comme une propriété, pas comme un
   accident.
3. **Le piège rAF annoncé a mordu, témoin à l'appui** : pendant la
   vérification en page, le volet du navigateur était masqué — témoin
   `requestAnimationFrame` à **0 frame / 500 ms**, défilement lisse mort
   (un `scrollTop = 900` retombait à 0 ; `behavior: "instant"` passe). J'ai
   jeté toute mesure dépendant de rAF : l'aimantation du catalogue et le
   scrollspy n'ont PAS été vérifiés en page sur ce lot (ils appartiennent au
   lot 70 ; le flux « changer de classe → boîtes de confirmation » est couvert
   par les tests DOM). Ce que la page a montré, captures à l'appui, aux deux
   tailles demandées (1440×900, 360×780) : les trois blocs du 2ᵉ palier, les
   noms réels sur les boutons, les sélections allumées, Review
   « done · done · done · done », et **aucun débord horizontal** à 360 px
   (mesuré `scrollWidth ≤ clientWidth`).
4. **`multiPlan` accepte un candidat au chemin NU (`class.skills` sans index)
   dont l'étape ÉCRASE le plan du groupe** dans la projection dédupliquée par
   chemin. Hérité, pas imité : mes candidats de sorts sont indexés seulement,
   et le contrat le note.

## Ce que j'ai attaqué sans qu'on me le demande

- Rien hors périmètre. Deux fautes CONSTATÉES et laissées, parce qu'elles ne
  sont pas « le geste de choisir ses sorts » :
  - `skillLabel` (class-step) cherche les compétences par slug et échoue
    toujours (écart pré-existant, déjà consigné au lot 46) — les SORTS, eux,
    s'affichent par leur vrai nom : leurs options portent l'id complet.
  - un `ref {kind: "spell"}` posé HORS des chemins `class.cantrips[n]` /
    `class.prepared[n]` (ex. `species.foo`) est toujours consommé par
    `derive.mjs` et jugé par personne — la consommation est la loi du lot 8,
    la resserrer est un arbitrage d'architecte.

## ⛔ L'arbitrage laissé à Eric (commande §4)

Le 2ᵉ palier de Class porte les sorts avec `renderSlotQcm`, et ça FONCTIONNE —
mais **4 lignes × 30 boutons** pour les préparés d'un magicien, c'est lourd, et
à 360 px chaque ligne fait un écran et demi de haut. Si les sorts méritent leur
propre écran (un catalogue défilant façon B2, une recherche, un filtre par
école — `spell.school` est déjà dans la couche), **je ne l'ai pas construit** :
c'est un arbitrage d'ergonomie qui t'appartient. Le carnet publie déjà tout ce
qu'un tel écran lirait.
