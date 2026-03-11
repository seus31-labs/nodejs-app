import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

export interface ImportResult {
  created: number
  failed: number
}

/**
 * Todo インポート用サービス。POST /api/v1/todos/import で JSON/CSV を送信する。
 */
@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  /**
   * JSON または CSV 形式のデータをインポートする
   */
  import(format: 'json' | 'csv', data: object | string): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.apiUrl}/todos/import`, { format, data })
  }
}
