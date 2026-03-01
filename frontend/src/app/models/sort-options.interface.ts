/**
 * ソート基準（API の sortBy と一致）
 */
export type SortBy = 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'sortOrder'

/**
 * ソート順
 */
export type SortOrder = 'asc' | 'desc'

export interface SortOptions {
  sortBy: SortBy
  sortOrder: SortOrder
}
