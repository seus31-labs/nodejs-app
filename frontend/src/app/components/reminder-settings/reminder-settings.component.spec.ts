import { BehaviorSubject } from 'rxjs'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReminderSettingsComponent } from './reminder-settings.component'
import { NotificationService } from '../../services/notification.service'
import { ReminderService } from '../../services/reminder.service'

describe('ReminderSettingsComponent (4.14.3)', () => {
  let fixture: ComponentFixture<ReminderSettingsComponent>
  let component: ReminderSettingsComponent

  const notificationServiceMock = {
    requestPermission: jasmine.createSpy('requestPermission').and.resolveTo('granted' as NotificationPermission),
    showNotification: jasmine.createSpy('showNotification'),
  }

  const reminderRunning$ = new BehaviorSubject<boolean>(true)
  const reminderServiceMock = {
    running$: reminderRunning$.asObservable(),
    start: jasmine.createSpy('start'),
    stop: jasmine.createSpy('stop'),
  }

  const originalNotification = (globalThis as any).Notification

  beforeEach(async () => {
    ;(globalThis as any).Notification = {
      permission: 'default',
    }

    await TestBed.configureTestingModule({
      imports: [ReminderSettingsComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ReminderService, useValue: reminderServiceMock },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ReminderSettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    ;(globalThis as any).Notification = originalNotification
    notificationServiceMock.requestPermission.calls.reset()
    notificationServiceMock.showNotification.calls.reset()
    reminderRunning$.next(true)
  })

  it('permission button should request permission', async () => {
    const permissionBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="permission-button"]')
    permissionBtn.click()

    await fixture.whenStable()
    expect(notificationServiceMock.requestPermission).toHaveBeenCalled()
    expect(component.permission).toBe('granted')
  })

  it('test button should send notification when granted', () => {
    component.permission = 'granted'
    fixture.detectChanges()

    const testBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="test-button"]')
    testBtn.click()

    expect(notificationServiceMock.showNotification).toHaveBeenCalled()
  })
})

