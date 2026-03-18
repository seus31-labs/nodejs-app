import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { ReminderSettingsComponent } from '../../../reminder-settings/reminder-settings.component'

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, ReminderSettingsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export default class HomeComponent {}
