import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { TagService } from '../../../../services/tag.service'
import { CardComponent } from '../../../../theme/shared/components/card/card.component'
import type { Tag, CreateTagDto } from '../../../../models/tag.interface'

@Component({
  selector: 'app-tags-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './tags-page.component.html',
  styleUrls: ['./tags-page.component.scss']
})
export default class TagsPageComponent implements OnInit, OnDestroy {
  tags: Tag[] = []
  loading = false
  error: string | null = null
  newName = ''
  newColor = '#808080'
  private destroy$ = new Subject<void>()

  constructor(private tagService: TagService) {}

  ngOnInit(): void {
    this.loadTags()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadTags(): void {
    this.loading = true
    this.error = null
    this.tagService.getTags().pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => {
        this.tags = list
        this.loading = false
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.message ?? '取得に失敗しました'
        this.loading = false
      }
    })
  }

  onSubmit(): void {
    const name = this.newName.trim()
    if (!name) return
    const body: CreateTagDto = { name, color: this.newColor }
    this.tagService.create(body).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.newName = ''
        this.newColor = '#808080'
        this.loadTags()
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.message ?? '作成に失敗しました'
      }
    })
  }

  onDelete(tag: Tag): void {
    if (!confirm(`タグ「${tag.name}」を削除しますか？`)) return
    this.tagService.delete(tag.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadTags(),
      error: (err) => {
        this.error = err?.error?.message ?? err?.message ?? '削除に失敗しました'
      }
    })
  }

  isLight(hex: string): boolean {
    if (!hex || !hex.startsWith('#')) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
  }
}
