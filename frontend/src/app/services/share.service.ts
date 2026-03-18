import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type { Todo } from '../models/todo.interface'
import type { SharedTodo, SharePermission, TodoShare } from '../models/share.interface'

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  /**
   * 指定 Todo を他ユーザーへ共有する（所有者のみ）。
   * 既に共有済みの場合は permission を更新する。
   */
  shareTodo(
    todoId: number,
    sharedWithUserId: number,
    permission: SharePermission = 'view'
  ): Observable<TodoShare> {
    return this.http.post<TodoShare>(`${this.apiUrl}/todos/${todoId}/share`, {
      sharedWithUserId,
      permission
    })
  }

  /**
   * 自分が共有を受けている Todo の一覧を取得する。
   * 返却データは `sharedPermission` を含む。
   */
  getSharedTodos(): Observable<SharedTodo<Todo>[]> {
    return this.http.get<SharedTodo<Todo>[]>(`${this.apiUrl}/todos/shared`)
  }

  /**
   * 指定 share を解除する（Todo 所有者のみ）。
   */
  deleteShare(shareId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/shares/${shareId}`)
  }
}

