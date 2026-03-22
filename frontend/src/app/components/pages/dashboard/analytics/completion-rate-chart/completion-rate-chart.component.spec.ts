import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { NgApexchartsModule } from 'ng-apexcharts'
import { CompletionRateChartComponent } from './completion-rate-chart.component'

describe('CompletionRateChartComponent (13.11)', () => {
  let fixture: ComponentFixture<CompletionRateChartComponent>
  let component: CompletionRateChartComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletionRateChartComponent, FormsModule, NgApexchartsModule],
    }).compileComponents()
    fixture = TestBed.createComponent(CompletionRateChartComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit periodChange when select changes', () => {
    spyOn(component.periodChange, 'emit')
    component.periodModel = 'week'
    component.onPeriodSelectChange()
    expect(component.periodChange.emit).toHaveBeenCalledWith('week')
  })

  it('should set donut series from data input', () => {
    component.data = { period: 'all', total: 10, completed: 3, rate: 0.3 }
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    })
    expect(component.chartSeries).toEqual([3, 7])
  })
})
