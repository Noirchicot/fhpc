/* ══ UN FAUX DROPBOX — lot 377 ═══════════════════════════════════════════════════════════════════
   ⭐ EXACTEMENT LA SURFACE HTTP QUE `ui/builder/dropbox.mjs` APPELLE, et rien de plus :
     · `POST https://api.dropboxapi.com/oauth2/token` (formulaire) — `authorization_code` avec PKCE,
       `refresh_token` ;
     · `POST https://api.dropboxapi.com/2/files/{list_folder, list_folder/continue, get_metadata, delete_v2}`
       (JSON) ;
     · `POST https://content.dropboxapi.com/2/files/{upload, download}` (`Dropbox-API-Arg`,
       `Dropbox-API-Result`).
   ⚖️ LES MODES D'ÉCRITURE SUIVENT LA SPÉCIFICATION OFFICIELLE (`files.stone`, `WriteMode`, `strict_conflict`),
   citée en tête de `dropbox.mjs` — y compris sa lecture la plus sévère : avec `strict_conflict`, un contenu
   IDENTIQUE est un conflit. Un faux plus indulgent que le vrai ferait passer au vert ce qui rougira chez
   Eric.
   ⭐ Il note chaque requête (`requetes`) : les gardes y cherchent un jeton, un secret, une adresse. */

import { webcrypto } from "node:crypto";

const API = "https://api.dropboxapi.com/2";
const CONTENU = "https://content.dropboxapi.com/2";
const JETON = "https://api.dropboxapi.com/oauth2/token";

function reponse(status, corps, entetes = {}) {
  /* 🔄 LOT 388 — un corps peut être des OCTETS (un livre) : `arrayBuffer` les rend tels quels. */
  const octets = corps instanceof Uint8Array ? corps : null;
  const texte = octets ? new TextDecoder().decode(octets) : typeof corps === "string" ? corps : corps === undefined ? "" : JSON.stringify(corps);
  const h = new Map(Object.entries(entetes).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    status, ok: status >= 200 && status < 300,
    headers: { get: (n) => (h.has(n.toLowerCase()) ? h.get(n.toLowerCase()) : null) },
    json: async () => JSON.parse(texte), text: async () => texte,
    arrayBuffer: async () => {
      const o = octets || new TextEncoder().encode(texte);
      return o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength);
    }
  };
}
const erreur409 = (resume) => reponse(409, { error_summary: resume, error: { ".tag": resume.split("/")[0] } });
const erreur401 = (tag) => reponse(401, { error_summary: `${tag}/`, error: { ".tag": tag } });

async function s256(verificateur) {
  const h = await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(verificateur));
  let s = ""; for (const o of new Uint8Array(h)) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fauxDropbox({ appKey = "fa6ljsyakrdv7eu", maxParPage = 2 } = {}) {
  let compteur = 0;
  const neuf = (prefixe) => `${prefixe}${(compteur += 1).toString(16).padStart(6, "0")}`;
  const fichiers = new Map();                 // chemin en minuscules → { chemin, texte, rev }
  const acces = new Map();                    // jeton d'accès → { expire: bool }
  const renouvellements = new Set();
  const codes = new Map();                    // code → { defi, redirect }
  const curseurs = new Map();
  const requetes = [];
  let portees = true;                         // les permissions de fichiers sont-elles accordées ?

  const autorise = (init) => {
    const a = (init.headers && init.headers.Authorization) || "";
    const jeton = a.startsWith("Bearer ") ? a.slice(7) : "";
    if (!acces.has(jeton)) return erreur401("invalid_access_token");
    if (acces.get(jeton).expire) return erreur401("expired_access_token");
    if (!portees) return erreur401("missing_scope");
    return null;
  };
  const parent = (chemin) => chemin.slice(0, chemin.lastIndexOf("/")) || "/";
  const metadonnees = (f) => ({ ".tag": "file", name: f.chemin.slice(f.chemin.lastIndexOf("/") + 1), path_lower: f.chemin.toLowerCase(), path_display: f.chemin, rev: f.rev });

  const emis = [];                            // TOUS les jetons jamais donnés — les gardes les cherchent partout
  const faux = {
    fichiers, requetes, emis,
    /** ce que Dropbox tient, lisible par un test */
    lire: (chemin) => { const f = fichiers.get(chemin.toLowerCase()); return f ? f.texte : null; },
    ecrireDirectement(chemin, texte) { const rev = neuf("r"); fichiers.set(chemin.toLowerCase(), { chemin, texte, rev }); return rev; },
    effacerDirectement(chemin) { for (const k of [...fichiers.keys()]) if (k === chemin.toLowerCase() || k.startsWith(`${chemin.toLowerCase()}/`)) fichiers.delete(k); },
    expirerLesJetons() { for (const v of acces.values()) v.expire = true; },
    revoquer() { acces.clear(); renouvellements.clear(); },
    retirerLesPortees() { portees = false; },
    /** LE JOUEUR, CHEZ DROPBOX — il lit l'adresse, dit oui, et Dropbox le renvoie avec un `code`. ⛔ Le vrai,
     *  personne ne le fait dans ce lot. Il VÉRIFIE ce que le vrai vérifie. */
    autoriser(adresse, { refuser = false } = {}) {
      const u = new URL(adresse);
      if (`${u.origin}${u.pathname}` !== "https://www.dropbox.com/oauth2/authorize") throw new Error(`pas l'adresse d'autorisation : ${u.origin}${u.pathname}`);
      const q = u.searchParams;
      if (q.get("client_id") !== appKey) throw new Error("client_id inconnu");
      if (q.get("response_type") !== "code" || q.get("code_challenge_method") !== "S256") throw new Error("pas PKCE S256");
      const retour = new URL(q.get("redirect_uri"));
      if (refuser) { retour.search = new URLSearchParams({ error: "access_denied", state: q.get("state") }).toString(); return retour.toString(); }
      const code = neuf("code-");
      codes.set(code, { defi: q.get("code_challenge"), redirect: q.get("redirect_uri") });
      retour.search = new URLSearchParams({ code, state: q.get("state") }).toString();
      return retour.toString();
    },
    async http(url, init = {}) {
      requetes.push({ url, headers: { ...(init.headers || {}) }, body: init.body, keepalive: init.keepalive === true });
      if (url === JETON) {
        const q = new URLSearchParams(init.body);
        if (q.get("client_id") !== appKey || q.has("client_secret")) return reponse(400, { error: "invalid_client" });
        if (q.get("grant_type") === "authorization_code") {
          const c = codes.get(q.get("code"));
          codes.delete(q.get("code"));
          if (!c || c.redirect !== q.get("redirect_uri") || c.defi !== (await s256(q.get("code_verifier") || ""))) return reponse(400, { error: "invalid_grant" });
          const a = neuf("acces-"); const r = neuf("renouv-");
          acces.set(a, { expire: false }); renouvellements.add(r); emis.push(a, r);
          return reponse(200, { access_token: a, expires_in: 14400, token_type: "bearer", refresh_token: r, account_id: "dbid:faux" });
        }
        if (q.get("grant_type") === "refresh_token") {
          if (!renouvellements.has(q.get("refresh_token"))) return reponse(400, { error: "invalid_grant" });
          const a = neuf("acces-"); acces.set(a, { expire: false }); emis.push(a);
          return reponse(200, { access_token: a, expires_in: 14400, token_type: "bearer" });
        }
        return reponse(400, { error: "unsupported_grant_type" });
      }
      const refus = autorise(init);
      if (refus) return refus;
      if (url.startsWith(CONTENU)) {
        const arg = JSON.parse(init.headers["Dropbox-API-Arg"]);
        const clef = arg.path.toLowerCase();
        if (url === `${CONTENU}/files/download`) {
          const f = fichiers.get(clef);
          if (!f) return erreur409("path/not_found/..");
          return reponse(200, f.octets || f.texte, { "Dropbox-API-Result": JSON.stringify(metadonnees(f)) });
        }
        if (url === `${CONTENU}/files/upload`) {
          const octetsDuCorps = init.body instanceof Uint8Array ? init.body : null;
          const texte = octetsDuCorps ? new TextDecoder().decode(octetsDuCorps) : init.body;
          const tenu = fichiers.get(clef);
          const strict = arg.strict_conflict === true;
          const ecrire = () => { const f = { chemin: arg.path, texte, octets: octetsDuCorps, rev: neuf("r") }; fichiers.set(clef, f); return reponse(200, metadonnees(f)); };
          const mode = arg.mode;
          if (mode === "overwrite" || (mode && mode[".tag"] === "overwrite")) return ecrire();
          if (mode === "add" || (mode && mode[".tag"] === "add")) {
            if (!tenu) return ecrire();
            if (tenu.texte === texte && !strict) return reponse(200, metadonnees(tenu));
            return erreur409("path/conflict/file/..");
          }
          if (mode && mode[".tag"] === "update") {
            if (!tenu) return strict ? erreur409("path/conflict/file/..") : ecrire();
            if (strict && tenu.texte === texte) return erreur409("path/conflict/file/..");
            if (tenu.rev === mode.update) return ecrire();
            if (tenu.texte === texte) return reponse(200, metadonnees(tenu));
            return erreur409("path/conflict/file/..");
          }
          return reponse(400, "mode inconnu");
        }
      }
      const corps = JSON.parse(init.body || "{}");
      if (url === `${API}/files/list_folder` || url === `${API}/files/list_folder/continue`) {
        let tous;
        if (url.endsWith("/continue")) { tous = curseurs.get(corps.cursor); if (!tous) return erreur409("reset/.."); }
        else {
          const dossier = corps.path.toLowerCase();
          tous = [...fichiers.values()].filter((f) => parent(f.chemin.toLowerCase()) === dossier).map(metadonnees);
          const sousDossier = [...fichiers.keys()].some((k) => k.startsWith(`${dossier}/`));
          if (!sousDossier) return erreur409("path/not_found/..");
        }
        const page = tous.slice(0, maxParPage);
        const reste = tous.slice(maxParPage);
        const cursor = reste.length ? neuf("curseur-") : "fin";
        if (reste.length) curseurs.set(cursor, reste);
        return reponse(200, { entries: page, cursor, has_more: reste.length > 0 });
      }
      if (url === `${API}/files/get_metadata`) {
        const f = fichiers.get(corps.path.toLowerCase());
        return f ? reponse(200, metadonnees(f)) : erreur409("path/not_found/..");
      }
      if (url === `${API}/files/delete_v2`) {
        const clef = corps.path.toLowerCase();
        const touches = [...fichiers.keys()].filter((k) => k === clef || k.startsWith(`${clef}/`));
        if (touches.length === 0) return erreur409("path_lookup/not_found/..");
        for (const k of touches) fichiers.delete(k);
        return reponse(200, { metadata: { ".tag": "file", path_lower: clef } });
      }
      return reponse(404, `inconnu : ${url}`);
    }
  };
  return faux;
}
