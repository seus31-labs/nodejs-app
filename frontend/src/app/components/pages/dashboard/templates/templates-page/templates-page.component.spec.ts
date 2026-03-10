import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { Router, provideRouter } from '@angular/router'
import { of, throwError } from 'rxjs'
import TemplatesPageComponent from './templates-page.component'
import { TemplateService } from '../../../../../services/template.service'
import { TagService } from '../../../../../services/tag.service'
import type { Template } from '../../../../../models/template.interface'
import type { Tag } from '../../../../../models/tag.interface'

const mockTemplate: Template = {
  id: 1,
  userId: 1,
  name: 'Daily',
  title: 'Daily task',
  description: null,
  priority: 'medium',
  tagIds: null,
  createdAt: '',
  updatedAt: '',
}

const mockTags: Tag[] = [
  { id: 1, userId: 1, name: 'work', color: '#ff0000', createdAt: '', updatedAt: '' },
]

describe('TemplatesPageComponent (14.12)', () => {
  let component: TemplatesPageComponent
  let fixture: ComponentFixture<TemplatesPageComponent>
  let templateService: jasmine.SpyObj<TemplateService>
  let tagService: jasmine.SpyObj<TagService>

  beforeEach(async () => {
    const templateSpy = jasmine.createSpyObj('TemplateService', [
      'getAll',
      'create',
      'update',
      'delete',
      'createTodoFromTemplate',
    ])
    const tagSpy = jasmine.createSpyObj('TagService', ['getTags'])
    await TestBed.configureTestingModule({
      imports: [TemplatesPageComponent],
      providers: [
        { provide: TemplateService, useValue: templateSpy },
        { provide: TagService, useValue: tagSpy },
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents()

    templateService = TestBed.inject(TemplateService) as jasmine.SpyObj<TemplateService>
    tagService = TestBed.inject(TagService) as jasmine.SpyObj<TagService>
    templateService.getAll.and.returnValue(of([]))
    tagService.getTags.and.returnValue(of([]))

    fixture = TestBed.createComponent(TemplatesPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call getAll and getTags on init', () => {
    expect(templateService.getAll).toHaveBeenCalled()
    expect(tagService.getTags).toHaveBeenCalled()
    expect(component.templates).toEqual([])
    expect(component.allTags).toEqual([])
    expect(component.loading).toBe(false)
  })

  it('should load templates and set loading false on success', () => {
    templateService.getAll.calls.reset()
    templateService.getAll.and.returnValue(of([mockTemplate]))
    component.loadTemplates()
    expect(component.templates).toEqual([mockTemplate])
    expect(component.loading).toBe(false)
    expect(component.error).toBeNull()
  })

  it('should set error and loading false on getAll error', () => {
    templateService.getAll.calls.reset()
    templateService.getAll.and.returnValue(throwError(() => ({ error: { error: 'Server error' } })))
    component.loadTemplates()
    expect(component.error).toBe('Server error')
    expect(component.loading).toBe(false)
  })

  it('should call create and reload on submit when not editing', () => {
    templateService.create.and.returnValue(of(mockTemplate))
    templateService.getAll.and.returnValue(of([]))
    component.onSubmitForm({ name: 'New', title: 'New title' })
    expect(templateService.create).toHaveBeenCalledWith({ name: 'New', title: 'New title' })
    expect(templateService.getAll).toHaveBeenCalled()
  })

  it('should call update, clear editing and reload when editing', () => {
    component.editingTemplate = mockTemplate
    templateService.update.and.returnValue(of({ ...mockTemplate, name: 'Updated' }))
    templateService.getAll.and.returnValue(of([]))
    component.onSubmitForm({ name: 'Updated', title: 'Updated title' })
    expect(templateService.update).toHaveBeenCalledWith(1, { name: 'Updated', title: 'Updated title' })
    expect(component.editingTemplate).toBeNull()
    expect(templateService.getAll).toHaveBeenCalled()
  })

  it('should set error on create failure', () => {
    templateService.create.and.returnValue(throwError(() => ({ error: { error: 'Create failed' } })))
    component.onSubmitForm({ name: 'X', title: 'Y' })
    expect(component.error).toBe('Create failed')
  })

  it('should set error on update failure', () => {
    component.editingTemplate = mockTemplate
    templateService.update.and.returnValue(throwError(() => ({ error: { error: 'Update failed' } })))
    component.onSubmitForm({ name: 'X', title: 'Y' })
    expect(component.error).toBe('Update failed')
  })

  it('should call delete and reload when confirm is true', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    templateService.delete.and.returnValue(of(undefined))
    templateService.getAll.and.returnValue(of([]))
    component.onDelete(mockTemplate)
    expect(templateService.delete).toHaveBeenCalledWith(1)
    expect(templateService.getAll).toHaveBeenCalled()
    expect(component.editingTemplate).toBeNull()
  })

  it('should not call delete when confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false)
    component.onDelete(mockTemplate)
    expect(templateService.delete).not.toHaveBeenCalled()
  })

  it('should set error on delete failure', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    templateService.delete.and.returnValue(throwError(() => ({ error: { error: 'Delete failed' } })))
    component.onDelete(mockTemplate)
    expect(component.error).toBe('Delete failed')
  })

  it('should clear editingTemplate when deleting the one being edited', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    component.editingTemplate = mockTemplate
    templateService.delete.and.returnValue(of(undefined))
    templateService.getAll.and.returnValue(of([]))
    component.onDelete(mockTemplate)
    expect(component.editingTemplate).toBeNull()
  })

  it('should call createTodoFromTemplate and navigate on useTemplate', () => {
    const router = TestBed.inject(Router)
    spyOn(router, 'navigate')
    templateService.createTodoFromTemplate.and.returnValue(
      of({
        id: 10,
        userId: 1,
        title: 'From template',
        description: null,
        completed: false,
        priority: 'medium',
        dueDate: null,
        sortOrder: 0,
        projectId: null,
        archived: false,
        archivedAt: null,
        createdAt: '',
        updatedAt: '',
      })
    )
    component.onUseTemplate(mockTemplate)
    expect(templateService.createTodoFromTemplate).toHaveBeenCalledWith(1)
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/todos'])
  })

  it('should set error on createTodoFromTemplate failure', () => {
    templateService.createTodoFromTemplate.and.returnValue(
      throwError(() => ({ error: { error: 'Todo create failed' } }))
    )
    component.onUseTemplate(mockTemplate)
    expect(component.error).toBe('Todo create failed')
  })

  it('onEdit should set editingTemplate', () => {
    component.onEdit(mockTemplate)
    expect(component.editingTemplate).toEqual(mockTemplate)
  })

  it('onCancelEdit should clear editingTemplate', () => {
    component.editingTemplate = mockTemplate
    component.onCancelEdit()
    expect(component.editingTemplate).toBeNull()
  })
})
