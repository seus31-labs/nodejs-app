import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import type { Comment } from '../../../../../models/comment.interface'

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentListComponent implements OnChanges {
  @Input() comments: Comment[] = []
  @Input() busyCommentId: number | null = null
  @Output() deleted = new EventEmitter<number>()
  @Output() saved = new EventEmitter<{ id: number; content: string }>()

  editingId: number | null = null
  editDraft = ''

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comments'] && this.editingId !== null) {
      const exists = this.comments.some((c) => c.id === this.editingId)
      if (!exists) this.cancelEdit()
    }
  }

  startEdit(c: Comment): void {
    this.editingId = c.id
    this.editDraft = c.content
  }

  cancelEdit(): void {
    this.editingId = null
    this.editDraft = ''
  }

  saveEdit(): void {
    if (this.editingId === null) return
    const text = this.editDraft.trim()
    if (!text) return
    const id = this.editingId
    this.saved.emit({ id, content: text })
    this.cancelEdit()
  }

  onDelete(id: number): void {
    this.deleted.emit(id)
  }
}
