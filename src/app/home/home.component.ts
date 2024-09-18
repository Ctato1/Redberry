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
  littlePrices!: string | undefined;
  littleAreas!: string | undefined;
  littleBedrooms!: string | undefined;


  prices: any = {min: null, max: null};

  myForm = this.fb.group({
    selectedRegions: this.fb.array([]),
    minPrice: new FormControl(),
    maxPrice: new FormControl(),
    minArea: new FormControl(),
    maxArea: new FormControl(),
    bedrooms: new FormControl(),
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private geographicalInformationService: GeographicalInformationService) {
  }

  ngOnInit() {
    this.subscription = this.geographicalInformationService.regionsGet()
      .subscribe((res: RegionProps[]) => {
        this.regions = res;
        this.loadSavedFilters();
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


  // delete filters with click
  deleteRegions() {
    this.selectedRegionsFormArray.clear();
    this.littleRegions = undefined;
    localStorage.removeItem('selectedRegions');
  }

  deletePrices() {
    const min = (this.myForm.get('minPrice') as FormArray);
    const max = this.myForm.get('maxPrice') as FormArray;
    localStorage.removeItem('selectedPricesMin')
    localStorage.removeItem('selectedPricesMax')
    min.reset();
    max.reset();
    this.littlePrices = undefined;
  }
  deleteAreas() {
    const min = (this.myForm.get('minArea') as FormArray);
    const max = this.myForm.get('maxArea') as FormArray;
    localStorage.removeItem('selectedAreaMin')
    localStorage.removeItem('selectedAreaMax')
    min.reset();
    max.reset();
    this.littleAreas = undefined;
  }
  deleteBedrooms() {
    const bedrooms = (this.myForm.get('bedrooms') as FormArray);
    localStorage.removeItem('selectedBedrooms')
    bedrooms.reset();
    this.littleBedrooms = undefined;
  }

  getNameId(id: number) {
    this.littleRegions = this.regions.find((item: RegionProps) => item.id == id)?.name;
  }


  loadSavedFilters() {
    const savedRegions = localStorage.getItem('selectedRegions');
    const savedPricesMin: string | null = localStorage.getItem('selectedPricesMin')
    const savedPricesMax: string | null = localStorage.getItem('selectedPricesMax')
    const savedAreasMin: string | null = localStorage.getItem('selectedAreaMin')
    const savedAreasMax: string | null = localStorage.getItem('selectedAreaMax')
    const savedBedrooms: string | null = localStorage.getItem('selectedBedrooms')

    if (savedRegions) {
      const parsedRegions = JSON.parse(savedRegions) as string[];
      this.getNameId(+parsedRegions[0]);
      console.log(savedRegions)
      parsedRegions.forEach(regionId => {

        this.selectedRegionsFormArray.push(new FormControl(regionId));
      });
    }
    if (savedPricesMin && savedPricesMax) {
      this.littlePrices = JSON.parse(savedPricesMin) + "₾ - " + JSON.parse(savedPricesMax) + "₾";
      this.myForm.get('maxPrice')?.setValue(JSON.parse(savedPricesMax))
      this.myForm.get('minPrice')?.setValue(JSON.parse(savedPricesMin))
    }
    if (savedAreasMin && savedAreasMax) {
      this.littleAreas = JSON.parse(savedAreasMin) + "მ - " + JSON.parse(savedAreasMax) + 'მ';
      this.myForm.get('maxArea')?.setValue(JSON.parse(savedAreasMax))
      this.myForm.get('minArea')?.setValue(JSON.parse(savedAreasMin))
    }
    if(savedBedrooms){
      this.littleBedrooms = JSON.parse(savedBedrooms);
      this.myForm.get('bedrooms')?.setValue(JSON.parse(savedBedrooms))
    }
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
  setMinArea(value: number) {
    this.myForm.get('minArea')?.setValue(value);
  }
  setMaxArea(value: number) {
    this.myForm.get('maxArea')?.setValue(value);
  }

  // change all filter flags
  removeFilters() {
    this.regionFilter = false;
    this.priceFilter = false;
    this.areaFilter = false;
    this.bedroomFilter = false;
  }

  regionFilterOn() {
    const current: boolean = this.regionFilter;
    this.removeFilters();
    this.regionFilter = !current;
  }

  priceFilterOn() {
    const current: boolean = this.priceFilter;
    this.removeFilters();
    this.priceFilter = !current;
  }
  areaFilterOn(){
    const current: boolean = this.areaFilter;
    this.removeFilters();
    this.areaFilter = !current;
  }
  bedroomFilterOn(){
    const current: boolean = this.bedroomFilter;
    this.removeFilters();
    this.bedroomFilter = !current;
  }

  // Submit functions
  onRegionSubmit() {
    this.regionFilter = false;
    const selectedRegions = this.selectedRegionsFormArray.value;
    this.getNameId(+selectedRegions[0]);
    localStorage.setItem('selectedRegions', JSON.stringify(selectedRegions));
    this.onSubmit();
  }

  onPriceSubmit() {
    this.priceFilter = false;
    const minPrice = this.myForm.get("minPrice")?.value;
    const maxPrice = this.myForm.get("maxPrice")?.value;
    if (minPrice === null && maxPrice === null) {
      this.deletePrices()
    }
    if (minPrice > maxPrice || minPrice === null || maxPrice === null || minPrice < 0 || maxPrice < 0) {
      return;
    }

    localStorage.setItem('selectedPricesMax', JSON.stringify(maxPrice));
    localStorage.setItem('selectedPricesMin', JSON.stringify(minPrice));
    const savedPricesMin: string | null = localStorage.getItem('selectedPricesMin')
    const savedPricesMax: string | null = localStorage.getItem('selectedPricesMax')
    if (savedPricesMin && savedPricesMax) {
      this.littlePrices = JSON.parse(savedPricesMin) + "₾ - " + JSON.parse(savedPricesMax) + "₾";
    }
    this.onSubmit();
  }
  onAreaSubmit(){
    this.areaFilter = false;
    const minArea = this.myForm.get("minArea")?.value;
    const maxArea = this.myForm.get("maxArea")?.value;
    if (minArea === null && maxArea === null) {
      this.deleteAreas()
    }
    if (minArea > maxArea || minArea === null || maxArea === null || minArea < 0 || maxArea < 0) {
      return;
    }

    localStorage.setItem('selectedAreaMax', JSON.stringify(maxArea));
    localStorage.setItem('selectedAreaMin', JSON.stringify(minArea));
    const savedAreaMin: string | null = localStorage.getItem('selectedAreaMin')
    const savedAreaMax: string | null = localStorage.getItem('selectedAreaMax')
    if (savedAreaMin && savedAreaMax) {
      this.littleAreas = JSON.parse(savedAreaMin) + "მ - " + JSON.parse(savedAreaMax) + 'მ';
    }
    this.onSubmit();
  }

  onBedroomSubmit(){
    this.bedroomFilter = false;
    const bedrooms = this.myForm.get("bedrooms")?.value;
    if (bedrooms === null) {
      this.deletePrices()
    }
    localStorage.setItem('selectedBedrooms', JSON.stringify(bedrooms));
    const savedBedrooms: string | null = localStorage.getItem('selectedBedrooms')
    if(savedBedrooms){
      this.littleBedrooms = JSON.parse(savedBedrooms);
    }
    this.onSubmit();
  }


  onSubmit() {
    console.log(this.myForm)
  }
}
