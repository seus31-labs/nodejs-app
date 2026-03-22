import CalendarPageComponent from './calendar/calendar-page/calendar-page.component'
import AnalyticsPageComponent from './analytics/analytics-page/analytics-page.component'
import { DASHBOARD_ROUTES } from './dashboard-routing.module'

describe('DashboardRoutingModule (12.12 calendar)', () => {
  const childRoutes = DASHBOARD_ROUTES[0].children ?? []

  it('should define a calendar child route with loadComponent', () => {
    const calendarRoute = childRoutes.find((r) => r.path === 'calendar')
    expect(calendarRoute).toBeTruthy()
    expect(typeof calendarRoute?.loadComponent).toBe('function')
  })

  it('should lazy-load CalendarPageComponent for calendar route', async () => {
    const calendarRoute = childRoutes.find((r) => r.path === 'calendar')
    const mod = (await calendarRoute!.loadComponent!()) as { default: typeof CalendarPageComponent }
    expect(mod.default).toBe(CalendarPageComponent)
  })

  it('should define analytics route and lazy-load AnalyticsPageComponent (13.16)', async () => {
    const analyticsRoute = childRoutes.find((r) => r.path === 'analytics')
    expect(analyticsRoute).toBeTruthy()
    expect(typeof analyticsRoute?.loadComponent).toBe('function')
    const mod = (await analyticsRoute!.loadComponent!()) as { default: typeof AnalyticsPageComponent }
    expect(mod.default).toBe(AnalyticsPageComponent)
  })
})
