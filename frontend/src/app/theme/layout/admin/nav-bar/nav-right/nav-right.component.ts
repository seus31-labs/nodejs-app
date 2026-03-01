import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap'
import { AuthService } from '../../../../../services/auth.service'

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
export class NavRightComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout()
    this.router.navigate(['/auth/signin'])
  }
}
