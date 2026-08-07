const blocks = new Map();

export function defineBlock(name, { verbs }) {
  if (blocks.has(name)) {
    throw new Error(`fhpc/kernel: block "${name}" is already defined`);
  }
  blocks.set(name, { verbs: new Map(Object.entries(verbs)) });
}

export function dispatch(route, payload) {
  const parts = route.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`fhpc/kernel: invalid route "${route}", expected "block.verb"`);
  }
  const [blockName, verbName] = parts;

  const block = blocks.get(blockName);
  if (!block) {
    throw new Error(`fhpc/kernel: unknown block "${blockName}"`);
  }

  const verb = block.verbs.get(verbName);
  if (!verb) {
    throw new Error(`fhpc/kernel: unknown verb "${verbName}" on block "${blockName}"`);
  }

  return verb(payload);
}

export function assertBlocks(names) {
  const missing = names.filter((name) => !blocks.has(name));
  if (missing.length > 0) {
    throw new Error(`fhpc/kernel: missing block(s): ${missing.join(", ")}`);
  }
}
