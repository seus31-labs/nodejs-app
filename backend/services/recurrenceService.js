'use strict';

module.exports = require('./recurrenceService');

'use strict';

function toDateOnlyString(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() + 1 !== m ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

function addMonthsUtc(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const targetMonth = month + months;
  const targetYear = year + Math.floor(targetMonth / 12);
  const monthInYear = ((targetMonth % 12) + 12) % 12;

  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, monthInYear + 1, 0)).getUTCDate();
  const safeDay = Math.min(day, lastDayOfTargetMonth);

  return new Date(Date.UTC(targetYear, monthInYear, safeDay));
}

/**
 * 繰り返し設定に基づいて次回期限日（DATEONLY）を計算する。
 * dueDate がない場合は現在日付（UTC 基準）を起点にする。
 */
function calculateNextDueDate(pattern, interval, currentDate) {
  const safeInterval = Number.isInteger(interval) && interval > 0 ? interval : 1;
  const baseDate = parseDateOnly(currentDate) ?? new Date();
  const base = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()));

  if (pattern === 'daily') {
    base.setUTCDate(base.getUTCDate() + safeInterval);
    return toDateOnlyString(base);
  }
  if (pattern === 'weekly') {
    base.setUTCDate(base.getUTCDate() + safeInterval * 7);
    return toDateOnlyString(base);
  }
  if (pattern === 'monthly') {
    return toDateOnlyString(addMonthsUtc(base, safeInterval));
  }

  throw new Error('不正な recurrencePattern です。');
}

/**
 * 次回発生 Todo を生成すべきか判定する。
 * recurrenceEndDate がある場合、次回期限日が終了日を超えると false。
 */
function shouldCreateNext(todo) {
  if (!todo?.isRecurring) return false;
  if (!todo.recurrencePattern) return false;

  const nextDueDate = calculateNextDueDate(
    todo.recurrencePattern,
    todo.recurrenceInterval,
    todo.dueDate ?? toDateOnlyString(new Date())
  );

  if (!todo.recurrenceEndDate) return true;
  return nextDueDate <= todo.recurrenceEndDate;
}

/**
 * 次回発生 Todo の作成用 payload を返す。
 * 実際の DB 保存は呼び出し側サービスに委譲する。
 */
function createNextOccurrence(todo) {
  if (!shouldCreateNext(todo)) return null;

  const nextDueDate = calculateNextDueDate(
    todo.recurrencePattern,
    todo.recurrenceInterval,
    todo.dueDate ?? toDateOnlyString(new Date())
  );

  return {
    userId: todo.userId,
    title: todo.title,
    description: todo.description ?? null,
    priority: todo.priority ?? 'medium',
    dueDate: nextDueDate,
    projectId: todo.projectId ?? null,
    completed: false,
    archived: false,
    archivedAt: null,
    reminderEnabled: todo.reminderEnabled ?? true,
    reminderSentAt: null,
    isRecurring: true,
    recurrencePattern: todo.recurrencePattern,
    recurrenceInterval: Number.isInteger(todo.recurrenceInterval) && todo.recurrenceInterval > 0
      ? todo.recurrenceInterval
      : 1,
    recurrenceEndDate: todo.recurrenceEndDate ?? null,
    originalTodoId: todo.originalTodoId ?? todo.id ?? null
  };
}

module.exports = {
  calculateNextDueDate,
  shouldCreateNext,
  createNextOccurrence
};

