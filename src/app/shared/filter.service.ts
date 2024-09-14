import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, throwError} from "rxjs";


export interface AgentProps {
  id: number | null,
  name: string,
  surname?: string,
  avatar?: string
}

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


}
