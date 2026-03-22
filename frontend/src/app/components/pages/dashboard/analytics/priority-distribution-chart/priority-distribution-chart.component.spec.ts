import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NgApexchartsModule } from 'ng-apexcharts'
import { PriorityDistributionChartComponent } from './priority-distribution-chart.component'

describe('PriorityDistributionChartComponent (13.12)', () => {
  let fixture: ComponentFixture<PriorityDistributionChartComponent>
  let component: PriorityDistributionChartComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityDistributionChartComponent, NgApexchartsModule],
    }).compileComponents()
    fixture = TestBed.createComponent(PriorityDistributionChartComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should reflect priority counts in series', () => {
    component.data = { low: 2, medium: 3, high: 1 }
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    })
    expect(component.chartSeries[0].data).toEqual([2, 3, 1])
    expect(component.hasAny).toBe(true)
  })
})
