import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { environment } from '../../../../../../environments/environment'
import { NetworkStatusService } from '../../../../../services/network-status.service'
import { OfflineStorageService } from '../../../../../services/offline-storage.service'
import { TodoService } from '../../../../../services/todo.service'
import { TodoCalendarDetailDialogComponent } from './todo-calendar-detail-dialog.component'
import type { Todo } from '../../../../../models/todo.interface'

describe('TodoCalendarDetailDialogComponent', () => {
  let fixture: ComponentFixture<TodoCalendarDetailDialogComponent>
  let component: TodoCalendarDetailDialogComponent
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  const sampleTodo: Todo = {
    id: 9,
    userId: 1,
    title: '会議',
    description: '資料準備',
    completed: false,
    priority: 'high',
    dueDate: '2026-03-22',
    sortOrder: 0,
    projectId: null,
    archived: false,
    archivedAt: null,
    reminderEnabled: false,
    reminderSentAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    Tags: [{ id: 1, userId: 1, name: 'work', color: '#1976d2', createdAt: '', updatedAt: '' }]
  }

  beforeEach(async () => {
    const networkStatus = jasmine.createSpyObj('NetworkStatusService', [], { isOnline: true })
    const offlineStorage = jasmine.createSpyObj('OfflineStorageService', ['getTodos', 'saveTodos'])
    offlineStorage.saveTodos.and.returnValue(Promise.resolve())

    await TestBed.configureTestingModule({
      imports: [TodoCalendarDetailDialogComponent, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        TodoService,
        { provide: NetworkStatusService, useValue: networkStatus },
        { provide: OfflineStorageService, useValue: offlineStorage },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: { todoId: 9 } }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TodoCalendarDetailDialogComponent)
    component = fixture.componentInstance
    httpMock = TestBed.inject(HttpTestingController)
    fixture.detectChanges()
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should load todo and show title', () => {
    const req = httpMock.expectOne(`${apiUrl}/todos/9`)
    expect(req.request.method).toBe('GET')
    req.flush(sampleTodo)
    fixture.detectChanges()

    expect(component.todo).toEqual(sampleTodo)
    expect(component.loading).toBe(false)
    const el: HTMLElement = fixture.nativeElement
    expect(el.textContent).toContain('会議')
    expect(el.textContent).toContain('資料準備')
  })

  it('should show error when GET fails', () => {
    const req = httpMock.expectOne(`${apiUrl}/todos/9`)
    req.flush({ message: '見つかりません' }, { status: 404, statusText: 'Not Found' })
    fixture.detectChanges()

    expect(component.error).toContain('見つかりません')
    expect(component.loading).toBe(false)
  })
})
