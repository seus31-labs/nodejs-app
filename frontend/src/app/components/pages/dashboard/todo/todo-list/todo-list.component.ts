import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { TodoItemComponent } from '../todo-item/todo-item.component'
import type { Todo } from '../../../../../models/todo.interface'

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {
  @Input() todos: Todo[] = []
  @Input() loading = false
  @Input() error: string | null = null
  /** true のときドラッグ無効（ソートが「手動」以外のとき） */
  @Input() dragDisabled = true
  @Output() toggle = new EventEmitter<number>()
  @Output() edit = new EventEmitter<Todo>()
  @Output() delete = new EventEmitter<number>()
  @Output() archived = new EventEmitter<number>()
  @Output() reorder = new EventEmitter<number[]>()

  onDrop(event: CdkDragDrop<Todo[]>): void {
    if (this.dragDisabled || event.previousIndex === event.currentIndex) return
    const copy = [...this.todos]
    moveItemInArray(copy, event.previousIndex, event.currentIndex)
    this.reorder.emit(copy.map((t) => t.id))
  }
}
