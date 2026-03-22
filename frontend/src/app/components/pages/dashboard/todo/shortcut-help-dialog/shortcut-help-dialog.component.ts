import { Component, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import {
  KeyboardShortcutService,
  type ShortcutHelpEntry,
  type KeyboardShortcutId,
  type ShortcutCustomizationRow,
} from '../../../../../services/keyboard-shortcut.service'

@Component({
  selector: 'app-shortcut-help-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ],
  templateUrl: './shortcut-help-dialog.component.html',
  styleUrl: './shortcut-help-dialog.component.scss'
})
export class ShortcutHelpDialogComponent implements OnDestroy {
  entries: ShortcutHelpEntry[] = []
  rows: ShortcutCustomizationRow[] = []
  captureForId: KeyboardShortcutId | null = null
  feedback: string | null = null

  private captureListener: ((e: Event) => void) | null = null

  constructor(
    public dialogRef: MatDialogRef<ShortcutHelpDialogComponent>,
    private shortcutService: KeyboardShortcutService
  ) {
    this.refreshLists()
  }

  ngOnDestroy(): void {
    this.detachCaptureListener()
  }

  refreshLists(): void {
    this.entries = this.shortcutService.getHelpEntries()
    this.rows = this.shortcutService.getCustomizationRows()
  }

  close(): void {
    this.dialogRef.close()
  }

  startCapture(id: KeyboardShortcutId): void {
    this.detachCaptureListener()
    this.captureForId = id
    this.feedback = 'キーを押してください（Escape でキャンセル）'
    this.captureListener = (ev: Event) => this.onCaptureKeydown(ev as KeyboardEvent)
    document.addEventListener('keydown', this.captureListener, true)
  }

  private detachCaptureListener(): void {
    if (this.captureListener) {
      document.removeEventListener('keydown', this.captureListener, true)
      this.captureListener = null
    }
  }

  private onCaptureKeydown(e: KeyboardEvent): void {
    if (!this.captureForId) return
    e.preventDefault()
    e.stopImmediatePropagation()
    const id = this.captureForId
    if (e.key === 'Escape') {
      this.captureForId = null
      this.feedback = null
      this.detachCaptureListener()
      return
    }
    const combo = this.shortcutService.comboStringFromEvent(e)
    const res = this.shortcutService.setBindingKeys(id, combo)
    this.captureForId = null
    this.detachCaptureListener()
    if (res.ok === false) {
      this.feedback = res.error
    } else {
      this.feedback = '保存しました'
    }
    this.refreshLists()
  }

  resetRow(id: KeyboardShortcutId): void {
    this.shortcutService.resetBindings(id)
    this.feedback = '初期値に戻しました'
    this.refreshLists()
  }

  resetAll(): void {
    this.shortcutService.resetBindings()
    this.feedback = 'すべて初期値に戻しました'
    this.refreshLists()
  }
}
