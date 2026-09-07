/* ══ LES GARDES DE L'ÉCRAN SKILLS — LOT 171, le croquis du 2026-09-07 ═══════
   Même patron que la suite du lot 39 qu'elle remplace : on teste la FONCTION
   (`renderSkillsStep(ctx, onAction)`), pas la page, avec le DOM minimal de
   `tests/dom-stub.mjs`. La matière est RÉELLE : la pile EN Fate's Hand montée
   une fois (`exempleFhEn()`, un Wizard Elf niveau 1), et un Rogue bâti de ses
   seuls choix — jamais un `resolved` tapé à la main, sauf pour l'attaque du
   total menteur, où c'est le point de l'attaque.

   CE QUE LES LOIS DU LOT 39 DEVIENNENT ICI (aucune n'est perdue) :
     · « les 26 apparaissent, 8·7·6·5 »        → réparties sur les pages du tambour ;
     · « un clic = un verbe, bon chemin »        → tenu, plus le second tap qui redescend ;
     · « OVER au compteur, validate ko »         → le Spent rouge, le gendarme, Done éteint ;
     · « le budget d'espèce a dégagé »           → Bound est informatif, ses ronds captifs ;
     · « la notification du Rogue »              → la 2ᵉ ligne de l'aiguilleur, lue au record ;
     · « SRD pur : aucun mot FH »                → tenu ;
     · « un total menteur s'affiche menteur »    → tenu ;
     · « les 37 outils apparaissent »            → dans la LISTE ENTIÈRE d'Add, plus sur la page.
   Chaque garde porte son témoin contraire quand une alternative existe. */
import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, manifestOf, SRD_FR, HOMEBREW } from "./build-harness.mjs";
globalThis.document = createTestDocument();
const {
  renderSkillsStep, skillsValidate, skillsCategories, skillsEcran, skillsReinitialiserEcran, skillsCheminsDeReset, skillsFermerAjout
} = await import("../ui/builder/skills-step.mjs");

const fixture = exempleFhEn();
const { layers, build } = fixture;
const query = layers.verbs.query;
const rebuild = (document) => build.verbs.rebuild({ document });
const validate = (document) => build.verbs.validate({ document });
const set = (document, path, value) => build.verbs.set({ document, path, value }).document;

/** Un `ctx` complet, à partir d'un `rebuild()`. */
function ctxFrom(report, actions, extra) {
  return Object.assign({
    resolved: report.resolved, decisions: report.decisions,
    violations: validate(report.document).violations, query, onAction: actions || (() => {})
  }, extra || {});
}

/** Un Rogue Elf niveau 1 bâti de ses seuls choix, kit lié posé : Stealth
 *  expert (4) + Acrobatics et Athletics novice (1 + 1) = ses 6 points liés. */
function rogueDocument(extra = []) {
  const base = fixture.report.document;
  return {
    ...base, id: "lot171-rogue", name: "Rogue",
    build: {
      ...base.build, overrides: [], budgets: {},
      choices: [
        { path: "level", value: 1 },
        { path: "class", ref: { kind: "class", id: "srd:class:en:rogue" } },
        { path: "species", ref: { kind: "species", id: "srd:species:en:elf" } },
        { path: "species.lineage", value: "high-elf" },
        { path: "species.skillBudget.survival", value: "novice" },
        { path: "species.skillBudget.vigilance", value: "novice" },
        { path: "background.boost.int", value: 2 }, { path: "background.boost.con", value: 1 },
        { path: "abilities.mode", value: "standard" },
        { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 15 }, { path: "abilities.con", value: 13 },
        { path: "abilities.int", value: 12 }, { path: "abilities.wis", value: 10 }, { path: "abilities.cha", value: 8 },
        { path: "class.skillBudget.stealth", value: "expert" },
        { path: "class.skillBudget.acrobatics", value: "novice" },
        { path: "class.skillBudget.athletics", value: "novice" },
        { path: "background.languages[0]", ref: { kind: "training", id: "fh:training:en:language-elf" } },
        { path: "background.languages[1]", ref: { kind: "training", id: "fh:training:en:language-human" } }
      ].concat(extra)
    }
  };
}

/* Les lignes de CONTENU — la ligne « Add » est une ligne de la page, pas un objet listé. */
const lignes = (node) => [...node.querySelectorAll(".skills-ligne")].filter((l) => !String(l.className).includes("skills-ligne-ajout"));
const ligne = (node, slug) => node.querySelectorAll(`.skills-ligne[data-ligne="${slug}"]`)[0] || null;
const ronds = (l) => [...l.querySelectorAll(".skills-rond")];
const rond = (node, slug, rang) => node.querySelectorAll(`.skills-ligne[data-ligne="${slug}"] .skills-rond[data-rang="${rang}"]`)[0];
const aiguilleur = (node) => node.querySelectorAll(".skills-aiguilleur")[0];
const spent = (node) => node.querySelectorAll(".skills-free-spent")[0];
const texteDe = (n) => n.textContent;
function surLaPage(index) { skillsReinitialiserEcran(); skillsEcran().page = index; }

/* ══ 1 — UNE PAGE À LA FOIS, ET LES 26 SE RETROUVENT EN TOURNANT ══════════ */

test("la rangée a cinq onglets — quatre catégories, Tools & Trainings — et les 26 compétences se répartissent 8 · 7 · 6 · 5", () => {
  const ctx = ctxFrom(fixture.report);
  assert.deepEqual(skillsCategories(ctx), ["Knowledge", "Social", "Exploration", "Physical", "Tools & Trainings"]);
  const comptes = [];
  const tous = new Set();
  for (let i = 0; i < 4; i += 1) {
    surLaPage(i);
    const node = renderSkillsStep(ctx);
    const page = node.querySelectorAll(".skills-page")[0];
    comptes.push(lignes(node).length);
    for (const l of lignes(node)) tous.add(l.getAttribute("data-ligne"));
    assert.equal(page.getAttribute("data-page"), ["knowledge", "social", "exploration", "physical"][i]);
  }
  assert.deepEqual(comptes, [8, 7, 6, 5], "les catégories sont lues sur la couche, pas comptées ici");
  assert.equal(tous.size, 26, "les 26 compétences, chacune sur UNE page");
  surLaPage(0);
});

test("la rangée n'est pas un tambour (Eric, 07/09) : cinq onglets visibles, aucun chevron, un tap ouvre sa page, le bout ne boucle pas", () => {
  surLaPage(0);
  const node = renderSkillsStep(ctxFrom(fixture.report));
  const onglets = () => [...node.querySelectorAll(".skills-onglet")].map((o) => `${o.getAttribute("aria-current") === "true" ? "*" : ""}${texteDe(o)}`);
  assert.deepEqual(onglets(), ["*Knowledge", "Social", "Exploration", "Physical", "Tools & Trainings"], "cinq onglets, tous visibles, le courant marqué");
  assert.equal(node.querySelectorAll(".skills-tambour-chevron").length, 0, "rien à faire tourner : pas de chevron");
  node.querySelectorAll(".skills-onglet")[4].click();
  assert.equal(skillsEcran().page, 4);
  assert.deepEqual(onglets(), ["Knowledge", "Social", "Exploration", "Physical", "*Tools & Trainings"], "le halo suit l'onglet tapé, la rangée ne bouge pas");
  assert.equal(node.querySelectorAll(".skills-page")[0].getAttribute("data-page"), "kit", "la fenêtre suit l'onglet");
  /* 🔴 LE TÉMOIN CONTRAIRE : au bout de la rangée, le glisser ne boucle pas. */
  const hote = node.querySelectorAll(".skills-onglets-hote")[0];
  hote.dispatchEvent({ type: "pointerdown", target: hote, clientX: 100, clientY: 10 });
  hote.dispatchEvent({ type: "pointerup", target: hote, clientX: 200, clientY: 12 }); // vers la droite = page précédente
  assert.equal(skillsEcran().page, 3, "un glisser à droite recule d'un onglet");
  surLaPage(0);
  const node2 = renderSkillsStep(ctxFrom(fixture.report));
  const hote2 = node2.querySelectorAll(".skills-onglets-hote")[0];
  hote2.dispatchEvent({ type: "pointerdown", target: hote2, clientX: 100, clientY: 10 });
  hote2.dispatchEvent({ type: "pointerup", target: hote2, clientX: 200, clientY: 12 });
  assert.equal(skillsEcran().page, 0, "depuis le premier, reculer ne mène nulle part : une rangée, pas une boucle");
  surLaPage(0);
});

/* ══ 2 — UN TAP, UN VERBE ; LE SECOND REDESCEND ; RIEN N'EST CALCULÉ ICI ══ */

test("un tap sur un rond vide émet UN verbe `set` au bon chemin ; sur un rond vert, il redescend d'un cran, et efface sous le premier", () => {
  surLaPage(0);
  const actions = [];
  const node = renderSkillsStep(ctxFrom(fixture.report, (a) => actions.push(a)));
  rond(node, "academics", 2).click();
  assert.deepEqual(actions, [{ kind: "set", path: "fh.skills.spend.academics", value: "adept" }], "un verbe, le palier du rond, jamais un calcul");

  /* Le MÊME personnage, Academics déjà adept : le second tap sur ● redescend à
     Novice, et le tap sur ◐ (le premier) EFFACE — Eric, 07/09 : *« taper une
     deuxième fois sur un rond vert le fait disparaître »*. */
  const adept = rebuild(set(fixture.report.document, "fh.skills.spend.academics", "adept"));
  const actions2 = [];
  const node2 = renderSkillsStep(ctxFrom(adept, (a) => actions2.push(a)));
  assert.deepEqual(ronds(ligne(node2, "academics")).map((b) => b.getAttribute("data-active")), ["true", "true", "false"], "deux ronds verts");
  rond(node2, "academics", 2).click();
  rond(node2, "academics", 1).click();
  assert.deepEqual(actions2, [
    { kind: "set", path: "fh.skills.spend.academics", value: "novice" },
    { kind: "clear", path: "fh.skills.spend.academics" }
  ]);
});

/* ══ 2 bis — LE NOM EST UN LIEN : le détail vient du record et du moteur ═══ */

test("le nom d'une compétence ouvre son détail — usage du record, carac, palier acquis et bonus décomposé, barème, provenance d'un lié", () => {
  surLaPage(3); // Physical : Stealth, lié expert chez le Rogue
  const rogue = rebuild(rogueDocument());
  const actions = [];
  const node = renderSkillsStep(ctxFrom(rogue, (a) => actions.push(a)));
  const nom = ligne(node, "stealth").querySelectorAll(".skills-ligne-lien")[0];
  assert.ok(nom, "le nom est un lien");
  nom.click();
  assert.equal(actions.length, 1);
  assert.equal(actions[0].kind, "popup", "un popup, aucun verbe au document");
  assert.equal(actions[0].titre, "Stealth");
  const t = actions[0].texte;
  const record = query({ kind: "skill" }).find((v) => v.record.slug === "stealth").record.data;
  assert.ok(t.includes(record.example_uses), "l'usage vient du record, mot pour mot");
  assert.match(t, /Ability: Dexterity \(DEX\)/);
  const stealth = rogue.resolved.skills.find((s) => s.id === "stealth");
  assert.match(t, new RegExp(`Your tier: Expert — bonus \\${stealth.bonus >= 0 ? "+" : "-"}${Math.abs(stealth.bonus)}`), "le bonus est celui du moteur");
  assert.match(t, /Novice 1 pt .* · Adept 2 pts .* · Expert 4 pts/, "le barème vient de tier_costs");
  assert.match(t, /Bound at Expert/, "et la provenance d'un lié est dite");
  /* 🔴 LE TÉMOIN CONTRAIRE : une compétence non acquise dit qu'elle roule avec la carac seule. */
  surLaPage(0);
  const actions2 = [];
  const node2 = renderSkillsStep(ctxFrom(rogue, (a) => actions2.push(a)));
  ligne(node2, "appraise").querySelectorAll(".skills-ligne-lien")[0].click();
  assert.match(actions2[0].texte, /Not trained/);
  assert.equal(/Bound at/.test(actions2[0].texte), false);
});

/* ══ 3 — LE LIÉ : HALO VIOLET, CAPTIF, ET LE POPUP « BOUND » ══════════════ */

test("un rond lié porte le halo, n'émet aucun verbe, et ouvre le popup Bound — le libre du même personnage se pose", () => {
  const rogue = rebuild(rogueDocument());
  surLaPage(3); // Physical : Stealth, Acrobatics, Athletics y vivent
  const actions = [];
  const node = renderSkillsStep(ctxFrom(rogue, (a) => actions.push(a)));
  const stealth = ligne(node, "stealth");
  assert.ok(stealth, "Stealth est sur la page Physical");
  assert.equal(stealth.getAttribute("data-lie"), "oui");
  assert.deepEqual(ronds(stealth).map((b) => `${b.getAttribute("data-lie")}/${b.getAttribute("data-active")}`),
    ["oui/true", "oui/true", "oui/true"], "expert lié : trois ronds verts sous halo violet");
  rond(node, "stealth", 3).click();
  assert.equal(actions.length, 1);
  assert.equal(actions[0].kind, "popup", "captif : aucun `set`, aucun `clear` — le popup dit d'où ça vient");
  assert.equal(actions[0].titre, "Bound");
  assert.match(actions[0].texte, /Rogue/, "la source est nommée");
  assert.match(actions[0].texte, /Stealth Expert/, "et le palier posé");
  assert.match(actions[0].texte, /Elf/, "la bourse d'espèce aussi");
  /* 🔴 LE TÉMOIN CONTRAIRE : Acrobatics est lié à Novice — son 2ᵉ rond est LIBRE et se pose. */
  const acro = ligne(node, "acrobatics");
  assert.deepEqual(ronds(acro).map((b) => b.getAttribute("data-lie")), ["oui", "non", "non"]);
  rond(node, "acrobatics", 2).click();
  assert.deepEqual(actions[1], { kind: "set", path: "fh.skills.spend.acrobatics", value: "adept" });
  surLaPage(0);
});

test("Bound points dit la vérité : Skills 8/8 · Tools 0/1 (aucune porte ne place le point d'outil) · Trainings 2/2", () => {
  surLaPage(0);
  const rogue = rebuild(rogueDocument());
  const node = renderSkillsStep(ctxFrom(rogue));
  /* Une LIGNE, plus trois (Eric, 07/09 03:3x) : l'étiquette ouvre, les valeurs suivent. */
  const bound = node.querySelectorAll(".skills-ligne-compte")[0];
  assert.equal(texteDe(bound.querySelectorAll(".skills-compte-etiquette")[0]), "Bound points");
  /* Trois CELLULES sur la grille, sous les colonnes de Budget · Spent (Eric, 03:5x). */
  assert.deepEqual([...bound.querySelectorAll(".skills-compte-cellule")].map(texteDe), ["Skills 8/8", "Tools 0/1", "Trainings 2/2"]);
  /* ⚠️ MESURÉ LE 07/09 : `resolved.tools` est VIDE pour le Rogue — le record
     déclare 1 point d'outil lié, rien ne le place. « 1/1 » aurait menti. */
  assert.deepEqual(rogue.resolved.tools, []);
  /* 🔴 LE TÉMOIN CONTRAIRE : le Wizard Elf n'a aucun point d'outil lié — sa ligne dit 0/0. */
  const wizard = renderSkillsStep(ctxFrom(fixture.report));
  assert.equal(texteDe(wizard.querySelectorAll(".skills-compte-cellule")[1]), "Tools 0/0");
  /* Et les deux étiquettes OUVRENT : Bound par source, Free par provenance des points. */
  const actions = [];
  const w2 = renderSkillsStep(ctxFrom(fixture.report, (a) => actions.push(a)));
  const etiquettes = [...w2.querySelectorAll(".skills-compte-etiquette")];
  assert.deepEqual(etiquettes.map(texteDe), ["Bound points", "Free points"]);
  etiquettes[1].click();
  assert.equal(actions[0].kind, "popup");
  assert.equal(actions[0].titre, "Free points");
  assert.match(actions[0].texte, /Budget \d+ — where it comes from/);
});

/* ══ 4 — LE SPENT PARCOURT L'ÉCHELLE, ET DONE N'OUVRE QU'AU COMPTE ═══════ */

test("Spent : bleu en cours, vert au compte exact, rouge au-delà — Done ne s'allume qu'au compte, et le gendarme prend la case de l'aiguilleur", () => {
  surLaPage(0);
  const depart = fixture.report;
  const budget = depart.resolved.stats.find((s) => s.id === "fh:skill-points").value;
  assert.ok(budget >= 8, `mesure : le Wizard Elf a ${budget} points libres à dépenser`);
  const node0 = renderSkillsStep(ctxFrom(depart));
  assert.equal(spent(node0).getAttribute("data-etat"), "cours");
  assert.equal(skillsValidate(ctxFrom(depart)).ready, false, "Eric, 07/09 : « Done en gris tant que le compte n'est pas là »");

  /* Au compte exact — on dépense TOUT en experts et adeptes sur des compétences libres. */
  let doc = depart.document;
  const cibles = ["academics", "appraise", "history", "deception", "insight", "intimidation", "persuasion", "streetwise", "athletics", "acrobatics", "stealth", "survival"];
  let reste = budget;
  for (const slug of cibles) {
    if (reste >= 2) { doc = set(doc, `fh.skills.spend.${slug}`, "adept"); reste -= 2; }
    else if (reste === 1) { doc = set(doc, `fh.skills.spend.${slug}`, "novice"); reste -= 1; }
    if (reste === 0) break;
  }
  const exact = rebuild(doc);
  const nodeExact = renderSkillsStep(ctxFrom(exact));
  assert.equal(spent(nodeExact).getAttribute("data-etat"), "compte", "tout placé : vert");
  assert.equal(skillsValidate(ctxFrom(exact)).ready, true, "et Done s'allume");
  assert.match(texteDe(aiguilleur(nodeExact)), /Done to settle/);

  /* Au-delà — un adept de plus sur une compétence libre (un expert serait refusé
     par le verrou du Wizard avant de coûter : ce serait le mauvais témoin). */
  const trop = rebuild(set(doc, "fh.skills.spend.hunting", "adept"));
  const nodeTrop = renderSkillsStep(ctxFrom(trop));
  assert.equal(spent(nodeTrop).getAttribute("data-etat"), "trop", "dépassé : rouge");
  assert.equal(skillsValidate(ctxFrom(trop)).ready, false, "Done se rééteint");
  const g = aiguilleur(nodeTrop);
  assert.equal(g.getAttribute("data-gendarme"), "oui", "le gendarme a pris la case");
  assert.match(texteDe(g), /Overspent by/, "et il dit le refus, mot du moteur");
  assert.equal(nodeExact.querySelectorAll('.skills-aiguilleur[data-gendarme="oui"]').length, 0, "témoin : au compte exact, l'aiguilleur guide");
});

test("une demande refusée (plafond) se lit sur la ligne, et le tap sur le palier refusé l'EFFACE au lieu de la redire", () => {
  /* Un Rogue niveau 1 : Stealth expert lié + un expert libre = le plafond ; le
     second expert libre est refusé et reste écrit — le rond doit offrir la sortie. */
  surLaPage(0);
  const rogue = rebuild(rogueDocument([
    { path: "fh.skills.spend.academics", value: "expert" },
    { path: "fh.skills.spend.appraise", value: "expert" }
  ]));
  const actions = [];
  const node = renderSkillsStep(ctxFrom(rogue, (a) => actions.push(a)));
  const appraise = ligne(node, "appraise");
  assert.equal(appraise.querySelectorAll('.skills-ronds[data-refus="oui"]').length, 1, "la ligne refusée est marquée");
  assert.equal(aiguilleur(node).getAttribute("data-gendarme"), "oui");
  rond(node, "appraise", 3).click();
  assert.deepEqual(actions, [{ kind: "clear", path: "fh.skills.spend.appraise" }], "le tap sur ◉ efface la demande refusée");
  /* 🔴 LE TÉMOIN CONTRAIRE : sur la ligne ACCEPTÉE, ◉ est vert et le tap redescend. */
  const actions2 = [];
  const node2 = renderSkillsStep(ctxFrom(rogue, (a) => actions2.push(a)));
  rond(node2, "academics", 3).click();
  assert.deepEqual(actions2, [{ kind: "set", path: "fh.skills.spend.academics", value: "adept" }]);
});

/* ══ 5 — SIGNÉE, L'ÉTAPE CONCLUT EN VERT ET LE PIED DÉCLARE `Next` ════════ */

test("signée : la conclusion verte remplace l'aiguilleur et l'hôte du pied déclare `Next` ; non signée, il déclare `Done` — et `Reset` toujours", () => {
  surLaPage(0);
  const signe = renderSkillsStep(ctxFrom(fixture.report, null, { signe: true }));
  assert.equal(signe.getAttribute("data-signe"), "oui");
  assert.equal(aiguilleur(signe).getAttribute("data-signe"), "oui");
  assert.match(texteDe(aiguilleur(signe)), /settled/);
  const pied = signe.querySelectorAll(".skills-pied")[0];
  assert.equal(pied.getAttribute("data-sortie-ici"), "true", "la coquille garnit le pied — l'écran ne fabrique aucun Done");
  assert.equal(pied.getAttribute("data-sortie-done-mot"), "Next");
  assert.equal(pied.getAttribute("data-sortie-verbe"), "resetSkills");
  assert.equal(pied.getAttribute("data-sortie-mot"), "Reset");
  assert.equal(pied.querySelectorAll(".livre-de-sortie").length, 1, "le livre est posé, la coquille le range à gauche");
  const pas = renderSkillsStep(ctxFrom(fixture.report));
  assert.equal(pas.querySelectorAll(".skills-pied")[0].getAttribute("data-sortie-done-mot"), "Done");
  assert.equal(pas.querySelectorAll(".sortie-bouton").length, 0, "aucun bouton de sortie fabriqué par l'écran (garde 17)");
});

test("Reset : les chemins viennent du DOCUMENT — tout le libre, rien du lié, et pas le trait", () => {
  const doc = rogueDocument([
    { path: "fh.skills.spend.academics", value: "expert" },
    { path: "fh.skills.train.language-araag", value: true },
    { path: "fh.skills.trait.late-bloomer", value: true }
  ]);
  assert.deepEqual(skillsCheminsDeReset(doc).sort(), ["fh.skills.spend.academics", "fh.skills.train.language-araag"]);
  assert.deepEqual(skillsCheminsDeReset({ build: { choices: [] } }), []);
  assert.deepEqual(skillsCheminsDeReset(null), [], "un document absent ne fait pas planter le pied");
});

/* ══ 6 — TOOLS ET TRAININGS : L'ACQUIS SEULEMENT, ET LA LISTE ENTIÈRE D'ADD ══ */

test("Tools ne liste que l'acquis ; Add ouvre les 37 outils ; l'outil choisi arrive VIDE, sans un verbe", () => {
  skillsReinitialiserEcran();
  skillsEcran().page = 4; // Tools & Trainings
  const actions = [];
  const node = renderSkillsStep(ctxFrom(fixture.report, (a) => actions.push(a)));
  /* Une page, deux listes : les outils d'abord (aucun pour le Wizard Elf), les trainings
     ensuite (ses deux langues d'origine). */
  assert.equal(lignes(node).filter((l) => !String(l.className).includes("skills-ligne-training")).length, 0, "le Wizard Elf n'a aucun outil : rien à lister");
  assert.equal(node.querySelectorAll(".skills-vide").length, 1, "« No tools yet. » — et pas « No trainings yet. », il en a deux");
  assert.equal(node.querySelectorAll(".skills-ligne-ajout").length, 2, "deux lignes d'ajout : un outil, un training");
  /* La ligne « Add a tool » : le mot à gauche, le disque vert à droite (Eric, 07/09). */
  const ligneAjout = node.querySelectorAll(".skills-ligne-ajout")[0];
  assert.equal(texteDe(ligneAjout.querySelectorAll(".skills-ligne-nom")[0]), "Add a tool");
  const add = node.querySelectorAll(".skills-ajout")[0];
  assert.equal(add.getAttribute("aria-label"), "Add a tool");
  add.click();
  /* Ouvrir demande un redessin à la COQUILLE (le pied change de paire) — l'écran n'émet
     que ce verbe, et le test le rejoue en rendant à nouveau. */
  assert.deepEqual(actions.splice(0), [{ kind: "skillsRedessiner" }]);
  const nodeSel = renderSkillsStep(ctxFrom(fixture.report, (a) => actions.push(a)));
  /* Le sélecteur est l'organe du glisser (Eric, 07/09 : « type spells ») : douze jetons par
     page — quatre rangées de trois, la 4ᵉ payée par la ligne du compte qui part dans
     l'aiguilleur (Eric, 07/09 05:0x) —, quatre collecteurs, et le pied déclare Cancel + Add tool. */
  const selecteur = nodeSel.querySelectorAll(".skills-selecteur")[0];
  assert.ok(selecteur, "le sélecteur a pris la dalle");
  assert.equal(selecteur.querySelectorAll(".glisse-jeton").length, 12, "quatre rangées de trois");
  assert.equal(selecteur.querySelectorAll(".choix-glisse-compte").length, 0, "pas de « 0 of 4 picked » sous le vivier : il vit dans l'aiguilleur");
  assert.match(nodeSel.querySelectorAll(".skills-aiguilleur")[0].textContent, /0 of 4 picked/, "l'aiguilleur porte le compte des collecteurs");
  assert.equal(selecteur.querySelectorAll(".glisse-creneau").length, 4, "quatre collecteurs");
  assert.equal(selecteur.querySelectorAll(".choix-glisse")[0].getAttribute("data-rangs"), "sorts", "trois par rangée, le régime des sorts, déclaré");
  const pied = nodeSel.querySelectorAll(".skills-pied")[0];
  assert.equal(pied.getAttribute("data-sortie-verbe"), "skillsAjoutAnnuler", "Cancel rend les collecteurs");
  assert.equal(pied.getAttribute("data-sortie-mot"), "Cancel");
  assert.equal(pied.getAttribute("data-sortie-done-mot"), "Add tool", "le bouton de droite dit ce qu'il fait, pas « Done » (Eric, 07/09)");
  assert.equal(pied.getAttribute("data-sortie-done-verbe"), "skillsAjoutFermer", "et il n'est pas le Done de l'étape : il ne signe rien");
  /* Un jeton posé dans un collecteur vit dans l'état d'écran ; le Done du pied
     (verbe exécuté par la coquille) le fait entrer dans la page. */
  skillsEcran().collecteurs.tool[0] = "alchemist-s-supplies";
  skillsFermerAjout();
  assert.equal(skillsEcran().ajout, null, "le sélecteur est refermé");
  assert.deepEqual(skillsEcran().collecteurs.tool, [null, null, null, null], "les collecteurs sont rendus");
  const node2 = renderSkillsStep(ctxFrom(fixture.report, (a) => actions.push(a)));
  assert.equal(node2.querySelectorAll(".skills-pied")[0].getAttribute("data-sortie-mot"), "Reset", "le pied retrouve Reset · Done");
  const l = ligne(node2, "alchemist-s-supplies");
  assert.ok(l, "l'outil ajouté a sa ligne");
  assert.deepEqual(ronds(l).map((b) => b.getAttribute("data-active")), ["false", "false", "false"], "il arrive VIDE — Eric, 07/09");
  assert.deepEqual(actions, [], "et RIEN n'a été écrit au personnage : l'ajout est un état d'écran");
  /* Son premier rond se paie au pool comme une compétence. */
  rond(node2, "alchemist-s-supplies", 1).click();
  assert.deepEqual(actions, [{ kind: "set", path: "fh.skills.spend.alchemist-s-supplies", value: "novice" }]);
  /* Le popup de l'outil porte « Remove » (Eric, 07/09) : il oublie la ligne ET rend la dépense. */
  l.querySelectorAll(".skills-ligne-lien")[0].click();
  const popup = actions[1];
  assert.equal(popup.kind, "popup");
  assert.equal(popup.actions.length, 1);
  assert.equal(popup.actions[0].mot, "Remove");
  popup.actions[0].faire();
  assert.equal(skillsEcran().ajoutes.tool.has("alchemist-s-supplies"), false, "la ligne ajoutée est oubliée");
  assert.deepEqual(actions[2], { kind: "clear", path: "fh.skills.spend.alchemist-s-supplies" }, "et la dépense est rendue");
  skillsReinitialiserEcran();
  assert.equal(skillsEcran().ajoutes.tool.size, 0, "Reset oublie l'ajout sans point");
});

test("Trainings : les deux langues d'origine sont liées, un training s'achète d'un tap et se rend d'un second, et Add ouvre les 13", () => {
  skillsReinitialiserEcran();
  skillsEcran().page = 4; // Tools & Trainings
  /* ⚠️ Niveau 4 : un training sans `from_level` s'ouvre au niveau générique du
     moteur (mesuré : tous les records de la couche en sont là, le Garrot
     compris) ; au niveau 1 l'achat serait refusé et ce test mesurerait le verrou,
     pas la page. Le Rogue de niveau 4 porte les mêmes 6 points liés. */
  const rogue = rebuild(set(rogueDocument([{ path: "fh.skills.train.garrot", value: true }]), "level", 4));
  const actions = [];
  const node = renderSkillsStep(ctxFrom(rogue, (a) => actions.push(a)));
  const noms = lignes(node).filter((l) => String(l.className).includes("skills-ligne-training")).map((l) => l.getAttribute("data-ligne")).sort();
  assert.deepEqual(noms, ["garrot", "language-elf", "language-human"], "les langues liées + le training acheté, rien d'autre");
  const elf = ligne(node, "language-elf");
  assert.equal(elf.getAttribute("data-lie"), "oui");
  assert.equal(ronds(elf)[0].getAttribute("data-lie"), "oui", "une langue d'origine porte le halo");
  ronds(elf)[0].click();
  assert.equal(actions[0].kind, "popup", "captive : le tap explique, il n'écrit rien");
  const garrot = ligne(node, "garrot");
  assert.equal(ronds(garrot)[0].getAttribute("data-active"), "true");
  ronds(garrot)[0].click();
  assert.deepEqual(actions[1], { kind: "clear", path: "fh.skills.train.garrot" }, "le second tap rend le training");
  /* Le nom d'un training est un lien bleu qui ouvre son popup (description du record). */
  const nom = garrot.querySelectorAll(".skills-ligne-lien")[0];
  assert.ok(nom, "le nom est cliquable");
  nom.click();
  assert.equal(actions[2].kind, "popup");
  assert.equal(actions[2].titre, "Garrot");
  assert.equal(actions[2].actions[0].mot, "Remove", "un training libre se retire depuis son popup");
  /* 🔴 LE TÉMOIN CONTRAIRE : une langue LIÉE n'offre pas Remove (Eric : « bloqué car bound »). */
  elf.querySelectorAll(".skills-ligne-lien")[0].click();
  assert.deepEqual(actions[3].actions, [], "un lié ne se retire pas d'ici");
  node.querySelectorAll(".skills-ajout")[1].click(); // le second disque : « Add a training »
  assert.equal(skillsEcran().ajout, "training");
  const nodeSel = renderSkillsStep(ctxFrom(rogue, () => {}));
  const selecteur = nodeSel.querySelectorAll(".skills-selecteur")[0];
  assert.equal(selecteur.querySelectorAll(".glisse-jeton").length, 10, "une seule page : les dix trainings restants tiennent dans douze");
  assert.equal(selecteur.querySelectorAll(".grille-compte").length, 0, "13 moins les 3 déjà là tiennent sur une page : pas de pagineur");
  skillsReinitialiserEcran();
});

/* ══ 7 — L'AIGUILLEUR LIT LE RECORD : le droit d'Expertise, par personnage ══ */

test("l'aiguilleur dit le droit d'Expertise de CE personnage, nombres lus sur le record — Rogue, Wizard, Wizard avec Late Bloomer", () => {
  surLaPage(0);
  const rogueClass = query({ kind: "class", id: "srd:class:en:rogue" }).record.data.fh_skill_pool;
  const rogue = renderSkillsStep(ctxFrom(rebuild(rogueDocument())));
  assert.match(texteDe(aiguilleur(rogue)), new RegExp(`up to ${rogueClass.expertise_cap.max} at level ${rogueClass.expertise_cap.through_level}`));
  const wizardClass = query({ kind: "class", id: "srd:class:en:wizard" }).record.data.fh_skill_pool;
  const wizard = renderSkillsStep(ctxFrom(fixture.report));
  assert.match(texteDe(aiguilleur(wizard)), new RegExp(`Expertise unlocks at level ${wizardClass.expertise_from_level}`));
  const tardif = renderSkillsStep(ctxFrom(rebuild(set(fixture.report.document, "fh.skills.trait.late-bloomer", true))));
  assert.match(texteDe(aiguilleur(tardif)), /Late Bloomer: 1 Expertise before level 4/, "le trait, son compte et le relais de la classe — tous lus");
  assert.match(texteDe(aiguilleur(wizard)), /Novice 1 · Adept 2 · Expert 4/, "la consigne des paliers vient de tier_costs");
});

/* ══ 8 — SRD PUR : aucune mécanique FH, l'écran ne casse pas ═════════════ */

test("un personnage SRD pur (couche FH débrayée) : aucune mécanique FH n'apparaît, l'écran ne casse pas", () => {
  surLaPage(0);
  const srdHarness = makeHarness({ layers: [SRD_FR, HOMEBREW] }); // AUCUN module (§0.12) — le pli SRD nu
  const document = {
    schema: "fh-char/1", id: "srd-pur", name: "SRD pur", lang: "fr",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/skills-step", version: "1.0.0" },
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: {
      layers: manifestOf(srdHarness.layers),
      choices: [
        { path: "level", value: 1, label: "Level 1" },
        { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" }, label: "Magicien" },
        { path: "abilities.mode", value: "standard", label: "Standard array" },
        { path: "abilities.str", value: 8 }, { path: "abilities.dex", value: 14 },
        { path: "abilities.con", value: 13 }, { path: "abilities.int", value: 15 },
        { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 10 },
        { path: "class.skills[0]", value: "investigation" }, { path: "class.skills[1]", value: "religion" }
      ],
      budgets: {}, overrides: []
    }
  };
  const report = srdHarness.verbs.rebuild({ document });
  assert.equal(report.resolved.stats.length, 0, "mesure : aucun module monté, aucune stat FH");
  const node = renderSkillsStep({
    resolved: report.resolved, decisions: report.decisions, violations: srdHarness.verbs.validate({ document: report.document }).violations,
    query: srdHarness.layers.verbs.query, onAction: () => {}
  });
  assert.equal(node.querySelectorAll(".skills-free-spent").length, 0, "pas de compte sans fh:skill-points");
  assert.match(texteDe(aiguilleur(node)), /SRD/, "l'aiguilleur le dit");
  assert.ok(lignes(node).length > 0, "la liste SRD s'affiche quand même — sans catégorie, une seule page « Skills »");
  assert.equal(node.querySelectorAll(".skills-page")[0].getAttribute("data-page"), "skills");
  assert.equal(ronds(lignes(node)[0]).length, 0, "aucun palier achetable : pas de ronds");
  assert.equal(lignes(node)[0].querySelectorAll(".skills-ligne-static").length, 1);
  const mots = node.textContent;
  for (const interdit of ["Novice", "Adept", "Expert", "Late Bloomer", "Fate"]) {
    assert.equal(mots.includes(interdit), false, `un SRD pur ne cite pas « ${interdit} »`);
  }
});

/* ══ 9 — ⚔️ UN TOTAL MENTEUR S'AFFICHE MENTEUR ══════════════════════════ */

test("⚔️ ATTAQUE — un fh:skill-points menteur (value ≠ somme du détail) s'affiche MENTEUR, jamais recalculé", () => {
  surLaPage(0);
  const report = rebuild(set(fixture.report.document, "fh.skills.spend.academics", "adept"));
  const stat = report.resolved.stats.find((s) => s.id === "fh:skill-points");
  const vrai = stat.value;
  stat.value = 99; // le mensonge
  const node = renderSkillsStep(ctxFrom(report));
  const budget = [...node.querySelectorAll(".skills-free-nombre")][0];
  assert.equal(texteDe(budget), String(2 + 99), "Budget = dépensé + reste LU (99), jamais la somme du détail");
  assert.equal(texteDe(spent(node)), "2", "le dépensé, lui, vient du détail");
  assert.notEqual(2 + 99, 2 + vrai, "témoin : le mensonge est visible");
});

test("La rangée d'onglets change au glisser latéral, comme la fenêtre (Eric, 07/09 : « swipe latéral sur la molette doit être actif »)", () => {
  skillsReinitialiserEcran();
  const node = renderSkillsStep(ctxFrom(fixture.report, () => {}));
  const tambour = node.querySelectorAll(".skills-onglets-hote")[0];
  const centre = () => node.querySelectorAll('.skills-onglet[aria-current="true"]')[0].textContent;
  const avant = centre();
  tambour.dispatchEvent({ type: "pointerdown", target: tambour, clientX: 200, clientY: 10 });
  tambour.dispatchEvent({ type: "pointerup", target: tambour, clientX: 100, clientY: 12 });
  const apres = centre();
  assert.notEqual(apres, avant, "un glisser vers la gauche avance d'une page");
  /* 🔴 LE TÉMOIN CONTRAIRE : un geste plus haut que large est un défilement, pas un tour. */
  tambour.dispatchEvent({ type: "pointerdown", target: tambour, clientX: 200, clientY: 10 });
  tambour.dispatchEvent({ type: "pointerup", target: tambour, clientX: 150, clientY: 90 });
  assert.equal(centre(), apres, "un geste vertical ne tourne pas");
  skillsReinitialiserEcran();
});
