import { Observable, of, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router) {}
  canActivate(): Observable<boolean> {
    const userString = window.localStorage.getItem('user');

    if (userString == null) {
      this.router.navigate(['/login']);

      return of(false);
    }

    return of(true);
  }
}
