import { Component, EventEmitter, Input, Output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgClass } from '@angular/common'

@Component({
  selector: 'app-nav-logo',
  templateUrl: './nav-logo.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgClass
  ],
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent {
  // public props
  @Input() navCollapsed: boolean
  @Output() NavCollapse = new EventEmitter()
  windowWidth = window.innerWidth

  // public method
  navCollapse() {
    if (this.windowWidth >= 992) {
      this.navCollapsed = !this.navCollapsed
      this.NavCollapse.emit()
    }
  }
}
