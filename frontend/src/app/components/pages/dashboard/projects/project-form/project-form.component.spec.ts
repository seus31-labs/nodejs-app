import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ProjectFormComponent } from './project-form.component'
import type { Project } from '../../../../../models/project.interface'

const mockProject: Project = {
  id: 1,
  userId: 1,
  name: 'Edit Project',
  description: 'Desc',
  color: '#00ff00',
  archived: false,
  createdAt: '',
  updatedAt: '',
}

describe('ProjectFormComponent (7.21)', () => {
  let component: ProjectFormComponent
  let fixture: ComponentFixture<ProjectFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ProjectFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have invalid form when name is empty', () => {
    expect(component.form.valid).toBe(false)
    expect(component.form.get('name')?.errors?.['required']).toBeTruthy()
  })

  it('should emit submitForm with payload when valid and submit', () => {
    component.form.patchValue({ name: 'New Project', color: '#808080' })
    let emitted: unknown
    component.submitForm.subscribe((v) => (emitted = v))
    component.onSubmit()
    expect(emitted).toEqual({
      name: 'New Project',
      description: null,
      color: '#808080',
    })
  })

  it('should not emit when form is invalid', () => {
    let emitted = false
    component.submitForm.subscribe(() => (emitted = true))
    component.onSubmit()
    expect(emitted).toBe(false)
  })

  it('should not emit when name is whitespace only', () => {
    component.form.patchValue({ name: '   ', color: '#808080' })
    let emitted = false
    component.submitForm.subscribe(() => (emitted = true))
    component.onSubmit()
    expect(emitted).toBe(false)
  })

  it('should emit cancel when onCancel is called', () => {
    let emitted = false
    component.cancel.subscribe(() => (emitted = true))
    component.onCancel()
    expect(emitted).toBe(true)
  })

  it('should patch form when editingProject is set', () => {
    component.editingProject = mockProject
    component.ngOnChanges()
    expect(component.form.get('name')?.value).toBe('Edit Project')
    expect(component.form.get('description')?.value).toBe('Desc')
    expect(component.form.get('color')?.value).toBe('#00ff00')
  })

  it('should reset form when editingProject is null', () => {
    component.editingProject = mockProject
    component.ngOnChanges()
    component.editingProject = null
    component.ngOnChanges()
    expect(component.form.get('name')?.value).toBe('')
    expect(component.form.get('color')?.value).toBe('#808080')
  })
})
