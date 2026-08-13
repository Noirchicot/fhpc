/* ══ LE GARDE DU DÉCOR — LOT 59 ═══════════════════════════════════════════

   CE QU'IL EXISTE POUR EMPÊCHER : qu'une image de fond entre, ou change, sans
   que personne ne remesure ce qu'elle fait au contraste. Le fond passe SOUS
   tout le texte des dalles de verre — c'est le seul élément du builder dont
   un remplacement silencieux peut rendre un écran illisible sans toucher une
   ligne de CSS.

   ⭐ LE PROBLÈME QU'IL FALLAIT RÉSOUDRE, ET LA SORTIE CHOISIE : ce dépôt
   n'a AUCUNE dépendance runtime (loi Q3), donc Node ne sait pas décoder un
   JPEG et le garde ne peut pas relire les pixels. La sortie n'est pas de
   renoncer à mesurer — c'est de LIER la mesure au fichier :

     · `ui/builder/assets/backgrounds.measured.json` porte, pour chaque
       image, son **sha256** et ses **deux pixels extrêmes** (le plus sombre
       et le plus clair de la zone réellement vue, après le flou cuit) ;
     · ce garde recalcule le **sha256 du fichier servi** et exige qu'il
       corresponde. Remplacer une image sans remesurer FAIT ROUGIR ;
     · puis il recalcule le **contraste WCAG** depuis ces deux extrêmes, pour
       chaque encre et chaque voile, en lisant les valeurs dans `tokens.css`.
       Changer `--voile-simple`, ou une encre, ou la surface, refait donc
       toute l'arithmétique.

   🔴 SA LIMITE, ÉCRITE ICI PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : il ne
   décode aucune image. Si la mesure enregistrée est FAUSSE, il la croira —
   il garantit la CORRESPONDANCE entre un fichier et une mesure, jamais la
   justesse de la mesure elle-même. C'est pourquoi les deux pixels extrêmes
   sont dans le JSON plutôt qu'un simple verdict : au moins l'arithmétique
   qui en découle est refaite ici, à chaque suite. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI_DIR = path.join(ROOT, "ui", "builder");
const ASSETS = path.join(UI_DIR, "assets");
const MESURE = JSON.parse(fs.readFileSync(path.join(ASSETS, "backgrounds.measured.json"), "utf8"));
const tokensCss = fs.readFileSync(path.join(UI_DIR, "tokens.css"), "utf8");
const shellCss = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8"));

/* Les jetons lus DANS le fichier, jamais recopiés : si la palette bouge, ce
   garde bouge avec elle. `tokens.css` déclare le jour avant le bloc sombre. */
const strippedTokens = stripComments(tokensCss);
const darkIndex = strippedTokens.indexOf("@media (prefers-color-scheme: dark)");
function props(text) {
  const map = new Map();
  for (const m of text.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  return map;
}
const JETONS = {
  jour: props(strippedTokens.slice(0, darkIndex)),
  nuit: new Map([...props(strippedTokens.slice(0, darkIndex)), ...props(strippedTokens.slice(darkIndex))])
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}
function relativeLuminance([r, g, b]) {
  const lin = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const [rl, gl, bl] = [r, g, b].map(lin);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}
function contrast(a, b) {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
/** Le fond EFFECTIF sous une dalle : `voile` de la surface, le reste de l'image. */
function sousLeVoile(surface, pixel, voile) {
  return [0, 1, 2].map((i) => voile * surface[i] + (1 - voile) * pixel[i]);
}

const THEMES = [
  { nom: "jour", fichier: "bg-day.jpg" },
  { nom: "nuit", fichier: "bg-night.jpg" }
];

/* ══ 1 — LES FICHIERS SERVIS SONT CEUX QUI ONT ÉTÉ MESURÉS ════════════════ */

for (const { nom, fichier } of THEMES) {
  test(`1 — ${fichier} : le fichier servi est EXACTEMENT celui qui a été mesuré (sha256)`, () => {
    const bytes = fs.readFileSync(path.join(ASSETS, fichier));
    const sha = crypto.createHash("sha256").update(bytes).digest("hex");
    assert.equal(sha, MESURE.fichiers[fichier].sha256,
      `${fichier} a changé sans être remesuré. Le fond passe SOUS tout le texte des dalles de verre : ` +
      "une image remplacée en silence peut rendre un écran illisible sans qu'une ligne de CSS bouge.");
  });

  test(`1bis — ${fichier} est bien un JPEG, et léger`, () => {
    const bytes = fs.readFileSync(path.join(ASSETS, fichier));
    /* Les octets magiques, pas l'extension : un PNG renommé `.jpg` passerait
       le nom et pèserait 1,9 Mo (mesuré sur les sources). */
    assert.equal(bytes[0], 0xFF, "octet magique JPEG attendu");
    assert.equal(bytes[1], 0xD8, "octet magique JPEG attendu");
    assert.ok(bytes.length < 120 * 1024,
      `${fichier} pèse ${Math.round(bytes.length / 1024)} Ko — au-delà de 120 Ko, c'est qu'on a reperdu ` +
      "le flou cuit ou le JPEG (les sources PNG faisaient 1,9 et 1,5 Mo pour la MÊME image)");
  });

  test(`1ter — ${fichier} : la mesure enregistrée dit ZÉRO pixel hors bande`, () => {
    const m = MESURE.fichiers[fichier];
    assert.equal(m.hors_bande, 0, `${m.hors_bande} pixels hors de la bande ${m.bande.join("–")}`);
    const [lo, hi] = m.bande;
    for (const [label, px] of [["le plus sombre", m.pixel_le_plus_sombre], ["le plus clair", m.pixel_le_plus_clair]]) {
      const v = Math.max(...px);
      assert.ok(v >= lo && v <= hi, `le pixel ${label} (${v}) sort de la bande ${lo}–${hi}`);
    }
  });
}

/* ══ 2 — LES TROIS VOILES SONT CEUX QU'ERIC A RATIFIÉS ════════════════════ */

test("2 — les trois voiles valent 35 / 50 / 100 % (le 35 arrêté le 2026-08-14, il valait 20)", () => {
  assert.equal(JETONS.jour.get("voile-simple"), "35%");
  assert.equal(JETONS.jour.get("voile-inter"), "50%");
  assert.equal(JETONS.jour.get("voile-majeure"), "100%");
});

test("2bis — les trois dalles existent en CSS et lisent leur voile, jamais un littéral", () => {
  /* Le CORPS de la règle, pas la règle entière : les trois dalles portent
     aussi leur rayon, et un motif qui exigeait un bloc d'une seule
     déclaration a rougi dès qu'on l'a ajouté (mesuré). Ce qui compte est que
     le fond vienne du jeton de voile, jamais d'un littéral. */
  const corpsDeLaRegle = (selecteur) => {
    const m = shellCss.match(new RegExp(`\\${selecteur}\\s*\\{([^}]*)\\}`));
    assert.ok(m, `la règle ${selecteur} doit exister dans shell.css`);
    return m[1];
  };
  assert.match(corpsDeLaRegle(".dalle-simple"), /background:\s*var\(--dalle-simple\)/);
  assert.match(corpsDeLaRegle(".dalle-intermediaire"), /background:\s*var\(--dalle-inter\)/);
  assert.match(corpsDeLaRegle(".dalle-majeure"), /background:\s*var\(--surface\)/);
  /* Et les deux surfaces de verre se dérivent de --surface par leur voile —
     une seule source pour la surface, comme `--accent-wash`. */
  assert.match(strippedTokens, /--dalle-simple:\s*color-mix\(in srgb, var\(--surface\) var\(--voile-simple\), transparent\)/);
  assert.match(strippedTokens, /--dalle-inter:\s*color-mix\(in srgb, var\(--surface\) var\(--voile-inter\), transparent\)/);
});

test("2ter — l'image de fond bascule avec le thème, et vient d'un jeton", () => {
  assert.match(shellCss, /background-image:\s*var\(--bg-image\)/,
    "shell.css ne doit nommer aucun fichier — l'image est un jeton, comme une couleur");
  assert.equal(JETONS.jour.get("bg-image"), 'url("./assets/bg-day.jpg")');
  assert.equal(JETONS.nuit.get("bg-image"), 'url("./assets/bg-night.jpg")');
});

/* ══ 3 — ⭐ LA MATRICE, RECALCULÉE ICI ════════════════════════════════════
   C'est le cœur du garde. Il refait l'arithmétique de la matrice écrite en
   tête de `shell.css` — depuis les jetons du fichier et les pixels extrêmes
   du JSON — et exige que les verdicts soient ceux-là. Changer un voile, une
   encre, la surface OU l'image refait donc tout le calcul.

   ⚠️ CE QU'IL AFFIRME EST DÉLIBÉRÉMENT DANS LES DEUX SENS : `--text` DOIT
   passer, et les trois autres NE DOIVENT PAS. Un garde qui n'exigerait que
   les réussites laisserait quelqu'un « réparer » `--text-muted` en montant
   le voile à 90 % — c'est-à-dire en supprimant le verre — sans rien casser.
   L'échec fait partie du contrat : il dit que le verre a un prix. */

const ENCRES = [
  { jeton: "text", cible: 4.5, doitPasser: true },
  { jeton: "text-soft", cible: 4.5, doitPasser: false },
  { jeton: "text-muted", cible: 4.5, doitPasser: false },
  { jeton: "border-strong", cible: 3.0, doitPasser: false },
  { jeton: "accent", cible: 4.5, doitPasser: false }
];

for (const { nom, fichier } of THEMES) {
  for (const voileNom of ["voile-simple", "voile-inter"]) {
    test(`3 — ${nom}, ${voileNom} : seul --text tient sur le verre`, () => {
      const jetons = JETONS[nom];
      const voile = Number(jetons.get(voileNom).replace("%", "")) / 100;
      const surface = hexToRgb(jetons.get("surface"));
      const m = MESURE.fichiers[fichier];

      for (const { jeton, cible, doitPasser } of ENCRES) {
        const encre = hexToRgb(jetons.get(jeton));
        /* Les DEUX extrêmes : selon que l'encre est plus claire ou plus
           sombre que le fond, le pire cas est l'un ou l'autre. */
        const pire = Math.min(
          contrast(encre, sousLeVoile(surface, m.pixel_le_plus_sombre, voile)),
          contrast(encre, sousLeVoile(surface, m.pixel_le_plus_clair, voile))
        );
        if (doitPasser) {
          assert.ok(pire >= cible,
            `--${jeton} tombe à ${pire.toFixed(2)}:1 sous ${voileNom} (${nom}) — cible ${cible}. ` +
            "Si --text ne tient plus sur le verre, plus RIEN ne tient : le verre n'a plus d'usage.");
        } else {
          assert.ok(pire < cible,
            `--${jeton} atteint ${pire.toFixed(2)}:1 sous ${voileNom} (${nom}), au-dessus de ${cible}. ` +
            "Si c'est vrai, la matrice de shell.css est PÉRIMÉE et doit être réécrite — " +
            "ne desserre pas ce test, corrige la matrice (et vérifie qu'on n'a pas simplement supprimé le verre).");
        }
      }
    });
  }

  test(`3bis — ${nom}, dalle MAJEURE : toutes les encres passent (c'est là qu'elles vivent)`, () => {
    const jetons = JETONS[nom];
    const surface = hexToRgb(jetons.get("surface"));
    for (const { jeton, cible } of ENCRES) {
      /* Voile 100 % : l'image ne traverse plus, on retombe exactement sur le
         cas que les gardes du lot 38 mesurent déjà. Ce test vérifie que la
         SORTIE existe — sans elle, la matrice interdirait sans rien offrir. */
      const pire = contrast(hexToRgb(jetons.get(jeton)), surface);
      assert.ok(pire >= cible, `--${jeton} ne tient que ${pire.toFixed(2)}:1 sur une dalle majeure (${nom})`);
    }
  });
}

/* ══ ⚔️ LES ATTAQUES ══════════════════════════════════════════════════════ */

test("⚔️ ATTAQUE — une image remplacée en douce fait rougir le garde 1", () => {
  const vrai = fs.readFileSync(path.join(ASSETS, "bg-day.jpg"));
  const truque = Buffer.concat([vrai, Buffer.from([0x00])]); // un octet de plus, rien de visible
  const sha = crypto.createHash("sha256").update(truque).digest("hex");
  assert.notEqual(sha, MESURE.fichiers["bg-day.jpg"].sha256,
    "un seul octet de différence doit suffire — c'est tout l'intérêt d'un condensat");
});

test("⚔️ ATTAQUE — revenir au voile de 20 % fait tomber --text-soft encore plus bas, et le garde le voit", () => {
  /* On rejoue le voile d'AVANT la décision d'Eric. Le test ne rougit pas
     (--text-soft doit échouer, et il échoue encore plus) — ce que l'attaque
     prouve, c'est le SENS : moins de voile = moins de contraste. C'est la
     thèse que le conseiller avançait le 2026-08-14, vérifiée ici en Node. */
  const jetons = JETONS.jour;
  const surface = hexToRgb(jetons.get("surface"));
  const m = MESURE.fichiers["bg-day.jpg"];
  const encre = hexToRgb(jetons.get("text"));
  const a20 = contrast(encre, sousLeVoile(surface, m.pixel_le_plus_sombre, 0.20));
  const a35 = contrast(encre, sousLeVoile(surface, m.pixel_le_plus_sombre, 0.35));
  assert.ok(a35 > a20,
    `monter le voile doit AUGMENTER le contraste du texte — mesuré ${a20.toFixed(2)} à 20 %, ${a35.toFixed(2)} à 35 %`);
});

test("⚔️ ATTAQUE — un fond hors bande ferait tomber --text sous la cible, et le garde 3 le verrait", () => {
  /* Une image dont le pixel le plus sombre serait à 60 (au lieu de 129) —
     c'est-à-dire hors de la bande 104–190 du thème clair. */
  const jetons = JETONS.jour;
  const surface = hexToRgb(jetons.get("surface"));
  const encre = hexToRgb(jetons.get("text"));
  const sain = contrast(encre, sousLeVoile(surface, MESURE.fichiers["bg-day.jpg"].pixel_le_plus_sombre, 0.35));
  const malade = contrast(encre, sousLeVoile(surface, [55, 58, 60], 0.35));
  assert.ok(sain >= 4.5, "témoin : le vrai fond passe");
  assert.ok(malade < sain, "un fond plus sombre en thème clair dégrade bien le contraste du texte sombre");
});
