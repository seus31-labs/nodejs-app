import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

export type ExportFormat = 'json' | 'csv'

/**
 * Todo エクスポート用サービス。GET /api/v1/todos/export で Blob を取得しダウンロードする。
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  /**
   * 指定フォーマットでエクスポート用 Blob を取得する
   */
  getExportBlob(format: ExportFormat): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/todos/export`, {
      params: { format },
      responseType: 'blob'
    })
  }

  /**
   * Blob を指定ファイル名でダウンロードさせる
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
