// loader.interceptors.ts
import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpResponse,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class AdminInterceptor implements HttpInterceptor {

    constructor(public router:Router, public _auth:AuthService){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let currentUser = this._auth.currentUserValue;
        if (currentUser && currentUser.token) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
        }

        return Observable.create(observer => {
            const subscription = next.handle(req)
                .subscribe(
                    event => {
                        if (event instanceof HttpResponse) {
                            observer.next(event);
                        }
                    },
                    err => {

                        // Laraver me devuelve 400 cuando expira el token.
                        // Necesito cambiar a que devuelva 401.
                        if(err.status == 400 || err.status == 401) {
                            this.router.navigate(['login']);
                            this._auth.logout();
                        }
                        observer.error(err);
                    },
                    () => {
                        observer.complete();
                    });
            // remove request from queue when cancelled
            return () => {
                subscription.unsubscribe();
            };
        });

    }
}