import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RealEstatesService} from "../../apimodels";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent {
  @Input() id!: string | null;
  @Output() close = new EventEmitter<void>();


  constructor(private realEstatesService: RealEstatesService,
              private messageService: MessageService,
              private router: Router) {
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    this.realEstatesService.realEstatesIdDelete(+this.id).subscribe(event => {
      if (event.type === 4) { // Handle final response event
        this.messageService.add({
          severity: 'success', summary: 'Success', detail: 'Real estate posted successfully',
          styleClass: 'my-custom-success',
          life: 3000
        });
        setTimeout(() => {
          this.onClose();
          this.router.navigate(['/']);
        }, 100)
      }


    }, error => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: "Something went wrong",
        styleClass: 'my-custom-error',
        life: 3000
      })
    })
  }
}
