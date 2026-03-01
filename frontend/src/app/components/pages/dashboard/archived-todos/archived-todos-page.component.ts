import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TodoService } from '../../../../services/todo.service'
import { CardComponent } from '../../../../theme/shared/components/card/card.component'
import type { Todo } from '../../../../models/todo.interface'

@Component({
  selector: 'app-archived-todos-page',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './archived-todos-page.component.html',
  styleUrls: ['./archived-todos-page.component.scss']
})
export default class ArchivedTodosPageComponent implements OnInit, OnDestroy {
  todos: Todo[] = []
  loading = false
  error: string | null = null

  private destroy$ = new Subject<void>()

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadArchived()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadArchived(): void {
    this.loading = true
    this.error = null
    this.todoService
      .getArchivedTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.todos = list
          this.loading = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '取得に失敗しました'
          this.loading = false
        }
      })
  }

  onUnarchive(id: number): void {
    this.todoService
      .unarchiveTodo(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadArchived(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'アーカイブ解除に失敗しました'
        }
      })
  }

  onDeleteAll(): void {
    if (!confirm('アーカイブ済みの Todo をすべて削除しますか？この操作は取り消せません。')) return
    this.todoService
      .deleteArchivedTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadArchived(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '一括削除に失敗しました'
        }
      })
  }

  formatArchivedAt(archivedAt: string | null): string {
    if (!archivedAt) return ''
    const d = new Date(archivedAt)
    return d.toLocaleString('ja-JP')
  }
}
