/* ══ LE GARDE DES ANCRAGES DU DRESSING (B3) ═══════════════════════════════════
   🔴 POURQUOI CE FICHIER EXISTE. Le 2026-08-24, j'ai signalé à Eric que trois de
   ses dix ancrages étaient posés dans une fenêtre de 16 à 20 unités, dont un
   SUR LE BORD même de la zone commune aux deux corps. Il a tranché : *« fige, tu
   m'as pas encore convaincu mais go »*.

   ⭐ C'EST SA DÉCISION ET ELLE EST LÉGITIME : ses dix points sont JUSTES
   aujourd'hui, mesurés et non supposés. Insister aurait été argumenter ; ce
   fichier fait mieux — il rend le risque DÉTECTABLE. Le jour où une silhouette
   change, ce test rougit au lieu de laisser l'écran poser un objet à côté d'un
   corps sans que personne ne s'en aperçoive.
   📌 C'est la loi du dépôt appliquée à un désaccord : *une condition que
   personne ne teste est une condition qui rouille.*
   ══════════════════════════════════════════════════════════════════════════ */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(ICI, "..", "ui", "builder");

const source = fs.readFileSync(path.join(UI, "b3-ancrages.mjs"), "utf8");
const zone = JSON.parse(fs.readFileSync(path.join(UI, "assets", "b3-zone-commune.json"), "utf8"));

/** ⛔ ON LIT LA DÉCLARATION, ON NE LA RECOPIE PAS. Recopier les dix coordonnées
 *  ici en ferait une seconde vérité, et le test finirait par éprouver autre
 *  chose que ce que l'écran affiche — exactement la faute qu'il surveille. */
function ancrages() {
  const bloc = source.slice(source.indexOf("export const ANCRAGES"));
  return [...bloc.matchAll(/clef:\s*"([a-z]+)"[^}]*x:\s*(\d+),\s*y:\s*(\d+)/g)]
    .map((m) => ({ clef: m[1], x: Number(m[2]), y: Number(m[3]) }));
}

/** La zone commune, ligne par ligne, en unités du repère. */
function segmentsA(y) {
  const i = y - zone.corps.y;
  if (i < 0 || i >= zone.lignes.length) return [];
  return zone.lignes[i];
}

test("B3 — les dix ancrages tombent sur les DEUX corps à la fois", () => {
  const liste = ancrages();
  assert.equal(liste.length, 10, "témoin : les dix emplacements sont bien lus dans la déclaration");

  const dehors = [];
  for (const a of liste) {
    const dedans = segmentsA(a.y).some(([g, d]) => a.x >= g && a.x <= d);
    if (!dedans) dehors.push(`${a.clef} (${a.x}, ${a.y})`);
  }
  assert.deepEqual(dehors, [],
    "⛔ un ancrage hors de la zone commune poserait un objet À CÔTÉ du corps sur " +
    "l'un des deux mannequins. Si une silhouette a changé, refaire `pantin-x.png` " +
    "et replacer le point — la parade connue est de le ramener au bord du TORSE, " +
    "où la tolérance passe de 0 à 110-145 unités.");
});

test("B3 — ⚔️ ATTAQUE : le garde mord vraiment (il ne passe pas parce qu'il ne lit rien)", () => {
  /* 🔴 SANS CETTE LIGNE, LE TEST DU DESSUS PASSERAIT SUR UNE ZONE VIDE. C'est le
     défaut qu'Eric nomme le plus souvent : *une suite verte ne prouve rien sur
     ce que personne n'importe.* On vérifie donc que la zone contient bien de la
     matière, et qu'un point manifestement dehors est bien refusé. */
  assert.ok(zone.lignes.some((l) => l.length > 0), "la zone commune n'est pas vide");
  const horsChamp = segmentsA(800).some(([g, d]) => 20 >= g && 20 <= d);
  assert.equal(horsChamp, false, "un point à x=20 est manifestement hors du corps, et le garde le voit");
});

test("B3 — les marges au bord sont relevées, y compris les trois serrées", () => {
  /* ⭐ CE TEST NE JUGE PAS, IL MESURE. Eric a choisi de garder trois ancrages
     serrés en connaissance de cause ; ce garde-ci ne les refuse pas, il tient le
     chiffre à jour pour que la décision reste éclairée si la donnée bouge.
     ⛔ Il n'impose donc AUCUN seuil : un seuil inventé ici deviendrait une règle
     qu'Eric n'a jamais posée. */
  const marges = {};
  for (const a of ancrages()) {
    const seg = segmentsA(a.y).find(([g, d]) => a.x >= g && a.x <= d);
    marges[a.clef] = seg ? Math.min(a.x - seg[0], seg[1] - a.x) : -1;
  }
  assert.ok(Object.values(marges).every((m) => m >= 0), "toutes les marges sont mesurables");
  /* Les trois que je sais serrées au 2026-08-24 — si l'une devient NÉGATIVE,
     c'est le test du dessus qui rougit, et il dit quoi faire. */
  for (const clef of ["avantbras", "mains", "doigts"]) {
    assert.ok(clef in marges, `${clef} est toujours déclaré`);
  }
});
