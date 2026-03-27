import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RecurrencePattern } from '../../models/recurrence.interface'

import { RecurrenceFormComponent } from './recurrence-form.component'

describe('RecurrenceFormComponent', () => {
  let component: RecurrenceFormComponent
  let fixture: ComponentFixture<RecurrenceFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurrenceFormComponent]
    })
    .compileComponents()

    fixture = TestBed.createComponent(RecurrenceFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit normalized recurrence when enabled', () => {
    const emitted: unknown[] = []
    component.recurrenceChanged.subscribe((v) => emitted.push(v))

    component.form.patchValue({
      isRecurring: true,
      recurrencePattern: RecurrencePattern.Weekly,
      recurrenceInterval: 2,
      recurrenceEndDate: '2026-12-31'
    })

    expect(emitted.length).toBeGreaterThan(0)
    const last = emitted[emitted.length - 1] as {
      isRecurring: boolean
      recurrencePattern: string | null
      recurrenceInterval: number
      recurrenceEndDate: string | null
    }
    expect(last).toEqual({
      isRecurring: true,
      recurrencePattern: 'weekly',
      recurrenceInterval: 2,
      recurrenceEndDate: '2026-12-31'
    })
  })

  it('should emit cleared recurrence when disabled', () => {
    const emitted: unknown[] = []
    component.recurrenceChanged.subscribe((v) => emitted.push(v))

    component.form.patchValue({
      isRecurring: false,
      recurrencePattern: RecurrencePattern.Monthly,
      recurrenceInterval: 3,
      recurrenceEndDate: '2026-12-31'
    })

    const last = emitted[emitted.length - 1] as {
      isRecurring: boolean
      recurrencePattern: string | null
      recurrenceInterval: number
      recurrenceEndDate: string | null
    }
    expect(last).toEqual({
      isRecurring: false,
      recurrencePattern: null,
      recurrenceInterval: 1,
      recurrenceEndDate: null
    })
  })

  it('should initialize daily pattern when enabled with null pattern', () => {
    const emitted: unknown[] = []
    component.recurrenceChanged.subscribe((v) => emitted.push(v))

    component.form.patchValue({
      isRecurring: true,
      recurrencePattern: null
    })

    const last = emitted[emitted.length - 1] as {
      isRecurring: boolean
      recurrencePattern: string | null
    }
    expect(last.isRecurring).toBe(true)
    expect(last.recurrencePattern).toBe('daily')
    expect(component.form.get('recurrencePattern')?.value).toBe(RecurrencePattern.Daily)
  })

  it('should reflect @Input value on ngOnChanges', () => {
    component.value = {
      isRecurring: true,
      recurrencePattern: RecurrencePattern.Monthly,
      recurrenceInterval: 3,
      recurrenceEndDate: '2026-06-30'
    }
    component.ngOnChanges()

    expect(component.form.get('isRecurring')?.value).toBe(true)
    expect(component.form.get('recurrencePattern')?.value).toBe(RecurrencePattern.Monthly)
    expect(component.form.get('recurrenceInterval')?.value).toBe(3)
    expect(component.form.get('recurrenceEndDate')?.value).toBe('2026-06-30')
  })
})
