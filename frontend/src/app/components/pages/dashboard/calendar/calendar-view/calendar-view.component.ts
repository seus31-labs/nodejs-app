import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FullCalendarModule } from '@fullcalendar/angular'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DatesSetArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import { CalendarOptions } from '@fullcalendar/core'
import jaLocale from '@fullcalendar/core/locales/ja'

export interface CalendarDateRange {
  startDate: string
  endDate: string
}

/**
 * カレンダー上でイベントをドロップしたときに親へ渡す。
 * API 失敗時は `revert` で FullCalendar の表示を元に戻す。
 */
export interface CalendarTodoMoveEvent {
  todoId: number
  /** ドロップ先の日付（YYYY-MM-DD、終日イベント） */
  dueDate: string
  revert: () => void
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent {
  @Input() events: EventInput[] = []
  @Input() loading = false
  @Input() error: string | null = null

  @Output() dateRangeChange = new EventEmitter<CalendarDateRange>()
  @Output() todoClick = new EventEmitter<number>()
  @Output() todoMove = new EventEmitter<CalendarTodoMoveEvent>()

  readonly calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: jaLocale,
    height: 'auto',
    // interactionPlugin のドラッグを有効化。startEditable / durationEditable は各イベントで制御する（12.8）
    editable: true,
    dayMaxEvents: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    datesSet: (arg) => this.onDatesSet(arg),
    eventClick: (arg) => this.onEventClick(arg),
    eventDrop: (arg) => this.onEventDrop(arg)
  }

  onDatesSet(arg: DatesSetArg): void {
    this.dateRangeChange.emit({
      startDate: this.toIsoDate(arg.start),
      endDate: this.toIsoDate(new Date(arg.end.getTime() - 1))
    })
  }

  onEventClick(arg: EventClickArg): void {
    const todoId = Number(arg.event.extendedProps['todoId'])
    if (!Number.isFinite(todoId)) return
    this.todoClick.emit(todoId)
  }

  onEventDrop(arg: EventDropArg): void {
    const todoId = Number(arg.event.extendedProps['todoId'])
    if (!Number.isFinite(todoId)) {
      arg.revert()
      return
    }
    const start = arg.event.start
    if (!start) {
      arg.revert()
      return
    }
    this.todoMove.emit({
      todoId,
      dueDate: this.toIsoDate(start),
      revert: () => arg.revert()
    })
  }

  private toIsoDate(value: Date): string {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
}
