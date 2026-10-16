import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const filename = fileURLToPath(new URL("../src/components/PatientSelector.tsx", import.meta.url));
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText;

// Exercise the component's save event with deterministic hook state; no patient data or database.
function harness() {
  const states = ["", "", [], true, { fullName: "Test Patient", dob: "2000-01-01", mrn: "TEST-1" }, false];
  let cursor = 0;
  const component = new Module(filename);
  component.filename = filename;
  component.paths = Module._nodeModulePaths(path.dirname(filename));
  const realRequire = component.require.bind(component);
  component.require = (name) => name === "react" ? {
    useId: () => "test",
    useEffect: () => {},
    useState: () => {
      const index = cursor++;
      return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
  } : realRequire(name);
  component._compile(compiled, filename);
  const selected = [];
  const tree = component.exports.default({ value: "", onChange: (id) => selected.push(id) });
  function find(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "button" && node.props.children === "Save Patient") return node;
    return [node.props?.children].flat(Infinity).map(find).find(Boolean);
  }
  return { save: find(tree).props.onClick, states, selected };
}

for (const scenario of ["success", "unauthorized", "network", "invalid"]) {
  test(`patient save: ${scenario}`, async () => {
    const original = globalThis.fetch;
    const patient = { id: "test-id", fullName: "Test Patient", dob: "2000-01-01", mrn: "TEST-1" };
    globalThis.fetch = async () => {
      if (scenario === "network") throw new Error("Network unavailable");
      return { ok: scenario !== "unauthorized", status: scenario === "unauthorized" ? 401 : 201,
        json: async () => scenario === "success" ? patient : { error: "Unauthorized" } };
    };
    try {
      const { save, states, selected } = harness();
      await save();
      assert.equal(states[5], false, "saving always resets");
      if (scenario === "success") {
        assert.deepEqual(selected, [patient.id]);
        assert.equal(states[3], false);
        assert.deepEqual(states[2], [patient]);
        assert.match(states[1], /saved and selected/);
      } else {
        assert.deepEqual(selected, []);
        assert.equal(states[3], true, "keep patient entry open");
        assert.equal(states[4].mrn, "TEST-1", "retain entered details");
        assert.ok(states[0], "display a save error");
      }
    } finally { globalThis.fetch = original; }
  });
}
