'use strict';

/**
 * Todo 共有のビジネスロジック（11.2）。
 * 共有作成・権限チェック・共有解除を担当する。
 */

const PERMISSIONS = ['view', 'edit'];

/**
 * Todo を他ユーザーと共有する。所有者のみ実行可能。
 * 既に同じユーザーへ共有済みの場合は permission を更新する。
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - 共有する Todo の ID
 * @param {number} sharedWithUserId - 共有先ユーザー ID
 * @param {string} permission - 'view' | 'edit'
 * @param {number} ownerUserId - Todo 所有者のユーザー ID
 * @returns {Promise<object|null>} 作成または更新された TodoShare。Todo が存在しない・所有者でない・自分自身への共有の場合は null
 */
async function shareTodo(fastify, todoId, sharedWithUserId, permission, ownerUserId) {
  const todo = await fastify.models.Todo.findOne({
    where: { id: todoId, userId: ownerUserId, archived: false },
  });
  if (!todo) return null;

  if (Number(sharedWithUserId) === Number(ownerUserId)) {
    throw fastify.httpErrors.badRequest('Cannot share with yourself');
  }
  if (!PERMISSIONS.includes(permission)) {
    throw fastify.httpErrors.badRequest(`Invalid permission: ${permission}`);
  }

  const [share, created] = await fastify.models.TodoShare.findOrCreate({
    where: { todoId, sharedWithUserId: Number(sharedWithUserId) },
    defaults: { permission },
  });
  if (!created) {
    share.permission = permission;
    await share.save();
  }
  return share;
}

/**
 * 指定ユーザーが Todo を閲覧可能かどうか（所有者または view/edit 共有先）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>}
 */
async function canView(fastify, todoId, userId) {
  const todo = await fastify.models.Todo.findOne({
    where: { id: todoId, archived: false },
    include: [{
      model: fastify.models.TodoShare,
      as: 'TodoShares',
      required: false,
      where: { sharedWithUserId: userId },
      attributes: ['id'],
    }],
  });
  if (!todo) return false;
  return todo.userId === userId || (todo.TodoShares && todo.TodoShares.length > 0);
}

/**
 * 指定ユーザーが Todo を編集可能かどうか（所有者または edit 共有先）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} todoId - Todo ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>}
 */
async function canEdit(fastify, todoId, userId) {
  const todo = await fastify.models.Todo.findOne({
    where: { id: todoId, archived: false },
    include: [{
      model: fastify.models.TodoShare,
      as: 'TodoShares',
      required: false,
      where: { sharedWithUserId: userId, permission: 'edit' },
      attributes: ['id'],
    }],
  });
  if (!todo) return false;
  return todo.userId === userId || (todo.TodoShares && todo.TodoShares.length > 0);
}

/**
 * 指定ユーザーに共有されている Todo 一覧を取得する（GET /api/todos/shared 用）。
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - 共有先ユーザー ID
 * @returns {Promise<object[]>} { ...todo, sharedPermission } の配列
 */
async function getTodosSharedWithUser(fastify, userId) {
  const shares = await fastify.models.TodoShare.findAll({
    where: { sharedWithUserId: userId },
    include: [
      {
        model: fastify.models.Todo,
        as: 'Todo',
        where: { archived: false },
        required: true,
        include: [
          { model: fastify.models.Tag, as: 'Tags', through: { attributes: [] }, required: false },
          { model: fastify.models.Project, as: 'Project', required: false },
        ],
      },
    ],
  });
  return shares.map((s) => ({ ...s.Todo.toJSON(), sharedPermission: s.permission }));
}

/**
 * 共有を 1 件削除する。Todo の所有者のみ実行可能。
 * @param {object} fastify - Fastify インスタンス
 * @param {number} shareId - TodoShare の ID
 * @param {number} ownerUserId - 呼び出し元ユーザー（Todo 所有者である必要あり）
 * @returns {Promise<boolean>} 削除した場合 true、共有が存在しないか所有者でない場合は false
 */
async function deleteShareById(fastify, shareId, ownerUserId) {
  const share = await fastify.models.TodoShare.findByPk(shareId, {
    include: [{ model: fastify.models.Todo, as: 'Todo', attributes: ['userId'] }],
  });
  if (!share || !share.Todo || share.Todo.userId !== ownerUserId) {
    return false;
  }
  await share.destroy();
  return true;
}

module.exports = {
  shareTodo,
  canView,
  canEdit,
  getTodosSharedWithUser,
  deleteShareById,
};
