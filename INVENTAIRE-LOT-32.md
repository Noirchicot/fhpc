# Lot 32 — layers portable (in-browser engine)

## What this proves
`src/build/*.mjs` and `src/layers/*.mjs` (minus one function) had zero
Node-only dependencies already. The single blocker was `src/layers/document.mjs`:
`node:crypto` for `sha256()` and `Buffer` for byte handling — both used
synchronously inside `readLayer()`, which `register()` calls on the hot path.

## What changed
- `src/layers/sha256.mjs` (new): a synchronous, dependency-free SHA-256
  (FIPS 180-4), `Uint8Array` in, hex string out.
- `src/layers/document.mjs`: `sha256()` now calls the portable implementation;
  `bytesOf()` returns a plain `Uint8Array` via `TextEncoder` instead of
  `Buffer.from`; `readLayer()` decodes with `TextDecoder` instead of
  `Buffer#toString`.

## Why not `crypto.subtle.digest`
It's asynchronous. `readLayer`/`register` are a synchronous verb contract
that this lot does not reopen — swapping the whole layers block to async
would ripple into `build`, every test harness, and the MCP surface.

## Verification
- The portable SHA-256 was checked byte-for-byte against `node:crypto` on
  five vectors before being wired in: empty input, `"abc"`, a >64-byte
  string (crosses two blocks), 55 bytes (block boundary), 56 bytes (forces
  a second block), and a real layer file (`fh-skills-en.layer.json`,
  crossing several blocks). All five matched exactly.
- `npm test`: 579/579, unchanged from before the lot — this is a
  swap-in-place, no test needed new coverage for the portable hash itself
  beyond the vector check above (kept out of `tests/` deliberately: it is a
  pure-function correctness check, run once against a fixed oracle, not a
  behavior of the block that regresses).
- ⭐ **The real proof**: served the repo over plain HTTP, imported
  `src/layers/index.mjs` and `src/build/index.mjs` directly in a browser tab
  (no bundler, no transform), registered the real 5-layer EN+FH stack by
  `fetch()`, and called `rebuild()` on the real example character
  (`examples/personnage-fh-en-niveau1.fh-char.json`). Result: `resolved`
  produced, **13 real decisions**, the Skills decision showing real options
  (`arcana, history, insight, investigation, medicine, nature, religion`),
  real provenance (`{mode: "offered", kind: "class", id: "srd:class:en:wizard"}`),
  and `status: "answered"`. The layer hashes computed in-browser matched the
  ones from a prior Node run of the exact same files, byte for byte.

## What this unblocks
`ui/builder/shell.mjs` (lots 30-31) can now import the engine directly and
dispatch real verbs — no server, no bundler. That wiring is the next lot.
