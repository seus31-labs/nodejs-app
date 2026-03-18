import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { NotificationService } from './notification.service'

describe('NotificationService (4.14.1)', () => {
  let service: NotificationService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    })
    service = TestBed.inject(NotificationService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should not throw when Notification API is not available', () => {
    const original = (globalThis as any).Notification
    ;(globalThis as any).Notification = undefined
    expect(() => service.showNotification('t', 'b')).not.toThrow()
    ;(globalThis as any).Notification = original
  })
})

