import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TemplateFormComponent } from './template-form.component'
import type { Template } from '../../../../../models/template.interface'
import type { Tag } from '../../../../../models/tag.interface'

const mockTemplate: Template = {
  id: 1,
  userId: 1,
  name: 'Edit Template',
  title: 'Edit Title',
  description: 'Edit desc',
  priority: 'high',
  tagIds: [10, 20],
  createdAt: '',
  updatedAt: '',
}

const mockTags: Tag[] = [
  { id: 10, userId: 1, name: 'Tag1', color: '#ff0000', createdAt: '', updatedAt: '' },
  { id: 20, userId: 1, name: 'Tag2', color: '#00ff00', createdAt: '', updatedAt: '' },
]

describe('TemplateFormComponent (14.9)', () => {
  let component: TemplateFormComponent
  let fixture: ComponentFixture<TemplateFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateFormComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TemplateFormComponent)
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

  it('should have invalid form when title is empty', () => {
    component.form.patchValue({ name: 'Name' })
    expect(component.form.get('title')?.errors?.['required']).toBeTruthy()
  })

  it('should emit submitForm with payload when valid and submit', () => {
    component.form.patchValue({
      name: 'New Template',
      title: 'New Title',
      priority: 'medium',
    })
    let emitted: unknown
    component.submitForm.subscribe((v) => (emitted = v))
    component.onSubmit()
    expect(emitted).toEqual({
      name: 'New Template',
      title: 'New Title',
      description: null,
      priority: 'medium',
      tagIds: null,
    })
  })

  it('should not emit when form is invalid', () => {
    let emitted = false
    component.submitForm.subscribe(() => (emitted = true))
    component.onSubmit()
    expect(emitted).toBe(false)
  })

  it('should not emit when name is whitespace only', () => {
    component.form.patchValue({ name: '   ', title: 'Title', priority: 'medium' })
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

  it('should patch form when editingTemplate is set', () => {
    component.editingTemplate = mockTemplate
    component.ngOnChanges()
    expect(component.form.get('name')?.value).toBe('Edit Template')
    expect(component.form.get('title')?.value).toBe('Edit Title')
    expect(component.form.get('description')?.value).toBe('Edit desc')
    expect(component.form.get('priority')?.value).toBe('high')
    expect(component.form.get('tagIds')?.value).toEqual([10, 20])
  })

  it('should reset form when editingTemplate is null', () => {
    component.editingTemplate = mockTemplate
    component.ngOnChanges()
    component.editingTemplate = null
    component.ngOnChanges()
    expect(component.form.get('name')?.value).toBe('')
    expect(component.form.get('title')?.value).toBe('')
    expect(component.form.get('priority')?.value).toBe('medium')
    expect(component.form.get('tagIds')?.value).toEqual([])
  })

  it('should report tag selected state', () => {
    component.form.patchValue({ tagIds: [10] })
    expect(component.isTagSelected(10)).toBe(true)
    expect(component.isTagSelected(20)).toBe(false)
  })

  it('should toggle tag in tagIds on onTagToggle', () => {
    component.availableTags = mockTags
    expect(component.form.get('tagIds')?.value).toEqual([])
    component.onTagToggle(10)
    expect(component.form.get('tagIds')?.value).toEqual([10])
    component.onTagToggle(20)
    expect(component.form.get('tagIds')?.value).toEqual([10, 20])
    component.onTagToggle(10)
    expect(component.form.get('tagIds')?.value).toEqual([20])
  })

  it('should emit tagIds when tags selected on submit', () => {
    component.form.patchValue({
      name: 'T',
      title: 'T',
      priority: 'low',
      tagIds: [10, 20],
    })
    let emitted: unknown
    component.submitForm.subscribe((v) => (emitted = v))
    component.onSubmit()
    expect(emitted).toEqual({
      name: 'T',
      title: 'T',
      description: null,
      priority: 'low',
      tagIds: [10, 20],
    })
  })
})
