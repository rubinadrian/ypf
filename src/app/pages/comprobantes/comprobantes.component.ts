import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import Swal from 'sweetalert2';
// import { CioService } from 'src/app/services/cio.service';

@Component({
  selector: 'app-comprobantes',
  templateUrl: './comprobantes.component.html',
  styleUrls: ['./comprobantes.component.css']
})
export class ComprobantesComponent implements OnInit {
  cierre = null;
  comprobantes = [];
  tarjetas = [];
  totales_tarjetas = [];
  totales_tipos_comp = [];
  cajasPorFecha = [];
  contadosPorCajas = [];
  tarjetasPorCajas = [];
  arqueo = [];
  observaciones = "";
  loading: boolean;
  filtro;
  playeros = [];
  filtro_text;
  rendido = {
    efectivo:0,
    tarjetas:0,
    tickets:0,
    cheques:0,
    promos:0,
    otros:0,
    total:0
  };

  aValoresRendido = [];
  aKeysRendido = [];

  constructor(public _turno:TurnoService,
    public router:Router,
    public route:ActivatedRoute,
    public loader:LoaderService,
    public _comp:ComprobantesService) {
        this.loader.isLoading.subscribe(v => this.loading = v);
        this._turno.obs_cierre.subscribe(cierre => { this.cierre = cierre;
          if(cierre) {
            this.observaciones = cierre.Observaciones;
          }
        });
    }



  total(tipo:string){
    let c = this.totales_tipos_comp.find(r => r.tipo === tipo) || { total: 0};
    return c.total * 1;
  }


  ngOnInit() {

    this._turno.getPlayeros().subscribe((playeros:any) => this.playeros = playeros);
    let period = this.route.snapshot.paramMap.get('period');
    this._turno.getCierre(period).subscribe(() => {

      if(this.cierre.status != '1000') {
        return this.router.navigate(['/']);
      }

      this._turno.getTarjetas().subscribe((resp:any) => this.tarjetas = resp);

      this._comp.getComprobantes(false).then((resp:any) => {
        this.comprobantes = resp.comprobantes;
        this.totales_tarjetas = resp.totales_tarjetas;
        this.totales_tipos_comp = resp.totales_tipos_comp;
        this.contadosPorCajas = resp.contadosPorCajas;
        this.tarjetasPorCajas = resp.tarjetasPorCajas;
      });

      this._turno.getNroCajasPorFecha(this.cierre.id).subscribe((resp:any) => { this.cajasPorFecha=resp });
      this._turno.getArqueo(this.cierre.id).subscribe((resp:Array<any>) => this.calcRendido(resp));
    });
  }

  showNamePlayero(id) {
    let playero = this.playeros.find(p => p.id == id);
    if(playero)
      return playero.nombre
    return '-';

  }

  calcRendido(resp:Array<any>){
    this.rendido.efectivo = 0;

    for(let x in resp) {
      if(!isNaN(parseInt(x.slice(1)))) {
        this.rendido.efectivo += resp[x] * parseInt(x.slice(1));
      }
    }

    this.rendido.tarjetas = resp['tarjetas'];
    this.rendido.tickets = resp['tickets'];
    this.rendido.cheques = resp['cheques'];
    this.rendido.promos = resp['promos'];
    this.rendido.otros = resp['otros_valor'];


    this.rendido.total = +this.rendido.efectivo
                          +resp['tickets']      + resp['cheques']
                          +resp['tarjetas']     + resp['otros_valor']
                          +resp['promos'];

    this.aValoresRendido = Object.values(this.rendido);
    this.aKeysRendido = Object.keys(this.rendido);

  }

  saveObs() {
    let data = {
      period: this.cierre.period,
      observaciones: this.observaciones
    }
    this._turno.saveObs(data).subscribe((resp:any) => {
      if(resp.ok) {
        Swal.fire({
          title: 'Observaciones Guardadas',
          text:  'La observacione se guardo correctamente',
          type:  'success'
        });
      }
    });
  }

}
