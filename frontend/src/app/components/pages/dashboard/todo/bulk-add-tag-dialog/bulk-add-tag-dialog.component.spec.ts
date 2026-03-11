import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { MatDialogRef } from '@angular/material/dialog'
import { of } from 'rxjs'
import { BulkAddTagDialogComponent } from './bulk-add-tag-dialog.component'
import { TagService } from '../../../../../services/tag.service'
import type { Tag } from '../../../../../models/tag.interface'

const mockTags: Tag[] = [
  { id: 1, userId: 1, name: 'work', color: '#ff0000', createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, name: 'private', color: '#00ff00', createdAt: '', updatedAt: '' },
]

describe('BulkAddTagDialogComponent (15.14)', () => {
  let component: BulkAddTagDialogComponent
  let fixture: ComponentFixture<BulkAddTagDialogComponent>
  let dialogRef: jasmine.SpyObj<MatDialogRef<BulkAddTagDialogComponent>>
  let tagService: jasmine.SpyObj<TagService>

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
    tagService = jasmine.createSpyObj('TagService', ['getTags'])
    tagService.getTags.and.returnValue(of(mockTags))

    await TestBed.configureTestingModule({
      imports: [BulkAddTagDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TagService, useValue: tagService },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(BulkAddTagDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set tags and set loading to false after getTags() emits', () => {
    expect(tagService.getTags).toHaveBeenCalled()
    expect(component.tags).toEqual(mockTags)
    expect(component.loading).toBe(false)
  })

  it('should set selectedTagId and isSelected(tag) returns true when selectTag(tag) is called', () => {
    const tag = mockTags[0]
    expect(component.isSelected(tag)).toBe(false)
    component.selectTag(tag)
    expect(component.selectedTagId).toBe(tag.id)
    expect(component.isSelected(tag)).toBe(true)
    expect(component.isSelected(mockTags[1])).toBe(false)
  })

  it('should call dialogRef.close(selectedTagId) when apply() is called with selection', () => {
    component.selectTag(mockTags[1])
    component.apply()
    expect(dialogRef.close).toHaveBeenCalledWith(2)
  })

  it('should not call dialogRef.close when apply() is called with no selection', () => {
    component.selectedTagId = null
    component.apply()
    expect(dialogRef.close).not.toHaveBeenCalled()
  })

  it('should call dialogRef.close() with no arg when cancel() is called', () => {
    component.cancel()
    expect(dialogRef.close).toHaveBeenCalledWith()
  })
})
