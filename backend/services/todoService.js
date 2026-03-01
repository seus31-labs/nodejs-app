'use strict';

const { Op } = require('sequelize');

const SORT_BY_ALLOWED = ['dueDate', 'priority', 'createdAt', 'updatedAt', 'sortOrder'];
const SORT_ORDER_ALLOWED = ['asc', 'desc'];

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
 * ユーザーの Todo 一覧をフィルタ・ソート付きで取得する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} options - { completed?, priority?, sortBy?, sortOrder? }
 * @returns {Promise<object[]>} Todo 配列
 */
async function getTodosByUserId(fastify, userId, options = {}) {
  const where = { userId, archived: false };
  if (typeof options.completed === 'boolean') {
    where.completed = options.completed;
  }
  if (options.priority && ['low', 'medium', 'high'].includes(options.priority)) {
    where.priority = options.priority;
  }
  const order = buildOrder(
    fastify.sequelize,
    options.sortBy,
    options.sortOrder
  );
  return fastify.models.Todo.findAll({
    where,
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
  if (q.length > 0) {
    const escaped = q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
    const pattern = `%${escaped}%`;
    where[Op.and] = [
      { [Op.or]: [{ title: { [Op.like]: pattern } }, { description: { [Op.like]: pattern } }] },
    ];
  }
  const order = buildOrder(
    fastify.sequelize,
    params.sortBy,
    params.sortOrder
  );
  return fastify.models.Todo.findAll({
    where,
    order,
  });
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
};
