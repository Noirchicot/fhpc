/* Lot 7 — LE PLI DE LA PILE.

   Ce que §L7.2 promet : la pile est ordonnée, le dernier qui parle gagne,
   `patch` modifie par id, `disable` retire, et un patch dans le vide est un
   ÉCHEC BRUYANT. Chaque phrase de cette promesse a ici son scénario ET son
   attaque — c'est en violant un garde qu'on apprend s'il tient.

   Les scénarios courts s'écrivent sur des couches fabriquées ; le test
   d'acceptation, lui, tourne sur les 2 613 records réels
   (`layers-acceptance.test.mjs`). Les deux sont nécessaires : la vraie matière
   prouve que ça marche, les couches fabriquées prouvent POURQUOI. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeBlock, aLayer, anAdd, bytes } from "./layers-harness.mjs";

const rejects = (fn, needle, what) => assert.throws(fn, needle, what);

/* Trois couches d'école : le socle, celle qui patche, celle qui désactive. */
const socle = bytes(aLayer({
  id: "socle", name: "Socle",
  records: {
    weapon: {
      "socle:weapon:fr:dague": anAdd("Dague", { cost: "2 po", damage: "1d4", tags: ["finesse"] }),
      "socle:weapon:fr:epee": anAdd("Épée", { cost: "10 po", damage: "1d8" })
    },
    skill: { "socle:skill:fr:athletisme": anAdd("Athlétisme", { ability: "Force" }) }
  }
}));

test("le pli : trois couches, l'ordre compte, et le dernier qui parle gagne", () => {
  const { verbs, events } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  verbs.register({
    bytes: bytes(aLayer({
      id: "milieu", name: "Milieu",
      records: { weapon: { "socle:weapon:fr:dague": { op: "patch", changes: { "data.cost": "5 po" } } } }
    })),
    origin: "milieu"
  });
  verbs.register({
    bytes: bytes(aLayer({
      id: "haut", name: "Haut",
      records: { weapon: { "socle:weapon:fr:dague": { op: "patch", changes: { "data.cost": "9 po" } } } }
    })),
    origin: "haut"
  });

  const dague = verbs.query({ kind: "weapon", id: "socle:weapon:fr:dague" });
  assert.equal(dague.record.data.cost, "9 po", "la couche du haut gagne");
  assert.equal(dague.record.data.damage, "1d4", "et ne touche à rien d'autre");
  assert.equal(dague.provenance.from, "socle");
  assert.deepEqual(dague.provenance.patchedBy.map((p) => p.by), ["milieu", "haut"],
    "la provenance dit qui a parlé, et dans quel ordre");
  assert.equal(events.length, 3);
  assert.equal(events[2].reason, "register");
});

test("`disable` retire un record — et retirer la couche le REND", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  verbs.register({
    bytes: bytes(aLayer({
      id: "table", name: "Table",
      records: { weapon: { "socle:weapon:fr:epee": { op: "disable", reason: "pas d'épées à cette table" } } }
    })),
    origin: "table"
  });
  assert.equal(verbs.query({ kind: "weapon", id: "socle:weapon:fr:epee" }), null);
  assert.equal(verbs.query({ kind: "weapon" }).length, 1);

  verbs.disable({ id: "table" });
  assert.equal(verbs.query({ kind: "weapon", id: "socle:weapon:fr:epee" }).record.name, "Épée",
    "« une couche retirée rend ce qu'elle avait désactivé » — vrai par reconstruction, pas par annulation");
  verbs.enable({ id: "table" });
  assert.equal(verbs.query({ kind: "weapon", id: "socle:weapon:fr:epee" }), null, "et remonter la reprend");
});

test("ATTAQUE — un patch dans le vide, et un disable dans le vide, sont des échecs BRUYANTS", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  rejects(() => verbs.register({
    bytes: bytes(aLayer({
      id: "fantome-patch",
      records: { weapon: { "socle:weapon:fr:hache": { op: "patch", changes: { "data.cost": "1 po" } } } }
    })),
    origin: "fantome"
  }), /patche weapon « socle:weapon:fr:hache ».*n'est dans aucune couche/s, "un patch sur un record absent");

  rejects(() => verbs.register({
    bytes: bytes(aLayer({
      id: "fantome-disable",
      records: { weapon: { "socle:weapon:fr:hache": { op: "disable" } } }
    })),
    origin: "fantome"
  }), /désactive weapon « socle:weapon:fr:hache »/, "un disable sur un record absent");
});

test("ATTAQUE — le patch d'une couche BASSE sur un record d'une couche HAUTE échoue (l'ordre n'est pas symétrique)", () => {
  const { verbs } = makeBlock();
  /* Le pli descend du bas vers le haut : ce que la couche du haut ajoutera
     n'existe pas encore quand celle du bas parle. Un pli qui « repasserait »
     pour rattraper l'intention rendrait l'ordre décoratif. */
  rejects(() => verbs.register({
    bytes: bytes(aLayer({
      id: "bas",
      records: { skill: { "haut:skill:fr:bricole": { op: "patch", changes: { name: "Bricole" } } } }
    })),
    origin: "bas"
  }), /n'est dans aucune couche/, "une couche basse qui patche vers le haut");
});

test("ATTAQUE — le pli est TRANSACTIONNEL : une couche qui échoue ne laisse pas la pile à moitié pliée", () => {
  const { verbs, events } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  const before = verbs.stack();
  const eventsBefore = events.length;

  rejects(() => verbs.register({
    bytes: bytes(aLayer({
      id: "casse",
      records: {
        weapon: { "socle:weapon:fr:dague": { op: "patch", changes: { "data.cost": "1 po" } } },
        skill: { "socle:skill:fr:absent": { op: "disable" } }
      }
    })),
    origin: "casse"
  }), /n'est dans aucune couche/, "une couche dont la seconde moitié échoue");

  assert.deepEqual(verbs.stack(), before, "la pile est exactement celle d'avant");
  assert.equal(events.length, eventsBefore, "et rien n'a été annoncé — on n'annonce pas un changement qui n'a pas eu lieu");
  assert.equal(verbs.query({ kind: "weapon", id: "socle:weapon:fr:dague" }).record.data.cost, "2 po",
    "le patch de la première moitié n'a pas survécu à l'échec de la seconde");
});

test("ATTAQUE — un `disable` de COUCHE qui rendrait le pli impossible échoue, et ne casse rien", () => {
  /* Le cas que la transactionnalité doit tenir dans l'autre sens : éteindre
     une couche BASSE peut faire tomber le socle d'une couche HAUTE. On refuse,
     et la pile reste exactement où elle était. */
  const { verbs, events } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  verbs.register({
    bytes: bytes(aLayer({
      id: "dessus",
      records: { weapon: { "socle:weapon:fr:dague": { op: "patch", changes: { "data.cost": "7 po" } } } }
    })),
    origin: "dessus"
  });
  const before = verbs.stack();
  const count = events.length;

  rejects(() => verbs.disable({ id: "socle" }), /n'est dans aucune couche/,
    "éteindre le socle sous une couche qui le patche");
  assert.deepEqual(verbs.stack(), before, "la pile n'a pas bougé d'un cran");
  assert.equal(events.length, count, "et rien n'a été annoncé");
  assert.equal(verbs.query({ kind: "weapon", id: "socle:weapon:fr:dague" }).record.data.cost, "7 po",
    "le pli d'avant est toujours servi");
});

test("ATTAQUE — une clef interdite cachée dans la VALEUR d'un patch est refusée elle aussi", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  const hostile = JSON.stringify(aLayer({
    id: "hostile",
    records: { weapon: { "socle:weapon:fr:dague": { op: "patch", changes: { "data.cost": "PLACE" } } } }
  })).replace('"PLACE"', '{"__proto__":{"estAdmin":true}}');
  rejects(() => verbs.register({ bytes: hostile, origin: "hostile" }), /__proto__/, "un patch dont la valeur pollue");
  assert.equal({}.estAdmin, undefined);
});

test("ATTAQUE — monter deux fois la même couche est refusé", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  rejects(() => verbs.register({ bytes: socle, origin: "socle bis" }), /déjà montée/, "la même couche deux fois");
});

/* ── `query` : le seul chemin de lecture ────────────────────────────── */

test("ATTAQUE — un genre hors de l'énumération JETTE, il ne rend pas une liste vide", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  rejects(() => verbs.query({ kind: "spel" }), /genre inconnu/, "une requête sur « spel »");
  /* REWRITTEN 2026-08-09 — `arcana` était l'exemple du « genre FH à venir ».
     Il est VENU : l'architecte l'a ouvert dans les deux schémas (trou
     GAP-KIND clos). L'assertion n'est pas relâchée, elle change de sujet —
     `boon` prend le rôle, c'est un genre FH réellement absent de
     l'énumération (les Boons and Flaws d'Eric n'ont pas encore de place). */
  rejects(() => verbs.query({ kind: "boon", id: "x" }), /genre inconnu/, "une requête sur un genre FH à venir");
  rejects(() => verbs.query({}), /genre inconnu/, "une requête sans genre");
  /* Une liste vide ressemble à une réponse ; un genre vrai mais vide en est
     une, et les deux ne doivent pas se confondre. */
  assert.deepEqual(verbs.query({ kind: "spell" }), [], "un genre vrai que la pile ne porte pas rend une liste vide");
  assert.equal(verbs.query({ kind: "spell", id: "socle:spell:fr:x" }), null);

  /* AJOUTÉ 2026-08-09 — LA RÉCIPROQUE, sur le genre qui vient d'être ouvert.
     C'est la moitié qui se serait perdue : `arcana` ne jette plus, et il ne
     doit pas non plus faire semblant de porter quelque chose. Tant qu'aucune
     couche ne monte les 22 cartes, il répond une liste VIDE — la réponse
     « ce genre existe, la pile n'en porte rien », qui est exactement ce que
     le module de Destinée déclare aujourd'hui. */
  assert.deepEqual(verbs.query({ kind: "arcana" }), [], "`arcana` est légal depuis le 2026-08-09 : vide, pas un refus");
  assert.equal(verbs.query({ kind: "arcana", id: "fh:arcana:en:the-hermit" }), null);
});

test("ATTAQUE — ce que `query` rend est IMMUABLE, jusqu'au fond", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  const view = verbs.query({ kind: "weapon", id: "socle:weapon:fr:dague" });

  assert.throws(() => { view.record.data.cost = "0 po"; }, TypeError, "le contenu ne se mute pas");
  assert.throws(() => { view.record.data.tags.push("magique"); }, TypeError, "ni un tableau en profondeur");
  assert.throws(() => { view.provenance.from = "moi"; }, TypeError, "ni la provenance");
  assert.throws(() => { verbs.query({ kind: "weapon" }).push(null); }, TypeError, "ni la liste rendue");
  assert.equal(verbs.query({ kind: "weapon", id: "socle:weapon:fr:dague" }).record.data.cost, "2 po",
    "et la pile de tout le monde est intacte");
});

test("le bloc n'expose AUCUNE surface d'état — c'est ce qui rend « personne ne lit l'état d'un autre bloc » vérifiable", () => {
  const { block } = makeBlock();
  assert.deepEqual(Object.keys(block).sort(), ["name", "verbs"]);
  assert.equal(block.state, undefined);
  assert.equal(block.engine, undefined);
  assert.equal(block.derive, undefined);
  assert.deepEqual(Object.keys(block.verbs).sort(),
    ["disable", "enable", "flags", "query", "register", "ruleValues", "stack"]);
});

/* ── les chemins de patch ───────────────────────────────────────────── */

const collection = bytes(aLayer({
  id: "collection",
  records: {
    class: {
      "c:class:fr:magicien": anAdd("Magicien", {
        traits: [{ id: "sorts", label: "Sorts" }, { id: "rituel", label: "Rituel" }],
        listes: ["arcane", "divine"],
        niveau: { 1: { emplacements: 2 } },
        example_uses: "Lancer des sorts."
      })
    }
  }
}));

function patched(changes) {
  const { verbs } = makeBlock();
  verbs.register({ bytes: collection, origin: "collection" });
  verbs.register({
    bytes: bytes(aLayer({ id: "sus", records: { class: { "c:class:fr:magicien": { op: "patch", changes } } } })),
    origin: "sus"
  });
  return verbs.query({ kind: "class", id: "c:class:fr:magicien" });
}

test("un élément de collection se désigne par son IDENTITÉ, jamais par son index", () => {
  const view = patched({ "data.traits[rituel].label": "Rituel de classe" });
  assert.equal(view.record.data.traits[1].label, "Rituel de classe");
  assert.equal(view.record.data.traits[0].label, "Sorts", "et le voisin ne bouge pas");
  assert.equal(patched({ "data.listes[divine]": "primordiale" }).record.data.listes[1], "primordiale",
    "une collection de chaînes se désigne par la chaîne elle-même — toujours une identité, jamais un rang");
});

test("ATTAQUE — les quatre façons de rater un chemin", () => {
  rejects(() => patched({ "data.traits[0].label": "x" }), /mal formé/, "un index déguisé en identité");
  rejects(() => patched({ "data.traits[absent].label": "x" }), /n'existe pas dans le record/, "une identité qui n'est dans aucun élément");
  rejects(() => patched({ "data.inconnu.profond": "x" }), /n'existe pas dans le record/, "un intermédiaire absent");
  rejects(() => patched({ "data.traits.label": "x" }), /collection/, "un point posé sur une collection");
});

test("créer une clef au bout est permis et RAPPORTÉ ; créer en profondeur ne l'est pas", () => {
  /* Un homebrew ajoute légitimement un champ. Mais `data.cst` doit rester une
     faute de frappe VISIBLE, pas un champ fantôme : la création remonte dans
     la provenance, donc dans `layers-changed`. */
  const view = patched({ "data.mastery": "Coup double" });
  assert.equal(view.record.data.mastery, "Coup double");
  assert.deepEqual(view.provenance.patchedBy[0].applied, [{ path: "data.mastery", created: true }]);
  const known = patched({ "data.listes[arcane]": "arcanique" });
  assert.equal(known.provenance.patchedBy[0].applied[0].created, false, "modifier n'est pas créer");
});

test("MESURÉ SUR LA VRAIE MATIÈRE — un champ `snake_case` ne s'atteint QUE entre crochets", () => {
  /* Trouvé en écrivant le test d'acceptation, pas en lisant le schéma : un
     segment POINTÉ s'écrit `[a-zA-Z][a-zA-Z0-9]*` — sans souligné. Or les
     exports fh-srd sont en snake_case (`example_uses`, `ability_key`,
     `casting_time`) : 1 544 des 14 145 clefs `data` de la couche SRD FR sont
     dans ce cas, soit 11 %. Le crochet, lui, accepte le souligné et sert donc
     de forme normale — ce qui MARCHE, mais ne se devine pas.
     ⚠️ Question ouverte n°5 pour l'architecte : est-ce voulu ? */
  rejects(() => patched({ "data.example_uses": "x" }), /mal formé/,
    "le chemin pointé vers un champ souligné");
  const view = patched({ "data[example_uses]": "Autre chose." });
  assert.equal(view.record.data.example_uses, "Autre chose.", "le crochet, lui, y arrive");
});

test("ATTAQUE — un patch ne décroche pas la licence d'un record dont il dérive", () => {
  /* Loi §0.8, le juridique est de premier rang : une couche homebrew qui
     pourrait réécrire `attribution` retirerait la notice CC-BY d'un record
     SRD. ⚠️ Règle posée par ce lot, question ouverte n°3 pour l'architecte. */
  rejects(() => patched({ "attribution.license": "all-rights-reserved" }), /n'est pas patchable/, "un patch sur l'attribution");
  rejects(() => patched({ "source.id": "un-autre-livre" }), /n'est pas patchable/, "un patch sur la source");
  rejects(() => patched({ contentHash: "0".repeat(64) }), /n'est pas patchable/, "un patch signant lui-même son contenu");
  rejects(() => patched({ op: "add" }), /n'est pas patchable/, "un patch qui se change en add");
  /* Et le contentHash d'un record PATCHÉ tombe : il certifiait un contenu qui
     n'existe plus. */
  const { verbs } = makeBlock();
  verbs.register({
    bytes: bytes(aLayer({
      id: "signe",
      records: { gear: { "s:gear:fr:x": Object.assign(anAdd("X", { a: 1 }), { contentHash: "a".repeat(64) }) } }
    })),
    origin: "signe"
  });
  assert.equal(verbs.query({ kind: "gear", id: "s:gear:fr:x" }).record.contentHash, "a".repeat(64));
  verbs.register({
    bytes: bytes(aLayer({ id: "modifie", records: { gear: { "s:gear:fr:x": { op: "patch", changes: { "data.a": 2 } } } } })),
    origin: "modifie"
  });
  assert.equal(verbs.query({ kind: "gear", id: "s:gear:fr:x" }).record.contentHash, undefined,
    "on ne garde pas un certificat sur un contenu qu'on vient de changer");
});

/* ── drapeaux et valeurs de règle : séparés exprès ──────────────────── */

test("les drapeaux de la pile active, et rien d'autre", () => {
  const { verbs } = makeBlock();
  verbs.register({ bytes: bytes(aLayer({ id: "a", flags: ["fh.destiny", "fh.chaos"] })), origin: "a" });
  verbs.register({ bytes: bytes(aLayer({ id: "b", flags: ["fh.chaos", "maison.veillee"] })), origin: "b" });
  assert.deepEqual(verbs.flags(), ["fh.chaos", "fh.destiny", "maison.veillee"], "triés, sans doublon");
  verbs.disable({ id: "a" });
  assert.deepEqual(verbs.flags(), ["fh.chaos", "maison.veillee"], "une couche éteinte ne lève plus rien");
});

test("ATTAQUE — une clef de règle que le moteur ne connaît pas est REJETÉE", () => {
  const withKeys = makeBlock({ ruleValueKeys: ["fh.exhaustion"] });
  withKeys.verbs.register({ bytes: bytes(aLayer({ id: "ok", ruleValues: { "fh.exhaustion": -1 } })), origin: "ok" });
  assert.deepEqual(withKeys.verbs.ruleValues(), { "fh.exhaustion": -1 });

  rejects(() => withKeys.verbs.register({
    bytes: bytes(aLayer({ id: "faute", ruleValues: { "fh.exhausion": -1 } })), origin: "faute"
  }), /« fh.exhausion ».*ne connaît pas/s, "une faute de frappe dans une clef de règle");

  rejects(() => withKeys.verbs.register({
    bytes: bytes(aLayer({ id: "double", ruleValues: { "fh.exhaustion": -2 } })), origin: "double"
  }), /règlent toutes deux/, "deux couches sur la même valeur de règle");
});

test("ATTAQUE — sans déclaration du moteur, une valeur de règle n'est pas « ignorée », elle est refusée", () => {
  /* Le mode d'échec qu'on refuse : accepter un réglage qu'on ne sait pas
     vérifier, et le voir disparaître sans un mot. */
  const { verbs } = makeBlock();
  assert.deepEqual(verbs.ruleValues(), {}, "une pile sans valeur de règle en rend zéro, et c'est une réponse");
  rejects(() => verbs.register({
    bytes: bytes(aLayer({ id: "muet", ruleValues: { "fh.exhaustion": -1 } })), origin: "muet"
  }), /AUCUNE clef de règle/, "une valeur de règle sans moteur pour la lire");
});

test("un drapeau n'est pas une valeur, et une valeur n'est pas un drapeau", () => {
  /* La révision du 2026-08-08 les a séparés exprès : « ce module tourne-t-il ? »
     contre « quel nombre le moteur applique-t-il ? ». Les deux surfaces sont
     distinctes, et le pli ne les mélange jamais. */
  const { verbs } = makeBlock({ ruleValueKeys: ["fh.exhaustion"] });
  verbs.register({
    bytes: bytes(aLayer({ id: "fh", flags: ["fh.exhaustion"], ruleValues: { "fh.exhaustion": -1 } })),
    origin: "fh"
  });
  assert.deepEqual(verbs.flags(), ["fh.exhaustion"]);
  assert.deepEqual(verbs.ruleValues(), { "fh.exhaustion": -1 });
  assert.equal(verbs.flags().includes(-1), false);
});

/* ── la pile, telle que `build` la recopiera ────────────────────────── */

test("`stack` rend le manifeste que fh-char/1 attend : id, version, hash", () => {
  const { verbs } = makeBlock();
  const registered = verbs.register({ bytes: socle, origin: "socle" });
  const [entry] = verbs.stack();
  assert.equal(entry.id, "socle");
  assert.equal(entry.version, registered.version);
  assert.equal(entry.hash, registered.hash);
  assert.match(entry.hash, /^[0-9a-f]{64}$/);
  assert.equal(entry.enabled, true);
  verbs.disable({ id: "socle" });
  assert.equal(verbs.stack()[0].enabled, false, "une couche éteinte reste DANS la pile, à sa place");
  assert.equal(verbs.stack().length, 1);
});

test("ATTAQUE — enable/disable sur une couche qui n'est pas montée nomme la pile", () => {
  const { verbs, events } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  rejects(() => verbs.disable({ id: "fantome" }), /aucune couche « fantome »/, "éteindre une couche absente");
  rejects(() => verbs.enable({ id: "fantome" }), /aucune couche « fantome »/, "allumer une couche absente");
  const before = events.length;
  assert.deepEqual(verbs.enable({ id: "socle" }), { id: "socle", enabled: true, changed: false },
    "rallumer ce qui est déjà allumé le DIT (`changed: false`) au lieu de faire semblant");
  assert.equal(events.length, before, "et n'annonce pas un changement qui n'a pas eu lieu");
});

test("`register` refuse tout ce qui n'est pas des octets — le bloc ne lit pas le disque", () => {
  const { verbs } = makeBlock();
  rejects(() => verbs.register({}), /octets du fichier de couche/, "un register sans octets");
  rejects(() => verbs.register({ document: aLayer() }), /octets du fichier de couche/, "un register avec un document analysé");
});

test("`layers-changed` porte la pile, les comptes, les drapeaux — et les recouvrements", () => {
  const { verbs, last } = makeBlock();
  verbs.register({ bytes: socle, origin: "socle" });
  verbs.register({
    bytes: bytes(aLayer({
      id: "recouvre",
      records: { weapon: { "socle:weapon:fr:dague": anAdd("Dague de la maison", { cost: "4 po" }) } }
    })),
    origin: "recouvre"
  });
  const event = last();
  assert.equal(event.type, "layers-changed");
  assert.equal(event.reason, "register");
  assert.deepEqual(event.counts, { weapon: 2, skill: 1 });
  assert.equal(event.total, 3);
  assert.deepEqual(event.stack.map((l) => l.id), ["socle", "recouvre"]);
  /* « Le dernier qui parle gagne » — mais un `add` qui en recouvre un autre se
     DIT. Un recouvrement qu'on n'a pas voulu doit être visible sans avoir à
     comparer deux couches à la main. */
  assert.deepEqual(event.shadowed, [{ kind: "weapon", id: "socle:weapon:fr:dague", by: "recouvre", over: "socle" }]);
  assert.equal(verbs.query({ kind: "weapon", id: "socle:weapon:fr:dague" }).record.name, "Dague de la maison");
});

test("createLayers refuse de se construire sans bus — une pile qui change sans le dire est un changement perdu", () => {
  assert.throws(() => makeBlock({ bus: null }).block, /needs a bus/);
});
