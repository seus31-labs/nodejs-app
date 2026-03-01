import { Component, EventEmitter, Input, Output } from '@angular/core'
import type { Tag } from '../../../../../models/tag.interface'

@Component({
  selector: 'app-tag-chip',
  standalone: true,
  imports: [],
  templateUrl: './tag-chip.component.html',
  styleUrls: ['./tag-chip.component.scss']
})
export class TagChipComponent {
  @Input({ required: true }) tag!: Tag
  @Input() removable = false
  @Output() removed = new EventEmitter<Tag>()

  onRemove(): void {
    this.removed.emit(this.tag)
  }

  /** 背景色が明るい場合は true（ダークテキスト用） */
  isLight(hex: string): boolean {
    if (!hex || !hex.startsWith('#')) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6
  }
}
