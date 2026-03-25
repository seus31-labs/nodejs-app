import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, from } from 'rxjs'
import { tap } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import type { Todo, TodoCreateUpdate, TodoPriority } from '../models/todo.interface'
import type { SearchParams } from '../models/search-params.interface'
import type { SortOptions } from '../models/sort-options.interface'
import { NetworkStatusService } from './network-status.service'
import { OfflineStorageService } from './offline-storage.service'

export interface TodoListFilters {
  completed?: boolean
  priority?: TodoPriority
  tagIds?: number[]
  projectId?: number | null
  /** GET /todos の startDate / endDate（DATEONLY、カレンダー範囲用） */
  startDate?: string
  endDate?: string
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiUrl

  constructor(
    private http: HttpClient,
    private networkStatus: NetworkStatusService,
    private offlineStorage: OfflineStorageService
  ) {}

  create(body: TodoCreateUpdate): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, body)
  }

  /**
   * Todo 一覧取得。オンライン時は API を呼び出し成功時にオフラインキャッシュへ保存。
   * オフライン時はキャッシュから返す（20.6）。
   */
  list(filters?: TodoListFilters, sort?: SortOptions): Observable<Todo[]> {
    if (!this.networkStatus.isOnline) {
      return from(this.offlineStorage.getTodos())
    }
    const params: Record<string, string> = {}
    if (filters?.completed !== undefined) params['completed'] = String(filters.completed)
    if (filters?.priority) params['priority'] = filters.priority
    if (filters?.tagIds?.length) params['tags'] = filters.tagIds.join(',')
    if (filters?.projectId != null) params['projectId'] = String(filters.projectId)
    if (filters?.startDate) params['startDate'] = filters.startDate
    if (filters?.endDate) params['endDate'] = filters.endDate
    if (sort?.sortBy) params['sortBy'] = sort.sortBy
    if (sort?.sortOrder) params['sortOrder'] = sort.sortOrder
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`, { params }).pipe(
      tap((todos) => {
        this.offlineStorage.saveTodos(todos).catch(() => {
          // キャッシュ保存失敗はメイン機能に影響させない（silent fail）
        })
      })
    )
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

  getDueSoonTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/due-soon`)
  }

  toggleReminder(id: number, enabled: boolean): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/todos/${id}/reminder`, { enabled })
  }

  /**
   * タイトル・説明で検索（q 必須。completed, priority, sort で絞り込み・ソート可）
   */
  search(params: SearchParams, sort?: SortOptions): Observable<Todo[]> {
    const p: Record<string, string> = { q: params.q.trim() }
    if (params.completed !== undefined) p['completed'] = String(params.completed)
    if (params.priority) p['priority'] = params.priority
    if (params.tagIds?.length) p['tags'] = params.tagIds.join(',')
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

  archiveTodo(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/todos/${id}/archive`, {})
  }

  unarchiveTodo(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/todos/${id}/unarchive`, {})
  }

  getArchivedTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/archived`)
  }

  deleteArchivedTodos(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/archived`)
  }

  bulkComplete(todoIds: number[]): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(`${this.apiUrl}/todos/bulk-complete`, { todoIds })
  }

  bulkDelete(todoIds: number[]): Observable<{ deleted: number }> {
    return this.http.post<{ deleted: number }>(`${this.apiUrl}/todos/bulk-delete`, { todoIds })
  }

  bulkArchive(todoIds: number[]): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(`${this.apiUrl}/todos/bulk-archive`, { todoIds })
  }

  bulkAddTag(todoIds: number[], tagId: number): Observable<{ added: number }> {
    return this.http.post<{ added: number }>(`${this.apiUrl}/todos/bulk-add-tag`, {
      todoIds,
      tagId
    })
  }

  addTagToTodo(todoId: number, tagId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/todos/${todoId}/tags`, { tagId })
  }

  removeTagFromTodo(todoId: number, tagId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/${todoId}/tags/${tagId}`)
  }

  /**
   * 指定 Todo のサブタスク一覧を取得する。
   * Backend は `GET /api/v1/todos/:id/subtasks` で `parentId === todoId` の Todo を返す。
   */
  getSubtasks(todoId: number): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/${todoId}/subtasks`)
  }
}
