import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TodoService } from '../../../../services/todo.service'
import { TodoListComponent } from '../todo/todo-list/todo-list.component'
import { CardComponent } from '../../../../theme/shared/components/card/card.component'
import type { ReminderToggleEvent } from '../todo/todo-item/todo-item.component'
import type { Todo } from '../../../../models/todo.interface'

@Component({
  selector: 'app-recurring-todo-list-page',
  standalone: true,
  imports: [CommonModule, CardComponent, TodoListComponent],
  templateUrl: './recurring-todo-list-page.component.html',
  styleUrl: './recurring-todo-list-page.component.scss'
})
export default class RecurringTodoListPageComponent implements OnInit, OnDestroy {
  todos: Todo[] = []
  loading = false
  error: string | null = null

  private readonly destroy$ = new Subject<void>()

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadRecurringTodos()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadRecurringTodos(): void {
    this.loading = true
    this.error = null
    this.todoService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.todos = list.filter((todo) => todo.isRecurring === true)
          this.loading = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '取得に失敗しました'
          this.loading = false
        }
      })
  }

  onToggle(id: number): void {
    this.todoService
      .toggleComplete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadRecurringTodos(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '更新に失敗しました'
        }
      })
  }

  onArchive(id: number): void {
    this.todoService
      .archiveTodo(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadRecurringTodos(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'アーカイブに失敗しました'
        }
      })
  }

  onDelete(id: number): void {
    if (!confirm('この Todo を削除しますか？')) return
    this.todoService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadRecurringTodos(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '削除に失敗しました'
        }
      })
  }

  onReminderToggled(event: ReminderToggleEvent): void {
    this.todoService
      .toggleReminder(event.todoId, event.enabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.todos = this.todos.map((todo) => (todo.id === updated.id ? updated : todo))
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '更新に失敗しました'
        }
      })
  }
}
