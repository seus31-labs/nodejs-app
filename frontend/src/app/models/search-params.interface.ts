/**
 * Todo 検索 API のクエリパラメータ
 */
export interface SearchParams {
  q: string
  completed?: boolean
  priority?: string
}
