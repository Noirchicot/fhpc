/* ══ LE CORPUS DES NORMES — trois portes, une seule loi ════════════════════

   Eric, 2026-08-29 : *« Ok que ça soit dans trois fichiers, mais l'application
   au builder est la même »*, puis *« application globale avec exceptions
   nommées, oui »*.

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER : que le corpus se DÉFASSE en
   silence. Il ne juge pas le contenu des règles — il juge que le dispositif
   qui les rend applicables tient debout :

     ① les trois fichiers existent et portent le même en-tête de corpus, donc
        celui qui en ouvre UN apprend que les deux autres le complètent ;
     ② les cotes que CADRES.md RECOPIE de la feuille correspondent encore à ce
        que la feuille déclare. C'est la seule duplication assumée du
        dispositif (CADRES §9 : *« une cote se change dans tokens.css et se
        recopie ici avec sa date »*), donc c'est la seule porte d'entrée d'une
        divergence — un chiffre changé d'un côté et pas de l'autre.

   ⛔ SA LIMITE : il ne lit pas un écran, et il ne dit pas qu'une règle est
   appliquée. Il dit que la LOI est lisible et cohérente avec elle-même. Ce
   sont les gardes d'organe (`collecteur-jeton.test.mjs`) et le banc à 360 qui
   jugent l'application. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");
const CORPUS = ["NORMES.md", "CADRES.md", "SOCLE.md"];

test("les trois fichiers du corpus existent et se déclarent tels", () => {
  for (const f of CORPUS) {
    const t = lire(f);
    assert.match(t, /CES TROIS FICHIERS SONT UN SEUL CORPUS/,
      `${f} ne porte pas l'en-tête de corpus : qui l'ouvre ne saura pas que ` +
      "les deux autres le complètent, et cherchera une règle là où elle n'est pas.");
    for (const autre of CORPUS.filter((x) => x !== f)) {
      assert.ok(t.includes(autre),
        `${f} ne cite pas ${autre} — trois portes, une seule loi.`);
    }
  }
});

test("une exception se nomme : aucun régime ne se devine par un compte d'enfants", () => {
  /* ⚔️ La règle d'Eric du 26/08 (« il y aura des exceptions, mais elles doivent
     être argumentées »), vérifiée là où elle se trahit le plus facilement : un
     `:nth-child(N)` qui range un écran selon le NOMBRE de ses items. Six
     créneaux ne font pas six caractéristiques. */
  const listes = stripComments(lire("listes.css"));
  const fautes = [...listes.matchAll(/([^{}]*):nth-child\(\s*\d+\s*\)([^{}]*)\{/g)]
    .map((m) => (m[1] + m[2]).replace(/\s+/g, " ").trim());
  assert.deepEqual(fautes, [],
    "un régime de rangement reconnu par un compte d'enfants : une exception " +
    "se NOMME (un attribut, une classe posée à la source), elle ne se devine " +
    "pas d'une structure qui peut changer.");
});

test("les cotes que CADRES recopie correspondent encore à la feuille", () => {
  /* ⚠️ LA SEULE DUPLICATION ASSUMÉE DU DISPOSITIF, donc la seule porte d'entrée
     d'une divergence. CADRES §9 l'écrit : *« deux sources d'accord valent mieux
     qu'une source unique qu'on oublie de lire — mais elles se citent, elles ne
     s'inventent pas »*. Ce test est ce qui rend « d'accord » vérifiable. */
  const tokens = stripComments(lire("tokens.css"));
  const cadres = lire("CADRES.md");

  /* La feuille déclare deux fois chaque largeur : le défaut (étroit) puis la
     grandeur Large, dans un @media. On lit les deux dans l'ordre du fichier. */
  const valeurs = (nom) => [...tokens.matchAll(
    new RegExp(`--${nom}\\s*:\\s*([^;]+);`, "g"))].map((m) => m[1].trim());

  /* ⭐ ON COMPARE CE QUE LA FEUILLE DÉCLARE À CE QUE LA TABLE ÉCRIT, sans
     supposer la forme de la table : on exige seulement que chaque valeur de la
     feuille se retrouve QUELQUE PART dans la section des cotes. Un garde qui
     exigerait une mise en page précise casserait au premier reformatage — et
     ce n'est pas la mise en page qu'on protège, c'est l'accord des chiffres. */
  const section = cadres.slice(cadres.indexOf("## 2 bis."),
                               cadres.indexOf("## 3."));
  for (const [nom, attendu] of [["card-w", ["76ch"]], ["panel-w", ["88ch"]],
                                ["grid-w", ["60ch", "76ch"]]]) {
    const dans = valeurs(nom);
    for (const v of attendu) {
      assert.ok(dans.includes(v),
        `tokens.css ne déclare plus --${nom}: ${v} (il porte ${dans.join(" · ")}). ` +
        "Si la cote a changé, CADRES §2 bis doit être recopié avec sa date.");
      const ch = v.replace("ch", "");
      assert.ok(section.includes(`${ch} ch`) || section.includes(`${ch}ch`),
        `CADRES §2 bis ne mentionne plus ${v} pour --${nom} : la table des ` +
        "cotes a divergé de la feuille.");
    }
  }

  /* Les deux cotes d'organe que le reste du corpus calcule à partir d'elles. */
  assert.match(tokens, /--touch:\s*44px/,
    "le seuil tactile a bougé : NORMES et CADRES calculent avec 44.");
  assert.match(tokens, /--glisse-case:\s*87px/,
    "le socle d'une case a bougé : la cote partagée des collecteurs le plafonne.");
});
