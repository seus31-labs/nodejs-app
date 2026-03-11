'use strict';

const todoService = require('./todoService');
const tagService = require('./tagService');
const projectService = require('./projectService');

/**
 * JSON 形式の Todo 配列をインポートする
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} data - { todos: Array<{ title, description?, completed?, priority?, dueDate?, projectId?, tagIds? }> }
 * @returns {Promise<{ created: number, failed: number }>}
 */
async function importTodosFromJSON(fastify, userId, data) {
  const list = Array.isArray(data?.todos) ? data.todos : [];
  let created = 0;
  let failed = 0;
  for (const row of list) {
    try {
      const title = typeof row.title === 'string' ? row.title.trim() : '';
      if (!title) {
        failed += 1;
        continue;
      }
      const description = row.description != null ? String(row.description).trim() || null : null;
      const priority = ['low', 'medium', 'high'].includes(row.priority) ? row.priority : 'medium';
      const dueDate = row.dueDate != null ? String(row.dueDate).trim() || null : null;
      let projectId = row.projectId != null ? Number(row.projectId) : null;
      if (projectId != null && (!Number.isInteger(projectId) || projectId <= 0)) projectId = null;
      if (projectId != null) {
        const project = await projectService.getProjectById(fastify, projectId, userId);
        if (!project) projectId = null;
      }
      const todo = await todoService.createTodo(fastify, userId, {
        title,
        description,
        priority,
        dueDate,
        projectId,
      });
      if (row.completed === true) {
        await todoService.toggleComplete(fastify, todo.id, userId);
      }
      const tagIds = Array.isArray(row.tagIds)
        ? row.tagIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
        : [];
      for (const tagId of tagIds) {
        const tag = await tagService.getTagById(fastify, tagId, userId);
        if (tag) await todoService.addTagToTodo(fastify, todo.id, tagId, userId);
      }
      created += 1;
    } catch {
      failed += 1;
    }
  }
  return { created, failed };
}

/**
 * CSV 1行をパースする（ダブルクォート囲み対応）
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * CSV 形式の Todo をインポートする（ヘッダー行をスキップ、title, description, completed, priority, dueDate 列）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {string} csvText - CSV 文字列
 * @returns {Promise<{ created: number, failed: number }>}
 */
async function importTodosFromCSV(fastify, userId, csvText) {
  const lines = String(csvText ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length < 2) return { created: 0, failed: 0 };
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const titleIdx = header.indexOf('title');
  if (titleIdx === -1) return { created: 0, failed: 0 };
  const descIdx = header.indexOf('description') !== -1 ? header.indexOf('description') : -1;
  const completedIdx = header.indexOf('completed') !== -1 ? header.indexOf('completed') : -1;
  const priorityIdx = header.indexOf('priority') !== -1 ? header.indexOf('priority') : -1;
  const dueDateIdx = header.indexOf('duedate') !== -1 ? header.indexOf('duedate') : -1;
  let created = 0;
  let failed = 0;
  for (let i = 1; i < lines.length; i++) {
    try {
      const cells = parseCsvLine(lines[i]);
      const title = (cells[titleIdx] ?? '').trim();
      if (!title) {
        failed += 1;
        continue;
      }
      const description = descIdx >= 0 && cells[descIdx] != null ? cells[descIdx].trim() || null : null;
      let priority = 'medium';
      if (priorityIdx >= 0 && cells[priorityIdx] != null && ['low', 'medium', 'high'].includes(cells[priorityIdx])) {
        priority = cells[priorityIdx];
      }
      const dueDate = dueDateIdx >= 0 && cells[dueDateIdx] != null ? cells[dueDateIdx].trim() || null : null;
      const completed = completedIdx >= 0 && cells[completedIdx] !== undefined && /^(true|1|yes)$/i.test(String(cells[completedIdx]).trim());
      const todo = await todoService.createTodo(fastify, userId, {
        title,
        description,
        priority,
        dueDate,
        projectId: null,
      });
      if (completed) await todoService.toggleComplete(fastify, todo.id, userId);
      created += 1;
    } catch {
      failed += 1;
    }
  }
  return { created, failed };
}

module.exports = {
  importTodosFromJSON,
  importTodosFromCSV,
};
