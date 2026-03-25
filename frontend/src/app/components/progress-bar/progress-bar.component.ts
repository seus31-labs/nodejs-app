import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import type { TodoProgress } from '../../models/todo.interface'

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() progress: Pick<TodoProgress, 'completed' | 'total'> | null = null

  get completed(): number {
    const value = this.progress?.completed ?? 0
    return Number.isFinite(value) ? Math.max(0, value) : 0
  }

  get total(): number {
    const value = this.progress?.total ?? 0
    return Number.isFinite(value) ? Math.max(0, value) : 0
  }

  get percentage(): number {
    if (this.total <= 0) return 0
    return Math.min(100, Math.round((this.completed / this.total) * 100))
  }
}

