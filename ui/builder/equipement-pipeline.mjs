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
   · le PANIER (pré-achat) = état de module, partagé par R, B2 et SB3.2 —
     *« SHOPPING LIST et CART sont la même chose vue de deux endroits »*
     (vault). ⏳ Il meurt au rechargement : il n'est pas encore au personnage,
     c'est un brouillon de courses.
   · le prix vient du RECORD (`data.cost`, une chaîne SRD « 25 GP ») ; l'écran
     le PARSE et le montre, il n'invente aucun tarif. La case prix de B1/B2
     est un TYPE IN (rose au croquis) : le joueur peut marchander à la main.

   ⛔ AUCUNE RÈGLE DE JEU : pas d'encombrance jugée, pas de plafond, pas de
   refus d'achat autre que « la bourse n'a pas assez » (une soustraction qui
   refuse de produire un négatif — l'écran le dit, il n'écrit rien). */

import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=291";

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

/* ══ LE PANIER — un seul, partagé (R le remplit, B2 et SB3.2 le montrent) ══
   ⚠️ ANCRÉ AU GLOBAL, ET C'EST MESURÉ : l'étape importe ce module avec
   `?v=N`, les suites sans — Node en fabrique alors DEUX instances, et un
   panier rempli d'un côté est vide de l'autre (payé le 24/08 : « BUY paie »
   rougissait sur un panier fantôme). Un module-état qui peut être instancié
   deux fois n'est un singleton que s'il s'ancre plus haut que lui. */
const COFFRE = globalThis.__fhpcPanierEquipement ??= { lignes: [], abonnes: new Set() };
const PANIER = COFFRE.lignes;
const ABONNES = COFFRE.abonnes;
function prevenir() { for (const f of ABONNES) f(); }

export function panierLignes() { return PANIER.slice(); }
export function panierCompte() { return PANIER.reduce((s, l) => s + l.qte, 0); }
export function panierAbonner(f) { ABONNES.add(f); return () => ABONNES.delete(f); }

export function panierAjouter({ ref, nom, cout }) {
  const deja = PANIER.find((l) => l.ref.id === ref.id);
  if (deja) { deja.qte += 1; prevenir(); return; }
  PANIER.push({ ref, nom, cout, qte: 1, gratuit: false });
  prevenir();
}
export function panierRetirer(id) {
  const i = PANIER.findIndex((l) => l.ref.id === id);
  if (i >= 0) PANIER.splice(i, 1);
  prevenir();
}
export function panierVider() { PANIER.length = 0; prevenir(); }
export function panierTotal() {
  return additionneCouts(PANIER.filter((l) => !l.gratuit).map((l) => multiplieCout(l.cout, l.qte)));
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
  const plus = bouton("+", "pipeline-pas", () => { qte += 1; peindre(); }, "One more");
  const moins = bouton("−", "pipeline-pas", () => { qte = Math.max(1, qte - 1); peindre(); }, "One less");
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
export function renderB2({ mode, bourse, onAction, retour, parPage = 4 }) {
  const ecran = elp("section", "pipeline-ecran pipeline-b2");
  ecran.dataset.ecran = mode === "send" ? "SB3.2" : "B2";
  let page = 0;

  const entete = elp("header", "pipeline-entete");
  entete.append(elp("h2", null, mode === "send" ? "Send list = cart" : "Cart"));
  const compte = elp("p", "pipeline-compte");
  entete.append(compte);
  const gauche = bouton("←", "pipeline-fleche", () => { page = Math.max(0, page - 1); peindre(); }, "Previous page");
  const droite = bouton("→", "pipeline-fleche", () => { page += 1; peindre(); }, "Next page");

  const listeHote = elp("div", "pipeline-lignes");
  const totalP = elp("p", "pipeline-total");
  const or = blocMyGold(bourse);
  const alerte = elp("p", "pipeline-alerte");

  /* ⭐ RÈGLE D'ERIC (24/08) : *« si aucun destinataire, ça va dans backpack —
     surtout si c'est un panier »* — une LISTE ne s'équipe pas d'un bloc, elle
     se range ; le défaut est donc le sac. */
  const destRang = elp("div", "pipeline-sendto");
  destRang.append(elp("span", "pipeline-libelle", "Send to"));
  const dest = elp("select", "pipeline-dropdown");
  for (const [v, mot] of [["backpack", "Backpack"], ["self", "Slot (auto)"], ["storage", "Storage"]]) {
    const o = elp("option", null, mot); o.value = v; dest.append(o);
  }
  destRang.append(dest);

  function envoyerTout(payer) {
    if (!PANIER.length) { alerte.textContent = "The list is empty."; return; }
    if (payer) {
      const total = panierTotal();
      if (!bourseCouvre(bourse, total)) { alerte.textContent = "Not enough coin for the whole cart."; return; }
      if (enGP(total) > 0) onAction({ kind: "payer", cout: total });
    }
    const destination = dest.value || "backpack";
    for (const l of PANIER) {
      onAction({ kind: "addGearLine", ref: l.ref, quantity: l.qte,
        equipped: destination === "self", location: destination });
    }
    panierVider();
    retour();
  }

  const pied = elp("div", "pipeline-pied");
  pied.append(
    bouton("BACK", "pipeline-bouton", retour, "Back to the dressing"),
    bouton("CRAFT", "pipeline-bouton pipeline-inerte", () => {}, "Craft"),
    mode === "send"
      ? bouton("SEND", "pipeline-bouton", () => envoyerTout(false), "Send the list")
      : bouton("BUY", "pipeline-bouton", () => envoyerTout(true), "Pay once for the whole cart"),
    bouton("FREE", "pipeline-bouton", () => envoyerTout(false), "Send without paying"),
  );

  function peindre() {
    const pages = Math.max(1, Math.ceil(PANIER.length / parPage));
    page = Math.min(page, pages - 1);
    compte.textContent = `${pages ? page + 1 : 1}/${pages}`;
    listeHote.textContent = "";
    for (const l of PANIER.slice(page * parPage, (page + 1) * parPage)) {
      const rang = elp("div", "pipeline-ligne");
      rang.append(elp("span", "pipeline-ligne-nom", l.nom));
      const qte = elp("span", "pipeline-ligne-qte", `×${l.qte}`);
      const plus = bouton("+", "pipeline-pas", () => { l.qte += 1; peindre(); prevenir(); }, `One more ${l.nom}`);
      const moins = bouton("−", "pipeline-pas", () => {
        l.qte -= 1;
        if (l.qte <= 0) panierRetirer(l.ref.id); else prevenir();
        peindre();
      }, `One less ${l.nom}`);
      const prix = elp("span", "pipeline-ligne-prix",
        l.gratuit ? "free" : formatCout(multiplieCout(l.cout, l.qte)));
      const libre = bouton("FREE", "pipeline-ligne-libre", () => { l.gratuit = !l.gratuit; peindre(); }, `Toggle ${l.nom} free`);
      libre.dataset.actif = l.gratuit ? "oui" : "non";
      rang.append(qte, plus, moins, prix, libre);
      listeHote.append(rang);
    }
    totalP.textContent = `Total (${panierCompte()} items) : ${formatCout(panierTotal())}`;
  }
  peindre();
  panierAbonner(peindre);

  ecran.append(entete, gauche, droite, listeHote, totalP, or, destRang, alerte, pied);
  return ecran;
}

/* ══ SB3.1 — BACKPACK · SB3.3 — STORAGE (⏳ L'IMPROVISATION DEMANDÉE) ═══════
   Le croquis SB3.3 redessine « BACKPACK » mais il n'est atteint QUE par
   Companions, exclu du mandat. Improvisé en STORAGE : le même écran, tourné
   vers la remise — et c'est lui qui complète les ÉCHANGES INTERNES :
   chaque ligne porte ses trois destinations, l'écran devient la plaque
   tournante self ↔ backpack ↔ storage. */
export function renderSacs({ lieu, lignes, chercheRecord, onAction, retour, surLieu, parPage = 8 }) {
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

  const DESTS = [["self", "Worn"], ["backpack", "Backpack"], ["storage", "Storage"]];

  function peindre() {
    const pages = Math.max(1, Math.ceil(ici.length / parPage));
    page = Math.min(page, pages - 1);
    compte.textContent = `${page + 1}/${pages}`;
    listeHote.textContent = "";
    if (!ici.length) listeHote.append(elp("p", "pipeline-vide",
      lieu === "storage" ? "Nothing stored." : "The backpack is empty."));
    for (const l of ici.slice(page * parPage, (page + 1) * parPage)) {
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
      listeHote.append(rang);
    }
  }
  peindre();

  const gauche = bouton("←", "pipeline-fleche", () => { page = Math.max(0, page - 1); peindre(); }, "Previous page");
  const droite = bouton("→", "pipeline-fleche", () => { page += 1; peindre(); }, "Next page");
  const pied = elp("div", "pipeline-pied");
  pied.append(bouton("BACK", "pipeline-bouton", retour, "Back to the dressing"));

  ecran.append(entete, gauche, droite, cadran, listeHote, pied);
  return ecran;
}
