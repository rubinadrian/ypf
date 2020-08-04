import { NgModule } from '@angular/core';

import { FilterByPipe } from '../pipes/filter-by.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { ShowFechaBitPipe } from '../pipes/show-fecha-bit.pipe';
import { CapitalizePipe } from '../pipes/capitalize.pipe';
import { FilterByTextPipe } from '../pipes/filter-by-text.pipe';
import { PeriodPipe } from './period.pipe';
import { StatusPipe } from './status.pipe';


@NgModule({
  declarations: [
    FilterByPipe, 
    OrderByPipe,
    ShowFechaBitPipe,
    CapitalizePipe,
    FilterByTextPipe,
    PeriodPipe,
    StatusPipe],
  providers: [
    FilterByPipe, 
    OrderByPipe,
    ShowFechaBitPipe,
    CapitalizePipe,
    FilterByTextPipe,
    PeriodPipe,
    StatusPipe
  ],
  exports: [
    FilterByPipe, 
    OrderByPipe,
    ShowFechaBitPipe,
    CapitalizePipe,
    FilterByTextPipe,
    PeriodPipe,
    StatusPipe
  ]
})
export class PipesModule { }
