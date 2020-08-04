import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TurnoService } from 'src/app/services/turno.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-aforadores',
  templateUrl: './aforadores.component.html',
  styleUrls: ['./aforadores.component.css']
})
export class AforadoresComponent implements OnInit {
  enabled = false;
  aforadores = [];
  loading:boolean;
  cierre = null;

  constructor(public router:Router, 
    public route:ActivatedRoute,
    private _turno:TurnoService,
    public loader:LoaderService) {
      this.loader.isLoading.subscribe(v => this.loading = v);
      this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
    }

  ngOnInit() {

    let period = this.route.snapshot.paramMap.get('period');
    this._turno.getCierre(period).subscribe(() => {
      if(!this.cierre) {
        return this.router.navigate(['/']);
      }
  
      //Si esta cerrado no permito modificar y traigo todo del controlaforadores
      if(+this.cierre.status == 1000) {
        this.enabled = false;
        this._turno.getControlAforadores(this.cierre.id).subscribe((aforadores:Array<any>) => {
          aforadores.sort((a,b) => { return a.orden * 1 - b.orden * 1 });
          this.aforadores=aforadores;
        });
      //Si no esta cerrada la caja y ya se guardo una vez, permito modificar y traigo todo del controlaforadores
      } else if(this.cierre.status >= '3') {
        this.enabled = true;
        this._turno.getControlAforadores(this.cierre.id).subscribe((aforadores:Array<any>) => {
          aforadores.sort((a,b) => { return a.orden * 1 - b.orden * 1 });
          aforadores.forEach(afo => {
            afo.id = afo.aforador_id;
          });
          this.aforadores=aforadores;
        });
      //Si es la primera vez en la caja, traigo desde los aforadores
      } else if(this.cierre.status == '2'){
        this.enabled = true;
        this._turno.getAforadores().subscribe((aforadores:Array<any>) => {
          aforadores.forEach(afo => {
            afo.final = 0;
          });
          aforadores.sort((a,b) => { return a.orden * 1 - b.orden * 1 });
          this.aforadores=aforadores
        });
      } else {
        return this.router.navigate(['/']);
      }
    });
    


    
  }

  onSubmit() {

    // Pasamos a la otra pantalla en caso que ya fue guardada la cantidad de plata
    if(this.enabled === false) {
      return this.router.navigate(['modificaciones', this.cierre.period]);
    }


    if(this.control()) {
      let data = {
        aforadores: this.aforadores,
        cierre_id: this.cierre.id
      }

      this._turno.saveControlAforadores(data).subscribe((resp:any) => {

        if(resp.ok == 'true') {
          this.cierre = resp.cierre;     
          return this.router.navigate(['modificaciones', this.cierre.period]);
        } else {
          return this.router.navigate(['/']);
        }        
      });
    }
  }

  control() {
    let ok = true;
    this.aforadores.forEach(a => {
      if(a.final-a.inicial < 0) {
        ok=false;
      }
    })
    return ok;
  }

}
