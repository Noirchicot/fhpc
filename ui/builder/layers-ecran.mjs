/* ══ L'ÉCRAN `Layers` — LE TABLEAU DE COMMANDE DES COUCHES — lot 188 ══════
   ⚖️ Eric, 09/09, gravé avec sa question : *« Comment s'appelle l'écran des
   six interrupteurs ? »* → **`Layers`** — et non `Rules`, en collision avec
   le nom accessible du bouton livre ; et l'écran ne fait pas que des règles,
   il porte aussi les livres du joueur et le homebrew.

   LE DESSIN EST D'ERIC (artefact « Six interrupteurs, un catalogue », 08/09) :
   *« Un tableau de commande, pas une liste d'options. Le socle, puis les
   couches qui s'empilent dessus. »*

       SRD 5.2.1      compatible with the core rules   — un VOYANT (09/09)
       Fate's Hand    allume les six d'un coup          — MAÎTRE
       ── ses six couches, chacune se coupe seule ──
       Trainings · Skills & tools · Inheritance · Destiny · World · Soulforging
       (World s'appelait Lore jusqu'au 10/09 — le lexique, lot 192)
       ── catalogue, du contenu, pas des règles ──
       les livres du joueur · + homebrew

   🔴 UN INTERRUPTEUR EST UN ENSEMBLE DE COUCHES, PAS UNE COUCHE — mesuré le
   09/09 sur les drapeaux du dépôt : `Destiny` = `fh-arcana-en` + `fh-feats-en`
   + `fh-spells-en` ; `World` = `fh-species-en` + `fh-fiche-en` + `fh-lore-en` ;
   les quatre autres en portent une. `fh-gems-en` est du CATALOGUE : elle ne
   se coupe pas seule, elle suit le maître.
   ⚖️ LOT 191 — `fh-species-en` a QUITTÉ le catalogue pour World, sur les deux
   règles d'Eric du 09/09 : *« Il n'y a pas d'Araag dans SRD si le bouton Lore
   n'est pas poussé »* et *« Lore rajoute le monde FH sans les règles »*. La
   table vit dans `interrupteurs.mjs` (une feuille sans import, pour que le
   mot d'un choix non résolu puisse nommer son interrupteur sans cycle) et
   se réexporte d'ici : ses lecteurs ne changent pas d'adresse.

   ⚖️ UNE COUCHE ÉTEINTE NE LAISSE PAS DE TROU, ELLE DÉGRADE (Eric). Sans
   Trainings, l'Inheritance n'offre plus de langue ; le moteur déclare le
   manque et continue (mesuré au lot 184, `ARCHITECTURE.md`). C'est pourquoi
   un enfant se coupe SANS confirmation : rien n'est effacé, tout revient à
   l'allumage. Le maître, lui, garde la confirmation du lot 54 — c'est le seul
   geste qui met tout Fate's Hand en pause d'un coup — et depuis le lot 192
   elle a TROIS voies : garder, sauvegarder la version FH puis couper, couper
   (`renderConfirmationPile`, universe-step.mjs, et sa tête dit pourquoi la
   question ne se pose qu'au maître).

   ⚖️ ET UN INTERRUPTEUR PEUT EN EXIGER UN AUTRE — Eric, 08/09 : *l'Inheritance
   dépend des Trainings*. Éteindre Trainings éteint Inheritance ; tant que
   Trainings dort, Inheritance se montre `disabled` avec son mot.

   🔴 UN SOUS-ENSEMBLE EST LÉGITIME, PAS INCONNU. `currentStack` ne nomme que
   deux piles (`srd`, `srdfh`) et rend `null` entre les deux ; l'écran mort
   accusait alors le personnage. Le précédent est le lot 186 (la ceinture lit
   ce qui est MONTÉ) : ici, `compositionFh` lit le document interrupteur par
   interrupteur, et seule une composition qu'AUCUN interrupteur ne peut
   produire — un ensemble coupé en deux, le socle absent — reste innommable.

   ⚠️ CE MODULE ET `universe-step.mjs` S'IMPORTENT L'UN L'AUTRE, et c'est
   assumé : les listes de couches vivent là-bas (les tests les y lisent depuis
   le lot 54), l'organe interrupteur et l'écran vivent ici. ⛔ Aucun export de
   l'autre module n'est lu AU CHARGEMENT de celui-ci — seulement dans des
   fonctions — sinon l'ordre d'import déciderait qui plante.

   ⚠️ LES TEXTES SONT DES BROUILLONS en anglais (arbitrage d'Eric, tête de
   `shell.mjs`) ; c'est lui qui arrête les mots que le joueur lit. */

import { SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, RULE_LAYER_IDS, LIVRE_LAYER_IDS, renderConfirmationPile } from "./universe-step.mjs?v=616";
/* LOT 191 — la table des interrupteurs est une feuille (voir sa tête) ; elle
   se réexporte d'ici pour l'écran, la coquille et les gardes. */
import { INTERRUPTEURS, CATALOGUE_FH, LIVRES_DU_JOUEUR } from "./interrupteurs.mjs?v=616";
export { INTERRUPTEURS, CATALOGUE_FH, LIVRES_DU_JOUEUR };

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* ══ L'INTERRUPTEUR — Eric, 2026-09-08 ════════════════════════════════════
   *« Il faut créer ce putain de switch on/off rouge-vert, qui prend peu de
   place — genre on en met un par ligne. »*

   ⭐ UN SEUL ORGANE POUR LES DEUX ESPÈCES QU'ON AVAIT. Le Menu portait DEUX
   dessins pour « allumé / éteint » : la piste-et-pouce de `.bascule-ligne`
   (les règles) et le mot-dans-une-boîte de `.universe-bascule` (tutoriel,
   double vue) — `A-TRANCHER §C26 ②` les nommait tous les deux et demandait
   qu'ils prennent le rouge et le vert. Ils prennent la même forme, et c'est
   celle-ci : une LIGNE, le mot à gauche, la piste à droite.

   🔴 LE ROUGE À GAUCHE, LE VERT À DROITE — Eric, 06/09 : *« le cercle à gauche
   = rouge, à droite = vert »*. La couleur DIT l'état, la position le REDIT, et
   `aria-checked` le dit une troisième fois — trois canaux, comme la loi des
   jetons. ⛔ Aucune couleur n'est écrite ici : la feuille lit `data-on`.

   ⚖️ `role="switch"` ET PAS `aria-pressed` : un interrupteur est un état vrai
   ou faux, pas un bouton qu'on enfonce. Le rôle promet exactement ce que
   l'organe fait — cliquer inverse — et rien de plus (⛔ pas de `radio`, qui
   promettrait des flèches que rien n'implémente, voir `carnet.mjs`).

   📏 PETIT, PARCE QU'ERIC LE VEUT PETIT : piste 36 × 20, pouce 16. La LIGNE,
   elle, garde `--touch` 44 — on vise la ligne au pouce, pas la piste.

   ⭐ LOT 188 — IL A DÉMÉNAGÉ ICI depuis `universe-step.mjs`, sans changer de
   forme, et il gagne une NOTE facultative : la ligne sous le mot, celle du
   dessin d'Eric (*« langues, rituels sombres »*). Un interrupteur sans note
   (Tutorials, Double view) rend exactement ce qu'il rendait. */
export function interrupteur({ label, note, on, disabled, onChange }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "interrupteur";
  btn.setAttribute("role", "switch");
  btn.setAttribute("aria-checked", String(Boolean(on)));
  btn.dataset.on = String(Boolean(on));
  if (disabled) btn.disabled = true;
  const mot = el("span", "interrupteur-mot", [text(label)]);
  if (note) mot.append(el("span", "interrupteur-note", [text(note)]));
  btn.append(mot);
  btn.append(el("span", "interrupteur-piste", [el("span", "interrupteur-pouce")]));
  btn.addEventListener("click", () => onChange(!on));
  return btn;
}

/* ══ UNE PLACE RÉSERVÉE — la loi du 26/08, tranchée en forme le 08/09 ═════
   Eric, 26/08 : *« à mettre dans le menu mais pas le câbler »* · *« on note,
   on câble après »*. Eric, 08/09 : *« il faut laisser une place à tout ce
   que j'ai dit »* — pour que les itérations suivantes n'aient pas à
   détruire pour reconstruire.

   ⭐ ELLE EST PRÉSENTE, ÉTEINTE, ET ELLE LE DIT — la forme exacte de
   `Double view` quand la fenêtre est trop petite (📍 `menu-reglage-
   impossible-reste-visible`) : `disabled` + un mot. ⛔ Pas une seconde forme :
   un joueur qui a appris ce que veut dire « gris avec un mot » sur un
   réglage l'apprend une fois pour toutes.

   ⭐ LOT 188 — LE MOT SE CHOISIT. « soon » reste le défaut (une place qu'un
   lot câblera) ; un livre absent du disque dit « not on this device », qui
   n'est pas une promesse : personne ne le câblera, c'est au joueur de
   l'importer. */
export function ligneReservee(label, mot = "soon") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "tdc-ligne";
  b.disabled = true;
  b.dataset.reserve = "true";
  b.append(el("span", null, [text(label)]));
  b.append(el("span", "tdc-bientot", [text(mot)]));
  return b;
}

/* ══ LE VOYANT — Eric, 09/09, sur la v612 en ligne ═══════════════════════
   *« Le bouton SRD est un VOYANT, pas un bouton — il est toujours actif. »*

   📏 CE QU'IL REMPLACE, ET POURQUOI C'ÉTAIT FAUX : le socle était un
   `interrupteur({ on: true, disabled: true })` — ici ET au Menu (où il jouait
   en plus le miroir de Fate's Hand). Un interrupteur `disabled` RESSEMBLE À
   UN BOUTON QU'ON NE PEUT PAS POUSSER : la piste grise, le pouce gris, le
   curseur barré — trois signes qui disent « pas à toi de le toucher », alors
   que la vérité est « il n'y a rien à toucher ». Et le lecteur d'écran
   annonçait *« interrupteur, activé, désactivé »* sur une chose qui n'a
   jamais eu deux positions.

   ⭐ UN VOYANT EST UNE LAMPE : elle dit « allumé », on ne la pousse pas. La
   norme existait avant l'organe — `voyant-non-cliquable` (NORMES, 26/08) :
   *« Le voyant ne se touche pas : ne pas lui donner l'apparence d'un
   contrôle. »* Sa forme est celle de la pastille de coffre (📍
   `cadre-pastille-de-coffre`, tranchée par Eric : *« C — la pastille et la
   date »*) : un POINT de 8 px + le mot de l'état. Le Menu en portait déjà une
   sur la ligne d'état (`[data-garde]`, « ● saved ») ; c'est la même lampe.

   🔴 CE QU'IL N'EST PAS, ET UN GARDE LE TIENT (`tests/ecran-layers.test.mjs`) :
   ⛔ pas un `<button>` · ⛔ pas de `role="switch"` · ⛔ pas d'`aria-checked` ·
   ⛔ pas de `disabled` · ⛔ pas de focus clavier. `role="status"` : une région
   d'état, lue comme du texte, jamais annoncée comme un contrôle.

   ⭐ UN SEUL ORGANE POUR UN SEUL SENS, DEUX ENDROITS : le socle de `Layers` et
   la ligne des règles du Menu (`universe-step.mjs`). Le SRD y est TOUJOURS
   allumé — Eric : *« il est toujours actif »* — y compris quand Fate's Hand
   l'est aussi : le miroir « SRD éteint quand FH est allumé » (08/09) est
   abandonné par ce mot du 09/09. Le SRD n'est pas l'inverse de Fate's Hand,
   c'est le plancher sous lui. */
export function voyant({ label, note, etat = "always on" }) {
  const ligne = el("div", "voyant");
  ligne.setAttribute("role", "status");
  ligne.dataset.on = "true";
  const mot = el("span", "voyant-mot", [text(label)]);
  if (note) mot.append(el("span", "voyant-note", [text(note)]));
  ligne.append(mot);
  /* La lampe est DESSINÉE par la feuille sur `data-on` (un point, `--positive`),
     jamais un glyphe — la même loi qu'au pouce de l'interrupteur. */
  ligne.append(el("span", "voyant-etat", [el("span", "voyant-lampe"), text(etat)]));
  return ligne;
}

/* ══ LES SIX INTERRUPTEURS, LE CATALOGUE, LES LIVRES ══════════════════════
   ⭐ LOT 191 — la table a DÉMÉNAGÉ dans `interrupteurs.mjs` (feuille sans
   import) et se réexporte en tête de ce fichier. `couches` = ce que
   l'interrupteur allume et éteint (le montage/démontage, lui, suit TOUJOURS
   `FH_LAYER_IDS` — voir `monterLesCouches`, shell.mjs). `exige` = un autre
   interrupteur sans lequel celui-ci dort.
   ⛔ LES IDS Y SONT ÉCRITS EN TOUTES LETTRES, et un garde les confronte à
   `FH_LAYER_IDS` (`tests/ecran-layers.test.mjs`) : l'union des six plus le
   catalogue doit être EXACTEMENT la pile Fate's Hand, sans trou ni doublon.
   Une couche qui entrerait dans `engine.mjs` sans interrupteur rougirait là. */

function idsDuDocument(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  return new Set(layers.map((layer) => layer.id));
}

/** LA COMPOSITION FATE'S HAND DU DOCUMENT — lue interrupteur par interrupteur.
 *
 *  Lue sur le DOCUMENT, jamais sur la pile montée (même loi que
 *  `currentStack`) : c'est ce que le joueur a choisi pour CE personnage.
 *
 *  · `socle`     — le SRD et `srfh` sont là (sans eux, rien ne se nomme) ;
 *  · `enfants`   — par interrupteur, `true` si TOUTES ses couches sont déclarées ;
 *  · `catalogue` — les couches de catalogue sont là ;
 *  · `maitre`    — Fate's Hand est ENGAGÉ : le catalogue ou au moins un enfant ;
 *  · `tous`      — les six enfants sont allumés (la pile `srdfh`) ;
 *  · `legitime`  — la composition est une que les interrupteurs PEUVENT
 *                  produire : le socle présent, aucun interrupteur coupé en
 *                  deux (une couche de `Destiny` sans les deux autres), le
 *                  catalogue entier ou absent. ⛔ C'est LA condition de
 *                  l'écran mort (`ecran-mort.mjs`) et du mot rouge du Menu :
 *                  une règle qui MANQUE au milieu d'un ensemble, jamais un
 *                  ensemble entier qu'on a choisi d'éteindre.
 *
 *  @param {object} doc le document `fh-char/1`
 */
export function compositionFh(doc) {
  const ids = idsDuDocument(doc);
  const socle = ids.has(SRD_LAYER_ID) && SRFH_LAYER_IDS.every((id) => ids.has(id));
  let legitime = socle;
  const enfants = {};
  for (const sw of INTERRUPTEURS) {
    const presentes = sw.couches.filter((id) => ids.has(id)).length;
    enfants[sw.id] = presentes === sw.couches.length;
    if (presentes !== 0 && presentes !== sw.couches.length) legitime = false;
  }
  const catalogueN = CATALOGUE_FH.filter((id) => ids.has(id)).length;
  const catalogue = catalogueN === CATALOGUE_FH.length;
  if (catalogueN !== 0 && !catalogue) legitime = false;
  const maitre = catalogue || Object.values(enfants).some(Boolean);
  const tous = catalogue && INTERRUPTEURS.every((sw) => enfants[sw.id]);
  return { socle, enfants, catalogue, maitre, tous, legitime };
}

/** LES COUCHES FATE'S HAND VOULUES APRÈS UN GESTE — une fonction PURE, pour
 *  qu'un test la lise sans coquille.
 *
 *  `geste` = `{ id: "maitre", on }` ou `{ id: <interrupteur>, on }`.
 *  Rend les ids à laisser MONTÉS, dans l'ordre de `FH_LAYER_IDS` : c'est
 *  `monterLesCouches` (shell.mjs) qui en déduit quoi éteindre et quoi allumer.
 *
 *  🔴 LA DÉPENDANCE S'APPLIQUE DANS LES DEUX SENS : éteindre un interrupteur
 *  éteint ceux qui l'exigent ; allumer un interrupteur allume celui qu'il
 *  exige (l'organe est `disabled` tant que l'exigé dort, mais la fonction ne
 *  compte pas sur l'organe pour tenir la règle).
 *
 *  ⭐ ALLUMER UN ENFANT ENGAGE LE MAÎTRE : le catalogue vient avec (les
 *  espèces et les gemmes « restent allumées avec le maître »). Éteindre le
 *  dernier enfant laisse le catalogue — c'est le maître qui coupe tout. */
export function couchesApresLeGeste(doc, geste) {
  if (geste.id === "maitre") return geste.on ? [...FH_LAYER_IDS] : [];
  const composition = compositionFh(doc);
  const voulues = new Set();
  if (composition.catalogue) for (const id of CATALOGUE_FH) voulues.add(id);
  for (const sw of INTERRUPTEURS) if (composition.enfants[sw.id]) for (const id of sw.couches) voulues.add(id);

  const cible = INTERRUPTEURS.find((sw) => sw.id === geste.id);
  if (!cible) throw new Error(`layers-ecran : aucun interrupteur « ${geste.id} »`);
  if (geste.on) {
    for (const id of CATALOGUE_FH) voulues.add(id);
    for (const id of cible.couches) voulues.add(id);
    const exige = cible.exige && INTERRUPTEURS.find((sw) => sw.id === cible.exige);
    if (exige) for (const id of exige.couches) voulues.add(id);
  } else {
    for (const id of cible.couches) voulues.delete(id);
    for (const sw of INTERRUPTEURS) {
      if (sw.exige === cible.id) for (const id of sw.couches) voulues.delete(id);
    }
  }
  return FH_LAYER_IDS.filter((id) => voulues.has(id));
}

/** LES GESTES QUI RANGENT LA PILE MONTÉE SUR LE DOCUMENT — pure, pour que le
 *  garde la lise sur la vraie pile sans coquille (`alignerLaPileSurLeDocument`,
 *  shell.mjs, ne fait qu'appliquer ce qu'elle rend).
 *
 *  Ne bougent que les couches PILOTABLES : Fate's Hand et le contenu (livres,
 *  homebrew) — ⛔ jamais le SRD ni `srfh`, qui sont le plancher. On éteint par
 *  le HAUT (l'ordre du manifeste à l'envers), on allume par le BAS : la leçon
 *  du lot 77, `fh-fiche-en` patche ce que `fh-species-en` ajoute.
 *
 *  @param {Array<{id:string, enabled:boolean}>} pile le manifeste de la pile montée
 *  @param {Iterable<string>} declares les ids que `document.build.layers` déclare
 *  @returns {{eteindre: string[], allumer: string[]}} dans l'ordre d'application
 */
export function gestesDAlignement(pile, declares) {
  const voulus = new Set(declares);
  const pilotables = (Array.isArray(pile) ? pile : [])
    .filter((c) => c && (FH_LAYER_IDS.includes(c.id) || !RULE_LAYER_IDS.includes(c.id)));
  return {
    eteindre: [...pilotables].reverse().filter((c) => c.enabled && !voulus.has(c.id)).map((c) => c.id),
    allumer: pilotables.filter((c) => !c.enabled && voulus.has(c.id)).map((c) => c.id)
  };
}

/** Le compte de records d'un ensemble de couches, lu dans le manifeste de la
 *  pile montée (`layers.verbs.stack()`), ou `null` si la pile n'est pas là. */
function recordsDe(pile, couches) {
  if (!Array.isArray(pile)) return null;
  let total = 0;
  for (const id of couches) {
    const couche = pile.find((c) => c && c.id === id);
    if (!couche || typeof couche.records !== "number") return null;
    total += couche.records;
  }
  return total;
}

/** 🎛️ L'ÉCRAN `Layers` — le rang B du Menu qui porte le tableau de commande.
 *
 *  ⛔ IL NE PORTE PAS SA PROPRE SORTIE : `data-sortie-ici` la déclare, et
 *  c'est la coquille qui produit la paire — la même loi que Display.
 *
 *  @param {object} ctx
 *  @param {object} ctx.document       le document `fh-char/1`
 *  @param {Function} [ctx.query]      `layers.verbs.query` (pour la confirmation)
 *  @param {Array} [ctx.pile]          le manifeste de la pile montée (`layers.verbs.stack()`)
 *  @param {Array} [ctx.livresRefuses] `[{id, raison}]` — un livre présent mais illisible
 *  @param {string|null} [ctx.pendingStack]
 *  @param {(action: object) => void} onAction
 *    `{kind:"requestLayerStack", value}` (le maître — la coquille confirme) ·
 *    `{kind:"requestLayerSwitch", id, value}` (un enfant) ·
 *    `{kind:"requestBookSwitch", id, value}` (un livre monté).
 */
export function renderLayersEcran(ctx, onAction) {
  const doc = ctx.document;
  const composition = compositionFh(doc);
  const pile = Array.isArray(ctx.pile) ? ctx.pile : null;
  const section = el("section", "universe-step layers-ecran dalle-intermediaire");
  section.dataset.objet = "dalle";
  section.dataset.sortieIci = "true";
  section.dataset.ecran = "layers";
  section.append(el("h3", "tdc-titre-b", [text("Layers")]));
  section.append(el("p", "universe-note", [
    text("The base, then the layers stacked on it. A layer you switch off degrades the sheet — nothing you chose is erased, and it all comes back when you switch it on.")
  ]));

  const lignes = el("div", "tdc-lignes");

  /* LE SOCLE — un VOYANT, pas un interrupteur verrouillé (Eric, 09/09). Il
     n'y a rien en dessous : c'est la promesse du produit, « ce que tu
     construis reste ouvrable par n'importe qui ». La même lampe qu'au Menu. */
  const socle = voyant({ label: "SRD 5.2.1", note: "the core rules" });
  socle.dataset.socle = "true";
  lignes.append(socle);

  /* LE MAÎTRE — le MÊME geste que l'interrupteur de R (`requestLayerStack`) :
     un seul organe écrit « tout Fate's Hand », et la coquille confirme. */
  const maitre = interrupteur({
    label: "Fate's Hand", note: "all six layers at once", on: composition.maitre,
    onChange: (on) => onAction({ kind: "requestLayerStack", value: on ? "srdfh" : "srd" })
  });
  maitre.dataset.maitre = "true";
  lignes.append(maitre);
  /* ⚠️ LA CONFIRMATION DU MAÎTRE SE POSE SOUS LE MAÎTRE, PAS EN PIED — regardé
     au navigateur le 09/09 : posée en fin de section, elle tombait SOUS LE PLI
     (onze lignes, la dalle défile), et le joueur qui venait de basculer le
     maître ne voyait aucune question. `pendingStack` est un état de la
     coquille ; la question se montre là où le geste a été fait. */
  if (ctx.pendingStack) lignes.append(renderConfirmationPile(doc, ctx.query, onAction));

  lignes.append(el("p", "tdc-regle", [text("its six layers — each one switches off alone")]));
  for (const sw of INTERRUPTEURS) {
    const dort = Boolean(sw.exige) && !composition.enfants[sw.exige];
    const compte = recordsDe(pile, sw.couches);
    const note = dort ? sw.motSiDort : (compte === null ? sw.note : `${sw.note} · ${compte} records`);
    const enfant = interrupteur({
      label: sw.label, note, on: composition.enfants[sw.id] && !dort, disabled: dort,
      onChange: (on) => onAction({ kind: "requestLayerSwitch", id: sw.id, value: on })
    });
    enfant.dataset.enfant = sw.id;
    enfant.dataset.couches = sw.couches.join(" ");
    lignes.append(enfant);
  }

  /* ══ LE CATALOGUE — du contenu, pas des règles ═══════════════════════════
     Les livres du joueur : un livre MONTÉ est un interrupteur de catalogue ;
     un livre ABSENT du disque est une place réservée avec son mot — présente,
     éteinte, jamais cachée. ⛔ Un 404 n'est pas une erreur, c'est zéro livre
     (`engine.mjs`) ; un livre présent mais illisible, lui, dit sa raison. */
  lignes.append(el("p", "tdc-regle", [text("catalogue — content, not rules")]));
  const ids = idsDuDocument(doc);
  const refuses = Array.isArray(ctx.livresRefuses) ? ctx.livresRefuses : [];
  for (const livre of LIVRES_DU_JOUEUR) {
    const monte = pile ? pile.find((c) => c && c.id === livre.id) : null;
    const refus = refuses.find((r) => r && r.id === livre.id);
    if (monte) {
      const b = interrupteur({
        label: monte.name || livre.nom, note: `${monte.records} records, on this device`, on: ids.has(livre.id),
        onChange: (on) => onAction({ kind: "requestBookSwitch", id: livre.id, value: on })
      });
      b.dataset.livre = livre.id;
      lignes.append(b);
    } else {
      const b = ligneReservee(livre.nom, refus ? `unreadable: ${refus.raison}` : "not on this device");
      b.dataset.livre = livre.id;
      lignes.append(b);
    }
  }
  /* LE + HOMEBREW — inerte, un mot. Ce n'est pas câblé : c'est la porte
     homebrew de SOWLREACH, et c'est un autre lot. Une place réservée se voit. */
  const plus = ligneReservee("+ Homebrew content");
  plus.dataset.homebrew = "true";
  lignes.append(plus);
  section.append(lignes);

  return section;
}

/* Les deux constantes sont réexportées pour que le garde des listes n'ait
   qu'un import : les ids des livres viennent de `universe-step.mjs`. */
export { LIVRE_LAYER_IDS };
