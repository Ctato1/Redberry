import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {PropertyComponent} from "./property/property.component";
import {ListingComponent} from "./listing/listing.component";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'property', component: PropertyComponent},
  {path: 'listing', component: ListingComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
