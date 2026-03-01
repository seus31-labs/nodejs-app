'use strict';

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
 * ユーザーの Todo 一覧をフィルタ付きで取得する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} filters - { completed?: boolean, priority?: string }
 * @returns {Promise<object[]>} Todo 配列
 */
async function getTodosByUserId(fastify, userId, filters = {}) {
  const where = { userId };
  if (typeof filters.completed === 'boolean') {
    where.completed = filters.completed;
  }
  if (filters.priority && ['low', 'medium', 'high'].includes(filters.priority)) {
    where.priority = filters.priority;
  }
  return fastify.models.Todo.findAll({
    where,
    order: [['createdAt', 'ASC']],
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

module.exports = {
  createTodo,
  getTodosByUserId,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleComplete,
};
