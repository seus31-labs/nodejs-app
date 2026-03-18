import { TestBed } from '@angular/core/testing'
import { OfflineStorageService } from './offline-storage.service'
import { IndexedDbService } from './indexed-db.service'
import type { Todo } from '../models/todo.interface'

const mockTodos: Todo[] = [
  {
    id: 1,
    userId: 1,
    title: 'A',
    description: null,
    completed: false,
    priority: 'medium',
    dueDate: null,
    sortOrder: 0,
    projectId: null,
    archived: false,
    archivedAt: null,
    reminderEnabled: true,
    reminderSentAt: null,
    createdAt: '',
    updatedAt: ''
  }
]

describe('OfflineStorageService (20.4)', () => {
  let service: OfflineStorageService
  let openSpy: jasmine.Spy
  let getAllSpy: jasmine.Spy
  let putSpy: jasmine.Spy
  let clearSpy: jasmine.Spy

  beforeEach(() => {
    openSpy = jasmine.createSpy('open').and.returnValue(Promise.resolve())
    getAllSpy = jasmine.createSpy('getAll').and.returnValue(Promise.resolve([]))
    putSpy = jasmine.createSpy('put').and.returnValue(Promise.resolve())
    clearSpy = jasmine.createSpy('clear').and.returnValue(Promise.resolve())
    const indexedDb = {
      open: openSpy,
      getAll: getAllSpy,
      put: putSpy,
      clear: clearSpy
    } as unknown as IndexedDbService

    TestBed.configureTestingModule({
      providers: [{ provide: IndexedDbService, useValue: indexedDb }]
    })
    service = TestBed.inject(OfflineStorageService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should open DB and return todos from getTodos', async () => {
    getAllSpy.and.returnValue(Promise.resolve(mockTodos))
    const result = await service.getTodos()
    expect(openSpy).toHaveBeenCalled()
    expect(getAllSpy).toHaveBeenCalledWith('todos')
    expect(result).toEqual(mockTodos)
  })

  it('should clear and put each todo in saveTodos', async () => {
    await service.saveTodos(mockTodos)
    expect(clearSpy).toHaveBeenCalledWith('todos')
    expect(putSpy.calls.count()).toBe(mockTodos.length)
    const putCalls = putSpy.calls.all()
    expect(putCalls.every((c) => c.args[0] === 'todos')).toBe(true)
    expect(putCalls[0].args[1]).toEqual(mockTodos[0])
  })

  it('should clear todos store in clearTodos', async () => {
    await service.clearTodos()
    expect(clearSpy).toHaveBeenCalledWith('todos')
  })
})
