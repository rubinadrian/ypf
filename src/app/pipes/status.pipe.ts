import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  transform(status:string): any {
    switch(+status) {
      case 0: return 'Sin cambios';
      case 1: return 'Arqueo';
      case 2: return 'Articulos';
      case 3: return 'Aforadores';
      case 4: return 'Modificaciones';
      default: return 'Cerrada'; 
    }
  }

}
