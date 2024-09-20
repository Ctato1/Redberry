import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { EstateGetProps, RealEstatesService } from "../apimodels";
import { EstateProps } from "../home/home.component";
import { Observable, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PropertyComponent implements OnInit {
  id: string | null = null;
  showModal!:null | number;
  currentEstate!: EstateGetProps;
  similarEstates: EstateProps[] = [];
  responsiveOptions: { breakpoint: string, numVisible: number, numScroll: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private realEstatesService: RealEstatesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setupResponsiveOptions(); // Centralized responsive options
    this.handleRouteChanges(); // Handle route changes and fetch data
  }

  showDeleteModal(){
    this.showModal = 1;
  }
  onHandleModal(){
    this.showModal = null;
  }

  // Setup responsive options
  setupResponsiveOptions(): void {
    this.responsiveOptions = [
      { breakpoint: '1199px', numVisible: 2, numScroll: 1 },
      { breakpoint: '991px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 1, numScroll: 1 }
    ];
  }

  // Handle route parameter changes
  handleRouteChanges(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const newId = params.get('id');
          if (!newId || newId === this.id) {
            return []; // Prevent unnecessary fetch if ID is the same
          }

          this.id = newId; // Update the component ID

          // Fetch current estate and similar estates together
          return this.fetchEstateData(Number(this.id));
        }),
        catchError(error => {
          console.error('Error handling route changes:', error);
          this.navigateToHome();
          return [];
        })
      )
      .subscribe();
  }

  // Fetch both the current estate and similar estates
  fetchEstateData(id: number): Observable<void> {
    return forkJoin([
      this.realEstatesService.realEstatesIdGet(id),
      this.realEstatesService.realEstatesGet()
    ])
      .pipe(
        switchMap(([estateData, allEstatesData]) => {
          if (!estateData.body || !allEstatesData.body) {
            throw new Error('Data is missing');
          }

          this.currentEstate = estateData.body;
          this.filterSimilarEstates(allEstatesData.body);

          return []; // Returning an empty array for observable chaining
        }),
        catchError(error => {
          console.error('Error fetching estate data:', error);
          this.navigateToHome();
          return [];
        })
      );
  }

  // Filter similar estates by region
  filterSimilarEstates(allEstates: EstateProps[]): void {
    if (!this.currentEstate || !this.currentEstate.city) {
      return;
    }

    this.similarEstates = allEstates.filter(
      (item: EstateProps) => item.city && item.city.region_id === this.currentEstate.city.region_id
    );
  }

  // Navigate back to the previous page
  goBack(): void {
    this.location.back();
  }

  // Navigate to the home page
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  navigateToLink(id:number){
    window.scrollTo(0,0);
    this.router.navigate([`/property/${id}`]);
  }
}
