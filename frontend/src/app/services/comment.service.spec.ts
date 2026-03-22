import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { CommentService } from './comment.service'
import type { Comment } from '../models/comment.interface'

describe('CommentService (9.12)', () => {
  let service: CommentService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService],
    })
    service = TestBed.inject(CommentService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('listByTodo should GET /todos/:id/comments', () => {
    const todoId = 5
    const mock: Comment[] = []
    service.listByTodo(todoId).subscribe((list) => expect(list).toEqual(mock))
    const req = httpMock.expectOne(`${apiUrl}/todos/${todoId}/comments`)
    expect(req.request.method).toBe('GET')
    req.flush(mock)
  })

  it('create should POST body', () => {
    const todoId = 3
    const body = { content: 'hello' }
    const mock: Comment = {
      id: 1,
      todoId,
      userId: 1,
      content: 'hello',
      createdAt: '',
      updatedAt: '',
      authorName: 'A',
      isMine: true,
    }
    service.create(todoId, body).subscribe((c) => expect(c).toEqual(mock))
    const req = httpMock.expectOne(`${apiUrl}/todos/${todoId}/comments`)
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual(body)
    req.flush(mock)
  })

  it('update should PUT /comments/:id', () => {
    const body = { content: 'updated' }
    const mock: Comment = {
      id: 2,
      todoId: 1,
      userId: 1,
      content: 'updated',
      createdAt: '',
      updatedAt: '',
      authorName: 'A',
      isMine: true,
    }
    service.update(2, body).subscribe((c) => expect(c).toEqual(mock))
    const req = httpMock.expectOne(`${apiUrl}/comments/2`)
    expect(req.request.method).toBe('PUT')
    expect(req.request.body).toEqual(body)
    req.flush(mock)
  })

  it('delete should DELETE /comments/:id', () => {
    service.delete(9).subscribe(() => undefined)
    const req = httpMock.expectOne(`${apiUrl}/comments/9`)
    expect(req.request.method).toBe('DELETE')
    req.flush(null, { status: 204, statusText: 'No Content' })
  })
})
