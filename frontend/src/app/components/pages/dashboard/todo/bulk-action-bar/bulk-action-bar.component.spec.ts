import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BulkActionBarComponent } from './bulk-action-bar.component'

describe('BulkActionBarComponent (15.17)', () => {
  let component: BulkActionBarComponent
  let fixture: ComponentFixture<BulkActionBarComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkActionBarComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(BulkActionBarComponent)
    component = fixture.componentInstance
    component.selectedCount = 0
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not show bar when selectedCount is 0', () => {
    expect(fixture.nativeElement.querySelector('.bulk-action-bar')).toBeNull()
  })

  it('should show bar and selected count when selectedCount > 0', () => {
    component.selectedCount = 3
    fixture.detectChanges()
    const bar = fixture.nativeElement.querySelector('.bulk-action-bar')
    expect(bar).toBeTruthy()
    expect(bar.textContent).toContain('3 件選択')
  })

  it('should emit bulkComplete when 一括完了 is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.bulkComplete.subscribe(() => (emitted = true))
    fixture.nativeElement.querySelector('.btn-outline-success').click()
    expect(emitted).toBe(true)
  })

  it('should emit bulkArchive when 一括アーカイブ is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.bulkArchive.subscribe(() => (emitted = true))
    fixture.nativeElement.querySelector('.btn-outline-secondary').click()
    expect(emitted).toBe(true)
  })

  it('should emit bulkDelete when 一括削除 is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.bulkDelete.subscribe(() => (emitted = true))
    fixture.nativeElement.querySelector('.btn-outline-danger').click()
    expect(emitted).toBe(true)
  })

  it('should emit clearSelection when 選択解除 is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.clearSelection.subscribe(() => (emitted = true))
    const buttons = fixture.nativeElement.querySelectorAll('button')
    const clearBtn = Array.from(buttons).find((b: HTMLElement) => b.textContent?.trim() === '選択解除')
    ;(clearBtn as HTMLElement).click()
    expect(emitted).toBe(true)
  })
})
