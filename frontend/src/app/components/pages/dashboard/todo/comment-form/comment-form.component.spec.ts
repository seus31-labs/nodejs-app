import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { CommentFormComponent } from './comment-form.component'

describe('CommentFormComponent (9.12)', () => {
  let component: CommentFormComponent
  let fixture: ComponentFixture<CommentFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent, FormsModule],
    }).compileComponents()
    fixture = TestBed.createComponent(CommentFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit trimmed content on submit', () => {
    const emitted: string[] = []
    component.submitted.subscribe((s) => emitted.push(s))
    component.draft = '  hi  '
    component.onSubmit()
    expect(emitted).toEqual(['hi'])
  })

  it('reset should clear draft', () => {
    component.draft = 'x'
    component.reset()
    expect(component.draft).toBe('')
  })
})
