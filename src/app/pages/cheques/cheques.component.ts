import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { TurnoService } from 'src/app/services/turno.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

declare var $;

@Component({
  selector: 'app-cheques',
  templateUrl: './cheques.component.html',
  styleUrls: ['./cheques.component.css']
})
export class ChequesComponent implements OnInit {
  formCheques:FormGroup;
  cheques:Cheque[] = [];
  cierre = null;
  enabled = false;
  loading:boolean;
  arqueo_id = null;
  nombre_otro_banco = '';
  bancos = ['Bco. Santander Rio', 'Bco. Nacion Argentina', 'Bco. Cordoba', 'Bco. Macro', 'Bco. Supervielle', 'Bco. Hipotecario'
  , 'Bco. Patagonia', 'Bco. Credicoop', 'Bco. Comafi'];

  constructor(public _turno:TurnoService,
    public router:Router,
    public loader:LoaderService,
    public route:ActivatedRoute,
    private _fb:FormBuilder)
  {
    this.loader.isLoading.subscribe(v => this.loading = v);
    this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
    this.bancos.sort();
  }

  ngOnInit() {

    this.formCheques = this._fb.group({
      banco: ['', [Validators.maxLength(100)]],
      numero:   ['', [Validators.required, Validators.maxLength(14), Validators.min(0), Validators.max(99999999999.99)]],
      fecha: [''],
      importe:   ['', [Validators.required, Validators.maxLength(14), Validators.min(0), Validators.max(99999999999.99)]],
      portador: ['', [Validators.maxLength(100)]],
      telefono: ['', [Validators.maxLength(100)]],
    });

    let period = this.route.snapshot.paramMap.get('period');
    if(period) {
      this._turno.getCierre(period).subscribe(() => {
        if(!this.cierre) {
          return this.router.navigate(['/']);
        }

        this._turno.getArqueo(this.cierre.id).subscribe((arqueo:any) => {
          this.arqueo_id = arqueo.id;
          this._turno.getCheques(this.arqueo_id).subscribe((cheques:any) => this.cheques = cheques);
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
      this._turno.getCheques(this.arqueo_id).subscribe((cheques:any) => this.cheques = cheques);
    }

  }


  onSubmit() {
    let cheque = this.formCheques.value;
    if(cheque.banco == '__OTROS__') {
      cheque.banco = this.nombre_otro_banco || 'otros';
    }
    this.formCheques.reset();
    this.nombre_otro_banco = '';
    $('#ModalFormCheque').modal('toggle');
    cheque.arqueo_id = this.arqueo_id;
    this._turno.saveCheque(cheque).subscribe(resp => {
      this._turno.getCheques(this.arqueo_id).subscribe((cheques:any) => this.cheques = cheques);
    });
  }

  showModal() {
    this.formCheques.reset();
    $('#ModalFormCheque').modal('show');
  }


  edit(cheque) {
    cheque.arqueo_id = this.arqueo_id;
    this.formCheques.patchValue(cheque);
    $('#ModalFormCheque').modal('toggle');
  }

  del(cheque) {
    if(confirm('Esta seguro de borrar el cheque')) {
      this._turno.delCheque(cheque.id).subscribe(resp => this._turno.getCheques(this.arqueo_id).subscribe((cheques:any) => this.cheques = cheques));
    }
  }

  totalEfectivo() {
    let total = 0;
    this.cheques.forEach((cheque) => {
      total += Math.round (cheque.importe*100) / 100;
    });

    return total;
  }

}



class Cheque {
  arqueo_id: number;
  id: number;
  banco: string;
  numero: number;
  portador: string;
  fecha: string;
  importe: number;
  telefono:string;

  constructor() {
    let date = new Date();
    this.fecha = date.toISOString().split('T')[0]
  }

  setData(cheque) {
    this.id = cheque.id;
    this.arqueo_id = cheque.arqueo_id;
    this.id = cheque.id;
    this.banco = cheque.banco;
    this.numero = cheque.numero;
    this.portador = cheque.portador;
    this.fecha = cheque.fecha;
    this.importe = cheque.importe;
    this.telefono = cheque.telefono;
  }

}
