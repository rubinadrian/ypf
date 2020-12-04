import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticulosComponent } from './articulos/articulos.component';
import { AforadoresComponent } from './aforadores/aforadores.component';
import { AdminRoutesModule } from './admin.routes';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../shared/shared.module';
import { AdminInterceptor } from './admin.interceptor';
import { CierreComponent } from './cierre/cierre.component';
import { PipesModule } from '../pipes/pipes.module';
import { TanqueComponent } from './tanque/tanque.component';
import { ConsultaDespachosComponent } from './consulta-despachos/consulta-despachos.component';



@NgModule({
  declarations: [
    ArticulosComponent,
    AforadoresComponent,
    CierreComponent,
    TanqueComponent,
    ConsultaDespachosComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AdminInterceptor, multi: true },
  ],
  imports: [
    SharedModule,
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AdminRoutesModule,
    DragDropModule,
    ReactiveFormsModule,
    PipesModule
  ]
})
export class AdminModule { }
