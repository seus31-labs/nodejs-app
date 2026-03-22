'use strict';

const { Op, fn, col } = require('sequelize');

/** 完了率の期間（日数）。all はフィルタなし */
const PERIOD_DAYS = {
  week: 7,
  month: 30,
  year: 365,
};

/**
 * 期間指定の開始日時（UTC 0:00 基準）。all / 不正値は null。
 * @param {string} period
 * @returns {Date | null}
 */
function startOfPeriodUtc(period) {
  if (period == null || period === 'all') return null;
  const days = PERIOD_DAYS[period];
  if (days == null) return null;
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

/**
 * 正規化した period ラベル（API 応答用）
 * @param {string} period
 * @returns {string}
 */
function normalizePeriod(period) {
  if (period == null || period === 'all' || PERIOD_DAYS[period] == null) return 'all';
  return period;
}

/**
 * アーカイブ除外・ユーザー単位の Todo に対する完了率（期間内に更新があったものに限定）
 * @param {object} fastify
 * @param {number} userId
 * @param {string} [period='all'] - week | month | year | all
 * @returns {Promise<{ period: string, total: number, completed: number, rate: number }>}
 */
async function getCompletionRate(fastify, userId, period = 'all') {
  const where = { userId, archived: false };
  const start = startOfPeriodUtc(period);
  if (start) {
    where.updatedAt = { [Op.gte]: start };
  }
  const rows = await fastify.models.Todo.findAll({
    where,
    attributes: ['completed'],
    raw: true,
  });
  const total = rows.length;
  const completed = rows.filter((r) => r.completed).length;
  return {
    period: normalizePeriod(period),
    total,
    completed,
    rate: total === 0 ? 0 : completed / total,
  };
}

/**
 * 優先度別 Todo 件数（アーカイブ除外）
 * @param {object} fastify
 * @param {number} userId
 * @returns {Promise<{ low: number, medium: number, high: number }>}
 */
async function getTodosByPriority(fastify, userId) {
  const rows = await fastify.models.Todo.findAll({
    where: { userId, archived: false },
    attributes: ['priority', [fn('COUNT', col('id')), 'count']],
    group: ['priority'],
    raw: true,
  });
  const out = { low: 0, medium: 0, high: 0 };
  for (const r of rows) {
    const c = Number(r.count);
    if (r.priority === 'low') out.low = c;
    else if (r.priority === 'medium') out.medium = c;
    else if (r.priority === 'high') out.high = c;
  }
  return out;
}

/**
 * タグ別 Todo 件数（タグ未使用は含めない。0件のタグも列挙）
 * @param {object} fastify
 * @param {number} userId
 * @returns {Promise<Array<{ tagId: number, name: string, color: string, count: number }>>}
 */
async function getTodosByTag(fastify, userId) {
  const tags = await fastify.models.Tag.findAll({
    where: { userId },
    include: [
      {
        model: fastify.models.Todo,
        as: 'Todos',
        where: { archived: false },
        required: false,
        through: { attributes: [] },
      },
    ],
    order: [['name', 'ASC']],
  });
  return tags.map((t) => {
    const plain = t.toJSON();
    const count = Array.isArray(plain.Todos) ? plain.Todos.length : 0;
    return { tagId: t.id, name: t.name, color: t.color, count };
  });
}

/**
 * プロジェクト別 Todo 件数（プロジェクトなしは projectId: null / name: 未分類）
 * @param {object} fastify
 * @param {number} userId
 * @returns {Promise<Array<{ projectId: number | null, name: string, count: number }>>}
 */
async function getTodosByProject(fastify, userId) {
  const rows = await fastify.models.Todo.findAll({
    where: { userId, archived: false },
    attributes: ['projectId', [fn('COUNT', col('id')), 'count']],
    group: ['projectId'],
    raw: true,
  });
  const ids = rows.map((r) => r.projectId).filter((id) => id != null);
  const projects =
    ids.length === 0
      ? []
      : await fastify.models.Project.findAll({
          where: { userId, id: { [Op.in]: ids } },
          attributes: ['id', 'name'],
          raw: true,
        });
  const nameById = new Map(projects.map((p) => [p.id, p.name]));
  return rows.map((r) => {
    const pid = r.projectId;
    const count = Number(r.count);
    if (pid == null) {
      return { projectId: null, name: '未分類', count };
    }
    return {
      projectId: pid,
      name: nameById.get(pid) ?? '不明',
      count,
    };
  });
}

/**
 * 直近7日（UTC 日付）の作成数・完了数（その日に作成 / その日に更新され完了になった件数の近似）
 * @param {object} fastify
 * @param {number} userId
 * @returns {Promise<{ days: Array<{ date: string, created: number, completed: number }> }>}
 */
async function getWeeklyStats(fastify, userId) {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - i);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    const dateStr = start.toISOString().slice(0, 10);
    const [created, completed] = await Promise.all([
      fastify.models.Todo.count({
        where: {
          userId,
          archived: false,
          createdAt: { [Op.gte]: start, [Op.lt]: end },
        },
      }),
      fastify.models.Todo.count({
        where: {
          userId,
          archived: false,
          completed: true,
          updatedAt: { [Op.gte]: start, [Op.lt]: end },
        },
      }),
    ]);
    days.push({ date: dateStr, created, completed });
  }
  return { days };
}

module.exports = {
  getCompletionRate,
  getTodosByPriority,
  getTodosByTag,
  getTodosByProject,
  getWeeklyStats,
};
