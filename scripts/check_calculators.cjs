const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../assets/js/estimates.js');
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
test('plate weight uses mm³ and g/cm³ correctly, including quantity', () => {
  const result = calculate('sheet', { length:100, width:100, thickness:1, density:7.85, quantity:10 });
  close(result.perPiece, .0785); close(result.total, .785);
});
test('solid round-bar volume is circular rather than square', () => {
  close(calculate('round', { diameter:20, length:1000, density:7.85, quantity:1 }).perPiece, Math.PI * .785);
});
test('pipe weight subtracts the bore and validates wall geometry', () => {
  const result = calculate('pipe', { outside_diameter:50, wall_thickness:3, length:1000, density:7.85, quantity:2 });
  close(result.insideDiameter, 44); close(result.total, Math.PI * (2500 - 1936) / 4 * 1000 * 7.85 / 1e6 * 2);
  assert.throws(() => calculate('pipe', { outside_diameter:50, wall_thickness:25, length:1000, density:7.85, quantity:1 }), /Wall thickness/);
});
test('bend allowance uses angle in radians and the selected K-factor', () => {
  close(calculate('bend', { thickness:2, inside_radius:2, angle:90, k_factor:.33 }).allowance, Math.PI / 2 * 2.66);
});
test('nesting compares both uniform orientations and allows zero fitting parts', () => {
  assert.equal(calculate('nest', { sheet_length:300, sheet_width:200, part_length:200, part_width:100, gap:0 }).count, 3);
  assert.equal(calculate('nest', { sheet_length:10, sheet_width:10, part_length:200, part_width:100, gap:3 }).count, 0);
});
test('printing mass applies density, quantity, fill and allowance once', () => {
  close(calculate('print', { volume:100, density:1.24, infill:50, allowance:10, quantity:2 }).mass, 136.4);
});
test('unit conversions include negative temperatures', () => {
  close(calculate('convert', { conversion:'mm-in', value:25.4 }).converted, 1);
  close(calculate('convert', { conversion:'c-f', value:-40 }).converted, -40);
  close(calculate('convert', { conversion:'f-c', value:32 }).converted, 0);
});
test('invalid dimensions, fractions of a part and nonfinite values are rejected', () => {
  const valid = { length:100, width:100, thickness:1, density:7.85, quantity:1 };
  for (const patch of [{length:-1},{length:0},{width:''},{thickness:NaN},{density:Infinity},{quantity:1.5}]) assert.throws(() => calculate('sheet', {...valid,...patch}));
  assert.throws(() => calculate('bend', { thickness:2, inside_radius:2, angle:180, k_factor:.33 }));
  assert.throws(() => calculate('convert', { conversion:'mm-in', value:-1 }));
});
