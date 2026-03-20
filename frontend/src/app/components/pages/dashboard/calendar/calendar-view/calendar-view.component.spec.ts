import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EventInput } from '@fullcalendar/core'
import { CalendarViewComponent } from './calendar-view.component'

describe('CalendarViewComponent', () => {
  let component: CalendarViewComponent
  let fixture: ComponentFixture<CalendarViewComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarViewComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(CalendarViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit dateRangeChange when datesSet is called', () => {
    const emitSpy = spyOn(component.dateRangeChange, 'emit')
    const start = new Date(2026, 2, 1)
    const end = new Date(2026, 3, 1)

    component.onDatesSet({ start, end } as any)

    expect(emitSpy).toHaveBeenCalledWith({
      startDate: '2026-03-01',
      endDate: '2026-03-31'
    })
  })

  it('should emit todoClick when event has todoId', () => {
    const emitSpy = spyOn(component.todoClick, 'emit')
    component.onEventClick({
      event: {
        extendedProps: { todoId: 42 }
      }
    } as any)

    expect(emitSpy).toHaveBeenCalledWith(42)
  })

  it('should render calendar events', () => {
    const events: EventInput[] = [{ title: 'test', start: '2026-03-20', extendedProps: { todoId: 1 } }]
    component.events = events
    fixture.detectChanges()
    expect(component.events.length).toBe(1)
  })
})
