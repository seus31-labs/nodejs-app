import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectProgress,
} from '../models/project.interface'
import type { Todo } from '../models/todo.interface'

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  create(body: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, body)
  }

  getAll(includeArchived = false): Observable<Project[]> {
    const params: Record<string, string> = {}
    if (includeArchived) params['includeArchived'] = 'true'
    return this.http.get<Project[]>(`${this.apiUrl}/projects`, { params })
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`)
  }

  update(id: number, body: UpdateProjectDto): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/projects/${id}`, body)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${id}`)
  }

  getProjectTodos(id: number): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/projects/${id}/todos`)
  }

  getProjectProgress(id: number): Observable<ProjectProgress> {
    return this.http.get<ProjectProgress>(`${this.apiUrl}/projects/${id}/progress`)
  }

  archive(id: number): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/projects/${id}/archive`, {})
  }
}
