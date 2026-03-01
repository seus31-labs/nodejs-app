import { TestBed } from '@angular/core/testing'
import { ThemeService } from './theme.service'

describe('ThemeService', () => {
  let service: ThemeService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(ThemeService)
    // テストごとに localStorage をクリア
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('app-theme')
    }
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should default to light theme', () => {
    expect(service.currentTheme).toBe('light')
  })

  it('should set and persist dark theme', () => {
    service.setTheme('dark')
    expect(service.currentTheme).toBe('dark')
    expect(window.localStorage.getItem('app-theme')).toBe('dark')
  })

  it('should set and persist light theme', () => {
    service.setTheme('dark')
    service.setTheme('light')
    expect(service.currentTheme).toBe('light')
    expect(window.localStorage.getItem('app-theme')).toBe('light')
  })

  it('should toggle from light to dark', () => {
    service.toggle()
    expect(service.currentTheme).toBe('dark')
  })

  it('should toggle from dark to light', () => {
    service.setTheme('dark')
    service.toggle()
    expect(service.currentTheme).toBe('light')
  })

  it('should emit theme changes', (done) => {
    service.themeChanges.subscribe((theme) => {
      expect(theme).toBe('dark')
      done()
    })
    service.setTheme('dark')
  })
})
