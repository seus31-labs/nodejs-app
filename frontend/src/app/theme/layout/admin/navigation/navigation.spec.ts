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
    expect(calendar?.icon).toBe('feather icon-calendar')
  })

  it('should expose analytics link for sidebar (13.16)', () => {
    const nav = new NavigationItem()
    const items = nav.get()[0].children ?? []
    const analytics = items.find((i) => i.id === 'analytics')
    expect(analytics).toBeTruthy()
    expect(analytics?.url).toBe('/dashboard/analytics')
    expect(analytics?.title).toBe('分析')
    expect(analytics?.icon).toBe('feather icon-bar-chart-2')
  })
})
