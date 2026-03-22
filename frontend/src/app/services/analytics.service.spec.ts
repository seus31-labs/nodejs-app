import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { environment } from '../../environments/environment'
import { AnalyticsService } from './analytics.service'

describe('AnalyticsService (13.10)', () => {
  let service: AnalyticsService
  let httpMock: HttpTestingController
  const apiUrl = environment.apiUrl

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsService],
    })
    service = TestBed.inject(AnalyticsService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should GET /analytics/completion-rate with period query', () => {
    service.getCompletionRate('week').subscribe((r) => {
      expect(r.period).toBe('week')
      expect(r.rate).toBe(0.5)
    })
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${apiUrl}/analytics/completion-rate` &&
        r.method === 'GET' &&
        r.params.get('period') === 'week'
    )
    req.flush({ period: 'week', total: 4, completed: 2, rate: 0.5 })
  })

  it('should GET /analytics/by-priority', () => {
    service.getByPriority().subscribe((r) => {
      expect(r.low).toBe(1)
      expect(r.medium).toBe(2)
      expect(r.high).toBe(3)
    })
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/analytics/by-priority` && r.method === 'GET'
    )
    req.flush({ low: 1, medium: 2, high: 3 })
  })

  it('should GET /analytics/by-tag', () => {
    service.getByTag().subscribe((list) => expect(list.length).toBe(1))
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/analytics/by-tag` && r.method === 'GET'
    )
    req.flush([{ tagId: 1, name: 'a', color: '#111111', count: 2 }])
  })

  it('should GET /analytics/by-project', () => {
    service.getByProject().subscribe((list) => expect(list[0].name).toBe('未分類'))
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/analytics/by-project` && r.method === 'GET'
    )
    req.flush([{ projectId: null, name: '未分類', count: 1 }])
  })

  it('should GET /analytics/weekly', () => {
    service.getWeekly().subscribe((r) => expect(r.days.length).toBe(7))
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/analytics/weekly` && r.method === 'GET'
    )
    req.flush({
      days: Array.from({ length: 7 }, (_, i) => ({
        date: `2026-03-${10 + i}`,
        created: 0,
        completed: 0,
      })),
    })
  })
})
