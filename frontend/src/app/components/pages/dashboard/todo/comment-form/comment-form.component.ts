import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentFormComponent {
  @Input() disabled = false
  @Input() submitting = false
  @Output() submitted = new EventEmitter<string>()

  draft = ''

  constructor(private cdr: ChangeDetectorRef) {}

  onSubmit(): void {
    if (this.disabled || this.submitting) return
    const text = this.draft.trim()
    if (!text) return
    this.submitted.emit(text)
  }

  /** 親が投稿成功後に呼び出す */
  reset(): void {
    this.draft = ''
    this.cdr.markForCheck()
  }
}
