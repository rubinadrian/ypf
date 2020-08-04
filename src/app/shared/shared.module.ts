import { NgModule } from '@angular/core';

import { LoaderComponent } from './loader/loader.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagenofoundComponent } from './pagenofound/pagenofound.component';




@NgModule({
  imports:[
    CommonModule,
    RouterModule
  ],
  declarations: [
    LoaderComponent,
    NavbarComponent,
    PagenofoundComponent,
  ],
  exports: [
    LoaderComponent,
    NavbarComponent,
  ]
})
export class SharedModule { }
