import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export default class HomeComponent {}
