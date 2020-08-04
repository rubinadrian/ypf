import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CioService } from './services/cio.service';

import { PagesComponent } from './pages/pages.component';

import { TurnoService } from './services/turno.service';
import { LoaderService } from './services/loader.service';
import { LoaderInterceptor } from './loader.interceptors';
import { AdminModule } from './admin/admin.module';
import { PagesModule } from './pages/pages.module';
import { PipesModule } from './pipes/pipes.module';
import { SharedModule } from './shared/shared.module';
import { CommonModule } from '@angular/common';
import { AppRouting } from './app.routing';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    PagesComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PagesModule,
    AdminModule,
    PipesModule,
    AppRouting
  ],
  providers: [
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    CioService,
    TurnoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
