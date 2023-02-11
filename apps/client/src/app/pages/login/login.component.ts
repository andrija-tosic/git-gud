import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';

@Component({
  providers: [MessageService],
  selector: 'git-gud-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email: string | null = null;

  constructor(private userService: UserService, public router: Router, public messageService: MessageService) {}

  login() {
    if (this.email) {
      if (!(this.email && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email))) {
        this.messageService.add({ severity: 'error', summary: 'Email is not valid', detail: `Email is not valid` });
        return;
      }

      this.userService.login(this.email).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          if (err.status === 404) {
            this.messageService.add({
              severity: 'error',
              summary: 'Not found',
              detail: `Account with given email (${this.email}) not found`,
            });
          }
        },
      });
    }
  }
}
