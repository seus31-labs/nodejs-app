import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { RecurrencePattern, type Recurrence } from '../../models/recurrence.interface'

@Component({
  selector: 'app-recurrence-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recurrence-form.component.html',
  styleUrl: './recurrence-form.component.scss'
})
export class RecurrenceFormComponent implements OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  @Input() value: Recurrence = {
    isRecurring: false,
    recurrencePattern: null,
    recurrenceInterval: 1,
    recurrenceEndDate: null
  }
  @Output() recurrenceChanged = new EventEmitter<Recurrence>()

  readonly patterns = [
    { value: RecurrencePattern.Daily, label: '毎日' },
    { value: RecurrencePattern.Weekly, label: '毎週' },
    { value: RecurrencePattern.Monthly, label: '毎月' },
  ]

  readonly form = this.fb.group({
    isRecurring: [false],
    recurrencePattern: [null as RecurrencePattern | null],
    recurrenceInterval: [1],
    recurrenceEndDate: ['']
  })

  constructor(private fb: FormBuilder) {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.emitCurrentValue()
      })
  }

  ngOnChanges(): void {
    this.form.patchValue({
      isRecurring: this.value?.isRecurring ?? false,
      recurrencePattern: this.value?.recurrencePattern ?? null,
      recurrenceInterval: this.value?.recurrenceInterval ?? 1,
      recurrenceEndDate: this.value?.recurrenceEndDate ?? ''
    }, { emitEvent: false })
  }

  private emitCurrentValue(): void {
    const raw = this.form.getRawValue()
    const recurring = raw.isRecurring === true

    if (recurring && !raw.recurrencePattern) {
      this.form.patchValue({ recurrencePattern: RecurrencePattern.Daily }, { emitEvent: false })
    }
    const patchedRaw = this.form.getRawValue()

    this.recurrenceChanged.emit({
      isRecurring: recurring,
      recurrencePattern: recurring ? (patchedRaw.recurrencePattern ?? RecurrencePattern.Daily) : null,
      recurrenceInterval: recurring
        ? Math.max(1, Number(patchedRaw.recurrenceInterval ?? 1))
        : 1,
      recurrenceEndDate: recurring
        ? (patchedRaw.recurrenceEndDate?.trim() || null)
        : null
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
