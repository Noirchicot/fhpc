# Inventaire — Lot 42 (`42-ecrans-records`)

Worktree : `~/tools/fhpc-worktrees/42-ecrans-records`, branche `42-ecrans-records`,
coupée de `main` à `8f53c20` (remesuré, conforme à la commande).

## Tests — départ et arrivée

- **Départ** : `npm ci` puis `npm test` → **685 tests, 685 pass, 0 fail** (conforme à l'attendu de la commande).
- **Arrivée** : `npm test` → **694 tests, 694 pass, 0 fail** (685 + 9 tests neufs dans
  `tests/class-species-steps.test.mjs`). `tests/skills-step.test.mjs` (12 tests, lot 39)
  tourne **sans une ligne modifiée** et reste vert — preuve de neutralité de
  l'extraction de `planAt`/`violationAt` (§3a).

## §3b.3 — Ce qui se passe quand on change de classe (mesuré)

Mesuré en appelant `build.verbs.choose` directement sur le document d'exemple
(Magicien, `class.skills = [arcana, investigation]`), puis en switchant vers
Guerrier (liste d'options disjointe) :

```
AVANT : class.skills[0]=arcana, class.skills[1]=investigation (2/2, answered)
APRÈS (choose → class:Fighter, sans rien nettoyer) :
  class.skills[0] : LOCKED — decision.option-unavailable, "arcana" hors options Fighter
  class.skills[1] : LOCKED — decision.option-unavailable, "investigation" hors options Fighter
  class.skills[2] : pending, vide
  class.skills[3] : pending, vide
```

**Les choix de l'ancienne classe SURVIVENT** — `choose` sur `class` ne touche
que le chemin `class`, jamais `class.skills[n]` (`src/build/block.mjs`, chaque
verbe ne pose qu'UNE entrée). Le carnet (`multiPlan`, `decisions.mjs`) les
republie donc au prochain slot, **verrouillés** (leur valeur n'est plus une
option valide), **pendant qu'il ouvre en plus de nouveaux slots vides** pour
atteindre le nouveau `expected` — d'où 4 lignes affichées pour un
`expected: 2`. Rejoué dans le navigateur (voir « ce qui a surpris »),
confirmé identique.

**Ce lot ne nettoie pas.** Je n'ai pas fait passer `applyDecisionAction` (ou
un geste de l'écran) par une purge automatique des anciens `class.skills[n]`
au moment du `choose` — la commande demande explicitement de mesurer et
*proposer*, pas de trancher au goût. **Ma proposition** : au clic sur une
classe différente, l'écran pourrait accompagner le `choose` d'une suite de
`clear` sur les chemins `class.skills[n]` déjà publiés — exactement le
même geste que le bouton *Reset* de `skills-step.mjs` (lot 39, décision n°2),
un batch de `clear` puis un seul `rebuild`. Je ne l'ai pas fait parce que :
(a) ce n'est pas dans le périmètre explicite du lot (§3b ne demande que
lister/afficher le QCM), (b) l'écran, TEL QUEL, reste honnête et actionnable —
chaque ligne verrouillée porte son refus (`"arcana" isn't on the catalogue.`)
et son propre tiret pour l'effacer, donc rien n'est caché ni bloqué,
seulement plus verbeux qu'un nettoyage automatique ne le serait. Si Eric
préfère le nettoyage auto, c'est un geste d'UNE fonction de plus dans
`class-step.mjs`, pas une refonte.

## §3b.4 — Quelle boîte d'info, et pourquoi

**Technical info seule**, pas *lore info*. Trois champs, tous des phrases déjà
prêtes sur le record (jamais recomposées ici) :

- `hit_point_die` (« D6 per Wizard level ») — **pas** `hit_die` (6), qui aurait
  demandé de préfixer un « d » moi-même.
- `primary_ability` (« Intelligence » / « Strength or Dexterity ») — déjà un mot complet.
- `saving_throw_proficiencies` (["Intelligence","Wisdom"]) — **pas**
  `saving_throw_keys` (["int","wis"]), qui aurait demandé une table
  d'abréviation-vers-mot que ce lot n'a aucune raison d'inventer.

Choisi plutôt que *lore info* (`description`) parce que `description` est de
la prose SRD brute de plusieurs milliers de caractères, tables de
fonctionnalités de classe comprises, non mise en forme (mesuré sur le
Magicien : ~2000 caractères, mélange de paragraphes et de lignes de tableau
aplaties). L'afficher proprement est un travail de mise en page à part ; la
technical info, elle, est compacte, directement utile à la décision en cours
(« combien de PV, quelle sauvegarde »), et se rend sans un octet de
composition.

## Ce qui a surpris en regardant l'écran

Servi avec un serveur statique local sur le worktree (`.claude/launch.json`
ajouté, `python3 -m http.server`) — trois choses trouvées que les 694
assertions ne voyaient pas :

1. **Un vrai bogue de mise en page** : sur une ligne de QCM avec beaucoup
   d'options larges (Guerrier, Barde « any » 26 options), le libellé
   « Skill 1 » se faisait écraser par le picker voisin et se brisait
   lettre par lettre (« S / kill / 1 ») — `.record-list` n'avait pas de
   `flex-shrink` borné face à `.skills-row-name`, dont le `min-width:0`
   hérité l'autorisait à s'écraser jusqu'à ~2px. **Corrigé** : nouvelle classe
   `.record-row-label` (plancher `min-width: 8ch`, jamais écrasée) +
   `.record-list { flex: 1 1 auto; min-width: 0 }` pour que ce soit LUI qui
   absorbe la contrainte, pas le libellé. Vérifié à nouveau dans le
   navigateur après correctif (Guerrier, Barde, Roublard) : plus de casse,
   ni en desktop ni à 360px.
2. **La mesure du §3b.3 se voit exactement telle que mesurée par script** :
   switcher Magicien → Guerrier dans le vrai navigateur affiche bien 4 lignes
   (2 verrouillées « arcana »/« investigation », 2 vides), confirmant que le
   comportement décrit plus haut n'est pas un artefact du harnais de test.
3. **Un carry-over parfois valide, parfois non, sur le même geste** :
   switcher Magicien → Roublard laisse « investigation » ACTIF (Roublard
   l'accepte aussi) mais verrouille « arcana » (absent des options
   Roublard) — la même action produit un mélange de « ça survit » et
   « ça se verrouille » ligne par ligne, jamais un tout-ou-rien. Je ne
   l'avais pas anticipé avant de le voir à l'écran ; c'est exactement le
   comportement correct puisque chaque `class.skills[n]` est jugé
   indépendamment par le carnet.

Le budget captif d'espèce (Elestu) et le choix imposé (Araag) se sont rendus
sans surprise, glyphes/paliers corrects (Half/Proficient, Delve inclus).
Loroka (aucun don) n'affiche bien rien, pas même un cadre.

## Ce que j'ai changé de cette commande

1. **`carnet.mjs` porte plus que `planAt`/`violationAt`** — j'y ai aussi mis
   `planSlots`, `decisionRefusalWord`, `renderPicker`, `renderSlotQcm` et
   `renderRecordChoice`, partagés par `class-step.mjs` ET `species-step.mjs`.
   La commande ne demandait explicitement que l'extraction des deux
   premières. Justification : Class et Species posent la MÊME forme de choix
   (12 options + QCM par slots) — l'écrire deux fois dans deux fichiers créés
   dans le MÊME lot aurait été exactement la divergence que la loi du
   chantier (citée par la commande elle-même, §3a) met en garde contre.
   `carnet.mjs` reste un module de LECTURE/RENDU du carnet, pas une
   architecture nouvelle — zéro règle de jeu dedans, comme demandé.
2. **`species.skillBudget` reste éditable depuis DEUX écrans** (Skills — lot
   39, gelé — et Species — ce lot), pas un seul comme le suggère la décision
   n°3 du schéma d'écran (« chaque source pose son choix chez elle… la
   grande grille ne porte que le pool libre »). Mesuré : `skills-step.mjs`
   doit rester identique (§3a), donc `renderSpeciesBudget` y reste tel quel.
   Les deux écrans opèrent sur le MÊME chemin (`species.skillBudget.<slug>`)
   via le MÊME verbe — aucune incohérence de données possible, juste une
   redondance d'écran que je n'ai pas résolue (hors périmètre : retirer le
   widget de `skills-step.mjs` est explicitement interdit par la commande).
3. **Le lignage n'est pas affiché**, ni en QCM (interdit par la commande) ni
   en rubrique-avec-raison (autorisé, « si tu veux »). Je ne l'ai pas fait :
   ça demande de faire remonter `report.underived` jusqu'au `ctx` de
   `species-step.mjs`, une plomberie que ni `shell.mjs` ni aucun des deux
   autres écrans ne portent aujourd'hui pour ce chemin précis.
4. **`.claude/launch.json` ajouté** — absent du worktree, nécessaire pour
   servir le builder localement et le regarder (demandé par la commande).
   Trois lignes, comme annoncé.
5. **Une classe CSS renommée en cours de route dans MES fichiers neufs**
   (`skills-row-name` → `record-row-label` pour les libellés de slot/budget) —
   pas une modification de `skills-step.mjs` (toujours intact), juste le
   choix de ne pas hériter d'une classe pensée pour un autre contexte de
   largeur.

## Compte rendu final

**Ce qui marche** : les deux écrans lisent le carnet, jamais un nombre ni une
liste en dur (attaqué : `expected` forcé à 9999 sur un plan fabriqué → suivi,
pas corrigé ; options `["zzz"]` → affichées telles quelles). Les 12
classes/12 espèces, le QCM de classe (2/3/4 selon la classe, jamais 2 en
dur), les trois états d'espèce (bourse captive, choix imposé, rien), le verbe
`choose` ajouté à `shell.mjs` et vérifié en direct dans le navigateur (Class →
Rogue change bien la fiche), le libellé *Inheritance*. Testé en vrai
navigateur aux deux largeurs (1280px et 360px).

**Ce qui ne marche pas / n'a pas été fait** : le nettoyage automatique des
anciens choix de classe au changement (proposé, pas implémenté — voir §3b.3) ;
aucune indication du lignage sur l'écran Species (autorisé à sauter, sauté) ;
le budget captif d'espèce reste dupliqué sur deux écrans (Skills et Species) —
c'est la tension entre « chaque source pose son choix chez elle » (décision
n°3 du schéma) et « ne touche pas skills-step.mjs » (cette commande) ; aucune
des deux instructions n'est violée, mais elles ne se résolvent pas
entièrement l'une l'autre dans ce lot.

**Attaque manuelle jouée** : neutralisé le garde couleur (`tests/ui-jetons.test.mjs`)
en remplaçant `var(--accent)` par `#845933` en dur dans MA propre règle
`.record-option[data-active="true"]`. Rejeu de `npm test` : le garde couleur
a rougi, comme attendu — **mais deux tests collatéraux ont rougi avec lui**
(`tree-immuable.test.mjs`, qui voit le fichier tracké changer pendant que la
suite tourne, et l'attaque native `ATTAQUE 1` de `ui-jetons.test.mjs`, dont le
compte de violations suppose un fichier propre au départ). Rapporté platement
plutôt que caché : mon attaque a touché le VRAI fichier tracké au lieu d'une
chaîne synthétique en mémoire (le protocole que `ui-jetons.test.mjs` utilise
pour ses propres attaques) — une attaque plus isolée aurait évité ce
collatéral, mais celle-ci a quand même prouvé sans ambiguïté que le garde
couleur mord sur mon propre code neuf. Restauré ensuite, diff byte-à-byte
confirmé identique (`diff` silencieux), suite complète rejouée verte à 694.
