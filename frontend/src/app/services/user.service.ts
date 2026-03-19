import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import type { User, UserListResponse } from '../models/user.interface'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  list(page: number = 1, limit: number = 50): Observable<UserListResponse<User>> {
    return this.http.get<UserListResponse<User>>(`${this.apiUrl}/users`, {
      params: { page: String(page), limit: String(limit) }
    })
  }
}

