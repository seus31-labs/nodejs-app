import { TestBed } from '@angular/core/testing'
import { ThemeService } from './theme.service'

describe('ThemeService', () => {
  let service: ThemeService

  beforeEach(() => {
    // サービス生成前にクリア（順序依存を防ぐ）
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('app-theme')
    }
    TestBed.configureTestingModule({})
    service = TestBed.inject(ThemeService)
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

  it('init() should apply dark-mode class to body when theme is dark', () => {
    service.setTheme('dark')
    document.body.classList.remove('dark-mode')
    service.init()
    expect(document.body.classList.contains('dark-mode')).toBe(true)
  })

  it('init() should remove dark-mode class from body when theme is light', () => {
    service.setTheme('dark')
    service.setTheme('light')
    service.init()
    expect(document.body.classList.contains('dark-mode')).toBe(false)
  })
})
