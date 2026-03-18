import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { of, throwError } from 'rxjs'
import ArchivedTodosPageComponent from './archived-todos-page.component'
import { TodoService } from '../../../../services/todo.service'
import type { Todo } from '../../../../models/todo.interface'

const mockArchivedTodos: Todo[] = [
  {
    id: 1,
    userId: 1,
    title: 'Done task',
    description: null,
    completed: true,
    priority: 'medium',
    dueDate: null,
    sortOrder: 0,
    projectId: null,
    archived: true,
    archivedAt: '2026-03-01T12:00:00.000Z',
    reminderEnabled: true,
    reminderSentAt: null,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
    Tags: [],
  },
]

describe('ArchivedTodosPageComponent (10.12.2)', () => {
  let component: ArchivedTodosPageComponent
  let fixture: ComponentFixture<ArchivedTodosPageComponent>
  let todoService: jasmine.SpyObj<TodoService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TodoService', ['getArchivedTodos', 'unarchiveTodo', 'deleteArchivedTodos'])
    await TestBed.configureTestingModule({
      imports: [ArchivedTodosPageComponent],
      providers: [{ provide: TodoService, useValue: spy }, provideNoopAnimations()],
    }).compileComponents()

    todoService = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>
    todoService.getArchivedTodos.and.returnValue(of([]))

    fixture = TestBed.createComponent(ArchivedTodosPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call getArchivedTodos on init and set todos', () => {
    expect(todoService.getArchivedTodos).toHaveBeenCalled()
    expect(component.todos).toEqual([])
  })

  it('should display loaded archived todos', () => {
    todoService.getArchivedTodos.calls.reset()
    todoService.getArchivedTodos.and.returnValue(of(mockArchivedTodos))
    component.loadArchived()
    expect(component.todos).toEqual(mockArchivedTodos)
    expect(component.loading).toBe(false)
  })

  it('should call unarchiveTodo and reload on onUnarchive', () => {
    todoService.getArchivedTodos.and.returnValue(of([]))
    todoService.unarchiveTodo.and.returnValue(of(mockArchivedTodos[0] as Todo))
    component.onUnarchive(1)
    expect(todoService.unarchiveTodo).toHaveBeenCalledWith(1)
    expect(todoService.getArchivedTodos).toHaveBeenCalled()
  })

  it('should set error on unarchiveTodo failure', () => {
    todoService.unarchiveTodo.and.returnValue(throwError(() => ({ message: 'server error' })))
    component.onUnarchive(1)
    expect(component.error).toBe('server error')
  })

  it('should call deleteArchivedTodos and reload when confirm is true', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    todoService.deleteArchivedTodos.and.returnValue(of(undefined))
    todoService.getArchivedTodos.and.returnValue(of([]))
    component.onDeleteAll()
    expect(todoService.deleteArchivedTodos).toHaveBeenCalled()
    expect(todoService.getArchivedTodos).toHaveBeenCalled()
  })

  it('should not call deleteArchivedTodos when confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false)
    component.onDeleteAll()
    expect(todoService.deleteArchivedTodos).not.toHaveBeenCalled()
  })

  it('should set error when deleteArchivedTodos fails', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    todoService.deleteArchivedTodos.and.returnValue(throwError(() => ({ message: 'delete error' })))
    component.onDeleteAll()
    expect(component.error).toBe('delete error')
  })

  it('formatArchivedAt should return empty string for null', () => {
    expect(component.formatArchivedAt(null)).toBe('')
  })

  it('formatArchivedAt should return ja-JP formatted date', () => {
    const formatted = component.formatArchivedAt('2026-03-01T12:00:00.000Z')
    expect(formatted).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
  })
})
