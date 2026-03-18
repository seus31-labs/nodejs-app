import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap'
import type { Todo } from '../../../../../models/todo.interface'
import type { Tag } from '../../../../../models/tag.interface'
import { TagChipComponent } from '../tag-chip/tag-chip.component'

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, TagChipComponent],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss']
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo
  @Input() allTags: Tag[] = []
  @Input() highlightQuery = ''
  @Output() toggle = new EventEmitter<number>()
  @Output() edit = new EventEmitter<Todo>()
  @Output() delete = new EventEmitter<number>()
  @Output() archive = new EventEmitter<number>()
  @Output() tagRemoved = new EventEmitter<{ todoId: number; tag: Tag }>()
  @Output() tagAdded = new EventEmitter<{ todoId: number; tagId: number }>()

  onToggle(): void {
    this.toggle.emit(this.todo.id)
  }

  onEdit(): void {
    this.edit.emit(this.todo)
  }

  onDelete(): void {
    this.delete.emit(this.todo.id)
  }

  onArchive(): void {
    this.archive.emit(this.todo.id)
  }

  onTagRemoved(tag: Tag): void {
    this.tagRemoved.emit({ todoId: this.todo.id, tag })
  }

  onAddTag(tagId: number): void {
    this.tagAdded.emit({ todoId: this.todo.id, tagId })
  }

  get tags(): Tag[] {
    return this.todo.Tags ?? []
  }

  get availableTagsToAdd(): Tag[] {
    const onTodo = new Set((this.todo.Tags ?? []).map((t) => t.id))
    return this.allTags.filter((t) => !onTodo.has(t.id))
  }

  /** 優先度バッジの Bootstrap クラス */
  priorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-danger'
      case 'medium':
        return 'bg-warning text-dark'
      case 'low':
        return 'bg-success'
      default:
        return 'bg-secondary'
    }
  }

  /** 期限の表示用クラス（期限切れ=赤、今日=黄） */
  dueDateClass(dueDate: string | null): string {
    if (!dueDate) return ''
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    if (due < today) return 'text-danger'
    if (due.getTime() === today.getTime()) return 'text-warning'
    return ''
  }

  highlightParts(text: string): Array<{ text: string; match: boolean }> {
    const raw = (this.highlightQuery ?? '').trim()
    if (!raw) return [{ text, match: false }]

    const tokens = raw.split(/\s+/).filter((t) => t.length >= 2)
    if (tokens.length === 0) return [{ text, match: false }]

    const escaped = tokens.map((t) => this.escapeRegExp(t))
    const re = new RegExp(`(${escaped.join('|')})`, 'gi')
    const parts: Array<{ text: string; match: boolean }> = []
    let lastIndex = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(text)) !== null) {
      const start = m.index
      const end = start + m[0].length
      if (start > lastIndex) parts.push({ text: text.slice(lastIndex, start), match: false })
      parts.push({ text: text.slice(start, end), match: true })
      lastIndex = end
      if (m[0].length === 0) re.lastIndex++
    }

    if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), match: false })
    return parts.length ? parts : [{ text, match: false }]
  }

  private escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}
