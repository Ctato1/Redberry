import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {AgentProps, CitiesProps, FilterService, RegionProps} from "../shared/filter.service";
import {AgentsService, GeographicalInformationService, RealEstatesService} from "../apimodels";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.css'
})


export class ListingComponent implements OnInit {
  types: { name: string, value: boolean }[] = [{name: 'იყიდება', value: false}, {name: 'ქირავდება', value: true}];

  listingForm!: FormGroup;

  // for dropdowns
  regions: RegionProps[] = [];
  allCities: CitiesProps[] = [];
  chosenCity: CitiesProps[] = [];
  agents: AgentProps[] = [];
  selectedAgent: number | null = 0.001;

  imgURL: string | any | null = null;  // To store the image URL for preview
  errorMessage: string = '';  // To store error messages if file is too large


  constructor(private realEstatesService: RealEstatesService, private messageService: MessageService, private agentService: AgentsService, private geographicalInformationService: GeographicalInformationService) {
  }

  ngOnInit() {

    this.fetchData();
    this.initForm();
  }

  initForm() {
    this.listingForm = new FormGroup({
      "location": new FormGroup({
        'address': new FormControl(null, [Validators.required, Validators.minLength(2)]),
        'zip': new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'region': new FormControl(null, [Validators.required]),
        'city': new FormControl(null, [Validators.required]),
      }),
      "details": new FormGroup({
        'price':  new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'area':  new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'bedroom': new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'description': new FormControl(null, [Validators.required, Validators.pattern(/^(\b\w+\b[\s\r\n]*){5,}$/)]),
        'photo': new FormControl(null, [Validators.required]),
      }),
      'types': new FormControl(this.types[0]),
      'agent': new FormControl(null, [Validators.required]),
    });
  }

  fetchData() {
    // get Regions
    this.geographicalInformationService.regionsGet().subscribe(regions => {
      this.regions = regions;
    })
    // get cities
    this.geographicalInformationService.citiesGet().subscribe(cities => {
      this.allCities = cities;
    })
    // get agents
    this.agentService.agentsGet().subscribe(agents => {
      this.agents = [{name: 'Add Agent', id: null}, ...agents];
    });
  }


  onSubmit() {

    if(!this.listingForm.valid){
      return;
    }

    const address = this.listingForm.get('location.address')?.value;
    const zipCode = this.listingForm.get('location.zip')?.value;
    const regionId = this.listingForm.get('location.region')?.value?.id; // Assuming region is an object with id
    const cityId = this.listingForm.get('location.city')?.value?.id; // Assuming city is an object with id

    const price = this.listingForm.get('details.price')?.value;
    const area = this.listingForm.get('details.area')?.value;
    const bedrooms = this.listingForm.get('details.bedroom')?.value;
    const description = this.listingForm.get('details.description')?.value;
    const image = this.listingForm.get('details.photo')?.value; // Ensure this is a Blob/File

    const isRental = this.listingForm.get('types')?.value?.value;
    const agentId = this.listingForm.get('agent')?.value?.id; // Assuming agent is an object with id

    // Check if image is a valid file type (Blob or File)
    if (!(image instanceof Blob || image instanceof File)) {
      console.error('Invalid image type. Please select a valid file.');
      return;
    }

    // Ensure valid values are passed
    if (!address || !regionId || !cityId || !price || !area || !bedrooms || !description || !agentId) {
      console.error('Please fill all the required fields.');
      return;
    }

    // Call the post service with valid values
    this.realEstatesService.postEstates(address, image, regionId, description, cityId, zipCode, price, area, bedrooms, isRental, agentId)
      .subscribe(event => {
        if (event.type === 4) {  // Final response event
          console.log('Response:', event);  // Log only the final response
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Real estate posted successfully'});
        }
      }, err => {
        console.error('Error:', err);
        this.messageService.add({severity: 'error', summary: 'Error', detail: err?.error?.message});
      });

  }

  changeCities() {
    const currentRegionId: number = this.listingForm.get('location.region')?.value?.id;
    this.chosenCity = this.allCities.filter((item: CitiesProps) => item.region_id === currentRegionId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // (1 MB = 1024 * 1024 bytes)
      if (file.size > 1024000) { // If file size exceeds 1MB
        this.errorMessage = 'File size exceeds 1 MB. Please select a smaller image.';
        this.imgURL = null; // Clear the previous image preview if the new file is too large
        return;
      }

      // Preview the image using FileReader
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imgURL = e.target?.result;  // Set the imgURL for preview
      };
      reader.readAsDataURL(file); // Preview as base64

      // Set the file (Blob) in the form control
      this.listingForm.get('details.photo')?.setValue(file);  // Set the actual Blob instead of base64
      this.errorMessage = '';  // Clear any previous error messages
    }

  }

  clearSelectedFile(): void {
    this.imgURL = null;  // Clear the image preview
    this.listingForm.get('details.photo')?.setValue(null);  // Clear the form control value

    // reset the file input value
    const fileInput = document.getElementById('imgInp') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';  // clear the file input value
    }
  }

  onAgentChange(event: any) {
    this.selectedAgent = event.value;

    console.log(this.listingForm.get('agent')?.value?.id === null)
    // check if Agent is selected
    if (this.listingForm.get('agent')?.value?.id === null) {
      this.selectedAgent = null;
      this.listingForm.get('agent')?.setValue(null);
    } else {
      this.selectedAgent =  0.001;
    }
  }

  onHandleClose() {
    this.selectedAgent =  0.001;
  }


}
