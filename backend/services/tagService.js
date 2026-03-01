'use strict';

const { Op } = require('sequelize');
const { UniqueConstraintError } = require('sequelize');

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function normalizeColor(color) {
  if (color == null || color === '') return '#808080';
  const s = String(color).trim();
  return HEX_COLOR.test(s) ? s : '#808080';
}

/**
 * タグを作成する（findOrCreate で race condition を避け、重複時は null → コントローラで 409）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} data - { name, color? }
 * @returns {Promise<object|null>} 新規作成された Tag のみ返す。既存同名なら null
 */
async function createTag(fastify, userId, data) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) return null;
  const color = normalizeColor(data.color);
  const [tag, created] = await fastify.models.Tag.findOrCreate({
    where: { userId, name },
    defaults: { userId, name, color },
  });
  return created ? tag : null;
}

/**
 * ユーザーのタグ一覧を取得する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object[]>} Tag 配列
 */
async function getTagsByUserId(fastify, userId) {
  return fastify.models.Tag.findAll({
    where: { userId },
    order: [['name', 'ASC']],
  });
}

/**
 * タグを 1 件取得する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} tagId - タグ ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>}
 */
async function getTagById(fastify, tagId, userId) {
  return fastify.models.Tag.findOne({
    where: { id: tagId, userId },
  });
}

/**
 * タグを更新する。UNIQUE 違反時は 409 用に duplicate を返す。
 * @param {object} fastify - Fastify インスタンス
 * @param {number} tagId - タグ ID
 * @param {number} userId - ユーザー ID
 * @param {object} data - { name?, color? }
 * @returns {Promise<{ updated: object|null, duplicate: boolean }>}
 */
async function updateTag(fastify, tagId, userId, data) {
  const tag = await getTagById(fastify, tagId, userId);
  if (!tag) return { updated: null, duplicate: false };
  const name = data.name != null ? String(data.name).trim() : null;
  if (name !== null) {
    const existing = await fastify.models.Tag.findOne({
      where: { userId, name, id: { [Op.ne]: tagId } },
    });
    if (existing) return { updated: null, duplicate: true };
    tag.name = name;
  }
  if (data.color !== undefined) tag.color = normalizeColor(data.color);
  try {
    await tag.save();
    return { updated: tag, duplicate: false };
  } catch (err) {
    if (err instanceof UniqueConstraintError) return { updated: null, duplicate: true };
    throw err;
  }
}

/**
 * タグを削除する（使用中でも削除可、todo_tags は CASCADE で削除）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} tagId - タグ ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>} 削除した場合 true、存在しなければ false
 */
async function deleteTag(fastify, tagId, userId) {
  const tag = await getTagById(fastify, tagId, userId);
  if (!tag) return false;
  await tag.destroy();
  return true;
}

module.exports = {
  createTag,
  getTagsByUserId,
  getTagById,
  updateTag,
  deleteTag,
};
