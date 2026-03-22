import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
} from 'ng-apexcharts'
import type { PriorityDistributionDto } from '../../../../../models/analytics.interface'

@Component({
  selector: 'app-priority-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './priority-distribution-chart.component.html',
  styleUrl: './priority-distribution-chart.component.scss',
})
export class PriorityDistributionChartComponent implements OnChanges {
  @Input() data: PriorityDistributionDto | null = null
  @Input() loading = false

  chartSeries: ApexAxisChartSeries = [{ name: '件数', data: [0, 0, 0] }]
  chart: ApexChart = {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  }
  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      distributed: true,
    },
  }
  dataLabels: ApexDataLabels = { enabled: true }
  legend: ApexLegend = { show: false }
  colors: string[] = ['#04a9f5', '#f4c22b', '#ff5370']
  xaxis = { categories: ['低', '中', '高'] }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      const d = this.data
      this.chartSeries = [{ name: '件数', data: [d.low, d.medium, d.high] }]
    }
  }

  get hasAny(): boolean {
    if (!this.data) return false
    return this.data.low + this.data.medium + this.data.high > 0
  }
}
