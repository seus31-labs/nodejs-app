import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { TodoService } from '../../../../services/todo.service'
import { ShareService } from '../../../../services/share.service'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import type { Todo } from '../../../../models/todo.interface'

import RecurringTodoListPageComponent from './recurring-todo-list-page.component'

describe('RecurringTodoListPageComponent', () => {
  let component: RecurringTodoListPageComponent
  let fixture: ComponentFixture<RecurringTodoListPageComponent>
  let todoService: jasmine.SpyObj<TodoService>
  let shareService: jasmine.SpyObj<ShareService>
  let router: jasmine.SpyObj<Router>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TodoService', ['list', 'toggleComplete', 'archiveTodo', 'delete', 'toggleReminder'])
    const shareSpy = jasmine.createSpyObj('ShareService', ['shareTodo'])
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open'])
    spy.list.and.returnValue(of([]))
    shareSpy.shareTodo.and.returnValue(of(undefined))
    routerSpy.navigate.and.resolveTo(true)
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(undefined)
    })
    await TestBed.configureTestingModule({
      imports: [RecurringTodoListPageComponent],
      providers: [
        { provide: TodoService, useValue: spy },
        { provide: ShareService, useValue: shareSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        provideNoopAnimations()
      ]
    })
    .compileComponents()

    todoService = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>
    shareService = TestBed.inject(ShareService) as jasmine.SpyObj<ShareService>
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>
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

  it('should navigate to todo detail on edit', () => {
    component.onEdit({ id: 10 } as Todo)
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/todos', 10])
  })

  it('should call share service when dialog returns result', () => {
    const dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>
    dialog.open.and.returnValue({
      afterClosed: () => of({ sharedWithUserId: 2, permission: 'view' })
    } as never)

    component.onShare(11)
    expect(shareService.shareTodo).toHaveBeenCalledWith(11, 2, 'view')
  })
})
