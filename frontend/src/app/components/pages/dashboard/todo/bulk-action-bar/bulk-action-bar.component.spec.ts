import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { of } from 'rxjs'
import { BulkActionBarComponent } from './bulk-action-bar.component'

describe('BulkActionBarComponent (15.17)', () => {
  let component: BulkActionBarComponent
  let fixture: ComponentFixture<BulkActionBarComponent>
  let dialogMock: jasmine.SpyObj<MatDialog>

  beforeEach(async () => {
    dialogMock = jasmine.createSpyObj('MatDialog', ['open'])
    await TestBed.configureTestingModule({
      imports: [BulkActionBarComponent],
      providers: [{ provide: MatDialog, useValue: dialogMock }],
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

  function getButtonByText(text: string): HTMLElement | undefined {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLElement[]
    return buttons.find((b) => b.textContent?.trim() === text)
  }

  it('should emit bulkComplete when 一括完了 is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.bulkComplete.subscribe(() => (emitted = true))
    getButtonByText('一括完了')?.click()
    expect(emitted).toBe(true)
  })

  it('should emit bulkArchive when 一括アーカイブ is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.bulkArchive.subscribe(() => (emitted = true))
    getButtonByText('一括アーカイブ')?.click()
    expect(emitted).toBe(true)
  })

  it('should emit bulkDelete when 一括削除 is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.bulkDelete.subscribe(() => (emitted = true))
    getButtonByText('一括削除')?.click()
    expect(emitted).toBe(true)
  })

  it('should emit clearSelection when 選択解除 is clicked', () => {
    component.selectedCount = 1
    fixture.detectChanges()
    let emitted = false
    component.clearSelection.subscribe(() => (emitted = true))
    const clearBtn = getButtonByText('選択解除')
    expect(clearBtn).withContext('選択解除ボタンが見つかりません').toBeTruthy()
    clearBtn!.click()
    expect(emitted).toBe(true)
  })

  it('should open bulk-add-tag dialog and emit bulkAddTag with tagId when user selects tag (15.14)', () => {
    const tagId = 7
    const ref = { afterClosed: () => of(tagId) }
    dialogMock.open.and.returnValue(ref as never)
    component.selectedCount = 2
    fixture.detectChanges()
    let emittedTagId: number | undefined
    component.bulkAddTag.subscribe((id) => (emittedTagId = id))
    getButtonByText('一括タグ付け')?.click()
    expect(dialogMock.open).toHaveBeenCalled()
    expect(emittedTagId).toBe(tagId)
  })
})
