import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TurnoService } from 'src/app/services/turno.service';
import { LoaderService } from 'src/app/services/loader.service';
import Swal from 'sweetalert2';

declare var $;


@Component({
  selector: 'app-tanque',
  templateUrl: './tanque.component.html',
  styleUrls: ['./tanque.component.css']
})
export class TanqueComponent implements OnInit {
  tanques = [];

  formTanque = new FormGroup({
    id:   new FormControl('', [Validators.required]),
    nombre:   new FormControl('', [Validators.required]),
    capacidad:  new FormControl('0', [Validators.required]),
  });
  loading:boolean;

  constructor(public _turno:TurnoService,
              public loader:LoaderService) {
    this.loader.isLoading.subscribe(v => this.loading = v);
   }

  ngOnInit() {
    this.getTanques();
  }

  getTanques(){
    this._turno.getTanques().subscribe((resp:any) => this.tanques=resp);
  }

  onSubmit() {
    let tanque = this.formTanque.value;
    this.formTanque.reset();
    $('#ModalFormTanque').modal('toggle');
    this._turno.saveTanque(tanque).subscribe(resp => {
      this.getTanques();
    });
  }

  edit(tanque, event:Event) {
    event.preventDefault();
    event.stopPropagation();
    this.formTanque.patchValue(tanque);
    $('#ModalFormTanque').modal('toggle');
  }

  showModal() {
    this.formTanque.reset();
    $('#ModalFormTanque').modal('show');
  }

  del(tanque:Tanque, event:Event) {
    event.preventDefault();
    event.stopPropagation();
    Swal.fire({
      title: 'Esta seguro?',
      text: "Se eliminara el tanque seleccionado",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result:any) => {
      if (result.value) {
        this._turno.delTanque(tanque.id).subscribe(() => {
          this.getTanques();
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


interface Tanque {
  id:number;
  nombre:string;
  capacidad:number;
  created_at:string;
  updated_at:string;
}
