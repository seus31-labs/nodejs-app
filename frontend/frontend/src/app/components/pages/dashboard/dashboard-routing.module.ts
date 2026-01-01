import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.component')
      },
      {
        path: 'tasks/list',
        loadComponent: () => import('./tasks/task-list/task-list.component')
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
