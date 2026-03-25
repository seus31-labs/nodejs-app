import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NgApexchartsModule } from 'ng-apexcharts'
import { TagDistributionChartComponent } from './tag-distribution-chart.component'

describe('TagDistributionChartComponent (13.13)', () => {
  let fixture: ComponentFixture<TagDistributionChartComponent>
  let component: TagDistributionChartComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagDistributionChartComponent, NgApexchartsModule],
    }).compileComponents()
    fixture = TestBed.createComponent(TagDistributionChartComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should map tags with positive counts only', () => {
    component.data = [
      { tagId: 1, name: 'A', color: '#ff0000', count: 2 },
      { tagId: 2, name: 'B', color: '#00ff00', count: 0 },
    ]
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    })
    expect(component.xaxis.categories).toEqual(['A'])
    expect(component.chartSeries[0].data).toEqual([2])
    expect(component.hasRows).toBe(true)
  })
})
