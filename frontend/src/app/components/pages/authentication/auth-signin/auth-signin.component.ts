import { Component } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { AuthService } from '../../../../services/auth.service'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgIf } from '@angular/common'

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, NgIf],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent {
  loginForm: FormGroup

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.authService.saveToken(response.token)
          this.router.navigate(['/dashboard']).then(r => {})
          console.log('Logged in successfully')
        },
        error: (error) => {
          console.error('Login failed', error)
        },
        complete: () => {
          console.log('Request completed')
        }
      })
    }
  }
}
