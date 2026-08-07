/* Utilitaires purs du moteur de jets.
   Portés de fh-phb `docs/javascripts/fh-utils.js` (branche split-pure-modules,
   prouvés purs) et de `fh-player-sheet.js` sur main. Entrée → sortie, rien
   d'autre : ni DOM, ni `window`, ni réseau.

   Ce qui n'est PAS venu de fh-utils.js : `esc` (échappement HTML — c'est de
   l'UI), `nowLabel` (formatage horaire localisé — de l'UI aussi), et
   `numberOr`/`pbFor`, dont le moteur de jets ne se sert pas : ils suivront le
   bloc qui en a besoin (`build`), plutôt que d'attendre ici sans emploi. */

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function mod(score) {
  return Math.floor(((Number(score) || 10) - 10) / 2);
}

export function signed(value) {
  value = Number(value) || 0;
  return (value >= 0 ? "+" : "") + value;
}

/* Le hasard est INJECTÉ, il ne se lit plus sur `window.crypto`. C'est ce qui
   remplace le `sandbox.crypto` des suites v1 : la file déterministe des tests
   devient un paramètre, pas un global à truquer. L'échantillonnage par rejet
   de la v1 est conservé tel quel — sans lui, `0x100000000 % sides` biaise les
   faces basses. */
export function makeRollDie(randomUint32) {
  return function rollDie(sides) {
    sides = Math.max(2, Number(sides) || 20);
    const max = Math.floor(0x100000000 / sides) * sides;
    let value;
    do {
      value = randomUint32() >>> 0;
    } while (value >= max);
    return (value % sides) + 1;
  };
}

/* La source par défaut, quand personne n'injecte : le CSPRNG de la plateforme.
   `globalThis.crypto` existe en Node ≥ 19 et dans tout navigateur — aucun
   repli silencieux vers Math.random, un environnement sans crypto doit se
   plaindre plutôt que rouler des dés prévisibles. */
export function platformRandomUint32() {
  if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
    throw new Error("fhpc/play: no CSPRNG available — inject randomUint32");
  }
  const bucket = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bucket);
  return bucket[0];
}

export function platformUuid() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return "fh-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}
