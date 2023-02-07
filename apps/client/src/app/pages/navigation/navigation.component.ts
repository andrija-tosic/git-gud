import { Component } from '@angular/core';
import { User } from '@git-gud/entities';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'git-gud-navigation',
  templateUrl: './navigation.component.html',
})
export class NavigationComponent {
  loggedInUser$: BehaviorSubject<User>;
  constructor(private userService: UserService) {
    this.loggedInUser$ = this.userService.loggedInUser$.pipe(filter((user) => !!user)) as BehaviorSubject<User>;
  }
}
