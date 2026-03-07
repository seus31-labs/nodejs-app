import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { of, throwError } from 'rxjs'
import TagsPageComponent from './tags-page.component'
import { TagService } from '../../../../services/tag.service'
import type { Tag } from '../../../../models/tag.interface'

const mockTags: Tag[] = [
  { id: 1, userId: 1, name: 'work', color: '#ff0000', createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, name: 'private', color: '#00ff00', createdAt: '', updatedAt: '' },
]

describe('TagsPageComponent (1.26.2, 1.26.3)', () => {
  let component: TagsPageComponent
  let fixture: ComponentFixture<TagsPageComponent>
  let tagService: jasmine.SpyObj<TagService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TagService', ['getTags', 'create', 'delete'])
    await TestBed.configureTestingModule({
      imports: [TagsPageComponent],
      providers: [{ provide: TagService, useValue: spy }, provideNoopAnimations()],
    }).compileComponents()

    tagService = TestBed.inject(TagService) as jasmine.SpyObj<TagService>
    tagService.getTags.and.returnValue(of([]))

    fixture = TestBed.createComponent(TagsPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call getTags on init', () => {
    expect(tagService.getTags).toHaveBeenCalled()
    expect(component.tags).toEqual([])
  })

  it('should display loaded tags', () => {
    tagService.getTags.calls.reset()
    tagService.getTags.and.returnValue(of(mockTags))
    component.loadTags()
    expect(component.tags).toEqual(mockTags)
    expect(component.loading).toBe(false)
  })

  it('should call create and reload on submit with valid name', () => {
    tagService.create.and.returnValue(of(mockTags[0]))
    tagService.getTags.and.returnValue(of([]))
    component.newName = ' newtag '
    component.newColor = '#0000ff'
    component.onSubmit()
    expect(tagService.create).toHaveBeenCalledWith({ name: 'newtag', color: '#0000ff' })
    expect(tagService.getTags).toHaveBeenCalled()
    expect(component.newName).toBe('')
    expect(component.newColor).toBe('#808080')
  })

  it('should not call create when name is empty', () => {
    component.newName = '   '
    component.onSubmit()
    expect(tagService.create).not.toHaveBeenCalled()
  })

  it('should call delete and reload when confirm is true', () => {
    spyOn(window, 'confirm').and.returnValue(true)
    tagService.delete.and.returnValue(of(undefined))
    tagService.getTags.and.returnValue(of([]))
    component.onDelete(mockTags[0])
    expect(tagService.delete).toHaveBeenCalledWith(1)
    expect(tagService.getTags).toHaveBeenCalled()
  })

  it('should not call delete when confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false)
    component.onDelete(mockTags[0])
    expect(tagService.delete).not.toHaveBeenCalled()
  })

  it('should set error on create failure', () => {
    component.newName = 'x'
    tagService.create.and.returnValue(throwError(() => ({ message: 'create error' })))
    component.onSubmit()
    expect(component.error).toBe('create error')
  })

  it('isLight should return true for light hex', () => {
    expect(component.isLight('#ffffff')).toBe(true)
  })

  it('isLight should return false for dark hex', () => {
    expect(component.isLight('#000000')).toBe(false)
  })
})
