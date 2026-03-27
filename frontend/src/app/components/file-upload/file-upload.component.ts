import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpEventType } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { AttachmentService } from '../../services/attachment.service'
import type { Attachment } from '../../models/attachment.interface'

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnDestroy {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

  @Input() todoId!: number
  @Output() uploaded = new EventEmitter<Attachment>()

  selectedFile: File | null = null
  isDragging = false
  uploading = false
  uploadProgress = 0
  errorMessage = ''

  private uploadSub: Subscription | null = null

  constructor(private attachmentService: AttachmentService) {}

  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe()
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] ?? null
    this.handleSelectedFile(file)
    input.value = ''
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = true
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = false
  }

  onDrop(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = false
    const file = event.dataTransfer?.files?.[0] ?? null
    this.handleSelectedFile(file)
  }

  startUpload(): void {
    if (!this.selectedFile || this.uploading) return
    if (!Number.isInteger(this.todoId) || this.todoId <= 0) {
      this.errorMessage = 'アップロード対象の Todo が不正です。'
      return
    }

    this.uploading = true
    this.uploadProgress = 0
    this.errorMessage = ''
    this.uploadSub?.unsubscribe()
    this.uploadSub = this.attachmentService
      .uploadAttachmentWithProgress(this.todoId, this.selectedFile)
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? this.selectedFile?.size ?? 0
            if (total > 0) {
              this.uploadProgress = Math.round((event.loaded / total) * 100)
            }
            return
          }
          if (event.type === HttpEventType.Response && event.body) {
            this.uploading = false
            this.uploadProgress = 100
            this.selectedFile = null
            this.uploaded.emit(event.body)
          }
        },
        error: (err) => {
          this.uploading = false
          this.uploadProgress = 0
          this.errorMessage = err?.error?.error ?? 'ファイルのアップロードに失敗しました。'
        }
      })
  }

  private handleSelectedFile(file: File | null): void {
    if (file && !this.allowedMimeTypes.includes(file.type)) {
      this.selectedFile = null
      this.errorMessage = '許可されていないファイル形式です（JPEG / PNG / WebP / PDF）。'
      this.uploadProgress = 0
      return
    }
    this.selectedFile = file
    this.errorMessage = ''
    this.uploadProgress = 0
  }
}
