import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { KeyboardShortcutService, type ShortcutHelpEntry } from '../../../../../services/keyboard-shortcut.service'

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
export class ShortcutHelpDialogComponent {
  entries: ShortcutHelpEntry[] = []

  constructor(
    public dialogRef: MatDialogRef<ShortcutHelpDialogComponent>,
    private shortcutService: KeyboardShortcutService
  ) {
    this.entries = this.shortcutService.getHelpEntries()
  }

  close(): void {
    this.dialogRef.close()
  }
}
