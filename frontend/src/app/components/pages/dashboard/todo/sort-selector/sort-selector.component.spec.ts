import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SortSelectorComponent } from './sort-selector.component'
import type { SortBy, SortOrder } from '../../../../../models/sort-options.interface'

describe('SortSelectorComponent (3.13.2)', () => {
  let component: SortSelectorComponent
  let fixture: ComponentFixture<SortSelectorComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortSelectorComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(SortSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default sortBy createdAt and sortOrder asc', () => {
    expect(component.sortBy).toBe('createdAt')
    expect(component.sortOrder).toBe('asc')
  })

  it('should display 5 sort options', () => {
    expect(component.sortByOptions.length).toBe(5)
    const values = component.sortByOptions.map((o) => o.value)
    expect(values).toContain('createdAt')
    expect(values).toContain('updatedAt')
    expect(values).toContain('dueDate')
    expect(values).toContain('priority')
    expect(values).toContain('sortOrder')
  })

  it('should emit sortChanged with new sortBy when select value changes', () => {
    component.sortBy = 'createdAt'
    component.sortOrder = 'asc'
    let emitted: { sortBy: SortBy; sortOrder: SortOrder } | null = null
    component.sortChanged.subscribe((v) => (emitted = v))

    const select = fixture.nativeElement.querySelector('select')
    select.value = 'dueDate'
    select.dispatchEvent(new Event('change'))
    fixture.detectChanges()

    expect(emitted).toEqual({ sortBy: 'dueDate', sortOrder: 'asc' })
  })

  it('should emit sortChanged with toggled sortOrder when toggle button is clicked', () => {
    component.sortBy = 'priority'
    component.sortOrder = 'asc'
    let emitted: { sortBy: SortBy; sortOrder: SortOrder } | null = null
    component.sortChanged.subscribe((v) => (emitted = v))

    const btn = fixture.nativeElement.querySelector('button')
    btn.click()
    fixture.detectChanges()

    expect(emitted).toEqual({ sortBy: 'priority', sortOrder: 'desc' })
  })

  it('should emit asc when toggle from desc', () => {
    component.sortBy = 'updatedAt'
    component.sortOrder = 'desc'
    let emitted: { sortBy: SortBy; sortOrder: SortOrder } | null = null
    component.sortChanged.subscribe((v) => (emitted = v))

    fixture.nativeElement.querySelector('button').click()
    fixture.detectChanges()

    expect(emitted).toEqual({ sortBy: 'updatedAt', sortOrder: 'asc' })
  })
})
