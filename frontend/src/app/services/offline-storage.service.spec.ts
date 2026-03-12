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
    createdAt: '',
    updatedAt: ''
  }
]

describe('OfflineStorageService (20.4)', () => {
  let service: OfflineStorageService
  let indexedDb: jasmine.SpyObj<IndexedDbService>

  beforeEach(() => {
    indexedDb = jasmine.createSpyObj('IndexedDbService', ['open', 'getAll', 'put', 'clear'])
    indexedDb.open.and.returnValue(Promise.resolve())
    indexedDb.getAll.and.returnValue(Promise.resolve([]))
    indexedDb.put.and.returnValue(Promise.resolve())
    indexedDb.clear.and.returnValue(Promise.resolve())

    TestBed.configureTestingModule({
      providers: [{ provide: IndexedDbService, useValue: indexedDb }]
    })
    service = TestBed.inject(OfflineStorageService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should open DB and return todos from getTodos', async () => {
    indexedDb.getAll.and.returnValue(Promise.resolve(mockTodos))
    const result = await service.getTodos()
    expect(indexedDb.open).toHaveBeenCalled()
    expect(indexedDb.getAll).toHaveBeenCalledWith('todos')
    expect(result).toEqual(mockTodos)
  })

  it('should clear and put each todo in saveTodos', async () => {
    await service.saveTodos(mockTodos)
    expect(indexedDb.clear).toHaveBeenCalledWith('todos')
    expect(indexedDb.put).toHaveBeenCalledWith('todos', mockTodos[0])
    expect(indexedDb.put).toHaveBeenCalledTimes(mockTodos.length)
  })

  it('should clear todos store in clearTodos', async () => {
    await service.clearTodos()
    expect(indexedDb.clear).toHaveBeenCalledWith('todos')
  })
})
