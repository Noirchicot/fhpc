# Les règles du socle de rendu — lot 58

> À côté du code exprès. **Les lots d'écran lisent ce fichier au lieu de
> deviner.** Il tient sur une page ; s'il grandit, c'est que le socle a
> grandi, et c'est ça qu'il faut regarder.


> ## 📚 CES TROIS FICHIERS SONT UN SEUL CORPUS *(Eric, 2026-08-29)*
>
> *« Ok que ça soit dans trois fichiers, mais **l'application au builder est la même**. »*
>
> | fichier | ce qu'il porte |
> |---|---|
> | **NORMES.md** | **les organes** : jeton, collecteur, bouton, liste, popup · les voiles et le relief · les cotes partagées · l'écriture · les gestes |
> | **CADRES.md** | **les écrans** : F · FF · FS, la carte, la dalle, la tuile · les largeurs (`--card-w`, `--panel-w`, `--grid-w`, `--measure`) · l'habillage `D-` · `data-bleed` |
> | **SOCLE.md** | **le mécanisme** : qui possède quoi, les trois verbes, ce qui ne se redessine jamais, le contrat d'un écran |
>
> ⭐ **TROIS PORTES, UNE SEULE LOI.** Le découpage sert à trouver, pas à cloisonner : aucune règle
> n'est vraie « seulement dans son fichier ». Une règle d'organe vaut sur tous les écrans, une cote
> d'écran vaut pour tous les organes qu'il porte, et le mécanisme vaut pour les deux.
>
> ⚖️ **AVEC LES EXCEPTIONS NOMMÉES** — la règle d'Eric du 26/08 : *« il y aura des exceptions pour
> tokens et collecteurs, mais ils doivent être argumentés »*. Une exception se **nomme** (jamais un
> `:nth-child` qui devine) et se pose **à côté de son argument**.
>
> ⚠️ **NOMMER N'EST PAS METTRE À L'ABRI**, et ça a coûté trois lots le 29/08 : trois régimes de
> rangement écrits en `:not()` l'un de l'autre étaient tous nommés — et se sont battus quand même,
> parce qu'**une exclusion de plus déplace la spécificité**. La forme sûre est un attribut à
> plusieurs valeurs (`data-rangs`), qui donne à tous les cas la MÊME spécificité.
>
> 📌 **PORTÉE : LE BUILDER.** Le site du livre (`fh-phb`) a sa propre feuille et n'est pas régi
> ici. L'étendre est une décision d'Eric, pas une conséquence de ce paragraphe.

---

## La règle de rendu tranchée : **B**

`ERGONOMIE-BUILDER.md` §RENDU laissait trois issues à `app.innerHTML = ""` :
**A** mémoriser/restaurer le défilement · **B** ne redessiner que ce qui
change · **C** garder la coquille, remplacer l'intérieur de la scène.

**Tranché : B**, et il contient A comme cas particulier.

| Niveau | Ce qui se passe |
|---|---|
| **Le cadre** (molette, ligne de commande, scène, chevrons) | **Construit UNE FOIS, jamais remplacé.** On y écrit des attributs, jamais des nœuds. C'est le **B**. |
| **L'intérieur de la scène** | Encore reconstruit d'un coup, **mais le défilement survit** (`swapContent`). C'est le **A**, à l'intérieur du seul endroit qui reconstruit encore. |

> ⚠️ **DEUX MOTS POUR NE PAS LES CONFONDRE.** Eric appelle la surface qui
> défile « **la fiche** » (B0.21), et le français du dépôt le suit. Mais en
> CODE elle s'appelle **`.stage`** : `src/tools/render-fiche.mjs` émet déjà
> `<article class="fiche">` pour la **feuille de personnage**. Les deux sous
> le même nom, mesuré : la feuille de Review héritait `position: absolute` et
> s'affichait dans une boîte de hauteur zéro. **`fiche` = la feuille ;
> `stage` = la surface qui défile.**

📌 **Pourquoi pas B partout.** Descendre le « ne redessine que ce qui
change » jusqu'à la ligne de compétence, c'est écrire un moteur de diff —
le mini-framework de 2 000 lignes que la commande interdit. Le cadre suffit
à tenir les cinq invariants ; le reste est un coût qu'aucun défaut mesuré
ne réclame aujourd'hui.

## Qui possède quoi

| L'état | Où il vit | Qui l'écrit |
|---|---|---|
| Le **document** du personnage | `state.document` | `applyDecisionAction` seul, par un verbe du moteur |
| L'**étape** courante, le **palier** de Validate, le plan ouvert | `state` (`shell.mjs`) | `shell.mjs` seul |
| Le **cran d'aimantation** (quelle fiche est sous le doigt) | `state.classCursor` | **le scrollspy**, et lui seul |
| La **position de défilement** | le nœud DOM lui-même | personne — elle se conserve, elle ne se stocke pas |
| Le **minuteur** des chevrons | la fermeture de `mountChevrons` | lui-même |
| La **vérité « ça défile »** (lot 70) : `data-visible` sur l'hôte des chevrons, `data-more` sur la scène, `disabled` sur les deux boutons | des attributs, sur des nœuds qui ne meurent pas | **`mountChevrons` seul** — un garde le prouve (`tests/chevrons.test.mjs`) |

## Qui possède quoi — côté DONNÉES : SRD · SRFH · SRFH+

> **Ratifié par Eric le 2026-08-23.** ⚠️ **La source est sa note du vault**,
> `FH-WEB/FHPC/FHPCv2 SRFH et SRFH+.md` — ce qui suit n'en est qu'un **tirage**.
> ⛔ **On ne corrige JAMAIS le contrat ici** : on corrige la note d'Eric, puis on
> resynchronise ce tirage. Un lot qui amenderait ce texte croirait amender la
> règle et ne toucherait qu'une copie. *(Publié dans le dépôt le 03/09 parce
> qu'un contrat qui ne vit que dans le vault n'existe pas pour qui le cherche :
> `grep srfh+` rendait zéro sur les deux dépôts, dix jours après la ratification.)*

| | ce que c'est | la loi |
|---|---|---|
| **SRD** | le livre, copié fidèlement | ⛔ **« On n'y écrit jamais rien de nous »** |
| **SRFH** | la zone grise — *« les petits ajustements quality of life »* | quelqu'un doit pouvoir **jouer du SRD pur** avec elle |
| **SRFH+** | *« la couche Fate's Hand, c'est tout »* | ce qui n'appartient qu'à nous et ne prétend rien être d'autre |

**LE TEST, ET IL PORTE SUR LE NOM, PAS SUR LE CONTENU** — *« si on change ça,
est-ce que ça s'appelle encore le SRD ? »* Oui, sans hésiter → **SRD** · On ne
sait pas → **SRFH** · Non, clairement → **SRFH+**.

### ⭐ CE QUE LE CONTRAT DIT À UNE COUCHE QUI PATCHE

Une couche FH ne modifie pas un record `srd:` : elle **pose le sien** et pointe
vers lui (`data.extends`), comme `srfh-shelving-en` le fait sur ses 416 objets.

⭐ **Et ça a une conséquence que le chantier a payée avant de la comprendre :
une couche qui respecte le contrat vise une ADRESSE ; une couche qui l'enfreint
finit par viser un MOT — et un mot a une langue.**

Mesuré le 03/09 sur les 89 patches des couches FH :

| ce que le chemin vise | nombre | ce que ça donne |
|---|---:|---|
| un **champ de schéma** — `data[fiche_stats]`, `data.category`… | **79** | même nom dans les deux langues · ✅ insensible au rendu |
| un **élément de contenu** désigné par un mot — `data.traits[keen-senses]` | **10** | ⛔ n'existe que dans une langue |

Les dix sortent tous de **`fh-species-en`**, et ils portent des règles FH (le
retrait de `Resourceful`, la conversion PROF…) — donc du **SRFH+ écrit dans le
SRD**. Effet mesuré : la couche **refuse de se monter** au-dessus du SRD
français, et un personnage FH en français est impossible à construire.
⛔ Ce n'est pas un défaut de langue, c'est la violation qui se voit.
📌 Le relevé complet et les routes chiffrées : `fh-srd/docs/TRAIT-KEYS.md` ·
le garde : `tests/layers-traits-fr.test.mjs`.

## Les trois verbes, et rien d'autre

| Verbe | Quand | Ce qu'il fait au défilement |
|---|---|---|
| **`refresh()`** | un choix a été fait, l'écran doit se remettre à jour | **il survit** |
| **`openSurface()`** | une **nouvelle surface** apparaît : changement d'étape, ou changement de palier | **il repart en haut**, délibérément |
| *(rien)* | on **défile** | 🔴 **le défilement ne redessine JAMAIS.** Il écrit l'état et met à jour la surbrillance à la main |

⛔ **La troisième ligne est la plus importante du fichier.** Un scrollspy qui
appelle `refresh()` se mord la queue : le redessin bouge le défilement, qui
rappelle le spy. Le spy **écrit `state`, touche un attribut, et s'arrête là.**

## Ce qui ne se redessine JAMAIS

- `.belt` et ses dix crans — **les nœuds sont créés une fois**, seuls
  `data-status` / `aria-current` changent ;
- `.command` — les deux boutons (`Show plan`, `Validate`) sont les **mêmes
  nœuds** du début à la fin de la session ;
- `.stage` — **le conteneur qui défile** ne meurt jamais (son contenu, si) ;
- `.stage-chevrons` — avec son minuteur ;
- `.stage-aside` — la barre de navigation interne (B0.19) : le **slot**
  persiste, ce qu'un écran y met peut changer.

## Ce qui doit survivre à une mise à jour

Les cinq de `ERGONOMIE-BUILDER.md` §RENDU, et où chacune est logée :

| Ce qui survit | Comment |
|---|---|
| la position de défilement (**II.1**) | `swapContent` la relit et la repose |
| l'observation du défilement (**II.3**) | `watchSnap` pose **un** écouteur sur un nœud qui ne meurt pas, et **ne retient aucun élément** — il relit `[data-snap]` à chaque lecture |
| le minuteur des chevrons (**I.7**) | `mountChevrons`, fermeture posée une fois |
| l'état d'un popup (**III.4**) | ⏳ **pas construit** — aucun écran de ce lot n'en a. Il vivra dans `state` comme le reste, jamais dans le DOM |
| le palier de `Validate` (**I.4**) | `state.palier`, hors du DOM par construction |

## Les quatre fonctions du socle

`socle.mjs` — et le fichier doit rester lisible d'un coup d'œil.

- **`swapContent(node, children)`** — 🔴 **le SEUL endroit du dépôt qui
  remplace le contenu d'un nœud.** Un garde le prouve
  (`tests/socle.test.mjs`), sur le modèle de `markPressed()` (lot 57) :
  une brique, un écrivain, un garde.
- **`keepInView(scroller, child, axis)`** — remplace `scrollIntoView`, qui
  remonte toute la chaîne des ancêtres et **déplaçait la page entière**
  (défaut §0, seconde moitié). Un garde interdit `scrollIntoView` dans
  `ui/`.
- **`watchSnap(scroller, onSettle)`** + **`nearestIndex(offsets, target)`** —
  le scrollspy-sélecteur. La décision est une fonction **pure**, testée ; la
  géométrie se regarde dans le navigateur.
- **`mountChevrons(host, scroller)`** — les chevrons flottants, leur
  minuteur, **et la vérité « ça défile »** (lot 70) : pas de mou → tout
  s'éteint (chevrons ET amorce `data-more`) ; un bout de course → la
  direction s'éteint (`disabled`) ; la souris posée ou le focus **clavier**
  (`:focus-visible` — un focus de clic ne retient pas, mesuré gelé sinon)
  retiennent le minuteur. Il rend `{ step, settle }` : **`settle()`** relit
  la géométrie après un remplacement (appelé par `refresh()`),
  **`settle(true)`** annonce en plus une surface neuve qui défile — une
  seconde de B0.22b, l'indicateur iOS qui flashe à l'ouverture d'une vue
  (appelé par `openSurface()`). La machine à états est testée
  (`tests/chevrons.test.mjs`) ; l'opacité et le masque se regardent au
  navigateur.

⛔ **N'ajoute rien ici sans un écran qui en a besoin AUJOURD'HUI.** Le piège
nommé par la commande du lot : un socle écrit pour des besoins imaginés,
avant qu'un seul écran fonctionne.

## L'échelle — un organe hors socle, mais qui obéit à sa loi

`echelle.mjs` (lot 85) pose **deux attributs sur `<html>`** — `--echelle` et
`data-grandeur` — et **aucun nœud**. C'est la règle du cadre appliquée telle
quelle : changer de taille ne redessine rien, le navigateur remet en page tout
seul, et **le défilement survit**.

⚠️ **`resize` passe désormais par `surRedimensionnement`** : l'échelle se repose
AVANT `refresh()`, parce qu'en mode automatique le cran dépend de la fenêtre.
L'ordre compte — sinon l'écran se redessine sur la grandeur d'avant. 🔴 Et c'est
toujours `refresh()`, **jamais `openSurface()`** : tourner la tablette ne renvoie
pas le joueur en haut de l'écran qu'il lisait (garde E ter).

---

## Le contrat d'un écran

Un module d'écran exporte une fonction qui **rend un nœud** et ne connaît
ni la coquille ni les verbes du moteur (loi des lots 39/42, inchangée).

Ce que le lot 58 ajoute, et **seulement pour les écrans qui en ont besoin** :

- **des paliers.** Un écran peut exporter un descripteur de paliers lu par
  `shell.mjs` — `{ label, ready, commit }`. Un écran qui n'en exporte pas a
  **un** palier par défaut : *avancer*. C'est exactement ce que faisait le
  bouton `Continue` d'avant — aucun écran n'a donc à mentir sur des paliers
  qu'il n'a pas ;
- **un rail** (`.stage-aside`). La navigation interne fixe de **B0.19**, dans
  sa forme **verticale** (celle de Class). ⚠️ La forme **horizontale** (la
  molette de catégories de Compétences, B7.1) **n'est pas construite** —
  elle demandera son propre slot, et ce lot ne l'invente pas d'avance ;
- **`data-snap`** sur les fiches d'un défilement aimanté. C'est ce que
  `watchSnap` lit — le seul contrat entre un écran et le spy.
