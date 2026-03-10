import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateTodoFromTemplateDto,
} from '../models/template.interface'
import type { Todo } from '../models/todo.interface'

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  create(body: CreateTemplateDto): Observable<Template> {
    return this.http.post<Template>(`${this.apiUrl}/templates`, body)
  }

  getAll(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.apiUrl}/templates`)
  }

  getById(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/templates/${id}`)
  }

  update(id: number, body: UpdateTemplateDto): Observable<Template> {
    return this.http.put<Template>(`${this.apiUrl}/templates/${id}`, body)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${id}`)
  }

  createTodoFromTemplate(
    templateId: number,
    body?: CreateTodoFromTemplateDto
  ): Observable<Todo> {
    return this.http.post<Todo>(
      `${this.apiUrl}/templates/${templateId}/create-todo`,
      body ?? {}
    )
  }
}
