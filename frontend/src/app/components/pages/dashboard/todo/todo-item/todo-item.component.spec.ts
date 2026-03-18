import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TodoItemComponent } from './todo-item.component'
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  Tags: [],
}

describe('TodoItemComponent (2.12.2)', () => {
  let component: TodoItemComponent
  let fixture: ComponentFixture<TodoItemComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent],
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
})

