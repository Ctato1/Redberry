export * from './agents.service';
import { AgentsService } from './agents.service';
export * from './geographicalInformation.service';
import { GeographicalInformationService } from './geographicalInformation.service';
export * from './realEstates.service';
import { RealEstatesService } from './realEstates.service';
export const APIS = [AgentsService, GeographicalInformationService, RealEstatesService];
