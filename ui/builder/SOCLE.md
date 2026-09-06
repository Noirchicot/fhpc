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
>
> ## ⚖️ **LA LOI DES DEUX ÂGES** *(Eric, 2026-09-06)*
>
> **« Quand c'est ancien c'est archivé mais gardé, et une règle neuve prime sur une ancienne
> jusqu'à ce qu'on ait statué. »**
>
> 🔴 **DEUX CONSÉQUENCES, ET ELLES NE SE NÉGOCIENT PAS.**
> ① **Rien ne se supprime.** Une règle périmée est **archivée**, jamais effacée : elle porte
> l'incident qui l'a fait naître, et cet incident se repaie si on l'oublie.
> ② **La plus RÉCENTE fait foi, par défaut et sans attendre d'arbitrage.** ⛔ Un lot ne
> s'arrête pas devant deux règles qui se contredisent : il applique la neuve, marque
> l'ancienne `remplacée par`, et laisse la trace. Eric tranche après, s'il le veut.
>
> ⭐ **CE QUE ÇA CHANGE POUR CELUI QUI LIT** : le corpus a une **surface** — ce qui fait foi
> aujourd'hui — et une **profondeur** — ce qui a fait foi et qu'on garde. ⛔ Un lot ne lit
> que la surface. C'est ce qui doit ramener le corpus sous le seuil des **200 règles**
> qu'un lecteur suit vraiment.
>
> 📌 **PORTÉE : LE BUILDER.** Le site du livre (`fh-phb`) a sa propre feuille et n'est pas régi
> ici. L'étendre est une décision d'Eric, pas une conséquence de ce paragraphe.
>
> 📖 **ET SA FEUILLE A UN NOM DEPUIS LE 2026-09-06 : LA *WEB BIBLE*.** Eric, ce jour-là :
> *« crée un fil qui construit une Bible pour le site web — Web Bible, différente de la Builder
> Bible. **Cite quand même dans le builder que quand on parle du site il faut visiter l'autre
> Bible.** »*
> ➡️ **Dès qu'un lot parle du LIVRE** — le bouton 📖 et où il mène, `LIVRE_ARCANES` et les autres
> sorties vers un chapitre, la loi des liens, les ancres que `sync_from_vault.py` fabrique, la voix
> du texte publié — **il va lire `fh-phb/docs/bible-web/`** *(en ligne :
> `noirchicot.github.io/fh-phb/bible-web/`)*. ⛔ Un lien à sens unique ne vaut rien : la Web Bible
> renvoyait ici de son côté, à ce paragraphe et à `ecriture-loi-des-liens`.
>
> ⚠️ **CETTE ADRESSE NE RÉPOND PLUS DEPUIS LE 2026-09-06** — Eric : *« tu efface la bible sur le site WEB »*, *« les deux »*, *« uniquement sur le site »*. Les deux tirages ont quitté `fh-phb/docs/` ; la **source unique** est le corpus que vous lisez. ⛔ Le contenu de la Web Bible n'existe plus qu'à `fh-phb` `7dc6e76` — 62 adresses sans amont.

---

## La règle de rendu tranchée : **B**
📍 `socle-fiche-vs-stage` · vivante · ?
📍 `socle-regle-de-rendu-b` · vivante · ?

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
📍 `socle-qui-possede-quoi` · vivante · ?

| L'état | Où il vit | Qui l'écrit |
|---|---|---|
| Le **document** du personnage | `state.document` | `applyDecisionAction` seul, par un verbe du moteur |
| L'**étape** courante, le **palier** de Validate, le plan ouvert | `state` (`shell.mjs`) | `shell.mjs` seul |
| Le **cran d'aimantation** (quelle fiche est sous le doigt) | `state.classCursor` | **le scrollspy**, et lui seul |
| La **position de défilement** | le nœud DOM lui-même | personne — elle se conserve, elle ne se stocke pas |
| Le **minuteur** des chevrons | la fermeture de `mountChevrons` | lui-même |
| La **vérité « ça défile »** (lot 70) : `data-visible` sur l'hôte des chevrons, `data-more` sur la scène, `disabled` sur les deux boutons | des attributs, sur des nœuds qui ne meurent pas | **`mountChevrons` seul** — un garde le prouve (`tests/chevrons.test.mjs`) |

## Qui possède quoi — côté DONNÉES : SRD · SRFH · SRFH+
📍 `socle-qui-possede-quoi-cote-donnees-srd-srfh-srfh` · vivante · 23/08

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
📍 `socle-ce-que-contrat-dit-a-couche-qui-patche` · vivante · 03/09

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

### 🔴 UN ÉCRAN NE PEUT PAS RENDRE UN CONTENU QUI N'EST PAS ÉCRIT
📍 `socle-ecran-ne-peut-pas-rendre-contenu-qui-n-est-pas-ecrit` · vivante · 03/09

> **Noté sur ordre d'Eric le 2026-09-03**, en butant dessus : la spec d'une ligne
> *« Subclasses : Sub 1, Sub 2, Sub 3 and more »* a rencontré une couche qui ne
> porte **qu'un seul nom** pour onze classes sur douze.

Relevé sur `fh-fiche-en`, les douze classes :

| | sous-classes portées |
|---|---|
| onze classes | **1** — Berserker · Lore · Life · Land · Champion · Open Hand · Devotion · Hunter · Thief · Fiend · Evoker |
| sorcerer | **2** — Draconic, Moonkeeper |

C'est le **SRD 5.2.1** qui n'en porte qu'une par classe, et la note de la couche
le dit déjà mot pour mot pour le Wizard. Les autres sont du **SRFH+** à écrire —
du manuscrit, pas du code.

**LA LOI, ET ELLE VAUT BIEN AU-DELÀ DES SOUS-CLASSES :**

⛔ **Un gabarit ne se dessine jamais sur un contenu supposé.** Avant d'écrire
l'écran, on compte ce que la couche porte VRAIMENT — pas ce que la maquette
montre, pas ce que le SRD « devrait » avoir. Une maquette dessine trois noms
parce que trois noms se dessinent mieux qu'un ; la couche en a un.

⛔ **Et un trou de contenu ne se bouche pas en code.** Ni en inventant les noms
manquants, ni en masquant la ligne, ni en choisissant à la place d'Eric ce que
l'écran raconte quand il n'a qu'un nom. *Une absence n'est jamais une réponse* —
ici elle dit « ce contenu n'est pas encore écrit », jamais « il n'y en a qu'un ».

⭐ **CE QU'ON FAIT À LA PLACE** : on livre tout ce qui ne dépend pas du trou, on
NOMME le trou avec son chiffre, et on rend à Eric la décision — *afficher ce qui
existe*, ou *attendre le contenu*. Deux routes, chiffrées ; jamais un arbitrage
silencieux enterré dans un rendu.

📌 **CE QU'ERIC A TRANCHÉ SUR CE CAS-LÀ, le 2026-09-03** — *« la ligne attend le
contenu. Rien à l'écran tant que les sous-classes FH ne sont pas écrites, c'est
du manuscrit »*. ⛔ **La ligne `Subclasses` ne se dessine pas.** Pas de nom seul,
pas de `and more`, pas de lien de remplacement : rien.
⭐ **ET C'EST LE PATRON, PAS UNE PRUDENCE** : le manque de contenu ne demande
JAMAIS un ouvrage de code. Un écran qui affiche un nom sur trois donne à lire
une vérité fausse — *« voilà les sous-classes »* — là où le silence n'en donne
aucune. Un blanc se remplit le jour où le manuscrit est écrit ; un rendu de
consolation, lui, se déracine.
⏳ **Ce qui débloque** : les sous-classes FH écrites dans la couche. Un menu
`subclasses` sur FH Web a été évoqué le même jour puis écarté avec la route —
il n'est PAS la condition, le contenu l'est.
⚠️ Et cette décision a d'abord été notée à l'envers ici : *« la ligne rend ce
qui existe + and more »* a tenu deux minutes dans ce fichier. **Une consigne
recueillie au vol se relit avant d'être gravée** — le corpus n'est pas le fil.

### ⛔ ET LE MANQUE PEUT ÊTRE DANS LA **FORME**, PAS SEULEMENT DANS LE CONTENU
📍 `socle-et-manque-peut-etre-dans-forme-pas-seulement-dans` · vivante · 04/09

> **Mesuré le 2026-09-04**, en cherchant les sous-classes que le SRD porterait
> « en plus ». Il n'en porte aucune de plus — et la raison n'est pas un contenu
> incomplet, c'est **la forme du champ**.

Les douze classes du SRD portent `data.subclass` : **un objet, au singulier**.
Pas une liste d'un élément — un objet. Vérifié sur les douze, sans exception :
`Path of the Berserker`, `College of Lore`, `Life Domain`, `Circle of the Land`,
`Champion`, `Warrior of the Open Hand`, `Oath of Devotion`, `Hunter`, `Thief`,
`Draconic Sorcery`, `Fiend Patron`, `Evoker`.

🔴 **UN ÉCRAN QUI VEUT UNE LISTE NE DEMANDE PAS DU CONTENU, IL DEMANDE UN AUTRE
SCHÉMA.** C'est un tout autre chantier : écrire trois sous-classes de plus ne
suffirait pas, il faut d'abord que le champ puisse en porter plusieurs, que la
couche FH pose les siennes à côté sans patcher le record SRD *(contrat ci-dessus)*,
et que le lecteur cesse d'attendre un objet.
⭐ **La parade, et elle est bon marché** : avant de spécifier un écran, ne
regarde pas seulement *combien* la couche porte — regarde **de quelle forme**.
Un compte à 1 se lit « il en manque » ; un champ singulier se lit « la question
n'est pas encore posée ».

### 🔴 UN INVENTAIRE QUI NE VISITE PAS LES TROIS LIEUX NE COMPTE RIEN
📍 `socle-inventaire-qui-ne-visite-pas-trois-lieux-ne-compte` · vivante · 04/09

> **Écrit faux le 2026-09-04, corrigé le jour même.** J'ai compté les
> sous-classes FH dans le **vault** et dans les **couches**, conclu *« une seule
> est écrite »*, et gravé ce chiffre. Eric : *« c'est dans FH web »*. Il y en a
> **quatre**, publiées, avec leurs chapitres :
> `moonkeeper` 4684 c · `college-of-banners` 4271 c · `silent-blade` 3372 c ·
> `spell-rigger` 4816 c, toutes quatre au menu de `mkdocs.yml`.

⛔ **Le contenu FH vit dans TROIS lieux, et un inventaire qui en oublie un se
trompe dans le sens qui rassure** — il annonce moins, donc il a l'air prudent :

| lieu | ce qu'il est | ce qu'il porte |
|---|---|---|
| le **vault** | le manuscrit | ce qu'Eric écrit |
| **`fh-phb`** | l'imprimerie | ce qui est publié sur FH Web |
| les **couches** (`layers/`) | ce que la machine lit | ce que le builder peut afficher |

⭐ **Les trois divergent, et c'est normal** : un chapitre peut être publié sans
qu'aucune couche ne le porte — c'est exactement le cas des quatre sous-classes,
lisibles par un joueur sur FH Web et invisibles au builder. *« Écrit »*, *« publié »*
et *« affichable »* sont trois états différents, jamais un seul.
🔴 **Avant tout compte, dire lequel des trois on interroge.** Un compte sans son
lieu est un chiffre sans unité.

### ⚠️ ET UN CHAPITRE PEUT PERDRE SON AMONT SANS QUE RIEN NE CRIE
📍 `socle-et-chapitre-peut-perdre-son-amont-sans-que-rien-ne` · vivante · 04/09

Trouvé en corrigeant le compte : la table de `sync_from_vault.py` fait descendre
`college-of-banners.md`, `silent-blade.md` et `spell-rigger.md` depuis
`1. Build a Character/<nom>.md` — **et ces trois sources n'existent pas** dans le
vault. Seule `Moonkeeper.md` y est.

Ces trois chapitres vivent donc **uniquement dans l'imprimerie**, en aval du
manuscrit. Une correction faite au vault ne les atteint jamais ; une correction
faite dans `fh-phb` sera écrasée le jour où quelqu'un croit que la table dit vrai.
⛔ **Une table de correspondance qui pointe vers un fichier absent ne prouve pas
que le fichier existe** — elle prouve seulement qu'on a voulu qu'il existe.
⏳ Le rapatriement appartient à Eric (*« ok pour plus tard »*, 04/09). Ce qui est
noté ici est le **fait**, pour qu'il ne se redécouvre pas une troisième fois.

## Les trois verbes, et rien d'autre
📍 `socle-trois-verbes-du-rendu` · vivante · ?

| Verbe | Quand | Ce qu'il fait au défilement |
|---|---|---|
| **`refresh()`** | un choix a été fait, l'écran doit se remettre à jour | **il survit** |
| **`openSurface()`** | une **nouvelle surface** apparaît : changement d'étape, ou changement de palier | **il repart en haut**, délibérément |
| *(rien)* | on **défile** | 🔴 **le défilement ne redessine JAMAIS.** Il écrit l'état et met à jour la surbrillance à la main |

⛔ **La troisième ligne est la plus importante du fichier.** Un scrollspy qui
appelle `refresh()` se mord la queue : le redessin bouge le défilement, qui
rappelle le spy. Le spy **écrit `state`, touche un attribut, et s'arrête là.**

## Ce qui ne se redessine JAMAIS
📍 `socle-ce-qui-ne-se-redessine-jamais` · vivante · ?

- `.belt` et ses dix crans — **les nœuds sont créés une fois**, seuls
  `data-status` / `aria-current` changent ;
- `.command` — les deux boutons (`Show plan`, `Validate`) sont les **mêmes
  nœuds** du début à la fin de la session ;
- `.stage` — **le conteneur qui défile** ne meurt jamais (son contenu, si) ;
- `.stage-chevrons` — avec son minuteur ;
- `.stage-aside` — la barre de navigation interne (B0.19) : le **slot**
  persiste, ce qu'un écran y met peut changer.

## Ce qui doit survivre à une mise à jour
📍 `socle-cinq-choses-qui-survivent` · vivante · ?

Les cinq de `ERGONOMIE-BUILDER.md` §RENDU, et où chacune est logée :

| Ce qui survit | Comment |
|---|---|
| la position de défilement (**II.1**) | `swapContent` la relit et la repose |
| l'observation du défilement (**II.3**) | `watchSnap` pose **un** écouteur sur un nœud qui ne meurt pas, et **ne retient aucun élément** — il relit `[data-snap]` à chaque lecture |
| le minuteur des chevrons (**I.7**) | `mountChevrons`, fermeture posée une fois |
| l'état d'un popup (**III.4**) | ⏳ **pas construit** — aucun écran de ce lot n'en a. Il vivra dans `state` comme le reste, jamais dans le DOM |
| le palier de `Validate` (**I.4**) | `state.palier`, hors du DOM par construction |

## Les quatre fonctions du socle
📍 `socle-chevrons-machine-a-etats` · vivante · ?
📍 `socle-keepinview-remplace-scrollintoview` · vivante · ?
📍 `socle-quatre-fonctions` · vivante · ?
📍 `socle-rien-sans-un-ecran-qui-en-a-besoin` · vivante · ?
📍 `socle-un-seul-ecrivain-par-brique` · vivante · ?

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
📍 `socle-echelle-hors-socle` · vivante · ?
📍 `socle-resize-avant-refresh` · vivante · ?

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
📍 `socle-contrat-d-un-ecran` · vivante · 39/42
📍 `socle-data-snap` · vivante · ?
📍 `socle-paliers` · vivante · ?
📍 `socle-rail-vertical-seulement` · à trancher · ?

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

## 📖 LA LOI DES BIBLES — un lot qui change quelque chose demande AVANT de rendre
📍 `socle-une-bible-se-demande-avant-de-rendre` · vivante · 06/09

> Eric, 2026-09-06 : *« et **dès qu'on change des choses, on se pose la question d'éditer une
> Bible**. »*

**Tout lot qui change quelque chose se demande, AVANT de rendre : « est-ce qu'une Bible doit être
éditée ? » — et il RÉPOND dans son rapport, même si la réponse est non.**

⛔ *« Je n'y ai pas pensé »* cesse d'être possible : la question est **au programme**, et **son
absence dans un rapport est elle-même un défaut**.

🔴 **L'INCIDENT QUI LA CRÉE, ET IL N'EST PAS DE CE DÉPÔT.** Le 2026-09-06, la ligne éditoriale
d'Eric a été violée **six fois dans un seul chapitre du livre**. Trois sièges y avaient écrit ce
jour-là, et **aucun n'avait de corpus à lire** :

| | son corpus | ce qui arrive |
|---|---|---|
| **le builder** | `NORMES` · `CADRES` · `SOCLE` · `ECRANS` — **493 adresses** *(mesuré le 06/09 à 20:33)*, un garde qui **refuse** une section sans adresse | une règle mal écrite **rougit** |
| **le livre** *(avant le 06/09)* | ⛔ **rien** — des notes de logbook que personne n'ouvre avant d'écrire | une règle violée **passe** |

⭐ **Une règle violée deux fois n'est pas une règle mal suivie : c'est une règle mal rangée.** La
règle du livre existait depuis le 25/08 ; elle a été écrite, puis ignorée douze jours plus tard.

📌 **DEUX BIBLES, ET IL FAUT SAVOIR LAQUELLE ON ÉDITE :**

| | ce qu'elle couvre | sa source |
|---|---|---|
| **Builder Bible** | l'application FHPC — les organes, les cadres, le mécanisme, les écrans | **ces quatre fichiers** ; `fh-phb/docs/bible/` n'en est qu'un **tirage** |
| **Web Bible** | le livre publié — la voix, la citation du SRD, la fabrique, l'appareil de fin | `fh-phb/docs/bible-web/` — **elle est sa propre source, elle n'a aucun amont** |

⚖️ **Et la question a une réponse par défaut, pas une échappatoire** : un lot qui touche à un
organe, une cote, un geste ou un écran édite **la Builder Bible** ; un lot qui touche à un chapitre
publié, à une citation du SRD, à un bandeau de pied ou à une sortie 📖 édite **la Web Bible** ;
un lot qui touche aux deux les édite **toutes les deux**. ⛔ *« Aucune »* est une réponse légitime
— **écrite**, jamais tue.

⚠️ **Cette règle a un jumeau, et c'est délibéré** : la Web Bible porte le même énoncé sous
`bible-question-avant-de-rendre`, parce qu'une loi qui ne vit que dans le corpus qu'on ne lit pas
ne s'applique jamais. ⛔ **Les deux se citent : modifier l'une oblige l'autre.**

📌 **Le corollaire, qui est l'amendement n° 2 du 05/09 appliqué au livre** : tout mandat d'écriture
dans le livre **nomme sa Bible en PREMIÈRE LIGNE**, comme les mandats de code nomment `TRAPS.md`.
C'est cette ligne, absente le 06/09, qui a coûté les six phrases.
