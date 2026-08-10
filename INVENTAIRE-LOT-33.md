# Lot 33 — Skills step wired to the real engine

## What this does
The Skills step of `ui/builder/` (lots 30/31) no longer shows a placeholder.
It boots the real engine in-page (`engine.mjs`, built on lot 32's portable
layers), mounts the real 5-layer EN+FH stack, loads the real example
character, and renders the real `decisions[]` carnet (lot 28) as clickable
chips. Clicking calls the real `set`/`clear` verbs and re-derives via
`rebuild`, on the actual document — no simulation layer.

## A real bug found by actually clicking, twice
First pass grouped skill decisions by "does the path's last segment say
`skills`". That missed the Elf's real choice, which lives at
`species.keenSenses` — the trait's own name, not a generic word. Clicking
a chip issued `clear`/`set` on the synthetic path `species.skills` instead,
which the engine correctly no-ops on (`removed: false`) since no choice
ever lives there. **Fixed by grouping on `provenance.field`**
(`skill_choice` / `granted_skill_choice`), which `decisions.mjs` sets
itself — not deduced from path text.

Second pass assumed the synthetic aggregate entry is always `entries[0]` of
a group ("multiPlan pushes it first"). Also wrong, and also only found by
clicking: `projectDecisions` sorts the WHOLE carnet by `path` before
returning it (`decisions.mjs:246`), and `"species.keenSenses" < "species.skills"`
alphabetically — so the real slot sorted *before* its own summary. Fixed
by identifying the synthetic entry structurally: its path is always
`${provenance.kind}.skills` (multiPlan's fixed `basePath` convention), and
it only exists as a distinct, non-actionable entry when it *coexists* with
at least one other path in the group — `decisions.mjs`'s own dedup
(`unique.set(entry.path, entry)`, last write wins) already collapses it
into the real slot whenever a species' real choice happens to live exactly
at that path.

Both bugs were invisible from reading the code correctly out of context —
they only showed up by actually clicking a chip and watching the state not
change. Neither the engine nor lot 28 has a bug; both bugs were in this
lot's own grouping logic.

## Verified
- Fresh browser tab (twice, to rule out any module-cache doubt), real
  5-layer stack, real example character (a Wizard/Elf).
- Class group: 2 of 2 chosen, both slots individually clickable, switching
  one slot's value (arcana → nature/history) leaves the other slot and the
  species slot untouched.
- Species group: clearing the Elf's real choice drops it to "0 of 1
  chosen", no chip highlighted; picking a different one re-derives
  correctly.
- `npm test`: 579/579, unchanged — no engine file touched, this lot is UI
  code only (`ui/builder/engine.mjs`, `ui/builder/skills-step.mjs`, and the
  wiring in `shell.mjs`/`shell.css`).

## Known content fact flagged by Eric, not addressed here
Eric noted mid-session that Elf Keen Senses normally grants **2** skill
points, not 1 — the fixture/layer currently declares `count: 1`. He said
explicitly it can be corrected later; this lot does not touch content.

## What's still a placeholder
The other eight steps (Universe & Layers, Concept, Class, Species,
Background, Abilities, Destiny, Review) are unchanged from lot 31 — each is
its own follow-up lot, on the same model now proven end-to-end: real
engine, real `decisions[]`, real verbs, no guessing at the document shape.
