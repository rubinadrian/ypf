import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs/internal/operators/map';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  url = environment.url;
  private cierre: Cierre;
  obs_cierre = new BehaviorSubject(null);
  cerrada = new BehaviorSubject(false);

  constructor(private http: HttpClient) { }

  closeTurno(period:string|number) {
    return this.http.get(this.url + 'cierre/close/' +  period);
  }
    
  saveCierre(data) {
    return this.http.post(this.url + 'cierre', data).pipe(map(this.middlewareCierre));
  }

  getCierre(period) {
    return this.http.get(this.url + 'cierre/' + period).pipe(map(this.middlewareCierre));
  }

  middlewareCierre = (resp:any) => {
     if(resp.ok == 'true') {
      this.cierre = resp.cierre;
      this.obs_cierre.next(resp.cierre);
      if(this.cierre.status == '1000') { this.cerrada.next(true); }
      return resp.cierre;
    }
  }

  clear() {
    this.cierre = null;
    this.cerrada.next(false);
    this.obs_cierre.next(null);
    window.localStorage.clear();
  }

  getUser(){
    if(this.cierre) {
      return this.cierre.usuario;
    }
    return '';
  }


  getPeriod(){
    if(this.cierre) {
      let yd = this.cierre.period.toString().slice(0,4);
      let md = this.cierre.period.toString().slice(4,6);
      let dd = this.cierre.period.toString().slice(6,8);
      let hd = this.cierre.period.toString().slice(8,10);
      let mid = this.cierre.period.toString().slice(10,12);

      let yh = this.cierre.period.toString().slice(14,18);
      let mh = this.cierre.period.toString().slice(18,20);
      let dh = this.cierre.period.toString().slice(20,22);
      let hh = this.cierre.period.toString().slice(22,24);
      let mih = this.cierre.period.toString().slice(24,26);

      return dd+'/'+md+'/'+yd+' '+hd+':'+mid+' - '+dh+'/'+mh+'/'+yh+' '+hh+':'+mih;
    }
    return '';
  }

  getUsuariosCajas() {
    return this.http.get(this.url + 'usuarios').pipe(first());
  }

  getCierres() {
    return this.http.get(this.url + 'cierre').pipe(first());
  }

  getArqueo(cierre_id) {
    return this.http.get(this.url + 'arqueo/' + cierre_id).pipe(first());
  }

  saveOrdenArticulos(data) {
    return this.http.post(this.url + 'articulo/orden', data).pipe(first());
  }

  delCierre(period) {
    return this.http.delete(this.url + 'cierre/' + period).pipe(first());
  }

  saveOrdenAforadores(data) {
    return this.http.post(this.url + 'aforador/orden', data).pipe(first());
  }

  saveArticulo(data) {
    return this.http.post(this.url + 'articulo', data).pipe(first());
  }

  saveAforador(data) {
    return this.http.post(this.url + 'aforador', data).pipe(first());
  }

  delArticulo(articulo_id) {
    return this.http.delete(this.url + 'articulo/' + articulo_id).pipe(first());
  }

  delAforador(aforador_id) {
    return this.http.delete(this.url + 'aforador/' + aforador_id).pipe(first());
  }

  saveModificacion(cierre_id) {
    return this.http.post(this.url + 'cierre/modificaciones', {cierre_id}).pipe(first());
  }

  saveArqueo(data) {
    return this.http.post(this.url + 'arqueo', data).pipe(first());
  }

  saveControlArticulos(data) {
    return this.http.post(this.url + 'control/articulos', data).pipe(first());
  }

  saveControlAforadores(data) {
    return this.http.post(this.url + 'control/aforadores', data).pipe(first());
  }

  getAforadores() {
    return this.http.get(this.url + 'aforador').pipe(first());
  }

  getArticulos() {
    return this.http.get(this.url + 'articulo').pipe(first());
  }

  getPlayeros() {
    return this.http.get(this.url + 'playero').pipe(first());
  }

  getControlArticulos(cierre_id) {
    return this.http.get(this.url + 'control/articulos/' + cierre_id).pipe(first());
  }

  getControlAforadores(cierre_id) {
    return this.http.get(this.url + 'control/aforadores/' + cierre_id).pipe(first());
  }

  /** Articulos */
  getFacturados(cierre_id) {
    return this.http.get(this.url + 'facturado/' + cierre_id).pipe(first());
  }

  /** Articulos */
  getFacturadosYER(cierre_id) {
    return this.http.get(this.url + 'facturado/yer/' + cierre_id).pipe(first());
  }

  getArtCombBit() {
    return this.http.get(this.url + 'articulo/combustibles').pipe(first());
  }
  
  /** Comprobantes sin cuerpo */
  getComprobantes(cierre_id) {
    return this.http.get(this.url + 'comprobantes/' + cierre_id).pipe(first());
  }

  getModificaciones(cierre_id) {
    return this.http.get(this.url + 'modificaciones/' + cierre_id).pipe(first());
  }

  getTarjetas() {
    return this.http.get(this.url + 'tarjetas').pipe(first());
  }

  getNroCajasPorFecha(cierre_id) {
    return this.http.get(this.url + 'facturado/cajas/' + cierre_id).pipe(first());
  }

  saveObs(data) {
    return this.http.post(this.url + 'cierre/obs', data).pipe(first());
  }

  getIncidencias(cierre_id) {
    return this.http.get(this.url + 'incidencia/' + cierre_id).pipe(first());
  }

  saveIncidencia(data) {
    return this.http.post(this.url + 'incidencia', data).pipe(first());
  }

  delIncidencia(data) {
    return this.http.post(this.url + 'incidencia/delete', data);
  }


  saveCheque(data) {
    return this.http.post(this.url + 'cheque', data);
  }

  getCheques(arqueo_id) {
    return this.http.get(this.url + 'cheque/' + arqueo_id);
  }

  delCheque(cheque_id) {
    return this.http.delete(this.url + 'cheque/' + cheque_id);
  }

}


interface Cierre {
  id?: number;
  period?: number;
  status?: string;
  usuario?: string;
  playero1?: string;
  playero2?: string;
  playero3?: string;
}