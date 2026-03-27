/**
 * 繰り返しパターン
 */
export enum RecurrencePattern {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

/**
 * 繰り返し設定
 * isRecurring=false の場合は pattern/endDate は null、interval は 1 を想定する。
 */
export interface Recurrence {
  isRecurring: boolean
  recurrencePattern: RecurrencePattern | null
  recurrenceInterval: number
  recurrenceEndDate: string | null
}

