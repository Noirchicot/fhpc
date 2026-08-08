# Questions du lot `9-bloc-build` à l'architecte

> ✅ **LES SEPT SONT TRANCHÉES** — arbitrage de l'architecte, 2026-08-08, après
> revue vérifiée et non crue. Ce fichier reste comme **journal de décision** :
> chaque question garde sa mesure, et gagne la réponse. Deux défauts trouvés à
> la revue (le texte des sorts laissé tomber, les assertions qui comparaient
> des projections) sont corrigés et consignés en fin de fichier.
>
> 🔬 **LA CONFRONTATION À LA VRAIE MATIÈRE A EU LIEU** — lot 8 fusionné,
> couches régénérées, échafaudage démonté. Le récit est en fin de fichier ; le
> résumé tient en une ligne : **le test qui EST le M2 passe sans fixture**, et
> trois champs ont changé de camp dans les deux sens.

**Écrites le 2026-08-08.** Loi §0.10 : le lot n'invente ni valeur, ni nom, ni
règle. Amendement de la session : Eric est absent, un arrêt franc gèlerait la
nuit — donc le lot a fait **tout ce qui ne dépendait pas** de ces questions,
a tenu la règle la plus stricte à chaque fois, et l'a rendue **visible par un
test** plutôt que de la décider en silence.

Chacune est numérotée comme dans `contracts/build.md`.

---

## 1. ✅ RATIFIÉE — la ligne entre « nombre absent » et « collection vide déclarée »

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

**Réponse (2026-08-08).** RATIFIÉE telle quelle, et l'invariant testé est la
bonne garantie. **On ne touche pas au `required` du schéma** : un document
valide qui dit ce qu'il ne sait pas vaut mieux qu'un document invalide.

---

## 2. ✅ TRANCHÉE — `ability_key` francisé dans la couche FR

Mesurée par le lot, puis arbitrée par l'architecte le **2026-08-08** :
`ability_key` devient **canonique dans les deux langues**. ✅ **FAIT à la
fusion** : le lot 8 a corrigé les six records FR à la source, et les dix-huit
compétences portent maintenant une clef canonique — vérifié par une assertion
qui les parcourt toutes.

**Ce que le bloc en fait** : une clef **absente** se déclare ; une clef
**hors des six** JETTE en nommant le record et la clef. Aucune table de
correspondance dans `src/build/` — c'est tenu par un garde structurel attaqué,
et par la suite `UNE CLEF DE CARACTÉRISTIQUE HORS DES SIX JETTE`.

---

## 3. ✅ RATIFIÉE — quatre champs que la fixture porte et que le contrat ne nommait PAS

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

**Réponse (2026-08-08).** Les quatre noms sont **ratifiés**, et ce sont des
trous du **contrat**, pas du lot. `class.spellcasting_ability_key`,
`tool.ability_key`, `spell.cast_type` et `senses[].name` sont **commandés au
lot 8**, plus `spell.concentration`. Le contrat est amendé.

✅ **SUITE DONNÉE À LA FUSION** — les cinq champs n'ont pas eu le même sort, et
c'est la mesure qui a décidé de chacun :

| Champ | Ce qu'il est devenu |
|---|---|
| `class.spellcasting_ability_key` | ✅ **livré** — l'incantation est dérivée de bout en bout |
| `tool.ability_key` | ✅ **livré**, 25/25 |
| `senses[].name` | ✅ **livré** — et donc `senses` est passé de non dérivé à **dérivé** |
| `spell.concentration` | ✅ **livré**, 339/339 |
| `spell.cast_type` | ❌ **REFUSÉ**, mesure à l'appui, et l'architecte a donné raison au lot 8 **contre son propre schéma** : le champ n'est plus obligatoire, parce qu'un champ obligatoire sans source force le moteur à deviner |

**Sous-question, et c'est un vrai trou de forme.** §5 propose
`senses: [{ "id": "darkvision", "range_m": 18 }]` — **sans `name`**. Or
`resolved.senses[]` **exige** `name`, et la perception passive n'a de nom dans
aucun record. Le bloc refuse de fabriquer « Vision dans le noir » (loi §0.13),
donc `senses` reste vide et déclaré. **Il faut soit un `name` dans la forme du
§5, soit un `name` facultatif dans le schéma, soit une table de libellés côté
interface** — c'est la seule des trois qui ne coûte rien au moteur.
→ **Tranché, puis LIVRÉ** : `senses[].name` est entré au contrat et le lot 8 le
porte (6 espèces sur 9 ont un sens ; les trois autres n'en ont aucun, et c'est
un fait, pas un trou). Le refus de fabriquer « Vision dans le noir » était la
bonne réponse — le nom vient maintenant du record, et le moteur le recopie.

---

## 4. ✅ RATIFIÉE — `choose` et `set`, deux verbes pour une règle du schéma

`$defs/build.choices` exige « `ref` OU `value`, jamais les deux, jamais
aucun ». Le lot a coupé les verbes là : **`choose` pose un record, `set` pose
un scalaire**. Un verbe unique à deux formes n'aurait rendu « jamais les
deux » vérifiable qu'à l'exécution.

**Réponse (2026-08-08).** **DEUX VERBES.** L'argument emporte la décision : un
verbe unique ne rendrait « jamais les deux » vérifiable qu'à l'exécution. Le
MCP v0 héritera de cette forme.

---

## 5. ✅ TRANCHÉE, ET FAITE — trois familles de décisions absentes du personnage d'exemple

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

**Réponse (2026-08-08) : OUI, et c'est fait.** Le fichier est la cible
d'acceptation de tous les lots suivants ; s'il n'est pas constructible tel
quel, chacun repaie la découverte. Le complément est **versé dans
`examples/personnage-srd-fr-niveau1.fh-char.json`** — `level`, les neuf lignes
`gear[n]` avec leur `quantity` et leur `equipped`, et les quatre
`currency.*` — aux formes posées par le lot. Le harnais ne porte plus rien :
il reprend les choix du fichier **mot pour mot** (les constantes `COMPLEMENT_*`
sont supprimées, loi §0.6).

**Les NOTES restent dehors**, et c'est la mesure qui tranche : plafond de 200
caractères contre 188 pour « Histoire ». Elles appartiennent au bloc `doc`.

**`livre-de-sorts` → `livre`, corrigé DANS le fichier** : « Livre de sorts »
n'existe pas dans le SRD exporté, le genre `gear` porte « Livre »
(`srd:gear:fr:livre`, 2,5 kg — le poids suit, sans quoi le fichier
inventerait une masse que le record contredit).

⚠️ **Le hash de la couche SRD n'a PAS été touché** : il rebougera à la
régénération d'après la fusion du lot 8, et c'est le geste de l'architecte.

---

## 6. ✅ RATIFIÉE — un override sur un champ NON dérivé : la règle stricte

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

**Réponse (2026-08-08) : RÈGLE STRICTE RATIFIÉE.** Et la contradiction se
dissout d'elle-même : dès que le lot 8 livre `hit_die`, `hpMax` **est** dérivé,
donc l'override du MJ tweake bien quelque chose qui existe.
⚠️ **À faire à la fusion** : la suite `⚠️ QUESTION 6` deviendra fausse et devra
être réécrite à la nouvelle vérité, marquée `REWRITTEN` **sur sa propre
ligne** — jamais relâchée, jamais supprimée.

---

## 7. ✅ RATIFIÉE, parade REFUSÉE — comment reconnaître un choix de compétence

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
parade envisagée était que la déclaration porte **le chemin auquel on lui
répond** (`granted_skill_choice: {path: "keenSenses", count, from}`).

**Réponse (2026-08-08).** La règle est **ratifiée** : écouter la source plutôt
que le dernier segment du chemin est juste. La parade est **REFUSÉE** —
`path: "keenSenses"` demanderait au SRD de porter une convention du
**constructeur**, que le PDF ne dit pas ; le lot 8 ne pourrait pas l'émettre
fidèlement. C'est au vocabulaire de choix du builder de porter sa propre
convention, plus tard.

---

---

# Les deux défauts trouvés à la revue du 2026-08-08 — corrigés

Ils étaient **de la même famille**, et c'est la parente exacte du « garde qui
compte » : **mes assertions comparaient des projections**, donc elles ne
pouvaient pas voir ce qu'elles laissaient dehors, et mon rapport annonçait
« identique au fichier » sur des champs qui divergeaient.

**A — le texte et la concentration des sorts disparaissaient sans un mot.**
`description` était **disponible dans la couche** (423 caractères pour
Projectile magique) et laissée tomber **sans raison de données**.
→ Corrigé : `text` est porté depuis `description`, tel quel. Mesuré avant de le
faire — les 339 sorts en ont une, la plus longue fait 3 967 caractères contre
4 000 acceptés ; au-delà, le texte serait **sauté et déclaré**, jamais tronqué.
`damage` (non structuré nulle part) et `concentration` (commandée au lot 8)
sont désormais **deux déclarations séparées**, parce qu'elles n'ont ni la même
raison ni le même avenir. L'entrée groupée précédente était fausse sur un tiers.

**B — `gear[].weight` et `identity` divergeaient en silence.** `weight` est
facultatif au schéma — l'omettre est légitime, mais ça ne rend pas `gear`
« identique au fichier ». Et `identity` était comparée à un **littéral**.
→ Corrigé : chaque collection est diffée **entière** contre le fichier, la liste
des écarts est **exacte**, et les écarts de sort sont en plus comptés **par
famille** (8 concentration, 8 texte, 5 non structurés, 5 phrases de la source)
pour qu'un écart d'une cinquième nature tombe avant la table.

**Et les gardes ont été attaqués sur ces défauts-là**, en plus des douze
premières attaques : texte de sort relaissé tomber, `identity` qui diverge d'un
champ de plus, poids inventé sur chaque ligne du sac, plafond de texte
désaccordé du schéma. **Seize attaques, seize rouges.**

📌 Une de ces attaques a révélé une **promesse en commentaire non tenue** :
`derive.mjs` annonçait qu'un test comparait `SPELL_TEXT_MAX` au schéma, et ce
test n'existait pas. Il existe maintenant. Une promesse en commentaire n'est
pas une garantie.

---

---

# La confrontation à la vraie matière — 2026-08-08

Lot 8 fusionné, couches régénérées, branche rebasée, **échafaudage démonté**.

**Ce qui passe sans rien** : le test qui EST le M2 — « le magicien elfe niveau 1
est reconstruit depuis ses choix seuls, par verbes seuls » — plus les 18
compétences nommément, les overrides en dernier, les divergences nommées, et
`validate` qui ne trouve rien à redire. **Le jalon est atteint.**

**Ce qui a changé de camp, dans les deux sens.** Un inventaire « dérivé / non
dérivé » décrit la rencontre entre un moteur et une matière, pas seulement le
moteur : il bouge quand la matière bouge, et c'est sain.

| Champ | Avant | Après | Pourquoi |
|---|---|---|---|
| `senses` | non dérivé | ✅ **dérivé** | la sous-question sur `name` a été retenue et le lot 8 le livre |
| `spells[].concentration` | non dérivée | ✅ **dérivée** (339/339) | livrée par le lot 8 |
| `saves`, `speeds`, `vitals.hpMax`, `identity.size`, `tools`, `ac`, `spellcasting` | déclarés en pénurie | ✅ **dérivés** | les champs mécaniques sont arrivés |
| `traits` d'espèce | dérivés | ❌ **refusés, déclarés** | mise en page à deux colonnes aplatie, une espèce déborde sur la suivante |
| `spells[].castType` | dérivé | ❌ **refusé, déclaré** | cinq constructions ressemblent à une sauvegarde et une seule est le fait |

**Et la prédiction de l'arbitrage n°6 est vérifiée, pas crue** : `hit_die`
existe, donc `hpMax` est dérivé, donc l'override du MJ tweake bien quelque
chose qui existe et ne jette plus. La règle stricte n'a pas été relâchée pour
autant — sur une couche amputée de `hit_die`, le même override jette de
nouveau, et le test le reprouve.

## ⚠️ La leçon de cette fusion : un refus ne se prouve plus par la pénurie

**Cinq preuves se sont évaporées le jour où la source s'est enrichie.** Elles
s'appuyaient sur une couche qui ne portait aucun champ mécanique : il suffisait
de la monter pour voir le bloc déclarer. Un test qui prouve un refus par un
manque accidentel de la matière est un test qui disparaît sans bruit le jour où
le manque est comblé — et la garantie avec lui.

Chaque refus est donc reprouvé par une **couche de scénario délibérément
amputée** : elle recouvre le record par un `add` qui ne garde que la prose
(« d6 par niveau de Magicien », « 11 + modificateur de Dex »). L'amputation est
alors **lisible**, elle est **ciblée** (`class-progression` n'est pas touchée,
sinon le test prouverait seulement qu'une pile vide ne dérive rien), et chaque
scénario porte son **pendant sur la vraie matière** — le champ y est bien
dérivé. C'est la même famille de leçon que le « garde qui compte » : une
garantie doit tenir à ce qui change autour d'elle.

**Dix-huit attaques réelles de l'arbre, dix-huit rouges**, dont deux neuves
visant nommément les champs qui viennent d'arriver : les sens relaissés tomber,
et un `castType: "none"` deviné au lieu d'être déclaré.

---

## Hors questions — deux remarques pour la fusion

1. ✅ **FAIT — l'échafaudage est démonté.** `tests/build-fixture-mecanique.mjs`
   est **supprimé** : fichier, imports et mentions. Un échafaudage qu'on laisse
   debout est du code mort (loi §0.6). La suite d'acceptation tourne sur la
   couche SRD régénérée et la couche d'exemple, point.
2. ✅ **FAIT par l'architecte** — `tests/layers-acceptance.test.mjs` épinglait
   `ability_key === "sag"` ; l'assertion a été réécrite à la nouvelle vérité à
   la fusion. Ce lot n'a pas touché la suite d'un autre.

---
---

# Questions du lot `10-mcp-v0` à l'architecte

**Écrites le 2026-08-08**, après la fusion du lot 9. Même discipline que
ci-dessus : loi §0.10, le lot n'invente ni valeur, ni nom, ni règle ; Eric est
à distance, donc le lot a fait **tout ce qui ne dépendait pas** de ces
questions, a tenu la règle la plus stricte à chaque fois, et l'a rendue
**visible par un test** plutôt que de la décider en silence.

Numérotées comme dans `contracts/mcp.md`.

---

## 0. ⚠️ LE FAIT QUI DOMINE TOUT LE RESTE — la spécification MCP a changé de nature

**Mesuré le 2026-08-08**, en allant lire la source comme la §3 du mandat
l'exigeait. La révision courante du protocole est **`2026-07-28`** (publiée le
28 juillet 2026, elle remplace `2025-11-25`), et elle **supprime la poignée de
main `initialize` et la session de protocole**. MCP est désormais **stateless**
au sens fort :

> « Servers **MUST NOT** rely on prior requests over the same connection to
> establish context. […] State that needs to span multiple requests **MUST**
> be referenced by an explicit identifier the client passes on each request. »
> — et, dans la même page : *« an open connection, such as a STDIO process, is
> not a conversation or session »*.

Quatre conséquences déjà appliquées, sans arbitrage nécessaire : chaque requête
porte sa version et les capacités du client dans `params._meta` ; tout `result`
porte un `resultType` ; `server/discover` **doit** être implémenté ; une
resource absente rend `-32602` (et `-32002` est **interdit d'émission**).

**Sans cette vérification, ce lot aurait écrit une poignée de main qui n'existe
plus.** C'est exactement le risque que le mandat nommait, et il était réel.

---

## 1. ⚠️ LA DÉCISION D2 A ÉTÉ PRISE AVANT CETTE LECTURE — et elle la contredit

**Le fait.** D2 dit : *« Ton serveur tient UN document ouvert en mémoire pour
la durée de la session. »* La révision `2026-07-28` dit : il n'y a **pas** de
session, et un état qui traverse plusieurs requêtes **doit** être désigné par
un identifiant que le client repasse à chaque appel (le motif « handle » que la
spécification décrit dans *Stateful Tools*).

**Ce que le lot a fait, sans trancher.** Les deux tiennent debout ensemble,
et sans qu'aucune soit maquillée :

- **le document ouvert existe**, comme D2 l'ordonne : il est servi par la
  resource `fh-char:///open` et par `mcp.document` ;
- **et chaque outil de `build` accepte `document` en argument.** Ce n'est pas
  une invention : c'est **la forme exacte des verbes du lot 9**
  (`{document?}` — le premier appel qui en porte un l'adopte, les suivants
  s'en passent), recopiée. Un client qui passe `document` à chaque appel est
  donc **strictement conforme à la révision courante** ; un client qui l'omet
  retombe sur le document ouvert.

**Ce qui reste à trancher.** Faut-il aller jusqu'au bout du motif de la
spécification — un **identifiant de document** rendu à la création et repassé
à chaque appel, plusieurs personnages ouverts en parallèle ? Ce serait un nom
et une règle neufs (loi §0.10), et surtout ça mordrait sur la tranche du bloc
`doc`, que D2 interdit explicitement de préempter. **Le lot n'a donc rien
fabriqué.** La question est : la décision n°3 d'Eric (« le personnage
appartient au joueur ») est-elle mieux servie par le document ouvert, ou par
un handle explicite ?

⚠️ Corollaire pratique : tant que le document ouvert existe, **deux clients qui
partageraient le même processus se marcheraient dessus**. Aujourd'hui c'est
sans conséquence — un serveur stdio est lancé par un seul client — mais ça
cesse d'être vrai le jour où un transport HTTP arrive.

---

## 2. L'URI de la resource : `fh-char:///open`

**Le fait.** La spécification demande un schéma d'URI conforme à la RFC 3986 et
**déconseille `https://`** dès que le client ne peut pas aller chercher la
ressource lui-même — c'est exactement le cas : ce document ne vit nulle part
ailleurs qu'en mémoire.

**Ce que le lot a posé** : `fh-char:///open` — le schéma porte le nom du format
qu'il sert, l'autorité est vide (comme `file:///`), le chemin dit ce que c'est.
**À ratifier ou à renommer.** C'est un nom public : il apparaîtra dans les
configurations des clients, et le changer plus tard cassera les leurs.

---

## 3. Le bloc `mcp` n'a **aucun verbe** et ne s'enregistre pas sur le noyau

**Le fait.** `ARCHITECTURE.md` lui donne « adaptateur : doc/build/play en
tools+resources », **aucun verbe**, **aucun événement**, **aucun état**.
`defineBlock` exige des verbes : sans verbe, il n'y a rien à enregistrer.

**Ce que le lot a fait.** L'instance rend `{name, handle}`. Le constructeur
câblé sur le noyau s'appelle **`connectMcp`** et non `registerMcp`, parce qu'il
n'enregistre rien — « connecter » est le mot que la carte emploie déjà pour un
bloc de frontière (`connect-ddb`), donc aucun vocabulaire neuf.

**À ratifier.** Et une remarque de cohérence : la carte dit « état possédé :
aucun » pour ce bloc, alors qu'il tient un **miroir** du document ouvert (D2).
Le contrat le nomme miroir et pas tranche — il n'est jamais écrit, jamais
dérivé, jamais repassé à un verbe — mais la carte mérite peut-être un mot.

---

## 4. Pas d'`outputSchema` sur les outils

**Le fait.** La spécification le permet, et exige alors que le
`structuredContent` s'y conforme. Le décrire serait une **deuxième copie** de
la forme que `build` et `layers` rendent déjà — et **rien ne la comparerait**.
Ce dépôt a mesuré deux fois que deux copies d'une règle divergent, sauf si
quelque chose les compare (`layers-document`, puis le garde de dérive
schéma↔code du lot 9, écrit *après coup* parce qu'un commentaire promettait un
comparateur qui n'existait pas).

**Ce que le lot a fait** : aucun `outputSchema`, et la raison écrite au contrat.
**À ratifier** — ou à commander avec son comparateur, jamais sans.

---

## 5. ✅ COMMANDÉE AU LOT 13, ET FAITE — `HOUSE_MECHANICS` ne voyait pas les formes camelCase

> **Réparé le 2026-08-08 par le lot 13.** Les deux bouts du mot lâchaient :
> la tête (`spendDestiny`) est reprise par un **découpeur d'identifiants**
> (camel, `_`, acronymes) que `findForbidden` balaye **en plus** du texte brut ;
> la queue (`destinyDie`) par le **retrait de l'ancre finale**. Attaqué dans
> les deux sens (`tests/guards-adversarial.test.mjs`, défaut n°5), et mesuré
> avant d'être posé : **zéro occurrence nouvelle** dans tout `src/` et `bin/`.
> Le test qui MESURAIT le trou (`tests/mcp-block.test.mjs`) est réécrit — il
> interrogeait les regex nues et serait resté vert après le durcissement.
> Ce qui suit est l'état d'avant, conservé pour le récit.


**Trouvé en attaquant le garde §0.12 de ce lot.** `tests/source-scan.mjs`
cherche `\bdestin(y|ies)\b`, `\bchaos\b`, `\barcan(a|e|es|um)\b`… : dans
`spendDestiny`, il n'y a **aucune frontière de mot** avant le « D ». Toutes les
formes composées passent — et ce sont **précisément celles que le code
emploie**.

Mesuré, échantillon complet dans `tests/mcp-block.test.mjs` :

| Forme | Vue par le garde |
|---|---|
| `destiny`, `Destiny` | ✅ oui |
| `spendDestiny`, `setDestinyPoints`, `resolveArcana`, `settleAwakening`, `onOverreach`, `addPendingFate` | ❌ **non** |

**C'est la parente exacte du défaut corrigé le même jour** sur `arcane?` — la
leçon (« un garde de vocabulaire se teste sur les FORMES QUE LE CODE EMPLOIE »)
avait été écrite, mais la liste n'avait été durcie que sur un mot.

**Ce que le lot a fait, et pas fait.** Il **n'a pas touché au garde d'un autre
lot** : durcir une liste partagée à l'aveugle sortirait de son périmètre. Il a
**mesuré le trou dans un test dédié**, pour qu'il ne puisse ni disparaître ni
s'élargir en silence, et il a vérifié ce qui rend la question actionnable :
**durcir la liste aujourd'hui ne rendrait aucune suite rouge** — les seules
occurrences camelCase du dépôt sont dans `src/modules/fh/`, qui a le droit de
nommer FH.

**À commander** : le durcissement, et à quel lot.

---

## 6. Le bloc `play` n'est pas exposé

**Le fait.** `ARCHITECTURE.md` annonce pour le bloc `mcp` : « adaptateur :
**doc/build/play** en tools et resources ». `doc` n'existe pas au M2 (D2 le
dit). `play`, lui, existe — mais aucun besoin de jet n'est formulé pour ce lot,
dont le titre et le test d'acceptation portent sur **la fabrication d'un
personnage**.

**Ce que le lot a fait** : rien, et il le déclare. Fabriquer une dizaine
d'outils de jet pour un besoin que personne n'a formulé serait exactement la
loi §0.6. **À commander** quand la vue de jeu arrive.

---

## 7. `layers.query` sans `id` peut rendre 611 Ko

**Mesuré** sur la couche SRD FR : `spell` = 339 records = **611 Ko** de
résultat JSON ; `class` = **175 Ko** ; `gear` = 63 Ko ; `species` = 21 Ko ; un
seul record = 3,1 Ko.

**Pourquoi l'outil existe quand même** : sans lui, une IA ne peut pas connaître
les identifiants à poser dans un choix — elle devrait les **deviner**, et
deviner est ce que ce dépôt paye le plus cher. La surface serait un dispositif
de rejeu, pas un constructeur.

**Ce que le lot a fait** : il expose le verbe **tel quel**, sans projeter ni
tronquer. Projeter serait un élagage silencieux, et l'appelant ne saurait pas
ce qui a disparu (loi §0.5). L'appelant choisit, l'appelant paye.

**À trancher** : faut-il une forme « index » (identifiant + nom seuls) ? Ce
serait un nouveau verbe ou un nouvel argument, donc une invention — le lot n'en
a pas fabriqué.

---

## 8. `LayerError` ne pose pas son `name`, `BuildError` si

**Mesuré le 2026-08-08.** `BuildError` fait `this.name = "BuildError"` ;
`LayerError extends Error {}` ne fait rien, donc `error.name === "Error"`. Les
deux doivent pourtant arriver **nommées** à l'IA : « niveau absent » doit se
lire comme le refus d'un bloc, pas comme un incident anonyme.

**Ce que le lot a fait** : il lit `constructor.name`, qui donne les deux (et
qui tient parce que ce dépôt n'a **aucune étape de compilation** susceptible de
renommer une classe — loi §0.11). Il n'a **pas** corrigé `LayerError` : c'est
le fichier d'un autre lot, et la correction est d'une ligne.

**À commander** si l'asymétrie doit disparaître.

---

## 9. En quelle langue parle la surface à l'IA ?

**Le fait.** Les descriptions d'outils, les titres, les `instructions` de
`server/discover` et les résumés textuels sont des **mots**, et c'est
légitime : la loi §0.13 dit « le moteur produit des identifiants,
**l'interface produit des mots** », et ce bloc **est** l'interface. Mais rien
ne dit **quelle langue**.

**Ce que le lot a fait** : français, la langue de travail du dépôt, et **à un
seul endroit** (le catalogue `src/mcp/tools.mjs`) pour qu'une traduction reste
un seul geste. Les messages de refus, eux, arrivent tels que les blocs les
écrivent — donc en français aussi.

**À trancher** : anglais pour la surface publique (les clients MCP et les
modèles sont majoritairement anglophones) ? Un lexique comme
`src/play/labels.mjs` ? Le lot n'a pas inventé de mécanisme de traduction pour
un besoin non formulé.

---

## ⛔ HORS PÉRIMÈTRE, MAIS BLOQUANT POUR LA FUSION — `fh-srd` a bougé PENDANT ce lot

**Mesuré le 2026-08-08, en fin de lot, et il faut le lire avant de fusionner
quoi que ce soit.**

`~/tools/fh-srd` a reçu trois commits **pendant que ce lot s'écrivait** :

```
e95350b  2026-08-08 12:43  Repair the two-column reading order, and name the 39 records it was corrupting
df7ec71  2026-08-08 12:4x  Species traits and lineages, read from the page's geometry rather than its prose
6f9f425  2026-08-08 12:50  Fusion du lot 11-srd-colonnes : l'ordre de lecture des pages à deux colonnes
```

C'est **le préalable que le lot 8 avait nommé** en refusant `traits (espèce)`
(« mise en page à deux colonnes aplatie, une espèce qui déborde sur la
suivante »). Il est levé. Les exports ont été réécrits à **12:50**.

**Conséquence immédiate** : `layers/srd-5.2.1-*.layer.json`, tels qu'ils sont
commités dans `fhpc`, sont **périmés**. Une régénération produit 613 lignes de
différence — les tables de classe quittent la prose des aptitudes pour aller
où elles doivent.

### Deux défauts distincts, qu'il ne faut pas confondre

**1. `tests/gen-srd-layer.test.mjs` ÉCRIT dans un artefact suivi par git.** Son
dernier test appelle `generate()`, qui **écrase** `layers/*.layer.json`, *puis*
compare. Quand la comparaison échoue — c'est-à-dire précisément quand elle a
quelque chose à dire — **elle laisse l'arbre modifié**. Lancer `npm test` mute
le dépôt.

**2. Et comme `node --test` lance les fichiers EN PARALLÈLE, c'est une
course.** Les suites qui *lisent* `layers/` (`build-acceptance`,
`layers-acceptance`, et les deux miennes) les lisent pendant que
`gen-srd-layer` les *réécrit*. Selon qui gagne, la même suite est verte ou
rouge sans qu'une ligne ait changé. **Les deux ont été observées dans la même
heure**, sur le même arbre.

C'est exactement la leçon que ce chantier avait déjà payée, sous une autre
forme : *une preuve peut cesser de prouver sans que personne n'y touche.* Ici
elle peut même alterner.

### Ce que ce lot a fait, et ce qu'il n'a PAS fait

**Isolé, mesuré, et laissé intact.** Sur l'arbre **tel qu'il est commité** :

| Ce qui a été lancé | Résultat | Arbre après |
|---|---|---|
| `build-acceptance` + `layers-acceptance` + les deux suites MCP, **sans** le générateur | **32/32 vertes** | **propre** |
| `gen-srd-layer` **seul** | **11/12** — seul `generate() … laisse un arbre re-générable à l'identique` tombe | **`layers/` modifié** |

**Ce lot n'a PAS régénéré les couches**, et c'est délibéré :

- ce sont les artefacts d'un autre lot, et les régénérer **rebaserait la
  dérivation** — `traits (espèce)` redevient probablement dérivable, donc la
  liste `underived` de `build-acceptance` (lot 9) **et la mienne** deviennent
  fausses, et les deux devront être réécrites `REWRITTEN` sur leur propre
  ligne ;
- c'est le rituel que ce dépôt appelle « la confrontation à la vraie matière »,
  et il appartient à qui fusionne le lot `11-srd-colonnes` dans `fhpc`, pas à
  un lot qui passait par là.

### À commander

1. **Régénérer les couches** et refaire la confrontation, comme après le lot 8.
   Les deux listes `underived` (lot 9, lot 10) sont à réécrire à la nouvelle
   vérité — pas à relâcher.
2. **Faire en sorte que la suite n'écrive plus dans l'arbre.** Un test qui
   vérifie la reproductibilité peut générer **à côté** et comparer, sans
   toucher au fichier suivi. Tant qu'il écrit, `npm test` n'est pas idempotent
   et la course reste ouverte.

---

## Hors questions — deux remarques pour la fusion

1. **`ajv` n'est pas installé dans le worktree.** `npm test` est vert parce
   qu'une copie **8.18.0** traîne dans `/Users/Eric/node_modules` et que Node
   remonte l'arbre pour résoudre — alors que `package.json` épingle **8.20.0**.
   Ce n'est pas un faux vert (la dépendance est bien déclarée), mais la version
   réellement exécutée n'est pas celle qui est épinglée. Un `npm ci` avant la
   fusion lèverait le doute.
2. **Le harnais de transport ferme ses processus enfants.** Mesuré en écrivant
   ce lot : une assertion qui échouait sautait par-dessus le `close()`,
   l'enfant restait vivant, et le lanceur de tests **attendait indéfiniment**.
   Une suite qui pend est pire qu'une suite rouge — elle ne dit même pas ce qui
   ne va pas. Le harnais prend désormais le contexte du test et ferme à la
   sortie, avec un `SIGKILL` de secours.

---
---

# Questions du lot `13-confrontation` à l'architecte

Trois chantiers commandés, trois chantiers faits : les quatre suites réécrites
à la nouvelle vérité, la suite qui mutait `layers/` réparée **et** gardée, le
garde §0.12 élargi aux formes composées. Ce qui suit est ce que le lot a
**décidé** et qui demande ratification, plus ce qu'il a **mesuré** sans le
réparer.

---

## 1. ⚠️ DÉCISION PRISE — un trait qui accorde un sens paraît DEUX FOIS, et la dérivation ne trie pas

**La question posée par l'architecte.** La couche rend **cinq** traits pour
l'Elfe (Ascendance féerique, Lignage elfique, Sens aiguisés, Transe, **Vision
dans le noir**) ; le personnage d'exemple n'en portait que **quatre** — la
Vision dans le noir y était en `senses`, pas en `traits`. Les deux sont vrais
dans le livre.

**Ce que la dérivation produit, et pourquoi.** Les **cinq**. Quatre raisons,
dans l'ordre de leur force :

1. **Rien ne lie un trait au sens qu'il accorde.** Le contrat §5 ne porte aucun
   champ de ce genre. Pour retirer le trait, le moteur devrait rapprocher
   `vision-dans-le-noir` de `darkvision` — **deux identifiants différents** —
   donc les rapprocher par leur **nom affichable**. La loi §0.13 l'interdit, et
   ce serait faux dès la première couche qui les nomme autrement.
2. **Ce ne sont pas des doublons.** Le trait porte la **règle** (`text`) ; le
   sens porte le **nombre** (18 m) que la fiche affiche sur sa ligne. Une fiche
   montre les deux, à deux endroits différents.
3. **La dérivation recopie une liste, elle ne l'arbitre pas.** Filtrer serait un
   jugement — « celui-là est déjà représenté ailleurs » — que rien dans la pile
   ne fonde.
4. **Le livre les liste tous les cinq.**

**Ce que le lot a fait de l'exemple.** Il l'a **complété** :
`examples/personnage-srd-fr-niveau1.fh-char.json` porte désormais neuf traits
(cinq d'espèce, deux de classe, un de don, un de la couche homebrew). Sans ça,
la cible d'acceptation de tous les lots suivants **affirmerait que l'Elfe a
quatre traits**, ce que ni le livre ni la couche ne disent — même famille
exactement que le « Livre de sorts » corrigé le 2026-08-08, et la leçon écrite
ce jour-là : « un exemple qui nomme un objet inexistant fait repayer la
découverte à chaque lot suivant ». **Le `hash` de pile n'a pas été touché.**

**À ratifier** : la règle (« la dérivation recopie la liste du record ») et le
complément de l'exemple.

---

## 2. `contracts/build.md` a été mis à jour — un contrat non ratifié ne fait pas foi

Trois passages du contrat décrivaient les traits d'espèce comme **refusés par
le lot 8**, avec la mesure des deux colonnes et le préalable nommé. Le préalable
est levé (lot 11), donc ces trois passages **mentaient** : les laisser aurait
fait chercher un refus qui n'existe plus. Ils sont réécrits, et le contrat porte
maintenant la règle du point 1 ci-dessus.

**À ratifier**, comme tout contrat (CLAUDE.md).

---

## 3. ⚠️ MESURÉ, NON RÉPARÉ — le garde d'arbre ne surveille pas les fichiers non suivis hors des quatre répertoires d'artefacts

`tests/tree-immuable.test.mjs` rejoue toute la suite entre deux relevés de
l'arbre. Son périmètre est : **les fichiers suivis par git** (modification,
disparition) **plus tout ce qui se trouve sous `layers/`, `examples/`,
`schemas/` et `contracts/`**, suivi ou non (apparition comprise).

**Ce qu'il ne voit pas** : un fichier **non suivi** déposé ailleurs, par exemple
dans `src/` ou à la racine. Ce n'est pas un oubli — `tests/mcp-block.test.mjs`
crée et retire un `src/mcp/sous/porte-de-sortie.mjs` pour attaquer son propre
arpenteur, et `node --test` fait tourner les suites **en parallèle** : le
surveiller ferait battre le garde au hasard de l'ordonnancement. **Un garde qui
bat se fait désactiver, et c'est alors la garantie entière qui est perdue.**

**À trancher si ça vous gêne** : soit on force la sérialisation des suites, soit
on déclare une liste d'emplacements de travail autorisés. Le lot n'a fabriqué
ni l'une ni l'autre.

---

## 4. Le garde d'arbre rejoue toute la suite — coût mesuré, et il double l'affichage d'un échec

**Coût** : la suite entière tourne deux fois. Mesuré à **~1,4 s par passe** sur
ce Mac, soit ~2,8 s au total — le prix a paru dérisoire devant un test qui rend
deux verdicts différents sans qu'une ligne ait changé.

**Effet de bord assumé** : le garde exige que le sous-processus soit **vert**
avant de conclure, parce qu'un relevé identique après une suite rouge ne prouve
rien (le code qui mute n'a peut-être pas été atteint). Conséquence : quand une
suite est déjà rouge, l'échec est affiché **deux fois**. Le doublon ne se paye
que dans un arbre déjà cassé.

---

## Hors questions — une remarque pour la fusion

**La remarque `ajv` du lot 10 tient toujours** : `node_modules/` n'existe pas
dans ce worktree, et `npm test` est vert parce que Node remonte l'arbre jusqu'à
une copie d'`ajv` hors du dépôt. La version réellement exécutée n'est donc pas
forcément la **8.20.0** épinglée. Un `npm ci` avant la fusion lèverait le doute.

---
---

# Questions du lot `14-bloc-doc` à l'architecte

**Écrites le 2026-08-08.** Loi §0.10 : le lot n'invente ni valeur, ni nom, ni
règle. Les **cinq décisions d'architecte** du mandat (D1 à D5) n'ont pas été
rouvertes ; ce qui suit est ce que le mandat laissait explicitement au lot, ou
ce que le lot a rencontré et n'avait pas le droit de trancher seul. À chaque
fois : la règle la plus stricte a été tenue, et rendue **visible par un test**
plutôt que décidée en silence.

Numérotées comme dans `contracts/doc.md`.

---

## 1. Le SCHÉMA est injecté, comme le magasin

**Le fait.** D1 dit que `src/doc/` n'importe jamais `node:fs` et ne nomme aucun
chemin. D3 dit que la liste blanche est **une seule, générée du schéma**. Les
deux ensemble n'ont qu'une issue : **le fichier de schéma est un fichier**, donc
le bloc ne peut pas le lire, donc il le **reçoit** — `createDoc({schema})`.

**Ce qui a été écarté, et pourquoi.**

- *Recopier les règles en code, comme `src/layers/document.mjs`.* C'est
  l'idiome existant : deux copies plus un garde de dérive. Il tient tant que le
  garde existe. Mais la leçon n°3 de `ARCHITECTURE.md` dit « une seule liste
  blanche **générée** du schéma », et ce lot l'a prise au mot.
- *`import schema from "…/fh-char.schema.json" with {type:"json"}`.* Un
  spécificateur de module **est** un chemin. Le garde D2 l'aurait vu, et
  l'exempter aurait ouvert exactement la porte que D2 ferme.

**Ce que ça coûte.** `src/doc/schema.mjs` est un validateur de **sous-ensemble**
JSON Schema 2020-12 : 24 mot-clefs, ceux et seulement ceux que `fh-char/1`
emploie. Il ne prétend pas être général, et **il jette à la compilation sur
tout mot-clef qu'il ne saurait pas appliquer**, en le nommant. C'est ce refus
qui rend l'approche tenable : une règle ajoutée au contrat ne peut pas rester
silencieusement inappliquée.

**Ce que ça rapporte.** `ajv` reste juge : les deux validateurs sont confrontés
sur 45 documents et le moindre désaccord rougit. Et un test exige que la liste
des mot-clefs supportés couvre **exactement** ce que le schéma emploie — dans
les deux sens.

**À ratifier.** Si l'architecte préfère l'idiome `layers` (recopie + garde de
dérive), le remplacement est local : `schema.mjs` et `store.mjs`.

---

## 2. `duplicate` EXIGE `as` — le bloc ne fabrique aucun identifiant

**La question posée** : *« que rend `duplicate` — un id neuf, forcément, mais
lequel, et qui le fabrique ? »*

**La réponse du lot** : l'appelant. `duplicate({id, as})`, et `as` est
obligatoire. Un id est un **nom** : il est porté par le document pour toujours,
il apparaît dans les listes du joueur, et §0.10 interdit d'inventer un nom.

**Les deux fabriques envisagées, et pourquoi elles ont été écartées.**

- *`${source}-${now()}`* — valide au regard de `$defs/id`
  (`exemple-sylvane-aubelame-2026-08-08T14:22:31Z` passe le motif), déterministe
  puisque l'horloge est injectée. Mais elle grave l'heure dans un identifiant
  que le joueur verra toujours, et elle collisionne si l'on duplique deux fois
  dans la même seconde — ce qui redevient un refus, donc un cas à traiter pour
  n'avoir pas voulu en traiter un.
- *un compteur (`…-2`, `…-3`)* — il faut relire le magasin pour savoir où en
  est le compte, et le résultat dépend alors de ce que le magasin contient au
  moment du geste. Un identifiant qui dépend de l'état d'un répertoire n'est
  pas un identifiant, c'est un rang.

**Ce que le lot a livré en attendant** : un refus qui **dit** ce qu'il attend.
Si l'architecte veut une fabrique, elle s'ajoute **sans rien casser** — `as`
deviendrait facultatif, et le port `newId` s'injecterait comme le reste.

**Conséquence pour le câblage MCP** : tant que la question n'est pas tranchée,
l'outil `doc.duplicate` a un argument obligatoire de plus.

---

## 3. `doc-saved` porte une `reason` plutôt qu'un troisième type d'événement

`ARCHITECTURE.md` donne à ce bloc **deux** événements : `doc-opened`,
`doc-saved`. Or trois verbes écrivent (`save`, `import`, `duplicate`), et un
abonné a de bonnes raisons de vouloir les distinguer — une UI n'annonce pas un
import comme une sauvegarde.

Inventer `doc-imported` aurait été inventer un nom (§0.10). Le champ `reason`
est l'idiome **déjà employé** par `layers-changed` (`"register"`, `"enable"`,
`"disable"`), donc il n'invente rien.

**À ratifier**, comme tout ajout de charge utile.

---

## 4. Aucun verbe de suppression, et le port n'a pas de `remove`

Le kickoff donne six verbes et aucun n'efface. Le port de stockage a donc
**trois** méthodes — `list`, `read`, `write` — et pas une quatrième.

Ce n'est pas un oubli : c'est §0.6 (« pas de code mort derrière un
interrupteur », pas de feature pour un besoin que personne n'a formulé) et
c'est aussi la prudence la plus élémentaire dans un bloc dont le métier est
« les personnages du joueur ». Le jour où quelqu'un formule le besoin, la
question à trancher **avec** sera : effacer, ou archiver ?

Conséquence assumée : un magasin ne se vide que depuis l'extérieur (le
répertoire est celui du joueur).

---

## 5. `export` ne prend qu'un `id`, jamais un document en mémoire

Un `export({document})` serait commode : « donne-moi le fichier du personnage
que je viens de construire, sans le sauvegarder ». Il n'a pas été fabriqué.

Deux raisons. D'abord §0.6 : le besoin formulé est « partir avec ses persos »,
c'est-à-dire exporter ce qui est **au repos**. Ensuite la cohérence : un export
qui ne passe pas par le magasin rend des octets dont l'empreinte ne désigne
rien — et l'empreinte est le témoin sur lequel tout le reste du bloc s'appuie.

La marche à suivre existe et n'est pas pénible : `save` puis `export`. Elle a
même une vertu — le personnage est **au repos** avant de voyager.

---

## 6. ⚠️ LES OCTETS À TRAVERS MCP — la question que le câblage devra trancher

Ce lot ne touche pas à `src/mcp/` (décision D5), mais il laisse une question
posée pour le lot qui câblera :

`export` rend des **octets** (~18 Ko pour le personnage d'exemple, et rien ne
borne un personnage de niveau 20 avec ses notes). MCP transporte du JSON-RPC en
lignes. Trois voies, aucune inventée par ce lot :

1. **texte UTF-8 dans le `structuredContent`** — le précédent existe et il est
   mesuré : `layers.register` fait passer **3,08 Mo** de texte en une ligne, en
   ~100 ms (contrats/mcp.md) ;
2. **une resource** `fh-char:///<id>` — plus propre au regard de la
   spécification, mais le lot 10 note que `resources/list` ne porte
   aujourd'hui **qu'une** entrée, et en faire une liste est un changement de
   surface ;
3. **les deux**, ce qui ferait deux adresses pour une même chose — exactement
   ce que l'invariant 12 de `contracts/mcp.md` refuse (« le document ne repart
   jamais dans un résultat d'outil : il a deux adresses, pas une troisième »).

**Rien n'est décidé ici.** Le contrat de `doc` dit seulement ce que le bloc
rend ; la forme sur le fil appartient au lot de câblage.

---

## Hors questions — trois remarques pour la fusion

1. **`src/storage/` est un répertoire NEUF**, hors du bloc, et il n'est sous
   aucun garde structurel existant. C'est voulu (c'est là que le disque vit),
   mais ça mérite d'être vu à la fusion : il faudra veiller à ce qu'aucun bloc
   ne l'importe. Le garde de `doc` interdit déjà `../storage/`.
2. **`bin/fhpc-mcp.mjs` n'a PAS été touché** : le bloc `doc` n'est donc monté
   sur le noyau par personne aujourd'hui, et `registerDoc` n'est appelé que par
   la suite. C'est la conséquence directe de D5 — le câblage est un lot
   d'après. Si l'architecte veut que le serveur monte `doc` dès maintenant, il
   faudra lui donner une racine de magasin, et c'est **cette racine** qui est
   la vraie décision (D2 : elle vient de l'appelant, jamais d'un défaut).
3. **La remarque `ajv` des lots 10 et 13 tient toujours** : ce worktree n'a pas
   de `node_modules/` propre, et Node remonte l'arbre jusqu'à une copie d'`ajv`
   hors du dépôt. Ce lot en dépend plus que les précédents — `ajv` y est
   **juge** du validateur maison. Un `npm ci` avant la fusion lèverait le
   doute.
