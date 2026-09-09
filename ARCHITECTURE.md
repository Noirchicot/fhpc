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

Manifeste + records par genre — la liste vit dans `src/layers/document.mjs`
(`GENRES`) et dans `schemas/fh-layer.schema.json`, tenues ensemble par un garde
de dérive. La plupart viennent de `fh-srd` (armor, background, class,
class-progression, feat, gear, glossary, item, item-value, class-option,
monster, skill, species, spell, tool, weapon, weapon-mastery, weapon-property ;
`skill` et `class-progression` sont arrivés avec le lot `6-srd-tables` le
2026-08-08), un vient de la couche `srfh` (`shelving`, lot 95 — le rangement
d'Eric), **et trois viennent de Fate's Hand : `arcana`** (2026-08-08, les 22
Arcanes majeurs), **`training`** (2026-08-12) **et `gem`** (2026-09-08, lot 181,
les 54 gemmes d'Eric). `arcana` est le premier genre qui n'existe dans aucun
SRD, et la frontière qu'il pose vaut pour tous ceux qui suivent : le générateur
de la couche SRD ne produit **jamais** un genre FH — il les refuse nommément
(`GENRES_HORS_SRD`).

⚠️ **UN CHIFFRE DE GENRES A ÉTÉ FAUX CINQ FOIS DANS CE DÉPÔT**, ici comme dans
`document.mjs` : « 15 genres, dont 14 » se lisait encore quand il y en avait 21.
Il est retiré plutôt que corrigé une sixième — `GENRES.length` répond, et lui ne
se trompe pas.

⛔ **ET OUVRIR UN GENRE AU CONTRAT DÉSARME UNE PORTE.** Le refus « un genre que
le contrat ne déclare pas » cesse de couvrir un nom à la seconde où on le
déclare. Un genre maison entre donc dans `GENRES_HORS_SRD` **dans le même
commit** que sa ligne du contrat — mesuré au lot 95 (`shelving`), refait au lot
181 (`gem`).
Une couche **ajoute** des records, **patche** un
record par id, **désactive** un record, **lève des drapeaux de capacités**
(ex. `fh.destiny`). Jamais d'exécutable — un homebrew d'inconnu est inoffensif
à charger. Les mécaniques nouvelles sont des **modules moteur** activés par les
drapeaux, pas du contenu de couche (décision Q4).

### La coupe des couches — six interrupteurs, un catalogue (Eric, 2026-09-08)

Une couche est de l'un de **deux genres**, et le genre décide où elle se pilote.

**L'interrupteur** *ajoute ou retire une règle*, et il vit dans l'écran **`Layers`** du
Menu *(le nom d'Eric, 09/09 — `Rules` est le nom accessible du bouton livre ; construit au
lot 188, `ui/builder/layers-ecran.mjs`)*. Ils sont **six** : `Trainings` · `Skills & tools` ·
`Inheritance` · `Destiny` · `Lore` · `Soulforging`.

#### Où en est la coupe, couche par couche (lot 184, 2026-09-09)

`fh-skills-en` en portait **trois à la fois** — Eric, en la lisant : *« FH skills
contient des feats, LOL »*. Le lot 184 l'a fendue, sans toucher un octet de
contenu :

| interrupteur | couche | drapeau |
|---|---|---|
| `Skills & tools` | `fh-skills-en` | `fh.skills` |
| `Trainings` | `fh-trainings-en` | `fh.trainings` |
| `Inheritance` | `fh-inheritance-en` | `fh.inheritance` |
| `Destiny` | `fh-arcana-en` · `fh-feats-en` · `fh-spells-en` | `fh.destiny` |
| `Lore` | `fh-lore-en` · `fh-fiche-en` | *(aucun)* |
| `Soulforging` | `fh-soulforging-en` | `fh.soulforging` |
| *(catalogue — suit le maître)* | `fh-species-en` · `fh-gems-en` | `fh.chaos` · `fh.species` · `fh.gems` |

#### ⛔ Le piège mesuré du lot 188 — `fh-species-en` levait `fh.destiny` (09/09)

📏 **Mesuré sur la vraie pile** : Destiny éteint (ses trois couches démontées), les espèces
restaient montées — elles sont du catalogue — et **le drapeau `fh.destiny` restait levé**, parce
que la couche des espèces le déclarait pour ses Bases de Destinée. Conséquences : la ceinture
versatile gardait son cran Destiny, et le module publiait un Score de Destinée fait de la seule
Base, avec *« couche des arcanes non montée »* en déclaration — **une règle éteinte qui tourne**.

⚖️ **La loi qui tranche est le §3 de cette section** — *« un contenu qui exige une règle absente
s'affiche inerte, sa règle manquante nommée »*. La Base d'espèce est ce contenu ; sa règle est
Destiny ; **c'est Destiny qui lève le drapeau**. `fh-species-en` ne lève plus que `fh.chaos` et
`fh.species` (`src/tools/fh-species-source.mjs`). ⏳ Si Eric veut qu'une espèce garde une Base
**sans** Destiny, c'est une règle de jeu à lui — et elle se dira dans la source de la couche.

#### 🔴 Un sous-ensemble de couches est LÉGITIME, pas inconnu (lot 188)

`currentStack` ne nomme que deux piles (`srd`, `srdfh`) et rend `null` entre les deux. Depuis
`Layers`, un joueur coupe une couche à la fois : **`compositionFh`** (`layers-ecran.mjs`) lit le
document interrupteur par interrupteur, et seule une composition qu'**aucun interrupteur ne peut
produire** — un ensemble coupé en deux (`fh-arcana-en` sans `fh-spells-en`), le catalogue à
moitié, le socle absent — reste innommable pour le Menu et pour l'écran mort.

📏 **Et la pile montée se range sur le document au boot** (`alignerLaPileSurLeDocument`,
shell.mjs). Mesuré avant le lot : un personnage gardé en « SRD seul » et **rechargé** retrouvait
la pile complète montée, `rebuild` refusait (*« la pile montée ne correspond pas à
build.layers »*) et les six écrans mouraient — pendant que le Menu affichait `SRD` allumé.
⛔ On monte ce que le document demande, on n'écrit rien dedans : le SRD et `srfh` ne bougent
jamais, seules les couches pilotables (Fate's Hand, livres, homebrew) suivent le manifeste.

⚖️ **ET UN INTERRUPTEUR PEUT EN EXIGER UN AUTRE — Eric, 08/09 : *l'Inheritance
dépend des Trainings*.** Les deux langues que l'origine offre SONT des records du
catalogue des trainings (`granted_language_choice.from` → `fh:training:en:language-*`).
📏 Mesuré le 09/09 sur la pile de la page privée de `fh-trainings-en` : le moteur
**dégrade, il n'échoue pas** — le montage passe, `rebuild` passe, l'octroi publie
toujours ses douze options (des `ref` qui ne désignent plus rien),
`resolved.languages` sort **vide** et la fiche déclare `underived.no-language-chosen` ;
une langue déjà choisie devient un refus **nommé**, `choice.ref-missing`. Une
dépendance non satisfaite se LIT donc sur la fiche, elle ne casse pas le
personnage — c'est la règle §3 de cette section (« un contenu qui exige une règle
absente s'affiche inerte, sa règle manquante NOMMÉE »), vérifiée sur un cas réel.

**Le catalogue** *offre du contenu*, marqué compatible SRD ou non : `species`, les
lignages, `class`, les sous-classes. Araag, Loroka, Elestu, Hoddon sont du
**homebrew**, pas des règles — c'est la porte homebrew de SOWLREACH.

⚖️ **Un drapeau garde un MODULE ; seule une couche fait disparaître du CONTENU.** Un
drapeau éteint ne consomme rien, les choix restent `unconsumed` (`derive.mjs:1226`) :
éteindre Destiny par drapeau laisserait les 22 Arcanes choisissables et inertes.

📏 **La coupe est mesurée, pas déclarée.** Ce que `fh-species-en` fait aux neuf espèces
SRD se trie sans reste : d'un côté les règles — `destiny` (9×), `granted_skill_budget`
(2×), `skill_points` (2×), `fh_traits` (3×) ; de l'autre le contenu — `lineages` (3×),
`lineage_intro` (2×), `traits[…].text` (6×), `description` (3×). Les 19 lignages ne
portent que `id · name · damage|levels` : **aucune règle FH dedans**. Et le marqueur du
catalogue existe déjà — `mole-people` porte `"fh": true`, `forest-folk` et `rock-folk`
non.

⚠️ **Les trois espèces neuves, elles, mélangent** : Araag met `Fast Learner` (la face
de `skill_points`) et `Soulforged Affinity` dans `data.traits`, là où les neuf SRD
mettent leurs traits FH dans `data[fh_traits]` — le canal séparé que lit
`modules/fh/traits.mjs:66`. **Deux conventions pour la même chose ; l'extraction doit
les ramener à une.**

#### ⚖️ LE LEXIQUE — cinq mots, un seul sens chacun (10/09, discussion jusqu'à l'alignement)

⚖️ Eric, 10/09, après avoir posé son modèle *(« le moteur FH = SRD + 1 couche moteur FH »)* et
demandé des mots qui évitent les confusions : *« homebrew = fait maison aussi = confusion. J'ai dit
catalogue après coup, c'est plus précis. Et moteur pour les règles qui changent. »* Puis :
*« ton jargon est bon, tu me corriges dès que je ne l'utilise pas »*, et *« pas Lore mais World ?
ça me va »*.

| le mot | ce qu'il désigne | exemples |
|---|---|---|
| **Moteur** | une règle qui change la façon de jouer | Trainings · Skills & tools · Inheritance · Destiny · Soulforging |
| **World** *(ex-Lore)* | les descriptions, l'ambiance, et les espèces et classes **dans leur version SRD** | Nymedes, les noms, l'Araag version SRD, les blurbs |
| **Catalogue** | du contenu fait pour fonctionner avec un moteur — **toujours qualifié par sa source** | catalogue **SRD** · **des livres du joueur** *(PHB, DMG)* · **Fate's Hand** · **de table** *(ce qu'un MJ ou un joueur écrit — l'ancien « homebrew »)* |
| **Version** | la forme d'un même élément selon les interrupteurs allumés | *Fighter* / *Fighter version FH* · *Araag version SRD* / *Araag version FH* |
| **Interrupteur** | ce qu'on allume ou éteint au Menu — un moteur, le monde, un catalogue | les six, le maître, les livres |

⛔ **Bannis dans la discussion** : *homebrew* → catalogue de table · *couche* → un mot de
construction, il reste dans le code · *alias* → version · *drapeau* → interrupteur.

**La phrase complète, signée par Eric** : *Fate's Hand = le SRD, plus le **World** de Nymedes,
plus cinq **moteurs**, plus un **catalogue** Fate's Hand fait pour ces moteurs. Chaque élément a
une **version** FH, et une version SRD quand il sait revenir. Couper un **interrupteur** ne détruit
rien : ce qui ne sait pas revenir se marque « à refaire », et revient quand on rallume.*

**Les règles qui en sortent :**

1. **Deux familles d'éléments FH** — ceux qui **savent revenir** au SRD *(une espèce ou une classe
   du SRD avec des ajouts FH : on retire les ajouts, l'original reste)* et ceux qui **ne savent pas**
   *(Araag, Elestu, Loroka ; Silent Blade, College of Banners, Spellrigger — le SRD n'en a pas
   d'original)*. Pour les seconds, **il faut écrire une version SRD** — laissés pour compte, avec la
   règle de chacun : *Araag à réécrire pour rester équilibré sans le Body Forging ; Elestu : un
   Skillful à deux choix ; Loroka : un don en plus*. En attendant, la version SRD provisoire de
   l'Araag du 08/09 *(deux compétences à la création)* tient.
2. **Une version SRD d'un élément FH vit dans le World, pas dans le SRD.** World éteint, elle part
   avec lui — *« pas d'Araag dans SRD si le bouton n'est pas poussé »*.
3. **World allumé, tous les moteurs éteints, un Araag version SRD → on joue dans Nymedes avec les
   règles pures du SRD.** C'est la définition la plus propre de World.
4. **« Cassé » = « à refaire à cet endroit », jamais « perdu ».** Un Elfe FH redevient Elfe SRD mais
   ses compétences venaient du moteur Skills & tools : en SRD elles viennent de la classe, donc
   l'étape Classe est marquée à refaire. Un Silent Blade sans version SRD : le personnage est à
   refaire ou à changer. Le choix reste enregistré, l'écran dit quoi et où.
5. ⚖️ **Et avant d'éteindre, la version FH doit rester sauvegardée** — Eric : *« ça duplique le
   perso ; au moins poser la question : voulez-vous garder une sauvegarde de la version FH ? »*.
   Le navigateur ne gardant qu'un personnage, la copie est un **fichier** — le geste *Save*.
6. **Les blurbs et images actuels servent les deux versions** — ils sont généraux. Seules les
   espèces propres à FH auront besoin des leurs, laissées pour compte avec elles.

#### ⚖️ LES ESPÈCES FATE'S HAND SONT DU LORE (09/09)

⚖️ Eric, 09/09, devant un Araag affiché en pile SRD : *« **Il n'y a pas d'Araag dans SRD si le
bouton Lore n'est pas poussé.** »*

⭐ **C'est la même loi que Hoddon** *(« tu pousses le bouton Lore et c'est un gnome »)*, étendue aux
trois espèces neuves : Araag, Elestu, Loroka **sont apportées par l'interrupteur Lore**, pas par un
catalogue toujours allumé. ⇒ `fh-species-en` **entre dans l'ensemble de couches de `Lore`**
*(avec `fh-lore-en` et `fh-fiche-en`)* et **sort de `CATALOGUE_FH`** *(où le lot 188 l'avait posée
avec `fh-gems-en`)*. Les gemmes, elles, restent du catalogue : une pierre n'est pas de l'ambiance.

📏 **Ce que ça change à l'écran** : Lore éteint → aucun Araag dans Species ; un personnage **déjà**
Araag voit son choix **non résolu, nommé** — *« Araag comes with Lore — switch it on in Layers »* —
jamais son id nu, jamais « settled ». ⛔ Le mot nomme **l'interrupteur qui porte le record**, pas
« Fate's Hand » en général : c'est ce qui rend le refus actionnable.

⚖️ **ET LA DÉFINITION, une minute plus tard — Eric : *« Lore rajoute le monde FH sans les
règles. »*** C'est la phrase qui définit l'interrupteur, et elle tranche ce que le paragraphe
précédent laissait ouvert :

| ce qu'une espèce porte | c'est du… | ça vient avec… |
|---|---|---|
| l'espèce elle-même, son nom, son blurb, ses lignages, ses traits **nommés** | **monde** | **Lore** |
| ce qu'un trait **fait** *(Fast Learner → des points de compétence ; Soulforged Affinity → le Body Forging)* | **règle** | **son propre interrupteur** — Skills & tools, Soulforging… |

⇒ Lore allumé, tout le reste éteint : **l'Araag existe**, ses traits se lisent, et chacun est
**inerte, sa règle nommée** — la loi du 08/09 *(« un contenu sans sa règle s'affiche INERTE »)*
s'applique telle quelle. Les traits FH posés sur les neuf espèces SRD suivent la même partition :
**visibles avec Lore, actifs avec leur règle.** ⛔ Aucun trait ne « survit sans Lore » : sans le
monde, il n'y a rien à afficher.

#### ⚖️ LA SUPERPOSITION — FH RECOUVRE LE LIVRE, IL NE LE DOUBLE PAS (09/09)

⚖️ Eric, 09/09, quatre phrases en cascade, chacune plus précise que la précédente :
*« Quand on pousse le switch FH toutes les autres gemmes partent si le player et dmg sont
chargés »* → **il se corrige lui-même** : *« Non mieux on rajoute les gemmes qui manquent »* →
*« c'est leur valeur qui détermine »* → **la règle générale** : *« FH doit se superposer »*,
*« on superpose »*, ⛔ *« on ne veut pas de doublons inutiles »*.

**⚖️ LA LOI, GÉNÉRALE — elle ne parle pas que des gemmes.** Une couche Fate's Hand posée
sur un livre que le joueur possède **RECOUVRE** ce livre :

| le livre a l'objet | FH fait | ce qui apparaît |
|---|---|---|
| **oui, au même nom** | **il RECOUVRE** — un `patch`, jamais un second record | **une ligne**, celle du livre, enrichie de ce que FH y ajoute |
| **oui, à une autre valeur** | **il RECOUVRE quand même** — FH est au-dessus dans le manifeste | une ligne, **au prix de FH** ⚠️ *(deux cas, § plus bas)* |
| **non** | **il AJOUTE** | une ligne neuve |
| — | ⛔ **jamais `disable`** | le livre du joueur ne perd rien |

⚖️ **ET LA PILE A UN PLANCHER — Eric, 09/09 : *« que tu puisses désactiver dmg player et
toujours te raccrocher au SRD »*.** Les livres du joueur — Player's Handbook, Dungeon Master's
Guide — sont des **couches qu'on éteint**, exactement comme les six interrupteurs. Ce qui reste
quand tout s'éteint, c'est **le SRD**, et il ne s'éteint jamais.

```
FH            ── se superpose, recouvre, n'efface rien
PHB · DMG     ── les livres du JOUEUR, importés, désactivables
SRD           ── le PLANCHER, toujours là
```

⛔ **Conséquence dure : rien de ce que FH livre ne peut DÉPENDRE d'un livre du joueur.** Une
gemme à 100 gp doit exister quand le DMG est éteint — sans quoi éteindre le DMG casse l'échelle
de la forge. C'est pour ça que FH livre les 54, **y compris les 23 que le livre porte aussi** :
elles ne sont pas un doublon, elles sont **le plancher qui reste quand le livre s'en va**. Le
doublon n'apparaît qu'à l'ALLUMAGE du DMG — et c'est là, et là seulement, que la superposition
doit produire une ligne au lieu de deux.

#### ⚖️ FH SOUSTRAIT PARCE QU'IL EST NÉ AVANT LE SRD — LES MOTEURS À VENIR FERONT LES DEUX (09/09)

⚖️ Eric, 09/09, après la mesure des sept `disable` : *« Oui je sais cette nuance : **on a construit
FH avant le SRD**, donc on a une couche de soustraction. Les futurs moteurs (les changeurs de
règles) devront faire de l'**addition ET de la soustraction** sur le SRD. Et **les catalogues
seront produits pour être compatibles avec un moteur**. »*

⭐ **Ça règle une contradiction apparente que la loi de superposition laissait ouverte.**

##### ⚖️ ET L'AMENDEMENT DU MÊME SOIR : « AU LIEU DE SOUSTRAIRE, RÉÉCRIT »

⚖️ Eric, 09/09, quelques minutes après la phrase ci-dessus, en voyant ce que coûtait un retrait :
*« Eh bien au lieu de soustraire, **réécrit** »*, puis, pour la ceinture d'étapes : *« fait idem
pour le belt »*.

⛔ **LES DEUX PHRASES NE SE CONTREDISENT PAS, ET IL FAUT LIRE LES DEUX.** La première dit qu'un
interrupteur **A LE DROIT** de retrancher. La seconde dit qu'il **DOIT PRÉFÉRER RÉÉCRIRE** quand
un héritier existe. La soustraction reste dans la grammaire ; elle cesse d'être le premier
réflexe.

| la situation | ce qu'on fait |
|---|---|
| le SRD porte un record que FH remplace par des records **plus fins** | **`patch`** — le record du SRD DEVIENT son héritier le plus proche, les autres sont `add` |
| une étape n'a **aucun** contenu dans l'autre pile | **présente, éteinte, un mot** — jamais retirée |
| rien ne peut hériter, et le record doit vraiment disparaître | `disable`, **et on écrit pourquoi rien n'héritait** |

##### ⚖️ LES QUATRE RÉPONSES DU 09/09 — gravées AVEC leur question

Eric, avant de partir : *« je vais te laisser en autonomie, pose les questions avant pour éviter
d'être bloqué plus tard »*. Quatre questions fermées, quatre réponses :

| la question | la réponse | ce qu'elle décide |
|---|---|---|
| **Qui hérite du record SRD réécrit, dans les trois cas ?** | **Vigilance · Dés · Cordes** | Perception → Vigilance ; Gaming Set → le jeu de dés ; Musical Instrument → les cordes. Les autres sont des `add`. **L'id du SRD ne bouge pas.** |
| **En pile SRD, que fait le cran Destiny ?** | **Absent — neuf crans** | ⛔ contre ma recommandation *(« présent, inerte, un mot »)*. Puis : *« si j'allume Destiny dans les couches, il réapparaît ? »* → **oui** — donc la ceinture se lit sur **les drapeaux montés**, jamais sur le nom de la pile |
| **Comment s'appelle l'écran des six interrupteurs ?** | **`Layers`** | et non `Rules`, en collision avec le nom accessible du bouton livre. Le mot dit ce que l'écran fait : allumer et éteindre des **couches** — règles FH, livres du joueur, homebrew |
| **Cette nuit, après fusion et suite verte, je pousse et je déploie seul ?** | **Oui, si tout est vert** | j'arrête au premier rouge ; vérification par empreinte de CONTENU |

⭐ **LA CEINTURE VERSATILE — ce que la deuxième réponse impose.** Eric : *« ou il faut que tu
réécrives le belt pour qu'il soit versatile SRD / FH »*. Un aiguillage `srd` / `srdfh` ne sait
pas nommer « SRD + Destiny seul » — `currentStack` y rend `null`. **Chaque cran déclare son
besoin** *(un drapeau)* ; la ceinture montre ceux que la pile montée justifie. 📏 `fh.destiny`
est levé par `fh-arcana-en`, `fh-feats-en`, `fh-spells-en`, `fh-species-en` ; `fh.inheritance`
par `fh-inheritance-en` seule.

⭐ **CE QUE LA RÉÉCRITURE ACHÈTE, ET C'EST MESURÉ.** Un record éteint laisse derrière lui tout ce
qui le référençait : son rangement pointe dans le vide *(2 cas mesurés le 09/09)*, et une liste de
classe qui le nommait perd une option **en silence**. Un record réécrit **survit à son propre
remplacement** : toutes les références continuent de se résoudre, vers l'héritier.

📏 **Et sur la ceinture, la réécriture est aussi ce qui est SÛR.** `monterBelt` (`shell.mjs`) le
dit lui-même : *« `paintBelt` écrit `data-status` par index sur les DIX ; les sortir du tableau
les priverait de l'état courant »*. **Retirer un cran casse une arithmétique en silence ;
réécrire son mot n'y touche pas.** Le cran `background` le faisait déjà depuis le lot 42 — il
garde son id et change de libellé. ⇒ **Ce n'était pas un cas particulier, c'était le modèle.**

| | fait quoi | pourquoi |
|---|---|---|
| une couche de **CATALOGUE** *(gemmes, livres, homebrew)* | **ajoute**, jamais `disable` | elle apporte du contenu ; retirer n'est pas son métier |
| un **INTERRUPTEUR** *(changeur de règles)* | **ajoute ET retranche** | remplacer Background par l'Inheritance EST son travail |

📏 **Mesuré le 09/09** : FH retranche **7** records au SRD — `fh-inheritance-en` éteint les 4
backgrounds, `fh-skills-en` éteint Perception + les 2 outils génériques. ⛔ **Ce ne sont pas des
accrocs**, ce sont deux interrupteurs qui font leur métier.

⚠️ **ET LA CONSÉQUENCE POUR LA SUITE, dite par Eric** : *« les catalogues seront produits pour
être compatibles avec un moteur »*. Un catalogue ne se conçoit donc plus seul — il se conçoit
**contre le moteur qui le consommera**. C'est ce qui rend le port d'import et le moteur de
réduction solidaires.

⚖️ **ET LES LIVRES SONT DU HOMEBREW — Eric, 09/09 : *« les livres rajoutent du homebrew »*.**

⭐ **Ce n'est pas une image, c'est une réduction d'architecture.** Du point de vue de FHPC, tout
ce qui n'est pas le SRD et qui arrive par le joueur est **du contenu apporté** : le PHB, le DMG,
la classe qu'un ami a écrite, les 675 records du Soulforging. Même mécanisme, mêmes bascules,
même loi de superposition. ⛔ **Il n'y a donc pas deux ports à construire — un pour les livres,
un pour le homebrew : il y en a UN**, et `gen-livre-layer.mjs` en est la première moitié.

📏 **Ce que ça décide concrètement** : le conteneur homebrew existe déjà « sans porte » *(carte
du produit, 08/09)*. Sa porte est **celle-ci**. Un livre importé et un homebrew importé produisent
la même chose — une couche, un id, une bascule au Menu.

⚖️ **OÙ MÈNE LE BOUTON LIVRE, ET OÙ SE PLACE LE PHB — Eric, 09/09, l'arbitrage ④ à moitié
tranché.** *« Le livre, tu parles du bouton… oui il est censé porter le lecteur vers le site web
SRD, qui reste très moche, donc pas très aidant (on fait avec pour le moment), et pour FH vers le
site. Si tu parles de montrer le PHB dans le menu, **placé comme un catalogue homebrew utile**,
oui. »*

⇒ **Deux organes distincts, et le mot `Rules` n'est en collision qu'avec l'un des deux** : le
**bouton livre** sort vers un site *(SRD ou FH selon la pile)* — il reste tel quel ; le **PHB au
Menu** est un **catalogue**, rangé avec le homebrew, pas un bouton de règles.

⚖️ **À QUOI SERVENT LES LIVRES — Eric, 09/09, et ce n'est pas que du contenu.** *« Les livres
rajoutent des feats, des subclasses, des trade goods, des monstres, des objets magiques, des
sorts. Sera utile pour tester l'implémentation de homebrew. Et mettre en place un moteur qui
produit un contenu simplifié et adapté aux fiches de présentation. »*

⭐ **Deux emplois, et le second est un organe qui n'existe pas encore :**

| l'emploi | ce qu'il exige | état |
|---|---|---|
| **un banc d'essai du homebrew** | un gros corpus RÉEL, varié, qui n'est pas le nôtre — c'est ce qui fait dire à une implémentation si elle tient | ✅ le port existe |
| **un moteur de RÉDUCTION** — du record complet vers la **fiche de présentation** | savoir jeter : garder ce qu'une fiche montre, laisser le reste au record | ⏳ **à construire** |

⛔ **Et le second explique le premier.** Un moteur qui simplifie ne se prouve pas sur six records
écrits pour lui : il se prouve sur un corpus qu'on n'a pas choisi. Les livres du joueur sont le
seul corpus de cette taille auquel on ait droit — d'où l'ordre de les importer.

⭐ **« Se superposer » n'est pas « cohabiter ».** Deux lignes *Azurite 10 gp* côte à côte,
l'une du DMG l'autre de FH, ce n'est pas une superposition, c'est un doublon. **La superposition
produit UNE ligne.** Et le critère qui décide si deux objets sont le même — Eric : *« c'est leur
valeur qui détermine »* — **c'est la VALEUR, pas la couche d'origine.**

🔴 **CE QUE ÇA CORRIGE, ET C'EST MOI QUI L'AI ÉCRIT UNE HEURE PLUS TÔT.** Le § précédent grave :
*« 23 trade goods… **aucune gemme, donc aucune collision avec les 54 de FH** »*. ⛔ **FAUX.**
J'avais mesuré la table **Trade Goods** du DMG et conclu sur **le livre**. La section **Gemstones**
est une **autre table**, deux titres plus bas dans le même chapitre 7.

📏 **La mesure, faite dans le DMG 2024 qu'Eric possède** *(D&D Beyond `dnd/dmg-2024`, ch. 7
« Treasure » § Gemstones — pas 5e.tools : la source licite d'abord)* :

* le livre range ses gemmes sur **6 paliers, 52 pierres** — 10 (×12) · 50 (×12) · 100 (×10) ·
  500 (×6) · 1 000 (×8) · 5 000 (×4) ;
* l'échelle d'Eric en compte **12** ; les **6 autres** — **250 · 750 · 2 500 · 10 000 · 25 000 ·
  50 000** — **n'existent pas** en gemmes au DMG *(250/750/2 500 y sont des paliers d'**objets
  d'art**, pas de pierres)* ;
* ⛔ **23 des 54 gemmes de FH portent un nom qui est DÉJÀ dans le livre** — 21 au même palier,
  **2 à un palier différent** ;
* les **24 gemmes des 6 paliers propres à FH** n'ont **aucun** doublon de nom. Zéro.

⛔ **ET LE DOUBLON EST POSSIBLE PAR CONSTRUCTION** : les 54 portent un identifiant `fh:gem:en:…`.
Un import du DMG écrirait `azurite` sous un **autre namespace** — le moteur verrait deux records
distincts et les afficherait tous les deux. **Rien aujourd'hui n'empêche le doublon ; c'est
l'identifiant qui devra le rendre impossible, pas un ménage a posteriori.**

⚖️ **CE QUE LA LOI EXIGE DONC DE L'IDENTIFIANT — la forme générale de la règle du § précédent.**
Un tag de rangement est SRFH, un tag de règle est SRFH+ ; **de même, un objet que le livre porte
aussi est SRFH, un objet que FH a inventé est SRFH+.** Les 23 noms du livre n'ont rien à faire
sous `fh:` : sous ce préfixe, ils *fabriquent* le doublon. ⏳ Le déplacement attend que le port
d'import fixe le slug canonique — **mais la frontière est mesurée et gelée dès maintenant**
(`gen-fh-gems-layer.mjs`, `GEMMES_DU_LIVRE`), pour qu'elle ne soit pas à redécouvrir.

#### ⚖️ UN TAG DE RANGEMENT EST SRFH, UN TAG DE RÈGLE EST SRFH+ (09/09)

⚖️ Eric, 09/09, après avoir demandé *« le player handbook a des « valuables » qui lui sont propres,
sais-tu à l'avance où les ranger ? »* — puis, la mesure faite : **« alors un tag associé en SRFH »**.

🔴 **LE DÉFAUT QUE ÇA RÉPARE, ET IL DATE DE CE SOIR.** Le lot 181 a fait apporter le rayon
`valuables` **par `fh-gems-en`**, une couche **SRFH+**. ⛔ Une couche Fate's Hand possédait donc un
concept dont le fil SRD a besoin : le jour où les marchandises du livre arrivent, elles auraient dû
demander leur tag à une couche **éteinte**.

📏 **La mesure qui l'a révélé** : le SRD 5.2 porte **23 `trade goods`** (`TG|XDMG`) — Canvas,
Cinnamon, Cow, **Gold**, Linen, Ox, **Platinum**, Saffron, **Silver**, Silk, Wheat… ⭐ **aucune
gemme dans CETTE table** — ⛔ *(et j'en avais conclu « aucune collision avec les 54 de FH » :
faux, la section **Gemstones** du même chapitre en porte 52, dont **23 collisions de nom** ; voir
« LA SUPERPOSITION » ci-dessus)* — mais **des objets de valeur du LIVRE**, et
⛔ **0 sur 8 testés existent dans notre couche** : c'est un trou d'extraction, pas un choix.

**La règle, générale :**

| ce que le tag dit | couche | vrai dans |
|---|---|---|
| **où l'objet se range**, ce qu'il vaut, comment on le cherche | **SRFH** | **les deux piles** |
| **à quelle règle FH il participe** | **SRFH+** | FH seul |

⇒ Donc `valuables` est **SRFH** *(rayon et tag)* et `soulforging` reste **SRFH+**. ⭐ C'est le
précédent exact de `srfh-shelving-en`, dont le code porte déjà l'argument : *« le rangement est de
la NAVIGATION, pas une règle de jeu »*. **Un tag qui dit « ceci a de la valeur marchande » n'est pas
une règle de Fate's Hand.**

📌 **Forme cible du rayon**, une fois l'extraction faite :
```
valuables ─┬─ gems          54  ·  SRFH+  (Eric)
           └─ trade-goods   23  ·  SRD    (le livre)
```
⛔ **Ne pas re-déclarer `valuables` comme « neuf, apporté par fh-gems-en »** : cette phrase est dans
`gen-fh-gems-layer.mjs` et dans la structure de `fh-srd`, et elle sera **fausse** dès que les 23
entreront. Elle est vraie *aujourd'hui*, et c'est ce qui la rend dangereuse.

#### ⚖️ LES DEUX PORTS — on IMPORTE de 5e.tools, on EXPORTE vers Foundry (09/09)

⚖️ Eric, 09/09 : *« exporter vers Foundry, importer de 5e.tools »*, et *« tu veux parler avec
Foundry, c'est essentiel de passer par ce format »*. ⭐ **CE N'EST PAS UN FORMAT D'ÉCHANGE, CE SONT
DEUX PORTS**, et les confondre fait scoper un chantier là où il y en a deux.

| sens | interlocuteur | ce qui passe | forme |
|---|---|---|---|
| **entrée** | **5e.tools** | du **CONTENU** — sorts, objets, dons, espèces | leur JSON, **APLATI** |
| **sortie** | **Foundry** *(`dnd5e`)* | un **PERSONNAGE** | leur schéma d'acteur |

📏 **Sa carte produit le disait déjà, daté du 22/08** : *« 5e.tools = source et pivot de CONTENU —
⚠️ 5e.tools n'a AUCUN format de personnage : un PJ ne s'échange qu'avec Foundry »*. Le 09/09 ne
décide pas, il **rend la règle directionnelle**.

⛔ **ET LA LIGNE DE LICENCE PASSE ENTRE LES DEUX.** `fh-srd/src/tripwire.py` classe 5e.tools en
**`forbidden-source`** — *« no SRD marking; DMCA'd 2024-08 »* — et cette garde est **lexicale** :
elle lit ce que les records DISENT, pas d'où ils prétendent venir. ⇒ **La base SRD ne vient jamais
de 5e.tools** : elle vient du PDF épinglé (`sources.lock.json`, empreinte SHA-256). 5e.tools est le
port du **contenu TIERS** — la porte homebrew de SOWLREACH — jamais la source du livre.

📏 **CE QUE L'APLATISSEMENT COÛTE, mesuré le 09/09 sur leurs records marqués `srd52`** :

```
languages    19 records ·     0 balise  ·  0,0 par record   ← le seul à zéro
feats        17         ·    51         ·  3,0
backgrounds   4         ·    38         ·  9,5
spells      322         · 1 242         ·  3,9
items       458         · 1 737         ·  3,8
races         9         ·   192         · 21,3              ← le plus dense
                    ~3 300 balises · 15+ familles
```

⚠️ **Aplatir n'est pas uniforme** : `{@damage 2d6}` rend `2d6`, mais
`{@filter demons|bestiary|tag=demon}` est une **REQUÊTE** — l'aplatir en texte perd ce qu'elle
fait. **Chaque famille demande sa décision.**

⭐ **Conséquence pour le chantier des langues** : les 19 sont **le cas le plus facile de tout leur
jeu de données**. Mais ⛔ **elles ne s'importent pas de chez eux** — elles s'extraient de NOTRE PDF
(SRD 5.2.1, PHB 2024 p. 37, CC-BY). 5e.tools sert de **témoin** : il dit où regarder et combien en
attendre (**19**, pas 20). Un témoin n'est pas une source.

#### ⚖️ L'ASYMÉTRIE DES DEUX SENS — monter est sûr, descendre ne l'est pas (09/09)

⚖️ Eric, 09/09 : *« plus facile de monter du SRD dans FH que descendre du FH dans SRD »*.
📏 **Ce n'est pas une intuition : le code le prouve trois fois, indépendamment.**

**① La confirmation n'existe que dans un sens.** `shell.mjs:602` —
`needsConfirm = action.value === "srd" && fhRefChoicesPresent(document)`. **Monter n'en demande
jamais** ; le code note que c'est *« toujours sûr — n'ENLÈVE jamais de couche »*.

**② Les deux sens ne parcourent pas la pile dans le même ordre, et c'est une MESURE.** Lot 77 :
`applyLayerStack` monte `for (const id of FH_LAYER_IDS)` et descend
`for (const id of [...FH_LAYER_IDS].reverse())`. ⛔ **Éteindre dans l'ordre de la liste faisait
JETER la pile** — `fh-fiche-en` patche les trois espèces que `fh-species-en` **ajoute**, donc
éteindre la base d'abord laissait un patch pointant dans le vide : *« la couche `fh-fiche-en`
patche `species fh:species:en:araag`, qui n'est dans aucune couche sous elle »*. **Ça plantait
l'écran Universe.**

**③ Descendre peut orpheliner des choix ; monter, jamais.** `fhRefChoices` compte les choix dont
le `ref.id` commence par `fh:` — un arcane de Destinée, un don d'origine FH. En descendant, ils
n'ont plus de record.

⭐ **LA RAISON EST STRUCTURELLE, PAS ACCIDENTELLE : une couche haute patche ce qu'une couche basse
a AJOUTÉ.** Ajouter par-dessus ne casse rien ; retirer par-dessous casse tout ce qui pointait.
⇒ **Aucun lot ne rendra jamais les deux sens symétriques** — ce serait nier la forme de la pile.

📌 **Trois conséquences directes, à ne pas redécouvrir :**
· un bouton qui **monte** vers `srdfh` peut se poser sans confirmation ; un bouton qui **descend**
doit passer par celle qui existe ;
· la **conversion d'un personnage** *(« les redescendre au niveau SRD, puis rajouter des couches »,
Eric)* est le sens DIFFICILE, et c'est celui dont le produit a besoin — **il faut le chiffrer comme
tel** ;
· ⛔ **ne remets jamais les deux boucles d'`applyLayerStack` dans le même sens.** Le commentaire du
lot 77 le dit déjà ; cette section dit **pourquoi**.

#### ⚖️ LA LOI DU 09/09 — le fil FH est le PRODUIT, la descente vers SRD est le CONFORT

Eric, 09/09, en deux temps qui se complètent — et l'ordre compte :
> ① *« laisse l'Araag incomplet, pas grave »* · ② **« L'Araag FH DOIT ÊTRE FONCTIONNEL ! »** ·
> ③ *« qu'il soit compliqué de les réduire à SRD, pas grave »*

⚖️ **CE N'EST PAS UNE DETTE SUR L'ARAAG, C'EST UNE PRIORITÉ DE PRODUIT.** Un contenu Fate's Hand
doit être **entier et fonctionnel dans sa pile**. Ce qui est toléré imparfait, c'est **la descente**
— rendre ce contenu propre quand on éteint les couches. ⛔ **Ne jamais présenter l'un pour l'autre :**
« l'Araag est incomplet » est FAUX ; « éteindre Soulforging laisse une trace sur l'Araag » est vrai.

📏 **Vérifié le 09/09, pile FH montée** : l'Araag dérive, base de Destinée **2**, pool de compétences
**14**, et le moteur **cite le trait** qui fait l'écart avec l'Humain (`fh-skill-pool.test.mjs`,
*« ACCEPTATION 3 »*). **Rien ne manque du côté qui compte.**

**La question d'origine, et sa réponse :** *« le trait `Soulforged Affinity` ne peut pas suivre sa
couche : on étend la grammaire du patch pour qu'une couche puisse AJOUTER un élément dans un
tableau, ou on accepte ? »* → **ON ACCEPTE**, parce que le défaut ne vit que dans la descente.

📏 **Le fait, mesuré au lot 179 en appelant la fonction** — pas déduit : `applyChange` refuse de
créer un élément dans un tableau (`src/layers/paths.mjs`, règle 3), *« on désigne un élément
existant par son identité, on n'en crée pas un par un chemin »*. Le trait vit dans `data.traits`
d'un record que `fh-species-en` **ajoute** ; aucune couche au-dessus ne peut l'y remettre.

⇒ **Conséquence assumée, à ne pas re-signaler comme un défaut** : éteindre `fh-soulforging-en`
laisse l'Araag avec un trait qui lui promet de Body Forge une Soulgem. ⛔ **Ce n'est pas un bug à
corriger, c'est le prix de la descente**, et Eric l'a payé sciemment.

⭐ **PORTÉE GÉNÉRALE, au-delà du Soulforging** : chaque fois qu'un lot devra choisir entre *« FH
fonctionne mieux »* et *« la descente vers SRD est plus propre »*, **c'est FH qui gagne**. Un siège
qui hésite n'a plus à demander.
📌 Elle se rouvrira d'elle-même le jour où une couche FH devra poser un trait sur une espèce
qu'elle n'a pas créée — c'est **alors** que la clef d'ajout, sœur du `remove` du lot 17, se paiera.

#### Les trois arbitrages du 08/09, chacun avec sa question

**1. « Soulforging : interrupteur ou contenu ? » → INTERRUPTEUR.** Il rejoint `craft`
dans Équipement : un gros catalogue *et* des règles propres à la forge et aux
propriétés des objets magiques. ⚠️ Il n'a **aucun écran aujourd'hui** et il est tissé
dans **5 couches, 10 records** (Araag · l'Elfe · le Wizard · l'outil
`fh:tool:en:soulforging` · 3 sorts dont `identify` et `gentle-repose` patchés) :
**son extraction est un lot AVANT son bouton**.

**2. « Hoddon : espèce neuve ou renommage ? » → NI L'UN NI L'AUTRE, c'est LORE.** *« Tu
pousses le bouton Lore et c'est un gnome. »* Le renommage `name`/`slug`/`data.name` →
`Hoddon`, le trait `Gnomish Lineage` → `Hoddon Lineage`, et `Forest Gnome`/`Rock Gnome`
→ `Forest Folk`/`Rock Folk` appartiennent à la couche **Lore**. Le **lignage
supplémentaire** (`mole-people`) appartient au **catalogue homebrew**. 📏 Le gnome SRD
ne porte aucun `data.lineages` — sa lignée est de la prose dans le trait
`gnomish-lineage` ; FH la structure, en renomme deux, en ajoute une.

**3. « Un contenu qui exige une règle absente ? » → IL S'AFFICHE INERTE, sa règle
manquante NOMMÉE**, jusqu'au jour où on l'ajoute.

⚖️ **La règle de dégradation, dictée le 08/09** : sans la couche `Skills & tools`, **les
points libres deviennent des compétences supplémentaires à répartir à la création.**
📏 L'humain SRD porte `Skillful` — *« proficiency in one skill of your choice »* — donc
**1** ; Araag en donne **2** (confirmé par Eric le 08/09 : *« +2 compétences, au lvl 1
et point »*). ⚠️ La forme FH d'Araag donne 2 points aux niveaux 1, 3 **et** 6
(`skill_points.by_level`) ; la forme dégradée n'en donne que **2, à la création, et
rien ensuite** — une espèce SRD n'accorde pas de compétence aux niveaux suivants.

⚖️ **Et « point » ne se dit pas en SRD.** Un point FH achète un palier
(Novice/Adept/Expert) ; sans la couche, il n'existe plus rien à acheter. La forme
dégradée s'écrit donc en vocabulaire SRD — **une compétence maîtrisée**, soit le
palier Novice — et le compte se lit `skill_points.by_level["1"]`, jamais la somme des
niveaux.

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
