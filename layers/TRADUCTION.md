# Le multilingue — une limite mesurée, pas un défaut à corriger

**Fait établi le 2026-08-08 par l'architecte (kickoff §L4), vérifié ici en
générant les deux couches : les deux langues du SRD n'ont aucune clé de
jointure.**

- Zéro identifiant commun sur les 339 sorts, 9 espèces et 17 dons vérifiés par
  l'architecte — et le même constat s'étend aux 14 genres transportés ici :
  chaque id porte sa langue (`srd:species:en:dragonborn` contre
  `srd:species:en:dragonborn`).
- Les slugs diffèrent (translittération, pas traduction mécanique).
- Aucun champ `translation_of` nulle part dans les exports fh-srd.
- L'appariement par rang dans le document échoue dès le deuxième élément : les
  deux catalogues sont triés alphabétiquement, chacun dans sa langue (*Elfe*
  tombe en face de *Dwarf*).
- Les clés de ressource de `class-progression` sont elles-mêmes
  langue-native : `srd:class-progression:en:wizard` porte `cantrips` /
  `prepared_spells`, `srd:class-progression:en:wizard` porte
  `sorts_mineurs` / `sorts_prepares` (`fh-srd/docs/RECORD-SHAPES.md`).

## Conséquence pour un personnage

Un personnage bâti sur la couche `srd-5.2.1-fr` ne peut pas être rouvert sur
la couche `srd-5.2.1-en` : ses références (`build.choices[].ref.id`,
`build.overrides[].path`) pointent vers des ids qui n'existent pas de l'autre
côté. **Ce n'est pas un défaut de ce lot** — c'est une propriété de la source,
constatée et acceptée le 2026-08-07 (« ouvrir l'option [multilingue], pas la
livrer »).

## Ce que ce lot fait, et ne fait pas

- `layers/srd-5.2.1-fr.layer.json` et `layers/srd-5.2.1-en.layer.json` restent
  **strictement autonomes**, chacune déclarant sa langue (`lang`) dans son
  manifeste de couche.
- **Aucune correspondance FR↔EN n'est inventée** ici — une correspondance
  devinée serait pire que l'absence de correspondance : elle donnerait
  silencieusement un personnage faux (kickoff §L4, point 5).

## Pistes pour le futur chantier d'appariement (hors périmètre de ce lot)

Une note de cadrage, pas un plan d'exécution :

1. **Rapprochement par données structurées d'abord.** Pour un sort : niveau +
   école + portée + composants + durée. Pour une espèce : taille + vitesse +
   traits comptables (bonus de caractéristique, résistances). Ces champs sont
   déjà dans `data` de chaque record et ne dépendent pas du texte.
2. **Arbitrage humain des ambiguïtés ensuite.** Le rapprochement structuré
   réduira l'espace mais ne le fermera pas seul (ex. deux sorts de même
   niveau/école/portée qui ne sont pas le même sort). Une liste de
   correspondances proposées, relue et signée par quelqu'un, avant tout usage
   en jeu.
3. **Le résultat est une COUCHE, pas une modification des couches SRD.** La
   correspondance produite (`translation_of` ou équivalent) vivrait dans son
   propre fichier, chargé en plus des deux couches SRD — jamais fusionnée
   dedans, pour ne pas transformer un export CC-BY vérifié en un artefact
   partiellement inventé.
