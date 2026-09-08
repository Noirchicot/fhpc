# À TRANCHER — les contradictions vivantes du corpus

> 🔴 **RIEN N'EST TRANCHÉ ICI.** Chaque entrée oppose **deux passages écrits tous les deux
> comme vrais**, qui servent tous les deux de base à un budget, à un garde ou à un écran.
> Les deux citations sont là avec leurs dates. ⚖️ **C'est Eric qui décide, personne d'autre.**
>
> 🔖 **LES ADRESSES ENTRE `dos d'âne` SONT DES ANCRES DU CORPUS** — cherchables telles quelles
> dans `NORMES.md`, `CADRES.md`, `SOCLE.md`, `ECRANS.md`. C'est l'adressage posé par le lot 161.
>
> 🗓 **Mesuré le 2026-09-02**, sauvé du tirage `fh-phb/docs/bible/a-trancher.md` le 2026-09-05
> avant sa suppression. ⚠️ Le corpus a bougé depuis : une contradiction peut avoir été résolue
> sans que cette page le sache — **vérifier les deux citations avant de trancher**.

---
## C1 — Où vit le `?` : en haut à droite, ou en bas à droite ? { #c1 }

**Question : Le `?` se pose-t-il en haut à droite de la dalle, ou en bas à droite dans la rangée de boutons ?**

- **CADRES.md § 2 quinquies, 2026-08-19** : *« le ? est sur la dalle tout à droite au même niveau que le titre »* (Eric), et *« il est posé par la coquille, une fois, sur toutes les étapes — jamais par un écran, qui pourrait l'oublier »*.
- **NORMES.md § 7, 2026-08-26** : *« place : en bas à droite, fixe »*, et *« il ENTRE DANS LA RANGÉE de boutons, collé à droite »*.
- Règles concernées : `cadre-question-en-haut-a-droite` · `aide-bas-a-droite` · `aide-entre-dans-la-rangee`
- ⚠️ Le corpus dit lui-même que les deux coexistent encore dans le code : *« le `?` vit encore au coin bas-droit d'une dalle (règle du 19/08), et cinq écrans sur dix n'ont aucune rangée »* (NORMES § LA PAIRE, lot G, 26/08). Trois positions écrites, aucune retirée.

## C2 — Le voile cumulé du jeton : 68 % ou 48 % ? { #c2 }

**Question : Le voile cumulé d'un jeton sur une dalle à 50 % vaut-il 68 % ou 48 % ?**

- **NORMES.md § 2, table des quatre organes du glisser, 26/08** : jeton = *« +20 % d'accent → **68 %** cumulés (sur une dalle à 50) »*.
- **NORMES.md § 4, 26/08** : *« Le jeton n'est sur aucun des trois barreaux : il ajoute 20 % d'accent à sa dalle (**48 %** cumulés). ⛔ 48 % n'est pas le barreau « 50 » — deux mécaniques différentes. »*
- Règles concernées : `jeton-habit`
- ⚠️ 50 + 20 ne donne ni 68 ni 48 par la même arithmétique ; les deux nombres sont écrits dans le même fichier, à la même date.
- 📐 **TRANCHÉE PAR LA MESURE (05/09) — les DEUX nombres sont faux.** `tokens.css:497` : `--jeton-teinte: color-mix(… var(--accent) 20%, transparent)`. Le jeton ne s'AJOUTE pas à un pourcentage, il se COMPOSE par-dessus : `1 − (1−0,50)(1−0,20) = 0,60`. Ni 68 ni 48 — **60**. ⛔ L'écrire dans le corpus serait réécrire le texte de deux règles : c'est à Eric.

## C3 — Un collecteur fait-il toujours la taille d'un jeton ? { #c3 }

**Question : Le collecteur d'Équipement à 44 est-il une exception argumentée qu'on garde, ou faut-il l'aligner sur les 48 du jeton ?**

- **NORMES.md § 1 ter bis, 2026-08-29** : Eric, *« règle universelle : un collecteur = un jeton en taille. **Ne varie jamais.** »* → 87 × 48.
- **NORMES.md § 2 ter, 2026-08-26** : *« le collecteur de l'Équipement (`.carte-r-collecteur`) garde sa hauteur `--touch` **44** et non `--glisse-h` 48 — un collecteur n'est pas un jeton qu'on glisse, c'est une cible qu'on VISE »*.
- Règles concernées : `collecteur-cote` · `collecteur-equipement-44`
- ⚠️ La règle du 29/08 est postérieure et se dit universelle ; l'exception du 26/08 n'est marquée ni retirée ni nommée comme exception argumentée.

## C4 — On mesure à 360 ou à 375 ? { #c4 }

**Question : Les deux gabarits calculés à 375 sont-ils à remesurer à 360, ou la cible de mesure admet-elle une exception ?**

- **NORMES.md § 1 quater, 26/08** : *« LA LARGEUR CIBLE — 360 px — ⛔ **pas 375**. »* · **§ 1 ter quater, 29/08** : *« Toute mesure de largeur se prend à 360. »*
- Mais les gabarits ratifiés sont mesurés à 375 : **§ 4 ter** *« mesurés à 375 × 553, iPhone SE »* · **§ 2 ter** *« mesuré à 375 × 553 »* · **CADRES § 3** *« 269 px mesuré à 375 »*, et la carte du rang R est dictée à **269 × 440** — une largeur de colonne qui vient d'un écran de 375.
- Règles concernées : `panneau-largeur-cible` · `panneau-compatibilite-360` — les deux disent « 360 » dans leur énoncé. ⛔ Aucune règle ne porte le camp « 375 » : il ne vit que dans les gabarits mesurés (NORMES § 4 ter, § 2 ter, CADRES § 3).
- Mentionnée en passant dans : `budget-gabarit-du-rang-b` · `budget-carte-r-est-un-dessin` — leur énoncé ne dit ni 360 ni 375 ; le 375 est dans les cotes qu'elles portent, pas dans ce qu'elles affirment.
- ⚠️ Le corpus dit lui-même *« Tout budget calculé sur 375 est faux : il donne du mou qui n'existe pas »*, et calcule pourtant deux gabarits sur 375.
- 📐 **NON TRANCHÉE PAR LA MESURE.** Les deux vivent dans le code : `360` sur 5 sites de `shell.css`, `375` sur 2 (`tokens.css`, `shell.css`). Le code ne départage pas — il porte les deux.

## C5 — Combien la rangée offre-t-elle à 360 : 278, 320 ou 344 ? { #c5 }

**Question : Quel nombre est la rangée utile à 360 : 278, 320 ou 344 — et lequel des trois budgets est faux ?**

- **§ 1 quater** : *« la rangée utile à 360 = **278** — moins deux gouttières de 8 »*.
- **§ 1 ter ter, 29/08** : *« À 360 la rangée offre **320**, et quatre cases pleines plus leurs gouttières en demandent 372. »* · **§ 1 ter bis** : *« le vivier faisait 277 px, la rangée **320** »*.
- **CADRES § 0 bis** : *« champ intérieur du pied … **344** (360 − 8 − 8) »*.
- Règles concernées : **aucune.** Les trois nombres ne sont l'énoncé d'aucune règle : 278, 320 et 344 vivent dans les *Valeur* et les *Pourquoi* des règles qui s'en servent. La contradiction reste entière — elle est dans le corpus, pas dans un énoncé.
- Mentionnée en passant dans : `panneau-largeur-cible` · `collecteur-quatre-par-ligne` · `cadre-pied-76` — elles énoncent la cible 360, le maximum de quatre par ligne et la hauteur du pied, pas la largeur utile de la rangée.
- 👀 Non alertée mais à regarder : `budget-trois-jetons-a-360` énonce *« la rangée dispose de 278 »* et ne porte aucune alerte. À Eric de dire si elle entre dans la dispute.
- ⚠️ Trois nombres pour la même largeur d'écran, chacun servant de base à un budget différent.
- 📐 **LA MESURE RETOURNE LA QUESTION.** Les TROIS nombres existent dans le code, à des endroits différents : `278` (shell.css ×3, tokens.css, fiche.css, equipement-pipeline.mjs) · `320` (shell.css ×2, class-step.mjs) · `344` (shell.css ×6, abilities-step.mjs). ⭐ Ce ne sont donc pas trois avis sur une même largeur, ce sont **trois grandeurs différentes** que la prose du corpus a confondues. Il faut lire les sites un par un, pas choisir un chiffre.

## C6 — Les chevrons : à gauche/droite, ou en haut/bas ? { #c6 }

**Question : Les chevrons vont-ils à gauche et à droite comme la norme le dit, ou faut-il inscrire la position haut/bas du code comme la règle ?**

- **NORMES.md § 6, 26/08** : *« place : à GAUCHE et à DROITE — ⛔ pas au-dessus »*, cible tactile 44, avec un compte dessous.
- **le code du 15/08, cité dans le même paragraphe** : `.stage-chevrons` est *« en haut et en bas (`position: absolute; inset: 0`, 36 × 14, non tactile) »*, décrit comme *« une amorce redondante avec le geste de défilement, pas un contrôle »*.
- Règles concernées : `chevron-gauche-et-droite` · `chevron-ecart-avec-le-code`
- ⚠️ Le corpus marque l'écart ⏳ *« à revérifier maintenant qu'il devient aussi un contrôle de pagination »* — mais les deux descriptions restent écrites comme normatives.
- 🗣 **ERIC A DÉJÀ RÉPONDU — LE 2026-09-03, ET JE L'AI REDEMANDÉ LE 06/09.** Sa phrase est dans
  NORMES § 4 quater ter : *« ces chevrons n'apparaissent que quand la boîte déborde, **ils sont dans
  la marge gauche** »* · *« entre le bloc et le bord de la dalle »*. Le corpus en tire la
  conséquence, mesurée : ⭐ **« LA GOUTTIÈRE EST DE LARGEUR NULLE »** — les chevrons débordent vers
  la gauche par une marge négative, dans les 16 blg du rembourrage, et **ne prennent aucune largeur
  au texte, ni présents ni absents**.
  ⛔ **CE QUI TOMBE AVEC** : l'objection des « 96 px » (2 × `--touch` + 2 × `--sp-4`, lot A, 26/08)
  ne s'applique plus — elle décrivait une pose *sur* la dalle, pas dans son rembourrage.
- ⚠️ **CE QUI RESTE, ET CE N'EST PLUS LA MÊME QUESTION.** La table du 26/08 écrit ⛔ *« pas dans la
  marge — il se pose SUR la dalle, au ras de son bord »*, quand la décision du 03/09 le met
  **dans** la marge. Le corpus dit lui-même *« un seul objet, deux rôles — ⛔ ne pas en fabriquer
  deux »*, donc les deux passages parlent bien du même organe. C'est une **borne** à poser, pas un
  arbitrage à demander.

## C7 — Le dropdown : la norme ou le code ? { #c7 }

**Question : Corrige-t-on le code du dropdown pour rejoindre la norme du 26/08, ou change-t-on la norme ?**

- **norme, 26/08** : liseré ⛔ aucun · fond transparence 20 % · caractères gras.
- **code aujourd'hui** : liseré 1 px, et `.pipeline-dropdown` porte *« `--ok`, une bordure VERTE conditionnelle, exactement le liseré vert supprimé »* · fond opaque (`--surface`, `--sunken`) · `font: inherit`.
- Règles concernées : `dropdown-habit` · `dropdown-ecart-avec-le-code`
- ⚠️ L'écart est déclaré, les trois corrections sont ⏳ *« à faire quand les organes seront refaits »* — sans date.
- 📐 **TRANCHÉE PAR LA MESURE (05/09) — il n'y a PLUS de contradiction.** Le code respecte déjà la norme du 26/08 : `border: 0` sur les quatre sites du dropdown, et `--dropdown-fond: color-mix(… var(--voile-dropdown) …)` avec `--voile-dropdown: 20%`. ⛔ Le liseré vert conditionnel décrit par le corpus **n'existe plus**. C'est la DESCRIPTION du code, dans le corpus, qui est périmée.

## C8 — Le corps du texte d'un bouton est-il tranché ? { #c8 }

**Question : T3 devient-il le corps déclaré de tous les boutons, ou reste-t-il réservé à la porte ?**

- **NORMES.md § 6, 26/08** : *« ⛔ **aucune taille de texte n'est déclarée pour un bouton** — `.species-done` porte `font: inherit`. Tant que le corps d'un bouton n'est pas nommé (T-quoi ?), les largeurs de `small` et `medium` ne sont pas calculables. ⏳ À trancher. »*
- **NORMES.md § 4 ter, 27/08** : *« la porte : 44 px de cible, corps **T3** — c'est un bouton »* · **§ registre des boutons** : *« bouton de PROPOSITION : octogone, **T3** »* · **§ 6** : *« T3 est le corps recommandé »*.
- Règles concernées : `bouton-corps-du-texte` · `bouton-gabarit-des-deux-lignes`
- Mentionnée en passant dans : `bouton-porte-a-deux-ages` — son énoncé décrit les deux âges d'une porte, il ne nomme aucun corps de texte.
- ⚠️ T3 est employé et ratifié pour la porte ; il reste écrit « à trancher » pour la famille des boutons.

## C9 — Le parcours a-t-il huit étapes ou dix ? { #c9 }

**Question : Le parcours compte-t-il huit étapes ou dix — et lequel des deux comptes faut-il corriger partout ?**

- **huit** : *« Elle vaut pour tout token et pour tout collecteur, sur les **huit** étapes »* (§ TAILLE STANDARD) · *« c'est un seuil, pas une étape du **parcours à 8 temps** »* (§ 1 quater) · *« les **huit** écrans rendent 352 dans 360 »* (§ 1 ter quater).
- **dix** : *« CEINTURE — **dix** étapes, toujours visible »* (CADRES § 3, croquis) · *« La ceinture des **dix** étapes n'est jamais couverte »* (CADRES § 0) · *« `.belt` et ses **dix** crans »* (SOCLE) · *« les **dix** écrans en héritent »*, *« elle est vide sur les **dix** écrans »*, *« cinq écrans sur dix »* (NORMES / CADRES).
- Règles concernées : **aucune.** Ni « huit » ni « dix » n'est l'énoncé d'une règle : les deux comptes ne paraissent que dans des arguments et des valeurs. La contradiction reste entière — c'est le corpus qui compte deux fois, aucune règle ne prend parti.
- Mentionnée en passant dans : `cadre-belt-toujours-visible` · `socle-ce-qui-ne-se-redessine-jamais` · `jeton-cote` — elles énoncent respectivement que la ceinture n'est jamais couverte, que cinq nœuds ne se redessinent pas, et qu'un jeton mesure 87 × 48 ; le compte des étapes est dans leur *Valeur* ou leur *Pourquoi*.
- 👀 Non alertée mais à regarder : `livre-rangee-encore-vide` énonce *« les dix écrans »* et *« cinq écrans sur dix »* et ne porte aucune alerte.
- ⚠️ Les deux comptes servent de base à des budgets et à des gardes.
- 📐 **TRANCHÉE PAR LA MESURE (05/09) — et les deux comptes sont VRAIS.** `etapes.mjs:32`, `STEPS` porte exactement **10** entrées : Menu · Identity · Species · Inheritance · Destiny · Class · Abilities · Skills · Equipment · Sheet. La ceinture a bien dix crans. Et `10 − Menu − Sheet = 8` : ce sont les huit qui portent des jetons et des collecteurs. ⭐ **Ce n'est pas une contradiction, c'est une collision de vocabulaire** — le mot « étape » sert à deux comptes. Même maladie que C12.

## C10 — La ceinture est-elle vraiment TOUJOURS visible ? { #c10 }

**Question : « La ceinture est toujours visible » reste-t-elle absolue, ou s'écrit-elle avec ses deux exceptions nommées (le FS et Entrée › R) ?**

- **CADRES.md § 0** : *« BELT IS ALWAYS VISIBLE »* · *« La ceinture des dix étapes n'est jamais couverte, **par aucun cadre**. »*
- **CADRES.md § 2** : *« **FS** — plein écran : ni belt ni menu, **ça recouvre tout** »*.
- **NORMES.md § 1 quater** : *« elle n'est PAS sur tous les écrans — ⛔ **Entrée › R n'en a pas** … 60 px récupérés »* · **§ 1 sexies** : le Seuil est un `FS`, *« ni ceinture ni menu latéral »*.
- Règles concernées : `cadre-belt-toujours-visible` · `budget-entree-r-sans-ceinture` · `cadre-seuil-est-un-fs`
- Mentionnée en passant dans : `cadre-fs-sortie-nommee` — son énoncé exige une sortie nommée ; que le FS recouvre la ceinture est dans son argument.
- ⚠️ La constante « au-dessus de tout » a au moins deux exceptions écrites, aucune n'étant nommée comme telle dans CADRES § 0.

## C11 — Le corps d'une fiche suit-il l'échelle de sa dalle ? { #c11 }

**Question : Le renversement de CADRES § 8 pour la carte du rang R s'écrit-il aussi dans CADRES, ou la carte R rentre-t-elle dans le rang ?**

- **CADRES.md § 8, 16/08** : *« LE TEXTE NE SE MET PAS À L'ÉCHELLE. Le corps vaut 16 px sur les deux écrans, parce que 16 px est une taille de LECTURE, pas un décor. »*
- **NORMES.md § 4 quater, 27/08** : *« CADRES.md §8 est **renversé pour cette carte seule** — la stabilité entre appareils prime, une carte-résumé se lit comme une image se regarde. §8 tient partout ailleurs. »*
- Règles concernées : `ecriture-corps-de-lecture-ne-se-met-pas-a-l-echelle` · `budget-carte-r-est-un-dessin`
- ⚠️ Le renversement est nommé et borné, mais CADRES § 8 ne le mentionne pas : un lot qui lit CADRES seul appliquera l'inverse.

## C12 — Y a-t-il UNE mesure ou TROIS ? { #c12 }

**Question : Le mot « mesure » désigne-t-il `--measure` seul, et faut-il alors un autre mot pour les trois largeurs max ?**

- **CADRES.md § 2, 19/08** : *« **UNE SEULE MESURE : `--measure` = 62ch.** Un `--measure-f` a vécu une heure avant d'être tué : deux noms pour une valeur, c'est la divergence garantie. »*
- **CADRES.md § 2 bis** : *« **IL N'Y A PAS UNE MESURE, IL Y EN A TROIS, ET C'EST VOULU** : une grille de compétences n'est pas un paragraphe. »* (`--card-w`, `--panel-w`, `--grid-w`)
- Règles concernées : `cadre-measure-unique` · `cadre-trois-largeurs`
- ⚠️ Les deux phrases sont dans le même fichier, à deux sections d'écart, et emploient le même mot « mesure » pour deux choses.
- 🗣 **ERIC, 2026-09-06 — LA QUESTION ÉTAIT MAL POSÉE, ET C'EST LUI QUI LE DIT.** *« `measure`
  c'est un terme de code que tu utilises, pas sûr qu'il y ait une règle là. La règle, c'est plutôt
  **la largeur maximale définie pour l'ensemble des dalles. En général 62ch**. Mais remettre ça
  entre les mains de l'archi pour décider de où ça se range est approprié. »*
  ⭐ **CE QUI EST TRANCHÉ** : la règle n'est pas un nom de jeton CSS, c'est *« la largeur maximale
  de l'ensemble des dalles, en général 62ch »*. ⛔ **CE QUI RESTE À L'ARCHI** : où cette règle se
  range, et sous quel mot. Le nom du jeton `--measure` est du code, pas une loi.

## C13 — 35 % et 50 % : qui porte quoi ? { #c13 }

**Question : Quel voile porte un écran de choix : les 35 % de CADRES, ou les 50 % de la norme de la dalle ?**

- **NORMES.md § 4, 26/08** : la **dalle** = **50 %** (*« c'est ça la norme du site »*) · **35 %** = *« le barreau des petits blocs INTÉRIEURS »*.
- **CADRES.md § 8, table du fond** : **35 %** = `--voile-simple` → *« verre léger — les choix, les gros affichages »* · **50 %** = `--voile-inter` → *« verre moyen — un peu de texte »*.
- Règles concernées : `cadre-voile-de-la-dalle` · `cadre-voile-des-blocs-interieurs`
- ⚠️ CADRES décrit 35 % comme le voile des écrans de choix, NORMES comme celui des blocs intérieurs.
- 📐 **⚠️ MON RELEVÉ DU 05/09 OPPOSAIT DEUX CHOSES QUI NE S'OPPOSENT PAS.** CADRES dit à quoi 35 % SERT (« verre léger — les choix »). NORMES §1788 dit qui l'EMPLOIE aujourd'hui, composant par composant, **et porte un ⏳** : *« le barreau des petits blocs INTÉRIEURS (mesuré : `ability-methodes`, `card-reveal`, …) »*. Une intention et un relevé d'usage ne se contredisent pas. ⛔ Corriger NORMES effacerait une mesure datée. `tokens.css:710` porte le commentaire de la feuille elle-même : `--voile-simple: 35%; /* verre léger — les choix, les gros affichages */`. C'est la description de CADRES, pas celle de NORMES (« le barreau des petits blocs intérieurs »). ⚠️ Réserve honnête : `--voile-simple` n'a qu'**un seul** usage dans `shell.css`, et `--voile-inter` aucun — la feuille tranche le mot, pas l'usage.

## C14 — `.decision-card` : dalle majeure opaque, ou cadre nu ? { #c14 }

**Question : `.decision-card` est-elle une dalle majeure opaque ou un cadre nu — et que reste-t-il alors à `data-bleed` pour effacer ?**

- **CADRES.md § 8 bis, 16/08** : *« Tout écran est rendu dans `.decision-card`, qui est une **dalle MAJEURE — donc opaque (`--surface`)**. »* C'est la prémisse de tout le raisonnement `data-bleed`.
- **NORMES.md § 1 quinquies bis, 26/08** : *« Le cadre d'écran ne porte NI FOND, NI LISERÉ, NI REMBOURRAGE »* — mesuré : fond transparent, liseré 0, rembourrage 0.
- Règles concernées : `cadre-data-bleed` · `cadre-cadre-d-ecran-nu`
- ⚠️ Si le cadre est nu partout, `data-bleed` n'a plus rien à effacer : le mécanisme reste écrit avec une prémisse renversée dix jours plus tard.

## C15 — La réserve du pied : 44, 52 ou 60 ? { #c15 }

**Question : La réserve du pied vaut-elle 44 partout, ou le 60 d'Identity est-il légitime tant qu'il est symétrique ?**

- **NORMES.md § 4** : *« Identity réservait **60 px** là où Destiny et Skills en réservent **52** (la grandeur étroite) »* — présenté comme un défaut.
- **NORMES.md § LA RÉSERVE EST SYMÉTRIQUE** : mesuré après correction, *« Identity **60/60** … Species, Inheritance, Class **44/44** »* — présenté comme correct, avec l'argument *« ce qui compte n'est pas le chiffre, c'est qu'il soit LE MÊME à gauche et à droite »*.
- Règles concernées : `bouton-reserve-symetrique` — seule règle dont l'énoncé porte la réserve. ⛔ L'autre camp (le 60 d'Identity présenté comme un défaut) ne vit que dans NORMES § 4.
- Mentionnée en passant dans : `cadre-regle-par-ressemblance-nomme-sa-source` — le 60 contre 52 y est l'EXEMPLE d'une règle écrite par ressemblance, pas son énoncé.
- ⚠️ Le 60 d'Identity est décrit comme une faute dans un paragraphe et comme la mesure juste dans l'autre. Le 52 (la « grandeur étroite ») n'existe plus depuis que `data-grandeur` a remplacé les `@media`.
- 📐 **NON MESURABLE PAR CE CHEMIN.** Aucun jeton `--pied` / `--reserve` / `--footer` dans `tokens.css`, et aucune déclaration `44/52/60px` de hauteur de pied dans `shell.css`. La réserve n'est pas une cote déclarée : elle se mesure au banc, sur l'écran, pas dans la feuille.

## C16 — `Done` fait-il avancer ? { #c16 }

**Question : `Done` remonte-t-il d'un cran, ou ne fait-il rien avancer du tout ?**

- **NORMES.md § LES TROIS VERBES, table** : *« **`Done`** — valide les choix de l'étape · ⛔ **il ne fait pas avancer** »*.
- **NORMES.md § 6, table des couleurs** et **§ LES TROIS VERBES, seconde table** : *« `done` : il **valide** ce qui est là, **puis remonte d'un cran** »* · *« il signe ce qui est là, puis remonte d'un cran »*.
- Règles concernées : `bouton-trois-verbes` · `bouton-done-signe`
- ⚠️ « Remonter d'un cran » est un mouvement ; la table qui l'interdit et celle qui le décrit sont à quelques lignes l'une de l'autre.
- 📐 **⛔ MON RELEVÉ DU 05/09 CONCLUAIT TROP VITE.** `pressDone()` finit bien par `goToStep(state.step + 1)` — mais la table que j'accusais n'est pas une description du code : c'est la glose de la phrase d'Eric du 26/08, *« Done valide les choix · I changed my mind les annule · Next : navigation »*. Elle dit ce que `Done` a pour RÔLE, pas ce que la fonction exécute. ⭐ Ce n'est donc pas une description périmée à corriger : c'est un **écart entre la règle et le code**, et c'est un lot d'écran, pas une correction de corpus. `shell.mjs`, `pressDone()` se termine par `goToStep(state.step + 1)`, en porte un second dans une branche, et fait `state.palier += 1` dans une troisième. ⛔ La table du corpus qui écrit « il ne fait pas avancer » décrit un code qui n'existe pas.

## C17 — La règle A du vivier : accident ou loi ? { #c17 }

**Question : Le vivier reste-t-il à trois colonnes toujours, ou une rangée peut-elle en mettre quatre quand elle le peut ?**

- **NORMES.md § 1 quater** : la loi A (*« la rangée en met autant qu'elle peut : 3 dès 277 · 4 dès 372 · 5 dès 467 »*) est **renversée** le 26/08 par *« trois colonnes, toujours »*.
- **NORMES.md § 5** : *« le « 3 par rangée » qu'on y observe est un **accident d'arithmétique**, pas une règle »*.
- **NORMES.md § 0 bis, six lois** : *« le reflux survit … une rangée qui passe de 4 cases à 3 ne change aucun rapport (loi du 19/08, « si on peut faire 4, on fait 4 ») »*.
- Règles concernées : `jeton-trois-colonnes-toujours` · `liste-trois-par-rangee-etait-un-accident` · `panneau-reflux-oui-redimensionnement-non`
- ⚠️ La loi du zoom cite en exemple positif (« si on peut faire 4, on fait 4 ») exactement le comportement que « trois colonnes, toujours » interdit au vivier.

## C18 — Un popup se touche-t-il ? { #c18 }

**Question : L'aiguilleur et le guide sont-ils deux organes distincts, ou un seul organe à deux états ?**

- **NORMES.md § 2** : *« deux d'entre eux ne se touchent pas : le voyant (non cliquable) et le popup (**il parle, on ne l'appuie pas**). ⛔ Ne pas leur donner l'apparence d'un contrôle. »*
- **NORMES.md § 7** : l'aiguilleur *« porte **deux boutons** »*, et les pastilles de navigation se touchent. Le corpus le dit lui-même : *« Un aiguilleur qui exige une réponse n'est pas la même forme qu'un aiguilleur qui prévient en passant. ⛔ **À Eric de dire si ce sont deux organes ou un seul.** »*
- Règles concernées : `popup-parle-on-ne-l-appuie-pas` · `popup-pile-et-pastilles` · `popup-aiguilleur-nom-et-critere`
- ⚠️ Contradiction explicitement laissée ouverte par le corpus.

## C19 — La gouttière est-elle 8 partout ? { #c19 }

**Question : Le `--sp-4` autour des chevrons est-il une exception admise, ou faut-il le ramener à la gouttière de 8 ?**

- **NORMES.md § 1 quater** : *« écart entre rangées : **8** — la gouttière, la même qu'en largeur »* · **CADRES § 2 bis** : marge = `--sp-8` / `--sp-16`.
- **CADRES.md § 2 et § 7** : l'écart d'une tuile est **4**, *« et c'est l'arithmétique de 360 qui l'a imposé »* · les chevrons emploient `--sp-4`.
- Règles concernées : `cadre-tuile-ecart-4` — seule règle dont l'énoncé porte un écart de 4. ⛔ La gouttière de 8 n'est l'énoncé d'aucune règle : elle vit dans NORMES § 1 quater et CADRES § 2 bis.
- Mentionnée en passant dans : `budget-table-des-hauteurs` · `chevron-cout-en-largeur` — l'écart de 8 et le `--sp-4` des chevrons sont dans leurs *Valeur*, pas dans leur énoncé.
- ⚠️ L'exception de la tuile est argumentée et mesurée ; celle de `--sp-4` autour des chevrons ne l'est nulle part.
- 📐 **⛔ MON RELEVÉ DU 05/09 ÉTAIT FAUX, ET LA CONTRADICTION TIENT.** J'avais écrit que les chevrons n'employaient aucun `--sp-4`. J'avais mesuré `--sp-8` sur `.stage-chevron:first-of-type { top: … }` — une **position VERTICALE** — alors que le corpus décrit une **gouttière HORIZONTALE** : `2 × --touch + 2 × --sp-4 = 96 px`, mesurée par le lot A le 26/08. ⚠️ La mesure était juste, le **point de comparaison** faux — « nommer le témoin avant de mesurer ». La question reste entière. Les chevrons n'emploient **aucun** `--sp-4` : `--sp-2` pour l'épaisseur du trait (`shell.css:730-731`), `--sp-8` pour la pose (`1189-1190`), `--sp-12` pour la taille. L'écart de 8 est respecté. C'est la règle qui décrit une faute **déjà réparée**.

## C20 — 440 : px ou blg ? { #c20 }

**Question : La cote 440 s'écrit-elle en px ou en blg — et CADRES doit-il être corrigé sur les deux tables ?**

- **CADRES.md § 2 et § 3** : *« hauteur `--fiche-h: **440 px**`, IMPOSÉE »*, et la table des objets écrit *« `--fiche-h` = 440 px »* pendant que la table des largeurs juste à côté est intitulée *« la cote, en **blg** »*.
- **NORMES.md § 4 quater, 30/08** : *« 269 × 440 en portrait … en **blg** »* · *« `height = 440 **blg**` »*.
- Règles concernées : `cadre-carte-hauteur-imposee` · `budget-carte-r-hauteur`
- ⚠️ La loi du zoom dit que *« les 265 valeurs en pixels du dépôt étaient déjà des blg »* — mais CADRES écrit encore « px » sur la cote la plus structurante du builder, et le mot « px » y désigne parfois un pixel réel mesuré au navigateur.

## C21 — Le budget du Seuil est-il une contrainte ? { #c21 }

**Question : Le budget d'Entrée › R (≈380) reste-t-il une contrainte dure, ou seule la ligne de flottaison compte-t-elle désormais ?**

- **NORMES.md § 1 quater** : *« Le budget de **Entrée › R** : ≈380 sur 553 — il reste 173. »*
- **NORMES.md § 1 sexies** : *« le budget du Seuil (≈380 px) **cesse d'être une contrainte dure** : il devient la hauteur du premier écran vu, pas celle de l'écran entier. ⏳ Ce qui doit tenir au-dessus de la ligne de flottaison n'est pas tranché. »*
- *(compté sur le fichier lui-même, pas à la main.)*
- | famille | règles | à trancher | renversées | en standby | statut marqué ⚠️ |
- |---|---|---|---|---|---|
- | `panneau` | 18 | 0 | 4 | 2 | 0 |
- | `cadre` | 50 | 4 | 3 | 0 | 3 |
- | `jeton` | 25 | 3 | 1 | 0 | 1 |
- | `collecteur` | 17 | 0 | 0 | 0 | 3 |
- | `bouton` | 44 | 2 | 1 | 0 | 2 |
- | `interrupteur` · `voyant` · `chevron` · `popup` · `aide` · `livre` · `dropdown` · `saisie` | 46 | 7 | 1 | 3 | 3 |
- | `liste` | 15 | 2 | 0 | 0 | 0 |
- | `ecriture` | 24 | 2 | 2 | 0 | 1 |
- | `geste` | 11 | 0 | 0 | 0 | 0 |
- | `budget` | 27 | 4 | 1 | 0 | 1 |
- | `socle` | 33 | 2 | 0 | 0 | 0 |
- | **TOTAL** | **310** | **26** | **13** | **5** | **14** |
- **Contradictions vivantes relevées : 22** (`C1` à `C22`), dont une (`C18`) explicitement laissée ouverte par le corpus lui-même. ⚠️ `C22` est la première qui ne vienne pas du corpus mais du **code et des commits**.
- > Les colonnes se recoupent : une entrée peut être ratifiée et porter un délai borné, et les
- > entrées marquées « renversé » gardent leur énoncé d'origine avec ce qui les remplace.
- > Les 14 statuts marqués d'un avertissement sont ceux qui pointent vers une contradiction `C*`.
- Règles concernées : `budget-entree-r`
- ⚠️ Le budget reste écrit comme une contrainte dans la section budget, et comme caduc dans la section du Seuil.

## C22 — Les `50` PO s'ajoutent au kit de classe, ou le remplacent ? { #c22 }

**Question : Le personnage reçoit-il le paquet de sa classe **plus** une bourse de `50` PO, ou doit-il choisir entre les deux ?**

- **Règle FH du 2026-08-13**, citée dans `equipment-step.mjs` : *« Le paquet de la CLASSE, plus une bourse de 50 PO. »* — et le même commentaire précise que le paquet de classe porte SON or (*« le Barbare option A : … and 15 GP »*) et que *« les deux s'ADDITIONNENT — aucune collision »*.
- **Eric, 2026-08-24** : *« la fenêtre doit lui dire qu'il a son équipement **ou** 50 po à débourser »* — câblé en aiguilleur **exclusif** (`kit` | `purse`), et la coquille écrit en toutes lettres « kit de classe OU 50 po ».
- Règles concernées : `equipement-depart-kit-ou-bourse`
- ⚠️ Le module porte **encore les deux lectures** : la règle additive dans son commentaire de tête, la règle exclusive dans son code. Aucune des deux n'a été retirée. ⛔ Cette contradiction ne vient pas du corpus des 310 — elle vient du code et des commits, et c'est la première de cette origine.
- ⚖️ **CLOSE, ET ÉLARGIE LE 2026-09-09 (lot 182)** — Eric : *« le kit ou les 50 gp peut marcher pour SRD et FH »*, *« fait idem SRD pour FH »*, *« harmonise ça »*. ⇒ **Chaque source de départ offre SON paquet OU SON or**, et prendre la bourse met les paquets de côté (la lecture exclusive du 08/09, appliquée à toutes les sources). Le commentaire additif a été retiré d'`equipment-step.mjs` avec le `50` qu'il expliquait. 📌 La règle vit désormais en un seul endroit, `ECRANS.md:equipement-depart-kit-ou-bourse`, et son MONTANT vit dans les couches — plus dans un écran.

## C23 — Quitter une étape non validée par le belt : silence, ou avertissement ? { #c23 }

**Question : quand le joueur quitte par le belt une étape dont il n'a pas cliqué `Done`, le laisse-t-on partir en silence, ou un gendarme l'avertit-il ?**

- **Eric, 2026-09-06, dans l'ordre où il l'a dit** : *« si il clique le belt pour aller ailleurs on laisse comme c'est »* · *« le gendarme lance un popup pour prévenir, mais ne bloque pas »* · *« le popup empêche une fois la sortie via le belt et c'est tout »* · puis, **la même minute** : *« ok on peut quitter une étape via le belt, pas de gendarme »*.
- **⚖️ TRANCHÉE POUR AUJOURD'HUI — pas de gendarme.** La dernière phrase fait loi : on quitte une étape par le belt sans être averti, comme avant. ⛔ **Rien n'a été écrit** : le comportement du belt est inchangé.
- Règles concernées : `voyant-belt-signature` · `bouton-done-puis-next`
- ⭐ **ET C'EST ERIC QUI A NOMMÉ LA VRAIE RAISON DE NE PAS LE FAIRE MAINTENANT** : *« on l'a pas fait ailleurs ? dans ce cas il faudrait le faire partout »*. Le gendarme de sortie n'est pas une affaire de Destiny — c'est **une loi transverse** sur toute étape qu'on quitte sans valider. La poser dans un seul écran en ferait une **exception de plus**, exactement ce que ce lot vient de défaire en faisant rentrer Destiny dans le rang du `Done`/`Next`.
- ⏳ **CE QUI RESTE À TRANCHER LE JOUR OÙ ON LE FERA**, et qui n'a aucune réponse aujourd'hui : le *« une fois »* se compte-t-il **par étape** (Skills redemandera après Destiny) ou **par session** (un seul avertissement dans toute la création) ? ⚠️ Question posée le 06/09, **restée sans réponse** — c'est elle qui bloquera, pas le mécanisme.

## C24 — Les deux familles grises et cliquables : bleues, ou vraiment désarmées ? { #c24 }

**Question : maintenant que « NON COLORÉ = NON CLIQUABLE » (Eric, 06/09), que deviennent les deux familles qui sont grises ET cliquables ?**

- **`shell.css:7630` — `.ability-entry`**, les quatre tuiles de méthode d'Abilities (`FH 3D6` · `4D6` · `ARRAY` · `FREE`). 📏 **Mesurées au banc sur page vierge** par le siège Abilities : elles rendent `#928c7f`, portent `aria-pressed="false"`, et sont **parfaitement cliquables** — c'est même **le seul geste de l'écran**. Seule celle qu'on vient de choisir passe au bleu `#5f90c7`.
- **`shell.css:7922` — `.pipeline-bouton`, `.dressing-bouton`, `.carte-r-bouton`, `.pipeline-ligne-envoi`, `.pipeline-pas`, `.aiguilleur-bouton`** (chapitre Équipement). Le commentaire juste au-dessus **déclare** le gris comme un état légitime : *« l'ÉTAT par `--bouton-fond` selon les trois verbes ratifiés — naviguer (bleu) · valider (vert) · défaire (rouge) · **MUET (GRIS DÉFAUT)** »*.
- Règles concernées : `bouton-gris-non-cliquable` · `bouton-done-gris-inacheve` · `bouton-trois-verbes`
- ⚠️ **ET IL Y A UN PIÈGE DE MÉMOIRE, DATÉ** : Eric croyait ces tuiles bleues (*« les 4 boutons du R sont bleus »*). **Elles ne le sont pas.** Sa mémoire disait la loi ; le code disait autre chose. ⭐ C'est exactement *« un fichier ne dit jamais s'il est un défaut ou une décision »* — sauf qu'ici c'est le souvenir qui portait la loi, et le code qui portait l'écart.
- 🔴 **LES DEUX RÉPONSES POSSIBLES, ET ELLES NE COÛTENT PAS PAREIL** :
  - **bleues** — elles naviguent (choisir une méthode ouvre une scène), donc le bleu dit vrai. ⛔ Mais quatre tuiles bleues côte à côte, dont une seule est « choisie », affaiblit le signal du choix ; il faudra un second signe pour l'élue.
  - **vraiment désarmées** — le gris devient honnête, mais alors **l'écran n'a plus aucun geste** tant que rien ne les arme. ⛔ Impossible pour `.ability-entry` : c'est le seul geste de la page.
- ⚖️ **DIRECTION DONNÉE PAR ERIC LE 06/09**, relayée par le siège Abilities : *« le bleu c'est de la navigation — c'est cohérent non ? »*. ⭐ **Oui, et ça règle la moitié de C24** : les quatre tuiles passent au **bleu**, parce que la teinte se lit à ce que le bouton **PROMET**, et elles promettent d'ouvrir une page. ⚠️ **Formulé comme une question, pas comme un ordre** — un mot d'Eric le ferme définitivement.
- 🔴 **MAIS LA SECONDE MOITIÉ N'EST PAS TRANCHÉE, ET ELLE EST PLUS GRAVE QUE LA COULEUR.** 📏 Mesuré par le siège Abilities, **vérifié par l'architecte** à `shell.mjs:620-642` : le clic de tuile a **deux comportements**, et un seul est de la navigation.
  - **la tuile DÉJÀ choisie** (`memeMethode`) → il ne se passe **rien** hors le palier. Navigation pure. ✅
  - **toute AUTRE tuile** → `abilities.mode` est écrit au document **et le lot en cours est JETÉ**. Le code le dit lui-même : *« seul un CHANGEMENT de méthode jette le lot, et c'est légitime : un lot de dés n'a aucun sens dans une autre méthode »*.
- ⛔ **DONC TROIS DES QUATRE TUILES DÉTRUISENT DU TRAVAIL, ET CE NE SONT JAMAIS LES MÊMES.** Un joueur qui a posé six dés en `FREE` et qui touche `ARRAY` perd ses six poses. §6 range ce geste chez **`Cancel`** (*« il abandonne ou efface du travail fait »*), pas chez `Back` — et le bleu ne le dit pas.
- ⚠️ **Et le coût n'est pas le même partout** : sur les deux méthodes à dés le lot se re-tire **en un geste** ; en `FREE` et en `ARRAY` ce sont des **poses à la main** qu'on perd.
- 🔴 **CE QUI RESTE À TRANCHER — trois formes, aucune n'est à un siège de choisir** :
  ① **le gendarme** (§6) parle au moment du changement, **si un lot existe** ;
  ② **rien**, et on assume ;
  ③ le bleu pour la tuile courante, **une autre teinte pour les trois autres** — ⛔ *déconseillé par Abilities, et l'argument est juste* : ça peindrait **la DESTINATION** en couleur de danger alors que **le danger est dans le DÉPART**.
- ⭐ **ET ÇA DISSOUT L'OBJECTION DE L'ARCHITECTE** (*« quatre tuiles bleues affaiblissent le signal du choix »*) : **l'élue n'a pas besoin d'une couleur à elle — elle est la seule dont le clic ne détruit rien.** La distinction existe **déjà dans le comportement** ; il reste à la rendre visible.
- ⚖️⚖️ **TRANCHÉ LE 06/09 À 04:1x PAR LE SIÈGE ARCHI, SUR DÉLÉGATION D'ERIC** — *« je m'en fous des boutons »*, relayé par Abilities. ⛔ La délégation porte sur **la couleur**, pas sur la protection du travail du joueur : les deux sont donc traitées séparément.
  - **① LA COULEUR → BLEU**, pour les quatre tuiles **et** pour la famille Équipement partout où le bouton est cliquable. La teinte se lit à ce que le bouton **PROMET**, et ils promettent d'agir. ⛔ Plus aucun gris sous un bouton qu'on peut appuyer (📍 `bouton-gris-non-cliquable`).
  - **② L'AVERTISSEMENT → LE GENDARME, ET SEULEMENT SI UN LOT EXISTE.** ⭐ **Ce n'est PAS une décision neuve : c'est la loi de §6 appliquée.** Elle dit déjà, en toutes lettres : *« `Cancel` — **DÉFAIRE** — il **détruit** du travail fait — 🔴 rouge **+ popup** »*. Le changement de méthode **détruit du travail fait** ; il doit donc le popup. ⛔ Rien à trancher : c'était écrit, personne ne l'avait rapproché du geste.
  - ⛔ **CE QU'ON NE FAIT PAS** : la forme ③ *(une autre teinte pour les trois autres tuiles)*. Elle peindrait **la destination** en couleur de danger alors que **le danger est dans le départ** — l'argument est du siège Abilities, et il est juste.
  - ⚠️ **LA BORNE « SI UN LOT EXISTE » N'EST PAS UN CONFORT, C'EST LA CONDITION DE VÉRITÉ DU GENDARME.** Un popup qui annonce une perte qui n'aura pas lieu apprend au joueur à le fermer sans lire — et le jour où la perte est réelle, il le ferme aussi.
- 📌 **Le garde peut donc être posé, mais APRÈS ①.** *« Aucun bouton gris n'est cliquable, aucun bouton cliquable n'est gris »* rougirait aujourd'hui sur ces deux familles. Le poser avant la décision, c'est livrer une suite rouge ; l'assouplir pour qu'il passe, c'est écrire un garde creux — le dépôt en a déjà hébergé un **seize jours**.

## C25 — Le bilan d'Identity perd son livre après le `Done` { #c25 }

**Question : pourquoi `Identity` porte sa trilogie complète en R1 et la perd en R2 (le bilan), et est-ce voulu ?**

- 📏 **Relevé écran par écran le 2026-09-06 à 14:31** par le siège BOUTONS, sur un personnage-témoin avec une classe choisie. Douze rangées inspectées ; **cinq n'ont pas de livre**.
- ✅ **ET L'EXCEPTION DU MENU EST TOMBÉE LE 08/09** : 📏 mesuré sur `origin/main` `a251d47`, `universe-step.mjs` porte **`fiche-livre`** et une rangée `tdc-pied`. ⭐ **`rangee-trilogie-due-partout` est donc tenue par le Menu aussi** — un des cinq écrans sans livre du relevé du 06/09 n'en fait plus partie.
- ⚖️ **QUATRE SONT CLOSES PAR ERIC LE 06/09** : *« Sheet et Équipement, Skills et Menu **sont à reconstruire**, donc on peut les laisser tranquille pour le moment »* — réparer le pied d'un écran qu'on va démonter, c'est payer deux fois.
- 🔴 **⛔ ET CETTE CONSIGNE NE VISE QUE L'HABILLAGE — PRÉCISÉ LE 2026-09-08, PARCE QU'ELLE ALLAIT BLOQUER UN LOT.** Eric, le 08/09 : *« j'ai besoin de voir un builder fonctionnel. Donc **de finir le chapitre Équipement**. Ensuite Menu. Ensuite Sheet. »*

  | | ce que la consigne vise | ce qu'elle autorise |
  |---|---|---|
  | **06/09** | l'**HABILLAGE** — le pied, le livre manquant, le gris des bascules | ⛔ ne pas repeindre un écran qu'on va démonter |
  | **08/09** | la **FONCTION** — *finir* Équipement, puis Menu, puis Sheet | ✅ **construire est demandé**, dans cet ordre |

  ⛔ **Écrite sans cette précision, la ligne du 06/09 se lit « on n'y touche pas » et un siège qui ouvre Équipement REFUSE de travailler** — et il aurait raison, sur le texte. ⭐ *Même famille que le `SB2` recousu la veille : **un texte qui n'a pas bougé peut cesser d'être vrai parce que ce qu'il vise a changé.***
  📌 ⚖️ **`NORMES.md:socle-on-laisse-tranquille-ce-qui-marche` ne bloquait PAS**, contrairement à ce qu'on m'annonçait : sa phrase porte déjà *« …ou **un mot d'Eric** »*, et Eric a parlé le 08/09. **La clause d'exception était écrite ; c'est `C25` qui n'en avait aucune.**
- 📏 **ET LE BLOCAGE RÉEL D'ÉQUIPEMENT EST AILLEURS — mesuré le 08/09 dans `layers/srd-5.2.1-en.layer.json`** :

  | | `cost_gp` | `weight_lb` | typé À CÔTÉ, sur les mêmes records |
  |---|---:|---:|---|
  | `gear` · `armor` · `weapon` *(133)* | **0** | **0** | ✅ `ac_base` **13** · `damage_dice` **38** |

  ⭐ **L'EXTRACTEUR SAIT DÉJÀ DÉRIVER UN CHAMP TYPÉ DEPUIS SA PROSE VOISINE** — `armor_class: "14 + Dex modifier (max 2)"` coexiste avec `ac_base: 14` — ⛔ **mais jamais pour le prix ni le poids**, qui existent sur les 133 en prose seule *(`"cost"` **168** occurrences, `"weight"` **158**)*.
  🔴 **CE N'EST DONC PAS UN TROU DE CONTENU** : `socle-ecran-ne-peut-pas-rendre-contenu-qui-n-est-pas-ecrit` **ne s'applique pas** — la donnée EST écrite. C'est **un champ non extrait**, et c'est un lot de couche, pas d'écran.
  📌 **Et l'ordre d'Eric a une raison mesurée, pas un goût** : *« la v2 du Player Companion va utiliser la section Équipement et une partie de Skills »* — Équipement passe devant parce que **le Companion en dépend**.
- 🔴 **LA CINQUIÈME N'EST PAS DANS SA LISTE, ET ELLE EST D'UNE AUTRE NATURE** : `Identity` porte **livre · majeurs · `?`** en **R1**, et **perd son livre en R2** *(le bilan, après le `Done`)*. Ce n'est pas un écran à reconstruire : c'est **le même écran** qui a l'organe avant et ne l'a plus après.
- Règles concernées : `bouton-deux-largeurs` · `vocabulaire-r-de-depart-r-d-arrivee` · §6 pré *(la trilogie dans une cellule, cadrage g/centre/d)*
- ⭐ **ET LA CAUSE EST PROBABLEMENT STRUCTURELLE, PAS LOCALE** : le `?` est posé **par la coquille**, une fois, pour tous les écrans ; le **livre est fabriqué par SEPT écrans différents** (`abilities-step` · `catalogue` · `concept-step` · `destiny-step` · `parcours-ecrans` ×2). ⛔ Un organe que chaque écran doit se rappeler de poser **sera oublié par ceux qui l'oublient** — et `NORMES` le dit déjà, pour le `?` : *« il est posé par la coquille, une fois, sur toutes les étapes — **jamais par un écran, qui pourrait l'oublier** »*. **La règle existait ; elle n'avait jamais été appliquée au livre.**
- ⚖️⚖️ **TRANCHÉ PAR ERIC LE 06/09, ET C'EST DEVENU UNE LOI, PAS UN CAS** : *« **ils doivent tous avoir la trilogie.** Mais c'est les autres qu'on passe à la moulinette. Si un autre agent doit faire le travail de la coquille, après, on fait ça. »*
  ⭐ **La question n'était donc pas « le bilan d'Identity mérite-t-il un livre ? » mais « la trilogie est-elle due ? ».** Réponse : **oui, à tous**. ⛔ Un écran sans livre est un défaut, plus une exception à justifier — et la charge de la preuve change de camp.
  📌 **L'ORDRE EST FIXÉ, ET IL COMPTE** : ⑴ les quatre écrans à reconstruire passent *« à la moulinette »* **quand on les reconstruira**, pas avant ; ⑵ **le travail de coquille** *(la coquille pose le livre comme elle pose le `?`, l'écran ne déclarant que sa destination)* est **validé sur le principe** et **remis à APRÈS** — c'est un lot à part, il touche `shell.mjs` sur sept écrans et ⛔ deux sièges écrivent dans la feuille en ce moment.
  ⚠️ **CE QUI RESTE OUVERT EST DONC UNE SEULE CHOSE, ET C'EST UN CONTENU, PAS UNE STRUCTURE** : quelle destination le livre du **bilan d'Identity** ouvre-t-il ? La trilogie lui est due ; le chapitre qu'elle pointe n'est pas nommé.
- ⏳ *(historique — l'état de la question avant qu'Eric ne la referme)* **CE QUI RESTAIT À TRANCHER** : ⑴ le bilan d'Identity **doit-il** un livre, ou n'a-t-il légitimement rien à ouvrir ? ⑵ si oui, on le pose à la main *(un écran réparé, six qui peuvent encore oublier)* ou **la coquille pose le livre comme elle pose le `?`**, l'écran ne déclarant que **sa destination** — le motif *« l'item déclare un hôte et reçoit la paire de la coquille »* existe déjà. 📌 `shell.mjs:4407` sait **déjà** placer un livre à gauche ; il ne sait pas le créer.

## C26 — Le chantier du MENU, et tout ce qui l'attend { #c26 }

**Question : le Menu est à reconstruire — que doit porter sa reconstruction, et dans quel ordre ?**

- 🔴 **CE N'EST PAS UNE QUESTION OUVERTE, C'EST UNE LISTE QUI GROSSIT.** Eric a reporté **quatre** chantiers vers le Menu dans la seule journée du 06/09, chacun pour la même raison : *« réparer le pied d'un écran qu'on va démonter, c'est payer deux fois »*. ⛔ Cette entrée existe pour qu'aucun ne se perde d'ici là — **un report non écrit est un abandon.**
- 🔴 **CETTE ENTRÉE PART DU MAUVAIS ENDROIT, ET C'EST CORRIGÉ LE 2026-09-08.** Elle décrit les **sept sections existantes** et se demande quoi en faire. ⛔ Or **le Menu a déjà été DICTÉ** : `FH-WEB/FHPC/FHPCv2 arborescence d'entree.md` *(Eric, 26/08, 159 lignes — vérifié)* — `R — MENU` *(langue · unités · **My characters** · **New character** · **DM**)* → `B3 — DM` *(**Campagnes** · **Connecteur : Foundry · AboveVTT · Other** · **Homebrew**)* → `SSB1 — une campagne` *(nom · langue · unités · joueurs · système · data)*. *« On commence par le haut. »*
  - ⚠️ **La dictée n'a jamais été portée**, et le Menu construit depuis ne la connaît pas. ⭐ **C'est le piège du TIRAGE, appliqué à une spec** : *une entrée d'À-TRANCHER bâtie sur l'existant décrit ce qui EST, pas ce qui a été DÉCIDÉ* — et elle fait discuter la reconstruction d'un écran dont le plan est déjà tranché depuis le 26/08.
  - ➡️ **La reconstruction part donc de la dictée, pas de la liste ci-dessous.** Ce qui suit reste utile comme **inventaire de ce qu'il faudra reloger**, ⛔ jamais comme plan.
- 📏 **L'ÉTAT, mesuré le 06/09** : `universe-step.mjs` fait **608 lignes** et le Menu porte **sept sections** — `Rules` · `Background` · `Interface size` · `Sheet language & units` · `Tutorials` · `Double view` · `This character`. Eric, le même jour : *« le Menu est un vrai bordel en scroll, on aura du rangement à faire à un moment »*.
- ⏳ **CE QUI ATTEND LA RECONSTRUCTION** *(rien de tout ceci n'est commencé)* :
  | | ce qui attend | pourquoi c'est là |
  |---|---|---|
  | ① | **la trilogie** — le Menu n'a **pas de livre** | `rangee-trilogie-due-partout` : report, ⛔ **pas dispense** |
  | ② | **le vert / rouge sur les DEUX organes on/off** — voir le détail ci-dessous | Eric le 06/09 à 03:2x, puis *« c'est surtout dans le menu, qui devra être refait un jour — chantier à part »*, puis *« les boutons on/off passeront en rouge vert aussi »* |
  | ③ | **un bouton de déblocage** *(efface les cinq préférences et recharge)* | ⚠️ **et il ne doit PAS vivre là** — voir l'avertissement ci-dessous |
  | ④ | **`My characters`** — la liste des personnages | 🟡 **`B1` existe, l'organe est vivant** *(mesuré le 08/09 : 3 occurrences dans `universe-step.mjs`)* ; la LISTE attend le préfixe de clef que `memoire.mjs` annonce depuis le 20/08. ⛔ Il n'a **jamais** été « bloqué par la sauvegarde » — c'était le fait faux corrigé le 06/09 |
  | ⑤ | **le rangement du scroll lui-même** | sept sections, aucune hiérarchie déclarée |
- 🔴 **LE DÉTAIL DE ② — ET CE SONT DEUX ORGANES, PAS UN.** ⚠️ Eric dit *« les boutons on/off passeront en rouge vert **aussi** »* : le mot **aussi** élargit sa consigne du 06/09 03:2x, qui ne visait que le premier. 📏 Mesurés dans `shell.css` le 06/09 :
  | l'organe | ce qu'il est | ce qu'il rend aujourd'hui | ce qu'il doit rendre |
  |---|---|---|---|
  | **`.bascule-ligne`** *(l'INTERRUPTEUR)* | une **piste 44 × 24** + un **pouce 18 × 18** qui glisse — `SRD` / `SRD + FH`, langue, unités | pouce **à gauche** `--text-muted` · **à droite** `--text`. ⛔ **aucune couleur** | pouce **à gauche → `--critical`** · **à droite → `--positive`** *(Eric, 03:2x : « le cercle à gauche = rouge, à droite = vert »)* |
  | **`.universe-bascule`** *(le BOUTON on/off)* | un **mot dans une boîte**, 72 × 44 — `On` / `Off` des tutoriels | ⭐ **il porte DÉJÀ `--positive`** quand il est actif, mais **en liseré seulement** (`box-shadow: inset 0 0 0 1px var(--positive)`) | à trancher : le **liseré** passe-t-il en fond, et l'inactif prend-il `--critical` ? |
  ⭐ **ET LE SECOND EST À MOITIÉ FAIT** : `.universe-bascule[data-actif="true"]` porte déjà le vert. ⛔ Ce n'est donc pas « peindre », c'est **finir** — et la question devient *« le rouge de l'inactif, en liseré comme le vert, ou en fond ? »*. ⚠️ Non tranché.
- ⛔ **L'AVERTISSEMENT QUI VAUT POUR ③, ET QUI EST UN PRINCIPE** : **un organe de secours ne vit pas dans ce qu'il répare.** Un bouton « débloquer » posé dans le Menu est inatteignable le jour où c'est le Menu qui bloque. Sa mécanique doit vivre **ailleurs** (une entrée d'URL, atteignable même écran figé) ; le bouton du Menu ne fait alors que l'appeler, et il peut disparaître à la reconstruction **sans emporter la fonction**.
  - ⚖️ **CE PRINCIPE N'A PAS ÉTÉ VIOLÉ PAR `v592`, ET LA SUITE RESTE DUE — précisé le 06/09.** `v592` a posé `Forget this character` **dans le Menu**, ce qui se lit comme une violation. Ce n'en est pas une : le principe vise *« le jour où c'est le MENU qui bloque »*, et la panne réparée est **l'autre** — la fiche dérivée qui ne se reconstruit plus. Le Menu est justement **le seul écran qui survit à celle-là** *(il ne lit pas la fiche dérivée ; vérifié en production, bouton pressé, cinq écrans revenus)*.
  - ⛔ **Mais ce bouton ne couvre pas un Menu cassé**, et il disparaîtra à la reconstruction. La mécanique doit vivre ailleurs — une entrée d'URL atteignable écran figé — le bouton n'étant qu'un appel. ⭐ *La moitié livrée débloque aujourd'hui ; elle ne tient pas demain.* Relayé par ARCHI 32 depuis `Agent Menu`.
- ⭐ **ET ④ N'EST PAS UN PROBLÈME DE MENU DU TOUT** — mais ce n'est pas celui qu'on croyait. Eric a tranché la voie : *« B — dans un fichier que je range où je veux »*, avec un **sélecteur de rangement** et un **rangement par défaut** si aucune zone n'est choisie.
  - 🔴 **CE QUI ÉTAIT ÉCRIT ICI EST INEXACT, ET CORRIGÉ LE 2026-09-06.** Ce paragraphe affirmait *« 📏 Mesuré le 06/09 : le personnage n'est sauvegardé nulle part — il vit en mémoire et meurt à chaque rechargement »*. 📏 **Vérifié dans le code par le siège Bible** : `ui/builder/memoire.mjs` exporte `lirePersonnage` et `ecrirePersonnage` sur la clef `fhpc.personnage`, et le personnage **survit au rechargement** *(26 654 octets relevés en production le 06/09 au soir par `Agent Menu`)*.
  - ⭐ **CE QUI MANQUE N'EST PAS LA SAUVEGARDE, C'EST L'ENTRÉE — et ce n'est pas la même dette.** 📏 `grep` sur tout `ui/`, le 06/09 : `FileReader` **0** · `type="file"` **0** · `showOpenFilePicker` **0** · `DataTransfer` **0** ; `fichier.mjs` n'exporte que `telecharger` et `ouvrirOnglet`. **Le builder sait écrire des octets, rien ne sait les relire.** ⇒ ④ attend une **entrée de fichier**, pas un moteur de sauvegarde.
  - 📌 **ET LA VOIE EST TRACÉE DANS LE CODE DEPUIS LE 20/08** : `memoire.mjs` porte sa propre suite — *« le jour où il y aura un écran pour choisir un personnage, cette clef deviendra un PRÉFIXE, et ce fichier sera le seul à changer »*.
  - ⚠️ **DEUX LEÇONS, ET LA SECONDE EST LA PLUS CHÈRE.** ⑴ Ce fait faux **portait le mot « mesuré »** — et c'est ce mot qui l'a fait recopier sans qu'on le rouvre. ⛔ *Le mot « mesuré » ne se prête pas : un fait qui le porte voyage comme une mesure.* ⑵ Il **contredisait déjà le corpus** : `ECRANS.md › menu-dit-la-sauvegarde` (20/08) cite Eric disant *« un perso est enregistré dans le navigateur de tout le monde »*. Les deux passages ont cohabité **dix-sept jours** sans que rien ne les rapproche — c'est exactement l'angle mort que `corpus-ancres.test.mjs` déclare : *il juge que le dispositif d'adressage tient, pas que deux règles s'accordent.*
  - ✅ **LA LIGNE « À VÉRIFIER SUR L'iPAD » EST CLOSE — vérifié par Eric lui-même le 06/09 : il est sur Chrome iOS.** Or sur iOS tout navigateur est **WebKit** sous le capot : **pas de File System Access** non plus. Sur son appareil principal, *« je range où je veux »* passe donc par **l'app Fichiers** (téléchargement + partage), et ça lui va. ⇒ **Le sélecteur de dossier est un bonus de bureau, jamais un socle** — c'est le dégradé que ce paragraphe réclamait, et il est tranché.


## C27 — Comment le groupe de personnages parvient-il au MJ ? { #c27 }

**Question : par quel chemin les personnages d'une table arrivent-ils chez le MJ, et sous quelle forme ?**

- 🔴 **OUVERTE PAR ERIC LE 2026-09-06 À 23:43, ET REMISE PAR LUI À PLUS TARD.** *« on devra à un moment décider comment on fait porter le groupe de persos au MJ »*, puis *« pas encore le sujet aujourd'hui »*. ⛔ **Rien n'est à concevoir ici** : cette entrée existe parce qu'*un report non écrit est un abandon* (§C26), et pour aucune autre raison.
- 📏 **LES DEUX SEULS FAITS MESURÉS QU'ON Y ATTACHE** *(ni proposition, ni route)* :
  | | le fait | ce qu'il dit |
  |---|---|---|
  | **le builder ne parle à rien** | `ui/builder/` : **0** `WebSocket` · **0** `navigator.share` · **0** `XMLHttpRequest` | il sait écrire un fichier, il ne sait l'envoyer nulle part |
  | **un modèle d'appartenance existe déjà ailleurs** | `~/tools/fh-worker` tient les **codes de campagne** (`campaign-index`) | ils servent déjà au dock, pour la table et les jets |
- ⚠️ **ET LA TENSION À NOTER, PARCE QU'ELLE VIENT D'ÊTRE CRÉÉE LE MÊME SOIR** : `socle-chacun-est-proprietaire-de-ses-donnees` dit que les données du personnage appartiennent **au joueur**. Un exemplaire chez le MJ est donc **une copie** — à qui appartient-elle, et que devient-elle quand le joueur modifie son personnage ? ⛔ **Aucune réponse ici** : c'est précisément ce qu'Eric a demandé de laisser mûrir (*« on reste à l'état de règle »*), et une réponse écrite maintenant durcirait le concept avant l'heure.
- 📌 Relayée par ARCHI 32. ⛔ Rien à faire : **une ligne à garder, pas un chantier.**

## C28 — ⏳ OUVERTE — combien de corpus, et où vivent les lois du produit ? { #c28 }

> 🔴 **CETTE ENTRÉE A ÉTÉ ÉCRITE `✅ TRANCHÉE` LE 08/09, PUIS ROUVERTE LE MÊME JOUR. C'est ma faute,
> et elle est nommée** : j'ai gravé *« Eric a tranché : quatre Bibles »* sur un relais **de seconde
> main**, sans une parole citée. ⛔ Une heure plus tard, la source se corrigeait : *« il n'a pas
> encore tranché »*. La règle qui en sort est `SOCLE.md:socle-un-arbitrage-ne-se-relaie-pas-de-seconde-main`.
>
> **LES DEUX POSITIONS, ET AUCUNE N'EST D'ERIC :**
>
> | | ce qu'elle dit | son argument |
> |---|---|---|
> | **quatre corpus** *(rapporté comme un mot d'Eric, non cité)* | Builder · Companion · Web · **Produit** — *« une trop grosse Bible »* si l'on fond tout | chaque produit a son lecteur, et le positionnement *« est une Bible en lui-même »* |
> | **un seul corpus + un document** *(un siège, argumenté auprès d'Eric)* | ⛔ *« quatre Bibles est une **symétrie**, pas un besoin »* | le Companion partagerait **7 732 lignes de lois** avec le builder et n'aurait besoin que d'une **section** dans `ECRANS` ; la carte du produit est **un document**, pas un corpus |
>
> ⭐ **CE QUI REND LA QUESTION DÉCIDABLE, ET C'EST LE MÊME CRITÈRE QUE J'AI EMPLOYÉ POUR REFUSER LES
> CINQ LOIS DE PRODUIT** : *un corpus se justifie par ce qu'il EMPÊCHE, pas par la symétrie du
> rangement.* ➡️ **Une règle qui régit un organe entre au corpus de cet organe ; une règle qui
> n'en régit aucun n'a pas besoin d'un corpus, elle a besoin d'un LIEU.** Combien de lieux, et
> lesquels, appartient à Eric.
> ⚠️ **Et le coût d'attendre ne bouge pas** : les **cinq** lois non gravées restent **inopposables à
> tout lot** — la parole du MJ bat le JSON · jamais de preuve d'achat · BYO-AI · guidé/expert ·
> SOWLREACH est gratuit. Le tableau ci-dessous dit lesquelles sont déjà au corpus et pourquoi.



> ✅ **ERIC A RÉPONDU LE 2026-09-08.** ⛔ Pas une Bible SOWLREACH unique — *« je crains que ça fasse une trop grosse Bible »* — mais **quatre** : **Builder** *(celle-ci)* · **Companion** *(n'existe pas encore, naîtra avec la V2)* · **Web** *(le livre)* · **Produit** — *« l'orientation, le positionnement du produit est une Bible en elle-même »*.
> ➡️ **La question posée ci-dessous a donc sa réponse : un LIEU, pas le logbook.** Sa matière est le document `SOWLREACH — Le produit et le premier chemin` *(§8 porte les dix arbitrages)*.
> ⏳ **Ce qui reste, et ce n'est pas tranché** : *quand* la Bible du Produit se construit, et *qui* la tient. ⛔ Un chantier, pas un lot — et pas une décision de siège.
> ⚠️ **Jusque-là, les cinq lois non gravées restent inopposables** : la parole du MJ bat le JSON · jamais de preuve d'achat · BYO-AI · guidé/expert · SOWLREACH est gratuit. Le tableau ci-dessous dit lesquelles.



**Question : où vivent les lois qui régissent le produit — ni un organe du builder, ni une page du livre ?**

- 🔴 **LE FAIT, MESURÉ LE 2026-09-08.** Eric a nommé ses deux produits : **SOWLREACH** *(builder + Player Companion, bâti sur le SRD mais **agnostique**, **gratuit**, et il le reste)* et **FATE'S HAND** *(son monde — FH Web et les couches sur le SRD de SOWLREACH — **c'est ce qui se monétise**)*. ⛔ **Le corpus du builder ne nomme ni l'un ni l'autre** : `grep -i sowlreach` rend **zéro** dans les quatre fichiers.
- 📏 **ET LE COMPTE EST PIRE QU'ANNONCÉ.** Le document `7.CLAUDE AND ERIC LOGBOOK/D&D — Tech & Outils/SOWLREACH — Le produit et le premier chemin.md` porte **dix lois datées**. On m'annonçait *« quatre que tu as déjà »* ; 📏 **mesuré sur les 401 phrases normatives vivantes, il y en avait DEUX** — la propriété des données et le SRD intact.

  | # | la loi d'Eric | au corpus, le 08/09 |
  |---|---|---|
  | 1 | chacun est propriétaire de ses données | ✅ `socle-chacun-est-proprietaire-de-ses-donnees` |
  | 2 | aucun serveur mondial, aucune table ne paie un stockage | ⛔ absente → ✅ **posée ce jour** |
  | 3 | aucun login, aucun secret : le compte, c'est le coffre | ⛔ absente → ✅ **posée ce jour** |
  | 4 | **la parole du MJ bat le JSON** — tout champ éditable, toute règle débrayable | ⛔ **absente** |
  | 5 | le SRD reste intact ; SRFH habille, SRFH+ est Fate's Hand | ✅ `socle-qui-possede-quoi-cote-donnees-srd-srfh-srfh` |
  | 6 | ⛔ jamais de « preuve d'achat » ; l'éditeur émet le code, la plateforme prend une commission | ⛔ **absente** |
  | 7 | **BYO-AI** — jamais d'IA embarquée ; elle emploie les mêmes verbes que le joueur | ⛔ **absente** |
  | 8 | le builder a **deux expressions du même document** — guidé et expert, l'expert jamais obligatoire | ⛔ **absente** |
  | 9 | SOWLREACH est **gratuit** ; ce qui se vend, ce sont les extensions du monde | ⛔ **absente** |
  | 10 | un réglage montré et non câblé se lit comme tel ; un bon défaut se montre prévalidé | ⛔ absente → ✅ **posée ce jour** |

- ⭐ **CE QUE ÇA RÉVÈLE, ET C'EST LA QUESTION** : il y a **deux Bibles** — le **builder** *(les organes)* et le **livre** *(la voix publiée)*. **Il n'y en a aucune pour le PRODUIT.** Les lois d'Eric sur ce qu'il vend, ce qu'il n'héberge pas et ce qu'il n'embarquera jamais vivent dans **un fichier de logbook que personne n'ouvre avant d'écrire** — ⛔ exactement la configuration qui a coûté **six violations dans un seul chapitre** le 06/09, et qui a fait naître `socle-une-bible-se-demande-avant-de-rendre`.
- ⚠️ **TROIS DES DIX ONT ÉTÉ POSÉES ICI, ET SEULEMENT PARCE QU'ELLES COMMANDENT UN LOT DU BUILDER** : un écran qui ajouterait un login, un cache, ou un réglage muet les enfreindrait sans qu'aucun garde ne rougisse. ⛔ **Les cinq autres n'ont pas été gravées** : la loi 8 *(guidé / expert)* décrit une forme de produit qu'aucun écran ne porte encore ; les lois 4, 6, 7, 9 ne régissent aucun organe. **Les écrire ici serait ouvrir un corpus de produit de ma propre initiative** — c'est une décision d'Eric.
- ➡️ **LA QUESTION, EN UNE LIGNE** : *les lois du produit reçoivent-elles un lieu — une troisième Bible, ou un chapitre du corpus — ou restent-elles au logbook ?* ⛔ Tant qu'elle n'est pas tranchée, **cinq lois d'Eric ne sont opposables à aucun lot.**
- 📌 ⚠️ **Et le nom se grave mal** : Eric a corrigé un siège qui écrivait *« Soulseek »*. C'est **SOWLREACH**. Un nom de produit mal recopié se répand plus vite qu'il ne se corrige.

## C29 — Le geste majeur du tableau de commande est VERT et il NAVIGUE { #c29 }

**Question : `Build a character` garde-t-il son vert, ou rejoint-il le bleu des gestes qui naviguent ?**

- 📏 **LE FAIT, MESURÉ SUR `origin/main` `a251d47` (v604), et non rapporté** : `Build a character` porte `.tdc-majeur` → `background: var(--positive)`, **vert** ; et `universe-step.mjs` écrit lui-même *« LE GESTE MAJEUR — large, vert en relief. **Il NAVIGUE vers Identity.** »*
- ⛔ **CE QUE ÇA CONTREDIT** : `bouton-trois-verbes` *(26/08)* — *« `Back`/`Next` NAVIGUENT (bleu), `Done` VALIDE (vert), `Cancel` DÉFAIT (rouge) »* — et `bouton-definition-du-bleu` : *« bleu = mouvement non impactant : après ce clic, le document n'a pas changé »*. 📏 Le clic n'écrit rien au document : il ouvre les huit étapes.
- ⏳ **UN RELAIS L'ANNONCE COMME UN CHOIX D'ERIC DU 08/09 — ⛔ SANS CITER SES MOTS.** Il n'est donc **pas** gravé comme une décision *(`socle-un-arbitrage-ne-se-relaie-pas-de-seconde-main`)*. ⭐ **Les deux lectures se valent tant qu'il n'a pas parlé** :

  | | la lecture | ce qu'elle implique |
  |---|---|---|
  | **le vert est voulu** | `R` n'est **pas une étape** mais un **tableau de commande** : son geste majeur n'y navigue pas *entre* des écrans, il **ouvre le travail**. Le vert dirait *« c'est par ici qu'on commence »*, pas *« c'est validé »* | ⇒ **exception nommée**, à poser à côté de son argument *(la forme existe : « une exception se nomme »)* |
  | **le vert est un défaut** | la loi des trois verbes ne connaît pas d'exception, et un vert qui ne signe rien apprend au joueur que le vert ne veut rien dire | ⇒ le bouton passe **bleu**, comme tout ce qui navigue |

- 🔴 **⛔ AUCUN LOT NE REPEINT CE VERT EN BLEU AVANT SON MOT.** Si c'est son choix, « réparer » défait une décision ; si ce n'en est pas un, c'est à lui de le dire. ⭐ *Même traitement que les deux familles grises de `§C24`.*
- 📌 **Et le voisinage mérite d'être mesuré dans le même geste** : `Open` et `Save` portent `.tdc-vert`. `Save` **écrit** *(vert plausible)*, `Open` **lit** — ⏳ non tranché non plus, et il n'a pas été relayé.

