import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showFechaBit'
})
export class ShowFechaBitPipe implements PipeTransform {

  transform(fechaBit): any {
    let msDia = 1000*60*60*24;
    let dif = 61729; // Diferencia de dias entre fecha bit y unix;
    let fjs = new Date((fechaBit - dif) * msDia);

    return fjs.getDate()+ '/' + (fjs.getMonth() + 1) + '/' + fjs.getFullYear();
  }

}
