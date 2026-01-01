import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-guest',
  templateUrl: './guest.component.html',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  styleUrls: ['./guest.component.scss']
})
export class GuestComponent {}
