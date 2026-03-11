import { TestBed } from '@angular/core/testing'
import { KeyboardShortcutService } from './keyboard-shortcut.service'

describe('KeyboardShortcutService (19.11)', () => {
  let service: KeyboardShortcutService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(KeyboardShortcutService)
  })

  afterEach(() => {
    service.ngOnDestroy()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should register and return help entries', () => {
    const fn = jasmine.createSpy('handler')
    service.register('Ctrl+N', fn, 'New todo')
    expect(service.getHelpEntries().length).toBe(1)
    expect(service.getHelpEntries()[0]).toEqual({ keys: 'Ctrl+N', description: 'New todo' })
  })

  it('should unregister and remove from help entries', () => {
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
})
