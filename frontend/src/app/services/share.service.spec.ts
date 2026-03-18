import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { ShareService } from './share.service'
import type { SharePermission, TodoShare, SharedTodo } from '../models/share.interface'
import type { Todo } from '../models/todo.interface'

describe('ShareService (11.8)', () => {
  let service: ShareService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ShareService],
    })
    service = TestBed.inject(ShareService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call POST /todos/:id/share for shareTodo', () => {
    const todoId = 10
    const sharedWithUserId = 2
    const permission: SharePermission = 'edit'

    const mockShare: TodoShare = {
      id: 1,
      todoId,
      sharedWithUserId,
      permission,
      createdAt: '',
    }

    service.shareTodo(todoId, sharedWithUserId, permission).subscribe((share) => {
      expect(share).toEqual(mockShare)
    })

    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/${todoId}/share` && r.method === 'POST')
    expect(req.request.body).toEqual({ sharedWithUserId, permission })
    req.flush(mockShare)
  })

  it('should call GET /todos/shared for getSharedTodos', () => {
    const mockTodo: Todo = {
      id: 1,
      userId: 1,
      title: 'Shared',
      description: null,
      completed: false,
      priority: 'medium',
      dueDate: null,
      sortOrder: 0,
      projectId: null,
      archived: false,
      archivedAt: null,
      reminderEnabled: false,
      reminderSentAt: null,
      createdAt: '',
      updatedAt: '',
    }

    const mockSharedTodo: SharedTodo<Todo> = {
      ...mockTodo,
      sharedPermission: 'view',
    }

    service.getSharedTodos().subscribe((todos) => {
      expect(todos).toEqual([mockSharedTodo])
      expect(todos[0].sharedPermission).toBe('view')
    })

    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/shared` && r.method === 'GET')
    req.flush([mockSharedTodo])
  })

  it('should call DELETE /shares/:id for deleteShare', () => {
    const shareId = 123
    service.deleteShare(shareId).subscribe()

    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/shares/${shareId}` && r.method === 'DELETE')
    req.flush(null)
  })
})

