import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { Todo } from '../../../../../models/todo.interface'

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss']
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo
  @Output() toggle = new EventEmitter<number>()
  @Output() edit = new EventEmitter<Todo>()
  @Output() delete = new EventEmitter<number>()
  @Output() archive = new EventEmitter<number>()

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
}
