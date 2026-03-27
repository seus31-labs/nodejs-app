import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { HttpEventType } from '@angular/common/http'
import { FileUploadComponent } from './file-upload.component'
import { AttachmentService } from '../../services/attachment.service'

describe('FileUploadComponent', () => {
  let component: FileUploadComponent
  let fixture: ComponentFixture<FileUploadComponent>
  let attachmentServiceSpy: jasmine.SpyObj<AttachmentService>

  beforeEach(async () => {
    attachmentServiceSpy = jasmine.createSpyObj<AttachmentService>('AttachmentService', ['uploadAttachmentWithProgress'])
    attachmentServiceSpy.uploadAttachmentWithProgress.and.returnValue(of({ type: HttpEventType.Sent }))

    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: [{ provide: AttachmentService, useValue: attachmentServiceSpy }]
    }).compileComponents()

    fixture = TestBed.createComponent(FileUploadComponent)
    component = fixture.componentInstance
    component.todoId = 1
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('onDragOver / onDragLeave で dragging 状態を切り替える', () => {
    const dragOverEvent = new DragEvent('dragover')
    const dragLeaveEvent = new DragEvent('dragleave')

    component.onDragOver(dragOverEvent)
    expect(component.isDragging).toBeTrue()

    component.onDragLeave(dragLeaveEvent)
    expect(component.isDragging).toBeFalse()
  })

  it('不正な todoId では uploadAttachmentWithProgress を呼ばない', () => {
    component.todoId = 0
    component.selectedFile = new File(['dummy'], 'dummy.png', { type: 'image/png' })

    component.startUpload()

    expect(attachmentServiceSpy.uploadAttachmentWithProgress).not.toHaveBeenCalled()
    expect(component.errorMessage).toContain('アップロード対象の Todo が不正です。')
  })

  it('非許可 MIME タイプを選択したときエラーを表示する', () => {
    const file = new File(['dummy'], 'dummy.txt', { type: 'text/plain' })
    const input = document.createElement('input')
    const event = { target: { ...input, files: [file] } } as unknown as Event

    component.onFileSelected(event)

    expect(component.selectedFile).toBeNull()
    expect(component.errorMessage).toContain('許可されていないファイル形式')
  })
})
