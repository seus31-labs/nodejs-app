import { Component } from '@angular/core'
import {Router, RouterModule} from '@angular/router'
import { AuthService } from '../../../../services/auth.service'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgIf } from '@angular/common'

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, NgIf],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export default class AuthSignupComponent {
  registerForm: FormGroup

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
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
