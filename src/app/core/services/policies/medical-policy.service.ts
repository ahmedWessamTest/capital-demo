import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable, tap } from 'rxjs';

export interface MedicalCategory {
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
  medicalinsurances: MedicalInsurance[];
}

export interface MedicalInsurance {
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
  medicalchoices: MedicalChoice[];
}

export interface MedicalChoice {
  id: number;
  category_id: number;
  medical_insurance_id: number;
  en_title: string;
  ar_title: string;
  en_description: string;
  ar_description: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalPolicyData {
  category_id: string;
  user_id: string;
  medical_insurance_id: string;
  name: string;
  email: string;
  phone: string;
  active_status: string;
  // Optional fields
  birthdate?: string;
  gender?: string;
  national_id?: string;
  address?: string;
  payment_method: string;
}
export interface MedicalPolicyCorporateData {
  category_id: string;
  user_id: string;
  medical_insurance_id: string;
  name: string;
  email: string;
  phone: string;
  active_status: string;
  company_name: string,
  company_employee_number: number,
  company_address: string,
  company_employee_avg: number,
  lead_type: 'corporate',
  request_type: 'corporate',
  // Optional fields
  national_id?: string;
  address?: string;
  payment_method: string;
}

export interface MedicalDataResponse {
  category: MedicalCategory;
  types: any; // According to your response, types is null in this case
}

@Injectable({
  providedIn: 'root'
})
export class MedicalInsuranceService {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;

  // Signals for state management
  private medicalData = signal<MedicalDataResponse | null>(null);
  public medicalData$ = this.medicalData.asReadonly();

  // Methods to organize the data for easier access
  getInsurances(): MedicalInsurance[] {
    return this.medicalData()?.category.medicalinsurances || [];
  }

  getActiveInsurances(): MedicalInsurance[] {
    return this.getInsurances().filter(insurance => insurance.active_status === '1');
  }

  getChoicesByInsurance(insuranceId: number): MedicalChoice[] {
    const insurance = this.getInsurances().find(i => i.id === insuranceId);
    return insurance?.medicalchoices.filter(choice => choice.active_status === '1') || [];
  }

  // API call to fetch medical data
  fetchMedicalData(empNum?: any): Observable<MedicalDataResponse> {
    // Add the type parameter as a query parameter
    let params;
    if (empNum) {
      params = { type: 'medical', employee_number: empNum };
    } else {
      params = { type: 'medical' };
    }

    return this._http.get<MedicalDataResponse>(
      `${this.baseUrl}app-policies/policies-content/1`,
      { params }
    ).pipe(
      tap(data => {
        this.medicalData.set(data);
      })
    );
  }

  // API call to submit medical policy
  submitMedicalPolicy(policyData: MedicalPolicyData): Observable<any> {
    return this._http.post(`${this.baseUrl}app-policies/policies-medical-store`, policyData);
  }

  // API call to create a medical lead
  createMedicalLead(formData: FormData): Observable<any> {
    // Set default category_id to 1 if not provided
    if (!formData.has('category_id')) {
      formData.append('category_id', '1');
    }

    return this._http.post(`${this.baseUrl}app-leads/medical-lead`, formData);
  }

  // API call to update a medical lead
  updateMedicalLead(leadId: number, formData: FormData): Observable<any> {
    return this._http.post(`${this.baseUrl}app-leads/medical-update/${leadId}`, formData);
  }
  createMedicalClaim(formData: FormData): Observable<any> {
    return this._http.post(`${this.baseUrl}app-claims/claim-medical-store`, formData)
  }
}
