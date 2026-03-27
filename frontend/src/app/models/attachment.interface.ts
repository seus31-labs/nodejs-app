/**
 * API から返却される Attachment 型（Feature 8）。
 */
export interface Attachment {
  id: number
  todoId: number
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  createdAt: string
}
