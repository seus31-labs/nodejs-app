import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-bulk-action-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-action-bar.component.html',
  styleUrls: ['./bulk-action-bar.component.scss']
})
export class BulkActionBarComponent {
  @Input() selectedCount = 0
  @Output() bulkComplete = new EventEmitter<void>()
  @Output() bulkDelete = new EventEmitter<void>()
  @Output() bulkArchive = new EventEmitter<void>()
  @Output() clearSelection = new EventEmitter<void>()
}
