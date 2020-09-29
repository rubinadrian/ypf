import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turno.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CioService } from 'src/app/services/cio.service';
import { LoaderService } from 'src/app/services/loader.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

const __MARGEN__:number = 10; //__MARGEN__ en litros de error en facturacion.

declare var $: any;

@Component({
  selector: 'app-pendientes',
  templateUrl: './pendientes.component.html',
  styleUrls: ['./pendientes.component.css']
})
export class PendientesComponent implements OnInit {
  cio:any;
  volsYPFenRuta:any;
  articulos = [];
  aforadores = [];
  facturados = [];
  artCombBit = [];
  incidencias = [];
  articulosPendientes = [];
  combAfoPendientes = [];
  combCioPendientes = [];
  facturados_clon = [];
  hayPendientes = true;
  formIncidencia = new FormGroup({
    articulo: new FormControl('',Validators.required),
    cantidad: new FormControl('',Validators.required)
  });
  loading:boolean;
  loadingCio:boolean;
  cajacerrada = false;
  cierre = null;

  constructor(public _turno:TurnoService,
    public router:Router,
    public _cio:CioService,
    public route:ActivatedRoute,
    public loader:LoaderService) {
      this.loader.isLoading.subscribe(v => this.loading = v);
      this.loader.isLoadingCio.subscribe(v => this.loadingCio = v);
      this._turno.obs_cierre.subscribe(cierre => {
        this.cierre = cierre;
        if(cierre) {
          this.cajacerrada = this.cierre.status == '1000';
        }
      });
    }

  ngOnInit() {
    let period = this.route.snapshot.paramMap.get('period');
    this._turno.getCierre(period).subscribe((cierre:any) => {

      if(cierre.status * 1 < 3) {
        return this.router.navigate(['/']);
      }

      this._turno.getIncidencias(this.cierre.id).subscribe((resp:any) => this.incidencias = resp);

      this._turno.getArtCombBit().subscribe((resp:any) => {
        this.artCombBit = resp;
        this.getAllPendientes();
      });

    });
  }


  onSubmit() {
    if(this.hayPendientes === false) {
      this._turno.closeTurno(this.cierre.period).subscribe(resp => {


        Swal.fire({
          title: 'Caja Finalizada',
          text:  'Realize el cierre por cambio de cajero en el ventas ticket.',
          type:  'success'
        }).then(() => {
          this.router.navigate(['comprobantes', this.cierre.period]);
          });


      });
    }
  }

  getAllPendientes() {

    forkJoin(
      this._cio.getCierreCio(this.cierre.period),
      this._turno.getControlArticulos(this.cierre.id),
      this._turno.getControlAforadores(this.cierre.id),
      this._turno.getFacturados(this.cierre.id)
    )
    .subscribe(([
        cio,
        articulos,
        aforadores,
        facturados]:any) => {
          console.log(facturados);
      this.articulos = articulos;
      this.aforadores = aforadores;
      this.facturados = facturados;
      this.facturados_clon = [...facturados];
      this.cio = cio;

      this.cio.period = this.cierre.period;

      // Gurdamos los datos del Cio, cantidad de combustible despachada.
      this._cio.saveCierreCio(cio).subscribe();

      if(this.facturados.length == 0) {
        Swal.fire({
          title: 'Usuario incorrecto',
          text:  'No hay facturacion para el usuario seleccionado',
          type:  'error'
        }).then(() => {
            this.router.navigate(['/']);
          });
      }

      this.getArticulosPendintes(); // Planilla control
      this.getCombAfoPendientes();  // Aforadores Agro
      this.getCombCioPendientes();  // Aforadores Playa (CIO)

      this.controlTodoFacturado();

    }, error => {
      alert(error);
    });
  }

  controlTodoFacturado() {

    if(this.articulosPendientes.length > 0) {
      console.log('Articulos Pendientes: ', this.articulosPendientes);
      return this.hayPendientes = true;
    }

    let idx = this.combAfoPendientes.findIndex(art => (+art.cantidad > __MARGEN__ || +art.cantidad < -1 * __MARGEN__));
    if(idx !== -1) {
      console.log('combAfoPendientes Pendientes: ', this.combAfoPendientes);
      return this.hayPendientes = true
    }

    idx = this.combCioPendientes.findIndex(art => (+art.cantidad  > __MARGEN__ || +art.cantidad < -1 * __MARGEN__));
    if(idx !== -1) {
      console.log('combCioPendientes Pendientes: ', this.combAfoPendientes);
      return this.hayPendientes = true
    }

    this.hayPendientes = false;
  }

  // Articulos de la planilla de control
  getArticulosPendintes() {
    this.articulosPendientes = [];
    this.articulos.forEach(art => {
      let vendido = art.inicial + art.reposicion - art.final;
      let idxArtFacturado = this.facturados.findIndex(f => f.articulo == art.codigo);
      let facturado = 0;
      if(idxArtFacturado != -1 ) {
        this.facturados[idxArtFacturado].cantidad = this.facturados[idxArtFacturado].cantidad;
        facturado = this.facturados[idxArtFacturado].cantidad * 1 || 0;
        this.facturados.splice(idxArtFacturado, 1);
      }

      if(facturado != vendido) {
        this.articulosPendientes.push({
          articulo:  art.codigo,
          inicial:  art.inicial,
          reposicion:  art.reposicion,
          final:  art.final,
          denominacion: art.denominacion,
          facturado: facturado.toFixed(2),
          cantidad: vendido - facturado
        });
      }
    });
  }

  // Combustibles de los aforadores que no pertenecen al cio
  getCombAfoPendientes() {
    this.combAfoPendientes = [];
    let combAfoAgro = [];
    this.aforadores.forEach(afo => {
      combAfoAgro[afo.articulo] = combAfoAgro[afo.articulo]||0;
      combAfoAgro[afo.articulo] += afo.final - afo.inicial;
    });

    for(let art in combAfoAgro) {
      let idxArtFacturado = this.facturados.findIndex(f => f.articulo == art);
      let facturado = 0;
      if(idxArtFacturado != -1) {
        facturado = this.facturados[idxArtFacturado].cantidad * 1 || 0;
        this.facturados.splice(idxArtFacturado, 1);
      }
      let denominacion = this.artCombBit.find(bit => bit.articulo == art).denominacion || '';
      let despachados = combAfoAgro[art] * 1 || 0;

      if(facturado != despachados) {
        this.combAfoPendientes.push({
          articulo:  art,
          denominacion,
          despachados: despachados.toFixed(2),
          facturado: facturado.toFixed(2),
          cantidad: (despachados - facturado).toFixed(2)
        });
      }
    };
  }

  // Combustibles del cio
  getCombCioPendientes() {
    this.combCioPendientes = [];

    this.artCombBit.forEach( c => {

      if(! this.cio[c.articulo]) return;

      let idxArtFacturado = this.facturados.findIndex(f => f.articulo == c.articulo);
      let facturado = 0;

      if(idxArtFacturado != -1) {
        facturado = this.facturados[idxArtFacturado].cantidad * 1 || 0;
        // this.facturados.splice(idxArtFacturado, 1);
      }

      let inicidencia = 0;
      let idxArtIncidencia = this.incidencias.findIndex(i => i.articulo == c.articulo);
      if(idxArtIncidencia != -1) {
        inicidencia = this.incidencias[idxArtIncidencia].cantidad;
      }

      // let enRuta = this.volsYPFenRuta[c.articulo] || 0;

      let cantidad_pendiente = this.cio[c.articulo].volumen - facturado - inicidencia;

      if(facturado != this.cio[c.articulo].volumen) {
        this.combCioPendientes.push({
          articulo:  c.articulo,
          denominacion: c.denominacion,
          cio:  this.cio[c.articulo].volumen.toFixed(2),
          facturado: facturado.toFixed(2),
          cantidad: cantidad_pendiente.toFixed(2)
        });
      }
    });
  }

  refresh(): void {
    window.location.reload();
  }

  addIncidencia() {
    console.log(
      this.articulos,
      this.aforadores,
      this.facturados,
      this.artCombBit,
      this.incidencias,
      this.articulosPendientes,
      this.combAfoPendientes,
      this.combCioPendientes,
      this.facturados_clon,
      this.volsYPFenRuta
    );
    $('#modal_incidencia').modal('show');
  }

  saveIncidencia() {
    if(this.formIncidencia.invalid) { return; };
    let incidencia = this.formIncidencia.value;
    incidencia.cierre_id = this.cierre.id;
    incidencia.denominacion = this.combCioPendientes.find(c => c.articulo == incidencia.articulo).denominacion;
    this._turno.saveIncidencia(incidencia).subscribe(resp => {
      let idx = this.incidencias.findIndex(a => a.articulo == incidencia.articulo);
      if(idx != -1) {
        this.incidencias[idx].cantidad = (this.incidencias[idx].cantidad * 1 + incidencia.cantidad * 1).toFixed(2);
      } else {
        this.incidencias.push(incidencia);
      }

      this.getCombCioPendientes();
      $('#modal_incidencia').modal('hide');
    });
  }

  delIncidencia(idx) {


    Swal.fire({
      title: 'Borrar Incidencia',
      text: "Esta seguro/a de borrar la incidencia?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Estoy Seguro!'
    }).then((result) => {
      if (result.value) {
        let incidencia = {
          articulo: this.incidencias[idx].articulo,
          cierre_id: this.cierre.id
        };
        this._turno.delIncidencia(incidencia).subscribe();
        this.incidencias.splice(idx,1);
        this.getCombCioPendientes();
      }
    });
  }
}

interface Articulo {
  cierre_id?:string;
  cantidad?: number;
  denominacion?: string;
  articulo?: string;
}
