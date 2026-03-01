/**
 * API から返却される Tag 型
 */
export interface Tag {
  id: number
  userId: number
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateTagDto {
  name: string
  color?: string
}

export interface UpdateTagDto {
  name?: string
  color?: string
}
