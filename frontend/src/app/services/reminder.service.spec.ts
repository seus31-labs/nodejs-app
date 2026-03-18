import { TestBed, fakeAsync, tick } from '@angular/core/testing'
import { of, throwError } from 'rxjs'
import { ReminderService } from './reminder.service'
import { TodoService } from './todo.service'
import { NotificationService } from './notification.service'
import type { Todo } from '../models/todo.interface'

describe('ReminderService (4.14.2)', () => {
  let service: ReminderService
  let todoService: jasmine.SpyObj<TodoService>
  let notification: jasmine.SpyObj<NotificationService>

  beforeEach(() => {
    localStorage.clear()
    todoService = jasmine.createSpyObj('TodoService', ['getDueSoonTodos'])
    notification = jasmine.createSpyObj('NotificationService', ['showNotification'])

    TestBed.configureTestingModule({
      providers: [
        ReminderService,
        { provide: TodoService, useValue: todoService },
        { provide: NotificationService, useValue: notification },
      ]
    })
    service = TestBed.inject(ReminderService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('start should poll and notify once per todoId', fakeAsync(() => {
    const todos: Todo[] = [
      { id: 1, userId: 1, title: 'A', description: null, completed: false, priority: 'medium', dueDate: null, sortOrder: 0, projectId: null, archived: false, archivedAt: null, createdAt: '', updatedAt: '' },
      { id: 2, userId: 1, title: 'B', description: null, completed: false, priority: 'medium', dueDate: null, sortOrder: 0, projectId: null, archived: false, archivedAt: null, createdAt: '', updatedAt: '' },
    ]
    todoService.getDueSoonTodos.and.returnValue(of(todos))

    service.start()
    tick(0)
    expect(notification.showNotification).toHaveBeenCalledTimes(2)

    // second tick returns same todos -> no extra notifications
    tick(5 * 60 * 1000)
    expect(notification.showNotification).toHaveBeenCalledTimes(2)

    service.stop()
  }))

  it('start should not throw when API errors', fakeAsync(() => {
    todoService.getDueSoonTodos.and.returnValue(throwError(() => new Error('x')))
    expect(() => service.start()).not.toThrow()
    tick(0)
    expect(notification.showNotification).not.toHaveBeenCalled()
    service.stop()
  }))
})

