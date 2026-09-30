/* ══ LOT 377 — DROPBOX : LE PREMIER STOCKAGE EN LIGNE ════════════════════════════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 377 dropbox.md` (ARCHI 35, 30/09).
   ⚖️ La carte produit, § 10 (29/09) : Dropbox en tête parce que *« la connexion se renouvelle seule »* ;
   *« le stockage choisi est le point de rencontre entre l'iPad, le téléphone et l'ordinateur »* ; *« l'app
   VÉRIFIE AVANT D'ÉCRIRE »*. La loi 3 : **aucun login sur le site, aucun secret stocké** — le compte,
   c'est le coffre du joueur.

   ── CE QUE CE MODULE PORTE, ET RIEN D'AUTRE ─────────────────────────────────────────────────────
     ① LA CONNEXION — OAuth 2 avec PKCE (S256), dans le même onglet, un jeton qui se renouvelle
        (`token_access_type=offline`). ⛔ AUCUN App secret, nulle part : le site n'en a pas.
     ② LE RETOUR — le `code` et le `state` quittent l'adresse AVANT tout le reste (`retirerLeRetour`,
        appelé en tête de la coquille) ; un `state` faux est refusé.
     ③ LE GARDIEN DES JETONS — sur l'appareil (les réglages de la base), jamais dans le document, une
        adresse, la console. ⭐ Vider le cache (`Save character`) ne touche pas la base : Dropbox reste
        connecté.
     ④ L'ADAPTATEUR — un lieu de l'organe (`magasin.mjs`) : il liste, remplace (sa révision est le `rev`
        de Dropbox), efface, écrit sans geste, et le joueur y possède ses octets.
   ⛔ `fetch`, `crypto`, `location` et `history` sont INJECTÉS : la logique se prouve sous Node contre un
   faux Dropbox qui a exactement la surface HTTP appelée ici (`tests/dropbox-377.test.mjs`).

   ── 📏 MESURÉ, PAS SUPPOSÉ (30/09) ─────────────────────────────────────────────────────────────
   · CORS — pré-requêtes `OPTIONS` (curl, sans jeton, `Origin: https://noirchicot.github.io`) : `list_folder`,
     `delete_v2`, `upload`, `download` → 200, `access-control-allow-origin` = l'origine, `Authorization`,
     `Content-Type` et `Dropbox-API-Arg` admis, `Dropbox-API-Result` EXPOSÉ ; `oauth2/token` → 200, `*`.
   · LE REFUS NATIF (§ 10, « à confirmer au lot ») — la spécification officielle
     (https://github.com/dropbox/dropbox-api-spec, `files.stone`, `WriteMode.update`) : *« Overwrite if the
     given "rev" matches the existing file's "rev". »* Sans `autorename`, un `rev` qui ne correspond pas
     rend l'erreur `path/conflict` (`WriteError.conflict`). Et `strict_conflict` : *« always return a
     conflict error when mode = WriteMode.update and the given "rev" doesn't match the existing file's
     "rev", even if the existing file has been deleted. »* ⇒ un perso effacé sur un autre appareil n'est
     jamais recréé en silence par une écriture d'ici. ⏳ La preuve vraie : l'essai d'Eric, deux appareils.
   · `keepalive` — le corps d'un envoi `keepalive` est plafonné (64 Kio pour TOUS les envois en vol ; Fetch
     Standard). Les exemples pèsent 31 et 19 Ko (ARCHI 35), une image peut dépasser : au-delà de
     `PLAFOND_KEEPALIVE`, l'envoi part SANS `keepalive` — il peut être coupé, et c'est la réouverture qui
     le rattrape et le DIT (la synchro voit l'app en avance sur le commun). ⚠️ Safari n'honore pas
     `keepalive`, et une vieille Chromium le refusait avec une pré-requête : la coquille réessaie alors
     sans lui (`httpDuNavigateur`). ⛔ Le passage en arrière-plan n'est donc jamais la seule chance. */

import { clefDeLEntree } from "./magasin.mjs?v=936";
import { RAYON_REGLAGES } from "./magasin.mjs?v=936";

/** ✅ L'App key de l'application SOWLREACH (Eric, 30/09, 13:14). ⭐ PUBLIQUE : elle voyage dans le code,
 *  comme une adresse. ⛔ L'App secret n'est ni demandé ni gardé. */
export const APP_KEY = "fa6ljsyakrdv7eu";
export const ADRESSE_AUTORISER = "https://www.dropbox.com/oauth2/authorize";
export const ADRESSE_JETON = "https://api.dropboxapi.com/oauth2/token";
const API = "https://api.dropboxapi.com/2";
const CONTENU = "https://content.dropboxapi.com/2";

/** ⚖️ LA DISPOSITION DANS `Apps/SOWLREACH/` (proposition du lot 377, au rapport) :
 *  · `/characters/<id>.fh-char.json` — la copie COURANTE d'un perso, trouvée par son `id` sans rien
 *    télécharger (un `list_folder` rend les `rev`) ;
 *  · `/versions/<id>/<clef datée>` — ses VERSIONS, une par Save, jamais écrasées, avec LA clef du dossier
 *    (`clefDeLEntree`) ; la poubelle retire le dossier entier en un appel. */
export const DOSSIER_COURANTS = "/characters";
export const DOSSIER_VERSIONS = "/versions";

/** L'`id` de ce lieu dans la table de Vault (`LIEUX`, magasin.mjs). */
export const LIEU = "dropbox";

/** Les clefs des réglages de l'app (la base IndexedDB, rayon `reglages`). */
export const CLEF_JETONS = "dropbox";
export const CLEF_CONNEXION = "dropbox-connexion";

/** En dessous de 64 Kio, pour laisser la place aux en-têtes et à un autre envoi en vol. */
export const PLAFOND_KEEPALIVE = 60000;
/** Un jeton d'accès se renouvelle une minute avant sa fin : jamais un envoi sur un jeton qui meurt en route. */
const MARGE_MS = 60000;

/* ══ LES MOTS — ⚠️ brouillons anglais à Eric. Chacun dit ce qui arrive ET nomme la sortie (loi § 0.5). */
export const MOT_DE_DROPBOX = "your Dropbox";
export const MOT_AILLEURS_DE_DROPBOX = "on another device";
export const MOT_DECONNECTE = "Dropbox no longer lets SOWLREACH in — open Vault and touch Dropbox to connect again";
export const MOT_HORS_LIGNE = "Dropbox could not be reached — are you offline?";
export const MOT_SANS_PERMISSION = "Dropbox has not yet given SOWLREACH permission to keep files — nothing was lost, your characters stay in this app";
export const MOT_ETAT_FAUX = "this answer did not come from the connection this app started — nothing was connected; touch Dropbox in Vault to try again";
export const MOT_DECLINE = "Dropbox was not connected. Nothing changed: your saves go where they went before";
export const MOT_CONNEXION_RATEE = "Dropbox did not complete the connection — touch Dropbox in Vault to try again";

/** Une panne de Dropbox, NOMMÉE : l'organe rend son `message` au joueur (`motDe`). */
export class PanneDropbox extends Error {
  constructor(genre, message) { super(message); this.name = "PanneDropbox"; this.genre = genre; }
}

/** LE `fetch` DU NAVIGATEUR, AVEC SON REPLI — ⚠️ `keepalive` : un navigateur qui le refuse avec une
 *  pré-requête CORS (vieille Chromium) JETTE ; l'envoi repart alors sans lui (voir la tête). ⛔ Une panne
 *  sans `keepalive` se rend telle quelle : l'adaptateur la dit (`MOT_HORS_LIGNE`). */
export function httpAvecRepli(fetchDuNavigateur) {
  return async (url, init) => {
    if (typeof fetchDuNavigateur !== "function") throw new PanneDropbox("hors-ligne", MOT_HORS_LIGNE);
    try { return await fetchDuNavigateur(url, init); } catch (cause) {
      if (init && init.keepalive) { const { keepalive: _, ...sans } = init; return fetchDuNavigateur(url, sans); }
      throw cause;
    }
  };
}

/* ══ ① LA CONNEXION — PKCE ═════════════════════════════════════════════════════════════════════ */

/** base64url sans remplissage (RFC 7636, annexe A). */
export function base64url(octets) {
  let s = "";
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** ⛔ JAMAIS `Math.random` : `crypto.getRandomValues`, et rien d'autre. */
export function auHasard(crypto, n) {
  if (!crypto || typeof crypto.getRandomValues !== "function") throw new PanneDropbox("refus", "this browser cannot draw a secure random number");
  const octets = new Uint8Array(n);
  crypto.getRandomValues(octets);
  return base64url(octets);
}

/** Le défi S256 : base64url(SHA-256(vérificateur)). */
export async function defiDe(crypto, verificateur) {
  const empreinte = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verificateur));
  return base64url(new Uint8Array(empreinte));
}

/** L'ADRESSE DE RETOUR — la page même, sans requête ni ancre. ⚠️ Dropbox la compare OCTET POUR OCTET à
 *  celle qu'Eric a enregistrée (`…/ui/builder/index.html`) : un dossier nu (`…/builder/`) prend donc son
 *  `index.html`. */
export function adresseDeRetour(location) {
  const chemin = location.pathname.endsWith("/") ? `${location.pathname}index.html` : location.pathname;
  return `${location.origin}${chemin}`;
}

/** PARTIR CHEZ DROPBOX — tire le vérificateur et le `state`, les garde SUR L'APPAREIL, et rend l'adresse.
 *  ⭐ C'est la coquille qui part (dans le clic), après avoir fait partir la sauvegarde en attente : la
 *  copie de travail est déjà écrite à chaque geste, rien de la fiche en cours ne se perd au retour.
 *  @returns {Promise<string>} */
export async function preparerLaConnexion({ crypto, base, location }) {
  const verificateur = auHasard(crypto, 32);                 // 43 caractères : le plancher de la RFC
  const etat = auHasard(crypto, 16);
  const retour = adresseDeRetour(location);
  await base.ecrire(RAYON_REGLAGES, CLEF_CONNEXION, { etat, verificateur, retour });
  const q = new URLSearchParams({
    client_id: APP_KEY,
    response_type: "code",
    code_challenge: await defiDe(crypto, verificateur),
    code_challenge_method: "S256",
    redirect_uri: retour,
    state: etat,
    token_access_type: "offline"
  });
  return `${ADRESSE_AUTORISER}?${q.toString()}`;
}

/* ══ ② LE RETOUR ═══════════════════════════════════════════════════════════════════════════════ */

const PARAMETRES_DU_RETOUR = ["code", "state", "error", "error_description"];

/** ⚖️ AVANT TOUT LE RESTE — le `code` et le `state` quittent l'adresse (`history.replaceState`) : ni
 *  l'historique, ni un lien copié, ni un rechargement ne les garde. Rend ce que Dropbox a répondu, ou
 *  `null` si la page n'est pas un retour de Dropbox. ⛔ Ne jette jamais : une page qui démarre ne meurt
 *  pas d'une adresse bizarre. */
export function retirerLeRetour(location, history) {
  let q;
  try { q = new URLSearchParams(location.search); } catch (_) { return null; }
  if (!q.has("state") || !(q.has("code") || q.has("error"))) return null;
  const retour = { code: q.get("code"), etat: q.get("state"), erreur: q.get("error") };
  for (const clef of PARAMETRES_DU_RETOUR) q.delete(clef);
  const reste = q.toString();
  try {
    history.replaceState(history.state, "", `${location.pathname}${reste ? `?${reste}` : ""}${location.hash || ""}`);
  } catch (_) { /* l'adresse reste : le `code` ne sert qu'une fois, et il est jeté ci-dessous */ }
  return retour;
}

/** TERMINER LA CONNEXION — vérifie le `state`, échange le `code` contre les jetons, les garde.
 *  ⛔ Le `state` et le vérificateur ne servent QU'UNE fois : ils sont effacés avant toute réponse.
 *  @returns {Promise<{etat:"connecte", lieu:string}|{etat:"decline", raison:string}|{etat:"refus", raison:string}>} */
export async function terminerLaConnexion({ retour, base, http, maintenant }) {
  let attendue = null;
  try { attendue = await base.lire(RAYON_REGLAGES, CLEF_CONNEXION); } catch (_) { attendue = null; }
  try { await base.effacer(RAYON_REGLAGES, CLEF_CONNEXION); } catch (_) { /* un seul usage, quoi qu'il arrive */ }
  if (!retour || !attendue || typeof attendue.etat !== "string" || attendue.etat === "" || retour.etat !== attendue.etat) {
    return { etat: "refus", raison: MOT_ETAT_FAUX };
  }
  if (retour.erreur) return retour.erreur === "access_denied" ? { etat: "decline", raison: MOT_DECLINE } : { etat: "refus", raison: MOT_CONNEXION_RATEE };
  if (typeof retour.code !== "string" || retour.code === "") return { etat: "refus", raison: MOT_CONNEXION_RATEE };
  let reponse;
  try {
    reponse = await http(ADRESSE_JETON, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: retour.code, grant_type: "authorization_code", client_id: APP_KEY,
        code_verifier: attendue.verificateur, redirect_uri: attendue.retour
      }).toString()
    });
  } catch (_) { return { etat: "refus", raison: MOT_HORS_LIGNE }; }
  if (!reponse.ok) return { etat: "refus", raison: MOT_CONNEXION_RATEE };
  let jetons;
  try { jetons = await reponse.json(); } catch (_) { return { etat: "refus", raison: MOT_CONNEXION_RATEE }; }
  if (!jetons || typeof jetons.access_token !== "string" || typeof jetons.refresh_token !== "string") {
    return { etat: "refus", raison: MOT_CONNEXION_RATEE };
  }
  await base.ecrire(RAYON_REGLAGES, CLEF_JETONS, {
    acces: jetons.access_token,
    expire: maintenant() + dureeDe(jetons.expires_in),
    renouvellement: jetons.refresh_token
  });
  /* ⭐ Le lieu que cette connexion ouvre est DIT par la donnée : la coquille le choisit sans nommer Dropbox. */
  return { etat: "connecte", lieu: LIEU };
}

function dureeDe(secondes) { return (Number.isFinite(secondes) && secondes > 0 ? secondes : 14400) * 1000; }

/* ══ ③ LE GARDIEN DES JETONS ═══════════════════════════════════════════════════════════════════ */

/** ⭐ Un jeton d'accès vit ~4 h ; le jeton de renouvellement le refait sans le joueur (§ 10 : « la
 *  connexion se renouvelle seule » — c'est ce qui rend la sauvegarde automatique possible). ⛔ Un refus du
 *  renouvellement (révoqué chez Dropbox) N'EST PAS un repli : les jetons morts partent, et chaque verbe
 *  dit `MOT_DECONNECTE`, qui nomme la sortie. */
export function gardienDesJetons({ base, http, maintenant }) {
  let renouvellementEnVol = null;
  const lire = async () => { try { return await base.lire(RAYON_REGLAGES, CLEF_JETONS); } catch (_) { return null; } };
  const renouveler = async (tenus) => {
    let reponse;
    try {
      reponse = await http(ADRESSE_JETON, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: tenus.renouvellement, client_id: APP_KEY }).toString()
      });
    } catch (_) { throw new PanneDropbox("hors-ligne", MOT_HORS_LIGNE); }
    if (reponse.status === 400 || reponse.status === 401) {
      try { await base.effacer(RAYON_REGLAGES, CLEF_JETONS); } catch (_) { /* ils sont morts de toute façon */ }
      throw new PanneDropbox("deconnecte", MOT_DECONNECTE);
    }
    if (!reponse.ok) throw new PanneDropbox("refus", `Dropbox did not answer (HTTP ${reponse.status})`);
    const neufs = await reponse.json();
    if (!neufs || typeof neufs.access_token !== "string") throw new PanneDropbox("refus", MOT_CONNEXION_RATEE);
    await base.ecrire(RAYON_REGLAGES, CLEF_JETONS, { ...tenus, acces: neufs.access_token, expire: maintenant() + dureeDe(neufs.expires_in) });
    return neufs.access_token;
  };
  return {
    async connecte() { const t = await lire(); return Boolean(t && typeof t.renouvellement === "string" && t.renouvellement !== ""); },
    /** Le jeton d'accès, renouvelé s'il meurt (ou si `force` : Dropbox l'a dit expiré). */
    async jeton({ force = false } = {}) {
      const tenus = await lire();
      if (!tenus || typeof tenus.renouvellement !== "string" || tenus.renouvellement === "") throw new PanneDropbox("deconnecte", MOT_DECONNECTE);
      if (!force && typeof tenus.acces === "string" && Number(tenus.expire) - MARGE_MS > maintenant()) return tenus.acces;
      /* ⭐ Deux verbes qui trouvent le jeton mort en même temps ne renouvellent qu'UNE fois. */
      if (renouvellementEnVol === null) {
        renouvellementEnVol = renouveler(tenus).finally(() => { renouvellementEnVol = null; });
      }
      return renouvellementEnVol;
    },
    async oublier() { try { await base.effacer(RAYON_REGLAGES, CLEF_JETONS); } catch (_) { /* rien à oublier */ } }
  };
}

/* ══ ④ L'ADAPTATEUR ════════════════════════════════════════════════════════════════════════════ */

/** Le nom de fichier d'un `id`. Le schéma permet `:` dans un `id`, que les systèmes de fichiers du joueur
 *  n'aiment pas : il devient `~`, que le schéma interdit — l'aller-retour est donc sans perte.
 *  ⛔ Un `id` hors du motif du schéma n'atteint jamais une adresse de Dropbox. */
const MOTIF_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export function nomDeLId(id) {
  if (typeof id !== "string" || !MOTIF_ID.test(id)) throw new PanneDropbox("refus", "this character has no usable id");
  return id.replace(/:/g, "~");
}
export function idDuNom(nom) {
  if (typeof nom !== "string" || !nom.endsWith(".fh-char.json")) return null;
  const id = nom.slice(0, -".fh-char.json".length).replace(/~/g, ":");
  return MOTIF_ID.test(id) ? id : null;
}
const cheminCourant = (id) => `${DOSSIER_COURANTS}/${nomDeLId(id)}.fh-char.json`;
const dossierDesVersions = (id) => `${DOSSIER_VERSIONS}/${nomDeLId(id)}`;

/** L'en-tête `Dropbox-API-Arg` exige un JSON sûr pour HTTP : tout hors ASCII s'y écrit `\uXXXX`. */
function argument(arg) {
  return JSON.stringify(arg).replace(/[\u007f-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

function octets(corps) { return typeof corps === "string" ? new TextEncoder().encode(corps).length : 0; }

/** Ce qu'une réponse d'erreur dit — `error_summary` (ex. `path/conflict/file/..`), jamais le corps entier. */
async function resumeDe(reponse) {
  try { const j = await reponse.json(); return j && typeof j.error_summary === "string" ? j.error_summary : ""; } catch (_) { return ""; }
}
async function genreDuRefus401(reponse) {
  try { const j = await reponse.json(); return j && j.error && typeof j.error[".tag"] === "string" ? j.error[".tag"] : ""; } catch (_) { return ""; }
}

/**
 * @param {object} p
 * @param {(url:string, init:object) => Promise<Response>} p.http   `fetch`, ou le faux Dropbox
 * @param {ReturnType<typeof gardienDesJetons>} p.jetons
 */
export function adaptateurDropbox({ http, jetons }) {
  /** UN APPEL — le jeton du gardien ; un jeton expiré se renouvelle UNE fois ; un jeton refusé se dit. */
  const appeler = async (url, { arg, corps, contenu, urgent = false } = {}) => {
    for (let essai = 0; essai < 2; essai += 1) {
      const jeton = await jetons.jeton({ force: essai > 0 });
      const headers = { Authorization: `Bearer ${jeton}` };
      let body;
      if (url.startsWith(CONTENU)) {
        headers["Dropbox-API-Arg"] = argument(arg);
        if (contenu !== undefined) { headers["Content-Type"] = "application/octet-stream"; body = contenu; }
      } else if (corps !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(corps);
      }
      const init = { method: "POST", headers };
      if (body !== undefined) init.body = body;
      if (urgent && octets(body) <= PLAFOND_KEEPALIVE) init.keepalive = true;
      let reponse;
      try { reponse = await http(url, init); } catch (_) { throw new PanneDropbox("hors-ligne", MOT_HORS_LIGNE); }
      if (reponse.status === 401) {
        const genre = await genreDuRefus401(reponse);
        /* ⚠️ `missing_scope` : les jetons sont BONS, c'est l'application qui n'a pas reçu ses permissions
           de fichiers (mesuré par ARCHI 35 le 30/09 : pas encore cochées). ⛔ On ne les jette pas. */
        if (genre === "missing_scope") throw new PanneDropbox("refus", MOT_SANS_PERMISSION);
        /* Expiré — ou refusé : un jeton d'accès se renouvelle UNE fois ; si Dropbox refuse encore, la
           connexion est morte, et elle se dit. */
        if (essai === 0) continue;
        await jetons.oublier();
        throw new PanneDropbox("deconnecte", MOT_DECONNECTE);
      }
      return reponse;
    }
    throw new PanneDropbox("deconnecte", MOT_DECONNECTE);
  };
  const panne = async (reponse) => {
    if (reponse.status === 409) {
      const resume = await resumeDe(reponse);
      if (/insufficient_space/.test(resume)) return new PanneDropbox("refus", "your Dropbox is full");
      return new PanneDropbox("refus", `Dropbox refused (${resume.replace(/\/\.*$/, "") || "409"})`);
    }
    if (reponse.status === 429) return new PanneDropbox("refus", "Dropbox asks to wait a moment");
    return new PanneDropbox("refus", `Dropbox did not answer (HTTP ${reponse.status})`);
  };
  /** Les noms d'un dossier (`not_found` = aucun : un dossier jamais créé n'est pas une panne). */
  const listerLeDossier = async (chemin) => {
    const noms = [];
    let reponse = await appeler(`${API}/files/list_folder`, { corps: { path: chemin } });
    if (reponse.status === 409) {
      const resume = await resumeDe(reponse);
      if (/not_found/.test(resume)) return noms;
      throw new PanneDropbox("refus", `Dropbox refused (${resume || "409"})`);
    }
    for (;;) {
      if (!reponse.ok) throw await panne(reponse);
      const page = await reponse.json();
      for (const e of Array.isArray(page.entries) ? page.entries : []) if (e && e[".tag"] === "file") noms.push({ nom: e.name, revision: e.rev });
      if (!page.has_more) return noms;
      reponse = await appeler(`${API}/files/list_folder/continue`, { corps: { cursor: page.cursor } });
    }
  };
  const revisionTenue = async (id) => {
    const reponse = await appeler(`${API}/files/get_metadata`, { corps: { path: cheminCourant(id) } });
    if (reponse.ok) { const m = await reponse.json(); return typeof m.rev === "string" ? m.rev : null; }
    if (reponse.status === 409) return null;
    throw await panne(reponse);
  };
  const effacerLeChemin = async (chemin) => {
    const reponse = await appeler(`${API}/files/delete_v2`, { corps: { path: chemin } });
    if (reponse.ok) return;
    if (reponse.status === 409 && /not_found/.test(await resumeDe(reponse))) return;   // déjà parti : c'est ce qu'on voulait
    throw await panne(reponse);
  };

  const adaptateur = {
    capacites: { liste: true, ecrase: true, efface: true, sansGeste: true, possede: true, rencontre: true,
      lieu: MOT_DE_DROPBOX, ailleurs: MOT_AILLEURS_DE_DROPBOX },

    async index() {
      return (await listerLeDossier(DOSSIER_COURANTS))
        .map(({ nom, revision }) => ({ id: idDuNom(nom), revision }))
        .filter((e) => e.id !== null);
    },

    async lire(id) {
      const reponse = await appeler(`${CONTENU}/files/download`, { arg: { path: cheminCourant(id) } });
      if (reponse.status === 409) {
        if (/not_found/.test(await resumeDe(reponse))) return null;
        throw new PanneDropbox("refus", "Dropbox could not give this character back");
      }
      if (!reponse.ok) throw await panne(reponse);
      let resultat = null;
      try { resultat = JSON.parse(reponse.headers.get("Dropbox-API-Result") || "null"); } catch (_) { resultat = null; }
      return { texte: await reponse.text(), revision: resultat && typeof resultat.rev === "string" ? resultat.rev : null };
    },

    /** ⚖️ La VERSION d'abord (un Save : `garder`), puis la COPIE COURANTE sur sa révision. Une version
     *  gardée n'est jamais écrasée (`add`), et un refus de la copie courante laisse une version de plus, pas
     *  un perso de moins. ⛔ `update` + `strict_conflict` : Dropbox refuse une révision périmée, et un
     *  fichier effacé ailleurs entre-temps (voir la tête). */
    async ecrire(id, texte, revision, document, { garder, urgent, courantAJour } = {}) {
      if (typeof garder === "string" && garder !== "") {
        const dossier = dossierDesVersions(id);
        const prises = new Set((await listerLeDossier(dossier)).map((n) => n.nom));
        const clef = clefDeLEntree(document, garder, prises);
        const r = await appeler(`${CONTENU}/files/upload`, {
          arg: { path: `${dossier}/${clef}`, mode: "add", autorename: false, mute: true }, contenu: texte
        });
        if (!r.ok) throw await panne(r);
      }
      /* ⭐ La copie courante tient déjà ce personnage (la coquille le sait par le repère commun) : rien ne
         part. ⚠️ Et c'est nécessaire, pas seulement sobre : `strict_conflict` fait d'un contenu IDENTIQUE
         un conflit (la spécification, voir la tête). */
      if (courantAJour === true && typeof revision === "string" && revision !== "") return { ok: true, revision };
      const mode = typeof revision === "string" && revision !== "" ? { ".tag": "update", update: revision } : "add";
      const reponse = await appeler(`${CONTENU}/files/upload`, {
        arg: { path: cheminCourant(id), mode, autorename: false, mute: true, strict_conflict: mode !== "add" },
        contenu: texte, urgent
      });
      if (reponse.ok) { const m = await reponse.json(); return { ok: true, revision: typeof m.rev === "string" ? m.rev : null }; }
      if (reponse.status === 409) {
        const resume = await resumeDe(reponse);
        if (/^path\/conflict/.test(resume)) return { ok: false, conflit: true, revision: await revisionTenue(id) };
        if (/insufficient_space/.test(resume)) throw new PanneDropbox("refus", "your Dropbox is full");
        throw new PanneDropbox("refus", `Dropbox refused (${resume || "409"})`);
      }
      throw await panne(reponse);
    },

    /** ⚖️ Le perso ENTIER : sa copie courante, puis toutes ses versions (Q1 b). */
    async effacer(id) {
      await effacerLeChemin(cheminCourant(id));
      await effacerLeChemin(dossierDesVersions(id));
    }
  };
  /* `tout` — lister AVEC le contenu, pour l'organe (`lister`). ⚠️ Il télécharge chaque perso : la synchro
     ne s'en sert pas (`revisions`), My characters lit la copie de l'app. */
  adaptateur.tout = async () => {
    const rangs = [];
    for (const { id, revision } of await adaptateur.index()) {
      const lu = await adaptateur.lire(id);
      if (lu) rangs.push({ id, texte: lu.texte, revision: lu.revision ?? revision });
    }
    return rangs;
  };
  return adaptateur;
}
