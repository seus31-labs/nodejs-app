import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { TodoItemComponent } from '../todo-item/todo-item.component'
import type { ReminderToggleEvent } from '../todo-item/todo-item.component'
import type { Todo } from '../../../../../models/todo.interface'
import type { Tag } from '../../../../../models/tag.interface'

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {
  @Input() todos: Todo[] = []
  @Input() allTags: Tag[] = []
  @Input() highlightQuery = ''
  @Input() loading = false
  @Input() error: string | null = null
  /** true のときドラッグ無効（ソートが「手動」以外のとき） */
  @Input() dragDisabled = true
  @Input() selectedIds: number[] = []
  @Output() selectionChange = new EventEmitter<number[]>()
  @Output() toggle = new EventEmitter<number>()
  @Output() edit = new EventEmitter<Todo>()
  @Output() delete = new EventEmitter<number>()
  @Output() archive = new EventEmitter<number>()
  @Output() share = new EventEmitter<number>()
  @Output() reminderToggled = new EventEmitter<ReminderToggleEvent>()
  @Output() reorder = new EventEmitter<number[]>()
  @Output() tagRemoved = new EventEmitter<{ todoId: number; tag: Tag }>()
  @Output() tagAdded = new EventEmitter<{ todoId: number; tagId: number }>()

  toggleSelection(id: number): void {
    const next = this.selectedIds.includes(id)
      ? this.selectedIds.filter((x) => x !== id)
      : [...this.selectedIds, id]
    this.selectionChange.emit(next)
  }

  onSelectAll(): void {
    this.selectionChange.emit(this.todos.map((t) => t.id))
  }

  onDrop(event: CdkDragDrop<Todo[]>): void {
    if (this.dragDisabled || event.previousIndex === event.currentIndex) return
    const copy = [...this.todos]
    moveItemInArray(copy, event.previousIndex, event.currentIndex)
    this.reorder.emit(copy.map((t) => t.id))
  }
}
