import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {AgentProps, CitiesProps, FilterService, RegionProps} from "../shared/filter.service";
import {AgentsService, GeographicalInformationService} from "../apimodels";

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.css'
})


export class ListingComponent implements OnInit {
  types: string[] = ['იყიდება', 'ქირავდება'];

  listingForm!: FormGroup;

  // for dropdowns
  regions: RegionProps[] = [];
  allCities: CitiesProps[] = [];
  chosenCity: CitiesProps[] = [];
  agents: AgentProps[] = [];
  selectedAgent: any;

  imgURL: string | any | null = null;  // To store the image URL for preview
  errorMessage: string = '';  // To store error messages if file is too large


  constructor(private filterService: FilterService, private agentService: AgentsService, private geographicalInformationService: GeographicalInformationService) {
  }

  ngOnInit() {

    this.fetchData();
    this.initForm();
  }

  initForm() {
    this.listingForm = new FormGroup({
      "location": new FormGroup({
        'address': new FormControl(null, [Validators.required]),
        'zip': new FormControl(null, [Validators.required]),
        'region': new FormControl(null, [Validators.required]),
        'city': new FormControl(null, [Validators.required]),
      }),
      "details": new FormGroup({
        'price': new FormControl(null, [Validators.required]),
        'area': new FormControl(null, [Validators.required]),
        'bedroom': new FormControl(null, [Validators.required]),
        'description': new FormControl(null, [Validators.required]),
        'photo': new FormControl(null, [Validators.required]),
      }),
      'types': new FormControl('იყიდება'),
      'agent': new FormControl(null, [Validators.required]),
    });
  }

  fetchData() {
    // get Regions
    this.geographicalInformationService.regionsGet().subscribe(regions => {
      console.log(regions)
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
    console.log(this.listingForm)
  }

  changeCities() {
    const currentRegionId: number = this.listingForm.get('location.region')?.value?.id;
    this.chosenCity = this.allCities.filter((item: CitiesProps) => item.region_id === currentRegionId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // (1 MB = 1024 1024000)
      if (file.size > 1024000) {
        this.errorMessage = 'File size exceeds 1 MB. Please select a smaller image.';
        this.imgURL = null; // Clear the previous image preview if the new file is too large
        return;
      }

      const reader = new FileReader();

      // When the file is loaded, set the imgURL to be the result for the preview
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.listingForm.get('details.photo')?.setValue(reader.result)
        this.imgURL = e.target?.result;
        this.errorMessage = '';  // Clear any previous error messages
      };

      reader.readAsDataURL(file);  // Reads the file as a data URL (base64 string)
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
      console.log('Adding another agent');
      this.selectedAgent.id = null;
    }
  }

  onHandleError() {
    this.selectedAgent.id = 9;
  }

}
