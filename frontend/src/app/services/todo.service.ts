import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type { Todo, TodoCreateUpdate, TodoPriority } from '../models/todo.interface'
import type { SearchParams } from '../models/search-params.interface'
import type { SortOptions } from '../models/sort-options.interface'

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

  list(filters?: TodoListFilters, sort?: SortOptions): Observable<Todo[]> {
    const params: Record<string, string> = {}
    if (filters?.completed !== undefined) params['completed'] = String(filters.completed)
    if (filters?.priority) params['priority'] = filters.priority
    if (sort?.sortBy) params['sortBy'] = sort.sortBy
    if (sort?.sortOrder) params['sortOrder'] = sort.sortOrder
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`, { params })
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
   * タイトル・説明で検索（q 必須。completed, priority, sort で絞り込み・ソート可）
   */
  search(params: SearchParams, sort?: SortOptions): Observable<Todo[]> {
    const p: Record<string, string> = { q: params.q.trim() }
    if (params.completed !== undefined) p['completed'] = String(params.completed)
    if (params.priority) p['priority'] = params.priority
    if (sort?.sortBy) p['sortBy'] = sort.sortBy
    if (sort?.sortOrder) p['sortOrder'] = sort.sortOrder
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/search`, { params: p })
  }

  /**
   * カスタム並び順を保存（sortBy=sortOrder のときの手動並び替え用）
   */
  reorderTodos(todoIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/todos/reorder`, { todoIds })
  }
}
