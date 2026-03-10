import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms'
import type {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '../../../../../models/template.interface'
import type { Tag } from '../../../../../models/tag.interface'
import type { TodoPriority } from '../../../../../models/todo.interface'

function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string
  return value && value.trim().length === 0 ? { whitespace: true } : null
}

const PRIORITY_OPTIONS: { value: TodoPriority; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
})
export class TemplateFormComponent implements OnChanges {
  @Input() editingTemplate: Template | null = null
  @Input() availableTags: Tag[] = []
  @Output() submitForm = new EventEmitter<CreateTemplateDto | UpdateTemplateDto>()
  @Output() cancel = new EventEmitter<void>()

  form: FormGroup
  readonly priorityOptions = PRIORITY_OPTIONS

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          noWhitespaceValidator,
        ],
      ],
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(255),
          noWhitespaceValidator,
        ],
      ],
      description: [''],
      priority: ['medium' as const],
      tagIds: [[] as number[]],
    })
  }

  ngOnChanges(): void {
    if (this.editingTemplate) {
      this.form.patchValue({
        name: this.editingTemplate.name,
        title: this.editingTemplate.title,
        description: this.editingTemplate.description ?? '',
        priority: this.editingTemplate.priority,
        tagIds: this.editingTemplate.tagIds ?? [],
      })
    } else {
      this.form.reset({
        name: '',
        title: '',
        description: '',
        priority: 'medium',
        tagIds: [],
      })
    }
  }

  isTagSelected(tagId: number): boolean {
    const ids: number[] = this.form.get('tagIds')?.value ?? []
    return ids.includes(tagId)
  }

  onTagToggle(tagId: number): void {
    const control = this.form.get('tagIds')
    if (!control) return
    const current: number[] = control.value ?? []
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId]
    control.setValue(next)
  }

  onSubmit(): void {
    if (this.form.invalid) return
    const v = this.form.value
    const tagIds = Array.isArray(v.tagIds) && v.tagIds.length > 0 ? v.tagIds : null
    const payload: CreateTemplateDto | UpdateTemplateDto = {
      name: v.name.trim(),
      title: v.title.trim(),
      description: v.description?.trim() || null,
      priority: (v.priority as TodoPriority) || 'medium',
      tagIds,
    }
    this.submitForm.emit(payload)
  }

  onCancel(): void {
    this.cancel.emit()
  }

  isLight(hex: string): boolean {
    if (!hex || !hex.startsWith('#')) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
  }
}
