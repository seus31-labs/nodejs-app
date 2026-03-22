import { TestBed } from '@angular/core/testing'
import { KeyboardShortcutService, KEYBOARD_SHORTCUT_IDS } from './keyboard-shortcut.service'

describe('KeyboardShortcutService (19.11 / 19.9)', () => {
  let service: KeyboardShortcutService

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({})
    service = TestBed.inject(KeyboardShortcutService)
  })

  afterEach(() => {
    service.ngOnDestroy()
    localStorage.clear()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should register legacy and return help entries', () => {
    const fn = jasmine.createSpy('handler')
    service.register('Ctrl+N', fn, 'New todo')
    expect(service.getHelpEntries().length).toBe(1)
    expect(service.getHelpEntries()[0]).toEqual({ keys: 'Ctrl+N', description: 'New todo' })
  })

  it('should unregister legacy and remove from help entries', () => {
    service.register('Ctrl+N', () => {}, 'New todo')
    service.unregister('Ctrl+N')
    expect(service.getHelpEntries().length).toBe(0)
  })

  it('should call handler on matching keydown event', () => {
    const fn = jasmine.createSpy('handler')
    service.register('Ctrl+N', fn, 'New todo')
    const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
    spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    expect(fn).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('should not call handler when input is focused', () => {
    const fn = jasmine.createSpy('handler')
    service.register('Ctrl+N', fn, 'New todo')
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
    input.dispatchEvent(event)
    expect(fn).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('registerBinding: help + overrides in getCustomizationRows', () => {
    const fn = jasmine.createSpy('h')
    service.registerBinding({
      id: KEYBOARD_SHORTCUT_IDS.HELP,
      defaultKeys: 'shift+?',
      defaultKeysLabel: 'Shift+?',
      handler: fn,
      description: 'ヘルプ',
    })
    const rows = service.getCustomizationRows()
    expect(rows.length).toBe(1)
    expect(rows[0].currentKeysLabel).toContain('Shift')
    const ev = new KeyboardEvent('keydown', { key: '?', shiftKey: true, bubbles: true })
    document.dispatchEvent(ev)
    expect(fn).toHaveBeenCalled()
  })

  it('setBindingKeys persists and uses new combo', () => {
    const fn = jasmine.createSpy('h')
    service.registerBinding({
      id: KEYBOARD_SHORTCUT_IDS.NEW_TODO,
      defaultKeys: 'ctrl+n',
      defaultKeysLabel: 'Ctrl+N',
      handler: fn,
      description: '新規',
    })
    const res = service.setBindingKeys(KEYBOARD_SHORTCUT_IDS.NEW_TODO, 'ctrl+shift+t')
    expect(res.ok).toBe(true)
    fn.calls.reset()
    const ev = new KeyboardEvent('keydown', { key: 't', ctrlKey: true, shiftKey: true, bubbles: true })
    document.dispatchEvent(ev)
    expect(fn).toHaveBeenCalled()
  })

  it('setBindingKeys rejects duplicate assigned to another binding', () => {
    service.registerBinding({
      id: KEYBOARD_SHORTCUT_IDS.NEW_TODO,
      defaultKeys: 'ctrl+n',
      defaultKeysLabel: 'Ctrl+N',
      handler: () => {},
      description: '新規',
    })
    service.registerBinding({
      id: KEYBOARD_SHORTCUT_IDS.FOCUS_SEARCH,
      defaultKeys: 'ctrl+f',
      defaultKeysLabel: 'Ctrl+F',
      handler: () => {},
      description: '検索',
    })
    const res = service.setBindingKeys(KEYBOARD_SHORTCUT_IDS.FOCUS_SEARCH, 'ctrl+n')
    expect(res.ok).toBe(false)
    if (res.ok === false) {
      expect(res.error).toContain('重複')
    }
  })

  it('resetBindings clears overrides', () => {
    const fn = jasmine.createSpy('h')
    service.registerBinding({
      id: KEYBOARD_SHORTCUT_IDS.NEW_TODO,
      defaultKeys: 'ctrl+n',
      defaultKeysLabel: 'Ctrl+N',
      handler: fn,
      description: '新規',
    })
    service.setBindingKeys(KEYBOARD_SHORTCUT_IDS.NEW_TODO, 'ctrl+shift+y')
    service.resetBindings()
    fn.calls.reset()
    const ev = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true, bubbles: true })
    document.dispatchEvent(ev)
    expect(fn).toHaveBeenCalled()
  })

  it('setBindingKeys rejects combo without modifier keys', () => {
    service.registerBinding({
      id: KEYBOARD_SHORTCUT_IDS.NEW_TODO,
      defaultKeys: 'ctrl+n',
      defaultKeysLabel: 'Ctrl+N',
      handler: () => {},
      description: '新規',
    })
    const res = service.setBindingKeys(KEYBOARD_SHORTCUT_IDS.NEW_TODO, 'n')
    expect(res.ok).toBe(false)
  })
})
