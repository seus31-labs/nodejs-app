import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgApexchartsModule } from 'ng-apexcharts'
import type { ApexNonAxisChartSeries, ApexChart, ApexLegend, ApexDataLabels } from 'ng-apexcharts'
import type { AnalyticsPeriod, CompletionRateDto } from '../../../../../models/analytics.interface'

@Component({
  selector: 'app-completion-rate-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './completion-rate-chart.component.html',
  styleUrl: './completion-rate-chart.component.scss',
})
export class CompletionRateChartComponent implements OnChanges {
  @Input() data: CompletionRateDto | null = null
  @Input() loading = false
  @Output() periodChange = new EventEmitter<AnalyticsPeriod>()

  periodModel: AnalyticsPeriod = 'all'
  readonly periodOptions: { value: AnalyticsPeriod; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'week', label: '直近7日' },
    { value: 'month', label: '直近30日' },
    { value: 'year', label: '直近365日' },
  ]

  chartSeries: ApexNonAxisChartSeries = [0, 0]
  chart: ApexChart = {
    type: 'donut',
    height: 300,
    toolbar: { show: false },
  }
  labels: string[] = ['完了', '未完了']
  colors: string[] = ['#1de9b6', '#e0e0e0']
  dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${Math.round(val)}%`,
  }
  legend: ApexLegend = { position: 'bottom' }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.periodModel = (this.data.period as AnalyticsPeriod) ?? 'all'
      this.applySeries()
    }
  }

  onPeriodSelectChange(): void {
    this.periodChange.emit(this.periodModel)
  }

  private applySeries(): void {
    if (!this.data || this.data.total <= 0) {
      this.chartSeries = [0, 0]
      return
    }
    const incomplete = Math.max(0, this.data.total - this.data.completed)
    this.chartSeries = [this.data.completed, incomplete]
  }
}
