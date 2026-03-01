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
  const where = { userId };
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
 * ID とユーザーで Todo を 1 件取得する（他ユーザーの場合は null）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>}
 */
async function getTodoById(fastify, todoId, userId) {
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
  const where = { userId };
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

module.exports = {
  createTodo,
  getTodosByUserId,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleComplete,
  searchTodos,
  reorderTodos,
};
