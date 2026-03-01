import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TodoItemComponent } from '../todo-item/todo-item.component'
import type { Todo } from '../../../../../models/todo.interface'

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {
  @Input() todos: Todo[] = []
  @Input() loading = false
  @Input() error: string | null = null
  @Output() toggle = new EventEmitter<number>()
  @Output() edit = new EventEmitter<Todo>()
  @Output() delete = new EventEmitter<number>()
}
