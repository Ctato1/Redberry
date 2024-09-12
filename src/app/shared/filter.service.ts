import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private http:HttpClient) { }


  getRegions(){
    // return this.http.get('https://api.real-estate-manager.redberryinternship.ge/api/regions').pipe(catchError())
  }
}
