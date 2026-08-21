/* ══ LES 22 FACES, LEUR DOS, ET LE PIÈGE DU MAPPING ═══════════════════════
   ⭐ VAGUE v8 — 2026-08-21. L'art d'Eric remplace le Tarot de Marseille, qui
   tenait l'écran depuis le 2026-08-14. Le manifeste d'alors l'avait annoncé
   mot pour mot : *« Marseille tient l'écran en attendant les 22 ; le
   remplacement est un échange de fichiers, l'écran ne change pas. »* C'est
   exactement ce qui vient de se passer — aucune ligne d'écran n'a bougé.

   CE GARDE TIENT QUATRE CHOSES :
     A. LES 22 ONT CHACUN LEUR FACE, et le dos existe — une image cassée au
        moment le plus théâtral de l'écran ne se rattrape pas.
     B. 🔴 LE MAPPING EST PAR NOM, ET LE PIÈGE RESTE ARMÉ (voir §B).
     C. LES FICHIERS SERVIS SONT CEUX QUI ONT ÉTÉ MESURÉS (sha256), ils sont
        en WebP, et le jeu complet reste sous son plafond.
     D. LE PROVISOIRE A PRIS FIN, et le manifeste doit le dire.

   ⚠️ SA LIMITE, INCHANGÉE : il ne REGARDE aucune image. Si le fichier nommé
   `VIII-Strength` contenait la Justice dessinée, il n'en saurait rien. Il
   garantit que la CHAÎNE de nommage est correcte de bout en bout. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "ui", "builder", "assets", "arcana");
const MESURE = JSON.parse(fs.readFileSync(path.join(ASSETS, "arcana.measured.json"), "utf8"));
const LAYER = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "fh-arcana-en.layer.json"), "utf8"));

const SLUGS = Object.keys(LAYER.records.arcana).map((id) => id.replace("fh:arcana:en:", ""));
const NUMERAUX = Object.fromEntries(
  Object.entries(LAYER.records.arcana).map(([id, r]) => [id.replace("fh:arcana:en:", ""), r.data.numeral])
);

/* ══ A — COUVERTURE : 22 ARCANES, 22 FACES, PAS UNE DE PLUS ══════════════ */

test("A — les 22 arcanes du moteur ont chacun leur face", () => {
  assert.equal(SLUGS.length, 22, "témoin : le moteur en publie bien 22");
  const manquants = SLUGS.filter((s) => !fs.existsSync(path.join(ASSETS, `${s}.webp`)));
  assert.deepEqual(manquants, [],
    "un arcane sans face afficherait une image cassée au moment le plus théâtral de l'écran");
});

test("A bis — et aucune face orpheline (une image qu'aucun arcane ne réclame)", () => {
  const fichiers = fs.readdirSync(ASSETS).filter((f) => f.endsWith(".webp") && f !== "back.webp");
  const orphelines = fichiers.filter((f) => !SLUGS.includes(f.replace(".webp", "")));
  assert.deepEqual(orphelines, [], "une image que personne n'affiche est du poids mort livré au joueur");
});

test("A ter — le DOS existe (B6.1b : la carte arrive DE DOS, c'est tout le geste)", () => {
  assert.ok(fs.existsSync(path.join(ASSETS, "back.webp")),
    "sans dos, il n'y a plus rien à retourner — l'écran perd sa raison d'être");
});

/* ══ B — 🔴 LE MAPPING, ET POURQUOI LE PIÈGE RESTE ARMÉ ══════════════════ */

test("B — 🔴 LA FORCE EST EN VIII ET LA JUSTICE EN XI, des deux côtés", () => {
  /* Le moteur suit Rider-Waite. Si le layer changeait d'ordre un jour, c'est
     ICI qu'on veut l'apprendre — pas devant un joueur perplexe. */
  assert.equal(NUMERAUX.strength, "VIII", "le moteur met la Force en VIII (Rider-Waite)");
  assert.equal(NUMERAUX.justice, "XI", "et la Justice en XI");

  /* ⭐ ET LES FICHIERS D'ERIC SONT DÉJÀ NUMÉROTÉS PAREIL. Le croisement que
     Marseille imposait n'a plus lieu d'être : la vague v8 s'aligne d'elle-même.
     Ce test cesse donc de prouver un échange et se met à prouver un ACCORD. */
  assert.match(MESURE.fichiers["strength.webp"].source, /^VIII-Strength/,
    "la Force vient du VIII d'Eric — son art est numéroté Rider-Waite");
  assert.match(MESURE.fichiers["justice.webp"].source, /^XI-Justice/,
    "et la Justice du XI");
});

test("B bis — ⚔️ LE PIÈGE RESTE ARMÉ POUR LA PROCHAINE VAGUE, et il faut qu'il le reste", () => {
  /* 🔴 LA TENTATION, ET C'EST ELLE QUE CE TEST REFUSE. Puisque la vague v8
     s'aligne toute seule, on pourrait conclure que le mapping par NUMÉRO est
     devenu sûr et simplifier. Il ne l'est pas : il est sûr POUR CETTE VAGUE.
     Marseille met la Force en 11 et la Justice en 8, et n'importe quelle
     source de tarot classique le fera aussi.
     ⛔ La règle « par nom, jamais par numéro » ne protège pas contre l'art
     d'aujourd'hui — elle protège contre celui de demain. Un garde qu'on retire
     parce qu'il ne trouve plus rien est un garde qu'on retire juste avant
     d'en avoir besoin. */
  const MARSEILLE = { strength: 11, justice: 8 };
  const MOTEUR = { strength: 8, justice: 11 };
  assert.notDeepEqual(MARSEILLE, MOTEUR,
    "témoin : les deux numérotations DIVERGENT bien — sinon la règle du mapping ne protégerait de rien");
  assert.match(MESURE._mapping, /jamais par num[ée]ro/i,
    "et la règle doit rester écrite là où on prépare les images");
});

test("B ter — chaque arcane déclare sa source, et le Mat porte « 0 »", () => {
  const sansSource = SLUGS.filter((slug) => !MESURE.fichiers[`${slug}.webp`]?.source);
  assert.deepEqual(sansSource, [], "chaque arcane doit déclarer d'où vient son image");
  /* `"0"`, une CHAÎNE : le layer écrit les numéraux en romain (« VIII »,
     « XI »), et le Mat en « 0 ». Mesuré en écrivant la version précédente de
     ce test — comparer à un nombre échouait, et c'est le genre d'écart qu'on
     veut voir ici plutôt que dans un `String()` complaisant au rendu. */
  assert.equal(NUMERAUX["the-fool"], "0");
  assert.match(MESURE.fichiers["the-fool.webp"].source, /^0-The-Fool/);
});

/* ══ C — LES FICHIERS SERVIS SONT CEUX QUI ONT ÉTÉ MESURÉS ═══════════════ */

test("C — chaque image servie correspond à son condensat (aucun remplacement en silence)", () => {
  const fautives = [];
  for (const [nom, m] of Object.entries(MESURE.fichiers)) {
    const sha = crypto.createHash("sha256").update(fs.readFileSync(path.join(ASSETS, nom))).digest("hex");
    if (sha !== m.sha256) fautives.push(nom);
  }
  assert.deepEqual(fautives, [],
    "remplacer une image sans remesurer, c'est exactement comme ça qu'on intervertit deux cartes sans le voir");
});

test("C bis — chaque fichier est bien un WebP, et le jeu complet reste sous son plafond", () => {
  /* ⭐ WEBP ET PAS JPEG, ET C'EST MESURÉ. L'art d'Eric est une mosaïque : des
     tesselles sur toute la surface, c'est-à-dire le pire cas pour un JPEG. À
     qualité et taille égales, 204 Ko en JPEG contre 100 Ko en WebP. Le WebP
     offre donc le DOUBLE de la résolution des faces de Marseille (480 px au
     lieu de 350) pour à peine plus de poids — et c'est déjà le format des
     fiches de classe et d'espèce. */
  let total = 0;
  for (const nom of Object.keys(MESURE.fichiers)) {
    const b = fs.readFileSync(path.join(ASSETS, nom));
    assert.equal(b.subarray(0, 4).toString("latin1"), "RIFF", `${nom} : en-tête RIFF attendu`);
    assert.equal(b.subarray(8, 12).toString("latin1"), "WEBP", `${nom} : conteneur WEBP attendu`);
    total += b.length;
  }
  /* Plafond à 3 Mo : mesuré à 2,4 Mo au 2026-08-21. Les masters font 2,5 Mo
     PIÈCE — au-delà de 3 Mo pour les 23, c'est qu'on a reperdu la compression. */
  assert.ok(total < 3 * 1024 * 1024,
    `les 23 fichiers pèsent ${Math.round(total / 1024)} Ko — au-delà de 3 Mo, la compression a sauté`);
});

/* ══ D — ⭐ LE PROVISOIRE A PRIS FIN ═════════════════════════════════════ */

test("D — le manifeste dit que le jeu n'est PLUS provisoire", () => {
  /* 🔴 CE TEST A CHANGÉ DE SENS LE 2026-08-21, et c'est ce qu'on lui demandait.
     Sa version précédente exigeait que le manifeste garde ÉCRIT son caractère
     provisoire — *« pour que personne ne prenne le provisoire pour du définitif
     six semaines plus tard »*. Les 22 sont arrivés au bout de sept jours. Le
     test garde maintenant l'inverse : que le remplacement soit daté et nommé,
     pour que personne ne croie regarder du Marseille. */
  assert.equal(MESURE._provisoire, undefined,
    "le champ `_provisoire` doit disparaître avec le provisoire qu'il annonçait");
  assert.match(MESURE._vague, /v8/, "le manifeste doit nommer la vague qu'il décrit");
  assert.match(MESURE._vague, /marseille/i,
    "et dire ce qu'elle remplace — sinon personne ne saura que l'écran a changé de mains");
  assert.equal(MESURE.mesure_le, "2026-08-21");
});
