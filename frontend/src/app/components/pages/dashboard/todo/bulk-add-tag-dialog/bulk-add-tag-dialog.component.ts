import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { TagService } from '../../../../../services/tag.service'
import type { Tag } from '../../../../../models/tag.interface'

/**
 * 一括タグ付け用ダイアログ。タグ一覧を表示し、選択したタグ ID を close で返す。
 */
@Component({
  selector: 'app-bulk-add-tag-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ],
  templateUrl: './bulk-add-tag-dialog.component.html',
  styleUrl: './bulk-add-tag-dialog.component.scss'
})
export class BulkAddTagDialogComponent {
  tags: Tag[] = []
  loading = true
  selectedTagId: number | null = null

  constructor(
    public dialogRef: MatDialogRef<BulkAddTagDialogComponent>,
    private tagService: TagService
  ) {
    this.tagService.getTags().subscribe({
      next: (list) => {
        this.tags = list ?? []
        this.loading = false
      },
      error: () => {
        this.loading = false
      }
    })
  }

  selectTag(tag: Tag): void {
    this.selectedTagId = tag.id
  }

  isSelected(tag: Tag): boolean {
    return this.selectedTagId === tag.id
  }

  apply(): void {
    if (this.selectedTagId != null) {
      this.dialogRef.close(this.selectedTagId)
    }
  }

  cancel(): void {
    this.dialogRef.close()
  }

  /** タグ色が明るい場合に true（文字色切り替え用） */
  isLight(hex: string): boolean {
    if (!hex || !hex.startsWith('#')) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
  }
}
