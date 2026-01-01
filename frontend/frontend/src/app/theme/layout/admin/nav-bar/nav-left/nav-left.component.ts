import { Component } from '@angular/core'
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap'
import { NavSearchComponent } from './nav-search/nav-search.component'

@Component({
  selector: 'app-nav-left',
  templateUrl: './nav-left.component.html',
  standalone: true,
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NavSearchComponent
  ],
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent {}
