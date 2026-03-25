import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { ProgressBarComponent } from './progress-bar.component'

describe('ProgressBarComponent (5.10)', () => {
  let fixture: ComponentFixture<ProgressBarComponent>
  let component: ProgressBarComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents()

    fixture = TestBed.createComponent(ProgressBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
})

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should calculate percentage from progress input', () => {
    component.progress = { completed: 2, total: 5 }
    fixture.detectChanges()

    expect(component.percentage).toBe(40)
  })

  it('should return 0 percentage when total is zero', () => {
    component.progress = { completed: 3, total: 0 }
    fixture.detectChanges()

    expect(component.percentage).toBe(0)
  })
})

