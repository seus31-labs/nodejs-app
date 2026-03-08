'use strict';

const { Op } = require('sequelize');
const tagService = require('./tagService');
const projectService = require('./projectService');

const SORT_BY_ALLOWED = ['dueDate', 'priority', 'createdAt', 'updatedAt', 'sortOrder'];
const SORT_ORDER_ALLOWED = ['asc', 'desc'];

/** Todo 取得時の共通 include（Tags + Project） */
function buildTodoInclude(fastify) {
  return [
    { model: fastify.models.Tag, as: 'Tags', through: { attributes: [] }, required: false },
    { model: fastify.models.Project, as: 'Project', required: false },
  ];
}

function buildOrder(sequelize, sortBy, sortOrder) {
  const dir = SORT_ORDER_ALLOWED.includes(sortOrder) ? sortOrder : 'asc';
  if (sortBy === 'priority') {
    return [[sequelize.literal("FIELD(priority, 'high', 'medium', 'low')"), dir]];
  }
  if (SORT_BY_ALLOWED.includes(sortBy)) {
    return [[sortBy, dir]];
  }
  return [['createdAt', dir]];
}

/**
 * 指定ユーザーの Todo を作成する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} todoData - { title, description?, priority?, dueDate? }
 * @returns {Promise<object>} 作成された Todo
 */
async function createTodo(fastify, userId, todoData) {
  const { title, description, priority, dueDate } = todoData;
  return fastify.models.Todo.create({
    userId,
    title,
    description: description ?? null,
    priority: priority ?? 'medium',
    dueDate: dueDate ?? null,
  });
}

/**
 * ユーザーの Todo 一覧をフィルタ・ソート付きで取得する（タグ・プロジェクト付き）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} options - { completed?, priority?, sortBy?, sortOrder?, tagIds?, projectId? }
 * @returns {Promise<object[]>} Todo 配列（Tags, Project を含む）
 */
async function getTodosByUserId(fastify, userId, options = {}) {
  const where = { userId, archived: false };
  if (typeof options.completed === 'boolean') {
    where.completed = options.completed;
  }
  if (options.priority && ['low', 'medium', 'high'].includes(options.priority)) {
    where.priority = options.priority;
  }
  const projectId = options.projectId != null ? Number(options.projectId) : null;
  if (Number.isInteger(projectId) && projectId > 0) {
    where.projectId = projectId;
  }
  const order = buildOrder(
    fastify.sequelize,
    options.sortBy,
    options.sortOrder
  );
  const tagIds = Array.isArray(options.tagIds)
    ? options.tagIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    : [];
  const include = buildTodoInclude(fastify);
  let todos = await fastify.models.Todo.findAll({
    where,
    include,
    order,
  });
  if (tagIds.length > 0) {
    todos = todos.filter((t) => {
      const todoTagIds = (t.Tags || []).map((tag) => tag.id);
      return tagIds.every((id) => todoTagIds.includes(id));
    });
  }
  return todos;
}

/**
 * 指定プロジェクトに属する Todo 一覧を取得する（所有者のプロジェクトのみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} projectId - プロジェクト ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object[]>} Todo 配列（Tags, Project を含む）。プロジェクトが存在しないか他ユーザーなら []
 */
async function getTodosByProjectId(fastify, projectId, userId) {
  const project = await projectService.getProjectById(fastify, projectId, userId);
  if (!project) return [];
  const order = buildOrder(fastify.sequelize, null, null);
  return fastify.models.Todo.findAll({
    where: { projectId, userId, archived: false },
    include: buildTodoInclude(fastify),
    order,
  });
}

/**
 * 未アーカイブの Todo を ID とユーザーで 1 件取得する（他ユーザー・アーカイブ済みは null）
 * 通常の GET/PUT/DELETE/toggle は未アーカイブのみ操作可能とする。
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>}
 */
async function getTodoById(fastify, todoId, userId) {
  return fastify.models.Todo.findOne({
    where: { id: todoId, userId, archived: false },
    include: buildTodoInclude(fastify),
  });
}

/**
 * アーカイブ有無を問わず Todo を 1 件取得する（archive/unarchive 専用）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>}
 */
async function getTodoByIdIncludingArchived(fastify, todoId, userId) {
  return fastify.models.Todo.findOne({
    where: { id: todoId, userId },
  });
}

/**
 * Todo を更新する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @param {object} updateData - 更新フィールド
 * @returns {Promise<object|null>} 更新後の Todo、存在しなければ null
 */
async function updateTodo(fastify, todoId, userId, updateData) {
  const todo = await getTodoById(fastify, todoId, userId);
  if (!todo) return null;
  const { title, description, priority, dueDate } = updateData;
  const allowed = { title, description, priority, dueDate };
  Object.keys(allowed).forEach((k) => {
    if (allowed[k] !== undefined) todo.set(k, allowed[k]);
  });
  await todo.save();
  return todo;
}

/**
 * Todo を削除する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>} 削除した場合 true、存在しなければ false
 */
async function deleteTodo(fastify, todoId, userId) {
  const todo = await getTodoById(fastify, todoId, userId);
  if (!todo) return false;
  await todo.destroy();
  return true;
}

/**
 * 完了/未完了をトグルする（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>} 更新後の Todo、存在しなければ null
 */
async function toggleComplete(fastify, todoId, userId) {
  const todo = await getTodoById(fastify, todoId, userId);
  if (!todo) return null;
  todo.completed = !todo.completed;
  await todo.save();
  return todo;
}

/**
 * タイトル・説明文で検索（キーワード + 優先度・完了のフィルタ + ソート）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} params - { query, priority?, completed?, sortBy?, sortOrder? }
 * @returns {Promise<object[]>} Todo 配列
 */
async function searchTodos(fastify, userId, params = {}) {
  const where = { userId, archived: false };
  if (typeof params.completed === 'boolean') {
    where.completed = params.completed;
  }
  if (params.priority && ['low', 'medium', 'high'].includes(params.priority)) {
    where.priority = params.priority;
  }
  const q = typeof params.query === 'string' ? params.query.trim() : '';

  const order = buildOrder(
    fastify.sequelize,
    params.sortBy,
    params.sortOrder
  );
  const tagIds = Array.isArray(params.tagIds)
    ? params.tagIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    : [];
  const include = buildTodoInclude(fastify);

  let todoIds = [];
  if (q.length > 0) {
    const escaped = q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
    const pattern = `%${escaped}%`;
    // タイトル・説明での検索
    const whereText = { ...where, [Op.and]: [{ [Op.or]: [{ title: { [Op.like]: pattern } }, { description: { [Op.like]: pattern } }] }] };
    const byText = await fastify.models.Todo.findAll({
      where: whereText,
      attributes: ['id'],
    });
    todoIds = byText.map((t) => t.id);
    // タグ名での検索（Tag モデル JOIN）
    const includeTagName = [{ model: fastify.models.Tag, as: 'Tags', where: { userId, name: { [Op.like]: pattern } }, required: true, through: { attributes: [] } }];
    const byTagName = await fastify.models.Todo.findAll({
      where,
      include: includeTagName,
      attributes: ['id'],
    });
    const tagNameIds = byTagName.map((t) => t.id);
    todoIds = [...new Set([...todoIds, ...tagNameIds])];
    if (todoIds.length === 0) {
      return [];
    }
    where.id = { [Op.in]: todoIds };
  }

  let todos = await fastify.models.Todo.findAll({
    where,
    include,
    order,
  });
  if (tagIds.length > 0) {
    todos = todos.filter((t) => {
      const todoTagIds = (t.Tags || []).map((tag) => tag.id);
      return tagIds.every((id) => todoTagIds.includes(id));
    });
  }
  return todos;
}

/**
 * Todo にタグを付与する（所有者の Todo と Tag のみ、冪等）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} tagId - タグ ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>} 付与した場合 true、既に付与済みまたは存在しなければ false
 */
async function addTagToTodo(fastify, todoId, tagId, userId) {
  const todo = await getTodoById(fastify, todoId, userId);
  if (!todo) return false;
  const tag = await tagService.getTagById(fastify, tagId, userId);
  if (!tag) return false;
  const [todoTag] = await fastify.models.TodoTag.findOrCreate({
    where: { todoId, tagId },
    defaults: { todoId, tagId },
  });
  return !!todoTag;
}

/**
 * Todo からタグを外す（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} tagId - タグ ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>} 削除した場合 true、存在しなければ false
 */
async function removeTagFromTodo(fastify, todoId, tagId, userId) {
  const todo = await getTodoById(fastify, todoId, userId);
  if (!todo) return false;
  const tag = await tagService.getTagById(fastify, tagId, userId);
  if (!tag) return false;
  const result = await fastify.models.TodoTag.destroy({
    where: { todoId, tagId },
  });
  return result > 0;
}

/**
 * 並び順を一括更新する（カスタムソート用）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {number[]} todoIds - 新しい順序の Todo ID 配列
 * @returns {Promise<void>}
 */
async function reorderTodos(fastify, userId, todoIds) {
  if (!Array.isArray(todoIds) || todoIds.length === 0) return;
  const safeIds = todoIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
  if (safeIds.length === 0) return;
  const transaction = await fastify.sequelize.transaction();
  try {
    const sequelize = fastify.sequelize;
    const caseWhen = safeIds.map((_, i) => `WHEN id = :id${i} THEN ${i}`).join(' ');
    const inList = safeIds.map((_, i) => `:id${i}`).join(', ');
    const replacements = { userId };
    safeIds.forEach((id, i) => {
      replacements[`id${i}`] = id;
    });
    await sequelize.query(
      `UPDATE todos SET sort_order = CASE ${caseWhen} END, updated_at = NOW() WHERE user_id = :userId AND id IN (${inList})`,
      { replacements, transaction }
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/**
 * Todo をアーカイブする（所有者のみ。完了済みでなくても API 上はアーカイブ可能）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>} 更新後の Todo、存在しなければ null
 */
async function archiveTodo(fastify, todoId, userId) {
  const todo = await getTodoByIdIncludingArchived(fastify, todoId, userId);
  if (!todo) return null;
  if (todo.archived) return todo;
  todo.archived = true;
  todo.archivedAt = new Date();
  await todo.save();
  return todo;
}

/**
 * Todo のアーカイブを解除する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>} 更新後の Todo、存在しなければ null
 */
async function unarchiveTodo(fastify, todoId, userId) {
  const todo = await getTodoByIdIncludingArchived(fastify, todoId, userId);
  if (!todo) return null;
  todo.archived = false;
  todo.archivedAt = null;
  await todo.save();
  return todo;
}

/**
 * アーカイブ済み Todo 一覧を取得する（作成日降順）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object[]>} Todo 配列
 */
async function getArchivedTodos(fastify, userId) {
  return fastify.models.Todo.findAll({
    where: { userId, archived: true },
    include: buildTodoInclude(fastify),
    order: [['archivedAt', 'DESC']],
  });
}

/**
 * アーカイブ済み Todo を一括削除する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @returns {Promise<number>} 削除件数
 */
async function deleteArchivedTodos(fastify, userId) {
  const result = await fastify.models.Todo.destroy({
    where: { userId, archived: true },
  });
  return result;
}

/**
 * 指定 ID の Todo を一括で完了にする（所有者のもののみ更新）
 * @param {object} fastify - Fastify インスタンス
 * @param {number[]} todoIds - Todo ID 配列
 * @param {number} userId - ユーザー ID
 * @returns {Promise<number>} 更新件数
 */
async function bulkComplete(fastify, todoIds, userId) {
  if (!Array.isArray(todoIds) || todoIds.length === 0) return 0;
  const safeIds = todoIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
  if (safeIds.length === 0) return 0;
  const [count] = await fastify.models.Todo.update(
    { completed: true },
    { where: { id: { [Op.in]: safeIds }, userId, archived: false } }
  );
  return count;
}

/**
 * 指定 ID の Todo を一括削除する（所有者のもののみ削除）
 * @param {object} fastify - Fastify インスタンス
 * @param {number[]} todoIds - Todo ID 配列
 * @param {number} userId - ユーザー ID
 * @returns {Promise<number>} 削除件数
 */
async function bulkDelete(fastify, todoIds, userId) {
  if (!Array.isArray(todoIds) || todoIds.length === 0) return 0;
  const safeIds = todoIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
  if (safeIds.length === 0) return 0;
  return fastify.models.Todo.destroy({
    where: { id: { [Op.in]: safeIds }, userId, archived: false },
  });
}

/**
 * 指定 ID の Todo を一括アーカイブする（所有者の未アーカイブのみ更新）
 * @param {object} fastify - Fastify インスタンス
 * @param {number[]} todoIds - Todo ID 配列
 * @param {number} userId - ユーザー ID
 * @returns {Promise<number>} 更新件数
 */
async function bulkArchive(fastify, todoIds, userId) {
  if (!Array.isArray(todoIds) || todoIds.length === 0) return 0;
  const safeIds = todoIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
  if (safeIds.length === 0) return 0;
  const now = new Date();
  const [count] = await fastify.models.Todo.update(
    { archived: true, archivedAt: now },
    { where: { id: { [Op.in]: safeIds }, userId, archived: false } }
  );
  return count;
}

module.exports = {
  createTodo,
  getTodosByUserId,
  getTodosByProjectId,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleComplete,
  searchTodos,
  reorderTodos,
  archiveTodo,
  unarchiveTodo,
  getArchivedTodos,
  deleteArchivedTodos,
  bulkComplete,
  bulkDelete,
  bulkArchive,
  addTagToTodo,
  removeTagFromTodo,
};
