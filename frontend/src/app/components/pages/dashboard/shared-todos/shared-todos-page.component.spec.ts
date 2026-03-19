import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { of, throwError } from 'rxjs'
import SharedTodosPageComponent from './shared-todos-page.component'
import { ShareService } from '../../../../services/share.service'
import type { SharedTodo } from '../../../../models/share.interface'
import type { Todo } from '../../../../models/todo.interface'

describe('SharedTodosPageComponent (11.12)', () => {
  let component: SharedTodosPageComponent
  let fixture: ComponentFixture<SharedTodosPageComponent>
  let shareService: jasmine.SpyObj<ShareService>

  const sharedTodos: SharedTodo<Todo>[] = [
    {
      id: 11,
      userId: 1,
      title: 'Shared task',
      description: 'from owner',
      completed: false,
      priority: 'high',
      dueDate: '2026-03-20T10:00:00.000Z',
      sortOrder: 1,
      projectId: null,
      archived: false,
      archivedAt: null,
      reminderEnabled: false,
      reminderSentAt: null,
      createdAt: '2026-03-19T10:00:00.000Z',
      updatedAt: '2026-03-19T10:00:00.000Z',
      sharedPermission: 'edit'
    }
  ]

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ShareService', ['getSharedTodos'])
    spy.getSharedTodos.and.returnValue(of(sharedTodos))

    await TestBed.configureTestingModule({
      imports: [SharedTodosPageComponent],
      providers: [
        { provide: ShareService, useValue: spy },
        provideNoopAnimations()
      ]
    }).compileComponents()

    shareService = TestBed.inject(ShareService) as jasmine.SpyObj<ShareService>
    fixture = TestBed.createComponent(SharedTodosPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load shared todos on init', () => {
    expect(shareService.getSharedTodos).toHaveBeenCalled()
    expect(component.todos).toEqual(sharedTodos)
    expect(component.loading).toBe(false)
    expect(component.error).toBeNull()
  })

  it('should set error when getSharedTodos fails', () => {
    shareService.getSharedTodos.and.returnValue(throwError(() => ({ error: { message: 'load failed' } })))

    component.ngOnInit()

    expect(component.error).toBe('load failed')
    expect(component.loading).toBe(false)
  })

  it('should keep empty todos when getSharedTodos returns empty array', () => {
    shareService.getSharedTodos.and.returnValue(of([]))

    component.ngOnInit()

    expect(component.todos).toEqual([])
    expect(component.loading).toBe(false)
    expect(component.error).toBeNull()
  })

  it('permissionLabel should map permission labels', () => {
    expect(component.permissionLabel('view')).toBe('閲覧のみ')
    expect(component.permissionLabel('edit')).toBe('編集可')
  })

  it('formatDueDate should return fallback for null', () => {
    expect(component.formatDueDate(null)).toBe('期限なし')
  })

  it('formatDueDate should format a date string', () => {
    const result = component.formatDueDate('2026-03-20T10:00:00.000Z')

    expect(result).not.toBe('期限なし')
    expect(result.length).toBeGreaterThan(0)
  })
})
