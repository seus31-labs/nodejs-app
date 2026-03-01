/**
 * Todo 優先度
 */
export type TodoPriority = 'low' | 'medium' | 'high'

/**
 * API から返却される Todo 型
 */
export interface Todo {
  id: number
  userId: number
  title: string
  description: string | null
  completed: boolean
  priority: TodoPriority
  dueDate: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Todo 作成・更新用の DTO（description, priority, dueDate は任意）
 */
export interface TodoCreateUpdate {
  title: string
  description?: string | null
  priority?: TodoPriority
  dueDate?: string | null
}
