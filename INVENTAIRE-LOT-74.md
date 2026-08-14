# INVENTAIRE — LOT 74 « scores-3-18 »

Deux défauts rencontrés par Eric sur le builder déployé (2026-08-15) :
`Choose yourself` proposait **1 à 20** par caractéristique (la borne est
**3 à 18**), et sur Abilities `Validate` arrivait **éteint sans qu'un mot ne
dise pourquoi**.

**Suite : 1 073 tests verts avant → 1 079 verts après (EXIT=0 les deux fois).**

---

## 1. La borne 3–18 vit au moteur, et l'écran la LIT

Sur le patron désigné par la commande (`background.boost-cap-exceeded`,
`decisions.mjs` — une règle arbitrée, écrite dans le moteur, avec sa clef) :

| Fichier | Ce qui a changé |
|---|---|
| `src/build/decisions.mjs` | section **LOT 74** : `CREATION_SCORE_MIN = 3`, `CREATION_SCORE_MAX = 18`, `CREATION_SCORES` (les seize valeurs, **gelées**) + `abilityScorePlans()` — six plans `abilities.<clef>` au carnet, verrou `abilities.score-out-of-creation-range` `{path, value, min, max}` |
| `src/build/index.mjs` | les trois constantes sont **publiées** — c'est le canal que l'écran lit |
| `src/labels.mjs` | la phrase française de la clef (même circuit que boost-cap) |
| `contracts/build.md` | la règle documentée : ce qu'elle juge, ce qu'elle ne juge PAS, sa condition |
| `ui/builder/abilities-step.mjs` | `MANUAL_ENTRY_RANGE` (1..20 écrit en dur) **supprimé** — le picker prend `options: CREATION_SCORES` importé du moteur ; `ABILITY_CAP = CREATION_SCORE_MAX` (le 18 de l'alerte n'est plus écrit à la main non plus) |

**Le sens de la borne, tenu :** elle juge le CHOIX `abilities.<clef>` (le
score de BASE), jamais `resolved.abilities` — la dérivation additionne les
boosts par-dessus la base. Et elle parle **à la création seulement** : posée
la garde `level entier > 1 → silence` (« au-delà, le SRD reprend la main,
plafond 20 », l'arbitrage Eric 2026-08-13 déjà porté par l'alerte d'écran).
Un document **sans** `level` est un document en création : la borne y parle.
⭐ La condition est un **garde testé** (`build-decisions.test.mjs`, test
« le GARDE de la condition »), pas un commentaire.

## 2. L'attente se dit

- `renderAbilitiesStep` : quand aucune méthode n'est choisie, l'écran écrit
  **« Validate has nothing to act on yet — pick one of the methods above to
  begin. »** (`.ability-gate-note`, registre doux, `shell.css`). La phrase
  disparaît dès qu'une méthode est choisie.
- ⛔ `Validate` n'a **pas** été allumé pour faire joli : l'état d'attente est
  voulu (B5.1c) — c'est l'affordance qui manquait, pas le mécanisme.
- Le test **apparie** les deux : `abilitiesValidate(...).ready === false` à
  l'arrivée **⇔** la phrase existe. Éteindre sans le dire, ou dire sans être
  éteint, rougit.

## 3. Mesures (navigateur, témoin rAF vivant aux deux tailles)

| Mesure | 1440×900 | 360×780 |
|---|---|---|
| Témoin rAF (`f`) | 5 → 9 (vivant) | 8 → 14 (vivant) |
| Arrivée : `Validate` | éteint + désactivé, **phrase présente** | idem |
| `Choose yourself` : options/rangée | **16, de « 3 » à « 18 », zéro hors borne** (avant : 20, 1..20) | **idem** |
| Base 18 posée sur INT (boost +2 au document) | clic **part**, Final **« 20 (+5) »**, alerte « > 18 at creation » affichée, rien ne bloque | idem |
| Phrase après choix de méthode | disparue | disparue |

Côté moteur (tests) : base 2 et base 20 au niveau 1 → **deux verrous nommés**
qui **voyagent jusqu'à `validate()`** (le fil du lot 37, prouvé pour cette
clef) ; base 18 + boost 2 → résolu 20, **zéro** violation de borne ; niveau 5
avec base 20 → **aucun plan** `abilities.*` ; MCP rend désormais
`DÉCISIONS (28)` avec les six lignes `abilities.<clef> : answered, 1/1`.

## 4. Ce qui m'a surpris

- **Le 1..20 n'était pas une négligence.** C'était une décision d'architecte
  (2026-08-13) : dépasser 18 EXPRÈS pour que l'alerte de plafond puisse se
  déclencher, « retirer les valeurs > 18 serait un blocage ». La décision
  d'Eric (2026-08-15) a tué la RAISON de ce choix — le commentaire du fichier
  raconte maintenant cette mort au lieu de la masquer.
- **Le carnet voyage plus loin que la page.** Ajouter six plans a changé la
  sortie TEXTE du MCP (`DÉCISIONS (22)` → `(28)`) — un consommateur auquel je
  ne pensais pas, attrapé par son test. C'est le seul test existant qui a
  rougi ; `tree-immuable` n'était que son écho (il rejoue la suite).
- **Une valeur illisible (`"12"` chaîne) fait JETER `rebuild`** avant même le
  carnet (mesuré : « les six scores… ceux-ci manquent ») — préexistant,
  inchangé. Par `validate()` en revanche (qui attrape la dérivation), mon
  verrou la nomme AUSSI : deux refus, deux fautes distinctes nommées.
- **Le volet navigateur s'est masqué en pleine séance** (clics en timeout à
  360) — le témoin a fait exactement son travail : pages vivantes prouvées
  (`f` avance), seules les mesures accompagnées d'une frame ont compté.

## 5. Attaqué sans qu'on me le demande

- **Le 18 de l'alerte** (`ABILITY_CAP`) lisait sa valeur en dur dans l'écran
  depuis le lot 45 — il lit maintenant `CREATION_SCORE_MAX`. Deux jugements
  distincts (borne de saisie / alerte sur le résolu), UN nombre arbitré, un
  seul écrivain.
- **Le contrat** (`contracts/build.md`) porte la règle à côté de ses sœurs
  boost-cap/boost-total, avec sa table de clef.
- **Le test MCP** vérifie désormais qu'une ligne `abilities.str` traverse —
  la preuve que les plans neufs voyagent, pas seulement qu'ils existent.

## 6. La règle générale « `Validate` n'est jamais éteint sans que l'écran dise pourquoi »

Je la trouve **juste**, et le mandat l'a déjà mesurée : **un seul écran
concerné sur dix** (Abilities à l'arrivée ; Review éteint par conception —
c'est la destination). Le correctif est donc local, MAIS le garde posé est
la forme locale de la règle : l'appariement `ready:false ⇔ phrase présente`
(`abilities-step.test.mjs`, « l'attente SE DIT »). Pour la promouvoir en loi
des dix écrans il faudrait une convention partagée (chaque étape expose son
texte d'attente à côté de sa porte — une brique, un écrivain, un garde) :
**pas fait**, ce serait réécrire dix écrans pour un défaut qui n'existait
que sur un. À reprendre si un second écran attrape la maladie.

## 7. Nommé, pas traité (préexistant)

- **À 360, le ruban d'options défile DANS la rangée** : 752 px pour 161
  visibles, la valeur active (offset 294) est hors champ à l'arrivée.
  Préexistant (famille B4.3bis, « une dalle qui défile à l'intérieur » —
  trois issues, aucune choisie) ; la borne l'améliore mécaniquement
  (~940 px → 752 px, −20 %), elle ne le résout pas.
- `abilities.mode` reste dans les **5 choix non consommés** (warning
  préexistant, l'intention du joueur y est gardée exprès).
- Le **plafond de sortie de création** (ADDENDUMS §5 n°1, « toutes sources,
  à la fin ») n'est toujours implémenté nulle part — l'alerte d'écran reste
  sa seule trace. Hors mandat, redit au contrat.
- La ligne Abilities de **Review** dit « six scores set » même si un score
  est verrouillé (sa rubrique « The engine refuses » porte le refus, elle) —
  si on veut « needs attention » sur la ligne, c'est un chemin à ajouter à
  `REVIEW_GROUPS`, une ligne, pas fait ici.
