import { Component, OnInit, ViewChild  } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { PromosComponent } from '../promos/promos.component';
import { ChequesComponent } from '../cheques/cheques.component';

@Component({
  selector: 'app-playa',
  templateUrl: './playa.component.html',
  styleUrls: ['./playa.component.css']
})
export class PlayaComponent implements OnInit {
  loading = false;

  @ViewChild(PromosComponent, {static: false}) promosComponent:PromosComponent;
  @ViewChild(ChequesComponent, {static: false}) chequesComponent:ChequesComponent;


  constructor(private loader:LoaderService) {
    this.loader.isLoading.subscribe(v => this.loading = v);
  }

  ngOnInit() {
  }

}
