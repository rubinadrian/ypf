import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticulosComponent } from './articulos/articulos.component';
import { AforadoresComponent } from './aforadores/aforadores.component';
import { PagesComponent } from '../pages/pages.component';
import { AdminGuard } from './admin.guard';
import { CierreComponent } from './cierre/cierre.component';


const routes: Routes = [
  { 
    path: 'admin',
    component: PagesComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'cierres', component: CierreComponent },
      { path: 'articulos', component: ArticulosComponent },
      { path: 'aforadores', component: AforadoresComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AdminRoutesModule{ }
