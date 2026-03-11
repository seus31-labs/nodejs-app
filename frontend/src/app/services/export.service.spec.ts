import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ExportService } from './export.service'
import { environment } from '../../environments/environment'

describe('ExportService (17.18)', () => {
  let service: ExportService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExportService]
    })
    service = TestBed.inject(ExportService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call GET /todos/export?format=json and return Blob', () => {
    const blob = new Blob(['{}'], { type: 'application/json' })
    service.getExportBlob('json').subscribe((res) => {
      expect(res).toBe(blob)
    })
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/export` && r.params.get('format') === 'json')
    expect(req.request.method).toBe('GET')
    req.flush(blob)
  })

  it('should call GET /todos/export?format=csv and return Blob', () => {
    const blob = new Blob(['title,'], { type: 'text/csv' })
    service.getExportBlob('csv').subscribe((res) => {
      expect(res).toBe(blob)
    })
    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos/export` && r.params.get('format') === 'csv')
    expect(req.request.method).toBe('GET')
    req.flush(blob)
  })

  it('should trigger download without throwing', () => {
    const blob = new Blob(['test'])
    expect(() => service.triggerDownload(blob, 'test.json')).not.toThrow()
  })
})
