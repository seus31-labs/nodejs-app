import { Component, EventEmitter, Input, Output } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { BulkAddTagDialogComponent } from '../bulk-add-tag-dialog/bulk-add-tag-dialog.component'

@Component({
  selector: 'app-bulk-action-bar',
  standalone: true,
  imports: [],
  templateUrl: './bulk-action-bar.component.html',
  styleUrls: ['./bulk-action-bar.component.scss']
})
export class BulkActionBarComponent {
  @Input() selectedCount = 0
  @Output() bulkComplete = new EventEmitter<void>()
  @Output() bulkDelete = new EventEmitter<void>()
  @Output() bulkArchive = new EventEmitter<void>()
  @Output() bulkAddTag = new EventEmitter<number>()
  @Output() clearSelection = new EventEmitter<void>()

  constructor(private dialog: MatDialog) {}

  openBulkAddTagDialog(): void {
    const ref = this.dialog.open(BulkAddTagDialogComponent, {
      width: '400px'
    })
    ref.afterClosed().subscribe((tagId: number | undefined) => {
      if (tagId != null && typeof tagId === 'number') {
        this.bulkAddTag.emit(tagId)
      }
    })
  }
}
