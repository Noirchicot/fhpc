/* ══ LE GARDE DU REMBOURRAGE D'UNE DALLE DE DESTINY — lot 138 ═════════════

   CE QU'IL EXISTE POUR EMPÊCHER, et il a ROUGI dessus avant d'être écrit :
   qu'une dalle du parcours soit rendue **sans le rembourrage de son rang**,
   pendant que ses sœurs le portent. C'est le défaut qu'Eric a vu à l'œil le
   2026-09-02 — *« pour le R. Sur la dalle, le texte est mal cadré. aucune
   marge au dessus en dessous et à droite »* — et que 1701 tests verts
   n'avaient pas attrapé.

   ⭐ POURQUOI IL NE NOMME PAS SES DALLES. Une liste de sélecteurs écrite à la
   main ne dit jamais qu'elle est incomplète : c'est exactement comme ça que le
   lot 116 a posé la cote sur `.card-final` et manqué `.card-porte`, à trente
   lignes de là, dans la même étape. Ce garde LIT donc `destiny-step.mjs` et
   récolte toute classe à qui le module écrit `dataset.objet = "dalle"`. Une
   troisième dalle ajoutée demain entre dans le garde toute seule.

   ⭐ ET POURQUOI IL NE CONNAÎT AUCUN CHIFFRE. La cote n'est pas recopiée ici :
   elle est LUE sur le témoin, `.parcours-guide` — la dalle du rang B qui rend
   Species, Inheritance et Class, et qui satisfait la norme depuis le 26/08.
   L'invariant que ce fichier épelle n'est donc pas *« 4 et 16 »*, c'est **« une
   dalle de Destiny se rembourre comme la dalle du rang B »**. Le jour où Eric
   change la cote sur le témoin, le garde suit sans qu'on le touche ; s'il la
   recopiait, il figerait la valeur d'aujourd'hui et deviendrait le mur que
   NORMES interdit.

   🔴 SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : il lit une
   DÉCLARATION dans la feuille, pas un rendu. Une règle plus spécifique posée
   ailleurs pourrait l'écraser sans qu'il rougisse — la cascade ne se teste pas
   par lecture (leçon `button.fiche-livre`, 02/09). Ce qu'il garantit est qu'on
   ne peut plus OUBLIER la cote ; que la cote gagne se regarde au navigateur. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
/* Le test F REND l'écran, il ne fait pas que lire sa source — un ordre
   d'organes ne se prouve pas en cherchant deux chaînes dans un fichier. Le
   module d'écran a donc besoin d'un `document`, comme dans
   `destiny-step.test.mjs`, et il doit exister AVANT son import. */
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const shellCss = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
const destinyJs = stripComments(fs.readFileSync(path.join(UI, "destiny-step.mjs"), "utf8"));

/** Toutes les règles de la feuille, avec le contexte `@` qui les enveloppe.
 *
 *  ⚠️ ÉCRIT COMME UN SCANNER, PAS COMME UNE EXPRESSION RÉGULIÈRE, et ça a
 *  coûté un aller-retour : une regex qui exige `{` juste après le sélecteur
 *  RATE toute règle écrite en liste — et le témoin de ce garde,
 *  `.parcours-guide`, est justement le premier de trois sélecteurs séparés par
 *  des virgules. Le garde rendait alors `null` pour lui et accusait la dalle
 *  réparée. **Un lecteur qui ne sait pas lire accuse le mauvais.**
 *
 *  ⭐ ET LE CONTEXTE `@` FAIT PARTIE DE L'IDENTITÉ D'UNE RÈGLE. La même
 *  déclaration au même sélecteur, une fois au premier niveau et une fois sous
 *  `@media (prefers-color-scheme: dark)`, n'est PAS un doublon : c'est
 *  l'idiome du thème. Sans ce contexte dans la clef, le garde D crierait au
 *  doublon sur des paires parfaitement légitimes. */
function reglesDeLaFeuille(css) {
  const regles = [];
  const contexte = [];
  let tete = "";
  let i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === "{") {
      const prelude = tete.trim().replace(/\s+/g, " ");
      tete = "";
      if (prelude.startsWith("@")) { contexte.push(prelude); i++; continue; }
      let j = i + 1, prof = 1;
      while (j < css.length && prof > 0) {
        if (css[j] === "{") prof++;
        else if (css[j] === "}") prof--;
        j++;
      }
      regles.push({
        sel: prelude,
        parts: prelude.split(",").map((p) => p.trim()).filter(Boolean),
        corps: css.slice(i + 1, j - 1).trim().replace(/\s+/g, " "),
        sous: contexte.join(" >> ")
      });
      i = j;
      continue;
    }
    if (c === "}") { contexte.pop(); tete = ""; i++; continue; }
    tete += c;
    i++;
  }
  return regles;
}

const REGLES = reglesDeLaFeuille(shellCss);

/** Le rembourrage qui GAGNE pour un sélecteur, au premier niveau de la feuille.
 *  `null` si aucune règle ne lui en pose. On rend la chaîne telle qu'écrite :
 *  deux dalles se comparent sur le MÊME texte, jamais sur deux nombres qu'on
 *  aurait résolus chacun de son côté (une bijection fausse est cohérente).
 *  ⚖️ La DERNIÈRE écriture l'emporte, comme dans la cascade à spécificité
 *  égale — prendre la première mentirait sur ce que le navigateur applique. */
function rembourrageDe(selecteur) {
  let dernier = null;
  for (const r of REGLES) {
    if (r.sous || !r.parts.includes(selecteur)) continue;
    const m = r.corps.match(/(?:^|;)\s*padding:\s*([^;}]+)/);
    if (m) dernier = m[1].trim().replace(/\s+/g, " ");
  }
  return dernier;
}

/** Les classes que `destiny-step.mjs` déclare être des dalles.
 *  On récolte `<var>.dataset.objet = "dalle"`, puis on remonte au `el(<tag>,
 *  "<classes>")` qui a créé CE `<var>` — la première classe est le sélecteur
 *  d'organe, les suivantes sont son décor (`dalle-simple`). */
function dallesDeclarees(source) {
  const trouvees = [];
  const marque = /(\w+)\.dataset\.objet\s*=\s*"dalle"/g;
  let m;
  while ((m = marque.exec(source)) !== null) {
    const variable = m[1];
    const avant = source.slice(0, m.index);
    const creation = [...avant.matchAll(
      new RegExp(`\\b${variable}\\s*=\\s*el\\(\\s*"[^"]+"\\s*,\\s*"([^"]+)"`, "g")
    )].pop();
    assert.ok(creation,
      `\`${variable}.dataset.objet = "dalle"\` sans création \`${variable} = el(tag, "classes")\` ` +
      "au-dessus — le garde ne peut pas deviner sous quel sélecteur cette dalle se style.");
    trouvees.push("." + creation[1].trim().split(/\s+/)[0]);
  }
  return trouvees;
}

test("A — le module Destiny déclare bien des dalles, et le garde les trouve", () => {
  const dalles = dallesDeclarees(destinyJs);
  /* ⛔ UN GARDE QUI NE TROUVE RIEN PASSE TOUJOURS. Si la forme d'écriture du
     module change (un `el()` renommé, une dalle posée autrement), la récolte
     rendrait une liste vide et les trois tests suivants deviendraient muets
     sans rougir — le repli silencieux que le dépôt interdit. On exige donc que
     la récolte trouve quelque chose, et on nomme ce qu'elle a trouvé. */
  assert.ok(dalles.length >= 2,
    `récolté ${dalles.length} dalle(s) dans destiny-step.mjs : ${JSON.stringify(dalles)}. ` +
    "L'étape en rend au moins deux — le R (la porte) et l'écran final. Une récolte plus " +
    "courte veut dire que la forme d'écriture a changé, pas que les dalles ont disparu.");
  assert.ok(new Set(dalles).size === dalles.length,
    `deux dalles portent le même sélecteur de tête : ${JSON.stringify(dalles)}`);
});

test("B — le témoin du rang B porte un rembourrage, et c'est LUI la cote", () => {
  /* 🔴 LE TÉMOIN SE VÉRIFIE AVANT DE SERVIR DE MESURE. Une mesure juste sur un
     témoin muet est une mesure fausse : si `.parcours-guide` cessait de poser
     `padding`, `rembourrageDe` rendrait `null` et la comparaison du test C
     réussirait sur `null === null`, en laissant passer DEUX dalles nues. */
  const temoin = rembourrageDe(".parcours-guide");
  assert.ok(temoin,
    "`.parcours-guide` — la dalle du rang B qui rend Species, Inheritance et Class — ne déclare " +
    "plus de `padding` dans shell.css. C'est elle qui porte la cote de référence (NORMES §4 ter) : " +
    "sans elle, ce garde n'a plus de témoin et ne mesure plus rien.");
  assert.match(temoin, /var\(--sp-\d+\)/,
    `\`.parcours-guide\` rembourre en « ${temoin} » — un littéral au lieu d'un jeton. ` +
    "NORMES §1 ter : la cote d'un contenant se lit sur un jeton partagé.");
});

test("C — CHAQUE dalle de Destiny se rembourre comme la dalle du rang B", () => {
  const temoin = rembourrageDe(".parcours-guide");
  for (const dalle of dallesDeclarees(destinyJs)) {
    const pose = rembourrageDe(dalle);
    assert.ok(pose !== null,
      `${dalle} est déclarée \`data-objet="dalle"\` par destiny-step.mjs et ne déclare AUCUN ` +
      "`padding` dans shell.css — donc 0 sur les quatre côtés : le titre touche le bord haut, le " +
      "texte touche les bords gauche et droit. C'est le défaut exact qu'Eric a relevé le 2026-09-02 " +
      `sur le R. La cote à poser est celle du témoin : « ${temoin} ».`);
    assert.equal(pose, temoin,
      `${dalle} rembourre en « ${pose} » là où la dalle du rang B rembourre en « ${temoin} ». ` +
      "Deux dalles du même parcours qui se cadrent différemment, c'est l'hétérogénéité qu'Eric " +
      "reproche au livre composite. Si l'écart est VOULU, il s'argumente à côté de sa règle " +
      "(NORMES : une exception se nomme) — et ce garde se rouvre pour le dire.");
  }
});

test("E — le R espace ses enfants par UN gap, et aucun d'eux ne pose de marge verticale", () => {
  /* ⛔ CE GARDE EXISTE POUR EMPÊCHER LE RETOUR DE LA FAUTE, pas pour figer une
     forme. Eric a dicté « marges sup et inf 8 blg » autour de la bande
     d'aiguilleur ; l'écrire EN MARGE sur la bande l'aurait ajoutée aux 8 que le
     paragraphe du dessus pose déjà — 16 en haut, 8 en bas. NORMES §4 ter a payé
     cette addition trois fois (« 32 = 16 + 16 »).
     ⭐ L'INVARIANT ÉPELÉ : dans cette dalle, l'écart a UN SEUL écrivain. Tant
     qu'il est vrai, aucune cote ne peut s'additionner à une autre — quel que
     soit le nombre d'organes qu'on ajoutera au R demain. */
  const dalle = REGLES.filter((r) => !r.sous && r.parts.includes(".card-porte"));
  assert.ok(dalle.length > 0, "la règle `.card-porte` doit exister dans shell.css");
  const corps = dalle.map((r) => r.corps).join(";");
  assert.match(corps, /gap:\s*var\(--sp-8\)/,
    "`.card-porte` doit poser son écart en `gap: var(--sp-8)` — c'est la cote " +
    "qu'Eric a dictée le 2026-09-02 pour la bande d'aiguilleur, et la poser une " +
    "seule fois sur le conteneur est ce qui empêche deux marges de s'additionner.");
  assert.match(corps, /flex-direction:\s*column/,
    "un `gap` ne s'applique qu'à une grille ou une boîte flexible — `.card-porte` " +
    "doit déclarer sa colonne, sinon l'écart est écrit et ne rend rien.");

  const remise = REGLES.find((r) => !r.sous && r.parts.includes(".card-porte > *"));
  assert.ok(remise && /margin-block:\s*0/.test(remise.corps),
    "`.card-porte > * { margin-block: 0 }` manque. Il neutralise la marge que les organes " +
    "VENUS D'AILLEURS portent (`.guide-mot` la tient du rang B) et à laquelle ils ne " +
    "peuvent pas renoncer pour un seul de leurs hôtes.");

  /* ⛔ ET VOICI CE QUE LA VERSION D'AVANT NE VOYAIT PAS, PAYÉ EN PRODUCTION.
     Elle s'arrêtait à la ligne ci-dessus : la remise à zéro EXISTE, donc vert.
     Mais `.card-porte > *` vaut (0,1,0) et `.card-porte-mot` aussi — et cette
     dernière était écrite DIX LIGNES PLUS BAS, donc elle gagnait. La v450 est
     partie en ligne avec trois écarts à 16 au lieu de 8.
     ⭐ UN GARDE QUI VÉRIFIE QU'UNE DÉCLARATION EXISTE NE DIT RIEN SUR QUI GAGNE.
     Celui-ci ne demande donc plus une neutralisation : il exige qu'il n'y ait
     RIEN À NEUTRALISER. Aucun enfant propre au R ne déclare de marge verticale,
     et alors ni l'ordre du fichier ni la spécificité ne peuvent trancher contre
     nous — il n'y a plus deux écrivains pour un même écart. */
  const coupables = REGLES
    .filter((r) => !r.sous && r.parts.some((p) => /^\.card-porte-[\w-]+$/.test(p)))
    .map((r) => {
      const m = r.corps.match(/(?:^|;)\s*margin(-block|-top|-bottom)?:\s*([^;}]+)/);
      if (!m) return null;
      const val = m[2].trim();
      /* `margin: 0` et `margin: 0 <x>` n'ont pas de composante verticale. */
      const parts = val.split(/\s+/);
      const vertical = m[1] === "-top" || m[1] === "-bottom" || m[1] === "-block"
        ? parts[0]
        : (parts.length >= 3 ? parts[2] : parts[0]);
      return /^0(px|blg)?$/.test(vertical) ? null : { sel: r.sel, val };
    })
    .filter(Boolean);

  assert.deepEqual(coupables, [],
    "un ou plusieurs enfants propres au R déclarent une marge verticale : " +
    JSON.stringify(coupables) + ". Elle S'AJOUTE au `gap` de la dalle — c'est " +
    "exactement ce qui a envoyé la v450 en ligne avec 16 blg là où Eric en a dicté 8. " +
    "L'écart de cette dalle a UN écrivain, et c'est le `gap` : retire la marge de " +
    "l'enfant, ne la neutralise pas depuis le parent.");
});

test("F — la bande d'aiguilleur du R est l'organe partagé, et elle est juste au-dessus des boutons", async () => {
  /* 🔴 DEUX CHOSES, ET LA SECONDE EST LA PLUS FRAGILE. Qu'il y ait une bande se
     verrait ; qu'elle soit le DERNIER organe avant le pied ne se voit qu'ici.
     Eric, 26/08 puis 02/09 : « on le met en bas, juste au-dessus des boutons ».
     Un organe glissé plus haut par un lot pressé rendrait un écran qui a l'air
     juste et qui ne se lit plus au bon moment. */
  const { renderDestinyPorte, PORTE_AIGUILLEUR } = await import("../ui/builder/destiny-step.mjs");
  const dalle = renderDestinyPorte(() => {});
  const enfants = [...dalle.childNodes].filter((n) => n.className !== undefined);
  const rangs = enfants.map((n) => String(n.className));

  const iBande = rangs.findIndex((c) => c.split(/\s+/).includes("guide-mot"));
  assert.ok(iBande >= 0,
    `le R ne porte aucune bande \`.guide-mot\` — ses enfants sont ${JSON.stringify(rangs)}. ` +
    "C'est l'organe du rang B, réutilisé ; une bande écrite à côté sous un autre nom " +
    "perdrait ses six réglages du 26 et du 27/08 et divergerait au premier ajustement.");
  const iPied = rangs.findIndex((c) => c.split(/\s+/).includes("parcours-pied"));
  assert.ok(iPied >= 0, "le R doit porter le pied `.parcours-pied`");
  assert.equal(iBande, iPied - 1,
    `la bande est en position ${iBande} et le pied en ${iPied} : elle doit être JUSTE ` +
    `au-dessus des boutons. Ordre rendu : ${JSON.stringify(rangs)}.`);

  assert.equal(dalle.querySelectorAll(".guide-mot")[0].textContent, PORTE_AIGUILLEUR,
    "le mot rendu doit être celui de la constante exportée — un texte d'écran recopié " +
    "dans un test diverge au premier réglage (même loi que `CEREMONIE_TEXTE`).");
});

test("D — aucune règle de la feuille n'est écrite deux fois à l'identique", () => {
  /* ⛔ CE GARDE A ROUGI AVANT D'ÊTRE ÉCRIT, sur neuf règles de Destiny.
     `.card-final-carte` → `.card-final-texte .card-score` étaient dans la
     feuille DEUX FOIS, identiques octet pour octet, depuis le lot 116 — et le
     lot 121 est passé exactement dessus sans les voir. **Deux copies
     identiques ne se contredisent jamais** : aucun rendu ne change, aucun test
     ne rougit, jusqu'au premier réglage qui n'en corrige qu'une.
     ⚖️ IL NE COMPARE QUE DES BLOCS ENTIERS ET IDENTIQUES. Deux règles au même
     sélecteur avec des corps DIFFÉRENTS sont un idiome légitime de la cascade
     (une surcharge de thème, un raffinement plus bas) et ne sont pas visées. */
  const vues = new Set();
  const doublons = [];
  for (const r of REGLES) {
    if (!r.sel || !r.corps) continue;
    const clef = r.sous + "|" + r.sel + " {" + r.corps + "}";
    if (vues.has(clef)) doublons.push(r.sel);
    else vues.add(clef);
  }
  assert.deepEqual(doublons, [],
    `${doublons.length} règle(s) de shell.css sont écrites deux fois, sélecteur ET corps ` +
    `identiques : ${JSON.stringify([...new Set(doublons)])}. Une copie qui ne change rien ` +
    "aujourd'hui est une copie qu'on oubliera de corriger demain — c'est la divergence garantie " +
    "au premier réglage, et elle ne prévient pas.");
});
