import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, throwError} from "rxjs";


export interface RegionProps {
  id: number;
  name: string;
}

export interface CitiesProps {
  id: number,
  name: string,
  region_id: number
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private http: HttpClient) {
  }


  getRegions() {
    return this.http.get<RegionProps[]>('https://api.real-estate-manager.redberryinternship.ge/api/regions').pipe(catchError(errorRes => throwError(errorRes)))
  }

  getCities() {
    return this.http.get<CitiesProps[]>('https://api.real-estate-manager.redberryinternship.ge/api/cities').pipe(catchError(errorRes => throwError(errorRes)))
  }
}
