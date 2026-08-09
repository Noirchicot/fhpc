# Inventaire — Lot 26 (`26-verbe-clear`)

> Départ : `main` = `6afa930`, `npm test` → 530/530.
> Arrivée : `npm test` → 538/538 (8 tests neufs, aucun retiré).

## Ce qui manquait

`src/build/block.mjs:127`, `place()` est le seul chemin d'écriture de
`build.choices` et `build.overrides` : il **pose ou remplace**. `grep
"clear\|remove\|unset\|delete" src/build/` ne rendait rien. Un choix posé ou
un override du MJ ne pouvait plus être **retiré** — seulement remplacé.

## Le sixième verbe : `clear({path, kind})`

`kind` vaut `"choice"` ou `"override"` et NOMME la collection visée —
`build.choices` ou `build.overrides` — jamais les deux à l'aveugle. Rend
`{document, cleared:{path, kind, removed}}`.

## Les trois arbitrages

### 1. Un chemin absent : silence, refus, ou résultat nommé ?

**Résultat nommé.** `clear` ne jette pas quand rien ne correspond au chemin —
il rend `removed: false`. C'est le même choix que `place()` a déjà fait pour
`replaced` : le geste **NOMME** ce qu'il a fait plutôt que de toujours réussir
pareil en silence. Deux raisons ont pesé :

- **Qui appelle.** Une interface qui nettoie plusieurs chemins d'un coup, ou
  un MJ qui relève un override déjà relevé, n'a rien à se faire reprocher —
  jeter les forcerait à vérifier avant chaque appel ce que `clear` peut leur
  dire lui-même.
- **La loi §0.5** interdit le *repli silencieux* — un succès qui ne dit rien
  et cache un défaut. Ce n'est pas le cas ici : `removed: false` **dit**
  explicitement que rien n'a été trouvé. Le repli silencieux aurait été de
  toujours rendre la même forme de succès sans distinguer les deux cas.

Testé : `` `clear` sur un chemin ABSENT n'est pas un refus — `removed` le dit ``
(`tests/build-derive.test.mjs`).

### 2. Le nom du second paramètre

`kind`, valant `"choice"` ou `"override"` — repris tel quel de l'en-tête du
lot. Un chemin mal formé pour la collection visée jette, comme dans
`place()` : le garde est à l'entrée du geste, pas à la reconstruction.

⚠️ Collision de vocabulaire assumée : `kind` existe déjà ailleurs dans le
dépôt avec un sens différent (`layers.query({kind})` nomme un GENRE de
record — `species`, `spell`… ; `place()` range dans son propre champ `kind`
la FORME d'une entrée — `"ref"`, `"value"`, `"override"`). Ici `kind` nomme
la COLLECTION visée. Trois vocabulaires différents pour un même mot, mais
chacun est local à son verbe et le contexte de l'appel ne laisse pas de doute
— une quatrième forme (un nom neuf comme `target` ou `collection`) aurait
évité la collision, mais se serait éloignée du nom déjà écrit dans le lot,
pour un gain de clarté marginal.

### 3. `rebuild` ne suit pas `clear`

Symétrique de ses cinq voisins : `choose`, `set` et `override` ne
reconstruisent rien tout seuls, `clear` non plus. Testé explicitement en
vérifiant qu'aucune route n'est empruntée via `dispatch` (`clear` ne lit même
pas la pile).

## Ce que le retour NE fait PAS

`clear` rend `{document, cleared}` — une clef `cleared` unique, jamais
`choice` ou `override` selon la cible. `choose`/`set` partagent la clef
`choice` (les deux écrivent `build.choices`), `override` a la sienne — mais
leur charge utile est un ENTRY complet (`ref`/`value`/`by`…). Celle de
`clear` est un simple reçu (`path, kind, removed`), de forme différente :
réutiliser `choice`/`override` comme clef aurait laissé croire qu'on peut y
lire un `ref` ou une `value` qui n'existe pas. `cleared` est honnête sur ce
qu'il porte.

## Le catalogue MCP

`build.clear` est publié, entre `build.override` et `build.rebuild` dans
`src/mcp/tools.mjs` — même raisonnement que le contrat : *« un verbe publié
doit fonctionner, un verbe qui fonctionne et n'est pas publié est une porte
cachée »*. `inputSchema` exige `{path, kind}`, `kind` est une `enum` fermée
(`["choice", "override"]`).

Trois listes figées ailleurs dans le dépôt le nommaient déjà avant ce lot et
ont dû être mises à jour (sans quoi elles auraient rougi) :
- `tests/mcp-acceptance.test.mjs` — la liste exacte de `tools/list`.
- `tests/mcp-block.test.mjs` — la liste exacte des routes ET le compte de 9→10 outils.
- `tests/mcp-transport.test.mjs` — deux compteurs `tools.length` codés en dur (9→10).

## Les attaques

- **Le garde de chemin** (clause 6 du lot) : `check(path)` retiré de
  `unplace()`, `npm test` sur `build-derive.test.mjs` rougit exactement sur
  `` `clear` vérifie le chemin À L'ENTRÉE `` — et seulement lui. Restauré,
  `git status --short` confirme qu'aucune trace ne reste.
- **L'isolation des deux collections** : un choix et un override posés sur le
  **même** chemin littéral (`resolved.ac` — les deux grammaires l'acceptent),
  `clear(kind:"override")` ne retire que l'override.

## Ce qui n'a pas été touché

Comme demandé : ni `violations`, ni `derive.mjs`. Le diff touche
`src/build/block.mjs` (le verbe + son helper `unplace`), `src/mcp/tools.mjs`
(la publication), `contracts/build.md`, et les tests.

## Tests livrés

`tests/build-derive.test.mjs` (8 tests neufs) : retrait d'un choix, levée
d'un override, isolation des deux collections, chemin absent, `kind`
manquant/invalide, chemin mal formé, `rebuild` ne suit pas.
`tests/mcp-acceptance.test.mjs` (1 test neuf) : `build.clear` sur la ligne,
bout en bout, avec la garantie « aucun outil ne rend le document ».
