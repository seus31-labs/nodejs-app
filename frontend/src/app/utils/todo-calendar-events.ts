import type { EventInput } from '@fullcalendar/core'
import type { Todo, TodoPriority } from '../models/todo.interface'

/**
 * API の dueDate は Sequelize DATEONLY 想定だが、将来の互換のため先頭10文字を日付として扱う。
 * FullCalendar の終日イベントはローカル日付文字列（YYYY-MM-DD）が安全。
 */
export function normalizeTodoDueDateForCalendar(dueDate: string): string {
  const trimmed = dueDate.trim()
  if (trimmed.length >= 10) {
    return trimmed.slice(0, 10)
  }
  return trimmed
}

const PRIORITY_COLORS: Record<TodoPriority, { backgroundColor: string; borderColor: string }> = {
  low: { backgroundColor: '#e8f5e9', borderColor: '#43a047' },
  medium: { backgroundColor: '#fff8e1', borderColor: '#ffa000' },
  high: { backgroundColor: '#ffebee', borderColor: '#e53935' }
}

const COMPLETED_COLORS = {
  backgroundColor: '#eceff1',
  borderColor: '#90a4ae',
  textColor: '#546e7a'
}

/**
 * 1件の Todo を FullCalendar 用イベントに変換する。
 * 期限なしはカレンダーに載せない（日付軸のビューと整合させるため）。
 */
export function todoToCalendarEvent(todo: Todo): EventInput | null {
  if (todo.dueDate == null || todo.dueDate === '') {
    return null
  }

  const start = normalizeTodoDueDateForCalendar(todo.dueDate)
  const base = {
    id: String(todo.id),
    title: todo.title,
    start,
    allDay: true,
    /** 完了済みはドラッグで期限変更させない（12.8） */
    startEditable: !todo.completed,
    durationEditable: false,
    extendedProps: {
      todoId: todo.id,
      completed: todo.completed,
      priority: todo.priority
    }
  }

  if (todo.completed) {
    return {
      ...base,
      backgroundColor: COMPLETED_COLORS.backgroundColor,
      borderColor: COMPLETED_COLORS.borderColor,
      textColor: COMPLETED_COLORS.textColor,
      classNames: ['calendar-todo--completed']
    }
  }

  const { backgroundColor, borderColor } = PRIORITY_COLORS[todo.priority]
  return {
    ...base,
    backgroundColor,
    borderColor
  }
}

/**
 * Todo 一覧をカレンダー表示用イベント配列へ変換（期限なしは除外）。
 */
export function todosToCalendarEvents(todos: Todo[]): EventInput[] {
  return todos
    .map((t) => todoToCalendarEvent(t))
    .filter((e): e is EventInput => e != null)
}
