import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, first } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Subject, AsyncSubject } from 'rxjs';
import { LoaderService } from './loader.service';

@Injectable()
export class CioService {
  url = environment.url;


  // Los AsyncSubject retornan el ultimo valor de next cuando se completan.
  // Anterior a eso no devuelven nada.
  protected subject_cierre = new AsyncSubject();

  constructor(private http: HttpClient) { }

  getPeriods(month, year) {
    return this.http.get(this.url + `cio/periodos/${month}/${year}`);
  }

  protected tableToJSON(table: Element) {
    let tableJSON = [];
    let linesInHeader = table.querySelectorAll('tr > th:last-child').length;
    let trs = table.getElementsByTagName('tr');
    let ths = trs[0].getElementsByTagName('th');
    let tds;
    let temp = {};
    for (let i = linesInHeader; i < trs.length; i++) {
      temp = {};
      tds = trs[i].getElementsByTagName('td');

      if (tds[0] && tds[0].innerText.search('No existen datos a reportar') !== -1) continue;

      for (let j = 0; j < ths.length; j++) {
        if (tds[j]) {
          temp[ths[j].innerText.trim()] = tds[j].innerText.trim();
        } else {
          temp[ths[j].innerText.trim()] = '';
        }
      }
      tableJSON.push(temp);
    }

    return tableJSON;
  }

  // php devuelve los numeros con el formato dado vuelta comas por puntos.
  protected stringToNumber(str: any): number {
    if(typeof str == "undefined") return 0;
    if(typeof str != "string") return 0;
    str = str.replace('.', '');
    str = str.replace(',', '.');
    if (isNaN(parseFloat(str))) { str = 0; }
    return parseFloat(str);
  }

  protected getVolumenAndImporte(producto: Array<any>) {
    let importe = 0;
    let volumen = 0;
    for (const i in producto) {
      importe += this.stringToNumber(producto[i].Importe);
      volumen += this.stringToNumber(producto[i].Volumen);
    }
    return { importe, volumen };
  }

  /** Recive una pagina web, devuelve un array con todas las tablas */
  protected parseReporteToTables(resp: any) {
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(resp, 'text/html');
    let htmlData = htmlDoc.getElementById('report').children;
    let tables = [];

    for (let i = 0; i < htmlData.length; i++) {

      if (htmlData[i].tagName === 'H3' && htmlData[i + 1].tagName === 'TABLE') {
        tables.push({
          title: htmlData[i].innerHTML,
          table: this.tableToJSON(htmlData[i + 1])
        });
      }
    }
    return tables;
  }

  protected VentasYPFenRuta(tables) {
    let idx = tables.findIndex(table => {
      return table.title === 'Despachos';
    });

    let ypfenruta = [];
    tables[idx].table.forEach(reg => {
      ypfenruta[reg.Producto] = ypfenruta[reg.Producto] || 0;
      ypfenruta[reg.Producto] += this.stringToNumber(reg.Volumen);
    });

    return {
      '4-/D':  ypfenruta['GO-INFINIA DIESEL'] || 0,
      '4-/NF': ypfenruta['INFINIA'] || 0,
      '4-/NS': ypfenruta['NS XXI'] || 0,
      '4-/GY': ypfenruta['ULTRA DIESEL XXI'] || 0
    }

  }

  protected VentasTotalesPorTipoDePago(tables) {


    let idx = tables.findIndex(table => {
      return table.title === 'Ventas Totales por Tipo de Pago';
    });

    let ypfenruta = tables[idx].table.filter(reg => { return reg['Tipo de Pago'].trim() === "YPF en Ruta" });
    let vtasincontrol = tables[idx].table.filter(reg => { return reg['Tipo de Pago'].trim() === "Venta Sin Control" });
    let pbaconretorno = tables[idx].table.filter(reg => { return reg['Tipo de Pago'].trim() === "Prueba de Surtidor Con Retorno" });
    let pbasinretorno = tables[idx].table.filter(reg => { return reg['Tipo de Pago'].trim() === "Prueba de Surtidor Sin Retorno" });

    let idxTableTotals = tables.findIndex(table => {
      return table.title === 'Ventas Totales por Producto';
    });

    let aUD = tables[idxTableTotals].table.filter(reg => { return reg['Producto'].trim() === "ULTRA DIESEL XXI" });
    let ainfinia = tables[idxTableTotals].table.filter(reg => { return reg['Producto'].trim() === "INFINIA" });
    let aNS = tables[idxTableTotals].table.filter(reg => { return reg['Producto'].trim() === "NS XXI" });
    let aGID = tables[idxTableTotals].table.filter(reg => { return reg['Producto'].trim() === "GO-INFINIA DIESEL" });


    let impTotal = this.stringToNumber(tables[idxTableTotals].table.find(reg => {
      return reg['Producto'].trim() === 'Total';
    })['Importe']);

    return {
      '4-/GY': this.getVolumenAndImporte(aUD),
      '4-/NF': this.getVolumenAndImporte(ainfinia),
      '4-/NS': this.getVolumenAndImporte(aNS),
      '4-/D': this.getVolumenAndImporte(aGID),
      ypfenruta: this.getVolumenAndImporte(ypfenruta),
      vtasincontrol: this.getVolumenAndImporte(vtasincontrol),
      pbaconretorno: this.getVolumenAndImporte(pbaconretorno),
      pbasinretorno: this.getVolumenAndImporte(pbasinretorno),
      impTotal
    }
  }


  getCierreCio(period):Observable<any> {
    /** Si esta en el local storage */
    if(window.localStorage.getItem('cio_' + period)) {
      let local_cio = JSON.parse(window.localStorage.getItem('cio_' + period));
      this.subject_cierre.next(local_cio.cierre);
      this.subject_cierre.complete();
    } else {

      this.http.get(this.url + 'cierrescio/cierre/' + period).pipe(first())
      .subscribe(resp => {
        if(resp) {
          let cio = { cierre:resp };
          window.localStorage.setItem('cio_' + period, JSON.stringify(cio));
          this.subject_cierre.next(resp);
          this.subject_cierre.complete();
        }
        else {
            /** Si no esta en el localStorge ni en BD mysql hacemos la peticion al sw cio */
            this.getReporteCierre(period).subscribe(cierre => {
              let cio = { cierre };
              window.localStorage.setItem('cio_' + period, JSON.stringify(cio));
              this.subject_cierre.next(cierre);
              this.subject_cierre.complete();
            });
        }
      });

    }

    return this.subject_cierre;
  }

  private getReporteCierre(period): Observable<any> {
    let requestOptions: Object = {
      headers: new HttpHeaders({
        'Content-Type': 'text/html',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }),
      responseType: 'text'
    }

    return this.http.get(this.url + `cio/cierre/${period}`, requestOptions)
      .pipe(map(x => {
        let tables = this.parseReporteToTables(x);
        return this.VentasTotalesPorTipoDePago(tables);
      }));
  }

  private getReporteYPFenRuta(period): Observable<any> {
    let requestOptions: Object = {
      headers: new HttpHeaders({
        'Content-Type': 'text/html',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }),
      responseType: 'text'
    }

    return this.http.get(this.url + `cio/ypfenruta/${period}`, requestOptions)
      .pipe(map(x => {
        let tables = this.parseReporteToTables(x);
        return this.VentasYPFenRuta(tables);
    }));

  }

  public saveCierreCio(data) {
    return this.http.post(this.url + 'cierrescio/cierre', data);
  }

}
