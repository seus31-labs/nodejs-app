import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ImportService, type ImportResult } from '../../../../../services/import.service'

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './import-dialog.component.html',
  styleUrl: './import-dialog.component.scss'
})
export class ImportDialogComponent {
  selectedFile: File | null = null
  importing = false
  result: ImportResult | null = null
  error: string | null = null

  constructor(
    public dialogRef: MatDialogRef<ImportDialogComponent>,
    private importService: ImportService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    this.selectedFile = file ?? null
    this.result = null
    this.error = null
    input.value = ''
  }

  runImport(): void {
    if (!this.selectedFile) return
    const name = this.selectedFile.name.toLowerCase()
    const isJson = name.endsWith('.json')
    const isCsv = name.endsWith('.csv')
    if (!isJson && !isCsv) {
      this.error = 'JSON または CSV ファイルを選択してください。'
      return
    }
    this.importing = true
    this.error = null
    const reader = new FileReader()
    reader.onload = () => {
      const format = isJson ? 'json' : 'csv'
      let data: object | string
      try {
        data = isJson ? (JSON.parse(reader.result as string) as object) : (reader.result as string)
      } catch {
        this.error = isJson ? 'JSON の解析に失敗しました。' : 'ファイルの読み込みに失敗しました。'
        this.importing = false
        return
      }
      this.importService.import(format, data).subscribe({
        next: (res) => {
          this.result = res
          this.importing = false
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'インポートに失敗しました。'
          this.importing = false
        }
      })
    }
    reader.onerror = () => {
      this.error = 'ファイルの読み込みに失敗しました。'
      this.importing = false
    }
    if (isJson) reader.readAsText(this.selectedFile)
    else reader.readAsText(this.selectedFile, 'utf-8')
  }

  close(): void {
    this.dialogRef.close(this.result != null)
  }
}
