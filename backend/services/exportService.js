'use strict';

/**
 * エクスポート用にユーザー全 Todo を取得（アーカイブ含む、Tags・Project 付き）
 */
function buildExportInclude(fastify) {
  return [
    { model: fastify.models.Tag, as: 'Tags', through: { attributes: [] }, required: false },
    { model: fastify.models.Project, as: 'Project', required: false },
  ];
}

/**
 * 指定ユーザーの全 Todo をエクスポート用形式で取得する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object[]>} エクスポート用 Todo 配列（tagIds, projectId 含む）
 */
async function getTodosForExport(fastify, userId) {
  const todos = await fastify.models.Todo.findAll({
    where: { userId },
    include: buildExportInclude(fastify),
    order: [['createdAt', 'ASC']],
  });
  return todos.map((t) => {
    const plain = t.toJSON();
    plain.tagIds = (t.Tags || []).map((tag) => tag.id);
    delete plain.Tags;
    if (plain.Project) {
      plain.projectId = plain.Project?.id ?? null;
      delete plain.Project;
    }
    return plain;
  });
}

/**
 * 指定ユーザーの Todo を JSON 形式でエクスポートする
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object>} { todos: object[] }
 */
async function exportTodosAsJSON(fastify, userId) {
  const todos = await getTodosForExport(fastify, userId);
  return { todos };
}

/**
 * 指定ユーザーの Todo を CSV 形式でエクスポートする（1行ヘッダー + データ行）
 * カラム: title, description, completed, priority, dueDate, tagIds, projectId
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @returns {Promise<string>} CSV 文字列
 */
function escapeCsvCell(value) {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function exportTodosAsCSV(fastify, userId) {
  const todos = await getTodosForExport(fastify, userId);
  const header = ['title', 'description', 'completed', 'priority', 'dueDate', 'tagIds', 'projectId'];
  const rows = [header.join(',')];
  for (const t of todos) {
    rows.push(
      [
        escapeCsvCell(t.title),
        escapeCsvCell(t.description),
        escapeCsvCell(t.completed),
        escapeCsvCell(t.priority),
        escapeCsvCell(t.dueDate),
        escapeCsvCell(Array.isArray(t.tagIds) ? t.tagIds.join(';') : ''),
        escapeCsvCell(t.projectId),
      ].join(',')
    );
  }
  return rows.join('\n');
}

module.exports = {
  getTodosForExport,
  exportTodosAsJSON,
  exportTodosAsCSV,
};
