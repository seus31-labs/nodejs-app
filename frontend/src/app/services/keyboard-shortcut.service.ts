import { Injectable, OnDestroy } from '@angular/core'

export interface ShortcutHelpEntry {
  keys: string
  description: string
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutService implements OnDestroy {
  private handlers = new Map<string, () => void>()
  private helpEntries: ShortcutHelpEntry[] = []
  private boundListener: (e: KeyboardEvent) => void

  constructor() {
    this.boundListener = (e: KeyboardEvent) => this.handleKeyDown(e)
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.boundListener)
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.boundListener)
    }
    this.handlers.clear()
    this.helpEntries = []
  }

  private isInputFocused(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false
    const tag = target.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
    if (target.isContentEditable) return true
    return false
  }

  private normalizeKey(e: KeyboardEvent): string {
    const parts: string[] = []
    if (e.ctrlKey || e.metaKey) parts.push('ctrl')
    if (e.shiftKey) parts.push('shift')
    if (e.altKey) parts.push('alt')
    const key = e.key?.toLowerCase() ?? ''
    if (key && !parts.includes(key)) parts.push(key === ' ' ? 'space' : key)
    return parts.join('+')
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.isInputFocused(e.target)) return
    const key = this.normalizeKey(e)
    const handler = this.handlers.get(key)
    if (handler) {
      e.preventDefault()
      handler()
    }
  }

  register(keys: string, handler: () => void, description?: string): void {
    const normalized = keys.toLowerCase().trim().replace(/\s+/g, '')
    this.handlers.set(normalized, handler)
    if (description != null) {
      this.helpEntries = this.helpEntries.filter(
        (h) => h.keys.toLowerCase().trim().replace(/\s+/g, '') !== normalized
      )
      this.helpEntries.push({ keys: keys.trim(), description })
    }
  }

  unregister(keys: string): void {
    const normalized = keys.toLowerCase().trim().replace(/\s+/g, '')
    this.handlers.delete(normalized)
    this.helpEntries = this.helpEntries.filter((h) => h.keys.toLowerCase().replace(/\s+/g, '') !== normalized)
  }

  getHelpEntries(): ShortcutHelpEntry[] {
    return [...this.helpEntries]
  }
}
