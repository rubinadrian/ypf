import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArqueoComponent } from './arqueo/arqueo.component';
import { ArticulosComponent } from './articulos/articulos.component';
import { AforadoresComponent } from './aforadores/aforadores.component';
import { TurnoComponent } from './turno/turno.component';
import { PendientesComponent } from './pendientes/pendientes.component';
import { ComprobantesComponent } from './comprobantes/comprobantes.component';
import { ModificacionesComponent } from './modificaciones/modificaciones.component';
import { TarjetasComponent } from './tarjetas/tarjetas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PagesRoutesModule } from './pages.routes';
import { ChequesComponent } from './cheques/cheques.component';



@NgModule({
  declarations: [
    ArqueoComponent,
    ArticulosComponent,
    AforadoresComponent,
    TurnoComponent,
    PendientesComponent,
    ComprobantesComponent,
    ModificacionesComponent,
    TarjetasComponent,
    ChequesComponent,
  ],
  imports: [
    SharedModule,
    BrowserModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    PagesRoutesModule
  ],
  providers: []
})
export class PagesModule { }
