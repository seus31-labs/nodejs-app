import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import type { Todo, CreateTodoDto } from '../../models/todo.interface'
import { TodoService } from '../../services/todo.service'

@Component({
  selector: 'app-subtask-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subtask-list.component.html',
  styleUrl: './subtask-list.component.scss'
})
export default class SubtaskListComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) parentId!: number

  @Output() subtasksUpdated = new EventEmitter<Todo[]>()

  subtasks: Todo[] = []
  loading = false
  error: string | null = null

  /** 追加フォームの表示切り替え */
  adding = false
  newTitle = ''
  creating = false

  private destroy$ = new Subject<void>()

  constructor(private todoService: TodoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentId']) {
      void this.load()
    }
  }

  private load(): void {
    if (!Number.isInteger(this.parentId) || this.parentId <= 0) {
      this.subtasks = []
      return
    }

    this.loading = true
    this.error = null
    this.todoService
      .getSubtasks(this.parentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.subtasks = list
          this.subtasksUpdated.emit(list)
          this.loading = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'サブタスクの取得に失敗しました'
          this.loading = false
        }
      })
  }

  ngOnDestroy(): void {
    // takeUntil を適切に完了させ、購読をクリーンアップするため。
    this.destroy$.next()
    this.destroy$.complete()
  }

  toggle(subtaskId: number): void {
    this.todoService
      .toggleComplete(subtaskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.subtasks = this.subtasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
          this.subtasksUpdated.emit(this.subtasks)
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '更新に失敗しました'
        }
      })
  }

  onAddClick(): void {
    this.adding = true
    this.newTitle = ''
  }

  cancelAdd(): void {
    this.adding = false
    this.newTitle = ''
  }

  create(): void {
    const title = this.newTitle.trim()
    if (!title || this.creating) return

    const payload: CreateTodoDto = { title }
    this.creating = true
    this.todoService
      .createSubtask(this.parentId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.subtasks = [...this.subtasks, created]
          this.subtasksUpdated.emit(this.subtasks)
          this.adding = false
          this.newTitle = ''
          this.creating = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'サブタスク作成に失敗しました'
          this.creating = false
        }
      })
  }
}

