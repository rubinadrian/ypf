import { Component, OnInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements OnInit {
  enabled = false;
  articulos = [];
  loading:boolean;
  cierre = null;

  constructor(public _turno: TurnoService, 
    public router: Router,
    public route:ActivatedRoute,
    public loader:LoaderService) {
      this.loader.isLoading.subscribe(v => this.loading = v);
      this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
    }

  ngOnInit() {
    let period = this.route.snapshot.paramMap.get('period');
    this._turno.getCierre(period).subscribe(() => {
      if ((!this.cierre)) {
        return this.router.navigate(['/']);
      }

      /** Si la caja esta cerrada no permito modificar */
      if (+this.cierre.status == 1000) {
        this.enabled = false;
          this._turno.getControlArticulos(this.cierre.id).subscribe((articulos: Array<any>) => {
          this.articulos = articulos;
        });
      } else if(+this.cierre.status >= 2) {
        this.enabled = true;
        this._turno.getControlArticulos(this.cierre.id).subscribe((articulos: Array<any>) => {
          this.articulos = articulos;
          this._turno.getFacturadosYER(this.cierre.id).subscribe((artsYer: Array<any>) => {
            articulos.forEach(a => {
              a.yer = 0;
              a.id = a.articulo_id;
              artsYer.forEach(y => {
                if(a.codigo===y.articulo) { a.yer = +y.cantidad;}
              });
            });
          });
          
        });
      } else if(+this.cierre.status == 1){
        this.enabled = true;
        this._turno.getArticulos().subscribe((articulos: Array<any>) => {
          // Ordeno los articulos por campo orden
          articulos.sort((a, b) => (a.orden > b.orden) ? 1 : -1);
          this._turno.getFacturadosYER(this.cierre.id).subscribe((artsYer: Array<any>) => {
              // Inicializo los valores
              articulos.forEach(a => {
                a.reposicion = 0;
                a.final = a.inicial;
                a.yer = 0;
                artsYer.forEach(y => {
                  if(a.codigo===y.articulo) { a.yer = +y.cantidad;}
                });
              });
              this.articulos = articulos;
          });
        });
      }
    });

   }

  onSubmit() {

    // Pasamos a la otra pantalla en caso que ya fue guardada la cantidad de plata
    if(this.enabled === false) {
      return this.router.navigate(['aforadores', this.cierre.period]);
    }

    let data = {
      articulos: this.articulos,
      cierre_id: this.cierre.id
    }

    this._turno.saveControlArticulos(data).subscribe((resp: any) => {

      if (resp.ok == 'true') {
        this.cierre = resp.cierre;
        this.router.navigate(['aforadores', this.cierre.period]);
      } else {
        this.router.navigate(['/']);
      }

    });
  }

  control() {
    let ok = true;
    this.articulos.forEach(a => {
      if (a.inicial + a.reposicion - a.final - a.yer < 0) {
        ok = false;
      }
    })
    return ok;
  }

}
