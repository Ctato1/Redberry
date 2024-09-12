import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.css'
})
export class ListingComponent implements OnInit{
  types:string[] = ['იყიდება', 'ქირავდება'];

  listingForm!:FormGroup;
  options1 = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 }
  ];

  ngOnInit() {
    this.listingForm = new FormGroup({
      "location" : new FormGroup({
        'address' : new FormControl(null,[Validators.required]),
        'zip' : new FormControl(null,[Validators.required]),
        'region' : new FormControl(null,[Validators.required]),
        'city' : new FormControl(null,[Validators.required]),
      }),
      "details" : new FormGroup({
        'price' : new FormControl(null,[Validators.required]),
        'area' : new FormControl(null,[Validators.required]),
        'bedroom' : new FormControl(null,[Validators.required]),
        'description' : new FormControl(null,[Validators.required]),
        'photo' : new FormControl(null,[Validators.required]),
      }),
      'types' : new FormControl('იყიდება'),
      'agent' : new FormControl(null,[Validators.required]),
    })
  }


  onSubmit(){

  }
}
