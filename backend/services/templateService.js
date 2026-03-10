'use strict';

const { Op } = require('sequelize');

/**
 * ユーザーのテンプレート一覧を取得する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object[]>} TodoTemplate 配列
 */
async function getTemplatesByUserId(fastify, userId) {
  return fastify.models.TodoTemplate.findAll({
    where: { userId },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
  });
}

/**
 * テンプレートを 1 件取得する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} templateId - テンプレート ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>}
 */
async function getTemplateById(fastify, templateId, userId) {
  return fastify.models.TodoTemplate.findOne({
    where: { id: templateId, userId },
  });
}

/**
 * テンプレートを作成する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} data - { name, title, description?, priority?, tagIds? }
 * @returns {Promise<object|null>} 作成されたテンプレート。name または title が空なら null。
 */
async function createTemplate(fastify, userId, data) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!name || !title) return null;

  const description =
    data.description != null ? String(data.description).trim() || null : null;
  const priority =
    data.priority && ['low', 'medium', 'high'].includes(data.priority)
      ? data.priority
      : 'medium';

  const tagIds =
    Array.isArray(data.tagIds) && data.tagIds.length > 0
      ? data.tagIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      : null;

  return fastify.models.TodoTemplate.create({
    userId,
    name,
    title,
    description,
    priority,
    tagIds,
  });
}

/**
 * テンプレートを更新する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} templateId - テンプレート ID
 * @param {number} userId - ユーザー ID
 * @param {object} data - { name?, title?, description?, priority?, tagIds? }
 * @returns {Promise<object|null>} 更新後のテンプレート。存在しなければ null。
 */
async function updateTemplate(fastify, templateId, userId, data) {
  const template = await getTemplateById(fastify, templateId, userId);
  if (!template) return null;

  if (data.name !== undefined) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (name) template.name = name;
  }
  if (data.title !== undefined) {
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (title) template.title = title;
  }
  if (data.description !== undefined) {
    template.description =
      data.description === null || data.description === ''
        ? null
        : String(data.description).trim();
  }
  if (data.priority !== undefined) {
    template.priority =
      ['low', 'medium', 'high'].includes(data.priority) && data.priority
        ? data.priority
        : template.priority;
  }
  if (data.tagIds !== undefined) {
    const tagIds =
      Array.isArray(data.tagIds) && data.tagIds.length > 0
        ? data.tagIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)
        : null;
    template.tagIds = tagIds;
  }

  await template.save();
  return template;
}

/**
 * テンプレートを削除する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} templateId - テンプレート ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>} 削除した場合 true、存在しなければ false
 */
async function deleteTemplate(fastify, templateId, userId) {
  const template = await getTemplateById(fastify, templateId, userId);
  if (!template) return false;
  await template.destroy();
  return true;
}

/**
 * テンプレートから Todo を 1 件作成する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} templateId - テンプレート ID
 * @param {number} userId - ユーザー ID
 * @param {object} overrides - 上書きデータ { title?, description?, priority? }
 * @returns {Promise<object|null>} 作成された Todo。テンプレート不存在なら null。
 */
async function createTodoFromTemplate(fastify, templateId, userId, overrides = {}) {
  const template = await getTemplateById(fastify, templateId, userId);
  if (!template) return null;

  const titleSource =
    overrides.title != null && String(overrides.title).trim()
      ? String(overrides.title).trim()
      : template.title;
  if (!titleSource) return null;

  const descriptionSource =
    overrides.description !== undefined
      ? overrides.description
      : template.description;

  const prioritySource =
    overrides.priority && ['low', 'medium', 'high'].includes(overrides.priority)
      ? overrides.priority
      : template.priority || 'medium';

  const todo = await fastify.models.Todo.create({
    userId,
    title: titleSource,
    description:
      descriptionSource === null || descriptionSource === ''
        ? null
        : descriptionSource,
    priority: prioritySource,
    dueDate: null,
  });

  // テンプレートにタグがあれば紐付ける
  if (Array.isArray(template.tagIds) && template.tagIds.length > 0) {
    const validTagIds = template.tagIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    if (validTagIds.length > 0) {
      const tags = await fastify.models.Tag.findAll({
        where: { userId, id: { [Op.in]: validTagIds } },
      });
      if (tags.length > 0) {
        await todo.setTags(tags);
      }
    }
  }

  return todo;
}

module.exports = {
  getTemplatesByUserId,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createTodoFromTemplate,
};

