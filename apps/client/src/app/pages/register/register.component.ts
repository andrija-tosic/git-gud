import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { alertErrors } from '../../alert-errors';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'git-gud-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  email: string | null = null;
  name: string | null = null;

  constructor(private userService: UserService, private router: Router) {}

  register() {
    if (this.email && this.name) {
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
        alert('Email is not valid.');
        return;
      }

      if (this.name.length < 3) {
        alert('Name is not valid.');
        return;
      }

      this.userService.register({ email: this.email, name: this.name }).subscribe({
        next: (person) => {
          this.router.navigate(['/']);
        },
        error: alertErrors,
      });
    }
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
