import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { Subject, takeUntil, forkJoin } from 'rxjs'
import { ProjectService } from '../../../../../services/project.service'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import type { Project, ProjectProgress } from '../../../../../models/project.interface'
import type { Todo } from '../../../../../models/todo.interface'

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './project-detail-page.component.html',
  styleUrls: ['./project-detail-page.component.scss']
})
export default class ProjectDetailPageComponent implements OnInit, OnDestroy {
  project: Project | null = null
  todos: Todo[] = []
  progress: ProjectProgress = { total: 0, completed: 0 }
  loading = false
  error: string | null = null
  private destroy$ = new Subject<void>()

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    if (isNaN(id)) {
      this.router.navigate(['/dashboard/projects'])
      return
    }
    this.loadProject(id)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadProject(id: number): void {
    this.loading = true
    this.error = null
    forkJoin({
      project: this.projectService.getById(id),
      todos: this.projectService.getProjectTodos(id),
      progress: this.projectService.getProjectProgress(id),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.project = result.project
        this.todos = result.todos
        this.progress = result.progress
        this.loading = false
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? '取得に失敗しました'
        this.loading = false
      }
    })
  }

  get progressPercent(): number {
    if (this.progress.total === 0) return 0
    return Math.round((this.progress.completed / this.progress.total) * 100)
  }

  get completedTodos(): Todo[] {
    return this.todos.filter((t) => t.completed)
  }

  get pendingTodos(): Todo[] {
    return this.todos.filter((t) => !t.completed)
  }

  priorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-danger'
      case 'medium': return 'bg-warning text-dark'
      case 'low': return 'bg-success'
      default: return 'bg-secondary'
    }
  }
}
