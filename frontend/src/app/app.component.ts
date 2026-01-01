import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { SharedModule } from './theme/shared/shared.module'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    SharedModule
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Node App Frontend'

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return
      }
      window.scrollTo(0, 0)
    })
  }
}
