import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { RecurrencePattern, type Recurrence } from '../../models/recurrence.interface'

@Component({
  selector: 'app-recurrence-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recurrence-form.component.html',
  styleUrl: './recurrence-form.component.scss'
})
export class RecurrenceFormComponent implements OnChanges {
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
    this.form.valueChanges.subscribe(() => {
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

    this.recurrenceChanged.emit({
      isRecurring: recurring,
      recurrencePattern: recurring ? (raw.recurrencePattern ?? RecurrencePattern.Daily) : null,
      recurrenceInterval: recurring
        ? Math.max(1, Number(raw.recurrenceInterval ?? 1))
        : 1,
      recurrenceEndDate: recurring
        ? (raw.recurrenceEndDate?.trim() || null)
        : null
    })
  }
}
