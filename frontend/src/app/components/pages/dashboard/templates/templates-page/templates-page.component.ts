import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { TemplateService } from '../../../../../services/template.service'
import { TagService } from '../../../../../services/tag.service'
import { CardComponent } from '../../../../../theme/shared/components/card/card.component'
import { TemplateListComponent } from '../template-list/template-list.component'
import { TemplateFormComponent } from '../template-form/template-form.component'
import type {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '../../../../../models/template.interface'
import type { Tag } from '../../../../../models/tag.interface'

@Component({
  selector: 'app-templates-page',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    TemplateListComponent,
    TemplateFormComponent,
  ],
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss'],
})
export default class TemplatesPageComponent implements OnInit, OnDestroy {
  templates: Template[] = []
  allTags: Tag[] = []
  loading = false
  error: string | null = null
  editingTemplate: Template | null = null
  private destroy$ = new Subject<void>()

  constructor(
    private templateService: TemplateService,
    private tagService: TagService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates()
    this.loadTags()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadTemplates(): void {
    this.loading = true
    this.error = null
    this.templateService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.templates = list
          this.loading = false
        },
        error: (err) => {
          this.error =
            err?.error?.error ?? err?.message ?? '取得に失敗しました'
          this.loading = false
        },
      })
  }

  loadTags(): void {
    this.tagService.getTags().pipe(takeUntil(this.destroy$)).subscribe({
      next: (tags) => {
        this.allTags = tags
      },
      error: () => {
        this.allTags = []
      },
    })
  }

  onSubmitForm(payload: CreateTemplateDto | UpdateTemplateDto): void {
    if (this.editingTemplate) {
      this.templateService
        .update(this.editingTemplate.id, payload as UpdateTemplateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.editingTemplate = null
            this.loadTemplates()
          },
          error: (err) => {
            this.error =
              err?.error?.error ?? err?.message ?? '更新に失敗しました'
          },
        })
    } else {
      this.templateService
        .create(payload as CreateTemplateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadTemplates(),
          error: (err) => {
            this.error =
              err?.error?.error ?? err?.message ?? '作成に失敗しました'
          },
        })
    }
  }

  onEdit(template: Template): void {
    this.editingTemplate = template
  }

  onCancelEdit(): void {
    this.editingTemplate = null
  }

  onDelete(template: Template): void {
    if (!confirm(`テンプレート「${template.name}」を削除しますか？`)) return
    this.templateService
      .delete(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.editingTemplate?.id === template.id) this.editingTemplate = null
          this.loadTemplates()
        },
        error: (err) => {
          this.error =
            err?.error?.error ?? err?.message ?? '削除に失敗しました'
        },
      })
  }

  onUseTemplate(template: Template): void {
    this.templateService
      .createTodoFromTemplate(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/todos'])
        },
        error: (err) => {
          this.error =
            err?.error?.error ?? err?.message ?? 'Todo の作成に失敗しました'
        },
      })
  }
}
