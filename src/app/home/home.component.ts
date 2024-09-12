import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { FormBuilder, FormArray, FormControl } from "@angular/forms";
import {FilterService, RegionProps} from "../shared/filter.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  filterSelected: boolean = false;
  regionFilter: boolean = false;
  subscription!: Subscription;
  regions: RegionProps[] = [];

  myForm = this.fb.group({
    selectedRegions: this.fb.array([])
  });

  constructor(private http: HttpClient, private fb: FormBuilder,private filterService:FilterService) {}

  ngOnInit() {
    this.subscription = this.filterService.getRegions()
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

  get selectedRegionsFormArray() {
    return this.myForm.get('selectedRegions') as FormArray;
  }

  loadSavedRegions() {
    const savedRegions = localStorage.getItem('selectedRegions');
    if (savedRegions) {
      const parsedRegions = JSON.parse(savedRegions) as string[];
      parsedRegions.forEach(regionId => {
        this.selectedRegionsFormArray.push(new FormControl(regionId));
      });
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

  onRegionSubmit() {
    this.regionFilter = false;
    const selectedRegions = this.selectedRegionsFormArray.value;
    localStorage.setItem('selectedRegions', JSON.stringify(selectedRegions));
    console.log('Selected regions:', selectedRegions);
  }
}
