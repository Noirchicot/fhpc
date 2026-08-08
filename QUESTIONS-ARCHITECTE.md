# Questions du lot `9-bloc-build` à l'architecte

**Écrites le 2026-08-08.** Loi §0.10 : le lot n'invente ni valeur, ni nom, ni
règle. Amendement de la session : Eric est absent, un arrêt franc gèlerait la
nuit — donc le lot a fait **tout ce qui ne dépendait pas** de ces questions,
a tenu la règle la plus stricte à chaque fois, et l'a rendue **visible par un
test** plutôt que de la décider en silence.

Chacune est numérotée comme dans `contracts/build.md`.

---

## 1. La ligne entre « nombre absent » et « collection vide déclarée »

**Le fait.** L'invariant demandé est net : *« ce que la pile ne sait pas
nourrir n'est PAS dans `resolved` »*. Mais `fh-char/1` déclare les **vingt
clefs de `resolved` obligatoires** (`$defs/resolved.required`). Omettre
`senses` rend le document **invalide**, donc injouable — alors qu'une fiche
sans sens se joue très bien.

**Ce que le lot a fait**, faute de pouvoir tenir les deux à la lettre :

- un **nombre** qu'on ne sait pas calculer est **absent** (`vitals.hpMax` sans
  `hit_die` n'existe pas ; il ne vaut pas 0) ;
- une **collection** qu'on ne sait pas nourrir est **vide**, et sa déclaration
  dans `underived` est **obligatoire** — jamais l'une sans l'autre ;
- une **structure** dont un champ obligatoire manque n'est pas émise à moitié.

**La garantie.** Un invariant testé dit qu'*aucune collection vide n'est rendue
sans une entrée `underived` qui la nomme*. Attaqué : retirer une déclaration
en gardant la collection vide fait rougir la suite.

**Question.** Cette ligne est-elle la bonne ? Sinon, il faut soit assouplir
`required` dans le schéma, soit accepter qu'un document partiellement dérivé
soit schéma-invalide et le dire quelque part.

---

## 2. ✅ TRANCHÉE — `ability_key` francisé dans la couche FR

Mesurée par le lot, puis arbitrée par l'architecte le **2026-08-08** :
`ability_key` devient **canonique dans les deux langues**. La fixture écrit
`str`/`wis`, le lot 8 corrigera les six records FR à la source, et la
réécriture de `tests/layers-acceptance.test.mjs:99` (qui épingle `"sag"`) est
le geste de l'architecte à la fusion.

**Ce que le bloc en fait** : une clef **absente** se déclare ; une clef
**hors des six** JETTE en nommant le record et la clef. Aucune table de
correspondance dans `src/build/` — c'est tenu par un garde structurel attaqué,
et par la suite `UNE CLEF DE CARACTÉRISTIQUE HORS DES SIX JETTE`.

---

## 3. Quatre champs que la fixture porte et que le contrat ne nomme PAS

`contracts/DERIVATION-FIELDS.md` §3 ne couvre pas tout ce que `resolved`
exige. Le lot n'a **pas** deviné : il a proposé un nom, l'a marqué
`⚠️ HORS CONTRAT` ligne à ligne dans la fixture, et l'a lu **défensivement** —
absent, le champ visé est déclaré non dérivé avec sa raison.

| Champ proposé | Genre | Pourquoi il manque | Ce qui casse sans lui |
|---|---|---|---|
| `spellcasting_ability_key` | `class` | `primary_ability` est un mot affichable — et la caractéristique **primaire** n'est pas la caractéristique d'**incantation** (un paladin est primaire en Force) | tout `spellcasting` : DD, bonus d'attaque |
| `ability_key` | `tool` | `data.ability` est un mot affichable. **Le genre `skill` porte déjà ce nom** dans la vraie couche, pour la même notion | `resolved.tools[].ability`, obligatoire |
| `cast_type` | `spell` | rien dans le contrat ne le porte | `castType`, **obligatoire** sur une entrée de sort |
| *(rappel)* `traits`, `senses` | `species` | contrat §5, GROUPE B, refusable | `traits` (atteint) et `senses` (**non** atteint, voir ci-dessous) |

**Sous-question, et c'est un vrai trou de forme.** §5 propose
`senses: [{ "id": "darkvision", "range_m": 18 }]` — **sans `name`**. Or
`resolved.senses[]` **exige** `name`, et la perception passive n'a de nom dans
aucun record. Le bloc refuse de fabriquer « Vision dans le noir » (loi §0.13),
donc `senses` reste vide et déclaré. **Il faut soit un `name` dans la forme du
§5, soit un `name` facultatif dans le schéma, soit une table de libellés côté
interface** — c'est la seule des trois qui ne coûte rien au moteur.

---

## 4. `choose` et `set` — deux verbes pour une règle du schéma

`$defs/build.choices` exige « `ref` OU `value`, jamais les deux, jamais
aucun ». Le lot a coupé les verbes là : **`choose` pose un record, `set` pose
un scalaire**. Un verbe unique à deux formes n'aurait rendu « jamais les
deux » vérifiable qu'à l'exécution.

**À ratifier**, parce que le MCP v0 arrive derrière et héritera de cette
forme : deux outils `build.choose` / `build.set`, ou un seul.

---

## 5. Trois familles de décisions absentes du personnage d'exemple

`examples/personnage-srd-fr-niveau1.fh-char.json` est la cible d'acceptation.
Ses `build.choices` ne portent **pas** :

1. **le NIVEAU.** Aucun choix ne le dit, et rien ne le dérive. Le lot a ajouté
   le chemin `level` (valeur entière) et **jette** quand il manque : ni le
   bonus de maîtrise, ni les emplacements, ni les points de vie ne s'en
   passent, et un « 1 » par défaut serait une valeur inventée.
2. **l'ÉQUIPEMENT et la BOURSE.** Le contrat §6 dit pourtant que
   `resolved.gear` et `resolved.currency` sont « nourris par `build.choices`
   qui nomment directement des ids d'objets et un montant ». Le lot a posé
   la forme : `gear[n]` (ref), `gear[n].quantity`, `gear[n].equipped`,
   `currency.{cp,sp,gp,pp}`.
3. **les NOTES — et celle-là ne se règle pas par un choix.** Mesuré :
   `$defs/build.choices.items.value` plafonne une valeur à **200 caractères**,
   et la note « Histoire » du personnage d'exemple en fait déjà **188** — ça
   passe de douze caractères, et une note de personnage ordinaire ne passera
   pas. Les notes appartiennent à un verbe d'édition de la fiche (le bloc
   `doc`, ou un override), pas à la dérivation.

**Ce que le lot a fait** : `tests/build-harness.mjs` porte un **complément
nommé et isolé** (`COMPLEMENT_NIVEAU`, `COMPLEMENT_EQUIPEMENT`,
`COMPLEMENT_BOURSE`), et une suite tourne **sans lui** pour prouver que la
dérivation refuse platement au lieu de combler.

**Question.** Faut-il compléter le fichier d'exemple ? Il est la cible
d'acceptation du lot 9 **et** la référence de tous les lots suivants ; s'il
n'est pas constructible tel quel, ça se saura à chaque fois.

**Divergence connexe, sans conséquence de forme** : le fichier porte
`livre-de-sorts` / « Livre de sorts », que le SRD exporté ne connaît pas — le
genre `gear` porte « Livre » (`srd:gear:fr:livre`). Le choix nomme donc
`livre`, et l'écart est asserté dans la suite plutôt que maquillé.

---

## 6. Un override sur un champ NON dérivé : refus, ou chemin de secours ?

**Deux phrases de l'architecture s'affrontent**, et le lot n'a pas voulu
trancher pour vous :

- « un override tweake ce qui existe » → un override dans le vide est une
  faute (le MJ croyait tweaker quelque chose que la dérivation n'a pas produit) ;
- « un seul chemin d'édition **avec ou sans couches** : l'override » → ce
  serait précisément le chemin de secours quand la pile ne sait pas nourrir un
  champ.

**Conséquence mesurée, et rendue visible par un test** : le personnage
d'exemple porte `resolved.vitals.hpMax = 9` en override. Tant que la couche ne
porte pas `hit_die`, la dérivation ne produit pas `hpMax` — et le `rebuild`
**jette**. La suite `⚠️ QUESTION 6` le montre en toutes lettres.

Le lot tient la règle **stricte** (un override ne crée rien), parce qu'elle est
réversible vers le laxisme et que l'inverse n'est pas vrai. Le schéma étant
`additionalProperties: false` sur `resolved`, un override créateur ne pourrait
de toute façon inventer que des champs déjà prévus — ce qui rend l'assouplissement
moins dangereux qu'il n'en a l'air.

---

## 7. Comment reconnaître un choix de compétence

**Le fait.** Le personnage d'exemple répond au choix de compétence de la
classe sous `class.skills[0]` et `class.skills[1]` — chemins génériques — mais
répond à celui de l'espèce sous **`species.keenSenses`**, un chemin propre à
l'Elfe. Aucun champ du contrat ne dit à quel chemin une déclaration
`{count, from}` doit être répondue.

**La règle posée par le lot** : un choix est un choix de compétence quand sa
**racine** est celle d'une source qui déclare `skill_choice` /
`granted_skill_choice`, **et** que sa valeur est un slug **légal** de la liste
`from`. On n'écoute pas le dernier segment du chemin : c'est la source qui
sait ce qui est légal. `species.lineage = "haut-elfe"` n'est pas un slug de
compétence, donc n'est pas une réponse ; `validate` **compte** ensuite les
réponses contre `count` et se plaint si le compte n'y est pas.

**La faille connue, et elle est étroite** : si un lignage portait un jour la
même valeur qu'une compétence légale, il serait compté comme une réponse. La
parade propre serait que la déclaration porte **le chemin auquel on lui
répond** (`granted_skill_choice: {path: "keenSenses", count, from}`) — mais ce
serait inventer un nom de champ, ce que le lot n'a pas fait.

---

## Hors questions — deux remarques pour la fusion

1. **La fixture est un échafaudage à jeter.** `tests/build-fixture-mecanique.mjs`
   est une vraie couche `fh-layer/1` montée par-dessus le SRD et la couche
   d'exemple, qui **patche** les records avec les champs du §3, écrits
   exactement comme le contrat les nomme. Le geste de fusion : régénérer les
   couches depuis `fh-srd`, retirer la fixture du harnais, rejouer
   `build-acceptance`.
2. **`tests/layers-acceptance.test.mjs:99`** épingle `ability_key === "sag"`
   (« la clef est LANGUE-NATIVE — “sag”, pas “wis” »).
   Cette assertion deviendra fausse dès la régénération des couches, et elle
   devra être réécrite à la nouvelle vérité, marquée `REWRITTEN` **sur sa
   propre ligne** — jamais relâchée. Ce lot n'a pas touché la suite d'un autre.
