import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import type { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexXAxis } from 'ng-apexcharts'
import type { WeeklyStatsDto } from '../../../../../models/analytics.interface'

@Component({
  selector: 'app-weekly-activity-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './weekly-activity-chart.component.html',
  styleUrls: ['./weekly-activity-chart.component.scss'],
})
export class WeeklyActivityChartComponent implements OnChanges {
  @Input() data: WeeklyStatsDto | null = null
  @Input() loading = false

  chartSeries: ApexAxisChartSeries = [
    { name: '作成', data: [] },
    { name: '完了', data: [] },
  ]
  chart: ApexChart = {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
    stacked: false,
  }
  dataLabels: ApexDataLabels = { enabled: false }
  xaxis: ApexXAxis = { categories: [] }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.days?.length) {
      const days = this.data.days
      this.xaxis = {
        categories: days.map((d) => this.formatDayLabel(d.date)),
      }
      this.chartSeries = [
        { name: '作成', data: days.map((d) => d.created) },
        { name: '完了', data: days.map((d) => d.completed) },
      ]
    }
  }

  /** ISO 日付を「M/D」表示に（チャート横軸のスペース節約） */
  private formatDayLabel(isoDate: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
    if (!m) return isoDate
    return `${Number(m[2])}/${Number(m[3])}`
  }
}
