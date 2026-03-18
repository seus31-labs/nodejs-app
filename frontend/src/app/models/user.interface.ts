export interface User {
  id: number
  name: string
  email: string
  /**
   * API レスポンスには含まれるが、フロント側では共有機能に不要。
   * 型だけ許容しておく（API が変更されてもコンパイルを壊しにくくするため）。
   */
  password?: string
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

