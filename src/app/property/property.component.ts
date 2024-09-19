import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {EstateGetProps, RealEstatesService} from "../apimodels";

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrl: './property.component.css'
})
export class PropertyComponent implements OnInit{
  id: string | null = null;
  currentEstate!:EstateGetProps;

  constructor(private route: ActivatedRoute,private location: Location,private realEstatesService:RealEstatesService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
    });
    this.realEstatesService.realEstatesIdGet(Number(this.id)).subscribe(data=>{
      this.currentEstate = data.body;
      console.log(data)
    },error => {
      console.log(error)
    })
  }
  goBack(): void {
    this.location.back();  // Goes back to the previous page
  }

}
