import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BehaviorSubject } from 'rxjs'
import { OfflineIndicatorComponent } from './offline-indicator.component'
import { NetworkStatusService } from '../../../../services/network-status.service'

describe('OfflineIndicatorComponent (20.10)', () => {
  let component: OfflineIndicatorComponent
  let fixture: ComponentFixture<OfflineIndicatorComponent>
  let online$: BehaviorSubject<boolean>

  beforeEach(async () => {
    online$ = new BehaviorSubject<boolean>(true)
    const networkStatus = jasmine.createSpyObj('NetworkStatusService', [], {
      isOnline: true,
      onlineChanges: online$.asObservable()
    })

    await TestBed.configureTestingModule({
      imports: [OfflineIndicatorComponent],
      providers: [{ provide: NetworkStatusService, useValue: networkStatus }]
    }).compileComponents()

    fixture = TestBed.createComponent(OfflineIndicatorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not show offline badge when online', () => {
    online$.next(true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('.offline-badge')).toBeFalsy()
  })

  it('should show offline badge when offline', () => {
    online$.next(false)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    const badge = el.querySelector('.offline-badge')
    expect(badge).toBeTruthy()
    expect(badge?.textContent?.trim()).toContain('オフライン')
  })
})
