import { Component, OnInit } from '@angular/core';
import { TurnoService } from '../../services/turno.service';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/services/loader.service';


@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements OnInit {
  articulos = [];
  showInput = [];
  ngForm = new FormGroup({
    codigo: new FormControl('', [Validators.required,Validators.minLength(3)]),
    denominacion: new FormControl('', [Validators.required,Validators.minLength(3)]),
    inicial: new FormControl('0', [Validators.required])
  });
  loading:boolean;

  constructor(public _turno:TurnoService, public loader:LoaderService) { 
    this.loader.isLoading.subscribe(v => this.loading = v);
  }

  ngOnInit() {
    this._turno.getArticulos().subscribe((articulos:Array<any>) => this.articulos=articulos);
  }

  drop(e: CdkDragDrop<any>) {
    moveItemInArray(this.articulos, e.previousIndex, e.currentIndex);
    let articulos = this.articulos.map((reg,idx) => {
      reg.orden = idx;
      return reg;
    });
    this._turno.saveOrdenArticulos({articulos}).subscribe();
  }

  del(articulo_id, idx) {
    this._turno.delArticulo(articulo_id).subscribe(resp => {
      this.articulos.splice(idx,1);
    });
  }

  onSubmit() {
    this._turno.saveArticulo(this.ngForm.value).subscribe((resp:any) => {
      this.articulos.push(resp.articulo);
      this.ngForm.reset();
    });
   }

   changeInit(art) {
     this._turno.saveArticulo(art).subscribe(resp => this.showInput[art.id] = false);
   }

}
