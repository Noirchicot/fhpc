/* ══ LE DÉLAI THÉÂTRAL DE LA CARTE — LOT 77 ═══════════════════════════════

   Eric, 2026-08-15 : *« On doit avoir le temps de la voir entière avant
   qu'elle rapetisse. »* Puis, à la question « combien ? » : ***« 3 secondes »***.

   ⚠️ C'EST UNE RÉVISION DE SA PROPRE SPEC. `B6.1d` disait « le texte apparaît
   UNE SECONDE APRÈS le retournement ». À l'usage, une seconde produisait
   l'inverse de l'effet voulu, et le chiffre disait pourquoi :

     retournement 0,45 s → texte à 1 s → **550 ms de carte entière**,
     puis la fiche rétrécit D'UN COUP quand le texte prend sa place.

   ── 🔴 POURQUOI CE FICHIER EXISTE, ET CE QU'IL GARDE VRAIMENT ────────────
   Il ne garde PAS « 3000 ». Un chiffre seul n'a pas de raison, et c'est
   exactement la faute que cette séance a payée trois fois : une décision juste
   dont le motif expire sans que rien ne rougisse *(le `pending` du lot 43, le
   `proximity` du lot 58)*.

   Il garde **la CONDITION** : *le texte n'arrive jamais avant que le
   retournement soit fini, et il laisse un temps de contemplation.* Deux
   nombres qui doivent rester liés vivaient jusqu'ici dans deux fichiers sans
   se connaître — la durée du retournement en CSS, le délai du texte en JS.
   Changer l'un sans l'autre ne cassait aucun test.

   ⚠️ SA LIMITE, NOMMÉE : il lit une durée dans du CSS et une constante dans du
   JS. Il ne prouve pas que l'œil est content — ça, seul Eric le dit. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHELL_JS = stripComments(fs.readFileSync(path.join(ROOT, "ui/builder/shell.mjs"), "utf8"));
const SHELL_CSS = stripComments(fs.readFileSync(path.join(ROOT, "ui/builder/shell.css"), "utf8"));

/** Le délai du texte, lu dans la source — jamais recopié ici. */
export function delaiDuTexte(js) {
  const m = js.match(/DESTINY_REVEAL_MS\s*=\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

/** La durée du retournement, lue dans le CSS — en millisecondes. */
export function dureeDuRetournement(css) {
  const m = css.match(/\.card-face\s*\{[^}]*transition:\s*transform\s+([\d.]+)s/);
  return m ? Math.round(Number(m[1]) * 1000) : null;
}

test("A — le texte arrive APRÈS que le retournement soit fini, avec du temps devant", () => {
  const texte = delaiDuTexte(SHELL_JS);
  const flip = dureeDuRetournement(SHELL_CSS);
  assert.ok(Number.isInteger(texte), "sonde : DESTINY_REVEAL_MS est lisible dans la source");
  assert.ok(Number.isInteger(flip), "sonde : la durée du retournement est lisible dans le CSS");

  assert.ok(texte > flip,
    `le texte (${texte} ms) arriverait pendant le retournement (${flip} ms) — la carte n'aurait jamais été vue entière`);

  /* Le temps de CONTEMPLATION : ce qui reste une fois la carte posée. C'est le
     nombre qu'Eric a jugé, pas le délai brut. 550 ms lui ont paru trop courts ;
     il a demandé 3 s de délai, soit 2,55 s devant la carte. On exige au moins
     deux secondes — en dessous, on est retombé dans le défaut qu'il a signalé. */
  const contemplation = texte - flip;
  assert.ok(contemplation >= 2000,
    `il ne reste que ${contemplation} ms de carte entière — Eric a jugé 550 ms trop court et demandé ~2,5 s`);
});

test("B — la valeur est bien celle qu'Eric a demandée", () => {
  assert.equal(delaiDuTexte(SHELL_JS), 3000, "« 3 secondes » — Eric, 2026-08-15, révisant B6.1d");
});

test("⚔️ ATTAQUE — revenir à 1 s fait rougir la CONDITION, pas seulement le chiffre", () => {
  /* L'attaque qui compte : quelqu'un « restaure la spec » en relisant B6.1d,
     qui dit toujours une seconde quelque part. Le garde doit expliquer
     pourquoi ce n'est plus vrai, pas juste refuser. */
  const casse = SHELL_JS.replace(/DESTINY_REVEAL_MS\s*=\s*\d+/, "DESTINY_REVEAL_MS = 1000");
  const contemplation = delaiDuTexte(casse) - dureeDuRetournement(SHELL_CSS);
  assert.equal(contemplation, 550, "c'est le chiffre exact qu'Eric a trouvé trop court");
  assert.ok(contemplation < 2000, "et il tombe sous le seuil, donc le garde A rougirait");
});

test("⚔️ ATTAQUE — allonger le retournement sans toucher au délai rougit AUSSI", () => {
  /* L'autre moitié, et la vraie raison d'être de ce fichier : les deux nombres
     vivent dans deux fichiers différents. Rallonger l'animation CSS rogne le
     temps de contemplation sans qu'une seule ligne de JS change. */
  const casse = SHELL_CSS.replace(/(\.card-face\s*\{[^}]*transition:\s*transform\s+)[\d.]+s/, "$11.5s");
  const contemplation = delaiDuTexte(SHELL_JS) - dureeDuRetournement(casse);
  assert.equal(contemplation, 1500);
  assert.ok(contemplation < 2000, "le garde A rougirait — et c'est le CSS qui aurait bougé, pas le JS");
});
