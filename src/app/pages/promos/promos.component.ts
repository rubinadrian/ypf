import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { TurnoService } from 'src/app/services/turno.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

declare var $;

@Component({
  selector: 'app-promos',
  templateUrl: './promos.component.html',
  styleUrls: ['./promos.component.css']
})
export class PromosComponent implements OnInit {

  formPromos:FormGroup;
  promos:Promo[] = [];
  cierre = null;
  enabled = false;
  loading:boolean;
  arqueo_id = null;

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

    $('#ModalFormPromo').on('shown.bs.modal', function (e) {
      document.getElementById('numero_ticket').focus();
    });

    this.formPromos = this._fb.group({
      id: [''],
      arqueo_id: [0],
      ticket:   ['', [Validators.required, Validators.maxLength(14), Validators.min(0), Validators.max(99999999999)]],
      importe:   ['', [Validators.required, Validators.maxLength(14), Validators.min(0), Validators.max(99999999999.99)]],
    });

    let period = this.route.snapshot.paramMap.get('period');
    if(period) {
      this._turno.getCierre(period).subscribe(() => {
        if(!this.cierre) {
          return this.router.navigate(['/']);
        }

        this._turno.getArqueo(this.cierre.id).subscribe((arqueo:any) => {
          this.arqueo_id = arqueo.id;
          this._turno.getPromos(this.arqueo_id).subscribe((promos:any) => this.promos = promos);
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
      this._turno.getPromos(this.arqueo_id).subscribe((promos:any) => this.promos = promos);
    }

  }


  onSubmit() {
    let promo:Promo = this.formPromos.value;
    console.log(promo);
    this._turno.savePromo(promo).subscribe(resp => {
      $('#ModalFormPromo').modal('hide');
      this.formPromos.reset();
      this._turno.getPromos(this.arqueo_id).subscribe((promos:any) => this.promos = promos);
    });
  }

  showModal() {
    this.formPromos.reset({ arqueo_id: 0 });
    $('#ModalFormPromo').modal('show');
  }

  edit(promo) {
    this.formPromos.patchValue(promo);
    $('#ModalFormPromo').modal('show');
  }

  del(promo) {
    if(confirm('Esta seguro de borrar el promo')) {
      this._turno.delPromo(promo.id).subscribe(resp => this._turno.getPromos(this.arqueo_id).subscribe((promos:any) => this.promos = promos));
    }
  }

  totalEfectivo() {
    let total = 0;
    this.promos.forEach((promo) => {
      total += Math.round (promo.importe*100) / 100;
    });

    return total;
  }

}



class Promo {
  arqueo_id: number;
  id: number;
  ticket:number;
  importe: number;
}
