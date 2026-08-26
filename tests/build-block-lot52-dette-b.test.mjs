/* ══ LOT 52, DETTE B — LE MÊME REFUS, PRODUIT À DEUX ENDROITS ═══════════
   Commande `52-dettes-lot-43` §2. Le lot 43 avait mesuré, au grep :
   `background.boost-disallowed` a DEUX producteurs — `decisions.mjs`
   (`backgroundBoostPlan`, lu par `projectDecisions`) et `block.mjs` (son
   propre recalcul, indépendant). Sa déduplication ne porte que sur la boucle
   `projectDecisions` DE `validate()` : deux points d'entrée distincts dans
   `reported`, pas un doublon au même point.

   ⭐ LA MESURE FIABLE EST LA VIOLATION ELLE-MÊME, PAS SES ÉCRIVAINS (règle de
   mesure n°2 du mandat). Construite AVANT ce lot (voir git stash /
   INVENTAIRE-LOT-52.md pour le relevé), sur un Magicien SRD (aucune couche
   FH montée — les quatre arrière-plans SRD ne sont PAS éteints ici) qui
   choisit l'arrière-plan Sage (`ability_keys: con, int, wis`) puis pose un
   boost sur `str` (hors catalogue) :

       `validate()` rendait DEUX violations `background.boost-disallowed`,
       identiques clef pour clef, params pour params.

   La cause : `backgroundBoostPlan` (decisions.mjs) ET le second calcul de
   `block.mjs` (verbe `validate`) partagent la MÊME condition de déclenchement
   (un `background` explicitement choisi dont `ability_keys` est un tableau)
   et publient chacun leur propre `buildViolation(...)`, jamais comparés
   entre eux — `buildViolationList().add()` ne déduplique rien, et le
   fingerprint de dédoublonnement de `block.mjs` (introduit lot 43, §3e-bis)
   ne porte QUE sur les verrous internes à `projectDecisions`.

   LE CORRECTIF : `block.mjs` ne recalcule plus `background.boost-disallowed`
   — `decisions.mjs` en est la source UNIQUE, et couvre en outre le cas
   `ability_keys` ABSENT (repli sur les six clefs canoniques, contrat §1c)
   que la copie de `block.mjs` ignorait. `background.ability-key-invalid`,
   lui, RESTE dans `block.mjs` : c'est un contrôle de CONTENU (le record
   lui-même porte une clef hors catalogue), sans équivalent dans
   `decisions.mjs` — un seul producteur, légitime. */

import test from "node:test";
import assert from "node:assert/strict";

import {
  acceptanceDocument, makeHarness, manifestOf, uneCouche, SRD_EN, FH_SPECIES_EN
} from "./build-harness.mjs";
import { createFhSkillPoolStat } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";

/* ══ 1 — LA MESURE ELLE-MÊME : LE DOUBLON EST RÉEL, ET LE CORRECTIF LE TUE ═
   Le personnage d'acceptation (SRD français, aucune couche FH) choisit déjà
   l'arrière-plan Sage (`con, int, wis`) et y répartit ses 3 points légaux
   (int+2, con+1). On AJOUTE un boost sur `str` — hors catalogue de Sage —
   et on compte. */
test("DETTE B, test 1 — un boost hors catalogue ne rend plus qu'UNE SEULE `background.boost-disallowed`", () => {
  const h = makeHarness();
  const document = acceptanceDocument(h.layers);
  document.build.choices.push({ path: "background.boost.str", value: 2 });

  const verdict = h.verbs.validate({ document });
  const disallowed = verdict.violations.filter((v) => v.key === "background.boost-disallowed");

  assert.equal(disallowed.length, 1,
    "un seul refus — AVANT ce lot, ce même document en rendait DEUX (mesuré, voir INVENTAIRE-LOT-52.md)");
  assert.deepEqual(disallowed[0], {
    key: "background.boost-disallowed",
    params: { path: "background.boost.str", backgroundId: "srd:background:en:sage", abilityKeys: "con, int, wis" },
    path: "background.boost.str"
  }, "et c'est bien LE bon refus, pas un autre qui masquerait le compte");
  assert.equal(verdict.ok, false, "le document reste illégal — le correctif ne fait PAS disparaître le refus");
});

/* ══ 2 — LE REFUS EXISTE TOUJOURS SUR LE VRAI PLI, AVEC L'INHERITANCE ═════
   `fh:background:en:inheritance` (le seul arrière-plan choisissable une fois
   la couche FH montée) ne porte PAS `ability_keys` — le repli de
   `decisions.mjs` (contrat §1c, lot 43) l'ouvre donc aux six clefs
   canoniques. Un boost sur une clef qui n'en fait pas partie (ici `"xyz"`,
   trois lettres, aucun sens de caractéristique) doit donc toujours rougir —
   `background.ability-key-invalid`, lui, N'A AUCUNE RAISON D'APPARAÎTRE ici
   : l'Inheritance elle-même n'est pas en faute, c'est le CHOIX qui l'est. */
test("DETTE B, test 2 — sur le vrai pli (Inheritance), un boost hors des six canoniques rougit toujours, et une seule fois", () => {
  const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN], modules: [createFhSkillPoolStat()] });
  const document = {
    schema: "fh-char/1", id: "lot52-dette-b-2", name: "Dette B", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/build-block-lot52-dette-b", version: "1.0.0" },
    created: "2026-08-13T09:00:00Z", modified: "2026-08-13T09:00:00Z",
    build: {
      layers: manifestOf(h.layers),
      choices: [
        { path: "level", value: 1 },
        { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
        { path: "species", ref: { kind: "species", id: "srd:species:en:human" } },
        { path: "background", ref: { kind: "background", id: "fh:background:en:inheritance" } },
        { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 14 },
        { path: "abilities.con", value: 12 }, { path: "abilities.int", value: 14 },
        { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 14 },
        { path: "currency.cp", value: 0 }, { path: "currency.sp", value: 0 },
        { path: "currency.gp", value: 15 }, { path: "currency.pp", value: 0 },
        { path: "class.skills[0]", value: "arcana" }, { path: "class.skills[1]", value: "history" },
        { path: "background.boost.xyz", value: 2 },
        { path: "background.boost.con", value: 1 }
      ],
      budgets: {}, overrides: []
    }
  };
  const verdict = h.verbs.validate({ document });
  const disallowed = verdict.violations.filter((v) => v.key === "background.boost-disallowed");
  const invalid = verdict.violations.filter((v) => v.key === "background.ability-key-invalid");
  assert.equal(disallowed.length, 1, "le refus mord toujours sur le vrai pli, une seule fois");
  assert.equal(invalid.length, 0,
    "et `ability-key-invalid` ne parle pas ici : l'Inheritance elle-même n'a rien de cassé");
});

/* ══ 3 — `background.ability-key-invalid` : UN SEUL PRODUCTEUR, TOUJOURS VIVANT ═
   Ce refus-là N'A PAS d'équivalent dans `decisions.mjs` — retiré par erreur
   avec le doublon, un contenu cassé deviendrait muet. On le prouve à part :
   un arrière-plan dont le RECORD porte une clef hors catalogue (contenu
   fautif, pas un choix de joueur) doit toujours jeter le refus, et une seule
   fois — ce garde n'a jamais été dupliqué, il n'y a donc rien à
   dédoublonner ici, seulement à vérifier qu'il tient. */
test("DETTE B, test 3 — `background.ability-key-invalid` mord toujours, sur le contenu du record", () => {
  const h = makeHarness({
    extra: Object.assign(uneCouche("scenario-dette-b-ability-key-invalide", {
      background: {
        "srd:background:en:sage": { op: "patch", changes: { "data[ability_keys]": ["con", "int", "pied"] } }
      }
    }), { flags: [] })
  });
  const document = acceptanceDocument(h.layers);
  const verdict = h.verbs.validate({ document });
  const invalid = verdict.violations.filter((v) => v.key === "background.ability-key-invalid");
  assert.equal(invalid.length, 1, "une seule violation — le record ne porte qu'une seule clef cassée");
  assert.deepEqual(invalid[0].params, {
    backgroundId: "srd:background:en:sage", key: '"pied"', abilityKeys: "str, dex, con, int, wis, cha"
  });
});
