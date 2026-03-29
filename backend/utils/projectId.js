'use strict';

/**
 * projectId が 0 や不正な数値のとき MySQL の FK（project_id → projects.id）で ER_NO_REFERENCED_ROW になるのを防ぐ。
 * フォームの select や Number('') が 0 になる経路でも DB には NULL を渡す。
 * @param {unknown} value
 * @returns {number|null}
 */
function normalizeOptionalProjectId(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

module.exports = { normalizeOptionalProjectId };
