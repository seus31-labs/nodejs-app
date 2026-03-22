import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { CommentListComponent } from './comment-list.component'
import type { Comment } from '../../../../../models/comment.interface'

describe('CommentListComponent (9.12)', () => {
  let component: CommentListComponent
  let fixture: ComponentFixture<CommentListComponent>

  const sample: Comment = {
    id: 1,
    todoId: 1,
    userId: 1,
    content: 'text',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorName: 'User',
    isMine: true,
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentListComponent, FormsModule],
    }).compileComponents()
    fixture = TestBed.createComponent(CommentListComponent)
    component = fixture.componentInstance
    component.comments = [sample]
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('saveEdit should emit and clear editing', () => {
    const out: { id: number; content: string }[] = []
    component.saved.subscribe((e) => out.push(e))
    component.startEdit(sample)
    component.editDraft = 'new'
    component.saveEdit()
    expect(out).toEqual([{ id: 1, content: 'new' }])
    expect(component.editingId).toBeNull()
  })
})
