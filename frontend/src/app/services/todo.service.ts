import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type { Todo, TodoCreateUpdate, TodoPriority } from '../models/todo.interface'
import type { SearchParams } from '../models/search-params.interface'

export interface TodoListFilters {
  completed?: boolean
  priority?: TodoPriority
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

  /**
   * タイトル・説明で検索（q 必須。completed, priority で絞り込み可）
   */
  search(params: SearchParams): Observable<Todo[]> {
    const p: Record<string, string> = { q: params.q.trim() }
    if (params.completed !== undefined) p['completed'] = String(params.completed)
    if (params.priority) p['priority'] = params.priority
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/search`, { params: p })
  }
}
