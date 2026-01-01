import { Component, EventEmitter, Output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgClass } from '@angular/common'
import { NavLeftComponent } from './nav-left/nav-left.component'
import { NavRightComponent } from './nav-right/nav-right.component'

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    NavLeftComponent,
    NavRightComponent
  ],
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  // public props
  @Output() NavCollapsedMob = new EventEmitter()
  navCollapsedMob = false
  headerStyle: string = ''
  menuClass: boolean = false
  collapseStyle: string = 'none'

  // public method
  toggleMobOption() {
    this.menuClass = !this.menuClass
    this.headerStyle = this.menuClass ? 'none' : ''
    this.collapseStyle = this.menuClass ? 'block' : 'none'
  }
}
