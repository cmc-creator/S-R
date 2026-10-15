import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";
import React from "react";
import { renderToString } from "react-dom/server";

// Compile the TSX in memory so this render regression needs no browser or database.
const filename = fileURLToPath(new URL("../src/components/sr/PhysicianOrderForm.tsx", import.meta.url));
const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
  },
});
const componentModule = new Module(filename);
componentModule.filename = filename;
componentModule.paths = Module._nodeModulePaths(path.dirname(filename));
componentModule._compile(outputText, filename);

test("Physician Order renders after packet creation without a FormProvider", () => {
  const html = renderToString(React.createElement(componentModule.exports.default, {
    srPacketId: "test-packet",
    onNext() {},
    onBack() {},
  }));
  assert.match(html, /Chemical Restraint/);
  assert.match(html, /Reason for Intervention/);
});
