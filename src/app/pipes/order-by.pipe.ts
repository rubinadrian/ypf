import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(registros:Array<any>, field = 'orden'):Array<any> {
    return registros.sort((a,b) => a[field]-b[field] );
  }

}
