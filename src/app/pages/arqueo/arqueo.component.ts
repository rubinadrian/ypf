import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import Swal from 'sweetalert2';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-arqueo',
  templateUrl: './arqueo.component.html',
  styleUrls: ['./arqueo.component.css']
})
export class ArqueoComponent implements OnInit {
  cierre = null;
  enabled = false;
  loading:boolean;
  billetes = [
    { valor:1000, cantidad:0 },
    { valor:500,  cantidad:0 },
    { valor:200,  cantidad:0 },
    { valor:100,  cantidad:0 },
    { valor:50,   cantidad:0 },
    { valor:20,   cantidad:0 },
    { valor:10,   cantidad:0 },
    { valor:5,    cantidad:0 }
  ];

  cheques = 0;
  tarjetas = 0;
  tickets = 0;
  otros_texto = '';
  otros_valor = 0;

  constructor(public _turno:TurnoService, 
              public router:Router,
              public loader:LoaderService,
              public route:ActivatedRoute) 
  {
      this.loader.isLoading.subscribe(v => this.loading = v);
      this._turno.obs_cierre.subscribe(cierre => this.cierre = cierre);
  }

  ngOnInit() {
    
    let period = this.route.snapshot.paramMap.get('period');
    this._turno.getCierre(period).subscribe(() => {
      if(!this.cierre) {
        return this.router.navigate(['/']);
      }
      

      this._turno.getArqueo(this.cierre.id).subscribe(resp => this.filldata(resp));
      
      // No permite modificacion
      if(this.cierre.status != '0' && typeof this.cierre.id !== "undefined") {
        this.enabled = false;
      } else {
        this.enabled = true;
      }
    });
  }

  filldata(data) {

    this.billetes.forEach(b => {
      b.cantidad = data['v' + b.valor] * 1 || 0;
    });

    this.cheques = data['cheques'] * 1 || 0;
    this.tarjetas = data['tarjetas'] * 1 || 0;
    this.tickets = data['tickets'] * 1 || 0;
    this.otros_texto = data['otros_texto'] || '';
    this.otros_valor = data['otros_valor'] * 1 || 0; 
  }

  totalEfectivo() {
    let total = 0;
    for(let i of this.billetes) {
      total += i.cantidad * i.valor;
    }
    return parseFloat(total.toFixed(2));
  }

  totalOtros() {
    return parseFloat((+this.cheques + +this.otros_valor + +this.tarjetas + +this.tickets).toFixed(2));
  }

  totalRendido() {
    return (this.totalEfectivo() + this.totalOtros()).toFixed(2);
  }

  onSubmit() {
    
    // Pasamos a la otra pantalla en caso que ya fue guardada la cantidad de plata
    if(this.enabled === false) {
      return this.router.navigate(['articulos', this.cierre.period ]);
    }

    // No se permite pasar una caja en cero
    if(this.totalEfectivo() === 0) return;
    
    let arqueo = { 
      cheques:this.cheques,
      tarjetas:this.tarjetas,
      tickets:this.tickets,
      otros_texto:this.otros_texto,
      otros_valor:this.otros_valor,
      cierre_id: this.cierre.id
    }

    this.billetes.forEach(b => arqueo[b.valor] = b.cantidad);
    


    Swal.fire({
      title: 'Esta seguro de continuar?',
      text: "Una vez confirmado el arqueo no es posible modificarlo!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Estoy Seguro!'
    }).then((result) => {
      if (result.value) {
        this._turno.saveArqueo(arqueo).subscribe((resp:any) => {
          if(resp.ok == 'true') {
            this.router.navigate(['articulos', this.cierre.period ]);
          } 
        });
      }
    });

 
  }

}
