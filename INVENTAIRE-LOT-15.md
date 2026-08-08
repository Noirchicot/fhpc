# Inventaire du lot `15-couche-fh-especes`

> **La première couche Fate's Hand.** Jusqu'ici tout était de l'infrastructure ;
> c'est la première fois que les règles maison d'Eric entrent dans le produit.
>
> Écrit le 2026-08-08. Branche `15-couche-fh-especes`, coupée de `main` = `4e9f1ac`.
> Les dix questions sont en fin de `QUESTIONS-ARCHITECTE.md` (Q15-1 → Q15-10).

## Ce qui est livré

| Fichier | Rôle |
|---|---|
| `src/tools/fh-species-source.mjs` | **Le canon d'Eric, déclaré.** Lisible sans traverser du JSON : c'est ce qu'Eric relit. Chaque décision y porte sa source et, quand elles se contredisaient, la raison pour laquelle celle-ci gagne |
| `src/tools/gen-fh-species-layer.mjs` | Le générateur. `outDir` **et** `srdPath` sont des arguments ; sortie byte-identique à chaque exécution |
| `layers/fh-species-en.layer.json` | La couche, 12 records. SHA-256 `01eb9fba3581c85d8f3d28a0c4d316417bf0784b162a6bbf9328e993b9552a20` |
| `tests/fh-species.test.mjs` | 29 tests : l'acceptation, les refus, les attaques |

**Suite complète : 372 vertes / 0 rouge**, deux passes d'affilée sans nettoyage,
même verdict, arbre propre (343 existantes + 29).

## Ce que la couche PORTE

### Les douze espèces

| Espèce | Geste | Ce que la couche pose |
|---|---|---|
| **Araag** | `add` `fh:species:en:araag` | record entier · Fast Learner · Soulforged Affinity · Necrotic Resistance · Skillful et Darkvision 60 **pris au SRD** |
| Dragonborn | `patch` | Base de Destinée. **Rien d'autre** |
| Dwarf | `patch` | Base de Destinée. **Rien d'autre** |
| **Elestu** | `add` `fh:species:en:elestu` | record entier · Fast Learner · Fey Ancestry, Trance, Keen Senses, Darkvision 60 **pris à l'Elfe** — la lignée magique en moins |
| **Elf** | `patch` | Base · **Splinter of Anon** (`base_bonus: 2` → 4 à la création) · Keen Senses en forme FH |
| Goliath | `patch` | Base de Destinée. **Rien d'autre** |
| **Halfling** | `patch` | Base · **Outlasting** (avantage aux jets de Chaos) |
| **Hoddon** | `patch` de `srd:species:en:gnome` | `name`, `slug`, `data.name` → Hoddon ; *Gnomish Cunning/Lineage* → *Hoddon Cunning/Lineage* · Base |
| **Human** | `patch` | Base · **Twice-Born** · **Educated** (`skill_points {1: 2}`) |
| **Loroka** | `add` `fh:species:en:loroka` | record entier · Relentless Endurance, Darkvision 120, Versatile **pris au SRD** |
| Orc | `patch` | Base de Destinée. **Rien d'autre** |
| Tiefling | `patch` | Base de Destinée. **Rien d'autre** |

*Les Eluzi n'y sont pas : ce n'est pas une espèce de départ, on y arrive en jeu.*

### Les champs neufs de `data`

| Champ | Où | Forme |
|---|---|---|
| `destiny` | les douze | `{base: 2}` ; l'Elfe seul ajoute `base_bonus: 2` et `base_bonus_trait` |
| `fh_traits` | Elf, Human, Halfling | `[{id, name, text}]` — **la forme d'un trait SRD, sans grammaire neuve** |
| `skill_points` | Human, Araag, Elestu | `{trait, by_level}` — `{1:2}` / `{1:2, 3:2, 6:2}` |

**Règle de lecture, totale et sans exception : les traits d'une espèce sont
`data.traits` puis `data.fh_traits`.** `fh_traits` n'existe que là où une couche
ajoute un trait à un record qu'elle ne possède pas — donc jamais sur les trois
espèces neuves, qui posent tout dans `data.traits`.

### Les drapeaux

`fh.chaos` et `fh.destiny`. Pas de `ruleValues` — voir plus bas.

## Ce que la couche LAISSE AU SRD

C'est la moitié la plus importante de l'inventaire.

- **Toute règle que le SRD porte déjà avec ses vrais nombres.** *Stonecunning*,
  *Breath Weapon*, *Elven Lineage*, *Fiendish Legacy*, *Luck*, *Brave*,
  *Adrenaline Rush*… ne sont **pas** réécrits. Le chapitre d'Eric les résume
  (« Tremorsense 60 ft, a few times per day ») ; le résumé n'entre pas dans la
  couche. **Cinq espèces sur douze ne reçoivent qu'UNE ligne** — c'est le signe
  que la couche fait son travail, et un test l'exige nommément.
- **Les traits partagés par les espèces neuves.** Ils ne sont pas recopiés :
  le générateur les **prend** dans la couche SRD à la génération, et **jette en
  nommant le trait et son espèce** s'il ne les y trouve plus. Si le SRD bouge,
  la suite rougit — elle ne dérive pas en silence.
- **`data.description`.** Non patchée : la corriger serait la recopier. ⚠️ Le
  Hoddon dit donc encore « As a Gnome » et l'Elfe encore « Perception ».
  **Q15-4.**
- **`attribution` des records SRD.** Un patch ne peut pas y toucher (invariant 9
  du contrat `layers`) : la notice CC-BY reste accrochée à chaque record.
- **Aucun autre genre.** `records` ne contient que `species` ; un test vérifie
  que `skill`, `feat`, `background` et `class` sortent de la pile inchangés.

## Les trois décisions de forme, et leur argument

**1. La Base de Destinée voyage dans `data`, pas en `ruleValues`.** Deux
raisons, la seconde mesurée : elle est **par espèce** (une donnée de record, pas
un réglage global) ; et `createLayers({ruleValueKeys})` **refuse** toute couche
portant une valeur de règle tant que le moteur n'a pas déclaré ses clefs — le
pont clef-de-couche ↔ clef-de-règle est ajourné (arbitrage n°4 de
`contracts/layers.md`). Une couche d'espèces qui l'exigerait ne se monterait
nulle part aujourd'hui. **Un test le prouve par privation** : la même couche,
avec une seule `ruleValues` ajoutée, est refusée en nommant la clef.

**2. Un trait FH a la forme d'un trait SRD.** `{id, name, text}`. Aucune
grammaire d'« effets » : les trois pouvoirs de Destinée sont hétérogènes, et une
mini-langue de règles pour trois cas serait la « convention par cas » que la v1 a
payée. Ce qui est chiffré vit dans un champ dédié de `data`, nommé par le trait
qui le donne (`base_bonus_trait`, `skill_points.trait`).

**3. `data.fh_traits` est une nécessité, pas un goût.** Un chemin de patch ne
peut pas **créer** un élément dans un tableau (`paths.mjs`). Ajouter Splinter of
Anon à `data.traits` imposerait de réécrire tout le tableau, donc de recopier le
texte SRD des traits qu'on ne touche pas — l'exact contraire de D1.

## Ce que le lot a REFUSÉ de faire

- **Retirer *Resourceful* à l'Humain**, que le chapitre déclare pourtant retiré :
  un patch ne sait pas supprimer un élément de tableau, et le moyen n'est pas
  couvert. **Q15-5.**
- **Chiffrer *Twice-Born*** : « 2 au lieu de 1 » est relatif à un défaut qui
  n'est pas ratifié. **Q15-7.**
- **`disable`-r la compétence Perception** : ce n'est pas ce lot, et ce n'est pas
  qu'un `disable` de record — le SRD porte la Perception passive dans son
  glossaire et `resolved.senses` la transporte. **Q15-3.**
- **Inventer une taille** : déclarée `Medium` pour les trois espèces neuves,
  seule valeur du fichier qu'Eric n'a pas écrite. **Q15-1.**

## Les pièges de `TRAPS.md` payés d'avance

| Piège | Ce que ce lot fait |
|---|---|
| une suite qui mute un artefact commité | `outDir` **et** `srdPath` sont des arguments ; la suite génère dans un `mkdtemp` et compare là. Assertion explicite que `layers/` est intact après l'appel |
| une suite verte sur des artefacts périmés | la suite compare la génération **fraîche** au fichier commité — si le SRD bouge, elle rougit |
| une preuve qui cesse de prouver | tous les refus sont prouvés sur une **privation délibérée** (couche SRD amputée d'un trait, d'une espèce, d'un champ ; couche FH montée seule), jamais sur une pénurie de circonstance |
| un garde qui **compte** | l'acceptation **nomme les douze**, et l'assertion est attaquée sur **douze mauvaises** (« Gnome » à la place de « Hoddon ») : elle rougit |

Chaque garde de ce lot est violé une fois, rougit **en nommant** la chose, et
l'arbre est restauré : anti-recopie (avec son témoin muet sur la vraie couche),
« plus de Perception », les douze noms, les leveurs de traits et de champs.
