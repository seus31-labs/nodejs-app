import { TestBed } from '@angular/core/testing'
import { of, Subject } from 'rxjs'
import { SyncService } from './sync.service'
import { NetworkStatusService } from './network-status.service'
import { TodoService } from './todo.service'

describe('SyncService (20.7)', () => {
  let service: SyncService
  let onlineChanges$: Subject<boolean>
  let networkStatus: jasmine.SpyObj<NetworkStatusService>
  let todoService: jasmine.SpyObj<TodoService>

  beforeEach(() => {
    onlineChanges$ = new Subject<boolean>()
    networkStatus = jasmine.createSpyObj('NetworkStatusService', [], {
      isOnline: false,
      onlineChanges: onlineChanges$.asObservable()
    })
    todoService = jasmine.createSpyObj('TodoService', ['list'])
    todoService.list.and.returnValue(of([]))

    TestBed.configureTestingModule({
      providers: [
        SyncService,
        { provide: NetworkStatusService, useValue: networkStatus },
        { provide: TodoService, useValue: todoService }
      ]
    })
    service = TestBed.inject(SyncService)
  })

  afterEach(() => {
    service.ngOnDestroy()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call todoService.list() when transitioning from offline to online', () => {
    onlineChanges$.next(false)
    expect(todoService.list).not.toHaveBeenCalled()
    onlineChanges$.next(true)
    expect(todoService.list).toHaveBeenCalled()
  })

  it('should not call list() when staying offline', () => {
    onlineChanges$.next(false)
    onlineChanges$.next(false)
    expect(todoService.list).not.toHaveBeenCalled()
  })

  it('should emit syncing true then false when sync runs (20.11)', (done) => {
    const values: boolean[] = []
    service.syncingChanges.subscribe((v) => {
      values.push(v)
      // 初期 false のあと true → false の順で届けばよい
      if (values.indexOf(true) !== -1 && values.lastIndexOf(false) > values.indexOf(true)) {
        done()
      }
    })
    onlineChanges$.next(false)
    onlineChanges$.next(true)
  })
})
