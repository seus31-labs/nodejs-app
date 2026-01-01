import { Component } from '@angular/core'
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  standalone: true,
  imports: [
    NgbDropdownToggle,
    NgbDropdown,
    NgbDropdownMenu
  ],
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {}
