import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import type { Comment, CreateCommentDto, UpdateCommentDto } from '../models/comment.interface'

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  listByTodo(todoId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/todos/${todoId}/comments`)
  }

  create(todoId: number, body: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/todos/${todoId}/comments`, body)
  }

  update(commentId: number, body: UpdateCommentDto): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}`, body)
  }

  delete(commentId: number): Observable<void> {
    return this.http.delete(`${this.apiUrl}/comments/${commentId}`, { observe: 'response' }).pipe(map(() => undefined))
  }
}
