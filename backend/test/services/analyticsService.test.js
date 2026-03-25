'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { Op } = require('sequelize');
const analyticsService = require('../../services/analyticsService');

function createMockFastify(overrides = {}) {
  const Todo = {
    findAll: overrides.TodoFindAll ?? (() => Promise.resolve([])),
    count: overrides.TodoCount ?? (() => Promise.resolve(0)),
  };
  const Tag = {
    findAll: overrides.TagFindAll ?? (() => Promise.resolve([])),
  };
  const Project = {
    findAll: overrides.ProjectFindAll ?? (() => Promise.resolve([])),
  };
  return {
    models: { Todo, Tag, Project, ...overrides.models },
  };
}

test('getCompletionRate: all のとき全件から率を計算', async () => {
  const fastify = createMockFastify({
    TodoFindAll: () =>
      Promise.resolve([
        { completed: true },
        { completed: false },
        { completed: true },
      ]),
  });
  const r = await analyticsService.getCompletionRate(fastify, 1, 'all');
  assert.strictEqual(r.period, 'all');
  assert.strictEqual(r.total, 3);
  assert.strictEqual(r.completed, 2);
  assert.strictEqual(r.rate, 2 / 3);
});

test('getCompletionRate: 件数0なら rate は 0', async () => {
  const fastify = createMockFastify({ TodoFindAll: () => Promise.resolve([]) });
  const r = await analyticsService.getCompletionRate(fastify, 1, 'all');
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.rate, 0);
});

test('getCompletionRate: 不正 period は all として扱う', async () => {
  const fastify = createMockFastify({
    TodoFindAll: (opts) => {
      assert.strictEqual(opts.where.archived, false);
      assert.strictEqual(opts.where.userId, 1);
      assert.strictEqual(opts.where.updatedAt, undefined);
      return Promise.resolve([{ completed: false }]);
    },
  });
  const r = await analyticsService.getCompletionRate(fastify, 1, 'invalid');
  assert.strictEqual(r.period, 'all');
});

test('getCompletionRate: week のとき updatedAt フィルタが where に付く', async () => {
  const fastify = createMockFastify({
    TodoFindAll: (opts) => {
      assert.ok(opts.where.updatedAt != null);
      assert.ok(opts.where.updatedAt[Op.gte] instanceof Date);
      return Promise.resolve([]);
    },
  });
  const r = await analyticsService.getCompletionRate(fastify, 1, 'week');
  assert.strictEqual(r.period, 'week');
});

test('getTodosByPriority: 集計を low/medium/high にマップ', async () => {
  const fastify = createMockFastify({
    TodoFindAll: () =>
      Promise.resolve([
        { priority: 'low', count: '2' },
        { priority: 'high', count: '1' },
      ]),
  });
  const r = await analyticsService.getTodosByPriority(fastify, 1);
  assert.deepStrictEqual(r, { low: 2, medium: 0, high: 1 });
});

test('getTodosByTag: タグごとの件数', async () => {
  const tagA = {
    id: 1,
    name: 'work',
    color: '#111111',
    toJSON: () => ({ Todos: [{ id: 1 }, { id: 2 }] }),
  };
  const tagB = {
    id: 2,
    name: 'home',
    color: '#222222',
    toJSON: () => ({ Todos: [] }),
  };
  const fastify = createMockFastify({
    TagFindAll: () => Promise.resolve([tagA, tagB]),
  });
  const r = await analyticsService.getTodosByTag(fastify, 1);
  assert.deepStrictEqual(r, [
    { tagId: 1, name: 'work', color: '#111111', count: 2 },
    { tagId: 2, name: 'home', color: '#222222', count: 0 },
  ]);
});

test('getTodosByProject: 未分類とプロジェクト名', async () => {
  const fastify = createMockFastify({
    TodoFindAll: () =>
      Promise.resolve([
        { projectId: null, count: '3' },
        { projectId: 10, count: '1' },
      ]),
    ProjectFindAll: () => Promise.resolve([{ id: 10, name: 'ProjA' }]),
  });
  const r = await analyticsService.getTodosByProject(fastify, 1);
  assert.strictEqual(r.length, 2);
  const unassigned = r.find((x) => x.projectId === null);
  const assigned = r.find((x) => x.projectId === 10);
  assert.deepStrictEqual(unassigned, { projectId: null, name: '未分類', count: 3 });
  assert.deepStrictEqual(assigned, { projectId: 10, name: 'ProjA', count: 1 });
});

test('getTodosByProject: プロジェクト ID があるが名称不明', async () => {
  const fastify = createMockFastify({
    TodoFindAll: () => Promise.resolve([{ projectId: 99, count: '1' }]),
    ProjectFindAll: () => Promise.resolve([]),
  });
  const r = await analyticsService.getTodosByProject(fastify, 1);
  assert.deepStrictEqual(r[0], { projectId: 99, name: '不明', count: 1 });
});

test('getWeeklyStats: 7 日分の count を返す', async () => {
  let n = 0;
  const fastify = createMockFastify({
    TodoCount: () => {
      n += 1;
      return Promise.resolve(n % 2);
    },
  });
  const r = await analyticsService.getWeeklyStats(fastify, 1);
  assert.strictEqual(r.days.length, 7);
  assert.match(r.days[0].date, /^\d{4}-\d{2}-\d{2}$/);
  assert.strictEqual(n, 14);
});

test('getWeeklyStats: 各日の created / completed が Todo.count の結果を反映', async () => {
  const fastify = createMockFastify({
    TodoCount: (opts) => {
      if (opts.where.createdAt != null) return Promise.resolve(4);
      if (opts.where.updatedAt != null && opts.where.completed === true) return Promise.resolve(2);
      assert.fail('unexpected Todo.count where shape');
    },
  });
  const r = await analyticsService.getWeeklyStats(fastify, 1);
  assert.strictEqual(r.days.length, 7);
  for (const day of r.days) {
    assert.strictEqual(day.created, 4);
    assert.strictEqual(day.completed, 2);
  }
});
