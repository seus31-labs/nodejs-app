import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { TodoService } from '../../../../services/todo.service'
import type { Todo } from '../../../../models/todo.interface'

import RecurringTodoListPageComponent from './recurring-todo-list-page.component'

describe('RecurringTodoListPageComponent', () => {
  let component: RecurringTodoListPageComponent
  let fixture: ComponentFixture<RecurringTodoListPageComponent>
  let todoService: jasmine.SpyObj<TodoService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TodoService', ['list', 'toggleComplete', 'archiveTodo', 'delete', 'toggleReminder'])
    spy.list.and.returnValue(of([]))
    await TestBed.configureTestingModule({
      imports: [RecurringTodoListPageComponent],
      providers: [{ provide: TodoService, useValue: spy }, provideNoopAnimations()]
    })
    .compileComponents()

    todoService = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>
    fixture = TestBed.createComponent(RecurringTodoListPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should filter and display recurring todos only', () => {
    const list: Todo[] = [
      { id: 1, userId: 1, title: 'A', description: null, completed: false, priority: 'medium', dueDate: null, sortOrder: 0, projectId: null, archived: false, archivedAt: null, reminderEnabled: true, reminderSentAt: null, createdAt: '', updatedAt: '', isRecurring: true, recurrencePattern: null, recurrenceInterval: 1, recurrenceEndDate: null },
      { id: 2, userId: 1, title: 'B', description: null, completed: false, priority: 'medium', dueDate: null, sortOrder: 1, projectId: null, archived: false, archivedAt: null, reminderEnabled: true, reminderSentAt: null, createdAt: '', updatedAt: '', isRecurring: false, recurrencePattern: null, recurrenceInterval: 1, recurrenceEndDate: null }
    ]
    todoService.list.and.returnValue(of(list))
    component.loadRecurringTodos()
    expect(component.todos.length).toBe(1)
    expect(component.todos[0].id).toBe(1)
  })
})
