import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TurnoService } from 'src/app/services/turno.service';
import { AuthService } from 'src/app/admin/auth.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  url = environment.url;
  cerrada:boolean;
  cierre = null;
  user;

  constructor(public _turno: TurnoService, public _auth:AuthService) {
    if(this._auth.currentUserValue) {
      this._auth.currentUser.subscribe(dataUser => { 
        if(dataUser) {
          this.user = dataUser.user;
        }
      });
    }
   }

  ngOnInit() {
    this._turno.cerrada.subscribe(v => this.cerrada = v);
    this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
  }


  logout() {
    this._auth.logout();
  }

}
