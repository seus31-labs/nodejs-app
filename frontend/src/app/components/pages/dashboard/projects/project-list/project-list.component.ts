import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import type { Project, ProjectProgress } from '../../../../../models/project.interface'

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent {
  @Input() projects: Project[] = []
  @Input() progressMap: Record<number, ProjectProgress> = {}
  @Input() loading = false
  @Input() error: string | null = null
  @Output() edit = new EventEmitter<Project>()
  @Output() delete = new EventEmitter<Project>()
  @Output() archive = new EventEmitter<Project>()

  getProgress(projectId: number): ProjectProgress {
    return this.progressMap[projectId] ?? { total: 0, completed: 0 }
  }

  getProgressPercent(projectId: number): number {
    const p = this.getProgress(projectId)
    if (p.total === 0) return 0
    return Math.round((p.completed / p.total) * 100)
  }

  isLight(hex: string): boolean {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
  }
}
