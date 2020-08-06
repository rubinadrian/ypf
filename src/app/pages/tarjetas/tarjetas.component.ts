import { Component, OnInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { ComprobantesService } from 'src/app/services/comprobantes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tarjetas',
  templateUrl: './tarjetas.component.html',
  styleUrls: ['./tarjetas.component.css']
})
export class TarjetasComponent implements OnInit {
  loading:boolean;
  filtro = 'tarjetas';
  filtro_text;
  cierre=null;
  tarjetas = []; // Codigo/Nombre Tarjetas
  comprobantes = [];
  totales_tarjetas = [];
  totales_tipos_comp = [];

  constructor(public _turno:TurnoService,
    public router:Router,
    public route:ActivatedRoute,
    public loader:LoaderService,
    public _comp:ComprobantesService) {
      this.loader.isLoading.subscribe(v => this.loading = v);
      this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
  }

  onSubmit() {
    this.router.navigate(['promos', this.cierre.period]);
  }

  ngOnInit() {
    this._turno.getTarjetas().subscribe((resp:any) => this.tarjetas = resp);
    let period = this.route.snapshot.paramMap.get('period');
    this._turno.getCierre(period).subscribe(() => {

      this._comp.getComprobantes(true).then((resp:any) => {
        if(resp.comprobantes.length == 0 ) {
          Swal.fire({
            title: 'Usuario incorrecto',
            text:  'No hay facturacion para el usuario seleccionado',
            type:  'error'
          }).then(() => {
              this.router.navigate(['/']);
            });
        }

        this.comprobantes = resp.comprobantes;
        this.totales_tarjetas = resp.totales_tarjetas;
        this.totales_tipos_comp = resp.totales_tipos_comp;
      });

    });

  }

}
