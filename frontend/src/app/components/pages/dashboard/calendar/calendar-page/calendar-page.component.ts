import { Component, OnDestroy } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Subject, takeUntil } from 'rxjs'
import type { EventInput } from '@fullcalendar/core'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import { TodoService } from '../../../../../services/todo.service'
import { todosToCalendarEvents } from '../../../../../utils/todo-calendar-events'
import type { Todo } from '../../../../../models/todo.interface'
import { CalendarViewComponent, type CalendarDateRange } from '../calendar-view/calendar-view.component'
import { TodoCalendarDetailDialogComponent } from '../todo-calendar-detail-dialog/todo-calendar-detail-dialog.component'

/**
 * カレンダーで Todo の期限を表示し、イベントクリックで詳細ダイアログを開く。
 * ダッシュボードへのルート登録は 12.10 で行う（本コンポーネントを lazy load する想定）。
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

  private range: CalendarDateRange | null = null
  private destroy$ = new Subject<void>()

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

  onTodoClick(todoId: number): void {
    this.dialog.open(TodoCalendarDetailDialogComponent, {
      width: '440px',
      data: { todoId }
    })
  }

  private loadTodos(): void {
    if (!this.range) return
    this.loading = true
    this.error = null
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
