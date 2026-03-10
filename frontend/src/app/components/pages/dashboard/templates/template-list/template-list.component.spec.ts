import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TemplateListComponent } from './template-list.component'
import type { Template } from '../../../../../models/template.interface'

const mockTemplate: Template = {
  id: 1,
  userId: 1,
  name: 'Daily',
  title: 'Daily task',
  description: 'Repeat daily',
  priority: 'medium',
  tagIds: null,
  createdAt: '',
  updatedAt: '',
}

describe('TemplateListComponent (14.8)', () => {
  let component: TemplateListComponent
  let fixture: ComponentFixture<TemplateListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateListComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TemplateListComponent)
    component = fixture.componentInstance
    component.templates = [mockTemplate]
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should return priority labels', () => {
    expect(component.getPriorityLabel('low')).toBe('低')
    expect(component.getPriorityLabel('medium')).toBe('中')
    expect(component.getPriorityLabel('high')).toBe('高')
  })

  it('should return priority badge classes', () => {
    expect(component.getPriorityBadgeClass('low')).toBe('bg-secondary')
    expect(component.getPriorityBadgeClass('medium')).toBe('bg-info')
    expect(component.getPriorityBadgeClass('high')).toBe('bg-danger')
  })

  it('should emit edit when edit button is clicked', () => {
    let emitted: Template | undefined
    component.edit.subscribe((t) => (emitted = t))
    const editBtn = fixture.nativeElement.querySelector('button[title="編集"]')
    editBtn?.click()
    expect(emitted).toEqual(mockTemplate)
  })

  it('should emit delete when delete button is clicked', () => {
    let emitted: Template | undefined
    component.delete.subscribe((t) => (emitted = t))
    const deleteBtn = fixture.nativeElement.querySelector('button[title="削除"]')
    deleteBtn?.click()
    expect(emitted).toEqual(mockTemplate)
  })

  it('should emit useTemplate when Todo button is clicked', () => {
    let emitted: Template | undefined
    component.useTemplate.subscribe((t) => (emitted = t))
    const useBtn = fixture.nativeElement.querySelector('button[title="このテンプレートから Todo を作成"]')
    useBtn?.click()
    expect(emitted).toEqual(mockTemplate)
  })
})
