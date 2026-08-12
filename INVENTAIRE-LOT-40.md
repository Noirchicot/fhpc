# Inventaire — lot 40 `review`

> Écrit à la fin du lot, chiffres mesurés en relançant `npm test` et un
> vrai navigateur (Chrome, via `python -m http.server` + Claude Browser) —
> rien n'est recopié d'un commentaire.

---

## 1. Départ → arrivée

| | |
|---|---|
| Tests au départ (`npm test`, mesuré avant la première ligne) | **662 verts, 0 rouge** |
| Tests à l'arrivée | **670 verts, 0 rouge** (662 + 8 dans `tests/render-fiche-en.test.mjs`) |
| Fichiers neufs | `tests/render-fiche-en.test.mjs` · ce fichier |
| Fichiers modifiés | `src/tools/render-fiche.mjs` (§3b — le paquet anglais) · `ui/builder/shell.mjs` (§3a/§3c — le branchement) |
| Tout le reste de `src/` | **intouché** |
| `ui/builder/shell.css` / `tokens.css` | **intouchés** — zéro style neuf (voir §5) |
| `tests/render-fiche.test.mjs` (les tests du lot 25) | **intouché**, 20 tests, tous encore verts sans une ligne changée |

### Correction mesurée sur la commande — le compte de `tests/render-fiche.test.mjs`

La commande dit deux fois « 27 tests verts ». **Mesuré** (`node --test
tests/render-fiche.test.mjs` → `ℹ tests 20`, et `grep -c "^test("` confirme
20 blocs `test(...)`) : ce fichier porte **20 tests**, pas 27. Le nombre 27
que `grep -c "test("` renvoie compte aussi 7 appels à la méthode regex
`.test(...)` (lignes 263, 277, 311, 375, 425, 432, 436) — un faux positif de
comptage, pas un désaccord sur ce que le fichier garde. Rien de matériel n'en
découle : les 20 tests couvrent bien les cinq garanties citées par la
commande (§« LES CINQ DE LA COMMANDE » dans l'en-tête du fichier), et ils
sont tous restés verts sans une ligne modifiée.

---

## 2. Les SHA, sur `40-review`, coupée de `main` à `cbfd853`

| SHA | Contenu |
|---|---|
| `2b0a684` | §3b — `LIBELLES_EN`/`MOTS_EN` dans `render-fiche.mjs`, `render(document, report, lang = "fr")` |
| `fddcbd6` | Les 8 tests d'acceptation du paquet anglais (`tests/render-fiche-en.test.mjs`) |
| `cfaaca6` | §3a/§3c — `shell.mjs` branche `render-fiche.mjs` à l'étape Review, le bouton final y mène par id |

Arbre propre après chaque commit, `npm test` rejoué et vert après chacun des
trois. Aucun `git push`, aucune fusion.

---

## 3. La voie d'injection choisie, et pourquoi (le fait mesuré n°1)

**Mesuré avant d'écrire une ligne** : `tests/dom-stub.mjs` porte dans son
propre commentaire (lignes 12-16) — *« CE N'EST PAS UN NAVIGATEUR. Aucune
mise en page, aucun CSS, aucun `innerHTML`. `skills-step.mjs` n'en a besoin
d'aucun (…) contrairement à `shell.mjs`, qui n'est pas testé ici : la
coquille reste hors du périmètre de ce lot, seule la fonction l'est. »* —
et `shell.mjs` lui-même utilise DÉJÀ `innerHTML` à deux endroits, avant ce
lot :
- `item.innerHTML = ...` (le libellé d'un pas de la ceinture, ligne 130) ;
- `app.innerHTML = ""` (le vidage de la page avant chaque redessin, ligne 220).

**Conséquence directe de ces deux mesures** : la voie « `innerHTML` sur un
conteneur, dans `shell.mjs` seul » (première ligne du tableau §0 de la
commande) ne coûte **rien de neuf** — ni un banc de test à changer (le banc
ne teste pas `shell.mjs`), ni une convention à introduire (`shell.mjs`
posait déjà du HTML en chaîne). L'autre voie (une variante « nœuds » de
`render-fiche.mjs`, testable par `dom-stub.mjs` comme le lot 39) aurait
dupliqué toute la marche/les tranches de `render-fiche.mjs` dans une seconde
fonction — pour un gain de test que le §4 de la commande ne demande même pas
(« on teste la fonction, pas la page » ; les sept tests portent tous sur
`render()`, aucun sur `shell.mjs`).

**Choisi** : `render()` reste une fonction pure qui rend une chaîne (loi du
lot 25, non rouverte) ; `shell.mjs` pose cette chaîne dans un `<div
class="review-fiche">` via `.innerHTML =`, exactement comme il pose déjà le
libellé de la ceinture. `renderStage()` gate sur `state.document &&
state.report` (les deux posés ensemble par `rebuild()`, jamais l'un sans
l'autre hors erreur moteur) et affiche « Loading the engine… » sinon —
identique au patron déjà suivi par l'étape Compétences.

---

## 4. Les identifiants et leurs mots anglais

Le mécanisme est **littéralement** celui de `src/labels.mjs`
(`createLabels`), pas une imitation : `MOTS`/`MOTS_EN` restent des objets
ordinaires exportés (pour que les tests les comparent clef à clef), mais
c'est un accesseur `mots(id)` bâti par `createLabels(MOTS)` /
`createLabels(MOTS_EN)` que tout le rendu HTML consulte — il **jette** sur
un id sans mot, jamais un blanc ni l'id nu (`tests/render-fiche-en.test.mjs`,
test 2, le prouve sur un paquet délibérément amputé).

`LIBELLES`/`LIBELLES_EN` restent des objets consultés à la clef nue (PAS par
`createLabels`) : leurs clefs suivent `resolved`, un ensemble que le contrat
peut agrandir demain, et une rubrique sans libellé doit pouvoir s'afficher
quand même (comportement du lot 25, non changé) — ce n'est pas le même
contrat que les ~22 mots d'interface, un ensemble fermé connu du code.

### Les 21 titres de rubrique (`LIBELLES_EN`)

| id | Anglais |
|---|---|
| derivation | Derivation |
| identity | Identity |
| abilities | Abilities |
| proficiency | Proficiency bonus |
| ac | Armor Class |
| vitals | Hit points and conditions |
| speeds | Speeds |
| senses | Senses |
| languages | Languages |
| saves | Saving throws |
| skills | Skills |
| tools | Tools |
| actions | Actions |
| spellcasting | Spellcasting |
| resources | Resources |
| traits | Traits and features |
| gear | Gear |
| currency | Currency |
| craft | Craft |
| stats | Derived stats |
| notes | Notes |

### Les 22 mots d'interface (`MOTS_EN`)

| id | Anglais |
|---|---|
| titreRapport | Derivation report |
| rapportAbsent | NO DERIVATION REPORT ACCOMPANIES THIS DOCUMENT. `fh-char/1` has nowhere to keep it… (texte long, verbatim dans le fichier) |
| aucunAvertissement | No warnings. |
| compteNonDerive | "Underived" declarations received: |
| nonConsommes | Player choices no rule consumed — they leave NO trace on the sheet: |
| orphelines | Declarations that attach to no section of this document: |
| nonDerive | Underived — what the engine could not establish, and why: |
| videSansRaison | Empty, and the report gives no reason for it. |
| resolvedAbsent | THIS DOCUMENT CARRIES NO `resolved`: there is no sheet to display. |
| listeVide | empty list |
| objetVide | empty object |
| nul | null |
| chaineVide | empty string |
| oui | true |
| non | false |
| sansNom | (unnamed) |
| sansLibelle | (section without a label) |
| surcharge | overridden |
| adressable | Valid override path. |
| sansIdentite | UNADDRESSABLE: this element has no `id` — the override grammar names it by identity and refuses an index. |
| horsGrammaire | UNADDRESSABLE: this path does not fit the grammar of `$defs/overridePath`. |
| enteteHorsResolved | These fields live outside `resolved`: no override can target them. |

`tests/render-fiche-en.test.mjs` garde la parité de clefs entre les deux
paquets (français ↔ anglais), donc si l'un gagne une clef demain, l'autre
rougit — pas de dérive silencieuse.

---

## 5. Ce que la fiche montre, qui surprend — je suis le premier à la regarder

1. **La page est bilingue, et c'est correct, pas un bug.** Les mots
   d'INTERFACE sont anglais (« Derivation report », « Underived — what the
   engine could not establish, and why: »), mais les RAISONS que le moteur
   écrit dans `underived[].reason` sont en FRANÇAIS — verbatim, telles que
   `src/build/derive.mjs`/les modules FH les composent aujourd'hui (ex. sous
   « Skills » : *« skills (arrière-plan) — le record d'arrière-plan ne porte
   pas `skill_ids` (contrat §3) ; `skill_proficiencies` y donne des noms
   affichables. »*). C'est exactement la loi §0.13 tenue à la lettre : le
   moteur ne connaît que ce qu'il a écrit, l'écran ne traduit RIEN de ce
   contenu — seulement ses propres mots de chrome. Le résultat, pour la table
   d'Eric le 7 novembre, est une page où l'ossature est en anglais et une
   bonne partie des explications de refus sont en français tant que le
   moteur ne les publie pas en anglais lui-même. **Ce n'est pas dans le
   périmètre de ce lot de corriger** (ce serait modifier `src/build`, hors
   `render-fiche.mjs` — interdit par la commande), mais c'est visible dès le
   premier coup d'œil et vaut d'être signalé.
2. **`resolved.derivation.stack` publie un hash SHA-256 complet par couche**,
   affiché tel quel (`resolved.derivation.stack[srd-5.2.1-en].hash
   bb9d2d242adbcfd331bd15385b6d4486a5c8d53f0d080bc540b5d55bfeffc1c1` — 64
   caractères). Techniquement juste (chaque valeur porte son chemin, sans
   exception), mais visuellement, c'est la plus longue chaîne de toute la
   fiche, sans espace insécable ni troncature : à l'oeil nu, sur un écran
   nu, elle domine la rubrique Derivation. Un candidat naturel pour un futur
   lot de style (masquer/tronquer avec un titre complet), pas pour celui-ci.
3. **Le personnage d'exemple porte une surcharge (override) VISIBLE et
   MOTIVÉE dans la fiche** : `resolved.vitals.hpMax` affiche `9`, marqué
   « overridden · gm — *The GM grants one extra hit point: the night of
   study counts as a Long Rest here.* » directement à côté de la valeur.
   C'est la première fois qu'une décision de MJ apparaît, en clair, à côté
   du chiffre qu'elle a changé — pas dans un journal séparé.
4. **Sans mise en page, la densité de la page est très supérieure à ce
   qu'on imagine en lisant le code.** Le personnage d'exemple (magicien
   elfe niveau 1, quatre couches FH montées) rend plusieurs centaines de
   valeurs adressées (le test du lot 25 l'affirmait déjà — « des centaines »
   — mais le VOIR, sur une seule page qui défile sans onglet ni repli, sans
   un seul style, est un ordre de grandeur différent de le lire dans un
   test). C'est exactement l'instrument « tranche 0 » que la commande
   annonçait, pas une maquette — et il donne une bonne intuition de
   POURQUOI le tri « ça reste visible / ça part derrière un onglet », que la
   commande réserve explicitement à un geste d'Eric plus tard, sera
   nécessaire : à l'état nu, cette page est un mur.
5. **`resolved.stats[fh:skill-points]` porte un détail de dérivation très
   long** (imposed.background, imposed.class-tools, imposed.tool, feat…),
   chaque terme avec sa propre phrase d'explication en français — c'est la
   rubrique la plus verbeuse de toute la fiche, alors que c'est aussi celle
   que le lot 39 avait dû câbler à la main (compteur Pool/Class/Species) à
   l'étape Compétences. Voir les deux côte à côte (Skills, câblé à la main ;
   Review, généré par la marche générique) est la meilleure preuve que la
   généricité de `render-fiche.mjs` fonctionne : zéro ligne de ce fichier ne
   connaît « fh:skill-points », et pourtant chaque terme s'affiche avec son
   libellé et sa valeur, sur sa propre ligne.

---

## 6. Ce que j'ai changé de la commande, et pourquoi

1. **`render(document, report, lang = "fr")` — un TROISIÈME paramètre
   optionnel, pas prescrit littéralement par la commande.** La commande
   dit « ajoute un paquet anglais… ne traduis pas en place », sans préciser
   COMMENT le rendu choisit son paquet. Mesuré : les 20 tests existants
   appellent `render(document, report)` à deux arguments et doivent rester
   verts sans modification (loi §0.7 — on ne réécrit pas un test sans
   motif). Un troisième paramètre optionnel, défaut `"fr"`, préserve
   exactement le comportement d'avant pour tout appelant à deux arguments,
   et `shell.mjs` passe `"en"` explicitement. C'est la plus petite surface
   de contrat qui satisfait à la fois « ne traduis pas en place » et « les
   20 tests français restent verts ».
2. **`MOTS`/`MOTS_EN` consultés via un accesseur `createLabels(...)` qui
   JETTE, `LIBELLES`/`LIBELLES_EN` consultés en clef nue, SANS jeter.** La
   commande dit « reprends la discipline de `labels.mjs` telle quelle » sans
   distinguer les deux paquets. Mesuré, dans `render-fiche.mjs` lui-même
   (commentaire du lot 25, ligne 40 avant ce lot) : `LIBELLES` a TOUJOURS eu
   un mode de repli documenté et testé (« une rubrique que le contrat
   ajouterait demain s'affiche quand même, sous sa clef nue et marquée
   "sans libellé" » — `tests/render-fiche.test.mjs`, ligne ~289). Faire
   jeter `LIBELLES`/`LIBELLES_EN` aurait donc RETIRÉ une garantie déjà
   gardée par un test existant, pas juste ajouté une langue. J'ai donc
   réservé le mécanisme qui jette (`createLabels`) au SEUL paquet dont
   c'est le bon contrat : les ~22 mots d'interface, un ensemble FERMÉ que
   seul le code de ce fichier consulte, jamais une clef dynamique venue du
   document.
3. **§3c : le bouton final navigue par `STEPS.findIndex(id === "review")`,
   pas par `STEPS.length - 1`.** Mesuré : aujourd'hui les deux désignent le
   MÊME index (review est le dernier pas de la ceinture), donc le
   comportement observable n'a PAS changé par rapport à avant ce lot — le
   clic sur « Open the sheet », déjà sur Review, restait déjà un no-op
   avant ce lot aussi. Mais la commande dit « fais-le MENER à l'étape
   Review » : lire ça comme « par id », pas « par coïncidence de longueur
   de tableau », rend le code correct par CONSTRUCTION plutôt que par
   accident de position — un lot futur qui réordonnerait `STEPS` ne le
   casserait pas en silence. Signalé plutôt que décidé sans le dire : si
   l'intention derrière « mène à Review » était différente (par exemple, un
   CTA visible plus tôt dans le parcours, avant Skills), **question ouverte
   §7**.
4. **Aucun style neuf, y compris pas une classe CSS vide « au cas où ».**
   La commande offre le choix (« la fiche prend les jetons du lot 38, ou
   elle reste nue. Le garde tranchera. »). J'ai choisi « nue » sans
   ambiguïté : zéro règle CSS ajoutée à `shell.css`, seulement un conteneur
   `<div class="review-fiche">` sans style associé — le garde du lot 38
   (`tests/ui-jetons.test.mjs`, scanné après §3, toujours vert) n'a donc
   RIEN à trancher, il n'y a rien à gouverner. Le choix « nue » colle au
   plus près à « zéro design sur cette étape » (§2 de la commande) : une
   page qui défile, littéralement sans une seule décision visuelle prise à
   sa place.

---

## 7. Questions ouvertes pour l'architecte

1. **Le vocabulaire bilingue de la fiche** (§5 point 1) — les raisons
   `underived[].reason` restent en français tant que le moteur les compose
   en français. Est-ce attendu pour la table du 7 novembre (Eric lit les
   deux langues), ou faut-il, dans un lot de moteur (hors `render-fiche.mjs`,
   donc hors ce lot), publier ces phrases via un paquet de mots anglais côté
   `src/build`/`src/modules/fh`, symétrique à ce que ce lot vient de faire
   côté écran ?
2. **§3c, l'intention derrière « mène à Review »** (§6 point 3) — le
   changement que j'ai fait (par id, pas par position) ne change RIEN
   d'observable aujourd'hui, puisque Review est déjà le dernier pas. Si
   l'architecte avait en tête un CTA différent (un raccourci « voir la
   fiche » disponible plus tôt, avant la fin du parcours), c'est une
   fonctionnalité neuve que je n'ai pas mandat d'inventer (loi §0.10) — à
   trancher séparément si c'est le cas.
3. **Le hash de couche à 64 caractères, non tronqué** (§5 point 2) — visible
   et correct, mais domine visuellement la rubrique Derivation sur une page
   sans style. Le tri « garder tel quel / tronquer avec titre complet » est
   exactement le type de décision que la commande réserve à « un geste
   d'Eric, plus tard, devant la page » (§2) — signalé, pas touché.
4. **Le compte de `tests/render-fiche.test.mjs`** (§1) — 20 tests mesurés,
   pas 27. Aucune conséquence sur ce lot (les 20 couvrent bien les cinq
   garanties citées), mais à corriger dans une future commande si le
   nombre 27 est réutilisé ailleurs.
