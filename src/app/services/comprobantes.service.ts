import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TurnoService } from './turno.service';
import { FilterByPipe } from '../pipes/filter-by.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';


@Injectable({
  providedIn: 'root',
})
export class ComprobantesService {
  private url = environment.url;
  private cierre=null;
  private comprobantes= [];
  private tarjetas = [];
  private totales_tarjetas = [];
  private totales_tipos_comp = [];
  private contadosPorCajas = [];
  private tarjetasPorCajas = [];

  constructor(private http: HttpClient,
    private _turno:TurnoService,
    private filterBy:FilterByPipe,
    private orderBy: OrderByPipe) {
    this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
  }

  getComprobantes(fromSession:boolean) {
    return new Promise((resolve, reject) => {
      this.totales_tipos_comp = [];
      this.totales_tarjetas = [];
      this.comprobantes = [];

      let respfromStorage = window.sessionStorage.getItem(this.cierre.period);
      if(fromSession && respfromStorage) {
        resolve(JSON.parse(respfromStorage));
      }

      this._turno.getComprobantes(this.cierre.id).subscribe((resp:any) => {
        this.comprobantes = resp;
        this.getTotalesTarjetas();
        this.getTotales();
        let respuesta = {
          comprobantes:           this.comprobantes,
          totales_tarjetas:       this.totales_tarjetas,
          totales_tipos_comp:     this.totales_tipos_comp,
          contadosPorCajas:       this.contadosPorCajas,
          tarjetasPorCajas:       this.tarjetasPorCajas
        };
        window.sessionStorage.setItem(this.cierre.period, JSON.stringify(respuesta));
        resolve(respuesta);
      });

    });

  }

  private getTotales() {
    let comprobantes = JSON.parse(JSON.stringify(this.comprobantes));
    comprobantes = this.filterBy.transform(comprobantes, 'contado');

    // con [...new Set(Array())] removemos los elementos duplicados del array.
    let nroCajasContado = [...new Set(comprobantes.map(c => c.nrocaja))];
    this.contadosPorCajas = [];
    nroCajasContado.forEach(nrocaja => {
      let comps = comprobantes.filter(c => c.nrocaja == nrocaja);
      this.contadosPorCajas.push({
        nrocaja,
        importe: +this.totalComp(comps, 'contado')
      });
    });

    let contado = +this.totalComp(comprobantes);
    this.totales_tipos_comp.push({ tipo: 'Contado', total: contado.toFixed(2), cantidad: comprobantes.length });

    comprobantes = JSON.parse(JSON.stringify(this.comprobantes));
    comprobantes = this.filterBy.transform(comprobantes, 'ctacte');
    let ctacte = +this.totalComp(comprobantes);
    this.totales_tipos_comp.push({ tipo: 'Cuenta Corriente', total: ctacte.toFixed(2), cantidad: comprobantes.length });

    comprobantes = JSON.parse(JSON.stringify(this.comprobantes));
    comprobantes = this.filterBy.transform(comprobantes, 'tarjetas');
    let nroCajasTarjeta = [...new Set(comprobantes.map(c => c.nrocaja))];
    this.tarjetasPorCajas = [];
    nroCajasTarjeta.forEach(nrocaja => {
      let comps = comprobantes.filter(c => c.nrocaja == nrocaja);
      this.tarjetasPorCajas.push({
        nrocaja,
        importe: +this.totalComp(comps, 'tarjetas')
      });
    });

    let tarjetas = +this.totalComp(comprobantes, 'tarjetas');
    this.totales_tipos_comp.push({ tipo: 'Tarjetas', total: tarjetas.toFixed(2), cantidad: comprobantes.length });

    comprobantes = JSON.parse(JSON.stringify(this.comprobantes));
    comprobantes = this.filterBy.transform(comprobantes, 'internos');
    let internos = +this.totalComp(comprobantes);
    this.totales_tipos_comp.push({ tipo: 'Debitos Interno', total: internos.toFixed(2), cantidad: comprobantes.length });

    comprobantes = JSON.parse(JSON.stringify(this.comprobantes));
    comprobantes = this.filterBy.transform(comprobantes, 'remitos');
    let remitos = +this.totalComp(comprobantes);
    this.totales_tipos_comp.push({ tipo: 'Remitos', total: remitos.toFixed(2), cantidad: comprobantes.length });

  }

  private getTotalesTarjetas() {
    this.totales_tarjetas = [];

    // Clonamos el array de objetos.
    let comprobantes = JSON.parse(JSON.stringify(this.comprobantes));
    let compTarj = [];

    compTarj = this.filterBy.transform(comprobantes, 'tarjetas');
    compTarj = this.orderBy.transform(compTarj, 'tarjcred');

    // Conseguir lo codigos de las tarjetas utilizadas. [...new Set] es para quitar duplicados es6
    let tarjcredUtilizadas = [...new Set(compTarj.map(a => a.tarjcred))];

    // Arma un array de objetos para la tabla totales tarjetas.
    tarjcredUtilizadas.forEach(codTarj => {
      let comps = compTarj.filter(c => c.tarjcred == codTarj);
      let total = comps.reduce((prev, cur) => {
        return { totalcom: +prev.totalcom + (+cur.totalcom * (cur.debcre==2?-1:1))
      }} ).totalcom;
      this.totales_tarjetas.push(
      {
        tarjeja: codTarj,
        tarjnombre: comps[0].tarjnombre,
        total,
        cantidad: comps.length
      });
    });

  }

  // Se utiliza restotarj porque existen comprobantes que se pagan parte en tarjeta parte en otro.
  public totalComp(comprobantes:Array<any>, filtroUtilizado = 'contado') {
    let campo = 'restotarj';

         if(filtroUtilizado == 'tarjetas') { campo = 'imptarj'; }
    else if(filtroUtilizado == 'creditos') { campo = 'totalcom'; }

    if (comprobantes.length == 0) return 0;

    if (comprobantes.length === 1) {
      let c = comprobantes[0];
      return (c[campo] * (c.debcre==2?-1:1)).toFixed(2);
    }

    return comprobantes.reduce((a,b) => {
      let totalizador = {};
      totalizador[campo] = a[campo] * (a.debcre==2?-1:1) + b[campo] * (b.debcre==2?-1:1);
      return totalizador;
    })[campo].toFixed(2);

  }

}
