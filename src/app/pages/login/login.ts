// Login page component: handles user sign-in and navigation to register page.
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {

  loginData = {
    username: '',
    password: ''
  };
  loginError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    this.loginError = '';

    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        const token = this.extractToken(res);

        if (!token) {
          // Handle invalid-login responses that still return HTTP 200.
          this.loginError = 'Use correct credentials to login. If you are not registered, click Register.';
          this.cdr.detectChanges();
          return;
        }

        localStorage.setItem('token', token);
        this.router.navigate(['/todo']);
      },
      error: () => {
        this.loginError = 'Use correct credentials to login. If you are not registered, click Register.';
        this.cdr.detectChanges();
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private extractToken(res: any): string | null {
    if (typeof res === 'string') {
      const token = res.trim();
      return this.isLikelyJwt(token) ? token : null;
    }

    if (res && typeof res === 'object') {
      const token = typeof res.token === 'string' ? res.token.trim() : '';
      return this.isLikelyJwt(token) ? token : null;
    }

    return null;
  }

  private isLikelyJwt(token: string): boolean {
    // Basic JWT shape check to prevent storing non-token responses.
    return token.split('.').length === 3;
  }
}
