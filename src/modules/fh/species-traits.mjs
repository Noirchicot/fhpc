/* ══ LES TRAITS FH D'UNE ESPÈCE ARRIVENT SUR LA FICHE ═════════════════
   Lot 148 bis, 2026-09-03. Décision d'Eric, le même jour : « je veux que ces
   traits soient présents sur les fiches, il faut corriger cette erreur. »

   ── LE DÉFAUT QUE CE FICHIER EXISTE POUR FERMER ───────────────────────

   Trois espèces portent un trait Fate's Hand, et les trois AGISSAIENT sans
   jamais APPARAÎTRE :

       Elfe      `splinter-of-anon`   Base de Destinée +2
       Halfelin  `outlasting`         Avantage aux jets de Chaos
       Humain    `twice-born`         2 Points de Destinée au repos long

   Le pli construit `resolved.traits[]` depuis `data.traits` seul ; les traits
   FH vivent dans `data[fh_traits]`. Le lot 147 avait NOMMÉ ce défaut sans le
   corriger — délibérément : il déplaçait une préséance, pas un contenu
   visible, et mêler les deux les aurait perdus tous les deux.

   ⭐ ET CE N'EST PAS SYMÉTRIQUE, ce qui est la vraie raison d'urgence. Le
   trait de l'Elfe produit un NOMBRE, et ce nombre s'affiche déjà (la ligne
   « Splinter of Anon » du Score de Destinée). Ceux du Halfelin et de l'Humain
   ne produisent aucun nombre : ce sont des règles à se rappeler À LA TABLE.
   Absentes de la fiche, le joueur ne peut pas savoir qu'il les a.

   ── ⛔ POURQUOI ÇA NE POUVAIT PAS SE RÉPARER DANS `src/build/` ─────────

   La loi §0.12 : « LE SRD EST LA BASE, FH EST UNE COUCHE PAR-DESSUS. » Le pli
   ne cite aucune mécanique de la maison et n'importe rien de `src/modules/`.
   Deux gardes de `tests/build-block.test.mjs` la tiennent, et le second mord
   jusque sur le MOT : son motif `/\bfh[A-Z_]/` voit `fh_traits` écrit en
   toutes lettres. ⛔ Corriger dans le pli aurait demandé de DÉSARMER un garde
   pour faire passer une réparation — la faute que ce dépôt a déjà payée.

   ⭐ LE CANAL EXISTAIT, ouvert au lot 36 : un module rend `traits`, et la
   dérivation les AJOUTE à `resolved.traits[]` sans savoir d'où ils viennent
   (`skill-pool.mjs` s'en sert depuis). Ce fichier n'invente donc aucun
   mécanisme — il pose le module qui manquait, et il ne fait QUE ça.

   ── LE DRAPEAU, ET POURQUOI IL EST NEUF ───────────────────────────────

   `fh-species-en` levait deux drapeaux, et chacun justifié par une MÉCANIQUE
   que la couche appelle (`fh.destiny` pour les Bases, `fh.chaos` pour
   l'Avantage d'`Outlasting`). Aucun des deux ne dit la chose dont il s'agit
   ici, qui n'est pas une mécanique : **cette couche AJOUTE des traits, et il
   faut quelqu'un pour les publier.** Les loger sous `fh.destiny` aurait fait
   publier `Outlasting` — un trait de Chaos — par le module du Score de
   Destinée : un mensonge dans le code, du genre que ce dépôt relit six mois
   plus tard sans comprendre.

   `fh.species` se justifie donc exactement comme ses deux voisins, et dans
   les mêmes mots : sans le module, le contenu de la couche ne veut rien dire
   — ici, le trait s'applique et le joueur ne le voit nulle part.

   ⛔ CE MODULE NE PUBLIE AUCUNE STATISTIQUE, et c'est voulu : il n'a pas de
   `stat`. Il ne lit aucun choix, n'en consomme aucun, ne juge rien. Une
   dépendance de plus ici serait une porte ouverte sur un module fourre-tout. */

import { traitsDeLEspece } from "./traits.mjs";

export const FH_SPECIES_FLAG = "fh.species";
export const FH_SPECIES_TRAITS_ID = "fh:species-traits";

/**
 * Le module que le bloc `build` reçoit par injection. Il ne connaît ni le
 * noyau, ni le bus, ni le document : le pli lui tend le record d'espèce
 * qu'il a déjà su lire, et il rend les traits à AJOUTER à la fiche.
 */
export function createFhSpeciesTraits() {
  return {
    flag: FH_SPECIES_FLAG,
    id: FH_SPECIES_TRAITS_ID,

    /**
     * @param {object} input
     * @param {object|null} input.species le record d'espèce choisi : `{id, name, slug, data}`
     * @returns {{traits: Array<{id: string, name: string, text?: string, source: string}>}}
     */
    contribute({ species }) {
      if (!species || !species.data) return { traits: [] };

      /* ⭐ LA PRÉSÉANCE VIENT DU LIEU UNIQUE (lot 147), jamais d'une fusion
         écrite ici : à identité égale, le trait FH supplante son homologue SRD
         EN GARDANT SA PLACE. C'est ce qui fera qu'une couche `srfh+` pourra
         remplacer le texte d'un trait SRD sans que la fiche se réordonne sous
         les yeux du joueur (route D). */
      const fusionnes = traitsDeLEspece({ data: species.data });

      /* ⛔ ET ON NE REND QUE CE QUE LE PLI N'A PAS DÉJÀ. Le pli publie les
         traits de `data.traits` ; le canal `traits` du lot 36 AJOUTE sans
         dédoublonner. Rendre la liste entière poserait chaque trait SRD deux
         fois sur la fiche — un doublon que ni un compte, ni un total ne
         verraient (« un total juste ne dit rien du contenu »).

         🔴 ET C'EST LA FRONTIÈRE DE CE LOT, NOMMÉE PLUTÔT QUE MASQUÉE. Ce
         canal sait AJOUTER, il ne sait pas SUPPLANTER : le jour où `srfh+`
         portera l'homologue d'un trait SRD (route D), le pli publierait la
         version SRD et cette boucle la sauterait — la préséance calculée
         juste au-dessus ne se verrait PAS sur la fiche. Ce jour-là il faudra
         ouvrir un canal de REMPLACEMENT côté pli, comme `skillTiers` en a un.
         ⭐ Mesuré aujourd'hui : ZÉRO collision d'id (3 traits FH, aucun
         homologue). Et ce n'est pas une supposition qu'on se repasse — un
         garde tient le compte exact et rougira le jour où il changera
         (`tests/fiche-porte-les-traits-fh.test.mjs`). */
      const dejaPubliees = new Set(
        (Array.isArray(species.data.traits) ? species.data.traits : [])
          .filter((trait) => trait && typeof trait.id === "string")
          .map((trait) => trait.id)
      );

      const traits = [];
      for (const trait of fusionnes) {
        if (typeof trait.id !== "string" || dejaPubliees.has(trait.id)) continue;
        /* La SOURCE est le nom de l'espèce, comme pour un trait SRD : le
           joueur doit lire d'où il tient la règle. Le mot vient du record
           (loi §0.13) — rien n'est composé ici. */
        const entry = { id: trait.id, name: trait.name, source: species.name };
        if (typeof trait.text === "string") entry.text = trait.text;
        traits.push(entry);
      }
      return { traits };
    }
  };
}
