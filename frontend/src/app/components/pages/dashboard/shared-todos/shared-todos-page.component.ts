import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ShareService } from '../../../../services/share.service'
import { CardComponent } from '../../../../theme/shared/components/card/card.component'
import type { Todo } from '../../../../models/todo.interface'
import type { SharedTodo, SharePermission } from '../../../../models/share.interface'

@Component({
  selector: 'app-shared-todos-page',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './shared-todos-page.component.html',
  styleUrls: ['./shared-todos-page.component.scss']
})
export default class SharedTodosPageComponent implements OnInit, OnDestroy {
  todos: SharedTodo<Todo>[] = []
  loading = false
  error: string | null = null

  private destroy$ = new Subject<void>()

  constructor(private shareService: ShareService) {}

  ngOnInit(): void {
    this.loadSharedTodos()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadSharedTodos(): void {
    this.loading = true
    this.error = null

    this.shareService
      .getSharedTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.todos = list
          this.loading = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '共有 Todo の取得に失敗しました'
          this.loading = false
        }
      })
  }

  permissionLabel(permission: SharePermission): string {
    return permission === 'edit' ? '編集可' : '閲覧のみ'
  }

  formatDueDate(dueDate: string | null): string {
    if (!dueDate) return '期限なし'
    return new Date(dueDate).toLocaleString('ja-JP')
  }
}
