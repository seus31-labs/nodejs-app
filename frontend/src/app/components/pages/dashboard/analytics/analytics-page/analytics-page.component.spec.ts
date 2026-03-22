import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { of, throwError } from 'rxjs'
import AnalyticsPageComponent from './analytics-page.component'
import { AnalyticsService } from '../../../../../services/analytics.service'

describe('AnalyticsPageComponent (13.15–13.18)', () => {
  let fixture: ComponentFixture<AnalyticsPageComponent>
  let component: AnalyticsPageComponent
  let analyticsSpy: jasmine.SpyObj<AnalyticsService>

  const sampleCompletion = { period: 'all', total: 1, completed: 0, rate: 0 }
  const samplePriority = { low: 0, medium: 1, high: 0 }
  const sampleTags: { tagId: number; name: string; color: string; count: number }[] = []
  const sampleWeekly = {
    days: Array.from({ length: 7 }, (_, i) => ({
      date: `2026-03-${1 + i}`,
      created: 0,
      completed: 0,
    })),
  }

  beforeEach(async () => {
    analyticsSpy = jasmine.createSpyObj('AnalyticsService', [
      'getCompletionRate',
      'getByPriority',
      'getByTag',
      'getWeekly',
    ])
    analyticsSpy.getCompletionRate.and.returnValue(of(sampleCompletion))
    analyticsSpy.getByPriority.and.returnValue(of(samplePriority))
    analyticsSpy.getByTag.and.returnValue(of(sampleTags))
    analyticsSpy.getWeekly.and.returnValue(of(sampleWeekly))

    await TestBed.configureTestingModule({
      imports: [AnalyticsPageComponent],
      providers: [{ provide: AnalyticsService, useValue: analyticsSpy }, provideNoopAnimations()],
    }).compileComponents()

    fixture = TestBed.createComponent(AnalyticsPageComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load analytics on init', () => {
    fixture.detectChanges()
    expect(analyticsSpy.getCompletionRate).toHaveBeenCalledWith('all')
    expect(analyticsSpy.getByPriority).toHaveBeenCalled()
    expect(analyticsSpy.getByTag).toHaveBeenCalled()
    expect(analyticsSpy.getWeekly).toHaveBeenCalled()
    expect(component.loading).toBe(false)
    expect(component.completionRate).toEqual(sampleCompletion)
  })

  it('should set error when forkJoin fails', () => {
    analyticsSpy.getCompletionRate.and.returnValue(throwError(() => ({ error: { error: 'fail' } })))
    fixture.detectChanges()
    expect(component.error).toBe('fail')
    expect(component.loading).toBe(false)
  })

  it('should refetch completion only on period change', () => {
    fixture.detectChanges()
    analyticsSpy.getCompletionRate.calls.reset()
    component.onCompletionPeriodChange('week')
    expect(analyticsSpy.getCompletionRate).toHaveBeenCalledWith('week')
  })
})
