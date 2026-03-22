import { Component, OnDestroy } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { Subject, takeUntil } from 'rxjs'
import type { EventInput } from '@fullcalendar/core'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import { TodoService } from '../../../../../services/todo.service'
import { todosToCalendarEvents } from '../../../../../utils/todo-calendar-events'
import type { Todo } from '../../../../../models/todo.interface'
import {
  CalendarViewComponent,
  type CalendarDateRange,
  type CalendarTodoMoveEvent
} from '../calendar-view/calendar-view.component'
import { TodoCalendarDetailDialogComponent } from '../todo-calendar-detail-dialog/todo-calendar-detail-dialog.component'

/**
 * カレンダーで Todo の期限を表示し、クリックで詳細・ドラッグで期限変更する。
 * `/dashboard/calendar` から lazy load される（dashboard-routing.module）。
 */
@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CardComponent, CalendarViewComponent],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss'
})
export default class CalendarPageComponent implements OnDestroy {
  todos: Todo[] = []
  loading = false
  error: string | null = null
  /** 一覧取得とは別に、ドラッグによる期限更新失敗だけを表示する */
  moveError: string | null = null

  private range: CalendarDateRange | null = null
  private destroy$ = new Subject<void>()
  private detailDialogRef: MatDialogRef<TodoCalendarDetailDialogComponent> | null = null

  constructor(
    private todoService: TodoService,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get calendarEvents(): EventInput[] {
    return todosToCalendarEvents(this.todos)
  }

  onDateRangeChange(range: CalendarDateRange): void {
    this.range = range
    // FullCalendar の datesSet は親の変更検知中に発火するため、loading 更新を次ティックへずらし NG0100 を避ける
    queueMicrotask(() => this.loadTodos())
  }

  /**
   * カレンダーでイベントをドロップしたときに期限を更新する。
   * TodoCreateUpdate の型上 title が必須のため、既存タイトルを送る（API は部分更新可）。
   */
  onTodoMove(ev: CalendarTodoMoveEvent): void {
    this.moveError = null
    const todo = this.todos.find((t) => t.id === ev.todoId)
    if (!todo) {
      ev.revert()
      this.moveError = 'Todo が見つかりません'
      return
    }
    this.todoService
      .update(ev.todoId, { title: todo.title, dueDate: ev.dueDate })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.todos = this.todos.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        },
        error: (err) => {
          ev.revert()
          this.moveError = err?.error?.message ?? err?.message ?? '期限の更新に失敗しました'
        }
      })
  }

  onTodoClick(todoId: number): void {
    this.moveError = null
    if (this.detailDialogRef) return
    this.detailDialogRef = this.dialog.open(TodoCalendarDetailDialogComponent, {
      width: '440px',
      data: { todoId }
    })
    this.detailDialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.detailDialogRef = null
    })
  }

  private loadTodos(): void {
    if (!this.range) return
    this.loading = true
    this.error = null
    this.moveError = null
    this.todoService
      .list(
        { startDate: this.range.startDate, endDate: this.range.endDate },
        { sortBy: 'dueDate', sortOrder: 'asc' }
      )
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
}
