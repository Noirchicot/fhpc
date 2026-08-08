# Inventaire du lot `17-couche-fh-retrait`

> **Une couche sait enfin RETIRER.** Et la première chose qu'elle retire est
> celle que le lot 15 avait eu raison de refuser : `Resourceful`, à l'Humain.
>
> Écrit le 2026-08-08. Branche `17-couche-fh-retrait`, coupée de `main` = `67a5db8`.
> Questions à l'architecte : `QUESTIONS-ARCHITECTE.md`, Q17-1 → Q17-5.
> **Q15-5 et Q15-4 sont fermées par ce lot.**

## Ce qui est livré

| Fichier | Ce qui y change |
|---|---|
| `src/layers/paths.mjs` | **`applyRemoval`** et **`applyPatch`** — le retrait, ses trois refus, et l'ordre |
| `src/layers/stack.mjs` | le pli applique `remove` puis `changes` ; la provenance porte `removed` |
| `src/layers/document.mjs` | `remove` validé au chargement ; `PATCH_KEYS` exportée pour le garde de dérive |
| `schemas/fh-layer.schema.json` | **`opPatch.remove`** — seule extension, seul lot autorisé |
| `contracts/layers.md` | le retrait entre au contrat : sa grammaire, son ordre, ses invariants 9-10-11 |
| `src/tools/fh-species-source.mjs` | `removeTraits` de l'Humain ; **les trois jeux de substitutions** |
| `src/tools/gen-fh-species-layer.mjs` | les descriptions **recalculées** ; le garde anti-prose-à-la-main |
| `layers/fh-species-en.layer.json` | SHA-256 `bce41951da0666546d0a2561f83e534534b29b9f3ee53828c168352f9c4f6401` |
| `tests/layers-remove.test.mjs` | **16 tests** — le retrait, ses refus, ses attaques |
| `tests/fh-species.test.mjs` | **+9 tests** ; trois assertions réécrites à la nouvelle vérité |

**Suite complète : 409 vertes / 0 rouge** (384 existantes + 25), **deux passes
d'affilée sans nettoyage, même verdict**, arbre propre, générateur déterministe.

---

## CHANTIER A — l'opération de retrait

### La forme, et ce qu'elle refuse d'être

```json
{ "op": "patch", "remove": ["data.traits[resourceful]"] }
```

Une clef **sœur** de `changes`, une **liste de chemins** de la même grammaire —
donc l'**identité**, jamais l'index. **Pas de valeur sentinelle**, et surtout
pas de `null` qui voudrait dire « retire » : `null` est une valeur JSON
légitime qu'un patch **pose**, et un test le prouve encore après le lot.

### ⭐ L'ordre — et pourquoi il se démontre au lieu de se choisir

**Les retraits s'appliquent AVANT les modifications.** Le critère n'est pas la
lisibilité : c'est **lequel des deux ordres fait crier un patch qui se
contredit**.

| Le patch dit | retraits d'abord | modifications d'abord |
|---|---|---|
| retirer `X`, puis écrire **sous** `X` | **jette** — l'intermédiaire n'existe plus | réussit puis s'efface : **silence** |
| poser `X`, puis retirer `X` | **jette** — le retrait ne vise rien | réussit puis s'annule : **silence** |

Un test joue **les deux sens**, et un troisième rejoue l'ordre inverse à la
main pour montrer le silence qu'on a évité. À l'intérieur, `changes` garde son
**tri** (une carte n'a pas d'ordre qui se lise à l'œil) et `remove` suit **sa
liste** (un tableau porte déjà celui que son auteur a écrit).

### Les quatre refus, chacun violé une fois

| Ce qui est refusé | Pourquoi |
|---|---|
| un retrait qui **ne vise rien** | même doctrine que le patch dans le vide (§L7.2) — et le message **nomme le chemin** |
| `attribution`, `source`, `contentHash` | **un interdit qui ne vaudrait que pour l'écriture se contournerait par la suppression**. Une couche ne décroche pas la notice CC-BY d'un record dont elle dérive (loi §0.8) |
| une **racine entière** (`data`, `name`, `slug`) | `fh-layer/1` exige `name` et `data` : un pli qui les ôterait produirait un record que son propre schéma ne saurait pas exprimer. ⚠️ Q17-1 |
| `op: "remove"` | le retrait est **du patch**, il n'ouvre pas une quatrième opération |

**Un record amputé perd son `contentHash`**, exactement comme un record patché :
retirer une aptitude rompt la description autant qu'en changer une.

### Ce qui était déjà vrai, et qui est maintenant PROUVÉ

> **« Retirer une couche rend ce qu'elle avait retiré »** — vrai *par
> construction*, puisque le pli est recalculé de zéro. Le lot ne l'a pas écrit,
> il l'a **mesuré** : le record rendu redevient celui du socle **à
> l'identique, contentHash compris** — le certificat revient parce que plus
> personne ne touche au contenu qu'il certifie.

Et **le pli reste transactionnel** : une couche dont le *second* retrait vise
le vide est démontée, et le *premier*, qui avait pourtant réussi, ne laisse
aucune trace.

### Le garde de dérive schéma ↔ code, élargi

Deux couples de plus, et **tous deux attaqués** : la grammaire de chemin de
`remove` (troisième copie de la même règle — trois copies ne restent égales que
si quelque chose les compare) et **la liste des clefs d'un patch**. Une clef
ouverte dans le schéma seul serait acceptée par la norme et refusée par son
exécution : l'écart doit se voir ici, pas chez quelqu'un d'autre.

---

## CHANTIER B — les espèces d'Eric, finies

### B1 — l'Humain perd `Resourceful`

Décision d'Eric du 2026-08-08. Ce qui compte n'est pas que le trait parte,
c'est **comment** : le tableau `data.traits` n'est **jamais réécrit**. Un test
le vérifie deux fois — l'entrée de couche ne porte aucun `data.traits` dans ses
`changes`, et les deux traits gardés sont ceux du SRD **mot pour mot**. C'était
tout l'argument du refus du lot 15 ; il est tenu.

### B2 — les descriptions : **déclarées, jamais recopiées**

Le prix a été dit à Eric et assumé : patcher `data.description`, **c'est**
recopier la prose du SRD. Il est payé autrement.

**La source ne contient aucune phrase du SRD.** Elle déclare, par record, ce
qu'on cherche, ce qu'on pose, et **pourquoi**. Le générateur lit le texte SRD
**courant** et recalcule.

| Record | Ce qui change | Alarme si le SRD bouge |
|---|---|---|
| **Hoddon** | 5 substitutions (`As a Gnome`, les deux traits, les deux sous-lignées) | le motif introuvable **jette en le nommant, avec sa raison déclarée** |
| **Elfe** | *Keen Senses* cite **Survival, Delve, Vigilance** — la même chaîne que `data.traits[keen-senses].text`, écrite à un seul endroit | idem |
| **Humain** | la phrase de *Resourceful* part en entier | idem |

**Deux alarmes, et elles ne gardent pas la même chose :**

1. une substitution qui **ne trouve pas** sa cible → échec bruyant. C'est elle
   qui transforme une dérive silencieuse en alarme, et le test le prouve en
   modifiant le texte SRD dans une fixture ;
2. `mustNotContain` relit le **résultat** — parce qu'une **phrase neuve** du
   SRD laisserait tous les motifs déclarés satisfaits et ferait quand même dire
   « Gnome » au Hoddon. Prouvé, lui aussi, sur une fixture.

### `data.description` a changé de garde, et le garde est plus serré

Il était dans `WHOLESALE_PATHS` (« n'écris pas ce chemin ») : cet interdit
empêchait la recopie **en empêchant la correction**. Il passe sous
`handWrittenDescriptions`, qui ne demande pas si le chemin est écrit mais si le
texte écrit est **celui que les substitutions produisent depuis le SRD
courant**. Il attrape donc **trois** fautes que l'ancien ne voyait pas :

- une prose posée à la main sur un record sans substitution déclarée ;
- une **copie figée** qui a cessé de suivre sa source ;
- **le SRD qui bouge sous une couche commitée par ailleurs saine** — sans qu'on
  ait touché à la couche.

Les trois sont jouées dans l'attaque, avec leur témoin muet sur la vraie couche.

---

## Ce que le lot a REFUSÉ de faire

- **Renommer les sous-lignées dans le TEXTE du trait `gnomish-lineage`.** Le
  mot « Gnome » y survit — c'est le **seul** endroit du record plié, et un test
  le NOMME au lieu de compter. Eric a demandé les descriptions ; renommer
  « Forest Gnome » est une décision de contenu qu'il n'a pas prise. **Q17-3.**
- **Écrire les traits FH dans la description.** Ce serait écrire de la prose à
  la main, ce que tout le dispositif existe pour interdire. **Q17-4.**
- **Toucher au schéma au-delà de `opPatch.remove`.**

## Les pièges de `TRAPS.md` payés d'avance

| Piège | Ce que ce lot fait |
|---|---|
| une suite qui mute un artefact commité | rien de neuf n'écrit dans `layers/` ; `tests/tree-immuable.test.mjs` reste vert, deux passes d'affilée rendent le même verdict |
| une suite verte sur des artefacts périmés | la couche est **régénérée** et la suite compare la génération fraîche au fichier commité ; le garde des descriptions rougit **aussi** si le SRD bouge seul |
| une preuve qui cesse de prouver | tous les refus passent par une **privation délibérée** (SRD amputé d'un trait, d'une description, d'un motif ; couche truquée) — jamais par une pénurie de circonstance |
| un garde qui **compte** | `WHOLESALE_PATHS.length >= 3` était un compte : il **nomme** maintenant ses chemins. Les traits de l'Humain sont nommés, jamais comptés |
| un test qui mesure un trou sans passer par le garde | les mots survivants passent par `substitute` / `survivors` / `handWrittenDescriptions`, jamais par une regex qui imiterait leur verdict |
| une assertion relâchée au lieu d'être réécrite | trois assertions du lot 15 sont devenues fausses ; les trois sont **réécrites à la nouvelle vérité et marquées**, aucune supprimée |

## Une note de mécanique, pour le prochain

Le schéma se compile en **mode strict**. `{"required": ["changes"]}` seul dans
un `anyOf` y est refusé (`strictRequired` : la propriété doit être définie dans
le **même** objet de schéma), et un `$comment_xxx` inventé l'est aussi (mot-clef
inconnu). D'où les deux branches qui redéclarent leur propriété en schéma
booléen `true`. Ce n'est pas un tic de style, et c'est écrit dans le `$comment`
d'`opPatch` pour que personne ne le « nettoie ».
