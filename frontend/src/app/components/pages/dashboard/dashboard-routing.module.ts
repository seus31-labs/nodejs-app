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
        path: 'todos',
        loadComponent: () => import('./todo/todo-page/todo-page.component')
      },
      {
        path: 'archived',
        loadComponent: () => import('./archived-todos/archived-todos-page.component')
      },
      {
        path: 'tags',
        loadComponent: () => import('./tags/tags-page.component')
      },
      {
        path: 'projects',
        loadComponent: () => import('./projects/projects-page/projects-page.component')
      },
      {
        path: 'templates',
        loadComponent: () => import('./templates/templates-page/templates-page.component')
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./projects/project-detail-page/project-detail-page.component')
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
