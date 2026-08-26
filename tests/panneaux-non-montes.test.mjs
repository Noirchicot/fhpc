import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { stripComments } from "./source-scan.mjs";

const DOSSIER = new URL("../ui/builder/", import.meta.url);
const SOURCES = readdirSync(DOSSIER)
  .filter((f) => f.endsWith(".mjs") && f !== "tutoriel.mjs")
  .map((f) => [f, stripComments(readFileSync(new URL(f, DOSSIER), "utf8"))]);

test("aucun écran ne monte un panneau de tutoriel — Eric, 26/08", () => {
  /* 🔴 Eric, 2026-08-26 : *« dégage le welcome aiguilleur de Identity, on y
     reviendra à la trilogie des guides mais après »*, puis *« le reste
     aussi »*, puis *« ne monte pas les panneaux ailleurs non plus »*.

     ⭐ CE GARDE EXISTE PARCE QUE LA CONSIGNE PORTE SUR L'AVENIR. Retirer trois
     lignes est facile ; ce qu'Eric demande, c'est qu'elles ne reviennent pas
     pendant que la trilogie des guides est en attente. Une consigne qui ne vit
     que dans une conversation n'existe pas : un lot qui lira `renderTutoriel*`
     dans `tutoriel.mjs` le croira disponible, et il aura raison de le croire —
     rien ne lui dira le contraire. C'est ce test qui le lui dit.

     ⛔ CE QU'IL N'INTERDIT PAS : le module `tutoriel.mjs` reste ENTIER, avec
     ses renderers, ses textes et ses tests. On ne supprime pas ce qui revient.
     Ce qui est refusé, c'est de le MONTER dans un écran.

     ⚠️ ET LE `?` N'EST PAS CONCERNÉ : Eric l'a explicitement sorti du standby
     le 26/08 — *« le point d'entrée au guide `?` doit être fait par contre »*.
     Ce garde ne nomme donc que les deux panneaux en flux. */
  const fautes = [];
  for (const [fichier, source] of SOURCES) {
    for (const nom of ["renderTutorielGeneral", "renderTutorielSpecifique"]) {
      /* On cherche un APPEL, pas un import : `shell.mjs` peut continuer de les
         importer sans les monter, et l'import seul ne peint rien à l'écran. */
      if (new RegExp(nom + "\\s*\\(").test(source)) fautes.push(`${fichier} appelle ${nom}()`);
    }
  }
  assert.deepEqual(fautes, [],
    "un écran monte un panneau de tutoriel alors que la trilogie des guides "
    + "est en attente — Eric : « ne monte pas les panneaux ailleurs non plus »");
});

test("⚔️ ATTAQUE — remonter un panneau fait rougir le garde", () => {
  /* Une interdiction qu'on ne voit jamais mordre n'interdit rien. */
  const mute = "card.append(renderTutorielGeneral({ ...TUTO_GENERAL }));";
  assert.match(mute, /renderTutorielGeneral\s*\(/,
    "témoin : c'est bien cette forme d'appel que le garde cherche");
  const propre = "import { renderTutorielGeneral } from './tutoriel.mjs';";
  assert.doesNotMatch(propre, /renderTutorielGeneral\s*\(/,
    "⭐ et un IMPORT seul ne doit pas rougir : importer n'est pas monter");
});
