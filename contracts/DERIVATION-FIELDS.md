# Contrat de champs mécaniques — ce que la dérivation lit dans une couche

**Écrit par l'architecte le 2026-08-08.** C'est un contrat **inter-dépôts** : il
est honoré par le lot `8-srd-mecanique` (dans `fh-srd`) et consommé par le lot
`9-bloc-build` (dans `fhpc`). Il existe pour une seule raison — **permettre aux
deux lots de travailler en même temps sans que l'un devine ce que l'autre écrit.**

> ⚠️ **Ce fichier est la vérité pour les deux lots.** Un lot qui a besoin d'un
> champ absent d'ici **s'arrête et demande** (loi §0.10). Il n'en invente pas le
> nom : deux noms inventés de part et d'autre ne se rencontrent jamais.

---

## 1. Pourquoi ce contrat existe — la mesure qui l'a rendu nécessaire

Le M2 demande *un personnage niveau 1 dérivé de bout en bout par verbes seuls*.
En confrontant le personnage d'exemple du lot 2 (magicien elfe niveau 1) à ce que
la couche SRD contient réellement, l'architecte a mesuré le 2026-08-08 :

**Le SRD exporté porte des phrases là où la dérivation a besoin de nombres et de
clefs.** Environ 8 champs de `resolved` sur 20 sont dérivables aujourd'hui. Les
deux genres propres — `skill` (`ability_key`) et `class-progression` (des
nombres) — sont exactement les deux que le lot `6-srd-tables` a construits.

| Champ visé | Ce que la source donne aujourd'hui |
|---|---|
| `saves` | `["Intelligence","Sagesse"]` — des **noms affichables** |
| `vitals.hpMax` | `hit_point_die: "d6 par niveau de Magicien"` |
| `speeds` | `speed: "9 m"` / `"30 feet"` |
| `skills` (choix légaux) | `"2 au choix parmi : Arcanes, Histoire…"` |
| `senses`, `traits` | **uniquement** dans la prose de `description` |

Sans ce contrat, le lot 9 écrirait un parseur de prose française **dans `fhpc`**,
ou une table `"Sagesse" → wis` **dans le moteur**. Les deux violent la loi §0.13
(le moteur produit des identifiants, l'interface produit des mots) et la
frontière contenu/code. Ça compilerait, ce serait vert, et on l'apprendrait en
octobre.

**Ce qui rend les deux lots parallèles, et c'est mesuré, pas supposé** :
`schemas/fh-layer.schema.json` laisse `data` **ouvert** (`propertyNames:
safeKey`, `additionalProperties: safeValue`), et `src/tools/gen-srd-layer.mjs:87`
transporte `data` **en bloc** (`data: record.data`). Un champ neuf traverse donc
le schéma et le générateur **sans modification d'aucun des deux**. Aucun des deux
lots n'a à toucher au schéma ni au générateur.

---

## 2. La loi de ce contrat — trois règles, non négociables

1. **On AJOUTE à côté, on ne remplace JAMAIS.** `hit_point_die` reste,
   `hit_die` arrive à côté. La prose est ce qu'un joueur lit ; le champ mécanique
   est ce que le moteur applique. Retirer la prose casserait le site public
   `fh-srd` et l'attribution testée caractère par caractère.
2. **On n'invente RIEN.** Si le PDF ne le dit pas, le champ n'est pas émis — et
   son absence est **rapportée**, jamais comblée. Une valeur devinée donne un
   personnage silencieusement faux, ce qui est pire que pas de valeur (c'est le
   verdict déjà rendu sur l'appariement FR↔EN, `layers/TRADUCTION.md`).
3. **Ce que la pile ne sait pas nourrir n'est pas dans `resolved`, et le document
   le DIT.** Pas de valeur par défaut, pas de zéro consolant, pas de repli
   silencieux (loi §0.5). Le verbe `rebuild` rend la liste de ce qu'il n'a pas pu
   dériver, avec la raison.

---

## 3. Les champs — GROUPE A : certains, mesurés, dus

Chaque ligne a été vérifiée sur la couche FR réelle avant d'être écrite ici. Le
compte entre parenthèses est le taux de succès mesuré par l'architecte sur un
parseur d'essai jetable.

### `class` — 12 records par langue

| Champ | Type | Source | Mesure |
|---|---|---|---|
| `hit_die` | entier ∈ {6,8,10,12} | `hit_point_die` | **12/12** |
| `saving_throw_keys` | `["int","wis"]` — 2 clefs | `saving_throw_proficiencies` | **12/12** (jeu fermé de 6 noms) |
| `skill_choice` | `{count, from}` — `from` = liste d'**ids** du genre `skill`, ou la chaîne `"any"` | `skill_proficiencies` | **11/12**, voir arbitrage B1 |

### `background` — 4 records par langue

| Champ | Type | Source | Mesure |
|---|---|---|---|
| `skill_ids` | liste d'ids `skill` | `skill_proficiencies` | **4/4** |
| `ability_keys` | `["con","int","wis"]` | `ability_scores` | **4/4** |
| `feat_id` | id du genre `feat` | `feat` (`"Initié à la magie (Magicien) (cf. « Dons »)"`) | à joindre ; STOP si la jointure échoue |
| `tool_id` **ou** `tool_choice` | id du genre `tool`, **ou** `{from}` | `tool_proficiency` | 3 ids + 1 choix, voir arbitrage B2 |

### `species` — 9 records par langue

| Champ | Type | Source | Mesure |
|---|---|---|---|
| `speed_m` | nombre (mètres, couche FR) | `speed` (`"9 m"`, `"10,50 m"`) | **9/9** — virgule décimale → `10.5` |
| `speed_ft` | nombre (pieds, couche EN) | `speed` (`"30 feet"`) | **9/9** |
| `size_key` | ∈ `tiny small medium large huge gargantuan` | `size` | jeu fermé ; c'est `identity.size` de `fh-char/1` |

### `weapon` — 38 records

| Champ | Type | Source | Mesure |
|---|---|---|---|
| `damage_dice` | `"1d6"` ou `null` | `damage` | **37/38**, voir arbitrage B3 |
| `damage_flat` | entier ou absent | `damage` | le cas restant |
| `damage_type_key` | identifiant de type (`perforant`…) — **un identifiant, pas un mot affichable** | `damage` | 38/38 |

### `armor` — 13 records

| Champ | Type | Source | Mesure |
|---|---|---|---|
| `ac_base` | entier ou `null` | `armor_class` | **12/13**, voir arbitrage B4 |
| `ac_dex_cap` | entier, `null` (sans plafond) ou `0` (aucun Dex) | `armor_class` | idem |
| `ac_bonus` | entier ou absent | `armor_class` | le cas restant |

---

### Amendement du 2026-08-08, après la livraison du lot 8

Trois précisions, nées de questions que le lot a posées au lieu d'inventer.

- **`skill.ability_key` est CANONIQUE** (`str dex con int wis cha`) **dans les
  deux langues.** Le lot 6 l'avait laissé langue-natif en FR (`sag`, `for`) en
  invoquant l'autonomie des langues. La prémisse est fausse : ce n'est pas une
  question inter-langues. `resolved.abilities` de `fh-char/1` est
  `additionalProperties: false` sur les six clefs canoniques, **requis dans les
  deux langues** — un document français clefe sa Sagesse `wis`. Une compétence
  FR qui dit `sag` **ne peut pas adresser les caractéristiques de son propre
  document**. Le mot affichable reste : `data.ability` dit toujours « Sagesse ».
  ⚠️ **Aucun consommateur n'écrit de table `sag → wis`** — ce serait des mots
  français en dur dans le moteur (loi §0.13).
- **`background.feat_option`** : `{kind, id}`, une **référence de record**, jamais
  la chaîne `"(Magicien)"`. Sans elle, l'Acolyte et le Sage rendent le même
  `feat_id` et deux magiciens niveau 1 reçoivent la même liste de sorts alors
  qu'ils devraient différer. Si la parenthèse ne résout vers aucun record, **le
  champ n'est pas émis** et l'absence est rapportée.
- **`tool_choice.from` est une liste d'ids de records**, comme `skill_choice.from`.
  `from` a **un seul type quel que soit le genre** — sinon chaque consommateur
  branche par genre. Le consommateur lit ensuite `variants` sur le record pointé.

---

## 4. Les quatre irrégularités — ARBITRÉES, à ne pas « corriger »

Elles ne sont **pas** des défauts de parseur : ce sont des faits de la source,
vérifiés un par un. Le précédent est le piège `spell_slots` de l'occultiste, que
le lot 4 a transporté tel quel sur ordre de l'architecte et qui était juste.

- **B1 — Le Barde dit `"3 compétences au choix (cf. « Comment jouer »)"`**, sans
  liste. C'est la règle 2024 : le barde choisit parmi **les 18**. → `skill_choice:
  {count: 3, from: "any"}`. Ne fabrique pas une liste que la source ne donne pas.
- **B2 — Le Soldat dit `"Choisissez un type de boîte de jeux"`**, là où les trois
  autres arrière-plans nomment un outil. → `tool_choice`, pas `tool_id`. Un choix
  n'est pas une maîtrise accordée.
- **B3 — La sarbacane fait `"1 perforant"`** : dégâts fixes, sans dé. →
  `damage_dice: null`, `damage_flat: 1`. Ne l'écris pas `"1d1"`.
- **B4 — Le bouclier dit `"+2"`** : c'est un **modificateur**, pas une CA de base.
  → `ac_bonus: 2`, `ac_base: null`. Ne lui invente pas une base de 2.

---

## 5. GROUPE B : incertain — tenté, et refusable platement

**Les traits d'espèce.** Vision dans le noir, Ascendance féerique, Sens aiguisés,
Lignages elfiques : tout vit dans `description`, de 318 à 2 357 caractères selon
l'espèce, avec des tableaux de lignages aplatis en pleine phrase.

Forme visée, **si et seulement si** elle sort proprement :

```json
"traits": [{ "id": "…", "name": "…", "text": "…" }],
"senses": [{ "id": "darkvision", "range_m": 18 }],
"granted_skill_choice": { "count": 1, "from": ["srd:skill:fr:intuition", "…"] }
```

**Le lot 8 a le droit de refuser ce groupe**, et ce refus est un résultat, pas un
échec — c'est la consigne qui avait été donnée au lot 6 pour la table de
progression (« si la table résiste à l'extraction, dis-le platement avec la
mesure plutôt que de livrer un parseur approximatif »). Ce qui est **interdit**,
c'est de livrer neuf espèces dont trois sont approximatives sans le dire.

---

## 6. Hors périmètre — décision d'architecte, ne pas l'ouvrir

**L'équipement de départ ne se dérive pas au M2.** `starting_equipment` dit
`"Choisissez A ou B : (A) 2 dagues, focaliseur arcanique (bâton de combat),
robe, grimoire, paquetage d'érudit et 5 po ; ou (B) 55 po"`.

**C'est un CHOIX du joueur, pas une dérivation.** Au M2, `resolved.gear` et
`resolved.currency` sont nourris par `build.choices` qui nomment directement des
ids d'objets et un montant. Structurer les phrases d'équipement pour les
**présenter** au joueur est un besoin de l'interface (M3), donc un lot ultérieur
dans `fh-srd`. Aucun des deux lots ne s'en occupe.

---

## 7. Ce que chaque lot doit à l'autre

| | Lot `8-srd-mecanique` | Lot `9-bloc-build` |
|---|---|---|
| Dépôt | `fh-srd` **seul** | `fhpc` **seul** |
| Il produit | les champs du §3, plus le §5 s'il tient | le bloc `build` qui les lit |
| Il ne touche pas | `fhpc`, ni un export existant au-delà de l'ajout | `fh-srd`, `src/layers/`, `src/play/`, les schémas |
| S'il lui manque un champ | il s'arrête et demande | il **fabrique sa fixture** depuis ce contrat, jamais depuis la vraie couche |

**Le lot 9 ne doit pas attendre le lot 8.** Il monte la vraie couche SRD (les
champs déjà structurés : `skill`, `class-progression`, `spell` sont complets) et
**augmente à la main**, dans une fixture, les quelques records dont il a besoin
avec les champs du §3 **écrits exactement comme ici**. Sa suite d'acceptation
tourne sur cette fixture.

**La confrontation à la vraie matière est le geste de l'architecte, à la
fusion** : quand les deux lots sont livrés, il régénère les couches depuis
`fh-srd` et rejoue l'acceptation du lot 9 **sans fixture**. Si un nom diverge, il
diverge là, en une fois, sous les yeux de quelqu'un — et pas en silence dans deux
dépôts pendant trois semaines.
