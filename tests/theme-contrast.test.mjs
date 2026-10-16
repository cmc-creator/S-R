import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const css = fs.readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function rgb(value) {
  if (value.startsWith("#")) return value.slice(1).match(/../g).map((v) => parseInt(v, 16));
  return value.match(/[\d.]+/g).map(Number);
}
function composite(foreground, background) {
  const [r, g, b, alpha = 1] = rgb(foreground);
  return [r, g, b].map((v, i) => v * alpha + background[i] * (1 - alpha));
}
function luminance(color) {
  return color.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

for (const selector of [":root", ".dark"]) {
  const block = css.slice(css.indexOf(`${selector} {`)).split("}")[0];
  const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
  for (const surface of ["bg", "bg-elevated", "bg-subtle", "bg-hover"]) {
    const background = rgb(tokens[surface]);
    for (const text of ["text", "text-2", "text-3", "gold", "danger", "success", "success-hover", "warning", "orange", "purple"]) {
      test(`${selector}: ${text} on ${surface} has readable contrast`, () => {
        const ratio = contrast(rgb(tokens[text]), background);
        assert.ok(ratio >= 4.5, `${ratio.toFixed(2)}:1 is below 4.5:1`);
      });
    }
    for (const status of ["success", "warning", "orange", "purple"]) {
      test(`${selector}: ${status} badge on ${surface} has readable contrast`, () => {
        const ratio = contrast(rgb(tokens[status]), composite(tokens[`${status}-bg`], background));
        assert.ok(ratio >= 4.5, `${ratio.toFixed(2)}:1 is below 4.5:1`);
      });
    }
    test(`${selector}: control border on ${surface} remains distinguishable`, () => {
      assert.ok(contrast(rgb(tokens["control-border"]), background) >= 3);
    });
  }
  for (const surface of ["accent", "accent-hover"]) {
    test(`${selector}: action text on ${surface} has readable contrast`, () => {
      assert.ok(contrast(rgb(tokens["accent-fg"]), rgb(tokens[surface])) >= 4.5);
    });
  }
  for (const surface of ["success-action", "success-action-hover"]) {
    test(`${selector}: submission text on ${surface} has readable contrast`, () => {
      assert.ok(contrast(rgb(tokens["success-action-fg"]), rgb(tokens[surface])) >= 4.5);
    });
  }
  test(`${selector}: gold link on tinted info background has readable contrast`, () => {
    const background = composite(tokens["gold-faint"], rgb(tokens["bg-elevated"]));
    assert.ok(contrast(rgb(tokens.gold), background) >= 4.5);
  });
}
