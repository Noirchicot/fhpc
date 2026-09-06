# LOT 171 — Skills : l'état mesuré avant de reconstruire

**Branche** : `171-skills` (worktree `~/tools/fh-worktrees/171-skills`, base `76932a5` = `origin/main`, v592).
**Écrit le 2026-09-06, relevés de 23:48 à 23:59.** Aucune ligne de code touchée : ce fichier est la livraison ①.
**Rendu à ARCHI 32.**

## Verdict

**Le plafond de 2 Expertises ne compte que ce que le pool pose ; le kit lié du Rogue est invisible pour lui — un Rogue de niveau 1 sort de création avec TROIS Expertises sans un refus.** L'écran, lui, tient 5 règles sur 9 d'ECRANS §7 ; deux sont périmées par des règles plus récentes, une est classée au mauvais endroit, une n'est tenue qu'à moitié.

## Mes erreurs, en tête

1. **J'ai écrasé le personnage sauvegardé du volet de prévisualisation** (`localStorage["fhpc.personnage"]`, origine `127.0.0.1:8971`, un Wizard Elf) pour y injecter mon Rogue, **sans le copier avant**. C'est le navigateur du siège, pas celui d'Eric — mais « regarder la cible avant d'écraser » ne fait pas d'exception.
2. **La « porte du retour » de la règle 9 n'est pas mesurée** : j'ai remis à zéro avant de cliquer la ceinture en état de dépassement.
3. **Les collecteurs de compétences de Species (le modèle « 4 par ligne ») ne sont pas regardés** : l'étape est signée, y retourner coûte un `Cancel`. Ils sont cités depuis `listes.css`, pas vus.
4. Mes premiers `grep` (23:49) ont lu `~/tools/fhpc`, sur `main` **en avance de 4 commits** sur ma base : les numéros de ligne de NORMES cités par le mandat (686, 1619, 4065…) sont ceux de `main`, pas du worktree. Tout relevé chiffré ci-dessous vient du worktree à `76932a5`.

## Le banc, empreinté par CONTENU (23:51:38)

`python3 -m http.server 8971` lancé DEPUIS le worktree ; `curl | md5` = `md5 -q` sur **index.html · shell.css · shell.mjs · skills-step.mjs · tokens.css** (cinq md5 identiques). Éteint à 23:59:19. Suites : les 8 de Skills + `late-bloomer` → **137 / 137 verts** (23:50:47 → 23:50:52).

---

## ① a. LA QUESTION D'ERIC — le plafond compte-t-il les points liés ?

**Non.** `skill-pool.mjs:1031` compte `tierBySlug`, qui ne contient que les imposés SRD (semés `novice`) et les dépenses `fh.skills.spend.*`. La bourse de classe (`class.skillBudget.*`) est consommée dans `derive.mjs:789` et **n'atteint jamais le module**.

Rogue niveau 1, Halfling, moteur seul (`tests/build-harness.mjs`, couches SRD + species + skills), relevé à **23:52:32** et **23:53:21** :

| cas | bourse (6 pts liés) | pool (14 pts libres) | Expertises | refus |
|---|---|---|---|---|
| **A** | Stealth **expert** + 2 novices | Investigation expert, Deception expert | **3** (stealth, investigation, deception) | **aucun** — pool restant 6 |
| B | idem | + Insight expert | 3 | `expertise-capped` sur insight (le 4ᵉ) |
| **H** | idem + `fh.skills.trait.late-bloomer` | 2 experts + un 3ᵉ | **3** | capped sur le 4ᵉ — Late Bloomer ne change rien au compte |
| D | 6 novices | 3 experts | 2 | capped sur le 3ᵉ |
| I | rien posé | 3 experts | 2 | capped sur le 3ᵉ |
| **C** | Stealth expert | Stealth expert **aussi** | 1 | **aucun** — le pool paie 4 pts pour rien (14 → 10) |
| **G** | Stealth **expert** | Stealth **novice** | **0** | **aucun** — la dépense du pool ÉCRASE la bourse (stealth retombe novice, 1 pt payé) |
| E | Stealth expert, Acrobatics novice | Acrobatics expert + Investigation expert | 3 | aucun — acrobatics payé 4 depuis « none », son novice lié déjà payé 1 |

- **Le maximum qu'un Rogue de niveau 1 peut sortir : 3** (la bourse ne loge qu'un expert dans 6 pts : 4 + 1 + 1 ; le pool en autorise 2). Si Eric entend *« deux au total »*, le code en laisse passer trois.
- **Deux écrivains sur un même slug, et le second gagne en silence** (C, G) : la bourse écrit `budgetTier` dans `derive.mjs:850`, le module republie `skillTiers` en `derive.mjs:1285` par-dessus. Un slug lié n'est ni un plancher (`tierBySlug` ne le connaît pas) ni compté. ⚠️ **L'écran ne peut pas produire C/G/E aujourd'hui** — les lignes liées sont des planchers muets qui n'émettent pas de `spend` — mais un fichier de personnage le peut, et `Reset` ne les voit pas.
- 🔒 **Rien de ceci n'est posé.** La ligne existe (semer `tierBySlug` avec les paliers de la bourse, ce qui règle A, C, G et E d'un coup — un tuyau `derive.mjs` → module de plus, ~30 lignes + 4 témoins contraires), mais **elle attend le mot d'Eric sur « deux au total ? »**.

## ① b. LES 9 RÈGLES D'ECRANS §7 contre l'écran rendu (360 × 740, 23:56 ; 1024 × 768, 23:58)

| # | règle (ancre) | état | mesure |
|---|---|---|---|
| 1 | `skills-pas-de-bouton-zero` (14/08) | ✅ tenue | 3 boutons par ligne, jamais 4 (`tierBtnsPerRow` ∈ {3, 0}) ; ◐ ● ◉ |
| 2 | `skills-le-reste-flotte` (14/08) | ⛔ **périmée à moitié** | le reste flotte ✓, `Reset` y est ✓ — mais **le calcul ne défile plus** : `.skills-pooldetail` vit dans la bande fixe depuis le lot C (26/08). La règle 6 l'a remplacée et ECRANS garde les deux « déployées » |
| 3 | `skills-compteur-dit-free` (20/08) | ✅ tenue | `FREE 8/14 · INVESTED 16 · LEFT 6` |
| 4 | `skills-bourse-d-espece-chez-species` (26/08) | ✅ tenue | aucun `.skills-budget-block` ; Species lu en ligne 2 (`Species 2/2`). Reste **4 classes CSS orphelines** : `skills-budget-block`, `skills-budget-note`, `skills-category-bar`, `skills-lock` |
| 5 | `skills-trois-bandes-et-un-titre` (26/08) | ✅ tenue — **et chère** | tête **200** · flux **177** (184 de fenêtre) · pied **88**, dans une scène de **480** : les bandes fixes prennent **60 %**, le flux montre **3,5 lignes sur 76** (4 294 blg = 23 écrans) |
| 6 | `skills-barre-blanche-descend` (26/08) | ✅ tenue | `.stage-topbar` vide et `hidden` ; molette + pool sur la dalle fixe. ⚠️ la molette **déborde** : 486 dans 335, « Physical » coupé, « Tools & Trainings » hors champ |
| 7 | `skills-fond-ouvert-sans-plafond` (29/08) | ⛔ **périmée à moitié** | `data-bleed="true"` ✓ ; mais `.skills-step { max-width: var(--grid-w) }` = **605 px** calculé, et surtout **le panneau vaut 360 blg à tous les crans** (scène 360 à 1024 × 768, zoom 0,96) depuis le sacré du 31/08 — « largeur non plafonnée » décrit un monde qui n'existe plus |
| 8 | `skills-quatre-par-ligne` (29/08) | ⛔ **mal classée** | l'écran Skills n'a **aucun collecteur** (76 lignes d'une compétence). La règle vit dans `listes.css:189` (`--par-rangee: 4 /* skills : le défaut */`) sur `.choix-glisse`, commit `2a6f3cd` — elle gouverne les collecteurs de Keen Senses (Species) et tout futur glisser ; rien sur cet écran ne la rend |
| 9 | `skills-bourse-depassee` (27/08) | ✅ tenue aux ⅔ | compte exact « Overspent by 2 — 16 of 14 spent. » ✓ ; `LEFT −2 · OVER` rouge ✓ ; `Done` `disabled`, `data-lit=false` ✓ ; le mot rouge est celui de **l'écran** (`.skills-refusal-pool`), pas du gendarme de la coquille — Skills n'a pas d'aiguilleur ; porte du retour **non mesurée** (erreur 2) |

**Hors des 9, mesuré le même soir :**
- ⛔ **pas de livre** dans le pied (`livre: false`) — `rangee-trilogie-due-partout` (06/09) ; déjà dans A-TRANCHER C25, clos « à reconstruire ».
- ⛔ **une ligne liée ment sur son palier** : Stealth posé **expert** par la bourse rend ◐ (rang 1) enfoncé — `renderFloorTiers` (skills-step.mjs:423) allume toujours le premier rond dès que `proficiency ≠ none`. Le bonus est juste (+6), le glyphe dit Novice.
- ⚠️ les **ronds de palier sont des cercles** : ni jeton (rectangle très arrondi) ni bouton (pans coupés) au sens de NORMES §2 ; CADRES §6 les nomme « rangée de ronds de palier ». **Organe non ratifié** — question pour Eric.
- 76 lignes × 3 ronds = **228 boutons** ; 37 outils + 13 trainings + 26 compétences ; les noms d'outils se tronquent à 360 (« Calligrapher's Supp… »).
- la notification du Rogue passe sur **2 lignes** dans la bande fixe.

## ① c. CE QUE « RECONSTRUIRE » PEUT VOULOIR DIRE — trois routes chiffrées

Étalon : la reconstruction d'Abilities B1 (lot 162, 491 lignes de code) = **54 commits en 45 h** (05/09 00:38 → 06/09 21:53), un siège. Skills aujourd'hui : **949 lignes (457 de code)**, **84 règles CSS**, **13 tests** citant **20 sélecteurs**, plus `aria-pressed-guard` (3), `mot-du-verrou` (5), et **33 mentions dans shell.mjs**.

| route | ce qu'elle refait | ce qu'elle laisse | coût |
|---|---|---|---|
| **A — l'écran seul** | `skills-step.mjs` + ses 84 règles + les 13 tests, sur les organes du socle (jeton, collecteur, dalle, rangée de contrôles, trilogie) ; le moteur n'est pas touché | les trous du moteur (a) : 3 Expertises, double écrivain C/G | **≈ 2 jours-siège** (l'étalon), dont ½ pour reprendre les tests |
| **B — l'écran ET la couture** | A + le tuyau bourse → module (`derive.mjs` tend les paliers liés, `skill-pool.mjs` les sème en plancher et les compte dans le plafond) ; les lignes liées cessent de mentir parce qu'elles lisent enfin la bourse | rien de connu | **A + ½ jour**, **bloquée** tant qu'Eric n'a pas dit « deux au total ? » |
| **C — réduire, puis A** | trancher d'abord ce que l'écran porte EN TROP (§1 quater) : 50 lignes sur 76 sont des outils et des trainings ; la molette déborde ; les bandes fixes mangent 60 % | — | **A + 1 jour** si le découpage touche `etapes.mjs`/la ceinture et la coquille (33 mentions), + une entrée de Bible ; **décision de produit d'Eric**, pas de lot |

⛔ Aucune maquette : la forme (lignes ou collecteurs, cercles ou jetons, ce qui reste sur l'écran) est à Eric.

## LOI DES BIBLES

Aucune Bible n'a été éditée, aucune ne devait l'être pour ce relevé. **Trois ancres pour AGENT BIBLE, si Archi les retient** : `skills-le-reste-flotte` → « remplacée par `skills-barre-blanche-descend` (26/08) pour sa seconde moitié » · `skills-fond-ouvert-sans-plafond` → « bornée par le sacré du 31/08, le panneau vaut 375 blg » · `skills-quatre-par-ligne` → « règle des collecteurs (`listes.css`, `.choix-glisse`), ne décrit pas l'écran Skills actuel ». Le lot ne touche pas au livre publié : la Web Bible n'a pas été lue.

## Ce qui reste

- **Le mot d'Eric** sur (a) : deux Expertises **au total** ou deux **au pool** ? Puis sur la forme : les ronds sont-ils un organe ? les outils et trainings restent-ils sur cet écran ?
- Mesurer la porte du retour sous dépassement (erreur 2) et regarder les collecteurs de Species (erreur 3) — dix minutes chacune, le jour où l'on reconstruit.
- Le personnage du volet est désormais mon Rogue de mesure (`Mesure Rogue`) ; le Wizard qu'il remplaçait n'est pas récupérable.
