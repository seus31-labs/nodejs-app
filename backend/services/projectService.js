'use strict';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function normalizeColor(color) {
  if (color == null || color === '') return '#808080';
  const s = String(color).trim();
  return HEX_COLOR.test(s) ? s : '#808080';
}

/**
 * プロジェクトを作成する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {object} projectData - { name, description?, color? }
 * @returns {Promise<object>} 作成された Project
 */
async function createProject(fastify, userId, projectData) {
  const name = typeof projectData.name === 'string' ? projectData.name.trim() : '';
  if (!name) return null;
  const description =
    projectData.description != null ? String(projectData.description).trim() || null : null;
  const color = normalizeColor(projectData.color);
  return fastify.models.Project.create({
    userId,
    name,
    description,
    color,
  });
}

/**
 * ユーザーのプロジェクト一覧を取得する（アーカイブ含むかは includeArchived で制御）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} userId - ユーザー ID
 * @param {boolean} [includeArchived=false] - true ならアーカイブ済みも含める
 * @returns {Promise<object[]>} Project 配列
 */
async function getProjectsByUserId(fastify, userId, includeArchived = false) {
  const where = { userId };
  if (!includeArchived) where.archived = false;
  return fastify.models.Project.findAll({
    where,
    order: [['name', 'ASC']],
  });
}

/**
 * プロジェクトを 1 件取得する（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} projectId - プロジェクト ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>}
 */
async function getProjectById(fastify, projectId, userId) {
  return fastify.models.Project.findOne({
    where: { id: projectId, userId },
  });
}

/**
 * プロジェクトを更新する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} projectId - プロジェクト ID
 * @param {number} userId - ユーザー ID
 * @param {object} updateData - { name?, description?, color? }
 * @returns {Promise<object|null>} 更新後の Project、存在しなければ null
 */
async function updateProject(fastify, projectId, userId, updateData) {
  const project = await getProjectById(fastify, projectId, userId);
  if (!project) return null;
  if (updateData.name !== undefined) {
    project.name = typeof updateData.name === 'string' ? updateData.name.trim() : project.name;
  }
  if (updateData.description !== undefined) {
    project.description =
      updateData.description === null || updateData.description === ''
        ? null
        : String(updateData.description).trim();
  }
  if (updateData.color !== undefined) project.color = normalizeColor(updateData.color);
  await project.save();
  return project;
}

/**
 * プロジェクトを削除する（所有者のみ）。Todo の projectId は FK ON DELETE SET NULL で null になる。
 * @param {object} fastify - Fastify インスタンス
 * @param {number} projectId - プロジェクト ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<boolean>} 削除した場合 true、存在しなければ false
 */
async function deleteProject(fastify, projectId, userId) {
  const project = await getProjectById(fastify, projectId, userId);
  if (!project) return false;
  await project.destroy();
  return true;
}

/**
 * プロジェクトをアーカイブする（所有者のみ）
 * @param {object} fastify - Fastify インスタンス
 * @param {number} projectId - プロジェクト ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<object|null>} 更新後の Project、存在しなければ null
 */
async function archiveProject(fastify, projectId, userId) {
  const project = await getProjectById(fastify, projectId, userId);
  if (!project) return null;
  project.archived = true;
  await project.save();
  return project;
}

/**
 * プロジェクト内の Todo 進捗（総数・完了数）を取得する
 * @param {object} fastify - Fastify インスタンス
 * @param {number} projectId - プロジェクト ID
 * @param {number} userId - ユーザー ID
 * @returns {Promise<{ total: number, completed: number }>} 所有者でなければ { total: 0, completed: 0 }
 */
async function getProjectProgress(fastify, projectId, userId) {
  const project = await getProjectById(fastify, projectId, userId);
  if (!project) return { total: 0, completed: 0 };
  const todos = await fastify.models.Todo.findAll({
    where: { projectId, userId, archived: false },
    attributes: ['id', 'completed'],
  });
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  return { total, completed };
}

module.exports = {
  createProject,
  getProjectsByUserId,
  getProjectById,
  updateProject,
  deleteProject,
  archiveProject,
  getProjectProgress,
};
