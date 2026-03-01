import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'app-theme'

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly theme$ = new BehaviorSubject<Theme>(this.getStored())

  get currentTheme(): Theme {
    return this.theme$.getValue()
  }

  get themeChanges(): Observable<Theme> {
    return this.theme$.asObservable()
  }

  /** ローカルストレージから復元（デフォルト light） */
  private getStored(): Theme {
    if (typeof window === 'undefined' || !window.localStorage) return 'light'
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'dark' ? 'dark' : 'light'
  }

  /** 起動時に body にクラスを適用（AppComponent から呼ぶ） */
  init(): void {
    this.applyToDom(this.currentTheme)
  }

  setTheme(theme: Theme): void {
    if (this.theme$.getValue() === theme) return
    this.theme$.next(theme)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme)
      this.applyToDom(theme)
    }
  }

  toggle(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light')
  }

  private applyToDom(theme: Theme): void {
    if (typeof document === 'undefined') return
    const body = document.body
    if (theme === 'dark') {
      body.classList.add('dark-mode')
    } else {
      body.classList.remove('dark-mode')
    }
  }
}
