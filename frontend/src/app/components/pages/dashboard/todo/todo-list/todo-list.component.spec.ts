import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { TodoListComponent } from './todo-list.component'
import type { Todo } from '../../../../../models/todo.interface'
import type { Tag } from '../../../../../models/tag.interface'

const mockTodos: Todo[] = [
  { id: 1, userId: 1, title: 'A', description: '', completed: false, priority: 'medium', dueDate: null, sortOrder: 0, projectId: null, archived: false, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), Tags: [] },
  { id: 2, userId: 1, title: 'B', description: '', completed: false, priority: 'medium', dueDate: null, sortOrder: 1, projectId: null, archived: false, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), Tags: [] },
  { id: 3, userId: 1, title: 'C', description: '', completed: false, priority: 'medium', dueDate: null, sortOrder: 2, projectId: null, archived: false, archivedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), Tags: [] },
]

describe('TodoListComponent (3.13.3)', () => {
  let component: TodoListComponent
  let fixture: ComponentFixture<TodoListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TodoListComponent)
    component = fixture.componentInstance
    component.todos = [...mockTodos]
    component.allTags = []
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('drag and drop', () => {
    it('should emit reorder with reordered ids when drop from index 0 to 2', () => {
      component.dragDisabled = false
      let emitted: number[] | null = null
      component.reorder.subscribe((ids) => (emitted = ids))

      const event = {
        previousIndex: 0,
        currentIndex: 2,
        container: { data: component.todos },
        previousContainer: { data: component.todos },
        isPointerOverContainer: true,
        distance: { x: 0, y: 0 },
        dropPoint: { x: 0, y: 0 },
        event: new MouseEvent('drop'),
      } as unknown as CdkDragDrop<Todo[]>

      component.onDrop(event)

      expect(emitted).toEqual([2, 3, 1])
    })

    it('should not emit reorder when previousIndex === currentIndex', () => {
      component.dragDisabled = false
      let emitted = false
      component.reorder.subscribe(() => (emitted = true))

      const event = {
        previousIndex: 1,
        currentIndex: 1,
        container: { data: component.todos },
        previousContainer: { data: component.todos },
        isPointerOverContainer: true,
        distance: { x: 0, y: 0 },
        dropPoint: { x: 0, y: 0 },
        event: new MouseEvent('drop'),
      } as unknown as CdkDragDrop<Todo[]>

      component.onDrop(event)

      expect(emitted).toBe(false)
    })

    it('should not emit reorder when dragDisabled is true', () => {
      component.dragDisabled = true
      let emitted = false
      component.reorder.subscribe(() => (emitted = true))

      const event = {
        previousIndex: 0,
        currentIndex: 1,
        container: { data: component.todos },
        previousContainer: { data: component.todos },
        isPointerOverContainer: true,
        distance: { x: 0, y: 0 },
        dropPoint: { x: 0, y: 0 },
        event: new MouseEvent('drop'),
      } as unknown as CdkDragDrop<Todo[]>

      component.onDrop(event)

      expect(emitted).toBe(false)
    })
  })
})
