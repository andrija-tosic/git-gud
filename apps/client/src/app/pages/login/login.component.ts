import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { alertErrors } from '../../alert-errors';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'git-gud-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email: string | null = null;

  constructor(private userService: UserService, private router: Router) {}

  login() {
    if (this.email) {
      if (!(this.email && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email))) {
        alert('Email is not valid.');

        return;
      }

      this.userService.login(this.email).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: alertErrors,
      });
    }
  }

  redirectToRegister() {
    this.router.navigate(['/register']);
  }
}
