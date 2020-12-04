import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TurnoService } from 'src/app/services/turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import Swal from 'sweetalert2';

declare var $;

@Component({
  selector: 'app-despachos',
  templateUrl: './despachos.component.html',
  styleUrls: ['./despachos.component.css']
})
export class DespachosComponent implements OnInit {
  formDespacho:FormGroup;
  loading:boolean;
  despachos:Despacho[] = [];
  cierre = null;
  arqueo_id = null;
  enabled = false;
  productos = ['4-/G','4-/P1000'];

  constructor(public _turno:TurnoService,
    public router:Router,
    public loader:LoaderService,
    public route:ActivatedRoute,
    private _fb:FormBuilder)
  {
    this.loader.isLoading.subscribe(v => this.loading = v);
    this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
  }

  ngOnInit() {
    $('#ModalFormDespacho').on('shown.bs.modal', function () {
      $('#control-focus').trigger('focus');
    });

    this.formDespacho = this._fb.group({
      id:[''],
      arqueo_id:[''],
      cliente:['', [Validators.maxLength(100)]],
      cantidad:['', [Validators.required, Validators.maxLength(14), Validators.min(0), Validators.max(99999999999.99)]],
      producto:['', [Validators.maxLength(100)]]
    });

    let period = this.route.snapshot.paramMap.get('period');
    if(period) {
      this._turno.getCierre(period).subscribe(() => {
        if(!this.cierre) {
          return this.router.navigate(['/']);
        }

        this._turno.getArqueo(this.cierre.id).subscribe((arqueo:any) => {
          this.arqueo_id = arqueo.id;
          this.getDespachos();
        });

        // No permite modificacion
        if(this.cierre.status != '0' && typeof this.cierre.id !== "undefined") {
          this.enabled = false;
        } else {
          this.enabled = true;
        }
      });
    } else {
      // Sin periodo
      this.arqueo_id = 0;
      this.getDespachos();
    }
  }

  onSubmit() {
    let despacho = this.formDespacho.value;
    this.formDespacho.reset();
    $('#ModalFormDespacho').modal('toggle');
    despacho.arqueo_id = this.arqueo_id;
    this._turno.saveDespacho(despacho).subscribe(resp => {
      this.getDespachos();
    });
  }

  getDespachos(){
    this._turno.getDespachos(this.arqueo_id).subscribe((despachos:Despacho[]) => this.despachos=despachos);
  }

  showModal() {
    this.formDespacho.reset();
    this.formDespacho.patchValue({ producto: this.productos[0]});
    $('#ModalFormDespacho').modal('show');
  }

  edit(despacho, event:Event) {
    event.preventDefault();
    event.stopPropagation();
    despacho.arqueo_id = this.arqueo_id;
    this.formDespacho.patchValue(despacho);
    $('#ModalFormDespacho').modal('toggle');
  }

  total(index) {
    return this.despachos.filter(d => d.producto == this.productos[index]).reduce((acc, curr) => {
      return +acc + +curr.cantidad;
    },0).toFixed(2);
  }

  del(despacho:Despacho, event:Event) {
    event.preventDefault();
    event.stopPropagation();
    Swal.fire({
      title: 'Esta seguro?',
      text: "Se eliminara el despacho seleccionado",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result:any) => {
      if (result.value) {
        this._turno.delDespacho(despacho.id).subscribe(() => {
          this.getDespachos();
          Swal.fire(
            'Eliminado!',
            'Su archivo fue eliminado.',
            'success'
          )
        });
      }
    })
  }

}

class Despacho {
  created_at?
  id: number;
  arqueo_id: number;
  cliente: string;
  cantidad: number;
  producto: string;

  constructor() {
  }

  setData(despacho) {
    this.id = despacho.id;
    this.cliente = despacho.cliente;
    this.cantidad = despacho.cantidad;
    this.producto = despacho.producto;
  }

}
