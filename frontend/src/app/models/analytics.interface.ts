/** 完了率 API の期間（バックエンドの enum と一致） */
export type AnalyticsPeriod = 'week' | 'month' | 'year' | 'all'

export interface CompletionRateDto {
  period: string
  total: number
  completed: number
  rate: number
}

export interface PriorityDistributionDto {
  low: number
  medium: number
  high: number
}

export interface TagCountDto {
  tagId: number
  name: string
  color: string
  count: number
}

export interface ProjectCountDto {
  projectId: number | null
  name: string
  count: number
}

export interface WeeklyDayDto {
  date: string
  created: number
  completed: number
}

export interface WeeklyStatsDto {
  days: WeeklyDayDto[]
}
