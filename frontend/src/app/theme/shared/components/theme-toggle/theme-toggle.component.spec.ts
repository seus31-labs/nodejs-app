import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ThemeToggleComponent } from './theme-toggle.component'
import { ThemeService } from '../../../../services/theme.service'

describe('ThemeToggleComponent (16.8)', () => {
  let component: ThemeToggleComponent
  let fixture: ComponentFixture<ThemeToggleComponent>
  let themeService: ThemeService

  beforeEach(async () => {
    window.localStorage.removeItem('app-theme')
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [ThemeService],
    }).compileComponents()

    themeService = TestBed.inject(ThemeService)
    fixture = TestBed.createComponent(ThemeToggleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    window.localStorage.removeItem('app-theme')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should show ダーク when theme is light', () => {
    themeService.setTheme('light')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('ダーク')
  })

  it('should show ライト when theme is dark', () => {
    themeService.setTheme('dark')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('ライト')
  })

  it('should call themeService.toggle when button is clicked', () => {
    spyOn(themeService, 'toggle')
    fixture.nativeElement.querySelector('button').click()
    expect(themeService.toggle).toHaveBeenCalled()
  })

  it('should have aria-label for dark when current is light', () => {
    themeService.setTheme('light')
    fixture.detectChanges()
    const btn = fixture.nativeElement.querySelector('button')
    expect(btn.getAttribute('aria-label')).toBe('ダークモードに切り替え')
  })

  it('should have aria-label for light when current is dark', () => {
    themeService.setTheme('dark')
    fixture.detectChanges()
    const btn = fixture.nativeElement.querySelector('button')
    expect(btn.getAttribute('aria-label')).toBe('ライトモードに切り替え')
  })
})
