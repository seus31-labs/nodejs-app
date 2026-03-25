import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { TodoService } from '../../../../../services/todo.service'
import { NetworkStatusService } from '../../../../../services/network-status.service'
import { OfflineStorageService } from '../../../../../services/offline-storage.service'
import type { Todo } from '../../../../../models/todo.interface'
import TodoDetailPageComponent from './todo-detail-page.component'

describe('TodoDetailPageComponent (5.13)', () => {
  let fixture: ComponentFixture<TodoDetailPageComponent>
  let component: TodoDetailPageComponent
  let httpMock: HttpTestingController

  const todo: Todo = {
    id: 1,
    userId: 1,
    title: 'Parent',
    description: 'desc',
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
      imports: [HttpClientTestingModule, TodoDetailPageComponent],
      providers: [
        TodoService,
        { provide: NetworkStatusService, useValue: networkStatus },
        { provide: OfflineStorageService, useValue: offlineStorage },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } }
        }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TodoDetailPageComponent)
    component = fixture.componentInstance
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should load todo detail by route id', () => {
    fixture.detectChanges()
    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/todos/1'))
    req.flush(todo)
    expect(component.todo?.title).toBe('Parent')
  })

  it('should update progress when subtasks updated', () => {
    component.todo = todo
    component.onSubtasksUpdated([
      { ...todo, id: 11, parentId: 1, completed: true },
      { ...todo, id: 12, parentId: 1, completed: false }
    ])
    expect(component.todo.progress).toEqual({ completed: 1, total: 2 })
  })
})

