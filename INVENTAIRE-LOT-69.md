# Inventaire — lot 69 « desktop-look »

> Le builder a été refait base 360 (IV.4). Sur un écran d'ordinateur il
> rendait la base 360 étirée : ce lot construit la **grandeur Large de la
> bible §3 (≥ 1140 px)** — et rien d'autre. Deux fichiers CSS, un garde
> neuf, **zéro `.mjs` touché**.

**Tests : 1008 avant → 1018 après, EXIT=0** (`npm test > /tmp/t.txt 2>&1;
echo EXIT=$?` — jamais tuyauté). Les 10 nouveaux sont le garde de ce lot
(`tests/ui-grandeur-large.test.mjs` : 6 clauses + 4 attaques).

---

## 1. Les mesures de la commande, reproduites AVANT de toucher quoi que ce soit

| Mesure annoncée | Reproduite chez moi |
|---|---|
| 625 px de contenu dans le champ | **oui, exactement** : `1ch = 10,08 px`, donc `62ch = 624,8 px` ; carte mesurée à 625 px, `margin-left: 16` — collée à gauche, ~780 px de vide à droite à 1440 |
| Molette d'Abilities étranglée `382 > 310` | **oui, exactement** : `scrollWidth 382 / clientWidth 310` sur les rangées à deux annotations, `« 10 (DEX) »` et `« 8 (STR) »` hors champ |
| `--measure` = prose, `.abilities-step` plafonné dessus | oui — et **pire que la commande** : le mode « Choose yourself » a **20 options, 941 px dans 442** |
| Un seul `@media (max-width: 720px)` | oui, gardé (garde 5), non dupliqué |
| `.stage` « display: flex (lot 30) » *(commentaires du CSS)* | **non — `display: block` aujourd'hui.** Les commentaires historiques de `shell.css` (~l. 300-330) datent d'une structure disparue ; le correctif `min-width: 0` qu'ils justifient reste valable, mais leur raison ne l'est plus. Non réécrits (histoire du dépôt), signalé ici |

## 2. Ce que j'ai construit — le régime Large tient dans les jetons

**Le seuil 1140 n'existe qu'à UN endroit de tout `ui/builder/` : le
`@media (min-width: 1140px)` en fin de `tokens.css`.** `shell.css` consomme
des jetons et ne connaît pas le chiffre — la mécanique exacte de
`--bp-hint` pour 720. Un garde le mesure (clause 1 du nouveau test).

### tokens.css

- **Jetons de grandeur, valeurs de base = le comportement d'avant, à
  l'octet** : `--card-w`/`--panel-w` = `var(--measure)`, `--fiche-w`/
  `--frame-w` = `100%`, `--card-pad` = `sp-16`, `--wheel-wrap: nowrap`,
  `--wheel-mask` = l'amorce en fondu, `--gutter-frame` = `sp-12`,
  `--gutter-popup` = `sp-16`. (Le garde 6 fige ces bases : réparer le
  desktop en touchant une base ferait payer le téléphone, et rougir.)
- **Bloc Large** (après le bloc sombre — les gardes 38/59 découpent le
  fichier au `@media` sombre et lisent l'échelle de base AVANT lui ; l'ordre
  garde leurs mesures véridiques, clause 2) :
  `--t5: 20px` · `--t6: 28px` · `--card-w: 76ch` · `--panel-w: 88ch` ·
  `--grid-w: 76ch` · `--fiche-w: 88ch` · `--frame-w: 96ch` ·
  `--rail-w: 120px` · `--card-pad: sp-24` · `--wheel-wrap: wrap` ·
  `--wheel-mask: none` · gouttières `max(l'ancien remplissage, la moitié du
  surplus)`.

### shell.css (tout est no-op à 360, mesuré — §4)

| Règle | Ce qu'elle répare |
|---|---|
| `.decision-card` : `max-width: var(--card-w)` · `margin-inline: auto` · `padding: var(--card-pad)` | la dalle collée à gauche. Le bloc étroit existant (`margin: var(--sp-8)`) arrive APRÈS dans le fichier et écrase l'`auto` — à 360, rien ne bouge |
| `.decision-card:has(> .abilities-step)`, `…:has(> .equipment-step)` → `--card-w: var(--panel-w)` | **une rangée de caractéristique n'est pas de la prose** — ces deux écrans prennent la largeur de panneau. `:has()` est dans le plancher navigateur (la feuille exige déjà `color-mix()` et `100dvh`, plus récents) ; sans lui : carte générique, le défaut d'avant, pas une casse |
| `.abilities-step { max-width: var(--panel-w) }` — scindé de `.card-step` (Destiny, qui EST de la prose et garde `--measure`) | le plafond de prose sur un panneau de contrôles |
| `.ability-row .record-list` : `flex-wrap: var(--wheel-wrap)` · masque via `var(--wheel-mask)` | **la molette s'enroule en Large** : au doigt on balaie, à la souris rien ne disait qu'il y a du contenu à droite. Enroulée, toute liste tient quel que soit le nombre d'options — robuste aux 20 du mode « choose », et aux couches futures |
| barres de Skills/Equipment : `max-width: var(--grid-w)` + marges auto | `Reset` était à ~1400 px des compteurs, la loupe pareil — les barres suivent leur colonne, du même jeton qu'elle |
| `.command { padding: 0 var(--gutter-frame) }` | `Validate` au bord de la fenêtre → il encadre la colonne (B0.13 parle de défilement, pas d'alignement ; B0.9 tient : le trait pleine largeur, Show plan le coupe où qu'il soit) |
| `.catalogue-card { width: min(var(--fiche-w), 100%); margin-inline: auto }` + prose interne plafonnée à `--measure` | la dalle majeure de Class couvrait 1356 px pour ~500 de contenu — **le fond n'existait plus sur cet écran** (B0.23). En Large la fiche flotte à 88ch, l'ardoise respire des deux côtés |
| `.belt-track { justify-content: safe center }` | la ceinture se centre quand les dix étapes tiennent ; `safe` retombe sur l'alignement de départ dès qu'elle déborde (sans lui, la première étape serait coupée inatteignable) |
| scrollbar native des 3 molettes horizontales effacée (`scrollbar-width: none` + `::-webkit-scrollbar` à dimensions **nulles** — pas de `display: none`, garde 4) | une bande blanche pleine largeur se peignait sous la ceinture sur les plateformes à barres classiques — du chrome par-dessus des affordances déjà ratifiées (chevrons B0.2, amorce bible §4). ⛔ **celle de la fiche (.stage) reste** : seul indicateur de position desktop, et la question « sans barre, comment sait-on où on en est ? » est posée à Eric, sans réponse — pas tranchée en douce |
| `.popup` : côtés par `var(--gutter-popup)` | en absolu, des marges `auto` valent zéro (CSS 10.3.7) — la formule rend 16 px à l'étroit (boîte d'avant à l'octet : 16/328/16, mesuré popup ouvert) et centre sur la mesure en Large |
| `.plan-header, .plan-list` plafonnés à `--frame-w` — règle placée **après** `.plan-list` (son `margin: 0` shorthand aurait écrasé l'auto) | dix lignes étirées bord à bord avec « Close » au bout du monde |
| centrage interne des enveloppes d'écran (`margin-inline: auto`) | no-op sans mou ; les écrans-prose se posent au milieu de leur carte |

### La typo (§3ter — « c'est dans ton périmètre »)

**Seuls les deux barreaux d'AFFICHAGE montent en Large : T5 18→20,
T6 22→28.** T1–T4 sont des tailles de LECTURE et ne bougent pas (16 px se
lit pareil à 360 et à 1440) ; T7 = 44 non plus. Rapports croissants :
1,25 · 1,40 · 1,57 — le principe du conseiller (« le rapport doit s'ouvrir
en montant »), et le garde 5 du nouveau test le mesure sur l'échelle
recomposée.

⚖️ **Le fondement, à contrôler par l'architecte** : bible §1, ratifiée —
*« le même nom vaut une valeur différente selon la grandeur »* — et §3 qui
définit les grandeurs. **IV.1 (T1–T7 = 10…44) reste le barème de référence
de la base 360**, intact dans le bloc jour, mesuré là-bas par le garde des
sept barreaux. Si l'architecte lit IV.1 comme « une seule valeur à toutes
les largeurs », c'est **deux lignes à retirer** (`--t5`/`--t6` du bloc
Large) et rien d'autre ne bouge.

## 3. Les chiffres de sortie (fichiers réels, pas le prototype)

### 1440 × 900 — plus rien n'est coupé

| Mesure | Avant | Après |
|---|---|---|
| Carte d'Abilities | 625 px collée à gauche (~780 px de vide à droite) | **887 px, centrée — écart au centre : 0,0 px** |
| Molette standard array (6 rangées) | `scrollWidth 382 > clientWidth 310`, `« 10 (DEX) »` et `« 8 »` coupées | **6/6 rangées `scrollWidth == clientWidth` (556–576), dernière option `« 8 (STR) »` visible, une ligne par rangée, zéro défilement** |
| Mode « Choose yourself » | 20 options, `941 > 442`, ~11 valeurs invisibles | **20/20 visibles, enroulées sur 2 lignes, `cut: false`** |
| Cibles | — | **44 px minimum, mesuré sur chaque option** |
| `Reset` (Skills) / loupe (Equipment) | au bord de la fenêtre, ~1400 px du contenu | dans la colonne, à côté de ce qu'ils commandent |
| Fiche Class/Species | dalle de 1356 px, fond invisible | 887 px centrée, l'ardoise respire des deux côtés |
| Titres (`Wizard`, nom de Review) | 22 px, perdus dans le champ | **28 px rendus** (`--t6` Large) |
| « Calligrapher's Supplies » (Equipment) | `Remove` cassait à la ligne | tient sur sa ligne |

### 360 × 780 — rien n'a bougé

| Invariant | Mesuré |
|---|---|
| Carte | **344 px, x=8 — la géométrie d'avant le lot à l'octet** (le `min(…, calc(100% − 32px))` d'un premier essai la faisait passer à 328 : attrapé au navigateur, remplacé par `margin-inline: auto` que le bloc étroit écrase) |
| Échelle | `--t5: 18px`, `--t6: 22px` — la base IV.1 intacte |
| Molette d'Abilities | `nowrap`, amorce présente, défilable, options à 44 px |
| Popup (déclenché sur Arcana verrouillée) | 16 / 328 / 16 — la boîte d'avant |
| Fiche Class | pleine largeur, **hauteur 680 = champ 680 : la chaîne d'aimantation du lot 58 intacte** |
| Débordement horizontal | aucun (document et `.stage`) |
| Skills | barres fixes, dalles, 3 ronds 44 px, chevrons flottants — identique |

### Les captures

Prises et examinées au navigateur pendant la construction — 1440 × 900 :
Universe, Concept, Abilities (standard array annoté + choose), Skills,
Equipment, Class palier 1 et 2, Species, Destiny, Inheritance, Review,
Plan ; 360 × 780 : Abilities, Skills (avec popup), Class, Concept.
⚠️ Je n'ai pas de moyen d'exporter les pixels du panneau navigateur en
fichiers (Chrome headless plante sur cette machine — c'est déjà noté en
mémoire) : les chiffres ci-dessus sont la partie transférable. **Recette
pour rejouer** : `cd <worktree> && python3 -m http.server 8090`, ouvrir
`http://localhost:8090/ui/builder/`, fenêtre à 1440 × 900 puis 360 × 780.
`main` tourne sur 8080 pour comparer côte à côte.

## 4. Ce qui m'a surpris

1. **Le piège de résolution des custom properties.** `--gutter-card`
   déclarée sur `:root` avec `var(--card-w)` dedans : la substitution se
   fait sur `:root`, pas sur l'élément — l'override `:has()` de la carte
   était ignoré pour la marge (mesuré : max-width 887 et largeur 625 sur le
   même élément). D'où la règle écrite dans tokens.css : une formule de
   gouttière sur `:root` ne référence QUE des jetons globaux ; ce qui varie
   par élément passe par `max-width` + marges auto.
2. **`margin-inline: auto` coupe le `stretch` d'un enfant flex** : la fiche
   de Class s'est rétractée sur son contenu (~300 px, l'air d'un bout de
   papier). D'où `width: min(var(--fiche-w), 100%)` et pas `max-width`.
3. **`*/` dans un commentaire** : j'ai écrit « rgb*/hsl* » dans un
   commentaire de bloc du test — il ferme le commentaire, SyntaxError. Une
   faute d'inattention à 1 caractère, attrapée par la suite elle-même.
4. **La scrollbar blanche de la ceinture** : invisible sur macOS (barres en
   overlay), pleine largeur ailleurs — un défaut que personne n'avait vu
   parce que tout le monde regarde depuis un Mac ou un iPad.
5. **Le mode « choose » est pire que la mesure de la commande** : 941 px de
   contenu dans 442. C'est lui qui a tranché pour l'enroulement plutôt que
   pour un simple élargissement calibré sur 6 boutons : `wrap` est robuste
   à n'importe quel nombre d'options, y compris celles qu'une couche future
   ajoutera.

## 5. Vu, laissé — parce que c'est du JavaScript (ou un autre lot)

| Défaut | Pourquoi pas moi |
|---|---|
| **Les chevrons ‹ › de la ceinture restent affichés à 1440** alors que les dix étapes tiennent — deux contrôles morts | leur visibilité est écrite par `shell.mjs` (B0.3 ne couvre que les bouts de course) ; un état « pas de débordement » se détecte en JS |
| **Les chevrons flottants de la fiche** ne s'effacent pas après ~1 s sur desktop pareil que prévu mobile (B0.22b) — comportement minuteur | `mountChevrons` (socle.mjs), pas du CSS |
| **La barre de défilement de `.stage` visible sur desktop** — B0.20 la veut remplacée par les chevrons flottants, mais « sans barre, comment sait-on où on en est ? » est **posé à Eric, sans réponse** | décision d'Eric + JS ; je ne tranche pas en douce |
| **La molette de 20 valeurs à 360** reste un long ruban au doigt (une valeur visible) | c'est la refonte B5 de l'écran (dalles-boutons, rollers repliés), un lot d'écran |
| **Equipment à 360 : les rangées cassent en 2-3 lignes** (`Equipped/Stowed/Remove`) | B8.3 spécifie l'item en deux lignes avec `+`/👁 sur la hauteur — refonte de l'écran, balisage `.mjs` |
| Commentaires historiques de `shell.css` qui décrivent `.stage` en flex/grille d'une structure disparue | vrais en leur temps ; les réécrire n'est pas du desktop-look — à toiletter par qui touchera la structure |
| `tests/ui-jetons.test.mjs:388` — le commentaire « tokens.css n'a qu'un seul @media » est périmé (il y en a deux, le découpage reste correct et ses mesures justes — vérifié) | ⛔ mon périmètre interdit de modifier un test existant ; une ligne à ajuster par l'architecte |

## 6. Options pesées et écartées

- **Compétences en 2 colonnes en Large** : réel gain de densité (16 513 px
  de page), mais l'ordre de lecture zigzague en grille et le multicolonne
  fragmente des rangées interactives — écarté pour ce lot, notable pour un
  lot d'écran si Eric veut la densité.
- **Élargissement calibré sans enroulement** (panneau taillé pour 6 boutons
  annotés) : suffisant pour standard array, battu par les 20 options du
  mode « choose » et fragile aux contenus futurs.
- **`fit-content` sur la carte** : les champs de Concept ne remplissent pas
  leur ligne, la carte se rétracte — non.
