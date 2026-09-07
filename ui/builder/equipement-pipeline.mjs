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

import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=594";
import { pageDeListe } from "./normes.mjs?v=594";

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

/** « 25 GP » · « 2 sp » · « 1,500 GP » → { pp, gp, sp, cp }. Une chaîne sans
 *  montant lisible (ou « — ») rend null : l'objet n'a PAS de prix connu, et
 *  l'écran doit le dire au lieu d'afficher 0 (une absence n'est jamais 0). */
export function parseCout(chaine) {
  if (typeof chaine !== "string") return null;
  const m = chaine.replace(/,/g, "").match(/([\d.]+)\s*(pp|gp|sp|cp)/i);
  if (!m) return null;
  const cout = { pp: 0, gp: 0, sp: 0, cp: 0 };
  cout[m[2].toLowerCase()] = Number(m[1]);
  return cout;
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
 *  ⭐ Des COMPTES et une somme de poids de CATALOGUE (`data.weight`, « 1 lb. »),
 *  jamais un jugement : aucune capacité, aucun seuil, aucun rouge. */
export function poidsParLieu(lignes, chercheRecord) {
  const somme = { self: 0, backpack: 0, storage: 0 };
  const compte = { self: 0, backpack: 0, storage: 0 };
  for (const l of lignes) {
    const lieu = l.location || "backpack";
    compte[lieu] += l.quantity || 1;
    const rec = chercheRecord(l.ref);
    const m = rec && typeof rec.data?.weight === "string" ? rec.data.weight.replace(/,/g, "").match(/([\d.]+)\s*lb/i) : null;
    if (m) somme[lieu] += Number(m[1]) * (l.quantity || 1);
  }
  return { somme, compte };
}

function panneauPoids(poids, surLieu) {
  const p = elp("aside", "pipeline-poids");
  p.append(elp("h3", null, "Gear weight"));
  for (const [lieu, mot] of [["self", "Self"], ["backpack", "Backpack"], ["storage", "Storage"]]) {
    const ligne = bouton(
      `${mot} — ${poids.compte[lieu]} obj. · ${Math.round(poids.somme[lieu] * 10) / 10} lb`,
      "pipeline-poids-ligne",
      () => surLieu && surLieu(lieu),
      `Open ${mot}`
    );
    ligne.dataset.lieu = lieu;
    p.append(ligne);
  }
  return p;
}

/* ══ MY GOLD — la bourse en lecture, quatre clefs ══════════════════════════ */
function blocMyGold(bourse) {
  const b = elp("div", "pipeline-mygold");
  b.append(elp("h3", null, "My gold"));
  const rang = elp("p", "pipeline-mygold-rang");
  for (const k of ["pp", "gp", "sp", "cp"]) {
    rang.append(elp("span", null, `${k.toUpperCase()} ${bourse[k] ?? "—"}`));
  }
  b.append(rang);
  return b;
}

/* ══ B1 — LA FICHE D'UN OBJET (croquis IMG_6107) ════════════════════════════
   `liste` : les objets de la page de grille d'où on vient — le « 1/x avec
   flèches » navigue DEDANS sans repasser par R (vault §1). */
export function renderB1({ liste, index, bourse, onAction, naviguer, fermer }) {
  const ecran = elp("section", "pipeline-ecran pipeline-b1");
  ecran.dataset.ecran = "B1";
  let i = index;
  let qte = 1;
  const item = () => liste[i];

  const entete = elp("header", "pipeline-entete");
  entete.append(elp("h2", null, "Item description"));
  const compte = elp("p", "pipeline-compte", `${i + 1}/${liste.length}`);
  entete.append(compte);

  const corps = elp("div", "pipeline-b1-corps");
  const nomP = elp("p", "pipeline-b1-nom");
  const infosP = elp("p", "pipeline-b1-infos");
  const proseP = elp("p", "pipeline-b1-prose");
  corps.append(nomP, infosP, proseP);

  /* les flèches du croquis — deux ronds, coins hauts */
  const gauche = bouton("←", "pipeline-fleche", () => { i = (i - 1 + liste.length) % liste.length; peindre(); }, "Previous item");
  const droite = bouton("→", "pipeline-fleche", () => { i = (i + 1) % liste.length; peindre(); }, "Next item");

  const or = blocMyGold(bourse);

  /* PRICE (type in — rose au croquis : le joueur peut marchander) · QTY ± */
  const reglages = elp("div", "pipeline-reglages");
  const prixChamp = elp("input", "pipeline-typein");
  prixChamp.type = "text";
  prixChamp.setAttribute("aria-label", "Price");
  const qteChamp = elp("input", "pipeline-typein pipeline-qte");
  qteChamp.type = "text"; qteChamp.inputMode = "numeric";
  qteChamp.setAttribute("aria-label", "Quantity");
  qteChamp.addEventListener("change", () => {
    const n = parseInt(qteChamp.value, 10);
    qte = Number.isInteger(n) && n > 0 ? n : 1;
    peindre();
  });
  const plus = bouton("+", "pipeline-pas pipeline-pas-plus", () => { qte += 1; peindre(); }, "One more");
  const moins = bouton("−", "pipeline-pas pipeline-pas-moins", () => { qte = Math.max(1, qte - 1); peindre(); }, "One less");
  reglages.append(elp("span", "pipeline-libelle", "Price"), prixChamp,
    elp("span", "pipeline-libelle", "Qty"), qteChamp, plus, moins);

  /* SEND TO — les destinations INTERNES au personnage (le mandat exclut
     groupe, DM, companions ; le croquis les liste pour plus tard).
     ⭐ RÈGLE D'ERIC (24/08) : *« un item individuel, si pas de choix
     pertinent, ça peut aller au slot approprié, pockets, backpack »* — le
     défaut d'UN objet est donc la CASCADE (l'arbitre du pilote la joue :
     slot libre → poche libre → le sac). */
  const destRang = elp("div", "pipeline-sendto");
  destRang.append(elp("span", "pipeline-libelle", "Send to"));
  const dest = elp("select", "pipeline-dropdown");
  for (const [v, mot] of [["self", "Slot (auto)"], ["backpack", "Backpack"], ["storage", "Storage"]]) {
    const o = elp("option", null, mot); o.value = v; dest.append(o);
  }
  destRang.append(dest);

  const coutTotal = () => multiplieCout(parseCout(prixChamp.value) || item().cout, qte);
  const alerte = elp("p", "pipeline-alerte");

  function envoyer(payer) {
    const cout = coutTotal();
    if (payer) {
      if (!cout) { alerte.textContent = "No known price — use FREE, or type one."; return; }
      if (!bourseCouvre(bourse, cout)) { alerte.textContent = "Not enough coin in the purse."; return; }
      onAction({ kind: "payer", cout });
    }
    const destination = dest.value || "self";   /* item seul : la cascade */
    onAction({ kind: "addGearLine", ref: item().ref, quantity: qte,
      equipped: destination === "self", location: destination });
    fermer();
  }

  const pied = elp("div", "pipeline-pied");
  pied.append(
    bouton("BACK", "pipeline-bouton", fermer, "Back to catalogue"),
    bouton("CRAFT", "pipeline-bouton pipeline-inerte", () => {}, "Craft"),
    bouton("BUY", "pipeline-bouton", () => envoyer(true), "Pay, send, and return"),
    bouton("FREE", "pipeline-bouton", () => envoyer(false), "Send without paying"),
  );

  function peindre() {
    const it = item();
    compte.textContent = `${i + 1}/${liste.length}`;
    nomP.textContent = it.nom;
    infosP.textContent = [it.coutTexte || "no price", it.poidsTexte || ""].filter(Boolean).join(" · ");
    proseP.textContent = it.prose || "";
    prixChamp.value = it.coutTexte || "";
    qteChamp.value = String(qte);
    alerte.textContent = "";
  }
  peindre();
  if (naviguer) naviguer({ vers: (n) => { i = n; peindre(); } });

  ecran.append(entete, gauche, droite, corps, or, reglages, destRang, alerte, pied);
  return ecran;
}

/* ══ B2 — LE CART (croquis IMG_6108) · SB3.2 — LA MÊME LISTE, VUE DE B3 ═════
   `mode: "cart"` → BACK vers R, BUY paie ; `mode: "send"` (SB3.2) → BACK vers
   B3, SEND range des objets DÉJÀ à soi (aucun paiement), ⏳ FREE improvisé :
   la liste part SANS paiement (cadeau du DM, butin — le monde extérieur d'où
   les objets arrivent gratuitement). */
export function renderB2({ mode, lignes, bourse, onAction, retour, parPage = B2_LIGNES }) {
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
  const or = blocMyGold(bourse);
  const alerte = elp("p", "pipeline-alerte");

  /* ⭐ RÈGLE D\u2019ERIC (24/08) : *« si aucun destinataire, ça va dans backpack —
     surtout si c'est un panier »* — une LISTE se range, elle ne s'équipe pas
     d'un bloc ; le défaut est le sac. */
  const destRang = elp("div", "pipeline-sendto");
  destRang.append(elp("span", "pipeline-libelle", "Send to"));
  const dest = elp("select", "pipeline-dropdown");
  for (const [v, mot] of [["backpack", "Backpack"], ["self", "Slot (auto)"], ["storage", "Storage"]]) {
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
  const DESTS = [["self", "Worn"], ["backpack", "Backpack"], ["storage", "Storage"]];
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
