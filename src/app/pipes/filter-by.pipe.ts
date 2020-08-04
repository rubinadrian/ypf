import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy'
})
export class FilterByPipe implements PipeTransform {

  transform(comprobantes: Array<any>, type:string): any {
    if(comprobantes.length > 1) {
      comprobantes.sort((a,b) => a['nrocomprobante']-b['nrocomprobante'] );
    } 
    switch(type) {
      case 'contado':
        return comprobantes.filter(c => {
              return c.contadocc == 1 
                      && c.tipomovim == 66 
                      && (c.tarjcred == 0 || (c.tarjcred != 0 && (Math.abs(c.totalcom-c.imptarj) > 1)))
                      && c.tipocomp != 802
                      && c.tipocomp != 803});
      case 'ctacte':
          return comprobantes.filter(c => c.contadocc == 2  
                                    && c.tipomovim == 66 
                                    && (c.tarjcred == 0 || (c.tarjcred != 0 && (Math.abs(c.totalcom-c.imptarj) > 1)))
                                    && c.tipocomp != 802
                                    && c.tipocomp != 803);
      case 'tarjetas':
          if(comprobantes.length > 1) {
            comprobantes.sort((a,b) => a['tarjcred']-b['tarjcred'] );
          }          
          return comprobantes.filter(c => c.tarjcred != 0);
      case 'internos':
          return comprobantes.filter(c => c.tipocomp == 802 || c.tipocomp == 803);
      case 'remitos':
          return comprobantes.filter(c => c.tipomovim == 65);
      case 'creditos':
        return comprobantes.filter(c => c.debcre == 2);
    }

    return comprobantes;
  }

}
