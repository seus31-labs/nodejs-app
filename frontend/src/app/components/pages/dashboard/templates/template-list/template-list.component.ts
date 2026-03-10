import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { Template } from '../../../../../models/template.interface'
import type { TodoPriority } from '../../../../../models/todo.interface'

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent {
  @Input() templates: Template[] = []
  @Input() loading = false
  @Input() error: string | null = null
  @Output() edit = new EventEmitter<Template>()
  @Output() delete = new EventEmitter<Template>()
  @Output() useTemplate = new EventEmitter<Template>()

  getPriorityLabel(priority: TodoPriority): string {
    const labels: Record<TodoPriority, string> = {
      low: '低',
      medium: '中',
      high: '高',
    }
    return labels[priority] ?? priority
  }

  getPriorityBadgeClass(priority: TodoPriority): string {
    const classes: Record<TodoPriority, string> = {
      low: 'bg-secondary',
      medium: 'bg-info',
      high: 'bg-danger',
    }
    return classes[priority] ?? 'bg-secondary'
  }
}
