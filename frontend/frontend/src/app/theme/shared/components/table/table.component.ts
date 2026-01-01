import { NgForOf } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatTableModule } from '@angular/material/table'

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [MatTableModule, NgForOf]
})
export class TableComponent {
  @Input() dataSource: any[] = []
  @Input() columns: { key: string, label: string }[] = []

  get columnKeys(): string[] {
    return this.columns.map((column) => column.key)
  }
}
