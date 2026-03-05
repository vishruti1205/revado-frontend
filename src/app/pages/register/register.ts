// Register page component: creates a new user account and redirects to login.
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {

  registerData = {
    username: '',
    password: '',
    firstname: '',
    lastname: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {

    this.authService.register(this.registerData).subscribe(() => {
      alert("Registration successful!");
      this.router.navigate(['/login']);
    });
  }
}
