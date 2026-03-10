import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { TemplateService } from './template.service'
import type {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateTodoFromTemplateDto,
} from '../models/template.interface'

describe('TemplateService (14.7)', () => {
  let service: TemplateService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TemplateService],
    })
    service = TestBed.inject(TemplateService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call POST /templates with body for create', () => {
    const body: CreateTemplateDto = { name: 'Daily', title: 'Daily task' }
    service.create(body).subscribe((t) => expect(t.id).toBe(1))
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/templates` && r.method === 'POST'
    )
    expect(req.request.body).toEqual(body)
    req.flush({
      id: 1,
      userId: 1,
      name: 'Daily',
      title: 'Daily task',
      description: null,
      priority: 'medium',
      tagIds: null,
      createdAt: '',
      updatedAt: '',
    })
  })

  it('should call GET /templates for getAll', () => {
    service.getAll().subscribe((list) => expect(list).toEqual([]))
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/templates` && r.method === 'GET'
    )
    req.flush([])
  })

  it('should call GET /templates/:id for getById', () => {
    const id = 5
    service.getById(id).subscribe((t) => expect(t.id).toBe(id))
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/templates/${id}` && r.method === 'GET'
    )
    req.flush({
      id,
      userId: 1,
      name: 'x',
      title: 'y',
      description: null,
      priority: 'medium',
      tagIds: null,
      createdAt: '',
      updatedAt: '',
    })
  })

  it('should call PUT /templates/:id with body for update', () => {
    const id = 3
    const body: UpdateTemplateDto = { name: 'Updated', title: 'Updated title' }
    service.update(id, body).subscribe((t) => expect(t.name).toBe('Updated'))
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/templates/${id}` && r.method === 'PUT'
    )
    expect(req.request.body).toEqual(body)
    req.flush({
      id,
      userId: 1,
      name: 'Updated',
      title: 'Updated title',
      description: null,
      priority: 'medium',
      tagIds: null,
      createdAt: '',
      updatedAt: '',
    })
  })

  it('should call DELETE /templates/:id for delete', () => {
    const id = 2
    service.delete(id).subscribe((body) => expect(body).toBeFalsy())
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/templates/${id}` && r.method === 'DELETE'
    )
    req.flush(null)
  })

  it('should call POST /templates/:id/create-todo for createTodoFromTemplate', () => {
    const templateId = 10
    service.createTodoFromTemplate(templateId).subscribe((todo) => {
      expect(todo.id).toBe(1)
      expect(todo.title).toBe('From template')
    })
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${apiUrl}/templates/${templateId}/create-todo` &&
        r.method === 'POST'
    )
    expect(req.request.body).toEqual({})
    req.flush({
      id: 1,
      userId: 1,
      title: 'From template',
      description: null,
      completed: false,
      priority: 'medium',
      dueDate: null,
      sortOrder: 0,
      projectId: null,
      archived: false,
      archivedAt: null,
      createdAt: '',
      updatedAt: '',
    })
  })

  it('should call POST /templates/:id/create-todo with body for createTodoFromTemplate', () => {
    const templateId = 11
    const body: CreateTodoFromTemplateDto = { title: 'Overridden', priority: 'high' }
    service.createTodoFromTemplate(templateId, body).subscribe((todo) => {
      expect(todo.title).toBe('Overridden')
      expect(todo.priority).toBe('high')
    })
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${apiUrl}/templates/${templateId}/create-todo` &&
        r.method === 'POST'
    )
    expect(req.request.body).toEqual(body)
    req.flush({
      id: 2,
      userId: 1,
      title: 'Overridden',
      description: null,
      completed: false,
      priority: 'high',
      dueDate: null,
      sortOrder: 0,
      projectId: null,
      archived: false,
      archivedAt: null,
      createdAt: '',
      updatedAt: '',
    })
  })
})
