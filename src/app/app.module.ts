import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { HomeComponent } from './home/home.component';
import { PropertyComponent } from './property/property.component';
import { ListingComponent } from './listing/listing.component';
import { HeaderComponent } from './shared/header/header.component';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { AddAgentComponent } from './shared/add-agent/add-agent.component';
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PropertyComponent,
    ListingComponent,
    HeaderComponent,
    AddAgentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
