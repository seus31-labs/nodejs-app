import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type { Tag, CreateTagDto, UpdateTagDto } from '../models/tag.interface'

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  create(body: CreateTagDto): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/tags`, body)
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`)
  }

  getById(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/tags/${id}`)
  }

  update(id: number, body: UpdateTagDto): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/tags/${id}`, body)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tags/${id}`)
  }
}
