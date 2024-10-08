import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AgentProps, CitiesProps, RegionProps} from "../shared/filter.service";
import {AgentsService, GeographicalInformationService, RealEstatesService} from "../apimodels";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.css',
  encapsulation: ViewEncapsulation.Emulated
})

export class ListingComponent implements OnInit {
  types = [{name: 'იყიდება', value: false}, {name: 'ქირავდება', value: true}]; // Listing types
  listingForm!: FormGroup; // Main form group
  loading:boolean = false;

  // Dropdown data
  regions: RegionProps[] = [];
  allCities: CitiesProps[] = [];
  chosenCity: CitiesProps[] = [];
  agents: AgentProps[] = [];
  selectedAgent: number | null = 0.001; // Default agent

  imgURL: string | null = null; // Image preview URL
  errorMessage: string = ''; // Error message for file upload

  constructor(
    private realEstatesService: RealEstatesService,
    private messageService: MessageService,
    private agentService: AgentsService,
    private geographicalInformationService: GeographicalInformationService
  ) {
  }

  ngOnInit() {
    this.initForm(); // Initialize form structure
    this.fetchData(); // Fetch dropdown data (regions, cities, agents)
    this.listingForm.valueChanges.subscribe(() => this.saveFormData()); // Save form data on value change
  }

  // Initialize the form with fields and validators
  initForm() {
    this.listingForm = new FormGroup({
      "location": new FormGroup({
        'address': new FormControl(null, [Validators.required, Validators.minLength(2)]),
        'zip': new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'region': new FormControl(null, [Validators.required]),
        'city': new FormControl(null, [Validators.required]),
      }),
      "details": new FormGroup({
        'price': new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'area': new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'bedroom': new FormControl(null, [Validators.required, Validators.pattern("^[0-9]*$")]),
        'description': new FormControl(null, [Validators.required, this.correctDescription.bind(this)]),
        'photo': new FormControl(null, [Validators.required]),
      }),
      'types': new FormControl(this.types[0]), // Default type
      'agent': new FormControl(null, [Validators.required]),
    });
  }

  // Method to reset the form
  onReset() {
    this.listingForm.reset({
      location: {
        address: null,
        zip: null,
        region: null,
        city: null,
      },
      details: {
        price: null,
        area: null,
        bedroom: null,
        description: null,
        photo: null,
      },
      types: this.types[0],
      agent: null,
    });
    this.clearSelectedFile();
  }

  correctDescription(control: FormControl): { [s: string]: boolean } | null {
    if (!control.value) {
      // If control value is null or undefined, return no error
      return null;
    }

    if (control.value.split(' ').length < 5) {
      return {'wrongWords': true};
    }

    return null;
  }

  // Fetch data for dropdowns (regions, cities, agents)
  fetchData() {
    this.geographicalInformationService.regionsGet().subscribe((regions) => {
      this.regions = regions;
      this.tryPatchForm(); // Check and patch form after regions are fetched
    });

    this.geographicalInformationService.citiesGet().subscribe((cities) => {
      this.allCities = cities;
      this.tryPatchForm(); // Check and patch form after cities are fetched
    });

    this.fetchAgents();
  }

  fetchAgents() {
    this.agentService.agentsGet().subscribe((agents) => {
      this.agents = [{name: 'დაამატე აგენტი', id: null}, ...agents]; // Add 'Add Agent' option
      this.tryPatchForm(); // Check and patch form after agents are fetched
    });
  }

  // Attempt to patch the form only when all necessary data is available
  tryPatchForm() {
    if (this.regions.length > 0 && this.allCities.length > 0 && this.agents.length > 0) {
      this.loadFormData(); // Load form data from localStorage after fetching all dropdown data
    }
  }

  // Load saved form data from localStorage and patch the form
  loadFormData() {
    const savedData: string | null = localStorage.getItem('listingFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);

      // Check if the saved region exists in the current fetched regions and set it
      if (parsedData.location?.region) {
        const region: RegionProps | undefined = this.regions.find((reg) => reg.id === parsedData.location.region.id);
        if (region) {
          this.listingForm.get('location.region')?.setValue(region);
          this.changeCities(); // Update city options based on the selected region
        }
      }

      // Check if the saved city exists in the current fetched cities and set it
      if (parsedData.location?.city) {
        const city: CitiesProps | undefined = this.allCities.find((c) => c.id === parsedData.location.city.id);
        if (city) {
          this.listingForm.get('location.city')?.setValue(city);
        }
      }

      // check if the saved type exists in the types array and set it
      if (parsedData.types) {
        const type: {
          name: string,
          value: boolean
        } | undefined = this.types.find((t) => t.value === parsedData.types.value);
        if (type) {
          this.listingForm.get('types')?.setValue(type);
        }
      }

      // Patch the rest of the form data
      this.listingForm.patchValue(parsedData);
    }
  }

  // Save the form data to localStorage
  saveFormData() {
    localStorage.setItem('listingFormData', JSON.stringify(this.listingForm.value));
  }

  // Submit form and send data to the server
  onSubmit() {
    if (!this.listingForm.valid) return;
    this.loading = true;

    const formData = this.listingForm.value;

    // Check if image is a valid file type
    const image = formData.details.photo;
    if (!(image instanceof Blob || image instanceof File)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: "Invalid image type. Please select a valid file.",
        styleClass: 'my-custom-error',
        life: 3000
      });
      this.loading = false;

      return;
    }

    // Ensure required fields are filled before submitting
    const {address, zip, region, city} = formData.location;
    const {price, area, bedroom, description} = formData.details;
    const agent = formData.agent;

    if (!address || !region?.id || !city?.id || !price || !area || !bedroom || !description || !agent?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all the required fields.',
        styleClass: 'my-custom-error',
        life: 3000
      });
      this.loading = false;
      return;
    }

    // Submit the data to the real estate service
    this.realEstatesService.postEstates(
      address, image, region.id, description, city.id, zip, price, area, bedroom, formData.types, agent.id
    ).subscribe(
      (event) => {
        if (event.type === 4) { // Handle final response event
          this.messageService.add({
            severity: 'success', summary: 'Success', detail: 'Real estate posted successfully',
            styleClass: 'my-custom-success',
            life: 3000
          });
          this.loading = false;
          this.onReset();
        }
      },
      (err) => {
        if (err?.error?.message) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message,
            styleClass: 'my-custom-error',
            life: 3000
          });
          this.loading = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: "Something went wrong, Check Input Fields",
            styleClass: 'my-custom-error',
            life: 3000
          });
          this.loading = false;
        }


      }
    );
  }

  // Update city options based on the selected region
  changeCities() {
    const currentRegionId = this.listingForm.get('location.region')?.value?.id;
    this.chosenCity = this.allCities.filter((item) => item.region_id === currentRegionId);
  }

  // Handle file selection for image upload and preview
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
      this.listingForm.get('details.photo')?.setValue(file);
      this.errorMessage = ''; // Clear previous errors
    }
  }

  // Clear the selected file from the form and preview
  clearSelectedFile(): void {
    this.imgURL = null;
    this.listingForm.get('details.photo')?.setValue(null);
    const fileInput = document.getElementById('imgInp') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear file input value
    }
  }

  // Handle agent change
  onAgentChange(event: any) {
    this.selectedAgent = event.value;
    if (this.listingForm.get('agent')?.value?.id === null) {
      this.selectedAgent = null;
      this.listingForm.get('agent')?.setValue(null);
    } else {
      this.selectedAgent = 0.001;
    }
  }

  // Close the agent modal
  onHandleClose() {
    this.selectedAgent = 0.001;
    this.fetchAgents();
  }
}
