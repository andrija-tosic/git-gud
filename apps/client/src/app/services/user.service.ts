import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { API_URL, HTTP_OPTIONS } from '../constants';
import { User, CreateUserDto } from '@git-gud/entities';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public loggedInUser$ = new BehaviorSubject<User>({} as User);
  public usersFriends$ = new BehaviorSubject<User[]>([]);

  public selectedUser$ = new BehaviorSubject<User>({} as User);

  constructor(private http: HttpClient) {
    const user = window.localStorage.getItem('user');
    if (user !== null) {
      this.loggedInUser$.next(JSON.parse(user));
    }

    this.loggedInUser$.subscribe((user) => {
      if (user) {
        window.localStorage.setItem('user', JSON.stringify(user));
      }
    });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(API_URL + '/users/' + id).pipe(
      tap((user) => {
        this.loggedInUser$.next(user);
      })
    );
  }

  login(email: string): Observable<User> {
    return this.http.get<User>(API_URL + '/users/login/' + email).pipe(tap((user) => this.loggedInUser$.next(user)));
  }

  register(createUserDto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${API_URL}/users/register`, createUserDto, HTTP_OPTIONS);
  }

  delete(id: string) {
    return this.http.delete(API_URL + '/users/' + id);
  }
}