import { Component } from '@angular/core'
import {Location, NgClass} from '@angular/common'
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component'
import { RouterOutlet } from '@angular/router'
import { NavigationComponent } from './navigation/navigation.component'
import { NavBarComponent } from './nav-bar/nav-bar.component'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  standalone: true,
  imports: [
    NavigationComponent,
    BreadcrumbsComponent,
    RouterOutlet,
    NgClass,
    NavBarComponent,
  ],
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  navCollapsed: any
  navCollapsedMob: boolean
  windowWidth: number

  constructor(private location: Location) {
    let current_url = this.location.path()
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path()
    }

    this.windowWidth = window.innerWidth
    this.navCollapsed = this.windowWidth >= 992
    this.navCollapsedMob = false
  }

  navMobClick() {
    if (this.navCollapsedMob && !document.querySelector('app-navigation.pcoded-navbar').classList.contains('mob-open')) {
      this.navCollapsedMob = !this.navCollapsedMob
      setTimeout(() => {
        this.navCollapsedMob = !this.navCollapsedMob
      }, 100)
    } else {
      this.navCollapsedMob = !this.navCollapsedMob
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu()
    }
  }

  closeMenu() {
    if (document.querySelector('app-navigation.pcoded-navbar').classList.contains('mob-open')) {
      document.querySelector('app-navigation.pcoded-navbar')?.classList.remove('mob-open')
    }
  }
}
