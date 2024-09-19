import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AgentsService} from "../../apimodels";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-add-agent',
  templateUrl: './add-agent.component.html',
  styleUrl: './add-agent.component.css'
})
export class AddAgentComponent implements OnInit{
  @Input() message!:string | null | any;
  @Output() close = new EventEmitter<void>();

  agentForm!:FormGroup;
  imgURL: string | null = null; // Image preview URL
  errorMessage: string = ''; // Error message for file upload


  constructor(private agentsService:AgentsService, private messageService: MessageService,) {

  }
  ngOnInit() {
    this.initForm();
    console.log(this.agentForm)
  }

  initForm() {
      this.agentForm = new FormGroup({
        'name': new FormControl(null, [Validators.required, Validators.minLength(2)]),
        'lastname': new FormControl(null, [Validators.required, Validators.minLength(2)]),
        'email': new FormControl(null, [Validators.required,  this.correctEmail.bind(this)]),
        'number': new FormControl(null, [Validators.required,  Validators.pattern("^5[0-9]{8}$") ]),
        'photo': new FormControl(null, [Validators.required]),

      })
  }


  onClose(){
    this.close.emit();
  }

  onSubmit(){

    const formData = this.agentForm.value;

    const { name, lastname, email, number,photo } = formData;


    if (!(photo instanceof Blob || photo instanceof File)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid image type. Please select a valid file.'});
      return;
    }

    this.agentsService.agentsPost(name, lastname, email, number,photo ).subscribe((event) => {
      if (event.type === 4) { // Handle final response event
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Real estate posted successfully' });
        this.onClose();
      }
    },(error)=>{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error?.error?.message });
    })

  }

  // validations
  correctEmail(control: FormControl): { [s: string]: boolean } | null {
      if (!control.value) {
        // If control value is null or undefined, return no error
        return null;
      }

      if (control.value.slice(-12) !== "@redberry.ge") {
        return { 'wrongEmail': true };
      }

      return null;
    }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (max 1MB)
      if (file.size > 1024000) {
        this.errorMessage = 'File size exceeds 1 MB. Please select a smaller image.';
        this.imgURL = null;
        return;
      }

      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imgURL = e.target?.result as string;
      };
      reader.readAsDataURL(file); // Convert image to base64 for preview

      // Set the selected file in the form
      this.agentForm.get('photo')?.setValue(file);
      this.errorMessage = '';
    }
  }
  clearSelectedFile(): void {
    this.imgURL = null;
    this.agentForm.get('photo')?.setValue(null);
    const fileInput = document.getElementById('imgInp') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear file input value
    }
  }

}
