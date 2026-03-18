import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { SearchBarComponent } from './search-bar.component'

describe('SearchBarComponent (2.13.2)', () => {
  let component: SearchBarComponent
  let fixture: ComponentFixture<SearchBarComponent>

  beforeEach(async () => {
    localStorage.clear()
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(SearchBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit searchTerm with trimmed value after debounce', fakeAsync(() => {
    const emitted: string[] = []
    component.searchTerm.subscribe((v) => emitted.push(v))
    component.query.setValue('  keyword  ')
    expect(emitted.length).toBe(0)
    tick(300)
    expect(emitted).toEqual(['keyword'])
  }))

  it('should emit empty string on clear', () => {
    const emitted: string[] = []
    component.searchTerm.subscribe((v) => emitted.push(v))
    component.query.setValue('x')
    component.onClear()
    expect(component.query.value).toBe('')
    expect(emitted).toEqual([''])
  })

  it('should save search history to localStorage', fakeAsync(() => {
    component.query.setValue('apple')
    tick(300)
    const raw = localStorage.getItem('todo.search.history.v1')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw as string)).toEqual(['apple'])
  }))

  it('should move duplicated term to top', fakeAsync(() => {
    component.query.setValue('a')
    tick(300)
    component.query.setValue('b')
    tick(300)
    component.query.setValue('a')
    tick(300)
    expect(component.history).toEqual(['a', 'b'])
  }))

  it('should clear search history', fakeAsync(() => {
    component.query.setValue('x')
    tick(300)
    component.clearHistory()
    expect(component.history).toEqual([])
    expect(localStorage.getItem('todo.search.history.v1')).toEqual('[]')
  }))

  it('should not throw on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
