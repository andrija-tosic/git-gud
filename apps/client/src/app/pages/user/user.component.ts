/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';

@Component({
  providers: [MessageService],
  selector: 'git-gud-user',
  templateUrl: './user.component.html',
})
export class UserComponent {
  editing = false;

  name = '';
  email = '';

  user$ = this.userService.selectedUser$;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id')!;

      this.userService.getUser(id).subscribe((user) => {
        this.name = user.name;
        this.email = user.email;
      });
    });
  }

  editButtonClick(id: string) {
    if (this.editing) {
      let errors = false;
      if (!this.name || this.name === '') {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name cannot be empty.' });
        errors = true;
      }
      if (!this.email || this.email === '') {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Email cannot be empty.' });
        errors = true;
      }
      console.log({ name: this.name, email: this.email });
      if (errors) return;

      this.userService.update(id, { name: this.name, email: this.email }).subscribe((user) => {
        this.name = user.name;
        this.email = user.email;
      });
      this.editing = false;
    } else {
      this.editing = true;
    }
  }

  onDeleteClick(id: string) {
    this.userService.delete(id).subscribe((_) => {
      this.router.navigate(['/register']);
    });
  }

  onConfirmToast() {
    this.messageService.clear();
  }

  onRejectToast() {
    this.messageService.clear();
  }
}
