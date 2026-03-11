import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ImportService } from './import.service'
import { environment } from '../../environments/environment'

describe('ImportService (17.18)', () => {
  let service: ImportService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImportService]
    })
    service = TestBed.inject(ImportService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call POST /todos/import with json format and data', () => {
    service.import('json', { todos: [] }).subscribe((res) => {
      expect(res.created).toBe(0)
      expect(res.failed).toBe(0)
    })
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/import` && r.method === 'POST')
    expect(req.request.body).toEqual({ format: 'json', data: { todos: [] } })
    req.flush({ created: 0, failed: 0 })
  })

  it('should call POST /todos/import with csv format and string data', () => {
    const csv = 'title,description\nA,B'
    service.import('csv', csv).subscribe((res) => {
      expect(res.created).toBe(1)
    })
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/import` && r.method === 'POST')
    expect(req.request.body).toEqual({ format: 'csv', data: csv })
    req.flush({ created: 1, failed: 0 })
  })
})
