import { Injectable } from '@angular/core'
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http'
import { Observable, filter, map } from 'rxjs'
import { environment } from '../../environments/environment'
import type { Attachment } from '../models/attachment.interface'

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  uploadAttachment(todoId: number, file: File): Observable<Attachment> {
    return this.uploadAttachmentWithProgress(todoId, file).pipe(
      filter((event): event is HttpResponse<Attachment> => event.type === HttpEventType.Response),
      map((event) => {
        if (!event.body) {
          throw new Error('Attachment response body is empty')
        }
        return event.body
      })
    )
  }

  uploadAttachmentWithProgress(todoId: number, file: File): Observable<HttpEvent<Attachment>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.http.post<Attachment>(`${this.apiUrl}/todos/${todoId}/attachments`, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  getAttachments(todoId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/todos/${todoId}/attachments`)
  }

  deleteAttachment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/attachments/${id}`)
  }
}
