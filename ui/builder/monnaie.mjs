/* ══ LA MONNAIE — la bourse rend la monnaie, et chaque transaction s'annonce — lot 316, 2026-09-27 ══
   ⚖️ Eric, 27/09, mot pour mot : *« La bourse doit rendre la monnaie. Lorsqu'il y a une transaction.
   Qu'une petite animation qui persiste 1 seconde qui montre un +34gp & 2sp en vert, - 56gp & 5 sp
   en rouge. Cette animation doit persister d'un écran à l'autre. Car souvent quand une transaction
   est faite il y a une transition d'écran. »*

   🔴 CE QUI ÉTAIT FAUX : `bourseCouvre` comparait pièce par pièce. 114 GP sans argent ne payaient
   pas un objet à 5 SP (relevé au lot 315, vrai aussi dans X2) — une bourse qui ne sait pas casser
   une pièce d'or.

   ⛔ MODULE FEUILLE : aucun import. Le calcul (`payerAvecMonnaie`, `motDeLEcart`) est pur ; seule
   `annoncerLEcart` touche au DOM, et elle ne lit aucune cote : sa matière vit dans `shell.css`
   (`.bourse-ecart`). */

/** Les quatre pièces, de la plus petite à la plus grande, et leur valeur en cuivre (SRD). */
export const PIECES = Object.freeze([["cp", 1], ["sp", 10], ["gp", 100], ["pp", 1000]]);
const VALEUR = Object.freeze(Object.fromEntries(PIECES));

const n = (v) => (Number.isInteger(v) && v > 0 ? v : 0);

/** Une bourse (ou un coût) en pièces de cuivre. */
export function enCuivre(bourse) {
  if (!bourse) return 0;
  return PIECES.reduce((s, [k, v]) => s + n(bourse[k]) * v, 0);
}

/** La bourse peut-elle payer ce coût, monnaie rendue ? ⭐ C'est le TOTAL qui compte. */
export function peutPayer(bourse, cout) {
  if (!cout) return false;
  return enCuivre(bourse) >= enCuivre(cout);
}

/** PAYER, EN RENDANT LA MONNAIE. Rend la bourse d'après, ou `null` si elle ne couvre pas.
 *  ⭐ Trois temps, dans l'ordre où un joueur paie à la table :
 *   1. chaque pièce du prix se paie d'abord dans SA pièce (56 gp avec de l'or, 5 sp avec de
 *      l'argent) — la bourse garde sa composition quand elle le peut ;
 *   2. ce qui reste dû se paie avec la plus grosse pièce qui ne dépasse pas le reste ;
 *   3. s'il n'y en a plus, on CASSE la plus petite pièce qui couvre le reste, et la monnaie
 *      revient dans les pièces plus petites (une pièce d'or pour 5 sp rend 5 sp).
 *  ⛔ Jamais de négatif, jamais de bourse à moitié débitée : on calcule sur une copie. */
export function payerAvecMonnaie(bourse, cout) {
  if (!peutPayer(bourse, cout)) return null;
  const b = Object.fromEntries(PIECES.map(([k]) => [k, n(bourse && bourse[k])]));
  let du = 0;
  for (const [k, v] of PIECES) {
    const voulu = n(cout[k]);
    const pris = Math.min(b[k], voulu);
    b[k] -= pris;
    du += (voulu - pris) * v;
  }
  while (du > 0) {
    const assez = PIECES.find(([k, v]) => b[k] > 0 && v >= du);
    if (assez) {
      const [k, v] = assez;
      b[k] -= 1;
      let rendu = v - du;
      du = 0;
      /* la monnaie, dans les pièces plus petites que celle qu'on a cassée, les grosses d'abord */
      for (const [k2, v2] of [...PIECES].reverse()) {
        if (v2 >= v) continue;
        b[k2] += Math.floor(rendu / v2);
        rendu %= v2;
      }
    } else {
      const [k, v] = [...PIECES].reverse().find(([k2]) => b[k2] > 0);
      b[k] -= 1;
      du -= v;
    }
  }
  return b;
}

/** L'ÉCART EN MOTS — « +34 gp & 2 sp », « −56 gp & 5 sp ». ⭐ Le NET de la transaction, en
 *  gp · sp · cp (les grosses d'abord) : casser une pièce d'or pour payer 5 sp se dit « −5 sp »,
 *  pas « −1 gp & +5 sp » — le joueur lit ce que ça lui a coûté, pas la cuisine de la monnaie.
 *  `null` pour un écart nul. */
export function motDeLEcart(cuivre) {
  if (!Number.isFinite(cuivre) || cuivre === 0) return null;
  let reste = Math.abs(Math.trunc(cuivre));
  const morceaux = [];
  for (const [k, v] of [["gp", 100], ["sp", 10], ["cp", 1]]) {
    const q = Math.floor(reste / v);
    reste %= v;
    if (q) morceaux.push(`${q} ${k}`);
  }
  return `${cuivre > 0 ? "+" : "−"}${morceaux.join(" & ")}`;
}

/** La durée de l'annonce — ⚖️ « qui persiste 1 seconde ». */
export const DUREE_ANNONCE_MS = 1000;

/* ⚖️ LOT 317 — SOUS LA BOURSE. Eric, 27/09 : *« Fait arriver la notification de transaction sous
   la bourse »*. 🔄 Le lot 316 la posait en haut, au centre, sur `body` — pour qu'elle traverse les
   écrans sans s'ancrer à un organe qui disparaît.
   ⭐ LA RÉPONSE AUX DEUX DEMANDES À LA FOIS : l'annonce est un ÉTAT (ce qui suit), et c'est le
   MONTANT de la bourse — l'organe partagé par Gear, Pack, Wares, X2 et X5 (`montantDeLaBourse`)
   — qui la peint quand il naît. Un écran qui se reconstruit pendant la seconde la reprend donc
   SOUS SA bourse, là où l'animation en était (`currentTime`, jamais un style en ligne). */
let annonce = null;   /* { mot, sens, debut } — la dernière transaction, tant qu'elle dure */
const maintenant = () => Date.now();

/** L'annonce en cours, ou `null` si la seconde est passée. */
export function annonceEnCours(t = maintenant()) {
  return annonce && t - annonce.debut < DUREE_ANNONCE_MS ? annonce : null;
}

/** LE NŒUD DE L'ANNONCE, pour qui le demande — le montant de la bourse, à sa naissance. `null`
 *  s'il n'y a rien à dire. ⭐ Il reprend l'animation là où elle en est, et se retire seul à la fin
 *  de la seconde : un écran reconstruit à 600 ms montre les 400 ms qui restent, pas une seconde
 *  neuve. */
export function noeudDAnnonce(racine = typeof document !== "undefined" ? document : null) {
  const a = annonceEnCours();
  if (!a || !racine || typeof racine.createElement !== "function") return null;
  const n = racine.createElement("span");
  n.className = "bourse-ecart";
  n.dataset.sens = a.sens;
  n.setAttribute("role", "status");
  n.textContent = a.mot;
  const caler = () => {
    if (typeof n.getAnimations !== "function") return;
    for (const x of n.getAnimations()) x.currentTime = Math.min(DUREE_ANNONCE_MS, maintenant() - a.debut);
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(caler);
  setTimeout(() => n.remove(), Math.max(0, a.debut + DUREE_ANNONCE_MS - maintenant()));
  return n;
}

/** ANNONCER UN ÉCART : il devient l'annonce en cours, et chaque bourse déjà à l'écran la montre
 *  sous elle. ⛔ Une annonce neuve REMPLACE la précédente (deux achats d'affilée ne s'empilent
 *  pas). S'il n'y a aucune bourse à l'écran, elle se pose en haut, au centre, sur `body`
 *  (`data-place="haut"`) — le repli du lot 316. */
export function annoncerLEcart(cuivre, racine = typeof document !== "undefined" ? document : null) {
  const mot = motDeLEcart(cuivre);
  if (!mot || !racine) return null;
  annonce = { mot, sens: cuivre > 0 ? "gain" : "perte", debut: maintenant() };
  if (typeof racine.querySelectorAll === "function") {
    for (const vieille of racine.querySelectorAll(".bourse-ecart")) vieille.remove();
  }
  const montants = typeof racine.querySelectorAll === "function"
    ? [...racine.querySelectorAll('[data-organe="montant"]')] : [];
  let premier = null;
  for (const m of montants) {
    const n = noeudDAnnonce(racine);
    if (!n) break;
    m.append(n);
    premier = premier || n;
  }
  if (premier) return premier;
  if (!racine.body) return null;
  const n = noeudDAnnonce(racine);
  n.dataset.place = "haut";
  racine.body.append(n);
  return n;
}
