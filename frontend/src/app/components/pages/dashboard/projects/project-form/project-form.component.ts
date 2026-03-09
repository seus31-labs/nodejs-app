import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import type { Project, CreateProjectDto, UpdateProjectDto } from '../../../../../models/project.interface'

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnChanges {
  @Input() editingProject: Project | null = null
  @Output() submitForm = new EventEmitter<CreateProjectDto | UpdateProjectDto>()
  @Output() cancel = new EventEmitter<void>()

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      color: ['#808080']
    })
  }

  ngOnChanges(): void {
    if (this.editingProject) {
      this.form.patchValue({
        name: this.editingProject.name,
        description: this.editingProject.description ?? '',
        color: this.editingProject.color
      })
    } else {
      this.form.reset({
        name: '',
        description: '',
        color: '#808080'
      })
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return
    const v = this.form.value
    const payload: CreateProjectDto | UpdateProjectDto = {
      name: v.name.trim(),
      description: v.description?.trim() || null,
      color: v.color || '#808080'
    }
    this.submitForm.emit(payload)
  }

  onCancel(): void {
    this.cancel.emit()
  }
}
