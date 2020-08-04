import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CioService } from 'src/app/services/cio.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ComprobantesService } from 'src/app/services/comprobantes.service';


@Component({
  selector: 'app-modificaciones',
  templateUrl: './modificaciones.component.html',
  styleUrls: ['./modificaciones.component.css']
})
export class ModificacionesComponent implements OnInit {
  comprobantes = [];
  tarjetas = [];
  hayPendientes = true;
  loading: boolean;
  cierre= null;

  constructor(public _turno:TurnoService, 
    public router:Router, 
    public _cio:CioService,
    public route:ActivatedRoute,
    public loader:LoaderService,
    public _comp:ComprobantesService) {
      this.loader.isLoading.subscribe(v => this.loading = v);
      this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
    }

  ngOnInit() {
    let period = this.route.snapshot.paramMap.get('period');

    this._turno.getCierre(period).subscribe((cierre:any) => {

      if(cierre.status < 3) {
        return this.router.navigate(['/']);
      }
      
      this._turno.getTarjetas().subscribe((resp:any) => this.tarjetas = resp);

      this._turno.getModificaciones(this.cierre.id).subscribe((resp:any)=> {

        this.comprobantes=resp;
        this.hayPendientes = this.comprobantes.length != 0;
      });
    });
  }

  onSubmit() {
    this._turno.saveModificacion(this.cierre.id).subscribe((resp:any) => {
      if(resp.ok) {
        this.router.navigate(['pendientes', this.cierre.period]);
      }
    });
    
  }

  cardName(cod) {
    
    let idx = this.tarjetas.findIndex(c => c.clave == cod);
    if(idx == -1) return cod;
    
    return this.tarjetas[idx].valor;
  }

  refresh(): void {
      window.location.reload();
  }

}
