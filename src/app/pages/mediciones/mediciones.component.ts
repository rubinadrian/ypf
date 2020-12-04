import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TurnoService } from 'src/app/services/turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import Swal from 'sweetalert2';

declare var $;

@Component({
  selector: 'app-mediciones',
  templateUrl: './mediciones.component.html',
  styleUrls: ['./mediciones.component.css']
})
export class MedicionesComponent implements OnInit {
  formMedicion:FormGroup;
  formConsulta:FormGroup;
  loading = false;
  mediciones:Medicion[] = [];
  tanques:Tanque[] = [];
  estockCombustibles:any[] = [];

  constructor(public _turno:TurnoService,
    public router:Router,
    public loader:LoaderService,
    public route:ActivatedRoute,
    private _fb:FormBuilder){
    this.loader.isLoading.subscribe(v => this.loading = v);
    this._turno.getTanques().subscribe((tanques:any) => this.tanques=tanques);
  }

  ngOnInit() {
    $('#ModalFormMedicion').on('shown.bs.modal', function () {
      $('#control-focus').trigger('focus');
    });

    this.formMedicion = this._fb.group({
      id:[''],
      tanque_id:[''],
      medicion:['', [Validators.required, Validators.maxLength(14), Validators.min(0), Validators.max(99999999999.99)]],
    });

    this.initFormConsulta();

    this._turno.getEstockCombustibles().subscribe((ec:any) => this.estockCombustibles = ec);
    this.getMediciones();
  }

  onSubmit() {
    let medicion = this.formMedicion.value;
    this.formMedicion.reset();
    $('#ModalFormMedicion').modal('toggle');
    this._turno.saveMedicion(medicion).subscribe(resp => {
      this.getMediciones();
    });
  }

  getMediciones(){
    this._turno.getMediciones(this.formConsulta.value).subscribe((mediciones:Medicion[]) => this.mediciones=mediciones);
  }

  getNombreTanque(tanque_id) {
    return this.tanques.find((t:Tanque) => t.id == tanque_id)?.nombre;
  }

  showModal() {
    this.formMedicion.reset();
    $('#ModalFormMedicion').modal('show');
  }

  edit(medicion, event:Event) {
    event.preventDefault();
    event.stopPropagation();
    this.formMedicion.patchValue(medicion);
    $('#ModalFormMedicion').modal('toggle');
  }


  del(medicion:Medicion, event:Event) {
    event.preventDefault();
    event.stopPropagation();
    Swal.fire({
      title: 'Esta seguro?',
      text: "Se eliminara el medicion seleccionado",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result:any) => {
      if (result.value) {
        this._turno.delDespacho(medicion.id).subscribe(() => {
          this.getMediciones();
          Swal.fire(
            'Eliminado!',
            'Su archivo fue eliminado.',
            'success'
          )
        });
      }
    })
  }

  initFormConsulta() {
    let now = new Date();
    this.formConsulta = this._fb.group({
      from: this.formatDate(now),
      to: this.formatDate(now)
    });
  }


  formatDate(d:Date) {
    let year = d.getFullYear();
    let month = ('0' + (+d.getMonth() + 1)).slice(-2);
    let day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

}

class Medicion {
  created_at?
  id: number;
  tanque_id: number;
  medicion: number;

  setData(medicion) {
    this.id = medicion.id;
    this.medicion = medicion.medicion;
    this.tanque_id = medicion.tanque_id;
  }

}

interface Tanque {
  id:Number;
  nombre:string;
}
