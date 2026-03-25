import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SimpleChange } from '@angular/core'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TodoService } from '../../services/todo.service'
import { NetworkStatusService } from '../../services/network-status.service'
import { OfflineStorageService } from '../../services/offline-storage.service'
import SubtaskListComponent from './subtask-list.component'
import { take } from 'rxjs'
import type { Todo } from '../../models/todo.interface'

describe('SubtaskListComponent', () => {
  let fixture: ComponentFixture<SubtaskListComponent>
  let component: SubtaskListComponent
  let httpMock: HttpTestingController

  const mockTodo: Todo = {
    id: 1,
    userId: 1,
    title: 'T',
    description: null,
    completed: false,
    priority: 'medium',
    dueDate: null,
    sortOrder: 0,
    projectId: null,
    archived: false,
    archivedAt: null,
    reminderEnabled: false,
    reminderSentAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }

  beforeEach(async () => {
    const networkStatus = jasmine.createSpyObj('NetworkStatusService', [], { isOnline: true })
    const offlineStorage = jasmine.createSpyObj('OfflineStorageService', ['getTodos', 'saveTodos'])
    offlineStorage.saveTodos.and.returnValue(Promise.resolve())
    offlineStorage.getTodos.and.returnValue(Promise.resolve([]))

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SubtaskListComponent],
      providers: [
        TodoService,
        { provide: NetworkStatusService, useValue: networkStatus },
        { provide: OfflineStorageService, useValue: offlineStorage }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(SubtaskListComponent)
    component = fixture.componentInstance
    httpMock = TestBed.inject(HttpTestingController)

    // テンプレートの初期レンダリングだけ行い、HTTP 発火は各テストで ngOnChanges を明示呼び出しする。
    fixture.detectChanges()
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should load subtasks by parentId', (done) => {
    const expected: Todo[] = [{ ...mockTodo, id: 10, parentId: 1, title: 'child' }]

    component.subtasksUpdated.pipe(take(1)).subscribe((list) => {
      expect(list.length).toBe(1)
      expect(list[0].title).toBe('child')
      done()
    })

    component.parentId = 1
    component.ngOnChanges({
      parentId: new SimpleChange(undefined, 1, true)
    })

    const req = httpMock.expectOne((r) => r.method === 'GET')
    req.flush(expected)
  })

  it('should create subtask and append to list', () => {
    const created: Todo = { ...mockTodo, id: 11, parentId: 1, title: 'new child' }

    component.parentId = 1
    component.ngOnChanges({
      parentId: new SimpleChange(undefined, 1, true)
    })

    httpMock.expectOne((r) => r.method === 'GET').flush([])

    component.onAddClick()
    component.newTitle = 'new child'

    component.create()

    const postReq = httpMock.expectOne((r) => r.method === 'POST')
    postReq.flush(created)

    expect(component.subtasks.some((t) => t.id === 11 && t.title === 'new child')).toBe(true)
  })

  it('should toggle subtask completion', (done) => {
    const initial: Todo[] = [{ ...mockTodo, id: 20, parentId: 1, title: 'child', completed: false }]
    const updated: Todo = { ...initial[0], completed: true }

    component.parentId = 1
    component.ngOnChanges({
      parentId: new SimpleChange(undefined, 1, true)
    })
    httpMock.expectOne((r) => r.method === 'GET').flush(initial)

    component.subtasksUpdated.pipe(take(1)).subscribe((list) => {
      expect(list[0].completed).toBe(true)
      done()
    })

    component.toggle(20)
    const patchReq = httpMock.expectOne((r) => r.method === 'PATCH')
    patchReq.flush(updated)
  })
})

