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
- ⚖️ **QUATRE SONT CLOSES PAR ERIC LE MÊME JOUR** : *« Sheet et Équipement, Skills et Menu **sont à reconstruire**, donc on peut les laisser tranquille pour le moment »*. ⛔ On n'y touche pas — réparer le pied d'un écran qu'on va démonter, c'est payer deux fois. *(Même raison que pour les interrupteurs du Menu, tranchée à 03:2x.)*
- 🔴 **LA CINQUIÈME N'EST PAS DANS SA LISTE, ET ELLE EST D'UNE AUTRE NATURE** : `Identity` porte **livre · majeurs · `?`** en **R1**, et **perd son livre en R2** *(le bilan, après le `Done`)*. Ce n'est pas un écran à reconstruire : c'est **le même écran** qui a l'organe avant et ne l'a plus après.
- Règles concernées : `bouton-deux-largeurs` · `vocabulaire-r-de-depart-r-d-arrivee` · §6 pré *(la trilogie dans une cellule, cadrage g/centre/d)*
- ⭐ **ET LA CAUSE EST PROBABLEMENT STRUCTURELLE, PAS LOCALE** : le `?` est posé **par la coquille**, une fois, pour tous les écrans ; le **livre est fabriqué par SEPT écrans différents** (`abilities-step` · `catalogue` · `concept-step` · `destiny-step` · `parcours-ecrans` ×2). ⛔ Un organe que chaque écran doit se rappeler de poser **sera oublié par ceux qui l'oublient** — et `NORMES` le dit déjà, pour le `?` : *« il est posé par la coquille, une fois, sur toutes les étapes — **jamais par un écran, qui pourrait l'oublier** »*. **La règle existait ; elle n'avait jamais été appliquée au livre.**
- ⏳ **CE QUI RESTE À TRANCHER, ET C'EST UN CHOIX D'ARCHITECTURE** : ⑴ le bilan d'Identity **doit-il** un livre, ou n'a-t-il légitimement rien à ouvrir ? ⑵ si oui, on le pose à la main *(un écran réparé, six qui peuvent encore oublier)* ou **la coquille pose le livre comme elle pose le `?`**, l'écran ne déclarant que **sa destination** — le motif *« l'item déclare un hôte et reçoit la paire de la coquille »* existe déjà. 📌 `shell.mjs:4407` sait **déjà** placer un livre à gauche ; il ne sait pas le créer.
