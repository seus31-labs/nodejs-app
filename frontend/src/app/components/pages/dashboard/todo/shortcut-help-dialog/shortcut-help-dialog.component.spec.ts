import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { MatDialogRef } from '@angular/material/dialog'
import { ShortcutHelpDialogComponent } from './shortcut-help-dialog.component'
import { KeyboardShortcutService } from '../../../../../services/keyboard-shortcut.service'

describe('ShortcutHelpDialogComponent (19.11)', () => {
  let component: ShortcutHelpDialogComponent
  let fixture: ComponentFixture<ShortcutHelpDialogComponent>
  let shortcutService: jasmine.SpyObj<KeyboardShortcutService>

  beforeEach(async () => {
    shortcutService = jasmine.createSpyObj('KeyboardShortcutService', ['getHelpEntries'])
    shortcutService.getHelpEntries.and.returnValue([
      { keys: 'Ctrl+N', description: '新規 Todo' },
      { keys: 'Ctrl+F', description: '検索' }
    ])
    await TestBed.configureTestingModule({
      imports: [ShortcutHelpDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: KeyboardShortcutService, useValue: shortcutService }
      ]
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
})
