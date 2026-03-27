const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateNextDueDate,
  shouldCreateNext,
  createNextOccurrence
} = require('../../services/recurrenceService');

test('calculateNextDueDate: daily/weekly/monthly を正しく計算する', () => {
  assert.equal(calculateNextDueDate('daily', 1, '2026-03-25'), '2026-03-26');
  assert.equal(calculateNextDueDate('weekly', 1, '2026-03-25'), '2026-04-01');
  assert.equal(calculateNextDueDate('monthly', 1, '2026-01-31'), '2026-02-28');
});

test('calculateNextDueDate: interval > 1 を考慮する', () => {
  assert.equal(calculateNextDueDate('daily', 3, '2026-03-25'), '2026-03-28');
  assert.equal(calculateNextDueDate('weekly', 2, '2026-03-25'), '2026-04-08');
  assert.equal(calculateNextDueDate('monthly', 2, '2026-01-31'), '2026-03-31');
});

test('calculateNextDueDate: 不正 pattern は例外を投げる', () => {
  assert.throws(
    () => calculateNextDueDate('yearly', 1, '2026-03-25'),
    /不正な recurrencePattern/
  );
});

test('shouldCreateNext: recurrenceEndDate を超える場合は false', () => {
  const todo = {
    id: 10,
    isRecurring: true,
    recurrencePattern: 'daily',
    recurrenceInterval: 1,
    dueDate: '2026-03-25',
    recurrenceEndDate: '2026-03-25'
  };
  assert.equal(shouldCreateNext(todo), false);
});

test('shouldCreateNext: recurrenceEndDate 以内なら true', () => {
  const todo = {
    id: 11,
    isRecurring: true,
    recurrencePattern: 'weekly',
    recurrenceInterval: 1,
    dueDate: '2026-03-25',
    recurrenceEndDate: '2026-04-10'
  };
  assert.equal(shouldCreateNext(todo), true);
});

test('createNextOccurrence: 次回 Todo 作成 payload を返す', () => {
  const todo = {
    id: 20,
    userId: 7,
    title: '定期タスク',
    description: '毎日実行',
    priority: 'high',
    dueDate: '2026-03-25',
    projectId: 3,
    reminderEnabled: true,
    isRecurring: true,
    recurrencePattern: 'daily',
    recurrenceInterval: 1,
    recurrenceEndDate: '2026-12-31'
  };

  const next = createNextOccurrence(todo);

  assert.equal(next.userId, 7);
  assert.equal(next.title, '定期タスク');
  assert.equal(next.completed, false);
  assert.equal(next.archived, false);
  assert.equal(next.reminderSentAt, null);
  assert.equal(next.dueDate, '2026-03-26');
  assert.equal(next.originalTodoId, 20);
  assert.equal(next.isRecurring, true);
});

test('createNextOccurrence: 生成条件を満たさない場合は null', () => {
  const todo = {
    id: 30,
    isRecurring: false,
    recurrencePattern: 'daily',
    recurrenceInterval: 1,
    dueDate: '2026-03-25'
  };
  assert.equal(createNextOccurrence(todo), null);
});

