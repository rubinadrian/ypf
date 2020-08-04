import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { CioService } from '../../services/cio.service';
import { Router } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-turno',
  templateUrl: './turno.component.html',
  styleUrls: ['./turno.component.css']
})
export class TurnoComponent implements OnInit  {
  periods = [];
  years = [];
  period = '';
  year = 0;
  month = 0;
  loadPeriods = false;
  turno='';
  playeros = [];
  playero1 = '';
  playero2 = '';
  playero3 = '';
  turnos =  [];
  cierre = null;
  loading = true;

  constructor(public _cio: CioService, 
              public router:Router,
              private _turno: TurnoService,
              public loader:LoaderService) {
        this._turno.clear();
        this.loader.isLoading.subscribe(v => this.loading = v);
        this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
  }

  ngOnInit(): void {

    
    let date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth();
    for(let i=0; i< 10;i++) {
      this.years.push(this.year - 5 + i);
    }

    this._turno.getUsuariosCajas().subscribe((resp:any) => {
      this.turnos = resp;
      this.turnos.sort();
    });   

    this.getPeriods();
    this._turno.getPlayeros().subscribe((resp:any) => this.playeros=resp);
    
  }

  getPeriods() {
    this.loadPeriods = true;
    this._cio.getPeriods(this.month,this.year).subscribe((resp:any) => {
      this.loadPeriods = false;
      this.periods = resp;
    });
  }

  onSubmit() {
    if(!this.turno || !this.period) { return; }
  
    let data = {
      turno:this.turno,
      period:this.period,
      playero1:this.playero1,
      playero2:this.playero2,
      playero3:this.playero3
    };

    this._turno.saveCierre(data).subscribe((resp:any) => {
        this._cio.getCierreCio(this.cierre.period).subscribe();
        this._cio.getYERcio(this.cierre.period).subscribe();
        return this.router.navigate(['tarjetas', this.cierre.period]);
    });
  }


}
