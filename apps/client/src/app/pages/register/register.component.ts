import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { alertErrors } from '../../alert-errors';
import { UserService } from '../../services/user.service';

@Component({
  providers: [MessageService],
  selector: 'git-gud-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  email: string | null = null;
  name: string | null = null;

  constructor(private userService: UserService, public router: Router, public messageService: MessageService) {}

  register() {
    if (this.email && this.name) {
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
        this.messageService.add({ severity: 'error', summary: 'Email is not valid', detail: `Email is not valid` });

        return;
      }

      if (this.name.length < 3) {
        this.messageService.add({
          severity: 'error',
          summary: 'Name is not valid',
          detail: `Name should be at least 3 characters long`,
        });
        return;
      }

      this.userService.register({ email: this.email, name: this.name }).subscribe({
        next: (_person) => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Account already exists',
            detail: `Account with given email (${this.email}) already exists`,
          });
        },
      });
    }
  }
}
