import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { TodoService } from './todo.service'
import { NetworkStatusService } from './network-status.service'
import { OfflineStorageService } from './offline-storage.service'
import type { SortOptions } from '../models/sort-options.interface'
import type { SearchParams } from '../models/search-params.interface'
import type { Todo } from '../models/todo.interface'

const mockTodo: Todo = {
  id: 1,
  userId: 1,
  title: 'cached',
  description: null,
  completed: false,
  priority: 'medium',
  dueDate: null,
  sortOrder: 0,
  projectId: null,
  archived: false,
  archivedAt: null,
  reminderEnabled: true,
  reminderSentAt: null,
  createdAt: '',
  updatedAt: ''
}

describe('TodoService', () => {
  let service: TodoService
  let httpMock: HttpTestingController
  let networkStatus: jasmine.SpyObj<NetworkStatusService>
  let offlineStorage: jasmine.SpyObj<OfflineStorageService>
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    networkStatus = jasmine.createSpyObj('NetworkStatusService', [], { isOnline: true })
    offlineStorage = jasmine.createSpyObj('OfflineStorageService', ['getTodos', 'saveTodos'])
    offlineStorage.saveTodos.and.returnValue(Promise.resolve())
    offlineStorage.getTodos.and.returnValue(Promise.resolve([]))

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TodoService,
        { provide: NetworkStatusService, useValue: networkStatus },
        { provide: OfflineStorageService, useValue: offlineStorage }
      ]
    })
    service = TestBed.inject(TodoService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('list (20.6 offline)', () => {
    it('when offline should return cached todos without HTTP', (done) => {
      Object.defineProperty(networkStatus, 'isOnline', { get: () => false, configurable: true })
      offlineStorage.getTodos.and.returnValue(Promise.resolve([mockTodo]))
      service.list().subscribe((todos) => {
        expect(todos).toEqual([mockTodo])
        expect(offlineStorage.getTodos).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('list with sort (3.13.1)', () => {
    it('should call GET /todos with sortBy and sortOrder params when sort is provided', () => {
      const sort: SortOptions = { sortBy: 'dueDate', sortOrder: 'desc' }
      const response: Todo[] = []
      service.list(undefined, sort).subscribe((todos) => {
        expect(todos).toEqual(response)
        expect(offlineStorage.saveTodos).toHaveBeenCalledWith(response)
      })

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos` && r.method === 'GET')
      expect(req.request.params.get('sortBy')).toBe('dueDate')
      expect(req.request.params.get('sortOrder')).toBe('desc')
      req.flush(response)
    })

    it('should call GET /todos without sort params when sort is not provided', () => {
      service.list().subscribe()
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos` && r.method === 'GET')
      expect(req.request.params.has('sortBy')).toBe(false)
      expect(req.request.params.has('sortOrder')).toBe(false)
      req.flush([])
    })

    it('should pass sortOrder asc when sort is sortOrder asc', () => {
      service.list(undefined, { sortBy: 'priority', sortOrder: 'asc' }).subscribe()
      const req = httpMock.expectOne((r) => r.url.startsWith(`${apiUrl}/todos`) && r.method === 'GET')
      expect(req.request.params.get('sortBy')).toBe('priority')
      expect(req.request.params.get('sortOrder')).toBe('asc')
      req.flush([])
    })
  })

  describe('reorderTodos (3.13.1)', () => {
    it('should call PUT /todos/reorder with todoIds in body', () => {
      const todoIds = [3, 1, 2]
      service.reorderTodos(todoIds).subscribe()

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/reorder` && r.method === 'PUT')
      expect(req.request.body).toEqual({ todoIds })
      req.flush(null)
    })

    it('should call PUT /todos/reorder with empty array', () => {
      service.reorderTodos([]).subscribe()
      const req = httpMock.expectOne(`${apiUrl}/todos/reorder`)
      expect(req.request.body).toEqual({ todoIds: [] })
      req.flush(null)
    })
  })

  describe('archive (10.12.1)', () => {
    it('should call PATCH /todos/:id/archive for archiveTodo', () => {
      const id = 5
      service.archiveTodo(id).subscribe()
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/${id}/archive` && r.method === 'PATCH')
      expect(req.request.body).toEqual({})
      req.flush({ id, archived: true })
    })

    it('should call PATCH /todos/:id/unarchive for unarchiveTodo', () => {
      const id = 3
      service.unarchiveTodo(id).subscribe()
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/${id}/unarchive` && r.method === 'PATCH')
      expect(req.request.body).toEqual({})
      req.flush({ id, archived: false })
    })

    it('should call GET /todos/archived for getArchivedTodos', () => {
      service.getArchivedTodos().subscribe((list) => expect(list).toEqual([]))
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/archived` && r.method === 'GET')
      req.flush([])
    })

    it('should call DELETE /todos/archived for deleteArchivedTodos', () => {
      service.deleteArchivedTodos().subscribe()
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/archived` && r.method === 'DELETE')
      req.flush(null)
    })
  })

  describe('search (2.13.1)', () => {
    it('should call GET /todos/search with q and return todos', () => {
      const params: SearchParams = { q: '買い物' }
      service.search(params).subscribe((list) => expect(list.length).toBe(1))
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/search` && r.method === 'GET')
      expect(req.request.params.get('q')).toBe('買い物')
      req.flush([{ id: 1, userId: 1, title: '買い物', description: null, completed: false, priority: 'medium', dueDate: null, sortOrder: 0, projectId: null, archived: false, archivedAt: null, reminderEnabled: true, reminderSentAt: null, createdAt: '', updatedAt: '' }])
    })

    it('should send completed, priority, tags and sort params when provided', () => {
      const params: SearchParams = { q: 'x', completed: false, priority: 'high', tagIds: [1, 2] }
      const sort: SortOptions = { sortBy: 'dueDate', sortOrder: 'desc' }
      service.search(params, sort).subscribe()
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/search` && r.method === 'GET')
      expect(req.request.params.get('q')).toBe('x')
      expect(req.request.params.get('completed')).toBe('false')
      expect(req.request.params.get('priority')).toBe('high')
      expect(req.request.params.get('tags')).toBe('1,2')
      expect(req.request.params.get('sortBy')).toBe('dueDate')
      expect(req.request.params.get('sortOrder')).toBe('desc')
      req.flush([])
    })

    it('should trim q before sending', () => {
      service.search({ q: '  keyword  ' }).subscribe()
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/search` && r.method === 'GET')
      expect(req.request.params.get('q')).toBe('keyword')
      req.flush([])
    })
  })

  describe('reminder (4.7)', () => {
    it('should call GET /todos/due-soon for getDueSoonTodos', () => {
      service.getDueSoonTodos().subscribe((list) => expect(list).toEqual([]))
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/due-soon` && r.method === 'GET')
      req.flush([])
    })

    it('should call PATCH /todos/:id/reminder with enabled for toggleReminder', () => {
      const id = 10
      service.toggleReminder(id, false).subscribe()
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/${id}/reminder` && r.method === 'PATCH')
      expect(req.request.body).toEqual({ enabled: false })
      req.flush({ id, reminderEnabled: false })
    })
  })

  describe('bulk (15.17)', () => {
    it('should call POST /todos/bulk-complete with todoIds in body', () => {
      const todoIds = [1, 2, 3]
      service.bulkComplete(todoIds).subscribe((res) => expect(res.updated).toBe(2))
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/bulk-complete` && r.method === 'POST')
      expect(req.request.body).toEqual({ todoIds })
      req.flush({ updated: 2 })
    })

    it('should call POST /todos/bulk-delete with todoIds in body', () => {
      const todoIds = [5, 6]
      service.bulkDelete(todoIds).subscribe((res) => expect(res.deleted).toBe(2))
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/bulk-delete` && r.method === 'POST')
      expect(req.request.body).toEqual({ todoIds })
      req.flush({ deleted: 2 })
    })

    it('should call POST /todos/bulk-archive with todoIds in body', () => {
      const todoIds = [10]
      service.bulkArchive(todoIds).subscribe((res) => expect(res.updated).toBe(1))
      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/bulk-archive` && r.method === 'POST')
      expect(req.request.body).toEqual({ todoIds })
      req.flush({ updated: 1 })
    })

    it('should call POST /todos/bulk-add-tag with todoIds and tagId in body (15.14)', () => {
      const todoIds = [1, 2, 3]
      const tagId = 5
      service.bulkAddTag(todoIds, tagId).subscribe((res) => expect(res.added).toBe(2))
      const req = httpMock.expectOne(
        (r) => r.url === `${apiUrl}/todos/bulk-add-tag` && r.method === 'POST'
      )
      expect(req.request.body).toEqual({ todoIds, tagId })
      req.flush({ added: 2 })
    })
  })
})
