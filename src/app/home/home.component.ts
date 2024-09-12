import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subscription} from "rxjs";
import {MegaMenuItem} from "primeng/api";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  filterSelected:boolean = false;

  regionFilter:boolean = false;
  subscription!: Subscription;

  regions: any[] = []

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.subscription = this.http.get('https://api.real-estate-manager.redberryinternship.ge/api/regions').subscribe((res: any) => {
      this.regions = res;
      console.log(this.regions)
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
