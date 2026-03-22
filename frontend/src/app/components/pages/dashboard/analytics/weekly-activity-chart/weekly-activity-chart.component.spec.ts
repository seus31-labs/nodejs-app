import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NgApexchartsModule } from 'ng-apexcharts'
import { WeeklyActivityChartComponent } from './weekly-activity-chart.component'

describe('WeeklyActivityChartComponent (13.14)', () => {
  let fixture: ComponentFixture<WeeklyActivityChartComponent>
  let component: WeeklyActivityChartComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyActivityChartComponent, NgApexchartsModule],
    }).compileComponents()
    fixture = TestBed.createComponent(WeeklyActivityChartComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should map weekly days to series', () => {
    component.data = {
      days: [
        { date: '2026-03-20', created: 1, completed: 0 },
        { date: '2026-03-21', created: 0, completed: 2 },
      ],
    }
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    })
    expect(component.chartSeries[0].data).toEqual([1, 0])
    expect(component.chartSeries[1].data).toEqual([0, 2])
    expect(component.xaxis.categories).toEqual(['3/20', '3/21'])
  })
})
