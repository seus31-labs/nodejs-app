import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData)
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post(`${this.apiUrl}/login`, credentials, { headers })
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token)
  }

  getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  logout(): void {
    localStorage.removeItem('authToken')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  }
}
