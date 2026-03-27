import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { AttachmentService } from '../../services/attachment.service'
import type { Attachment } from '../../models/attachment.interface'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachment-list.component.html',
  styleUrl: './attachment-list.component.scss'
})
export class AttachmentListComponent implements OnChanges, OnDestroy {
  @Input() todoId!: number

  attachments: Attachment[] = []
  loading = false
  errorMessage = ''
  deletingIds = new Set<number>()

  private readonly apiOrigin = new URL(environment.apiUrl).origin
  private listSub: Subscription | null = null
  private downloadSub: Subscription | null = null

  constructor(
    private attachmentService: AttachmentService,
    private http: HttpClient
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('todoId' in changes) {
      this.loadAttachments()
    }
  }

  ngOnDestroy(): void {
    this.listSub?.unsubscribe()
    this.downloadSub?.unsubscribe()
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'bi bi-image'
    if (mimeType === 'application/pdf') return 'bi bi-file-earmark-pdf'
    return 'bi bi-file-earmark'
  }

  download(attachment: Attachment): void {
    const fileUrl = this.resolveAbsoluteFileUrl(attachment.fileUrl)
    this.downloadSub?.unsubscribe()
    this.downloadSub = this.http.get(fileUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = attachment.fileName
        link.click()
        URL.revokeObjectURL(objectUrl)
      },
      error: (err) => {
        this.errorMessage = err?.error?.error ?? 'ダウンロードに失敗しました。'
      }
    })
  }

  remove(attachment: Attachment): void {
    if (this.deletingIds.has(attachment.id)) return
    this.deletingIds.add(attachment.id)
    this.attachmentService.deleteAttachment(attachment.id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter((item) => item.id !== attachment.id)
        this.deletingIds.delete(attachment.id)
      },
      error: (err) => {
        this.errorMessage = err?.error?.error ?? '削除に失敗しました。'
        this.deletingIds.delete(attachment.id)
      }
    })
  }

  private loadAttachments(): void {
    if (!Number.isInteger(this.todoId) || this.todoId <= 0) return

    this.loading = true
    this.errorMessage = ''
    this.listSub?.unsubscribe()
    this.listSub = this.attachmentService.getAttachments(this.todoId).subscribe({
      next: (list) => {
        this.attachments = list
        this.loading = false
      },
      error: (err) => {
        this.errorMessage = err?.error?.error ?? '添付ファイル一覧の取得に失敗しました。'
        this.loading = false
      }
    })
  }

  private resolveAbsoluteFileUrl(fileUrl: string): string {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl
    if (fileUrl.startsWith('/')) return `${this.apiOrigin}${fileUrl}`
    return `${this.apiOrigin}/${fileUrl}`
  }
}
