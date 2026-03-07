import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { TodoService } from '../../../../../services/todo.service'
import { TagService } from '../../../../../services/tag.service'
import { TodoListComponent } from '../todo-list/todo-list.component'
import { TodoFormComponent } from '../todo-form/todo-form.component'
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { SortSelectorComponent } from '../sort-selector/sort-selector.component'
import { BulkActionBarComponent } from '../bulk-action-bar/bulk-action-bar.component'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import {
  AdvancedSearchDialogComponent,
  type AdvancedSearchDialogData
} from '../advanced-search-dialog/advanced-search-dialog.component'
import type { Todo, TodoCreateUpdate, TodoPriority } from '../../../../../models/todo.interface'
import type { Tag } from '../../../../../models/tag.interface'
import type { SortBy, SortOrder } from '../../../../../models/sort-options.interface'
import type { SearchParams } from '../../../../../models/search-params.interface'

@Component({
  selector: 'app-todo-page',
  standalone: true,
  imports: [
    CommonModule,
    TodoListComponent,
    TodoFormComponent,
    SearchBarComponent,
    SortSelectorComponent,
    BulkActionBarComponent,
    CardComponent
  ],
  templateUrl: './todo-page.component.html',
  styleUrls: ['./todo-page.component.scss']
})
export default class TodoPageComponent implements OnInit, OnDestroy {
  todos: Todo[] = []
  loading = false
  error: string | null = null
  editingTodo: Todo | null = null

  filterCompleted: boolean | null = null
  filterPriority: TodoPriority | null = null
  filterTagIds: number[] = []
  searchQuery = ''
  sortBy: SortBy = 'createdAt'
  sortOrder: SortOrder = 'asc'
  selectedIds: number[] = []
  allTags: Tag[] = []

  private destroy$ = new Subject<void>()

  constructor(
    private todoService: TodoService,
    private tagService: TagService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTags()
    this.loadTodos()
  }

  loadTags(): void {
    this.tagService.getTags().pipe(takeUntil(this.destroy$)).subscribe({
      next: (tags) => { this.allTags = tags },
      error: () => { this.allTags = [] }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadTodos(): void {
    this.loading = true
    this.error = null
    const filters: { completed?: boolean; priority?: TodoPriority; tagIds?: number[] } = {}
    if (this.filterCompleted !== null) filters.completed = this.filterCompleted
    if (this.filterPriority !== null) filters.priority = this.filterPriority
    if (this.filterTagIds.length > 0) filters.tagIds = this.filterTagIds
    const sort = { sortBy: this.sortBy, sortOrder: this.sortOrder }

    const q = this.searchQuery.trim()
    const searchParams = q ? { q, ...filters } : null
    const req = searchParams
      ? this.todoService.search(searchParams, sort)
      : this.todoService.list(filters, sort)

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
    this.selectedIds = []
    this.loadTodos()
  }

  openAdvancedSearch(): void {
    const data: AdvancedSearchDialogData = {
      currentParams: {
        q: this.searchQuery,
        completed: this.filterCompleted ?? undefined,
        priority: this.filterPriority ?? undefined,
        tagIds: this.filterTagIds.length > 0 ? [...this.filterTagIds] : undefined
      },
      allTags: this.allTags
    }
    const ref = this.dialog.open(AdvancedSearchDialogComponent, {
      width: '400px',
      data
    })
    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((params: SearchParams | undefined) => {
      if (params == null) return
      this.searchQuery = params.q ?? ''
      this.filterCompleted = params.completed ?? null
      this.filterPriority = (params.priority ?? null) as TodoPriority | null
      this.filterTagIds = params.tagIds ?? []
      this.selectedIds = []
      this.loadTodos()
    })
  }

  onFiltersChange(): void {
    this.selectedIds = []
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
    this.filterPriority = value === '' ? null : (value as TodoPriority)
    this.onFiltersChange()
  }

  onSortChange(sort: { sortBy: SortBy; sortOrder: SortOrder }): void {
    this.sortBy = sort.sortBy
    this.sortOrder = sort.sortOrder
    this.selectedIds = []
    this.loadTodos()
  }

  toggleTagFilter(tagId: number): void {
    this.filterTagIds = this.filterTagIds.includes(tagId)
      ? this.filterTagIds.filter((id) => id !== tagId)
      : [...this.filterTagIds, tagId]
    this.selectedIds = []
    this.loadTodos()
  }

  isLight(hex: string): boolean {
    if (!hex || !hex.startsWith('#')) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
  }

  onTagRemoved(event: { todoId: number; tag: Tag }): void {
    this.todoService.removeTagFromTodo(event.todoId, event.tag.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadTodos(),
      error: (err) => { this.error = err?.error?.message ?? err?.message ?? 'タグの削除に失敗しました' }
    })
  }

  onTagAdded(event: { todoId: number; tagId: number }): void {
    this.todoService.addTagToTodo(event.todoId, event.tagId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.loadTodos() },
      error: (err) => { this.error = err?.error?.message ?? err?.message ?? 'タグの追加に失敗しました' }
    })
  }

  onReorder(todoIds: number[]): void {
    this.todoService
      .reorderTodos(todoIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadTodos(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '並び替えに失敗しました'
        }
      })
  }

  onSelectionChange(ids: number[]): void {
    this.selectedIds = ids
  }

  onBulkComplete(): void {
    if (this.selectedIds.length === 0) return
    this.todoService
      .bulkComplete(this.selectedIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedIds = []
          this.loadTodos()
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '一括完了に失敗しました'
        }
      })
  }

  onBulkDelete(): void {
    if (this.selectedIds.length === 0) return
    if (!confirm(`選択した ${this.selectedIds.length} 件の Todo を削除しますか？`)) return
    this.todoService
      .bulkDelete(this.selectedIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedIds = []
          this.loadTodos()
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '一括削除に失敗しました'
        }
      })
  }

  onBulkArchive(): void {
    if (this.selectedIds.length === 0) return
    this.todoService
      .bulkArchive(this.selectedIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedIds = []
          this.loadTodos()
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? '一括アーカイブに失敗しました'
        }
      })
  }

  onArchived(id: number): void {
    this.todoService
      .archiveTodo(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadTodos(),
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'アーカイブに失敗しました'
        }
      })
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
