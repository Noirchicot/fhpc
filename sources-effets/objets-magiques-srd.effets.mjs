/* ══ ⛔ GÉNÉRÉ, NE PAS ÉDITER — la copie ES de `objets-magiques-srd.effets.json` ══════
   Source : le `.json` voisin, SEULE vérité. Une correction se fait LÀ, puis
   `node src/tools/gen-effets-objets.mjs`, puis on commite les deux fichiers ensemble.
   ⭐ Pourquoi une copie : le moteur la lit par `import`, dans la page comme sous Node, sans
   `fetch` ni disque (voir la tête du générateur). Sans perte : le JSON, tel quel.
   🔴 Seul lecteur autorisé : `src/build/effets-objets.mjs` (garde 6 de
   `tests/effets-objets.test.mjs`). */
export default {
 "schema": "fhpc/effets-objets/1",
 "source": "srd-5.2.1-en",
 "date": "2026-09-26",
 "statut": "inventaire — LU PAR LE MOTEUR depuis le lot 289 (famille « chiffre » ; Eric, 26/09 : « un précurseur déjà qui liste tous les effets, après la fiche décidera de comment les appliquer »). ⛔ Ne se lit JAMAIS directement : sa copie ES `objets-magiques-srd.effets.mjs` est générée par `src/tools/gen-effets-objets.mjs`.",
 "familles": {
  "chiffre": "modifie un nombre de la fiche",
  "capacite": "trait tant que l’objet agit",
  "action": "pouvoir activé, sort, charges",
  "autre": "le reste"
 },
 "conditions": [
  "porte",
  "tenu",
  "harmonise+porte",
  "harmonise+tenu",
  "harmonise",
  "active",
  "consomme",
  "toujours"
 ],
 "modes": [
  "bonus",
  "fixe",
  "plafond",
  "plancher",
  "octroi",
  "avantage",
  "desavantage",
  "resistance",
  "immunite",
  "sort",
  "texte"
 ],
 "objets": [
  {
   "id": "srd:item:en:adamantine-armor",
   "name": "Adamantine Armor",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.critical-hit",
     "mode": "texte",
     "valeur": "Critical Hit becomes a normal hit",
     "plafond": null,
     "condition": "porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "any Critical Hit against you becomes a normal hit"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ammunition-of-slaying",
   "name": "Ammunition of Slaying",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.extra-damage",
     "mode": "texte",
     "valeur": "+6d10 Force vs chosen creature type, DC 17 Con half",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "taking an extra 6d10 Force damage on a failed save"
    }
   ],
   "note": "Type de créature choisi par le MJ (table 1d100) ; devient non magique après usage."
  },
  {
   "id": "srd:item:en:ammunition-1-2-or-3",
   "name": "Ammunition, +1, +2, or +3",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "+1",
     "citation": "You have a bonus to attack rolls and damage rolls made with this piece of magic ammunition"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "+1",
     "citation": "You have a bonus to attack rolls and damage rolls made with this piece of magic ammunition"
    },
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "+2",
     "citation": "You have a bonus to attack rolls and damage rolls made with this piece of magic ammunition"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "+2",
     "citation": "You have a bonus to attack rolls and damage rolls made with this piece of magic ammunition"
    },
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "+3",
     "citation": "You have a bonus to attack rolls and damage rolls made with this piece of magic ammunition"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "+3",
     "citation": "You have a bonus to attack rolls and damage rolls made with this piece of magic ammunition"
    }
   ],
   "note": "Valeur du bonus tirée du nom (+1/+2/+3 selon la rareté), pas chiffrée dans le texte ; perd sa magie après avoir touché."
  },
  {
   "id": "srd:item:en:amulet-of-health",
   "name": "Amulet of Health",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.con",
     "mode": "fixe",
     "valeur": 19,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "Your Constitution is 19 while you wear this amulet."
    }
   ],
   "note": "La description se termine par un résidu parasite (« Amulet of Proof against Detection »)."
  },
  {
   "id": "srd:item:en:amulet-of-proof-against-detection-and-location",
   "name": "Amulet of Proof against Detection and Location",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.anti-divination",
     "mode": "texte",
     "valeur": "untargetable by Divination spells and scrying",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you can’t be targeted by Divination spells or perceived through magical scrying sensors unless you allow it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:amulet-of-the-planes",
   "name": "Amulet of the Planes",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.plane-shift",
     "mode": "sort",
     "valeur": "DC 15 Intelligence (Arcana) check",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "make a DC 15 Intelligence (Arcana) check. On a successful check, you cast Plane Shift."
    },
    {
     "famille": "autre",
     "cible": "other.random-plane-travel",
     "mode": "texte",
     "valeur": "on failed check, random destination (1d100)",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you and each creature and object within 15 feet of you travel to a random destination"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:animated-shield",
   "name": "Animated Shield",
   "effets": [
    {
     "famille": "action",
     "cible": "other.animate-shield",
     "mode": "texte",
     "valeur": "Bonus Action, 1 minute, hands free",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you can take a Bonus Action to cause it to animate"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:apparatus-of-the-crab",
   "name": "Apparatus of the Crab",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.vehicle",
     "mode": "texte",
     "valeur": "Large vehicle, AC 20, HP 200, Speed 30, Swim 30",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The Apparatus of the Crab is a Large object with the following statistics: AC 20; HP 200"
    },
    {
     "famille": "action",
     "cible": "other.claw-attack",
     "mode": "texte",
     "valeur": "+8 to hit, 2d6 Bludgeoning",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "+8 to hit, reach 5 ft. Hit: 7 (2d6) Bludgeoning damage."
    }
   ],
   "note": "Véhicule : aucun effet sur la fiche du pilote."
  },
  {
   "id": "srd:item:en:armor-of-invulnerability",
   "name": "Armor of Invulnerability",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.bludgeoning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Resistance to Bludgeoning, Piercing, and Slashing damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.piercing",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Resistance to Bludgeoning, Piercing, and Slashing damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.slashing",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Resistance to Bludgeoning, Piercing, and Slashing damage while you wear this armor."
    },
    {
     "famille": "action",
     "cible": "immunity.bludgeoning",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/dawn",
     "variante": null,
     "citation": "give yourself Immunity to Bludgeoning, Piercing, and Slashing damage for 10 minutes"
    },
    {
     "famille": "action",
     "cible": "immunity.piercing",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/dawn",
     "variante": null,
     "citation": "give yourself Immunity to Bludgeoning, Piercing, and Slashing damage for 10 minutes"
    },
    {
     "famille": "action",
     "cible": "immunity.slashing",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/dawn",
     "variante": null,
     "citation": "give yourself Immunity to Bludgeoning, Piercing, and Slashing damage for 10 minutes"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:armor-of-resistance",
   "name": "Armor of Resistance",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.acid",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Acid",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.cold",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Cold",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Fire",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.force",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Force",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.lightning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Lightning",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.necrotic",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Necrotic",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.poison",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Poison",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.psychic",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Psychic",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.radiant",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Radiant",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "resistance.thunder",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Thunder",
     "citation": "You have Resistance to one type of damage while you wear this armor."
    }
   ],
   "note": "Type choisi par le MJ ou tiré (1d10) ; une variante par type."
  },
  {
   "id": "srd:item:en:armor-of-vulnerability",
   "name": "Armor of Vulnerability",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.bludgeoning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Bludgeoning",
     "citation": "you have Resistance to one of the following damage types: Bludgeoning, Piercing, or Slashing"
    },
    {
     "famille": "capacite",
     "cible": "resistance.piercing",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Piercing",
     "citation": "you have Resistance to one of the following damage types: Bludgeoning, Piercing, or Slashing"
    },
    {
     "famille": "capacite",
     "cible": "resistance.slashing",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Slashing",
     "citation": "you have Resistance to one of the following damage types: Bludgeoning, Piercing, or Slashing"
    },
    {
     "famille": "autre",
     "cible": "other.vulnerability",
     "mode": "texte",
     "valeur": "Vulnerability to the two other types",
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Vulnerability to two of the three damage types associated with the armor"
    },
    {
     "famille": "autre",
     "cible": "other.curse",
     "mode": "texte",
     "valeur": "curse persists until Remove Curse",
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "removing the armor fails to end the curse"
    }
   ],
   "note": "Objet maudit."
  },
  {
   "id": "srd:item:en:armor-1-2-or-3",
   "name": "Armor, +1, +2, or +3",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "porte",
     "duree": "permanente",
     "charges": null,
     "variante": "+1",
     "citation": "You have a bonus to Armor Class while wearing this armor."
    },
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "porte",
     "duree": "permanente",
     "charges": null,
     "variante": "+2",
     "citation": "You have a bonus to Armor Class while wearing this armor."
    },
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "porte",
     "duree": "permanente",
     "charges": null,
     "variante": "+3",
     "citation": "You have a bonus to Armor Class while wearing this armor."
    }
   ],
   "note": "Valeur du bonus tirée du nom (selon la rareté), pas chiffrée dans le texte."
  },
  {
   "id": "srd:item:en:arrow-catching-shield",
   "name": "Arrow-Catching Shield",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to Armor Class against ranged attack rolls while you wield this Shield."
    },
    {
     "famille": "action",
     "cible": "other.intercept-ranged",
     "mode": "texte",
     "valeur": "Reaction: become the target of a ranged attack",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Reaction to become the target of the attack instead"
    }
   ],
   "note": "Le +2 CA ne vaut que contre les attaques à distance."
  },
  {
   "id": "srd:item:en:bag-of-beans",
   "name": "Bag of Beans",
   "effets": [
    {
     "famille": "action",
     "cible": "other.explosion",
     "mode": "texte",
     "valeur": "10-ft Sphere, DC 15 Dex, 5d4 Force",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": "3d4 beans",
     "variante": null,
     "citation": "taking 5d4 Force damage on a failed save or half as much damage on a successful one"
    },
    {
     "famille": "autre",
     "cible": "other.random-effect",
     "mode": "texte",
     "valeur": "planted bean: random effect (1d100)",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the bean disappears as it produces an effect 1 minute later"
    },
    {
     "famille": "autre",
     "cible": "hp.temp",
     "mode": "texte",
     "valeur": "5d6 for 1 hour (even roll)",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "01",
     "citation": "the eater gains 5d6 Temporary Hit Points for 1 hour"
    },
    {
     "famille": "autre",
     "cible": "other.ability-increase",
     "mode": "texte",
     "valeur": "lowest ability score +1 (DC 20 Con)",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "81–90",
     "citation": "a creature permanently increases its lowest ability score by 1"
    }
   ],
   "note": "Effets de plantation aléatoires ; seuls deux résultats de table touchent la fiche."
  },
  {
   "id": "srd:item:en:bag-of-devouring",
   "name": "Bag of Devouring",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": "devours organic matter; 1 cubic foot of objects",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Animal or vegetable matter placed wholly in the bag is devoured and lost forever."
    }
   ],
   "note": "Piège : ressemble à un Bag of Holding."
  },
  {
   "id": "srd:item:en:bag-of-holding",
   "name": "Bag of Holding",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": "500 lb, 64 cubic feet, weighs 5 lb",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:bag-of-tricks",
   "name": "Bag of Tricks",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon-creature",
     "mode": "texte",
     "valeur": "creature from the Gray table (1d8)",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3/dawn",
     "variante": "Gray",
     "citation": "Once three fuzzy objects have been pulled from the bag, the bag can’t be used again until the next dawn."
    },
    {
     "famille": "action",
     "cible": "other.summon-creature",
     "mode": "texte",
     "valeur": "creature from the Rust table (1d8)",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3/dawn",
     "variante": "Rust",
     "citation": "Once three fuzzy objects have been pulled from the bag, the bag can’t be used again until the next dawn."
    },
    {
     "famille": "action",
     "cible": "other.summon-creature",
     "mode": "texte",
     "valeur": "creature from the Tan table (1d8)",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3/dawn",
     "variante": "Tan",
     "citation": "Once three fuzzy objects have been pulled from the bag, the bag can’t be used again until the next dawn."
    }
   ],
   "note": "La couleur du sac fixe la table des créatures."
  },
  {
   "id": "srd:item:en:bead-of-force",
   "name": "Bead of Force",
   "effets": [
    {
     "famille": "action",
     "cible": "other.force-sphere",
     "mode": "texte",
     "valeur": "10-ft Sphere, DC 15 Dex, 5d4 Force, trapped 1 minute",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "Each creature in the Sphere must succeed on a DC 15 Dexterity saving throw or take 5d4 Force damage."
    }
   ],
   "note": "Trouvées par 1d4 + 4."
  },
  {
   "id": "srd:item:en:bead-of-nourishment",
   "name": "Bead of Nourishment",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.nourishment",
     "mode": "texte",
     "valeur": "1 day of Rations",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "provides as much nourishment as 1 day of Rations"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:belt-of-dwarvenkind",
   "name": "Belt of Dwarvenkind",
   "effets": [
    {
     "famille": "capacite",
     "cible": "language",
     "mode": "octroi",
     "valeur": "Dwarvish",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You know Dwarvish."
    },
    {
     "famille": "capacite",
     "cible": "advantage.persuasion",
     "mode": "avantage",
     "valeur": "with dwarves and duergar",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Advantage on Charisma (Persuasion) checks made to interact with dwarves and duergar."
    },
    {
     "famille": "chiffre",
     "cible": "ability.con",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 20,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "Your Constitution increases by 2, to a maximum of 20."
    },
    {
     "famille": "autre",
     "cible": "other.beard",
     "mode": "texte",
     "valeur": "50% per day",
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "a 50 percent chance each day at dawn of growing a full beard"
    },
    {
     "famille": "capacite",
     "cible": "sense.darkvision",
     "mode": "octroi",
     "valeur": 60,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "non-dwarf",
     "citation": "Darkvision. You have Darkvision with a range of 60 feet."
    },
    {
     "famille": "capacite",
     "cible": "resistance.poison",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "non-dwarf",
     "citation": "Resilience. You have Resistance to Poison damage."
    },
    {
     "famille": "capacite",
     "cible": "advantage.save-poisoned",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "non-dwarf",
     "citation": "You also have Advantage on saving throws you make to avoid or end the Poisoned condition."
    }
   ],
   "note": "Vision, résistance et avantage contre Poisoned : seulement si le porteur n’est ni nain ni duergar (variante « non-dwarf »)."
  },
  {
   "id": "srd:item:en:belt-of-giant-strength",
   "name": "Belt of Giant Strength",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 21,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Hill",
     "citation": "Belt of Giant Strength (hill) 21"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 23,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Frost or Stone",
     "citation": "Belt of Giant Strength (frost or stone) 23"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 25,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Fire",
     "citation": "Belt of Giant Strength (fire) 25"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 27,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Cloud",
     "citation": "Belt of Giant Strength (cloud) 27"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 29,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Storm",
     "citation": "Belt of Giant Strength (storm) 29"
    }
   ],
   "note": "Sans effet si la Force de base est déjà égale ou supérieure."
  },
  {
   "id": "srd:item:en:berserker-axe",
   "name": "Berserker Axe",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "hp.max",
     "mode": "bonus",
     "valeur": "+1 per level",
     "plafond": null,
     "condition": "harmonise",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Hit Point maximum increases by 1 for each level you have attained"
    },
    {
     "famille": "capacite",
     "cible": "disadvantage.attack-other-weapons",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You also have Disadvantage on attack rolls with weapons other than this one."
    },
    {
     "famille": "autre",
     "cible": "other.berserk",
     "mode": "texte",
     "valeur": "DC 15 Wis save when damaged",
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you must succeed on a DC 15 Wisdom saving throw or go berserk"
    },
    {
     "famille": "autre",
     "cible": "other.curse",
     "mode": "texte",
     "valeur": "unwilling to part with the weapon",
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you are unwilling to part with the weapon, keeping it within reach at all times"
    }
   ],
   "note": "Objet maudit."
  },
  {
   "id": "srd:item:en:boots-of-elvenkind",
   "name": "Boots of Elvenkind",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.silent-steps",
     "mode": "texte",
     "valeur": "steps make no sound",
     "plafond": null,
     "condition": "porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your steps make no sound, regardless of the surface you are moving across"
    },
    {
     "famille": "capacite",
     "cible": "advantage.stealth",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You also have Advantage on Dexterity (Stealth) checks."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:boots-of-levitation",
   "name": "Boots of Levitation",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.levitate",
     "mode": "sort",
     "valeur": "self only",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast Levitate on yourself."
    }
   ],
   "note": "Objet à harmonisation ; aucune limite d’usage indiquée."
  },
  {
   "id": "srd:item:en:boots-of-speed",
   "name": "Boots of Speed",
   "effets": [
    {
     "famille": "action",
     "cible": "speed.walk",
     "mode": "texte",
     "valeur": "x2",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "10 minutes per Long Rest",
     "variante": null,
     "citation": "the boots double your Speed"
    },
    {
     "famille": "action",
     "cible": "disadvantage.opportunity-attack-against-you",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "10 minutes per Long Rest",
     "variante": null,
     "citation": "any creature that makes an Opportunity Attack against you has Disadvantage on the attack roll"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:boots-of-striding-and-springing",
   "name": "Boots of Striding and Springing",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "speed.walk",
     "mode": "plancher",
     "valeur": 30,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Speed becomes 30 feet unless your Speed is higher"
    },
    {
     "famille": "capacite",
     "cible": "other.no-encumbrance-slow",
     "mode": "texte",
     "valeur": "Speed not reduced by weight or Heavy Armor",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Speed isn’t reduced by you carrying weight in excess of your carrying capacity or wearing Heavy Armor"
    },
    {
     "famille": "capacite",
     "cible": "other.jump",
     "mode": "texte",
     "valeur": "30 ft jump for 10 ft of movement, once per turn",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you can jump up to 30 feet by spending only 10 feet of movement"
    }
   ],
   "note": "La vitesse 30 est un PLANCHER (s’applique seulement si la vitesse est inférieure) ; mode « fixe » faute de mieux."
  },
  {
   "id": "srd:item:en:boots-of-the-winterlands",
   "name": "Boots of the Winterlands",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.cold",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Resistance to Cold damage"
    },
    {
     "famille": "capacite",
     "cible": "other.cold-tolerance",
     "mode": "texte",
     "valeur": "0 °F or lower",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "can tolerate temperatures of 0 degrees Fahrenheit or lower without any additional protection"
    },
    {
     "famille": "capacite",
     "cible": "other.ignore-difficult-terrain",
     "mode": "texte",
     "valeur": "ice or snow",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You ignore Difficult Terrain created by ice or snow."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:bowl-of-commanding-water-elementals",
   "name": "Bowl of Commanding Water Elementals",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon",
     "mode": "texte",
     "valeur": "Water Elemental, 1 hour",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/dawn",
     "variante": null,
     "citation": "you can take a Magic action to summon a Water Elemental"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:bracers-of-archery",
   "name": "Bracers of Archery",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.weapon-proficiency",
     "mode": "octroi",
     "valeur": "Longbow, Shortbow",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have proficiency with the Longbow and Shortbow"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +2 bonus to damage rolls made with such weapons"
    }
   ],
   "note": "Le +2 aux dégâts ne vaut qu’avec arc long et arc court."
  },
  {
   "id": "srd:item:en:bracers-of-defense",
   "name": "Bracers of Defense",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +2 bonus to Armor Class if you are wearing no armor and using no Shield."
    }
   ],
   "note": "Seulement sans armure ni bouclier."
  },
  {
   "id": "srd:item:en:brazier-of-commanding-fire-elementals",
   "name": "Brazier of Commanding Fire Elementals",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon",
     "mode": "texte",
     "valeur": "Fire Elemental, 1 hour",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/dawn",
     "variante": null,
     "citation": "you can take a Magic action to summon a Fire Elemental"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:brooch-of-shielding",
   "name": "Brooch of Shielding",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.force",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Resistance to Force damage"
    },
    {
     "famille": "capacite",
     "cible": "immunity.magic-missile",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Immunity to damage from the Magic Missile spell"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:broom-of-flying",
   "name": "Broom of Flying",
   "effets": [
    {
     "famille": "action",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": 50,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "It has a Fly Speed of 50 feet."
    },
    {
     "famille": "action",
     "cible": "other.send-away",
     "mode": "texte",
     "valeur": "travels alone up to 1 mile",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can send the broom to travel alone to a destination within 1 mile of you"
    }
   ],
   "note": "Vitesse de vol 30 au-delà de 200 lb ; c’est la vitesse du balai monté."
  },
  {
   "id": "srd:item:en:candle-of-invocation",
   "name": "Candle of Invocation",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "Dim Light 30 ft",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "the candle sheds Dim Light in a 30-foot radius"
    },
    {
     "famille": "action",
     "cible": "advantage.d20-tests",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "4 hours of burn",
     "variante": null,
     "citation": "While you are within that light, you have Advantage on D20 Tests."
    },
    {
     "famille": "action",
     "cible": "other.free-spell-slots",
     "mode": "texte",
     "valeur": "Cleric/Druid: level 1 spells without slots",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "4 hours of burn",
     "variante": null,
     "citation": "a Cleric or Druid in the light can cast level 1 spells they have prepared without expending spell slots"
    },
    {
     "famille": "action",
     "cible": "spell.gate",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "when you light the candle for the first time, you can cast Gate with it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:cape-of-the-mountebank",
   "name": "Cape of the Mountebank",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.dimension-door",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/dawn",
     "variante": null,
     "citation": "you can use it to cast Dimension Door as a Magic action"
    },
    {
     "famille": "autre",
     "cible": "other.smoke",
     "mode": "texte",
     "valeur": "Lightly Obscured",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "The space you left is Lightly Obscured by that smoke until the end of your next turn."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:carpet-of-flying",
   "name": "Carpet of Flying",
   "effets": [
    {
     "famille": "action",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": 80,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "3 ft. × 5 ft.",
     "citation": "01–20 3 ft. × 5 ft. 200 lb. 80 feet"
    },
    {
     "famille": "action",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": 60,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "4 ft. × 6 ft.",
     "citation": "21–55 4 ft. × 6 ft. 400 lb. 60 feet"
    },
    {
     "famille": "action",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": 40,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "5 ft. × 7 ft.",
     "citation": "56–80 5 ft. × 7 ft. 600 lb. 40 feet"
    },
    {
     "famille": "action",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": 30,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "6 ft. × 9 ft.",
     "citation": "81–00 6 ft. × 9 ft. 800 lb. 30 feet"
    }
   ],
   "note": "Vitesse de vol du tapis (véhicule), divisée par deux s’il est surchargé."
  },
  {
   "id": "srd:item:en:censer-of-controlling-air-elementals",
   "name": "Censer of Controlling Air Elementals",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon",
     "mode": "texte",
     "valeur": "Air Elemental, 1 hour",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/dawn",
     "variante": null,
     "citation": "you can take a Magic action to summon an Air Elemental"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:chime-of-opening",
   "name": "Chime of Opening",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.knock",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "10 uses",
     "variante": null,
     "citation": "As a Magic action, you can strike the chime to cast Knock."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:circlet-of-blasting",
   "name": "Circlet of Blasting",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.scorching-ray",
     "mode": "sort",
     "valeur": "+5 to hit",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/dawn",
     "variante": null,
     "citation": "you can cast Scorching Ray with it (+5 to hit)"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:cloak-of-arachnida",
   "name": "Cloak of Arachnida",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.poison",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "Poison Resistance. You have Resistance to Poison damage."
    },
    {
     "famille": "capacite",
     "cible": "speed.climb",
     "mode": "octroi",
     "valeur": "equal to Speed",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have a Climb Speed equal to your Speed"
    },
    {
     "famille": "capacite",
     "cible": "other.web-immunity",
     "mode": "texte",
     "valeur": "not caught in webs",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You can’t be caught in webs of any sort"
    },
    {
     "famille": "action",
     "cible": "spell.web",
     "mode": "sort",
     "valeur": "DC 13, double area",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/dawn",
     "variante": null,
     "citation": "You can cast Web (save DC 13)."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:cloak-of-displacement",
   "name": "Cloak of Displacement",
   "effets": [
    {
     "famille": "capacite",
     "cible": "disadvantage.attacks-against-you",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "causing any creature to have Disadvantage on attack rolls against you"
    }
   ],
   "note": "Suspendu jusqu’au tour suivant après avoir subi des dégâts, et quand la vitesse est 0."
  },
  {
   "id": "srd:item:en:cloak-of-elvenkind",
   "name": "Cloak of Elvenkind",
   "effets": [
    {
     "famille": "capacite",
     "cible": "disadvantage.perception-to-perceive-you",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "Wisdom (Perception) checks made to perceive you have Disadvantage"
    },
    {
     "famille": "capacite",
     "cible": "advantage.stealth",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Dexterity (Stealth) checks"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:cloak-of-invisibility",
   "name": "Cloak of Invisibility",
   "effets": [
    {
     "famille": "action",
     "cible": "other.invisible",
     "mode": "octroi",
     "valeur": "Invisible condition, 1 hour",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "3, regains 1d3 at dawn",
     "variante": null,
     "citation": "expend 1 charge to give yourself the Invisible condition for 1 hour"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:cloak-of-protection",
   "name": "Cloak of Protection",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to Armor Class and saving throws while you wear this cloak."
    },
    {
     "famille": "chiffre",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to Armor Class and saving throws while you wear this cloak."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:cloak-of-the-bat",
   "name": "Cloak of the Bat",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.stealth",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Dexterity (Stealth) checks"
    },
    {
     "famille": "capacite",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": 40,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "use it to gain a Fly Speed of 40 feet"
    },
    {
     "famille": "action",
     "cible": "spell.polymorph",
     "mode": "sort",
     "valeur": "self, Bat",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/dawn",
     "variante": null,
     "citation": "you can cast Polymorph on yourself, shape-shifting into a Bat"
    }
   ],
   "note": "Vol et Polymorph seulement en lumière faible ou ténèbres."
  },
  {
   "id": "srd:item:en:cloak-of-the-manta-ray",
   "name": "Cloak of the Manta Ray",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.water-breathing",
     "mode": "texte",
     "valeur": "breathe underwater",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you can breathe underwater"
    },
    {
     "famille": "capacite",
     "cible": "speed.swim",
     "mode": "octroi",
     "valeur": 60,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have a Swim Speed of 60 feet"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:crystal-ball",
   "name": "Crystal Ball",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.scrying",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast Scrying (save DC 17) with it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:crystal-ball-of-mind-reading",
   "name": "Crystal Ball of Mind Reading",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.scrying",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast Scrying (save DC 17) with it"
    },
    {
     "famille": "action",
     "cible": "spell.detect-thoughts",
     "mode": "sort",
     "valeur": "DC 17, no concentration",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast Detect Thoughts (save DC 17) targeting creatures you can see"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:crystal-ball-of-telepathy",
   "name": "Crystal Ball of Telepathy",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.scrying",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast Scrying (save DC 17) with it"
    },
    {
     "famille": "action",
     "cible": "other.telepathy",
     "mode": "texte",
     "valeur": "through the sensor, 30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can communicate telepathically with creatures you can see within 30 feet of the spell’s sensor"
    },
    {
     "famille": "action",
     "cible": "spell.suggestion",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/dawn",
     "variante": null,
     "citation": "You can also cast Suggestion (save DC 17) through the sensor on one of those creatures."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:crystal-ball-of-true-seeing",
   "name": "Crystal Ball of True Seeing",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.scrying",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast Scrying (save DC 17) with it"
    },
    {
     "famille": "action",
     "cible": "sense.truesight",
     "mode": "octroi",
     "valeur": 120,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you have Truesight with a range of 120 feet centered on the spell’s sensor"
    }
   ],
   "note": "Vision véritable centrée sur le capteur de Scrying, pas sur le porteur."
  },
  {
   "id": "srd:item:en:cube-of-force",
   "name": "Cube of Force",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.mage-armor",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 of 10, regains 1d6 at dawn",
     "variante": null,
     "citation": "Mage Armor 1"
    },
    {
     "famille": "action",
     "cible": "spell.shield",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 of 10, regains 1d6 at dawn",
     "variante": null,
     "citation": "Shield 1"
    },
    {
     "famille": "action",
     "cible": "spell.tiny-hut",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3 of 10, regains 1d6 at dawn",
     "variante": null,
     "citation": "Tiny Hut 3"
    },
    {
     "famille": "action",
     "cible": "spell.private-sanctum",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4 of 10, regains 1d6 at dawn",
     "variante": null,
     "citation": "Private Sanctum 4"
    },
    {
     "famille": "action",
     "cible": "spell.resilient-sphere",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4 of 10, regains 1d6 at dawn",
     "variante": null,
     "citation": "Resilient Sphere 4"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-force",
     "mode": "sort",
     "valeur": "DC 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5 of 10, regains 1d6 at dawn",
     "variante": null,
     "citation": "Wall of Force 5"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:cubic-gate",
   "name": "Cubic Gate",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.gate",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 of 3, regains 1d3 at dawn",
     "variante": null,
     "citation": "Pressing one side of the cube, you cast Gate"
    },
    {
     "famille": "action",
     "cible": "spell.plane-shift",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 of 3, regains 1d3 at dawn",
     "variante": null,
     "citation": "Pressing one side of the cube twice, you cast Plane Shift"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:dagger-of-venom",
   "name": "Dagger of Venom",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "action",
     "cible": "other.poison-coat",
     "mode": "texte",
     "valeur": "DC 15 Con, 2d10 Poison + Poisoned 1 minute",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/dawn",
     "variante": null,
     "citation": "must succeed on a DC 15 Constitution saving throw or take 2d10 Poison damage"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:dancing-sword",
   "name": "Dancing Sword",
   "effets": [
    {
     "famille": "action",
     "cible": "other.dancing-attack",
     "mode": "texte",
     "valeur": "hovers and attacks up to 4 times",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "You can take a Bonus Action to toss this magic weapon into the air"
    }
   ],
   "note": "Aucun bonus chiffré d’attaque ou de dégâts."
  },
  {
   "id": "srd:item:en:decanter-of-endless-water",
   "name": "Decanter of Endless Water",
   "effets": [
    {
     "famille": "action",
     "cible": "other.water",
     "mode": "texte",
     "valeur": "1 gallon",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Splash",
     "citation": "Splash. The decanter produces 1 gallon of water."
    },
    {
     "famille": "action",
     "cible": "other.water",
     "mode": "texte",
     "valeur": "5 gallons",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Fountain",
     "citation": "Fountain. The decanter produces 5 gallons of water."
    },
    {
     "famille": "action",
     "cible": "other.water",
     "mode": "texte",
     "valeur": "30 gallons, Line 30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Geyser",
     "citation": "Geyser. The decanter produces 30 gallons of water"
    },
    {
     "famille": "action",
     "cible": "other.shove",
     "mode": "texte",
     "valeur": "DC 13 Str, 1d4 Bludgeoning + Prone",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Geyser",
     "citation": "must succeed on a DC 13 Strength saving throw or take 1d4 Bludgeoning damage"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:deck-of-illusions",
   "name": "Deck of Illusions",
   "effets": [
    {
     "famille": "action",
     "cible": "other.illusion",
     "mode": "texte",
     "valeur": "illusory creature per card",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "34 cards, each single use",
     "variante": null,
     "citation": "An illusion of a creature, determined by rolling on the Deck of Illusions table, forms over the thrown card"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:defender",
   "name": "Defender",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "action",
     "cible": "ac",
     "mode": "texte",
     "valeur": "transfer up to +3 from weapon to AC",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you can transfer some or all of the weapon’s bonus to your Armor Class"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:demon-armor",
   "name": "Demon Armor",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +1 bonus to Armor Class, and you know Abyssal"
    },
    {
     "famille": "capacite",
     "cible": "language",
     "mode": "octroi",
     "valeur": "Abyssal",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +1 bonus to Armor Class, and you know Abyssal"
    },
    {
     "famille": "capacite",
     "cible": "other.unarmed-damage",
     "mode": "texte",
     "valeur": "1d8 Slashing",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "allow your Unarmed Strikes to deal 1d8 Slashing damage instead of the usual Bludgeoning damage"
    },
    {
     "famille": "chiffre",
     "cible": "other.unarmed-attack",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +1 bonus to the attack and damage rolls of your Unarmed Strikes"
    },
    {
     "famille": "chiffre",
     "cible": "other.unarmed-damage-bonus",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +1 bonus to the attack and damage rolls of your Unarmed Strikes"
    },
    {
     "famille": "capacite",
     "cible": "disadvantage.attack-vs-demons",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Disadvantage on attack rolls against demons and on saving throws against their spells and special abilities"
    },
    {
     "famille": "capacite",
     "cible": "disadvantage.save-vs-demons",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Disadvantage on attack rolls against demons and on saving throws against their spells and special abilities"
    },
    {
     "famille": "autre",
     "cible": "other.curse",
     "mode": "texte",
     "valeur": "cannot doff until Remove Curse",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can’t doff it unless you are targeted by a Remove Curse spell or similar magic"
    }
   ],
   "note": "Objet maudit ; les coups à mains nues ne sont pas des armes (clés other.*)."
  },
  {
   "id": "srd:item:en:dimensional-shackles",
   "name": "Dimensional Shackles",
   "effets": [
    {
     "famille": "action",
     "cible": "other.restraint",
     "mode": "texte",
     "valeur": "blocks extradimensional movement of a bound creature",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The shackles prevent a creature bound by them from using any method of extradimensional movement"
    }
   ],
   "note": "Agit sur la créature entravée, pas sur le porteur."
  },
  {
   "id": "srd:item:en:dragon-orb",
   "name": "Dragon Orb",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.cure-wounds",
     "mode": "sort",
     "valeur": "level 9 version",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4 of 7, regains 1d4 + 3 at dawn",
     "variante": null,
     "citation": "Cure Wounds (level 9 version) 4"
    },
    {
     "famille": "action",
     "cible": "spell.daylight",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 of 7, regains 1d4 + 3 at dawn",
     "variante": null,
     "citation": "Daylight 1"
    },
    {
     "famille": "action",
     "cible": "spell.death-ward",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2 of 7, regains 1d4 + 3 at dawn",
     "variante": null,
     "citation": "Death Ward 2"
    },
    {
     "famille": "action",
     "cible": "spell.detect-magic",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0 of 7, regains 1d4 + 3 at dawn",
     "variante": null,
     "citation": "Detect Magic 0"
    },
    {
     "famille": "action",
     "cible": "spell.scrying",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3 of 7, regains 1d4 + 3 at dawn",
     "variante": null,
     "citation": "Scrying (save DC 18) 3"
    },
    {
     "famille": "action",
     "cible": "other.call-dragons",
     "mode": "texte",
     "valeur": "telepathic call, 40 miles",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/hour",
     "variante": null,
     "citation": "cause the orb to issue a telepathic call that extends in all directions for 40 miles"
    },
    {
     "famille": "autre",
     "cible": "other.charmed-risk",
     "mode": "texte",
     "valeur": "DC 15 Cha save or Charmed while attuned",
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the orb imposes the Charmed condition on you for as long as you remain attuned"
    }
   ],
   "note": "Artefact ; sorts seulement si le porteur contrôle l’orbe (JS Cha DC 15 réussi)."
  },
  {
   "id": "srd:item:en:dragon-scale-mail",
   "name": "Dragon Scale Mail",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +1 bonus to Armor Class"
    },
    {
     "famille": "capacite",
     "cible": "advantage.save-breath-weapon",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on saving throws against the breath weapons of Dragons"
    },
    {
     "famille": "capacite",
     "cible": "resistance.acid",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Black",
     "citation": "Black Acid"
    },
    {
     "famille": "capacite",
     "cible": "resistance.lightning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Blue",
     "citation": "Blue Lightning"
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Brass",
     "citation": "Brass Fire"
    },
    {
     "famille": "capacite",
     "cible": "resistance.lightning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Bronze",
     "citation": "Bronze Lightning"
    },
    {
     "famille": "capacite",
     "cible": "resistance.acid",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Copper",
     "citation": "Copper Acid"
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Gold",
     "citation": "Gold Fire"
    },
    {
     "famille": "capacite",
     "cible": "resistance.poison",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Green",
     "citation": "Green Poison"
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Red",
     "citation": "Red Fire"
    },
    {
     "famille": "capacite",
     "cible": "resistance.cold",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "Silver",
     "citation": "Silver Cold"
    },
    {
     "famille": "capacite",
     "cible": "resistance.cold",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": "White",
     "citation": "White Cold"
    },
    {
     "famille": "action",
     "cible": "other.locate-dragon",
     "mode": "texte",
     "valeur": "closest same-type dragon within 30 miles",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/dawn",
     "variante": null,
     "citation": "discern the distance and direction to the closest dragon within 30 miles"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:dragon-slayer",
   "name": "Dragon Slayer",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "texte",
     "valeur": "+3d6 vs Dragon",
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "The weapon deals an extra 3d6 damage of the weapon’s type if the target is a Dragon."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:dust-of-disappearance",
   "name": "Dust of Disappearance",
   "effets": [
    {
     "famille": "action",
     "cible": "other.invisible",
     "mode": "octroi",
     "valeur": "Invisible 2d4 minutes, 10-ft Emanation",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "have the Invisible condition for 2d4 minutes"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:dust-of-dryness",
   "name": "Dust of Dryness",
   "effets": [
    {
     "famille": "action",
     "cible": "other.absorb-water",
     "mode": "texte",
     "valeur": "15-ft Cube of water into a pellet",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": "1d6 + 4 pinches",
     "variante": null,
     "citation": "turning up to a 15-foot Cube of water into one marble-sized pellet"
    },
    {
     "famille": "action",
     "cible": "other.damage-water-elemental",
     "mode": "texte",
     "valeur": "DC 13 Con, 10d6 Necrotic",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": "1d6 + 4 pinches",
     "variante": null,
     "citation": "taking 10d6 Necrotic damage on a failed save"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:dust-of-sneezing-and-choking",
   "name": "Dust of Sneezing and Choking",
   "effets": [
    {
     "famille": "action",
     "cible": "other.incapacitate",
     "mode": "texte",
     "valeur": "DC 15 Con, 30-ft Emanation incl. user",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "it has the Incapacitated condition and is suffocating"
    }
   ],
   "note": "Objet piège : se fait passer pour Dust of Disappearance et touche aussi l’utilisateur."
  },
  {
   "id": "srd:item:en:dwarven-plate",
   "name": "Dwarven Plate",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While wearing this armor, you gain a +2 bonus to Armor Class."
    },
    {
     "famille": "action",
     "cible": "other.reduce-forced-movement",
     "mode": "texte",
     "valeur": "10 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Reaction to reduce the distance you are moved by up to 10 feet"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:dwarven-thrower",
   "name": "Dwarven Thrower",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "capacite",
     "cible": "other.thrown",
     "mode": "octroi",
     "valeur": "20/60 ft",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "It has the Thrown property with a normal range of 20 feet and a long range of 60 feet."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "1d8 Force (distance)",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "When you hit with a ranged attack using this weapon, it deals an extra 1d8 Force damage"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "2d8 Force (distance, vs Giant)",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "or an extra 2d8 Force damage if the target is a Giant"
    },
    {
     "famille": "capacite",
     "cible": "other.returning",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Immediately after hitting or missing, the weapon flies back to your hand."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:efficient-quiver",
   "name": "Efficient Quiver",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": "60 flèches / 18 javelines / 6 objets longs",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "allows the quiver to hold numerous items while never weighing more than 2 pounds"
    },
    {
     "famille": "autre",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": "60",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The shortest compartment can hold up to 60 Arrows, Bolts, or similar objects."
    }
   ],
   "note": "Rangement pur, aucun effet sur la fiche."
  },
  {
   "id": "srd:item:en:efreeti-bottle",
   "name": "Efreeti Bottle",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon-efreeti",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "an Efreeti appears in an unoccupied space within 30 feet of you"
    },
    {
     "famille": "action",
     "cible": "other.summon-efreeti",
     "mode": "texte",
     "valeur": "2–9 : obéit 1 heure",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "3 ouvertures",
     "variante": null,
     "citation": "The efreeti understands your languages and obeys your commands for 1 hour"
    },
    {
     "famille": "action",
     "cible": "spell.wish",
     "mode": "sort",
     "valeur": "10 sur 1d10",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The efreeti understands your languages and can cast Wish once for you."
    },
    {
     "famille": "autre",
     "cible": "other.hostile-efreeti",
     "mode": "texte",
     "valeur": "1 sur 1d10",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The efreeti attacks you. After fighting for 5 rounds, the efreeti disappears"
    }
   ],
   "note": "Effet tiré au 1d10 par le MJ ; Wish seulement sur 10."
  },
  {
   "id": "srd:item:en:elemental-gem",
   "name": "Elemental Gem",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon-elemental",
     "mode": "texte",
     "valeur": "Air Elemental",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Blue sapphire",
     "citation": "Blue sapphire Air Elemental"
    },
    {
     "famille": "action",
     "cible": "other.summon-elemental",
     "mode": "texte",
     "valeur": "Water Elemental",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Emerald",
     "citation": "Emerald Water Elemental"
    },
    {
     "famille": "action",
     "cible": "other.summon-elemental",
     "mode": "texte",
     "valeur": "Fire Elemental",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Red corundum",
     "citation": "Red corundum Fire Elemental"
    },
    {
     "famille": "action",
     "cible": "other.summon-elemental",
     "mode": "texte",
     "valeur": "Earth Elemental",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Yellow diamond",
     "citation": "Yellow diamond Earth Elemental"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:elixir-of-health",
   "name": "Elixir of Health",
   "effets": [
    {
     "famille": "action",
     "cible": "other.cure-disease",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you are cured of all magical contagions"
    },
    {
     "famille": "action",
     "cible": "other.end-conditions",
     "mode": "texte",
     "valeur": "Blinded, Deafened, Paralyzed, Poisoned",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the following conditions end on you: Blinded, Deafened, Paralyzed, and Poisoned."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:elven-chain",
   "name": "Elven Chain",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to Armor Class while you wear this armor."
    },
    {
     "famille": "capacite",
     "cible": "other.armor-training",
     "mode": "octroi",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You are considered trained with this armor even if you lack training with Medium or Heavy armor."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:energy-bow",
   "name": "Energy Bow",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon"
    },
    {
     "famille": "capacite",
     "cible": "other.ammunition",
     "mode": "octroi",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "a magical arrow made of golden energy appears nocked and ready to fire"
    },
    {
     "famille": "capacite",
     "cible": "other.damage-type",
     "mode": "texte",
     "valeur": "Force",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "An arrow produced by this weapon deals Force damage instead of Piercing damage on a hit"
    },
    {
     "famille": "autre",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "20 ft",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the arrow emits Bright Light in a 20-foot radius and Dim Light for an additional 20 feet"
    },
    {
     "famille": "action",
     "cible": "other.restrain",
     "mode": "texte",
     "valeur": "DD 15 Force",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the target must succeed on a DC 15 Strength saving throw or have the Restrained condition for 1 minute"
    },
    {
     "famille": "action",
     "cible": "other.teleport",
     "mode": "texte",
     "valeur": "10 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The arrow teleports the target to an unoccupied space you can see within 10 feet of you."
    },
    {
     "famille": "action",
     "cible": "other.ladder",
     "mode": "texte",
     "valeur": "60 ft",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "forming a magical ladder up to 60 feet long on the wall"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:eversmoking-bottle",
   "name": "Eversmoking Bottle",
   "effets": [
    {
     "famille": "action",
     "cible": "other.smoke",
     "mode": "texte",
     "valeur": "60 ft → 120 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "forming a cloud that fills a 60-foot Emanation originating from the bottle"
    },
    {
     "famille": "action",
     "cible": "other.smoke",
     "mode": "texte",
     "valeur": "Heavily Obscured",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The area within the smoke is Heavily Obscured."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:eyes-of-charming",
   "name": "Eyes of Charming",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.charm-person",
     "mode": "sort",
     "valeur": "DD 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, toutes à l’aube",
     "variante": null,
     "citation": "you can expend 1 or more charges to cast Charm Person (save DC 13)"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:eyes-of-minute-seeing",
   "name": "Eyes of Minute Seeing",
   "effets": [
    {
     "famille": "capacite",
     "cible": "sense.darkvision",
     "mode": "octroi",
     "valeur": "1 ft",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "granting you Darkvision within that range"
    },
    {
     "famille": "capacite",
     "cible": "advantage.skill.investigation",
     "mode": "avantage",
     "valeur": "à 1 ft",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Advantage on Intelligence (Investigation) checks made to examine something within that range"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:eyes-of-the-eagle",
   "name": "Eyes of the Eagle",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.skill.perception",
     "mode": "avantage",
     "valeur": "vue",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Wisdom (Perception) checks that rely on sight"
    },
    {
     "famille": "autre",
     "cible": "other.distant-sight",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can make out details of even extremely distant creatures and objects"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:feather-token",
   "name": "Feather Token",
   "effets": [
    {
     "famille": "action",
     "cible": "other.anchor",
     "mode": "texte",
     "valeur": "24 h",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Anchor",
     "citation": "For the next 24 hours, the vessel can’t be moved by any means."
    },
    {
     "famille": "action",
     "cible": "other.summon-bird",
     "mode": "texte",
     "valeur": "Roc",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Bird",
     "citation": "an enormous, multicolored bird takes its place. The bird has the statistics of a Roc"
    },
    {
     "famille": "action",
     "cible": "other.wind",
     "mode": "texte",
     "valeur": "+5 mph",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Fan",
     "citation": "increasing its speed by 5 miles per hour for 8 hours"
    },
    {
     "famille": "action",
     "cible": "other.boat",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Swan Boat",
     "citation": "a 50-footlong, 20-foot-wide boat shaped like a swan takes its place"
    },
    {
     "famille": "action",
     "cible": "other.tree",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Tree",
     "citation": "a nonmagical oak tree springs into existence"
    },
    {
     "famille": "action",
     "cible": "other.spell-attack",
     "mode": "texte",
     "valeur": "+9, 1d6 + 5 Force",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Whip",
     "citation": "make a melee spell attack against a creature within 10 feet of the whip, with an attack bonus of +9"
    }
   ],
   "note": "Usage unique ; une variante par type de plume."
  },
  {
   "id": "srd:item:en:figurine-of-wondrous-power",
   "name": "Figurine of Wondrous Power",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon-griffon",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 5 jours",
     "variante": "Bronze Griffon",
     "citation": "It can become a Griffon for up to 6 hours."
    },
    {
     "famille": "action",
     "cible": "other.summon-giant-fly",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 2 jours",
     "variante": "Ebony Fly",
     "citation": "can become a Giant Fly (see the accompanying stat block) for up to 12 hours"
    },
    {
     "famille": "action",
     "cible": "other.summon-lion",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 7 jours",
     "variante": "Golden Lions",
     "citation": "Each can become a Lion for up to 1 hour."
    },
    {
     "famille": "action",
     "cible": "other.summon-giant-goat",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 15 jours",
     "variante": "Ivory Goats — Goat of Terror",
     "citation": "This figurine can become a Giant Goat for up to 3 hours. The goat can’t attack"
    },
    {
     "famille": "action",
     "cible": "other.summon-riding-horse",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 24 charges (1/heure) ; 7 jours",
     "variante": "Ivory Goats — Goat of Traveling",
     "citation": "This figurine can become a Large goat with the same statistics as a Riding Horse."
    },
    {
     "famille": "action",
     "cible": "other.summon-giant-goat",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 30 jours",
     "variante": "Ivory Goats — Goat of Travail",
     "citation": "Once it has been used, it can’t be used again until 30 days have passed."
    },
    {
     "famille": "action",
     "cible": "other.summon-elephant",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 7 jours",
     "variante": "Marble Elephant",
     "citation": "It can become an Elephant for up to 24 hours."
    },
    {
     "famille": "action",
     "cible": "other.summon-nightmare",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 5 jours",
     "variante": "Obsidian Steed",
     "citation": "This polished obsidian horse can become a Nightmare for up to 24 hours."
    },
    {
     "famille": "action",
     "cible": "other.summon-mastiff",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 7 jours",
     "variante": "Onyx Dog",
     "citation": "This onyx statuette of a dog can become a Mastiff for up to 6 hours."
    },
    {
     "famille": "action",
     "cible": "other.summon-giant-owl",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 2 jours",
     "variante": "Serpentine Owl",
     "citation": "This serpentine statuette of an owl can become a Giant Owl for up to 8 hours."
    },
    {
     "famille": "action",
     "cible": "other.summon-raven",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "recharge 2 jours",
     "variante": "Silver Raven",
     "citation": "This silver statuette of a raven can become a Raven for up to 12 hours."
    },
    {
     "famille": "action",
     "cible": "other.horn-weapons",
     "mode": "texte",
     "valeur": "+1 Lance, +2 Longsword",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": "Ivory Goats — Goat of Terror",
     "citation": "One horn becomes a +1 Lance, and the other becomes a +2 Longsword."
    },
    {
     "famille": "action",
     "cible": "other.frighten-aura",
     "mode": "texte",
     "valeur": "DD 15 Sagesse",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": "Ivory Goats — Goat of Terror",
     "citation": "must succeed on a DC 15 Wisdom saving throw or have the Frightened condition for 1 minute"
    },
    {
     "famille": "autre",
     "cible": "other.disobey",
     "mode": "texte",
     "valeur": "10 %",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Obsidian Steed",
     "citation": "The figurine has a 10 percent chance each time you use it to ignore your orders"
    },
    {
     "famille": "action",
     "cible": "other.telepathy",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": "Serpentine Owl",
     "citation": "The owl can communicate telepathically with you at any range"
    },
    {
     "famille": "action",
     "cible": "spell.animal-messenger",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Silver Raven",
     "citation": "the figurine grants you the ability to cast Animal Messenger on it"
    }
   ],
   "note": "Les créatures ont leur propre bloc de stats ; recharge en jours par variante."
  },
  {
   "id": "srd:item:en:flame-tongue",
   "name": "Flame Tongue",
   "effets": [
    {
     "famille": "action",
     "cible": "other.ignite",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "use a command word to cause flames to engulf the damage-dealing part of the weapon"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "2d6 Fire",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "While the weapon is ablaze, it deals an extra 2d6 Fire damage on a hit."
    },
    {
     "famille": "autre",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "40 ft",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "These flames shed Bright Light in a 40- foot radius"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:folding-boat",
   "name": "Folding Boat",
   "effets": [
    {
     "famille": "action",
     "cible": "other.boat",
     "mode": "texte",
     "valeur": "Rowboat",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The box unfolds into a Rowboat."
    },
    {
     "famille": "action",
     "cible": "other.boat",
     "mode": "texte",
     "valeur": "Keelboat",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The box unfolds into a Keelboat."
    },
    {
     "famille": "autre",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "It can be opened to store items inside."
    }
   ],
   "note": "Véhicule ; aucun effet sur la fiche."
  },
  {
   "id": "srd:item:en:frost-brand",
   "name": "Frost Brand",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "1d6 Cold",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "When you hit with an attack roll using this magic weapon, the target takes an extra 1d6 Cold damage."
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "while you hold the weapon, you have Resistance to Fire damage"
    },
    {
     "famille": "autre",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "10 ft (gel)",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "In freezing temperatures, the weapon sheds Bright Light in a 10-foot radius"
    },
    {
     "famille": "action",
     "cible": "other.extinguish",
     "mode": "texte",
     "valeur": "30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / heure",
     "variante": null,
     "citation": "When you draw this weapon, you can extinguish all nonmagical flames within 30 feet of yourself."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:gauntlets-of-ogre-power",
   "name": "Gauntlets of Ogre Power",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 19,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Your Strength is 19 while you wear these gauntlets."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:gem-of-brightness",
   "name": "Gem of Brightness",
   "effets": [
    {
     "famille": "action",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0",
     "variante": null,
     "citation": "The gem sheds Bright Light in a 30-foot radius"
    },
    {
     "famille": "action",
     "cible": "other.blind",
     "mode": "texte",
     "valeur": "DD 15 Constitution",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 sur 50",
     "variante": null,
     "citation": "The creature must succeed on a DC 15 Constitution saving throw or have the Blinded condition for 1 minute."
    },
    {
     "famille": "action",
     "cible": "other.blind-cone",
     "mode": "texte",
     "valeur": "cône 30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5 sur 50",
     "variante": null,
     "citation": "You expend 5 charges and cause the gem to flare with intense light"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:gem-of-seeing",
   "name": "Gem of Seeing",
   "effets": [
    {
     "famille": "action",
     "cible": "sense.truesight",
     "mode": "octroi",
     "valeur": "120 ft",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "3, regagne 1d3 à l’aube",
     "variante": null,
     "citation": "you have Truesight out to 120 feet when you peer through the gem"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:giant-slayer",
   "name": "Giant Slayer",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "2d6 vs Giant",
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the Giant takes an extra 2d6 damage of the weapon’s type"
    },
    {
     "famille": "capacite",
     "cible": "other.on-hit-prone",
     "mode": "texte",
     "valeur": "DD 15 Force vs Giant",
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "must succeed on a DC 15 Strength saving throw or have the Prone condition"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:glamoured-studded-leather",
   "name": "Glamoured Studded Leather",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While wearing this armor, you gain a +1 bonus to Armor Class."
    },
    {
     "famille": "action",
     "cible": "other.glamour",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "take a Bonus Action to cause the armor to assume the appearance of a normal set of clothing"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:gloves-of-missile-snaring",
   "name": "Gloves of Missile Snaring",
   "effets": [
    {
     "famille": "action",
     "cible": "other.reduce-damage",
     "mode": "texte",
     "valeur": "1d10 + mod. Dex",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Reaction to reduce the damage by 1d10 plus your Dexterity modifier"
    },
    {
     "famille": "autre",
     "cible": "other.catch-missile",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If you reduce the damage to 0, you can catch the ammunition or weapon"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:gloves-of-swimming-and-climbing",
   "name": "Gloves of Swimming and Climbing",
   "effets": [
    {
     "famille": "capacite",
     "cible": "speed.climb",
     "mode": "octroi",
     "valeur": "= Speed",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have a Climb Speed and a Swim Speed equal to your Speed"
    },
    {
     "famille": "capacite",
     "cible": "speed.swim",
     "mode": "octroi",
     "valeur": "= Speed",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have a Climb Speed and a Swim Speed equal to your Speed"
    },
    {
     "famille": "chiffre",
     "cible": "skill.athletics",
     "mode": "bonus",
     "valeur": 5,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you gain a +5 bonus to Strength (Athletics) checks made to climb or swim"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:gloves-of-thievery",
   "name": "Gloves of Thievery",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "skill.sleight-of-hand",
     "mode": "bonus",
     "valeur": 5,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you gain a +5 bonus to Dexterity (Sleight of Hand) checks"
    },
    {
     "famille": "autre",
     "cible": "other.imperceptible",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "These gloves are imperceptible while worn."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:goggles-of-night",
   "name": "Goggles of Night",
   "effets": [
    {
     "famille": "capacite",
     "cible": "sense.darkvision",
     "mode": "octroi",
     "valeur": "60 ft",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Darkvision out to 60 feet"
    },
    {
     "famille": "capacite",
     "cible": "sense.darkvision",
     "mode": "bonus",
     "valeur": "+60 ft",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If you already have Darkvision, wearing the goggles increases its range by 60 feet."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:hammer-of-thunderbolts",
   "name": "Hammer of Thunderbolts",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "action",
     "cible": "other.thunder-throw",
     "mode": "texte",
     "valeur": "DD 17 Constitution, Stunned",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5, regagne 1d4 + 1 à l’aube",
     "variante": null,
     "citation": "must succeed on a DC 17 Constitution saving throw or have the Stunned condition"
    },
    {
     "famille": "capacite",
     "cible": "other.giant-death",
     "mode": "texte",
     "valeur": "20 naturel vs Giant, DD 17",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the creature must succeed on a DC 17 Constitution saving throw or die"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "bonus",
     "valeur": 4,
     "plafond": 30,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The Strength score bestowed by your Belt of Giant Strength or Gauntlets of Ogre Power increases by 4"
    }
   ],
   "note": "Giants’ Bane et Might of Giants exigent aussi une Belt of Giant Strength ou des Gauntlets of Ogre Power harmonisés."
  },
  {
   "id": "srd:item:en:handy-haversack",
   "name": "Handy Haversack",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": "200 lb / 25 pi³ par poche latérale",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Each side pouch can hold up to 200 pounds of material, not exceeding a volume of 25 cubic feet."
    },
    {
     "famille": "autre",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": "500 lb / 64 pi³ poche centrale",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The central pouch can hold up to 500 pounds of material"
    },
    {
     "famille": "autre",
     "cible": "other.weight",
     "mode": "fixe",
     "valeur": "5 lb",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The haversack always weighs 5 pounds, regardless of its contents."
    },
    {
     "famille": "action",
     "cible": "other.retrieve",
     "mode": "texte",
     "valeur": "Utilize ou Bonus Action",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Retrieving an item from the haversack requires a Utilize action or a Bonus Action (your choice)."
    },
    {
     "famille": "autre",
     "cible": "other.astral-gate",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Placing the haversack inside an extradimensional space created by a Bag of Holding"
    }
   ],
   "note": "Rangement ; aucun effet sur la fiche."
  },
  {
   "id": "srd:item:en:hat-of-disguise",
   "name": "Hat of Disguise",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.disguise-self",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While wearing this hat, you can cast the Disguise Self spell."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:hat-of-many-spells",
   "name": "Hat of Many Spells",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.spellcasting-focus",
     "mode": "octroi",
     "valeur": "Wizard",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can use it as a Spellcasting Focus for your Wizard spells"
    },
    {
     "famille": "action",
     "cible": "other.unknown-spell",
     "mode": "texte",
     "valeur": "Arcana DD 10 + niveau",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / repos court ou long",
     "variante": null,
     "citation": "you can try to cast a level 1+ spell you don’t know"
    },
    {
     "famille": "autre",
     "cible": "other.random-effect",
     "mode": "texte",
     "valeur": "1d100",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "On a failed check, you fail to cast the spell and a random effect occurs instead"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:headband-of-intellect",
   "name": "Headband of Intellect",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.int",
     "mode": "fixe",
     "valeur": 19,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Your Intelligence is 19 while you wear this headband."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:helm-of-brilliance",
   "name": "Helm of Brilliance",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.undead-aura",
     "mode": "texte",
     "valeur": "1d6 Radiant, 30 ft",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Any Undead that starts its turn in that area takes 1d6 Radiant damage."
    },
    {
     "famille": "action",
     "cible": "other.ignite",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to cause one weapon you are holding to burst into flames"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "1d6 Fire",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "When you hit with an attack using the blazing weapon, the target takes an extra 1d6 Fire damage."
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "As long as the helm has at least one ruby, you have Resistance to Fire damage."
    },
    {
     "famille": "action",
     "cible": "spell.daylight",
     "mode": "sort",
     "valeur": "DD 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 opale par sort",
     "variante": null,
     "citation": "Daylight (opal)"
    },
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "sort",
     "valeur": "DD 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 opale de feu par sort",
     "variante": null,
     "citation": "Fireball (fire opal)"
    },
    {
     "famille": "action",
     "cible": "spell.prismatic-spray",
     "mode": "sort",
     "valeur": "DD 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 diamant par sort",
     "variante": null,
     "citation": "Prismatic Spray (diamond)"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-fire",
     "mode": "sort",
     "valeur": "DD 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 rubis par sort",
     "variante": null,
     "citation": "Wall of Fire (ruby)"
    },
    {
     "famille": "autre",
     "cible": "other.self-destruct",
     "mode": "texte",
     "valeur": "1 sur 1d20",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "On a roll of 1, the helm emits beams of light from its remaining gems and is then destroyed."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:helm-of-comprehending-languages",
   "name": "Helm of Comprehending Languages",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.comprehend-languages",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While wearing this helm, you can cast Comprehend Languages from it."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:helm-of-telepathy",
   "name": "Helm of Telepathy",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.telepathy",
     "mode": "octroi",
     "valeur": "30 ft",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have telepathy with a range of 30 feet"
    },
    {
     "famille": "action",
     "cible": "spell.detect-thoughts",
     "mode": "sort",
     "valeur": "DD 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can cast Detect Thoughts or Suggestion (save DC 13) from the helm"
    },
    {
     "famille": "action",
     "cible": "spell.suggestion",
     "mode": "sort",
     "valeur": "DD 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can cast Detect Thoughts or Suggestion (save DC 13) from the helm"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:helm-of-teleportation",
   "name": "Helm of Teleportation",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.teleport",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, regagne 1d3 à l’aube",
     "variante": null,
     "citation": "you can expend 1 charge to cast Teleport from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:holy-avenger",
   "name": "Holy Avenger",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "2d10 Radiant vs Fiend/Undead",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "When you hit a Fiend or an Undead with it, that creature takes an extra 2d10 Radiant damage."
    },
    {
     "famille": "capacite",
     "cible": "advantage.save.magic",
     "mode": "avantage",
     "valeur": "aura 10 ft (30 ft Paladin 17)",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "have Advantage on saving throws against spells and other magical effects"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:horn-of-blasting",
   "name": "Horn of Blasting",
   "effets": [
    {
     "famille": "action",
     "cible": "other.blast",
     "mode": "texte",
     "valeur": "DD 15 Con, 5d8 Thunder",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "On a failed save, a creature takes 5d8 Thunder damage and has the Deafened condition for 1 minute."
    },
    {
     "famille": "autre",
     "cible": "other.explosion-risk",
     "mode": "texte",
     "valeur": "20 %, 10d6 Force",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Each use of the horn’s magic has a 20 percent chance of causing the horn to explode."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:horn-of-valhalla",
   "name": "Horn of Valhalla",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon-berserkers",
     "mode": "texte",
     "valeur": 2,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 / 7 jours",
     "variante": "Silver",
     "citation": "Silver 2 None"
    },
    {
     "famille": "action",
     "cible": "other.summon-berserkers",
     "mode": "texte",
     "valeur": 3,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 / 7 jours",
     "variante": "Brass",
     "citation": "Brass 3 Proficiency with all Simple weapons"
    },
    {
     "famille": "action",
     "cible": "other.summon-berserkers",
     "mode": "texte",
     "valeur": 4,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 / 7 jours",
     "variante": "Bronze",
     "citation": "Bronze 4 Training with all Medium armor"
    },
    {
     "famille": "action",
     "cible": "other.summon-berserkers",
     "mode": "texte",
     "valeur": 5,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 / 7 jours",
     "variante": "Iron",
     "citation": "Iron 5 Proficiency with all Martial weapons"
    },
    {
     "famille": "autre",
     "cible": "other.hostile-spirits",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If you blow the horn without meeting its requirement, the summoned spirits attack you."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:horseshoes-of-a-zephyr",
   "name": "Horseshoes of a Zephyr",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.mount-hover",
     "mode": "texte",
     "valeur": "monture",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "they allow the creature to move normally while floating 4 inches above a surface"
    },
    {
     "famille": "capacite",
     "cible": "other.mount-ignore-difficult-terrain",
     "mode": "texte",
     "valeur": "monture",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The creature leaves no tracks and ignores Difficult Terrain."
    },
    {
     "famille": "capacite",
     "cible": "other.mount-travel",
     "mode": "texte",
     "valeur": "12 h / jour",
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the creature can travel for up to 12 hours a day without gaining Exhaustion levels"
    }
   ],
   "note": "Effets portés par la monture, pas par le personnage."
  },
  {
   "id": "srd:item:en:horseshoes-of-speed",
   "name": "Horseshoes of Speed",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.mount-speed-walk",
     "mode": "bonus",
     "valeur": 30,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While all four horseshoes are attached to the same creature, its Speed is increased by 30 feet."
    }
   ],
   "note": "Bonus de vitesse de la monture, pas du personnage."
  },
  {
   "id": "srd:item:en:immovable-rod",
   "name": "Immovable Rod",
   "effets": [
    {
     "famille": "action",
     "cible": "other.fixed-in-place",
     "mode": "texte",
     "valeur": "8 000 lb",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "causes the rod to become magically fixed in place"
    },
    {
     "famille": "autre",
     "cible": "other.load",
     "mode": "plafond",
     "valeur": "8 000 lb",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The rod can hold up to 8,000 pounds of weight."
    }
   ],
   "note": "Outil ; aucun effet sur la fiche."
  },
  {
   "id": "srd:item:en:instant-fortress",
   "name": "Instant Fortress",
   "effets": [
    {
     "famille": "action",
     "cible": "other.fortress",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "cause it to grow rapidly into a square adamantine tower"
    },
    {
     "famille": "autre",
     "cible": "other.fortress-stats",
     "mode": "texte",
     "valeur": "20 × 20 × 30 ft ; CA 20, 100 PV",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The roof, the door, and the walls each have AC 20; HP 100"
    }
   ],
   "note": "Structure invoquée ; aucun effet sur la fiche."
  },
  {
   "id": "srd:item:en:ioun-stone",
   "name": "Ioun Stone",
   "effets": [
    {
     "famille": "action",
     "cible": "other.cancel-spell",
     "mode": "texte",
     "valeur": "niveau 4 ou moins",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "20 niveaux de sorts",
     "variante": "Absorption",
     "citation": "you can take a Reaction to cancel a spell of level 4 or lower"
    },
    {
     "famille": "chiffre",
     "cible": "ability.dex",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 20,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Agility",
     "citation": "Your Dexterity increases by 2, to a maximum of 20"
    },
    {
     "famille": "capacite",
     "cible": "advantage.initiative",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Awareness",
     "citation": "you have Advantage on Initiative rolls and Wisdom (Perception) checks"
    },
    {
     "famille": "capacite",
     "cible": "advantage.skill.perception",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Awareness",
     "citation": "you have Advantage on Initiative rolls and Wisdom (Perception) checks"
    },
    {
     "famille": "chiffre",
     "cible": "ability.con",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 20,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Fortitude",
     "citation": "Your Constitution increases by 2, to a maximum of 20"
    },
    {
     "famille": "action",
     "cible": "other.cancel-spell",
     "mode": "texte",
     "valeur": "niveau 8 ou moins",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "20 niveaux de sorts",
     "variante": "Greater Absorption",
     "citation": "you can take a Reaction to cancel a spell of level 8 or lower"
    },
    {
     "famille": "chiffre",
     "cible": "ability.wis",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 20,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Insight",
     "citation": "Your Wisdom increases by 2, to a maximum of 20"
    },
    {
     "famille": "chiffre",
     "cible": "ability.int",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 20,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Intellect",
     "citation": "Your Intelligence increases by 2, to a maximum of 20"
    },
    {
     "famille": "chiffre",
     "cible": "ability.cha",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 20,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Leadership",
     "citation": "Your Charisma increases by 2, to a maximum of 20"
    },
    {
     "famille": "chiffre",
     "cible": "proficiency.bonus",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Mastery",
     "citation": "Your Proficiency Bonus increases by 1 while this pale green prism orbits your head."
    },
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Protection",
     "citation": "You gain a +1 bonus to Armor Class while this dusty-rose prism orbits your head."
    },
    {
     "famille": "capacite",
     "cible": "hp.regain",
     "mode": "bonus",
     "valeur": 15,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Regeneration",
     "citation": "You regain 15 Hit Points at the end of each hour this pearly white spindle orbits your head"
    },
    {
     "famille": "action",
     "cible": "other.spell-storage",
     "mode": "texte",
     "valeur": "4 niveaux",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4 niveaux stockés",
     "variante": "Reserve",
     "citation": "you can cast any spell stored in it"
    },
    {
     "famille": "autre",
     "cible": "other.spell-storage",
     "mode": "plafond",
     "valeur": 4,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Reserve",
     "citation": "The stone can store up to 4 levels of spells at a time."
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 20,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Strength",
     "citation": "Your Strength increases by 2, to a maximum of 20"
    },
    {
     "famille": "capacite",
     "cible": "other.no-food-water",
     "mode": "octroi",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Sustenance",
     "citation": "You don’t need to eat or drink while this clear spindle orbits your head."
    }
   ],
   "note": "Une pierre en orbite est considérée comme portée ; jusqu’à trois pierres à la fois."
  },
  {
   "id": "srd:item:en:iron-bands",
   "name": "Iron Bands",
   "effets": [
    {
     "famille": "action",
     "cible": "other.restrain",
     "mode": "texte",
     "valeur": "Dex + maîtrise ; Athletics DD 20",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "On a hit, the target has the Restrained condition until you take a Bonus Action"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:iron-flask",
   "name": "Iron Flask",
   "effets": [
    {
     "famille": "action",
     "cible": "other.trap-creature",
     "mode": "texte",
     "valeur": "DD 17 Sagesse",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the target must succeed on a DC 17 Wisdom saving throw or be trapped in the flask"
    },
    {
     "famille": "action",
     "cible": "other.release-creature",
     "mode": "texte",
     "valeur": "1 heure",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "The creature then obeys your commands for 1 hour"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:javelin-of-lightning",
   "name": "Javelin of Lightning",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.damage-type",
     "mode": "texte",
     "valeur": "Lightning",
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can have it deal Lightning damage instead of Piercing damage"
    },
    {
     "famille": "action",
     "cible": "other.lightning-bolt",
     "mode": "texte",
     "valeur": "DD 13 Dex, 4d6 Lightning",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "taking 4d6 Lightning damage on a failed save or half as much damage on a successful one"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:lantern-of-revealing",
   "name": "Lantern of Revealing",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "shedding Bright Light in a 30-foot radius and Dim Light for an additional 30 feet"
    },
    {
     "famille": "capacite",
     "cible": "other.reveal-invisible",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Invisible creatures and objects are visible as long as they are in the lantern’s Bright Light."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:luck-blade",
   "name": "Luck Blade",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While the weapon is on your person, you also gain a +1 bonus to saving throws."
    },
    {
     "famille": "action",
     "cible": "other.reroll",
     "mode": "texte",
     "valeur": "D20 Test raté",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "to reroll one failed D20 Test if you don’t have the Incapacitated condition"
    },
    {
     "famille": "action",
     "cible": "spell.wish",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1d3 charges, 1 / aube",
     "variante": null,
     "citation": "you can expend 1 charge and cast Wish from it"
    }
   ],
   "note": "Le +1 aux jets de sauvegarde vaut tant que l’arme est sur soi."
  },
  {
   "id": "srd:item:en:mace-of-disruption",
   "name": "Mace of Disruption",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "2d6 Radiant vs Fiend/Undead",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "When you hit a Fiend or an Undead with this magic weapon, that creature takes an extra 2d6 Radiant damage."
    },
    {
     "famille": "capacite",
     "cible": "other.destroy-undead",
     "mode": "texte",
     "valeur": "≤ 25 PV, DD 15 Sagesse",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "it must succeed on a DC 15 Wisdom saving throw or be destroyed"
    },
    {
     "famille": "autre",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "20 ft",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While you hold this weapon, it sheds Bright Light in a 20-foot radius"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:mace-of-smiting",
   "name": "Mace of Smiting",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": "+3 vs Construct",
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The bonus increases to +3 when you use the weapon to attack a Construct."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "+3 vs Construct",
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The bonus increases to +3 when you use the weapon to attack a Construct."
    },
    {
     "famille": "capacite",
     "cible": "other.critical-damage",
     "mode": "texte",
     "valeur": "7 (14 vs Construct) Bludgeoning",
     "plafond": null,
     "condition": "tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the target takes an extra 7 Bludgeoning damage, or 14 Bludgeoning damage if it’s a Construct"
    }
   ],
   "note": "Le +3 remplace le +1 contre un Construct."
  },
  {
   "id": "srd:item:en:mace-of-terror",
   "name": "Mace of Terror",
   "effets": [
    {
     "famille": "action",
     "cible": "other.frighten",
     "mode": "texte",
     "valeur": "DD 15 Sagesse, 30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, regagne 1d3 à l’aube",
     "variante": null,
     "citation": "must succeed on a DC 15 Wisdom saving throw or have the Frightened condition for 1 minute"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:mantle-of-spell-resistance",
   "name": "Mantle of Spell Resistance",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.save.spells",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You have Advantage on saving throws against spells while you wear this cloak."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:manual-of-bodily-health",
   "name": "Manual of Bodily Health",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.con",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 30,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Constitution increases by 2, to a maximum of 30"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:manual-of-gainful-exercise",
   "name": "Manual of Gainful Exercise",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 30,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Strength increases by 2, to a maximum of 30"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:manual-of-golems",
   "name": "Manual of Golems",
   "effets": [
    {
     "famille": "action",
     "cible": "other.create-golem",
     "mode": "texte",
     "valeur": "Clay Golem",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Clay Golem",
     "citation": "Clay Golem 30 days 65,000 GP"
    },
    {
     "famille": "action",
     "cible": "other.create-golem",
     "mode": "texte",
     "valeur": "Flesh Golem",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Flesh Golem",
     "citation": "Flesh Golem 60 days 50,000 GP"
    },
    {
     "famille": "action",
     "cible": "other.create-golem",
     "mode": "texte",
     "valeur": "Iron Golem",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Iron Golem",
     "citation": "Iron Golem 120 days 100,000 GP"
    },
    {
     "famille": "action",
     "cible": "other.create-golem",
     "mode": "texte",
     "valeur": "Stone Golem",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Stone Golem",
     "citation": "Stone Golem 90 days 80,000 GP"
    },
    {
     "famille": "autre",
     "cible": "other.psychic-backlash",
     "mode": "texte",
     "valeur": "6d6 Psychic",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "A creature that can’t use a Manual of Golems and attempts to read it takes 6d6 Psychic damage."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:manual-of-quickness-of-action",
   "name": "Manual of Quickness of Action",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.dex",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 30,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Dexterity increases by 2, to a maximum of 30"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:marvelous-pigments",
   "name": "Marvelous Pigments",
   "effets": [
    {
     "famille": "action",
     "cible": "other.paint-real",
     "mode": "texte",
     "valeur": "Cube de 20 ft, 10 min",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": "1d4 pots",
     "variante": null,
     "citation": "When the work is done, all the painted objects and terrain features become real."
    },
    {
     "famille": "autre",
     "cible": "other.value-cap",
     "mode": "plafond",
     "valeur": "500 GP par pot",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the total value of all objects created by a pot of pigment can’t exceed 500 GP"
    }
   ],
   "note": "Création d’objets réels ; aucun effet sur la fiche."
  },
  {
   "id": "srd:item:en:medallion-of-thoughts",
   "name": "Medallion of Thoughts",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.detect-thoughts",
     "mode": "sort",
     "valeur": "DD 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5, regagne 1d4 à l’aube",
     "variante": null,
     "citation": "you can expend 1 charge to cast Detect Thoughts (save DC 13) from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:mirror-of-life-trapping",
   "name": "Mirror of Life Trapping",
   "effets": [
    {
     "famille": "action",
     "cible": "other.trap-creature",
     "mode": "texte",
     "valeur": "DD 15 Charisme, 30 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "must succeed on a DC 15 Charisma saving throw or be trapped"
    },
    {
     "famille": "autre",
     "cible": "other.cells",
     "mode": "plafond",
     "valeur": 12,
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "in one of the mirror’s twelve extradimensional cells"
    },
    {
     "famille": "action",
     "cible": "other.communicate",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The creature named or contained in the named cell appears as an image on the mirror’s surface."
    },
    {
     "famille": "action",
     "cible": "other.free-creature",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "use a second command word to free one creature trapped in the mirror"
    },
    {
     "famille": "autre",
     "cible": "other.astral-gate",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Placing the mirror inside an extradimensional space created by a Bag of Holding"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:mithral-armor",
   "name": "Mithral Armor",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.no-stealth-disadvantage",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If the armor normally imposes Disadvantage on Dexterity (Stealth) checks"
    },
    {
     "famille": "capacite",
     "cible": "other.no-strength-requirement",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "or has a Strength requirement, the mithral version of the armor doesn’t."
    },
    {
     "famille": "autre",
     "cible": "other.under-clothes",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Armor made of this substance can be worn under normal clothes."
    }
   ],
   "note": "Retire désavantage de Discrétion et exigence de Force de l’armure de base."
  },
  {
   "id": "srd:item:en:mysterious-deck",
   "name": "Mysterious Deck",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "other.ability-score",
     "mode": "bonus",
     "valeur": "+2 / −2",
     "plafond": 22,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Balance",
     "citation": "You can increase one of your ability scores by 2, to a maximum of 22"
    },
    {
     "famille": "capacite",
     "cible": "advantage.death-saves",
     "mode": "avantage",
     "valeur": "1 an",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Comet",
     "citation": "you have Advantage on Death Saving Throws for 1 year"
    },
    {
     "famille": "autre",
     "cible": "other.imprisonment",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Donjon",
     "citation": "You disappear and become entombed in a state of suspended animation in an extradimensional sphere."
    },
    {
     "famille": "chiffre",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": -2,
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Euryale",
     "citation": "You take a −2 penalty to saving throws while cursed in this way."
    },
    {
     "famille": "autre",
     "cible": "other.erase-event",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Fates",
     "citation": "allowing you to avoid or erase one event as if it never happened"
    },
    {
     "famille": "autre",
     "cible": "other.devil-enemy",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Flames",
     "citation": "A powerful devil becomes your enemy."
    },
    {
     "famille": "capacite",
     "cible": "disadvantage.d20-tests",
     "mode": "desavantage",
     "valeur": "72 h",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Fool",
     "citation": "You have Disadvantage on D20 Tests for the next 72 hours."
    },
    {
     "famille": "autre",
     "cible": "other.wealth",
     "mode": "texte",
     "valeur": "50 000 GP",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Gem",
     "citation": "Twenty-five pieces of jewelry worth 2,000 GP each or fifty gems worth 1,000 GP each appear at your feet."
    },
    {
     "famille": "capacite",
     "cible": "advantage.d20-tests",
     "mode": "avantage",
     "valeur": "72 h",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Jester",
     "citation": "You have Advantage on D20 Tests for the next 72 hours"
    },
    {
     "famille": "autre",
     "cible": "other.magic-weapon",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Key",
     "citation": "A Rare or rarer magic weapon with which you are proficient appears on your person."
    },
    {
     "famille": "autre",
     "cible": "other.knight-ally",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Knight",
     "citation": "You gain the service of a Knight"
    },
    {
     "famille": "action",
     "cible": "spell.wish",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": "1d3",
     "variante": "Moon",
     "citation": "You gain the ability to cast Wish 1d3 times."
    },
    {
     "famille": "chiffre",
     "cible": "other.ability-score",
     "mode": "bonus",
     "valeur": "−(1d4 + 1) Int ou Wis",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Puzzle",
     "citation": "Permanently reduce your Intelligence or Wisdom by 1d4 + 1"
    },
    {
     "famille": "autre",
     "cible": "other.hostile-npc",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Rogue",
     "citation": "An NPC of the GM’s choice becomes Hostile toward you."
    },
    {
     "famille": "autre",
     "cible": "other.wealth-loss",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Ruin",
     "citation": "All forms of wealth that you carry or own, other than magic items, are lost to you."
    },
    {
     "famille": "autre",
     "cible": "other.truthful-answer",
     "mode": "texte",
     "valeur": "1 an",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Sage",
     "citation": "you can ask a question in meditation and mentally receive a truthful answer to that question"
    },
    {
     "famille": "autre",
     "cible": "other.avatar-of-death",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Skull",
     "citation": "An Avatar of Death (see the accompanying stat block) appears in an unoccupied space as close to you as possible."
    },
    {
     "famille": "chiffre",
     "cible": "other.ability-score",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 24,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Star",
     "citation": "Increase one of your ability scores by 2, to a maximum of 24."
    },
    {
     "famille": "autre",
     "cible": "other.magic-item",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Sun",
     "citation": "A magic item (chosen by the GM) appears on your person."
    },
    {
     "famille": "capacite",
     "cible": "hp.temp",
     "mode": "bonus",
     "valeur": 10,
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Sun",
     "citation": "you gain 10 Temporary Hit Points daily at dawn until you die"
    },
    {
     "famille": "autre",
     "cible": "other.items-destroyed",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Talons",
     "citation": "Every magic item you wear or carry disintegrates."
    },
    {
     "famille": "chiffre",
     "cible": "other.skill-expertise",
     "mode": "octroi",
     "valeur": "History, Insight, Intimidation ou Persuasion",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": "Throne",
     "citation": "You gain proficiency and Expertise in your choice of History, Insight, Intimidation, or Persuasion."
    },
    {
     "famille": "autre",
     "cible": "other.keep",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Throne",
     "citation": "you gain rightful ownership of a small keep somewhere in the world"
    },
    {
     "famille": "autre",
     "cible": "other.soul-trapped",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Void",
     "citation": "Your soul is drawn from your body and contained in an object in a place of the GM’s choice."
    }
   ],
   "note": "Une carte tirée par variante ; certaines sont permanentes, d’autres narratives."
  },
  {
   "id": "srd:item:en:necklace-of-adaptation",
   "name": "Necklace of Adaptation",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.breathe-anywhere",
     "mode": "octroi",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can breathe normally in any environment"
    },
    {
     "famille": "capacite",
     "cible": "advantage.save.poisoned",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on saving throws made to avoid or end the Poisoned condition"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:necklace-of-fireballs",
   "name": "Necklace of Fireballs",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "sort",
     "valeur": "niveau 3, DD 15",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": "1d6 + 3 perles",
     "variante": null,
     "citation": "the bead detonates as a level 3 Fireball (save DC 15)"
    },
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "texte",
     "valeur": "+1d6 par perle (max 12d6)",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "increase the damage of the Fireball by 1d6 for each bead after the first (maximum 12d6)"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:necklace-of-prayer-beads",
   "name": "Necklace of Prayer Beads",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.bless",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube par perle",
     "variante": "Bead of Blessing",
     "citation": "Bead of Blessing Bless"
    },
    {
     "famille": "action",
     "cible": "spell.cure-wounds",
     "mode": "sort",
     "valeur": "niveau 2",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube par perle",
     "variante": "Bead of Curing",
     "citation": "Bead of Curing Cure Wounds (level 2 version)"
    },
    {
     "famille": "action",
     "cible": "spell.greater-restoration",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube par perle",
     "variante": "Bead of Favor",
     "citation": "Bead of Favor Greater Restoration"
    },
    {
     "famille": "action",
     "cible": "spell.shining-smite",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube par perle",
     "variante": "Bead of Smiting",
     "citation": "Bead of Smiting Shining Smite"
    },
    {
     "famille": "action",
     "cible": "spell.guardian-of-faith",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube par perle",
     "variante": "Bead of Summons",
     "citation": "Bead of Summons Guardian of Faith"
    },
    {
     "famille": "action",
     "cible": "spell.wind-walk",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube par perle",
     "variante": "Bead of Wind Walking",
     "citation": "Bead of Wind Walking Wind Walk"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:nine-lives-stealer",
   "name": "Nine Lives Stealer",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "capacite",
     "cible": "other.life-stealing",
     "mode": "texte",
     "valeur": "20 naturel, < 100 PV, DD 15 Con",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": "1d8 + 1",
     "variante": null,
     "citation": "the creature must succeed on a DC 15 Constitution saving throw or be slain instantly"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:oathbow",
   "name": "Oathbow",
   "effets": [
    {
     "famille": "action",
     "cible": "other.sworn-enemy",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "The target of your attack becomes your sworn enemy until it dies or until dawn 7 days later."
    },
    {
     "famille": "capacite",
     "cible": "advantage.attack-sworn-enemy",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "When you make a ranged attack roll with this weapon against your sworn enemy, you have Advantage on the roll."
    },
    {
     "famille": "autre",
     "cible": "other.ignore-cover",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "your target gains no benefit from Half Cover or Three-Quarters Cover"
    },
    {
     "famille": "autre",
     "cible": "other.long-range",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you suffer no Disadvantage due to long range"
    },
    {
     "famille": "autre",
     "cible": "other.extra-damage",
     "mode": "bonus",
     "valeur": "3d6 Piercing",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If the attack hits, your sworn enemy takes an extra 3d6 Piercing damage."
    },
    {
     "famille": "capacite",
     "cible": "disadvantage.attack-other-weapons",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While your sworn enemy lives, you have Disadvantage on attack rolls with all other weapons."
    }
   ],
   "note": "Pas de bonus +N d'arme mentionné ; effets liés à l'ennemi juré."
  },
  {
   "id": "srd:item:en:oil-of-etherealness",
   "name": "Oil of Etherealness",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.etherealness",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "The affected creature then gains the effect of the Etherealness spell for 1 hour."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:oil-of-sharpness",
   "name": "Oil of Sharpness",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "turning the coated weapon into a +3 Weapon or the coated ammunition into +3 Ammunition."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "turning the coated weapon into a +3 Weapon or the coated ammunition into +3 Ammunition."
    }
   ],
   "note": "Durée non précisée ; le +3 aux dégâts est déduit de « +3 Weapon », pas écrit ici."
  },
  {
   "id": "srd:item:en:oil-of-slipperiness",
   "name": "Oil of Slipperiness",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.freedom-of-movement",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "The affected creature then gains the effect of the Freedom of Movement spell for 8 hours."
    },
    {
     "famille": "action",
     "cible": "spell.grease",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "duplicating the effect of the Grease spell in that area for 8 hours."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:pearl-of-power",
   "name": "Pearl of Power",
   "effets": [
    {
     "famille": "action",
     "cible": "other.spell-slot",
     "mode": "texte",
     "valeur": "1 emplacement de niveau ≤ 3",
     "plafond": 3,
     "condition": "active",
     "duree": null,
     "charges": "1/aube",
     "variante": null,
     "citation": "you can take a Magic action to regain one expended spell slot of level 3 or lower"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:periapt-of-health",
   "name": "Periapt of Health",
   "effets": [
    {
     "famille": "action",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "2d4 + 2",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/aube",
     "variante": null,
     "citation": "you can take a Magic action to regain 2d4 + 2 Hit Points"
    },
    {
     "famille": "capacite",
     "cible": "advantage.save-poisoned",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on saving throws to avoid or end the Poisoned condition while you wear this pendant."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:periapt-of-proof-against-poison",
   "name": "Periapt of Proof against Poison",
   "effets": [
    {
     "famille": "capacite",
     "cible": "immunity.poisoned",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Immunity to the Poisoned condition and Poison damage."
    },
    {
     "famille": "capacite",
     "cible": "immunity.poison",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Immunity to the Poisoned condition and Poison damage."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:periapt-of-wound-closure",
   "name": "Periapt of Wound Closure",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.death-save",
     "mode": "texte",
     "valeur": "9 ou moins → 10",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can change a roll of 9 or lower to a 10, turning a failed save into a successful one."
    },
    {
     "famille": "capacite",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "dé de vie ×2",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Whenever you roll a Hit Point Die to regain Hit Points, double the number of Hit Points it restores."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:philter-of-love",
   "name": "Philter of Love",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.charmed",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you are charmed by that creature and have the Charmed condition for 1 hour."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:pipes-of-haunting",
   "name": "Pipes of Haunting",
   "effets": [
    {
     "famille": "action",
     "cible": "other.frighten",
     "mode": "texte",
     "valeur": "DC 15 Wis",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "3, regagne 1d3 à l'aube",
     "variante": null,
     "citation": "Each creature of your choice within 30 feet of you must succeed on a DC 15 Wisdom saving throw"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:pipes-of-the-sewers",
   "name": "Pipes of the Sewers",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.rats-indifferent",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "ordinary rats and giant rats are Indifferent toward you and won’t attack you"
    },
    {
     "famille": "action",
     "cible": "other.summon-swarm",
     "mode": "texte",
     "valeur": "1 Swarm of Rats par charge",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, regagne 1d3 à l'aube",
     "variante": null,
     "citation": "expend 1 to 3 charges, calling forth one Swarm of Rats with each expended charge"
    },
    {
     "famille": "action",
     "cible": "other.sway-swarm",
     "mode": "texte",
     "valeur": "DC 15 Wis",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "the swarm is swayed by the pipes’ music and becomes Friendly to you and your allies"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:plate-armor-of-etherealness",
   "name": "Plate Armor of Etherealness",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.etherealness",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/aube",
     "variante": null,
     "citation": "use a command word to gain the effect of the Etherealness spell"
    }
   ],
   "note": "La CA vient de l'armure de base (non décrite ici)."
  },
  {
   "id": "srd:item:en:portable-hole",
   "name": "Portable Hole",
   "effets": [
    {
     "famille": "action",
     "cible": "other.storage",
     "mode": "texte",
     "valeur": "trou de 10 ft de profondeur",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the Portable Hole creates an extradimensional hole 10 feet deep"
    },
    {
     "famille": "autre",
     "cible": "other.astral-gate",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "instantly destroys both items and opens a gate to the Astral Plane"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-animal-friendship",
   "name": "Potion of Animal Friendship",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.animal-friendship",
     "mode": "sort",
     "valeur": "niveau 3, DC 13",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast the level 3 version of the Animal Friendship spell (save DC 13)"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-clairvoyance",
   "name": "Potion of Clairvoyance",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.clairvoyance",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain the effect of the Clairvoyance spell (no Concentration required)"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-climbing",
   "name": "Potion of Climbing",
   "effets": [
    {
     "famille": "capacite",
     "cible": "speed.climb",
     "mode": "octroi",
     "valeur": "= Speed",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain a Climb Speed equal to your Speed for 1 hour."
    },
    {
     "famille": "capacite",
     "cible": "advantage.athletics-climb",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Strength (Athletics) checks to climb."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-diminution",
   "name": "Potion of Diminution",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.enlarge-reduce",
     "mode": "sort",
     "valeur": "reduce, 1d4 h",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain the “reduce” effect of the Enlarge/Reduce spell for 1d4 hours (no Concentration required)."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-flying",
   "name": "Potion of Flying",
   "effets": [
    {
     "famille": "capacite",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": "= Speed, vol stationnaire",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain a Fly Speed equal to your Speed for 1 hour and can hover."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-gaseous-form",
   "name": "Potion of Gaseous Form",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.gaseous-form",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain the effect of the Gaseous Form spell for 1 hour (no Concentration required)"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-giant-strength",
   "name": "Potion of Giant Strength",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 21,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Hill",
     "citation": "Potion of Giant Strength (hill) 21 Uncommon"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 23,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Frost or Stone",
     "citation": "Potion of Giant Strength (frost or stone) 23 Rare"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 25,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Fire",
     "citation": "Potion of Giant Strength (fire) 25 Rare"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 27,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Cloud",
     "citation": "Potion of Giant Strength (cloud) 27 Very Rare"
    },
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 29,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Storm",
     "citation": "Potion of Giant Strength (storm) 29 Legendary"
    }
   ],
   "note": "Durée 1 h ; sans effet si la Force est déjà égale ou supérieure."
  },
  {
   "id": "srd:item:en:potion-of-growth",
   "name": "Potion of Growth",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.enlarge-reduce",
     "mode": "sort",
     "valeur": "enlarge, 10 min",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain the “enlarge” effect of the Enlarge/Reduce spell for 10 minutes (no Concentration required)."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-heroism",
   "name": "Potion of Heroism",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "hp.temp",
     "mode": "octroi",
     "valeur": 10,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain 10 Temporary Hit Points that last for 1 hour."
    },
    {
     "famille": "action",
     "cible": "spell.bless",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you are under the effect of the Bless spell (no Concentration required)."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-invisibility",
   "name": "Potion of Invisibility",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.invisible",
     "mode": "octroi",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you have the Invisible condition for 1 hour."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-invulnerability",
   "name": "Potion of Invulnerability",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.all",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "For 1 minute after you drink this potion, you have Resistance to all damage."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-longevity",
   "name": "Potion of Longevity",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.age",
     "mode": "texte",
     "valeur": "-(1d6 + 6) ans, minimum 13",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years."
    },
    {
     "famille": "autre",
     "cible": "other.age-risk",
     "mode": "texte",
     "valeur": "10 % cumulatif",
     "plafond": null,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "there is 10 percent cumulative chance that you instead age by 1d6 + 6 years."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-mind-reading",
   "name": "Potion of Mind Reading",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.detect-thoughts",
     "mode": "sort",
     "valeur": "DC 13",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain the effect of the Detect Thoughts spell (save DC 13) for 10 minutes (no Concentration required)."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-poison",
   "name": "Potion of Poison",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.poison",
     "mode": "texte",
     "valeur": "4d6 Poison, DC 13 Con",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you take 4d6 Poison damage and must succeed on a DC 13 Constitution saving throw"
    }
   ],
   "note": "Objet piège : effet uniquement négatif."
  },
  {
   "id": "srd:item:en:potion-of-resistance",
   "name": "Potion of Resistance",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.acid",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Acid",
     "citation": "1 Acid 6 Necrotic"
    },
    {
     "famille": "capacite",
     "cible": "resistance.cold",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Cold",
     "citation": "2 Cold 7 Poison"
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Fire",
     "citation": "3 Fire 8 Psychic"
    },
    {
     "famille": "capacite",
     "cible": "resistance.force",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Force",
     "citation": "4 Force 9 Radiant"
    },
    {
     "famille": "capacite",
     "cible": "resistance.lightning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Lightning",
     "citation": "5 Lightning 10 Thunder"
    },
    {
     "famille": "capacite",
     "cible": "resistance.necrotic",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Necrotic",
     "citation": "1 Acid 6 Necrotic"
    },
    {
     "famille": "capacite",
     "cible": "resistance.poison",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Poison",
     "citation": "2 Cold 7 Poison"
    },
    {
     "famille": "capacite",
     "cible": "resistance.psychic",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Psychic",
     "citation": "3 Fire 8 Psychic"
    },
    {
     "famille": "capacite",
     "cible": "resistance.radiant",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Radiant",
     "citation": "4 Force 9 Radiant"
    },
    {
     "famille": "capacite",
     "cible": "resistance.thunder",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": "Thunder",
     "citation": "5 Lightning 10 Thunder"
    }
   ],
   "note": "Un seul type par potion (1 h), choisi par le MJ ou 1d10."
  },
  {
   "id": "srd:item:en:potion-of-speed",
   "name": "Potion of Speed",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.haste",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you gain the effect of the Haste spell for 1 minute (no Concentration required)"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-vitality",
   "name": "Potion of Vitality",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.exhaustion",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "it removes any Exhaustion levels you have and ends the Poisoned condition on you."
    },
    {
     "famille": "capacite",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "dé de vie au maximum",
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "For the next 24 hours, you regain the maximum number of Hit Points for any Hit Point Die you spend."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potion-of-water-breathing",
   "name": "Potion of Water Breathing",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.water-breathing",
     "mode": "octroi",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "You can breathe underwater for 24 hours after drinking this potion."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:potions-of-healing",
   "name": "Potions of Healing",
   "effets": [
    {
     "famille": "action",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "2d4 + 2",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Standard",
     "citation": "Potion of Healing 2d4 + 2 Common"
    },
    {
     "famille": "action",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "4d4 + 4",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Greater",
     "citation": "Potion of Healing (greater) 4d4 + 4 Uncommon"
    },
    {
     "famille": "action",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "8d4 + 8",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Superior",
     "citation": "Potion of Healing (superior) 8d4 + 8 Rare"
    },
    {
     "famille": "action",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "10d4 + 20",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": "Supreme",
     "citation": "Potion of Healing (supreme) 10d4 + 20 Very Rare"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:quarterstaff-of-the-acrobat",
   "name": "Quarterstaff of the Acrobat",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You have a +2 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You have a +2 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "action",
     "cible": "other.light",
     "mode": "texte",
     "valeur": "Dim Light 10 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cause it to emit green Dim Light out to 10 feet"
    },
    {
     "famille": "action",
     "cible": "other.shape",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "turning it into a 6-inch rod (for ease of storage) or a 10-foot pole"
    },
    {
     "famille": "capacite",
     "cible": "advantage.acrobatics",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Quarterstaff / 10-foot pole",
     "citation": "you have Advantage on Dexterity (Acrobatics) checks."
    },
    {
     "famille": "action",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 5,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/repos court ou long",
     "variante": "Quarterstaff",
     "citation": "gaining a +5 bonus to your Armor Class against the triggering attack"
    },
    {
     "famille": "capacite",
     "cible": "other.thrown",
     "mode": "octroi",
     "valeur": "30/120 ft",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Quarterstaff",
     "citation": "This weapon has the Thrown property with a normal range of 30 feet and a long range of 120 feet."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-animal-influence",
   "name": "Ring of Animal Influence",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.animal-friendship",
     "mode": "sort",
     "valeur": "DC 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, regagne 1d3 à l'aube, 1 par sort",
     "variante": null,
     "citation": "Animal Friendship • Fear (affects Beasts only) • Speak with Animals"
    },
    {
     "famille": "action",
     "cible": "spell.fear",
     "mode": "sort",
     "valeur": "DC 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, regagne 1d3 à l'aube, 1 par sort",
     "variante": null,
     "citation": "Animal Friendship • Fear (affects Beasts only) • Speak with Animals"
    },
    {
     "famille": "action",
     "cible": "spell.speak-with-animals",
     "mode": "sort",
     "valeur": "DC 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, regagne 1d3 à l'aube, 1 par sort",
     "variante": null,
     "citation": "Animal Friendship • Fear (affects Beasts only) • Speak with Animals"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-djinni-summoning",
   "name": "Ring of Djinni Summoning",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon-djinni",
     "mode": "texte",
     "valeur": "1 h max, Concentration",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 par 24 h",
     "variante": null,
     "citation": "you can take a Magic action to summon a particular Djinni from the Elemental Plane of Air"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-elemental-command",
   "name": "Ring of Elemental Command",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.attack-elementals",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on attack rolls against Elementals and they have Disadvantage on attack rolls against you"
    },
    {
     "famille": "autre",
     "cible": "other.elementals-disadvantage",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on attack rolls against Elementals and they have Disadvantage on attack rolls against you"
    },
    {
     "famille": "action",
     "cible": "other.compel-elemental",
     "mode": "texte",
     "valeur": "DC 18 Wis",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to try to compel an Elemental you see within 60 feet of yourself"
    },
    {
     "famille": "capacite",
     "cible": "language",
     "mode": "octroi",
     "valeur": "Auran",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Air",
     "citation": "You know Auran, you have Resistance to Lightning damage"
    },
    {
     "famille": "capacite",
     "cible": "resistance.lightning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Air",
     "citation": "You know Auran, you have Resistance to Lightning damage"
    },
    {
     "famille": "capacite",
     "cible": "speed.fly",
     "mode": "octroi",
     "valeur": "= Speed, vol stationnaire",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Air",
     "citation": "you have a Fly Speed equal to your Speed and can hover"
    },
    {
     "famille": "capacite",
     "cible": "language",
     "mode": "octroi",
     "valeur": "Terran",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Earth",
     "citation": "You know Terran, and you have Resistance to Acid damage."
    },
    {
     "famille": "capacite",
     "cible": "resistance.acid",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Earth",
     "citation": "You know Terran, and you have Resistance to Acid damage."
    },
    {
     "famille": "capacite",
     "cible": "other.difficult-terrain",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Earth",
     "citation": "Terrain composed of rubble, rocks, or dirt isn’t Difficult Terrain for you."
    },
    {
     "famille": "capacite",
     "cible": "other.earth-glide",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Earth",
     "citation": "you can move through solid earth or rock as if those areas were Difficult Terrain"
    },
    {
     "famille": "capacite",
     "cible": "language",
     "mode": "octroi",
     "valeur": "Ignan",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Fire",
     "citation": "You know Ignan, and you have Immunity to Fire damage."
    },
    {
     "famille": "capacite",
     "cible": "immunity.fire",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Fire",
     "citation": "You know Ignan, and you have Immunity to Fire damage."
    },
    {
     "famille": "capacite",
     "cible": "language",
     "mode": "octroi",
     "valeur": "Aquan",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Water",
     "citation": "You know Aquan, you gain a Swim Speed of 60 feet, and you can breathe underwater."
    },
    {
     "famille": "capacite",
     "cible": "speed.swim",
     "mode": "octroi",
     "valeur": 60,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Water",
     "citation": "You know Aquan, you gain a Swim Speed of 60 feet, and you can breathe underwater."
    },
    {
     "famille": "capacite",
     "cible": "other.water-breathing",
     "mode": "octroi",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": "Water",
     "citation": "You know Aquan, you gain a Swim Speed of 60 feet, and you can breathe underwater."
    },
    {
     "famille": "action",
     "cible": "spell.chain-lightning",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Air",
     "citation": "Chain Lightning (3 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.feather-fall",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Air",
     "citation": "Feather Fall (0 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.gust-of-wind",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Air",
     "citation": "Gust of Wind (2 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.wind-wall",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 charge sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Air",
     "citation": "Wind Wall (1 charge)"
    },
    {
     "famille": "action",
     "cible": "spell.earthquake",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Earth",
     "citation": "Earthquake (5 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.stone-shape",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Earth",
     "citation": "Stone Shape (2 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.stoneskin",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Earth",
     "citation": "Stoneskin (3 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-stone",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Earth",
     "citation": "Wall of Stone (3 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.burning-hands",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 charge sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Fire",
     "citation": "Burning Hands (1 charge)"
    },
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Fire",
     "citation": "Fireball (2 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.fire-storm",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Fire",
     "citation": "Fire Storm (4 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-fire",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Fire",
     "citation": "Wall of Fire (3 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.create-or-destroy-water",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 charge sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Water",
     "citation": "Create or Destroy Water (1 charge)"
    },
    {
     "famille": "action",
     "cible": "spell.ice-storm",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Water",
     "citation": "Ice Storm (2 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.tsunami",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Water",
     "citation": "Tsunami (5 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-ice",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Water",
     "citation": "Wall of Ice (3 charges)"
    },
    {
     "famille": "action",
     "cible": "spell.water-walk",
     "mode": "sort",
     "valeur": "DC 18",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2 charges sur 5, regagne 1d4 + 1 à l'aube",
     "variante": "Water",
     "citation": "Water Walk (2 charges)"
    }
   ],
   "note": "Plan lié choisi par le MJ ; « Elemental Focus » et sorts dépendent de la variante."
  },
  {
   "id": "srd:item:en:ring-of-evasion",
   "name": "Ring of Evasion",
   "effets": [
    {
     "famille": "action",
     "cible": "save.dex",
     "mode": "texte",
     "valeur": "échec → réussite",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, regagne 1d3 à l'aube",
     "variante": null,
     "citation": "you can take a Reaction to expend 1 charge to succeed on that save instead."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-feather-falling",
   "name": "Ring of Feather Falling",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.feather-fall",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you descend 60 feet per round and take no damage from falling."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-free-action",
   "name": "Ring of Free Action",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.difficult-terrain",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Difficult Terrain doesn’t cost you extra movement."
    },
    {
     "famille": "capacite",
     "cible": "other.speed-not-reduced",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "magic can neither reduce any of your Speeds nor cause you to have the Paralyzed or Restrained condition."
    },
    {
     "famille": "capacite",
     "cible": "immunity.paralyzed",
     "mode": "immunite",
     "valeur": "par la magie",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "magic can neither reduce any of your Speeds nor cause you to have the Paralyzed or Restrained condition."
    },
    {
     "famille": "capacite",
     "cible": "immunity.restrained",
     "mode": "immunite",
     "valeur": "par la magie",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "magic can neither reduce any of your Speeds nor cause you to have the Paralyzed or Restrained condition."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-invisibility",
   "name": "Ring of Invisibility",
   "effets": [
    {
     "famille": "action",
     "cible": "other.invisible",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to give yourself the Invisible condition."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-jumping",
   "name": "Ring of Jumping",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.jump",
     "mode": "sort",
     "valeur": "soi seulement",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can cast Jump from it, but can target only yourself when you do so."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-mind-shielding",
   "name": "Ring of Mind Shielding",
   "effets": [
    {
     "famille": "capacite",
     "cible": "immunity.mind-reading",
     "mode": "immunite",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you are immune to magic that allows other creatures to read your thoughts"
    },
    {
     "famille": "capacite",
     "cible": "other.telepathy-consent",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Creatures can telepathically communicate with you only if you allow it."
    },
    {
     "famille": "action",
     "cible": "other.imperceptible",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You can take a Magic action to cause the ring to become imperceptible"
    },
    {
     "famille": "autre",
     "cible": "other.soul",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If you die while wearing the ring, your soul enters it, unless it already houses a soul."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-protection",
   "name": "Ring of Protection",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to Armor Class and saving throws while wearing this ring."
    },
    {
     "famille": "chiffre",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to Armor Class and saving throws while wearing this ring."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-regeneration",
   "name": "Ring of Regeneration",
   "effets": [
    {
     "famille": "capacite",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "1d6 / 10 min",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you regain 1d6 Hit Points every 10 minutes if you have at least 1 Hit Point."
    },
    {
     "famille": "autre",
     "cible": "other.regrow",
     "mode": "texte",
     "valeur": "1d6 + 1 jours",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If you lose a body part, the ring causes the missing part to regrow"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-resistance",
   "name": "Ring of Resistance",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.acid",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Acid",
     "citation": "1 Acid Pearl"
    },
    {
     "famille": "capacite",
     "cible": "resistance.cold",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Cold",
     "citation": "2 Cold Tourmaline"
    },
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Fire",
     "citation": "3 Fire Garnet"
    },
    {
     "famille": "capacite",
     "cible": "resistance.force",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Force",
     "citation": "4 Force Sapphire"
    },
    {
     "famille": "capacite",
     "cible": "resistance.lightning",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Lightning",
     "citation": "5 Lightning Citrine"
    },
    {
     "famille": "capacite",
     "cible": "resistance.necrotic",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Necrotic",
     "citation": "6 Necrotic Jet"
    },
    {
     "famille": "capacite",
     "cible": "resistance.poison",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Poison",
     "citation": "7 Poison Amethyst"
    },
    {
     "famille": "capacite",
     "cible": "resistance.psychic",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Psychic",
     "citation": "8 Psychic Jade"
    },
    {
     "famille": "capacite",
     "cible": "resistance.radiant",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Radiant",
     "citation": "9 Radiant Topaz"
    },
    {
     "famille": "capacite",
     "cible": "resistance.thunder",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": "Thunder",
     "citation": "10 Thunder Spinel"
    }
   ],
   "note": "Un seul type par anneau (gemme), choisi par le MJ ou 1d10 ; pas d'harmonisation."
  },
  {
   "id": "srd:item:en:ring-of-shooting-stars",
   "name": "Ring of Shooting Stars",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.dancing-lights",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You can cast Dancing Lights or Light from the ring."
    },
    {
     "famille": "action",
     "cible": "spell.light",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You can cast Dancing Lights or Light from the ring."
    },
    {
     "famille": "action",
     "cible": "spell.faerie-fire",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 sur 6, regagne 1d6 à l'aube",
     "variante": null,
     "citation": "You can expend 1 charge to cast Faerie Fire from the ring."
    },
    {
     "famille": "action",
     "cible": "other.lightning-spheres",
     "mode": "texte",
     "valeur": "DC 15 Dex",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "2 sur 6, regagne 1d6 à l'aube",
     "variante": null,
     "citation": "You can expend 2 charges as a Magic action to create up to four 3-foot-diameter spheres of lightning."
    },
    {
     "famille": "action",
     "cible": "other.shooting-stars",
     "mode": "texte",
     "valeur": "5d4 Radiant, DC 15 Dex",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 à 3 sur 6, regagne 1d6 à l'aube",
     "variante": null,
     "citation": "taking 5d4 Radiant damage on a failed save or half as much damage on a successful one."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-spell-storing",
   "name": "Ring of Spell Storing",
   "effets": [
    {
     "famille": "action",
     "cible": "other.cast-stored-spell",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While wearing this ring, you can cast any spell stored in it."
    },
    {
     "famille": "autre",
     "cible": "other.spell-storage",
     "mode": "plafond",
     "valeur": 5,
     "plafond": 5,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The ring can store up to 5 levels worth of spells at a time."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-spell-turning",
   "name": "Ring of Spell Turning",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.save-spells",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While wearing this ring, you have Advantage on saving throws against spells."
    },
    {
     "famille": "capacite",
     "cible": "other.spell-negate",
     "mode": "texte",
     "valeur": "niveau ≤ 7",
     "plafond": 7,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "for a spell of level 7 or lower, the spell has no effect on you."
    },
    {
     "famille": "action",
     "cible": "other.reflect-spell",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Reaction to deflect the spell back at the spell’s caster"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-swimming",
   "name": "Ring of Swimming",
   "effets": [
    {
     "famille": "capacite",
     "cible": "speed.swim",
     "mode": "octroi",
     "valeur": 40,
     "plafond": null,
     "condition": "porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You have a Swim Speed of 40 feet while wearing this ring."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-telekinesis",
   "name": "Ring of Telekinesis",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.telekinesis",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "While wearing this ring, you can cast Telekinesis from it."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-the-ram",
   "name": "Ring of the Ram",
   "effets": [
    {
     "famille": "action",
     "cible": "other.ram-attack",
     "mode": "texte",
     "valeur": "+7 à l'attaque, 2d10 Force par charge",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 à 3 sur 3, regagne 1d3 à l'aube",
     "variante": null,
     "citation": "for each charge you spend, the target takes 2d10 Force damage and is pushed 5 feet away from you."
    },
    {
     "famille": "action",
     "cible": "other.break-object",
     "mode": "texte",
     "valeur": "+5 par charge",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 à 3 sur 3, regagne 1d3 à l'aube",
     "variante": null,
     "citation": "The ring makes a Strength check with a +5 bonus for each charge you spend."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-three-wishes",
   "name": "Ring of Three Wishes",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.wish",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3, non rechargeables",
     "variante": null,
     "citation": "you can expend 1 of its 3 charges to cast Wish from it."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-warmth",
   "name": "Ring of Warmth",
   "effets": [
    {
     "famille": "capacite",
     "cible": "other.cold-reduction",
     "mode": "texte",
     "valeur": "-2d8 Cold",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If you take Cold damage while wearing this ring, the ring reduces the damage you take by 2d8."
    },
    {
     "famille": "capacite",
     "cible": "other.cold-temperature",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you and everything you wear and carry are unharmed by temperatures of 0 degrees Fahrenheit or lower."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-water-walking",
   "name": "Ring of Water Walking",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.water-walk",
     "mode": "sort",
     "valeur": "soi seulement",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you cast Water Walk from it, targeting only yourself."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:ring-of-x-ray-vision",
   "name": "Ring of X-ray Vision",
   "effets": [
    {
     "famille": "action",
     "cible": "other.xray-vision",
     "mode": "texte",
     "valeur": "30 ft, 1 min",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to gain X-ray vision with a range of 30 feet for 1 minute."
    },
    {
     "famille": "autre",
     "cible": "other.exhaustion-risk",
     "mode": "texte",
     "valeur": "DC 15 Con",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you must succeed on a DC 15 Constitution saving throw or gain 1 Exhaustion level."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:robe-of-eyes",
   "name": "Robe of Eyes",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.perception-sight",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The robe gives you Advantage on Wisdom (Perception) checks that rely on sight."
    },
    {
     "famille": "capacite",
     "cible": "sense.darkvision",
     "mode": "octroi",
     "valeur": 120,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You have Darkvision and Truesight, both with a range of 120 feet."
    },
    {
     "famille": "capacite",
     "cible": "sense.truesight",
     "mode": "octroi",
     "valeur": 120,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You have Darkvision and Truesight, both with a range of 120 feet."
    },
    {
     "famille": "autre",
     "cible": "other.blinded-drawback",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "toujours",
     "duree": "temporaire",
     "charges": null,
     "variante": null,
     "citation": "gives you the Blinded condition for 1 minute."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:robe-of-scintillating-colors",
   "name": "Robe of Scintillating Colors",
   "effets": [
    {
     "famille": "action",
     "cible": "other.dazzle",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 sur 3, regagne 1d3 à l'aube",
     "variante": null,
     "citation": "creatures that can see you have Disadvantage on attack rolls against you."
    },
    {
     "famille": "action",
     "cible": "other.stun",
     "mode": "texte",
     "valeur": "DC 15 Wis",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 sur 3, regagne 1d3 à l'aube",
     "variante": null,
     "citation": "must succeed on a DC 15 Wisdom saving throw or have the Stunned condition until the effect ends."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:robe-of-stars",
   "name": "Robe of Stars",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to saving throws while you wear it."
    },
    {
     "famille": "action",
     "cible": "spell.magic-missile",
     "mode": "sort",
     "valeur": "niveau 5",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "6 étoiles, 1d6 reviennent au crépuscule",
     "variante": null,
     "citation": "expend it to cast the level 5 version of Magic Missile."
    },
    {
     "famille": "action",
     "cible": "other.astral-travel",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to enter the Astral Plane"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:robe-of-the-archmagi",
   "name": "Robe of the Archmagi",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "fixe",
     "valeur": "15 + Dex",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "If you aren’t wearing armor, your base Armor Class is 15 plus your Dexterity modifier."
    },
    {
     "famille": "capacite",
     "cible": "advantage.save-magic",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You have Advantage on saving throws against spells and other magical effects."
    },
    {
     "famille": "chiffre",
     "cible": "dc.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Your spell save DC and spell attack bonus each increase by 2."
    },
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Your spell save DC and spell attack bonus each increase by 2."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:robe-of-useful-items",
   "name": "Robe of Useful Items",
   "effets": [
    {
     "famille": "action",
     "cible": "other.patches",
     "mode": "texte",
     "valeur": "2 × 6 patches fixes + 4d4 aléatoires",
     "plafond": null,
     "condition": "active",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "detach one of the patches, causing it to become the object or creature it represents."
    }
   ],
   "note": "Stock d'objets (table 1d100 de patchs) non détaillé en effets."
  },
  {
   "id": "srd:item:en:rod-of-absorption",
   "name": "Rod of Absorption",
   "effets": [
    {
     "famille": "action",
     "cible": "other.absorb-spell",
     "mode": "texte",
     "valeur": null,
     "plafond": 50,
     "condition": "active",
     "duree": null,
     "charges": "50 niveaux sur la vie de l'objet",
     "variante": null,
     "citation": "you can take a Reaction to absorb a spell that is targeting only you"
    },
    {
     "famille": "action",
     "cible": "other.spell-slots",
     "mode": "texte",
     "valeur": "niveau ≤ 5",
     "plafond": 5,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can convert energy stored in it into spell slots to cast spells you have prepared or know."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:rod-of-alertness",
   "name": "Rod of Alertness",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.perception",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Wisdom (Perception) checks and on Initiative rolls."
    },
    {
     "famille": "capacite",
     "cible": "advantage.initiative",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Wisdom (Perception) checks and on Initiative rolls."
    },
    {
     "famille": "action",
     "cible": "spell.detect-evil-and-good",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "• Detect Evil and Good • Detect Magic • Detect Poison and Disease • See Invisibility"
    },
    {
     "famille": "action",
     "cible": "spell.detect-magic",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "• Detect Evil and Good • Detect Magic • Detect Poison and Disease • See Invisibility"
    },
    {
     "famille": "action",
     "cible": "spell.detect-poison-and-disease",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "• Detect Evil and Good • Detect Magic • Detect Poison and Disease • See Invisibility"
    },
    {
     "famille": "action",
     "cible": "spell.see-invisibility",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "• Detect Evil and Good • Detect Magic • Detect Poison and Disease • See Invisibility"
    },
    {
     "famille": "action",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/aube",
     "variante": null,
     "citation": "you and your allies gain a +1"
    },
    {
     "famille": "action",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/aube",
     "variante": null,
     "citation": "you and your allies gain a +1"
    },
    {
     "famille": "action",
     "cible": "other.sense-invisible",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/aube",
     "variante": null,
     "citation": "can sense the location of any Invisible creature that is also in the Bright Light."
    }
   ],
   "note": "Aura : +1 CA et sauvegardes dans la Bright Light, 10 min."
  },
  {
   "id": "srd:item:en:rod-of-lordly-might",
   "name": "Rod of Lordly Might",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "it functions as a magic Mace that grants a +3 bonus to attack rolls and damage rolls made with it."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "it functions as a magic Mace that grants a +3 bonus to attack rolls and damage rolls made with it."
    },
    {
     "famille": "autre",
     "cible": "other.extra-damage",
     "mode": "bonus",
     "valeur": "2d6 Fire",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Button 1",
     "citation": "functions as a magic Longsword or Shortsword (your choice) that deals an extra 2d6 Fire damage on a hit."
    },
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Button 2",
     "citation": "transforming the rod into a magic Battleaxe that grants a +3 bonus to attack rolls and damage rolls"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Button 2",
     "citation": "transforming the rod into a magic Battleaxe that grants a +3 bonus to attack rolls and damage rolls"
    },
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Button 3",
     "citation": "transforming the rod into a magic Spear that grants a +3 bonus to attack rolls and damage rolls"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Button 3",
     "citation": "transforming the rod into a magic Spear that grants a +3 bonus to attack rolls and damage rolls"
    },
    {
     "famille": "autre",
     "cible": "other.climbing-pole",
     "mode": "texte",
     "valeur": "50 ft",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Button 4",
     "citation": "The rod transforms into a climbing pole up to 50 feet long"
    },
    {
     "famille": "chiffre",
     "cible": "skill.athletics",
     "mode": "bonus",
     "valeur": 10,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": "Button 5",
     "citation": "grants its user a +10 bonus to Strength (Athletics) checks made to break through doors, barricades, and other barriers."
    },
    {
     "famille": "autre",
     "cible": "other.compass",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": "Button 6",
     "citation": "The rod assumes or remains in its normal form and indicates magnetic north."
    },
    {
     "famille": "action",
     "cible": "other.drain-life",
     "mode": "texte",
     "valeur": "4d6 Necrotic, DC 17 Con",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1/aube",
     "variante": null,
     "citation": "On a failed save, the target takes an extra 4d6 Necrotic damage"
    },
    {
     "famille": "action",
     "cible": "other.paralyze",
     "mode": "texte",
     "valeur": "DC 17 Con",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/aube",
     "variante": null,
     "citation": "On a failed save, the target has the Paralyzed condition for 1 minute."
    },
    {
     "famille": "action",
     "cible": "other.terrify",
     "mode": "texte",
     "valeur": "DC 17 Wis, 30 ft",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/aube",
     "variante": null,
     "citation": "On a failed save, a target has the Frightened condition for 1 minute."
    }
   ],
   "note": "Button 5 : +10 seulement pour enfoncer portes et barrières."
  },
  {
   "id": "srd:item:en:rod-of-resurrection",
   "name": "Rod of Resurrection",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.heal",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 sur 5, regagne 1 à l'aube",
     "variante": null,
     "citation": "Heal (expends 1 charge)"
    },
    {
     "famille": "action",
     "cible": "spell.resurrection",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5 sur 5, regagne 1 à l'aube",
     "variante": null,
     "citation": "Resurrection (expends 5 charges)"
    },
    {
     "famille": "autre",
     "cible": "other.destroy-risk",
     "mode": "texte",
     "valeur": "1 sur 1d20",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "On a 1, the rod disappears in a harmless burst of radiance."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:rod-of-rulership",
   "name": "Rod of Rulership",
   "effets": [
    {
     "famille": "action",
     "cible": "other.charm",
     "mode": "texte",
     "valeur": "DC 15 Wis, 120 ft, 8 h",
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1/aube",
     "variante": null,
     "citation": "command obedience from each creature of your choice that you can see within 120 feet of yourself."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:rod-of-security",
   "name": "Rod of Security",
   "effets": [
    {
     "famille": "action",
     "cible": "other.demiplane",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 10 jours",
     "variante": null,
     "citation": "you can take a Magic action to activate it"
    },
    {
     "famille": "autre",
     "cible": "hp.regain",
     "mode": "texte",
     "valeur": "1 Hit Point Die / heure",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "a visitor regains Hit Points as if it had spent 1 Hit Point Die"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:rope-of-climbing",
   "name": "Rope of Climbing",
   "effets": [
    {
     "famille": "action",
     "cible": "other.animate-rope",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to command the other end of the rope to animate"
    },
    {
     "famille": "capacite",
     "cible": "advantage.climb",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "grants Advantage on ability checks made to climb using the rope"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:rope-of-entanglement",
   "name": "Rope of Entanglement",
   "effets": [
    {
     "famille": "action",
     "cible": "other.entangle",
     "mode": "texte",
     "valeur": "DD 15 Dex",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The target must succeed on a DC 15 Dexterity saving throw or have the Restrained condition"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:scarab-of-protection",
   "name": "Scarab of Protection",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +1 bonus to Armor Class."
    },
    {
     "famille": "action",
     "cible": "other.preservation",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 12",
     "variante": null,
     "citation": "you can take a Reaction to expend 1 charge and turn the failed save into a successful one"
    },
    {
     "famille": "capacite",
     "cible": "advantage.save-vs-spells",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Advantage on saving throws against spells."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:scimitar-of-speed",
   "name": "Scimitar of Speed",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to attack rolls and damage rolls made with this magic weapon"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to attack rolls and damage rolls made with this magic weapon"
    },
    {
     "famille": "action",
     "cible": "other.bonus-action-attack",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can make one attack with it as a Bonus Action on each of your turns"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sending-stones",
   "name": "Sending Stones",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.sending",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "While you touch one stone, you can cast Sending from it."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sentinel-shield",
   "name": "Sentinel Shield",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.initiative",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Initiative rolls and Wisdom (Perception) checks"
    },
    {
     "famille": "capacite",
     "cible": "advantage.perception",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on Initiative rolls and Wisdom (Perception) checks"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:shield-of-missile-attraction",
   "name": "Shield of Missile Attraction",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.ranged-weapon-attacks",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Resistance to damage from attacks made with Ranged weapons"
    },
    {
     "famille": "autre",
     "cible": "other.curse",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the curse causes you to become the target instead"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:shield-of-the-cavalier",
   "name": "Shield of the Cavalier",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have a +2 bonus to Armor Class"
    },
    {
     "famille": "action",
     "cible": "other.forceful-bash",
     "mode": "texte",
     "valeur": "2d6 + 2 + mod. For (force)",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the Shield deals Force damage to the target equal to 2d6 + 2 plus your Strength modifier"
    },
    {
     "famille": "action",
     "cible": "other.protective-field",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can use the Shield to create an immobile 5-foot Emanation originating from you"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:shield-1-2-or-3",
   "name": "Shield, +1, +2, or +3",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+1",
     "citation": "you have a bonus to Armor Class determined by the Shield’s rarity"
    },
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+2",
     "citation": "you have a bonus to Armor Class determined by the Shield’s rarity"
    },
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+3",
     "citation": "you have a bonus to Armor Class determined by the Shield’s rarity"
    }
   ],
   "note": "Valeur du bonus déduite du nom (+1/+2/+3 selon rareté), non chiffrée dans la description."
  },
  {
   "id": "srd:item:en:slippers-of-spider-climbing",
   "name": "Slippers of Spider Climbing",
   "effets": [
    {
     "famille": "capacite",
     "cible": "speed.climb",
     "mode": "fixe",
     "valeur": "= Speed",
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have a Climb Speed equal to your Speed."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sovereign-glue",
   "name": "Sovereign Glue",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.adhesive",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "can form a permanent adhesive bond between any two objects"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:spell-scroll",
   "name": "Spell Scroll",
   "effets": [
    {
     "famille": "action",
     "cible": "other.spell-scroll",
     "mode": "sort",
     "valeur": "sort inscrit",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can read the scroll and cast its spell without Material components"
    },
    {
     "famille": "autre",
     "cible": "dc.spell",
     "mode": "fixe",
     "valeur": "DD 13–19 / attaque +5–+11 selon niveau",
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The level of the spell on the scroll determines the spell’s saving throw DC and attack bonus"
    },
    {
     "famille": "autre",
     "cible": "other.copy-to-spellbook",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "A Wizard spell on a Spell Scroll can be copied into a spellbook."
    }
   ],
   "note": "Sort variable ; DD et bonus d’attaque fixés par la table selon le niveau du sort."
  },
  {
   "id": "srd:item:en:spellguard-shield",
   "name": "Spellguard Shield",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.save-vs-spells",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on saving throws against spells and other magical effects"
    },
    {
     "famille": "capacite",
     "cible": "disadvantage.spell-attacks-against-you",
     "mode": "desavantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "spell attack rolls have Disadvantage against you"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sphere-of-annihilation",
   "name": "Sphere of Annihilation",
   "effets": [
    {
     "famille": "action",
     "cible": "other.control-sphere",
     "mode": "texte",
     "valeur": "DD 25 Int (Arcana)",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to make a DC 25 Intelligence (Arcana) check"
    },
    {
     "famille": "autre",
     "cible": "other.obliterate",
     "mode": "texte",
     "valeur": "8d10 force",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The sphere obliterates all matter it passes through and all matter that passes through it."
    }
   ],
   "note": "Objet de monde plutôt que d’équipement ; aucun effet sur la fiche."
  },
  {
   "id": "srd:item:en:staff-of-charming",
   "name": "Staff of Charming",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.charm-person",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "You can expend 1 of the staff’s charges to cast Charm Person, Command, or Comprehend Languages from it"
    },
    {
     "famille": "action",
     "cible": "spell.command",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "You can expend 1 of the staff’s charges to cast Charm Person, Command, or Comprehend Languages from it"
    },
    {
     "famille": "action",
     "cible": "spell.comprehend-languages",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "You can expend 1 of the staff’s charges to cast Charm Person, Command, or Comprehend Languages from it"
    },
    {
     "famille": "action",
     "cible": "other.reflect-enchantment",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "you can take a Reaction to expend 1 charge from the staff and turn the spell back on its caster"
    },
    {
     "famille": "action",
     "cible": "other.resist-enchantment",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can turn your failed save into a successful one"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-fire",
   "name": "Staff of Fire",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.fire",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Resistance to Fire damage while you hold this staff."
    },
    {
     "famille": "action",
     "cible": "spell.burning-hands",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "Burning Hands 1"
    },
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3",
     "variante": null,
     "citation": "Fireball 3"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-fire",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4",
     "variante": null,
     "citation": "Wall of Fire 4"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-frost",
   "name": "Staff of Frost",
   "effets": [
    {
     "famille": "capacite",
     "cible": "resistance.cold",
     "mode": "resistance",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You have Resistance to Cold damage while you hold this staff."
    },
    {
     "famille": "action",
     "cible": "spell.cone-of-cold",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Cone of Cold 5"
    },
    {
     "famille": "action",
     "cible": "spell.ice-storm",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4",
     "variante": null,
     "citation": "Ice Storm 4"
    },
    {
     "famille": "action",
     "cible": "spell.fog-cloud",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "Fog Cloud 1"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-ice",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4",
     "variante": null,
     "citation": "Wall of Ice 4"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-healing",
   "name": "Staff of Healing",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.cure-wounds",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 par niveau (max 4)",
     "variante": null,
     "citation": "Cure Wounds 1 charge per spell level"
    },
    {
     "famille": "action",
     "cible": "spell.lesser-restoration",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Lesser Restoration 2"
    },
    {
     "famille": "action",
     "cible": "spell.mass-cure-wounds",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Mass Cure Wounds 5"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-power",
   "name": "Staff of Power",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "ac",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +2 bonus to Armor Class, saving throws, and spell attack rolls"
    },
    {
     "famille": "chiffre",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +2 bonus to Armor Class, saving throws, and spell attack rolls"
    },
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +2 bonus to Armor Class, saving throws, and spell attack rolls"
    },
    {
     "famille": "action",
     "cible": "spell.cone-of-cold",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Cone of Cold 5"
    },
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "sort",
     "valeur": "niveau 5",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Fireball (level 5 version) 5"
    },
    {
     "famille": "action",
     "cible": "spell.globe-of-invulnerability",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "6",
     "variante": null,
     "citation": "Globe of Invulnerability 6"
    },
    {
     "famille": "action",
     "cible": "spell.hold-monster",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Hold Monster 5"
    },
    {
     "famille": "action",
     "cible": "spell.levitate",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Levitate 2"
    },
    {
     "famille": "action",
     "cible": "spell.lightning-bolt",
     "mode": "sort",
     "valeur": "niveau 5",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Lightning Bolt (level 5 version) 5"
    },
    {
     "famille": "action",
     "cible": "spell.magic-missile",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "Magic Missile 1"
    },
    {
     "famille": "action",
     "cible": "spell.ray-of-enfeeblement",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "Ray of Enfeeblement 1"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-force",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Wall of Force 5"
    },
    {
     "famille": "action",
     "cible": "other.retributive-strike",
     "mode": "texte",
     "valeur": "16 × charges (soi) / 4 × charges",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You can take a Magic action to break the staff over your knee or against a solid surface."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-striking",
   "name": "Staff of Striking",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +3 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +3 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "action",
     "cible": "other.extra-force-damage",
     "mode": "texte",
     "valeur": "1d6 force / charge",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "jusqu’à 3",
     "variante": null,
     "citation": "For each charge you expend, the target takes an extra 1d6 Force damage."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-swarming-insects",
   "name": "Staff of Swarming Insects",
   "effets": [
    {
     "famille": "action",
     "cible": "other.insect-cloud",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "you can take a Magic action and expend 1 charge to cause a swarm of harmless flying insects"
    },
    {
     "famille": "action",
     "cible": "spell.giant-insect",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4",
     "variante": null,
     "citation": "Giant Insect 4"
    },
    {
     "famille": "action",
     "cible": "spell.insect-plague",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Insect Plague 5"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-the-magi",
   "name": "Staff of the Magi",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "While you hold it, you gain a +2 bonus to spell attack rolls."
    },
    {
     "famille": "capacite",
     "cible": "advantage.save-vs-spells",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on saving throws against spells"
    },
    {
     "famille": "action",
     "cible": "other.spell-absorption",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the staff absorbs the magic of the spell, canceling its effect and gaining a number of charges"
    },
    {
     "famille": "action",
     "cible": "spell.arcane-lock",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0",
     "variante": null,
     "citation": "Arcane Lock 0"
    },
    {
     "famille": "action",
     "cible": "spell.conjure-elemental",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "7",
     "variante": null,
     "citation": "Conjure Elemental 7"
    },
    {
     "famille": "action",
     "cible": "spell.detect-magic",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0",
     "variante": null,
     "citation": "Detect Magic 0"
    },
    {
     "famille": "action",
     "cible": "spell.dispel-magic",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3",
     "variante": null,
     "citation": "Dispel Magic 3"
    },
    {
     "famille": "action",
     "cible": "spell.enlarge-reduce",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0",
     "variante": null,
     "citation": "Enlarge/Reduce 0"
    },
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "sort",
     "valeur": "niveau 7",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "7",
     "variante": null,
     "citation": "Fireball (level 7 version) 7"
    },
    {
     "famille": "action",
     "cible": "spell.flaming-sphere",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Flaming Sphere 2"
    },
    {
     "famille": "action",
     "cible": "spell.ice-storm",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4",
     "variante": null,
     "citation": "Ice Storm 4"
    },
    {
     "famille": "action",
     "cible": "spell.invisibility",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Invisibility 2"
    },
    {
     "famille": "action",
     "cible": "spell.knock",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Knock 2"
    },
    {
     "famille": "action",
     "cible": "spell.light",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0",
     "variante": null,
     "citation": "Light 0"
    },
    {
     "famille": "action",
     "cible": "spell.lightning-bolt",
     "mode": "sort",
     "valeur": "niveau 7",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "7",
     "variante": null,
     "citation": "Lightning Bolt (level 7 version) 7"
    },
    {
     "famille": "action",
     "cible": "spell.mage-hand",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0",
     "variante": null,
     "citation": "Mage Hand 0"
    },
    {
     "famille": "action",
     "cible": "spell.passwall",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Passwall 5"
    },
    {
     "famille": "action",
     "cible": "spell.plane-shift",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "7",
     "variante": null,
     "citation": "Plane Shift 7"
    },
    {
     "famille": "action",
     "cible": "spell.protection-from-evil-and-good",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "0",
     "variante": null,
     "citation": "Protection from Evil and Good 0"
    },
    {
     "famille": "action",
     "cible": "spell.telekinesis",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Telekinesis 5"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-fire",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "4",
     "variante": null,
     "citation": "Wall of Fire 4"
    },
    {
     "famille": "action",
     "cible": "spell.web",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Web 2"
    },
    {
     "famille": "action",
     "cible": "other.retributive-strike",
     "mode": "texte",
     "valeur": "16 × charges (soi) / 6 × charges",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You can take a Magic action to break the staff over your knee or against a solid surface."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-the-python",
   "name": "Staff of the Python",
   "effets": [
    {
     "famille": "action",
     "cible": "other.giant-constrictor-snake",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "causing the staff to become a Giant Constrictor Snake in that space"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-the-woodlands",
   "name": "Staff of the Woodlands",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "While holding it, you have a +2 bonus to spell attack rolls."
    },
    {
     "famille": "action",
     "cible": "spell.animal-friendship",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "Animal Friendship 1"
    },
    {
     "famille": "action",
     "cible": "spell.awaken",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Awaken 5"
    },
    {
     "famille": "action",
     "cible": "spell.barkskin",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Barkskin 2"
    },
    {
     "famille": "action",
     "cible": "spell.locate-animals-or-plants",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Locate Animals or Plants 2"
    },
    {
     "famille": "action",
     "cible": "spell.pass-without-trace",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Pass without Trace 2"
    },
    {
     "famille": "action",
     "cible": "spell.speak-with-animals",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "Speak with Animals 1"
    },
    {
     "famille": "action",
     "cible": "spell.speak-with-plants",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3",
     "variante": null,
     "citation": "Speak with Plants 3"
    },
    {
     "famille": "action",
     "cible": "spell.wall-of-thorns",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "6",
     "variante": null,
     "citation": "Wall of Thorns 6"
    },
    {
     "famille": "action",
     "cible": "other.tree-form",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "expend 1 charge to transform the staff into a healthy tree"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-thunder-and-lightning",
   "name": "Staff of Thunder and Lightning",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "grants a +2 bonus to attack rolls and damage rolls made with it"
    },
    {
     "famille": "action",
     "cible": "other.lightning",
     "mode": "texte",
     "valeur": "2d6 foudre",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can cause the target to take an extra 2d6 Lightning damage"
    },
    {
     "famille": "action",
     "cible": "other.thunder",
     "mode": "texte",
     "valeur": "DD 17 Con, Stunned",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "The target you hit must succeed on a DC 17 Constitution saving throw or have the Stunned condition"
    },
    {
     "famille": "action",
     "cible": "other.thunder-and-lightning",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can take a Bonus Action to use the Lightning and Thunder properties (see above) at the same time"
    },
    {
     "famille": "action",
     "cible": "other.lightning-strike",
     "mode": "texte",
     "valeur": "9d6 foudre, DD 17 Dex",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "Each creature in that Line makes a DC 17 Dexterity saving throw, taking 9d6 Lightning damage"
    },
    {
     "famille": "action",
     "cible": "other.thunderclap",
     "mode": "texte",
     "valeur": "2d6 tonnerre, DD 17 Con",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "On a failed save, a creature takes 2d6 Thunder damage and has the Deafened condition for 1 minute."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:staff-of-withering",
   "name": "Staff of Withering",
   "effets": [
    {
     "famille": "action",
     "cible": "other.withering",
     "mode": "texte",
     "valeur": "2d10 nécrotique, DD 15 Con",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 (3, 1d3 / aube)",
     "variante": null,
     "citation": "you can expend 1 charge to deal an extra 2d10 Necrotic damage to the target"
    }
   ],
   "note": "Bâton magique sans bonus chiffré à l’attaque ni aux dégâts."
  },
  {
   "id": "srd:item:en:stone-of-controlling-earth-elementals",
   "name": "Stone of Controlling Earth Elementals",
   "effets": [
    {
     "famille": "action",
     "cible": "other.summon-earth-elemental",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can take a Magic action to summon an Earth Elemental"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:stone-of-good-luck-luckstone",
   "name": "Stone of Good Luck (Luckstone)",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "check.all",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +1 bonus to ability checks and saving throws"
    },
    {
     "famille": "chiffre",
     "cible": "save.all",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you gain a +1 bonus to ability checks and saving throws"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sun-blade",
   "name": "Sun Blade",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to attack rolls and damage rolls made with this weapon"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to attack rolls and damage rolls made with this weapon"
    },
    {
     "famille": "action",
     "cible": "other.blade-of-radiance",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Bonus Action to cause a blade of pure radiance to spring into existence"
    },
    {
     "famille": "autre",
     "cible": "other.radiant-damage",
     "mode": "texte",
     "valeur": "radiant au lieu de tranchant",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "which deals Radiant damage instead of Slashing damage"
    },
    {
     "famille": "autre",
     "cible": "other.extra-damage-undead",
     "mode": "texte",
     "valeur": "1d8 radiant",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "When you hit an Undead with it, that target takes an extra 1d8 Radiant damage."
    },
    {
     "famille": "autre",
     "cible": "other.sunlight",
     "mode": "texte",
     "valeur": "15 ft vive + 15 ft faible",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "emits Bright Light in a 15-foot radius and Dim Light for an additional 15 feet"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sword-of-life-stealing",
   "name": "Sword of Life Stealing",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.crit-necrotic",
     "mode": "texte",
     "valeur": "15 nécrotique sur 20 naturel",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "that target takes an extra 15 Necrotic damage"
    },
    {
     "famille": "autre",
     "cible": "hp.temp",
     "mode": "texte",
     "valeur": "= dégâts nécrotiques infligés",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you gain Temporary Hit Points equal to the amount of Necrotic damage taken"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sword-of-sharpness",
   "name": "Sword of Sharpness",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.max-damage-vs-objects",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "maximize your weapon damage dice against the target"
    },
    {
     "famille": "autre",
     "cible": "other.crit-slashing",
     "mode": "texte",
     "valeur": "14 tranchant + 1 Exhaustion sur 20 naturel",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "that target takes an extra 14 Slashing damage and gains 1 Exhaustion level"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:sword-of-wounding",
   "name": "Sword of Wounding",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "2d6 nécrotique",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "the target takes an extra 2d6 Necrotic damage"
    },
    {
     "famille": "autre",
     "cible": "other.prevent-healing",
     "mode": "texte",
     "valeur": "DD 15 Con",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "must succeed on a DC 15 Constitution saving throw or be unable to regain Hit Points for 1 hour"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:talisman-of-pure-good",
   "name": "Talisman of Pure Good",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to spell attack rolls while you wear or hold it."
    },
    {
     "famille": "autre",
     "cible": "other.holy-symbol",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You can use the talisman as a Holy Symbol."
    },
    {
     "famille": "action",
     "cible": "other.pure-rebuke",
     "mode": "texte",
     "valeur": "DD 20 Dex ou 4d6 psychique",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 7",
     "variante": null,
     "citation": "the target makes a DC 20 Dexterity saving throw"
    },
    {
     "famille": "autre",
     "cible": "other.harms-fiends-undead",
     "mode": "texte",
     "valeur": "8d6 radiant",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "A Fiend or an Undead that touches the talisman takes 8d6 Radiant damage"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:talisman-of-the-sphere",
   "name": "Talisman of the Sphere",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.arcana-control-sphere",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you have Advantage on any Intelligence (Arcana) check you make to control a Sphere of Annihilation"
    },
    {
     "famille": "action",
     "cible": "other.move-sphere",
     "mode": "texte",
     "valeur": "10 ft + 10 × mod. Int",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you can take a Magic action to move it 10 feet plus a number of additional feet"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:talisman-of-ultimate-evil",
   "name": "Talisman of Ultimate Evil",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +2 bonus to spell attack rolls while you wear or hold it."
    },
    {
     "famille": "autre",
     "cible": "other.holy-symbol",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+porte",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "You can use the talisman as a Holy Symbol."
    },
    {
     "famille": "action",
     "cible": "other.ultimate-end",
     "mode": "texte",
     "valeur": "DD 20 Dex ou 4d6 psychique",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 6",
     "variante": null,
     "citation": "the target makes a DC 20 Dexterity saving throw"
    },
    {
     "famille": "autre",
     "cible": "other.harms-non-fiends",
     "mode": "texte",
     "valeur": "8d6 nécrotique",
     "plafond": null,
     "condition": "toujours",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "A creature that isn’t a Fiend or an Undead that touches the talisman takes 8d6 Necrotic damage"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:thunderous-greatclub",
   "name": "Thunderous Greatclub",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.str",
     "mode": "fixe",
     "valeur": 20,
     "plafond": null,
     "condition": "harmonise",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Strength is 20 unless your Strength is already equal to or greater than that score"
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "1d8 tonnerre",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "The weapon deals an extra 1d8 Thunder damage to any creature it hits"
    },
    {
     "famille": "action",
     "cible": "other.clap-of-thunder",
     "mode": "texte",
     "valeur": "DD 15 For, Prone",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Each creature in the Cone must succeed on a DC 15 Strength saving throw or have the Prone condition."
    },
    {
     "famille": "action",
     "cible": "other.earthquake",
     "mode": "texte",
     "valeur": "DD 20 Dex, Prone",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / aube",
     "variante": null,
     "citation": "you can strike the weapon against the ground to create an intense seismic disturbance"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:tome-of-clear-thought",
   "name": "Tome of Clear Thought",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.int",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 30,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Intelligence increases by 2, to a maximum of 30"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:tome-of-leadership-and-influence",
   "name": "Tome of Leadership and Influence",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.cha",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 30,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Charisma increases by 2, to a maximum of 30"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:tome-of-understanding",
   "name": "Tome of Understanding",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "ability.wis",
     "mode": "bonus",
     "valeur": 2,
     "plafond": 30,
     "condition": "consomme",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "your Wisdom increases by 2, to a maximum of 30"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:trident-of-fish-command",
   "name": "Trident of Fish Command",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.dominate-beast",
     "mode": "sort",
     "valeur": "DD 15",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 (3, 1d3 / aube)",
     "variante": null,
     "citation": "you can expend 1 charge to cast Dominate Beast (save DC 15) from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:universal-solvent",
   "name": "Universal Solvent",
   "effets": [
    {
     "famille": "autre",
     "cible": "other.solvent",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "consomme",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Each ounce instantly dissolves up to 1 square foot of adhesive it touches, including Sovereign Glue."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:vicious-weapon",
   "name": "Vicious Weapon",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": "2d6",
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "This magic weapon deals an extra 2d6 damage to any creature it hits."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:vorpal-sword",
   "name": "Vorpal Sword",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "autre",
     "cible": "other.ignore-slashing-resistance",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "the weapon ignores Resistance to Slashing damage"
    },
    {
     "famille": "autre",
     "cible": "other.decapitation",
     "mode": "texte",
     "valeur": "sur 20 naturel (sinon 30 tranchant)",
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "you cut off one of the creature’s heads"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-binding",
   "name": "Wand of Binding",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.hold-monster",
     "mode": "sort",
     "valeur": "DD 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "5",
     "variante": null,
     "citation": "Hold Monster 5"
    },
    {
     "famille": "action",
     "cible": "spell.hold-person",
     "mode": "sort",
     "valeur": "DD 17",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "2",
     "variante": null,
     "citation": "Hold Person 2"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-enemy-detection",
   "name": "Wand of Enemy Detection",
   "effets": [
    {
     "famille": "action",
     "cible": "other.enemy-detection",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 7",
     "variante": null,
     "citation": "you know the direction of the nearest creature Hostile to you within 60 feet"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-fear",
   "name": "Wand of Fear",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.command",
     "mode": "sort",
     "valeur": "DD 15",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1",
     "variante": null,
     "citation": "Command (“flee” or “grovel” only) 1"
    },
    {
     "famille": "action",
     "cible": "spell.fear",
     "mode": "sort",
     "valeur": "DD 15",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "3",
     "variante": null,
     "citation": "Fear (60-foot Cone) 3"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-fireballs",
   "name": "Wand of Fireballs",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.fireball",
     "mode": "sort",
     "valeur": "DD 15",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 à 3 (niv. 3 + 1/charge)",
     "variante": null,
     "citation": "you can expend no more than 3 charges to cast Fireball (save DC 15) from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-lightning-bolts",
   "name": "Wand of Lightning Bolts",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.lightning-bolt",
     "mode": "sort",
     "valeur": "DD 15",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 à 3 (niv. 3 + 1/charge)",
     "variante": null,
     "citation": "you can expend no more than 3 charges to cast Lightning Bolt (save DC 15) from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-magic-detection",
   "name": "Wand of Magic Detection",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.detect-magic",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 (3, 1d3 / aube)",
     "variante": null,
     "citation": "you can expend 1 charge to cast Detect Magic from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-magic-missiles",
   "name": "Wand of Magic Missiles",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.magic-missile",
     "mode": "sort",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 à 3 (niv. 1 + 1/charge)",
     "variante": null,
     "citation": "you can expend no more than 3 charges to cast Magic Missile from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-paralysis",
   "name": "Wand of Paralysis",
   "effets": [
    {
     "famille": "action",
     "cible": "other.paralysis",
     "mode": "texte",
     "valeur": "DD 15 Con, Paralyzed",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 7",
     "variante": null,
     "citation": "The target must succeed on a DC 15 Constitution saving throw or have the Paralyzed condition for 1 minute."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-polymorph",
   "name": "Wand of Polymorph",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.polymorph",
     "mode": "sort",
     "valeur": "DD 15",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 7",
     "variante": null,
     "citation": "you can expend 1 charge to cast Polymorph (save DC 15) from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-secrets",
   "name": "Wand of Secrets",
   "effets": [
    {
     "famille": "action",
     "cible": "other.detect-secret-doors-traps",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 (3, 1d3 / aube)",
     "variante": null,
     "citation": "the wand pulses and points at the one nearest to you"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-the-war-mage-1-2-or-3",
   "name": "Wand of the War Mage, +1, +2, or +3",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+1",
     "citation": "you gain a bonus to spell attack rolls determined by the wand’s rarity"
    },
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+2",
     "citation": "you gain a bonus to spell attack rolls determined by the wand’s rarity"
    },
    {
     "famille": "chiffre",
     "cible": "attack.spell",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+3",
     "citation": "you gain a bonus to spell attack rolls determined by the wand’s rarity"
    },
    {
     "famille": "capacite",
     "cible": "other.ignore-half-cover",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise+tenu",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "you ignore Half Cover when making a spell attack roll"
    }
   ],
   "note": "Valeur du bonus déduite du nom (+1/+2/+3 selon rareté), non chiffrée dans la description."
  },
  {
   "id": "srd:item:en:wand-of-web",
   "name": "Wand of Web",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.web",
     "mode": "sort",
     "valeur": "DD 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 7",
     "variante": null,
     "citation": "you can expend 1 charge to cast Web (save DC 13) from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wand-of-wonder",
   "name": "Wand of Wonder",
   "effets": [
    {
     "famille": "action",
     "cible": "other.wand-of-wonder",
     "mode": "texte",
     "valeur": "table 1d100",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 7",
     "variante": null,
     "citation": "That location becomes the point of origin of a spell or other magical effect determined by rolling"
    },
    {
     "famille": "autre",
     "cible": "dc.spell",
     "mode": "fixe",
     "valeur": 15,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "Spells cast from the wand have a save DC of 15."
    }
   ],
   "note": "Effet aléatoire (table 1d100) ; les sorts de la table ne sont pas détaillés un par un."
  },
  {
   "id": "srd:item:en:weapon-of-warning",
   "name": "Weapon of Warning",
   "effets": [
    {
     "famille": "capacite",
     "cible": "advantage.initiative",
     "mode": "avantage",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise",
     "duree": "permanente",
     "charges": null,
     "variante": null,
     "citation": "Each subject has Advantage on its Initiative rolls."
    },
    {
     "famille": "autre",
     "cible": "other.alarm",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "harmonise",
     "duree": null,
     "charges": null,
     "variante": null,
     "citation": "The weapon magically awakens each subject who is sleeping naturally when combat begins."
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:weapon-1-2-or-3",
   "name": "Weapon, +1, +2, or +3",
   "effets": [
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+1",
     "citation": "You have a bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 1,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+1",
     "citation": "You have a bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+2",
     "citation": "You have a bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 2,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+2",
     "citation": "You have a bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "attack.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+3",
     "citation": "You have a bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "famille": "chiffre",
     "cible": "damage.weapon",
     "mode": "bonus",
     "valeur": 3,
     "plafond": null,
     "condition": "tenu",
     "duree": "permanente",
     "charges": null,
     "variante": "+3",
     "citation": "You have a bonus to attack rolls and damage rolls made with this magic weapon."
    }
   ],
   "note": "Valeur du bonus déduite du nom (+1/+2/+3 selon rareté), non chiffrée dans la description."
  },
  {
   "id": "srd:item:en:well-of-many-worlds",
   "name": "Well of Many Worlds",
   "effets": [
    {
     "famille": "action",
     "cible": "other.portal",
     "mode": "texte",
     "valeur": null,
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1 / 1d8 heures",
     "variante": null,
     "citation": "it forms a two-way, 6-foot-diameter, circular portal to another world or plane of existence"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wind-fan",
   "name": "Wind Fan",
   "effets": [
    {
     "famille": "action",
     "cible": "spell.gust-of-wind",
     "mode": "sort",
     "valeur": "DD 13",
     "plafond": null,
     "condition": "active",
     "duree": null,
     "charges": "1ère / aube, puis 20 % d’échec cumulatif",
     "variante": null,
     "citation": "you can cast Gust of Wind (save DC 13) from it"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:winged-boots",
   "name": "Winged Boots",
   "effets": [
    {
     "famille": "action",
     "cible": "speed.fly",
     "mode": "fixe",
     "valeur": 30,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 (4, 1d4 / aube)",
     "variante": null,
     "citation": "gaining a Fly Speed of 30 feet for 1 hour"
    }
   ],
   "note": ""
  },
  {
   "id": "srd:item:en:wings-of-flying",
   "name": "Wings of Flying",
   "effets": [
    {
     "famille": "action",
     "cible": "speed.fly",
     "mode": "fixe",
     "valeur": 60,
     "plafond": null,
     "condition": "active",
     "duree": "temporaire",
     "charges": "1 / 1d12 heures",
     "variante": null,
     "citation": "The wings give you a Fly Speed of 60 feet."
    }
   ],
   "note": ""
  }
 ]
};
