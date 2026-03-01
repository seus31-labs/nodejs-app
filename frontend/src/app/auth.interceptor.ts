import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { Router } from '@angular/router'
import { AuthService } from './services/auth.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const token = this.authService.getToken()
    const reqToSend = token
      ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
      : req

    return next.handle(reqToSend).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.authService.logout()
          this.router.navigate(['/auth/signin'])
        }
        return throwError(() => err)
      })
    )
  }
}
