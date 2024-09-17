import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subscription} from "rxjs";
import {FormBuilder, FormArray, FormControl} from "@angular/forms";
import {FilterService, RegionProps} from "../shared/filter.service";
import {GeographicalInformationService} from "../apimodels";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // select buttons flags
  regionFilter: boolean = false;
  priceFilter: boolean = false;
  areaFilter: boolean = false;
  bedroomFilter: boolean = false;

  // for fetching
  subscription!: Subscription;

  // data
  regions: RegionProps[] = [];

  // show details
  littleRegions!: string | undefined;
  littlePrices!:string | undefined;


  prices: any = {min: null, max: null};

  myForm = this.fb.group({
    selectedRegions: this.fb.array([]),
    minPrice: new FormControl(),
    maxPrice: new FormControl(),
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private geographicalInformationService: GeographicalInformationService) {
  }

  ngOnInit() {
    this.subscription = this.geographicalInformationService.regionsGet()
      .subscribe((res: RegionProps[]) => {
        this.regions = res;
        this.loadSavedRegions();
      });
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // get values of form
  get selectedRegionsFormArray() {
    return this.myForm.get('selectedRegions') as FormArray;
  }


  // delete filters bt click
  deleteRegions() {
    this.selectedRegionsFormArray.clear();
    this.littleRegions = undefined;
    localStorage.removeItem('selectedRegions');
  }
  deletePrices(){
    localStorage.removeItem('selectedPricesMin')
    localStorage.removeItem('selectedPricesMax')
    this.littlePrices = undefined;
  }

  getNameId(id: number) {
    this.littleRegions = this.regions.find((item: RegionProps) => item.id == id)?.name;
  }


  loadSavedRegions() {
    const savedRegions = localStorage.getItem('selectedRegions');
    const savedPricesMin:string | null = localStorage.getItem('selectedPricesMin')
    const savedPricesMax:string | null = localStorage.getItem('selectedPricesMax')
    if (savedRegions) {
      const parsedRegions = JSON.parse(savedRegions) as string[];
      this.getNameId(+parsedRegions[0]);
      console.log(savedRegions)
      parsedRegions.forEach(regionId => {

        this.selectedRegionsFormArray.push(new FormControl(regionId));
      });
    }
    if(savedPricesMin && savedPricesMax){
      this.littlePrices = JSON.parse(savedPricesMin) + "₾ - " + JSON.parse(savedPricesMax) + "₾";
      this.myForm.get('maxPrice')?.setValue(JSON.parse(savedPricesMax))
      this.myForm.get('minPrice')?.setValue(JSON.parse(savedPricesMin))
    }
    console.log(this.littlePrices)
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const regionId = checkbox.value;

    if (checkbox.checked) {
      this.selectedRegionsFormArray.push(new FormControl(regionId));
    } else {
      const index = this.selectedRegionsFormArray.controls.findIndex(x => x.value === regionId);
      if (index !== -1) {
        this.selectedRegionsFormArray.removeAt(index);
      }
    }
  }

  isRegionSelected(regionId: number): boolean {
    return this.selectedRegionsFormArray.value.includes(regionId.toString());
  }
  // change prices
  setMinPrice(value: number) {
    this.myForm.get('minPrice')?.setValue(value);
  }
  setMaxPrice(value: number) {
    this.myForm.get('maxPrice')?.setValue(value);
  }
  // change all filter flags
  removeFilters(){
    this.regionFilter = false;
    this.priceFilter = false;
    this.areaFilter = false;
    this.bedroomFilter = false;
  }
  regionFilterOn(){
    const current:boolean = this.regionFilter;
    this.removeFilters();
    this.regionFilter = !current;
  }
  priceFilterOn(){
    const current:boolean = this.priceFilter;
    this.removeFilters();
    this.priceFilter = !current;
  }

  // Submit functions
  onRegionSubmit() {
    this.regionFilter = false;
    const selectedRegions = this.selectedRegionsFormArray.value;
    this.getNameId(+selectedRegions[0]);
    localStorage.setItem('selectedRegions', JSON.stringify(selectedRegions));
  }

  onPriceSubmit() {
    this.priceFilter = false;
    const minPrice = this.myForm.get("minPrice")?.value;
    const maxPrice = this.myForm.get("maxPrice")?.value;
    if(minPrice === null && maxPrice === null){
      this.deletePrices()
    }
    if(minPrice > maxPrice || minPrice === null || maxPrice === null || minPrice < 0 || maxPrice < 0 ){
      return;
    }

    localStorage.setItem('selectedPricesMax', JSON.stringify(maxPrice));
    localStorage.setItem('selectedPricesMin', JSON.stringify(minPrice));
    const savedPricesMin:string | null = localStorage.getItem('selectedPricesMin')
    const savedPricesMax:string | null = localStorage.getItem('selectedPricesMax')
    if(savedPricesMin && savedPricesMax){
      this.littlePrices = JSON.parse(savedPricesMin) + "₾ - " + JSON.parse(savedPricesMax) + "₾";
    }

  }

  onSubmit() {
    this.onRegionSubmit();
    this.onPriceSubmit();
  }
}
