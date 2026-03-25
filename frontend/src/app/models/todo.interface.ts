import type { Project } from './project.interface'
import type { Tag } from './tag.interface'

/**
 * Todo 優先度
 */
export type TodoPriority = 'low' | 'medium' | 'high'

export interface TodoProgress {
  completed: number
  total: number
  percentage: number
}

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
  /** 親 Todo を持つ場合はその ID（親なしは null） */
  parentId?: number | null
  archived: boolean
  archivedAt: string | null
  reminderEnabled: boolean
  reminderSentAt: string | null
  createdAt: string
  updatedAt: string
  Tags?: Tag[]
  Project?: Project
  /** 1階層分のみ返る想定（再帰的に表現するため型は Todo[]） */
  subtasks?: Todo[]
  /** GET /api/todos/:id/progress の結果 */
  progress?: TodoProgress
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
