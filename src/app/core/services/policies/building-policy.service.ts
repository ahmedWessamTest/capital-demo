import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable, tap } from 'rxjs';

export interface BuildingCategory {
  id: number;
  en_title: string;
  ar_title: string;
  en_slug: string;
  ar_slug: string;
  en_small_description: string;
  ar_small_description: string;
  en_main_description: string;
  ar_main_description: string;
  network_link: string;
  counter_number: number;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_description: string;
  ar_meta_description: string;
  active_status: string;
  created_at: string;
  updated_at: string;
  buildinginsurances: BuildingInsurance[];
}

export interface BuildingInsurance {
  id: number;
  category_id: number;
  en_title: string;
  ar_title: string;
  year_money: string;
  month_money: string;
  company_name: string;
  active_status: string;
  created_at: string;
  updated_at: string;
  buildingchoices: BuildingChoice[];
}

export interface BuildingChoice {
  id: number;
  category_id: number;
  building_insurance_id: number;
  en_title: string;
  ar_title: string;
  en_description: string;
  ar_description: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface BuildType {
  id: number;
  en_title: string;
  ar_title: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  build_type_id: number;
  en_title: string;
  ar_title: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface BuildingPolicyData {
  category_id: string;
  user_id: string;
  building_insurance_id: string;
  name: string;
  email: string;
  phone: string;
  active_status: string;
  // Optional fields
  building_type_id?: string;
  building_country_id?: string;
  building_area?: string;
  building_age?: string;
  building_price?: string;
  building_type?: string;
  building_country?: string;
  payment_method: string;
}
export interface BuildingCorporatePolicyData {
  category_id: string;
  user_id: string;
  building_insurance_id: string;
  name: string;
  email: string;
  phone: string;
  active_status: string;
  // Optional fields
  building_type_id?: string;
  building_country_id?: string;
  building_area?: string;
  building_age?: string;
  building_price?: string;
  building_type?: string;
  building_country?: string;
  payment_method: string;
  company_name:string;
  company_address:string;
  company_building_number:number
  company_building_total_money:number,
  lead_type: 'corporate' | null,
  request_type: 'corporate' | null,
}
export interface BuildingDataResponse {
  category: BuildingCategory;
  types: BuildType[];
  countries: Country[];
}

@Injectable({
  providedIn: 'root'
})
export class BuildingInsuranceService {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;

  // Signals for state management
  private buildingData = signal<BuildingDataResponse | null>(null);
  public buildingData$ = this.buildingData.asReadonly();

  // Methods to organize the data for easier access
  getTypes(): BuildType[] {
    return this.buildingData()?.types || [];
  }

  getCountries(): Country[] {
    return this.buildingData()?.countries || [];
  }

  getCountriesByType(typeId: number): Country[] {
    return this.getCountries().filter(country => country.build_type_id === typeId);
  }

  getInsurances(): BuildingInsurance[] {
    return this.buildingData()?.category.buildinginsurances || [];
  }

  getActiveInsurances(): BuildingInsurance[] {
    return this.getInsurances().filter(insurance => insurance.active_status === '1');
  }

  getChoicesByInsurance(insuranceId: number): BuildingChoice[] {
    const insurance = this.getInsurances().find(i => i.id === insuranceId);
    return insurance?.buildingchoices.filter(choice => choice.active_status === '1') || [];
  }

  // API call to fetch building data
  fetchBuildingData(): Observable<BuildingDataResponse> {
    // Add the type parameter as a query parameter
    const params = { type: 'building' };
    
    return this._http.get<BuildingDataResponse>(
      `${this.baseUrl}app-policies/policies-content/3`,
      { params }
    ).pipe(
      tap(data => {
        this.buildingData.set(data);
      })
    );
  }

  // API call to submit building policy
  submitBuildingPolicy(policyData: BuildingPolicyData): Observable<any> {
    return this._http.post(`${this.baseUrl}app-policies/policies-building-store`, policyData);
  }

  // API call to create a building lead
  createBuildingLead(formData: FormData): Observable<any> {
    // Set default category_id to 3 if not provided
    if (!formData.has('category_id')) {
      formData.append('category_id', '3');
    }
    
    return this._http.post(`${this.baseUrl}app-leads/building-lead`, formData);
  }

  // API call to update a building lead
  updateBuildingLead(leadId: number, formData: FormData): Observable<any> {
    return this._http.post(`${this.baseUrl}app-leads/building-update/${leadId}`, formData);
  }
  createBuildingClaim(formData: FormData): Observable<any>{
    return this._http.post(`${this.baseUrl}app-claims/claim-building-store`,formData)
  }
}