import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { TurnoService } from '../services/turno.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(public router:Router, 
    public _auth:AuthService, 
    public _turno:TurnoService) {}


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this._auth.currentUserValue;

    if(currentUser && currentUser.user.admin == 1) {
      this._turno.clear();
      return true;
    }

    this.router.navigate(['login']);
  }
  
}
