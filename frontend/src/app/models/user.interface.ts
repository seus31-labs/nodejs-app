export interface User {
  id: number
  name: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export interface UserListResponse<TUser = User> {
  users: TUser[]
  totalItems: number
  currentPage: number
  limit: number
  totalPages: number
}

