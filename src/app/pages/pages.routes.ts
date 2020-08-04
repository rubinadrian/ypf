import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArqueoComponent } from '../pages/arqueo/arqueo.component';
import { ArticulosComponent } from '../pages/articulos/articulos.component';
import { AforadoresComponent } from '../pages/aforadores/aforadores.component';
import { TurnoComponent } from '../pages/turno/turno.component';
import { PendientesComponent } from '../pages/pendientes/pendientes.component';
import { ComprobantesComponent } from '../pages/comprobantes/comprobantes.component';
import { ModificacionesComponent } from '../pages/modificaciones/modificaciones.component';
import { PagesComponent } from '../pages/pages.component';
import { TarjetasComponent } from '../pages/tarjetas/tarjetas.component';
import { ChequesComponent } from './cheques/cheques.component';

const routes: Routes = [
  { 
    path: '',
    component: PagesComponent,
    children: [
      { path: '', component: TurnoComponent },
      { path: 'turno', component: TurnoComponent },
      { path: 'arqueo/:period', component: ArqueoComponent },
      { path: 'cheques/:period', component: ChequesComponent },
      { path: 'tarjetas/:period', component: TarjetasComponent },
      { path: 'articulos/:period', component: ArticulosComponent },
      { path: 'aforadores/:period', component: AforadoresComponent },
      { path: 'modificaciones/:period', component: ModificacionesComponent },
      { path: 'pendientes/:period', component: PendientesComponent },
      { path: 'comprobantes/:period', component: ComprobantesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutesModule{ }

