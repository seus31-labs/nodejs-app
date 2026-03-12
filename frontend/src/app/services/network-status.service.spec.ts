import { TestBed } from '@angular/core/testing'
import { NetworkStatusService } from './network-status.service'

describe('NetworkStatusService (20.5)', () => {
  let service: NetworkStatusService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(NetworkStatusService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should expose boolean isOnline', () => {
    expect(typeof service.isOnline).toBe('boolean')
  })

  it('should emit current value via onlineChanges', (done) => {
    service.onlineChanges.subscribe((value) => {
      expect(typeof value).toBe('boolean')
      done()
    })
  })

  it('should register online and offline event listeners', () => {
    const addSpy = spyOn(window, 'addEventListener')
    const manualService = new NetworkStatusService()
    expect(addSpy).toHaveBeenCalledWith('online', jasmine.any(Function))
    expect(addSpy).toHaveBeenCalledWith('offline', jasmine.any(Function))
    manualService.ngOnDestroy()
  })
})
