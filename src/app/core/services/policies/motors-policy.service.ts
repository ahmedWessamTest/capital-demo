import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable, tap } from 'rxjs';

export interface MotorCategory {
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
  motorinsurances: MotorInsurance[];
}

export interface MotorInsurance {
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
  motorchoices: MotorChoice[];
}

export interface MotorChoice {
  id: number;
  category_id: number;
  motor_insurance_id: number;
  en_title: string;
  ar_title: string;
  en_description: string;
  ar_description: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface CarType {
  id: number;
  en_title: string;
  ar_title: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface CarBrand {
  id: number;
  car_type_id: number;
  en_title: string;
  ar_title: string;
  active_status: string;
  created_at: string;
  updated_at: string;
  car_models: CarModel[];
}

export interface CarModel {
  id: number;
  car_brand_id: number;
  en_title: string;
  ar_title: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface MotorPolicyData {
  category_id: string;
  user_id: string;
  motor_insurance_id: string;
  name: string;
  email: string;
  phone: string;
  active_status: string;
  // Optional fields that might be needed
  car_type_id?: string;
  car_brand_id?: string;
  car_model_id?: string;
  car_year?: string;
  motor_choice_id?: string;
  car_year_id?: string;
  car_brand?: string;
  car_model?: string;
  payment_method: string

  car_type?: string;
  car_price?: string | number;
}

export interface MotorDataResponse {
  category: MotorCategory;
  types: CarType[];
  brands: CarBrand[];
  years: number[];
}

@Injectable({
  providedIn: 'root'
})
export class MotorInsuranceService {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;

  // Signals for state management
  private motorData = signal<MotorDataResponse | null>(null);
  public motorData$ = this.motorData.asReadonly();

  // Methods to organize the data for easier access
  getYears(): number[] {
    return this.motorData()?.years || [];
  }

  getTypes(): CarType[] {
    return this.motorData()?.types || [];
  }

  getBrands(): CarBrand[] {
    return this.motorData()?.brands || [];
  }

  getModelsByBrand(brandId: number): CarModel[] {
    const brand = this.getBrands().find(b => b.id === brandId);
    return brand?.car_models || [];
  }

  getInsurances(): MotorInsurance[] {
    return this.motorData()?.category.motorinsurances || [];
  }

  getActiveInsurances(): MotorInsurance[] {
    return this.getInsurances().filter(insurance => insurance.active_status === '1');
  }

  getChoicesByInsurance(insuranceId: number): MotorChoice[] {
    const insurance = this.getInsurances().find(i => i.id === insuranceId);
    return insurance?.motorchoices.filter(choice => choice.active_status === '1') || [];
  }

  // API call to fetch motor data
  fetchMotorData(): Observable<MotorDataResponse> {
    // Add the type parameter as a query parameter
    const params = { type: 'motor' };
    
    return this._http.get<MotorDataResponse>(
      `${this.baseUrl}app-policies/policies-content/2`,
      { params }  // Angular will automatically convert this to ?type=motor
    ).pipe(
      tap(data => {
        this.motorData.set(data);
      })
    );
  }

  // API call to submit motor policy
  submitMotorPolicy(policyData: MotorPolicyData): Observable<any> {
    // const formData = new FormData();
    
    // // Required fields
    // formData.append('category_id', policyData.category_id.toString());
    // formData.append('user_id', policyData.user_id.toString());
    // formData.append('motor_insurance_id', policyData.motor_insurance_id.toString());
    // formData.append('name', policyData.name);
    // formData.append('email', policyData.email);
    // formData.append('phone', policyData.phone);
    // formData.append('active_status', policyData.active_status);
    
    // // Optional fields
    // if (policyData.car_type_id) {
    //   formData.append('car_type_id', policyData.car_type_id.toString());
    // }
    // if (policyData.car_brand_id) {
    //   formData.append('car_brand_id', policyData.car_brand_id.toString());
    // }
    // if (policyData.car_model_id) {
    //   formData.append('car_model_id', policyData.car_model_id.toString());
    // }
    // if (policyData.car_year) {
    //   formData.append('car_year', policyData.car_year.toString());
    // }
    // if (policyData.car_brand) {
    //   formData.append('car_brand', policyData.car_brand.toString());
    // }
    // if (policyData.car_model) {
    //   formData.append('car_model', policyData.car_model.toString());
    // }
    // if (policyData.car_type) {
    //   formData.append('car_type', policyData.car_type.toString());
    // }
    // if (policyData.motor_choice_id) {
    //   formData.append('motor_choice_id', policyData.motor_choice_id.toString());
    // }

    return this._http.post(`${this.baseUrl}app-policies/policies-motor-store`, policyData);
  }
  createMotorLead(formData: FormData): Observable<any> {
    // Set default category_id to 2 if not provided
    if (!formData.has('category_id')) {
      formData.append('category_id', '2');
    }
    
    return this._http.post(`${this.baseUrl}app-leads/motor-lead`, formData);
  }

  /**
   * Update an existing motor lead
   * @param leadId ID of the lead to update
   * @param formData FormData containing updated lead information
   * @returns Observable with the API response
   */
  updateMotorLead(leadId: number, formData: FormData): Observable<any> {
    return this._http.post(`${this.baseUrl}app-leads/motor-update/${leadId}`, formData);
  }

  createMotorClaim(formData: FormData): Observable<any>{
    return this._http.post(`${this.baseUrl}app-claims/claim-motor-store`,formData)
  }
}