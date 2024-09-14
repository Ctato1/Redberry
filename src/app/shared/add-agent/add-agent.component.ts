import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

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


  constructor() {

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
        'number': new FormControl(null, [Validators.required, Validators.pattern("^[0-9+]*$")]),
        'photo': new FormControl(null, [Validators.required]),

      })
  }


  onClose(){
    this.close.emit();
  }

  onSubmit(){

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
      this.errorMessage = ''; // Clear previous errors
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
