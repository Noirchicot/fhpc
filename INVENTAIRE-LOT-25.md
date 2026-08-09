# Inventaire du lot 25 — `25-builder-affichage`

> La première moitié du builder : sa couche d'affichage, livrée sans les
> verbes. Le moteur savait fabriquer un personnage complet depuis des mois.
> **On l'a regardé.** Ce fichier dit ce qu'on a vu.

**Branche** `25-builder-affichage`, coupée de `main` = `6afa930`.
**Départ** `npm test` → 530/530. **Arrivée** → **550/550**, arbre propre.
Aucun fichier existant n'a été modifié : le lot n'ajoute que des fichiers.

---

## 1. Pour regarder la page

```bash
cd ~/tools/fhpc-worktrees/25-builder-affichage && node src/tools/fiche.mjs > /tmp/fiche.html && open /tmp/fiche.html
```

Elle affiche le personnage Fate's Hand anglais **avec** son rapport de
dérivation. Pour voir n'importe quel autre document — et constater ce qui se
perd quand on le relit depuis un fichier :

```bash
node src/tools/fiche.mjs examples/personnage-srd-fr-niveau1.fh-char.json > /tmp/vieux.html && open /tmp/vieux.html
```

Et pour régénérer l'exemple (il est commité, un re-run laisse l'arbre propre) :

```bash
node src/tools/exemple-fh-en.mjs
```

## 2. Ce qui est livré

| Fichier | Ce que c'est |
|---|---|
| `src/tools/render-fiche.mjs` | **La fonction pure** `render(document, report) → string`. Zéro I/O, zéro DOM, zéro dépendance hors la grammaire de chemins du dépôt. |
| `src/tools/fiche.shell.html` | La coquille. Aucun script, aucun CDN, un marqueur `<!--FICHE-->`. |
| `src/tools/fiche.mjs` | La commande d'une ligne : coquille + rendu → sortie standard. N'écrit rien dans le dépôt. |
| `src/tools/exemple-fh-en.mjs` | Le générateur du document d'exemple, et la pile montée en mémoire. |
| `examples/personnage-fh-en-niveau1.fh-char.json` | **Généré**, jamais écrit à la main. Un test compare les octets commités à ceux du générateur. |
| `tests/render-fiche.test.mjs` | 20 tests, dont les 5 de la commande et 4 attaques. |

**Aucun bloc neuf.** Rien ici ne possède d'état, n'émet d'événement ni n'expose
de verbe : ce sont des outils, rangés sous `src/tools/` avec les générateurs de
couches. La tranche suivante décidera où vit la vraie vue.

### Le document d'exemple : pourquoi il a fallu en fabriquer un

`examples/personnage-srd-fr-niveau1.fh-char.json` est un magicien elfe
**français, SRD seul** : il porte `stats: []`. Or `stats` est la seule rubrique
du document qui porte son propre détail — avec ce document-là, l'écran n'en
montrerait rien. Le neuf est **anglais** (la table d'Eric y joue), monté sur
SRD + espèces + compétences + arcanes + dons FH, et il publie **deux**
statistiques dérivées, chacune avec son détail :

- `fh:destiny` = **10** — maîtrise 2, Base d'Elfe 2, *Splinter of Anon* 2,
  *The Hermit* 2, *Auspicious (fh)* 2.
- `fh:skill-points` = **7** — pool de classe 12, moins 2 + 2 + 1 d'imposés.

---

## 3. LE VERDICT, RUBRIQUE PAR RUBRIQUE

C'est le cœur du livrable : **ce qui ne s'affiche pas proprement, et pourquoi.**
✅ = lisible et adressable · ⚠️ = s'affiche, avec une réserve nommée ·
❌ = ne montre rien (et le dit).

| # | Rubrique | | Ce qu'on voit, et ce qui manque |
|---|---|---|---|
| 1 | `derivation` | ⚠️ | Lisible, mais **inadressable** : un id de couche (`srd-5.2.1-en`) porte des points que l'ancre d'un chemin d'override refuse (**trou 2, cause 4**). Surtout : elle ne porte que `{at, stack}` — **pas le rapport** (**trou 1**). |
| 2 | `identity` | ⚠️ | `classes[]` n'a pas d'`id` : le niveau d'une classe est inadressable (**trou 2**). Et le **lignage choisi n'apparaît nulle part** (**trou 4**). |
| 3 | `abilities` | ✅ | Six scores, six modificateurs, chacun avec son chemin. |
| 4 | `proficiency` | ✅ | |
| 5 | `ac` | ⚠️ | La valeur est là (12). **Sa provenance n'existe nulle part** : le contrat dit lui-même qu'elle « appartient à la dérivation, pas à `resolved` ». L'écran ne peut donc pas expliquer d'où sort le 12 — et il n'a pas le droit de le recalculer. |
| 6 | `vitals` | ⚠️ | `conditions[]` est une liste de **chaînes** : un état subi ne peut être ni visé ni retiré par override (**trou 2**). |
| 7 | `speeds` | ✅ | |
| 8 | `senses` | ⚠️ | Ne contient que la Vision dans le noir. **La Perception passive n'y est pas** (**trou 5**) — une fiche de niveau 1 sans Perception passive n'est pas jouable telle quelle. |
| 9 | `languages` | ❌ | **Vide**, alors que le joueur a choisi le draconique. Le choix est déclaré `unconsumed`, et la rubrique déclare pourquoi : aucun genre `language` parmi les genres de couche (**trou 3**). |
| 10 | `saves` | ✅ | |
| 11 | `skills` | ✅ | Les 26 compétences FH, chacune avec bonus, caractéristique et palier. Réserve de **volume** et non de contrat : 22 des 26 sont à `none`, et rien dans le document ne dit lesquelles méritent d'être vues en premier. C'est un sujet de mise en page, pas de moteur. |
| 12 | `tools` | ✅ | |
| 13 | `actions` | ❌ | **Vide par conception**, et le moteur dit pourquoi : aucun genre `action`, et composer une attaque depuis une arme demande une règle que le contrat ne porte pas. |
| 14 | `spellcasting` | ⚠️ | Le plus abîmé. Les **emplacements sont inadressables** — leurs clefs sont `"1"`…`"9"` (**trou 2, cause 3**), et c'est justement `slots.<n>.current` qu'un MJ voudrait tweaker. `spells[].damage[]` n'a pas d'`id`. Et les 7 sorts portent **3 176 caractères de prose** que rien ne structure : `castType`, `damage` et `concentration` sont tous les trois déclarés non dérivés. |
| 15 | `resources` | ❌ | **Vide**, raison donnée : aucun champ mécanique de ressource dans le contrat. Un niveau 1 n'a donc **ni dés de vie** ni usages comptés. |
| 16 | `traits` | ⚠️ | Les 5 traits d'espèce sont là (654 caractères pour le seul *Elven Lineage*). Les traits de **classe, de don et d'arrière-plan manquent** — déclarés non dérivés. |
| 17 | `gear` | ⚠️ | Les 8 objets sont là, la surcharge du joueur sur les torches s'affiche avec sa motivation. Mais `weight` n'est **jamais** dérivé : **aucune charge transportée n'est calculable** (**trou 6**). |
| 18 | `currency` | ✅ | |
| 19 | `craft` | ❌ | **Vide**, raison donnée : aucun module d'artisanat n'existe encore. |
| 20 | `stats` | ⚠️ | S'affiche bien, terme par terme, avec la source de chaque ligne. Mais **un terme du détail n'a pas d'`id`** : il est affichable et pas tweakable (**trou 2**, et sa conséquence est détaillée plus bas). |
| 21 | `notes` | ❌ | **Vide**, raison donnée : une note est saisie à la main, et `build.choices[].value` plafonne à 200 caractères. |

**Compte : 7 ✅ · 9 ⚠️ · 5 ❌.** Les cinq ❌ disent toutes pourquoi — c'est le
moteur qui parle, pas l'écran qui devine.

---

## 4. LES SIX TROUS REMONTÉS (loi §0.10)

### Trou 1 — ⛔ Le rapport de dérivation ne survit pas au fichier

**Le fait.** `underived` et `warnings` sont le **rendu de `build.rebuild`**. Le
document `fh-char/1` n'a **aucune place** pour les garder : `resolved.derivation`
porte `{at, stack}`, et rien d'autre.

**La conséquence.** Un document rouvert depuis le disque ne sait plus *pourquoi*
`actions`, `resources`, `languages`, `craft` et `notes` sont vides. La
« dégradation bruyante » de l'architecture est tenue **par le moteur en
mémoire**, et perdue par le fichier. C'est pour ça que la signature du rendu est
`render(document, report)` et non `render(document)` : le second argument est
une information que le document **ne peut pas** fournir. Quand il manque,
l'écran l'écrit en gros plutôt que de faire semblant (test : *« le bloc du
rapport est là même quand il n'y a pas de rapport »*).

**La question.** Le rapport doit-il entrer dans `resolved.derivation`
(`{at, stack, underived, warnings, unconsumed}`) ? C'est le seul endroit du
document qui décrit déjà **la dérivation qui l'a écrit**, et l'invariant « écrit
seulement par la dérivation » y vaut déjà.

### Trou 2 — ⛔ Huit formes du contrat qu'aucun chemin d'override ne peut viser

**Le fait.** `$defs/overridePath` désigne une clef d'objet par
`[a-zA-Z][a-zA-Z0-9]*` et un élément de collection par une ancre
`[a-z][a-z0-9:_-]*`. Huit formes du contrat sortent de ces deux motifs — **lu
dans le schéma**, donc vrai pour tous les personnages, pas seulement l'exemple :

| Forme | Cause |
|---|---|
| `resolved.identity.classes[]` | pas d'`id` obligatoire |
| `resolved.stats[].breakdown[]` | pas d'`id` obligatoire |
| `resolved.actions[].damage[]` | pas d'`id` obligatoire |
| `resolved.spellcasting.spells[].damage[]` | pas d'`id` obligatoire |
| `resolved.vitals.conditions[]` | liste de chaînes |
| `resolved.actions[].properties[]` | liste de chaînes |
| `resolved.spellcasting.slots.<1-9>` | clefs numériques |
| `resolved.derivation.stack[]` | `$defs/layerRef.id` admet le point, l'ancre non |

**La conséquence, et elle est concrète.** Sur le personnage d'exemple, **62
chemins sur 483** sont affichés et inadressables. Les quatre qui coûtent :

1. **`slots.<n>.current`** — rendre un emplacement de sort à un joueur est
   exactement le geste de MJ que les overrides existent pour porter.
2. **`stats[].breakdown[]`** — la règle d'Eric du 2026-08-08 veut une Gloire
   motivée ligne à ligne (« +1 Gloire, a sauvé la région »). Aujourd'hui, poser
   ou corriger **une** ligne oblige à surcharger le `breakdown` entier **plus**
   le `value`, en **deux overrides séparés** — et entre les deux, l'invariant
   « le total est la somme du détail » est violé. La mécanique la plus
   revendiquée de la couche FH est celle que le contrat sait le moins tweaker.
3. **`identity.classes[]`** — rien n'est tweakable sur une classe, donc rien sur
   un multiclassage.
4. **`vitals.conditions[]`** — un état ne se retire pas.

**La question.** Ces quatre-là méritent-ils un `id` (ou une clef littérale pour
les emplacements) ? Et la divergence `layerRef.id` ↔ ancre d'override est-elle
volontaire ? Ce n'est pas une décision d'affichage : ce lot s'arrête ici.

### Trou 3 — Une décision du joueur qui ne laisse aucune trace

**Le fait.** Trois choix de l'exemple sont déclarés `unconsumed` :
`species.lineage`, `abilities.mode`, `languages[0]`. Le joueur a choisi le
draconique ; `resolved.languages` est **vide**.

**La conséquence.** Ce ne sont pas des champs manquants, ce sont des
**décisions prises et perdues**. L'écran les nomme désormais dans son bloc
permanent — un joueur qui ne les voit pas croit que sa langue a été prise en
compte. Mais l'écran ne peut que le **dire** : la place manque dans `resolved`.

### Trou 4 — Le lignage, et une contradiction à trancher

**Le fait.** La déclaration du moteur sur `identity.species (lignage)` dit :
« composer un mot affichable dans le moteur serait la loi §0.13 —
**la composition appartient à l'interface** ». La commande de ce lot dit
l'inverse : « l'écran ne calcule **aucune** règle ; il affiche ce que `resolved`
porte ».

**La conséquence.** Personne ne compose. Le personnage est un « Elf » sur
l'écran, alors qu'il a choisi d'être un haut-elfe. **Ce lot n'a pas tranché** :
composer obligerait le rendu à lire `build.choices`, c'est-à-dire à sortir de
`resolved`, ce que la commande interdit explicitement.

### Trou 5 — La Perception passive n'existe pas

**Le fait.** `senses` ne porte que la Vision dans le noir. La déclaration dit
que le calcul est connu (10 + le bonus de la compétence) mais que **son nom ne
vit dans aucune couche**.

**La conséquence.** Une fiche de niveau 1 sans Perception passive n'est pas
utilisable à la table. Et c'est un cas où la frontière est nette : le nombre est
calculable, donc l'écran serait tenté de le fabriquer — c'est précisément ce
qu'il ne doit pas faire.

### Trou 6 — Aucune charge transportée

`gear[].weight` n'est jamais dérivé : le poids est une phrase dans la source
(« 0,5 kg »), et on ne lit pas la prose dans le moteur. Un builder ne pourra
donc pas dire à un joueur qu'il est surchargé.

---

## 5. Ce que le lot a REFUSÉ de faire

- **Composer le lignage** (trou 4) : deux règles vraies se contredisent, ce
  n'est pas à un lot d'affichage de choisir.
- **Fabriquer la Perception passive** (trou 5) : calculable ≠ à calculer ici.
- **Corriger un total menteur.** Un total qui contredit son détail s'affiche
  **menteur**. Un écran qui recalcule masque les bugs du moteur, et le garde de
  la somme (`statSumViolations`) ne verrait plus jamais rien passer. C'est
  l'attaque obligatoire du lot, et elle est jouée.
- **Inventer une ancre** pour les 62 chemins inadressables. Le rendu affiche le
  chemin qu'il **faudrait**, et le marque ⛔.

## 6. Ce qui survivra à ce lot, et ce qu'on jettera

| On jette | On garde |
|---|---|
| la page qui défile, la feuille de style de 30 lignes | **`data-path` sur chaque valeur** — c'est par là que le builder appariera un chemin affiché avec `build.overrides[].path` |
| l'ordre du schéma comme ordre d'écran | **`data-adressable`** — le verdict est rejoué contre le motif **lu dans le schéma**, à chaque test |
| l'absence de mise en page | **la place permanente du rapport**, et le refus d'afficher un blanc à la place d'une raison |

Le rendu ne connaît le nom d'**aucun** champ de `resolved` : il descend ce qu'on
lui donne, et construit les chemins en marchant. Une rubrique que le contrat
ajouterait demain s'afficherait toute seule (sous sa clef nue, marquée « sans
libellé »). Les seuls mots de l'écran sont les 21 titres de rubrique et une
vingtaine de phrases, regroupés en bas de `render-fiche.mjs` — et un test exige
que les 21 clefs soient **exactement** celles du schéma.

## 7. Les tests

20 tests, dont les 5 de la commande :

1. Les **21 rubriques** apparaissent, la liste **lue dans le schéma** — et
   aucune de plus.
2. **Chaque valeur porte son chemin** : les chemins sont suivis à la main dans
   le document, et le **compte des deux bouts** (valeurs rendues = feuilles du
   modèle) interdit qu'une valeur soit un jour rendue sans le sien.
3. Un `underived` produit **sa raison** : la privation est délibérée (pile SRD
   seule → `stats` vide), et la **contre-épreuve** montre le même document
   relu sans rapport — la raison a disparu du monde, l'écran le dit.
4. `stats[]` rend son détail **un terme = une ligne**, total du document.
5. ⚔️ **L'attaque** : total mensonger (`99` contre une somme de `10`) → l'écran
   affiche `99`.

Plus : le verdict d'adressabilité rejoué contre le schéma ; les **8 formes** du
contrat hors grammaire, dont **4 réveillées** dans un clone pour être vues ;
l'octet-à-octet entre l'exemple commité et son générateur ; et deux attaques de
plus (document sans `resolved`, formes endormies).

Toutes les attaques travaillent sur des **clones en mémoire** : rien n'est écrit
sur le disque, `tests/tree-immuable.test.mjs` rejoue la suite entière entre deux
relevés de l'arbre, et `git status` est propre.

## 8. Une note de mécanique, pas de contrat

La coquille **n'importe pas** le rendu : en `file://`, un navigateur refuse les
modules ESM et les `fetch` d'origine locale, et il faudrait lancer un serveur.
Un lot d'affichage qui oblige à lancer un serveur pour *regarder* n'a pas livré
ce qu'on lui demande. D'où l'injection dans un marqueur, et une page autonome.
