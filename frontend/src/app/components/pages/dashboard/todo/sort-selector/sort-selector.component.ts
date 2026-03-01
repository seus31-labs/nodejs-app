import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { SortBy, SortOrder, SortOptions } from '../../../../../models/sort-options.interface'

@Component({
  selector: 'app-sort-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sort-selector.component.html',
  styleUrls: ['./sort-selector.component.scss']
})
export class SortSelectorComponent {
  @Input() sortBy: SortBy = 'createdAt'
  @Input() sortOrder: SortOrder = 'asc'
  @Output() sortChanged = new EventEmitter<SortOptions>()

  readonly sortByOptions: { value: SortBy; label: string }[] = [
    { value: 'createdAt', label: '作成日' },
    { value: 'updatedAt', label: '更新日' },
    { value: 'dueDate', label: '期限' },
    { value: 'priority', label: '優先度' },
    { value: 'sortOrder', label: '手動' },
  ]

  onSortByChange(value: string): void {
    const sortBy = value as SortBy
    this.sortChanged.emit({ sortBy, sortOrder: this.sortOrder })
  }

  toggleSortOrder(): void {
    const sortOrder: SortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    this.sortChanged.emit({ sortBy: this.sortBy, sortOrder })
  }
}
