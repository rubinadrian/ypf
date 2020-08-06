import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-playa',
  templateUrl: './playa.component.html',
  styleUrls: ['./playa.component.css']
})
export class PlayaComponent implements OnInit {
  loading = false;

  constructor(private loader:LoaderService) {
    this.loader.isLoading.subscribe(v => this.loading = v);
  }

  ngOnInit() {
  }

}
