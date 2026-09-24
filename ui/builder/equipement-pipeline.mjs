/* ══ LE PIPELINE DE L'ÉQUIPEMENT — B1 · B2 · SB3.1 · SB3.2 · SB3.3 ═══════════
   Mandat d'Eric, 2026-08-24 : *« enchaîne R/B1/B2/B3/SB3.1/SB3.2/SB3.3 —
   SB3.3 je te laisse improviser. Inverse les positions de R et de B3. Fais le
   pipeline : les échanges à l'intérieur du personnage. Pas de groupe, pas de
   DM, pas de Craft, pas de Companions. »* Croquis zoomés IMG_6103-6108.

   ══ L'ARBORESCENCE, INVERSÉE ═══════════════════════════════════════════════
       B3 (le dressing)  ←  l'écran d'ENTRÉE de l'étape Équipement
        ├─ Equipment → R (le catalogue)     ├─ Send       → SB3.2
        │    ├─ tap sur un jeton → B1       ├─ Gear weight › Backpack → SB3.1
        │    ├─ CART → B2                   └─ Gear weight › Storage  → SB3.3
        │    └─ GEAR → retour B3                (⏳ SB3.3 improvisé : STORAGE)
        └─ Craft · Companions : dessinés, INERTES (le mandat les exclut)

   ══ OÙ VIT QUOI ════════════════════════════════════════════════════════════
   · une ligne possédée = `gear[N]` du DOCUMENT (ref · quantity · equipped ·
     location · boite) — mesuré AVANT de construire : les verbes acceptent
     `location`, zéro violation au rebuild. `location` ∈ self|backpack|storage.
   · le PANIER (pré-achat) = `cart[N]` DU DOCUMENT (décision d'Eric, 24/08) —
     *« SHOPPING LIST et CART sont la même chose vue de deux endroits »*
     (vault). Il survit au rechargement et suit le personnage, par la même
     sauvegarde que tout le reste.
   · le prix vient du RECORD (`data.cost`, une chaîne SRD « 25 GP ») ; l'écran
     le PARSE et le montre, il n'invente aucun tarif. La case prix de B1/B2
     est un TYPE IN (rose au croquis) : le joueur peut marchander à la main.

   ⛔ AUCUNE RÈGLE DE JEU : pas d'encombrance jugée, pas de plafond, pas de
   refus d'achat autre que « la bourse n'a pas assez » (une soustraction qui
   refuse de produire un négatif — l'écran le dit, il n'écrit rien). */

import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=810";
import { pageDeListe } from "./normes.mjs?v=810";

/* ══ LES COMPTES PAR PAGE DE CE CHAPITRE — DÉDUITS, PAS CHOISIS ══════════════
   NORMES §5 : 15 est le DÉFAUT des listes de jetons ; un écran qui dévie
   passe SON nombre en argument, DÉDUIT de son budget (§1 ter) — jamais un
   littéral recopié. 📏 MESURÉS GOOGLE HEADLESS le 26/08 (banc-parcours
   #mesureB2 · #mesureSB · #recherche, fenêtre 553 — la référence Safari de
   NORMES §1 quater), puis déduits :

     écran        rangée  chrome (haut+bas)   budget    N
     B2/SB3.2      54+4      50 + 203          ~290  →  5   (5×54+4×4 = 286)
     SB3.1/SB3.3   54+4     221 +  44          ~278  →  4   (4×54+3×4 = 228)
     Recherche     48+4     102 +  44          ~397  →  7   (7×48+6×4 = 360)

   ⛔ Si une rangée change de hauteur, ces trois nombres se REMESURENT — ils
   ne se discutent pas. */
export const B2_LIGNES = 5;
export const SACS_LIGNES = 4;
export const RECHERCHE_LIGNES = 7;

/* ── petites mains DOM, la langue du fichier voisin ── */
function elp(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}
function bouton(mot, classe, surClic, note) {
  const b = elp("button", classe, mot);
  b.type = "button";
  if (note) b.setAttribute("aria-label", note);
  b.addEventListener("click", surClic);
  return b;
}

/* ══ LA MONNAIE ══════════════════════════════════════════════════════════════
   QUATRE clefs (Eric : « pas d'electrum lol » — et le SRD n'en a jamais eu).
   `TAUX_EN_GP` sert UNIQUEMENT l'affichage « Total in GP » du croquis — les
   taux du SRD (1 pp = 10 gp · 1 gp = 10 sp · 1 sp = 10 cp), pas une règle
   maison. */
export const TAUX_EN_GP = { pp: 10, gp: 1, sp: 0.1, cp: 0.01 };

/* ══ LIRE UN NOMBRE DANS LA PROSE DU LIVRE ═══════════════════════════════════
   Le SRD écrit le prix et le poids EN TOUTES LETTRES — « 25 GP », « 1 lb. » ;
   en français « 25 po », « 0,5 kg ». Ces deux lecteurs en DÉRIVENT un nombre.
   ⛔ Ils ne réécrivent RIEN : `data.cost` et `data.weight` restent la chaîne du
   livre, intactes. Le SRD ne se réécrit jamais — on le lit.

   ⚠️ LES DEUX VIRGULES NE DISENT PAS LA MÊME CHOSE, et c'est le défaut qu'on
   répare : en anglais « 1,000 GP » la virgule sépare les MILLIERS, en français
   « 0,5 kg » elle sépare les DÉCIMALES. L'ancien `replace(/,/g, "")` global
   lisait donc « 0,5 kg » comme 5 kg. La règle est POSITIONNELLE : virgule (ou
   espace) suivie d'EXACTEMENT trois chiffres = milliers ; sinon = décimale.

   📏 MESURÉ sur les deux couches (158 records portent les deux champs) avant
   d'écrire une ligne. Les quatre formes qui cassaient l'ancien lecteur :
     « 1/2 lb. » → il rendait 2    (miroir, potion, sac : 4× trop lourds)
     « 1/4 lb. » → il rendait 4    (la fléchette : 16× trop lourde)
     « 58½ lb. » → il rendait null (le paquetage le plus lourd ne pesait rien)
     toute la couche FR → 0 prix lu sur 158, 0 poids lu sur 158
   ⭐ La couche FR a servi de SECONDE LECTURE, en sens inverse : « 1/2 lb. » y
   est « 250 g » et « 1/4 lb. » y est « 125 g » — l'édition française confirme
   0,5 et 0,25, et prouve que le 2 et le 4 de l'ancien lecteur étaient faux. */

const FRACTIONS = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 };

/** « 1 000 » · « 1,000 » · « 0,5 » · « 1/2 » · « 58½ » → un nombre, ou `null`
 *  si ce n'en est pas un. ⛔ Jamais 0 en cas de doute : `null` dit « je n'ai
 *  pas lu », 0 dirait « c'est gratuit / ça ne pèse rien » — deux faits opposés. */
function lisNombre(brut) {
  let s = String(brut).trim();
  s = s.replace(/(\d)[\s,](?=\d{3}(?!\d))/g, "$1");   /* les milliers s'effacent */
  s = s.replace(",", ".");                             /* ce qui reste est décimal */
  const colle = s.match(/^(\d*)\s*([½¼¾⅓⅔])$/);        /* « 58½ » */
  if (colle) return (colle[1] ? Number(colle[1]) : 0) + FRACTIONS[colle[2]];
  const frac = s.match(/^(\d+)\/(\d+)$/);              /* « 1/2 » */
  if (frac) return Number(frac[2]) === 0 ? null : Number(frac[1]) / Number(frac[2]);
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : null;
}

/* Les deux vocabulaires de pièces. 1 pp = 10 gp · 1 gp = 10 sp · 1 sp = 10 cp
   (donc 1 gp = 100 cp) — les taux du SRD, déjà nommés par `TAUX_EN_GP`.
   ⚠️ `cp` (copper) et `pc` (pièce de cuivre) sont le même mot à l'envers : la
   table les distingue par la LANGUE, jamais par un retournement de lettres. */
const PIECES = { gp: "gp", sp: "sp", cp: "cp", pp: "pp", po: "gp", pa: "sp", pc: "cp" };

/** « 25 GP » · « 2 sp » · « 1,500 GP » · « 1 000 po » → { pp, gp, sp, cp }.
 *  Une chaîne sans montant lisible (« — », « Varies », « Variable ») rend null :
 *  l'objet n'a PAS de prix connu, et l'écran doit le dire au lieu d'afficher 0
 *  (une absence n'est jamais 0).
 *  ⭐ LA LECTURE EST ANCRÉE (ancrée des deux bouts), et ce n'est pas de la coquetterie : dix
 *  `class-option` portent « 1 Sorcery Point » dans le MÊME champ `cost`. Une
 *  lecture non ancrée y attrapait un nombre et facturait un don de sorcier en
 *  or. Un point de Sorcellerie n'est pas une monnaie : il se REFUSE. */
export function parseCout(chaine) {
  if (typeof chaine !== "string") return null;
  const m = chaine.trim().match(/^(.+?)\s*(gp|sp|cp|pp|po|pa|pc)\.?(\s*\([^)]*\))?$/i);
  if (!m) return null;
  const montant = lisNombre(m[1]);
  if (montant === null) return null;
  const cout = { pp: 0, gp: 0, sp: 0, cp: 0 };
  cout[PIECES[m[2].toLowerCase()]] = montant;
  return cout;
}

/* Les unités de masse des deux éditions. ⚠️ Le gramme se RAMÈNE au kilo : la
   couche FR mélange « 1 kg » et « 250 g » sur la même page, et sommer 250 avec
   1 sans regarder l'unité donnerait un sac de 251. ⛔ En revanche la livre et
   le kilo ne se convertissent JAMAIS l'un dans l'autre ici : l'édition FR n'est
   pas une conversion mais un ARRONDI d'éditeur (« 2 lb. » y vaut « 1 kg », pas
   0,907), et convertir inventerait une précision que le livre ne donne pas. */
const MASSES = { lb: ["lb", 1], lbs: ["lb", 1], kg: ["kg", 1], g: ["kg", 0.001] };

/** « 1 lb. » · « 1/2 lb. » · « 58½ lb. » · « 5 lb. (full) » · « 0,5 kg » ·
 *  « 250 g » → { valeur, unite }, l'unité étant celle du LIVRE (`lb` ou `kg`).
 *  « — » et « Varies » rendent null : CE PARSEUR NE FAIT QUE LIRE. Ce qu'on en
 *  déduit est la règle de `poidsDeJeu`, juste en dessous — et les deux ne
 *  rendent pas la même chose, ce qui est voulu. */
export function parsePoids(chaine) {
  if (typeof chaine !== "string") return null;
  const m = chaine.trim().match(/^(.+?)\s*(lbs|lb|kg|g)\.?(\s*\([^)]*\))?$/i);
  if (!m) return null;
  const valeur = lisNombre(m[1]);
  if (valeur === null) return null;
  const [unite, facteur] = MASSES[m[2].toLowerCase()];
  return { valeur: valeur * facteur, unite };
}

/* ══ LE POIDS DE JEU — TROIS RÈGLES D'ERIC, 2026-09-23 ════════════════════
   ⚖️ Eric : *« arrondit les poids, le plancher est 0,1 lb, tout est arrondi au
   0,1 près »*, puis *« en français ce sera 50 g — notre système métrique permet
   d'avoir plus de fluidité, on aura des g et des kg »*, puis *« poids varies = 0
   jusqu'à ce qu'on l'ait édité »*, puis, du tiret : *« applique le 0,1 lb »*.

   🔴 LE PLANCHER EST NATIF DE CHAQUE SYSTÈME, ET CE N'EST PAS UNE CONVERSION.
   0,1 lb vaut 45,36 g — pas 50. Chaque édition porte le nombre ROND de sa
   propre unité, exactement comme `MASSES` l'impose déjà plus haut : *« la livre
   et le kilo ne se convertissent JAMAIS l'un dans l'autre ici »*. Convertir le
   plancher aurait rouvert la porte que ce commentaire ferme.

   ⛔ ET LE ZÉRO N'EST PAS LE PLANCHER — c'est toute la finesse de la règle.
     · « Varies » → 0, marque de ce qui N'A PAS ENCORE ÉTÉ ÉDITÉ (5 objets du
       livre : Ammunition, Arcane Focus, Druidic Focus, Holy Symbol, Musical
       Instrument). Il reste compté dans `inconnus` : 0 veut dire « à faire ».
     · « — » → LE PLANCHER (18 objets : Candle, Ink Pen, Paper, String, Signal
       Whistle, Vial, Sling, les deux Spell Scrolls…). Le livre ne dit pas
       « inconnu », il dit « négligeable » — et négligeable n'est pas zéro.
   Un objet pesé ne descend donc jamais sous le plancher, et un objet à éditer
   ne l'atteint jamais. Les deux se distinguent à l'œil, sur l'écran comme ici.

   ⚠️ CE QUI EST RENVERSÉ : ce fichier disait, jusqu'à aujourd'hui, *« "—" et
   "Varies" rendent null — ce sont des faits de la source, PAS des zéros »*.
   La règle d'Eric dit le contraire et c'est le propriétaire qui tranche. Le
   parseur, lui, n'a pas changé : il LIT toujours null. C'est la LECTURE qui a
   changé, et elle vit ici, à un endroit qu'on peut nommer.

   ⏳ LE PAS MÉTRIQUE N'EST PAS DICTÉ. Eric a donné le plancher (50 g) et les
   unités (g et kg, *« plus de fluidité »*), jamais un pas. On n'en invente pas :
   `PAS_ARRONDI.kg` vaut `null`, donc un kilo lu est gardé tel quel. ⛔ Poser
   50 g déplacerait `Dart` de 125 à 150 g — une valeur du livre, changée sans
   qu'on l'ait demandé. */
export const PLANCHER_POIDS = Object.freeze({ lb: 0.1, kg: 0.05 });
const PAS_ARRONDI = Object.freeze({ lb: 0.1, kg: null });

/** Arrondit au pas de l'unité, puis relève au plancher. Jamais sous le plancher. */
export function arrondiPoids(valeur, unite) {
  const pas = PAS_ARRONDI[unite];
  const arrondi = pas ? Math.round(valeur / pas) * pas : valeur;
  /* `toFixed` ferme la dérive binaire : 3 × 0,1 vaut 0,30000000000000004. */
  return Math.max(PLANCHER_POIDS[unite], Number(arrondi.toFixed(4)));
}

/** Le poids QU'ON PÈSE, par opposition au poids QU'ON LIT (`parsePoids`).
 *  `unite` est celle de la pile — le tiret et « Varies » n'en portent pas.
 *  → `{ valeur, unite, origine }`, `origine` ∈ `lu` · `plancher` · `a-editer`.
 *  → `null` si la chaîne n'est ni lisible, ni un tiret, ni un « Varies ». */
export function poidsDeJeu(chaine, unite = "lb") {
  const lu = parsePoids(chaine);
  if (lu) return { valeur: arrondiPoids(lu.valeur, lu.unite), unite: lu.unite, origine: "lu" };
  const brut = typeof chaine === "string" ? chaine.trim() : "";
  if (/^varies$/i.test(brut)) return { valeur: 0, unite, origine: "a-editer" };
  if (brut === "—" || brut === "-") return { valeur: PLANCHER_POIDS[unite], unite, origine: "plancher" };
  return null;
}

/* ══ CE QU'EST UNE RECETTE — ERIC, 2026-09-23 ═════════════════════════════
   ⚖️ *« on ne va plus partir des items de base, on partira des recettes déjà
   données dans magic items »* — une recette EST une entrée du catalogue, pas
   une composition. Et *« il faut mettre en évidence les tokens recettes
   (blueprints) »* : c'est cette fonction qui décide lesquels.

   ⛔ ELLE NE PORTE AUCUNE LISTE DE NOMS. Une liste par nom est incomplète dès
   qu'un record entre — c'est la leçon d'`item-value` (lot 93) et du « Set » de
   trop (20/08). Deux signaux de la DONNÉE, et rien d'autre :

     ① `category` vaut `weapon` ou `armor` → une arme ou une armure magique se
        fabrique à partir de sa base mondaine. 52 records.
     ② la RARETÉ porte le marqueur d'une FAMILLE — `Rarity Varies`, ou une
        énumération du genre « Rare (Silver or Brass), Very Rare (Bronze) ».
        ⭐ Le SRD écrit cela EXACTEMENT quand une entrée couvre plusieurs objets
        de raretés différentes : c'est un marqueur de la source, pas une
        devinette. 7 records de plus.

   ⚠️ ET UN FILTRE SUR LA PROSE NE MARCHE PAS — mesuré : il attrape `Staff of
   Fire` et `Wand of Fear`, qui portent des tables de SORTS, pas de variantes.
   La rareté, elle, ne se trompe pas.

   ⭐ ③ UN OBJET QUI CONTIENT D'AUTRES OBJETS — ERIC, 2026-09-23 : *« les kits
   d'aventuriers sont des blueprints aussi. Activation simple mais activation
   nécessaire »*. Un kit ne se fabrique pas, il se DÉFAIT — mais du point de vue
   du joueur le geste est le même : ce qu'il achète n'est pas ce qu'il obtient.

   🔧 ET CE SIGNAL A CHANGÉ DE PLACE LE SOIR MÊME, PARCE QUE LA DONNÉE A CHANGÉ.
   Au premier jet il lisait l'ÉTAGÈRE (`adventuring:packs`) — non par goût, mais
   par nécessité mesurée : les sept packs du SRD ne portaient QUE `cost`, `name`
   et `weight`, et rien dans leur record ne les distinguait d'un sac à dos.
   ⭐ Puis `contents` est monté en amont (`fh-srd`, les 64 éléments lus dans la
   prose p.96-99), et le garde qui épinglait « ce record ne porte que trois
   champs » est tombé — EXACTEMENT LA QUESTION QU'IL ÉTAIT ÉCRIT POUR POSER.
   ⛔ Lire l'étagère était un DÉTOUR, et un détour qu'on garde après la fin du
   travaux devient une seconde vérité : un pack redéplacé aurait perdu sa
   diagonale sans avoir changé de nature. Le signal vit donc où vit la RAISON —
   *cet objet en contient d'autres, il faut l'ouvrir*. */
export function estRecette(record) {
  const d = (record && record.data) || {};
  /* 🔴 LE SIGNAL DE LA CATÉGORIE EST TOMBÉ LE 2026-09-24 — Eric, devant Wares en
     ligne : *« les autres objets magiques ne sont pas des blueprints et sont
     censés avoir une valeur · les objets à blueprint sont certains wondrous, les
     scrolls, certaines armes et armures spécifiques »*.
     ⛔ LA LIGNE DISAIT `category === "weapon" || "armor"` → recette. Elle marquait
     donc TOUTE arme et TOUTE armure magique — 📏 48 objets sur 72 blueprints,
     `Defender`, `Vorpal Sword`, `Dragon Scale Mail`… — qui sont des objets FINIS,
     avec une valeur, et qu'on achète tels quels.
     ⭐ ET LA PREUVE QUE C'ÉTAIT CETTE LIGNE ET PAS LE PRINCIPE : sans elle, ce qui
     reste marqué est MOT POUR MOT la liste d'Eric — les six wondrous fourre-tout,
     `Spell Scroll`, `Weapon/Ammunition/Armor/Shield, +1, +2, or +3`, les sept
     kits et les quatre plans du Soulforging. Les signaux qui restent disent tous
     la même chose : CE QU'ON ACQUIERT N'EST PAS ENCORE L'OBJET. */
  if (Array.isArray(d.contents) && d.contents.length > 0) return true;
  /* ④ UN RECORD QUI SE DÉCLARE PLAN — les quatre du Soulforging (Eric, 24/09).
     ⛔ CE N'EST PAS UNE LISTE DE NOMS DÉGUISÉE : ces quatre records n'ont pas
     d'autre nature que celle-là. Un kit se reconnaît à son contenu et une arme
     magique à sa catégorie parce qu'ils sont AUSSI autre chose ; un plan n'est
     que ça, et le seul endroit où ça peut s'écrire est le record lui-même.
     ⭐ `blueprint.asks` porte ce que le formulaire demande — lu génériquement,
     ⛔ aucun `if` sur « Soulgem » nulle part. */
  if (d.blueprint && typeof d.blueprint === "object") return true;
  const rarete = typeof d.rarity === "string" ? d.rarity : "";
  if (/varies/i.test(rarete)) return true;
  /* une énumération de raretés : « Rare (…), Very Rare (…), or Legendary (…) ».
     ⛔ `(Requires Attunement)` n'en est pas une — il suit UNE rareté. */
  const parentheses = rarete.split("(").length - 1;
  return parentheses >= 2 && /\),\s|\)\s+or\s/.test(rarete);
}

/* ══ LA VALEUR D'UN OBJET — UN SEUL ORGANE, SEPT LECTEURS ══════════════════════
   ⚖️ Eric, 2026-09-24 : *« les autres objets magiques […] sont censés avoir une
   valeur, même si on n'arrive pas toujours à calculer le poids »*.
   🔴 ET LA PANNE AVAIT LA FORME DE CELLE DE LA DIAGONALE : SEPT lecteurs de
   `data.cost` dans `equipment-step.mjs`, chacun écrit à la main. Un objet magique
   du SRD ne porte pas de `cost`, donc les sept affichaient « — ». ⛔ En réparer un
   seul aurait laissé les six autres muets — le lot 256 a payé exactement ça.
   ⭐ Ils passent désormais tous par ICI.

   ⭐ LA RÈGLE EST CELLE DU SRD, À LA LETTRE — le record `srd:item-value` :
     · la valeur d'un objet magique est celle de sa RARETÉ ;
     · « if a magic item incorporates an item that has a purchase cost, ADD that
       item's cost » — `+1 Armor (Plate)` = 4 000 + 1 500 = 5 500.
   📏 MESURÉ SUR LES 48 ARMES ET ARMURES MAGIQUES : 48/48 ont une valeur lisible ;
   20 ont une base UNIQUE (`Dagger of Venom` → `Dagger`), donc un prix complet ET un
   poids ; 28 en admettent plusieurs (`Sword of Life Stealing` → six épées), donc
   la valeur de la rareté seule, et ⛔ AUCUN poids inventé.

   ⛔ ET UN PLAN N'A PAS DE PRIX DE CATALOGUE : c'est X5 qui le calcule, une fois
   la base et les pouvoirs choisis. Rendre ici la valeur de `Weapon, +1, +2, or +3`
   serait donner un prix à un objet qui n'existe pas encore.

   ⚠️ CE QUE L'ORGANE RENVOIE : des CHAÎNES au format du SRD (« 4,002 GP »,
   « 1 lb. »), pas des nombres. C'est délibéré — les sept lecteurs appellent déjà
   `parseCout` / `parsePoids` sur `data.cost` ; ils n'ont qu'à changer de SOURCE,
   jamais de format. Un organe qui change la forme en même temps que la source
   multiplie les endroits où l'on peut se tromper. */
export function fabriqueDeValeur(query) {
  const lire = (kind) => { try { return query({ kind }) || []; } catch { return []; } };
  const table = (lire("item-value")[0] || {}).record;
  const valeurs = new Map((((table && table.data) || {}).tiers || [])
    .filter((t) => t.priced && Number.isFinite(t.value_gp))
    .map((t) => [String(t.rarity_label).toLowerCase(), t.value_gp]));
  const bases = new Map([...lire("weapon"), ...lire("armor")]
    .map((v) => [v.record && v.record.data && v.record.data.name, v.record && v.record.data])
    .filter(([n]) => n));

  /** La base qu'un objet magique incorpore, SI ET SEULEMENT SI elle est unique. */
  function baseUnique(d) {
    const st = String(d.subtype || "").trim();
    if (!st || /^any\b/i.test(st)) return null;
    const cites = st.split(/,|\bor\b/).map((x) => x.trim()).filter(Boolean);
    return cites.length === 1 ? bases.get(cites[0]) || null : null;
  }

  return function valeurDe(record) {
    const d = (record && record.data) || {};
    /* ⭐ UN PRIX ÉCRIT GAGNE TOUJOURS : ce que le record porte, on le rend tel quel. */
    let cout = typeof d.cost === "string" && d.cost.trim() ? d.cost : null;
    let poids = typeof d.weight === "string" && d.weight.trim() ? d.weight : null;
    if (cout && poids) return { cout, poids };

    const base = baseUnique(d);
    if (!poids && base && typeof base.weight === "string") poids = base.weight;
    if (!cout && !estRecette(record)) {
      const rarete = String(d.rarity || "").split("(")[0].trim().toLowerCase();
      const v = valeurs.get(rarete);
      if (Number.isFinite(v)) {
        /* ⛔ `enGP`, PAS `.gp` : une base à « 1 SP » (Club, Sickle) vaudrait 0 si l'on
           ne lisait que les pièces d'or — et le prix serait faux sans un mot. */
        const plus = base ? enGP(parseCout(base.cost)) || 0 : 0;
        cout = `${(v + plus).toLocaleString("en-US")} GP`;
      }
    }
    return { cout, poids };
  };
}

export function formatCout(cout) {
  if (!cout) return "—";
  const morceaux = CURRENCY_KEYS.filter((k) => cout[k]).map((k) => `${cout[k]} ${k.toUpperCase()}`);
  return morceaux.length ? morceaux.join(" ") : "0 GP";
}

export function multiplieCout(cout, n) {
  if (!cout) return null;
  const r = {};
  for (const k of CURRENCY_KEYS) r[k] = (cout[k] || 0) * n;
  return r;
}

export function additionneCouts(couts) {
  const r = { pp: 0, gp: 0, sp: 0, cp: 0 };
  for (const c of couts) { if (c) for (const k of CURRENCY_KEYS) r[k] += c[k] || 0; }
  return r;
}

/** ⚖️ COMMENT UN ENCOMBREMENT SE DIT — ⛔ UN SEUL ÉCRIVAIN, et il est ici.
 *
 *  🔴 CE QUI L'A FAIT NAÎTRE — Eric, 2026-09-21 : *« rajoute l'unité d'encombrement »*. Le
 *  libellé vivait dans `equipment-step.mjs`, SANS unité, et son commentaire justifiait ce
 *  manque par *« elle est dite trois fois juste dessous »*. 📏 Relevé sur le site déployé : les
 *  trois lignes du dessous rendent `Gear 0`, `Backpack 0`, `Other 0` — **aucune ne la dit**.
 *  ⭐ UNE JUSTIFICATION QUI S'APPUIE SUR UN VOISIN MEURT QUAND LE VOISIN CHANGE, et rien ne
 *  prévient : le commentaire continue d'affirmer ce qui n'est plus vrai. C'est pour ça que le
 *  libellé descend ici, avec un garde : une phrase que personne ne tient dérive en silence.
 *
 *  ⚖️ ET L'UNITÉ EST IMPÉRIALE — Eric, 2026-09-21 : *« non, en mesures impériales ici »*. Le
 *  jeu se pèse en **livres**, et c'est ce que l'écran dit.
 *
 *  🔴 CE QUE ÇA NE VEUT PAS DIRE : convertir. La maison a déjà tranché, et c'est écrit vingt
 *  lignes plus haut — *« la livre et le kilo ne se convertissent JAMAIS l'un dans l'autre ici :
 *  l'édition FR n'est pas une conversion mais un ARRONDI d'éditeur (« 2 lb. » y vaut « 1 kg »,
 *  pas 0,907), et convertir inventerait une précision que le livre ne donne pas »*.
 *  ⭐ DONC UN TOTAL QUI N'EST PAS EN LIVRES EST UNE ANOMALIE, ⛔ pas un cas d'affichage : on ne
 *  le réétiquette pas en `lb` *(le chiffre mentirait, et un chiffre qui ment se recopie)*, et on
 *  ne le convertit pas non plus *(la loi l'interdit)*. **On le DIT.**
 *  ⭐ Même traitement pour un total qui MÊLE plusieurs unités : aucune étiquette, et on le dit.
 *  📌 Le repli sur la livre couvre l'ABSENCE de mesure — aucun objet pesé n'est pas « une autre
 *  unité », c'est l'unité du jeu qui s'applique par défaut.
 *
 *  @param {{somme:number, inconnus:number}} e     l'encombrement calculé
 *  @param {{unite:?string, melange:boolean}} poids ce que la pesée a trouvé
 */
export const UNITE_DU_JEU = "lb";

/** ⚖️ L'UNITÉ QU'ON A LE DROIT D'AFFICHER — ⛔ UN SEUL JUGE, et toutes les lignes le consultent.
 *
 *  ⭐ UNE SEULE CONDITION COUVRE LES DEUX ANOMALIES : plusieurs unités mêlées, ou une unité qui
 *  n'est pas celle du jeu. Dans les deux cas le chiffre n'est PAS en livres, donc il ne porte
 *  aucune étiquette — c'est le TOTAL qui le dit, une fois, ⛔ pas chaque ligne qui le répète.
 *  📌 Rend `null` quand rien ne peut être affiché honnêtement.
 */
export function uniteAffichee(poids) {
  const trouvee = poids && poids.unite;
  const impérial = !(poids && poids.melange) && (!trouvee || trouvee === UNITE_DU_JEU);
  return impérial ? UNITE_DU_JEU : null;
}

/** ⚖️ UNE LIGNE DE POIDS — `Gear 34 lb`. ⛔ Le même juge que le total, sinon deux lignes voisines
 *  peuvent afficher deux unités différentes pour une même pesée.
 *  ⭐ Eric, 2026-09-21, en listant ce qu'il veut voir : *« Encumbrance 34 lb · Gear 0 lb ·
 *  Backpack 34 lb · Other 0 lb »* — l'unité sur CHAQUE composant, pas seulement sur le total. */
export function motDUnPoids(titre, somme, inconnus, poids) {
  const rond = (n) => Math.round((n || 0) * 10) / 10;
  const unite = uniteAffichee(poids);
  return `${titre} ${rond(somme)}${unite ? ` ${unite}` : ""}${inconnus ? ` +${inconnus}?` : ""}`;
}

export function motDeLEncombrement(e, poids) {
  const rond = (n) => Math.round((n || 0) * 10) / 10;
  const unite = uniteAffichee(poids);
  return `Encumbrance : ${rond(e && e.somme)}`
    + (unite ? ` ${unite}` : " (hors mesures impériales)")
    + (e && e.inconnus ? ` · ${e.inconnus} sans poids` : "");
}

export function enGP(cout) {
  if (!cout) return 0;
  return CURRENCY_KEYS.reduce((s, k) => s + (cout[k] || 0) * TAUX_EN_GP[k], 0);
}

/** La bourse couvre-t-elle le coût ? ⭐ COMPARAISON EN GP AFFICHÉS, clef par
 *  clef d'abord : on paie chaque dénomination sur sa propre pile, et si une
 *  pile manque on NE fait PAS de change automatique (le change est un acte de
 *  table, pas d'écran) — on compare alors la valeur totale et on laisse le
 *  joueur ajuster sa bourse lui-même. v1 : refus simple si une clef manque. */
export function bourseCouvre(bourse, cout) {
  if (!cout) return false;
  return CURRENCY_KEYS.every((k) => (bourse[k] || 0) >= (cout[k] || 0));
}

/* ══ LE PANIER — IL VIT AU PERSONNAGE (décision d'Eric, 24/08 : « ok on
   fait le 2, si le pipeline existe ») ═══════════════════════════════════════
   MESURÉ AVANT d'écrire : `cart[N]` (+ `.quantity`, `.gratuit`) passe les
   verbes — zéro violation, zéro underived, les chemins relisent. Le panier
   SURVIT donc au rechargement et suit le personnage d'un appareil à l'autre,
   par la même sauvegarde que tout le reste — aucun stockage à côté.
   ⛔ L'ancien panier-module (état global) est MORT : deux écritures d'une
   même liste divergent au premier geste. Les écrans LISENT le document et
   AGISSENT par la coquille (`cartAdd`/`cartSetQuantity`/`cartToggleFree`/
   `cartClear`), comme toute décision. */

/** Les lignes `cart[N]` du document — même lecture que `currentGearLines`. */
export function currentCartLines(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const byIndex = new Map();
  const pathRe = /^cart\[(\d+)\](?:\.(quantity|gratuit))?$/;
  for (const choice of choices) {
    const match = typeof choice.path === "string" ? pathRe.exec(choice.path) : null;
    if (!match) continue;
    const index = Number(match[1]);
    if (!byIndex.has(index)) byIndex.set(index, { index });
    const line = byIndex.get(index);
    if (match[2] === "quantity") line.quantity = choice.value;
    else if (match[2] === "gratuit") line.gratuit = choice.value;
    else if (choice.ref) line.ref = choice.ref;
  }
  return [...byIndex.values()].filter((l) => l.ref).sort((a, b) => a.index - b.index);
}

export function nextCartIndex(document) {
  const lignes = currentCartLines(document);
  return lignes.length ? lignes[lignes.length - 1].index + 1 : 0;
}

export function cartCompte(document) {
  return currentCartLines(document).reduce((s, l) => s + (l.quantity || 1), 0);
}

export function cartTotal(lignes) {
  return additionneCouts(lignes.filter((l) => !l.gratuit).map((l) => multiplieCout(l.cout, l.quantity || 1)));
}

/* ══ LES LIGNES DU PERSONNAGE, PAR LIEU ═════════════════════════════════════
   `location` absente = « backpack » : les lignes d'AVANT ce pipeline (posées
   par le `+` de la grille) n'ont pas le champ — les traiter comme rangées au
   sac est la lecture la plus sûre : rien n'est « porté » sans geste. */
export function lignesParLieu(lignes, lieu) {
  return lignes.filter((l) => (l.location || "backpack") === lieu);
}

/** Le panneau GEAR WEIGHT (croquis B3/SB3.x) — self · backpack · storage.
 *  ⭐ Des COMPTES et une somme de poids de CATALOGUE (`data.weight`), jamais
 *  un jugement : aucune capacité, aucun seuil, aucun rouge.
 *  🔴 ET CE QUI NE SE LIT PAS SE COMPTE À PART, dans `inconnus`. L'ancienne
 *  version sautait l'objet illisible en silence : il entrait dans `compte` et
 *  pesait 0 dans `somme`, si bien qu'un sac de cinq objets dont trois portent
 *  « — » s'affichait avec un poids d'aplomb. ⛔ Un objet sans poids connu est
 *  un FAIT (18 objets portent le tiret, 5 portent « Varies »), pas un zéro —
 *  l'écran doit pouvoir le dire.
 *  `unite` est celle du LIVRE (`lb` en anglais, `kg` en français), jamais une
 *  conversion ; `melange` dit qu'une même pile a rendu deux unités, ce qui est
 *  une faute de données et non une somme à arrondir. */
const LIEUX_PESES = ["self", "backpack", "storage", "ground"];

/* ⚖️ UN BLUEPRINT NE PÈSE RIEN — ERIC, 2026-09-23 : *« une précision : un
   blueprint n'a pas de poids »*.
   ⭐ ET C'EST COHÉRENT AVEC CE QU'IL EST : une recette n'est pas l'objet, c'est
   la PROMESSE de l'objet. Un plan d'épée ne pèse pas ce que pèse l'épée, et un
   kit d'aventurier ne pèse ses 42 livres qu'UNE FOIS OUVERT — avant, il n'y a
   rien à porter.
   ⛔ ZÉRO N'EST PAS « INCONNU », ET LA DIFFÉRENCE EST TOUT : un poids « Varies »
   vaut 0 *et* reste compté dans `inconnus`, parce qu'il ATTEND une édition. Un
   blueprint, lui, ne vaut rien et n'attend rien. L'écran ne doit pas dire
   « plus 3 objets qu'on ne sait pas peser » à propos de trois recettes.
   ⚠️ Le kit garde son `weight` dans la donnée — 42 lb pour le Burglar's — et
   c'est voulu : c'est le poids de son CONTENU, celui qui entrera dans le sac à
   l'ouverture. On ne l'efface pas, on ne le compte pas encore. */
export function poidsParLieu(lignes, chercheRecord) {
  /* 🔴 LES QUATRE LIEUX SONT DÉCLARÉS, Y COMPRIS LE SOL — et c'est une
     réparation, pas un ajout. Trois seaux étaient déclarés ; une ligne au sol
     tombait dans un quatrième que personne n'avait nommé, et `compte[lieu] += n`
     y écrivait `NaN`. ⛔ Le résultat était JUSTE (le panneau ne lisait pas ce
     seau) et il tenait à un oubli : la première ligne « Ground » ajoutée au
     panneau aurait affiché `NaN`. ⭐ Le sol est maintenant COMPTÉ, et c'est
     l'encombrement qui l'exclut — par une clause écrite, lisible, qui dit
     pourquoi. */
  const vide = () => Object.fromEntries(LIEUX_PESES.map((l) => [l, 0]));
  const somme = vide(), compte = vide(), inconnus = vide();
  const unites = new Set();
  /* 🔴 DEUX PASSES, ET LA PREMIÈRE N'EST PAS UN LUXE : le tiret et « Varies »
     ne portent AUCUNE unité. Leur plancher vaut 0,1 en livres et 0,05 en kilos,
     donc il faut savoir dans quelle édition on pèse AVANT de les relever. La
     pile le dit elle-même, par ses objets lisibles ; à défaut, `lb`, l'unité
     du SRD en anglais, qui est la seule langue où cette couche existe. */
  const poids = lignes.map((l) => {
    const rec = chercheRecord(l.ref);
    return rec && rec.data ? rec.data.weight : undefined;
  });
  /* ⛔ CALCULÉ AVANT LA PASSE DES UNITÉS, ET CE N'EST PAS INDIFFÉRENT : une pile
     qui ne contiendrait QUE des recettes ne doit pas déduire son unité de leurs
     poids, qu'on ne lira jamais. */
  const recettes = lignes.map((l) => estRecette(chercheRecord(l.ref)));
  for (const w of poids) { const lu = parsePoids(w); if (lu) unites.add(lu.unite); }
  const unitePile = unites.size === 1 ? [...unites][0] : "lb";
  for (const [i, l] of lignes.entries()) {
    const lieu = LIEUX_PESES.includes(l.location) ? l.location : "backpack";
    const n = l.quantity || 1;
    compte[lieu] += n;
    /* ⭐ LE BLUEPRINT SORT ICI, APRÈS ÊTRE COMPTÉ ET AVANT D'ÊTRE PESÉ : il EST
       dans le sac (le compte le dit), il n'y pèse rien, et il n'est pas en
       attente d'une édition. Trois faits, et chacun a sa ligne. */
    if (recettes[i]) continue;
    const pesee = poidsDeJeu(poids[i], unitePile);
    if (!pesee) { inconnus[lieu] += n; continue; }
    somme[lieu] += pesee.valeur * n;
    /* ⛔ « Varies » PÈSE 0 ET RESTE INCONNU : la somme cesse de mentir, et le
       compte des « à éditer » ne disparaît pas avec elle. Les deux à la fois. */
    if (pesee.origine === "a-editer") inconnus[lieu] += n;
  }
  /* ⚖️ L'ENCOMBREMENT — Eric, 2026-09-18, en trois lignes : *« Gear : xxxxxx ·
     Backpack : xxxxxx · Encumbrance = (Gear + Backpack) xxxxx »*.
     ⛔ NI LE SOL, NI LA REMISE. Le sol parce qu'Eric l'a dit le 17/09 — *« poser
     un item trop lourd et voir l'incidence sur sa carrying capacity ; ground =
     exclu du calcul de poids »* : c'est la RAISON D'ÊTRE du sol, et un sol qui
     pèserait ne servirait à rien. La remise parce qu'elle n'est pas sur le
     personnage — on ne porte pas ce qu'on a laissé quelque part.
     ⭐ Et les objets SANS poids connu suivent la même somme : l'écran doit
     pouvoir dire « 12 lb, plus 3 objets qu'on ne sait pas peser ». */
  const encombrement = {
    somme: somme.self + somme.backpack,
    compte: compte.self + compte.backpack,
    inconnus: inconnus.self + inconnus.backpack
  };
  return { somme, compte, inconnus, encombrement,
    unite: unites.size === 1 ? [...unites][0] : null, melange: unites.size > 1 };
}

/* ⚖️ LE PANNEAU, DICTÉ PAR ERIC LE 18/09, EN TROIS LIGNES ET PAS QUATRE :
     Gear : xxxxxx · Backpack : xxxxxx · Encumbrance = (Gear + Backpack) xxxxx
   ⛔ `Self` DEVIENT `Gear` : c'est le mot de l'écran R, celui du menu d'envoi, et
   celui du belt. Un même lieu portait deux noms selon la page.
   ⛔ ET LA REMISE QUITTE LE PANNEAU : elle n'entre pas dans l'encombrement, et
   une ligne qui ne compte pas au milieu de deux qui comptent se lit comme si elle
   comptait. Elle reste un LIEU (on y range, on y reprend) — elle cesse d'être un
   poids. ⭐ Sa porte vit ailleurs : le panneau n'était pas son seul chemin. */
function panneauPoids(poids, surLieu) {
  const p = elp("aside", "pipeline-poids");
  p.append(elp("h3", null, "Gear weight"));
  const mesure = (compte, somme, inconnus) =>
    `${compte} obj. · ${Math.round(somme * 10) / 10} ${poids.unite || "lb"}`
    + (inconnus ? ` (+${inconnus} sans poids)` : "");
  for (const [lieu, mot] of [["self", "Gear"], ["backpack", "Backpack"]]) {
    /* ⚠️ Le nombre d'objets SANS poids connu s'affiche à côté de la somme :
       sans lui, la somme se lit comme si elle portait tout le sac. */
    const ligne = bouton(`${mot} — ${mesure(poids.compte[lieu], poids.somme[lieu], poids.inconnus[lieu])}`,
      "pipeline-poids-ligne", () => surLieu && surLieu(lieu), `Open ${mot}`);
    ligne.dataset.lieu = lieu;
    p.append(ligne);
  }
  /* ⛔ L'ENCOMBREMENT N'EST PAS UNE PORTE : on ne l'ouvre pas, on le LIT. C'est
     un voyant, et il ne prend donc ni bouton, ni cible tactile. */
  const total = elp("p", "pipeline-poids-total",
    `Encumbrance — ${mesure(poids.encombrement.compte, poids.encombrement.somme, poids.encombrement.inconnus)}`);
  total.dataset.lieu = "encombrement";
  p.append(total);
  return p;
}

/* ══ MY GOLD — la bourse en lecture, quatre clefs ══════════════════════════
   🌱 LOT 198 — OU LE MOT DE LA BOURSE : sans classe, l'or de départ n'existe
   pas (`orDuDepart`, equipment-step), et quatre tirets seraient une bourse
   tronquée qui se tait. Le pilote tend `motBourse` (un seul écrivain,
   `motDeLaBourse`) ; ici on l'affiche à la place des clefs. Complète, ou
   nommée, jamais tronquée. */
function blocMyGold(bourse, motBourse) {
  const b = elp("div", "pipeline-mygold");
  b.append(elp("h3", null, "My gold"));
  if (motBourse) { b.append(elp("p", "pipeline-mygold-mot", motBourse)); return b; }
  const rang = elp("p", "pipeline-mygold-rang");
  for (const k of ["pp", "gp", "sp", "cp"]) {
    rang.append(elp("span", null, `${k.toUpperCase()} ${bourse[k] ?? "—"}`));
  }
  b.append(rang);
  return b;
}

/* ══ 🔴 LA FICHE D'UN OBJET A QUITTÉ CE FICHIER — LOT 242 ══════════════
   `renderB1` vivait ici. ⚖️ `NORMES.md` (`equipement-la-fiche-du-catalogue-est-un-x2`)
   lui rendait déjà son nom de loi : c'est un **X2**, et `b1` désignait *le même mot
   que le rang B1, qui est le sac* — ⛔ un nom, deux objets.
   ⭐ IL EST MAINTENANT DANS `x2-ecran.mjs`, À CÔTÉ DE `x1-ecran.mjs`, et pour une
   raison qui n'est pas de rangement : sa moitié haute est IMPORTÉE de X1, donc elle
   importe `x1-ecran`, qui importe `gear-ecran`, qui importe CE fichier. La garder
   ici aurait fermé le cycle.
   ⛔ Sa logique n'a pas bougé : elle appelle toujours `parseCout`, `multiplieCout` et
   `bourseCouvre` d'ici. */

/* ══ B2 — LE CART (croquis IMG_6108) · SB3.2 — LA MÊME LISTE, VUE DE B3 ═════
   `mode: "cart"` → BACK vers R, BUY paie ; `mode: "send"` (SB3.2) → BACK vers
   B3, SEND range des objets DÉJÀ à soi (aucun paiement), ⏳ FREE improvisé :
   la liste part SANS paiement (cadeau du DM, butin — le monde extérieur d'où
   les objets arrivent gratuitement). */
export function renderB2({ mode, lignes, bourse, motBourse = null, onAction, retour, parPage = B2_LIGNES }) {
  const ecran = elp("section", "pipeline-ecran pipeline-b2");
  ecran.dataset.ecran = mode === "send" ? "SB3.2" : "B2";
  let page = 0;

  const entete = elp("header", "pipeline-entete");
  entete.append(elp("h2", null, mode === "send" ? "Send list = cart" : "Cart"));
  const compte = elp("p", "pipeline-compte");
  entete.append(compte);
  const gauche = bouton("←", "pipeline-fleche", () => { page -= 1; peindre(); }, "Previous page");
  const droite = bouton("→", "pipeline-fleche", () => { page += 1; peindre(); }, "Next page");

  const listeHote = elp("div", "pipeline-lignes");
  const totalP = elp("p", "pipeline-total");
  const or = blocMyGold(bourse, motBourse);
  const alerte = elp("p", "pipeline-alerte");

  /* ⭐ RÈGLE D\u2019ERIC (24/08) : *« si aucun destinataire, ça va dans backpack —
     surtout si c'est un panier »* — une LISTE se range, elle ne s'équipe pas
     d'un bloc ; le défaut est le sac. */
  const destRang = elp("div", "pipeline-sendto");
  destRang.append(elp("span", "pipeline-libelle", "Send to"));
  const dest = elp("select", "pipeline-dropdown");
  for (const [v, mot] of [["backpack", "Backpack"], ["self", "Slot (auto)"]]) {
    const o = elp("option", null, mot); o.value = v; dest.append(o);
  }
  destRang.append(dest);

  function envoyerTout(payer) {
    if (!lignes.length) { alerte.textContent = "The list is empty."; return; }
    if (payer) {
      const total = cartTotal(lignes);
      if (!bourseCouvre(bourse, total)) { alerte.textContent = "Not enough coin for the whole cart."; return; }
      if (enGP(total) > 0) onAction({ kind: "payer", cout: total });
    }
    const destination = dest.value || "backpack";
    for (const l of lignes) {
      onAction({ kind: "addGearLine", ref: l.ref, quantity: l.quantity || 1,
        equipped: destination === "self", location: destination });
    }
    onAction({ kind: "cartClear" });
    retour();
  }

  const pied = elp("div", "pipeline-pied pipeline-pied-panier");
  pied.append(
    bouton("BACK", "pipeline-bouton", retour, "Back — the cart stays"),
    /* ⭐ CANCEL — la loi d'Eric du 20/08 : *« back n'efface pas ; pour
       effacer, c'est cancel »*. Demandé pour le panier le 24/08. Il VIDE la
       liste (au document) et reste sur l'écran, qui montre alors le vide. */
    bouton("CANCEL", "pipeline-bouton", () => { onAction({ kind: "cartClear" }); }, "Empty the cart"),
    bouton("CRAFT", "pipeline-bouton pipeline-inerte", () => {}, "Craft"),
    mode === "send"
      ? bouton("SEND", "pipeline-bouton", () => envoyerTout(false), "Send the list")
      : bouton("BUY", "pipeline-bouton", () => envoyerTout(true), "Pay once for the whole cart"),
    bouton("FREE", "pipeline-bouton", () => envoyerTout(false), "Send without paying"),
  );

  function peindre() {
    const vue = pageDeListe(lignes, page, parPage);
    page = vue.page;
    compte.textContent = `${vue.page + 1}/${vue.pages}`;
    listeHote.textContent = "";
    if (!lignes.length) listeHote.append(elp("p", "pipeline-vide", "The cart is empty."));
    for (const l of vue.objets) {
      const rang = elp("div", "pipeline-ligne");
      rang.append(elp("span", "pipeline-ligne-nom", l.nom));
      const qte = elp("span", "pipeline-ligne-qte", `×${l.quantity || 1}`);
      const plus = bouton("+", "pipeline-pas pipeline-pas-plus",
        () => onAction({ kind: "cartSetQuantity", index: l.index, quantity: (l.quantity || 1) + 1 }),
        `One more ${l.nom}`);
      const moins = bouton("−", "pipeline-pas pipeline-pas-moins",
        () => onAction({ kind: "cartSetQuantity", index: l.index, quantity: (l.quantity || 1) - 1 }),
        `One less ${l.nom}`);
      const prix = elp("span", "pipeline-ligne-prix",
        l.gratuit ? "free" : formatCout(multiplieCout(l.cout, l.quantity || 1)));
      const libre = bouton("FREE", "pipeline-ligne-libre",
        () => onAction({ kind: "cartToggleFree", index: l.index }), `Toggle ${l.nom} free`);
      libre.dataset.actif = l.gratuit ? "oui" : "non";
      libre.setAttribute("aria-pressed", l.gratuit ? "true" : "false");
      rang.append(qte, plus, moins, prix, libre);
      listeHote.append(rang);
    }
    totalP.textContent = `Total (${lignes.reduce((n, l) => n + (l.quantity || 1), 0)} items) : ${formatCout(cartTotal(lignes))}`;
  }
  peindre();

  ecran.append(entete, gauche, droite, listeHote, totalP, or, destRang, alerte, pied);
  return ecran;
}

/* ══ SB3.1 — BACKPACK · SB3.3 — STORAGE (⏳ L'IMPROVISATION DEMANDÉE) ═══════
   Le croquis SB3.3 redessine « BACKPACK » mais il n'est atteint QUE par
   Companions, exclu du mandat. Improvisé en STORAGE : le même écran, tourné
   vers la remise — et c'est lui qui complète les ÉCHANGES INTERNES :
   chaque ligne porte ses trois destinations, l'écran devient la plaque
   tournante self ↔ backpack ↔ storage. */
/** UNE RANGÉE D'ÉCHANGE — nom ×qte, les destinations, DROP. ⭐ PARTAGÉE :
 *  les écrans SB3.1/SB3.3 la paginent, le FLUX du dressing (trois bandes,
 *  26/08) la déroule — une seule écriture du geste d'échange. */
export function rangeeEchange(l, lieu, onAction) {
  /* ⛔ `Storage` retiré aussi ici — voir la note de X2 (`x2-ecran.mjs`) : envoi vers l’invisible. */
  const DESTS = [["self", "Worn"], ["backpack", "Backpack"]];
  const rang = elp("div", "pipeline-ligne");
  rang.append(elp("span", "pipeline-ligne-nom", `${l.nomAffiche} ×${l.quantity || 1}`));
  for (const [v, mot] of DESTS) {
    if (v === lieu) continue;
    rang.append(bouton(`→ ${mot}`, "pipeline-ligne-envoi",
      () => onAction({ kind: "moveGearLine", index: l.index, location: v }),
      `Move ${l.nomAffiche} to ${mot}`));
  }
  rang.append(bouton("DROP", "pipeline-ligne-envoi pipeline-danger",
    () => onAction({ kind: "removeGearLine", index: l.index }),
    `Drop ${l.nomAffiche}`));
  return rang;
}

export function renderSacs({ lieu, lignes, chercheRecord, onAction, retour, surLieu, parPage = SACS_LIGNES }) {
  const ecran = elp("section", "pipeline-ecran pipeline-sac");
  ecran.dataset.ecran = lieu === "storage" ? "SB3.3" : "SB3.1";
  let page = 0;

  const entete = elp("header", "pipeline-entete");
  entete.append(elp("h2", null, lieu === "storage" ? "Storage" : "Backpack"));
  const compte = elp("p", "pipeline-compte");
  entete.append(compte);

  const poids = poidsParLieu(lignes, chercheRecord);
  const cadran = panneauPoids(poids, surLieu);

  const listeHote = elp("div", "pipeline-lignes");
  const ici = lignesParLieu(lignes, lieu);

  function peindre() {
    const vue = pageDeListe(ici, page, parPage);
    page = vue.page;
    compte.textContent = `${vue.page + 1}/${vue.pages}`;
    listeHote.textContent = "";
    if (!ici.length) listeHote.append(elp("p", "pipeline-vide",
      lieu === "storage" ? "Nothing stored." : "The backpack is empty."));
    for (const l of vue.objets) listeHote.append(rangeeEchange(l, lieu, onAction));
  }
  peindre();

  const gauche = bouton("←", "pipeline-fleche", () => { page -= 1; peindre(); }, "Previous page");
  const droite = bouton("→", "pipeline-fleche", () => { page += 1; peindre(); }, "Next page");
  const pied = elp("div", "pipeline-pied");
  pied.append(bouton("BACK", "pipeline-bouton", retour, "Back to the dressing"));

  ecran.append(entete, gauche, droite, cadran, listeHote, pied);
  return ecran;
}

/* ══ LA RECHERCHE — invoquée à la LOUPE depuis le coin de R (Eric, 24/08) ════
   « Once found, takes you directly to item menu » (son annotation du croquis
   R) : un résultat touché OUVRE LA FICHE — la recherche est un raccourci vers
   B1, pas un troisième catalogue. ⛔ Pas de défilement : des pages. */
export function renderRecherche({ catalogue, onOuvrirFiche, retour, parPage = RECHERCHE_LIGNES }) {
  const ecran = elp("section", "pipeline-ecran pipeline-recherche");
  ecran.dataset.ecran = "Recherche";
  let page = 0;
  let terme = "";

  const entete = elp("header", "pipeline-entete");
  entete.append(elp("h2", null, "Find equipment"));
  const compte = elp("p", "pipeline-compte");
  entete.append(compte);
  const gauche = bouton("←", "pipeline-fleche", () => { page -= 1; peindre(); }, "Previous page");
  const droite = bouton("→", "pipeline-fleche", () => { page += 1; peindre(); }, "Next page");

  const champ = elp("input", "pipeline-typein pipeline-recherche-champ");
  champ.type = "search";
  champ.placeholder = "Type a name…";
  champ.setAttribute("aria-label", "Search the catalogue");
  champ.addEventListener("input", () => { terme = champ.value.trim().toLowerCase(); page = 0; peindre(); });

  const listeHote = elp("div", "pipeline-lignes");

  function resultats() {
    if (terme.length < 2) return [];
    return catalogue.filter((it) => (it.nom || "").toLowerCase().includes(terme));
  }

  function peindre() {
    const trouves = resultats();
    const vue = pageDeListe(trouves, page, parPage);
    page = vue.page;
    compte.textContent = terme.length < 2 ? "—" : `${trouves.length} · ${vue.page + 1}/${vue.pages}`;
    listeHote.textContent = "";
    if (terme.length < 2) {
      listeHote.append(elp("p", "pipeline-vide", "Two letters at least — the catalogue is wide."));
      return;
    }
    if (!trouves.length) {
      listeHote.append(elp("p", "pipeline-vide", "Nothing bears that name."));
      return;
    }
    vue.objets.forEach((it) => {
      const rang = bouton("", "pipeline-ligne pipeline-resultat",
        () => onOuvrirFiche(trouves, trouves.indexOf(it)), `Open ${it.nom}`);
      rang.append(elp("span", "pipeline-ligne-nom", it.nom),
        elp("span", "pipeline-ligne-prix", it.coutTexte || "—"));
      listeHote.append(rang);
    });
  }
  peindre();

  const pied = elp("div", "pipeline-pied pipeline-pied-seul");
  pied.append(bouton("BACK", "pipeline-bouton", retour, "Back to the browser"));

  ecran.append(entete, gauche, droite, champ, listeHote, pied);
  return ecran;
}
