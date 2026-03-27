import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import type { Attachment } from '../../models/attachment.interface'
import { AttachmentListComponent } from './attachment-list.component'
import { AttachmentService } from '../../services/attachment.service'

describe('AttachmentListComponent', () => {
  let component: AttachmentListComponent
  let fixture: ComponentFixture<AttachmentListComponent>
  let attachmentServiceSpy: jasmine.SpyObj<AttachmentService>

  beforeEach(async () => {
    attachmentServiceSpy = jasmine.createSpyObj<AttachmentService>('AttachmentService', [
      'getAttachments',
      'deleteAttachment',
      'downloadAttachment'
    ])
    attachmentServiceSpy.getAttachments.and.returnValue(of([]))
    attachmentServiceSpy.deleteAttachment.and.returnValue(of(void 0))
    attachmentServiceSpy.downloadAttachment.and.returnValue(of(new Blob()))

    await TestBed.configureTestingModule({
      imports: [AttachmentListComponent],
      providers: [{ provide: AttachmentService, useValue: attachmentServiceSpy }]
    }).compileComponents()

    fixture = TestBed.createComponent(AttachmentListComponent)
    component = fixture.componentInstance
    component.todoId = 1
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('todoId が有効なとき ngOnChanges で getAttachments を呼ぶ', () => {
    component.todoId = 10
    component.ngOnChanges({
      todoId: {
        currentValue: 10,
        previousValue: 1,
        firstChange: false,
        isFirstChange: () => false
      }
    })

    expect(attachmentServiceSpy.getAttachments).toHaveBeenCalledWith(10)
  })

  it('添付が0件のとき空状態メッセージを表示する', () => {
    component.loading = false
    component.attachments = []
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('添付ファイルはありません。')
  })

  it('remove が deleteAttachment を呼ぶ', () => {
    const item: Attachment = {
      id: 7,
      todoId: 1,
      fileName: 'a.pdf',
      fileSize: 100,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/1/a.pdf',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
    component.attachments = [item]

    component.remove(item)

    expect(attachmentServiceSpy.deleteAttachment).toHaveBeenCalledWith(7)
  })

  it('未知の MIME タイプは汎用アイコンを返す', () => {
    expect(component.getFileIcon('application/octet-stream')).toBe('bi bi-file-earmark')
  })
})
