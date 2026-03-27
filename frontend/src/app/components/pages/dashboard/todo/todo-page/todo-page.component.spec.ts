import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import TodoPageComponent from './todo-page.component'
import { TodoService } from '../../../../../services/todo.service'
import { TagService } from '../../../../../services/tag.service'
import { ProjectService } from '../../../../../services/project.service'
import { TemplateService } from '../../../../../services/template.service'
import { ExportService } from '../../../../../services/export.service'
import { KeyboardShortcutService } from '../../../../../services/keyboard-shortcut.service'
import { ShareService } from '../../../../../services/share.service'
import type { Todo } from '../../../../../models/todo.interface'

describe('TodoPageComponent (11.1)', () => {
  let fixture: ComponentFixture<TodoPageComponent>
  let component: TodoPageComponent

  let todoServiceSpy: jasmine.SpyObj<TodoService>
  let tagServiceSpy: jasmine.SpyObj<TagService>
  let projectServiceSpy: jasmine.SpyObj<ProjectService>
  let templateServiceSpy: jasmine.SpyObj<TemplateService>
  let exportServiceSpy: jasmine.SpyObj<ExportService>
  let shortcutServiceSpy: jasmine.SpyObj<KeyboardShortcutService>
  let shareServiceSpy: jasmine.SpyObj<ShareService>
  let dialogSpy: jasmine.SpyObj<MatDialog>

  const mockTodo: Todo = {
    id: 1,
    userId: 1,
    title: 'task',
    description: 'desc',
    completed: false,
    priority: 'medium',
    dueDate: null,
    sortOrder: 0,
    projectId: null,
    archived: false,
    archivedAt: null,
    reminderEnabled: false,
    reminderSentAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }

  beforeEach(async () => {
    todoServiceSpy = jasmine.createSpyObj<TodoService>('TodoService', [
      'list',
      'search',
      'create',
      'update',
      'delete'
    ])
    tagServiceSpy = jasmine.createSpyObj<TagService>('TagService', ['getTags'])
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', ['getAll'])
    templateServiceSpy = jasmine.createSpyObj<TemplateService>('TemplateService', ['getAll'])
    exportServiceSpy = jasmine.createSpyObj<ExportService>('ExportService', ['getExportBlob', 'triggerDownload'])
    shortcutServiceSpy = jasmine.createSpyObj<KeyboardShortcutService>('KeyboardShortcutService', [
      'registerBinding',
      'unregisterBinding'
    ])
    shareServiceSpy = jasmine.createSpyObj<ShareService>('ShareService', ['shareTodo'])
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open'])

    todoServiceSpy.list.and.returnValue(of([]))
    todoServiceSpy.search.and.returnValue(of([]))
    todoServiceSpy.create.and.returnValue(of(mockTodo))
    todoServiceSpy.update.and.returnValue(of(mockTodo))
    todoServiceSpy.delete.and.returnValue(of(void 0))
    tagServiceSpy.getTags.and.returnValue(of([]))
    projectServiceSpy.getAll.and.returnValue(of([]))
    templateServiceSpy.getAll.and.returnValue(of([]))
    exportServiceSpy.getExportBlob.and.returnValue(of(new Blob()))

    await TestBed.configureTestingModule({
      imports: [TodoPageComponent],
      providers: [
        provideNoopAnimations(),
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: TagService, useValue: tagServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: TemplateService, useValue: templateServiceSpy },
        { provide: ExportService, useValue: exportServiceSpy },
        { provide: KeyboardShortcutService, useValue: shortcutServiceSpy },
        { provide: ShareService, useValue: shareServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TodoPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit で初期データ取得とショートカット登録を行う', () => {
    expect(tagServiceSpy.getTags).toHaveBeenCalled()
    expect(projectServiceSpy.getAll).toHaveBeenCalled()
    expect(templateServiceSpy.getAll).toHaveBeenCalled()
    expect(todoServiceSpy.list).toHaveBeenCalled()
    expect(shortcutServiceSpy.registerBinding).toHaveBeenCalledTimes(2)
  })

  it('検索語ありの場合は search を使って一覧取得する', () => {
    component.searchQuery = 'abc'
    component.loadTodos()

    expect(todoServiceSpy.search).toHaveBeenCalled()
  })

  it('編集中に onSubmitForm すると update を呼び編集状態を解除する', () => {
    component.editingTodo = mockTodo
    const loadSpy = spyOn(component, 'loadTodos').and.callThrough()

    component.onSubmitForm({ title: 'updated' })

    expect(todoServiceSpy.update).toHaveBeenCalledWith(mockTodo.id, { title: 'updated' })
    expect(component.editingTodo).toBeNull()
    expect(loadSpy).toHaveBeenCalled()
  })

  it('新規作成時に onSubmitForm すると create を呼ぶ', () => {
    component.editingTodo = null
    const loadSpy = spyOn(component, 'loadTodos').and.callThrough()

    component.onSubmitForm({ title: 'new todo' })

    expect(todoServiceSpy.create).toHaveBeenCalledWith({ title: 'new todo' })
    expect(loadSpy).toHaveBeenCalled()
  })

  it('onDelete は confirm が false のとき delete を呼ばない', () => {
    spyOn(window, 'confirm').and.returnValue(false)

    component.onDelete(1)

    expect(todoServiceSpy.delete).not.toHaveBeenCalled()
  })
})
