import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import type { Todo } from '../../../../../models/todo.interface'
import { TodoService } from '../../../../../services/todo.service'
import { ProgressBarComponent } from '../../../../progress-bar/progress-bar.component'
import SubtaskListComponent from '../../../../subtask-list/subtask-list.component'
import { FileUploadComponent } from '../../../../file-upload/file-upload.component'
import { AttachmentListComponent } from '../../../../attachment-list/attachment-list.component'

@Component({
  selector: 'app-todo-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressBarComponent,
    SubtaskListComponent,
    FileUploadComponent,
    AttachmentListComponent
  ],
  templateUrl: './todo-detail-page.component.html',
  styleUrl: './todo-detail-page.component.scss'
})
export default class TodoDetailPageComponent implements OnInit, OnDestroy {
  todo: Todo | null = null
  loading = false
  error: string | null = null
  attachmentRefreshToken = 0
  private destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private todoService: TodoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    if (!Number.isInteger(id) || id <= 0) {
      this.error = '不正な Todo ID です'
      return
    }
    this.loadTodo(id)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onSubtasksUpdated(subtasks: Todo[]): void {
    if (!this.todo) return
    const completed = subtasks.filter((t) => t.completed).length
    this.todo = {
      ...this.todo,
      subtasks,
      progress: { completed, total: subtasks.length }
    }
  }

  onAttachmentUploaded(): void {
    this.attachmentRefreshToken += 1
  }

  private loadTodo(id: number): void {
    this.loading = true
    this.error = null
    this.todoService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (todo) => {
          this.todo = todo
          this.loading = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'Todo の取得に失敗しました'
          this.loading = false
        }
      })
  }
}

