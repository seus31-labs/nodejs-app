'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const shareService = require('../../services/shareService');

function createMockFastify(overrides = {}) {
  const Todo = {
    findOne: overrides.TodoFindOne ?? (() => Promise.resolve(null)),
  };
  const TodoShare = {
    findOrCreate: overrides.TodoShareFindOrCreate ?? (() => Promise.resolve([null, false])),
    findOne: overrides.TodoShareFindOne ?? (() => Promise.resolve(null)),
    findByPk: overrides.TodoShareFindByPk ?? (() => Promise.resolve(null)),
    findAll: overrides.TodoShareFindAll ?? (() => Promise.resolve([])),
  };
  const badRequest = (msg) => {
    const err = new Error(msg);
    err.statusCode = 400;
    return err;
  };
  return {
    models: { Todo, TodoShare, ...overrides.models },
    httpErrors: { badRequest: overrides.httpErrorsBadRequest ?? badRequest },
    ...overrides.fastify,
  };
}

test('shareTodo: 新規共有が成功する', async () => {
  const ownerId = 1;
  const todoId = 10;
  const sharedWithId = 2;
  const createdShare = { id: 1, todoId, sharedWithUserId: sharedWithId, permission: 'edit' };
  const fastify = createMockFastify({
    TodoFindOne: () => Promise.resolve({ id: todoId, userId: ownerId }),
    TodoShareFindOrCreate: () => Promise.resolve([createdShare, true]),
  });
  const result = await shareService.shareTodo(fastify, todoId, sharedWithId, 'edit', ownerId);
  assert.strictEqual(result, createdShare);
  assert.strictEqual(result.permission, 'edit');
});

test('shareTodo: 既存共有の場合は permission を更新する', async () => {
  const ownerId = 1;
  const todoId = 10;
  const sharedWithId = 2;
  const existingShare = { id: 1, todoId, sharedWithUserId: sharedWithId, permission: 'view', save: () => Promise.resolve() };
  const fastify = createMockFastify({
    TodoFindOne: () => Promise.resolve({ id: todoId, userId: ownerId }),
    TodoShareFindOrCreate: () => Promise.resolve([existingShare, false]),
  });
  const result = await shareService.shareTodo(fastify, todoId, sharedWithId, 'edit', ownerId);
  assert.strictEqual(result, existingShare);
  assert.strictEqual(result.permission, 'edit');
});

test('shareTodo: 他人の Todo に共有しようとした場合は null', async () => {
  const fastify = createMockFastify({ TodoFindOne: () => Promise.resolve(null) });
  const result = await shareService.shareTodo(fastify, 999, 2, 'view', 1);
  assert.strictEqual(result, null);
});

test('shareTodo: 自分自身への共有は badRequest をスロー', async () => {
  const ownerId = 1;
  const fastify = createMockFastify({
    TodoFindOne: () => Promise.resolve({ id: 10, userId: ownerId }),
    httpErrorsBadRequest: (msg) => {
      const err = new Error(msg);
      err.statusCode = 400;
      return err;
    },
  });
  await assert.rejects(
    () => shareService.shareTodo(fastify, 10, ownerId, 'view', ownerId),
    (err) => err.statusCode === 400 && /Cannot share with yourself/.test(err.message)
  );
});

test('shareTodo: 無効な permission の場合は badRequest をスロー', async () => {
  const ownerId = 1;
  const fastify = createMockFastify({
    TodoFindOne: () => Promise.resolve({ id: 10, userId: ownerId }),
    httpErrorsBadRequest: (msg) => {
      const err = new Error(msg);
      err.statusCode = 400;
      return err;
    },
  });
  await assert.rejects(
    () => shareService.shareTodo(fastify, 10, 2, 'admin', ownerId),
    (err) => err.statusCode === 400 && /Invalid permission/.test(err.message)
  );
});

test('canView: 所有者は常に true', async () => {
  const userId = 1;
  const todo = { id: 10, userId, TodoShares: [] };
  const fastify = createMockFastify({ TodoFindOne: () => Promise.resolve(todo) });
  const result = await shareService.canView(fastify, 10, userId);
  assert.strictEqual(result, true);
});

test('canView: 共有先なら true、未共有なら false', async () => {
  const ownerId = 1;
  const viewerId = 2;
  const todoWithShare = { id: 10, userId: ownerId, TodoShares: [{ id: 1 }] };
  const todoNoShare = { id: 11, userId: ownerId, TodoShares: [] };
  const fastifyShared = createMockFastify({
    TodoFindOne: () => Promise.resolve(todoWithShare),
  });
  const fastifyNotShared = createMockFastify({
    TodoFindOne: () => Promise.resolve(todoNoShare),
  });
  assert.strictEqual(await shareService.canView(fastifyShared, 10, viewerId), true);
  assert.strictEqual(await shareService.canView(fastifyNotShared, 11, viewerId), false);
});

test('canView: Todo が存在しなければ false', async () => {
  const fastify = createMockFastify({ TodoFindOne: () => Promise.resolve(null) });
  assert.strictEqual(await shareService.canView(fastify, 999, 1), false);
});

test('canEdit: 所有者は常に true', async () => {
  const userId = 1;
  const todo = { id: 10, userId, TodoShares: [] };
  const fastify = createMockFastify({ TodoFindOne: () => Promise.resolve(todo) });
  assert.strictEqual(await shareService.canEdit(fastify, 10, userId), true);
});

test('canEdit: edit 共有先なら true、view のみなら false', async () => {
  const ownerId = 1;
  const userId = 2;
  const todoWithEdit = { id: 10, userId: ownerId, TodoShares: [{ permission: 'edit' }] };
  const todoWithViewOnly = { id: 11, userId: ownerId, TodoShares: [] };
  const fastifyEdit = createMockFastify({ TodoFindOne: () => Promise.resolve(todoWithEdit) });
  const fastifyView = createMockFastify({ TodoFindOne: () => Promise.resolve(todoWithViewOnly) });
  assert.strictEqual(await shareService.canEdit(fastifyEdit, 10, userId), true);
  assert.strictEqual(await shareService.canEdit(fastifyView, 11, userId), false);
});

test('deleteShareById: 所有者が削除すると true', async () => {
  const ownerId = 1;
  const shareId = 5;
  const share = {
    id: shareId,
    destroy: () => Promise.resolve(),
    Todo: { userId: ownerId },
  };
  const fastify = createMockFastify({
    TodoShareFindByPk: () => Promise.resolve(share),
  });
  const result = await shareService.deleteShareById(fastify, shareId, ownerId);
  assert.strictEqual(result, true);
});

test('deleteShareById: 所有者以外が削除しようとした場合は false', async () => {
  const share = { id: 5, Todo: { userId: 1 } };
  const fastify = createMockFastify({
    TodoShareFindByPk: () => Promise.resolve(share),
  });
  const result = await shareService.deleteShareById(fastify, 5, 999);
  assert.strictEqual(result, false);
});

test('deleteShareById: 共有が存在しない場合は false', async () => {
  const fastify = createMockFastify({ TodoShareFindByPk: () => Promise.resolve(null) });
  const result = await shareService.deleteShareById(fastify, 999, 1);
  assert.strictEqual(result, false);
});

test('getTodosSharedWithUser: 共有 Todo が sharedPermission 付きで返る', async () => {
  const userId = 2;
  const todoJson = { id: 10, userId: 1, title: 'Shared', completed: false, priority: 'medium' };
  const mockTodo = { toJSON: () => todoJson };
  const shares = [
    { permission: 'edit', Todo: mockTodo },
  ];
  const fastify = createMockFastify({
    TodoShareFindAll: () => Promise.resolve(shares),
  });
  const result = await shareService.getTodosSharedWithUser(fastify, userId);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 10);
  assert.strictEqual(result[0].title, 'Shared');
  assert.strictEqual(result[0].sharedPermission, 'edit');
});

test('getTodosSharedWithUser: 共有がなければ空配列', async () => {
  const fastify = createMockFastify({ TodoShareFindAll: () => Promise.resolve([]) });
  const result = await shareService.getTodosSharedWithUser(fastify, 1);
  assert.strictEqual(Array.isArray(result), true);
  assert.strictEqual(result.length, 0);
});
