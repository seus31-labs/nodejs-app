import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TodoFormComponent } from './todo-form.component'

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
})

