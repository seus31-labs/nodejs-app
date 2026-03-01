import type { TodoPriority } from './todo.interface'

/**
 * Todo 検索 API のクエリパラメータ
 */
export interface SearchParams {
  q: string
  completed?: boolean
  priority?: TodoPriority
}
