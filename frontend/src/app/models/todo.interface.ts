import type { Project } from './project.interface'
import type { Tag } from './tag.interface'

/**
 * Todo 優先度
 */
export type TodoPriority = 'low' | 'medium' | 'high'

/**
 * API から返却される Todo 型（タグ付き）
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
  projectId: number | null
  archived: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  Tags?: Tag[]
  Project?: Project
}

/**
 * Todo 作成・更新用の DTO（description, priority, dueDate は任意）
 */
export interface TodoCreateUpdate {
  title: string
  description?: string | null
  priority?: TodoPriority
  dueDate?: string | null
  projectId?: number | null
}
