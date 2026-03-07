import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { TodoService } from './todo.service'
import type { SortOptions } from '../models/sort-options.interface'

describe('TodoService', () => {
  let service: TodoService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService],
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

  describe('list with sort (3.13.1)', () => {
    it('should call GET /todos with sortBy and sortOrder params when sort is provided', () => {
      const sort: SortOptions = { sortBy: 'dueDate', sortOrder: 'desc' }
      service.list(undefined, sort).subscribe()

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos` && r.method === 'GET')
      expect(req.request.params.get('sortBy')).toBe('dueDate')
      expect(req.request.params.get('sortOrder')).toBe('desc')
      req.flush([])
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
})
