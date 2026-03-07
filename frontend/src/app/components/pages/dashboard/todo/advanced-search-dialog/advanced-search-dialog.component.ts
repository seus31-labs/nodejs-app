import { Component, Inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import type { SearchParams } from '../../../../../models/search-params.interface'
import type { Tag } from '../../../../../models/tag.interface'
import type { TodoPriority } from '../../../../../models/todo.interface'

export interface AdvancedSearchDialogData {
  currentParams: Partial<SearchParams> | null
  allTags: Tag[]
}

/**
 * 詳細検索ダイアログ。優先度・完了状態・タグ・キーワードをまとめて指定し、
 * 適用時に SearchParams を close で返す。
 */
@Component({
  selector: 'app-advanced-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './advanced-search-dialog.component.html',
  styleUrl: './advanced-search-dialog.component.scss'
})
export class AdvancedSearchDialogComponent {
  form: FormGroup
  allTags: Tag[]
  priorityOptions: { value: '' | TodoPriority; label: string }[] = [
    { value: '', label: '指定しない' },
    { value: 'low', label: 'low' },
    { value: 'medium', label: 'medium' },
    { value: 'high', label: 'high' }
  ]
  completedOptions: { value: '' | 'true' | 'false'; label: string }[] = [
    { value: '', label: '指定しない' },
    { value: 'false', label: '未完了' },
    { value: 'true', label: '完了' }
  ]

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdvancedSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AdvancedSearchDialogData
  ) {
    this.allTags = data.allTags ?? []
    const p = data.currentParams ?? {}
    this.form = this.fb.nonNullable.group({
      q: [p.q ?? ''],
      completed: [p.completed === undefined ? '' : String(p.completed)],
      priority: [p.priority ?? ''],
      tagIds: [p.tagIds ?? [] as number[]]
    })
  }

  get tagIdsFormValue(): number[] {
    const v = this.form.get('tagIds')?.value
    return Array.isArray(v) ? v : []
  }

  toggleTag(tagId: number): void {
    const current = this.tagIdsFormValue
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId]
    this.form.patchValue({ tagIds: next })
  }

  apply(): void {
    const raw = this.form.getRawValue()
    const completed =
      raw.completed === '' ? undefined : raw.completed === 'true'
    const priority =
      raw.priority === '' ? undefined : (raw.priority as TodoPriority)
    const tagIds = Array.isArray(raw.tagIds) && raw.tagIds.length > 0
      ? raw.tagIds
      : undefined
    const params: SearchParams = {
      q: (raw.q ?? '').trim(),
      ...(completed !== undefined && { completed }),
      ...(priority !== undefined && { priority }),
      ...(tagIds !== undefined && { tagIds })
    }
    this.dialogRef.close(params)
  }

  clear(): void {
    this.form.reset({
      q: '',
      completed: '',
      priority: '',
      tagIds: []
    })
  }

  cancel(): void {
    this.dialogRef.close()
  }

  /** タグ色が明るい場合に true（チップの文字色切り替え用） */
  isLight(hex: string): boolean {
    if (!hex || !hex.startsWith('#')) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
  }
}
