/* ══ L'ÉTAPE CONCEPT — lot 54 ═══════════════════════════════════════════
   Le premier des deux derniers placeholders. Trois champs, à la racine du
   document : le nom (`document.name`, REQUIS par le schéma), le genre et
   l'alignement (`document.gender`/`document.alignment`, FACULTATIFS, texte
   libre — commande §2a).

   ── CE QUI ÉCRIT CES CHAMPS, ET POURQUOI CE N'EST PAS `doc.rename`/
   `doc.describe` DIRECTEMENT ────────────────────────────────────────────
   Le bloc `doc` REFUSE de se construire sans magasin (`store.mjs:83`), et le
   navigateur n'en a aucun (§1 de la commande — arbitrage ferme de
   l'architecte : pas de faux magasin en mémoire). `rename`/`describe` sont
   PURS (ni magasin ni bus, lots 47/48) mais vivaient enfermés dans la
   fermeture de `createDoc`. `src/doc/writers.mjs` (lot 54) les rend
   importables SEULS : `ctx.writers` est `createDocWriters({schema})`,
   construit UNE FOIS au boot (`shell.mjs`), jamais un `createDoc` ici — ce
   fichier n'en importe aucun (§3, test 7 de la commande, gardé par
   `tests/ui-writers.test.mjs`).

   ── L'ALIGNEMENT : NEUF SUGGESTIONS, ÉCRITES ICI — PAS DANS LE SCHÉMA
   (commande §2a, ⭐) ─────────────────────────────────────────────────────
   `identity.creatureType` a le même statut : « une chaîne libre EXPRÈS ».
   `<input list="…">` + `<datalist>` PROPOSE les neuf alignements SRD (même
   orthographe que `layers/srd-5.2.1-en.layer.json` : « Neutral », pas
   « True Neutral ») sans jamais les IMPOSER — taper autre chose
   (`Chaotic Good (mostly)`) reste possible, et `describe` ne le refuse pas
   (aucune `enum` au schéma).

   ── COMMIT SUR `change`, PAS SUR CHAQUE FRAPPE ──────────────────────────
   Même patron que `numberField` (`equipment-step.mjs`) : `render()`
   RECONSTRUIT toute la page (`app.innerHTML = ""`), donc un commit sur
   `input` perdrait le focus et la position du curseur à chaque lettre. Un
   champ libre commet sur `change` (perte de focus = validation), jamais
   avant.

   ── LE REFUS EST BRUYANT, JAMAIS UN SILENCE ─────────────────────────────
   `rename`/`describe` VALIDENT (décision D3 du bloc `doc`) : un nom vide,
   un nom de plus de 200 caractères, un genre/alignement de plus de 60
   caractères sont des refus NOMMÉS. `shell.mjs` les attrape et les pose
   dans `ctx.fieldErrors` — ce module les AFFICHE, il ne les invente ni ne
   les reformule (même discipline que `decisionRefusalWord`, `carnet.mjs`).
   Un refus laisse le document INCHANGÉ : le champ revient à sa dernière
   valeur valide au prochain rendu — jamais une valeur à moitié écrite. */


import { renderChoixGlisses } from "./glisser.mjs?v=411";
const ALIGNMENTS = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil"
];

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** Un champ texte libre, commis sur `change` — voir la tête de fichier.
 *  `datalistId`/`datalistOptions` sont optionnels (seul l'alignement les
 *  emploie) : un `<datalist>` SUGGÈRE, il ne restreint jamais ce que
 *  `<input>` accepte. */
function textField({ id, label, value, maxLength, ariaDescribedBy, error, datalistId, datalistOptions, onCommit }) {
  const wrap = el("div", "doc-field");

  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.className = "doc-field-input";
  /* 🔴 LE LIBELLÉ VIT DANS L'ENCART, PLUS AU-DESSUS — Eric, 2026-08-26 :
     *« Name peut figurer dans l'encart d'écriture, avant d'être remplacé par le
     nom du perso »*, puis : *« on gagne un champ »*.

     ⭐ ET C'EST EXACTEMENT CE QU'UN PLACEHOLDER EST FAIT POUR DIRE : il occupe
     la place de la réponse tant qu'il n'y en a pas, et il s'efface dès que le
     joueur écrit. Le mot « Name » n'a donc jamais besoin d'exister EN MÊME
     TEMPS que le nom du personnage — or c'est exactement ce qu'une étiquette
     au-dessus imposait : deux lignes pour une seule information, dont l'une
     devient redondante à la seconde où elle sert.
     📏 CE QUE ÇA REND AU BUDGET : l'étiquette pesait 17 px et son écart 4 —
     **21 px**, dans une carte à qui il en manque 62 pour tenir dans une hauteur
     d'iPhone SE.

     ⚠️ ⛔ ET IL GARDE SON NOM POUR QUI NE VOIT PAS L'ÉCRAN. Un `placeholder`
     n'est PAS une étiquette : les lecteurs d'écran ne s'engagent pas à
     l'annoncer, et il disparaît dès la première frappe. `aria-label` reste donc
     posé, et il porte le même mot. **Gagner une ligne à l'œil ne doit jamais se
     payer par un champ anonyme à l'oreille.** */
  input.placeholder = label;
  input.setAttribute("aria-label", label);
  input.value = typeof value === "string" ? value : "";
  if (typeof maxLength === "number") input.maxLength = maxLength;
  if (ariaDescribedBy) input.setAttribute("aria-describedby", ariaDescribedBy);
  if (error) input.setAttribute("aria-invalid", "true");
  if (datalistId) input.setAttribute("list", datalistId);
  input.addEventListener("change", () => onCommit(input.value));
  wrap.append(input);

  if (datalistId && Array.isArray(datalistOptions)) {
    const list = document.createElement("datalist");
    list.id = datalistId;
    for (const option of datalistOptions) {
      const opt = document.createElement("option");
      opt.value = option;
      list.append(opt);
    }
    wrap.append(list);
  }

  if (error) {
    const errorNode = el("p", "doc-field-error", [text(error)]);
    if (ariaDescribedBy) errorNode.id = ariaDescribedBy;
    errorNode.setAttribute("role", "alert");
    wrap.append(errorNode);
  }

  return wrap;
}

/**
 * @param {object} ctx
 * @param {object} ctx.document      le document `fh-char/1` courant (brouillon ou complet)
 * @param {object} ctx.writers       `createDocWriters({schema})` — `{rename, describe}`, PUR, aucun magasin
 * @param {object} [ctx.fieldErrors] le dernier refus par champ (`{name, gender, alignment}`), ou `null`/absent
 * @param {(action: {kind:"rename", name:string}|{kind:"describe", field:string, value:string}) => void} onAction
 */
/* ══ LES DEUX LISTES DÉROULANTES — Eric, 2026-08-19 ═════════════════════════
   *« Gender dropdown, champ à largeur limitée à 80/100 pixels. Alignment
   dropdown limitée à 80/100 pixels, bouton rules. »*

   ⭐ POURQUOI UN `<select>` ET PLUS UN `<input list>` : un champ libre invitait
   à écrire n'importe quoi dans un champ qui n'a que neuf réponses, et la
   `datalist` ne l'empêchait pas — elle SUGGÉRAIT. Le menu, lui, décide.

   ⚠️ ET LA VALEUR DÉJÀ ÉCRITE SURVIT, MÊME HORS LISTE. Un personnage sauvé
   avant ce lot peut porter « chaotic-ish » : la restreindre d'autorité
   l'effacerait au premier rendu, en silence. Elle entre donc dans le menu
   comme une option de plus, et le joueur la remplace s'il le veut. */
/* 🔴 « OTHER », PAS « SOMETHING ELSE » — Eric, 2026-08-26 : *« Man woman other
   sur une ligne, sinon pas cohérent »*.
   ⛔ CE QUI N'ALLAIT PAS N'ÉTAIT PAS LE NOMBRE DE JETONS PAR LIGNE — ils sont
   bien trois sur une ligne, mesuré. C'est le MOT qui se pliait : « Something
   else » fait 14 caractères, donc il passe sous `ABREGE_MAX` (16) et n'est pas
   abrégé — mais il ne tient pas dans les 77 px utiles d'une case à T1, et il
   se coupait en « Somethi / ng else ». Deux jetons à une ligne, un à deux : la
   rangée n'était plus homogène, et c'est ça, l'incohérence qu'Eric voit.
   ⭐ ET SA CONSIGNE EST LA BONNE PARADE, celle qu'il applique partout : un
   contenu qui ne tient pas, on demande ce qu'il porte EN TROP — jamais on ne
   rétrécit la case ni on n'ajoute une ligne. « Other » dit la même chose en
   cinq lettres.
   📌 ⛔ CE N'EST PAS UNE DONNÉE SRD : les trois genres sont un libellé
   d'interface, écrits ici et nulle part ailleurs. Les renommer ne touche
   aucune règle ni aucun contenu de jeu. */
const GENRES = ["Man", "Woman", "Other"];

/* ══ UN CHAMP DE DOCUMENT, RENDU COMME UN CHOIX GLISSÉ — Eric, 2026-08-19 ═══
   *« le drop-down c'est moche. Je préfère avoir du drag and drop quand il y a
   plus de deux choix, on va généraliser ça. »*

   ⛔ LA DIFFICULTÉ EST RÉELLE : `renderChoixGlisses` lit un PLAN du carnet
   (`answered`, `expected`, `options`, `selected`). Or le genre et l'alignement
   ne sont pas des choix de règle — ce sont des champs du document, écrits par
   `describe`. Aucun plan ne les décrit, et il ne DOIT pas y en avoir : le
   carnet juge des règles, pas une préférence de fiche.

   ⭐ ON DONNE DONC AU CHAMP LA FORME D'UN PLAN, ici, en local — et on traduit
   les gestes de l'organe en `describe`. L'organe partagé n'apprend rien du
   document, le document n'apprend rien du carnet, et les deux se rencontrent
   sur dix lignes qu'on lit d'un coup.

   ⚠️ LA RÈGLE D'ERIC A UN SEUIL : *« quand il y a plus de deux choix »*. Un
   champ à deux réponses n'a rien à gagner à un vivier — il a deux boutons. */
function champGlisse({ id, label, value, options, field, onAction }) {
  const courant = typeof value === "string" ? value : "";
  /* La valeur déjà écrite survit même hors liste : un personnage sauvé avant
     ce lot peut porter « Chaotic Good (mostly) », et la restreindre d'autorité
     l'effacerait en silence. */
  const liste = courant.length > 0 && !options.includes(courant) ? [...options, courant] : options;

  const plan = {
    path: id, status: courant ? "answered" : "pending",
    answered: courant ? 1 : 0, expected: 1, options: liste, selected: courant ? [courant] : []
  };
  const slot = { path: id, index: 0, options: liste, selected: courant ? [courant] : [], lock: null };

  /* LA TRADUCTION, ET C'EST TOUTE L'ADAPTATION : `set` écrit le champ, `clear`
     l'efface. Rien d'autre ne passe. */
  const relais = (action) => {
    if (action.kind === "set") onAction({ kind: "describe", field, value: action.value });
    else if (action.kind === "clear") onAction({ kind: "describe", field, value: "" });
  };

  /* 🔴 LE MOT DU COLLECTEUR N'EST PAS LE TITRE DE LA CARTE — Eric, 2026-08-26 :
     *« Identity : taille token = taille collecteur ! »*. Mesuré sur la page :
     le collecteur faisait **87 × 66** là où le token fait 87 × 48.

     ⛔ ET CE N'ÉTAIT PAS LA RÈGLE DE TAILLE QUI ÉTAIT FAUSSE — `min-height:
     var(--glisse-h)` vaut bien 48. C'est le CONTENU qui débordait, et
     l'arithmétique le dit sans ambiguïté : 8 de rembourrage + **35** de nom
     + 2 d'écart + 12 de valeur + 8 = 65. Le nom « Gender (optional) 1 » se
     pliait sur **trois lignes** dans 69 px de large.

     ⭐ ET IDENTITY ÉTAIT LE SEUL ÉCRAN DANS CE CAS, ce qui désignait le
     coupable : partout ailleurs le mot est court — `Skill`, `Choice`,
     `Mastery`, ou le sigle d'une caractéristique (`STR`). Ici, et ici seul, on
     passait **le titre de la carte** comme mot du collecteur. Deux métiers,
     une seule chaîne : le titre NOMME la question, le mot ÉTIQUETTE le
     récepteur — et un récepteur s'étiquette en un mot.
     ⚠️ Le `(optional)` n'est pas perdu : il reste dans `titre`, au-dessus, où
     il se lit une fois. Le répéter dans le collecteur, c'était le défaut « un
     nom écrit deux fois » que ce dépôt nomme ailleurs. */
  const motDuCreneau = label.replace(/\s*\([^)]*\)\s*$/, "").trim() || label;
  const bloc = renderChoixGlisses({ plan, slots: [slot], titre: label, mot: motDuCreneau, onAction: relais });
  const enveloppe = el("div", "doc-field", []);
  if (bloc) enveloppe.append(bloc);
  return enveloppe;
}

/** Lit une section du SRD par son SLUG, et rend `{titre, texte}` — ou `null`.
 *
 *  ⭐ POURQUOI CETTE FONCTION EXISTE AU LIEU D'UN APPEL EN LIGNE : elle est le
 *  seul endroit qui connaît la FORME d'une vue de couche (`view.record.data
 *  .description`). Trois niveaux de champs recopiés à chaque usage seraient
 *  trois occasions de se tromper en silence — une vue dont la forme change
 *  rendrait `undefined`, et `undefined` s'affiche comme un popup vide.
 *  ⛔ ELLE NE FABRIQUE RIEN : sans couche, sans entrée, ou sans description,
 *  elle rend `null`. C'est l'appelant qui décide quoi dire — jamais elle. */
function lireLaSectionSrd(query, slug) {
  if (typeof query !== "function") return null;
  const liste = query({ kind: "glossary" });
  if (!Array.isArray(liste)) return null;
  const vue = liste.find((v) => v && v.record && v.record.slug === slug);
  const texte = vue && vue.record && vue.record.data && vue.record.data.description;
  if (typeof texte !== "string" || texte.length === 0) return null;
  return { titre: vue.record.name || slug, texte };
}

function selectField({ id, label, value, options, onCommit, extra }) {
  const wrap = el("div", "doc-field", []);
  const lab = document.createElement("label");
  lab.className = "doc-field-label";
  lab.htmlFor = id;
  lab.append(document.createTextNode(label));
  wrap.append(lab);

  const rangee = el("div", "doc-field-rangee", []);
  const select = document.createElement("select");
  select.id = id;
  select.className = "doc-field-select";

  const courant = typeof value === "string" ? value : "";
  /* Le vide est une réponse : ces deux champs sont facultatifs. */
  const liste = ["", ...options];
  if (courant.length > 0 && !liste.includes(courant)) liste.push(courant);
  for (const option of liste) {
    const node = document.createElement("option");
    node.value = option;
    node.append(document.createTextNode(option === "" ? "—" : option));
    if (option === courant) node.selected = true;
    select.append(node);
  }
  /* ⚠️ LA VALEUR EST POSÉE EXPLICITEMENT, en plus de l'option `selected`. Un
     navigateur déduit l'une de l'autre ; le stub DOM de la suite, non — et
     c'est lui qui avait raison de le signaler : compter sur une déduction du
     moteur de rendu, c'est ne pas dire ce qu'on veut. */
  select.value = courant;
  select.addEventListener("change", () => onCommit(select.value));
  rangee.append(select);
  if (extra) rangee.append(extra);
  wrap.append(rangee);
  return wrap;
}

export function renderConceptStep(ctx, onAction) {
  const doc = ctx.document;
  const errors = ctx.fieldErrors || {};
  /* ⭐ LA COUCHE ARRIVE PAR LE CONTEXTE, comme partout ailleurs dans ce dépôt
     (`inheritance-step`, `class-step`, `catalogue` la reçoivent déjà). Cet
     écran ne l'avait jamais demandée parce qu'il n'affichait aucun contenu de
     règle — c'est ce qui change avec le livre de l'alignement.
     ⚠️ Elle peut manquer : le banc de tests monte cet écran sans couche, et
     c'est légitime — Identity se dessine entièrement sans SRD. `lireLaSectionSrd`
     rend alors `null`, et le livre le DIT au lieu d'inventer. */
  const ctxQuery = ctx.query;
  /* `dalle-intermediaire` — le voile à 50 %, pris à la matrice des dalles
     (lot 59) et jamais réécrit en couleur ici. */
  const section = el("section", "concept-step dalle-intermediaire");
  /* Il DIT son format, comme les dalles du parcours : un écran qui ne le
     déclare pas oblige à le déduire, et une déduction se trompe. */
  section.dataset.objet = "dalle";
  /* Le pied de la coquille s'accroche au bas de cette dalle (Eric, 2026-08-17 :
     *« Concept — DONE centré en bas au milieu »*). Une DÉCLARATION, pas une
     fabrication : voir `poserLaSortie` dans `shell.mjs`. */
  section.dataset.sortieIci = "true";

  section.append(textField({
    id: "concept-name",
    label: "Name",
    value: doc.name,
    maxLength: 200,
    error: errors.name,
    ariaDescribedBy: errors.name ? "concept-name-error" : null,
    onCommit: (value) => onAction({ kind: "rename", name: value })
  }));

  section.append(champGlisse({
    /* 🔴 PLUS DE « (optional) » SUR GENDER — Eric, 2026-08-26 : *« enlève
       optional sur gender »*.
       ⭐ ET LE MOT NE MANQUE PAS : ce champ EST facultatif, et l'écran le dit
       déjà mieux qu'une parenthèse — on peut passer `Done` sans y toucher, et
       rien ne le réclame. Un libellé qui répète une permission que l'interface
       accorde déjà est du bruit dans un titre.
       ⚠️ ALIGNMENT GARDE LA SIENNE : Eric n'a nommé que Gender, et décider
       pour les deux serait décider à sa place. La différence est visible à
       l'écran — c'est ce qui la rendra facile à trancher d'un mot. */
    id: "concept-gender", label: "Gender",
    value: doc.gender, options: GENRES, field: "gender", onAction
  }));

  /* ⏳ LE BOUTON `Rules` OUVRE UN POPUP — CE N'EST PAS SA FORME FINALE, ET
     ELLE EST DÉJÀ DÉCIDÉE. Eric, 2026-08-19, mis de côté par lui-même pour
     plus tard :

       *« rules devra à terme détacher un chapitre entier du player et
       l'afficher en FS avec un bouton de sortie, mais aussi un bouton qui
       permet d'ouvrir le player dans une autre fenêtre »*, et — précision du
       même jour — *« donc rules on recouvre tout »*.

     Donc : un chapitre ENTIER, en **FS**, qui **recouvre toute la scène**,
     avec DEUX portes — sortir (et retomber exactement ici), ou ouvrir le
     Player Companion dans une autre fenêtre.

     ⛔ CE QUI MANQUAIT POUR L'ÉCRIRE : il n'existait AUCUN chemin hors du
     builder — question n°1 des questions ouvertes, *« vers quoi exactement ? »*.

     ✅ ET ERIC Y A RÉPONDU LE 2026-08-26 : *« ou sur le site FH »*. La
     destination est donc nommée, et elle EXISTE — vérifié dans `fh-phb` :
     `docs/chapters/identity.md`, section `## Your alignment`, publiée à
     `https://noirchicot.github.io/fh-phb/chapters/identity/#your-alignment`.
     ⏳ CE QUI RESTE À DÉCIDER, ET QUI EST À LUI : ouvrir ce chapitre EN FS
     par-dessus la scène *(sa spec du 19/08 : « rules on recouvre tout »)*, ou
     dans une autre fenêtre. Les deux existent dans sa description ; laquelle
     est le geste PAR DÉFAUT n'a pas été tranché, et un lien qui sort du
     builder sans bouton de retour perdrait la place du joueur.

     📌 EN ATTENDANT, LE LIVRE OUVRE LA SECTION SRD, et ce n'est plus un
     pis-aller : c'est une source datée, versionnée, avec son attribution — pas
     deux phrases écrites par l'interface.

     ✅⭐ ET « PAR DÉFAUT SUR FH, SINON SRD » EST DÉJÀ CE QUE FAIT CE CODE —
     Eric, 2026-08-26 : *« par défaut sur FH, sinon SRD »* · *« ça c'est si on
     a fait le choix FH au début »*. Rien à câbler, et c'est vérifié :

       · le livre interroge la pile **PLIÉE** (`query`), jamais une couche
         nommée — il suit donc le choix `SRD` / `SRD + FH` du Menu, qui monte
         ou non les sept couches `fh-*` ;
       · le pli applique *« le dernier qui parle gagne »* (`stack.mjs`), et les
         couches FH sont montées APRÈS le SRD : une entrée FH de même id
         l'emporte, automatiquement.

     ⛔ CE QUI MANQUE N'EST DONC PAS DU CODE, C'EST DU CONTENU — mesuré le
     26/08 : les **sept** couches `fh-*` portent **zéro** entrée de glossaire.
     Le texte FH sur l'alignement existe, mais dans le LIVRE PUBLIÉ
     (`fh-phb/docs/chapters/identity.md`, `## Your alignment`), pas dans une
     couche. Le jour où il y entre, ce livre le servira sans qu'on touche à cet
     écran — et le joueur en `SRD` seul continuera de voir le SRD.
     ⚠️ ⛔ NE PAS RECOPIER CE TEXTE ICI EN ATTENDANT : ce serait refaire
     exactement la faute que ce lot répare. */
  /* 🔴 `Rules` EST DEVENU UN LIVRE, DANS LA RANGÉE — Eric, 2026-08-26 :
     *« Rules dégage sous forme d'un livre dans la rangée de boutons »*.

     ⛔ CE QU'IL ÉTAIT : un bouton libellé de **609 px de large**, pleine
     largeur, collé sous le menu d'Alignment — mesuré à l'audit du rang R. Il
     ne ressemblait à aucun autre bouton du site, et il occupait une ligne
     entière pour dire un mot.
     ⭐ ET LE REGISTRE DONNAIT DÉJÀ SA FORME : ce bouton OUVRE UN TEXTE. C'est
     la définition du livre — *« l'organe qui veut dire : le texte est là »*,
     rond, 22 px de dessin dans 44 de cible, la jumelle du `?`. Il n'y avait
     pas de forme à inventer, seulement une à reconnaître.
     ⚠️ CE QUI NE CHANGE PAS : il ouvre le MÊME popup, avec le MÊME texte. La
     note ⏳ ci-dessus reste entière — sa forme finale (un chapitre en FS qui
     recouvre tout) est décidée et attend toujours qu'un chemin hors du builder
     existe. On corrige son DESSIN, pas son destin. */
  const regles = document.createElement("button");
  regles.type = "button";
  regles.className = "fiche-livre livre-de-sortie";
  regles.setAttribute("aria-label", "Alignment rules");
  /* 🔴 LE LIVRE OUVRE LE SRD, PLUS UN TEXTE DE MOI — Eric, 2026-08-26 :
     *« connecte le livre à la section alignement dans le SRD »*.

     ⛔ CE QU'IL OUVRAIT : deux phrases que j'avais écrites. Elles n'étaient pas
     fausses, et c'est précisément le problème — **un texte de règle écrit dans
     l'interface est une règle publiée par l'interface**, sans source, sans
     version, sans empreinte. Le dépôt a un mot pour ça (§0.8) : on ne publie
     pas des nombres ni des règles dont on ne sait pas s'ils sont SRD.

     ⭐ ET LA SECTION EXISTE, ELLE, DEPUIS TOUJOURS : `glossary` /
     `srd:glossary:en:alignment`, 392 caractères, avec son attribution CC-BY et
     sa source (SRD 5.2.1, p. 176). Il n'y avait rien à écrire, seulement à
     brancher.

     ⚠️ ON LA CHERCHE PAR SON **SLUG**, PAS PAR SON ID. `srd:glossary:EN:…`
     porte la langue dans son identifiant : figer cet id ici, c'est câbler
     l'anglais dans un écran qui n'a aucune raison de le connaître — et la
     couche `srd-5.2.1-fr` existe déjà à côté. Le slug (`alignment`) est stable
     d'une langue à l'autre. */
  regles.addEventListener("click", () => {
    const entree = lireLaSectionSrd(ctxQuery, "alignment");
    if (!entree) {
      /* ⛔ ON NE REMPLACE PAS UNE SOURCE ABSENTE PAR UN TEXTE INVENTÉ — c'est
         exactement ce qu'on vient de retirer. Un livre qui ne trouve pas sa
         section le DIT : le joueur sait alors que le défaut est chez nous, et
         il ne repart pas avec une règle que personne n'a écrite. */
      onAction({ kind: "popup", role: "gendarme", titre: "Alignment",
        texte: "This rule text could not be loaded from the SRD." });
      return;
    }
    onAction({ kind: "popup", titre: entree.titre, texte: entree.texte });
  });

  const alignement = champGlisse({
    id: "concept-alignment", label: "Alignment (optional)",
    value: doc.alignment, options: ALIGNMENTS, field: "alignment", onAction
  });
  section.append(alignement);

  /* 🔴 LE LIVRE NE VIT PLUS AVEC SON CHAMP, IL VIT DANS LA RANGÉE — et c'est
     un renversement assumé de la note du 19/08 (*« il reste avec son champ :
     il explique CE choix-là »*). Elle était juste tant que le livre était un
     bouton libellé posé quelque part ; depuis qu'Eric a ratifié la PAIRE — le
     livre à gauche, le `?` à droite, aux deux bouts de la rangée de boutons —
     un livre posé ailleurs casse la paire.
     ⚠️ ET L'ÉCRAN NE PEUT PAS L'Y METTRE LUI-MÊME : la rangée est produite par
     la COQUILLE (`renderSortieEtape`), pas par cet écran — c'est le garde 17.
     Il le DÉCLARE donc, exactement comme il déclare `data-sortie-ici` : la
     coquille trouvera `.livre-de-sortie` dans l'hôte et le glissera en tête de
     la rangée qu'elle construit. **Le marqueur est une déclaration, pas une
     inférence** — même partage que `data-scroller` et `data-sortie-ici`. */
  section.append(regles);

  return section;
}

export { ALIGNMENTS };
