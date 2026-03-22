'use strict';

const shareService = require('./shareService');

const MAX_CONTENT = 8000;

/**
 * API 応答用: 作成者名と「表示中ユーザーが作成者か」を付与
 * @param {import('sequelize').Model} row
 * @param {number} viewerId
 */
function toApiShape(row, viewerId) {
  const j = row.toJSON();
  const authorName = j.Author?.name ?? '';
  const uid = j.userId;
  delete j.Author;
  return { ...j, authorName, isMine: uid === viewerId };
}

/**
 * @param {object} fastify
 * @param {number} commentId
 */
async function findCommentForUser(fastify, commentId) {
  return fastify.models.Comment.findByPk(commentId, {
    include: [
      { model: fastify.models.User, as: 'Author', attributes: ['id', 'name'] },
      { model: fastify.models.Todo, attributes: ['id'] },
    ],
  });
}

/**
 * 閲覧可能な Todo のコメント一覧（古い順）
 * @returns {Promise<object[]|null>} 権限なしは null
 */
async function getCommentsByTodoId(fastify, todoId, userId) {
  const can = await shareService.canView(fastify, todoId, userId);
  if (!can) return null;
  const rows = await fastify.models.Comment.findAll({
    where: { todoId },
    include: [{ model: fastify.models.User, as: 'Author', attributes: ['id', 'name'] }],
    order: [['createdAt', 'ASC']],
  });
  return rows.map((r) => toApiShape(r, userId));
}

/**
 * 編集権限のあるユーザーがコメント投稿
 * @returns {Promise<object|null>} 権限なしは null、本文不正は { invalid: true }
 */
async function createComment(fastify, todoId, userId, content) {
  const can = await shareService.canEdit(fastify, todoId, userId);
  if (!can) return null;
  const text = String(content ?? '').trim();
  if (!text) return { invalid: true, message: 'Content is required' };
  if (text.length > MAX_CONTENT) return { invalid: true, message: 'Content too long' };
  const row = await fastify.models.Comment.create({ todoId, userId, content: text });
  const full = await fastify.models.Comment.findByPk(row.id, {
    include: [{ model: fastify.models.User, as: 'Author', attributes: ['id', 'name'] }],
  });
  return toApiShape(full, userId);
}

/**
 * 作成者のみ、かつ Todo 編集権限あり
 * @returns {Promise<object|null|false>} null=不在、false=権限なし、object=更新後
 */
async function updateComment(fastify, commentId, userId, content) {
  const row = await findCommentForUser(fastify, commentId);
  if (!row) return null;
  if (row.userId !== userId) return false;
  const can = await shareService.canEdit(fastify, row.todoId, userId);
  if (!can) return false;
  const text = String(content ?? '').trim();
  if (!text) return { invalid: true, message: 'Content is required' };
  if (text.length > MAX_CONTENT) return { invalid: true, message: 'Content too long' };
  row.content = text;
  await row.save();
  const reloaded = await findCommentForUser(fastify, commentId);
  return toApiShape(reloaded, userId);
}

/**
 * 作成者のみ削除
 * @returns {Promise<boolean|null>} true 削除、false 権限なし、null 不在
 */
async function deleteComment(fastify, commentId, userId) {
  const row = await findCommentForUser(fastify, commentId);
  if (!row) return null;
  if (row.userId !== userId) return false;
  const can = await shareService.canEdit(fastify, row.todoId, userId);
  if (!can) return false;
  await row.destroy();
  return true;
}

module.exports = {
  getCommentsByTodoId,
  createComment,
  updateComment,
  deleteComment,
  MAX_CONTENT,
};
