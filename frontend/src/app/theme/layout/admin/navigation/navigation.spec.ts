import { NavigationItem } from './navigation'

describe('NavigationItem (12.12 calendar)', () => {
  it('should expose dashboard calendar link for sidebar', () => {
    const nav = new NavigationItem()
    const groups = nav.get()
    const items = groups[0].children ?? []
    const calendar = items.find((i) => i.id === 'calendar')
    expect(calendar).toBeTruthy()
    expect(calendar?.url).toBe('/dashboard/calendar')
    expect(calendar?.title).toBe('カレンダー')
  })
})
