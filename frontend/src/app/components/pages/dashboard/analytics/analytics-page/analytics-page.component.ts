import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { forkJoin, Subject, takeUntil } from 'rxjs'
import { AnalyticsService } from '../../../../../services/analytics.service'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import { CompletionRateChartComponent } from '../completion-rate-chart/completion-rate-chart.component'
import { PriorityDistributionChartComponent } from '../priority-distribution-chart/priority-distribution-chart.component'
import { TagDistributionChartComponent } from '../tag-distribution-chart/tag-distribution-chart.component'
import { WeeklyActivityChartComponent } from '../weekly-activity-chart/weekly-activity-chart.component'
import type {
  AnalyticsPeriod,
  CompletionRateDto,
  PriorityDistributionDto,
  TagCountDto,
  WeeklyStatsDto,
} from '../../../../../models/analytics.interface'

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CompletionRateChartComponent,
    PriorityDistributionChartComponent,
    TagDistributionChartComponent,
    WeeklyActivityChartComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export default class AnalyticsPageComponent implements OnInit, OnDestroy {
  period: AnalyticsPeriod = 'all'
  completionRate: CompletionRateDto | null = null
  priority: PriorityDistributionDto | null = null
  tags: TagCountDto[] | null = null
  weekly: WeeklyStatsDto | null = null

  loading = false
  completionRefreshing = false
  error: string | null = null

  private destroy$ = new Subject<void>()

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAll()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadAll(): void {
    this.loading = true
    this.error = null
    forkJoin({
      completion: this.analytics.getCompletionRate(this.period),
      priority: this.analytics.getByPriority(),
      tags: this.analytics.getByTag(),
      weekly: this.analytics.getWeekly(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.completionRate = res.completion
          this.priority = res.priority
          this.tags = res.tags
          this.weekly = res.weekly
          this.loading = false
        },
        error: (err: { error?: { error?: string }; message?: string }) => {
          this.error =
            err?.error?.error ?? err?.message ?? '統計の取得に失敗しました'
          this.loading = false
        },
      })
  }

  onCompletionPeriodChange(next: AnalyticsPeriod): void {
    this.period = next
    this.completionRefreshing = true
    this.analytics
      .getCompletionRate(next)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (c) => {
          this.completionRate = c
          this.completionRefreshing = false
        },
        error: (err: { error?: { error?: string }; message?: string }) => {
          this.error =
            err?.error?.error ?? err?.message ?? '完了率の取得に失敗しました'
          this.completionRefreshing = false
        },
      })
  }

  get completionChartLoading(): boolean {
    return this.loading || this.completionRefreshing
  }
}
