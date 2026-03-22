import { CalendarPageComponent } from './calendar/calendar-page/calendar-page.component'
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
    const Cmp = await calendarRoute!.loadComponent!()
    expect(Cmp).toBe(CalendarPageComponent)
  })
})
