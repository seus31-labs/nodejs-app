import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { ProjectService } from './project.service'
import type { CreateProjectDto, UpdateProjectDto } from '../models/project.interface'

describe('ProjectService (7.12)', () => {
  let service: ProjectService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  const mockProject = {
    id: 1,
    userId: 1,
    name: 'My Project',
    description: null,
    color: '#808080',
    archived: false,
    createdAt: '',
    updatedAt: '',
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService],
    })
    service = TestBed.inject(ProjectService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call POST /projects with body for create', () => {
    const body: CreateProjectDto = { name: 'New Project', color: '#ff0000' }
    service.create(body).subscribe((p) => expect(p.id).toBe(1))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects` && r.method === 'POST')
    expect(req.request.body).toEqual(body)
    req.flush(mockProject)
  })

  it('should call GET /projects without params for getAll()', () => {
    service.getAll().subscribe((list) => expect(list).toEqual([]))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects` && r.method === 'GET')
    expect(req.request.params.has('includeArchived')).toBe(false)
    req.flush([])
  })

  it('should call GET /projects?includeArchived=true for getAll(true)', () => {
    service.getAll(true).subscribe((list) => expect(list.length).toBe(1))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects` && r.method === 'GET')
    expect(req.request.params.get('includeArchived')).toBe('true')
    req.flush([mockProject])
  })

  it('should call GET /projects/:id for getById', () => {
    const id = 5
    service.getById(id).subscribe((p) => expect(p.id).toBe(id))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects/${id}` && r.method === 'GET')
    req.flush({ ...mockProject, id })
  })

  it('should call PUT /projects/:id with body for update', () => {
    const id = 3
    const body: UpdateProjectDto = { name: 'Updated' }
    service.update(id, body).subscribe((p) => expect(p.name).toBe('Updated'))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects/${id}` && r.method === 'PUT')
    expect(req.request.body).toEqual(body)
    req.flush({ ...mockProject, id, name: 'Updated' })
  })

  it('should call DELETE /projects/:id for delete', () => {
    const id = 2
    service.delete(id).subscribe()
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects/${id}` && r.method === 'DELETE')
    req.flush(null)
  })

  it('should call GET /projects/:id/todos for getProjectTodos', () => {
    const id = 4
    service.getProjectTodos(id).subscribe((list) => expect(list).toEqual([]))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects/${id}/todos` && r.method === 'GET')
    req.flush([])
  })

  it('should call GET /projects/:id/progress for getProjectProgress', () => {
    const id = 4
    service.getProjectProgress(id).subscribe((progress) => {
      expect(progress.total).toBe(5)
      expect(progress.completed).toBe(3)
    })
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects/${id}/progress` && r.method === 'GET')
    req.flush({ total: 5, completed: 3 })
  })

  it('should call PATCH /projects/:id/archive with empty body for archive', () => {
    const id = 6
    service.archive(id).subscribe((p) => expect(p.archived).toBe(true))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/projects/${id}/archive` && r.method === 'PATCH')
    expect(req.request.body).toEqual({})
    req.flush({ ...mockProject, id, archived: true })
  })
})
