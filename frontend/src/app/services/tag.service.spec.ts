import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { TagService } from './tag.service'
import type { CreateTagDto, UpdateTagDto } from '../models/tag.interface'

describe('TagService (1.26.1)', () => {
  let service: TagService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TagService],
    })
    service = TestBed.inject(TagService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call POST /tags with body for create', () => {
    const body: CreateTagDto = { name: 'work', color: '#ff0000' }
    service.create(body).subscribe((tag) => expect(tag.id).toBe(1))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/tags` && r.method === 'POST')
    expect(req.request.body).toEqual(body)
    req.flush({ id: 1, userId: 1, name: 'work', color: '#ff0000', createdAt: '', updatedAt: '' })
  })

  it('should call GET /tags for getTags', () => {
    service.getTags().subscribe((list) => expect(list).toEqual([]))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/tags` && r.method === 'GET')
    req.flush([])
  })

  it('should call GET /tags/:id for getById', () => {
    const id = 5
    service.getById(id).subscribe((tag) => expect(tag.id).toBe(id))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/tags/${id}` && r.method === 'GET')
    req.flush({ id, userId: 1, name: 'x', color: '#000', createdAt: '', updatedAt: '' })
  })

  it('should call PUT /tags/:id with body for update', () => {
    const id = 3
    const body: UpdateTagDto = { name: 'updated' }
    service.update(id, body).subscribe((tag) => expect(tag.name).toBe('updated'))
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/tags/${id}` && r.method === 'PUT')
    expect(req.request.body).toEqual(body)
    req.flush({ id, userId: 1, name: 'updated', color: '#000', createdAt: '', updatedAt: '' })
  })

  it('should call DELETE /tags/:id for delete', () => {
    const id = 2
    service.delete(id).subscribe()
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/tags/${id}` && r.method === 'DELETE')
    req.flush(null)
  })
})
