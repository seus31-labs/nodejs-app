import type { TodoPriority } from './todo.interface'

/**
 * API から返却される TodoTemplate 型
 */
export interface Template {
  id: number
  userId: number
  name: string
  title: string
  description: string | null
  priority: TodoPriority
  tagIds: number[] | null
  createdAt: string
  updatedAt: string
}

/**
 * テンプレート作成用 DTO（name, title 必須）
 */
export interface CreateTemplateDto {
  name: string
  title: string
  description?: string | null
  priority?: TodoPriority
  tagIds?: number[] | null
}

/**
 * テンプレート更新用 DTO
 */
export interface UpdateTemplateDto {
  name?: string
  title?: string
  description?: string | null
  priority?: TodoPriority
  tagIds?: number[] | null
}

/**
 * テンプレートから Todo 作成時の上書き用 DTO（省略時はテンプレートの値を使用）
 */
export interface CreateTodoFromTemplateDto {
  title?: string
  description?: string | null
  priority?: TodoPriority
}
