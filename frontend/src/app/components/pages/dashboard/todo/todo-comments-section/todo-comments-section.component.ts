import { Component, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { finalize, take } from 'rxjs/operators'
import { CommentService } from '../../../../../services/comment.service'
import type { Comment } from '../../../../../models/comment.interface'
import { CommentFormComponent } from '../comment-form/comment-form.component'
import { CommentListComponent } from '../comment-list/comment-list.component'

@Component({
  selector: 'app-todo-comments-section',
  standalone: true,
  imports: [CommonModule, CommentFormComponent, CommentListComponent],
  templateUrl: './todo-comments-section.component.html',
  styleUrls: ['./todo-comments-section.component.scss'],
})
export class TodoCommentsSectionComponent implements OnChanges {
  private commentService = inject(CommentService)

  @ViewChild(CommentFormComponent) private formRef?: CommentFormComponent

  @Input({ required: true }) todoId!: number

  expanded = false
  comments: Comment[] = []
  loading = false
  submitting = false
  busyCommentId: number | null = null
  error: string | null = null

  private loadedForTodoId: number | null = null

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todoId'] && !changes['todoId'].firstChange) {
      this.loadedForTodoId = null
      this.comments = []
      if (this.expanded) {
        this.loadComments()
      }
    }
  }

  toggle(): void {
    this.expanded = !this.expanded
    if (this.expanded && this.loadedForTodoId !== this.todoId) {
      this.loadComments()
    }
  }

  loadComments(): void {
    this.loading = true
    this.error = null
    this.commentService
      .listByTodo(this.todoId)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false
        }),
      )
      .subscribe({
        next: (list) => {
          this.comments = list
          this.loadedForTodoId = this.todoId
        },
        error: () => {
          this.error = 'コメントの読み込みに失敗しました。'
        },
      })
  }

  onFormSubmit(content: string): void {
    this.submitting = true
    this.error = null
    this.commentService
      .create(this.todoId, { content })
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false
        }),
      )
      .subscribe({
        next: () => {
          this.formRef?.reset()
          this.loadComments()
        },
        error: () => {
          this.error = '投稿に失敗しました。'
        },
      })
  }

  onDelete(commentId: number): void {
    if (!window.confirm('このコメントを削除しますか？')) return
    this.busyCommentId = commentId
    this.error = null
    this.commentService
      .delete(commentId)
      .pipe(
        take(1),
        finalize(() => {
          this.busyCommentId = null
        }),
      )
      .subscribe({
        next: () => this.loadComments(),
        error: () => {
          this.error = '削除に失敗しました。'
        },
      })
  }

  onSaved(payload: { id: number; content: string }): void {
    this.busyCommentId = payload.id
    this.error = null
    this.commentService
      .update(payload.id, { content: payload.content })
      .pipe(
        take(1),
        finalize(() => {
          this.busyCommentId = null
        }),
      )
      .subscribe({
        next: () => this.loadComments(),
        error: () => {
          this.error = '更新に失敗しました。'
        },
      })
  }
}
