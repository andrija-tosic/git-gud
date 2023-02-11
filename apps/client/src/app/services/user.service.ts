import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, tap } from 'rxjs';

import { API_URL, HTTP_OPTIONS } from '../constants';
import { User, CreateUserDto, UpdateUserDto } from '@git-gud/entities';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public loggedInUser$ = new BehaviorSubject<User | null>(null);
  public selectedUser$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    const user = window.localStorage.getItem('user');
    if (user !== null) {
      this.loggedInUser$.next(JSON.parse(user));
    }

    this.loggedInUser$.pipe(filter((user) => !!user)).subscribe((user) => {
      window.localStorage.setItem('user', JSON.stringify(user));
    });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(API_URL + '/users/' + id).pipe(
      tap((user) => {
        this.selectedUser$.next(user);
      })
    );
  }

  login(email: string): Observable<User> {
    return this.http.get<User>(API_URL + '/users/login/' + email).pipe(
      tap((user) => {
        this.loggedInUser$.next(user);
      })
    );
  }

  register(createUserDto: CreateUserDto): Observable<User> {
    return this.http
      .post<User>(API_URL + '/users/register', createUserDto, HTTP_OPTIONS)
      .pipe(tap((user) => this.loggedInUser$.next(user)));
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.http.patch<User>(API_URL + '/users/' + id, updateUserDto, HTTP_OPTIONS).pipe(
      tap((user) => {
        this.loggedInUser$.next(user);
        this.selectedUser$.next(user);
      })
    );
  }

  delete(id: string) {
    return this.http.delete(API_URL + '/users/' + id);
  }

  logout() {
    window.localStorage.removeItem('user');
  }
}
