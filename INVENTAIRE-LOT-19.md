# Inventaire du lot `19-score-destinee`

**Ce que le lot livre.** `resolved.stats[]` avait sa place au schéma depuis le
2026-08-08 et personne ne la remplissait. Elle est remplie : la dérivation
publie une entrée **`fh:destiny`**, nommée « Destiny Score », dont le `value`
est la somme de son `breakdown` — et l'invariant de somme, écrit au schéma et
exécuté nulle part, est désormais **exécuté et attaqué**.

Le prochain lot de la couche FH (chapitre 4, les 26 compétences) hérite de la
forme d'injection décrite au §2.

---

## §1 — L'inventaire des termes : dérivé, de séance, ou déclaré

| # | Terme | État | D'où il vient / pourquoi pas |
|---|---|---|---|
| 1 | **Maîtrise** | ✅ **dérivé** | `resolved.proficiency`, déjà produit par le pli. Ligne `{label: "Proficiency Bonus", value}` — **sans `source`** : aucun record ne la porte, et lui en inventer une mentirait sur son origine. |
| 2 | **Base de Destinée d'espèce** | ✅ **dérivé** | `species.data.destiny.base` (2 pour les douze espèces, lot 15). Ligne `{label: "Destiny Base · <nom d'espèce>", value, source: {kind:"species", id}}`. |
| 3 | **Bonus de Base d'espèce** | ✅ **dérivé** | `species.data.destiny.base_bonus` + `base_bonus_trait`. **UNE LIGNE À PART**, pas une addition dans la Base : le bonus a une source nommée, et l'écraser perdrait *pourquoi* il est là. Aujourd'hui l'**Elfe** seul en porte un (+2, `splinter-of-anon`). Son `label` **EST le nom du trait**, recopié du record — aucun mot fabriqué. |
| 4 | **Gloire / Damnation** | 🎲 **de séance** | Choix `fh.destiny.glory[n]` : `value` signé (négatif = Damnation), `label` = la motivation, `by: "gm"`. |
| 5 | **Éveil arcanique majeur** | 🎲 **de séance** | Choix `fh.destiny.awakening[n]` : `value` signé, `label` = la motivation, **pas de `by`** — c'est décidé par les dés, et désigner un responsable serait faux. |
| 6 | **Impact de l'Arcane majeur** | ⛔ **déclaré non dérivable** | La couche FH ne porte **QUE le genre `species`** (vérifié par test sur le fichier de couche), et le genre `arcana` n'existe pas dans l'énumération des 14 genres de `fh-layer/1` — **trou GAP-KIND, toujours ouvert**. Aucune source de règle à lire. |
| 7 | **Don Destiny Touched (fh) = +2** | ⛔ **déclaré non dérivable** | Les 17 dons SRD ne portent aucune valeur de Destinée, et la couche FH n'ajoute aucun `feat`. Le +2 est une règle connue **sans porteur** : il attend un record, pas une constante de moteur. |
| 8 | **Ligne « Other »** (objet magique, boon, sous-classe) | ⛔ **déclaré non dérivable** | Même mesure que 6 et 7. Un MJ qui veut la porter aujourd'hui l'écrit comme un terme de séance **motivé**, pas comme une dérivation. |

**Les trois déclarations sortent à chaque pli**, sous les champs
`stats[fh:destiny].arcana`, `.feat`, `.other`, chacune avec sa raison. Elles ne
sont pas des trous anonymes : un Score qui les fabriquerait serait un Score
**faux qui aurait l'air juste**.

**Les trois refus de contenu, eux, JETTENT** (contenu faux ≠ travail à finir) :
une `base` qui n'est pas un entier, un `base_bonus` qui n'en est pas un, et un
`base_bonus_trait` qui ne nomme aucun trait — ce dernier parce que le nombre est
*connu* et seul le mot manque : sauter la ligne laisserait un Score **court
d'exactement ce bonus**, sans un mot.

---

## §2 — La forme d'injection (ce dont le chapitre 4 hérite)

**Un module de statistique n'est jamais importé par `src/build/`** — le garde
de frontière l'interdit nommément (`../modules/` dans `FORBIDDEN`,
`tests/build-block.test.mjs`). Il est **injecté**, comme `play` reçoit ses
couches :

```js
import { createFhDestinyStat } from "../modules/fh/destiny-stat.mjs";
createBuild({ bus, dispatch, modules: [createFhDestinyStat()] });
```

**Contrat du module** — `{flag, id, contribute(input) → {stat, underived}}` :

| | |
|---|---|
| `flag` | le drapeau de couche qui l'allume. Le pli lit `dispatch("layers.flags")` et n'appelle QUE les modules dont le drapeau est levé. |
| `input.proficiency` | `resolved.proficiency`, ou `null` si le pli ne l'a pas dérivée. |
| `input.species` | `{id, name, slug, data}` du record d'espèce choisi, ou `null`. |
| `input.choices` | **les choix du namespace du module** — chemin `=== flag`, ou préfixé `flag.` / `flag[`. Chaque entrée porte `{path, tail, value, ref, label}`, `tail` étant le chemin privé de son préfixe (`fh.destiny.glory[0]` → `glory[0]`). Ils sont marqués **consommés** : c'est le module qui les juge, et un chemin qu'il ne sait pas lire est un **refus qui le nomme**. |
| retour `stat` | l'entrée `resolved.stats[]`, ou `null` s'il n'y a pas un seul terme à publier (le schéma exige `minItems: 1` sur `breakdown`). |
| retour `underived` | ses propres déclarations, versées dans le carnet commun. |

**Trois propriétés qu'un test vérifie** :

1. drapeau **éteint** → le module ne tourne pas, `stats` est vide, et les choix
   `fh.destiny.*` ressortent **`unconsumed`** (signalés, pas avalés) ;
2. couche montée **sans** son module → `stats` vide, et la déclaration NOMME
   *les deux listes* (drapeaux levés / drapeaux servis), pour qu'un module
   oublié se distingue d'une pile sans couche ;
3. module bancal (`{flag}` sans `contribute`, ou l'inverse) → **refus**, jamais
   un module qu'on saute.

---

## §3 — Le garde de la somme, et son attaque

`$defs/resolved.stats[].value` écrivait l'invariant *et* reconnaissait que JSON
Schema ne sait pas additionner. Il est maintenant dans
**`src/build/validate.mjs`** (`statSumViolations`, fonction pure), et il mord à
**deux endroits différents, exprès** :

- **`build.rebuild`, AVANT les overrides** → un module qui publierait un total
  que son détail contredit fait **échouer la reconstruction**. Le Score faux
  n'atteint jamais le document.
- **`build.validate`, sur la fiche jouable, overrides compris** → la parole du
  MJ bat le JSON (invariant n°2), elle n'est donc **pas jetée** ; mais un
  `value` qu'aucun détail ne justifie est **NOMMÉ**, avec les deux nombres et le
  détail qui le démontre.

**Attaqué**, comme le lot l'exigeait : une somme fabriquée fausse sur la
fonction pure (vue, nommée, puis **restaurée verte**), un module menteur sur le
vrai chemin (`rebuild` refuse), et un override de MJ qui écrase le total
(`validate` le nomme, `rebuild` le laisse passer).

---

## §4 — Les assertions réécrites (aucune relâchée)

| Fichier | Ce qui est devenu faux | Nouvelle vérité |
|---|---|---|
| `tests/build-block.test.mjs` | « le bloc ne lit la pile QUE par `layers.query` et `layers.stack` » | **`layers.flags` entre**, et la liste reste EXACTE. La route est due : sans les drapeaux, le bloc n'aurait le choix qu'entre allumer tous les modules injectés (§0.12 rompue) et n'en allumer aucun. Restent interdits : `register`, `enable`, `ruleValues`. |
| `tests/build-block.test.mjs` | `MUST_INSPECT` | `validate.mjs` y entre — sinon sa **disparition** passerait inaperçue. |
| `tests/mcp-block.test.mjs` | le catalogue de routes de l'adaptateur | `layers.flags` s'y ajoute : elle n'est pas prise par l'adaptateur mais par `build.validate`, en aval, que l'outil appelé motive. |
| `tests/v1-coverage.test.mjs` | `resolved.stats[fh.destiny]` | → `resolved.stats[fh:destiny]` (voir Q19-1). Les chemins écrits avec un point désignaient une case que le schéma refuse. |
| `src/build/derive.mjs` | « aucun module n'en publie au M2 » | Devenu faux dès qu'un module a été injecté. Réécrit : la déclaration ne sort plus que si **aucun module actif** n'a tourné, et elle nomme les deux listes de drapeaux. |
| `schemas/fh-char.schema.json` | « le garde est nommé et dû ; tant qu'il manque… » | ✅ **exécuté depuis le lot 19**, avec le nom du fichier, les deux points d'appel et son attaque. |

⚠️ **Le compte « NON DÉRIVÉ (13) » de `build-acceptance` n'a PAS bougé** — et
c'est correct : le personnage d'acceptation monte SRD fr + homebrew, aucune
couche FH, aucun module injecté. `stats` y reste déclaré, avec une raison plus
précise qu'avant. `stats` ne sort de la liste que **sous la couche FH**, et
c'est `tests/fh-destiny-score.test.mjs` qui le prouve.

---

## §5 — Ce que le lot n'a PAS fait

- **Il n'a pas touché `settleAwakening`** (`src/modules/fh/index.mjs`, §C), qui
  émet déjà un choix à enregistrer sous une **autre** convention. Voir Q19-2.
- **Il n'a pas ouvert de canal pour les termes 6, 7 et 8.** Ils se déclarent.
- **Il n'a pas borné la magnitude d'un terme de séance.** Voir Q19-3.
- **Il n'a pas touché `build.budgets`** — c'est le pool de compétences, pas ce
  lot.
