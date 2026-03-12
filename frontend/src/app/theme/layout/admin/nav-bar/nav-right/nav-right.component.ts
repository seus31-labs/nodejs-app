import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap'
import { AuthService } from '../../../../../services/auth.service'
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component'
import { OfflineIndicatorComponent } from '../../../../shared/components/offline-indicator/offline-indicator.component'

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  standalone: true,
  imports: [
    ThemeToggleComponent,
    OfflineIndicatorComponent,
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
