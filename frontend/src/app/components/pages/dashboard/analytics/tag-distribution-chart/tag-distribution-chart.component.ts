import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexXAxis,
} from 'ng-apexcharts'
import type { TagCountDto } from '../../../../../models/analytics.interface'

@Component({
  selector: 'app-tag-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './tag-distribution-chart.component.html',
  styleUrl: './tag-distribution-chart.component.scss',
})
export class TagDistributionChartComponent implements OnChanges {
  @Input() data: TagCountDto[] | null = null
  @Input() loading = false

  chartSeries: ApexAxisChartSeries = [{ name: '件数', data: [] }]
  chart: ApexChart = {
    type: 'bar',
    height: 360,
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
  colors: string[] = []
  xaxis: ApexXAxis = { categories: [] }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      const tags = this.data.filter((t) => t.count > 0)
      this.colors = tags.map((t) => t.color || '#808080')
      this.xaxis = { categories: tags.map((t) => t.name) }
      this.chartSeries = [{ name: '件数', data: tags.map((t) => t.count) }]
    }
  }

  get hasRows(): boolean {
    return (this.data ?? []).some((t) => t.count > 0)
  }
}
