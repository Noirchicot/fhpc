# Make a catalog for SOWLREACH

A **catalog** is a book you made: your own species, backgrounds, feats, spells, magic items, weapons,
armor and gear, in one file. You import it in the builder like any book (**Menu › Layers › Import a
book**). It lives in your storage, you switch it on and off in Layers, and its trash deletes it.

The simplest way to make one is to ask an AI to write it for you, from the model. The prompt to paste is at
the end of this page.

> The model catalog: [`examples/catalog-modele.layer.json`](../examples/catalog-modele.layer.json) — one
> record of each type, all invented. Copy it, rename it, replace the records with your own.

---

## The three rules

1. **A catalog only adds.** It brings new records. It never changes or removes a record that already
   exists in the SRD, in Fate's Hand or in another book. (A Dungeon Master who wants to change an
   existing record uses the character's overrides or Campaign items, not a catalog.)
2. **A catalog writes under its own name.** Its id is your name, a dash, the catalog's name — for
   example `noirchicot-mistlands` — and every record id begins with it:
   `noirchicot-mistlands:spell:en:ember-lance`. Names the app keeps for itself (`srd`, `srfh`, `fh`,
   `xphb`, `xdmg`, and anything that begins with them and a dash) are refused.
3. **One file, one catalog.** Two catalogs with the same id are the same catalog: importing the second
   **replaces** the first. That is also how you update your catalog — raise its `version`, import it again.

## What a catalog cannot add yet

- **Subclasses.** In the rules the app reads, a subclass lives inside its class, so adding one would mean
  changing the class — which a catalog never does. A way to attach a subclass to its class without changing
  it will come later.
- Classes, class features, skills, rules, monsters: a catalog adds content, not rules.
- **Pictures.** A species from a catalog shows the builder's generic picture: a catalog has no pictures of its
  own for now.

---

## The file, field by field

A catalog is one JSON object:

| field | what it holds |
|---|---|
| `schema` | always `"fh-layer/1"` |
| `id` | your catalog's id: `yourname-catalogname` — lowercase letters, digits and single dashes, 3 to 60 characters |
| `version` | like `"1.0.0"` — raise it when you change the catalog |
| `name` | the name players read in Layers, like `"Mistlands"` |
| `lang` | the language of your records, like `"en"` |
| `units` | optional: `{ "distance": "ft", "weight": "lb" }` (or `"m"` and `"kg"`) |
| `flags` | always `[]` — a catalog switches on no rule |
| `description` | optional: a sentence about your catalog |
| `attribution` | who made it and under which licence: `{ "author": "Your Name", "license": "CC-BY-4.0" }` — Layers shows it as *by Your Name*. `text` and `url` are optional. |
| `records` | your records, by type: `{ "spell": { … }, "feat": { … } }` |

### A record

Each record sits under its type, keyed by its id:

```json
"spell": {
  "noirchicot-mistlands:spell:en:ember-lance": {
    "name": "Ember Lance",
    "data": { "level": 1, "school": "evocation", … }
  }
}
```

- The **id** is `<catalog id>:<type>:<language>:<name in lowercase with dashes>`.
- `name` is what players read. `data` is the record's content.
- Never write `"op"`: a catalog only adds. (`"op": "add"` is allowed; `"patch"` and `"disable"` are refused.)
- Optional: `slug`, and an `attribution` or a `source` of the record's own.
- Each id appears **once** in the file.

### The fields each type needs

A record may carry more fields, like the model shows; these ones it must carry, or the builder cannot show
or use it.

| type | fields it must carry |
|---|---|
| `species` | `description`, `size`, `speed_ft` (a number, like 30), `traits` (a list of `{ "id", "name", "text" }`) |
| `background` | `ability_keys` (like `["wis", "int", "con"]`), `skill_ids` (like `["srd:skill:en:perception"]`), `feat_id` (the id of its origin feat — yours or the SRD's), `equipment` |
| `feat` | `category` (`origin`, `general`, `fighting-style` or `epic-boon`), `description` |
| `spell` | `level` (0 to 9; 0 is a cantrip), `school` (`abjuration`, `conjuration`, `divination`, `enchantment`, `evocation`, `illusion`, `necromancy` or `transmutation`), `casting_time`, `range`, `components`, `duration`, `description`, `class_keys` (like `["Wizard"]`) |
| `item` | `category` (`armor`, `potion`, `ring`, `rod`, `scroll`, `staff`, `wand`, `weapon` or `wondrous-item`), `rarity`, `attunement` (`true` or `false`), `description` |
| `weapon` | `cost`, `weight`, `damage` (like `"1d8 Slashing"`), `damage_dice` (like `"1d8"`), `damage_type_key` (`bludgeoning`, `piercing` or `slashing`), `weapon_category` (`simple` or `martial`), `weapon_range` (`melee` or `ranged`), `property_list` (`[]` if none) |
| `armor` | `armor_category` (`light`, `medium`, `heavy` or `shield`), `ac_base` (a number), `cost`, `weight` |
| `gear` | `cost`, `weight` |

---

## Check it

**In the builder**: Menu › Layers › **Import a book**. A catalog with faults is not imported, and the window
names the faults, each with where it is (`records.spell["…"].data.level — Missing. …`). Fix them, import
again.

**On a computer, without the builder** (for creators who have the SOWLREACH code):

```
node tools/verifier-catalog.mjs my-catalog.json
```

It is the same judge as the builder's: it prints every fault, and exits with 0 when the catalog is
accepted. `--json` prints the verdict for a script.

## Where it lives

Wherever you chose to keep your characters (Menu › Vault): in your Dropbox, as
`Apps/SOWLREACH/books/<catalog id>.layer.json`, or on this device. It is never put on the site. You can
also drop the file into that Dropbox folder yourself: the builder checks it with the same judge when it
starts, and shows it in Layers.

---

## The text to paste into an AI

Paste this, then paste the whole model file after it, then describe what you want.

```
You write a catalog for SOWLREACH, a character builder for the 5th edition SRD.
A catalog is ONE JSON file. Follow the model I paste below EXACTLY, and these rules:

1. Keep "schema": "fh-layer/1", "flags": [], and the same field names as the model.
2. Set "id" to <my name>-<catalog name>, lowercase with single dashes (for example "noirchicot-mistlands").
   Set "name", "version" ("1.0.0"), "lang" ("en"), and "attribution": { "author": "<my name>", "license": "<licence>" }.
3. Every record id is "<catalog id>:<type>:en:<name-in-lowercase-with-dashes>", and each id appears only once.
4. Only these types: species, background, feat, spell, item, weapon, armor, gear. No subclass, no class.
5. Only ADD new records. Never reuse an id that begins with srd:, srfh:, fh:, xphb: or xdmg:, and never write "op".
6. Give every record the fields the model's record of the same type has, with the same kinds of values
   (numbers stay numbers, lists stay lists, true/false stay true/false). Use the same allowed words
   (a spell's "school", an item's "category", a weapon's "weapon_category", …).
7. Write your own text for everything. Do not copy text from any published book.
8. Answer with the JSON file only, nothing before or after it.

Here is the model:
```

*(Then paste the content of `catalog-modele.layer.json`, and say what you want: "a catalog called
Mistlands with two spells of fog and a species of marsh folk", for example.)*

The words in this guide are drafts, and they will change.
