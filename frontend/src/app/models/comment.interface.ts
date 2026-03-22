/** API GET/POST/PUT のコメント本文（Todo 9.6） */
export interface Comment {
  id: number
  todoId: number
  userId: number
  content: string
  createdAt: string
  updatedAt: string
  authorName: string
  isMine: boolean
}

export interface CreateCommentDto {
  content: string
}

export interface UpdateCommentDto {
  content: string
}
