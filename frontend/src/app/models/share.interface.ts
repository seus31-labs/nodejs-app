export type SharePermission = 'view' | 'edit'

/**
 * POST /api/v1/todos/:id/share のレスポンス型
 */
export interface TodoShare {
  id: number
  todoId: number
  sharedWithUserId: number
  permission: SharePermission
  createdAt: string
}

/**
 * GET /api/v1/todos/shared のレスポンス要素
 * Todo に共有権限を付与した型
 */
export type SharedTodo<TTodo> = TTodo & {
  sharedPermission: SharePermission
}
