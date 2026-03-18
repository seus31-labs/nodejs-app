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

  afterEach(() => {
    // restore global Notification if tests replaced it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any
    if (g.__originalNotification__ !== undefined) {
      g.Notification = g.__originalNotification__
      delete g.__originalNotification__
    }
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should not throw when Notification API is not available', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any
    g.__originalNotification__ = g.Notification
    g.Notification = undefined
    expect(() => service.showNotification('t', 'b')).not.toThrow()
  })

  it('requestPermission should return denied when Notification API is not available', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any
    g.__originalNotification__ = g.Notification
    g.Notification = undefined
    await expectAsync(service.requestPermission()).toBeResolvedTo('denied')
  })

  it('requestPermission should return current permission when not default', async () => {
    class FakeNotification {
      static permission: NotificationPermission = 'granted'
      static requestPermission = jasmine.createSpy('requestPermission')
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any
    g.__originalNotification__ = g.Notification
    g.Notification = FakeNotification as any

    await expectAsync(service.requestPermission()).toBeResolvedTo('granted')
    expect(FakeNotification.requestPermission).not.toHaveBeenCalled()
  })

  it('requestPermission should call requestPermission when default', async () => {
    class FakeNotification {
      static permission: NotificationPermission = 'default'
      static requestPermission = jasmine
        .createSpy('requestPermission')
        .and.resolveTo('denied' as NotificationPermission)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any
    g.__originalNotification__ = g.Notification
    g.Notification = FakeNotification as any

    await expectAsync(service.requestPermission()).toBeResolvedTo('denied')
    expect(FakeNotification.requestPermission).toHaveBeenCalled()
  })

  it('showNotification should not create notification when permission is not granted', () => {
    class FakeNotification {
      static permission: NotificationPermission = 'denied'
      constructor() {
        throw new Error('should not be instantiated')
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any
    g.__originalNotification__ = g.Notification
    g.Notification = FakeNotification as any

    expect(() => service.showNotification('t', 'b')).not.toThrow()
  })
})

