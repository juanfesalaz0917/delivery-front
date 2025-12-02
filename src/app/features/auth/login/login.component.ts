import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  loginWithGoogle(): void {
    this.loading = true;
    this.error = null;

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Error al iniciar sesión con Google. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  loginWithMicrosoft(): void {
    this.loading = true;
    this.error = null;

    this.authService.loginWithMicrosoft().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error =
          'Error al iniciar sesión con Microsoft. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  loginWithGithub(): void {
    this.loading = true;
    this.error = null;

    this.authService.loginWithGithub().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Error al iniciar sesión con GitHub. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }
}
