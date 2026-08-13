# Lot 51 — l'inventaire

**Branche** : `51-repartition-figee`, coupée de `main` à `33337a4` (remesuré : `git -C ~/tools/fhpc rev-parse --short main` → `33337a4`, identique au SHA annoncé par la commande, identique au `git log` du worktree).

**Tests** : **801 verts au départ** (`npm ci` puis `npm test`, mesuré avant toute ligne de code — conforme au nombre annoncé). **806 verts à l'arrivée** — **+5 nets** : `tests/abilities-step.test.mjs` perd 1 test (l'ancien `optionsForRow(rollBatch, key)` par filtrage, dont la prémisse ne tient plus) et en gagne 6 (nouvelle version du même test par signature, la preuve du défaut §0, l'échange, deux dés identiques à l'échange, le cas limite d'une rangée non servie, et un garde d'octets sur `shell.mjs` — voir §5 plus bas pour ce dernier).

**Périmètre tenu** : `ui/builder/abilities-step.mjs`, `ui/builder/shell.mjs`, `tests/abilities-step.test.mjs`. **`ui/builder/shell.css` n'a pas été touché** — la forme choisie (§2 ci-dessous) dit « qui tient le dé » par le TEXTE du libellé, pas par une règle CSS nouvelle, ce qui suffisait à respecter §1c sans ouvrir un cinquième fichier. `git diff --stat` liste exactement les trois fichiers ci-dessus. Zéro ligne touchée dans `src/` (le lot 52 y travaille). Aucun `git push`, aucune fusion.

---

## 1. Le défaut, remesuré avant tout code

Servi sur `ui/builder/`, exactement comme §0 de la commande le décrit : après avoir distribué les six dés d'un tirage, les six rangées tombaient à **1 option, 0 cliquable** chacune. La cause, lue dans `optionsForRow(rollBatch, key)` (lot 50) : elle rendait « les dés gardés MOINS ceux déjà pris par les AUTRES clefs ». Une fois les six posées, « les autres clefs » couvrent les cinq dés qui ne sont pas les siens — il ne reste que le sien, déjà actif (cliquer dessus ne fait rien, `renderPicker` le sait déjà). Zéro geste, dans n'importe quelle rangée.

Le lot 50 n'a pas mal travaillé : son test de réassignation (« réassigner une rangée déjà servie libère le dé précédent ») gardait TOUJOURS un dé libre sous la main — jamais le cas où les six sont posées en même temps, qui est pourtant l'état NORMAL en fin d'étape.

## 2. La forme retenue — §1a/§1b/§1c de la commande, tenues à l'octet

- **`optionsForRow(rollBatch)`** (une seule signature, plus de `key`) rend **toujours** les six index du lot gardé, quel que soit l'état de `assign`. C'est `selected` (dans `renderAssignRow`) qui distingue « le sien » (actif, un clic ne fait rien) des cinq autres (inactifs, cliquables).
- **Cliquer un dé tenu par une autre rangée les ÉCHANGE** : `renderAssignRow` pose toujours la même action, `{kind:"assignAbilityRoll", key, rollIndex, value}` — **inchangée depuis le lot 50**. C'est `shell.mjs` (`applyDecisionAction`, action `assignAbilityRoll`) qui, en la recevant, retrouve `holderKey` (l'autre clef qui pointait déjà vers `rollIndex`, s'il en existe une) et échange les deux entrées de `assign`. `abilities-step.mjs` reste un pur rendu — il ne fait ni le swap ni le document.
- **§1c, « rien ne se cache »** : la forme choisie est le **texte du libellé**, pas une couleur ni un attribut invisible — `labelOf` rend `"16 (DEX)"` au lieu de `"16"` quand une AUTRE rangée tient ce dé. Choisi plutôt qu'une classe CSS parce que (a) ça respecte la lettre du §1c (« jamais en compressant un libellé », et la compression est exactement ce qu'une pastille de couleur seule aurait fait pour un lecteur d'écran ou une capture en niveaux de gris), et (b) ça n'ouvre pas `shell.css`, dont les six gardes d'octets (aucune couleur/taille/espace littérale) auraient exigé un nouveau jeton pour une seule règle. Vérifié à l'écran (§4) : `"16 (STR)"`, `"12 (WIS)"`, etc., lisibles sans survol ni ambiguïté.
- **§1d, le document ne gagne rien** : un échange normal est deux `verbs.set()` (un par clef) et deux entrées de `assign` qui permutent — jamais un troisième chemin, jamais un champ neuf.

## 3. Le cas limite (§1b de la commande) — mesuré, choisi, justifié

**La question posée par la commande** : la rangée qu'on édite (`action.key`) peut ne pas être servie par le lot (elle porte encore une valeur du document, comme le `13` de CON avant tout tirage). Échanger avec elle veut dire quoi ?

**Choisi** : elle échange QUAND MÊME — elle prend l'index cliqué (`newAssign[key] = rollIndex`), mais comme elle n'avait RIEN à rendre (`prevIndex === null`), l'ancien titulaire (`holderKey`) redevient simplement `null` dans `assign` (non distribué), **sans qu'un second `set()` ne parte** pour lui. Sa valeur de document reste celle qu'il portait déjà — jamais effacée, jamais retouchée pour rien.

**Pourquoi ce choix plutôt qu'un autre** :
- Refuser le geste (ne rien faire si la rangée cible n'a pas de dé à rendre) romprait §1a : la case serait redevenue non cliquable pour CE dé précis, dans CETTE rangée précise — une exception silencieuse à « toujours six, cinq cliquables ».
- Écrire quand même une valeur pour `holderKey` (par exemple recopier la valeur du document AVANT ce lot) inventerait un nombre que personne n'a tiré ni choisi — une vraie « case qui apparaît de nulle part », le genre de défaut que §1d interdit.
- Laisser `holderKey` sur sa valeur déjà posée, en disant seulement « ce n'est plus de ce tirage », est le SEUL geste qui ne fabrique rien ET ne bloque rien : c'est exactement le même principe que §2c du lot 50 (« la valeur courante du document reste visible, jamais confondue avec un dé du lot »), appliqué au moment où une rangée EN PERD un plutôt qu'au moment où elle n'en a jamais eu.

**Vu à l'écran** (§4 ci-dessous, scénario reproduit deux fois) : cliquer un dé tenu par une autre rangée, depuis une rangée non encore servie, assigne bien la rangée cliqueuse et fait retomber l'ancien titulaire sur « — not from this roll », sur SA valeur déjà posée (jamais un tiret, jamais une valeur inventée).

## 4. Ce qui a été vu à l'écran (§3 de la commande — « REGARDE-LE »)

Servi sur `http://localhost:8972/ui/builder/` (le `.claude/launch.json` du worktree pointait sur un port déjà pris par une AUTRE session, exactement le même piège que le lot 50 a documenté — contourné de la même façon : `python3 -m http.server` à la main sur un port libre, fichier `.claude/launch.json` jamais touché). Viewport 1280×720 (desktop), donc au-dessus du seuil de bascule à 720px — vérifié AVANT de juger la mise en page (avertissement de la commande).

- **Avant tout tirage** : chaque rangée montre sa valeur du personnage d'exemple (« not from this roll »), aucune option (picker vide, `optionsForRow(null)` → `[]`).
- **Après `Roll`** : dix dés apparaissent, six gardés. **Les six rangées montrent, chacune, les SIX mêmes options** — confirmé par lecture de page, pas seulement par capture.
- **Assignation de STR à un dé (16)** : STR passe à « from this roll » ; TOUTES les cinq autres rangées affichent désormais ce dé sous le libellé `"16 (STR)"` — jamais `"16"` nu — pendant que le SECOND dé à 16 du même lot reste `"16"` (nu, libre) : les deux dés identiques restent bien deux options distinctes même sous ce nouveau libellé.
- **L'échange, scénario 1 (rangée cible SERVIE)** : STR=15, DEX=12 (deux valeurs distinctes, toutes deux « from this roll »). Clic sur `"12 (DEX)"` dans la rangée STR → **STR passe à 12, DEX passe à 15**, les deux restent « from this roll » — jamais l'une vide, jamais les deux sur le même dé. Reproduit une seconde fois **à partir d'un état où les SIX rangées étaient distribuées** (le test qui prouve le lot, rejoué à la main) : même résultat, six rangées toujours « from this roll » après l'échange.
- **L'échange, scénario 2 (rangée cible NON SERVIE, le cas limite §1b/§3 ci-dessus)** : CON non distribuée (encore sur sa valeur de document), clic sur un dé tenu par WIS → CON prend ce dé (« from this roll »), WIS retombe sur « — not from this roll », **toujours sur sa valeur déjà posée** (jamais un tiret, jamais 0). Exactement la mesure §3.
- **Distribution complète, six rangées servies** : chaque rangée affiche encore ses SIX options — la sienne (active, non cliquable) et les cinq autres, chacune nommée par sa clef porteuse (`"15 (DEX)"`, `"10 (CON)"`, …). **C'est le point exact où le défaut du §0 réduisait tout à une seule option** — vérifié en lisant le texte de la page à cet état précis, pas supposé.
- **Manuel** : basculé sur « Manual entry » après une distribution complète — les six rangées affichent 1..20, et **portent déjà les valeurs posées par le tirage** (`Final` inchangé). Aucune régression, mode non touché par ce lot.
- **400px** (avertissement de la commande sur le seuil à 720px) : la mise en page bascule bien en disposition étroite (options empilées verticalement, `"15 (DEX)"` sur deux lignes) — ce n'est PAS une coquille cassée, c'est le comportement `--bp-hint: narrow` déjà en place, revérifié en DESKTOP avant de conclure quoi que ce soit.

## 5. L'attaque manuelle, et ce qu'elle a trouvé

Attaque demandée par la commande (§2, fin) : neutraliser un garde, vérifier que **le test visé et lui seul** rougit, restaurer, `diff` byte-à-byte, suite complète rejouée.

**Première mesure, INATTENDUE** : j'ai d'abord retiré `if (holderKey) newAssign[holderKey] = prevIndex;` de `shell.mjs` (la ligne qui fait l'échange) et rejoué **toute la suite** — **806/806 restaient verts**. Aucun test, dans ce fichier ou ailleurs, n'aurait accroché une régression réelle dans `shell.mjs` : `applyAssignAbilityRoll` (le test-helper qui rejoue « ce que shell.mjs ferait ») est une COPIE écrite pour ce lot, elle prouve que SA PROPRE logique est cohérente, jamais qu'elle correspond au fichier réel. Ce n'est pas une négligence de ce lot : `shell.mjs` n'a AUCUN export et exécute son propre `render()` à l'import (voir son bas de fichier) — aucun lot avant celui-ci n'a pu lui donner de harnais de rendu, et « garde 11 » de `tests/ui-jetons.test.mjs` existe déjà pour la même raison (un garde d'octets, posé par l'architecte, parce qu'aucun autre n'était possible pour la branche `roll`).

**Signalé plutôt que contourné** : plutôt que de prétendre que le test-helper suffisait, j'ai ajouté un garde d'octets dans `tests/abilities-step.test.mjs` (même patron que « garde 11 », mais posé ICI parce que c'est ce fichier-ci, pas `tests/ui-jetons.test.mjs`, qui est dans le périmètre de ce lot) : il lit `shell.mjs` (dépouillé de ses commentaires par `stripComments`, importé de `tests/source-scan.mjs`) et exige la présence de `newAssign[holderKey] = prevIndex`. Ce garde a ses limites, dites dans son propre commentaire : c'est un garde d'OCTETS, il peut manquer une régression qui garde la forme mais change le sens.

**L'attaque, rejouée avec le garde en place** : même mutation (retirer la ligne) → **exactement un test rougit** (`garde — shell.mjs ÉCHANGE vraiment…`), la suite complète (806) reste verte à côté. Restauré (`cp` depuis une copie prise avant l'attaque), `diff` confirme l'identité byte à byte, `npm test` rejoué : **806/806 verts**.

## 6. Ce qui a été changé de cette commande

- **`optionsForRow` a perdu son second paramètre (`key`)** — pas demandé explicitement, mais nécessaire : la fonction ne dépend plus DU TOUT de la clef qui regarde (§1a, « toujours les six, pour tout le monde »). Le garder aurait été un paramètre mort. Les appels existants dans les tests du lot 50 (`optionsForRow(rollBatch, "dex")`) sont mis à jour vers `optionsForRow(rollBatch)`.
- **Un garde supplémentaire, non demandé par la commande** (§5 ci-dessus) : ajouté après avoir MESURÉ que l'attaque manuelle ne trouvait rien à faire rougir sans lui. La commande demandait l'attaque ; elle ne demandait pas explicitement de poser un nouveau garde si l'attaque révélait un trou — mais laisser le trou ouvert après l'avoir mesuré aurait été le contournement que le lot 50 (aria-label) et le lot 47 (nom de verbe) ont tous les deux refusé de faire. Signalé ici en toute transparence : ce garde est d'OCTETS, pas de comportement — la preuve la plus forte de ce lot reste la vérification manuelle au navigateur (§4).
- **`shell.css` n'a pas été touché** — la commande listait le fichier dans le périmètre autorisé, sans exiger qu'il le soit. La forme retenue (texte du libellé) tient §1c sans lui.

## 7. Ce qui a surpris

- **L'attaque manuelle sur `shell.mjs` ne trouvait RIEN à faire rougir**, alors que la logique venait d'être écrite spécifiquement pour cette commande — pas parce que le code était trivial, mais parce qu'AUCUN test de ce dépôt ne rejoue jamais `shell.mjs` lui-même (voir §5). Suspecté d'abord mon propre protocole (peut-être un test existant couvrait déjà ce chemin ?) avant de confirmer, en lisant `applyAssignAbilityRoll`, qu'il s'agissait bien d'une copie et non d'un appel réel.
- **Le même piège de port que le lot 50** (`.claude/launch.json` du worktree en conflit avec une autre session sur le même port) — contourné de la même façon documentée dans `INVENTAIRE-LOT-50.md`, cette fois sans perdre de temps à le redécouvrir.
- **Le clic « ref-based » (via `read_page`) a plusieurs fois désynchronisé** après un re-rendu (ref devenu stale, ou un clic à des coordonnées pixel qui n'atteignait pas le bon bouton après un re-scroll automatique de `recenterBelt`) — jamais un défaut du builder, uniquement de l'automation : confirmé qu'il fallait relire la page (`read_page`) après CHAQUE clic qui déclenche un re-rendu, jamais réutiliser un `ref` d'avant.
