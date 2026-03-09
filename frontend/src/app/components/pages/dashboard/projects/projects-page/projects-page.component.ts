import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, forkJoin, takeUntil } from 'rxjs'
import { ProjectService } from '../../../../../services/project.service'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import { ProjectListComponent } from '../project-list/project-list.component'
import { ProjectFormComponent } from '../project-form/project-form.component'
import type { Project, CreateProjectDto, UpdateProjectDto, ProjectProgress } from '../../../../../models/project.interface'

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ProjectListComponent, ProjectFormComponent],
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.scss']
})
export default class ProjectsPageComponent implements OnInit, OnDestroy {
  projects: Project[] = []
  progressMap: Record<number, ProjectProgress> = {}
  loading = false
  error: string | null = null
  editingProject: Project | null = null
  private destroy$ = new Subject<void>()

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadProjects(): void {
    this.loading = true
    this.error = null
    this.projectService.getAll(true).pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => {
        this.projects = list
        this.loading = false
        this.loadAllProgress(list)
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? '取得に失敗しました'
        this.loading = false
      }
    })
  }

  private loadAllProgress(projects: Project[]): void {
    if (projects.length === 0) {
      this.progressMap = {}
      return
    }
    const requests: Record<string, ReturnType<ProjectService['getProjectProgress']>> = {}
    projects.forEach((p) => {
      requests[String(p.id)] = this.projectService.getProjectProgress(p.id)
    })
    forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        const map: Record<number, ProjectProgress> = {}
        Object.entries(result).forEach(([id, progress]) => {
          map[Number(id)] = progress
        })
        this.progressMap = map
      },
      error: () => {
        this.progressMap = {}
      }
    })
  }

  onSubmitForm(payload: CreateProjectDto | UpdateProjectDto): void {
    if (this.editingProject) {
      this.projectService.update(this.editingProject.id, payload as UpdateProjectDto)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.editingProject = null
            this.loadProjects()
          },
          error: (err) => {
            this.error = err?.error?.error ?? err?.message ?? '更新に失敗しました'
          }
        })
    } else {
      this.projectService.create(payload as CreateProjectDto)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: () => this.loadProjects(),
          error: (err) => {
            this.error = err?.error?.error ?? err?.message ?? '作成に失敗しました'
          }
        })
    }
  }

  onEdit(project: Project): void {
    this.editingProject = project
  }

  onCancelEdit(): void {
    this.editingProject = null
  }

  onDelete(project: Project): void {
    if (!confirm(`プロジェクト「${project.name}」を削除しますか？\n所属する Todo のプロジェクト割り当ては解除されます。`)) return
    this.projectService.delete(project.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        if (this.editingProject?.id === project.id) this.editingProject = null
        this.loadProjects()
      },
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? '削除に失敗しました'
      }
    })
  }

  onArchive(project: Project): void {
    if (!confirm(`プロジェクト「${project.name}」をアーカイブしますか？`)) return
    this.projectService.archive(project.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadProjects(),
      error: (err) => {
        this.error = err?.error?.error ?? err?.message ?? 'アーカイブに失敗しました'
      }
    })
  }
}
