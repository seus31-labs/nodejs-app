import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, waitForAsync } from '@angular/core/testing'
import { Subject } from 'rxjs'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { environment } from '../../../../../../environments/environment'
import { NetworkStatusService } from '../../../../../services/network-status.service'
import { OfflineStorageService } from '../../../../../services/offline-storage.service'
import { TodoService } from '../../../../../services/todo.service'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import CalendarPageComponent from './calendar-page.component'
import { TodoCalendarDetailDialogComponent } from '../todo-calendar-detail-dialog/todo-calendar-detail-dialog.component'
import type { CalendarDateRange } from '../calendar-view/calendar-view.component'

/** FullCalendar を避け、ページのデータ取得・ダイアログ配線のみ検証する */
@Component({
  selector: 'app-calendar-view',
  standalone: true,
  template: ''
})
class CalendarViewStubComponent {
  @Input() events: unknown[] = []
  @Input() loading = false
  @Input() error: string | null = null
  @Output() dateRangeChange = new EventEmitter<CalendarDateRange>()
  @Output() todoClick = new EventEmitter<number>()
}

describe('CalendarPageComponent', () => {
  let fixture: ComponentFixture<CalendarPageComponent>
  let component: CalendarPageComponent
  let httpMock: HttpTestingController
  let dialog: MatDialog
  const apiUrl = environment.apiUrl

  beforeEach(waitForAsync(async () => {
    const networkStatus = jasmine.createSpyObj('NetworkStatusService', [], { isOnline: true })
    const offlineStorage = jasmine.createSpyObj('OfflineStorageService', ['getTodos', 'saveTodos'])
    offlineStorage.saveTodos.and.returnValue(Promise.resolve())

    await TestBed.configureTestingModule({
      imports: [CalendarPageComponent, HttpClientTestingModule, NoopAnimationsModule, MatDialogModule],
      providers: [
        TodoService,
        { provide: NetworkStatusService, useValue: networkStatus },
        { provide: OfflineStorageService, useValue: offlineStorage }
      ]
    })
      .overrideComponent(CalendarPageComponent, {
        set: {
          imports: [CardComponent, CalendarViewStubComponent]
        }
      })
      .compileComponents()

    fixture = TestBed.createComponent(CalendarPageComponent)
    component = fixture.componentInstance
    httpMock = TestBed.inject(HttpTestingController)
    dialog = TestBed.inject(MatDialog)
    fixture.detectChanges()
  }))

  afterEach(() => {
    httpMock.verify()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load todos when date range changes', fakeAsync(() => {
    component.onDateRangeChange({ startDate: '2026-03-01', endDate: '2026-03-31' })
    flushMicrotasks()
    expect(component.loading).toBe(true)

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${apiUrl}/todos` &&
        r.method === 'GET' &&
        r.params.get('startDate') === '2026-03-01' &&
        r.params.get('endDate') === '2026-03-31'
    )
    req.flush([])
    flushMicrotasks()

    expect(component.loading).toBe(false)
    expect(component.todos).toEqual([])
  }))

  it('should set error when API fails', fakeAsync(() => {
    component.onDateRangeChange({ startDate: '2026-03-01', endDate: '2026-03-31' })
    flushMicrotasks()

    const req = httpMock.expectOne((r) => r.url === `${apiUrl}/todos` && r.method === 'GET')
    req.flush({ message: '取得に失敗しました' }, { status: 500, statusText: 'Server Error' })
    flushMicrotasks()

    expect(component.error).toContain('取得に失敗しました')
    expect(component.loading).toBe(false)
  }))

  it('should open todo detail dialog on todoClick', () => {
    const afterClosed$ = new Subject<void>()
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed'])
    dialogRefSpy.afterClosed.and.returnValue(afterClosed$.asObservable())
    const openSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy)

    component.onTodoClick(42)
    expect(openSpy).toHaveBeenCalledWith(TodoCalendarDetailDialogComponent, {
      width: '440px',
      data: { todoId: 42 }
    })
  })

  it('should not open a second dialog while the first is still open', () => {
    const afterClosed$ = new Subject<void>()
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed'])
    dialogRefSpy.afterClosed.and.returnValue(afterClosed$.asObservable())
    spyOn(dialog, 'open').and.returnValue(dialogRefSpy)

    component.onTodoClick(1)
    component.onTodoClick(2)
    expect(dialog.open).toHaveBeenCalledTimes(1)

    afterClosed$.next()
    afterClosed$.complete()
    component.onTodoClick(2)
    expect(dialog.open).toHaveBeenCalledTimes(2)
  })
})
