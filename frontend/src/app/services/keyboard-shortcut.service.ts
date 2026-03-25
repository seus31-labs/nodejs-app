import { Injectable, OnDestroy } from '@angular/core'

export interface ShortcutHelpEntry {
  keys: string
  description: string
}

/** カスタマイズ対象ショートカットの安定 ID（localStorage のキーと対応） */
export const KEYBOARD_SHORTCUT_IDS = {
  HELP: 'shortcut.help',
  NEW_TODO: 'shortcut.newTodo',
  FOCUS_SEARCH: 'shortcut.focusSearch',
} as const

export type KeyboardShortcutId = (typeof KEYBOARD_SHORTCUT_IDS)[keyof typeof KEYBOARD_SHORTCUT_IDS]

const OVERRIDES_STORAGE_KEY = 'keyboard-shortcut-overrides-v1'

export interface ShortcutCustomizationRow {
  id: KeyboardShortcutId
  description: string
  currentKeysLabel: string
  defaultKeysLabel: string
}

interface BindingRegistration {
  id: KeyboardShortcutId
  defaultKeys: string
  defaultKeysLabel: string
  handler: () => void
  description: string
}

export type SetBindingResult = { ok: true } | { ok: false; error: string }

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutService implements OnDestroy {
  private handlers = new Map<string, () => void>()
  private legacyHelpEntries: ShortcutHelpEntry[] = []
  private boundListener: (e: KeyboardEvent) => void

  private readonly bindings = new Map<KeyboardShortcutId, BindingRegistration>()
  private bindingOrder: KeyboardShortcutId[] = []
  private assignedBindingKeys = new Map<KeyboardShortcutId, string>()

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
    this.legacyHelpEntries = []
    this.bindings.clear()
    this.bindingOrder = []
    this.assignedBindingKeys.clear()
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

  normalizeComboString(input: string): string {
    return input.toLowerCase().trim().replace(/\s+/g, '')
  }

  comboStringFromEvent(e: KeyboardEvent): string {
    return this.normalizeKey(e)
  }

  private toDisplayLabel(normalized: string): string {
    if (!normalized) return ''
    return normalized
      .split('+')
      .map((p) => {
        if (p === 'ctrl') return 'Ctrl'
        if (p === 'shift') return 'Shift'
        if (p === 'alt') return 'Alt'
        if (p === 'space') return 'Space'
        if (p.length === 1) return p.toUpperCase()
        return p
      })
      .join('+')
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

  private readOverrides(): Partial<Record<KeyboardShortcutId, string>> {
    if (typeof localStorage === 'undefined') return {}
    try {
      const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw) as Record<string, string>
      return parsed as Partial<Record<KeyboardShortcutId, string>>
    } catch {
      return {}
    }
  }

  private writeOverrides(overrides: Partial<Record<KeyboardShortcutId, string>>): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides))
  }

  private effectiveNormalizedKeys(id: KeyboardShortcutId, reg: BindingRegistration): string {
    const o = this.readOverrides()[id]
    const raw = o ?? reg.defaultKeys
    return this.normalizeComboString(raw)
  }

  private releaseBindingHandlers(): void {
    for (const norm of this.assignedBindingKeys.values()) {
      this.handlers.delete(norm)
    }
    this.assignedBindingKeys.clear()
  }

  private applyBindings(): void {
    this.releaseBindingHandlers()
    const usedNorm = new Set<string>()
    for (const id of this.bindingOrder) {
      const reg = this.bindings.get(id)
      if (!reg) continue
      const norm = this.effectiveNormalizedKeys(id, reg)
      if (usedNorm.has(norm)) {
        continue
      }
      this.handlers.set(norm, reg.handler)
      this.assignedBindingKeys.set(id, norm)
      usedNorm.add(norm)
    }
  }

  private bindingHelpEntries(): ShortcutHelpEntry[] {
    return this.bindingOrder.map((id) => {
      const reg = this.bindings.get(id)!
      const o = this.readOverrides()[id]
      const raw = o ?? reg.defaultKeys
      const norm = this.normalizeComboString(raw)
      return {
        keys: this.toDisplayLabel(norm),
        description: reg.description,
      }
    })
  }

  registerBinding(reg: BindingRegistration): void {
    this.bindings.set(reg.id, reg)
    if (!this.bindingOrder.includes(reg.id)) {
      this.bindingOrder.push(reg.id)
    }
    this.applyBindings()
  }

  unregisterBinding(id: KeyboardShortcutId): void {
    const norm = this.assignedBindingKeys.get(id)
    if (norm) {
      this.handlers.delete(norm)
      this.assignedBindingKeys.delete(id)
    }
    this.bindings.delete(id)
    this.bindingOrder = this.bindingOrder.filter((x) => x !== id)
  }

  register(keys: string, handler: () => void, description?: string): void {
    const normalized = this.normalizeComboString(keys)
    this.handlers.set(normalized, handler)
    if (description != null) {
      this.legacyHelpEntries = this.legacyHelpEntries.filter(
        (h) => this.normalizeComboString(h.keys) !== normalized
      )
      this.legacyHelpEntries.push({ keys: keys.trim(), description })
    }
  }

  unregister(keys: string): void {
    const normalized = this.normalizeComboString(keys)
    this.handlers.delete(normalized)
    this.legacyHelpEntries = this.legacyHelpEntries.filter(
      (h) => this.normalizeComboString(h.keys) !== normalized
    )
  }

  getHelpEntries(): ShortcutHelpEntry[] {
    return [...this.bindingHelpEntries(), ...this.legacyHelpEntries]
  }

  getCustomizationRows(): ShortcutCustomizationRow[] {
    return this.bindingOrder.map((id) => {
      const reg = this.bindings.get(id)!
      const o = this.readOverrides()[id]
      const currentRaw = o ?? reg.defaultKeys
      const currentNorm = this.normalizeComboString(currentRaw)
      return {
        id,
        description: reg.description,
        currentKeysLabel: this.toDisplayLabel(currentNorm),
        defaultKeysLabel: reg.defaultKeysLabel,
      }
    })
  }

  setBindingKeys(id: KeyboardShortcutId, comboNormalized: string): SetBindingResult {
    const reg = this.bindings.get(id)
    if (!reg) {
      return { ok: false, error: '不明なショートカットです' }
    }
    const norm = this.normalizeComboString(comboNormalized)
    if (!norm) {
      return { ok: false, error: 'キーの組み合わせが空です' }
    }
    const parts = norm.split('+').filter(Boolean)
    if (parts.length < 2) {
      return { ok: false, error: '修飾キー（Ctrl / Shift / Alt）と1文字のキーを組み合わせてください' }
    }
    const hasModifier = parts.some((p) => p === 'ctrl' || p === 'shift' || p === 'alt')
    if (!hasModifier) {
      return { ok: false, error: '修飾キー（Ctrl / Shift / Alt）を含めてください' }
    }

    for (const otherId of this.bindingOrder) {
      if (otherId === id) continue
      const otherReg = this.bindings.get(otherId)!
      const otherNorm = this.effectiveNormalizedKeys(otherId, otherReg)
      if (otherNorm === norm) {
        return { ok: false, error: '他のショートカットと重複しています' }
      }
    }

    const overrides = { ...this.readOverrides(), [id]: norm }
    this.writeOverrides(overrides)
    this.applyBindings()
    return { ok: true }
  }

  resetBindings(id?: KeyboardShortcutId): void {
    if (id == null) {
      this.writeOverrides({})
    } else {
      const o = { ...this.readOverrides() }
      delete o[id]
      this.writeOverrides(o)
    }
    this.applyBindings()
  }
}
