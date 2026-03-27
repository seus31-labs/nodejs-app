import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TodoFormComponent } from './todo-form.component'
import { RecurrencePattern } from '../../../../../models/recurrence.interface'

describe('TodoFormComponent (5.12)', () => {
  let fixture: ComponentFixture<TodoFormComponent>
  let component: TodoFormComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFormComponent, NoopAnimationsModule]
    }).compileComponents()

    fixture = TestBed.createComponent(TodoFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should enable subtask mode when parentId is set', () => {
    component.parentId = 10
    fixture.detectChanges()

    expect(component.isSubtaskMode).toBeTrue()
  })

  it('should show subtask submit label in subtask mode', () => {
    component.parentId = 10
    fixture.detectChanges()

    const el: HTMLElement = fixture.nativeElement
    expect(el.textContent).toContain('サブタスクを作成')
  })

  it('should include recurrence settings in submit payload', () => {
    component.form.patchValue({
      title: '定期タスク',
      description: 'desc',
      priority: 'high',
      dueDate: '2026-04-01',
      projectId: 3
    })
    component.onRecurrenceChanged({
      isRecurring: true,
      recurrencePattern: RecurrencePattern.Weekly,
      recurrenceInterval: 2,
      recurrenceEndDate: '2026-12-31'
    })

    let emitted: unknown = null
    component.submitForm.subscribe((v) => {
      emitted = v
    })

    component.onSubmit()

    expect(emitted).toEqual({
      title: '定期タスク',
      description: 'desc',
      priority: 'high',
      dueDate: '2026-04-01',
      projectId: 3,
      isRecurring: true,
      recurrencePattern: 'weekly',
      recurrenceInterval: 2,
      recurrenceEndDate: '2026-12-31'
    })
  })
})

