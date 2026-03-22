import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type {
  AnalyticsPeriod,
  CompletionRateDto,
  PriorityDistributionDto,
  ProjectCountDto,
  TagCountDto,
  WeeklyStatsDto,
} from '../models/analytics.interface'

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  getCompletionRate(period: AnalyticsPeriod = 'all'): Observable<CompletionRateDto> {
    const params = new HttpParams().set('period', period)
    return this.http.get<CompletionRateDto>(`${this.apiUrl}/analytics/completion-rate`, {
      params,
    })
  }

  getByPriority(): Observable<PriorityDistributionDto> {
    return this.http.get<PriorityDistributionDto>(`${this.apiUrl}/analytics/by-priority`)
  }

  getByTag(): Observable<TagCountDto[]> {
    return this.http.get<TagCountDto[]>(`${this.apiUrl}/analytics/by-tag`)
  }

  /**
   * プロジェクト別件数。AnalyticsPage では未使用（TODO にフロント項目なし）だが API 整合のため提供。
   * 将来プロジェクト別チャートを載せる際に呼び出す。
   */
  getByProject(): Observable<ProjectCountDto[]> {
    return this.http.get<ProjectCountDto[]>(`${this.apiUrl}/analytics/by-project`)
  }

  getWeekly(): Observable<WeeklyStatsDto> {
    return this.http.get<WeeklyStatsDto>(`${this.apiUrl}/analytics/weekly`)
  }
}
