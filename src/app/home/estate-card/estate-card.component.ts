import {Component, Input} from '@angular/core';
import {EstateProps} from "../home.component";

@Component({
  selector: 'app-estate-card',
  templateUrl: './estate-card.component.html',
  styleUrl: './estate-card.component.css'
})
export class EstateCardComponent {
  @Input() cardInfo!: EstateProps;

}
