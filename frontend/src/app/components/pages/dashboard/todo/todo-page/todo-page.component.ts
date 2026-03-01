import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TodoService } from '../../../../../services/todo.service'
import { TodoListComponent } from '../todo-list/todo-list.component'
import { TodoFormComponent } from '../todo-form/todo-form.component'
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import type { Todo, TodoCreateUpdate, TodoPriority } from '../../../../../models/todo.interface'

@Component({
  selector: 'app-todo-page',
  standalone: true,
  imports: [CommonModule, TodoListComponent, TodoFormComponent, SearchBarComponent, CardComponent],
  templateUrl: './todo-page.component.html',
  styleUrls: ['./todo-page.component.scss']
})
export default class TodoPageComponent implements OnInit, OnDestroy {
  todos: Todo[] = []
  loading = false
  error: string | null = null
  editingTodo: Todo | null = null

  filterCompleted: boolean | null = null
  filterPriority: string | null = null
  searchQuery = ''

  private destroy$ = new Subject<void>()

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadTodos(): void {
    this.loading = true
    this.error = null
    const filters: { completed?: boolean; priority?: string } = {}
    if (this.filterCompleted !== null) filters.completed = this.filterCompleted
    if (this.filterPriority !== null) filters.priority = this.filterPriority

    const q = this.searchQuery.trim()
    const searchParams = q
      ? {
          q,
          completed: filters.completed,
          priority: filters.priority as TodoPriority | undefined,
        }
      : null
    const req = searchParams
      ? this.todoService.search(searchParams)
      : this.todoService.list(filters)

    req.pipe(takeUntil(this.destroy$)).subscribe({
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

  onSearch(term: string): void {
    this.searchQuery = term
    this.loadTodos()
  }

  onFiltersChange(): void {
    this.loadTodos()
  }

  /** 完了フィルタの表示値（テンプレート用） */
  get completedFilterValue(): string {
    if (this.filterCompleted === null) return ''
    return this.filterCompleted ? 'true' : 'false'
  }

  /** 優先度フィルタの表示値（テンプレート用） */
  get priorityFilterValue(): string {
    return this.filterPriority !== null ? this.filterPriority : ''
  }

  onCompletedFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value
    this.filterCompleted = value === '' ? null : value === 'true'
    this.onFiltersChange()
  }

  onPriorityFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value
    this.filterPriority = value === '' ? null : value
    this.onFiltersChange()
  }

  onToggle(id: number): void {
    this.todoService
      .toggleComplete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadTodos(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '更新に失敗しました'
        }
      })
  }

  onEdit(todo: Todo): void {
    this.editingTodo = todo
  }

  onCancelEdit(): void {
    this.editingTodo = null
  }

  onSubmitForm(payload: TodoCreateUpdate): void {
    if (this.editingTodo) {
      this.todoService
        .update(this.editingTodo.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.editingTodo = null
            this.loadTodos()
          },
          error: (err) => {
            this.error = err?.error?.message ?? err?.message ?? '更新に失敗しました'
          }
        })
    } else {
      this.todoService
        .create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadTodos(),
          error: (err) => {
            this.error = err?.error?.message ?? err?.message ?? '作成に失敗しました'
          }
        })
    }
  }

  onDelete(id: number): void {
    if (!confirm('この Todo を削除しますか？')) return
    this.todoService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.editingTodo?.id === id) this.editingTodo = null
          this.loadTodos()
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '削除に失敗しました'
        }
      })
  }
}
