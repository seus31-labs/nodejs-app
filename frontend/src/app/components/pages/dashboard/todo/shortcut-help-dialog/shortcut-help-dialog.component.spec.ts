import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { MatDialogRef } from '@angular/material/dialog'
import { ShortcutHelpDialogComponent } from './shortcut-help-dialog.component'
import { KeyboardShortcutService, KEYBOARD_SHORTCUT_IDS } from '../../../../../services/keyboard-shortcut.service'

describe('ShortcutHelpDialogComponent (19.11 / 19.9)', () => {
  let component: ShortcutHelpDialogComponent
  let fixture: ComponentFixture<ShortcutHelpDialogComponent>
  let shortcutService: jasmine.SpyObj<KeyboardShortcutService>

  beforeEach(async () => {
    shortcutService = jasmine.createSpyObj('KeyboardShortcutService', [
      'getHelpEntries',
      'getCustomizationRows',
      'setBindingKeys',
      'resetBindings',
      'comboStringFromEvent',
    ])
    shortcutService.getHelpEntries.and.returnValue([
      { keys: 'Ctrl+N', description: '新規 Todo' },
      { keys: 'Ctrl+F', description: '検索' },
    ])
    shortcutService.getCustomizationRows.and.returnValue([
      {
        id: KEYBOARD_SHORTCUT_IDS.NEW_TODO,
        description: '新規 Todo',
        currentKeysLabel: 'Ctrl+N',
        defaultKeysLabel: 'Ctrl+N',
      },
    ])
    shortcutService.setBindingKeys.and.returnValue({ ok: true })
    shortcutService.comboStringFromEvent.and.returnValue('ctrl+n')

    await TestBed.configureTestingModule({
      imports: [ShortcutHelpDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: KeyboardShortcutService, useValue: shortcutService },
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(ShortcutHelpDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display help entries from service', () => {
    expect(component.entries.length).toBe(2)
    expect(component.entries[0].keys).toBe('Ctrl+N')
    expect(component.entries[0].description).toBe('新規 Todo')
  })

  it('should load customization rows', () => {
    expect(component.rows.length).toBe(1)
    expect(component.rows[0].id).toBe(KEYBOARD_SHORTCUT_IDS.NEW_TODO)
  })

  it('should call resetBindings when resetRow', () => {
    component.resetRow(KEYBOARD_SHORTCUT_IDS.NEW_TODO)
    expect(shortcutService.resetBindings).toHaveBeenCalledWith(KEYBOARD_SHORTCUT_IDS.NEW_TODO)
  })
})
