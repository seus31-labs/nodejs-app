import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { HttpEventType } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { AttachmentService } from './attachment.service'
import type { Attachment } from '../models/attachment.interface'

describe('AttachmentService (8.15.1)', () => {
  let service: AttachmentService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AttachmentService]
    })
    service = TestBed.inject(AttachmentService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('getAttachments should GET /todos/:id/attachments', () => {
    const todoId = 3
    const mock: Attachment[] = []
    service.getAttachments(todoId).subscribe((list) => expect(list).toEqual(mock))
    const req = httpMock.expectOne(`${apiUrl}/todos/${todoId}/attachments`)
    expect(req.request.method).toBe('GET')
    req.flush(mock)
  })

  it('deleteAttachment should DELETE /attachments/:id', () => {
    service.deleteAttachment(9).subscribe(() => undefined)
    const req = httpMock.expectOne(`${apiUrl}/attachments/9`)
    expect(req.request.method).toBe('DELETE')
    req.flush(null, { status: 204, statusText: 'No Content' })
  })

  it('uploadAttachmentWithProgress should POST multipart as events', () => {
    const file = new File(['dummy'], 'a.png', { type: 'image/png' })
    const todoId = 8
    service.uploadAttachmentWithProgress(todoId, file).subscribe()

    const req = httpMock.expectOne(`${apiUrl}/todos/${todoId}/attachments`)
    expect(req.request.method).toBe('POST')
    expect(req.request.reportProgress).toBeTrue()
    expect(req.request.responseType).toBe('json')
    expect(req.request.body instanceof FormData).toBeTrue()
    req.event({ type: HttpEventType.UploadProgress, loaded: 1, total: 1 })
    req.flush({} as Attachment)
  })

  it('uploadAttachment should map response body', () => {
    const file = new File(['dummy'], 'a.png', { type: 'image/png' })
    const todoId = 2
    const mock: Attachment = {
      id: 1,
      todoId,
      fileName: 'a.png',
      fileSize: 1,
      mimeType: 'image/png',
      fileUrl: '/uploads/1/a.png',
      createdAt: '2026-01-01T00:00:00.000Z'
    }

    service.uploadAttachment(todoId, file).subscribe((res) => expect(res).toEqual(mock))
    const req = httpMock.expectOne(`${apiUrl}/todos/${todoId}/attachments`)
    req.flush(mock)
  })

  it('downloadAttachment should GET blob URL', () => {
    const targetUrl = 'https://example.test/uploads/a.png'
    service.downloadAttachment(targetUrl).subscribe()
    const req = httpMock.expectOne(targetUrl)
    expect(req.request.method).toBe('GET')
    expect(req.request.responseType).toBe('blob')
    req.flush(new Blob())
  })
})
