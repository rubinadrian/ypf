import { Component, OnInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turno.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.component.html',
  styleUrls: ['./cierre.component.css']
})
export class CierreComponent implements OnInit {
  cierres= [];
  playeros = [];

  constructor(public _turno:TurnoService, public router:Router) { }

  ngOnInit() {
    this._turno.getPlayeros().subscribe((playeros:any) => this.playeros = playeros);
    this._turno.getCierres().subscribe((resp:Array<any>) => this.cierres = resp);
  }

  del(cierre, event:Event) {

    event.stopPropagation();

    Swal.fire({
          title: 'Borrar cierre',
          text: "Esta seguro/a de borrar el cierre",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Estoy Seguro!'
        }).then((result) => {
          if (result.value) {
            this._turno.delCierre(cierre.period).subscribe(resp => {
              this._turno.getCierres().subscribe((resp:Array<any>) => this.cierres = resp);
            });
          }
        });
      }

  showNamePlayero(id) {
    let playero = this.playeros.find(p => p.id == id);
    if(playero)
      return playero.nombre
    return '-';

  }

  openCierre(cierre) {
    switch(+cierre.status) {
      case 0: this.router.navigate(['/arqueo', cierre.period]); break;
      case 1: this.router.navigate(['/articulos', cierre.period]); break;
      case 2: this.router.navigate(['/aforadores', cierre.period]); break;
      case 3: this.router.navigate(['/modificaciones', cierre.period]); break;
      case 4: this.router.navigate(['/pendientes', cierre.period]); break;
      default:  this.router.navigate(['/comprobantes', cierre.period]); break;
    }
  }

}
