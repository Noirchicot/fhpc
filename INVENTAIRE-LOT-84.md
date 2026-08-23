# Inventaire du lot 84 — le tambour dans le vrai écran Équipement

**En clair :** l'écran Équipement n'affiche plus seulement une recherche textuelle. Il porte
maintenant **deux roues** (rayon → étagère) et une **grille paginée de 15 cases**, comme le
croquis du 23/08. Le catalogue passe de 133 à **386 objets** : les objets magiques sont
entrés, comme tu l'as décidé.

⚠️ **Une chose n'a pas pu être vérifiée, et c'est la principale : la roue n'a jamais tourné
sous mes yeux.** Détail au dernier chapitre. Rien de ce document ne dit qu'elle est fluide.

---

## 1. Ce qui marche, mesuré

| | mesure |
|---|---|
| **Le catalogue** | 133 → **386 objets** (82 gear + 38 armes + 13 armures + **253 objets magiques**) |
| **Les rayons** | 4 — Armor, Gear, Magic Items, Weapons |
| **Les étagères** | 13 en tout : Gear 1 · Armor 1 · Weapons 2 (Martial 24, Simple 14) · Magic Items **9** |
| **La cascade** | roue du haut bougée → 500 ms d'immobilité → l'étagère se remplit → la grille se remplit. Éprouvée de bout en bout au navigateur |
| **La grille** | 5 × 3, la pagination se déduit du nombre d'objets. Vérifié sur les 6 pages de Gear |
| **La dernière page** | 7 objets sur 15, et **la grille garde la même hauteur** (296 px) : rien ne remonte quand on tourne la page |
| **Les cotes de la roue** | sur écran large : pas **121**, cran **117**, piste **359**, fuite **1560,9** — **exactement** ce que tu as réglé au pouce le 22/08 |
| **L'état de départ** | rayons remplis, étagères ☆ ☉ ☾, grille ☆ ☉ ☾ — comme le croquis |
| **La position survit** | poser un objet reconstruit tout l'écran ; le tambour **revient où il était** (même rayon, même étagère, même page). Vérifié |
| **Les tests** | **1345 verts**, dont les 5 suites imposées et 27 tests neufs |

---

## 2. 🔴 Trois choses que j'ai mesurées et qui contredisent la commande

**Ma mesure gagne, et je le dis.**

### a. La plus grosse étagère fait 127 objets, pas 82

La commande annonçait « le rayon le plus gros fait 82 objets = 6 pages ». C'était vrai
**avant** que les objets magiques entrent. Mesuré maintenant : la plus grosse étagère est
*Wondrous Item*, **127 objets, 9 pages**. La plus petite est *Scroll*, **1 seul objet**.
Les deux sont éprouvées par un test.

### b. 🔴 Un cran de 117 px et « trois crans visibles » ne tiennent pas ensemble sur un téléphone

C'est la contradiction la plus importante, et **elle est née de ton croquis du 23/08** — pas
d'une erreur de quelqu'un.

Tu as réglé le cran à 117 px **sur ton iPad, le 22/08**. Le croquis du lendemain ajoute une
**paire de flèches par étage**. Mesuré au navigateur sur un écran de 375 px :

| | |
|---|---|
| place offerte par la carte | **327 px** |
| place demandée (3 × 117 + 2 flèches de 44 + écarts) | **455 px** |
| ce que la piste rendait vraiment | **229 px**, soit **moins de deux crans** |

Deux règles à toi s'affrontent : *« cran de 117 »* et *« on ne voyait que trois crans par
étage, suis-je clair ou pas ? »*. J'ai gardé **trois crans**, parce que c'est la plus récente
et la plus catégorique. Le cran se **borne** donc à 117 au lieu d'y être fixé : il vaut
exactement 117 partout où la place existe (**ton iPad**), et il rétrécit à ~74 px seulement
sur un téléphone.

➡️ **C'est une décision qui t'appartient, et elle se renverse en une ligne.** Si tu préfères
deux crans à la bonne taille plutôt que trois crans plus petits, dis-le : c'est la ligne
`--roue-pas-max` dans `ui/builder/shell.css`.

### c. Le garde sur l'identité des lignes de sac existait déjà

La commande demandait de le créer « si ça tient dans le périmètre ». Mesuré : il existe déjà,
complet et attaqué — `tests/gear-index-identite.test.mjs`, écrit par le lot qui a préparé
cette refonte. Je l'ai gardé vert, je n'ai rien réécrit.

---

## 3. La couture de données — une seule ligne, et voici où

**Le trou :** deux genres sur quatre n'ont **aucune** étiquette de catégorie dans les données.

| genre | n | de quoi il dispose |
|---|---|---|
| Gear | 82 | 🔴 **rien** — les fiches ne portent que prix, nom, poids |
| Armor | 13 | 🔴 **rien dans notre couche** — le SRD anglais imprime pourtant « Light / Medium / Heavy Armor », c'est l'extracteur de `fh-srd` qui les enjambe exprès |
| Weapons | 38 | ✅ martial / simple |
| Magic Items | 253 | ✅ neuf catégories |

**Ce que j'ai fait :** l'écran **lit ce qui existe et s'abstient là où il n'y a rien** — ta
consigne du 23/08. Un rayon sans étagère rend **une seule** étagère, celle du rayon. C'est
pour ça que *Gear* et *Armor* n'ont qu'une étagère aujourd'hui, et ce n'est pas un manque à
combler ici.

> ➡️ **La ligne à changer le jour où le SRD sera propre : la table `ETAGERE_DE`, dans
> `ui/builder/equipment-step.mjs`.** Elle nomme, en quatre lignes, quel champ chaque genre
> utilise comme second niveau. Rien d'autre dans cet écran ne sait d'où vient la taxonomie.
> Ajouter les armures = ajouter une ligne à cette table.

---

## 4. Mes choix par défaut, un par ligne — tous renversables

- **Une case porte le NOM**, pas une image — c'est ce que le produit sait déjà afficher ; le contenu sort d'une seule fonction et la taille d'une seule cote.
- **Les symboles ☆ ☉ ☾ sont tirés une fois par ouverture de l'écran**, pas à chaque attente — ton inquiétude tranchait dans ce sens (« un tirage qui change à chaque geste attire l'œil sur du bruit »).
- **La molette All / Weapons / Armor / Gear est gardée telle quelle**, bien que plus personne ne la lise : un bouton public se retire dans un lot qui ne fait que ça.
- **Changer de rayon rouvre sur la première étagère** (le mode « A » du banc, le bas oublie) — le mode « le bas se souvient » n'a jamais été tranché au doigt.
- **Les pages bouclent** : après la dernière on revient à la première — une flèche qui ne fait rien au bout est une cible morte.
- **Une flèche fait un cran, et elle passe par le défilement du navigateur**, exactement comme le doigt — un seul chemin, donc pas de divergence. Prix assumé : le lissage dure ~400 ms et n'est pas réglable.
- **Les libellés d'étagère sont la valeur lue, seulement remise en majuscule** — « Potion », jamais « Potions & Élixirs » : une jolie table de noms serait une deuxième écriture de la taxonomie.
- **L'interface est en anglais**, ta décision du 23/08 ; les mots « Parchemins » et « Baguettes » du croquis sont ta main, pas l'écran.

---

## 5. ⏳ Trois choses qui t'attendent, et que je n'ai pas tranchées

1. **Le cran de 117 px sur téléphone** — voir §2b. C'est la plus importante.
2. **L'œil prend 42 % de chaque case.** Mesuré sur un écran de 375 px : le nom a **60 px**, l'œil en prend **44** — et il y en a un par case, quinze fois. Ton propre standard de geste (*au doigt tap = info, à la souris clic droit = info*) le supprimerait complètement… mais il a besoin de l'autre moitié, le glisser, que la commande met hors périmètre. **Ça reste ta décision.**
3. **La case porte le nom ou une image ?** Toujours ouvert (§4). Le jour où tu tranches : deux endroits à changer, pas quinze.

**Et une conséquence de ta décision sur les objets magiques, à signaler :** la vieille molette
« All / Weapons / Armor / Gear » ne connaît pas les objets magiques. « All » en montre
maintenant 386, et rien ne permet d'isoler les 253 objets magiques *par cette molette*. Les
roues, elles, y arrivent. C'est sans gravité tant que la molette est destinée à disparaître.

---

## 6. Ce que j'ai REFUSÉ de faire, et pourquoi

| refusé | pourquoi |
|---|---|
| **Inventer des catégories** pour Gear et Armor | ta consigne du 23/08 : ça viendra d'un chantier de données, pas de l'écran |
| **Écrire un analyseur de prose** (deviner la catégorie d'après le prix, le poids, la rareté ou le nom) | l'étape 3 de la route versatilité va typer ces champs ; tout analyseur écrit cette semaine serait à jeter |
| **Ressusciter les 250 lignes de glisser** retirées le 22/08 | elles faisaient défiler une piste ; le glisser du croquis déplace un objet vers une cible. Ce n'est pas le même geste |
| **Écrire le nouveau glisser** | sa cible `TO GEAR DROP` attend une décision de ta part — un lot qui code une cible non tranchée code deux fois |
| **Construire les autres écrans** (fiche d'objet, panier, personnage équipé, atelier, sous-écrans du sac) | « fais déjà R, pas encore le reste » |
| **Réparer les 5 objets magiques dont le texte est avalé par leur voisin** | c'est un autre dépôt (`fh-srd`), qui connaît déjà le défaut et l'a gravé. Vérifié ligne à ligne : *Dancing Sword*, *Frost Brand*, *Luck Blade*, *Sword of Life Stealing* et *Sword of Wounding* n'existent pas, et cinq voisins portent leur texte. **L'œil de ton écran les montrera** — ce n'est pas ton écran qui est cassé |
| **Changer le comportement de la recherche** | hors périmètre. J'ai seulement corrigé une phrase que ta décision rendait fausse (elle annonçait trois familles d'objets alors qu'il y en a quatre) |
| **Toucher la bourse** | hors périmètre — et vérifié au passage : elle porte déjà **PP · GP · SP · CP**, quatre unités, et le mot « électrum » n'apparaît **nulle part** dans le moteur ni dans le SRD anglais |
| **Toucher les deux bancs d'essai** | ce sont des références ; les modifier ne rapportait rien |

---

## 7. ⚠️ Ce qui n'a PAS pu être vérifié — et c'est le point le plus important

**La roue n'a jamais tourné sous mes yeux, et je ne peux pas dire qu'elle est fluide.**

La rotation ne vient plus de code JavaScript : elle vient du navigateur lui-même, qui la
calcule au rythme du défilement. C'est ce qui doit la garder en phase avec le doigt — du code
qui repeint à la main est structurellement en retard d'une image ou deux.

Mais **la fenêtre de test dont je dispose n'affiche jamais vraiment la page** : elle la calcule
sans la peindre. Or ce mécanisme-là n'existe que quand la page est peinte. Vérifié en montant
un cas d'essai minimal à part : lui aussi reste inerte. **Ce n'est pas un défaut du code, c'est
une limite de mon instrument** — et je préfère le dire que de te laisser croire que c'est
mesuré.

Ce que j'ai pu vérifier quand même :

- le navigateur **déclare** savoir le faire, et l'écran l'affiche : une ligne sous les roues dit *« Wheel depth: on »* ou *« off »* selon ce que l'appareil accorde. **Lis cette ligne sur ton iPad** : si elle dit *off*, tu juges une roue plate, pas la roue ;
- la géométrie est juste au chiffre près, et un test la recalcule à partir de ta formule pour qu'elle ne puisse pas dériver en silence ;
- sur un navigateur trop ancien, l'animation est **entièrement désactivée** plutôt que jouée de travers — sans cette précaution, les crans se seraient figés tous ensemble de biais, ce qui aurait été pire que plat.

➡️ **Il reste à la toucher.** La moitié des défauts du 22/08 ne se voyaient qu'au doigt.

---

## 8. Les huit pièges déjà payés

Tous reposés, et chacun tenu par un test qui lit la feuille de style — parce qu'aucun d'eux ne
fait rougir un test ordinaire, c'est même leur signature commune : la perspective au bon
niveau, l'arrêt forcé du défilement retiré, la couture qui rend la main à la bonne image, le
bloc de roue rallongé, les deux réglages de largeur, la boîte explicite, **le fondu à 10 px
fixes** (et trois crans, sans cran de marge), et l'accélération matérielle qui abîmait la
netteté.

*Un détail au passage : mes trois premiers tests de pièges ont rougi sur **mes propres
commentaires** — ceux qui expliquent la parade nomment forcément le piège. Corrigé en ne
jugeant que le code, jamais les explications.*

---

## 9. Où sont les choses

- l'écran : `ui/builder/equipment-step.mjs`
- l'habillage et l'animation : `ui/builder/shell.css`
- les tests neufs : `tests/tambour-equipement.test.mjs`
- **la ligne à changer quand le SRD sera propre : la table `ETAGERE_DE`**, dans `ui/builder/equipment-step.mjs`
- **la ligne à changer si tu veux des crans plus gros : `--roue-pas-max`**, dans `ui/builder/shell.css`

Branche `84-roue-dans-equipment-step`. Rien n'est poussé.
