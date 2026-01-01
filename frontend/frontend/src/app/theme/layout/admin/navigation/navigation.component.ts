import { Component, EventEmitter, Output } from '@angular/core'
import {NavContentComponent} from "./nav-content/nav-content.component"
import {NavLogoComponent} from "./nav-logo/nav-logo.component"

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  standalone: true,
  imports: [
    NavContentComponent,
    NavLogoComponent
  ],
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  // public props
  @Output() NavCollapse = new EventEmitter()
  @Output() NavCollapsedMob = new EventEmitter()
  navCollapsed: any
  navCollapsedMob = false
  windowWidth = window.innerWidth

  // constructor
  constructor() {
    this.navCollapsed = this.windowWidth >= 992
  }

  // public method
  navCollapse() {
    if (this.windowWidth >= 992) {
      this.navCollapsed = !this.navCollapsed
      this.NavCollapse.emit()
    }
  }

  navCollapseMob() {
    if (this.windowWidth < 992) {
      this.NavCollapsedMob.emit()
    }
  }
}
