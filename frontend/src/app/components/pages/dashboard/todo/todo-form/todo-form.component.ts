import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import type { Todo, TodoCreateUpdate } from '../../../../../models/todo.interface'
import type { Project } from '../../../../../models/project.interface'
import type { Template } from '../../../../../models/template.interface'

function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string
  return value && value.trim().length === 0 ? { whitespace: true } : null
}

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss']
})
export class TodoFormComponent implements OnChanges {
  @Input() editingTodo: Todo | null = null
  @Input() projects: Project[] = []
  @Input() templates: Template[] = []
  @Output() submitForm = new EventEmitter<TodoCreateUpdate>()
  @Output() cancel = new EventEmitter<void>()

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255), noWhitespaceValidator]],
      description: [''],
      priority: ['medium' as const],
      dueDate: [''],
      projectId: [null as number | null]
    })
  }

  ngOnChanges(): void {
    if (this.editingTodo) {
      this.form.patchValue({
        title: this.editingTodo.title,
        description: this.editingTodo.description ?? '',
        priority: this.editingTodo.priority,
        dueDate: this.editingTodo.dueDate ?? '',
        projectId: this.editingTodo.projectId ?? null
      })
    } else {
      this.form.reset({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        projectId: null
      })
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return
    const v = this.form.value
    const projectId = v.projectId != null ? Number(v.projectId) : null
    const payload: TodoCreateUpdate = {
      title: v.title.trim(),
      description: v.description?.trim() || null,
      priority: v.priority || 'medium',
      dueDate: v.dueDate || null,
      projectId,
    }
    this.submitForm.emit(payload)
  }

  onCancel(): void {
    this.cancel.emit()
  }

  onTemplateSelect(event: Event): void {
    const el = event.target as HTMLSelectElement
    const id = el.value ? Number(el.value) : null
    if (id == null) return
    const template = this.templates.find((t) => t.id === id)
    if (!template) return
    this.form.patchValue({
      title: template.title,
      description: template.description ?? '',
      priority: template.priority,
    })
    el.value = ''
  }
}
