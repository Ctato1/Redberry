import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-add-agent',
  templateUrl: './add-agent.component.html',
  styleUrl: './add-agent.component.css'
})
export class AddAgentComponent {
  @Input() message!:string | null | any;
  @Output() close = new EventEmitter<void>();
  constructor() {
  }
  onClose(){
    this.close.emit();
  }

}
