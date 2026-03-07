import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TagChipComponent } from './tag-chip.component'
import type { Tag } from '../../../../../models/tag.interface'

const mockTag: Tag = {
  id: 1,
  userId: 1,
  name: 'work',
  color: '#808080',
  createdAt: '',
  updatedAt: '',
}

describe('TagChipComponent (1.26.4)', () => {
  let component: TagChipComponent
  let fixture: ComponentFixture<TagChipComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagChipComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TagChipComponent)
    component = fixture.componentInstance
    component.tag = { ...mockTag }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display tag name', () => {
    expect(fixture.nativeElement.textContent).toContain('work')
  })

  it('should apply tag color as background', () => {
    const el = fixture.nativeElement.querySelector('.tag-chip')
    expect(el.style.backgroundColor).toBe('rgb(128, 128, 128)')
  })

  it('should emit removed when remove button is clicked and removable is true', () => {
    component.removable = true
    fixture.detectChanges()
    let emitted: Tag | null = null
    component.removed.subscribe((t) => (emitted = t))
    fixture.nativeElement.querySelector('button').click()
    expect(emitted).toEqual(mockTag)
  })

  it('should not show remove button when removable is false', () => {
    component.removable = false
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('button')).toBeNull()
  })

  it('isLight should return true for light color', () => {
    expect(component.isLight('#ffffff')).toBe(true)
    expect(component.isLight('#eeeeee')).toBe(true)
  })

  it('isLight should return false for dark color', () => {
    expect(component.isLight('#000000')).toBe(false)
    expect(component.isLight('#333333')).toBe(false)
  })

  it('isLight should return false for invalid hex', () => {
    expect(component.isLight('')).toBe(false)
    expect(component.isLight('red')).toBe(false)
  })
})
