import type { Todo } from '../models/todo.interface'
import {
  normalizeTodoDueDateForCalendar,
  todoToCalendarEvent,
  todosToCalendarEvents
} from './todo-calendar-events'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    userId: 1,
    title: 'Test',
    description: null,
    completed: false,
    priority: 'medium',
    dueDate: '2026-03-20',
    sortOrder: 0,
    projectId: null,
    archived: false,
    archivedAt: null,
    reminderEnabled: false,
    reminderSentAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('normalizeTodoDueDateForCalendar', () => {
  it('should return YYYY-MM-DD from DATEONLY string', () => {
    expect(normalizeTodoDueDateForCalendar('2026-03-20')).toBe('2026-03-20')
  })

  it('should take first 10 chars from ISO datetime', () => {
    expect(normalizeTodoDueDateForCalendar('2026-03-20T00:00:00.000Z')).toBe('2026-03-20')
  })
})

describe('todoToCalendarEvent', () => {
  it('should return null when dueDate is null', () => {
    expect(todoToCalendarEvent(makeTodo({ dueDate: null }))).toBeNull()
  })

  it('should return null when dueDate is empty', () => {
    expect(todoToCalendarEvent(makeTodo({ dueDate: '' }))).toBeNull()
  })

  it('should map todo to all-day event with todoId in extendedProps', () => {
    const ev = todoToCalendarEvent(makeTodo({ id: 42, title: 'Buy milk', dueDate: '2026-04-01' }))
    expect(ev).toEqual(
      jasmine.objectContaining({
        id: '42',
        title: 'Buy milk',
        start: '2026-04-01',
        allDay: true,
        extendedProps: jasmine.objectContaining({
          todoId: 42,
          completed: false,
          priority: 'medium'
        })
      })
    )
    expect(ev?.classNames).toBeUndefined()
  })

  it('should apply completed styling', () => {
    const ev = todoToCalendarEvent(makeTodo({ completed: true }))
    expect(ev?.classNames).toEqual(['calendar-todo--completed'])
    expect(ev?.textColor).toBe('#546e7a')
  })

  it('should apply high priority colors when not completed', () => {
    const ev = todoToCalendarEvent(makeTodo({ priority: 'high', completed: false }))
    expect(ev?.borderColor).toBe('#e53935')
  })

  it('should apply medium priority colors', () => {
    const ev = todoToCalendarEvent(makeTodo({ priority: 'medium', completed: false }))
    expect(ev?.borderColor).toBe('#ffa000')
    expect(ev?.backgroundColor).toBe('#fff8e1')
  })

  it('should apply low priority colors', () => {
    const ev = todoToCalendarEvent(makeTodo({ priority: 'low', completed: false }))
    expect(ev?.borderColor).toBe('#43a047')
    expect(ev?.backgroundColor).toBe('#e8f5e9')
  })
})

describe('todosToCalendarEvents', () => {
  it('should filter out todos without due date', () => {
    const list = [
      makeTodo({ id: 1, dueDate: '2026-03-01' }),
      makeTodo({ id: 2, dueDate: null }),
      makeTodo({ id: 3, dueDate: '2026-03-02' })
    ]
    const events = todosToCalendarEvents(list)
    expect(events.length).toBe(2)
    expect(events.map((e) => e.extendedProps?.['todoId'])).toEqual([1, 3])
  })
})
