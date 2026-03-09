/**
 * API から返却される Project 型
 */
export interface Project {
  id: number
  userId: number
  name: string
  description: string | null
  color: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDto {
  name: string
  description?: string
  color?: string
}

export interface UpdateProjectDto {
  name?: string
  description?: string | null
  color?: string
}

/**
 * GET /api/projects/:id/progress のレスポンス型
 */
export interface ProjectProgress {
  total: number
  completed: number
}
