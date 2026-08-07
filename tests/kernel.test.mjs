import { test } from "node:test";
import assert from "node:assert/strict";
import { defineBlock, dispatch, assertBlocks } from "../src/kernel/registry.mjs";
import { on, emit } from "../src/kernel/bus.mjs";

test("dispatch routes to the defined verb and returns its result", () => {
  defineBlock("kernel-test-doc", {
    verbs: {
      open: (payload) => `opened:${payload.id}`,
    },
  });

  const result = dispatch("kernel-test-doc.open", { id: "char-1" });
  assert.equal(result, "opened:char-1");
});

test("dispatch throws on an unknown verb, naming block and verb", () => {
  defineBlock("kernel-test-layers", { verbs: { register: () => "ok" } });

  assert.throws(
    () => dispatch("kernel-test-layers.nope", {}),
    /unknown verb "nope" on block "kernel-test-layers"/,
  );
});

test("dispatch throws on an unknown block, naming it", () => {
  assert.throws(
    () => dispatch("kernel-test-ghost.anything", {}),
    /unknown block "kernel-test-ghost"/,
  );
});

test("bus: on/emit delivers the event with type and epoch `at`", () => {
  const received = [];
  const off = on("kernel-test-event", (event) => received.push(event));

  const before = Date.now();
  emit("kernel-test-event", { foo: "bar" });
  const after = Date.now();

  assert.equal(received.length, 1);
  assert.equal(received[0].type, "kernel-test-event");
  assert.equal(received[0].foo, "bar");
  assert.ok(received[0].at >= before && received[0].at <= after);

  off();
  emit("kernel-test-event", { foo: "baz" });
  assert.equal(received.length, 1);
});

test("assertBlocks throws listing every missing block", () => {
  defineBlock("kernel-test-present", { verbs: {} });

  assert.throws(
    () => assertBlocks(["kernel-test-present", "kernel-test-missing-a", "kernel-test-missing-b"]),
    /missing block\(s\): kernel-test-missing-a, kernel-test-missing-b/,
  );
});

test("assertBlocks does not throw when every named block is defined", () => {
  defineBlock("kernel-test-present-2", { verbs: {} });
  assert.doesNotThrow(() => assertBlocks(["kernel-test-present-2"]));
});
