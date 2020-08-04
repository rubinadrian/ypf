
//loader.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
 
  public isLoading = new BehaviorSubject(false);
  public isLoadingCio = new BehaviorSubject(false);
  constructor() { }
}