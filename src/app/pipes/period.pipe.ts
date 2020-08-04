import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'period'
})
export class PeriodPipe implements PipeTransform {

  transform(period: string): string {
    let fecha_desde = period.slice(0,8);
    let fecha_hasta = period.slice(14,22);
    let hora_desde = period.slice(8,14);
    let hora_hasta = period.slice(22,28);
    return this.toFecha(fecha_desde)
           + ' ' + 
           this.toHora(hora_desde) 
           + ' -> ' + 
           this.toFecha(fecha_hasta)
           + ' ' + 
           this.toHora(hora_hasta);
  }

  /** @fecha YYYYMMDD */
  toFecha(fecha:string):string {
    return fecha.slice(6,8) + '/' + fecha.slice(4,6) + '/' + fecha.slice(0,4);
  }

  toHora(hora:string):string {
    return hora.slice(0,2) + ':' + hora.slice(2,4) + ':' + hora.slice(4,6);
  }

}
