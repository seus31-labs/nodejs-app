import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Subject, takeUntil } from 'rxjs'
import { TodoService } from '../../../../../services/todo.service'
import type { Todo, TodoPriority } from '../../../../../models/todo.interface'

export interface TodoCalendarDetailDialogData {
  todoId: number
}

@Component({
  selector: 'app-todo-calendar-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './todo-calendar-detail-dialog.component.html',
  styleUrl: './todo-calendar-detail-dialog.component.scss'
})
export class TodoCalendarDetailDialogComponent implements OnInit, OnDestroy {
  todo: Todo | null = null
  loading = true
  error: string | null = null

  private destroy$ = new Subject<void>()

  constructor(
    public dialogRef: MatDialogRef<TodoCalendarDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TodoCalendarDetailDialogData,
    private todoService: TodoService
  ) {}

  ngOnInit(): void {
    this.todoService
      .getById(this.data.todoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (t) => {
          this.todo = t
          this.loading = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '取得に失敗しました。'
          this.loading = false
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  priorityLabel(p: TodoPriority): string {
    switch (p) {
      case 'low':
        return '低'
      case 'medium':
        return '中'
      case 'high':
        return '高'
      default:
        return p
    }
  }

  formatDueDate(due: string | null): string {
    if (!due) return '—'
    const s = due.trim().slice(0, 10)
    const d = new Date(s + 'T12:00:00')
    if (Number.isNaN(d.getTime())) return due
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
  }
}
