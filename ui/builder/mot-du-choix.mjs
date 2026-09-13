/* ══ LE MOT D'UN CHOIX — lot 191 ══════════════════════════════════════════
   ⛔ JAMAIS UN ID NU À L'ÉCRAN. Un choix dont le record n'est plus dans la
   pile montée se NOMME, et il dit pourquoi il ne se résout pas.

   📏 LE DÉFAUT, VU EN LIGNE (v614) LE 2026-09-09 : le personnage de test
   d'Eric est un Araag (espèce Fate's Hand). Fate's Hand éteint depuis
   `Layers`, l'écran Species affichait

       fh:species:en:araag
       Granted automatically
       This step is settled. Change your mind if you want to start it over.

   — l'id nu, et un « settled » faux. C'est exactement le défaut du lot 181
   (*« une gemme achetée s'affichait `fh:gem:en:azurite` »*), réparé ce
   jour-là DANS `equipment-step.mjs` seulement.

   🔴 POURQUOI UN MODULE À PART, ET PAS `recordName` DANS `catalogue.mjs` :
   `recordName(query, kind, id)` rendait `id` quand le record manquait — et
   NEUF écrans en portaient leur propre copie (`skillLabel`, `featLabel`,
   `nomDuRecord`, `listeLabel`, `spellLabel`, `weaponLabel`, `renderFrame`,
   `nomAffiche`…), toutes avec le même repli sur l'id. *« Un organe que N
   écrans fabriquent sera oublié »* (mémoire de la maison) : le lot 181 a
   réparé UNE copie, les huit autres sont restées. Celui-ci est le SEUL
   endroit qui sait quoi dire d'un record absent, et il ne lit qu'UNE feuille
   (`interrupteurs.mjs`, qui n'importe rien) — il doit pouvoir servir
   `carnet.mjs` (le mot d'un verrou) comme `catalogue.mjs`, sans cycle.

   ⚖️ LA LOI (ARCHITECTURE.md) : *« une place réservée = présente, éteinte, un
   mot »* et *« un contenu sans sa règle s'affiche INERTE, sa règle nommée »*.
   Et l'asymétrie qu'Eric a levée le 09/09 — *« que le personnage ne se
   dissocie pas, pas trop grave »* — donc ON N'EFFACE PAS LE CHOIX : rien
   n'est effacé, tout revient quand la couche se rallume. On le MONTRE comme
   non résolu.

   ⚠️ LE NOM SAUVEGARDÉ N'EXISTE PAS DANS LE DOCUMENT : seul `ref.id` est
   écrit. Le mot affichable d'un record absent vient donc de l'id HUMANISÉ —
   dernier segment, tirets → espaces, majuscule — plus le refus nommé. Le
   même segment nomme déjà l'image de fiche (`imageDeFiche`, catalogue.mjs) :
   ce n'est pas une convention neuve.

   ⚖️ LE MOT NOMME L'INTERRUPTEUR QUI PORTE LE RECORD — Eric, 09/09, gravé
   dans `ARCHITECTURE.md` (§ « LES ESPÈCES FATE'S HAND SONT DU LORE ») :
   *« Araag comes with World — switch it on in Layers »* (l'interrupteur
   s'appelait Lore ; Eric l'a nommé World le 10/09, lot 192, et le mot suit
   le LABEL de la table — rien n'est recopié ici). ⛔ Jamais « Fate's
   Hand » en général quand un interrupteur précis suffit : c'est ce qui rend
   le refus ACTIONNABLE — le joueur sait quelle ligne de `Layers` pousser.
   L'interrupteur se trouve par `interrupteurs.mjs` (une feuille sans import :
   dans quelle couche vit l'id, puis quel interrupteur porte cette couche —
   c'est un repli par préfixe, et sa tête dit pourquoi). Le maître (« Fate's
   Hand ») n'est nommé que pour le catalogue (les gemmes), qui n'a pas
   d'enfant ; un id dont la couche est inconnue retombe sur
   `MOT_HORS_PILE`, la voix de `ecran-mort.mjs` (*« a ruleset your layer
   stack no longer carries »*) — la pile est un jeu de règles pour le joueur,
   jamais « une couche ». */

import { interrupteurDUnId } from "./interrupteurs.mjs?v=625";

/** Le refus de DERNIER RECOURS — un record dont aucune couche connue ne
 *  répond (un préfixe étranger). Quand l'interrupteur se nomme, c'est lui
 *  qu'on lit, jamais ce mot. */
export const MOT_HORS_PILE = "not in this ruleset";

/** Le refus qui nomme l'interrupteur — Eric, 09/09, mot pour mot :
 *  « comes with World — switch it on in Layers ». */
export function motDuRefus(id) {
  const sw = interrupteurDUnId(id);
  return sw ? `comes with ${sw.label} — switch it on in Layers` : `— ${MOT_HORS_PILE}`;
}

/** Le dernier segment d'un identifiant, humanisé : `fh:species:en:araag` →
 *  « Araag », `fh:training:en:language-elf` → « Language elf ». Un slug sans
 *  deux-points (« stealth ») passe tel quel, capitalisé.
 *  ⛔ Ce n'est PAS un nom de record — c'est le mot de secours d'un record que
 *  la pile ne porte pas. Quand le record existe, c'est SON `name` qu'on lit. */
export function motHumainDeLId(id) {
  const brut = String(id === null || id === undefined ? "" : id).split(":").pop().replace(/[-_]+/g, " ").trim();
  return brut ? brut[0].toUpperCase() + brut.slice(1) : "";
}

/** Le mot d'un record que la pile NE PORTE PAS : « Araag comes with World —
 *  switch it on in Layers ». ⛔ Jamais l'id. */
export function motDUnRecordAbsent(id) {
  return `${motHumainDeLId(id) || "Unknown"} ${motDuRefus(id)}`;
}

/** LE MOT D'UN CHOIX — le nom du record s'il se résout, sinon le slug
 *  humanisé plus le refus nommé. Chaque écran qui affiche un choix passe
 *  par ici : Species, Class, Inheritance, Background, Equipment, le Sheet.
 *  @param {Function} query  le lecteur de couches (`layers.verbs.query`)
 *  @param {string} kind     le genre du record
 *  @param {string} id       l'identifiant écrit dans le document
 *  @returns {string} un mot — `""` sans id (rien à nommer) */
export function motDuChoix(query, kind, id) {
  if (id === null || id === undefined || id === "") return "";
  const view = typeof query === "function" ? query({ kind, id }) : null;
  const nom = view && view.record ? view.record.name : null;
  return typeof nom === "string" && nom.length > 0 ? nom : motDUnRecordAbsent(id);
}
