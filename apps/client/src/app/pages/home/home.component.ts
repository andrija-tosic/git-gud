import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'git-gud-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  user$ = this.userService.loggedInUser$;

  constructor(private userService: UserService) {}
}
