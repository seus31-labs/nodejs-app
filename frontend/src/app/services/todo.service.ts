import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type { Todo, TodoCreateUpdate } from '../models/todo.interface'

export interface TodoListFilters {
  completed?: boolean
  priority?: string
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  create(body: TodoCreateUpdate): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, body)
  }

  list(filters?: TodoListFilters): Observable<Todo[]> {
    let params: Record<string, string> = {}
    if (filters?.completed !== undefined) {
      params['completed'] = String(filters.completed)
    }
    if (filters?.priority) {
      params['priority'] = filters.priority
    }
    const options = Object.keys(params).length ? { params } : {}
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`, options)
  }

  getById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/todos/${id}`)
  }

  update(id: number, body: TodoCreateUpdate): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/todos/${id}`, body)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/${id}`)
  }

  toggleComplete(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/todos/${id}/toggle`, {})
  }
}
