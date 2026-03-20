import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FullCalendarModule } from '@fullcalendar/angular'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core'
import { CalendarOptions } from '@fullcalendar/core'
import jaLocale from '@fullcalendar/core/locales/ja'

export interface CalendarDateRange {
  startDate: string
  endDate: string
}

export interface CalendarTodoMoveEvent {
  todoId: number
  dueDate: string | null
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
  // 12.8 でドラッグ&ドロップによる期限変更を実装する際に使用する
  @Output() todoMove = new EventEmitter<CalendarTodoMoveEvent>()

  readonly calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    locale: jaLocale,
    height: 'auto',
    editable: false,
    dayMaxEvents: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    datesSet: (arg) => this.onDatesSet(arg),
    eventClick: (arg) => this.onEventClick(arg)
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

  private toIsoDate(value: Date): string {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
}
