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
import { CalendarPageComponent } from './calendar-page.component'
import { TodoCalendarDetailDialogComponent } from '../todo-calendar-detail-dialog/todo-calendar-detail-dialog.component'
import type { CalendarDateRange, CalendarTodoMoveEvent } from '../calendar-view/calendar-view.component'
import type { Todo } from '../../../../../models/todo.interface'

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
  @Output() todoMove = new EventEmitter<CalendarTodoMoveEvent>()
}

function sampleTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    userId: 1,
    title: 'T',
    description: null,
    completed: false,
    priority: 'medium',
    dueDate: '2026-03-01',
    sortOrder: 0,
    projectId: null,
    archived: false,
    archivedAt: null,
    reminderEnabled: false,
    reminderSentAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  }
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

  it('should clear moveError when opening todo detail dialog', () => {
    component.moveError = '期限の更新に失敗しました'
    const afterClosed$ = new Subject<void>()
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed'])
    dialogRefSpy.afterClosed.and.returnValue(afterClosed$.asObservable())
    spyOn(dialog, 'open').and.returnValue(dialogRefSpy)

    component.onTodoClick(1)
    expect(component.moveError).toBeNull()
  })

  it('should PUT new dueDate on todoMove', fakeAsync(() => {
    component.todos = [sampleTodo({ id: 5, title: 'Alpha', dueDate: '2026-03-01' })]
    const revertSpy = jasmine.createSpy('revert')
    component.onTodoMove({ todoId: 5, dueDate: '2026-03-15', revert: revertSpy })

    const req = httpMock.expectOne(`${apiUrl}/todos/5`)
    expect(req.request.method).toBe('PUT')
    expect(req.request.body).toEqual({ title: 'Alpha', dueDate: '2026-03-15' })
    req.flush(sampleTodo({ id: 5, title: 'Alpha', dueDate: '2026-03-15' }))
    flushMicrotasks()

    expect(component.todos[0].dueDate).toBe('2026-03-15')
    expect(revertSpy).not.toHaveBeenCalled()
    expect(component.moveError).toBeNull()
  }))

  it('should revert and set moveError when todoMove update fails', fakeAsync(() => {
    component.todos = [sampleTodo({ id: 5, title: 'Alpha', dueDate: '2026-03-01' })]
    const revertSpy = jasmine.createSpy('revert')
    component.onTodoMove({ todoId: 5, dueDate: '2026-03-15', revert: revertSpy })

    const req = httpMock.expectOne(`${apiUrl}/todos/5`)
    req.flush({ message: '更新できません' }, { status: 500, statusText: 'Server Error' })
    flushMicrotasks()

    expect(revertSpy).toHaveBeenCalled()
    expect(component.moveError).toContain('更新できません')
    expect(component.todos[0].dueDate).toBe('2026-03-01')
  }))

  it('should revert when todo is missing on todoMove', () => {
    component.todos = []
    const revertSpy = jasmine.createSpy('revert')
    component.onTodoMove({ todoId: 99, dueDate: '2026-03-15', revert: revertSpy })
    expect(revertSpy).toHaveBeenCalled()
    expect(component.moveError).toContain('見つかりません')
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
