import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, first } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.url;

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(public http:HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    let user = sessionStorage.getItem('currentUser');
    if(user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  public get currentUserValue() {
      return this.currentUserSubject.value;
  }

  login(userFormData) {
    return this.http.post(this.url + 'auth/login', userFormData).pipe(map((resp:any) => {
      let user = {
        user: resp.user,
        token: resp.access_token
      };

      sessionStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return resp;
    }));
  }

  logout() {
      sessionStorage.clear();
      sessionStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
  }
}
