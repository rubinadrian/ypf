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
import { LoaderService } from './services/loader.service';
 
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];
    private requestsCio: HttpRequest<any>[] = [];
 
    constructor(private loaderService: LoaderService) { }
 
    removeRequest(req: HttpRequest<any>) {
        if(req.url.search('index.php/api/cio') != -1) {
            const i = this.requestsCio.indexOf(req);
            if (i !== -1) { this.requestsCio.splice(i, 1); }
            this.loaderService.isLoadingCio.next(this.requestsCio.length > 0);
        } else {
            const i = this.requests.indexOf(req);
            if (i !== -1) { this.requests.splice(i, 1); }
            this.loaderService.isLoading.next(this.requests.length > 0);
        }
    }
 
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const reqNoCache = req.clone({
            setHeaders: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache'
            }
        });

        if(reqNoCache.url.search('index.php/api/cio') != -1) {
            
            /** Evitar hacer dos veces la misma peticion al cio */
            const i = this.requestsCio.findIndex(r => reqNoCache.url === r.url);
            if(i !== -1) return EMPTY;
            
            
            this.loaderService.isLoadingCio.next(true);
            this.requestsCio.push(reqNoCache);
        } else {
            this.requests.push(reqNoCache);
            this.loaderService.isLoading.next(true);
        }

        
        return Observable.create(observer => {
            const subscription = next.handle(reqNoCache)
                .subscribe(
                    event => {
                        if (event instanceof HttpResponse) {
                            this.removeRequest(reqNoCache);
                            observer.next(event);
                        }
                    },
                    err => {
                        this.removeRequest(reqNoCache);
                        observer.error(err);
                    },
                    () => {
                        this.removeRequest(reqNoCache);
                        observer.complete();
                    });
            // remove request from queue when cancelled
            return () => {
                this.removeRequest(reqNoCache);
                subscription.unsubscribe();
            };
        });
    }
}
 