import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import type { Todo, TodoCreateUpdate } from '../../../../../models/todo.interface'

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
  @Output() submitForm = new EventEmitter<TodoCreateUpdate>()
  @Output() cancel = new EventEmitter<void>()

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255), noWhitespaceValidator]],
      description: [''],
      priority: ['medium' as const],
      dueDate: ['']
    })
  }

  ngOnChanges(): void {
    if (this.editingTodo) {
      this.form.patchValue({
        title: this.editingTodo.title,
        description: this.editingTodo.description ?? '',
        priority: this.editingTodo.priority,
        dueDate: this.editingTodo.dueDate ?? ''
      })
    } else {
      this.form.reset({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      })
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return
    const v = this.form.value
    const payload: TodoCreateUpdate = {
      title: v.title.trim(),
      description: v.description?.trim() || null,
      priority: v.priority || 'medium',
      dueDate: v.dueDate || null
    }
    this.submitForm.emit(payload)
  }

  onCancel(): void {
    this.cancel.emit()
  }
}
