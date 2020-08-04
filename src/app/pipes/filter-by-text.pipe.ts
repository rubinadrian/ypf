import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByText'
})
export class FilterByTextPipe implements PipeTransform {

  transform(value: Array<any>, text:string): Array<any> {
    if(!text) return value;
    return value.filter((r) => JSON.stringify(r).toUpperCase().search(text.toUpperCase()) !== -1);
  }

}
