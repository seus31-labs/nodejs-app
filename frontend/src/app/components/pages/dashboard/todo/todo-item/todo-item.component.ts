import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap'
import type { Todo } from '../../../../../models/todo.interface'
import type { Tag } from '../../../../../models/tag.interface'
import { TagChipComponent } from '../tag-chip/tag-chip.component'
import { TodoCommentsSectionComponent } from '../todo-comments-section/todo-comments-section.component'
import { ProgressBarComponent } from '../../../../progress-bar/progress-bar.component'
import SubtaskListComponent from '../../../../subtask-list/subtask-list.component'

export interface ReminderToggleEvent {
  todoId: number
  enabled: boolean
}

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    TagChipComponent,
    TodoCommentsSectionComponent,
    ProgressBarComponent,
    SubtaskListComponent
  ],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent implements OnChanges {
  @Input({ required: true }) todo!: Todo
  @Input() allTags: Tag[] = []
  @Input() highlightQuery = ''
  @Output() toggle = new EventEmitter<number>()
  @Output() edit = new EventEmitter<Todo>()
  @Output() delete = new EventEmitter<number>()
  @Output() archive = new EventEmitter<number>()
  @Output() share = new EventEmitter<number>()
  @Output() reminderToggled = new EventEmitter<ReminderToggleEvent>()
  @Output() tagRemoved = new EventEmitter<{ todoId: number; tag: Tag }>()
  @Output() tagAdded = new EventEmitter<{ todoId: number; tagId: number }>()

  titleParts: Array<{ text: string; match: boolean }> = []
  descParts: Array<{ text: string; match: boolean }> = []
  showSubtasks = false

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo'] || changes['highlightQuery']) {
      this.titleParts = this.highlightParts(this.todo?.title ?? '')
      this.descParts = this.todo?.description ? this.highlightParts(this.todo.description) : []
    }
  }

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

  onShare(): void {
    this.share.emit(this.todo.id)
  }

  onToggleReminder(): void {
    this.reminderToggled.emit({ todoId: this.todo.id, enabled: !this.todo.reminderEnabled })
  }

  onTagRemoved(tag: Tag): void {
    this.tagRemoved.emit({ todoId: this.todo.id, tag })
  }

  onAddTag(tagId: number): void {
    this.tagAdded.emit({ todoId: this.todo.id, tagId })
  }

  toggleSubtasks(): void {
    this.showSubtasks = !this.showSubtasks
  }

  onSubtasksUpdated(subtasks: Todo[]): void {
    const completed = subtasks.filter((t) => t.completed).length
    this.todo = {
      ...this.todo,
      subtasks,
      progress: { completed, total: subtasks.length }
    }
  }

  get hasSubtasks(): boolean {
    const total = this.todo?.progress?.total ?? this.todo?.subtasks?.length ?? 0
    return total > 0
  }

  get tags(): Tag[] {
    return this.todo.Tags ?? []
  }

  get availableTagsToAdd(): Tag[] {
    const onTodo = new Set((this.todo.Tags ?? []).map((t) => t.id))
    return this.allTags.filter((t) => !onTodo.has(t.id))
  }

  get recurrenceTooltip(): string {
    if (!this.todo?.isRecurring) return ''
    const patternMap: Record<string, string> = {
      daily: '毎日',
      weekly: '毎週',
      monthly: '毎月'
    }
    const pattern = this.todo.recurrencePattern ? (patternMap[this.todo.recurrencePattern] ?? this.todo.recurrencePattern) : '繰り返し'
    const interval = this.todo.recurrenceInterval ?? 1
    const endDate = this.todo.recurrenceEndDate ? `（終了日: ${this.todo.recurrenceEndDate}）` : ''
    return `${pattern} / ${interval} 回ごと${endDate}`
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

    const tokens = raw.split(/\s+/).filter((t) => t.length >= 1)
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
