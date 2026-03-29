'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeOptionalProjectId } = require('../../utils/projectId');

test('normalizeOptionalProjectId: null/undefined → null', () => {
  assert.equal(normalizeOptionalProjectId(null), null);
  assert.equal(normalizeOptionalProjectId(undefined), null);
});

test('normalizeOptionalProjectId: 0 や負数 → null', () => {
  assert.equal(normalizeOptionalProjectId(0), null);
  assert.equal(normalizeOptionalProjectId(-1), null);
});

test('normalizeOptionalProjectId: 正の整数はそのまま', () => {
  assert.equal(normalizeOptionalProjectId(1), 1);
  assert.equal(normalizeOptionalProjectId(42), 42);
});

test('normalizeOptionalProjectId: 数値文字列は整数なら採用', () => {
  assert.equal(normalizeOptionalProjectId('5'), 5);
});

test('normalizeOptionalProjectId: 非整数は null', () => {
  assert.equal(normalizeOptionalProjectId(1.5), null);
  assert.equal(normalizeOptionalProjectId('x'), null);
});
