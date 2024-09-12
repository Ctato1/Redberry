import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, throwError} from "rxjs";


export interface RegionProps {
  id: number;
  name: string;
}
@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private http:HttpClient) { }


  getRegions(){
    return this.http.get<RegionProps[]>('https://api.real-estate-manager.redberryinternship.ge/api/regions').pipe(catchError(errorRes=> throwError(errorRes)))
  }
}
