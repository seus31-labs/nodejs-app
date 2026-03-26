import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { SimpleChange } from '@angular/core'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { TodoItemComponent } from './todo-item.component'
import type { ReminderToggleEvent } from './todo-item.component'
import type { Todo } from '../../../../../models/todo.interface'

const mockTodo: Todo = {
  id: 1,
  userId: 1,
  title: '買い物に行く',
  description: '牛乳とパンを買う',
  completed: false,
  priority: 'medium',
  dueDate: null,
  sortOrder: 0,
  projectId: null,
  archived: false,
  archivedAt: null,
  reminderEnabled: true,
  reminderSentAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  Tags: [],
}

describe('TodoItemComponent (2.12.2)', () => {
  let component: TodoItemComponent
  let fixture: ComponentFixture<TodoItemComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent, HttpClientTestingModule],
      providers: [
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } }
        }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TodoItemComponent)
    component = fixture.componentInstance
    component.todo = { ...mockTodo }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('highlightParts should return plain text when query empty', () => {
    component.highlightQuery = ''
    expect(component.highlightParts('abc')).toEqual([{ text: 'abc', match: false }])
  })

  it('highlightParts should highlight tokens (case-insensitive)', () => {
    component.highlightQuery = 'パン ぎゅう'
    const parts = component.highlightParts('牛乳とパンを買う')
    expect(parts.some((p) => p.match)).toBeTrue()
    expect(parts.map((p) => p.text).join('')).toEqual('牛乳とパンを買う')
  })

  it('should correctly split parts with match flags', () => {
    component.highlightQuery = 'パン'
    const parts = component.highlightParts('牛乳とパンを買う')
    expect(parts).toEqual([
      { text: '牛乳と', match: false },
      { text: 'パン', match: true },
      { text: 'を買う', match: false },
    ])
  })

  it('should not throw on special regex chars in query', () => {
    component.highlightQuery = '(買い物)'
    expect(() => component.highlightParts('(買い物)に行く')).not.toThrow()
  })

  it('onToggleReminder should emit false when reminderEnabled is true', () => {
    const emitted: ReminderToggleEvent[] = []
    component.reminderToggled.subscribe((e) => emitted.push(e))

    component.todo = { ...mockTodo, reminderEnabled: true }
    component.onToggleReminder()

    expect(emitted).toEqual([{ todoId: mockTodo.id, enabled: false }])
  })

  it('onToggleReminder should emit true when reminderEnabled is false', () => {
    const emitted: ReminderToggleEvent[] = []
    component.reminderToggled.subscribe((e) => emitted.push(e))

    component.todo = { ...mockTodo, reminderEnabled: false }
    component.onToggleReminder()

    expect(emitted).toEqual([{ todoId: mockTodo.id, enabled: true }])
  })

  it('onShare should emit todoId', () => {
    const emitted: number[] = []
    component.share.subscribe((id) => emitted.push(id))
    component.onShare()
    expect(emitted).toEqual([mockTodo.id])
  })

  it('should recognize todo has subtasks from progress', () => {
    const todoWithSubtasks: Todo = {
      ...mockTodo,
      progress: { completed: 1, total: 2 },
      subtasks: [
        { ...mockTodo, id: 11, title: 'child1', parentId: 1, completed: true },
        { ...mockTodo, id: 12, title: 'child2', parentId: 1, completed: false }
      ]
    }
    component.todo = todoWithSubtasks
    component.ngOnChanges({
      todo: new SimpleChange(mockTodo, todoWithSubtasks, false)
    })
    fixture.detectChanges()

    expect(component.hasSubtasks).toBeTrue()
  })

  it('toggleSubtasks should toggle visibility state', () => {
    expect(component.showSubtasks).toBeFalse()
    component.toggleSubtasks()
    expect(component.showSubtasks).toBeTrue()
    component.toggleSubtasks()
    expect(component.showSubtasks).toBeFalse()
  })

  it('onSubtasksUpdated should update todo progress and subtasks', () => {
    const subtasks: Todo[] = [
      { ...mockTodo, id: 21, title: 'child1', parentId: 1, completed: true },
      { ...mockTodo, id: 22, title: 'child2', parentId: 1, completed: false },
      { ...mockTodo, id: 23, title: 'child3', parentId: 1, completed: true }
    ]

    component.onSubtasksUpdated(subtasks)

    expect(component.todo.subtasks?.length).toBe(3)
    expect(component.todo.progress).toEqual({ completed: 2, total: 3 })
  })
})

