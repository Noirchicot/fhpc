# Lot B — choix de forme et trous de schéma

Branche `2-schemas`, worktree `~/tools/fhpc-worktrees/schemas`.

**État : revue d'architecte du 2026-08-08 intégrée.** Les 18 choix du §1 et les
6 ajouts du §2 sont **ratifiés** — ils sont conservés ici comme mémoire des
raisons, pas comme questions ouvertes. Le §3 a changé de nature : cinq trous ont
été bouchés, un a été tranché hors document, cinq restent ouverts et **doivent
le rester** jusqu'au M2. Le §4 est vide de questions et devient le journal des
arbitrages.

---

## §1 — Choix de forme pris — RATIFIÉS

1. **Les collections sont des tableaux de records à `id` obligatoire**, sur le
   modèle des `records[]` de `fh-srd` — pas des objets à clefs. Exceptions :
   les six caractéristiques et les six sauvegardes (clefs fixes), et
   `spellcasting.slots` (niveaux 1 à 9). Raison : une couche peut ajouter ses
   propres compétences et ses propres sens ; un jeu de clefs figé les
   rendrait impossibles.

2. **Une seule grammaire de chemin dans tout le système** : segments séparés par
   `.`, sélection par **id** entre crochets. Elle sert aux `overrides` de
   `fh-char/1`, aux `changes` d'un `patch` de `fh-layer/1`, et — depuis la revue
   — aux clefs de `build.external.ddb.entityIds`.

3. **Un chemin d'override ne peut pas adresser par index.** Les ids de
   `resolved` doivent commencer par une lettre, donc `resolved.skills[0].bonus`
   est rejeté par la forme même du chemin. Côté `build.choices`, `[0]` reste
   autorisé : là, c'est une position de décision, pas un record.

4. **`attacks` et `actions` fusionnés en une seule collection `actions[]`.**
   Vocabulaire porté du panneau v1 `fh-panel-actions.js`, passé en minuscules.

5. **Un seul endroit qui compte : `resources[]`.** Traits, actions et objets à
   usages limités y pointent par `resourceId`.

6. **`craft[]` est namespacé par drapeau**, `data` opaque validée par le module
   moteur propriétaire du drapeau (décision Q4).

7. ~~**`notes` est une chaîne unique.**~~ **RÉVISÉ le 2026-08-08** → voir §3.1 :
   c'est une **liste**. La chaîne unique détruisait silencieusement un texte
   saisi à la main.

8. **`spellcasting` est un bloc unique ou `null`.** Multiclassage lanceur non
   couvert — reconnu, volontairement non bouché. La porte de sortie est écrite
   au §4.5.

9. **Le `changes` d'un `patch` est une carte chemin → valeur**, pas un objet à
   fusionner : aucune sémantique de fusion à deviner.

10. **La clef d'un record EST son id** : pas de champ `id` interne qui puisse
    diverger de la clef.

11. **`attribution` obligatoire au niveau couche**, surchargeable par record —
    le lot 4 peut transporter l'attribution CC-BY du SRD par record.

12. **`hash` = SHA-256 des octets du fichier de couche**, calculé par le bloc
    `layers`. Une couche ne contient jamais son propre hash.

13. **« Jamais d'exécutable » est un invariant de schéma.** `$defs/safeKey`
    refuse à toute profondeur `__proto__`, `constructor`, `prototype`, `script`,
    `javascript`, `eval`, `exec`, `function` et leurs variantes capitalisées.
    Liste **exacte et ancrée** : « a constructor of fine armour » passe.

14. **Horodatages vérifiés par `pattern`, pas par `format`** : une seule
    dépendance de dev.

15. **`$id` en `urn:fhpc:schema:…`** — aucun nom de domaine revendiqué.

16. **Les 12 genres énumérés en dur**, côté `records` comme côté `kind`. Étendu
    par la revue au **système externe** (`build.external.ddb` et rien d'autre) :
    un `roll20` inconnu est un rejet, pas une clef avalée.

17. **Les invariants hors portée de JSON Schema sont du code** :
    `src/schemas/invariants.mjs`, module pur, à câbler par le bloc `build`.

18. **`ajv` épinglé en 8.20.0** (la 8.17.1 porte l'avis ReDoS
    GHSA-2g4f-4pwh-qvx6), `strict: true` sans opt-out.

---

## §2 — Ajouts au-delà de l'inventaire imposé — RATIFIÉS

| # | Ajout | Pourquoi |
|---|---|---|
| A | racine `lang` | le SRD existe en `fr` et en `en` ; un document mélangé est indétectable sans lui |
| B | racine `units` | 9 m et 30 ft sont la même vitesse, et rien ne dit laquelle |
| C | `resolved.identity` | « joue sans ses couches » suppose un en-tête de fiche |
| D | `resolved.derivation` | permet de dire « `resolved` est périmé » quand `build` a bougé sans reconstruction |
| E | `abilities.*.mod` stocké | valeur finale ; un MJ peut l'écarter du score par override |
| F | `layerRef.name` | nommer une couche **manquante** à l'écran |

Ajoutés par la revue du 2026-08-08, mêmes règles : racine `generator`,
`build.external`, `resolved.tools`, `resolved.currency`, `resolved.notes` en
liste, et la charnière `spellcasting.id`/`.name` (§4.5).

---

## §3 — Les cinq trous bouchés le 2026-08-08

### 3.1 — GAP-NOTES → `resolved.notes` est une **liste** `{id, title?, text}`

Le trou était une **destruction silencieuse de données saisies à la main** :
les builds v1 portent au moins deux textes distincts (histoire du personnage,
notes de Destinée), et une chaîne unique en écrasait un à l'import. C'est la
famille de bug que ce projet refuse par principe.

`title` est **facultatif** — seul écart avec la forme suggérée par la revue.
Raison : la note sans titre est le cas courant à la table, et un champ
obligatoire qu'on remplit de vide n'est pas une donnée. `id` et `text` sont
exigés. L'ancienne forme (chaîne) est désormais **rejetée**, et un test le
prouve : la migration est bruyante, pas silencieuse.

### 3.2 — GAP-TOOLS → `resolved.tools[]`, collection séparée

**Tranché : une collection séparée, pas un champ `category` sur les
compétences.** Deux raisons, dans cet ordre :

1. **`tool` est l'un des 12 genres de couche ; « compétence » n'en est pas un.**
   Un outil est un record que la couche SRD fournit et qu'un homebrew peut
   patcher ou désactiver ; une compétence est une ligne de fiche. Les mettre
   dans la même collection mélangerait deux natures que le reste du système
   sépare déjà.
2. **Un `category` reporte la séparation sur chaque consommateur.** Au premier
   oubli de filtre, « Matériel de calligraphe » apparaît dans la liste des
   compétences — un bug d'affichage silencieux, à réparer autant de fois qu'il y
   a de vues. Une collection séparée le rend impossible par construction.

Le v1 lui-même le disait : ses outils vivent dans la même carte que les
compétences uniquement grâce au préfixe `"Tool - "`, qui est un contournement,
pas un modèle. La forme est un **miroir strict** de `skills[]` — ce qui se joue
pareil s'écrit pareil.

### 3.3 — GAP-GEN → racine `generator {name, version}`

Facultatif (un document écrit à la main n'a pas de générateur, et inventer un
nom serait pire que l'absence), mais **les deux champs sont exigés quand il est
là** : « fh-builder » sans version ne sert à rien le jour où l'on cherche quelle
version a produit une fiche fausse.

### 3.4 — GAP-EXT → `build.external.ddb {characterId, entityIds}`

Placé dans `build` et **non** dans le bloc `connect-ddb` : ce bloc est détachable
pour raison juridique, la donnée ne l'est pas — un personnage importé garde son
lien même quand le bloc est absent, sinon un ré-import crée un doublon.

`entityIds` est une **carte chemin de choix → id externe**
(`"background.feat": 4001`), et non une liste plate. Rattacher l'id au choix
qu'il représente empêche les orphelins : un choix retiré emporte son id, et rien
ne reste à pointer un don que le personnage n'a plus. La grammaire de chemin est
celle du §1.2, déjà en place.

### 3.5 — MONNAIE → `resolved.currency {cp, sp, gp, pp}`

Les quatre dénominations sont **obligatoires** : une bourse vide s'écrit en
zéros, elle ne s'omet pas — sinon « pas de champ » et « pas d'argent » se
confondent. L'**électrum est volontairement absent** (retiré des règles 2024).

> ⚠️ **Un point à vérifier au lot 4** : les exports `fh-srd` relus n'emploient
> que `pc`, `pa` et `po` dans les coûts (125 `po`, 17 `pa`, 10 `pc` ; zéro
> occurrence de « platine » ou « électrum »). `pp` est donc le **seul champ de
> ce schéma non attesté par les fichiers que j'ai lus** — il vient du SRD 5.2.1
> tel que je le connais, pas d'un relevé. Le lot 4 lit le SRD entier : qu'il
> confirme, ou qu'il le retire.

### 3.6 — GAP-CAMP → tranché **hors document**

Décision 3 d'Eric, appliquée : le personnage appartient au joueur, la campagne au
MJ, et le joueur partage une *copie*. Un personnage ne porte donc pas sa table.
Les deux chemins v1 concernés sont désormais classés « appartient au bloc
`table` », pas « trou ».

---

## §3bis — Les trous encore ouverts (M2, couche FH) — **trois, depuis le 2026-08-08**

Tous dépendent de la couche Fate's Hand, qui n'est pas le chemin d'aujourd'hui :
le SRD est la base, FH est une couche par-dessus (loi §0.12). La suite exige
qu'ils restent **tous invoqués** — aucun ne peut être bouché en douce.

| Trou | Champs v1 | Ce qui manque | Piste (non implémentée) |
|---|---|---|---|
| ~~**GAP-DERIVED**~~ (7) | ✅ **BOUCHÉ le 2026-08-08** → `resolved.stats[]` `{id, flag, name, value, breakdown[]}`, chaque terme du `breakdown` portant son `label` motivé, son `value`, et `by` quand c'est une décision de MJ | | |
| **GAP-ROLLS** (10) | `builderState.ab.set.*` | l'historique des jets de création de caractéristiques — état de construction persistant, pas état de séance | `build.creation` ; à trancher : le document porte-t-il la trace de sa fabrication ? |
| ~~**GAP-BUDGET**~~ (6) | ✅ **BOUCHÉ le 2026-08-08** → `build.budgets`, clef `<drapeau>` → entier. ⚠️ `glory` et `other` n'y sont PAS allés : ce ne sont pas des budgets mais des **termes du Score**, donc des entrées de `breakdown` avec `by: "gm"` | | |
| ~~**GAP-KIND**~~ (2) | ✅ **BOUCHÉ le 2026-08-08** → le genre `arcana` est entré dans l'énumération fermée des DEUX schémas, exactement par le remède prescrit ici. Et il a suffi : `$defs/kind` gouvernant `build.choices[].ref.kind` **et** `resolved.stats[].breakdown[].source.kind`, la carte du personnage et la citation de sa source ont trouvé leur place **sans un champ neuf**. Ce qui reste est du contenu (la couche des 22 cartes) et de la dérivation, pas du contrat | | |
| **GAP-LOCK** (1) | `builderState.tiers.<clef>.l` | la provenance/verrou d'une maîtrise (accordée par une source, non dépensable) | champ `grantedBy`, ou dérivé de `build.choices` |

**Couverture au 2026-08-07 (avant la révision du 08)** des 118 chemins v1 : 82 placés dans `fh-char/1`
(69 %, contre 66 avant la revue), 2 renvoyés au bloc `table`, 6 structurels,
2 sans objet, **26 dans les cinq trous restants**.

---

## §4 — Journal des arbitrages

1. **Monnaie** → bouchée (§3.5).
2. **Ordre d'affichage des collections** → confirmé **affaire d'UI**, non
   modélisé.
3. **Dépendances déclarées d'une couche** → **pas** de champ `requires` : la
   détection d'un `patch` orphelin au chargement suffit.
4. **Campagne** → hors document (§3.6).
5. **Multiclassage lanceur** → reconnu, volontairement non bouché, **porte
   laissée ouverte**. Réponse à la question de la revue : *la forme actuelle ne
   l'interdit pas.* Une révision pourra accepter
   `oneOf [null, objet, tableau d'objets]`, ce qui n'invalide **aucun** document
   déjà écrit. Deux précisions ajoutées pour que la migration soit un
   déplacement et non un devinement :
   - les champs **facultatifs** `spellcasting.id` et `spellcasting.name` nomment
     la source d'incantation dès aujourd'hui (l'exemple porte `magicien`) ;
   - la seule règle restant à écrire est notée dans le schéma : les emplacements
     étant partagés en 5e, les `slots` de la **première** source font foi et
     remontent d'un cran.

   Rien d'autre n'est à ajuster maintenant.

---

## §5 — Livraison et vérification

```bash
cd ~/tools/fhpc-worktrees/schemas && npm install && npm test
```

**69 tests, 0 échec** (63 du lot B, 6 du noyau J0 hérités de `main`). Ce qu'ils
couvrent :

- les deux schémas compilent en **2020-12 strict** ; les deux exemples valident ;
- le hash de couche inscrit dans le personnage est le **SHA-256 réel** du fichier
  de couche commité ;
- **40 mutilations rejetées**, une par invariant — dont les 17 ajoutées par la
  revue : notes restées en chaîne, note sans texte, note au titre vide, outils
  absents, outil sans caractéristique, outil déguisé en compétence par un champ
  inventé, générateur sans version, système externe non énuméré, lien DDB sans
  fiche, id externe sur un chemin mal formé, bourse incomplète, bourse négative,
  électrum ;
- **5 acceptations explicites** : personnage non lanceur, note sans titre,
  document sans générateur, document jamais importé, bloc d'incantation sans
  identité de source ;
- les 4 invariants hors schéma (unicité de chemin, pile dérivée ≠ pile du build,
  couche montée deux fois) ;
- le **test d'acceptation §7** : classement complet des 118 chemins v1, avec
  garde explicite que les cinq trous bouchés ne sont plus invoqués et que les
  cinq restants le sont tous.

Une assertion a été **réécrite** (marquée `REWRITTEN` sur sa propre ligne) : le
seuil de couverture v1, qui décrivait l'état d'avant la revue et ne mordait plus.

Le hash de la couche SRD dans l'exemple de personnage reste `0000…0000` —
placeholder assumé et visible, à remplacer par le lot `4-couche-srd`.
