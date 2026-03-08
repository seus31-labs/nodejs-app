import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { AdvancedSearchDialogComponent, type AdvancedSearchDialogData } from './advanced-search-dialog.component'
import type { Tag } from '../../../../../models/tag.interface'

const mockTags: Tag[] = [
  { id: 1, userId: 1, name: 'work', color: '#ff0000', createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, name: 'private', color: '#ffffff', createdAt: '', updatedAt: '' },
]

describe('AdvancedSearchDialogComponent (2.13.3)', () => {
  const defaultData: AdvancedSearchDialogData = {
    currentParams: null,
    allTags: [],
  }

  describe('with default data (currentParams: null, allTags: [])', () => {
    let component: AdvancedSearchDialogComponent
    let fixture: ComponentFixture<AdvancedSearchDialogComponent>
    let dialogRef: jasmine.SpyObj<MatDialogRef<AdvancedSearchDialogComponent>>

    beforeEach(async () => {
      dialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
      await TestBed.configureTestingModule({
        imports: [AdvancedSearchDialogComponent],
        providers: [
          provideNoopAnimations(),
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: defaultData },
        ],
      }).compileComponents()

      fixture = TestBed.createComponent(AdvancedSearchDialogComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
    })

    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should init form with empty values when data.currentParams is null', () => {
      expect(component.form.get('q')?.value).toBe('')
      expect(component.form.get('completed')?.value).toBe('')
      expect(component.form.get('priority')?.value).toBe('')
      expect(component.form.get('tagIds')?.value).toEqual([])
    })

    it('should close with SearchParams when apply()', () => {
      component.form.patchValue({ q: ' keyword ', completed: 'true', priority: 'medium', tagIds: [1, 2] })
      component.apply()
      expect(dialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          q: 'keyword',
          completed: true,
          priority: 'medium',
          tagIds: [1, 2],
        })
      )
    })

    it('should not include optional fields when empty on apply()', () => {
      component.form.patchValue({ q: '', completed: '', priority: '', tagIds: [] })
      component.apply()
      const call = (dialogRef.close as jasmine.Spy).calls.mostRecent()
      expect(call.args[0]).toEqual({ q: '' })
    })

    it('should reset form on clear()', () => {
      component.form.patchValue({ q: 'x', completed: 'true', priority: 'high', tagIds: [1] })
      component.clear()
      expect(component.form.get('q')?.value).toBe('')
      expect(component.form.get('completed')?.value).toBe('')
      expect(component.form.get('priority')?.value).toBe('')
      expect(component.form.get('tagIds')?.value).toEqual([])
    })

    it('should close with no arg when cancel()', () => {
      component.cancel()
      expect(dialogRef.close).toHaveBeenCalledWith()
    })

    it('isLight should return true for light hex', () => {
      expect(component.isLight('#ffffff')).toBe(true)
    })

    it('isLight should return false for dark hex', () => {
      expect(component.isLight('#000000')).toBe(false)
    })

    it('isLight should return false for invalid hex', () => {
      expect(component.isLight('')).toBe(false)
      expect(component.isLight('red')).toBe(false)
    })
  })

  describe('when MAT_DIALOG_DATA has currentParams', () => {
    let component: AdvancedSearchDialogComponent
    let fixture: ComponentFixture<AdvancedSearchDialogComponent>
    beforeEach(async () => {
      const ref = jasmine.createSpyObj('MatDialogRef', ['close'])
      await TestBed.configureTestingModule({
        imports: [AdvancedSearchDialogComponent],
        providers: [
          provideNoopAnimations(),
          { provide: MatDialogRef, useValue: ref },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              currentParams: { q: 'test', completed: true, priority: 'high', tagIds: [1] },
              allTags: [],
            },
          },
        ],
      }).compileComponents()
      fixture = TestBed.createComponent(AdvancedSearchDialogComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
    })

    it('should init form from data.currentParams', () => {
      expect(component.form.get('q')?.value).toBe('test')
      expect(component.form.get('completed')?.value).toBe('true')
      expect(component.form.get('priority')?.value).toBe('high')
      expect(component.form.get('tagIds')?.value).toEqual([1])
    })
  })

  describe('when MAT_DIALOG_DATA has allTags', () => {
    let component: AdvancedSearchDialogComponent
    let fixture: ComponentFixture<AdvancedSearchDialogComponent>
    beforeEach(async () => {
      const ref = jasmine.createSpyObj('MatDialogRef', ['close'])
      await TestBed.configureTestingModule({
        imports: [AdvancedSearchDialogComponent],
        providers: [
          provideNoopAnimations(),
          { provide: MatDialogRef, useValue: ref },
          { provide: MAT_DIALOG_DATA, useValue: { currentParams: null, allTags: mockTags } },
        ],
      }).compileComponents()
      fixture = TestBed.createComponent(AdvancedSearchDialogComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
    })

    it('should toggle tag in tagIds', () => {
      expect(component.tagIdsFormValue).toEqual([])
      component.toggleTag(1)
      expect(component.tagIdsFormValue).toEqual([1])
      component.toggleTag(2)
      expect(component.tagIdsFormValue).toEqual([1, 2])
      component.toggleTag(1)
      expect(component.tagIdsFormValue).toEqual([2])
    })
  })
})
