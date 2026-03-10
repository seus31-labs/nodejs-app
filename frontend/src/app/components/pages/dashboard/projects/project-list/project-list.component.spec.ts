import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { ProjectListComponent } from './project-list.component'
import type { Project, ProjectProgress } from '../../../../../models/project.interface'

const mockProject: Project = {
  id: 1,
  userId: 1,
  name: 'Test Project',
  description: 'Description',
  color: '#ff0000',
  archived: false,
  createdAt: '',
  updatedAt: '',
}

describe('ProjectListComponent (7.21)', () => {
  let component: ProjectListComponent
  let fixture: ComponentFixture<ProjectListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent, RouterTestingModule],
    }).compileComponents()

    fixture = TestBed.createComponent(ProjectListComponent)
    component = fixture.componentInstance
    component.projects = [mockProject]
    component.progressMap = { 1: { total: 5, completed: 2 } }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should return progress from progressMap', () => {
    expect(component.getProgress(1)).toEqual({ total: 5, completed: 2 })
  })

  it('should return default progress when projectId not in map', () => {
    expect(component.getProgress(99)).toEqual({ total: 0, completed: 0 })
  })

  it('should return progress percent', () => {
    expect(component.getProgressPercent(1)).toBe(40)
  })

  it('should return 0 percent when total is 0', () => {
    component.progressMap = { 1: { total: 0, completed: 0 } }
    expect(component.getProgressPercent(1)).toBe(0)
  })

  it('should emit edit when edit button is clicked', () => {
    let emitted: Project | undefined
    component.edit.subscribe((p) => (emitted = p))
    const editBtn = fixture.nativeElement.querySelector('button[title="編集"]')
    editBtn?.click()
    expect(emitted).toEqual(mockProject)
  })

  it('should emit delete when delete button is clicked', () => {
    let emitted: Project | undefined
    component.delete.subscribe((p) => (emitted = p))
    const deleteBtn = fixture.nativeElement.querySelector('button[title="削除"]')
    deleteBtn?.click()
    expect(emitted).toEqual(mockProject)
  })

  it('should emit archive when archive button is clicked for non-archived project', () => {
    let emitted: Project | undefined
    component.archive.subscribe((p) => (emitted = p))
    const archiveBtn = fixture.nativeElement.querySelector('button[title="アーカイブ"]')
    archiveBtn?.click()
    expect(emitted).toEqual(mockProject)
  })

  it('should not show archive button when project is archived', () => {
    component.projects = [{ ...mockProject, archived: true }]
    fixture.detectChanges()
    const archiveBtn = fixture.nativeElement.querySelector('button[title="アーカイブ"]')
    expect(archiveBtn).toBeNull()
  })
})
