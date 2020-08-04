import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TurnoService } from 'src/app/services/turno.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-aforadores',
  templateUrl: './aforadores.component.html',
  styleUrls: ['./aforadores.component.css']
})
export class AforadoresComponent implements OnInit {
  aforadores = [];
  showInput = [];
  ngForm = new FormGroup({
    articulo: new FormControl('', [Validators.required]),
    nombre:   new FormControl('', [Validators.required]),
    inicial:  new FormControl('0', [Validators.required]),
  });
  loading:boolean;

  constructor(public _turno:TurnoService, 
              public loader:LoaderService) {
    this.loader.isLoading.subscribe(v => this.loading = v);
   }

  ngOnInit() {
    this._turno.getAforadores().subscribe((resp:any) => this.aforadores=resp);
  }


  onSubmit() {
    this._turno.saveAforador(this.ngForm.value).subscribe((resp:any)=> {
      this.aforadores.push(resp.aforador);
    });
  }

  del(aforador_id, idx) {
    this._turno.delAforador(aforador_id).subscribe(resp => {
      this.aforadores.splice(idx,1);
    });
  }

  drop(e: CdkDragDrop<any>) {
    moveItemInArray(this.aforadores, e.previousIndex, e.currentIndex);
    let aforadores = this.aforadores.map((reg,idx) => {
      reg.orden = idx;
      return reg;
    });
    this._turno.saveOrdenAforadores({aforadores}).subscribe();
  }

  changeInit(afo) {
    this._turno.saveAforador(afo).subscribe(resp => this.showInput[afo.id] = false);
  }

}
