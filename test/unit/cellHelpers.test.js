const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cellId, formatLabel } = require('../../cellHelpers');

test('cellId reads flat metadata.id', () => {
  assert.equal(cellId({ metadata: { id: 'abc123' } }), 'abc123');
});

test('cellId falls back to metadata.custom.id', () => {
  assert.equal(cellId({ metadata: { custom: { id: 'abc123' } } }), 'abc123');
});

test('cellId returns undefined when no id is present', () => {
  assert.equal(cellId({ metadata: {} }), undefined);
  assert.equal(cellId({}), undefined);
});

test('formatLabel supports "index"', () => {
  assert.equal(formatLabel(5, 'abc123', 'index'), '#5');
});

test('formatLabel supports "id"', () => {
  assert.equal(formatLabel(5, 'abc123', 'id'), 'abc123');
});

test('formatLabel defaults to "index-and-id"', () => {
  assert.equal(formatLabel(5, 'abc123', 'index-and-id'), '#5 abc123');
});
