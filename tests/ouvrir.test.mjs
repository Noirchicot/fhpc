/* ══ OUVRIR UN PERSONNAGE DEPUIS UN FICHIER — `ui/builder/ouvrir.mjs` ══════
   2026-09-06. ⚖️ **LA LOI D'ERIC, ET C'EST ELLE QUI JUSTIFIE CE MODULE** :

   > *« La règle de FH : chacun est propriétaire de ses données. On passe par
   > l'app Fichiers, libre à moi de le mettre sur le cloud ou sur l'iPad ou
   > ailleurs. Sur desktop ou ailleurs, je choisis où je range mes persos. »*

   🔴 CE QUE ÇA RÉPARE, MESURÉ LE 06/09 : le builder sait SORTIR des octets
   (`fichier.mjs` — `Export JSON` écrit les octets canoniques du moteur) et
   **rien ne savait les relire**. `grep` sur tout `ui/` : zéro `FileReader`,
   zéro `type="file"`, zéro sélecteur. Un fichier qu'on ne peut pas rouvrir
   n'est pas une sauvegarde, c'est une impression. La loi d'Eric était donc
   écrite à moitié : on possédait ses données sans pouvoir y revenir.

   ⛔ CE MODULE NE JUGE PAS LE PERSONNAGE, ET C'EST LA MOITIÉ DU CONTRAT.
   Il vérifie qu'un fichier est **un document de ce builder** — rien de plus.
   Savoir si les choix tiennent encore sous les couches du jour est le métier
   du MOTEUR (`rebuild`, `validate`), qui le dit déjà et le dit mieux. Un
   second juge ici divergerait du premier le jour où une règle bouge — c'est
   le défaut « deux écrans qui disent la même chose » du lot 60, appliqué à la
   validation.

   ⭐ ET AUCUN REPLI SILENCIEUX (loi §0.5) : deux réponses NOMMÉES, `lu` et
   `refus`, et le refus porte un mot que le joueur peut lire. Un `null` qui
   voudrait dire « pas du JSON », « pas un personnage » et « fichier vide »
   forcerait l'appelant à inventer la raison — et il inventerait mal. */
import test from "node:test";
import assert from "node:assert/strict";

const { lireLeFichier, SCHEMA_ATTENDU } = await import("../ui/builder/ouvrir.mjs");

/** Le plus petit document que le builder reconnaisse comme un des siens. */
function personnage(extra = {}) {
  return JSON.stringify({
    schema: SCHEMA_ATTENDU, id: "x", name: "Ilyra", lang: "en",
    build: { choices: [], layers: [] }, ...extra
  });
}

test("un vrai fichier de personnage est LU, et rendu tel quel", () => {
  const issue = lireLeFichier(personnage());
  assert.equal(issue.etat, "lu");
  assert.equal(issue.document.name, "Ilyra");
  assert.equal(issue.document.schema, SCHEMA_ATTENDU);
});

test("🔴 CHAQUE REFUS PORTE SON MOT — et deux causes ne partagent jamais le même", () => {
  /* ⛔ C'est le cœur du module. Un refus qui ne nomme pas sa cause envoie le
     joueur chercher le défaut au mauvais endroit : « rien ne se passe » quand
     il a choisi une photo, « fichier illisible » quand c'est une fiche d'un
     AUTRE outil. Les mots doivent donc être DISTINCTS, pas seulement
     présents — et c'est ça qu'on mesure ici. */
  const cas = [
    ["vide", ""],
    ["pas du JSON", "<html>pas moi</html>"],
    ["du JSON qui n'est pas un objet", "[1, 2, 3]"],
    ["un objet sans schéma", JSON.stringify({ name: "x" })],
    ["le schéma d'un autre outil", JSON.stringify({ schema: "roll20/2", name: "x" })],
    ["notre schéma mais sans build", JSON.stringify({ schema: SCHEMA_ATTENDU, name: "x" })]
  ];
  const mots = [];
  for (const [quoi, texte] of cas) {
    const issue = lireLeFichier(texte);
    assert.equal(issue.etat, "refus", `« ${quoi} » doit être refusé`);
    assert.equal(typeof issue.raison, "string");
    assert.ok(issue.raison.trim().length > 0, `« ${quoi} » doit porter un mot`);
    mots.push(issue.raison);
  }
  assert.equal(new Set(mots).size, mots.length,
    "deux causes différentes rendent le même mot — le joueur ne saura pas laquelle il a :\n  " + mots.join("\n  "));
});

test("⭐ le refus du MAUVAIS OUTIL cite ce que le fichier prétend être", () => {
  /* Sans ça, « ce n'est pas un personnage Fate's Hand » laisse croire à un
     fichier corrompu, alors qu'il est parfaitement valide — ailleurs. */
  const issue = lireLeFichier(JSON.stringify({ schema: "roll20/2", build: {} }));
  assert.equal(issue.etat, "refus");
  assert.match(issue.raison, /roll20\/2/);
});

test("⛔ IL NE JUGE PAS LE PERSONNAGE : des choix que le moteur refusera passent quand même", () => {
  /* 🔴 C'est une FRONTIÈRE, pas une négligence. Un fichier gardé avant un
     changement de couche est un document PARFAITEMENT valide dont le moteur
     dira lui-même qu'il ne dérive plus. Le refuser ici priverait le joueur du
     seul écran qui sait le lui expliquer — et le message serait pire, parce
     qu'il viendrait d'un module qui ne sait rien des couches. */
  const issue = lireLeFichier(personnage({
    build: { choices: [{ path: "class", ref: { kind: "class", id: "fh:class:en:inexistante" } }], layers: [] }
  }));
  assert.equal(issue.etat, "lu", "le module laisse passer : c'est au moteur de refuser, et il le fait déjà");
});

test("un texte qui n'est pas une chaîne est refusé sans jeter", () => {
  for (const valeur of [null, undefined, 42, {}]) {
    const issue = lireLeFichier(valeur);
    assert.equal(issue.etat, "refus", `${String(valeur)} doit être refusé proprement`);
  }
});
