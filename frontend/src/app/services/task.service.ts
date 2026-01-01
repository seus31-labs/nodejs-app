import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  list(page: number, limit: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.getToken(),
    })

    let params = new HttpParams().set('page', page).set('limit', limit)

    return this.http.get(`${this.apiUrl}/tasks`, { headers, params })
  }

  getToken(): string | null {
    return localStorage.getItem('authToken')
  }
}
