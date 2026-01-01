import { Routes } from '@angular/router'
import { AdminComponent } from './theme/layout/admin/admin.component'
import { GuestComponent } from './theme/layout/guest/guest.component'
import { AuthGuard } from './auth.guard'

export const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: '',
        loadChildren: () => import('./components/pages/dashboard/dashboard.module').then((m) => m.DashboardModule)
      }
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    component: GuestComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./components/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  },
  { path: '', redirectTo: '/dashboard/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard/home' }
]
