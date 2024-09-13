import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {CitiesProps, FilterService, RegionProps} from "../shared/filter.service";

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.css'
})


export class ListingComponent implements OnInit {
  types: string[] = ['იყიდება', 'ქირავდება'];

  listingForm!: FormGroup;

  regions: RegionProps[] = [];
  allcities: CitiesProps[] = [];
  chosenCity: CitiesProps[] = [];


  constructor(private filterService: FilterService) {
  }

  ngOnInit() {
    this.fetchData();
    this.initForm();
  }

  initForm() {
    this.listingForm = new FormGroup({
      "location": new FormGroup({
        'address': new FormControl(null, [Validators.required]),
        'zip': new FormControl(null, [Validators.required]),
        'region': new FormControl(null, [Validators.required]),
        'city': new FormControl(null, [Validators.required]),
      }),
      "details": new FormGroup({
        'price': new FormControl(null, [Validators.required]),
        'area': new FormControl(null, [Validators.required]),
        'bedroom': new FormControl(null, [Validators.required]),
        'description': new FormControl(null, [Validators.required]),
        'photo': new FormControl(null, [Validators.required]),
      }),
      'types': new FormControl('იყიდება'),
      'agent': new FormControl(null, [Validators.required]),
    });
  }

  fetchData() {
    // get Regions
    this.filterService.getRegions().subscribe((regions: RegionProps[]) => {
      this.regions = regions;
    })
    this.filterService.getCities().subscribe((cities: CitiesProps[]) => {
      this.allcities = cities;
      console.log(cities)
    })
  }

  changeCities() {
    const currentRegionId:number = this.listingForm.get('location.region')?.value?.id;
    this.chosenCity = this.allcities.filter((item:CitiesProps) => item.region_id === currentRegionId);
  }

  onSubmit() {
    console.log(this.listingForm)
  }
}
