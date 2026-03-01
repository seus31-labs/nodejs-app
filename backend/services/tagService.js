'use strict';

const { Op } = require('sequelize');

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function normalizeColor(color) {
  if (color == null || color === '') return '#808080';
  const s = String(color).trim();
  return HEX_COLOR.test(s) ? s : '#808080';
}

/**
 * タグを作成する（同一ユーザー内で name 重複時は null、呼び出し側で 409 用）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} data - { name, color? }
 * @returns {Promise<object|null>} 作成された Tag、重複時は null
 */
async function createTag(fastify, userId, data) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) return null;
  const color = normalizeColor(data.color);
  const existing = await fastify.models.Tag.findOne({
    where: { userId, name },
  });
  if (existing) return null;
  return fastify.models.Tag.create({ userId, name, color });
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
 * タグを更新する（同一ユーザー内で name 重複時は null）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} tagId - タグ ID
 * @param {number} userId - ユーザー ID
 * @param {object} data - { name?, color? }
 * @returns {Promise<object|null>} 更新後の Tag、未存在または重複時は null
 */
async function updateTag(fastify, tagId, userId, data) {
  const tag = await getTagById(fastify, tagId, userId);
  if (!tag) return null;
  const name = data.name != null ? String(data.name).trim() : null;
  if (name !== null) {
    const existing = await fastify.models.Tag.findOne({
      where: { userId, name, id: { [Op.ne]: tagId } },
    });
    if (existing) return null;
    tag.name = name;
  }
  if (data.color !== undefined) tag.color = normalizeColor(data.color);
  await tag.save();
  return tag;
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
